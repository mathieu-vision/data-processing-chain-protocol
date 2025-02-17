var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/utils/Logger.ts
import { createWriteStream, mkdirSync } from "fs";
import { join } from "path";
import { format } from "util";
var Colors = {
  reset: "\x1B[0m",
  info: "\x1B[32m",
  // green
  warn: "\x1B[93m",
  // yellow
  error: "\x1B[31m",
  // red
  header: "\x1B[36m",
  // cyan
  debug: "\x1B[90m",
  // gray
  event: "\x1B[35m",
  // magenta
  special: "\x1B[37m"
  // white
};
var Logger = class {
  /**
   * Configures the logger with the provided options.
   * @param {LoggerConfig} config - The configuration settings for the logger.
   */
  static configure(config) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
  }
  /**
   * Formats a log message with a timestamp and color based on the log level.
   * @param {LogLevel} level - The log level for the message.
   * @param {string} message - The message to format.
   * @returns {string} - The formatted log message.
   */
  static formatMessage(level, message) {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}:${hours}.${minutes}.${seconds}`;
    if (level === "special") {
      return `${Colors.reset}${Colors.special}${timestamp} [${level.toUpperCase()}]: \x1B[31m[${message}\x1B[31m]${Colors.reset}
`;
    }
    return `${Colors.reset}${Colors[level]}${timestamp} [${level.toUpperCase()}]: ${message}${Colors.reset}
`;
  }
  /**
   * Logs a message with the specified log level.
   * @param {LogLevel} level - The log level of the message.
   * @param {string} message - The message to log.
   */
  static log(level, message) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const formattedMessage = this.formatMessage(level, message);
    if (!this.noPrint) {
      process.stdout.write(formattedMessage);
    }
    if (this.config.preserveLogs && this.config.externalCallback) {
      this.config.externalCallback(level, message, timestamp);
    }
  }
  static special(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("special", msg);
  }
  static event(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("event", msg);
  }
  /**
   * Logs a debug message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static debug(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("debug", msg);
  }
  /**
   * Logs an informational message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static info(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("info", msg);
  }
  /**
   * Logs a warning message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static warn(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("warn", msg);
  }
  /**
   * Logs an error message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static error(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("error", msg);
  }
  /**
   * Logs a header message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static header(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("header", msg);
  }
};
Logger.noPrint = false;
// Flag to disable console output
Logger.config = {
  preserveLogs: false
};
var DEFAULT_LOG_PATH = join(process.cwd(), "logs");
var logStream;
var getLogFileName = () => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  return `dpcp-${timestamp}.log`;
};
var initDiskLogger = () => {
  try {
    mkdirSync(DEFAULT_LOG_PATH, { recursive: true });
    const logFile = join(DEFAULT_LOG_PATH, getLogFileName());
    logStream = createWriteStream(logFile, { flags: "a" });
    return true;
  } catch (err) {
    process.stderr.write(`Failed to create log directory: ${err}
`);
    return false;
  }
};
var defaultDiskCallback = (level, message, timestamp) => {
  if (!logStream && !initDiskLogger()) {
    return;
  }
  const plainMessage = `${timestamp} [LOGGER][${level.toUpperCase()}]: ${message}
`;
  logStream.write(plainMessage);
};
Logger.configure({
  preserveLogs: true,
  externalCallback: defaultDiskCallback
});

// src/types/types.ts
var DefaultCallback;
((DefaultCallback2) => {
  DefaultCallback2.SERVICE_CALLBACK = (payload) => {
    Logger.warn("REMOTE_SERVICE_CALLBACK not set");
  };
  DefaultCallback2.SETUP_CALLBACK = (message) => __async(void 0, null, function* () {
    Logger.warn("SETUP_CALLBACK not set");
  });
  DefaultCallback2.REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
    Logger.warn("REPORTING_CALLBACK not set");
  });
  DefaultCallback2.BROADCAST_REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
    Logger.warn("BROADCAST_REPORTING_CALLBACK not set");
  });
})(DefaultCallback || (DefaultCallback = {}));
var NodeType;
((NodeType2) => {
  NodeType2.LOCAL = "local";
  NodeType2.REMOTE = "remote";
})(NodeType || (NodeType = {}));
var DataType;
((DataType2) => {
  DataType2.RAW = "raw";
  DataType2.COMPRESSED = "compressed";
})(DataType || (DataType = {}));
var CombineStrategy;
((CombineStrategy2) => {
  CombineStrategy2.MERGE = "merge";
  CombineStrategy2.UNION = "union";
  CombineStrategy2.CUSTOM = "custom";
})(CombineStrategy || (CombineStrategy = {}));
var ChainType;
((ChainType2) => {
  ChainType2.DEFAULT = 1;
  ChainType2.PERSISTANT = 2;
  ChainType2.AUTO_DELETE = 4;
})(ChainType || (ChainType = {}));
var ChainStatus;
((ChainStatus2) => {
  ChainStatus2.NODE_PAUSED = "node_paused";
  ChainStatus2.NODE_PENDING = "node_pending";
  ChainStatus2.NODE_IN_PROGRESS = "node_in_progress";
  ChainStatus2.NODE_COMPLETED = "node_completed";
  ChainStatus2.NODE_FAILED = "node_failed";
  ChainStatus2.NODE_SETUP_COMPLETED = "node_setup_completed";
  ChainStatus2.CHAIN_DEPLOYED = "chain_deployed";
  ChainStatus2.CHAIN_SETUP_COMPLETED = "chain_setup_completed";
  ChainStatus2.CHILD_CHAIN_STARTED = "child_chain_started";
  ChainStatus2.CHILD_CHAIN_COMPLETED = "child_chain_completed";
  ChainStatus2.NODE_PENDING_DELETION = "node_pending_deletion";
  ChainStatus2.NODE_END_OF_PIPELINE = "node_end_of_pipeline";
})(ChainStatus || (ChainStatus = {}));
var NodeSignal;
((NodeSignal3) => {
  NodeSignal3.NODE_SETUP = "node_setup";
  NodeSignal3.NODE_CREATE = "node_create";
  NodeSignal3.NODE_DELETE = "node_delete";
  NodeSignal3.NODE_PAUSE = "node_pause";
  NodeSignal3.NODE_DELAY = "node_delay";
  NodeSignal3.NODE_RUN = "node_run";
  NodeSignal3.NODE_SEND_DATA = "node_send_data";
  NodeSignal3.CHAIN_PREPARE = "chain_prepare";
  NodeSignal3.CHAIN_START = "chain_start";
  NodeSignal3.CHAIN_START_PENDING_OCCURRENCE = "chain_start_pending_occurrence";
  NodeSignal3.CHAIN_DEPLOY = "chain_deploy";
})(NodeSignal || (NodeSignal = {}));

// src/core/Node.ts
import { setTimeout, setImmediate } from "timers";
import { randomUUID as randomUUID2 } from "node:crypto";

// src/agents/Agent.ts
import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";
var Agent = class extends EventEmitter {
  /**
   * Creates a new Agent instance with a unique identifier
   */
  constructor() {
    super();
    this.uid = randomUUID();
  }
};

// src/agents/ReportingAgent.ts
var _ReportingAgentBase = class _ReportingAgentBase extends Agent {
  /**
   * Creates a new ReportingAgentBase instance
   * @throws {Error} Throws an error if the agent instantiating this instance is not authorized.
   */
  constructor() {
    super();
    this.status = [];
    if (!(_ReportingAgentBase.authorizedAgent instanceof Agent)) {
      throw new Error(
        "Node Reporter needs to be instantiated by an authorized Agent"
      );
    }
    _ReportingAgentBase.authorizedAgent = null;
  }
  /**
   * Authorizes an agent to create ReportingAgent instances
   * @param {Agent} agent - The agent to authorize
   */
  static authorize(agent) {
    _ReportingAgentBase.authorizedAgent = agent;
  }
  /**
   * Notifies about a new chain status
   * @param {ChainStatus.Type} status - The status to notify
   * @param {ReportingSignalType} type - The type of signal ('local-signal' by default)
   */
  notify(notificationStatus, type = "local-signal") {
    const { status } = notificationStatus;
    Logger.info(`Status ${status} from ${this.uid}`);
    this.status.push(status);
    this.emit(type, notificationStatus);
  }
  /**
   * Gets all recorded signals/statuses
   * @returns {ChainStatus.Type[]} Array of recorded chain statuses
   */
  getSignals() {
    return this.status;
  }
};
_ReportingAgentBase.authorizedAgent = null;
var ReportingAgentBase = _ReportingAgentBase;

// src/agents/MonitoringAgent.ts
var ReportingAgent = class extends ReportingAgentBase {
  /**
   * Creates a new ReportingAgent instance
   * @param {string} chainId - The chain identifier
   * @param {string} nodeId - The node identifier
   */
  constructor(chainId, nodeId) {
    super();
    this.chainId = chainId;
    this.nodeId = nodeId;
  }
};
var MonitoringAgent = class _MonitoringAgent extends Agent {
  /*
  private chainHierarchy: Map<
    string,
    {
      parentId?: string;
      children: string[];
      completedChildren: Set<string>;
    }
  > = new Map();
  */
  /**
   * Creates a new MonitoringAgent instance
   */
  constructor() {
    super();
    this.workflow = {};
    this.remoteMonitoringHost = /* @__PURE__ */ new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback = DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }
  getWorkflow() {
    return this.workflow;
  }
  /**
   * Retrieves or creates a MonitoringAgent instance (Singleton pattern)
   * @param {boolean} refresh - Whether to force create a new instance
   * @returns {MonitoringAgent} The MonitoringAgent instance
   */
  static retrieveService(refresh = false) {
    if (!_MonitoringAgent.instance || refresh) {
      const instance = new _MonitoringAgent();
      _MonitoringAgent.instance = instance;
    }
    return _MonitoringAgent.instance;
  }
  /**
   * Sets the reporting callback function
   * @param {ReportingCallback} reportingCallback - The callback function to handle reports
   */
  setReportingCallback(reportingCallback) {
    this.reportingCallback = reportingCallback;
  }
  /**
   * Sets the broadcast reporting callback function
   * @param {ReportingCallback} broadcastReportingCallback - The callback function to handle broadcast reports
   */
  setBroadcastReportingCallback(broadcastReportingCallback) {
    this.broadcastReportingCallback = broadcastReportingCallback;
  }
  /**
   * Gets the remote monitoring host for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {string|undefined} The remote monitoring host address if exists
   */
  getRemoteMonitoringHost(chainId) {
    return this.remoteMonitoringHost.get(chainId);
  }
  /**
   * Sets the remote monitoring host for a specific chain
   * @param {string} chainId - The chain identifier
   * @param {string} remoteMonitoringHost - The remote monitoring host address
   */
  setRemoteMonitoringHost(chainId, remoteMonitoringHost) {
    this.remoteMonitoringHost.set(chainId, remoteMonitoringHost);
  }
  /**
   * Generates a new ReportingAgent instance
   * @param {ReportingPayload} payload - The reporting payload containing chainId, nodeId and index
   * @returns {ReportingAgent} A new ReportingAgent instance
   */
  genReportingAgent(payload) {
    const { chainId, nodeId, index } = payload;
    ReportingAgent.authorize(this);
    const reporting = new ReportingAgent(chainId, nodeId);
    reporting.on("global-signal", (signal) => __async(this, null, function* () {
      Logger.event(
        `Receive global-signal:
				${JSON.stringify(signal)}
				for node ${nodeId}
`
      );
      const message = __spreadProps(__spreadValues({}, payload), { signal });
      if (index > 0) {
        signal.broadcasted = true;
        void this.broadcastReportingCallback(message);
      } else {
        yield this.reportingCallback(message);
      }
    }));
    reporting.on("local-signal", (signal) => __async(this, null, function* () {
      Logger.event(
        `Receive local-signal:
				${JSON.stringify(signal)}
				for node ${nodeId} in chain ${chainId}
`
      );
      const message = __spreadProps(__spreadValues({}, payload), { signal });
      const update = {
        [message.nodeId]: { [message.signal.status]: true }
      };
      if (!this.workflow[message.chainId]) {
        this.workflow[message.chainId] = {};
      }
      const prev = this.workflow[message.chainId].status || {};
      const next = __spreadValues(__spreadValues({}, prev), update);
      this.workflow[message.chainId].status = next;
      if (nodeId === "supervisor") {
        yield this.reportingCallback(message);
      }
    }));
    return reporting;
  }
  /**
   * Gets the status for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {ChainStatus|undefined} The chain status if exists
   */
  getChainStatus(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.status;
  }
  //
  setChainSetupCount(chainId, count) {
    if (!this.workflow[chainId]) {
      this.workflow[chainId] = {};
    }
    this.workflow[chainId].setupCount = count;
  }
  getChainSetupCount(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.setupCount;
  }
  //
  setChainDeployed(chainId) {
    if (!this.workflow[chainId]) {
      this.workflow[chainId] = {};
    }
    this.workflow[chainId].deployed = true;
  }
  getChainDeployed(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.deployed;
  }
  //
  setChainSetupCompleted(chainId) {
    if (!this.workflow[chainId]) {
      this.workflow[chainId] = {};
    }
    this.workflow[chainId].setupCompleted = true;
  }
  getChainSetupCompleted(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.setupCompleted;
  }
  //
  /*
    async handleChildChainCompletion(childChainId: string) {
      const childEntry = this.chainHierarchy.get(childChainId);
      if (!childEntry || !childEntry.parentId) return;
  
      const parentEntry = this.chainHierarchy.get(childEntry.parentId);
      if (parentEntry) {
        parentEntry.completedChildren.add(childChainId);
        await this.checkChainReadiness(childEntry.parentId);
      }
    }
  
    trackChildChain(parentChainId: string, childChainId: string) {
      const parentEntry = this.chainHierarchy.get(parentChainId) || {
        children: [],
        completedChildren: new Set(),
      };
      parentEntry.children.push(childChainId);
      this.chainHierarchy.set(parentChainId, parentEntry);
  
      this.chainHierarchy.set(childChainId, {
        parentId: parentChainId,
        children: [],
        completedChildren: new Set(),
      });
    }
  
    private async checkChainReadiness(chainId: string) {
      try {
        const entry = this.chainHierarchy.get(chainId);
        if (!entry) {
          Logger.error(`No hierarchy entry found for chain ${chainId}`);
          return;
        }
  
        const supervisor = NodeSupervisor.retrieveService();
        const chain = supervisor.getChain(chainId);
        if (!chain) {
          Logger.error(`No chain found for id ${chainId}`);
          return;
        }
  
        const workflowNode = this.workflow[chainId];
        if (!workflowNode) {
          throw new Error(`No workflow found for chain ${chainId}`);
        }
        const setupCount = workflowNode.setupCount || 0;
        const config = chain.config.length || 0;
  
        Logger.info(
          `Chain ${chainId} setup status: ${setupCount}/${config} configs ready`,
        );
        Logger.info(
          `Children completed: ${entry.completedChildren.size}/${entry.children.length}`,
        );
  
        if (
          setupCount >= config &&
          entry.children.length === entry.completedChildren.size
        ) {
          try {
            await supervisor.handleRequest({
              signal: NodeSignal.CHAIN_START_PENDING,
              id: chainId,
            });
            Logger.info(
              `Chain ${chainId} readiness check completed, start signal sent`,
            );
          } catch (error) {
            Logger.error(
              `Failed to send start signal for chain ${chainId}: ${(error as Error).message}`,
            );
            throw error;
          }
        }
      } catch (error) {
        Logger.error(
          `Error during chain readiness check for ${chainId}: ${(error as Error).message}`,
        );
        throw error;
      }
    }
    */
};

// src/core/Node.ts
var Node = class _Node {
  /**
   * Creates a new Node instance
   * @param {string[]} dependencies - Array of node dependency IDs
   */
  constructor(dependencies = []) {
    this.reporting = null;
    this.id = randomUUID2();
    this.output = [];
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = ChainStatus.NODE_PENDING;
    this.delay = 0;
    this.progress = 0;
    this.dataType = DataType.RAW;
    this.executionQueue = Promise.resolve();
    this.nextNodeInfo = null;
    this.config = null;
  }
  /**
   * Updates the execution progress based on pipeline count
   * @private
   */
  updateProgress() {
    this.progress += 1 / this.pipelines.length;
  }
  /**
   * Configures the node and sets up monitoring if index is provided
   * @param {NodeConfig} config - Configuration containing services, chainId, index and other options
   */
  setConfig(config) {
    const { chainId, index, count } = config;
    if (index !== void 0 && count !== void 0) {
      const monitoring = MonitoringAgent.retrieveService();
      this.reporting = monitoring.genReportingAgent({
        chainId,
        nodeId: this.id,
        index,
        count
      });
    } else {
      Logger.warn("Node index is not defined, configuration failed");
    }
    this.config = config;
  }
  /**
   * Gets the node's current execution queue promise
   * @returns {Promise<void>} Current execution queue
   */
  getExecutionQueue() {
    return this.executionQueue;
  }
  /**
   * Gets the node's configuration
   * @returns {NodeConfig | null} Node configuration if set
   */
  getConfig() {
    return this.config;
  }
  /**
   * Gets the node's unique identifier
   * @returns {string} UUID of the node
   */
  getId() {
    return this.id;
  }
  /**
   * Adds a processor pipeline to the node
   * @param {ProcessorPipeline} pipeline - Array of PipelineProcessor instances
   */
  addPipeline(pipeline) {
    this.pipelines.push(pipeline);
  }
  /**
   * Digest the data through successive processing stages
   * @param {ProcessorPipeline} pipeline - Array of processors to execute
   * @param {PipelineData} data - Data to process
   * @returns {Promise<PipelineData>} Processed data
   * @private
   */
  processPipeline(pipeline, data) {
    return __async(this, null, function* () {
      let result = data;
      for (const processor of pipeline) {
        result = yield processor.digest(result);
      }
      return result;
    });
  }
  *getPipelineGenerator(pipelines, count) {
    for (let i = 0; i < pipelines.length; i += count) {
      yield pipelines.slice(i, i + count);
    }
  }
  /**
   * Notifies about node status changes through the reporting agent
   * @param {ChainStatus.Type} notify - Node status to report
   */
  notify(status, type = "local-signal") {
    try {
      if (this.reporting !== null) {
        if (typeof status === "object" && "status" in status) {
          this.reporting.notify(status, type);
        } else {
          this.reporting.notify({ status }, type);
        }
      } else {
        throw new Error("Reporter not set");
      }
    } catch (error) {
      Logger.error(error.message);
    }
  }
  processChildChain(data) {
    return __async(this, null, function* () {
      var _a;
      const childConfig = (_a = this.config) == null ? void 0 : _a.chainConfig;
      if (childConfig && Array.isArray(childConfig) && childConfig.length > 0) {
        childConfig[0].rootConfig = this.config ? JSON.parse(JSON.stringify(this.config)) : void 0;
        const supervisor = NodeSupervisor.retrieveService();
        const chainId = yield supervisor.handleRequest({
          signal: NodeSignal.CHAIN_DEPLOY,
          config: childConfig,
          data
        });
        if (!chainId) {
          throw new Error("Failed to deploy chain: no chainId returned");
        }
      }
    });
  }
  /**
   * Executes node processing on input data
   * @param {PipelineData} data - Data to process
   * @returns {Promise<void>}
   */
  execute(data) {
    return __async(this, null, function* () {
      var _a, _b;
      const childMode = ((_b = (_a = this.config) == null ? void 0 : _a.rootConfig) == null ? void 0 : _b.childMode) === "parallel" ? "in parallel" : "in serial";
      Logger.info(`Node ${this.id} execution started ${childMode}...`);
      this.executionQueue = this.executionQueue.then(() => __async(this, null, function* () {
        var _a2;
        try {
          this.updateStatus(ChainStatus.NODE_IN_PROGRESS);
          if (this.delay > 0) {
            yield this.sleep(this.delay);
          }
          const generator = this.getPipelineGenerator(this.pipelines, 3);
          for (const pipelineBatch of generator) {
            yield new Promise((resolve, reject) => {
              setImmediate(() => __async(this, null, function* () {
                try {
                  const batchPromises = pipelineBatch.map(
                    (pipeline) => this.processPipeline(pipeline, data).then(
                      (pipelineData) => {
                        this.output.push(pipelineData);
                        this.updateProgress();
                      }
                    )
                  );
                  yield Promise.all(batchPromises);
                  resolve();
                } catch (error) {
                  reject(error);
                }
              }));
            });
          }
          this.updateStatus(ChainStatus.NODE_COMPLETED);
          if ((_a2 = this.config) == null ? void 0 : _a2.chainConfig) {
            Logger.info(`child chain found in node: ${this.id}`);
            yield this.processChildChain(data);
          }
        } catch (error) {
          this.updateStatus(ChainStatus.NODE_FAILED, error);
          Logger.error(`Node ${this.id} execution failed: ${error}`);
        }
      }));
      const supervisor = NodeSupervisor.retrieveService();
      yield supervisor.handleRequest({
        signal: NodeSignal.NODE_SEND_DATA,
        id: this.id
      });
    });
  }
  /**
   * Sends processed data to the next node after execution completion
   * @returns {Promise<void>}
   */
  sendData() {
    return __async(this, null, function* () {
      yield this.executionQueue;
      Logger.info(`Sending data from node ${this.id}.`);
      yield _Node.terminate(this.id, this.output);
    });
  }
  /**
   * Terminates node execution and handles final data
   * @param {string} nodeId - Node identifier
   * @param {PipelineData[]} pipelineData - Array of processed data
   * @private
   * @static
   */
  static terminate(nodeId, pipelineData) {
    return __async(this, null, function* () {
      Logger.special(`Terminate: Node ${nodeId} execution completed.`);
      const data = pipelineData[0];
      yield _Node.moveToNextNode(nodeId, data);
    });
  }
  // todo: should not be static
  /**
   * Routes data to next node based on NodeType (LOCAL/REMOTE)
   * @param {string} nodeId - Current node identifier
   * @param {PipelineData} pipelineData - Data to pass forward
   * @private
   * @static
   */
  static moveToNextNode(nodeId, pipelineData) {
    return __async(this, null, function* () {
      var _a, _b, _c, _d, _e;
      const supervisor = NodeSupervisor.retrieveService();
      const nodes = supervisor.getNodes();
      const currentNode = nodes.get(nodeId);
      const chainId = (_a = currentNode == null ? void 0 : currentNode.getConfig()) == null ? void 0 : _a.chainId;
      if (!currentNode) {
        Logger.warn(`Node ${nodeId} not found for moving to next node.`);
        return;
      }
      const nextNodeInfo = currentNode.getNextNodeInfo();
      if (nextNodeInfo) {
        if (nextNodeInfo.type === NodeType.LOCAL) {
          yield supervisor.handleRequest({
            signal: NodeSignal.NODE_RUN,
            id: nextNodeInfo.id,
            data: pipelineData
          });
        } else if (nextNodeInfo.type === NodeType.REMOTE) {
          supervisor.remoteServiceCallback({
            // targetId and meta are related to the next remote target service uid
            chainId,
            targetId: nextNodeInfo.id,
            data: pipelineData,
            meta: nextNodeInfo.meta
          });
        }
      } else {
        Logger.special(
          `End of pipeline reached by node ${nodeId} in chain ${chainId}.`
        );
        currentNode.notify(ChainStatus.NODE_END_OF_PIPELINE, "global-signal");
      }
      const isPersistant = ((_c = (_b = currentNode.config) == null ? void 0 : _b.chainType) != null ? _c : 0) & ChainType.PERSISTANT;
      if (!isPersistant) {
        const autoDelete = ((_e = (_d = currentNode.config) == null ? void 0 : _d.chainType) != null ? _e : 0) & ChainType.AUTO_DELETE;
        if (autoDelete) {
          yield supervisor.handleRequest({
            id: nodeId,
            signal: NodeSignal.NODE_DELETE
          });
        } else {
          currentNode.notify(ChainStatus.NODE_PENDING_DELETION, "global-signal");
        }
      } else {
        Logger.warn(`Node ${nodeId} kept for future calls.`);
      }
    });
  }
  /**
   * Gets execution progress value
   * @returns {number} Progress between 0 and 1
   */
  getProgress() {
    return this.progress;
  }
  /**
   * Checks if node dependencies are satisfied
   * @param {Set<string>} executedNodes - Set of completed node IDs
   * @returns {boolean} Whether node can execute
   */
  canExecute(executedNodes) {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }
  /**
   * Sets execution delay in milliseconds
   * @param {number} delay - Delay amount
   */
  setDelay(delay) {
    this.delay = delay;
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  /**
   * Gets current data type (RAW/COMPRESSED)
   * @returns {DataType.Type} Current data type
   */
  getDataType() {
    return this.dataType;
  }
  /**
   * Gets current node status
   * @returns {ChainStatus.Type} Current chain status
   */
  getStatus() {
    return this.status;
  }
  /**
   * Gets node dependency IDs
   * @returns {string[]} Array of dependency node IDs
   */
  getDependencies() {
    return this.dependencies;
  }
  /**
   * Updates node status and handles error reporting
   * @param {ChainStatus.Type} status - New status to set
   * @param {Error} [error] - Optional error if status is NODE_FAILED
   */
  updateStatus(status, error) {
    this.status = status;
    if (status === ChainStatus.NODE_FAILED) {
      this.error = error;
    }
    if (this.reporting) {
      this.reporting.notify({ status });
    }
  }
  /**
   * Gets last error if node failed
   * @returns {Error|undefined} Error object if failed
   */
  getError() {
    return this.error;
  }
  /**
   * Gets all processor pipelines
   * @returns {ProcessorPipeline[]} Array of processor pipelines
   */
  getProcessors() {
    return this.pipelines;
  }
  /**
   * Sets next node routing information
   * @param {string} id - Next node ID
   * @param {NodeType.Type} type - Next node type (LOCAL/REMOTE)
   * @param {PipelineMeta} [meta] - Optional pipeline metadata for next node
   */
  setNextNodeInfo(id, type, meta) {
    this.nextNodeInfo = { id, type, meta };
  }
  /**
   * Gets next node routing information
   * @returns {{ id: string, type: NodeType.Type, meta?: PipelineMeta } | null} Next node info or null
   */
  getNextNodeInfo() {
    return this.nextNodeInfo;
  }
};

// src/core/PipelineProcessor.ts
var PipelineProcessor = class _PipelineProcessor {
  /**
   * Creates a new PipelineProcessor instance
   * @param {ServiceConfig} config - Configuration containing targetId and optional metadata
   */
  constructor(config) {
    this.targetId = config.targetId;
    this.meta = config.meta;
  }
  /**
   * Sets the static callback service used by all processor instances
   * @param {ProcessorCallback} callbackService - The callback function to process data
   */
  static setCallbackService(callbackService) {
    _PipelineProcessor.callbackService = callbackService;
  }
  /**
   * Processes input data through the callback service
   * @param {PipelineData} data - Data to be processed
   * @returns {Promise<PipelineData>} Processed data
   */
  digest(data) {
    return __async(this, null, function* () {
      if (_PipelineProcessor.callbackService) {
        Logger.info(
          `[PipelineProcessor]: Digesting data using "${this.targetId}"`
        );
        return yield _PipelineProcessor.callbackService({
          targetId: this.targetId,
          meta: this.meta,
          data
        });
      }
      return {};
    });
  }
};

// src/core/NodeSupervisor.ts
import { randomUUID as randomUUID3 } from "node:crypto";

// src/core/NodeSupervisorLogger.ts
var NodeSupervisorLogger = class {
  constructor() {
  }
  logChains(chains) {
    Logger.debug("Logging chains content:");
    chains.forEach((relation, chainId) => {
      Logger.debug(`Chain ID: ${chainId}`);
      Logger.debug(`Root Node ID: ${relation.rootNodeId || "None"}`);
      Logger.debug(
        `Data Reference: ${JSON.stringify(relation.dataRef, null, 2) || "None"}`
      );
      Logger.debug("Chain Configuration:");
      relation.config.forEach((nodeConfig, index) => {
        Logger.debug(`  Node ${index + 1}:`);
        Logger.debug(`    Services: ${JSON.stringify(nodeConfig.services)}`);
        Logger.debug(`    Chain ID: ${nodeConfig.chainId}`);
        Logger.debug(`    Index: ${nodeConfig.index}`);
        Logger.debug(`    Count: ${nodeConfig.count}`);
        Logger.debug(`    Location: ${nodeConfig.location}`);
        Logger.debug(`    Next Target ID: ${nodeConfig.nextTargetId}`);
        Logger.debug(`    Chain Type: ${nodeConfig.chainType}`);
        Logger.debug(`    Monitoring Host: ${nodeConfig.monitoringHost}`);
        Logger.debug(`    Child Mode: ${nodeConfig.childMode}`);
      });
    });
  }
  logWorkflow(workflow) {
    Object.entries(workflow).forEach(([workflowId, node]) => {
      Logger.header(`Workflow Node: ${workflowId}`);
      Object.entries(node).forEach(([key, value]) => {
        Logger.debug(`- ${key}: ${JSON.stringify(value)}`);
      });
    });
  }
};

// src/core/NodeSupervisor.ts
var NodeSupervisor = class _NodeSupervisor {
  // private reporting: ReportingAgent | null = null;
  /**
   * Creates a new NodeSupervisor instance
   * @private
   */
  constructor() {
    this.uid = "@supervisor:default";
    this.ctn = "@container:default";
    this.nsLogger = new NodeSupervisorLogger();
    this.nodes = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
    this.childChains = /* @__PURE__ */ new Map();
    this.remoteServiceCallback = DefaultCallback.SERVICE_CALLBACK;
    this.broadcastSetupCallback = DefaultCallback.SETUP_CALLBACK;
  }
  /**
   * Retrieves or creates a NodeSupervisor instance (Singleton pattern)
   * @param {boolean} refresh - Whether to force create a new instance
   * @returns {NodeSupervisor} The NodeSupervisor instance
   */
  static retrieveService(refresh = false) {
    if (!_NodeSupervisor.instance || refresh) {
      const instance = new _NodeSupervisor();
      _NodeSupervisor.instance = instance;
    }
    return _NodeSupervisor.instance;
  }
  log(type) {
    switch (type) {
      case "chains":
        this.nsLogger.logChains(this.chains);
        break;
      case "monitoring-workflow": {
        const monitoring = MonitoringAgent.retrieveService();
        const workflow = monitoring.getWorkflow();
        this.nsLogger.logWorkflow(workflow);
        break;
      }
      default: {
        break;
      }
    }
  }
  getChain(chainId) {
    return this.chains.get(chainId);
  }
  /**
   * Sets the remote service callback function
   * @param {ServiceCallback} remoteServiceCallback - The callback to handle remote service calls
   */
  setRemoteServiceCallback(remoteServiceCallback) {
    this.remoteServiceCallback = remoteServiceCallback;
  }
  /**
   * Sets the broadcast setup callback function
   * @param {SetupCallback} broadcastSetupCallback - The callback to handle broadcast setup signals
   */
  setBroadcastSetupCallback(broadcastSetupCallback) {
    this.broadcastSetupCallback = broadcastSetupCallback;
  }
  /**
   * Sets the broadcast reporting callback function
   * @param {BroadcastReportingCallback} broadcastReportingCallback - The callback to handle broadcast reporting signals
   */
  setBroadcastReportingCallback(broadcastReportingCallback) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setBroadcastReportingCallback(broadcastReportingCallback);
  }
  /**
   * Sets the monitoring reporting callback function
   * @param {ReportingCallback} reportingCallback - The callback to handle monitoring reports
   */
  setMonitoringCallback(reportingCallback) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setReportingCallback(reportingCallback);
  }
  /**
   * Sets the unique identifier for this supervisor instance
   * @param {string} uid - The unique identifier
   */
  setUid(uid) {
    this.ctn = `@container:${uid}`;
    this.uid = `@supervisor:${uid}`;
  }
  /**
   * Handles supervisor requests (node setup, creation, deletion, etc.)
   * @param {SupervisorPayload} payload - The request payload
   * @returns {Promise<void|string>} Promise resolving to a string if applicable
   */
  handleRequest(payload) {
    return __async(this, null, function* () {
      switch (payload.signal) {
        case NodeSignal.NODE_SETUP:
          Logger.event(`handle NODE_SETUP`);
          return yield this.setupNode(payload.config);
        case NodeSignal.NODE_CREATE:
          Logger.event(`handle NODE_CREATE`);
          return yield this.createNode(payload.params);
        case NodeSignal.NODE_DELETE:
          Logger.event(`handle NODE_DELETE`);
          return yield this.deleteNode(payload.id);
        case NodeSignal.NODE_PAUSE:
          Logger.event(`handle NODE_PAUSE`);
          return yield this.pauseNode(payload.id);
        case NodeSignal.NODE_DELAY:
          Logger.event(`handle NODE_DELAY`);
          return yield this.delayNode(payload.id, payload.delay);
        case NodeSignal.NODE_RUN:
          Logger.event(`handle NODE_RUN`);
          return yield this.runNode(payload.id, payload.data);
        case NodeSignal.NODE_SEND_DATA:
          Logger.event(`handle NODE_SEND_DATA`);
          return yield this.sendNodeData(payload.id);
        case NodeSignal.CHAIN_PREPARE:
          Logger.event(`handle CHAIN_PREPARE`);
          return yield this.prepareChainDistribution(payload.id);
        case NodeSignal.CHAIN_START:
          Logger.event(`handle CHAIN_START`);
          return yield this.startChain(payload.id, payload.data);
        case NodeSignal.CHAIN_START_PENDING_OCCURRENCE:
          Logger.event(`handle CHAIN_START_PENDING_OCCURRENCE`);
          return yield this.startPendingChain(payload.id);
        case NodeSignal.CHAIN_DEPLOY: {
          Logger.event(`handle CHAIN_DEPLOY`);
          return yield this.deployChain(payload.config, payload.data);
        }
        default:
          Logger.warn(
            `${this.ctn}: Unknown signal received: ${JSON.stringify(payload, null, 2)}`
          );
      }
    });
  }
  localReport(status, chainId) {
    const monitoring = MonitoringAgent.retrieveService();
    const reporting = monitoring.genReportingAgent({
      chainId,
      nodeId: "supervisor",
      index: -1,
      count: -1
    });
    reporting.notify({ status }, "local-signal");
  }
  /**
   * Deploys a new processing chain
   * @param {ChainConfig} config - Configuration for the new chain
   * @param {PipelineData} data - Initial data to start the chain
   * @returns {Promise<string>} The new chain identifier
   */
  deployChain(config, data, parentChainId) {
    return __async(this, null, function* () {
      try {
        if (!config) {
          throw new Error(`${this.ctn}: Chain configuration is required`);
        }
        Logger.info(`${this.ctn}: Starting a new chain deployment...`);
        const chainId = this.createChain(config);
        yield this.prepareChainDistribution(chainId);
        const chain = this.chains.get(chainId);
        if (chain) {
          chain.dataRef = data;
        }
        Logger.info(
          `${this.ctn}: Deployment for chain ${chainId} has successfully started...`
        );
        if (parentChainId) {
          const children = this.childChains.get(parentChainId) || [];
          children.push(chainId);
          this.childChains.set(parentChainId, children);
        }
        this.localReport(ChainStatus.CHAIN_DEPLOYED, chainId);
        return chainId;
      } catch (error) {
        Logger.error(`${this.ctn}{deployChain}: ${error.message}`);
        throw error;
      }
    });
  }
  /**
   * Creates a new node with the given configuration
   * @param {NodeConfig} config - The node configuration
   * @returns {Promise<string>} The new node identifier
   */
  createNode(config) {
    return __async(this, null, function* () {
      const node = new Node();
      const nodeId = node.getId();
      node.setConfig(config);
      this.nodes.set(nodeId, node);
      Logger.info(
        `${this.ctn}: Node ${nodeId} created with config: ${JSON.stringify(config, null, 2)}`
      );
      return nodeId;
    });
  }
  /**
   * Sets up a new node with the given configuration
   * @param {NodeConfig} config - The node configuration
   * @param {boolean} initiator - Whether the node is the chain initiator
   * @returns {Promise<string>} The new node identifier
   */
  setupNode(config, initiator = false) {
    return __async(this, null, function* () {
      this.updateChain([config]);
      const nodeId = yield this.createNode(config);
      const node = this.nodes.get(nodeId);
      if (!node) {
        Logger.warn(`${this.ctn}: Attempted to setup undefined node`);
        return nodeId;
      }
      Logger.header(`Setup node ${node == null ? void 0 : node.getId()}...`);
      yield this.setRemoteMonitoringHost(config);
      const processors = config.services.map(
        (service) => new PipelineProcessor(
          typeof service === "string" ? { targetId: service } : service
        )
      );
      yield this.addProcessors(nodeId, processors);
      Logger.info(
        `${this.ctn}: Node ${nodeId} setup completed with ${processors.length} processors`
      );
      if (config.nextTargetId !== void 0) {
        node.setNextNodeInfo(
          config.nextTargetId,
          NodeType.REMOTE,
          config.nextMeta
        );
      } else if (!initiator) {
        Logger.warn(
          `${this.ctn}: Cannot set next node info: nextTargetId is undefined`
        );
      }
      this.notify(nodeId, ChainStatus.NODE_SETUP_COMPLETED, "global-signal");
      return nodeId;
    });
  }
  /**
   * Handles externals notifications about a chain status change
   * @param {string} chainId - The chain identifier
   * @param {NotificationStatus} status - The new chain status
   */
  handleNotification(chainId, status) {
    try {
      const chain = this.chains.get(chainId);
      if (!chain) {
        Logger.warn(`${this.ctn}: Chain with ID ${chainId} not found.`);
        return;
      }
      const rootNodeId = chain.rootNodeId;
      if (!rootNodeId) {
        Logger.warn(`${this.ctn}: Root node ID missing for chain ${chainId}.`);
        return;
      }
      const node = this.nodes.get(rootNodeId);
      if (!node) {
        Logger.warn(`${this.ctn}: Node with ID ${rootNodeId} not found.`);
        return;
      }
      node.notify(status, "global-signal");
      Logger.info(
        `${this.ctn}:
		Notification sent to node
${rootNodeId}
		with status ${JSON.stringify(status)}.`
      );
    } catch (error) {
      Logger.error(
        `${this.ctn}: Failed to handle notification for chain ${chainId}: ${error.message}`
      );
    }
  }
  /**
   * Notifies a node about a chain status change
   * @param {string} nodeId - The node identifier to notify
   * @param {ChainStatus.Type} status - The new chain status to notify
   */
  notify(nodeId, status, type = "local-signal") {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.notify(status, type);
    } else {
      Logger.warn(`${this.ctn}: Can't notify non-existing node ${nodeId}`);
    }
  }
  /**
   * Adds processors to a node
   * @param {string} nodeId - The node identifier
   * @param {PipelineProcessor[]} processors - Array of processors to add
   */
  addProcessors(nodeId, processors) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.addPipeline(processors);
        Logger.info(`${this.ctn}: Processors added to Node ${nodeId}.`);
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Deletes a node
   * @param {string} nodeId - The node identifier to delete
   */
  deleteNode(nodeId) {
    return __async(this, null, function* () {
      if (this.nodes.has(nodeId)) {
        this.nodes.delete(nodeId);
        Logger.info(`${this.ctn}: Node ${nodeId} deleted.`);
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Pauses a node
   * @param {string} nodeId - The node identifier to pause
   */
  pauseNode(nodeId) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.updateStatus(ChainStatus.NODE_PAUSED);
        Logger.info(`${this.ctn}: Node ${nodeId} paused.`);
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Delays the execution of a node
   * @param {string} nodeId - The node identifier
   * @param {number} delay - The delay in milliseconds
   */
  delayNode(nodeId, delay) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.setDelay(delay);
        Logger.info(`${this.ctn}: Node ${nodeId} delayed by ${delay} ms.`);
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Creates a new chain with the given configuration
   * @param {ChainConfig} config - The chain configuration
   * @returns {string} The new chain identifier
   */
  createChain(config) {
    var _a;
    try {
      if (!config || !Array.isArray(config)) {
        throw new Error("Invalid chain configuration: config must be an array");
      }
      const timestamp = Date.now();
      const chainId = `${this.uid}-${timestamp}-${randomUUID3().slice(0, 8)}`;
      const relation = {
        config
      };
      this.chains.set(chainId, relation);
      let monitoringHost = config[0].rootConfig ? config[0].rootConfig.monitoringHost : (_a = config[0]) == null ? void 0 : _a.monitoringHost;
      const count = Array.isArray(config) ? config.length : 0;
      if (count > 0) {
        config.forEach((value, index) => {
          if (value) {
            value.index = index;
            value.count = count;
            value.monitoringHost = monitoringHost;
          }
        });
      } else {
        Logger.warn(`${this.ctn}: Chain configuration is empty`);
      }
      Logger.header(`${this.ctn}:
	Chain ${chainId} creation has started...`);
      return chainId;
    } catch (error) {
      Logger.header(`${this.ctn}{createChain}:
	${error.message}`);
      throw error;
    }
  }
  /**
   * Updates an existing chain with new configurations
   * @param {ChainConfig} config - The new chain configurations to add
   * @returns {string} The chain identifier
   */
  updateChain(config) {
    if (config.length === 0 || !config[0].chainId) {
      throw new Error("Invalid chain configuration");
    }
    const chainId = config[0].chainId;
    let relation = this.chains.get(chainId);
    if (relation) {
      relation.config = relation.config.concat(config);
      Logger.info(
        `${this.ctn}: Chain ${chainId} updated with ${config.length} new configurations`
      );
    } else {
      relation = {
        config
      };
      this.chains.set(chainId, relation);
      Logger.info(
        `${this.ctn}: Chain ${chainId} created with ${config.length} configurations`
      );
    }
    return chainId;
  }
  /**
   * Sets the remote monitoring host for a chain
   * @param {NodeConfig} config - The node configuration containing the monitoring host
   */
  setRemoteMonitoringHost(config) {
    return __async(this, null, function* () {
      const remoteMonitoringHost = config.monitoringHost;
      if (!remoteMonitoringHost) {
        throw new Error(
          `${this.ctn}: No Monitoring Host set for Chain ${config.chainId} during distribution`
        );
      }
      const monitoring = MonitoringAgent.retrieveService();
      monitoring.setRemoteMonitoringHost(config.chainId, remoteMonitoringHost);
    });
  }
  /**
   * Prepares the distribution of a processing chain
   * @param {string} chainId - The chain identifier
   */
  prepareChainDistribution(chainId) {
    return __async(this, null, function* () {
      try {
        Logger.header(
          `${this.ctn}:
	Chain distribution for ${chainId} in progress...`
        );
        const chain = this.chains.get(chainId);
        if (!chain) {
          throw new Error(`${this.ctn}: Chain ${chainId} not found`);
        }
        const chainConfig = chain.config;
        const localConfigs = chainConfig.filter(
          (config) => config.location === "local"
        );
        const remoteConfigs = chainConfig.filter(
          (config) => config.location === "remote"
        );
        if (!localConfigs) {
          Logger.warn("Local config undefined");
        }
        if (localConfigs.length > 0) {
          const rootNodeId = yield this.setupNode(
            __spreadProps(__spreadValues({}, localConfigs[0]), { chainId }),
            true
          );
          chain.rootNodeId = rootNodeId;
          let prevNodeId = rootNodeId;
          for (let i = 1; i < localConfigs.length; i++) {
            const currentNodeId = yield this.setupNode(
              __spreadProps(__spreadValues({}, localConfigs[i]), {
                chainId
              }),
              true
            );
            const prevNode = this.nodes.get(prevNodeId);
            if (prevNode) {
              prevNode.setNextNodeInfo(currentNodeId, NodeType.LOCAL);
            }
            prevNodeId = currentNodeId;
          }
          if (!remoteConfigs) {
            Logger.warn("Remote config undefined");
          }
          if (remoteConfigs.length > 0 && remoteConfigs[0].services.length > 0) {
            const lastLocalNode = this.nodes.get(prevNodeId);
            if (lastLocalNode) {
              const nextService = remoteConfigs[0].services[0];
              lastLocalNode.setNextNodeInfo(
                typeof nextService === "string" ? nextService : nextService.targetId,
                NodeType.REMOTE,
                typeof nextService === "string" ? void 0 : nextService.meta
              );
            }
          }
        } else {
          Logger.warn(
            `${this.ctn}: No local config found for chain ${chainId}. Root node unavailable.`
          );
        }
        try {
          if (remoteConfigs.length > 0) {
            const updatedRemoteConfigs = remoteConfigs.map(
              (config, index) => {
                var _a;
                const nextConfig = (_a = remoteConfigs[index + 1]) == null ? void 0 : _a.services[0];
                const nodeConfig = __spreadProps(__spreadValues({}, config), {
                  nextTargetId: nextConfig ? typeof nextConfig === "string" ? nextConfig : nextConfig.targetId : void 0,
                  nextMeta: nextConfig && typeof nextConfig !== "string" ? nextConfig.meta : void 0
                });
                return nodeConfig;
              }
            );
            yield this.broadcastNodeSetupSignal(chainId, updatedRemoteConfigs);
          }
        } catch (error) {
          Logger.error(
            `${this.ctn}{prepareChainDistribution, broadcast}: ${error.message}`
          );
        }
      } catch (error) {
        Logger.error(
          `${this.ctn}{prepareChainDistribution}: ${error.message}`
        );
        throw error;
      }
    });
  }
  /**
   * Broadcasts a setup signal for remote nodes in a chain
   * @param {string} chainId - The chain identifier
   * @param {ChainConfig} remoteConfigs - The remote node configurations
   */
  broadcastNodeSetupSignal(chainId, remoteConfigs) {
    return __async(this, null, function* () {
      const message = {
        signal: NodeSignal.NODE_SETUP,
        chain: {
          id: chainId,
          config: remoteConfigs
        }
      };
      try {
        yield this.broadcastSetupCallback(message);
        Logger.info(
          `${this.ctn}: Node creation signal broadcasted with chainId: ${chainId} for remote configs`
        );
      } catch (error) {
        Logger.error(
          `${this.ctn}: Failed to broadcast node creation signal: ${error}`
        );
      }
    });
  }
  /**
   * Starts a pending chain
   * @param {string} chainId - The chain identifier
   */
  startPendingChain(chainId) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      const chain = this.chains.get(chainId);
      const data = chain == null ? void 0 : chain.dataRef;
      if (data) {
        const rootConfig = (_a = chain == null ? void 0 : chain.config[0]) == null ? void 0 : _a.rootConfig;
        if (rootConfig) {
          const rootNodeId = chain == null ? void 0 : chain.rootNodeId;
          if (!rootNodeId) {
            Logger.error(
              `${this.ctn}: Root node ID for chain ${chainId} not found.`
            );
            throw new Error("Root node ID not found");
          }
          const chainMode = ((_c = (_b = chain == null ? void 0 : chain.config[0]) == null ? void 0 : _b.rootConfig) == null ? void 0 : _c.childMode) === "parallel" ? "parallel" : "serial";
          if (chainMode === "parallel" /* PARALLEL */) {
            Logger.warn(`// Starting parallel child chain: ${chainId}`);
            this.notify(
              rootNodeId,
              ChainStatus.CHILD_CHAIN_STARTED,
              "global-signal"
            );
            this.startChain(chainId, data).then(
              () => this.notify(
                rootNodeId,
                ChainStatus.CHILD_CHAIN_COMPLETED,
                "global-signal"
              )
            ).catch((error) => {
              Logger.error(`Failed to start parallel child chain: ${error}`);
            });
          } else {
            Logger.warn(`__ Starting serial child chain: ${chainId}`);
            yield this.startChain(chainId, data);
            this.notify(
              rootNodeId,
              ChainStatus.CHILD_CHAIN_COMPLETED,
              "global-signal"
            );
          }
        } else {
          yield this.startChain(chainId, data);
        }
      } else {
        Logger.warn(`${this.ctn}:
	Nothing to process on chain ${chainId}`);
      }
    });
  }
  /**
   * Starts a new chain
   * @param {string} chainId - The chain identifier
   * @param {PipelineData} data - The initial data to process
   */
  startChain(chainId, data) {
    return __async(this, null, function* () {
      Logger.header(`<<Start Chain>>: Chain ${chainId} requested...`);
      Logger.info(`Data: ${JSON.stringify(data, null, 2)}`);
      const chain = this.chains.get(chainId);
      if (!chain) {
        Logger.warn(`Chain ${chainId} not found.`);
        return;
      }
      const rootNodeId = chain.rootNodeId;
      if (!rootNodeId) {
        Logger.error(`${this.ctn}: Root node ID for chain ${chainId} not found.`);
        return;
      }
      const rootNode = this.nodes.get(rootNodeId);
      if (!rootNode) {
        Logger.error(
          `${this.ctn}: Root node ${rootNodeId} for chain ${chainId} not found.`
        );
        return;
      }
      try {
        yield this.runNode(rootNodeId, data);
        Logger.info(
          `${this.ctn}: Chain ${chainId} started with root node ${rootNodeId}.`
        );
      } catch (error) {
        Logger.error(`${this.ctn}: Failed to start chain ${chainId}: ${error}`);
      }
    });
  }
  /**
   * Executes a node with the given data
   * @param {string} nodeId - The node identifier
   * @param {PipelineData} data - The data to process
   */
  runNode(nodeId, data) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        yield node.execute(data);
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Executes a node based on the given callback payload
   * @param {CallbackPayload} payload - The payload containing target ID, chain ID, and data
   */
  runNodeByRelation(payload) {
    return __async(this, null, function* () {
      try {
        const { targetId, chainId, data } = payload;
        Logger.info(`Received data for node hosting target ${targetId}`);
        if (chainId === void 0) {
          throw new Error("chainId is undefined");
        }
        if (targetId === void 0) {
          throw new Error("targetId is undefined");
        }
        const node = this.getNodesByServiceAndChain(targetId, chainId);
        if (!node || node.length === 0) {
          throw new Error(
            `No node found for targetId ${targetId} and chainId ${chainId}`
          );
        }
        const nodeId = node[0].getId();
        if (nodeId === void 0) {
          throw new Error(
            `No node ID exists for targetId ${targetId} and chainId ${chainId}`
          );
        }
        yield this.handleRequest({
          signal: NodeSignal.NODE_RUN,
          id: nodeId,
          data
        });
      } catch (error) {
        Logger.error(`Error in runNodeByRelation: ${error.message}`);
      }
    });
  }
  /**
   * Sends data from a node
   * @param {string} nodeId - The node identifier
   */
  sendNodeData(nodeId) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        try {
          yield node.sendData();
        } catch (err) {
          const error = err;
          Logger.error(
            `${this.ctn}: Node ${nodeId} send data failed: ${error.message}`
          );
        }
      } else {
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
      }
    });
  }
  /**
   * Gets all the nodes managed by this supervisor
   * @returns {Map<string, Node>} Map of nodes
   */
  getNodes() {
    return this.nodes;
  }
  /**
   * Gets all nodes associated with a specific service and chain
   * @param {string} serviceUid - The service identifier
   * @param {string} chainId - The chain identifier
   * @returns {Node[]} Array of nodes matching the criteria
   */
  getNodesByServiceAndChain(serviceUid, chainId) {
    return Array.from(this.nodes.values()).filter((node) => {
      const nodeConfig = node.getConfig();
      if (!nodeConfig) {
        return false;
      }
      return nodeConfig.chainId === chainId && nodeConfig.services.some(
        (service) => typeof service === "string" ? service === serviceUid : service.targetId === serviceUid
      );
    });
  }
};

// src/extensions/DefaultMonitoringSignalHandler.ts
var Ext;
((Ext5) => {
  class MonitoringSignalHandler {
    /**
     * Triggers the pending occurrence workflow by sending a signal to the supervisor
     * @private
     * @static
     * @param {string} chainId - The ID of the chain
     * @returns {Promise<void>}
     */
    static triggerPendingOccurrence(chainId) {
      return __async(this, null, function* () {
        const supervisor = NodeSupervisor.retrieveService();
        const payload = {
          signal: NodeSignal.CHAIN_START_PENDING_OCCURRENCE,
          id: chainId
        };
        yield supervisor.handleRequest(payload);
        Logger.event(`MonitoringSignalHandler: Start Pending Occurrence...`);
      });
    }
    /**
     * Handles a reporting message and triggers appropriate actions based on the signal type.
     * This function serves as a flexible entry point for processing intercepted signals
     * originating from the reporting agent, allowing adaptation to various system needs.
     * Specifically, it processes node setup completion signals in a chain, but can be
     * extended to handle other signal types.
     *
     * Note: This is a bridge between global messages and the rest of the system,
     * enabling the dispatch of actions tailored to specific goals.
     *
     * @static
     * @async
     * @param {ReportingMessage} message - The message containing the signal and associated chain data.
     * @returns {Promise<void>} - Resolves when the message is fully processed.
     */
    static handle(message) {
      return __async(this, null, function* () {
        var _a;
        const monitoring = MonitoringAgent.retrieveService();
        const status = (_a = message.signal) == null ? void 0 : _a.status;
        const chainId = message.chainId;
        switch (status) {
          /*
           * Handle ChainStatus.NODE_SETUP_COMPLETED
           */
          case ChainStatus.NODE_SETUP_COMPLETED: {
            let count = monitoring.getChainSetupCount(chainId);
            if (!count) {
              monitoring.setChainSetupCount(chainId, 1);
            } else {
              monitoring.setChainSetupCount(chainId, count + 1);
            }
            count = monitoring.getChainSetupCount(chainId);
            if (count && count >= message.count) {
              monitoring.setChainSetupCompleted(chainId);
              Logger.event(
                `MonitoringSignalHandler: Chain Nodes setup completed`
              );
              let chainDeployed = monitoring.getChainDeployed(chainId);
              if (chainDeployed) {
                yield this.triggerPendingOccurrence(chainId);
              }
            }
            break;
          }
          /*
           * Handle ChainStatus.CHAIN_DEPLOYED
           */
          case ChainStatus.CHAIN_DEPLOYED: {
            monitoring.setChainDeployed(chainId);
            Logger.event(`MonitoringSignalHandler: Chain deployed`);
            const chainSetupCompleted = monitoring.getChainSetupCompleted(chainId);
            if (chainSetupCompleted) {
              yield this.triggerPendingOccurrence(chainId);
            }
            break;
          }
          /*
          case ChainStatus.CHILD_CHAIN_COMPLETED:
            await monitoring.handleChildChainCompletion(
              '', // message.childChainId!,
            );
            break;
            */
          /*
           *
           */
          default:
            Logger.event(
              `MonitoringSignalHandler:
		Signal handler not found for ${JSON.stringify(message.signal)}`
            );
            break;
        }
      });
    }
  }
  Ext5.MonitoringSignalHandler = MonitoringSignalHandler;
})(Ext || (Ext = {}));

// src/utils/http.ts
import { Buffer as Buffer2 } from "buffer";
import * as http from "http";
import * as https from "https";
var post = (url, data) => __async(void 0, null, function* () {
  const useSSL = url.protocol === "https:";
  const options = {
    hostname: url.hostname,
    port: url.port || (useSSL ? "443" : "80"),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer2.byteLength(data)
    }
  };
  return new Promise((resolve, reject) => {
    const req = (useSSL ? https : http).request(options, (res) => {
      let data2 = "";
      res.on("data", (chunk) => {
        data2 += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data2);
        } else {
          reject(
            new Error(
              `HTTP Error: ${res.statusCode} ${res.statusMessage} - URL: ${options.hostname}${options.path}`
            )
          );
        }
      });
    });
    req.on("error", (error) => {
      reject(new Error(`Request failed to ${url.href}: ${error.message}`));
    });
    req.write(data);
    req.end();
  });
});

// src/extensions/DefaultReportingCallbacks.ts
var Ext2;
((Ext5) => {
  Ext5.reportingCallback = (payload) => __async(void 0, null, function* () {
    const { message, reportSignalHandler } = payload;
    yield reportSignalHandler(message);
  });
  const defaultReportSignalHandler = (message) => __async(void 0, null, function* () {
    Logger.debug({ message: `${JSON.stringify(message, null, 2)}` });
    yield Ext.MonitoringSignalHandler.handle(message);
  });
  const defaultMonitoringResolver = (chainId) => __async(void 0, null, function* () {
    try {
      const monitoring = MonitoringAgent.retrieveService();
      const monitoringHost = monitoring.getRemoteMonitoringHost(chainId);
      if (monitoringHost !== void 0) {
        Logger.info({
          message: `DRC: Resolving host for monitoring: ${monitoringHost}`
        });
        return monitoringHost;
      } else throw new Error("Monitoring host not found");
    } catch (error) {
      Logger.error({ message: error.message });
    }
  });
  const broadcastReportingCallback = (payload) => __async(void 0, null, function* () {
    const { message, path, monitoringResolver } = payload;
    const monitoringHost = yield monitoringResolver(message.chainId);
    const url = new URL(path, monitoringHost);
    const data = JSON.stringify(message);
    Logger.info(`BroadcastReportingCallback: Sending message to ${url}`);
    yield post(url, data);
  });
  Ext5.setMonitoringCallbacks = (dcPayload) => __async(void 0, null, function* () {
    const { paths, reportSignalHandler, monitoringResolver } = dcPayload;
    const supervisor = NodeSupervisor.retrieveService();
    supervisor.setMonitoringCallback(
      (message) => __async(void 0, null, function* () {
        const payload = {
          message,
          reportSignalHandler: reportSignalHandler != null ? reportSignalHandler : defaultReportSignalHandler
        };
        yield (0, Ext5.reportingCallback)(payload);
      })
    );
    if (reportSignalHandler) {
      Logger.info("Monitoring Callback set with custom Signal Handler");
    } else {
      Logger.info("Monitoring Callback set with default Signal Handler");
    }
    supervisor.setBroadcastReportingCallback(
      (message) => __async(void 0, null, function* () {
        const payload = {
          message,
          path: paths.notify,
          monitoringResolver: monitoringResolver != null ? monitoringResolver : defaultMonitoringResolver
        };
        yield broadcastReportingCallback(payload);
      })
    );
    if (monitoringResolver) {
      Logger.info("Broadcast Reporting Callback set with custom Resolver");
    } else {
      Logger.info("Broadcast Reporting Callback set with default Resolver");
    }
  });
})(Ext2 || (Ext2 = {}));

// src/extensions/DefaultResolverCallbacks.ts
var Ext3;
((Ext5) => {
  Ext5.broadcastSetupCallback = (payload) => __async(void 0, null, function* () {
    const { message, hostResolver, path } = payload;
    Logger.info(`Broadcast message: ${JSON.stringify(message, null, 2)}`);
    const chainConfigs = message.chain.config;
    const chainId = message.chain.id;
    for (const config of chainConfigs) {
      if (config.services.length === 0) {
        Logger.warn("Empty services array encountered in config");
        continue;
      }
      const service = config.services[0];
      const targetId = typeof service === "string" ? service : service.targetId;
      const meta = typeof service === "string" ? void 0 : service.meta;
      const host = hostResolver(targetId, meta);
      if (!host) {
        Logger.warn(`No container address found for targetId: ${targetId}`);
        continue;
      }
      try {
        const data = JSON.stringify({
          chainId,
          remoteConfigs: config
        });
        const url = new URL(path, host);
        void post(url, data);
      } catch (error) {
        Logger.error(
          `Unexpected error sending setup request to ${host} for targetId ${targetId}: ${error.message}`
        );
      }
    }
  });
  Ext5.remoteServiceCallback = (payload) => __async(void 0, null, function* () {
    const { cbPayload, hostResolver, path } = payload;
    Logger.info(
      `Service callback payload: ${JSON.stringify(payload, null, 2)}`
    );
    try {
      if (!cbPayload.chainId) {
        throw new Error("payload.chainId is undefined");
      }
      const nextConnectorUrl = hostResolver(cbPayload.targetId, cbPayload.meta);
      if (!nextConnectorUrl) {
        throw new Error(
          `Next connector URI not found for the following target service: ${cbPayload.targetId}`
        );
      }
      const url = new URL(path, nextConnectorUrl);
      Logger.info(`Sending data to next connector on: ${url.href}`);
      const data = JSON.stringify(cbPayload);
      yield post(url, data);
    } catch (error) {
      Logger.error(
        `Error sending data to next connector: ${error.message}`
      );
      throw error;
    }
  });
  Ext5.setResolverCallbacks = (dcPayload) => __async(void 0, null, function* () {
    const { paths, hostResolver } = dcPayload;
    const supervisor = NodeSupervisor.retrieveService();
    supervisor.setBroadcastSetupCallback(
      (message) => __async(void 0, null, function* () {
        const payload = {
          message,
          hostResolver,
          path: paths.setup
        };
        yield (0, Ext5.broadcastSetupCallback)(payload);
      })
    );
    supervisor.setRemoteServiceCallback(
      (cbPayload) => __async(void 0, null, function* () {
        const payload = {
          cbPayload,
          hostResolver,
          path: paths.run
        };
        yield (0, Ext5.remoteServiceCallback)(payload);
      })
    );
  });
})(Ext3 || (Ext3 = {}));

// src/core/PipelineDataCombiner.ts
var PipelineDataCombiner = class {
  constructor(strategy = CombineStrategy.MERGE, customCombineFunction) {
    this.strategy = strategy;
    this.customCombineFunction = customCombineFunction;
  }
  merge(dataSets) {
    return dataSets.flat();
  }
  union(dataSets) {
    const mergedData = this.merge(dataSets);
    if (Array.isArray(mergedData)) {
      return Array.from(new Set(mergedData));
    }
    throw new Error("PipelineData must be an array.");
  }
  applyStrategy(dataSets) {
    switch (this.strategy) {
      case CombineStrategy.MERGE:
        return this.merge(dataSets);
      case CombineStrategy.UNION:
        return this.union(dataSets);
      case CombineStrategy.CUSTOM:
        if (this.customCombineFunction) {
          return this.customCombineFunction(dataSets);
        }
        throw new Error("Custom combine function is not defined.");
      default:
        throw new Error(`Unknown combine strategy: ${this.strategy}`);
    }
  }
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  setCustomCombineFunction(combineFunction) {
    this.customCombineFunction = combineFunction;
  }
};

// src/index.ts
var Ext4;
((Ext5) => {
  Ext5.Monitoring = Ext;
  Ext5.Reporting = Ext2;
  Ext5.Resolver = Ext3;
})(Ext4 || (Ext4 = {}));
export {
  ChainStatus,
  ChainType,
  CombineStrategy,
  DataType,
  Ext4 as Ext,
  NodeSignal,
  NodeSupervisor,
  NodeType,
  PipelineDataCombiner,
  PipelineProcessor
};
//# sourceMappingURL=index.mjs.map