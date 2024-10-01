import { Logger } from '../libs/Logger';
import { NodeStatus } from '../types/types';

export class ProgressTracker {
  private totalNodes: number;
  private completedNodes: number = 0;

  constructor(totalNodes: number) {
    this.totalNodes = totalNodes;
  }

  notifyProgress(nodeId: string, status: NodeStatus.Type): void {
    if (status === NodeStatus.COMPLETED) {
      this.completedNodes++;
    }

    const progressPercentage = Math.round(
      (this.completedNodes / this.totalNodes) * 100,
    );
    Logger.info({
      message: `Node ${nodeId}: ${status}. Progress: ${progressPercentage}%`,
    });
  }
}
