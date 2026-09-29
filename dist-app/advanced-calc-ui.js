/**
 * KnockoutNotes — Advanced / Dynamic Calculators UI Controller
 * Wires bidirectional updates, canvas pharmacokinetic graphing, input validation,
 * unit switching, and dual-layer synchronization.
 */

(function () {
  "use strict";

  const Engine = window.KnockoutAdvancedCalc;
  if (!Engine) {
    console.error("[AdvancedCalcUI]: KnockoutAdvancedCalc engine not loaded.");
    return;
  }

  // Dual-view helper: syncs elements with "3d" and "" suffix or runs callback on all matches
  function getEl(idBase) {
    return document.getElementById(idBase + "3d") || document.getElementById(idBase);
  }

  function getAllEls(idBase) {
    const el3d = document.getElementById(idBase + "3d");
    const elLite = document.getElementById(idBase);
    const list = [];
    if (el3d) list.push(el3d);
    if (elLite && elLite !== el3d) list.push(elLite);
    return list;
  }

  function syncInput(idBase, onUpdate) {
    const el3d = document.getElementById(idBase + "3d");
    const elLite = document.getElementById(idBase);
    if (!el3d && !elLite) return;

    function handler(src, other) {
      if (other && (src.type === "checkbox" || src.type === "radio")) {
        other.checked = src.checked;
      } else if (other && src.value !== undefined) {
        other.value = src.value;
      }
      if (typeof onUpdate === "function") onUpdate();
    }

    if (el3d) {
      el3d.addEventListener("input", () => handler(el3d, elLite));
      el3d.addEventListener("change", () => handler(el3d, elLite));
    }
    if (elLite) {
      elLite.addEventListener("input", () => handler(elLite, el3d));
      elLite.addEventListener("change", () => handler(elLite, el3d));
    }
  }

  // ==========================================================================
  // 1. VASOACTIVE INFUSION CALCULATOR CONTROLLER
  // ==========================================================================
  function setupVasopressorController() {
    let isUpdatingReverse = false;

    function updatePresets() {
      const drugKey = (getEl("vasoDrug")?.value || "norepinephrine").toLowerCase();
      const drugDef = Engine.VasopressorEngine.drugs[drugKey] || Engine.VasopressorEngine.drugs.norepinephrine;

      getAllEls("vasoPreset").forEach(sel => {
        sel.innerHTML = "";
        drugDef.standardPresets.forEach((p, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = p.label;
          sel.appendChild(opt);
        });
        const customOpt = document.createElement("option");
        customOpt.value = "custom";
        customOpt.textContent = "Custom concentration (enter amount & volume)";
        sel.appendChild(customOpt);
      });

      // Toggle weight visibility: hidden for vasopressin
      const isUnits = drugDef.unitType === "units";
      getAllEls("vasoWeightRow").forEach(el => {
        el.style.display = isUnits ? "none" : "flex";
      });

      // Update dose mode labels
      getAllEls("vasoDoseUnitLabel").forEach(el => {
        el.textContent = isUnits ? "units/min" : "mcg/kg/min";
      });
      getAllEls("vasoDoseModeSel").forEach(sel => {
        sel.innerHTML = "";
        if (isUnits) {
          sel.innerHTML = `
            <option value="units_min">units/min</option>
            <option value="units_hr">units/hr</option>
          `;
        } else {
          sel.innerHTML = `
            <option value="mcg_kg_min">mcg/kg/min</option>
            <option value="mcg_min">mcg/min</option>
          `;
        }
      });

      applyPreset();
    }

    function applyPreset() {
      const drugKey = (getEl("vasoDrug")?.value || "norepinephrine").toLowerCase();
      const drugDef = Engine.VasopressorEngine.drugs[drugKey] || Engine.VasopressorEngine.drugs.norepinephrine;
      const presetVal = getEl("vasoPreset")?.value;

      const isCustom = presetVal === "custom";
      getAllEls("vasoCustomConcFields").forEach(el => {
        el.style.display = isCustom ? "grid" : "none";
      });

      if (!isCustom) {
        const idx = parseInt(presetVal || "0", 10);
        const preset = drugDef.standardPresets[idx] || drugDef.standardPresets[0];
        if (drugDef.unitType === "units") {
          getAllEls("vasoConcUnitsMl").forEach(el => { el.value = preset.concUnitsMl; });
        } else {
          getAllEls("vasoConcMcgMl").forEach(el => { el.value = preset.concMcgMl; });
        }
      } else {
        calcCustomConc();
      }

      updateForward();
    }

    function calcCustomConc() {
      const drugKey = (getEl("vasoDrug")?.value || "norepinephrine").toLowerCase();
      const drugDef = Engine.VasopressorEngine.drugs[drugKey] || Engine.VasopressorEngine.drugs.norepinephrine;
      const amount = parseFloat(getEl("vasoCustomAmount")?.value) || 0;
      const vol = parseFloat(getEl("vasoCustomVol")?.value) || 0;

      if (vol <= 0 || amount <= 0) return;

      if (drugDef.unitType === "units") {
        const conc = amount / vol;
        getAllEls("vasoConcUnitsMl").forEach(el => { el.value = conc; });
      } else {
        const conc = (amount * 1000) / vol; // mg to mcg/mL
        getAllEls("vasoConcMcgMl").forEach(el => { el.value = conc; });
      }
    }

    function updateForward() {
      if (isUpdatingReverse) return;
      const drugKey = (getEl("vasoDrug")?.value || "norepinephrine").toLowerCase();
      const weight = parseFloat(getEl("vasoWeight")?.value) || 70;
      const doseMode = getEl("vasoDoseModeSel")?.value || "mcg_kg_min";
      const doseInput = parseFloat(getEl("vasoDoseInput")?.value);
      const concMcgMl = parseFloat(getEl("vasoConcMcgMl")?.value);
      const concUnitsMl = parseFloat(getEl("vasoConcUnitsMl")?.value);

      const res = Engine.VasopressorEngine.computeForward({
        drug: drugKey,
        weight,
        doseMode,
        doseInput,
        concMcgMl,
        concUnitsMl
      });

      renderVasoOutputs(res, "forward");
    }

    function updateReverse() {
      isUpdatingReverse = true;
      const drugKey = (getEl("vasoDrug")?.value || "norepinephrine").toLowerCase();
      const weight = parseFloat(getEl("vasoWeight")?.value) || 70;
      const rateMlHr = parseFloat(getEl("vasoRateInput")?.value);
      const concMcgMl = parseFloat(getEl("vasoConcMcgMl")?.value);
      const concUnitsMl = parseFloat(getEl("vasoConcUnitsMl")?.value);

      const res = Engine.VasopressorEngine.computeReverse({
        drug: drugKey,
        weight,
        rateMlHr,
        concMcgMl,
        concUnitsMl
      });

      renderVasoOutputs(res, "reverse");
      setTimeout(() => { isUpdatingReverse = false; }, 50);
    }

    function renderVasoOutputs(res, direction) {
      if (!res) return;
      if (res.error) {
        getAllEls("vasoErrorAlert").forEach(el => {
          el.textContent = res.error;
          el.style.display = "block";
        });
        return;
      }

      getAllEls("vasoErrorAlert").forEach(el => { el.style.display = "none"; });

      if (direction === "forward") {
        // Sync rate input field
        getAllEls("vasoRateInput").forEach(el => { el.value = res.rateMlHr ?? ""; });
      } else if (direction === "reverse") {
        // Sync dose input field
        const doseMode = getEl("vasoDoseModeSel")?.value || "mcg_kg_min";
        let syncVal = "";
        if (res.unitType === "units") {
          syncVal = doseMode === "units_hr" ? res.doseUnitsHr : res.doseUnitsMin;
        } else {
          syncVal = doseMode === "mcg_min" ? res.doseMcgMin : res.doseMcgKgMin;
        }
        getAllEls("vasoDoseInput").forEach(el => { el.value = syncVal ?? ""; });
      }

      // Render Display Badges
      if (res.unitType === "units") {
        getAllEls("vasoOutDoseKg").forEach(el => { el.innerHTML = `<strong>${res.doseUnitsMin}</strong> <span class="unit">units/min</span>`; });
        getAllEls("vasoOutDoseTotal").forEach(el => { el.innerHTML = `<strong>${res.doseUnitsHr}</strong> <span class="unit">units/hr</span>`; });
        getAllEls("vasoOutRate").forEach(el => { el.innerHTML = `<strong>${res.rateMlHr}</strong> <span class="unit">mL/hr</span>`; });
        getAllEls("vasoOutConc").forEach(el => { el.innerHTML = `<strong>${res.concUnitsMl}</strong> <span class="unit">units/mL</span>`; });
      } else {
        getAllEls("vasoOutDoseKg").forEach(el => { el.innerHTML = `<strong>${res.doseMcgKgMin}</strong> <span class="unit">mcg/kg/min</span>`; });
        getAllEls("vasoOutDoseTotal").forEach(el => { el.innerHTML = `<strong>${res.doseMcgMin}</strong> <span class="unit">mcg/min</span>`; });
        getAllEls("vasoOutRate").forEach(el => { el.innerHTML = `<strong>${res.rateMlHr}</strong> <span class="unit">mL/hr</span>`; });
        getAllEls("vasoOutConc").forEach(el => { el.innerHTML = `<strong>${res.concMcgMl}</strong> <span class="unit">mcg/mL</span>`; });
      }

      getAllEls("vasoRefRange").forEach(el => { el.textContent = res.referenceRange || ""; });
      getAllEls("vasoCitation").forEach(el => { el.textContent = res.citation || ""; });
    }

    // Bind event listeners
    syncInput("vasoDrug", updatePresets);
    syncInput("vasoPreset", applyPreset);
    syncInput("vasoWeight", updateForward);
    syncInput("vasoDoseInput", updateForward);
    syncInput("vasoDoseModeSel", updateForward);
    syncInput("vasoRateInput", updateReverse);
    syncInput("vasoCustomAmount", () => { calcCustomConc(); updateForward(); });
    syncInput("vasoCustomVol", () => { calcCustomConc(); updateForward(); });

    updatePresets();
  }

  // ==========================================================================
  // 2. TCI PHARMACOKINETIC MODEL SIMULATOR CONTROLLER
  // ==========================================================================
  function setupTciController() {
    let currentDuration = 30;

    function updateModelUi() {
      const modelKey = (getEl("tciModel")?.value || "schnider").toLowerCase();
      const modelDef = Engine.TciEngine.models[modelKey] || Engine.TciEngine.models.schnider;

      // Update unit label (Propofol = mcg/mL, Remifentanil = ng/mL)
      const isRemi = modelDef.drug === "Remifentanil";
      const unit = isRemi ? "ng/mL" : "mcg/mL";
      getAllEls("tciTargetUnit").forEach(el => { el.textContent = unit; });
      getAllEls("tciDrugBadge").forEach(el => { el.textContent = `${modelDef.drug} (${modelDef.name} ${modelDef.year})`; });

      // Target mode selector (Marsh only supports plasma Cp; Schnider & Minto support Ce & Cp)
      getAllEls("tciTargetMode").forEach(sel => {
        sel.innerHTML = "";
        const optCp = document.createElement("option");
        optCp.value = "plasma";
        optCp.textContent = "Plasma Target (Cp)";
        sel.appendChild(optCp);

        if (modelDef.supportsTarget.includes("effect_site")) {
          const optCe = document.createElement("option");
          optCe.value = "effect_site";
          optCe.textContent = "Effect-Site Target (Ce)";
          sel.appendChild(optCe);
        }
      });

      // Highlight relevant covariates
      const usedCovariates = modelDef.covariatesUsed || [];
      ["Age", "Sex", "Height"].forEach(cov => {
        const row = getEl(`tciCov${cov}Row`);
        if (row) {
          const isUsed = usedCovariates.includes(cov.toLowerCase());
          row.style.opacity = isUsed ? "1" : "0.45";
          row.title = isUsed ? `Used by ${modelDef.name} model` : `Not used by ${modelDef.name} model`;
        }
      });

      // Default target concentrations
      const defTarget = isRemi ? "3.0" : "4.0";
      getAllEls("tciTargetConc").forEach(el => {
        if (!el.value || el.value === "4.0" || el.value === "3.0") el.value = defTarget;
      });

      runSimulation();
    }

    function runSimulation() {
      const modelKey = (getEl("tciModel")?.value || "schnider").toLowerCase();
      const age = parseFloat(getEl("tciAge")?.value) || 40;
      const sex = getEl("tciSex")?.value || "male";
      const height = parseFloat(getEl("tciHeight")?.value) || 175;
      const weight = parseFloat(getEl("tciWeight")?.value) || 70;
      const targetMode = getEl("tciTargetMode")?.value || "plasma";
      const targetConc = parseFloat(getEl("tciTargetConc")?.value) || 4.0;

      const simRes = Engine.TciEngine.simulateTrajectory({
        model: modelKey,
        age,
        sex,
        height,
        weight,
        targetMode,
        targetConc,
        durationMin: currentDuration
      });

      if (!simRes || simRes.error) {
        getAllEls("tciErrorAlert").forEach(el => {
          el.textContent = simRes?.error || "Error running PK simulation.";
          el.style.display = "block";
        });
        return;
      }

      getAllEls("tciErrorAlert").forEach(el => { el.style.display = "none"; });

      // Render Parameters Summary
      getAllEls("tciCovSummary").forEach(el => { el.textContent = simRes.covariatesSummary; });
      getAllEls("tciBolusOut").forEach(el => { el.innerHTML = `<strong>${simRes.initialBolus}</strong> <span class="unit">${simRes.initialBolusUnit}</span>`; });
      getAllEls("tciV1Out").forEach(el => { el.textContent = `${simRes.pkParameters.V1_L} L`; });
      getAllEls("tciV2Out").forEach(el => { el.textContent = `${simRes.pkParameters.V2_L} L`; });
      getAllEls("tciV3Out").forEach(el => { el.textContent = `${simRes.pkParameters.V3_L} L`; });
      getAllEls("tciKe0Out").forEach(el => { el.textContent = `${simRes.pkParameters.ke0_min} min⁻¹`; });
      getAllEls("tciCitation").forEach(el => { el.textContent = simRes.citation; });
      getAllEls("tciLimitations").forEach(el => { el.textContent = simRes.limitations; });

      // Render Dynamic Canvas Graph in both 3D and Lite views
      renderTciCanvas("tciCanvas3d", simRes);
      renderTciCanvas("tciCanvas", simRes);
    }

    function renderTciCanvas(canvasId, sim) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Handle high-DPI displays
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width || 600;
      const height = rect.height || 260;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = "#0c1220";
      ctx.fillRect(0, 0, width, height);

      // Graph bounds
      const padLeft = 45;
      const padRight = 20;
      const padTop = 25;
      const padBottom = 35;
      const plotW = width - padLeft - padRight;
      const plotH = height - padTop - padBottom;

      const maxTime = sim.durationMin;
      // Max concentration with buffer
      const maxCp = Math.max(...sim.cpPoints, sim.targetConc * 1.35, 1.0);
      const maxY = Math.ceil(maxCp * 1.1);

      // Draw Grid Lines & Ticks
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.font = "11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = "#64748b";

      // Y Grid
      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const yVal = (maxY / ySteps) * i;
        const yPos = padTop + plotH - (yVal / maxY) * plotH;

        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(padLeft + plotW, yPos);
        ctx.stroke();

        ctx.textAlign = "right";
        ctx.fillText(yVal.toFixed(1), padLeft - 6, yPos + 4);
      }

      // X Grid (Time in minutes)
      const xInterval = maxTime <= 10 ? 2 : (maxTime <= 30 ? 5 : 10);
      for (let t = 0; t <= maxTime; t += xInterval) {
        const xPos = padLeft + (t / maxTime) * plotW;

        ctx.beginPath();
        ctx.moveTo(xPos, padTop);
        ctx.lineTo(xPos, padTop + plotH);
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillText(`${t}m`, xPos, padTop + plotH + 18);
      }

      // Target line (dashed amber)
      const targetY = padTop + plotH - (sim.targetConc / maxY) * plotH;
      ctx.save();
      ctx.strokeStyle = "#f59e0b";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(padLeft, targetY);
      ctx.lineTo(padLeft + plotW, targetY);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#f59e0b";
      ctx.textAlign = "right";
      ctx.fillText(`Target: ${sim.targetConc} ${sim.unit}`, padLeft + plotW, targetY - 6);

      // Plot Cp Curve (Plasma - Cyan/Blue)
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      sim.timePoints.forEach((t, idx) => {
        const x = padLeft + (t / maxTime) * plotW;
        const y = padTop + plotH - (sim.cpPoints[idx] / maxY) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Plot Ce Curve (Effect-Site - Emerald Green)
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      sim.timePoints.forEach((t, idx) => {
        const x = padLeft + (t / maxTime) * plotW;
        const y = padTop + plotH - (sim.cePoints[idx] / maxY) * plotH;
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Legend
      ctx.font = "11px sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(padLeft + 10, padTop - 18, 12, 4);
      ctx.fillText(`Cp (Plasma): ${sim.cpPoints[sim.cpPoints.length - 1]} ${sim.unit}`, padLeft + 26, padTop - 14);

      ctx.fillStyle = "#10b981";
      ctx.fillRect(padLeft + 190, padTop - 18, 12, 4);
      ctx.fillText(`Ce (Effect-site): ${sim.cePoints[sim.cePoints.length - 1]} ${sim.unit}`, padLeft + 206, padTop - 14);
    }

    // Duration buttons (5, 10, 30, 60 min)
    document.querySelectorAll("[data-tci-duration]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const d = parseInt(btn.getAttribute("data-tci-duration") || "30", 10);
        currentDuration = d;
        document.querySelectorAll("[data-tci-duration]").forEach(b => {
          b.classList.toggle("active", parseInt(b.getAttribute("data-tci-duration"), 10) === d);
        });
        runSimulation();
      });
    });

    syncInput("tciModel", updateModelUi);
    syncInput("tciAge", runSimulation);
    syncInput("tciSex", runSimulation);
    syncInput("tciHeight", runSimulation);
    syncInput("tciWeight", runSimulation);
    syncInput("tciTargetMode", runSimulation);
    syncInput("tciTargetConc", runSimulation);

    updateModelUi();
  }

  // ==========================================================================
  // 3. PREDICTED BODY WEIGHT (PBW) & VENTILATION MECHANICS CONTROLLER
  // ==========================================================================
  function setupVentilationController() {
    function updateVent() {
      const heightCm = parseFloat(getEl("ventHeight")?.value) || 175;
      const sex = getEl("ventSex")?.value || "male";
      const targetRatio = parseFloat(getEl("ventTargetSlider")?.value) || 6.0;
      const setVt = parseFloat(getEl("ventSetVt")?.value);
      const pplat = parseFloat(getEl("ventPplat")?.value);
      const peep = parseFloat(getEl("ventPeep")?.value);

      const res = Engine.VentilationPbwEngine.computeMechanics({
        heightCm,
        sex,
        targetRatio,
        setVt,
        pplat,
        peep
      });

      if (!res || res.error) {
        getAllEls("ventErrorAlert").forEach(el => {
          el.textContent = res?.error || "Error in ventilation mechanics inputs.";
          el.style.display = "block";
        });
        return;
      }

      getAllEls("ventErrorAlert").forEach(el => { el.style.display = "none"; });

      // Update Slider Readout
      getAllEls("ventSliderVal").forEach(el => { el.textContent = `${res.targetRatio} mL/kg PBW`; });
      getAllEls("ventTargetSlider").forEach(el => { el.value = res.targetRatio; });

      // PBW Displays
      getAllEls("ventPbwOut").forEach(el => { el.innerHTML = `<strong>${res.pbwKg}</strong> <span class="unit">kg</span>`; });
      getAllEls("ventTargetVtOut").forEach(el => { el.innerHTML = `<strong>${res.targetVtMl}</strong> <span class="unit">mL</span>`; });

      // Tidal Volume Ladder
      [4, 5, 6, 7, 8].forEach(v => {
        getAllEls(`ventVt${v}`).forEach(el => {
          el.textContent = `${res.vtLadder[`vt_${v}`]} mL`;
        });
      });

      // Driving Pressure & Static Compliance
      if (res.drivingPressureCmH2O !== null) {
        const dpBadgeClass = res.drivingPressureCmH2O <= 14 ? "good" : "alert";
        getAllEls("ventDpOut").forEach(el => {
          el.innerHTML = `<strong>${res.drivingPressureCmH2O}</strong> <span class="unit">cmH2O</span> <span class="badge ${dpBadgeClass}">${res.drivingPressureCmH2O <= 14 ? "≤14 (Lung Protective)" : ">14 (Elevated Risk)"}</span>`;
        });
        getAllEls("ventDpStatus").forEach(el => { el.textContent = res.drivingPressureStatus; });
      } else {
        getAllEls("ventDpOut").forEach(el => { el.innerHTML = `<span style="color:#64748b;">Enter Pplat & PEEP</span>`; });
        getAllEls("ventDpStatus").forEach(el => { el.textContent = "Driving pressure requires Plateau pressure and PEEP."; });
      }

      if (res.staticComplianceMlCmH2O !== null) {
        getAllEls("ventComplianceOut").forEach(el => {
          el.innerHTML = `<strong>${res.staticComplianceMlCmH2O}</strong> <span class="unit">mL/cmH2O</span>`;
        });
        getAllEls("ventComplianceStatus").forEach(el => { el.textContent = res.complianceStatus; });
      } else {
        getAllEls("ventComplianceOut").forEach(el => { el.innerHTML = `<span style="color:#64748b;">--</span>`; });
        getAllEls("ventComplianceStatus").forEach(el => { el.textContent = "Static compliance calculated when VT and driving pressure are valid."; });
      }
    }

    // Step buttons for 4, 5, 6, 7, 8 mL/kg
    document.querySelectorAll("[data-vt-step]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const ratio = parseFloat(btn.getAttribute("data-vt-step") || "6.0");
        getAllEls("ventTargetSlider").forEach(el => { el.value = ratio; });
        getAllEls("ventSetVt").forEach(el => { el.value = ""; }); // clear manual override
        updateVent();
      });
    });

    syncInput("ventHeight", updateVent);
    syncInput("ventSex", updateVent);
    syncInput("ventTargetSlider", () => {
      getAllEls("ventSetVt").forEach(el => { el.value = ""; });
      updateVent();
    });
    syncInput("ventSetVt", updateVent);
    syncInput("ventPplat", updateVent);
    syncInput("ventPeep", updateVent);

    updateVent();
  }

  // ==========================================================================
  // 4. MAXIMUM ALLOWABLE BLOOD LOSS (MABL) CONTROLLER
  // ==========================================================================
  function setupMablController() {
    function updateMabl() {
      const weight = parseFloat(getEl("mablWeight")?.value) || 70;
      const ebvCategory = getEl("mablCategory")?.value || "adult_male";
      const mode = getEl("mablMode")?.value || "hb";
      const initialVal = parseFloat(getEl("mablInit")?.value);
      const targetVal = parseFloat(getEl("mablTarget")?.value);

      // Adjust input step/placeholders for Hb vs Hct
      const isHb = mode === "hb";
      getAllEls("mablValUnit").forEach(el => { el.textContent = isHb ? "g/dL" : "%"; });

      const res = Engine.MablEngine.calculateMABL({
        weight,
        ebvCategory,
        mode,
        initialVal,
        targetVal
      });

      if (!res || res.error) {
        getAllEls("mablErrorAlert").forEach(el => {
          el.textContent = res?.error || "Error calculating MABL.";
          el.style.display = "block";
        });
        return;
      }

      getAllEls("mablErrorAlert").forEach(el => { el.style.display = "none"; });

      getAllEls("mablEbvOut").forEach(el => { el.innerHTML = `<strong>${res.ebvTotalMl}</strong> <span class="unit">mL (${res.assumedEbvFactor} mL/kg)</span>`; });
      getAllEls("mablLossOut").forEach(el => { el.innerHTML = `<strong>${res.mablMl}</strong> <span class="unit">mL</span>`; });
      getAllEls("mablPctOut").forEach(el => { el.innerHTML = `<strong>${res.pctEbv}</strong> <span class="unit">% of EBV</span>`; });
      getAllEls("mablFormula").forEach(el => { el.textContent = res.formula; });
      getAllEls("mablDisclaimer").forEach(el => { el.textContent = res.safetyDisclaimer; });
    }

    syncInput("mablWeight", updateMabl);
    syncInput("mablCategory", updateMabl);
    syncInput("mablMode", () => {
      const isHb = getEl("mablMode")?.value === "hb";
      getAllEls("mablInit").forEach(el => { el.value = isHb ? "14.0" : "42"; });
      getAllEls("mablTarget").forEach(el => { el.value = isHb ? "8.0" : "24"; });
      updateMabl();
    });
    syncInput("mablInit", updateMabl);
    syncInput("mablTarget", updateMabl);

    updateMabl();
  }

  // ==========================================================================
  // 5. MASSIVE TRANSFUSION PROTOCOL (MTP) CONTROLLER
  // ==========================================================================
  function setupMtpController() {
    function updateMtp() {
      const domain = getEl("mtpDomain")?.value || "trauma";
      const coolers = parseInt(getEl("mtpCoolers")?.value || "1", 10);
      const ratio = getEl("mtpRatio")?.value || "1:1:1";

      const res = Engine.MtpEngine.calculateCooler({
        domain,
        coolers,
        ratio
      });

      if (!res) return;

      getAllEls("mtpRbcOut").forEach(el => { el.innerHTML = `<strong>${res.rbcUnits}</strong> <span class="unit">units</span>`; });
      getAllEls("mtpFfpOut").forEach(el => { el.innerHTML = `<strong>${res.ffpUnits}</strong> <span class="unit">units</span>`; });
      getAllEls("mtpPltOut").forEach(el => { el.innerHTML = `<strong>${res.plateletAdultDoses}</strong> <span class="unit">adult dose (${res.plateletAdultDoses * 4}–${res.plateletAdultDoses * 6} pooled units)</span>`; });

      // Render Triggers list
      getAllEls("mtpTriggersList").forEach(ul => {
        ul.innerHTML = "";
        res.triggers.forEach(t => {
          const li = document.createElement("li");
          li.textContent = t;
          ul.appendChild(li);
        });
      });

      // Render Adjuncts list
      getAllEls("mtpAdjunctsList").forEach(ul => {
        ul.innerHTML = "";
        res.adjuncts.forEach(a => {
          const li = document.createElement("li");
          li.textContent = a;
          ul.appendChild(li);
        });
      });

      getAllEls("mtpCitation").forEach(el => { el.textContent = res.citations.join(" | "); });
    }

    syncInput("mtpDomain", updateMtp);
    syncInput("mtpCoolers", updateMtp);
    syncInput("mtpRatio", updateMtp);

    updateMtp();
  }

  // ==========================================================================
  // 6. VISCOELASTIC TESTING GUIDE (TEG & ROTEM) CONTROLLER
  // ==========================================================================
  function setupViscoelasticController() {
    function updateVisco() {
      const modality = getEl("viscoModality")?.value || "teg";
      const isTeg = modality === "teg";

      getAllEls("tegInputSection").forEach(el => { el.style.display = isTeg ? "block" : "none"; });
      getAllEls("rotemInputSection").forEach(el => { el.style.display = isTeg ? "none" : "block"; });

      let res = null;
      if (isTeg) {
        res = Engine.ViscoelasticEngine.evaluateTEG({
          r_time: getEl("tegR")?.value,
          k_time: getEl("tegK")?.value,
          alpha: getEl("tegAlpha")?.value,
          ma: getEl("tegMa")?.value,
          ly30: getEl("tegLy30")?.value,
          ff_ma: getEl("tegFf")?.value
        });
      } else {
        res = Engine.ViscoelasticEngine.evaluateROTEM({
          extem_ct: getEl("rotemExtemCt")?.value,
          extem_a5: getEl("rotemExtemA5")?.value,
          extem_mcf: getEl("rotemExtemMcf")?.value,
          extem_ml: getEl("rotemExtemMl")?.value,
          fibtem_a5: getEl("rotemFibtemA5")?.value
        });
      }

      if (!res) return;

      getAllEls("viscoFindingsList").forEach(ul => {
        ul.innerHTML = "";
        res.findings.forEach(f => {
          const li = document.createElement("li");
          li.textContent = f;
          ul.appendChild(li);
        });
      });

      getAllEls("viscoRecsList").forEach(ul => {
        ul.innerHTML = "";
        res.recommendations.forEach(r => {
          const li = document.createElement("li");
          li.textContent = r;
          ul.appendChild(li);
        });
      });

      getAllEls("viscoCitation").forEach(el => { el.textContent = res.citations.join(" | "); });
    }

    syncInput("viscoModality", updateVisco);
    ["tegR", "tegK", "tegAlpha", "tegMa", "tegLy30", "tegFf"].forEach(id => syncInput(id, updateVisco));
    ["rotemExtemCt", "rotemExtemA5", "rotemExtemMcf", "rotemExtemMl", "rotemFibtemA5"].forEach(id => syncInput(id, updateVisco));

    updateVisco();
  }

  // Master Initializer
  function initAll() {
    try { setupVasopressorController(); } catch (e) { console.error("[VasoController Error]:", e); }
    try { setupTciController(); } catch (e) { console.error("[TciController Error]:", e); }
    try { setupVentilationController(); } catch (e) { console.error("[VentController Error]:", e); }
    try { setupMablController(); } catch (e) { console.error("[MablController Error]:", e); }
    try { setupMtpController(); } catch (e) { console.error("[MtpController Error]:", e); }
    try { setupViscoelasticController(); } catch (e) { console.error("[ViscoController Error]:", e); }
  }

  window.KnockoutAdvancedCalcUI = {
    init: initAll
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
