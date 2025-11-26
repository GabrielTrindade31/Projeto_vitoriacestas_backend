const express = require('express');
const Joi = require('joi');
const { login, refreshTokens } = require('../services/authService');

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

function buildRouter(authService = { login, refreshTokens }) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const result = await authService.login(value.email, value.password);
      return res.status(200).json(result);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || 'Erro ao autenticar' });
    }
  });

  router.post('/refresh', async (req, res) => {
    const { error, value } = refreshSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    try {
      const tokens = await authService.refreshTokens(value.refreshToken);
      return res.status(200).json(tokens);
    } catch (err) {
      const status = err.status || 500;
      return res.status(status).json({ message: err.message || 'Erro ao renovar token' });
    }
  });

  return router;
}

module.exports = buildRouter;
