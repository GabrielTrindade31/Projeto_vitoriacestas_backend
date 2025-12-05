const fs = require('fs/promises');
const path = require('path');
const mime = require('mime-types');

const DEFAULT_TTL_SECONDS = Number(process.env.IMAGE_CACHE_TTL_SECONDS || 1800);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

function createImageCacheMiddleware({ redis, ttlSeconds = DEFAULT_TTL_SECONDS, basePath } = {}) {
  if (!redis) {
    throw new Error('Redis client is required to cache images');
  }

  const rootFolder = basePath || path.join(__dirname, '..', '..', 'public');

  return async function imageCacheMiddleware(req, res, next) {
    if (req.method !== 'GET') return next();

    const ext = path.extname(req.path || '').toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) return next();

    const relativePath = req.path.startsWith('/') ? req.path.slice(1) : req.path;
    const cacheKey = `image:public:${relativePath}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const hydrated = typeof cached === 'string' ? { data: cached } : cached;
        if (hydrated.data) {
          const contentType = hydrated.contentType || mime.lookup(ext) || 'application/octet-stream';
          res.set('Content-Type', contentType);
          return res.send(Buffer.from(hydrated.data, 'base64'));
        }
      }
    } catch (error) {
      console.error('Erro ao tentar ler imagem do cache', error);
    }

    try {
      const absolutePath = path.join(rootFolder, relativePath);
      const buffer = await fs.readFile(absolutePath);
      const contentType = mime.lookup(absolutePath) || 'application/octet-stream';

      try {
        await redis.set(cacheKey, { contentType, data: buffer.toString('base64') }, { ex: ttlSeconds });
      } catch (error) {
        console.error('Erro ao salvar imagem no cache', error);
      }

      res.set('Content-Type', contentType);
      return res.send(buffer);
    } catch (error) {
      return next();
    }
  };
}

module.exports = { createImageCacheMiddleware, DEFAULT_TTL_SECONDS };
