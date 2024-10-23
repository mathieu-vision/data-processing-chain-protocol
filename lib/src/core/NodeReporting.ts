import { NodeMonitoring } from './NodeMonitoring';

// Node monitoring and status reporting agent
export abstract class NodeReporting {
  private static authorizedController: NodeMonitoring | null = null;

  constructor() {
    if (!(NodeReporting.authorizedController instanceof NodeMonitoring)) {
      throw new Error(
        'Node Reporter needs to be instantiated by a Node Controller',
      );
    }
    NodeReporting.authorizedController = null;
  }

  static authorize(controller: NodeMonitoring) {
    NodeReporting.authorizedController = controller;
  }
}
