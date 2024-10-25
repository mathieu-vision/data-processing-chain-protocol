import { DefaultCallback, ReportingCallback } from '../types/types';
import { Logger } from '../extra/Logger';
import { Agent } from './Agent';
import { ReportingAgent } from './ReportingAgent';

export class NodeReportingAgent extends ReportingAgent {
  constructor(
    // eslint-disable-next-line no-unused-vars
    readonly chainId: string,
    // eslint-disable-next-line no-unused-vars
    readonly nodeId: string,
  ) {
    super();
  }
}

// Receive reports from NodeReporters
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  private reportingCallback: ReportingCallback;
  private broadcastReportingCallback: ReportingCallback;
  // chain-id:node-reporter-agent-id
  private reportings: Map<string, string>;
  constructor() {
    super();
    this.reportings = new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback =
      DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }

  setReportingCallback(reportingCallback: ReportingCallback): void {
    this.reportingCallback = reportingCallback;
  }

  setBroadcastReportingCallback(
    broadcastReportingCallback: ReportingCallback,
  ): void {
    this.broadcastReportingCallback = broadcastReportingCallback;
  }

  static retrieveService(refresh: boolean = false): MonitoringAgent {
    if (!MonitoringAgent.instance || refresh) {
      const instance = new MonitoringAgent();
      MonitoringAgent.instance = instance;
    }
    return MonitoringAgent.instance;
  }

  genReporterAgent(chainId: string, nodeId: string): NodeReportingAgent {
    NodeReportingAgent.authorize(this);
    const reporting = new NodeReportingAgent(chainId, nodeId);
    reporting.on('signal', async (signal) => {
      Logger.info(`Receive signal: ${signal}`);
      await this.reportingCallback({
        signal,
        chainId,
        nodeId,
      });
    });
    // todo: put the agent in a local list of reporters
    return reporting;
  }

  getReporterAgent() {}
  // todo: pull messages/states from reporters ?
}