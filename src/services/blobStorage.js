let putPromise;

function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
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
  });
}

module.exports = {
  isBlobConfigured,
  uploadImageToBlob,
};
