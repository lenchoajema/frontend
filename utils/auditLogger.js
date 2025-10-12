let pino;
try { pino = require('pino'); } catch (_) { pino = null; }
const base = pino ? pino({ level: process.env.AUDIT_LOG_LEVEL || 'info', name: 'audit' }) : {
  info: (obj) => {
    try { console.log('[audit]', typeof obj === 'string' ? obj : JSON.stringify(obj)); } catch(_) { /* noop */ }
  }
};

function event(action, details = {}) {
  base.info({ action, ...details, ts: new Date().toISOString() });
}

module.exports = { event };
