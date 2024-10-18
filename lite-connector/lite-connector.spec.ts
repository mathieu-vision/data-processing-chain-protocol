import { expect } from 'chai';
import request from 'supertest';
import { LiteConnector } from './LiteConnector.0';

describe('LiteConnector', () => {
  let connector1: LiteConnector;
  let connector2: LiteConnector;
  const connector1Port = 3001;
  const connector2Port = 3002;

  before(async () => {
    connector1 = new LiteConnector(connector1Port, 'connector1');
    connector2 = new LiteConnector(connector2Port, 'connector2');

    await connector1.startServer();
    await connector2.startServer();
  });

  after(async () => {
    await connector1.stopServer();
    await connector2.stopServer();
  });

  describe('POST /configure-service-connector', () => {
    it('should add a new service-connector mapping', async () => {
      const response = await request(connector1.getApp())
        .post('/configure-service-connector')
        .send({
          targetUID: 'service1',
          connectorURI: `http://localhost:${connector2Port}`,
        });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal(
        'Service-connector mapping updated successfully',
      );
    });

    it('should return an error for invalid connectorURI', async () => {
      const response = await request(connector1.getApp())
        .post('/configure-service-connector')
        .send({
          targetUID: 'invalidService',
          connectorURI: 'invalid-uri',
        });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Invalid connectorURI');
    });
  });

  describe('POST /chain/create', () => {
    it('should create a new chain', async () => {
      const chainConfig = [
        { services: ['service1'], location: 'local' },
        { services: ['service2'], location: 'remote' },
      ];

      const response = await request(connector1.getApp())
        .post('/chain/create')
        .send({ chainConfig });

      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('chainId');
    });

    it('should return an error when chain configuration is missing', async () => {
      const response = await request(connector1.getApp())
        .post('/chain/create')
        .send({});

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Chain configuration is required');
    });
  });

  describe('PUT /chain/start', () => {
    let chainId: string;

    before(async () => {
      const chainConfig = [
        { services: ['service1'], location: 'local' },
        { services: ['service2'], location: 'remote' },
      ];
      const createResponse = await request(connector1.getApp())
        .post('/chain/create')
        .send({ chainConfig });
      chainId = createResponse.body.chainId;
    });

    it('should start a chain', async () => {
      const response = await request(connector1.getApp())
        .put('/chain/start')
        .send({ chainId, data: { input: 'test data' } });

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Chain started successfully');
    });

    it('should return an error when chain ID is missing', async () => {
      const response = await request(connector1.getApp())
        .put('/chain/start')
        .send({ data: { input: 'test data' } });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('Chain ID is required');
    });
  });

  describe('Full chain flow', () => {
    it('should process data through the entire chain', async () => {
      await request(connector1.getApp())
        .post('/configure-service-connector')
        .send({
          targetUID: 'service2',
          connectorURI: `http://localhost:${connector2Port}`,
        });

      const chainConfig = [
        { services: ['service1'], location: 'local' },
        { services: ['service2'], location: 'remote' },
      ];
      const createResponse = await request(connector1.getApp())
        .post('/chain/create')
        .send({ chainConfig });
      const chainId = createResponse.body.chainId;

      const startResponse = await request(connector1.getApp())
        .put('/chain/start')
        .send({ chainId, data: { input: 'test data' } });

      expect(startResponse.status).to.equal(200);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Todo: check logs to verify the chain execution
    });
  });
});
