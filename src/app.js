const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs/promises');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const multer = require('multer');

const buildItemRouter = require('./routes/items');
const buildSupplierRouter = require('./routes/suppliers');
const buildAuthRouter = require('./routes/auth');
const buildCoreDataRouter = require('./routes/coreData');
const { rateLimit } = require('./middlewares/authentication');
const { createImageCacheMiddleware, DEFAULT_TTL_SECONDS } = require('./middlewares/imageCache');
const { getRedisClient } = require('./services/redisClient');
const { uploadImageToBlob, isBlobConfigured } = require('./services/blobStorage');

function createApp({ itemRouter, supplierRouter, authRouter, coreDataRouter } = {}) {
  const app = express();
  const swaggerDocument = YAML.load(path.join(__dirname, '..', 'openapi.yaml'));
  const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  const resolvedItemRouter = itemRouter || buildItemRouter();
  const resolvedSupplierRouter = supplierRouter || buildSupplierRouter();
  const resolvedAuthRouter = authRouter || buildAuthRouter();
  const resolvedCoreDataRouter = coreDataRouter || buildCoreDataRouter();
  const redis = getRedisClient();

  app.use(cors());
  app.use(express.json());
  app.use(rateLimit());
  app.use(
    createImageCacheMiddleware({
      redis,
      basePath: path.join(__dirname, '..', 'public'),
    })
  );
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

  app.post(['/api/upload', '/upload'], uploadMemory.single('file'), async (req, res, next) => {
    try {
      const file = req.file;

      if (!file || !file.buffer || !file.originalname) {
        return res.status(400).json({ message: 'Nenhum arquivo enviado' });
      }

      const redis = getRedisClient();
      const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const fallbackFilename = req.headers['x-filename'];
      const safeOriginal = (fallbackFilename || file.originalname || 'upload')
        .replace(/[^\w.-]/g, '_')
        .replace(/_+/g, '_');
      const filename = `${Date.now()}-${safeOriginal}`;
      const relativePath = path.posix.join('uploads', filename);
      const absolutePath = path.join(uploadDir, filename);
      const contentType = file.mimetype || 'application/octet-stream';

      await fs.writeFile(absolutePath, file.buffer);

      const blobConfigured = isBlobConfigured();
      let blobUrl = null;
      if (blobConfigured) {
        try {
          const blob = await uploadImageToBlob(relativePath, file.buffer, contentType);
          blobUrl = blob?.url || null;
        } catch (error) {
          console.error('Erro ao salvar imagem no Blob', error);
        }
      }

      const cachePayload = {
        contentType,
        data: file.buffer.toString('base64'),
      };

      if (blobUrl) {
        cachePayload.url = blobUrl;
      }

      const cacheKey = `image:public:${relativePath}`;

      try {
        await redis.set(cacheKey, cachePayload, { ex: DEFAULT_TTL_SECONDS });
      } catch (error) {
        console.error('Erro ao salvar imagem no cache', error);
      }

      const publicUrl = `/${relativePath}`;

      return res.status(201).json({
        message: 'Upload salvo com sucesso',
        filename,
        mimetype: contentType,
        size: file.size,
        url: blobUrl || publicUrl,
        blobUrl,
        publicUrl,
        cacheKey,
        cacheTtlSeconds: DEFAULT_TTL_SECONDS,
        blobConfigured,
      });
    } catch (error) {
      console.error('Erro ao processar upload', error);
      return next(error);
    }
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

  // Captura erros de upload (ex.: limites do Multer) e qualquer exceção não tratada,
  // evitando que requisições fiquem penduradas no frontend.
  app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Erro ao processar upload', code: err.code });
    }

    console.error('Erro inesperado na aplicação', err);
    return res.status(500).json({ message: 'Erro interno ao processar a requisição' });
  });

  return app;
}

module.exports = createApp;
