# Security Checklist (Initial Draft)

Status legend: [ ] pending  [~] partial  [x] complete

## Platform Hardening
- [x] HTTP security headers (helmet)
- [x] Rate limiting (global apiLimiter)
- [x] Input sanitization (express-mongo-sanitize, xss-clean)
- [ ] CSRF protection (evaluate: cookie-based flows)
- [ ] CORS strict origin allow-list for production domain (currently dev origins)

## Authentication & Session
- [~] Access & refresh tokens (in-memory refresh; replace with DB/Redis)
- [ ] Password hashing with bcrypt on real User persistence (stub memory store now)
- [ ] Refresh token rotation & reuse detection
- [ ] Logout all sessions / token revocation list

## Authorization / RBAC
- [~] Admin gating (stubs; needs centralized middleware + declarative policy map)
- [ ] Resource-level ownership checks (products, orders)

## Data Validation
- [~] Product CRUD validation (basic presence checks; needs schema-level validation & JOI / Zod)
- [ ] Centralized validation middleware with consistent error shape

## Payments
- [~] Capability toggle + provider disable path
- [ ] Stripe webhook signature verification
- [ ] Idempotency keys for payment intent/order creation
- [ ] Audit log for payment admin changes

## Logging & Monitoring
- [x] Structured logging (pino)
- [~] Request tracing file (rotation minimal; needs retention policy)
- [ ] Audit log channel (security events)
- [ ] Metrics / health probes (expand with latency histograms)

## Secrets & Config
- [ ] Enforce required env vars in production start (fail fast)
- [ ] Secrets scanning in CI (e.g., gitleaks / trufflehog)

## Dependency & Supply Chain
- [ ] npm audit / scanning in CI
- [ ] Pin high-risk packages or use lockfile integrity verification

## Database Security
- [ ] Connection encryption enforcement (TLS) & auth (depends on deployment)
- [ ] Query performance & injection fuzz tests

## Misc
- [ ] Content Security Policy (CSP) configuration
- [ ] Rate limit sensitive endpoints separately (login, refresh)
- [ ] Brute-force protection / account lockout

---
Generated: Initial draft (will evolve with implementation).
