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
  SetupCallback,
  SupervisorPayloadPrepareChain,
  SupervisorPayloadStartChain,
} from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';
import { PipelineProcessor } from './PipelineProcessor';
import { randomUUID } from 'node:crypto';

export class NodeSupervisor {
  private uid: string;
  private ctn: string;
  private static instance: NodeSupervisor;
  private nodes: Map<string, Node>;
  private chains: Map<string, ChainRelation>;

  private nodeMonitoring?: NodeMonitoring;
  private broadcastSetupCallback: SetupCallback;
  remoteServiceCallback: Callback;

  constructor() {
    this.uid = '@supervisor:default';
    this.ctn = '@container:default';
    this.nodes = new Map();
    this.chains = new Map();
    this.remoteServiceCallback = (_payload: CallbackPayload) => {};
    this.broadcastSetupCallback = async (_message: BrodcastMessage) => {};
  }

  setRemoteServiceCallback(callback: Callback): void {
    this.remoteServiceCallback = callback;
  }

  setMonitoring(nodeMonitoring: NodeMonitoring): void {
    this.nodeMonitoring = nodeMonitoring;
  }

  setBroadcastSetupCallback(
    broadcastSetupCallback: (_message: BrodcastMessage) => Promise<void>,
  ): void {
    this.broadcastSetupCallback = broadcastSetupCallback;
  }

  setUid(uid: string) {
    this.ctn = `@container:${uid}`;
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
      case NodeSignal.NODE_SEND_DATA:
        return await this.sendNodeData(
          (payload as SupervisorPayloadSendData).id,
        );
      case NodeSignal.CHAIN_PREPARE:
        return await this.prepareChainDistribution(
          (payload as SupervisorPayloadPrepareChain).id,
        );
      case NodeSignal.CHAIN_START:
        return await this.startChain(
          (payload as SupervisorPayloadStartChain).id,
          (payload as SupervisorPayloadStartChain).data,
        );
      default:
        Logger.warn({
          message: `${this.ctn}: Unknown signal received: ${payload.signal}`,
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
      message: `${this.ctn}: Node ${nodeId} created with config: ${JSON.stringify(config)}`,
    });
    return nodeId;
  }

  private async setupNode(
    config: NodeConfig,
    initiator: boolean = false,
  ): Promise<string> {
    this.updateChain([config]);

    const nodeId = await this.createNode(config);
    const node = this.nodes.get(nodeId);
    if (node && config.nextTargetId !== undefined) {
      node.setNextNodeInfo(config.nextTargetId, NodeType.REMOTE);
    } else {
      if (!node) {
        Logger.warn({
          message: `${this.ctn}: Attempted to set next node info on undefined node`,
        });
      }
      if (!initiator && config.nextTargetId === undefined) {
        Logger.warn({
          message: `${this.ctn}: Cannot set next node info: nextTargetId is undefined`,
        });
      }
    }

    const processors = config.services.map(
      (service) => new PipelineProcessor(service),
    );
    await this.addProcessors(nodeId, processors);
    Logger.info({
      message: `${this.ctn}: Node ${nodeId} setup completed with ${processors.length} processors`,
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
      Logger.info({
        message: `${this.ctn}: Processors added to Node ${nodeId}.`,
      });
    } else {
      Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
    }
  }

  private async deleteNode(nodeId: string): Promise<void> {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      if (this.nodeMonitoring) {
        this.nodeMonitoring.deleteNode(nodeId);
      }
      Logger.info({ message: `${this.ctn}: Node ${nodeId} deleted.` });
    } else {
      Logger.warn({
        message: `${this.ctn}: Node ${nodeId} not found.`,
      });
    }
  }

  private async pauseNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.updateStatus(NodeStatus.PAUSED);
      Logger.info({ message: `${this.ctn}: Node ${nodeId} paused.` });
    } else {
      Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
    }
  }

  private async delayNode(nodeId: string, delay: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.setDelay(delay);
      Logger.info({
        message: `${this.ctn}: Node ${nodeId} delayed by ${delay} ms.`,
      });
    } else {
      Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
    }
  }

  createChain(config: ChainConfig): string {
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${randomUUID().slice(0, 8)}`;
    const relation: ChainRelation = {
      config,
    };
    this.chains.set(chainId, relation);
    Logger.header({
      message: `${this.ctn}: Chain ${chainId} creation has started...`,
    });
    return chainId;
  }

  // todo: review
  private updateChain(config: ChainConfig): string {
    if (config.length === 0 || !config[0].chainId) {
      throw new Error('Invalid chain configuration');
    }
    const chainId = config[0].chainId;
    let relation = this.chains.get(chainId);

    if (relation) {
      relation.config = relation.config.concat(config);
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} updated with ${config.length} new configurations`,
      });
    } else {
      relation = {
        config: config,
      };
      this.chains.set(chainId, relation);
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} created with ${config.length} configurations`,
      });
    }
    return chainId;
  }

  async prepareChainDistribution(chainId: string): Promise<void> {
    Logger.header({
      message: `${this.ctn}: Chain distribution for ${chainId} in progress...`,
    });
    const chain = this.chains.get(chainId);
    if (!chain) {
      throw new Error(`${this.ctn}: Chain ${chainId} not found`);
    }
    const chainConfig: ChainConfig = chain.config;
    const localConfigs: NodeConfig[] = chainConfig.filter(
      (config) => config.location === 'local',
    );
    const remoteConfigs: NodeConfig[] = chainConfig.filter(
      (config) => config.location === 'remote',
    );

    if (localConfigs.length > 0) {
      const rootNodeId = await this.setupNode(
        { ...localConfigs[0], chainId },
        true,
      );
      chain.rootNodeId = rootNodeId;

      let prevNodeId = rootNodeId;
      for (let i = 1; i < localConfigs.length; i++) {
        const currentNodeId = await this.setupNode(
          {
            ...localConfigs[i],
            chainId,
          },
          true,
        );
        const prevNode = this.nodes.get(prevNodeId);
        if (prevNode) {
          prevNode.setNextNodeInfo(currentNodeId, NodeType.LOCAL);
        }
        prevNodeId = currentNodeId;
      }

      // Set the last local node to point to the first remote service
      if (remoteConfigs.length > 0 && remoteConfigs[0].services.length > 0) {
        const lastLocalNode = this.nodes.get(prevNodeId);
        if (lastLocalNode) {
          lastLocalNode.setNextNodeInfo(
            remoteConfigs[0].services[0],
            NodeType.REMOTE,
          );
        }
      }
    } else {
      Logger.warn({
        message: `${this.ctn}: No local config found for chain ${chainId}. Root node unavailable.`,
      });
    }

    if (remoteConfigs.length > 0) {
      const updatedRemoteConfigs = remoteConfigs.map((config, index) => {
        const nextConfig = remoteConfigs[index + 1];
        return {
          ...config,
          nextTargetId: nextConfig ? nextConfig.services[0] : undefined,
        };
      });
      await this.broadcastNodeSetupSignal(chainId, updatedRemoteConfigs);
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
      await this.broadcastSetupCallback(message);
      Logger.info({
        message: `${this.ctn}: Node creation signal broadcasted with chainId: ${chainId} for remote configs`,
      });
    } catch (error) {
      Logger.error({
        message: `${this.ctn}: Failed to broadcast node creation signal: ${error}`,
      });
    }
  }

  async startChain(chainId: string, data: PipelineData): Promise<void> {
    Logger.header({ message: `Chain ${chainId} requested...` });
    const chain = this.chains.get(chainId);
    if (!chain) {
      Logger.warn({ message: `Chain ${chainId} not found.` });
      return;
    }
    const rootNodeId = chain.rootNodeId;
    if (!rootNodeId) {
      Logger.error({
        message: `${this.ctn}: Root node ID for chain ${chainId} not found.`,
      });
      return;
    }

    const rootNode = this.nodes.get(rootNodeId);

    if (!rootNode) {
      Logger.error({
        message: `${this.ctn}: Root node ${rootNodeId} for chain ${chainId} not found.`,
      });
      return;
    }

    try {
      await this.runNode(rootNodeId, data);
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} started with root node ${rootNodeId}.`,
      });
    } catch (error) {
      Logger.error({
        message: `${this.ctn}: Failed to start chain ${chainId}: ${error}`,
      });
    }
  }

  private async runNode(nodeId: string, data: PipelineData): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      await node.execute(data);
    } else {
      Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
    }
  }

  async runNodeByRelation(payload: CallbackPayload): Promise<void> {
    try {
      const { targetId, chainId, data } = payload;
      Logger.info({
        message: `Received data for node hosting target ${targetId}`,
      });
      if (chainId === undefined) {
        throw new Error('chainId is undefined');
      }
      if (targetId === undefined) {
        throw new Error('targetId is undefined');
      }
      const node = this.getNodesByServiceAndChain(targetId, chainId);
      if (!node || node.length === 0) {
        throw new Error(
          `No node found for targetId ${targetId} and chainId ${chainId}`,
        );
      }
      const nodeId = node[0].getId();
      if (nodeId === undefined) {
        throw new Error(
          `No node ID exists for targetId ${targetId} and chainId ${chainId}`,
        );
      }
      await this.handleRequest({
        signal: NodeSignal.NODE_RUN,
        id: nodeId,
        data: data as PipelineData,
      });
    } catch (error) {
      Logger.error({
        message: `Error in runNodeByRelation: ${(error as Error).message}`,
      });
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
          message: `${this.ctn}: Node ${nodeId} send data failed: ${error.message}`,
        });
      }
    } else {
      Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
    }
  }

  getNodes(): Map<string, Node> {
    return this.nodes;
  }

  //
  getNodesByServiceAndChain(serviceUid: string, chainId: string): Node[] {
    return Array.from(this.nodes.values()).filter((node) => {
      const nodeConfig = node.getConfig();
      if (!nodeConfig) {
        return false;
      }
      return (
        nodeConfig.chainId === chainId &&
        nodeConfig.services.includes(serviceUid)
      );
    });
  }
}

export default NodeSupervisor.retrieveService();
