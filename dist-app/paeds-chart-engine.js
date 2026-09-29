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
    {
      id: "dexmedetomidine_iv",
      category: "Sedation",
      name: "Dexmedetomidine (IV)",
      doseFormula: (wt) => [wt * 0.5, wt * 1.0],
      doseDisplay: (wt) => `${round(wt * 0.5, 2)}–${round(wt * 1.0, 2)} mcg`,
      doseBasis: "0.5–1 mcg/kg IV loading (over 10 min)",
      unit: "mcg",
      route: "IV Infusion",
      defaultConcentration: 4, // 4 mcg/mL (200 mcg in 50 mL saline)
      concentrationLabel: "4 mcg/mL (200 mcg / 50 mL)",
      availableConcentrations: [
        { label: "4 mcg/mL (200 mcg / 50 mL)", value: 4, unit: "mcg/mL" },
        { label: "2 mcg/mL (100 mcg / 50 mL)", value: 2, unit: "mcg/mL" },
        { label: "100 mcg/mL (neat ampoule)", value: 100, unit: "mcg/mL" }
      ],
      maxSingleDose: 50,
      notes: "Alpha-2 agonist. Infuse loading dose over 10 min to avoid transient hypertension and reflex bradycardia. Maintenance: 0.2–0.7 mcg/kg/hr."
    },
    {
      id: "dexmedetomidine_in",
      category: "Sedation",
      name: "Dexmedetomidine (Intranasal)",
      doseFormula: (wt) => [wt * 2, wt * 3],
      doseDisplay: (wt) => `${round(wt * 2, 1)}–${round(wt * 3, 1)} mcg`,
      doseBasis: "2–3 mcg/kg IN (via MAD)",
      unit: "mcg",
      route: "Intranasal (IN)",
      defaultConcentration: 100, // 100 mcg/mL neat ampoule (200 mcg/2 mL)
      concentrationLabel: "100 mcg/mL (neat 200 mcg/2 mL)",
      availableConcentrations: [
        { label: "100 mcg/mL (neat ampoule)", value: 100, unit: "mcg/mL" }
      ],
      maxSingleDose: 100,
      notes: "Administer neat 100 mcg/mL solution via mucosal atomisation device (MAD). Divide between both nares (max 0.5 mL/nostril). Onset 25–45 min."
    },
    {
      id: "ketamine_oral",
      category: "Sedation",
      name: "Ketamine (Oral Premedication)",
      doseFormula: (wt) => [wt * 5, wt * 8],
      doseDisplay: (wt) => `${round(wt * 5, 1)}–${round(wt * 8, 1)} mg`,
      doseBasis: "5–8 mg/kg Oral (mixed with syrup/juice)",
      unit: "mg",
      route: "Oral",
      defaultConcentration: 50, // 50 mg/mL
      concentrationLabel: "50 mg/mL (neat liquid)",
      availableConcentrations: [
        { label: "50 mg/mL (neat)", value: 50, unit: "mg/mL" },
        { label: "10 mg/mL (diluted)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 250,
      notes: "Oral sedative for separation anxiety. Mix with 2–5 mL sweet syrup or juice to mask bitterness. Onset 15–20 min."
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
    {
      id: "remifentanil",
      category: "Analgesia",
      name: "Remifentanil",
      doseFormula: (wt) => [wt * 0.5, wt * 1.0],
      doseDisplay: (wt) => `${round(wt * 0.5, 2)}–${round(wt * 1.0, 2)} mcg`,
      doseBasis: "0.5–1 mcg/kg IV bolus (slow 30–60s)",
      unit: "mcg",
      route: "IV / Infusion",
      defaultConcentration: 20, // 20 mcg/mL (1 mg in 50 mL saline)
      concentrationLabel: "20 mcg/mL (1 mg in 50 mL)",
      availableConcentrations: [
        { label: "20 mcg/mL (1 mg in 50 mL)", value: 20, unit: "mcg/mL" },
        { label: "50 mcg/mL (2 mg in 40 mL)", value: 50, unit: "mcg/mL" }
      ],
      maxSingleDose: 100,
      notes: "Non-specific blood and tissue esterase metabolism. Rapid offset in 3–5 min. Bolus slowly over 30–60s to prevent chest rigidity. Infusion: 0.1–0.5 mcg/kg/min."
    },
    {
      id: "ibuprofen",
      category: "Analgesia",
      name: "Ibuprofen",
      doseFormula: (wt) => wt * 10,
      doseDisplay: (wt) => `${round(wt * 10, 1)} mg`,
      doseBasis: "10 mg/kg Oral / IV (max 400 mg)",
      unit: "mg",
      route: "Oral / IV",
      defaultConcentration: 20, // 20 mg/mL (100 mg / 5 mL oral suspension)
      concentrationLabel: "20 mg/mL (100 mg / 5 mL)",
      availableConcentrations: [
        { label: "20 mg/mL (100 mg / 5 mL oral susp)", value: 20, unit: "mg/mL" },
        { label: "10 mg/mL (IV infusion bottle)", value: 10, unit: "mg/mL" },
        { label: "40 mg/mL (200 mg / 5 mL oral susp)", value: 40, unit: "mg/mL" }
      ],
      maxSingleDose: 400,
      notes: "NSAID for mild-to-moderate inflammatory pain. Max 40 mg/kg/day (or 1200 mg/day). Avoid in infants < 3 months, dehydration, or active bleeding."
    },
    {
      id: "ketorolac",
      category: "Analgesia",
      name: "Ketorolac (Toradol)",
      doseFormula: (wt) => wt * 0.5,
      doseDisplay: (wt) => `${round(wt * 0.5, 2)} mg`,
      doseBasis: "0.5 mg/kg IV / IM (max 15 mg)",
      unit: "mg",
      route: "IV / IM",
      defaultConcentration: 15, // 15 mg/mL (30 mg in 2 mL ampoule)
      concentrationLabel: "15 mg/mL (30 mg / 2 mL)",
      availableConcentrations: [
        { label: "15 mg/mL (30 mg in 2 mL)", value: 15, unit: "mg/mL" },
        { label: "5 mg/mL (diluted 1:3)", value: 5, unit: "mg/mL" },
        { label: "30 mg/mL (neat ampoule)", value: 30, unit: "mg/mL" }
      ],
      maxSingleDose: 15,
      notes: "Potent parenteral NSAID for acute post-op pain in children ≥ 2 yrs. Max single dose 15 mg (30 mg if >50 kg). Max duration ≤ 48–72 hours."
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
    {
      id: "cisatracurium",
      category: "Paralysis",
      name: "Cisatracurium",
      doseFormula: (wt) => wt * 0.15,
      doseDisplay: (wt) => `${round(wt * 0.15, 2)} mg`,
      doseBasis: "0.15 mg/kg IV (intubation)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 2, // 2 mg/mL (neat ampoule)
      concentrationLabel: "2 mg/mL (neat ampoule)",
      availableConcentrations: [
        { label: "2 mg/mL (neat ampoule)", value: 2, unit: "mg/mL" },
        { label: "1 mg/mL (diluted 1:2)", value: 1, unit: "mg/mL" },
        { label: "10 mg/mL (concentrated vial)", value: 10, unit: "mg/mL" }
      ],
      maxSingleDose: 10,
      notes: "Organ-independent Hofmann elimination. Excellent in pediatric hepatic/renal disease. Negligible histamine release. Maintenance: 0.03 mg/kg."
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
    },
    {
      id: "sugammadex",
      category: "Reversal",
      name: "Sugammadex",
      doseFormula: (wt) => [wt * 2, wt * 4],
      doseDisplay: (wt) => `${round(wt * 2, 1)}–${round(wt * 4, 1)} mg (Rescue: ${round(wt * 16, 1)} mg)`,
      doseBasis: "2–4 mg/kg (routine) | 16 mg/kg (immediate rescue)",
      unit: "mg",
      route: "IV",
      defaultConcentration: 100, // 100 mg/mL (Bridion vial: 200 mg/2 mL or 500 mg/5 mL)
      concentrationLabel: "100 mg/mL (neat vial)",
      availableConcentrations: [
        { label: "100 mg/mL (neat vial)", value: 100, unit: "mg/mL" },
        { label: "20 mg/mL (diluted 1:5)", value: 20, unit: "mg/mL" }
      ],
      maxSingleDose: 1500,
      notes: "Selective relaxant binding agent for rocuronium and vecuronium. Routine: 2 mg/kg (moderate block TOF ≥ 2), 4 mg/kg (deep block PTC 1–2). Rescue: 16 mg/kg."
    },

    // Others
    {
      id: "tranexamic_acid",
      category: "Others",
      name: "Tranexamic Acid (TXA)",
      doseFormula: (wt) => [wt * 10, wt * 20],
      doseDisplay: (wt) => `${round(wt * 10, 1)}–${round(wt * 20, 1)} mg`,
      doseBasis: "10–20 mg/kg IV load (max 1000 mg)",
      unit: "mg",
      route: "IV Infusion",
      defaultConcentration: 100, // 100 mg/mL (500 mg / 5 mL ampoule)
      concentrationLabel: "100 mg/mL (neat 500 mg / 5 mL)",
      availableConcentrations: [
        { label: "100 mg/mL (neat)", value: 100, unit: "mg/mL" },
        { label: "20 mg/mL (diluted 1:5)", value: 20, unit: "mg/mL" }
      ],
      maxSingleDose: 1000,
      notes: "Antifibrinolytic for major surgical bleeding / trauma. Infuse slowly over 15–20 minutes to prevent transient hypotension. Maintenance: 5–10 mg/kg/hr."
    },
    {
      id: "magnesium_sulphate",
      category: "Others",
      name: "Magnesium Sulphate",
      doseFormula: (wt) => [wt * 25, wt * 50],
      doseDisplay: (wt) => `${round(wt * 25, 1)}–${round(wt * 50, 1)} mg`,
      doseBasis: "25–50 mg/kg IV (max 2000 mg)",
      unit: "mg",
      route: "IV Infusion",
      defaultConcentration: 100, // 100 mg/mL (diluted 1:5 from 50% ampoule)
      concentrationLabel: "100 mg/mL (diluted 10%)",
      availableConcentrations: [
        { label: "100 mg/mL (diluted 10%)", value: 100, unit: "mg/mL" },
        { label: "50 mg/mL (diluted 5%)", value: 50, unit: "mg/mL" },
        { label: "500 mg/mL (50% neat ampoule)", value: 500, unit: "mg/mL" }
      ],
      maxSingleDose: 2000,
      notes: "Indicated for severe refractory bronchospasm / status asthmaticus, torsades de pointes, and hypomagnesemia. Dilute to ≤100 mg/mL and infuse over 20–30 min."
    },
    {
      id: "sodium_bicarbonate",
      category: "Others",
      name: "Sodium Bicarbonate",
      doseFormula: (wt) => wt * 1.0,
      doseDisplay: (wt) => `${round(wt * 1.0, 1)} mEq (mmol)`,
      doseBasis: "1 mEq/kg (1 mmol/kg) IV slow push",
      unit: "mEq",
      route: "IV",
      defaultConcentration: 1, // 1 mEq/mL (8.4% solution = 1 mmol/mL)
      concentrationLabel: "8.4% (1 mEq/mL)",
      availableConcentrations: [
        { label: "8.4% (1 mEq/mL - children >2y)", value: 1, unit: "mEq/mL" },
        { label: "4.2% (0.5 mEq/mL - neonates/infants)", value: 0.5, unit: "mEq/mL" }
      ],
      maxSingleDose: 50,
      notes: "Indicated in documented severe metabolic acidosis, hyperkalemia, or TCA overdose. For neonates and infants < 2 yrs, use 4.2% (0.5 mEq/mL) to avoid hyperosmolar IVH."
    },
    {
      id: "calcium_gluconate",
      category: "Others",
      name: "Calcium Gluconate 10%",
      doseFormula: (wt) => [wt * 50, wt * 100],
      doseDisplay: (wt) => `${round(wt * 50, 1)}–${round(wt * 100, 1)} mg (${round(wt * 0.5, 2)}–${round(wt * 1.0, 2)} mL)`,
      doseBasis: "50–100 mg/kg (0.5–1 mL/kg of 10%)",
      unit: "mg",
      route: "IV Infusion",
      defaultConcentration: 100, // 10% = 100 mg/mL
      concentrationLabel: "10% (100 mg/mL)",
      availableConcentrations: [
        { label: "10% (100 mg/mL)", value: 100, unit: "mg/mL" }
      ],
      maxSingleDose: 2000,
      notes: "Preferred over CaCl2 for peripheral IV access due to lower extravasation necrosis risk. Infuse slowly over 10–20 min with continuous ECG monitoring."
    },
    {
      id: "naloxone",
      category: "Others",
      name: "Naloxone",
      doseFormula: (wt) => [wt * 2, wt * 10],
      doseDisplay: (wt) => `${round(wt * 2, 1)}–${round(wt * 10, 1)} mcg (Arrest: ${round(wt * 100, 0)} mcg)`,
      doseBasis: "2–10 mcg/kg (reversal) | 100 mcg/kg (arrest)",
      unit: "mcg",
      route: "IV / IM / SC / IN",
      defaultConcentration: 40, // 40 mcg/mL (0.4 mg/mL diluted 1:10)
      concentrationLabel: "40 mcg/mL (diluted 1:10)",
      availableConcentrations: [
        { label: "40 mcg/mL (diluted 1:10)", value: 40, unit: "mcg/mL" },
        { label: "400 mcg/mL (0.4 mg/mL neat)", value: 400, unit: "mcg/mL" }
      ],
      maxSingleDose: 2000,
      notes: "Titrate 2–10 mcg/kg slowly every 2–3 min to restore respiratory drive without triggering acute pain/sympathetic surge. In total opioid arrest: 100 mcg/kg (max 2 mg)."
    },
    {
      id: "amiodarone",
      category: "Others",
      name: "Amiodarone",
      doseFormula: (wt) => wt * 5.0,
      doseDisplay: (wt) => `${round(wt * 5.0, 1)} mg`,
      doseBasis: "5 mg/kg IV / IO (max 300 mg)",
      unit: "mg",
      route: "IV / IO",
      defaultConcentration: 50, // 50 mg/mL (150 mg / 3 mL neat ampoule)
      concentrationLabel: "50 mg/mL (neat 150 mg / 3 mL)",
      availableConcentrations: [
        { label: "50 mg/mL (neat ampoule)", value: 50, unit: "mg/mL" },
        { label: "5 mg/mL (diluted in D5W)", value: 5, unit: "mg/mL" }
      ],
      maxSingleDose: 300,
      notes: "PALS refractory VF/pVT arrest: 5 mg/kg rapid IV/IO push. Stable tachyarrhythmia: infuse 5 mg/kg over 20–60 min in D5W (monitor for hypotension and bradycardia)."
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

  // WHO Child Growth Standards (0–5 yrs) and WHO Growth Reference (5–19 yrs)
  const WHO_GROWTH_DATA = [
    { age: 0, wt: 3.3, ht: 50 },
    { age: 0.25, wt: 6.0, ht: 60 },
    { age: 0.5, wt: 7.5, ht: 67 },
    { age: 0.75, wt: 8.6, ht: 72 },
    { age: 1, wt: 9.6, ht: 75 },
    { age: 1.5, wt: 10.9, ht: 82 },
    { age: 2, wt: 12.2, ht: 87 },
    { age: 3, wt: 14.3, ht: 96 },
    { age: 4, wt: 16.3, ht: 103 },
    { age: 5, wt: 18.3, ht: 110 },
    { age: 6, wt: 20.5, ht: 116 },
    { age: 7, wt: 23.0, ht: 122 },
    { age: 8, wt: 25.5, ht: 128 },
    { age: 9, wt: 28.5, ht: 133 },
    { age: 10, wt: 32.0, ht: 138 },
    { age: 11, wt: 36.0, ht: 144 },
    { age: 12, wt: 41.0, ht: 150 },
    { age: 13, wt: 46.0, ht: 156 },
    { age: 14, wt: 51.0, ht: 162 },
    { age: 15, wt: 56.0, ht: 167 },
    { age: 16, wt: 60.0, ht: 170 },
    { age: 17, wt: 63.0, ht: 172 },
    { age: 18, wt: 65.0, ht: 174 }
  ];

  function interpolateGrowth(ageYears) {
    if (ageYears <= 0) return { wt: WHO_GROWTH_DATA[0].wt, ht: WHO_GROWTH_DATA[0].ht };
    const last = WHO_GROWTH_DATA[WHO_GROWTH_DATA.length - 1];
    if (ageYears >= last.age) return { wt: last.wt, ht: last.ht };

    for (let i = 0; i < WHO_GROWTH_DATA.length - 1; i++) {
      const p1 = WHO_GROWTH_DATA[i];
      const p2 = WHO_GROWTH_DATA[i + 1];
      if (ageYears >= p1.age && ageYears <= p2.age) {
        const span = p2.age - p1.age;
        const ratio = (ageYears - p1.age) / span;
        return {
          wt: p1.wt + (p2.wt - p1.wt) * ratio,
          ht: p1.ht + (p2.ht - p1.ht) * ratio
        };
      }
    }
    return { wt: 20, ht: 115 };
  }

  function computeGrowth(ageYears, weightKg) {
    if (ageYears === null || ageYears === undefined || isNaN(ageYears) || ageYears < 0) {
      return {
        wfaDisplay: "Enter age",
        wfaSub: "WHO Child Standards",
        wfhDisplay: "Enter age",
        wfhSub: "WHO P50 Stature",
        bmiDisplay: "Enter age & wt",
        bmiSub: "WHO Growth Reference"
      };
    }

    const med = interpolateGrowth(ageYears);
    const medianWt = med.wt;
    const medianHt = med.ht;

    let wfaDisplay = `P50: ${round(medianWt, 1)} kg`;
    let wfaSub = "WHO P50 Benchmark";
    let bmiDisplay = "—";
    let bmiSub = "WHO Growth Reference";

    if (weightKg !== null && weightKg !== undefined && weightKg > 0 && !isNaN(weightKg)) {
      const pctMed = Math.round((weightKg / medianWt) * 100);
      wfaDisplay = `P50: ${round(medianWt, 1)} kg (${pctMed}%)`;

      let wfaCategory = "Normal range";
      if (pctMed < 75) wfaCategory = "<P3 (Underweight)";
      else if (pctMed < 85) wfaCategory = "P3–P15 (Mild low)";
      else if (pctMed > 130) wfaCategory = ">P97 (High for age)";
      else if (pctMed > 115) wfaCategory = "P85–P97 (Above avg)";
      wfaSub = `${wfaCategory} (WHO)`;

      // BMI computation using height-for-age
      const heightM = medianHt / 100;
      const bmi = weightKg / (heightM * heightM);

      // Age-adjusted BMI percentiles (WHO Reference)
      let bmiCategory = "Healthy weight";
      let p85 = 17.5;
      let p95 = 19.5;
      let p5 = 13.8;

      if (ageYears < 2) { p5 = 14.5; p85 = 18.5; p95 = 20.0; }
      else if (ageYears <= 5) { p5 = 13.8; p85 = 17.2; p95 = 18.5; }
      else if (ageYears <= 10) { p5 = 13.5; p85 = 18.5; p95 = 21.0; }
      else if (ageYears <= 14) { p5 = 14.8; p85 = 21.5; p95 = 25.0; }
      else { p5 = 17.0; p85 = 24.5; p95 = 28.0; }

      if (bmi < p5) bmiCategory = "<P5 (Underweight)";
      else if (bmi > p95) bmiCategory = ">P95 (Obese)";
      else if (bmi > p85) bmiCategory = "P85–P95 (Overweight)";
      else bmiCategory = "Healthy weight (P5–P85)";

      bmiDisplay = `${round(bmi, 1)} kg/m²`;
      bmiSub = bmiCategory;
    }

    const wfhDisplay = `Est. Ht: ${round(medianHt, 0)} cm`;
    const wfhSub = `WHO P50 Stature for ${ageYears}y`;

    return {
      medianWeightKg: medianWt,
      medianHeightCm: medianHt,
      wfaDisplay,
      wfaSub,
      wfhDisplay,
      wfhSub,
      bmiDisplay,
      bmiSub
    };
  }

  // Export as reusable global module
  window.KnockoutPaedsChart = {
    definitions: DRUG_DEFINITIONS,
    computeAirway,
    computeDrugChart,
    computeGrowth,
    round
  };
})();
