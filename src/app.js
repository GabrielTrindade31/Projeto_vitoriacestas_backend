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

function withTimeout(promise, ms, onTimeoutValue = null, label = 'operation') {
  let timeoutId;

  const timer = new Promise((resolve) => {
    timeoutId = setTimeout(() => {
      console.warn(`${label} timed out after ${ms}ms`);
      resolve(onTimeoutValue);
    }, ms);
  });

  return Promise.race([promise.finally(() => clearTimeout(timeoutId)), timer]);
}

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
  const blobUploadTimeoutMs = Number(process.env.BLOB_UPLOAD_TIMEOUT_MS || 30000);
  const cacheWriteTimeoutMs = Number(process.env.REDIS_CACHE_WRITE_TIMEOUT_MS || 5000);

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

  const withTimeout = (promise, timeoutMs, onTimeoutValue = null) => {
    let timeoutHandle;
    const timer = new Promise((resolve, reject) => {
      timeoutHandle = setTimeout(() => {
        const error = new Error('Operation timed out');
        error.code = 'TIMEOUT';
        reject(error);
      }, timeoutMs);
    });

    return Promise.race([promise.finally(() => clearTimeout(timeoutHandle)), timer]).catch((error) => {
      if (error && error.code === 'TIMEOUT') {
        return onTimeoutValue;
      }
      throw error;
    });
  };

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
      let blobTimedOut = false;
      if (blobConfigured) {
        try {
          const blob = await withTimeout(
            uploadImageToBlob(relativePath, file.buffer, contentType),
            Number(process.env.BLOB_UPLOAD_TIMEOUT_MS || 10000),
            'timeout'
          );

          if (blob === 'timeout') {
            blobTimedOut = true;
          } else {
            blobUrl = blob?.url || null;
          }
        } catch (error) {
          console.error('Erro ao salvar imagem no Blob', error);
        }
      }

      const cachePayload = {
        contentType,
        data: file.buffer.toString('base64'),
        publicUrl: `/${relativePath}`,
      };

      const cacheKey = `image:public:${relativePath}`;

      let cacheTimedOut = false;
      try {
        const cacheResult = await withTimeout(
          redis.set(cacheKey, cachePayload, { ex: DEFAULT_TTL_SECONDS }),
          Number(process.env.REDIS_CACHE_TIMEOUT_MS || 5000),
          'timeout'
        );

        if (cacheResult === 'timeout') {
          cacheTimedOut = true;
        }
      } catch (error) {
        console.error('Erro ao salvar imagem no cache', error);
      }

      const publicUrl = `/${relativePath}`;
      const blobConfigured = isBlobConfigured();

      if (blobConfigured) {
        (async () => {
          try {
            const blob = await withTimeout(
              uploadImageToBlob(relativePath, file.buffer, contentType),
              blobUploadTimeoutMs,
              null,
              'blob upload'
            );

            if (blob?.url) {
              const enrichedCache = {
                ...cachePayload,
                url: blob.url,
                downloadUrl: blob.downloadUrl,
              };

              await redis.set(cacheKey, enrichedCache, { ex: DEFAULT_TTL_SECONDS });
            }
          } catch (error) {
            console.error('Erro ao salvar imagem no Blob', error);
          }
        })();
      }

      return res.status(201).json({
        message: 'Upload salvo com sucesso',
        filename,
        mimetype: contentType,
        size: file.size,
        url: publicUrl,
        publicUrl,
        cacheKey,
        cacheTtlSeconds: DEFAULT_TTL_SECONDS,
        blobConfigured,
        blobTimedOut,
        cacheTimedOut,
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
