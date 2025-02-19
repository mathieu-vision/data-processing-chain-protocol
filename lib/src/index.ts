import { NodeSupervisor } from './core/NodeSupervisor';
import { PipelineProcessor } from './core/PipelineProcessor';

import * as MonitoringModule from './extensions/DefaultMonitoringSignalHandler';
import * as ReportingModule from './extensions/DefaultReportingCallbacks';
import * as ResolverModule from './extensions/DefaultResolverCallbacks';

export { NodeSupervisor };

export { PipelineProcessor };

export {
  ServiceCallback,
  NodeSignal,
  ChainStatus,
  PipelineData,
  PipelineMeta,
  SupervisorPayload,
  CallbackPayload,
  BrodcastSetupMessage,
  ReportingMessage,
  ChainConfig,
  ChainRelation,
  NodeConfig,
  NodeType,
  ProcessorCallback,
  CombineStrategy,
  CombineFonction,
  SupervisorPayloadSetup,
  SupervisorPayloadCreate,
  SupervisorPayloadDelete,
  //  SupervisorPayloadPause,
  //  SupervisorPayloadDelay,
  SupervisorPayloadRun,
  SupervisorPayloadSendData,
  SupervisorPayloadPrepareChain,
  SupervisorPayloadStartChain,
  SupervisorPayloadStartPendingChain,
  SupervisorPayloadDeployChain,
  ChainState,
  DataType,
  ChainType,
  ProcessorPipeline,
  SetupCallback,
  ServiceConfig,
} from './types/types';

export { PipelineDataCombiner } from './core/PipelineDataCombiner';

export namespace Ext {
  export type BRCPayload = ReportingModule.Ext.BRCPayload;
  export type MCPayload = ReportingModule.Ext.MCPayload;
  export type BSCPayload = ResolverModule.Ext.BSCPayload;
  export type RSCPayload = ResolverModule.Ext.RSCPayload;
  export const Monitoring: typeof MonitoringModule.Ext = MonitoringModule.Ext;
  export const Reporting: typeof ReportingModule.Ext = ReportingModule.Ext;
  export const Resolver: typeof ResolverModule.Ext = ResolverModule.Ext;
}
