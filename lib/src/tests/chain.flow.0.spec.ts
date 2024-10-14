import { expect } from 'chai';
import sinon from 'sinon';
import { Node } from '../core/Node';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { NodeStatus } from '../types/types';
import { PipelineProcessor } from '../core/PipelineProcessor';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeSignal } from '../types/types';

describe('Node System Tests', function () {
  let nodes: Node[];
  let nodeMonitoring: NodeMonitoring;
  let progressTracker: ProgressTracker;
  let nodeSupervisor: NodeSupervisor;

  beforeEach(function () {
    nodes = [new Node(), new Node(['node1']), new Node(['node2'])];
    progressTracker = new ProgressTracker(nodes.length);
    nodeMonitoring = new NodeMonitoring(nodes, progressTracker);
    nodeSupervisor = new NodeSupervisor();
    nodeSupervisor.setMonitoring(nodeMonitoring);
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
    const processor1 = new PipelineProcessor('');
    const processor2 = new PipelineProcessor('');

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result2: 'data2' });

    node.addPipeline([processor1, processor2]);

    await node.execute({ initial: 'data' });
    await node.getExecutionQueue();

    expect(
      (processor1.digest as sinon.SinonStub).calledWith({ initial: 'data' }),
    ).to.be.true;
    expect(
      (processor2.digest as sinon.SinonStub).calledWith({ result1: 'data1' }),
    ).to.be.true;

    expect(node.getStatus()).to.equal(NodeStatus.COMPLETED);
  });

  it('should handle node execution failure', async function () {
    const node = nodes[0];
    const failingProcessor = new PipelineProcessor('');
    sinon
      .stub(failingProcessor, 'digest')
      .rejects(new Error('Processor failed'));

    node.addPipeline([failingProcessor]);

    await node.execute({ initial: 'data' });
    await new Promise((resolve) => setTimeout(resolve, 10));

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

  it('should create and run a node through the supervisor', async function () {
    const nodeId = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    })) as string;

    const processor = new PipelineProcessor('');
    sinon.stub(processor, 'digest').resolves({ result: 'processed data' });

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: nodeId,
      data: { initial: 'data' },
    });

    const node = nodeSupervisor['nodes'].get(nodeId);
    expect(node).to.exist;
    expect(node!.getStatus()).to.equal(NodeStatus.COMPLETED);
  });

  it('should send data to a node through the supervisor interface', async function () {
    const nodeId = await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    });

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: nodeId,
      data: { newData: 'test' },
    });

    // Todo: review
  });
});
