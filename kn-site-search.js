// ==========================================================================
// KnockoutNotes — Unified Sitewide Search Engine (kn-site-search.js)
// Indexes: Topics, Subtopics, Image File Names, Calculators, Guidelines,
// and Active Recall Answers with Auto-Reveal Navigation.
// ==========================================================================

(function () {
  "use strict";

  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));

  const norm = s => String(s || "").toLowerCase().trim();

  // Highlight matching query tokens in text snippets
  function highlightText(text, query) {
    if (!text || !query) return esc(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('(' + escapedQuery + ')', 'gi');
    return esc(text).replace(regex, '<mark class="kn-search-highlight">$1</mark>');
  }

  // Extract snippet around query match with ellipses
  function extractSnippet(text, query, maxLen = 140) {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!query) return esc(cleanText.slice(0, maxLen) + (cleanText.length > maxLen ? "…" : ""));

    const idx = cleanText.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) {
      return esc(cleanText.slice(0, maxLen) + (cleanText.length > maxLen ? "…" : ""));
    }

    const start = Math.max(0, idx - 40);
    const end = Math.min(cleanText.length, idx + query.length + 80);
    const snippet = (start > 0 ? "…" : "") + cleanText.slice(start, end).trim() + (end < cleanText.length ? "…" : "");
    return highlightText(snippet, query);
  }

  const pageForType = type => {
    const t = norm(type);
    if (t.includes("calc")) return "calculators.html";
    if (t.includes("pearl")) return "notes.html#pearls";
    if (t.includes("valve")) return "notes.html";
    if (t.includes("note")) return "notes.html";
    if (t.includes("viva")) return "viva.html";
    if (t.includes("drug")) return "drugs.html";
    if (t.includes("critical") || t.includes("icu")) return "critical-care.html";
    if (t.includes("chamber") || t.includes("resuscitation") || t.includes("acls")) return "resuscitation-chamber.html";
    if (t.includes("workstation") || t.includes("ventilator") || t.includes("machine")) return "ventilator.html";
    if (t.includes("update") || t.includes("guideline")) return "recent-updates.html";
    if (t.includes("resource")) return "resources.html";
    return "index.html";
  };

  // Comprehensive static index for instantaneous zero-delay search
  const STATIC_ENTRIES = [
    // --- TOPICS & SUBTOPICS: DRUGS ---
    {
      Type: "Topic",
      Category: "Drugs • Induction",
      Title: "Induction Agents",
      Summary: "High-yield induction pharmacology and anaesthesia pearls (Propofol, Etomidate, Ketamine, Thiopentone).",
      href: "drugs.html#induction"
    },
    {
      Type: "Subtopic",
      Category: "Induction Agents",
      Title: "Propofol",
      ImageFileName: "induction_1.jpg",
      Summary: "GABA-A agonist, rapid redistribution, profound vasodilation and myocardial depression.",
      href: "drugs.html#induction"
    },
    {
      Type: "Subtopic",
      Category: "Induction Agents",
      Title: "Etomidate",
      ImageFileName: "induction_2.jpg",
      Summary: "Haemodynamically stable induction agent, preserves autonomic baroreflex, 11-beta-hydroxylase adrenocortical suppression.",
      href: "drugs.html#induction"
    },
    {
      Type: "Subtopic",
      Category: "Induction Agents",
      Title: "Ketamine",
      ImageFileName: "induction_3.jpg",
      Summary: "NMDA receptor antagonist, dissociative anaesthesia, bronchodilation, sympathomimetic central stimulation.",
      href: "drugs.html#induction"
    },
    {
      Type: "Subtopic",
      Category: "Induction Agents",
      Title: "Thiopentone",
      ImageFileName: "induction_4.jpg",
      Summary: "Barbiturate induction agent, potent neuroprotection, decreases cerebral metabolic rate of oxygen (CMRO2) and ICP.",
      href: "drugs.html#induction"
    },
    {
      Type: "Topic",
      Category: "Drugs • Opioids",
      Title: "Opioid Agents",
      Summary: "High-yield opioid pharmacology: Morphine, Fentanyl, Remifentanil, Nalbuphine, Tramadol, Pethidine, Buprenorphine, Naloxone.",
      href: "drugs.html#opioids"
    },
    {
      Type: "Subtopic",
      Category: "Opioid Agents",
      Title: "Morphine",
      ImageFileName: "opioid_03_morphine.jpg",
      Summary: "Natural phenanthrene alkaloid, active M6G and neurotoxic M3G metabolites, histamine release.",
      href: "drugs.html#opioids"
    },
    {
      Type: "Subtopic",
      Category: "Opioid Agents",
      Title: "Fentanyl",
      ImageFileName: "opioid_04_fentanyl.jpg",
      Summary: "Synthetic phenylpiperidine, 100x potency of morphine, high lipophilicity, rapid redistribution.",
      href: "drugs.html#opioids"
    },
    {
      Type: "Subtopic",
      Category: "Opioid Agents",
      Title: "Remifentanil",
      ImageFileName: "opioid_05_remifentanil.jpg",
      Summary: "Ultra-short-acting esterase-metabolized opioid with context-insensitive half-time of 3–4 minutes.",
      href: "drugs.html#opioids"
    },
    {
      Type: "Subtopic",
      Category: "Opioid Agents",
      Title: "Naloxone",
      ImageFileName: "opioid_10_naloxone.jpg",
      Summary: "Pure competitive mu/kappa/delta opioid antagonist for acute respiratory depression reversal.",
      href: "drugs.html#opioids"
    },
    {
      Type: "Topic",
      Category: "Drugs • Neuromuscular Blockers",
      Title: "Muscle Relaxants & Reversal",
      Summary: "Neuromuscular blocking agents and selective reversal mechanisms (Suxamethonium, Rocuronium, Vecuronium, Atracurium, Cisatracurium, Neostigmine, Sugammadex).",
      href: "drugs.html#muscle-relaxant"
    },
    {
      Type: "Subtopic",
      Category: "Muscle Relaxants",
      Title: "Suxamethonium (Succinylcholine)",
      ImageFileName: "muscle-relaxant_03_suxamethonium.jpg",
      Summary: "Depolarizing NMBA with rapid onset (30–60s), duration 5–10 mins, fasciculations, hyperkalaemia risk.",
      href: "drugs.html#muscle-relaxant"
    },
    {
      Type: "Subtopic",
      Category: "Muscle Relaxants",
      Title: "Rocuronium",
      ImageFileName: "muscle-relaxant_04_rocuronium.jpg",
      Summary: "Steroidal non-depolarizing NMBA, rapid onset at 1.2 mg/kg for RSI, selectively encapsulated by sugammadex.",
      href: "drugs.html#muscle-relaxant"
    },
    {
      Type: "Subtopic",
      Category: "Muscle Relaxants",
      Title: "Sugammadex",
      ImageFileName: "muscle-relaxant_09_sugammadex.jpg",
      Summary: "Modified gamma-cyclodextrin for rapid and deep reversal of rocuronium and vecuronium (2, 4, 16 mg/kg).",
      href: "drugs.html#muscle-relaxant"
    },
    {
      Type: "Topic",
      Category: "Drugs • Inotropes & Vasopressors",
      Title: "Vasoactive Agents",
      Summary: "Noradrenaline, Adrenaline, Dopamine, Dobutamine, Vasopressin, Phenylephrine, Milrinone, Nitroglycerin, Methylene Blue.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Subtopic",
      Category: "Vasoactive Agents",
      Title: "Noradrenaline (Norepinephrine)",
      ImageFileName: "vasoactive_03_noradrenaline.png",
      Summary: "Potent alpha-1 and modest beta-1 agonist; first-line vasopressor for septic and vasodilatory distributive shock.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Subtopic",
      Category: "Vasoactive Agents",
      Title: "Adrenaline (Epinephrine)",
      ImageFileName: "vasoactive_04_adrenaline.png",
      Summary: "Potent non-selective alpha and beta adrenergic agonist; anaphylaxis and cardiac arrest first-line inotrope/vasopressor.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Subtopic",
      Category: "Vasoactive Agents",
      Title: "Vasopressin",
      ImageFileName: "vasoactive_07_vasopressin.png",
      Summary: "V1a vascular smooth muscle Gq receptor agonist; non-adrenergic second-line vasopressor in catecholamine-resistant shock.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Subtopic",
      Category: "Vasoactive Agents",
      Title: "Milrinone",
      ImageFileName: "vasoactive_09_milrinone.png",
      Summary: "Phosphodiesterase-3 (PDE3) inhibitor; inodilator increasing myocardial cAMP and reducing pulmonary vascular resistance.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Subtopic",
      Category: "Vasoactive Agents",
      Title: "Methylene Blue",
      ImageFileName: "vasoactive_11_methylene-blue.png",
      Summary: "Guanylyl cyclase inhibitor blocking nitric oxide-mediated vasoplegia in refractory cardiac vasoplegic shock.",
      href: "drugs.html#vasoactive"
    },
    {
      Type: "Topic",
      Category: "Drugs • Local Anaesthetics",
      Title: "Local Anaesthetics & LAST Protocol",
      Summary: "Voltage-gated sodium channel blockers, amino-ester vs amino-amide metabolism, and LAST recognition and 20% lipid emulsion management.",
      href: "drugs.html#local-anaesthetics"
    },
    {
      Type: "Subtopic",
      Category: "Local Anaesthetics",
      Title: "Lignocaine (Lidocaine)",
      ImageFileName: "local-anaesthetics_03_lignocaine.png",
      Summary: "Amide local anaesthetic, intermediate duration, max safe dose 3 mg/kg plain, 7 mg/kg with adrenaline.",
      href: "drugs.html#local-anaesthetics"
    },
    {
      Type: "Subtopic",
      Category: "Local Anaesthetics",
      Title: "Bupivacaine & Levobupivacaine",
      ImageFileName: "local-anaesthetics_04_bupivacaine-levobupivacaine.png",
      Summary: "Long-acting amide local anaesthetic with high cardiotoxicity index; S(-)-enantiomer levobupivacaine has wider safety margin.",
      href: "drugs.html#local-anaesthetics"
    },
    {
      Type: "Subtopic",
      Category: "Local Anaesthetics",
      Title: "Ropivacaine",
      ImageFileName: "local-anaesthetics_05_ropivacaine.png",
      Summary: "Pure S(-)-enantiomer amide local anaesthetic with sensory-motor differentiation and reduced cardiotoxicity compared to bupivacaine.",
      href: "drugs.html#local-anaesthetics"
    },
    {
      Type: "Subtopic",
      Category: "Local Anaesthetics",
      Title: "LAST Signs and Symptoms",
      ImageFileName: "local-anaesthetics_08_last-signs-symptoms.png",
      Summary: "Perioral numbness, metallic taste, tinnitus, visual disturbance, seizures, followed by ventricular arrhythmias and cardiovascular collapse.",
      href: "drugs.html#local-anaesthetics"
    },
    {
      Type: "Subtopic",
      Category: "Local Anaesthetics",
      Title: "LAST Management & 20% Lipid Emulsion Protocol",
      ImageFileName: "local-anaesthetics_09_last-management.png",
      Summary: "Stop injection, call for help, 100% O2, airway control, manage seizures with benzodiazepines, 20% Lipid emulsion: 1.5 mL/kg IV bolus over 1 min, then 0.25 mL/kg/min infusion. Avoid vasopressin and local anaesthetic antiarrhythmics.",
      href: "drugs.html#local-anaesthetics"
    },

    // --- TOPICS & SUBTOPICS: CRITICAL CARE & VENTILATION ---
    {
      Type: "Topic",
      Category: "Critical Care • Scoring",
      Title: "ICU Scoring Pearl (SOFA, NEWS2, qSOFA)",
      ImageFileName: "icu_scoring_1_of_5.jpg",
      Summary: "Sequential Organ Failure Assessment (SOFA), National Early Warning Score (NEWS2), and ICU prognostic scoring systems.",
      href: "critical-care.html#icu-scoring"
    },
    {
      Type: "Topic",
      Category: "Critical Care • Mechanical Ventilation",
      Title: "Mechanical Ventilation Modes & Mechanics",
      ImageFileName: "ventilation_01_modes-overview.png",
      Summary: "Volume Control (VCV), Pressure Control (PCV), SIMV, PSV, ASV, PRVC, CPAP/NIV, APRV, HFOV, and PAV+/VAPS.",
      href: "critical-care.html#ventilation"
    },
    {
      Type: "Subtopic",
      Category: "Mechanical Ventilation",
      Title: "Volume Control Ventilation (VCV)",
      ImageFileName: "ventilation_02_vcv.png",
      Summary: "Guaranteed tidal volume delivery with variable airway pressure sensitive to changes in respiratory compliance.",
      href: "critical-care.html#ventilation"
    },
    {
      Type: "Subtopic",
      Category: "Mechanical Ventilation",
      Title: "Pressure Control Ventilation (PCV)",
      ImageFileName: "ventilation_03_pcv.png",
      Summary: "Decelerating inspiratory flow with fixed peak inspiratory pressure, protecting against barotrauma.",
      href: "critical-care.html#ventilation"
    },
    {
      Type: "Subtopic",
      Category: "Mechanical Ventilation",
      Title: "Airway Pressure Release Ventilation (APRV)",
      ImageFileName: "ventilation_09_aprv.png",
      Summary: "Bilevel CPAP with short intermittent pressure releases promoting spontaneous breathing and alveolar recruitment in severe ARDS.",
      href: "critical-care.html#ventilation"
    },
    {
      Type: "Subtopic",
      Category: "Mechanical Ventilation",
      Title: "Pressure Regulated Volume Control (PRVC)",
      ImageFileName: "ventilation_07_prvc.png",
      Summary: "Dual-controlled mode delivering target tidal volume using the lowest possible decelerating inspiratory pressure breath-by-breath.",
      href: "critical-care.html#ventilation"
    },

    // --- TOPICS & SUBTOPICS: CLINICAL PEARLS & CARDIOLOGY ---
    {
      Type: "Topic",
      Category: "Pearls • Cardiology",
      Title: "Cardiology Pearls — Valvular Heart Disease",
      Summary: "Haemodynamic goals for anaesthesia in Aortic Stenosis, Aortic Regurgitation, Mitral Stenosis, and Mitral Regurgitation.",
      href: "notes.html#cardiology"
    },
    {
      Type: "Subtopic",
      Category: "Cardiology Pearls",
      Title: "Aortic Stenosis — Anaesthetic Goals",
      ImageFileName: "cardiology_pearl_1_of_4.jpg",
      Summary: "Fixed cardiac output, maintain normal sinus rhythm (atrial kick vital), maintain SVR (afterload dependent coronary perfusion), avoid tachycardia and hypotension.",
      href: "notes.html#cardiology"
    },
    {
      Type: "Subtopic",
      Category: "Cardiology Pearls",
      Title: "Aortic Regurgitation — Anaesthetic Goals",
      ImageFileName: "cardiology_pearl_2_of_4.jpg",
      Summary: "Forward flow is favoured by 'fast, full, and forward' strategy: rate 80-100 bpm, reduce afterload (SVR reduction decreases regurgitant volume), maintain preload.",
      href: "notes.html#cardiology"
    },
    {
      Type: "Subtopic",
      Category: "Cardiology Pearls",
      Title: "Mitral Stenosis — Anaesthetic Goals",
      ImageFileName: "cardiology_pearl_3_of_4.jpg",
      Summary: "Slow normal sinus rhythm (60-70 bpm) allows adequate diastolic filling time across stenotic mitral orifice; avoid tachycardia, hypoxemia, hypercarbia, or acidosis (which raise PVR).",
      href: "notes.html#cardiology"
    },
    {
      Type: "Subtopic",
      Category: "Cardiology Pearls",
      Title: "Mitral Regurgitation — Anaesthetic Goals",
      ImageFileName: "cardiology_pearl_4_of_4.jpg",
      Summary: "Forward flow promoted by mild tachycardia (80-100 bpm) and afterload reduction; avoid bradycardia and acute increases in systemic vascular resistance.",
      href: "notes.html#cardiology"
    },

    // --- TOPICS & SUBTOPICS: NOTES & AIRWAY ---
    {
      Type: "Topic",
      Category: "Notes • Airway",
      Title: "Percutaneous Tracheostomy & Cricothyroidotomy",
      ImageFileName: "airway_01_pct-cric-intro.png",
      Summary: "Step-by-step percutaneous dilational tracheostomy (Ciaglia) vs emergency scalpel-bougie-tube cricothyroidotomy equipment and technique.",
      href: "notes.html#airway"
    },
    {
      Type: "Subtopic",
      Category: "Airway Notes",
      Title: "Percutaneous Tracheostomy Procedure (Step by Step)",
      ImageFileName: "airway_03_pct-procedure.png",
      Summary: "Bronchoscopy guidance, tracheal puncture between 1st-2nd or 2nd-3rd rings, Seldinger guidewire, serial dilation, tube placement.",
      href: "notes.html#airway"
    },
    {
      Type: "Subtopic",
      Category: "Airway Notes",
      Title: "Emergency Cricothyroidotomy (Scalpel-Bougie-Tube)",
      ImageFileName: "airway_06_cricothyroidotomy.png",
      Summary: "Can't Intubate Can't Oxygenate (CICO) rescue: transverse cricothyroid membrane incision, tracheal hook/finger sweep, coudé bougie, size 6.0 cuffed ETT.",
      href: "notes.html#airway"
    },
    {
      Type: "Topic",
      Category: "Notes • Pulmonology",
      Title: "Pulmonary Function Tests (PFT Interpretation)",
      ImageFileName: "pft_01_intro.png",
      Summary: "Spirometry quality criteria, FEV1/FVC ratio, obstructive vs restrictive vs mixed ventilatory defects, lung volumes and DLCO.",
      href: "notes.html#pft"
    },
    {
      Type: "Subtopic",
      Category: "PFT Notes",
      Title: "Obstructive Ventilatory Defect",
      ImageFileName: "pft_03_obstructive.png",
      Summary: "FEV1/FVC < 0.70 (or < LLN), scooping of expiratory flow-volume loop, bronchodilator reversibility testing (>12% and >200 mL).",
      href: "notes.html#pft"
    },
    {
      Type: "Subtopic",
      Category: "PFT Notes",
      Title: "Restrictive & Mixed Patterns, Lung Volumes & DLCO",
      ImageFileName: "pft_04_restrictive-mixed.png",
      Summary: "Reduced TLC (<80% predicted), normal or high FEV1/FVC; differentiating intrinsic parenchymal from chest wall and neuromuscular restriction via DLCO.",
      href: "notes.html#pft"
    },

    // --- CALCULATORS & CLINICAL UTILITY SUITE ---
    {
      Type: "Calculator",
      Category: "Calculators • Resuscitation",
      Title: "Paediatric Drug Chart & Airway Sizer",
      Summary: "Interactive paediatric resuscitation dosing, ETT sizing (cuffed/uncuffed formula), Table 42-6 equipment, i-gel selector from PedsDrugChart.xlsx with PDF export.",
      href: "calculators.html#paedsHero"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "COPUR Score — Paediatric Airway Score (Colorado Score)",
      Summary: "Validated difficult paediatric airway score (COPUR score) assessing Chin, Opening, Previous/OSA, Uvula, Range, plus buck teeth and macroglossia modifiers.",
      href: "calculators.html#calcCopur"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Resuscitation",
      Title: "Parkland Burn Resuscitation Formula (Baxter)",
      Summary: "4 mL x weight(kg) x %TBSA burn crystalloid resuscitation in first 24h, adjusted for prehospital fluids.",
      href: "calculators.html#calcParkland"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "Wilson Risk Score (Difficult Intubation)",
      Summary: "5-factor risk score predicting difficult direct laryngoscopy (weight, head & neck mobility, jaw movement, buck teeth, retrognathia).",
      href: "calculators.html#calcWilson"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Hepatic & Perioperative",
      Title: "Child-Pugh Score (Cirrhosis & Mortality)",
      Summary: "Stratification of surgical risk in liver cirrhosis based on total bilirubin, serum albumin, INR, ascites, and hepatic encephalopathy.",
      href: "calculators.html#calcChildPugh"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Anthropometry",
      Title: "Body Mass Index (BMI) & Nutritional Status",
      Summary: "WHO adult body mass index calculation and nutritional classification (Underweight, Normal, Overweight, Class I–III Obesity).",
      href: "calculators.html#calcBmi"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Cardiac Risk",
      Title: "METs Functional Capacity",
      Summary: "ACC/AHA and ESAIC perioperative functional reserve evaluation (<4 METs poor, 4–10 moderate, >10 excellent).",
      href: "calculators.html#calcMets"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Cardiac Risk",
      Title: "Duke Activity Status Index (DASI)",
      Summary: "Validated 12-item cardiorespiratory functional capacity questionnaire and peak VO2 estimation.",
      href: "calculators.html#calcDasi"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "STOP-Bang OSA Screening",
      Summary: "Obstructive sleep apnoea perioperative screening questionnaire (Snoring, Tired, Observed, Pressure, BMI, Age, Neck, Gender).",
      href: "calculators.html#calcStopBang"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Renal",
      Title: "Creatinine Clearance (Cockcroft–Gault)",
      Summary: "Estimated renal clearance with Actual, Ideal (Devine), and Adjusted body weight selection.",
      href: "calculators.html#calcCrCl"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Acid–Base",
      Title: "Arterial Blood Gas (ABG) Clinical Analysis Suite",
      Summary: "Step-by-step blood gas analysis: pH, PaCO2, PaO2, HCO3, Winter's formula compensation, Figge albumin-corrected anion gap, delta ratio, and oxygenation.",
      href: "calculators.html#abgHero"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Acid–Base",
      Title: "Serum Anion Gap & Figge Albumin Correction",
      Summary: "Evaluation of high anion gap metabolic acidosis (HAGMA) with Figge albumin correction formula: AG + 0.25 x (40 - Albumin).",
      href: "calculators.html#abgHero"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Acid–Base",
      Title: "Winter's Formula (Expected PaCO2 Compensation)",
      Summary: "Respiratory compensation evaluator for primary metabolic acidosis: Expected PaCO2 = 1.5 x [HCO3-] + 8 ± 2.",
      href: "calculators.html#abgHero"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Acid–Base",
      Title: "Delta Gap & Delta Ratio",
      Summary: "Delta AG / Delta HCO3 evaluation to detect concurrent normal anion gap metabolic acidosis (NAGMA) or metabolic alkalosis.",
      href: "calculators.html#abgHero"
    },
    {
      Type: "Calculator",
      Category: "Calculators • Respiratory",
      Title: "PaO2/FiO2 Ratio, Berlin ARDS & A-a Gradient",
      Summary: "Arterial oxygenation ratio (PaO2/FiO2), expected PaO2, alveolar-arterial (A-a) oxygen gradient, and Berlin ARDS severity staging.",
      href: "calculators.html#abgHero"
    },

    // --- RESUSCITATION CHAMBER & ALGORITHMS ---
    {
      Type: "Chamber",
      Category: "Resuscitation Chamber • ACLS",
      Title: "Adult Cardiac Arrest: VF / Pulseless VT Algorithm",
      Summary: "High-quality CPR, immediate unsynchronized defibrillation, adrenaline 1 mg every 3–5 min, amiodarone 300 mg then 150 mg, double sequential defibrillation (DSED) for refractory shock.",
      href: "resuscitation-chamber.html"
    },
    {
      Type: "Chamber",
      Category: "Resuscitation Chamber • ACLS",
      Title: "Asystole & Pulseless Electrical Activity (PEA)",
      Summary: "Immediate chest compressions, early adrenaline 1 mg IV/IO, continuous quantitative waveform capnography, search for reversible 5 Hs and 5 Ts.",
      href: "resuscitation-chamber.html"
    },
    {
      Type: "Chamber",
      Category: "Resuscitation Chamber • Post-Arrest",
      Title: "Post-Cardiac Arrest ROSC Bundle & TTM",
      Summary: "Targeted Temperature Management (32°C–36°C), normoxia (SpO2 92–98%), normocapnia (PaCO2 35–45 mmHg), MAP >= 65 mmHg, immediate coronary angiography.",
      href: "resuscitation-chamber.html"
    },
    {
      Type: "Chamber",
      Category: "Resuscitation Chamber • ACLS",
      Title: "Reversible Causes of Cardiac Arrest (5 Hs and 5 Ts)",
      Summary: "Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia; Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (pulmonary PE), Thrombosis (coronary).",
      href: "resuscitation-chamber.html"
    },

    // --- ACTIVE RECALL PEARLS, VIVA QUESTIONS & FULL ANSWERS ---
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Valve Lesions",
      Title: "Mitral Stenosis: Rate Matters",
      Summary: "Tachycardia shortens diastole and critically impairs LV filling across a stenotic mitral valve.",
      Answer: "Haemodynamic goals: Maintain sinus rhythm, control ventricular rate (60–75 bpm), ensure adequate but cautious preload, preserve contractility, and avoid acute elevations in pulmonary vascular resistance (PVR). Kaplan's Cardiac Anesthesia, 8th ed.",
      href: "notes.html#p-ms-3d",
      targetId: "p-ms-3d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Valve Lesions",
      Title: "Aortic Stenosis: Fixed Output State",
      Summary: "Fixed LV outflow tract obstruction sensitive to sudden reductions in SVR and preload.",
      Answer: "Haemodynamic goals: Maintain normal sinus rhythm (atrial kick contributes ~30–40% of LVEDV), avoid tachycardia (shortens coronary perfusion time) and extreme bradycardia (fixed stroke volume), maintain high-normal SVR to preserve coronary perfusion pressure, and maintain generous preload. Kaplan's Cardiac Anesthesia, 8th ed.; ACC/AHA Valvular Heart Disease Guidelines.",
      href: "notes.html#p-as-3d",
      targetId: "p-as-3d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Valve Lesions",
      Title: "Aortic & Mitral Regurgitation: Forward Flow",
      Summary: "Minimise backwards regurgitant fraction and promote forward systemic cardiac output.",
      Answer: "Haemodynamic goals: Faster heart rate (80–100 bpm) shortens diastolic regurgitant time (AR) and systolic emptying time (MR); lower afterload (reduced SVR) promotes forward flow; maintain adequate preload and preserve myocardial contractility. Avoid bradycardia. Kaplan's Cardiac Anesthesia, 8th ed.",
      href: "notes.html#p-reg-3d",
      targetId: "p-reg-3d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Pharmacology",
      Title: "Succinylcholine (Suxamethonium) Intubating Dose & Mechanism",
      Summary: "IV intubating dose: 1–1.5 mg/kg in adults for rapid sequence induction (RSI).",
      Answer: "Depolarizing NMBA with rapid onset (30–60s) and brief duration (5–10 mins). Produces fasciculations followed by flaccid paralysis via sustained depolarisation of the motor end-plate nicotinic acetylcholine receptors. Miller's Anesthesia, 10th ed.",
      href: "notes.html#p13d",
      targetId: "p13d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Pharmacology",
      Title: "Sugammadex Block Reversal Dosing",
      Summary: "Dosing according to train-of-four and post-tetanic count depth of neuromuscular blockade.",
      Answer: "2 mg/kg for moderate block (reappearance of T2); 4 mg/kg for deep block (1–2 post-tetanic counts); 16 mg/kg for immediate reversal 3 minutes after 1.2 mg/kg rocuronium. Stoelting's Pharmacology & Physiology in Anesthetic Practice, 6th ed.",
      href: "notes.html#p23d",
      targetId: "p23d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Physiology",
      Title: "FRC as an Oxygen Reservoir",
      Summary: "Preoxygenation replaces alveolar nitrogen with oxygen to prolong safe apnoea time.",
      Answer: "The primary goal is denitrogenation and maximisation of the functional residual capacity (FRC) oxygen store (~2100 mL in a 70kg adult breathing 100% O2), not merely achieving an SpO2 of 100%. West's Respiratory Physiology; Miller's Anesthesia, 10th ed.",
      href: "notes.html#p33d",
      targetId: "p33d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Airway",
      Title: "Can't Intubate, Can't Oxygenate (CICO)",
      Summary: "Recognise airway failure early and immediately progress to emergency front-of-neck airway access.",
      Answer: "Declare CICO emergency. Call for senior help, attempt 100% O2 rescue via supraglottic airway / facemask, and if uncorrected, perform emergency scalpel-bougie-tube cricothyroidotomy immediately. Difficult Airway Society (DAS) Guidelines.",
      href: "notes.html#p43d",
      targetId: "p43d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Monitoring",
      Title: "Sudden Loss of ETCO2",
      Summary: "Rapidly differentiate equipment disconnections from catastrophic circulatory failure.",
      Answer: "Rule out circuit disconnection, endotracheal tube displacement/obstruction, sensor failure, massive pulmonary embolism, and sudden circulatory arrest. Check pulse and blood pressure immediately. Miller's Anesthesia, 10th ed.",
      href: "notes.html#p63d",
      targetId: "p63d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Critical Care",
      Title: "Low Tidal Volume Strategy in ARDS",
      Summary: "Lung-protective mechanical ventilation target based on predicted body weight (PBW).",
      Answer: "Calculate PBW from patient height and sex. Target tidal volume 4–8 mL/kg PBW, maintain plateau pressure <= 30 cmH2O, titrate PEEP according to FiO2 tables or driving pressure (Delta P <= 14 cmH2O). ARDSNet Protocols; Surviving Sepsis Guidelines 2026.",
      href: "critical-care.html#c23d",
      targetId: "c23d"
    },
    {
      Type: "Answer / Pearl",
      Category: "Active Recall • Critical Care",
      Title: "ICU Shock Framework & Phenotypes",
      Summary: "Classify hemodynamic physiology before selecting vasopressors or inotropes.",
      Answer: "Four primary phenotypes: Distributive (low SVR, high/normal CO), Hypovolaemic (low preload, high SVR), Cardiogenic (low CO, elevated filling pressures), and Obstructive (tamponade, tension pneumothorax, massive PE). The ICU Book, Paul Marino, 5th ed.",
      href: "critical-care.html#c43d",
      targetId: "c43d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Physics",
      Title: "Why does N2O expand a closed gas space?",
      Summary: "Physical mechanism of nitrous oxide diffusion into air-filled body cavities.",
      Answer: "N2O is 34 times more soluble in blood than nitrogen. It diffuses into air-containing closed gas cavities far faster than nitrogen can diffuse out, causing a rapid increase in gas volume (in compliant walls like bowel) or pressure (in rigid spaces like middle ear or pneumothorax). Miller's Anesthesia, 10th ed.",
      href: "viva.html#v13d",
      targetId: "v13d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Neuroanaesthesia",
      Title: "Formula for Cerebral Perfusion Pressure (CPP)",
      Summary: "Standard physiological formula and downstream pressure gradient considerations.",
      Answer: "Standard equation: CPP = Mean Arterial Pressure (MAP) − Intracranial Pressure (ICP). When central venous pressure (CVP) or jugular venous pressure exceeds ICP, the effective downstream venous pressure may be substituted: CPP = MAP − CVP. Miller's Anesthesia, 10th ed.",
      href: "viva.html#v23d",
      targetId: "v23d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Pharmacology",
      Title: "Why is etomidate relatively haemodynamically stable?",
      Summary: "Cardiovascular autonomic and baroreflex profile compared to propofol.",
      Answer: "Unlike propofol, etomidate causes minimal myocardial depression and does not inhibit sympathetic autonomic outflow or peripheral vascular tone. Baroreceptor reflexes remain largely intact, preserving cardiac output and MAP. Stoelting's Pharmacology & Physiology in Anesthetic Practice, 6th ed.",
      href: "viva.html#v33d",
      targetId: "v33d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Physiology",
      Title: "Physiological Shunt vs Dead Space",
      Summary: "West lung zone gas-exchange mismatch definitions.",
      Answer: "Shunt (V/Q = 0): Perfusion of unventilated alveoli (e.g., atelectasis, consolidation, pulmonary AVM). Causes hypoxemia refractory to 100% O2. Dead Space (V/Q = infinity): Ventilation of unperfused alveoli (e.g., pulmonary embolism, severe hypovolaemia). Impairs CO2 elimination. West's Respiratory Physiology.",
      href: "viva.html#v43d",
      targetId: "v43d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Pharmacology",
      Title: "What happens to Minimum Alveolar Concentration (MAC) with age?",
      Summary: "Age-dependent pharmacodynamic changes in volatile anaesthetics.",
      Answer: "MAC decreases by approximately 6% per decade of age beyond 40 years. This decline is attributed to reduced neuronal density, decreased CNS neurotransmitter activity, and alterations in brain lipid composition. Miller's Anesthesia, 10th ed.",
      href: "viva.html#v53d",
      targetId: "v53d"
    },
    {
      Type: "Answer / Viva",
      Category: "Viva Exam • Regional",
      Title: "Why does spinal anaesthesia cause hypotension?",
      Summary: "Sympathectomy mechanisms and preganglionic B-fibre blockade.",
      Answer: "Blockade of preganglionic sympathetic B-fibers produces arteriolar and massive venous vasodilation (venous pooling). This significantly decreases effective circulating blood volume and right atrial venous return, reducing preload and cardiac output. High blocks (T1–T4) block cardioaccelerator fibers, causing bradycardia. NYSORA Textbook of Regional Anesthesia.",
      href: "viva.html#v63d",
      targetId: "v63d"
    },

    // --- CLINICAL GUIDELINES & UPDATES ---
    {
      Type: "Guideline",
      Category: "Guidelines • Resuscitation",
      Title: "2025 AHA Guidelines for CPR & ECC",
      Summary: "Chest compressions strict 100–120/min, depth 5–6 cm, double sequential external defibrillation (DSED) and vector change (VC) for persistent VF/pVT, continuous EtCO2, targeted temperature management (32°C–36°C).",
      href: "recent-updates.html#aha-cpr-ecc-2025"
    },
    {
      Type: "Guideline",
      Category: "Guidelines • Pulmonology & Airway",
      Title: "GINA Asthma Strategy & Perioperative Care Update",
      Summary: "Anti-inflammatory reliever therapy (as-needed low-dose ICS-formoterol) preferred across all tracks; defer elective surgery if active wheeze; IV magnesium sulphate (25–50 mg/kg) and sevoflurane for bronchospasm.",
      href: "recent-updates.html#gina-asthma-2025-2026"
    },
    {
      Type: "Guideline",
      Category: "Guidelines • Critical Care",
      Title: "New Global Definition of ARDS (ESICM Consensus Update)",
      Summary: "Recognizes ARDS in non-intubated patients on HFNC (>= 30 L/min) or CPAP/NIV; formal validation of SpO2/FiO2 index (<= 315 when SpO2 <= 97%); POCUS lung ultrasound B-lines; low driving pressure < 14 cmH2O.",
      href: "recent-updates.html#esicm-ards-new-definition"
    },
    {
      Type: "Guideline",
      Category: "Guidelines • Airway",
      Title: "DAS 2025 Difficult Airway Guidelines",
      Summary: "Routine first-line videolaryngoscopy for anticipated and unanticipated difficult airways; maximum 3 tracheal intubation attempts before declaring failure; standard scalpel-bougie-tube eFONA.",
      href: "recent-updates.html#das-difficult-airway-2025"
    },
    {
      Type: "Guideline",
      Category: "Guidelines • Critical Care",
      Title: "Surviving Sepsis Campaign International Guidelines 2026",
      Summary: "1-hour resuscitation bundle: measure lactate, blood cultures before antibiotics, broad-spectrum antimicrobials, 30 mL/kg balanced crystalloids (Plasma-Lyte / Ringer's), first-line noradrenaline for MAP >= 65 mmHg.",
      href: "recent-updates.html#surviving-sepsis-2026"
    },

    // --- ANAESTHESIA WORKSTATION 3D COMPONENTS & SAFETY SYSTEMS ---
    {
      Type: "Workstation",
      Category: "Workstation • Gas Supply",
      Title: "Oxygen Flush Button (O2 Flush, 35–75 L/min)",
      Summary: "Delivers unmetered 100% O2 directly to common gas outlet at 35–75 L/min (approx 600–1200 mL/s). Never press during inspiratory phase of mechanical ventilation due to extreme barotrauma risk.",
      href: "ventilator.html#o2-flush",
      targetId: "o2-flush"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Flowmeters & Vaporizers",
      Title: "Flowmeters (O2, N2O & Air Rotameter Bank)",
      Summary: "Dual-tapered flowmeter tubes with rotameter bobbins. Oxygen is positioned downstream to minimise hypoxic delivery in event of tube crack.",
      href: "ventilator.html#flowhead",
      targetId: "flowhead"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Flowmeters & Vaporizers",
      Title: "Vaporizers (Sevoflurane & Isoflurane / Selectatec Interlock)",
      Summary: "Temperature-compensated variable-bypass vaporizers with Selectatec interlock preventing simultaneous opening of more than one agent.",
      href: "ventilator.html#selectatec",
      targetId: "selectatec"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Pressure Monitoring",
      Title: "Pipeline Pressure Gauges (400–420 kPa)",
      Summary: "Monitors central hospital medical gas pipeline operating pressure at 400–420 kPa (approx 4 bar). Audible whistle sounds if pressure drops below 280 kPa.",
      href: "ventilator.html#gauge-pipeline",
      targetId: "gauge-pipeline"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Breathing System",
      Title: "APL Valve (Adjustable Pressure Limiting) & Reservoir Bag",
      Summary: "Spring-loaded pressure relief valve (0–70 cmH2O). Must be turned fully open before transitioning patient to spontaneous breathing to prevent high-pressure accumulation.",
      href: "ventilator.html#apl-valve",
      targetId: "apl-valve"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Breathing System",
      Title: "CO2 Absorber Canister (Soda Lime Reaction)",
      Summary: "Exothermic chemical CO2 absorption using soda lime. Ethyl violet dye turns purple below pH 10.3 when absorbency is exhausted.",
      href: "ventilator.html#breathing-circuit",
      targetId: "breathing-circuit"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Breathing System",
      Title: "Scavenging System (AGSS - Active Gas Scavenging)",
      Summary: "Removes waste anaesthetic gases from theatre via dedicated 30mm fittings (preventing cross-connection with 22mm patient circuit).",
      href: "ventilator.html#scavenging",
      targetId: "scavenging"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Gas Supply",
      Title: "Pin-Index Safety System (PISS) & Cylinder Yokes",
      Summary: "Geometric pin indexing for medical gas cylinders: O2 is 2-5, N2O is 3-5, Medical Air is 1-5. Requires fresh Bodok neoprene seal.",
      href: "ventilator.html#cylinder-yoke",
      targetId: "cylinder-yoke"
    },
    {
      Type: "Workstation",
      Category: "Workstation • Aux Outlets",
      Title: "ACGO (Auxiliary Common Gas Outlet) & Selector",
      Summary: "Diverts metered fresh gas flow to external circuits (Mapleson F / Bain / Jackson-Rees). Interlocks mechanical ventilator when selected.",
      href: "ventilator.html#acgo",
      targetId: "acgo"
    }
  ];

  const RECENT_KEY = "kn_recent_searches";
  function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch(_) { return []; }
  }
  function addRecentSearch(term) {
    if (!term || typeof term !== "string") return;
    const clean = term.trim();
    if (!clean) return;
    try {
      let recents = getRecentSearches().filter(t => t.toLowerCase() !== clean.toLowerCase());
      recents.unshift(clean);
      localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, 6)));
    } catch(_) {}
  }
  function clearRecentSearches() {
    try { localStorage.removeItem(RECENT_KEY); } catch(_) {}
  }

  async function initSearch() {
    let memoryCatalog = null;

    async function buildSearchCatalog() {
      if (memoryCatalog) return memoryCatalog;

      const catalog = [...STATIC_ENTRIES];

      // 1. Scrape Content Config dynamically if available
      try {
        let contentObj = window.KNOCKOUTNOTES_CONTENT;
        if (!contentObj && window.KnockoutNotesLibrary && typeof window.KnockoutNotesLibrary.config === "function") {
          contentObj = await window.KnockoutNotesLibrary.config();
        }
        if (contentObj && contentObj.pages) {
          for (const [pageKey, pageData] of Object.entries(contentObj.pages)) {
            const pageHref = pageKey === "criticalCare" ? "critical-care.html" : `${pageKey}.html`;
            const typeLabel = pageKey === "criticalCare" ? "Critical Care" : pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

            for (const cat of pageData.categories || []) {
              catalog.push({
                Type: typeLabel,
                Category: cat.kicker || cat.title,
                Title: cat.title,
                Summary: cat.description || "",
                href: `${pageHref}#${cat.id}`
              });

              if (Array.isArray(cat.files)) {
                cat.files.forEach((f, idx) => {
                  const fileUrl = typeof f === "string" ? f : f.url;
                  const fileTitle = typeof f === "object" && f.title ? f.title : `${cat.title} #${idx + 1}`;
                  const filename = fileUrl ? fileUrl.split("/").pop() : "";

                  catalog.push({
                    Type: "Image Asset",
                    Category: `${typeLabel} • ${cat.title}`,
                    Title: fileTitle,
                    ImageFileName: filename,
                    Summary: `High-yield visual infographic in ${cat.title}. File: ${filename}`,
                    href: fileUrl || `${pageHref}#${cat.id}`
                  });
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn("KnockoutNotes search: Local content scan note:", err);
      }

      // 2. Scrape live DOM on current page for any custom or revealed cards
      try {
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".card, .quick-card, .calc-box").forEach(card => {
          const titleEl = card.querySelector("h3, h2, .calc-box-header h3");
          const title = titleEl ? titleEl.textContent.trim() : "";
          const tagEl = card.querySelector(".tag, .kicker-pill, .card-date, .calc-hero-badge");
          const category = tagEl ? tagEl.textContent.trim() : "";
          const pEl = card.querySelector("p");
          const summary = pEl ? pEl.textContent.trim() : "";
          const ansEl = card.querySelector(".answer");
          const answer = ansEl ? ansEl.textContent.trim() : "";
          const targetId = ansEl ? ansEl.id : (card.id || "");

          if (title && (answer || summary)) {
            catalog.push({
              Type: answer ? "Answer / Pearl" : "Clinical Card",
              Category: category || "Clinical Reference",
              Title: title,
              Summary: summary,
              Answer: answer,
              targetId: targetId,
              href: `${currentPath}#${targetId || card.id}`
            });
          }
        });
      } catch (_) {}

      // 3. Merge remote entries from Google Sheets API if available
      try {
        if (window.KnockoutNotesData && typeof window.KnockoutNotesData.loadData === "function") {
          const remoteData = await window.KnockoutNotesData.loadData();
          if (Array.isArray(remoteData)) {
            remoteData.forEach(item => {
              catalog.push({
                Type: item.type || "Update",
                Category: item.category || "Editorial Feed",
                Title: item.title || "Untitled",
                Summary: item.summary || "",
                Answer: item.answer || "",
                Reference: item.reference || "",
                href: item.url || pageForType(item.type)
              });
            });
          }
        }
      } catch (_) {}

      // Deduplicate entries by normalized title + category + image
      const seen = new Set();
      const uniqueCatalog = [];
      for (const entry of catalog) {
        const key = `${norm(entry.Title)}|${norm(entry.Category)}|${norm(entry.ImageFileName || "")}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueCatalog.push(entry);
        }
      }

      memoryCatalog = uniqueCatalog;
      return uniqueCatalog;
    }

    // Handle smooth navigation, anchor reveal, and element pulse
    function handleResultAction(item) {
      if (!item || !item.href) return;

      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      const [targetPage, targetHash] = item.href.split("#");

      // Check if target is on current page
      const isSamePage = !targetPage || targetPage === currentPath || (currentPath === "" && targetPage === "index.html");

      if (isSamePage && targetHash) {
        const targetElement = document.getElementById(targetHash);
        if (targetElement) {
          // If target is an answer or inside a card with an answer, open it
          const answerDiv = targetElement.classList.contains("answer") ? targetElement : targetElement.querySelector(".answer");
          if (answerDiv) {
            answerDiv.classList.add("open");
            const btn = targetElement.closest(".card, .quick-card")?.querySelector(".reveal");
            if (btn) {
              btn.textContent = "Hide Answer";
              btn.setAttribute("aria-expanded", "true");
            }
          }

          // Smooth scroll to element
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

          // Trigger high-yield 3D specular pulse highlight
          targetElement.classList.remove("kn-highlight-pulse");
          void targetElement.offsetWidth; // force reflow
          targetElement.classList.add("kn-highlight-pulse");

          // Close modal if open
          const modal = document.getElementById("knSearchModal");
          if (modal && modal.classList.contains("open")) {
            modal.classList.remove("open");
            if (window.KnockoutScrollLock) window.KnockoutScrollLock.set("search", false);
          }
          return;
        }
      }

      // If pointing directly to an asset file (image/pdf)
      if (item.href.startsWith("assets/") && window.KnockoutViewer && typeof window.KnockoutViewer.open === "function") {
        window.KnockoutViewer.open({ url: item.href, title: item.Title, type: item.href.endsWith(".pdf") ? "pdf" : "image" });
        const modal = document.getElementById("knSearchModal");
        if (modal && modal.classList.contains("open")) {
          modal.classList.remove("open");
          if (window.KnockoutScrollLock) window.KnockoutScrollLock.set("search", false);
        }
        return;
      }

      // Default browser navigation
      window.location.href = item.href;
    }

    function wireSearchElement(input, clear, results, status) {
      if (!input || !results) return null;

      let timer = null;
      let selectedIndex = -1;

      async function executeSearch(query) {
        const q = norm(query !== undefined ? query : input.value);
        if (clear) clear.style.display = q ? "block" : "none";
        results.innerHTML = "";

        if (!q) {
          if (status) status.textContent = "Start typing to search topics, subtopics, image files, clinical calculators, and active recall answers.";
          return;
        }

        if (status) status.textContent = "Searching KnockoutNotes comprehensive medical database…";

        const catalog = await buildSearchCatalog();

        // Multi-tier ranking match
        const scoredMatches = [];

        for (const item of catalog) {
          const title = norm(item.Title);
          const category = norm(item.Category);
          const imgFile = norm(item.ImageFileName);
          const summary = norm(item.Summary);
          const answer = norm(item.Answer);
          const ref = norm(item.Reference);

          let score = 0;
          let matchContext = "summary";

          if (title === q) {
            score = 100;
          } else if (title.startsWith(q)) {
            score = 80;
          } else if (title.includes(q)) {
            score = 60;
          } else if (imgFile && imgFile.includes(q)) {
            score = 55;
            matchContext = "image";
          } else if (category.includes(q)) {
            score = 45;
            matchContext = "category";
          } else if (answer && answer.includes(q)) {
            score = 35;
            matchContext = "answer";
          } else if (summary.includes(q)) {
            score = 25;
            matchContext = "summary";
          } else if (ref.includes(q)) {
            score = 15;
            matchContext = "reference";
          }

          if (score > 0) {
            scoredMatches.push({ item, score, matchContext });
          }
        }

        scoredMatches.sort((a, b) => b.score - a.score);
        const topMatches = scoredMatches.slice(0, 18);

        if (!topMatches.length) {
          if (status) status.textContent = "No matching medical content found.";
          results.innerHTML = '<div class="kn-search-empty"><div style="font-size:24px;margin-bottom:8px;">🔍</div>No results found. Try searching for a drug (e.g. <em>Propofol</em>), topic (<em>Ventilation</em>), image file (<em>induction_1.jpg</em>), score (<em>COPUR</em>, <em>Winter\'s</em>), or answer term (<em>atrial kick</em>, <em>fasciculations</em>).</div>';
          return;
        }

        if (status) status.textContent = `${topMatches.length} matching result${topMatches.length === 1 ? "" : "s"} found`;

        results.innerHTML = topMatches.map(({ item, matchContext }, idx) => {
          const typeName = item.Type || "Clinical Note";
          const catName = item.Category || "";
          const title = item.Title || "Untitled";
          const imgName = item.ImageFileName ? ` 📁 ${item.ImageFileName}` : "";
          const href = item.href || pageForType(typeName);
          const isExternalOrFile = href.startsWith("assets/") || href.startsWith("http");

          // Determine preview snippet
          let previewHtml = "";
          if (matchContext === "answer" && item.Answer) {
            previewHtml = `<div class="kn-search-answer-snippet"><span class="kn-badge-ans">💬 In Answer</span> ${extractSnippet(item.Answer, q)}</div>`;
          } else if (matchContext === "image" && item.ImageFileName) {
            previewHtml = `<div class="kn-search-img-snippet"><span class="kn-badge-img">🖼️ Image File</span> ${highlightText(item.ImageFileName, q)}</div>`;
          } else if (item.Summary) {
            previewHtml = `<p>${extractSnippet(item.Summary, q)}</p>`;
          }

          // Type badge styling class
          let badgeClass = "kn-badge-default";
          const tLower = norm(typeName);
          if (tLower.includes("drug")) badgeClass = "kn-badge-drug";
          else if (tLower.includes("calc")) badgeClass = "kn-badge-calc";
          else if (tLower.includes("ans") || tLower.includes("pearl")) badgeClass = "kn-badge-pearl";
          else if (tLower.includes("guide")) badgeClass = "kn-badge-guideline";
          else if (tLower.includes("image")) badgeClass = "kn-badge-image-asset";
          else if (tLower.includes("chamber")) badgeClass = "kn-badge-chamber";
          else if (tLower.includes("workstation") || tLower.includes("ventilator")) badgeClass = "kn-badge-workstation";

          return `
            <a class="kn-search-result" href="${esc(href)}" ${isExternalOrFile ? 'target="_blank" rel="noopener"' : ""} data-target-id="${esc(item.targetId || "")}" data-index="${idx}">
              <div class="kn-search-result-top">
                <span class="kn-search-type ${badgeClass}">${esc(typeName)}</span>
                ${catName ? `<span class="card-date">• ${esc(catName)}${esc(imgName)}</span>` : ""}
              </div>
              <h4>${highlightText(title, q)}</h4>
              ${previewHtml}
            </a>`;
        }).join("");

        selectedIndex = -1;

        // Wire result click interception for smooth in-page action
        results.querySelectorAll(".kn-search-result").forEach((resEl, idx) => {
          resEl.addEventListener("click", e => {
            const match = topMatches[idx];
            if (match && match.item) {
              addRecentSearch(match.item.Title || q);
              const currentPath = window.location.pathname.split("/").pop() || "index.html";
              const [targetPage] = (match.item.href || "").split("#");
              const isSamePage = !targetPage || targetPage === currentPath || (currentPath === "" && targetPage === "index.html");

              if (isSamePage) {
                e.preventDefault();
                handleResultAction(match.item);
              }
            }
          });
        });
      }

      // Render recent searches if available when input is empty
      function showRecentSearches() {
        if (input.value.trim()) return;
        const recents = getRecentSearches();
        if (!recents.length) {
          if (status) status.textContent = "Start typing to search topics, subtopics, image files, clinical calculators, and active recall answers.";
          results.innerHTML = "";
          return;
        }

        if (status) status.textContent = "Recent searches on this device:";
        results.innerHTML = `
          <div class="kn-recent-searches">
            <div class="kn-recent-header">
              <span>Recent Searches</span>
              <button type="button" class="kn-recent-clear-btn" id="knClearRecents">Clear</button>
            </div>
            <div class="kn-recent-chips">
              ${recents.map(r => `<button type="button" class="kn-recent-chip" data-query="${esc(r)}">⌕ ${esc(r)}</button>`).join("")}
            </div>
          </div>
        `;

        results.querySelectorAll(".kn-recent-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            input.value = chip.dataset.query;
            executeSearch(chip.dataset.query);
            input.focus();
          });
        });

        const clearBtn = results.querySelector("#knClearRecents");
        if (clearBtn) {
          clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            clearRecentSearches();
            showRecentSearches();
          });
        }
      }

      function updateSelection(newIdx) {
        const items = results.querySelectorAll(".kn-search-result");
        if (!items.length) return;
        items.forEach(el => el.classList.remove("selected"));
        if (newIdx >= 0 && newIdx < items.length) {
          selectedIndex = newIdx;
          items[selectedIndex].classList.add("selected");
          items[selectedIndex].scrollIntoView({ block: "nearest", behavior: "smooth" });
        } else {
          selectedIndex = -1;
        }
      }

      // Keyboard navigation (ArrowDown / ArrowUp / Enter)
      input.addEventListener("keydown", (e) => {
        const items = results.querySelectorAll(".kn-search-result");
        if (!items.length) return;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = selectedIndex + 1 < items.length ? selectedIndex + 1 : 0;
          updateSelection(next);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = selectedIndex - 1 >= 0 ? selectedIndex - 1 : items.length - 1;
          updateSelection(prev);
        } else if (e.key === "Enter") {
          if (selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
          }
        }
      });

      input.addEventListener("focus", () => {
        if (!input.value.trim()) showRecentSearches();
      });

      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => executeSearch(), 180);
      });

      if (clear) {
        clear.addEventListener("click", () => {
          input.value = "";
          showRecentSearches();
          input.focus();
        });
      }

      return { executeSearch };
    }

    // 1. Wire all in-page search containers
    const inPageInstances = [];
    document.querySelectorAll(".kn-site-search").forEach(wrap => {
      const input = wrap.querySelector("input[type='search'], input");
      const clear = wrap.querySelector("button, #knSearchClear");
      const section = wrap.closest(".kn-search-card, .kn-search-section, section");
      const results = section ? section.querySelector(".kn-search-results") : null;
      const status = section ? section.querySelector(".kn-search-status") : null;
      if (input && results) {
        const inst = wireSearchElement(input, clear, results, status);
        if (inst) inPageInstances.push(inst);
      }
    });

    // 2. Wire Global Command Palette Modal search bar
    const modalInput = document.getElementById("knModalSearchInput");
    const modalClear = document.getElementById("knModalSearchClear");
    const modalResults = document.getElementById("knModalSearchResults");
    const modalStatus = document.getElementById("knModalSearchStatus");
    const modalSearch = wireSearchElement(modalInput, modalClear, modalResults, modalStatus);

    window.KnockoutNotesSiteSearch = {
      trigger: (query = "") => {
        if (modalSearch) modalSearch.executeSearch(query);
        inPageInstances.forEach(inst => inst.executeSearch(query));
      },
      catalog: buildSearchCatalog
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
})();
