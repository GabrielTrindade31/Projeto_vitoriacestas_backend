const bcrypt = require('bcryptjs');

const defaultUsers = [
  {
    id: 1,
    name: 'Administrador',
    email: process.env.ADMIN_EMAIL || 'admin@vitoriacestas.com',
    passwordHash:
      process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10),
    role: 'Admin',
  },
  {
    id: 2,
    name: 'Gestor',
    email: process.env.MANAGER_EMAIL || 'gestor@vitoriacestas.com',
    passwordHash:
      process.env.MANAGER_PASSWORD_HASH || bcrypt.hashSync(process.env.MANAGER_PASSWORD || 'gestor123', 10),
    role: 'Gestor',
  },
  {
    id: 3,
    name: 'Operador',
    email: process.env.OPERATOR_EMAIL || 'operador@vitoriacestas.com',
    passwordHash:
      process.env.OPERATOR_PASSWORD_HASH || bcrypt.hashSync(process.env.OPERATOR_PASSWORD || 'operador123', 10),
    role: 'Operador',
  },
];

function findByEmail(email) {
  return defaultUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findById(id) {
  return defaultUsers.find((user) => user.id === id);
}

module.exports = { findByEmail, findById };
