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

// src/types/types.ts
var DefaultCallback;
((DefaultCallback2) => {
  DefaultCallback2.SERVICE_CALLBACK = (payload) => {
  };
  DefaultCallback2.SETUP_CALLBACK = (message) => __async(void 0, null, function* () {
  });
  DefaultCallback2.REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
  });
  DefaultCallback2.BROADCAST_REPORTING_CALLBACK = (message) => __async(void 0, null, function* () {
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
  ChainStatus2.NODE_IN_PROGRESS = "node_in-progress";
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
  NodeSignal2.CHAIN_DEPLOY = "chain_deploy";
})(NodeSignal || (NodeSignal = {}));

// src/core/Node.ts
import { setTimeout, setImmediate } from "timers";
import { randomUUID as randomUUID2 } from "node:crypto";

// src/extra/Logger.ts
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
    const msg = typeof message === "string" ? message : format(message);
    this.log("info", msg);
  }
  static warn(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("warn", msg);
  }
  static error(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("error", msg);
  }
  static header(message) {
    const msg = typeof message === "string" ? message : format(message);
    this.log("header", msg);
  }
};
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

// src/agents/Agent.ts
import EventEmitter from "node:events";
import { randomUUID } from "node:crypto";
var Agent = class extends EventEmitter {
  constructor() {
    super();
    this.uid = randomUUID();
  }
};

// src/agents/ReportingAgent.ts
var _ReportingAgentBase = class _ReportingAgentBase extends Agent {
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
  static authorize(agent) {
    _ReportingAgentBase.authorizedAgent = agent;
  }
  notify(status) {
    Logger.info(`Status ${status} from ${this.uid}`);
    this.status.push(status);
    this.emit("signal", status);
  }
  getSignals() {
    return this.status;
  }
};
_ReportingAgentBase.authorizedAgent = null;
var ReportingAgentBase = _ReportingAgentBase;

// src/agents/MonitoringAgent.ts
var ReportingAgent = class extends ReportingAgentBase {
  constructor(chainId, nodeId) {
    super();
    this.chainId = chainId;
    this.nodeId = nodeId;
  }
};
var MonitoringAgent = class _MonitoringAgent extends Agent {
  // chain-id:node-reporter-agent-id
  // private reportings: Map<string, string>;
  constructor() {
    super();
    this.remoteMonitoringHost = /* @__PURE__ */ new Map();
    this.reportingCallback = DefaultCallback.REPORTING_CALLBACK;
    this.broadcastReportingCallback = DefaultCallback.BROADCAST_REPORTING_CALLBACK;
  }
  static retrieveService(refresh = false) {
    if (!_MonitoringAgent.instance || refresh) {
      const instance = new _MonitoringAgent();
      _MonitoringAgent.instance = instance;
    }
    return _MonitoringAgent.instance;
  }
  setReportingCallback(reportingCallback2) {
    this.reportingCallback = reportingCallback2;
  }
  setBroadcastReportingCallback(broadcastReportingCallback2) {
    this.broadcastReportingCallback = broadcastReportingCallback2;
  }
  getRemoteMonitoringHost(chainId) {
    return this.remoteMonitoringHost.get(chainId);
  }
  setRemoteMonitoringHost(chainId, remoteMonitoringHost) {
    this.remoteMonitoringHost.set(chainId, remoteMonitoringHost);
  }
  genReportingAgent(payload) {
    const { chainId, nodeId, index } = payload;
    ReportingAgent.authorize(this);
    const reporting = new ReportingAgent(chainId, nodeId);
    reporting.on("signal", (signal) => __async(this, null, function* () {
      Logger.info(`Receive signal: ${signal}`);
      const message = __spreadProps(__spreadValues({}, payload), { signal });
      if (index > 0) {
        void this.broadcastReportingCallback(message);
      } else {
        yield this.reportingCallback(message);
      }
    }));
    return reporting;
  }
};

// src/core/Node.ts
var Node = class _Node {
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
  updateProgress() {
    this.progress += 1 / this.pipelines.length;
  }
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
      Logger.warn("Node index is not defined");
    }
    this.config = config;
  }
  getExecutionQueue() {
    return this.executionQueue;
  }
  getConfig() {
    return this.config;
  }
  getId() {
    return this.id;
  }
  addPipeline(pipeline) {
    this.pipelines.push(pipeline);
  }
  // digest the data through successive processing stages
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
  notify(notify) {
    try {
      if (this.reporting !== null) {
        this.reporting.notify(notify);
      } else {
        throw new Error("Reporter not set");
      }
    } catch (error) {
      Logger.error(error.message);
    }
  }
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
        } catch (error) {
          this.updateStatus(ChainStatus.NODE_FAILED, error);
          Logger.error(`Node ${this.id} execution failed: ${error}`);
        }
      }));
      const supervisor = NodeSupervisor.retrieveService();
      yield supervisor.handleRequest({
        id: this.id,
        signal: NodeSignal.NODE_SEND_DATA
      });
    });
  }
  // ...
  sendData() {
    return __async(this, null, function* () {
      yield this.executionQueue;
      Logger.info(`Sending data from node ${this.id}.`);
      yield _Node.terminate(this.id, this.output);
    });
  }
  static terminate(nodeId, pipelineData) {
    return __async(this, null, function* () {
      const data = pipelineData[0];
      yield _Node.moveToNextNode(nodeId, data);
    });
  }
  // todo: should not be static
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
            id: nextNodeInfo.id,
            data: pipelineData,
            signal: NodeSignal.NODE_RUN
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
  getProgress() {
    return this.progress;
  }
  canExecute(executedNodes) {
    return this.dependencies.every((dep) => executedNodes.has(dep));
  }
  setDelay(delay) {
    this.delay = delay;
  }
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  getDataType() {
    return this.dataType;
  }
  getStatus() {
    return this.status;
  }
  getDependencies() {
    return this.dependencies;
  }
  updateStatus(status, error) {
    this.status = status;
    if (status === ChainStatus.NODE_FAILED) {
      this.error = error;
    }
  }
  getError() {
    return this.error;
  }
  getProcessors() {
    return this.pipelines;
  }
  setNextNodeInfo(id, type, meta) {
    this.nextNodeInfo = { id, type, meta };
  }
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
import { randomUUID as randomUUID3 } from "node:crypto";
var NodeSupervisor = class _NodeSupervisor {
  constructor() {
    this.uid = "@supervisor:default";
    this.ctn = "@container:default";
    this.nodes = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
    this.remoteServiceCallback = DefaultCallback.SERVICE_CALLBACK;
    this.broadcastSetupCallback = DefaultCallback.SETUP_CALLBACK;
    (message) => __async(this, null, function* () {
    });
  }
  static retrieveService(refresh = false) {
    if (!_NodeSupervisor.instance || refresh) {
      const instance = new _NodeSupervisor();
      _NodeSupervisor.instance = instance;
    }
    return _NodeSupervisor.instance;
  }
  setRemoteServiceCallback(remoteServiceCallback2) {
    this.remoteServiceCallback = remoteServiceCallback2;
  }
  setBroadcastSetupCallback(broadcastSetupCallback2) {
    this.broadcastSetupCallback = broadcastSetupCallback2;
  }
  setBroadcastReportingCallback(broadcastReportingCallback2) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setBroadcastReportingCallback(broadcastReportingCallback2);
  }
  setMonitoringCallback(reportingCallback2) {
    const monitoring = MonitoringAgent.retrieveService();
    monitoring.setReportingCallback(reportingCallback2);
  }
  setUid(uid) {
    this.ctn = `@container:${uid}`;
    this.uid = `@supervisor:${uid}`;
  }
  handleRequest(payload) {
    return __async(this, null, function* () {
      switch (payload.signal) {
        case NodeSignal.NODE_SETUP:
          return yield this.setupNode(payload.config);
        case NodeSignal.NODE_CREATE:
          return yield this.createNode(
            payload.params
          );
        case NodeSignal.NODE_DELETE:
          return yield this.deleteNode(payload.id);
        case NodeSignal.NODE_PAUSE:
          return yield this.pauseNode(payload.id);
        case NodeSignal.NODE_DELAY:
          return yield this.delayNode(
            payload.id,
            payload.delay
          );
        case NodeSignal.NODE_RUN:
          return yield this.runNode(
            payload.id,
            payload.data
          );
        case NodeSignal.NODE_SEND_DATA:
          return yield this.sendNodeData(
            payload.id
          );
        case NodeSignal.CHAIN_PREPARE:
          return yield this.prepareChainDistribution(
            payload.id
          );
        case NodeSignal.CHAIN_START:
          return yield this.startChain(
            payload.id,
            payload.data
          );
        case NodeSignal.CHAIN_DEPLOY: {
          return yield this.deployChain(
            payload.config
            // (payload as SupervisorPayloadDeployChain).data,
          );
        }
        default:
          Logger.warn(`${this.ctn}: Unknown signal received: ${payload.signal}`);
      }
    });
  }
  deployChain(config) {
    return __async(this, null, function* () {
      if (!config) {
        throw new Error(`${this.ctn}: Chain configuration is required`);
      }
      Logger.info(`${this.ctn}: Starting a new chain deployment...`);
      const chainId = this.createChain(config);
      yield this.prepareChainDistribution(chainId);
      Logger.info(
        `${this.ctn}: Chain ${chainId} successfully deployed and started.`
      );
      return chainId;
    });
  }
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
  notify(nodeId, status) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.notify(status);
    } else {
      Logger.warn(`${this.ctn}: Can't notify non-existing node ${nodeId}`);
    }
  }
  // Todo: set as private ?
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
  createChain(config) {
    var _a;
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${randomUUID3().slice(0, 8)}`;
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
  // todo: review
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
  getNodes() {
    return this.nodes;
  }
  //
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
  const { supervisor, paths, hostResolver } = dcPayload;
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
  Logger.info(JSON.stringify(payload, null, 2));
  const { message, reportSignalHandler } = payload;
  yield reportSignalHandler(message);
});
var defaultMonitoringResolver = (chainId) => __async(void 0, null, function* () {
  try {
    const monitoring = MonitoringAgent.retrieveService();
    const monitoringHost = monitoring.getRemoteMonitoringHost(chainId);
    if (monitoringHost !== void 0) {
      Logger.info({
        message: `Resolving host for monitoring: ${monitoringHost}`
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
  Logger.info(`Data send to ${url}: ${JSON.stringify(data, null, 2)}`);
  yield post(url, data);
});
var setMonitoringCallbacks = (dcPayload) => __async(void 0, null, function* () {
  const { supervisor, paths, reportSignalHandler, monitoringResolver } = dcPayload;
  supervisor.setMonitoringCallback(
    (message) => __async(void 0, null, function* () {
      const payload = {
        message,
        reportSignalHandler
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
export {
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
};
//# sourceMappingURL=index.mjs.map