const request = require('supertest');
const app = require('../server');

describe('Auth Negative & Edge Cases', () => {
  let refreshToken;
  test('register user and capture refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup User', email: 'dup@example.com', password: 'secret123' });
    expect(res.status).toBe(201);
    refreshToken = res.body.refreshToken;
  });

  test('duplicate registration returns 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Dup User', email: 'dup@example.com', password: 'secret123' });
    expect(res.status).toBe(409);
  });

  test('login with wrong password returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'dup@example.com', password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  test('/me without token returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('/me with invalid token returns 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.status).toBe(401);
  });

  test('logout revokes refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
