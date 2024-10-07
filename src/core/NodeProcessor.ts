import { PipelineData } from 'types/types';

export class NodeProcessor {
  async digest(data: PipelineData): Promise<any> {
    // Todo : call related service to transform of manipulate data
    return {};
  }
}
