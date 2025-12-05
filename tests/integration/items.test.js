const request = require('supertest');
const express = require('express');
const createApp = require('../../src/app');
const buildItemRouter = require('../../src/routes/items');

function buildMockItemRouter() {
  const service = {
    createItem: jest.fn(async (payload) => ({ id: 1, ...payload })),
    listItems: jest.fn(async () => [{ id: 1, codigo: 'ITEM1', nome: 'Item de Teste' }]),
    listItemImages: jest.fn(async () => [{ produtoId: 1, imagemUrl: 'https://blob/1.png' }]),
    updateItem: jest.fn(async (id, payload) => ({ id, ...payload })),
  };
  const auth = {
    authenticate: (req, res, next) => next(),
    authorizeRoles: () => (req, res, next) => next(),
  };
  return { router: buildItemRouter(service, auth), service };
}

describe('POST /api/items', () => {
  it('retorna 201 quando cria item', async () => {
    const { router, service } = buildMockItemRouter();
    const app = createApp({ itemRouter: router, supplierRouter: express.Router(), authRouter: express.Router() });

    const response = await request(app).post('/api/items').send({
      codigo: 'ITEM1',
      nome: 'Item de Teste',
      quantidade: 5,
      preco: 10,
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toMatch(/sucesso/);
    expect(service.createItem).toHaveBeenCalled();
  });
});

describe('GET /api/items', () => {
  it('retorna 200 com a lista de itens', async () => {
    const { router, service } = buildMockItemRouter();
    const app = createApp({ itemRouter: router, supplierRouter: express.Router(), authRouter: express.Router() });

    const response = await request(app).get('/api/items').set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(service.listItems).toHaveBeenCalled();
  });
});

describe('GET /api/items/images', () => {
  it('retorna 200 com a lista de imagens', async () => {
    const { router, service } = buildMockItemRouter();
    const app = createApp({ itemRouter: router, supplierRouter: express.Router(), authRouter: express.Router() });

    const response = await request(app).get('/api/items/images').set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.images).toHaveLength(1);
    expect(service.listItemImages).toHaveBeenCalled();
  });
});

describe('PUT /api/items/:id', () => {
  it('atualiza o item e vincula imagem quando enviada', async () => {
    const { router, service } = buildMockItemRouter();
    const app = createApp({ itemRouter: router, supplierRouter: express.Router(), authRouter: express.Router() });

    const response = await request(app)
      .put('/api/items/1')
      .set('Authorization', 'Bearer token')
      .send({
        codigo: 'ITEM1',
        nome: 'Item de Teste',
        quantidade: 5,
        preco: 10,
        imagemUrl: 'https://blob/1.png',
      });

    expect(response.status).toBe(200);
    expect(response.body.item.imagemUrl).toBe('https://blob/1.png');
    expect(service.updateItem).toHaveBeenCalledWith(1, expect.objectContaining({ imagemUrl: 'https://blob/1.png' }));
  });
});
