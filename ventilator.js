/* ==========================================================================
   KNOCKOUTNOTES — Ventilator Page Bootstrap (ventilator.js)
   Machine selector -> loads the chosen machine into the shared 3D engine,
   builds interactions + UI for it. Only one machine is ever loaded at a
   time (Phase 18: never both machines simultaneously).
   ========================================================================== */

import { createEngine } from "./ventilator-3d.js";
import { createInteractions } from "./ventilator-interactions.js";
import { createUI } from "./ventilator-ui.js";

const selectorScreen = document.getElementById("ventSelectorScreen");
const appScreen = document.getElementById("ventApp");
const stage = document.getElementById("ventStage");
const loadingEl = document.getElementById("ventLoading");
const machineTitle = document.getElementById("ventMachineTitle");
const machineKicker = document.getElementById("ventMachineKicker");

let engine = null;
let currentMachineId = null;

function loadMachine(id) {
  const machineData = window.VentilatorData.machines[id];
  if (!machineData) return;
  currentMachineId = id;

  selectorScreen.hidden = true;
  appScreen.hidden = false;
  loadingEl.hidden = false;

  machineTitle.textContent = machineData.name;
  machineKicker.textContent = machineData.kicker;
  document.getElementById("ventMachineDesc").textContent = machineData.description;

  if (!engine) engine = createEngine(stage);
  window.__ventEngineForDebug = engine; // QA/diagnostic hook only

  engine.init(id).then(() => {
    loadingEl.hidden = true;
    const interactions = createInteractions(engine, machineData);
    createUI(engine, interactions, machineData);

    // Show/hide machine-specific top-tab sections (Ventilator controls,
    // Monitor, Alarms only apply to a machine with hasVentilator/hasMonitor).
    document.querySelectorAll("[data-requires-ventilator]").forEach(el => { el.hidden = !machineData.hasVentilator; });
    document.querySelectorAll("[data-requires-monitor]").forEach(el => { el.hidden = !machineData.hasMonitor; });
    document.querySelectorAll("[data-requires-drawers]").forEach(el => { el.hidden = !machineData.hasDrawers; });
  });
}

// Minimal standalone nav (this page doesn't load the site-wide script.js,
// since none of its 3D/Lite/search/carousel logic applies here).
const menuBtn = document.getElementById("ventMenuBtn");
const mobileMenu = document.getElementById("ventMobileMenu");
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
}

document.querySelectorAll("[data-select-machine]").forEach(card => {
  card.addEventListener("click", () => loadMachine(card.dataset.selectMachine));
});

document.getElementById("ventChangeMachineBtn").addEventListener("click", () => {
  appScreen.hidden = true;
  selectorScreen.hidden = false;
  if (engine) engine.dispose();
});

// Keyboard: Escape closes the info panel / drawer panel without leaving the page.
window.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  const infoPanel = document.getElementById("ventInfoPanel");
  const drawerPanel = document.getElementById("ventDrawerPanel");
  if (infoPanel) infoPanel.classList.remove("open");
  if (drawerPanel) drawerPanel.hidden = true;
});
