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
  const DRUG_SECTIONS = ["overview", "structure", "pd", "pk", "dosage", "offlabel", "complications", "references"];

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
    examination: '<svg viewBox="0 0 48 48"><path d="M14 8v10a10 10 0 0 0 20 0V8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="8" r="2.5" fill="currentColor"/><circle cx="34" cy="8" r="2.5" fill="currentColor"/><path d="M24 28v6a6 6 0 0 0 6 6h4" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="40" r="5" fill="currentColor" opacity="0.9"/><circle cx="36" cy="40" r="2.5" fill="rgba(255,255,255,0.4)"/></svg>',
    ecg: '<svg viewBox="0 0 48 48"><rect x="4" y="8" width="40" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/><path d="M6 24h7l3-9 5 18 4-13 3 6h6l2-4 3 6h7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    abg: '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="28" rx="3" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"/><line x1="8" y1="18" x2="40" y2="18" stroke="currentColor" stroke-width="1.8" opacity="0.4"/><circle cx="16" cy="28" r="3" fill="currentColor"/><path d="M24 24v8m6-6v6m6-4v4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    equipment: '<svg viewBox="0 0 48 48"><rect x="5" y="9" width="27" height="20" rx="3" fill="currentColor" opacity="0.92"/><path d="M9 22h5l2.5-7 4 13 3-9 2 3h4.5" stroke="rgba(0,0,0,0.38)" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="35" y="6" width="6" height="20" rx="3" fill="currentColor" opacity="0.55"/><rect x="36.3" y="9" width="3.4" height="4" rx="1" fill="rgba(0,0,0,0.2)"/><rect x="12" y="33" width="14" height="4" rx="2" fill="currentColor" opacity="0.5"/></svg>',
    induction: '<svg viewBox="0 0 48 48"><g transform="rotate(45 24 24)"><rect x="6" y="21" width="8" height="4" fill="currentColor" opacity="0.7"/><rect x="14" y="18" width="20" height="10" rx="2" fill="currentColor" opacity="0.92"/><rect x="16" y="20.5" width="14" height="5" rx="1" fill="rgba(0,0,0,0.2)"/><line x1="19" y1="18" x2="19" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><line x1="23" y1="18" x2="23" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><line x1="27" y1="18" x2="27" y2="28" stroke="rgba(0,0,0,0.3)" stroke-width="1"/><rect x="34" y="20" width="8" height="6" rx="1" fill="currentColor" opacity="0.85"/><rect x="42" y="22" width="4" height="2" fill="currentColor" opacity="0.95"/></g></svg>',
    relaxants: '<svg viewBox="0 0 48 48"><line x1="17" y1="14" x2="29" y2="14" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><line x1="14" y1="17" x2="20" y2="29" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><line x1="32" y1="17" x2="26" y2="29" stroke="currentColor" stroke-width="2.4" opacity="0.6"/><circle cx="12" cy="13" r="6" fill="currentColor" opacity="0.95"/><circle cx="10" cy="11" r="2" fill="rgba(255,255,255,0.4)"/><circle cx="34" cy="13" r="6" fill="currentColor" opacity="0.95"/><circle cx="32" cy="11" r="2" fill="rgba(255,255,255,0.4)"/><circle cx="23" cy="33" r="6" fill="currentColor" opacity="0.95"/><circle cx="21" cy="31" r="2" fill="rgba(255,255,255,0.4)"/></svg>',
    reversal: '<svg viewBox="0 0 48 48"><path d="M37 15a16 16 0 1 1-5-7.5" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity="0.9"/><path d="M39 5v10h-10" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/><path d="M16 24l5 5 11-11" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    opioids: '<svg viewBox="0 0 48 48"><path d="M24 6c9 9 13 16 13 22a13 13 0 0 1-26 0c0-6 4-13 13-22z" fill="currentColor" opacity="0.92"/><path d="M24 10c6 8 9 13 9 18a9 9 0 0 1-9 9" fill="currentColor" opacity="0.32"/><line x1="24" y1="14" x2="24" y2="38" stroke="rgba(0,0,0,0.2)" stroke-width="1"/><line x1="19" y1="17" x2="19" y2="35" stroke="rgba(0,0,0,0.14)" stroke-width="1"/><line x1="29" y1="17" x2="29" y2="35" stroke="rgba(0,0,0,0.14)" stroke-width="1"/><ellipse cx="24" cy="10" rx="3" ry="2" fill="currentColor" opacity="0.7"/></svg>',
    nsaids: '<svg viewBox="0 0 48 48"><g transform="rotate(-30 24 24)"><rect x="8" y="18" width="32" height="14" rx="7" fill="currentColor" opacity="0.5"/><path d="M24 18h9a7 7 0 0 1 7 7 7 7 0 0 1-7 7h-9z" fill="currentColor" opacity="0.95"/><line x1="24" y1="18" x2="24" y2="32" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/></g><circle cx="35" cy="11" r="5" fill="currentColor" opacity="0.8"/><line x1="35" y1="7" x2="35" y2="15" stroke="rgba(0,0,0,0.2)" stroke-width="1"/></svg>',
    vasopressors: '<svg viewBox="0 0 48 48"><path d="M24 41C9 30 5 21 5 14a10 10 0 0 1 19-4 10 10 0 0 1 19 4c0 7-4 16-19 27z" fill="currentColor" opacity="0.92"/><path d="M8 23h6l3-7 4 15 3-10 2 2h10" fill="none" stroke="rgba(0,0,0,0.35)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    local: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="5" fill="currentColor" opacity="0.9"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round" opacity="0.85"><line x1="24" y1="24" x2="24" y2="6"/><line x1="24" y1="24" x2="24" y2="42"/><line x1="24" y1="24" x2="6" y2="24"/><line x1="24" y1="24" x2="42" y2="24"/><line x1="24" y1="24" x2="11" y2="11"/><line x1="24" y1="24" x2="37" y2="37"/><line x1="24" y1="24" x2="37" y2="11"/><line x1="24" y1="24" x2="11" y2="37"/></g><g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.7"><line x1="24" y1="10" x2="20" y2="14"/><line x1="24" y1="10" x2="28" y2="14"/><line x1="24" y1="38" x2="20" y2="34"/><line x1="24" y1="38" x2="28" y2="34"/><line x1="10" y1="24" x2="14" y2="20"/><line x1="10" y1="24" x2="14" y2="28"/><line x1="38" y1="24" x2="34" y2="20"/><line x1="38" y1="24" x2="34" y2="28"/></g></svg>',
    pregnancy: '<svg viewBox="0 0 48 48"><circle cx="24" cy="11" r="5" fill="currentColor" opacity="0.95"/><circle cx="22" cy="10" r="1.5" fill="rgba(255,255,255,0.4)"/><path d="M19 18c-3 0-5 3-5 7 0 6 3 11 5 15l2 3h6l2-3c2-4 5-9 5-15 0-4-2-7-5-7h-10z" fill="currentColor" opacity="0.6"/><path d="M21 21c-2 1-3 3-3 6 0 4 2 8 4 11 1 0 2 0 3-1 2-2 3-5 3-8 0-3-1-5-3-6-1-1-3-2-4-2z" fill="currentColor" opacity="0.95"/><circle cx="24" cy="27" r="2.2" fill="rgba(255,255,255,0.5)"/></svg>'
  };
  function catIconHTML(catId, cat) {
    return CAT_ICON_SVG[catId] || esc(cat.icon);
  }

  const drugById = new Map(DATA.drugs.map((d) => [d.id, d]));
  const topicById = new Map(DATA.topics.map((t) => [t.id, t]));
  const catById = new Map(DATA.categories.map((c) => [c.id, c]));
  const TOPIC_CATS = new Set(["anaesthesia", "examination", "ecg", "abg", "equipment"]);
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
    const structRec = window.KN_STRUCTURES && window.KN_STRUCTURES[item.id];
    const has3d = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[item.id];
    let iconHTML;
    if (has3d) {
      iconHTML = `<div class="st-tile-molecule" data-drug="${esc(item.id)}">${structRec && structRec.svg ? `<div class="st-tile-structure">${structRec.svg}</div>` : `<div class="st-tile-fallback-icon">${catIconHTML(item.cat, cat)}</div>`}</div>`;
    } else if (structRec && structRec.svg) {
      iconHTML = `<div class="st-tile-structure">${structRec.svg}</div>`;
    } else {
      iconHTML = `<div class="st-tile-fallback-icon">${catIconHTML(item.cat, cat)}</div>`;
    }
    const hasVisual = has3d || structRec;
    return `<a class="st-tile st-reveal${hasVisual ? " st-tile-has-structure" : ""}" href="?item=${item.id}" data-item="${item.id}" data-cat="${item.cat}" aria-label="${esc(item.name)}">
      <div class="st-tile-icon" aria-hidden="true">${iconHTML}</div>
      <div class="st-tile-info">
        <span class="st-tile-cat">${esc(cat.label)}</span>
        <strong class="st-tile-name">${esc(item.short || item.name)}</strong>
        <span class="st-tile-tag">${esc(item.tagline)}</span>
      </div>
    </a>`;
  }

  function observeTileMolecules(root) {
    if (!root || typeof window.KNMountTileMolecule !== "function") return;
    const nodes = root.querySelectorAll(".st-tile-molecule[data-drug]");
    nodes.forEach((node) => {
      const drugId = node.getAttribute("data-drug");
      if (drugId) {
        window.KNMountTileMolecule(node, drugId);
      }
    });
  }

  // Global listener for when study-molecule-3d.js completes loading and Three.js initialization.
  window.addEventListener("kn-molecule3d-ready", () => {
    const detail = $("#stDetail");
    if (detail && !detail.hidden) {
      mountStructureViewers(detail);
    }
    const grid = $("#stGrid");
    if (grid && $("#stList") && !$("#stList").hidden) {
      observeTileMolecules(grid);
    }
  });

  // Receptor-activity & chemical-class classification charts — shown above
  // the poster grid only for the unfiltered category views (Opioids, Muscle
  // Relaxants, Induction Agents), not on "all categories" or search views.
  // Each chip reuses the existing [data-item] click delegation on #stGrid.
  const OPIOID_CLASSES = [
    { label: "Full Agonists — Phenanthrene", desc: "Morphine and its direct chemical relatives.", members: ["morphine", "hydromorphone", "pethidine"] },
    { label: "Full Agonists — Phenylpiperidine", desc: "The fentanyl family — fast, potent, synthetic.", members: ["fentanyl", "sufentanil", "alfentanil", "remifentanil"] },
    { label: "Atypical / Weak Agonist", desc: "Opioid effect plus a second, non-opioid mechanism.", members: ["tramadol"] },
    { label: "Partial Agonist", desc: "Ceiling effect on respiratory depression.", members: ["buprenorphine"] },
    { label: "Mixed Agonist-Antagonists", desc: "Kappa agonist + mu antagonist/partial agonist.", members: ["nalbuphine", "pentazocine"] },
    { label: "Pure Antagonists", desc: "No agonist activity of their own — reversal only.", members: ["naloxone", "naltrexone"] },
  ];

  const RELAXANT_CLASSES = [
    { label: "Depolarising — Acetylcholine Dimer", desc: "Persistent motor endplate depolarisation; ultra-short onset and duration.", members: ["succinylcholine"] },
    { label: "Aminosteroids — Intermediate-Acting", desc: "Monoquaternary steroid nucleus; hepatic biliary clearance, sugammadex reversible.", members: ["rocuronium", "vecuronium"] },
    { label: "Aminosteroids — Long-Acting", desc: "Bis-quaternary aminosteroid; renal clearance, marked vagolytic tachycardia.", members: ["pancuronium"] },
    { label: "Benzylisoquinoliniums — Hofmann Elimination", desc: "Organ-independent spontaneous chemical degradation; intermediate duration, organ-failure safe.", members: ["cisatracurium", "atracurium"] },
    { label: "Benzylisoquinoliniums — Short-Acting Diester", desc: "Plasma butyrylcholinesterase hydrolysis; short duration, prolonged in atypical enzyme.", members: ["mivacurium"] },
    { label: "Asymmetric Fumarates — Cysteine-Reversible", desc: "Investigational ultra-short chlorofumarate; designed for rapid L-cysteine adduction reversal.", members: ["gantacurium"] },
  ];

  const INDUCTION_CLASSES = [
    { label: "Alkylphenols — GABA-A Potentiators", desc: "Diisopropylphenol & chiral derivatives; rapid redistribution, smooth awakening, antiemetic.", members: ["propofol", "cipepofol"] },
    { label: "Carboxylated Imidazoles", desc: "Exceptional haemodynamic stability; transient 11β-hydroxylase adrenal steroidogenesis suppression.", members: ["etomidate"] },
    { label: "Arylcycloalkylamines — NMDA Antagonists", desc: "Non-competitive NMDA blockade; dissociative anaesthesia, somatic analgesia, sympathetic tone.", members: ["ketamine"] },
    { label: "Benzodiazepines — Classical Imidazobenzodiazepine", desc: "Positive allosteric GABA-A modulator; water-soluble in vial, lipophilic in vivo, hepatic CYP3A4.", members: ["midazolam"] },
    { label: "Benzodiazepines — Ester-Hydrolysed Soft Drug", desc: "Carboxylic ester grafted onto benzodiazepine core; ultra-short offset via tissue carboxylesterases.", members: ["remimazolam"] },
    { label: "Barbiturates — Thiobarbiturate (Historic)", desc: "Sulfur-substituted barbiturate; rapid brain entry, long elimination half-life, burst suppression.", members: ["thiopental"] },
  ];

  const LOCAL_CLASSES = [
    { label: "Aminoamides — Intermediate Duration", desc: "Hepatic CYP1A2/3A4 clearance; fast onset, moderate lipophilicity, versatile infiltration and spinal use.", members: ["lidocaine", "mepivacaine"] },
    { label: "Aminoamides — Long Duration", desc: "High lipid solubility and high protein binding (>95%); prolonged sensory block with differential motor sparing.", members: ["bupivacaine", "ropivacaine"] },
    { label: "Aminoesters — Ultra-Short Duration", desc: "Extremely rapid hydrolysis by plasma pseudocholinesterase; minimal systemic toxicity and rapid recovery.", members: ["chloroprocaine"] },
  ];

  const VASOPRESSOR_CLASSES = [
    { label: "Pure Alpha-1 Agonist", desc: "Selective arterial and venous vasoconstriction without direct beta inotropy; reflex bradycardia.", members: ["phenylephrine"] },
    { label: "Mixed Alpha & Beta Agonists", desc: "Potent systemic vasoconstriction combined with direct inotropic support; first-line in distributive and anaphylactic shock.", members: ["norepinephrine", "epinephrine"] },
    { label: "Inotropes & Inodilators", desc: "Selective beta-1 inotropy with mild peripheral beta-2 vasodilation; augment stroke volume with reduced LV afterload.", members: ["dobutamine"] },
    { label: "Dopaminergic & Adrenergic Agonist", desc: "Dose-dependent receptor recruitment: low-dose dopaminergic (D1/D2) -> intermediate beta-1 -> high-dose alpha-1.", members: ["dopamine"] },
    { label: "Non-Adrenergic Vasoconstrictor", desc: "Stimulates vascular V1a receptors independent of catecholamine pathways; rescues refractory vasodilatory shock.", members: ["vasopressin"] },
  ];

  const NSAIDS_CLASSES = [
    { label: "Non-Selective COX Inhibitors — Pyrrolo-pyrrole & Acetic Acid", desc: "High-potency injectable non-steroidal analgesics providing opioid-sparing multimodal relief; inhibit COX-1 and COX-2.", members: ["ketorolac", "diclofenac"] },
    { label: "Non-Selective COX Inhibitors — Propionic Acid", desc: "Balanced analgesic, antipyretic, and anti-inflammatory activity with reversible cyclooxygenase inhibition.", members: ["ibuprofen"] },
    { label: "Selective COX-2 Inhibitors (Coxibs)", desc: "Spares gastroprotective COX-1 and platelet thromboxane A2; zero inhibition of platelet aggregation.", members: ["celecoxib"] },
    { label: "Para-Aminophenol Derivatives", desc: "Central cyclooxygenase/peroxidase inhibition and indirect TRPA1 modulation; antipyretic & analgesic without platelet effect.", members: ["paracetamol"] },
  ];

  const ANTIHYPERTENSIVE_CLASSES = [
    { label: "Combined Alpha-1 & Non-Selective Beta-Blockers", desc: "Non-selective beta-blockade plus competitive alpha-1 blockade (1:7 IV ratio); reduces SVR without reflex tachycardia. First-line for severe pregnancy hypertension & acute aortic dissection.", members: ["labetalol"] },
    { label: "ACE Inhibitors (ACEi)", desc: "Competitive inhibition of angiotensin-converting enzyme; reduces angiotensin II & blocks bradykinin degradation. Withhold 24h preoperatively to avoid vasoplegic refractory hypotension.", members: ["ramipril"] },
    { label: "Angiotensin Receptor Blockers (ARBs)", desc: "Selective AT1 receptor antagonism; blocks vasoconstriction & aldosterone release. High risk of post-induction vasoplegia refractory to phenylephrine/ephedrine.", members: ["losartan"] },
    { label: "Calcium Channel Blockers — Dihydropyridines (DHP)", desc: "Vascular-selective L-type Ca2+ channel blockade causing potent arteriolar vasodilation with minimal direct myocardial depression.", members: ["amlodipine"] },
    { label: "Calcium Channel Blockers — Non-Dihydropyridines", desc: "Balanced cardiac and vascular L-type Ca2+ channel inhibition; negative inotropy, chronotropy, and AV nodal conduction slowing.", members: ["diltiazem"] },
    { label: "Beta-Blockers — Cardioselective (Oral)", desc: "Selective beta-1 adrenoceptor blockade; reduces heart rate, myocardial contractility, and myocardial oxygen consumption.", members: ["metoprolol"] },
    { label: "Beta-Blockers — Ultra-Short Cardioselective (IV)", desc: "Ultra-rapid onset and 9-minute half-life via erythrocyte esterase hydrolysis; ideal for tight intraoperative haemodynamic titration.", members: ["esmolol"] },
    { label: "Direct Arteriolar Vasodilators", desc: "Selective precapillary arteriolar smooth muscle relaxation via hyperpolarisation and blunted calcium release; pronounced reflex tachycardia.", members: ["hydralazine"] },
    { label: "Direct Nitric Oxide Donors / Mixed Vasodilators", desc: "Spontaneous non-enzymatic NO release causing balanced arterial and venous relaxation; first-line for hypertensive emergencies.", members: ["sodium-nitroprusside"] },
  ];

  const ANTIDIABETIC_CLASSES = [
    { label: "Biguanides (AMPK Activators)", desc: "Suppresses hepatic gluconeogenesis and improves peripheral insulin sensitivity via AMPK activation. Withhold on morning of surgery (lactic acidosis risk).", members: ["metformin"] },
    { label: "SGLT2 Inhibitors (Gliflozins)", desc: "Blocks glucose reabsorption in renal proximal tubule; cardioprotective & nephroprotective. CRITICAL: Withhold 3–4 days before surgery due to euglycaemic DKA (euDKA) risk!", members: ["empagliflozin", "dapagliflozin"] },
    { label: "GLP-1 Receptor Agonists & Incretin Mimetics", desc: "Glucose-dependent insulin secretion, glucagon suppression, and delayed gastric emptying. Hold perioperatively per ASA consensus due to aspiration risk.", members: ["semaglutide"] },
    { label: "Sulfonylureas (SUR1 / K-ATP Channel Blockers)", desc: "Blocks ATP-sensitive K+ channels in pancreatic beta cells to stimulate continuous insulin secretion. Withhold on morning of surgery (prolonged hypoglycaemia risk).", members: ["glimepiride"] },
    { label: "DPP-4 Inhibitors (Gliptins)", desc: "Inhibits dipeptidyl peptidase-4 enzyme to prolong endogenous GLP-1 and GIP half-life. Low hypoglycaemia risk; generally held on morning of surgery.", members: ["sitagliptin"] },
    { label: "Thiazolidinediones (TZDs / PPAR-γ Agonists)", desc: "Nuclear PPAR-gamma receptor agonist enhancing peripheral insulin sensitivity in muscle and adipose tissue. Fluid retention hazard in heart failure.", members: ["pioglitazone"] },
    { label: "Short-Acting & Prandial Insulins (Soluble / Regular)", desc: "Unmodified zinc crystalline human insulin; IV or subQ; gold standard for continuous infusion in DKA, hyperkalaemia, and intraoperative sliding scales.", members: ["insulin-regular"] },
    { label: "Long-Acting & Basal Insulins (Peakless Analogues)", desc: "Microprecipitating modified insulin providing 24-hour flat basal suppression of hepatic glucose output; taken at 75–80% normal dose on morning of surgery.", members: ["insulin-glargine"] },
  ];

  const MISCELLANEOUS_CLASSES = [
    { label: "Antimuscarinic Vagolytics (Anticholinergics)", desc: "Competitive antagonists at muscarinic acetylcholine receptors; vagolysis for bradycardia, antisialagogues, and neostigmine reversal partners.", members: ["atropine", "glycopyrrolate"] },
    { label: "Class III Antiarrhythmics & Multi-Channel Blockers", desc: "Blocks potassium, sodium, and calcium channels with non-competitive anti-adrenergic action; first-line for shock-refractory VF/pVT and rapid AF.", members: ["amiodarone"] },
    { label: "5-HT3 Receptor Antagonists / Antiemetics", desc: "Selective 5-hydroxytryptamine type 3 receptor antagonism; first-line prophylaxis and treatment for postoperative nausea and vomiting (PONV).", members: ["ondansetron"] },
    { label: "Electrolytes & Membrane Stabilisers", desc: "Critical intravenous ions for neuromuscular excitability, cardiac conduction, acid-base buffering, and hyperkalaemia/hypocalcaemia emergencies.", members: ["magnesium-sulphate", "sodium-bicarbonate", "potassium-chloride", "calcium-gluconate-chloride"] },
    { label: "Toxicology, Lipid Rescue & Pharmacogenetic Antidotes", desc: "Targeted antidotes for Local Anaesthetic Systemic Toxicity (LAST) and life-threatening Malignant Hyperthermia crisis.", members: ["intralipid-20", "dantrolene"] },
  ];

  function buildClassificationHTML(title, classList) {
    const groups = classList.map((g) => {
      const chips = g.members.map((id) => {
        const d = drugById.get(id);
        if (!d) return "";
        return `<a class="st-class-chip" href="?item=${id}" data-item="${id}">${esc(d.short || d.name)}</a>`;
      }).join("");
      if (!chips) return "";
      return `<div class="st-class-group">
        <h3>${esc(g.label)}</h3>
        <p>${esc(g.desc)}</p>
        <div class="st-class-chips">${chips}</div>
      </div>`;
    }).join("");
    return `<section class="st-classification st-reveal" aria-label="${esc(title)}">
      <h2 class="st-classification-title">${esc(title)}</h2>
      <div class="st-classification-grid">${groups}</div>
    </section>`;
  }

  function opioidClassificationHTML() {
    return buildClassificationHTML("Classification — by Receptor Activity", OPIOID_CLASSES);
  }
  function relaxantClassificationHTML() {
    return buildClassificationHTML("Classification — by Chemical Structure & Mechanism", RELAXANT_CLASSES);
  }
  function inductionClassificationHTML() {
    return buildClassificationHTML("Classification — by Chemical Class & Receptor Target", INDUCTION_CLASSES);
  }
  function localClassificationHTML() {
    return buildClassificationHTML("Classification — by Chemical Structure & Duration of Action", LOCAL_CLASSES);
  }
  function vasopressorClassificationHTML() {
    return buildClassificationHTML("Classification — by Receptor Selectivity & Haemodynamic Mechanism", VASOPRESSOR_CLASSES);
  }
  function nsaidsClassificationHTML() {
    return buildClassificationHTML("Classification — by Cyclooxygenase Selectivity & Chemical Class", NSAIDS_CLASSES);
  }
  function antihypertensivesClassificationHTML() {
    return buildClassificationHTML("Classification — by Mechanism of Action & Receptor Target", ANTIHYPERTENSIVE_CLASSES);
  }
  function antidiabeticsClassificationHTML() {
    return buildClassificationHTML("Classification — by Pharmacological Class & Glycaemic Mechanism", ANTIDIABETIC_CLASSES);
  }
  function miscellaneousClassificationHTML() {
    return buildClassificationHTML("Classification — by Pharmacological Class & Clinical Target", MISCELLANEOUS_CLASSES);
  }

  function renderGrid() {
    const grid = $("#stGrid");
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
      if (c.id === "opioids" && state.cat === "opioids" && !f) html += opioidClassificationHTML();
      if (c.id === "relaxants" && state.cat === "relaxants" && !f) html += relaxantClassificationHTML();
      if (c.id === "induction" && state.cat === "induction" && !f) html += inductionClassificationHTML();
      if (c.id === "local" && state.cat === "local" && !f) html += localClassificationHTML();
      if (c.id === "vasopressors" && state.cat === "vasopressors" && !f) html += vasopressorClassificationHTML();
      if (c.id === "nsaids" && state.cat === "nsaids" && !f) html += nsaidsClassificationHTML();
      if (c.id === "antihypertensives" && state.cat === "antihypertensives" && !f) html += antihypertensivesClassificationHTML();
      if (c.id === "antidiabetics" && state.cat === "antidiabetics" && !f) html += antidiabeticsClassificationHTML();
      if (c.id === "miscellaneous" && state.cat === "miscellaneous" && !f) html += miscellaneousClassificationHTML();
      html += `<div class="st-grid">${list.map(tileHTML).join("")}</div>`;
    });
    if (typeof window.KNUnmountAllTileMolecules === "function") {
      window.KNUnmountAllTileMolecules();
    }
    grid.innerHTML = total ? html : `<div class="st-empty">No results for “${esc(state.filter)}”.</div>`;
    observeReveal(grid);
    observeTileMolecules(grid);
  }

  function showList() {
    document.querySelectorAll("#stDetail .st-molecule-viewer.st-has-canvas").forEach((node) => {
      if (typeof window.KNDisposeMolecule3D === "function") window.KNDisposeMolecule3D(node);
    });
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
  // Intelligent structured text formatter:
  // - Formats sequential numbered items (e.g. '1. ', '1) ') into clean <ol class="st-num-list">
  // - Formats bullet markers (•, -, *) into clean <ul class="st-bullets">
  // - Handles nested sub-bullets within numbered list items without orphan blank bullets
  // - Supports markdown-style cross-links [Label](item:item-id) and [Label](url)
  // - Highlights key numerical values, units, and safety keywords
  // - Renders narrative text as readable paragraphs <p class="st-prose">
  function formatStructuredText(text, isDrug = false) {
    if (!text) return "";

    function sanitizeLatexMath(str) {
      if (!str || !str.includes("$")) return str;
      str = str.replace(/\$\$([\s\S]*?)\$\$/g, (m, inner) => inner.trim());
      str = str.replace(/(?<!\$)\$(?!\$|\{)([^$\n]+)\$/g, (m, inner) => {
        let clean = inner
          .replace(/\\text\{([^}]+)\}/g, "$1")
          .replace(/\\mathrm\{([^}]+)\}/g, "$1")
          .replace(/\\times/g, "×")
          .replace(/\\ge/g, "≥")
          .replace(/\\le/g, "≤")
          .replace(/\\approx/g, "≈")
          .replace(/\\cdot/g, "·")
          .replace(/\\circ/g, "°")
          .replace(/\\Delta/g, "Δ")
          .replace(/\\rightarrow/g, "→")
          .replace(/\\,/g, " ")
          .replace(/\\%/g, "%")
          .replace(/\\left\(/g, "(").replace(/\\right\)/g, ")")
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
          .replace(/\^\{([^}]+)\}/g, "<sup>$1</sup>")
          .replace(/\_\{([^}]+)\}/g, "<sub>$1</sub>")
          .replace(/\^([0-9\+\-]+)/g, "<sup>$1</sup>")
          .replace(/\_([0-9a-zA-Z]+)/g, "<sub>$1</sub>")
          .replace(/\\/g, "");
        return clean;
      });
      return str.replace(/\$/g, "");
    }

    text = sanitizeLatexMath(text);

    function highlightHeading(str) {
      return str.replace(/^([A-Z0-9][^:—–\n]{1,55}[:—–])\s*/, (m, label) => `<strong>${label}</strong> `);
    }

    function processContent(str) {
      let res = esc(str);
      // Process markdown-style cross links [Label](item:id) or [Label](url)
      res = res.replace(/\[([^\]]+)\]\((item:([a-zA-Z0-9_\-]+)|([^\)]+))\)/g, (m, label, target, itemId, url) => {
        if (itemId) {
          return `<a href="?item=${esc(itemId)}" class="st-cross-link" data-item="${esc(itemId)}">${esc(label)} →</a>`;
        }
        return `<a href="${esc(url)}" class="st-cross-link" target="_blank" rel="noopener">${esc(label)} ↗</a>`;
      });
      // Markdown bold and italics (e.g. procedures in inverted commas and italics: *“...”*)
      res = res.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
      res = res.replace(/\*([^*]+)\*/g, "<em>$1</em>");
      res = highlightKeyValues(res);
      res = highlightHeading(res);
      return res;
    }

    function formatItemText(raw) {
      const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines.slice(1).some((l) => /^[\u2022\u25cf\u25cb\-\*]\s+/.test(l))) {
        const head = lines[0];
        const subItems = [];
        let curSub = null;
        for (const line of lines.slice(1)) {
          const m = line.match(/^[\u2022\u25cf\u25cb\-\*]\s+(.*)/);
          if (m) {
            if (curSub) subItems.push(curSub);
            curSub = m[1];
          } else if (curSub) {
            curSub += " " + line;
          } else {
            subItems.push(line);
          }
        }
        if (curSub) subItems.push(curSub);
        return `${processContent(head)}<ul class="st-bullets st-sub-bullets" style="margin-top:8px;">${subItems.map((s) => `<li>${processContent(s)}</li>`).join("")}</ul>`;
      }
      return processContent(raw.replace(/\n+/g, " "));
    }

    const rawBlocks = text.trim().split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    let html = "";

    for (const block of rawBlocks) {
      // Check if block has inline numbered items (e.g. 1) ... 2) ... or 1. ... 2. ...)
      const inlineMatches = [...block.matchAll(/(?:^|\s+)(?:(\d+)[\.\)]|\((\d+)\))\s+/g)];
      if (inlineMatches.length >= 2) {
        const nums = inlineMatches.map((m) => parseInt(m[1] || m[2], 10));
        if (nums[0] === 1 && nums[1] === 2) {
          const leadText = block.slice(0, inlineMatches[0].index).trim();
          if (leadText) {
            html += `<p class="st-prose">${processContent(leadText)}</p>`;
          }
          const items = [];
          for (let i = 0; i < inlineMatches.length; i++) {
            const start = inlineMatches[i].index + inlineMatches[i][0].length;
            const end = i + 1 < inlineMatches.length ? inlineMatches[i + 1].index : block.length;
            items.push(block.slice(start, end).trim());
          }
          html += `<ol class="st-num-list">${items.map((it) => `<li>${formatItemText(it)}</li>`).join("")}</ol>`;
          continue;
        }
      }

      // Split block into individual lines
      const lines = block.split("\n");
      const hasNumbered = lines.some((l) => /^\s*(\d+)[\.\)]\s+/.test(l));
      const hasBullets = lines.some((l) => /^\s*[\u2022\u25cf\u25cb\-\*]\s+/.test(l));

      if (hasNumbered) {
        const items = [];
        let currentItem = null;
        let introLines = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const m = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
          if (m) {
            if (currentItem) items.push(currentItem);
            currentItem = { num: parseInt(m[1], 10), raw: m[2] };
          } else if (currentItem) {
            currentItem.raw += "\n" + trimmed;
          } else {
            introLines.push(trimmed);
          }
        }
        if (currentItem) items.push(currentItem);

        if (introLines.length) {
          html += `<p class="st-prose">${processContent(introLines.join(" "))}</p>`;
        }
        if (items.length) {
          html += `<ol class="st-num-list">${items.map((it) => `<li>${formatItemText(it.raw)}</li>`).join("")}</ol>`;
        }
        continue;
      }

      if (hasBullets) {
        const items = [];
        let currentItem = null;
        let introLines = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const m = trimmed.match(/^[\u2022\u25cf\u25cb\-\*]\s+(.*)/);
          if (m) {
            if (currentItem) items.push(currentItem);
            currentItem = m[1];
          } else if (currentItem) {
            currentItem += "\n" + trimmed;
          } else {
            introLines.push(trimmed);
          }
        }
        if (currentItem) items.push(currentItem);

        if (introLines.length) {
          html += `<p class="st-prose">${processContent(introLines.join(" "))}</p>`;
        }
        if (items.length) {
          html += `<ul class="st-bullets">${items.map((it) => `<li>${formatItemText(it)}</li>`).join("")}</ul>`;
        }
        continue;
      }

      // Drug monograph with multiple sentences
      if (isDrug) {
        const sentences = block.split(/(?<=[.!?])\s+(?=[A-Z0-9“"'(\[])/).map((s) => s.trim()).filter(Boolean);
        if (sentences.length > 1) {
          html += `<ul class="st-bullets">${sentences.map((s) => `<li>${processContent(s)}</li>`).join("")}</ul>`;
        } else {
          html += `<p class="st-prose">${processContent(block)}</p>`;
        }
        continue;
      }

      // Default narrative paragraph
      html += `<p class="st-prose">${processContent(block)}</p>`;
    }

    // Merge adjacent lists
    html = html.replace(/<\/ol>\s*<ol class="st-num-list">/g, "");
    html = html.replace(/<\/ul>\s*<ul class="st-bullets">/g, "");

    return html;
  }

  const para = (text) => formatStructuredText(text, true);
  const paras = (text) => formatStructuredText(text, false);

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

    let mediaHTML = "";
    if (has3d) {
      mediaHTML += `
        <div class="st-structure-pane st-structure-3d-pane">
          <div class="st-structure-badge st-badge-3d"><span>🔄</span> 3D Conformer (Rotating / Interactive)</div>
          <div class="st-molecule-viewer" data-drug="${esc(d.id)}" aria-label="Rotating 3D structure of ${esc(d.name)}">
            <div class="st-molecule-placeholder"><span class="st-spinner"></span> Loading 3D model...</div>
          </div>
        </div>`;
    }
    if (rec2d) {
      mediaHTML += `
        <div class="st-structure-pane st-structure-2d-pane">
          <div class="st-structure-badge st-badge-2d"><span>📐</span> 2D Complete Chemical Structure</div>
          <div class="st-structure-2d-box">
            <div class="st-structure-svg">${rec2d.svg}</div>
            ${rec2d.formula ? `<span class="st-structure-formula">${esc(rec2d.formula)}</span>` : ""}
          </div>
        </div>`;
    }

    return `<div class="st-structure-wrap st-structure-dual">
        ${mediaHTML}
      </div>
      ${para(d.structure)}`;
  }

  // Mounts the rotating Three.js viewer (study-molecule-3d.js) into every
  // .st-molecule-viewer placeholder under `root`. Uses requestAnimationFrame
  // so that small containers (e.g. the 64×64 title-card media) have been
  // laid out and have real pixel dimensions before the WebGL renderer tries
  // to size itself — a zero-size renderer renders nothing and silently fails.
  // Falls back gracefully if KNMountMolecule3D isn't available yet.
  function mountStructureViewers(root) {
    const nodes = Array.from(root.querySelectorAll(".st-molecule-viewer[data-drug]"));
    if (!nodes.length) return;

    function attemptAll() {
      nodes.forEach((node) => {
        if (!node.isConnected) return; // skip if navigated away already
        const drugId = node.getAttribute("data-drug");
        const data = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[drugId];
        if (!data) return;
        if (typeof window.KNMountMolecule3D !== "function") return;
        try {
          const isThumbnail = !!node.closest(".st-title-card-media");
          const ok = window.KNMountMolecule3D(node, data, { isThumbnail });
          if (!ok) {
            const pane = node.closest(".st-structure-3d-pane");
            if (pane) pane.style.display = "none";
          }
        } catch (err) {
          const pane = node.closest(".st-structure-3d-pane");
          if (pane) pane.style.display = "none";
        }
      });
    }

    // One rAF ensures the DOM has been painted and every container has
    // non-zero clientWidth/clientHeight before the renderer calls setSize().
    requestAnimationFrame(() => {
      if (typeof window.KNMountMolecule3D === "function") {
        attemptAll();
      } else {
        // Module not yet executed — wait for its ready event (fires once).
        window.addEventListener("kn-molecule3d-ready", attemptAll, { once: true });
      }
    });
  }

  function callout(kind, label, text) {
    if (!text) return "";
    const innerHTML = formatStructuredText(text, false);
    return `<div class="st-callout st-callout-${kind}"><span class="st-callout-label">${esc(label)}</span>${innerHTML}</div>`;
  }

  // All drug sections render in one continuous scroll — no tabs to click
  // through, so the full monograph is visible/readable in a single pass.
  function drugSectionCard(d, section) {
    switch (section) {
      case "overview":
        return card("Overview", `<p class="st-tagline-lg">${esc(d.tagline)}</p>
          ${d.brand ? `<p><strong>Brand name(s):</strong> ${esc(d.brand)}</p>` : ""}
          <p><strong>Class:</strong> ${esc(catById.get(d.cat).label)}</p>
          ${d.classification ? `<p><strong>Classification:</strong> ${esc(d.classification)}</p>` : ""}
          ${d.tags && d.tags.length ? `<div class="st-tagrow">${d.tags.map((t) => `<span class="st-chip">${esc(t)}</span>`).join("")}</div>` : ""}
          ${d.crossLinks && Array.isArray(d.crossLinks) ? `<div class="st-cross-link-box" style="margin-top:14px;">${d.crossLinks.map((cl) => `<a href="?item=${esc(cl.item)}" class="st-cross-link" data-item="${esc(cl.item)}">${esc(cl.label)} →</a>`).join("")}</div>` : ""}`);
      case "structure": return card("Chemical Structure", structureBodyHTML(d));
      case "pd": return card("Pharmacodynamics", formatStructuredText(d.pd, true));
      case "pk": return card("Pharmacokinetics", formatStructuredText(d.pk, true));
      case "dosage": return card("Dosage (FDA-Approved)", formatStructuredText(d.dosage, true));
      case "offlabel": return card("Off-Label Uses", formatStructuredText(d.offLabel, true));
      case "complications": {
        const compBody = formatStructuredText(d.complications, true);
        const compLinks = d.complicationCrossLinks && Array.isArray(d.complicationCrossLinks)
          ? `<div class="st-cross-link-box" style="margin-top:14px;">${d.complicationCrossLinks.map((cl) => `<a href="?item=${esc(cl.item)}" class="st-cross-link" data-item="${esc(cl.item)}">${esc(cl.label)} →</a>`).join("")}</div>`
          : "";
        return card("Complications", compBody + compLinks);
      }
      case "references": {
        if (!d.references || (Array.isArray(d.references) && !d.references.length)) return "";
        const refs = Array.isArray(d.references) ? d.references : [d.references];
        return card("Standard References & Prescribing Guidelines", `<ul class="st-bullets">${refs.map((r) => `<li>📚 ${highlightKeyValues(esc(r))}</li>`).join("")}</ul>`);
      }
      default: return "";
    }
  }
  function drugFullPanelHTML(d) {
    return DRUG_SECTIONS.map((s) => drugSectionCard(d, s)).join("");
  }

  function videoCardHTML(v) {
    if (!v || (!v.src && !v.externalUrl)) return "";
    let instaEmbedHTML = "";
    if (v.externalUrl && /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/.test(v.externalUrl)) {
      const match = v.externalUrl.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
      if (match && match[1]) {
        instaEmbedHTML = `<div class="st-instagram-embed-wrap" style="max-width:540px;margin:0 auto 14px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.12);background:rgba(0,0,0,0.3);box-shadow:0 4px 16px rgba(0,0,0,0.3);">
          <iframe src="https://www.instagram.com/p/${match[1]}/embed/" width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy" style="display:block;border:none;"></iframe>
        </div>`;
      }
    }
    return `<section class="st-card st-reveal st-video-card" aria-label="${esc(v.title || "Video Demonstration")}">
      <h3>🎬 ${esc(v.title || "Video Demonstration")}</h3>
      <div class="st-card-body">
        ${v.src ? `<div class="st-video-wrap">
          <video class="st-video-player" controls playsinline preload="metadata">
            <source src="${esc(v.src)}" type="video/mp4">
            Your browser does not support HTML5 video playback.
          </video>
        </div>` : ""}
        ${instaEmbedHTML}
        ${v.externalUrl ? `<div class="st-video-ext" style="margin-top:10px;">
          <a href="${esc(v.externalUrl)}" target="_blank" rel="noopener" class="st-video-link-btn" style="display:inline-flex;align-items:center;gap:8px;padding:9px 18px;background:linear-gradient(135deg,#e11d48,#be123c);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 2px 10px rgba(225,29,72,0.35);"><span>▶</span> ${esc(v.externalLabel || "Watch on Instagram Reel")} ↗</a>
          <span style="display:block;margin-top:8px;font-size:12.5px;color:#94a3b8;word-break:break-all;"><strong style="color:#cbd5e1;">Direct Link:</strong> <a href="${esc(v.externalUrl)}" target="_blank" rel="noopener" style="color:#38bdf8;text-decoration:underline;">${esc(v.externalUrl)}</a></span>
        </div>` : ""}
      </div>
    </section>`;
  }

  function renderSectionTableHTML(tbl) {
    if (!tbl || !tbl.headers || !tbl.rows) return "";
    const ths = tbl.headers.map((h) => `<th class="st-th">${esc(h)}</th>`).join("");
    const trs = tbl.rows.map((row, rIdx) => {
      const isAlt = rIdx % 2 === 1 ? " st-tr-alt" : "";
      const tds = row.map((cell) => {
        if (typeof cell === "object" && cell !== null) {
          const badgeHTML = cell.badge ? `<span class="st-td-badge" style="background:${cell.badgeColor || '#0284c7'};">${esc(cell.badge)}</span>` : "";
          return `<td class="st-td">${badgeHTML}${highlightKeyValues(esc(cell.text || ""))}</td>`;
        }
        return `<td class="st-td">${highlightKeyValues(esc(String(cell)))}</td>`;
      }).join("");
      return `<tr class="st-tr${isAlt}">${tds}</tr>`;
    }).join("");
    return `<div class="st-table-wrap">
      <table class="st-table">
        <thead><tr class="st-thead-tr">${ths}</tr></thead>
        <tbody>${trs}</tbody>
      </table>
      ${tbl.caption ? `<p class="st-diagram-caption">${esc(tbl.caption)}</p>` : ""}
    </div>`;
  }

  function topicPanelHTML(t) {
    const sectionsHTML = t.sections.map((s) => {
      let diagramHTML = "";
      if (s.diagram === "mapleson-grid") diagramHTML = maplesonGridHTML();
      else if (s.diagram === "venturi-schematic") diagramHTML = venturiDiagramHTML();
      else if (s.diagram === "cylinder-pin-index") diagramHTML = cylinderDiagramHTML();
      else if (s.diagram === "infusion-mechanisms") diagramHTML = infusionPumpDiagramHTML();
      else if (s.diagram === "soda-lime-reaction") diagramHTML = sodaLimeDiagramHTML();
      else if (s.diagram === "workstation-flowchart") diagramHTML = workstationFlowchartHTML();
      else if (s.diagram === "fluid-compartments") diagramHTML = fluidCompartmentsDiagramHTML();
      else if (s.diagram === "blood-products-guide") diagramHTML = bloodProductsDiagramHTML();
      else if (s.diagram === "ecg-basic-waves") diagramHTML = ecgBasicWavesDiagramHTML();
      else if (s.diagram === "ecg-axis-wheel") diagramHTML = ecgAxisWheelDiagramHTML();
      else if (s.diagram === "ecg-lvh-waveform") diagramHTML = ecgLvhDiagramHTML();
      else if (s.diagram === "ecg-rvh-waveform") diagramHTML = ecgRvhDiagramHTML();
      else if (s.diagram === "ecg-bbb-comparison") diagramHTML = ecgBbbDiagramHTML();
      else if (s.diagram === "ecg-stemi-evolution") diagramHTML = ecgStemiDiagramHTML();
      else if (s.diagram === "ecg-heart-blocks") diagramHTML = ecgHeartBlocksDiagramHTML();
      else if (s.diagram === "ecg-vt-waveform") diagramHTML = ecgVtDiagramHTML();
      else if (s.diagram === "ecg-vf-waveform") diagramHTML = ecgVfDiagramHTML();
      else if (s.diagram === "ecg-hyperkalemia-waveform") diagramHTML = ecgHyperkalemiaDiagramHTML();
      else if (s.diagram === "ecg-hypokalemia-waveform") diagramHTML = ecgHypokalemiaDiagramHTML();
      else if (s.diagram === "ecg-pacemaker-waveform") diagramHTML = ecgPacemakerDiagramHTML();
      else if (s.diagram === "abg-stepwise-flowchart") diagramHTML = abgStepwiseFlowchartHTML();
      else if (s.diagram === "abg-anion-gap-balance") diagramHTML = abgAnionGapBalanceHTML();
      else if (s.diagram === "abg-compensation-rules") diagramHTML = abgCompensationRulesDiagramHTML();
      else if (s.diagram === "abg-hagma-nagma-tree") diagramHTML = abgHagmaNagmaTreeDiagramHTML();

      let imagesHTML = "";
      if (Array.isArray(s.images)) {
        imagesHTML = s.images.map((img) => `<div class="st-diagram-wrap st-section-img-wrap" style="margin-bottom:14px;"><img src="${esc(img.src)}" alt="${esc(img.alt || "")}" class="st-section-img" loading="lazy" style="max-width:100%;border-radius:10px;display:block;margin:0 auto 10px;box-shadow:0 4px 16px rgba(0,0,0,0.25);">${img.caption ? `<p class="st-diagram-caption">${esc(img.caption)}</p>` : ""}</div>`).join("");
      } else if (s.image) {
        imagesHTML = `<div class="st-diagram-wrap st-section-img-wrap"><img src="${esc(s.image.src)}" alt="${esc(s.image.alt || "")}" class="st-section-img" loading="lazy" style="max-width:100%;border-radius:10px;display:block;margin:0 auto 10px;box-shadow:0 4px 16px rgba(0,0,0,0.25);">${s.image.caption ? `<p class="st-diagram-caption">${esc(s.image.caption)}</p>` : ""}</div>`;
      }

      const tableHTML = s.table ? renderSectionTableHTML(s.table) : "";
      const secVideoHTML = s.video ? videoCardHTML(s.video) : "";
      const linkHTML = s.link ? `<div class="st-section-link-wrap" style="margin-top:14px;"><a href="${esc(s.link.url)}" class="st-pill st-pill-btn" style="display:inline-flex;align-items:center;gap:8px;padding:9px 18px;background:linear-gradient(135deg,#0284c7,#2563eb);color:#fff;border-radius:8px;text-decoration:none;font-weight:600;box-shadow:0 2px 10px rgba(37,99,235,0.35);">${esc(s.link.label || "Open Tool / Calculator")} ↗</a></div>` : "";
      let crossLinksHTML = "";
      if (s.crossLinks && Array.isArray(s.crossLinks)) {
        crossLinksHTML = `<div class="st-cross-link-box" style="margin-top:14px;">${s.crossLinks.map((cl) => `<a href="?item=${esc(cl.item)}" class="st-cross-link" data-item="${esc(cl.item)}">${esc(cl.label)} →</a>`).join("")}</div>`;
      }

      const body = `${s.b ? formatStructuredText(s.b, false) : ""}` +
        callout("example", "🧩 Worked example", s.example) +
        callout("pitfall", "⚠️ Common pitfall", s.pitfall) +
        callout("pearl", "💡 Key point", s.pearl) +
        tableHTML +
        imagesHTML +
        diagramHTML +
        secVideoHTML +
        linkHTML +
        crossLinksHTML;
      return card(s.h, body);
    }).join("");
    const videoHTML = t.video ? videoCardHTML(t.video) : "";
    let refHTML = "";
    if (t.references && t.references.length) {
      const refs = Array.isArray(t.references) ? t.references : [t.references];
      refHTML = card("Standard References & Clinical Guidelines", `<ul class="st-bullets">${refs.map((r) => `<li>📚 ${highlightKeyValues(esc(r))}</li>`).join("")}</ul>`);
    }
    return sectionsHTML + videoHTML + refHTML;
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

  /* ------------------------------------------------- Venturi schematic diagram */
  function venturiDiagramHTML() {
    return `<div class="st-diagram-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Venturi air entrainment valve physics and color coding" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;">
        <defs>
          <linearGradient id="vO2Grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="1"/>
          </linearGradient>
          <linearGradient id="vMixGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8"/>
            <stop offset="100%" stop-color="#059669" stop-opacity="0.9"/>
          </linearGradient>
          <marker id="vArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="currentColor"/>
          </marker>
        </defs>

        <!-- Nozzle & Housing Contours -->
        <path d="M 30,110 L 150,110 L 220,135 L 250,135 L 290,110 L 510,110 L 510,95 L 530,95 L 530,195 L 510,195 L 510,180 L 290,180 L 250,155 L 220,155 L 150,180 L 30,180 Z" fill="rgba(255,255,255,0.04)" stroke="currentColor" stroke-width="2"/>
        
        <!-- High-pressure O2 Drive Inflow -->
        <rect x="30" y="125" width="120" height="40" fill="url(#vO2Grad)" opacity="0.35"/>
        <line x1="40" y1="145" x2="140" y2="145" stroke="#38bdf8" stroke-width="3" marker-end="url(#vArrow)"/>
        <text x="85" y="140" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">100% O₂ DRIVE</text>
        <text x="85" y="160" font-size="9" fill="currentColor" text-anchor="middle">High Pressure / Low Velocity</text>

        <!-- Constricted Jet Nozzle -->
        <polygon points="150,125 220,140 220,150 150,165" fill="#0284c7" opacity="0.85"/>
        <line x1="220" y1="145" x2="260" y2="145" stroke="#f59e0b" stroke-width="3" marker-end="url(#vArrow)"/>
        <text x="235" y="130" font-size="10" font-weight="800" fill="#f59e0b" text-anchor="middle">JET NOZZLE</text>
        <text x="235" y="172" font-size="9" fill="#f59e0b" text-anchor="middle">Velocity ↑↑  Static P ↓↓</text>

        <!-- Air Entrainment Windows (Top & Bottom) -->
        <rect x="220" y="70" width="60" height="40" fill="rgba(100,116,139,0.15)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="250" y1="50" x2="250" y2="125" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#vArrow)"/>
        <text x="250" y="42" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle">ROOM AIR (21% O₂)</text>

        <rect x="220" y="180" width="60" height="40" fill="rgba(100,116,139,0.15)" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3,3"/>
        <line x1="250" y1="240" x2="250" y2="165" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#vArrow)"/>
        <text x="250" y="255" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle">ROOM AIR (21% O₂)</text>

        <!-- Mixing & Diffuser Zone -->
        <rect x="290" y="115" width="220" height="60" fill="url(#vMixGrad)" opacity="0.3"/>
        <line x1="300" y1="145" x2="490" y2="145" stroke="#10b981" stroke-width="3" marker-end="url(#vArrow)"/>
        <text x="400" y="140" font-size="12" font-weight="800" fill="#10b981" text-anchor="middle">HOMOGENOUS MIXTURE</text>
        <text x="400" y="160" font-size="10" fill="currentColor" text-anchor="middle">Total Flow > 30–40 L/min (Exceeds Peak PIFR)</text>

        <!-- Patient Mask Port Connector -->
        <rect x="510" y="100" width="40" height="90" fill="rgba(255,255,255,0.08)" stroke="currentColor" stroke-width="2"/>
        <text x="530" y="150" font-size="10" font-weight="800" fill="currentColor" text-anchor="middle" transform="rotate(90 530 150)">TO MASK (22 mm)</text>

        <!-- Physics Callout Box -->
        <rect x="580" y="50" width="165" height="195" rx="8" fill="rgba(15,23,42,0.6)" stroke="#0ea5e9" stroke-width="1"/>
        <text x="662" y="70" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">BERNOULLI & VENTURI</text>
        <text x="590" y="90" font-size="9" fill="currentColor">• Narrow nozzle: Speed ↑</text>
        <text x="590" y="105" font-size="9" fill="currentColor">• Lateral pressure: P &lt; P_atm</text>
        <text x="590" y="120" font-size="9" fill="currentColor">• Viscous shear entrains air</text>
        <text x="590" y="145" font-size="9" font-weight="700" fill="#f59e0b">ENTRAINMENT RATIO:</text>
        <text x="590" y="162" font-size="10" font-weight="800" fill="currentColor">Air:O₂ = (100-FiO₂)/(FiO₂-21)</text>
        <text x="590" y="185" font-size="8.5" fill="#ef4444">⚠️ Downstream backpressure</text>
        <text x="590" y="198" font-size="8.5" fill="#ef4444">reduces entrainment → FiO₂ ↑</text>
        <text x="590" y="210" font-size="8.5" fill="#ef4444">and Total Flow ↓↓</text>

        <!-- Valve Color Specifications Table -->
        <g transform="translate(30, 275)">
          <rect x="0" y="0" width="700" height="90" rx="6" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="12" y="18" font-size="11" font-weight="800" fill="currentColor">STANDARD COLOUR-CODED VENTURI VALVES (ISO / BRITISH STANDARD):</text>
          
          <!-- Blue 24% -->
          <rect x="12" y="26" width="105" height="52" rx="4" fill="#0284c7" fill-opacity="0.2" stroke="#0284c7" stroke-width="1.5"/>
          <text x="64" y="42" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">BLUE • 24%</text>
          <text x="64" y="56" font-size="9" fill="currentColor" text-anchor="middle">2 L/min O₂ • 25:1</text>
          <text x="64" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 52 L/min</text>

          <!-- White 28% -->
          <rect x="126" y="26" width="105" height="52" rx="4" fill="#f8fafc" fill-opacity="0.15" stroke="#e2e8f0" stroke-width="1.5"/>
          <text x="178" y="42" font-size="11" font-weight="800" fill="#f8fafc" text-anchor="middle">WHITE • 28%</text>
          <text x="178" y="56" font-size="9" fill="currentColor" text-anchor="middle">4 L/min O₂ • 10:1</text>
          <text x="178" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 44 L/min</text>

          <!-- Orange 31% -->
          <rect x="240" y="26" width="105" height="52" rx="4" fill="#ea580c" fill-opacity="0.2" stroke="#ea580c" stroke-width="1.5"/>
          <text x="292" y="42" font-size="11" font-weight="800" fill="#fb923c" text-anchor="middle">ORANGE • 31%</text>
          <text x="292" y="56" font-size="9" fill="currentColor" text-anchor="middle">6 L/min O₂ • 7:1</text>
          <text x="292" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 48 L/min</text>

          <!-- Yellow 35% -->
          <rect x="354" y="26" width="105" height="52" rx="4" fill="#ca8a04" fill-opacity="0.2" stroke="#eab308" stroke-width="1.5"/>
          <text x="406" y="42" font-size="11" font-weight="800" fill="#fde047" text-anchor="middle">YELLOW • 35%</text>
          <text x="406" y="56" font-size="9" fill="currentColor" text-anchor="middle">8 L/min O₂ • 5:1</text>
          <text x="406" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 48 L/min</text>

          <!-- Red 40% -->
          <rect x="468" y="26" width="105" height="52" rx="4" fill="#dc2626" fill-opacity="0.2" stroke="#ef4444" stroke-width="1.5"/>
          <text x="520" y="42" font-size="11" font-weight="800" fill="#f87171" text-anchor="middle">RED • 40%</text>
          <text x="520" y="56" font-size="9" fill="currentColor" text-anchor="middle">10 L/min O₂ • 3:1</text>
          <text x="520" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 40 L/min</text>

          <!-- Green 60% -->
          <rect x="582" y="26" width="105" height="52" rx="4" fill="#16a34a" fill-opacity="0.2" stroke="#22c55e" stroke-width="1.5"/>
          <text x="634" y="42" font-size="11" font-weight="800" fill="#4ade80" text-anchor="middle">GREEN • 60%</text>
          <text x="634" y="56" font-size="9" fill="currentColor" text-anchor="middle">15 L/min O₂ • 1:1</text>
          <text x="634" y="70" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Total: 30 L/min</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Venturi entrainment mechanism and high-flow fixed-performance color codes. Constriction accelerates oxygen flow, creating sub-atmospheric lateral pressure that draws in precise ratios of ambient air. Total delivered flow consistently exceeds peak inspiratory flow, guaranteeing steady FiO₂ irrespective of patient ventilatory pattern.</p>
    </div>`;
  }

  /* ------------------------------------------------- Medical Gas Cylinder schematic */
  function cylinderDiagramHTML() {
    return `<div class="st-diagram-wrap">
      <svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pin Index Safety System and medical gas cylinder specifications" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;">
        <!-- Left: Pin Index Radial Arc Diagram -->
        <g transform="translate(30, 20)">
          <rect x="0" y="0" width="340" height="320" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="170" y="28" font-size="13" font-weight="800" fill="currentColor" text-anchor="middle">PIN INDEX SAFETY SYSTEM (PISS)</text>
          <text x="170" y="45" font-size="9.5" fill="currentColor" opacity="0.8" text-anchor="middle">Flush valve face view (9/16" radius arc)</text>
          
          <!-- Outer circular valve face -->
          <circle cx="170" cy="145" r="85" fill="rgba(0,0,0,0.2)" stroke="currentColor" stroke-width="2"/>
          <!-- Central Gas Outlet Port -->
          <circle cx="170" cy="120" r="16" fill="#0ea5e9" stroke="#38bdf8" stroke-width="2"/>
          <text x="170" y="124" font-size="8" font-weight="800" fill="#fff" text-anchor="middle">GAS PORT</text>

          <!-- 7-Pin Arc positions (R=50 from port 170,120) -->
          <!-- Pos 1: angle ~210 deg -->
          <circle cx="127" cy="145" r="7" fill="rgba(255,255,255,0.15)" stroke="currentColor" stroke-width="1.5"/>
          <text x="110" y="149" font-size="10" font-weight="700" fill="currentColor">1</text>
          
          <!-- Pos 2: angle ~230 deg -->
          <circle cx="138" cy="158" r="7" fill="#22c55e" stroke="#16a34a" stroke-width="2"/>
          <text x="122" y="172" font-size="10" font-weight="800" fill="#22c55e">2 [O₂]</text>

          <!-- Pos 3: angle ~250 deg -->
          <circle cx="153" cy="168" r="7" fill="#3b82f6" stroke="#2563eb" stroke-width="2"/>
          <text x="153" y="186" font-size="10" font-weight="800" fill="#3b82f6" text-anchor="middle">3 [N₂O]</text>

          <!-- Pos 7: center at bottom -->
          <circle cx="170" cy="170" r="7" fill="#ec4899" stroke="#db2777" stroke-width="2"/>
          <text x="170" y="196" font-size="10" font-weight="800" fill="#ec4899" text-anchor="middle">7 [Entonox]</text>

          <!-- Pos 4: angle ~290 deg -->
          <circle cx="187" cy="168" r="7" fill="rgba(255,255,255,0.15)" stroke="currentColor" stroke-width="1.5"/>
          <text x="187" y="186" font-size="10" font-weight="700" fill="currentColor" text-anchor="middle">4</text>

          <!-- Pos 5: angle ~310 deg -->
          <circle cx="202" cy="158" r="7" fill="#22c55e" stroke="#16a34a" stroke-width="2"/>
          <text x="218" y="172" font-size="10" font-weight="800" fill="#22c55e">5 [O₂/N₂O]</text>

          <!-- Pos 6: angle ~330 deg -->
          <circle cx="213" cy="145" r="7" fill="rgba(255,255,255,0.15)" stroke="currentColor" stroke-width="1.5"/>
          <text x="227" y="149" font-size="10" font-weight="700" fill="currentColor">6</text>

          <!-- Bodok Seal Callout -->
          <g transform="translate(15, 230)">
            <rect x="0" y="0" width="310" height="75" rx="5" fill="rgba(14,165,233,0.08)" stroke="#0ea5e9" stroke-width="1"/>
            <text x="12" y="18" font-size="10.5" font-weight="800" fill="#38bdf8">BODOK SEAL (CRITICAL SAFETY COMPONENT):</text>
            <text x="12" y="34" font-size="9" fill="currentColor">• Neoprene rubber ring bonded within aluminum washer</text>
            <text x="12" y="48" font-size="9" fill="currentColor">• Thickness: 2.4 mm · Fits flush over yoke nipple</text>
            <text x="12" y="62" font-size="9" font-weight="700" fill="#ef4444">⚠️ NEVER use 2 Bodok seals (bypasses pin index safety!)</text>
          </g>
        </g>

        <!-- Right: PISS Configurations & Color Codes Matrix -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="340" height="320" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="170" y="28" font-size="13" font-weight="800" fill="currentColor" text-anchor="middle">EXAM PIN CODES & COLOR STANDARDS</text>
          
          <!-- Oxygen -->
          <g transform="translate(12, 45)">
            <rect x="0" y="0" width="316" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="#22c55e" stroke-width="1.2"/>
            <circle cx="16" cy="21" r="8" fill="#22c55e"/>
            <text x="32" y="18" font-size="11" font-weight="800" fill="currentColor">Oxygen (O₂) • Pin 2, 5</text>
            <text x="32" y="33" font-size="9" fill="currentColor">ISO: White body & shoulder | US: Green | UK/Ind: Black/White</text>
          </g>

          <!-- Nitrous Oxide -->
          <g transform="translate(12, 95)">
            <rect x="0" y="0" width="316" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="#3b82f6" stroke-width="1.2"/>
            <circle cx="16" cy="21" r="8" fill="#3b82f6"/>
            <text x="32" y="18" font-size="11" font-weight="800" fill="currentColor">Nitrous Oxide (N₂O) • Pin 3, 5</text>
            <text x="32" y="33" font-size="9" fill="currentColor">French Blue body & shoulder (Universal) · SVP ~51 bar</text>
          </g>

          <!-- Medical Air -->
          <g transform="translate(12, 145)">
            <rect x="0" y="0" width="316" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="#64748b" stroke-width="1.2"/>
            <circle cx="16" cy="21" r="8" fill="#64748b"/>
            <text x="32" y="18" font-size="11" font-weight="800" fill="currentColor">Medical Air • Pin 1, 5</text>
            <text x="32" y="33" font-size="9" fill="currentColor">ISO/UK: Black/white quarters | US: Yellow · 137 bar</text>
          </g>

          <!-- Entonox -->
          <g transform="translate(12, 195)">
            <rect x="0" y="0" width="316" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="#ec4899" stroke-width="1.2"/>
            <circle cx="16" cy="21" r="8" fill="#ec4899"/>
            <text x="32" y="18" font-size="11" font-weight="800" fill="currentColor">Entonox (50% O₂ / 50% N₂O) • Pin 7</text>
            <text x="32" y="33" font-size="9" fill="currentColor">Blue body, blue/white quarters shoulder · Poynting effect</text>
          </g>

          <!-- Carbon Dioxide -->
          <g transform="translate(12, 245)">
            <rect x="0" y="0" width="316" height="42" rx="4" fill="rgba(255,255,255,0.04)" stroke="#a855f7" stroke-width="1.2"/>
            <circle cx="16" cy="21" r="8" fill="#a855f7"/>
            <text x="32" y="18" font-size="11" font-weight="800" fill="currentColor">Carbon Dioxide (CO₂) • Pin 1, 6</text>
            <text x="32" y="33" font-size="9" fill="currentColor">Grey body & shoulder · Filling ratio 0.67–0.75</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Pin Index Safety System (PISS) geometry and color coding. Specific paired pins on the machine yoke engage corresponding holes on the cylinder valve face, physically preventing gas cylinder misconnections. A single Bodok seal ensures an airtight high-pressure seal.</p>
    </div>`;
  }

  /* ------------------------------------------------- Infusion Pump & TCI schematic */
  function infusionPumpDiagramHTML() {
    return `<div class="st-diagram-wrap">
      <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Syringe infusion pump mechanism and Target-Controlled Infusion 3-compartment model" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;">
        <!-- Left: Syringe Driver Hardware Mechanism -->
        <g transform="translate(30, 20)">
          <rect x="0" y="0" width="340" height="310" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="170" y="26" font-size="12" font-weight="800" fill="currentColor" text-anchor="middle">SYRINGE DRIVER MECHANISM</text>

          <!-- Motor & Lead Screw -->
          <rect x="25" y="55" width="45" height="40" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="47" y="78" font-size="9" font-weight="800" fill="#fff" text-anchor="middle">STEPPER</text>
          <text x="47" y="89" font-size="8" fill="#fff" text-anchor="middle">MOTOR</text>

          <!-- Threaded Lead Screw -->
          <line x1="70" y1="75" x2="185" y2="75" stroke="#f59e0b" stroke-width="5" stroke-dasharray="2,2"/>
          <text x="127" y="65" font-size="8.5" font-weight="700" fill="#f59e0b" text-anchor="middle">Lead Screw</text>

          <!-- Pusher Block -->
          <rect x="185" y="45" width="22" height="60" rx="3" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
          <text x="196" y="118" font-size="8" fill="currentColor" text-anchor="middle">Pusher</text>

          <!-- Syringe Plunger -->
          <line x1="207" y1="75" x2="250" y2="75" stroke="#94a3b8" stroke-width="4"/>
          <!-- Syringe Barrel -->
          <rect x="235" y="55" width="75" height="40" rx="2" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
          <line x1="250" y1="57" x2="250" y2="93" stroke="#0ea5e9" stroke-width="3"/>
          <text x="272" y="78" font-size="9" font-weight="700" fill="#38bdf8" text-anchor="middle">50 mL Syringe</text>
          <!-- Syringe Nozzle & Line -->
          <rect x="310" y="72" width="15" height="6" fill="#38bdf8"/>
          <line x1="325" y1="75" x2="335" y2="75" stroke="#38bdf8" stroke-width="2"/>

          <!-- Hardware Sensors Callout -->
          <g transform="translate(15, 140)">
            <rect x="0" y="0" width="310" height="150" rx="5" fill="rgba(15,23,42,0.5)" stroke="currentColor" stroke-width="1"/>
            <text x="10" y="18" font-size="10.5" font-weight="800" fill="#38bdf8">KEY SAFETY SENSORS & HAZARDS:</text>
            <text x="10" y="36" font-size="9" fill="currentColor">• <tspan font-weight="700">Barrel Clamp Sensor:</tspan> Verifies syringe diameter & size</text>
            <text x="10" y="52" font-size="9" fill="currentColor">• <tspan font-weight="700">Flange Detector:</tspan> Confirms plunger is correctly engaged</text>
            <text x="10" y="68" font-size="9" fill="currentColor">• <tspan font-weight="700">In-Line Pressure Sensor:</tspan> Detects downstream occlusion</text>
            <text x="10" y="84" font-size="9" fill="currentColor">• <tspan font-weight="700">Anti-Siphon Valve:</tspan> Prevents gravity-assisted free flow</text>
            <text x="10" y="104" font-size="9" font-weight="700" fill="#ef4444">⚠️ Syringe Brand Mismatch:</text>
            <text x="10" y="118" font-size="8.5" fill="#ef4444">Different barrel internal diameters (BD vs Terumo vs Braun)</text>
            <text x="10" y="130" font-size="8.5" fill="#ef4444">can produce infusion rate delivery errors exceeding 15–20%!</text>
          </g>
        </g>

        <!-- Right: Target-Controlled Infusion (TCI) 3-Compartment Model -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="340" height="310" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="170" y="26" font-size="12" font-weight="800" fill="currentColor" text-anchor="middle">TARGET-CONTROLLED INFUSION (TCI)</text>
          <text x="170" y="42" font-size="9" fill="currentColor" opacity="0.8" text-anchor="middle">3-Compartment Mammillary Pharmacokinetic Model</text>

          <!-- V1 Central Compartment -->
          <rect x="110" y="60" width="120" height="55" rx="6" fill="#0284c7" fill-opacity="0.3" stroke="#0284c7" stroke-width="2"/>
          <text x="170" y="82" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">V₁ CENTRAL</text>
          <text x="170" y="98" font-size="9" fill="currentColor" text-anchor="middle">Blood / Vessel-Rich</text>

          <!-- V2 Muscle / Rapid -->
          <rect x="20" y="160" width="115" height="50" rx="6" fill="#10b981" fill-opacity="0.25" stroke="#10b981" stroke-width="1.5"/>
          <text x="77" y="182" font-size="10" font-weight="800" fill="#34d399" text-anchor="middle">V₂ RAPID (Muscle)</text>
          <text x="77" y="196" font-size="8.5" fill="currentColor" text-anchor="middle">Intermediate Eq.</text>

          <!-- V3 Fat / Slow -->
          <rect x="205" y="160" width="115" height="50" rx="6" fill="#f59e0b" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5"/>
          <text x="262" y="182" font-size="10" font-weight="800" fill="#fbbf24" text-anchor="middle">V₃ SLOW (Fat)</text>
          <text x="262" y="196" font-size="8.5" fill="currentColor" text-anchor="middle">Deep Storage</text>

          <!-- Connectors V1 <-> V2 -->
          <line x1="120" y1="115" x2="77" y2="160" stroke="currentColor" stroke-width="1.5"/>
          <text x="85" y="135" font-size="8" font-weight="700" fill="currentColor">k₁₂ / k₂₁</text>

          <!-- Connectors V1 <-> V3 -->
          <line x1="220" y1="115" x2="262" y2="160" stroke="currentColor" stroke-width="1.5"/>
          <text x="250" y="135" font-size="8" font-weight="700" fill="currentColor">k₁₃ / k₃₁</text>

          <!-- Elimination k10 -->
          <line x1="170" y1="115" x2="170" y2="155" stroke="#ef4444" stroke-width="2"/>
          <text x="170" y="145" font-size="9" font-weight="800" fill="#ef4444" text-anchor="middle">k₁₀ Elimination</text>

          <!-- Effect Site Compartment (Ce) -->
          <g transform="translate(20, 235)">
            <rect x="0" y="0" width="300" height="60" rx="5" fill="rgba(168,85,247,0.15)" stroke="#a855f7" stroke-width="1.5"/>
            <text x="12" y="18" font-size="10" font-weight="800" fill="#c084fc">EFFECT-SITE TARGETING (Ce vs Cp):</text>
            <text x="12" y="34" font-size="8.5" fill="currentColor">• <tspan font-weight="700">ke0:</tspan> Rate constant for plasma-to-brain equilibration</text>
            <text x="12" y="48" font-size="8.5" fill="currentColor">• <tspan font-weight="700">Ce targeting:</tspan> Delivers transient plasma bolus overshoot to achieve brain target faster</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Syringe pump precision lead-screw mechanics and Target-Controlled Infusion (TCI) pharmacokinetic modeling. A stepper motor drives the lead screw against the syringe plunger. Microprocessor algorithms calculate continuous drug delivery across central and peripheral compartments based on validated patient PK/PD models.</p>
    </div>`;
  }

  /* ------------------------------------------------- Soda Lime & CO2 Absorber schematic */
  function sodaLimeDiagramHTML() {
    return `<div class="st-diagram-wrap">
      <svg viewBox="0 0 760 370" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Soda lime chemical reactions and absorber canister architecture" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;">
        <!-- Left: Absorber Canister Architecture -->
        <g transform="translate(30, 20)">
          <rect x="0" y="0" width="310" height="320" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="155" y="24" font-size="12" font-weight="800" fill="currentColor" text-anchor="middle">CIRCLE ABSORBER CANISTER</text>
          
          <!-- Outer Canister Body -->
          <rect x="75" y="45" width="160" height="210" rx="8" fill="rgba(0,0,0,0.25)" stroke="currentColor" stroke-width="2"/>
          <!-- Top Baffle & Port -->
          <rect x="130" y="35" width="50" height="10" fill="currentColor" opacity="0.3"/>
          <text x="155" y="42" font-size="8" font-weight="700" fill="currentColor" text-anchor="middle">Exhaled Gas In</text>

          <!-- Granule Bed Zones -->
          <!-- Zone 1: Exhausted (Top) -->
          <rect x="80" y="55" width="150" height="50" fill="#7c3aed" fill-opacity="0.55"/>
          <text x="155" y="78" font-size="10" font-weight="800" fill="#ddd6fe" text-anchor="middle">EXHAUSTED ZONE</text>
          <text x="155" y="92" font-size="8" fill="#ddd6fe" text-anchor="middle">Ethyl Violet: Purple (pH &lt; 10.3)</text>

          <!-- Zone 2: Active Reaction Band (Middle) -->
          <rect x="80" y="105" width="150" height="50" fill="#f59e0b" fill-opacity="0.3"/>
          <text x="155" y="128" font-size="10" font-weight="800" fill="#fbbf24" text-anchor="middle">ACTIVE REACTION BAND</text>
          <text x="155" y="142" font-size="8" fill="#fbbf24" text-anchor="middle">Exothermic Heat &amp; Water Generated</text>

          <!-- Zone 3: Fresh Granules (Bottom) -->
          <rect x="80" y="155" width="150" height="95" fill="rgba(255,255,255,0.08)"/>
          <text x="155" y="195" font-size="10" font-weight="800" fill="currentColor" text-anchor="middle">FRESH GRANULES</text>
          <text x="155" y="210" font-size="8" fill="currentColor" text-anchor="middle">White (pH &gt; 10.3) · High Reserve</text>

          <!-- Bottom Port -->
          <rect x="130" y="255" width="50" height="10" fill="currentColor" opacity="0.3"/>
          <text x="155" y="278" font-size="9" font-weight="700" fill="#10b981" text-anchor="middle">Scrubbed Gas Out (CO₂ Free)</text>

          <!-- Mesh Size Note -->
          <text x="155" y="305" font-size="9" fill="currentColor" opacity="0.8" text-anchor="middle">Granule Mesh Size: 4 to 8 mesh (2.5–5.0 mm)</text>
        </g>

        <!-- Right: Chemical Reactions & Exam Pearls -->
        <g transform="translate(360, 20)">
          <rect x="0" y="0" width="370" height="320" rx="8" fill="rgba(255,255,255,0.03)" stroke="currentColor" stroke-width="1"/>
          <text x="185" y="24" font-size="12" font-weight="800" fill="currentColor" text-anchor="middle">EXAM CHEMISTRY &amp; CRITICAL HAZARDS</text>

          <!-- 3-Step Reaction Box -->
          <g transform="translate(15, 38)">
            <rect x="0" y="0" width="340" height="110" rx="5" fill="rgba(14,165,233,0.08)" stroke="#0ea5e9" stroke-width="1"/>
            <text x="10" y="18" font-size="10" font-weight="800" fill="#38bdf8">3-STEP EXOTHERMIC REACTION SEQUENCE:</text>
            <text x="10" y="36" font-size="9.5" font-weight="700" fill="currentColor">1. CO₂ + H₂O ⇌ H₂CO₃  <tspan font-weight="400" fill="#94a3b8">(Carbonic acid formation)</tspan></text>
            <text x="10" y="56" font-size="9.5" font-weight="700" fill="currentColor">2. H₂CO₃ + 2NaOH → Na₂CO₃ + 2H₂O + Heat</text>
            <text x="10" y="76" font-size="9.5" font-weight="700" fill="currentColor">3. Na₂CO₃ + Ca(OH)₂ → CaCO₃↓ + 2NaOH</text>
            <text x="10" y="96" font-size="8.5" fill="#10b981">• Exothermic: Releases ~13,000 kcal per mol CO₂ absorbed</text>
          </g>

          <!-- Rebound Phenomenon Callout -->
          <g transform="translate(15, 158)">
            <rect x="0" y="0" width="340" height="72" rx="5" fill="rgba(124,58,237,0.1)" stroke="#7c3aed" stroke-width="1.2"/>
            <text x="10" y="16" font-size="10" font-weight="800" fill="#c084fc">REBOUND / REGENERATION PHENOMENON (VIVA FAVORITE):</text>
            <text x="10" y="32" font-size="8.5" fill="currentColor">• Exhausted purple soda lime rested overnight turns white again.</text>
            <text x="10" y="46" font-size="8.5" fill="currentColor">• Internal Ca(OH)₂ diffuses to surface, neutralizing Na₂CO₃ (pH rises > 10.3).</text>
            <text x="10" y="60" font-size="8.5" font-weight="700" fill="#ef4444">⚠️ FALSE REASSURANCE: Reverts to purple within minutes of clinical reuse!</text>
          </g>

          <!-- Degradation Hazards Box -->
          <g transform="translate(15, 238)">
            <rect x="0" y="0" width="340" height="72" rx="5" fill="rgba(239,68,68,0.08)" stroke="#ef4444" stroke-width="1"/>
            <text x="10" y="16" font-size="10" font-weight="800" fill="#f87171">TOXIC DEGRADATION PRODUCTS:</text>
            <text x="10" y="32" font-size="8.5" fill="currentColor">• <tspan font-weight="700">Compound A:</tspan> Sevoflurane + strong base (NaOH/KOH). Nephrotoxic in rats.</text>
            <text x="10" y="46" font-size="8.5" fill="currentColor">• <tspan font-weight="700">Carbon Monoxide (CO):</tspan> Desflurane &gt;&gt; Isoflurane + completely dry absorbent.</text>
            <text x="10" y="60" font-size="8.5" fill="currentColor">• Modern alkali-free absorbents (Amsorb Plus, Litholyme) prevent both risks.</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Soda lime CO₂ absorption chemistry and dual-canister circle architecture. Exhaled CO₂ reacts with water and catalytic sodium hydroxide to precipitate calcium carbonate. Ethyl violet indicator monitors pH depletion, while understanding the rebound phenomenon and desiccation hazards prevents clinical misadventures.</p>
    </div>`;
  }

  /* ------------------------------------------------- Workstation 7-Step Check Flowchart */
  function workstationFlowchartHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 460" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="7-Step Anaesthesia Machine Pre-Use Checkout Flowchart" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <defs>
          <marker id="wfArrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7" class="st-wf-arrow-head"/>
          </marker>
          <marker id="wfArrowGreen" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" class="st-wf-arrow-head-green"/>
          </marker>
        </defs>

        <!-- Main Title Header -->
        <text x="380" y="22" font-size="12" font-weight="800" text-anchor="middle" letter-spacing="1.2" class="st-wf-header-title">ANAESTHESIA MACHINE CHECKOUT — 7-STEP FLOWCHART</text>

        <!-- ROW 1: Steps 1 to 4 -->
        <!-- Step 1: Emergency & Backup -->
        <g transform="translate(18, 35)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#0284c7" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#0284c7"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(2,132,199,0.2)" stroke="#0284c7" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#0284c7" text-anchor="middle" class="st-wf-pill-txt">STEP 1</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Emergency Backup</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Autonomous Kit</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Ambu Bag + mask</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• Suction (&lt;-500 mmHg)</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• Aux O₂ cylinder ≥1000 psi</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#0284c7" class="st-wf-highlight-1">Lifeline if power/gas fails</text>
        </g>

        <!-- Arrow 1 -> 2 -->
        <line x1="183" y1="114" x2="198" y2="114" stroke="#0284c7" stroke-width="2.5" marker-end="url(#wfArrow)" class="st-wf-conn-line"/>

        <!-- Step 2: High Pressure -->
        <g transform="translate(204, 35)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#d97706" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#d97706"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(217,119,6,0.2)" stroke="#d97706" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#d97706" text-anchor="middle" class="st-wf-pill-txt">STEP 2</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">High Pressure</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Cylinders &amp; Yokes</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• 1 Bodok seal per yoke</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• O₂ cylinder ≥1000 psi</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• 1-min leak decay &lt;100 psi</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#d97706" class="st-wf-highlight-2">Close spindle after check</text>
        </g>

        <!-- Arrow 2 -> 3 -->
        <line x1="369" y1="114" x2="384" y2="114" stroke="#0284c7" stroke-width="2.5" marker-end="url(#wfArrow)" class="st-wf-conn-line"/>

        <!-- Step 3: Intermediate Pressure -->
        <g transform="translate(390, 35)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#2563eb" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#2563eb"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(37,99,235,0.2)" stroke="#2563eb" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#2563eb" text-anchor="middle" class="st-wf-pill-txt">STEP 3</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Intermediate P</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Pipelines &amp; Fail-Safe</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Pipelines at 50–55 psi</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• O₂ flush (35–75 L/min)</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• Fail-safe cuts N₂O flow</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#2563eb" class="st-wf-highlight-3">Audible whistle alarm test</text>
        </g>

        <!-- Arrow 3 -> 4 -->
        <line x1="555" y1="114" x2="570" y2="114" stroke="#0284c7" stroke-width="2.5" marker-end="url(#wfArrow)" class="st-wf-conn-line"/>

        <!-- Step 4: Low Pressure -->
        <g transform="translate(576, 35)">
          <rect x="0" y="0" width="166" height="158" rx="8" class="st-wf-card-bg" stroke="#dc2626" stroke-width="1.5"/>
          <rect x="0" y="0" width="166" height="5" rx="2" fill="#dc2626"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(220,38,38,0.2)" stroke="#dc2626" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#dc2626" text-anchor="middle" class="st-wf-pill-txt">STEP 4</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Low Pressure</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Suction Bulb at CGO</text>
          <line x1="10" y1="65" x2="156" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Suction bulb at CGO</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• Flat collapse hold ≥10s</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• Test each vaporizer @ 1%</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#dc2626" class="st-wf-highlight-4">Interlock prevents dual use</text>
        </g>

        <!-- Connecting Pathway from Step 4 down to Step 5 -->
        <path d="M 659,193 L 659,216 L 99,216 L 99,249" fill="none" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="4,3" marker-end="url(#wfArrow)" class="st-wf-connector"/>
        <rect x="315" y="206" width="130" height="20" rx="10" class="st-wf-conn-pill"/>
        <text x="380" y="220" font-size="9" font-weight="800" text-anchor="middle" class="st-wf-conn-text">Step 5 to 7: Circuit &amp; Delivery ➔</text>

        <!-- ROW 2: Steps 5 to 7 + Induction Ready -->
        <!-- Step 5: Breathing Circuit -->
        <g transform="translate(18, 255)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#059669" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#059669"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(5,150,105,0.2)" stroke="#059669" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#059669" text-anchor="middle" class="st-wf-pill-txt">STEP 5</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Breathing Circuit</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Absorber &amp; Leak Test</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Soda lime white &amp; moist</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• Calibrate O₂ sensor (21/100%)</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• 30 cmH₂O hold ≥10s</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#059669" class="st-wf-highlight-5">Two-bag test for valves</text>
        </g>

        <!-- Arrow 5 -> 6 -->
        <line x1="183" y1="334" x2="198" y2="334" stroke="#0284c7" stroke-width="2.5" marker-end="url(#wfArrow)" class="st-wf-conn-line"/>

        <!-- Step 6: Ventilator & AGSS -->
        <g transform="translate(204, 255)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#7c3aed" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#7c3aed"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(124,58,237,0.2)" stroke="#7c3aed" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#7c3aed" text-anchor="middle" class="st-wf-pill-txt">STEP 6</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Ventilator &amp; AGSS</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Bellows &amp; Alarms</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Ascending bellows to top</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• Disconnect alarm ≤15s</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• AGSS float in green band</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#7c3aed" class="st-wf-highlight-6">Spirometer volume ±10%</text>
        </g>

        <!-- Arrow 6 -> 7 -->
        <line x1="369" y1="334" x2="384" y2="334" stroke="#0284c7" stroke-width="2.5" marker-end="url(#wfArrow)" class="st-wf-conn-line"/>

        <!-- Step 7: Final Pre-Induction Setup -->
        <g transform="translate(390, 255)">
          <rect x="0" y="0" width="162" height="158" rx="8" class="st-wf-card-bg" stroke="#0d9488" stroke-width="1.5"/>
          <rect x="0" y="0" width="162" height="5" rx="2" fill="#0d9488"/>
          <rect x="10" y="12" width="52" height="16" rx="8" class="st-wf-pill-bg" fill="rgba(13,148,136,0.2)" stroke="#0d9488" stroke-width="1"/>
          <text x="36" y="24" font-size="9" font-weight="800" fill="#0d9488" text-anchor="middle" class="st-wf-pill-txt">STEP 7</text>
          <text x="10" y="44" font-size="11.5" font-weight="800" class="st-wf-card-title">Final Pre-Induction</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Settings &amp; Drugs</text>
          <line x1="10" y1="65" x2="152" y2="65" class="st-wf-card-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Vaporizers locked OFF</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• APL valve fully OPEN</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• Bag/Vent set to BAG</text>
          <text x="10" y="130" font-size="8" font-weight="700" fill="#0d9488" class="st-wf-highlight-7">Emergency drugs ready</text>
        </g>

        <!-- Arrow 7 -> 8 -->
        <line x1="555" y1="334" x2="570" y2="334" stroke="#10b981" stroke-width="2.5" marker-end="url(#wfArrowGreen)" class="st-wf-conn-line-green"/>

        <!-- Induction Ready Badge Card -->
        <g transform="translate(576, 255)">
          <rect x="0" y="0" width="166" height="158" rx="8" class="st-wf-ready-bg" stroke="#10b981" stroke-width="2"/>
          <rect x="0" y="0" width="166" height="5" rx="2" fill="#10b981"/>
          <rect x="10" y="12" width="70" height="16" rx="8" class="st-wf-ready-badge" fill="#10b981"/>
          <text x="45" y="24" font-size="9" font-weight="900" class="st-wf-ready-badge-txt" fill="#ffffff" text-anchor="middle">READY ✓</text>
          <text x="10" y="44" font-size="11.5" font-weight="900" class="st-wf-ready-title">Induction Ready</text>
          <text x="10" y="58" font-size="8.5" font-weight="600" class="st-wf-card-sub">Patient Safety Assured</text>
          <line x1="10" y1="65" x2="156" y2="65" class="st-wf-ready-line" stroke-width="1"/>
          <text x="10" y="80" font-size="8.5" class="st-wf-card-bullet">• Suction under pillow</text>
          <text x="10" y="95" font-size="8.5" class="st-wf-card-bullet">• Monitors connected</text>
          <text x="10" y="110" font-size="8.5" class="st-wf-card-bullet">• Airway trolley checked</text>
          <text x="10" y="130" font-size="8" font-weight="800" class="st-wf-ready-action">SAFE TO INDUCE</text>
        </g>

        <!-- Footer / Legend -->
        <text x="380" y="442" font-size="9.5" text-anchor="middle" class="st-wf-footer">Systematic Pre-Use Checkout Sequence · Miller 10th Ed. &amp; Dorsch 5th Ed. Standards</text>
      </svg>
      <p class="st-diagram-caption">Interactive 7-Step Anaesthesia Machine Checkout Flowchart. Follow this sequential order before every theatre list: Emergency Backup ➔ High Pressure ➔ Intermediate Pressure ➔ Low Pressure ➔ Circuit &amp; Absorber ➔ Ventilator ➔ Final Pre-Induction Verification.</p>
    </div>`;
  }


  /* ---------------------------------------------------------------- fluid compartments diagram */
  function fluidCompartmentsDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Intravenous Fluid Compartmental Distribution Dynamics" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <!-- Header -->
        <text x="380" y="24" font-size="12.5" font-weight="800" text-anchor="middle" letter-spacing="1.1" fill="var(--st-text, #f8fafc)">INTRAVENOUS FLUID COMPARTMENTAL DISTRIBUTION DYNAMICS</text>
        <text x="380" y="42" font-size="9" text-anchor="middle" fill="#94a3b8">Total Body Water (TBW = 42 L in 70-kg Adult) • Pharmacokinetic Distribution &amp; Intravascular Yield</text>

        <!-- TOP ROW: Compartment Architecture -->
        <g transform="translate(18, 55)">
          <!-- ICF Box -->
          <rect x="0" y="0" width="350" height="95" rx="8" fill="rgba(14,165,233,0.12)" stroke="#0284c7" stroke-width="1.8"/>
          <text x="175" y="22" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">INTRACELLULAR FLUID (ICF) • 28 LITRES (67% TBW)</text>
          <text x="175" y="40" font-size="8.5" fill="#cbd5e1" text-anchor="middle">Major Cation: K⁺ (140 mmol/L) · Mg²⁺ (30) · Phosphates &amp; Proteins</text>
          <text x="175" y="58" font-size="8" fill="#94a3b8" text-anchor="middle">Cell membranes impermeable to Na⁺ (Na⁺/K⁺-ATPase active extrusion)</text>
          <rect x="25" y="68" width="300" height="18" rx="4" fill="rgba(2,132,199,0.25)"/>
          <text x="175" y="81" font-size="8.5" font-weight="700" fill="#7dd3fc" text-anchor="middle">D5W expands this space (67%) · Pure Crystalloids DO NOT enter ICF</text>
        </g>

        <g transform="translate(392, 55)">
          <!-- ECF Box -->
          <rect x="0" y="0" width="350" height="95" rx="8" fill="rgba(16,185,129,0.12)" stroke="#10b981" stroke-width="1.8"/>
          <text x="175" y="22" font-size="11" font-weight="800" fill="#34d399" text-anchor="middle">EXTRACELLULAR FLUID (ECF) • 14 LITRES (33% TBW)</text>
          <!-- Interstitial Sub-box -->
          <rect x="15" y="32" width="180" height="55" rx="5" fill="rgba(16,185,129,0.2)" stroke="#059669" stroke-width="1.2"/>
          <text x="105" y="48" font-size="9" font-weight="700" fill="#6ee7b7" text-anchor="middle">Interstitial Fluid (ISF)</text>
          <text x="105" y="62" font-size="8" fill="#a7f3d0" text-anchor="middle">10.5 Litres (75% of ECF)</text>
          <text x="105" y="76" font-size="7.5" fill="#94a3b8" text-anchor="middle">Crystalloid repository</text>
          <!-- Intravascular Plasma Sub-box -->
          <rect x="205" y="32" width="130" height="55" rx="5" fill="rgba(220,38,38,0.2)" stroke="#ef4444" stroke-width="1.5"/>
          <text x="270" y="48" font-size="9" font-weight="800" fill="#fca5a5" text-anchor="middle">Plasma Volume</text>
          <text x="270" y="62" font-size="8" fill="#fecaca" text-anchor="middle">3.5 Litres (25% ECF)</text>
          <text x="270" y="76" font-size="7.5" font-weight="700" fill="#f87171" text-anchor="middle">TARGET COMPARTMENT</text>
        </g>

        <!-- BOTTOM ROW: 4 Fluid Infusion Comparisons (After 1000 mL / unit infused) -->
        <!-- 1. D5W -->
        <g transform="translate(18, 165)">
          <rect x="0" y="0" width="170" height="205" rx="8" fill="rgba(30,41,59,0.7)" stroke="#64748b" stroke-width="1.4"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#38bdf8"/>
          <text x="85" y="24" font-size="10.5" font-weight="800" fill="#38bdf8" text-anchor="middle">5% Dextrose (D5W)</text>
          <text x="85" y="38" font-size="8" font-weight="600" fill="#94a3b8" text-anchor="middle">1000 mL Infused (278 mOsm)</text>
          <!-- Bar Graph -->
          <rect x="15" y="48" width="140" height="22" rx="3" fill="#0284c7" fill-opacity="0.8"/>
          <text x="85" y="63" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">ICF: 667 mL (67%)</text>
          <rect x="15" y="74" width="140" height="22" rx="3" fill="#059669" fill-opacity="0.8"/>
          <text x="85" y="89" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">ISF: 250 mL (25%)</text>
          <rect x="15" y="100" width="140" height="26" rx="3" fill="#dc2626" fill-opacity="0.9"/>
          <text x="85" y="116" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">Plasma: ONLY 83 mL</text>
          <!-- Bullet points -->
          <text x="12" y="142" font-size="7.8" fill="#cbd5e1">• Yield: 1/12th in plasma</text>
          <text x="12" y="156" font-size="7.8" fill="#cbd5e1">• Glucose metabolized instantly</text>
          <text x="12" y="170" font-size="7.8" fill="#fca5a5">• Useless for hypovolaemia!</text>
          <text x="12" y="184" font-size="7.8" font-weight="700" fill="#ef4444">⚠️ Brain herniation risk in TBI</text>
          <text x="12" y="198" font-size="7.2" fill="#94a3b8">Use: Pure water loss / carrier</text>
        </g>

        <!-- 2. Balanced Crystalloids -->
        <g transform="translate(200, 165)">
          <rect x="0" y="0" width="170" height="205" rx="8" fill="rgba(30,41,59,0.7)" stroke="#059669" stroke-width="1.4"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#10b981"/>
          <text x="85" y="24" font-size="10.5" font-weight="800" fill="#34d399" text-anchor="middle">Balanced Crystalloid</text>
          <text x="85" y="38" font-size="8" font-weight="600" fill="#94a3b8" text-anchor="middle">RL / Hartmann's / Plasma-Lyte</text>
          <!-- Bar Graph -->
          <rect x="15" y="48" width="140" height="18" rx="3" fill="#334155"/>
          <text x="85" y="61" font-size="8" fill="#94a3b8" text-anchor="middle">ICF: 0 mL (Zero entry)</text>
          <rect x="15" y="70" width="140" height="26" rx="3" fill="#059669" fill-opacity="0.8"/>
          <text x="85" y="87" font-size="8.5" font-weight="700" fill="#fff" text-anchor="middle">ISF: 750–800 mL (75%)</text>
          <rect x="15" y="100" width="140" height="26" rx="3" fill="#dc2626" fill-opacity="0.9"/>
          <text x="85" y="116" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">Plasma: 200–250 mL</text>
          <!-- Bullet points -->
          <text x="12" y="142" font-size="7.8" fill="#cbd5e1">• Yield: 1/4th to 1/5th in plasma</text>
          <text x="12" y="156" font-size="7.8" fill="#cbd5e1">• Rule: 3:1 replacement ratio</text>
          <text x="12" y="170" font-size="7.8" fill="#86efac">• First-line surgical fluid</text>
          <text x="12" y="184" font-size="7.8" fill="#cbd5e1">• Prevents hyperchloraemic acidosis</text>
          <text x="12" y="198" font-size="7.2" fill="#94a3b8">RL calcium: incompatible with blood</text>
        </g>

        <!-- 3. 5% Albumin -->
        <g transform="translate(382, 165)">
          <rect x="0" y="0" width="170" height="205" rx="8" fill="rgba(30,41,59,0.7)" stroke="#d97706" stroke-width="1.4"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#f59e0b"/>
          <text x="85" y="24" font-size="10.5" font-weight="800" fill="#fbbf24" text-anchor="middle">Human Albumin 5%</text>
          <text x="85" y="38" font-size="8" font-weight="600" fill="#94a3b8" text-anchor="middle">500 mL Iso-oncotic (COP 20 mmHg)</text>
          <!-- Bar Graph -->
          <rect x="15" y="48" width="140" height="18" rx="3" fill="#334155"/>
          <text x="85" y="61" font-size="8" fill="#94a3b8" text-anchor="middle">ICF: 0 mL</text>
          <rect x="15" y="70" width="140" height="18" rx="3" fill="#334155"/>
          <text x="85" y="83" font-size="8" fill="#94a3b8" text-anchor="middle">ISF: 0 mL (stays in vessel)</text>
          <rect x="15" y="92" width="140" height="34" rx="3" fill="#dc2626" fill-opacity="0.95"/>
          <text x="85" y="112" font-size="9.5" font-weight="900" fill="#fff" text-anchor="middle">Plasma: 500 mL (100%)</text>
          <!-- Bullet points -->
          <text x="12" y="142" font-size="7.8" fill="#cbd5e1">• Yield: 1:1 volume expansion</text>
          <text x="12" y="156" font-size="7.8" fill="#cbd5e1">• Remains inside glycocalyx</text>
          <text x="12" y="170" font-size="7.8" fill="#fde68a">• Minimal interstitial oedema</text>
          <text x="12" y="184" font-size="7.8" fill="#cbd5e1">• SBP / cirrhosis resuscitation</text>
          <text x="12" y="198" font-size="7.2" fill="#94a3b8">Higher cost than crystalloid</text>
        </g>

        <!-- 4. 20% Albumin -->
        <g transform="translate(564, 165)">
          <rect x="0" y="0" width="178" height="205" rx="8" fill="rgba(30,41,59,0.7)" stroke="#dc2626" stroke-width="1.4"/>
          <rect x="0" y="0" width="178" height="5" rx="2" fill="#ef4444"/>
          <text x="89" y="24" font-size="10.5" font-weight="800" fill="#f87171" text-anchor="middle">Albumin 20% / 25%</text>
          <text x="89" y="38" font-size="8" font-weight="600" fill="#94a3b8" text-anchor="middle">100 mL Hyper-oncotic (COP 100)</text>
          <!-- Bar Graph -->
          <rect x="15" y="48" width="148" height="18" rx="3" fill="#334155"/>
          <text x="89" y="61" font-size="8" fill="#94a3b8" text-anchor="middle">ICF: 0 mL</text>
          <rect x="15" y="70" width="148" height="20" rx="3" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="1"/>
          <text x="89" y="84" font-size="7.8" font-weight="700" fill="#fca5a5" text-anchor="middle">DRAWS -350 mL from ISF ⬆</text>
          <rect x="15" y="94" width="148" height="34" rx="3" fill="#dc2626"/>
          <text x="89" y="114" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">Plasma: +450 mL (450%!)</text>
          <!-- Bullet points -->
          <text x="12" y="142" font-size="7.8" fill="#cbd5e1">• Yield: 3.5–5x volume drawn</text>
          <text x="12" y="156" font-size="7.8" fill="#cbd5e1">• Massive oncotic gradient</text>
          <text x="12" y="170" font-size="7.8" font-weight="700" fill="#fde68a">• Large Paracentesis (>5L: 8g/L)</text>
          <text x="12" y="184" font-size="7.8" fill="#cbd5e1">• Hepatorenal syndrome (HRS)</text>
          <text x="12" y="198" font-size="7.2" fill="#fca5a5">⚠️ Heart failure overload hazard</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Intravenous Fluid Distribution Dynamics across Body Water Compartments. Notice how 1000 mL of D5W yields only 83 mL of intravascular expansion (1/12th), whereas balanced crystalloid yields 200–250 mL (1/4th to 1/5th), and 5% albumin expands intravascular volume 1:1.</p>
    </div>`;
  }

  /* ---------------------------------------------------------------- blood products guide diagram */
  function bloodProductsDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Blood Component Therapy and Massive Transfusion Protocol Diagram" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <!-- Header -->
        <text x="380" y="24" font-size="12.5" font-weight="800" text-anchor="middle" letter-spacing="1.1" fill="var(--st-text, #f8fafc)">BLOOD COMPONENT THERAPY &amp; MASSIVE TRANSFUSION PROTOCOL (MTP)</text>
        <text x="380" y="42" font-size="9" text-anchor="middle" fill="#94a3b8">Component Specifications, Storage Rules, Transfusion Thresholds &amp; Viscoelastic Haemostatic Targets</text>

        <!-- TOP ROW: 4 Core Blood Components -->
        <!-- PRBCs -->
        <g transform="translate(18, 55)">
          <rect x="0" y="0" width="170" height="155" rx="8" fill="rgba(190,18,60,0.15)" stroke="#e11d48" stroke-width="1.6"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#be123c"/>
          <text x="85" y="22" font-size="11" font-weight="800" fill="#fb7185" text-anchor="middle">Packed RBCs (PRBCs)</text>
          <text x="85" y="36" font-size="8" fill="#fecdd3" text-anchor="middle">Vol: ~300 mL · Hct 55–65%</text>
          <line x1="12" y1="44" x2="158" y2="44" stroke="#e11d48" stroke-width="0.8" opacity="0.6"/>
          <text x="12" y="60" font-size="8" fill="#cbd5e1">• Storage: 1°C to 6°C (35–42 d)</text>
          <text x="12" y="74" font-size="8" font-weight="700" fill="#fca5a5">• 1 Unit ⬆ Hb 1 g/dL, Hct 3%</text>
          <text x="12" y="88" font-size="8" fill="#cbd5e1">• Filter: Standard 170–260 μm</text>
          <text x="12" y="102" font-size="8" fill="#cbd5e1">• Infuse within 4 hours</text>
          <rect x="10" y="112" width="150" height="34" rx="4" fill="rgba(225,29,72,0.25)"/>
          <text x="85" y="126" font-size="8.2" font-weight="800" fill="#fff" text-anchor="middle">TRIGGER: Hb &lt;7.0 g/dL</text>
          <text x="85" y="139" font-size="7.5" fill="#fecdd3" text-anchor="middle">(&lt;8.0 g/dL in CAD / Cardiac / ACS)</text>
        </g>

        <!-- Platelets -->
        <g transform="translate(200, 55)">
          <rect x="0" y="0" width="170" height="155" rx="8" fill="rgba(217,119,6,0.15)" stroke="#f59e0b" stroke-width="1.6"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#d97706"/>
          <text x="85" y="22" font-size="11" font-weight="800" fill="#fcd34d" text-anchor="middle">Platelets (Apheresis/Pool)</text>
          <text x="85" y="36" font-size="8" fill="#fef3c7" text-anchor="middle">Vol: ~250 mL · ≥3.0×10¹¹ plts</text>
          <line x1="12" y1="44" x2="158" y2="44" stroke="#f59e0b" stroke-width="0.8" opacity="0.6"/>
          <text x="12" y="60" font-size="8" fill="#cbd5e1">• Storage: 20°C–24°C + Agitation</text>
          <text x="12" y="74" font-size="8" font-weight="700" fill="#fde68a">• 1 Dose ⬆ Count 30–50k/μL</text>
          <text x="12" y="88" font-size="8" fill="#cbd5e1">• Shelf-life: STRICT 5 DAYS</text>
          <text x="12" y="102" font-size="8" fill="#fca5a5">• Highest bacterial sepsis risk!</text>
          <rect x="10" y="112" width="150" height="34" rx="4" fill="rgba(245,158,11,0.25)"/>
          <text x="85" y="126" font-size="8.2" font-weight="800" fill="#fff" text-anchor="middle">TRIGGER: &lt;50k (Surgery/Bleed)</text>
          <text x="85" y="139" font-size="7.5" fill="#fef3c7" text-anchor="middle">&lt;100k (Neuro/Ocular) · &lt;10k (Proph)</text>
        </g>

        <!-- Fresh Frozen Plasma -->
        <g transform="translate(382, 55)">
          <rect x="0" y="0" width="170" height="155" rx="8" fill="rgba(3,105,161,0.15)" stroke="#0284c7" stroke-width="1.6"/>
          <rect x="0" y="0" width="170" height="5" rx="2" fill="#0369a1"/>
          <text x="85" y="22" font-size="11" font-weight="800" fill="#7dd3fc" text-anchor="middle">Fresh Frozen Plasma</text>
          <text x="85" y="36" font-size="8" fill="#e0f2fe" text-anchor="middle">Vol: 200–300 mL · All Clot Factors</text>
          <line x1="12" y1="44" x2="158" y2="44" stroke="#0284c7" stroke-width="0.8" opacity="0.6"/>
          <text x="12" y="60" font-size="8" fill="#cbd5e1">• Storage: ≤ -18°C (12 months)</text>
          <text x="12" y="74" font-size="8" font-weight="700" fill="#bae6fd">• Dose: 10 to 15 mL/kg (3–4 U)</text>
          <text x="12" y="88" font-size="8" fill="#cbd5e1">• Thaw at 37°C; use within 24h</text>
          <text x="12" y="102" font-size="8" fill="#cbd5e1">• Contains Factors V &amp; VIII</text>
          <rect x="10" y="112" width="150" height="34" rx="4" fill="rgba(2,132,199,0.25)"/>
          <text x="85" y="126" font-size="8.2" font-weight="800" fill="#fff" text-anchor="middle">TRIGGER: INR &gt;1.5–1.7</text>
          <text x="85" y="139" font-size="7.5" fill="#e0f2fe" text-anchor="middle">with active bleeding / trauma</text>
        </g>

        <!-- Cryoprecipitate -->
        <g transform="translate(564, 55)">
          <rect x="0" y="0" width="178" height="155" rx="8" fill="rgba(124,58,237,0.15)" stroke="#8b5cf6" stroke-width="1.6"/>
          <rect x="0" y="0" width="178" height="5" rx="2" fill="#7c3aed"/>
          <text x="89" y="22" font-size="11" font-weight="800" fill="#c4b5fd" text-anchor="middle">Cryoprecipitate</text>
          <text x="89" y="36" font-size="8" fill="#ede9fe" text-anchor="middle">10–20 mL/unit (Adult Pool: 5–10 U)</text>
          <line x1="12" y1="44" x2="166" y2="44" stroke="#8b5cf6" stroke-width="0.8" opacity="0.6"/>
          <text x="12" y="60" font-size="8" fill="#cbd5e1">• Storage: ≤ -18°C (12 months)</text>
          <text x="12" y="74" font-size="8" font-weight="700" fill="#ddd6fe">• Fibrinogen: ≥150 mg/unit</text>
          <text x="12" y="88" font-size="8" fill="#cbd5e1">• Also contains: Factor VIII, vWF, XIII</text>
          <text x="12" y="102" font-size="8" fill="#cbd5e1">• Thaw at 37°C; use within 4–6h</text>
          <rect x="10" y="112" width="158" height="34" rx="4" fill="rgba(139,92,246,0.25)"/>
          <text x="89" y="126" font-size="8.2" font-weight="800" fill="#fff" text-anchor="middle">TARGET: Fibrinogen &gt;1.5–2.0 g/L</text>
          <text x="89" y="139" font-size="7.5" fill="#ede9fe" text-anchor="middle">10 Units ⬆ Fibrinogen ~0.5 g/L</text>
        </g>

        <!-- BOTTOM ROW: Left = MTP 1:1:1 Protocol; Right = TEG/ROTEM Viscoelastic Algorithm -->
        <!-- MTP 1:1:1 Protocol -->
        <g transform="translate(18, 225)">
          <rect x="0" y="0" width="350" height="180" rx="8" fill="rgba(220,38,38,0.1)" stroke="#ef4444" stroke-width="1.8"/>
          <rect x="0" y="0" width="350" height="5" rx="2" fill="#dc2626"/>
          <text x="175" y="24" font-size="11" font-weight="800" fill="#f87171" text-anchor="middle">MASSIVE TRANSFUSION PROTOCOL (MTP) • 1:1:1 PACK</text>
          <!-- Ratio Boxes -->
          <g transform="translate(25, 34)">
            <rect x="0" y="0" width="90" height="42" rx="4" fill="#be123c"/>
            <text x="45" y="18" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">1 UNIT PRBC</text>
            <text x="45" y="32" font-size="7.5" fill="#fecdd3" text-anchor="middle">Oxygen Carriage</text>

            <rect x="105" y="0" width="90" height="42" rx="4" fill="#0369a1"/>
            <text x="150" y="18" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">1 UNIT FFP</text>
            <text x="150" y="32" font-size="7.5" fill="#e0f2fe" text-anchor="middle">Factor Reserve</text>

            <rect x="210" y="0" width="90" height="42" rx="4" fill="#d97706"/>
            <text x="255" y="18" font-size="9" font-weight="900" fill="#fff" text-anchor="middle">1 DOSE PLT</text>
            <text x="255" y="32" font-size="7.5" fill="#fef3c7" text-anchor="middle">Primary Haemostasis</text>
          </g>
          <!-- Adjuncts -->
          <text x="175" y="98" font-size="8.8" font-weight="700" fill="#fde68a" text-anchor="middle">CRITICAL ADJUNCTS IN DAMAGE CONTROL RESUSCITATION:</text>
          <text x="20" y="116" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#38bdf8">Tranexamic Acid (TXA):</tspan> 1 g IV within 3h, then 1 g over 8h (CRASH-2/WOMAN)</text>
          <text x="20" y="132" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#f87171">Calcium Chloride 1 g IV</tspan> per 4 units citrated blood (target iCa²⁺ &gt;0.9–1.0 mmol/L)</text>
          <text x="20" y="148" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#34d399">Prevent Lethal Triad:</tspan> Warm all fluids &gt;37°C · Treat acidosis (pH &gt;7.20)</text>
          <text x="20" y="164" font-size="7.8" fill="#94a3b8">• Definition: ≥10 units PRBCs / 24h OR &gt;4 units in 1h with ongoing bleeding</text>
        </g>

        <!-- Viscoelastic TEG / ROTEM Algorithm -->
        <g transform="translate(382, 225)">
          <rect x="0" y="0" width="360" height="180" rx="8" fill="rgba(15,23,42,0.8)" stroke="#38bdf8" stroke-width="1.8"/>
          <rect x="0" y="0" width="360" height="5" rx="2" fill="#0284c7"/>
          <text x="180" y="24" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle">VISCOELASTIC (TEG / ROTEM) TARGETED THERAPY</text>
          <!-- 4 Parameter Grid -->
          <g transform="translate(15, 34)">
            <!-- R-time / CT -->
            <rect x="0" y="0" width="160" height="60" rx="4" fill="rgba(2,132,199,0.18)" stroke="#0284c7" stroke-width="1"/>
            <text x="80" y="16" font-size="8.5" font-weight="800" fill="#7dd3fc" text-anchor="middle">R-time &gt;10 min / CT &gt;80s</text>
            <text x="80" y="30" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Deficiency: Clotting Factors</text>
            <text x="80" y="48" font-size="8.5" font-weight="800" fill="#38bdf8" text-anchor="middle">➔ Give FFP or 4F-PCC</text>

            <!-- Alpha / CFT -->
            <rect x="170" y="0" width="160" height="60" rx="4" fill="rgba(124,58,237,0.18)" stroke="#8b5cf6" stroke-width="1"/>
            <text x="250" y="16" font-size="8.5" font-weight="800" fill="#c4b5fd" text-anchor="middle">Alpha &lt;53° / FIBTEM &lt;10mm</text>
            <text x="250" y="30" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Deficiency: Fibrinogen / Mesh</text>
            <text x="250" y="48" font-size="8.5" font-weight="800" fill="#a78bfa" text-anchor="middle">➔ Cryoprecipitate / Fibrinogen</text>

            <!-- MA / MCF -->
            <rect x="0" y="68" width="160" height="60" rx="4" fill="rgba(217,119,6,0.18)" stroke="#f59e0b" stroke-width="1"/>
            <text x="80" y="84" font-size="8.5" font-weight="800" fill="#fcd34d" text-anchor="middle">MA &lt;50 mm / MCF &lt;45mm</text>
            <text x="80" y="98" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Deficiency: Platelets / Function</text>
            <text x="80" y="116" font-size="8.5" font-weight="800" fill="#fbbf24" text-anchor="middle">➔ Give Platelet Pack</text>

            <!-- LY30 / ML -->
            <rect x="170" y="68" width="160" height="60" rx="4" fill="rgba(220,38,38,0.18)" stroke="#ef4444" stroke-width="1"/>
            <text x="250" y="84" font-size="8.5" font-weight="800" fill="#fca5a5" text-anchor="middle">LY30 &gt;3% / ML &gt;15%</text>
            <text x="250" y="98" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Condition: Hyperfibrinolysis</text>
            <text x="250" y="116" font-size="8.5" font-weight="800" fill="#f87171" text-anchor="middle">➔ Give Tranexamic Acid (TXA)</text>
          </g>
          <text x="180" y="168" font-size="8" fill="#94a3b8" text-anchor="middle">Eliminates blind factor administration · Rapid results in 15–20 minutes</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Blood Component Specifications, MTP 1:1:1 Balanced Ratio, and Viscoelastic (TEG / ROTEM) Goal-Directed Transfusion Algorithm. Tailors factor, fibrinogen, platelet, and antifibrinolytic therapy to real-time whole blood clotting dynamics.</p>
    </div>`;
  }


  /* ---------------------------------------------------------------- ECG DIAGRAMS */
  
  /* 1. Basic ECG Waves & Intervals */
  function ecgBasicWavesDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Normal Sinus Rhythm ECG Complex Waves, Intervals and Calibration Standards" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <!-- Background Grid Container -->
        <rect x="10" y="10" width="740" height="330" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>
        <rect x="20" y="20" width="720" height="310" rx="6" fill="url(#monGridMajor)"/>

        <!-- Header Information -->
        <text x="35" y="42" font-size="11.5" font-weight="800" fill="#22c55e" letter-spacing="0.8">LEAD II  •  STANDARD NORMAL SINUS RHYTHM (NSR)</text>
        <text x="725" y="42" font-size="9.5" font-weight="700" fill="#94a3b8" text-anchor="end">CALIBRATION: 25 mm/s (40 ms/small box)  •  10 mm/mV (0.1 mV/small box)</text>

        <!-- Standard Calibration Pulse (10 mm high x 5 mm wide) -->
        <g transform="translate(35, 120)">
          <path d="M0 60 L15 60 L15 0 L30 0 L30 60 L45 60" fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round"/>
          <text x="22" y="75" font-size="8" font-weight="700" fill="#86efac" text-anchor="middle">1.0 mV</text>
          <text x="22" y="86" font-size="7.5" fill="#94a3b8" text-anchor="middle">(10 mm)</text>
        </g>

        <!-- Main Labeled P-QRS-T Waveform (Centered) -->
        <g transform="translate(100, 40)">
          <!-- Trace Path -->
          <path d="M0 140 L40 140 Q60 115 80 140 L105 140 L115 148 L130 20 L145 175 L155 140 L210 140 Q250 85 290 140 L340 140 Q355 130 370 140 L440 140 Q460 115 480 140 L505 140 L515 148 L530 20 L545 175 L555 140 L610 140"
                fill="none" stroke="#22c55e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#22c55e"/>

          <!-- Animated Sweep Beam -->
          <g class="ecg-beam">
            <rect x="0" y="0" width="30" height="280" fill="url(#sweepGradGreen)"/>
            <line x1="30" y1="0" x2="30" y2="280" stroke="#86efac" stroke-width="2"/>
            <circle cx="30" cy="140" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #22c55e)"/>
          </g>

          <!-- Wave Annotations -->
          <!-- P wave -->
          <circle cx="60" cy="126" r="3" fill="#38bdf8"/>
          <text x="60" y="112" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle">P</text>
          <text x="60" y="100" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Atrial Depol (&lt;120 ms)</text>

          <!-- Q wave -->
          <text x="112" y="165" font-size="10" font-weight="900" fill="#f87171" text-anchor="middle">Q</text>

          <!-- R wave peak -->
          <circle cx="130" cy="20" r="3.5" fill="#f59e0b"/>
          <text x="130" y="10" font-size="12" font-weight="900" fill="#fbbf24" text-anchor="middle">R</text>
          <text x="130" y="-3" font-size="8" fill="#fde68a" text-anchor="middle">Ventricular Depolarization</text>

          <!-- S wave -->
          <text x="145" y="193" font-size="10" font-weight="900" fill="#f87171" text-anchor="middle">S</text>

          <!-- J-Point -->
          <circle cx="155" cy="140" r="3.5" fill="#ef4444"/>
          <text x="175" y="152" font-size="8.5" font-weight="800" fill="#fca5a5">J-POINT</text>

          <!-- ST Segment -->
          <line x1="155" y1="135" x2="210" y2="135" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2,2"/>
          <text x="182" y="128" font-size="8.5" font-weight="800" fill="#fbbf24" text-anchor="middle">ST Segment (Isoelectric)</text>

          <!-- T wave -->
          <circle cx="250" cy="110" r="3" fill="#a855f7"/>
          <text x="250" y="98" font-size="11" font-weight="900" fill="#c084fc" text-anchor="middle">T</text>
          <text x="250" y="86" font-size="7.5" fill="#e9d5ff" text-anchor="middle">Ventricular Repol</text>

          <!-- U wave -->
          <text x="355" y="120" font-size="9" font-weight="800" fill="#94a3b8" text-anchor="middle">U</text>
          <text x="355" y="110" font-size="7" fill="#64748b" text-anchor="middle">Purkinje / Hypo-K</text>

          <!-- Interval Brackets (Bottom - Tiered to eliminate overlap) -->
          <!-- PR Interval (120 - 200 ms) -->
          <g transform="translate(40, 195)">
            <line x1="0" y1="0" x2="115" y2="0" stroke="#38bdf8" stroke-width="1.6"/>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#38bdf8" stroke-width="1.6"/>
            <line x1="115" y1="-5" x2="115" y2="5" stroke="#38bdf8" stroke-width="1.6"/>
            <text x="57" y="14" font-size="8.5" font-weight="800" fill="#38bdf8" text-anchor="middle">PR INTERVAL: 120–200 ms</text>
            <text x="57" y="24" font-size="7.5" fill="#94a3b8" text-anchor="middle">(3 to 5 small boxes)</text>
          </g>

          <!-- QRS Duration (<120 ms) -->
          <g transform="translate(115, 226)">
            <line x1="0" y1="0" x2="40" y2="0" stroke="#fbbf24" stroke-width="1.6"/>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#fbbf24" stroke-width="1.6"/>
            <line x1="40" y1="-5" x2="40" y2="5" stroke="#fbbf24" stroke-width="1.6"/>
            <text x="20" y="14" font-size="8.2" font-weight="800" fill="#fbbf24" text-anchor="middle">QRS &lt;100–120 ms</text>
          </g>

          <!-- QT / QTc Interval -->
          <g transform="translate(115, 252)">
            <line x1="0" y1="0" x2="175" y2="0" stroke="#c084fc" stroke-width="1.6"/>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#c084fc" stroke-width="1.6"/>
            <line x1="175" y1="-5" x2="175" y2="5" stroke="#c084fc" stroke-width="1.6"/>
            <text x="87" y="14" font-size="8.5" font-weight="800" fill="#c084fc" text-anchor="middle">QT INTERVAL (&lt;440 ms ♂, &lt;460 ms ♀)</text>
            <text x="87" y="24" font-size="7.5" fill="#f87171" text-anchor="middle">Critical Prolongation: QTc &gt;500 ms (Torsades Risk)</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Normal Sinus Rhythm (NSR) Standard P-QRS-T Morphology, Calibrations &amp; Diagnostic Intervals. Dynamic sweep beam simulates real-time cardiac monitoring sweep at standard 25 mm/s paper speed.</p>
    </div>`;
  }

  /* 2. Cardiac Axis Wheel Diagram */
  function ecgAxisWheelDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Einthoven Hexaxial Reference System and Cardiac Axis Quadrants" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <!-- Header -->
        <text x="380" y="24" font-size="12.5" font-weight="800" text-anchor="middle" letter-spacing="1.1" fill="var(--st-text, #f8fafc)">HEXAXIAL REFERENCE SYSTEM &amp; CARDIAC ELECTRICAL AXIS DETERMINATION</text>
        <text x="380" y="42" font-size="9" text-anchor="middle" fill="#94a3b8">Bipolar (I, II, III) &amp; Augmented Unipolar (aVR, aVL, aVF) Frontal Plane Vectors with Quadrant Logic</text>

        <!-- LEFT: Hexaxial Polar Wheel -->
        <g transform="translate(190, 210)">
          <!-- Circular Background Sectors -->
          <!-- Normal Axis (-30 to +90 deg): Emerald Green Wedge -->
          <path d="M0 0 L121 -70 A140 140 0 0 1 0 140 Z" fill="rgba(16,185,129,0.22)" stroke="#10b981" stroke-width="1.5"/>
          <!-- Left Axis Deviation (-30 to -90 deg): Orange Wedge -->
          <path d="M0 0 L0 -140 A140 140 0 0 1 121 -70 Z" fill="rgba(245,158,11,0.22)" stroke="#f59e0b" stroke-width="1.5"/>
          <!-- Right Axis Deviation (+90 to +180 deg): Blue Wedge -->
          <path d="M0 0 L0 140 A140 140 0 0 1 -140 0 Z" fill="rgba(2,132,199,0.22)" stroke="#0284c7" stroke-width="1.5"/>
          <!-- Extreme / Northwest Axis (+180 to -90 deg): Red Wedge -->
          <path d="M0 0 L-140 0 A140 140 0 0 1 0 -140 Z" fill="rgba(225,29,72,0.22)" stroke="#e11d48" stroke-width="1.5"/>

          <!-- Concentric rings -->
          <circle cx="0" cy="0" r="140" fill="none" stroke="#475569" stroke-width="1.2" stroke-dasharray="3,3"/>
          <circle cx="0" cy="0" r="70" fill="none" stroke="#334155" stroke-width="0.8"/>
          <circle cx="0" cy="0" r="4" fill="#ffffff"/>

          <!-- 6 Lead Vector Axes -->
          <!-- Lead I (0 deg) -->
          <line x1="-155" y1="0" x2="155" y2="0" stroke="#38bdf8" stroke-width="2"/>
          <polygon points="160,0 150,-4 150,4" fill="#38bdf8"/>
          <text x="168" y="4" font-size="10" font-weight="900" fill="#38bdf8">Lead I (0°)</text>

          <!-- Lead aVF (+90 deg) -->
          <line x1="0" y1="-155" x2="0" y2="155" stroke="#10b981" stroke-width="2"/>
          <polygon points="0,160 -4,150 4,150" fill="#10b981"/>
          <text x="0" y="174" font-size="10" font-weight="900" fill="#34d399" text-anchor="middle">aVF (+90°)</text>

          <!-- Lead II (+60 deg) -->
          <line x1="-75" y1="-130" x2="75" y2="130" stroke="#22c55e" stroke-width="2"/>
          <polygon points="78,135 68,130 76,123" fill="#22c55e"/>
          <text x="88" y="148" font-size="9.5" font-weight="800" fill="#86efac">Lead II (+60°)</text>

          <!-- Lead aVL (-30 deg) -->
          <line x1="-130" y1="75" x2="130" y2="-75" stroke="#f59e0b" stroke-width="1.8"/>
          <polygon points="135,-78 125,-75 131,-68" fill="#f59e0b"/>
          <text x="144" y="-76" font-size="9" font-weight="800" fill="#fde68a">aVL (-30°)</text>

          <!-- Lead III (+120 deg) -->
          <line x1="75" y1="-130" x2="-75" y2="130" stroke="#0284c7" stroke-width="1.8"/>
          <polygon points="-78,135 -76,123 -68,130" fill="#0284c7"/>
          <text x="-88" y="148" font-size="9" font-weight="800" fill="#7dd3fc" text-anchor="end">Lead III (+120°)</text>

          <!-- Lead aVR (-150 deg) -->
          <line x1="130" y1="75" x2="-130" y2="-75" stroke="#e11d48" stroke-width="1.8"/>
          <polygon points="-135,-78 -131,-68 -125,-75" fill="#e11d48"/>
          <text x="-142" y="-76" font-size="9" font-weight="800" fill="#fca5a5" text-anchor="end">aVR (-150°)</text>

          <!-- Rotating Vector Animation (Normal Axis Demonstration: +50 deg) -->
          <g>
            <line x1="0" y1="0" x2="70" y2="84" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round"/>
            <polygon points="77,92 64,88 74,80" fill="#ffffff"/>
            <circle cx="0" cy="0" r="5" fill="#f43f5e"/>
            <text x="40" y="45" font-size="8.5" font-weight="900" fill="#ffffff">MEAN VECTOR (~+50°)</text>
          </g>

          <!-- Quadrant Sector Labels -->
          <text x="75" y="45" font-size="8.5" font-weight="800" fill="#34d399">NORMAL AXIS</text>
          <text x="75" y="57" font-size="7.5" fill="#a7f3d0">(-30° to +90°)</text>

          <text x="45" y="-95" font-size="8.5" font-weight="800" fill="#fbbf24">LAD</text>
          <text x="45" y="-83" font-size="7.5" fill="#fde68a">(-30° to -90°)</text>

          <text x="-95" y="65" font-size="8.5" font-weight="800" fill="#38bdf8" text-anchor="end">RAD</text>
          <text x="-95" y="77" font-size="7.5" fill="#bae6fd" text-anchor="end">(+90° to +180°)</text>

          <text x="-70" y="-95" font-size="8" font-weight="800" fill="#f87171" text-anchor="middle">EXTREME / NW</text>
          <text x="-70" y="-83" font-size="7.5" fill="#fca5a5" text-anchor="middle">(+180° to -90°)</text>
        </g>

        <!-- RIGHT: Rapid 2-Lead Quadrant Decision Guide -->
        <g transform="translate(420, 65)">
          <rect x="0" y="0" width="320" height="295" rx="8" fill="rgba(30,41,59,0.7)" stroke="#475569" stroke-width="1.5"/>
          <text x="160" y="24" font-size="10.5" font-weight="800" fill="#38bdf8" text-anchor="middle">RAPID BED-SIDE 2-LEAD / 3-LEAD METHOD</text>

          <!-- Rule 1: Normal Axis -->
          <g transform="translate(15, 36)">
            <rect x="0" y="0" width="290" height="52" rx="5" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1.2"/>
            <text x="12" y="18" font-size="9" font-weight="800" fill="#34d399">NORMAL AXIS (-30° to +90°):</text>
            <text x="12" y="32" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#38bdf8">Lead I (+)</tspan> AND <tspan font-weight="700" fill="#34d399">Lead aVF (+)</tspan> = Normal (0° to +90°)</text>
            <text x="12" y="44" font-size="8" fill="#94a3b8">• If I (+) and aVF (-): check Lead II! If II (+) = Normal (-30° to 0°)</text>
          </g>

          <!-- Rule 2: Left Axis Deviation -->
          <g transform="translate(15, 96)">
            <rect x="0" y="0" width="290" height="58" rx="5" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1.2"/>
            <text x="12" y="18" font-size="9" font-weight="800" fill="#fbbf24">LEFT AXIS DEVIATION (LAD: -30° to -90°):</text>
            <text x="12" y="32" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#38bdf8">Lead I (+)</tspan> AND <tspan font-weight="700" fill="#f87171">Lead aVF (-)</tspan> AND <tspan font-weight="700" fill="#f87171">Lead II (-)</tspan></text>
            <text x="12" y="46" font-size="7.8" fill="#fde68a">Causes: LAFB (qR in I/aVL, rS in II/III), LVH, Inferior MI, LBBB</text>
          </g>

          <!-- Rule 3: Right Axis Deviation -->
          <g transform="translate(15, 162)">
            <rect x="0" y="0" width="290" height="58" rx="5" fill="rgba(2,132,199,0.15)" stroke="#0284c7" stroke-width="1.2"/>
            <text x="12" y="18" font-size="9" font-weight="800" fill="#7dd3fc">RIGHT AXIS DEVIATION (RAD: +90° to +180°):</text>
            <text x="12" y="32" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#f87171">Lead I (-)</tspan> AND <tspan font-weight="700" fill="#34d399">Lead aVF (+)</tspan> ("Thumbs away")</text>
            <text x="12" y="46" font-size="7.8" fill="#bae6fd">Causes: RVH, PE (S1Q3T3), Cor Pulmonale, LPFB, Lateral MI, Arm Swap</text>
          </g>

          <!-- Rule 4: Extreme Axis -->
          <g transform="translate(15, 228)">
            <rect x="0" y="0" width="290" height="54" rx="5" fill="rgba(225,29,72,0.15)" stroke="#e11d48" stroke-width="1.2"/>
            <text x="12" y="18" font-size="9" font-weight="800" fill="#fb7185">EXTREME / NORTHWEST AXIS (+180° to -90°):</text>
            <text x="12" y="32" font-size="8.2" fill="#cbd5e1">• <tspan font-weight="700" fill="#f87171">Lead I (-)</tspan> AND <tspan font-weight="700" fill="#f87171">Lead aVF (-)</tspan></text>
            <text x="12" y="44" font-size="7.8" font-weight="700" fill="#fecdd3">Critical marker for Ventricular Tachycardia (VT) vs SVT!</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">The Hexaxial Reference System and Rapid 2-Lead Quadrant Axis Algorithm. Notice the 3-lead rule: if Lead I is positive and aVF is negative, inspect Lead II to differentiate physiological normal axis (-30° to 0°) from pathological Left Axis Deviation (-30° to -90°).</p>
    </div>`;
  }

  /* 3. Left Ventricular Hypertrophy (LVH) Waveform */
  function ecgLvhDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Left Ventricular Hypertrophy ECG Voltage Criteria and Strain Pattern" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="320" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- LEFT PANEL: Lead V1 (Deep S Wave) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="350" height="300" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="24" font-size="11" font-weight="900" fill="#38bdf8">LEAD V1 (Right Precordium)</text>
          <text x="15" y="38" font-size="8.5" fill="#94a3b8">Small r wave + Massive Deep S Wave (&gt;25 mm)</text>

          <!-- Waveform V1 -->
          <g transform="translate(10, 60)">
            <path d="M0 80 L35 80 Q45 74 55 80 L65 80 L68 72 L72 80 L76 210 L84 80 L115 80 Q130 65 145 80 L175 80 Q185 74 195 80 L205 80 L208 72 L212 80 L216 210 L224 80 L255 80 Q270 65 285 80 L320 80"
                  fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#38bdf8"/>
            <!-- Sweep Beam V1 -->
            <g class="ecg-beam">
              <rect x="0" y="0" width="25" height="230" fill="url(#sweepGradCyan)"/>
              <line x1="25" y1="0" x2="25" y2="230" stroke="#7dd3fc" stroke-width="2"/>
            </g>

            <!-- Caliper S in V1 -->
            <line x1="90" y1="80" x2="90" y2="210" stroke="#f87171" stroke-width="1.8"/>
            <line x1="85" y1="80" x2="95" y2="80" stroke="#f87171" stroke-width="1.8"/>
            <line x1="85" y1="210" x2="95" y2="210" stroke="#f87171" stroke-width="1.8"/>
            <text x="100" y="150" font-size="9" font-weight="900" fill="#fca5a5">S in V1 = 26 mm</text>
          </g>
        </g>

        <!-- RIGHT PANEL: Lead V5 (Towering R Wave + Lateral Strain) -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="350" height="300" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="24" font-size="11" font-weight="900" fill="#f59e0b">LEAD V5 (Left Precordium)</text>
          <text x="15" y="38" font-size="8.5" fill="#fde68a">Towering R Wave (&gt;26 mm) + Downsloping ST-T Strain</text>

          <!-- Waveform V5 -->
          <g transform="translate(10, 60)">
            <!-- Path with downsloping ST depression and asymmetric inverted T -->
            <path d="M0 120 L35 120 Q45 110 55 120 L65 120 L70 124 L76 10 L84 135 L100 138 Q115 145 130 120 L175 120 Q185 110 195 120 L205 120 L210 124 L216 10 L224 135 L240 138 Q255 145 270 120 L320 120"
                  fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#f59e0b"/>
            <!-- Sweep Beam V5 -->
            <g class="ecg-beam">
              <rect x="0" y="0" width="25" height="230" fill="url(#sweepGradAmber)"/>
              <line x1="25" y1="0" x2="25" y2="230" stroke="#fbbf24" stroke-width="2"/>
            </g>

            <!-- Caliper R in V5 -->
            <line x1="90" y1="10" x2="90" y2="120" stroke="#fbbf24" stroke-width="1.8"/>
            <line x1="85" y1="10" x2="95" y2="10" stroke="#fbbf24" stroke-width="1.8"/>
            <line x1="85" y1="120" x2="95" y2="120" stroke="#fbbf24" stroke-width="1.8"/>
            <text x="98" y="60" font-size="9" font-weight="900" fill="#fbbf24">R in V5 = 28 mm</text>

            <!-- Strain label -->
            <rect x="95" y="145" width="135" height="22" rx="3" fill="rgba(239,68,68,0.25)" stroke="#ef4444" stroke-width="1"/>
            <text x="162" y="160" font-size="8" font-weight="800" fill="#fca5a5" text-anchor="middle">LV STRAIN: ST DEP + TWI</text>
          </g>

          <!-- Sokolow-Lyon Calculation Badge -->
          <g transform="translate(15, 255)">
            <rect x="0" y="0" width="320" height="30" rx="4" fill="rgba(16,185,129,0.2)" stroke="#10b981" stroke-width="1.2"/>
            <text x="160" y="19" font-size="9" font-weight="900" fill="#34d399" text-anchor="middle">SOKOLOW-LYON: S_V1 (26) + R_V5 (28) = 54 mm (&gt;35 mm POSITIVE!)</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Left Ventricular Hypertrophy (LVH) Sokolow-Lyon Voltage Criterion and Asymmetrical Lateral ST-T Strain Pattern. Notice the combined voltage exceeds 35 mm (3.5 mV) with characteristic repolarisation strain in V5.</p>
    </div>`;
  }

  /* 4. Right Ventricular Hypertrophy (RVH) Waveform */
  function ecgRvhDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Right Ventricular Hypertrophy ECG Voltage Criteria and RV Strain Pattern" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="320" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- LEFT PANEL: Lead V1 (Tall R wave + RV Strain) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="350" height="300" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="24" font-size="11" font-weight="900" fill="#22c55e">LEAD V1 (Dominant R Wave)</text>
          <text x="15" y="38" font-size="8.5" fill="#86efac">Tall R Wave (&gt;7 mm, R/S &gt; 1.0) + Convex RV Strain</text>

          <!-- Waveform V1 -->
          <g transform="translate(10, 60)">
            <path d="M0 120 L35 120 Q45 105 55 120 L65 120 L72 30 L80 145 L95 140 Q115 150 130 120 L175 120 Q185 105 195 120 L205 120 L212 30 L220 145 L235 140 Q255 150 270 120 L320 120"
                  fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#22c55e"/>
            <!-- Sweep Beam V1 -->
            <g class="ecg-beam">
              <rect x="0" y="0" width="25" height="230" fill="url(#sweepGradGreen)"/>
              <line x1="25" y1="0" x2="25" y2="230" stroke="#86efac" stroke-width="2"/>
            </g>

            <!-- Caliper R in V1 -->
            <line x1="88" y1="30" x2="88" y2="120" stroke="#22c55e" stroke-width="1.8"/>
            <line x1="83" y1="30" x2="93" y2="30" stroke="#22c55e" stroke-width="1.8"/>
            <line x1="83" y1="120" x2="93" y2="120" stroke="#22c55e" stroke-width="1.8"/>
            <text x="96" y="75" font-size="9" font-weight="900" fill="#86efac">R in V1 = 12 mm (&gt;7 mm)</text>
            <text x="96" y="88" font-size="8" fill="#cbd5e1">R/S Ratio = 2.4 (&gt;1.0)</text>

            <!-- RV Strain Badge -->
            <rect x="100" y="150" width="130" height="22" rx="3" fill="rgba(225,29,72,0.25)" stroke="#e11d48" stroke-width="1"/>
            <text x="165" y="165" font-size="8" font-weight="800" fill="#fca5a5" text-anchor="middle">RV STRAIN (ST DEP + TWI)</text>
          </g>
        </g>

        <!-- RIGHT PANEL: Lead V6 (Persistent Deep S Wave) -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="350" height="300" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="24" font-size="11" font-weight="900" fill="#0284c7">LEAD V6 (Persistent Lateral S Wave)</text>
          <text x="15" y="38" font-size="8.5" fill="#7dd3fc">Small r + Deep S Wave (&gt;7 mm, R/S &lt; 1.0)</text>

          <!-- Waveform V6 -->
          <g transform="translate(10, 60)">
            <path d="M0 80 L35 80 Q45 74 55 80 L65 80 L70 55 L76 175 L84 80 L115 80 Q130 68 145 80 L175 80 Q185 74 195 80 L205 80 L210 55 L216 175 L224 80 L255 80 Q270 68 285 80 L320 80"
                  fill="none" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#0284c7"/>
            <!-- Sweep Beam V6 -->
            <g class="ecg-beam">
              <rect x="0" y="0" width="25" height="230" fill="url(#sweepGradCyan)"/>
              <line x1="25" y1="0" x2="25" y2="230" stroke="#38bdf8" stroke-width="2"/>
            </g>

            <!-- Caliper S in V6 -->
            <line x1="90" y1="80" x2="90" y2="175" stroke="#38bdf8" stroke-width="1.8"/>
            <line x1="85" y1="80" x2="95" y2="80" stroke="#38bdf8" stroke-width="1.8"/>
            <line x1="85" y1="175" x2="95" y2="175" stroke="#38bdf8" stroke-width="1.8"/>
            <text x="100" y="130" font-size="9" font-weight="900" fill="#7dd3fc">S in V6 = 11 mm (&gt;7 mm)</text>
          </g>

          <!-- Associated Criteria Box -->
          <g transform="translate(15, 245)">
            <rect x="0" y="0" width="320" height="42" rx="4" fill="rgba(15,23,42,0.8)" stroke="#475569" stroke-width="1.2"/>
            <text x="160" y="16" font-size="8.5" font-weight="800" fill="#fde68a" text-anchor="middle">ASSOCIATED RVH FINDINGS:</text>
            <text x="160" y="32" font-size="8" fill="#cbd5e1" text-anchor="middle">• Right Axis Deviation (&gt;+90°/110°) • P-Pulmonale (&gt;2.5 mm in II) • S1Q3T3 (PE)</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Right Ventricular Hypertrophy (RVH) Voltage Criteria. Dominant tall R wave in V1 (R/S &gt; 1.0) with right ventricular strain and persistent deep S wave in V6.</p>
    </div>`;
  }

  /* 5. Bundle Branch Block (LBBB vs RBBB) Comparison */
  function ecgBbbDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Left Bundle Branch Block and Right Bundle Branch Block Comparative Morphology" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="360" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- LEFT COLUMN: LBBB (WiLLiaM) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="350" height="340" rx="6" fill="url(#monGridMajor)"/>
          <rect x="0" y="0" width="350" height="26" rx="4" fill="#7c3aed"/>
          <text x="175" y="18" font-size="10.5" font-weight="900" fill="#ffffff" text-anchor="middle">LEFT BUNDLE BRANCH BLOCK (LBBB)</text>

          <!-- Lead V1 in LBBB: Broad QS / rS with Discordant STE -->
          <g transform="translate(10, 35)">
            <text x="10" y="16" font-size="9.5" font-weight="800" fill="#c4b5fd">Lead V1: Broad QS Complex + Discordant STE</text>
            <path d="M0 50 L30 50 Q40 45 50 50 L58 50 L65 140 L76 140 L85 30 Q110 20 130 50 L160 50"
                  fill="none" stroke="#a78bfa" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#a78bfa"/>
            <!-- QRS duration bracket -->
            <text x="70" y="160" font-size="8" font-weight="800" fill="#fca5a5" text-anchor="middle">Wide QRS ≥120 ms (Slurred QS)</text>
          </g>

          <!-- Lead V6 in LBBB: Broad notched M-shaped R without Q -->
          <g transform="translate(10, 185)">
            <text x="10" y="16" font-size="9.5" font-weight="800" fill="#c4b5fd">Lead V6: Broad Notched "M" R Wave (No Q wave)</text>
            <path d="M0 60 L30 60 Q40 52 50 60 L58 60 L68 10 L74 20 L80 10 L88 75 L115 78 Q135 90 150 60 L180 60"
                  fill="none" stroke="#a78bfa" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#a78bfa"/>
            <text x="76" y="0" font-size="8.5" font-weight="800" fill="#fde68a" text-anchor="middle">Notched Plateau R ("M")</text>
            <text x="125" y="100" font-size="8" fill="#fca5a5">Discordant ST-T</text>
          </g>
          <!-- Mnemonic -->
          <text x="175" y="325" font-size="8.5" font-weight="800" fill="#ddd6fe" text-anchor="middle">MNEMONIC: W in V1, M in V6 = "WiLLiaM" (LL = LBBB)</text>
        </g>

        <!-- RIGHT COLUMN: RBBB (MaRRoW) -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="350" height="340" rx="6" fill="url(#monGridMajor)"/>
          <rect x="0" y="0" width="350" height="26" rx="4" fill="#0284c7"/>
          <text x="175" y="18" font-size="10.5" font-weight="900" fill="#ffffff" text-anchor="middle">RIGHT BUNDLE BRANCH BLOCK (RBBB)</text>

          <!-- Lead V1 in RBBB: Classic rsR' Rabbit Ears -->
          <g transform="translate(10, 35)">
            <text x="10" y="16" font-size="9.5" font-weight="800" fill="#38bdf8">Lead V1: rsR' "Rabbit Ears" (R' &gt; r)</text>
            <path d="M0 70 L30 70 Q40 62 50 70 L58 70 L64 35 L70 85 L78 10 L86 85 L105 88 Q125 100 140 70 L170 70"
                  fill="none" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#38bdf8"/>
            <text x="64" y="25" font-size="8" font-weight="800" fill="#93c5fd">r</text>
            <text x="70" y="98" font-size="8" font-weight="800" fill="#93c5fd">s</text>
            <text x="78" y="0" font-size="9.5" font-weight="900" fill="#fde68a">R' (Tall Ear)</text>
            <text x="120" y="115" font-size="8" fill="#fca5a5">Secondary TWI</text>
          </g>

          <!-- Lead V6 in RBBB: Wide slurred S wave -->
          <g transform="translate(10, 185)">
            <text x="10" y="16" font-size="9.5" font-weight="800" fill="#38bdf8">Lead V6: Wide Slurred S Wave (&gt;40 ms)</text>
            <path d="M0 60 L30 60 Q40 52 50 60 L58 60 L62 65 L68 15 L74 125 L92 60 L115 60 Q130 45 145 60 L175 60"
                  fill="none" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#38bdf8"/>
            <text x="68" y="5" font-size="8" font-weight="800" fill="#93c5fd">Normal R</text>
            <line x1="74" y1="60" x2="92" y2="60" stroke="#f87171" stroke-width="1.8"/>
            <text x="83" y="140" font-size="8.5" font-weight="900" fill="#fca5a5" text-anchor="middle">Slurred Terminal S</text>
          </g>
          <!-- Mnemonic -->
          <text x="175" y="325" font-size="8.5" font-weight="800" fill="#bae6fd" text-anchor="middle">MNEMONIC: M in V1, W in V6 = "MaRRoW" (RR = RBBB)</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Left Bundle Branch Block (LBBB) vs Right Bundle Branch Block (RBBB) Classical Morphologies. Remember the WiLLiaM MaRRoW rule: LBBB shows W in V1 &amp; M in V6; RBBB shows M (rabbit ears) in V1 &amp; wide slurred W in V6.</p>
    </div>`;
  }

  /* 6. STEMI Evolutionary Stages & Equivalents */
  function ecgStemiDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Myocardial Infarction ECG Evolutionary Stages and STEMI Equivalents" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="360" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- ROW 1: 4 Evolutionary Stages -->
        <!-- Stage 1: Baseline -->
        <g transform="translate(20, 25)">
          <rect x="0" y="0" width="165" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="82" y="20" font-size="9" font-weight="800" fill="#94a3b8" text-anchor="middle">1. BASELINE (Normal)</text>
          <path d="M10 90 L30 90 Q40 82 50 90 L56 90 L60 93 L65 40 L70 98 L75 90 L95 90 Q110 75 125 90 L155 90"
                fill="none" stroke="#22c55e" stroke-width="2.2" stroke-linecap="round"/>
          <text x="82" y="130" font-size="7.5" fill="#cbd5e1" text-anchor="middle">Normal ST segment &amp; T wave</text>
        </g>

        <!-- Stage 2: Hyperacute T Wave -->
        <g transform="translate(200, 25)">
          <rect x="0" y="0" width="165" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="82" y="20" font-size="9" font-weight="800" fill="#f59e0b" text-anchor="middle">2. HYPERACUTE (Minutes)</text>
          <path d="M10 90 L25 90 Q35 82 45 90 L52 90 L56 93 L61 40 L66 98 L71 90 L80 90 Q105 20 130 90 L155 90"
                fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round"/>
          <text x="82" y="130" font-size="7.5" font-weight="700" fill="#fde68a" text-anchor="middle">Tall, broad, symmetrical T</text>
        </g>

        <!-- Stage 3: Acute STEMI (Tombstone) -->
        <g transform="translate(380, 25)">
          <rect x="0" y="0" width="175" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="87" y="20" font-size="9" font-weight="900" fill="#ef4444" text-anchor="middle">3. ACUTE STEMI (Hours)</text>
          <!-- Tombstone convex coving -->
          <path d="M10 90 L25 90 Q35 82 45 90 L52 90 L56 93 L62 30 L67 75 Q85 30 115 50 L125 90 L165 90"
                fill="none" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round" class="ecg-trace" color="#ef4444"/>
          <text x="87" y="125" font-size="7.5" font-weight="900" fill="#fca5a5" text-anchor="middle">CONVEX ST ELEVATION</text>
          <text x="87" y="138" font-size="7.2" fill="#fecdd3" text-anchor="middle">("Tombstone" Coving &gt;2 mm)</text>
        </g>

        <!-- Stage 4: Subacute Q-Wave MI -->
        <g transform="translate(570, 25)">
          <rect x="0" y="0" width="165" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="82" y="20" font-size="9" font-weight="800" fill="#a855f7" text-anchor="middle">4. SUBACUTE / OLD</text>
          <!-- Deep Q wave + inverted T -->
          <path d="M10 80 L25 80 Q35 72 45 80 L52 80 L56 125 L65 55 L70 80 L85 80 Q105 115 125 80 L155 80"
                fill="none" stroke="#c084fc" stroke-width="2.2" stroke-linecap="round"/>
          <text x="56" y="140" font-size="8" font-weight="800" fill="#f87171" text-anchor="middle">Q Wave</text>
          <text x="110" y="140" font-size="8" font-weight="800" fill="#c084fc" text-anchor="middle">Inverted T</text>
        </g>

        <!-- ROW 2: CRITICAL STEMI EQUIVALENTS -->
        <!-- Wellens Syndrome Type A & B -->
        <g transform="translate(20, 190)">
          <rect x="0" y="0" width="345" height="165" rx="6" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" stroke-width="1.4"/>
          <text x="172" y="20" font-size="10" font-weight="900" fill="#38bdf8" text-anchor="middle">WELLENS SYNDROME (Critical Proximal LAD Stenosis)</text>

          <!-- Type A: Biphasic T in V2/V3 -->
          <g transform="translate(15, 30)">
            <text x="75" y="16" font-size="8.5" font-weight="700" fill="#cbd5e1" text-anchor="middle">Type A (25%): Biphasic T</text>
            <path d="M10 60 L35 60 L40 20 L45 75 L50 60 L60 60 Q72 38 82 60 Q92 82 104 60 L140 60"
                  fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
          </g>

          <!-- Type B: Deep Symmetrical TWI in V2/V3 -->
          <g transform="translate(175, 30)">
            <text x="75" y="16" font-size="8.5" font-weight="700" fill="#cbd5e1" text-anchor="middle">Type B (75%): Deep TWI</text>
            <path d="M10 50 L35 50 L40 10 L45 65 L50 50 L60 50 Q80 105 100 50 L140 50"
                  fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
          </g>
          <text x="172" y="152" font-size="7.5" font-weight="700" fill="#fde68a" text-anchor="middle">⚠️ Pain-free at ECG! High risk of massive anterior STEMI within days</text>
        </g>

        <!-- de Winter T Waves -->
        <g transform="translate(385, 190)">
          <rect x="0" y="0" width="350" height="165" rx="6" fill="rgba(15,23,42,0.85)" stroke="#ef4444" stroke-width="1.4"/>
          <text x="175" y="20" font-size="10" font-weight="900" fill="#f87171" text-anchor="middle">de WINTER T WAVES (Acute Proximal LAD Occlusion)</text>

          <!-- de Winter Trace: Upsloping ST depression + Tall hyperacute T -->
          <g transform="translate(25, 35)">
            <path d="M10 50 L30 50 Q40 42 50 50 L56 50 L60 20 L65 75 L75 80 L95 10 L115 50 L150 50"
                  fill="none" stroke="#f87171" stroke-width="2.4" stroke-linecap="round"/>
            <circle cx="75" cy="80" r="3" fill="#f59e0b"/>
            <text x="80" y="96" font-size="8" font-weight="800" fill="#fbbf24">J-point Dep (1–3 mm)</text>
            <text x="100" y="5" font-size="8.5" font-weight="900" fill="#f87171">Tall Peaked T</text>
          </g>
          <text x="210" y="65" font-size="8.2" fill="#cbd5e1">• Present in ~2% of LAD occlusions</text>
          <text x="210" y="80" font-size="8.2" fill="#cbd5e1">• 1–2 mm ST elevation in Lead aVR</text>
          <text x="210" y="95" font-size="8.2" font-weight="700" fill="#fca5a5">• STEMI Equivalent (Cath Lab!)</text>
          <text x="175" y="152" font-size="7.5" font-weight="700" fill="#fde68a" text-anchor="middle">Do NOT delay primary PCI waiting for traditional ST elevation!</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Evolutionary ECG Stages of Myocardial Infarction and Life-Threatening STEMI Equivalents (Wellens Syndrome &amp; de Winter Pattern). Both equivalents demand immediate primary percutaneous coronary intervention (PCI).</p>
    </div>`;
  }

  /* 7. Heart Blocks & Conduction Disorders */
  function ecgHeartBlocksDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Atrioventricular Heart Blocks First Second and Third Degree AV Block Waveforms" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="360" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- 1st Degree AV Block -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="720" height="75" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="800" fill="#38bdf8">1st DEGREE AV BLOCK: Prolonged PR Interval &gt;200 ms (Constant 1:1 Conduction)</text>
          <!-- Trace with long PR = 280 ms -->
          <g transform="translate(10, 15)">
            <path d="M0 35 L20 35 Q30 25 40 35 L80 35 L84 40 L90 8 L96 45 L102 35 L125 35 Q140 20 155 35 L200 35 Q210 25 220 35 L260 35 L264 40 L270 8 L276 45 L282 35 L305 35 Q320 20 335 35 L380 35 Q390 25 400 35 L440 35 L444 40 L450 8 L456 45 L462 35 L485 35 Q500 20 515 35 L560 35"
                  fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/>
            <line x1="20" y1="48" x2="84" y2="48" stroke="#f59e0b" stroke-width="1.8"/>
            <text x="52" y="58" font-size="7.5" font-weight="800" fill="#fbbf24" text-anchor="middle">PR = 280 ms (&gt;200 ms)</text>
          </g>
        </g>

        <!-- 2nd Degree Type 1 (Mobitz I / Wenckebach) -->
        <g transform="translate(20, 105)">
          <rect x="0" y="0" width="720" height="80" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="800" fill="#f59e0b">2nd DEGREE MOBITZ I (Wenckebach): Progressive PR Lengthening → Dropped QRS Beat</text>
          <g transform="translate(10, 15)">
            <!-- Beat 1: PR 160 ms -->
            <path d="M0 35 L20 35 Q28 25 36 35 L55 35 L58 38 L63 8 L68 45 L73 35 L90 35 Q102 20 115 35 L135 35 " fill="none" stroke="#f59e0b" stroke-width="2.2"/>
            <text x="45" y="54" font-size="7" fill="#fbbf24">PR 160</text>
            <!-- Beat 2: PR 240 ms -->
            <path d="M135 35 Q143 25 151 35 L180 35 L183 38 L188 8 L193 45 L198 35 L215 35 Q227 20 240 35 L260 35 " fill="none" stroke="#f59e0b" stroke-width="2.2"/>
            <text x="165" y="54" font-size="7" fill="#fbbf24">PR 240</text>
            <!-- Beat 3: PR 320 ms -->
            <path d="M260 35 Q268 25 276 35 L315 35 L318 38 L323 8 L328 45 L333 35 L350 35 Q362 20 375 35 L395 35 " fill="none" stroke="#f59e0b" stroke-width="2.2"/>
            <text x="295" y="54" font-size="7" fill="#fbbf24">PR 320</text>
            <!-- Beat 4: DROPPED P WAVE -->
            <path d="M395 35 Q405 23 415 35 L475 35 " fill="none" stroke="#ef4444" stroke-width="2.2"/>
            <circle cx="410" cy="28" r="3" fill="#ef4444"/>
            <text x="410" y="16" font-size="8" font-weight="900" fill="#fca5a5" text-anchor="middle">BLOCKED P WAVE</text>
            <text x="410" y="54" font-size="7.5" font-weight="700" fill="#f87171" text-anchor="middle">DROPPED QRS!</text>
            <!-- Beat 5: Reset PR 160 ms -->
            <path d="M475 35 Q483 25 491 35 L510 35 L513 38 L518 8 L523 45 L528 35 L545 35" fill="none" stroke="#f59e0b" stroke-width="2.2"/>
          </g>
        </g>

        <!-- 2nd Degree Type 2 (Mobitz II) -->
        <g transform="translate(20, 195)">
          <rect x="0" y="0" width="720" height="80" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="800" fill="#ef4444">2nd DEGREE MOBITZ II (Infranodal Block): Constant PR Interval → Sudden Blocked P Wave</text>
          <g transform="translate(10, 15)">
            <!-- Conducted beat with wide QRS -->
            <path d="M0 35 L20 35 Q30 25 40 35 L60 35 L64 42 L72 8 L80 48 L88 35 L115 35 Q130 18 145 35 L180 35" fill="none" stroke="#ef4444" stroke-width="2.2"/>
            <text x="50" y="52" font-size="7" fill="#cbd5e1">PR Constant</text>
            <!-- BLOCKED P WAVE (Sudden Drop) -->
            <path d="M180 35 Q190 22 200 35 L260 35" fill="none" stroke="#ef4444" stroke-width="2.2"/>
            <circle cx="195" cy="28" r="3.5" fill="#fca5a5"/>
            <text x="195" y="16" font-size="8.5" font-weight="900" fill="#fca5a5" text-anchor="middle">SUDDEN DROPPED QRS</text>
            <text x="195" y="52" font-size="7.5" fill="#f87171" text-anchor="middle">(High CHB Risk!)</text>
            <!-- Next conducted beat -->
            <path d="M260 35 Q270 25 280 35 L300 35 L304 42 L312 8 L320 48 L328 35 L355 35 Q370 18 385 35 L420 35" fill="none" stroke="#ef4444" stroke-width="2.2"/>
          </g>
          <text x="705" y="48" font-size="8" font-weight="700" fill="#fde68a" text-anchor="end">⚠️ Atropine INEFFECTIVE / Dangerous! Urgent Pacemaker indicated.</text>
        </g>

        <!-- 3rd Degree Complete AV Block (CHB) -->
        <g transform="translate(20, 285)">
          <rect x="0" y="0" width="720" height="75" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="900" fill="#a855f7">3rd DEGREE (COMPLETE) AV BLOCK: Total AV Dissociation (Independent P &amp; QRS March)</text>
          <g transform="translate(10, 15)">
            <!-- Slow Wide Ventricular Escape complexes at 30 bpm -->
            <path d="M0 35 L120 35 L126 44 L138 2 L148 50 L158 35 L200 35 Q225 15 250 35 L390 35 L396 44 L408 2 L418 50 L428 35 L470 35 Q495 15 520 35" fill="none" stroke="#c084fc" stroke-width="2.5"/>
            <!-- Marching P waves at 75 bpm (arrows) -->
            <g fill="#38bdf8">
              <path d="M40 35 Q48 23 56 35 Z"/><text x="48" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M110 35 Q118 23 126 35 Z"/><text x="118" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M180 35 Q188 23 196 35 Z"/><text x="188" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M250 35 Q258 23 266 35 Z"/><text x="258" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M320 35 Q328 23 336 35 Z"/><text x="328" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M390 35 Q398 23 406 35 Z"/><text x="398" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
              <path d="M460 35 Q468 23 476 35 Z"/><text x="468" y="18" font-size="7.5" font-weight="800" text-anchor="middle">P</text>
            </g>
          </g>
          <text x="705" y="48" font-size="8" font-weight="800" fill="#f87171" text-anchor="end">EMERGENCY PACING (TCP / TVP) MANDATORY</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Atrioventricular Conduction Disorders from First-Degree through Complete Third-Degree AV Block. Notice how Mobitz I has progressive PR prolongation before dropped beat, whereas Mobitz II drops suddenly with constant PR interval.</p>
    </div>`;
  }

  /* 8. Ventricular Tachycardia (VT) & Torsades de Pointes */
  function ecgVtDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ventricular Tachycardia Monomorphic VT and Polymorphic Torsades de Pointes Waveforms" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="320" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- TOP PANEL: Monomorphic VT with Capture & Fusion Beats -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="720" height="140" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#ef4444">MONOMORPHIC VENTRICULAR TACHYCARDIA (Rate 180 bpm  •  Wide QRS ≥160 ms)</text>
          <!-- VT waveform with Capture and Fusion beat -->
          <g transform="translate(10, 15)">
            <path d="M0 65 L10 65 
                     L18 8 L32 105 L42 8 L56 105 L66 8 L80 105 L90 8 L104 105 
                     L114 8 L128 105 L138 8 L152 105 
                     L160 50 L163 15 L168 75 L174 55 
                     L184 8 L198 105 L208 8 L222 105 
                     L230 40 L238 90 L248 15 L260 95 
                     L270 8 L284 105 L294 8 L308 105 L318 8 L332 105 L342 8 L356 105 L366 8 L380 105 L390 8 L404 105"
                  fill="none" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#ef4444"/>

            <!-- Animated Sweep Beam Fast -->
            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="25" height="120" fill="url(#sweepGradRed)"/>
              <line x1="25" y1="0" x2="25" y2="120" stroke="#f87171" stroke-width="2"/>
            </g>

            <!-- Annotation: Capture Beat -->
            <rect x="145" y="10" width="48" height="16" rx="3" fill="rgba(16,185,129,0.3)" stroke="#10b981" stroke-width="1"/>
            <text x="169" y="22" font-size="7.5" font-weight="900" fill="#34d399" text-anchor="middle">CAPTURE</text>

            <!-- Annotation: Fusion Beat (Dressler) -->
            <rect x="225" y="10" width="46" height="16" rx="3" fill="rgba(245,158,11,0.3)" stroke="#f59e0b" stroke-width="1"/>
            <text x="248" y="22" font-size="7.5" font-weight="900" fill="#fbbf24" text-anchor="middle">FUSION</text>
          </g>
          <text x="705" y="130" font-size="8" font-weight="800" fill="#fca5a5" text-anchor="end">BRUGADA CRITERIA: AV Dissociation + Capture/Fusion = 100% SPECIFIC FOR VT</text>
        </g>

        <!-- BOTTOM PANEL: Polymorphic VT (Torsades de Pointes) -->
        <g transform="translate(20, 175)">
          <rect x="0" y="0" width="720" height="140" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#a855f7">TORSADES DE POINTES (Polymorphic VT with Prolonged QTc &gt;500 ms)</text>
          <!-- Twisting Spindle-and-Node trace -->
          <g transform="translate(10, 15)">
            <path d="M0 65 L15 65 
                     L22 15 L32 95 L40 22 L48 88 L56 30 L64 80 L72 40 L80 75 L88 48 L96 70 L104 55 L112 65 
                     L120 75 L128 45 L136 82 L144 35 L152 92 L160 25 L168 100 L176 15 L184 105 L192 12 L200 108 
                     L208 25 L216 98 L224 35 L232 85 L240 45 L248 78 L256 52 L264 68 L272 58 L280 65 
                     L288 78 L296 42 L304 88 L312 30 L320 95 L328 20 L336 102 L344 15 L352 105 L360 25"
                  fill="none" stroke="#c084fc" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#c084fc"/>

            <!-- Sweep Beam Fast -->
            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="25" height="120" fill="url(#sweepGradCyan)"/>
              <line x1="25" y1="0" x2="25" y2="120" stroke="#a78bfa" stroke-width="2"/>
            </g>

            <!-- Peak markers -->
            <text x="60" y="18" font-size="8" fill="#e9d5ff">Positive Polarity</text>
            <text x="108" y="70" font-size="8" font-weight="900" fill="#fde68a" text-anchor="middle">NODE</text>
            <text x="160" y="118" font-size="8" fill="#e9d5ff">Negative Polarity</text>
            <text x="272" y="70" font-size="8" font-weight="900" fill="#fde68a" text-anchor="middle">NODE</text>
          </g>
          <text x="705" y="130" font-size="8" font-weight="800" fill="#fde68a" text-anchor="end">FIRST-LINE TREATMENT: IV MAGNESIUM SULPHATE 2g OVER 10 MIN + OVERDRIVE PACING</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Ventricular Tachycardia (VT) Dynamics. Top: Monomorphic VT displaying pathognomonic capture and fusion beats. Bottom: Polymorphic Torsades de Pointes showing classic twisting of QRS amplitudes around the isoelectric line.</p>
    </div>`;
  }

  /* 9. Ventricular Fibrillation (Coarse vs Fine VF) */
  function ecgVfDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Ventricular Fibrillation Coarse and Fine VF Waveforms and Defibrillation Protocol" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        
    <defs>
      <!-- ECG Millimeter Grid (1mm minor, 5mm major boxes) -->
      <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
      </pattern>
      <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
        <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
      </pattern>
      <!-- Monitor Neon Grid Pattern -->
      <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
        <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
      </pattern>
      <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
      </pattern>
      <!-- Sweep Beam Gradient -->
      <linearGradient id="sweepGradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#22c55e" stop-opacity="0"/>
        <stop offset="80%" stop-color="#22c55e" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#4ade80" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
        <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0"/>
        <stop offset="80%" stop-color="#ef4444" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#f87171" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
        <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <style>
      @keyframes ecgBeamSweep {
        0% { transform: translateX(0px); opacity: 0; }
        3% { opacity: 1; }
        96% { opacity: 1; }
        100% { transform: translateX(710px); opacity: 0; }
      }
      .ecg-beam { animation: ecgBeamSweep 3.2s linear infinite; }
      .ecg-beam-fast { animation: ecgBeamSweep 2.2s linear infinite; }
      .ecg-beam-vf { animation: ecgBeamSweep 1.8s linear infinite; }
      @keyframes ecgGlow {
        0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
        50% { filter: drop-shadow(0 0 4px currentColor); }
      }
      .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
    </style>
        <rect x="10" y="10" width="740" height="320" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- TOP PANEL: Coarse Ventricular Fibrillation -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="720" height="140" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#ef4444">COARSE VENTRICULAR FIBRILLATION (Amplitude ≥0.2 mV / 2 mm  •  High Defibrillation Efficacy)</text>
          <!-- Chaotic irregular large wavelets -->
          <g transform="translate(10, 15)">
            <path d="M0 60 Q12 10 24 65 Q35 110 48 45 Q58 10 70 85 Q82 120 95 30 Q108 8 120 75 Q132 115 145 40 Q158 5 170 80 Q182 125 195 25 Q208 10 220 85 Q232 110 245 45 Q258 15 270 70 Q282 115 295 35 Q308 12 320 80 Q332 120 345 40 Q358 10 370 75 Q382 110 395 30 Q408 8 420 85 Q432 115 445 40 Q458 15 470 75 Q482 120 495 35 Q508 10 520 80"
                  fill="none" stroke="#ef4444" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#ef4444"/>

            <!-- Sweep Beam VF -->
            <g class="ecg-beam-vf">
              <rect x="0" y="0" width="25" height="120" fill="url(#sweepGradRed)"/>
              <line x1="25" y1="0" x2="25" y2="120" stroke="#f87171" stroke-width="2"/>
            </g>

            <!-- Defibrillation Lightning Bolt -->
            <g transform="translate(560, 20)">
              <rect x="0" y="0" width="135" height="42" rx="4" fill="#dc2626" stroke="#f87171" stroke-width="1.4"/>
              <text x="67" y="18" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">⚡ SHOCKABLE RHYTHM</text>
              <text x="67" y="32" font-size="8" font-weight="800" fill="#fee2e2" text-anchor="middle">200 J BIPHASIC SHOCK</text>
            </g>
          </g>
          <text x="15" y="130" font-size="8" fill="#fca5a5">• Total absence of P, QRS, or T waves • Zero cardiac output • High myocardial ATP reserves</text>
        </g>

        <!-- BOTTOM PANEL: Fine Ventricular Fibrillation vs Asystole Warning -->
        <g transform="translate(20, 175)">
          <rect x="0" y="0" width="720" height="140" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#f59e0b">FINE VENTRICULAR FIBRILLATION (Amplitude &lt;0.2 mV  •  Prolonged Arrest / Impending Asystole)</text>
          <!-- Low amplitude chaotic wavelets -->
          <g transform="translate(10, 15)">
            <path d="M0 60 Q15 48 30 65 Q45 72 60 55 Q75 48 90 62 Q105 70 120 54 Q135 50 150 64 Q165 72 180 56 Q195 48 210 65 Q225 70 240 55 Q255 50 270 64 Q285 70 300 58 Q315 50 330 65 Q345 70 360 55 Q375 52 390 62 Q405 68 420 56 Q435 50 450 64 Q465 70 480 55 Q495 52 510 62"
                  fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#f59e0b"/>

            <g class="ecg-beam-vf">
              <rect x="0" y="0" width="25" height="120" fill="url(#sweepGradAmber)"/>
              <line x1="25" y1="0" x2="25" y2="120" stroke="#fbbf24" stroke-width="2"/>
            </g>
          </g>

          <g transform="translate(380, 75)">
            <rect x="0" y="0" width="320" height="50" rx="4" fill="rgba(225,29,72,0.25)" stroke="#ef4444" stroke-width="1.2"/>
            <text x="160" y="18" font-size="8.8" font-weight="900" fill="#fca5a5" text-anchor="middle">⚠️ CRITICAL PITFALL: DO NOT MISTAKE FOR ASYSTOLE!</text>
            <text x="160" y="32" font-size="7.8" fill="#fee2e2" text-anchor="middle">Check lead connections &amp; increase ECG gain. Fine VF is SHOCKABLE;</text>
            <text x="160" y="44" font-size="7.8" fill="#fee2e2" text-anchor="middle">asystole is NOT shockable! CPR &amp; Epinephrine help coarsen the rhythm.</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Ventricular Fibrillation (VF) Presentations. Top: Coarse VF with high-amplitude chaotic wavelets representing recent cardiac arrest with high defibrillation response. Bottom: Fine VF with low amplitude (&lt;0.2 mV) representing prolonged arrest.</p>
    </div>`;
  }

  /* 10. Hyperkalaemia ECG Waveforms & Progressive Stages */
  function ecgHyperkalemiaDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hyperkalaemia ECG Progression Waveforms" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="340" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- STAGE 1: Mild Hyperkalaemia (5.5 - 6.5 mmol/L) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="350" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#38bdf8">1. MILD HYPERKALAEMIA (5.5 – 6.5 mmol/L)</text>
          <text x="15" y="32" font-size="7.5" fill="#94a3b8">Tall, peaked, narrow-based "tented" T waves • Shortened QT interval</text>
          
          <g transform="translate(10, 25)">
            <!-- Baseline and cycle with tall pointed T wave -->
            <path d="M0 65 L25 65 Q33 65 37 59 Q42 53 47 59 Q52 65 60 65 L70 65 L74 72 L82 15 L90 88 L94 65 L105 65 Q114 65 120 4 Q124 -8 L128 4 Q134 65 145 65 L175 65 L179 72 L187 15 L195 88 L199 65 L210 65 Q219 65 225 4 Q229 -8 L233 4 Q239 65 250 65 L280 65 L284 72 L292 15 L300 88 L304 65 L320 65"
                  fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#38bdf8"/>
            <!-- Callout pointer on peaked T wave -->
            <circle cx="126" cy="0" r="3.5" fill="#ef4444"/>
            <line x1="126" y1="-2" x2="150" y2="-12" stroke="#ef4444" stroke-width="1.2"/>
            <text x="155" y="-9" font-size="8" font-weight="800" fill="#f87171">Peaked T Wave (Tented)</text>

            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="20" height="110" fill="url(#sweepGradCyan)"/>
              <line x1="20" y1="0" x2="20" y2="110" stroke="#7dd3fc" stroke-width="1.8"/>
            </g>
          </g>
          <text x="15" y="142" font-size="7.5" fill="#bae6fd">• Accelerated phase 3 repolarisation via enhanced I_Kr channel conductance</text>
        </g>

        <!-- STAGE 2: Moderate Hyperkalaemia (6.5 - 7.5 mmol/L) -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="350" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10" font-weight="900" fill="#f59e0b">2. MODERATE HYPERKALAEMIA (6.5 – 7.5 mmol/L)</text>
          <text x="15" y="32" font-size="7.5" fill="#94a3b8">Flattened P wave • Prolonged PR • Widened slurred QRS complex</text>
          
          <g transform="translate(10, 25)">
            <!-- Flat P, prolonged PR, wide QRS, and broad peaked T -->
            <path d="M0 65 L20 65 Q35 65 42 63 Q50 63 56 65 L78 65 L84 75 L96 22 L110 92 L118 65 L132 65 Q142 65 148 10 Q152 -2 L156 10 Q162 65 178 65 L198 65 L204 75 L216 22 L230 92 L238 65 L252 65 Q262 65 268 10 Q272 -2 L276 10 Q282 65 310 65"
                  fill="none" stroke="#f59e0b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#f59e0b"/>
            <!-- QRS duration bracket -->
            <line x1="84" y1="98" x2="118" y2="98" stroke="#fbbf24" stroke-width="1.4"/>
            <text x="101" y="108" font-size="7.5" font-weight="800" fill="#fbbf24" text-anchor="middle">Wide QRS &gt;120 ms</text>

            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="20" height="110" fill="url(#sweepGradAmber)"/>
              <line x1="20" y1="0" x2="20" y2="110" stroke="#fbbf24" stroke-width="1.8"/>
            </g>
          </g>
          <text x="15" y="142" font-size="7.5" fill="#fde68a">• Slower Phase 0 Vmax due to resting membrane depolarisation &amp; Na+ inactivation</text>
        </g>

        <!-- STAGE 3: Severe Pre-Terminal Hyperkalaemia (>8.0 - 9.0 mmol/L): SINE WAVE -->
        <g transform="translate(20, 185)">
          <rect x="0" y="0" width="720" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10.5" font-weight="900" fill="#ef4444">3. SEVERE / PRE-TERMINAL HYPERKALAEMIA (&gt;8.0 – 9.0 mmol/L) — SINE-WAVE PATTERN</text>
          <text x="15" y="32" font-size="8" fill="#fca5a5">Absent P waves (sinoventricular conduction) • Extreme QRS-T fusion into undulating sinusoidal rhythm • Impending VF / Asystole</text>

          <g transform="translate(15, 25)">
            <!-- Continuous wide sinusoidal wave -->
            <path d="M0 60 Q25 -5 50 60 Q75 125 100 60 Q125 -5 150 60 Q175 125 200 60 Q225 -5 250 60 Q275 125 300 60 Q325 -5 350 60 Q375 125 400 60 Q425 -5 450 60 Q475 125 500 60"
                  fill="none" stroke="#ef4444" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#ef4444"/>

            <g class="ecg-beam-vf">
              <rect x="0" y="0" width="25" height="115" fill="url(#sweepGradRed)"/>
              <line x1="25" y1="0" x2="25" y2="115" stroke="#f87171" stroke-width="2"/>
            </g>

            <!-- STAT Treatment Box -->
            <g transform="translate(515, 10)">
              <rect x="0" y="0" width="185" height="85" rx="6" fill="rgba(220,38,38,0.3)" stroke="#ef4444" stroke-width="1.5"/>
              <text x="92" y="18" font-size="9" font-weight="900" fill="#fee2e2" text-anchor="middle">🚨 EMERGENCY STABILISATION</text>
              <text x="92" y="34" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">10% CALCIUM GLUCONATE</text>
              <text x="92" y="47" font-size="8" fill="#fecaca" text-anchor="middle">10 to 30 mL IV over 5–10 min</text>
              <line x1="15" y1="53" x2="170" y2="53" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="92" y="65" font-size="7.5" fill="#fca5a5" text-anchor="middle">PLUS 10u Regular Insulin + 25g D50</text>
              <text x="92" y="77" font-size="7.5" fill="#fca5a5" text-anchor="middle">PLUS Emergent Hemodialysis</text>
            </g>
          </g>
          <text x="15" y="142" font-size="7.8" fill="#fecaca">• Calcium stabilizes the cardiac membrane by resetting threshold potential; it does NOT lower serum potassium.</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Hyperkalaemia ECG Progression. Stage 1: Tall peaked tented T waves (5.5–6.5 mmol/L). Stage 2: P-wave flattening and QRS widening (6.5–7.5 mmol/L). Stage 3: Classic pre-terminal Sine-Wave pattern (&gt;8.0–9.0 mmol/L) requiring immediate intravenous calcium.</p>
    </div>`;
  }

  /* 11. Hypokalaemia ECG Waveforms & U-Wave Morphology */
  function ecgHypokalemiaDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 350" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hypokalaemia ECG Waveform and U-Wave Morphology" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="330" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- PANEL 1: Moderate Hypokalaemia (2.5 - 3.0 mmol/L) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="720" height="150" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10.5" font-weight="900" fill="#38bdf8">MODERATE HYPOKALAEMIA (2.5 – 3.0 mmol/L) — PATHOGNOMONIC U-WAVE &amp; ST DEPRESSION</text>
          <text x="15" y="32" font-size="8" fill="#94a3b8">T wave flattening/inversion • ST depression ≥0.5 mm • Prominent U wave (U &gt; T) • Pseudo-prolonged QU interval</text>

          <g transform="translate(15, 25)">
            <!-- ECG trace showing P, Q, R, S, ST depression, flat T, large U -->
            <path d="M0 65 L25 65 Q33 65 37 59 Q42 53 47 59 Q52 65 60 65 L68 65 L72 70 L80 18 L88 82 L92 65 L98 75 Q110 75 118 72 Q126 68 132 70 Q142 50 152 46 Q162 50 170 65 L190 65 Q198 65 202 59 Q207 53 212 59 Q217 65 225 65 L233 65 L237 70 L245 18 L253 82 L257 65 L263 75 Q275 75 283 72 Q291 68 297 70 Q307 50 317 46 Q327 50 335 65 L360 65 L364 70 L372 18 L380 82 L384 65 L390 75 Q402 75 410 72 Q418 68 424 70 Q434 50 444 46 Q454 50 462 65 L490 65"
                  fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#38bdf8"/>

            <!-- Annotations -->
            <circle cx="108" cy="75" r="3" fill="#f59e0b"/>
            <text x="108" y="90" font-size="7.5" font-weight="800" fill="#fbbf24" text-anchor="middle">ST Depression</text>

            <circle cx="128" cy="70" r="2.5" fill="#94a3b8"/>
            <text x="128" y="82" font-size="7" fill="#cbd5e1" text-anchor="middle">Flat T</text>

            <circle cx="152" cy="46" r="3.5" fill="#22c55e"/>
            <text x="152" y="36" font-size="8.5" font-weight="900" fill="#4ade80" text-anchor="middle">PROMINENT U WAVE (U &gt; T)</text>

            <!-- QU Interval Bracket -->
            <line x1="72" y1="102" x2="170" y2="102" stroke="#38bdf8" stroke-width="1.2"/>
            <line x1="72" y1="99" x2="72" y2="105" stroke="#38bdf8" stroke-width="1.2"/>
            <line x1="170" y1="99" x2="170" y2="105" stroke="#38bdf8" stroke-width="1.2"/>
            <text x="121" y="113" font-size="7.5" font-weight="800" fill="#38bdf8" text-anchor="middle">Pseudo-Prolonged QU Interval ("Apparent Long QT")</text>

            <g class="ecg-beam">
              <rect x="0" y="0" width="25" height="115" fill="url(#sweepGradCyan)"/>
              <line x1="25" y1="0" x2="25" y2="115" stroke="#7dd3fc" stroke-width="2"/>
            </g>

            <!-- Legend Badge -->
            <g transform="translate(515, 15)">
              <rect x="0" y="0" width="185" height="78" rx="5" fill="rgba(15,23,42,0.85)" stroke="#334155" stroke-width="1.2"/>
              <text x="12" y="18" font-size="8" font-weight="800" fill="#38bdf8">U-WAVE CHARACTERISTICS</text>
              <text x="12" y="32" font-size="7.5" fill="#cbd5e1">• Amplitude &gt;1.0 mm (or &gt;50% of T)</text>
              <text x="12" y="44" font-size="7.5" fill="#cbd5e1">• Most prominent in leads V2 and V3</text>
              <text x="12" y="56" font-size="7.5" fill="#cbd5e1">• Same polarity as preceding T wave</text>
              <text x="12" y="68" font-size="7.5" fill="#fde68a">• Delays terminal repolarisation</text>
            </g>
          </g>
          <text x="15" y="142" font-size="7.5" fill="#bae6fd">• Due to delayed repolarisation of Mid-myocardial M cells and His-Purkinje conducting system fibers.</text>
        </g>

        <!-- PANEL 2: Severe Hypokalaemia (<2.5 mmol/L) & Lethal Arrhythmia Hazards -->
        <g transform="translate(20, 185)">
          <rect x="0" y="0" width="720" height="140" rx="6" fill="url(#monGridMajor)"/>
          <text x="15" y="20" font-size="10.5" font-weight="900" fill="#ef4444">SEVERE HYPOKALAEMIA (&lt;2.5 mmol/L) — R-ON-U VENTRICULAR ECTOPY &amp; TORSADES DE POINTES HAZARD</text>

          <g transform="translate(15, 25)">
            <!-- ECG showing giant U wave followed by early R-on-U ectopic beat trigger -->
            <path d="M0 65 L25 65 Q33 65 37 59 Q42 53 47 59 Q52 65 60 65 L68 65 L72 70 L80 18 L88 82 L92 65 L98 78 Q108 78 116 75 Q126 50 136 40 Q144 48 148 60 L152 75 L160 5 L172 105 L182 25 L195 90 L205 35 L218 80 L228 45 L240 75 L252 50 L265 70 L278 55 L292 65"
                  fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#ef4444"/>

            <circle cx="152" cy="65" r="4" fill="#fbbf24"/>
            <text x="152" y="98" font-size="8" font-weight="900" fill="#fbbf24" text-anchor="middle">R-on-U Ectopic Beat Trigger</text>
            <text x="235" y="25" font-size="8.5" font-weight="900" fill="#f87171">Polymorphic VT / Torsades de Pointes Initiation</text>

            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="25" height="105" fill="url(#sweepGradRed)"/>
              <line x1="25" y1="0" x2="25" y2="105" stroke="#f87171" stroke-width="2"/>
            </g>

            <!-- Safety Box -->
            <g transform="translate(480, 10)">
              <rect x="0" y="0" width="220" height="75" rx="5" fill="rgba(220,38,38,0.25)" stroke="#ef4444" stroke-width="1.3"/>
              <text x="110" y="16" font-size="8.5" font-weight="900" fill="#fee2e2" text-anchor="middle">⚠️ REPLACEMENT SAFETY LIMITS</text>
              <text x="110" y="30" font-size="7.8" font-weight="800" fill="#ffffff" text-anchor="middle">• Max Peripheral IV: ≤10 mEq/hour (≤40 mEq/L)</text>
              <text x="110" y="43" font-size="7.8" fill="#fecaca" text-anchor="middle">• Max Central Line: ≤20 mEq/hour (with ECG monitor)</text>
              <line x1="15" y1="50" x2="205" y2="50" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
              <text x="110" y="64" font-size="8" font-weight="800" fill="#fde68a" text-anchor="middle">CHECK &amp; CORRECT Mg²⁺ FIRST! (1–2g IV MgSO4)</text>
            </g>
          </g>
          <text x="15" y="132" font-size="7.5" fill="#fecaca">• Hypokalaemia refractory to repletion is almost universally caused by concomitant hypomagnesaemia impairing Na+/K+ ATPase.</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Hypokalaemia ECG Manifestations. Top: Pathognomonic prominent U wave (U &gt; T), ST depression, and pseudo-prolonged QU interval in moderate hypokalaemia (2.5–3.0 mmol/L). Bottom: Early R-on-U phenomenon triggering ventricular ectopy and Torsades de Pointes in severe hypokalaemia (&lt;2.5 mmol/L).</p>
    </div>`;
  }

  /* 11b. Cardiac Pacemaker Rhythms & Pacing Spikes */
  function ecgPacemakerDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Cardiac Pacemaker ECG Rhythms Pacing Spikes Modes and Malfunctions" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <defs>
          <pattern id="ecgGridMinor" width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="none" stroke="rgba(244,63,94,0.12)" stroke-width="0.5"/>
          </pattern>
          <pattern id="ecgGridMajor" width="25" height="25" patternUnits="userSpaceOnUse">
            <rect width="25" height="25" fill="url(#ecgGridMinor)" stroke="rgba(244,63,94,0.32)" stroke-width="1.1"/>
          </pattern>
          <pattern id="monGridMinor" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="6" height="6" fill="none" stroke="rgba(34,197,94,0.08)" stroke-width="0.5"/>
          </pattern>
          <pattern id="monGridMajor" width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="url(#monGridMinor)" stroke="rgba(34,197,94,0.22)" stroke-width="1.1"/>
          </pattern>
          <linearGradient id="sweepGradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0"/>
            <stop offset="80%" stop-color="#f59e0b" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.95"/>
          </linearGradient>
          <linearGradient id="sweepGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0"/>
            <stop offset="80%" stop-color="#38bdf8" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <style>
          @keyframes ecgBeamSweep {
            0% { transform: translateX(0px); opacity: 0; }
            3% { opacity: 1; }
            96% { opacity: 1; }
            100% { transform: translateX(710px); opacity: 0; }
          }
          .ecg-beam-fast { animation: ecgBeamSweep 2.4s linear infinite; }
          @keyframes ecgGlow {
            0%, 100% { filter: drop-shadow(0 0 1.5px currentColor); }
            50% { filter: drop-shadow(0 0 4px currentColor); }
          }
          .ecg-trace { animation: ecgGlow 2.5s ease-in-out infinite; }
        </style>
        <rect x="10" y="10" width="740" height="380" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- PANEL 1: Atrial Pacing (AAI) -->
        <g transform="translate(20, 20)">
          <rect x="0" y="0" width="350" height="85" rx="5" fill="url(#monGridMajor)"/>
          <text x="12" y="16" font-size="9" font-weight="900" fill="#fbbf24">1. ATRIAL PACING (AAI MODE): Atrial Spike → Captured P Wave → Normal QRS</text>
          <g transform="translate(10, 10)">
            <!-- Cycle 1 -->
            <line x1="30" y1="52" x2="30" y2="18" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M0 45 L30 45 L32 45 Q40 32 48 45 L62 45 L66 48 L72 18 L78 52 L82 45 L105 45 Q120 30 135 45 L155 45"
                  fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- Cycle 2 -->
            <line x1="185" y1="52" x2="185" y2="18" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M155 45 L185 45 L187 45 Q195 32 203 45 L217 45 L221 48 L227 18 L233 52 L237 45 L260 45 Q275 30 290 45 L320 45"
                  fill="none" stroke="#fbbf24" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="30" y="13" font-size="7.5" font-weight="900" fill="#fef08a" text-anchor="middle">Atrial Spike</text>
            <text x="75" y="65" font-size="7.2" fill="#cbd5e1">Narrow intrinsic QRS (Intact AV node)</text>
          </g>
        </g>

        <!-- PANEL 2: Ventricular Pacing (VVI, RV Apex) -->
        <g transform="translate(390, 20)">
          <rect x="0" y="0" width="350" height="85" rx="5" fill="url(#monGridMajor)"/>
          <text x="12" y="16" font-size="9" font-weight="900" fill="#38bdf8">2. VENTRICULAR PACING (VVI MODE, RV APEX): Spike → Broad LBBB-like QRS</text>
          <g transform="translate(10, 10)">
            <line x1="40" y1="58" x2="40" y2="12" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
            <path d="M0 45 L40 45 L44 45 L50 78 L65 78 L78 20 Q95 12 110 45 L145 45"
                  fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="185" y1="58" x2="185" y2="12" stroke="#38bdf8" stroke-width="2.8" stroke-linecap="round"/>
            <path d="M145 45 L185 45 L189 45 L195 78 L210 78 L223 20 Q240 12 255 45 L320 45"
                  fill="none" stroke="#38bdf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="40" y="10" font-size="7.5" font-weight="900" fill="#7dd3fc" text-anchor="middle">Ventricular Spike</text>
            <text x="60" y="70" font-size="7.5" font-weight="800" fill="#fca5a5">Wide QRS (≥120 ms)</text>
            <text x="260" y="68" font-size="7" fill="#cbd5e1">LBBB Pattern + LAD (RV Apex)</text>
          </g>
        </g>

        <!-- PANEL 3: Dual-Chamber AV Sequential Pacing (DDD Mode) -->
        <g transform="translate(20, 115)">
          <rect x="0" y="0" width="720" height="110" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="900" fill="#10b981">3. DUAL-CHAMBER AV SEQUENTIAL PACING (DDD MODE): Dual Spikes (Atrial → AV Delay → Ventricular)</text>
          <g transform="translate(15, 12)">
            <line x1="40" y1="55" x2="40" y2="20" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/>
            <line x1="105" y1="62" x2="105" y2="12" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M0 48 L40 48 L42 48 Q52 35 62 48 L105 48 L108 48 L114 82 L128 82 L142 20 Q160 12 178 48 L220 48"
                  fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#10b981"/>

            <line x1="260" y1="55" x2="260" y2="20" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/>
            <line x1="325" y1="62" x2="325" y2="12" stroke="#38bdf8" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M220 48 L260 48 L262 48 Q272 35 282 48 L325 48 L328 48 L334 82 L348 82 L362 20 Q380 12 398 48 L450 48"
                  fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ecg-trace" color="#10b981"/>

            <line x1="40" y1="75" x2="105" y2="75" stroke="#fbbf24" stroke-width="1.4"/>
            <line x1="40" y1="71" x2="40" y2="79" stroke="#fbbf24" stroke-width="1.4"/>
            <line x1="105" y1="71" x2="105" y2="79" stroke="#fbbf24" stroke-width="1.4"/>
            <text x="72" y="86" font-size="7.5" font-weight="800" fill="#fbbf24" text-anchor="middle">Programmed AV Delay (150–200 ms)</text>

            <g class="ecg-beam-fast">
              <rect x="0" y="0" width="25" height="95" fill="url(#sweepGradAmber)"/>
              <line x1="25" y1="0" x2="25" y2="95" stroke="#fbbf24" stroke-width="2"/>
            </g>

            <g transform="translate(470, 10)">
              <rect x="0" y="0" width="220" height="75" rx="4" fill="rgba(15,23,42,0.9)" stroke="#334155" stroke-width="1.2"/>
              <text x="12" y="16" font-size="8.2" font-weight="900" fill="#34d399">PHYSIOLOGICAL ADVANTAGES:</text>
              <text x="12" y="30" font-size="7.5" fill="#cbd5e1">• Preserves Atrial Kick (+20–30% Stroke Volume)</text>
              <text x="12" y="43" font-size="7.5" fill="#cbd5e1">• Prevents Pacemaker Syndrome (cannon A waves)</text>
              <text x="12" y="56" font-size="7.5" fill="#cbd5e1">• Tracks sinus rhythm up to Upper Rate Limit</text>
              <text x="12" y="68" font-size="7.5" fill="#fde68a">• Senses intrinsic R waves to inhibit ventricular spike</text>
            </g>
          </g>
        </g>

        <!-- PANEL 4: Pacemaker Malfunctions & Pitfalls -->
        <g transform="translate(20, 235)">
          <rect x="0" y="0" width="720" height="140" rx="5" fill="url(#monGridMajor)"/>
          <text x="15" y="18" font-size="9.5" font-weight="900" fill="#ef4444">4. PACEMAKER MALFUNCTIONS: Failure to Capture &amp; Undersensing (R-on-T Spike Hazard)</text>
          <g transform="translate(15, 15)">
            <!-- Failure to Capture -->
            <line x1="30" y1="55" x2="30" y2="12" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>
            <path d="M0 48 L30 48 L110 48 L115 52 L120 18 L126 56 L130 48 L155 48" fill="none" stroke="#f87171" stroke-width="2.2"/>
            <circle cx="30" cy="12" r="3.5" fill="#ef4444"/>
            <text x="30" y="72" font-size="7.8" font-weight="900" fill="#fca5a5" text-anchor="middle">FAILURE TO CAPTURE</text>
            <text x="30" y="83" font-size="7" fill="#fee2e2" text-anchor="middle">Spike without subsequent QRS</text>

            <line x1="175" y1="5" x2="175" y2="105" stroke="#334155" stroke-dasharray="2,2"/>

            <!-- Undersensing -->
            <g transform="translate(195, 0)">
              <path d="M0 48 L20 48 Q28 36 36 48 L48 48 L52 52 L58 12 L64 58 L68 48 L80 48 Q98 25 116 48 L140 48" fill="none" stroke="#38bdf8" stroke-width="2.2"/>
              <line x1="104" y1="58" x2="104" y2="12" stroke="#ef4444" stroke-width="2.8" stroke-linecap="round"/>
              <circle cx="104" cy="12" r="3.5" fill="#dc2626"/>
              <text x="104" y="72" font-size="7.8" font-weight="900" fill="#f87171" text-anchor="middle">UNDERSENSING (R-on-T)</text>
              <text x="104" y="83" font-size="7" fill="#fca5a5" text-anchor="middle">Spike ignores intrinsic QRS; fires on T wave!</text>

              <path d="M140 48 L145 15 L155 75 L165 15 L175 75 L185 15 L195 75 L205 15" fill="none" stroke="#ef4444" stroke-width="2.4"/>
              <text x="180" y="94" font-size="7.5" font-weight="900" fill="#ef4444" text-anchor="middle">Lethal VT / VF Trigger 🚨</text>
            </g>

            <!-- Magnet Application Box -->
            <g transform="translate(435, 5)">
              <rect x="0" y="0" width="255" height="100" rx="4" fill="rgba(220,38,38,0.2)" stroke="#ef4444" stroke-width="1.3"/>
              <text x="127" y="16" font-size="8.5" font-weight="900" fill="#fee2e2" text-anchor="middle">🧲 PERIOPERATIVE MAGNET APPLICATION</text>
              <text x="12" y="32" font-size="7.5" fill="#fecaca">• Converts Pacemaker to <tspan font-weight="bold" fill="#ffffff">VOO / DOO Asynchronous mode</tspan></text>
              <text x="12" y="44" font-size="7.5" fill="#fecaca">• Prevents cautery EMI from causing inhibition</text>
              <text x="12" y="56" font-size="7.5" fill="#fecaca">• Fixed rate (85–100 bpm) indicates battery longevity</text>
              <text x="12" y="68" font-size="7.5" font-weight="bold" fill="#fde68a">• On ICD: Suspends shocks; does NOT pace!</text>
              <text x="12" y="80" font-size="7.2" fill="#cbd5e1">Bipolar cautery &amp; return pad away from thorax</text>
              <text x="12" y="92" font-size="7.2" fill="#bae6fd">Sgarbossa criteria apply to paced rhythm in STEMI!</text>
            </g>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Cardiac Pacemaker ECG Rhythms &amp; Diagnostic Malfunctions. Top: Atrial pacing (AAI) with sharp atrial spike and intrinsic QRS; Ventricular pacing (VVI) with wide LBBB-like QRS. Middle: Dual-Chamber AV Sequential pacing (DDD). Bottom: Pacemaker malfunctions (Failure to Capture &amp; Undersensing R-on-T hazard) and intraoperative magnet response.</p>
    </div>`;
  }

  /* 12. Arterial Blood Gas (ABG) 6-Step Systematic Interpretation Flowchart */
  function abgStepwiseFlowchartHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Stepwise ABG Interpretation Flowchart" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="360" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- Header -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="700" height="30" rx="5" fill="#1e293b"/>
          <text x="350" y="19" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">SYSTEMATIC 6-STEP ARTERIAL BLOOD GAS (ABG) INTERPRETATION</text>
        </g>

        <!-- STEP 1: pH Assessment -->
        <g transform="translate(30, 68)">
          <rect x="0" y="0" width="220" height="85" rx="6" fill="#111827" stroke="#3b82f6" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#1d4ed8"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 1: pH (ACIDEMIA vs ALKALEMIA)</text>
          <text x="12" y="34" font-size="8" font-weight="800" fill="#ef4444">• pH &lt; 7.35: Acidemia (Excess H+)</text>
          <text x="12" y="47" font-size="8" font-weight="800" fill="#22c55e">• pH 7.35 – 7.45: Normal or Mixed</text>
          <text x="12" y="60" font-size="8" font-weight="800" fill="#38bdf8">• pH &gt; 7.45: Alkalemia (Deficit H+)</text>
          <text x="12" y="73" font-size="7.2" fill="#94a3b8">Severe risk: pH &lt;7.10 or &gt;7.60</text>
        </g>

        <!-- Arrow 1 -> 2 -->
        <path d="M250 110 L268 110" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrowCyan)"/>

        <!-- STEP 2: Primary Disorder -->
        <g transform="translate(270, 68)">
          <rect x="0" y="0" width="220" height="85" rx="6" fill="#111827" stroke="#0ea5e9" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#0284c7"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 2: PRIMARY PROCESS (CO2 vs HCO3)</text>
          <text x="12" y="34" font-size="7.8" fill="#e2e8f0">• If pH &amp; pCO2 opposite: <tspan fill="#ef4444" font-weight="bold">RESPIRATORY</tspan></text>
          <text x="12" y="47" font-size="7.8" fill="#e2e8f0">• If pH &amp; HCO3 same: <tspan fill="#f59e0b" font-weight="bold">METABOLIC</tspan></text>
          <text x="12" y="60" font-size="7.5" fill="#cbd5e1">• pCO2 &gt;45 = Resp Acidosis; &lt;35 = Alk</text>
          <text x="12" y="73" font-size="7.5" fill="#cbd5e1">• HCO3 &lt;22 = Met Acidosis; &gt;26 = Alk</text>
        </g>

        <!-- Arrow 2 -> 3 -->
        <path d="M490 110 L508 110" stroke="#38bdf8" stroke-width="2"/>

        <!-- STEP 3: Compensation -->
        <g transform="translate(510, 68)">
          <rect x="0" y="0" width="220" height="85" rx="6" fill="#111827" stroke="#8b5cf6" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#7c3aed"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 3: COMPENSATION RULES</text>
          <text x="12" y="34" font-size="7.5" font-weight="800" fill="#fde68a">• Met Acid: pCO2 = 1.5×HCO3 + 8 ± 2</text>
          <text x="12" y="47" font-size="7.5" fill="#e9d5ff">• Met Alk: pCO2 = 0.7×ΔHCO3 + 40 ± 2</text>
          <text x="12" y="60" font-size="7.5" fill="#e9d5ff">• Acute Resp: ΔHCO3 = 1 (Acid) / 2 (Alk)</text>
          <text x="12" y="73" font-size="7.5" fill="#e9d5ff">• Chronic Resp: ΔHCO3 = 3.5 (Acid) / 5 (Alk)</text>
        </g>

        <!-- Vertical Flow to Bottom Row -->
        <!-- STEP 4: Anion Gap -->
        <g transform="translate(30, 175)">
          <rect x="0" y="0" width="220" height="95" rx="6" fill="#111827" stroke="#f59e0b" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#d97706"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 4: ANION GAP &amp; ALBUMIN</text>
          <text x="12" y="35" font-size="8" font-weight="800" fill="#fef08a">AG = Na+ – (Cl– + HCO3–)</text>
          <text x="12" y="48" font-size="7.5" fill="#fde68a">• Normal AG: 8 to 12 mmol/L</text>
          <text x="12" y="61" font-size="7.5" font-weight="bold" fill="#f87171">• Corrected AG = AG + 2.5×(4.0 – Alb)</text>
          <text x="12" y="74" font-size="7.2" fill="#cbd5e1">Every 1 g/dL drop in Albumin lowers AG by 2.5</text>
          <text x="12" y="86" font-size="7.2" fill="#bae6fd">Prevents missing occult HAGMA in ICU sepsis</text>
        </g>

        <!-- Arrow 4 -> 5 -->
        <path d="M250 220 L268 220" stroke="#f59e0b" stroke-width="2"/>

        <!-- STEP 5: Delta-Delta Ratio -->
        <g transform="translate(270, 175)">
          <rect x="0" y="0" width="220" height="95" rx="6" fill="#111827" stroke="#ec4899" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#db2777"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 5: DELTA RATIO (ΔAG / ΔHCO3)</text>
          <text x="12" y="34" font-size="8" font-weight="800" fill="#fbcfe8">Δ/Δ = (AG – 12) / (24 – HCO3)</text>
          <text x="12" y="48" font-size="7.5" fill="#fdf2f8">• 1.0 to 2.0 = Pure HAGMA (DKA/Lactic)</text>
          <text x="12" y="61" font-size="7.5" font-weight="bold" fill="#f43f5e">• &lt;0.8 = Mixed HAGMA + NAGMA</text>
          <text x="12" y="74" font-size="7.5" font-weight="bold" fill="#38bdf8">• &gt;2.0 = Mixed HAGMA + Met Alkalosis</text>
          <text x="12" y="87" font-size="7.2" fill="#cbd5e1">(or Pre-existing Chronic Hypercapnia)</text>
        </g>

        <!-- Arrow 5 -> 6 -->
        <path d="M490 220 L508 220" stroke="#ec4899" stroke-width="2"/>

        <!-- STEP 6: Oxygenation & A-a Gradient -->
        <g transform="translate(510, 175)">
          <rect x="0" y="0" width="220" height="95" rx="6" fill="#111827" stroke="#10b981" stroke-width="1.4"/>
          <rect x="0" y="0" width="220" height="20" rx="6" fill="#059669"/>
          <text x="110" y="14" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">STEP 6: OXYGENATION &amp; SHUNT</text>
          <text x="12" y="34" font-size="7.5" fill="#d1fae5">• PaO2 / FiO2 Ratio (P/F):</text>
          <text x="20" y="47" font-size="7.5" fill="#a7f3d0">&gt;300 Normal | 200–300 Mild ARDS</text>
          <text x="20" y="59" font-size="7.5" fill="#fde68a">100–200 Mod ARDS | &lt;100 Severe ARDS</text>
          <text x="12" y="72" font-size="7.5" font-weight="800" fill="#6ee7b7">• A-a Gradient = PAO2 – PaO2</text>
          <text x="12" y="85" font-size="7.2" fill="#cbd5e1">Normal &lt; (Age/4 + 4) • High = V/Q Shunt / PE</text>
        </g>

        <!-- Bottom Summary Card -->
        <g transform="translate(30, 285)">
          <rect x="0" y="0" width="700" height="68" rx="6" fill="rgba(30,41,59,0.7)" stroke="#475569" stroke-width="1.2"/>
          <text x="15" y="18" font-size="8.8" font-weight="900" fill="#38bdf8">GOLDEN CLINICAL RULES IN ACID-BASE INTERPRETATION:</text>
          <text x="15" y="34" font-size="8" fill="#e2e8f0">1. The body NEVER over-compensates for a primary acid-base disorder (pH never crosses normal to the other side).</text>
          <text x="15" y="48" font-size="8" fill="#e2e8f0">2. Normal anion gap does NOT rule out HAGMA in hypoalbuminemia — ALWAYS calculate Albumin-Corrected Anion Gap.</text>
          <text x="15" y="61" font-size="8" fill="#fde68a">3. If the Delta Ratio is &lt;0.8, look immediately for diarrhea or normal saline resuscitation hyperchloremia!</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Systematic 6-Step Arterial Blood Gas (ABG) Interpretation Algorithm. Step 1 (pH) → Step 2 (Primary disorder) → Step 3 (Compensation equations) → Step 4 (Albumin-corrected Anion Gap) → Step 5 (Delta ratio for triple disorders) → Step 6 (P/F ratio and A-a alveolar-arterial oxygen gradient).</p>
    </div>`;
  }

  /* 13. Gamblegram Electrolyte Balance: Normal vs HAGMA vs NAGMA */
  function abgAnionGapBalanceHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Gamblegram Anion Gap Balance Normal vs HAGMA vs NAGMA" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="340" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>

        <!-- Header -->
        <text x="380" y="32" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">ELECTROLYTE GAMBLEGRAM: NORMAL vs HAGMA vs NAGMA</text>
        <text x="380" y="46" font-size="8" fill="#94a3b8" text-anchor="middle">Law of Electroneutrality: Total Cations (Na+) Must Equal Total Anions (Cl– + HCO3– + Unmeasured Anions)</text>

        <!-- COLUMN 1: NORMAL STATE -->
        <g transform="translate(50, 60)">
          <rect x="0" y="0" width="180" height="210" rx="6" fill="#111827" stroke="#334155" stroke-width="1.4"/>
          <text x="90" y="18" font-size="9" font-weight="900" fill="#22c55e" text-anchor="middle">NORMAL STATE (AG = 12)</text>

          <!-- Cation Bar Na+ -->
          <rect x="15" y="30" width="65" height="165" rx="3" fill="#3b82f6"/>
          <text x="47" y="115" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">Na⁺</text>
          <text x="47" y="130" font-size="8" font-weight="bold" fill="#dbeafe" text-anchor="middle">140</text>

          <!-- Anion Bars -->
          <!-- Chloride -->
          <rect x="90" y="30" width="75" height="115" rx="3" fill="#0ea5e9"/>
          <text x="127" y="85" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">Cl⁻</text>
          <text x="127" y="98" font-size="8" font-weight="bold" fill="#e0f2fe" text-anchor="middle">104</text>

          <!-- Bicarbonate -->
          <rect x="90" y="147" width="75" height="28" rx="2" fill="#10b981"/>
          <text x="127" y="165" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle">HCO₃⁻ 24</text>

          <!-- Normal Anion Gap -->
          <rect x="90" y="177" width="75" height="18" rx="2" fill="#64748b"/>
          <text x="127" y="190" font-size="8" font-weight="900" fill="#f8fafc" text-anchor="middle">AG 12</text>
        </g>

        <!-- COLUMN 2: HAGMA -->
        <g transform="translate(290, 60)">
          <rect x="0" y="0" width="180" height="210" rx="6" fill="#111827" stroke="#ef4444" stroke-width="1.6"/>
          <text x="90" y="18" font-size="9" font-weight="900" fill="#ef4444" text-anchor="middle">HAGMA (EXPANDED AG)</text>

          <!-- Cation Bar Na+ -->
          <rect x="15" y="30" width="65" height="165" rx="3" fill="#3b82f6"/>
          <text x="47" y="115" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">Na⁺</text>
          <text x="47" y="130" font-size="8" font-weight="bold" fill="#dbeafe" text-anchor="middle">140</text>

          <!-- Anion Bars -->
          <!-- Chloride normal -->
          <rect x="90" y="30" width="75" height="115" rx="3" fill="#0ea5e9"/>
          <text x="127" y="85" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">Cl⁻ 104</text>

          <!-- Bicarbonate Consumed -->
          <rect x="90" y="147" width="75" height="12" rx="2" fill="#10b981"/>
          <text x="127" y="157" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">HCO₃ 10</text>

          <!-- EXPANDED Anion Gap -->
          <rect x="90" y="161" width="75" height="34" rx="2" fill="#ef4444"/>
          <text x="127" y="177" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">AG 26 🚨</text>
          <text x="127" y="189" font-size="6.8" font-weight="bold" fill="#fee2e2" text-anchor="middle">Lactate / Ketones</text>
        </g>

        <!-- COLUMN 3: NAGMA (Hyperchloraemic) -->
        <g transform="translate(530, 60)">
          <rect x="0" y="0" width="180" height="210" rx="6" fill="#111827" stroke="#f59e0b" stroke-width="1.6"/>
          <text x="90" y="18" font-size="9" font-weight="900" fill="#f59e0b" text-anchor="middle">NAGMA (HYPERCHLORAEMIC)</text>

          <!-- Cation Bar Na+ -->
          <rect x="15" y="30" width="65" height="165" rx="3" fill="#3b82f6"/>
          <text x="47" y="115" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">Na⁺</text>
          <text x="47" y="130" font-size="8" font-weight="bold" fill="#dbeafe" text-anchor="middle">140</text>

          <!-- Anion Bars -->
          <!-- Chloride EXPANDED -->
          <rect x="90" y="30" width="75" height="131" rx="3" fill="#0284c7"/>
          <text x="127" y="90" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">EXPANDED Cl⁻</text>
          <text x="127" y="103" font-size="8" font-weight="bold" fill="#bae6fd" text-anchor="middle">118 ⚠️</text>

          <!-- Bicarbonate Consumed / Lost -->
          <rect x="90" y="163" width="75" height="12" rx="2" fill="#10b981"/>
          <text x="127" y="173" font-size="7.5" font-weight="900" fill="#ffffff" text-anchor="middle">HCO₃ 10</text>

          <!-- Normal Anion Gap Preserved -->
          <rect x="90" y="177" width="75" height="18" rx="2" fill="#64748b"/>
          <text x="127" y="190" font-size="8" font-weight="900" fill="#f8fafc" text-anchor="middle">AG 12 (Normal)</text>
        </g>

        <!-- Bottom Comparison Banner -->
        <g transform="translate(50, 282)">
          <rect x="0" y="0" width="660" height="52" rx="5" fill="rgba(15,23,42,0.9)" stroke="#334155" stroke-width="1.2"/>
          <text x="15" y="18" font-size="8.5" font-weight="900" fill="#38bdf8">KEY MECHANISTIC DISTINCTION:</text>
          <text x="15" y="32" font-size="8" fill="#e2e8f0">• In HAGMA, unmeasured fixed organic acids (lactate, acetoacetate) consume HCO3– while chloride remains normal.</text>
          <text x="15" y="44" font-size="8" fill="#fde68a">• In NAGMA, HCO3– is lost directly (diarrhea/RTA) or diluted; chloride rises mole-for-mole to preserve neutrality.</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Electrolyte Gamblegram: Anion Gap Dynamics. Left: Normal electrolyte distribution (AG = 12). Middle: High Anion Gap Metabolic Acidosis (HAGMA) with unmeasured organic anions consuming bicarbonate while chloride is stable. Right: Normal Anion Gap Metabolic Acidosis (NAGMA) where hyperchloremia mirrors bicarbonate loss.</p>
    </div>`;
  }

  /* 14. Arterial Blood Gas (ABG) Expected Compensation Formulas */
  function abgCompensationRulesDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 360" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ABG Expected Compensation Formulas and Diagnostic Rules" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="340" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>
        <!-- Header -->
        <g transform="translate(30, 25)">
          <rect x="0" y="0" width="700" height="30" rx="5" fill="#1e293b"/>
          <text x="350" y="19" font-size="11" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">EXPECTED PHYSIOLOGICAL COMPENSATION RULES IN ACID-BASE DISORDERS</text>
        </g>
        <!-- Row 1: Metabolic Disorders -->
        <!-- Met Acidosis (Winter's) -->
        <g transform="translate(30, 68)">
          <rect x="0" y="0" width="340" height="125" rx="6" fill="#111827" stroke="#ef4444" stroke-width="1.4"/>
          <rect x="0" y="0" width="340" height="22" rx="6" fill="#b91c1c"/>
          <text x="170" y="15" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">METABOLIC ACIDOSIS (WINTER'S FORMULA)</text>
          <rect x="20" y="30" width="300" height="28" rx="4" fill="rgba(239,68,68,0.2)" stroke="#ef4444" stroke-width="1"/>
          <text x="170" y="48" font-size="10.5" font-weight="900" fill="#fca5a5" text-anchor="middle">Expected PaCO₂ = 1.5 × [HCO₃⁻] + 8 ± 2</text>
          <text x="15" y="72" font-size="7.8" font-weight="700" fill="#cbd5e1">• If Actual PaCO₂ &gt; Expected: <tspan fill="#f87171" font-weight="bold">+ Concomitant Resp Acidosis</tspan></text>
          <text x="15" y="85" font-size="7.8" font-weight="700" fill="#cbd5e1">• If Actual PaCO₂ &lt; Expected: <tspan fill="#38bdf8" font-weight="bold">+ Concomitant Resp Alkalosis</tspan></text>
          <text x="15" y="100" font-size="7.2" fill="#fde68a">Bedside Quick Rule: Expected PaCO₂ ≈ [HCO₃⁻] + 15 (or last 2 digits of pH)</text>
          <text x="15" y="114" font-size="7.2" fill="#94a3b8">Max Respiratory Compensation Limit: PaCO₂ rarely drops below 10–12 mmHg</text>
        </g>
        <!-- Met Alkalosis -->
        <g transform="translate(390, 68)">
          <rect x="0" y="0" width="340" height="125" rx="6" fill="#111827" stroke="#0284c7" stroke-width="1.4"/>
          <rect x="0" y="0" width="340" height="22" rx="6" fill="#0369a1"/>
          <text x="170" y="15" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">METABOLIC ALKALOSIS (HYPOVENTILATION LIMIT)</text>
          <rect x="20" y="30" width="300" height="28" rx="4" fill="rgba(2,132,199,0.2)" stroke="#0284c7" stroke-width="1"/>
          <text x="170" y="48" font-size="10" font-weight="900" fill="#7dd3fc" text-anchor="middle">Expected PaCO₂ = 40 + 0.7 × ([HCO₃⁻] – 24) ± 2</text>
          <text x="15" y="72" font-size="7.8" font-weight="700" fill="#cbd5e1">• If Actual PaCO₂ &gt; Expected: <tspan fill="#f87171" font-weight="bold">+ Concomitant Resp Acidosis</tspan></text>
          <text x="15" y="85" font-size="7.8" font-weight="700" fill="#cbd5e1">• If Actual PaCO₂ &lt; Expected: <tspan fill="#38bdf8" font-weight="bold">+ Concomitant Resp Alkalosis</tspan></text>
          <text x="15" y="100" font-size="7.2" fill="#fde68a">Max Respiratory Compensation Limit: PaCO₂ rarely exceeds 55–60 mmHg</text>
          <text x="15" y="114" font-size="7.2" fill="#94a3b8">(Hypoxic drive via carotid chemoreceptors prevents further hypoventilation)</text>
        </g>
        <!-- Row 2: Respiratory Disorders (Acute vs Chronic Renal Compensation) -->
        <!-- Resp Acidosis -->
        <g transform="translate(30, 205)">
          <rect x="0" y="0" width="340" height="135" rx="6" fill="#111827" stroke="#f59e0b" stroke-width="1.4"/>
          <rect x="0" y="0" width="340" height="22" rx="6" fill="#b45309"/>
          <text x="170" y="15" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">RESPIRATORY ACIDOSIS (↑ PaCO₂ &gt; 40 mmHg)</text>
          <!-- Acute -->
          <g transform="translate(15, 30)">
            <rect x="0" y="0" width="150" height="55" rx="4" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1"/>
            <text x="75" y="15" font-size="8.2" font-weight="900" fill="#fbbf24" text-anchor="middle">ACUTE (Immediate Buffering)</text>
            <text x="75" y="30" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">ΔHCO₃⁻ = 1 mEq/L</text>
            <text x="75" y="42" font-size="7.2" fill="#cbd5e1" text-anchor="middle">per 10 mmHg ↑ PaCO₂</text>
            <text x="75" y="51" font-size="6.8" fill="#fca5a5" text-anchor="middle">(pH drops 0.08 / 10 mmHg)</text>
          </g>
          <!-- Chronic -->
          <g transform="translate(175, 30)">
            <rect x="0" y="0" width="150" height="55" rx="4" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1"/>
            <text x="75" y="15" font-size="8.2" font-weight="900" fill="#fbbf24" text-anchor="middle">CHRONIC (Renal Retention 3–5d)</text>
            <text x="75" y="30" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">ΔHCO₃⁻ = 3.5 to 4 mEq/L</text>
            <text x="75" y="42" font-size="7.2" fill="#cbd5e1" text-anchor="middle">per 10 mmHg ↑ PaCO₂</text>
            <text x="75" y="51" font-size="6.8" fill="#86efac" text-anchor="middle">(pH drops 0.03 / 10 mmHg)</text>
          </g>
          <text x="170" y="102" font-size="7.5" font-weight="800" fill="#fde68a" text-anchor="middle">Max Renal Bicarbonate Compensation: HCO₃⁻ rarely &gt;45 mEq/L</text>
          <text x="170" y="116" font-size="7.2" fill="#cbd5e1" text-anchor="middle">If HCO₃⁻ between Acute &amp; Chronic: Partial compensation (Acute-on-chronic)</text>
        </g>
        <!-- Resp Alkalosis -->
        <g transform="translate(390, 205)">
          <rect x="0" y="0" width="340" height="135" rx="6" fill="#111827" stroke="#10b981" stroke-width="1.4"/>
          <rect x="0" y="0" width="340" height="22" rx="6" fill="#047857"/>
          <text x="170" y="15" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle">RESPIRATORY ALKALOSIS (↓ PaCO₂ &lt; 40 mmHg)</text>
          <!-- Acute -->
          <g transform="translate(15, 30)">
            <rect x="0" y="0" width="150" height="55" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
            <text x="75" y="15" font-size="8.2" font-weight="900" fill="#34d399" text-anchor="middle">ACUTE (Immediate Buffering)</text>
            <text x="75" y="30" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">ΔHCO₃⁻ = 2 mEq/L</text>
            <text x="75" y="42" font-size="7.2" fill="#cbd5e1" text-anchor="middle">per 10 mmHg ↓ PaCO₂</text>
            <text x="75" y="51" font-size="6.8" fill="#86efac" text-anchor="middle">(pH rises 0.08 / 10 mmHg)</text>
          </g>
          <!-- Chronic -->
          <g transform="translate(175, 30)">
            <rect x="0" y="0" width="150" height="55" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
            <text x="75" y="15" font-size="8.2" font-weight="900" fill="#34d399" text-anchor="middle">CHRONIC (Renal Excretion 2–3d)</text>
            <text x="75" y="30" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">ΔHCO₃⁻ = 5 mEq/L</text>
            <text x="75" y="42" font-size="7.2" fill="#cbd5e1" text-anchor="middle">per 10 mmHg ↓ PaCO₂</text>
            <text x="75" y="51" font-size="6.8" fill="#86efac" text-anchor="middle">(pH rises 0.03 / 10 mmHg)</text>
          </g>
          <text x="170" y="102" font-size="7.5" font-weight="800" fill="#a7f3d0" text-anchor="middle">Max Renal Bicarbonate Elimination Limit: HCO₃⁻ rarely &lt;12–15 mEq/L</text>
          <text x="170" y="116" font-size="7.2" fill="#cbd5e1" text-anchor="middle">Severe hypocapnia causes cerebral vasoconstriction and leftward oxyhemoglobin shift</text>
        </g>
      </svg>
      <p class="st-diagram-caption">Standard Arterial Blood Gas (ABG) Physiological Expected Compensation Equations. Used to evaluate whether secondary respiratory or renal response is adequate or if a mixed primary acid-base disorder co-exists.</p>
    </div>`;
  }

  /* 15. HAGMA vs NAGMA Diagnostic Decision Tree */
  function abgHagmaNagmaTreeDiagramHTML() {
    return `<div class="st-diagram-wrap st-flowchart-wrap">
      <svg viewBox="0 0 760 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="HAGMA vs NAGMA Diagnostic Decision Tree and Urine Anion Gap" style="width:100%;max-width:760px;height:auto;display:block;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
        <rect x="10" y="10" width="740" height="360" rx="8" fill="#090d16" stroke="#1e293b" stroke-width="1.8"/>
        <!-- Header -->
        <g transform="translate(30, 22)">
          <rect x="0" y="0" width="700" height="28" rx="5" fill="#1e293b"/>
          <text x="350" y="18" font-size="10.5" font-weight="900" fill="#38bdf8" text-anchor="middle" letter-spacing="1">METABOLIC ACIDOSIS DIAGNOSTIC DECISION TREE: HAGMA vs NAGMA</text>
        </g>

        <!-- Root Node: Metabolic Acidosis confirmed -->
        <g transform="translate(260, 60)">
          <rect x="0" y="0" width="240" height="42" rx="6" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
          <text x="120" y="17" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">METABOLIC ACIDOSIS CONFIRMED</text>
          <text x="120" y="32" font-size="7.8" fill="#93c5fd" text-anchor="middle">pH &lt; 7.35  •  [HCO₃⁻] &lt; 22 mEq/L</text>
        </g>

        <!-- Connecting Lines -->
        <path d="M380 102 L380 115 L200 115 L200 135" stroke="#ef4444" stroke-width="2" fill="none"/>
        <path d="M380 115 L560 115 L560 135" stroke="#f59e0b" stroke-width="2" fill="none"/>

        <!-- LEFT BRANCH: HAGMA -->
        <g transform="translate(40, 135)">
          <rect x="0" y="0" width="320" height="220" rx="6" fill="#111827" stroke="#ef4444" stroke-width="1.5"/>
          <rect x="0" y="0" width="320" height="24" rx="6" fill="#b91c1c"/>
          <text x="160" y="16" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">HIGH ANION GAP (HAGMA: AG &gt; 12 mmol/L)</text>
          
          <rect x="15" y="32" width="290" height="45" rx="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>
          <text x="25" y="47" font-size="8" font-weight="800" fill="#fca5a5">1. Correct for Albumin: AG_corr = AG + 2.5×(4.0 – Alb)</text>
          <text x="25" y="60" font-size="8" font-weight="800" fill="#fca5a5">2. Check Delta Ratio: ΔAG / ΔHCO₃⁻ = (AG – 12) / (24 – HCO₃⁻)</text>
          <text x="35" y="71" font-size="7.2" fill="#cbd5e1">• &lt;0.8 = Mixed HAGMA + NAGMA  • &gt;2.0 = Mixed HAGMA + Met Alk</text>

          <!-- Mnemonics Box -->
          <rect x="15" y="85" width="290" height="120" rx="4" fill="rgba(15,23,42,0.9)" stroke="#374151" stroke-width="1"/>
          <text x="25" y="100" font-size="8.5" font-weight="900" fill="#fbbf24">DIAGNOSTIC MNEMONICS:</text>
          <text x="25" y="115" font-size="8" font-weight="800" fill="#f87171">• GOLD MARK (Toxicology Standard):</text>
          <text x="35" y="128" font-size="7.5" fill="#cbd5e1">G = Glycols | O = Oxoproline (Paracetamol) | L = L-Lactate</text>
          <text x="35" y="139" font-size="7.5" fill="#cbd5e1">D = D-Lactate | M = Methanol | A = Aspirin | R = Renal | K = Keto</text>
          <text x="25" y="156" font-size="8" font-weight="800" fill="#f87171">• MUDPILES (Classic Bedside):</text>
          <text x="35" y="169" font-size="7.5" fill="#cbd5e1">Methanol, Uremia, DKA, Paracetamol/Propylene, Iron/INH,</text>
          <text x="35" y="180" font-size="7.5" fill="#cbd5e1">Lactic acidosis (Shock/Sepsis), Ethylene glycol, Salicylates</text>
          <text x="25" y="198" font-size="7.5" font-weight="700" fill="#a7f3d0">Immediate Workup: Lactate, Ketones, BUN/Cr, Osmolal Gap</text>
        </g>

        <!-- RIGHT BRANCH: NAGMA -->
        <g transform="translate(400, 135)">
          <rect x="0" y="0" width="320" height="220" rx="6" fill="#111827" stroke="#f59e0b" stroke-width="1.5"/>
          <rect x="0" y="0" width="320" height="24" rx="6" fill="#b45309"/>
          <text x="160" y="16" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">NORMAL ANION GAP (NAGMA: AG 8–12 mmol/L)</text>
          
          <rect x="15" y="32" width="290" height="35" rx="4" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="1"/>
          <text x="160" y="47" font-size="8.2" font-weight="900" fill="#fbbf24" text-anchor="middle">CALCULATE URINE ANION GAP (UAG):</text>
          <text x="160" y="59" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">UAG = ([Na⁺]_u + [K⁺]_u) – [Cl⁻]_u</text>

          <!-- UAG Sub-branches -->
          <!-- Negative UAG -->
          <g transform="translate(15, 75)">
            <rect x="0" y="0" width="140" height="75" rx="4" fill="rgba(16,185,129,0.15)" stroke="#10b981" stroke-width="1"/>
            <text x="70" y="15" font-size="7.8" font-weight="900" fill="#34d399" text-anchor="middle">NEGATIVE UAG (-20 to -50)</text>
            <text x="70" y="28" font-size="7" fill="#cbd5e1" text-anchor="middle">Intact renal NH₄⁺ excretion</text>
            <text x="70" y="44" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">GI HCO₃⁻ LOSS</text>
            <text x="70" y="56" font-size="7.2" fill="#a7f3d0" text-anchor="middle">• Severe Diarrhea</text>
            <text x="70" y="67" font-size="7.2" fill="#a7f3d0" text-anchor="middle">• Enterocutaneous fistula</text>
          </g>
          <!-- Positive UAG -->
          <g transform="translate(165, 75)">
            <rect x="0" y="0" width="140" height="75" rx="4" fill="rgba(239,68,68,0.15)" stroke="#ef4444" stroke-width="1"/>
            <text x="70" y="15" font-size="7.8" font-weight="900" fill="#fca5a5" text-anchor="middle">POSITIVE UAG (+20 to +40)</text>
            <text x="70" y="28" font-size="7" fill="#cbd5e1" text-anchor="middle">Impaired renal NH₄⁺ excretion</text>
            <text x="70" y="44" font-size="8" font-weight="800" fill="#ffffff" text-anchor="middle">RENAL TUBULAR ACIDOSIS</text>
            <text x="70" y="56" font-size="7.2" fill="#fca5a5" text-anchor="middle">• Distal Type 1 RTA</text>
            <text x="70" y="67" font-size="7.2" fill="#fca5a5" text-anchor="middle">• Hypoaldosteronism (Type 4)</text>
          </g>

          <!-- Iatrogenic / HARDCARP box -->
          <g transform="translate(15, 158)">
            <rect x="0" y="0" width="290" height="50" rx="4" fill="rgba(15,23,42,0.9)" stroke="#374151" stroke-width="1"/>
            <text x="12" y="15" font-size="7.8" font-weight="900" fill="#38bdf8">IATROGENIC &amp; EXOGENOUS CAUSES (HARDCARP):</text>
            <text x="12" y="28" font-size="7.2" fill="#cbd5e1">• Massive 0.9% Normal Saline resuscitation (hyperchloremic acidosis)</text>
            <text x="12" y="40" font-size="7.2" fill="#cbd5e1">• Acetazolamide, TPN hyperalimentation, ureterosigmoidostomy</text>
          </g>
        </g>
      </svg>
      <p class="st-diagram-caption">Metabolic Acidosis Diagnostic Flowchart: Differentiating High Anion Gap (HAGMA) from Normal Anion Gap (NAGMA). In NAGMA, calculating the Urine Anion Gap (UAG) definitively distinguishes extra-renal GI bicarbonate loss (negative UAG) from Renal Tubular Acidosis (positive UAG).</p>
    </div>`;
  }

  function showDetail() {
    if (typeof window.KNUnmountAllTileMolecules === "function") {
      window.KNUnmountAllTileMolecules();
    }
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

    const structRec = window.KN_STRUCTURES && window.KN_STRUCTURES[item.id];
    const has3d = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[item.id];
    let titleMediaHTML;
    if (has3d) {
      titleMediaHTML = `<div class="st-molecule-viewer" data-drug="${esc(item.id)}" aria-label="Rotating 3D model of ${esc(item.name)}">${structRec ? `<div class="st-structure-svg">${structRec.svg}</div>` : `<div class="st-tile-fallback-icon">${catIconHTML(item.cat, cat)}</div>`}</div>`;
    } else if (structRec) {
      titleMediaHTML = `<div class="st-structure-svg">${structRec.svg}</div>`;
    } else {
      titleMediaHTML = catIconHTML(item.cat, cat);
    }

    // Title renders as a normal in-flow card — immediately visible with glass styling
    $("#stDetail").innerHTML = `
      <div class="st-reading-col">
        <a class="st-back" href="${backHref}" data-back>← Back to ${esc(cat.label)}</a>
        <section class="st-card st-title-card st-reveal st-reveal-visible" data-cat="${item.cat}">
          <div class="st-title-card-media" aria-hidden="true">${titleMediaHTML}</div>
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

  /* ---------------------------------------------------------------- master directory drawer */
  let drawerOpen = false;

  /* ---------------------------------------------------------------- top master index */
  function renderTopIndex(filter = "") {
    const content = $("#stIndexContent");
    const stats = $("#stIndexStats");
    if (!content) return;
    const f = filter.trim().toLowerCase();

    let totalShown = 0;
    let html = "";

    DATA.categories.forEach((c) => {
      let items = itemsInCat(c.id);
      if (f) {
        items = items.filter((it) => {
          return [it.name, it.short, it.tagline, it.brand].concat(it.tags || []).filter(Boolean).join(" ").toLowerCase().includes(f);
        });
      }
      if (!items.length) return;
      totalShown += items.length;
      const isDrug = isDrugCat(c.id);

      html += `<div class="st-index-cat-group">
        <div class="st-index-cat-header">
          <span class="st-index-cat-icon">${c.icon}</span>
          <span class="st-index-cat-name">${esc(c.label)}</span>
          <span class="st-index-cat-count">${items.length}</span>
        </div>
        <ul class="st-index-links-list">
          ${items.map((it) => `
            <li class="st-index-link-item">
              <a href="?item=${it.id}" data-item="${it.id}" class="st-index-link">
                <span class="st-index-link-text">${esc(it.short || it.name)}</span>
                ${isDrug ? `<span class="st-index-link-tag">Rx</span>` : ""}
              </a>
            </li>
          `).join("")}
        </ul>
      </div>`;
    });

    content.innerHTML = totalShown
      ? `<div class="st-index-cats-grid">${html}</div>`
      : `<div class="st-index-empty">No topics or drugs matching “${esc(filter)}”.</div>`;

    if (stats) stats.textContent = `${totalShown} entries`;
    const countEl = $("#stTopIndex .st-index-count");
    if (countEl && !f) countEl.textContent = `(${DATA.topics.length} Topics • ${DATA.drugs.length} Drugs)`;
  }

  function initTopIndex() {
    const toggleBtn = $("#stIndexToggle");
    const panel = $("#stIndexPanel");
    const filterInput = $("#stIndexFilter");
    const chevron = $("#stIndexChevron");
    if (!toggleBtn || !panel) return;

    let indexOpen = false;

    function openIndex() {
      panel.hidden = false;
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.classList.add("st-open");
      if (chevron) chevron.textContent = "▴";
      indexOpen = true;
      renderTopIndex(filterInput ? filterInput.value : "");
      if (filterInput) filterInput.focus();
    }

    function closeIndex() {
      panel.hidden = true;
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.classList.remove("st-open");
      if (chevron) chevron.textContent = "▾";
      indexOpen = false;
    }

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (indexOpen) closeIndex();
      else openIndex();
    });

    if (filterInput) {
      filterInput.addEventListener("input", () => {
        renderTopIndex(filterInput.value);
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && indexOpen) closeIndex();
    });

    // Delegated click handler for ANY [data-item] link (index, tiles, cross-links)
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[data-item]");
      if (!a) return;
      const id = a.getAttribute("data-item");
      if (!id || !itemById(id)) return;
      e.preventDefault();
      closeIndex();
      state.item = id;
      writeURL({ item: id });
      showDetail();
    });
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
      btn.innerHTML = active ? "✕ Exit" : "⛶ Fullscreen";
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
  // Mouse-tracked 3D tilt is strictly scoped to poster grid tiles (.st-tile) on desktop mouse only.
  function initCardTilt() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return; // Desktop mouse only!
    const SELECTOR = ".st-tile";
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
        node.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.06) translateZ(8px)`;
      });
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
      if (activeNode && (!e.relatedTarget || !activeNode.contains(e.relatedTarget))) {
        activeNode.style.transform = "";
        activeNode = null;
      }
    });
  }

  // Reading cards (.st-card) in Study Mode: subtle border highlight on touch or click,
  // completely eliminating the sticking 3D tilt issue on touch devices.
  function initCardHighlight() {
    document.addEventListener("pointerdown", (e) => {
      const card = e.target.closest ? e.target.closest("#stDetail .st-card") : null;
      if (!card) {
        document.querySelectorAll("#stDetail .st-card-active").forEach((c) => c.classList.remove("st-card-active"));
        return;
      }
      document.querySelectorAll("#stDetail .st-card-active").forEach((c) => {
        if (c !== card) c.classList.remove("st-card-active");
      });
      card.classList.add("st-card-active");
    });
  }

  function init() {
    bindListEvents();
    initTopIndex();
    initFullscreen();
    initNavAutoHide();
    initCardTilt();
    initCardHighlight();
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
