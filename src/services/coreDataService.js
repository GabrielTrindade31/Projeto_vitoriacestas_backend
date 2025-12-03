const Joi = require('joi');

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

  async function createAddress(payload) {
    const value = validate(schemas.address, payload);
    return repository.createAddress(value);
  }

  async function listAddresses() {
    return repository.findAllAddresses();
  }

  async function createCustomer(payload) {
    const value = validate(schemas.customer, payload);

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

  async function listCustomers() {
    return repository.findAllCustomers();
  }

  async function createMaterial(payload) {
    const value = validate(schemas.material, payload);
    return repository.createMaterial(value);
  }

  async function listMaterials() {
    return repository.findAllMaterials();
  }

  async function createMaterialDelivery(payload) {
    const value = validate(schemas.materialDelivery, payload);
    return repository.createMaterialDelivery(value);
  }

  async function listMaterialDeliveries() {
    return repository.findAllMaterialDeliveries();
  }

  async function createManufacturing(payload) {
    const value = validate(schemas.manufacturing, payload);
    return repository.createManufacturing(value);
  }

  async function listManufacturing() {
    return repository.findAllManufacturing();
  }

  async function createOrder(payload) {
    const value = validate(schemas.order, payload);
    return repository.createOrder(value);
  }

  async function listOrders() {
    return repository.findAllOrders();
  }

  async function createShipment(payload) {
    const value = validate(schemas.shipment, payload);
    return repository.createShipment(value);
  }

  async function listShipments() {
    return repository.findAllShipments();
  }

  async function createFeedback(payload) {
    const value = validate(schemas.feedback, payload);
    return repository.createFeedback(value);
  }

  async function listFeedbacks() {
    return repository.findAllFeedbacks();
  }

  async function createPhone(payload) {
    const value = validate(schemas.phone, payload);
    return repository.createPhone(value);
  }

  async function listPhones() {
    return repository.findAllPhones();
  }

  return {
    createAddress,
    listAddresses,
    createCustomer,
    listCustomers,
    createMaterial,
    listMaterials,
    createMaterialDelivery,
    listMaterialDeliveries,
    createManufacturing,
    listManufacturing,
    createOrder,
    listOrders,
    createShipment,
    listShipments,
    createFeedback,
    listFeedbacks,
    createPhone,
    listPhones,
  };
}

module.exports = { createCoreDataService };
