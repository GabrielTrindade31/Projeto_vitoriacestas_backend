const jwt = require('jsonwebtoken');
const { ACCESS_SECRET } = require('../services/authService');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

function authorizeRoles(roles = []) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permissão negada' });
    }
    return next();
  };
}

function rateLimit({ windowMs = 15 * 60 * 1000, max = 200 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'global';
    const now = Date.now();
    const entry = hits.get(ip) || { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    hits.set(ip, entry);

    if (entry.count > max) {
      return res.status(429).json({ message: 'Muitas requisições. Tente novamente em breve.' });
    }

    return next();
  };
}

module.exports = { authenticate, authorizeRoles, rateLimit };
