import {
  ReportingMessage,
  BroadcastReportingMessage,
  ChainStatus,
  SupervisorPayloadStartPendingChain,
  NodeSignal,
} from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { Logger } from './Logger';
import { post } from './http';
import { MonitoringAgent } from 'agents/MonitoringAgent';

export type ReportSignalHandlerCallback = (
  // eslint-disable-next-line no-unused-vars
  message: ReportingMessage,
) => Promise<void>;

export type MonitoringResolverCallback = (
  // eslint-disable-next-line no-unused-vars
  chainId: string,
) => Promise<string | undefined>;

export interface MCPayload {
  message: ReportingMessage;
  reportSignalHandler: ReportSignalHandlerCallback;
}

export interface BRCPayload {
  message: BroadcastReportingMessage;
  path: string;
  monitoringResolver: MonitoringResolverCallback;
}

// Default broadcastReportingCallback to be set on initial supervisor
export const reportingCallback = async (payload: MCPayload): Promise<void> => {
  const { message, reportSignalHandler } = payload;
  await reportSignalHandler(message);
};
export interface DefaultReportingCallbackPayload {
  paths: { notify: string };
  reportSignalHandler?: ReportSignalHandlerCallback;
  monitoringResolver?: MonitoringResolverCallback;
}

const defaultReportSignalHander = async (
  message: ReportingMessage,
): Promise<void> => {
  Logger.info({ message: `${JSON.stringify(message, null, 2)}` });
  switch (message.signal) {
    case ChainStatus.CHAIN_SETUP_COMPLETED:
      {
        const supervisor = NodeSupervisor.retrieveService();
        const payload: SupervisorPayloadStartPendingChain = {
          signal: NodeSignal.CHAIN_START_PENDING,
          id: message.chainId,
        };
        await supervisor.handleRequest(payload);
        Logger.info({
          message: `reportSignalHandler: Chain setup completed`,
        });
      }
      break;
  }
};

const defaultMonitoringResolver = async (
  chainId: string,
): Promise<string | undefined> => {
  try {
    const monitoring = MonitoringAgent.retrieveService();
    const monitoringHost = monitoring.getRemoteMonitoringHost(chainId);
    if (monitoringHost !== undefined) {
      Logger.info({
        message: `DRC: Resolving host for monitoring: ${monitoringHost}`,
      });
      return monitoringHost;
    } else throw new Error('monitoring not found');
  } catch (error) {
    Logger.error({ message: (error as Error).message });
  }
};

const broadcastReportingCallback = async (
  payload: BRCPayload,
): Promise<void> => {
  const { message, path, monitoringResolver } = payload;
  const monitoringHost = await monitoringResolver(message.chainId);
  const url = new URL(path, monitoringHost);
  const data = JSON.stringify(message);
  Logger.info(`DRC: Sending message to ${url}`);
  await post(url, data);
};

export const setMonitoringCallbacks = async (
  dcPayload: DefaultReportingCallbackPayload,
): Promise<void> => {
  const { paths, reportSignalHandler, monitoringResolver } = dcPayload;
  const supervisor = NodeSupervisor.retrieveService();

  supervisor.setMonitoringCallback(
    async (message: ReportingMessage): Promise<void> => {
      const payload: MCPayload = {
        message,
        reportSignalHandler: reportSignalHandler ?? defaultReportSignalHander,
      };
      await reportingCallback(payload);
    },
  );

  supervisor.setBroadcastReportingCallback(
    async (message: BroadcastReportingMessage): Promise<void> => {
      const payload: BRCPayload = {
        message,
        path: paths.notify,
        monitoringResolver: monitoringResolver ?? defaultMonitoringResolver,
      };
      await broadcastReportingCallback(payload);
    },
  );
};
