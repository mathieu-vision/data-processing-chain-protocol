import { ChainNode } from './ChainNode';
import { NodeStatus } from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';

export class NodeSupervisor {
  private nodes: Map<string, ChainNode>;
  private nodeMonitoring: NodeMonitoring;

  constructor(nodeMonitoring: NodeMonitoring) {
    this.nodes = new Map();
    this.nodeMonitoring = nodeMonitoring;
  }

  async createNode(params: any): Promise<void> {
    const { nodeId, processor, dependencies } = params;

    if (this.nodes.has(nodeId)) {
      Logger.warn({ message: `Node ${nodeId} already exists.` });
      return;
    }

    const node = new ChainNode(nodeId, processor, dependencies);
    this.nodes.set(nodeId, node);
    this.nodeMonitoring.addNode(node);
    Logger.info({ message: `Node ${nodeId} created.` });
  }

  async deleteNode(nodeId: string): Promise<void> {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      this.nodeMonitoring.removeNode(nodeId);
      Logger.info({ message: `Node ${nodeId} deleted.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  async pauseNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.updateStatus(NodeStatus.PAUSED);
      Logger.info({ message: `Node ${nodeId} paused.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  async delayNode(nodeId: string, delay: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.setDelay(delay);
      Logger.info({ message: `Node ${nodeId} delayed by ${delay} ms.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  async runNode(nodeId: string, data: any): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      try {
        const result = await node.execute(data);
        this.nodeMonitoring.updateNodeStatus(nodeId, NodeStatus.COMPLETED);
        Logger.info({ message: `Node ${nodeId} executed successfully.` });
      } catch (err) {
        const error = err as Error;
        this.nodeMonitoring.updateNodeStatus(nodeId, NodeStatus.FAILED, error);
        Logger.error({
          message: `Node ${nodeId} execution failed.` /*, error */,
        });
      }
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  async sendNodeData(nodeId: string, data: any): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      await this.runNode(nodeId, data);
    } else {
      await this.sendDataToRemoteNode(nodeId, data);
    }
  }

  async sendDataToRemoteNode(nodeId: string, data: any): Promise<void> {
    Logger.info({ message: `Sending data to remote node ${nodeId}.` });
  }
}
