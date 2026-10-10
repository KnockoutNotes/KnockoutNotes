# Knockout Notes — Previous Year Questions (PYQ) Design System & Architecture

## Overview
This specification documents the reusable visual conventions, interaction patterns, responsive layouts, and data schemas for the **Previous Year Questions (PYQs)** engine across the Knockout Notes platform.

Any future specialty question banks (e.g. INI-SS, EDIC, Fellowship, Anaesthesia) can reuse this exact design system without re-engineering components from scratch.

---

## 1. Visual Hierarchy & Design Tokens

### Color Palette (Tailwind & Knockout Notes Aligned)
- **Primary / Brand Accent:** Sky-500 (`#0284c7`), Sky-400 (`#38bdf8`), Blue-700 (`#1d4ed8`).
- **Dark Surface Backgrounds:** Slate-950 (`#020617`), Slate-900 (`#0f172a`), Slate-800 (`#1e293b`).
- **Borders & Dividers:** `rgba(56, 189, 248, 0.22)` (sky accent border), `rgba(255, 255, 255, 0.08)` (subtle neutral).
- **Text Levels:**
  - Headings / Question Stems: Slate-50 (`#f8fafc`) / Slate-100 (`#f1f5f9`), font-weight 600–800.
  - Subtitles / Badges: Slate-400 (`#94a3b8`), Slate-300 (`#cbd5e1`).
  - Metadata / Captions: Slate-500 (`#64748b`).
- **Semantic Feedback:**
  - Success / Correct Answer / High Confidence: Emerald-500 (`#10b981`), Emerald-400 (`#34d399`), background `rgba(16, 185, 129, 0.15)`.
  - Wrong Selection: Red-500 (`#ef4444`), Red-300 (`#fca5a5`), background `rgba(239, 68, 68, 0.18)`.
  - High-Yield Takeaway / Warning: Amber-500 (`#f59e0b`), Amber-200 (`#fde68a`), background `rgba(245, 158, 11, 0.08)`.

---

## 2. Component Structure

### A. Question Bank Header Card (`.kn-pyq-header-card`)
- **Container:** Glassmorphic slate card (`backdrop-filter: blur(14px)`), rounded corners (`18px`), inner subtle glow.
- **Top Bar:**
  - Left: Main title (H2, 22px bold) + Subtitle (13.5px muted).
  - Right: Prominent pill button for JSON export (`.kn-pyq-download-btn`).
- **4-Box Stats HUD (`.kn-pyq-stats-grid`):**
  - Metric 1: **TOTAL QS** (Total question count for current filter).
  - Metric 2: **EXAM TARGET** (Examination year and target).
  - Metric 3: **SPECIALTY** (Specialty title).
  - Metric 4: **SCHEMA** (Knockout V03 verified schema).
  - *Layout:* 4 columns on desktop, 2 columns on mobile (`<= 768px`).

### B. Interactive Controls Wrap (`.kn-pyq-controls-wrap`)
- **Examination Year Selector (`.kn-pyq-pill-group`):**
  - Pill buttons: `All Years (Count)`, `2025 (Count)`, `2024 (Count)`.
  - Active button: Solid Royal Blue (`#1d4ed8`), white text, crisp shadow.
- **Viewing Mode Switcher:**
  - `🗂️ Topic-wise Explorer` (default interactive view).
  - `📋 All Questions` (sequential practice list with question palette).
- **Search Field (`.kn-pyq-search-wrap`):**
  - Full-width pill input with clear button (`×`) and live debounce.

### C. Topic Filter Chips Track (`.kn-pyq-chips-track`)
- **Desktop:** Natural flex-wrapping or smooth scrolling with compact pill chips.
- **Mobile (`<= 768px`):** Smooth horizontal swipe with `-webkit-overflow-scrolling: touch; scrollbar-width: none;`.
- **States:** Inactive has slate border; Active has `#1d4ed8` fill with `#38bdf8` outline and white text.

### D. Question Cards (`.kn-pyq-card`)
- **Resting State:** Elevation `0 4px 16px -2px rgba(2, 6, 23, 0.35)`, border `1px solid rgba(255, 255, 255, 0.08)`.
- **Hover State (Desktop):** Slight lift (`translateY(-1px)`), border `rgba(56, 189, 248, 0.35)`.
- **Badges Row (`.kn-pyq-badges-row`):**
  - Left group: Question number (`Q#` / Sky), Topic (`Dark Slate`), Examination Year (`Slate`).
  - Right group: Recall Confidence Badge (`High (100% agreement)` / Emerald; `Verified (Faculty Consensus)` / Azure).
- **Question Stem (`.kn-pyq-stem`):**
  - Comfortable reading measure, line-height 1.55, text color `#f1f5f9`.
- **Toggle Control (`.kn-pyq-card-toggle`):**
  - Accessible button indicator: `▼ View Options, Answer & Pearls` / `▲ Hide Options & Explanation`.

### E. Expanded Question Details (`.kn-pyq-card-body`)
- **Options List (`.kn-pyq-options-grid`):**
  - 4 interactive option cards with minimum 44px tap height for touch devices.
  - Option key pill (`A`, `B`, `C`, `D`).
  - Dynamic rationales displayed upon selection or answer verification.
- **Verified Answer Banner (`.kn-pyq-verified-banner`):**
  - Emerald highlight confirming faculty-verified key.
- **Clinical Synthesis Box (`.kn-pyq-expl-box`):**
  - In-depth medical evidence, guideline citations, and physiological rationale.
- **High-Yield Takeaway Callout (`.kn-pyq-pearl-box`):**
  - 4px amber border, dark amber glow, bulleted takeaways.
- **Source Footer (`.kn-pyq-meta-footer`):**
  - Subtopic taxonomy and verified external source link.

---

## 3. Responsive Breakpoints

| Breakpoint | Target Devices | Layout Behavior |
| :--- | :--- | :--- |
| **`> 1040px`** | Windows Desktop / High-res monitors | Centered 1040px max-width container, 4-col stats HUD, wrapping topic chips |
| **`768px – 1040px`** | Tablets & small laptops | Full container width with 20px padding, 4-col or 2-col HUD |
| **`480px – 768px`** | Large mobile / phablets | 2-col stats HUD, horizontally scrollable topic chips, single-column question cards |
| **`< 480px`** | Compact phones (Android / iPhone) | Stacked switcher pills, 2-col compact stats, 14px card padding, zero horizontal overflow |

---

## 4. Accessibility & Performance (WCAG 2.1 AA)

1. **Touch Targets:** Minimum 44×44px interactive tap area on mobile for option buttons, pill switchers, and pagination.
2. **Keyboard Focus:** High-contrast focus outline (`:focus-visible { outline: 2px solid #38bdf8; outline-offset: 2px; }`) on all controls.
3. **Screen Readers:** ARIA attributes (`role="tablist"`, `aria-label`, `aria-expanded`) on expandable cards and mode switches.
4. **Reduced Motion:** Fully respects `@media (prefers-reduced-motion: reduce)` by disabling transforms and transitions.
5. **Memory & DOM Performance:** Paged rendering (`pageSize: 10`) ensures smooth 60fps scrolling and instant filtering across large question banks.
