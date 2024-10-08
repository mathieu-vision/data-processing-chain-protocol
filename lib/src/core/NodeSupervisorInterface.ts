import { Logger } from '../libs/Logger';
import { NodeSignal } from '../types/types';
import { NodeSupervisor } from './NodeSupervisor';

interface SupervisorPayload {
  signal: NodeSignal.Type;
  [key: string]: any;
}

export class NodeSupervisorInterface {
  private nodeSupervisor: NodeSupervisor;

  constructor(nodeSupervisor: NodeSupervisor) {
    this.nodeSupervisor = nodeSupervisor;
  }

  async handleRequest(payload: SupervisorPayload): Promise<any> {
    switch (payload.signal) {
      case NodeSignal.NODE_CREATE:
        return this.nodeSupervisor.createNode(payload.params);
      case NodeSignal.NODE_DELETE:
        return this.nodeSupervisor.deleteNode(payload.id);
      case NodeSignal.NODE_PAUSE:
        return this.nodeSupervisor.pauseNode(payload.id);
      case NodeSignal.NODE_DELAY:
        return this.nodeSupervisor.delayNode(payload.id, payload.delay);
      case NodeSignal.NODE_RUN:
        await this.nodeSupervisor.runNode(payload.id, payload.data);
        return { message: `Node ${payload.id} execution started` };
      case NodeSignal.NODE_SEND_DATA:
        await this.nodeSupervisor.sendNodeData(payload.id, payload.data);
        return { message: `Data sent to node ${payload.id}` };
      default:
        Logger.warn({
          message: `Unknown signal received: ${payload.signal}`,
        });
    }
  }
}
