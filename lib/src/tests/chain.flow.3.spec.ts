import { expect } from 'chai';
import sinon from 'sinon';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { PipelineProcessor } from '../core/PipelineProcessor';
import { ChainConfig, PipelineData } from '../types/types';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';

describe('Node Supervisor Chain Flow Test', function () {
  let nodeSupervisor: NodeSupervisor;
  let nodeMonitoring: NodeMonitoring;
  let broadcastCallback: sinon.SinonStub;

  beforeEach(function () {
    nodeSupervisor = NodeSupervisor.retrieveService();
    nodeSupervisor.setUid('test');
    const progressTracker = new ProgressTracker(3);
    nodeMonitoring = new NodeMonitoring([], progressTracker);
    nodeSupervisor.setMonitoring(nodeMonitoring);
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should create, prepare, and execute a chain of local nodes', async function () {
    const chainConfig: ChainConfig = [
      { services: ['service1'], location: 'local' },
      { services: ['service2'], location: 'local' },
      { services: ['service3'], location: 'local' },
    ];

    let callOrder: string[] = [];
    PipelineProcessor.setCallbackService(({ targetId, data }) => {
      callOrder.push(targetId);
      return Promise.resolve({ ...(data as any), [targetId]: 'processed' });
    });

    const chainId = nodeSupervisor.createChain(chainConfig);
    expect(chainId).to.be.a('string');

    await nodeSupervisor.prepareChainDistribution(chainId);

    const nodes = nodeSupervisor.getNodes();
    expect(nodes.size).to.equal(3);

    const initialData: PipelineData = { input: 'initialData' };
    await nodeSupervisor.startChain(chainId, initialData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.lengthOf(3);
    // expect(chainState.pending).to.be.empty;
    // expect(chainState.failed).to.be.empty;

    // expect(callOrder).to.deep.equal(['service1', 'service2', 'service3']);

    /*
    const lastNodeId = Array.from(nodes.keys())[2];
    const lastNode = nodes.get(lastNodeId);
    // Todo:
    expect(lastNode?.getOutput()).to.deep.equal([
      {
        input: 'initialData',
        service1: 'processed',
        service2: 'processed',
        service3: 'processed',
      },
    ]);

    expect(broadcastCallback.called).to.be.false;
    */
  });
});
