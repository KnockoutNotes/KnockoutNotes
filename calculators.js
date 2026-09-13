/**
 * KnockoutNotes — Anaesthesia Calculators Engine
 * Evidence-based mathematical implementations of all clinical calculators.
 * 
 * Sources:
 * - BMI: World Health Organization (WHO) Technical Report Series 894, 2000.
 * - METs: 2014 ACC/AHA & 2022 ESC/ESAIC Perioperative Cardiovascular Guidelines.
 * - DASI: Hlatky MA et al. Am J Cardiol. 1989;64(10):651-654; Wijeysundera DN et al. Lancet 2018;391:2631-2640.
 * - STOP-Bang: Chung F et al. Anesthesiology 2008;108:812-821; Br J Anaesth 2012;108:768-775.
 * - Cockcroft-Gault: Cockcroft DW, Gault MH. Nephron 1976;16:31-41; Devine BJ. Drug Intell Clin Pharm 1974;8:650-655.
 * - Anion Gap: Emmett M, Narins RG. Medicine 1977;56:38-54; Figge J et al. Crit Care Med 1998;26:1807-1810.
 * - Winter's Formula: Albert MS, Dell RB, Winters RW. Ann Intern Med. 1967;66(2):312-322.
 * - Delta Gap/Ratio: Wrenn K. Ann Emerg Med 1990;19:1310-1313.
 * - Parkland Formula: Baxter CR, Shires T. Ann NY Acad Sci 1968;150:874-894.
 *
 * Educational aid only. Not a substitute for clinical judgment or institutional protocols.
 */

(function () {
  "use strict";

  const num = (v) => {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  };

  const round = (v, d = 1) => {
    if (v === null || v === undefined || isNaN(v)) return null;
    const f = Math.pow(10, d);
    return Math.round(v * f) / f;
  };

  // ==========================================================================
  // 1. BMI CALCULATOR
  // ==========================================================================
  function calculateBMI(weightKg, heightCm) {
    const wt = num(weightKg);
    const ht = num(heightCm);
    if (!wt || !ht || wt <= 0 || ht <= 0) {
      return { error: "Please enter valid positive weight and height values." };
    }
    const heightM = ht / 100;
    const bmi = wt / (heightM * heightM);

    let category = "";
    let riskClass = "";
    if (bmi < 18.5) {
      category = "Underweight";
      riskClass = "warn";
    } else if (bmi < 25.0) {
      category = "Normal weight";
      riskClass = "good";
    } else if (bmi < 30.0) {
      category = "Overweight (Pre-obesity)";
      riskClass = "warn";
    } else if (bmi < 35.0) {
      category = "Obese Class I (Moderate)";
      riskClass = "alert";
    } else if (bmi < 40.0) {
      category = "Obese Class II (Severe)";
      riskClass = "alert";
    } else {
      category = "Obese Class III (Very severe / Morbid)";
      riskClass = "alert";
    }

    return {
      bmi: round(bmi, 1),
      category,
      riskClass,
      formula: "Weight (kg) ÷ [Height (m)]²",
      classificationSystem: "WHO International Adult BMI Classification",
      paediatricAlert: "Intended for adults (≥18 years). Paediatric BMI requires age- and sex-specific percentile growth charts."
    };
  }

  // ==========================================================================
  // 2. METS FUNCTIONAL CAPACITY
  // ==========================================================================
  function calculateMETs(activityLevel) {
    // activityLevel key: 'poor', 'moderate', 'good', 'excellent'
    const profiles = {
      poor: {
        range: "< 4 METs",
        label: "Poor Functional Capacity",
        risk: "Elevated Perioperative Cardiovascular Risk",
        riskClass: "alert",
        benchmarks: "Cannot walk 2 blocks on level ground or climb 1 flight of stairs without stopping. Unable to perform light vacuuming or yard work.",
        anaestheticConsiderations: "Preoperative ECG and echocardiography often warranted for intermediate-to-high risk surgery. Consider cardiopulmonary exercise testing (CPET) or cardiology referral."
      },
      moderate: {
        range: "4 – 6 METs",
        label: "Moderate Functional Capacity",
        risk: "Intermediate Functional Reserve",
        riskClass: "warn",
        benchmarks: "Can climb 1–2 flights of stairs, walk up a slight hill, do moderate housework (carrying groceries, sweeping, vacuuming), or walk 4 km/h.",
        anaestheticConsiderations: "Sufficient functional capacity for most low-to-intermediate risk noncardiac surgeries without further invasive cardiac evaluation if stable."
      },
      good: {
        range: "7 – 10 METs",
        label: "Good Functional Capacity",
        risk: "Low Perioperative Cardiovascular Risk",
        riskClass: "good",
        benchmarks: "Can climb several flights of stairs rapidly, jog, do heavy yard work (shovelling snow, pushing mower), or play tennis.",
        anaestheticConsiderations: "Excellent physiological reserve. High likelihood of tolerating major perioperative physiological stress."
      },
      excellent: {
        range: "> 10 METs",
        label: "Excellent Functional Capacity",
        risk: "Minimal Risk of Functional Cardiac Limitation",
        riskClass: "good",
        benchmarks: "Participates in vigorous sports (swimming laps, running, football, cycling, competitive athletics).",
        anaestheticConsiderations: "Outstanding cardiopulmonary fitness. Extremely low baseline perioperative cardiac morbidity."
      }
    };

    return profiles[activityLevel] || null;
  }

  // ==========================================================================
  // 3. DASI (DUKE ACTIVITY STATUS INDEX)
  // ==========================================================================
  const DASI_ITEMS = [
    { id: "q1", text: "Can you take care of yourself, that is, eating, dressing, bathing, or using the toilet?", weight: 2.75 },
    { id: "q2", text: "Can you walk indoors, such as around your house?", weight: 1.75 },
    { id: "q3", text: "Can you walk a block or two on level ground?", weight: 2.75 },
    { id: "q4", text: "Can you climb a flight of stairs or walk up a hill?", weight: 5.50 },
    { id: "q5", text: "Can you run a short distance?", weight: 8.00 },
    { id: "q6", text: "Can you do light work around the house like dusting or washing dishes?", weight: 2.70 },
    { id: "q7", text: "Can you do moderate work around the house like vacuuming, sweeping floors, or carrying in groceries?", weight: 3.50 },
    { id: "q8", text: "Can you do heavy work around the house like scrubbing floors, or lifting or moving heavy furniture?", weight: 8.00 },
    { id: "q9", text: "Can you do yard work like raking leaves, weeding, or pushing a power mower?", weight: 4.50 },
    { id: "q10", text: "Can you have sexual relations?", weight: 5.25 },
    { id: "q11", text: "Can you participate in moderate recreational activities like golf, bowling, dancing, doubles tennis, or throwing a ball?", weight: 6.00 },
    { id: "q12", text: "Can you participate in strenuous sports like swimming, singles tennis, football, basketball, or skiing?", weight: 7.50 }
  ];

  function calculateDASI(selectedIds = []) {
    let score = 0;
    DASI_ITEMS.forEach(item => {
      if (selectedIds.includes(item.id)) {
        score += item.weight;
      }
    });

    score = round(score, 2);
    // Peak VO2 (mL/kg/min) = (0.43 × DASI) + 9.6
    const peakVO2 = round((0.43 * score) + 9.6, 1);
    // Estimated METs = Peak VO2 / 3.5
    const estimatedMETs = round(peakVO2 / 3.5, 1);

    const metsStudyCutoff = score < 34;
    let interpretation = "";
    let riskClass = "";

    if (metsStudyCutoff) {
      interpretation = "DASI < 34: Associated with increased risk of 30-day myocardial injury and death in the landmark METS study (Lancet 2018). Estimated functional capacity is suboptimal.";
      riskClass = "alert";
    } else {
      interpretation = "DASI ≥ 34: Favourable functional capacity. Associated with lower perioperative cardiac morbidity and 30-day mortality in surgical cohorts.";
      riskClass = "good";
    }

    return {
      dasiScore: score,
      maxScore: 58.2,
      peakVO2,
      estimatedMETs,
      metsStudyCutoff,
      interpretation,
      riskClass,
      formula: "Peak VO₂ = (0.43 × DASI) + 9.6 mL/kg/min | Estimated METs = Peak VO₂ ÷ 3.5",
      source: "Hlatky MA et al. Am J Cardiol 1989; Wijeysundera DN et al. METS Study, Lancet 2018."
    };
  }

  // ==========================================================================
  // 4. STOP-BANG OSA SCREENING
  // ==========================================================================
  function calculateStopBang(responses = {}) {
    // keys: snoring, tired, observed, pressure, bmi35, age50, neck, male
    const keys = ["snoring", "tired", "observed", "pressure", "bmi35", "age50", "neck", "male"];
    let score = 0;
    keys.forEach(k => {
      if (responses[k] === true || responses[k] === "yes" || responses[k] === 1) {
        score += 1;
      }
    });

    const stopScore = ["snoring", "tired", "observed", "pressure"]
      .reduce((sum, k) => sum + (responses[k] ? 1 : 0), 0);

    const isMale = !!responses.male;
    const isBmiHigh = !!responses.bmi35;
    const isNeckThick = !!responses.neck;

    let riskLevel = "";
    let riskClass = "";
    let criteriaDetail = "";

    if (score >= 5) {
      riskLevel = "High Risk of Obstructive Sleep Apnea";
      riskClass = "alert";
      criteriaDetail = "STOP-Bang total score 5 – 8.";
    } else if (stopScore >= 2 && (isMale || isBmiHigh || isNeckThick)) {
      riskLevel = "High Risk of Obstructive Sleep Apnea";
      riskClass = "alert";
      criteriaDetail = "STOP score ≥ 2 combined with Male gender, BMI > 35, or high neck circumference.";
    } else if (score >= 3) {
      riskLevel = "Intermediate Risk of Obstructive Sleep Apnea";
      riskClass = "warn";
      criteriaDetail = "STOP-Bang total score 3 – 4.";
    } else {
      riskLevel = "Low Risk of Obstructive Sleep Apnea";
      riskClass = "good";
      criteriaDetail = "STOP-Bang total score 0 – 2.";
    }

    return {
      score,
      maxScore: 8,
      riskLevel,
      riskClass,
      criteriaDetail,
      anaesthesiaNotes: "High-risk patients may have sensitive airways, increased susceptibility to opioid-induced respiratory depression, and difficult bag-mask ventilation or intubation. Prepare CPAP/high-flow nasal oxygen and plan multimodal opioid-sparing analgesia.",
      disclaimer: "STOP-Bang is a validated screening questionnaire, not a diagnostic polysomnogram."
    };
  }

  // ==========================================================================
  // 5. CREATININE CLEARANCE (COCKCROFT–GAULT)
  // ==========================================================================
  function calculateCockcroftGault(params) {
    const age = num(params.age);
    const weight = num(params.weight);
    const heightCm = num(params.heightCm);
    const sex = params.sex; // 'male' or 'female'
    let sCr = num(params.sCr);
    const crUnit = params.crUnit || "mg/dL"; // 'mg/dL' or 'umol/L'
    const weightType = params.weightType || "actual"; // 'actual', 'ibw', 'adjbw'

    if (!age || !weight || !sCr || age <= 0 || weight <= 0 || sCr <= 0) {
      return { error: "Please provide valid age, weight, and serum creatinine." };
    }

    // Convert umol/L to mg/dL if needed: 1 mg/dL = 88.4 umol/L
    let sCrMgDl = sCr;
    if (crUnit === "umol/L") {
      sCrMgDl = sCr / 88.4;
    }

    // Devine formula for Ideal Body Weight (IBW)
    let ibw = null;
    let adjbw = null;
    if (heightCm && heightCm > 0) {
      const heightInches = heightCm / 2.54;
      const inchesOver5Ft = Math.max(0, heightInches - 60);
      if (sex === "female") {
        ibw = 45.5 + (2.3 * inchesOver5Ft);
      } else {
        ibw = 50.0 + (2.3 * inchesOver5Ft);
      }
      ibw = round(ibw, 1);
      adjbw = round(ibw + 0.4 * (weight - ibw), 1);
    }

    let calculationWeight = weight;
    let weightExplanation = `Using Actual Body Weight (${weight} kg).`;

    if (weightType === "ibw" && ibw) {
      calculationWeight = ibw;
      weightExplanation = `Using Ideal Body Weight (${ibw} kg, Devine formula).`;
    } else if (weightType === "adjbw" && adjbw) {
      calculationWeight = adjbw;
      weightExplanation = `Using Adjusted Body Weight (${adjbw} kg; IBW + 0.4 × [ABW - IBW]).`;
    }

    // Cockcroft-Gault Equation:
    // CrCl = [(140 - Age) × Weight (kg)] / [72 × SCr (mg/dL)] × (0.85 if female)
    let crCl = ((140 - age) * calculationWeight) / (72 * sCrMgDl);
    if (sex === "female") {
      crCl *= 0.85;
    }

    crCl = round(crCl, 1);

    let stage = "";
    let riskClass = "";
    if (crCl >= 90) {
      stage = "Normal or high renal clearance (CrCl ≥ 90 mL/min)";
      riskClass = "good";
    } else if (crCl >= 60) {
      stage = "Mildly decreased (CrCl 60 – 89 mL/min)";
      riskClass = "good";
    } else if (crCl >= 30) {
      stage = "Moderately decreased (CrCl 30 – 59 mL/min)";
      riskClass = "warn";
    } else if (crCl >= 15) {
      stage = "Severely decreased (CrCl 15 – 29 mL/min)";
      riskClass = "alert";
    } else {
      stage = "Kidney failure (CrCl < 15 mL/min)";
      riskClass = "alert";
    }

    return {
      crCl,
      unit: "mL/min",
      stage,
      riskClass,
      calculationWeight,
      weightType,
      weightExplanation,
      ibw,
      adjbw,
      formula: "[(140 - Age) × Weight (kg)] ÷ [72 × Serum Creatinine (mg/dL)] × (0.85 if female)",
      limitations: "Cockcroft-Gault estimates creatinine clearance, NOT standardized eGFR (CKD-EPI). It may overestimate GFR in cirrhosis or low muscle mass, and underestimate in acute kidney injury before steady state is reached."
    };
  }

  // ==========================================================================
  // 6. ANION GAP (WITH ALBUMIN CORRECTION)
  // ==========================================================================
  function calculateAnionGap(params) {
    const na = num(params.na);
    const cl = num(params.cl);
    const hco3 = num(params.hco3);
    const albumin = num(params.albumin);
    const albUnit = params.albUnit || "g/dL"; // 'g/dL' or 'g/L'

    if (na === null || cl === null || hco3 === null) {
      return { error: "Please enter Sodium, Chloride, and Bicarbonate." };
    }

    // Standard uncorrected AG = Na - (Cl + HCO3)
    const ag = round(na - (cl + hco3), 1);

    let correctedAG = null;
    let albCorrectionDetails = null;

    if (albumin !== null && albumin > 0) {
      // Figge-Jabor-Kazda equation: Corrected AG = Observed AG + 2.5 × (4.0 - Albumin in g/dL)
      let albGdl = albUnit === "g/L" ? albumin / 10 : albumin;
      correctedAG = round(ag + 2.5 * (4.0 - albGdl), 1);
      albCorrectionDetails = `Corrected for Albumin ${albGdl} g/dL: AG + 2.5 × (4.0 - Albumin) = ${correctedAG} mEq/L`;
    }

    const effectiveAG = correctedAG !== null ? correctedAG : ag;

    let interpretation = "";
    let riskClass = "";

    if (effectiveAG > 12) {
      interpretation = `High Anion Gap (${effectiveAG} mEq/L): Suggests accumulation of unmeasured organic acids (Lactic acidosis, Ketoacidosis, Toxic alcohols/Methanol/Ethylene glycol, Salicylates, Uraemia).`;
      riskClass = "alert";
    } else if (effectiveAG < 4) {
      interpretation = `Low Anion Gap (${effectiveAG} mEq/L): Suggests severe hypoalbuminaemia, multiple myeloma (cationic paraproteins), severe lithium toxicity, or bromide toxicity.`;
      riskClass = "warn";
    } else {
      interpretation = `Normal Anion Gap (${effectiveAG} mEq/L): Normal range (4 – 12 mEq/L, without potassium). In metabolic acidosis, a normal gap indicates NAGMA/hyperchloraemic acidosis (GI or renal bicarbonate loss).`;
      riskClass = "good";
    }

    return {
      ag,
      correctedAG,
      effectiveAG,
      albCorrectionDetails,
      interpretation,
      riskClass,
      formula: "Anion Gap = Na⁺ - (Cl⁻ + HCO₃⁻) [Excludes K⁺] | Figge Albumin Correction: AG + 2.5 × (4.0 - Albumin g/dL)",
      source: "Emmett M, Narins RG. Medicine 1977; Figge J et al. Crit Care Med 1998."
    };
  }

  // ==========================================================================
  // 7. WINTER'S FORMULA
  // ==========================================================================
  function calculateWinters(hco3Val, measuredPaco2Val) {
    const hco3 = num(hco3Val);
    const measuredPaco2 = num(measuredPaco2Val);

    if (hco3 === null || hco3 <= 0) {
      return { error: "Please enter a valid serum bicarbonate value." };
    }

    // Expected PaCO2 = (1.5 × HCO3) + 8 ± 2 mmHg
    const center = (1.5 * hco3) + 8;
    const minPaco2 = round(center - 2, 1);
    const maxPaco2 = round(center + 2, 1);
    const centerPaco2 = round(center, 1);

    let comparison = null;
    let riskClass = "good";

    if (measuredPaco2 !== null) {
      if (measuredPaco2 > maxPaco2) {
        comparison = `Measured PaCO₂ (${measuredPaco2} mmHg) is HIGHER than expected (${minPaco2}–${maxPaco2} mmHg). This suggests a CONCURRENT RESPIRATORY ACIDOSIS (inadequate alveolar hyperventilation / respiratory failure).`;
        riskClass = "alert";
      } else if (measuredPaco2 < minPaco2) {
        comparison = `Measured PaCO₂ (${measuredPaco2} mmHg) is LOWER than expected (${minPaco2}–${maxPaco2} mmHg). This suggests a CONCURRENT RESPIRATORY ALKALOSIS (excessive alveolar hyperventilation).`;
        riskClass = "warn";
      } else {
        comparison = `Measured PaCO₂ (${measuredPaco2} mmHg) falls within the expected range (${minPaco2}–${maxPaco2} mmHg). This demonstrates APPROPRIATE RESPIRATORY COMPENSATION for metabolic acidosis.`;
        riskClass = "good";
      }
    }

    return {
      hco3,
      centerPaco2,
      minPaco2,
      maxPaco2,
      rangeText: `${minPaco2} – ${maxPaco2} mmHg`,
      measuredPaco2,
      comparison,
      riskClass,
      formula: "Expected PaCO₂ = (1.5 × [HCO₃⁻]) + 8 ± 2 mmHg",
      indication: "Strictly validated for METABOLIC ACIDOSIS compensation. Do not use for primary metabolic alkalosis.",
      source: "Albert MS, Dell RB, Winters RW. Ann Intern Med. 1967;66(2):312-322."
    };
  }

  // ==========================================================================
  // 8. DELTA GAP / DELTA RATIO
  // ==========================================================================
  function calculateDeltaGap(params) {
    const na = num(params.na);
    const cl = num(params.cl);
    const hco3 = num(params.hco3);
    const albumin = num(params.albumin);
    const normalAG = num(params.normalAG) || 12;
    const normalHco3 = num(params.normalHco3) || 24;

    if (na === null || cl === null || hco3 === null) {
      return { error: "Please enter Sodium, Chloride, and Bicarbonate." };
    }

    const ag = round(na - (cl + hco3), 1);
    let effectiveAG = ag;

    let albCorrected = false;
    if (albumin !== null && albumin > 0) {
      effectiveAG = round(ag + 2.5 * (4.0 - albumin), 1);
      albCorrected = true;
    }

    // Delta AG = Current AG - Normal AG (12)
    const deltaAG = round(effectiveAG - normalAG, 1);
    // Delta HCO3 = Normal HCO3 (24) - Current HCO3
    const deltaHco3 = round(normalHco3 - hco3, 1);
    // Delta Gap = Delta AG - Delta HCO3
    const deltaGap = round(deltaAG - deltaHco3, 1);

    let deltaRatio = null;
    let interpretation = "";
    let riskClass = "";

    if (deltaHco3 !== 0) {
      deltaRatio = round(deltaAG / deltaHco3, 2);
      if (deltaRatio < 0.4) {
        interpretation = "Delta Ratio < 0.4: Pure Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloraemic Acidosis).";
        riskClass = "warn";
      } else if (deltaRatio < 0.8) {
        interpretation = "Delta Ratio 0.4 – 0.8: Mixed HAGMA + NAGMA (e.g. Diarrhoea or RTA combined with Lactic acidosis or DKA).";
        riskClass = "alert";
      } else if (deltaRatio <= 2.0) {
        interpretation = "Delta Ratio 0.8 – 2.0: Pure High Anion Gap Metabolic Acidosis (HAGMA). In typical DKA or Lactic Acidosis, ratio approximates 1.0 – 1.6.";
        riskClass = "good";
      } else {
        interpretation = "Delta Ratio > 2.0: High Anion Gap Acidosis combined with a preexisting METABOLIC ALKALOSIS or chronic respiratory acidosis compensation.";
        riskClass = "alert";
      }
    } else {
      interpretation = "Delta Bicarbonate is zero (Normal HCO₃ level).";
      riskClass = "good";
    }

    return {
      ag,
      effectiveAG,
      albCorrected,
      normalAG,
      normalHco3,
      deltaAG,
      deltaHco3,
      deltaGap,
      deltaRatio,
      interpretation,
      riskClass,
      formula: "Delta AG = (Observed AG - Normal AG) | Delta HCO₃ = (Normal HCO₃ - Observed HCO₃) | Delta Ratio = Delta AG ÷ Delta HCO₃",
      source: "Wrenn K. Ann Emerg Med 1990;19:1310-1313."
    };
  }

  // ==========================================================================
  // 9. PARKLAND BURN RESUSCITATION CALCULATOR
  // ==========================================================================
  function calculateParkland(weightKg, tbsaPercent, hoursSinceBurn, fluidGivenMl) {
    const wt = num(weightKg);
    const tbsa = num(tbsaPercent);
    const hrs = num(hoursSinceBurn) || 0;
    const given = num(fluidGivenMl) || 0;

    if (!wt || !tbsa || wt <= 0 || tbsa <= 0) {
      return { error: "Please enter valid patient weight (kg) and % TBSA burn." };
    }

    if (tbsa > 100) {
      return { error: "% TBSA cannot exceed 100%." };
    }

    // Baxter / Parkland formula: 4 mL × Weight (kg) × % TBSA
    const total24h = round(4 * wt * tbsa, 0);
    const first8hTotal = round(total24h / 2, 0);
    const next16hTotal = round(total24h / 2, 0);

    const remainingHoursInFirst8 = Math.max(0, 8 - hrs);
    const remainingFirst8hVolume = Math.max(0, first8hTotal - given);

    let first8hRate = null;
    if (remainingHoursInFirst8 > 0) {
      first8hRate = round(remainingFirst8hVolume / remainingHoursInFirst8, 0);
    }

    const next16hRate = round(next16hTotal / 16, 0);

    return {
      total24h,
      first8hTotal,
      next16hTotal,
      given,
      hoursSinceBurn: hrs,
      remainingHoursInFirst8,
      remainingFirst8hVolume,
      first8hRate,
      next16hRate,
      fluidType: "Balanced Crystalloid (Ringer's Lactate / Hartmann's solution)",
      clinicalEndpoints: "Adult target urine output: 0.5 mL/kg/h (30–50 mL/h). Titrate hourly infusion rate strictly against urine output and haemodynamics, NOT blindly by formula.",
      warning: "CRITICAL: The 8-hour clock begins from the TIME OF INJURY, not hospital arrival. Formula applies to 2nd and 3rd degree burns only.",
      formula: "Total 24h = 4 mL × Weight (kg) × % TBSA burned (1st half in first 8h from burn; 2nd half in subsequent 16h)",
      source: "Baxter CR, Shires T. Ann NY Acad Sci 1968;150:874-894."
    };
  }

  // ==========================================================================
  // 10. WILSON RISK SCORE (DIFFICULT INTUBATION PREDICTION)
  // ==========================================================================
  function calculateWilsonScore({ weight, mobility, buckTeeth, jawMovement, retrognathia }) {
    // 5 criteria, each scored 0, 1, or 2 points:
    // 1) Weight: <90kg (0), 90-110kg (1), >110kg (2)
    // 2) Head & Neck Mobility: >90° (0), ~90° (1), <90° (2)
    // 3) Buck Teeth / Incisors: Absent (0), Moderate (1), Severe (2)
    // 4) Jaw Movement (Incisor opening / Subluxation): IO >5cm or SLux >0 (0), IO = 5cm or SLux = 0 (1), IO <5cm or SLux <0 (2)
    // 5) Retrognathia / Mandible: Absent (0), Moderate (1), Severe (2)
    const ptsWeight = parseInt(weight, 10) || 0;
    const ptsMobility = parseInt(mobility, 10) || 0;
    const ptsBuck = parseInt(buckTeeth, 10) || 0;
    const ptsJaw = parseInt(jawMovement, 10) || 0;
    const ptsRetro = parseInt(retrognathia, 10) || 0;

    const totalScore = ptsWeight + ptsMobility + ptsBuck + ptsJaw + ptsRetro;

    let prediction = "";
    let riskClass = "";
    let recommendation = "";

    if (totalScore <= 1) {
      prediction = "0–1: Easy Intubation Predicted";
      riskClass = "good";
      recommendation = "Low likelihood of difficult direct laryngoscopy. Standard airway management indicated.";
    } else if (totalScore <= 3) {
      prediction = "2–3: Possibly Difficult Intubation";
      riskClass = "warn";
      recommendation = "Intermediate risk (~15–20% incidence of difficult laryngoscopy). Ensure video laryngoscope (VLS) and alternative rescue airway immediately available.";
    } else {
      prediction = "≥ 4: Often Difficult Intubation";
      riskClass = "alert";
      recommendation = "High risk of difficult intubation (approx. 75% sensitivity for Grade 3/4 view). Consider primary videolaryngoscopy or awake tracheal intubation (ATI) according to DAS guidelines.";
    }

    return {
      totalScore,
      breakdown: {
        weight: ptsWeight,
        mobility: ptsMobility,
        buckTeeth: ptsBuck,
        jawMovement: ptsJaw,
        retrognathia: ptsRetro
      },
      prediction,
      riskClass,
      recommendation,
      source: "Wilson ME, Spiegelhalter D, Robertson JA, Lesser P. Br J Anaesth 1988;61(2):211-216."
    };
  }

  // ==========================================================================
  // 11. CHILD-PUGH SCORE (HEPATIC CIRRHOSIS & PERIOPERATIVE MORTALITY)
  // ==========================================================================
  function calculateChildPugh({ bilirubin, albumin, inr, ascites, encephalopathy, cholestaticMode = false }) {
    // 5 parameters (1, 2, or 3 points each):
    // Bilirubin (mg/dL): Normal <2 (1 pt), 2-3 (2 pt), >3 (3 pt)
    // [PBC/PSC mode: <4 (1 pt), 4-10 (2 pt), >10 (3 pt)]
    // Albumin (g/dL): >3.5 (1 pt), 2.8-3.5 (2 pt), <2.8 (3 pt)
    // INR: <1.7 (1 pt), 1.7-2.3 (2 pt), >2.3 (3 pt)
    // Ascites: None (1 pt), Slight/Controlled with diuretics (2 pt), Moderate/Severe/Refractory (3 pt)
    // Encephalopathy: None/Grade 0 (1 pt), Grade 1-2 (2 pt), Grade 3-4 (3 pt)
    const bili = num(bilirubin);
    const alb = num(albumin);
    const inrVal = num(inr);

    let ptsBili = 1;
    if (bili !== null) {
      if (cholestaticMode) {
        if (bili > 10) ptsBili = 3;
        else if (bili >= 4) ptsBili = 2;
        else ptsBili = 1;
      } else {
        if (bili > 3) ptsBili = 3;
        else if (bili >= 2) ptsBili = 2;
        else ptsBili = 1;
      }
    }

    let ptsAlb = 1;
    if (alb !== null) {
      if (alb < 2.8) ptsAlb = 3;
      else if (alb <= 3.5) ptsAlb = 2;
      else ptsAlb = 1;
    }

    let ptsInr = 1;
    if (inrVal !== null) {
      if (inrVal > 2.3) ptsInr = 3;
      else if (inrVal >= 1.7) ptsInr = 2;
      else ptsInr = 1;
    }

    const ptsAscites = parseInt(ascites, 10) || 1;
    const ptsEnceph = parseInt(encephalopathy, 10) || 1;

    const totalScore = ptsBili + ptsAlb + ptsInr + ptsAscites + ptsEnceph;

    let childClass = "";
    let survival = "";
    let periopMortality = "";
    let riskClass = "";

    if (totalScore <= 6) {
      childClass = "Class A (Mild Hepatic Impairment)";
      survival = "100% 1-year survival | 85% 2-year survival";
      periopMortality = "Approx. 10% perioperative mortality (well tolerated for elective surgery)";
      riskClass = "good";
    } else if (totalScore <= 9) {
      childClass = "Class B (Moderate Hepatic Impairment)";
      survival = "80% 1-year survival | 60% 2-year survival";
      periopMortality = "Approx. 30% perioperative mortality (requires medical optimization; high caution)";
      riskClass = "warn";
    } else {
      childClass = "Class C (Severe Hepatic Impairment)";
      survival = "45% 1-year survival | 35% 2-year survival";
      periopMortality = "76%–82% perioperative mortality (elective surgery contraindicated; liver transplant evaluation)";
      riskClass = "alert";
    }

    return {
      totalScore,
      childClass,
      survival,
      periopMortality,
      riskClass,
      breakdown: {
        bilirubin: ptsBili,
        albumin: ptsAlb,
        inr: ptsInr,
        ascites: ptsAscites,
        encephalopathy: ptsEnceph
      },
      source: "Child CG, Turcotte JG (1964) Surgery and Portal Hypertension; Pugh RN et al. Br J Surg 1973;60:646-649."
    };
  }

  // ==========================================================================
  // 12. COPUR PAEDIATRIC AIRWAY SCORE (COLORADO PAEDIATRIC AIRWAY SCORE)
  // ==========================================================================
  function calculateCOPUR({ chin, opening, previousOSA, uvula, range, modBuck, modMacro, modObese, modMps }) {
    // C: Chin (1-4 pts): 1=Normal, 2=Small/mod hypoplastic, 3=Markedly recessive, 4=Extremely hypoplastic
    // O: Opening (1-4 pts): 1=>40mm, 2=20-40mm, 3=10-20mm, 4=<10mm
    // P: Previous/OSA (1-4 pts): 1=Prev without diff, 2=No prev intubation & no OSA, 3=Prev diff or symptoms of OSA, 4=Extreme/failed intubation or tracheostomy or unable to sleep supine
    // U: Uvula (1-4 pts): 1=Tip visible, 2=Partially visible, 3=Concealed (soft palate visible), 4=Soft palate not visible
    // R: Range (1-4 pts): 1=>120°, 2=60°-120°, 3=30°-60°, 4=<30°
    // Modifiers:
    // Prominent buck teeth (+1)
    // Macroglossia / very large tongue (+1)
    // Extreme obesity (+1)
    // Mucopolysaccharidoses (+2)
    const ptsC = parseInt(chin, 10) || 1;
    const ptsO = parseInt(opening, 10) || 1;
    const ptsP = parseInt(previousOSA, 10) || 1;
    const ptsU = parseInt(uvula, 10) || 1;
    const ptsR = parseInt(range, 10) || 1;

    let modPts = 0;
    if (modBuck) modPts += 1;
    if (modMacro) modPts += 1;
    if (modObese) modPts += 1;
    if (modMps) modPts += 2;

    const totalScore = ptsC + ptsO + ptsP + ptsU + ptsR + modPts;

    let difficultyText = "";
    let glotticView = "";
    let management = "";
    let riskClass = "";

    if (totalScore <= 7) {
      difficultyText = "Points 5–7: Easy, Normal Intubations";
      glotticView = "Cormack-Lehane Grade 1 Expected";
      management = "Conventional direct laryngoscopy or standard paediatric videolaryngoscope.";
      riskClass = "good";
    } else if (totalScore <= 10) {
      difficultyText = "Points 8–10: More Difficult Intubation";
      glotticView = "Cormack-Lehane Grade 2 Expected";
      management = "External laryngeal manipulation (BURP / optimal external pressure) frequently required. Videolaryngoscope recommended.";
      riskClass = "warn";
    } else if (totalScore <= 13) {
      difficultyText = "Points 11–13: Difficult Intubation";
      glotticView = "Cormack-Lehane Grade 3 Expected";
      management = "Difficult intubation anticipated. Flexible bronchoscope or videolaryngoscope with hyperangulated blade recommended to avoid trauma.";
      riskClass = "alert";
    } else if (totalScore <= 15) {
      difficultyText = "Points 14–15: Highly Difficult Intubation";
      glotticView = "Cormack-Lehane Grade 3–4 Expected";
      management = "Requires flexible bronchoscope, specialized optical stylets, or supraglottic conduit. Have second paediatric airway specialist present.";
      riskClass = "alert";
    } else {
      difficultyText = "Points ≥ 16: Dangerous Airway / Critical Risk";
      glotticView = "Cormack-Lehane Grade 4 Expected";
      management = "Extremely dangerous airway. Consider awake or spontaneously breathing intubation, surgical airway standby. Scores >16 frequently indicate dependency on artificial airway.";
      riskClass = "alert";
    }

    return {
      totalScore,
      baseScore: ptsC + ptsO + ptsP + ptsU + ptsR,
      modScore: modPts,
      difficultyText,
      glotticView,
      management,
      riskClass,
      source: "Colorado Paediatric Airway Score (COPUR); Petrov I, et al. J Clin Med 2024;13(15):4294."
    };
  }

  // Export module
  window.KnockoutCalculators = {
    calculateBMI,
    calculateMETs,
    calculateDASI,
    calculateStopBang,
    calculateCockcroftGault,
    calculateAnionGap,
    calculateWinters,
    calculateDeltaGap,
    calculateParkland,
    calculateWilsonScore,
    calculateChildPugh,
    calculateCOPUR,
    DASI_ITEMS
  };
})();
