import { PipelineData, ProcessorCallback } from 'types/types';

export class NodeProcessor {
  static callbackService: ProcessorCallback;
  private targetId: string;
  constructor(targetId: string) {
    this.targetId = targetId;
  }
  static setCallbackService(callbackService: ProcessorCallback): void {
    NodeProcessor.callbackService = callbackService;
  }
  async digest(data: PipelineData): Promise<PipelineData> {
    return NodeProcessor.callbackService({ targetId: this.targetId, data });
  }
}
