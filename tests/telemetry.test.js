const { withSpan } = require('../utils/telemetry');

describe('telemetry withSpan helper', () => {
  test('executes function and returns value', async () => {
    const result = await withSpan('test.success', async (span) => {
      span.setAttribute && span.setAttribute('foo','bar');
      return 42;
    });
    expect(result).toBe(42);
  });

  test('propagates error and records exception', async () => {
    const err = new Error('boom');
    await expect(withSpan('test.error', async () => { throw err; })).rejects.toThrow('boom');
  });
});
