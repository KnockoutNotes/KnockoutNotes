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
  const isDrugCat = (catId) => catId !== "anaesthesia";

  function itemById(id) { return drugById.get(id) || topicById.get(id) || null; }
  function itemsInCat(catId) { return catId === "anaesthesia" ? DATA.topics : DATA.drugs.filter((d) => d.cat === catId); }

  let state = { cat: "anaesthesia", item: null, tab: "overview", filter: "" };

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
    const drug = isDrugCat(item.cat);
    return `<a class="st-tile" href="?item=${item.id}" data-item="${item.id}" data-cat="${item.cat}" aria-label="${esc(item.name)}">
      <div class="st-tile-icon" aria-hidden="true">${cat.icon}</div>
      <div class="st-tile-info">
        <span class="st-tile-cat">${cat.icon} ${esc(cat.label)}</span>
        <strong class="st-tile-name">${esc(item.short || item.name)}</strong>
        <span class="st-tile-tag">${esc(item.tagline)}</span>
        ${drug && item.brand ? `<span class="st-tile-brand">Brand: ${esc(item.brand)}</span>` : ""}
        <span class="st-tile-open">Open →</span>
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
    return `<section class="st-card ${extraClass}"><h3>${esc(title)}</h3><div class="st-card-body">${bodyHTML}</div></section>`;
  }

  function para(text) { return `<p>${esc(text)}</p>`; }

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
    return t.sections.map((s) => card(s.h, para(s.b))).join("");
  }

  function showDetail() {
    $("#stList").hidden = true;
    $("#stDetail").hidden = false;
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
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function bindDetailEvents() {
    $("#stDetail").querySelectorAll("[data-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tab = btn.getAttribute("data-tab");
        writeURL({ item: state.item, tab: state.tab });
        const item = itemById(state.item);
        $("#stPanel").innerHTML = drugPanelHTML(item, state.tab);
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
      btn.innerHTML = active ? "✕ Exit Full Screen" : "⛶ Full Screen";
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
