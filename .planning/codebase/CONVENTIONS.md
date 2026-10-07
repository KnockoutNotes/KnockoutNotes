---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# CONVENTIONS.md

**Analysis Date:** 2026-10-07

## Code Style

- **Frontend:** Vanilla JavaScript (ES5/ES6) without a bundler. Code is directly included via `<script>` tags. Uses IIFE (Immediately Invoked Function Expressions) for scoping (e.g., in `spa-router.js`).
- **Backend (Worker):** Modern JavaScript (ES Modules / syntax supported by Cloudflare Workers). Clear separation into feature-specific files (`auth.js`, `cms.js`, etc.).

## Naming

- **Files:** Kebab-case is strictly used across frontend HTML, CSS, and JS files (`spa-router.js`, `border-glow.css`).
- **Variables/Functions:** camelCase in JavaScript.

## Patterns

- **SPA Routing:** Client-side navigation intercepts anchor clicks, fetches HTML, and swaps the DOM (`spa-router.js`) instead of full page reloads.
- **Modularity:** Frontend JS is split by feature/page (e.g., `regional-3d.js`, `advanced-calc-engine.js`).
- **Backend Handling:** Cloudflare Worker `fetch` event listener in `worker/index.js` acts as the main router, delegating to specialized handlers.

## Error Handling

- General `try/catch` blocks within the Cloudflare Worker. Responses are typically JSON with standard HTTP status codes.

<!-- refreshed: 2026-10-07 -->
