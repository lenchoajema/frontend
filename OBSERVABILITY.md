# Observability (Tracing & Metrics)

This backend integrates OpenTelemetry for distributed tracing and (foundational) metrics. Instrumentation is intentionally minimal and environment‑driven so it is safe to enable in any environment without code changes.

## Quick Start

1. Set an endpoint (collector, APM vendor, etc.):
   ```bash
   export OTEL_EXPORTER_OTLP_ENDPOINT="https://otel-collector.example.com"
   ```
2. (Optional) Add headers if your vendor / gateway needs them:
   ```bash
   export OTEL_EXPORTER_OTLP_HEADERS='{"x-api-key":"your-key"}'
   ```
3. (Optional) Set service name (default: `ecommerce-backend`):
   ```bash
   export OTEL_SERVICE_NAME="ecommerce-backend"
   ```
4. Start the backend. The SDK starts on first `initTelemetry()` call (during server bootstrap / tests).

If no endpoint is provided the SDK still starts (auto‑instrumentations only) but nothing is exported externally.

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| OTEL_EXPORTER_OTLP_ENDPOINT | Base OTLP HTTP endpoint (no trailing slash required) | `https://otel-collector:4318` |
| OTEL_EXPORTER_OTLP_HEADERS  | JSON object of additional headers for OTLP requests | `{"authorization":"Bearer TOKEN"}` |
| OTEL_SERVICE_NAME | Logical service identifier (resource attribute) | `ecommerce-backend` |
| OTEL_TRACER_NAME  | (Optional) Tracer name override (default `app`) | `backend-tracer` |

## Implementation Overview

Code: `utils/telemetry.js`

Key pieces:
- Lazy initialization via `initTelemetry()` using `@opentelemetry/sdk-node`.
- Auto‑instrumentations: enabled through `getNodeAutoInstrumentations()` (HTTP, DNS, etc.).
- OTLP exporters (traces + metrics) created only if `OTEL_EXPORTER_OTLP_ENDPOINT` is set.
- Safe fallbacks: if exporter or SDK init fails, no‑op counters are still exposed (tests / app code remain stable).

## Helper APIs

| Function | Description |
|----------|-------------|
| `withSpan(name, fn, attrs?)` | Runs async logic inside a span; captures exceptions and sets span status. Returns your fn's resolved value. |
| `record(metricKey, value=1, attrs?)` | Increments a defined counter by `value` (ignored if metrics disabled). |
| `getMetrics()` | Returns the internal counter objects (primarily for tests). |
| `shutdownTelemetry()` | Graceful shutdown (flush exporters) on process exit / tests. |

## Metrics (Counters)

| Metric Key | Description |
|------------|-------------|
| `payments.intent.created` | Payment intents successfully created (stub or real) |
| `payments.intent.failed`  | Payment intent creation failures (real or simulated) |
| `orders.created`          | Orders created (new persistence event) |
| `orders.idempotent_reuse` | Idempotent order reuse occurrences |

All counters are added only after the SDK starts successfully; before that they exist as no‑ops so calling `record()` is always safe.

### Adding New Metrics
1. Declare a new counter inside the `initTelemetry()` meter section, following existing naming (`domain.action.outcome`).
2. Reference it via `record('metricKey', value, { optional: 'attr' })`.
3. Avoid creating counters outside `initTelemetry()` to ensure they are bound to the real meter.

Consider reserving dot‑separated namespaces:
- `payments.*`
- `orders.*`
- `auth.*`
- `catalog.*`

### Histograms / Latency (Planned)
To capture latency distributions (e.g., payment intent creation duration) add:
```js
const createPaymentLatency = meterApi.createHistogram('payments.intent.create_ms', { description: 'Duration of payment intent creation in ms' });
// then
const start = performance.now();
// ... work ...
createPaymentLatency.record(performance.now() - start, { provider: 'stripe' });
```
(Implementation deferred until we finalize which operations merit histograms.)

## Tracing Usage

Wrap domain operations for consistent spans:
```js
const { withSpan } = require('../utils/telemetry');

await withSpan('payments.create_intent', async (span) => {
  span.setAttribute('payment.provider', 'stripe');
  // perform creation
});
```
Errors thrown inside `withSpan` automatically record exception & set status code=2 (ERROR) before rethrowing.

### Adding Attributes & Events
```js
span.setAttribute('orders.idempotent', true);
span.addEvent('orders.payment.intent.reused', { orderId });
```

## Failure Resilience
- If exporter init fails: logged once via console.warn, app logic proceeds.
- If metrics creation fails: counters degrade to no‑ops.
- Tests rely on `getMetrics()`; they remain green even when metrics disabled.

## Local Development Without Collector
No environment variables needed. Spans are created (in memory) but not exported; counters are inert. This keeps developer setup friction low.

To verify instrumentation locally you can temporarily add a console span processor (not currently included to keep noise low) or run an ephemeral collector:
```bash
docker run -p 4318:4318 otel/opentelemetry-collector-contrib:latest
```
Then export `OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318` and restart the server.

## Roadmap / Next Steps
- Add histogram metrics for latency (orders & payment providers).
- Expand counters: `payments.intent.succeeded`, `payments.refund.created`.
- Add spans for PayPal capture/refund internals & webhooks.
- Provide example Grafana / Prometheus pipeline (if we add Prometheus exporter) or example vendor dashboards.

---
Questions or improvements? Open an issue referencing this document.
