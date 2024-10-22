import { ChainState, NodeStatus } from '../types/types';
import { ProgressTracker } from './ProgressTracker';
import { Node } from './Node';
import { Logger } from './Logger';

// Todo: need a full review
export class NodeMonitoring {
  private nodes: Node[];
  private nodeStatusMap: Map<string, NodeStatus.Type>;
  private progressTracker: ProgressTracker | null;

  constructor(chainNodes: Node[], progressTracker: ProgressTracker | null) {
    this.nodes = chainNodes;
    this.progressTracker = progressTracker;
    this.nodeStatusMap = new Map();
    this.nodes.forEach((node) => {
      this.nodeStatusMap.set(node.getId(), node.getStatus());
    });
  }

  addNode(node: Node): void {
    if (!this.nodes.find((n) => n.getId() === node.getId())) {
      const newIndex = this.nodes.length;
      this.nodes.push(node);
      this.nodeStatusMap.set(node.getId(), node.getStatus());
      Logger.info(
        `Node ${node.getId()} added to monitoring at index ${newIndex}.`,
      );
    } else {
      Logger.warn(`Node ${node.getId()} is already being monitored.`);
    }
  }

  deleteNode(nodeId: string): void {
    const index = this.nodes.findIndex((n) => n.getId() === nodeId);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      this.nodeStatusMap.delete(nodeId);
      Logger.info(`Node ${nodeId} removed from monitoring.`);
    } else {
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
    }
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
      if (this.progressTracker) {
        this.progressTracker.notifyProgress(nodeId, status);
      }
      Logger.info(`Node ${nodeId} status updated to ${status}.`);
    } else {
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
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

  // Todo: review
  canExecuteNode(nodeId: string): boolean {
    const node = this.nodes.find((n) => n.getId() === nodeId);
    if (node) {
      const completedNodes = new Set(this.getCompletedNodes());
      return node.canExecute(completedNodes);
    } else {
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
      return false;
    }
  }

  private getCompletedNodes(): string[] {
    return this.nodes
      .filter((node) => node.getStatus() === NodeStatus.COMPLETED)
      .map((node) => node.getId());
  }

  setProgressTracker(progressTracker: ProgressTracker): void {
    this.progressTracker = progressTracker;
    Logger.info(`ProgressTracker updated.`);
  }
}
