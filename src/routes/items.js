const express = require('express');
const { createItemService } = require('../services/itemService');
const repository = require('../repositories/itemRepository');

function buildRouter(service = createItemService(repository)) {
  const router = express.Router();

  router.post('/', async (req, res) => {
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
