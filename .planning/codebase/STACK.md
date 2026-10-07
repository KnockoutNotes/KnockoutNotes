---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# STACK.md

**Analysis Date:** 2026-10-07

## Overview

Knockout Notes is a standalone vanilla web application built on Cloudflare Workers (Backend) and HTML/CSS/JS (Frontend) wrapped in Capacitor for Android distribution. 

## Frontend

- **Framework:** Vanilla HTML/CSS/JS (No frontend framework).
- **Architecture:** Multi-Page Application (MPA) enhanced with a custom `spa-router.js` for instant client-side navigation while keeping the outer shell (canvas, header, footer) persistent.
- **Styling:** Custom CSS.
- **Mobile Distribution:** Capacitor (`@capacitor/core`, `@capacitor/android`). Mobile bridge code in `mobile-bridge.js`.

## Backend

- **Environment:** Cloudflare Workers (`wrangler.jsonc`, `worker/index.js`).
- **Database:** Cloudflare D1 (SQL). 
- **Storage:** Cloudflare R2 (configured, but currently commented out in `wrangler.jsonc` pending bucket creation).
- **Static Assets:** Cloudflare Worker Assets binding (`ASSETS`).

## Dependencies

- `pdf-lib`, `@pdf-lib/fontkit` for PDF Generation.
- `qrcode-generator`, `jsqr` for QR codes.
- Capacitor core, network, app, and splash-screen plugins.

## Tooling

- **Build / Deploy:** `wrangler` for the backend, `npm run build:android` (Capacitor sync) for mobile.
- **No Bundler for Web:** HTML, CSS, and JS files are served directly as static assets.

<!-- refreshed: 2026-10-07 -->
