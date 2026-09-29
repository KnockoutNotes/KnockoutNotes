/* ==========================================================================
   KNOCKOUTNOTES — Regional Anaesthesia page controller (regional-ui.js)
   Listing (category tabs + pictorial tiles) and block detail (7 tabs) on one
   page, routed by ?cat= / ?block= / ?tab= with history.pushState so each
   block has its own shareable URL. The 3D viewer (regional-3d.js) is
   imported lazily the first time a block is opened.
   ========================================================================== */

const DATA = window.KN_REGIONAL;
const SONO = window.KNRegionalSono;
const TABS = ["overview", "anatomy", "sono", "procedure", "spread", "tips", "pearls"];

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const byId = new Map(DATA.blocks.map((b) => [b.id, b]));
const catById = new Map(DATA.categories.map((c) => [c.id, c]));

const toggles = { labels: false, needle: true, spread: true };
try {
  const saved = JSON.parse(localStorage.getItem("kn-regional-toggles") || "null");
  if (saved) Object.assign(toggles, saved);
} catch (_) { /* storage unavailable — defaults are fine */ }

// Real (or properly licensed reference) ultrasound images set from the admin
// panel — keyed by block id, fetched once at load. A block with an entry
// here shows that real photo instead of the simulated fallback. See
// worker/regional-images.js / getReal() below.
const realOverrides = {};
fetch("/api/regional-images").then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((map) => {
  Object.assign(realOverrides, map || {});
  // If the current block/tab already rendered before this resolved, re-render
  // so a newly-available real image shows up without a manual refresh.
  if (state.block && (state.tab === "overview" || state.tab === "sono")) renderTab();
});

// Merge an admin-set image (URL/source/attribution/orientation/probe) with
// any hand-authored, fully-annotated real image on the block itself
// (b.sono.real — labels/needleOverlay/spreadOverlay), when present.
function getReal(b) {
  const authored = (b.sono && b.sono.real) || null;
  const admin = realOverrides[b.id] || null;
  if (!admin && !authored) return null;
  return {
    image: (admin && admin.image_url) || (authored && authored.image) || null,
    source: (admin && admin.source) || (authored && authored.source) || null,
    attribution: (admin && admin.attribution) || (authored && authored.attribution) || null,
    orientation: (admin && admin.orientation) || (authored && authored.orientation) || null,
    probe: (admin && admin.probe) || (authored && authored.probe) || null,
    // Admin-edited markers (from the /admin Regional Images marker editor)
    // take priority over hand-authored ones in code, so fixing a wrong
    // marker from the admin panel actually changes what visitors see. The
    // API returns `null` (not `[]`) for labels/spreadOverlay that were
    // never touched by the marker editor, so an admin who deliberately
    // clears every marker and saves (an explicit `[]`) is respected here
    // rather than silently falling back to the wrong authored ones.
    labels: (admin && admin.labels ? admin.labels : null) || (authored && authored.labels) || [],
    needleOverlay: (admin && admin.needleOverlay) || (authored && authored.needleOverlay) || null,
    spreadOverlay: (admin && admin.spreadOverlay ? admin.spreadOverlay : null) || (authored && authored.spreadOverlay) || []
  };
}

const coarse = window.matchMedia("(pointer: coarse)").matches;
const haptic = () => { if (coarse && navigator.vibrate) navigator.vibrate(8); };

const SOURCE_TEXT = { NYSORA: "NYSORA", "KnockoutNotes / user-provided": "user-provided" };

let state = { cat: "upper", block: null, tab: "overview", filter: "", combo: null };
const MAX_COMBO = 4;
let viewer = null;
let viewerPromise = null;
let viewerHost = null;
let sonoCtrls = [];

/* ---------------------------------------------------------------- routing */
function readURL() {
  const q = new URLSearchParams(location.search);
  if (q.get("view") === "combine") {
    const ids = (q.get("blocks") || "").split(",").filter((id) => byId.has(id));
    return { combo: Array.from(new Set(ids)).slice(0, MAX_COMBO) };
  }
  const block = q.get("block");
  const tab = q.get("tab");
  const cat = q.get("cat");
  return {
    block: block && byId.has(block) ? block : null,
    tab: TABS.includes(tab) ? tab : "overview",
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
  if (r.combo) {
    state.block = null;
    state.combo = r.combo;
    showCombine();
    return;
  }
  state.combo = null;
  if (r.block) {
    state.block = r.block;
    state.tab = r.tab;
    state.cat = byId.get(r.block).cat;
    showDetail();
  } else {
    state.block = null;
    if (r.cat) state.cat = r.cat;
    showList();
  }
}

/* ---------------------------------------------------------------- listing */
function renderCatNav() {
  const nav = $("#rgCatNav");
  const counts = {};
  DATA.blocks.forEach((b) => { counts[b.cat] = (counts[b.cat] || 0) + 1; });
  const items = DATA.categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, n: counts[c.id] || 0 }))
    .concat([{ id: "all", label: "View All", icon: "✦", n: DATA.blocks.length }]);
  nav.innerHTML = items.map((c) =>
    `<button type="button" role="tab" class="rg-cat${state.cat === c.id ? " active" : ""}" data-cat="${c.id}" aria-selected="${state.cat === c.id}">` +
    `<span aria-hidden="true">${c.icon}</span> ${esc(c.label)} <span class="rg-count">${c.n}</span></button>`
  ).join("");
}

function tileHTML(b) {
  const cat = catById.get(b.cat);
  return `<a class="rg-tile" href="?block=${b.id}" data-block="${b.id}" data-cat="${b.cat}" aria-label="${esc(b.name)}">
    <div class="rg-tile-img">${SONO.thumb(b)}</div>
    <div class="rg-tile-info">
      <span class="rg-tile-cat">${cat.icon} ${esc(cat.label)}</span>
      <strong class="rg-tile-name">${esc(b.short)}</strong>
      <span class="rg-tile-tag">${esc(b.tagline)}</span>
      <span class="rg-tile-open">Open block →</span>
    </div>
  </a>`;
}

function renderGrid() {
  const grid = $("#rgGrid");
  const f = state.filter.trim().toLowerCase();
  const match = (b) => !f || [b.name, b.short, b.tagline, b.summary].concat(b.tags).join(" ").toLowerCase().includes(f);
  const cats = state.cat === "all" || f ? DATA.categories : [catById.get(state.cat)];
  let html = "";
  let total = 0;
  cats.forEach((c) => {
    const list = DATA.blocks.filter((b) => b.cat === c.id && match(b));
    total += list.length;
    if (!list.length) return;
    if (state.cat === "all" || f) html += `<h2 class="rg-group-title"><span>${c.icon}</span> ${esc(c.label)}</h2>`;
    const hasSub = state.cat !== "all" && !f && list.some((b) => b.sub);
    if (hasSub) {
      const subs = [];
      list.forEach((b) => { const k = b.sub || ""; if (!subs.includes(k)) subs.push(k); });
      subs.forEach((sub) => {
        const subList = list.filter((b) => (b.sub || "") === sub);
        if (sub) html += `<h3 class="rg-subgroup-title">${esc(sub)}</h3>`;
        html += `<div class="rg-grid">${subList.map(tileHTML).join("")}</div>`;
      });
    } else {
      html += `<div class="rg-grid">${list.map(tileHTML).join("")}</div>`;
    }
  });
  grid.innerHTML = total ? html : `<div class="rg-empty">No blocks match “${esc(state.filter)}”.</div>`;
  SONO.hydrateThumbs(grid);
  bindTilt(grid);
}

function bindTilt(root) {
  if (coarse || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  root.querySelectorAll(".rg-tile").forEach((tile) => {
    tile.addEventListener("pointermove", (e) => {
      const r = tile.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tile.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
      tile.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    });
    tile.addEventListener("pointerleave", () => {
      tile.style.setProperty("--rx", "0deg");
      tile.style.setProperty("--ry", "0deg");
    });
  });
}

function showList() {
  $("#rgDetail").hidden = true;
  $("#rgCombine").hidden = true;
  $("#rgList").hidden = false;
  document.title = "Regional Anaesthesia — Nerve Blocks | KnockoutNotes";
  renderCatNav();
  renderGrid();
}

/* ---------------------------------------------------------------- detail */
const ul = (items, cls = "") => `<ul class="rg-list ${cls}">${(items || []).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;

function card(title, body, extraClass = "", toolbar = "") {
  return `<section class="rg-card ${extraClass}"><div class="rg-card-head"><h3>${title}</h3>${toolbar}</div><div class="rg-card-body">${body}</div></section>`;
}

// "All Labels / Needle / Spread" — belongs to the Ultrasound component
// itself (and, separately, to the 3D card), never the page header.
function usToolbarHTML(compactClass) {
  return `<div class="rg-us-toolbar${compactClass ? " " + compactClass : ""}" role="group" aria-label="Show on ultrasound">
    <button type="button" class="rg-toggle" data-toggle="labels" aria-pressed="false">🏷 All Labels</button>
    <button type="button" class="rg-toggle" data-toggle="needle" aria-pressed="true">💉 Needle</button>
    <button type="button" class="rg-toggle" data-toggle="spread" aria-pressed="true">💧 Spread</button>
  </div>`;
}

function viewerCard(b, large) {
  const t = b.spread.three;
  const variants = t.variants && t.variants.length
    ? `<div class="rg-variants" role="group" aria-label="Spread variant">${t.variants.map((v, i) => `<button type="button" class="rg-chip${i === 0 ? " active" : ""}" data-variant="${v.id}">${esc(v.label)}</button>`).join("")}</div>`
    : "";
  const controls = `<div class="rg-3d-controls">
      <div class="rg-seg" role="group" aria-label="View">
        <button type="button" data-view="anterior">Anterior</button><button type="button" data-view="posterior">Posterior</button>
        <button type="button" data-view="right">Right</button><button type="button" data-view="left">Left</button>
      </div>
      <div class="rg-seg" role="group" aria-label="Zoom">
        <button type="button" data-zoom="in" aria-label="Zoom in">＋</button><button type="button" data-zoom="out" aria-label="Zoom out">－</button><button type="button" data-view="reset">Reset</button>
      </div>
    </div>`;
  return card("3D coverage <small>(where anaesthesia/analgesia is expected)</small>",
    `${usToolbarHTML("rg-us-toolbar-compact")}${variants}<div class="rg-3d-slot${large ? " rg-3d-large" : ""}" data-3d-slot><div class="rg-3d-loading">Loading 3D model…</div></div>
     ${controls}<div class="rg-legend" data-legend></div>
     <p class="rg-hint">Drag to rotate • use the buttons to zoom or change view. Block shown on the patient's right.</p>
     <a class="rg-btn rg-combo-link" href="?view=combine&amp;blocks=${b.id}" data-combine-with="${b.id}">🧩 Combine with other blocks</a>`,
    "rg-card-3d");
}

function panelHTML(b, tab) {
  const k = b.keyInfo;
  switch (tab) {
    case "overview": {
      const real0 = getReal(b);
      const usHint0 = real0 && real0.image
        ? `${coarse ? "Tap" : "Hover over"} a labelled structure to see its name — or switch on “All Labels”. Real image${real0.source ? ` (${esc(SOURCE_TEXT[real0.source] || real0.source)})` : ""}, not AI-generated.`
        : `${coarse ? "Tap" : "Hover over"} a structure to see its label — or switch on “All Labels”. Simulated schematic — no real scan is loaded for this block yet.`;
      return `<div class="rg-overview">
        ${card("Ultrasound — Interactive", `${usToolbarHTML()}<div class="rg-img-frame" data-sono="sono"></div><p class="rg-hint">${usHint0}</p>`, "rg-card-img rg-card-us")}
        ${card("Key information <small>(high-yield)</small>", `<div class="rg-keys">
          ${keyTile("🧍", "Patient positioning", ul(k.position))}
          ${keyTile("🎯", "Approach", ul(k.approach))}
          ${keyTile("💉", "Procedure", ul(k.procedure))}
          ${keyTile("🧪", "Volume", `<p>${esc(k.volume)}</p>`)}
          ${keyTile("🗺", "Coverage", `<p>${esc(k.coverage)}</p>`)}
        </div>`, "rg-card-keys")}
        ${card("Exam line diagram", `<div class="rg-img-frame rg-paper" data-sono="line"></div><p class="rg-hint">Draw this in the exam — simplified original artwork, not a copy of any textbook figure.</p>`, "rg-card-img")}
        ${viewerCard(b, false)}
      </div>
      <div class="rg-summary">${card("Overview", `<p>${esc(b.summary)}</p><h4>Indications</h4>${ul(b.indications)}`)}</div>`;
    }
    case "anatomy": {
      const a = b.anatomy;
      const plexus = a.plexus ? card(`${a.plexus.type === "brachial" ? "Brachial" : "Lumbosacral"} plexus — where this block acts`, `<div class="rg-plexus-frame" data-plexus></div>`) : "";
      return `<div class="rg-two">
        <div>${card("Relevant anatomy", `<p>${esc(a.text)}</p><h4>Key relations</h4>${ul(a.relations)}<h4>Targets</h4><p>${esc(a.targets)}</p>`)}${plexus}</div>
        <div>${card("Line diagram <small>(for exams)</small>", `<div class="rg-img-frame rg-paper" data-sono="line"></div>`, "rg-card-img")}</div>
      </div>`;
    }
    case "sono": {
      const s = b.sono;
      const real1 = getReal(b);
      const structs = s.image.s.filter((x) => x.l && x.d && x.t !== "outline");
      const title = real1 && real1.image ? "Ultrasound — Interactive" : (s.image.probe === "landmark" ? "Landmark map" : "Ultrasound — Interactive (simulated)");
      let sonoHint;
      if (real1 && real1.image) {
        sonoHint = `Real ultrasound image${real1.source ? ` — ${esc(SOURCE_TEXT[real1.source] || real1.source)}` : ""}${real1.attribution ? ` (${esc(real1.attribution)})` : ""}.`;
      } else if (s.image.probe === "landmark") {
        sonoHint = "Landmark map — original artwork.";
      } else {
        sonoHint = "Simulated B-mode frame generated from the NYSORA-described sono-anatomy — not a real patient scan. Hypoechoic = dark, hyperechoic = bright, bone casts an acoustic shadow.";
      }
      const facts = real1 && real1.image
        ? `<div class="rg-facts">${real1.probe ? `<span><b>Probe</b> ${esc(real1.probe)}</span>` : ""}${real1.orientation ? `<span><b>Orientation</b> ${esc(real1.orientation)}</span>` : ""}</div>`
        : `<div class="rg-facts"><span><b>Probe</b> ${esc(s.probe)}</span><span><b>Depth</b> ${esc(s.depth)}</span><span><b>Orientation</b> ${esc(s.orientation)}</span></div>`;
      return `<div class="rg-two rg-two-wide">
        <div>${card(title, `${usToolbarHTML()}${facts}
          <div class="rg-img-frame rg-img-large" data-sono="sono"></div>
          <p class="rg-hint">${sonoHint}</p>`, "rg-card-img rg-card-us")}</div>
        <div>${card("Structure key", `<ol class="rg-structs">${structs.map((x) => `<li data-structure="${esc(x.id)}" tabindex="0"><span class="rg-dot rg-dot-${x.t}"></span><div><strong>${esc(x.l)}</strong><span>${esc(x.d)}</span></div></li>`).join("")}</ol>`)}</div>
      </div>`;
    }
    case "procedure": {
      const p = b.procedure;
      return `<div class="rg-two">
        <div>${card("Set-up", `<dl class="rg-dl">
          <dt>Position</dt><dd>${esc(p.position)}</dd><dt>Probe</dt><dd>${esc(p.probe)}</dd>
          <dt>Needle</dt><dd>${esc(p.needle)}</dd><dt>Approach</dt><dd>${esc(p.approach)}</dd>
          <dt>Volume</dt><dd>${esc(p.volume)}</dd><dt>End-point</dt><dd>${esc(p.endpoint)}</dd></dl>`)}</div>
        <div>${card("Step-by-step", `<ol class="rg-steps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
          <p class="rg-safety">⚠ Standard safety: monitoring, IV access, aspiration and incremental injection, low injection pressure, maximum-dose calculation, lipid emulsion available.</p>`)}</div>
      </div>`;
    }
    case "spread": {
      const s = b.spread;
      return `<div class="rg-two rg-two-wide">
        <div>${viewerCard(b, true)}</div>
        <div>${card("Spread & coverage", `<p>${esc(s.summary)}</p>
          <h4 class="rg-h-ok">Covered</h4>${ul(s.covered, "rg-list-ok")}
          <h4 class="rg-h-no">Spared / not covered</h4>${ul(s.spared, "rg-list-no")}
          <h4>Motor & side effects</h4><p>${esc(s.motor)}</p>`)}</div>
      </div>`;
    }
    case "tips":
      return `<div class="rg-three">
        ${card("✅ Tips", ul(b.tips, "rg-list-ok"))}
        ${card("⚠️ Pitfalls", ul(b.pitfalls, "rg-list-warn"))}
        ${card("🚑 Complications", ul(b.complications, "rg-list-no"))}
      </div>`;
    case "pearls":
      return `<div class="rg-two">
        <div>${card("⭐ Exam pearls", `<ol class="rg-pearls">${b.pearls.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>`)}</div>
        <div>${card("Indications", ul(b.indications))}${card("One-line summary", `<p class="rg-oneliner">${esc(b.summary)}</p>`)}</div>
      </div>`;
    default:
      return "";
  }
}

function keyTile(icon, title, body) {
  return `<div class="rg-key"><div class="rg-key-icon" aria-hidden="true">${icon}</div><div><h4>${title}</h4>${body}</div></div>`;
}

function showDetail() {
  const b = byId.get(state.block);
  const cat = catById.get(b.cat);
  $("#rgList").hidden = true;
  $("#rgCombine").hidden = true;
  $("#rgDetail").hidden = false;
  document.title = `${b.name} | Regional Anaesthesia | KnockoutNotes`;

  $("#rgCrumb").innerHTML = `<a href="?cat=${b.cat}" data-cat-link="${b.cat}">${cat.icon} ${esc(cat.label)}</a> <span>›</span> ${esc(b.short)}`;
  $("#rgBlockKicker").textContent = cat.label.toUpperCase();
  $("#rgBlockTitle").textContent = b.name;
  $("#rgBlockTagline").textContent = b.tagline;
  $("#rgBlockTags").innerHTML = b.tags.map((t) => `<span class="rg-tag">${esc(t)}</span>`).join("");
  const real2 = getReal(b);
  const imgNote = real2 && real2.image
    ? `The ultrasound image is a real${real2.source ? ` (${esc(SOURCE_TEXT[real2.source] || real2.source)})` : ""} scan${real2.attribution ? ` — ${esc(real2.attribution)}` : ""}; needle/spread overlays and the line diagram are original artwork.`
    : `The ultrasound frame is a simulated B-mode image (not a patient scan) and the line diagram is original artwork.`;
  $("#rgCite").innerHTML = `Based on NYSORA — <a href="${esc(b.source.url)}" target="_blank" rel="noopener noreferrer">${esc(b.source.title)}</a> (summarised and reworded, not verbatim). ${esc(DATA.meta.checked)}. ${imgNote} ${esc(DATA.meta.disclaimer)}`;

  const idx = DATA.blocks.indexOf(b);
  $("#rgPrev").disabled = idx === 0;
  $("#rgNext").disabled = idx === DATA.blocks.length - 1;

  syncToggleButtons();
  renderTab();
  window.scrollTo(0, 0);
}

function renderTab() {
  const b = byId.get(state.block);
  document.querySelectorAll("#rgTabs [data-tab]").forEach((btn) => {
    const on = btn.dataset.tab === state.tab;
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-selected", on);
  });
  const panels = $("#rgPanels");
  if (viewerHost && viewerHost.parentNode) viewerHost.parentNode.removeChild(viewerHost);
  panels.innerHTML = `<div class="rg-panel" role="tabpanel">${panelHTML(b, state.tab)}</div>`;

  sonoCtrls = [];
  panels.querySelectorAll("[data-sono]").forEach((el) => {
    const mode = el.dataset.sono;
    const ctrl = SONO.render(el, b, { mode, labels: toggles.labels, needle: toggles.needle, spread: toggles.spread, real: mode === "sono" ? getReal(b) : null });
    sonoCtrls.push(ctrl);
    if (mode === "sono") {
      ctrl.onSelect((sid) => {
        panels.querySelectorAll("[data-structure]").forEach((li) => li.classList.toggle("active", li.dataset.structure === sid));
      });
    }
  });
  panels.querySelectorAll("[data-structure]").forEach((li) => {
    const pick = () => {
      const ctrl = sonoCtrls.find((c) => !c.svg.classList.contains("rg-mode-line"));
      if (ctrl) ctrl.select(li.classList.contains("active") ? null : li.dataset.structure);
    };
    li.addEventListener("click", pick);
    li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  const plex = panels.querySelector("[data-plexus]");
  if (plex) SONO.plexus(plex, b.anatomy.plexus);

  const slot = panels.querySelector("[data-3d-slot]");
  if (slot) mountViewer(slot, b);
  syncToggleButtons();
}

/* ---------------------------------------------------------------- combine */
function comboColors() {
  return viewer && viewer.colors ? viewer.colors : ["#0ea5e9", "#a855f7", "#22c55e", "#f97316"];
}

function showCombine() {
  $("#rgList").hidden = true;
  $("#rgDetail").hidden = true;
  $("#rgCombine").hidden = false;
  document.title = "Combine Blocks in 3D | Regional Anaesthesia | KnockoutNotes";
  syncToggleButtons();
  const body = $("#rgCombineBody");
  if (viewerHost && viewerHost.parentNode) viewerHost.parentNode.removeChild(viewerHost);
  sonoCtrls = [];
  const presets = (DATA.combos || []).map((c) =>
    `<button type="button" class="rg-preset" data-preset="${c.id}">${esc(c.label)}<small>${esc(c.note)}</small></button>`).join("");
  const groups = DATA.categories.map((c) => {
    const list = DATA.blocks.filter((b) => b.cat === c.id && b.spread && b.spread.three);
    return `<div class="rg-pick-group"><h4>${c.icon} ${esc(c.label)}</h4><div class="rg-pick-list">${list.map((b) =>
      `<button type="button" class="rg-pick" data-pick="${b.id}" aria-pressed="false"><i></i>${esc(b.short)}</button>`).join("")}</div></div>`;
  }).join("");
  const controls = `<div class="rg-3d-controls">
      <div class="rg-seg" role="group" aria-label="View">
        <button type="button" data-view="anterior">Anterior</button><button type="button" data-view="posterior">Posterior</button>
        <button type="button" data-view="right">Right</button><button type="button" data-view="left">Left</button>
      </div>
      <div class="rg-seg" role="group" aria-label="Zoom">
        <button type="button" data-zoom="in" aria-label="Zoom in">＋</button><button type="button" data-zoom="out" aria-label="Zoom out">－</button><button type="button" data-view="reset">Reset</button>
      </div>
    </div>`;
  body.innerHTML =
    `<div>${card("Common combinations", `<div class="rg-presets">${presets}</div>`)}
      ${card(`Choose blocks <small>(up to ${MAX_COMBO})</small>`, `${groups}<button type="button" class="rg-btn" data-combo-clear>Clear selection</button>`)}</div>
     <div>${card("Combined area of coverage", `<div class="rg-combo-sel" data-combo-sel></div>
        <div class="rg-3d-slot" data-3d-slot><div class="rg-3d-loading">Loading 3D model…</div></div>
        ${controls}<div class="rg-legend" data-legend></div>
        <p class="rg-combo-note">Each block keeps its own colour; where blocks overlap the colours blend. Paler shade = variable spread. All blocks shown on the patient's right; deep targets and side effects (e.g., phrenic) are marked. Drag to rotate.</p>`, "rg-card-3d")}</div>`;
  body.querySelectorAll("[data-preset]").forEach((btn) => {
    btn.onclick = () => {
      haptic();
      const c = DATA.combos.find((x) => x.id === btn.dataset.preset);
      setCombo(c.blocks.slice());
    };
  });
  body.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.onclick = () => {
      haptic();
      const id = btn.dataset.pick;
      const list = state.combo.slice();
      const i = list.indexOf(id);
      if (i >= 0) list.splice(i, 1);
      else if (list.length < MAX_COMBO) list.push(id);
      setCombo(list);
    };
  });
  body.querySelector("[data-combo-clear]").onclick = () => { haptic(); setCombo([]); };
  window.scrollTo(0, 0);
  const slot = body.querySelector("[data-3d-slot]");
  mountViewer(slot, null).then(() => updateCombo());
}

function setCombo(list) {
  state.combo = list;
  writeURL({ view: "combine", blocks: list.join(",") }, true);
  updateCombo();
}

function updateCombo() {
  const body = $("#rgCombineBody");
  const colors = comboColors();
  body.querySelectorAll("[data-pick]").forEach((btn) => {
    const i = state.combo.indexOf(btn.dataset.pick);
    btn.classList.toggle("on", i >= 0);
    btn.setAttribute("aria-pressed", i >= 0);
    btn.style.setProperty("--pc", i >= 0 ? colors[i] : "transparent");
    btn.disabled = i < 0 && state.combo.length >= MAX_COMBO;
  });
  const sel = body.querySelector("[data-combo-sel]");
  sel.innerHTML = state.combo.length
    ? state.combo.map((id, i) => `<a href="?block=${id}" data-open-block="${id}" style="--pc:${colors[i]}">${esc(byId.get(id).short)} ↗</a>`).join("")
    : `<span class="rg-hint">Pick a combination or choose blocks on the left.</span>`;
  sel.querySelectorAll("[data-open-block]").forEach((a) => {
    a.onclick = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      openBlock(a.dataset.openBlock);
    };
  });
  if (!viewer) return;
  const card = body.querySelector(".rg-card-3d");
  renderLegend(card, viewer.setCombination(state.combo.map((id) => byId.get(id))));
  viewer.setToggles({ labels: toggles.labels, needle: toggles.needle, spread: toggles.spread });
}

function openBlock(id) {
  haptic();
  state.combo = null;
  state.block = id;
  state.tab = "overview";
  state.cat = byId.get(id).cat;
  writeURL({ block: id });
  showDetail();
}

/* ---------------------------------------------------------------- 3D */
async function mountViewer(slot, b) {
  if (!viewerHost) {
    viewerHost = document.createElement("div");
    viewerHost.className = "rg-3d-host";
  }
  slot.appendChild(viewerHost);
  try {
    if (!viewerPromise) {
      viewerPromise = import("./regional-3d.js").then((mod) => {
        viewer = mod.createSpreadViewer(viewerHost);
        return viewer;
      });
    }
    await viewerPromise;
  } catch (err) {
    console.error("[Regional 3D] failed to load", err);
    slot.innerHTML = '<div class="rg-3d-fallback">3D model could not be loaded.</div>';
    return;
  }
  const loading = slot.querySelector(".rg-3d-loading");
  if (loading) loading.remove();
  if (!viewer) return;
  const card = slot.closest(".rg-card");
  if (!b) { bindViewerControls(card); return; }
  const activeVariant = card.querySelector(".rg-chip.active");
  const legend = viewer.setBlock(b, activeVariant ? activeVariant.dataset.variant : undefined);
  viewer.setToggles({ labels: toggles.labels, needle: toggles.needle, spread: toggles.spread });
  renderLegend(card, legend);
  bindViewerControls(card);
}

function renderLegend(card, legend) {
  const el = card.querySelector("[data-legend]");
  if (!el) return;
  el.innerHTML = legend.map((l) => `<span><i style="background:${l.color}"></i>${esc(l.label)}</span>`).join("");
}

function bindViewerControls(card) {
  card.querySelectorAll("[data-view]").forEach((btn) => {
    btn.onclick = () => {
      haptic();
      if (btn.dataset.view === "reset") viewer.reset();
      else viewer.setView(btn.dataset.view);
    };
  });
  card.querySelectorAll("[data-zoom]").forEach((btn) => {
    btn.onclick = () => { haptic(); viewer.zoom(btn.dataset.zoom === "in" ? 0.82 : 1.22); };
  });
  card.querySelectorAll("[data-variant]").forEach((btn) => {
    btn.onclick = () => {
      haptic();
      card.querySelectorAll("[data-variant]").forEach((b) => b.classList.toggle("active", b === btn));
      renderLegend(card, viewer.setVariant(btn.dataset.variant));
    };
  });
}

/* ---------------------------------------------------------------- toggles */
function syncToggleButtons() {
  document.querySelectorAll(".rg-toggle").forEach((btn) => {
    const on = !!toggles[btn.dataset.toggle];
    btn.setAttribute("aria-pressed", on);
    btn.classList.toggle("on", on);
  });
}

function applyToggles() {
  sonoCtrls.forEach((c) => { c.setLabels(toggles.labels); c.setNeedle(toggles.needle); c.setSpread(toggles.spread); });
  if (viewer) viewer.setToggles({ labels: toggles.labels, needle: toggles.needle, spread: toggles.spread });
  try { localStorage.setItem("kn-regional-toggles", JSON.stringify(toggles)); } catch (_) { /* ignore */ }
}

/* ---------------------------------------------------------------- events */
function bind() {
  $("#rgCombineOpen").addEventListener("click", () => {
    haptic();
    state.combo = [];
    writeURL({ view: "combine" });
    showCombine();
  });

  $("#rgCatNav").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    haptic();
    state.cat = btn.dataset.cat;
    writeURL({ cat: state.cat }, true);
    renderCatNav();
    renderGrid();
  });

  $("#rgFilter").addEventListener("input", (e) => {
    state.filter = e.target.value;
    renderGrid();
  });

  $("#rgGrid").addEventListener("click", (e) => {
    const tile = e.target.closest("[data-block]");
    if (!tile || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    haptic();
    state.block = tile.dataset.block;
    state.tab = "overview";
    writeURL({ block: state.block });
    state.cat = byId.get(state.block).cat;
    showDetail();
  });

  $("#rgCombineBack").addEventListener("click", () => {
    writeURL({ cat: state.cat });
    state.combo = null;
    showList();
  });

  $("#rgPanels").addEventListener("click", (e) => {
    const a = e.target.closest("[data-combine-with]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    haptic();
    state.combo = [a.dataset.combineWith];
    writeURL({ view: "combine", blocks: state.combo.join(",") });
    showCombine();
  });

  $("#rgBack").addEventListener("click", () => {
    writeURL({ cat: state.cat });
    state.block = null;
    showList();
  });

  $("#rgCrumb").addEventListener("click", (e) => {
    const a = e.target.closest("[data-cat-link]");
    if (!a) return;
    e.preventDefault();
    state.cat = a.dataset.catLink;
    writeURL({ cat: state.cat });
    state.block = null;
    showList();
  });

  const step = (dir) => {
    const idx = DATA.blocks.findIndex((b) => b.id === state.block);
    const next = DATA.blocks[idx + dir];
    if (!next) return;
    haptic();
    state.block = next.id;
    state.cat = next.cat;
    writeURL({ block: next.id, tab: state.tab === "overview" ? null : state.tab });
    showDetail();
  };
  $("#rgPrev").addEventListener("click", () => step(-1));
  $("#rgNext").addEventListener("click", () => step(1));

  $("#rgTabs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn || btn.dataset.tab === state.tab) return;
    haptic();
    state.tab = btn.dataset.tab;
    writeURL({ block: state.block, tab: state.tab === "overview" ? null : state.tab }, true);
    renderTab();
    btn.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  });

  // Toggle buttons live inside dynamically re-rendered cards (Ultrasound
  // card, 3D card), so they're bound once here via delegation rather than
  // per-element — that keeps working across every renderTab()/showCombine().
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".rg-toggle");
    if (!btn) return;
    haptic();
    const key = btn.dataset.toggle;
    toggles[key] = !toggles[key];
    syncToggleButtons();
    applyToggles();
  });

  window.addEventListener("popstate", route);

  $("#rgSourceNote").textContent = `${DATA.meta.source} ${DATA.meta.checked}. ${DATA.meta.disclaimer}`;
}

bind();
route();
