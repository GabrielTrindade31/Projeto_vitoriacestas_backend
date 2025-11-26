const request = require('supertest');
const express = require('express');
const createApp = require('../../src/app');
const buildSupplierRouter = require('../../src/routes/suppliers');

function buildMockSupplierRouter() {
  const service = {
    createSupplier: jest.fn(async (payload) => ({ id: 1, ...payload })),
    listSuppliers: jest.fn(async () => [{ id: 1, razao_social: 'Fornecedor XPTO' }]),
  };
  const auth = {
    authenticate: (req, res, next) => next(),
    authorizeRoles: () => (req, res, next) => next(),
  };
  return { router: buildSupplierRouter(service, auth), service };
}

describe('GET /api/suppliers', () => {
  it('retorna 200 com fornecedores', async () => {
    const { router, service } = buildMockSupplierRouter();
    const app = createApp({ itemRouter: express.Router(), supplierRouter: router, authRouter: express.Router() });

    const response = await request(app).get('/api/suppliers').set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.suppliers).toHaveLength(1);
    expect(service.listSuppliers).toHaveBeenCalled();
  });
});
