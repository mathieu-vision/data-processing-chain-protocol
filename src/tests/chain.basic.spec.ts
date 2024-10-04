import { expect } from 'chai';
import sinon from 'sinon';
import { Node } from '../core/Node';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { NodeStatus } from '../types/types';
import { NodeProcessor } from '../core/NodeProcessor';

describe('Basic Node and NodeMonitoring Tests', function () {
  let nodes: Node[];
  let nodeMonitoring: NodeMonitoring;
  let progressTracker: ProgressTracker;

  beforeEach(function () {
    nodes = [new Node(), new Node(['node1']), new Node(['node2'])];

    progressTracker = new ProgressTracker(nodes.length);
    nodeMonitoring = new NodeMonitoring(nodes, progressTracker);
  });

  it('should create nodes with correct dependencies', function () {
    expect(nodes[0].getDependencies()).to.be.empty;
    expect(nodes[1].getDependencies()).to.deep.equal(['node1']);
    expect(nodes[2].getDependencies()).to.deep.equal(['node2']);
  });

  it('should update node status correctly', async function () {
    const nodeId = nodes[0].getId();
    nodeMonitoring.updateNodeStatus(nodeId, NodeStatus.IN_PROGRESS);
    expect(nodes[0].getStatus()).to.equal(NodeStatus.IN_PROGRESS);

    nodeMonitoring.updateNodeStatus(nodeId, NodeStatus.COMPLETED);
    expect(nodes[0].getStatus()).to.equal(NodeStatus.COMPLETED);
  });

  it('should execute node with processors', async function () {
    const node = nodes[0];
    const processor1 = new NodeProcessor();
    const processor2 = new NodeProcessor();

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result2: 'data2' });

    node.addProcessors([processor1, processor2]);

    const results = await node.execute({ initial: 'data' });

    expect(results).to.have.length(1);
    expect(results[0]).to.deep.equal({ result2: 'data2' });

    expect(
      (processor1.digest as sinon.SinonStub).calledWith({ initial: 'data' }),
    ).to.be.true;
    expect(
      (processor2.digest as sinon.SinonStub).calledWith({ result1: 'data1' }),
    ).to.be.true;

    expect(node.getStatus()).to.equal(NodeStatus.COMPLETED);
  });

  it('should execute node with concurrent processor lists', async function () {
    const node = nodes[0];
    const processor1 = new NodeProcessor();
    const processor2 = new NodeProcessor();
    const processor3 = new NodeProcessor();
    const processor4 = new NodeProcessor();

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result2: 'data2' });
    sinon.stub(processor3, 'digest').resolves({ result3: 'data3' });
    sinon.stub(processor4, 'digest').resolves({ result4: 'data4' });

    node.addProcessors([processor1, processor2]);
    node.addProcessors([processor3, processor4]);

    const results = await node.execute({ initial: 'data' });

    expect(results).to.have.length(2);
    expect(results[0]).to.deep.equal({ result2: 'data2' });
    expect(results[1]).to.deep.equal({ result4: 'data4' });

    expect(
      (processor1.digest as sinon.SinonStub).calledWith({ initial: 'data' }),
    ).to.be.true;
    expect(
      (processor2.digest as sinon.SinonStub).calledWith({ result1: 'data1' }),
    ).to.be.true;
    expect(
      (processor3.digest as sinon.SinonStub).calledWith({ initial: 'data' }),
    ).to.be.true;
    expect(
      (processor4.digest as sinon.SinonStub).calledWith({ result3: 'data3' }),
    ).to.be.true;

    expect(node.getStatus()).to.equal(NodeStatus.COMPLETED);
  });

  it('should handle node execution failure', async function () {
    const node = nodes[0];
    const failingProcessor = new NodeProcessor();
    sinon
      .stub(failingProcessor, 'digest')
      .rejects(new Error('Processor failed'));

    node.addProcessors([failingProcessor]);

    try {
      await node.execute({ initial: 'data' });
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error)
        .to.be.an('error')
        .with.property('message', 'Processor failed');
    }

    expect(node.getStatus()).to.equal(NodeStatus.FAILED);
    expect(node.getError())
      .to.be.an('error')
      .with.property('message', 'Processor failed');
  });

  it('should correctly report chain state', function () {
    nodeMonitoring.updateNodeStatus(nodes[0].getId(), NodeStatus.COMPLETED);
    nodeMonitoring.updateNodeStatus(nodes[1].getId(), NodeStatus.IN_PROGRESS);
    nodeMonitoring.updateNodeStatus(nodes[2].getId(), NodeStatus.FAILED);

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.length(1);
    expect(chainState.pending).to.have.length(1);
    expect(chainState.failed).to.have.length(1);
  });
});
