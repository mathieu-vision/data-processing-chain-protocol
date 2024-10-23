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
    configuration: unknown;
}
interface CallbackPayload {
    chainId?: string;
    targetId: string;
    data: PipelineData;
    meta?: PipelineMeta;
}
type Callback = (_payload: CallbackPayload) => void;
type SetupCallback = (_message: BrodcastMessage) => Promise<void>;
type ProcessorCallback = (_payload: CallbackPayload) => Promise<PipelineData>;
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
type CombineFonction = (_dataSets: PipelineData[]) => unknown[];
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
declare namespace NodeStatus {
    type Type = 'pending' | 'in-progress' | 'completed' | 'failed' | 'paused';
    const PAUSED: Type;
    const PENDING: Type;
    const IN_PROGRESS: Type;
    const COMPLETED: Type;
    const FAILED: Type;
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
    chainId?: string;
    location?: NodeType.Type;
    nextTargetId?: string;
    nextMeta?: PipelineMeta;
    chainType?: ChainType.Type;
};
type ChainConfig = NodeConfig[];
interface BrodcastMessage {
    signal: NodeSignal.Type;
    chain: {
        id: string;
        config: ChainConfig;
    };
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
    constructor(dependencies?: string[]);
    private updateProgress;
    setConfig(config: NodeConfig): void;
    getExecutionQueue(): Promise<void>;
    getConfig(): NodeConfig | null;
    getId(): string;
    addPipeline(pipeline: ProcessorPipeline): void;
    private processPipeline;
    private getPipelineGenerator;
    execute(data: PipelineData): Promise<void>;
    sendData(): Promise<void>;
    private static terminate;
    private static moveToNextNode;
    getProgress(): number;
    canExecute(executedNodes: Set<string>): boolean;
    setDelay(delay: number): void;
    private sleep;
    getDataType(): DataType.Type;
    getStatus(): NodeStatus.Type;
    getDependencies(): string[];
    updateStatus(status: NodeStatus.Type, error?: Error): void;
    getError(): Error | undefined;
    getProcessors(): ProcessorPipeline[];
    setNextNodeInfo(id: string, type: NodeType.Type, meta?: PipelineMeta): void;
    getNextNodeInfo(): {
        id: string;
        type: NodeType.Type;
        meta?: PipelineMeta;
    } | null;
}

declare class ProgressTracker {
    private totalNodes;
    private completedNodes;
    constructor(totalNodes: number);
    notifyProgress(nodeId: string, status: NodeStatus.Type): void;
}

declare class NodeMonitoring {
    private nodes;
    private nodeStatusMap;
    private progressTracker;
    constructor(chainNodes: Node[], progressTracker: ProgressTracker | null);
    addNode(node: Node): void;
    deleteNode(nodeId: string): void;
    updateNodeStatus(nodeId: string, status: NodeStatus.Type, error?: Error): void;
    getChainState(): ChainState;
    canExecuteNode(nodeId: string): boolean;
    private getCompletedNodes;
    setProgressTracker(progressTracker: ProgressTracker): void;
}

declare class NodeSupervisor {
    private uid;
    private ctn;
    private static instance;
    private nodes;
    private chains;
    private nodeMonitoring?;
    private broadcastSetupCallback;
    remoteServiceCallback: Callback;
    private constructor();
    setRemoteServiceCallback(callback: Callback): void;
    setMonitoring(nodeMonitoring: NodeMonitoring): void;
    setBroadcastSetupCallback(broadcastSetupCallback: (_message: BrodcastMessage) => Promise<void>): void;
    setUid(uid: string): void;
    static retrieveService(refresh?: boolean): NodeSupervisor;
    handleRequest(payload: SupervisorPayload): Promise<void | string>;
    private deployChain;
    private createNode;
    private setupNode;
    addProcessors(nodeId: string, processors: PipelineProcessor[]): Promise<void>;
    private deleteNode;
    private pauseNode;
    private delayNode;
    createChain(config: ChainConfig): string;
    private updateChain;
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

type HostResolverCallback = (_targetId: string, _meta?: PipelineMeta) => string | undefined;
interface BSCPayload {
    message: BrodcastMessage;
    hostResolver: HostResolverCallback;
    path: string;
}
declare const broadcastSetupCallback: (payload: BSCPayload) => Promise<void>;
interface RSCPayload {
    cbPayload: CallbackPayload;
    hostResolver: HostResolverCallback;
    path: string;
}
declare const remoteServiceCallback: (payload: RSCPayload) => Promise<unknown>;
interface DefaultCallbackPayload {
    supervisor: NodeSupervisor;
    paths: {
        setup: string;
        run: string;
    };
    hostResolver: HostResolverCallback;
}
declare const setDefaultCallbacks: (dcPayload: DefaultCallbackPayload) => Promise<void>;

export { type BSCPayload, type BrodcastMessage, type Callback, type CallbackPayload, type ChainConfig, type ChainRelation, type ChainState, ChainType, type CombineFonction, CombineStrategy, DataType, type NodeConfig, NodeMonitoring, NodeSignal, NodeStatus, NodeSupervisor, NodeType, type PipelineData, PipelineDataCombiner, type PipelineMeta, PipelineProcessor, type ProcessorCallback, type ProcessorPipeline, ProgressTracker, type RSCPayload, type ServiceConfig, type SetupCallback, type SupervisorPayload, type SupervisorPayloadCreate, type SupervisorPayloadDelay, type SupervisorPayloadDelete, type SupervisorPayloadDeployChain, type SupervisorPayloadPause, type SupervisorPayloadPrepareChain, type SupervisorPayloadRun, type SupervisorPayloadSendData, type SupervisorPayloadSetup, type SupervisorPayloadStartChain, broadcastSetupCallback, remoteServiceCallback, setDefaultCallbacks };
