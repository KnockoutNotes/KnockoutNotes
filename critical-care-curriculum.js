// ============================================================================
// KNOCKOUT NOTES — MASTER NEET-SS CRITICAL CARE CURRICULUM REGISTRY & UI ENGINE
// Auto-generated & Optimized for NEET-SS Examination, Evidence & Clinical Practice
// ============================================================================

(function() {
  'use strict';

  const CC_DATA = {
    chapters: [
  {
    "id": 1,
    "slug": "fundamentals",
    "title": "Fundamentals of Critical Care & ICU Systems",
    "icon": "🏥",
    "examWeight": "High (5-7 MCQs)",
    "description": "ICU admission triage, physiological severity scores (APACHE, SAPS, SOFA, MPM), organ failure criteria, quality bundles, human factors, brain death protocols, and end-of-life ethics.",
    "subchaptersCount": 4
  },
  {
    "id": 2,
    "slug": "physiology",
    "title": "Applied Physiology of Critical Illness",
    "icon": "🫀",
    "examWeight": "Core High-Yield (6-8 MCQs)",
    "description": "Oxygen transport, DO2/VO2 relationships, Fick principle, critical DO2 threshold, cellular dysoxia, Type A vs Type B lactate metabolism, microcirculation, and systemic inflammatory response.",
    "subchaptersCount": 3
  },
  {
    "id": 3,
    "slug": "hemodynamics",
    "title": "Advanced Hemodynamic Monitoring & Echocardiography",
    "icon": "📈",
    "examWeight": "Extremely High (8-10 MCQs)",
    "description": "Arterial line physics, damping coefficient, CVP waveform analysis, PAC thermodilution, dynamic fluid responsiveness (PLR, EEOT, PPV, SVV), ScvO2 vs SvO2, PCO2 gap, and VExUS venous congestion score.",
    "subchaptersCount": 4
  },
  {
    "id": 4,
    "slug": "shock",
    "title": "Shock Syndromes & Vasoactive Therapeutics",
    "icon": "⚡",
    "examWeight": "Extremely High (8-10 MCQs)",
    "description": "Classification & hemodynamic profiling of shock (hypovolemic, cardiogenic, distributive, obstructive), vasopressors, inotropes, inodilators, and mechanical circulatory support (IABP, Impella, VA-ECMO).",
    "subchaptersCount": 4
  },
  {
    "id": 5,
    "slug": "sepsis",
    "title": "Sepsis, Septic Shock & Host Response (2026 SSC)",
    "icon": "🦠",
    "examWeight": "Must-Know Master Domain (10-12 MCQs)",
    "description": "Sepsis-3 criteria, SOFA dynamics, 2026 Surviving Sepsis Campaign guideline recommendations, crystalloids vs albumin, vasopressor escalation, antimicrobial timing, corticosteroids, and blood purification.",
    "subchaptersCount": 4
  },
  {
    "id": 6,
    "slug": "respiratory-failure",
    "title": "Acute Respiratory Failure & Mechanics",
    "icon": "🫁",
    "examWeight": "High (5-7 MCQs)",
    "description": "Type 1 vs Type 2 respiratory failure, Alveolar Gas Equation, A-a oxygen gradient, compliance (static vs dynamic), airway resistance, and equation of motion.",
    "subchaptersCount": 3
  },
  {
    "id": 7,
    "slug": "noninvasive-respiratory",
    "title": "Non-Invasive Respiratory Support (HFNC & NIV)",
    "icon": "💨",
    "examWeight": "High (5-6 MCQs)",
    "description": "High-Flow Nasal Cannula (HFNC), physiological mechanisms, ROX index thresholds, CPAP vs BiPAP, evidence-based indications (COPD, CPE), contraindications, and failure predictors.",
    "subchaptersCount": 3
  },
  {
    "id": 8,
    "slug": "mechanical-ventilation",
    "title": "Invasive Mechanical Ventilation & Graphics",
    "icon": "⚙️",
    "examWeight": "Must-Know Master Domain (10-12 MCQs)",
    "description": "Core ventilator modes (VCV, PCV, PRVC, APRV, NAVA), scalar and loop interpretation, auto-PEEP quantification, patient-ventilator asynchronies, SBT trials, RSBI, and liberation protocols.",
    "subchaptersCount": 4
  },
  {
    "id": 9,
    "slug": "ards",
    "title": "Acute Respiratory Distress Syndrome (ARDS)",
    "icon": "🔬",
    "examWeight": "Must-Know Master Domain (10-12 MCQs)",
    "description": "Berlin & Global ARDS definitions, low tidal volume protocol (ARDSNet), driving pressure, mechanical power, prone positioning (PROSEVA), neuromuscular blockade (ROSE/ACURASYS), and recruitment.",
    "subchaptersCount": 4
  },
  {
    "id": 10,
    "slug": "obstructive-airway",
    "title": "Obstructive Airway Emergencies in ICU (Asthma & COPD)",
    "icon": "🌬️",
    "examWeight": "High (5-7 MCQs)",
    "description": "Status asthmaticus, intubation hazards, dynamic hyperinflation, controlled hypoventilation & permissive hypercapnia, auto-PEEP mitigation, and acute severe COPD exacerbation pathways.",
    "subchaptersCount": 3
  },
  {
    "id": 11,
    "slug": "cardiac-critical-care",
    "title": "Cardiac Critical Care & Acute Coronary Syndromes",
    "icon": "❤️",
    "examWeight": "High (6-8 MCQs)",
    "description": "STEMI/NSTEMI in the critically ill, mechanical complications of AMI, acute heart failure (Forrester classification), acute RV failure, pulmonary hypertension crisis, and ICU dysrhythmias.",
    "subchaptersCount": 4
  },
  {
    "id": 12,
    "slug": "cardiac-arrest-resuscitation",
    "title": "Resuscitation, Cardiac Arrest & Post-ROSC Care",
    "icon": "🚨",
    "examWeight": "High (6-8 MCQs)",
    "description": "AHA/ERC resuscitation guidelines, high-quality CPR metrics, capnography in CPR, reversible Hs & Ts, Targeted Temperature Management (TTM-2), and multimodal post-cardiac arrest neuroprognostication.",
    "subchaptersCount": 3
  },
  {
    "id": 13,
    "slug": "renal-crrt",
    "title": "Acute Kidney Injury & Renal Replacement Therapy",
    "icon": "🧪",
    "examWeight": "Master Domain (8-10 MCQs)",
    "description": "KDIGO AKI staging, FeNa/FeUrea, HRS-AKI criteria, CRRT modalities (SCUF, CVVH, CVVHD, CVVHDF), effluent dosing, regional citrate anticoagulation (RCA), and severe dysnatremias/dyskalemias.",
    "subchaptersCount": 4
  },
  {
    "id": 14,
    "slug": "acid-base",
    "title": "Complex Acid-Base Disorders & Blood Gas Analysis",
    "icon": "⚖️",
    "examWeight": "Master Domain (8-10 MCQs)",
    "description": "Stepwise ABG interpretation, albumin-corrected Anion Gap, Delta ratio, Winter's formula compensation rules, Stewart physicochemical approach (SIDa, SIDe, SIG), and mixed toxic metabolic acidoses.",
    "subchaptersCount": 3
  },
  {
    "id": 15,
    "slug": "neurocritical-care",
    "title": "Neurocritical Care & Raised ICP Management",
    "icon": "🧠",
    "examWeight": "Master Domain (8-10 MCQs)",
    "description": "Monro-Kellie doctrine, ICP waveforms & Lundberg waves, CPP targets, tiered ICP management protocols, BTF guidelines for severe TBI, aSAH & vasospasm, spontaneous ICH, and status epilepticus.",
    "subchaptersCount": 4
  },
  {
    "id": 16,
    "slug": "sedation-delirium",
    "title": "Sedation, Analgesia, Delirium & Neuromuscular Blockade",
    "icon": "😴",
    "examWeight": "High (5-7 MCQs)",
    "description": "PADIS guidelines, analgosedation, dexmedetomidine vs propofol, delirium screening (CAM-ICU), ICU-acquired weakness (CIP vs CIM), and neuromuscular monitoring.",
    "subchaptersCount": 3
  },
  {
    "id": 17,
    "slug": "pharmacology",
    "title": "Critical Care Applied Pharmacology & Pharmacokinetics",
    "icon": "💊",
    "examWeight": "High (6-8 MCQs)",
    "description": "Altered pharmacokinetics in critical illness (capillary leak Vd, Augmented Renal Clearance ARC, hypoalbuminemia), therapeutic drug monitoring, vasoactive pharmacology, and anticoagulant reversal agents.",
    "subchaptersCount": 3
  },
  {
    "id": 18,
    "slug": "infections-antimicrobials",
    "title": "Severe ICU Infections & Antimicrobial Stewardship",
    "icon": "🧫",
    "examWeight": "Master Domain (8-10 MCQs)",
    "description": "Severe pneumonia (CAP, HAP, VAP), MDR Gram-negative pathogens (ESBL, CRE, Acinetobacter), invasive candidiasis/aspergillosis, PK/PD dosing of beta-lactams, and tropical infections (dengue, leptospirosis).",
    "subchaptersCount": 4
  },
  {
    "id": 19,
    "slug": "gi-hepatic",
    "title": "Gastrointestinal, Hepatic & Abdominal Catastrophes",
    "icon": "🩺",
    "examWeight": "High (6-8 MCQs)",
    "description": "Severe acute pancreatitis (Revised Atlanta), Acute Liver Failure (King's College Criteria), ACLF, variceal bleeding, intra-abdominal hypertension, Abdominal Compartment Syndrome (ACS), and acute mesenteric ischemia.",
    "subchaptersCount": 4
  },
  {
    "id": 20,
    "slug": "endocrine-metabolic",
    "title": "Endocrine & Metabolic Crises",
    "icon": "⚡",
    "examWeight": "High (5-6 MCQs)",
    "description": "Diabetic Ketoacidosis (DKA), Hyperosmolar Hyperglycemic State (HHS), intensive insulin protocols, thyroid storm (Burch-Wartofsky score), myxedema coma, and acute adrenal crisis.",
    "subchaptersCount": 3
  },
  {
    "id": 21,
    "slug": "nutrition-metabolism",
    "title": "Critical Care Clinical Nutrition & Metabolism",
    "icon": "🥗",
    "examWeight": "Moderate (4-5 MCQs)",
    "description": "ESPEN/ASPEN guidelines, enteral nutrition timing, indirect calorimetry vs predictive targets, protein dosing, refeeding syndrome prevention, and gastric residual volume management.",
    "subchaptersCount": 2
  },
  {
    "id": 22,
    "slug": "hematology-transfusion",
    "title": "ICU Hematology, Hemostasis & Transfusion Medicine",
    "icon": "🩸",
    "examWeight": "High (6-8 MCQs)",
    "description": "Restrictive vs liberal RBC transfusion triggers (TRICC, TRISS), Massive Transfusion Protocols (MTP), viscoelastic hemostatic assays (TEG & ROTEM), HIT Type II (4Ts score), and acute transfusion reactions (TRALI vs TACO).",
    "subchaptersCount": 4
  },
  {
    "id": 23,
    "slug": "toxicology",
    "title": "Clinical Toxicology & Toxidromes",
    "icon": "☠️",
    "examWeight": "High (6-8 MCQs)",
    "description": "General toxidrome recognition, acetaminophen toxicity (Rumack-Matthew nomogram), organophosphates & carbamates, beta-blocker/CCB overdose (high-dose insulin euglycemia), toxic alcohols, and snake bite envenomation.",
    "subchaptersCount": 4
  },
  {
    "id": 24,
    "slug": "trauma-resuscitation",
    "title": "Polytrauma & Damage Control Resuscitation",
    "icon": "🩹",
    "examWeight": "High (6-7 MCQs)",
    "description": "ATLS principles, Damage Control Resuscitation (DCR), permissive hypotension, tranexamic acid (CRASH-2), severe pelvic ring fractures, crush syndrome, and fat embolism syndrome.",
    "subchaptersCount": 3
  },
  {
    "id": 25,
    "slug": "burns",
    "title": "Major Burns & Inhalational Injuries",
    "icon": "🔥",
    "examWeight": "Moderate to High (4-5 MCQs)",
    "description": "Rule of Nines, Lund-Browder charts, Parkland formula fluid resuscitation titration, fluid creep prevention, carbon monoxide/cyanide inhalation, and escharotomy criteria.",
    "subchaptersCount": 2
  },
  {
    "id": 26,
    "slug": "obstetric-critical-care",
    "title": "Obstetric Critical Care & Maternal Emergencies",
    "icon": "🤰",
    "examWeight": "High (5-6 MCQs)",
    "description": "Severe preeclampsia/eclampsia, HELLP syndrome, massive postpartum hemorrhage, Amniotic Fluid Embolism (AFE), and perimortem cesarean delivery (resuscitative hysterotomy).",
    "subchaptersCount": 3
  },
  {
    "id": 27,
    "slug": "pediatric-critical-care",
    "title": "Paediatric & Neonatal Emergencies in Adult ICU",
    "icon": "👶",
    "examWeight": "Moderate (4-5 MCQs)",
    "description": "Paediatric shock recognition, weight-based resuscitation formulas, status epilepticus, croup vs epiglottitis, paediatric mechanical ventilation, and pediatric DKA protocols.",
    "subchaptersCount": 2
  },
  {
    "id": 28,
    "slug": "procedures-devices",
    "title": "Critical Care Bedside Procedures & Invasive Devices",
    "icon": "💉",
    "examWeight": "High (5-6 MCQs)",
    "description": "Ultrasound-guided vascular access, percutaneous dilatational tracheostomy (Ciaglia technique), tube thoracostomy, lumbar puncture, and intraosseous infusion.",
    "subchaptersCount": 2
  },
  {
    "id": 29,
    "slug": "ultrasound-pocus",
    "title": "Critical Care Ultrasound & Echocardiography (POCUS)",
    "icon": "📡",
    "examWeight": "High (6-8 MCQs)",
    "description": "Lung ultrasound (BLUE protocol, A/B lines, lung sliding, lung point, shred sign), focused cardiac ultrasound (FOCUS), McConnell's sign, tamponade physiology, and VExUS score.",
    "subchaptersCount": 3
  },
  {
    "id": 30,
    "slug": "ecmo-organ-support",
    "title": "Extracorporeal Membrane Oxygenation (ECMO) & ECPR",
    "icon": "🔄",
    "examWeight": "Must-Know Master Domain (8-10 MCQs)",
    "description": "ELSO guidelines, VV-ECMO vs VA-ECMO physiology, cannulation configurations, distal perfusion catheter, sweep gas vs blood flow, Harlequin syndrome, LV distension management, and ECPR.",
    "subchaptersCount": 3
  },
  {
    "id": 31,
    "slug": "special-icu-oncology",
    "title": "Special ICU Populations, Oncology & Environmental Crises",
    "icon": "🛡️",
    "examWeight": "Moderate to High (4-5 MCQs)",
    "description": "Febrile neutropenia, Tumor Lysis Syndrome (Cairo-Bishop criteria), novel chemotherapy toxicities (CAR-T cytokine release syndrome, immune checkpoint inhibitors), accidental hypothermia, and heat stroke.",
    "subchaptersCount": 3
  }
],
    subchapters: [
  {
    "id": "1.1",
    "chapterId": 1,
    "title": "ICU Admission, Triage Models & Discharge Criteria"
  },
  {
    "id": "1.2",
    "chapterId": 1,
    "title": "Physiological Severity Scores & Organ Failure Systems"
  },
  {
    "id": "1.3",
    "chapterId": 1,
    "title": "Quality Indicators, Infection Prevention Bundles & Patient Safety"
  },
  {
    "id": "1.4",
    "chapterId": 1,
    "title": "End-of-Life Decisions, Brain Death Protocol & Organ Donation"
  },
  {
    "id": "2.1",
    "chapterId": 2,
    "title": "Oxygen Cascade, DO2/VO2 Balances & Dysoxia Physiology"
  },
  {
    "id": "2.2",
    "chapterId": 2,
    "title": "Cellular Hypoxia, Lactate Metabolism & Microcirculation"
  },
  {
    "id": "2.3",
    "chapterId": 2,
    "title": "Neuroendocrine Stress Response & ICU-Acquired Immunoparalysis"
  },
  {
    "id": "3.1",
    "chapterId": 3,
    "title": "Arterial Line Physics, Dynamic Response & CVP Waveform Analysis"
  },
  {
    "id": "3.2",
    "chapterId": 3,
    "title": "Pulmonary Artery Catheterization, Thermodilution & O2 Flux"
  },
  {
    "id": "3.3",
    "chapterId": 3,
    "title": "Dynamic Fluid Responsiveness (PLR, EEOT, PPV, SVV)"
  },
  {
    "id": "3.4",
    "chapterId": 3,
    "title": "Venous Congestion Assessment & VExUS Grading"
  },
  {
    "id": "4.1",
    "chapterId": 4,
    "title": "Classification, Pathophysiology & Hemodynamic Profiling of Shock"
  },
  {
    "id": "4.2",
    "chapterId": 4,
    "title": "Vasopressors, Inotropes & Inodilators Pharmacology"
  },
  {
    "id": "4.3",
    "chapterId": 4,
    "title": "Temporary Mechanical Circulatory Support (IABP & Impella)"
  },
  {
    "id": "4.4",
    "chapterId": 4,
    "title": "Veno-Arterial ECMO for Refractory Cardiogenic Shock"
  },
  {
    "id": "5.1",
    "chapterId": 5,
    "title": "Sepsis-3 Definitions, Pathobiology & Organ Dysfunction Criteria"
  },
  {
    "id": "5.2",
    "chapterId": 5,
    "title": "2026 Surviving Sepsis Campaign: Resuscitation & Fluid Selection"
  },
  {
    "id": "5.3",
    "chapterId": 5,
    "title": "Antimicrobial Strategies, Source Control & Biomarker Guidance"
  },
  {
    "id": "5.4",
    "chapterId": 5,
    "title": "Adjunctive Therapeutics, Steroids & Blood Purification in Sepsis"
  },
  {
    "id": "6.1",
    "chapterId": 6,
    "title": "Hypoxemic vs Hypercapnic Acute Respiratory Failure"
  },
  {
    "id": "6.2",
    "chapterId": 6,
    "title": "Alveolar Gas Equation, A-a Gradient & Shunt Fractions"
  },
  {
    "id": "6.3",
    "chapterId": 6,
    "title": "Respiratory System Mechanics, Compliance & Resistance"
  },
  {
    "id": "7.1",
    "chapterId": 7,
    "title": "High-Flow Nasal Cannula (HFNC) Mechanics & ROX Index"
  },
  {
    "id": "7.2",
    "chapterId": 7,
    "title": "Non-Invasive Positive Pressure Ventilation (CPAP & BiPAP)"
  },
  {
    "id": "7.3",
    "chapterId": 7,
    "title": "NIV Failure Predictors, HACOR Score & Intubation Triggers"
  },
  {
    "id": "8.1",
    "chapterId": 8,
    "title": "Invasive Ventilator Modes (VCV, PCV, PRVC, APRV, NAVA)"
  },
  {
    "id": "8.2",
    "chapterId": 8,
    "title": "Ventilator Graphics: Scalars, Loops & Dynamic Auto-PEEP"
  },
  {
    "id": "8.3",
    "chapterId": 8,
    "title": "Patient-Ventilator Asynchrony: Recognition & Management"
  },
  {
    "id": "8.4",
    "chapterId": 8,
    "title": "Liberation Protocols, Spontaneous Breathing Trials & RSBI"
  },
  {
    "id": "9.1",
    "chapterId": 9,
    "title": "ARDS Definitions (Berlin & Global Updated) & Pathophysiology"
  },
  {
    "id": "9.2",
    "chapterId": 9,
    "title": "Lung-Protective Ventilation, Driving Pressure & Mechanical Power"
  },
  {
    "id": "9.3",
    "chapterId": 9,
    "title": "Prone Positioning Protocol & Neuromuscular Blockade Evidence"
  },
  {
    "id": "9.4",
    "chapterId": 9,
    "title": "Advanced ARDS Rescues, Inhaled Vasodilators & VV-ECMO Indications"
  },
  {
    "id": "10.1",
    "chapterId": 10,
    "title": "Status Asthmaticus: Dynamic Hyperinflation & Ventilator Strategy"
  },
  {
    "id": "10.2",
    "chapterId": 10,
    "title": "Acute Exacerbation of COPD: NIV Titration & Intrinsic PEEP Matching"
  },
  {
    "id": "10.3",
    "chapterId": 10,
    "title": "Intubation Hazards, Permissive Hypercapnia & Bronchodilator Delivery"
  },
  {
    "id": "11.1",
    "chapterId": 11,
    "title": "Acute Coronary Syndromes in ICU & Mechanical Complications"
  },
  {
    "id": "11.2",
    "chapterId": 11,
    "title": "Acute Decompensated Heart Failure & Cardiogenic Pulmonary Edema"
  },
  {
    "id": "11.3",
    "chapterId": 11,
    "title": "Acute Right Ventricular Failure & Pulmonary Hypertensive Crisis"
  },
  {
    "id": "11.4",
    "chapterId": 11,
    "title": "Life-Threatening ICU Arrhythmias, AF with RVR & Electrical Storm"
  },
  {
    "id": "12.1",
    "chapterId": 12,
    "title": "AHA/ERC Advanced Resuscitation Protocols & CPR Quality Metrics"
  },
  {
    "id": "12.2",
    "chapterId": 12,
    "title": "Reversible Arrest Causes (5 Hs & 5 Ts) & Capnography Guided ROSC"
  },
  {
    "id": "12.3",
    "chapterId": 12,
    "title": "Targeted Temperature Management (TTM-2) & Neuroprognostication"
  },
  {
    "id": "13.1",
    "chapterId": 13,
    "title": "KDIGO Acute Kidney Injury Staging & Diagnostic Indices"
  },
  {
    "id": "13.2",
    "chapterId": 13,
    "title": "Continuous Renal Replacement Therapy: Modalities & Clearance Physics"
  },
  {
    "id": "13.3",
    "chapterId": 13,
    "title": "Regional Citrate Anticoagulation (RCA) & Prescribed Effluent Dosing"
  },
  {
    "id": "13.4",
    "chapterId": 13,
    "title": "Severe Dysnatremias, Dyskalemias & Divalent Cation Disorders"
  },
  {
    "id": "14.1",
    "chapterId": 14,
    "title": "Stepwise Arterial Blood Gas Interpretation Framework"
  },
  {
    "id": "14.2",
    "chapterId": 14,
    "title": "Albumin-Corrected Anion Gap, Delta Ratio & Winter's Formula"
  },
  {
    "id": "14.3",
    "chapterId": 14,
    "title": "Stewart Physicochemical Approach (SIDa, SIDe, Strong Ion Gap)"
  },
  {
    "id": "15.1",
    "chapterId": 15,
    "title": "Monro-Kellie Doctrine, ICP Waveforms & CPP Target Optimization"
  },
  {
    "id": "15.2",
    "chapterId": 15,
    "title": "Tiered Management of Intracranial Hypertension & Brain Trauma Guidelines"
  },
  {
    "id": "15.3",
    "chapterId": 15,
    "title": "Aneurysmal SAH, Vasospasm Prevention & Spontaneous ICH Blood Pressure Control"
  },
  {
    "id": "15.4",
    "chapterId": 15,
    "title": "Refractory Status Epilepticus & Continuous EEG Burst Suppression"
  },
  {
    "id": "16.1",
    "chapterId": 16,
    "title": "PADIS Guidelines: Analgosedation & Dexmedetomidine Protocols"
  },
  {
    "id": "16.2",
    "chapterId": 16,
    "title": "ICU Delirium Subtypes, CAM-ICU Tool & Prevention Bundles"
  },
  {
    "id": "16.3",
    "chapterId": 16,
    "title": "Neuromuscular Blockade Monitoring & ICU-Acquired Weakness"
  },
  {
    "id": "17.1",
    "chapterId": 17,
    "title": "Altered Pharmacokinetics in Critical Illness (Capillary Leak & ARC)"
  },
  {
    "id": "17.2",
    "chapterId": 17,
    "title": "Therapeutic Drug Monitoring of Antimicrobials in ICU"
  },
  {
    "id": "17.3",
    "chapterId": 17,
    "title": "Emergency Reversal Agents for Anticoagulants & Antiplatelets"
  },
  {
    "id": "18.1",
    "chapterId": 18,
    "title": "Severe Pneumonias: CAP, HAP & Ventilator-Associated Pneumonia"
  },
  {
    "id": "18.2",
    "chapterId": 18,
    "title": "MDR Gram-Negative Pathogens: ESBL, CRE & Acinetobacter Therapy"
  },
  {
    "id": "18.3",
    "chapterId": 18,
    "title": "Invasive Fungal Infections: Candidiasis, Aspergillosis & Antifungals"
  },
  {
    "id": "18.4",
    "chapterId": 18,
    "title": "Tropical Infections in ICU: Severe Dengue, Malaria & Leptospirosis"
  },
  {
    "id": "19.1",
    "chapterId": 19,
    "title": "Severe Acute Pancreatitis: Revised Atlanta Staging & Resuscitation"
  },
  {
    "id": "19.2",
    "chapterId": 19,
    "title": "Acute Liver Failure, King's College Criteria & Cerebral Edema Control"
  },
  {
    "id": "19.3",
    "chapterId": 19,
    "title": "Acute Upper GI Bleeding, Variceal Hemorrhage & TIPS"
  },
  {
    "id": "19.4",
    "chapterId": 19,
    "title": "Intra-Abdominal Hypertension, Abdominal Compartment Syndrome & Mesenteric Ischemia"
  },
  {
    "id": "20.1",
    "chapterId": 20,
    "title": "Diabetic Ketoacidosis & Hyperosmolar Hyperglycemic State Protocols"
  },
  {
    "id": "20.2",
    "chapterId": 20,
    "title": "Thyroid Storm (Burch-Wartofsky Scale) & Myxedema Coma"
  },
  {
    "id": "20.3",
    "chapterId": 20,
    "title": "Acute Adrenal Crisis & Cirrhotic Adrenal Exhaustion in Shock"
  },
  {
    "id": "21.1",
    "chapterId": 21,
    "title": "Enteral vs Parenteral Nutrition: Timing, Calories & High-Protein Dosing"
  },
  {
    "id": "21.2",
    "chapterId": 21,
    "title": "Refeeding Syndrome Pathophysiology, Monitoring & Calorie Advancement"
  },
  {
    "id": "22.1",
    "chapterId": 22,
    "title": "Restrictive vs Liberal Transfusion Strategies & Blood Components"
  },
  {
    "id": "22.2",
    "chapterId": 22,
    "title": "Viscoelastic Assays (TEG & ROTEM) Algorithms for Hemostasis"
  },
  {
    "id": "22.3",
    "chapterId": 22,
    "title": "Massive Transfusion Protocol & Damage Control Resuscitation"
  },
  {
    "id": "22.4",
    "chapterId": 22,
    "title": "HIT Type II (4Ts Score) & Acute Transfusion Reactions (TRALI vs TACO)"
  },
  {
    "id": "23.1",
    "chapterId": 23,
    "title": "General Toxidromes & Approach to Toxic Ingestion in ICU"
  },
  {
    "id": "23.2",
    "chapterId": 23,
    "title": "Acetaminophen Toxicity & IV N-Acetylcysteine Protocol"
  },
  {
    "id": "23.3",
    "chapterId": 23,
    "title": "Cardiotoxic Drug Overdose (Beta-Blocker/CCB High-Dose Insulin Euglycemia)"
  },
  {
    "id": "23.4",
    "chapterId": 23,
    "title": "Pesticides, Toxic Alcohols, Cyanide & Severe Snake Envenomation"
  },
  {
    "id": "24.1",
    "chapterId": 24,
    "title": "ATLS Resuscitation, Primary/Secondary Survey & Permissive Hypotension"
  },
  {
    "id": "24.2",
    "chapterId": 24,
    "title": "Traumatic Hemorrhagic Shock, Tranexamic Acid & Triad of Death"
  },
  {
    "id": "24.3",
    "chapterId": 24,
    "title": "Severe Pelvic Ring Fractures, Crush Syndrome & Fat Embolism"
  },
  {
    "id": "25.1",
    "chapterId": 25,
    "title": "Major Burns TBSA Calculation, Parkland Resuscitation & Fluid Creep"
  },
  {
    "id": "25.2",
    "chapterId": 25,
    "title": "Inhalational Burn Injury, Carbon Monoxide, Cyanide & Escharotomy"
  },
  {
    "id": "26.1",
    "chapterId": 26,
    "title": "Severe Preeclampsia, Eclampsia & Magnesium Neuroprotection"
  },
  {
    "id": "26.2",
    "chapterId": 26,
    "title": "Massive Postpartum Hemorrhage & Amniotic Fluid Embolism"
  },
  {
    "id": "26.3",
    "chapterId": 26,
    "title": "Maternal Cardiac Arrest & Resuscitative Hysterotomy (Perimortem C-Section)"
  },
  {
    "id": "27.1",
    "chapterId": 27,
    "title": "Paediatric Shock, Sepsis Resuscitation & Weight-Based Formulas"
  },
  {
    "id": "27.2",
    "chapterId": 27,
    "title": "Paediatric Upper Airway Obstruction, Status Asthmaticus & DKA"
  },
  {
    "id": "28.1",
    "chapterId": 28,
    "title": "Ultrasound-Guided Central Line & Arterial Cannulation Techniques"
  },
  {
    "id": "28.2",
    "chapterId": 28,
    "title": "Percutaneous Dilatational Tracheostomy & Emergency Tube Thoracostomy"
  },
  {
    "id": "29.1",
    "chapterId": 29,
    "title": "Critical Care Lung Ultrasound (BLUE Protocol & Artifact Patterns)"
  },
  {
    "id": "29.2",
    "chapterId": 29,
    "title": "Focused Cardiac Ultrasound (FOCUS) & Right Ventricular Strain Signs"
  },
  {
    "id": "29.3",
    "chapterId": 29,
    "title": "Venous Congestion Grading (VExUS Score Protocol)"
  },
  {
    "id": "30.1",
    "chapterId": 30,
    "title": "Veno-Venous (VV) ECMO for Severe ARDS & Ultra-Protective Vent"
  },
  {
    "id": "30.2",
    "chapterId": 30,
    "title": "Veno-Arterial (VA) ECMO, Harlequin Syndrome & LV Unloading"
  },
  {
    "id": "30.3",
    "chapterId": 30,
    "title": "Extracorporeal Cardiopulmonary Resuscitation (ECPR) Patient Selection"
  },
  {
    "id": "31.1",
    "chapterId": 31,
    "title": "Neutropenic Sepsis & Infiltrates in the Immunocompromised"
  },
  {
    "id": "31.2",
    "chapterId": 31,
    "title": "Tumor Lysis Syndrome & Novel Chemotherapy / CAR-T Toxicities"
  },
  {
    "id": "31.3",
    "chapterId": 31,
    "title": "Accidental Hypothermia, Active Rewarming & Severe Heat Stroke"
  }
],
    topics: [
  {
    "id": "cc-haemodynamic-monitoring-i",
    "sourceIndex": 1,
    "sourceDuration": "42 Min",
    "sourceCategory": "BASICS OF CRITICAL CARE MEDICINE",
    "title": "Haemodynamic Monitoring: I",
    "chapterId": 3,
    "subchapterId": "3.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Haemodynamic Monitoring: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-3"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-central-venous-line-and-cvp-measurement",
    "sourceIndex": 2,
    "sourceDuration": "27 Min",
    "sourceCategory": "BASICS OF CRITICAL CARE MEDICINE",
    "title": "Central Venous Line and CVP Measurement",
    "chapterId": 3,
    "subchapterId": "3.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Central Venous Line and CVP Measurement"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-3"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-cardiac-output-monitoring",
    "sourceIndex": 3,
    "sourceDuration": "67 Min",
    "sourceCategory": "BASICS OF CRITICAL CARE MEDICINE",
    "title": "Cardiac Output Monitoring",
    "chapterId": 3,
    "subchapterId": "3.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Cardiac Output Monitoring"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-3"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-assessing-fluid-responsiveness-in-the-icu",
    "sourceIndex": 4,
    "sourceDuration": "46 Min",
    "sourceCategory": "BASICS OF CRITICAL CARE MEDICINE",
    "title": "Assessing Fluid Responsiveness in the ICU",
    "chapterId": 3,
    "subchapterId": "3.3",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Assessing Fluid Responsiveness in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-3"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-assessing-adequacy-of-oxygen-delivery",
    "sourceIndex": 5,
    "sourceDuration": "47 Min",
    "sourceCategory": "BASICS OF CRITICAL CARE MEDICINE",
    "title": "Assessing Adequacy of Oxygen Delivery",
    "chapterId": 2,
    "subchapterId": "2.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Assessing Adequacy of Oxygen Delivery"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-2"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-basics-of-mechanical-ventilation",
    "sourceIndex": 6,
    "sourceDuration": "47 Min",
    "sourceCategory": "MECHANICAL VENTILATION",
    "title": "Basics of Mechanical Ventilation",
    "chapterId": 8,
    "subchapterId": "8.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Basics of Mechanical Ventilation"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-8"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation",
    "sourceIndex": 7,
    "sourceDuration": "47 Min",
    "sourceCategory": "MECHANICAL VENTILATION",
    "title": "Ventilator Graphics and Basic Modes of Mechanical Ventilation",
    "chapterId": 8,
    "subchapterId": "8.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Ventilator Graphics and Basic Modes of Mechanical Ventilation"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-8"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-patient-ventilator-asynchrony",
    "sourceIndex": 8,
    "sourceDuration": "68 Min",
    "sourceCategory": "MECHANICAL VENTILATION",
    "title": "Patient Ventilator Asynchrony",
    "chapterId": 8,
    "subchapterId": "8.3",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Patient Ventilator Asynchrony"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-8"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-weaning-from-mechanical-ventilation",
    "sourceIndex": 9,
    "sourceDuration": "87 Min",
    "sourceCategory": "MECHANICAL VENTILATION",
    "title": "Weaning from Mechanical Ventilation",
    "chapterId": 8,
    "subchapterId": "8.4",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Weaning from Mechanical Ventilation"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-8"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-advanced-modes-of-mechanical-ventilation",
    "sourceIndex": 10,
    "sourceDuration": "60 Min",
    "sourceCategory": "MECHANICAL VENTILATION",
    "title": "Advanced Modes of Mechanical Ventilation",
    "chapterId": 8,
    "subchapterId": "8.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Advanced Modes of Mechanical Ventilation"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-8"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-respiratory-distress-syndrome-i",
    "sourceIndex": 11,
    "sourceDuration": "0 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Acute Respiratory Distress Syndrome: I",
    "chapterId": 9,
    "subchapterId": "9.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Acute Respiratory Distress Syndrome: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-9"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-respiratory-distress-syndrome-ii",
    "sourceIndex": 12,
    "sourceDuration": "26 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Acute Respiratory Distress Syndrome: II",
    "chapterId": 9,
    "subchapterId": "9.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Acute Respiratory Distress Syndrome: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-9"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pulmonary-embolism",
    "sourceIndex": 13,
    "sourceDuration": "68 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Pulmonary Embolism",
    "chapterId": 11,
    "subchapterId": "11.3",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Pulmonary Embolism"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-copd-and-asthma",
    "sourceIndex": 14,
    "sourceDuration": "50 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "COPD and Asthma",
    "chapterId": 10,
    "subchapterId": "10.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "COPD and Asthma"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-10"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-respiratory-management-in-specific-clinical-scenarios-i",
    "sourceIndex": 15,
    "sourceDuration": "50 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Respiratory Management in Specific Clinical Scenarios: I",
    "chapterId": 6,
    "subchapterId": "6.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Respiratory Management in Specific Clinical Scenarios: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-6"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-respiratory-management-in-specific-clinical-scenarios-ii",
    "sourceIndex": 16,
    "sourceDuration": "33 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Respiratory Management in Specific Clinical Scenarios: II",
    "chapterId": 6,
    "subchapterId": "6.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Respiratory Management in Specific Clinical Scenarios: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-6"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pa-catheter",
    "sourceIndex": 17,
    "sourceDuration": "36 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "PA Catheter",
    "chapterId": 3,
    "subchapterId": "3.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "PA Catheter"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-3"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pleural-disorders-in-icu",
    "sourceIndex": 18,
    "sourceDuration": "52 Min",
    "sourceCategory": "RESPIRATORY DISORDERS",
    "title": "Pleural Disorders in ICU",
    "chapterId": 28,
    "subchapterId": "28.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Pleural Disorders in ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-28"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-interpreting-abg",
    "sourceIndex": 19,
    "sourceDuration": "59 Min",
    "sourceCategory": "ELECTROLYTE AND ACID BASE DISORDERS",
    "title": "Interpreting ABG",
    "chapterId": 14,
    "subchapterId": "14.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Interpreting ABG"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-14"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-sodium-disorders-in-the-icu",
    "sourceIndex": 20,
    "sourceDuration": "51 Min",
    "sourceCategory": "ELECTROLYTE AND ACID BASE DISORDERS",
    "title": "Sodium Disorders in The ICU",
    "chapterId": 13,
    "subchapterId": "13.4",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Sodium Disorders in The ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-potassium-disorders-in-the-icu",
    "sourceIndex": 21,
    "sourceDuration": "52 Min",
    "sourceCategory": "ELECTROLYTE AND ACID BASE DISORDERS",
    "title": "Potassium Disorders in the ICU",
    "chapterId": 13,
    "subchapterId": "13.4",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Potassium Disorders in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-disorders-of-calcium-magnesium-phosphorus-metabolism",
    "sourceIndex": 22,
    "sourceDuration": "55 Min",
    "sourceCategory": "ELECTROLYTE AND ACID BASE DISORDERS",
    "title": "Disorders of Calcium, Magnesium & Phosphorus Metabolism",
    "chapterId": 13,
    "subchapterId": "13.4",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Disorders of Calcium, Magnesium & Phosphorus Metabolism"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-sepsis-and-septic-shock-evaluation-management",
    "sourceIndex": 23,
    "sourceDuration": "50 Min",
    "sourceCategory": "SHOCK",
    "title": "Sepsis and Septic Shock: Evaluation & Management",
    "chapterId": 5,
    "subchapterId": "5.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Sepsis and Septic Shock: Evaluation & Management"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-5"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-organ-dysfunction-in-sepsis",
    "sourceIndex": 24,
    "sourceDuration": "55 Min",
    "sourceCategory": "SHOCK",
    "title": "Organ Dysfunction in Sepsis",
    "chapterId": 5,
    "subchapterId": "5.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Organ Dysfunction in Sepsis"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-5"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-sepsis-2026-clinical-guidelines",
    "sourceIndex": 25,
    "sourceDuration": "31 Min",
    "sourceCategory": "SHOCK",
    "title": "Sepsis: 2026 Clinical Guidelines",
    "chapterId": 5,
    "subchapterId": "5.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Sepsis: 2026 Clinical Guidelines"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-5"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-cardiogenic-shock-i",
    "sourceIndex": 26,
    "sourceDuration": "31 Min",
    "sourceCategory": "SHOCK",
    "title": "Cardiogenic Shock: I",
    "chapterId": 4,
    "subchapterId": "4.1",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Cardiogenic Shock: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-4"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-cardiogenic-shock-ii",
    "sourceIndex": 27,
    "sourceDuration": "47 Min",
    "sourceCategory": "SHOCK",
    "title": "Cardiogenic Shock: II",
    "chapterId": 4,
    "subchapterId": "4.2",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Cardiogenic Shock: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-4"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-extracorporeal-therapies-in-sepsis",
    "sourceIndex": 28,
    "sourceDuration": "58 Min",
    "sourceCategory": "SHOCK",
    "title": "Extracorporeal Therapies In Sepsis",
    "chapterId": 5,
    "subchapterId": "5.4",
    "level": "master",
    "priority": "P0",
    "sourceTopics": [
      "Extracorporeal Therapies In Sepsis"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-5"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-basic-echocardiography",
    "sourceIndex": 29,
    "sourceDuration": "27 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "Basic Echocardiography",
    "chapterId": 29,
    "subchapterId": "29.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Basic Echocardiography"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-29"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-aortic-dissection",
    "sourceIndex": 30,
    "sourceDuration": "41 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "Aortic Dissection",
    "chapterId": 11,
    "subchapterId": "11.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Aortic Dissection"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-right-ventricular-failure-in-the-icu",
    "sourceIndex": 31,
    "sourceDuration": "35 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "Right Ventricular Failure in the ICU",
    "chapterId": 11,
    "subchapterId": "11.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Right Ventricular Failure in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-post-cardiac-arrest-management-prognostication",
    "sourceIndex": 32,
    "sourceDuration": "40 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "Post Cardiac Arrest Management & Prognostication",
    "chapterId": 12,
    "subchapterId": "12.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Post Cardiac Arrest Management & Prognostication"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-12"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pericarditis-and-myocarditis",
    "sourceIndex": 33,
    "sourceDuration": "22 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "Pericarditis and Myocarditis",
    "chapterId": 11,
    "subchapterId": "11.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Pericarditis and Myocarditis"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-mi-acs",
    "sourceIndex": 34,
    "sourceDuration": "55 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "MI & ACS",
    "chapterId": 11,
    "subchapterId": "11.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "MI & ACS"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-icu-management-of-acs-i",
    "sourceIndex": 35,
    "sourceDuration": "50 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "ICU Management of ACS: I",
    "chapterId": 11,
    "subchapterId": "11.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ICU Management of ACS: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-icu-management-of-acs-ii",
    "sourceIndex": 36,
    "sourceDuration": "35 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "ICU Management of ACS: II",
    "chapterId": 11,
    "subchapterId": "11.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ICU Management of ACS: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-11"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-2025-acc-aha-cpr-guidelines-updates",
    "sourceIndex": 37,
    "sourceDuration": "19 Min",
    "sourceCategory": "CARDIAC DISORDERS",
    "title": "2025 ACC/AHA CPR Guidelines Updates",
    "chapterId": 12,
    "subchapterId": "12.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "2025 ACC/AHA CPR Guidelines Updates"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-12"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-ventilator-associated-pneumonia",
    "sourceIndex": 38,
    "sourceDuration": "54 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Ventilator Associated Pneumonia",
    "chapterId": 18,
    "subchapterId": "18.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Ventilator Associated Pneumonia"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-community-acquired-pneumonia",
    "sourceIndex": 39,
    "sourceDuration": "66 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Community Acquired Pneumonia",
    "chapterId": 18,
    "subchapterId": "18.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Community Acquired Pneumonia"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-infections-in-the-immunocompromised-host",
    "sourceIndex": 40,
    "sourceDuration": "81 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Infections in the Immunocompromised Host",
    "chapterId": 31,
    "subchapterId": "31.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Infections in the Immunocompromised Host"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-31"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-managing-mdr-gram-negative-infections-i",
    "sourceIndex": 41,
    "sourceDuration": "45 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Managing MDR Gram-Negative Infections: I",
    "chapterId": 18,
    "subchapterId": "18.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Managing MDR Gram-Negative Infections: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-managing-mdr-gram-negative-infections-ii",
    "sourceIndex": 42,
    "sourceDuration": "14 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Managing MDR Gram-Negative Infections: II",
    "chapterId": 18,
    "subchapterId": "18.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Managing MDR Gram-Negative Infections: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-interpreting-antibiogram-and-mic",
    "sourceIndex": 43,
    "sourceDuration": "29 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Interpreting Antibiogram and MIC",
    "chapterId": 18,
    "subchapterId": "18.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Interpreting Antibiogram and MIC"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-cns-infections-in-icu",
    "sourceIndex": 44,
    "sourceDuration": "70 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "CNS Infections in ICU",
    "chapterId": 18,
    "subchapterId": "18.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "CNS Infections in ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-leptospirosis-rickettsial-diseases",
    "sourceIndex": 45,
    "sourceDuration": "29 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Leptospirosis & Rickettsial Diseases",
    "chapterId": 18,
    "subchapterId": "18.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Leptospirosis & Rickettsial Diseases"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-dengue-fever",
    "sourceIndex": 46,
    "sourceDuration": "37 Min",
    "sourceCategory": "INFECTIOUS DISEASES",
    "title": "Dengue Fever",
    "chapterId": 18,
    "subchapterId": "18.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Dengue Fever"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-glucose-control-in-icu",
    "sourceIndex": 47,
    "sourceDuration": "65 Min",
    "sourceCategory": "ENDOCRINE DISORDERS",
    "title": "Glucose Control in ICU",
    "chapterId": 20,
    "subchapterId": "20.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Glucose Control in ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-20"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-endocrine-emergencies",
    "sourceIndex": 48,
    "sourceDuration": "45 Min",
    "sourceCategory": "ENDOCRINE DISORDERS",
    "title": "Endocrine Emergencies",
    "chapterId": 20,
    "subchapterId": "20.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Endocrine Emergencies"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-20"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-kidney-injury-i",
    "sourceIndex": 49,
    "sourceDuration": "48 Min",
    "sourceCategory": "RENAL DISORDERS",
    "title": "Acute Kidney Injury: I",
    "chapterId": 13,
    "subchapterId": "13.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acute Kidney Injury: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-kidney-injury-ii",
    "sourceIndex": 50,
    "sourceDuration": "53 Min",
    "sourceCategory": "RENAL DISORDERS",
    "title": "Acute Kidney Injury: II",
    "chapterId": 13,
    "subchapterId": "13.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acute Kidney Injury: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-renal-replacement-therapy-i",
    "sourceIndex": 51,
    "sourceDuration": "54 Min",
    "sourceCategory": "RENAL DISORDERS",
    "title": "Renal Replacement Therapy: I",
    "chapterId": 13,
    "subchapterId": "13.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Renal Replacement Therapy: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-renal-replacement-therapy-ii",
    "sourceIndex": 52,
    "sourceDuration": "45 Min",
    "sourceCategory": "RENAL DISORDERS",
    "title": "Renal Replacement Therapy: II",
    "chapterId": 13,
    "subchapterId": "13.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Renal Replacement Therapy: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-13"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-hematological-emergencies-in-critical-illness",
    "sourceIndex": 53,
    "sourceDuration": "56 Min",
    "sourceCategory": "HEMATOLOGY",
    "title": "Hematological Emergencies in Critical Illness",
    "chapterId": 22,
    "subchapterId": "22.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Hematological Emergencies in Critical Illness"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-22"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-thrombocytopenia-in-the-icu",
    "sourceIndex": 54,
    "sourceDuration": "31 Min",
    "sourceCategory": "HEMATOLOGY",
    "title": "Thrombocytopenia In the ICU",
    "chapterId": 22,
    "subchapterId": "22.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Thrombocytopenia In the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-22"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-abdomen-in-the-icu",
    "sourceIndex": 55,
    "sourceDuration": "43 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Abdomen in the ICU",
    "chapterId": 19,
    "subchapterId": "19.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Abdomen in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-liver-failure",
    "sourceIndex": 56,
    "sourceDuration": "29 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Acute Liver Failure",
    "chapterId": 19,
    "subchapterId": "19.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acute Liver Failure"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-aclf-in-icu",
    "sourceIndex": 57,
    "sourceDuration": "56 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "ACLF in ICU",
    "chapterId": 19,
    "subchapterId": "19.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ACLF in ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-decompensated-cld",
    "sourceIndex": 58,
    "sourceDuration": "29 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Decompensated CLD",
    "chapterId": 19,
    "subchapterId": "19.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Decompensated CLD"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-pancreatitis",
    "sourceIndex": 59,
    "sourceDuration": "51 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Acute Pancreatitis",
    "chapterId": 19,
    "subchapterId": "19.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acute Pancreatitis"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acute-mesenteric-ischemia",
    "sourceIndex": 60,
    "sourceDuration": "42 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Acute Mesenteric Ischemia",
    "chapterId": 19,
    "subchapterId": "19.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acute Mesenteric Ischemia"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-intra-abdominal-hypertension-and-abdominal-compartment-syndrome",
    "sourceIndex": 61,
    "sourceDuration": "27 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Intra-abdominal Hypertension And Abdominal Compartment Syndrome",
    "chapterId": 19,
    "subchapterId": "19.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Intra-abdominal Hypertension And Abdominal Compartment Syndrome"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-19"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-clostridioides-difficile-colitis",
    "sourceIndex": 62,
    "sourceDuration": "31 Min",
    "sourceCategory": "GASTROINTESTINAL & HEPATOLOGICAL DISORDERS",
    "title": "Clostridioides Difficile Colitis",
    "chapterId": 18,
    "subchapterId": "18.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Clostridioides Difficile Colitis"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-18"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-traumatic-brain-injury",
    "sourceIndex": 63,
    "sourceDuration": "35 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Traumatic Brain Injury",
    "chapterId": 15,
    "subchapterId": "15.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Traumatic Brain Injury"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-15"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-icu-management-of-traumatic-brain-injury",
    "sourceIndex": 64,
    "sourceDuration": "46 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "ICU Management of Traumatic Brain Injury",
    "chapterId": 15,
    "subchapterId": "15.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ICU Management of Traumatic Brain Injury"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-15"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-icp-monitoring",
    "sourceIndex": 65,
    "sourceDuration": "42 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "ICP Monitoring",
    "chapterId": 15,
    "subchapterId": "15.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ICP Monitoring"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-15"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-intracranial-haemorrhage",
    "sourceIndex": 66,
    "sourceDuration": "29 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Intracranial Haemorrhage",
    "chapterId": 15,
    "subchapterId": "15.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Intracranial Haemorrhage"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-15"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-subarachnoid-haemorrhage",
    "sourceIndex": 67,
    "sourceDuration": "50 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Subarachnoid Haemorrhage",
    "chapterId": 15,
    "subchapterId": "15.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Subarachnoid Haemorrhage"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-15"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-neuromuscular-disorders-in-icu-i",
    "sourceIndex": 68,
    "sourceDuration": "41 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Neuromuscular Disorders in ICU: I",
    "chapterId": 16,
    "subchapterId": "16.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Neuromuscular Disorders in ICU: I"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-16"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-neuromuscular-disorders-in-icu-ii",
    "sourceIndex": 69,
    "sourceDuration": "51 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Neuromuscular Disorders in ICU: II",
    "chapterId": 16,
    "subchapterId": "16.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Neuromuscular Disorders in ICU: II"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-16"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-delirium-in-icu-padis-guidelines",
    "sourceIndex": 70,
    "sourceDuration": "41 Min",
    "sourceCategory": "NEUROLOGIC EMERGENCIES",
    "title": "Delirium in ICU & PADIS Guidelines",
    "chapterId": 16,
    "subchapterId": "16.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Delirium in ICU & PADIS Guidelines"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-16"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-management-of-brain-dead-organ-donors",
    "sourceIndex": 71,
    "sourceDuration": "27 Min",
    "sourceCategory": "SPECIAL TOPICS",
    "title": "Management of Brain Dead Organ Donors",
    "chapterId": 1,
    "subchapterId": "1.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Management of Brain Dead Organ Donors"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-1"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-nutrition-in-the-icu",
    "sourceIndex": 72,
    "sourceDuration": "41 Min",
    "sourceCategory": "SPECIAL TOPICS",
    "title": "Nutrition in the ICU",
    "chapterId": 21,
    "subchapterId": "21.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Nutrition in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-21"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pharmacokinetics",
    "sourceIndex": 73,
    "sourceDuration": "54 Min",
    "sourceCategory": "SPECIAL TOPICS",
    "title": "Pharmacokinetics",
    "chapterId": 17,
    "subchapterId": "17.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Pharmacokinetics"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-17"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-haemodynamic-management-pharmacotherapy-in-acute-polytrauma",
    "sourceIndex": 74,
    "sourceDuration": "55 Min",
    "sourceCategory": "SPECIAL TOPICS",
    "title": "Haemodynamic Management & Pharmacotherapy in Acute Polytrauma",
    "chapterId": 24,
    "subchapterId": "24.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Haemodynamic Management & Pharmacotherapy in Acute Polytrauma"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-24"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-end-of-life-care-in-the-icu",
    "sourceIndex": 75,
    "sourceDuration": "45 Min",
    "sourceCategory": "SPECIAL TOPICS",
    "title": "End of life Care in the ICU",
    "chapterId": 1,
    "subchapterId": "1.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "End of life Care in the ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-1"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-ecmo-basics",
    "sourceIndex": 76,
    "sourceDuration": "55 Min",
    "sourceCategory": "ECMO",
    "title": "ECMO - Basics",
    "chapterId": 30,
    "subchapterId": "30.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "ECMO - Basics"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-30"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-managing-a-patient-on-ecmo",
    "sourceIndex": 77,
    "sourceDuration": "55 Min",
    "sourceCategory": "ECMO",
    "title": "Managing a patient on ECMO",
    "chapterId": 30,
    "subchapterId": "30.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Managing a patient on ECMO"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-30"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-general-approach-to-poisoning",
    "sourceIndex": 78,
    "sourceDuration": "50 Min",
    "sourceCategory": "TOXICOLOGY",
    "title": "General Approach to Poisoning",
    "chapterId": 23,
    "subchapterId": "23.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "General Approach to Poisoning"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-23"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-acetaminophen-toxicity",
    "sourceIndex": 79,
    "sourceDuration": "35 Min",
    "sourceCategory": "TOXICOLOGY",
    "title": "Acetaminophen Toxicity",
    "chapterId": 23,
    "subchapterId": "23.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Acetaminophen Toxicity"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-23"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-pesticides",
    "sourceIndex": 80,
    "sourceDuration": "62 Min",
    "sourceCategory": "TOXICOLOGY",
    "title": "Pesticides",
    "chapterId": 23,
    "subchapterId": "23.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Pesticides"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-23"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-management-of-snake-bites",
    "sourceIndex": 81,
    "sourceDuration": "41 Min",
    "sourceCategory": "TOXICOLOGY",
    "title": "Management of Snake Bites",
    "chapterId": 23,
    "subchapterId": "23.4",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Management of Snake Bites"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-23"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-recreational-drug-toxicity",
    "sourceIndex": 82,
    "sourceDuration": "35 Min",
    "sourceCategory": "TOXICOLOGY",
    "title": "Recreational Drug Toxicity",
    "chapterId": 23,
    "subchapterId": "23.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Recreational Drug Toxicity"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-23"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-important-clinical-trials-in-critical-care",
    "sourceIndex": 83,
    "sourceDuration": "45 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Important Clinical Trials in Critical Care",
    "chapterId": 1,
    "subchapterId": "1.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Important Clinical Trials in Critical Care"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-1"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-catheter-related-blood-stream-infection",
    "sourceIndex": 84,
    "sourceDuration": "33 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Catheter Related Blood Stream Infection",
    "chapterId": 1,
    "subchapterId": "1.3",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Catheter Related Blood Stream Infection"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-1"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-obstetric-critical-care-general-considerations",
    "sourceIndex": 85,
    "sourceDuration": "22 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Obstetric Critical Care-general Considerations",
    "chapterId": 26,
    "subchapterId": "26.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Obstetric Critical Care-general Considerations"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-26"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-obstetric-critical-care-pregnancy-specific",
    "sourceIndex": 86,
    "sourceDuration": "53 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Obstetric Critical Care: Pregnancy Specific",
    "chapterId": 26,
    "subchapterId": "26.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Obstetric Critical Care: Pregnancy Specific"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-26"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-management-of-burn-patient-in-icu",
    "sourceIndex": 87,
    "sourceDuration": "60 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Management Of Burn Patient In ICU",
    "chapterId": 25,
    "subchapterId": "25.1",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Management Of Burn Patient In ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-25"
    ],
    "lastUpdated": "2026-10"
  },
  {
    "id": "cc-novel-chemo-and-toxicity-in-icu",
    "sourceIndex": 88,
    "sourceDuration": "45 Min",
    "sourceCategory": "MISCELLANEOUS TOPICS",
    "title": "Novel Chemo And Toxicity In ICU",
    "chapterId": 31,
    "subchapterId": "31.2",
    "level": "master",
    "priority": "P1",
    "sourceTopics": [
      "Novel Chemo And Toxicity In ICU"
    ],
    "prerequisites": [],
    "relatedTopics": [],
    "formulas": [],
    "landmarkTrials": [],
    "guidelines": [],
    "examTags": [
      "NEET-SS",
      "CH-31"
    ],
    "lastUpdated": "2026-10"
  }
],
    formulas: [
  {
    "id": "form-map",
    "title": "Mean Arterial Pressure (MAP)",
    "equation": "\\text{MAP} = \\text{DBP} + \\frac{1}{3}(\\text{SBP} - \\text{DBP}) = \\frac{2\\text{DBP} + \\text{SBP}}{3}",
    "units": "mmHg",
    "normalRange": "70–105 mmHg (Target in shock ≥ 65 mmHg)",
    "hyperlinkedReference": {
      "label": "Surviving Sepsis Campaign (SSC 2026 Guidelines)",
      "url": "https://www.sccm.org/SurvivingSepsisCampaign/Guidelines"
    },
    "interpretation": "Determines global organ perfusion pressure. At physiological heart rates, diastole occupies ~2/3 of the cardiac cycle, hence the 2:1 weighting for DBP.",
    "workedExample": "Patient with BP 85/40 mmHg: MAP = [2(40) + 85] / 3 = 165 / 3 = 55 mmHg. Below the critical threshold of 65 mmHg; requires immediate vasopressor titration.",
    "examTrap": "NEET-SS TRAP: During severe tachycardia (HR > 120 bpm), diastole shortens disproportionately, making MAP approximate the simple arithmetic mean (SBP + DBP)/2 instead of the classic 1/3:2/3 formula."
  },
  {
    "id": "form-cpp",
    "title": "Cerebral Perfusion Pressure (CPP)",
    "equation": "\\text{CPP} = \\text{MAP} - \\text{ICP} \\quad (\\text{or } \\text{MAP} - \\text{CVP}, \\text{ whichever is higher})",
    "units": "mmHg",
    "normalRange": "60–70 mmHg in adults with TBI",
    "hyperlinkedReference": {
      "label": "Brain Trauma Foundation (BTF Guidelines 4th Ed)",
      "url": "https://braintrauma.org/guidelines/guidelines-for-the-management-of-severe-tbi-4th-ed"
    },
    "interpretation": "Net pressure driving cerebral blood flow across the cerebral vascular bed against intracranial pressure.",
    "workedExample": "Patient with severe TBI: MAP is 85 mmHg, ICP monitor shows 22 mmHg. CPP = 85 - 22 = 63 mmHg (within therapeutic target 60-70 mmHg).",
    "examTrap": "NEET-SS TRAP: Driving CPP > 70 mmHg using aggressive vasopressors does NOT improve neurological outcome and dramatically increases the risk of ARDS (5-fold increase in pulmonary edema; BTF Level IIB recommendation against CPP > 70 mmHg)."
  },
  {
    "id": "form-do2",
    "title": "Total Oxygen Delivery (DO2)",
    "equation": "\\text{DO}_2 = \\text{CO} \\times \\text{CaO}_2 \\times 10 = \\text{CO} \\times [(1.34 \\times \\text{Hb} \\times \\text{SaO}_2) + (0.0031 \\times \\text{PaO}_2)] \\times 10",
    "units": "mL/min (Indexed: 500–600 mL/min/m²)",
    "normalRange": "900–1100 mL/min",
    "hyperlinkedReference": {
      "label": "Marino's The ICU Book (5th Edition)",
      "url": "https://shop.lww.com/Marino-s-The-ICU-Book/p/9781451121186"
    },
    "interpretation": "Total volume of oxygen delivered to the systemic microcirculation per minute. The factor of 10 converts dL to Liters.",
    "workedExample": "CO 5.0 L/min, Hb 14 g/dL, SaO2 98%, PaO2 95 mmHg: CaO2 = (1.34 × 14 × 0.98) + (0.0031 × 95) = 18.38 + 0.29 = 18.67 mL/dL. DO2 = 5.0 × 18.67 × 10 = 933.5 mL/min.",
    "examTrap": "NEET-SS TRAP: Dissolved oxygen (0.0031 × PaO2) contributes less than 1.5% of total DO2 at normal atmospheric pressures. Doubling PaO2 from 100 to 200 mmHg only adds ~0.3 mL O2/dL blood, while increasing Hb by 1 g/dL adds 1.34 mL O2/dL (over 4 times more effective!)."
  },
  {
    "id": "form-vo2",
    "title": "Oxygen Consumption (VO2 - Fick Principle)",
    "equation": "\\text{VO}_2 = \\text{CO} \\times (\\text{CaO}_2 - \\text{CvO}_2) \\times 10",
    "units": "mL/min (Indexed: 110–160 mL/min/m²)",
    "normalRange": "200–300 mL/min",
    "hyperlinkedReference": {
      "label": "Nunn's Applied Respiratory Physiology (9th Edition)",
      "url": "https://www.elsevier.com/books/nunns-applied-respiratory-physiology/lumb/978-0-7020-7798-2"
    },
    "interpretation": "Volume of oxygen extracted by all peripheral tissues per minute.",
    "workedExample": "CO 5.0 L/min, CaO2 19 mL/dL, CvO2 14 mL/dL: VO2 = 5.0 × (19 - 14) × 10 = 250 mL/min.",
    "examTrap": "NEET-SS TRAP: The Fick Principle can be rearranged to calculate Cardiac Output: CO = VO2 / [(CaO2 - CvO2) × 10]. In severe hypothermia, VO2 plummets by ~7% per °C drop."
  },
  {
    "id": "form-o2er",
    "title": "Oxygen Extraction Ratio (O2ER)",
    "equation": "\\text{O}_2\\text{ER} = \\frac{\\text{VO}_2}{\\text{DO}_2} = \\frac{\\text{CaO}_2 - \\text{CvO}_2}{\\text{CaO}_2}",
    "units": "Percentage (%) or fraction",
    "normalRange": "20–30% (0.20–0.30)",
    "hyperlinkedReference": {
      "label": "Principles of Critical Care (McGraw Hill)",
      "url": "https://accessmedicine.mhmedical.com/book.aspx?bookid=1907"
    },
    "interpretation": "The fraction of delivered oxygen that tissues actually consume. When DO2 drops below critical DO2, O2ER reaches its physiological maximum (~50-60%) and dysoxia/lactate production ensues.",
    "workedExample": "DO2 = 1000 mL/min, VO2 = 250 mL/min: O2ER = 250 / 1000 = 25%. In severe cardiogenic shock, O2ER may rise to 55%. In severe septic shock with microvascular shunting/cytopathic hypoxia, O2ER may drop pathologically to < 15%.",
    "examTrap": "NEET-SS TRAP: Low O2ER in sepsis does NOT mean adequate tissue oxygenation; it reflects mitochondrial failure (cytopathic dysoxia) and microvascular shunting where blood bypasses capillary beds."
  },
  {
    "id": "form-p-to-f",
    "title": "PaO2 / FiO2 Ratio (Carrico Index)",
    "equation": "\\text{P/F Ratio} = \\frac{\\text{PaO}_2}{\\text{FiO}_2}",
    "units": "mmHg",
    "normalRange": "> 400–500 mmHg (on room air: ~100 / 0.21 ≈ 476)",
    "hyperlinkedReference": {
      "label": "Berlin Definition of ARDS (JAMA 2012)",
      "url": "https://jamanetwork.com/journals/jama/fullarticle/1160073"
    },
    "interpretation": "Primary oxygenation metric used to stratify severity of ARDS under positive end-expiratory pressure (PEEP ≥ 5 cmH2O): Mild (200–300), Moderate (100–200), Severe (≤ 100).",
    "workedExample": "Patient on 60% oxygen (FiO2 0.60) has PaO2 of 72 mmHg: P/F = 72 / 0.60 = 120 mmHg. Classified as Moderate ARDS.",
    "examTrap": "NEET-SS TRAP: The P/F ratio is PEEP-dependent! Increasing PEEP from 5 to 15 cmH2O can recruit alveoli and artificially inflate the P/F ratio from 95 to 160 mmHg without altering underlying disease severity."
  },
  {
    "id": "form-rox-index",
    "title": "ROX Index (HFNC Success Predictor)",
    "equation": "\\text{ROX Index} = \\frac{(\\text{SpO}_2 / \\text{FiO}_2)}{\\text{Respiratory Rate}}",
    "units": "Unitless index",
    "normalRange": "> 4.88 (predicts HFNC success)",
    "hyperlinkedReference": {
      "label": "Roca et al. ROX Index Validation (Lancet ID / Intensive Care Med)",
      "url": "https://www.thelancet.com/journals/laninf/article/PIIS1473-3099(16)30141-9/fulltext"
    },
    "interpretation": "Bedside tool used in acute hypoxemic respiratory failure to identify patients at high risk of HFNC failure requiring prompt tracheal intubation.",
    "workedExample": "SpO2 92% on FiO2 0.70, RR 28: (92 / 0.70) / 28 = 131.4 / 28 = 4.69. Assessed at 12 hours: < 4.88 suggests high failure risk; at 2 hours: < 2.85 is an immediate intubation trigger.",
    "examTrap": "NEET-SS TRAP: In the formula, FiO2 MUST be entered as a decimal (0.70, NOT 70), while SpO2 is entered as a percentage (92, NOT 0.92)."
  },
  {
    "id": "form-rsbi",
    "title": "Rapid Shallow Breathing Index (RSBI / Yang-Tobin Index)",
    "equation": "\\text{RSBI} = \\frac{\\text{Respiratory Rate (breaths/min)}}{\\text{Tidal Volume (Liters)}}",
    "units": "breaths/min/L",
    "normalRange": "< 105 breaths/min/L indicates weaning readiness",
    "hyperlinkedReference": {
      "label": "Yang & Tobin Weaning Index (NEJM 1991)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJM199105233242101"
    },
    "interpretation": "Measured during 1 minute of spontaneous breathing on room air/T-piece or low CPAP without pressure support. Values > 105 strongly predict weaning failure (sensitivity 97%, specificity 64%).",
    "workedExample": "Patient breathing at RR 24 bpm with spontaneous Vt 350 mL (0.35 L): RSBI = 24 / 0.35 = 68.6. Value is < 105, supporting extubation readiness.",
    "examTrap": "NEET-SS TRAP: Measuring RSBI while the patient is on Pressure Support (e.g. PS 10 cmH2O) falsely inflates Vt and lowers RSBI, giving a false-negative reassurance! It MUST be measured on T-piece or CPAP 0-5 cmH2O."
  },
  {
    "id": "form-driving-pressure",
    "title": "Ventilator Driving Pressure (ΔP)",
    "equation": "\\Delta\\text{P} = \\text{P}_{\\text{plat}} - \\text{PEEP} = \\frac{\\text{V}_t}{\\text{C}_{\\text{stat}}}",
    "units": "cmH2O",
    "normalRange": "Target ≤ 14–15 cmH2O in ARDS",
    "hyperlinkedReference": {
      "label": "Amato et al. Driving Pressure in ARDS (NEJM 2015)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1410639"
    },
    "interpretation": "The single best mechanical ventilator variable correlating with survival in ARDS. Reflects tidal volume scaled to the functional 'baby lung' size (Cstat).",
    "workedExample": "Pplat = 28 cmH2O, PEEP = 12 cmH2O: ΔP = 28 - 12 = 16 cmH2O. Exceeds target 14 cmH2O; requires decreasing tidal volume by 1 mL/kg PBW.",
    "examTrap": "NEET-SS TRAP: Driving pressure uses PLATEAU pressure (measured via inspiratory pause), NEVER Peak pressure! Ppeak includes resistive airway pressure and will falsely exaggerate driving pressure."
  },
  {
    "id": "form-anion-gap",
    "title": "Serum Anion Gap (Albumin-Corrected Figge Formula)",
    "equation": "\\text{AG} = [\\text{Na}^+] - ([\\text{Cl}^-] + [\\text{HCO}_3^-]) \\quad \\| \\quad \\text{AG}_{\\text{corr}} = \\text{AG} + 2.5 \\times (4.0 - [\\text{Albumin in g/dL}])",
    "units": "mEq/L or mmol/L",
    "normalRange": "8–12 mEq/L (in laboratories using ion-selective electrodes)",
    "hyperlinkedReference": {
      "label": "Figge-Jabor Serum Anion Gap Correction (Crit Care Med 1998)",
      "url": "https://journals.lww.com/ccmjournal/abstract/1998/11000/anion_gap_and_hypoalbuminemia.19.aspx"
    },
    "interpretation": "Identifies unmeasured serum anions (lactate, ketoacids, sulfates, phosphates, toxic organic acids). For every 1 g/dL drop in serum albumin below 4.0 g/dL, the baseline anion gap falls by 2.5 mEq/L.",
    "workedExample": "Na 140, Cl 108, HCO3 16, Albumin 2.0 g/dL. Observed AG = 140 - (108 + 16) = 16 mEq/L. AGcorr = 16 + 2.5 × (4.0 - 2.0) = 16 + 5.0 = 21 mEq/L. A severe High Anion Gap Metabolic Acidosis (HAGMA) is unmasked!",
    "examTrap": "NEET-SS TRAP: Ignoring severe hypoalbuminemia can cause severe HAGMA (e.g. lactic acidosis) to appear as a normal anion gap metabolic acidosis (NAGMA), leading to catastrophic diagnostic errors."
  },
  {
    "id": "form-winters",
    "title": "Winter's Formula for Metabolic Acidosis Compensation",
    "equation": "\\text{Expected PaCO}_2 = (1.5 \\times [\\text{HCO}_3^-]) + 8 \\pm 2",
    "units": "mmHg",
    "normalRange": "Valid for primary metabolic acidosis compensation",
    "hyperlinkedReference": {
      "label": "Rose & Post Clinical Physiology of Acid-Base",
      "url": "https://www.mheducation.com/highered/product/clinical-physiology-acid-base-electrolyte-disorders-rose-post/M9780071346207.html"
    },
    "interpretation": "Predicts the expected respiratory compensation (hyperventilation dropping PaCO2) in pure metabolic acidosis.",
    "workedExample": "HCO3 = 12 mEq/L. Expected PaCO2 = (1.5 × 12) + 8 ± 2 = 18 + 8 ± 2 = 26 ± 2 mmHg (range 24 to 28 mmHg). If measured PaCO2 is 36 mmHg, a coexisting respiratory acidosis is present. If measured PaCO2 is 18 mmHg, a coexisting respiratory alkalosis is present.",
    "examTrap": "NEET-SS TRAP: Maximum respiratory compensation cannot drop PaCO2 below 10–12 mmHg (due to limits of diaphragm work of breathing). If expected PaCO2 is calculated < 10, patient will rapidly exhaust and arrest without mechanical ventilation."
  },
  {
    "id": "form-kdigo-aki",
    "title": "KDIGO Staging Criteria for Acute Kidney Injury",
    "equation": "\\text{Stage 1: SCr } 1.5\\text{-}1.9\\times \\text{baseline or } \\ge 0.3\\text{ mg/dL rise}; \\text{ UO } < 0.5\\text{ mL/kg/h for } 6\\text{-}12\\text{ h}\n\\text{Stage 2: SCr } 2.0\\text{-}2.9\\times \\text{baseline}; \\text{ UO } < 0.5\\text{ mL/kg/h for } \\ge 12\\text{ h}\n\\text{Stage 3: SCr } 3.0\\times \\text{baseline or } \\ge 4.0\\text{ mg/dL or RRT initiation}; \\text{ UO } < 0.3\\text{ mL/kg/h for } \\ge 24\\text{ h or anuria } \\ge 12\\text{ h}",
    "units": "Staging: 1, 2, 3",
    "normalRange": "Stage 0 (No AKI)",
    "hyperlinkedReference": {
      "label": "KDIGO Clinical Practice Guideline for AKI",
      "url": "https://kdigo.org/guidelines/acute-kidney-injury/"
    },
    "interpretation": "Standardized international classification of AKI severity based on serum creatinine increments and duration of oliguria/anuria.",
    "workedExample": "Patient weighing 70 kg has urine output of 150 mL over 6 hours: 150 / (70 × 6) = 0.35 mL/kg/h. Classified as KDIGO Stage 1 AKI based on urine output criteria even before serum creatinine rises.",
    "examTrap": "NEET-SS TRAP: The patient is staged according to whichever criterion (serum creatinine OR urine output) achieves the HIGHEST stage. Oliguria precedes creatinine rise by 24–48 hours!"
  },
  {
    "id": "form-parkland",
    "title": "Parkland Formula for Major Burns Resuscitation",
    "equation": "\\text{Fluid (24 hours)} = 4\\text{ mL} \\times \\text{Weight (kg)} \\times \\%\\text{TBSA Burn (2nd & 3rd degree)}",
    "units": "mL of Ringer's Lactate / Balanced Crystalloid",
    "normalRange": "First 8 hours: 50% of total; Next 16 hours: remaining 50%",
    "hyperlinkedReference": {
      "label": "American Burn Association Practice Guidelines",
      "url": "https://ameriburn.org/education/resources/practice-guidelines/"
    },
    "interpretation": "Standard guideline for fluid resuscitation in burns > 20% TBSA. Time zero is calculated from the EXACT TIME OF BURN INJURY, NOT the time of hospital/ICU arrival!",
    "workedExample": "70 kg patient with 40% TBSA burn: Total 24h = 4 × 70 × 40 = 11,200 mL. Give 5,600 mL in the first 8 hours (700 mL/h), and 5,600 mL over the next 16 hours (350 mL/h).",
    "examTrap": "NEET-SS TRAP: If the patient arrives 2 hours after the burn injury, the first half (5,600 mL) must be infused over the REMAINING 6 HOURS (not 8 hours)! Titrate to target urine output of 0.5–1.0 mL/kg/h."
  }
],
    trials: [
  {
    "id": "trial-ardsnet-arma",
    "domain": "ARDS",
    "name": "ARDSNet (ARMA Trial)",
    "year": 2000,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "ARDSNet ARMA Trial (NEJM 2000; 342:1301-1308)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJM200005043421801"
    },
    "population": "861 mechanically ventilated acute lung injury / ARDS patients",
    "intervention": "Low tidal volume (6 mL/kg PBW) with target Pplat ≤ 30 cmH2O",
    "control": "Traditional tidal volume (12 mL/kg PBW) with target Pplat ≤ 50 cmH2O",
    "primaryOutcome": "All-cause in-hospital mortality before discharge home unassisted",
    "result": "Mortality: 31.0% in 6 mL/kg group vs 39.8% in 12 mL/kg group",
    "pValue": "P = 0.007",
    "clinicalTakeaway": "Lowering tidal volume to 6 mL/kg PBW and capping plateau pressure at 30 cmH2O yields an absolute 8.8% mortality reduction (22% relative reduction) in ARDS.",
    "examPoint": "NEET-SS HIGH YIELD: PBW must be calculated using height and sex, NOT actual body weight. Overweight ARDS patients ventilated to actual body weight suffer lethal volutrauma."
  },
  {
    "id": "trial-proseva",
    "domain": "ARDS",
    "name": "PROSEVA Trial",
    "year": 2013,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "PROSEVA Trial (NEJM 2013; 368:2159-2168)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1214103"
    },
    "population": "466 patients with severe ARDS (PaO2/FiO2 < 150 with PEEP ≥ 5 cmH2O, FiO2 ≥ 0.60)",
    "intervention": "Early prolonged prone positioning (minimum 16 consecutive hours/session)",
    "control": "Conventional supine positioning",
    "primaryOutcome": "28-day all-cause mortality",
    "result": "28-day mortality: 16.0% in prone group vs 32.8% in supine group (Hazard Ratio 0.39)",
    "pValue": "P < 0.001",
    "clinicalTakeaway": "Early prone positioning for at least 16 hours daily dramatically cuts mortality in half in severe ARDS (NNT = 6).",
    "examPoint": "NEET-SS HIGH YIELD: Prone positioning improves ventilation-perfusion matching by unloading dorsal lung segments, improving transpulmonary pressure homogeneity, and reducing right ventricular afterload."
  },
  {
    "id": "trial-rose-petal",
    "domain": "ARDS",
    "name": "ROSE Trial (PETAL Network)",
    "year": 2019,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "ROSE Trial (NEJM 2019; 380:1997-2008)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1901686"
    },
    "population": "1006 moderate-to-severe ARDS patients (PaO2/FiO2 < 150)",
    "intervention": "Early continuous 48-hour Cisatracurium infusion + heavy sedation",
    "control": "Usual-care sedation strategy targeting light sedation without routine paralysis",
    "primaryOutcome": "90-day in-hospital mortality",
    "result": "90-day mortality: 42.5% in intervention vs 42.8% in control arm",
    "pValue": "P = 0.93",
    "clinicalTakeaway": "Routine early neuromuscular blockade infusion in ARDS managed with lighter sedation yields no survival benefit over as-needed paralysis.",
    "examPoint": "NEET-SS HIGH YIELD: Reconciled with ACURASYS (2010): Continuous paralysis is NOT routinely indicated in all moderate-severe ARDS; reserve for severe patient-ventilator dyssynchrony, refractory hypoxemia, or elevated driving pressures."
  },
  {
    "id": "trial-smart",
    "domain": "Sepsis & Fluids",
    "name": "SMART Trial",
    "year": 2018,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "SMART Trial (NEJM 2018; 378:829-839)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1711584"
    },
    "population": "15,802 critically ill adults admitted to intensive care",
    "intervention": "Balanced crystalloids (Plasma-Lyte A or Ringer's Lactate)",
    "control": "Saline (0.9% sodium chloride)",
    "primaryOutcome": "Major Adverse Kidney Events within 30 days (MAKE30: death, new RRT, persistent renal dysfunction)",
    "result": "MAKE30: 14.3% in balanced group vs 15.4% in saline group (Odds Ratio 0.90)",
    "pValue": "P = 0.04 (in septic subgroup P = 0.01 with lower 30-day mortality)",
    "clinicalTakeaway": "Balanced crystalloids significantly reduce major adverse kidney events and mortality compared to 0.9% saline in critically ill patients, especially in sepsis.",
    "examPoint": "NEET-SS HIGH YIELD: High-volume 0.9% normal saline causes hyperchloremic metabolic acidosis, renal afferent vasoconstriction, and decreases GFR."
  },
  {
    "id": "trial-adrenal",
    "domain": "Sepsis",
    "name": "ADRENAL Trial",
    "year": 2018,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "ADRENAL Trial (NEJM 2018; 378:797-808)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1705835"
    },
    "population": "3800 patients with septic shock requiring ongoing vasopressor support for ≥ 4 hours",
    "intervention": "Hydrocortisone 200 mg/day continuous infusion for 7 days or until shock resolved",
    "control": "Matching placebo infusion",
    "primaryOutcome": "90-day all-cause mortality",
    "result": "90-day mortality: 27.9% hydrocortisone vs 28.8% placebo (Odds Ratio 0.95)",
    "pValue": "P = 0.50",
    "clinicalTakeaway": "Low-dose hydrocortisone does not reduce 90-day mortality in septic shock, but significantly accelerates shock resolution (median 3 days vs 4 days, P < 0.001) and reduces ventilator days.",
    "examPoint": "NEET-SS HIGH YIELD: SSC 2026 recommends IV corticosteroids for adults with septic shock and an ongoing requirement for vasopressor therapy (≥ 0.25 mcg/kg/min of norepinephrine for ≥ 4 hours)."
  },
  {
    "id": "trial-starrt-aki",
    "domain": "Renal & CRRT",
    "name": "STARRT-AKI Trial",
    "year": 2020,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "STARRT-AKI Trial (NEJM 2020; 383:240-251)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa2000741"
    },
    "population": "3011 critically ill patients with severe AKI (KDIGO stage 2 or 3)",
    "intervention": "Accelerated strategy (immediate RRT initiation within 12 hours)",
    "control": "Standard strategy (delayed RRT until urgent classical indications arose or persistence ≥ 72h)",
    "primaryOutcome": "90-day all-cause mortality",
    "result": "90-day mortality: 43.9% in accelerated vs 43.7% in standard group",
    "pValue": "P = 0.92",
    "clinicalTakeaway": "Accelerated RRT initiation does not improve survival and leads to higher rates of persistent dialysis dependence (10.4% vs 6.0%, P = 0.006) and adverse events.",
    "examPoint": "NEET-SS HIGH YIELD: Standard indications for emergent RRT remain the AEIOU rule: Acidosis (refractory pH < 7.15), Electrolytes (refractory K > 6.5 mEq/L), Ingestion/toxins, Overload (fluid overload refractory to diuretics), Uremia (pericarditis, encephalopathy)."
  },
  {
    "id": "trial-ttm2",
    "domain": "Cardiac Arrest",
    "name": "TTM-2 Trial",
    "year": 2021,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "TTM-2 Trial (NEJM 2021; 384:2283-2294)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa2100591"
    },
    "population": "1900 comatose adult survivors of out-of-hospital cardiac arrest (OHCA)",
    "intervention": "Targeted hypothermia at 33°C for 28 hours followed by controlled rewarming",
    "control": "Targeted normothermia with early treatment of fever (temperature ≥ 37.8°C triggered active cooling to 37.5°C)",
    "primaryOutcome": "All-cause mortality at 6 months",
    "result": "6-month mortality: 50% in 33°C group vs 48% in normothermia group (Relative Risk 1.04)",
    "pValue": "P = 0.37",
    "clinicalTakeaway": "Hypothermia at 33°C does not improve survival or functional neurological outcome compared with targeted normothermia with strict fever prevention.",
    "examPoint": "NEET-SS HIGH YIELD: Current post-cardiac arrest guidelines recommend active temperature control to prevent fever (maintaining 36.0–37.5°C) for at least 72 hours."
  },
  {
    "id": "trial-tricc",
    "domain": "Hematology & Transfusion",
    "name": "TRICC Trial",
    "year": 1999,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "TRICC Trial (NEJM 1999; 340:409-417)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJM199902113400601"
    },
    "population": "838 critically ill patients with normovolemic anemia",
    "intervention": "Restrictive transfusion trigger (Hb < 7.0 g/dL, maintained at 7.0–9.0 g/dL)",
    "control": "Liberal transfusion trigger (Hb < 10.0 g/dL, maintained at 10.0–12.0 g/dL)",
    "primaryOutcome": "30-day all-cause mortality",
    "result": "30-day mortality: 18.7% restrictive vs 23.3% liberal (P = 0.11; in patients aged < 55 years, restrictive mortality was significantly lower 5.7% vs 13.0%, P = 0.02)",
    "pValue": "P = 0.11",
    "clinicalTakeaway": "A restrictive transfusion strategy (trigger Hb < 7.0 g/dL) is safe, reduces blood exposure by > 50%, and is superior in younger and less severely ill patients.",
    "examPoint": "NEET-SS HIGH YIELD: General ICU transfusion trigger is strictly Hb < 7.0 g/dL. Exceptions: acute coronary syndrome / myocardial ischemia (target Hb ≥ 8.0–9.0 g/dL, REALITY & MINT trials)."
  },
  {
    "id": "trial-eolia",
    "domain": "ECMO",
    "name": "EOLIA Trial",
    "year": 2018,
    "journal": "New England Journal of Medicine (NEJM)",
    "hyperlinkedReference": {
      "label": "EOLIA Trial (NEJM 2018; 378:1965-1975)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1800385"
    },
    "population": "249 severe ARDS patients (P/F < 50 for > 3h, or P/F < 80 for > 6h, or arterial pH < 7.15 with PaCO2 ≥ 60 for > 6h)",
    "intervention": "Immediate early Veno-Venous (VV) ECMO",
    "control": "Continued lung-protective mechanical ventilation with rescue ECMO allowed",
    "primaryOutcome": "60-day all-cause mortality",
    "result": "60-day mortality: 35% in early ECMO arm vs 46% in conventional arm (Relative Risk 0.76; P = 0.09). 28% of conventional arm crossed over to rescue ECMO due to refractory hypoxemia.",
    "pValue": "P = 0.09 (Bayesian post-hoc analysis showed 91% posterior probability of ECMO superiority)",
    "clinicalTakeaway": "Early VV-ECMO in severe refractory ARDS provides clinically meaningful mortality reduction (11% absolute risk reduction), though confounded by rescue cross-over.",
    "examPoint": "NEET-SS HIGH YIELD: EOLIA criteria define contemporary international indications for VV-ECMO in refractory ARDS."
  }
],
    guidelines: [
  {
    "id": "g-ssc-2026",
    "society": "Surviving Sepsis Campaign (SCCM & ESICM)",
    "title": "Surviving Sepsis Campaign: International Guidelines for Management of Sepsis and Septic Shock",
    "year": 2026,
    "url": "https://www.sccm.org/SurvivingSepsisCampaign/Guidelines",
    "level": "International Multidisciplinary Consensus",
    "keyRecommendations": [
      "Initial resuscitation: ≥ 30 mL/kg balanced crystalloids within first 3 hours of sepsis-induced hypoperfusion (Weak recommendation, low quality evidence; dynamically re-evaluate for fluid overload).",
      "Vasopressors: Norepinephrine is the first-line vasopressor (Target MAP ≥ 65 mmHg). Vasopressin (fixed 0.03 units/min) is the preferred second-line agent when norepinephrine dose is escalating (0.25–0.5 mcg/kg/min).",
      "Peripheral vasopressors: Strongly endorsed to start norepinephrine peripherally in a vein at or proximal to the antecubital fossa to avoid resuscitation delays while central line is placed.",
      "Antimicrobials: Administer IV antimicrobials immediately (ideally within 1 hour) for septic shock; within 3 hours for sepsis without shock if infection is confirmed.",
      "Corticosteroids: IV Hydrocortisone (200 mg/day continuous infusion) recommended for septic shock refractory to ongoing vasopressor requirement (≥ 4 hours).",
      "Vitamin C: Strongly advised AGAINST IV vitamin C for sepsis or septic shock based on LOVIT, VICTAS, and ACTS trial evidence."
    ]
  },
  {
    "id": "g-kdigo-aki",
    "society": "Kidney Disease: Improving Global Outcomes (KDIGO)",
    "title": "KDIGO Clinical Practice Guideline for Acute Kidney Injury",
    "year": 2024,
    "url": "https://kdigo.org/guidelines/acute-kidney-injury/",
    "level": "Global Clinical Practice Guideline",
    "keyRecommendations": [
      "Staging: Combine serum creatinine rise with duration of hourly oliguria/anuria.",
      "Fluids: Use balanced crystalloids rather than 0.9% normal saline for AKI prevention and volume resuscitation.",
      "Timing of Dialysis: Avoid routine accelerated or prophylactic RRT initiation in the absence of urgent classical triggers (severe hyperkalemia, refractory metabolic acidosis, pulmonary edema).",
      "Anticoagulation in CRRT: Regional Citrate Anticoagulation (RCA) is recommended over systemic heparin as first-line for CRRT in patients without contraindications."
    ]
  },
  {
    "id": "g-btf-tbi",
    "society": "Brain Trauma Foundation (BTF)",
    "title": "Guidelines for the Management of Severe Traumatic Brain Injury (4th Edition Update)",
    "year": 2025,
    "url": "https://braintrauma.org/guidelines/guidelines-for-the-management-of-severe-tbi-4th-ed",
    "level": "Evidence-Based Consensus Guideline",
    "keyRecommendations": [
      "ICP Threshold: Treatment should be initiated for intracranial pressure (ICP) > 22 mmHg.",
      "CPP Target: Maintain Cerebral Perfusion Pressure (CPP) strictly between 60 and 70 mmHg. Avoid aggressive attempts to push CPP > 70 mmHg.",
      "Blood Pressure: Maintain Systolic Blood Pressure (SBP) ≥ 100 mmHg for patients aged 50–69 years, or SBP ≥ 110 mmHg for patients aged 15–49 or > 70 years.",
      "Hyperventilation: Prophylactic severe hyperventilation (PaCO2 < 25 mmHg) is strongly contraindicated due to cerebral ischemia."
    ]
  },
  {
    "id": "g-aha-erc-cpr",
    "society": "American Heart Association (AHA) & European Resuscitation Council (ERC)",
    "title": "International Consensus on CPR and Emergency Cardiovascular Care Science",
    "year": 2025,
    "url": "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines",
    "level": "ILCOR International Consensus",
    "keyRecommendations": [
      "Compression Quality: Rate 100–120 cpm, depth 5–6 cm (2–2.4 inches), complete chest recoil, pause minimization.",
      "Capnography: Continuous waveform capnography recommended to confirm tube placement, monitor CPR quality (ETCO2 < 10 mmHg indicates poor compressions), and identify ROSC.",
      "Targeted Temperature Management (TTM): Actively prevent fever (temperature ≥ 37.8°C) targeting 36.0–37.5°C for at least 72 hours post-ROSC in comatose patients.",
      "Neuroprognostication: Multimodal neuroprognostication should be delayed until at least 72 hours post-ROSC after excluding confounders (hypothermia, residual sedation)."
    ]
  },
  {
    "id": "g-elso-ecmo",
    "society": "Extracorporeal Life Support Organization (ELSO)",
    "title": "ELSO Guidelines for Adult Respiratory and Cardiac Extracorporeal Life Support",
    "year": 2025,
    "url": "https://www.elso.org/resources/guidelines.aspx",
    "level": "International ELSO Consensus",
    "keyRecommendations": [
      "VV-ECMO in ARDS: Consider when PaO2/FiO2 < 80 for > 6 hours or PaO2/FiO2 < 50 for > 3 hours despite optimal lung-protective ventilation and prone positioning.",
      "Ultra-Protective Ventilation: During VV-ECMO, reduce tidal volume to 2–3 mL/kg PBW, cap Pplat < 25 cmH2O, and keep driving pressure < 10 cmH2O.",
      "VA-ECMO Limb Perfusion: A distal perfusion catheter (DPC) must be placed at the time of femoral arterial cannulation to prevent severe lower extremity ischemia.",
      "ECPR: Implement structured ECPR systems with strict inclusion criteria (witnessed arrest, bystander CPR, < 60 min to cannulation)."
    ]
  },
  {
    "id": "g-sccm-padis",
    "society": "Society of Critical Care Medicine (SCCM)",
    "title": "Clinical Practice Guidelines for the Prevention and Management of Pain, Agitation/Sedation, Delirium, Immobility, and Sleep Disruption (PADIS)",
    "year": 2024,
    "url": "https://www.sccm.org/Clinical-Resources/Guidelines/Guidelines/PADIS-Guidelines",
    "level": "Clinical Practice Guideline",
    "keyRecommendations": [
      "Analgosedation: Prioritize pain control before or instead of sedative administration (analgesia-first sedation).",
      "Non-Benzodiazepine Sedation: Use propofol or dexmedetomidine over benzodiazepines (midazolam) for sedation in mechanically ventilated adults.",
      "Delirium Screening: Routine monitoring of delirium using validated tools (CAM-ICU or ICDSC) at least once per nursing shift.",
      "Early Mobility: Implement early rehabilitation and mobilization protocols as part of the ABCDEF bundle."
    ]
  }
],
    mcqs: [
  {
    "id": "mcq-cc-001",
    "chapterId": 9,
    "question": "A 58-year-old male with severe secondary ARDS is mechanically ventilated on Volume Control mode: Tidal Volume 420 mL (6 mL/kg PBW), PEEP 14 cmH2O, FiO2 0.70. On inspiratory pause, the plateau pressure is measured at 31 cmH2O. According to landmark clinical trials (Amato et al. and ARDSNet), what is the calculated driving pressure, and what is the optimal immediate ventilator adjustment?",
    "options": [
      "A. Driving pressure is 14 cmH2O; increase tidal volume to 480 mL to improve PaO2",
      "B. Driving pressure is 17 cmH2O; reduce tidal volume to lower driving pressure ≤ 14 cmH2O",
      "C. Driving pressure is 31 cmH2O; decrease PEEP to 8 cmH2O",
      "D. Driving pressure is 17 cmH2O; increase PEEP to 20 cmH2O without altering tidal volume"
    ],
    "answer": "B",
    "explanation": "Driving pressure (ΔP) is calculated as Plateau Pressure minus PEEP (Pplat - PEEP). Here, ΔP = 31 - 14 = 17 cmH2O. Landmark trials by Amato et al. (NEJM 2015) demonstrated that driving pressure > 14-15 cmH2O is strongly and independently associated with increased mortality in ARDS. When driving pressure exceeds 14 cmH2O, the tidal volume should be reduced (e.g. by 1 mL/kg PBW down to 5 or 4 mL/kg PBW) to de-escalate volutrauma and stress on the functional baby lung.",
    "whyWrong": {
      "A": "Driving pressure is 17 cmH2O (31 - 14), not 14. Increasing tidal volume would further increase plateau and driving pressure.",
      "C": "31 cmH2O is the plateau pressure, not driving pressure.",
      "D": "Increasing PEEP to 20 cmH2O without changing tidal volume would increase plateau pressure and could worsen hyperinflation unless compliance dramatically improves."
    },
    "examPearl": "NEET-SS EXAM PEARL: Driving pressure (Pplat - PEEP) is the single ventilator parameter that best correlates with survival in ARDS. Target ΔP ≤ 14 cmH2O.",
    "hyperlinkedReference": {
      "label": "Amato et al. Driving Pressure and Survival in ARDS (NEJM 2015; 372:747-755)",
      "url": "https://www.nejm.org/doi/full/10.1056/NEJMoa1410639"
    }
  },
  {
    "id": "mcq-cc-002",
    "chapterId": 5,
    "question": "A 65-year-old female presents with septic shock secondary to acute pyelonephritis. After receiving 30 mL/kg of balanced crystalloids over 2 hours, her MAP is 54 mmHg and serum lactate is 4.2 mmol/L. Central venous access is being established. According to the 2026 Surviving Sepsis Campaign guidelines, which of the following represents the recommended initial vasoactive management?",
    "options": [
      "A. Delay vasopressor initiation until central venous catheter placement is confirmed by post-procedure radiograph",
      "B. Start Dopamine infusion at 10 mcg/kg/min through a peripheral line",
      "C. Initiate Norepinephrine via an antecubital peripheral vein immediately to restore MAP ≥ 65 mmHg without waiting for central access",
      "D. Infuse 500 mL of 20% Albumin as a rapid bolus before starting any vasoactive agents"
    ],
    "answer": "C",
    "explanation": "The 2026 Surviving Sepsis Campaign guidelines strongly emphasize avoiding delays in vasopressor initiation. Norepinephrine is the first-line vasopressor (target MAP ≥ 65 mmHg). In patients with persistent hypotension, starting norepinephrine peripherally (in a vein at or proximal to the antecubital fossa) is safe for short durations (< 24-48 hours) while central access is being established, significantly reducing time to achieve target MAP and mortality.",
    "whyWrong": {
      "A": "Delaying vasopressor initiation while awaiting central line placement prolongs tissue hypoperfusion and increases mortality (SOAP trial).",
      "B": "Dopamine is associated with significantly higher tachyarrhythmias and excess mortality in septic shock compared to norepinephrine (SOAP II trial).",
      "D": "Additional fluid boluses should not delay vasopressor initiation in refractory hypotension once the 30 mL/kg threshold is reached."
    },
    "examPearl": "NEET-SS EXAM PEARL: Norepinephrine is first-line in septic shock. Vasopressin (0.03 units/min) is the preferred second-line adjunct when norepinephrine requirements reach 0.25–0.5 mcg/kg/min.",
    "hyperlinkedReference": {
      "label": "Surviving Sepsis Campaign 2026 Guidelines",
      "url": "https://www.sccm.org/SurvivingSepsisCampaign/Guidelines"
    }
  },
  {
    "id": "mcq-cc-003",
    "chapterId": 13,
    "question": "A 62-year-old critically ill patient with septic shock and multiorgan failure is receiving Continuous Veno-Venous Hemodiafiltration (CVVHDF) with Regional Citrate Anticoagulation (RCA). On routine laboratory monitoring, the systemic total serum calcium is 11.2 mg/dL (2.80 mmol/L) and systemic ionized calcium is 3.6 mg/dL (0.90 mmol/L). What is the total-to-ionized calcium ratio, and what complication does this indicate?",
    "options": [
      "A. Ratio is 1.8; indicates normal citrate metabolism and adequate anticoagulation",
      "B. Ratio is 3.1; indicates Citrate Accumulation ('Citrate Lock') due to impaired hepatic metabolism",
      "C. Ratio is 0.32; indicates acute hypercalcemic crisis requiring immediate furosemide",
      "D. Ratio is 2.2; indicates citrate under-dosing and impending filter clotting"
    ],
    "answer": "B",
    "explanation": "In Regional Citrate Anticoagulation, citrate chelates calcium to inhibit the coagulation cascade. When citrate accumulates (most commonly due to severe hepatic dysfunction, shock, or severe hypoperfusion preventing citrate conversion to bicarbonate in the liver/mitochondria), circulating calcium-citrate complexes rise. This causes an elevated total serum calcium but low ionized calcium. The Total-to-Ionized Calcium Ratio = 11.2 mg/dL / 3.6 mg/dL = 3.11 (or 2.80 mmol/L / 0.90 mmol/L = 3.11). A ratio > 2.5 is pathognomonic for Citrate Accumulation ('Citrate Lock'). Management: immediately reduce or stop citrate infusion, increase dialysate clearance, and maintain IV calcium supplementation.",
    "whyWrong": {
      "A": "A ratio of 1.8 is normal; here the ratio is 3.11.",
      "C": "The patient actually has ionized hypocalcemia despite high total calcium because the calcium is bound to accumulated citrate.",
      "D": "A ratio > 2.5 indicates citrate intoxication/accumulation, not under-dosing."
    },
    "examPearl": "NEET-SS EXAM PEARL: Citrate accumulation presents with: (1) Total-to-ionized calcium ratio > 2.5, (2) Worsening metabolic acidosis with elevated anion gap, (3) Rising requirement for systemic calcium substitution.",
    "hyperlinkedReference": {
      "label": "KDIGO Clinical Practice Guideline for AKI",
      "url": "https://kdigo.org/guidelines/acute-kidney-injury/"
    }
  }
]
  };

  window.CRITICAL_CARE_DATA = CC_DATA;

  function esc(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, function(m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function initCriticalCareCurriculum(mountId) {
    const root = document.getElementById(mountId);
    if (!root) return;

    let activeTab = 'chapters'; // 'chapters' | 'topics' | 'formulas' | 'trials' | 'guidelines' | 'mcqs'
    let searchQuery = '';
    let selectedChapterId = null;

    function render() {
      root.innerHTML = `
        <div class="cc-curriculum-container">
          <!-- Header Hub Banner -->
          <div class="cc-curriculum-banner">
            <div class="cc-banner-badge">
              <span class="cc-badge-pulse"></span>
              <span>NEET-SS CRITICAL CARE MASTER CURRICULUM</span>
            </div>
            <h2 class="cc-banner-title">Complete 31-Chapter Curriculum &amp; 88-Topic Course Map</h2>
            <p class="cc-banner-desc">
              Comprehensive exam-oriented syllabus dividing all 88 core topics into 31 deliberate chapters. 
              Featuring high-yield formulas with hyperlinked primary references, landmark trials, 2026 Surviving Sepsis Campaign updates, and clinical pearls.
            </p>

            <!-- Search Bar -->
            <div class="cc-search-wrap">
              <span class="cc-search-icon">🔍</span>
              <input type="search" class="cc-search-input" id="${mountId}_search" placeholder="Search chapters, topics, trials (PROSEVA, SMART), formulas (MAP, P/F, ROX), or cutoffs..." value="${esc(searchQuery)}">
              ${searchQuery ? `<button type="button" class="cc-search-clear" id="${mountId}_clear">✕</button>` : ''}
            </div>

            <!-- View Switcher Tabs -->
            <div class="cc-nav-tabs" role="tablist">
              <button type="button" class="cc-nav-tab ${activeTab === 'chapters' ? 'active' : ''}" data-tab="chapters">
                <span>📚 31 Master Chapters</span>
                <span class="cc-tab-count">${CC_DATA.chapters.length}</span>
              </button>
              <button type="button" class="cc-nav-tab ${activeTab === 'topics' ? 'active' : ''}" data-tab="topics">
                <span>🎯 88 Source Topics</span>
                <span class="cc-tab-count">${CC_DATA.topics.length}</span>
              </button>
              <button type="button" class="cc-nav-tab ${activeTab === 'formulas' ? 'active' : ''}" data-tab="formulas">
                <span>🧮 Formulas &amp; Cutoffs</span>
                <span class="cc-tab-count">${CC_DATA.formulas.length}</span>
              </button>
              <button type="button" class="cc-nav-tab ${activeTab === 'trials' ? 'active' : ''}" data-tab="trials">
                <span>🏆 Landmark Trials</span>
                <span class="cc-tab-count">${CC_DATA.trials.length}</span>
              </button>
              <button type="button" class="cc-nav-tab ${activeTab === 'guidelines' ? 'active' : ''}" data-tab="guidelines">
                <span>📜 2026 Guidelines</span>
                <span class="cc-tab-count">${CC_DATA.guidelines.length}</span>
              </button>
              <button type="button" class="cc-nav-tab ${activeTab === 'mcqs' ? 'active' : ''}" data-tab="mcqs">
                <span>📝 Practice MCQs</span>
                <span class="cc-tab-count">${CC_DATA.mcqs.length}</span>
              </button>
            </div>
          </div>

          <!-- Tab Content Area -->
          <div class="cc-content-viewport">
            ${renderActiveTab()}
          </div>
        </div>
      `;

      wireEvents();
    }

    function renderActiveTab() {
      const q = searchQuery.toLowerCase().trim();

      if (activeTab === 'chapters') {
        const filtered = CC_DATA.chapters.filter(ch => 
          !q || ch.title.toLowerCase().includes(q) || ch.description.toLowerCase().includes(q)
        );
        return `
          <div class="cc-chapters-grid">
            ${filtered.map(ch => {
              const subs = CC_DATA.subchapters.filter(s => s.chapterId === ch.id);
              const chTopics = CC_DATA.topics.filter(t => t.chapterId === ch.id);
              return `
                <div class="cc-chapter-card">
                  <div class="cc-chapter-header">
                    <span class="cc-ch-icon">${ch.icon}</span>
                    <div class="cc-ch-title-wrap">
                      <span class="cc-ch-num">CHAPTER ${String(ch.id).padStart(2, '0')}</span>
                      <h3 class="cc-ch-title">${esc(ch.title)}</h3>
                    </div>
                  </div>
                  <div class="cc-ch-weight-badge">${esc(ch.examWeight)}</div>
                  <p class="cc-ch-desc">${esc(ch.description)}</p>
                  
                  <div class="cc-subchapters-list">
                    <h4>Subchapters &amp; Curriculum Breakdown (${subs.length}):</h4>
                    <ul>
                      ${subs.map(s => `
                        <li>
                          <span class="cc-sub-id">${s.id}</span>
                          <span class="cc-sub-title">${esc(s.title)}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>

                  ${chTopics.length > 0 ? `
                    <div class="cc-mapped-topics">
                      <span class="cc-mapped-label">Mapped Core Topics (${chTopics.length}):</span>
                      <div class="cc-topic-pills">
                        ${chTopics.map(t => `
                          <span class="cc-topic-pill" title="${esc(t.sourceDuration)}">#${t.sourceIndex} ${esc(t.title)}</span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      if (activeTab === 'topics') {
        const filtered = CC_DATA.topics.filter(t => 
          !q || t.title.toLowerCase().includes(q) || t.sourceCategory.toLowerCase().includes(q)
        );
        return `
          <div class="cc-topics-table-wrap" tabindex="0" role="region" aria-label="88 Source Topics Inventory">
            <table class="cc-topics-table">
              <thead>
                <tr>
                  <th style="width:60px;">#</th>
                  <th>Topic Title (User Source)</th>
                  <th>App Module / Category</th>
                  <th>Chapter Assignment</th>
                  <th style="width:85px;">Duration</th>
                  <th style="width:75px;">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(t => {
                  const ch = CC_DATA.chapters.find(c => c.id === t.chapterId);
                  return `
                    <tr>
                      <td class="cc-td-num"><strong>${t.sourceIndex}</strong></td>
                      <td>
                        <div class="cc-topic-name"><strong>${esc(t.title)}</strong></div>
                        <div class="cc-topic-sub">Subchapter: ${t.subchapterId}</div>
                      </td>
                      <td><span class="cc-cat-badge">${esc(t.sourceCategory)}</span></td>
                      <td>
                        <span class="cc-ch-link">Ch ${t.chapterId}: ${ch ? esc(ch.title) : ''}</span>
                      </td>
                      <td class="cc-td-dur">⏱ ${esc(t.sourceDuration)}</td>
                      <td><span class="cc-priority-pill ${t.priority.toLowerCase()}">${t.priority}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (activeTab === 'formulas') {
        const filtered = CC_DATA.formulas.filter(f => 
          !q || f.title.toLowerCase().includes(q) || f.interpretation.toLowerCase().includes(q) || f.examTrap.toLowerCase().includes(q)
        );
        return `
          <div class="cc-formulas-grid">
            ${filtered.map(f => `
              <div class="cc-formula-card">
                <div class="cc-formula-header">
                  <h3 class="cc-formula-title">${esc(f.title)}</h3>
                  <span class="cc-formula-units">Units: ${esc(f.units)}</span>
                </div>
                <div class="cc-formula-equation">
                  <code>${esc(f.equation)}</code>
                </div>
                <div class="cc-formula-meta">
                  <div class="cc-meta-row">
                    <strong>Normal / Target:</strong> <span>${esc(f.normalRange)}</span>
                  </div>
                  ${f.hyperlinkedReference ? `
                    <div class="cc-meta-row">
                      <strong>Reference:</strong>
                      <a href="${esc(f.hyperlinkedReference.url)}" target="_blank" rel="noopener noreferrer" class="cc-ref-link">
                        ${esc(f.hyperlinkedReference.label)} ↗
                      </a>
                    </div>
                  ` : ''}
                </div>
                <p class="cc-formula-interp"><strong>Clinical Concept:</strong> ${esc(f.interpretation)}</p>
                <div class="cc-worked-example">
                  <strong>💡 Worked Clinical Example:</strong> ${esc(f.workedExample)}
                </div>
                <div class="cc-exam-trap">
                  <strong>⚠️ ${esc(f.examTrap)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (activeTab === 'trials') {
        const filtered = CC_DATA.trials.filter(tr => 
          !q || tr.name.toLowerCase().includes(q) || tr.domain.toLowerCase().includes(q) || tr.examPoint.toLowerCase().includes(q)
        );
        return `
          <div class="cc-trials-grid">
            ${filtered.map(tr => `
              <div class="cc-trial-card">
                <div class="cc-trial-top">
                  <span class="cc-trial-domain">${esc(tr.domain)}</span>
                  <span class="cc-trial-year">${tr.year}</span>
                </div>
                <h3 class="cc-trial-name">${esc(tr.name)}</h3>
                <div class="cc-trial-journal">${esc(tr.journal)}</div>
                
                ${tr.hyperlinkedReference ? `
                  <div style="margin: 8px 0 12px 0;">
                    <a href="${esc(tr.hyperlinkedReference.url)}" target="_blank" rel="noopener noreferrer" class="cc-ref-link">
                      📄 View Original Landmark Publication ↗
                    </a>
                  </div>
                ` : ''}

                <div class="cc-trial-detail-box">
                  <div><strong>Population:</strong> ${esc(tr.population)}</div>
                  <div><strong>Intervention vs Control:</strong> ${esc(tr.intervention)} <em>vs</em> ${esc(tr.control)}</div>
                  <div><strong>Primary Outcome &amp; Result:</strong> ${esc(tr.result)} (<span class="cc-pvalue">${esc(tr.pValue)}</span>)</div>
                </div>

                <div class="cc-takeaway-box">
                  <strong>Clinical Practice Takeaway:</strong> ${esc(tr.clinicalTakeaway)}
                </div>

                <div class="cc-mcq-point-box">
                  <strong>🎯 ${esc(tr.examPoint)}</strong>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (activeTab === 'guidelines') {
        return `
          <div class="cc-guidelines-grid">
            ${CC_DATA.guidelines.map(g => `
              <div class="cc-guideline-card">
                <div class="cc-g-header">
                  <span class="cc-g-society">${esc(g.society)}</span>
                  <span class="cc-g-year">[${g.year} UPDATE]</span>
                </div>
                <h3 class="cc-g-title">${esc(g.title)}</h3>
                
                ${g.url ? `
                  <div style="margin: 6px 0 14px 0;">
                    <a href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" class="cc-ref-link">
                      🔗 Official Society Practice Guideline Portal ↗
                    </a>
                  </div>
                ` : ''}

                <div class="cc-g-recs">
                  <h4>Core Recommendations &amp; Practice Shifts:</h4>
                  <ul>
                    ${g.keyRecommendations.map(r => `
                      <li>${esc(r)}</li>
                    `).join('')}
                  </ul>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }

      if (activeTab === 'mcqs') {
        return `
          <div class="cc-mcq-platform-hero" style="background:linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%); border:1px solid rgba(56, 189, 248, 0.3); border-radius:18px; padding:24px; margin-bottom:24px; box-shadow:0 8px 30px rgba(0,0,0,0.3); display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
              <div>
                <span style="display:inline-block; font-size:11px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:#38bdf8; background:rgba(56,189,248,0.12); padding:4px 10px; border-radius:999px; margin-bottom:8px; border:1px solid rgba(56,189,248,0.3);">⚡ NEET-SS / INI-SS CRITICAL CARE MASTER BANK</span>
                <h3 style="margin:0 0 6px 0; font-size:22px; font-weight:800; color:#f8fafc;">Full-Page Practice &amp; Examination Engine</h3>
                <p style="margin:0; font-size:14px; color:#94a3b8; max-width:640px; line-height:1.5;">Practice all 505+ verified chapter-wise MCQs, build timed custom exams with zero duplicate questions, analyze performance diagnostics, and review detailed why-wrong rationales.</p>
              </div>
              <div style="display:flex; gap:10px; flex-wrap:wrap;">
                <button type="button" class="kn-launch-mcq-engine" data-view="directory" style="padding:10px 18px; background:linear-gradient(135deg, #0284c7, #0ea5e9); color:#fff; border:none; border-radius:10px; font-size:13px; font-weight:750; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3); display:flex; align-items:center; gap:6px;">
                  <span>🚀 Launch MCQ Platform</span>
                </button>
                <button type="button" class="kn-launch-mcq-engine" data-view="builder" style="padding:10px 18px; background:rgba(255,255,255,0.08); color:#f8fafc; border:1px solid rgba(255,255,255,0.18); border-radius:10px; font-size:13px; font-weight:750; cursor:pointer; display:flex; align-items:center; gap:6px;">
                  <span>⚡ Custom Test Builder</span>
                </button>
              </div>
            </div>
          </div>
          <div class="cc-mcqs-grid">
            ${CC_DATA.mcqs.map((m, idx) => `
              <div class="cc-mcq-card">
                <div class="cc-mcq-head">
                  <span class="cc-mcq-badge">NEET-SS PRACTICE QUESTION #${idx + 1}</span>
                  <span class="cc-mcq-ch">Chapter ${m.chapterId}</span>
                </div>
                <p class="cc-mcq-q">${esc(m.question)}</p>
                <div class="cc-mcq-options">
                  ${m.options.map(opt => `
                    <div class="cc-mcq-option">${esc(opt)}</div>
                  `).join('')}
                </div>
                <details class="kn-active-recall" style="margin-top:14px;">
                  <summary class="kn-recall-summary">
                    <span class="kn-summary-text">💡 Reveal Answer &amp; Examination Points</span>
                  </summary>
                  <div class="answer" style="display:block; margin-top:12px;">
                    <div style="font-weight:800; color:var(--accent-emerald, #10b981); margin-bottom:8px;">
                      CORRECT OPTION: ${m.answer}
                    </div>
                    <p>${esc(m.explanation)}</p>
                    <div class="cc-mcq-pearl" style="margin-top:10px; padding:10px; background:rgba(56,189,248,0.1); border-left:3px solid var(--accent-cyan); border-radius:4px;">
                      ${esc(m.examPearl)}
                    </div>
                    ${m.hyperlinkedReference ? `
                      <div style="margin-top:10px;">
                        <a href="${esc(m.hyperlinkedReference.url)}" target="_blank" rel="noopener noreferrer" class="cc-ref-link">
                          Reference: ${esc(m.hyperlinkedReference.label)} ↗
                        </a>
                      </div>
                    ` : ''}
                  </div>
                </details>
              </div>
            `).join('')}
          </div>
        `;
      }

      return '';
    }

    function wireEvents() {
      // Tab switcher
      root.querySelectorAll('.cc-nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          activeTab = btn.dataset.tab;
          render();
        });
      });

      // Search
      const searchInput = document.getElementById(`${mountId}_search`);
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          searchQuery = e.target.value;
          render();
          const nextInput = document.getElementById(`${mountId}_search`);
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(searchQuery.length, searchQuery.length);
          }
        });
      }

      // Search clear
      const clearBtn = document.getElementById(`${mountId}_clear`);
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchQuery = '';
          render();
        });
      }

      // Full-Page MCQ Platform launcher
      root.querySelectorAll('.kn-launch-mcq-engine').forEach(btn => {
        btn.addEventListener('click', () => {
          if (window.KN_MCQ && typeof window.KN_MCQ.open === 'function') {
            const vMode = btn.dataset.view || 'directory';
            window.KN_MCQ.open({ viewMode: vMode });
          }
        });
      });
    }

    render();
  }

  window.initCriticalCareCurriculum = initCriticalCareCurriculum;

  document.addEventListener('DOMContentLoaded', () => {
    initCriticalCareCurriculum('knCriticalCareCurriculum3d');
    initCriticalCareCurriculum('knCriticalCareCurriculum');
  });
})();
