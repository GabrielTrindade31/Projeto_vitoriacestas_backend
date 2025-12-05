let putPromise;

function isBlobConfigured() {
  return typeof process.env.BLOB_READ_WRITE_TOKEN === 'string' && process.env.BLOB_READ_WRITE_TOKEN.trim() !== '';
}

async function getPut() {
  if (!putPromise) {
    putPromise = import('@vercel/blob').then((mod) => mod.put);
  }
  return putPromise;
}

async function uploadImageToBlob(relativePath, buffer, contentType) {
  if (!isBlobConfigured()) return null;

  const normalizedKey = relativePath.replace(/\\/g, '/');
  const objectKey = normalizedKey.startsWith('/') ? normalizedKey.slice(1) : normalizedKey;
  const put = await getPut();

  return put(objectKey, buffer, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

module.exports = {
  isBlobConfigured,
  uploadImageToBlob,
};
