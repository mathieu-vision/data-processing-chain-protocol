import { NodeStatus } from '../types/types';

export class ChainNode {
  private id: string;
  private service: any;
  private dependencies: string[];
  private status: NodeStatus.Type;
  private error?: Error;

  constructor(id: string, service: any, dependencies: string[] = []) {
    this.id = id;
    this.service = service;
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
  }

  getId(): string {
    return this.id;
  }

  canExecute(executedNodes: Set<string>): boolean {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }

  async execute(data: any): Promise<any> {
    try {
      this.status = NodeStatus.IN_PROGRESS;
      const result = await this.service(data);
      this.status = NodeStatus.COMPLETED;
      return result;
    } catch (error) {
      this.status = NodeStatus.FAILED;
      this.error = error as Error;
      throw error;
    }
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
