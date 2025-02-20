import { post } from '../utils/http';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeStatusMessage } from '../types/types';
import { Logger } from 'utils/Logger';
import { Ext as ExtDRC } from 'extensions/DefaultReportingCallbacks';
export namespace Ext {
  export type NodeStatusHandlerCallback = (
    // eslint-disable-next-line no-unused-vars
    targetId: string,
  ) => Promise<string | undefined>;

  export interface DefaultNodeStatusCallbackPayload {
    paths: { enqueue: string };
    monitoringResolver?: NodeStatusHandlerCallback;
  }

  export interface NSCPayload {
    message: NodeStatusMessage;
    monitoringResolver: NodeStatusHandlerCallback;
    path: string;
  }

  const nodeStatusCallback = async (payload: NSCPayload): Promise<void> => {
    const { message, path, monitoringResolver } = payload;
    const monitoringHost = await monitoringResolver(message.chainId);
    const url = new URL(path, monitoringHost);
    const data = JSON.stringify(message);
    Logger.info(`NodeStatusCallback: Sending message to ${url}`);
    await post(url, data);
  };

  // const defaultNodeStatusHandler = (targetId: string) => {};

  export const setNodeStatusResolverCallbacks = async (
    dcPayload: DefaultNodeStatusCallbackPayload,
  ): Promise<void> => {
    const { paths, monitoringResolver } = dcPayload;
    const supervisor = NodeSupervisor.retrieveService();

    supervisor.setNodeStatusCallback(
      async (message: NodeStatusMessage): Promise<void> => {
        const payload: NSCPayload = {
          message,
          monitoringResolver:
            monitoringResolver ?? ExtDRC.defaultMonitoringResolver,
          path: paths.enqueue,
        };
        await nodeStatusCallback(payload);
      },
    );
  };
}
