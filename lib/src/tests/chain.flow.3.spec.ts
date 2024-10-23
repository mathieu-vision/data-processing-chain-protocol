import { expect } from 'chai';
import sinon from 'sinon';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { PipelineProcessor } from '../core/PipelineProcessor';
import { ChainConfig, NodeSignal, PipelineData } from '../types/types';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { Node } from '../core/Node';

describe('Node Supervisor Chain Flow Test', function () {
  let nodeSupervisor: NodeSupervisor;
  let nodeMonitoring: NodeMonitoring;

  beforeEach(function () {
    nodeSupervisor = NodeSupervisor.retrieveService(true);
    nodeSupervisor.setUid('test');
    const progressTracker = new ProgressTracker(3);
    nodeMonitoring = new NodeMonitoring([], progressTracker);
    nodeSupervisor.setMonitoring(nodeMonitoring);
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should create, prepare, and execute a chain of local nodes', async function () {
    const stub = sinon
      .stub(nodeSupervisor, 'handleRequest')
      .callsFake(async function (this: NodeSupervisor, request) {
        if (request.signal === NodeSignal.NODE_DELETE) {
          return undefined;
        }
        return stub.wrappedMethod.call(this, request);
      });

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

    const digestSpy = sinon.spy(PipelineProcessor.prototype, 'digest');
    const terminateSpy = sinon.spy(Node as any, 'terminate');

    const chainId = nodeSupervisor.createChain(chainConfig);
    expect(chainId, 'expect 1').to.be.a('string');

    await nodeSupervisor.prepareChainDistribution(chainId);

    const nodes = nodeSupervisor.getNodes();
    expect(nodes.size, 'expect 2').to.equal(3);

    const initialData: PipelineData = { input: 'initialData' };
    await nodeSupervisor.startChain(chainId, initialData);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(digestSpy.calledThrice, 'expect 3').to.be.true;

    expect(digestSpy.getCall(0).args[0], 'expect 4').to.have.property(
      'input',
      'initialData',
    );
    expect(digestSpy.getCall(1).args[0], 'expect 5').to.have.property(
      'service1',
      'processed',
    );
    expect(digestSpy.getCall(2).args[0], 'expect 6').to.have.property(
      'service2',
      'processed',
    );

    expect(terminateSpy.calledThrice, 'expect 7').to.be.true;
    expect(terminateSpy.lastCall.args[1], 'expect 8').to.deep.equal([
      {
        input: 'initialData',
        service1: 'processed',
        service2: 'processed',
        service3: 'processed',
      },
    ]);

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed, 'expect 9').to.have.lengthOf(3);
    expect(chainState.pending, 'expect 10').to.be.empty;
    expect(chainState.failed, 'expect 11').to.be.empty;
  });
});
