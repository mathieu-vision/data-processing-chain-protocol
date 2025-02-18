import { NodeSignal } from '../types/types';
import { Logger } from '../utils/Logger';

export class NodeStatusManager {
  private signalQueue: NodeSignal.Type[] = [];
  private currentCursor: number = 0;

  private isPaused: boolean = false;
  private pausePromise: Promise<void> | null = null;
  private resumeCallback: (() => void) | null = null;

  // eslint-disable-next-line no-unused-vars
  constructor(private nodeId: string) {}

  private handleStopSignal(): void {
    Logger.info('NodeStatusManager: Processing STOP signal');
  }

  private handlePauseSignal(): void {
    Logger.info('NodeStatusManager: Processing PAUSE signal');
    if (!this.isPaused) {
      this.isPaused = true;
      this.pausePromise = new Promise((resolve) => {
        this.resumeCallback = resolve;
      });
      Logger.info(`Node ${this.nodeId} paused.`);
    }
  }

  private handleResumeSignal(): void {
    Logger.info('NodeStatusManager: Processing RESUME signal');
    if (this.isPaused) {
      this.isPaused = false;
      if (this.resumeCallback) {
        this.resumeCallback();
      }
      this.pausePromise = null;
      this.resumeCallback = null;
      Logger.info(`Node ${this.nodeId} resumed.`);
    }
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

  private async processState(): Promise<void> {
    if (this.isPaused && this.pausePromise) {
      await this.pausePromise;
    }
  }

  async process(): Promise<void> {
    for (; this.currentCursor < this.signalQueue.length; this.currentCursor++) {
      this.processNextSignal();
      await this.processState();
    }
  }
}
