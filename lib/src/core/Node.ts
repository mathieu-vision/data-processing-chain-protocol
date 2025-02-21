import {
  DataType,
  ChainStatus,
  PipelineData,
  ProcessorPipeline,
  NodeType,
  NodeSignal,
  NodeConfig,
  ChainType,
  PipelineMeta,
  ReportingSignalType,
  Notification,
} from '../types/types';
import { setImmediate } from 'timers';
import { randomUUID } from 'node:crypto';
import { Logger } from '../utils/Logger';
import { NodeSupervisor } from './NodeSupervisor';
import { MonitoringAgent, ReportingAgent } from '../agents/MonitoringAgent';
import { NodeStatusManager } from './NodeStatusManager';

/**
 * Represents a single executable node within a chain
 */
export class Node {
  private id: string;
  private pipelines: ProcessorPipeline[];
  private dependencies: string[]; // Todo
  private status: ChainStatus.Type;
  private error?: Error;
  // private delay: number;
  private progress: number;
  private dataType: DataType.Type;
  private executionQueue: Promise<void>;
  private output: PipelineData[];
  private nextNodeInfo: {
    id: string;
    type: NodeType.Type;
    meta?: PipelineMeta;
  } | null;
  private config: NodeConfig | null;
  private reporting: ReportingAgent | null = null;
  private statusManager: NodeStatusManager;

  /**
   * Creates a new Node instance
   * @param {string[]} dependencies - Array of node dependency IDs
   */
  constructor(dependencies: string[] = []) {
    this.id = randomUUID();
    this.output = [];
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = ChainStatus.NODE_PENDING;
    // this.delay = 0;
    this.progress = 0;
    this.dataType = DataType.RAW;
    this.executionQueue = Promise.resolve();
    this.nextNodeInfo = null;
    this.config = null;
    this.statusManager = new NodeStatusManager(this);
  }

  /**
   * Updates the execution progress based on pipeline count
   * @private
   */
  private updateProgress(): void {
    this.progress += 1 / this.pipelines.length;
  }

  /**
   * Configures the node and sets up monitoring if index is provided
   * @param {NodeConfig} config - Configuration containing services, chainId, index and other options
   */
  setConfig(config: NodeConfig): void {
    const { chainId, index, count } = config;
    if (index !== undefined && count !== undefined) {
      const monitoring = MonitoringAgent.retrieveService();
      this.reporting = monitoring.genReportingAgent({
        chainId,
        nodeId: this.id,
        index,
        count,
      });
    } else {
      Logger.warn('Node index is not defined, configuration failed');
    }
    this.config = config;
    if (config.signalQueue) {
      Logger.info(`Node ${this.id} enqueuing signals...`);
      Logger.debug(`${config.signalQueue}`);
      this.statusManager.enqueueSignals(config.signalQueue);
    }
  }

  enqueueSignals(statusQueue: NodeSignal.Type[]): void {
    this.statusManager.enqueueSignals(statusQueue);
  }

  /**
   * Gets the node's current execution queue promise
   * @returns {Promise<void>} Current execution queue
   */
  getExecutionQueue(): Promise<void> {
    return this.executionQueue;
  }

  /**
   * Gets the node's configuration
   * @returns {NodeConfig | null} Node configuration if set
   */
  getConfig(): NodeConfig | null {
    return this.config;
  }

  /**
   * Gets the node's unique identifier
   * @returns {string} UUID of the node
   */
  getId(): string {
    return this.id;
  }

  /**
   * Adds a processor pipeline to the node
   * @param {ProcessorPipeline} pipeline - Array of PipelineProcessor instances
   */
  addPipeline(pipeline: ProcessorPipeline): void {
    this.pipelines.push(pipeline);
  }

  /**
   * Digest the data through successive processing stages
   * @param {ProcessorPipeline} pipeline - Array of processors to execute
   * @param {PipelineData} data - Data to process
   * @returns {Promise<PipelineData>} Processed data
   * @private
   */
  private async processPipeline(
    pipeline: ProcessorPipeline,
    data: PipelineData,
  ): Promise<PipelineData> {
    let result = data;
    for (const processor of pipeline) {
      result = await processor.digest(result);
    }
    return result;
  }

  private *getPipelineGenerator(
    pipelines: ProcessorPipeline[],
    count: number,
  ): Generator<ProcessorPipeline[], void, unknown> {
    for (let i = 0; i < pipelines.length; i += count) {
      yield pipelines.slice(i, i + count);
    }
  }

  /**
   * Notifies about node status changes through the reporting agent
   * @param {ChainStatus.Type} notify - Node status to report
   */
  notify(
    notification: ChainStatus.Type | Notification,
    type: ReportingSignalType = 'local-signal',
  ): void {
    try {
      if (this.reporting !== null) {
        if (typeof notification === 'object' && 'status' in notification) {
          this.reporting.notify(notification, type);
        } else {
          this.reporting.notify({ status: notification }, type);
        }
      } else {
        throw new Error('Reporter not set');
      }
    } catch (error) {
      Logger.error((error as Error).message);
    }
  }

  private async processChildChain(data: PipelineData): Promise<void> {
    const childConfig = this.config?.chainConfig;

    if (childConfig && Array.isArray(childConfig) && childConfig.length > 0) {
      childConfig[0].rootConfig = this.config
        ? JSON.parse(JSON.stringify(this.config))
        : undefined;
      const supervisor = NodeSupervisor.retrieveService();
      const chainId = await supervisor.handleRequest({
        signal: NodeSignal.CHAIN_DEPLOY,
        config: childConfig,
        data,
      });

      if (!chainId) {
        throw new Error('Failed to deploy chain: no chainId returned');
      }
    }
  }

  /**
   * Executes node processing on input data
   * @param {PipelineData} data - Data to process
   * @returns {Promise<void>}
   */
  async execute(data: PipelineData): Promise<void> {
    const childMode =
      this.config?.rootConfig?.childMode === 'parallel'
        ? 'in parallel'
        : 'in serial';
    const suspendedState = this.statusManager.getSuspendedState();
    const isResuming = !!suspendedState;

    Logger.info(
      `Node ${this.id} execution ${isResuming ? 'resumed' : 'started'} ${childMode}...`,
    );

    this.executionQueue = this.executionQueue.then(async () => {
      try {
        this.updateStatus(ChainStatus.NODE_IN_PROGRESS);
        let generator: Generator<ProcessorPipeline[], void, unknown>;
        let processingData = data;

        if (isResuming && suspendedState) {
          generator = suspendedState.generator as Generator<
            ProcessorPipeline[],
            void,
            unknown
          >;
          processingData = suspendedState.data;
          await this.processBatch(suspendedState.currentBatch, processingData);
        } else {
          generator = this.getPipelineGenerator(this.pipelines, 3);
        }

        let nextResult = isResuming ? generator.next() : generator.next();

        while (!nextResult.done) {
          const status = await this.statusManager.process();
          if (status.includes(ChainStatus.NODE_SUSPENDED)) {
            this.statusManager.suspendExecution(
              generator,
              nextResult.value,
              processingData,
            );
            return;
          }

          await this.processBatch(nextResult.value, processingData);
          nextResult = generator.next();
        }

        this.statusManager.clearSuspendedState();
        this.updateStatus(ChainStatus.NODE_COMPLETED);

        if (this.config?.chainConfig) {
          Logger.info(`child chain found in node: ${this.id}`);
          await this.processChildChain(processingData);
        }
      } catch (error) {
        if (!this.statusManager.isSuspended()) {
          this.statusManager.clearSuspendedState();
          this.updateStatus(ChainStatus.NODE_FAILED, error as Error);
          Logger.error(`Node ${this.id} execution failed: ${error}`);
        }
      }
    });

    const supervisor = NodeSupervisor.retrieveService();
    await supervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: this.id,
    });
  }

  private async processBatch(
    pipelineBatch: ProcessorPipeline[],
    data: PipelineData,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      setImmediate(async () => {
        try {
          const batchPromises = pipelineBatch.map((pipeline) =>
            this.processPipeline(pipeline, data).then(
              (pipelineData: PipelineData) => {
                this.output.push(pipelineData);
                this.updateProgress();
              },
            ),
          );
          await Promise.all(batchPromises);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Sends processed data to the next node after execution completion
   * @returns {Promise<void>}
   */
  async sendData(): Promise<void> {
    // make sure the queue has finished
    await this.executionQueue;
    Logger.info(`Sending data from node ${this.id}.`);
    await Node.terminate(this.id, this.output);
  }

  /**
   * Terminates node execution and handles final data
   * @param {string} nodeId - Node identifier
   * @param {PipelineData[]} pipelineData - Array of processed data
   * @private
   * @static
   */
  private static async terminate(nodeId: string, pipelineData: PipelineData[]) {
    Logger.special(`Terminate: Node ${nodeId} execution completed.`);
    const data = pipelineData[0];
    await Node.moveToNextNode(nodeId, data);
  }

  // todo: should not be static
  /**
   * Routes data to next node based on NodeType (LOCAL/REMOTE)
   * @param {string} nodeId - Current node identifier
   * @param {PipelineData} pipelineData - Data to pass forward
   * @private
   * @static
   */
  private static async moveToNextNode(
    nodeId: string,
    pipelineData: PipelineData,
  ) {
    const supervisor = NodeSupervisor.retrieveService();
    const nodes = supervisor.getNodes();
    const currentNode = nodes.get(nodeId);
    const chainId = currentNode?.getConfig()?.chainId;
    if (!currentNode) {
      Logger.warn(`Node ${nodeId} not found for moving to next node.`);
      return;
    }
    const nextNodeInfo = currentNode.getNextNodeInfo();
    if (nextNodeInfo) {
      if (nextNodeInfo.type === NodeType.LOCAL) {
        await supervisor.handleRequest({
          signal: NodeSignal.NODE_RUN,
          id: nextNodeInfo.id,
          data: pipelineData,
        });
      } else if (nextNodeInfo.type === NodeType.REMOTE) {
        supervisor.remoteServiceCallback({
          // targetId and meta are related to the next remote target service uid
          chainId,
          targetId: nextNodeInfo.id,
          data: pipelineData,
          meta: nextNodeInfo.meta,
        });
      }
    } else {
      Logger.special(
        `End of pipeline reached by node ${nodeId} in chain ${chainId}.`,
      );
      currentNode.notify(ChainStatus.NODE_END_OF_PIPELINE, 'global-signal');
    }
    const isPersistant =
      (currentNode.config?.chainType ?? 0) & ChainType.PERSISTANT;
    if (!isPersistant) {
      const autoDelete =
        (currentNode.config?.chainType ?? 0) & ChainType.AUTO_DELETE;
      if (autoDelete) {
        await supervisor.handleRequest({
          id: nodeId,
          signal: NodeSignal.NODE_DELETE,
        });
      } else {
        currentNode.notify(ChainStatus.NODE_PENDING_DELETION, 'global-signal');
      }
    } else {
      Logger.warn(`Node ${nodeId} kept for future calls.`);
    }
  }

  /**
   * Gets execution progress value
   * @returns {number} Progress between 0 and 1
   */
  getProgress(): number {
    return this.progress;
  }

  /**
   * Checks if node dependencies are satisfied
   * @param {Set<string>} executedNodes - Set of completed node IDs
   * @returns {boolean} Whether node can execute
   */
  canExecute(executedNodes: Set<string>): boolean {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }

  /**
   * Sets execution delay in milliseconds
   * @param {number} delay - Delay amount
   */
  // setDelay(delay: number): void {
  //   this.delay = delay;
  // }

  /**
   * Gets current data type (RAW/COMPRESSED)
   * @returns {DataType.Type} Current data type
   */
  getDataType(): DataType.Type {
    return this.dataType;
  }

  /**
   * Gets current node status
   * @returns {ChainStatus.Type} Current chain status
   */
  getStatus(): ChainStatus.Type {
    return this.status;
  }

  /**
   * Gets node dependency IDs
   * @returns {string[]} Array of dependency node IDs
   */
  getDependencies(): string[] {
    return this.dependencies;
  }

  /**
   * Updates node status and handles error reporting
   * @param {ChainStatus.Type} status - New status to set
   * @param {Error} [error] - Optional error if status is NODE_FAILED
   */
  updateStatus(status: ChainStatus.Type, error?: Error): void {
    this.status = status;
    if (status === ChainStatus.NODE_FAILED) {
      this.error = error;
    }
    if (this.reporting) {
      this.reporting.notify({ status });
    }
  }

  /**
   * Gets last error if node failed
   * @returns {Error|undefined} Error object if failed
   */
  getError(): Error | undefined {
    return this.error;
  }

  /**
   * Gets all processor pipelines
   * @returns {ProcessorPipeline[]} Array of processor pipelines
   */
  getProcessors(): ProcessorPipeline[] {
    return this.pipelines;
  }

  /**
   * Sets next node routing information
   * @param {string} id - Next node ID
   * @param {NodeType.Type} type - Next node type (LOCAL/REMOTE)
   * @param {PipelineMeta} [meta] - Optional pipeline metadata for next node
   */
  setNextNodeInfo(id: string, type: NodeType.Type, meta?: PipelineMeta): void {
    this.nextNodeInfo = { id, type, meta };
  }

  /**
   * Gets next node routing information
   * @returns {{ id: string, type: NodeType.Type, meta?: PipelineMeta } | null} Next node info or null
   */
  getNextNodeInfo(): {
    id: string;
    type: NodeType.Type;
    meta?: PipelineMeta;
  } | null {
    return this.nextNodeInfo;
  }
}
