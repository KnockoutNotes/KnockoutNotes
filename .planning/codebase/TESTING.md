---
last_mapped_commit: a2b1b4cb73fa9edd83badfe95a4c5d603d9926ca
last_mapped_at: 2026-10-07
---
# TESTING.md

**Analysis Date:** 2026-10-07

## Frameworks & Structure

- **Location:** All tests are located in the `tests/` directory.
- **Languages/Tools:** 
  - **Python:** Heavy use of Python for verification and testing (e.g., `test_advanced_calculators.py`, `test_crisis_calculators.py`, `verify_spa_router.py`). Likely utilizing `requests` or a browser automation framework (Selenium/Playwright) to validate the frontend behavior and APIs.
  - **JavaScript:** Used for specific backend/API integration tests (e.g., `test_cashfree_webhook_and_admin_pricing.js`, `test_google_oauth_security.js`).

## Practices

- Verification scripts (`verify_*.py`) are used to ensure structural and behavioral constraints (e.g., `verify_mount_points.py`, `verify_responsive_nav.py`).
- Testing covers critical logic such as calculators, authentication (OAuth), webhooks, subscriptions, and SPA router integrity.

<!-- refreshed: 2026-10-07 -->
