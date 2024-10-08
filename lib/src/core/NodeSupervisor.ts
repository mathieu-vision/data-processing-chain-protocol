import { Node } from './Node';
import { NodeStatus, PipelineData } from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';
import { NodeProcessor } from './NodeProcessor';

export class NodeSupervisor {
  private nodes: Map<string, Node>;
  private nodeMonitoring: NodeMonitoring;

  constructor(nodeMonitoring: NodeMonitoring) {
    this.nodes = new Map();
    this.nodeMonitoring = nodeMonitoring;
  }

  async createNode(dependencies: string[] = []): Promise<string> {
    const node = new Node(dependencies);
    const nodeId = node.getId();
    this.nodes.set(nodeId, node);
    this.nodeMonitoring.addNode(node);
    Logger.info({ message: `Node ${nodeId} created.` });
    return nodeId;
  }

  async addProcessors(
    nodeId: string,
    processors: NodeProcessor[],
  ): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.addProcessors(processors);
      Logger.info({ message: `Processors added to Node ${nodeId}.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
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

  async runNode(nodeId: string, data: PipelineData): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      await node.execute(data);
    } else {
      Logger.warn({ message: `Node ${nodeId} not found.` });
    }
  }

  async sendNodeData(nodeId: string, data: PipelineData): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      try {
        await node.sendData(data);
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
}
