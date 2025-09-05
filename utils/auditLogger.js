const pino = require('pino');
const base = pino({ level: process.env.AUDIT_LOG_LEVEL || 'info', name: 'audit' });

function event(action, details = {}) {
  base.info({ action, ...details, ts: new Date().toISOString() });
}

module.exports = { event };
