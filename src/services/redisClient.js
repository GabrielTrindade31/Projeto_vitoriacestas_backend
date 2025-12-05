const { Redis } = require('@upstash/redis');

let cachedClient;

function getRedisClient() {
  if (!cachedClient) {
    cachedClient = Redis.fromEnv();
  }
  return cachedClient;
}

module.exports = { getRedisClient };
