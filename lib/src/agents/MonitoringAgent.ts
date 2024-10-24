import { Agent } from './Agent';
import { ReportingAgent } from './ReportingAgent';

export class NodeReportingAgent extends ReportingAgent {
  private chainId: string;
  constructor(chainId: string) {
    super();
    this.chainId = chainId;
  }
}

// Receive reports from NodeReporters
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  // chain-id:node-reporter-agent-id
  private reporters: Map<string, string>;
  constructor() {
    super();
    this.reporters = new Map();
  }

  static retrieveService(refresh: boolean = false): MonitoringAgent {
    if (!MonitoringAgent.instance || refresh) {
      const instance = new MonitoringAgent();
      MonitoringAgent.instance = instance;
    }
    return MonitoringAgent.instance;
  }

  genReporterAgent(chainId: string) {
    NodeReportingAgent.authorize(this);
    const reporter = new NodeReportingAgent(chainId);
    // todo: put the agent in a local list of reporters
    return reporter;
  }

  getReporterAgent() {}
  // todo: pull messages/states from reporters
}
