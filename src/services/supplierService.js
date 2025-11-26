const Joi = require('joi');
const { cnpj } = require('cpf-cnpj-validator');

function buildSupplierSchema() {
  return Joi.object({
    cnpj: Joi.string().trim().required(),
    razaoSocial: Joi.string().trim().required(),
    contato: Joi.string().trim().required(),
    email: Joi.string().trim().email({ tlds: false }).required(),
    telefone: Joi.string().trim().pattern(/^(\(?\d{2}\)?\s?)?(9?\d{4}-?\d{4})$/).required(),
    enderecoId: Joi.number().integer().allow(null),
  });
}

function createSupplierService(repository) {
  const schema = buildSupplierSchema();

  async function createSupplier(payload) {
    const { error, value } = schema.validate(payload);
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      const validationError = new Error(message);
      validationError.status = 400;
      throw validationError;
    }

    if (!cnpj.isValid(value.cnpj)) {
      const cnpjError = new Error('CNPJ inválido');
      cnpjError.status = 400;
      throw cnpjError;
    }

    const existing = await repository.findByCnpj(value.cnpj);
    if (existing) {
      const duplicateError = new Error('CNPJ já cadastrado');
      duplicateError.status = 409;
      throw duplicateError;
    }

    return repository.create(value);
  }

  async function listSuppliers() {
    return repository.findAll();
  }

  return { createSupplier, listSuppliers };
}

module.exports = { createSupplierService };
