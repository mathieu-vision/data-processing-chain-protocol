import { LiteConnector } from './LiteConnector';
import dotenv from 'dotenv';
import { Logger } from './libs/Logger';

dotenv.config({ path: '.connector.env' });

function getArgValue(argName: string): string | undefined {
  const index = process.argv.indexOf(argName);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

const argPort = getArgValue('--port');
const argConnectorUid = getArgValue('--connector_uid');

const port = argPort
  ? parseInt(argPort, 10)
  : parseInt(process.env.PORT || '3000', 10);
const connectorUid = argConnectorUid || process.env.CONNECTOR_UID || 'default';

const connector = new LiteConnector(port, connectorUid);

connector
  .startServer()
  .then(() => {
    Logger.info({
      message: `LiteConnector server started on port ${connector.getPort()}`,
    });
    Logger.info({
      message: `Connector UID: ${connector.getConnectorUid()}`,
    });
  })
  .catch((error) => {
    Logger.error({
      message: `Failed to start LiteConnector server: ${error}`,
    });
    process.exit(1);
  });

process.on('SIGINT', async () => {
  Logger.info({
    message: 'Shutting down LiteConnector server...',
  });
  await connector.stopServer();
  Logger.info({
    message: 'LiteConnector server stopped',
  });
  process.exit(0);
});
