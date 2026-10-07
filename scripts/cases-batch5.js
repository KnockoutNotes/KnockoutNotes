// ============================================================================
// BATCH 5: GENERAL, ENDOCRINE, HEPATORENAL & PEDIATRIC CASES (8 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), Stoelting's Co-Existing Disease (8th ed.).
// ============================================================================

module.exports = [
  // 1. CIRRHOSIS WITH PORTAL HYPERTENSION
  {
    id: "case-cirrhosis-portal-hypertension",
    cat: "case_general_subspecialty",
    name: "Cirrhosis with Portal Hypertension",
    short: "Cirrhosis & Portal HTN",
    tags: ["Hepatic", "Cirrhosis", "Portal Hypertension", "Child-Pugh", "MELD-Na", "TEG", "Ascites", "Case Discussion"],
    tagline: "Hyperdynamic state, low SVR, rebalanced hemostasis, MELD-Na scoring, encephalopathy avoidance & RSI",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 22; Miller's Anesthesia, 10th ed., Ch. 67; AASLD Practice Guidelines.",
    sections: [
      {
        h: "1. Definition, Child-Pugh Score & MELD-Na Classification",
        b: "• Definition: End-stage liver fibrosis with architectural distortion, regenerative nodules, and increased resistance to portal blood flow (hepatic venous pressure gradient > 5 mmHg; clinically significant > 10 mmHg).\n• Child-Turcotte-Pugh (CTP) Classification (Scored 1–3 each):\n  1. Bilirubin (mg/dL): < 2 (1 pt), 2–3 (2 pts), > 3 (3 pts) [PBC/PSC: < 4, 4–10, > 10].\n  2. Serum Albumin (g/dL): > 3.5 (1 pt), 2.8–3.5 (2 pts), < 2.8 (3 pts).\n  3. INR: < 1.7 (1 pt), 1.7–2.2 (2 pts), > 2.2 (3 pts).\n  4. Ascites: None (1 pt), Mild/controlled (2 pts), Moderate/refractory (3 pts).\n  5. Hepatic Encephalopathy: None (1 pt), Grade I–II (2 pts), Grade III–IV (3 pts).\n  - Class A (5–6 pts): Mild (perioperative mortality 10%).\n  - Class B (7–9 pts): Moderate (mortality 30–35%).\n  - Class C (10–15 pts): Severe (mortality > 70–80%; elective surgery contraindicated!).\n• MELD-Na Score: Incorporates Bilirubin, INR, Creatinine, and Sodium (MELD-Na > 15 predicts severe postoperative decompensation and 90-day mortality)."
      },
      {
        h: "2. Pathophysiology: Hyperdynamic Circulation & Rebalanced Hemostasis",
        b: "• Splanchnic Vasodilation & Hyperdynamic State:\n  - Portal hypertension stimulates excessive endothelial nitric oxide (NO) and prostacyclin release, causing intense splanchnic arterial vasodilation.\n  - Results in high cardiac output, very low SVR, decreased effective circulating arterial volume, and neurohumoral activation (RAAS, ADH, sympathetic overdrive).\n• Cirrhotic Cardiomyopathy: Blunted inotropic/chronotropic response to stress, prolonged QTc interval, and diastolic dysfunction.\n• Rebalanced Hemostasis (Lisman & Porte Concept):\n  - Both pro-coagulant factors (II, VII, IX, X, fibrinogen) AND natural anti-coagulants (Protein C, Protein S, Antithrombin III) are decreased in parallel.\n  - Elevated Factor VIII and Von Willebrand Factor (vWF).\n  - Conventional PT/INR overestimates bleeding risk; Viscoelastic testing (TEG / ROTEM) is mandatory to assess functional clot firmness!"
      },
      {
        h: "3. Preoperative Evaluation, Ascites & Encephalopathy Protocols",
        b: "• Bedside Clinical Examination:\n  - Stigmata of Chronic Liver Disease: Spider naevi, palmar erythema, caput medusae, jaundice, asterixis/flapping tremor.\n  - Fluid Status: Shifting dullness, fluid wave (tense ascites impairs diaphragmatic excursion, reducing FRC and predisposing to atelectasis).\n  - Neurological Grading: West Haven criteria for hepatic encephalopathy (Grade I forgetfulness to Grade IV coma).\n• Preoperative Ascites Management: Diagnostic paracentesis to rule out Spontaneous Bacterial Peritonitis (PMN > 250/mm³). Large-volume paracentesis (> 5 L) requires 6–8 g of IV albumin per liter removed to prevent Paracentesis-Induced Circulatory Dysfunction (PICD).\n• Encephalopathy Prophylaxis: Continue oral Lactulose (target 2–3 soft stools/day) and Rifaximin 550 mg BID; avoid sedatives, constipation, and hypokalemia."
      },
      {
        h: "4. Anesthetic Strategy: Induction, Airway & Drug Disposition",
        b: "• Technique: General Anesthesia with endotracheal intubation. Neuraxial blocks (Spinal/Epidural) are generally avoided due to coagulopathy, epidural hematoma risk, and refractory hypotension from profound sympathectomy.\n• Rapid Sequence Induction (RSI) Mandate: Full stomach status due to tense ascites and delayed gastric emptying; bleeding varices risk.\n• Induction Agents:\n  - ETOMIDATE (0.2–0.3 mg/kg) or PROPOFOL (reduced dose 1.0–1.5 mg/kg): Etomidate provides hemodynamic stability.\n  - KETAMINE: Preserves SVR but relies on hepatic clearance.\n• Neuromuscular Blockers:\n  - CISATRACURIUM (0.15–0.2 mg/kg): Drug of choice. Organ-independent Hofmann elimination and ester hydrolysis; unaffected by hepatic or renal failure.\n  - ROCURONIUM: Prolonged duration due to expanded volume of distribution and impaired biliary excretion; requires quantitative neuromuscular monitoring (TOF) and Sugammadex reversal."
      },
      {
        h: "5. Intraoperative Hemodynamics, Maintenance & Transfusion Triggers",
        b: "• Inhalational Anesthesia: ISOFLURANE or SEVOFLURANE (preserves hepatic artery buffer response better than halothane/enflurane). Maintain MAP > 65–70 mmHg to safeguard hepatic and renal perfusion.\n• Target Low Central Venous Pressure (CVP):\n  - Maintain low CVP (< 5–6 mmHg) during hepatic resection/dissection to dramatically reduce blood loss from hepatic veins and IVC.\n• TEG/ROTEM-Guided Transfusion Strategy:\n  - Avoid prophylactic FFP transfusion based on INR alone (causes volume overload and surges portal pressure, provoking catastrophic variceal bleeding!).\n  - Cryoprecipitate: Indicated if fibrinogen < 150 mg/dL or functional fibrinogen deficit on TEG.\n  - Platelet transfusion: Only if active bleeding and platelet count < 50,000 /mm³.\n  - Maintain Hemoglobin around 7–8 g/dL (higher hematocrit increases portal vascular resistance)."
      },
      {
        h: "6. Postoperative Concerns, Hepatorenal Syndrome & Exam Pearls",
        b: "• Hepatorenal Syndrome (HRS-AKI): Functional renal failure with intense renal vasoconstriction in response to splanchnic pooling. Diagnostic criteria: Serum creatinine elevation ≥ 0.3 mg/dL within 48h, no improvement after 2 days of diuretic withdrawal and albumin volume expansion, absence of shock/nephrotoxic drugs. Treatment: Terlipressin + Albumin infusion.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is morphine avoided in cirrhosis?\n    A: Morphine glucuronidation is impaired; half-life is doubled, triggering prolonged sedation and precipitating hepatic encephalopathy.\n  - Q: What is the Hepatic Artery Buffer Response (HABR)?\n    A: An intrinsic compensatory mechanism where a decrease in portal vein blood flow leads to adenosine accumulation in the space of Mall, producing hepatic artery vasodilation to maintain total hepatic blood flow."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 22, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026.",
      "AASLD Practice Guidelines: Management of Adult Patients with Ascites Due to Cirrhosis. Hepatology 2021;74(2):1014-1048."
    ]
  },

  // 2. LAPAROSCOPIC AND ROBOTIC CHOLECYSTECTOMY
  {
    id: "case-laparoscopic-robotic-cholecystectomy",
    cat: "case_general_subspecialty",
    name: "Laparoscopic and Robotic Cholecystectomy",
    short: "Lap & Robotic Cholecystectomy",
    tags: ["General Surgery", "Laparoscopy", "Robotic", "Pneumoperitoneum", "CO2 Embolism", "Reverse Trendelenburg", "Case Discussion"],
    tagline: "Pneumoperitoneum hemodynamics, CO2 insufflation, reverse Trendelenburg, gas embolism & PONV multimodal prevention",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 24; Miller's Anesthesia, 10th ed., Ch. 66; SAGES Guidelines.",
    sections: [
      {
        h: "1. Definition, Physics & Hemodynamics of Pneumoperitoneum",
        b: "• Definition: Insufflation of carbon dioxide (CO₂) into the peritoneal cavity to create working space for laparoscopic or robotic visualization.\n• Physics of Insufflation Gas (Why CO₂?):\n  - Highly soluble in blood (solubility 20× greater than O₂ and N₂), rapidly eliminated by the lungs, non-combustible, and inexpensive. Disadvantage: Peritoneal absorption causes hypercapnia and respiratory acidosis.\n• Hemodynamic Consequences of Elevated IAP (12–15 mmHg):\n  - SVR increases markedly (by 30%–50%) due to mechanical compression of the abdominal aorta and neurohumoral release of vasopressin and catecholamines.\n  - Venous return / Preload: Biphasic response. Mild IAP (< 10 mmHg) squeezes splanchnic blood into IVC (increasing preload); high IAP (> 15 mmHg) compresses IVC and lowers preload, reducing cardiac index.\n  - Renal Blood Flow: Oliguria due to direct compression of renal cortex and renal veins (reversible once desufflated).\n  - Target Safe IAP: Maintain lowest effective IAP (10–12 mmHg; avoid > 15 mmHg)."
      },
      {
        h: "2. Pulmonary Alterations & Positioning Shifts",
        b: "• Diaphragmatic Cephalad Displacement:\n  - IAP pushes diaphragm upwards, reducing Functional Residual Capacity (FRC) by 20%–30% below closing capacity, causing basilar atelectasis, V/Q mismatch, and reduced pulmonary compliance.\n• Positioning Effects:\n  - Reverse Trendelenburg (Head-Up 15°–20° for Lap Chole): Shifts viscera away from gall bladder; improves diaphragmatic excursion and FRC, but promotes lower-extremity venous pooling (risk of hypotension).\n  - Trendelenburg (Head-Down for Pelvic/Robotic): Increases venous return and CVP, but severely impairs lung compliance, increases peak airway pressures, and elevates intracranial/intraocular pressures.\n• Ventilatory Strategy:\n  - Volume-targeted or Pressure-Controlled Volume-Guaranteed (PCV-VG) ventilation: Tidal Volume 6–8 mL/kg PBW, moderate PEEP (5–8 cmH₂O) to prevent atelectasis.\n  - Increase minute ventilation by 15%–25% to eliminate absorbed CO₂ and maintain EtCO₂ at 35–40 mmHg."
      },
      {
        h: "3. Preoperative Evaluation & Risk Stratification",
        b: "• Bedside Clinical Examination:\n  - Cardiopulmonary Reserve: Assess ability to tolerate decreased cardiac index and elevated afterload. Severe COPD or IHD patients are at risk of decompensation.\n  - Obesity / Sleep Apnea: OSA patients have pre-existing elevated FRC loss and high baseline EtCO₂.\n• Absolute & Relative Contraindications to Laparoscopy:\n  - Absolute: Inability to tolerate general anesthesia, severe uncorrectable coagulopathy, tension pneumothorax.\n  - Relative: Severe intracranial hypertension, ventriculoperitoneal (VP) shunt, severe refractory pulmonary hypertension, uncorrected hypovolemia."
      },
      {
        h: "4. Anesthetic Strategy, Monitoring & Muscle Relaxation",
        b: "• Technique: General Anesthesia with cuffed endotracheal tube is mandatory (LMA is contraindicated due to high aspiration risk and elevated airway pressures).\n• Mandatory Monitoring:\n  - Standard ASA monitors: Continuous EtCO₂ capnography is the primary monitor for CO₂ absorption, hypoventilation, and gas embolism.\n  - Airway pressure monitoring: Peak and plateau airway pressures.\n• Deep Neuromuscular Blockade:\n  - Maintaining deep neuromuscular blockade (TOF count 0, PTC 1–2) significantly improves surgical workspace at lower IAP levels (8–10 mmHg), reducing postoperative pain and hemodynamic stress.\n  - Reversal: Sugammadex (2–4 mg/kg) ensures complete and rapid recovery."
      },
      {
        h: "5. Specific Intraoperative Crises Protocols",
        b: "• 1. Carbon Dioxide Gas Embolism:\n  - Pathophysiology: Accidental injection of CO₂ directly into a major vessel or large venous lake during trocar insertion or liver dissection.\n  - Clinical Signs: Sudden dramatic drop in EtCO₂ (pulmonary vascular occlusion / dead space), acute hypotension, hypoxia, mill-wheel murmur over precordium, cyanosis, and elevated CVP.\n  - Immediate Emergency Protocol:\n    1. Immediately STOP CO₂ insufflation and desufflate abdomen!\n    2. Discontinue N₂O and deliver 100% O₂.\n    3. Durant's Maneuver: Turn patient into Left Lateral Decubitus and Trendelenburg position (traps gas bubbles in right ventricular apex, preventing pulmonary outflow obstruction).\n    4. Aspirate gas via CVC if present; aggressive fluid resuscitation and inotropic support.\n• 2. Pneumothorax / Capnothorax:\n  - Gas dissects across diaphragmatic hiatus or pleural defects. Presents as sudden rise in airway pressure, hypoxemia, and absent unilateral breath sounds. Treatment: Desufflate, PEEP, thoracocentesis if tension capnothorax persists.\n• 3. Vagal Surge on Insufflation: Rapid peritoneal distension triggers profound reflex bradycardia or asystole. Treatment: Desufflate instantly; administer IV Atropine 0.5–1.0 mg or Glycopyrrolate."
      },
      {
        h: "6. Postoperative Concerns, Referred Pain & PONV Multimodal Strategy",
        b: "• Referred Shoulder Tip Pain: Phrenic nerve irritation from retained subdiaphragmatic CO₂ forming carbonic acid. Mitigation: Careful peritoneal lavage and active evacuation of gas at end of surgery.\n• Multimodal Postoperative Pain Management: Port-site local anesthetic infiltration (Bupivacaine 0.25% or Ropivacaine 0.375% with adrenaline) + Subcostal TAP block + IV Paracetamol and NSAIDs.\n• PONV Multimodal Prophylaxis (Apfel Score > 3 in young females): Ondansetron 4 mg + Dexamethasone 4–8 mg at induction + avoidance of volatile/N₂O via TIVA Propofol in very high-risk patients."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 24, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 66, Elsevier, 2025/2026.",
      "SAGES Guidelines for Diagnostic Laparoscopy and Minimally Invasive Surgery."
    ]
  },

  // 3. LARGE THYROID MASS & RETROSTERNAL GOITER
  {
    id: "case-large-thyroid-mass-stridor",
    cat: "case_general_subspecialty",
    name: "Large Thyroid Mass & Retrosternal Goiter",
    short: "Thyroid Mass & Retrosternal Goiter",
    tags: ["Endocrine", "Thyroid", "Retrosternal Goiter", "Stridor", "Awake Fibreoptic", "Tracheomalacia", "Cuff Leak Test", "Case Discussion"],
    tagline: "Tracheal compression, flow-volume loops, awake fibreoptic intubation, tracheomalacia & post-op hematoma rescue",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 20; Miller's Anesthesia, 10th ed., Ch. 68; British Thyroid Association Guidelines.",
    sections: [
      {
        h: "1. Definition, Classification & Retrosternal Extension",
        b: "• Definition: Massive thyroid enlargement with secondary airway distortion, tracheal compression, and/or substernal extension below the thoracic inlet.\n• Classification of Retrosternal Goiter (Katlic / Eschapasse Criteria):\n  - Primary (1%): Arises de novo from ectopic mediastinal thyroid tissue; blood supply from intrathoracic vessels.\n  - Secondary (>99%): Downward cervical migration into the mediastinum; blood supply from inferior thyroid artery.\n  - Grade 1: Above aortic arch.\n  - Grade 2: Extends to the aortic arch.\n  - Grade 3: Extends below the aortic arch into posterior mediastinum.\n• Clinical Red Flags: Inspiratory stridor, orthopnea, dysphagia, Pemberton's sign (facial congestion and cyanosis when arms are raised over head for 1 min, indicating superior vena cava syndrome / thoracic inlet crowding)."
      },
      {
        h: "2. Pathophysiology: Extrathoracic vs Intrathoracic Airway Dynamics",
        b: "• Airway Dynamics on Flow-Volume Loops:\n  - Variable Extrathoracic Obstruction (Cervical Goiter): Tracheal collapse occurs during INSPIRATION (negative intraluminal pressure relative to atmospheric), producing a flattened inspiratory flow loop with normal expiratory loop.\n  - Variable Intrathoracic Obstruction (Retrosternal Goiter): Collapse occurs during EXPIRATION (pleural pressure exceeds intraluminal pressure), producing a flattened expiratory loop.\n  - Fixed Upper Airway Obstruction: Flattening of BOTH inspiratory and expiratory loops (tracheal lumen fixed < 5 mm).\n• Loss of Spontaneous Ventilation Hazard:\n  - Induction of general anesthesia with neuromuscular blockade eliminates the dilator tone of pharyngeal/laryngeal muscles and negative intrathoracic transpulmonary gradient, leading to catastrophic complete collapse of the compressed trachea!"
      },
      {
        h: "3. Preoperative Evaluation, CT Imaging & Endocrine Optimization",
        b: "• Bedside Clinical Examination:\n  - Stridor: Resting stridor implies tracheal diameter < 4–5 mm (critical emergency!).\n  - Pemberton's Sign: Positive test warns of severe vascular engorgement and mediastinal compression.\n  - Indirect Laryngoscopy (IDL) / Videolaryngoscopy: Baseline vocal cord mobility must be documented in EVERY patient (unilateral recurrent laryngeal nerve palsy may be pre-existing and asymptomatic!).\n• CT Neck & Thorax (Without IV Contrast):\n  - Exact site, length, and minimum diameter of tracheal luminal stenosis; carinal distance.\n  - Note: Contrast media is avoided if radioactive iodine therapy/scan is anticipated.\n• Endocrine Status (Euthyroid State is Mandatory!):\n  - If Toxic (Graves/Toxic MNG): Antithyroid drugs (Carbimazole / Propylthiouracil) for 6–8 weeks + Beta-blockers (Propranolol 40–80 mg TID) to achieve resting HR < 80 bpm.\n  - Lugol's Iodine (5% iodine + 10% KI; 5–10 drops TID for 10–14 days pre-op): Inhibits thyroid hormone release (Wolff-Chaikoff effect) and dramatically reduces thyroid gland vascularity."
      },
      {
        h: "4. Anesthetic Strategy: Awake Fibreoptic & Tube Selection",
        b: "• Technique of Choice for Significant Compression / Stridor:\n  - AWAKE FIBREOPTIC BRONCHOSCOPIC (AFOB) INTUBATION.\n  - Allows dynamic evaluation of tracheal caliber while maintaining spontaneous respiration and intrinsic airway muscle tone.\n• Airway Preparation for AFOB:\n  - Antisialagogue: Glycopyrrolate 0.2 mg IM 30 min prior.\n  - Topicalization: 4% Lignocaine nebulization (4 mL) + 10% Lignocaine spray to posterior pharynx + \"Spray-as-you-go\" technique (2% Lignocaine via bronchoscope suction port onto vocal cords and trachea).\n  - Mild Titrated Sedation: Dexmedetomidine (0.5–1 mcg/kg over 10 min, then 0.2–0.5 mcg/kg/hr) maintains spontaneous respiration and airway patency.\n• Endotracheal Tube Selection:\n  - Armoured / Reinforced (Flexometallic) Tube is mandatory to prevent extrinsic compression or kinking during surgical neck manipulation.\n  - Tube size chosen based on CT minimal tracheal diameter (keep 5.0, 6.0, and 6.5 mm sizes ready)."
      },
      {
        h: "5. Specific Intraoperative Concerns & Nerve Monitoring (IONM)",
        b: "• Intraoperative Neuromonitoring (IONM) of RLN:\n  - Specialized endotracheal tube with integrated surface electrodes (NIM tube).\n  - Neuromuscular Blockade Rule: Avoid long-acting muscle relaxants after intubation (allow complete recovery or use short-acting agents) so that electromyographic (EMG) signals of vocal cords can be recorded when the surgeon stimulates the recurrent laryngeal nerve.\n• Sternotomy Standby: For Grade 3 retrosternal goiters extending below the aortic arch, cardiothoracic surgeon and sternotomy instrumentation must be on immediate standby."
      },
      {
        h: "6. Postoperative Concerns, Tracheomalacia & Emergency Hematoma Rescue",
        b: "• 1. Cuff Leak Test & Tracheomalacia:\n  - Long-standing goiter causes pressure necrosis and softening of tracheal cartilage rings (Tracheomalacia).\n  - Perform CUFF LEAK TEST before extubation: Deflate cuff and occlude ETT; audible breath sounds around the tube or leak volume > 110 mL confirms airway patency.\n  - If no leak, perform direct inspection with flexible bronchoscope during extubation. If tracheal collapse occurs, re-intubate immediately; tracheostomy or tracheal stenting may be required.\n• 2. Post-Thyroidectomy Tension Hematoma:\n  - Arterial bleeding under the deep cervical fascia produces rapid airway compression, venous congestion, and asphyxia.\n  - BEDSIDE EMERGENCY PROTOCOL: Do NOT wait to transfer to OT! Instantly remove all skin staples/clips at bedside, open deep cervical fascia, evacuate hematoma with finger to relieve tension, then transfer to OT for formal hemostasis under general anesthesia.\n• 3. Bilateral Recurrent Laryngeal Nerve Palsy:\n  - Both vocal cords assume paramedian position, causing acute inspiratory stridor and airway obstruction immediately upon extubation. Requires immediate re-intubation and tracheostomy.\n• 4. Hypocalcemia / Tetany:\n  - Accidental parathyroid excision/devascularization causes hypocalcemia 24–48h post-op. Signs: Chvostek's sign, Trousseau's sign, carpopedal spasm, prolonged QTc. Treatment: IV 10% Calcium Gluconate (10–20 mL) slow push."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 20, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026.",
      "British Thyroid Association Guidelines for the Management of Thyroid Cancer and Retrosternal Goiter."
    ]
  },

  // 4. DIABETES MELLITUS & PERIOPERATIVE GLYCEMIC EMERGENCIES
  {
    id: "case-diabetes-mellitus-perioperative",
    cat: "case_general_subspecialty",
    name: "Diabetes Mellitus & Perioperative Glycemic Emergencies",
    short: "Diabetes Mellitus & Glycemic Control",
    tags: ["Endocrine", "Diabetes Mellitus", "DKA", "SGLT2i", "Euglycemic DKA", "Insulin Infusion", "Prayer Sign", "Case Discussion"],
    tagline: "Perioperative glycemic targets 140–180 mg/dL, SGLT2i hold rules, euglycemic DKA rescue & autonomic neuropathy",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 18; Miller's Anesthesia, 10th ed., Ch. 68; ADA Standards of Care in Diabetes 2024.",
    sections: [
      {
        h: "1. Diagnostic Criteria, Glycemic Targets & SGLT2i Warning",
        b: "• Diagnostic Criteria (ADA Standards 2024):\n  - Fasting Plasma Glucose (FPG) ≥ 126 mg/dL (7.0 mmol/L).\n  - 2-hour Postprandial Glucose ≥ 200 mg/dL (11.1 mmol/L) during 75g OGTT.\n  - Glycated Hemoglobin (HbA1c) ≥ 6.5% (48 mmol/mol).\n  - Random Plasma Glucose ≥ 200 mg/dL in the presence of classic hyperglycemia symptoms.\n• Target Perioperative Glycemic Range: 140–180 mg/dL (7.8–10.0 mmol/L).\n  - Avoid tight glycemic control (< 110 mg/dL) due to high risk of lethal unrecognized hypoglycemia under general anesthesia (NICE-SUGAR trial).\n• Critical SGLT2 Inhibitor Hold Rule (Empagliflozin, Dapagliflozin, Canagliflozin):\n  - Withhold SGLT2 inhibitors for AT LEAST 3 to 4 days prior to elective major surgery (FDA/ADA Safety Alert).\n  - SGLT2 inhibitors cause glycosuria and osmotic diuresis; surgical stress triggers EUGLYCEMIC DIABETIC KETOACIDOSIS (normal blood glucose < 200 mg/dL with severe high-anion-gap ketoacidosis!)."
      },
      {
        h: "2. Pathophysiology: Glycosylation, Stiff Joint Syndrome & Autonomic Neuropathy",
        b: "• Non-Enzymatic Glycosylation & \"Stiff Joint Syndrome\":\n  - Chronic hyperglycemia cross-links collagen in atlanto-occipital and temporomandibular joints, producing restricted neck extension and difficult intubation.\n  - Bedside \"Prayer Sign\": Inability to approximate palmar surfaces of phalangeal joints without gap.\n• Diabetic Autonomic Neuropathy (DAN):\n  - Resting tachycardia, loss of heart rate variability with respiration, severe orthostatic hypotension.\n  - Cardiopulmonary Collapse: Blunted baroreceptor reflexes lead to profound hypotension upon induction of anesthesia and blunted response to atropine.\n  - Gastroparesis: Delayed gastric emptying necessitates rapid sequence induction (RSI) even after standard fasting intervals!"
      },
      {
        h: "3. Preoperative Optimization & Medication Management Guidelines",
        b: "• Oral Hypoglycemic Agents (OHAs):\n  - Metformin: Omit on morning of surgery (omit 24–48h prior if renal dysfunction or IV contrast is planned, to avoid lactic acidosis).\n  - Sulfonylureas (Glimepiride, Gliclazide): Omit on morning of surgery (hypoglycemia risk).\n  - GLP-1 Receptor Agonists (Semaglutide, Liraglutide): Stop weekly formulations 1 week before surgery, and daily formulations on morning of surgery, due to marked delayed gastric emptying (ASA Consensus Guidance).\n• Subcutaneous Insulin Regimens:\n  - Long-Acting Basal Insulin (Glargine / Degludec): Reduce dose by 20%–30% on the night before or morning of surgery.\n  - Intermediate (NPH): Take 50% of morning dose along with 5% Dextrose infusion.\n  - Short/Rapid-Acting (Regular / Lispro / Aspart): Omit on morning of surgery (held until eating resumed)."
      },
      {
        h: "4. Intravenous Insulin Infusion Protocols & Intraoperative Monitoring",
        b: "• Variable-Rate Intravenous Insulin Infusion (VRIII / Alberti's Regimen):\n  - Indicated for major surgery, type 1 diabetes, or blood glucose > 180 mg/dL.\n  - Standard Solution: 50 units Regular Human Insulin in 50 mL Normal Saline (1 U/mL) via syringe infusion pump.\n  - Co-Infusion: 5% Dextrose with 20 mEq KCl at 100 mL/hr to prevent hypoglycemia and hypokalemia.\n  - Sliding Scale Infusion Protocol:\n    • BG < 100 mg/dL: Stop insulin, give 100 mL 10% Dextrose bolus.\n    • BG 100–140 mg/dL: 0.5–1.0 U/hr.\n    • BG 141–180 mg/dL: 1.5–2.0 U/hr.\n    • BG 181–220 mg/dL: 2.5–3.0 U/hr.\n    • BG > 220 mg/dL: 4.0 U/hr + check arterial blood gas for ketones/acidosis.\n• Hourly Capillary Blood Glucose (CBG) monitoring during surgery and recovery."
      },
      {
        h: "5. Specific Intraoperative Concerns & Hypoglycemia Under Anesthesia",
        b: "• Unrecognized Hypoglycemia Hazard:\n  - General anesthesia and beta-blockers mask all autonomic warning signs of hypoglycemia (sweating, tremor, palpitations, anxiety).\n  - Diaphoresis (sweating) may be the ONLY subtle sign under anesthesia, but is unreliable!\n  - Any unexplained hypotension, tachycardia, or delayed recovery from anesthesia must prompt IMMEDIATE bedside blood glucose measurement.\n  - Acute Hypoglycemia Treatment: 50 mL of 25% Dextrose (or 100 mL of 10% Dextrose) IV bolus; recheck CBG within 15 minutes."
      },
      {
        h: "6. Postoperative Concerns, DKA vs HHS Protocols & Exam Pearls",
        b: "• Diabetic Ketoacidosis (DKA) vs Hyperosmolar Hyperglycemic State (HHS):\n  - DKA: Absolute insulin deficiency, BG > 250 mg/dL, arterial pH < 7.30, HCO₃⁻ < 18 mEq/L, positive serum ketones, elevated anion gap (> 12).\n  - HHS: Relative insulin deficiency, severe hyperglycemia (BG > 600 mg/dL), serum osmolality > 320 mOsm/kg, normal pH and bicarbonate, absent/mild ketones, profound dehydration (fluid deficit 8–10 L).\n• Management Protocol: Aggressive fluid resuscitation with isotonic balanced crystalloids + IV insulin infusion 0.1 U/kg/hr + potassium replacement (do NOT start insulin if K⁺ < 3.3 mEq/L!).\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: What is the Rule of 150 for regular insulin?\n    A: Expected blood glucose drop (mg/dL) = 1500 / Total Daily Dose of insulin (or Rule of 1800 for rapid-acting analogs)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 18, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026.",
      "American Diabetes Association (ADA). Standards of Care in Diabetes—2024. Diabetes Care 2024;47(Suppl 1):S1-S343."
    ]
  },

  // 5. CHRONIC KIDNEY DISEASE & RENAL TRANSPLANTATION
  {
    id: "case-ckd-renal-transplant",
    cat: "case_general_subspecialty",
    name: "Chronic Kidney Disease & Renal Transplantation",
    short: "CKD & Renal Transplantation",
    tags: ["Renal", "CKD", "Renal Transplant", "Hyperkalemia", "AV Fistula", "Cisatracurium", "Reperfusion", "Case Discussion"],
    tagline: "Hyperkalemia rescue, arteriovenous fistula protection, immunosuppression, cisatracurium & graft reperfusion hemodynamics",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 21; Miller's Anesthesia, 10th ed., Ch. 67; KDIGO 2024 Clinical Practice Guideline.",
    sections: [
      {
        h: "1. Definition, KDIGO Staging & Hemodialysis Scheduling",
        b: "• Definition: Abnormalities of kidney structure or function present for > 3 months, with implications for health.\n• KDIGO 2024 GFR Staging:\n  - G1: GFR ≥ 90 mL/min/1.73m² (Normal/high).\n  - G2: GFR 60–89 mL/min/1.73m² (Mildly decreased).\n  - G3a: GFR 45–59 mL/min/1.73m² (Mild-to-moderate).\n  - G3b: GFR 30–44 mL/min/1.73m² (Moderate-to-severe).\n  - G4: GFR 15–29 mL/min/1.73m² (Severely decreased).\n  - G5: GFR < 15 mL/min/1.73m² (Kidney Failure / End-Stage Renal Disease).\n• Preoperative Hemodialysis Timing:\n  - Hemodialysis must be performed 24 hours prior to elective surgery (ideally 12–24h before).\n  - Why NOT immediately pre-op? Avoids residual systemic heparinization (rebound bleeding) and intravascular volume depletion/hypotension on induction.\n  - Check post-dialysis weight (\"dry weight\"), electrolytes (serum K⁺ must be < 5.0–5.5 mEq/L), and coagulation status."
      },
      {
        h: "2. Pathophysiology: Hyperdynamic State, Anemia & Uremic Coagulopathy",
        b: "• Cardiovascular Alterations:\n  - Accelerated atherosclerosis, left ventricular hypertrophy (LVH), uremic pericarditis, and high-output arteriovenous fistula flow.\n• Normochromic Normocytic Anemia:\n  - Erythropoietin deficiency and shortened RBC lifespan. Well tolerated due to compensatory rightward shift of oxygen-hemoglobin dissociation curve (high 2,3-DPG).\n• Uremic Coagulopathy & Platelet Dysfunction:\n  - Defective platelet aggregation and adhesion due to guanidinosuccinic acid inhibiting Von Willebrand Factor (vWF) binding to glycoprotein IIb/IIIa.\n  - Treatment of active uremic bleeding: DESMOPRESSIN (DDAVP 0.3 mcg/kg IV over 30 min) transiently stimulates vWF and Factor VIII release from Weibel-Palade bodies."
      },
      {
        h: "3. Hyperkalemia Emergency Protocol (K⁺ > 5.5 mEq/L)",
        b: "• ECG Signs of Hyperkalemia:\n  - 5.5–6.5 mEq/L: Tall, narrow, peaked T waves (tented T waves).\n  - 6.5–7.5 mEq/L: Prolonged PR interval, loss of P waves, ST depression.\n  - 7.5–8.0 mEq/L: Widened QRS complex, intraventricular conduction delay.\n  - > 8.0 mEq/L: Sine wave pattern, ventricular fibrillation, asystole.\n• Step-by-Step Hyperkalemia Management Protocol:\n  1. MYOCARDIAL MEMBRANE STABILIZATION: 10% CALCIUM GLUCONATE 10 mL (or Calcium Chloride 10% 5–10 mL) IV over 3–5 min. Reverses conduction block immediately (duration 30–60 min; does NOT lower serum K⁺!).\n  2. INTRACELLULAR POTASSIUM SHIFTING:\n     - Regular Insulin 10 units + 50 mL 50% Dextrose (or 100 mL 25% Dextrose) IV over 15 min (lowers K⁺ by 0.5–1.0 mEq/L within 15–30 min).\n     - Nebulized Salbutamol 10–20 mg in 4 mL saline (beta-2 adrenergic stimulation).\n     - Sodium Bicarbonate 50–100 mEq IV (effective only if metabolic acidosis is present).\n  3. POTASSIUM ELIMINATION: Emergent Hemodialysis is the definitive treatment."
      },
      {
        h: "4. Anesthetic Strategy, Arteriovenous Fistula Care & Pharmacology",
        b: "• ARTERIOVENOUS (AV) FISTULA PROTECTION RULES:\n  - STRICTLY NO BP cuff, NO IV cannulation, NO blood sampling, and NO wrist straps on the fistula extremity!\n  - Palpate and auscultate for continuous thrill and bruit before and after surgery.\n  - Position extremity without compression or extreme flexion.\n• Induction Pharmacology:\n  - PROPOFOL (1.5–2.0 mg/kg) or ETOMIDATE (0.2–0.3 mg/kg): Etomidate preferred in compromised LV.\n  - SUCCINYLCHOLINE CONTRAINDICATION: Raises serum K⁺ by 0.5–1.0 mEq/L. Strictly contraindicated if K⁺ > 5.0 mEq/L or in neuropathy!\n• Neuromuscular Blockers:\n  - CISATRACURIUM (0.15 mg/kg): Drug of choice (Hofmann elimination, zero renal dependence).\n  - ATRACURIUM (0.5 mg/kg): Safe, but laudanosine metabolite cleared renally.\n  - AVOID PANCURONIUM (85% renal excretion) and pipecuronium.\n• Opioid Selection: FENTANYL and REMIFENTANIL are preferred. AVOID MORPHINE (accumulation of active neurotoxic Morphine-6-glucuronide) and MEPERIDINE/PETHIDINE (accumulation of Normeperidine causes intractable seizures!)."
      },
      {
        h: "5. Specific Intraoperative Concerns: Renal Transplant Hemodynamics",
        b: "• Hemodynamics Prior to Graft Reperfusion:\n  - Maintain Systolic BP > 130–140 mmHg and MAP > 80–90 mmHg to ensure adequate perfusion pressure of the newly anastomosed renal graft.\n  - CVP target: 10–14 mmHg (adequate volume loading before unclamping).\n• Fluid Choice: BALANCED CRYSTALLOIDS (Plasmalyte-A / Sterofundin) or 0.9% Normal Saline. Avoid large volumes of 0.9% Saline (causes hyperchloremic metabolic acidosis, worsening hyperkalemia!).\n• Graft Unclamping & Reperfusion Syndrome:\n  - Clamps released from external iliac vessels.\n  - Reperfusion of preserved donor kidney flushes cold, acidotic, potassium-rich preservation solution (UW / HTK solution) into maternal/recipient systemic circulation.\n  - Manifestations: Sudden hypotension, bradycardia, or peaked T waves. Pre-treatment: Generous volume bolus, IV Mannitol 20% (0.5–1.0 g/kg) and Furosemide (100–200 mg), with vasopressor infusion ready."
      },
      {
        h: "6. Postoperative Concerns, Immunosuppression & Exam Pearls",
        b: "• Immediate Graft Function: Monitor urine output (may reach 500–1000 mL/hr in live donor transplants; replace urine mL-for-mL with balanced salt solutions to avoid hypovolemia).\n• Immunosuppression Considerations:\n  - Calcineurin inhibitors (Tacrolimus / Cyclosporine) cause nephrotoxicity, hypertension, and hyperkalemia.\n  - Mycophenolate Mofetil and Corticosteroids (Methylprednisolone 500 mg IV intraoperatively).\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why should Sevoflurane be used with caution in CKD?\n    A: Sevoflurane degrades in soda lime to Compound A, which is nephrotoxic in rats (keep fresh gas flow > 2 L/min).\n  - Q: What is the fluid replacement formula during brisk post-transplant diuresis?\n    A: Replace 0.5 to 1.0 mL of 0.45% Saline or balanced solution for every 1.0 mL of urine output to prevent severe hypovolemic graft hypoperfusion."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 21, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026.",
      "KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease. Kidney Int 2024;105(4S):S117-S314."
    ]
  },

  // 6. TURP & TURP SYNDROME
  {
    id: "case-turp-and-turp-syndrome",
    cat: "case_trauma_ortho_special",
    name: "Transurethral Resection of Prostate (TURP) & TURP Syndrome",
    short: "TURP & TURP Syndrome",
    tags: ["Urology", "TURP", "TURP Syndrome", "Hyponatremia", "Glycine Toxicity", "Spinal T10", "Case Discussion"],
    tagline: "Spinal anesthesia level T10, fluid absorption math, glycine toxicity, acute dilutional hyponatremia & 3% NaCl rescue",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 26; Miller's Anesthesia, 10th ed., Ch. 67; Campbell-Walsh-Wein Urology 12th ed.",
    sections: [
      {
        h: "1. Definition, Physics of Resection & Irrigating Fluids",
        b: "• Definition: Endoscopic resection of obstructive hyperplastic prostatic adenoma via cutting loop resectoscope with continuous fluid irrigation.\n• Resection Dynamics & Fluid Absorption Math:\n  - Prostatic venous sinuses are wide open during resection.\n  - Absorption rate averages 10 to 30 mL of fluid per minute of resection time (can reach up to 200 mL/min!).\n  - In a 60-minute resection, 1.0 to 2.5 liters of irrigating fluid can enter the systemic circulation directly.\n  - Determinants of Absorption: Number of opened venous sinuses, duration of resection (> 60 min dramatically increases risk), and height of irrigation fluid bag (> 60 cm above prostatic bed creates pressure > 15 mmHg, driving fluid into veins!).\n• Characteristics of Ideal Irrigating Fluid:\n  - Non-conductive (prevents dispersion of monopolar diathermy current), optically clear, non-toxic, isotonic, and non-hemolytic.\n  - Common Irrigating Solutions:\n    • 1.5% Glycine (200 mOsm/L, hypotonic): Most common monopolar fluid.\n    • 3% Sorbitol / 5% Mannitol (178–275 mOsm/L).\n    • 0.9% Normal Saline (308 mOsm/L, isotonic): Used ONLY with Bipolar Resection (TURis) — completely eliminates dilutional hyponatremia!"
      },
      {
        h: "2. Pathophysiology of TURP Syndrome (Triad of Toxicity)",
        b: "• The Pathophysiological Triad:\n  1. HYPERVOLEMIC CIRCULATORY OVERLOAD: Massive intravascular volume absorption produces acute hypertension, reflex bradycardia, elevated CVP, and flash pulmonary edema.\n  2. ACUTE DILUTIONAL HYPONATREMIA & HYPO-OSMOLALITY:\n     - Rapid drop in serum sodium (Na⁺ < 120 mEq/L) and serum osmolality.\n     - Water shifts into brain parenchyma along osmotic gradient, causing cerebral edema, headache, restlessness, confusion, seizures, coma, and brain herniation.\n  3. SOLUTE SPECIFIC TOXICITY (GLYCINE & AMMONIA):\n     - Glycine is an inhibitory neurotransmitter in the brainstem and retina; produces transient visual blurring or bilateral blindness (mydriasis with intact pupillary light reflex).\n     - Glycine is deaminated in liver to AMMONIA; hyperammonemia causes encephalopathy and delayed recovery."
      },
      {
        h: "3. Preoperative Evaluation, Cardiac Risk & Lithotomy Assessment",
        b: "• Bedside Clinical Examination:\n  - Elderly Geriatric Demographics: Most patients are > 65–70 years old with coronary artery disease, hypertension, and COPD.\n  - Lithotomy Positioning Tolerance: Check hip and knee joints (severe arthritis, previous arthroplasty). Lithotomy shifts 500–800 mL of blood from lower extremities to central circulation (cardiac stress).\n  - Bleeding & Coagulation: Active urinary tract infection (UTI) increases vascularity; check pre-op urine culture."
      },
      {
        h: "4. Anesthetic Technique: Spinal Anesthesia Level T10 Mandate",
        b: "• TECHNIQUE OF CHOICE: REGIONAL SPINAL (SUBARACHNOID) ANESTHESIA.\n• Why Spinal Anesthesia is Strongly Preferred over General:\n  1. EARLY DETECTION OF TURP SYNDROME: The awake patient can report early mental status changes (restlessness, headache, confusion, visual disturbances).\n  2. EARLY RECOGNITION OF BLADDER PERFORATION: Pain from peritoneal irritation (referred to periumbilical or shoulder tip) is immediately recognized.\n  3. Reduced deep venous thrombosis (DVT) and lower blood loss.\n• Target Sensory Level: T10 (Umbilicus).\n  - Blocks sacral parasympathetics (S2–S4) for bladder and prostatic innervation, and sympathetic pain fibers from bladder distension (T11–L2).\n  - Avoid high spinal (> T6): Causes severe hypotension and masks early bladder perforation pain."
      },
      {
        h: "5. Specific Intraoperative Crises Protocols",
        b: "• 1. Acute Dilutional Hyponatremia & TURP Syndrome Treatment:\n  - Immediately notify surgeon to TERMINATE resection and coagulate bleeders.\n  - Stop irrigation fluid; check emergency stat electrolytes (Na⁺, K⁺), ABG, and hematocrit.\n  - Diuretic Therapy: IV Furosemide (20–40 mg) to induce free water excretion (only if patient is hypervolemic).\n  - HYPERTONIC SALINE PROTOCOL (For Na⁺ < 120 mEq/L with Neurological Symptoms / Seizures):\n    • Administer 3% SODIUM CHLORIDE (Hypertonic Saline; 513 mEq/L) IV at 1.0–1.5 mL/kg/hr (max 100 mL bolus over 10–15 min).\n    • RATE LIMIT: Do NOT correct serum Na⁺ faster than 8 to 10 mEq/L in 24 hours (risk of Central Pontine Myelinolysis / Osmotic Demyelination Syndrome!).\n  - Seizure Control: IV Midazolam 2–4 mg or Levetiracetam 1 g IV.\n• 2. Bladder Perforation:\n  - Extraperitoneal Perforation: More common (80%). Pain in inguinal / suprapubic area, lower abdominal rigidity, spasms.\n  - Intraperitoneal Perforation (20%): Sudden sharp generalized abdominal pain, referred shoulder pain (diaphragmatic irritation), abdominal distension, severe hypotension/pallor. Requires emergent laparotomy."
      },
      {
        h: "6. Postoperative Concerns, Hypothermia & Exam Pearls",
        b: "• Postoperative Hypothermia & Shivering: Continuous irrigation with cold room-temperature fluids (hundreds of liters) causes profound core hypothermia. Mitigation: Warm irrigation fluids to 37°C.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is 0.9% Saline not used with Monopolar TURP?\n    A: Saline contains electrolytes (Na⁺ and Cl⁻) that conduct electric current, causing current dispersion, burns to surrounding tissue, and failure of the cutting loop to cut or coagulate.\n  - Q: What is the sensory innervation of the prostate and bladder?\n    A: Bladder dome and peritoneum = T11–L2 (sympathetics); Prostatic capsule, trigone, and urethra = S2–S4 (parasympathetics via pelvic splanchnic nerves)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 26, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026.",
      "Campbell-Walsh-Wein Urology, 12th ed., Ch. 145 (Transurethral Surgery)."
    ]
  },

  // 7. ANESTHESIA FOR CLEFT LIP AND PALATE SURGERY
  {
    id: "case-anesthesia-cleft-lip-palate",
    cat: "case_trauma_ortho_special",
    name: "Anesthesia for Cleft Lip and Palate Surgery",
    short: "Cleft Lip & Palate Repair",
    tags: ["Pediatric", "Cleft Lip", "Cleft Palate", "Rule of 10s", "Dingman Retractor", "South-Facing RAE", "Case Discussion"],
    tagline: "Rule of 10s, associated syndromes, preformed RAE tube, Dingman mouth gag airway compression & throat pack protocol",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 35; Miller's Anesthesia, 10th ed., Ch. 76; Cote CJ, Practice of Anesthesia for Infants and Children.",
    sections: [
      {
        h: "1. Definition, Embryology & The Rule of 10s",
        b: "• Definition: Congenital craniofacial malformations resulting from failure of facial prominences to fuse during weeks 4 to 10 of gestation (Cleft lip: failure of maxillary and medial nasal prominences; Cleft palate: failure of lateral palatine processes).\n• Millard's Rule of 10s for Timing of Cleft Lip Repair:\n  1. Age ≥ 10 weeks.\n  2. Weight ≥ 10 lbs (4.5 kg).\n  3. Hemoglobin ≥ 10 g/dL.\n  4. White Blood Cell Count < 10,000 /mm³.\n  - Rationale: Ensures maturation of hepatic/renal clearance, stability of airway reflexes, and reserve to tolerate anesthesia and surgical blood loss.\n• Cleft Palate Timing: Typically performed at 9 to 12 months (before speech development begins, but after facial bone growth)."
      },
      {
        h: "2. Pathophysiology, Associated Syndromes & Airway Challenges",
        b: "• Syndromic Associations (Up to 30% of Cleft Palates):\n  - Pierre Robin Sequence: Micrognathia, glossoptosis, cleft palate, severe upper airway obstruction.\n  - Treacher Collins Syndrome: Mandibulofacial dysostosis, microtia, hypoplastic zygoma/mandible.\n  - Goldenhar Syndrome: Hemifacial microsomia, vertebral defects, ocular epibulbar dermoids.\n  - 22q11.2 Deletion (DiGeorge / Velocardiofacial): Conotruncal cardiac defects, hypocalcemia, cleft palate.\n• Anatomic Airway Challenges:\n  - Laryngoscope blade tends to slip into the cleft gap on the alveolar ridge or palate, displacing the blade and obscuring the glottic view.\n  - Mitigation: Pack the alveolar cleft with a sterile gauze pad or use a 2-blade technique / Miller straight blade."
      },
      {
        h: "3. Preoperative Evaluation & Bedside Exam",
        b: "• Bedside Clinical Examination:\n  - Nutritional Status: Ineffective suckling and nasal regurgitation cause malnutrition, dehydration, and failure to thrive.\n  - Respiratory Infections: Chronic aspiration of feeds and recurrent otitis media; rule out active upper respiratory infection (URI).\n  - Cardiac Screening: Mandatory pre-op echocardiogram to rule out associated congenital heart defects (VSD, ASD, Tetralogy of Fallot).\n• Fasting Guidelines (ASA / ESPA 2024):\n  - Clear liquids: 1 hour (breast milk: 3–4 hours; infant formula: 6 hours)."
      },
      {
        h: "4. Anesthetic Strategy: Induction, Tube Choice & Dingman Retractor",
        b: "• Induction Technique:\n  - Inhalational induction with Sevoflurane in 100% O₂ is standard for pediatric patients without IV access.\n  - Maintain spontaneous ventilation until adequate mask ventilation is verified.\n• Endotracheal Tube Selection: SOUTH-FACING ORAL PREFORMED (RAE) TUBE.\n  - Bends downwards over the chin, keeping the circuit entirely out of the surgical field.\n  - Microcuffed or uncuffed tube, taped securely in the midline to the lower lip.\n• DINGMAN MOUTH GAG AIRWAY HAZARDS:\n  - Insertion and opening of the Dingman retractor can compress the endotracheal tube against the lower teeth or posterior pharynx, causing severe airway obstruction or acute accidental extubation!\n  - Check bilateral breath sounds, peak airway pressure, and EtCO₂ IMMEDIATELY after opening the mouth gag and after any repositioning.\n  - Gag compression can also compress the tongue, causing post-extubation macroglossia."
      },
      {
        h: "5. Specific Intraoperative Concerns & Throat Pack Protocol",
        b: "• Mandatory Pharyngeal Throat Pack:\n  - Prevents surgical blood, clots, and bone fragments from pooling in the stomach or trickling into the larynx around the tube.\n  - Strict Safety Protocol: Label \"THROAT PACK IN SITU\" on patient's forehead or tape pack tail outside mouth. Remove pack and inspect hypopharynx under direct vision BEFORE extubation!\n• Local Anesthetic Infiltration: Surgeon infiltrates Bupivacaine (0.25%) or Lignocaine with Adrenaline (1:200,000) for hemostasis. Monitor for systemic absorption and ventricular arrhythmias."
      },
      {
        h: "6. Postoperative Concerns, Tongue Traction Stitch & Exam Pearls",
        b: "• Tongue Traction Suture:\n  - A heavy silk suture is placed through the anterior tongue at the end of surgery.\n  - If the infant develops post-extubation airway obstruction from glossoptosis or palate edema, gentle forward traction on the suture immediately clears the airway.\n• Post-Extubation Airway Obstruction:\n  - Narrowed pharyngeal dimensions after palate closure predispose to severe desaturation.\n  - Extubate only when FULLY AWAKE, breathing spontaneously with vigorous purposeful movements.\n  - Recover in lateral or prone / semi-prone (tonsil position) to facilitate drainage of blood and secretions.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: How does bilateral infraorbital nerve block benefit cleft lip repair?\n    A: Infiltration of 0.5–1.0 mL 0.25% Bupivacaine at the infraorbital foramen provides superb postoperative analgesia without respiratory depression, enabling smooth awake extubation."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 35, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 76, Elsevier, 2025/2026.",
      "Cote CJ, Lerman J, Anderson BJ. A Practice of Anesthesia for Infants and Children, 6th ed., Elsevier."
    ]
  },

  // 8. TONSILLECTOMY & POST-TONSILLECTOMY HEMORRHAGE
  {
    id: "case-tonsillectomy-airway-emergencies",
    cat: "case_pediatric",
    name: "Tonsillectomy & Post-Tonsillectomy Hemorrhage",
    short: "Tonsillectomy Hemorrhage",
    tags: ["Pediatric", "Tonsillectomy", "Post-Op Bleeding", "Full Stomach", "Resuscitation", "Two Suctions", "Case Discussion"],
    tagline: "Hidden swallowed blood hypovolemia, modified RSI with 2 suctions, fluid resuscitation & extubation criteria",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 36; Miller's Anesthesia, 10th ed., Ch. 76; Cote CJ, Practice of Anesthesia for Infants and Children.",
    sections: [
      {
        h: "1. Definition, Classification & The Bleeding Timeline",
        b: "• Definition: Surgical removal of the palatine tonsils. Post-tonsillectomy hemorrhage (PTH) is a major pediatric ENT life-threatening emergency.\n• Classification of Post-Tonsillectomy Bleeding:\n  - Primary Hemorrhage (< 24 hours): Typically occurs within 6 hours post-op; due to surgical technique, loose ligature, or slipping of eschar (incidence 0.5%–1.5%).\n  - Secondary Hemorrhage (> 24 hours to 14 days): Peaks between postoperative days 5 and 8; secondary to sloughing of the healing eschar, granulation tissue, or local bacterial infection (incidence 2%–5%).\n• The Clinical Trap: \"Hidden Swallowed Blood\":\n  - Children swallow large volumes of blood unnoticed without spitting. The child presents in profound unappreciated hypovolemic shock with a stomach filled with heavy, acidic blood clots!"
      },
      {
        h: "2. Pathophysiology: Hypovolemic Shock & Difficult Laryngoscopy",
        b: "• Hemodynamic Cascade:\n  - Tachycardia is the earliest compensatory sign. Hypotension is a very late and ominous sign in pediatric shock (indicates > 30%–40% circulating volume loss!).\n  - Lethal Induction Trap: Administering standard induction agents (Propofol) in an unresuscitated child with hypovolemia causes immediate catastrophic cardiovascular collapse!\n• Airway Nightmare:\n  - Blood, active oozing, and large clots pool in the posterior oropharynx.\n  - Laryngoscopic blade view is instantly obscured by blood upon insertion; glottis cannot be visualized.\n  - High risk of pulmonary aspiration of acidic gastric blood."
      },
      {
        h: "3. Preoperative Evaluation, Resuscitation & Blood Cross-Match",
        b: "• Mandatory Emergency Resuscitation FIRST:\n  - NEVER induce anesthesia in an unresuscitated, hypovolemic child to \"stop the bleeding faster\"!\n  - Secure TWO large-bore peripheral IV lines immediately.\n  - Fluid Resuscitation: Balanced crystalloid bolus 20 mL/kg rapidly. Re-evaluate heart rate, pulse volume, and capillary refill time (< 2 sec).\n  - Blood Transfusion: Send stat cross-match; if child is in decompensated shock (hypotension, pallor, altered sensorium), initiate uncrossmatched O-negative PRBC transfusion (10 mL/kg).\n  - Pre-op Blood Work: Stat Hemoglobin/Hematocrit, Platelet count, PT/INR, aPTT."
      },
      {
        h: "4. Anesthetic Strategy: Modified Rapid Sequence Induction (RSI)",
        b: "• Pre-Induction Setup (The \"Two Suctions\" Rule):\n  - Prepare TWO independently operating, high-power suction units with rigid large-bore Yankauer tips.\n  - Endotracheal tubes: One expected size and two smaller sizes (0.5 and 1.0 mm smaller) with stylets in situ.\n  - Videolaryngoscope (e.g. McGrath or GlideScope) and traditional Macintosh/Miller blades ready.\n• Preoxygenation: 100% FiO₂ for 3–5 minutes via tight-fitting mask (or spontaneous breaths with high flow if child resists).\n• Modified RSI Execution:\n  - Head-down (Trendelenburg) or slight left lateral tilt allows blood to pool in the cheek away from laryngeal inlet.\n  - Induction Agent: KETAMINE (1.5–2.0 mg/kg IV) is the agent of choice (preserves sympathetic tone and hemodynamics). Etomidate (0.2–0.3 mg/kg) is an excellent alternative. AVOID PROPOFOL!\n  - Neuromuscular Blocker: ROCURONIUM (1.2 mg/kg) or SUCCINYLCHOLINE (1.5–2.0 mg/kg) for rapid, intense paralysis within 45–60 seconds.\n  - Cricoid pressure (Sellick's maneuver) applied cautiously without distorting laryngeal view."
      },
      {
        h: "5. Specific Intraoperative Concerns & Emptying the Stomach",
        b: "• Intubation & Tube Security:\n  - Cuffed endotracheal tube is mandatory to protect against ongoing pulmonary aspiration.\n  - Once intubated and cuff inflated, verify bilateral air entry and EtCO₂.\n• Mandatory Stomach Evacuation:\n  - Pass a large-bore orogastric tube (14–16 Fr) and aspirate stomach contents in supine, left, and right lateral positions.\n  - Lavage with aliquots of saline until clear aspirate is obtained to prevent post-extubation vomiting and aspiration.\n• Boyle-Davis Mouth Gag Precautions:\n  - Just like Dingman retractor, opening the Boyle-Davis gag can kink the ETT or accidentally extubate the patient. Auscultate lung fields immediately after gag placement!"
      },
      {
        h: "6. Postoperative Concerns, Awake Extubation & Exam Pearls",
        b: "• Strict Extubation Criteria:\n  - Extubation must be performed WIDE AWAKE with full return of protective airway reflexes, vigorous spontaneous breathing, and eyes open.\n  - Position: Lateral \"Tonsil Position\" (Left lateral decubitus with head down) ensures any residual blood or vomitus trickles out of the mouth rather than into the trachea.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is post-tonsillectomy bleeding considered a \"Triple Hazard\"?\n    A: 1) Hypovolemic shock from hidden swallowed blood; 2) Difficult airway obscured by active hemorrhage and clots; 3) Full stomach with high risk of pulmonary aspiration.\n  - Q: What are the extubation criteria in a child after post-tonsillectomy bleed repair?\n    A: Full reversal of neuromuscular blockade, completely empty stomach, child wide awake with active cough/swallow reflexes, in lateral head-down recovery position."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 36, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 76, Elsevier, 2025/2026.",
      "Cote CJ, Lerman J, Anderson BJ. A Practice of Anesthesia for Infants and Children, 6th ed., Elsevier."
    ]
  }
];
