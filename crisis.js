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
  lastWeight: 70
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
  const validViews = ['hub', 'cico', 'mh', 'last'];
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
function setupCalculators() {
  // MH Input
  const mhInput = document.getElementById('mhWeightInput');
  if (mhInput) {
    mhInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        crisisState.mhWeight = val;
        calculateMH();
      } else {
        clearMHOutputs();
      }
    });
  }

  // MH Presets
  document.querySelectorAll('[data-mh-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.mhPreset);
      if (mhInput) mhInput.value = kg;
      crisisState.mhWeight = kg;
      calculateMH();
    });
  });

  // LAST Input
  const lastInput = document.getElementById('lastWeightInput');
  if (lastInput) {
    lastInput.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        crisisState.lastWeight = val;
        calculateLAST();
      } else {
        clearLASTOutputs();
      }
    });
  }

  // LAST Presets
  document.querySelectorAll('[data-last-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      const kg = parseFloat(btn.dataset.lastPreset);
      if (lastInput) lastInput.value = kg;
      crisisState.lastWeight = kg;
      calculateLAST();
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
