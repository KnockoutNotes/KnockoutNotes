// ==========================================================================
// KnockoutNotes — Unified Sitewide Search Engine (kn-site-search.js)
// Universal Index: Topics, Subtopics, Image Files, 37 Clinical Calculators,
// 14 Active Recall Viva Cards, 64 Study Topics (with 277 Deep Sections),
// 84 Drug Monographs, 44 Regional Blocks, and Guidelines with Instant Reveal.
// ==========================================================================

(function () {
  "use strict";

  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));

  // Normalizes text: lowercase, NFKD unicode (converts subscript ₁/₂/₃/₄ to 1/2/3/4), removes punctuation/hyphens
  const norm = s => String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[₁]/g, "1")
    .replace(/[₂]/g, "2")
    .replace(/[₃]/g, "3")
    .replace(/[₄]/g, "4")
    .replace(/[\-–—_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Highlight matching query tokens in text snippets
  function highlightText(text, query) {
    if (!text || !query) return esc(text);
    const cleanQ = norm(query);
    if (!cleanQ) return esc(text);
    const tokens = cleanQ.split(/\s+/).filter(t => t.length > 0);
    if (!tokens.length) return esc(text);
    const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
    const regex = new RegExp('(' + escapedTokens + ')', 'gi');
    return esc(text).replace(regex, '<mark class="kn-search-highlight">$1</mark>');
  }

  // Extract snippet around query match with ellipses
  function extractSnippet(text, query, maxLen = 140) {
    if (!text) return "";
    const cleanText = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!query) return esc(cleanText.slice(0, maxLen) + (cleanText.length > maxLen ? "…" : ""));

    const qLower = norm(query);
    const textLower = norm(cleanText);
    let idx = textLower.indexOf(qLower);

    // If whole phrase not found, look for first token
    if (idx === -1) {
      const firstTok = qLower.split(/\s+/).find(t => t.length > 2);
      if (firstTok) idx = textLower.indexOf(firstTok);
    }
    if (idx === -1) idx = 0;

    const start = Math.max(0, idx - 40);
    const end = Math.min(cleanText.length, idx + query.length + 90);
    const snippet = (start > 0 ? "…" : "") + cleanText.slice(start, end).trim() + (end < cleanText.length ? "…" : "");
    return highlightText(snippet, query);
  }

  const pageForType = type => {
    const t = norm(type);
    if (t.includes("calc")) return "calculators.html";
    if (t.includes("pearl")) return "notes.html#pearls";
    if (t.includes("valve")) return "notes.html";
    if (t.includes("viva")) return "notes.html#viva";
    if (t.includes("note")) return "notes.html";
    if (t.includes("drug")) return "study.html";
    if (t.includes("critical") || t.includes("icu")) return "critical-care.html";
    if (t.includes("chamber") || t.includes("resuscitation") || t.includes("acls")) return "resuscitation-chamber.html";
    if (t.includes("regional")) return "regional-anaesthesia.html";
    if (t.includes("study") || t.includes("topic") || t.includes("section")) return "study.html";
    if (t.includes("workstation") || t.includes("ventilator") || t.includes("machine")) return "ventilator.html";
    if (t.includes("update") || t.includes("guideline")) return "recent-updates.html";
    if (t.includes("resource")) return "resources.html";
    return "index.html";
  };

  // Comprehensive static index for instantaneous zero-delay search from the very first frame
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

    // --- CALCULATORS & CLINICAL UTILITY SUITE (ALL 37 CALCULATORS) ---
{
      Type: "Calculator",
      Category: "Calculators • Pulmonary Function",
      Title: "PFT Pathology Interpretation (ATS/ERS 2022)",
      Summary: "Diagnostic spirometry, bronchodilator reversibility, TLC & DLCO interpretation following ATS/ERS consensus standards. Detects obstructive, restrictive, mixed, and isolated gas-transfer defects.",
      Tags: "PFT, spirometry, FEV1, FVC, DLCO, TLC, bronchodilator reversibility, obstruction, restriction, ATS, ERS, asthma, COPD",
      href: "calculators.html#calcBoxPft3d",
      targetId: "calcBoxPft3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Pulmonary Function",
      Title: "Post-Op FEV₁ & ppoDLCO Resection Calculator (ACCP / ESTS)",
      Summary: "Thoracic surgery anatomical lung resection risk stratification calculating predicted post-operative FEV1 and ppoDLCO based on 19 segments or 5 lobes removed.",
      Tags: "ppoFEV1, ppoDLCO, thoracic, lobectomy, pneumonectomy, segments, lobes, ACCP, ESTS, post-op lung function, lung resection",
      href: "calculators.html#calcBoxPpo3d",
      targetId: "calcBoxPpo3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Critical Care",
      Title: "Vasoactive Infusion Calculator",
      Summary: "Titration and mass rate calculation (mcg/kg/min, mcg/min) for Noradrenaline, Adrenaline, Vasopressin, Dobutamine, Milrinone, Phenylephrine, and SNP.",
      Tags: "vasoactive, noradrenaline, adrenaline, vasopressin, dobutamine, inotropes, pressors, infusions, syringe driver",
      href: "calculators.html#vasoCard3d",
      targetId: "vasoCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Pharmacology",
      Title: "TCI Pharmacokinetic Model Simulator",
      Summary: "Target-controlled infusion pharmacokinetic simulation: Marsh and Schnider models for Propofol, Minto model for Remifentanil, plasma and effect-site concentrations.",
      Tags: "TCI, Marsh, Schnider, Minto, propofol, remifentanil, effect site, Ce, Cp, pharmacokinetic modeling",
      href: "calculators.html#tciCard3d",
      targetId: "tciCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Critical Care",
      Title: "Ventilation Mechanics & PBW Engine",
      Summary: "Predicted Body Weight (PBW), 4–8 mL/kg lung-protective tidal volumes, static compliance (Cstat), driving pressure (ΔP), and ARDSNet compliance.",
      Tags: "ventilation, PBW, tidal volume, driving pressure, plateau pressure, compliance, Cstat, ARDSNet",
      href: "calculators.html#ventCard3d",
      targetId: "ventCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Haematology",
      Title: "Maximum Allowable Blood Loss (MABL / Gross Formula)",
      Summary: "Calculation of allowable blood loss before transfusion threshold is breached, utilizing estimated blood volume (EBV) and target haematocrit.",
      Tags: "MABL, blood loss, transfusion trigger, haematocrit, Gross formula, EBV, haemorrhage",
      href: "calculators.html#mablCard3d",
      targetId: "mablCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Haematology",
      Title: "Major Haemorrhage / Massive Transfusion Protocol (MTP 1:1:1)",
      Summary: "Balanced 1:1:1 PRBC, FFP, and Platelet pack tracker, fibrinogen replacement with cryoprecipitate, tranexamic acid (TXA), and calcium optimization.",
      Tags: "MTP, massive transfusion, 1:1:1, PRBC, FFP, platelets, cryoprecipitate, TXA, coagulopathy",
      href: "calculators.html#mtpCard3d",
      targetId: "mtpCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Haematology",
      Title: "Viscoelastic Testing Guide (TEG & ROTEM)",
      Summary: "Diagnostic interpretation of thromboelastography (TEG) and rotational thromboelastometry (ROTEM): R time, CT, K time, CFT, alpha angle, MA, MCF, and LY30.",
      Tags: "TEG, ROTEM, viscoelastic, R time, CT, CFT, alpha angle, MA, MCF, LY30, fibrinogen, hyperfibrinolysis",
      href: "calculators.html#viscoCard3d",
      targetId: "viscoCard3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Paediatric",
      Title: "Paediatric Drug Chart & Airway Sizer",
      Summary: "Interactive paediatric resuscitation dosing, ETT sizing (cuffed/uncuffed formula), Table 42-6 equipment, i-gel selector from PedsDrugChart.xlsx with PDF export.",
      Tags: "paediatric, pediatric, drug chart, ETT size, cuffed ETT, uncuffed, weight, age, emergency",
      href: "calculators.html#paedsHero",
      targetId: "paedsHero",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "COPUR Score — Paediatric Airway Score (Colorado Score)",
      Summary: "Validated difficult paediatric airway score assessing Chin, Opening, Previous/OSA, Uvula, Range, plus buck teeth and macroglossia modifiers.",
      Tags: "COPUR, paediatric airway, difficult intubation, Colorado score, chin, mouth opening, uvula, neck range",
      href: "calculators.html#calcCopur3d",
      targetId: "calcCopur3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Paediatric",
      Title: "FLACC Paediatric Pain Scale",
      Summary: "Behavioral pain assessment scale for infants and young children (2 months to 7 years) scoring Face, Legs, Activity, Cry, and Consolability (0–10).",
      Tags: "FLACC, paediatric pain, pain score, infants, post-op analgesia",
      href: "calculators.html#calcFlacc3d",
      targetId: "calcFlacc3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Paediatric",
      Title: "CHEOPS Paediatric Pain Scale",
      Summary: "Children's Hospital of Eastern Ontario Pain Scale for post-operative pain assessment in children aged 1 to 7 years (Cry, Facial, Child verbal, Torso, Touch, Legs).",
      Tags: "CHEOPS, paediatric pain, post-operative analgesia, children pain scale",
      href: "calculators.html#calcCheops3d",
      targetId: "calcCheops3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Parkland Burn Resuscitation Formula (Baxter)",
      Summary: "4 mL × weight(kg) × %TBSA burn crystalloid resuscitation in first 24h, adjusted for prehospital fluids (half in first 8h, remainder over 16h).",
      Tags: "Parkland, burn, fluid resuscitation, TBSA, Baxter formula, Ringer lactate",
      href: "calculators.html#calcParkland3d",
      targetId: "calcParkland3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Glasgow Coma Scale (GCS)",
      Summary: "Gold-standard neurological level of consciousness assessment: Eye opening (1–4), Verbal response (1–5), and Motor response (1–6). Total score 3–15.",
      Tags: "GCS, Glasgow Coma Scale, neurological assessment, coma, head injury, TBI, consciousness",
      href: "calculators.html#calcGcs3d",
      targetId: "calcGcs3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Revised Trauma Score (RTS)",
      Summary: "Physiological triage and survival probability score based on GCS, systolic blood pressure, and respiratory rate.",
      Tags: "RTS, trauma, Revised Trauma Score, triage, survival probability, emergency",
      href: "calculators.html#calcRts3d",
      targetId: "calcRts3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Wells' Criteria for Pulmonary Embolism",
      Summary: "Clinical prediction rule for pre-test probability of acute pulmonary embolism (DVT signs, alternative diagnosis, HR > 100, immobilization, prior PE/DVT, haemoptysis, malignancy).",
      Tags: "Wells, pulmonary embolism, PE, DVT, pre-test probability, D-dimer, CTPA",
      href: "calculators.html#calcWellsPe3d",
      targetId: "calcWellsPe3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Pulmonary Embolism Severity Index (PESI & sPESI)",
      Summary: "Stratifies 30-day mortality risk in acute pulmonary embolism (age, sex, cancer, heart failure, chronic lung disease, HR ≥ 110, SBP < 100, SpO2 < 90%).",
      Tags: "PESI, sPESI, pulmonary embolism, PE mortality, risk stratification",
      href: "calculators.html#calcPesi3d",
      targetId: "calcPesi3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Critical Care",
      Title: "qSOFA (Quick Sepsis Organ Failure Assessment)",
      Summary: "Bedside screen for sepsis outside the ICU: Respiratory rate ≥ 22/min, Altered mentation (GCS < 15), Systolic blood pressure ≤ 100 mmHg.",
      Tags: "qSOFA, sepsis, organ failure, Sepsis-3, infection screening, mortality risk",
      href: "calculators.html#calcQsofa3d",
      targetId: "calcQsofa3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Critical Care",
      Title: "CURB-65 Pneumonia Severity Score",
      Summary: "Mortality prediction in community-acquired pneumonia: Confusion, Urea > 7 mmol/L, Respiratory rate ≥ 30/min, Blood pressure (SBP < 90 or DBP ≤ 60), Age ≥ 65.",
      Tags: "CURB-65, pneumonia, CAP, severe pneumonia, ICU admission trigger",
      href: "calculators.html#calcCurb653d",
      targetId: "calcCurb653d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "National Early Warning Score 2 (NEWS2)",
      Summary: "Royal College of Physicians standardized track-and-trigger score detecting acute physiological deterioration and sepsis across adult patients.",
      Tags: "NEWS2, early warning score, physiological deterioration, escalation, sepsis",
      href: "calculators.html#calcNews23d",
      targetId: "calcNews23d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Emergency",
      Title: "Modified Early Warning Score (MEWS)",
      Summary: "Bedside physiological scoring tool to identify medical and surgical ward patients at risk of catastrophic clinical deterioration and ICU admission.",
      Tags: "MEWS, early warning score, bedside deterioration, physiological tracking",
      href: "calculators.html#calcMews3d",
      targetId: "calcMews3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "Wilson Risk Score (Difficult Intubation)",
      Summary: "5-factor risk score predicting difficult direct laryngoscopy (weight, head & neck mobility, jaw movement, buck teeth, retrognathia).",
      Tags: "Wilson score, difficult airway, difficult intubation, laryngoscopy, retrognathia",
      href: "calculators.html#calcWilson3d",
      targetId: "calcWilson3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Hepatic",
      Title: "Child-Pugh Score (Hepatic Disease & Surgical Risk)",
      Summary: "Stratification of surgical risk in liver cirrhosis based on total bilirubin, serum albumin, INR, ascites, and hepatic encephalopathy.",
      Tags: "Child-Pugh, cirrhosis, liver failure, perioperative mortality, bilirubin, albumin, INR, ascites",
      href: "calculators.html#calcChildPugh3d",
      targetId: "calcChildPugh3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Anthropometry",
      Title: "Body Mass Index (BMI) & Nutritional Status",
      Summary: "WHO adult body mass index calculation and nutritional classification (Underweight, Normal, Overweight, Class I–III Obesity).",
      Tags: "BMI, body mass index, obesity, weight, height, nutritional status",
      href: "calculators.html#calcBmi3d",
      targetId: "calcBmi3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "METs Functional Capacity",
      Summary: "ACC/AHA and ESAIC perioperative functional reserve evaluation (<4 METs poor, 4–10 moderate, >10 excellent).",
      Tags: "METs, functional capacity, metabolic equivalents, cardiorespiratory fitness, perioperative risk",
      href: "calculators.html#calcMets3d",
      targetId: "calcMets3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "Duke Activity Status Index (DASI)",
      Summary: "Validated 12-item cardiorespiratory functional capacity questionnaire and peak VO2 estimation (METs = VO2 / 3.5).",
      Tags: "DASI, Duke Activity Status Index, VO2 peak, functional reserve, cardiac risk",
      href: "calculators.html#calcDasi3d",
      targetId: "calcDasi3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Airway",
      Title: "STOP-Bang OSA Screening",
      Summary: "Obstructive sleep apnoea perioperative screening questionnaire (Snoring, Tired, Observed, Pressure, BMI, Age, Neck, Gender).",
      Tags: "STOP-Bang, OSA, obstructive sleep apnoea, airway collapse, perioperative monitoring",
      href: "calculators.html#calcStopBang3d",
      targetId: "calcStopBang3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Anthropometry",
      Title: "Ideal & Adjusted Body Weight (IBW, ABW, LBW)",
      Summary: "Devine Ideal Body Weight, Adjusted Body Weight (ABW 0.4), and Janmahasatian Lean Body Weight (LBW) formulas for anaesthetic drug dosing in obesity.",
      Tags: "IBW, ABW, LBW, Devine formula, lean body weight, adjusted body weight, obesity dosing",
      href: "calculators.html#calcWeights3d",
      targetId: "calcWeights3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "Revised Cardiac Risk Index (RCRI / Lee Criteria)",
      Summary: "Gold-standard risk index for major adverse cardiac events (MACE) in non-cardiac surgery: high-risk surgery, ischemic heart disease, CHF, cerebrovascular disease, diabetes on insulin, Cr > 2 mg/dL.",
      Tags: "RCRI, Lee criteria, cardiac risk, MACE, myocardial infarction, non-cardiac surgery",
      href: "calculators.html#calcRcri3d",
      targetId: "calcRcri3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "CHA₂DS₂-VASc & CHADS₂ Score",
      Summary: "Stroke risk stratification in non-valvular atrial fibrillation to guide perioperative oral anticoagulation (OAC) and heparin bridging.",
      Tags: "CHA2DS2-VASc, CHADS2, atrial fibrillation, stroke risk, anticoagulation, bridging, DOAC",
      href: "calculators.html#calcCha2ds23d",
      targetId: "calcCha2ds23d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Hepatic",
      Title: "MELD-Na Score (UNOS 2016)",
      Summary: "Model for End-Stage Liver Disease incorporating serum sodium, bilirubin, INR, and creatinine to predict 90-day pre- and post-transplant mortality.",
      Tags: "MELD-Na, MELD, liver disease, end-stage liver disease, cirrhosis, mortality",
      href: "calculators.html#calcMeldNa3d",
      targetId: "calcMeldNa3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "FRAIL Scale (5-Item Frailty Screening)",
      Summary: "Validated 5-item clinical frailty screening tool (Fatigue, Resistance, Ambulation, Illness, Loss of weight) predicting surgical complications in elderly.",
      Tags: "FRAIL scale, frailty, geriatric anaesthesia, post-op delirium, surgical vulnerability",
      href: "calculators.html#calcFrail3d",
      targetId: "calcFrail3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Perioperative",
      Title: "Clinical Frailty Scale (Rockwood CFS 1–9)",
      Summary: "Rockwood Clinical Frailty Scale evaluating clinical fitness versus severe frailty and terminal illness in perioperative and intensive care.",
      Tags: "CFS, Rockwood, clinical frailty scale, geriatric, ICU outcome, vulnerability",
      href: "calculators.html#calcCfs3d",
      targetId: "calcCfs3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Renal",
      Title: "Creatinine Clearance (Cockcroft–Gault)",
      Summary: "Estimated renal clearance with Actual, Ideal (Devine), and Adjusted body weight selection for antimicrobial and renal-eliminated drug dosing.",
      Tags: "Cockcroft-Gault, CrCl, creatinine clearance, eGFR, renal function, nephrotoxicity",
      href: "calculators.html#calcCrCl3d",
      targetId: "calcCrCl3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Electrolytes",
      Title: "Calcium Correction for Albumin (Payne Formula)",
      Summary: "Corrected total calcium calculation: Corrected Ca = Total Ca + 0.02 × (40 - Albumin g/L). Identifies pseudohypocalcaemia in hypoalbuminaemia.",
      Tags: "calcium correction, Payne formula, hypoalbuminaemia, pseudohypocalcaemia, ionized calcium",
      href: "calculators.html#calcCorrectedCa3d",
      targetId: "calcCorrectedCa3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Electrolytes",
      Title: "Sodium Correction for Hyperglycemia (Katz / Hillier Formula)",
      Summary: "Corrected serum sodium for osmotic fluid shift in hyperglycaemic crises (DKA / HHS): Corrected Na = Measured Na + 0.016 × (Glucose - 100 mg/dL).",
      Tags: "sodium correction, hyperglycemia, Katz formula, Hillier, DKA, HHS, pseudohyponatremia",
      href: "calculators.html#calcCorrectedNa3d",
      targetId: "calcCorrectedNa3d",
    },
    {
      Type: "Calculator",
      Category: "Calculators • Acid–Base",
      Title: "Arterial Blood Gas (ABG) Clinical Analysis Suite",
      Summary: "Step-by-step blood gas analysis: pH, PaCO2, PaO2, HCO3, Winter's formula compensation, Figge albumin-corrected anion gap, delta ratio, and oxygenation.",
      Tags: "ABG, arterial blood gas, pH, PaCO2, PaO2, HCO3, acid-base, compensation, oxygenation",
      href: "calculators.html#abgHero",
      targetId: "abgHero",
    },

// --- REGIONAL ANAESTHESIA (NERVE BLOCKS) — generated from regional-data.js ---
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia",
      Title: "Regional Anaesthesia — Nerve Blocks (hub)",
      Summary: "NYSORA-based nerve blocks: upper & lower limb, chest wall, abdominal wall, head & neck, neuraxial — sono-anatomy, exam line diagrams, 3D spread.",
      href: "regional-anaesthesia.html"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Interscalene Brachial Plexus Block",
      Summary: "Shoulder & proximal humerus • C5–C7. Local anaesthetic is placed around the superior and middle trunks (C5–C7 roots) between the anterior and middle scalene muscles. It gives reliable anaesthesia of the shoulder and upper arm; the inferior trunk (C8–T1) is usually spared. Tags: Brachial plexus, Roots / trunks, Phrenic risk.",
      href: "regional-anaesthesia.html?block=interscalene"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Supraclavicular Brachial Plexus Block",
      Summary: "Whole arm below the shoulder • trunks/divisions. Here the trunks and divisions are compact, lying posterolateral to the subclavian artery above the first rib. A single site gives rapid, dense anaesthesia of the arm, elbow, forearm and hand. Tags: Brachial plexus, Trunks / divisions, 'Spinal of the arm'.",
      href: "regional-anaesthesia.html?block=supraclavicular"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Infraclavicular Brachial Plexus Block",
      Summary: "Arm below the shoulder • cords. The three cords surround the second part of the axillary artery deep to pectoralis major and minor. One injection posterior to the artery (≈6 o'clock) that spreads in a U-shape around it blocks all three cords. Tags: Brachial plexus, Cords, Catheter-friendly.",
      href: "regional-anaesthesia.html?block=infraclavicular"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Axillary Brachial Plexus Block",
      Summary: "Elbow, forearm & hand • terminal branches. The terminal branches are scattered around the axillary artery: median superficial-lateral, ulnar superficial-medial and radial posterior. The musculocutaneous nerve has already left the sheath and lies between biceps and coracobrachialis — it must be blocked separately. Tags: Brachial plexus, Terminal branches, No phrenic risk.",
      href: "regional-anaesthesia.html?block=axillary"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Intercostobrachial Nerve Block",
      Summary: "Medial upper arm & axilla • tourniquet adjunct. The intercostobrachial nerve (T2, ± T3) supplies the skin of the axilla and medial upper arm — territory every brachial plexus block misses. A simple subcutaneous injection blocks it, usually to cover a tourniquet. Tags: T2, Tourniquet pain, Adjunct block.",
      href: "regional-anaesthesia.html?block=intercostobrachial"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Axillary Nerve Block (Quadrilateral Space)",
      Summary: "Posterior/lateral shoulder & deltoid • diaphragm-sparing. The axillary nerve is blocked as it passes through the quadrilateral space with the posterior circumflex humeral vessels, deep to deltoid — usually paired with a suprascapular nerve block for phrenic-sparing shoulder analgesia. Tags: Shoulder analgesia, Deltoid, Diaphragm-sparing.",
      href: "regional-anaesthesia.html?block=axillary-nerve"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Upper Limb",
      Title: "Suprascapular Nerve Block",
      Summary: "Shoulder analgesia • diaphragm-sparing. The suprascapular nerve (C5–C6, from the superior trunk) supplies most of the posterior and superior shoulder joint and the supraspinatus/infraspinatus. It is blocked in the floor of the supraspinous fossa (posterior approach) or beneath the omohyoid (anterior approach). Tags: Shoulder analgesia, Diaphragm-sparing.",
      href: "regional-anaesthesia.html?block=suprascapular"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Femoral Nerve Block",
      Summary: "Anterior thigh, femur & knee • L2–L4. The femoral nerve lies 1–2 cm lateral to the femoral artery at the inguinal crease, deep to the fascia iliaca and on the iliopsoas. Local anaesthetic must reach beneath the fascia iliaca around the nerve. Tags: Lumbar plexus, L2–L4, Quadriceps weakness.",
      href: "regional-anaesthesia.html?block=femoral"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Infrainguinal Fascia Iliaca Block",
      Summary: "Anterior thigh analgesia • femoral ± LFCN. Performed in the same view as a femoral nerve block, at the inguinal crease, with the needle kept lateral to the nerve and a larger volume injected to spread under the fascia iliaca. Tags: Fascial plane, Volume-dependent, Hip fracture.",
      href: "regional-anaesthesia.html?block=fascia-iliaca"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Suprainguinal Fascia Iliaca Block (SIFI)",
      Summary: "Hip, anterior & lateral thigh • above the inguinal ligament. Injection above the inguinal ligament, deep to the fascia iliaca and superficial to iliacus, spreads cranially toward the lumbar plexus — giving broader coverage than the infrainguinal approach. Tags: Lumbar plexus, Hip fracture, SIFI.",
      href: "regional-anaesthesia.html?block=fascia-iliaca-suprainguinal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Pericapsular Nerve Group (PENG) Block",
      Summary: "Anterior hip capsule • motor-sparing. Targets the articular branches of the femoral, obturator and accessory obturator nerves to the anterior hip capsule, in the plane between the psoas tendon and the iliopubic eminence. Tags: Hip capsule, Motor-sparing, Fascial plane.",
      href: "regional-anaesthesia.html?block=peng"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Lateral Femoral Cutaneous Nerve Block",
      Summary: "Anterolateral thigh skin • purely sensory. The LFCN is blocked where it runs in a fat-filled fascial tunnel between the sartorius and tensor fasciae latae, just medial and inferior to the ASIS. Tags: Sensory only, Meralgia paraesthetica, Fascial tunnel.",
      href: "regional-anaesthesia.html?block=lfcn"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Adductor Canal (Saphenous) Block",
      Summary: "Knee analgesia • quadriceps-sparing. LA lateral to the femoral artery beneath sartorius in the adductor canal blocks the saphenous nerve and nerve to vastus medialis (± medial femoral cutaneous and obturator articular branches) while largely sparing quadriceps strength. Tags: Saphenous, Quadriceps-sparing, Knee.",
      href: "regional-anaesthesia.html?block=adductor-canal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "iPACK Block",
      Summary: "Posterior knee capsule • motor-sparing. Infiltration of the Interspace between the Popliteal Artery and the Capsule of the posterior Knee blocks articular branches to the posterior capsule without affecting tibial or common peroneal motor function. Tags: Posterior knee, Motor-sparing, Infiltration.",
      href: "regional-anaesthesia.html?block=ipack"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Popliteal Sciatic Nerve Block",
      Summary: "Below knee (except medial) • foot & ankle. The sciatic nerve is blocked in the popliteal fossa at/near its division into tibial and common peroneal nerves. Injecting inside the common paraneural (Vloka) sheath gives a rapid, dense block. Tags: Sciatic, Foot & ankle, Paraneural sheath.",
      href: "regional-anaesthesia.html?block=popliteal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Sciatic Nerve Block — Subgluteal (Infragluteal) Approach",
      Summary: "Below-knee surgery • undivided sciatic trunk. The sciatic nerve is blocked just below the gluteal fold, where it is superficial between the hamstrings and adductor magnus — easier to reach than the classic transgluteal approach and avoids the thick gluteus maximus. Tags: Sciatic, Posterior thigh, Below gluteal fold.",
      href: "regional-anaesthesia.html?block=sciatic-subgluteal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Sciatic Nerve Block — Transgluteal (Labat) Approach",
      Summary: "Classic posterior approach • through gluteus maximus. The original Labat approach blocks the sciatic nerve as it exits the pelvis: a flattened hyperechoic band lying in the groove between the ischial tuberosity and the greater trochanter, deep to gluteus maximus. Tags: Sciatic, Classic Labat approach, Through gluteus maximus.",
      href: "regional-anaesthesia.html?block=sciatic-transgluteal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Sciatic Nerve Block — Anterior Approach",
      Summary: "Supine positioning • trauma, casts, cannot turn. The sciatic nerve is blocked from the front of the thigh, deep to the adductor muscles and posteromedial to the femur — useful when the patient cannot be turned prone or lateral. Tags: Sciatic, Anterior thigh, Supine positioning.",
      href: "regional-anaesthesia.html?block=sciatic-anterior"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Obturator Nerve Block",
      Summary: "Hip adductors • obturator reflex, medial thigh/knee. The obturator nerve is blocked in the proximal medial thigh, in the interfascial planes between the adductor muscles — targeting its anterior and posterior branches separately for a reliable block of the hip adductors. Tags: Obturator, Hip adductors, TURBT / obturator reflex.",
      href: "regional-anaesthesia.html?block=obturator"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Lumbar Plexus Block (Shamrock Method)",
      Summary: "Hip, anterior thigh, knee • posterior approach at L4. The lumbar plexus is blocked within psoas major at the L3–L4 level using the 'shamrock' ultrasound sign — the transverse process shadow as the clover's stem, with quadratus lumborum, erector spinae and psoas major as its three leaves. Tags: Lumbar plexus, Psoas compartment, Hip fracture.",
      href: "regional-anaesthesia.html?block=lumbar-plexus"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Ankle Block",
      Summary: "Whole foot • five nerves. Five nerves: two deep (tibial and deep peroneal) and three superficial (superficial peroneal, sural and saphenous). All are sciatic branches except the saphenous, which comes from the femoral nerve. Tags: 5 nerves, Foot surgery.",
      href: "regional-anaesthesia.html?block=ankle"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Lower Limb",
      Title: "Saphenous Nerve Block at the Ankle",
      Summary: "Medial ankle/foot skin • adjunct to a sciatic block. The saphenous nerve is blocked subcutaneously near the medial malleolus, beside the great saphenous vein, covering the medial ankle and foot without any motor weakness. Tags: Sensory only, Medial foot/ankle, Adjunct to sciatic.",
      href: "regional-anaesthesia.html?block=saphenous-ankle"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Chest Wall & Paraspinal",
      Title: "PECS I & II Blocks",
      Summary: "Breast & anterior chest wall. PECS I places ~10 mL between pectoralis major and minor (medial and lateral pectoral nerves — no skin). PECS II adds 15–20 mL between pectoralis minor and serratus anterior at the 3rd–4th rib to reach the lateral cutaneous branches of T2–T4, the long thoracic and intercostobrachial nerves. Tags: Fascial plane, Breast surgery.",
      href: "regional-anaesthesia.html?block=pecs"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Chest Wall & Paraspinal",
      Title: "Serratus Anterior Plane Block",
      Summary: "Lateral hemithorax • T2–T9. LA in the plane superficial (latissimus dorsi / serratus anterior) or deep (serratus anterior / ribs) to serratus anterior at the 4th–5th rib in the mid-axillary line blocks the lateral cutaneous branches of the T2–T9 intercostal nerves. Tags: Fascial plane, Rib fractures.",
      href: "regional-anaesthesia.html?block=serratus"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Chest Wall & Paraspinal",
      Title: "Erector Spinae Plane Block",
      Summary: "Thoracic / abdominal analgesia • paraspinal. LA deposited deep to erector spinae on the transverse process spreads craniocaudally over several levels. It consistently blocks dorsal rami (posterior chest wall); spread to ventral rami/paravertebral space — and hence lateral/anterior coverage — is variable. Tags: Fascial plane, Paraspinal, Simple & safe.",
      href: "regional-anaesthesia.html?block=esp"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Chest Wall & Paraspinal",
      Title: "Thoracic Paravertebral Block",
      Summary: "Unilateral segmental somatic + sympathetic. Injection into the wedge-shaped paravertebral space produces ipsilateral, segmental somatic and sympathetic block over several contiguous thoracic dermatomes. Tags: Somatic + sympathetic, Unilateral.",
      href: "regional-anaesthesia.html?block=tpvb"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Transversus Abdominis Plane (TAP) Block",
      Summary: "Anterior abdominal wall • somatic only. LA between the internal oblique and transversus abdominis blocks the thoracolumbar nerves in the TAP. The lateral approach (mid-axillary line) covers T10–T12; the subcostal approach covers T6–T9. Abdominal wall (somatic) analgesia only — no visceral cover. Tags: Fascial plane, Somatic only, Bilateral.",
      href: "regional-anaesthesia.html?block=tap"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Subcostal TAP Block",
      Summary: "Upper/medial abdominal wall • above the umbilicus. The probe runs parallel to the costal margin and the needle passes medial to lateral in the plane between rectus abdominis/posterior rectus sheath and transversus abdominis, covering the upper abdominal wall the lateral TAP misses. Tags: T6–T9, Upper abdominal wall, Midline surgery.",
      href: "regional-anaesthesia.html?block=subcostal-tap"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Rectus Sheath Block",
      Summary: "Periumbilical / midline • T9–T11. LA between the rectus abdominis and the posterior rectus sheath blocks the terminal anterior branches of T9–T11 as they enter the muscle. Performed bilaterally for midline incisions. Tags: Fascial plane, Midline, Bilateral.",
      href: "regional-anaesthesia.html?block=rectus-sheath"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Quadratus Lumborum Block",
      Summary: "Abdominal wall ± visceral • T7–L1. Injection around the quadratus lumborum: QL1 (lateral), QL2 (posterior — between QL and the thoracolumbar fascia/erector spinae) or transmuscular/QL3 (between QL and psoas, 'shamrock' view). Coverage is wider and longer than TAP, with possible paravertebral spread. Tags: Fascial plane, ± Visceral, Shamrock.",
      href: "regional-anaesthesia.html?block=ql"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Transversalis Fascia Plane Block",
      Summary: "Groin & lower abdominal wall • T12–L2. LA is deposited deep to transversus abdominis, superficial to the transversalis fascia, where the iliohypogastric, ilioinguinal and subcostal nerves run together — essentially the same plane as a QL1 block, approached anterolaterally. Tags: T12–L2, Inguinal hernia, QL1-equivalent.",
      href: "regional-anaesthesia.html?block=transversalis-fascia-plane"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Abdominal Wall",
      Title: "Ilioinguinal & Iliohypogastric Nerve Block",
      Summary: "Inguinal region • L1. The ilioinguinal and iliohypogastric nerves (L1) lie between internal oblique and transversus abdominis just superomedial to the ASIS. A small volume blocks the groin, upper medial thigh and anterior scrotum/labia. Tags: L1, Groin, Paediatrics.",
      href: "regional-anaesthesia.html?block=ilioinguinal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Head & Neck",
      Title: "Superficial Cervical Plexus Block",
      Summary: "Neck, ear & 'cape' • C2–C4. The sensory branches of C2–C4 — lesser occipital, great auricular, transverse cervical and supraclavicular nerves — emerge at the midpoint of the posterior border of the sternocleidomastoid ('nerve point of the neck'). Tags: C2–C4, Carotid endarterectomy.",
      href: "regional-anaesthesia.html?block=cervical-plexus"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Head & Neck",
      Title: "Scalp Block",
      Summary: "Awake craniotomy • six nerves. Infiltration of six nerves on each side: supraorbital and supratrochlear (V1), zygomaticotemporal (V2), auriculotemporal (V3), lesser occipital (C2–C3) and greater occipital (C2). Tags: Awake craniotomy, Landmark.",
      href: "regional-anaesthesia.html?block=scalp"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Neuraxial",
      Title: "Spinal (Subarachnoid) Anaesthesia",
      Summary: "Dense block below a dermatomal level. Local anaesthetic is injected into CSF in the lumbar dural sac below the conus (L1–L2 in adults), usually at L3–4 or L4–5. Block height depends mainly on baricity, dose and patient position. Tags: Subarachnoid, Dense, Baricity.",
      href: "regional-anaesthesia.html?block=spinal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Neuraxial",
      Title: "Epidural Anaesthesia & Analgesia",
      Summary: "Segmental, titratable • catheter. A Tuohy needle is advanced until loss of resistance as it passes the ligamentum flavum into the epidural space; a catheter allows titratable, segmental block centred on the insertion level. Tags: Segmental, Catheter, Titratable.",
      href: "regional-anaesthesia.html?block=epidural"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Neuraxial",
      Title: "Caudal Epidural Block",
      Summary: "Paediatric sub-umbilical • sacral hiatus. Epidural injection through the sacral hiatus, covered by the sacrococcygeal ligament between the sacral cornua. Armitage volumes: 0.5 mL/kg sacral, 1.0 mL/kg lumbar, 1.25 mL/kg mid-thoracic. Tags: Paediatrics, Sacral hiatus, Armitage.",
      href: "regional-anaesthesia.html?block=caudal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Popliteal Sciatic Nerve Block (Paediatric)",
      Summary: "Below-knee surgery in children • performed under GA. Same target as the adult popliteal block, performed after induction of general anaesthesia with weight-based volumes and a finer, shorter needle. Tags: Paediatrics, Clubfoot, GA + block.",
      href: "regional-anaesthesia.html?block=paeds-popliteal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Femoral Nerve Block (Paediatric)",
      Summary: "Femur fracture & thigh surgery in children • performed under GA. Same target as the adult femoral nerve block, scaled down with a weight-based volume and a fine, short needle. Tags: Paediatrics, Femur fracture, GA + block.",
      href: "regional-anaesthesia.html?block=paeds-femoral"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Dorsal Penile Nerve Block (Paediatric)",
      Summary: "Circumcision & distal hypospadias • plain LA only. The dorsal nerves of the penis are blocked at the base of the penis, either side of the midline — an alternative to caudal block, with no motor effect on the legs. Tags: Paediatrics, Circumcision, No adrenaline.",
      href: "regional-anaesthesia.html?block=paeds-penile"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Caudal Block (Paediatric)",
      Summary: "Sub-umbilical surgery • the classic paediatric block. Single-shot epidural injection through the sacral hiatus, dosed by the Armitage formula (0.5 / 1.0 / 1.25 mL/kg), almost always performed under general anaesthesia. Tags: Paediatrics, Sacral hiatus, Armitage.",
      href: "regional-anaesthesia.html?block=paeds-caudal"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Quadratus Lumborum Block (Paediatric)",
      Summary: "Wide abdominal analgesia in children • performed under GA. Same 'shamrock' target as the adult QL block, increasingly favoured over caudal block for wider or longer sub-umbilical analgesia without motor or urinary effects. Tags: Paediatrics, Wide abdominal coverage, GA + block.",
      href: "regional-anaesthesia.html?block=paeds-ql"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Rectus Sheath Block (Paediatric)",
      Summary: "Umbilical/midline surgery in children • bilateral. Same target as the adult rectus sheath block, almost always performed bilaterally for umbilical hernia repair and pyloromyotomy. Tags: Paediatrics, Umbilical hernia, Pyloromyotomy.",
      href: "regional-anaesthesia.html?block=paeds-rectus-sheath"
    },
    {
      Type: "Regional Block",
      Category: "Regional Anaesthesia • Paediatric Blocks",
      Title: "Axillary Brachial Plexus Block (Paediatric)",
      Summary: "Elbow, forearm & hand surgery in children • performed under GA. Same target as the adult axillary block, scaled down with a weight-based volume and a fine, short needle. Tags: Paediatrics, Hand/forearm surgery, GA + block.",
      href: "regional-anaesthesia.html?block=paeds-axillary"
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

    // --- ACTIVE RECALL CLINICAL PEARLS & VIVA EXAM CLASSICS (notes.html) ---
{
      Type: "Clinical Pearl",
      Category: "Valve Lesions • Mitral Stenosis",
      Title: "Mitral Stenosis: Rate Matters",
      Summary: "Tachycardia shortens diastole and critically impairs LV filling across a stenotic valve.",
      Answer: "Haemodynamic goals: Maintain sinus rhythm, control ventricular rate (60–75 bpm), preserve preload, maintain adequate SVR, avoid hypoxemia and hypercarbia which increase PVR and precipitate acute right heart failure. Atrial kick contributes 25–30% of LV end-diastolic volume in mitral stenosis.",
      Tags: "mitral stenosis, valvular heart disease, atrial kick, heart rate, diastolic filling time, PVR, pulmonary hypertension",
      href: "notes.html#p-ms-3d",
      targetId: "p-ms-3d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Valve Lesions • Aortic Stenosis",
      Title: "Aortic Stenosis: Fixed Output State",
      Summary: "In severe AS (valve area < 1.0 cm²), cardiac output is fixed and the hypertrophied LV is exquisitely afterload-dependent.",
      Answer: "Haemodynamic goals: Avoid tachycardia (shortens coronary perfusion time) and extreme bradycardia (stroke volume is fixed). Maintain high-normal SVR to guarantee coronary perfusion pressure across the thick myocardium. Preserve sinus rhythm (atrial kick is essential for LV filling). Avoid spinal anaesthesia / high sympathectomy.",
      Tags: "aortic stenosis, fixed cardiac output, coronary perfusion pressure, afterload, hypertrophy, atrial kick",
      href: "notes.html#p-as-3d",
      targetId: "p-as-3d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Valve Lesions • Regurgitation",
      Title: "Aortic & Mitral Regurgitation: Forward Flow",
      Summary: "In regurgitant valvular lesions, the primary haemodynamic objective is promoting forward cardiac output over backwards regurgitant flow.",
      Answer: "Rule: Full, Fast, and Forward. Heart rate: High-normal (80–100 bpm) shortens diastole in AR and reduces the regurgitant fraction. Preload: High-normal to maintain stroke volume. Afterload (SVR): Low to normal; vasodilators (e.g. nicardipine, nitroprusside) decrease resistance to forward flow and substantially reduce regurgitant volume.",
      Tags: "aortic regurgitation, mitral regurgitation, full fast forward, SVR reduction, afterload, regurgitant fraction",
      href: "notes.html#p-reg-3d",
      targetId: "p-reg-3d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Pharmacology • NMBA",
      Title: "Succinylcholine (Suxamethonium)",
      Summary: "Depolarising neuromuscular blocker with rapid onset (30–60s) and brief duration (5–10 min) via plasma cholinesterase hydrolysis.",
      Answer: "Dose: 1–1.5 mg/kg IV. Triggers malignant hyperthermia. Contraindications: Burns >24–48h, denervation / spinal cord injury >24h, muscular dystrophies, hyperkalaemia, severe crush injury, prolonged immobilization, pseudocholinesterase deficiency. Serum K+ rises by 0.5–1.0 mmol/L normally.",
      Tags: "succinylcholine, suxamethonium, depolarising, malignant hyperthermia, hyperkalaemia, burns, pseudocholinesterase",
      href: "notes.html#p13d",
      targetId: "p13d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Pharmacology • Reversal",
      Title: "Sugammadex (Bridion)",
      Summary: "Modified gamma-cyclodextrin that selectively encapsulates and inactivates aminosteroid NMBAs (rocuronium > vecuronium).",
      Answer: "Dosing: 2 mg/kg for routine reversal (2 twitches on TOF), 4 mg/kg for deep block (1–2 post-tetanic counts PTC), 16 mg/kg for immediate rescue reversal (3 min after 1.2 mg/kg rocuronium). Does not reverse benzylisoquinolines. Binds oral contraceptives (advise barrier contraception for 7 days). Bradycardia risk.",
      Tags: "sugammadex, rocuronium reversal, cyclodextrin, TOF, post tetanic count, CICO rescue, oral contraceptives",
      href: "notes.html#p23d",
      targetId: "p23d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Physiology • Oxygenation",
      Title: "FRC as an Oxygen Reservoir",
      Summary: "Functional Residual Capacity (FRC ~ 30 mL/kg) is the only oxygen reservoir maintaining alveolar gas exchange during apnoea.",
      Answer: "With effective preoxygenation (denitrogenation with 100% O2 for 3 min or 8 vital capacity breaths), alveolar oxygen fraction (FAO2) rises to ~0.90. This expands the oxygen store in FRC from ~450 mL (room air) to ~2000–3000 mL, providing 6–8 minutes of safe apnoea time in healthy adults before desaturation. FRC drops in obesity, pregnancy, supine position, and anaesthesia.",
      Tags: "FRC, functional residual capacity, preoxygenation, denitrogenation, safe apnoea time, desaturation",
      href: "notes.html#p33d",
      targetId: "p33d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Airway • Emergency",
      Title: "Can't Intubate, Can't Oxygenate (CICO)",
      Summary: "The ultimate airway emergency requiring immediate declaration and progression to emergency front-of-neck access (eFONA).",
      Answer: "Protocol: 1. Declare CICO and call for senior help. 2. 100% O2 via facemask / supraglottic airway (SGA). 3. Administer full paralysis (rocuronium or sugammadex if reversing). 4. Perform eFONA: Scalpel-bougie-tube technique: Laryngeal handshake -> transverse scalpel incision through cricothyroid membrane -> rotate blade 90° -> insert coudé bougie into trachea -> railroad size 6.0 cuffed ETT over bougie -> inflate cuff and confirm ventilation.",
      Tags: "CICO, cannot intubate cannot oxygenate, eFONA, scalpel bougie tube, front of neck access, emergency airway",
      href: "notes.html#p43d",
      targetId: "p43d",
    },
    {
      Type: "Clinical Pearl",
      Category: "Critical Care • Monitoring",
      Title: "Sudden Loss of ETCO₂",
      Summary: "Differential diagnosis for an immediate, catastrophic drop in end-tidal carbon dioxide to near zero.",
      Answer: "Differential: 1. Disconnection / ventilator failure / sampling line obstruction. 2. Complete airway obstruction / kinked ETT. 3. Oesophageal intubation. 4. Massive Pulmonary Embolism (sudden massive dead space). 5. Cardiac Arrest (loss of pulmonary blood flow and CO2 delivery to alveoli). Immediate action: Confirm pulse, check circuit connections, hand-ventilate on 100% O2.",
      Tags: "ETCO2, sudden loss of ETCO2, capnography, cardiac arrest, circuit disconnection, pulmonary embolism, oesophageal intubation",
      href: "notes.html#p63d",
      targetId: "p63d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #001 • Physics",
      Title: "Why does N₂O expand a closed gas space?",
      Summary: "Nitrous oxide is 34 times more soluble in blood than nitrogen.",
      Answer: "Nitrous oxide is 34 times more soluble in blood than nitrogen (blood:gas partition coefficient 0.47 vs 0.014). Therefore, N2O diffuses out of blood into air-filled closed cavities far more rapidly than nitrogen can diffuse out of the cavity into blood. This leads to rapid volume expansion (in compliant spaces like bowel, pneumothorax, cuff) or high pressure rise (in non-compliant spaces like middle ear, eye bubble, pneumocephalus).",
      Tags: "N2O, nitrous oxide, closed gas space, pneumothorax, bowel gas, middle ear, solubility, second gas effect",
      href: "notes.html#v13d",
      targetId: "v13d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #002 • Neuroanaesthesia",
      Title: "What is the formula for Cerebral Perfusion Pressure (CPP)?",
      Summary: "Formula and physiological determinants of cerebral perfusion pressure.",
      Answer: "Formula: CPP = Mean Arterial Pressure (MAP) - Intracranial Pressure (ICP) [or Central Venous Pressure CVP, whichever is higher]. Normal CPP is 60–80 mmHg. In neurotrauma and raised ICP, a CPP target of 60–70 mmHg prevents secondary ischaemic brain injury. Autoregulation maintains constant cerebral blood flow (CBF) between CPP 50–150 mmHg.",
      Tags: "CPP, cerebral perfusion pressure, MAP, ICP, intracranial pressure, autoregulation, neuroanaesthesia",
      href: "notes.html#v23d",
      targetId: "v23d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #003 • Pharmacology",
      Title: "Why is etomidate relatively haemodynamically stable?",
      Summary: "Pharmacological basis for etomidate's haemodynamic stability.",
      Answer: "Etomidate does not inhibit the sympathetic nervous system or autonomic baroreflex tone. It causes negligible myocardial depression and minimal reduction in systemic vascular resistance (SVR) compared to propofol or thiopentone. Mechanism: Potent GABAA receptor positive allosteric modulator. Major drawback: Adrenocortical suppression via reversible inhibition of 11-beta-hydroxylase (converting 11-deoxycortisol to cortisol).",
      Tags: "etomidate, haemodynamic stability, baroreflex, 11-beta hydroxylase, adrenocortical suppression, induction",
      href: "notes.html#v33d",
      targetId: "v33d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #004 • Physiology",
      Title: "Physiological Shunt vs Dead Space",
      Summary: "Pathophysiological distinction between shunt and dead space ventilation.",
      Answer: "Shunt: Perfusion without ventilation (V/Q = 0). Blood traverses non-ventilated alveoli without picking up O2. Causes: Atelectasis, ARDS, consolidation, pulmonary oedema, cyanotic congenital heart defects. Hallmark: Hypoxaemia that does NOT fully correct with 100% FiO2. Dead space: Ventilation without perfusion (V/Q = infinity). Causes: Pulmonary embolism, hypotension, high PEEP, COPD. Hallmark: Hypercarbia and high PaCO2-EtCO2 gradient.",
      Tags: "shunt, dead space, V/Q mismatch, atelectasis, PE, hypoxia, hypercarbia, Berggren shunt equation",
      href: "notes.html#v43d",
      targetId: "v43d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #005 • Pharmacology",
      Title: "What happens to Minimum Alveolar Concentration (MAC) with age?",
      Summary: "The relationship between age and inhalational anaesthetic requirement.",
      Answer: "MAC decreases progressively with advancing age. After the peak MAC in neonates and infants (1–6 months old), MAC decreases by approximately 6% per decade of adult life (or ~4% per decade starting from age 20). An 80-year-old patient requires roughly 30% less volatile anaesthetic concentration than a 40-year-old for the same depth of anaesthesia, primarily due to age-related reductions in neuronal density, central synaptic transmission, and cerebral metabolic rate (CMRO2).",
      Tags: "MAC, minimum alveolar concentration, volatile anaesthetics, elderly, age-related decline, MAC awake",
      href: "notes.html#v53d",
      targetId: "v53d",
    },
    {
      Type: "Answer / Viva",
      Category: "Viva #006 • Regional",
      Title: "Why does spinal anaesthesia cause hypotension?",
      Summary: "Mechanism and haemodynamics of spinal anaesthesia hypotension.",
      Answer: "Mechanism: Sympathetic preganglionic B-fibre blockade (arising from T1–L2). 1. Venodilation: Systemic venodilation increases venous capacitance, drops venous return (preload) to the heart. 2. Arteriolar dilation: Drops systemic vascular resistance (afterload). 3. Cardioaccelerator block: High spinal blocks (T1–T4) paralyse cardiac sympathetic fibres, preventing reflex tachycardia and causing profound bradycardia (Bainbridge reflex & Bezold-Jarisch reflex). Management: Co-loading crystalloid/colloid, phenylephrine (alpha-1 vasoconstriction), ephedrine, and glycopyrrolate/atropine.",
      Tags: "spinal anaesthesia, hypotension, sympathectomy, venous pooling, preload, T1-T4 cardioaccelerators, phenylephrine",
      href: "notes.html#v63d",
      targetId: "v63d",
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
    },

    // --- CLINICAL PRACTICE GUIDELINES & CONSENSUS UPDATES ---
{
      Type: "Guideline",
      Category: "Updates • Resuscitation",
      Title: "2025 AHA Guidelines for CPR & ECC",
      Summary: "Major updates to adult and paediatric basic and advanced life support algorithms, resuscitation quality metrics, and post-cardiac arrest care standards.",
      Content: " Chest Compression Metrics:  Strict rate of 100–120/min, depth 5–6 cm (2–2.4 in), complete chest recoil, and chest compression fraction (CCF) &gt; 80%.  Refractory Shockable Rhythms:  Double sequential external defibrillation (DSED) and vector change (VC) defibrillation endorsed for persistent VF/pVT.  Waveform Capnography:  Continuous quantitative EtCO2; values &lt; 10 mmHg guide CPR compression optimization; sudden rise &gt; 35–40 mmHg indicates ROSC.  Post-ROSC Care:  Strict targeted temperature management (32°C–36°C or active fever prevention &lt; 37.5°C), normoxia (SpO2 92–98%), and immediate coronary angiography.",
      Reference: "2025 AHA Guidelines for CPR and ECC, Circulation Guideline Supplement.",
      href: "recent-updates.html",
    },
    {
      Type: "Guideline",
      Category: "Updates • Pulmonology & Airway",
      Title: "GINA Asthma Strategy & Perioperative Care Update",
      Summary: "Global Initiative for Asthma (GINA) strategy applied to acute bronchospasm, elective surgical optimization, and perioperative airway management.",
      Content: " Reliever Paradigm:  Anti-inflammatory reliever therapy (as-needed low-dose ICS-formoterol) preferred across all tracks; avoid SABA-only treatment to reduce severe exacerbations.  Preoperative Optimization:  Defer elective surgery if active wheeze, recent systemic corticosteroid bursts, or FEV1 &lt; 80%; prescribe 3–5 days of oral prednisolone (0.5–1 mg/kg/day) for suboptimal control.  Intraoperative Airway Strategy:  Prioritise regional anesthesia; use volatile agents (sevoflurane) or ketamine for bronchodilation; avoid desflurane and airway instrumentation during light anaesthesia planes.  Acute Bronchospasm Protocol:  High-dose nebulized SABA + ipratropium, IV magnesium sulphate (25–50 mg/kg, max 2 g), IV dexamethasone/hydrocortisone, and low-rate, prolonged expiratory time ventilation.",
      Reference: "Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention.",
      href: "recent-updates.html",
    },
    {
      Type: "Guideline",
      Category: "Updates • Critical Care",
      Title: "New Global Definition of ARDS (ESICM Consensus Update)",
      Summary: "Major international consensus statement updating and expanding the Berlin definition for intensive care and perioperative acute hypoxaemic respiratory failure.",
      Content: " Inclusion of Non-Invasive Modalities:  Recognizes ARDS in patients on High-Flow Nasal Cannula (HFNC ≥ 30 L/min) or continuous CPAP/NIV without requiring invasive endotracheal intubation.  SpO2/FiO2 Staging Index:  Formal validation of SpO2/FiO2 ratio (≤ 315 when SpO2 ≤ 97%) as an accurate surrogate for PaO2/FiO2, ensuring rapid bedside diagnosis in resource-variable settings.  Point-of-Care Ultrasound (POCUS):  Lung ultrasound demonstrating bilateral interstitial/alveolar syndromes (B-lines) formally accepted alongside chest X-ray and CT imaging.  Lung Protective Mechanical Ventilation:  Strict low tidal volume (4–6 mL/kg PBW), driving pressure &lt; 14 cmH2O, plateau pressure &lt; 30 cmH2O, and early prone positioning (≥ 16 h/day) for severe hypoxaemia.",
      Reference: "European Society of Intensive Care Medicine (ESICM). New Global Definition of ARDS, Intensive Care Medicine.",
      href: "recent-updates.html",
    },
    {
      Type: "Guideline",
      Category: "Updates • Airway",
      Title: "DAS 2025 Difficult Airway Guidelines",
      Summary: "Updated international algorithms for anticipated and unanticipated difficult tracheal intubation in adults, videolaryngoscopy first-line protocols, and emergency front-of-neck airway access (eFONA).",
      Content: " Videolaryngoscopy Priority:  Routine first-line use of videolaryngoscopy recommended for all anticipated and unanticipated difficult airways.  Limited Intubation Attempts:  Maximum 3 attempts at tracheal intubation before declaring failure and proceeding immediately to Plan B (SGA insertion).  eFONA Scalpel-Bougie-Tube:  Standardized scalpel-bougie-tube technique as the gold-standard rescue for can't intubate, can't oxygenate (CICO) crises.",
      Reference: "Difficult Airway Society (DAS) 2025 Guidelines, British Journal of Anaesthesia.",
      href: "recent-updates.html",
    },
    {
      Type: "Guideline",
      Category: "Updates • Critical Care",
      Title: "Surviving Sepsis Campaign International Guidelines 2026",
      Summary: "Consensus guidelines for the management of sepsis and septic shock: 1-hour resuscitation bundle, early balanced crystalloids, dynamic hemodynamic assessment, and vasopressor strategies.",
      Content: " 1-Hour Bundle:  Measure lactate, obtain blood cultures before antibiotics, administer broad-spectrum antimicrobials within 1 hr, and initiate crystalloid fluid resuscitation.  Balanced Crystalloids over Saline:  Use buffered crystalloids (Plasma-Lyte / Ringer's) for initial fluid loading (30 mL/kg within 3 hrs).  First-Line Vasopressor:  Noradrenaline titrated to MAP ≥ 65 mmHg; add vasopressin early if high-dose noradrenaline is needed.",
      Reference: "Surviving Sepsis Campaign 2026, Critical Care Medicine / Intensive Care Medicine.",
      href: "recent-updates.html",
    },

    // --- STUDY MODE: TOPICS (study.html - 64 COMPREHENSIVE TOPICS) ---
{
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Preoperative Assessment & Optimisation",
      Summary: "History, airway exam, risk scoring, and medication management before surgery",
      Tags: "ASA guideline, Risk stratification, anaesthesia, Preop Assessment",
      href: "study.html?item=preop-assessment",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "ASA Physical Status Classification",
      Summary: "Six-tier system describing a patient's systemic disease burden before anaesthesia",
      Tags: "Risk, Classification, anaesthesia, ASA-PS",
      href: "study.html?item=asa-pscore",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Airway Assessment & Difficult Airway Management",
      Summary: "Predicting and managing the anticipated and unanticipated difficult airway",
      Tags: "ASA algorithm, DAS guideline, anaesthesia, Difficult Airway",
      href: "study.html?item=airway-assessment",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Anaesthesia Machine & Breathing Circuits",
      Summary: "Physical architecture across high, intermediate, and low pressure systems, gas pathways, vaporizers, and circle circuits",
      Tags: "Workstation, High pressure, Intermediate pressure, Low pressure, Circle system, Vaporizers, anaesthesia, Machine & Circuits",
      href: "study.html?item=anaesthesia-machine",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Anaesthesia Workstation Check — Pre-Use Checkout Protocol",
      Summary: "Sequential flowchart protocol for daily and pre-case anaesthesia machine checkout based on Miller and Dorsch",
      Tags: "Checkout protocol, Miller's Anesthesia, Dorsch & Dorsch, Flowchart, Safety check, Negative pressure leak test, anaesthesia, Workstation Check",
      href: "study.html?item=anaesthesia-workstation-check",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Rapid Sequence Induction (RSI)",
      Summary: "Induction technique to minimise the aspiration window in patients at high aspiration risk",
      Tags: "Aspiration prophylaxis, Full stomach, anaesthesia, RSI",
      href: "study.html?item=rsi",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "ASA Standard Monitoring",
      Summary: "Minimum monitoring standards during all anaesthesia care",
      Tags: "ASA standard, Safety, anaesthesia, Standard Monitoring",
      href: "study.html?item=asa-monitoring",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Fluids & Blood Products in Anaesthesia",
      Summary: "Composition, pH, osmolarity, pharmacokinetics, and transfusion guidelines",
      Tags: "Crystalloids & Colloids, Blood Products, MTP, Viscoelastic TEG/ROTEM, anaesthesia, Fluids & Transfusion",
      href: "study.html?item=fluid-transfusion",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Malignant Hyperthermia",
      Summary: "Life-threatening hypermetabolic crisis triggered by volatile agents/succinylcholine",
      Tags: "MHAUS protocol, Emergency, anaesthesia, Malignant Hyperthermia",
      href: "study.html?item=malignant-hyperthermia",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Postoperative Nausea and Vomiting (PONV)",
      Summary: "Risk-stratified multimodal prevention and rescue treatment",
      Tags: "Apfel score, Prophylaxis, anaesthesia, PONV",
      href: "study.html?item=ponv",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Neuraxial Blockade — Physiology & Comparison with GA",
      Summary: "Physiologic effects of spinal/epidural block and outcome comparisons with general anaesthesia",
      Tags: "Spinal, Epidural, anaesthesia, Neuraxial Physiology",
      href: "study.html?item=regional-physiology",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Anaphylaxis Under Anaesthesia",
      Summary: "Recognition and immediate management of intraoperative anaphylaxis",
      Tags: "Emergency, NMBA allergy, anaesthesia, Perioperative Anaphylaxis",
      href: "study.html?item=anaphylaxis-anaesthesia",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Enhanced Recovery After Surgery (ERAS)",
      Summary: "Evidence-based perioperative care bundle to accelerate functional recovery",
      Tags: "ERAS Society, Multimodal, anaesthesia, ERAS",
      href: "study.html?item=eras",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ANAESTHESIA",
      Title: "Diabetic Ketoacidosis (DKA), Euglycaemic DKA & Perioperative Glycaemic Protocols",
      Summary: "Latest ADA 2024–2026 & JBDS standard DKA insulin protocols, step-by-step fluid/potassium resuscitation, euglycaemic DKA recognition, comprehensive insulin classification table, and perioperative glycaemic targets",
      Tags: "DKA Protocol, Euglycaemic DKA, Insulin Classification, SGLT2 Inhibitor, Two-Bag System, Hypokalaemia, Perioperative Diabetes, anaesthesia, DKA & Glycaemic Protocols",
      href: "study.html?item=dka-perioperative-glycaemic-protocols",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EXAMINATION",
      Title: "Airway Clinical Examination & Difficult Airway Predictors",
      Summary: "Systematic 11-point bedside airway assessment, clinical measurement procedures, difficult airway prediction scores (LEMON, MOANS, RODS, SHORT), and algorithm-driven airway management planning",
      Tags: "Preop Airway, Mallampati, LEMON Score, Awake Intubation, SHORT Criteria, Difficult Mask, examination, Airway Examination",
      href: "study.html?item=exam-airway",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EXAMINATION",
      Title: "Cardiovascular System (CVS) Pre-Anaesthetic Examination",
      Summary: "Bedside cardiovascular examination for anaesthesia: arterial pulse waveform morphology, blood pressure and orthostatics, jugular venous pressure (JVP), precordial palpation & auscultation, valvular murmurs, and hemodynamic targets",
      Tags: "Preop CVS, Cardiac Murmurs, JVP Waves, Pulse Characters, Valvular Targets, METs Scoring, examination, CVS Examination",
      href: "study.html?item=exam-cvs",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EXAMINATION",
      Title: "Respiratory System (RS) Examination & Bedside PFTs",
      Summary: "Comprehensive pre-anaesthetic respiratory evaluation: 4-pillar chest examination (inspection, palpation, percussion, auscultation), 7 bedside pulmonary function tests, and perioperative pulmonary risk stratification",
      Tags: "Preop RS, Bedside PFT, Sabrasez Test, Snider Match, Chest Percussion, Breath Sounds, ARISCAT Score, examination, RS Examination & Bedside PFTs",
      href: "study.html?item=exam-respiratory",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EXAMINATION",
      Title: "Central Nervous System (CNS) Examination, MMSE & Cranial Nerves",
      Summary: "Systematic perioperative neurological assessment: Glasgow Coma Scale (GCS), 30-point Mini-Mental State Examination (MMSE), delirium screening, and all 12 cranial nerves simplified for anaesthesia practice",
      Tags: "Preop CNS, GCS Score, MMSE 30-Point, Cranial Nerves, Delirium CAM-ICU, Bromage Score, Pupils, examination, CNS Examination & Cranial Nerves",
      href: "study.html?item=exam-cns",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EXAMINATION",
      Title: "Gastrointestinal (GI) Examination, Fasting & Gastric POCUS",
      Summary: "Bedside abdominal examination, intra-abdominal hypertension, full stomach aspiration risk stratification, and point-of-care ultrasound (POCUS) gastric evaluation using the Perlas protocol",
      Tags: "Preop GI, Gastric POCUS, Perlas Score, Fasting 2-4-6-8, IAP / Compartment, Aspiration Risk, examination, GI Examination & Gastric POCUS",
      href: "study.html?item=exam-gi",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Basic ECG Interpretation & Systematic Sequence",
      Summary: "Standard calibration 25 mm/s & 10 mm/mV, wave morphology, interval durations, and 7-step reading sequence",
      Tags: "Calibration, Heart Rate, Intervals, P-QRS-T, Systematic Reading, ecg, Basic Interpretation",
      href: "study.html?item=ecg-basic",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Cardiac Axis Interpretation: Hexaxial Reference System & Quadrant Rules",
      Summary: "Hexaxial lead angles, normal axis (-30° to +90°), left & right axis deviations, quadrant methods, and clinical causes",
      Tags: "Frontal Plane, Hexaxial, LAD, RAD, Quadrant Rule, Fascicular Blocks, ecg, Axis Interpretation",
      href: "study.html?item=ecg-axis",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Left Ventricular Hypertrophy (LVH): Sokolow-Lyon, Cornell & Romhilt-Estes Criteria",
      Summary: "Voltage cutoffs, Cornell product, Romhilt-Estes point score, and secondary ST-T strain patterns",
      Tags: "Sokolow-Lyon, Cornell Voltage, Romhilt-Estes, LV Strain, Voltage Criteria, ecg, LVH Criteria",
      href: "study.html?item=ecg-lvh",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Right Ventricular Hypertrophy (RVH): Precordial & Frontal Criteria",
      Summary: "Tall R wave in V1, deep S in V5/V6, right axis deviation, RV strain pattern, and cor pulmonale signs",
      Tags: "R/S Ratio, Right Axis, RV Strain, P-Pulmonale, Cor Pulmonale, ecg, RVH Criteria",
      href: "study.html?item=ecg-rvh",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Bundle Branch Blocks: LBBB, RBBB & Sgarbossa MI Criteria",
      Summary: "QRS >=120 ms, notched lateral R waves, rsR' rabbit ears in V1, and Sgarbossa criteria for acute MI in LBBB",
      Tags: "LBBB, RBBB, Rabbit Ears, Sgarbossa Criteria, Modified Smith-Sgarbossa, ecg, Bundle Branch Blocks",
      href: "study.html?item=ecg-bbb",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Myocardial Infarction (MI) Criteria & STEMI Equivalents",
      Summary: "Fourth Universal Definition thresholds, contiguous lead rules, Wellens, de Winter, and coronary territories",
      Tags: "STEMI Criteria, 4th Universal Definition, Wellens, de Winter, Posterior MI, ecg, MI Criteria",
      href: "study.html?item=ecg-mi",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Heart Blocks: 1st Degree, Mobitz I, Mobitz II & Complete Heart Block",
      Summary: "First-degree, Mobitz I (Wenckebach), Mobitz II, and third-degree complete heart block with pacing protocols",
      Tags: "AV Blocks, Wenckebach, Mobitz II, Complete Heart Block, AV Dissociation, ecg, Heart Blocks",
      href: "study.html?item=ecg-blocks",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Ventricular Tachycardia (VT): Monomorphic, Polymorphic & Diagnostic Algorithms",
      Summary: "Monomorphic vs polymorphic VT, Brugada 4-step algorithm, Vereckei aVR, and emergency cardioversion protocols",
      Tags: "Wide Complex Tachycardia, Brugada Algorithm, Vereckei aVR, Capture Beats, Fusion Beats, Torsades de Pointes, ecg, Ventricular Tachycardia",
      href: "study.html?item=ecg-vt",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Ventricular Fibrillation (VF): Coarse vs Fine & ACLS Protocol",
      Summary: "Coarse vs fine VF, avoiding mistaking fine VF for asystole, 200 J biphasic defibrillation, and ACLS algorithms",
      Tags: "Cardiac Arrest, Defibrillation, Coarse VF, Fine VF, ACLS, Shockable Rhythms, ecg, Ventricular Fibrillation",
      href: "study.html?item=ecg-vf",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Hyperkalaemia in ECG: Serum Level-Wise ECG Progression & Emergency Protocol",
      Summary: "Serum level-wise ECG changes, peaked tented T waves, QRS widening, Sine-Wave rhythm, and emergency management",
      Tags: "Potassium, Tented T Waves, Sine Wave, Calcium Gluconate, Insulin Dextrose, ecg, Hyperkalaemia ECG",
      href: "study.html?item=ecg-hyperkalemia",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Hypokalaemia in ECG: Serum Level-Wise ECG Progression & Replacement Safety",
      Summary: "Serum level-wise ECG changes, pathognomonic U waves, pseudo-prolonged QU, and replacement safety constraints",
      Tags: "Potassium Deficit, U Wave, QU Interval, Torsades de Pointes, KCl Infusion Limits, Magnesium, ecg, Hypokalaemia ECG",
      href: "study.html?item=ecg-hypokalemia",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ECG",
      Title: "Cardiac Pacemaker Rhythms: NBG Codes, Paced ECG Morphologies & Malfunctions",
      Summary: "NASPE/BPEG (NBG) 5-letter pacemaker nomenclature, surface ECG waveforms (AAI, VVI, DDD, BiV/CRT), lead location vector axes, failure to capture/sense, and perioperative magnet management",
      Tags: "Pacemaker ECG, NBG Code, Pacing Spikes, VVI vs DDD, Failure to Capture, Undersensing, Magnet Response, Sgarbossa in Pacing, ecg, Pacemaker ECG & NBG Nomenclature",
      href: "study.html?item=ecg-pacemaker",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "ABG Interpretation: Systematic 6-Step Method & Reference Ranges",
      Summary: "Systematic 6-step interpretation sequence, normal reference values, Henderson equation, and temperature correction",
      Tags: "6-Step Method, Henderson-Hasselbalch, Normal Values, VBG vs ABG, Alpha-stat vs pH-stat, abg, ABG Interpretation",
      href: "study.html?item=abg-interpretation",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "Metabolic Acidosis: Pathophysiology & Winter's Formula Compensation",
      Summary: "Pathophysiology, respiratory compensation via Winter's formula, clinical consequences, and management",
      Tags: "Winter's Formula, Kussmaul Breathing, Myocardial Depression, Catecholamine Resistance, abg, Metabolic Acidosis",
      href: "study.html?item=abg-metabolic-acidosis",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "Respiratory Acidosis: Acute vs Chronic Renal Compensation Rules",
      Summary: "Acute vs chronic renal compensation, opioid depression, neuromuscular failure, and post-hypercapnic alkalosis",
      Tags: "Hypercapnia, Acute vs Chronic Rules, Post-Hypercapnic Alkalosis, Hypoventilation, abg, Respiratory Acidosis",
      href: "study.html?item=abg-respiratory-acidosis",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "Metabolic Alkalosis: Saline-Responsive vs Saline-Resistant & Urinary Chloride",
      Summary: "Generation vs maintenance, urinary chloride <20 vs >20, hypocalcaemic tetany, and Bohr effect left-shift",
      Tags: "Saline Responsive, Urinary Chloride, Conn's Syndrome, Paradoxical Aciduria, Bohr Effect, abg, Metabolic Alkalosis",
      href: "study.html?item=abg-metabolic-alkalosis",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "Respiratory Alkalosis: Acute vs Chronic Rules & Cerebral Vasoconstriction",
      Summary: "Acute vs chronic compensation, cerebral blood flow reduction, acute hypocalcaemic tetany, and causes",
      Tags: "Hyperventilation, Cerebral Blood Flow, Ionized Calcium, Tetany, Salicylates, abg, Respiratory Alkalosis",
      href: "study.html?item=abg-respiratory-alkalosis",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "HAGMA & Delta Gap: Anion Gap, Albumin Correction & Delta Ratio",
      Summary: "Anion gap calculation, Figge albumin correction formula, delta-delta ratio, and unmasking mixed disorders",
      Tags: "Anion Gap, Albumin Correction, Delta Ratio, Delta Gap, Mixed Disorders, Gamblegram, abg, HAGMA & Delta Gap",
      href: "study.html?item=abg-hagma-delta-gap",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • ABG",
      Title: "HAGMA vs NAGMA Examples: MUDPILES / GOLD MARK vs HARDCARP & UAG",
      Summary: "Etiological mnemonics, toxic alcohols, pyroglutamic acidosis, normal saline acidosis, and urine anion gap",
      Tags: "MUDPILES, GOLD MARK, HARDCARP, Urine Anion Gap, RTA, Hyperchloraemic Acidosis, abg, HAGMA & NAGMA Examples",
      href: "study.html?item=abg-hagma-nagma-examples",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Breathing Systems & Mapleson Circuits (A–F)",
      Summary: "Classification of anaesthetic breathing systems and the six Mapleson (A–F) circuits",
      Tags: "Classification, Non-rebreathing, equipment, Mapleson Circuits",
      href: "study.html?item=breathing-systems-mapleson",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Circle Breathing System & Low-Flow Anaesthesia",
      Summary: "The semi-closed rebreathing circuit that is the standard adult breathing system today",
      Tags: "Semi-closed, CO2 absorption, equipment, Circle System",
      href: "study.html?item=circle-system",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Anaesthesia Ventilators — Classification, Bellows & Modes",
      Summary: "How anaesthesia ventilators are powered, cycled, and the modes available on modern workstations",
      Tags: "Bellows, Ventilation modes, equipment, Ventilator Classification",
      href: "study.html?item=ventilators-classification",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Vaporizers — Physics, Classification, Mechanisms & Clinical Hazards",
      Summary: "Comprehensive classification, core thermodynamics, variable-bypass vs heated dual-circuit mechanisms, commercial models, and safety rules",
      Tags: "Variable-bypass, Desflurane, Classification, Physics, equipment, Vaporizers",
      href: "study.html?item=vaporizers-device",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Airway Devices — Laryngoscopes, Tubes, Supraglottic Airways & Bougies",
      Summary: "The essential hardware of airway management: laryngoscope blades, videolaryngoscopes, tubes, supraglottic airways, and introducers",
      Tags: "Laryngoscopes, SADs, Bougies, Videolaryngoscopy, equipment, Airway Devices",
      href: "study.html?item=airway-devices-equipment",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Laryngeal Mask Airways (LMA) & Supraglottic Airway Devices (SAD)",
      Summary: "Generational classification (1st, 2nd & 3rd gen), i-gel anatomy & size chart, perilaryngeal seals, and difficult airway conduit role",
      Tags: "LMA, i-gel, Supraglottic Airway, ProSeal, Difficult Airway, Classification, equipment, LMA & Supraglottic Airways",
      href: "study.html?item=supraglottic-airways-lma",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Humidification, Filtration & Scavenging Systems",
      Summary: "Conditioning inspired gas and safely removing waste anaesthetic gas from the operating room",
      Tags: "HME, Waste gas, equipment, Humidification & Scavenging",
      href: "study.html?item=humidification-scavenging",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Patient Warming, Fluid Warming & Suction Devices",
      Summary: "Equipment used to prevent perioperative hypothermia and manage airway/surgical suction",
      Tags: "Normothermia, Massive transfusion, equipment, Warming & Suction",
      href: "study.html?item=warming-suction-devices",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Medical Gas Cylinders & Pipeline Supply Systems",
      Summary: "Cylinder metallurgy, Pin Index Safety System, Bodok seal, pipeline supply, Boyle's vs non-liquefied gas physics, and pressure regulators",
      Tags: "Pin Index (PISS), Color Coding, Physics, Manifold, Bodok Seal, equipment, Gas Cylinders & PISS",
      href: "study.html?item=medical-gas-cylinders",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Venturi Principle & Fixed/Variable Oxygen Delivery Devices",
      Summary: "The fluid mechanics of air entrainment, fixed vs variable performance masks, high-flow systems, jet injectors, and clinical COPD titration",
      Tags: "Venturi Mask, Fixed Performance, Bernoulli Principle, Oxygen Therapy, Jet Injector, equipment, Venturi & Oxygen Devices",
      href: "study.html?item=venturi-oxygen-devices",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Infusion Pumps, Syringe Drivers & Target-Controlled Infusion (TCI)",
      Summary: "Syringe driver mechanics, volumetric pumps, Target-Controlled Infusion (Marsh, Schnider, Eleveld, Minto), PCA programming, and critical infusion hazards",
      Tags: "Syringe Driver, TCI, Pharmacokinetics, Smart Pumps, PCA, equipment, Infusion Pumps & TCI",
      href: "study.html?item=infusion-pumps-tci",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Carbon Dioxide Absorbents & Soda Lime Chemistry",
      Summary: "Chemical composition, exothermic neutralization reactions, ethyl violet indicator, rebound phenomenon, mesh sizing, and toxic degradation hazards",
      Tags: "CO2 Absorption, Soda Lime, Compound A, Rebound Phenomenon, Ethyl Violet, equipment, Soda Lime & CO2 Absorbents",
      href: "study.html?item=soda-lime-absorbents",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Central Venous Catheters & Pulmonary Artery Catheters (Swan-Ganz)",
      Summary: "Anatomy of Swan-Ganz catheter, port identification, cardiac navigation waveforms, CVP a-c-v analysis, thermodilution cardiac output, and critical complications",
      Tags: "CVP, Swan-Ganz, Pulmonary Artery Catheter, Thermodilution, Waveforms, Invasive Monitoring, equipment, CVC & Swan-Ganz Catheters",
      href: "study.html?item=central-venous-pulmonary-artery-catheters",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Cardiopulmonary Bypass (CPB) — Circuit, Anticoagulation, Cardioplegia & Separation",
      Summary: "Circuit mechanics, roller vs centrifugal pumps, membrane oxygenators, cardioplegia, ACT monitoring, protamine reversal, and separation protocols",
      Tags: "CPB, Cardiac Surgery, CABG, Heparin, Protamine, ACT, Cardioplegia, equipment, Cardiopulmonary Bypass (CPB)",
      href: "study.html?item=cardiopulmonary-bypass-cpb",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "THRIVE & High-Flow Nasal Oxygen (HFNO) — Apneic Oxygenation & Micro-Ventilation",
      Summary: "Physiology of avenous oxygen uptake, cardiogenic oscillations, PEEP generation, safe apnea time extension, and shared-airway ENT surgery",
      Tags: "THRIVE, HFNO, Apneic Oxygenation, Difficult Airway, Optiflow, Tubeless ENT, equipment, THRIVE & HFNO",
      href: "study.html?item=thrive-hfno-apneic-oxygenation",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Jet Ventilation — High-Frequency Jet Ventilation (HFJV) & Emergency Transtracheal Jet Ventilation (TTJV)",
      Summary: "Venturi entrainment physics, high-frequency non-convective gas transport, elective microlaryngeal jetting, emergency cricothyroidotomy rescue, and catastrophic barotrauma hazards",
      Tags: "Jet Ventilation, HFJV, TTJV, CICO, Venturi Principle, Barotrauma, equipment, Jet Ventilation & HFJV",
      href: "study.html?item=jet-ventilation-hfjv-emergency",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Extracorporeal Membrane Oxygenation (ECMO) — Circuit, Cannulation, Physiology & Hazards",
      Summary: "Demystifying the ECMO circuit: VV vs VA classification, step-by-step circuit mechanics, pressure monitoring, sweep gas titration, and life-threatening clinical traps",
      Tags: "ECMO, VV-ECMO, VA-ECMO, Membrane Oxygenator, Harlequin Syndrome, Centrifugal Pump, Anticoagulation, equipment, ECMO Circuit & Physiology",
      href: "study.html?item=ecmo-extracorporeal-membrane-oxygenation",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Haemodialysis & Continuous Renal Replacement Therapy (CRRT) — Circuit, Clearance & Anticoagulation",
      Summary: "The artificial nephron in simple language: IHD vs CRRT modalities, step-by-step circuit mechanics, diffusion vs convection, regional citrate anticoagulation, and critical safety hazards",
      Tags: "Haemodialysis, CRRT, Dialyzer, Ultrafiltration, Citrate Anticoagulation, Dialysis Disequilibrium, equipment, Haemodialysis & CRRT Circuit",
      href: "study.html?item=haemodialysis-crrt-dialysis-circuit",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Peripheral Nerve Stimulators & Quantitative Neuromuscular Monitoring (TOF, PTC, DBS)",
      Summary: "Principles of electrical stimulation, electrode polarity rules, TOF/PTC/DBS/tetanic waveforms, reversal titration with Sugammadex vs Neostigmine, and nerve block localization",
      Tags: "Nerve Stimulator, TOF, PTC, Double Burst, Sugammadex, Neostigmine, Regional Nerve Block, Residual Curarization, equipment, Nerve Stimulators & TOF/PTC",
      href: "study.html?item=nerve-stimulator-neuromuscular-monitoring",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • EQUIPMENT",
      Title: "Ambu Bag — Bag-Valve-Mask (BVM) Resuscitator: Parts, Function & Pre-use Check",
      Summary: "Self-inflating manual resuscitator — components, pre-use check, one-person vs two-person technique, and anaesthetic implications",
      Tags: "BVM, Ambu Bag, Resuscitation, Airway Equipment, OSCE, Pre-use Check, Self-inflating, equipment, Ambu Bag / BVM",
      href: "study.html?item=ambu-bag-bvm",
    },
,
    {
      Type: "Study Topic",
      Category: "Study Mode • PFT",
      Title: "How to Read a Pulmonary Function Test (PFT)",
      Summary: "A systematic 5-step ATS/ERS protocol to interpret spirometry, bronchodilator reversibility, lung volumes, and diffusing capacity",
      Tags: "PFT, Spirometry, ATS/ERS, FEV1, FVC, DLCO, TLC, Reversibility, LLN, pft",
      href: "study.html?item=pft-how-to-read",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • PFT",
      Title: "Obstructive Lung Diseases (COPD, Asthma & Bronchiectasis)",
      Summary: "Airflow obstruction mechanics, GOLD staging, Equal Pressure Point, auto-PEEP / intrinsic PEEP, and intraoperative ventilation strategies",
      Tags: "COPD, Asthma, GOLD, Obstructive, Air Trapping, Auto-PEEP, Bronchospasm, Permissive Hypercapnia, pft",
      href: "study.html?item=pft-obstructive",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • PFT",
      Title: "Restrictive Lung Diseases & Diffusing Capacity (DLCO)",
      Summary: "Diagnostic algorithm for reduced TLC, distinguishing intrinsic from extrinsic restriction, DLCO/KCO partitioning, and perioperative management",
      Tags: "Restrictive, TLC, DLCO, KCO, ILD, Fibrosis, Kyphoscoliosis, Myasthenia, MIP/MEP, pft",
      href: "study.html?item=pft-restrictive",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • PFT",
      Title: "Flow-Volume Loops & Airway Lesions",
      Summary: "Morphological analysis of flow-volume loops: obstructive scooping, restrictive witch's hat, and fixed vs variable upper airway obstruction",
      Tags: "Flow-Volume Loop, Upper Airway Obstruction, Tracheal Stenosis, Vocal Cord Paralysis, FEF50/FIF50, Stridor, Awake Fiberoptic, pft",
      href: "study.html?item=pft-flow-volume-loops",
    },
    {
      Type: "Study Topic",
      Category: "Study Mode • PFT",
      Title: "Post-Operative Predicted FEV1 & DLCO (ppoFEV1 & ppoDLCO)",
      Summary: "Preoperative evaluation for lung resection: 19-segment anatomical counting, perfusion scintigraphy, CPET, and perioperative mortality ladders",
      Tags: "ppoFEV1, ppoDLCO, Thoracic, Lobectomy, Pneumonectomy, Segment Counting, ACCP, ESTS, OLV, pft",
      href: "study.html?item=pft-postop-fev1-dlco",
    },

    // --- STUDY MODE: DRUG MONOGRAPHS (study.html - 84 DRUGS) ---
{
      Type: "Study Drug",
      Category: "Study Mode • Alkylphenol (2,6-diisopropylphenol) • GABA-A receptor agonist",
      Title: "Propofol (Diprivan)",
      Summary: "The default IV induction agent almost everywhere — fast on, fast off, and pleasant to wake up from",
      Tags: "GABA-A agonist, TIVA, Alkylphenol (2,6-diisopropylphenol) • GABA-A receptor agonist, Diprivan",
      href: "study.html?item=propofol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Carboxylated imidazole ester • Positive allosteric GABA-A modulator",
      Title: "Etomidate (Amidate)",
      Summary: "The induction agent you reach for when the heart can't afford much of a hit",
      Tags: "Cardiac-stable induction, Adrenal suppression, Carboxylated imidazole ester • Positive allosteric GABA-A modulator, Amidate",
      href: "study.html?item=etomidate",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Arylcycloalkylamine (phencyclidine congener) • Non-competitive NMDA receptor antagonist",
      Title: "Ketamine (Ketalar)",
      Summary: "The odd one out — it provides its own analgesia, keeps the patient breathing, and raises the blood pressure instead of dropping it",
      Tags: "NMDA antagonist, Dissociative anaesthesia, Arylcycloalkylamine (phencyclidine congener) • Non-competitive NMDA receptor antagonist, Ketalar",
      href: "study.html?item=ketamine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Thiobarbiturate (sulfur-substituted barbituric acid) • GABA-A channel potentiator",
      Title: "Thiopental (Sodium Thiopental) (Pentothal)",
      Summary: "The original rapid-acting induction agent — historically important, no longer available in the US",
      Tags: "Barbiturate, Historic agent, Thiobarbiturate (sulfur-substituted barbituric acid) • GABA-A channel potentiator, Pentothal",
      href: "study.html?item=thiopental",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Water-soluble imidazobenzodiazepine • GABA-A positive allosteric modulator",
      Title: "Midazolam (Versed)",
      Summary: "The benzodiazepine anaesthetists actually use — for calming nerves before a case, not usually for the induction itself",
      Tags: "Benzodiazepine, GABA-A modulator, Water-soluble imidazobenzodiazepine • GABA-A positive allosteric modulator, Versed",
      href: "study.html?item=midazolam",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Ester-hydrolysed soft-drug benzodiazepine • Tissue carboxylesterase-cleared GABA-A modulator",
      Title: "Remimazolam (Byfavo)",
      Summary: "A benzodiazepine engineered to be broken down almost instantly — sedation you can turn off nearly as fast as you turned it on",
      Tags: "Benzodiazepine, Ultra-short-acting, Ester-metabolised, Ester-hydrolysed soft-drug benzodiazepine • Tissue carboxylesterase-cleared GABA-A modulator, Byfavo",
      href: "study.html?item=remimazolam",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Chiral cyclopropyl alkylphenol • High-potency GABA-A receptor agonist",
      Title: "Cipepofol (Ciprofol) (Cypsedo)",
      Summary: "The newest FDA-approved general anaesthesia induction agent — a fluorinated propofol relative that works at a fraction of the dose",
      Tags: "GABA-A agonist, Newest FDA approval, Chiral cyclopropyl alkylphenol • High-potency GABA-A receptor agonist, Cypsedo",
      href: "study.html?item=cipepofol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Depolarising neuromuscular blocker • Bis-quaternary acetylcholine dimer (ultra-short-acting)",
      Title: "Succinylcholine (Suxamethonium) (Anectine)",
      Summary: "Still the fastest paralytic in the drawer — and the only depolarising one, which explains both its speed and its risks",
      Tags: "Depolarising NMBA, Fastest onset, Depolarising neuromuscular blocker • Bis-quaternary acetylcholine dimer (ultra-short-acting), Anectine",
      href: "study.html?item=succinylcholine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Monoquaternary aminosteroid (intermediate-acting)",
      Title: "Rocuronium (Zemuron)",
      Summary: "The non-depolarising relaxant fast enough to substitute for succinylcholine at RSI — and the one sugammadex was built for",
      Tags: "Non-depolarising NMBA, Aminosteroid, Non-depolarising neuromuscular blocker • Monoquaternary aminosteroid (intermediate-acting), Zemuron",
      href: "study.html?item=rocuronium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Monoquaternary aminosteroid (intermediate-acting)",
      Title: "Vecuronium (Norcuron)",
      Summary: "Rocuronium's quieter older sibling — same steroid family, gentler on the heart, a bit slower",
      Tags: "Non-depolarising NMBA, Aminosteroid, Non-depolarising neuromuscular blocker • Monoquaternary aminosteroid (intermediate-acting), Norcuron",
      href: "study.html?item=vecuronium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Bis-quaternary benzylisoquinolinium (intermediate-acting, Hofmann elimination)",
      Title: "Atracurium (Tracrium)",
      Summary: "The relaxant that breaks itself down chemically, independent of liver or kidney function — at the cost of some histamine release",
      Tags: "Non-depolarising NMBA, Hofmann elimination, Non-depolarising neuromuscular blocker • Bis-quaternary benzylisoquinolinium (intermediate-acting, Hofmann elimination), Tracrium",
      href: "study.html?item=atracurium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Purified 1R-cis,1'R-cis benzylisoquinolinium (intermediate-acting, Hofmann elimination)",
      Title: "Cisatracurium (Nimbex)",
      Summary: "Atracurium's cleaner isomer — same organ-independent breakdown, almost none of the histamine release",
      Tags: "Non-depolarising NMBA, Hofmann elimination, Non-depolarising neuromuscular blocker • Purified 1R-cis,1'R-cis benzylisoquinolinium (intermediate-acting, Hofmann elimination), Nimbex",
      href: "study.html?item=cisatracurium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Bis-quaternary aminosteroid (long-acting, vagolytic)",
      Title: "Pancuronium (Pavulon)",
      Summary: "The long-acting relaxant that speeds the heart up instead of leaving it alone — occasionally exactly what you want",
      Tags: "Non-depolarising NMBA, Long-acting, Non-depolarising neuromuscular blocker • Bis-quaternary aminosteroid (long-acting, vagolytic), Pavulon",
      href: "study.html?item=pancuronium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Benzylisoquinolinium diester (short-acting, plasma cholinesterase cleared)",
      Title: "Mivacurium (Mivacron)",
      Summary: "The shortest-acting non-depolariser ever marketed — cleared by the same enzyme as succinylcholine, and just as vulnerable to its deficiency",
      Tags: "Non-depolarising NMBA, Short-acting, Non-depolarising neuromuscular blocker • Benzylisoquinolinium diester (short-acting, plasma cholinesterase cleared), Mivacron",
      href: "study.html?item=mivacurium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-depolarising neuromuscular blocker • Asymmetric chlorofumarate (investigational ultra-short, L-cysteine reversible)",
      Title: "Gantacurium (Investigational — no marketed brand)",
      Summary: "An experimental relaxant designed to be reversed in seconds by a simple IV amino acid — never actually reached the market",
      Tags: "Investigational, Not FDA-approved, Fumarate ultra-short-acting, Non-depolarising neuromuscular blocker • Asymmetric chlorofumarate (investigational ultra-short, L-cysteine reversible), Investigational — no marketed brand",
      href: "study.html?item=gantacurium",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Modified gamma-cyclodextrin • Selective relaxant binding agent (SRBA)",
      Title: "Sugammadex (Bridion)",
      Summary: "It doesn't inhibit an enzyme like neostigmine does — it physically grabs the relaxant molecule and pulls it out of the picture",
      Tags: "Selective relaxant binding agent, Encapsulation, Modified gamma-cyclodextrin • Selective relaxant binding agent (SRBA), Bridion",
      href: "study.html?item=sugammadex",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Quaternary ammonium carbamate • Reversible acetylcholinesterase inhibitor",
      Title: "Neostigmine (Prostigmin)",
      Summary: "The older reversal strategy — flood the neuromuscular junction with acetylcholine and let it out-compete the relaxant",
      Tags: "Anticholinesterase, Reversal agent, Quaternary ammonium carbamate • Reversible acetylcholinesterase inhibitor, Prostigmin",
      href: "study.html?item=neostigmine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Synthetic 4-anilidopiperidine (phenylpiperidine family)",
      Title: "Fentanyl (Sublimaze)",
      Summary: "The workhorse perioperative opioid — fast on, gentle on the heart, but sneaky with repeated dosing",
      Tags: "Mu agonist, Synthetic opioid, Full mu-opioid agonist • Synthetic 4-anilidopiperidine (phenylpiperidine family), Sublimaze",
      href: "study.html?item=fentanyl",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Natural phenanthrene alkaloid (morphinan skeleton)",
      Title: "Morphine (Duramorph / Astramorph)",
      Summary: "The original opioid everything else gets compared to — slower, longer-lasting, and genuinely different in renal failure",
      Tags: "Mu agonist, Phenanthrene opioid, Full mu-opioid agonist • Natural phenanthrene alkaloid (morphinan skeleton), Duramorph / Astramorph",
      href: "study.html?item=morphine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Semi-synthetic hydrogenated phenanthrene (morphinan skeleton)",
      Title: "Hydromorphone (Dilaudid)",
      Summary: "Morphine's more potent cousin — often chosen specifically because it lacks morphine's problematic active metabolite",
      Tags: "Mu agonist, Semi-synthetic opioid, Full mu-opioid agonist • Semi-synthetic hydrogenated phenanthrene (morphinan skeleton), Dilaudid",
      href: "study.html?item=hydromorphone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Esterase-metabolised synthetic phenylpiperidine (ultra-short-acting)",
      Title: "Remifentanil (Ultiva)",
      Summary: "An opioid that vanishes within minutes of stopping the infusion — because your own blood and tissue break it down, not your liver",
      Tags: "Mu agonist, Ester-metabolised, Full mu-opioid agonist • Esterase-metabolised synthetic phenylpiperidine (ultra-short-acting), Ultiva",
      href: "study.html?item=remifentanil",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Thienyl-substituted synthetic phenylpiperidine (high potency)",
      Title: "Sufentanil (Sufenta)",
      Summary: "One of the most potent opioids in clinical use — small volumes, small margin for dosing error",
      Tags: "Mu agonist, High-potency synthetic opioid, Full mu-opioid agonist • Thienyl-substituted synthetic phenylpiperidine (high potency), Sufenta",
      href: "study.html?item=sufentanil",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Tetrazole-substituted phenylpiperidine (ultra-rapid onset, low pKa)",
      Title: "Alfentanil (Alfenta)",
      Summary: "The fentanyl-family opioid with the fastest peak effect — useful for very short, very painful moments",
      Tags: "Mu agonist, Rapid-onset synthetic opioid, Full mu-opioid agonist • Tetrazole-substituted phenylpiperidine (ultra-rapid onset, low pKa), Alfenta",
      href: "study.html?item=alfentanil",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Full mu-opioid agonist • Synthetic phenylpiperidine (anticholinergic, active normeperidine metabolite)",
      Title: "Pethidine (Meperidine) (Demerol)",
      Summary: "The opioid nobody starts on anymore — kept alive mainly for treating shivering, avoided for everything else",
      Tags: "Mu agonist, Phenylpiperidine opioid, Toxic active metabolite, Full mu-opioid agonist • Synthetic phenylpiperidine (anticholinergic, active normeperidine metabolite), Demerol",
      href: "study.html?item=pethidine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Atypical / Weak mu-opioid agonist • Dual-mechanism synthetic cyclohexanol (central SNRI / monoamine uptake inhibitor)",
      Title: "Tramadol (Ultram)",
      Summary: "A weak opioid with a second, independent mechanism bolted on — which is exactly what makes it awkward with antidepressants",
      Tags: "Weak mu agonist, SNRI activity, Dual mechanism, Atypical / Weak mu-opioid agonist • Dual-mechanism synthetic cyclohexanol (central SNRI / monoamine uptake inhibitor), Ultram",
      href: "study.html?item=tramadol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Partial mu-opioid agonist / Kappa antagonist • Semi-synthetic thebaine-derived oripavine (ceiling effect on respiratory depression)",
      Title: "Buprenorphine (Buprenex (injectable) / Suboxone, Subutex (sublingual) / Butrans (patch) / Belbuca (buccal))",
      Summary: "So tightly bound to the mu receptor that it's hard to displace either way — a genuine ceiling on overdose risk, and a genuine headache if you need to reverse it",
      Tags: "Partial mu agonist, Kappa antagonist, High receptor affinity, Partial mu-opioid agonist / Kappa antagonist • Semi-synthetic thebaine-derived oripavine (ceiling effect on respiratory depression), Buprenex (injectable) / Suboxone, Subutex (sublingual) / Butrans (patch) / Belbuca (buccal)",
      href: "study.html?item=buprenorphine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Mixed kappa agonist / Mu partial antagonist • Semi-synthetic 14-hydroxymorphinan",
      Title: "Nalbuphine (Nubain)",
      Summary: "A kappa agonist/mu antagonist combination best known for treating the itch that morphine and fentanyl cause, not for treating pain",
      Tags: "Kappa agonist, Mu antagonist, Agonist-antagonist, Mixed kappa agonist / Mu partial antagonist • Semi-synthetic 14-hydroxymorphinan, Nubain",
      href: "study.html?item=nalbuphine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Mixed kappa agonist / Weak mu antagonist • Synthetic benzomorphan",
      Title: "Pentazocine (Talwin (also Talwin NX, combined with naloxone))",
      Summary: "One of the first agonist-antagonist opioids — largely retired now, remembered for causing dysphoria rather than euphoria",
      Tags: "Kappa agonist, Mu partial agonist/antagonist, Benzomorphan, Mixed kappa agonist / Weak mu antagonist • Synthetic benzomorphan, Talwin (also Talwin NX, combined with naloxone)",
      href: "study.html?item=pentazocine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Pure competitive opioid receptor antagonist • N-allyl substituted morphinan (mu, kappa, and delta blocker)",
      Title: "Naloxone (Narcan)",
      Summary: "The opioid antidote — pure antagonism, fast onset, and a duration deliberately shorter than most of the drugs it's reversing",
      Tags: "Pure opioid antagonist, Reversal agent, Pure competitive opioid receptor antagonist • N-allyl substituted morphinan (mu, kappa, and delta blocker), Narcan",
      href: "study.html?item=naloxone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Pure competitive opioid receptor antagonist • Cyclopropylmethyl substituted morphinan (long-acting orally bioavailable blocker)",
      Title: "Naltrexone (ReVia (oral) / Vivitrol (monthly IM depot))",
      Summary: "Naloxone's longer-acting, orally active cousin — built for sustained blockade, not emergency reversal",
      Tags: "Pure opioid antagonist, Oral/depot formulation, Pure competitive opioid receptor antagonist • Cyclopropylmethyl substituted morphinan (long-acting orally bioavailable blocker), ReVia (oral) / Vivitrol (monthly IM depot)",
      href: "study.html?item=naltrexone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-selective NSAID • Pyrrolo-pyrrole / Acetic acid derivative (potent COX-1 > COX-2 inhibitor)",
      Title: "Ketorolac (Toradol)",
      Summary: "An NSAID potent enough to substitute for opioids in acute pain — with a strict 5-day clock attached",
      Tags: "NSAID, COX-1/COX-2 inhibitor, Non-selective NSAID • Pyrrolo-pyrrole / Acetic acid derivative (potent COX-1 > COX-2 inhibitor), Toradol",
      href: "study.html?item=ketorolac",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-selective NSAID • Propionic acid derivative (reversible COX-1 and COX-2 inhibitor)",
      Title: "Ibuprofen (Motrin / Advil (IV: Caldolor))",
      Summary: "The familiar over-the-counter NSAID, now also available IV as a genuine multimodal analgesia component",
      Tags: "NSAID, Propionic acid derivative, Non-selective NSAID • Propionic acid derivative (reversible COX-1 and COX-2 inhibitor), Motrin / Advil (IV: Caldolor)",
      href: "study.html?item=ibuprofen",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-selective NSAID • Phenylacetic acid derivative (balanced COX-1 / COX-2 inhibitor)",
      Title: "Diclofenac (Voltaren)",
      Summary: "An NSAID available in almost every route imaginable — oral, topical, ophthalmic, and IV",
      Tags: "NSAID, Phenylacetic acid derivative, Non-selective NSAID • Phenylacetic acid derivative (balanced COX-1 / COX-2 inhibitor), Voltaren",
      href: "study.html?item=diclofenac",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Selective COX-2 inhibitor • Diaryl-substituted pyrazole (platelet-sparing coxib)",
      Title: "Celecoxib (Celebrex)",
      Summary: "The NSAID that spares platelets — genuinely useful when bleeding risk is the deciding factor",
      Tags: "NSAID, Selective COX-2 inhibitor, Selective COX-2 inhibitor • Diaryl-substituted pyrazole (platelet-sparing coxib), Celebrex",
      href: "study.html?item=celecoxib",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Para-aminophenol derivative • Central COX-3 / peroxidase inhibitor & indirect TRPA1 modulator",
      Title: "Paracetamol (Acetaminophen) (Tylenol / Ofirmev (IV))",
      Summary: "Not an NSAID at all — the one analgesic on this list with essentially no bleeding, GI or renal downside",
      Tags: "Analgesic/antipyretic, COX inhibition (central), Para-aminophenol derivative • Central COX-3 / peroxidase inhibitor & indirect TRPA1 modulator, Tylenol / Ofirmev (IV)",
      href: "study.html?item=paracetamol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct sympathomimetic • Pure selective alpha-1 adrenergic agonist",
      Title: "Phenylephrine (Neo-Synephrine (IV: Vazculep))",
      Summary: "A pure vasoconstrictor with no direct effect on the heart — which is exactly why it's the obstetric anaesthetist's default pressor",
      Tags: "Alpha-1 agonist, Vasopressor, Direct sympathomimetic • Pure selective alpha-1 adrenergic agonist, Neo-Synephrine (IV: Vazculep)",
      href: "study.html?item=phenylephrine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct sympathomimetic • Potent alpha-1 and beta-1 adrenergic agonist",
      Title: "Norepinephrine (Noradrenaline) (Levophed)",
      Summary: "The default first-line vasopressor in septic and most distributive shock — raises pressure without much collateral tachycardia",
      Tags: "Alpha/beta agonist, Catecholamine, Direct sympathomimetic • Potent alpha-1 and beta-1 adrenergic agonist, Levophed",
      href: "study.html?item=norepinephrine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct sympathomimetic • Non-selective alpha and beta adrenergic agonist",
      Title: "Epinephrine (Adrenaline) (Adrenalin)",
      Summary: "The one drug that works at every dose and every route — anaphylaxis, cardiac arrest, and everything unstable in between",
      Tags: "Alpha/beta agonist, Catecholamine, Direct sympathomimetic • Non-selective alpha and beta adrenergic agonist, Adrenalin",
      href: "study.html?item=epinephrine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Non-adrenergic peptide hormone • Vascular V1a and renal V2 receptor agonist",
      Title: "Vasopressin (Arginine Vasopressin) (Vasostrict)",
      Summary: "A non-catecholamine pressor for the shock that's stopped responding to catecholamines",
      Tags: "V1 receptor agonist, Non-catecholamine, Non-adrenergic peptide hormone • Vascular V1a and renal V2 receptor agonist, Vasostrict",
      href: "study.html?item=vasopressin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct & indirect sympathomimetic • Dose-dependent D1/D2, beta-1, and alpha-1 agonist",
      Title: "Dopamine (Intropin)",
      Summary: "Once the textbook first-line pressor, now mostly second-line — the dose-dependent receptor story is famous, and famously oversimplified",
      Tags: "Dopaminergic/alpha/beta agonist, Catecholamine, Direct & indirect sympathomimetic • Dose-dependent D1/D2, beta-1, and alpha-1 agonist, Intropin",
      href: "study.html?item=dopamine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct sympathomimetic • Selective beta-1 adrenergic inotrope (inodilator)",
      Title: "Dobutamine (Dobutrex)",
      Summary: "An inotrope, not a vasopressor — it boosts the heart's output without meaningfully raising blood pressure",
      Tags: "Beta-1 agonist, Inotrope, Direct sympathomimetic • Selective beta-1 adrenergic inotrope (inodilator), Dobutrex",
      href: "study.html?item=dobutamine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Aminoamide • Intermediate-acting local anaesthetic (fast onset, hepatic CYP1A2/3A4)",
      Title: "Lidocaine (Xylocaine)",
      Summary: "The prototype amide local anaesthetic — the one every other local gets compared to, and a drug in its own right IV",
      Tags: "Amide LA, Class Ib antiarrhythmic, Aminoamide • Intermediate-acting local anaesthetic (fast onset, hepatic CYP1A2/3A4), Xylocaine",
      href: "study.html?item=lidocaine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Aminoamide • Long-acting local anaesthetic (high protein binding, cardiotoxicity risk)",
      Title: "Bupivacaine (Marcaine / Sensorcaine (liposomal: Exparel))",
      Summary: "Long-acting and high-potency — and the local anaesthetic most likely to stop a heart if it gets into a vein by accident",
      Tags: "Amide LA, Long-acting, Aminoamide • Long-acting local anaesthetic (high protein binding, cardiotoxicity risk), Marcaine / Sensorcaine (liposomal: Exparel)",
      href: "study.html?item=bupivacaine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Aminoamide • Long-acting local anaesthetic (pure S-enantiomer, differential sensory block)",
      Title: "Ropivacaine (Naropin)",
      Summary: "Built as a deliberately safer bupivacaine — a single enantiomer with a genuinely wider cardiac safety margin",
      Tags: "Amide LA, Long-acting, Single enantiomer, Aminoamide • Long-acting local anaesthetic (pure S-enantiomer, differential sensory block), Naropin",
      href: "study.html?item=ropivacaine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Aminoester • Ultra-short-acting local anaesthetic (rapid plasma pseudocholinesterase clearance)",
      Title: "Chloroprocaine (Nesacaine)",
      Summary: "The fastest-clearing local anaesthetic in clinical use — metabolised in the blood itself, not the liver",
      Tags: "Ester LA, Rapid onset/offset, Aminoester • Ultra-short-acting local anaesthetic (rapid plasma pseudocholinesterase clearance), Nesacaine",
      href: "study.html?item=chloroprocaine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Aminoamide • Intermediate-acting local anaesthetic (minimal intrinsic vasodilation)",
      Title: "Mepivacaine (Polocaine / Carbocaine)",
      Summary: "Similar to lidocaine but with less vasodilation — a plain solution that still lasts a useful while without epinephrine",
      Tags: "Amide LA, Intermediate duration, Aminoamide • Intermediate-acting local anaesthetic (minimal intrinsic vasodilation), Polocaine / Carbocaine",
      href: "study.html?item=mepivacaine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Synthetic nonapeptide uterotonic • Gq-coupled oxytocin receptor agonist",
      Title: "Oxytocin (Pitocin / Syntocinon)",
      Summary: "First-line uterotonic for labour induction and PPH prophylaxis — rapid onset with dose-dependent vasodilation",
      Tags: "Uterotonic, First-line PPH, Nonapeptide, Synthetic nonapeptide uterotonic • Gq-coupled oxytocin receptor agonist, Pitocin / Syntocinon",
      href: "study.html?item=oxytocin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Synthetic 1-deamino-1-carba oxytocin analogue • Long-acting oxytocin receptor agonist",
      Title: "Carbetocin (Pabal / Duratocin)",
      Summary: "Long-acting synthetic oxytocin analogue — single-dose PPH prophylaxis with prolonged uterotonic action",
      Tags: "Uterotonic, Long-acting, PPH prophylaxis, Synthetic 1-deamino-1-carba oxytocin analogue • Long-acting oxytocin receptor agonist, Pabal / Duratocin",
      href: "study.html?item=carbetocin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Synthetic 15-methyl prostaglandin F2α analogue • Myometrial FP prostanoid receptor agonist",
      Title: "Carboprost (15-Methyl PGF2α) (Hemabate)",
      Summary: "Potent second-line prostaglandin uterotonic — essential rescue for refractory PPH, strictly contraindicated in asthma",
      Tags: "Uterotonic, Second-line PPH, Prostaglandin, Synthetic 15-methyl prostaglandin F2α analogue • Myometrial FP prostanoid receptor agonist, Hemabate",
      href: "study.html?item=carboprost",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Semi-synthetic ergot alkaloid derivative • Alpha-1 adrenergic and 5-HT2 receptor agonist",
      Title: "Methergine (Methylergometrine / Methylergonovine) (Methergine)",
      Summary: "Ergot alkaloid producing sustained tetanic uterine tone — strictly contraindicated in hypertension and pre-eclampsia",
      Tags: "Uterotonic, Ergot alkaloid, Second-line PPH, Semi-synthetic ergot alkaloid derivative • Alpha-1 adrenergic and 5-HT2 receptor agonist, Methergine",
      href: "study.html?item=methergine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Synthetic methyl ester prostaglandin E1 analogue • Myometrial EP2/EP3 receptor agonist",
      Title: "Misoprostol (Cytotec)",
      Summary: "Synthetic prostaglandin E1 analogue — temperature-stable uterotonic with versatile oral, sublingual, and rectal routes",
      Tags: "Uterotonic, Prostaglandin E1, PPH & Induction, Synthetic methyl ester prostaglandin E1 analogue • Myometrial EP2/EP3 receptor agonist, Cytotec",
      href: "study.html?item=misoprostol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Angiotensin-Converting Enzyme (ACE) Inhibitor Prodrug",
      Title: "Ramipril (Altace)",
      Summary: "First-line antihypertensive and cardioprotective ACE inhibitor — carries high risk of refractory post-induction vasoplegia",
      Tags: "ACE Inhibitor, Vasoplegia, Renal protective, Angiotensin-Converting Enzyme (ACE) Inhibitor Prodrug, Altace",
      href: "study.html?item=ramipril",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Angiotensin II Receptor Blocker (ARB) • Selective AT1 Antagonist",
      Title: "Losartan (Cozaar)",
      Summary: "Selective AT1 receptor antagonist — blunts RAAS tone without bradykinin accumulation; causes refractory post-induction vasoplegia",
      Tags: "ARB, AT1 blocker, Vasoplegia, Renal protective, Angiotensin II Receptor Blocker (ARB) • Selective AT1 Antagonist, Cozaar",
      href: "study.html?item=losartan",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Dihydropyridine Calcium Channel Blocker (CCB) • L-type Channel Antagonist",
      Title: "Amlodipine (Norvasc)",
      Summary: "Long-acting dihydropyridine calcium channel blocker — potent arteriolar vasodilator with ultra-long 30–50 hr elimination half-life",
      Tags: "CCB, Dihydropyridine, Vasodilator, Long half-life, Dihydropyridine Calcium Channel Blocker (CCB) • L-type Channel Antagonist, Norvasc",
      href: "study.html?item=amlodipine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Benzothiazepine Non-Dihydropyridine Calcium Channel Blocker",
      Title: "Diltiazem (Cardizem)",
      Summary: "Non-dihydropyridine calcium antagonist — slows AV nodal conduction and reduces ventricular rate in AF/flutter and SVT",
      Tags: "CCB, Non-dihydropyridine, Antiarrhythmic Class IV, Rate control, Benzothiazepine Non-Dihydropyridine Calcium Channel Blocker, Cardizem",
      href: "study.html?item=diltiazem",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Cardioselective Beta-1 Adrenergic Receptor Antagonist",
      Title: "Metoprolol (Lopressor / Toprol-XL)",
      Summary: "Selective beta-1 antagonist — blunts perioperative tachycardia and myocardial ischemia; continue chronic therapy on morning of surgery",
      Tags: "Beta-blocker, Beta-1 selective, Rate control, POISE trial, Cardioselective Beta-1 Adrenergic Receptor Antagonist, Lopressor / Toprol-XL",
      href: "study.html?item=metoprolol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Ultra-Short-Acting Cardioselective Beta-1 Adrenergic Antagonist",
      Title: "Esmolol (Brevibloc)",
      Summary: "Ultra-short-acting IV beta-1 blocker with 9-minute half-life — the premier intraoperative titratable agent for acute tachycardia",
      Tags: "Beta-blocker, Ultra-short acting, RBC esterase, Intraoperative titration, Ultra-Short-Acting Cardioselective Beta-1 Adrenergic Antagonist, Brevibloc",
      href: "study.html?item=esmolol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct-Acting Peripheral Arteriolar Smooth Muscle Vasodilator",
      Title: "Hydralazine (Apresoline)",
      Summary: "Direct arteriolar vasodilator — classic choice for obstetric hypertension; carries a delayed 10–20 min onset and reflex tachycardia",
      Tags: "Vasodilator, Arteriolar selective, Pre-eclampsia, Obstetric safety, Direct-Acting Peripheral Arteriolar Smooth Muscle Vasodilator, Apresoline",
      href: "study.html?item=hydralazine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Direct-Acting Mixed Arterial and Venous Vasodilator • Exogenous Nitric Oxide Donor",
      Title: "Sodium Nitroprusside (SNP) (Nipride / Nitropress)",
      Summary: "Instantaneous, balanced arterial and venous vasodilator — premier agent for hypertensive crises; requires vigilance for cyanide toxicity",
      Tags: "Vasodilator, Nitric Oxide donor, Cyanide toxicity, Arterial line mandatory, Direct-Acting Mixed Arterial and Venous Vasodilator • Exogenous Nitric Oxide Donor, Nipride / Nitropress",
      href: "study.html?item=sodium-nitroprusside",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Combined Competitive Alpha-1 and Non-Selective Beta-1/Beta-2 Adrenoceptor Antagonist",
      Title: "Labetalol (Trandate / Normodyne)",
      Summary: "Combined α1- and non-selective β-blocker — first-line agent for acute severe hypertension in pregnancy and aortic dissection",
      Tags: "Alpha-beta blocker, Pre-eclampsia, Aortic dissection, Hypertensive crisis, Combined Competitive Alpha-1 and Non-Selective Beta-1/Beta-2 Adrenoceptor Antagonist, Trandate / Normodyne",
      href: "study.html?item=labetalol",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Centrally Acting Alpha-2 Adrenergic Receptor Agonist",
      Title: "Clonidine (Catapres)",
      Summary: "Centrally acting alpha-2 agonist — reduces volatile MAC by 25–40%, blunts intubation surges, and prolongs regional nerve blocks",
      Tags: "Alpha-2 agonist, Sympatholytic, MAC reduction, Rebound hypertension, Centrally Acting Alpha-2 Adrenergic Receptor Agonist, Catapres",
      href: "study.html?item=clonidine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Highly Selective Alpha-2 Adrenergic Receptor Agonist • Non-Opioid Sedative/Analgesic",
      Title: "Dexmedetomidine (Precedex)",
      Summary: "Highly selective alpha-2 agonist (1620:1) — provides 'arousable sedation' mimicking natural sleep with ZERO respiratory depression",
      Tags: "Alpha-2 agonist, Arousable sedation, Zero respiratory depression, Awake intubation, Highly Selective Alpha-2 Adrenergic Receptor Agonist • Non-Opioid Sedative/Analgesic, Precedex",
      href: "study.html?item=dexmedetomidine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Long-Acting Synthetic Fluorinated Glucocorticoid",
      Title: "Dexamethasone (Decadron)",
      Summary: "Ultra-potent synthetic glucocorticoid with zero mineralocorticoid effect — the cornerstone antiemetic and anti-inflammatory agent",
      Tags: "Glucocorticoid, PONV prophylaxis, Airway edema, Zero mineralocorticoid, Long-Acting Synthetic Fluorinated Glucocorticoid, Decadron",
      href: "study.html?item=dexamethasone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Short-Acting Natural Glucocorticoid with Equal Mineralocorticoid Activity",
      Title: "Hydrocortisone (Solu-Cortef)",
      Summary: "The gold standard for perioperative 'stress-dose' steroid coverage and acute Addisonian crisis resuscitation",
      Tags: "Glucocorticoid, Mineralocorticoid, Stress dose, Adrenal crisis, Short-Acting Natural Glucocorticoid with Equal Mineralocorticoid Activity, Solu-Cortef",
      href: "study.html?item=hydrocortisone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Intermediate-Acting Synthetic Glucocorticoid",
      Title: "Methylprednisolone (Solu-Medrol)",
      Summary: "Synthetic glucocorticoid with 5x hydrocortisone potency and minimal salt retention — premier agent for bronchospasm and anaphylaxis",
      Tags: "Glucocorticoid, Bronchospasm, Anaphylaxis adjunct, Intermediate-acting, Intermediate-Acting Synthetic Glucocorticoid, Solu-Medrol",
      href: "study.html?item=methylprednisolone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Biguanide • AMPK Activator & Mitochondrial Complex I Inhibitor",
      Title: "Metformin (Glucophage)",
      Summary: "First-line oral antidiabetic — suppresses hepatic gluconeogenesis; carries risk of lactic acidosis during hypoperfusion and contrast nephropathy",
      Tags: "Biguanide, AMPK activator, Lactic acidosis, Renal clearance, Biguanide • AMPK Activator & Mitochondrial Complex I Inhibitor, Glucophage",
      href: "study.html?item=metformin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor",
      Title: "Empagliflozin (Jardiance)",
      Summary: "Cardioprotective SGLT2 inhibitor — carries critical hazard of life-threatening EUGLYCAEMIC Diabetic Ketoacidosis (euDKA); hold 3 days pre-op",
      Tags: "SGLT2 inhibitor, euDKA risk, Cardioprotective, Hold 3 days, Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor, Jardiance",
      href: "study.html?item=empagliflozin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor • C-Aryl Glucoside",
      Title: "Dapagliflozin (Farxiga / Forxiga)",
      Summary: "Selective SGLT2 inhibitor for T2DM, HFrEF, and CKD — mandatory withholding at least 3 to 4 days pre-op to prevent life-threatening euglycaemic DKA (euDKA)",
      Tags: "SGLT2 inhibitor, Gliflozin, euDKA risk, Hold 3-4 days preop, Cardiorenal, Sodium-Glucose Co-Transporter 2 (SGLT2) Inhibitor • C-Aryl Glucoside, Farxiga / Forxiga",
      href: "study.html?item=dapagliflozin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Glucagon-Like Peptide-1 (GLP-1) Receptor Agonist",
      Title: "Semaglutide (Ozempic / Wegovy / Rybelsus)",
      Summary: "Ultra-potent GLP-1 receptor agonist — causes marked gastric emptying delay and severe aspiration risk; hold weekly injections 1 full week pre-op",
      Tags: "GLP-1 agonist, Delayed gastric emptying, Aspiration risk, Hold 1 week, Glucagon-Like Peptide-1 (GLP-1) Receptor Agonist, Ozempic / Wegovy / Rybelsus",
      href: "study.html?item=semaglutide",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Second-Generation Sulfonylurea • Pancreatic Beta-Cell K-ATP Channel Blocker",
      Title: "Glimepiride (Amaryl)",
      Summary: "Potent second-generation sulfonylurea — triggers insulin release independent of ambient glucose; hold morning of surgery to prevent severe hypoglycemia",
      Tags: "Sulfonylurea, K-ATP blocker, Hypoglycemia hazard, Hold morning of surgery, Second-Generation Sulfonylurea • Pancreatic Beta-Cell K-ATP Channel Blocker, Amaryl",
      href: "study.html?item=glimepiride",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Dipeptidyl Peptidase-4 (DPP-4) Inhibitor • Incretin Enhancer",
      Title: "Sitagliptin (Januvia)",
      Summary: "Oral DPP-4 inhibitor — prolongs endogenous GLP-1 and GIP; low intrinsic hypoglycemia risk, hold morning of surgery per institutional protocol",
      Tags: "DPP-4 inhibitor, Incretin enhancer, Low hypoglycemia risk, Renal dosing, Dipeptidyl Peptidase-4 (DPP-4) Inhibitor • Incretin Enhancer, Januvia",
      href: "study.html?item=sitagliptin",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Thiazolidinedione (TZD) • Peroxisome Proliferator-Activated Receptor Gamma (PPAR-γ) Agonist",
      Title: "Pioglitazone (Actos)",
      Summary: "Insulin-sensitizing thiazolidinedione — promotes peripheral glucose uptake; causes fluid retention and precipitates congestive heart failure",
      Tags: "TZD, PPAR-gamma agonist, Fluid retention, Heart failure risk, Thiazolidinedione (TZD) • Peroxisome Proliferator-Activated Receptor Gamma (PPAR-γ) Agonist, Actos",
      href: "study.html?item=pioglitazone",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Short-Acting Human Recombinant Insulin • Tyrosine Kinase Receptor Agonist",
      Title: "Regular Insulin (Humulin R / Novolin R)",
      Summary: "The gold-standard intravenous insulin for intraoperative glycaemic sliding scales, infusions, and diabetic ketoacidosis",
      Tags: "Human insulin, Short-acting, IV titratable, DKA protocol, Insulin classification, Short-Acting Human Recombinant Insulin • Tyrosine Kinase Receptor Agonist, Humulin R / Novolin R",
      href: "study.html?item=insulin-regular",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Long-Acting Peakless Basal Human Insulin Analogue",
      Title: "Insulin Glargine (Lantus / Toujeo / Basaglar)",
      Summary: "Peakless once-daily basal insulin analogue — administer 75–80% of normal dose on night before/morning of surgery to prevent ketoacidosis",
      Tags: "Basal insulin, Peakless, 24-hour duration, Perioperative 75-80% dose, Long-Acting Peakless Basal Human Insulin Analogue, Lantus / Toujeo / Basaglar",
      href: "study.html?item=insulin-glargine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Selective 5-HT3 (Serotonin) Receptor Antagonist Antiemetic",
      Title: "Ondansetron (Zofran)",
      Summary: "The premier antiemetic for PONV prophylaxis and rescue — administer within 30 minutes of emergence for maximal clinical efficacy",
      Tags: "Antiemetic, 5-HT3 antagonist, PONV prophylaxis, QTc prolongation, Selective 5-HT3 (Serotonin) Receptor Antagonist Antiemetic, Zofran",
      href: "study.html?item=ondansetron",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Divalent Intracellular Cation • Physiological Calcium Antagonist & NMDA Receptor Blocker",
      Title: "Magnesium Sulphate (Magnesium Sulfate Injection)",
      Summary: "Essential divalent cation — drug of choice for eclampsia and Torsades; dramatically potentiates neuromuscular blockers by 2–3 fold",
      Tags: "Magnesium, Eclampsia, Torsades de Pointes, Neuromuscular potentiation, Divalent Intracellular Cation • Physiological Calcium Antagonist & NMDA Receptor Blocker, Magnesium Sulfate Injection",
      href: "study.html?item=magnesium-sulphate",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Systemic Alkalinizing Agent • Urinary Alkalinizer & Hypertonic Buffer",
      Title: "Sodium Bicarbonate (Sodium Bicarbonate 8.4%)",
      Summary: "Hypertonic systemic alkalinizer — essential for severe metabolic acidosis, hyperkalaemia, TCA cardiotoxicity, and local anaesthetic buffering",
      Tags: "Alkalinizer, Buffer, Hyperkalaemia, TCA overdose, Systemic Alkalinizing Agent • Urinary Alkalinizer & Hypertonic Buffer, Sodium Bicarbonate 8.4%",
      href: "study.html?item=sodium-bicarbonate",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Essential Intracellular Electrolyte Concentrate",
      Title: "Potassium Chloride (Potassium Chloride Concentrate for Injection)",
      Summary: "Vital intracellular cation — treat hypokalaemia with strict dilution; NEVER push IV bolus (lethal asystolic arrest)",
      Tags: "Potassium, Electrolyte concentrate, Never IV push, Hypokalaemia, Essential Intracellular Electrolyte Concentrate, Potassium Chloride Concentrate for Injection",
      href: "study.html?item=potassium-chloride",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Divalent Extracellular Cation • Myocardial Membrane Stabilizer & Coagulation Factor IV",
      Title: "Calcium (Gluconate vs Chloride) (Calcium Gluconate 10% / Calcium Chloride 10%)",
      Summary: "Essential divalent cation — Calcium Chloride has 3x the elemental calcium of Gluconate; first-line membrane stabilizer in hyperkalaemia",
      Tags: "Calcium, Hyperkalaemia antidote, Gluconate vs Chloride, Citrate toxicity, Divalent Extracellular Cation • Myocardial Membrane Stabilizer & Coagulation Factor IV, Calcium Gluconate 10% / Calcium Chloride 10%",
      href: "study.html?item=calcium-gluconate-chloride",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Sterile Fat Emulsion • First-Line Specific Antidote for Local Anaesthetic Systemic Toxicity (LAST)",
      Title: "Intralipid 20% (Intralipid 20% (Intravenous Lipid Emulsion / ILE))",
      Summary: "The definitive life-saving antidote for Local Anaesthetic Systemic Toxicity (LAST) and severe lipophilic drug cardiotoxicity",
      Tags: "LAST antidote, Lipid sink, Intravenous lipid emulsion, Bupivacaine toxicity, Sterile Fat Emulsion • First-Line Specific Antidote for Local Anaesthetic Systemic Toxicity (LAST), Intralipid 20% (Intravenous Lipid Emulsion / ILE)",
      href: "study.html?item=intralipid-20",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Post-Synaptic Skeletal Muscle Relaxant • Ryanodine Receptor 1 (RyR1) Antagonist",
      Title: "Dantrolene Sodium (Dantrium / Ryanodex)",
      Summary: "The only specific life-saving antidote for Malignant Hyperthermia crisis and neuroleptic malignant syndrome",
      Tags: "Malignant Hyperthermia, RyR1 antagonist, Ryanodex, MHAUS protocol, Post-Synaptic Skeletal Muscle Relaxant • Ryanodine Receptor 1 (RyR1) Antagonist, Dantrium / Ryanodex",
      href: "study.html?item=dantrolene",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Tertiary Amine Parasympatholytic • Competitive Non-Selective Muscarinic Acetylcholine Receptor Antagonist",
      Title: "Atropine Sulfate (Atropine Injection)",
      Summary: "Tertiary amine antimuscarinic — the classic vagolytic for acute haemodynamically unstable bradycardia & organophosphate antidote",
      Tags: "Anticholinergic, Antimuscarinic, Vagolytic, ACLS bradycardia, Organophosphate antidote, Tertiary Amine Parasympatholytic • Competitive Non-Selective Muscarinic Acetylcholine Receptor Antagonist, Atropine Injection",
      href: "study.html?item=atropine",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Synthetic Quaternary Ammonium Parasympatholytic • Peripheral Muscarinic Acetylcholine Receptor Antagonist",
      Title: "Glycopyrrolate (Robinul)",
      Summary: "Quaternary ammonium antimuscarinic — zero blood-brain barrier crossing, ideal reversal partner for neostigmine & premier antisialagogue",
      Tags: "Anticholinergic, Antimuscarinic, Neostigmine partner, Quaternary amine, Antisialagogue, Synthetic Quaternary Ammonium Parasympatholytic • Peripheral Muscarinic Acetylcholine Receptor Antagonist, Robinul",
      href: "study.html?item=glycopyrrolate",
    },
    {
      Type: "Study Drug",
      Category: "Study Mode • Broad-Spectrum Vaughan Williams Class III Antiarrhythmic • Multi-Channel Membrane Stabiliser",
      Title: "Amiodarone (Cordarone / Nexterone / Pacerone)",
      Summary: "Vaughan Williams Class III antiarrhythmic with properties of all 4 classes — first-line for shock-refractory VF/pVT & atrial fibrillation",
      Tags: "Antiarrhythmic, Class III, ACLS VF/pVT, Atrial fibrillation, Multi-channel blocker, Broad-Spectrum Vaughan Williams Class III Antiarrhythmic • Multi-Channel Membrane Stabiliser, Cordarone / Nexterone / Pacerone",
      href: "study.html?item=amiodarone",
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

    // Lazily load study-data.js in the background on pages where it is not included
    // so deep topic sections (277 sections!) and drug pharmacology are fully indexed sitewide.
    function loadStudyDataIfNeeded() {
      if (window.KN_STUDY) return Promise.resolve(window.KN_STUDY);
      return new Promise((resolve) => {
        if (typeof document !== "undefined") {
          const script = document.createElement("script");
          script.src = "study-data.js";
          script.async = true;
          script.onload = () => {
            memoryCatalog = null; // Invalidate memory cache so next search includes deep section text
            resolve(window.KN_STUDY);
          };
          script.onerror = () => resolve(null);
          document.head.appendChild(script);
        } else {
          resolve(null);
        }
      });
    }

    // Trigger lazy background load immediately
    loadStudyDataIfNeeded();

    async function buildSearchCatalog() {
      if (memoryCatalog) return memoryCatalog;

      const catalog = [...STATIC_ENTRIES];

      // 1. Deep Ingestion of Study Mode data (Topics, 277 Sections, 84 Drugs)
      try {
        const study = window.KN_STUDY;
        if (study && Array.isArray(study.topics)) {
          study.topics.forEach(t => {
            // Index each structured section inside the topic
            if (Array.isArray(t.sections)) {
              t.sections.forEach((sec, sIdx) => {
                let rawText = sec.b || "";
                if (sec.table) {
                  rawText += " " + (sec.table.headers || []).join(" ") + " " + (sec.table.rows || []).map(r => r.join(" ")).join(" ");
                }
                const cleanBody = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
                catalog.push({
                  Type: "Study Section",
                  Category: `Study Mode • ${t.name}`,
                  Title: `${t.name}: ${sec.h}`,
                  Summary: cleanBody.slice(0, 240) + (cleanBody.length > 240 ? "…" : ""),
                  Content: cleanBody,
                  Tags: (t.tags || []).concat([t.cat, t.short || ""]).filter(Boolean).join(", "),
                  href: `study.html?item=${t.id}#sec-${sIdx}`
                });
              });
            }
          });
        }

        if (study && Array.isArray(study.drugs)) {
          study.drugs.forEach(d => {
            const pharmacologyText = [d.pd, d.pk, d.dosage, d.complications, d.structure, d.offLabel]
              .filter(Boolean)
              .map(s => s.replace(/<[^>]+>/g, " "))
              .join(" ")
              .replace(/\s+/g, " ")
              .trim();

            catalog.push({
              Type: "Study Drug",
              Category: `Study Mode • ${d.classification || 'Pharmacology'}`,
              Title: d.name + (d.brand ? ` (${d.brand})` : ""),
              Summary: d.tagline || (d.pd ? d.pd.replace(/<[^>]+>/g, " ").slice(0, 180) : ""),
              Content: pharmacologyText,
              Tags: (d.tags || []).concat([d.classification, d.brand]).filter(Boolean).join(", "),
              href: `study.html?item=${d.id}`
            });
          });
        }
      } catch (err) {
        console.warn("KnockoutNotes search: Study data ingestion notice:", err);
      }

      // 2. Ingest Regional Anaesthesia blocks if available
      try {
        const regional = window.KN_REGIONAL;
        if (regional && Array.isArray(regional.blocks)) {
          regional.blocks.forEach(b => {
            const blockContent = [b.anatomy, b.technique, b.volume, b.pearls, (b.tags || []).join(" ")]
              .filter(Boolean)
              .join(" ")
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim();

            catalog.push({
              Type: "Regional Block",
              Category: `Regional Anaesthesia • ${b.region || 'Nerve Block'}`,
              Title: b.name,
              Summary: b.summary || b.indication || "",
              Content: blockContent,
              Tags: (b.tags || []).join(", "),
              href: `regional-anaesthesia.html?block=${b.id}`
            });
          });
        }
      } catch (_) {}

      // 3. Scrape Content Config dynamically if available
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

      // 4. Scrape live DOM on current page for any custom or revealed cards
      try {
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll(".card, article.card, .quick-card, .calc-box, .airway-box").forEach(card => {
          const titleEl = card.querySelector("h3, h2, .calc-name, .calc-box-header h3");
          const title = titleEl ? titleEl.textContent.trim() : "";
          const tagEl = card.querySelector(".tag, .kicker-pill, .card-date, .calc-hero-badge, .calc-tag");
          const category = tagEl ? tagEl.textContent.trim() : "";
          const pEl = card.querySelector("p, .calc-desc");
          const summary = pEl ? pEl.textContent.trim() : "";
          const ansEl = card.querySelector(".answer");
          const answer = ansEl ? ansEl.textContent.trim() : "";
          const targetId = ansEl ? ansEl.id : (card.id || "");

          if (title && (answer || summary)) {
            catalog.push({
              Type: answer ? "Answer / Pearl" : (card.classList.contains("calc-box") ? "Calculator" : "Clinical Card"),
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

      // Deduplicate entries by normalized title + href
      const seen = new Set();
      const uniqueCatalog = [];
      for (const entry of catalog) {
        if (!entry || !entry.Title) continue;
        const key = `${norm(entry.Title)}|${norm(entry.href || "")}`;
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
      const [targetPageWithParams, targetHash] = item.href.split("#");
      const [targetPage] = targetPageWithParams.split("?");

      // Check if target is on current page
      const isSamePage = !targetPage || targetPage === currentPath || (currentPath === "" && targetPage === "index.html");

      if (isSamePage) {
        // If on calculators.html and item points to a calculator card or hash:
        if (targetHash) {
          const targetElement = document.getElementById(targetHash);
          if (targetElement) {
            // Check if card is inside a specific calculator tab:
            const parentTab = targetElement.closest(".calc-tab-content, [data-tab-name]");
            if (parentTab) {
              const tabName = parentTab.getAttribute("data-tab-name") || (parentTab.id || "").replace("tab-", "").replace("tab", "").replace("3d", "").toLowerCase();
              if (tabName) {
                const tabBtn = document.querySelector(`[data-calc-tab="${tabName}"], [data-tab="${tabName}"]`);
                if (tabBtn) tabBtn.click();
              }
            }

            // If target is an answer or inside a card with an answer, open it
            const answerDiv = targetElement.classList.contains("answer") ? targetElement : targetElement.querySelector(".answer");
            if (answerDiv) {
              answerDiv.classList.add("open");
              const btn = targetElement.closest(".card, article.card, .quick-card")?.querySelector(".reveal");
              if (btn) {
                btn.textContent = "Hide Answer";
                btn.setAttribute("aria-expanded", "true");
              }
            }

            // Smooth scroll to element
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
              targetElement.classList.remove("kn-highlight-pulse");
              void targetElement.offsetWidth; // force reflow
              targetElement.classList.add("kn-highlight-pulse");
            }, 60);

            // Close modal if open
            const modal = document.getElementById("knSearchModal");
            if (modal && modal.classList.contains("open")) {
              modal.classList.remove("open");
              if (window.KnockoutScrollLock) window.KnockoutScrollLock.set("search", false);
            }
            return;
          }
        }

        // If on study.html and navigating to another topic/drug:
        if (currentPath === "study.html" && item.href.includes("?item=")) {
          const modal = document.getElementById("knSearchModal");
          if (modal && modal.classList.contains("open")) {
            modal.classList.remove("open");
            if (window.KnockoutScrollLock) window.KnockoutScrollLock.set("search", false);
          }
          window.location.href = item.href;
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
        const rawQ = query !== undefined ? query : input.value;
        const q = norm(rawQ);
        if (clear) clear.style.display = q ? "block" : "none";
        results.innerHTML = "";

        if (!q) {
          if (status) status.textContent = "Start typing to search 64 topics, 277 study sections, 84 drugs, 35 calculators, and viva pearls.";
          return;
        }

        if (status) status.textContent = "Searching KnockoutNotes comprehensive medical database…";

        const catalog = await buildSearchCatalog();
        const tokens = q.split(/\s+/).filter(t => t.length > 1);

        // Multi-tier ranking match
        const scoredMatches = [];

        for (const item of catalog) {
          if (!item || !item.Title) continue;
          const title = norm(item.Title);
          const category = norm(item.Category);
          const imgFile = norm(item.ImageFileName);
          const tags = norm(item.Tags || "");
          const summary = norm(item.Summary);
          const answer = norm(item.Answer);
          const content = norm(item.Content || "");
          const ref = norm(item.Reference);

          let score = 0;
          let matchContext = "summary";

          if (title === q) {
            score = 150;
            matchContext = "title";
          } else if (title.startsWith(q)) {
            score = 120;
            matchContext = "title";
          } else if (title.includes(q)) {
            score = 90;
            matchContext = "title";
          } else if (imgFile && imgFile.includes(q)) {
            score = 85;
            matchContext = "image";
          } else if (tags.includes(q)) {
            score = 75;
            matchContext = "tags";
          } else if (answer && answer.includes(q)) {
            score = 70;
            matchContext = "answer";
          } else if (category.includes(q)) {
            score = 65;
            matchContext = "category";
          } else if (summary.includes(q)) {
            score = 55;
            matchContext = "summary";
          } else if (content.includes(q)) {
            score = 50;
            matchContext = "content";
          } else if (tokens.length > 1) {
            const combined = `${title} ${category} ${tags} ${summary} ${answer} ${content}`;
            const matchedAll = tokens.every(tok => combined.includes(tok));
            if (matchedAll) {
              score = 40 + tokens.length * 5;
              if (title.includes(tokens[0])) matchContext = "title";
              else if (answer.includes(tokens[0])) matchContext = "answer";
              else if (tags.includes(tokens[0])) matchContext = "tags";
              else if (content.includes(tokens[0])) matchContext = "content";
              else matchContext = "summary";
            }
          } else if (ref && ref.includes(q)) {
            score = 25;
            matchContext = "reference";
          }

          if (score > 0) {
            scoredMatches.push({ item, score, matchContext });
          }
        }

        scoredMatches.sort((a, b) => b.score - a.score);
        const topMatches = scoredMatches.slice(0, 24);

        if (!topMatches.length) {
          if (status) status.textContent = "No matching medical content found.";
          results.innerHTML = '<div class="kn-search-empty"><div style="font-size:24px;margin-bottom:8px;">🔍</div>No results found. Try searching for a drug (e.g. <em>Propofol</em>), topic (<em>Ventilation</em>), score (<em>PFT</em>, <em>COPUR</em>), question (<em>atrial kick</em>, <em>CICO</em>), or section term (<em>equal pressure point</em>).</div>';
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
            previewHtml = `<div class="kn-search-answer-snippet"><span class="kn-badge-ans">💬 In Answer</span> ${extractSnippet(item.Answer, rawQ)}</div>`;
          } else if (matchContext === "content" && item.Content) {
            previewHtml = `<div class="kn-search-answer-snippet" style="border-left-color:#38bdf8;"><span class="kn-badge-ans" style="background:rgba(56,189,248,0.16);color:#38bdf8;border:1px solid rgba(56,189,248,0.35);padding:1px 6px;border-radius:4px;">📄 In Study Content</span> ${extractSnippet(item.Content, rawQ)}</div>`;
          } else if (matchContext === "tags" && item.Tags) {
            previewHtml = `<div class="kn-search-answer-snippet" style="border-left-color:#c084fc;"><span class="kn-badge-ans" style="background:rgba(168,85,247,0.16);color:#c084fc;border:1px solid rgba(168,85,247,0.35);padding:1px 6px;border-radius:4px;">🏷️ In Tags</span> ${highlightText(item.Tags, rawQ)}</div>`;
          } else if (matchContext === "image" && item.ImageFileName) {
            previewHtml = `<div class="kn-search-img-snippet"><span class="kn-badge-img">🖼️ Image File</span> ${highlightText(item.ImageFileName, rawQ)}</div>`;
          } else if (item.Summary) {
            previewHtml = `<p>${extractSnippet(item.Summary, rawQ)}</p>`;
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
          else if (tLower.includes("study") || tLower.includes("section")) badgeClass = "kn-badge-pearl";

          return `
            <a class="kn-search-result" href="${esc(href)}" ${isExternalOrFile ? 'target="_blank" rel="noopener"' : ""} data-target-id="${esc(item.targetId || "")}" data-index="${idx}">
              <div class="kn-search-result-top">
                <span class="kn-search-type ${badgeClass}">${esc(typeName)}</span>
                ${catName ? `<span class="card-date">• ${esc(catName)}${esc(imgName)}</span>` : ""}
              </div>
              <h4>${highlightText(title, rawQ)}</h4>
              ${previewHtml}
            </a>`;
        }).join("");

        selectedIndex = -1;

        // Wire result click interception for smooth in-page action
        results.querySelectorAll(".kn-search-result").forEach((resEl, idx) => {
          resEl.addEventListener("click", e => {
            const match = topMatches[idx];
            if (match && match.item) {
              addRecentSearch(match.item.Title || rawQ);
              const currentPath = window.location.pathname.split("/").pop() || "index.html";
              const [targetPageWithParams] = (match.item.href || "").split("#");
              const [targetPage] = targetPageWithParams.split("?");
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
          if (status) status.textContent = "Start typing to search 64 topics, 277 study sections, 84 drugs, 35 calculators, and viva pearls.";
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
