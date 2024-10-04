export interface ChainState {
  completed: string[];
  pending: string[];
  failed: string[];
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
    | 'node_create'
    | 'node_delete'
    | 'node_pause'
    | 'node_delay'
    | 'node_run'
    | 'node_send_data';
  export const NODE_CREATE: Type = 'node_create';
  export const NODE_DELETE: Type = 'node_delete';
  export const NODE_PAUSE: Type = 'node_pause';
  export const NODE_DELAY: Type = 'node_delay';
  export const NODE_RUN: Type = 'node_run';
  export const NODE_SEND_DATA: Type = 'node_send_data';
}
