const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const multer = require('multer');

const buildItemRouter = require('./routes/items');
const buildSupplierRouter = require('./routes/suppliers');
const buildAuthRouter = require('./routes/auth');
const buildCoreDataRouter = require('./routes/coreData');
const { rateLimit } = require('./middlewares/authentication');

function createApp({ itemRouter, supplierRouter, authRouter, coreDataRouter } = {}) {
  const app = express();
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
  const uploadRaw = express.raw({
    type: () => true,
    limit: '10mb',
  });

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
  ['/api/suppliers', '/suppliers'].forEach((path) => {
    app.use(path, resolvedSupplierRouter);
  });
  ['/api/auth', '/auth'].forEach((path) => {
    app.use(path, resolvedAuthRouter);
  });
  ['/api', '/'].forEach((path) => {
    app.use(path, resolvedCoreDataRouter);
  });

  app.post(['/api/upload', '/upload'], uploadRaw, (req, res) => {
    const body = req.body;
    const hasBody = Buffer.isBuffer(body) ? body.length > 0 : Boolean(body);

    if (!hasBody) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    const size = Buffer.isBuffer(body) ? body.length : Buffer.byteLength(String(body));
    const payloadAsString = Buffer.isBuffer(body) ? body.toString('latin1') : String(body);
    const filenameMatch = payloadAsString.match(/filename="([^"]+)"/i);
    const fallbackFilename = req.headers['x-filename'];
    const filename = (filenameMatch && filenameMatch[1]) || (fallbackFilename ? String(fallbackFilename) : null);

    return res.status(201).json({
      message: 'Upload recebido',
      filename,
      mimetype: req.headers['content-type'],
      size,
    });
  });

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
