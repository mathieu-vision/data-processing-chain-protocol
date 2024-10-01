import { expect } from 'chai';
import { ChainNode } from '../core/ChainNode';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import sinon from 'sinon';
import { NodeStatus } from '../types/types';

describe('Data Processing Chain Execution', function () {
  let nodes: ChainNode[];
  let nodeMonitoring: NodeMonitoring;
  let progressTracker: ProgressTracker;

  const service1 = sinon.stub().resolves('Service 1 output');
  const service2 = sinon.stub().resolves('Service 2 output');
  const service3 = sinon.stub().resolves('Service 3 output');

  beforeEach(function () {
    nodes = [
      new ChainNode('node1', service1),
      new ChainNode('node2', service2, ['node1']),
      new ChainNode('node3', service3, ['node2']),
    ];

    progressTracker = new ProgressTracker(nodes.length);
    nodeMonitoring = new NodeMonitoring(nodes, progressTracker);
  });

  it('should execute the chain and pass data correctly', async function () {
    const initialData = 'Initial data';
    let currentData = initialData;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const nodeId = node.getId();

      expect(nodeMonitoring.canExecuteNode(nodeId)).to.be.true;

      try {
        currentData = await node.execute(currentData);
        nodeMonitoring.updateNodeStatus(nodeId, NodeStatus.COMPLETED);
      } catch (error) {
        nodeMonitoring.updateNodeStatus(
          nodeId,
          NodeStatus.FAILED,
          error as Error,
        );
      }

      expect(node.getStatus()).to.equal(NodeStatus.COMPLETED);

      const service = i === 0 ? service1 : i === 1 ? service2 : service3;
      expect(service.calledOnce).to.be.true;
      expect(service.firstCall.args[0]).to.equal(
        i === 0 ? initialData : `Service ${i} output`,
      );

      const chainState = nodeMonitoring.getChainState();
      expect(chainState.completed).to.have.length(i + 1);
      expect(chainState.pending).to.have.length(nodes.length - (i + 1));
      expect(chainState.failed).to.be.empty;
    }

    const finalChainState = nodeMonitoring.getChainState();
    expect(finalChainState.completed).to.have.members([
      'node1',
      'node2',
      'node3',
    ]);
    expect(finalChainState.pending).to.be.empty;
    expect(finalChainState.failed).to.be.empty;
  });
});
