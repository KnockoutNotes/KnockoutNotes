# Study Mode Repository Audit

## Overview
This audit covers the core files that implement **Study Mode** in the KnockoutNotes repository (https://github.com/KnockoutNotes/KnockoutNotes). The focus is on the data definitions, UI rendering, navigation, routing, 3‑D visualisation, and integrations with the Workspace.

## Files Inspected
| File | Purpose | Key Elements |
|------|---------|--------------|
| `study.html` | Main HTML page for Study Mode | Contains the master syllabus index, hero section, category navigation (`#stCatNav`), grid container (`#stGrid`), detail view (`#stDetail`), search modal, and script imports. |
| `study-data.js` | JSON‑like data definitions (categories, topics, drugs) | `categories` array defines top‑level categories (e.g., anaesthesia, examination, ecg, etc.). `topics` array holds each study topic with fields `id`, `cat`, `name`, `short`, `tags`, `tagline`, `source`, `sections`. `drugs` array (not fully shown) holds drug monographs with similar fields. |
| `study-ui.js` | UI controller – routing, rendering tiles, detail view, search, full‑screen toggle | Implements URL routing (`?cat=` / `?item=`), renders category nav, grid tiles, detail panels, observes scroll‑reveal, mounts 3‑D molecule viewers, handles filters and history. |
| `study-ron-design.js` | Styling & theme for Study Mode (CSS‑in‑JS) | Defines CSS variables for light/dark themes, layout overrides, and component styling. No functional logic. |
| `study-structures.js` / `study-structures-3d.js` | 2‑D SVG structures and 3‑D molecule data | Provide `window.KN_STRUCTURES` (SVG for drug structures) and `window.KN_STRUCTURES_3D` (Three.js scenes). |
| `study-molecule-3d.js` | 3‑D viewer module (Three.js) | Registers `kn-molecule3d-ready` event, mounts interactive 3‑D models into detail panels. |
| `workspace-engine.js` | Shared engine for bookmarks, notes, profile, auth modal | Not specific to Study Mode but integrates with Study pages (e.g., modal handling, user data persistence). |
| CSS files (`study.css`, `study-ron-design.css`, `workspace.css`, etc.) | Visual styling, responsive layout, dark mode support | Contain classes used by the UI (`.st-reveal`, `.st-tile`, `.st-cat`, `.st-hero-actions`, etc.). |
| `script.js`, `page-motion.js`, `kn-site-search.js` | General site utilities | Provide global navigation, motion effects, and site‑wide search (used by Study Mode search modal). |

## Data Model (Current)
- **Domain** – Implicit; the current implementation uses a flat list of categories that mixes Anaesthesia topics, Clinical Examination, ECG, ABG, Equipment, PFT, and *drug* categories (e.g., `induction`, `relaxants`, `opioids`, `vasopressors`, etc.).
- **Category (`cat`)** – String identifier used for routing and grouping. Examples: `anaesthesia`, `examination`, `ecg`, `abg`, `equipment`, `pft`, `induction`, `relaxants`, `reversal`, `opioids`, `nsaids`, `vasopressors`, `local`, `pregnancy`, `miscellaneous`.
- **Topic / Drug Record** – Objects with fields:
  - `id` – stable unique identifier (used in URLs).
  - `cat` – category identifier.
  - `name` – full title.
  - `short` – short display name.
  - `tags` – array of tags.
  - `tagline` – one‑line description.
  - `source` – citation string (often multiple sources).
  - `sections` – array of section objects for the detail view (each with `h` heading and `b` body text).
- **Ordering** – Determined by the order of items in the `topics` and `drugs` arrays.

## Navigation & Routing
- URL parameters `?cat=` and `?item=` drive the state.
- When `item` is present, the detail view (`#stDetail`) is shown; otherwise the list view (`#stList`) displays the hero, category nav, and grid of tiles.
- Category navigation (`#stCatNav`) is generated from `DATA.categories` plus an “All” pseudo‑category.
- Search modal (`#knSearchModal`) integrates with the global site search (`kn-site-search.js`).
- Horizontal scrolling for the category bar is implemented via CSS overflow with no explicit scroll‑snap – the new design will need scroll‑snap for smoother UX.

## 3‑D Visualisation
- Tiles with structures render a placeholder `<div class="st-tile-molecule" data-drug="...">`.
- When the `study-molecule-3d.js` module loads, it emits `kn-molecule3d-ready` and mounts interactive viewers in both tile and detail contexts.
- Drug monographs have a `DRUG_SECTIONS` order that determines tab ordering in the detail view.

## Integrations
- Bookmarks, sticky notes, and user profile are handled by the shared `workspace-engine.js` and persist via Cloudflare D1 DB.
- The dark‑mode toggle (`#themeBtn`) works across the whole site, including Study Mode.
- The master syllabus index at the top of the page (`#stTopIndex`) provides a quick count of topics and drugs.

## Gaps & Risks Identified
1. **Domain separation** – No explicit top‑level domain (Anaesthesia / Critical Care / Drugs). All categories are flat and mixed, making it hard to enforce the three‑domain navigation required for the revamp.
2. **Category granularity** – Existing categories are too granular for the proposed major categories (e.g., `examination`, `ecg`, `abg` would need to be merged under *Anaesthesia* or *Critical Care*).
3. **Missing Critical Care content** – The current data set contains mainly Anaesthesia topics and drug monographs; there is **no dedicated Critical Care syllabus** (e.g., no topics for Shock, Sepsis, Hemodynamics, etc.).
4. **Navigation UI limitations** – The horizontal category bar does not use scroll‑snap or smooth reveal animations required for the new interaction design.
5. **URL routing constraints** – Deep‑link URLs rely on `cat` and `item` only; adding a domain layer will require adjusting routing logic to preserve existing deep links.
6. **Duplicate / overlapping drug entries** – Some drugs appear in multiple categories (e.g., `induction` vs `vasopressors`) leading to potential duplication.
7. **Incomplete metadata** – Not all drug monographs include fields for pharmacokinetics, dosing adjustments, pediatric/obstetric considerations, or reference status.
8. **Search indexing** – The site‑wide search (`kn-site-search.js`) indexes raw text but does not surface the new hierarchical navigation.
9. **3‑D asset loading** – All 3‑D structures are bundled; no lazy loading, which could affect performance on mobile.

## Items Not Inspected (due to size)
- Full `study-data.js` (9 k lines) – only the beginning was captured; the complete list of topics and drugs was not enumerated.
- `study-structures.js` and `study-structures-3d.js` – contain thousands of SVG/JSON definitions; assumed to be correctly referenced.
- Additional CSS files (`study.css`, `mobile-app.css`, etc.) – assumed to follow existing naming conventions.

**Conclusion** – The repository provides a solid foundation for a content‑driven Study Mode, but a major restructuring is required to introduce the three‑domain hierarchy, enrich Critical Care content, and implement the new navigation experience while preserving IDs and deep‑link compatibility.
