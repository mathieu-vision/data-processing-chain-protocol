import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeStatusMessage } from '../types/types';

export namespace Ext {
  export type NodeStatusHostResolverCallback = (
    // eslint-disable-next-line no-unused-vars
    targetId: string,
  ) => string | undefined;

  export interface DefaultNodeStatusCallbackPayload {
    paths: { setup: string; run: string };
    hostResolver: NodeStatusHostResolverCallback;
  }

  export interface NSCPayload {
    message: NodeStatusMessage;
    hostResolver: NodeStatusHostResolverCallback;
    path: string;
  }

  const nodeStatusCallback = async (payload: NSCPayload) => {
    return;
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
          hostResolver,
          path: paths.setup,
        };
        await nodeStatusCallback(payload);
      },
    );
  };
}
