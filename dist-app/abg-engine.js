/**
 * KnockoutNotes — Comprehensive Arterial / Venous Blood Gas (ABG/VBG) Clinical Engine
 * 
 * Clinical References:
 * - Boston & Copenhagen Acid-Base Approaches: Narins RG, Emmett M. Medicine 1980;59:161-187.
 * - Winter's Formula: Albert MS, Dell RB, Winters RW. Ann Intern Med 1967;66(2):312-322.
 * - Alveolar Gas Equation & Expected PaO2: Sorbini CA et al. Respiration 1968;25:3-13.
 * - Berlin Definition for ARDS (P/F ratio): ARDS Definition Task Force. JAMA 2012;307(23):2526-2533.
 * - Figge-Jabor-Kazda Albumin Correction: Figge J et al. Crit Care Med 1998;26:1807-1810.
 * - Delta Gap / Delta Ratio: Wrenn K. Ann Emerg Med 1990;19:1310-1313.
 * - Van Slyke / Siggaard-Andersen Base Excess: Siggaard-Andersen O. Scand J Clin Lab Invest 1977;37(Suppl 146):7-15.
 */

(function () {
  "use strict";

  function num(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }

  function round(val, dp) {
    if (val === null || isNaN(val)) return null;
    const f = Math.pow(10, dp);
    return Math.round(val * f) / f;
  }

  function analyzeABG(p) {
    const sampleType = p.sampleType === "vbg" ? "vbg" : "abg";
    const chronicity = p.chronicity === "chronic" ? "chronic" : "acute";
    const ph = num(p.ph);
    const paco2 = num(p.paco2);
    const pao2 = num(p.pao2);
    const hco3Input = num(p.hco3);
    let fio2 = num(p.fio2);
    const na = num(p.na);
    const cl = num(p.cl);
    const albumin = num(p.albumin);
    const age = num(p.age);
    const pb = num(p.pb) || 760;

    if (ph === null || paco2 === null) {
      return { error: "Please enter at least pH and PaCO₂ to begin blood gas analysis." };
    }

    let fio2Frac = 0.21;
    let fio2Pct = 21;
    if (fio2 !== null && fio2 > 0) {
      if (fio2 > 1.0) {
        fio2Pct = fio2;
        fio2Frac = fio2 / 100;
      } else {
        fio2Frac = fio2;
        fio2Pct = round(fio2 * 100, 1);
      }
    }

    let vbgNote = "";
    if (sampleType === "vbg") {
      vbgNote = "VBG Relevance: Venous blood gas closely reflects arterial pH (mean difference: -0.03 to -0.04) and arterial HCO₃⁻ (mean difference: +1 to +2 mEq/L). Venous PvCO₂ is typically 4–6 mmHg higher than PaCO₂ (estimated equivalent PaCO₂: ~" + round(paco2 - 5, 1) + " mmHg). Note: PvO₂ reflects tissue extraction (typically 35–45 mmHg) and CANNOT be used to assess arterial oxygenation or calculate P/F ratio.";
    }

    let hco3 = hco3Input;
    let hco3Calculated = false;
    if (hco3 === null) {
      const derived = 0.0307 * paco2 * Math.pow(10, ph - 6.1);
      hco3 = round(derived, 1);
      hco3Calculated = true;
    }

    // Step 1: Acid–Base Status
    let phStatus = "Normal pH";
    let phClass = "good";
    if (ph < 7.35) {
      phStatus = "Acidaemia";
      phClass = "alert";
    } else if (ph > 7.45) {
      phStatus = "Alkalaemia";
      phClass = "alert";
    }

    // Standard Base Excess (SBE) / Van Slyke Equation
    // SBE = 0.9287 * (HCO3 - 24.4 + 14.83 * (pH - 7.4))
    const sbe = round(0.9287 * (hco3 - 24.4 + 14.83 * (ph - 7.4)), 1);
    let sbeInterp = "";
    let sbeClass = "good";
    if (sbe < -2) {
      sbeInterp = "Negative Base Excess / Base Deficit (" + sbe + " mEq/L): Significant metabolic acid accumulation or bicarbonate deficit.";
      sbeClass = "alert";
    } else if (sbe > 2) {
      sbeInterp = "Positive Base Excess (" + sbe + " mEq/L): Significant metabolic alkalosis or bicarbonate retention.";
      sbeClass = "alert";
    } else {
      sbeInterp = "Normal Base Excess (" + sbe + " mEq/L): Within normal physiological reference range (-2 to +2 mEq/L).";
      sbeClass = "good";
    }

    // Step 2: Primary Acid–Base Disturbance
    let primaryDisorders = [];
    let isRespAcidosis = false;
    let isRespAlkalosis = false;
    let isMetAcidosis = false;
    let isMetAlkalosis = false;

    if (ph < 7.35) {
      if (paco2 > 45 && hco3 < 22) {
        primaryDisorders.push("Mixed Respiratory & Metabolic Acidosis");
        isRespAcidosis = true;
        isMetAcidosis = true;
      } else if (paco2 > 45) {
        primaryDisorders.push("Primary Respiratory Acidosis");
        isRespAcidosis = true;
      } else if (hco3 < 22) {
        primaryDisorders.push("Primary Metabolic Acidosis");
        isMetAcidosis = true;
      } else {
        if (paco2 >= 40) {
          primaryDisorders.push("Primary Respiratory Acidosis (Mild / Early)");
          isRespAcidosis = true;
        } else {
          primaryDisorders.push("Primary Metabolic Acidosis (Mild / Early)");
          isMetAcidosis = true;
        }
      }
    } else if (ph > 7.45) {
      if (paco2 < 35 && hco3 > 26) {
        primaryDisorders.push("Mixed Respiratory & Metabolic Alkalosis");
        isRespAlkalosis = true;
        isMetAlkalosis = true;
      } else if (paco2 < 35) {
        primaryDisorders.push("Primary Respiratory Alkalosis");
        isRespAlkalosis = true;
      } else if (hco3 > 26) {
        primaryDisorders.push("Primary Metabolic Alkalosis");
        isMetAlkalosis = true;
      } else {
        if (paco2 <= 40) {
          primaryDisorders.push("Primary Respiratory Alkalosis (Mild / Early)");
          isRespAlkalosis = true;
        } else {
          primaryDisorders.push("Primary Metabolic Alkalosis (Mild / Early)");
          isMetAlkalosis = true;
        }
      }
    } else {
      // Normal pH (7.35 - 7.45)
      if (paco2 > 45 && hco3 > 26) {
        primaryDisorders.push("Compensated Respiratory Acidosis OR Compensated Metabolic Alkalosis");
        if (ph < 7.40) isRespAcidosis = true;
        else isMetAlkalosis = true;
      } else if (paco2 < 35 && hco3 < 22) {
        primaryDisorders.push("Compensated Respiratory Alkalosis OR Compensated Metabolic Acidosis");
        if (ph < 7.40) isMetAcidosis = true;
        else isRespAlkalosis = true;
      } else {
        primaryDisorders.push("Normal Acid–Base Status");
      }
    }

    // Step 3: Expected Compensation Assessment
    let compRule = "";
    let compExpectedText = "";
    let compStatus = "";
    let compClass = "good";
    let wintersResult = null;

    if (isMetAcidosis || (hco3 < 22 && !isRespAlkalosis)) {
      const expCenter = 1.5 * hco3 + 8;
      const minExp = round(expCenter - 2, 1);
      const maxExp = round(expCenter + 2, 1);
      wintersResult = {
        center: round(expCenter, 1),
        min: minExp,
        max: maxExp,
        measured: paco2
      };
      compRule = "Winter's Formula: Expected PaCO₂ = (1.5 × [HCO₃⁻]) + 8 ± 2 mmHg";
      compExpectedText = minExp + " – " + maxExp + " mmHg";

      if (paco2 > maxExp) {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) is HIGHER than expected Winter's range (" + minExp + "–" + maxExp + " mmHg). Indicates CONCURRENT RESPIRATORY ACIDOSIS (inadequate alveolar hyperventilation / respiratory depression).";
        compClass = "alert";
      } else if (paco2 < minExp) {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) is LOWER than expected Winter's range (" + minExp + "–" + maxExp + " mmHg). Indicates CONCURRENT RESPIRATORY ALKALOSIS (excessive alveolar hyperventilation).";
        compClass = "warn";
      } else {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) falls within expected Winter's range (" + minExp + "–" + maxExp + " mmHg). Demonstrates APPROPRIATE SIMPLE RESPIRATORY COMPENSATION.";
        compClass = "good";
      }
    } else if (isMetAlkalosis || (hco3 > 26 && !isRespAcidosis)) {
      const expCenter = 40 + 0.7 * (hco3 - 24);
      const minExp = round(expCenter - 2, 1);
      const maxExp = round(expCenter + 2, 1);
      compRule = "Metabolic Alkalosis Compensation: Expected PaCO₂ = 40 + 0.7 × ([HCO₃⁻] - 24) ± 2 mmHg (max ~55 mmHg)";
      compExpectedText = minExp + " – " + maxExp + " mmHg";

      if (paco2 > maxExp) {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) is HIGHER than expected (" + minExp + "–" + maxExp + " mmHg). Concurrent SECONDARY RESPIRATORY ACIDOSIS.";
        compClass = "alert";
      } else if (paco2 < minExp) {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) is LOWER than expected (" + minExp + "–" + maxExp + " mmHg). Concurrent SECONDARY RESPIRATORY ALKALOSIS.";
        compClass = "warn";
      } else {
        compStatus = "Measured PaCO₂ (" + paco2 + " mmHg) matches expected hypoventilatory compensation (" + minExp + "–" + maxExp + " mmHg).";
        compClass = "good";
      }
    } else if (isRespAcidosis) {
      const deltaP = Math.max(0, paco2 - 40);
      if (chronicity === "acute") {
        const expHco3 = 24 + 1.0 * (deltaP / 10);
        const minH = round(expHco3 - 2, 1);
        const maxH = round(expHco3 + 2, 1);
        compRule = "Acute Respiratory Acidosis: [HCO₃⁻] rises 1 mEq/L per 10 mmHg rise in PaCO₂ above 40";
        compExpectedText = minH + " – " + maxH + " mEq/L";

        if (hco3 > maxH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is HIGHER than expected acute compensation (" + minH + "–" + maxH + "). Suggests chronicity or concurrent METABOLIC ALKALOSIS.";
          compClass = "warn";
        } else if (hco3 < minH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is LOWER than expected acute compensation (" + minH + "–" + maxH + "). Concurrent METABOLIC ACIDOSIS.";
          compClass = "alert";
        } else {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) shows appropriate ACUTE renal compensation.";
          compClass = "good";
        }
      } else {
        const expHco3 = 24 + 3.5 * (deltaP / 10);
        const minH = round(expHco3 - 2, 1);
        const maxH = round(expHco3 + 2, 1);
        compRule = "Chronic Respiratory Acidosis: [HCO₃⁻] rises 3.5–4.0 mEq/L per 10 mmHg rise in PaCO₂ above 40";
        compExpectedText = minH + " – " + maxH + " mEq/L";

        if (hco3 > maxH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) exceeds chronic compensation (" + minH + "–" + maxH + "). Concurrent METABOLIC ALKALOSIS.";
          compClass = "alert";
        } else if (hco3 < minH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is lower than chronic compensation (" + minH + "–" + maxH + "). Concurrent METABOLIC ACIDOSIS or acute decompensation.";
          compClass = "alert";
        } else {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) shows appropriate CHRONIC renal compensation.";
          compClass = "good";
        }
      }
    } else if (isRespAlkalosis) {
      const deltaP = Math.max(0, 40 - paco2);
      if (chronicity === "acute") {
        const expHco3 = 24 - 2.0 * (deltaP / 10);
        const minH = round(Math.max(12, expHco3 - 2), 1);
        const maxH = round(expHco3 + 2, 1);
        compRule = "Acute Respiratory Alkalosis: [HCO₃⁻] falls 2 mEq/L per 10 mmHg drop in PaCO₂ below 40";
        compExpectedText = minH + " – " + maxH + " mEq/L";

        if (hco3 < minH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is lower than acute expected (" + minH + "–" + maxH + "). Concurrent METABOLIC ACIDOSIS.";
          compClass = "alert";
        } else if (hco3 > maxH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is higher than acute expected (" + minH + "–" + maxH + "). Concurrent METABOLIC ALKALOSIS.";
          compClass = "warn";
        } else {
          compStatus = "Appropriate ACUTE compensation for respiratory alkalosis.";
          compClass = "good";
        }
      } else {
        const expHco3 = 24 - 5.0 * (deltaP / 10);
        const minH = round(Math.max(12, expHco3 - 2), 1);
        const maxH = round(expHco3 + 2, 1);
        compRule = "Chronic Respiratory Alkalosis: [HCO₃⁻] falls 5 mEq/L per 10 mmHg drop in PaCO₂ below 40";
        compExpectedText = minH + " – " + maxH + " mEq/L";

        if (hco3 < minH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is lower than chronic expected (" + minH + "–" + maxH + "). Concurrent METABOLIC ACIDOSIS.";
          compClass = "alert";
        } else if (hco3 > maxH) {
          compStatus = "Measured HCO₃⁻ (" + hco3 + " mEq/L) is higher than chronic expected (" + minH + "–" + maxH + "). Concurrent METABOLIC ALKALOSIS.";
          compClass = "warn";
        } else {
          compStatus = "Appropriate CHRONIC compensation for respiratory alkalosis.";
          compClass = "good";
        }
      }
    } else {
      compRule = "Physiological Baseline Check";
      compExpectedText = "PaCO₂ 35–45 mmHg | HCO₃⁻ 22–26 mEq/L";
      compStatus = "Values are within nominal baseline physiological limits.";
      compClass = "good";
    }

    // Step 4: Anion Gap & Delta Gap
    let agResult = null;
    let deltaGapResult = null;

    if (na !== null && cl !== null) {
      const rawAG = round(na - (cl + hco3), 1);
      let effectiveAG = rawAG;
      let albDetails = null;

      if (albumin !== null && albumin > 0) {
        effectiveAG = round(rawAG + 2.5 * (4.0 - albumin), 1);
        albDetails = "Figge Albumin Correction: " + rawAG + " + 2.5 × (4.0 - " + albumin + ") = " + effectiveAG + " mEq/L";
      }

      let agCategory = "Normal Anion Gap";
      let agClass = "good";
      if (effectiveAG > 12) {
        agCategory = "High Anion Gap (HAGMA)";
        agClass = "alert";
      } else if (effectiveAG < 4) {
        agCategory = "Low Anion Gap";
        agClass = "warn";
      }

      agResult = {
        rawAG,
        effectiveAG,
        albDetails,
        category: agCategory,
        riskClass: agClass
      };

      const deltaAG = round(effectiveAG - 12, 1);
      const deltaHco3 = round(24 - hco3, 1);
      const deltaGap = round(deltaAG - deltaHco3, 1);

      let deltaRatio = null;
      let deltaInterp = "";
      let deltaClass = "good";

      if (deltaHco3 !== 0) {
        deltaRatio = round(deltaAG / deltaHco3, 2);
        if (deltaRatio < 0.4) {
          deltaInterp = "Delta Ratio < 0.4: Pure Normal Anion Gap Metabolic Acidosis (NAGMA / Hyperchloraemic).";
          deltaClass = "warn";
        } else if (deltaRatio < 0.8) {
          deltaInterp = "Delta Ratio 0.4 – 0.8: Mixed High Anion Gap and Normal Anion Gap Acidosis (HAGMA + NAGMA).";
          deltaClass = "alert";
        } else if (deltaRatio <= 2.0) {
          deltaInterp = "Delta Ratio 0.8 – 2.0: Pure High Anion Gap Metabolic Acidosis (HAGMA e.g. DKA, Lactic acidosis).";
          deltaClass = "good";
        } else {
          deltaInterp = "Delta Ratio > 2.0: High Anion Gap Acidosis combined with pre-existing METABOLIC ALKALOSIS or chronic CO₂ retention compensation.";
          deltaClass = "alert";
        }
      } else {
        deltaInterp = "Delta Bicarbonate is zero (Normal HCO₃ level 24 mEq/L).";
      }

      deltaGapResult = {
        deltaAG,
        deltaHco3,
        deltaGap,
        deltaRatio,
        interpretation: deltaInterp,
        riskClass: deltaClass
      };
    }

    // Step 5: Oxygenation Analysis
    let oxygenation = null;
    if (sampleType === "abg" && pao2 !== null) {
      const pfRatio = round(pao2 / fio2Frac, 1);
      let ardsTier = "Normal Oxygenation (P/F > 400)";
      let ardsClass = "good";

      if (pfRatio <= 100) {
        ardsTier = "Severe ARDS / Severe Hypoxaemia (P/F ≤ 100 mmHg)";
        ardsClass = "alert";
      } else if (pfRatio <= 200) {
        ardsTier = "Moderate ARDS (100 < P/F ≤ 200 mmHg)";
        ardsClass = "alert";
      } else if (pfRatio <= 300) {
        ardsTier = "Mild ARDS (200 < P/F ≤ 300 mmHg)";
        ardsClass = "warn";
      } else if (pfRatio <= 400) {
        ardsTier = "Mildly Impaired Oxygenation (300 < P/F ≤ 400 mmHg)";
        ardsClass = "warn";
      }

      let expectedPao2RoomAir = null;
      if (age !== null && age > 0) {
        expectedPao2RoomAir = round(104.2 - 0.27 * age, 1);
      } else {
        expectedPao2RoomAir = 95.0;
      }
      const expectedPao2CurrentFio2 = round(fio2Pct * 5, 0);

      const waterVapourPressure = 47;
      const rQuotient = 0.8;
      const paO2Alveolar = round(fio2Frac * (pb - waterVapourPressure) - (paco2 / rQuotient), 1);

      let aaGradient = null;
      let expectedAaGradient = null;
      let aaInterp = "";
      let aaClass = "good";

      if (paO2Alveolar !== null) {
        aaGradient = round(paO2Alveolar - pao2, 1);
        if (age !== null && age > 0) {
          expectedAaGradient = round(age / 4 + 4, 1);
        } else {
          expectedAaGradient = 12.0;
        }

        if (aaGradient > (expectedAaGradient + 5)) {
          aaInterp = "Elevated A-a Gradient (" + aaGradient + " mmHg; expected ~" + expectedAaGradient + " mmHg on room air). Indicates intrinsic pulmonary parenchymal pathology, V/Q mismatch, right-to-left shunt, or diffusion impairment. Hypoxaemia is NOT solely due to pure hypoventilation.";
          aaClass = "alert";
        } else if (aaGradient < 0) {
          aaInterp = "Negative A-a gradient calculated (" + aaGradient + " mmHg). In clinical practice, A-a gradient cannot be negative; verify FiO₂ input, barometric pressure, or arterial blood draw.";
          aaClass = "warn";
        } else {
          aaInterp = "Normal A-a Gradient (" + aaGradient + " mmHg; expected ~" + expectedAaGradient + " mmHg). If hypoxaemic, suggests pure alveolar hypoventilation or low inspired FiO₂, with intact pulmonary gas exchange.";
          aaClass = "good";
        }
      }

      oxygenation = {
        pfRatio,
        ardsTier,
        ardsClass,
        fio2Pct,
        fio2Frac,
        expectedPao2RoomAir,
        expectedPao2CurrentFio2,
        paO2Alveolar,
        aaGradient,
        expectedAaGradient,
        aaInterp,
        aaClass
      };
    }

    // Step 6: Formulate Final Integrated Diagnostic Impression
    let diagnosticImpression = "";
    if (primaryDisorders.length) {
      diagnosticImpression = primaryDisorders.join(" + ");
    }
    if (agResult && agResult.effectiveAG > 12) {
      if (!diagnosticImpression.includes("High Anion Gap")) {
        diagnosticImpression += " with High Anion Gap (HAGMA)";
      }
    }
    if (deltaGapResult && deltaGapResult.deltaRatio !== null) {
      if (deltaGapResult.deltaRatio < 0.8 && agResult && agResult.effectiveAG > 12) {
        diagnosticImpression += " + Concomitant NAGMA";
      } else if (deltaGapResult.deltaRatio > 2.0 && agResult && agResult.effectiveAG > 12) {
        diagnosticImpression += " + Concomitant Metabolic Alkalosis";
      }
    }
    if (oxygenation && oxygenation.pfRatio <= 300) {
      diagnosticImpression += " | Oxygenation: " + oxygenation.ardsTier.split("(")[0].trim();
    }

    return {
      sampleType,
      chronicity,
      ph,
      paco2,
      pao2,
      hco3,
      hco3Calculated,
      sbe,
      sbeInterp,
      sbeClass,
      phStatus,
      phClass,
      primaryDisorders,
      diagnosticImpression,
      vbgNote,
      compensation: {
        rule: compRule,
        expected: compExpectedText,
        status: compStatus,
        riskClass: compClass,
        winters: wintersResult
      },
      anionGap: agResult,
      deltaGap: deltaGapResult,
      oxygenation,
      source: "Narins & Emmett (Medicine 1980); Albert & Winters (1967); Berlin ARDS Definition (JAMA 2012); Siggaard-Andersen (1977)."
    };
  }

  if (!window.KnockoutCalculators) window.KnockoutCalculators = {};
  window.KnockoutCalculators.analyzeABG = analyzeABG;
})();