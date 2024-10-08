import { expect } from 'chai';
import sinon from 'sinon';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { NodeSignal } from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeSupervisorInterface } from '../core/NodeSupervisorInterface';
import { NodeProcessor } from '../core/NodeProcessor';

describe('Virtual Connector Chain Execution', function () {
  let nodeSupervisor: NodeSupervisor;
  let nodeMonitoring: NodeMonitoring;
  let supervisorInterface: NodeSupervisorInterface;

  beforeEach(function () {
    const progressTracker = new ProgressTracker(3);
    nodeMonitoring = new NodeMonitoring([], progressTracker);
    nodeSupervisor = new NodeSupervisor(nodeMonitoring);
    supervisorInterface = new NodeSupervisorInterface(nodeSupervisor);
  });

  it('should create and execute a chain of nodes', async function () {
    const node1Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    });
    const node2Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [node1Id],
    });
    const node3Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [node2Id],
    });

    const processor1 = new NodeProcessor();
    const processor2 = new NodeProcessor();
    const processor3 = new NodeProcessor();

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result2: 'data2' });
    sinon.stub(processor3, 'digest').resolves({ result3: 'data3' });

    await nodeSupervisor.addProcessors(node1Id, [processor1]);
    await nodeSupervisor.addProcessors(node2Id, [processor2]);
    await nodeSupervisor.addProcessors(node3Id, [processor3]);

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node1Id,
      data: { initial: 'data' },
    });

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node2Id,
      data: { initial: 'data', result1: 'data1' },
    });

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node3Id,
      data: { initial: 'data', result1: 'data1', result2: 'data2' },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.members([node1Id, node2Id, node3Id]);
    expect(chainState.pending).to.be.empty;
    expect(chainState.failed).to.be.empty;
  });

  it('should handle node failure in the chain', async function () {
    const node1Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    });
    const node2Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [node1Id],
    });

    const failingProcessor = new NodeProcessor();
    sinon
      .stub(failingProcessor, 'digest')
      .rejects(new Error('Processor failed'));

    await nodeSupervisor.addProcessors(node2Id, [failingProcessor]);

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node1Id,
      data: { initial: 'data' },
    });

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node2Id,
      data: { initial: 'data' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.members([node1Id]);
    expect(chainState.failed).to.have.members([node2Id]);
  });

  it('should respect node dependencies', async function () {
    const node1Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    });
    const node2Id = await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [node1Id],
    });

    expect(nodeMonitoring.canExecuteNode(node1Id)).to.be.true;
    expect(nodeMonitoring.canExecuteNode(node2Id)).to.be.false;

    await supervisorInterface.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node1Id,
      data: { initial: 'data' },
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(nodeMonitoring.canExecuteNode(node2Id)).to.be.true;
  });
});
