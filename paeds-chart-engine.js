/**
 * KnockoutNotes — Paediatric Drug Chart Engine
 * Directly imported and translated from assets/references/PedsDrugChart.xlsx
 * Provides deterministic calculation of all 16 spreadsheet drugs + airway sizing.
 * Zero remote tracking, pure client-side execution.
 */

(function () {
  "use strict";

  // Raw drug definitions derived 1:1 from Sheet1 of PedsDrugChart.xlsx
  const DRUG_DEFINITIONS = [
    // Emergency Drugs
    {
      id: "adrenaline",
      category: "Emergency Drugs",
      name: "Adrenaline (Epinephrine)",
      doseFormula: (wt) => wt * 10,
      doseDisplay: (wt) => `${round(wt * 10, 1)} mcg`,
      doseBasis: "10 mcg/kg (IV arrest/resuscitation)",
      unit: "mcg",
      route: "IV / IO",
      defaultConcentration: 100, // 100 mcg/mL = 1:10,000
      concentrationLabel: "1:10,000 (100 mcg/mL)",
      availableConcentrations: [
        { label: "1:10,000 (100 mcg/mL)", value: 100, unit: "mcg/mL" },
        { label: "1:1,000 (1 mg/mL = 1000 mcg/mL)", value: 1000, unit: "mcg/mL" }
      ],
      maxSingleDose: 1000, // 1 mg (1000 mcg)
      notes: "Standard arrest dose. Dilute 1:1,000 to 1:10,000 for IV push. Titrate in anaphylaxis."
    },
    {
      id: "atropine",
      category: "Emergency Drugs",
      name: "Atropine",
      doseFormula: (wt) => wt * 0.02,
      doseDisplay: (wt) => `${round(wt * 0.02, 3)} mg (${round(wt * 20, 1)} mcg)`,
      doseBasis: "0.02 mg/kg (20 mcg/kg)",
      unit: "mg",
      route: "IV / IO / IM",
      defaultConcentration: 0.1, // 0.1 mg/mL (100 mcg/mL)
      concentrationLabel: "0.1 mg/mL (diluted)",
      availableConcentrations: [
        { label: "0.1 mg/mL (100 mcg/mL)", value: 0.1, unit: "mg/mL" },
        { label: "0.6 mg/mL (neat ampoule)", value: 0.6, unit: "mg/mL" }
      ],
      minSingleDose: 0.1, // Minimum dose 0.1 mg to prevent paradoxical bradycardia
      maxSingleDose: 0.5, // 0.5 mg child, 1.0 mg adolescent
      notes: "Minimum 0.1 mg to avoid central paradoxical bradycardia. Max single dose 0.5 mg."
    },
    {
      id: "glycopyrrolate",
      category: "Emergency Drugs",
      name: "Glycopyrrolate",
      doseFormula: (wt) => wt * 0.01,
      doseDisplay: (wt) => `${round(wt * 0.01, 3)} mg (${round(wt * 10, 1)} mcg)`,
      doseBasis: "0.01 mg/kg (10 mcg/kg)",
      unit: "mg",
      route: "IV / IM",
      defaultConcentration: 0.2, // 0.2 mg/mL (200 mcg/mL)
      concentrationLabel: "0.2 mg/mL (neat ampoule)",
      availableConcentrations: [
        { label: "0.2 mg/mL (neat)", value: 0.2, unit: "mg/mL" },
        { label: "0.05 mg/mL (1:4 dilution)", value: 0.05, unit: "mg/mL" }
      ],
      maxSingleDose: 0.2,
      notes: "Quaternary amine, does not cross blood-brain barrier. Co-administer with neostigmine."
    },

    // Sedation
    {
      id: "ketamine_sed",
      category: "Sedation",
      name: "Ketamine (Sedation)",
      doseFormula: (wt) => wt * 0.5,
      doseDisplay: (wt) => `${round(wt * 0.5, 2)} mg`,
      doseBasis: "0.5 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 10, // 10 mg/mL
      concentrationLabel: "10 mg/mL (diluted 1:5 from 50 mg/mL)",
      availableConcentrations: [
        { label: "10 mg/mL (diluted)", value: 10, unit: "mg/mL" },
        { label: "50 mg/mL (neat ampoule)", value: 50, unit: "mg/mL" }
      ],
      maxSingleDose: 50,
      notes: "Sub-dissociative sedation/procedural analgesia. Preserves airway reflexes."
    },
    {
      id: "midazolam",
      category: "Sedation",
      name: "Midazolam",
      doseFormula: (wt) => [wt * 0.05, wt * 0.1],
      doseDisplay: (wt) => `${round(wt * 0.05, 3)}–${round(wt * 0.1, 3)} mg`,
      doseBasis: "0.05–0.1 mg/kg",
      unit: "mg",
      route: "IV / Oral (oral dose higher: 0.5 mg/kg)",
      defaultConcentration: 1, // 1 mg/mL
      concentrationLabel: "1 mg/mL (neat or diluted)",
      availableConcentrations: [
        { label: "1 mg/mL", value: 1, unit: "mg/mL" },
        { label: "5 mg/mL", value: 5, unit: "mg/mL" }
      ],
      maxSingleDose: 5,
      notes: "IV dose: 0.05–0.1 mg/kg. Oral premedication: 0.5 mg/kg (max 15–20 mg)."
    },

    // Induction
    {
      id: "propofol",
      category: "Induction",
      name: "Propofol",
      doseFormula: (wt) => [wt * 2, wt * 3],
      doseDisplay: (wt) => `${round(wt * 2, 1)}–${round(wt * 3, 1)} mg`,
      doseBasis: "2–3 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 10, // 1% = 10 mg/mL
      concentrationLabel: "1% (10 mg/mL)",
      availableConcentrations: [
        { label: "1% (10 mg/mL)", value: 10, unit: "mg/mL" },
        { label: "2% (20 mg/mL)", value: 20, unit: "mg/mL" }
      ],
      maxSingleDose: 250,
      notes: "Higher dose requirements in young infants due to larger volume of distribution."
    },
    {
      id: "ketamine_ind",
      category: "Induction",
      name: "Ketamine (Induction)",
      doseFormula: (wt) => [wt * 1, wt * 2],
      doseDisplay: (wt) => `${round(wt * 1, 1)}–${round(wt * 2, 1)} mg`,
      doseBasis: "1–2 mg/kg IV (3–5 mg/kg IM)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 10, // 10 mg/mL
      concentrationLabel: "10 mg/mL (diluted)",
      availableConcentrations: [
        { label: "10 mg/mL (diluted)", value: 10, unit: "mg/mL" },
        { label: "50 mg/mL (neat)", value: 50, unit: "mg/mL" }
      ],
      maxSingleDose: 150,
      notes: "Excellent for haemodynamically unstable or asthmatic children. Causes bronchodilation."
    },
    {
      id: "etomidate",
      category: "Induction",
      name: "Etomidate",
      doseFormula: (wt) => [wt * 0.2, wt * 0.3],
      doseDisplay: (wt) => `${round(wt * 0.2, 2)}–${round(wt * 0.3, 2)} mg`,
      doseBasis: "0.2–0.3 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 2, // 2 mg/mL
      concentrationLabel: "2 mg/mL",
      availableConcentrations: [
        { label: "2 mg/mL", value: 2, unit: "mg/mL" }
      ],
      maxSingleDose: 20,
      notes: "Minimal myocardial depression. Transient adrenocortical suppression."
    },

    // Analgesia
    {
      id: "fentanyl",
      category: "Analgesia",
      name: "Fentanyl",
      doseFormula: (wt) => [wt * 1, wt * 2],
      doseDisplay: (wt) => `${round(wt * 1, 1)}–${round(wt * 2, 1)} mcg`,
      doseBasis: "1–2 mcg/kg",
      unit: "mcg",
      route: "IV",
      defaultConcentration: 50, // 50 mcg/mL
      concentrationLabel: "50 mcg/mL",
      availableConcentrations: [
        { label: "50 mcg/mL (neat)", value: 50, unit: "mcg/mL" },
        { label: "10 mcg/mL (diluted 1:5)", value: 10, unit: "mcg/mL" }
      ],
      maxSingleDose: 100,
      notes: "Rapid onset, short duration. Watch for chest wall rigidity with rapid large boluses."
    },
    {
      id: "morphine",
      category: "Analgesia",
      name: "Morphine",
      doseFormula: (wt) => wt * 0.1,
      doseDisplay: (wt) => `${round(wt * 0.1, 2)} mg`,
      doseBasis: "0.1 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 1, // 1 mg/mL (10 mg/mL diluted 1:10)
      concentrationLabel: "1 mg/mL (diluted 1:10)",
      availableConcentrations: [
        { label: "1 mg/mL (diluted)", value: 1, unit: "mg/mL" },
        { label: "10 mg/mL (neat)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 10,
      notes: "Slow IV titration over 3–5 minutes. Watch for histamine release."
    },
    {
      id: "paracetamol",
      category: "Analgesia",
      name: "Paracetamol (Acetaminophen)",
      doseFormula: (wt) => [wt * 10, wt * 15],
      doseDisplay: (wt) => `${round(wt * 10, 1)}–${round(wt * 15, 1)} mg`,
      doseBasis: "10–15 mg/kg IV (max 1000 mg)",
      unit: "mg",
      route: "IV Infusion",
      defaultConcentration: 10, // 10 mg/mL (1 g / 100 mL bottle)
      concentrationLabel: "10 mg/mL (ready-to-use)",
      availableConcentrations: [
        { label: "10 mg/mL (ready-to-use)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 1000,
      notes: "Infuse over 15 minutes. Max single dose 1,000 mg. Max 60 mg/kg/day."
    },
    {
      id: "diclofenac",
      category: "Analgesia",
      name: "Diclofenac",
      doseFormula: (wt) => [wt * 1, wt * 1.5],
      doseDisplay: (wt) => `${round(wt * 1, 1)}–${round(wt * 1.5, 1)} mg`,
      doseBasis: "1–1.5 mg/kg (max 50 mg)",
      unit: "mg",
      route: "IV / PR / IM",
      defaultConcentration: 25, // 25 mg/mL (75 mg / 3 mL)
      concentrationLabel: "25 mg/mL",
      availableConcentrations: [
        { label: "25 mg/mL (neat)", value: 25, unit: "mg/mL" }
      ],
      maxSingleDose: 50,
      notes: "Avoid in dehydration, active bleeding, renal impairment or infants < 6 months."
    },

    // Paralysis
    {
      id: "succinylcholine",
      category: "Paralysis",
      name: "Succinylcholine (Suxamethonium)",
      doseFormula: (wt) => [wt * 1, wt * 2],
      doseDisplay: (wt) => `${round(wt * 1, 1)}–${round(wt * 2, 1)} mg`,
      doseBasis: "1–2 mg/kg IV (infants: 2 mg/kg; children: 1–1.5 mg/kg)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 50, // 50 mg/mL
      concentrationLabel: "50 mg/mL (neat ampoule)",
      availableConcentrations: [
        { label: "50 mg/mL (neat)", value: 50, unit: "mg/mL" },
        { label: "10 mg/mL (diluted 1:5)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 150,
      notes: "Pretreat with atropine in children < 1 year to prevent severe sinus bradycardia."
    },
    {
      id: "atracurium",
      category: "Paralysis",
      name: "Atracurium",
      doseFormula: (wt) => wt * 0.5,
      doseDisplay: (wt) => `${round(wt * 0.5, 2)} mg`,
      doseBasis: "0.5 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 10, // 10 mg/mL
      concentrationLabel: "10 mg/mL",
      availableConcentrations: [
        { label: "10 mg/mL", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 50,
      notes: "Hofmann elimination and ester hydrolysis. Independent of renal and hepatic function."
    },
    {
      id: "vecuronium",
      category: "Paralysis",
      name: "Vecuronium",
      doseFormula: (wt) => wt * 0.1,
      doseDisplay: (wt) => `${round(wt * 0.1, 2)} mg`,
      doseBasis: "0.1 mg/kg",
      unit: "mg",
      route: "IV",
      defaultConcentration: 1, // 1 mg/mL (10 mg vial reconstituted with 10 mL saline)
      concentrationLabel: "1 mg/mL (reconstituted)",
      availableConcentrations: [
        { label: "1 mg/mL", value: 1, unit: "mg/mL" },
        { label: "2 mg/mL", value: 2, unit: "mg/mL" }
      ],
      maxSingleDose: 10,
      notes: "No histamine release. Reconstitute 10 mg powder with 10 mL sterile water or saline."
    },
    {
      id: "rocuronium",
      category: "Paralysis",
      name: "Rocuronium",
      doseFormula: (wt) => [wt * 0.6, wt * 1.2],
      doseDisplay: (wt) => `${round(wt * 0.6, 2)}–${round(wt * 1.2, 2)} mg`,
      doseBasis: "0.6 mg/kg (intubation) to 1.2 mg/kg (rapid sequence)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 10, // 10 mg/mL
      concentrationLabel: "10 mg/mL",
      availableConcentrations: [
        { label: "10 mg/mL", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 100,
      notes: "Onset 60s at 1.2 mg/kg. Reversible with Sugammadex (2–16 mg/kg)."
    },

    // Steroids
    {
      id: "dexamethasone",
      category: "Steroids",
      name: "Dexamethasone",
      doseFormula: (wt) => wt * 0.1,
      doseDisplay: (wt) => `${round(wt * 0.1, 2)} mg`,
      doseBasis: "0.1 mg/kg (PONV: 0.1–0.15 mg/kg; Croup/Airway oedema: 0.15–0.6 mg/kg)",
      unit: "mg",
      route: "IV / Oral",
      defaultConcentration: 4, // 4 mg/mL
      concentrationLabel: "4 mg/mL",
      availableConcentrations: [
        { label: "4 mg/mL", value: 4, unit: "mg/mL" },
        { label: "2 mg/mL", value: 2, unit: "mg/mL" }
      ],
      maxSingleDose: 16,
      notes: "Administer early in surgery for optimal antiemetic and anti-inflammatory benefit."
    },
    {
      id: "hydrocortisone",
      category: "Steroids",
      name: "Hydrocortisone",
      doseFormula: (wt) => wt * 2,
      doseDisplay: (wt) => `${round(wt * 2, 1)} mg`,
      doseBasis: "2 mg/kg (stress cover / acute crisis: 2–4 mg/kg)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 50, // 50 mg/mL (100 mg in 2 mL)
      concentrationLabel: "50 mg/mL (reconstituted)",
      availableConcentrations: [
        { label: "50 mg/mL (100 mg/2 mL)", value: 50, unit: "mg/mL" },
        { label: "10 mg/mL (diluted)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 100,
      notes: "Reconstitute 100 mg vial with 2 mL solvent. Mineralocorticoid and glucocorticoid actions."
    },

    // Anti emetics
    {
      id: "ondansetron",
      category: "Anti emetics",
      name: "Ondansetron",
      doseFormula: (wt) => wt * 0.1,
      doseDisplay: (wt) => `${round(wt * 0.1, 2)} mg`,
      doseBasis: "0.1 mg/kg (max 4 mg)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 2, // 2 mg/mL
      concentrationLabel: "2 mg/mL",
      availableConcentrations: [
        { label: "2 mg/mL", value: 2, unit: "mg/mL" }
      ],
      maxSingleDose: 4,
      notes: "Slow IV injection over 2–5 minutes. Max single dose 4 mg."
    },

    // Reversal
    {
      id: "neostigmine",
      category: "Reversal",
      name: "Neostigmine",
      doseFormula: (wt) => wt * 0.05,
      doseDisplay: (wt) => `${round(wt * 0.05, 3)} mg (${round(wt * 50, 1)} mcg)`,
      doseBasis: "0.05 mg/kg (50 mcg/kg)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 0.5, // 0.5 mg/mL (2.5 mg / 5 mL)
      concentrationLabel: "0.5 mg/mL",
      availableConcentrations: [
        { label: "0.5 mg/mL (neat)", value: 0.5, unit: "mg/mL" },
        { label: "2.5 mg/mL", value: 2.5, unit: "mg/mL" }
      ],
      maxSingleDose: 2.5,
      notes: "MUST administer with Glycopyrrolate (10 mcg/kg) or Atropine (20 mcg/kg) to prevent bradycardia."
    }
  ];

  function round(val, dec) {
    if (val === null || val === undefined || isNaN(val)) return "0";
    const factor = Math.pow(10, dec);
    return (Math.round(val * factor) / factor).toFixed(dec).replace(/\.?0+$/, "");
  }

  // Exact Excel formulas for airway
  function computeAirway(ageYears, weightKg) {
    let uncuffed = null;
    let cuffed = null;
    let igel = null;
    let etDepth = null;

    if (ageYears !== null && ageYears !== undefined && ageYears >= 0 && !isNaN(ageYears)) {
      // Excel Formula: CONCATENATE((C7/4)+4,"/",(C7/4)+3.5," mm")
      uncuffed = (ageYears / 4) + 4;
      cuffed = (ageYears / 4) + 3.5;
      etDepth = (ageYears / 2) + 12; // Standard clinical rule: Age/2 + 12 cm at lips
    }

    if (weightKg !== null && weightKg !== undefined && weightKg > 0 && !isNaN(weightKg)) {
      // Excel Formula: IF(C8<5,"1",IF(C8<12,"1.5",IF(C8<25,"2",IF(C8<35,"2.5",IF(C8<60,"3",IF(C8<90,"4",IF(C8>89,"5")))))))
      if (weightKg < 5) igel = "Size 1 (Pink / <5 kg)";
      else if (weightKg < 12) igel = "Size 1.5 (Blue / 5–12 kg)";
      else if (weightKg < 25) igel = "Size 2 (Grey / 12–25 kg)";
      else if (weightKg < 35) igel = "Size 2.5 (White / 25–35 kg)";
      else if (weightKg < 60) igel = "Size 3 (Yellow / 35–60 kg)";
      else if (weightKg < 90) igel = "Size 4 (Green / 60–90 kg)";
      else igel = "Size 5 (Orange / ≥90 kg)";
    }

    // Equipment Sizing from Table 42-6: Sizing of airway equipment in children
    // Age brackets:
    // Premature: <0.08 yr (<1 mo), wt 0.5-3 kg
    // Neonate: 0-0.08 yr (0-1 mo), wt 3-5 kg
    // Infant: 0.08-1.0 yr (1-12 mo), wt 4-10 kg
    // Toddler: 1-3 yr, wt 8-16 kg
    // Small Child: 3-8 yr, wt 14-30 kg
    // Large Child: 8-12+ yr, wt 25-50+ kg
    let suctionFr = "8 Fr";
    let bladeSize = "1.5";
    let oralAirway = "Size 1 (50 mm)";
    let maskSize = "1";
    let categoryBracket = "Child";

    const a = ageYears !== null && ageYears !== undefined ? ageYears : 0;
    const w = weightKg !== null && weightKg !== undefined ? weightKg : 0;

    if (a < 0.083 || (a === 0 && w > 0 && w < 3)) {
      if (w > 0 && w < 3) {
        categoryBracket = "Premature (<1 mo, 0.5–3 kg)";
        suctionFr = "6 Fr";
        bladeSize = "00 (Miller/Straight)";
        oralAirway = "Size 000 – 00";
        maskSize = "00 (Neonatal Premature)";
      } else {
        categoryBracket = "Neonate (0–1 mo, 3–5 kg)";
        suctionFr = "6 Fr";
        bladeSize = "0 (Miller/Straight)";
        oralAirway = "Size 00";
        maskSize = "0 (Neonatal)";
      }
    } else if (a < 1.0 || (w > 0 && w <= 10 && a <= 1.2)) {
      categoryBracket = "Infant (1–12 mo, 4–10 kg)";
      suctionFr = "8 Fr";
      bladeSize = "1 (Miller/Wis-Hipple/Mac)";
      oralAirway = "Size 0 (40 mm)";
      maskSize = "0 – 1 (Infant)";
    } else if (a < 3.0 || (w > 0 && w <= 16 && a <= 3.5)) {
      categoryBracket = "Toddler (1–3 yrs, 8–16 kg)";
      suctionFr = "8 Fr";
      bladeSize = "1.5 (Macintosh / Miller)";
      oralAirway = "Size 1 (50 mm)";
      maskSize = "1 (Paediatric)";
    } else if (a < 8.0 || (w > 0 && w <= 30 && a <= 8.5)) {
      categoryBracket = "Small Child (3–8 yrs, 14–30 kg)";
      suctionFr = "10 Fr";
      bladeSize = "2 (Macintosh)";
      oralAirway = "Size 2 (70 mm)";
      maskSize = "2 (Paediatric Medium)";
    } else {
      categoryBracket = "Large Child (8–12+ yrs, ≥25 kg)";
      suctionFr = "12 Fr";
      bladeSize = "3 (Macintosh)";
      oralAirway = "Size 3 (80 mm)";
      maskSize = "3 (Child / Small Adult)";
    }

    return {
      uncuffedRaw: uncuffed,
      cuffedRaw: cuffed,
      uncuffedDisplay: uncuffed !== null ? `${round(uncuffed, 2)} mm ID` : "Enter age",
      cuffedDisplay: cuffed !== null ? `${round(cuffed, 2)} mm ID` : "Enter age",
      etDepthDisplay: etDepth !== null ? `${round(etDepth, 1)} cm at lips` : "Enter age",
      igelDisplay: igel || "Enter weight",
      categoryBracket,
      suctionFr,
      bladeSize,
      oralAirway,
      maskSize
    };
  }

  function computeDrugChart(weightKg, overrides = {}) {
    if (!weightKg || weightKg <= 0 || isNaN(weightKg)) return [];

    return DRUG_DEFINITIONS.map((def) => {
      const conc = overrides[def.id]?.concentration ?? def.defaultConcentration;
      let calculatedDoseVal = null;
      let calculatedDoseText = "";
      let calculatedVolumeText = "";
      let isCapped = false;

      if (typeof def.doseFormula === "function") {
        const rawDose = def.doseFormula(weightKg);
        if (Array.isArray(rawDose)) {
          const [d1, d2] = rawDose;
          calculatedDoseVal = [d1, d2];
          calculatedDoseText = def.doseDisplay(weightKg);
          if (conc > 0) {
            const v1 = round(d1 / conc, 2);
            const v2 = round(d2 / conc, 2);
            calculatedVolumeText = `${v1}–${v2} mL`;
          }
          if (def.maxSingleDose && d2 > def.maxSingleDose) {
            isCapped = true;
          }
        } else {
          calculatedDoseVal = rawDose;
          calculatedDoseText = def.doseDisplay(weightKg);
          if (conc > 0) {
            calculatedVolumeText = `${round(rawDose / conc, 2)} mL`;
          }
          if (def.maxSingleDose && rawDose > def.maxSingleDose) {
            isCapped = true;
          }
        }
      }

      return {
        id: def.id,
        category: def.category,
        name: def.name,
        doseBasis: def.doseBasis,
        calculatedDoseText,
        calculatedVolumeText,
        unit: def.unit,
        route: def.route,
        concentration: conc,
        concentrationLabel: overrides[def.id]?.label || def.concentrationLabel,
        availableConcentrations: def.availableConcentrations,
        maxSingleDose: def.maxSingleDose,
        isCapped,
        notes: def.notes
      };
    });
  }

  // Export as reusable global module
  window.KnockoutPaedsChart = {
    definitions: DRUG_DEFINITIONS,
    computeAirway,
    computeDrugChart,
    round
  };
})();
