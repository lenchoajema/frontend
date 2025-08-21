const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

// Light integration test (DB may not be connected in CI; focuses on validation paths)
describe('Auth Routes', () => {
  it('rejects empty register payload', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects /me without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('registers and returns tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@example.com', password: 'Secret123' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
  it('login returns new tokens', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'Secret123' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });
});
