# Architecture & Scaling Roadmap (Waves 4–13)

This document complements `action plan.md` with implementation-oriented notes for Core Commerce & Payments (Weeks 4–7) and Architecture & Scaling (Weeks 8–13).

## Core Commerce & Payments (Weeks 4–7)
- Order Idempotency: Implemented in `paymentsRoutes.js` (lookup by user + idemKey) before creating new order.
- Payment Intent Mapping: `stripeController.js` stores paymentIntent->orderId mapping and webhook updates Order status (future: persist status transitions to timeline events when DB connected).
- Failure Handling (Planned): Introduce retry/backoff and compensation (mark order Failed + event) when payment intent creation errors (currently returns 500; will wrap with structured error codes).
- Order Timeline: Schema supports `timeline[]`; initial `created` event inserted.

## Architecture & Scaling (Weeks 8–13)
- API Gateway (Planned): Kong or Envoy in front of backend. All public endpoints proxied (`/api/*`). Rate limiting, auth plugin offloaded. Internal services to migrate behind gateway incrementally.
- Service Extraction Targets: Payments (webhook + intent logic), Auth (JWT + refresh), Catalog (products & search), Orders (idempotent create + status updates).
- Observability: Future addition of OpenTelemetry instrumentation (Week 6 baseline) to trace request → payment intent creation.
- Caching Strategy: Redis for idempotency, token store, future product listing caching and capability toggles. Evaluate per-route TTL and cache bust hooks.
- Scaling Considerations: Stateless backend (sessionless JWT), Redis as shared state for ephemeral keys, horizontal POD scaling once moved to K8s (Week 12–13 tasks). Sticky sessions not required.
- Disaster Recovery Prep: Ensure capability + intent mapping keys have clear prefixes for selective flush; daily backups of Mongo planned in DR wave.

## Next Steps
1. Add payment failure simulation test and ensure order timeline adds `payment_failed` event.
2. Add optimistic `payment_intent_created` timeline event when Stripe intent created (only if configured) & `payment_succeeded` on webhook success.
3. Add structured error codes for payment errors (`code: PAYMENT_CONFIG_MISSING`, etc.) for frontend resilience.
4. Implement gateway configuration manifests (Kong declarative file) and add to repo.
5. Add OpenTelemetry instrumentation around order create + payment intent.

---
This file is a living technical companion to the high-level action plan.
