const express = require('express');
const { createItemService } = require('../services/itemService');
const repository = require('../repositories/itemRepository');
const { authenticate, authorizeRoles } = require('../middlewares/authentication');

function buildRouter(service = createItemService(repository), auth = { authenticate, authorizeRoles }) {
  const router = express.Router();
  const readerRoles = ['Admin', 'Gestor', 'Operador'];
  const writerRoles = ['Admin', 'Gestor'];

  router.get('/', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const items = await service.listItems();
      return res.status(200).json({ items });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/images', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const images = await service.listItemImages();
      return res.status(200).json({ images });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/search', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const term = req.query.q;
      const items = await service.searchItems(term);
      return res.status(200).json({ items });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/:id', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

      const item = await service.getItemById(id);
      return res.status(200).json({ item });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const created = await service.createItem(req.body);
      return res.status(201).json({ message: 'Item cadastrado com sucesso', item: created });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put('/:id', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

      const updated = await service.updateItem(id, req.body);
      return res.status(200).json({ message: 'Item atualizado com sucesso', item: updated });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  return router;
}

module.exports = buildRouter;
