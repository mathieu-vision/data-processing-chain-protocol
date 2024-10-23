import { NodeReporting } from './NodeReporting';

export class NodeReportingAgent extends NodeReporting {}

// Receive reports from NodeReporters
export class NodeMonitoring {
  private static instance: NodeMonitoring;

  constructor() {}

  static retrieveService(refresh: boolean = false): NodeMonitoring {
    if (!NodeMonitoring.instance || refresh) {
      const instance = new NodeMonitoring();
      NodeMonitoring.instance = instance;
    }
    return NodeMonitoring.instance;
  }

  getReporterAgent() {
    NodeReportingAgent.authorize(this);
    const reporter = new NodeReportingAgent();
    // todo: put the agent in a local list of reporters
    return reporter;
  }

  // todo: pull messages/states from reporters
}
