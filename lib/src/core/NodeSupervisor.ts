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
} from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';
import { PipelineProcessor } from './PipelineProcessor';
import { randomUUID } from 'node:crypto';

export class NodeSupervisor {
  private uid: string = 'to be set from outside';
  private static instance: NodeSupervisor;
  private nodes: Map<string, Node>;
  private nodeMonitoring?: NodeMonitoring;
  private broadcastSetup: (message: any) => Promise<void> = async () => {};
  private chainConfig: ChainConfig[] = [];
  callbackOutput: Callback;

  constructor() {
    this.nodes = new Map();
    this.callbackOutput = (_payload: CallbackPayload) => {};
  }

  setCallbackOutput(callback: Callback): void {
    this.callbackOutput = callback;
  }

  setMonitoring(nodeMonitoring: NodeMonitoring): void {
    this.nodeMonitoring = nodeMonitoring;
  }

  setBroadcastCreationCallback(
    broadcastSetup: (message: any) => Promise<void>,
  ): void {
    this.broadcastSetup = broadcastSetup;
  }

  setChainConfig(config: ChainConfig[]): void {
    this.chainConfig = config;
  }

  public static retrieveService(): NodeSupervisor {
    if (!NodeSupervisor.instance) {
      const instance = new NodeSupervisor();
      NodeSupervisor.instance = instance;
    }
    return NodeSupervisor.instance;
  }

  async handleRequest(payload: SupervisorPayload): Promise<void | string> {
    switch (payload.signal) {
      case NodeSignal.NODE_SETUP:
        return this.setupNode(payload.config);
      case NodeSignal.NODE_CREATE:
        return this.createNode(payload.params);
      case NodeSignal.NODE_DELETE:
        return this.deleteNode(payload.id);
      case NodeSignal.NODE_PAUSE:
        return this.pauseNode(payload.id);
      case NodeSignal.NODE_DELAY:
        return this.delayNode(payload.id, payload.delay);
      case NodeSignal.NODE_RUN:
        return await this.runNode(payload.id, payload.data);
      //
      case NodeSignal.NODE_SEND_DATA:
        return await this.sendNodeData(payload.id);
      //
      default:
        Logger.warn({
          message: `Unknown signal received: ${payload.signal}`,
        });
    }
  }

  private async createNode(config: ChainConfig): Promise<string> {
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
        this.nodeMonitoring.removeNode(nodeId);
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

  async prepareChainDistribution(): Promise<void> {
    const localConfigs = this.chainConfig.filter(
      (config) => config.location === 'local',
    );
    const remoteConfigs = this.chainConfig.filter(
      (config) => config.location === 'remote',
    );

    for (const config of localConfigs) {
      await this.setupNode(config);
    }

    if (remoteConfigs.length > 0) {
      await this.broadcastNodeSetupSignal(remoteConfigs);
    }
  }

  private async setupNode(config: ChainConfig): Promise<void> {
    const nodeId = await this.createNode(config);
    const processors = config.services.map(
      (service) => new PipelineProcessor(service),
    );
    await this.addProcessors(nodeId, processors);
    Logger.info({
      message: `Node ${nodeId} setup completed with ${processors.length} processors`,
    });
  }

  async broadcastNodeSetupSignal(remoteConfigs: ChainConfig[]): Promise<void> {
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${randomUUID().slice(0, 8)}`;

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

  // Todo: move data to a dedicated input method
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
          message: `Node ${nodeId} execution failed: ${error.message}`,
        });
      }
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  getNodes(): Map<string, Node> {
    return this.nodes;
  }
}

export default NodeSupervisor.retrieveService();
