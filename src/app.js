const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const buildItemRouter = require('./routes/items');
const buildSupplierRouter = require('./routes/suppliers');
const buildAuthRouter = require('./routes/auth');
const { rateLimit } = require('./middlewares/authentication');

function createApp({ itemRouter, supplierRouter, authRouter } = {}) {
  const app = express();
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));

  app.use(cors());
  app.use(express.json());
  app.use(rateLimit());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.use('/api/items', itemRouter || buildItemRouter());
  app.use('/api/suppliers', supplierRouter || buildSupplierRouter());
  app.use('/api/auth', authRouter || buildAuthRouter());

  app.get('/docs/swagger.json', (_, res) => {
    res.type('application/json').send(swaggerDocument);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(null, {
      swaggerOptions: { url: '/docs/swagger.json' },
    })
  );

  app.get('/health', (_, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = createApp;
