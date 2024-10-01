import { ChainState, NodeStatus } from '../types/types';
import { ProgressTracker } from './ProgressTracker';
import { ChainNode } from './ChainNode';

export class NodeMonitoring {
  private nodes: ChainNode[];
  private nodeStatusMap: Map<string, NodeStatus.Type>;
  private progressTracker: ProgressTracker | null;

  constructor(chainNodes: ChainNode[], progressTracker: ProgressTracker) {
    this.nodes = chainNodes;
    this.progressTracker = progressTracker;
    this.nodeStatusMap = new Map();
    this.nodes.forEach((node) => {
      this.nodeStatusMap.set(node.getId(), node.getStatus());
    });
  }

  updateNodeStatus(
    nodeId: string,
    status: NodeStatus.Type,
    error?: Error,
  ): void {
    const node = this.nodes.find((n) => n.getId() === nodeId);
    if (node) {
      node.updateStatus(status, error);
      this.nodeStatusMap.set(nodeId, status);
      this.progressTracker?.notifyProgress(nodeId, status);
    }
  }

  getChainState(): ChainState {
    const completed: string[] = [];
    const pending: string[] = [];
    const failed: string[] = [];

    this.nodes.forEach((node) => {
      const status = node.getStatus();
      if (status === NodeStatus.COMPLETED) {
        completed.push(node.getId());
      } else if (status === NodeStatus.FAILED) {
        failed.push(node.getId());
      } else {
        pending.push(node.getId());
      }
    });

    return { completed, pending, failed };
  }

  canExecuteNode(nodeId: string): boolean {
    const node = this.nodes.find((n) => n.getId() === nodeId);
    return node ? node.canExecute(new Set(this.getCompletedNodes())) : false;
  }

  private getCompletedNodes(): string[] {
    return this.nodes
      .filter((node) => node.getStatus() === NodeStatus.COMPLETED)
      .map((node) => node.getId());
  }
}
