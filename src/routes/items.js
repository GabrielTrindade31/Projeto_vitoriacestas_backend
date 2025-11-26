const express = require('express');
const { createItemService } = require('../services/itemService');
const repository = require('../repositories/itemRepository');
const { authenticate, authorizeRoles } = require('../middlewares/authentication');

function buildRouter(service = createItemService(repository), auth = { authenticate, authorizeRoles }) {
  const router = express.Router();

  router.get('/', auth.authenticate, auth.authorizeRoles(['Admin', 'Gestor', 'Operador']), async (req, res) => {
    try {
      const items = await service.listItems();
      return res.status(200).json({ items });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/', auth.authenticate, auth.authorizeRoles(['Admin', 'Gestor']), async (req, res) => {
    try {
      const created = await service.createItem(req.body);
      return res.status(201).json({ message: 'Item cadastrado com sucesso', item: created });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  return router;
}

module.exports = buildRouter;
