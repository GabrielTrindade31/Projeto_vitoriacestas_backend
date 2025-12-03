const express = require('express');
const { createCoreDataService } = require('../services/coreDataService');
const repository = require('../repositories/coreDataRepository');
const { authenticate, authorizeRoles } = require('../middlewares/authentication');

function buildRouter(service = createCoreDataService(repository), auth = { authenticate, authorizeRoles }) {
  const router = express.Router();
  const readerRoles = ['Admin', 'Gestor', 'Operador'];
  const writerRoles = ['Admin', 'Gestor'];

  router.get('/addresses', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const addresses = await service.listAddresses();
      return res.status(200).json({ addresses });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/addresses', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const address = await service.createAddress(req.body);
      return res.status(201).json({ message: 'Endereço cadastrado com sucesso', address });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/customers', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const customers = await service.listCustomers();
      return res.status(200).json({ customers });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/customers', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const customer = await service.createCustomer(req.body);
      return res.status(201).json({ message: 'Cliente cadastrado com sucesso', customer });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/phones', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const phones = await service.listPhones();
      return res.status(200).json({ phones });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/phones', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const phone = await service.createPhone(req.body);
      return res.status(201).json({ message: 'Telefone cadastrado com sucesso', phone });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/raw-materials', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const materials = await service.listMaterials();
      return res.status(200).json({ materials });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/raw-materials', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const material = await service.createMaterial(req.body);
      return res.status(201).json({ message: 'Matéria-prima cadastrada com sucesso', material });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/material-deliveries', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const deliveries = await service.listMaterialDeliveries();
      return res.status(200).json({ deliveries });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/material-deliveries', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const delivery = await service.createMaterialDelivery(req.body);
      return res.status(201).json({ message: 'Entrega de material registrada com sucesso', delivery });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/manufacturing', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const manufacturing = await service.listManufacturing();
      return res.status(200).json({ manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/manufacturing', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const manufacturing = await service.createManufacturing(req.body);
      return res.status(201).json({ message: 'Relação de manufatura registrada com sucesso', manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/orders', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const orders = await service.listOrders();
      return res.status(200).json({ orders });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/orders', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const order = await service.createOrder(req.body);
      return res.status(201).json({ message: 'Pedido registrado com sucesso', order });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/product-shipments', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const shipments = await service.listShipments();
      return res.status(200).json({ shipments });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/product-shipments', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const shipment = await service.createShipment(req.body);
      return res.status(201).json({ message: 'Envio registrado com sucesso', shipment });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get('/feedbacks', auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const feedbacks = await service.listFeedbacks();
      return res.status(200).json({ feedbacks });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post('/feedbacks', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const feedback = await service.createFeedback(req.body);
      return res.status(201).json({ message: 'Feedback registrado com sucesso', feedback });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  return router;
}

module.exports = buildRouter;
