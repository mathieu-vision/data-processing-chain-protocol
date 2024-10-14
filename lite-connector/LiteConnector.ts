import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { NodeSupervisor } from 'dpcp-library';
import { CallbackPayload, NodeSignal, PipelineData } from 'dpcp-library';
import { Logger } from './libs/Logger';
import path from 'path';

dotenv.config({ path: '.connector.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const nodeSupervisor = NodeSupervisor.retrieveService();

// Step 1: Chain creation should be initiated from a customer connector
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
app.post('/node/setup', async (req: Request, res: Response) => {
  try {
    const { chainId, remoteConfigs } = req.body;
    const nodeId = await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SETUP,
      chain: {
        id: chainId,
        config: remoteConfigs,
      },
    });
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
app.put('/node/run', async (req: Request, res: Response) => {
  try {
    const { targetId, chainId, data } = req.body;
    Logger.info({
      message: `Received data for node hosting target ${targetId}`,
    });

    const nodeId = nodeSupervisor.getNodesByServiceAndChain(targetId, chainId);

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
      message: `Error processing received data ${error.message}`,
    });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function initializeNodeSupervisor(): Promise<void> {
  nodeSupervisor.setBroadcastSetupCallback(
    async (message: any): Promise<void> => {
      Logger.info({ message: JSON.stringify(message, null, 2) });
    },
  );

  nodeSupervisor.setRemoteServiceCallback(async (payload: CallbackPayload) => {
    try {
      const nextConnectorUrl = process.env.NEXT_CONNECTOR;
      if (!nextConnectorUrl) {
        throw new Error('NEXT_CONNECTOR environment variable is not set');
      }

      const url = new URL(path.posix.join(nextConnectorUrl, '/node/run'));

      await axios.post(url.href, {
        chainId: '...', // todo
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
  nodeSupervisor.setUid('test-connector');
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
