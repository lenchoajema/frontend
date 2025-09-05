// paymentCapabilities.js
// Provides a simple persistence abstraction for payment capability flags.
// Currently in-memory with optional Redis persistence if REDIS_URL configured.

let cache = {
  enabled: true,
  providers: { stripe: true, paypal: true },
  testMode: true,
  updatedAt: new Date().toISOString(),
};

let redisClient = null;

async function init(redisCandidate) {
  if (redisCandidate) redisClient = redisCandidate;
  if (redisClient) {
    try {
      const raw = await redisClient.get('payments:capabilities');
      if (raw) cache = JSON.parse(raw);
    } catch (e) {
      console.warn('[payments] Could not load capabilities from Redis:', e.message);
    }
  }
  return cache;
}

function getCapabilities() {
  return cache;
}

async function saveCapabilities() {
  cache.updatedAt = new Date().toISOString();
  if (redisClient) {
    try { await redisClient.set('payments:capabilities', JSON.stringify(cache)); } catch (e) { /* ignore */ }
  }
  return cache;
}

async function updateCapabilities(partial) {
  if (partial.enabled !== undefined) cache.enabled = !!partial.enabled;
  if (partial.testMode !== undefined) cache.testMode = !!partial.testMode;
  if (partial.providers && typeof partial.providers === 'object') {
    cache.providers = { ...cache.providers, ...partial.providers };
  }
  return saveCapabilities();
}

async function toggleProvider(name) {
  if (!(name in cache.providers)) return { error: 'Unknown provider' };
  cache.providers[name] = !cache.providers[name];
  await saveCapabilities();
  return cache.providers;
}

module.exports = { init, getCapabilities, updateCapabilities, toggleProvider };
