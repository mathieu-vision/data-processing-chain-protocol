import { Logger } from '../extra/Logger';
import { Agent } from './Agent';
import { ReportingAgent } from './ReportingAgent';

export class NodeReportingAgent extends ReportingAgent {
  private chainId: string;
  private nodeId: string;
  constructor(chainId: string, nodeId: string) {
    super();
    this.chainId = chainId;
    this.nodeId = nodeId;
  }
}

// Receive reports from NodeReporters
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  // chain-id:node-reporter-agent-id
  private reportings: Map<string, string>;
  constructor() {
    super();
    this.reportings = new Map();
  }

  static retrieveService(refresh: boolean = false): MonitoringAgent {
    if (!MonitoringAgent.instance || refresh) {
      const instance = new MonitoringAgent();
      MonitoringAgent.instance = instance;
    }
    return MonitoringAgent.instance;
  }

  genReporterAgent(chainId: string, nodeId: string) {
    NodeReportingAgent.authorize(this);
    const reporting = new NodeReportingAgent(chainId, nodeId);
    reporting.on('notification', (signal) => {
      Logger.info(`Receive signal: ${signal}`);
    });
    // todo: put the agent in a local list of reporters
    return reporting;
  }

  getReporterAgent() {}
  // todo: pull messages/states from reporters
}
