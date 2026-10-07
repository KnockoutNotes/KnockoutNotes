---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# INTEGRATIONS.md

**Analysis Date:** 2026-10-07

## External APIs & Services

- **MailerSend:** Used for transactional emails (`worker/mailersend.js`). Noted environment variables in `wrangler.jsonc` include `FROM_EMAIL`.
- **Payment Providers (Stripe/PayPal):** Managed in `worker/payments.js` (and `payments-client.js`).
- **Cloudflare Services:**
  - **D1 (Database):** Primary relational data store (`worker/index.js`, `migrations/`).
  - **R2 (Object Storage):** For file management (`worker/files.js`).
  - **Cloudflare Web Analytics / Beacon:** Tracked via `cf-beacon.js`.

## Auth Providers

- Custom Authentication logic managed in `worker/auth.js`.

<!-- refreshed: 2026-10-07 -->
