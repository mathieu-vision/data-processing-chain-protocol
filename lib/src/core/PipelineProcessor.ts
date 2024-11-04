import {
  PipelineData,
  PipelineMeta,
  ProcessorCallback,
  ServiceConfig,
} from 'types/types';

/**
 * Represents a processor that encapsulate external services within a pipeline
 */
export class PipelineProcessor {
  /** Static callback service used by all processor instances */
  static callbackService: ProcessorCallback;

  /** Optional metadata associated with this processor */
  private meta?: PipelineMeta;

  /** Target service identifier for this processor */
  private targetId: string;

  /**
   * Creates a new PipelineProcessor instance
   * @param {ServiceConfig} config - Configuration containing targetId and optional metadata
   */
  constructor(config: ServiceConfig) {
    this.targetId = config.targetId;
    this.meta = config.meta;
  }

  /**
   * Sets the static callback service used by all processor instances
   * @param {ProcessorCallback} callbackService - The callback function to process data
   */
  static setCallbackService(callbackService: ProcessorCallback): void {
    PipelineProcessor.callbackService = callbackService;
  }

  /**
   * Processes input data through the callback service
   * @param {PipelineData} data - Data to be processed
   * @returns {Promise<PipelineData>} Processed data
   */
  async digest(data: PipelineData): Promise<PipelineData> {
    if (PipelineProcessor.callbackService) {
      return await PipelineProcessor.callbackService({
        targetId: this.targetId,
        meta: this.meta,
        data,
      });
    }
    // Return empty object if no callback service is configured
    return {};
  }
}
