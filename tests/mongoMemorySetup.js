const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Increase default Jest timeout for potentially slow in-memory Mongo startup (CI, cold starts)
// Only apply if Jest globals are present.
try { if (typeof jest !== 'undefined' && jest.setTimeout) { jest.setTimeout(30000); } } catch(_) {}

let mongoServer;

// Global setup for tests that require a real Mongo connection
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { dbName: 'testdb' });
});

afterAll(async () => {
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
  if (mongoServer) await mongoServer.stop();
});

afterEach(async () => {
  // Cleanup all collections to isolate tests
  const collections = mongoose.connection.collections;
  for (const name of Object.keys(collections)) {
    try { await collections[name].deleteMany({}); } catch(_){}
  }
});
