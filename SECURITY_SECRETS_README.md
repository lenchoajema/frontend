Secrets & CI Vault Guide

Purpose
- Explain how secrets are stored and consumed for local development, CI, and production.
- Provide a minimal example for GitHub Actions and docker-compose usage.

Status
- Committed secrets removed from the repository.
- A `.env.example` exists with placeholders. Do NOT commit real `.env` files.

Local developer workflow
1. Copy `.env.example` to `.env` in the repository root (this file is in `.gitignore`).
2. Fill in real values for local testing (use ephemeral test credentials).
   - Example: `MONGO_INITDB_ROOT_PASSWORD=localdevpwd`
3. Start services locally: `docker compose up -d --build`

CI / GitHub Actions
- Store secrets in the GitHub repo settings: Settings → Secrets → Actions.
  - Add secrets: `MONGO_URI`, `MONGO_INITDB_ROOT_PASSWORD`, `JWT_SECRET`, `REDIS_URL`, `STRIPE_SECRET_KEY`, etc.
- Example workflow shows how to run tests and pass secrets to docker-compose or to process env for test runs.

Production / Vault
- For production, use a secrets manager (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, or GitHub Environments) and inject secrets into runtime, not into images.
- Use short-lived credentials and rotate frequently.

Best practices
- Never commit `.env` or any secret to the repo.
- Use `.env.example` to document required variables and expected format.
- Limit the scope of any secret used by CI to only what the job needs.
- Audit who has access to production secrets.

CI Example (summary)
- The repo includes `.github/workflows/ci-secrets-example.yml` which demonstrates reading secrets from GitHub Actions and running tests with them.

Contact
- Repo maintainer /devops: assign in project board for secret onboarding.
