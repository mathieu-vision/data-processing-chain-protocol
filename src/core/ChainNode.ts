import { NodeStatus } from '../types/types';
import { setTimeout } from 'timers';
export class ChainNode {
  private id: string;
  private service: any;
  private dependencies: string[];
  private status: NodeStatus.Type;
  private error?: Error;
  private delay: number;

  constructor(id: string, service: any, dependencies: string[] = []) {
    this.id = id;
    this.service = service;
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
    this.delay = 0;
  }

  getId(): string {
    return this.id;
  }

  canExecute(executedNodes: Set<string>): boolean {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }

  setDelay(delay: number): void {
    this.delay = delay;
  }

  async execute(data: any): Promise<any> {
    try {
      this.status = NodeStatus.IN_PROGRESS;

      if (this.delay > 0) {
        await this.sleep(this.delay);
      }

      const result = await this.service(data);
      this.status = NodeStatus.COMPLETED;
      return result;
    } catch (error) {
      this.status = NodeStatus.FAILED;
      this.error = error as Error;
      throw error;
    }
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

  getService(): any {
    return this.service;
  }
}
