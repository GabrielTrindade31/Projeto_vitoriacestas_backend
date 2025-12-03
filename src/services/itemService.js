const Joi = require('joi');

function buildItemSchema() {
  return Joi.object({
    codigo: Joi.string().trim().required(),
    nome: Joi.string().trim().required(),
    descricao: Joi.string().allow('', null),
    categoria: Joi.string().allow('', null),
    quantidade: Joi.number().integer().min(0).required(),
    preco: Joi.number().precision(2).min(0).required(),
    fornecedorId: Joi.number().integer().allow(null),
  });
}

function normalizeSupplierId(payload) {
  const fallback =
    payload.fornecedorId ?? payload.fornecedor_id ?? payload.fornecedor ?? payload.fornecedorID ?? null;

  if (fallback === undefined || fallback === null || fallback === '') return null;

  const coerced = Number(fallback);
  return Number.isNaN(coerced) ? null : coerced;
}

function createItemService(repository) {
  const schema = buildItemSchema();

  async function createItem(payload) {
    const normalized = { ...payload, fornecedorId: normalizeSupplierId(payload) };

    const { error, value } = schema.validate(normalized, { abortEarly: false, allowUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      const validationError = new Error(message);
      validationError.status = 400;
      throw validationError;
    }

    const existing = await repository.findByCode(value.codigo);
    if (existing) {
      const duplicateError = new Error('Código já cadastrado');
      duplicateError.status = 409;
      throw duplicateError;
    }

    const created = await repository.create(value);
    return created;
  }

  async function listItems() {
    return repository.findAll();
  }

  return { createItem, listItems };
}

module.exports = { createItemService };
