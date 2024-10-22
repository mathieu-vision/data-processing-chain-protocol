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
import { setTimeout, setImmediate } from "timers";
import { randomUUID } from "node:crypto";

// src/core/Logger.ts
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

// src/core/Node.ts
var Node = class _Node {
  constructor(dependencies = []) {
    this.id = randomUUID();
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
          this.updateStatus(NodeStatus.COMPLETED);
        } catch (error) {
          this.updateStatus(NodeStatus.FAILED, error);
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
            // nextNodeInfo.id needs to be the next remote target service uid
            chainId: (_a = currentNode.getConfig()) == null ? void 0 : _a.chainId,
            targetId: nextNodeInfo.id,
            data: pipelineData
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
import { randomUUID as randomUUID2 } from "node:crypto";
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
  static retrieveService(refresh = false) {
    if (!_NodeSupervisor.instance || refresh) {
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
            payload.config,
            payload.data
          );
        }
        default:
          Logger.warn(`${this.ctn}: Unknown signal received: ${payload.signal}`);
      }
    });
  }
  deployChain(config, data) {
    return __async(this, null, function* () {
      if (!config) {
        throw new Error(`${this.ctn}: Chain configuration is required`);
      }
      Logger.info(`${this.ctn}: Starting a new chain deployment...`);
      const chainId = this.createChain(config);
      yield this.prepareChainDistribution(chainId);
      yield this.startChain(chainId, data);
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
      if (this.nodeMonitoring) {
        this.nodeMonitoring.addNode(node);
      }
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
      if (node && config.nextTargetId !== void 0) {
        node.setNextNodeInfo(config.nextTargetId, NodeType.REMOTE);
      } else {
        if (!node) {
          Logger.warn(
            `${this.ctn}: Attempted to set next node info on undefined node`
          );
        }
        if (!initiator && config.nextTargetId === void 0) {
          Logger.warn(
            `${this.ctn}: Cannot set next node info: nextTargetId is undefined`
          );
        }
      }
      const processors = config.services.map(
        (service) => new PipelineProcessor(service)
      );
      yield this.addProcessors(nodeId, processors);
      Logger.info(
        `${this.ctn}: Node ${nodeId} setup completed with ${processors.length} processors`
      );
      return nodeId;
    });
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
        if (this.nodeMonitoring) {
          this.nodeMonitoring.deleteNode(nodeId);
        }
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
        node.updateStatus(NodeStatus.PAUSED);
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
    const timestamp = Date.now();
    const chainId = `${this.uid}-${timestamp}-${randomUUID2().slice(0, 8)}`;
    const relation = {
      config
    };
    this.chains.set(chainId, relation);
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
            lastLocalNode.setNextNodeInfo(
              remoteConfigs[0].services[0],
              NodeType.REMOTE
            );
          }
        }
      } else {
        Logger.warn(
          `${this.ctn}: No local config found for chain ${chainId}. Root node unavailable.`
        );
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
      Logger.info(
        `Node ${node.getId()} added to monitoring at index ${newIndex}.`
      );
    } else {
      Logger.warn(`Node ${node.getId()} is already being monitored.`);
    }
  }
  deleteNode(nodeId) {
    const index = this.nodes.findIndex((n) => n.getId() === nodeId);
    if (index !== -1) {
      this.nodes.splice(index, 1);
      this.nodeStatusMap.delete(nodeId);
      Logger.info(`Node ${nodeId} removed from monitoring.`);
    } else {
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
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
      Logger.info(`Node ${nodeId} status updated to ${status}.`);
    } else {
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
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
      Logger.warn(`Node ${nodeId} not found in monitoring.`);
      return false;
    }
  }
  getCompletedNodes() {
    return this.nodes.filter((node) => node.getStatus() === NodeStatus.COMPLETED).map((node) => node.getId());
  }
  setProgressTracker(progressTracker) {
    this.progressTracker = progressTracker;
    Logger.info(`ProgressTracker updated.`);
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
    Logger.info(`Node ${nodeId}: ${status}. Progress: ${progressPercentage}%`);
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
import { Buffer as Buffer2 } from "buffer";
import * as http from "http";
import * as https from "https";
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
    const targetId = config.services[0];
    const host = hostResolver(targetId);
    if (!host) {
      Logger.warn(`No container address found for targetId: ${targetId}`);
      continue;
    }
    try {
      const postData = JSON.stringify({
        chainId,
        remoteConfigs: config
      });
      const url = new URL(path, host);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer2.byteLength(postData)
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
                Logger.info(
                  `Setup request sent to ${host} for targetId ${targetId}. Response: ${data}`
                );
                resolve(data);
              } else {
                Logger.error(
                  `Setup request to ${host} for targetId ${targetId} failed with status ${res.statusCode}`
                );
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
          Logger.error(
            `Error sending setup request to ${host} for targetId ${targetId}: ${error.message}`
          );
          reject(error);
        });
        req.write(postData);
        req.end();
      });
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
    const nextConnectorUrl = hostResolver(cbPayload.targetId);
    if (!nextConnectorUrl) {
      throw new Error(
        `Next connector URI not found for the following target service: ${cbPayload.targetId}`
      );
    }
    const url = new URL(path, nextConnectorUrl);
    Logger.info(`Sending data to next connector on: ${url.href}`);
    const postData = JSON.stringify(cbPayload);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer2.byteLength(postData)
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
        Logger.error(`Error sending data to next connector: ${error.message}`);
        reject(error);
      });
      req.write(postData);
      req.end();
    });
  } catch (error) {
    Logger.error(
      `Error sending data to next connector: ${error.message}`
    );
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
export {
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
};
//# sourceMappingURL=index.mjs.map