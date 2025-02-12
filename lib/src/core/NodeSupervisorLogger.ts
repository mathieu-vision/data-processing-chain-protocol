import { Logger } from 'utils/Logger';
import { ChainRelation } from '../types/types';
import { Workflow } from '../agents/MonitoringAgent';

export class NodeSupervisorLogger {
  constructor() {}
  logChains(chains: Map<string, ChainRelation>) {
    Logger.info('Logging chains content:');
    chains.forEach((relation, chainId) => {
      Logger.info(`Chain ID: ${chainId}`);
      Logger.info(`Root Node ID: ${relation.rootNodeId || 'None'}`);
      Logger.info(
        `Data Reference: ${JSON.stringify(relation.dataRef, null, 2) || 'None'}`,
      );
      Logger.info('Chain Configuration:');
      relation.config.forEach((nodeConfig, index) => {
        Logger.info(`  Node ${index + 1}:`);
        Logger.info(`    Services: ${JSON.stringify(nodeConfig.services)}`);
        Logger.info(`    Chain ID: ${nodeConfig.chainId}`);
        Logger.info(`    Index: ${nodeConfig.index}`);
        Logger.info(`    Count: ${nodeConfig.count}`);
        Logger.info(`    Location: ${nodeConfig.location}`);
        Logger.info(`    Next Target ID: ${nodeConfig.nextTargetId}`);
        Logger.info(`    Chain Type: ${nodeConfig.chainType}`);
        Logger.info(`    Monitoring Host: ${nodeConfig.monitoringHost}`);
        Logger.info(`    Child Mode: ${nodeConfig.childMode}`);
      });
    });
  }

  logWorkflow(workflow: Workflow) {
    Object.entries(workflow).forEach(([workflowId, node]) => {
      Logger.header(`Workflow Node: ${workflowId}`);
      Object.entries(node).forEach(([key, value]) => {
        Logger.info(`- ${key}: ${JSON.stringify(value)}`);
      });
    });
  }
}
