const fs = require('fs/promises');
const path = require('path');
const mime = require('mime-types');
const { uploadImageToBlob, isBlobConfigured } = require('../services/blobStorage');

const DEFAULT_TTL_SECONDS = Number(process.env.IMAGE_CACHE_TTL_SECONDS || 1800);
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']);

function isHttpUrl(candidate) {
  return typeof candidate === 'string' && /^https?:\/\//i.test(candidate);
}

function isDataUrl(candidate) {
  return typeof candidate === 'string' && /^data:/i.test(candidate);
}

function parseDataUrl(value) {
  const [header, payload] = value.split(',', 2);
  const mimeMatch = header.match(/^data:([^;]+);/i);

  return {
    contentType: mimeMatch ? mimeMatch[1] : 'application/octet-stream',
    buffer: Buffer.from(payload || '', 'base64'),
  };
}

function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value && typeof value === 'object' && value.type === 'Buffer' && Array.isArray(value.data)) {
    return Buffer.from(value.data);
  }
  if (typeof value === 'string') return Buffer.from(value, 'base64');
  return null;
}

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
        const hydrated = typeof cached === 'string' ? cached : cached;
        const contentType = hydrated.contentType || mime.lookup(ext) || 'application/octet-stream';
        const dataCandidate =
          hydrated?.data || hydrated?.buffer || (isHttpUrl(hydrated) || isDataUrl(hydrated) ? null : hydrated);
        const buffer = toBuffer(dataCandidate);

        if (buffer) {
          res.set('Content-Type', contentType);
          return res.send(buffer);
        }

        // Redirect when the cached value is an absolute URL
        if (isHttpUrl(hydrated?.downloadUrl || hydrated?.url || hydrated)) {
          return res.redirect(hydrated.downloadUrl || hydrated.url || hydrated);
        }

        // Decode data URL values transparently
        if (isDataUrl(hydrated?.url || hydrated)) {
          const { contentType: hydratedContentType, buffer } = parseDataUrl(hydrated.url || hydrated);
          res.set('Content-Type', hydratedContentType);
          return res.send(buffer);
        }
      }
    } catch (error) {
      console.error('Erro ao tentar ler imagem do cache', error);
    }

    try {
      const absolutePath = path.join(rootFolder, relativePath);
      const buffer = await fs.readFile(absolutePath);
      const contentType = mime.lookup(absolutePath) || 'application/octet-stream';
      let cachePayload;

      if (isBlobConfigured()) {
        try {
          const blob = await uploadImageToBlob(relativePath, buffer, contentType);
          if (blob?.url) {
            cachePayload = { url: blob.url, contentType };
          }
        } catch (error) {
          console.error('Erro ao salvar imagem no Blob', error);
        }
      }

      if (!cachePayload) {
        cachePayload = { contentType };
      }

      // Always keep a memory-friendly payload in Redis so the next request
      // is served directly from cache even when Blob is enabled
      cachePayload.data = buffer.toString('base64');

      try {
        await redis.set(cacheKey, cachePayload, { ex: ttlSeconds });
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
