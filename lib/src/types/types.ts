import { PipelineProcessor } from '../core/PipelineProcessor';

export type ProcessorPipeline = PipelineProcessor[];

export type PipelineData = unknown;
export interface PipelineMeta {
  header?: unknown;
  resolver?: string;
  configuration: unknown;
}
export interface CallbackPayload {
  chainId?: string;
  targetId: string;
  data: PipelineData;
  meta?: PipelineMeta;
}
export type Callback = (_payload: CallbackPayload) => void;
export type SetupCallback = (_message: BrodcastMessage) => Promise<void>;
export type ProcessorCallback = (
  _payload: CallbackPayload,
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

export type CombineFonction = (_dataSets: PipelineData[]) => unknown[];

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

export namespace NodeStatus {
  export type Type =
    | 'pending'
    | 'in-progress' // running
    | 'completed'
    | 'failed'
    | 'paused';
  export const PAUSED: Type = 'paused';
  export const PENDING: Type = 'pending';
  export const IN_PROGRESS: Type = 'in-progress';
  export const COMPLETED: Type = 'completed';
  export const FAILED: Type = 'failed';
}

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
    | 'chain_deploy';
  export const NODE_SETUP: Type = 'node_setup';
  export const NODE_CREATE: Type = 'node_create';
  export const NODE_DELETE: Type = 'node_delete';
  export const NODE_PAUSE: Type = 'node_pause';
  export const NODE_DELAY: Type = 'node_delay';
  export const NODE_RUN: Type = 'node_run';
  export const NODE_SEND_DATA: Type = 'node_send_data';
  export const CHAIN_PREPARE: Type = 'chain_prepare';
  export const CHAIN_START: Type = 'chain_start';
  export const CHAIN_DEPLOY: Type = 'chain_deploy';
}

export type SupervisorPayloadSetup = {
  signal: typeof NodeSignal.NODE_SETUP;
  config: NodeConfig;
};

export type SupervisorPayloadCreate = {
  signal: typeof NodeSignal.NODE_CREATE;
  params: NodeConfig;
};

export type SupervisorPayloadDelete = {
  signal: typeof NodeSignal.NODE_DELETE;
  id: string;
};

export type SupervisorPayloadPause = {
  signal: typeof NodeSignal.NODE_PAUSE;
  id: string;
};

export type SupervisorPayloadDelay = {
  signal: typeof NodeSignal.NODE_DELAY;
  id: string;
  delay: number;
};

export type SupervisorPayloadRun = {
  signal: typeof NodeSignal.NODE_RUN;
  id: string;
  data: PipelineData;
};

export type SupervisorPayloadSendData = {
  signal: typeof NodeSignal.NODE_SEND_DATA;
  id: string;
};

export type SupervisorPayloadPrepareChain = {
  signal: typeof NodeSignal.CHAIN_PREPARE;
  id: string;
};

export type SupervisorPayloadStartChain = {
  signal: typeof NodeSignal.CHAIN_START;
  id: string;
  data: PipelineData;
};

export type SupervisorPayloadDeployChain = {
  signal: typeof NodeSignal.CHAIN_DEPLOY;
  config: ChainConfig;
  data: PipelineData;
};

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
  | SupervisorPayloadDeployChain;

export interface ServiceConfig {
  targetId: string;
  meta?: PipelineMeta;
}

export type NodeConfig = {
  services: (string | ServiceConfig)[];
  chainId?: string;
  location?: NodeType.Type;
  nextTargetId?: string;
  nextMeta?: PipelineMeta;
  chainType?: ChainType.Type;
};

export type ChainConfig = NodeConfig[];
export interface BrodcastMessage {
  signal: NodeSignal.Type;
  chain: {
    id: string;
    config: ChainConfig;
  };
}

export interface ChainRelation {
  rootNodeId?: string;
  config: ChainConfig;
}
