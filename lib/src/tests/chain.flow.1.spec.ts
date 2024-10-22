import { expect } from 'chai';
import sinon from 'sinon';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { ChainType, NodeSignal } from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { PipelineProcessor } from '../core/PipelineProcessor';

describe('Virtual Connector Chain Execution', function () {
  let nodeSupervisor: NodeSupervisor;
  let nodeMonitoring: NodeMonitoring;

  beforeEach(function () {
    const progressTracker = new ProgressTracker(3);
    nodeMonitoring = new NodeMonitoring([], progressTracker);
    nodeSupervisor = NodeSupervisor.retrieveService(true);
    nodeSupervisor.setMonitoring(nodeMonitoring);
  });

  it('should create and execute a chain of nodes', async function () {
    const node1Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: { chainType: ChainType.PERSISTANT, services: [] },
    })) as string;
    const node2Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: { chainType: ChainType.PERSISTANT, services: [node1Id] },
    })) as string;
    const node3Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: { chainType: ChainType.PERSISTANT, services: [node2Id] },
    })) as string;

    const processor1 = new PipelineProcessor('');
    const processor2 = new PipelineProcessor('');
    const processor3 = new PipelineProcessor('');

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result2: 'data2' });
    sinon.stub(processor3, 'digest').resolves({ result3: 'data3' });

    await nodeSupervisor.addProcessors(node1Id, [processor1]);
    await nodeSupervisor.addProcessors(node2Id, [processor2]);
    await nodeSupervisor.addProcessors(node3Id, [processor3]);

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node1Id,
      data: { initial: 'data' },
    });

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node2Id,
      data: { initial: 'data', result1: 'data1' },
    });

    await nodeSupervisor.handleRequest({
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
    const node1Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: { chainType: ChainType.PERSISTANT, services: [] },
    })) as string;
    const node2Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: { chainType: ChainType.PERSISTANT, services: [node1Id] },
    })) as string;

    const failingProcessor = new PipelineProcessor('');
    sinon
      .stub(failingProcessor, 'digest')
      .rejects(new Error('Processor failed'));

    await nodeSupervisor.addProcessors(node2Id, [failingProcessor]);

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node1Id,
      data: { initial: 'data' },
    });

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: node2Id,
      data: { initial: 'data' },
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.members([node1Id]);
    expect(chainState.failed).to.have.members([node2Id]);
  });

  // todo: fix dependencies

  // it('should respect node dependencies', async function () {
  //   const node1Id = (await nodeSupervisor.handleRequest({
  //     signal: NodeSignal.NODE_CREATE,
  //     params: [],
  //   })) as string;
  //   const node2Id = (await nodeSupervisor.handleRequest({
  //     signal: NodeSignal.NODE_CREATE,
  //     // dependencies
  //     params: [node1Id],
  //   })) as string;

  //   expect(nodeMonitoring.canExecuteNode(node1Id), 'a').to.be.true;
  //   expect(nodeMonitoring.canExecuteNode(node2Id), 'b').to.be.false;

  //   await nodeSupervisor.handleRequest({
  //     signal: NodeSignal.NODE_RUN,
  //     id: node1Id,
  //     data: { initial: 'data' },
  //   });

  //   await new Promise((resolve) => setTimeout(resolve, 0));

  //   expect(nodeMonitoring.canExecuteNode(node2Id), 'c').to.be.true;
  // });
});
