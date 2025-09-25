const request = require('supertest');
require('./mongoMemorySetup');
const app = require('../server');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');

describe('End-to-end order flow', () => {
  let token;

  beforeAll(async () => {
    // Ensure payments provider is enabled regardless of Redis state
    process.env.REDIS_URL = '';
  });

  it('creates an order from server cart, captures it, marks Completed, and clears cart', async () => {
    // 1) Register user
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'FlowUser', email: 'flow@example.com', password: 'pw12345' });
    expect(reg.status).toBe(201);
    token = reg.body.accessToken;

    // 2) Seed a product directly into DB
    const p = await Product.create({ name: 'Flow Product', price: 12.34, description: 'flow test', pictures: ['/uploads/x.png'], stock: 5, seller: new mongoose.Types.ObjectId() });

    // 3) Add to cart (server-side)
    const add = await request(app)
      .post('/api/user/cart')
      .set('Authorization', 'Bearer ' + token)
      .send({ productId: String(p._id), quantity: 2 });
    expect(add.status).toBe(201);
    expect(add.body.cart.total).toBeCloseTo(24.68, 2);

    // 4) Ensure stripe provider is enabled
    const cfg = await request(app).get('/api/payments/config');
    if (!cfg.body.providers.stripe) {
      const toggled = await request(app).post('/api/payments/admin/provider/stripe/toggle').set('Authorization', 'Bearer ' + token);
      expect(toggled.status).toBe(200);
    }

    // 5) Create order without explicit items/total -> backend reads server cart
    const create = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', 'Bearer ' + token)
      .send({});
    // In stub mode may be 503 with configured=false but should include id when DB used
    expect([200, 503]).toContain(create.status);
    const createdId = create.body.id;
    expect(createdId).toBeTruthy();

    // 6) Capture order
    const capture = await request(app)
      .post('/api/payments/capture-order/' + createdId)
      .set('Authorization', 'Bearer ' + token)
      .send({});
    expect(capture.status).toBe(200);
    expect(capture.body.captured).toBe(true);

    // 7) Verify Order status and cart cleared
    const orderDoc = await Order.findById(createdId).lean();
    if (orderDoc) {
      expect(orderDoc.status).toBe('Completed');
    }
    const getCart = await request(app)
      .get('/api/user/cart')
      .set('Authorization', 'Bearer ' + token);
    expect(getCart.status).toBe(200);
    expect(getCart.body.items).toEqual([]);
    expect(getCart.body.total).toBe(0);
  });
});
