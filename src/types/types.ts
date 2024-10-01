export interface ChainState {
  completed: string[];
  pending: string[];
  failed: string[];
}
export namespace NodeStatus {
  export const PENDING: 'pending' = 'pending';
  export const IN_PROGRESS: 'in-progress' = 'in-progress';
  export const COMPLETED: 'completed' = 'completed';
  export const FAILED: 'failed' = 'failed';
  export type Type = 'pending' | 'in-progress' | 'completed' | 'failed';
}
