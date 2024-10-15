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
  ProgressTracker: () => ProgressTracker
});
module.exports = __toCommonJS(src_exports);

// src/types/types.ts
var NodeType;
((NodeType2) => {
  NodeType2.LOCAL = "local";
  NodeType2.EXTERNAL = "external";
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
})(NodeSignal || (NodeSignal = {}));

// src/core/Node.ts
var import_timers = require("timers");
var import_node_crypto = require("crypto");

// src/libs/Logger.ts
var import_winston = require("winston");
var import_winston_daily_rotate_file = __toESM(require("winston-daily-rotate-file"));
var import_path = __toESM(require("path"));
var LEVEL = "level";
var PROJECT_ROOT = import_path.default.resolve(__dirname, "..", "..");
var winstonLogsMaxFiles = "14d";
var winstonLogsMaxSize = "20m";
var levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};
var level = () => process.env.LOG_LEVEL || "debug";
var colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "blue"
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
      import_winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
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
  })
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
      var _a;
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
        } else if (nextNodeInfo.type === NodeType.EXTERNAL) {
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
      yield supervisor.handleRequest({
        id: nodeId,
        signal: NodeSignal.NODE_DELETE
      });
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
        return _PipelineProcessor.callbackService({
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
    this.broadcastSetup = () => __async(this, null, function* () {
    });
    this.uid = "@supervisor:default";
    this.ctn = "@container:default";
    this.nodes = /* @__PURE__ */ new Map();
    this.chains = /* @__PURE__ */ new Map();
    this.remoteServiceCallback = (_payload) => {
    };
  }
  setRemoteServiceCallback(callback) {
    this.remoteServiceCallback = callback;
  }
  setMonitoring(nodeMonitoring) {
    this.nodeMonitoring = nodeMonitoring;
  }
  setBroadcastSetupCallback(broadcastSetup) {
    this.broadcastSetup = broadcastSetup;
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
        //
        case NodeSignal.NODE_SEND_DATA:
          return yield this.sendNodeData(
            payload.id
          );
        //
        // Todo: add prepareChain
        // Todo: add startChain
        default:
          Logger.warn({
            message: `${this.ctn}: Unknown signal received: ${payload.signal}`
          });
      }
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
  setupNode(config) {
    return __async(this, null, function* () {
      console.log(`${this.ctn}: ${JSON.stringify(config, null, 2)}`);
      this.updateChain([config]);
      const nodeId = yield this.createNode(config);
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
    Logger.info({
      message: `${this.ctn}: Chain ${chainId} created`
    });
    return chainId;
  }
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
        const rootNodeId = yield this.setupNode(__spreadProps(__spreadValues({}, localConfigs[0]), { chainId }));
        chain.rootNodeId = rootNodeId;
        let prevNodeId = rootNodeId;
        for (let i = 1; i < localConfigs.length; i++) {
          const currentNodeId = yield this.setupNode(__spreadProps(__spreadValues({}, localConfigs[i]), {
            chainId
          }));
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
              NodeType.EXTERNAL
            );
          }
        }
      }
      if (remoteConfigs.length > 0) {
        yield this.broadcastNodeSetupSignal(chainId, remoteConfigs);
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
        yield this.broadcastSetup(message);
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
    const chain = this.chains.get(chainId);
    console.log(
      JSON.stringify(chain, null, 2),
      "chain <<<<",
      chainId,
      "<<< chainID"
    );
    if (!chain) {
      return [];
    }
    return Array.from(this.nodes.values()).filter((node) => {
      const nodeConfig = chain.config.find(
        (config) => config.services.includes(node.getId())
      );
      return nodeConfig && nodeConfig.services.includes(serviceUid);
    });
  }
  getNodesByService(serviceUid) {
    return Array.from(this.nodes.values()).filter((node) => {
      const chainConfigs = Array.from(this.chains.values()).map(
        (chain) => chain.config
      );
      return chainConfigs.some(
        (configs) => configs.some(
          (config) => config.services.includes(node.getId()) && config.services.includes(serviceUid)
        )
      );
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
  ProgressTracker
});
//# sourceMappingURL=index.js.map