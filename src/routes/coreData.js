const express = require('express');
const { createCoreDataService } = require('../services/coreDataService');
const repository = require('../repositories/coreDataRepository');
const { authenticate, authorizeRoles } = require('../middlewares/authentication');

function buildRouter(service = createCoreDataService(repository), auth = { authenticate, authorizeRoles }) {
  const router = express.Router();
  const readerRoles = ['Admin', 'Gestor', 'Operador'];
  const writerRoles = ['Admin', 'Gestor'];

  router.get('/addresses/search', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const addresses = await service.searchAddresses(req.query.q);
      return res.status(200).json({ addresses });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

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

  router.put('/addresses/:id', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const address = await service.updateAddress(req.params.id, req.body);
      return res.status(200).json({ message: 'Endereço atualizado com sucesso', address });
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

  router.get('/customers/search', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const customers = await service.searchCustomers(req.query.q);
      return res.status(200).json({ customers });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put('/customers/:id', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const customer = await service.updateCustomer(req.params.id, req.body);
      return res.status(200).json({ message: 'Cliente atualizado com sucesso', customer });
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

  router.get('/phones/search', auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const phones = await service.searchPhones(req.query.q);
      return res.status(200).json({ phones });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put('/phones/:id', auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const phone = await service.updatePhone(req.params.id, req.body);
      return res.status(200).json({ message: 'Telefone atualizado com sucesso', phone });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/raw-materials', '/materials'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const materials = await service.listMaterials();
      return res.status(200).json({ materials });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/raw-materials', '/materials'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const material = await service.createMaterial(req.body);
      return res.status(201).json({ message: 'Matéria-prima cadastrada com sucesso', material });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/raw-materials/search', '/materials/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const materials = await service.searchMaterials(req.query.q);
      return res.status(200).json({ materials });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/raw-materials/:id', '/materials/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const material = await service.updateMaterial(req.params.id, req.body);
      return res.status(200).json({ message: 'Matéria-prima atualizada com sucesso', material });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/material-deliveries', '/entregas-material'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const deliveries = await service.listMaterialDeliveries();
      return res.status(200).json({ deliveries });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/material-deliveries', '/entregas-material'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const delivery = await service.createMaterialDelivery(req.body);
      return res.status(201).json({ message: 'Entrega de material registrada com sucesso', delivery });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/material-deliveries/search', '/entregas-material/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const deliveries = await service.searchMaterialDeliveries(req.query.q);
      return res.status(200).json({ deliveries });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/material-deliveries/:id', '/entregas-material/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const delivery = await service.updateMaterialDelivery(req.params.id, req.body);
      return res.status(200).json({ message: 'Entrega de material atualizada com sucesso', delivery });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/manufacturing', '/manufaturas'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const manufacturing = await service.listManufacturing();
      return res.status(200).json({ manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/manufacturing', '/manufaturas'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const manufacturing = await service.createManufacturing(req.body);
      return res.status(201).json({ message: 'Relação de manufatura registrada com sucesso', manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/manufacturing/search', '/manufaturas/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const manufacturing = await service.searchManufacturing(req.query.q);
      return res.status(200).json({ manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/manufacturing/:id', '/manufaturas/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const manufacturing = await service.updateManufacturing(req.params.id, req.body);
      return res.status(200).json({ message: 'Relação de manufatura atualizada com sucesso', manufacturing });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/orders', '/pedidos'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const orders = await service.listOrders();
      return res.status(200).json({ orders });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/orders', '/pedidos'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const order = await service.createOrder(req.body);
      return res.status(201).json({ message: 'Pedido registrado com sucesso', order });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/orders/search', '/pedidos/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const orders = await service.searchOrders(req.query.q);
      return res.status(200).json({ orders });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/orders/:id', '/pedidos/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const order = await service.updateOrder(req.params.id, req.body);
      return res.status(200).json({ message: 'Pedido atualizado com sucesso', order });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/product-shipments', '/envios'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const shipments = await service.listShipments();
      return res.status(200).json({ shipments });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/product-shipments', '/envios'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const shipment = await service.createShipment(req.body);
      return res.status(201).json({ message: 'Envio registrado com sucesso', shipment });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/product-shipments/search', '/envios/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const shipments = await service.searchShipments(req.query.q);
      return res.status(200).json({ shipments });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/product-shipments/:id', '/envios/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const shipment = await service.updateShipment(req.params.id, req.body);
      return res.status(200).json({ message: 'Envio atualizado com sucesso', shipment });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/feedbacks', '/feedback'], auth.authenticate, auth.authorizeRoles(readerRoles), async (_req, res) => {
    try {
      const feedbacks = await service.listFeedbacks();
      return res.status(200).json({ feedbacks });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.post(['/feedbacks', '/feedback'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const feedback = await service.createFeedback(req.body);
      return res.status(201).json({ message: 'Feedback registrado com sucesso', feedback });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.get(['/feedbacks/search', '/feedback/search'], auth.authenticate, auth.authorizeRoles(readerRoles), async (req, res) => {
    try {
      const feedbacks = await service.searchFeedbacks(req.query.q);
      return res.status(200).json({ feedbacks });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  router.put(['/feedbacks/:id', '/feedback/:id'], auth.authenticate, auth.authorizeRoles(writerRoles), async (req, res) => {
    try {
      const feedback = await service.updateFeedback(req.params.id, req.body);
      return res.status(200).json({ message: 'Feedback atualizado com sucesso', feedback });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ message: error.message || 'Erro interno' });
    }
  });

  return router;
}

module.exports = buildRouter;
