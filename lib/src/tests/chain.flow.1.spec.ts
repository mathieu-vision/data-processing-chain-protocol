import { expect } from 'chai';
import sinon from 'sinon';
import { ChainType, NodeSignal } from '../types/types';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { PipelineProcessor } from '../core/PipelineProcessor';
import { MonitoringAgent } from '../agents/MonitoringAgent';

describe('Virtual Connector Chain Execution', function () {
  let nodeSupervisor: NodeSupervisor;
  let monitoring: MonitoringAgent;

  beforeEach(function () {
    nodeSupervisor = NodeSupervisor.retrieveService(true);
    monitoring = MonitoringAgent.retrieveService();
  });

  it('should create and execute a chain of nodes', async function () {
    const chainId = 'chain-01';
    const node1Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: {
        chainType: ChainType.PERSISTANT,
        services: [],
        chainId,
        index: 0,
      },
    })) as string;
    const node2Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: {
        chainType: ChainType.PERSISTANT,
        services: [node1Id],
        chainId,
        index: 1,
      },
    })) as string;
    const node3Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: {
        chainType: ChainType.PERSISTANT,
        services: [node2Id],
        chainId,
        index: 2,
      },
    })) as string;

    const config = { targetId: '' };
    const processor1 = new PipelineProcessor(config);
    const processor2 = new PipelineProcessor(config);
    const processor3 = new PipelineProcessor(config);

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

    const chainState = monitoring.getChainStatus(chainId);
    expect(chainState, 'expect 1').to.not.be.undefined;
    if (chainState) {
      const completedNodes = Object.keys(chainState).filter(
        (nodeId) => chainState[nodeId].node_completed === true,
      );

      expect(completedNodes, 'expect completed nodes').to.have.members([
        node1Id,
        node2Id,
        node3Id,
      ]);
      const pendingNodes = Object.keys(chainState).filter(
        (nodeId) => chainState[nodeId].node_completed === false,
      );
      expect(pendingNodes, 'expect no pending nodes').to.be.empty;
    }
  });

  it('should handle node failure in the chain', async function () {
    const chainId = 'chain-02';
    const node1Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: {
        chainType: ChainType.PERSISTANT,
        services: [],
        chainId,
        index: 0,
      },
    })) as string;
    const node2Id = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: {
        chainType: ChainType.PERSISTANT,
        services: [node1Id],
        chainId,
        index: 1,
      },
    })) as string;

    const config = { targetId: '' };
    const processor1 = new PipelineProcessor(config);
    const failingProcessor = new PipelineProcessor(config);

    sinon.stub(processor1, 'digest').resolves({ result1: 'data1' });
    sinon
      .stub(failingProcessor, 'digest')
      .rejects(new Error('Processor failed'));

    await nodeSupervisor.addProcessors(node1Id, [processor1]);
    await nodeSupervisor.addProcessors(node2Id, [failingProcessor]);

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

    await new Promise((resolve) => setTimeout(resolve, 100));

    const chainState = monitoring.getChainStatus(chainId);
    expect(chainState, 'expect chain state to be defined').to.not.be.undefined;
    if (chainState) {
      const completedNodes = Object.keys(chainState).filter(
        (nodeId) => chainState[nodeId].node_completed === true,
      );
      expect(completedNodes, 'expect node1 to be completed').to.have.members([
        node1Id,
      ]);

      const failedNodes = Object.keys(chainState).filter(
        (nodeId) => chainState[nodeId].node_failed === true,
      );
      expect(failedNodes, 'expect node2 to be failed').to.have.members([
        node2Id,
      ]);
    }
  });
});
