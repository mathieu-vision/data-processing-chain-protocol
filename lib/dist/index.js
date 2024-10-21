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
  CombineStrategy: () => CombineStrategy,
  DataType: () => DataType,
  NodeMonitoring: () => NodeMonitoring,
  NodeSignal: () => NodeSignal,
  NodeStatus: () => NodeStatus,
  NodeSupervisor: () => NodeSupervisor,
  NodeType: () => NodeType,
  PipelineDataCombiner: () => PipelineDataCombiner,
  PipelineProcessor: () => PipelineProcessor,
  ProgressTracker: () => ProgressTracker,
  broadcastSetupCallback: () => broadcastSetupCallback,
  remoteServiceCallback: () => remoteServiceCallback,
  setDefaultCallbacks: () => setDefaultCallbacks
});
module.exports = __toCommonJS(src_exports);

// src/types/types.ts
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
var NodeStatus;
((NodeStatus2) => {
  NodeStatus2.PAUSED = "paused";
  NodeStatus2.PENDING = "pending";
  NodeStatus2.IN_PROGRESS = "in-progress";
  NodeStatus2.COMPLETED = "completed";
  NodeStatus2.FAILED = "failed";
})(NodeStatus || (NodeStatus = {}));
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
var import_timers = require("timers");
var import_node_crypto = require("crypto");

// src/libs/Logger.ts
var import_winston = require("winston");
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"));
var import_path = __toESM(require("path"));
var LEVEL = "level";
var PROJECT_ROOT = process.cwd();
var winstonLogsMaxFiles = "14d";
var winstonLogsMaxSize = "20m";
var levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
  header: 5
};
var level = () => process.env.LOG_LEVEL || "header";
var colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue",
  header: "cyan"
};
(0, import_winston.addColors)(colors);
var filterOnly = (level2) => {
  return (0, import_winston.format)((info) => {
    if (info[LEVEL] === level2) return info;
    return false;
  })();
};
var zFormat = import_winston.format.combine(
  import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  import_winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  import_winston.format.json()
);
var customFormat = (level2) => {
  return import_winston.format.combine(
    filterOnly(level2),
    import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    import_winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
    import_winston.format.json()
  );
};
var dailyTransportOptions = (level2) => {
  return {
    filename: import_path.default.join(PROJECT_ROOT, `logs/${level2}/${level2}_%DATE%.log`),
    format: customFormat(level2),
    level: level2,
    maxFiles: winstonLogsMaxFiles,
    maxSize: winstonLogsMaxSize
  };
};
var loggerTransports = [
  new import_winston.transports.Console({
    level: level(),
    format: import_winston.format.combine(
      import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      import_winston.format.colorize({ all: true }),
      import_winston.format.printf((info) => {
        if (info.level.includes("header")) {
          return `${info.timestamp} ${info.level}: ${info.message}`;
        }
        return `${info.timestamp} ${info.level}: ${info.message}`;
      })
    )
  }),
  new import_winston_daily_rotate_file.default(__spreadValues({}, dailyTransportOptions("error"))),
  new import_winston_daily_rotate_file.default(__spreadValues({}, dailyTransportOptions("warn"))),
  new import_winston_daily_rotate_file.default(__spreadValues({}, dailyTransportOptions("http"))),
  new import_winston_daily_rotate_file.default(__spreadValues({}, dailyTransportOptions("info"))),
  new import_winston_daily_rotate_file.default({
    maxFiles: "14d",
    maxSize: "20m",
    filename: import_path.default.join(PROJECT_ROOT, "logs/all/all_%DATE%.log"),
    format: import_winston.format.combine(
      import_winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      import_winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    level: "info"
  }),
  new import_winston_daily_rotate_file.default(__spreadValues({}, dailyTransportOptions("header")))
];
var NewWinstonLogger = (0, import_winston.createLogger)({
  level: level(),
  levels,
  format: zFormat,
  transports: loggerTransports
});
var DEFAULT_LOGGER_OPTIIONS = {
  level: "debug",
  message: "Log fired with no message",
  location: "",
  callback: () => {
  }
};
var Logger = class {
  static log(opts) {
    const options = this.getOptions(opts);
    this.doLog(options);
  }
  static error(opts) {
    this.logSpecific("error", opts);
  }
  static warn(opts) {
    this.logSpecific("warn", opts);
  }
  static info(opts) {
    this.logSpecific("info", opts);
  }
  static debug(opts) {
    this.logSpecific("debug", opts);
  }
  static http(opts) {
    this.logSpecific("http", opts);
  }
  static critical(opts) {
    const criticalCallback = () => {
    };
    const options = __spreadProps(__spreadValues(__spreadValues({}, DEFAULT_LOGGER_OPTIIONS), opts), {
      callback: criticalCallback
    });
    this.doLog(options);
  }
  static morganLog(message) {
    this.logger.log("http", message);
  }
  static header(opts) {
    this.logSpecific("header", opts);
  }
  static logSpecific(level2, opts) {
    let options;
    if (typeof opts === "string") {
      const { message, location } = this.locationFromMessage(opts);
      options = __spreadProps(__spreadValues({}, DEFAULT_LOGGER_OPTIIONS), { message, location });
    } else {
      options = this.getOptions(opts);
    }
    options.level = level2;
    this.doLog(options);
  }
  static getOptions(opts) {
    return __spreadValues(__spreadValues({}, DEFAULT_LOGGER_OPTIIONS), opts);
  }
  static doLog(opts) {
    var _a;
    const message = `${opts.message}${opts.location ? " -- " + opts.location : ""}`;
    this.logger.log((_a = opts.level) != null ? _a : "error", message, opts.callback);
  }
  static locationFromMessage(msg) {
    const split = msg.split(" -- ");
    if (split.length > 0) {
      return { message: split[1], location: split[0] };
    } else {
      return {
        message: split[0],
        location: DEFAULT_LOGGER_OPTIIONS.location
      };
    }
  }
};
Logger.logger = NewWinstonLogger;

// src/core/Node.ts
var Node = class _Node {
  constructor(dependencies = []) {
    this.id = (0, import_node_crypto.randomUUID)();
    this.output = [];
    this.pipelines = [];
    this.dependencies = dependencies;
    this.status = NodeStatus.PENDING;
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
  execute(data) {
    return __async(this, null, function* () {
      this.executionQueue = this.executionQueue.then(() => __async(this, null, function* () {
        try {
          this.updateStatus(NodeStatus.IN_PROGRESS);
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
          this.updateStatus(NodeStatus.COMPLETED);
        } catch (error) {
          this.updateStatus(NodeStatus.FAILED, error);
          Logger.error({
            message: `Node ${this.id} execution failed: ${error}`
          });
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
      Logger.info({ message: `Sending data from node ${this.id}.` });
      yield _Node.terminate(this.id, this.output);
    });
  }
  static terminate(nodeId, pipelineData) {
    return __async(this, null, function* () {
      const data = pipelineData[0];
      yield _Node.moveToNextNode(nodeId, data);
    });
  }
  static moveToNextNode(nodeId, pipelineData) {
    return __async(this, null, function* () {
      var _a, _b, _c;
      const supervisor = NodeSupervisor.retrieveService();
      const nodes = supervisor.getNodes();
      const currentNode = nodes.get(nodeId);
      if (!currentNode) {
        Logger.warn({
          message: `Node ${nodeId} not found for moving to next node.`
        });
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
            // nextNodeInfo.id needs to be the next remote target service uid
            chainId: (_a = currentNode.getConfig()) == null ? void 0 : _a.chainId,
            targetId: nextNodeInfo.id,
            data: pipelineData
          });
        }
      } else {
        Logger.info({ message: `End of pipeline reached by node ${nodeId}.` });
      }
      const isPersistant = ((_c = (_b = currentNode.config) == null ? void 0 : _b.chainType) != null ? _c : 0) & ChainType.PERSISTANT;
      if (!isPersistant) {
        yield supervisor.handleRequest({
          id: nodeId,
          signal: NodeSignal.NODE_DELETE
        });
      } else {
        Logger.warn({
          message: `Node ${nodeId} kept for future calls.`
        });
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
    return new Promise((resolve) => (0, import_timers.setTimeout)(resolve, ms));
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
    if (status === NodeStatus.FAILED) {
      this.error = error;
    }
  }
  getError() {
    return this.error;
  }
  getProcessors() {
    return this.pipelines;
  }
  setNextNodeInfo(id, type) {
    this.nextNodeInfo = { id, type };
  }
  getNextNodeInfo() {
    return this.nextNodeInfo;
  }
};

// src/core/PipelineProcessor.ts
var PipelineProcessor = class _PipelineProcessor {
  constructor(targetId) {
    this.targetId = targetId;
  }
  static setCallbackService(callbackService) {
    _PipelineProcessor.callbackService = callbackService;
  }
  digest(data) {
    return __async(this, null, function* () {
      if (_PipelineProcessor.callbackService) {
        return yield _PipelineProcessor.callbackService({
          targetId: this.targetId,
          data
        });
      }
      return {};
    });
  }
};

// src/core/NodeSupervisor.ts
var import_node_crypto2 = require("crypto");
var NodeSupervisor = class _NodeSupervisor {
  constructor() {
    this.uid = "@supervisor:default";
    this.ctn = "@container:default";
    this.nodes = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
    this.remoteServiceCallback = (_payload) => {
    };
    this.broadcastSetupCallback = (_message) => __async(this, null, function* () {
    });
  }
  setRemoteServiceCallback(callback) {
    this.remoteServiceCallback = callback;
  }
  setMonitoring(nodeMonitoring) {
    this.nodeMonitoring = nodeMonitoring;
  }
  setBroadcastSetupCallback(broadcastSetupCallback2) {
    this.broadcastSetupCallback = broadcastSetupCallback2;
  }
  setUid(uid) {
    this.ctn = `@container:${uid}`;
    this.uid = `@supervisor:${uid}`;
  }
  static retrieveService() {
    if (!_NodeSupervisor.instance) {
      const instance = new _NodeSupervisor();
      _NodeSupervisor.instance = instance;
    }
    return _NodeSupervisor.instance;
  }
  //
  handleRequest(payload) {
    return __async(this, null, function* () {
      switch (payload.signal) {
        case NodeSignal.NODE_SETUP:
          return this.setupNode(payload.config);
        case NodeSignal.NODE_CREATE:
          return this.createNode(payload.params);
        case NodeSignal.NODE_DELETE:
          return this.deleteNode(payload.id);
        case NodeSignal.NODE_PAUSE:
          return this.pauseNode(payload.id);
        case NodeSignal.NODE_DELAY:
          return this.delayNode(
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
            payload.config,
            payload.data
          );
        }
        default:
          Logger.warn({
            message: `${this.ctn}: Unknown signal received: ${payload.signal}`
          });
      }
    });
  }
  deployChain(config, data) {
    return __async(this, null, function* () {
      if (!config) {
        throw new Error(`${this.ctn}: Chain configuration is required`);
      }
      Logger.info({
        message: `${this.ctn}: Starting a new chain deployment...`
      });
      const chainId = this.createChain(config);
      yield this.prepareChainDistribution(chainId);
      yield this.startChain(chainId, data);
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} successfully deployed and started.`
      });
      return chainId;
    });
  }
  createNode(config) {
    return __async(this, null, function* () {
      const node = new Node();
      const nodeId = node.getId();
      node.setConfig(config);
      this.nodes.set(nodeId, node);
      if (this.nodeMonitoring) {
        this.nodeMonitoring.addNode(node);
      }
      Logger.info({
        message: `${this.ctn}: Node ${nodeId} created with config: ${JSON.stringify(config)}`
      });
      return nodeId;
    });
  }
  setupNode(config, initiator = false) {
    return __async(this, null, function* () {
      this.updateChain([config]);
      const nodeId = yield this.createNode(config);
      const node = this.nodes.get(nodeId);
      if (node && config.nextTargetId !== void 0) {
        node.setNextNodeInfo(config.nextTargetId, NodeType.REMOTE);
      } else {
        if (!node) {
          Logger.warn({
            message: `${this.ctn}: Attempted to set next node info on undefined node`
          });
        }
        if (!initiator && config.nextTargetId === void 0) {
          Logger.warn({
            message: `${this.ctn}: Cannot set next node info: nextTargetId is undefined`
          });
        }
      }
      const processors = config.services.map(
        (service) => new PipelineProcessor(service)
      );
      yield this.addProcessors(nodeId, processors);
      Logger.info({
        message: `${this.ctn}: Node ${nodeId} setup completed with ${processors.length} processors`
      });
      return nodeId;
    });
  }
  // Todo: set as private ?
  addProcessors(nodeId, processors) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.addPipeline(processors);
        Logger.info({
          message: `${this.ctn}: Processors added to Node ${nodeId}.`
        });
      } else {
        Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
      }
    });
  }
  deleteNode(nodeId) {
    return __async(this, null, function* () {
      if (this.nodes.has(nodeId)) {
        this.nodes.delete(nodeId);
        if (this.nodeMonitoring) {
          this.nodeMonitoring.deleteNode(nodeId);
        }
        Logger.info({ message: `${this.ctn}: Node ${nodeId} deleted.` });
      } else {
        Logger.warn({
          message: `${this.ctn}: Node ${nodeId} not found.`
        });
      }
    });
  }
  pauseNode(nodeId) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.updateStatus(NodeStatus.PAUSED);
        Logger.info({ message: `${this.ctn}: Node ${nodeId} paused.` });
      } else {
        Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
      }
    });
  }
  delayNode(nodeId, delay) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.setDelay(delay);
        Logger.info({
          message: `${this.ctn}: Node ${nodeId} delayed by ${delay} ms.`
        });
      } else {
        Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
      }
    });
  }
  createChain(config) {
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${(0, import_node_crypto2.randomUUID)().slice(0, 8)}`;
    const relation = {
      config
    };
    this.chains.set(chainId, relation);
    Logger.header({
      message: `${this.ctn}: Chain ${chainId} creation has started...`
    });
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
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} updated with ${config.length} new configurations`
      });
    } else {
      relation = {
        config
      };
      this.chains.set(chainId, relation);
      Logger.info({
        message: `${this.ctn}: Chain ${chainId} created with ${config.length} configurations`
      });
    }
    return chainId;
  }
  prepareChainDistribution(chainId) {
    return __async(this, null, function* () {
      Logger.header({
        message: `${this.ctn}: Chain distribution for ${chainId} in progress...`
      });
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
            lastLocalNode.setNextNodeInfo(
              remoteConfigs[0].services[0],
              NodeType.REMOTE
            );
          }
        }
      } else {
        Logger.warn({
          message: `${this.ctn}: No local config found for chain ${chainId}. Root node unavailable.`
        });
      }
      if (remoteConfigs.length > 0) {
        const updatedRemoteConfigs = remoteConfigs.map((config, index) => {
          const nextConfig = remoteConfigs[index + 1];
          return __spreadProps(__spreadValues({}, config), {
            nextTargetId: nextConfig ? nextConfig.services[0] : void 0
          });
        });
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
        Logger.info({
          message: `${this.ctn}: Node creation signal broadcasted with chainId: ${chainId} for remote configs`
        });
      } catch (error) {
        Logger.error({
          message: `${this.ctn}: Failed to broadcast node creation signal: ${error}`
        });
      }
    });
  }
  startChain(chainId, data) {
    return __async(this, null, function* () {
      Logger.header({ message: `Chain ${chainId} requested...` });
      const chain = this.chains.get(chainId);
      if (!chain) {
        Logger.warn({ message: `Chain ${chainId} not found.` });
        return;
      }
      const rootNodeId = chain.rootNodeId;
      if (!rootNodeId) {
        Logger.error({
          message: `${this.ctn}: Root node ID for chain ${chainId} not found.`
        });
        return;
      }
      const rootNode = this.nodes.get(rootNodeId);
      if (!rootNode) {
        Logger.error({
          message: `${this.ctn}: Root node ${rootNodeId} for chain ${chainId} not found.`
        });
        return;
      }
      try {
        yield this.runNode(rootNodeId, data);
        Logger.info({
          message: `${this.ctn}: Chain ${chainId} started with root node ${rootNodeId}.`
        });
      } catch (error) {
        Logger.error({
          message: `${this.ctn}: Failed to start chain ${chainId}: ${error}`
        });
      }
    });
  }
  runNode(nodeId, data) {
    return __async(this, null, function* () {
      const node = this.nodes.get(nodeId);
      if (node) {
        yield node.execute(data);
      } else {
        Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
      }
    });
  }
  runNodeByRelation(payload) {
    return __async(this, null, function* () {
      try {
        const { targetId, chainId, data } = payload;
        Logger.info({
          message: `Received data for node hosting target ${targetId}`
        });
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
        Logger.error({
          message: `Error in runNodeByRelation: ${error.message}`
        });
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
          Logger.error({
            message: `${this.ctn}: Node ${nodeId} send data failed: ${error.message}`
          });
        }
      } else {
        Logger.warn({ message: `${this.ctn}: Node ${nodeId} not found.` });
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
      return nodeConfig.chainId === chainId && nodeConfig.services.includes(serviceUid);
    });
  }
};
var NodeSupervisor_default = NodeSupervisor.retrieveService();

// src/core/NodeMonitoring.ts
var NodeMonitoring = class {
  constructor(chainNodes, progressTracker) {
    this.nodes = chainNodes;
    this.progressTracker = progressTracker;
    this.nodeStatusMap = /* @__PURE__ */ new Map();
    this.nodes.forEach((node) => {
      this.nodeStatusMap.set(node.getId(), node.getStatus());
    });
  }
  addNode(node) {
    if (!this.nodes.find((n) => n.getId() === node.getId())) {
      const newIndex = this.nodes.length;
      this.nodes.push(node);
      this.nodeStatusMap.set(node.getId(), node.getStatus());
      Logger.info({
        message: `Node ${node.getId()} added to monitoring at index ${newIndex}.`
      });
    } else {
      Logger.warn({
        message: `Node ${node.getId()} is already being monitored.`
      });
    }
  }
  deleteNode(nodeId) {
    const index = this.nodes.findIndex((n) => n.getId() === nodeId);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      this.nodeStatusMap.delete(nodeId);
      Logger.info({ message: `Node ${nodeId} removed from monitoring.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found in monitoring.` });
    }
  }
  updateNodeStatus(nodeId, status, error) {
    const node = this.nodes.find((n) => n.getId() === nodeId);
    if (node) {
      node.updateStatus(status, error);
      this.nodeStatusMap.set(nodeId, status);
      if (this.progressTracker) {
        this.progressTracker.notifyProgress(nodeId, status);
      }
      Logger.info({ message: `Node ${nodeId} status updated to ${status}.` });
    } else {
      Logger.warn({ message: `Node ${nodeId} not found in monitoring.` });
    }
  }
  getChainState() {
    const completed = [];
    const pending = [];
    const failed = [];
    this.nodes.forEach((node) => {
      const status = node.getStatus();
      if (status === NodeStatus.COMPLETED) {
        completed.push(node.getId());
      } else if (status === NodeStatus.FAILED) {
        failed.push(node.getId());
      } else {
        pending.push(node.getId());
      }
    });
    return { completed, pending, failed };
  }
  // Todo: review
  canExecuteNode(nodeId) {
    const node = this.nodes.find((n) => n.getId() === nodeId);
    if (node) {
      const completedNodes = new Set(this.getCompletedNodes());
      return node.canExecute(completedNodes);
    } else {
      Logger.warn({ message: `Node ${nodeId} not found in monitoring.` });
      return false;
    }
  }
  getCompletedNodes() {
    return this.nodes.filter((node) => node.getStatus() === NodeStatus.COMPLETED).map((node) => node.getId());
  }
  setProgressTracker(progressTracker) {
    this.progressTracker = progressTracker;
    Logger.info({ message: `ProgressTracker updated.` });
  }
};

// src/core/ProgressTracker.ts
var ProgressTracker = class {
  constructor(totalNodes) {
    this.completedNodes = 0;
    this.totalNodes = totalNodes;
  }
  notifyProgress(nodeId, status) {
    if (status === NodeStatus.COMPLETED) {
      this.completedNodes++;
    }
    const progressPercentage = Math.round(
      this.completedNodes / this.totalNodes * 100
    );
    Logger.info({
      message: `Node ${nodeId}: ${status}. Progress: ${progressPercentage}%`
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

// src/extra/DefaultCallbacks.ts
var import_buffer = require("buffer");
var http = __toESM(require("http"));
var https = __toESM(require("https"));
var broadcastSetupCallback = (payload) => __async(void 0, null, function* () {
  const { message, hostResolver, path: path2 } = payload;
  Logger.info({
    message: `Broadcast message: ${JSON.stringify(message, null, 2)}`
  });
  const chainConfigs = message.chain.config;
  const chainId = message.chain.id;
  for (const config of chainConfigs) {
    if (config.services.length === 0) {
      Logger.warn({
        message: "Empty services array encountered in config"
      });
      continue;
    }
    const targetId = config.services[0];
    const host = hostResolver(targetId);
    if (!host) {
      Logger.warn({
        message: `No container address found for targetId: ${targetId}`
      });
      continue;
    }
    try {
      const postData = JSON.stringify({
        chainId,
        remoteConfigs: config
      });
      const url = new URL(path2, host);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": import_buffer.Buffer.byteLength(postData)
        }
      };
      yield new Promise((resolve, reject) => {
        const req = (url.protocol === "https:" ? https : http).request(
          options,
          (res) => {
            let data = "";
            res.on("data", (chunk) => {
              data += chunk;
            });
            res.on("end", () => {
              if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                Logger.info({
                  message: `Setup request sent to ${host} for targetId ${targetId}. Response: ${data}`
                });
                resolve(data);
              } else {
                Logger.error({
                  message: `Setup request to ${host} for targetId ${targetId} failed with status ${res.statusCode}`
                });
                reject(
                  new Error(
                    `HTTP Error: ${res.statusCode} ${res.statusMessage} - URL: ${options.hostname}${options.path}`
                  )
                );
              }
            });
          }
        );
        req.on("error", (error) => {
          Logger.error({
            message: `Error sending setup request to ${host} for targetId ${targetId}: ${error.message}`
          });
          reject(error);
        });
        req.write(postData);
        req.end();
      });
    } catch (error) {
      Logger.error({
        message: `Unexpected error sending setup request to ${host} for targetId ${targetId}: ${error.message}`
      });
    }
  }
});
var remoteServiceCallback = (payload) => __async(void 0, null, function* () {
  const { cbPayload, hostResolver, path: path2 } = payload;
  Logger.info({
    message: `Service callback payload: ${JSON.stringify(payload, null, 2)}`
  });
  try {
    if (!cbPayload.chainId) {
      throw new Error("payload.chainId is undefined");
    }
    const nextConnectorUrl = hostResolver(cbPayload.targetId);
    if (!nextConnectorUrl) {
      throw new Error(
        `Next connector URI not found for the following target service: ${cbPayload.targetId}`
      );
    }
    const url = new URL(path2, nextConnectorUrl);
    Logger.info({
      message: `Sending data to next connector on: ${url.href}`
    });
    const postData = JSON.stringify(cbPayload);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": import_buffer.Buffer.byteLength(postData)
      }
    };
    return new Promise((resolve, reject) => {
      const req = (url.protocol === "https:" ? https : http).request(
        options,
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              throw new Error(
                `HTTP Error: ${res.statusCode} ${res.statusMessage} - URL: ${options.hostname}${options.path}`
              );
            }
          });
        }
      );
      req.on("error", (error) => {
        Logger.error({
          message: `Error sending data to next connector: ${error.message}`
        });
        reject(error);
      });
      req.write(postData);
      req.end();
    });
  } catch (error) {
    Logger.error({
      message: `Error sending data to next connector: ${error.message}`
    });
    throw error;
  }
});
var setDefaultCallbacks = (dcPayload) => __async(void 0, null, function* () {
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CombineStrategy,
  DataType,
  NodeMonitoring,
  NodeSignal,
  NodeStatus,
  NodeSupervisor,
  NodeType,
  PipelineDataCombiner,
  PipelineProcessor,
  ProgressTracker,
  broadcastSetupCallback,
  remoteServiceCallback,
  setDefaultCallbacks
});
//# sourceMappingURL=index.js.map