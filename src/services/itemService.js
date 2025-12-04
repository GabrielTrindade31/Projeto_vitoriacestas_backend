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

  function validateAndNormalize(payload) {
    const normalized = { ...payload, fornecedorId: normalizeSupplierId(payload) };

    const { error, value } = schema.validate(normalized, { abortEarly: false, allowUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      const validationError = new Error(message);
      validationError.status = 400;
      throw validationError;
    }

    return value;
  }

  async function createItem(payload) {
    const value = validateAndNormalize(payload);

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

  async function getItemById(id) {
    const item = await repository.findById(id);
    if (!item) {
      const notFound = new Error('Item não encontrado');
      notFound.status = 404;
      throw notFound;
    }
    return item;
  }

  async function updateItem(id, payload) {
    const value = validateAndNormalize(payload);

    const existing = await repository.findById(id);
    if (!existing) {
      const notFound = new Error('Item não encontrado');
      notFound.status = 404;
      throw notFound;
    }

    const duplicatedCode = await repository.findByCode(value.codigo);
    if (duplicatedCode && duplicatedCode.id !== id) {
      const duplicateError = new Error('Código já cadastrado');
      duplicateError.status = 409;
      throw duplicateError;
    }

    return repository.update(id, value);
  }

  async function searchItems(term) {
    if (!term || !String(term).trim()) {
      const validationError = new Error('Parâmetro de busca vazio');
      validationError.status = 400;
      throw validationError;
    }

    return repository.search(String(term).trim());
  }

  return { createItem, listItems, getItemById, updateItem, searchItems };
}

module.exports = { createItemService };
