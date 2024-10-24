import { NodeSupervisor } from '../core/NodeSupervisor';

export interface DefaultReportingCallbackPayload {
  supervisor: NodeSupervisor;
}

export const setResolverCallbacks = async (
  dcPayload: DefaultReportingCallbackPayload,
): Promise<void> => {};
