const Joi = require('joi');

function normalizeDate(input) {
  if (input === undefined || input === null || input === '') return null;

  if (input instanceof Date) return input.toISOString();

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const parts = trimmed.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts.map((p) => Number(p));
      if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
        const parsed = new Date(year, month - 1, day);
        if (!Number.isNaN(parsed.valueOf())) {
          return parsed.toISOString();
        }
      }
    }

    return trimmed;
  }

  return input;
}

function normalizeId(payload, camelKey, snakeKey) {
  const raw = payload[camelKey] ?? payload[snakeKey];
  if (raw === undefined || raw === null || raw === '') return null;
  const num = Number(raw);
  return Number.isNaN(num) ? null : num;
}

function buildSchemas() {
  return {
    address: Joi.object({
      rua: Joi.string().trim().required(),
      cep: Joi.string().trim().required(),
      numero: Joi.string().trim().required(),
    }),
    customer: Joi.object({
      cnpj: Joi.string().trim().allow(null, ''),
      cpf: Joi.string().trim().allow(null, ''),
      nome: Joi.string().trim().required(),
      email: Joi.string().trim().email({ tlds: false }).allow(null, ''),
      dataNascimento: Joi.date().iso().required(),
      enderecoId: Joi.number().integer().required(),
    }).custom((value, helpers) => {
      if (!value.cpf && !value.cnpj) {
        return helpers.error('any.custom', { message: 'CPF ou CNPJ deve ser informado' });
      }
      return value;
    }, 'Documento obrigatório'),
    material: Joi.object({
      nome: Joi.string().trim().required(),
      tipo: Joi.string().trim().allow(null, ''),
      custo: Joi.number().precision(2).min(0).allow(null),
      dataValidade: Joi.date().iso().allow(null),
      descricao: Joi.string().trim().allow(null, ''),
      tamanho: Joi.string().trim().allow(null, ''),
      material: Joi.string().trim().allow(null, ''),
      acessorio: Joi.string().trim().allow(null, ''),
      imagemUrl: Joi.string().trim().uri({ allowRelative: true }).allow(null, ''),
    }),
    manufacturing: Joi.object({
      produtoId: Joi.number().integer().required(),
      materialId: Joi.number().integer().required(),
      quantidadeMaterial: Joi.number().integer().min(0).default(0),
    }),
    materialDelivery: Joi.object({
      materialId: Joi.number().integer().required(),
      fornecedorId: Joi.number().integer().allow(null),
      quantidade: Joi.number().integer().min(0).default(0),
      dataEntrada: Joi.date().iso().allow(null),
      custo: Joi.number().precision(2).min(0).allow(null),
    }),
    order: Joi.object({
      clienteId: Joi.number().integer().allow(null),
      endereco: Joi.string().trim().allow(null, ''),
      preco: Joi.number().precision(2).min(0).default(0),
      dataPedido: Joi.date().iso().allow(null),
      cpfPresentado: Joi.string().trim().allow(null, ''),
      nomePresentado: Joi.string().trim().allow(null, ''),
      emailPresentado: Joi.string().trim().email({ tlds: false }).allow(null, ''),
      enderecoPresentado: Joi.string().trim().allow(null, ''),
    }),
    shipment: Joi.object({
      pedidoId: Joi.number().integer().allow(null),
      produtoId: Joi.number().integer().allow(null),
      quantidade: Joi.number().integer().min(0).default(0),
      dataEnvio: Joi.date().iso().allow(null),
      preco: Joi.number().precision(2).min(0).default(0),
    }),
    feedback: Joi.object({
      clienteId: Joi.number().integer().allow(null),
      data: Joi.date().iso().allow(null),
      nota: Joi.number().integer().min(0).max(10).default(0),
      contato: Joi.string().trim().allow(null, ''),
      observacao: Joi.string().trim().allow(null, ''),
    }),
    phone: Joi.object({
      clienteId: Joi.number().integer().required(),
      ddd: Joi.string().trim().length(3).allow(null, ''),
      numero: Joi.string().trim().pattern(/^\d{8,9}$/).required(),
    }),
  };
}

function createCoreDataService(repository) {
  const schemas = buildSchemas();

  function validate(schema, payload) {
    const { error, value } = schema.validate(payload, { abortEarly: false });
    if (error) {
      const message = error.details.map((d) => d.message || d.context?.message).join(', ');
      const validationError = new Error(message);
      validationError.status = 400;
      throw validationError;
    }
    return value;
  }

  function normalizeIdOrThrow(raw, label) {
    const coerced = Number(raw);
    if (!Number.isInteger(coerced) || coerced <= 0) {
      const validationError = new Error(`${label || 'ID'} inválido`);
      validationError.status = 400;
      throw validationError;
    }
    return coerced;
  }

  function ensureTerm(term) {
    if (!term || !String(term).trim()) {
      const validationError = new Error('Parâmetro de busca vazio');
      validationError.status = 400;
      throw validationError;
    }
    return String(term).trim();
  }

  async function createAddress(payload) {
    const value = validate(schemas.address, payload);
    return repository.createAddress(value);
  }

  async function updateAddress(id, payload) {
    const addressId = normalizeIdOrThrow(id, 'Endereço');
    const existing = await repository.findAddressById(addressId);
    if (!existing) {
      const notFound = new Error('Endereço não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const value = validate(schemas.address, payload);
    return repository.updateAddress(addressId, value);
  }

  async function listAddresses() {
    return repository.findAllAddresses();
  }

  async function searchAddresses(term) {
    return repository.searchAddresses(ensureTerm(term));
  }

  async function createCustomer(payload) {
    const normalized = {
      ...payload,
      enderecoId: normalizeId(payload, 'enderecoId', 'endereco_id'),
      dataNascimento: normalizeDate(payload.dataNascimento ?? payload.data_nascimento ?? payload.data_nascimento),
    };

    const value = validate(schemas.customer, normalized);

    if (value.cpf) {
      const existingCpf = await repository.findCustomerByCpf(value.cpf);
      if (existingCpf) {
        const err = new Error('CPF já cadastrado');
        err.status = 409;
        throw err;
      }
    }

    if (value.cnpj) {
      const existingCnpj = await repository.findCustomerByCnpj(value.cnpj);
      if (existingCnpj) {
        const err = new Error('CNPJ já cadastrado');
        err.status = 409;
        throw err;
      }
    }

    return repository.createCustomer(value);
  }

  async function updateCustomer(id, payload) {
    const customerId = normalizeIdOrThrow(id, 'Cliente');
    const existing = await repository.findCustomerById(customerId);
    if (!existing) {
      const notFound = new Error('Cliente não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      enderecoId: normalizeId(payload, 'enderecoId', 'endereco_id'),
      dataNascimento: normalizeDate(payload.dataNascimento ?? payload.data_nascimento ?? payload.data_nascimento),
    };

    const value = validate(schemas.customer, normalized);

    if (value.cpf) {
      const existingCpf = await repository.findCustomerByCpf(value.cpf);
      if (existingCpf && existingCpf.id !== customerId) {
        const err = new Error('CPF já cadastrado');
        err.status = 409;
        throw err;
      }
    }

    if (value.cnpj) {
      const existingCnpj = await repository.findCustomerByCnpj(value.cnpj);
      if (existingCnpj && existingCnpj.id !== customerId) {
        const err = new Error('CNPJ já cadastrado');
        err.status = 409;
        throw err;
      }
    }

    return repository.updateCustomer(customerId, value);
  }

  async function listCustomers() {
    return repository.findAllCustomers();
  }

  async function searchCustomers(term) {
    return repository.searchCustomers(ensureTerm(term));
  }

  async function createMaterial(payload) {
    const normalized = {
      ...payload,
      dataValidade: normalizeDate(payload.dataValidade ?? payload.data_validade ?? payload.validade),
    };

    const value = validate(schemas.material, normalized);
    return repository.createMaterial(value);
  }

  async function updateMaterial(id, payload) {
    const materialId = normalizeIdOrThrow(id, 'Matéria-prima');
    const existing = await repository.findMaterialById(materialId);
    if (!existing) {
      const notFound = new Error('Matéria-prima não encontrada');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      dataValidade: normalizeDate(payload.dataValidade ?? payload.data_validade ?? payload.validade),
    };
    const value = validate(schemas.material, normalized);
    return repository.updateMaterial(materialId, value);
  }

  async function listMaterials() {
    return repository.findAllMaterials();
  }

  async function searchMaterials(term) {
    return repository.searchMaterials(ensureTerm(term));
  }

  async function createMaterialDelivery(payload) {
    const normalized = {
      ...payload,
      materialId: normalizeId(payload, 'materialId', 'material_id'),
      fornecedorId: normalizeId(payload, 'fornecedorId', 'fornecedor_id'),
      dataEntrada: normalizeDate(payload.dataEntrada ?? payload.data_entrada),
    };

    const value = validate(schemas.materialDelivery, normalized);
    return repository.createMaterialDelivery(value);
  }

  async function updateMaterialDelivery(id, payload) {
    const deliveryId = normalizeIdOrThrow(id, 'Entrega de material');
    const existing = await repository.findMaterialDeliveryById(deliveryId);
    if (!existing) {
      const notFound = new Error('Entrega de material não encontrada');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      materialId: normalizeId(payload, 'materialId', 'material_id'),
      fornecedorId: normalizeId(payload, 'fornecedorId', 'fornecedor_id'),
      dataEntrada: normalizeDate(payload.dataEntrada ?? payload.data_entrada),
    };

    const value = validate(schemas.materialDelivery, normalized);
    return repository.updateMaterialDelivery(deliveryId, value);
  }

  async function listMaterialDeliveries() {
    return repository.findAllMaterialDeliveries();
  }

  async function searchMaterialDeliveries(term) {
    return repository.searchMaterialDeliveries(ensureTerm(term));
  }

  async function createManufacturing(payload) {
    const normalized = {
      ...payload,
      produtoId: normalizeId(payload, 'produtoId', 'produto_id'),
      materialId: normalizeId(payload, 'materialId', 'material_id'),
    };

    const value = validate(schemas.manufacturing, normalized);
    return repository.createManufacturing(value);
  }

  async function updateManufacturing(id, payload) {
    const manufacturingId = normalizeIdOrThrow(id, 'Manufatura');
    const existing = await repository.findManufacturingById(manufacturingId);
    if (!existing) {
      const notFound = new Error('Manufatura não encontrada');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      produtoId: normalizeId(payload, 'produtoId', 'produto_id'),
      materialId: normalizeId(payload, 'materialId', 'material_id'),
    };

    const value = validate(schemas.manufacturing, normalized);
    return repository.updateManufacturing(manufacturingId, value);
  }

  async function listManufacturing() {
    return repository.findAllManufacturing();
  }

  async function searchManufacturing(term) {
    return repository.searchManufacturing(ensureTerm(term));
  }

  async function createOrder(payload) {
    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
      dataPedido: normalizeDate(payload.dataPedido ?? payload.data_pedido),
    };

    const value = validate(schemas.order, normalized);
    return repository.createOrder(value);
  }

  async function updateOrder(id, payload) {
    const orderId = normalizeIdOrThrow(id, 'Pedido');
    const existing = await repository.findOrderById(orderId);
    if (!existing) {
      const notFound = new Error('Pedido não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
      dataPedido: normalizeDate(payload.dataPedido ?? payload.data_pedido),
    };

    const value = validate(schemas.order, normalized);
    return repository.updateOrder(orderId, value);
  }

  async function listOrders() {
    return repository.findAllOrders();
  }

  async function searchOrders(term) {
    return repository.searchOrders(ensureTerm(term));
  }

  async function createShipment(payload) {
    const normalized = {
      ...payload,
      pedidoId: normalizeId(payload, 'pedidoId', 'pedido_id'),
      produtoId: normalizeId(payload, 'produtoId', 'produto_id'),
      dataEnvio: normalizeDate(payload.dataEnvio ?? payload.data_envio),
    };

    const value = validate(schemas.shipment, normalized);
    return repository.createShipment(value);
  }

  async function updateShipment(id, payload) {
    const shipmentId = normalizeIdOrThrow(id, 'Envio');
    const existing = await repository.findShipmentById(shipmentId);
    if (!existing) {
      const notFound = new Error('Envio não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      pedidoId: normalizeId(payload, 'pedidoId', 'pedido_id'),
      produtoId: normalizeId(payload, 'produtoId', 'produto_id'),
      dataEnvio: normalizeDate(payload.dataEnvio ?? payload.data_envio),
    };

    const value = validate(schemas.shipment, normalized);
    return repository.updateShipment(shipmentId, value);
  }

  async function listShipments() {
    return repository.findAllShipments();
  }

  async function searchShipments(term) {
    return repository.searchShipments(ensureTerm(term));
  }

  async function createFeedback(payload) {
    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
      data: normalizeDate(payload.data ?? payload.data_feedback),
    };

    const value = validate(schemas.feedback, normalized);
    return repository.createFeedback(value);
  }

  async function updateFeedback(id, payload) {
    const feedbackId = normalizeIdOrThrow(id, 'Feedback');
    const existing = await repository.findFeedbackById(feedbackId);
    if (!existing) {
      const notFound = new Error('Feedback não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
      data: normalizeDate(payload.data ?? payload.data_feedback),
    };

    const value = validate(schemas.feedback, normalized);
    return repository.updateFeedback(feedbackId, value);
  }

  async function listFeedbacks() {
    return repository.findAllFeedbacks();
  }

  async function searchFeedbacks(term) {
    return repository.searchFeedbacks(ensureTerm(term));
  }

  async function createPhone(payload) {
    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
    };

    const value = validate(schemas.phone, normalized);
    return repository.createPhone(value);
  }

  async function updatePhone(id, payload) {
    const phoneId = normalizeIdOrThrow(id, 'Telefone');
    const existing = await repository.findPhoneById(phoneId);
    if (!existing) {
      const notFound = new Error('Telefone não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const normalized = {
      ...payload,
      clienteId: normalizeId(payload, 'clienteId', 'cliente_id'),
    };

    const value = validate(schemas.phone, normalized);
    return repository.updatePhone(phoneId, value);
  }

  async function listPhones() {
    return repository.findAllPhones();
  }

  async function searchPhones(term) {
    return repository.searchPhones(ensureTerm(term));
  }

  return {
    createAddress,
    updateAddress,
    listAddresses,
    searchAddresses,
    createCustomer,
    updateCustomer,
    listCustomers,
    searchCustomers,
    createMaterial,
    updateMaterial,
    listMaterials,
    searchMaterials,
    createMaterialDelivery,
    updateMaterialDelivery,
    listMaterialDeliveries,
    searchMaterialDeliveries,
    createManufacturing,
    updateManufacturing,
    listManufacturing,
    searchManufacturing,
    createOrder,
    updateOrder,
    listOrders,
    searchOrders,
    createShipment,
    updateShipment,
    listShipments,
    searchShipments,
    createFeedback,
    updateFeedback,
    listFeedbacks,
    searchFeedbacks,
    createPhone,
    updatePhone,
    listPhones,
    searchPhones,
  };
}

module.exports = { createCoreDataService };
