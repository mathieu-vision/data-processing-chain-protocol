/* eslint-disable no-unused-vars */
import { Logger } from '../extra/Logger';
import { PipelineProcessor } from '../core/PipelineProcessor';

export type ReportingSignalType = 'local-signal' | 'global-signal';
export type ProcessorPipeline = PipelineProcessor[];
export type PipelineData = unknown;
export interface PipelineMeta {
  header?: unknown;
  resolver?: string;
  monitoringHost?: string;
  configuration: unknown;
}
export interface CallbackPayload {
  chainId?: string;
  targetId: string;
  data: PipelineData;
  meta?: PipelineMeta;
}
export type ServiceCallback = (payload: CallbackPayload) => void;
export type SetupCallback = (message: BrodcastSetupMessage) => Promise<void>;
export type ReportingCallback = (message: ReportingMessage) => Promise<void>;
export type BroadcastReportingCallback = (
  message: BroadcastReportingMessage,
) => Promise<void>;

export namespace DefaultCallback {
  // todo: should be remote_service_callback
  export const SERVICE_CALLBACK: ServiceCallback = (
    payload: CallbackPayload,
  ) => {
    Logger.warn('REMOTE_SERVICE_CALLBACK not set');
  };
  // todo: should be broadcast_setup_callback
  export const SETUP_CALLBACK: SetupCallback = async (
    message: BrodcastSetupMessage,
  ) => {
    Logger.warn('SETUP_CALLBACK not set');
  };
  export const REPORTING_CALLBACK: ReportingCallback = async (
    message: ReportingMessage,
  ) => {
    Logger.warn('REPORTING_CALLBACK not set');
  };
  export const BROADCAST_REPORTING_CALLBACK: ReportingCallback = async (
    message: BroadcastReportingMessage,
  ) => {
    Logger.warn('BROADCAST_REPORTING_CALLBACK not set');
  };
}

export type ProcessorCallback = (
  payload: CallbackPayload,
) => Promise<PipelineData>;

export namespace NodeType {
  export type Type = 'local' | 'remote';
  export const LOCAL: Type = 'local';
  export const REMOTE: Type = 'remote';
}

export namespace DataType {
  export type Type = 'raw' | 'compressed';
  export const RAW: Type = 'raw';
  export const COMPRESSED: Type = 'compressed';
}

export namespace CombineStrategy {
  export type Type = 'merge' | 'union' | 'custom';
  export const MERGE: Type = 'merge';
  export const UNION: Type = 'union';
  export const CUSTOM: Type = 'custom';
}

export type CombineFonction = (dataSets: PipelineData[]) => unknown[];

export interface ChainState {
  completed: string[];
  pending: string[];
  failed: string[];
}

export namespace ChainType {
  export type Type = 0b0000010 | 0b00000001;
  export const PERSISTANT: Type = 0b00000010;
  export const DEFAULT: Type = 0b00000001;
}

export namespace ChainStatus {
  export type Type =
    | 'node_pending'
    | 'node_in_progress' // running
    | 'node_completed'
    | 'node_failed'
    | 'node_paused'
    | 'node_setup_completed'
    | 'chain_setup_completed';
  export const NODE_PAUSED: Type = 'node_paused';
  export const NODE_PENDING: Type = 'node_pending';
  export const NODE_IN_PROGRESS: Type = 'node_in_progress';
  export const NODE_COMPLETED: Type = 'node_completed';
  export const NODE_FAILED: Type = 'node_failed';
  export const NODE_SETUP_COMPLETED: Type = 'node_setup_completed';
  export const CHAIN_SETUP_COMPLETED: Type = 'chain_setup_completed';
}

// handler signal
export namespace NodeSignal {
  export type Type =
    | 'node_setup'
    | 'node_create'
    | 'node_delete'
    | 'node_pause'
    | 'node_delay'
    | 'node_run'
    | 'node_send_data'
    | 'chain_prepare'
    | 'chain_start'
    | 'chain_start_pending'
    | 'chain_deploy';

  export const NODE_SETUP: 'node_setup' = 'node_setup';
  export const NODE_CREATE: 'node_create' = 'node_create';
  export const NODE_DELETE: 'node_delete' = 'node_delete';
  export const NODE_PAUSE: 'node_pause' = 'node_pause';
  export const NODE_DELAY: 'node_delay' = 'node_delay';
  export const NODE_RUN: 'node_run' = 'node_run';
  export const NODE_SEND_DATA: 'node_send_data' = 'node_send_data';
  export const CHAIN_PREPARE: 'chain_prepare' = 'chain_prepare';
  export const CHAIN_START: 'chain_start' = 'chain_start';
  export const CHAIN_START_PENDING: 'chain_start_pending' =
    'chain_start_pending';
  export const CHAIN_DEPLOY: 'chain_deploy' = 'chain_deploy';
}

export type SupervisorPayloadSetup = {
  signal: 'node_setup';
  config: NodeConfig;
};

export type SupervisorPayloadCreate = {
  signal: 'node_create';
  params: NodeConfig;
};

export type SupervisorPayloadDelete = {
  signal: 'node_delete';
  id: string;
};

export type SupervisorPayloadPause = {
  signal: 'node_pause';
  id: string;
};

export type SupervisorPayloadDelay = {
  signal: 'node_delay';
  id: string;
  delay: number;
};

export type SupervisorPayloadRun = {
  signal: 'node_run';
  id: string;
  data: PipelineData;
};

export type SupervisorPayloadSendData = {
  signal: 'node_send_data';
  id: string;
};

export type SupervisorPayloadPrepareChain = {
  signal: 'chain_prepare';
  id: string;
};

export type SupervisorPayloadStartChain = {
  signal: 'chain_start';
  id: string;
  data: PipelineData;
};

export type SupervisorPayloadStartPendingChain = {
  signal: 'chain_start_pending';
  id: string;
};

export type SupervisorPayloadDeployChain = {
  signal: 'chain_deploy';
  config: ChainConfig;
  data: PipelineData;
};
/*
export type SupervisorPayloadMap = {
  node_setup: SupervisorPayloadSetup;
  node_create: SupervisorPayloadCreate;
  node_delete: SupervisorPayloadDelete;
  node_pause: SupervisorPayloadPause;
  node_delay: SupervisorPayloadDelay;
  node_run: SupervisorPayloadRun;
  node_send_data: SupervisorPayloadSendData;
  chain_prepare: SupervisorPayloadPrepareChain;
  chain_start: SupervisorPayloadStartChain;
  chain_start_pending: SupervisorPayloadStartPendingChain;
  chain_deploy: SupervisorPayloadDeployChain;
};

export type SupervisorPayload =
  SupervisorPayloadMap[keyof SupervisorPayloadMap];
*/
export type SupervisorPayload =
  | SupervisorPayloadSetup
  | SupervisorPayloadCreate
  | SupervisorPayloadDelete
  | SupervisorPayloadPause
  | SupervisorPayloadDelay
  | SupervisorPayloadRun
  | SupervisorPayloadSendData
  | SupervisorPayloadPrepareChain
  | SupervisorPayloadStartChain
  | SupervisorPayloadStartPendingChain
  | SupervisorPayloadDeployChain;

export interface ServiceConfig {
  targetId: string;
  meta?: PipelineMeta;
}

export type NodeConfig = {
  services: (string | ServiceConfig)[];
  chainId: string;
  index?: number;
  location?: NodeType.Type;
  nextTargetId?: string;
  nextMeta?: PipelineMeta;
  chainType?: ChainType.Type;
  monitoringHost?: string;
};

export type ChainConfig = NodeConfig[];
export interface BrodcastSetupMessage {
  signal: NodeSignal.Type;
  chain: {
    id: string;
    config: ChainConfig;
  };
}

export interface ReportingPayload {
  chainId: string;
  nodeId: string;
  index: number;
}

export interface ReportingMessage extends ReportingPayload {
  signal: ChainStatus.Type;
}

export interface BroadcastReportingMessage extends ReportingPayload {
  signal: ChainStatus.Type;
}

export interface ChainRelation {
  rootNodeId?: string;
  dataRef?: PipelineData;
  config: ChainConfig;
}
