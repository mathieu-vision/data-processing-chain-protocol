import { expect } from 'chai';
import sinon from 'sinon';
import { MonitoringAgent, ReportingAgent } from '../agents/MonitoringAgent';
import { ChainStatus, ReportingMessage } from '../types/types';

describe('ReportingAgent', () => {
  let monitoringAgent: MonitoringAgent;
  let reportingAgent: ReportingAgent;

  beforeEach(() => {
    monitoringAgent = MonitoringAgent.retrieveService(true);
    ReportingAgent.authorize(monitoringAgent);
    reportingAgent = monitoringAgent.genReportingAgent({
      chainId: 'test-chain',
      nodeId: 'test-node',
      index: 0,
      count: 3,
    });
  });

  it('should be instantiated with correct properties', () => {
    expect(reportingAgent.chainId).to.equal('test-chain');
    expect(reportingAgent.nodeId).to.equal('test-node');
  });

  it('should emit local signals with status notifications', () => {
    const emitSpy = sinon.spy(reportingAgent, 'emit');
    const notification = { status: ChainStatus.NODE_SETUP_COMPLETED };
    reportingAgent.notify(notification);
    expect(emitSpy.calledOnce).to.be.true;
    expect(emitSpy.firstCall.args[0]).to.equal('local-signal');
    expect(emitSpy.firstCall.args[1]).to.deep.equal(notification);
  });

  it('should emit global signals when specified', () => {
    const emitSpy = sinon.spy(reportingAgent, 'emit');
    const notification = { status: ChainStatus.NODE_COMPLETED };
    reportingAgent.notify(notification, 'global-signal');
    expect(emitSpy.calledOnce).to.be.true;
    expect(emitSpy.firstCall.args[0]).to.equal('global-signal');
    expect(emitSpy.firstCall.args[1]).to.deep.equal(notification);
  });

  it('should track signaled statuses', () => {
    reportingAgent.notify({ status: ChainStatus.NODE_PENDING });
    reportingAgent.notify({ status: ChainStatus.NODE_IN_PROGRESS });
    const signals = reportingAgent.getSignals();
    expect(signals).to.deep.equal([
      ChainStatus.NODE_PENDING,
      ChainStatus.NODE_IN_PROGRESS,
    ]);
  });
});

describe('MonitoringAgent', () => {
  let monitoringAgent: MonitoringAgent;
  let reportingCallback: sinon.SinonStub;

  beforeEach(() => {
    monitoringAgent = MonitoringAgent.retrieveService(true);
    reportingCallback = sinon.stub();
    monitoringAgent.setReportingCallback(reportingCallback);
  });

  it('should implement singleton pattern', () => {
    const instance1 = MonitoringAgent.retrieveService();
    const instance2 = MonitoringAgent.retrieveService();
    expect(instance1).to.equal(instance2);
    const refreshedInstance = MonitoringAgent.retrieveService(true);
    expect(refreshedInstance).not.to.equal(instance1);
  });

  it('should set and get chain status', () => {
    const chainId = 'test-chain';
    const status = { node1: { completed: true } };
    monitoringAgent.getWorkflow()[chainId] = { status };
    expect(monitoringAgent.getChainStatus(chainId)).to.deep.equal(status);
  });

  it('should generate ReportingAgent instances', () => {
    ReportingAgent.authorize(monitoringAgent);
    const reportingAgent = monitoringAgent.genReportingAgent({
      chainId: 'test-chain',
      nodeId: 'test-node',
      index: 0,
      count: 3,
    });
    expect(reportingAgent).to.be.instanceOf(ReportingAgent);
    expect(reportingAgent.chainId).to.equal('test-chain');
  });

  it('should handle local-signal events', async () => {
    ReportingAgent.authorize(monitoringAgent);
    const reportingAgent = monitoringAgent.genReportingAgent({
      chainId: 'test-chain',
      nodeId: 'test-node',
      index: 0,
      count: 3,
    });
    const notification = { status: ChainStatus.NODE_SETUP_COMPLETED };
    reportingAgent.notify(notification, 'local-signal');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const status = monitoringAgent.getChainStatus('test-chain');
    expect(status).to.deep.equal({
      'test-node': { [ChainStatus.NODE_SETUP_COMPLETED]: true },
    });
  });

  it('should handle global-signal events', async () => {
    ReportingAgent.authorize(monitoringAgent);
    const reportingAgent = monitoringAgent.genReportingAgent({
      chainId: 'test-chain',
      nodeId: 'test-node',
      index: 0,
      count: 3,
    });
    const notification = { status: ChainStatus.NODE_COMPLETED };
    reportingAgent.notify(notification, 'global-signal');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(reportingCallback.calledOnce).to.be.true;
    const message: ReportingMessage = reportingCallback.firstCall.args[0];
    expect(message.chainId).to.equal('test-chain');
    expect(message.nodeId).to.equal('test-node');
    expect(message.signal).to.deep.equal(notification);
  });
});
