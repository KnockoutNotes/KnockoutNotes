---
name: knockoutnotes-website
description: Project-specific development instructions for the Knockout Notes medical education website, including its architecture, coding conventions, design consistency, performance, accessibility, deployment and content requirements.
---

# Knockout Notes — Project Development Guide

This skill documents the verified architecture, tech stack, design conventions, clinical safeguards, and deployment workflows for the Knockout Notes medical education and anaesthesia platform.

---

## 1. Verified Architecture & Tech Stack

Never assume external frameworks (such as React, Vue, Angular, or Next.js) exist in this project. The verified stack is:

- **Frontend Core**:
  - Semantic HTML5, modern modular CSS3, and vanilla ECMAScript (ES6+).
  - Client-side routing: Handled via `spa-router.js` managing views, hash/path navigation, and DOM mounting without full page reloads.
  - Interactive Engines: Dedicated vanilla JS engines for specialized clinical tools:
    - Arterial Blood Gas: `abg-engine.js`
    - Anaesthesia Calculators: `advanced-calc-engine.js`, `advanced-calc-ui.js`, `calculators.js`
    - Paediatric Charts & Emergency Doses: `paeds-chart-engine.js`, `paeds-pdf-export.js`
    - Resuscitation & Crisis: `resuscitation-chamber.js`, `crisis.js`
    - 3D & Spatial Anatomy: `regional-3d.js`, `regional-sono.js`, `study-structures-3d.js`, `ventilator-scene.js`, `spatial-camera.js`, `spatial-viewer.js`
- **Content Management Architecture**:
  - **Dual Content Model**:
    1. *Live Educational Content*: Synchronized from Google Sheets published as CSV (`sheet-config.js` -> `KNOCKOUTNOTES_SHEET_CSV`), parsed by `content-library.js` for Pearls, Notes, Viva, Drugs, and Critical Care sections. This enables instant editorial updates without code redeployment.
    2. *Relational & Application Data*: Stored in Cloudflare D1 SQL database (`knockoutnotes-db`) managed via migrations in `migrations/`.
- **Backend & Cloudflare Edge**:
  - Runtime: Cloudflare Workers configured in `wrangler.jsonc` (`compatibility_date: 2026-09-09`).
  - Worker entry point: `worker/index.js` with modular handlers:
    - `worker/auth.js`: Session and admin authentication.
    - `worker/cms.js`: CMS API endpoints and subscriber management.
    - `worker/mailersend.js` & `worker/email-templates.js`: Transactional email delivery via MailerSend API.
    - `worker/files.js`: File management with optional Cloudflare R2 storage binding (`knockoutnotes-media`).
    - `worker/regional-images.js`: Ultrasound and regional anaesthesia image handling.
    - `worker/analytics.js`: Anonymous edge analytics.
- **Admin Suite**:
  - Dedicated admin interface located in `/admin/` (`admin/index.html`, `admin/admin.js`, `admin/admin.css`, `admin/login.html`).
- **Testing & Verification**:
  - Python-based test suite in `tests/` covering calculators, crisis tools, policy pages, subscription systems, and SPA router behavior.

---

## 2. Directory Structure & Key Files

```text
KnockoutNotes/
├── index.html                   # Main entry point & homepage
├── calculators.html / .js / .css# Clinical calculator suite
├── crisis.html / .js / .css     # Anaesthetic emergency crisis manuals
├── resuscitation-chamber.html   # Critical resuscitation workflows
├── regional-anaesthesia.html    # Regional nerve blocks & sonoanatomy
├── ventilator.html              # Interactive mechanical ventilation simulator
├── study.html / .js / .css      # Interactive study modules & 3D pharmacology
├── pearls.html, notes.html...   # Content library views (CSV-driven)
├── spa-router.js                # Client-side single page navigation
├── sheet-config.js              # Published Google Sheet CSV endpoint config
├── content-library.js           # Dynamic CSV parsing & card rendering
├── admin/                       # Administrative console & CMS UI
├── worker/                      # Cloudflare Workers backend APIs
├── migrations/                  # Cloudflare D1 SQL schema migrations
├── tests/                       # Python test suite & verification scripts
└── wrangler.jsonc               # Cloudflare deployment & bindings configuration
```

---

## 3. UI/UX, Design Consistency & Accessibility

- **Visual Theme**: Dark cyber-medical theme with subtle glassmorphic cards, glow accents (`border-glow.css`), floating bubble navigation (`bubble-menu.css`), and smooth transitions.
- **Responsiveness**:
  - Every UI component and layout must be fully responsive across mobile (<600px), tablet (600–1024px), and desktop (>1024px).
  - Use flexible grid/flexbox layouts and touch-friendly targets (minimum 44x44px for buttons and touch targets).
- **Accessibility (a11y)**:
  - Maintain WCAG AA/AAA color contrast against dark backgrounds (`#0a0e17`, `#121826`, etc.).
  - Use semantic HTML tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`).
  - Ensure all interactive modals, calculators, and sliders are keyboard-accessible with visible focus rings and appropriate `aria-*` attributes.
- **Performance**:
  - Keep frontend assets lightweight. Avoid pulling heavy external client libraries or CSS frameworks.
  - Prefer native browser APIs, CSS transitions, and requestAnimationFrame for animations.

---

## 4. Medical Educational Content Rigor

- **Clinical Accuracy**:
  - All anaesthetic and intensive care calculations (drug dosages, infusion rates, Paediatric airway sizes, defibrillation energies) must be accurate and validated against standard references.
  - Explicitly document units for all numbers (e.g., `mg/kg`, `mcg/kg/min`, `mL/hr`, `J/kg`).
- **Authoritative Guidelines**:
  - Base recommendations on established anaesthesia guidelines (e.g., DAS, ERC, Resuscitation Council UK, ASA, Difficult Airway Society, AAGBI).
  - Clearly differentiate established clinical recommendations from institutional practice or emerging evidence.
- **Zero Hallucination**:
  - Never invent clinical citations, drug dosing parameters, or medical evidence.
  - Maintain populated `Reference` fields for all educational entries.

---

## 5. Security, Secrets & Cloudflare Edge Rules

- **Protect Secrets**:
  - Never place API keys, private passwords, MailerSend API credentials, or authentication tokens into client-side JS or the public Google Sheet.
  - Store sensitive secrets only in Cloudflare Worker environment variables or Wrangler secrets.
- **D1 Database Safeguards**:
  - Use parameterized SQL queries for all D1 database operations in `worker/` to prevent SQL injection.
  - Never modify existing database schemas, migration files, or drop tables without an explicit, approved plan.
- **Protected Systems**:
  - Do not alter payment processing, checkout links, authentication tokens, webhooks, or Cloudflare DNS/routing settings unless specifically directed.

---

## 6. Development Workflow & Verification

1. **Impact Assessment**: Before making changes, identify all affected HTML pages, JS modules, or Worker endpoints.
2. **Minimal & Idiomatic Edits**: Match existing naming conventions (`kebab-case` for CSS classes and files, `camelCase` for JS functions and variables).
3. **Targeted Verification**:
   - For calculators or core algorithms, execute the relevant Python test in `tests/` (e.g., `python tests/calculator_tests.py` or `python tests/test_advanced_calculators.py`).
   - For Worker logic, verify using Wrangler local testing or specific script verifications.
4. **No Unrequested Redesigns**: Do not initiate site-wide visual redesigns or refactor functioning modules unless explicitly requested.
