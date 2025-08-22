const request = require('supertest');
// Ensure rotation is enabled BEFORE server is required so route picks it up
process.env.REFRESH_ROTATE = '1';
const app = require('../server');

describe('Refresh Token Rotation', () => {
  it('rotates refresh token and invalidates the old one', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Rotate User', email: 'rotate@example.com', password: 'secret123' });
    expect(reg.status).toBe(201);
    const originalRefresh = reg.body.refreshToken;

    // First rotation
    const first = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: originalRefresh });
    expect(first.status).toBe(200);
    expect(first.body).toHaveProperty('accessToken');
    expect(first.body.rotated).toBe(true);
    expect(first.body).toHaveProperty('refreshToken');
    const rotated1 = first.body.refreshToken;
    expect(rotated1).not.toBe(originalRefresh);

    // Old token should now be invalid
    const reuseOld = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: originalRefresh });
    expect(reuseOld.status).toBe(401);

    // Second rotation (chain)
    const second = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: rotated1 });
    expect(second.status).toBe(200);
    expect(second.body.rotated).toBe(true);
    const rotated2 = second.body.refreshToken;
    expect(rotated2).not.toBe(rotated1);
  });
});
