declare class PipelineProcessor {
    static callbackService: ProcessorCallback;
    private meta?;
    private targetId;
    constructor(config: ServiceConfig);
    static setCallbackService(callbackService: ProcessorCallback): void;
    digest(data: PipelineData): Promise<PipelineData>;
}

type ReportingSignalType = 'local-signal' | 'global-signal';
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
    type Type = 'node_pending' | 'node_in_progress' | 'node_completed' | 'node_failed' | 'node_paused' | 'node_setup_completed' | 'chain_setup_completed';
    const NODE_PAUSED: Type;
    const NODE_PENDING: Type;
    const NODE_IN_PROGRESS: Type;
    const NODE_COMPLETED: Type;
    const NODE_FAILED: Type;
    const NODE_SETUP_COMPLETED: Type;
    const CHAIN_SETUP_COMPLETED: Type;
}
declare namespace NodeSignal {
    type Type = 'node_setup' | 'node_create' | 'node_delete' | 'node_pause' | 'node_delay' | 'node_run' | 'node_send_data' | 'chain_prepare' | 'chain_start' | 'chain_start_pending' | 'chain_deploy';
    const NODE_SETUP: 'node_setup';
    const NODE_CREATE: 'node_create';
    const NODE_DELETE: 'node_delete';
    const NODE_PAUSE: 'node_pause';
    const NODE_DELAY: 'node_delay';
    const NODE_RUN: 'node_run';
    const NODE_SEND_DATA: 'node_send_data';
    const CHAIN_PREPARE: 'chain_prepare';
    const CHAIN_START: 'chain_start';
    const CHAIN_START_PENDING: 'chain_start_pending';
    const CHAIN_DEPLOY: 'chain_deploy';
}
type SupervisorPayloadSetup = {
    signal: 'node_setup';
    config: NodeConfig;
};
type SupervisorPayloadCreate = {
    signal: 'node_create';
    params: NodeConfig;
};
type SupervisorPayloadDelete = {
    signal: 'node_delete';
    id: string;
};
type SupervisorPayloadPause = {
    signal: 'node_pause';
    id: string;
};
type SupervisorPayloadDelay = {
    signal: 'node_delay';
    id: string;
    delay: number;
};
type SupervisorPayloadRun = {
    signal: 'node_run';
    id: string;
    data: PipelineData;
};
type SupervisorPayloadSendData = {
    signal: 'node_send_data';
    id: string;
};
type SupervisorPayloadPrepareChain = {
    signal: 'chain_prepare';
    id: string;
};
type SupervisorPayloadStartChain = {
    signal: 'chain_start';
    id: string;
    data: PipelineData;
};
type SupervisorPayloadStartPendingChain = {
    signal: 'chain_start_pending';
    id: string;
};
type SupervisorPayloadDeployChain = {
    signal: 'chain_deploy';
    config: ChainConfig;
    data: PipelineData;
};
type SupervisorPayload = SupervisorPayloadSetup | SupervisorPayloadCreate | SupervisorPayloadDelete | SupervisorPayloadPause | SupervisorPayloadDelay | SupervisorPayloadRun | SupervisorPayloadSendData | SupervisorPayloadPrepareChain | SupervisorPayloadStartChain | SupervisorPayloadStartPendingChain | SupervisorPayloadDeployChain;
interface ServiceConfig {
    targetId: string;
    meta?: PipelineMeta;
}
type NodeConfig = {
    services: (string | ServiceConfig)[];
    chainId: string;
    index?: number;
    count?: number;
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
    count: number;
}
interface ReportingMessage extends ReportingPayload {
    signal: ChainStatus.Type;
}
interface BroadcastReportingMessage extends ReportingPayload {
    signal: ChainStatus.Type;
}
interface ChainRelation {
    rootNodeId?: string;
    dataRef?: PipelineData;
    config: ChainConfig;
}

/**
 * Represents a single executable node within a chain
 */
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
    /**
     * Creates a new Node instance
     * @param {string[]} dependencies - Array of node dependency IDs
     */
    constructor(dependencies?: string[]);
    /**
     * Updates the execution progress based on pipeline count
     * @private
     */
    private updateProgress;
    /**
     * Configures the node and sets up monitoring if index is provided
     * @param {NodeConfig} config - Configuration containing services, chainId, index and other options
     */
    setConfig(config: NodeConfig): void;
    /**
     * Gets the node's current execution queue promise
     * @returns {Promise<void>} Current execution queue
     */
    getExecutionQueue(): Promise<void>;
    /**
     * Gets the node's configuration
     * @returns {NodeConfig | null} Node configuration if set
     */
    getConfig(): NodeConfig | null;
    /**
     * Gets the node's unique identifier
     * @returns {string} UUID of the node
     */
    getId(): string;
    /**
     * Adds a processor pipeline to the node
     * @param {ProcessorPipeline} pipeline - Array of PipelineProcessor instances
     */
    addPipeline(pipeline: ProcessorPipeline): void;
    /**
     * Digest the data through successive processing stages
     * @param {ProcessorPipeline} pipeline - Array of processors to execute
     * @param {PipelineData} data - Data to process
     * @returns {Promise<PipelineData>} Processed data
     * @private
     */
    private processPipeline;
    private getPipelineGenerator;
    /**
     * Notifies about node status changes through the reporting agent
     * @param {ChainStatus.Type} notify - Node status to report
     */
    notify(notify: ChainStatus.Type, type?: ReportingSignalType): void;
    /**
     * Executes node processing on input data
     * @param {PipelineData} data - Data to process
     * @returns {Promise<void>}
     */
    execute(data: PipelineData): Promise<void>;
    /**
     * Sends processed data to the next node after execution completion
     * @returns {Promise<void>}
     */
    sendData(): Promise<void>;
    /**
     * Terminates node execution and handles final data
     * @param {string} nodeId - Node identifier
     * @param {PipelineData[]} pipelineData - Array of processed data
     * @private
     * @static
     */
    private static terminate;
    /**
     * Routes data to next node based on NodeType (LOCAL/REMOTE)
     * @param {string} nodeId - Current node identifier
     * @param {PipelineData} pipelineData - Data to pass forward
     * @private
     * @static
     */
    private static moveToNextNode;
    /**
     * Gets execution progress value
     * @returns {number} Progress between 0 and 1
     */
    getProgress(): number;
    /**
     * Checks if node dependencies are satisfied
     * @param {Set<string>} executedNodes - Set of completed node IDs
     * @returns {boolean} Whether node can execute
     */
    canExecute(executedNodes: Set<string>): boolean;
    /**
     * Sets execution delay in milliseconds
     * @param {number} delay - Delay amount
     */
    setDelay(delay: number): void;
    private sleep;
    /**
     * Gets current data type (RAW/COMPRESSED)
     * @returns {DataType.Type} Current data type
     */
    getDataType(): DataType.Type;
    /**
     * Gets current node status
     * @returns {ChainStatus.Type} Current chain status
     */
    getStatus(): ChainStatus.Type;
    /**
     * Gets node dependency IDs
     * @returns {string[]} Array of dependency node IDs
     */
    getDependencies(): string[];
    /**
     * Updates node status and handles error reporting
     * @param {ChainStatus.Type} status - New status to set
     * @param {Error} [error] - Optional error if status is NODE_FAILED
     */
    updateStatus(status: ChainStatus.Type, error?: Error): void;
    /**
     * Gets last error if node failed
     * @returns {Error|undefined} Error object if failed
     */
    getError(): Error | undefined;
    /**
     * Gets all processor pipelines
     * @returns {ProcessorPipeline[]} Array of processor pipelines
     */
    getProcessors(): ProcessorPipeline[];
    /**
     * Sets next node routing information
     * @param {string} id - Next node ID
     * @param {NodeType.Type} type - Next node type (LOCAL/REMOTE)
     * @param {PipelineMeta} [meta] - Optional pipeline metadata for next node
     */
    setNextNodeInfo(id: string, type: NodeType.Type, meta?: PipelineMeta): void;
    /**
     * Gets next node routing information
     * @returns {{ id: string, type: NodeType.Type, meta?: PipelineMeta } | null} Next node info or null
     */
    getNextNodeInfo(): {
        id: string;
        type: NodeType.Type;
        meta?: PipelineMeta;
    } | null;
}

/**
 * Manages the lifecycle and distribution of nodes within a processing chain
 */
declare class NodeSupervisor {
    private uid;
    private ctn;
    private static instance;
    private nodes;
    private chains;
    private broadcastSetupCallback;
    remoteServiceCallback: ServiceCallback;
    /**
     * Creates a new NodeSupervisor instance
     * @private
     */
    private constructor();
    /**
     * Retrieves or creates a NodeSupervisor instance (Singleton pattern)
     * @param {boolean} refresh - Whether to force create a new instance
     * @returns {NodeSupervisor} The NodeSupervisor instance
     */
    static retrieveService(refresh?: boolean): NodeSupervisor;
    /**
     * Sets the remote service callback function
     * @param {ServiceCallback} remoteServiceCallback - The callback to handle remote service calls
     */
    setRemoteServiceCallback(remoteServiceCallback: ServiceCallback): void;
    /**
     * Sets the broadcast setup callback function
     * @param {SetupCallback} broadcastSetupCallback - The callback to handle broadcast setup signals
     */
    setBroadcastSetupCallback(broadcastSetupCallback: SetupCallback): void;
    /**
     * Sets the broadcast reporting callback function
     * @param {BroadcastReportingCallback} broadcastReportingCallback - The callback to handle broadcast reporting signals
     */
    setBroadcastReportingCallback(broadcastReportingCallback: BroadcastReportingCallback): void;
    /**
     * Sets the monitoring reporting callback function
     * @param {ReportingCallback} reportingCallback - The callback to handle monitoring reports
     */
    setMonitoringCallback(reportingCallback: ReportingCallback): void;
    /**
     * Sets the unique identifier for this supervisor instance
     * @param {string} uid - The unique identifier
     */
    setUid(uid: string): void;
    /**
     * Handles supervisor requests (node setup, creation, deletion, etc.)
     * @param {SupervisorPayload} payload - The request payload
     * @returns {Promise<void|string>} Promise resolving to a string if applicable
     */
    handleRequest(payload: SupervisorPayload): Promise<void | string>;
    /**
     * Deploys a new processing chain
     * @param {ChainConfig} config - Configuration for the new chain
     * @param {PipelineData} data - Initial data to start the chain
     * @returns {Promise<string>} The new chain identifier
     */
    private deployChain;
    /**
     * Creates a new node with the given configuration
     * @param {NodeConfig} config - The node configuration
     * @returns {Promise<string>} The new node identifier
     */
    private createNode;
    /**
     * Sets up a new node with the given configuration
     * @param {NodeConfig} config - The node configuration
     * @param {boolean} initiator - Whether the node is the chain initiator
     * @returns {Promise<string>} The new node identifier
     */
    private setupNode;
    /**
     * Handles externals notifications about a chain status change
     * @param {string} chainId - The chain identifier
     * @param {ChainStatus.Type} status - The new chain status
     */
    handleNotification(chainId: string, status: ChainStatus.Type): void;
    /**
     * Notifies a node about a chain status change
     * @param {string} nodeId - The node identifier to notify
     * @param {ChainStatus.Type} status - The new chain status to notify
     */
    private notify;
    /**
     * Adds processors to a node
     * @param {string} nodeId - The node identifier
     * @param {PipelineProcessor[]} processors - Array of processors to add
     */
    addProcessors(nodeId: string, processors: PipelineProcessor[]): Promise<void>;
    /**
     * Deletes a node
     * @param {string} nodeId - The node identifier to delete
     */
    private deleteNode;
    /**
     * Pauses a node
     * @param {string} nodeId - The node identifier to pause
     */
    private pauseNode;
    /**
     * Delays the execution of a node
     * @param {string} nodeId - The node identifier
     * @param {number} delay - The delay in milliseconds
     */
    private delayNode;
    /**
     * Creates a new chain with the given configuration
     * @param {ChainConfig} config - The chain configuration
     * @returns {string} The new chain identifier
     */
    createChain(config: ChainConfig): string;
    /**
     * Updates an existing chain with new configurations
     * @param {ChainConfig} config - The new chain configurations to add
     * @returns {string} The chain identifier
     */
    private updateChain;
    /**
     * Sets the remote monitoring host for a chain
     * @param {NodeConfig} config - The node configuration containing the monitoring host
     */
    private setRemoteMonitoringHost;
    /**
     * Prepares the distribution of a processing chain
     * @param {string} chainId - The chain identifier
     */
    prepareChainDistribution(chainId: string): Promise<void>;
    /**
     * Broadcasts a setup signal for remote nodes in a chain
     * @param {string} chainId - The chain identifier
     * @param {ChainConfig} remoteConfigs - The remote node configurations
     */
    broadcastNodeSetupSignal(chainId: string, remoteConfigs: ChainConfig): Promise<void>;
    /**
     * Starts a pending chain
     * @param {string} chainId - The chain identifier
     */
    startPendingChain(chainId: string): Promise<void>;
    /**
     * Starts a new chain
     * @param {string} chainId - The chain identifier
     * @param {PipelineData} data - The initial data to process
     */
    startChain(chainId: string, data: PipelineData): Promise<void>;
    /**
     * Executes a node with the given data
     * @param {string} nodeId - The node identifier
     * @param {PipelineData} data - The data to process
     */
    private runNode;
    /**
     * Executes a node based on the given callback payload
     * @param {CallbackPayload} payload - The payload containing target ID, chain ID, and data
     */
    runNodeByRelation(payload: CallbackPayload): Promise<void>;
    /**
     * Sends data from a node
     * @param {string} nodeId - The node identifier
     */
    private sendNodeData;
    /**
     * Gets all the nodes managed by this supervisor
     * @returns {Map<string, Node>} Map of nodes
     */
    getNodes(): Map<string, Node>;
    /**
     * Gets all nodes associated with a specific service and chain
     * @param {string} serviceUid - The service identifier
     * @param {string} chainId - The chain identifier
     * @returns {Node[]} Array of nodes matching the criteria
     */
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
    paths: {
        notify: string;
    };
    reportSignalHandler?: ReportSignalHandlerCallback;
    monitoringResolver?: MonitoringResolverCallback;
}
declare const setMonitoringCallbacks: (dcPayload: DefaultReportingCallbackPayload) => Promise<void>;

export { type BRCPayload, type BSCPayload, type BrodcastSetupMessage, type CallbackPayload, type ChainConfig, type ChainRelation, type ChainState, ChainStatus, ChainType, type CombineFonction, CombineStrategy, DataType, type NodeConfig, NodeSignal, NodeSupervisor, NodeType, type PipelineData, PipelineDataCombiner, type PipelineMeta, PipelineProcessor, type ProcessorCallback, type ProcessorPipeline, type RSCPayload, type ReportingMessage, type ServiceCallback, type ServiceConfig, type SetupCallback, type SupervisorPayload, type SupervisorPayloadCreate, type SupervisorPayloadDelay, type SupervisorPayloadDelete, type SupervisorPayloadDeployChain, type SupervisorPayloadPause, type SupervisorPayloadPrepareChain, type SupervisorPayloadRun, type SupervisorPayloadSendData, type SupervisorPayloadSetup, type SupervisorPayloadStartChain, type SupervisorPayloadStartPendingChain, broadcastSetupCallback, remoteServiceCallback, setMonitoringCallbacks, setResolverCallbacks };
