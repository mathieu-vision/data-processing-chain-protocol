import { NodeStatus } from '../types/types';
import { setTimeout } from 'timers';
import { NodeProcessor } from './NodeProcessor';
import { randomUUID } from 'node:crypto';
import { Logger } from '../libs/Logger';

export class Node {
  private id: string;
  private processors: NodeProcessor[][];
  // Todo: manage external dependencies
  private dependencies: string[];
  private status: NodeStatus.Type;
  private error?: Error;
  private delay: number;

  constructor(dependencies: string[] = []) {
    this.id = randomUUID();
    this.processors = [];
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
    this.delay = 0;
  }

  getId(): string {
    return this.id;
  }

  addProcessors(processors: NodeProcessor[]): void {
    this.processors.push(processors);
  }

  async execute(data: any): Promise<any[]> {
    try {
      this.status = NodeStatus.IN_PROGRESS;
      if (this.delay > 0) {
        await this.sleep(this.delay);
      }

      const results = await Promise.all(
        this.processors.map(async (processorList) => {
          let result = data;
          for (const processor of processorList) {
            result = await processor.digest(result);
          }
          return result;
        }),
      );

      this.status = NodeStatus.COMPLETED;
      return results;
    } catch (error) {
      this.status = NodeStatus.FAILED;
      this.error = error as Error;
      Logger.error({
        message: `Node ${this.id} execution failed.`,
        /*error: this.error,*/
      });
      throw error;
    }
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

  getProcessors(): NodeProcessor[][] {
    return this.processors;
  }
}
