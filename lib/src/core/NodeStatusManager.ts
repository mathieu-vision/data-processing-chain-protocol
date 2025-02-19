import { NodeSignal, PipelineData, ChainStatus } from '../types/types';
import { Logger } from '../utils/Logger';
import { Node } from './Node';

interface SuspendedState {
  generator: Generator<any, void, unknown>;
  currentBatch: any;
  data: PipelineData;
}

export class NodeStatusManager {
  private signalQueue: NodeSignal.Type[] = [];
  private currentCursor: number = 0;
  private status: ChainStatus.Type[] = [];

  private suspendedState: SuspendedState | null = null;

  // eslint-disable-next-line no-unused-vars
  constructor(private node: Node) {}

  private async handleStopSignal(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing STOP signal');
  }

  private async handleSuspendSignal(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing Suspend signal');
    if (!this.status.includes(ChainStatus.NODE_SUSPENDED)) {
      this.status.push(ChainStatus.NODE_SUSPENDED);
      Logger.info(`Node ${this.node.getId()} suspended.`);
    }
  }

  private async handleResumeSignal(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing RESUME signal');
    const index = this.status.indexOf(ChainStatus.NODE_SUSPENDED);
    if (index > -1) {
      this.status.splice(index, 1);
      if (!this.suspendedState) {
        Logger.warn(
          `~ NodeStatusManager: Node ${this.node.getId()} may have resumed prematurely.`,
        );
        return;
      }
      Logger.info(`~ NodeStatusManager: Resuming node ${this.node.getId()}...`);
      return this.node.execute(this.suspendedState.data);
    } else {
      Logger.warn(
        `~ NodeStatusManager: Cannot resume Node ${this.node.getId()}, not in suspended state.`,
      );
    }
  }

  //    this.pushSignals([NodeSignal.NODE_RESUME]);

  suspendExecution<T>(
    generator: Generator<T, void, unknown>,
    currentBatch: T,
    data: PipelineData,
  ): void {
    this.suspendedState = {
      generator,
      currentBatch,
      data,
    };
  }

  getSuspendedState(): SuspendedState | null {
    return this.suspendedState;
  }

  clearSuspendedState(): void {
    this.suspendedState = null;
  }

  isSuspended(): boolean {
    return this.status.includes(ChainStatus.NODE_SUSPENDED);
  }

  private async handleErrorSignal(): Promise<void> {
    Logger.error('~ NodeStatusManager: Processing ERROR signal');
  }

  private async handleNodeSetup(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing NODE_SETUP signal');
  }

  private async handleNodeCreate(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing NODE_CREATE signal');
  }

  private async handleNodeDelete(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing NODE_DELETE signal');
  }

  // private async handleNodeDelay(): Promise<void> {
  //   Logger.info('~ NodeStatusManager: Processing NODE_DELAY signal');
  // }

  private async handleNodeRun(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing NODE_RUN signal');
  }

  private async handleNodeSendData(): Promise<void> {
    Logger.info('~ NodeStatusManager: Processing NODE_SEND_DATA signal');
  }

  public updateQueue(newSignals: NodeSignal.Type[]): void {
    this.signalQueue = newSignals;
    this.currentCursor = 0;
  }

  public enqueueSignals(signals: NodeSignal.Type[]): void {
    this.signalQueue.push(...signals);
  }

  private async processNextSignal(): Promise<void> {
    try {
      const currentSignal = this.signalQueue[this.currentCursor];
      switch (currentSignal) {
        case NodeSignal.NODE_STOP:
          return this.handleStopSignal();
        // case NodeSignal.NODE_PAUSE:
        //   return this.handlePauseSignal();
        case NodeSignal.NODE_SUSPEND:
          return this.handleSuspendSignal();
        case NodeSignal.NODE_RESUME:
          return this.handleResumeSignal();
        case NodeSignal.NODE_ERROR:
          return this.handleErrorSignal();
        case NodeSignal.NODE_SETUP:
          return this.handleNodeSetup();
        case NodeSignal.NODE_CREATE:
          return this.handleNodeCreate();
        case NodeSignal.NODE_DELETE:
          return this.handleNodeDelete();
        // case NodeSignal.NODE_DELAY:
        //   return this.handleNodeDelay();
        case NodeSignal.NODE_RUN:
          return this.handleNodeRun();
        case NodeSignal.NODE_SEND_DATA:
          return this.handleNodeSendData();
        default:
          Logger.warn(
            `~ NodeStatusManager: Unknown signal type: ${currentSignal}`,
          );
      }
    } catch (error) {
      Logger.error(
        `~ NodeStatusManager: Error processing signal: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  public getQueueState(): { queue: NodeSignal.Type[]; cursor: number } {
    return {
      queue: [...this.signalQueue],
      cursor: this.currentCursor,
    };
  }

  async process(): Promise<ChainStatus.Type[]> {
    for (; this.currentCursor < this.signalQueue.length; this.currentCursor++) {
      await this.processNextSignal();
    }
    return this.status;
  }
}
