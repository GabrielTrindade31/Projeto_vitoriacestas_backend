const store = new Map();

function save(userId, refreshToken) {
  const tokens = store.get(userId) || new Set();
  tokens.add(refreshToken);
  store.set(userId, tokens);
}

function exists(userId, refreshToken) {
  const tokens = store.get(userId);
  return tokens ? tokens.has(refreshToken) : false;
}

function replace(userId, oldToken, newToken) {
  const tokens = store.get(userId) || new Set();
  if (tokens.has(oldToken)) {
    tokens.delete(oldToken);
  }
  tokens.add(newToken);
  store.set(userId, tokens);
}

function revoke(userId) {
  store.delete(userId);
}

module.exports = { save, exists, replace, revoke };
