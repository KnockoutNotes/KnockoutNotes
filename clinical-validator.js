/**
 * KnockoutNotes — Clinical Safety & Calculator Validation Engine (clinical-validator.js)
 * 
 * Provides defensive input bounds, extreme error detection (10x/100x typo prevention),
 * and clear visual distinction between:
 *  - Normal physiological/clinical calculation
 *  - Warning/extreme but technically calculable value (requires clinician confirmation)
 *  - Invalid/impossible value (halts execution, shows clear correction guidance)
 *
 * All bounds are calibrated against authoritative medical guidelines (WHO, ARDSNet,
 * Surviving Sepsis Campaign, Difficult Airway Society, ASA, ERC, PedsDrugChart).
 * Never silently mutates user input.
 */

(function () {
  "use strict";

  // Clinical Parameter Bounds Registry
  const CLINICAL_BOUNDS = {
    // 1. Adult Body Weight (kg)
    adultWeight: {
      label: "Adult Weight",
      unit: "kg",
      min: 15,          // Below 15 kg in an adult calculator is impossible or paediatric
      max: 450,         // Highest human weight documented
      warnMin: 35,      // Severe adult underweight (cachexia / malnutrition)
      warnMax: 200,     // Severe / Morbid obesity (dosing considerations apply)
      allowZero: false,
      warnMessage: "Extreme adult weight. Dosing should consider Ideal (IBW) or Adjusted (ABW) body weight.",
      invalidMessage: "Weight must be between 15 and 450 kg. For children under 15 kg, use the Paediatric Chart."
    },

    // 2. Paediatric Weight (kg)
    paedsWeight: {
      label: "Paediatric Weight",
      unit: "kg",
      min: 0.4,         // Extreme preterm neonate lower boundary
      max: 120,         // Adolescent upper limit
      warnMin: 2.0,     // Preterm neonate (requires specialized NICU dosing)
      warnMax: 70,      // Paediatric formulas cap at standard adult maximums
      allowZero: false,
      warnMessage: "Weight outside standard 2–70 kg range. Verify against adult dose caps.",
      invalidMessage: "Paediatric weight must be between 0.4 and 120 kg."
    },

    // 3. Paediatric Age (years)
    paedsAge: {
      label: "Paediatric Age",
      unit: "years",
      min: 0,
      max: 18,
      warnMin: 0,
      warnMax: 16,
      allowZero: true,
      warnMessage: "Adolescent patient (≥16y): consider standard adult dosing guidelines.",
      invalidMessage: "Paediatric age must be between 0 and 18 years."
    },

    // 4. Height (cm)
    heightCm: {
      label: "Height",
      unit: "cm",
      min: 35,          // Neonate minimum
      max: 260,         // Extreme human height
      warnMin: 120,     // Short stature / paediatric transition
      warnMax: 220,     // Very tall
      allowZero: false,
      warnMessage: "Extreme height. Verify measurement in cm (not inches).",
      invalidMessage: "Height must be between 35 and 260 cm."
    },

    // 5. Adult Age (years)
    adultAge: {
      label: "Patient Age",
      unit: "years",
      min: 14,
      max: 125,
      warnMin: 18,
      warnMax: 102,
      allowZero: false,
      warnMessage: "Elderly patient (≥80y): titrate sedatives and opioids cautiously.",
      invalidMessage: "Age must be between 14 and 125 years."
    },

    // 6. Mechanical Ventilation Plateau Pressure (cmH2O)
    ventPplat: {
      label: "Plateau Pressure (Pplat)",
      unit: "cmH2O",
      min: 5,
      max: 80,
      warnMin: 10,
      warnMax: 30,      // ARDSNet protective ventilation target is ≤ 30 cmH2O
      allowZero: false,
      warnMessage: "Pplat > 30 cmH2O: Elevated risk of barotrauma and lung injury (ARDSNet benchmark).",
      invalidMessage: "Pplat must be between 5 and 80 cmH2O."
    },

    // 7. Mechanical Ventilation PEEP (cmH2O)
    ventPeep: {
      label: "PEEP",
      unit: "cmH2O",
      min: 0,
      max: 40,
      warnMin: 0,
      warnMax: 24,      // Very high PEEP
      allowZero: true,
      warnMessage: "PEEP > 24 cmH2O: Extreme PEEP requires careful hemodynamic and right heart monitoring.",
      invalidMessage: "PEEP must be between 0 and 40 cmH2O."
    },

    // 8. Parkland Formula: Total Body Surface Area Burn (%)
    burnTbsa: {
      label: "Burn Area (% TBSA)",
      unit: "%",
      min: 1,
      max: 100,
      warnMin: 15,      // Fluid resuscitation standard threshold (≥15-20% adults)
      warnMax: 90,
      allowZero: false,
      warnMessage: "Burns < 15% TBSA generally do not require full Parkland formula IV resuscitation.",
      invalidMessage: "Burn area must be between 1% and 100% TBSA."
    },

    // 9. Post-burn Time (hours)
    burnHours: {
      label: "Time Since Burn",
      unit: "hours",
      min: 0,
      max: 24,          // Parkland formula is strictly for first 24h
      warnMin: 0,
      warnMax: 18,
      allowZero: true,
      warnMessage: "Over 18h post-burn: first 8h window has largely elapsed; re-evaluate fluid status.",
      invalidMessage: "Parkland formula is only validated for the first 24 hours post-burn injury."
    },

    // 10. Vasopressor: Norepinephrine Dose (mcg/kg/min)
    norepiDoseWeight: {
      label: "Norepinephrine Dose",
      unit: "mcg/kg/min",
      min: 0.001,
      max: 5.0,
      warnMin: 0.01,
      warnMax: 0.5,      // SSC high-dose threshold: >0.25–0.5 mcg/kg/min
      allowZero: false,
      warnMessage: "High dose (>0.5 mcg/kg/min): SSC recommends adding Vasopressin or Inotrope.",
      invalidMessage: "Dose must be between 0.001 and 5.0 mcg/kg/min."
    },

    // 11. Vasopressor: Norepinephrine Absolute Dose (mcg/min)
    norepiDoseFixed: {
      label: "Norepinephrine Rate",
      unit: "mcg/min",
      min: 0.1,
      max: 300,
      warnMin: 1.0,
      warnMax: 35.0,
      allowZero: false,
      warnMessage: "Rate > 35 mcg/min is an exceptionally high infusion rate. Verify concentration.",
      invalidMessage: "Dose must be between 0.1 and 300 mcg/min."
    },

    // 12. Vasopressin: Fixed Infusion Rate (units/min)
    vasopressinUnitsMin: {
      label: "Vasopressin Rate",
      unit: "units/min",
      min: 0.005,
      max: 0.1,
      warnMin: 0.01,
      warnMax: 0.04,     // Fixed septic shock dose is 0.03 (range 0.01–0.04)
      allowZero: false,
      warnMessage: "Vasopressin should NOT be titrated above 0.04 units/min due to splanchnic ischemia.",
      invalidMessage: "Vasopressin dose must be between 0.005 and 0.1 units/min (never micrograms)."
    },

    // 13. Vasopressin: Fixed Infusion Rate (units/hr)
    vasopressinUnitsHr: {
      label: "Vasopressin Rate",
      unit: "units/hr",
      min: 0.1,
      max: 6.0,
      warnMin: 0.6,
      warnMax: 2.4,
      allowZero: false,
      warnMessage: "Rates > 2.4 units/hr increase coronary and mesenteric vasoconstrictive risk.",
      invalidMessage: "Vasopressin rate must be between 0.1 and 6.0 units/hr."
    },

    // 14. Dobutamine Dose (mcg/kg/min)
    dobutamineDose: {
      label: "Dobutamine Dose",
      unit: "mcg/kg/min",
      min: 0.5,
      max: 40.0,
      warnMin: 2.5,
      warnMax: 20.0,     // Typical max titration
      allowZero: false,
      warnMessage: "Dose > 20 mcg/kg/min often precipitates tachyarrhythmias and vasodilation.",
      invalidMessage: "Dobutamine dose must be between 0.5 and 40.0 mcg/kg/min."
    },

    // 15. Syringe / Infusion Pump Rate (mL/hr)
    infusionRateMlHr: {
      label: "Infusion Rate",
      unit: "mL/hr",
      min: 0.01,
      max: 500,
      warnMin: 0.1,
      warnMax: 100,
      allowZero: false,
      warnMessage: "Pump rate > 100 mL/hr will empty a 50 mL syringe driver in < 30 minutes.",
      invalidMessage: "Pump rate must be between 0.01 and 500 mL/hr."
    },

    // 16. Serum Creatinine (mg/dL)
    serumCreatinine: {
      label: "Serum Creatinine",
      unit: "mg/dL",
      min: 0.1,
      max: 25.0,
      warnMin: 0.4,
      warnMax: 8.0,
      allowZero: false,
      warnMessage: "Creatinine > 8.0 mg/dL: severe renal failure. Cockcroft-Gault formula loses accuracy in AKI.",
      invalidMessage: "Creatinine must be between 0.1 and 25.0 mg/dL."
    },

    // 17. Serum Bilirubin (mg/dL)
    serumBilirubin: {
      label: "Total Bilirubin",
      unit: "mg/dL",
      min: 0.1,
      max: 60.0,
      warnMin: 0.2,
      warnMax: 20.0,
      allowZero: false,
      warnMessage: "Bilirubin > 20 mg/dL represents severe hyperbilirubinemia.",
      invalidMessage: "Bilirubin must be between 0.1 and 60.0 mg/dL."
    },

    // 18. INR
    inrValue: {
      label: "INR",
      unit: "",
      min: 0.6,
      max: 20.0,
      warnMin: 0.8,
      warnMax: 6.0,
      allowZero: false,
      warnMessage: "INR > 6.0: Critical coagulopathy. High bleeding risk; urgent reversal may be required.",
      invalidMessage: "INR must be between 0.6 and 20.0."
    },

    // 19. Serum Sodium (mmol/L)
    serumSodium: {
      label: "Serum Sodium",
      unit: "mmol/L",
      min: 95,
      max: 185,
      warnMin: 120,
      warnMax: 155,
      allowZero: false,
      warnMessage: "Severe dysnatremia. Correct cautiously (≤ 8–10 mmol/L in 24h) to avoid CPM / brain edema.",
      invalidMessage: "Sodium must be between 95 and 185 mmol/L."
    },

    // 20. Arterial Blood Gas pH
    abgPh: {
      label: "Arterial pH",
      unit: "",
      min: 6.60,
      max: 7.90,
      warnMin: 7.00,
      warnMax: 7.65,
      allowZero: false,
      warnMessage: "Extreme pH (<7.00 or >7.65): Life-threatening acid-base crisis.",
      invalidMessage: "pH must be between 6.60 and 7.90."
    },

    // 21. Arterial Blood Gas PaCO2 (mmHg)
    abgPaco2: {
      label: "PaCO₂",
      unit: "mmHg",
      min: 5,
      max: 180,
      warnMin: 18,
      warnMax: 85,
      allowZero: false,
      warnMessage: "Extreme PaCO₂. Evaluate for acute respiratory failure, hypoventilation or severe hyperventilation.",
      invalidMessage: "PaCO₂ must be between 5 and 180 mmHg."
    },

    // 22. Arterial Blood Gas PaO2 (mmHg)
    abgPao2: {
      label: "PaO₂",
      unit: "mmHg",
      min: 15,
      max: 750,
      warnMin: 45,
      warnMax: 500,
      allowZero: false,
      warnMessage: "PaO₂ < 45 mmHg represents severe, life-threatening hypoxaemia.",
      invalidMessage: "PaO₂ must be between 15 and 750 mmHg."
    },

    // 23. Arterial Blood Gas HCO3 (mmol/L)
    abgHco3: {
      label: "Bicarbonate (HCO₃⁻)",
      unit: "mmol/L",
      min: 1,
      max: 75,
      warnMin: 8,
      warnMax: 45,
      allowZero: false,
      warnMessage: "Extreme bicarbonate. Severe metabolic acidosis or profound alkalosis.",
      invalidMessage: "HCO₃⁻ must be between 1 and 75 mmol/L."
    },

    // 24. Blood Glucose (mg/dL)
    bloodGlucose: {
      label: "Blood Glucose",
      unit: "mg/dL",
      min: 15,
      max: 2000,
      warnMin: 50,
      warnMax: 500,
      allowZero: false,
      warnMessage: "Extreme glucose. Severe hypoglycemia or severe hyperosmolar hyperglycemic state / DKA.",
      invalidMessage: "Glucose must be between 15 and 2000 mg/dL."
    },

    // 25. Serum Albumin (g/dL)
    serumAlbuminGdl: {
      label: "Serum Albumin",
      unit: "g/dL",
      min: 0.5,
      max: 7.0,
      warnMin: 1.5,
      warnMax: 5.5,
      allowZero: false,
      warnMessage: "Albumin < 1.5 g/dL represents profound hypoalbuminemia.",
      invalidMessage: "Albumin must be between 0.5 and 7.0 g/dL."
    },

    // 26. Serum Albumin (g/L)
    serumAlbuminGl: {
      label: "Serum Albumin",
      unit: "g/L",
      min: 5,
      max: 70,
      warnMin: 15,
      warnMax: 55,
      allowZero: false,
      warnMessage: "Albumin < 15 g/L represents profound hypoalbuminemia.",
      invalidMessage: "Albumin must be between 5 and 70 g/L."
    },

    // 27. Total Serum Calcium (mg/dL)
    serumCalcium: {
      label: "Total Calcium",
      unit: "mg/dL",
      min: 2.0,
      max: 20.0,
      warnMin: 6.0,
      warnMax: 14.0,
      allowZero: false,
      warnMessage: "Severe hyper- or hypocalcemia. Risk of cardiac conduction defects.",
      invalidMessage: "Calcium must be between 2.0 and 20.0 mg/dL."
    },

    // 28. Maximum Allowable Blood Loss Target Haematocrit (%)
    mablHct: {
      label: "Hematocrit",
      unit: "%",
      min: 10,
      max: 75,
      warnMin: 21,
      warnMax: 55,
      allowZero: false,
      warnMessage: "Hct < 21% or > 55% represents extreme anemia or severe polycythemia.",
      invalidMessage: "Hematocrit must be between 10% and 75%."
    },

    // 29. TCI Target Concentration: Propofol (mcg/mL)
    tciPropofolTarget: {
      label: "Propofol Target Ce",
      unit: "mcg/mL",
      min: 0.2,
      max: 12.0,
      warnMin: 1.0,
      warnMax: 6.5,
      allowZero: false,
      warnMessage: "Ce > 6.5 mcg/mL: deep anesthesia with high risk of profound hypotension and burst suppression.",
      invalidMessage: "Propofol Ce must be between 0.2 and 12.0 mcg/mL."
    },

    // 30. TCI Target Concentration: Remifentanil (ng/mL)
    tciRemiTarget: {
      label: "Remifentanil Target Ce",
      unit: "ng/mL",
      min: 0.2,
      max: 20.0,
      warnMin: 1.0,
      warnMax: 10.0,
      allowZero: false,
      warnMessage: "Ce > 10.0 ng/mL: extreme remifentanil dose; severe bradycardia and wooden chest rigidity risk.",
      invalidMessage: "Remifentanil Ce must be between 0.2 and 20.0 ng/mL."
    }
  };

  /**
   * Validate a numeric value against clinical bounds
   * @param {number|string} value - Raw input value
   * @param {string} boundKey - Key in CLINICAL_BOUNDS
   * @returns {Object} Validation result { status: 'valid'|'warning'|'invalid'|'empty', message: string, bounds: Object, numVal: number|null }
   */
  function validateValue(value, boundKey) {
    const bound = CLINICAL_BOUNDS[boundKey];
    if (!bound) {
      return { status: "valid", message: "", numVal: parseFloat(value) || null };
    }

    if (value === null || value === undefined || String(value).trim() === "") {
      return {
        status: "empty",
        message: `Please enter a value for ${bound.label}.`,
        bounds: bound,
        numVal: null
      };
    }

    const n = parseFloat(value);
    if (isNaN(n)) {
      return {
        status: "invalid",
        message: `Invalid number entered for ${bound.label}.`,
        bounds: bound,
        numVal: null
      };
    }

    // Check zero if forbidden
    if (n === 0 && !bound.allowZero) {
      return {
        status: "invalid",
        message: `${bound.label} cannot be zero. ${bound.invalidMessage}`,
        bounds: bound,
        numVal: n
      };
    }

    // Check negative if forbidden
    if (n < 0 && bound.min >= 0) {
      return {
        status: "invalid",
        message: `${bound.label} cannot be negative. ${bound.invalidMessage}`,
        bounds: bound,
        numVal: n
      };
    }

    // Hard physiological bounds check
    if (n < bound.min || n > bound.max) {
      return {
        status: "invalid",
        message: `⛔ Impossible value: ${bound.invalidMessage}`,
        bounds: bound,
        numVal: n
      };
    }

    // Plausible clinical warning check
    if ((bound.warnMin !== undefined && n < bound.warnMin) || (bound.warnMax !== undefined && n > bound.warnMax)) {
      return {
        status: "warning",
        message: `⚠️ Extreme value: ${bound.warnMessage}`,
        bounds: bound,
        numVal: n
      };
    }

    return {
      status: "valid",
      message: "",
      bounds: bound,
      numVal: n
    };
  }

  /**
   * Attach visual validation feedback to an input element
   * Renders a neat inline message chip beneath the input field.
   */
  function renderValidationBadge(inputEl, result) {
    if (!inputEl) return;
    const parent = inputEl.closest(".calc-field, .form-group, .calc-input-wrap, .kn-calc-group, div") || inputEl.parentElement;
    if (!parent) return;

    let badge = parent.querySelector(".kn-calc-validation-msg");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "kn-calc-validation-msg";
      badge.setAttribute("role", "alert");
      parent.appendChild(badge);
    }

    inputEl.classList.remove("kn-input-valid", "kn-input-warning", "kn-input-invalid");

    if (result.status === "invalid") {
      inputEl.classList.add("kn-input-invalid");
      badge.className = "kn-calc-validation-msg kn-val-invalid";
      badge.textContent = result.message;
      badge.style.display = "block";
    } else if (result.status === "warning") {
      inputEl.classList.add("kn-input-warning");
      badge.className = "kn-calc-validation-msg kn-val-warning";
      badge.textContent = result.message;
      badge.style.display = "block";
    } else {
      inputEl.classList.add("kn-input-valid");
      badge.textContent = "";
      badge.style.display = "none";
    }
  }

  /**
   * Validate and update UI for an element
   */
  function checkAndRender(inputEl, boundKey) {
    if (!inputEl) return { valid: false };
    const res = validateValue(inputEl.value, boundKey);
    renderValidationBadge(inputEl, res);
    return {
      valid: res.status !== "invalid" && res.status !== "empty",
      isWarning: res.status === "warning",
      isEmpty: res.status === "empty",
      numVal: res.numVal,
      result: res
    };
  }

  // Export engine
  window.KnockoutClinicalValidator = {
    BOUNDS: CLINICAL_BOUNDS,
    validateValue: validateValue,
    renderValidationBadge: renderValidationBadge,
    checkAndRender: checkAndRender
  };
})();
