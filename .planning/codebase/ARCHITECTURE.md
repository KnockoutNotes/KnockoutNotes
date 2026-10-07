---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# ARCHITECTURE.md

**Analysis Date:** 2026-10-07

## Overview

Knockout Notes uses a monolith architecture split strictly between a Cloudflare Worker acting as the API/backend and a collection of static assets forming the frontend, optionally wrapped by Capacitor for Android.

## Patterns & Data Flow

1. **Frontend Rendering:**
   - Multi-page application structure but operated as an SPA via `spa-router.js`.
   - The router intercepts link clicks, fetches the next page HTML, parses it using `DOMParser`, and replaces the `main` content area, keeping persistent components (canvas, headers) alive.
2. **Data Layer (Backend):**
   - Cloudflare Worker (`worker/index.js`) processes API requests.
   - Modules separate concerns: `auth.js`, `cms.js`, `payments.js`, `pdf-generator.js`, `user-workspace.js`, `study-topics.js`.
3. **Data Flow:**
   - The frontend communicates with the Worker via `fetch` calls to specific routes (e.g., `/api/*`).
   - The Worker queries D1 (`knockoutnotes-db`) and returns JSON or generated files (PDFs).

## Abstractions & Entry Points

- **Frontend Entry Point:** `index.html`.
- **Backend Entry Point:** `worker/index.js` (Exported default object with a `fetch` handler).
- **Mobile Entry Point:** `android/app/src/main/java/com/knockoutnotes/app/MainActivity.java` and Capacitor configurations.

<!-- refreshed: 2026-10-07 -->
