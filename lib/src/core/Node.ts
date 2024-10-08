import {
  DataType,
  NodeStatus,
  PipelineData,
  ProcessorPipeline,
} from '../types/types';
import { setTimeout, setImmediate } from 'timers';
import { randomUUID } from 'node:crypto';
import { Logger } from '../libs/Logger';
import { NodeSupervisor } from './NodeSupervisor';

export class Node {
  private id: string;
  private pipelines: ProcessorPipeline[];
  private dependencies: string[]; // Todo
  private status: NodeStatus.Type;
  private error?: Error;
  private delay: number;
  private progress: number;
  private dataType: DataType.Type;
  private executionQueue: Promise<void>;
  private output: PipelineData[];

  constructor(dependencies: string[] = []) {
    this.id = randomUUID();
    this.output = [];
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
    this.delay = 0;
    this.progress = 0;
    this.dataType = DataType.RAW;
    this.executionQueue = Promise.resolve();
  }

  getId(): string {
    return this.id;
  }

  addPipeline(pipeline: ProcessorPipeline): void {
    this.pipelines.push(pipeline);
  }

  // digest the data through successive processing stages
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

  async execute(data: PipelineData): Promise<void> {
    this.executionQueue = this.executionQueue.then(async () => {
      try {
        this.updateStatus(NodeStatus.IN_PROGRESS);
        if (this.delay > 0) {
          await this.sleep(this.delay);
        }

        const generator = this.getPipelineGenerator(this.pipelines, 3);

        for (const pipelineBatch of generator) {
          await new Promise<void>((resolve, reject) => {
            setImmediate(async () => {
              try {
                const batchPromises = pipelineBatch.map((pipeline) =>
                  this.processPipeline(pipeline, data).then(
                    (pipelineData: PipelineData) => {
                      this.output.push(pipelineData);
                      this.updateProgress();
                    },
                  ),
                );
                await Promise.all(batchPromises);
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          });
        }

        this.updateStatus(NodeStatus.COMPLETED);
      } catch (error) {
        this.updateStatus(NodeStatus.FAILED, error as Error);
        Logger.error({
          message: `Node ${this.id} execution failed: ${error}`,
        });
      }
    });

    return this.executionQueue;
  }

  async sendData(): Promise<void> {
    // make sure the queue has finished
    await this.executionQueue;

    Logger.info({ message: `${JSON.stringify(this.output, null, 2)}` });

    NodeSupervisor.terminate(this.id, this.output);

    // Todo: write the logic to send the data
    Logger.info({ message: `Sending data to node ${this.id}.` });
  }

  private updateProgress(): void {
    this.progress += 1 / this.pipelines.length;
  }

  getProgress(): number {
    return this.progress;
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
