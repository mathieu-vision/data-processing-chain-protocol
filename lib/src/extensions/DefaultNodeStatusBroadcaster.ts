import { post } from '../utils/http';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeStatusMessage } from '../types/types';
import { Logger } from 'utils/Logger';
export namespace Ext {
  export type NodeStatusHandlerCallback = (
    // eslint-disable-next-line no-unused-vars
    message: any,
  ) => Promise<string | undefined>;

  export interface DefaultNodeStatusCallbackPayload {
    paths: { enqueue: string };
    hostResolver?: NodeStatusHandlerCallback;
  }

  export interface NSCPayload {
    message: NodeStatusMessage;
    hostResolver: NodeStatusHandlerCallback;
    path: string;
  }

  export const defaultHostResolver = async (
    message: any,
  ): Promise<string | undefined> => {
    try {
      const hostURI = message.payload?.hostURI;
      if (hostURI) {
        return hostURI;
      } else {
        throw new Error('host URI not set');
      }
    } catch (error) {
      Logger.error(`${(error as Error).message}`);
    }
  };

  const nodeStatusCallback = async (payload: NSCPayload): Promise<void> => {
    try {
      const { message, path, hostResolver } = payload;
      const host = await hostResolver(message);
      const url = new URL(path, host);
      const data = JSON.stringify(message);
      Logger.info(`NodeStatusCallback: Sending message to ${url}`);
      await post(url, data);
    } catch (error) {
      Logger.error(`${(error as Error).message}`);
    }
  };

  export const setNodeStatusResolverCallbacks = async (
    dcPayload: DefaultNodeStatusCallbackPayload,
  ): Promise<void> => {
    const { paths, hostResolver } = dcPayload;
    const supervisor = NodeSupervisor.retrieveService();

    supervisor.setNodeStatusCallback(
      async (message: NodeStatusMessage): Promise<void> => {
        const payload: NSCPayload = {
          message,
          hostResolver: hostResolver ?? defaultHostResolver,
          path: paths.enqueue,
        };
        await nodeStatusCallback(payload);
      },
    );
  };
}
