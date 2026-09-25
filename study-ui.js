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
  const DRUG_TABS = ["overview", "structure", "pd", "pk", "dosage", "offlabel", "complications"];
  const DRUG_TAB_LABEL = {
    overview: "Overview", structure: "Chemical Structure", pd: "Pharmacodynamics",
    pk: "Pharmacokinetics", dosage: "FDA-Approved Dosage", offlabel: "Off-Label Uses",
    complications: "Complications"
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

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

  let state = { cat: "anaesthesia", item: null, tab: "overview", filter: "" };

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
    const tab = q.get("tab");
    const cat = q.get("cat");
    return {
      item: item && itemById(item) ? item : null,
      tab: DRUG_TABS.includes(tab) ? tab : "overview",
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
      state.tab = r.tab;
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
    return `<a class="st-tile st-reveal" href="?item=${item.id}" data-item="${item.id}" data-cat="${item.cat}" aria-label="${esc(item.name)}">
      <div class="st-tile-icon" aria-hidden="true">${cat.icon}</div>
      <div class="st-tile-info">
        <span class="st-tile-cat">${esc(cat.label)}</span>
        <strong class="st-tile-name">${esc(item.short || item.name)}</strong>
        <span class="st-tile-tag">${esc(item.tagline)}</span>
      </div>
    </a>`;
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
      html += `<div class="st-grid">${list.map(tileHTML).join("")}</div>`;
    });
    grid.innerHTML = total ? html : `<div class="st-empty">No results for “${esc(state.filter)}”.</div>`;
    observeReveal(grid);
  }

  function showList() {
    $("#stDetail").hidden = true;
    $("#stList").hidden = false;
    $("#stStage").classList.remove("st-narrow");
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

  function para(text) { return `<p>${esc(text)}</p>`; }

  // Long-form topic prose is authored with blank-line paragraph breaks and
  // optional callouts — this keeps study-data.js readable as plain prose
  // while still rendering as properly separated paragraphs/boxes.
  function paras(text) {
    if (!text) return "";
    return text.trim().split(/\n\s*\n/).map((p) => `<p>${esc(p.trim())}</p>`).join("");
  }
  function callout(kind, label, text) {
    if (!text) return "";
    return `<div class="st-callout st-callout-${kind}"><span class="st-callout-label">${esc(label)}</span>${paras(text)}</div>`;
  }

  function drugTabsHTML(d) {
    return `<div class="st-tabs" role="tablist" aria-label="Drug sections">
      ${DRUG_TABS.map((t) => `<button type="button" role="tab" class="${state.tab === t ? "active" : ""}" data-tab="${t}" aria-selected="${state.tab === t}">${DRUG_TAB_LABEL[t]}</button>`).join("")}
    </div>`;
  }

  function drugPanelHTML(d, tab) {
    switch (tab) {
      case "overview":
        return card("Overview", `<p class="st-tagline-lg">${esc(d.tagline)}</p>
          ${d.brand ? `<p><strong>Brand name(s):</strong> ${esc(d.brand)}</p>` : ""}
          <p><strong>Class:</strong> ${esc(catById.get(d.cat).label)}</p>
          ${d.tags && d.tags.length ? `<div class="st-tagrow">${d.tags.map((t) => `<span class="st-chip">${esc(t)}</span>`).join("")}</div>` : ""}`);
      case "structure": return card("Chemical Structure", para(d.structure));
      case "pd": return card("Pharmacodynamics", para(d.pd));
      case "pk": return card("Pharmacokinetics", para(d.pk));
      case "dosage": return card("Dosage (FDA-Approved)", para(d.dosage));
      case "offlabel": return card("Off-Label Uses", para(d.offLabel));
      case "complications": return card("Complications", para(d.complications));
      default: return "";
    }
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
    $("#stStage").classList.add("st-narrow");
    const item = itemById(state.item);
    const drug = isDrugCat(item.cat);
    document.title = `${item.name} | Study Mode | KnockoutNotes`;

    const backHref = `?cat=${item.cat}`;
    const tagsRow = item.tags && item.tags.length
      ? `<div class="st-tagrow">${item.tags.map((tg) => `<span class="st-chip">${esc(tg)}</span>`).join("")}</div>` : "";

    let bodyHTML;
    if (drug) {
      bodyHTML = `${drugTabsHTML(item)}<div class="st-panel" id="stPanel">${drugPanelHTML(item, state.tab)}</div>`;
    } else {
      bodyHTML = `<div class="st-panel st-panel-scroll" id="stPanel">${topicPanelHTML(item)}</div>`;
    }

    $("#stDetail").innerHTML = `
      <a class="st-back" href="${backHref}" data-back>← Back to ${esc(catById.get(item.cat).label)}</a>
      <header class="st-detail-head">
        <span class="st-detail-icon" aria-hidden="true">${catById.get(item.cat).icon}</span>
        <div>
          <h1>${esc(item.name)}</h1>
          <p class="st-detail-tag">${esc(item.tagline)}</p>
          ${tagsRow}
        </div>
      </header>
      ${sourceBanner(item.source)}
      ${bodyHTML}
    `;
    bindDetailEvents();
    observeReveal($("#stDetail"));
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function bindDetailEvents() {
    $("#stDetail").querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tab = btn.getAttribute("data-tab");
        writeURL({ item: state.item, tab: state.tab });
        const item = itemById(state.item);
        $("#stPanel").innerHTML = drugPanelHTML(item, state.tab);
        observeReveal($("#stPanel"));
        $("#stDetail").querySelectorAll("[data-tab]").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", String(active));
        });
        window.scrollTo({ top: $("#stDetail").offsetTop - 12, behavior: "smooth" });
      });
    });
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
      state.tab = "overview";
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

  function init() {
    bindListEvents();
    initFullscreen();
    route();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
