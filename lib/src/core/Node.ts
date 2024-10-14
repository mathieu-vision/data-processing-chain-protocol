import {
  DataType,
  NodeStatus,
  PipelineData,
  ProcessorPipeline,
  NodeType,
  NodeSignal,
  ChainConfig,
  NodeConfig,
} from '../types/types';
import { setTimeout, setImmediate } from 'timers';
import { randomUUID } from 'node:crypto';
import { Logger } from '../libs/Logger';
import { NodeSupervisor } from './NodeSupervisor';

export class Node {
  private id: string;
  private pipelines: ProcessorPipeline[];
  // Todo:
  private dependencies: string[];
  private status: NodeStatus.Type;
  private error?: Error;
  private delay: number;
  private progress: number;
  private dataType: DataType.Type;
  private executionQueue: Promise<void>;
  private output: PipelineData[];
  private nextNodeInfo: { id: string; type: NodeType.Location } | null;
  private config: NodeConfig | null;

  constructor(dependencies: string[] = []) {
    this.id = randomUUID();
    this.output = [];
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
    this.delay = 0;
    this.progress = 0;
    this.dataType = DataType.RAW;
    this.executionQueue = Promise.resolve();
    this.nextNodeInfo = null;
    this.config = null;
  }

  private updateProgress(): void {
    this.progress += 1 / this.pipelines.length;
  }

  setConfig(config: NodeConfig): void {
    this.config = config;
  }

  getExecutionQueue(): Promise<void> {
    return this.executionQueue;
  }
  getConfig(): NodeConfig | null {
    return this.config;
  }

  getId(): string {
    return this.id;
  }

  addPipeline(pipeline: ProcessorPipeline): void {
    this.pipelines.push(pipeline);
  }

  // digest the data through successive processing stages
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

  async execute(data: PipelineData): Promise<void> {
    this.executionQueue = this.executionQueue.then(async () => {
      try {
        this.updateStatus(NodeStatus.IN_PROGRESS);
        // todo: monitor this step
        if (this.delay > 0) {
          await this.sleep(this.delay);
        }

        const generator = this.getPipelineGenerator(this.pipelines, 3);

        for (const pipelineBatch of generator) {
          await new Promise<void>((resolve, reject) => {
            setImmediate(async () => {
              try {
                const batchPromises = pipelineBatch.map((pipeline) =>
                  this.processPipeline(pipeline, data).then(
                    (pipelineData: PipelineData) => {
                      this.output.push(pipelineData);
                      this.updateProgress();
                      // todo: monitor this step
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

        this.updateStatus(NodeStatus.COMPLETED);
      } catch (error) {
        this.updateStatus(NodeStatus.FAILED, error as Error);
        Logger.error({
          message: `Node ${this.id} execution failed: ${error}`,
        });
      }
    });

    const supervisor = NodeSupervisor.retrieveService();
    await supervisor.handleRequest({
      id: this.id,
      signal: NodeSignal.NODE_SEND_DATA,
    });
  }

  // ...
  async sendData(): Promise<void> {
    // make sure the queue has finished
    await this.executionQueue;
    Logger.info({ message: `Sending data from node ${this.id}.` });
    await Node.terminate(this.id, this.output);
  }

  private static async terminate(nodeId: string, pipelineData: PipelineData[]) {
    // todo: format data
    const data = pipelineData[0]; // tmp
    await Node.moveToNextNode(nodeId, data);
  }

  private static async moveToNextNode(
    nodeId: string,
    pipelineData: PipelineData,
  ) {
    const supervisor = NodeSupervisor.retrieveService();
    const nodes = supervisor.getNodes();
    const currentNode = nodes.get(nodeId);

    if (!currentNode) {
      Logger.warn({
        message: `Node ${nodeId} not found for moving to next node.`,
      });
      return;
    }
    const nextNodeInfo = currentNode.getNextNodeInfo();
    if (nextNodeInfo) {
      if (nextNodeInfo.type === NodeType.LOCAL) {
        await supervisor.handleRequest({
          id: nextNodeInfo.id,
          data: pipelineData,
          signal: NodeSignal.NODE_RUN,
        });
      } else if (nextNodeInfo.type === NodeType.EXTERNAL) {
        supervisor.remoteServiceCallback({
          // nextNodeInfo.id needs to be the next remote target service uid
          targetId: nextNodeInfo.id,
          data: pipelineData,
        });
      }
    } else {
      Logger.info({ message: `End of pipeline reached by node ${nodeId}.` });
    }
    await supervisor.handleRequest({
      id: nodeId,
      signal: NodeSignal.NODE_DELETE,
    });
  }

  getProgress(): number {
    return this.progress;
  }

  canExecute(executedNodes: Set<string>): boolean {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }

  setDelay(delay: number): void {
    this.delay = delay;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getDataType(): DataType.Type {
    return this.dataType;
  }

  getStatus(): NodeStatus.Type {
    return this.status;
  }

  getDependencies(): string[] {
    return this.dependencies;
  }

  updateStatus(status: NodeStatus.Type, error?: Error): void {
    this.status = status;
    if (status === NodeStatus.FAILED) {
      this.error = error;
    }
  }
  getError(): Error | undefined {
    return this.error;
  }

  getProcessors(): ProcessorPipeline[] {
    return this.pipelines;
  }

  setNextNodeInfo(id: string, type: NodeType.Location): void {
    this.nextNodeInfo = { id, type };
  }

  getNextNodeInfo(): { id: string; type: NodeType.Location } | null {
    return this.nextNodeInfo;
  }
}
