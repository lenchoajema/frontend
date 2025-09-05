// Tests STRICT_JSON enforcement on malformed / non-JSON bodies.
const request = require('supertest');

describe('STRICT_JSON enforcement', () => {
  let app;
  beforeAll(() => {
    process.env.STRICT_JSON = '1';
    const serverPath = require.resolve('../server');
    delete require.cache[serverPath];
    app = require('../server');
  });

  test('rejects urlencoded body when STRICT_JSON enabled', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type','application/x-www-form-urlencoded')
      .send('name=User&email=u@example.com&password=pass');
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/requires application\/json/i);
  });

  test('accepts proper JSON body', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type','application/json')
      .send({ name: 'JsonOk', email: 'jsonok@example.com', password: 'secret123' });
    expect([200,201]).toContain(res.status);
  });
});
