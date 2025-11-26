const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findByEmail, findById } = require('../repositories/userRepository');
const tokenStore = require('./tokenStore');

const ACCESS_TOKEN_EXPIRATION = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const ACCESS_SECRET = process.env.JWT_SECRET || 'secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ACCESS_SECRET;

function buildPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

async function validateCredentials(email, password) {
  const user = findByEmail(email);
  if (!user) {
    const error = new Error('Credenciais inválidas');
    error.status = 401;
    throw error;
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    const error = new Error('Credenciais inválidas');
    error.status = 401;
    throw error;
  }

  return user;
}

function generateAccessToken(user) {
  return jwt.sign(buildPayload(user), ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
}

function generateRefreshToken(user) {
  return jwt.sign({ sub: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
}

async function login(email, password) {
  const user = await validateCredentials(email, password);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  tokenStore.save(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_EXPIRATION,
  };
}

function refreshTokens(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const isKnown = tokenStore.exists(decoded.sub, refreshToken);
    if (!isKnown) {
      const error = new Error('Refresh token inválido ou expirado');
      error.status = 401;
      throw error;
    }

    const user = findById(decoded.sub);
    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.status = 401;
      throw error;
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    tokenStore.replace(user.id, refreshToken, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    };
  } catch (error) {
    const authError = new Error('Refresh token inválido ou expirado');
    authError.status = 401;
    throw authError;
  }
}

module.exports = { login, refreshTokens, ACCESS_SECRET };
