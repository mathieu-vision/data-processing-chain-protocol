import {
  DefaultCallback,
  ReportingCallback,
  ReportingMessage,
  ReportingPayload,
} from '../types/types';
import { Logger } from '../extra/Logger';
import { Agent } from './Agent';
import { ReportingAgentBase } from './ReportingAgent';

export class ReportingAgent extends ReportingAgentBase {
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
  private remoteMonitoringHost: Map<string, string>;
  // chain-id:node-reporter-agent-id
  // private reportings: Map<string, string>;
  constructor() {
    super();
    this.remoteMonitoringHost = new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback =
      DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }

  static retrieveService(refresh: boolean = false): MonitoringAgent {
    if (!MonitoringAgent.instance || refresh) {
      const instance = new MonitoringAgent();
      MonitoringAgent.instance = instance;
    }
    return MonitoringAgent.instance;
  }

  setReportingCallback(reportingCallback: ReportingCallback): void {
    this.reportingCallback = reportingCallback;
  }

  setBroadcastReportingCallback(
    broadcastReportingCallback: ReportingCallback,
  ): void {
    this.broadcastReportingCallback = broadcastReportingCallback;
  }

  getRemoteMonitoringHost(chainId: string): string | undefined {
    return this.remoteMonitoringHost.get(chainId);
  }

  setRemoteMonitoringHost(chainId: string, remoteMonitoringHost: string): void {
    this.remoteMonitoringHost.set(chainId, remoteMonitoringHost);
  }

  genReportingAgent(payload: ReportingPayload): ReportingAgent {
    const { chainId, nodeId, index } = payload;
    ReportingAgent.authorize(this);
    const reporting = new ReportingAgent(chainId, nodeId);
    reporting.on('signal', async (signal) => {
      Logger.info(`Receive signal: ${signal}`);
      const message: ReportingMessage = { ...payload, signal };
      if (index > 0) {
        void this.broadcastReportingCallback(message);
      } else {
        await this.reportingCallback(message);
      }
    });
    return reporting;
  }
}
