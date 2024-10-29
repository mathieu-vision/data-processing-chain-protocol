"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  ChainStatus: () => ChainStatus,
  ChainType: () => ChainType,
  CombineStrategy: () => CombineStrategy,
  DataType: () => DataType,
  NodeSignal: () => NodeSignal,
  NodeSupervisor: () => NodeSupervisor,
  NodeType: () => NodeType,
  PipelineDataCombiner: () => PipelineDataCombiner,
  PipelineProcessor: () => PipelineProcessor,
  broadcastSetupCallback: () => broadcastSetupCallback,
  remoteServiceCallback: () => remoteServiceCallback,
  setMonitoringCallbacks: () => setMonitoringCallbacks,
  setResolverCallbacks: () => setResolverCallbacks
});
module.exports = __toCommonJS(src_exports);

// src/extra/Logger.ts
var import_fs = require("fs");
var import_path = require("path");
var import_util = require("util");
var Colors = {
  reset: "\x1B[0m",
  info: "\x1B[32m",
  // green
  warn: "\x1B[93m",
  // yellow
  error: "\x1B[31m",
  // red
  header: "\x1B[36m"
  // cyan
};
var Logger = class {
  static configure(config) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
  }
  static formatMessage(level, message) {
    const now = /* @__PURE__ */ new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `${year}-${month}-${day}:${hours}.${minutes}.${seconds}`;
    return `${Colors[level]}${timestamp} [${level.toUpperCase()}]: ${message}${Colors.reset}
`;
  }
  static log(level, message) {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const formattedMessage = this.formatMessage(level, message);
    process.stdout.write(formattedMessage);
    if (this.config.preserveLogs && this.config.externalCallback) {
      this.config.externalCallback(level, message, timestamp);
    }
  }
  static info(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("info", msg);
  }
  static warn(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("warn", msg);
  }
  static error(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("error", msg);
  }
  static header(message) {
    const msg = typeof message === "string" ? message : (0, import_util.format)(message);
    this.log("header", msg);
  }
};
Logger.config = {
  preserveLogs: false
};
var DEFAULT_LOG_PATH = (0, import_path.join)(process.cwd(), "logs");
var logStream;
var getLogFileName = () => {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  return `dpcp-${timestamp}.log`;
};
var initDiskLogger = () => {
  try {
    (0, import_fs.mkdirSync)(DEFAULT_LOG_PATH, { recursive: true });
    const logFile = (0, import_path.join)(DEFAULT_LOG_PATH, getLogFileName());
    logStream = (0, import_fs.createWriteStream)(logFile, { flags: "a" });
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
  ChainType2.PERSISTANT = 2;
  ChainType2.DEFAULT = 1;
})(ChainType || (ChainType = {}));
var ChainStatus;
((ChainStatus2) => {
  ChainStatus2.NODE_PAUSED = "node_paused";
  ChainStatus2.NODE_PENDING = "node_pending";
  ChainStatus2.NODE_IN_PROGRESS = "node_in_progress";
  ChainStatus2.NODE_COMPLETED = "node_completed";
  ChainStatus2.NODE_FAILED = "node_failed";
  ChainStatus2.NODE_SETUP_COMPLETED = "node_setup_completed";
  ChainStatus2.CHAIN_SETUP_COMPLETED = "chain_setup_completed";
})(ChainStatus || (ChainStatus = {}));
var NodeSignal;
((NodeSignal2) => {
  NodeSignal2.NODE_SETUP = "node_setup";
  NodeSignal2.NODE_CREATE = "node_create";
  NodeSignal2.NODE_DELETE = "node_delete";
  NodeSignal2.NODE_PAUSE = "node_pause";
  NodeSignal2.NODE_DELAY = "node_delay";
  NodeSignal2.NODE_RUN = "node_run";
  NodeSignal2.NODE_SEND_DATA = "node_send_data";
  NodeSignal2.CHAIN_PREPARE = "chain_prepare";
  NodeSignal2.CHAIN_START = "chain_start";
  NodeSignal2.CHAIN_START_PENDING = "chain_start_pending";
  NodeSignal2.CHAIN_DEPLOY = "chain_deploy";
})(NodeSignal || (NodeSignal = {}));

// src/core/Node.ts
var import_timers = require("timers");
var import_node_crypto2 = require("crypto");

// src/agents/Agent.ts
var import_node_events = __toESM(require("events"));
var import_node_crypto = require("crypto");
var Agent = class extends import_node_events.default {
  /**
   * Creates a new Agent instance with a unique identifier
   */
  constructor() {
    super();
    this.uid = (0, import_node_crypto.randomUUID)();
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
  notify(status, type = "local-signal") {
    Logger.info(`Status ${status} from ${this.uid}`);
    this.status.push(status);
    this.emit(type, status);
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
  /**
   * Creates a new MonitoringAgent instance
   */
  constructor() {
    super();
    this.status = /* @__PURE__ */ new Map();
    this.remoteMonitoringHost = /* @__PURE__ */ new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback = DefaultCallback.BROADCAST_REPORTING_CALLBACK;
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
  setReportingCallback(reportingCallback2) {
    this.reportingCallback = reportingCallback2;
  }
  /**
   * Sets the broadcast reporting callback function
   * @param {ReportingCallback} broadcastReportingCallback - The callback function to handle broadcast reports
   */
  setBroadcastReportingCallback(broadcastReportingCallback2) {
    this.broadcastReportingCallback = broadcastReportingCallback2;
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
      Logger.info(`Receive signal: ${signal} for node ${nodeId}`);
      const message = __spreadProps(__spreadValues({}, payload), { signal });
      if (index > 0) {
        void this.broadcastReportingCallback(message);
      } else {
        yield this.reportingCallback(message);
      }
    }));
    reporting.on("local-signal", (signal) => __async(this, null, function* () {
      var _a;
      const message = __spreadProps(__spreadValues({}, payload), { signal });
      const update = {
        [message.nodeId]: { [message.signal]: true }
      };
      let prev = (_a = this.status.get(message.chainId)) != null ? _a : {};
      const next = __spreadValues(__spreadValues({}, prev), update);
      this.status.set(message.chainId, next);
    }));
    return reporting;
  }
  /**
   * Gets the status for a specific chain
   * @param {string} chainId - The chain identifier
   * @returns {ChainStatus|undefined} The chain status if exists
   */
  getChainStatus(chainId) {
    return this.status.get(chainId);
  }
};

// src/core/Node.ts
var Node = class _Node {
  /**
   * Creates a new Node instance
   * @param {string[]} dependencies - Array of node dependency IDs
   */
  constructor(dependencies = []) {
    this.reporting = null;
    this.id = (0, import_node_crypto2.randomUUID)();
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
    const { chainId, index } = config;
    if (index !== void 0) {
      const monitoring = MonitoringAgent.retrieveService();
      this.reporting = monitoring.genReportingAgent({
        chainId,
        nodeId: this.id,
        index
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
  notify(notify) {
    try {
      if (this.reporting !== null) {
        this.reporting.notify(notify, "global-signal");
      } else {
        throw new Error("Reporter not set");
      }
    } catch (error) {
      Logger.error(error.message);
    }
  }
  /**
   * Executes node processing on input data
   * @param {PipelineData} data - Data to process
   * @returns {Promise<void>}
   */
  execute(data) {
    return __async(this, null, function* () {
      this.executionQueue = this.executionQueue.then(() => __async(this, null, function* () {
        try {
          this.updateStatus(ChainStatus.NODE_IN_PROGRESS);
          if (this.delay > 0) {
            yield this.sleep(this.delay);
          }
          const generator = this.getPipelineGenerator(this.pipelines, 3);
          for (const pipelineBatch of generator) {
            yield new Promise((resolve, reject) => {
              (0, import_timers.setImmediate)(() => __async(this, null, function* () {
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
      var _a, _b, _c;
      const supervisor = NodeSupervisor.retrieveService();
      const nodes = supervisor.getNodes();
      const currentNode = nodes.get(nodeId);
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
            chainId: (_a = currentNode.getConfig()) == null ? void 0 : _a.chainId,
            targetId: nextNodeInfo.id,
            data: pipelineData,
            meta: nextNodeInfo.meta
          });
        }
      } else {
        Logger.info(`End of pipeline reached by node ${nodeId}.`);
      }
      const isPersistant = ((_c = (_b = currentNode.config) == null ? void 0 : _b.chainType) != null ? _c : 0) & ChainType.PERSISTANT;
      if (!isPersistant) {
        yield supervisor.handleRequest({
          id: nodeId,
          signal: NodeSignal.NODE_DELETE
        });
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
    return new Promise((resolve) => (0, import_timers.setTimeout)(resolve, ms));
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
      this.reporting.notify(status);
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
  constructor(config) {
    this.targetId = config.targetId;
    this.meta = config.meta;
  }
  static setCallbackService(callbackService) {
    _PipelineProcessor.callbackService = callbackService;
  }
  digest(data) {
    return __async(this, null, function* () {
      if (_PipelineProcessor.callbackService) {
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
var import_node_crypto3 = require("crypto");
var NodeSupervisor = class _NodeSupervisor {
  /**
   * Creates a new NodeSupervisor instance
   * @private
   */
  constructor() {
    this.uid = "@supervisor:default";
    this.ctn = "@container:default";
    this.nodes = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
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
  /**
   * Sets the remote service callback function
   * @param {ServiceCallback} remoteServiceCallback - The callback to handle remote service calls
   */
  setRemoteServiceCallback(remoteServiceCallback2) {
    this.remoteServiceCallback = remoteServiceCallback2;
  }
  /**
   * Sets the broadcast setup callback function
   * @param {SetupCallback} broadcastSetupCallback - The callback to handle broadcast setup signals
   */
  setBroadcastSetupCallback(broadcastSetupCallback2) {
    this.broadcastSetupCallback = broadcastSetupCallback2;
  }
  /**
   * Sets the broadcast reporting callback function
   * @param {BroadcastReportingCallback} broadcastReportingCallback - The callback to handle broadcast reporting signals
   */
  setBroadcastReportingCallback(broadcastReportingCallback2) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setBroadcastReportingCallback(broadcastReportingCallback2);
  }
  /**
   * Sets the monitoring reporting callback function
   * @param {ReportingCallback} reportingCallback - The callback to handle monitoring reports
   */
  setMonitoringCallback(reportingCallback2) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setReportingCallback(reportingCallback2);
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
          return yield this.setupNode(payload.config);
        case NodeSignal.NODE_CREATE:
          return yield this.createNode(payload.params);
        case NodeSignal.NODE_DELETE:
          return yield this.deleteNode(payload.id);
        case NodeSignal.NODE_PAUSE:
          return yield this.pauseNode(payload.id);
        case NodeSignal.NODE_DELAY:
          return yield this.delayNode(payload.id, payload.delay);
        case NodeSignal.NODE_RUN:
          return yield this.runNode(payload.id, payload.data);
        case NodeSignal.NODE_SEND_DATA:
          return yield this.sendNodeData(payload.id);
        case NodeSignal.CHAIN_PREPARE:
          return yield this.prepareChainDistribution(payload.id);
        case NodeSignal.CHAIN_START:
          return yield this.startChain(payload.id, payload.data);
        case NodeSignal.CHAIN_START_PENDING:
          return yield this.startPendingChain(payload.id);
        case NodeSignal.CHAIN_DEPLOY: {
          return yield this.deployChain(payload.config, payload.data);
        }
        default:
          Logger.warn(
            `${this.ctn}: Unknown signal received: ${JSON.stringify(payload, null, 2)}`
          );
      }
    });
  }
  /**
   * Deploys a new processing chain
   * @param {ChainConfig} config - Configuration for the new chain
   * @param {PipelineData} data - Initial data to start the chain
   * @returns {Promise<string>} The new chain identifier
   */
  deployChain(config, data) {
    return __async(this, null, function* () {
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
        `${this.ctn}: Chain ${chainId} successfully deployed and started.`
      );
      return chainId;
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
        this.notify(nodeId, ChainStatus.CHAIN_SETUP_COMPLETED);
      }
      this.notify(nodeId, ChainStatus.NODE_SETUP_COMPLETED);
      return nodeId;
    });
  }
  /**
   * Handles a notification about a chain status change
   * @param {string} chainId - The chain identifier
   * @param {ChainStatus.Type} status - The new chain status
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
      node.notify(status);
      Logger.info(
        `${this.ctn}: Notification sent to node ${rootNodeId} with status ${status}.`
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
  notify(nodeId, status) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.notify(status);
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
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${(0, import_node_crypto3.randomUUID)().slice(0, 8)}`;
    const relation = {
      config
    };
    this.chains.set(chainId, relation);
    const monitoringHost = (_a = config[0]) == null ? void 0 : _a.monitoringHost;
    config.forEach((value, index) => {
      value.index = index;
      value.monitoringHost = monitoringHost;
    });
    Logger.header(`${this.ctn}: Chain ${chainId} creation has started...`);
    return chainId;
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
      Logger.header(
        `${this.ctn}: Chain distribution for ${chainId} in progress...`
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
      const chain = this.chains.get(chainId);
      const data = chain == null ? void 0 : chain.dataRef;
      if (data) {
        yield this.startChain(chainId, data);
      } else {
        Logger.error(`${this.ctn}: Can't start chain ${chainId}`);
        throw new Error("Something went wrong while starting pending chain");
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
      Logger.header(`Chain ${chainId} requested...`);
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

// src/extra/http.ts
var import_buffer = require("buffer");
var http = __toESM(require("http"));
var https = __toESM(require("https"));
var post = (url, data) => __async(void 0, null, function* () {
  const useSSL = url.protocol === "https:";
  const options = {
    hostname: url.hostname,
    port: url.port || (useSSL ? "443" : "80"),
    path: url.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": import_buffer.Buffer.byteLength(data)
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

// src/extra/DefaultResolverCallbacks.ts
var broadcastSetupCallback = (payload) => __async(void 0, null, function* () {
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
var remoteServiceCallback = (payload) => __async(void 0, null, function* () {
  const { cbPayload, hostResolver, path } = payload;
  Logger.info(`Service callback payload: ${JSON.stringify(payload, null, 2)}`);
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
var setResolverCallbacks = (dcPayload) => __async(void 0, null, function* () {
  const { paths, hostResolver } = dcPayload;
  const supervisor = NodeSupervisor.retrieveService();
  supervisor.setBroadcastSetupCallback(
    (message) => __async(void 0, null, function* () {
      const payload = {
        message,
        hostResolver,
        path: paths.setup
      };
      yield broadcastSetupCallback(payload);
    })
  );
  supervisor.setRemoteServiceCallback(
    (cbPayload) => __async(void 0, null, function* () {
      const payload = {
        cbPayload,
        hostResolver,
        path: paths.run
      };
      yield remoteServiceCallback(payload);
    })
  );
});

// src/extra/DefaultReportingCallbacks.ts
var reportingCallback = (payload) => __async(void 0, null, function* () {
  const { message, reportSignalHandler } = payload;
  yield reportSignalHandler(message);
});
var defaultReportSignalHander = (message) => __async(void 0, null, function* () {
  Logger.info({ message: `${JSON.stringify(message, null, 2)}` });
  switch (message.signal) {
    case ChainStatus.CHAIN_SETUP_COMPLETED:
      {
        const supervisor = NodeSupervisor.retrieveService();
        const payload = {
          signal: NodeSignal.CHAIN_START_PENDING,
          id: message.chainId
        };
        yield supervisor.handleRequest(payload);
        Logger.info({
          message: `reportSignalHandler: Chain setup completed`
        });
      }
      break;
  }
});
var defaultMonitoringResolver = (chainId) => __async(void 0, null, function* () {
  try {
    const monitoring = MonitoringAgent.retrieveService();
    const monitoringHost = monitoring.getRemoteMonitoringHost(chainId);
    if (monitoringHost !== void 0) {
      Logger.info({
        message: `DRC: Resolving host for monitoring: ${monitoringHost}`
      });
      return monitoringHost;
    } else throw new Error("monitoring not found");
  } catch (error) {
    Logger.error({ message: error.message });
  }
});
var broadcastReportingCallback = (payload) => __async(void 0, null, function* () {
  const { message, path, monitoringResolver } = payload;
  const monitoringHost = yield monitoringResolver(message.chainId);
  const url = new URL(path, monitoringHost);
  const data = JSON.stringify(message);
  Logger.info(`DRC: Sending message to ${url}`);
  yield post(url, data);
});
var setMonitoringCallbacks = (dcPayload) => __async(void 0, null, function* () {
  const { paths, reportSignalHandler, monitoringResolver } = dcPayload;
  const supervisor = NodeSupervisor.retrieveService();
  supervisor.setMonitoringCallback(
    (message) => __async(void 0, null, function* () {
      const payload = {
        message,
        reportSignalHandler: reportSignalHandler != null ? reportSignalHandler : defaultReportSignalHander
      };
      yield reportingCallback(payload);
    })
  );
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
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ChainStatus,
  ChainType,
  CombineStrategy,
  DataType,
  NodeSignal,
  NodeSupervisor,
  NodeType,
  PipelineDataCombiner,
  PipelineProcessor,
  broadcastSetupCallback,
  remoteServiceCallback,
  setMonitoringCallbacks,
  setResolverCallbacks
});
//# sourceMappingURL=index.js.map