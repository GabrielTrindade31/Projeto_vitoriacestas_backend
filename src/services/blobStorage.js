let putPromise;

function getBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (typeof token !== 'string' || token.trim() === '') {
    return null;
  }
  return token.trim();
}

function isBlobConfigured() {
  return Boolean(getBlobToken());
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
    token: getBlobToken(),
  });
}

module.exports = {
  isBlobConfigured,
  uploadImageToBlob,
  getBlobToken,
};
