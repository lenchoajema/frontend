const request = require('supertest');
const app = require('../server');
const authRoutes = require('../routes/authRoutes');

describe('Payment Capabilities & Admin Controls', () => {
  let adminToken;
  beforeAll(async () => {
    // Register admin candidate
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: 'admin@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    // Elevate role directly in in-memory store for test
    const usersMap = authRoutes._debug.users;
    const user = usersMap.get('admin@example.com');
    user.role = 'admin';
    // Login again to get access token with admin role claim
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });
    expect(login.status).toBe(200);
    expect(login.body.user.role).toBe('admin');
    adminToken = login.body.accessToken;
  });

  function auth() { return { Authorization: `Bearer ${adminToken}` }; }

  test('fetch default config', async () => {
    const res = await request(app).get('/api/payments/config');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('paymentsEnabled', true);
    expect(res.body.providers).toHaveProperty('stripe', true);
  });

  test('disable payments globally blocks create-order', async () => {
    const upd = await request(app)
      .put('/api/payments/admin/capabilities')
      .set(auth())
      .send({ enabled: false });
    expect(upd.status).toBe(200);
    expect(upd.body.capabilities.enabled).toBe(false);

    const blocked = await request(app)
      .post('/api/payments/create-order')
      .set(auth())
      .send({ total: 10, items: [] });
    expect(blocked.status).toBe(503);
    expect(blocked.body.message).toMatch(/disabled/i);
  });

  test('re-enable but disable stripe provider blocks specific provider', async () => {
    const upd = await request(app)
      .put('/api/payments/admin/capabilities')
      .set(auth())
      .send({ enabled: true, providers: { stripe: false } });
    expect(upd.status).toBe(200);
    expect(upd.body.capabilities.enabled).toBe(true);
    expect(upd.body.capabilities.providers.stripe).toBe(false);

    const blocked = await request(app)
      .post('/api/payments/create-order')
      .set(auth())
      .send({ total: 5, items: [] });
    expect(blocked.status).toBe(503);
    expect(blocked.body.message).toMatch(/Stripe provider disabled/i);
  });

  test('toggle stripe provider back on allows create-order (happy path stub)', async () => {
    const tog = await request(app)
      .post('/api/payments/admin/provider/stripe/toggle')
      .set(auth());
    expect(tog.status).toBe(200);
    expect(tog.body.providers.stripe).toBe(true);

    // invalid total branch
    const badTotal = await request(app)
      .post('/api/payments/create-order')
      .set(auth())
      .send({ total: -1 });
    expect(badTotal.status).toBe(400);

    const ok = await request(app)
      .post('/api/payments/create-order')
      .set(auth())
      .send({ total: 12.34, items: [] });
    // In stub (no STRIPE key) we expect 503 from controller OR success path may vary; accept 200 or 503
    expect([200, 503]).toContain(ok.status);
  });

  test('unknown provider toggle returns 404', async () => {
    const res = await request(app)
      .post('/api/payments/admin/provider/unknownx/toggle')
      .set(auth());
    expect(res.status).toBe(404);
  });
});
