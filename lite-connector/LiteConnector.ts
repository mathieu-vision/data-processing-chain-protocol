import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import {
  BrodcastMessage,
  ChainConfig,
  NodeSupervisor,
  PipelineProcessor,
  SupervisorPayloadSetup,
} from 'dpcp-library';
import { CallbackPayload, NodeSignal, PipelineData } from 'dpcp-library';
import { Logger } from './libs/Logger';
import path from 'path';
import http from 'http';

dotenv.config({ path: '.connector.env' });

export class LiteConnector {
  private app: Express;
  private port: number;
  private connectorUid: string;
  private nodeSupervisor: NodeSupervisor;
  private serviceConnectorMap: Map<string, string>;
  private server: http.Server | null;

  constructor(port?: number, connectorUid?: string) {
    this.app = express();
    this.port = port || parseInt(process.env.PORT || '3000', 10);
    this.connectorUid = connectorUid || process.env.CONNECTOR_UID || 'default';
    this.nodeSupervisor = NodeSupervisor.retrieveService();
    this.serviceConnectorMap = new Map();
    this.server = null;

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    // public
    this.app.post(
      '/configure-service-connector',
      this.configureServiceConnector.bind(this),
    );
    // public
    this.app.post('/chain/create', this.createChain.bind(this));
    // private
    this.app.post('/node/setup', this.setupNode.bind(this));
    // public
    this.app.put('/chain/start', this.startChain.bind(this));
    // private
    this.app.put('/node/run', this.runNode.bind(this));
  }

  // Configuration: need a way to determine where a service is located and which remote connector is hosting it
  private async configureServiceConnector(
    req: Request,
    res: Response,
  ): Promise<void> {
    const configurations = req.body;
    if (!Array.isArray(configurations) || configurations.length === 0) {
      res.status(400).json({
        error: 'Invalid configuration format. Expected non-empty array.',
      });
      return;
    }

    const updatedMappings: string[] = [];

    for (const config of configurations) {
      const { targetUID, connectorURI } = config;
      if (!targetUID || !connectorURI) {
        const errorMessage = `Invalid configuration: ${JSON.stringify(config)}. Both targetUID and connectorURI are required.`;
        Logger.error({ message: errorMessage });
        res.status(400).json({ error: errorMessage });
        return;
      }

      try {
        new URL(connectorURI);
      } catch (error) {
        const errorMessage = `Invalid connectorURI for targetUID ${targetUID}: ${connectorURI}, error: ${(error as Error).message}`;
        Logger.error({ message: errorMessage });
        res.status(400).json({ error: errorMessage });
        return;
      }

      this.serviceConnectorMap.set(targetUID, connectorURI);
      updatedMappings.push(`${targetUID} -> ${connectorURI}`);
    }

    if (updatedMappings.length > 0) {
      Logger.info({
        message: `Updated service-connector mappings:\n${updatedMappings.join('\n')}`,
      });
    }

    res.status(200).json({
      message: 'All service-connector mappings updated successfully',
      updatedMappings: updatedMappings,
    });
  }

  // Step 1: Chain creation should be initiated from a customer connector
  // Endpoint example containing a basic implementation very close to real-world usage:
  private async createChain(req: Request, res: Response): Promise<void> {
    try {
      const chainConfig = req.body.chainConfig;
      if (!chainConfig) {
        res.status(400).json({ error: 'Chain configuration is required' });
        return;
      }
      const chainId = this.nodeSupervisor.createChain(chainConfig);
      await this.nodeSupervisor.prepareChainDistribution(chainId);
      res.status(201).json({ chainId });
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error creating chain: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Step 2: Automatically invoked after receiving a message from the broadcastSetup callback of a remote connector
  // Basic implementation very close to real-world usage:
  private async setupNode(req: Request, res: Response): Promise<void> {
    try {
      const { chainId, remoteConfigs } = req.body;
      const nodeId = await this.nodeSupervisor.handleRequest({
        signal: NodeSignal.NODE_SETUP,
        config: { ...remoteConfigs, chainId },
      } as SupervisorPayloadSetup);
      res.status(201).json({ nodeId });
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error setting up node: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Step 3: Start the chain from customer connector
  // Basic implementation very close to real-world usage:
  private async startChain(req: Request, res: Response): Promise<void> {
    try {
      const { chainId, data } = req.body;
      if (!chainId) {
        res.status(400).json({ error: 'Chain ID is required' });
        return;
      }
      await this.nodeSupervisor.startChain(chainId, data);
      res.status(200).json({ message: 'Chain started successfully' });
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error starting chain: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Step 4: Automatically invoked by the remoteService callback to run a node in the chain using a given service ID for a specific chain ID
  // Basic implementation very close to real-world usage:
  private async runNode(req: Request, res: Response): Promise<void> {
    try {
      const { targetId, chainId, data } = req.body;
      Logger.info({
        message: `Received data for node hosting target ${targetId}`,
      });

      const node = this.nodeSupervisor.getNodesByServiceAndChain(
        targetId,
        chainId,
      );
      if (!node || node.length === 0) {
        throw new Error(
          `No node found for targetId ${targetId} and chainId ${chainId}`,
        );
      }
      const nodeId = node[0].getId();
      if (nodeId === undefined) {
        throw new Error(
          `Node ID is undefined for targetId ${targetId} and chainId ${chainId}`,
        );
      }
      await this.nodeSupervisor.handleRequest({
        signal: NodeSignal.NODE_RUN,
        id: nodeId,
        data: data as PipelineData,
      });

      res
        .status(200)
        .json({ message: 'Data received and processed successfully' });
    } catch (err) {
      const error: Error = err as Error;
      Logger.error({
        message: `Error processing received data: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Initialization of the node supervisor
  public async initializeNodeSupervisor(): Promise<void> {
    // Required callback to handle infrastructure services
    PipelineProcessor.setCallbackService(
      async ({ targetId, data }): Promise<PipelineData> => {
        Logger.info({
          message: `PipelineProcessor callback invoked - Connector: ${this.connectorUid}, Target: ${targetId}, Data size: ${JSON.stringify(data).length} bytes`,
        });
        return data;
      },
    );

    // Required broadcast setup callback
    this.nodeSupervisor.setBroadcastSetupCallback(
      async (message: BrodcastMessage): Promise<void> => {
        Logger.info({
          message: `Broadcast message: ${JSON.stringify(message, null, 2)}`,
        });
        const chainConfigs: ChainConfig = message.chain.config;
        const chainId: string = message.chain.id;
        for (const config of chainConfigs) {
          if (config.services.length === 0) {
            Logger.warn({
              message: 'Empty services array encountered in config',
            });
            continue;
          }
          const targetId: string = config.services[0];
          const address: string | undefined =
            this.serviceConnectorMap.get(targetId);
          if (!address) {
            Logger.warn({
              message: `No connector address found for targetId: ${targetId}`,
            });
            continue;
          }
          try {
            // Send a POST request to set up the node on a remote connector for the specified service connector host address
            const response = await axios.post(`${address}/node/setup`, {
              chainId,
              remoteConfigs: config,
            });
            Logger.info({
              message: `Setup request sent to ${address} for targetId ${targetId}. Response: ${JSON.stringify(response.data)}`,
            });
          } catch (error) {
            if (axios.isAxiosError(error)) {
              Logger.error({
                message: `Error sending setup request to ${address} for targetId ${targetId}: ${error.message}`,
              });
            } else {
              Logger.error({
                message: `Unexpected error sending setup request to ${address} for targetId ${targetId}: ${(error as Error).message}`,
              });
            }
          }
        }
      },
    );

    // Required remote service callback example:
    this.nodeSupervisor.setRemoteServiceCallback(
      async (payload: CallbackPayload) => {
        Logger.info({
          message: `Service callback payload: ${JSON.stringify(payload, null, 2)}`,
        });
        try {
          if (!payload.chainId) {
            throw new Error('payload.chainId is undefined');
          }

          const nextConnectorUrl = this.serviceConnectorMap.get(
            payload.targetId,
          );
          if (!nextConnectorUrl) {
            throw new Error(
              `Next connector URI not found for the following target service: ${payload.targetId}`,
            );
          }

          const url = new URL(path.posix.join(nextConnectorUrl, '/node/run'));
          Logger.info({
            message: `Sending data to next connector on: ${url.href}`,
          });
          await axios.put(url.href, {
            chainId: payload.chainId,
            targetId: payload.targetId,
            data: payload.data,
          });
        } catch (error) {
          Logger.error({
            message: `Error sending data to next connector: ${(error as Error).message}`,
          });
        }
      },
    );

    try {
      this.nodeSupervisor.setUid(this.connectorUid);
    } catch (error) {
      Logger.error({
        message: `Failed to set node supervisor UID: ${(error as Error).message}`,
      });
      throw error;
    }
  }

  public async startServer(): Promise<http.Server> {
    await this.initializeNodeSupervisor();
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, () => {
        Logger.info({
          message: `Test connector server running on http://localhost:${this.port}`,
        });
        resolve(this.server as http.Server);
      });
    });
  }

  public async stopServer(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server?.close(() => {
          this.server = null;
          resolve();
        });
      });
    }
  }

  public getApp(): Express {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }

  public setPort(port: number): void {
    this.port = port;
  }

  public getConnectorUid(): string {
    return this.connectorUid;
  }

  public setConnectorUid(uid: string): void {
    this.connectorUid = uid;
  }
}
