---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# CONCERNS.md

**Analysis Date:** 2026-10-07

## Technical Debt & Fragile Areas

- **Manual DOM Manipulation / Vanilla JS:** The frontend relies heavily on vanilla JavaScript for complex behaviors (calculators, 3D structures, UI interactions). As complexity grows, managing state and DOM updates without a framework (like React or Vue) can become fragile and difficult to maintain.
- **Custom SPA Router:** The `spa-router.js` intercepts links and swaps HTML chunks manually. This requires strict adherence to HTML structures and IDs (`#knSpatialCanvas`, `main`). Changes to the shell layout can easily break the router.
- **Global Scope Pollution:** With many script files loaded directly in the browser without a module bundler, there is a risk of variable collisions in the global scope if IIFEs or strict conventions are not perfectly followed.
- **Cloudflare R2 Pending Setup:** The R2 binding is commented out in `wrangler.jsonc` indicating that file uploading/storage may not be fully deployed or tested in the current environment yet.

## Security

- Authentication relies on custom implementations in `worker/auth.js`. Must ensure token validation, CSRF protections, and session management are robust.
- The use of `innerHTML` or `DOMParser` in the custom SPA router must strictly sanitize inputs if rendering user-generated content to prevent XSS.

## Performance

- Loading multiple large scripts (`pdf-lib`, 3D engines, calculators) without bundling or tree-shaking might impact initial load times on slow connections, though client-side routing mitigates this after the initial load.

<!-- refreshed: 2026-10-07 -->
