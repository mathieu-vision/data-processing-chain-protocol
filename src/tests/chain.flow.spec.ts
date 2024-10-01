import { expect } from 'chai';
import sinon from 'sinon';
import { ConnectorInterface } from '../core/ConnectorInterface';
import { NodeMonitoring } from '../core/NodeMonitoring';
import { ProgressTracker } from '../core/ProgressTracker';
import { NodeStatus } from '../types/types';

describe('ConnectorInterface Chain Execution', function () {
  let connectors: Map<string, ConnectorInterface>;
  let nodeMonitoring: NodeMonitoring;
  let progressTracker: ProgressTracker;

  const processor1 = sinon.stub().resolves('Connector 1 output');
  const processor2 = sinon.stub().resolves('Connector 2 output');
  const processor3 = sinon.stub().resolves('Connector 3 output');

  beforeEach(function () {
    connectors = new Map<string, ConnectorInterface>();

    const connector1 = new ConnectorInterface(
      'connector1',
      processor1,
      [],
      connectors,
    );
    const connector2 = new ConnectorInterface(
      'connector2',
      processor2,
      ['connector1'],
      connectors,
    );
    const connector3 = new ConnectorInterface(
      'connector3',
      processor3,
      ['connector2'],
      connectors,
    );

    connectors.set('connector1', connector1);
    connectors.set('connector2', connector2);
    connectors.set('connector3', connector3);

    connector1.setNextConnector('connector2');
    connector2.setNextConnector('connector3');

    connector1.setMonitoringConnector('monitoringConnector');
    connector2.setMonitoringConnector('monitoringConnector');
    connector3.setMonitoringConnector('monitoringConnector');

    progressTracker = new ProgressTracker(connectors.size);
    nodeMonitoring = new NodeMonitoring(
      Array.from(connectors.values()).map((c) => c.getNode()),
      progressTracker,
    );
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should execute the chain and pass data correctly', async function () {
    const initialData = 'Initial data';

    const result = await connectors
      .get('connector1')!
      .process(initialData, nodeMonitoring);

    expect(result).to.equal('Connector 3 output');

    expect(processor1.calledWith(initialData)).to.be.true;
    expect(processor2.calledWith('Connector 1 output')).to.be.true;
    expect(processor3.calledWith('Connector 2 output')).to.be.true;

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.members([
      'connector1',
      'connector2',
      'connector3',
    ]);
    expect(chainState.pending).to.be.empty;
    expect(chainState.failed).to.be.empty;

    connectors.forEach((connector) => {
      expect(connector.getNode().getStatus()).to.equal(NodeStatus.COMPLETED);
    });
  });

  it('should handle errors in the chain', async function () {
    const errorMessage = 'Processor 2 Error';
    processor2.rejects(new Error(errorMessage));

    const initialData = 'Initial data';

    try {
      await connectors.get('connector1')!.process(initialData, nodeMonitoring);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error).to.be.an('error').with.property('message', errorMessage);
    }

    const chainState = nodeMonitoring.getChainState();
    expect(chainState.completed).to.have.members(['connector1']);
    expect(chainState.failed).to.have.members(['connector2']);
    expect(chainState.pending).to.have.members(['connector3']);

    expect(connectors.get('connector1')!.getNode().getStatus()).to.equal(
      NodeStatus.COMPLETED,
    );
    expect(connectors.get('connector2')!.getNode().getStatus()).to.equal(
      NodeStatus.FAILED,
    );
    expect(connectors.get('connector3')!.getNode().getStatus()).to.equal(
      NodeStatus.PENDING,
    );
  });

  it('should not execute nodes with unmet dependencies', async function () {
    const connectorX = new ConnectorInterface(
      'connectorX',
      sinon.stub(),
      ['nonexistent'],
      connectors,
    );
    connectors.set('connectorX', connectorX);
    nodeMonitoring = new NodeMonitoring(
      Array.from(connectors.values()).map((c) => c.getNode()),
      progressTracker,
    );

    try {
      await connectorX.process('data', nodeMonitoring);
      expect.fail('Should have thrown an error');
    } catch (error) {
      expect(error)
        .to.be.an('error')
        .with.property('message', 'Node connectorX cannot execute yet.');
    }

    expect(connectorX.getNode().getStatus()).to.equal(NodeStatus.PENDING);
  });
});
