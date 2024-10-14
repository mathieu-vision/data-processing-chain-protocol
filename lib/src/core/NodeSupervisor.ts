import { Node } from './Node';
import {
  Callback,
  NodeSignal,
  NodeStatus,
  PipelineData,
  SupervisorPayload,
  CallbackPayload,
  BrodcastMessage,
  ChainConfig,
  ChainRelation,
  NodeConfig,
  NodeType,
  SupervisorPayloadSetup,
  SupervisorPayloadCreate,
  SupervisorPayloadDelay,
  SupervisorPayloadDelete,
  SupervisorPayloadPause,
  SupervisorPayloadRun,
  SupervisorPayloadSendData,
} from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';
import { PipelineProcessor } from './PipelineProcessor';
import { randomUUID } from 'node:crypto';

export class NodeSupervisor {
  private uid: string;
  private static instance: NodeSupervisor;
  private nodes: Map<string, Node>;
  private chains: Map<string, ChainRelation>;

  private nodeMonitoring?: NodeMonitoring;
  private broadcastSetup: (_message: BrodcastMessage) => Promise<void> =
    async () => {};
  remoteServiceCallback: Callback;

  constructor() {
    this.uid = '@supervisor:default';
    this.nodes = new Map();
    this.chains = new Map();
    this.remoteServiceCallback = (_payload: CallbackPayload) => {};
  }

  setRemoteServiceCallback(callback: Callback): void {
    this.remoteServiceCallback = callback;
  }

  setMonitoring(nodeMonitoring: NodeMonitoring): void {
    this.nodeMonitoring = nodeMonitoring;
  }

  setBroadcastSetupCallback(
    broadcastSetup: (_message: BrodcastMessage) => Promise<void>,
  ): void {
    this.broadcastSetup = broadcastSetup;
  }

  setUid(uid: string) {
    this.uid = `@supervisor:${uid}`;
  }

  static retrieveService(): NodeSupervisor {
    if (!NodeSupervisor.instance) {
      const instance = new NodeSupervisor();
      NodeSupervisor.instance = instance;
    }
    return NodeSupervisor.instance;
  }

  //

  async handleRequest(payload: SupervisorPayload): Promise<void | string> {
    switch (payload.signal) {
      case NodeSignal.NODE_SETUP:
        return this.setupNode((payload as SupervisorPayloadSetup).config);
      case NodeSignal.NODE_CREATE:
        return this.createNode((payload as SupervisorPayloadCreate).params);
      case NodeSignal.NODE_DELETE:
        return this.deleteNode((payload as SupervisorPayloadDelete).id);
      case NodeSignal.NODE_PAUSE:
        return this.pauseNode((payload as SupervisorPayloadPause).id);
      case NodeSignal.NODE_DELAY:
        return this.delayNode(
          (payload as SupervisorPayloadDelay).id,
          (payload as SupervisorPayloadDelay).delay,
        );
      case NodeSignal.NODE_RUN:
        return await this.runNode(
          (payload as SupervisorPayloadRun).id,
          (payload as SupervisorPayloadRun).data,
        );
      //
      case NodeSignal.NODE_SEND_DATA:
        return await this.sendNodeData(
          (payload as SupervisorPayloadSendData).id,
        );
      //
      // Todo: add prepareChain
      // Todo: add startChain
      default:
        Logger.warn({
          message: `Unknown signal received: ${payload.signal}`,
        });
    }
  }

  private async createNode(config: NodeConfig): Promise<string> {
    const node = new Node();
    const nodeId = node.getId();
    node.setConfig(config);
    this.nodes.set(nodeId, node);
    if (this.nodeMonitoring) {
      this.nodeMonitoring.addNode(node);
    }
    Logger.info({
      message: `Node ${nodeId} created with config: ${JSON.stringify(config)}`,
    });
    return nodeId;
  }

  private async setupNode(config: NodeConfig): Promise<string> {
    const nodeId = await this.createNode(config);
    const processors = config.services.map(
      (service) => new PipelineProcessor(service),
    );
    await this.addProcessors(nodeId, processors);
    Logger.info({
      message: `Node ${nodeId} setup completed with ${processors.length} processors`,
    });
    return nodeId;
  }

  // Todo: set as private ?
  async addProcessors(
    nodeId: string,
    processors: PipelineProcessor[],
  ): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.addPipeline(processors);
      Logger.info({ message: `Processors added to Node ${nodeId}.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  private async deleteNode(nodeId: string): Promise<void> {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      if (this.nodeMonitoring) {
        this.nodeMonitoring.deleteNode(nodeId);
      }
      Logger.info({ message: `Node ${nodeId} deleted.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  private async pauseNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.updateStatus(NodeStatus.PAUSED);
      Logger.info({ message: `Node ${nodeId} paused.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  private async delayNode(nodeId: string, delay: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.setDelay(delay);
      Logger.info({ message: `Node ${nodeId} delayed by ${delay} ms.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  createChain(config: ChainConfig): string {
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${randomUUID().slice(0, 8)}`;
    const relation: ChainRelation = {
      config,
    };
    this.chains.set(chainId, relation);
    Logger.info({
      message: `Chain ${chainId} created`,
    });
    return chainId;
  }

  async prepareChainDistribution(chainId: string): Promise<void> {
    const chain = this.chains.get(chainId);
    if (!chain) {
      throw new Error(`Chain ${chainId} not found`);
    }
    const chainConfig: ChainConfig = chain.config;
    const localConfigs: NodeConfig[] = chainConfig.filter(
      (config) => config.location === 'local',
    );
    const remoteConfigs: NodeConfig[] = chainConfig.filter(
      (config) => config.location === 'remote',
    );

    if (localConfigs.length > 0) {
      const rootNodeId = await this.setupNode(localConfigs[0]);
      chain.rootNodeId = rootNodeId;

      let prevNodeId = rootNodeId;
      for (let i = 1; i < localConfigs.length; i++) {
        const currentNodeId = await this.setupNode(localConfigs[i]);
        const prevNode = this.nodes.get(prevNodeId);
        if (prevNode) {
          prevNode.setNextNodeInfo(currentNodeId, NodeType.LOCAL);
        }
        prevNodeId = currentNodeId;
      }

      // Todo: Review:
      // Tmp, set the last local node to point to the first remote service
      if (remoteConfigs.length > 0 && remoteConfigs[0].services.length > 0) {
        const lastLocalNode = this.nodes.get(prevNodeId);
        if (lastLocalNode) {
          lastLocalNode.setNextNodeInfo(
            remoteConfigs[0].services[0],
            NodeType.EXTERNAL,
          );
        }
      }
    }

    if (remoteConfigs.length > 0) {
      await this.broadcastNodeSetupSignal(chainId, remoteConfigs);
    }
  }

  async broadcastNodeSetupSignal(
    chainId: string,
    remoteConfigs: ChainConfig,
  ): Promise<void> {
    const message: BrodcastMessage = {
      signal: NodeSignal.NODE_SETUP,
      chain: {
        id: chainId,
        config: remoteConfigs,
      },
    };

    try {
      await this.broadcastSetup(message);
      Logger.info({
        message: `Node creation signal broadcasted with chainId: ${chainId} for remote configs`,
      });
    } catch (error) {
      Logger.error({
        message: `Failed to broadcast node creation signal: ${error}`,
      });
    }
  }

  async startChain(chainId: string, data: PipelineData): Promise<void> {
    const chain = this.chains.get(chainId);
    if (!chain) {
      Logger.warn({ message: `Chain ${chainId} not found.` });
      return;
    }
    const rootNodeId = chain.rootNodeId;
    if (!rootNodeId) {
      Logger.error({
        message: `Root node ID for chain ${chainId} not found.`,
      });
      return;
    }

    const rootNode = this.nodes.get(rootNodeId);

    if (!rootNode) {
      Logger.error({
        message: `Root node ${rootNodeId} for chain ${chainId} not found.`,
      });
      return;
    }

    try {
      await this.runNode(rootNodeId, data);
      Logger.info({
        message: `Chain ${chainId} started with root node ${rootNodeId}.`,
      });
    } catch (error) {
      Logger.error({ message: `Failed to start chain ${chainId}: ${error}` });
    }
  }

  private async runNode(nodeId: string, data: PipelineData): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      await node.execute(data);
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  private async sendNodeData(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      try {
        await node.sendData();
      } catch (err) {
        const error = err as Error;
        Logger.error({
          message: `Node ${nodeId} send data failed: ${error.message}`,
        });
      }
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  getNodes(): Map<string, Node> {
    return this.nodes;
  }

  //
  getNodesByServiceAndChain(serviceUid: string, chainId: string): Node[] {
    const chain = this.chains.get(chainId);
    if (!chain) {
      return [];
    }

    return Array.from(this.nodes.values()).filter((node) => {
      const nodeConfig = chain.config.find((config) =>
        config.services.includes(node.getId()),
      );
      return nodeConfig && nodeConfig.services.includes(serviceUid);
    });
  }

  getNodesByService(serviceUid: string): Node[] {
    return Array.from(this.nodes.values()).filter((node) => {
      const chainConfigs = Array.from(this.chains.values()).map(
        (chain) => chain.config,
      );
      return chainConfigs.some((configs) =>
        configs.some(
          (config) =>
            config.services.includes(node.getId()) &&
            config.services.includes(serviceUid),
        ),
      );
    });
  }
}

export default NodeSupervisor.retrieveService();
