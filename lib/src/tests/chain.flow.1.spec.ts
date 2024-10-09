import { expect } from 'chai';
import sinon from 'sinon';
import { NodeSupervisor } from '../core/NodeSupervisor';
import { NodeProcessor } from '../core/NodeProcessor';
import { NodeSignal, PipelineData } from '../types/types';

describe('Node Supervisor Flow Test', function () {
  let nodeSupervisor: NodeSupervisor;
  let terminateStub: sinon.SinonStub;

  beforeEach(function () {
    nodeSupervisor = NodeSupervisor.retrieveService();
    terminateStub = sinon.stub(NodeSupervisor, 'terminate');
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should create a node, process data, and send output', async function () {
    const nodeId = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    })) as string;

    const processor1 = new NodeProcessor('');
    sinon.stub(processor1, 'digest').resolves({ processed: 'data1' });

    await nodeSupervisor.addProcessors(nodeId, [processor1]);

    const initialData: PipelineData = { input: 'data' };
    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: nodeId,
      data: initialData,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: nodeId,
    });

    expect(terminateStub.calledWith(nodeId, [{ processed: 'data1' }])).to.be
      .true;
  });

  it('should handle multiple processors and output correctly', async function () {
    const nodeId = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    })) as string;

    const processor1 = new NodeProcessor('');
    const processor2 = new NodeProcessor('');

    sinon.stub(processor1, 'digest').resolves({ processed: 'data1' });
    sinon.stub(processor2, 'digest').resolves({ processed: 'data2' });

    await nodeSupervisor.addProcessors(nodeId, [processor1]);
    await nodeSupervisor.addProcessors(nodeId, [processor2]);

    const initialData: PipelineData = { input: 'data' };
    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: nodeId,
      data: initialData,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: nodeId,
    });

    const expectedOutput = [{ processed: 'data1' }, { processed: 'data2' }];

    expect(terminateStub.calledWith(nodeId, expectedOutput)).to.be.true;
  });

  it('should handle delayed node execution', async function () {
    const nodeId = (await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_CREATE,
      params: [],
    })) as string;

    const processor1 = new NodeProcessor('');
    sinon.stub(processor1, 'digest').resolves({ processed: 'data1' });

    await nodeSupervisor.addProcessors(nodeId, [processor1]);

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_DELAY,
      id: nodeId,
      delay: 200,
    });

    const initialData: PipelineData = { input: 'data' };
    const start = Date.now();
    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_RUN,
      id: nodeId,
      data: initialData,
    });

    await new Promise((resolve) => setTimeout(resolve, 300));

    const end = Date.now();
    expect(end - start).to.be.greaterThan(200);

    await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: nodeId,
    });

    expect(terminateStub.calledWith(nodeId, [{ processed: 'data1' }])).to.be
      .true;
  });
});
