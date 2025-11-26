const request = require('supertest');
const createApp = require('../../src/app');
const buildItemRouter = require('../../src/routes/items');

const authBypass = {
  authenticate: (req, res, next) => next(),
  authorizeRoles: () => (req, res, next) => next(),
};

function buildMockedItemRouter() {
  const service = {
    createItem: jest.fn(async (payload) => ({ id: 1, ...payload })),
  };
  return buildItemRouter(service, authBypass);
}

describe('Fluxo de autenticação', () => {
  const app = createApp({ itemRouter: buildMockedItemRouter() });

  it('retorna tokens para credenciais válidas', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@vitoriacestas.com',
      password: 'admin123',
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(response.body.user.role).toBe('Admin');
  });

  it('recusa login inválido', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'admin@vitoriacestas.com',
      password: 'senha-errada',
    });

    expect(response.status).toBe(401);
  });

  it('renova token de acesso com refresh token válido', async () => {
    const loginResponse = await request(app).post('/api/auth/login').send({
      email: 'admin@vitoriacestas.com',
      password: 'admin123',
    });

    const refreshResponse = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.accessToken).toBeDefined();
  });
});
