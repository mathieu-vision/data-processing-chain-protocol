import {
  PipelineMeta,
  ReportingMessage,
  BroadcastReportingMessage,
} from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { Logger } from './Logger';
import { post } from './http';

export type ReportSignalHandlerCallback = (
  // eslint-disable-next-line no-unused-vars
  message: ReportingMessage,
) => Promise<void>;

export type MonitoringResolverCallback = (
  // eslint-disable-next-line no-unused-vars
  meta?: PipelineMeta,
) => Promise<string | undefined>;

export interface MCPayload {
  message: ReportingMessage;
  reportSignalHandler: ReportSignalHandlerCallback;
}

export interface BRCPayload {
  message: BroadcastReportingMessage;
  monitoringResolver: MonitoringResolverCallback;
}

// Default broadcastReportingCallback to be set on initial supervisor
export const reportingCallback = async (payload: MCPayload): Promise<void> => {
  Logger.info(JSON.stringify(payload, null, 2));
  const { message, reportSignalHandler } = payload;
  await reportSignalHandler(message);
};
export interface DefaultReportingCallbackPayload {
  supervisor: NodeSupervisor;
  paths: { report: string };
  reportSignalHandler: ReportSignalHandlerCallback;
  monitoringResolver?: MonitoringResolverCallback;
}

const defaultMonitoringResolver = async (
  meta?: PipelineMeta,
): Promise<string | undefined> => {
  try {
    Logger.info({
      message: `Resolving host for monitoring meta: ${JSON.stringify(meta, null, 2)}`,
    });
    if (meta?.monitoringHost !== undefined) {
      return meta?.monitoringHost;
    } else throw new Error('monitoring not found');
  } catch (error) {
    Logger.error({ message: (error as Error).message });
  }
};

const broadcastReportingCallback = async (
  payload: BRCPayload,
): Promise<void> => {
  const url = new URL('', '');
  const data = JSON.stringify(payload.message);
  await post(url, data);
};

export const setReportingCallbacks = async (
  dcPayload: DefaultReportingCallbackPayload,
): Promise<void> => {
  const { supervisor, paths, reportSignalHandler, monitoringResolver } =
    dcPayload;

  supervisor.setMonitoringCallback(
    async (message: ReportingMessage): Promise<void> => {
      const payload: MCPayload = {
        message,
        reportSignalHandler,
      };
      await reportingCallback(payload);
    },
  );

  supervisor.setBroadcastReportingCallback(
    async (message: BroadcastReportingMessage): Promise<void> => {
      const payload: BRCPayload = {
        message,
        monitoringResolver: monitoringResolver ?? defaultMonitoringResolver,
      };
      await broadcastReportingCallback(payload);
    },
  );
};
