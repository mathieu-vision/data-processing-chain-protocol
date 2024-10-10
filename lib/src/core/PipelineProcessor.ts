import { PipelineData, ProcessorCallback } from 'types/types';

export class PipelineProcessor {
  static callbackService: ProcessorCallback;
  private targetId: string;
  constructor(targetId: string) {
    this.targetId = targetId;
  }
  static setCallbackService(callbackService: ProcessorCallback): void {
    PipelineProcessor.callbackService = callbackService;
  }
  async digest(data: PipelineData): Promise<PipelineData> {
    return PipelineProcessor.callbackService({ targetId: this.targetId, data });
  }
}