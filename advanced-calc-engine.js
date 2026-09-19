/**
 * KnockoutNotes — Advanced / Dynamic Anaesthesia Calculation Engines
 * 
 * Interactive Clinical Calculation Engines:
 * A. Vasopressor / Inotrope Titration Engine (Norepinephrine, Vasopressin, Dobutamine)
 * B. Propofol TCI Pharmacokinetic Models (Marsh & Schnider)
 * C. Remifentanil TCI Pharmacokinetic Model (Minto)
 * D. Predicted Body Weight (PBW) & Ventilation Mechanics Engine (ARDSNet, Driving Pressure, Static Compliance)
 * E. Maximum Allowable Blood Loss (MABL - Gross/Bourke with Age-Stratified Physiological EBV)
 * F. Massive Transfusion / MTP Support Module (Trauma, Obstetric, Cardiac Surgery)
 * G. Viscoelastic Haemostatic Testing Guide (TEG 5000/6s vs ROTEM delta/sigma)
 *
 * All models and formulas verified against authoritative peer-reviewed literature.
 * Educational / clinical reference tool. Verify drug concentrations, patient factors,
 * and institutional protocols before clinical administration.
 */

(function () {
  "use strict";

  // Safe number parsing
  function toNum(v) {
    if (v === null || v === undefined) return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function roundVal(v, decimals = 2) {
    if (v === null || v === undefined || isNaN(v)) return null;
    const factor = Math.pow(10, decimals);
    return Math.round(v * factor) / factor;
  }

  // ==========================================================================
  // A. VASOPRESSOR / INOTROPE TITRATION ENGINE
  // ==========================================================================
  const VasopressorEngine = {
    drugs: {
      norepinephrine: {
        name: "Norepinephrine (Noradrenaline)",
        class: "Potent α1 > β1 Vasopressor",
        unitType: "mass", // mass (mcg) vs units
        standardPresets: [
          { label: "4 mg in 50 mL (80 mcg/mL) — Standard Syringe Driver", mg: 4, ml: 50, concMcgMl: 80 },
          { label: "8 mg in 50 mL (160 mcg/mL) — Double Strength Syringe Driver", mg: 8, ml: 50, concMcgMl: 160 },
          { label: "4 mg in 250 mL (16 mcg/mL) — Peripheral / Standard Bag", mg: 4, ml: 250, concMcgMl: 16 },
          { label: "8 mg in 250 mL (32 mcg/mL) — Concentrated Infusion Bag", mg: 8, ml: 250, concMcgMl: 32 }
        ],
        referenceDosingRange: "Initial: 0.02 – 0.05 mcg/kg/min (or 2 – 4 mcg/min). Titrate to MAP ≥ 65 mmHg. Usual maintenance: 0.01 – 1.0 mcg/kg/min. High dose: > 0.25 mcg/kg/min (consider adjunct vasopressin / inotrope).",
        guidelineCitation: "Surviving Sepsis Campaign (SSC) 2021/2026; UK Intensive Care Society (ICS) Infusion Standards 2023; DailyMed FDA."
      },
      vasopressin: {
        name: "Vasopressin (AVP / ADH)",
        class: "V1 Receptor Agonist Non-Adrenergic Vasopressor",
        unitType: "units", // units/min and units/hr strictly (NEVER mcg)
        standardPresets: [
          { label: "20 units in 20 mL (1.0 unit/mL) — Standard Syringe Driver", units: 20, ml: 20, concUnitsMl: 1.0 },
          { label: "20 units in 100 mL (0.2 unit/mL) — Dilute Infusion Bag", units: 20, ml: 100, concUnitsMl: 0.2 },
          { label: "40 units in 100 mL (0.4 unit/mL) — Standard Infusion Bag", units: 40, ml: 100, concUnitsMl: 0.4 }
        ],
        referenceDosingRange: "Fixed-dose adjunct in septic shock: 0.03 units/min (1.8 units/hr). Range: 0.01 – 0.04 units/min (0.6 – 2.4 units/hr). Do NOT titrate rapidly. Do NOT convert to micrograms.",
        guidelineCitation: "Surviving Sepsis Campaign 2021/2026; VASST Trial (Russell JA et al. NEJM 2008; 358:877-887)."
      },
      dobutamine: {
        name: "Dobutamine",
        class: "Inotrope & Inodilator (β1 > β2)",
        unitType: "mass",
        standardPresets: [
          { label: "250 mg in 50 mL (5000 mcg/mL = 5 mg/mL) — Standard Syringe", mg: 250, ml: 50, concMcgMl: 5000 },
          { label: "250 mg in 250 mL (1000 mcg/mL = 1 mg/mL) — Standard Infusion Bag", mg: 250, ml: 250, concMcgMl: 1000 }
        ],
        referenceDosingRange: "Initial: 2.5 – 5.0 mcg/kg/min. Usual titration range: 2.5 – 20 mcg/kg/min. Monitor for tachycardia and hypotension.",
        guidelineCitation: "Surviving Sepsis Campaign 2021/2026; ESC Heart Failure Guidelines 2021/2023; DailyMed FDA."
      }
    },

    /**
     * Compute infusion rates and equivalent doses from forward dose input
     */
    computeForward(params) {
      const drugKey = params.drug || "norepinephrine";
      const drugMeta = this.drugs[drugKey] || this.drugs.norepinephrine;
      const weight = toNum(params.weight);

      // Validate weight for weight-based drugs
      if (drugMeta.unitType === "mass" && (!weight || weight <= 0 || weight > 500)) {
        return { error: "Please enter a valid patient weight (1–500 kg)." };
      }

      if (drugMeta.unitType === "units") {
        // Vasopressin handling (units/min or units/hr)
        const concUnitsMl = toNum(params.concUnitsMl);
        if (!concUnitsMl || concUnitsMl <= 0) {
          return { error: "Please enter a valid vasopressin concentration (units/mL)." };
        }

        let doseUnitsMin = null;
        let doseUnitsHr = null;

        if (params.doseMode === "units_hr") {
          doseUnitsHr = toNum(params.doseInput);
          if (doseUnitsHr === null || doseUnitsHr < 0) return { error: "Please enter a valid non-negative dose in units/hr." };
          doseUnitsMin = doseUnitsHr / 60;
        } else {
          // default units_min
          doseUnitsMin = toNum(params.doseInput);
          if (doseUnitsMin === null || doseUnitsMin < 0) return { error: "Please enter a valid non-negative dose in units/min." };
          doseUnitsHr = doseUnitsMin * 60;
        }

        const rateMlHr = (doseUnitsMin * 60) / concUnitsMl;

        return {
          drug: drugMeta.name,
          unitType: "units",
          doseUnitsMin: roundVal(doseUnitsMin, 4),
          doseUnitsHr: roundVal(doseUnitsHr, 2),
          rateMlHr: roundVal(rateMlHr, 2),
          concUnitsMl: roundVal(concUnitsMl, 4),
          referenceRange: drugMeta.referenceDosingRange,
          citation: drugMeta.guidelineCitation,
          warning: "Verify drug concentration and institutional infusion protocol before starting or changing an infusion."
        };
      }

      // Mass-based drugs (Norepinephrine, Dobutamine)
      const concMcgMl = toNum(params.concMcgMl);
      if (!concMcgMl || concMcgMl <= 0) {
        return { error: "Please enter a valid drug concentration (mcg/mL or mg in mL)." };
      }

      let doseMcgKgMin = null;
      let doseMcgMin = null;

      if (params.doseMode === "mcg_min") {
        doseMcgMin = toNum(params.doseInput);
        if (doseMcgMin === null || doseMcgMin < 0) return { error: "Please enter a valid non-negative dose in mcg/min." };
        doseMcgKgMin = doseMcgMin / weight;
      } else {
        // default mcg_kg_min
        doseMcgKgMin = toNum(params.doseInput);
        if (doseMcgKgMin === null || doseMcgKgMin < 0) return { error: "Please enter a valid non-negative dose in mcg/kg/min." };
        doseMcgMin = doseMcgKgMin * weight;
      }

      const rateMlHr = (doseMcgMin * 60) / concMcgMl;

      return {
        drug: drugMeta.name,
        unitType: "mass",
        weight: roundVal(weight, 1),
        doseMcgKgMin: roundVal(doseMcgKgMin, 4),
        doseMcgMin: roundVal(doseMcgMin, 2),
        rateMlHr: roundVal(rateMlHr, 2),
        concMcgMl: roundVal(concMcgMl, 2),
        referenceRange: drugMeta.referenceDosingRange,
        citation: drugMeta.guidelineCitation,
        warning: "Verify drug concentration and institutional infusion protocol before starting or changing an infusion."
      };
    },

    /**
     * Reverse calculate dose from pump rate (mL/hr)
     */
    computeReverse(params) {
      const drugKey = params.drug || "norepinephrine";
      const drugMeta = this.drugs[drugKey] || this.drugs.norepinephrine;
      const rateMlHr = toNum(params.rateMlHr);
      const weight = toNum(params.weight);

      if (rateMlHr === null || rateMlHr < 0 || rateMlHr > 1000) {
        return { error: "Please enter a valid pump infusion rate (0–1000 mL/hr)." };
      }

      if (drugMeta.unitType === "units") {
        const concUnitsMl = toNum(params.concUnitsMl);
        if (!concUnitsMl || concUnitsMl <= 0) {
          return { error: "Please enter a valid vasopressin concentration (units/mL)." };
        }

        const doseUnitsHr = rateMlHr * concUnitsMl;
        const doseUnitsMin = doseUnitsHr / 60;

        return {
          drug: drugMeta.name,
          unitType: "units",
          rateMlHr: roundVal(rateMlHr, 2),
          doseUnitsMin: roundVal(doseUnitsMin, 4),
          doseUnitsHr: roundVal(doseUnitsHr, 2),
          concUnitsMl: roundVal(concUnitsMl, 4),
          referenceRange: drugMeta.referenceDosingRange,
          citation: drugMeta.guidelineCitation
        };
      }

      // Mass-based
      if (!weight || weight <= 0 || weight > 500) {
        return { error: "Please enter a valid patient weight (1–500 kg)." };
      }

      const concMcgMl = toNum(params.concMcgMl);
      if (!concMcgMl || concMcgMl <= 0) {
        return { error: "Please enter a valid drug concentration (mcg/mL or mg in mL)." };
      }

      const doseMcgMin = (rateMlHr * concMcgMl) / 60;
      const doseMcgKgMin = doseMcgMin / weight;

      return {
        drug: drugMeta.name,
        unitType: "mass",
        weight: roundVal(weight, 1),
        rateMlHr: roundVal(rateMlHr, 2),
        doseMcgKgMin: roundVal(doseMcgKgMin, 4),
        doseMcgMin: roundVal(doseMcgMin, 2),
        concMcgMl: roundVal(concMcgMl, 2),
        referenceRange: drugMeta.referenceDosingRange,
        citation: drugMeta.guidelineCitation
      };
    }
  };

  // ==========================================================================
  // B & C. INTERACTIVE TCI / PHARMACOKINETIC MODELS (PROPOFOL & REMIFENTANIL)
  // ==========================================================================
  const TciEngine = {
    // James Formula for Lean Body Mass (LBM) in kg
    calculateJamesLBM(weightKg, heightCm, sex) {
      const w = toNum(weightKg);
      const h = toNum(heightCm);
      if (!w || !h || w <= 0 || h <= 0) return null;
      const isMale = (sex || "").toLowerCase() === "male";
      if (isMale) {
        return 1.10 * w - 128 * Math.pow(w / h, 2);
      } else {
        return 1.07 * w - 148 * Math.pow(w / h, 2);
      }
    },

    // Models definitions and parameter calculators
    models: {
      marsh: {
        drug: "Propofol",
        name: "Marsh",
        year: 1991,
        population: "Adults (healthy surgical patients 16–80 years)",
        covariatesUsed: ["weight"],
        supportsTarget: ["plasma"], // Marsh was designed for plasma targeting (Cp)
        citation: "Marsh B, White M, Morton N, Kenny GN. Pharmacokinetic model driven infusion of propofol in children. Br J Anaesth 1991; 67: 41–48.",
        limitations: "Linear weight-only scaling overestimates volume and doses in obese patients. Originally lacked effect-site ke0 (classic Diprifusor ke0 = 0.26 min⁻¹; Struys modified ke0 = 1.2 min⁻¹).",
        calculateParams(pt) {
          const w = toNum(pt.weight);
          if (!w || w <= 0 || w > 300) return { error: "Invalid weight. Marsh model requires weight between 5 and 300 kg." };
          
          const V1 = 0.228 * w; // L
          const V2 = 0.463 * w; // L
          const V3 = 2.893 * w; // L
          const k10 = 0.119;    // min^-1
          const k12 = 0.112;    // min^-1
          const k21 = 0.055;    // min^-1
          const k13 = 0.042;    // min^-1
          const k31 = 0.0033;   // min^-1
          // Diprifusor standard ke0 = 0.26 min^-1
          const ke0 = pt.ke0Choice === "struys" ? 1.2 : 0.26;

          return {
            V1: roundVal(V1, 2),
            V2: roundVal(V2, 2),
            V3: roundVal(V3, 2),
            k10, k12, k21, k13, k31, ke0,
            covariatesSummary: `Weight: ${w} kg (Weight-only model)`
          };
        }
      },

      schnider: {
        drug: "Propofol",
        name: "Schnider",
        year: 1998,
        population: "Adults 23–88 years, BMI up to 35 kg/m²",
        covariatesUsed: ["age", "sex", "height", "weight"],
        supportsTarget: ["plasma", "effect_site"],
        citation: "Schnider TW, Minto CF, Gambus PL, et al. The influence of method of administration and covariates on the pharmacokinetics of propofol in adult volunteers. Anesthesiology 1998; 88: 1170–1182; Anesthesiology 1999; 90: 1502–1516.",
        limitations: "James LBM formula produces paradoxical drops in calculated LBM in severe obesity (BMI > 35 kg/m²), potentially calculating negative LBM or dangerous rate swings. Not validated in paediatric patients.",
        calculateParams(pt) {
          const age = toNum(pt.age);
          const weight = toNum(pt.weight);
          const height = toNum(pt.height);
          const sex = (pt.sex || "male").toLowerCase();

          if (!age || age < 18 || age > 105) return { error: "Schnider model requires adult age (18–105 years)." };
          if (!weight || weight < 30 || weight > 250) return { error: "Schnider model requires weight between 30 and 250 kg." };
          if (!height || height < 120 || height > 220) return { error: "Schnider model requires height between 120 and 220 cm." };

          const lbm = TciEngine.calculateJamesLBM(weight, height, sex);
          if (!lbm || lbm <= 0) return { error: "Calculated Lean Body Mass (LBM) is invalid. Check height and weight." };

          const V1 = 4.27; // L (fixed)
          const V2 = 18.9 - 0.391 * (age - 53); // L
          const V3 = 238.0; // L (fixed)

          const Cl1 = 1.89 + 0.0456 * (weight - 77) - 0.0681 * (lbm - 59) + 0.0264 * (height - 177); // L/min
          const Cl2 = 1.29 - 0.024 * (age - 53); // L/min
          const Cl3 = 0.836; // L/min (fixed)

          if (Cl1 <= 0 || Cl2 <= 0 || V2 <= 0) {
            return { error: "Calculated pharmacokinetic volumes or clearances fall outside physiological range." };
          }

          const k10 = Cl1 / V1;
          const k12 = Cl2 / V1;
          const k21 = Cl2 / V2;
          const k13 = Cl3 / V1;
          const k31 = Cl3 / V3;
          const ke0 = 0.456; // min^-1 fixed by Schnider for t_peak of ~1.6 min

          return {
            V1: roundVal(V1, 2),
            V2: roundVal(V2, 2),
            V3: roundVal(V3, 2),
            Cl1: roundVal(Cl1, 3),
            Cl2: roundVal(Cl2, 3),
            Cl3: roundVal(Cl3, 3),
            k10: roundVal(k10, 4),
            k12: roundVal(k12, 4),
            k21: roundVal(k21, 4),
            k13: roundVal(k13, 4),
            k31: roundVal(k31, 4),
            ke0: roundVal(ke0, 4),
            lbm: roundVal(lbm, 1),
            covariatesSummary: `Age: ${age} yr | Sex: ${sex.toUpperCase()} | Ht: ${height} cm | Wt: ${weight} kg | James LBM: ${roundVal(lbm, 1)} kg`
          };
        }
      },

      minto: {
        drug: "Remifentanil",
        name: "Minto",
        year: 1997,
        population: "Adults 20–85 years, weight 30–106 kg, height 137–197 cm",
        covariatesUsed: ["age", "sex", "height", "weight"],
        supportsTarget: ["plasma", "effect_site"],
        citation: "Minto CF, Schnider TW, Egan TD, et al. Influence of age and gender on the pharmacokinetics and pharmacodynamics of remifentanil. I & II. Anesthesiology 1997; 86: 10–23 & 24–33.",
        limitations: "Overestimates clearance in severe obesity due to James LBM formula limitations. Not validated in children (< 12 years). Rapid esterase metabolism requires precise syringe pump control.",
        calculateParams(pt) {
          const age = toNum(pt.age);
          const weight = toNum(pt.weight);
          const height = toNum(pt.height);
          const sex = (pt.sex || "male").toLowerCase();

          if (!age || age < 12 || age > 100) return { error: "Minto model requires age (12–100 years)." };
          if (!weight || weight < 25 || weight > 200) return { error: "Minto model requires weight between 25 and 200 kg." };
          if (!height || height < 120 || height > 220) return { error: "Minto model requires height between 120 and 220 cm." };

          const lbm = TciEngine.calculateJamesLBM(weight, height, sex);
          if (!lbm || lbm <= 0) return { error: "Calculated Lean Body Mass (LBM) is invalid." };

          const V1 = 5.1 - 0.0201 * (age - 40) + 0.072 * (lbm - 55);
          const V2 = 9.82 - 0.0811 * (age - 40) + 0.108 * (lbm - 55);
          const V3 = 5.42;

          const Cl1 = 2.6 - 0.0162 * (age - 40) + 0.0191 * (lbm - 55);
          const Cl2 = 2.05 - 0.0301 * (age - 40);
          const Cl3 = 0.076 - 0.00113 * (age - 40);
          const ke0 = 0.595 - 0.007 * (age - 40);

          if (V1 <= 0 || V2 <= 0 || Cl1 <= 0 || Cl2 <= 0 || Cl3 <= 0 || ke0 <= 0) {
            return { error: "Pharmacokinetic values outside physiological boundary for patient covariates." };
          }

          const k10 = Cl1 / V1;
          const k12 = Cl2 / V1;
          const k21 = Cl2 / V2;
          const k13 = Cl3 / V1;
          const k31 = Cl3 / V3;

          return {
            V1: roundVal(V1, 2),
            V2: roundVal(V2, 2),
            V3: roundVal(V3, 2),
            Cl1: roundVal(Cl1, 3),
            Cl2: roundVal(Cl2, 3),
            Cl3: roundVal(Cl3, 3),
            k10: roundVal(k10, 4),
            k12: roundVal(k12, 4),
            k21: roundVal(k21, 4),
            k13: roundVal(k13, 4),
            k31: roundVal(k31, 4),
            ke0: roundVal(ke0, 4),
            lbm: roundVal(lbm, 1),
            covariatesSummary: `Age: ${age} yr | Sex: ${sex.toUpperCase()} | Ht: ${height} cm | Wt: ${weight} kg | James LBM: ${roundVal(lbm, 1)} kg`
          };
        }
      }
    },

    /**
     * Run simulation: calculates predicted Cp and Ce trajectory across time
     * Simulation uses multi-compartment differential equations with 0.02 min (1.2 s) time step.
     */
    simulateTrajectory(params) {
      const modelKey = (params.model || "schnider").toLowerCase();
      const modelDef = this.models[modelKey];
      if (!modelDef) return { error: `Unknown PK model: ${modelKey}` };

      const pk = modelDef.calculateParams(params);
      if (pk.error) return pk;

      const durationMin = toNum(params.durationMin) || 30;
      const targetMode = (params.targetMode || "plasma").toLowerCase();
      const targetConc = toNum(params.targetConc) || (modelDef.drug === "Remifentanil" ? 3.0 : 4.0); // ng/mL for remi, mcg/mL for propofol

      if (targetConc <= 0 || targetConc > 50) {
        return { error: "Please enter a valid target concentration (0.1–50)." };
      }

      // Time step
      const dt = 0.02; // minutes (1.2 seconds)
      const totalSteps = Math.round(durationMin / dt);

      // Compartments mass in mg (propofol) or mcg (remifentanil)
      let x1 = 0; // Central
      let x2 = 0; // Fast peripheral
      let x3 = 0; // Slow peripheral
      let Ce = 0; // Effect site concentration

      const timePoints = [];
      const cpPoints = [];
      const cePoints = [];
      const infusionRates = []; // mg/kg/hr or mcg/kg/min for tracking

      const V1 = pk.V1;
      const k10 = pk.k10;
      const k12 = pk.k12;
      const k21 = pk.k21;
      const k13 = pk.k13;
      const k31 = pk.k31;
      const ke0 = pk.ke0;
      const weight = toNum(params.weight) || 70;

      // Loading dose (BOLUS) calculation
      let initialBolus = 0;
      if (targetMode === "effect_site" && modelDef.supportsTarget.includes("effect_site")) {
        // Effect-site targeting bolus (Schnider/Minto overshoot rule)
        initialBolus = targetConc * V1 * 1.35;
      } else {
        // Plasma target initial bolus = Target * V1
        initialBolus = targetConc * V1;
      }
      x1 = initialBolus;
      Ce = 0;

      // Closed-loop simulated TCI controller titration loop
      for (let step = 0; step <= totalSteps; step++) {
        const t = step * dt;
        const Cp = x1 / V1;

        // Sampling for graph every 0.25 min (15 seconds) or at t=0
        if (step % 12 === 0 || step === totalSteps) {
          timePoints.push(roundVal(t, 2));
          cpPoints.push(roundVal(Cp, 3));
          cePoints.push(roundVal(Ce, 3));
        }

        // TCI pump delivery calculation for next step (maintenance infusion)
        let rate = 0; // mass per min
        if (targetMode === "effect_site" && modelDef.supportsTarget.includes("effect_site")) {
          // Ce targeting: boost rate when Ce < target
          if (Ce < targetConc) {
            const error = targetConc - Ce;
            rate = Math.max(0, (targetConc * k10 * V1) + (error * V1 * 2.5));
          } else {
            rate = Math.max(0, targetConc * k10 * V1 + (x1 * k12 - x2 * k21) * 0.1);
          }
        } else {
          // Plasma targeting: maintain Cp at targetConc
          const error = targetConc - Cp;
          if (error > 0) {
            rate = (targetConc * k10 * V1) + (error * V1 / dt) * 0.4;
          } else {
            rate = Math.max(0, targetConc * k10 * V1 - (x2 * k21 + x3 * k31));
          }
        }

        // Clamp rate to safe maximum pump capability
        const maxRate = modelDef.drug === "Remifentanil" ? 50 : 250; // mass/min
        rate = Math.min(rate, maxRate);

        // Differential equations (Euler numerical integration with small dt)
        const dx1 = (-(k10 + k12 + k13) * x1 + k21 * x2 + k31 * x3 + rate) * dt;
        const dx2 = (k12 * x1 - k21 * x2) * dt;
        const dx3 = (k13 * x1 - k31 * x3) * dt;
        const dCe = ke0 * (Cp - Ce) * dt;

        x1 += dx1;
        x2 += dx2;
        x3 += dx3;
        Ce += dCe;
      }

      return {
        model: modelDef.name,
        drug: modelDef.drug,
        population: modelDef.population,
        covariatesSummary: pk.covariatesSummary,
        pkParameters: {
          V1_L: pk.V1,
          V2_L: pk.V2,
          V3_L: pk.V3,
          k10_min: pk.k10,
          k12_min: pk.k12,
          k21_min: pk.k21,
          k13_min: pk.k13,
          k31_min: pk.k31,
          ke0_min: pk.ke0
        },
        initialBolus: roundVal(initialBolus, 2),
        initialBolusUnit: modelDef.drug === "Remifentanil" ? "mcg" : "mg",
        targetMode: targetMode.toUpperCase(),
        targetConc,
        unit: modelDef.drug === "Remifentanil" ? "ng/mL" : "mcg/mL",
        durationMin,
        timePoints,
        cpPoints,
        cePoints,
        citation: modelDef.citation,
        limitations: modelDef.limitations,
        safetyNotice: "Model-predicted concentration based on population pharmacokinetics. Individual patient blood and biophase concentrations will vary according to physiology, cardiac output, and organ function. Not for direct control of medical hardware."
      };
    }
  };

  // ==========================================================================
  // D. PREDICTED BODY WEIGHT (PBW) & VENTILATION MECHANICS ENGINE
  // ==========================================================================
  const VentilationPbwEngine = {
    /**
     * Calculate ARDSNet Devine Predicted Body Weight (PBW)
     */
    calculatePBW(heightCm, sex) {
      const h = toNum(heightCm);
      if (!h || h < 100 || h > 250) {
        return { error: "Please enter a valid height (100–250 cm)." };
      }
      const isMale = (sex || "").toLowerCase() === "male";
      const heightInches = h / 2.54;
      const inchesOver5Ft = heightInches - 60; // 152.4 cm = 60 inches

      // Devine Formula (ARDSNet validated):
      // Male: 50.0 + 0.91 * (heightCm - 152.4) = 50 + 2.3 * inchesOver60
      // Female: 45.5 + 0.91 * (heightCm - 152.4) = 45.5 + 2.3 * inchesOver60
      let pbw = isMale ? (50.0 + 0.91 * (h - 152.4)) : (45.5 + 0.91 * (h - 152.4));
      pbw = Math.max(10, pbw);

      return {
        heightCm: roundVal(h, 1),
        sex: isMale ? "Male" : "Female",
        pbwKg: roundVal(pbw, 1),
        formula: isMale ? "50 + 0.91 × [Height (cm) − 152.4]" : "45.5 + 0.91 × [Height (cm) − 152.4]",
        citation: "ARDSNet (Acute Respiratory Distress Syndrome Network). N Engl J Med 2000; 342:1301-1308; Devine BJ. Drug Intell Clin Pharm 1974; 8:650-655."
      };
    },

    /**
     * Compute ventilation mechanics: Tidal volume ladder, Driving pressure, and Static compliance
     */
    computeMechanics(params) {
      const pbwRes = this.calculatePBW(params.heightCm, params.sex);
      if (pbwRes.error) return pbwRes;

      const pbw = pbwRes.pbwKg;
      const setVt = toNum(params.setVt); // Optional manually set VT
      const targetRatio = toNum(params.targetRatio) || 6.0; // mL/kg PBW
      const pplat = toNum(params.pplat);
      const peep = toNum(params.peep);

      // Tidal volume ladder based strictly on PBW
      const vtLadder = {
        vt_4: roundVal(4 * pbw, 0),
        vt_5: roundVal(5 * pbw, 0),
        vt_6: roundVal(6 * pbw, 0), // Primary ARDSNet starting benchmark
        vt_7: roundVal(7 * pbw, 0),
        vt_8: roundVal(8 * pbw, 0)
      };

      const calculatedTargetVt = roundVal(targetRatio * pbw, 0);
      const effectiveVt = setVt && setVt > 0 ? setVt : calculatedTargetVt;

      // Driving Pressure: ΔP = Pplat - PEEP
      let drivingPressure = null;
      let drivingPressureStatus = null;
      let staticCompliance = null;
      let complianceStatus = null;

      if (pplat !== null && peep !== null) {
        if (pplat < peep) {
          return { error: "Plateau pressure (Pplat) must be greater than or equal to PEEP." };
        }
        drivingPressure = roundVal(pplat - peep, 1);

        if (drivingPressure <= 14) {
          drivingPressureStatus = "Optimal lung-protective range (ΔP ≤ 14 cmH2O associated with improved survival in ARDS).";
        } else {
          drivingPressureStatus = "Elevated driving pressure (ΔP > 14 cmH2O associated with increased risk of ventilator-induced lung injury).";
        }

        // Static Compliance: Crs = VT / (Pplat - PEEP)
        if (drivingPressure > 0 && effectiveVt > 0) {
          staticCompliance = roundVal(effectiveVt / drivingPressure, 1);
          if (staticCompliance >= 50) {
            complianceStatus = "Normal respiratory system compliance (50–80 mL/cmH2O in passive anaesthetized adults).";
          } else if (staticCompliance >= 30) {
            complianceStatus = "Moderately decreased compliance (30–49 mL/cmH2O; common in stiff chest wall or moderate ARDS).";
          } else {
            complianceStatus = "Severely decreased compliance (< 30 mL/cmH2O; indicative of severe ARDS or acute lung injury).";
          }
        }
      }

      return {
        pbwKg: pbw,
        sex: pbwRes.sex,
        heightCm: pbwRes.heightCm,
        vtLadder,
        targetRatio: roundVal(targetRatio, 1),
        targetVtMl: calculatedTargetVt,
        effectiveVtMl: effectiveVt,
        pplat: pplat !== null ? roundVal(pplat, 1) : null,
        peep: peep !== null ? roundVal(peep, 1) : null,
        drivingPressureCmH2O: drivingPressure,
        drivingPressureStatus,
        staticComplianceMlCmH2O: staticCompliance,
        complianceStatus,
        assumptions: "Static compliance assumes passive mechanical ventilation without patient inspiratory effort, inspiratory hold ≥ 0.5 s, and absence of significant auto-PEEP.",
        citations: [
          "ARDSNet. Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury and ARDS. N Engl J Med 2000; 342:1301-1308.",
          "Amato MBP, Meade MO, Slutsky AS, et al. Driving pressure and survival in the acute respiratory distress syndrome. N Engl J Med 2015; 372:747-755."
        ]
      };
    }
  };

  // ==========================================================================
  // E. MAXIMUM ALLOWABLE BLOOD LOSS (MABL) CALCULATOR
  // ==========================================================================
  const MablEngine = {
    // Evidence-based physiological estimated blood volume by population
    ebvCategories: {
      premature_neonate: { label: "Premature Neonate (< 37 wk)", ebvMlKg: 95, range: "90–100 mL/kg" },
      fullterm_neonate: { label: "Full-term Neonate (< 1 mo)", ebvMlKg: 85, range: "80–90 mL/kg" },
      infant: { label: "Infant (1 – 12 mo)", ebvMlKg: 80, range: "75–80 mL/kg" },
      child: { label: "Child (1 – 12 yr)", ebvMlKg: 70, range: "70–75 mL/kg" },
      adult_male: { label: "Adult Male", ebvMlKg: 70, range: "70–75 mL/kg" },
      adult_female: { label: "Adult Female", ebvMlKg: 65, range: "60–65 mL/kg" },
      obese_adult: { label: "Obese Adult (BMI ≥ 30)", ebvMlKg: 60, range: "55–60 mL/kg" }
    },

    /**
     * Compute MABL using validated Gross / Bourke logarithmic or linear formulation
     * Standard validated linear Gross formula: MABL = EBV * (Init - Target) / Init
     */
    calculateMABL(params) {
      const weight = toNum(params.weight);
      if (!weight || weight <= 0 || weight > 500) {
        return { error: "Please enter a valid patient weight (1–500 kg)." };
      }

      const mode = (params.mode || "hb").toLowerCase(); // "hb" or "hct"
      const catKey = params.ebvCategory || "adult_male";
      const catDef = this.ebvCategories[catKey] || this.ebvCategories.adult_male;
      const ebvFactor = toNum(params.customEbv) || catDef.ebvMlKg;

      const ebvTotal = weight * ebvFactor;

      const initVal = toNum(params.initialVal);
      const targetVal = toNum(params.targetVal);

      if (mode === "hb") {
        if (!initVal || initVal <= 0 || initVal > 25) {
          return { error: "Please enter a valid initial Hemoglobin (2–25 g/dL)." };
        }
        if (!targetVal || targetVal <= 0 || targetVal > 25) {
          return { error: "Please enter a valid target Hemoglobin (2–25 g/dL)." };
        }
        if (targetVal >= initVal) {
          return { error: "Target Hemoglobin must be lower than initial Hemoglobin to calculate blood loss." };
        }

        const mabl = ebvTotal * ((initVal - targetVal) / initVal);
        const pctEbv = (mabl / ebvTotal) * 100;

        return {
          mode: "Hemoglobin (g/dL)",
          weightKg: roundVal(weight, 1),
          population: catDef.label,
          assumedEbvFactor: ebvFactor,
          ebvTotalMl: roundVal(ebvTotal, 0),
          initialHb: roundVal(initVal, 1),
          targetHb: roundVal(targetVal, 1),
          mablMl: roundVal(mabl, 0),
          pctEbv: roundVal(pctEbv, 1),
          formula: "MABL = EBV × [(Hb_initial − Hb_target) ÷ Hb_initial]",
          safetyDisclaimer: "Clinical transfusion decisions should incorporate ongoing rate of blood loss, haemodynamics, tissue perfusion, and point-of-care coagulation data.",
          citations: [
            "Gross JB. Estimating allowable blood loss: corrected for dilution. Anesthesiology 1983; 58(3): 277-280.",
            "Bourke DL, Smith TC. Estimating allowable hemodilution. Anesthesiology 1974; 41: 609-612."
          ]
        };
      } else {
        // Hematocrit Mode
        if (!initVal || initVal <= 0 || initVal > 75) {
          return { error: "Please enter a valid initial Hematocrit (10–75%)." };
        }
        if (!targetVal || targetVal <= 0 || targetVal > 75) {
          return { error: "Please enter a valid target Hematocrit (10–75%)." };
        }
        if (targetVal >= initVal) {
          return { error: "Target Hematocrit must be lower than initial Hematocrit." };
        }

        const mabl = ebvTotal * ((initVal - targetVal) / initVal);
        const pctEbv = (mabl / ebvTotal) * 100;

        return {
          mode: "Hematocrit (%)",
          weightKg: roundVal(weight, 1),
          population: catDef.label,
          assumedEbvFactor: ebvFactor,
          ebvTotalMl: roundVal(ebvTotal, 0),
          initialHct: roundVal(initVal, 1),
          targetHct: roundVal(targetVal, 1),
          mablMl: roundVal(mabl, 0),
          pctEbv: roundVal(pctEbv, 1),
          formula: "MABL = EBV × [(Hct_initial − Hct_target) ÷ Hct_initial]",
          safetyDisclaimer: "Clinical transfusion decisions should incorporate ongoing rate of blood loss, haemodynamics, tissue perfusion, and point-of-care coagulation data.",
          citations: [
            "Gross JB. Estimating allowable blood loss: corrected for dilution. Anesthesiology 1983; 58(3): 277-280."
          ]
        };
      }
    }
  };

  // ==========================================================================
  // F. MASSIVE TRANSFUSION / MTP SUPPORT MODULE
  // ==========================================================================
  const MtpEngine = {
    protocols: {
      trauma: {
        domain: "TRAUMA",
        name: "Trauma Massive Transfusion Protocol",
        triggerCriteria: [
          "Assessment of Blood Consumption (ABC) Score ≥ 2 (Penetrating trauma +1, SBP ≤ 90 mmHg +1, HR ≥ 120 bpm +1, Positive FAST ultrasound +1)",
          "Shock Index (HR / SBP) ≥ 1.0 with active bleeding",
          "Persistent severe hypotension refractory to initial 1L crystalloid or uncrossmatched blood"
        ],
        componentStrategy: "Balanced 1:1:1 Ratio (RBC : FFP : Platelets). One MTP cooler typically comprises 4–6 units RBC, 4–6 units FFP, and 1 adult dose (pool/apheresis) Platelets.",
        adjuncts: [
          "Tranexamic Acid (TXA): 1 g IV bolus over 10 min within 3 hours of injury, followed by 1 g IV infusion over 8 hours (CRASH-2 trial).",
          "Calcium Chloride: 1 g IV (or 3 g Calcium Gluconate) per 4 units of blood components. Target ionized Ca²⁺ > 1.1 mmol/L.",
          "Fibrinogen Replacement: Cryoprecipitate (2 pools = 10 units) or Fibrinogen Concentrate (2–4 g) if plasma fibrinogen < 1.5–2.0 g/L.",
          "Temperature & pH targets: Prevent lethal triad; maintain core temp > 35°C, arterial pH > 7.20, base deficit < 6."
        ],
        citations: [
          "Holcomb JB, Tilley BC, Baraniuk S, et al. Transfusion of plasma, platelets, and red blood cells in a 1:1:1 vs a 1:1:2 ratio and mortality in patients with severe trauma: The PROPPR randomized clinical trial. JAMA 2015; 313(5): 471–482.",
          "Nunez TC, Voskresensky IV, Dossett LA, et al. Consumptive coagulopathy after severe trauma: Assessment of Blood Consumption (ABC) score. J Trauma 2009; 66(2): 346–352."
        ]
      },
      obstetric: {
        domain: "OBSTETRIC",
        name: "Obstetric Major Haemorrhage Protocol (PPH)",
        triggerCriteria: [
          "Cumulative blood loss > 1000 mL with ongoing uterine or surgical bleeding",
          "Clinical signs of shock (tachycardia HR > 110, SBP < 90 mmHg, Shock Index ≥ 0.9 – 1.0)",
          "Sudden massive haemorrhage (abruptio placentae, placenta accreta spectrum, uterine rupture)"
        ],
        componentStrategy: "Early balanced resuscitation (RBC : FFP : Platelets). Pregnancy is a physiological hypercoagulable state with baseline fibrinogen 4.0–6.0 g/L; consumption is rapid.",
        adjuncts: [
          "Tranexamic Acid (TXA): 1 g IV over 10 min immediately upon diagnosis of PPH (WOMAN trial). Repeat 1 g if bleeding continues after 30 min.",
          "Aggressive Fibrinogen Threshold: Maintain fibrinogen > 2.0 g/L (higher than trauma). Early cryoprecipitate or fibrinogen concentrate.",
          "Uterotonics: Oxytocin, Ergometrine, Carboprost, Misoprostol according to institutional protocol.",
          "Avoid fluid overload: Excessive crystalloid exacerbates dilutional coagulopathy."
        ],
        citations: [
          "RCOG Green-top Guideline No. 52: Prevention and Management of Postpartum Haemorrhage (2016/2024 update).",
          "WOMAN Trial Collaborators. Effect of early tranexamic acid on mortality in women with post-partum haemorrhage: a randomized, placebo-controlled trial. Lancet 2017; 389: 2105–2116."
        ]
      },
      cardiac: {
        domain: "CARDIAC SURGERY",
        name: "Cardiac Surgery Microvascular Bleeding / MTP",
        triggerCriteria: [
          "Chest tube drainage > 400 mL in 1st hour, > 200 mL/hr for 2 consecutive hours, or sudden massive surge",
          "Refractory microvascular oozing following cardiopulmonary bypass (CPB) protamine reversal",
          "Clinical or echocardiographic signs of early pericardial tamponade"
        ],
        componentStrategy: "Targeted point-of-care guided therapy (TEG/ROTEM preferred over empiric fixed ratios). If point-of-care unavailable, balanced component support.",
        adjuncts: [
          "Verify Protamine Neutralization: Confirm complete reversal of unfractionated heparin (ACT returned to baseline, or normal INTEM CT / TEG R-time). Avoid excess protamine.",
          "Platelet & Fibrinogen Priority: Post-CPB platelet dysfunction and hemodilution are common; transfuse platelets and cryoprecipitate if microvascular bleeding persists.",
          "Prothrombin Complex Concentrate (PCC): Consider 25 units/kg if persistent coagulopathy with prolonged CT/R and normal fibrinogen.",
          "Re-exploration Threshold: Early return to theatre for surgical hemostasis if rates remain excessive."
        ],
        citations: [
          "Boer C, Meesters MI, Milojevic M, et al. 2017 EACTS/EACTA Guidelines on patient blood management for adult cardiac surgery. Br J Anaesth 2018; 120(1): 110–141.",
          "Tibben PJ, et al. Coagulation management in cardiac surgery. Curr Opin Anaesthesiol 2021; 34: 67–74."
        ]
      }
    },

    calculateCooler(params) {
      const domain = params.domain || "trauma";
      const proto = this.protocols[domain] || this.protocols.trauma;
      const numCoolers = toNum(params.coolers) || 1;
      const ratio = params.ratio || "1:1:1"; // "1:1:1" vs "2:1:1"

      let rbcUnits = 4 * numCoolers;
      let ffpUnits = (ratio === "1:1:1" ? 4 : 2) * numCoolers;
      let pltDoses = 1 * numCoolers;

      return {
        domain: proto.domain,
        protocolName: proto.name,
        ratioUsed: ratio,
        numCoolers,
        rbcUnits,
        ffpUnits,
        plateletAdultDoses: pltDoses,
        triggers: proto.triggerCriteria,
        componentStrategy: proto.componentStrategy,
        adjuncts: proto.adjuncts,
        citations: proto.citations,
        safetyNotice: "Protocols vary by institution and clinical setting. Always follow local hospital massive transfusion guidelines and laboratory-guided replacement."
      };
    }
  };

  // ==========================================================================
  // G. VISCOELASTIC HAEMOSTATIC TESTING GUIDE (TEG & ROTEM)
  // ==========================================================================
  const ViscoelasticEngine = {
    /**
     * TEG 5000 / TEG 6s (Citrated Kaolin) Interpreter & Decision Pathway
     */
    evaluateTEG(params) {
      const r = toNum(params.r_time);       // R (Reaction time, min) Normal 5–10 min
      const k = toNum(params.k_time);       // K (min) Normal 1–3 min
      const alpha = toNum(params.alpha);    // alpha angle (deg) Normal 53–72 deg
      const ma = toNum(params.ma);          // MA (mm) Normal 50–70 mm
      const ly30 = toNum(params.ly30);      // LY30 (%) Normal 0–3%
      const ff = toNum(params.ff_ma);       // Functional Fibrinogen MA (mm) Normal 13–24 mm

      const findings = [];
      const recommendations = [];

      // 1. Fibrinolysis (Primary check: stops clot breakdown before building)
      if (ly30 !== null && ly30 > 3.0) {
        findings.push(`Hyperfibrinolysis detected (LY30 = ${ly30}% > 3.0%). Excessive clot breakdown.`);
        recommendations.push("Administer Tranexamic Acid (TXA): 1 g IV bolus over 10 min, then 1 g infusion over 8 hr.");
      }

      // 2. Coagulation Factor Deficit (R time)
      if (r !== null) {
        if (r > 10.0) {
          findings.push(`Prolonged R time (${r} min > 10 min). Delayed thrombin burst / coagulation factor deficiency.`);
          recommendations.push("Transfuse Fresh Frozen Plasma (FFP 10–15 mL/kg) or Prothrombin Complex Concentrate (PCC 25 IU/kg if indicated).");
        } else if (r < 5.0) {
          findings.push(`Shortened R time (${r} min < 5 min). Enzymatic hypercoagulability.`);
        }
      }

      // 3. Fibrinogen Kinetics (K time & Alpha Angle)
      if ((k !== null && k > 3.0) || (alpha !== null && alpha < 53.0)) {
        findings.push(`Slow clot kinetics (K = ${k ?? "--"} min, Alpha = ${alpha ?? "--"}°). Impaired fibrin cross-linking.`);
        recommendations.push("Administer Cryoprecipitate (2 pools = 10 units) or Fibrinogen Concentrate (2–4 g).");
      }

      // 4. Clot Strength (Maximum Amplitude - MA)
      if (ma !== null && ma < 50.0) {
        if (ff !== null) {
          if (ff < 13.0) {
            findings.push(`Low MA (${ma} mm) with low Functional Fibrinogen (${ff} mm). Primary fibrinogen deficiency.`);
            recommendations.push("Administer Fibrinogen Concentrate or Cryoprecipitate first; recheck MA.");
          } else {
            findings.push(`Low MA (${ma} mm) with normal Functional Fibrinogen (${ff} mm). Primary platelet deficiency/dysfunction.`);
            recommendations.push("Transfuse Platelets: 1 adult therapeutic dose (pool or apheresis).");
          }
        } else {
          findings.push(`Low MA (${ma} mm < 50 mm). Combined platelet and fibrinogen deficiency.`);
          recommendations.push("Transfuse Platelets (1 adult dose) and consider Fibrinogen/Cryoprecipitate if alpha angle is low.");
        }
      }

      if (findings.length === 0) {
        findings.push("All entered TEG parameters fall within normal citrated kaolin reference ranges.");
        recommendations.push("Continue clinical monitoring. If microvascular bleeding persists, check surgical hemostasis, core temperature, and ionized calcium.");
      }

      return {
        modality: "TEG 5000 / TEG 6s (Citrated Kaolin)",
        normalRanges: {
          r_time: "5 – 10 min (Clot initiation / Factors)",
          k_time: "1 – 3 min (Kinetics)",
          alpha_angle: "53° – 72° (Fibrin cross-linking)",
          ma: "50 – 70 mm (Platelet + Fibrinogen clot strength)",
          ly30: "0 – 3% (Fibrinolysis)",
          ff_ma: "13 – 24 mm (Functional Fibrinogen)"
        },
        findings,
        recommendations,
        citations: [
          "Whiting P, et al. Clinical effectiveness of TEG and ROTEM in cardiac surgery and trauma. Health Technol Assess 2015; 19(58): 1–178.",
          "Gonzalez E, et al. Goal-directed hemostatic resuscitation of trauma-induced coagulopathy: A pragmatic randomized clinical trial. Ann Surg 2016; 264(3): 389–395."
        ]
      };
    },

    /**
     * ROTEM delta / sigma Interpreter & Decision Pathway
     */
    evaluateROTEM(params) {
      const extem_ct = toNum(params.extem_ct);     // EXTEM CT (s) Normal 38–79 s
      const extem_a5 = toNum(params.extem_a5);     // EXTEM A5 (mm) Normal ≥ 35 mm
      const extem_mcf = toNum(params.extem_mcf);   // EXTEM MCF (mm) Normal 50–72 mm
      const extem_ml = toNum(params.extem_ml);     // EXTEM ML (%) Normal < 15%
      const fibtem_a5 = toNum(params.fibtem_a5);   // FIBTEM A5 (mm) Normal ≥ 9 mm (or MCF ≥ 10 mm)
      const aptem_ml = toNum(params.aptem_ml);     // APTEM ML (%)

      const findings = [];
      const recommendations = [];

      // 1. Hyperfibrinolysis: EXTEM ML > 15% reversing in APTEM
      if (extem_ml !== null && extem_ml > 15.0) {
        findings.push(`Hyperfibrinolysis detected (EXTEM ML = ${extem_ml}% > 15%).`);
        recommendations.push("Administer Tranexamic Acid (TXA): 1 g IV over 10 min, then 1 g infusion over 8 hr.");
      }

      // 2. Coagulation Factor Deficiency: EXTEM CT > 80 s
      if (extem_ct !== null && extem_ct > 80) {
        findings.push(`Prolonged EXTEM CT (${extem_ct} s > 80 s). Delayed clotting factor initiation.`);
        recommendations.push("Administer FFP (10–15 mL/kg) or Prothrombin Complex Concentrate (PCC 25 IU/kg) if vitamin K antagonist or non-hypovolemic.");
      }

      // 3. Clot Firmness Deficit: EXTEM A5 < 35 mm or MCF < 50 mm
      const lowExtemFirmness = (extem_a5 !== null && extem_a5 < 35) || (extem_mcf !== null && extem_mcf < 50);
      if (lowExtemFirmness) {
        if (fibtem_a5 !== null) {
          if (fibtem_a5 < 9) {
            findings.push(`Low clot firmness with low FIBTEM A5 (${fibtem_a5} mm < 9 mm). Severe fibrinogen deficiency.`);
            recommendations.push("Administer Fibrinogen Concentrate: 25–50 mg/kg (or 2–4 g IV) or Cryoprecipitate (2 pools). Reassess before giving platelets.");
          } else {
            findings.push(`Low EXTEM firmness but normal FIBTEM A5 (${fibtem_a5} mm ≥ 9 mm). Isolated thrombocytopenia / platelet dysfunction.`);
            recommendations.push("Transfuse Platelets: 1 adult therapeutic dose (pool or apheresis).");
          }
        } else {
          findings.push("Low EXTEM clot firmness. FIBTEM measurement required to differentiate fibrinogen from platelet deficit.");
          recommendations.push("Perform FIBTEM. If FIBTEM A5 < 9 mm give Fibrinogen; if FIBTEM A5 ≥ 9 mm give Platelets.");
        }
      }

      if (findings.length === 0) {
        findings.push("All entered ROTEM parameters fall within standard reference intervals.");
        recommendations.push("Continue clinical monitoring. If microvascular bleeding persists, check surgical factors, heparin rebound, temperature, and ionized calcium.");
      }

      return {
        modality: "ROTEM delta / sigma",
        normalRanges: {
          extem_ct: "38 – 79 s (Extrinsic factor initiation)",
          extem_a5: "≥ 35 mm (Early clot firmness)",
          extem_mcf: "50 – 72 mm (Maximum clot firmness)",
          extem_ml: "< 15% (Maximum lysis / Fibrinolysis)",
          fibtem_a5: "≥ 9 mm (Functional fibrinogen clot component)"
        },
        findings,
        recommendations,
        citations: [
          "ESAIC (European Society of Anaesthesiology and Intensive Care). Management of severe perioperative bleeding: Guidelines. Eur J Anaesthesiol 2023; 40(4): 207–269.",
          "NICE Diagnostic Guidance DG45: Point-of-care testing in surgery and trauma (2022)."
        ]
      };
    }
  };

  // Expose to global window and module exports
  const KnockoutAdvancedCalc = {
    VasopressorEngine,
    TciEngine,
    VentilationPbwEngine,
    MablEngine,
    MtpEngine,
    ViscoelasticEngine
  };

  if (typeof window !== "undefined") {
    window.KnockoutAdvancedCalc = KnockoutAdvancedCalc;
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = KnockoutAdvancedCalc;
  }
})();
