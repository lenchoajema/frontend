// Ensure deterministic environment for Jest
process.env.NODE_ENV = 'test';
// Prevent Redis connection attempts during tests
process.env.REDIS_URL = '';
// Provide a JWT secret for any token operations
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
