import {
  DefaultCallback,
  NodeSignal,
  ReportingCallback,
  ReportingMessage,
  ReportingPayload,
} from '../types/types';
import { Logger } from '../utils/Logger';
import { Agent } from './Agent';
import { ReportingAgentBase } from './ReportingAgent';
import { NodeSupervisor } from '../core/NodeSupervisor';
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

export interface MonitoringChainStatus {
  [key: string]: {
    [key: string]: boolean;
  };
}
export interface WorkflowNode {
  status?: MonitoringChainStatus;
  setupCount?: number;
}

export interface Workflow {
  [key: string]: WorkflowNode;
}

/**
 * Responsible for managing all reporting agents and the monitoring of nodes within a processing chain
 */
export class MonitoringAgent extends Agent {
  private static instance: MonitoringAgent;
  private reportingCallback: ReportingCallback;
  private broadcastReportingCallback: ReportingCallback;
  private remoteMonitoringHost: Map<string, string>;
  private workflow: Workflow;

  private chainHierarchy: Map<
    string,
    {
      parentId?: string;
      children: string[];
      completedChildren: Set<string>;
    }
  > = new Map();

  /**
   * Creates a new MonitoringAgent instance
   */
  constructor() {
    super();
    this.workflow = {};
    this.remoteMonitoringHost = new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback =
      DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }

  getWorkflow(): Workflow {
    return this.workflow;
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
    // Handle global-signal
    // This is the main process for redirecting signals and communicating with the
    // entire context. It is called after any global notification
    // todo: add type for signals
    reporting.on('global-signal', async (signal) => {
      Logger.info(`Receive global-signal: ${signal} for node ${nodeId}`);
      const message: ReportingMessage = { ...payload, signal };
      if (index > 0) {
        // Report message to distant monitoring host
        signal.broadcasted = true;
        console.log(JSON.stringify(message, null, 2));
        void this.broadcastReportingCallback(message);
      } else {
        // Report message to monitoring
        await this.reportingCallback(message);
      }
    });

    // handle local signal for a specific node on a specific chain
    reporting.on('local-signal', async (signal) => {
      Logger.info(
        'Receive local-signal:\n' +
          `\t\t\t\t${JSON.stringify(signal)}\n` +
          `\t\t\t\tfor node ${nodeId} in chain ${chainId}\n`,
      );
      const message: ReportingMessage = { ...payload, signal };
      const update: MonitoringChainStatus = {
        [message.nodeId]: { [message.signal.status]: true },
      };
      if (!this.workflow[message.chainId]) {
        this.workflow[message.chainId] = {};
      }
      const prev = this.workflow[message.chainId].status || {};
      const next = { ...prev, ...update };
      this.workflow[message.chainId].status = next;
    });
    return reporting;
  }

  /**
   * Gets the status for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {ChainStatus|undefined} The chain status if exists
   */
  getChainStatus(chainId: string): MonitoringChainStatus | undefined {
    return this.workflow[chainId]?.status;
  }

  getChainSetupCount(chainId: string): number | undefined {
    return this.workflow[chainId]?.setupCount;
  }

  setChainSetupCount(chainId: string, count: number): void {
    if (!this.workflow[chainId]) {
      this.workflow[chainId] = {};
    }
    this.workflow[chainId].setupCount = count;
  }

  //
  async handleChildChainCompletion(childChainId: string) {
    const childEntry = this.chainHierarchy.get(childChainId);
    if (!childEntry || !childEntry.parentId) return;

    const parentEntry = this.chainHierarchy.get(childEntry.parentId);
    if (parentEntry) {
      parentEntry.completedChildren.add(childChainId);
      await this.checkChainReadiness(childEntry.parentId);
    }
  }

  trackChildChain(parentChainId: string, childChainId: string) {
    const parentEntry = this.chainHierarchy.get(parentChainId) || {
      children: [],
      completedChildren: new Set(),
    };
    parentEntry.children.push(childChainId);
    this.chainHierarchy.set(parentChainId, parentEntry);

    this.chainHierarchy.set(childChainId, {
      parentId: parentChainId,
      children: [],
      completedChildren: new Set(),
    });
  }

  private async checkChainReadiness(chainId: string) {
    try {
      const entry = this.chainHierarchy.get(chainId);
      if (!entry) {
        Logger.error(`No hierarchy entry found for chain ${chainId}`);
        return;
      }

      const supervisor = NodeSupervisor.retrieveService();
      const chain = supervisor.getChain(chainId);
      if (!chain) {
        Logger.error(`No chain found for id ${chainId}`);
        return;
      }

      const workflowNode = this.workflow[chainId];
      if (!workflowNode) {
        throw new Error(`No workflow found for chain ${chainId}`);
      }
      const setupCount = workflowNode.setupCount || 0;
      const config = chain.config.length || 0;

      Logger.info(
        `Chain ${chainId} setup status: ${setupCount}/${config} configs ready`,
      );
      Logger.info(
        `Children completed: ${entry.completedChildren.size}/${entry.children.length}`,
      );

      if (
        setupCount >= config &&
        entry.children.length === entry.completedChildren.size
      ) {
        try {
          await supervisor.handleRequest({
            signal: NodeSignal.CHAIN_START_PENDING,
            id: chainId,
          });
          Logger.info(
            `Chain ${chainId} readiness check completed, start signal sent`,
          );
        } catch (error) {
          Logger.error(
            `Failed to send start signal for chain ${chainId}: ${(error as Error).message}`,
          );
          throw error;
        }
      }
    } catch (error) {
      Logger.error(
        `Error during chain readiness check for ${chainId}: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
