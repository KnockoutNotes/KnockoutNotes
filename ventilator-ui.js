/* ==========================================================================
   KNOCKOUTNOTES — Anaesthesia Workstation UI wiring (ventilator-ui.js)
   Sidebar, tabs, info panel, systems guide, viva quiz, view controls.
   ========================================================================== */

import { createWorkstationScene } from "./ventilator-scene.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));

export function initVentilatorPage() {
  const data = window.VentilatorData;
  const stageHost = document.getElementById("ventStage");
  const loadingEl = document.getElementById("ventLoading");
  const placeholderBanner = document.getElementById("ventPlaceholderBanner");
  const infoPanel = document.getElementById("ventInfoPanel");
  const sidebarList = document.getElementById("ventSidebarList");
  const tabs = document.querySelectorAll(".vent-tab");
  const panels = {
    explore: document.getElementById("ventPanelExplore"),
    inspect: document.getElementById("ventPanelInspect"),
    guide: document.getElementById("ventPanelGuide"),
    quiz: document.getElementById("ventPanelQuiz")
  };

  const calibrate = new URLSearchParams(location.search).has("calibrate");

  const scene = createWorkstationScene(stageHost, {
    modelUrl: "assets/models/ventilator.glb",
    components: data.components,
    onSelect: (id, comp) => renderInfoPanel(comp),
    onHover: (id, comp) => {
      const label = document.getElementById("ventHoverLabel");
      if (!label) return;
      if (comp) { label.hidden = false; label.textContent = comp.name; }
      else label.hidden = true;
    },
    onLoaded: ({ isPlaceholder }) => {
      loadingEl.hidden = true;
      if (placeholderBanner) placeholderBanner.hidden = !isPlaceholder;
    }
  });

  document.addEventListener("mousemove", e => {
    const label = document.getElementById("ventHoverLabel");
    if (label && !label.hidden) { label.style.left = e.clientX + 16 + "px"; label.style.top = e.clientY + 12 + "px"; }
  });

  // ---- Sidebar: system taxonomy ----
  function buildSidebar() {
    const bySystem = {};
    data.components.forEach(c => { (bySystem[c.system] = bySystem[c.system] || []).push(c); });
    sidebarList.innerHTML = Object.keys(data.systems).filter(k => bySystem[k]).map(k => `
      <div class="vent-sidebar-group">
        <div class="vent-sidebar-heading-row"><span>${esc(data.systems[k])}</span><span class="vent-sidebar-count">${bySystem[k].length}</span></div>
        ${bySystem[k].map(c => `<button class="vent-sidebar-item" data-component-id="${esc(c.id)}"><span class="vent-sidebar-dot" data-view="${esc(c.view)}"></span><span>${esc(c.name)}</span></button>`).join("")}
      </div>
    `).join("");
    sidebarList.querySelectorAll("[data-component-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        sidebarList.querySelectorAll(".vent-sidebar-item").forEach(b => b.classList.toggle("active", b === btn));
        scene.selectComponent(btn.dataset.componentId);
      });
    });
  }
  buildSidebar();

  function markSidebarActive(id) {
    sidebarList.querySelectorAll(".vent-sidebar-item").forEach(b => b.classList.toggle("active", b.dataset.componentId === id));
  }

  // ---- Info panel ----
  function renderInfoPanel(comp) {
    markSidebarActive(comp.id);
    infoPanel.classList.add("open");
    infoPanel.innerHTML = `
      <button class="vent-info-close" id="ventInfoClose" aria-label="Close">&times;</button>
      <span class="vent-info-kicker">${esc((data.systems[comp.system] || comp.system).toUpperCase())} · ${comp.view === "front" ? "FRONT" : "REAR"}</span>
      <h3>${esc(comp.name)}</h3>
      <p class="vent-info-summary">${esc(comp.summary)}</p>
      <h4>Function</h4>
      <p>${esc(comp.function)}</p>
      ${comp.safety ? `<h4>Safety Note</h4><p class="vent-info-safety">${esc(comp.safety)}</p>` : ""}
      ${comp.viva ? `<h4>Viva Point</h4><p class="vent-info-viva"><strong>Q:</strong> ${esc(comp.viva.prompt)}</p><details><summary>Reveal answer</summary><p>${esc(comp.viva.answer)}</p></details>` : ""}
    `;
    document.getElementById("ventInfoClose").addEventListener("click", () => {
      infoPanel.classList.remove("open");
      scene.clearSelection();
      markSidebarActive(null);
    });
  }

  // ---- Tabs ----
  function activateTab(name) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    Object.entries(panels).forEach(([k, el]) => { if (el) el.hidden = k !== name; });
    if (name !== "inspect") { document.getElementById("ventTranslucentRange").value = 0; scene.setTranslucent(0); }
  }
  tabs.forEach(t => t.addEventListener("click", () => activateTab(t.dataset.tab)));
  activateTab("explore");

  // ---- View controls (shared action bar) ----
  document.getElementById("ventResetViewBtn").addEventListener("click", () => { scene.resetView(); infoPanel.classList.remove("open"); markSidebarActive(null); });
  document.getElementById("ventFrontViewBtn").addEventListener("click", () => scene.frontView());
  document.getElementById("ventRearViewBtn").addEventListener("click", () => scene.rearView());
  document.getElementById("ventSideViewBtn").addEventListener("click", () => scene.sideView());
  document.getElementById("ventFullscreenBtn").addEventListener("click", () => scene.toggleFullscreen());

  // ---- Inspect panel: translucency + auto-rotate ----
  const translucentRange = document.getElementById("ventTranslucentRange");
  translucentRange.addEventListener("input", () => scene.setTranslucent(Number(translucentRange.value)));
  document.getElementById("ventAutoRotateToggle").addEventListener("change", e => scene.setAutoRotate(e.target.checked));

  // ---- Calibration mode (hidden, ?calibrate=1) ----
  const calBanner = document.getElementById("ventCalibrateBanner");
  if (calibrate) {
    scene.setCalibrateMode(true);
    if (calBanner) {
      calBanner.hidden = false;
      window.addEventListener("vent:calibrate-point", e => {
        const p = e.detail;
        calBanner.textContent = `Calibrate: last click at { x: ${p.x.toFixed(3)}, y: ${p.y.toFixed(3)}, z: ${p.z.toFixed(3)} } — also logged to console.`;
      });
    }
  }

  // ---- Systems Guide ----
  const guideBody = document.getElementById("ventGuideBody");
  guideBody.innerHTML = data.systemsGuide.map(stage => `
    <button class="vent-guide-stage" data-stage-id="${esc(stage.id)}">
      <span class="vent-guide-label">${esc(stage.label)}</span>
      <span class="vent-guide-range">${esc(stage.range)}</span>
    </button>
  `).join("");
  const guideExplain = document.getElementById("ventGuideExplain");
  guideBody.querySelectorAll("[data-stage-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      guideBody.querySelectorAll(".vent-guide-stage").forEach(b => b.classList.toggle("active", b === btn));
      const stage = data.systemsGuide.find(s => s.id === btn.dataset.stageId);
      const comps = stage.componentIds.map(id => data.components.find(c => c.id === id)).filter(Boolean);
      guideExplain.hidden = false;
      guideExplain.innerHTML = `
        <h4>${esc(stage.label)}</h4>
        <p>${esc(stage.explain)}</p>
        <div class="vent-chip-row">${comps.map(c => `<button class="vent-chip" data-jump-id="${esc(c.id)}">${esc(c.name)}</button>`).join("")}</div>
      `;
      guideExplain.querySelectorAll("[data-jump-id]").forEach(chip => {
        chip.addEventListener("click", () => {
          activateTab("explore");
          scene.selectComponent(chip.dataset.jumpId);
        });
      });
      if (comps[0]) scene.selectComponent(comps[0].id);
    });
  });

  // ---- Viva Quiz ----
  const quizPool = data.components.filter(c => c.viva);
  let quizIndex = 0;
  let quizOrder = quizPool.map((_, i) => i);
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
    return arr;
  }
  const quizBody = document.getElementById("ventQuizBody");
  function renderQuiz() {
    if (!quizPool.length) { quizBody.innerHTML = "<p>No quiz questions available.</p>"; return; }
    const comp = quizPool[quizOrder[quizIndex]];
    quizBody.innerHTML = `
      <span class="vent-quiz-counter">QUESTION ${quizIndex + 1} / ${quizPool.length}</span>
      <p class="vent-quiz-prompt">${esc(comp.viva.prompt)}</p>
      <button class="btn-hud" id="ventQuizReveal">Reveal Answer</button>
      <div id="ventQuizAnswer" class="vent-quiz-answer" hidden></div>
      <div class="vent-quiz-nav">
        <button class="btn-hud" id="ventQuizPrev">← Prev</button>
        <button class="btn-hud" id="ventQuizNext">Next →</button>
        <button class="btn-hud" id="ventQuizShuffle">🔀 Shuffle</button>
      </div>
    `;
    document.getElementById("ventQuizReveal").addEventListener("click", () => {
      const a = document.getElementById("ventQuizAnswer");
      a.hidden = false;
      a.innerHTML = `<strong>${esc(comp.name)}</strong><p>${esc(comp.viva.answer)}</p>`;
      activateTab("quiz");
      scene.selectComponent(comp.id);
    });
    document.getElementById("ventQuizNext").addEventListener("click", () => { quizIndex = (quizIndex + 1) % quizPool.length; renderQuiz(); });
    document.getElementById("ventQuizPrev").addEventListener("click", () => { quizIndex = (quizIndex - 1 + quizPool.length) % quizPool.length; renderQuiz(); });
    document.getElementById("ventQuizShuffle").addEventListener("click", () => { quizOrder = shuffle(quizOrder.slice()); quizIndex = 0; renderQuiz(); });
  }
  document.querySelector('[data-tab="quiz"]').addEventListener("click", () => { if (quizIndex === 0) renderQuiz(); });
  renderQuiz();

  // ---- Keyboard ----
  window.addEventListener("keydown", e => {
    if (e.key === "Escape") { infoPanel.classList.remove("open"); scene.clearSelection(); markSidebarActive(null); }
  });

  return scene;
}
