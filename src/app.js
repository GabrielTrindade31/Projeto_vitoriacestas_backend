const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const buildItemRouter = require('./routes/items');
const buildSupplierRouter = require('./routes/suppliers');
const buildAuthRouter = require('./routes/auth');
const buildCoreDataRouter = require('./routes/coreData');
const { rateLimit } = require('./middlewares/authentication');

function createApp({ itemRouter, supplierRouter, authRouter, coreDataRouter } = {}) {
  const app = express();
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));

  const resolvedItemRouter = itemRouter || buildItemRouter();
  const resolvedSupplierRouter = supplierRouter || buildSupplierRouter();
  const resolvedAuthRouter = authRouter || buildAuthRouter();
  const resolvedCoreDataRouter = coreDataRouter || buildCoreDataRouter();

  app.use(cors());
  app.use(express.json());
  app.use(rateLimit());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  ['/api/items', '/api/products', '/items', '/products'].forEach((path) => {
    app.use(path, resolvedItemRouter);
  });
  app.use('/api/suppliers', resolvedSupplierRouter);
  app.use('/api/auth', resolvedAuthRouter);
  app.use('/api', resolvedCoreDataRouter);

  app.get('/docs/swagger.json', (_, res) => {
    res.type('application/json').send(swaggerDocument);
  });

  app.use(
    '/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      explorer: true,
      swaggerOptions: { url: '/docs/swagger.json' },
    })
  );

  app.get('/health', (_, res) => res.json({ status: 'ok' }));

  return app;
}

module.exports = createApp;
