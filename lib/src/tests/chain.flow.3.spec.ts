import { expect } from 'chai';
import sinon from 'sinon';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { PipelineProcessor } from '../core/PipelineProcessor';
import { ChainConfig, NodeSignal, NodeStatus } from '../types/types';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';

describe('Node Supervisor Chain Flow Test', function () {
  let nodeSupervisor: NodeSupervisor;
  let nodeMonitoring: NodeMonitoring;
  let broadcastCallback: sinon.SinonStub;

  beforeEach(function () {
    nodeSupervisor = NodeSupervisor.retrieveService();
    const progressTracker = new ProgressTracker(3);
    nodeMonitoring = new NodeMonitoring([], progressTracker);
    nodeSupervisor.setMonitoring(nodeMonitoring);
    broadcastCallback = sinon.stub().resolves();
    nodeSupervisor.setBroadcastCreationCallback(broadcastCallback);
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should create and execute a chain of local nodes', async function () {
    const chainConfig: ChainConfig[] = [
      { services: ['service1'], location: 'local' },
      { services: ['service2'], location: 'local' },
      { services: ['service3'], location: 'local' },
    ];
    nodeSupervisor.setChainConfig(chainConfig);

    const processor1 = new PipelineProcessor('service1');
    const processor2 = new PipelineProcessor('service2');
    const processor3 = new PipelineProcessor('service3');

    sinon.stub(processor1, 'digest').resolves({ result: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ result: 'data2' });
    sinon.stub(processor3, 'digest').resolves({ result: 'data3' });

    const createNodeSpy = sinon.spy(nodeSupervisor, 'createNode' as any);

    await nodeSupervisor.prepareChainDistribution();

    expect(createNodeSpy.callCount).to.equal(3);
    expect(broadcastCallback.called).to.be.false;

    const nodes = nodeSupervisor.getNodes();
    const nodeIds = Array.from(nodes.keys());

    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const processor = [processor1, processor2, processor3][i];
      await nodeSupervisor.addProcessors(nodeId, [processor]);

      await nodeSupervisor.handleRequest({
        signal: NodeSignal.NODE_RUN,
        id: nodeId,
        data: { input: `data${i + 1}` },
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      const node = nodes.get(nodeId);
      expect(node?.getStatus()).to.equal(NodeStatus.COMPLETED);

      if (i < nodeIds.length - 1) {
        const nextNodeId = nodeIds[i + 1];
        node?.setNextNode(nextNodeId, 'local');
      }

      await nodeSupervisor.handleRequest({
        signal: NodeSignal.NODE_SEND_DATA,
        id: nodeId,
      });
    }

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.lengthOf(3);
    expect(chainState.pending).to.be.empty;
    expect(chainState.failed).to.be.empty;
  });
});
