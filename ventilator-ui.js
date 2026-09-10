/* ==========================================================================
   KNOCKOUTNOTES — Ventilator UI Orchestration (ventilator-ui.js)
   Sidebar taxonomy, top mode tabs, Interactive Mode toggle block, top action
   bar, Gas/Flow/Safety/Troubleshoot/Viva/Show-Me panel wiring, ASA-style
   monitor (modern workstation only), drawer contents panel.
   ========================================================================== */

import { createSequencer, setVentilatorAnimating } from "./ventilator-animation.js";

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));

export function createUI(engine, interactions, machine) {
  const root = document.getElementById("ventApp");
  const sidebarList = document.getElementById("ventSidebarList");
  const tabs = document.querySelectorAll(".vent-tab");
  const panels = { explore: document.getElementById("ventPanelExplore"), xray: document.getElementById("ventPanelXray"), flow: document.getElementById("ventPanelFlow"), clinical: document.getElementById("ventPanelClinical"), quiz: document.getElementById("ventPanelQuiz") };
  const drawerPanel = document.getElementById("ventDrawerPanel");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  root.classList.toggle("has-ventilator", !!machine.hasVentilator);
  root.classList.toggle("has-monitor", !!machine.hasMonitor);
  root.classList.toggle("has-drawers", !!machine.hasDrawers);

  // ---- Sidebar: system taxonomy ----
  const SUBSYSTEM_LABELS = {
    frame: "Overview", gasSupply: "Gas Supply", pressure: "Pressure Systems", flow: "Flowmeters / Flow Control",
    vaporizer: "Vaporizers", breathing: "Breathing Circuit", absorber: "CO2 Absorber", ventilator: "Ventilator",
    monitor: "Monitor", scavenging: "Scavenging", drawer: "Drawers & Contents", power: "Power / Battery"
  };
  function buildSidebar() {
    const bySystem = {};
    machine.components.forEach(c => {
      const key = c.system || "frame";
      (bySystem[key] = bySystem[key] || []).push(c);
    });
    const order = ["frame", "gasSupply", "pressure", "flow", "vaporizer", "breathing", "absorber", "ventilator", "monitor", "scavenging", "power", "drawer"];
    sidebarList.innerHTML = order.filter(k => bySystem[k]).map(k => `
      <button class="vent-sidebar-item" data-system="${esc(k)}">
        <span>${esc(SUBSYSTEM_LABELS[k] || k)}</span>
        <span class="vent-sidebar-count">${bySystem[k].length}</span>
      </button>
    `).join("");
    sidebarList.querySelectorAll("[data-system]").forEach(btn => {
      btn.addEventListener("click", () => {
        sidebarList.querySelectorAll(".vent-sidebar-item").forEach(b => b.classList.toggle("active", b === btn));
        selectSubsystem(btn.dataset.system, bySystem[btn.dataset.system]);
      });
    });
  }
  function selectSubsystem(key, comps) {
    interactions.clearMode();
    const ids = comps.map(c => c.id);
    engine.dimAllExcept(ids);
    engine.highlightComponents(ids, { color: 0x38bdf8, intensity: 0.35 });
    if (ids[0]) engine.focusOnComponent(ids[0], { distanceFactor: 8 });
    if (comps.length === 1) interactions.renderInfoPanel(comps[0]);
  }
  buildSidebar();

  // ---- Top tabs ----
  function activateTab(name) {
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
    Object.entries(panels).forEach(([k, el]) => { if (el) el.hidden = k !== name; });
    if (name !== "xray") { engine.setXray(false); document.getElementById("ventXrayToggle").checked = false; }
    if (name !== "flow") interactions.flowControl && interactions.flowControl("pause");
  }
  tabs.forEach(t => t.addEventListener("click", () => activateTab(t.dataset.tab)));
  activateTab("explore");

  // ---- Top action bar ----
  document.getElementById("ventResetViewBtn").addEventListener("click", () => { engine.resetView(); interactions.clearMode(); });
  document.getElementById("ventRearViewBtn").addEventListener("click", () => engine.rearView());
  document.getElementById("ventSideViewBtn").addEventListener("click", () => engine.sideView());
  document.getElementById("ventFullscreenBtn").addEventListener("click", () => engine.toggleFullscreen());

  // ---- Interactive Mode toggle block (Explore panel) ----
  document.getElementById("ventExplodeToggle").addEventListener("change", e => engine.setExploded(e.target.checked));
  document.getElementById("ventXrayToggle").addEventListener("change", e => engine.setXray(e.target.checked));

  // ---- Start Machine ----
  const startBtn = document.getElementById("ventStartMachineBtn");
  const startCaption = document.getElementById("ventStartCaption");
  let startSeq = null;
  startBtn.addEventListener("click", () => {
    if (startSeq && startSeq.isPlaying()) { startSeq.pause(); startBtn.textContent = "▶ Resume"; return; }
    if (startSeq && !startSeq.isPlaying()) { startSeq.resume(); startBtn.textContent = "⏸ Pause"; return; }
    startSeq = createSequencer(engine, machine.startSequence, {
      stepMs: 2600,
      onStep: (step, i, total) => { startCaption.hidden = false; startCaption.innerHTML = `<strong>${i + 1}/${total} — ${esc(step.stage)}</strong><br>${esc(step.caption)}`; },
      onEnd: () => { startBtn.textContent = "▶ Start Machine"; setVentilatorAnimating(engine, false); }
    });
    startSeq.start();
    startBtn.textContent = "⏸ Pause";
    if (machine.hasVentilator) setVentilatorAnimating(engine, true, 0.25);
  });
  document.getElementById("ventStartRestartBtn").addEventListener("click", () => { if (startSeq) startSeq.restart(); });
  document.getElementById("ventStartStepBtn").addEventListener("click", () => { if (startSeq) startSeq.next(); else { startSeq = createSequencer(engine, machine.startSequence, { onStep: (step, i, total) => { startCaption.hidden = false; startCaption.innerHTML = `<strong>${i + 1}/${total} — ${esc(step.stage)}</strong><br>${esc(step.caption)}`; } }); startSeq.start(); startSeq.pause(); } });

  // ---- Guided Tour ----
  const tourPanel = document.getElementById("ventTourPanel");
  let tourSeq = null;
  document.getElementById("ventTourStartBtn").addEventListener("click", () => {
    tourPanel.hidden = false;
    tourSeq = createSequencer(engine, machine.tourSteps, {
      stepMs: 4200,
      onStep: (step, i, total) => {
        document.getElementById("ventTourStep").textContent = `STEP ${i + 1} / ${total}`;
        const comp = machine.components.find(c => c.id === step.componentId);
        document.getElementById("ventTourName").textContent = comp ? comp.name : "";
        document.getElementById("ventTourCaption").textContent = step.caption;
      },
      onEnd: () => { document.getElementById("ventTourPauseBtn").textContent = "▶ Play"; }
    });
    tourSeq.start();
  });
  document.getElementById("ventTourNextBtn").addEventListener("click", () => tourSeq && tourSeq.next());
  document.getElementById("ventTourPrevBtn").addEventListener("click", () => tourSeq && tourSeq.prev());
  document.getElementById("ventTourPauseBtn").addEventListener("click", e => {
    if (!tourSeq) return;
    if (tourSeq.isPlaying()) { tourSeq.pause(); e.target.textContent = "▶ Play"; }
    else { tourSeq.resume(); e.target.textContent = "⏸ Pause"; }
  });
  document.getElementById("ventTourExitBtn").addEventListener("click", () => {
    if (tourSeq) tourSeq.stop();
    tourPanel.hidden = true;
    interactions.clearMode();
  });

  // ---- Cylinder & Pipeline Supply guided mode (rear-of-machine focus) ----
  const cylBtn = document.getElementById("ventCylinderPipelineBtn");
  if (cylBtn) {
    cylBtn.addEventListener("click", () => {
      engine.rearView();
      const steps = machine.gasPathway.high.map(id => ({ componentId: id, caption: "Cylinder supply (HIGH-PRESSURE system) — rear of machine." }))
        .concat(machine.gasPathway.intermediate.filter(id => id.includes("pipeline")).map(id => ({ componentId: id, caption: "Central pipeline supply (INTERMEDIATE-PRESSURE system)." })));
      tourPanel.hidden = false;
      tourSeq = createSequencer(engine, steps, {
        stepMs: 3400,
        onStep: (step, i, total) => {
          document.getElementById("ventTourStep").textContent = `CYLINDER & PIPELINE ${i + 1} / ${total}`;
          const comp = machine.components.find(c => c.id === step.componentId);
          document.getElementById("ventTourName").textContent = comp ? comp.name : "";
          document.getElementById("ventTourCaption").textContent = step.caption;
        }
      });
      tourSeq.start();
    });
  }

  // ---- Gas System Explorer + Flow (Flow Path panel) ----
  const gasExplain = document.getElementById("ventGasExplain");
  document.querySelectorAll("[data-gas-level]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-gas-level]").forEach(b => b.classList.toggle("active", b === btn));
      const result = interactions.showGasSystem(btn.dataset.gasLevel);
      gasExplain.hidden = false;
      gasExplain.innerHTML = `<strong>${esc(result.label)}</strong><p>${esc(result.explain)}</p><p class="vent-chip-row">${result.components.map(c => `<span class="vent-chip static">${esc(c.name)}</span>`).join("")}</p>`;
    });
  });
  const flowExplain = document.getElementById("ventFlowExplain");
  document.querySelectorAll("[data-flow-gas]").forEach(btn => {
    btn.hidden = !(machine.flowPaths || {})[btn.dataset.flowGas];
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-flow-gas]").forEach(b => b.classList.toggle("active", b === btn));
      const result = interactions.showFlow(btn.dataset.flowGas);
      flowExplain.hidden = !result;
      if (result) flowExplain.innerHTML = `<p class="vent-chip-row">${result.components.map(c => `<span class="vent-chip static">${esc(c.name)}</span>`).join(" → ")}</p>`;
    });
  });
  document.getElementById("ventFlowPlay").addEventListener("click", () => interactions.flowControl("play"));
  document.getElementById("ventFlowPause").addEventListener("click", () => interactions.flowControl("pause"));
  document.getElementById("ventFlowSlow").addEventListener("click", () => interactions.flowControl("slow", 0.3));
  document.getElementById("ventFlowReset").addEventListener("click", () => interactions.flowControl("reset"));

  // ---- Show Me ----
  const showMeSelect = document.getElementById("ventShowMeSelect");
  showMeSelect.innerHTML = `<option value="">Show me…</option>` + window.VentilatorData.showMeIndex.map((e, i) => `<option value="${i}">${esc(e.label)}</option>`).join("");
  showMeSelect.addEventListener("change", () => {
    if (showMeSelect.value === "") return;
    interactions.showMe(window.VentilatorData.showMeIndex[Number(showMeSelect.value)]);
  });

  // ---- Clinical Modes: Safety, Failure Simulation, Troubleshooting, Ventilator, Alarms ----
  const safetyList = document.getElementById("ventSafetyList");
  safetyList.innerHTML = machine.safetyFeatures.map(f => `
    <button class="vent-list-item" data-safety-id="${esc(f.id)}">
      <span>${esc(f.name)}</span>
      <span class="vent-scope-badge ${f.scope === "universal" ? "universal" : "specific"}">${f.scope === "universal" ? "UNIVERSAL" : "MACHINE-SPECIFIC"}</span>
    </button>`).join("");
  const safetyDetail = document.getElementById("ventSafetyDetail");
  safetyList.querySelectorAll("[data-safety-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      safetyList.querySelectorAll(".vent-list-item").forEach(b => b.classList.toggle("active", b === btn));
      const feature = interactions.showSafety(btn.dataset.safetyId);
      safetyDetail.hidden = false;
      safetyDetail.innerHTML = `
        <h4>${esc(feature.name)}</h4>
        <p>${esc(feature.principle)}</p>
        ${feature.demo ? `<p class="vent-demo"><strong>Demonstration:</strong> ${esc(feature.demo)}</p>` : ""}
        ${feature.failure ? `<button class="btn-hud" id="ventSimulateFailureBtn" data-failure="${esc(feature.failure)}">⚠ Simulate Failure</button>` : ""}
      `;
      const simBtn = document.getElementById("ventSimulateFailureBtn");
      if (simBtn) simBtn.addEventListener("click", () => runFailureSimulation(simBtn.dataset.failure));
    });
  });

  const failureSteps = document.getElementById("ventFailureSteps");
  function runFailureSimulation(key) {
    const scenario = interactions.simulateFailure(key);
    if (!scenario) return;
    failureSteps.hidden = false;
    failureSteps.innerHTML = `<h4>${esc(scenario.title)}</h4>` + scenario.steps.map(s => `
      <div class="vent-failure-step"><span class="vent-failure-state">${esc(s.state)}</span><span>${esc(s.text)}</span></div>
    `).join("");
    failureSteps.scrollIntoView({ block: "nearest" });
  }

  const tbList = document.getElementById("ventTroubleshootList");
  tbList.innerHTML = machine.troubleshooting.map(t => `<button class="vent-list-item" data-tb-id="${esc(t.id)}"><span>${esc(t.title)}</span></button>`).join("");
  const tbPrompt = document.getElementById("ventTroubleshootPrompt");
  tbList.querySelectorAll("[data-tb-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const { scenario, candidates } = interactions.startTroubleshooting(btn.dataset.tbId);
      tbPrompt.hidden = false;
      tbPrompt.innerHTML = `
        <p class="vent-tb-question">${esc(scenario.prompt)}</p>
        <div class="vent-chip-row">${candidates.map(c => `<button class="vent-chip candidate" data-candidate="${esc(c.id)}">${esc(c.name)}</button>`).join("")}</div>
        <div id="ventTbFeedback" class="vent-tb-feedback" hidden></div>
      `;
      tbPrompt.querySelectorAll("[data-candidate]").forEach(cbtn => {
        cbtn.addEventListener("click", () => {
          const result = interactions.answerTroubleshooting(scenario.id, cbtn.dataset.candidate);
          const fb = document.getElementById("ventTbFeedback");
          fb.hidden = false;
          fb.className = "vent-tb-feedback " + (result.correct ? "correct" : "incorrect");
          fb.textContent = (result.correct ? "✓ Correct — " : "✗ Not quite — ") + result.explanation;
        });
      });
    });
  });

  const vivaPanel = document.getElementById("ventQuizBody");
  let vivaIndex = 0;
  function renderViva() {
    const q = machine.vivaQuestions[vivaIndex];
    if (!q) { vivaPanel.innerHTML = "<p>No more questions — restart to go again.</p>"; return; }
    interactions.startViva(vivaIndex);
    vivaPanel.innerHTML = `
      <span class="vent-quiz-counter">QUESTION ${vivaIndex + 1} / ${machine.vivaQuestions.length}</span>
      <p class="vent-quiz-prompt">${esc(q.prompt)}</p>
      <button class="btn-hud" id="ventQuizReveal">Reveal Answer</button>
      <div id="ventQuizAnswer" class="vent-quiz-answer" hidden></div>
      <div class="vent-quiz-nav">
        <button class="btn-hud" id="ventQuizPrev">← Prev</button>
        <button class="btn-hud" id="ventQuizNext">Next →</button>
      </div>
    `;
    document.getElementById("ventQuizReveal").addEventListener("click", () => {
      const a = document.getElementById("ventQuizAnswer");
      a.hidden = false;
      a.innerHTML = `<strong>${esc(q.correctAnswer || q.correctPath || "")}</strong><p>${esc(q.explanation || "")}</p>`;
    });
    document.getElementById("ventQuizNext").addEventListener("click", () => { vivaIndex = Math.min(machine.vivaQuestions.length - 1, vivaIndex + 1); renderViva(); });
    document.getElementById("ventQuizPrev").addEventListener("click", () => { vivaIndex = Math.max(0, vivaIndex - 1); renderViva(); });
  }
  document.querySelector('[data-tab="quiz"]').addEventListener("click", () => { vivaIndex = 0; renderViva(); }, { once: false });

  // ---- Drawer contents panel ----
  document.addEventListener("vent:drawer-toggled", e => {
    if (!e.detail.open) { drawerPanel.hidden = true; return; }
    const drawerData = (machine.drawers || []).find(d => d.id === e.detail.id);
    if (!drawerData) return;
    drawerPanel.hidden = false;
    drawerPanel.innerHTML = `
      <button class="vent-info-close" id="ventDrawerClose" aria-label="Close">&times;</button>
      <h4>${esc(drawerData.name)}</h4>
      <p class="vent-drawer-note">${esc(drawerData.note)}</p>
      <div class="vent-drawer-items">
        ${drawerData.items.map(it => `
          <button class="vent-drawer-item" data-item-name="${esc(it.name)}">
            <strong>${esc(it.name)}</strong>
            <span>${esc(it.category)}</span>
          </button>
        `).join("")}
      </div>
      <div id="ventDrawerItemDetail" class="vent-drawer-item-detail" hidden></div>
    `;
    document.getElementById("ventDrawerClose").addEventListener("click", () => {
      engine.openDrawer(e.detail.id, false);
      drawerPanel.hidden = true;
    });
    drawerPanel.querySelectorAll("[data-item-name]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = drawerData.items.find(i => i.name === btn.dataset.itemName);
        const detail = document.getElementById("ventDrawerItemDetail");
        detail.hidden = false;
        detail.innerHTML = `<strong>${esc(item.name)}</strong><p>${esc(item.function)}</p>${item.vivaPoints.length ? `<p class="vent-viva-point">Viva: ${esc(item.vivaPoints[0])}</p>` : ""}`;
      });
    });
  });

  // ---- Monitor (modern workstation only) ----
  if (machine.hasMonitor) initMonitor(engine, machine);

  return { activateTab };
}

// ---------------------------------------------------------------------------
// ASA-standard educational monitor — canvas waveforms + parameter grid.
// ---------------------------------------------------------------------------
function initMonitor(engine, machine) {
  const canvas = document.getElementById("ventMonitorCanvas");
  const ctx = canvas.getContext("2d");
  const paramGrid = document.getElementById("ventMonitorParams");
  const detail = document.getElementById("ventMonitorDetail");
  const alarmBanner = document.getElementById("ventAlarmBanner");

  const state = { hr: 72, spo2: 99, sbp: 118, dbp: 72, etco2: 35, rr: 14, temp: 36.6, fio2: 40, vt: 450, peep: 5, paw: 18, mac: 1.0, mode: "VCV" };
  let alarm = null;
  let t = 0;

  function ecgY(cycle) {
    if (cycle < 0.12) return 0;
    if (cycle < 0.2) return Math.sin(((cycle - 0.12) / 0.08) * Math.PI) * 0.15;
    if (cycle < 0.3) return 0;
    if (cycle < 0.33) return -Math.sin(((cycle - 0.3) / 0.03) * Math.PI) * 0.12;
    if (cycle < 0.39) return Math.sin(((cycle - 0.33) / 0.06) * Math.PI) * 1.0;
    if (cycle < 0.44) return -Math.sin(((cycle - 0.39) / 0.05) * Math.PI) * 0.22;
    if (cycle < 0.54) return 0;
    if (cycle < 0.7) return Math.sin(((cycle - 0.54) / 0.16) * Math.PI) * 0.28;
    return 0;
  }
  function plethY(cycle) {
    if (cycle < 0.18) return Math.sin((cycle / 0.18) * Math.PI * 0.5);
    if (cycle < 0.32) return 1 - ((cycle - 0.18) / 0.14) * 0.45;
    if (cycle < 0.85) return 0.55 * (1 - Math.pow((cycle - 0.32) / 0.53, 2));
    return 0;
  }
  function capnoY(cycle, hi) {
    if (cycle < 0.35) return 0;
    if (cycle < 0.45) return Math.sin(((cycle - 0.35) / 0.1) * Math.PI * 0.5) * hi;
    if (cycle < 0.75) return hi + ((cycle - 0.45) / 0.3) * 0.15 * hi;
    if (cycle < 0.82) return hi * 1.15 * (1 - (cycle - 0.75) / 0.07);
    return 0;
  }

  function drawTrace(y0, h, color, fn, speed, extra) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    const w = canvas.width;
    for (let x = 0; x <= w; x += 2) {
      const cycle = ((x / 90) - t * speed) % 1;
      const c = ((cycle % 1) + 1) % 1;
      const val = fn(c, extra);
      const y = y0 - val * h;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function render() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, w, h);
    const rrHz = state.rr / 60;
    drawTrace(h * 0.2, 22, alarm === "spo2" ? "#f87171" : "#4ade80", ecgY, 1.15, null);
    drawTrace(h * 0.42, 16, "#38bdf8", plethY, 1.15, null);
    drawTrace(h * 0.66, 18, alarm === "etco2" ? "#f87171" : "#facc15", capnoY, rrHz * 1.6, state.etco2 / 45);
    t += 0.016;
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  const params = machine.monitorConfig.params;
  const values = { ecg: () => `${state.hr} bpm`, hr: () => state.hr, spo2: () => state.spo2 + "%", nibp: () => `${state.sbp}/${state.dbp}`, etco2: () => state.etco2 + " mmHg", rr: () => state.rr + " /min", temp: () => state.temp.toFixed(1) + "°C", fio2: () => state.fio2 + "%", agent: () => "MAC " + state.mac.toFixed(1), paw: () => state.paw + " cmH2O", peep: () => state.peep + " cmH2O", vt: () => state.vt + " mL", mv: () => (state.vt * state.rr / 1000).toFixed(1) + " L/min" };
  paramGrid.innerHTML = params.map(p => `
    <button class="vent-monitor-param" data-param="${esc(p.id)}">
      <span class="vent-monitor-param-name">${esc(p.name)}</span>
      <span class="vent-monitor-param-value" id="ventParamValue_${esc(p.id)}">${values[p.id] ? values[p.id]() : "—"}</span>
    </button>`).join("");
  setInterval(() => {
    params.forEach(p => { const el = document.getElementById("ventParamValue_" + p.id); if (el && values[p.id]) el.textContent = values[p.id](); });
  }, 1000);
  paramGrid.querySelectorAll("[data-param]").forEach(btn => {
    btn.addEventListener("click", () => {
      const p = params.find(x => x.id === btn.dataset.param);
      detail.hidden = false;
      detail.innerHTML = `<h4>${esc(p.name)}</h4><p><strong>Why it matters:</strong> ${esc(p.why)}</p>${p.vivaPoint ? `<p><strong>Viva point:</strong> ${esc(p.vivaPoint)}</p>` : ""}`;
    });
  });

  // ---- Ventilator mode + parameters (drives the monitor waveforms above) ----
  const modeSelect = document.getElementById("ventVentModeSelect");
  modeSelect.innerHTML = machine.ventilatorModes.map(m => `<option value="${esc(m.id)}">${esc(m.name)}</option>`).join("");
  document.getElementById("ventVentModeSummary").textContent = machine.ventilatorModes[0].summary;
  modeSelect.addEventListener("change", () => {
    const m = machine.ventilatorModes.find(x => x.id === modeSelect.value);
    document.getElementById("ventVentModeSummary").textContent = m.summary;
    state.mode = m.id;
  });
  [["ventParamVT", "vt"], ["ventParamRR", "rr"], ["ventParamPEEP", "peep"], ["ventParamFiO2", "fio2"]].forEach(([elId, key]) => {
    const el = document.getElementById(elId);
    el.addEventListener("input", () => {
      state[key] = Number(el.value);
      document.getElementById(elId + "Value").textContent = el.value;
      state.paw = Math.round(12 + state.vt / 40 + state.peep);
      state.etco2 = Math.round(30 + (state.rr - 12) * 0.4);
    });
  });

  // ---- Alarm mode ----
  const alarmList = document.getElementById("ventAlarmList");
  const alarms = machine.monitorConfig.alarms;
  alarmList.innerHTML = alarms.map(a => `<button class="vent-list-item" data-alarm-id="${esc(a.id)}"><span>${esc(a.name)}</span></button>`).join("");
  const alarmDetail = document.getElementById("ventAlarmDetail");
  alarmList.querySelectorAll("[data-alarm-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const a = alarms.find(x => x.id === btn.dataset.alarmId);
      alarm = a.parameter;
      alarmBanner.hidden = false;
      alarmBanner.textContent = "🚨 " + a.name.toUpperCase();
      alarmDetail.hidden = false;
      alarmDetail.innerHTML = `
        <h4>${esc(a.name)}</h4>
        <p><strong>Likely causes:</strong></p>
        <ul>${a.causes.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
        <button class="btn-hud" id="ventAlarmInvestigate">Investigate on machine</button>
      `;
      document.getElementById("ventAlarmInvestigate").addEventListener("click", () => {
        engine.dimAllExcept(a.componentIds);
        engine.highlightComponents(a.componentIds, { color: 0xf87171, intensity: 0.7 });
        if (a.componentIds[0]) engine.focusOnComponent(a.componentIds[0], { distanceFactor: 6.5 });
      });
      setTimeout(() => { alarmBanner.hidden = true; alarm = null; }, 6000);
    });
  });
}
