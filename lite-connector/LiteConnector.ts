import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
import { NodeSupervisor } from 'dpcp-library';
import { CallbackPayload, NodeSignal, PipelineData } from 'dpcp-library';
import { Logger } from './libs/Logger';

dotenv.config({ path: '.connector.env' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const nodeSupervisor = NodeSupervisor.retrieveService();

app.post('/receive', async (req: Request, res: Response) => {
  try {
    const { targetId, data } = req.body;
    Logger.info({
      message: `Received data for node hosting target ${targetId}`,
    });

    // todo: search node
    const nodeId = 0;

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

app.get('/send/:nodeId', async (req: Request, res: Response) => {
  try {
    const nodeId = req.params.nodeId;
    Logger.info({ message: `Sending data for node ${nodeId}` });

    const result = await nodeSupervisor.handleRequest({
      signal: NodeSignal.NODE_SEND_DATA,
      id: nodeId,
    });

    res.status(200).json({ data: result });
  } catch (err) {
    const error: Error = err as Error;

    Logger.error({ message: `Error sending data ${error.message}` });
    res.status(500).json({ error: 'Internal server error' });
  }
});

export async function initializeNodeSupervisor(): Promise<void> {
  nodeSupervisor.setRemoteServiceCallback(async (payload: CallbackPayload) => {
    try {
      const nextConnectorUrl = process.env.NEXT_CONNECTOR;
      if (!nextConnectorUrl) {
        throw new Error('NEXT_CONNECTOR environment variable is not set');
      }

      await axios.post(nextConnectorUrl, {
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
