// Comprehensive Clinical Case Discussions (Part 2)
// Covers Obstetric, Neuro, Trauma, Ortho, Geriatric, Endocrine, Renal & Surgical cases

module.exports = [
  // ============================================================================
  // OBSTETRIC ANAESTHESIA CASES (case_obstetric)
  // ============================================================================
  {
    id: "case-hypertensive-disorders-pregnancy",
    cat: "case_obstetric",
    name: "Hypertensive Disorders in Pregnancy & Severe Preeclampsia",
    short: "Preeclampsia & HTN in Pregnancy",
    tags: ["Obstetric", "Preeclampsia", "Eclampsia", "Magnesium Sulfate", "Neuraxial", "Case Discussion"],
    tagline: "Multiorgan endothelial dysfunction, magnesium sulfate dosing, target BP 140–150/90–100 & neuraxial vs general anaesthesia",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 12 (Hypertensive Disorders in Pregnancy); Miller's Anesthesia, 10th ed., Ch. 69 (Obstetric Anesthesia); ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia.",
    sections: [
      {
        h: "1. Diagnostic Definitions & Severe Features",
        b: "• Diagnostic Definitions:\n  - Gestational Hypertension: New-onset SBP ≥ 140 mmHg or DBP ≥ 90 mmHg after 20 weeks of gestation in the absence of proteinuria or systemic features.\n  - Preeclampsia: Hypertension after 20 weeks plus either Proteinuria (≥ 300 mg/24h or urine protein:creatinine ratio ≥ 0.3) OR any feature of multiorgan dysfunction.\n• Preeclampsia with Severe Features (ACOG Criteria):\n  1. Blood Pressure: SBP ≥ 160 mmHg or DBP ≥ 110 mmHg on two occasions at least 4 hours apart.\n  2. Thrombocytopenia: Platelet count < 100,000 /mm³.\n  3. Impaired Liver Function: Serum transaminases > 2 times upper limit of normal or severe persistent right upper quadrant / epigastric pain.\n  4. Renal Insufficiency: Serum creatinine > 1.1 mg/dL or doubling of baseline.\n  5. Pulmonary Edema.\n  6. New-onset Cerebral or Visual Disturbances: Severe headache, scotomas, photopsia, hyperreflexia."
      },
      {
        h: "2. Pathophysiology: Systemic Endothelial Activation",
        b: "Defective trophoblastic invasion of uterine spiral arteries leads to chronic placental ischemia, releasing anti-angiogenic factors (soluble fms-like tyrosine kinase-1 [sFlt-1] and soluble endoglin [sEng]) that neutralize VEGF and PlGF, triggering widespread systemic maternal endothelial cell dysfunction:\n\n• Multisystem Manifestations:\n  - Vascular: Intense vasospasm, high SVR, capillary leak, and severe intravascular volume depletion (despite gross peripheral edema!).\n  - Airway: Marked pharyngeal, laryngeal, and vocal cord edema. The airway in preeclampsia is friable, narrow, and prone to catastrophic rapid desaturation during intubation.\n  - Hematological: Consumptive thrombocytopenia, microangiopathic hemolytic anemia, DIC.\n  - Uteroplacental: Decreased placental perfusion, fetal growth restriction, oligohydramnios."
      },
      {
        h: "3. Seizure Prophylaxis: The Magnesium Sulfate Protocol",
        b: "Magnesium sulfate is the undisputed gold-standard agent for eclampsia prevention and treatment (Collaborative Eclampsia Trial):\n\n• The Pritchard / Zuspan Regimens:\n  - IV Loading Dose: 4 to 6 grams of Magnesium Sulfate (20% solution) IV infused slowly over 15 to 20 minutes.\n  - IV Maintenance Infusion: 1 to 2 grams/hour continuous infusion, maintained for 24 hours postpartum.\n• Therapeutic Range & Toxicity Monitoring:\n  - Therapeutic Serum Magnesium Level: 4.8 to 8.4 mg/dL (2.0–3.5 mmol/L).\n  - Loss of Patellar Reflexes: 8 to 12 mg/dL (earliest warning sign of toxicity!).\n  - Respiratory Depression / Arrest: 12 to 15 mg/dL.\n  - Cardiac Conduction Arrest (Asystole): > 20 mg/dL.\n• Mandatory Bedside Monitoring Checks:\n  1. Patellar tendon reflex present\n  2. Respiratory rate > 12 breaths/min\n  3. Urine output > 25–30 mL/h (Magnesium is excreted 100% via kidneys; oliguria causes lethal accumulation!).\n• Antidote: CALCIUM GLUCONATE 10% — 10 mL (1 g) IV infused slowly over 5 minutes."
      },
      {
        h: "4. Acute Antihypertensive Therapy",
        b: "• Target Blood Pressure: Lower blood pressure smoothly to 140–150 / 90–100 mmHg. AVOID precipitous drops (reduces uteroplacental perfusion, causing acute fetal bradycardia/distress!):\n• First-Line Agents for Severe Hypertension (BP ≥ 160/110):\n  - IV Labetalol: 20 mg IV initial bolus, followed by 40 mg, then 80 mg every 10–20 min (max 300 mg cumulative), or continuous infusion. Avoid in maternal asthma or bradycardia.\n  - IV Hydralazine: 5 to 10 mg IV slow push every 20 min (max 20–30 mg). May cause maternal reflex tachycardia and headache.\n  - Oral Immediate-Release Nifedipine: 10 to 20 mg orally (do not give sublingually)."
      },
      {
        h: "5. Anesthetic Technique for Cesarean Delivery: Spinal vs General",
        b: "• Neuraxial Anesthesia is Strongly Preferred:\n  - Spinal or Epidural anaesthesia avoids the hypertensive surge and airway trauma of general anaesthesia.\n  - Platelet Count Threshold: Spinal or epidural anaesthesia is considered safe if platelet count is ≥ 70,000–80,000 /mm³, provided platelet count is stable and coagulation profile (PT/INR, aPTT, fibrinogen) is normal.\n  - Careful Pre-Hydration: Give modest crystalloid bolus (500–1000 mL); avoid large fluid loads (> 1500 mL) which precipitate pulmonary edema!\n• If General Anesthesia is Unavoidable (e.g. Platelets < 50,000 or Eclamptic Seizure):\n  - EXTREME HAZARD: Laryngoscopy triggers a massive sympathetic surge that can cause intracranial hemorrhage or acute LV failure.\n  - Blunting the Pressor Response: Administer IV Labetalol 10–20 mg, Remifentanil 1 mcg/kg, or Lignocaine 1.5 mg/kg immediately prior to RSI.\n  - Prepare styleted ETT one size smaller (6.0 or 6.5 mm) due to severe airway edema.\n  - Note: Magnesium sulfate potentiates non-depolarizing muscle relaxants by 3-fold; titrate rocuronium/vecuronium with TOF monitoring!"
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 12, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol 2020;135(6):e237-e260."
    ]
  },
  {
    id: "case-pregnancy-anemia",
    cat: "case_obstetric",
    name: "Pregnancy: Physiological Changes & Severe Gestational Anemia",
    short: "Pregnancy Physiology & Anemia",
    tags: ["Obstetric", "Physiology", "Aortocaval Compression", "Severe Anemia", "Transfusion", "Case Discussion"],
    tagline: "40–50% plasma volume expansion, aortocaval compression left lateral tilt, severe anemia & cardiac compensation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 13 (Pregnancy: Physiological Changes and Anemia); Miller's Anesthesia, 10th ed., Ch. 69; Chestnut's Obstetric Anesthesia, 6th ed.",
    sections: [
      {
        h: "1. Cardiovascular & Respiratory Adaptations in Pregnancy",
        b: "Pregnancy produces profound physiological remodeling across every organ system to sustain fetal development:\n\n• Cardiovascular Adaptations:\n  - Plasma Volume & Red Cell Mass: Plasma volume increases by 45%–50%, while red blood cell mass increases by only 20%–30%. This physiological mismatch produces the \"Physiological Anemia of Pregnancy\" (normal nadir Hb ~11 g/dL at 28–32 weeks).\n  - Cardiac Output: Increases by 40%–50% above non-pregnant baseline by the end of the second trimester (via 30% increase in stroke volume and 15% increase in heart rate).\n  - Systemic Vascular Resistance (SVR): Decreases by 20%–30% due to the low-resistance placental vascular bed and circulating progesterone and prostacyclin.\n• Respiratory Adaptations:\n  - Minute Ventilation increases by 50% (driven primarily by increased tidal volume via progesterone stimulation of respiratory center), causing physiological chronic respiratory alkalosis (normal pregnancy ABG: pH 7.44, PaCO₂ 30–32 mmHg, HCO₃⁻ 20–22 mEq/L).\n  - Functional Residual Capacity (FRC): Decreases by 20%–30% at term as the gravid uterus elevates the diaphragm. Coupled with a 20% increase in oxygen consumption, term parturients desaturate with alarming rapidity during apnoea."
      },
      {
        h: "2. The Supine Hypotensive Syndrome (Aortocaval Compression)",
        b: "• Pathophysiology:\n  - Occurs beyond 20 weeks of gestation when the mother lies completely supine.\n  - The heavy gravid uterus compresses the Inferior Vena Cava (IVC), drastically decreasing venous return to the right atrium and reducing cardiac output by up to 30%–40%, causing maternal hypotension, pallor, dizziness, nausea, and severe fetal bradycardia.\n  - Simultaneous compression of the abdominal aorta compromises uteroplacental and lower limb perfusion.\n• Mandatory Preventive Rule:\n  - LEFT LATERAL TILT (15 degrees) must be maintained at all times on the operating table using a wedge placed under the right hip or tilting the table laterally to the left."
      },
      {
        h: "3. Severe Gestational Anemia: Staging & Haemodynamic Impact",
        b: "• Staging (WHO Criteria):\n  - Mild Anemia: Hb 10.0–10.9 g/dL\n  - Moderate Anemia: Hb 7.0–9.9 g/dL\n  - Severe Anemia: Hb < 7.0 g/dL\n  - Very Severe / Decompensated Anemia: Hb < 4.0 g/dL.\n• Cardiovascular Compensation & Heart Failure:\n  - In severe anemia, the hyperdynamic state is magnified to preserve tissue oxygen delivery (DO₂ = Cardiac Output × CaO₂). Viscosity drops, stroke volume surges, and high-output cardiac failure can precipitate with fluid loading or tachycardia.\n• Preoperative Optimization:\n  - If elective with time (> 2–3 weeks before delivery): Parenteral Iron Sucrose or Ferric Carboxymaltose infusions.\n  - If near delivery or symptomatic: Transfuse Packed Red Blood Cells slowly with furosemide diuresis to target Hb ≥ 8.5–9.0 g/dL prior to labor/delivery."
      },
      {
        h: "4. Anesthetic Technique in Severe Anemia",
        b: "• Regional Anesthesia (Spinal / Epidural) Considerations:\n  - Sympathectomy from spinal anaesthesia removes compensatory vasoconstriction; hypotension can be profound.\n  - Use co-loading with balanced crystalloids and a prophylactic Norepinephrine (4–8 mcg/min) or Phenylephrine infusion.\n• Oxygen Supplementation: High inspired oxygen concentration (FiO₂ 0.50–1.0) must be administered continuously."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 13, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-emergency-lscs",
    cat: "case_obstetric",
    name: "Emergency Lower Segment Cesarean Section (LSCS)",
    short: "Emergency LSCS",
    tags: ["Obstetric", "LSCS", "Crash C-Section", "Aspiration RSI", "Uterotonics", "Case Discussion"],
    tagline: "Category 1 crash cesarean decision-to-delivery < 30 min, spinal vs RSI general, aspiration prophylaxis & uterotonic rules",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 14 (Emergency Lower Segment Cesarean Section); Miller's Anesthesia, 10th ed., Ch. 69; RCOG Good Practice No. 11.",
    sections: [
      {
        h: "1. The 4 Categories of Urgency for Cesarean Delivery",
        b: "• Category 1 (Emergency / \"Crash LSCS\"): Immediate threat to life of the woman or fetus (e.g. sustained fetal bradycardia, cord prolapse, uterine rupture, placental abruption with fetal compromise). Decision-to-delivery interval target: < 30 minutes (or < 15 minutes for acute cord prolapse).\n• Category 2 (Urgent): Maternal or fetal compromise which is not immediately life-threatening (e.g. failure to progress with maternal distress). Decision-to-delivery interval: < 75 minutes.\n• Category 3 (Scheduled): Needing early delivery but no maternal or fetal compromise.\n• Category 4 (Elective): Suited to maternal and team convenience."
      },
      {
        h: "2. The Full Stomach Mandate & Aspiration Prophylaxis",
        b: "EVERY PARTURIENT IS CONSIDERED TO HAVE A FULL STOMACH FROM 16 WEEKS GESTATION ONWARD:\n\n• Mechanisms:\n  1. Progesterone relaxes the lower esophageal sphincter (LES) and slows gastric motility.\n  2. The gravid uterus displaces the pylorus upward and backward, raising intragastric pressure.\n  3. Labor, anxiety, pain, and opioids virtually paralyze gastric emptying.\n• Immediate Pharmacological Aspiration Prophylaxis:\n  1. Sodium Citrate 0.3M (30 mL oral): Non-particulate antacid; instantly neutralizes gastric acid pH > 2.5 within 2 minutes.\n  2. IV Ranitidine (50 mg) or Famotidine (20 mg): H2-receptor antagonist; suppresses further gastric acid secretion.\n  3. IV Metoclopramide (10 mg): Prokinetic agent; increases lower esophageal sphincter tone and accelerates gastric emptying."
      },
      {
        h: "3. Anesthetic Technique: Rapid Sequence Spinal vs General RSI",
        b: "• Rapid Sequence Spinal Anesthesia (Default for Most Cat 1/2 Cases):\n  - If fetal heart rate is reassuring or an indwelling epidural catheter can be \"topped up\" with 2% Lignocaine + adrenaline + bicarbonate (within 5–10 minutes).\n  - Single-shot spinal: 0.5% Hyperbaric Bupivacaine (1.8–2.0 mL) + Fentanyl 15 mcg or Buprenorphine; achieves T4 sensory level.\n• General Anesthesia with Rapid Sequence Induction (RSI) — When Mandatory:\n  - Indicated for: Severe sustained bradycardia without working epidural, severe maternal hemorrhage, refusal of regional, or maternal eclamptic seizure.\n  - Step-by-Step RSI Execution:\n    1. 100% Preoxygenation for 3–5 minutes with tight mask seal (or 8 vital capacity breaths over 60 seconds).\n    2. Left lateral tilt 15 degrees.\n    3. Propofol (2–2.5 mg/kg) or Ketamine (1–1.5 mg/kg in hemorrhage/shock).\n    4. Succinylcholine (1.5 mg/kg) or Rocuronium (1.2 mg/kg with Sugammadex available).\n    5. Cricoid pressure (Sellick maneuver: 10N awake, 30N once unconscious) applied continuously until cuffed ETT position is confirmed by capnography.\n    6. Avoid hyperventilation (causes maternal alkalosis and uterine vasoconstriction)."
      },
      {
        h: "4. Uterotonic Management Following Delivery",
        b: "• Oxytocin (First-Line):\n  - Bolus: 3 units IV slow push over 15 seconds (AVOID rapid bolus of 5–10 units! Rapid oxytocin triggers severe hypotension, tachycardia, ST-segment depression, and cardiovascular collapse!).\n  - Infusion: Follow with continuous infusion of 10 to 20 units in 500 mL balanced crystalloid at 125 mL/h.\n• Second-Line Uterotonics for Uterine Atony:\n  - Methylergometrine (0.2 mg IM): Potent ergot alkaloid. ABSOLUTELY CONTRAINDICATED in preeclampsia and hypertension (causes severe hypertensive crisis and intracranial hemorrhage!).\n  - Carboprost / PGF2-alpha (250 mcg IM or intramyometrial): ABSOLUTELY CONTRAINDICATED in asthma (causes bronchospasm!).\n  - Misoprostol (800–1000 mcg per rectum or sublingual): Safe in asthma and hypertension."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 14, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "RCOG Good Practice No. 11: Classification of urgency of Caesarean section."
    ]
  },
  {
    id: "case-non-obstetric-surgery-pregnancy",
    cat: "case_obstetric",
    name: "Non-Obstetric Surgery in a Pregnant Patient",
    short: "Non-Obstetric Surgery in Pregnancy",
    tags: ["Obstetric", "Non-Obstetric Surgery", "Teratogenicity", "Appendicitis", "Fetal Heart Rate", "Case Discussion"],
    tagline: "Teratogenicity timing, avoiding nitrous oxide, maintenance of uteroplacental perfusion & perioperative fetal monitoring",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 15 (Nonobstetric Surgery in a Pregnant Patient); Miller's Anesthesia, 10th ed., Ch. 69; ASA/ACOG Committee Opinion No. 775.",
    sections: [
      {
        h: "1. Clinical Context & Surgical Indications",
        b: "Approximately 1% to 2% of pregnant women undergo non-obstetric surgery. Commonest emergencies: Acute Appendicitis (commonest, 1 in 1500), Acute Cholecystitis, Ovarian Torsion, Trauma, and breast/cervical malignancies. The cardinal anaesthetic directive is dual patient care: ensure maternal safety while simultaneously preserving fetal viability and preventing preterm labor."
      },
      {
        h: "2. Teratogenicity Concerns & Anesthetic Drug Safety",
        b: "• Critical Gestational Windows:\n  - Pre-implantation (Days 0–14): \"All-or-none\" phenomenon (embryo either dies or recovers completely without structural defects).\n  - Organogenesis (Days 15–56 / Weeks 3–8): Highest susceptibility to structural teratogens (neural tube, heart, limbs).\n  - Fetal Period (> Week 8): Growth and functional development; susceptibility to behavioral and functional abnormalities.\n• Safety Profile of Modern Anesthetic Drugs:\n  - NONE of the commonly used contemporary anesthetic agents (propofol, etomidate, ketamine, sevoflurane, isoflurane, rocuronium, opioids, bupivacaine, ropivacaine) are proven human teratogens at clinical concentrations.\n  - NITROUS OXIDE (N₂O): INHIBITS METHIONINE SYNTHASE, interfering with vitamin B12 metabolism, folate synthesis, and DNA synthesis. Avoid in the first trimester.\n  - Fetal Loss Trigger: Fetal demise is almost always caused by maternal physiological derangements (hypotension, hypoxia, severe acidosis, hypothermia) or underlying surgical disease, NOT by the anesthetic drugs themselves."
      },
      {
        h: "3. Maintenance of Uteroplacental Perfusion",
        b: "The uteroplacental circulation has NO AUTOREGULATION. Uterine blood flow (UBF) is completely pressure-dependent:\n\n• UBF = (Uterine Arterial Pressure - Uterine Venous Pressure) / Uterine Vascular Resistance.\n• Factors that Severely Compromise UBF:\n  1. Maternal Hypotension (drops uterine arterial pressure)\n  2. Maternal Hypoxia and Hypercapnia (trigger uterine vasoconstriction)\n  3. Severe Maternal Hypocapnia (PaCO₂ < 28 mmHg caused by aggressive hyperventilation leads to uterine vasoconstriction and left-shifted maternal oxyhemoglobin curve, impairing oxygen unloading to fetus)\n  4. High Airway Pressures / PEEP (reduces venous return)\n  5. Aortocaval Compression (requires strict 15-degree left tilt).\n• Vasopressor of Choice: Ephedrine or Phenylephrine (titrated to maintain maternal MAP at baseline; phenylephrine preserves fetal acid-base balance better when monitored)."
      },
      {
        h: "4. Fetal Heart Rate (FHR) Monitoring & Tocolysis",
        b: "• FHR Monitoring Protocol:\n  - Prior to 24 Weeks: Doppler verification of FHR before and after the procedure.\n  - Beyond 24 Weeks (Viable Gestation): Continuous intraoperative cardiotocography (CTG) monitoring by a designated obstetrics team if the fetus is viable and emergency delivery would be performed if fetal distress occurs.\n• Tocolysis: Prophylactic tocolytic therapy is NOT routinely indicated. Postoperative tocolysis (Indomethacin, Nifedipine, Atosiban) is initiated only if active uterine contractions are documented."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 15, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "ACOG Committee Opinion No. 775: Nonobstetric Surgery During Pregnancy. Obstet Gynecol 2019 (Reaffirmed 2023)."
    ]
  },
  {
    id: "case-amniotic-fluid-embolism",
    cat: "case_obstetric",
    name: "Amniotic Fluid Embolism (AFE)",
    short: "Amniotic Fluid Embolism",
    tags: ["Obstetric", "AFE", "Collapse", "DIC", "A-OK Protocol", "Perimortem C-Section", "Case Discussion"],
    tagline: "Anaphylactoid syndrome of pregnancy, sudden cardiovascular collapse, consumptive DIC & A-OK resuscitation protocol",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 16 (Amniotic Fluid Embolism); Miller's Anesthesia, 10th ed., Ch. 69; Society for Maternal-Fetal Medicine (SMFM) Consult Series #38.",
    sections: [
      {
        h: "1. Clinical Triad & Pathophysiological Mechanism",
        b: "Amniotic Fluid Embolism (AFE), more accurately termed the \"Anaphylactoid Syndrome of Pregnancy,\" is an unpredictable, catastrophic obstetric emergency (mortality 20%–40%):\n\n• The Classic Clinical Triad:\n  1. Sudden Acute Cardiovascular Collapse & Severe Hypotension\n  2. Profound Hypoxemic Respiratory Failure & Cyanosis\n  3. Consumptive Coagulopathy / Massive Disseminated Intravascular Coagulation (DIC).\n• Pathophysiology:\n  - Entry of amniotic fluid and fetal debris into the maternal endocervical / uterine venous circulation triggers a massive biphasic immunological anaphylactoid reaction:\n  - Phase 1 (Transient Pulmonary Vasoconstriction): Release of endothelin, thromboxane, and leukotrienes triggers severe acute pulmonary vasoconstriction, acute right ventricular failure, and profound cardiogenic shock.\n  - Phase 2 (Left Ventricular Failure & DIC): Release of tissue factor-like procoagulants triggers fulminant systemic activation of the clotting cascade, consumptive coagulopathy, massive uterine atony, and pulmonary edema."
      },
      {
        h: "2. Immediate Resuscitation & High-Quality CPR Protocol",
        b: "• Immediate Multidisciplinary Emergency Call: Alert obstetrics, anaesthesia, hematology, blood bank, and ICU teams.\n• High-Quality Maternal Resuscitation:\n  - 100% O₂ and immediate endotracheal intubation.\n  - LEFT UTERINE DISPLACEMENT: If the patient is supine, manual left uterine displacement (LUD) is mandatory during chest compressions to relieve aortocaval compression.\n• THE 4-MINUTE RULE / PERIMORTEM CESAREAN SECTION (RESUSCITATIVE HYSTEROTOMY):\n  - If maternal Return of Spontaneous Circulation (ROSC) is NOT achieved within 4 minutes of cardiac arrest in a patient ≥ 20 weeks gestation, DELIVERY OF THE FETUS MUST BE INITIATED IMMEDIATELY AT THE BEDSIDE, WITH COMPLETE DELIVERY WITHIN 5 MINUTES.\n  - Rationale: Emptying the uterus relieves IVC compression, improving maternal venous return by > 60%, drastically increasing the likelihood of successful maternal resuscitation!"
      },
      {
        h: "3. The \"A-OK\" Pharmacological Protocol for AFE",
        b: "A targeted evidence-based pharmacological cocktail proposed by Clark and colleagues to block the pathophysiological cascade in AFE:\n\n• A — ATROPINE (0.5 to 1.0 mg IV): Blunts vagal-mediated pulmonary vasoconstriction and bradycardia.\n• O — ONDANSETRON (8 mg IV): Potent 5-HT3 serotonin receptor antagonist; blocks serotonin release from degranulating platelets, relieving pulmonary vasoconstriction.\n• K — KETOROLAC (30 mg IV): Blocks cyclooxygenase and thromboxane generation, halting the pulmonary hypertensive cascade."
      },
      {
        h: "4. Aggressive Coagulopathy & Transfusion Protocol",
        b: "• DIC develops with lightning speed in >80% of cases.\n• Immediate Activation of Massive Transfusion Protocol (MTP):\n  - Transfuse Packed Red Blood Cells, Fresh Frozen Plasma, and Platelets in a 1:1:1 ratio.\n  - Cryoprecipitate: Fibrinogen is consumed rapidly; transfuse cryoprecipitate (10–20 units) early to maintain serum fibrinogen > 200 mg/dL.\n  - Tranexamic Acid (TXA): 1 gram IV bolus infused over 10 minutes (repeat 1 g at 30 min if ongoing hemorrhage)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 16, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "Society for Maternal-Fetal Medicine (SMFM) Consult Series #38: Amniotic fluid embolism. Am J Obstet Gynecol 2016;214(2):B6-B10."
    ]
  },
  {
    id: "case-obstetric-hemorrhage-pph",
    cat: "case_obstetric",
    name: "Obstetric Hemorrhage & Placenta Accreta Spectrum",
    short: "Obstetric Hemorrhage & PAS",
    tags: ["Obstetric", "PPH", "Placenta Accreta", "MTP", "Bakri Balloon", "Case Discussion"],
    tagline: "Primary PPH 4 Ts, stepped uterotonics, placenta accreta spectrum surgical preparation & massive transfusion protocol",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 17 (Obstetric Hemorrhage); Miller's Anesthesia, 10th ed., Ch. 69; FIGO Guidelines on Placenta Accreta Spectrum Disorders.",
    sections: [
      {
        h: "1. Definition, Etiology & The \"4 Ts\"",
        b: "• Definition: Postpartum Hemorrhage (PPH) is blood loss ≥ 1000 mL or blood loss accompanied by symptoms/signs of hypovolemia within 24 hours postpartum.\n• The \"4 Ts\" Differential Diagnosis:\n  1. TONE (Atony — 70%–80% of cases): Multiparity, prolonged labor, chorioamnionitis, polyhydramnios, multiple gestation, tocolytics.\n  2. TISSUE (Retained placenta, cotyledons, invasive placenta accreta spectrum) — 10%–15%.\n  3. TRAUMA (Cervical/vaginal lacerations, uterine rupture, hematomas) — 10%.\n  4. THROMBIN (Coagulopathy — preeclampsia, abruptio placentae, sepsis, AFE) — 1%."
      },
      {
        h: "2. Stepped Medical & Mechanical Hemostasis",
        b: "• Stepped Uterotonic Protocol:\n  - 1st Line: Oxytocin (3–5 units slow IV bolus, followed by 20–40 units/L infusion).\n  - 2nd Line: Methylergometrine 0.2 mg IM (contraindicated in HTN) OR Carboprost 250 mcg IM/intramyometrial (contraindicated in asthma).\n  - 3rd Line: Misoprostol 800–1000 mcg per rectum.\n  - Hemostatic Adjunct: Tranexamic Acid (TXA) 1 g IV given within 3 hours of bleeding onset (WOMAN trial proved 30% reduction in bleeding death).\n• Mechanical & Surgical Interventions:\n  - Uterine Tamponade: Bakri intrauterine balloon catheter (inflated with 300–500 mL sterile saline).\n  - Compressive Sutures: B-Lynch or Hayman uterine compression sutures.\n  - Uterine Artery Embolization (UAE) or Emergency Peripartum Hysterectomy."
      },
      {
        h: "3. Placenta Accreta Spectrum (PAS) — The Extreme Surgical Challenge",
        b: "• Pathology: Defective decidua basalis leading to direct attachment of chorionic villi to the myometrium (Accreta), invasion into myometrium (Increta), or penetration through the serosa into adjacent bladder/pelvic structures (Percreta). Major risk factors: previous cesarean section + placenta previa.\n• Specialized Surgical Setup:\n  - Invasive arterial line, wide-bore central venous access, and rapid fluid infuser (Belmont / Level 1) primed.\n  - Cell Salvage in the OR (safe in obstetrics with leucocyte depletion filters).\n  - Interventional Radiology: Placement of prophylactic internal iliac / balloon occlusion catheters prior to delivery.\n  - Hysterectomy with placenta left in situ: Avoid attempting manual placental removal (triggers torrential fatal hemorrhage)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 17, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "Jauniaux E, et al. FIGO consensus guidelines on placenta accreta spectrum disorders. Int J Gynaecol Obstet 2018;140(3):265-273."
    ]
  },

  // ============================================================================
  // NEUROANAESTHESIA & SPINE CASES (case_neuro)
  // ============================================================================
  {
    id: "case-hydrocephalus-vp-shunt",
    cat: "case_neuro",
    name: "Hydrocephalus & Ventriculoperitoneal (VP) Shunt",
    short: "Hydrocephalus & VP Shunt",
    tags: ["Neuro", "Hydrocephalus", "VP Shunt", "Monroe Kellie", "Raised ICP", "Case Discussion"],
    tagline: "Monroe-Kellie doctrine, Cushing triad, smooth intravenous induction & peritoneal tunneling complications",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 18 (Hydrocephalus); Miller's Anesthesia, 10th ed., Ch. 63 (Neuroanesthesia); Cottrell & Patel's Neuroanesthesia, 7th ed.",
    sections: [
      {
        h: "1. Etiology, Pathophysiology & The Monroe-Kellie Doctrine",
        b: "• Etiology of Hydrocephalus:\n  - Communicating (Non-obstructive): Impaired CSF reabsorption at arachnoid granulations (post-meningitis, subarachnoid hemorrhage, post-trauma).\n  - Non-Communicating (Obstructive): Physical blockage within the ventricular system (aqueductal stenosis, Dandy-Walker malformation, colloid cyst, posterior fossa tumors).\n• The Monroe-Kellie Doctrine:\n  - The intracranial vault is a rigid, non-compliant box containing Brain Parenchyma (80%), Blood (10%), and CSF (10%).\n  - An increase in any one component must be compensated by a reciprocal decrease in another, or Intracranial Pressure (ICP) will rise steeply once compensatory spatial reserves (CSF displacement into spinal sac and venous blood extrusion) are exhausted.\n• The Cushing Triad (Impending Herniation Alert):\n  - 1. Systemic Hypertension with widening pulse pressure\n  - 2. Bradycardia (reflex vagal activation via medullary baroreceptors)\n  - 3. Irregular, depressed respiration (Cheyne-Stokes or ataxic breathing)."
      },
      {
        h: "2. Preoperative Assessment & Anesthetic Strategy",
        b: "• Bedside Evaluation: Look for signs of raised ICP (headache, projectile vomiting, papilledema, sunsetting eyes in infants, bulging fontanelle). Avoid sedative premedication (hypoventilation causes hypercapnia, which triggers massive cerebral vasodilation and intracranial herniation!).\n• Induction & Airway Strategy:\n  - Smooth induction with Propofol / Thiopental + Opioids (Fentanyl 3–5 mcg/kg) to completely blunt the intubation response.\n  - Non-depolarizing muscle relaxant (Rocuronium / Vecuronium). Avoid succinylcholine if alternative available (transiently raises ICP by 5–10 mmHg).\n  - Target PaCO₂ 32–35 mmHg (mild hyperventilation constricts cerebral arterioles and relaxes brain tissue)."
      },
      {
        h: "3. Intraoperative Complications of Shunt Tunneling",
        b: "• Subcutaneous Tunneling Hazards:\n  - The surgeon tunnels the distal shunt catheter from the scalp incision, through the neck and chest wall, into the peritoneum.\n  - Complications during tunneling:\n    1. Severe Vagal Bradycardia / Asystole: Traction on the neck or carotid sheath.\n    2. Accidental Vessel Puncture: Subclavian or internal jugular vein laceration causing hematoma or pneumothorax.\n    3. Visceral Perforation: Trocar puncture of bowel or bladder during peritoneal entry."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 18, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-meningomyelocele-repair",
    cat: "case_neuro",
    name: "Meningomyelocele & Spinal Dysraphism",
    short: "Meningomyelocele",
    tags: ["Neuro", "Pediatric", "Meningomyelocele", "Latex Allergy", "Chiari II", "Case Discussion"],
    tagline: "Chiari II malformation, sterile sac doughnut positioning, latex allergy precautions & prone emergence",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 19 (Meningomyelocele); Miller's Anesthesia, 10th ed., Ch. 63 & 76; Cote CJ, Practice of Anesthesia for Infants and Children.",
    sections: [
      {
        h: "1. Pathology & Associated Anomalies",
        b: "• Pathology: Neural tube defect resulting from failure of closure of the posterior neuropore at the 4th gestational week. Herniation of meninges and dysplastic spinal cord elements through a bifid spine, usually lumbosacral.\n• Associated Anomalies:\n  - Chiari II Malformation (>90%): Downward displacement of cerebellar vermis, 4th ventricle, and brainstem through the foramen magnum, producing hydrocephalus, stridor, and central apnea.\n  - Hydrocephalus (80%): Usually requires VP shunt placement."
      },
      {
        h: "2. The Positioning Challenge During Intubation",
        b: "THE DORSAL SAC MUST NEVER BEAR PRESSURE OR SUFFER RUPTURE DURING INDUCTION:\n\n• Airway Positioning Technique Options:\n  - Technique A (Doughnut / Foam Bolster): Place a circular padded foam ring or wrapped sterile drape beneath the infant's sacrum, suspending the neural placode untouched in the center.\n  - Technique B (Lateral Position): Intubate with the neonate positioned in the lateral decubitus position.\n  - Technique C (Held by Assistant): Assistant holds the baby with hips suspended off the bed."
      },
      {
        h: "3. Intraoperative Conduct & Strict Latex Allergy Protocol",
        b: "• Prone Positioning Care: Patient is turned prone for surgery. Support chest and pelvis on soft rolls; abdomen must hang completely free to prevent IVC compression and epidural venous engorgement.\n• LATEX ANAPHYLAXIS SENSITIVITY:\n  - Children with meningomyelocele have a > 50% incidence of life-threatening Type I IgE-mediated Latex Allergy due to repeated early mucosal and surgical exposure.\n  - ALL MENINGOMYELOCELE PATIENTS MUST BE MANAGED IN A STRICT 100% LATEX-FREE ENVIRONMENT (latex-free gloves, catheters, bungs, and tourniquets) from the moment of birth!"
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 19, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63 & 76, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-traumatic-brain-injury-tbi",
    cat: "case_neuro",
    name: "Traumatic Brain Injury (TBI) & Emergency Craniotomy",
    short: "Traumatic Brain Injury",
    tags: ["Neuro", "TBI", "Raised ICP", "C-Spine MILS", "CPP Target", "Mannitol", "Case Discussion"],
    tagline: "Secondary brain insult prevention, CPP = MAP - ICP target 60–70 mmHg, C-spine MILS & hyperosmolar therapy",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 20 (Traumatic Brain Injury); Miller's Anesthesia, 10th ed., Ch. 63; Brain Trauma Foundation Guidelines (4th ed.).",
    sections: [
      {
        h: "1. Primary vs Secondary Brain Injury & Target Physiological Goals",
        b: "• Primary Injury: Mechanical mechanical damage at the moment of impact (contusions, lacerations, diffuse axonal injury, extradural/subdural hematoma). Irreversible.\n• Secondary Injury: Ongoing cellular ischemic cascade in the hours to days following trauma. PREVENTING SECONDARY INJURY IS THE PRIMARY JOB OF THE NEUROANAESTHETIST:\n• The Brain Trauma Foundation (BTF) Physiological Targets:\n  - Cerebral Perfusion Pressure (CPP = MAP - ICP): Maintain CPP strictly 60 to 70 mmHg.\n  - Systolic Blood Pressure: SBP ≥ 100 mmHg for age 50–69, ≥ 110 mmHg for age 15–49 or > 70 years (A single episode of SBP < 90 mmHg doubles mortality!).\n  - Oxygenation: PaO₂ > 80 mmHg (SaO₂ ≥ 95%). A single episode of hypoxemia (SpO₂ < 90%) doubles mortality.\n  - Ventilation: PaCO₂ 35 to 38 mmHg (mild normocapnia). Avoid aggressive hyperventilation (PaCO₂ < 30 mmHg causes severe cerebral vasoconstriction and secondary ischemic stroke!).\n  - Intracranial Pressure (ICP): Target < 20 to 22 mmHg.\n  - Core Temperature: Normothermia 36.0–37.0°C (hyperthermia dramatically spikes cerebral metabolic rate CMRO₂).\n  - Blood Glucose: 140 to 180 mg/dL (hyperglycemia accelerates neuronal lactic acidosis)."
      },
      {
        h: "2. Airway Management with Cervical Spine Precautions (MILS)",
        b: "ALL TBI PATIENTS ARE PRESUMED TO HAVE AN UNSTABLE CERVICAL SPINE FRACTURE UNTIL CLEARED RADIOLOGICALLY:\n\n• Manual In-Line Stabilization (MILS):\n  - An experienced assistant holds the mastoid processes and occiput with both hands, stabilizing the head and neck in neutral alignment.\n  - The anterior collar of the rigid cervical collar is opened to allow mouth opening.\n  - Videolaryngoscopy (Hyperangulated or Macintosh-blade VL) is the preferred intubation tool, minimizing C-spine movement compared to direct laryngoscopy.\n• Modified RSI Protocol: Preoxygenate; administer Fentanyl (3 mcg/kg) to blunt intracranial hypertension; Propofol/Etomidate + Rocuronium (1.2 mg/kg) or Succinylcholine."
      },
      {
        h: "3. Hyperosmolar Therapy & Fluid Selection",
        b: "• Mannitol 20%:\n  - Dose: 0.5 to 1.0 g/kg IV infused over 15 to 20 minutes.\n  - Mechanism: Expands intravascular volume, decreases blood viscosity (rheological effect), and creates an osmotic gradient drawing water from the brain parenchyma.\n  - Caveat: Causes osmotic diuresis; contraindicated in hypotensive or severely hypovolemic patients; keep serum osmolarity < 320 mOsm/L.\n• Hypertonic Saline (3% NaCl):\n  - Dose: 250 mL bolus (or 2–5 mL/kg) over 15 minutes.\n  - Advantages: Expands plasma volume, restores MAP, and lowers ICP without diuresis; preferred in polytrauma with concomitant hemorrhagic shock.\n• Fluid Selection in TBI:\n  - ISOTONIC CRYSTALLOIDS (0.9% Normal Saline or Plasmalyte) ONLY!\n  - STRICTLY AVOID HYPOTONIC FLUIDS (Ringer's Lactate is mildly hypotonic [273 mOsm/L], Dextrose solutions are hypotonic); hypotonic water rapidly crosses the injured blood-brain barrier, triggering massive fatal cerebral edema!"
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 20, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63, Elsevier, 2025/2026.",
      "Carney N, et al. Guidelines for the Management of Severe Traumatic Brain Injury, Fourth Edition. Neurosurgery 2017;80(1):6-15."
    ]
  },
  {
    id: "case-supratentorial-tumour-craniotomy",
    cat: "case_neuro",
    name: "Supratentorial Brain Tumour & Craniotomy",
    short: "Supratentorial Tumour",
    tags: ["Neuro", "Craniotomy", "Supratentorial", "Brain Relaxation", "TIVA", "Case Discussion"],
    tagline: "Mass effect, peritumoral edema, brain relaxation triad, TIVA propofol-remifentanil & smooth cough-free emergence",
    source: "Objective Anaesthesia Review, 6th ed.; Miller's Anesthesia, 10th ed., Ch. 63 (Neuroanesthesia); Cottrell & Patel's Neuroanesthesia, 7th ed.",
    sections: [
      {
        h: "1. Case Scenario & Preoperative Imaging",
        b: "A 52-year-old female presents with progressive morning headaches, vomiting, new-onset left hemiparesis, and a focal motor seizure. MRI brain demonstrates a 5.5 cm heterogeneously enhancing high-grade glioma in the right frontoparietal cortex with prominent vasogenic peritumoral edema, 8 mm midline shift, and subfalcine herniation. She is on dexamethasone 8 mg daily and levetiracetam 1000 mg BD."
      },
      {
        h: "2. The Brain Relaxation Triad",
        b: "Providing a soft, slack, non-bulging brain allows the neurosurgeon to dissect without retractor-induced cortical contusion:\n\n• The 4 Interventions for Optimal Brain Relaxation:\n  1. Mild Hyperventilation: Titrate PaCO₂ to 30–35 mmHg (causes cerebral arteriolar vasoconstriction, shrinking cerebral blood volume).\n  2. Hyperosmolar Diuresis: Administer Mannitol (0.5–1.0 g/kg) or 3% Hypertonic Saline at the start of craniotomy.\n  3. Venous Drainage Optimization: 15–30 degree head-up tilt; ensure the head is in a neutral position without extreme neck flexion or rotation that would compress internal jugular veins.\n  4. Pharmacological Suppression of CMRO₂: Propofol infusion decreases cerebral metabolic rate and cerebral blood flow."
      },
      {
        h: "3. Anesthetic Technique: Total Intravenous Anesthesia (TIVA)",
        b: "• Why TIVA is Preferred in Craniotomy:\n  - Volatile anesthetics (Sevoflurane, Isoflurane) cause dose-dependent intrinsic cerebral vasodilation (especially > 1.0 MAC), raising cerebral blood volume and ICP.\n  - Propofol preserves intact cerebral autoregulation and flow-metabolism coupling, producing lower ICP and superior surgical brain relaxation compared to volatile agents.\n• Maintenance Regimen:\n  - Propofol (TCI 3–5 mcg/mL or 100–150 mcg/kg/min) + Remifentanil (0.1–0.3 mcg/kg/min) or Fentanyl.\n  - Neuromuscular blockade titrated with TOF monitoring (avoid deep block if intraoperative motor evoked potential mapping is planned)."
      },
      {
        h: "4. Emergence: Preventing the Hypertensive Surge",
        b: "• The Threat of Post-Craniotomy Hypertension:\n  - Coughing, bucking, or shivering upon extubation causes spikes in venous and arterial pressure, triggering catastrophic post-craniotomy intracranial hematoma formation.\n  - Emergence Protocol: Smooth extubation with IV Lignocaine (1.5 mg/kg), Labetalol, or Dexmedetomidine; extubate awake once neurological examination can be documented."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63, Elsevier, 2025/2026.",
      "Cottrell JE, Patel P. Cottrell and Patel's Neuroanesthesia, 7th ed. Elsevier, 2024."
    ]
  },
  {
    id: "case-posterior-cranial-fossa-lesion",
    cat: "case_neuro",
    name: "Posterior Cranial Fossa (PCF) Lesion & Sitting Position",
    short: "PCF Lesion & Sitting Position",
    tags: ["Neuro", "PCF", "Sitting Position", "Venous Air Embolism", "VAE", "Brainstem", "Case Discussion"],
    tagline: "Sitting craniotomy, Venous Air Embolism (VAE) precordial Doppler detection & brainstem hemodynamic monitoring",
    source: "Objective Anaesthesia Review, 6th ed.; Miller's Anesthesia, 10th ed., Ch. 63 (Neuroanesthesia); Cottrell & Patel's Neuroanesthesia, 7th ed.",
    sections: [
      {
        h: "1. Anatomy, Surgical Positions & The Sitting Position Dilemma",
        b: "• Anatomy: The posterior cranial fossa contains the brainstem (midbrain, pons, medulla), cerebellum, 4th ventricle, and lower cranial nerves (CN IX, X, XI, XII). Intracranial space is tight; small volume increments produce acute obstructive hydrocephalus and brainstem compression.\n• Surgical Positions: Prone, Concorde, Park-Bench, and SITTING POSITION.\n• Advantages of Sitting Position:\n  - Superior surgical visualization of midline posterior fossa structures\n  - Gravity drainage of blood and CSF keeping the surgical field clean\n  - Decreased surgical bleeding and less tissue retraction.\n• Disadvantages & Hazards:\n  1. Venous Air Embolism (VAE — 25%–45% incidence!)\n  2. Severe Postural Hypotension (blood pooling in lower extremities)\n  3. Paradoxical Air Embolism in patients with Patent Foramen Ovale (PFO)\n  4. Macroglossia / Tongue Edema from acute neck flexion\n  5. Quadriplegia from cervical cord ischemia."
      },
      {
        h: "2. Venous Air Embolism (VAE) — Pathophysiology & Surveillance",
        b: "• Pathophysiology:\n  - When the surgical operative site is elevated above the level of the right atrium, the hydrostatic pressure inside non-collapsing dural venous sinuses and diploic skull veins becomes sub-atmospheric (negative pressure).\n  - Atmospheric air is sucked directly into the open venous system and carried into the right heart, pulmonary circulation, and pulmonary capillary bed.\n• Sensitivity of VAE Detection Tools (Most to Least Sensitive):\n  1. Transesophageal Echocardiography (TEE - Gold Standard): Detects micro-bubbles as small as 0.02 mL/kg.\n  2. Precordial Doppler Ultrasound: Highly sensitive (detects 0.05 mL/kg); positioned at the 3rd to 6th intercostal space at the right sternal border; produces distinctive \"washing-machine / mill-wheel\" roaring sound.\n  3. End-Tidal CO₂ (EtCO₂): Most reliable non-invasive clinical monitor; air occluding pulmonary vessels increases alveolar dead space, producing an ABRUPT, PRECIPITOUS DROP IN EtCO₂ (and rise in PaCO₂).\n  4. Pulmonary Artery Catheter (surge in PAP).\n  5. Precordial Stethoscope (Mill-wheel murmur — very late sign; indicates massive air lock > 2 mL/kg)."
      },
      {
        h: "3. Immediate Step-by-Step VAE Treatment Protocol",
        b: "When VAE is detected, execute the emergency protocol simultaneously:\n\n1. Alert the Surgical Team: Surgeon immediately floods the operative field with sterile saline and waxes open bone edges.\n2. Discontinue Nitrous Oxide: 100% O₂ on ventilator (N₂O diffuses into air bubbles, expanding bubble volume by 300%!).\n3. Aspirate the Multi-Orifice Right Atrial Catheter (Bunegin-Albin catheter): Aspirate air directly from the right atrium/superior vena cava junction.\n4. Compress Bilateral Jugular Veins: Transient manual compression elevates intracranial venous pressure, reversing the pressure gradient and forcing air out of open veins.\n5. Hemodynamic Support: Support blood pressure with volume and phenylephrine / norepinephrine.\n6. Reposition if Refractory: If cardiovascular collapse occurs, lower the head and place patient in Left Lateral Decubitus position (Durant maneuver) to trap air in the right ventricular apex."
      },
      {
        h: "4. Brainstem Manipulation & Cardiac Arrhythmias",
        b: "• Dissection near the floor of the 4th ventricle and brainstem nuclei triggers sudden profound hemodynamic instability:\n  - Bradycardia, ventricular ectopic beats, or asystole (trigeminovagal / vagal nuclei stimulation)\n  - Sudden surges in blood pressure or respiratory changes.\n  - Directive: Instruct the surgeon to pause manipulation immediately upon observing arrhythmias; usually resolves spontaneously within seconds."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63, Elsevier, 2025/2026.",
      "Mirski MA, et al. Diagnosis and treatment of venous air embolism. Anesthesiology 2007;106(1):164-177."
    ]
  },

  // ============================================================================
  // TRAUMA, ORTHO, GERIATRIC & SPECIAL CASES (case_trauma_ortho_special)
  // ============================================================================
  {
    id: "case-managing-difficult-airway",
    cat: "case_trauma_ortho_special",
    name: "Managing Difficult Airway",
    short: "Difficult Airway",
    tags: ["Airway", "AFOI", "Difficult Intubation", "DAS Algorithm", "CICO", "Case Discussion"],
    tagline: "Anticipated difficult airway, Awake Fiberoptic Intubation (AFOI) airway blocks, DAS guidelines & emergency CICO protocol",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 21 (Managing Difficult Airway); Miller's Anesthesia, 10th ed., Ch. 44 (Airway Management); 2022 ASA Difficult Airway Guidelines; DAS Guidelines.",
    sections: [
      {
        h: "1. Bedside Prediction & The LEMON Criteria",
        b: "Systematic pre-induction airway examination dictates strategy:\n\n• The LEMON Mnemonic:\n  - L (Look Externally): Facial trauma, retrognathia, macroglossia, beard, morbid obesity, neck contractures.\n  - E (Evaluate 3-3-2 Rule): Inter-incisor gap < 3 finger breadths (4 cm); Hyomental distance < 3 finger breadths (6 cm); Thyroid-to-hyoid distance < 2 finger breadths.\n  - M (Mallampati Score): Class III or IV.\n  - O (Obstruction / Stridor): Upper airway pathology (tumors, epiglotitis, abscess).\n  - N (Neck Mobility): Flexion/extension limited to < 35 degrees (ankylosing spondylitis, cervical spine fusion).\n• The Critical Strategic Decision: ANTICIPATED DIFFICULT AIRWAY = AWAKE INTUBATION IS THE GOLD STANDARD."
      },
      {
        h: "2. Awake Fiberoptic Intubation (AFOI) — Step-by-Step Masterclass",
        b: "The safest and most reliable technique for the anticipated difficult airway:\n\n• Step 1: Psychological Preparation & Informed Consent: Explain the procedure reassuringly to gain absolute patient cooperation.\n• Step 2: Antisialagogue Administration: Glycopyrrolate (0.2 mg IV or IM) given 30 minutes prior to dry up secretions (saliva obscures the fiberoptic camera lens).\n• Step 3: Thorough Airway Topicalization (The Secret to Success):\n  - 4% Lignocaine nebulization (4 mL via oxygen mask for 15 minutes) achieves widespread pharyngeal topicalization.\n  - Lignocaine 10% pump spray (1–2 puffs) to posterior pharyngeal wall.\n  - \"Spray-as-you-go\" technique: Instill 2 mL aliquots of 2% Lignocaine through the working channel of the bronchoscope as vocal cords and trachea are encountered.\n  - Maximum safe lignocaine dose: 9 mg/kg (accounting for mucosal absorption).\n• Step 4: Conscious Sedation: Target-controlled infusion of Remifentanil (0.05–0.1 mcg/kg/min) or Dexmedetomidine (1 mcg/kg load over 10 min, then 0.5 mcg/kg/h) — maintains patient comfort while preserving spontaneous ventilation and patent airway!\n• Step 5: Bronchoscopic Navigation & Railroad: Pass scope through oral Ovassapian airway or lubricated nostril, visualize vocal cords, pass into mid-trachea, visualize rings and carina, and gently railroad the warm, lubricated ETT."
      },
      {
        h: "3. The \"Cannot Intubate Cannot Oxygenate\" (CICO) Emergency Protocol",
        b: "When both face mask ventilation and supraglottic airway (SGA) rescue have failed, the patient enters the CICO emergency (Plan D of Difficult Airway Society):\n\n• SCALPEL-BOUGIE-TUBE EMERGENCY CRICOTHYROIDOTOMY (DAS 2015/2024):\n  1. Extend neck (shoulder roll) to make cricothyroid membrane prominent.\n  2. Palpate the cricothyroid membrane between thyroid cartilage and cricoid ring.\n  3. \"Laryngeal Shake\": Grasp thyroid lamina with non-dominant hand.\n  4. Transverse stab incision through skin and membrane with a No. 10 scalpel blade.\n  5. Turn blade 90 degrees with sharp edge facing caudally to open the space.\n  6. Slide angled tip of coudé bougie along the flat blade into the trachea.\n  7. Railroad a lubricated cuffed 6.0 mm ETT over the bougie into the trachea.\n  8. Inflate cuff, confirm bilateral breath sounds with end-tidal CO₂ capnography."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 21, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 44, Elsevier, 2025/2026.",
      "Frerk C, et al. Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848."
    ]
  },
  {
    id: "case-major-burns-management",
    cat: "case_trauma_ortho_special",
    name: "Burns & Inhalational Injury Management",
    short: "Major Burns",
    tags: ["Trauma", "Burns", "Parkland Formula", "Succinylcholine Warning", "Inhalation Injury", "Case Discussion"],
    tagline: "Parkland fluid formula, carbon monoxide & cyanide poisoning, succinylcholine lethal hyperkalemia & difficult airway",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 22 (Burns); Miller's Anesthesia, 10th ed., Ch. 73 (Burn Injury); ABA Practice Guidelines for Burn Care.",
    sections: [
      {
        h: "1. Fluid Resuscitation: The Parkland & Brooke Formulas",
        b: "Major burn trauma (>20% Total Body Surface Area [TBSA]) produces massive systemic endothelial injury, generalized capillary leak, and profound hypovolemic burn shock:\n\n• The Parkland Formula:\n  - Total Fluid in First 24 Hours = 4 mL × Body Weight (kg) × % TBSA burned.\n  - Fluid of Choice: Balanced crystalloid (Ringer's Lactate or Plasmalyte).\n  - Timing: Half of the total calculated volume is infused in the first 8 hours FROM THE TIME OF BURN INJURY (not from arrival at the hospital!), and the remaining half over the subsequent 16 hours.\n• Urine Output Targets (The Real Endpoint of Resuscitation):\n  - Adult: 0.5 to 1.0 mL/kg/h\n  - Children: 1.0 to 1.5 mL/kg/h\n  - High-voltage electrical burns with myoglobinuria: Target 1.5 to 2.0 mL/kg/h to prevent acute renal tubular necrosis."
      },
      {
        h: "2. Inhalation Injury: Carbon Monoxide & Cyanide Toxicity",
        b: "• Carbon Monoxide (CO) Poisoning:\n  - CO has 200–250 times higher affinity for hemoglobin than oxygen, forming carboxyhemoglobin (COHb) and shifting the oxyhemoglobin dissociation curve sharply to the left (inhibiting tissue oxygen release).\n  - FALSE-NORMAL PULSE OXIMETRY: Standard pulse oximeters cannot distinguish oxyhemoglobin from carboxyhemoglobin; SpO₂ reads 99%–100% even when patient is dying of cellular hypoxia! Co-oximetry is mandatory.\n  - Treatment: 100% FiO₂ (reduces COHb half-life from 320 minutes on room air down to 60–80 minutes) or Hyperbaric Oxygen.\n• Cyanide Toxicity:\n  - Combustion of plastics, wool, and synthetic polymers generates hydrogen cyanide, which inhibits mitochondrial cytochrome c oxidase, blocking aerobic ATP production (severe lactic acidosis with elevated venous SvO₂).\n  - Antidote: HYDROXOCOBALAMIN (5 g IV infused over 15 minutes; binds cyanide to form non-toxic cyanocobalamin, excreted in urine)."
      },
      {
        h: "3. THE SUCCINYLCHOLINE CONTRAINDICATION (LETHAL HYPERKALEMIA)",
        b: "A CARDINAL PHARMACOLOGICAL SAFETY RULE IN PERIOPERATIVE MEDICINE:\n\n• Pathophysiology:\n  - Burn injury stimulates widespread denervation-like proliferation and up-regulation of immature fetal-type (alpha-2, beta, gamma, delta) extrajunctional acetylcholine receptors across all skeletal muscle membranes.\n  - Administration of succinylcholine causes massive, prolonged potassium efflux from these hypersensitive receptors.\n• Timing:\n  - SUCCINYLCHOLINE IS STRICTLY CONTRAINDICATED FROM 24 TO 48 HOURS POST-BURN UNTIL COMPLETE HEALING HAS OCCURRED (UP TO 1 TO 2 YEARS POST-BURN)!\n  - Succinylcholine administration in this window triggers acute hyperkalemia (K⁺ surges to > 8–10 mEq/L within 2 minutes), causing immediate refractory ventricular fibrillation and cardiac arrest!\n• Altered Response to Non-Depolarizers: Down-regulation of mature receptors causes profound resistance to non-depolarizing NMBAs (Rocuronium, Vecuronium); requires 2- to 3-fold larger doses."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 22, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 73, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-anesthesia-cleft-lip-palate",
    cat: "case_trauma_ortho_special",
    name: "Anesthesia for Cleft Lip and Palate Surgery",
    short: "Cleft Lip & Palate Case",
    tags: ["Pediatric", "Cleft Lip", "Cleft Palate", "Airway", "Dingman Gag", "Case Discussion"],
    tagline: "Rule of 10s, syndromic craniofacial airway, oral south RAE tube & emergence tongue traction suture",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 23 (Anesthesia for Cleft Lip and Palate Surgery); Miller's Anesthesia, 10th ed., Ch. 76; Cote CJ, Practice of Anesthesia for Infants and Children.",
    sections: [
      {
        h: "1. Case Scenario & The Rule of 10s",
        b: "A 3-month-old infant (weight 5.2 kg) presents for elective primary cleft lip repair. The Rule of 10s is confirmed: Age > 10 weeks, Weight > 10 lbs, Hemoglobin > 10 g/dL (patient's Hb is 11.2 g/dL), WBC < 10,000. Examination shows unilateral complete left cleft lip and alveolar cleft. Cardiac evaluation is normal."
      },
      {
        h: "2. Technical Airway Execution & Oral RAE Taping",
        b: "• Intubation with South-Facing Oral RAE Endotracheal Tube:\n  - The preformed bend sits over the lower chin; directs circuit away from the operative field.\n  - Midline Taping: Tube MUST be taped strictly in the midline over the mandible (taping to the corner of the mouth distorts the surgical philtrum and lip symmetry).\n• Dingman Mouth Gag Hazards:\n  - Insertion can compress the tube, push it endobronchial, or dislodge it out of the trachea. Re-auscultate bilateral chest sounds immediately upon gag placement!"
      },
      {
        h: "3. Emergence & The Tongue Traction Suture",
        b: "• Emergence Strategy:\n  - Suction the pharynx under direct vision to clear blood clots.\n  - The surgeon places a heavy 2-0 silk traction suture through the tongue before extubation.\n  - If the infant develops upper airway obstruction in recovery, gentle traction on the tongue suture pulls the tongue forward, instantly clearing the airway without touching the delicate lip repair."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 23, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 76, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-geriatric-patient-anaesthesia",
    cat: "case_trauma_ortho_special",
    name: "Geriatric Patient with Multimorbidity & Frailty",
    short: "Geriatric Patient",
    tags: ["Geriatric", "Frailty", "Pharmacology", "Postoperative Delirium", "POCD", "Case Discussion"],
    tagline: "Organ reserve decline, 'start low go slow' titration, multimodal opioid-sparing analgesia & delirium prevention",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 24 (Geriatric Patient); Miller's Anesthesia, 10th ed., Ch. 74 (Anesthesia for the Older Patient); 2023 AGS/ASA Guidelines.",
    sections: [
      {
        h: "1. Organ System Aging & Loss of Physiological Reserve",
        b: "• Cardiovascular: Arterial elastance increases (stiff aorta), leading to systolic hypertension, wide pulse pressure, and severe diastolic dysfunction (LV filling is heavily dependent on atrial kick!). Decreased beta-adrenergic sensitivity and blunted baroreflexes produce severe post-induction hypotension without compensatory tachycardia.\n• Respiratory: Closing capacity exceeds Functional Residual Capacity (FRC) in the supine position by age 65, producing baseline atelectasis and V/Q mismatch. Blunted ventilatory responses to hypoxia and hypercapnia.\n• Central Nervous: Brain mass decreases; loss of neurons and neurotransmitters reduces MAC of volatile agents by 6%–7% per decade past age 40. High susceptibility to Postoperative Delirium (POD).\n• Pharmacokinetics (\"Start Low, Go Slow\"): Decreased total body water (smaller Vd for hydrophilic drugs = higher peak drug concentrations) and increased body fat (prolongs elimination half-life of lipophilic drugs like fentanyl and diazepam). Decreased GFR and hepatic clearance prolong drug action."
      },
      {
        h: "2. Postoperative Delirium (POD) vs POCD Prevention",
        b: "• POD: Acute fluctuating disturbance in attention and awareness peaking on POD 1–3.\n• Prevention Bundle:\n  - Avoid preoperative benzodiazepines (Midazolam) and anticholinergics (Atropine/Scopolamine)\n  - Use processed EEG (BIS) monitoring to avoid prolonged deep burst suppression\n  - Multimodal opioid-sparing regional nerve blocks\n  - Early return of sensory aids (eyeglasses, hearing aids) and day-night circadian cycle in recovery."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 24, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 74, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-turp-and-turp-syndrome",
    cat: "case_trauma_ortho_special",
    name: "Transurethral Resection of Prostate (TURP) & TURP Syndrome",
    short: "TURP & TURP Syndrome",
    tags: ["Renal", "TURP", "Hyponatremia", "Glycine", "Spinal T10", "Case Discussion"],
    tagline: "Irrigation fluid absorption, dilutional hyponatremia < 120 mEq/L, glycine visual blurring & spinal T10 gold standard",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 25 (Transurethral Resection of Prostate); Miller's Anesthesia, 10th ed., Ch. 68 (Urologic Anesthesia); Campbell-Walsh-Wein Urology, 12th ed.",
    sections: [
      {
        h: "1. Pathophysiology of TURP Syndrome",
        b: "Absorption of large volumes (> 1–2 Liters) of non-conductive, hypotonic irrigation fluid (1.5% Glycine, Sorbitol, or Mannitol) through open prostatic venous sinuses into the systemic circulation:\n\n• The Clinical Triad of TURP Syndrome:\n  1. Circulatory Volume Overload (Early): Hypertension, bradycardia (reflex baroreceptor activation), pulmonary edema, and congestive heart failure.\n  2. Dilutional Hyponatremia (Serum Na⁺ < 120 mEq/L): Lethargy, headache, restlessness, cerebral edema, seizures, and coma.\n  3. Solute-Specific Toxicity (Glycine Toxicity):\n     - Glycine is an inhibitory neurotransmitter in the retina; causes transient visual blurring, halos, and \"amaurosis\" (temporary blindness).\n     - Hepatic metabolism of glycine releases ammonia, triggering hyperammonemic encephalopathy."
      },
      {
        h: "2. Anesthetic Technique: Why Spinal at T10 is Gold Standard",
        b: "• Spinal Anesthesia to T10 Sensory Level (The Technique of Choice):\n  - Sensory Level T10 (umbilicus) blocks bladder distension pain and prostatic pain.\n  - CRITICAL ADVANTAGE: The patient remains conscious, allowing IMMEDIATE DETECTION OF EARLY TURP SYNDROME (confusion, nausea, restlessness, visual disturbances) and ACCIDENTAL BLADDER PERFORATION (sudden periumbilical, shoulder tip, or abdominal pain)!"
      },
      {
        h: "3. Management of Severe TURP Syndrome",
        b: "• Immediate Actions:\n  1. Terminate surgery immediately; coagulate bleeding vessels.\n  2. Restrict IV fluids; administer Furosemide (20–40 mg IV).\n  3. If severe symptomatic hyponatremia (Na⁺ < 120 mEq/L with seizures/coma): Infuse 3% Hypertonic Saline (100 mL boluses or 1–2 mL/kg/h) to raise serum sodium by no more than 8–10 mEq/L in 24 hours (prevents Osmotic Demyelination Syndrome / Central Pontine Myelinolysis).\n  4. Seizure control with Propofol, Midazolam, or Levetiracetam."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 25, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-proximal-fracture-femur-bcis",
    cat: "case_trauma_ortho_special",
    name: "Proximal Fracture Femur & Bone Cement Implantation Syndrome",
    short: "Hip Fracture & BCIS",
    tags: ["Ortho", "Fracture Femur", "BCIS", "Spinal", "Bone Cement", "PENG Block", "Case Discussion"],
    tagline: "Fragility hip fracture, early surgery within 24–48h, BCIS Grades 1–3 resuscitation & PENG/FICB analgesia",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 26 (Proximal Fracture Femur); Miller's Anesthesia, 10th ed., Ch. 72; AAGBI Safety Guideline on Bone Cement Implantation Syndrome.",
    sections: [
      {
        h: "1. Fragility Hip Fractures & Timing of Surgery",
        b: "• The 24–48 Hour Target: Early surgical repair within 24 to 48 hours is strongly recommended by all international guidelines (NICE, AAOS). Delays > 48 hours double 30-day mortality due to immobility, DVT/PE, delirium, and pneumonia.\n• Preoperative Bedside Blocks: Perform Pericapsular Nerve Group (PENG) block or Fascia Iliaca Compartment Block (FICB) immediately on admission; relieves agonizing pain, blunts tachycardia, and facilitates comfortable positioning for spinal anaesthesia."
      },
      {
        h: "2. Bone Cement Implantation Syndrome (BCIS) — Classification & Pathophysiology",
        b: "Occurs during pressurized insertion of polymethylmethacrylate (PMMA) bone cement and femoral stem prosthesis:\n\n• Pathophysiology:\n  - High medullary pressure during cement pressurization forces bone marrow fat, microthrombi, methylmethacrylate monomer, and tissue debris into torn femoral venous channels, embolizing directly into the pulmonary circulation. Causes acute pulmonary hypertension, RV failure, systemic hypotension, and severe hypoxemia.\n• Donaldson BCIS Severity Classification:\n  - Grade 1: Moderate hypotension (drop in SBP 20%–40%) or drop in SpO₂ to 88%–93%.\n  - Grade 2: Severe hypotension (drop in SBP > 40%) or drop in SpO₂ < 88% or unexplained loss of consciousness.\n  - Grade 3: Cardiovascular collapse requiring CPR / asystole.\n• The BCIS Prevention Protocol:\n  1. Increase FiO₂ to 1.0 prior to cement insertion.\n  2. Ensure adequate intravascular volume (give fluid bolus 500 mL pre-cement).\n  3. Have Phenylephrine / Ephedrine drawn up and ready.\n  4. Remind surgeon to perform thorough femoral canal lavage and vacuum venting."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 26, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 72, Elsevier, 2025/2026.",
      "Griffiths R, et al. AAGBI Safety Guideline: Reducing the risk from bone cement implantation syndrome. Anaesthesia 2015;70(5):623-626."
    ]
  },
  {
    id: "case-cataract-ophthalmic-blocks",
    cat: "case_trauma_ortho_special",
    name: "Cataract Surgery & Ophthalmic Regional Blocks",
    short: "Cataract & Ophthalmic Blocks",
    tags: ["Ophthalmic", "Cataract", "Peribulbar Block", "Oculocardiac Reflex", "Retrobulbar", "Case Discussion"],
    tagline: "Oculocardiac reflex trigeminovagal pathway, peribulbar vs retrobulbar technique & brainstem anaesthesia complications",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 27 (Cataract); Miller's Anesthesia, 10th ed., Ch. 70 (Ophthalmic Anesthesia); British Ophthalmic Anaesthesia Society Guidelines.",
    sections: [
      {
        h: "1. The Oculocardiac Reflex (OCR) — The Trigeminovagal Arc",
        b: "Triggered by traction on extraocular muscles (especially the MEDIAL RECTUS), direct pressure on the globe, or ocular retrobulbar injection:\n\n• Neural Pathway:\n  - Afferent Limb: Trigeminal Nerve (CN V) — Ciliary nerves → Ophthalmic division (V1) → Gasserian ganglion → Main sensory nucleus of trigeminal nerve.\n  - Efferent Limb: Vagus Nerve (CN X) — Originates from motor nucleus of vagus, terminating in cardiac SA and AV nodes.\n• Manifestations: Sudden severe sinus bradycardia, junctional rhythm, AV block, ventricular ectopics, or asystole!\n• Management:\n  1. Immediately tell the surgeon: \"STOP TRACTION ON THE EYE!\" (Releasing traction instantly terminates the reflex in >90% of cases!).\n  2. Verify 100% O₂ and depth of anaesthesia.\n  3. If bradycardia persists: Administer IV Atropine (0.01–0.02 mg/kg) or Glycopyrrolate (0.005–0.01 mg/kg)."
      },
      {
        h: "2. Peribulbar vs Retrobulbar Block: Landmarks & Safety",
        b: "• Peribulbar Block (Gold Standard — Superior Safety Profile):\n  - Needle remains EXTRACONAL (outside the muscle cone), dramatically reducing the risk of optic nerve injury and retrobulbar hemorrhage.\n  - Inferotemporal Injection: 25G 25 mm needle entered at junction of lateral third and medial two-thirds of lower orbital rim; inject 4–6 mL.\n  - Superonasal Injection: (if needed) 2–3 mL beneath the supraorbital notch.\n  - Local Anesthetic Mixture: 2% Lignocaine + 0.5% Bupivacaine with Hyaluronidase (15–30 IU/mL; facilitates tissue spreading).\n• Retrobulbar Block Hazards: Needle enters the INTRACONAL space. Hazards: Globe perforation, retrobulbar hemorrhage (rapid proptosis and tense globe; requires immediate lateral canthotomy to prevent central retinal artery occlusion), and BRAINSTEM ANAESTHESIA (accidental injection into the optic nerve sheath; local anesthetic tracks into the subarachnoid space, producing contralateral amaurosis, cranial nerve palsies, convulsions, apnoea, and cardiac arrest within 5 minutes!)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 27, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 70, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-morbid-obesity-bariatric",
    cat: "case_trauma_ortho_special",
    name: "Morbid Obesity & Bariatric Surgery",
    short: "Morbid Obesity & Bariatric",
    tags: ["Bariatric", "Morbid Obesity", "OSA", "RAMP Position", "Drug Dosing", "Case Discussion"],
    tagline: "RAMP position alignment, drug dosing weights (TBW vs IBW vs LBM), rapid desaturation & CPAP recovery",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 28 (Morbid Obesity); Miller's Anesthesia, 10th ed., Ch. 68 & 71; Society for Obesity and Bariatric Anaesthesia (SOBA) Guidelines.",
    sections: [
      {
        h: "1. Respiratory Mechanics & The RAMPed Position",
        b: "• Respiratory Alterations: Functional Residual Capacity (FRC) and Expiratory Reserve Volume (ERV) decrease exponentially with increasing BMI. The heavy chest wall and elevated diaphragm cause constant basilar airway closure and rapid arterial desaturation within 60 seconds of apnoea.\n• The RAMPed Head-Elevated Laryngoscopy Position (HELP):\n  - Supine position causes breast and chest fat to crowd the submental space, making direct laryngoscopy impossible.\n  - Position blankets or commercial foam ramps under the head and upper back until an imaginary horizontal line connects the External Auditory Meatus (Tragus) with the Sternal Notch.\n  - Dramatically improves FRC, lengthens safe apnoea time, and aligns oral, pharyngeal, and laryngeal axes for effortless intubation."
      },
      {
        h: "2. The Pharmacological Dosing Weight Matrix",
        b: "A HIGH-YIELD EXAM BOARD MATRIX TO PREVENT DRUG OVERDOSING OR UNDERDOSING:\n\n• TOTAL BODY WEIGHT (TBW - Actual Weight):\n  - Succinylcholine (1.0–1.2 mg/kg TBW; accounts for elevated pseudocholinesterase levels and larger extracellular fluid)\n  - Sugammadex (2–4 mg/kg TBW).\n• IDEAL BODY WEIGHT (IBW):\n  - Rocuronium / Vecuronium / Cisatracurium (dose to IBW to prevent prolonged residual paralysis!)\n  - Remifentanil.\n• LEAN BODY MASS (LBM - Fat-Free Mass):\n  - Propofol Induction (1.5–2.0 mg/kg LBM; dosing to TBW causes severe cardiac arrest!)\n  - Fentanyl / Sufentanil."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 28, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 71, Elsevier, 2025/2026.",
      "Nightingale CE, et al. Peri-operative management of the obese surgical patient 2015: Association of Anaesthetists of Great Britain and Ireland. Anaesthesia 2015;70(7):859-876."
    ]
  },
  {
    id: "case-colles-fracture-regional",
    cat: "case_trauma_ortho_special",
    name: "Colles' Fracture & Upper Extremity Regional Anaesthesia",
    short: "Colles' Fracture",
    tags: ["Regional", "Colles Fracture", "Bier Block", "IVRA", "Brachial Plexus", "Case Discussion"],
    tagline: "Intravenous Regional Anaesthesia (Bier block) double cuff safety, tourniquet times & supraclavicular block",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 31 (Colles' Fracture); Miller's Anesthesia, 10th ed., Ch. 53; NYSORA Regional Anesthesia Guide.",
    sections: [
      {
        h: "1. Intravenous Regional Anaesthesia (Bier Block) — Double-Cuff Safety",
        b: "A fast, highly effective technique for closed reduction and manipulation of distal forearm fractures:\n\n• Technique & Equipment:\n  - Place a 20G or 22G IV cannula in the dorsum of the fractured hand.\n  - Apply a Double-Pneumatic Tourniquet on the upper arm over soft padding.\n  - Exsanguinate the extremity with an Esmarch bandage (or elevate for 3 minutes if fracture is too painful).\n  - Inflate the PROXIMAL cuff to 100 mmHg above systolic BP (minimum 250 mmHg).\n  - Inject 0.5% Prilocaine (3 mg/kg) or 0.5% Plain Lignocaine (3 mg/kg, max 200 mg / 40 mL). NEVER USE BUPIVAACINE (fatal cardiotoxicity if released!).\n• Tourniquet Pain & The Distal Cuff Switch:\n  - At 25–45 minutes, ischemic tourniquet pain develops. Inflate the DISTAL cuff (resting over anesthetized skin), and then DEFLATE the proximal cuff.\n• THE TOURNIQUET DEFLATION SAFETY TIMELINE:\n  - MINIMUM INFLATION TIME: 20 TO 25 MINUTES. Even if the manipulation finishes in 10 minutes, the cuff MUST remain inflated for at least 20 minutes to allow local anesthetic tissue binding and prevent massive systemic bolus release (LAST)!\n  - Cyclic Deflation: Deflate for 10 seconds, reinflate for 1 minute, and repeat twice to wash out local anesthetic in fractional increments."
      },
      {
        h: "2. Ultrasound-Guided Supraclavicular Brachial Plexus Block",
        b: "• The \"Spinal of the Upper Extremity\": Highly reliable block for distal radius plating.\n• Landmarks: High-frequency probe above clavicle; identify pulsating subclavian artery over 1st rib. Brachial plexus trunks lie superolateral (\"cluster of grapes\"). Inject 15–20 mL of 0.5% ropivacaine/bupivacaine with in-plane needle technique."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 31, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 53, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-kyphoscoliosis-spine-surgery",
    cat: "case_trauma_ortho_special",
    name: "Kyphoscoliosis for Corrective Spine Surgery",
    short: "Kyphoscoliosis Spine Surgery",
    tags: ["Spine", "Kyphoscoliosis", "IONM", "MEP SSEP", "Stagnara Wake-up", "Case Discussion"],
    tagline: "Severe restrictive lung disease, TIVA without relaxants for IONM, Stagnara wake-up test & massive blood loss",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 32 (Kyphoscoliosis); Miller's Anesthesia, 10th ed., Ch. 63 & 72; Cottrell & Patel's Neuroanesthesia.",
    sections: [
      {
        h: "1. Respiratory & Cardiovascular Pathophysiology",
        b: "Severe spinal curvature (Cobb angle > 60–100 degrees) severely deforms the thoracic cage:\n\n• Respiratory: Asymmetric restriction of chest wall expansion, vital capacity < 50% predicted, ventilation-perfusion mismatch, chronic alveolar hypoventilation.\n• Cardiovascular: Chronic hypoxemia triggers pulmonary vasoconstriction, leading to pulmonary arterial hypertension and Cor Pulmonale (right ventricular hypertrophy and failure).\n• Risk of Postoperative Ventilatory Dependence: High if Vital Capacity < 30%–35% predicted or Cobb angle > 100 degrees."
      },
      {
        h: "2. Intraoperative Neuromonitoring (IONM) & Anesthetic Requirements",
        b: "Surgical spine distraction and rod placement jeopardize spinal cord perfusion (anterior spinal artery ischemia):\n\n• Somatosensory Evoked Potentials (SSEP): Monitors dorsal columns (sensory pathway via posterior spinal arteries). Significant alert: >50% drop in amplitude or >10% increase in latency.\n• Motor Evoked Potentials (MEP): Transcranial electrical stimulation monitoring anterior corticospinal tracts (motor pathway via anterior spinal artery). Highly sensitive to ischemia.\n• ANTAGONISM BY ANESTHETICS:\n  - Volatile agents suppress synaptic transmission in anterior horn cells. Maintain Total Intravenous Anesthesia (TIVA with Propofol and Remifentanil) or keep volatile < 0.5 MAC.\n  - NEUROMUSCULAR BLOCKERS MUST BE COMPLETELY AVOIDED AFTER INTUBATION to allow muscle contraction recording during MEPs!\n• The Stagnara Wake-Up Test: The historic clinical test of motor function; patient is lightened intraoperatively until they can squeeze hands and wiggle toes on command."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 32, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 63 & 72, Elsevier, 2025/2026."
    ]
  },

  // ============================================================================
  // GENERAL, ENDOCRINE & RENAL CASES (case_general_subspecialty)
  // ============================================================================
  {
    id: "case-cirrhosis-portal-hypertension",
    cat: "case_general_subspecialty",
    name: "Cirrhosis with Portal Hypertension",
    short: "Cirrhosis & Portal HTN",
    tags: ["GI", "Cirrhosis", "Portal HTN", "MELD", "Coagulopathy", "ROTEM", "Case Discussion"],
    tagline: "Hyperdynamic circulation, rebalanced hemostasis, ROTEM/TEG guidance, portopulmonary HTN & terlipressin",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 29 (Cirrhosis with Portal Hypertension); Miller's Anesthesia, 10th ed., Ch. 68 (Anesthesia and the Liver); AASLD Practice Guidelines.",
    sections: [
      {
        h: "1. Staging & Multisystem Pathophysiology",
        b: "• Risk Stratification: Child-Turcotte-Pugh (CTP Class A, B, C) and MELD-Na score. Elective surgery is contraindicated in CTP Class C or MELD > 20.\n• The Hyperdynamic Circulatory State:\n  - Splanchnic vasodilation driven by nitric oxide produces profound systemic vasodilation (low SVR, low MAP) and compensatory high cardiac output.\n• The Concept of \"Rebalanced Hemostasis\":\n  - While the liver produces fewer procoagulants (factors II, VII, IX, X), it SIMULTANEOUSLY produces fewer natural anticoagulants (Protein C, Protein S, Antithrombin III). Standard PT/INR measures procoagulants only, giving a false impression of \"bleeding risk\". Patients are actually at risk for both bleeding and thrombosis! Viscoelastic testing (ROTEM/TEG) is mandatory to guide transfusion."
      },
      {
        h: "2. Perioperative Complications & Drug Handling",
        b: "• Hepatorenal Syndrome (HRS): Splanchnic pooling leads to severe renal vasoconstriction. Treat intraoperative hypotension with Terlipressin or Noradrenaline; avoid nephrotoxins (NSAIDs, aminoglycosides).\n• Portopulmonary Hypertension (PoPH): Pulmonary hypertension in cirrhosis (mean PAP > 25 mmHg); severe PoPH (> 45 mmHg) carries >50% mortality.\n• Drug Selection: Prolonged duration of vecuronium/rocuronium (decreased biliary excretion); Cisatracurium (Hofmann elimination) is the muscle relaxant of choice."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 29, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-laparoscopic-robotic-cholecystectomy",
    cat: "case_general_subspecialty",
    name: "Laparoscopic and Robotic Cholecystectomy",
    short: "Lap & Robotic Cholecystectomy",
    tags: ["GI", "Laparoscopy", "Robotic", "Pneumoperitoneum", "Gas Embolism", "Case Discussion"],
    tagline: "CO2 pneumoperitoneum hemodynamics, reverse Trendelenburg, gas embolism Durant maneuver & subcostal TAP block",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 30 (Laparoscopic and Robotic Cholecystectomy); Miller's Anesthesia, 10th ed., Ch. 68; SAGES Guidelines.",
    sections: [
      {
        h: "1. The Physiology of CO2 Pneumoperitoneum",
        b: "Insufflation of carbon dioxide to 12–15 mmHg intra-abdominal pressure produces distinct cardiovascular and respiratory changes:\n\n• Cardiovascular:\n  - Increased SVR & MAP: Vasopressin and renin-angiotensin release plus mechanical compression of the splanchnic bed elevate afterload.\n  - Decreased Cardiac Output: Compression of the IVC reduces venous return.\n  - Vagal Bradycardia: Sudden peritoneal stretch by the Veress needle or trocar triggers severe vagal bradycardia or asystole.\n• Respiratory:\n  - Cephalad diaphragm displacement reduces FRC by 20%–30%, producing basilar atelectasis and increasing peak airway pressures.\n  - CO₂ Absorption: Systemic absorption of CO₂ increases PaCO₂; minute ventilation must be increased by 20%–30% to maintain normocapnia."
      },
      {
        h: "2. Complications & The Gas Embolism Crisis",
        b: "• Carbon Dioxide Venous Gas Embolism:\n  - Occurs if the Veress needle or trocar penetrates a major hepatic or mesenteric vein.\n  - Signs: Sudden precipitous drop in End-Tidal CO₂, severe hypotension, hypoxia, mill-wheel murmur, and acute RV strain.\n  - Immediate Management:\n    1. Discontinue insufflation immediately and vent the abdomen.\n    2. 100% O₂; turn off nitrous oxide.\n    3. Durant Maneuver: Turn patient into Left Lateral Decubitus and Trendelenburg position (traps air bubble in the right ventricular apex, preventing pulmonary outflow tract obstruction).\n    4. Aspirate gas via central line; support circulation."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 30, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-large-thyroid-mass-stridor",
    cat: "case_general_subspecialty",
    name: "Large Thyroid Mass & Retrosternal Goiter",
    short: "Large Thyroid Mass",
    tags: ["Endocrine", "Thyroid", "Retrosternal Goiter", "Airway", "Stridor", "RLN", "Case Discussion"],
    tagline: "Retrosternal goiter tracheal compression, awake fiberoptic intubation, NIM tube RLN monitoring & post-thyroidectomy emergencies",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 33 (Large Thyroid Mass); Miller's Anesthesia, 10th ed., Ch. 44 & 68 (Endocrine Surgery); British Association of Endocrine and Thyroid Surgeons.",
    sections: [
      {
        h: "1. Preoperative Airway Imaging & Compressive Symptoms",
        b: "• Compressive Symptoms: Dyspnea (worse when supine), orthopnea, stridor (inspiratory = extrathoracic; expiratory = intrathoracic), dysphagia, Pemberton sign (facial flushing, cyanosis, and elevated JVP when raising both arms above head for 1 minute, confirming thoracic inlet venous obstruction).\n• CT Neck & Thorax Evaluation: Evaluate tracheal caliber, deviation, distance of retrosternal extension beneath aortic arch, and presence of tracheomalacia (cartilage softening)."
      },
      {
        h: "2. Induction Strategy: Inhalational vs Awake Fiberoptic",
        b: "• Induction Hazards: Loss of consciousness and muscle relaxation abolish upper airway muscular splinting, allowing the heavy thyroid mass to collapse the compressed trachea completely (\"Cannot Intubate Cannot Oxygenate\")!\n• Anesthetic Options:\n  - Option A: Awake Fiberoptic Intubation (AFOI): Gold standard for severe tracheal deviation or critical airway narrowing (< 5 mm caliber).\n  - Option B: Inhalational Induction with Sevoflurane in 100% O₂: Maintains spontaneous ventilation until depth is adequate and vocal cords are visualized.\n  - Tube Choice: Reinforced (armoured / wire-spiral) endotracheal tube to prevent external compression by the heavy mass."
      },
      {
        h: "3. Recurrent Laryngeal Nerve (RLN) Monitoring & Post-Op Crises",
        b: "• Nerve Integrity Monitor (NIM) Tube: Endotracheal tube with integrated surface electrodes that contact true vocal cords. Requires avoiding long-acting muscle relaxants after intubation.\n• Life-Threatening Postoperative Thyroid Emergencies:\n  1. Tension Hematoma in Neck: Venous/arterial bleed into deep cervical fascia; compress trachea within minutes. TREATMENT: Cut sutures/clips at bedside immediately and evacuate clot before reintubation!\n  2. Bilateral RLN Injury: Vocal cords fall into paramedian position upon extubation, producing acute inspiratory stridor and aphonia. Requires immediate emergency reintubation or tracheostomy.\n  3. Tracheomalacia: Tracheal collapse upon extubation from prolonged pressure atrophy of tracheal rings.\n  4. Hypocalcemic Tetany (Post-Op Day 1–3): Accidental parathyroidectomy; Chvostek and Trousseau signs, laryngospasm. Treat with IV Calcium Gluconate."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 33, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 68, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-diabetes-mellitus-perioperative",
    cat: "case_general_subspecialty",
    name: "Diabetes Mellitus & Perioperative Glycemic Emergencies",
    short: "Diabetes Perioperative",
    tags: ["Endocrine", "Diabetes", "VRIII", "SGLT2 euDKA", "Autonomic Neuropathy", "Case Discussion"],
    tagline: "Autonomic neuropathy, stiff joint syndrome, SGLT2 inhibitor euDKA, VRIII sliding scale & target glucose 140–180 mg/dL",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 34 (Diabetes Mellitus); Miller's Anesthesia, 10th ed., Ch. 40; 2024 ADA Standards of Care in Diabetes.",
    sections: [
      {
        h: "1. Systemic Complications & Preoperative Evaluation",
        b: "• Autonomic Neuropathy: Resting tachycardia (> 100 bpm), loss of heart rate variability during deep breathing, orthostatic hypotension, gastroparesis (full stomach aspiration risk even after 8h fasting!), and painless silent myocardial infarction.\n• Stiff Joint Syndrome: Non-enzymatic glycosylation of collagen causes stiff joints. Demonstrated by the \"Prayer Sign\" (inability to approximate palmar surfaces of digits) and stiff cervical spine, predicting difficult direct laryngoscopy.\n• SGLT2 INHIBITORS (EUGLYCEMIC DKA WARNING):\n  - SGLT2 inhibitors (Empagliflozin, Dapagliflozin) MUST BE STOPPED 3 TO 4 DAYS PRIOR TO SURGERY.\n  - Withholding failure triggers Euglycemic Diabetic Ketoacidosis (euDKA) with normal or mildly elevated blood glucose (< 200 mg/dL) and severe high anion gap metabolic acidosis."
      },
      {
        h: "2. Intraoperative Glycemic Targets & VRIII Protocols",
        b: "• Target Blood Glucose: 140 to 180 mg/dL (7.8 to 10.0 mmol/L). Strict tight control (< 110 mg/dL) is dangerous, increasing hypoglycemic mortality by 3-fold (NICE-SUGAR trial).\n• Variable-Rate Intravenous Insulin Infusion (VRIII):\n  - 50 units regular human insulin in 50 mL 0.9% saline (1 unit/mL) via syringe pump.\n  - Co-infuse 5% Dextrose in 0.45% Saline with 20 mEq/L KCl at 100 mL/h to prevent hypoglycemia and hypokalemia."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 34, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 40, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-ckd-renal-transplant",
    cat: "case_general_subspecialty",
    name: "Chronic Kidney Disease & Renal Transplantation",
    short: "CKD & Renal Transplant",
    tags: ["Renal", "CKD", "Renal Transplant", "Hyperkalemia", "Cisatracurium", "Case Discussion"],
    tagline: "Pre-transplant dialysis timing, hyperkalemia thresholds, cisatracurium Hofmann clearance & vascular unclamping flush",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 35 (Chronic Kidney Disease and Renal Transplant); Miller's Anesthesia, 10th ed., Ch. 68 & 75; KDIGO Guidelines.",
    sections: [
      {
        h: "1. Preoperative Assessment & Dialysis Timing",
        b: "• Dialysis Timing: Hemodialysis should ideally be performed 18 to 24 hours prior to surgery (allows fluid equilibration and dissipates heparin effect). Perform repeat serum potassium immediately prior to induction (must be < 5.5 mEq/L).\n• Vascular Access Protection: Protect the arteriovenous fistula (AVF) on the non-dominant arm: NO blood pressure cuffs, NO venipunctures, NO arterial lines; pad carefully."
      },
      {
        h: "2. Anesthetic Drug Selection in ESRD",
        b: "• Muscle Relaxants: CISATRACURIUM is the drug of choice (spontaneous organ-independent Hofmann elimination and ester hydrolysis). Avoid Vecuronium/Pancuronium (accumulate).\n• Opioids: Fentanyl and Remifentanil are safe. STRICTLY AVOID MORPHINE (active metabolite M6G and neurotoxic M3G accumulate, causing prolonged respiratory depression) and PETHIDINE (normeperidine accumulation causes seizures).\n• Reversal: Sugammadex is excreted renally; cyclodextrin-rocuronium complex remains in circulation for days; neostigmine-glycopyrrolate is safe."
      },
      {
        h: "3. Intraoperative Hydration & Reperfusion Hemodynamics",
        b: "• Volume Expansion During Vascular Anastomosis: To ensure immediate allograft perfusion, volume-load aggressively with balanced crystalloids to maintain CVP 10–14 mmHg and SBP > 130–140 mmHg prior to clamp release.\n• Reperfusion Phenomenon: Unclamping the external iliac vessels flushes cold, acidemic, hyperkalemic, preservative-laden fluid from the donor kidney into the systemic circulation; have calcium gluconate and bicarbonate ready."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 35, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 75, Elsevier, 2025/2026."
    ]
  },

  // ============================================================================
  // PEDIATRIC SURGICAL CASES (case_pediatric)
  // ============================================================================
  {
    id: "case-tonsillectomy-airway-emergencies",
    cat: "case_pediatric",
    name: "Tonsillectomy & Post-Tonsillectomy Hemorrhage",
    short: "Tonsillectomy Hemorrhage",
    tags: ["Pediatric", "Tonsillectomy", "Post-Op Bleeding", "Full Stomach", "Resuscitation", "Case Discussion"],
    tagline: "Hidden swallowed blood hypovolemia, modified RSI with 2 suctions, fluid resuscitation & extubation criteria",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 36 (Tonsillectomy); Miller's Anesthesia, 10th ed., Ch. 76; Cote CJ, Practice of Anesthesia for Infants and Children.",
    sections: [
      {
        h: "1. The Clinical Crisis: Hidden Swallowed Blood",
        b: "A 6-year-old child presents 6 days after elective tonsillectomy with active secondary oral bleeding. The child is pale, heart rate 145 bpm, BP 82/48 mmHg, capillary refill 4 seconds. The parents report spitting up small amounts of blood, but the child has swallowed large volumes of blood unnoticed into the stomach, presenting in unappreciated severe hypovolemic shock with a stomach filled with heavy clots."
      },
      {
        h: "2. Pre-Induction Resuscitation & The 2-Suction RSI",
        b: "• Resuscitation First: NEVER induce until hypovolemia is corrected with 20 mL/kg balanced crystalloids and cross-matched blood.\n• Induction Execution:\n  - Prepare TWO fully functional suction units with large rigid Yankauer tips.\n  - Styleted ETT one size smaller.\n  - Ketamine or Propofol + Rocuronium (1.2 mg/kg) with cricoid pressure.\n  - Evacuate stomach thoroughly before extubation awake."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 36, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 76, Elsevier, 2025/2026."
    ]
  }
];
