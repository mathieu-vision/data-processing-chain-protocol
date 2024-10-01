import { ChainNode } from './ChainNode';
import { NodeStatus } from '../types/types';
import { NodeMonitoring } from './NodeMonitoring';
import { Logger } from '../libs/Logger';

export class ConnectorInterface {
  private node: ChainNode;
  private nextConnectorId: string | null = null;
  private monitoringConnectorId: string | null = null;
  private connectorMap: Map<string, ConnectorInterface>;

  constructor(
    id: string,
    processor: (data: any) => Promise<any>,
    dependencies: string[] = [],
    connectorMap: Map<string, ConnectorInterface>,
  ) {
    this.node = new ChainNode(id, processor, dependencies);
    this.connectorMap = connectorMap;
  }

  setNextConnector(connectorId: string) {
    this.nextConnectorId = connectorId;
  }

  setMonitoringConnector(connectorId: string) {
    this.monitoringConnectorId = connectorId;
  }

  async process(data: any, nodeMonitoring?: NodeMonitoring): Promise<any> {
    if (nodeMonitoring) {
      if (!nodeMonitoring.canExecuteNode(this.node.getId())) {
        throw new Error(`Node ${this.node.getId()} cannot execute yet.`);
      }
    }

    try {
      const result = await this.node.execute(data);
      this.updateStatus(NodeStatus.COMPLETED, nodeMonitoring);

      // Pass control to the next connector if it exists
      if (this.nextConnectorId) {
        const nextConnector = this.connectorMap.get(this.nextConnectorId);
        if (nextConnector) {
          Logger.info({
            message: `Passing control to next connector ${this.nextConnectorId}`,
          });
          return nextConnector.process(result, nodeMonitoring);
        } else {
          throw new Error(`Next connector ${this.nextConnectorId} not found`);
        }
      }

      return result;
    } catch (error) {
      this.updateStatus(NodeStatus.FAILED, nodeMonitoring, error as Error);
      throw error;
    }
  }

  private updateStatus(
    status: NodeStatus.Type,
    nodeMonitoring?: NodeMonitoring,
    error?: Error,
  ) {
    if (nodeMonitoring) {
      nodeMonitoring.updateNodeStatus(this.node.getId(), status, error);
    }
    if (this.monitoringConnectorId) {
      // Todo: notify distant monitoring connector
      Logger.info({
        message: `Notifying monitoring connector ${this.monitoringConnectorId}: ${status}`,
      });
    }
  }

  getId(): string {
    return this.node.getId();
  }

  getNode(): ChainNode {
    return this.node;
  }
}
