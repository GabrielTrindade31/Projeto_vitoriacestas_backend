const request = require('supertest');
const createApp = require('../../src/app');
const buildItemRouter = require('../../src/routes/items');
const buildSupplierRouter = require('../../src/routes/suppliers');

function buildMockRouters() {
  const itemService = {
    createItem: jest.fn(async (payload) => ({ id: 10, ...payload })),
  };
  const supplierService = {
    createSupplier: jest.fn(async (payload) => ({ id: 99, ...payload })),
  };

  return {
    itemRouter: buildItemRouter(itemService),
    supplierRouter: buildSupplierRouter(supplierService),
  };
}

async function login(app, email, password) {
  const response = await request(app).post('/api/auth/login').send({ email, password });
  return response.body.accessToken;
}

describe('Autorização por perfil', () => {
  const { itemRouter, supplierRouter } = buildMockRouters();
  const app = createApp({ itemRouter, supplierRouter });

  it('permite gestor criar item', async () => {
    const gestorToken = await login(app, 'gestor@vitoriacestas.com', 'gestor123');

    const response = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ codigo: 'COD1', nome: 'Item Gestor', quantidade: 1, preco: 5 });

    expect(response.status).toBe(201);
  });

  it('bloqueia operador ao criar item', async () => {
    const operadorToken = await login(app, 'operador@vitoriacestas.com', 'operador123');

    const response = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${operadorToken}`)
      .send({ codigo: 'COD2', nome: 'Item Operador', quantidade: 1, preco: 5 });

    expect(response.status).toBe(403);
  });

  it('apenas admin cria fornecedor', async () => {
    const gestorToken = await login(app, 'gestor@vitoriacestas.com', 'gestor123');

    const gestorResponse = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({
        cnpj: '12345678000100',
        razaoSocial: 'Fornecedor LTDA',
        contato: 'Contato',
        email: 'contato@teste.com',
        telefone: '1199999-9999',
      });

    expect(gestorResponse.status).toBe(403);

    const adminToken = await login(app, 'admin@vitoriacestas.com', 'admin123');
    const adminResponse = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        cnpj: '12345678000100',
        razaoSocial: 'Fornecedor LTDA',
        contato: 'Contato',
        email: 'contato@teste.com',
        telefone: '1199999-9999',
      });

    expect(adminResponse.status).toBe(201);
  });
});
