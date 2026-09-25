/* ==========================================================================
   KNOCKOUTNOTES — Study Mode page controller (study-ui.js)
   Category tabs → tile grid → detail view, routed by ?cat= / ?item= / ?tab=
   with history.pushState. Drug monographs get a 7-tab detail view; general
   anaesthesia topics get a single scrolling structured-notes view. Every
   detail view shows its source citation banner at the top. Includes a
   full-screen toggle for the whole study stage.
   ========================================================================== */
(function () {
  "use strict";

  const DATA = window.KN_STUDY;
  // Every drug section renders in one continuous scroll now (no tabs) —
  // this list just drives the order of each card in drugFullPanelHTML().
  const DRUG_SECTIONS = ["overview", "structure", "pd", "pk", "dosage", "offlabel", "complications"];

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  // Auto-emphasis for reading content: bold+underline dosages/numeric values
  // with units, and a short list of safety-critical phrases, so the key
  // facts jump out of the prose without needing a separate callout box.
  const HIGHLIGHT_RE = new RegExp(
    "\\d+(?:\\.\\d+)?(?:\\s?[\\u2013-]\\s?\\d+(?:\\.\\d+)?)?\\s?" +
      "(?:mg\\/kg\\/min|mcg\\/kg\\/min|mg\\/kg\\/h(?:r)?|mcg\\/kg\\/h(?:r)?|units?\\/kg\\/h(?:r)?|" +
      "mg\\/kg|mcg\\/kg|mg\\/min|mcg\\/min|mL\\/kg|ml\\/kg|mEq\\/kg|mg|mcg|g\\/kg|g|mL|ml|units?|IU|mEq|" +
      "mmHg|bpm|minutes?|mins?|hours?|hrs?|seconds?|secs?|%)" +
      "|\\b(?:contraindicated|black[\\s-]box warning|boxed warning|do not (?:administer|give|use)|" +
      "never give|never use|avoid in|life-threatening|malignant hyperthermia|anaphylaxis|" +
      "status epilepticus|FDA-approved|off-label|first-line|second-line)\\b",
    "gi"
  );
  function highlightKeyValues(escapedText) {
    return escapedText.replace(HIGHLIGHT_RE, (m) => `<strong><u>${m}</u></strong>`);
  }

  // Simple line-icon set (currentColor, so it tints against each category's
  // poster gradient) used on grid tiles and the detail hero in place of a
  // flat emoji glyph.
  // Filled, shaded illustrations (not just thin line-art) — real web images
  // aren't fetchable from this environment (network egress is blocked for
  // this session), so these lean into more literal, dimensional shapes
  // instead: layered opacity for shading, texture strokes, small highlights.
  const CAT_ICON_SVG = {
    anaesthesia: '<svg viewBox="0 0 48 48"><path d="M24 6v13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M24 19c-1-5-7-6-11-3-4 3-5 12-3 18 2 5 8 6 11 2 1-1.5 2-3.5 2-6V19z" fill="currentColor" opacity="0.95"/><path d="M24 19c1-5 7-6 11-3 4 3 5 12 3 18-2 5-8 6-11 2-1-1.5-2-3.5-2-6V19z" fill="currentColor" opacity="0.7"/><circle cx="16" cy="26" r="1.6" fill="rgba(0,0,0,0.18)"/><circle cx="14" cy="32" r="1.3" fill="rgba(0,0,0,0.14)"/><circle cx="32" cy="26" r="1.6" fill="rgba(0,0,0,0.14)"/><circle cx="34" cy="32" r="1.3" fill="rgba(0,0,0,0.1)"/></svg>',
    equipment: '<svg viewBox="0 0 48 48"><rect x="5" y="9" width="27" height="20" rx="3" fill="currentColor" opacity="0.92"/><path d="M9 22h5l2.5-7 4 13 3-9 2 3h4.5" stroke="rgba(0,0,0,0.38)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="35" y="6" width="6" height="20" rx="3" fill="currentColor" opacity="0.55"/><rect x="36.3" y="9" width="3.4" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="12" y="33" width="14" height="4" rx="2" fill="currentColor" opacity="0.5"/></svg>',
    induction: '<svg viewBox="0 0 48 48"><g transform="rotate(45 24 24)"><rect x="6" y="21" width="8" height="4" fill="currentColor" opacity="0.7"/><rect x="14" y="18" width="20" height="10" rx="2" fill="currentColor" opacity="0.92"/><rect x="16" y="20.5" width="14" height="5" rx="1" fill="rgba(0,0,0,0.2)"/><line x1="19" y1="18" x2="19" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><line x1="23" y1="18" x2="23" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><line x1="27" y1="18" x2="27" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><rect x="34" y="20" width="8" height="6" rx="1" fill="currentColor" opacity="0.85"/><rect x="42" y="22" width="4" height="2" fill="currentColor" opacity="0.95"/></g></svg>',
    relaxants: '<svg viewBox="0 0 48 48"><line x1="17" y1="14" x2="29" y2="14" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><line x1="14" y1="17" x2="20" y2="29" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><line x1="32" y1="17" x2="26" y2="29" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><circle cx="12" cy="13" r="6" fill="currentColor" opacity="0.95"/><circle cx="10" cy="11" r="2" fill="rgba(255,255,255,0.4)"/><circle cx="34" cy="13" r="6" fill="currentColor" opacity="0.95"/><circle cx="32" cy="11" r="2" fill="rgba(255,255,255,0.4)"/><circle cx="23" cy="33" r="6" fill="currentColor" opacity="0.95"/><circle cx="21" cy="31" r="2" fill="rgba(255,255,255,0.4)"/></svg>',
    reversal: '<svg viewBox="0 0 48 48"><path d="M37 15a16 16 0 1 1-5-7.5" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity="0.9"/><path d="M39 5v10h-10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/><path d="M16 24l5 5 11-11" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    opioids: '<svg viewBox="0 0 48 48"><path d="M24 6c9 9 13 16 13 22a13 13 0 0 1-26 0c0-6 4-13 13-22z" fill="currentColor" opacity="0.92"/><path d="M24 10c6 8 9 13 9 18a9 9 0 0 1-9 9" fill="currentColor" opacity="0.32"/><line x1="24" y1="14" x2="24" y2="38" stroke="rgba(0,0,0,0.2)" stroke-width="1"/><line x1="19" y1="17" x2="19" y2="35" stroke="rgba(0,0,0,0.14)" stroke-width="1"/><line x1="29" y1="17" x2="29" y2="35" stroke="rgba(0,0,0,0.14)" stroke-width="1"/><ellipse cx="24" cy="10" rx="3" ry="2" fill="currentColor" opacity="0.7"/></svg>',
    nsaids: '<svg viewBox="0 0 48 48"><g transform="rotate(-30 24 24)"><rect x="8" y="18" width="32" height="14" rx="7" fill="currentColor" opacity="0.5"/><path d="M24 18h9a7 7 0 0 1 7 7 7 7 0 0 1-7 7h-9z" fill="currentColor" opacity="0.95"/><line x1="24" y1="18" x2="24" y2="32" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/></g><circle cx="35" cy="11" r="5" fill="currentColor" opacity="0.8"/><line x1="35" y1="7" x2="35" y2="15" stroke="rgba(0,0,0,0.2)" stroke-width="1"/></svg>',
    vasopressors: '<svg viewBox="0 0 48 48"><path d="M24 41C9 30 5 21 5 14a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 7-4 16-19 27z" fill="currentColor" opacity="0.92"/><path d="M8 23h6l3-7 4 15 3-10 2 2h10" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    local: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.9"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity="0.85"><line x1="24" y1="24" x2="24" y2="6"/><line x1="24" y1="24" x2="24" y2="42"/><line x1="24" y1="24" x2="6" y2="24"/><line x1="24" y1="24" x2="42" y2="24"/><line x1="24" y1="24" x2="11" y2="11"/><line x1="24" y1="24" x2="37" y2="37"/><line x1="24" y1="24" x2="37" y2="11"/><line x1="24" y1="24" x2="11" y2="37"/></g><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.7"><line x1="24" y1="10" x2="20" y2="14"/><line x1="24" y1="10" x2="28" y2="14"/><line x1="24" y1="38" x2="20" y2="34"/><line x1="24" y1="38" x2="28" y2="34"/><line x1="10" y1="24" x2="14" y2="20"/><line x1="10" y1="24" x2="14" y2="28"/><line x1="38" y1="24" x2="34" y2="20"/><line x1="38" y1="24" x2="34" y2="28"/></g></svg>'
  };
  function catIconHTML(catId, cat) {
    return CAT_ICON_SVG[catId] || esc(cat.icon);
  }

  const drugById = new Map(DATA.drugs.map((d) => [d.id, d]));
  const topicById = new Map(DATA.topics.map((t) => [t.id, t]));
  const catById = new Map(DATA.categories.map((c) => [c.id, c]));
  const TOPIC_CATS = new Set(["anaesthesia", "equipment"]);
  const isDrugCat = (catId) => !TOPIC_CATS.has(catId);

  function itemById(id) { return drugById.get(id) || topicById.get(id) || null; }
  function itemsInCat(catId) {
    return TOPIC_CATS.has(catId)
      ? DATA.topics.filter((t) => t.cat === catId)
      : DATA.drugs.filter((d) => d.cat === catId);
  }

  let state = { cat: "anaesthesia", item: null, filter: "" };

  /* ---------------------------------------------------------- scroll reveal */
  // Netflix-style smooth entrance: elements start at opacity:0/translateY
  // (see .st-reveal in study.css) and fade/slide in the first time they
  // scroll into view. One shared observer for both the poster grid and the
  // reading-view cards; each element is only ever animated in once.
  const revealObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("st-reveal-visible");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" })
    : null;

  function observeReveal(root) {
    const els = root.querySelectorAll(".st-reveal");
    if (!revealObserver) {
      els.forEach((el) => el.classList.add("st-reveal-visible"));
      return;
    }
    els.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 12, 12) * 35}ms`;
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------- routing */
  function readURL() {
    const q = new URLSearchParams(location.search);
    const item = q.get("item");
    const cat = q.get("cat");
    return {
      item: item && itemById(item) ? item : null,
      cat: cat === "all" || catById.has(cat) ? cat : null
    };
  }

  function writeURL(params, replace) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
    const url = `${location.pathname}${q.toString() ? "?" + q.toString() : ""}`;
    if (replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
  }

  function route() {
    const r = readURL();
    if (r.item) {
      state.item = r.item;
      const found = itemById(r.item);
      state.cat = found.cat;
      showDetail();
    } else {
      state.item = null;
      if (r.cat) state.cat = r.cat;
      showList();
    }
  }

  /* ---------------------------------------------------------------- listing */
  function renderCatNav() {
    const nav = $("#stCatNav");
    const items = DATA.categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, n: itemsInCat(c.id).length }))
      .concat([{ id: "all", label: "View All", icon: "✦", n: DATA.topics.length + DATA.drugs.length }]);
    nav.innerHTML = items.map((c) =>
      `<button type="button" role="tab" class="st-cat${state.cat === c.id ? " active" : ""}" data-cat="${c.id}" aria-selected="${state.cat === c.id}">` +
      `<span aria-hidden="true">${c.icon}</span> ${esc(c.label)} <span class="st-count">${c.n}</span></button>`
    ).join("");
  }

  function tileHTML(item) {
    const cat = catById.get(item.cat);
    // Drugs with a verified chemical structure show THEIR OWN structure on
    // the poster tile instead of the shared category icon — every card in a
    // category no longer looks identical. Drugs with a verified 3D conformer
    // (study-structures-3d.js) get the SAME rotating ball-and-stick viewer
    // used in the detail view, not just the flat diagram — mounted only
    // while the tile is actually on/near screen (see observeTileMolecules())
    // since a grid can show far more tiles at once than the single detail
    // view ever does, and each viewer is its own WebGL context. Topics and
    // drugs without any diagram keep the shared category icon.
    const structRec = window.KN_STRUCTURES && window.KN_STRUCTURES[item.id];
    const has3d = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[item.id];
    let iconHTML;
    if (has3d) {
      iconHTML = `<div class="st-tile-molecule" data-drug="${esc(item.id)}">${structRec ? `<div class="st-tile-structure">${structRec.svg}</div>` : ""}</div>`;
    } else if (structRec) {
      iconHTML = `<div class="st-tile-structure">${structRec.svg}</div>`;
    } else {
      iconHTML = catIconHTML(item.cat, cat);
    }
    const hasVisual = structRec || has3d;
    return `<a class="st-tile st-reveal${hasVisual ? " st-tile-has-structure" : ""}" href="?item=${item.id}" data-item="${item.id}" data-cat="${item.cat}" aria-label="${esc(item.name)}">
      <div class="st-tile-icon" aria-hidden="true">${iconHTML}</div>
      <div class="st-tile-info">
        <span class="st-tile-cat">${esc(cat.label)}</span>
        <strong class="st-tile-name">${esc(item.short || item.name)}</strong>
        <span class="st-tile-tag">${esc(item.tagline)}</span>
      </div>
    </a>`;
  }

  // Poster-tile 3D molecule mounting. A grid can show far more tiles at
  // once than the single detail view ever does, and every mounted viewer is
  // its own WebGL context (browsers cap concurrent contexts at roughly 16),
  // so tiles mount their rotating viewer only while actually on/near screen
  // and dispose it the moment they scroll out — capping live contexts to
  // whatever's visible, not whatever's in the DOM. rootMargin gives a small
  // pre-mount buffer so tiles are already rotating by the time they're
  // fully in view.
  const tileMoleculeObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const node = entry.target;
          const data = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[node.getAttribute("data-drug")];
          if (!data) return;
          if (entry.isIntersecting) {
            if (typeof window.KNMountMolecule3D === "function") {
              // Extra zoom-out margin vs. the detail view's default fit —
              // a poster tile is small, so the whole structure should read
              // clearly with room around it rather than filling/cropping
              // the frame.
              try { window.KNMountMolecule3D(node, data, { fitMargin: 1.9 }); } catch (err) { /* leave 2D fallback in place */ }
            }
          } else if (typeof window.KNDisposeMolecule3D === "function") {
            window.KNDisposeMolecule3D(node);
          }
        });
      }, { rootMargin: "120px 0px" })
    : null;

  function observeTileMolecules(root) {
    if (!tileMoleculeObserver) return;
    root.querySelectorAll(".st-tile-molecule[data-drug]").forEach((node) => tileMoleculeObserver.observe(node));
  }

  function renderGrid() {
    const grid = $("#stGrid");
    // Old tiles are about to be replaced/removed below — stop watching them
    // (mounted viewers on nodes that leave the DOM still self-dispose via
    // study-molecule-3d.js's own isConnected check on its next tick).
    if (tileMoleculeObserver) tileMoleculeObserver.disconnect();
    const f = state.filter.trim().toLowerCase();
    const match = (item) => !f || [item.name, item.short, item.tagline, item.brand]
      .concat(item.tags || []).filter(Boolean).join(" ").toLowerCase().includes(f);
    const cats = state.cat === "all" || f ? DATA.categories : [catById.get(state.cat)];
    let html = "";
    let total = 0;
    cats.forEach((c) => {
      const list = itemsInCat(c.id).filter(match);
      total += list.length;
      if (!list.length) return;
      if (state.cat === "all" || f) html += `<h2 class="st-group-title"><span>${c.icon}</span> ${esc(c.label)}</h2>`;
      html += `<div class="st-grid">${list.map(tileHTML).join("")}</div>`;
    });
    grid.innerHTML = total ? html : `<div class="st-empty">No results for “${esc(state.filter)}”.</div>`;
    observeReveal(grid);
    observeTileMolecules(grid);
  }

  function showList() {
    $("#stDetail").hidden = true;
    $("#stList").hidden = false;
    const cat = catById.get(state.cat);
    document.title = `${cat ? cat.label : "Study Mode"} | Study Mode | KnockoutNotes`;
    renderCatNav();
    renderGrid();
  }

  /* ---------------------------------------------------------------- detail */
  function sourceBanner(source) {
    return `<div class="st-source-banner" role="note">
      <span class="st-source-icon" aria-hidden="true">📚</span>
      <div><strong>Source</strong><p>${esc(source)}</p></div>
    </div>`;
  }

  function card(title, bodyHTML, extraClass = "") {
    return `<section class="st-card st-reveal ${extraClass}"><h3>${esc(title)}</h3><div class="st-card-body">${bodyHTML}</div></section>`;
  }

  // Drug monograph fields (structure/pd/pk/dosage/offLabel/complications)
  // are authored as single dense prose paragraphs, but read far faster as a
  // scannable list of discrete facts — so each one is split into its
  // constituent sentences and rendered as a bullet per sentence rather than
  // one long block of text. The split looks for sentence-ending punctuation
  // followed by whitespace and a capital letter/quote/paren (the next
  // sentence's start) — every source paragraph in study-data.js writes
  // in-sentence units without a trailing period (\"mg/kg\", not \"mg./kg.\"),
  // so this doesn't false-split on abbreviations. General topic prose
  // (paras() below) is untouched — its worked-example/pitfall/pearl format
  // already reads as structured content, not a wall of text.
  function splitSentences(text) {
    return text.split(/(?<=[.!?])\s+(?=[A-Z“"'(])/).map((s) => s.trim()).filter(Boolean);
  }
  function para(text) {
    if (!text) return "";
    const sentences = splitSentences(text);
    if (sentences.length < 2) return `<p>${highlightKeyValues(esc(text))}</p>`;
    return `<ul class="st-bullets">${sentences.map((s) => `<li>${highlightKeyValues(esc(s))}</li>`).join("")}</ul>`;
  }

  // Chemical Structure card: an accurate 2D skeletal-formula diagram (RDKit-
  // generated from a verified SMILES, cross-checked against the known
  // molecular formula — see study-structures.js) above the descriptive
  // prose, when one exists for this drug. Several drugs (complex steroidal/
  // bis-quaternary neuromuscular blockers, morphinan-skeleton opioids,
  // sugammadex, vasopressin) deliberately have no diagram rather than a
  // guessed-at one, so those fall back to prose only.
  function structureBodyHTML(d) {
    const rec2d = window.KN_STRUCTURES && window.KN_STRUCTURES[d.id];
    const has3d = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[d.id];
    if (!rec2d && !has3d) return para(d.structure);
    // A rotating 3D viewer mounts into this placeholder after the HTML is
    // in the DOM (see mountStructureViewers()) — flat 2D SVG is the
    // starting content so there's never an empty box while the module
    // loads or if WebGL isn't available, and mountStructureViewers()
    // replaces it once the 3D viewer is confirmed working.
    const media = has3d
      ? `<div class="st-molecule-viewer" data-drug="${esc(d.id)}" aria-label="Rotating 3D structure of ${esc(d.name)}">${rec2d ? `<div class="st-structure-svg">${rec2d.svg}</div>` : ""}</div>`
      : `<div class="st-structure-svg">${rec2d.svg}</div>`;
    return `<div class="st-structure-wrap">
        ${media}
        ${rec2d ? `<span class="st-structure-formula">${esc(rec2d.formula)}</span>` : ""}
      </div>
      ${para(d.structure)}`;
  }

  // Mounts the rotating Three.js viewer (study-molecule-3d.js) into every
  // .st-molecule-viewer placeholder under `root`. If the module hasn't
  // finished loading yet (it's an ES module, deferred relative to this
  // classic script — see study.html) or WebGL isn't available, the
  // placeholder's starting content (the flat 2D SVG, or nothing) is left
  // as-is rather than showing an empty box.
  function mountStructureViewers(root) {
    const nodes = root.querySelectorAll(".st-molecule-viewer[data-drug]");
    nodes.forEach((node) => {
      const data = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[node.getAttribute("data-drug")];
      if (!data) return;
      const tryMount = () => {
        if (typeof window.KNMountMolecule3D !== "function") return false;
        try {
          return window.KNMountMolecule3D(node, data);
        } catch (err) {
          return false;
        }
      };
      if (tryMount()) return;
      if (typeof window.KNMountMolecule3D !== "function") {
        window.addEventListener("kn-molecule3d-ready", () => tryMount(), { once: true });
      }
    });
  }

  // Long-form topic prose is authored with blank-line paragraph breaks and
  // optional callouts — this keeps study-data.js readable as plain prose
  // while still rendering as properly separated paragraphs/boxes.
  function paras(text) {
    if (!text) return "";
    return text.trim().split(/\n\s*\n/).map((p) => `<p>${highlightKeyValues(esc(p.trim()))}</p>`).join("");
  }
  function callout(kind, label, text) {
    if (!text) return "";
    return `<div class="st-callout st-callout-${kind}"><span class="st-callout-label">${esc(label)}</span>${paras(text)}</div>`;
  }

  // All drug sections render in one continuous scroll — no tabs to click
  // through, so the full monograph is visible/readable in a single pass.
  function drugSectionCard(d, section) {
    switch (section) {
      case "overview":
        return card("Overview", `<p class="st-tagline-lg">${esc(d.tagline)}</p>
          ${d.brand ? `<p><strong>Brand name(s):</strong> ${esc(d.brand)}</p>` : ""}
          <p><strong>Class:</strong> ${esc(catById.get(d.cat).label)}</p>
          ${d.tags && d.tags.length ? `<div class="st-tagrow">${d.tags.map((t) => `<span class="st-chip">${esc(t)}</span>`).join("")}</div>` : ""}`);
      case "structure": return card("Chemical Structure", structureBodyHTML(d));
      case "pd": return card("Pharmacodynamics", para(d.pd));
      case "pk": return card("Pharmacokinetics", para(d.pk));
      case "dosage": return card("Dosage (FDA-Approved)", para(d.dosage));
      case "offlabel": return card("Off-Label Uses", para(d.offLabel));
      case "complications": return card("Complications", para(d.complications));
      default: return "";
    }
  }
  function drugFullPanelHTML(d) {
    return DRUG_SECTIONS.map((s) => drugSectionCard(d, s)).join("");
  }

  function topicPanelHTML(t) {
    return t.sections.map((s) => {
      const diagramHTML = s.diagram === "mapleson-grid" ? maplesonGridHTML() : "";
      const body = `${s.b ? paras(s.b) : ""}` +
        callout("example", "🧩 Worked example", s.example) +
        callout("pitfall", "⚠️ Common pitfall", s.pitfall) +
        callout("pearl", "💡 Key point", s.pearl) +
        diagramHTML;
      return card(s.h, body);
    }).join("");
  }

  /* ------------------------------------------------- Mapleson circuit diagrams
     Original schematic redrawn in code (not a reproduction of any textbook or
     third-party figure). Structure per type is verified against the standard
     teaching (Miller's Anesthesia 10th ed.; Dorsch & Dorsch, Understanding
     Anesthesia Equipment): A = valve at patient end, FG at bag end. B = valve
     + FG both at patient end, bag via tubing. C = as B, no tubing (compact).
     D = FG at patient end, valve at bag/machine end (mirror of A). E = Ayre's
     T-piece — no valve, no bag, open tube tail. F = Jackson-Rees — as E with
     an open-tailed bag added. */
  function mgBag(x, y, vented) {
    let s = `<circle cx="${x}" cy="${y}" r="20" fill="none" stroke="currentColor" stroke-width="2"/>`;
    if (vented) {
      s += `<line x1="${x - 13}" y1="${y - 13}" x2="${x - 24}" y2="${y - 22}" stroke="currentColor" stroke-width="2"/>`;
      s += `<circle cx="${x - 24}" cy="${y - 22}" r="2.5" fill="currentColor"/>`;
    }
    return s;
  }
  function mgOpenEnd(x, y) {
    return `<line x1="${x}" y1="${y - 9}" x2="${x}" y2="${y + 9}" stroke="currentColor" stroke-width="2"/>
      <line x1="${x - 8}" y1="${y - 13}" x2="${x - 2}" y2="${y - 7}" stroke="currentColor" stroke-width="1.5"/>
      <line x1="${x - 8}" y1="${y + 13}" x2="${x - 2}" y2="${y + 7}" stroke="currentColor" stroke-width="1.5"/>`;
  }
  function mgValve(x, y) {
    return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}" stroke="currentColor" stroke-width="2"/>
      <line x1="${x - 9}" y1="${y - 18}" x2="${x + 9}" y2="${y - 18}" stroke="currentColor" stroke-width="2"/>`;
  }
  function mgTube(x1, x2, y, corrugated) {
    let s = `<line x1="${x1}" y1="${y - 6}" x2="${x2}" y2="${y - 6}" stroke="currentColor" stroke-width="1.5"/>
      <line x1="${x1}" y1="${y + 6}" x2="${x2}" y2="${y + 6}" stroke="currentColor" stroke-width="1.5"/>`;
    if (corrugated) {
      for (let x = x1 + 6; x < x2 - 4; x += 12) {
        s += `<line x1="${x}" y1="${y - 6}" x2="${x + 6}" y2="${y + 6}" stroke="currentColor" stroke-width="1.2"/>`;
      }
    }
    return s;
  }
  function mgPatient(x, y) {
    return `<path d="M ${x} ${y} q 18 0 18 16 q 0 14 16 14" fill="none" stroke="currentColor" stroke-width="2"/>
      <ellipse cx="${x + 40}" cy="${y + 30}" rx="12" ry="7" fill="none" stroke="currentColor" stroke-width="2"/>
      <text x="${x + 58}" y="${y + 34}" font-size="13" font-weight="700" fill="currentColor">P</text>`;
  }
  function mgFG(x, y) {
    return `<line x1="${x}" y1="${y - 28}" x2="${x}" y2="${y - 6}" stroke="currentColor" stroke-width="2"/>
      <path d="M ${x - 5} ${y - 12} L ${x} ${y - 4} L ${x + 5} ${y - 12} Z" fill="currentColor"/>
      <text x="${x}" y="${y - 32}" font-size="12" font-weight="700" fill="currentColor" text-anchor="middle">FG</text>`;
  }
  function mgTitle(x, y, label) {
    return `<text x="${x}" y="${y}" font-size="15" font-weight="800" fill="currentColor">${esc(label)}</text>`;
  }

  const MAPLESON_CELLS = {
    A: () => `${mgBag(40, 100)}${mgFG(40, 100)}${mgTube(64, 270, 100, true)}${mgValve(270, 100)}${mgPatient(278, 100)}`,
    B: () => `${mgBag(40, 100)}${mgTube(64, 230, 100, true)}${mgFG(250, 100)}${mgValve(270, 100)}${mgPatient(278, 100)}`,
    C: () => `${mgBag(40, 100)}${mgTube(64, 90, 100, false)}${mgFG(110, 100)}${mgValve(130, 100)}${mgPatient(138, 100)}`,
    D: () => `${mgBag(40, 100)}${mgValve(64, 100)}${mgTube(82, 270, 100, true)}${mgFG(280, 100)}${mgPatient(288, 100)}`,
    E: () => `${mgOpenEnd(40, 100)}${mgTube(54, 270, 100, true)}${mgFG(280, 100)}${mgPatient(288, 100)}`,
    F: () => `${mgBag(40, 100, true)}${mgTube(64, 270, 100, true)}${mgFG(280, 100)}${mgPatient(288, 100)}`
  };

  let maplesonSVGCache = null;
  function maplesonGridHTML() {
    if (!maplesonSVGCache) {
      const cellW = 400, cellH = 170, gapX = 20, gapY = 10;
      const order = ["A", "B", "C", "D", "E", "F"];
      let cells = "";
      order.forEach((key, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const tx = col * (cellW + gapX);
        const ty = row * (cellH + gapY);
        cells += `<g transform="translate(${tx},${ty})">${mgTitle(6, 20, "Mapleson " + key)}${MAPLESON_CELLS[key]()}</g>`;
      });
      const totalW = cellW * 2 + gapX;
      const totalH = cellH * 3 + gapY * 2;
      maplesonSVGCache = `<div class="st-diagram-wrap"><svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapleson breathing circuits A to F, schematic diagram">${cells}</svg>
        <p class="st-diagram-caption">Original schematic, redrawn in code for clarity — not a reproduction of any textbook or published figure. Legend: ○ reservoir bag (with a small vent mark for the open-tailed Jackson-Rees bag) · ⊤ APL (adjustable pressure-limiting) valve · FG ↓ fresh gas inlet · zig-zag = corrugated tubing · curved connector + P = patient port.</p></div>`;
    }
    return maplesonSVGCache;
  }

  function showDetail() {
    $("#stList").hidden = true;
    $("#stDetail").hidden = false;
    const item = itemById(state.item);
    const drug = isDrugCat(item.cat);
    const cat = catById.get(item.cat);
    document.title = `${item.name} | Study Mode | KnockoutNotes`;

    const backHref = `?cat=${item.cat}`;
    const tagsRow = item.tags && item.tags.length
      ? `<div class="st-tagrow">${item.tags.map((tg) => `<span class="st-chip">${esc(tg)}</span>`).join("")}</div>` : "";

    const bodyHTML = drug
      ? `<div class="st-panel" id="stPanel">${drugFullPanelHTML(item)}</div>`
      : `<div class="st-panel st-panel-scroll" id="stPanel">${topicPanelHTML(item)}</div>`;

    // Title renders as a normal in-flow card — same glass-card look and the
    // same st-reveal scroll-in animation as every other content card below
    // it, not a separate pinned/fixed bar.
    $("#stDetail").innerHTML = `
      <div class="st-reading-col">
        <a class="st-back" href="${backHref}" data-back>← Back to ${esc(cat.label)}</a>
        <section class="st-card st-title-card st-reveal" data-cat="${item.cat}">
          <div class="st-title-card-media" aria-hidden="true">${catIconHTML(item.cat, cat)}</div>
          <div class="st-title-card-body">
            <h1>${esc(item.name)}</h1>
            <p class="st-tagline-lg">${esc(item.tagline)}</p>
            ${tagsRow}
          </div>
        </section>
        ${sourceBanner(item.source)}
        ${bodyHTML}
      </div>
    `;
    bindDetailEvents();
    observeReveal($("#stDetail"));
    mountStructureViewers($("#stDetail"));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function bindDetailEvents() {
    const back = $("#stDetail [data-back]");
    if (back) {
      back.addEventListener("click", (e) => {
        e.preventDefault();
        writeURL({ cat: itemById(state.item).cat });
        route();
      });
    }
  }

  /* ---------------------------------------------------------------- events */
  function bindListEvents() {
    $("#stCatNav").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      state.cat = btn.getAttribute("data-cat");
      state.filter = "";
      const search = $("#stSearch");
      if (search) search.value = "";
      writeURL({ cat: state.cat === "anaesthesia" ? null : state.cat });
      showList();
    });
    $("#stGrid").addEventListener("click", (e) => {
      const a = e.target.closest("[data-item]");
      if (!a) return;
      e.preventDefault();
      const id = a.getAttribute("data-item");
      state.item = id;
      writeURL({ item: id });
      showDetail();
    });
    const search = $("#stSearch");
    if (search) {
      search.addEventListener("input", () => {
        state.filter = search.value;
        renderGrid();
      });
    }
  }

  window.addEventListener("popstate", route);

  /* ---------------------------------------------------------------- fullscreen */
  function initFullscreen() {
    const btn = $("#stFullscreen");
    const stage = $("#stStage");
    if (!btn || !stage) return;
    function isFs() { return document.fullscreenElement || document.webkitFullscreenElement; }
    function update() {
      const active = !!isFs();
      stage.classList.toggle("st-fullscreen-active", active);
      btn.setAttribute("aria-pressed", String(active));
      btn.innerHTML = active ? "✕" : "⛶";
      btn.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
    }
    btn.addEventListener("click", () => {
      if (isFs()) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      } else {
        const req = stage.requestFullscreen || stage.webkitRequestFullscreen;
        if (req) {
          const r = req.call(stage);
          if (r && r.catch) r.catch(() => {});
        }
      }
    });
    document.addEventListener("fullscreenchange", update);
    document.addEventListener("webkitfullscreenchange", update);
  }

  /* ---------------------------------------------------------------- nav auto-hide */
  // Hides the site's top nav bar while scrolling down through a drug/topic
  // page and reveals it again on scrolling up — scoped to Study Mode only
  // (this whole file only ever runs on study.html, so nothing else on the
  // site is affected). See .kn-nav-autohidden in study.css.
  function initNavAutoHide() {
    let lastY = window.scrollY;
    let ticking = false;
    const IGNORE_BELOW = 90; // stay put near the very top of the page
    const JITTER = 6; // ignore tiny/momentum scroll noise
    function update() {
      ticking = false;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      if (Math.abs(delta) < JITTER) return;
      const hide = delta > 0 && y > IGNORE_BELOW;
      document.body.classList.toggle("kn-nav-autohidden", hide);
      lastY = y;
    }
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });
  }

  /* ---------------------------------------------------------------- 3D card tilt */
  // Same mouse-tracked "3D haptic" tilt the site already uses on
  // resuscitation-chamber.js's flow nodes — reused here via event
  // delegation (one pair of listeners covers every .st-card/.st-tile,
  // including ones rendered after this runs) so the reading cards and
  // poster tiles feel alive rather than flat, and pop toward the cursor
  // instead of sitting dead on the page.
  function initCardTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const SELECTOR = ".st-card, .st-tile";
    let rAF = null;
    let activeNode = null;

    document.addEventListener("mousemove", (e) => {
      const node = e.target.closest ? e.target.closest(SELECTOR) : null;
      if (node !== activeNode) {
        if (activeNode) activeNode.style.transform = "";
        activeNode = node;
      }
      if (!node) return;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rawRotX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
        const rawRotY = ((x - rect.width / 2) / (rect.width / 2)) * 4;
        const rotateX = Math.max(-4, Math.min(4, rawRotX)).toFixed(2);
        const rotateY = Math.max(-4, Math.min(4, rawRotY)).toFixed(2);
        const isTile = node.classList.contains("st-tile");
        const scale = isTile ? 1.06 : 1.012;
        node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(8px)`;
      });
    }, { passive: true });

    // mouseleave doesn't bubble, so it can't be delegated from document —
    // mouseout (which does bubble) plus a relatedTarget check is the
    // standard way to detect "the pointer left this card" here.
    document.addEventListener("mouseout", (e) => {
      if (activeNode && (!e.relatedTarget || !activeNode.contains(e.relatedTarget))) {
        activeNode.style.transform = "";
        activeNode = null;
      }
    });
  }

  function init() {
    bindListEvents();
    initFullscreen();
    initNavAutoHide();
    initCardTilt();
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
