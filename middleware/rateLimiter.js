// Lightweight internal rate limiter stubs for tests
const passthrough = (req, res, next) => next();
module.exports = { authLimiter: passthrough, apiLimiter: passthrough };
