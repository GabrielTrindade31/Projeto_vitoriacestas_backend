const request = require('supertest');
const express = require('express');
const createApp = require('../../src/app');
const buildItemRouter = require('../../src/routes/items');

function buildMockItemRouter() {
  const service = {
    createItem: jest.fn(async (payload) => ({ id: 1, ...payload })),
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
