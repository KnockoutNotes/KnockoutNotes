---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# STRUCTURE.md

**Analysis Date:** 2026-10-07

## Directory Layout

- `/`: Root contains the static frontend files (`.html`, `.css`, `.js`), configuration files (`wrangler.jsonc`, `package.json`), and markdown documentation.
- `worker/`: Cloudflare Worker backend source code (`index.js`, `auth.js`, `cms.js`, etc.).
- `api/`: Likely API definitions or static mocks (requires further inspection, possibly legacy or shared types).
- `migrations/`: SQL migration files for Cloudflare D1.
- `android/`: Capacitor Android project files (Java/Gradle structure).
- `assets/`: Static image/media assets used in the application.
- `admin/`: Admin panel frontend files.
- `.planning/`: GSD core project planning and context artifacts.

## Key Locations

- **Backend Router:** `worker/index.js`
- **Frontend SPA Router:** `spa-router.js`
- **Database Schema:** `migrations/`
- **Cloudflare Config:** `wrangler.jsonc`

## Naming Conventions

- Hyphen-separated filenames (kebab-case) for HTML, CSS, and JS files (`spa-router.js`, `critical-care.html`).
- Standard Node.js conventions for the worker (`index.js`).

<!-- refreshed: 2026-10-07 -->
