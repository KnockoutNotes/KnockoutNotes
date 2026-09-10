/* ==========================================================================
   KNOCKOUTNOTES — Ventilator Interactions (ventilator-interactions.js)
   Hover/click identification, info panel, Gas System Explorer, Flow mode,
   Safety Features + failure simulation, Troubleshooting, Viva, Show Me.
   Directly manages a small set of well-known DOM ids in ventilator.html —
   this is page-specific glue, not a generic reusable widget library.
   ========================================================================== */

export function createInteractions(engine, machine) {
  const hoverLabel = document.getElementById("ventHoverLabel");
  const infoPanel = document.getElementById("ventInfoPanel");
  let activeFlow = null;
  let activeMode = null; // 'gas' | 'flow' | 'safety' | 'troubleshoot' | 'viva' | 'showme' | null

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c]));
  }

  function componentById(id) {
    return machine.components.find(c => c.id === id) || null;
  }

  // ---- Hover label ----
  engine.onHover(mesh => {
    if (!mesh) { hoverLabel.hidden = true; return; }
    const data = componentById(mesh.userData.componentId);
    if (!data) { hoverLabel.hidden = true; return; }
    hoverLabel.hidden = false;
    hoverLabel.textContent = data.name;
  });
  engine.renderer.domElement.addEventListener("pointermove", e => {
    if (hoverLabel.hidden) return;
    const rect = engine.renderer.domElement.parentElement.getBoundingClientRect();
    hoverLabel.style.left = (e.clientX - rect.left + 14) + "px";
    hoverLabel.style.top = (e.clientY - rect.top - 10) + "px";
  }, { passive: true });
  engine.renderer.domElement.addEventListener("pointerleave", () => { hoverLabel.hidden = true; });

  // ---- Click -> info panel ----
  function renderInfoPanel(data) {
    if (!data) { infoPanel.classList.remove("open"); return; }
    infoPanel.classList.add("open");
    infoPanel.innerHTML = `
      <button class="vent-info-close" id="ventInfoCloseBtn" aria-label="Close">&times;</button>
      <span class="vent-info-category">${esc(data.category || "")}</span>
      <h3 class="vent-info-title">${esc(data.name)}</h3>
      <p class="vent-info-desc">${esc(data.description || "")}</p>
      <div class="vent-info-block"><strong>Function</strong><p>${esc(data.function || "")}</p></div>
      ${data.vivaPoints && data.vivaPoints.length ? `<div class="vent-info-block"><strong>Viva points</strong><ul>${data.vivaPoints.map(v => `<li>${esc(v)}</li>`).join("")}</ul></div>` : ""}
      ${data.relatedComponents && data.relatedComponents.length ? `<div class="vent-info-related">${data.relatedComponents.map(id => {
        const rc = componentById(id);
        return rc ? `<button class="vent-chip" data-focus-component="${esc(id)}">${esc(rc.name)}</button>` : "";
      }).join("")}</div>` : ""}
    `;
    infoPanel.querySelector("#ventInfoCloseBtn").addEventListener("click", () => renderInfoPanel(null));
    infoPanel.querySelectorAll("[data-focus-component]").forEach(btn => {
      btn.addEventListener("click", () => selectComponent(btn.dataset.focusComponent));
    });
  }

  function selectComponent(id) {
    const mesh = engine.getComponentMesh(id);
    const data = componentById(id);
    if (!mesh || !data) return;
    engine.applySelect(mesh);
    engine.focusOnComponent(mesh, { distanceFactor: 6.5 });
    renderInfoPanel(data);
  }

  engine.onClick(mesh => {
    const data = componentById(mesh.userData.componentId);
    if (data) renderInfoPanel(data);
    // Drawer components toggle open/closed on click, in addition to the info panel.
    if (mesh.userData.componentId && mesh.userData.system === "drawer") {
      const isOpen = mesh.userData.opening;
      engine.openDrawer(mesh.userData.componentId, !isOpen);
      document.dispatchEvent(new CustomEvent("vent:drawer-toggled", { detail: { id: mesh.userData.componentId, open: !isOpen } }));
    }
  });

  function clearMode() {
    activeMode = null;
    engine.clearDim();
    engine.clearHighlight();
    if (activeFlow) { activeFlow.dispose(); activeFlow = null; }
  }

  // ---- Gas System Explorer ----
  function showGasSystem(level) {
    clearMode();
    activeMode = "gas";
    const ids = machine.gasPathway[level] || [];
    engine.dimAllExcept(ids);
    engine.highlightComponents(ids, { color: 0x38bdf8, intensity: 0.55 });
    return {
      label: window.VentilatorData.pressureSystemLabels[level],
      explain: window.VentilatorData.pressureSystemExplain[level],
      components: ids.map(componentById).filter(Boolean)
    };
  }

  // ---- Flow visualization ----
  function showFlow(gasKey) {
    clearMode();
    activeMode = "flow";
    const ids = (machine.flowPaths || {})[gasKey] || [];
    if (!ids.length) return null;
    engine.dimAllExcept(ids);
    engine.highlightComponents(ids, { color: 0x22d3ee, intensity: 0.4 });
    activeFlow = engine.createFlow(ids, 0x38bdf8);
    return { ids, components: ids.map(componentById).filter(Boolean) };
  }
  function flowControl(action, value) {
    if (!activeFlow) return;
    if (action === "play") activeFlow.play();
    if (action === "pause") activeFlow.pause();
    if (action === "slow") activeFlow.setSpeed(value || 0.35);
    if (action === "normal") activeFlow.setSpeed(1);
    if (action === "reset") activeFlow.reset();
  }

  // ---- Safety Features + failure simulation ----
  function showSafety(featureId) {
    clearMode();
    activeMode = "safety";
    const feature = machine.safetyFeatures.find(f => f.id === featureId);
    if (!feature) return null;
    engine.dimAllExcept(feature.componentIds);
    engine.highlightComponents(feature.componentIds, { color: 0xfbbf24, intensity: 0.6 });
    if (feature.componentIds[0]) engine.focusOnComponent(feature.componentIds[0], { distanceFactor: 6 });
    return feature;
  }
  function simulateFailure(failureKey) {
    const scenario = (machine.failureScenarios || {})[failureKey];
    if (!scenario) return null;
    return scenario; // step list rendered by ui with a "next step" walkthrough
  }

  // ---- Troubleshooting ----
  function startTroubleshooting(scenarioId) {
    clearMode();
    activeMode = "troubleshoot";
    const scenario = machine.troubleshooting.find(t => t.id === scenarioId);
    if (!scenario) return null;
    engine.dimAllExcept(scenario.candidateComponentIds);
    return { scenario, candidates: scenario.candidateComponentIds.map(componentById).filter(Boolean) };
  }
  function answerTroubleshooting(scenarioId, chosenComponentId) {
    const scenario = machine.troubleshooting.find(t => t.id === scenarioId);
    if (!scenario) return null;
    const correct = chosenComponentId === scenario.correctComponentId;
    if (correct) {
      engine.clearHighlight();
      engine.highlightComponents([chosenComponentId], { color: 0x22c55e, intensity: 0.7 });
      engine.focusOnComponent(chosenComponentId, { distanceFactor: 6 });
    }
    return { correct, explanation: scenario.explanation, correctComponentId: scenario.correctComponentId };
  }

  // ---- Viva ----
  function startViva(questionIndex) {
    clearMode();
    activeMode = "viva";
    const q = machine.vivaQuestions[questionIndex];
    if (!q) return null;
    if (q.componentId) {
      engine.dimAllExcept([q.componentId]);
      engine.focusOnComponent(q.componentId, { distanceFactor: 6.5 });
    }
    return q;
  }

  // ---- Show Me ----
  function showMe(entry) {
    clearMode();
    activeMode = "showme";
    if (entry.flowKey) return { type: "flow", result: showFlow(entry.flowKey), label: entry.label };
    if (entry.pathwayKey) return { type: "gas", result: showGasSystem(entry.pathwayKey), label: entry.label };
    if (entry.componentMatch) {
      const comp = machine.components.find(c => c.id.includes(entry.componentMatch));
      if (!comp) return null;
      engine.dimAllExcept([comp.id]);
      engine.highlightComponents([comp.id], { color: 0x38bdf8, intensity: 0.6 });
      engine.focusOnComponent(comp.id, { distanceFactor: 6.5 });
      renderInfoPanel(comp);
      return { type: "component", result: comp, label: entry.label };
    }
    return null;
  }

  return {
    selectComponent, renderInfoPanel, clearMode,
    showGasSystem, showFlow, flowControl,
    showSafety, simulateFailure,
    startTroubleshooting, answerTroubleshooting,
    startViva, showMe,
    getActiveMode: () => activeMode
  };
}
