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

  // ==========================================================================
  // 13. CHA2DS2-VASc & CHADS2 ATRIAL FIBRILLATION STROKE RISK
  // ==========================================================================
  function calculateCHA2DS2VASc(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.chf) pts += 1;
    if (c.htn) pts += 1;
    const age = num(c.age) || 0;
    if (age >= 75) pts += 2;
    else if (age >= 65) pts += 1;
    if (c.diabetes) pts += 1;
    if (c.stroke) pts += 2;
    if (c.vascular) pts += 1;
    const isFemale = (c.sex === "female" || c.isFemale);
    if (isFemale) pts += 1;

    const rates = [0.2, 0.6, 2.2, 3.2, 4.8, 7.2, 9.7, 11.2, 10.8, 12.2];
    const strokeRate = rates[Math.min(pts, 9)];

    let riskClass = "good";
    let riskTier = "Low Risk";
    let recommendation = "";

    if (!isFemale) {
      if (pts === 0) {
        riskTier = "Low Risk (0.2% / yr)";
        riskClass = "good";
        recommendation = "No antithrombotic therapy recommended (ESC 2020 Guidelines).";
      } else if (pts === 1) {
        riskTier = "Moderate Risk (0.6% / yr)";
        riskClass = "warn";
        recommendation = "Oral anticoagulation (DOAC preferred over VKA) should be considered (Class IIa).";
      } else {
        riskTier = `High Risk (${strokeRate}% / yr)`;
        riskClass = "alert";
        recommendation = "Oral anticoagulation (DOAC preferred) is strongly recommended (Class I).";
      }
    } else {
      if (pts === 1) {
        riskTier = "Low Risk (0.2% / yr)";
        riskClass = "good";
        recommendation = "No antithrombotic therapy recommended (isolated female sex criterion, ESC 2020).";
      } else if (pts === 2) {
        riskTier = "Moderate Risk (0.6% / yr)";
        riskClass = "warn";
        recommendation = "Oral anticoagulation (DOAC preferred) should be considered (Class IIa).";
      } else {
        riskTier = `High Risk (${strokeRate}% / yr)`;
        riskClass = "alert";
        recommendation = "Oral anticoagulation (DOAC preferred) is strongly recommended (Class I).";
      }
    }

    return {
      score: pts,
      strokeRate,
      riskTier,
      riskClass,
      recommendation,
      source: "Lip GY et al. Chest 2010;137(2):263-272; ESC AF Guidelines 2020."
    };
  }

  function calculateCHADS2(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.chf) pts += 1;
    if (c.htn) pts += 1;
    const age = num(c.age) || 0;
    if (age >= 75) pts += 1;
    if (c.diabetes) pts += 1;
    if (c.stroke) pts += 2;

    const rates = [1.9, 2.8, 4.0, 5.9, 8.5, 12.5, 18.2];
    const strokeRate = rates[Math.min(pts, 6)];

    let riskClass = "good";
    let riskTier = "Low Risk";
    let recommendation = "";

    if (pts === 0) {
      riskTier = "Low Risk (1.9% / yr)";
      riskClass = "good";
      recommendation = "Aspirin or no antithrombotic therapy.";
    } else if (pts === 1) {
      riskTier = "Intermediate Risk (2.8% / yr)";
      riskClass = "warn";
      recommendation = "Oral anticoagulation (DOAC or warfarin) or aspirin considered.";
    } else {
      riskTier = `High Risk (${strokeRate}% / yr)`;
      riskClass = "alert";
      recommendation = "Oral anticoagulation (DOAC or warfarin) indicated unless contraindicated.";
    }

    return {
      score: pts,
      strokeRate,
      riskTier,
      riskClass,
      recommendation,
      source: "Gage BF et al. JAMA 2001;285(22):2864-2870."
    };
  }

  // ==========================================================================
  // 14. REVISED CARDIAC RISK INDEX (RCRI / LEE CRITERIA)
  // ==========================================================================
  function calculateRCRI(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.highRiskSurgery) pts += 1;
    if (c.ischemicHeartDisease) pts += 1;
    if (c.heartFailure) pts += 1;
    if (c.cerebrovascularDisease) pts += 1;
    if (c.diabetesInsulin) pts += 1;
    if (c.creatinineHigh) pts += 1;

    let rcriClass = "Class I";
    let complicationRate = "3.9%";
    let majorEventRate = "0.4%";
    let riskClass = "good";
    let recommendation = "";

    if (pts === 0) {
      rcriClass = "Class I";
      complicationRate = "3.9%";
      majorEventRate = "0.4%";
      riskClass = "good";
      recommendation = "Very low perioperative cardiac risk. Proceed without routine noninvasive cardiac stress testing.";
    } else if (pts === 1) {
      rcriClass = "Class II";
      complicationRate = "6.0%";
      majorEventRate = "0.9%";
      riskClass = "warn";
      recommendation = "Low perioperative cardiac risk. Ensure functional capacity (METs) assessment; cardiology consultation if functional status poor.";
    } else if (pts === 2) {
      rcriClass = "Class III";
      complicationRate = "10.1%";
      majorEventRate = "6.6%";
      riskClass = "alert";
      recommendation = "Moderate perioperative cardiac risk. Consider preoperative ECG, troponin surveillance, and echocardiography for high-risk procedures.";
    } else {
      rcriClass = "Class IV";
      complicationRate = "15.0%";
      majorEventRate = "11.0%";
      riskClass = "alert";
      recommendation = "High perioperative cardiac risk. Multidisciplinary heart team review, invasive hemodynamic monitoring, and postoperative ICU/HDU care recommended.";
    }

    return {
      score: pts,
      rcriClass,
      complicationRate,
      majorEventRate,
      riskClass,
      recommendation,
      source: "Lee TH et al. Circulation 1999;100(10):1043-1049; ACC/AHA & ESC/ESAIC Perioperative Guidelines."
    };
  }

  // ==========================================================================
  // 15. WELLS' CRITERIA FOR PULMONARY EMBOLISM (PE)
  // ==========================================================================
  function calculateWellsPE(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.signsDVT) pts += 3.0;
    if (c.peLikely) pts += 3.0;
    if (c.hrOver100) pts += 1.5;
    if (c.immobilOrSurgery) pts += 1.5;
    if (c.priorPEorDVT) pts += 1.5;
    if (c.hemoptysis) pts += 1.0;
    if (c.malignancy) pts += 1.0;

    pts = round(pts, 1);

    const isLikely = pts > 4.0;
    const twoTier = isLikely ? "PE Likely (>4.0 points)" : "PE Unlikely (≤4.0 points)";
    let threeTier = "Low Risk (<2 points)";
    let riskClass = "good";
    let recommendation = "";

    if (pts < 2.0) {
      threeTier = "Low Risk (<2 points, 1.3%–3.4% incidence)";
      riskClass = "good";
      recommendation = "PE Unlikely. Consider high-sensitivity D-dimer testing to rule out PE without imaging.";
    } else if (pts <= 6.0) {
      threeTier = "Moderate Risk (2–6 points, ~16.2% incidence)";
      riskClass = "warn";
      if (pts > 4.0) {
        recommendation = "PE Likely by two-tier model. CT Pulmonary Angiography (CTPA) recommended.";
      } else {
        recommendation = "PE Unlikely by two-tier model. High-sensitivity D-dimer or CTPA based on clinical context.";
      }
    } else {
      threeTier = "High Risk (>6 points, 37.5%–40.6% incidence)";
      riskClass = "alert";
      recommendation = "PE Highly Likely. Immediate CTPA indicated. Consider therapeutic anticoagulation while awaiting imaging if no bleeding contraindications.";
    }

    return {
      score: pts,
      twoTier,
      isLikely,
      threeTier,
      riskClass,
      recommendation,
      source: "Wells PS et al. Thromb Haemost 2000;83(3):416-420; Ann Intern Med 2001;135(2):98-107."
    };
  }

  // ==========================================================================
  // 16. PESI & SIMPLIFIED PESI (PULMONARY EMBOLISM SEVERITY INDEX)
  // ==========================================================================
  function calculatePESI(params) {
    const p = params || {};
    const age = num(p.age) || 0;
    let score = age;

    if (p.sex === "male" || p.isMale) score += 10;
    if (p.cancer) score += 30;
    if (p.heartFailure) score += 10;
    if (p.chronicLung) score += 10;
    if (p.pulseGte110) score += 20;
    if (p.sbpLt100) score += 30;
    if (p.rrGte30) score += 20;
    if (p.tempLt36) score += 20;
    if (p.alteredMental) score += 60;
    if (p.spo2Lt90) score += 20;

    let pesiClass = "Class I";
    let mortality30d = "0% – 1.6%";
    let riskClass = "good";
    let disposition = "Very low mortality risk. Candidate for outpatient treatment or early discharge.";

    if (score <= 65) {
      pesiClass = "Class I (≤65 pts)";
      mortality30d = "0.0% – 1.6%";
      riskClass = "good";
      disposition = "Very Low Risk. Candidate for early hospital discharge or home treatment.";
    } else if (score <= 85) {
      pesiClass = "Class II (66–85 pts)";
      mortality30d = "1.7% – 3.5%";
      riskClass = "good";
      disposition = "Low Risk. Candidate for brief inpatient stay or outpatient care.";
    } else if (score <= 105) {
      pesiClass = "Class III (86–105 pts)";
      mortality30d = "3.2% – 7.1%";
      riskClass = "warn";
      disposition = "Intermediate Risk. Inpatient hospital admission indicated.";
    } else if (score <= 125) {
      pesiClass = "Class IV (106–125 pts)";
      mortality30d = "4.0% – 11.4%";
      riskClass = "alert";
      disposition = "High Risk. Inpatient admission, close cardiopulmonary monitoring.";
    } else {
      pesiClass = "Class V (>125 pts)";
      mortality30d = "10.0% – 23.9%";
      riskClass = "alert";
      disposition = "Very High Risk. Intensive care unit (ICU) admission and hemodynamic support.";
    }

    // Simplified PESI (sPESI)
    let spesi = 0;
    if (age > 80) spesi += 1;
    if (p.cancer) spesi += 1;
    if (p.heartFailure || p.chronicLung) spesi += 1;
    if (p.pulseGte110) spesi += 1;
    if (p.sbpLt100) spesi += 1;
    if (p.spo2Lt90) spesi += 1;

    const spesiCategory = spesi === 0 ? "Low Risk (1.0% 30-day mortality)" : `High Risk (10.9% 30-day mortality, score = ${spesi})`;

    return {
      score,
      pesiClass,
      mortality30d,
      riskClass,
      disposition,
      spesiScore: spesi,
      spesiCategory,
      source: "Aujesky D et al. Am J Respir Crit Care Med 2005;172:1041-1046; Jiménez D et al. Arch Intern Med 2010;170:1383-1389."
    };
  }

  // ==========================================================================
  // 17. PAEDIATRIC PAIN SCORES: FLACC & CHEOPS
  // ==========================================================================
  function calculateFLACC(params) {
    const p = params || {};
    const face = parseInt(p.face, 10) || 0;
    const legs = parseInt(p.legs, 10) || 0;
    const act = parseInt(p.activity, 10) || 0;
    const cry = parseInt(p.cry, 10) || 0;
    const cons = parseInt(p.consolability, 10) || 0;

    const total = face + legs + act + cry + cons;

    let category = "Relaxed and comfortable";
    let riskClass = "good";
    let intervention = "No analgesic intervention needed. Maintain routine comfort measures.";

    if (total === 0) {
      category = "Relaxed & Comfortable (Score 0)";
      riskClass = "good";
      intervention = "Patient comfortable. Continue routine postoperative observation.";
    } else if (total <= 3) {
      category = "Mild Discomfort / Pain (Score 1–3)";
      riskClass = "good";
      intervention = "Provide non-pharmacological comfort (distraction, swaddling, parental presence). Reassess in 15–30 min.";
    } else if (total <= 6) {
      category = "Moderate Pain (Score 4–6)";
      riskClass = "warn";
      intervention = "Analgesic intervention indicated: consider paracetamol, NSAID, or mild opioid according to protocol. Re-evaluate post-dose.";
    } else {
      category = "Severe Discomfort / Pain (Score 7–10)";
      riskClass = "alert";
      intervention = "Urgent analgesia required: titrate intravenous opioids (e.g. morphine/fentanyl) and examine for surgical/positional complications.";
    }

    return {
      total,
      category,
      riskClass,
      intervention,
      breakdown: { face, legs, activity: act, cry, consolability: cons },
      source: "Merkel SI et al. Pediatr Nurs 1997;23(3):293-297; Voepel-Lewis T et al. Anesth Analg 2010;110(4):1139-1144."
    };
  }

  function calculateCHEOPS(params) {
    const p = params || {};
    const cry = parseInt(p.cry, 10) || 1;
    const facial = parseInt(p.facial, 10) || 1;
    const verbal = parseInt(p.verbal, 10) || 1;
    const torso = parseInt(p.torso, 10) || 1;
    const touch = parseInt(p.touch, 10) || 1;
    const legs = parseInt(p.legs, 10) || 1;

    const total = cry + facial + verbal + torso + touch + legs;

    let category = "Acceptable Comfort (Score < 8)";
    let riskClass = "good";
    let clinicalAction = "Pain is controlled. Comfort measures and routine observations.";

    if (total < 8) {
      category = `Acceptable Comfort (Score ${total}/14)`;
      riskClass = "good";
      clinicalAction = "Score < 8: Mild or absent pain. Analgesia not acutely required.";
    } else {
      category = `Significant Postoperative Pain (Score ${total}/14)`;
      riskClass = "alert";
      clinicalAction = "Score ≥ 8: Clinically significant post-op pain. Requires active analgesic rescue and reassessment.";
    }

    return {
      total,
      category,
      riskClass,
      clinicalAction,
      source: "McGrath PJ et al. Adv Pain Res Ther 1985;9:395-402."
    };
  }

  // ==========================================================================
  // 18. IDEAL & ADJUSTED BODY WEIGHT (IBW & ABW) + ANAESTHETIC DOSING MATRIX
  // ==========================================================================
  function calculateBodyWeights(heightCm, actualWeightKg, sex) {
    const ht = num(heightCm);
    const wt = num(actualWeightKg);
    const isMale = (sex === "male" || sex === "m");

    if (!ht || ht <= 0 || !wt || wt <= 0) {
      return { error: "Please enter valid height and weight values." };
    }

    const heightInches = ht / 2.54;
    const inchesOver5Ft = heightInches - 60;

    // Devine Formula
    const baseIbw = isMale ? 50.0 : 45.5;
    const ibw = baseIbw + (2.3 * inchesOver5Ft);

    // Adjusted Body Weight (ABW) with 0.4 factor
    const abw = ibw + 0.4 * (wt - ibw);

    // Percent of IBW
    const pctIbw = (wt / ibw) * 100;

    // Boer Lean Body Weight (LBW)
    let lbw = isMale
      ? (0.407 * wt) + (0.267 * ht) - 19.2
      : (0.252 * wt) + (0.473 * ht) - 48.3;
    if (lbw > wt) lbw = wt;

    let category = "Normal weight ratio";
    let riskClass = "good";
    if (pctIbw > 130) {
      category = "Obese (>130% IBW)";
      riskClass = "alert";
    } else if (pctIbw > 115) {
      category = "Overweight (115%–130% IBW)";
      riskClass = "warn";
    } else if (pctIbw < 90) {
      category = "Underweight (<90% IBW)";
      riskClass = "warn";
    }

    return {
      ibw: round(Math.max(ibw, 10), 1),
      abw: round(Math.max(abw, 10), 1),
      lbw: round(Math.max(lbw, 10), 1),
      actualWeight: round(wt, 1),
      pctIbw: round(pctIbw, 1),
      category,
      riskClass,
      dosingRules: {
        propofolInduction: "Dose based on Lean Body Weight (LBW) or Adjusted Weight to prevent profound hypotension.",
        propofolMaintenance: "Dose based on Total Body Weight (TBW) due to high clearance and metabolic capacity.",
        succinylcholine: "Dose on Total Body Weight (TBW 1.0–1.5 mg/kg) to overcome increased pseudocholinesterase enzyme pool.",
        rocuroniumVecuronium: "Dose strictly on Ideal Body Weight (IBW) to prevent prolonged paralysis.",
        sugammadex: "Dose on Total Body Weight (TBW) for 1:1 molecular encapsulation of neuromuscular blocker.",
        fentanylRemifentanil: "Dose lipophilic opioids on Lean Body Weight (LBW) to avoid delayed awakening."
      },
      source: "Devine BJ. Drug Intell Clin Pharm 1974;8:650-655; Ingrande J, Lemmens HJ. Br J Anaesth 2010;105(S1):i16-i23."
    };
  }

  // ==========================================================================
  // 19. CALCIUM CORRECTION FOR ALBUMIN (PAYNE FORMULA)
  // ==========================================================================
  function calculateCorrectedCalcium(calciumVal, albuminVal, unit = "mg/dL") {
    const ca = num(calciumVal);
    const alb = num(albuminVal);

    if (ca === null || alb === null) {
      return { error: "Please enter valid calcium and albumin concentrations." };
    }

    let corrected = 0;
    let normalMin = 8.5;
    let normalMax = 10.2;
    let unitLabel = "mg/dL";

    if (unit === "mmol/L") {
      // SI: Corrected Ca = Measured Ca + 0.02 * (40 - Albumin g/L)
      corrected = ca + 0.02 * (40 - alb);
      normalMin = 2.15;
      normalMax = 2.55;
      unitLabel = "mmol/L";
    } else {
      // Conventional US: Corrected Ca = Measured Ca + 0.8 * (4.0 - Albumin g/dL)
      corrected = ca + 0.8 * (4.0 - alb);
      unitLabel = "mg/dL";
    }

    corrected = round(corrected, 2);

    let status = "Normocalcemia";
    let riskClass = "good";
    let notes = "";

    if (corrected < normalMin) {
      status = "Corrected Hypocalcemia";
      riskClass = "alert";
      notes = `Corrected calcium is below reference range (${normalMin}–${normalMax} ${unitLabel}). Assess for tetany, Chvostek's/Trousseau's sign, prolonged QTc on ECG, and verify with ionized calcium (Ca²⁺).`;
    } else if (corrected > normalMax) {
      status = "Corrected Hypercalcemia";
      riskClass = "alert";
      notes = `Corrected calcium is above reference range (${normalMin}–${normalMax} ${unitLabel}). Monitor for shortened QTc, arrhythmias, dehydration, and altered mental status.`;
    } else {
      status = "Normal Corrected Calcium";
      riskClass = "good";
      notes = `Corrected calcium is within normal physiological limits (${normalMin}–${normalMax} ${unitLabel}).`;
    }

    return {
      correctedCalcium: corrected,
      unit: unitLabel,
      status,
      riskClass,
      notes,
      source: "Payne RB et al. Br Med J 1973;4(5894):643-646."
    };
  }

  // ==========================================================================
  // 20. SODIUM CORRECTION FOR HYPERGLYCEMIA (KATZ & HILLIER FORMULAS)
  // ==========================================================================
  function calculateCorrectedSodium(sodiumVal, glucoseVal, glucoseUnit = "mg/dL") {
    const na = num(sodiumVal);
    const gluRaw = num(glucoseVal);

    if (na === null || gluRaw === null) {
      return { error: "Please enter valid sodium and glucose concentrations." };
    }

    // Convert glucose to mg/dL for standard calculation
    const gluMgDl = (glucoseUnit === "mmol/L") ? gluRaw * 18.0182 : gluRaw;
    const excess100 = Math.max(gluMgDl - 100, 0);

    // Katz (1973): +1.6 mEq/L per 100 mg/dL glucose over 100
    const katz = na + (0.016 * excess100);

    // Hillier (1999 consensus): +2.4 mEq/L per 100 mg/dL glucose over 100
    const hillier = na + (0.024 * excess100);

    // Effective serum osmolality = 2*Na + Glucose(mg/dL)/18
    const effOsm = (2 * na) + (gluMgDl / 18);

    let status = "Eunatremic after correction";
    let riskClass = "good";

    if (hillier < 135) {
      status = "True Hyponatremia (Hypotonic state)";
      riskClass = "warn";
    } else if (hillier > 145) {
      status = "Hypernatremia unmasked by glucose correction";
      riskClass = "alert";
    }

    return {
      hillierNa: round(hillier, 1),
      katzNa: round(katz, 1),
      effectiveOsmolality: round(effOsm, 1),
      status,
      riskClass,
      glucoseMgDl: round(gluMgDl, 1),
      explanation: "Hyperglycemia causes osmotic water shift from ICF to ECF, diluting serum sodium. Hillier consensus is preferred for marked hyperglycemia (>400 mg/dL / 22 mmol/L).",
      source: "Katz MA. N Engl J Med 1973;289:843-844; Hillier TA et al. Am J Med 1999;106(4):399-403."
    };
  }

  // ==========================================================================
  // 21. MELD-Na (MODEL FOR END-STAGE LIVER DISEASE WITH SODIUM - UNOS 2016)
  // ==========================================================================
  function calculateMELDNa(bilirubinVal, inrVal, creatinineVal, sodiumVal, onDialysis) {
    let bili = num(bilirubinVal);
    let inr = num(inrVal);
    let cr = num(creatinineVal);
    let na = num(sodiumVal);

    if (bili === null || inr === null || cr === null || na === null) {
      return { error: "Please enter valid values for Bilirubin, INR, Creatinine, and Sodium." };
    }

    // Dialysis rule: If dialysis >= 2 times in past 7 days or CVVH, Cr is set to 4.0
    if (onDialysis) cr = 4.0;

    // UNOS bounds
    cr = Math.min(Math.max(cr, 1.0), 4.0);
    bili = Math.max(bili, 1.0);
    inr = Math.max(inr, 1.0);
    const naBounded = Math.min(Math.max(na, 125.0), 137.0);

    // Initial MELD (MELD(i))
    const meld_i = (9.57 * Math.log(cr)) + (3.78 * Math.log(bili)) + (11.20 * Math.log(inr)) + 6.43;

    let meldNa = meld_i;
    if (meld_i > 11) {
      meldNa = meld_i + 1.32 * (137 - naBounded) - (0.033 * meld_i * (137 - naBounded));
    }

    // Bounded between 6 and 40
    meldNa = Math.min(Math.max(meldNa, 6.0), 40.0);
    const roundedMeld = Math.round(meldNa);

    let mortality90d = "1.9%";
    let riskClass = "good";

    if (roundedMeld <= 9) {
      mortality90d = "1.9%";
      riskClass = "good";
    } else if (roundedMeld <= 19) {
      mortality90d = "6.0%";
      riskClass = "good";
    } else if (roundedMeld <= 29) {
      mortality90d = "19.6%";
      riskClass = "warn";
    } else if (roundedMeld <= 39) {
      mortality90d = "52.6%";
      riskClass = "alert";
    } else {
      mortality90d = "71.3%";
      riskClass = "alert";
    }

    return {
      meldNa: roundedMeld,
      meldInitial: round(meld_i, 1),
      mortality90d,
      riskClass,
      interpretation: `Score: ${roundedMeld}. Estimated 90-day waitlist mortality: ${mortality90d}.`,
      perioperativeRisk: roundedMeld >= 15 ? "Substantially elevated perioperative liver failure and bleeding risk. High-level critical care and liver transplant center backup recommended." : "Lower perioperative decompensation risk.",
      source: "Kamath PS et al. Hepatology 2001;33:464-470; Kim WR et al. N Engl J Med 2008;359(10):1018-1026; OPTN/UNOS 2016."
    };
  }

  // ==========================================================================
  // 22. CURB-65 PNEUMONIA SEVERITY SCORE
  // ==========================================================================
  function calculateCURB65(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.confusion) pts += 1;
    if (c.ureaHigh) pts += 1;
    if (c.rrGte30) pts += 1;
    if (c.bpLow) pts += 1;
    if (c.ageGte65) pts += 1;

    let tier = "Low Risk";
    let mortality = "0.7% – 2.1%";
    let siteOfCare = "Outpatient treatment usually suitable.";
    let riskClass = "good";

    if (pts <= 1) {
      tier = "Low Risk (Score 0–1)";
      mortality = "< 3%";
      siteOfCare = "Outpatient therapy candidate. Re-evaluate if condition fails to improve within 48h.";
      riskClass = "good";
    } else if (pts === 2) {
      tier = "Moderate Risk (Score 2)";
      mortality = "~9%";
      siteOfCare = "Short hospital inpatient stay or supervised outpatient treatment.";
      riskClass = "warn";
    } else if (pts === 3) {
      tier = "Severe Risk (Score 3)";
      mortality = "15% – 20%";
      siteOfCare = "Hospital inpatient admission indicated. Monitor for clinical deterioration.";
      riskClass = "alert";
    } else {
      tier = `Very Severe Risk (Score ${pts})`;
      mortality = "27% – 40%";
      siteOfCare = "Urgent inpatient admission; evaluate immediately for Intensive Care Unit (ICU) care.";
      riskClass = "alert";
    }

    return {
      score: pts,
      tier,
      mortality,
      siteOfCare,
      riskClass,
      source: "Lim WS et al. Thorax 2003;58(5):377-382; British Thoracic Society (BTS) Guidelines."
    };
  }

  // ==========================================================================
  // 23. GLASGOW COMA SCALE (GCS)
  // ==========================================================================
  function calculateGCS(eye, verbal, motor) {
    const e = parseInt(eye, 10) || 4;
    const v = parseInt(verbal, 10) || 5;
    const m = parseInt(motor, 10) || 6;

    const total = e + v + m;

    let injuryClass = "Mild Brain Injury";
    let riskClass = "good";
    let airwayAdvice = "Airway reflexes typically intact. Monitor neurological status.";

    if (total >= 13) {
      injuryClass = "Mild Brain Injury (GCS 13–15)";
      riskClass = "good";
      airwayAdvice = "Airway reflexes intact. Perform frequent serial neurological examinations.";
    } else if (total >= 9) {
      injuryClass = "Moderate Brain Injury (GCS 9–12)";
      riskClass = "warn";
      airwayAdvice = "Intermediate risk of airway loss or aspiration. Urgent non-contrast CT brain indicated.";
    } else {
      injuryClass = "Severe Brain Injury (GCS 3–8)";
      riskClass = "alert";
      airwayAdvice = "CRITICAL: Loss of protective airway reflexes (GCS ≤ 8 mandates endotracheal intubation). Avoid hypoxia and hypotension (maintain SBP > 100 mmHg).";
    }

    return {
      total,
      breakdown: `E${e} V${v} M${m}`,
      injuryClass,
      riskClass,
      airwayAdvice,
      source: "Teasdale G, Jennett B. Lancet 1974;2(7872):81-84; Teasdale G et al. Lancet Neurol 2014;13(8):844-854."
    };
  }

  // ==========================================================================
  // 24. MEWS & NEWS2 EARLY WARNING SCORES
  // ==========================================================================
  function calculateMEWS(sbpVal, hrVal, rrVal, tempVal, avpuVal) {
    const sbp = num(sbpVal);
    const hr = num(hrVal);
    const rr = num(rrVal);
    const temp = num(tempVal);
    const avpu = avpuVal || "A";

    let score = 0;

    // SBP
    if (sbp !== null) {
      if (sbp <= 70) score += 3;
      else if (sbp <= 80) score += 2;
      else if (sbp <= 100) score += 1;
      else if (sbp >= 200) score += 2;
    }

    // HR
    if (hr !== null) {
      if (hr < 40) score += 2;
      else if (hr <= 50) score += 1;
      else if (hr <= 100) score += 0;
      else if (hr <= 110) score += 1;
      else if (hr <= 129) score += 2;
      else score += 3;
    }

    // RR
    if (rr !== null) {
      if (rr < 9) score += 2;
      else if (rr <= 14) score += 0;
      else if (rr <= 20) score += 1;
      else if (rr <= 29) score += 2;
      else score += 3;
    }

    // Temp
    if (temp !== null) {
      if (temp < 35.0) score += 2;
      else if (temp < 38.5) score += 0;
      else score += 2;
    }

    // AVPU
    if (avpu === "V") score += 1;
    else if (avpu === "P") score += 2;
    else if (avpu === "U") score += 3;

    let tier = "Low Clinical Risk (Score 0–2)";
    let riskClass = "good";
    let action = "Continue routine ward observation (minimum 12-hourly).";

    if (score >= 5) {
      tier = `High Clinical Risk (Score ${score} ≥ 5)`;
      riskClass = "alert";
      action = "CRITICAL: Immediate medical review. Call Medical Emergency Team / Critical Care Outreach. Assess for ICU transfer.";
    } else if (score >= 3) {
      tier = `Intermediate Clinical Risk (Score ${score})`;
      riskClass = "warn";
      action = "Increase observation frequency to 2–4 hourly. Inform primary medical team.";
    }

    return {
      score,
      tier,
      riskClass,
      action,
      source: "Subbe CP et al. QJM 2001;94(10):521-526."
    };
  }

  function calculateNEWS2(params) {
    const p = params || {};
    const rr = num(p.rr);
    const spo2 = num(p.spo2);
    const isScale2 = !!p.hypercapnicTarget; // SpO2 Scale 2
    const onO2 = !!p.supplementalOxygen;
    const sbp = num(p.sbp);
    const hr = num(p.hr);
    const cvpu = p.consciousness || "A"; // A, C, V, P, U
    const temp = num(p.temp);

    let score = 0;
    let hasRedScore3 = false;

    // Respiration Rate
    if (rr !== null) {
      let rPts = 0;
      if (rr <= 8) rPts = 3;
      else if (rr <= 11) rPts = 1;
      else if (rr <= 20) rPts = 0;
      else if (rr <= 24) rPts = 2;
      else rPts = 3;
      if (rPts === 3) hasRedScore3 = true;
      score += rPts;
    }

    // SpO2
    if (spo2 !== null) {
      let spPts = 0;
      if (!isScale2) {
        // Scale 1 (standard)
        if (spo2 <= 91) spPts = 3;
        else if (spo2 <= 93) spPts = 2;
        else if (spo2 <= 95) spPts = 1;
        else spPts = 0;
      } else {
        // Scale 2 (hypercapnic target 88–92%)
        if (spo2 <= 83) spPts = 3;
        else if (spo2 <= 85) spPts = 2;
        else if (spo2 <= 87) spPts = 1;
        else if (spo2 <= 92) spPts = 0;
        else if (spo2 <= 94) spPts = onO2 ? 1 : 0;
        else if (spo2 <= 96) spPts = onO2 ? 2 : 0;
        else spPts = onO2 ? 3 : 0;
      }
      if (spPts === 3) hasRedScore3 = true;
      score += spPts;
    }

    // Supplemental Oxygen
    if (onO2) score += 2;

    // Systolic Blood Pressure
    if (sbp !== null) {
      let bpPts = 0;
      if (sbp <= 90) bpPts = 3;
      else if (sbp <= 100) bpPts = 2;
      else if (sbp <= 110) bpPts = 1;
      else if (sbp <= 219) bpPts = 0;
      else bpPts = 3;
      if (bpPts === 3) hasRedScore3 = true;
      score += bpPts;
    }

    // Pulse
    if (hr !== null) {
      let hrPts = 0;
      if (hr <= 40) hrPts = 3;
      else if (hr <= 50) hrPts = 1;
      else if (hr <= 90) hrPts = 0;
      else if (hr <= 110) hrPts = 1;
      else if (hr <= 130) hrPts = 2;
      else hrPts = 3;
      if (hrPts === 3) hasRedScore3 = true;
      score += hrPts;
    }

    // Consciousness
    if (cvpu !== "A") {
      score += 3;
      hasRedScore3 = true;
    }

    // Temperature
    if (temp !== null) {
      let tPts = 0;
      if (temp <= 35.0) tPts = 3;
      else if (temp <= 36.0) tPts = 1;
      else if (temp <= 38.0) tPts = 0;
      else if (temp <= 39.0) tPts = 1;
      else tPts = 2;
      if (tPts === 3) hasRedScore3 = true;
      score += tPts;
    }

    let riskClass = "good";
    let trigger = "Low Clinical Risk (Score 0–4)";
    let response = "Routine ward observation (minimum 4–6 hourly). Continue current care plan.";

    if (score >= 7) {
      riskClass = "alert";
      trigger = `High Clinical Risk (Total Score ${score} ≥ 7)`;
      response = "EMERGENCY: Immediate assessment by critical care specialist or emergency outreach team with advanced airway skills. Transfer to ICU/HDU.";
    } else if (score >= 5 || hasRedScore3) {
      riskClass = "warn";
      trigger = hasRedScore3 && score < 5 ? `Low-Medium Risk (Single parameter RED score 3)` : `Medium Clinical Risk (Score ${score})`;
      response = "Urgent review by clinician / doctor within 1 hour. Increase observation frequency to minimum hourly. Continuous vital signs monitoring.";
    }

    return {
      score,
      hasRedScore3,
      trigger,
      riskClass,
      response,
      source: "Royal College of Physicians. National Early Warning Score (NEWS) 2, London: RCP, 2017."
    };
  }

  // ==========================================================================
  // 25. qSOFA (QUICK SEPSIS-RELATED ORGAN FAILURE ASSESSMENT)
  // ==========================================================================
  function calculateQSOFA(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.rrGte22) pts += 1;
    if (c.alteredMentation) pts += 1;
    if (c.sbpLte100) pts += 1;

    let status = "Negative Screening (Score 0–1)";
    let riskClass = "good";
    let recommendation = "Low likelihood of sepsis-related in-hospital mortality or prolonged ICU stay. Continue routine clinical monitoring.";

    if (pts >= 2) {
      status = `Positive qSOFA (Score ${pts} ≥ 2)`;
      riskClass = "alert";
      recommendation = "HIGH RISK: Sepsis-related in-hospital mortality and prolonged ICU stay significantly increased. Promptly assess for organ dysfunction (full SOFA), measure serum lactate, draw blood cultures, initiate empiric broad-spectrum antibiotics, and start IV crystalloid resuscitation.";
    }

    return {
      score: pts,
      status,
      riskClass,
      recommendation,
      source: "Singer M et al. Sepsis-3 Guidelines. JAMA 2016;315(8):801-810."
    };
  }

  // ==========================================================================
  // 26. FRAIL SCALE & CLINICAL FRAILTY SCALE (ROCKWOOD CFS 1–9)
  // ==========================================================================
  function calculateFRAIL(criteria) {
    const c = criteria || {};
    let pts = 0;
    if (c.fatigue) pts += 1;
    if (c.resistance) pts += 1;
    if (c.ambulation) pts += 1;
    if (c.illness) pts += 1;
    if (c.lossOfWeight) pts += 1;

    let category = "Robust / Non-frail (Score 0)";
    let riskClass = "good";
    let clinicalImpact = "Normal physiological reserve. Standard perioperative pathways suitable.";

    if (pts >= 3) {
      category = `Frail (Score ${pts}/5)`;
      riskClass = "alert";
      clinicalImpact = "Substantially increased risk of postoperative delirium, cardiopulmonary complications, loss of independence, and extended ICU/hospital stay. Implement multimodal prehabilitation, delirium precautions, and opioid-sparing anaesthesia.";
    } else if (pts >= 1) {
      category = `Pre-frail (Score ${pts}/5)`;
      riskClass = "warn";
      clinicalImpact = "Mildly diminished physiological reserve. Targeted pre-assessment and nutrition/mobility support recommended.";
    }

    return {
      score: pts,
      category,
      riskClass,
      clinicalImpact,
      source: "Morley JE et al. J Am Med Dir Assoc 2012;13(8):678-681."
    };
  }

  function calculateClinicalFrailtyScale(scoreVal) {
    const s = parseInt(scoreVal, 10) || 1;
    const clamped = Math.min(Math.max(s, 1), 9);

    const levels = {
      1: {
        title: "1. Very Fit",
        descriptor: "People who are robust, active, energetic and motivated. These people commonly exercise regularly. They are among the fittest for their age.",
        riskClass: "good",
        isFrail: false
      },
      2: {
        title: "2. Well",
        descriptor: "People who have no active disease symptoms but are less fit than category 1. Often, they exercise or are occasionally very active.",
        riskClass: "good",
        isFrail: false
      },
      3: {
        title: "3. Managing Well",
        descriptor: "People whose medical problems are well controlled, but are not regularly active beyond routine walking.",
        riskClass: "good",
        isFrail: false
      },
      4: {
        title: "4. Vulnerable",
        descriptor: "While not dependent on others for daily help, often symptoms limit activities. A common complaint is being 'slowed up', and/or being tired during the day.",
        riskClass: "warn",
        isFrail: false
      },
      5: {
        title: "5. Mildly Frail",
        descriptor: "These people often have more evident slowing, and need help in high order IADLs (finances, transportation, heavy housework, medications).",
        riskClass: "alert",
        isFrail: true
      },
      6: {
        title: "6. Moderately Frail",
        descriptor: "People who need help with all outside activities and with keeping house. Inside, they often have problems with stairs and need help with bathing and may need minimal assistance with dressing.",
        riskClass: "alert",
        isFrail: true
      },
      7: {
        title: "7. Severely Frail",
        descriptor: "Completely dependent for personal care, from whatever cause (physical or cognitive). Even so, they seem stable and not at high risk of dying (within ~6 months).",
        riskClass: "alert",
        isFrail: true
      },
      8: {
        title: "8. Very Severely Frail",
        descriptor: "Completely dependent, approaching the end of life. Typically, they could not recover even from a minor illness.",
        riskClass: "alert",
        isFrail: true
      },
      9: {
        title: "9. Terminally Ill",
        descriptor: "Approaching the end of life. This category applies to people with a life expectancy < 6 months, who are not otherwise evidently frail.",
        riskClass: "alert",
        isFrail: true
      }
    };

    const lvl = levels[clamped];

    return {
      score: clamped,
      title: lvl.title,
      descriptor: lvl.descriptor,
      riskClass: lvl.riskClass,
      isFrail: lvl.isFrail,
      anaestheticGuidance: lvl.isFrail
        ? "CFS ≥ 5: Patient is frail. High risk for postoperative delirium, ICU admission, and functional decline. Plan multimodal opioid-sparing analgesia, maintain normothermia and cerebral perfusion, and avoid centrally acting anticholinergics and benzodiazepines."
        : "CFS 1–4: Non-frail. Standard age-adjusted anaesthetic conduct indicated.",
      source: "Rockwood K et al. CMAJ 2005;173(5):489-495; Dalhousie University Geriatric Medicine."
    };
  }

  // ==========================================================================
  // 27. REVISED TRAUMA SCORE (RTS - TRIAGE & TRISS PHYSIOLOGICAL)
  // ==========================================================================
  function calculateRevisedTraumaScore(gcsVal, sbpVal, rrVal) {
    const gcs = num(gcsVal) || 15;
    const sbp = num(sbpVal) !== null ? num(sbpVal) : 120;
    const rr = num(rrVal) !== null ? num(rrVal) : 16;

    // Coded values (0 to 4)
    let gcsC = 4;
    if (gcs >= 13) gcsC = 4;
    else if (gcs >= 9) gcsC = 3;
    else if (gcs >= 6) gcsC = 2;
    else if (gcs >= 4) gcsC = 1;
    else gcsC = 0;

    let sbpC = 4;
    if (sbp > 89) sbpC = 4;
    else if (sbp >= 76) sbpC = 3;
    else if (sbp >= 50) sbpC = 2;
    else if (sbp >= 1) sbpC = 1;
    else sbpC = 0;

    let rrC = 4;
    if (rr >= 10 && rr <= 29) rrC = 4;
    else if (rr > 29) rrC = 3;
    else if (rr >= 6) rrC = 2;
    else if (rr >= 1) rrC = 1;
    else rrC = 0;

    // Triage RTS (0 to 12)
    const triageRts = gcsC + sbpC + rrC;

    // Physiological RTS (TRISS weighted formula: 0.9368 GCS + 0.7326 SBP + 0.2908 RR)
    const physRts = (0.9368 * gcsC) + (0.7326 * sbpC) + (0.2908 * rrC);

    // Probability of survival: Ps = 1 / (1 + e^-b), where b = -3.5718 + physRts
    const b = -3.5718 + physRts;
    const ps = 1 / (1 + Math.exp(-b));
    const survivalPct = round(ps * 100, 1);

    let triageCategory = "Triage RTS: Normal / Minor Trauma (Score 12)";
    let riskClass = "good";
    let recommendation = "Routine trauma assessment. Monitor for occult injury.";

    if (triageRts <= 11) {
      triageCategory = `Triage RTS: Severe Trauma (Score ${triageRts} ≤ 11)`;
      riskClass = "alert";
      recommendation = "Score ≤ 11 indicates high mortality risk and trauma center criteria. Immediate transport to Level 1 / Major Trauma Center and activate Massive Transfusion Protocol (MTP) if indicated.";
    }

    return {
      triageScore: triageRts,
      physiologicalScore: round(physRts, 3),
      survivalProbabilityPct: survivalPct,
      coded: { gcs: gcsC, sbp: sbpC, rr: rrC },
      triageCategory,
      riskClass,
      recommendation,
      source: "Champion HR et al. J Trauma 1989;29(5):623-629."
    };
  }

  // Export module
  window.KnockoutCalculators = Object.assign(window.KnockoutCalculators || {}, {
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
    calculateCHA2DS2VASc,
    calculateCHADS2,
    calculateRCRI,
    calculateWellsPE,
    calculatePESI,
    calculateFLACC,
    calculateCHEOPS,
    calculateBodyWeights,
    calculateCorrectedCalcium,
    calculateCorrectedSodium,
    calculateMELDNa,
    calculateCURB65,
    calculateGCS,
    calculateMEWS,
    calculateNEWS2,
    calculateQSOFA,
    calculateFRAIL,
    calculateClinicalFrailtyScale,
    calculateRevisedTraumaScore,
    DASI_ITEMS
  });
})();

