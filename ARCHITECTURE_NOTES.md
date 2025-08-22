# Architecture & Scaling Wave (Weeks 8–13) Progress

## API Gateway (Planned Week 5, foundational doc)
- Planned tool: Kong (OSS) with declarative config
- Auth plugin: JWT validation pointing at internal auth service (future extraction)
- Rate limiting: Per-IP + per-user buckets mapped via Redis
- Routing: All /api/* paths proxied; internal services on private network only
- Observability: Enable request/latency metrics -> Prometheus/Grafana

## Current State
- Monolithic Express app acts as edge; rateLimiter middleware currently a stub (will swap post-Gateway)
- Stripe payments & webhook logic encapsulated in controller (easier extraction later)
- Idempotency patterns introduced (order + payment intent) to support safe retries through gateway

## Scaling Roadmap
1. Extract payments service (queue-based webhook processing) after stabilizing order lifecycle.
2. Introduce product catalog read replica + Redis layer for high read endpoints.
3. Implement structured event bus (Kafka or NATS) for order events (created, payment_succeeded, cancelled).
4. Horizontal pod autoscaling rules: CPU 60%, p95 latency alarm backpressure.

## Order Lifecycle Enhancements (Implemented)
- Added Order.idemKey for idempotent create-order POSTs.
- Timeline events stored per order: created, idempotent_reuse, payment_intent_created, payment_attempt_failed, failed.

## Next Steps
- Persist payment success event in webhook handler once DB connected.
- Replace in-process timeline updates with event bus emission.
- Add reconciliation job skeleton (compare intents vs orders daily).
