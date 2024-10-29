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

interface ChainStatus {
  [key: string]: {
    [key: string]: boolean;
  };
}

// Receive reports from NodeReporters
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  private reportingCallback: ReportingCallback;
  private broadcastReportingCallback: ReportingCallback;
  private remoteMonitoringHost: Map<string, string>;
  private status: Map<string, ChainStatus>;
  constructor() {
    super();
    this.status = new Map();
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
    //
    reporting.on('global-signal', async (signal) => {
      Logger.info(`Receive signal: ${signal} for node ${nodeId}`);
      const message: ReportingMessage = { ...payload, signal };
      if (index > 0) {
        void this.broadcastReportingCallback(message);
      } else {
        await this.reportingCallback(message);
      }
    });
    //
    reporting.on('local-signal', async (signal) => {
      const message: ReportingMessage = { ...payload, signal };
      const update: ChainStatus = {
        [message.nodeId]: { [message.signal]: true },
      };
      let prev = this.status.get(message.chainId) ?? {};
      const next = { ...prev, ...update };
      this.status.set(message.chainId, next);
    });
    return reporting;
  }

  getChainStatus(chainId: string): ChainStatus | undefined {
    return this.status.get(chainId);
  }
}
