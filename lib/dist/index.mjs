var __defProp = Object.defineProperty, __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty, __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: !0, configurable: !0, writable: !0, value }) : obj[key] = value, __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    __hasOwnProp.call(b, prop) && __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b))
      __propIsEnum.call(b, prop) && __defNormalProp(a, prop, b[prop]);
  return a;
}, __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => new Promise((resolve, reject) => {
  var fulfilled = (value) => {
    try {
      step(generator.next(value));
    } catch (e) {
      reject(e);
    }
  }, rejected = (value) => {
    try {
      step(generator.throw(value));
    } catch (e) {
      reject(e);
    }
  }, step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
  step((generator = generator.apply(__this, __arguments)).next());
});

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
}, Logger = class {
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
    let now = /* @__PURE__ */ new Date(), year = now.getFullYear(), month = String(now.getMonth() + 1).padStart(2, "0"), day = String(now.getDate()).padStart(2, "0"), hours = String(now.getHours()).padStart(2, "0"), minutes = String(now.getMinutes()).padStart(2, "0"), seconds = String(now.getSeconds()).padStart(2, "0"), timestamp = `${year}-${month}-${day}:${hours}.${minutes}.${seconds}`;
    return level === "special" ? `${Colors.reset}${Colors.special}${timestamp} [${level.toUpperCase()}]: \x1B[31m[${message}\x1B[31m]${Colors.reset}
` : `${Colors.reset}${Colors[level]}${timestamp} [${level.toUpperCase()}]: ${message}${Colors.reset}
`;
  }
  /**
   * Logs a message with the specified log level.
   * @param {LogLevel} level - The log level of the message.
   * @param {string} message - The message to log.
   */
  static log(level, message) {
    let timestamp = (/* @__PURE__ */ new Date()).toISOString(), formattedMessage = this.formatMessage(level, message);
    this.noPrint || process.stdout.write(formattedMessage), this.config.preserveLogs && this.config.externalCallback && this.config.externalCallback(level, message, timestamp);
  }
  static special(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("special", msg);
  }
  static event(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("event", msg);
  }
  /**
   * Logs a debug message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static debug(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("debug", msg);
  }
  /**
   * Logs an informational message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static info(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("info", msg);
  }
  /**
   * Logs a warning message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static warn(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("warn", msg);
  }
  /**
   * Logs an error message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static error(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("error", msg);
  }
  /**
   * Logs a header message.
   * @param {string | object} message - The message to log, can be a string or an object.
   */
  static header(message) {
    let msg = typeof message == "string" ? message : format(message);
    this.log("header", msg);
  }
};
Logger.noPrint = !1, // Flag to disable console output
Logger.config = {
  preserveLogs: !1
};
var DEFAULT_LOG_PATH = join(process.cwd(), "logs"), logStream, getLogFileName = () => `dpcp-${(/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-")}.log`, initDiskLogger = () => {
  try {
    mkdirSync(DEFAULT_LOG_PATH, { recursive: !0 });
    let logFile = join(DEFAULT_LOG_PATH, getLogFileName());
    return logStream = createWriteStream(logFile, { flags: "a" }), !0;
  } catch (err) {
    return process.stderr.write(`Failed to create log directory: ${err}
`), !1;
  }
}, defaultDiskCallback = (level, message, timestamp) => {
  if (!logStream && !initDiskLogger())
    return;
  let plainMessage = `${timestamp} [LOGGER][${level.toUpperCase()}]: ${message}
`;
  logStream.write(plainMessage);
};
Logger.configure({
  preserveLogs: !0,
  externalCallback: defaultDiskCallback
});

// src/types/types.ts
var DefaultCallback;
((DefaultCallback2) => (DefaultCallback2.SERVICE_CALLBACK = (payload) => {
  Logger.warn("REMOTE_SERVICE_CALLBACK not set");
}, DefaultCallback2.SETUP_CALLBACK = (message) => __async(void 0, null, function* () {
  Logger.warn("SETUP_CALLBACK not set");
}), DefaultCallback2.REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
  Logger.warn("REPORTING_CALLBACK not set");
}), DefaultCallback2.BROADCAST_REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
  Logger.warn("BROADCAST_REPORTING_CALLBACK not set");
}), DefaultCallback2.NODE_STATUS_CALLBACK = (message) => __async(void 0, null, function* () {
  Logger.warn("NODE_STATUS_CALLBACK not set");
})))(DefaultCallback || (DefaultCallback = {}));
var NodeType;
((NodeType2) => (NodeType2.LOCAL = "local", NodeType2.REMOTE = "remote"))(NodeType || (NodeType = {}));
var DataType;
((DataType2) => (DataType2.RAW = "raw", DataType2.COMPRESSED = "compressed"))(DataType || (DataType = {}));
var CombineStrategy;
((CombineStrategy2) => (CombineStrategy2.MERGE = "merge", CombineStrategy2.UNION = "union", CombineStrategy2.CUSTOM = "custom"))(CombineStrategy || (CombineStrategy = {}));
var ChainType;
((ChainType2) => (ChainType2.DEFAULT = 1, ChainType2.PERSISTANT = 2, ChainType2.AUTO_DELETE = 4))(ChainType || (ChainType = {}));
var ChainStatus;
((ChainStatus2) => (ChainStatus2.CHAIN_NOTIFIED = "chain_notified", ChainStatus2.CHAIN_DEPLOYED = "chain_deployed", ChainStatus2.CHAIN_SETUP_COMPLETED = "chain_setup_completed", ChainStatus2.NODE_PENDING = "node_pending", ChainStatus2.NODE_IN_PROGRESS = "node_in_progress", ChainStatus2.NODE_COMPLETED = "node_completed", ChainStatus2.NODE_FAILED = "node_failed", ChainStatus2.NODE_SETUP_COMPLETED = "node_setup_completed", ChainStatus2.CHILD_CHAIN_STARTED = "child_chain_started", ChainStatus2.CHILD_CHAIN_COMPLETED = "child_chain_completed", ChainStatus2.NODE_PENDING_DELETION = "node_pending_deletion", ChainStatus2.NODE_END_OF_PIPELINE = "node_end_of_pipeline", ChainStatus2.NODE_SUSPENDED = "node_suspended", ChainStatus2.NODE_RESUMED = "node_resumed"))(ChainStatus || (ChainStatus = {}));
var NodeSignal;
((NodeSignal3) => (NodeSignal3.NODE_SETUP = "node_setup", NodeSignal3.NODE_CREATE = "node_create", NodeSignal3.NODE_DELETE = "node_delete", NodeSignal3.NODE_RUN = "node_run", NodeSignal3.NODE_SEND_DATA = "node_send_data", NodeSignal3.NODE_ERROR = "node_error", NodeSignal3.NODE_RESUME = "node_resume", NodeSignal3.NODE_STOP = "node_stop", NodeSignal3.NODE_SUSPEND = "node_suspend", NodeSignal3.CHAIN_PREPARE = "chain_prepare", NodeSignal3.CHAIN_START = "chain_start", NodeSignal3.CHAIN_START_PENDING_OCCURRENCE = "chain_start_pending_occurrence", NodeSignal3.CHAIN_DEPLOY = "chain_deploy"))(NodeSignal || (NodeSignal = {}));

// src/core/Node.ts
import { setImmediate } from "timers";
import { randomUUID as randomUUID2 } from "node:crypto";

// src/agents/Agent.ts
import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";
var Agent = class extends EventEmitter {
  /**
   * Creates a new Agent instance with a unique identifier
   */
  constructor() {
    super(), this.uid = randomUUID();
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
    if (!(_ReportingAgentBase.authorizedAgent instanceof Agent))
      throw new Error(
        "Node Reporter needs to be instantiated by an authorized Agent"
      );
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
  notify(notification, type = "local-signal") {
    let { status } = notification;
    Logger.info(`Status ${status} from ${this.uid}`), this.status.push(status), this.emit(type, notification);
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
}, MonitoringAgent = class _MonitoringAgent extends Agent {
  /**
   * Creates a new MonitoringAgent instance
   */
  constructor() {
    super(), this.workflow = {}, this.remoteMonitoringHost = /* @__PURE__ */ new Map(), this.reportingCallback = DefaultCallback.REPORTING_CALLBACK, this.broadcastReportingCallback = DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }
  getWorkflow() {
    return this.workflow;
  }
  /**
   * Retrieves or creates a MonitoringAgent instance (Singleton pattern)
   * @param {boolean} refresh - Whether to force create a new instance
   * @returns {MonitoringAgent} The MonitoringAgent instance
   */
  static retrieveService(refresh = !1) {
    if (!_MonitoringAgent.instance || refresh) {
      let instance = new _MonitoringAgent();
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
    let { chainId, nodeId, index } = payload;
    ReportingAgent.authorize(this);
    let reporting = new ReportingAgent(chainId, nodeId);
    return reporting.on("global-signal", (signal) => __async(this, null, function* () {
      Logger.event(
        `Receive global-signal:
				${JSON.stringify(signal)}
				for node ${nodeId}
`
      );
      let message = __spreadProps(__spreadValues({}, payload), { signal });
      index > 0 ? (signal.broadcasted = !0, this.broadcastReportingCallback(message)) : yield this.reportingCallback(message);
    })), reporting.on("local-signal", (signal) => __async(this, null, function* () {
      Logger.event(
        `Receive local-signal:
				${JSON.stringify(signal)}
				for node ${nodeId} in chain ${chainId}
`
      );
      let message = __spreadProps(__spreadValues({}, payload), { signal }), update = {
        [message.nodeId]: { [message.signal.status]: !0 }
      };
      this.workflow[message.chainId] || (this.workflow[message.chainId] = {});
      let prev = this.workflow[message.chainId].status || {}, next = __spreadValues(__spreadValues({}, prev), update);
      this.workflow[message.chainId].status = next, nodeId === "supervisor" && (yield this.reportingCallback(message));
    })), reporting;
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
    this.workflow[chainId] || (this.workflow[chainId] = {}), this.workflow[chainId].setupCount = count;
  }
  getChainSetupCount(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.setupCount;
  }
  //
  setChainDeployed(chainId) {
    this.workflow[chainId] || (this.workflow[chainId] = {}), this.workflow[chainId].deployed = !0;
  }
  getChainDeployed(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.deployed;
  }
  //
  setChainSetupCompleted(chainId) {
    this.workflow[chainId] || (this.workflow[chainId] = {}), this.workflow[chainId].setupCompleted = !0;
  }
  getChainSetupCompleted(chainId) {
    var _a;
    return (_a = this.workflow[chainId]) == null ? void 0 : _a.setupCompleted;
  }
};

// src/core/NodeStatusManager.ts
var NodeStatusManager = class {
  // eslint-disable-next-line no-unused-vars
  constructor(node) {
    this.node = node;
    this.signalQueue = [];
    this.currentCursor = 0;
    this.status = [];
    this.suspendedState = null;
  }
  handleStopSignal() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing STOP signal");
    });
  }
  handleSuspendSignal() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing Suspend signal"), this.status.includes(ChainStatus.NODE_SUSPENDED) || (this.status.push(ChainStatus.NODE_SUSPENDED), Logger.info(`Node ${this.node.getId()} suspended.`));
    });
  }
  handleResumeSignal() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing RESUME signal");
      let index = this.status.indexOf(ChainStatus.NODE_SUSPENDED);
      if (index > -1) {
        if (this.status.splice(index, 1), !this.suspendedState) {
          Logger.warn(
            `~ NodeStatusManager: Node ${this.node.getId()} may have resumed prematurely.`
          );
          return;
        }
        return Logger.info(`~ NodeStatusManager: Resuming node ${this.node.getId()}...`), this.node.execute(this.suspendedState.data);
      } else
        Logger.warn(
          `~ NodeStatusManager: Cannot resume Node ${this.node.getId()}, not in suspended state.`
        );
    });
  }
  //    this.pushSignals([NodeSignal.NODE_RESUME]);
  suspendExecution(generator, currentBatch, data) {
    this.suspendedState = {
      generator,
      currentBatch,
      data
    };
  }
  getSuspendedState() {
    return this.suspendedState;
  }
  clearSuspendedState() {
    this.suspendedState = null;
  }
  isSuspended() {
    return this.status.includes(ChainStatus.NODE_SUSPENDED);
  }
  handleErrorSignal() {
    return __async(this, null, function* () {
      Logger.error("~ NodeStatusManager: Processing ERROR signal");
    });
  }
  handleNodeSetup() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing NODE_SETUP signal");
    });
  }
  handleNodeCreate() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing NODE_CREATE signal");
    });
  }
  handleNodeDelete() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing NODE_DELETE signal");
    });
  }
  // private async handleNodeDelay(): Promise<void> {
  //   Logger.info('~ NodeStatusManager: Processing NODE_DELAY signal');
  // }
  handleNodeRun() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing NODE_RUN signal");
    });
  }
  handleNodeSendData() {
    return __async(this, null, function* () {
      Logger.info("~ NodeStatusManager: Processing NODE_SEND_DATA signal");
    });
  }
  updateQueue(newSignals) {
    this.signalQueue = newSignals, this.currentCursor = 0;
  }
  enqueueSignals(signals) {
    return __async(this, null, function* () {
      this.signalQueue.push(...signals), signals.length > 0 && signals[0] === NodeSignal.NODE_RESUME && (yield this.process());
    });
  }
  processNextSignal() {
    return __async(this, null, function* () {
      try {
        let currentSignal = this.signalQueue[this.currentCursor];
        switch (currentSignal) {
          case NodeSignal.NODE_STOP:
            return this.handleStopSignal();
          // case NodeSignal.NODE_PAUSE:
          //   return this.handlePauseSignal();
          case NodeSignal.NODE_SUSPEND:
            return this.handleSuspendSignal();
          case NodeSignal.NODE_RESUME:
            return this.handleResumeSignal();
          case NodeSignal.NODE_ERROR:
            return this.handleErrorSignal();
          case NodeSignal.NODE_SETUP:
            return this.handleNodeSetup();
          case NodeSignal.NODE_CREATE:
            return this.handleNodeCreate();
          case NodeSignal.NODE_DELETE:
            return this.handleNodeDelete();
          // case NodeSignal.NODE_DELAY:
          //   return this.handleNodeDelay();
          case NodeSignal.NODE_RUN:
            return this.handleNodeRun();
          case NodeSignal.NODE_SEND_DATA:
            return this.handleNodeSendData();
          default:
            Logger.warn(
              `~ NodeStatusManager: Unknown signal type: ${currentSignal}`
            );
        }
      } catch (error) {
        throw Logger.error(
          `~ NodeStatusManager: Error processing signal: ${error.message}`
        ), error;
      }
    });
  }
  getQueueState() {
    return {
      queue: [...this.signalQueue],
      cursor: this.currentCursor
    };
  }
  process() {
    return __async(this, null, function* () {
      for (; this.currentCursor < this.signalQueue.length; this.currentCursor++)
        yield this.processNextSignal();
      return this.status;
    });
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
    this.id = randomUUID2(), this.output = [], this.pipelines = [], this.dependencies = dependencies, this.status = ChainStatus.NODE_PENDING, this.progress = 0, this.dataType = DataType.RAW, this.executionQueue = Promise.resolve(), this.nextNodeInfo = null, this.config = null, this.statusManager = new NodeStatusManager(this);
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
    let { chainId, index, count } = config;
    if (index !== void 0 && count !== void 0) {
      let monitoring = MonitoringAgent.retrieveService();
      this.reporting = monitoring.genReportingAgent({
        chainId,
        nodeId: this.id,
        index,
        count
      });
    } else
      Logger.warn("Node index is not defined, configuration failed");
    this.config = config, config.signalQueue && (Logger.info(`Node ${this.id} enqueuing signals...`), Logger.debug(`${config.signalQueue}`), this.statusManager.enqueueSignals(config.signalQueue));
  }
  enqueueSignals(statusQueue) {
    return __async(this, null, function* () {
      yield this.statusManager.enqueueSignals(statusQueue);
    });
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
      for (let processor of pipeline)
        result = yield processor.digest(result);
      return result;
    });
  }
  *getPipelineGenerator(pipelines, count) {
    for (let i = 0; i < pipelines.length; i += count)
      yield pipelines.slice(i, i + count);
  }
  /**
   * Notifies about node status changes through the reporting agent
   * @param {ChainStatus.Type} notify - Node status to report
   */
  notify(notification, type = "local-signal") {
    try {
      if (this.reporting !== null)
        typeof notification == "object" && "status" in notification ? this.reporting.notify(notification, type) : this.reporting.notify({ status: notification }, type);
      else
        throw new Error("Reporter not set");
    } catch (error) {
      Logger.error(error.message);
    }
  }
  processChildChain(data) {
    return __async(this, null, function* () {
      var _a;
      let childConfig = (_a = this.config) == null ? void 0 : _a.chainConfig;
      if (childConfig && Array.isArray(childConfig) && childConfig.length > 0 && (childConfig[0].rootConfig = this.config ? JSON.parse(JSON.stringify(this.config)) : void 0, !(yield NodeSupervisor.retrieveService().handleRequest({
        signal: NodeSignal.CHAIN_DEPLOY,
        config: childConfig,
        data
      }))))
        throw new Error("Failed to deploy chain: no chainId returned");
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
      let childMode = ((_b = (_a = this.config) == null ? void 0 : _a.rootConfig) == null ? void 0 : _b.childMode) === "parallel" ? "in parallel" : "in serial", suspendedState = this.statusManager.getSuspendedState(), isResuming = !!suspendedState;
      Logger.info(
        `Node ${this.id} execution ${isResuming ? "resumed" : "started"} ${childMode}...`
      ), this.executionQueue = this.executionQueue.then(() => __async(this, null, function* () {
        var _a2;
        try {
          this.updateStatus(ChainStatus.NODE_IN_PROGRESS);
          let generator, processingData = data;
          isResuming && suspendedState ? (generator = suspendedState.generator, processingData = suspendedState.data, yield this.processBatch(suspendedState.currentBatch, processingData)) : generator = this.getPipelineGenerator(this.pipelines, 3);
          let nextResult = generator.next();
          for (; !nextResult.done; ) {
            if ((yield this.statusManager.process()).includes(ChainStatus.NODE_SUSPENDED)) {
              this.statusManager.suspendExecution(
                generator,
                nextResult.value,
                processingData
              );
              return;
            }
            yield this.processBatch(nextResult.value, processingData), nextResult = generator.next();
          }
          this.statusManager.clearSuspendedState(), this.updateStatus(ChainStatus.NODE_COMPLETED), (_a2 = this.config) != null && _a2.chainConfig && (Logger.info(`child chain found in node: ${this.id}`), yield this.processChildChain(processingData));
        } catch (error) {
          this.statusManager.isSuspended() || (this.statusManager.clearSuspendedState(), this.updateStatus(ChainStatus.NODE_FAILED, error), Logger.error(`Node ${this.id} execution failed: ${error}`));
        }
      })), yield NodeSupervisor.retrieveService().handleRequest({
        signal: NodeSignal.NODE_SEND_DATA,
        id: this.id
      });
    });
  }
  processBatch(pipelineBatch, data) {
    return __async(this, null, function* () {
      return new Promise((resolve, reject) => {
        setImmediate(() => __async(this, null, function* () {
          try {
            let batchPromises = pipelineBatch.map(
              (pipeline) => this.processPipeline(pipeline, data).then(
                (pipelineData) => {
                  this.output.push(pipelineData), this.updateProgress();
                }
              )
            );
            yield Promise.all(batchPromises), resolve();
          } catch (error) {
            reject(error);
          }
        }));
      });
    });
  }
  /**
   * Sends processed data to the next node after execution completion
   * @returns {Promise<void>}
   */
  sendData() {
    return __async(this, null, function* () {
      yield this.executionQueue, Logger.info(`Sending data from node ${this.id}.`), yield _Node.terminate(this.id, this.output);
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
      let data = pipelineData[0];
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
      let supervisor = NodeSupervisor.retrieveService(), currentNode = supervisor.getNodes().get(nodeId), chainId = (_a = currentNode == null ? void 0 : currentNode.getConfig()) == null ? void 0 : _a.chainId;
      if (!currentNode) {
        Logger.warn(`Node ${nodeId} not found for moving to next node.`);
        return;
      }
      let nextNodeInfo = currentNode.getNextNodeInfo();
      nextNodeInfo ? nextNodeInfo.type === NodeType.LOCAL ? yield supervisor.handleRequest({
        signal: NodeSignal.NODE_RUN,
        id: nextNodeInfo.id,
        data: pipelineData
      }) : nextNodeInfo.type === NodeType.REMOTE && supervisor.remoteServiceCallback({
        // targetId and meta are related to the next remote target service uid
        chainId,
        targetId: nextNodeInfo.id,
        data: pipelineData,
        meta: nextNodeInfo.meta
      }) : (Logger.special(
        `End of pipeline reached by node ${nodeId} in chain ${chainId}.`
      ), currentNode.notify(ChainStatus.NODE_END_OF_PIPELINE, "global-signal")), ((_c = (_b = currentNode.config) == null ? void 0 : _b.chainType) != null ? _c : 0) & ChainType.PERSISTANT ? Logger.warn(`Node ${nodeId} kept for future calls.`) : ((_e = (_d = currentNode.config) == null ? void 0 : _d.chainType) != null ? _e : 0) & ChainType.AUTO_DELETE ? yield supervisor.handleRequest({
        id: nodeId,
        signal: NodeSignal.NODE_DELETE
      }) : currentNode.notify(ChainStatus.NODE_PENDING_DELETION, "global-signal");
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
  // setDelay(delay: number): void {
  //   this.delay = delay;
  // }
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
    this.status = status, status === ChainStatus.NODE_FAILED && (this.error = error), this.reporting && this.reporting.notify({ status });
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
    this.targetId = config.targetId, this.meta = config.meta;
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
      return _PipelineProcessor.callbackService ? (Logger.info(
        `[PipelineProcessor]: Digesting data using "${this.targetId}"`
      ), yield _PipelineProcessor.callbackService({
        targetId: this.targetId,
        meta: this.meta,
        data
      })) : {};
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
    Logger.debug("--Logging chains content:"), chains.forEach((relation, chainId) => {
      Logger.debug(`Chain ID: ${chainId}`), Logger.debug(`Root Node ID: ${relation.rootNodeId || "None"}`), Logger.debug(
        `Data Reference: ${JSON.stringify(relation.dataRef, null, 2) || "None"}`
      ), Logger.debug("Chain Configuration:"), relation.config.forEach((nodeConfig, index) => {
        Logger.debug(`  Node ${index + 1}:`), Logger.debug(`    Services: ${JSON.stringify(nodeConfig.services)}`), Logger.debug(`    Chain ID: ${nodeConfig.chainId}`), Logger.debug(`    Index: ${nodeConfig.index}`), Logger.debug(`    Count: ${nodeConfig.count}`), Logger.debug(`    Location: ${nodeConfig.location}`), Logger.debug(`    Next Target ID: ${nodeConfig.nextTargetId}`), Logger.debug(`    Chain Type: ${nodeConfig.chainType}`), Logger.debug(`    Monitoring Host: ${nodeConfig.monitoringHost}`), Logger.debug(`    Child Mode: ${nodeConfig.childMode}`);
      });
    });
  }
  logWorkflow(workflow) {
    Logger.debug("--Logging chains content:"), Object.entries(workflow).forEach(([workflowId, node]) => {
      Logger.header(`Workflow Node: ${workflowId}`), Object.entries(node).forEach(([key, value]) => {
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
    this.uid = "@supervisor:default", this.ctn = "@container:default", this.nsLogger = new NodeSupervisorLogger(), this.nodes = /* @__PURE__ */ new Map(), this.chains = /* @__PURE__ */ new Map(), this.childChains = /* @__PURE__ */ new Map(), this.remoteServiceCallback = DefaultCallback.SERVICE_CALLBACK, this.broadcastSetupCallback = DefaultCallback.SETUP_CALLBACK, this.nodeStatusCallback = DefaultCallback.NODE_STATUS_CALLBACK;
  }
  /**
   * Retrieves or creates a NodeSupervisor instance (Singleton pattern)
   * @param {boolean} refresh - Whether to force create a new instance
   * @returns {NodeSupervisor} The NodeSupervisor instance
   */
  static retrieveService(refresh = !1) {
    if (!_NodeSupervisor.instance || refresh) {
      let instance = new _NodeSupervisor();
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
        let workflow = MonitoringAgent.retrieveService().getWorkflow();
        this.nsLogger.logWorkflow(workflow);
        break;
      }
      default:
        break;
    }
  }
  getChain(chainId) {
    return this.chains.get(chainId);
  }
  setNodeStatusCallback(nodeStatusCallback) {
    this.nodeStatusCallback = nodeStatusCallback;
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
    MonitoringAgent.retrieveService().setBroadcastReportingCallback(broadcastReportingCallback);
  }
  /**
   * Sets the monitoring reporting callback function
   * @param {ReportingCallback} reportingCallback - The callback to handle monitoring reports
   */
  setMonitoringCallback(reportingCallback) {
    MonitoringAgent.retrieveService().setReportingCallback(reportingCallback);
  }
  /**
   * Sets the unique identifier for this supervisor instance
   * @param {string} uid - The unique identifier
   */
  setUid(uid) {
    this.ctn = `@container:${uid}`, this.uid = `@supervisor:${uid}`;
  }
  enqueueSignals(nodeId, status) {
    return __async(this, null, function* () {
      var _a;
      return (_a = this.nodes.get(nodeId)) == null ? void 0 : _a.enqueueSignals(status);
    });
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
          return Logger.event("handle NODE_SETUP"), yield this.setupNode(payload.config);
        case NodeSignal.NODE_CREATE:
          return Logger.event("handle NODE_CREATE"), yield this.createNode(payload.params);
        case NodeSignal.NODE_DELETE:
          return Logger.event("handle NODE_DELETE"), yield this.deleteNode(payload.id);
        /*
        case NodeSignal.NODE_PAUSE:
          Logger.event(`handle NODE_PAUSE`);
          return await this.pauseNode(payload.id);
        case NodeSignal.NODE_DELAY:
          Logger.event(`handle NODE_DELAY`);
          return await this.delayNode(payload.id, payload.delay);
        */
        case NodeSignal.NODE_RUN:
          return Logger.event("handle NODE_RUN"), yield this.runNode(payload.id, payload.data);
        case NodeSignal.NODE_SEND_DATA:
          return Logger.event("handle NODE_SEND_DATA"), yield this.sendNodeData(payload.id);
        case NodeSignal.CHAIN_PREPARE:
          return Logger.event("handle CHAIN_PREPARE"), yield this.prepareChainDistribution(payload.id);
        case NodeSignal.CHAIN_START:
          return Logger.event("handle CHAIN_START"), yield this.startChain(payload.id, payload.data);
        case NodeSignal.CHAIN_START_PENDING_OCCURRENCE:
          return Logger.event("handle CHAIN_START_PENDING_OCCURRENCE"), yield this.startPendingChain(payload.id);
        case NodeSignal.CHAIN_DEPLOY:
          return Logger.event("handle CHAIN_DEPLOY"), yield this.deployChain(payload.config, payload.data);
        default:
          Logger.warn(
            `${this.ctn}: Unknown signal received: ${JSON.stringify(payload, null, 2)}`
          );
      }
    });
  }
  remoteReport(notification, chainId) {
    MonitoringAgent.retrieveService().genReportingAgent({
      chainId,
      nodeId: "supervisor-remote",
      index: 1,
      count: -1
    }).notify(notification, "global-signal");
  }
  localReport(status, chainId) {
    MonitoringAgent.retrieveService().genReportingAgent({
      chainId,
      nodeId: "supervisor",
      index: -1,
      count: -1
    }).notify({ status }, "local-signal");
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
        if (!config)
          throw new Error(`${this.ctn}: Chain configuration is required`);
        Logger.info(`${this.ctn}: Starting a new chain deployment...`);
        let chainId = this.createChain(config);
        yield this.prepareChainDistribution(chainId);
        let chain = this.chains.get(chainId);
        if (chain && (chain.dataRef = data), Logger.info(
          `${this.ctn}: Deployment for chain ${chainId} has successfully started...`
        ), parentChainId) {
          let children = this.childChains.get(parentChainId) || [];
          children.push(chainId), this.childChains.set(parentChainId, children);
        }
        return this.localReport(ChainStatus.CHAIN_DEPLOYED, chainId), chainId;
      } catch (error) {
        throw Logger.error(`${this.ctn}{deployChain}: ${error.message}`), error;
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
      let node = new Node(), nodeId = node.getId();
      return node.setConfig(config), this.nodes.set(nodeId, node), Logger.info(
        `${this.ctn}: Node ${nodeId} created with config: ${JSON.stringify(config, null, 2)}`
      ), nodeId;
    });
  }
  /**
   * Sets up a new node with the given configuration
   * @param {NodeConfig} config - The node configuration
   * @param {boolean} initiator - Whether the node is the chain initiator
   * @returns {Promise<string>} The new node identifier
   */
  setupNode(config, initiator = !1) {
    return __async(this, null, function* () {
      this.updateChain([config]);
      let nodeId = yield this.createNode(config), node = this.nodes.get(nodeId);
      if (!node)
        return Logger.warn(`${this.ctn}: Attempted to setup undefined node`), nodeId;
      Logger.header(`Setup node ${node == null ? void 0 : node.getId()}...`), yield this.setRemoteMonitoringHost(config);
      let processors = config.services.map(
        (service) => new PipelineProcessor(
          typeof service == "string" ? { targetId: service } : service
        )
      );
      return yield this.addProcessors(nodeId, processors), Logger.info(
        `${this.ctn}: Node ${nodeId} setup completed with ${processors.length} processors`
      ), config.nextTargetId !== void 0 ? node.setNextNodeInfo(
        config.nextTargetId,
        NodeType.REMOTE,
        config.nextMeta
      ) : initiator || Logger.warn(
        `${this.ctn}: Cannot set next node info: nextTargetId is undefined`
      ), this.notify(nodeId, ChainStatus.NODE_SETUP_COMPLETED, "global-signal"), nodeId;
    });
  }
  /**
   * Handles externals notifications about a chain status change
   * @param {string} chainId - The chain identifier
   * @param {Notification} notification - The new chain status notification
   */
  handleNotification(chainId, notification) {
    try {
      let chain = this.chains.get(chainId);
      if (!chain) {
        Logger.warn(`${this.ctn}: Chain with ID ${chainId} not found.`);
        return;
      }
      let rootNodeId = chain.rootNodeId;
      if (!rootNodeId) {
        Logger.warn(`${this.ctn}: Root node ID missing for chain ${chainId}.`);
        return;
      }
      let node = this.nodes.get(rootNodeId);
      if (!node) {
        Logger.warn(`${this.ctn}: Node with ID ${rootNodeId} not found.`);
        return;
      }
      Logger.info(
        `${this.ctn}:
		Sending notification to node ${rootNodeId}
		with status ${JSON.stringify(notification)}.`
      ), node.notify(notification, "global-signal");
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
    let node = this.nodes.get(nodeId);
    node ? node.notify(status, type) : Logger.warn(`${this.ctn}: Can't notify non-existing node ${nodeId}`);
  }
  /**
   * Adds processors to a node
   * @param {string} nodeId - The node identifier
   * @param {PipelineProcessor[]} processors - Array of processors to add
   */
  addProcessors(nodeId, processors) {
    return __async(this, null, function* () {
      let node = this.nodes.get(nodeId);
      node ? (node.addPipeline(processors), Logger.info(`${this.ctn}: Processors added to Node ${nodeId}.`)) : Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
    });
  }
  /**
   * Deletes a node
   * @param {string} nodeId - The node identifier to delete
   */
  deleteNode(nodeId) {
    return __async(this, null, function* () {
      this.nodes.has(nodeId) ? (this.nodes.delete(nodeId), Logger.info(`${this.ctn}: Node ${nodeId} deleted.`)) : Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
    });
  }
  /**
   * Pauses a node
   * @param {string} nodeId - The node identifier to pause
   */
  /*
  private async pauseNode(nodeId: string): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.updateStatus(ChainStatus.NODE_PAUSED);
      Logger.info(`${this.ctn}: Node ${nodeId} paused.`);
    } else {
      Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
    }
  }
  */
  /**
   * Delays the execution of a node
   * @param {string} nodeId - The node identifier
   * @param {number} delay - The delay in milliseconds
   */
  /*
  private async delayNode(nodeId: string, delay: number): Promise<void> {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.setDelay(delay);
      Logger.info(`${this.ctn}: Node ${nodeId} delayed by ${delay} ms.`);
    } else {
      Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
    }
  }
  */
  /**
   * Creates a new chain with the given configuration
   * @param {ChainConfig} config - The chain configuration
   * @returns {string} The new chain identifier
   */
  createChain(config) {
    var _a;
    try {
      if (!config || !Array.isArray(config))
        throw new Error("Invalid chain configuration: config must be an array");
      let timestamp = Date.now(), chainId = `${this.uid}-${timestamp}-${randomUUID3().slice(0, 8)}`, relation = {
        config
      };
      this.chains.set(chainId, relation);
      let monitoringHost = config[0].rootConfig ? config[0].rootConfig.monitoringHost : (_a = config[0]) == null ? void 0 : _a.monitoringHost, count = Array.isArray(config) ? config.length : 0;
      return count > 0 ? config.forEach((value, index) => {
        value && (value.index = index, value.count = count, value.monitoringHost = monitoringHost);
      }) : Logger.warn(`${this.ctn}: Chain configuration is empty`), Logger.header(`${this.ctn}:
	Chain ${chainId} creation has started...`), chainId;
    } catch (error) {
      throw Logger.header(`${this.ctn}{createChain}:
	${error.message}`), error;
    }
  }
  /**
   * Updates an existing chain with new configurations
   * @param {ChainConfig} config - The new chain configurations to add
   * @returns {string} The chain identifier
   */
  updateChain(config) {
    if (config.length === 0 || !config[0].chainId)
      throw new Error("Invalid chain configuration");
    let chainId = config[0].chainId, relation = this.chains.get(chainId);
    return relation ? (relation.config = relation.config.concat(config), Logger.info(
      `${this.ctn}: Chain ${chainId} updated with ${config.length} new configurations`
    )) : (relation = {
      config
    }, this.chains.set(chainId, relation), Logger.info(
      `${this.ctn}: Chain ${chainId} created with ${config.length} configurations`
    )), chainId;
  }
  /**
   * Sets the remote monitoring host for a chain
   * @param {NodeConfig} config - The node configuration containing the monitoring host
   */
  setRemoteMonitoringHost(config) {
    return __async(this, null, function* () {
      let remoteMonitoringHost = config.monitoringHost;
      if (!remoteMonitoringHost)
        throw new Error(
          `${this.ctn}: No Monitoring Host set for Chain ${config.chainId} during distribution`
        );
      MonitoringAgent.retrieveService().setRemoteMonitoringHost(config.chainId, remoteMonitoringHost);
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
        let chain = this.chains.get(chainId);
        if (!chain)
          throw new Error(`${this.ctn}: Chain ${chainId} not found`);
        let chainConfig = chain.config, localConfigs = chainConfig.filter(
          (config) => config.location === "local"
        ), remoteConfigs = chainConfig.filter(
          (config) => config.location === "remote"
        );
        if (localConfigs || Logger.warn("Local config undefined"), localConfigs.length > 0) {
          let rootNodeId = yield this.setupNode(
            __spreadProps(__spreadValues({}, localConfigs[0]), { chainId }),
            !0
          );
          chain.rootNodeId = rootNodeId;
          let prevNodeId = rootNodeId;
          for (let i = 1; i < localConfigs.length; i++) {
            let currentNodeId = yield this.setupNode(
              __spreadProps(__spreadValues({}, localConfigs[i]), {
                chainId
              }),
              !0
            ), prevNode = this.nodes.get(prevNodeId);
            prevNode && prevNode.setNextNodeInfo(currentNodeId, NodeType.LOCAL), prevNodeId = currentNodeId;
          }
          if (remoteConfigs || Logger.warn("Remote config undefined"), remoteConfigs.length > 0 && remoteConfigs[0].services.length > 0) {
            let lastLocalNode = this.nodes.get(prevNodeId);
            if (lastLocalNode) {
              let nextService = remoteConfigs[0].services[0];
              lastLocalNode.setNextNodeInfo(
                typeof nextService == "string" ? nextService : nextService.targetId,
                NodeType.REMOTE,
                typeof nextService == "string" ? void 0 : nextService.meta
              );
            }
          }
        } else
          Logger.warn(
            `${this.ctn}: No local config found for chain ${chainId}. Root node unavailable.`
          );
        try {
          if (remoteConfigs.length > 0) {
            let updatedRemoteConfigs = remoteConfigs.map(
              (config, index) => {
                var _a;
                let nextConfig = (_a = remoteConfigs[index + 1]) == null ? void 0 : _a.services[0];
                return __spreadProps(__spreadValues({}, config), {
                  nextTargetId: nextConfig ? typeof nextConfig == "string" ? nextConfig : nextConfig.targetId : void 0,
                  nextMeta: nextConfig && typeof nextConfig != "string" ? nextConfig.meta : void 0
                });
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
        throw Logger.error(
          `${this.ctn}{prepareChainDistribution}: ${error.message}`
        ), error;
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
      let message = {
        signal: NodeSignal.NODE_SETUP,
        chain: {
          id: chainId,
          config: remoteConfigs
        }
      };
      try {
        yield this.broadcastSetupCallback(message), Logger.info(
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
      let chain = this.chains.get(chainId), data = chain == null ? void 0 : chain.dataRef;
      if (data)
        if ((_a = chain == null ? void 0 : chain.config[0]) == null ? void 0 : _a.rootConfig) {
          let rootNodeId = chain == null ? void 0 : chain.rootNodeId;
          if (!rootNodeId)
            throw Logger.error(
              `${this.ctn}: Root node ID for chain ${chainId} not found.`
            ), new Error("Root node ID not found");
          (((_c = (_b = chain == null ? void 0 : chain.config[0]) == null ? void 0 : _b.rootConfig) == null ? void 0 : _c.childMode) === "parallel" ? "parallel" : "serial") === "parallel" /* PARALLEL */ ? (Logger.warn(`// Starting parallel child chain: ${chainId}`), this.notify(
            rootNodeId,
            ChainStatus.CHILD_CHAIN_STARTED,
            "global-signal"
          ), this.startChain(chainId, data).then(
            () => this.notify(
              rootNodeId,
              ChainStatus.CHILD_CHAIN_COMPLETED,
              "global-signal"
            )
          ).catch((error) => {
            Logger.error(`Failed to start parallel child chain: ${error}`);
          })) : (Logger.warn(`__ Starting serial child chain: ${chainId}`), yield this.startChain(chainId, data), this.notify(
            rootNodeId,
            ChainStatus.CHILD_CHAIN_COMPLETED,
            "global-signal"
          ));
        } else
          yield this.startChain(chainId, data);
      else
        Logger.warn(`${this.ctn}:
	Nothing to process on chain ${chainId}`);
    });
  }
  /**
   * Starts a new chain
   * @param {string} chainId - The chain identifier
   * @param {PipelineData} data - The initial data to process
   */
  startChain(chainId, data) {
    return __async(this, null, function* () {
      Logger.header(`<<Start Chain>>: Chain ${chainId} requested...`), Logger.info(`Data: ${JSON.stringify(data, null, 2)}`);
      let chain = this.chains.get(chainId);
      if (!chain) {
        Logger.warn(`Chain ${chainId} not found.`);
        return;
      }
      let rootNodeId = chain.rootNodeId;
      if (!rootNodeId) {
        Logger.error(`${this.ctn}: Root node ID for chain ${chainId} not found.`);
        return;
      }
      if (!this.nodes.get(rootNodeId)) {
        Logger.error(
          `${this.ctn}: Root node ${rootNodeId} for chain ${chainId} not found.`
        );
        return;
      }
      try {
        yield this.runNode(rootNodeId, data), Logger.info(
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
      let node = this.nodes.get(nodeId);
      node ? yield node.execute(data) : Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
    });
  }
  /**
   * Executes a node based on the given callback payload
   * @param {CallbackPayload} payload - The payload containing target ID, chain ID, and data
   */
  runNodeByRelation(payload) {
    return __async(this, null, function* () {
      try {
        let { targetId, chainId, data } = payload;
        if (Logger.info(`Received data for node hosting target ${targetId}`), chainId === void 0)
          throw new Error("chainId is undefined");
        if (targetId === void 0)
          throw new Error("targetId is undefined");
        let node = this.getNodesByServiceAndChain(targetId, chainId);
        if (!node || node.length === 0)
          throw new Error(
            `No node found for targetId ${targetId} and chainId ${chainId}`
          );
        let nodeId = node[0].getId();
        if (nodeId === void 0)
          throw new Error(
            `No node ID exists for targetId ${targetId} and chainId ${chainId}`
          );
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
      let node = this.nodes.get(nodeId);
      if (node)
        try {
          yield node.sendData();
        } catch (err) {
          let error = err;
          Logger.error(
            `${this.ctn}: Node ${nodeId} send data failed: ${error.message}`
          );
        }
      else
        Logger.warn(`${this.ctn}: Node ${nodeId} not found.`);
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
      let nodeConfig = node.getConfig();
      return nodeConfig ? nodeConfig.chainId === chainId && nodeConfig.services.some(
        (service) => typeof service == "string" ? service === serviceUid : service.targetId === serviceUid
      ) : !1;
    });
  }
};

// src/extensions/DefaultMonitoringSignalHandler.ts
var Ext;
((Ext6) => {
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
        let supervisor = NodeSupervisor.retrieveService(), payload = {
          signal: NodeSignal.CHAIN_START_PENDING_OCCURRENCE,
          id: chainId
        };
        yield supervisor.handleRequest(payload), Logger.event("MonitoringSignalHandler: Start Pending Occurrence...");
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
        let monitoring = MonitoringAgent.retrieveService(), status = (_a = message.signal) == null ? void 0 : _a.status, chainId = message.chainId;
        switch (status) {
          /*
           * Handle ChainStatus.NODE_SETUP_COMPLETED
           */
          case ChainStatus.NODE_SETUP_COMPLETED: {
            let count = monitoring.getChainSetupCount(chainId);
            count ? monitoring.setChainSetupCount(chainId, count + 1) : monitoring.setChainSetupCount(chainId, 1), count = monitoring.getChainSetupCount(chainId), count && count >= message.count && (monitoring.setChainSetupCompleted(chainId), Logger.event(
              "MonitoringSignalHandler: Chain Nodes setup completed"
            ), monitoring.getChainDeployed(chainId) && (yield this.triggerPendingOccurrence(chainId)));
            break;
          }
          /*
           * Handle ChainStatus.CHAIN_DEPLOYED
           */
          case ChainStatus.CHAIN_DEPLOYED: {
            monitoring.setChainDeployed(chainId), Logger.event("MonitoringSignalHandler: Chain deployed"), monitoring.getChainSetupCompleted(chainId) && (yield this.triggerPendingOccurrence(chainId));
            break;
          }
          case ChainStatus.CHAIN_NOTIFIED: {
            let { signal } = message.signal;
            Logger.debug(`signal: ${signal} from ${chainId}`), Logger.debug(`message: ${JSON.stringify(message, null, 2)}`);
            break;
          }
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
  Ext6.MonitoringSignalHandler = MonitoringSignalHandler;
})(Ext || (Ext = {}));

// src/utils/http.ts
import { Buffer as Buffer2 } from "buffer";
import * as http from "http";
import * as https from "https";
var post = (url, data) => __async(void 0, null, function* () {
  let useSSL = url.protocol === "https:", options = {
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
    let req = (useSSL ? https : http).request(options, (res) => {
      let data2 = "";
      res.on("data", (chunk) => {
        data2 += chunk;
      }), res.on("end", () => {
        res.statusCode && res.statusCode >= 200 && res.statusCode < 300 ? resolve(data2) : reject(
          new Error(
            `HTTP Error: ${res.statusCode} ${res.statusMessage} - URL: ${options.hostname}${options.path}`
          )
        );
      });
    });
    req.on("error", (error) => {
      reject(new Error(`Request failed to ${url.href}: ${error.message}`));
    }), req.write(data), req.end();
  });
});

// src/extensions/DefaultReportingCallbacks.ts
var Ext2;
((Ext6) => {
  Ext6.reportingCallback = (payload) => __async(void 0, null, function* () {
    let { message, reportSignalHandler } = payload;
    yield reportSignalHandler(message);
  });
  let defaultReportSignalHandler = (message) => __async(void 0, null, function* () {
    Logger.debug({ message: `${JSON.stringify(message, null, 2)}` }), yield Ext.MonitoringSignalHandler.handle(message);
  });
  Ext6.defaultMonitoringResolver = (chainId) => __async(void 0, null, function* () {
    try {
      let monitoringHost = MonitoringAgent.retrieveService().getRemoteMonitoringHost(chainId);
      if (monitoringHost !== void 0)
        return Logger.info({
          message: `DRC: Resolving host for monitoring: ${monitoringHost}`
        }), monitoringHost;
      throw new Error(
        "Monitoring host not found, selected chain may not exist."
      );
    } catch (error) {
      Logger.error({ message: error.message });
    }
  });
  let broadcastReportingCallback = (payload) => __async(void 0, null, function* () {
    try {
      let { message, path, monitoringResolver } = payload, monitoringHost = yield monitoringResolver(message.chainId), url = new URL(path, monitoringHost), data = JSON.stringify(message);
      Logger.info(`BroadcastReportingCallback: Sending message to ${url}`), Logger.debug(`- message:
	${JSON.stringify(message, null, 2)}`), yield post(url, data);
    } catch (error) {
      Logger.error({ message: error.message });
    }
  });
  Ext6.setMonitoringCallbacks = (dcPayload) => __async(void 0, null, function* () {
    let { paths, reportSignalHandler, monitoringResolver } = dcPayload, supervisor = NodeSupervisor.retrieveService();
    supervisor.setMonitoringCallback(
      (message) => __async(void 0, null, function* () {
        let payload = {
          message,
          reportSignalHandler: reportSignalHandler != null ? reportSignalHandler : defaultReportSignalHandler
        };
        yield (0, Ext6.reportingCallback)(payload);
      })
    ), reportSignalHandler ? Logger.info("Monitoring Callback set with custom Signal Handler") : Logger.info("Monitoring Callback set with default Signal Handler"), supervisor.setBroadcastReportingCallback(
      (message) => __async(void 0, null, function* () {
        let payload = {
          message,
          path: paths.notify,
          monitoringResolver: monitoringResolver != null ? monitoringResolver : Ext6.defaultMonitoringResolver
        };
        yield broadcastReportingCallback(payload);
      })
    ), monitoringResolver ? Logger.info("Broadcast Reporting Callback set with custom Resolver") : Logger.info("Broadcast Reporting Callback set with default Resolver");
  });
})(Ext2 || (Ext2 = {}));

// src/extensions/DefaultResolverCallbacks.ts
var Ext3;
((Ext6) => (Ext6.broadcastSetupCallback = (payload) => __async(void 0, null, function* () {
  let { message, hostResolver, path } = payload;
  Logger.info(`Broadcast message: ${JSON.stringify(message, null, 2)}`);
  let chainConfigs = message.chain.config, chainId = message.chain.id;
  for (let config of chainConfigs) {
    if (config.services.length === 0) {
      Logger.warn("Empty services array encountered in config");
      continue;
    }
    let service = config.services[0], targetId = typeof service == "string" ? service : service.targetId, meta = typeof service == "string" ? void 0 : service.meta, host = hostResolver(targetId, meta);
    if (!host) {
      Logger.warn(`No container address found for targetId: ${targetId}`);
      continue;
    }
    try {
      let data = JSON.stringify({
        chainId,
        remoteConfigs: config
      }), url = new URL(path, host);
      post(url, data);
    } catch (error) {
      Logger.error(
        `Unexpected error sending setup request to ${host} for targetId ${targetId}: ${error.message}`
      );
    }
  }
}), Ext6.remoteServiceCallback = (payload) => __async(void 0, null, function* () {
  let { cbPayload, hostResolver, path } = payload;
  Logger.info(
    `Service callback payload: ${JSON.stringify(payload, null, 2)}`
  );
  try {
    if (!cbPayload.chainId)
      throw new Error("payload.chainId is undefined");
    let nextConnectorUrl = hostResolver(cbPayload.targetId, cbPayload.meta);
    if (!nextConnectorUrl)
      throw new Error(
        `Next connector URI not found for the following target service: ${cbPayload.targetId}`
      );
    let url = new URL(path, nextConnectorUrl);
    Logger.info(`Sending data to next connector on: ${url.href}`);
    let data = JSON.stringify(cbPayload);
    yield post(url, data);
  } catch (error) {
    throw Logger.error(
      `Error sending data to next connector: ${error.message}`
    ), error;
  }
}), Ext6.setResolverCallbacks = (dcPayload) => __async(void 0, null, function* () {
  let { paths, hostResolver } = dcPayload, supervisor = NodeSupervisor.retrieveService();
  supervisor.setBroadcastSetupCallback(
    (message) => __async(void 0, null, function* () {
      let payload = {
        message,
        hostResolver,
        path: paths.setup
      };
      yield (0, Ext6.broadcastSetupCallback)(payload);
    })
  ), supervisor.setRemoteServiceCallback(
    (cbPayload) => __async(void 0, null, function* () {
      let payload = {
        cbPayload,
        hostResolver,
        path: paths.run
      };
      yield (0, Ext6.remoteServiceCallback)(payload);
    })
  );
})))(Ext3 || (Ext3 = {}));

// src/extensions/DefaultNodeStatusBroadcaster.ts
var Ext4;
((Ext6) => {
  let nodeStatusCallback = (payload) => __async(void 0, null, function* () {
    let { message, path, monitoringResolver } = payload, monitoringHost = yield monitoringResolver(message.chainId), url = new URL(path, monitoringHost), data = JSON.stringify(message);
    Logger.info(`NodeStatusCallback: Sending message to ${url}`), yield post(url, data);
  });
  Ext6.setNodeStatusResolverCallbacks = (dcPayload) => __async(void 0, null, function* () {
    let { paths, monitoringResolver } = dcPayload;
    NodeSupervisor.retrieveService().setNodeStatusCallback(
      (message) => __async(void 0, null, function* () {
        let payload = {
          message,
          monitoringResolver: monitoringResolver != null ? monitoringResolver : Ext2.defaultMonitoringResolver,
          path: paths.enqueue
        };
        yield nodeStatusCallback(payload);
      })
    );
  });
})(Ext4 || (Ext4 = {}));

// src/core/PipelineDataCombiner.ts
var PipelineDataCombiner = class {
  constructor(strategy = CombineStrategy.MERGE, customCombineFunction) {
    this.strategy = strategy, this.customCombineFunction = customCombineFunction;
  }
  merge(dataSets) {
    return dataSets.flat();
  }
  union(dataSets) {
    let mergedData = this.merge(dataSets);
    if (Array.isArray(mergedData))
      return Array.from(new Set(mergedData));
    throw new Error("PipelineData must be an array.");
  }
  applyStrategy(dataSets) {
    switch (this.strategy) {
      case CombineStrategy.MERGE:
        return this.merge(dataSets);
      case CombineStrategy.UNION:
        return this.union(dataSets);
      case CombineStrategy.CUSTOM:
        if (this.customCombineFunction)
          return this.customCombineFunction(dataSets);
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
var Ext5;
((Ext6) => (Ext6.Monitoring = Ext, Ext6.Reporting = Ext2, Ext6.Resolver = Ext3, Ext6.NodeStatus = Ext4))(Ext5 || (Ext5 = {}));
export {
  ChainStatus,
  ChainType,
  CombineStrategy,
  DataType,
  Ext5 as Ext,
  NodeSignal,
  NodeSupervisor,
  NodeType,
  PipelineDataCombiner,
  PipelineProcessor
};
//# sourceMappingURL=index.mjs.map