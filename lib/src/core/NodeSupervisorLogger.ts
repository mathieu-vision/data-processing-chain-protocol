import { Logger } from '../utils/Logger';
import { ChainRelation } from '../types/types';
import { Workflow } from '../agents/MonitoringAgent';

export class NodeSupervisorLogger {
  constructor() {}
  logChains(chains: Map<string, ChainRelation>) {
    Logger.debug('--Logging chains content:');
    chains.forEach((relation, chainId) => {
      Logger.debug(`Chain ID: ${chainId}`);
      Logger.debug(`Root Node ID: ${relation.rootNodeId || 'None'}`);
      Logger.debug(
        `Data Reference: ${JSON.stringify(relation.dataRef, null, 2) || 'None'}`,
      );
      Logger.debug('Chain Configuration:');
      relation.config.forEach((nodeConfig, index) => {
        Logger.debug(`  Node ${index + 1}:`);
        Logger.debug(`    Services: ${JSON.stringify(nodeConfig.services)}`);
        Logger.debug(`    Chain ID: ${nodeConfig.chainId}`);
        Logger.debug(`    Index: ${nodeConfig.index}`);
        Logger.debug(`    Count: ${nodeConfig.count}`);
        Logger.debug(`    Location: ${nodeConfig.location}`);
        Logger.debug(`    Next Target ID: ${nodeConfig.nextTargetId}`);
        Logger.debug(`    Chain Type: ${nodeConfig.chainType}`);
        Logger.debug(`    Monitoring Host: ${nodeConfig.monitoringHost}`);
        Logger.debug(`    Child Mode: ${nodeConfig.childMode}`);
      });
    });
  }

  logWorkflow(workflow: Workflow) {
    Logger.debug('--Logging chains content:');
    Object.entries(workflow).forEach(([workflowId, node]) => {
      Logger.header(`Workflow Node: ${workflowId}`);
      Object.entries(node).forEach(([key, value]) => {
        Logger.debug(`- ${key}: ${JSON.stringify(value)}`);
      });
    });
  }
}
