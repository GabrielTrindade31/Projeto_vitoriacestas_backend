const { createSupplierService } = require('../../src/services/supplierService');

const basePayload = {
  cnpj: '45.723.174/0001-10',
  razaoSocial: 'Fornecedor XPTO',
  contato: 'Maria Silva',
  email: 'contato@xpto.com',
  telefone: '1198765-4321',
};

describe('createSupplierService', () => {
  it('valida campos obrigatórios', async () => {
    const repository = { findByCnpj: jest.fn(), create: jest.fn() };
    const service = createSupplierService(repository);
    await expect(service.createSupplier({})).rejects.toThrow(/"cnpj"/);
  });

  it('valida CNPJ', async () => {
    const repository = { findByCnpj: jest.fn(), create: jest.fn() };
    const service = createSupplierService(repository);
    await expect(
      service.createSupplier({ ...basePayload, cnpj: '123' }),
    ).rejects.toThrow('CNPJ inválido');
  });

  it('impede duplicidade', async () => {
    const repository = {
      findByCnpj: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn(),
    };
    const service = createSupplierService(repository);
    await expect(service.createSupplier(basePayload)).rejects.toThrow('CNPJ já cadastrado');
  });

  it('cria fornecedor quando válido', async () => {
    const repository = {
      findByCnpj: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 10, ...basePayload }),
    };
    const service = createSupplierService(repository);
    const result = await service.createSupplier(basePayload);
    expect(result.id).toBe(10);
  });
});
