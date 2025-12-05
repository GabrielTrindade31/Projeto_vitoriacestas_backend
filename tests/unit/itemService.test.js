const { createItemService } = require('../../src/services/itemService');

describe('createItemService', () => {
  const basePayload = {
    codigo: 'ABC123',
    nome: 'Cesta Básica',
    quantidade: 10,
    preco: 20.5,
  };

  it('valida campos obrigatórios', async () => {
    const repository = { findByCode: jest.fn(), create: jest.fn(), findById: jest.fn() };
    const service = createItemService(repository);
    await expect(service.createItem({})).rejects.toThrow(/"codigo"/);
  });

  it('bloqueia quantidade negativa', async () => {
    const repository = { findByCode: jest.fn(), create: jest.fn(), findById: jest.fn() };
    const service = createItemService(repository);
    await expect(
      service.createItem({ ...basePayload, quantidade: -1 }),
    ).rejects.toThrow('"quantidade" must be greater than or equal to 0');
  });

  it('impede duplicidade de código', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn(),
      findById: jest.fn(),
    };
    const service = createItemService(repository);
    await expect(service.createItem(basePayload)).rejects.toThrow('Código já cadastrado');
  });

  it('cria item quando válido', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 1, ...basePayload }),
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue({ id: 1, ...basePayload }),
      deleteImageByProductId: jest.fn(),
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

  it('lista vínculos de imagens quando solicitado', async () => {
    const repository = {
      findByCode: jest.fn(),
      create: jest.fn(),
      findAllImages: jest.fn().mockResolvedValue([{ produtoId: 1, imagemUrl: 'https://blob/1.png' }]),
    };
    const service = createItemService(repository);

    const result = await service.listItemImages();

    expect(result).toHaveLength(1);
    expect(repository.findAllImages).toHaveBeenCalled();
  });

  it('vincula a imagem ao atualizar o item', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue({ id: 1 }),
      findById: jest
        .fn()
        .mockResolvedValueOnce({ id: 1, ...basePayload })
        .mockResolvedValueOnce({ id: 1, ...basePayload, imagemUrl: 'https://blob/1.png' }),
      update: jest.fn().mockResolvedValue({ id: 1, ...basePayload }),
      upsertImage: jest.fn(),
      deleteImageByProductId: jest.fn(),
    };

    const service = createItemService(repository);
    const payload = { ...basePayload, imagem: 'https://blob/1.png' };

    const result = await service.updateItem(1, payload);

    expect(repository.update).toHaveBeenCalled();
    expect(repository.upsertImage).toHaveBeenCalledWith(1, 'https://blob/1.png');
    expect(result.imagemUrl).toBe('https://blob/1.png');
  });

  it('remove o vínculo da imagem quando limpar no update', async () => {
    const repository = {
      findByCode: jest.fn().mockResolvedValue({ id: 1 }),
      findById: jest
        .fn()
        .mockResolvedValueOnce({ id: 1, ...basePayload, imagemUrl: 'https://blob/old.png' })
        .mockResolvedValueOnce({ id: 1, ...basePayload, imagemUrl: null }),
      update: jest.fn().mockResolvedValue({ id: 1, ...basePayload }),
      upsertImage: jest.fn(),
      deleteImageByProductId: jest.fn(),
    };

    const service = createItemService(repository);
    const payload = { ...basePayload, imagemUrl: '' };

    const result = await service.updateItem(1, payload);

    expect(repository.update).toHaveBeenCalled();
    expect(repository.deleteImageByProductId).toHaveBeenCalledWith(1);
    expect(repository.upsertImage).not.toHaveBeenCalled();
    expect(result.imagemUrl).toBeNull();
  });
});
