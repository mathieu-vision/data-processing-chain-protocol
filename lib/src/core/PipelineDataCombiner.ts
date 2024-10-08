import { CombineStrategy, CombineFonction, PipelineData } from '../types/types';

export class PipelineDataCombiner {
  private strategy: CombineStrategy.Type;
  private customCombineFunction?: CombineFonction;

  constructor(
    strategy: CombineStrategy.Type = CombineStrategy.MERGE,
    customCombineFunction?: CombineFonction,
  ) {
    this.strategy = strategy;
    this.customCombineFunction = customCombineFunction;
  }

  private merge(dataSets: PipelineData[]): PipelineData {
    return dataSets.flat();
  }

  private union(dataSets: PipelineData[]): PipelineData {
    return Array.from(new Set(this.merge(dataSets)));
  }

  applyStrategy(dataSets: PipelineData[]): PipelineData {
    switch (this.strategy) {
      case CombineStrategy.MERGE:
        return this.merge(dataSets);
      case CombineStrategy.UNION:
        return this.union(dataSets);
      case CombineStrategy.CUSTOM:
        if (this.customCombineFunction) {
          return this.customCombineFunction(dataSets);
        }
        throw new Error('Custom combine function is not defined.');
      default:
        throw new Error(`Unknown combine strategy: ${this.strategy}`);
    }
  }

  setStrategy(strategy: CombineStrategy.Type): void {
    this.strategy = strategy;
  }

  setCustomCombineFunction(combineFunction: CombineFonction): void {
    this.customCombineFunction = combineFunction;
  }
}
