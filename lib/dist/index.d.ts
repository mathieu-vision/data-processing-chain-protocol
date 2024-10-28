declare class PipelineProcessor {
    static callbackService: ProcessorCallback;
    private meta?;
    private targetId;
    constructor(config: ServiceConfig);
    static setCallbackService(callbackService: ProcessorCallback): void;
    digest(data: PipelineData): Promise<PipelineData>;
}

type ProcessorPipeline = PipelineProcessor[];
type PipelineData = unknown;
interface PipelineMeta {
    header?: unknown;
    resolver?: string;
    monitoringHost?: string;
    configuration: unknown;
}
interface CallbackPayload {
    chainId?: string;
    targetId: string;
    data: PipelineData;
    meta?: PipelineMeta;
}
type ServiceCallback = (payload: CallbackPayload) => void;
type SetupCallback = (message: BrodcastSetupMessage) => Promise<void>;
type ReportingCallback = (message: ReportingMessage) => Promise<void>;
type BroadcastReportingCallback = (message: BroadcastReportingMessage) => Promise<void>;
type ProcessorCallback = (payload: CallbackPayload) => Promise<PipelineData>;
declare namespace NodeType {
    type Type = 'local' | 'remote';
    const LOCAL: Type;
    const REMOTE: Type;
}
declare namespace DataType {
    type Type = 'raw' | 'compressed';
    const RAW: Type;
    const COMPRESSED: Type;
}
declare namespace CombineStrategy {
    type Type = 'merge' | 'union' | 'custom';
    const MERGE: Type;
    const UNION: Type;
    const CUSTOM: Type;
}
type CombineFonction = (dataSets: PipelineData[]) => unknown[];
interface ChainState {
    completed: string[];
    pending: string[];
    failed: string[];
}
declare namespace ChainType {
    type Type = 0b0000010 | 0b00000001;
    const PERSISTANT: Type;
    const DEFAULT: Type;
}
declare namespace ChainStatus {
    type Type = 'node_pending' | 'node_in-progress' | 'node_completed' | 'node_failed' | 'node_paused' | 'node_setup_completed' | 'chain_setup_completed';
    const NODE_PAUSED: Type;
    const NODE_PENDING: Type;
    const NODE_IN_PROGRESS: Type;
    const NODE_COMPLETED: Type;
    const NODE_FAILED: Type;
    const NODE_SETUP_COMPLETED: Type;
    const CHAIN_SETUP_COMPLETED: Type;
}
declare namespace NodeSignal {
    type Type = 'node_setup' | 'node_create' | 'node_delete' | 'node_pause' | 'node_delay' | 'node_run' | 'node_send_data' | 'chain_prepare' | 'chain_start' | 'chain_deploy';
    const NODE_SETUP: Type;
    const NODE_CREATE: Type;
    const NODE_DELETE: Type;
    const NODE_PAUSE: Type;
    const NODE_DELAY: Type;
    const NODE_RUN: Type;
    const NODE_SEND_DATA: Type;
    const CHAIN_PREPARE: Type;
    const CHAIN_START: Type;
    const CHAIN_DEPLOY: Type;
}
type SupervisorPayloadSetup = {
    signal: typeof NodeSignal.NODE_SETUP;
    config: NodeConfig;
};
type SupervisorPayloadCreate = {
    signal: typeof NodeSignal.NODE_CREATE;
    params: NodeConfig;
};
type SupervisorPayloadDelete = {
    signal: typeof NodeSignal.NODE_DELETE;
    id: string;
};
type SupervisorPayloadPause = {
    signal: typeof NodeSignal.NODE_PAUSE;
    id: string;
};
type SupervisorPayloadDelay = {
    signal: typeof NodeSignal.NODE_DELAY;
    id: string;
    delay: number;
};
type SupervisorPayloadRun = {
    signal: typeof NodeSignal.NODE_RUN;
    id: string;
    data: PipelineData;
};
type SupervisorPayloadSendData = {
    signal: typeof NodeSignal.NODE_SEND_DATA;
    id: string;
};
type SupervisorPayloadPrepareChain = {
    signal: typeof NodeSignal.CHAIN_PREPARE;
    id: string;
};
type SupervisorPayloadStartChain = {
    signal: typeof NodeSignal.CHAIN_START;
    id: string;
    data: PipelineData;
};
type SupervisorPayloadDeployChain = {
    signal: typeof NodeSignal.CHAIN_DEPLOY;
    config: ChainConfig;
    data: PipelineData;
};
type SupervisorPayload = SupervisorPayloadSetup | SupervisorPayloadCreate | SupervisorPayloadDelete | SupervisorPayloadPause | SupervisorPayloadDelay | SupervisorPayloadRun | SupervisorPayloadSendData | SupervisorPayloadPrepareChain | SupervisorPayloadStartChain | SupervisorPayloadDeployChain;
interface ServiceConfig {
    targetId: string;
    meta?: PipelineMeta;
}
type NodeConfig = {
    services: (string | ServiceConfig)[];
    chainId: string;
    index?: number;
    location?: NodeType.Type;
    nextTargetId?: string;
    nextMeta?: PipelineMeta;
    chainType?: ChainType.Type;
    monitoringHost?: string;
};
type ChainConfig = NodeConfig[];
interface BrodcastSetupMessage {
    signal: NodeSignal.Type;
    chain: {
        id: string;
        config: ChainConfig;
    };
}
interface ReportingPayload {
    chainId: string;
    nodeId: string;
    index: number;
}
interface ReportingMessage extends ReportingPayload {
    signal: ChainStatus.Type;
}
interface BroadcastReportingMessage extends ReportingPayload {
    signal: ChainStatus.Type;
}
interface ChainRelation {
    rootNodeId?: string;
    config: ChainConfig;
}

declare class Node {
    private id;
    private pipelines;
    private dependencies;
    private status;
    private error?;
    private delay;
    private progress;
    private dataType;
    private executionQueue;
    private output;
    private nextNodeInfo;
    private config;
    private reporting;
    constructor(dependencies?: string[]);
    private updateProgress;
    setConfig(config: NodeConfig): void;
    getExecutionQueue(): Promise<void>;
    getConfig(): NodeConfig | null;
    getId(): string;
    addPipeline(pipeline: ProcessorPipeline): void;
    private processPipeline;
    private getPipelineGenerator;
    notify(notify: ChainStatus.Type): void;
    execute(data: PipelineData): Promise<void>;
    sendData(): Promise<void>;
    private static terminate;
    private static moveToNextNode;
    getProgress(): number;
    canExecute(executedNodes: Set<string>): boolean;
    setDelay(delay: number): void;
    private sleep;
    getDataType(): DataType.Type;
    getStatus(): ChainStatus.Type;
    getDependencies(): string[];
    updateStatus(status: ChainStatus.Type, error?: Error): void;
    getError(): Error | undefined;
    getProcessors(): ProcessorPipeline[];
    setNextNodeInfo(id: string, type: NodeType.Type, meta?: PipelineMeta): void;
    getNextNodeInfo(): {
        id: string;
        type: NodeType.Type;
        meta?: PipelineMeta;
    } | null;
}

declare class NodeSupervisor {
    private uid;
    private ctn;
    private static instance;
    private nodes;
    private chains;
    private broadcastSetupCallback;
    remoteServiceCallback: ServiceCallback;
    private constructor();
    static retrieveService(refresh?: boolean): NodeSupervisor;
    setRemoteServiceCallback(remoteServiceCallback: ServiceCallback): void;
    setBroadcastSetupCallback(broadcastSetupCallback: SetupCallback): void;
    setBroadcastReportingCallback(broadcastReportingCallback: BroadcastReportingCallback): void;
    setMonitoringCallback(reportingCallback: ReportingCallback): void;
    setUid(uid: string): void;
    handleRequest(payload: SupervisorPayload): Promise<void | string>;
    private deployChain;
    private createNode;
    private setupNode;
    handleNotification(chainId: string, status: ChainStatus.Type): void;
    private notify;
    addProcessors(nodeId: string, processors: PipelineProcessor[]): Promise<void>;
    private deleteNode;
    private pauseNode;
    private delayNode;
    createChain(config: ChainConfig): string;
    private updateChain;
    private setRemoteMonitoringHost;
    prepareChainDistribution(chainId: string): Promise<void>;
    broadcastNodeSetupSignal(chainId: string, remoteConfigs: ChainConfig): Promise<void>;
    startChain(chainId: string, data: PipelineData): Promise<void>;
    private runNode;
    runNodeByRelation(payload: CallbackPayload): Promise<void>;
    private sendNodeData;
    getNodes(): Map<string, Node>;
    getNodesByServiceAndChain(serviceUid: string, chainId: string): Node[];
}

declare class PipelineDataCombiner {
    private strategy;
    private customCombineFunction?;
    constructor(strategy?: CombineStrategy.Type, customCombineFunction?: CombineFonction);
    private merge;
    private union;
    applyStrategy(dataSets: PipelineData[]): PipelineData;
    setStrategy(strategy: CombineStrategy.Type): void;
    setCustomCombineFunction(combineFunction: CombineFonction): void;
}

type HostResolverCallback = (targetId: string, meta?: PipelineMeta) => string | undefined;
interface BSCPayload {
    message: BrodcastSetupMessage;
    hostResolver: HostResolverCallback;
    path: string;
}
declare const broadcastSetupCallback: (payload: BSCPayload) => Promise<void>;
interface RSCPayload {
    cbPayload: CallbackPayload;
    hostResolver: HostResolverCallback;
    path: string;
}
declare const remoteServiceCallback: (payload: RSCPayload) => Promise<void>;
interface DefaultCallbackPayload {
    supervisor: NodeSupervisor;
    paths: {
        setup: string;
        run: string;
    };
    hostResolver: HostResolverCallback;
}
declare const setResolverCallbacks: (dcPayload: DefaultCallbackPayload) => Promise<void>;

type ReportSignalHandlerCallback = (message: ReportingMessage) => Promise<void>;
type MonitoringResolverCallback = (chainId: string) => Promise<string | undefined>;
interface BRCPayload {
    message: BroadcastReportingMessage;
    path: string;
    monitoringResolver: MonitoringResolverCallback;
}
interface DefaultReportingCallbackPayload {
    supervisor: NodeSupervisor;
    paths: {
        notify: string;
    };
    reportSignalHandler: ReportSignalHandlerCallback;
    monitoringResolver?: MonitoringResolverCallback;
}
declare const setMonitoringCallbacks: (dcPayload: DefaultReportingCallbackPayload) => Promise<void>;

export { type BRCPayload, type BSCPayload, type BrodcastSetupMessage, type CallbackPayload, type ChainConfig, type ChainRelation, type ChainState, ChainStatus, ChainType, type CombineFonction, CombineStrategy, DataType, type NodeConfig, NodeSignal, NodeSupervisor, NodeType, type PipelineData, PipelineDataCombiner, type PipelineMeta, PipelineProcessor, type ProcessorCallback, type ProcessorPipeline, type RSCPayload, type ReportingMessage, type ServiceCallback, type ServiceConfig, type SetupCallback, type SupervisorPayload, type SupervisorPayloadCreate, type SupervisorPayloadDelay, type SupervisorPayloadDelete, type SupervisorPayloadDeployChain, type SupervisorPayloadPause, type SupervisorPayloadPrepareChain, type SupervisorPayloadRun, type SupervisorPayloadSendData, type SupervisorPayloadSetup, type SupervisorPayloadStartChain, broadcastSetupCallback, remoteServiceCallback, setMonitoringCallbacks, setResolverCallbacks };
