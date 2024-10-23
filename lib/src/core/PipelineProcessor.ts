import {
  PipelineData,
  PipelineMeta,
  ProcessorCallback,
  ServiceConfig,
} from 'types/types';

export class PipelineProcessor {
  static callbackService: ProcessorCallback;
  private meta?: PipelineMeta;
  private targetId: string;
  constructor(config: ServiceConfig) {
    this.targetId = config.targetId;
    this.meta = config.meta;
  }
  static setCallbackService(callbackService: ProcessorCallback): void {
    PipelineProcessor.callbackService = callbackService;
  }

  async digest(data: PipelineData): Promise<PipelineData> {
    if (PipelineProcessor.callbackService) {
      return await PipelineProcessor.callbackService({
        targetId: this.targetId,
        meta: this.meta,
        data,
      });
    }
    return {};
  }
}
