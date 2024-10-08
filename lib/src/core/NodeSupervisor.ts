import { Node } from './Node';
import {
  NodeSignal,
  NodeStatus,
  PipelineData,
  SupervisorPayload,
} from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';
import { NodeProcessor } from './NodeProcessor';

export class NodeSupervisor {
  private static instance: NodeSupervisor;
  private nodes: Map<string, Node>;
  private nodeMonitoring?: NodeMonitoring;

  constructor() {
    this.nodes = new Map();
  }

  setMonitoring(nodeMonitoring: NodeMonitoring): void {
    this.nodeMonitoring = nodeMonitoring;
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
      case NodeSignal.NODE_SEND_DATA:
        return await this.sendNodeData(payload.id);
      default:
        Logger.warn({
          message: `Unknown signal received: ${payload.signal}`,
        });
    }
  }

  private async createNode(dependencies: string[] = []): Promise<string> {
    const node = new Node(dependencies);
    const nodeId = node.getId();
    this.nodes.set(nodeId, node);
    if (this.nodeMonitoring) {
      this.nodeMonitoring.addNode(node);
    }
    Logger.info({ message: `Node ${nodeId} created.` });
    return nodeId;
  }

  async addProcessors(
    nodeId: string,
    processors: NodeProcessor[],
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

  public static terminate(nodeId: string, pipelineData: PipelineData[]) {
    // Todo: delete node and pass data to next node
  }
}

export default NodeSupervisor.retrieveService();
