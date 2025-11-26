const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required(),
  password: Joi.string().required(),
});

function buildRouter() {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@vitoriacestas.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (value.email !== adminEmail || value.password !== adminPassword) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ email: adminEmail, role: 'admin' }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '2h',
    });

    return res.status(200).json({ token });
  });

  return router;
}

module.exports = buildRouter;
