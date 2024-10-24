import { Logger } from '../extra/Logger';
import { Agent } from './Agent';
import { NodeSignal } from '../types/types';

// Node monitoring and status reporting agent
export abstract class ReportingAgent extends Agent {
  private static authorizedAgent: Agent | null = null;
  private signals: NodeSignal.Type[] = [];
  constructor() {
    super();
    if (!(ReportingAgent.authorizedAgent instanceof Agent)) {
      throw new Error(
        'Node Reporter needs to be instantiated by an authorized Agent',
      );
    }
    ReportingAgent.authorizedAgent = null;
  }

  static authorize(agent: Agent): void {
    ReportingAgent.authorizedAgent = agent;
  }

  notify(signal: NodeSignal.Type): void {
    Logger.info(`Signal ${signal} from ${0}`);
    this.signals.push(signal);
    this.emit('notification', signal);
  }

  getSignals(): NodeSignal.Type[] {
    return this.signals;
  }
}
