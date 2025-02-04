import {
  DefaultCallback,
  ReportingCallback,
  ReportingMessage,
  ReportingPayload,
} from '../types/types';
import { Logger } from '../extra/Logger';
import { Agent } from './Agent';
import { ReportingAgentBase } from './ReportingAgent';
/**
 * Class for a node monitoring and status reporting agent
 */
export class ReportingAgent extends ReportingAgentBase {
  /**
   * Creates a new ReportingAgent instance
   * @param {string} chainId - The chain identifier
   * @param {string} nodeId - The node identifier
   */
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

/**
 * Responsible for managing all reporting agents and the monitoring of nodes within a processing chain
 */
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  private reportingCallback: ReportingCallback;
  private broadcastReportingCallback: ReportingCallback;
  private remoteMonitoringHost: Map<string, string>;
  // Todo: merge the following
  private status: Map<string, ChainStatus>;
  private setupCounts: Map<string, number>;
  private childChains: Map<string, string[]>;

  /**
   * Creates a new MonitoringAgent instance
   */
  constructor() {
    super();
    this.status = new Map();
    this.setupCounts = new Map();
    this.remoteMonitoringHost = new Map();
    this.childChains = new Map();

    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback =
      DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }

  /**
   * Retrieves or creates a MonitoringAgent instance (Singleton pattern)
   * @param {boolean} refresh - Whether to force create a new instance
   * @returns {MonitoringAgent} The MonitoringAgent instance
   */
  static retrieveService(refresh: boolean = false): MonitoringAgent {
    if (!MonitoringAgent.instance || refresh) {
      const instance = new MonitoringAgent();
      MonitoringAgent.instance = instance;
    }
    return MonitoringAgent.instance;
  }

  /**
   * Sets the reporting callback function
   * @param {ReportingCallback} reportingCallback - The callback function to handle reports
   */
  setReportingCallback(reportingCallback: ReportingCallback): void {
    this.reportingCallback = reportingCallback;
  }

  /**
   * Sets the broadcast reporting callback function
   * @param {ReportingCallback} broadcastReportingCallback - The callback function to handle broadcast reports
   */
  setBroadcastReportingCallback(
    broadcastReportingCallback: ReportingCallback,
  ): void {
    this.broadcastReportingCallback = broadcastReportingCallback;
  }

  /**
   * Gets the remote monitoring host for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {string|undefined} The remote monitoring host address if exists
   */
  getRemoteMonitoringHost(chainId: string): string | undefined {
    return this.remoteMonitoringHost.get(chainId);
  }

  /**
   * Sets the remote monitoring host for a specific chain
   * @param {string} chainId - The chain identifier
   * @param {string} remoteMonitoringHost - The remote monitoring host address
   */
  setRemoteMonitoringHost(chainId: string, remoteMonitoringHost: string): void {
    this.remoteMonitoringHost.set(chainId, remoteMonitoringHost);
  }

  /**
   * Generates a new ReportingAgent instance
   * @param {ReportingPayload} payload - The reporting payload containing chainId, nodeId and index
   * @returns {ReportingAgent} A new ReportingAgent instance
   */
  genReportingAgent(payload: ReportingPayload): ReportingAgent {
    const { chainId, nodeId, index } = payload;
    ReportingAgent.authorize(this);
    const reporting = new ReportingAgent(chainId, nodeId);
    //
    reporting.on('global-signal', async (signal) => {
      Logger.info(`Receive global-signal: ${signal} for node ${nodeId}`);
      const message: ReportingMessage = { ...payload, signal };
      if (index > 0) {
        void this.broadcastReportingCallback(message);
      } else {
        await this.reportingCallback(message);
      }
    });
    //
    reporting.on('local-signal', async (signal) => {
      Logger.info(`Receive local-signal: ${signal} for node ${nodeId}`);
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

  /**
   * Gets the status for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {ChainStatus|undefined} The chain status if exists
   */
  getChainStatus(chainId: string): ChainStatus | undefined {
    return this.status.get(chainId);
  }

  getChainSetupCount(chainId: string): number | undefined {
    return this.setupCounts.get(chainId);
  }

  setChainSetupCount(chainId: string, count: number): void {
    this.setupCounts.set(chainId, count);
  }
  // tmp
  trackChildChain(parentChainId: string, childChainId: string) {
    const children = this.childChains.get(parentChainId) || [];
    children.push(childChainId);
    this.childChains.set(parentChainId, children);
  }
}
