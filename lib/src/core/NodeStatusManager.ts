import { NodeSignal, PipelineData } from '../types/types';
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
  private executionState: 'running' | 'suspended' = 'running';

  private suspendedState: SuspendedState | null = null;

  // eslint-disable-next-line no-unused-vars
  constructor(private node: Node) {}

  private handleStopSignal(): void {
    Logger.info('NodeStatusManager: Processing STOP signal');
  }

  private handlePauseSignal(): void {
    Logger.info('NodeStatusManager: Processing PAUSE signal');
    if (this.executionState !== 'suspended') {
      this.executionState = 'suspended';
      Logger.info(`Node ${this.node.getId()} paused.`);
    }
  }

  private handleResumeSignal(): void {
    Logger.info('NodeStatusManager: Processing RESUME signal');
    if (this.executionState === 'suspended') {
      this.executionState = 'running';
      Logger.info(`Node ${this.node.getId()} resumed.`);
    }
  }

  async resume(): Promise<void> {
    if (!this.isSuspended()) {
      Logger.warn(
        `Cannot resume Node ${this.node.getId()}: not in suspended state`,
      );
      return;
    }
    this.pushSignals([NodeSignal.NODE_RESUME]);
    await this.process();
    const suspendedState = this.getSuspendedState();
    if (!suspendedState) {
      Logger.warn(
        `Cannot resume Node ${this.node.getId()}: no suspended state found`,
      );
      return;
    }
    return this.node.execute(suspendedState.data);
  }

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
    return this.executionState === 'suspended';
  }

  private handleErrorSignal(): void {
    Logger.error('NodeStatusManager: Processing ERROR signal');
  }

  private handleNodeSetup(): void {
    Logger.info('NodeStatusManager: Processing NODE_SETUP signal');
  }

  private handleNodeCreate(): void {
    Logger.info('NodeStatusManager: Processing NODE_CREATE signal');
  }

  private handleNodeDelete(): void {
    Logger.info('NodeStatusManager: Processing NODE_DELETE signal');
  }

  private handleNodeDelay(): void {
    Logger.info('NodeStatusManager: Processing NODE_DELAY signal');
  }

  private handleNodeRun(): void {
    Logger.info('NodeStatusManager: Processing NODE_RUN signal');
  }

  private handleNodeSendData(): void {
    Logger.info('NodeStatusManager: Processing NODE_SEND_DATA signal');
  }

  public updateQueue(newSignals: NodeSignal.Type[]): void {
    this.signalQueue = newSignals;
    this.currentCursor = 0;
  }

  public pushSignals(signals: NodeSignal.Type[]): void {
    this.signalQueue.push(...signals);
  }

  private processNextSignal(): void {
    try {
      const currentSignal = this.signalQueue[this.currentCursor];

      switch (currentSignal) {
        case NodeSignal.NODE_STOP:
          this.handleStopSignal();
          break;
        case NodeSignal.NODE_PAUSE:
          this.handlePauseSignal();
          break;
        case NodeSignal.NODE_RESUME:
          this.handleResumeSignal();
          break;
        case NodeSignal.NODE_ERROR:
          this.handleErrorSignal();
          break;
        case NodeSignal.NODE_SETUP:
          this.handleNodeSetup();
          break;
        case NodeSignal.NODE_CREATE:
          this.handleNodeCreate();
          break;
        case NodeSignal.NODE_DELETE:
          this.handleNodeDelete();
          break;
        case NodeSignal.NODE_DELAY:
          this.handleNodeDelay();
          break;
        case NodeSignal.NODE_RUN:
          this.handleNodeRun();
          break;
        case NodeSignal.NODE_SEND_DATA:
          this.handleNodeSendData();
          break;
        default:
          Logger.warn(`Unknown signal type: ${currentSignal}`);
      }
    } catch (error) {
      Logger.error(`Error processing signal: ${(error as Error).message}`);
      throw error;
    }
  }

  public getQueueState(): { queue: NodeSignal.Type[]; cursor: number } {
    return {
      queue: [...this.signalQueue],
      cursor: this.currentCursor,
    };
  }

  async process(): Promise<{ shouldSuspend: boolean }> {
    for (; this.currentCursor < this.signalQueue.length; this.currentCursor++) {
      this.processNextSignal();
    }
    return { shouldSuspend: this.executionState === 'suspended' };
  }
}
