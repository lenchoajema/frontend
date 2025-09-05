const request = require('supertest');
// Ensure rotation flag disabled to test non-rotation branch
process.env.REFRESH_ROTATE = '0';
const app = require('../server');

describe('Refresh Token Negative Paths', () => {
  test('missing token returns 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(401);
  });

  test('invalid token returns 401', async () => {
    const res = await request(app).post('/api/auth/refresh').send({ refreshToken: 'not-a-real-token' });
    expect(res.status).toBe(401);
  });

  test('non-rotation path returns rotated=false', async () => {
    // Register user to obtain refresh token
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'NoRotate', email: 'norotate@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    const token = reg.body.refreshToken;
    const ref = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: token });
    expect(ref.status).toBe(200);
    expect(ref.body.rotated).toBe(false);
    expect(ref.body).toHaveProperty('accessToken');
    // token should still be usable again (no rotation)
    const ref2 = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: token });
    expect(ref2.status).toBe(200);
  });
});
