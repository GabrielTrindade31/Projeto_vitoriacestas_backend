const express = require('express');
const { createSupplierService } = require('../services/supplierService');
const repository = require('../repositories/supplierRepository');
const { authenticate, authorizeRoles } = require('../middlewares/authentication');

function buildRouter(service = createSupplierService(repository), auth = { authenticate, authorizeRoles }) {
  const router = express.Router();

  router.get('/', auth.authenticate, auth.authorizeRoles(['Admin', 'Gestor', 'Operador']), async (req, res) => {
    try {
      const suppliers = await service.listSuppliers();
      return res.status(200).json({ suppliers });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/', auth.authenticate, auth.authorizeRoles(['Admin']), async (req, res) => {
    try {
      const created = await service.createSupplier(req.body);
      return res.status(201).json({ message: 'Fornecedor cadastrado com sucesso', supplier: created });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  return router;
}

module.exports = buildRouter;
