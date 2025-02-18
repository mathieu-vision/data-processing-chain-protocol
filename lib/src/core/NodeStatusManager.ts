import { NodeSignal } from '../types/types';
import { Logger } from '../utils/Logger';

export class NodeStatusManager {
  private signalQueue: NodeSignal.Type[] = [];
  private currentCursor: number = 0;

  private handleStopSignal(): void {
    Logger.info('NodeStatusManager: Processing STOP signal');
  }

  private handlePauseSignal(): void {
    Logger.info('NodeStatusManager: Processing PAUSE signal');
  }

  private handleResumeSignal(): void {
    Logger.info('NodeStatusManager: Processing RESUME signal');
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

  public processNextSignal(): void {
    try {
      if (this.currentCursor >= this.signalQueue.length) {
        return;
      }

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

      this.currentCursor++;
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
}
