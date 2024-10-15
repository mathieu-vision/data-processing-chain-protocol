import { LiteConnector } from './LiteConnector';
import dotenv from 'dotenv';
import { Logger } from './libs/Logger';

dotenv.config({ path: '.connector.env' });
const port = parseInt(process.env.PORT || '3000', 10);
const connectorUid = process.env.CONNECTOR_UID || 'default';
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
