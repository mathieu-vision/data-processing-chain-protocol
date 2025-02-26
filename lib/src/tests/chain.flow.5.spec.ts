import { expect } from 'chai';
import sinon from 'sinon';
import { NodeStatusManager } from '../core/NodeStatusManager';
import { Node } from '../core/Node';
import { NodeSignal, ChainStatus } from '../types/types';

describe('NodeStatusManager', () => {
  let nodeStatusManager: NodeStatusManager;
  let node: Node;
  beforeEach(() => {
    node = {
      getId: sinon.stub().returns('test-node'),
      execute: sinon.stub().resolves(),
    } as any;

    nodeStatusManager = new NodeStatusManager(node);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should enqueue and process signals correctly', async () => {
    await nodeStatusManager.enqueueSignals([
      NodeSignal.NODE_SETUP,
      NodeSignal.NODE_RUN,
    ]);
    await nodeStatusManager.process();
    const queueState = nodeStatusManager.getQueueState();
    expect(queueState.cursor).to.equal(2);
  });

  it('should handle suspend and resume signals', async () => {
    await nodeStatusManager.enqueueSignals([NodeSignal.NODE_SUSPEND]);
    await nodeStatusManager.process();
    expect(nodeStatusManager['status']).to.include(ChainStatus.NODE_SUSPENDED);

    const mockGenerator = {} as any;
    const mockBatch = {} as any;
    const mockData = {} as any;
    nodeStatusManager.suspendExecution(mockGenerator, mockBatch, mockData);
    const suspendedState = nodeStatusManager.getSuspendedState();
    expect(suspendedState).to.deep.equal({
      generator: mockGenerator,
      currentBatch: mockBatch,
      data: mockData,
    });

    await nodeStatusManager.enqueueSignals([NodeSignal.NODE_RESUME]);
    await nodeStatusManager.process();
    expect(nodeStatusManager['status']).not.to.include(
      ChainStatus.NODE_SUSPENDED,
    );
    expect((node.execute as sinon.SinonStub).calledOnceWith(mockData)).to.be
      .true;
  });

  it('should update the signal queue correctly', async () => {
    await nodeStatusManager.enqueueSignals([NodeSignal.NODE_SETUP]);
    nodeStatusManager.updateQueue([
      NodeSignal.NODE_RUN,
      NodeSignal.NODE_SEND_DATA,
    ]);
    const queueState = nodeStatusManager.getQueueState();
    expect(queueState.queue).to.deep.equal([
      NodeSignal.NODE_RUN,
      NodeSignal.NODE_SEND_DATA,
    ]);
    expect(queueState.cursor).to.equal(0);
  });

  it('should log a warning for unknown signals', async () => {
    await nodeStatusManager.enqueueSignals([
      'unknown_signal' as NodeSignal.Type,
    ]);
    await nodeStatusManager.process();
    const queueState = nodeStatusManager.getQueueState();
    expect(queueState.cursor).to.equal(1);
  });

  it('should correctly check if node is suspended', () => {
    expect(nodeStatusManager.isSuspended()).to.be.false;
    nodeStatusManager['status'].push(ChainStatus.NODE_SUSPENDED);
    expect(nodeStatusManager.isSuspended()).to.be.true;
  });

  it('should process NODE_RESUME immediately when enqueued as first signal', async () => {
    nodeStatusManager['status'].push(ChainStatus.NODE_SUSPENDED);
    const mockData = {} as any;
    nodeStatusManager.suspendExecution({} as any, {} as any, mockData);
    await nodeStatusManager.enqueueSignals([
      NodeSignal.NODE_RESUME,
      NodeSignal.NODE_RUN,
    ]);
    expect(nodeStatusManager['status']).not.to.include(
      ChainStatus.NODE_SUSPENDED,
    );
    expect((node.execute as sinon.SinonStub).calledOnceWith(mockData)).to.be
      .true;
    const queueState = nodeStatusManager.getQueueState();
    expect(queueState.cursor).to.equal(2);
  });
});
