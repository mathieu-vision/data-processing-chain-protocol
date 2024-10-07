import {
  DataType,
  NodeStatus,
  PipelineData,
  ProcessorPipeline,
} from '../types/types';
import { setTimeout } from 'timers';
import { randomUUID } from 'node:crypto';
import { Logger } from '../libs/Logger';
export class Node {
  private id: string;
  private pipelines: ProcessorPipeline[];
  // Todo: manage external dependencies
  private dependencies: string[];
  private status: NodeStatus.Type;
  private error?: Error;
  private delay: number;
  private progress: number;
  private dataType: DataType.Type;

  constructor(dependencies: string[] = []) {
    this.id = randomUUID();
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
    this.delay = 0;
    this.progress = 0;
    this.dataType = DataType.RAW;
  }

  getId(): string {
    return this.id;
  }

  addProcessors(pipeline: ProcessorPipeline): void {
    this.pipelines.push(pipeline);
  }

  private async processPipeline(
    pipeline: ProcessorPipeline,
    data: PipelineData,
  ): Promise<PipelineData> {
    let result = data;
    for (const processor of pipeline) {
      result = await processor.digest(result);
    }
    return result;
  }

  private *getPipelineGenerator(
    pipelines: ProcessorPipeline[],
    count: number,
  ): Generator<ProcessorPipeline[], void, unknown> {
    for (let i = 0; i < pipelines.length; i += count) {
      yield pipelines.slice(i, i + count);
    }
  }

  async execute(data: PipelineData): Promise<Promise<PipelineData>[]> {
    try {
      this.updateStatus(NodeStatus.IN_PROGRESS);
      if (this.delay > 0) {
        await this.sleep(this.delay);
      }

      const generator = this.getPipelineGenerator(this.pipelines, 3);
      // Using promises to ensure the container/connector execution is not blocked while processing large amounts of data
      const promises: Promise<PipelineData>[] = [];

      for (const pipelines of generator) {
        const batchPromises = pipelines.map((pipeline) =>
          this.processPipeline(pipeline, data).then((result) => {
            this.updateProgress();
            return result;
          }),
        );
        promises.push(...batchPromises);
      }

      Promise.all(promises)
        .then(() => {
          this.updateStatus(NodeStatus.COMPLETED);
        })
        .catch((error) => {
          this.updateStatus(NodeStatus.FAILED, error);
        });

      return promises;
    } catch (error) {
      this.error = error as Error;
      this.updateStatus(NodeStatus.FAILED, this.error);
      Logger.error({
        message: `Node ${this.id} execution failed: ${this.error}`,
      });
      throw error;
    }
  }

  private updateProgress(): void {
    this.progress += 1 / this.pipelines.length;
  }

  getProgress(): number {
    return this.progress;
  }

  /*
  async execute(data: any): Promise<any[]> {
    try {
      this.status = NodeStatus.IN_PROGRESS;
      if (this.delay > 0) {
        await this.sleep(this.delay);
      }

      const generator = this.getPipelineGenerator(this.pipelines, 3);

      let results: any = [];
      for (const pipelines of generator) {
        const batches = await Promise.all(
          pipelines.map((pipeline) => this.processPipeline(pipeline, data)),
        );
        results = results.concat(batches);
      }

      this.status = NodeStatus.COMPLETED;
      return results;
    } catch (error) {
      this.status = NodeStatus.FAILED;
      this.error = error as Error;
      Logger.error({
        message: `Node ${this.id} execution failed: ${this.error}`,
      });
      throw error;
    }
  }
  */

  canExecute(executedNodes: Set<string>): boolean {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }

  setDelay(delay: number): void {
    this.delay = delay;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getDataType(): DataType.Type {
    return this.dataType;
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

  getProcessors(): ProcessorPipeline[] {
    return this.pipelines;
  }
}
