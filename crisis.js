/**
 * KnockoutNotes — Crisis Mode Interactive Controller
 * Handles hash navigation, emergency checklists, and mathematically verified weight calculators.
 * 
 * Sources:
 * - DAS 2015 Guidelines for unanticipated difficult tracheal intubation in adults
 * - MHAUS Malignant Hyperthermia Guidelines (2.5 mg/kg actual body weight)
 * - ASRA 2020 Checklist for Local Anesthetic Systemic Toxicity (<70kg vs >=70kg)
 */

// Ephemeral Crisis State (No patient data persisted or sent to analytics)
const crisisState = {
  currentView: 'hub',
  mhWeight: 70,
  lastWeight: 70,
  anaWeight: 70,
  bronchoWeight: 70,
  laryngoWeight: 70
};

// ==========================================
// INITIALIZATION & ROUTING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupRouting();
  setupChecklists();
  setupCalculators();

  // Route based on URL hash (e.g. #cico, #mh, #last)
  const initialHash = window.location.hash.replace('#', '') || 'hub';
  navigateToView(initialHash);
});

function setupRouting() {
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'hub';
    navigateToView(hash);
  });

  // Direct trigger buttons
  document.querySelectorAll('[data-crisis-target]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const target = el.dataset.crisisTarget;
      window.location.hash = target;
      navigateToView(target);
    });
  });

  // Back button
  const backBtn = document.getElementById('cmBackBtn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = 'hub';
      navigateToView('hub');
    });
  }
}

function navigateToView(viewName) {
  const validViews = ['hub', 'cico', 'mh', 'last', 'anaphylaxis', 'bronchospasm', 'laryngospasm'];
  const activeView = validViews.includes(viewName) ? viewName : 'hub';
  crisisState.currentView = activeView;

  // Show/hide view panes
  document.querySelectorAll('.cm-view').forEach(v => {
    v.classList.toggle('active', v.id === `view-${activeView}`);
  });

  // Back button visibility
  const backBtn = document.getElementById('cmBackBtn');
  if (backBtn) {
    backBtn.style.display = activeView === 'hub' ? 'none' : 'inline-flex';
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'instant' });

  // If opening a calculator view, recalculate
  if (activeView === 'mh') calculateMH();
  if (activeView === 'last') calculateLAST();
  if (activeView === 'anaphylaxis') calculateAnaphylaxis();
  if (activeView === 'bronchospasm') calculateBronchospasm();
  if (activeView === 'laryngospasm') calculateLaryngospasm();
}

// ==========================================
// CHECKLIST CONTROLLER
// ==========================================
function setupChecklists() {
  document.querySelectorAll('.cm-checklist-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const box = item.querySelector('.cm-check-box');
      if (box) {
        box.textContent = item.classList.contains('checked') ? '✓' : '';
      }
    });
  });
}

// ==========================================
// CALCULATOR: MALIGNANT HYPERTHERMIA (MHAUS)
// ==========================================
function validateCrisisWeight(inputEl, onValid, onInvalid) {
  if (!inputEl) return;
  const validator = window.KnockoutClinicalValidator;
  if (validator && typeof validator.checkAndRender === "function") {
    const res = validator.checkAndRender(inputEl, "adultWeight");
    if (res.valid) {
      onValid(res.numVal);
    } else {
      onInvalid();
    }
  } else {
    const val = parseFloat(inputEl.value);
    if (!isNaN(val) && val >= 1 && val <= 400) {
      onValid(val);
    } else {
      onInvalid();
    }
  }
}

function setupCalculators() {
  // MH Input
  const mhInput = document.getElementById('mhWeightInput');
  if (mhInput) {
    mhInput.addEventListener('input', () => {
      validateCrisisWeight(mhInput, (w) => {
        crisisState.mhWeight = w;
        calculateMH();
      }, () => {
        clearMHOutputs();
      });
    });
  }

  // MH Presets
  document.querySelectorAll('[data-mh-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.mhPreset);
      if (mhInput) mhInput.value = kg;
      validateCrisisWeight(mhInput, (w) => {
        crisisState.mhWeight = w;
        calculateMH();
      }, clearMHOutputs);
    });
  });

  // LAST Input
  const lastInput = document.getElementById('lastWeightInput');
  if (lastInput) {
    lastInput.addEventListener('input', () => {
      validateCrisisWeight(lastInput, (w) => {
        crisisState.lastWeight = w;
        calculateLAST();
      }, () => {
        clearLASTOutputs();
      });
    });
  }

  // LAST Presets
  document.querySelectorAll('[data-last-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.lastPreset);
      if (lastInput) lastInput.value = kg;
      validateCrisisWeight(lastInput, (w) => {
        crisisState.lastWeight = w;
        calculateLAST();
      }, clearLASTOutputs);
    });
  });

  // Anaphylaxis Input
  const anaInput = document.getElementById('anaWeightInput');
  if (anaInput) {
    anaInput.addEventListener('input', () => {
      validateCrisisWeight(anaInput, (w) => {
        crisisState.anaWeight = w;
        calculateAnaphylaxis();
      }, () => {
        clearAnaphylaxisOutputs();
      });
    });
  }

  // Anaphylaxis Presets
  document.querySelectorAll('[data-ana-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.anaPreset);
      if (anaInput) anaInput.value = kg;
      validateCrisisWeight(anaInput, (w) => {
        crisisState.anaWeight = w;
        calculateAnaphylaxis();
      }, clearAnaphylaxisOutputs);
    });
  });

  // Bronchospasm Input
  const bronchoInput = document.getElementById('bronchoWeightInput');
  if (bronchoInput) {
    bronchoInput.addEventListener('input', () => {
      validateCrisisWeight(bronchoInput, (w) => {
        crisisState.bronchoWeight = w;
        calculateBronchospasm();
      }, () => {
        clearBronchospasmOutputs();
      });
    });
  }

  // Bronchospasm Presets
  document.querySelectorAll('[data-broncho-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.bronchoPreset);
      if (bronchoInput) bronchoInput.value = kg;
      validateCrisisWeight(bronchoInput, (w) => {
        crisisState.bronchoWeight = w;
        calculateBronchospasm();
      }, clearBronchospasmOutputs);
    });
  });

  // Laryngospasm Input
  const laryngoInput = document.getElementById('laryngoWeightInput');
  if (laryngoInput) {
    laryngoInput.addEventListener('input', () => {
      validateCrisisWeight(laryngoInput, (w) => {
        crisisState.laryngoWeight = w;
        calculateLaryngospasm();
      }, () => {
        clearLaryngospasmOutputs();
      });
    });
  }

  // Laryngospasm Presets
  document.querySelectorAll('[data-laryngo-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.laryngoPreset);
      if (laryngoInput) laryngoInput.value = kg;
      validateCrisisWeight(laryngoInput, (w) => {
        crisisState.laryngoWeight = w;
        calculateLaryngospasm();
      }, clearLaryngospasmOutputs);
    });
  });
}

/**
 * MHAUS Dantrolene Dosing Logic:
 * Initial Dose = 2.5 mg/kg IV based on ACTUAL BODY WEIGHT.
 * Dantrium/Revonto: 20 mg/vial in 60 mL sterile water.
 * Ryanodex: 250 mg/vial in 5 mL sterile water.
 * Vials rounded UP (Math.ceil) to prevent underdosing.
 */
function calculateMH() {
  const weight = crisisState.mhWeight;
  if (!weight || weight <= 0) {
    clearMHOutputs();
    return;
  }

  // Initial dose calculation
  const initialDoseMg = weight * 2.5;

  // Dantrium / Revonto (20 mg vial)
  const dantriumVials = Math.ceil(initialDoseMg / 20);
  const dantriumVolumeMl = dantriumVials * 60;

  // Ryanodex (250 mg vial)
  const ryanodexVials = Math.ceil(initialDoseMg / 250);
  const ryanodexVolumeMl = ryanodexVials * 5;

  // DOM Updates
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('mhOutputDose', `${formatNum(initialDoseMg)} mg`);
  setTxt('mhOutputDantriumVials', `${dantriumVials} vials`);
  setTxt('mhOutputDantriumVol', `${dantriumVolumeMl} mL sterile water`);
  setTxt('mhOutputRyanodexVials', `${ryanodexVials} vial${ryanodexVials > 1 ? 's' : ''}`);
  setTxt('mhOutputRyanodexVol', `${ryanodexVolumeMl} mL sterile water`);
}

function clearMHOutputs() {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('mhOutputDose', '-- mg');
  setTxt('mhOutputDantriumVials', '-- vials');
  setTxt('mhOutputDantriumVol', '-- mL sterile water');
  setTxt('mhOutputRyanodexVials', '-- vial');
  setTxt('mhOutputRyanodexVol', '-- mL sterile water');
}

/**
 * ASRA 2020 LAST 20% Lipid Emulsion Logic:
 * If < 70 kg:
 *   - Bolus: 1.5 mL/kg IV over 2-3 min
 *   - Infusion: 0.25 mL/kg/min (~15 mL/kg/h)
 * If >= 70 kg:
 *   - Fixed Bolus: 100 mL IV over 2-3 min
 *   - Fixed Infusion: 250 mL IV over 15-20 min (~12.5 - 16.6 mL/min, or ~200-250 mL)
 * Maximum Cumulative Dose: 12 mL/kg
 */
function calculateLAST() {
  const weight = crisisState.lastWeight;
  if (!weight || weight <= 0) {
    clearLASTOutputs();
    return;
  }

  let bolusMl = 0;
  let bolusDesc = '';
  let infusionRateDesc = '';
  let infusionRateHourDesc = '';

  if (weight < 70) {
    // Weight-based under 70 kg
    bolusMl = weight * 1.5;
    const infusionMinMl = weight * 0.25;
    const infusionHourMl = infusionMinMl * 60;

    bolusDesc = `${formatNum(bolusMl)} mL over 2–3 min (1.5 mL/kg)`;
    infusionRateDesc = `${formatNum(infusionMinMl)} mL/min (0.25 mL/kg/min)`;
    infusionRateHourDesc = `Pump: ${formatNum(infusionHourMl)} mL/h`;
  } else {
    // Fixed dose for >= 70 kg
    bolusMl = 100;
    bolusDesc = `100 mL over 2–3 min (Fixed Dose for ≥70 kg)`;
    infusionRateDesc = `250 mL over 15–20 min (~12.5–16.6 mL/min)`;
    infusionRateHourDesc = `Pump / Gravity: ~250 mL bag over 15–20 min`;
  }

  // Maximum cumulative dose = 12 mL/kg
  const maxDoseMl = weight * 12;

  // Repeat bolus guidance
  const repeatBolusDesc = weight < 70 
    ? `Repeat bolus: 1–2 times (${formatNum(bolusMl)} mL) if unstable`
    : `Repeat bolus: 1–2 times (100 mL) if unstable`;

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  setTxt('lastOutputBolus', `${formatNum(bolusMl)} mL`);
  setTxt('lastOutputBolusSub', bolusDesc);
  setTxt('lastOutputInfusion', infusionRateDesc);
  setTxt('lastOutputInfusionSub', infusionRateHourDesc);
  setTxt('lastOutputMax', `${formatNum(maxDoseMl)} mL`);
  setTxt('lastOutputRepeat', repeatBolusDesc);
}

function clearLASTOutputs() {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('lastOutputBolus', '-- mL');
  setTxt('lastOutputBolusSub', 'Enter weight');
  setTxt('lastOutputInfusion', '-- mL/min');
  setTxt('lastOutputInfusionSub', '-- mL/h');
  setTxt('lastOutputMax', '-- mL');
  setTxt('lastOutputRepeat', '--');
}

function formatNum(n) {
  if (Number.isInteger(n)) return n.toString();
  return (Math.round(n * 10) / 10).toFixed(1);
}

/**
 * RCUK / AAGBI Anaphylaxis Dosing Logic:
 * - IM Adrenaline (1:1,000):
 *   Adult / >= 50 kg: 0.5 mg (0.5 mL)
 *   Children: 10 mcg/kg (0.01 mg/kg = 0.01 mL/kg), max 0.5 mg
 * - IV Adrenaline Bolus (1:10,000 = 100 mcg/mL):
 *   Adult / >= 50 kg: 50 mcg (0.5 mL) titrated; severe collapse 100-200 mcg (1-2 mL)
 *   Paediatric: 1 mcg/kg (0.01 mL/kg of 1:10,000)
 * - IV Crystalloid: 20 mL/kg rapid bolus
 * - Refractory Infusion: 0.05 to 0.1 mcg/kg/min
 */
function calculateAnaphylaxis() {
  const weight = crisisState.anaWeight;
  if (!weight || weight <= 0) {
    clearAnaphylaxisOutputs();
    return;
  }

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  // IM Adrenaline (1:1,000 = 1 mg/mL)
  let imDoseMg = weight >= 50 ? 0.5 : Math.min(0.5, Math.max(0.05, weight * 0.01));
  setTxt('anaOutputImDose', `${formatNum(imDoseMg)} mg (${formatNum(imDoseMg)} mL)`);

  // IV Adrenaline Bolus (1:10,000 = 100 mcg/mL)
  if (weight >= 50) {
    setTxt('anaOutputIvDose', '50 mcg (0.5 mL)');
    setTxt('anaOutputIvDetail', 'Titrated for hypotension. Severe collapse: 100–200 mcg (1–2 mL). Repeat every 1–2 min as needed.');
  } else {
    const paedsIvMcg = weight * 1.0;
    const paedsIvMl = paedsIvMcg / 100;
    setTxt('anaOutputIvDose', `${formatNum(paedsIvMcg)} mcg (${formatNum(paedsIvMl)} mL)`);
    setTxt('anaOutputIvDetail', 'Paediatric IV bolus: 1 mcg/kg (1:10,000). Repeat as needed under continuous ECG monitoring.');
  }

  // Fluid bolus: 20 mL/kg
  const fluidMl = weight * 20;
  setTxt('anaOutputFluidBolus', `${formatNum(fluidMl)} mL`);

  // Infusion: 0.05 to 0.1 mcg/kg/min
  const infMin = weight * 0.05;
  const infMax = weight * 0.1;
  setTxt('anaOutputInfusion', `${formatNum(infMin)} – ${formatNum(infMax)} mcg/min`);
}

function clearAnaphylaxisOutputs() {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('anaOutputImDose', '-- mg');
  setTxt('anaOutputIvDose', '-- mcg');
  setTxt('anaOutputIvDetail', 'Enter patient weight');
  setTxt('anaOutputFluidBolus', '-- mL');
  setTxt('anaOutputInfusion', '-- mcg/min');
}

/**
 * AAGBI / ASA Bronchospasm Dosing Logic:
 * - Propofol deepening: 1–2 mg/kg IV
 * - Inhaled Salbutamol: 8-10 puffs MDI (or 5 mg neb); Paeds: 4-6 puffs (2.5 mg neb)
 * - IV Magnesium Sulphate: 50 mg/kg up to max 2.0 g (8 mmol)
 * - IV Hydrocortisone: 2–4 mg/kg up to 200 mg (Paeds: 4 mg/kg, max 100 mg)
 * - IV Salbutamol: 250 mcg slow IV (Paeds: 5 mcg/kg slow IV)
 * - IV Adrenaline (refractory): 20–50 mcg (0.2–0.5 mL of 1:10,000); Paeds: 1 mcg/kg
 */
function calculateBronchospasm() {
  const weight = crisisState.bronchoWeight;
  if (!weight || weight <= 0) {
    clearBronchospasmOutputs();
    return;
  }

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  // Deepen Anaesthesia: Propofol 1-2 mg/kg
  setTxt('bronchoOutputDeepen', `${formatNum(weight * 1)} – ${formatNum(weight * 2)} mg Propofol`);

  // Inhaled Salbutamol
  if (weight >= 30) {
    setTxt('bronchoOutputInhSalbutamol', '8 – 10 puffs MDI (or 5 mg neb)');
  } else {
    setTxt('bronchoOutputInhSalbutamol', '4 – 6 puffs MDI (or 2.5 mg neb)');
  }

  // IV Magnesium Sulphate: 50 mg/kg, max 2.0 g (8 mmol)
  const mgMg = Math.min(2000, weight * 50);
  const mgG = mgMg / 1000;
  const mgMmol = mgMg / 250;
  setTxt('bronchoOutputMagnesium', `${formatNum(mgG)} g (${formatNum(mgMmol)} mmol)`);

  // IV Hydrocortisone: 200 mg adult; 4 mg/kg (max 100 mg) paeds
  if (weight >= 50) {
    setTxt('bronchoOutputSteroid', '200 mg IV');
  } else {
    const steroid = Math.min(100, Math.round(weight * 4));
    setTxt('bronchoOutputSteroid', `${steroid} mg IV (4 mg/kg)`);
  }

  // IV Salbutamol Slow Bolus: 250 mcg adult; 5 mcg/kg paeds
  if (weight >= 50) {
    setTxt('bronchoOutputIvSalbutamol', '250 mcg IV (slow over 5–10 min)');
  } else {
    setTxt('bronchoOutputIvSalbutamol', `${formatNum(weight * 5)} mcg IV (5 mcg/kg slow)`);
  }

  // IV Adrenaline (refractory 1:10,000): 20–50 mcg adult; 1 mcg/kg paeds
  if (weight >= 50) {
    setTxt('bronchoOutputAdrenaline', '20 – 50 mcg (0.2–0.5 mL)');
  } else {
    const adr = weight * 1.0;
    const adrMl = adr / 100;
    setTxt('bronchoOutputAdrenaline', `${formatNum(adr)} mcg (${formatNum(adrMl)} mL)`);
  }
}

function clearBronchospasmOutputs() {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('bronchoOutputDeepen', '-- mg Propofol');
  setTxt('bronchoOutputInhSalbutamol', '-- puffs MDI');
  setTxt('bronchoOutputMagnesium', '-- g');
  setTxt('bronchoOutputSteroid', '-- mg IV');
  setTxt('bronchoOutputIvSalbutamol', '-- mcg IV');
  setTxt('bronchoOutputAdrenaline', '-- mcg');
}

/**
 * DAS / Pediatric Airway Crisis Laryngospasm Dosing Logic:
 * - Propofol: 0.5 to 1.0 mg/kg IV
 * - Low-dose Suxamethonium (spasmolytic): 0.25 to 0.5 mg/kg IV
 * - Full Suxamethonium (intubation): 1.0 to 1.5 mg/kg IV (infants < 10kg: 2.0 mg/kg)
 * - IM Suxamethonium: 3.0 to 4.0 mg/kg
 * - Atropine: 0.02 mg/kg IV/IM (min 0.1 mg, max 0.5 mg child / 1.0 mg adult)
 * - Rocuronium: 1.2 mg/kg IV + Sugammadex backup 16 mg/kg
 */
function calculateLaryngospasm() {
  const weight = crisisState.laryngoWeight;
  if (!weight || weight <= 0) {
    clearLaryngospasmOutputs();
    return;
  }

  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };

  // Propofol: 0.5 - 1.0 mg/kg
  setTxt('laryngoOutputPropofol', `${formatNum(weight * 0.5)} – ${formatNum(weight * 1.0)} mg`);

  // Low-dose Sux: 0.25 - 0.5 mg/kg
  setTxt('laryngoOutputLowSux', `${formatNum(weight * 0.25)} – ${formatNum(weight * 0.5)} mg`);

  // Full-dose Sux: 1.0 - 1.5 mg/kg (infant <10 kg: 2.0 mg/kg)
  if (weight < 10) {
    setTxt('laryngoOutputFullSux', `${formatNum(weight * 2.0)} mg (2.0 mg/kg infant)`);
  } else {
    setTxt('laryngoOutputFullSux', `${formatNum(weight * 1.0)} – ${formatNum(weight * 1.5)} mg`);
  }

  // IM Sux: 3.0 - 4.0 mg/kg
  setTxt('laryngoOutputImSux', `${formatNum(weight * 3.0)} – ${formatNum(weight * 4.0)} mg`);

  // Atropine: 0.02 mg/kg (min 0.1 mg, max 0.5 mg paeds / 1.0 mg adult)
  let atro = Math.max(0.1, weight * 0.02);
  atro = weight >= 50 ? Math.min(1.0, atro) : Math.min(0.5, atro);
  setTxt('laryngoOutputAtropine', `${formatNum(atro)} mg`);

  // Rocuronium 1.2 mg/kg + Sugammadex 16 mg/kg
  const roc = weight * 1.2;
  const sug = weight * 16;
  setTxt('laryngoOutputRoc', `${formatNum(roc)} mg Roc / ${formatNum(sug)} mg Sug`);
}

function clearLaryngospasmOutputs() {
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  };
  setTxt('laryngoOutputPropofol', '-- mg');
  setTxt('laryngoOutputLowSux', '-- mg');
  setTxt('laryngoOutputFullSux', '-- mg');
  setTxt('laryngoOutputImSux', '-- mg');
  setTxt('laryngoOutputAtropine', '-- mg');
  setTxt('laryngoOutputRoc', '-- mg Roc / -- mg Sug');
}

