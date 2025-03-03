import { LiteConnector } from './LiteConnector';
import { LiteConnector as LiteConnector0 } from './LiteConnector.0';
import { LiteConnector as ParallelNodesConnector } from './LiteConnector.1';
import dotenv from 'dotenv';
import { Logger } from './libs/Logger';

dotenv.config({ path: '.connector.env' });
function getArgValue(argName: string): string | undefined {
  const index = process.argv.indexOf(argName);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

const argPort = getArgValue('--port');
const argType = getArgValue('--type');
const argConnectorUid = getArgValue('--connector_uid');
const argBaseHost = getArgValue('--base_host') || 'localhost';

const port = argPort
  ? parseInt(argPort, 10)
  : parseInt(process.env.PORT || '3000', 10);
const connectorUid = argConnectorUid || process.env.CONNECTOR_UID || 'default';

process.env.BASE_URI = `http://${argBaseHost}:${port}`;
Logger.info({
  message: `Setting BASE_URI to: ${process.env.BASE_URI}`,
});

let connector;
const caseSwitch = argType ? parseInt(argType, 10) : 0;

switch (caseSwitch) {
  case 0:
    Logger.info({
      message: 'Starting type 0 connector',
    });
    connector = new LiteConnector0(port, connectorUid);
    break;
  case 1:
    Logger.info({
      message: 'Starting type 1 connector',
    });
    connector = new ParallelNodesConnector(port, connectorUid);
    break;
  default:
    Logger.info({
      message: 'Starting default type connector',
    });
    connector = new LiteConnector(port, connectorUid);
    break;
}
if (connector) {
  connector
    .startServer()
    .then(() => {
      Logger.info({
        message: `LiteConnector server started on port ${port}`,
      });
      Logger.info({
        message: `Connector UID: ${connectorUid}`,
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
}
