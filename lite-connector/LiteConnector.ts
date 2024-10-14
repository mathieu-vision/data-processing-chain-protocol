import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import {
  BrodcastMessage,
  ChainConfig,
  NodeSupervisor,
  SupervisorPayloadSetup,
} from 'dpcp-library';
import { CallbackPayload, NodeSignal, PipelineData } from 'dpcp-library';
import { Logger } from './libs/Logger';
import path from 'path';

dotenv.config({ path: '.connector.env' });

const app = express();
const port = process.env.PORT || 3000;
const connectorUid = process.env.CONNECTOR_UID;

app.use(express.json());

const nodeSupervisor = NodeSupervisor.retrieveService();

// Todo: review
// Mapping example between connector and service uid
const serviceConnectorMap: ReadonlyMap<string, string> = new Map([
  ['service1', 'http://localhost:3001'],
  ['service2', 'http://localhost:3002'],
  ['service3', 'http://localhost:3003'],
]);

// Step 1: Chain creation should be initiated from a customer connector
// Endpoint example containing a basic implementation very close to real-world usage:
app.post(
  '/chain/create',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const chainConfig = req.body.chainConfig;
      if (!chainConfig) {
        res.status(400).json({ error: 'Chain configuration is required' });
        return;
      }
      const chainId = nodeSupervisor.createChain(chainConfig);
      await nodeSupervisor.prepareChainDistribution(chainId);
      res.status(201).json({ chainId });
    } catch (err) {
      const error = err as Error;
      Logger.error({
        message: `Error creating chain: ${error.message}`,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// Step 2: Automatically invoked after receiving a message from the broadcastSetup callback of a remote connector
// Basic implementation very close to real-world usage:
app.post('/node/setup', async (req: Request, res: Response) => {
  try {
    const { chainId, remoteConfigs } = req.body;

    const nodeId = await nodeSupervisor.handleRequest({
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
});

// Step 3: Start the chain from customer connector
// Basic implementation very close to real-world usage:
app.put('/chain/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { chainId, data } = req.body;
    if (!chainId) {
      res.status(400).json({ error: 'Chain ID is required' });
      return;
    }
    await nodeSupervisor.startChain(chainId, data);
    res.status(200).json({ message: 'Chain started successfully' });
  } catch (err) {
    const error = err as Error;
    Logger.error({
      message: `Error starting chain: ${error.message}`,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Step 4: Automatically invoked by the remoteService callback to run a node in the chain using a given service ID for a specific chain ID
// Basic implementation very close to real-world usage:
app.put('/node/run', async (req: Request, res: Response) => {
  try {
    const { targetId, chainId, data } = req.body;
    Logger.info({
      message: `Received data for node hosting target ${targetId}`,
    });

    const node = nodeSupervisor.getNodesByServiceAndChain(targetId, chainId);
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
    await nodeSupervisor.handleRequest({
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
});

// Initialization of the node supervisor
// Example function:
export async function initializeNodeSupervisor(): Promise<void> {
  // Required broadcast setup callback
  // Example function:
  nodeSupervisor.setBroadcastSetupCallback(
    async (message: BrodcastMessage): Promise<void> => {
      Logger.info({ message: JSON.stringify(message, null, 2) });
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
        const address: string | undefined = serviceConnectorMap.get(targetId);
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

  // Required remote service callback
  nodeSupervisor.setRemoteServiceCallback(async (payload: CallbackPayload) => {
    try {
      if (!payload.chainId) {
        throw new Error('payload.chainId is undefined');
      }

      const nextConnectorUrl = process.env.NEXT_CONNECTOR;
      if (!nextConnectorUrl) {
        throw new Error('NEXT_CONNECTOR environment variable is not set');
      }

      const url = new URL(path.posix.join(nextConnectorUrl, '/node/run'));

      await axios.post(url.href, {
        chainId: payload.chainId,
        targetId: payload.targetId,
        data: payload.data,
      });

      Logger.info({
        message: `Data sent to next connector: ${nextConnectorUrl}`,
      });
    } catch (error) {
      Logger.error({
        message: `Error sending data to next connector: ${(error as Error).message}`,
      });
    }
  });
  try {
    if (!connectorUid) {
      throw new Error('connectorUid is not defined');
    }
    nodeSupervisor.setUid(connectorUid);
  } catch (error) {
    Logger.error({
      message: `Failed to set node supervisor UID: ${(error as Error).message}`,
    });
    throw error;
  }
}

export async function startServer(): Promise<void> {
  await initializeNodeSupervisor();
  app.listen(port, () => {
    Logger.info({
      message: `Test connector server running on http://localhost:${port}`,
    });
  });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();
