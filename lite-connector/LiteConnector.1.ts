import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import {
  NodeSupervisor,
  PipelineProcessor,
  SupervisorPayloadSetup,
  PipelineMeta,
  Ext,
  ChainStatus,
} from 'dpcp-library';
import { CallbackPayload, NodeSignal, PipelineData } from 'dpcp-library';
import { Logger } from './libs/Logger';
import http from 'http';
import { URL } from 'url';
import { compareURLs } from './libs/utils';

dotenv.config({ path: '.connector.env' });

class SupervisorContainer {
  private static instance: SupervisorContainer;
  private nodeSupervisor: NodeSupervisor;
  private uid: string;

  private constructor(uid: string) {
    this.uid = uid;
    this.nodeSupervisor = NodeSupervisor.retrieveService();
  }

  public static async getInstance(uid: string): Promise<SupervisorContainer> {
    if (!SupervisorContainer.instance) {
      SupervisorContainer.instance = new SupervisorContainer(uid);
      await SupervisorContainer.instance.setup();
    }
    return SupervisorContainer.instance;
  }

  private notify(data: any): void {
    const { chainId, signal: notification } = data;
    Logger.header({ message: 'Connector - Notification:' });
    Logger.info({
      message: `Chain: ${chainId}, Signal: ${JSON.stringify(notification)}\n`,
    });
    //
    this.nodeSupervisor.log('chains');
    Logger.header({ message: '====================================' });
    this.nodeSupervisor.log('monitoring-workflow');
    Logger.header({ message: '====================================' });
    //
    this.nodeSupervisor.handleNotification(chainId, notification);
  }

  public async createAndStartChain(req: Request, res: Response): Promise<void> {
    try {
      const { chainConfig: config, data } = req.body;
      const chainId = await this.nodeSupervisor.handleRequest({
        signal: NodeSignal.CHAIN_DEPLOY,
        config,
        data,
      });
      res.status(201).json({
        chainId,
        message: 'Chain created and started successfully',
      });
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error creating and starting chain: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async resumeNode(req: Request, res: Response): Promise<void> {
    const { hostURI, targetId, chainId } = req.body;
    if (!hostURI || hostURI === 'local') {
      const nodes = this.nodeSupervisor.getNodesByServiceAndChain(
        targetId,
        chainId,
      );
      const nodeId = nodes[0]?.getId();
      await this.nodeSupervisor.enqueueSignals(nodeId, [
        NodeSignal.NODE_RESUME,
      ]);
      res.status(200).json({
        message: 'Enqueue local resume status',
      });
    } else if (hostURI && hostURI !== 'local') {
      this.nodeSupervisor.remoteReport(
        {
          status: ChainStatus.CHAIN_NOTIFIED,
          signal: NodeSignal.NODE_RESUME,
          payload: { targetId, hostURI },
        },
        chainId,
      );
      res.status(200).json({
        message: 'Enqueue remote resume status',
      });
    }
  }

  public async stopNode(req: Request, res: Response): Promise<void> {
    const { hostURI, targetId, chainId } = req.body;
    if (!hostURI || hostURI === 'local') {
      const nodes = this.nodeSupervisor.getNodesByServiceAndChain(
        targetId,
        chainId,
      );
      const nodeId = nodes[0]?.getId();
      await this.nodeSupervisor.enqueueSignals(nodeId, [NodeSignal.NODE_STOP]);
      res.status(200).json({
        message: 'Enqueue local stop status',
      });
    } else if (hostURI && hostURI !== 'local') {
      this.nodeSupervisor.remoteReport(
        {
          status: ChainStatus.CHAIN_NOTIFIED,
          signal: NodeSignal.NODE_STOP,
          payload: { targetId, hostURI },
        },
        chainId,
      );
      res.status(200).json({
        message: 'Enqueue remote stop status',
      });
    }
  }

  public async communicateNode(req: Request, res: Response): Promise<void> {
    const communicationType = req.params.type;
    try {
      switch (communicationType) {
        case 'setup': {
          const { chainId, remoteConfigs } = req.body;
          const resolver = remoteConfigs?.services[0]?.meta?.resolver;
          if (resolver) {
            Logger.warn({
              message: `${resolver} is taking longer than expected to complete...`,
            });
            // eslint-disable-next-line no-undef
            await new Promise((resolve) => setTimeout(resolve, 5000));
          }

          const nodeId = await this.nodeSupervisor.handleRequest({
            signal: NodeSignal.NODE_SETUP,
            config: { ...remoteConfigs, chainId },
          } as SupervisorPayloadSetup);
          res.status(201).json({ nodeId });
          break;
        }
        case 'run':
          await this.nodeSupervisor.runNodeByRelation(
            req.body as CallbackPayload,
          );
          res
            .status(200)
            .json({ message: 'Data received and processed successfully' });
          break;
        case 'notify': {
          // Handle Notifications distant Monitorings
          this.notify(req.body);
          res.status(200).json({
            message: 'Notify the signal to the supervisor monitoring',
          });
          break;
        }
        case 'enqueue-status': {
          const { hostURI, signal, chainId, targetId } = req.body;
          Logger.info({
            message: `${JSON.stringify(req.body, null, 2)}`,
          });
          let { targetType } = req.body;
          if (targetType === undefined) {
            const baseURI = process.env.BASE_URI;
            if (baseURI && compareURLs(hostURI, baseURI)) {
              targetType = 'local';
            }
          }
          if (targetType == 'local') {
            let { nodeId } = req.body;
            // find the node and enqueue the signal
            if (!nodeId) {
              const nodes = this.nodeSupervisor.getNodesByServiceAndChain(
                targetId,
                chainId,
              );
              nodeId = nodes[0];
            }
            await this.nodeSupervisor.enqueueSignals(nodeId, [signal]);
            res.status(200).json({
              message: 'Enqueue local status array',
            });
          } else {
            this.nodeSupervisor.remoteReport(
              {
                status: ChainStatus.CHAIN_NOTIFIED,
                signal,
                payload: { targetId },
              },
              chainId,
            );
            res.status(200).json({
              message: 'Enqueue remote status array',
            });
          }
          break;
        }
        default:
          res.status(400).json({ error: 'Invalid communication type' });
          return;
      }
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error in node communication (${communicationType}): ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async setup(): Promise<void> {
    PipelineProcessor.setCallbackService(
      async ({ targetId, data, meta }): Promise<PipelineData> => {
        Logger.info({
          message: `PipelineProcessor callback invoked:
                      - Connector: ${this.uid}
                      - Target: ${targetId}
                      - MetaData: ${JSON.stringify(meta?.configuration)}
                      - Data size: ${JSON.stringify(data).length} bytes
          `,
        });
        return data;
      },
    );

    await Ext.Resolver.setResolverCallbacks({
      // automatically setup the following rest post methods
      paths: {
        setup: '/node/communicate/setup',
        run: '/node/communicate/run',
      },
      hostResolver: (targetId: string, meta?: PipelineMeta) => {
        Logger.info({
          message: `Resolving host for ${targetId}, meta: ${JSON.stringify(meta, null, 2)}`,
        });
        if (meta?.resolver !== undefined) {
          return meta.resolver;
        }
        const url = new URL(targetId);
        const baseUrl = `${url.protocol}//${url.hostname}${url.port ? ':' + url.port : ''}`;
        return baseUrl;
      },
    });

    await Ext.Reporting.setMonitoringCallbacks({
      paths: {
        notify: '/node/communicate/notify',
      },
    });

    await Ext.NodeStatus.setNodeStatusResolverCallbacks({
      paths: { enqueue: '/node/communicate/enqueue-status' },
    });

    try {
      this.nodeSupervisor.setUid(this.uid);
    } catch (error) {
      Logger.error({
        message: `Failed to set node supervisor UID: ${(error as Error).message}`,
      });
      throw error;
    }
  }
}

export class LiteConnector {
  private app: Express;
  private port: number;
  private connectorUid: string;
  private server: http.Server | null;
  private container?: SupervisorContainer;

  constructor(port?: number, connectorUid?: string) {
    this.app = express();
    this.port = port || parseInt(process.env.PORT || '3000', 10);
    this.connectorUid = connectorUid || process.env.CONNECTOR_UID || 'default';
    this.server = null;
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.app.use(express.json());
  }

  private setupRoutes() {
    if (this.container) {
      this.app.post(
        '/chain/create-and-start',
        this.container.createAndStartChain.bind(this.container),
      );
      this.app.post(
        '/node/communicate/:type',
        this.container.communicateNode.bind(this.container),
      );
      this.app.post(
        '/node/resume',
        this.container.resumeNode.bind(this.container),
      );
      this.app.post('/node/stop', this.container.stopNode.bind(this.container));
    }
  }

  public async startServer(): Promise<http.Server> {
    this.container = await SupervisorContainer.getInstance(this.connectorUid);
    this.setupRoutes();

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
}
