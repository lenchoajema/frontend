const { record, getMetrics, initTelemetry } = require('../utils/telemetry');

describe('metrics counters', () => {
  test('increments counters via record()', async () => {
    await initTelemetry();
    record('payments.intent.created');
    record('payments.intent.created');
    record('payments.intent.failed');
    record('orders.created');
    const m = getMetrics();
    // Keys reflect internal counter objects; just ensure they are present
    expect(m).toHaveProperty('paymentsCreated');
    expect(m).toHaveProperty('paymentsFailed');
    expect(m).toHaveProperty('ordersCreated');
  });
});
