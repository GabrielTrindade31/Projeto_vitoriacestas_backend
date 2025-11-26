const { createItemService } = require('../../src/services/itemService');

describe('createItemService', () => {
  const basePayload = {
    codigo: 'ABC123',
    nome: 'Cesta Básica',
    quantidade: 10,
    preco: 20.5,
  };

  it('valida campos obrigatórios', async () => {
    const repository = { findByCode: jest.fn(), create: jest.fn() };
    const service = createItemService(repository);
    await expect(service.createItem({})).rejects.toThrow(/"codigo"/);
  });

  it('bloqueia quantidade negativa', async () => {
    const repository = { findByCode: jest.fn(), create: jest.fn() };
    const service = createItemService(repository);
    await expect(
      service.createItem({ ...basePayload, quantidade: -1 }),
    ).rejects.toThrow('"quantidade" must be greater than or equal to 0');
  });

  it('impede duplicidade de código', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn(),
    };
    const service = createItemService(repository);
    await expect(service.createItem(basePayload)).rejects.toThrow('Código já cadastrado');
  });

  it('cria item quando válido', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, ...basePayload }),
      findAll: jest.fn(),
    };
    const service = createItemService(repository);
    const result = await service.createItem(basePayload);
    expect(result.id).toBe(1);
    expect(repository.create).toHaveBeenCalled();
  });

  it('retorna a lista de itens do repositório', async () => {
    const repository = {
      findByCode: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue([{ id: 99, codigo: 'XYZ', nome: 'Teste' }]),
    };
    const service = createItemService(repository);
    const result = await service.listItems();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(99);
    expect(repository.findAll).toHaveBeenCalled();
  });
});
