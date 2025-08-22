const request = require('supertest');
const app = require('../server');
const authRoutes = require('../routes/authRoutes');

describe('Product Routes Negative (no DB connected)', () => {
  let adminToken;
  beforeAll(async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Prod Admin', email: 'prodadmin@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    // elevate role
    const users = authRoutes._debug.users;
    users.get('prodadmin@example.com').role = 'admin';
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'prodadmin@example.com', password: 'secret123' });
    adminToken = login.body.accessToken;
  });

  function auth() { return { Authorization: `Bearer ${adminToken}` }; }

  test('GET /api/products returns empty structure without DB', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  test('GET /api/products/:id returns 404 without DB', async () => {
    const res = await request(app).get('/api/products/123456789012');
    expect(res.status).toBe(404);
  });

  test('POST create product returns 503 without DB', async () => {
    const res = await request(app)
      .post('/api/products')
      .set(auth())
      .send({ name: 'X', price: 10, seller: 's1' });
    expect(res.status).toBe(503);
  });

  test('PUT update product returns 503 without DB', async () => {
    const res = await request(app)
      .put('/api/products/123')
      .set(auth())
      .send({ name: 'New' });
    expect(res.status).toBe(503);
  });

  test('DELETE product returns 503 without DB', async () => {
    const res = await request(app)
      .delete('/api/products/123')
      .set(auth());
    expect(res.status).toBe(503);
  });
});
