// ============================================================================
// BATCH 4: OBSTETRIC ANAESTHESIA CLINICAL CASES (6 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), Chestnut's Obstetric Anesthesia, ACOG Practice Bulletins.
// ============================================================================

module.exports = [
  // 18. HYPERTENSIVE DISORDERS IN PREGNANCY & SEVERE PREECLAMPSIA
  {
    id: "case-hypertensive-disorders-pregnancy",
    cat: "case_obstetric",
    name: "Hypertensive Disorders in Pregnancy & Severe Preeclampsia",
    short: "Preeclampsia & HTN in Pregnancy",
    tags: ["Obstetric", "Preeclampsia", "Eclampsia", "Magnesium Sulfate", "Pritchard Zuspan", "Neuraxial", "Case Discussion"],
    tagline: "Multiorgan endothelial dysfunction, magnesium sulfate dosing, target BP 140–150/90–100 & neuraxial vs general anaesthesia",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 12; Miller's Anesthesia, 10th ed., Ch. 69; ACOG Practice Bulletin No. 222.",
    sections: [
      {
        h: "1. Diagnostic Definitions & Severe Features (ACOG Criteria)",
        b: "• Diagnostic Definitions:\n  - Gestational Hypertension: New-onset SBP ≥ 140 mmHg or DBP ≥ 90 mmHg after 20 weeks gestation in the absence of proteinuria or systemic signs.\n  - Preeclampsia: Hypertension after 20 weeks plus either Proteinuria (≥ 300 mg/24h or urine protein:creatinine ratio ≥ 0.3) OR any feature of end-organ dysfunction.\n• Preeclampsia with Severe Features (ACOG Staging Criteria):\n  1. Severe Hypertension: SBP ≥ 160 mmHg or DBP ≥ 110 mmHg on two occasions at least 4 hours apart.\n  2. Thrombocytopenia: Platelet count < 100,000 /mm³.\n  3. Impaired Liver Function: Serum transaminases > 2× upper limit of normal or severe persistent right upper quadrant / epigastric pain.\n  4. Renal Insufficiency: Serum creatinine > 1.1 mg/dL or doubling of baseline.\n  5. Pulmonary Edema.\n  6. New-onset Cerebral / Visual Disturbances: Severe headache, scotomas, photopsia, hyperreflexia/clonus.\n• HELLP Syndrome: Hemolysis (microangiopathic), Elevated Liver enzymes, Low Platelets."
      },
      {
        h: "2. Pathophysiology: Systemic Endothelial Dysfunction & Vasospasm",
        b: "• Defective Spiral Artery Remodeling:\n  - Incomplete trophoblastic invasion of uterine spiral arteries leads to chronic placental hypoperfusion, releasing anti-angiogenic factors (sFlt-1 and soluble endoglin) that neutralize VEGF and PlGF.\n  - Widespread systemic maternal endothelial activation produces generalized vasospasm, high SVR, capillary leak, and severe intravascular volume depletion (despite gross peripheral edema!).\n• Airway Hazard: Marked pharyngeal, laryngeal, and vocal cord edema. The preeclamptic airway is friable, narrow, and prone to rapid desaturation during induction."
      },
      {
        h: "3. Seizure Prophylaxis: The Magnesium Sulfate Protocol (Collaborative Eclampsia Trial)",
        b: "• Regimens for Seizure Prophylaxis & Treatment:\n  - Zuspan Regimen (IV): 4 to 6 grams of Magnesium Sulfate (20% solution) IV infused over 15–20 minutes, followed by a continuous infusion of 1 to 2 grams/hour for 24 hours postpartum.\n  - Pritchard Regimen (IM/IV): 4 g IV over 10 min PLUS 10 g IM (5 g in each buttock), followed by 5 g IM every 4 hours.\n• Serum Levels & Toxicity Surveillance:\n  - Normal Baseline: 1.5 to 2.5 mg/dL (0.7–1.0 mmol/L).\n  - Therapeutic Range: 4.8 to 8.4 mg/dL (2.0–3.5 mmol/L).\n  - Loss of Patellar Tendon Reflexes: 8 to 12 mg/dL (earliest warning sign of toxicity!).\n  - Respiratory Depression / Arrest: 12 to 15 mg/dL.\n  - Cardiac Conduction Arrest (Asystole): > 20 mg/dL.\n• Mandatory Bedside Monitoring Checks:\n  1. Patellar reflex present.\n  2. Respiratory rate > 12 breaths/min.\n  3. Urine output > 25–30 mL/hr (Magnesium is excreted 100% via kidneys; oliguria causes lethal accumulation!).\n• Antidote: CALCIUM GLUCONATE 10% — 10 mL (1 g) IV infused slowly over 5 minutes."
      },
      {
        h: "4. Acute Antihypertensive Therapy",
        b: "• Target Blood Pressure: Smooth reduction to 140–150 / 90–100 mmHg. AVOID precipitous drops (reduces uteroplacental perfusion, causing acute fetal bradycardia/distress!).\n• First-Line Intravenous Agents for BP ≥ 160/110 mmHg:\n  - IV Labetalol: 20 mg IV initial bolus; if persistent, double to 40 mg, then 80 mg every 10–20 min (max 300 mg cumulative), or continuous infusion. Avoid in maternal asthma or bradycardia.\n  - IV Hydralazine: 5 to 10 mg IV slow push every 20 min (max 20–30 mg). May cause maternal reflex tachycardia and headache.\n  - Oral Immediate-Release Nifedipine: 10 to 20 mg orally (swallowed, NOT given sublingually)."
      },
      {
        h: "5. Anesthetic Technique for Cesarean Delivery: Spinal vs General",
        b: "• Neuraxial Anesthesia is Strongly Preferred:\n  - Spinal or Epidural anaesthesia avoids the dangerous hypertensive surge and difficult airway of general anaesthesia.\n  - Platelet Count Threshold: Spinal or epidural anaesthesia is considered safe if platelet count is ≥ 70,000–80,000 /mm³, provided platelet trajectory is stable and coagulation profile (PT/INR, aPTT, fibrinogen) is normal.\n  - Fluid Caution: Co-load with modest crystalloid (500–1000 mL); avoid large fluid boluses (> 1500 mL) which precipitate pulmonary edema!\n• If General Anesthesia is Unavoidable (Platelets < 50,000 or Eclamptic Seizure):\n  - Laryngoscopy triggers a massive sympathetic surge that can cause intracranial hemorrhage or acute LV failure.\n  - Blunting the Pressor Response: Administer IV Labetalol 10–20 mg, Remifentanil 1 mcg/kg, or Lignocaine 1.5 mg/kg immediately prior to RSI.\n  - Prepare ETT one size smaller (6.0 or 6.5 mm) due to severe airway edema.\n  - Note: Magnesium sulfate potentiates non-depolarizing muscle relaxants by 3-fold; titrate rocuronium/vecuronium with TOF monitoring!"
      },
      {
        h: "6. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why should Ergometrine (Methergine) never be used for postpartum hemorrhage in preeclampsia?\n    A: Ergometrine produces intense alpha-adrenergic peripheral vasoconstriction, triggering severe hypertensive crises, acute pulmonary edema, and intracerebral hemorrhage.\n  - Q: How does magnesium sulfate affect neuromuscular block?\n    A: It inhibits presynaptic acetylcholine release and decreases post-junctional membrane sensitivity, potentiating the effect of non-depolarizing muscle relaxants (rocuronium/vecuronium) up to 3 to 4-fold."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 12, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "ACOG Practice Bulletin No. 222: Gestational Hypertension and Preeclampsia. Obstet Gynecol 2020;135(6):e237-e260."
    ]
  },

  // 19. PREGNANCY: PHYSIOLOGICAL CHANGES & SEVERE GESTATIONAL ANEMIA
  {
    id: "case-pregnancy-anemia",
    cat: "case_obstetric",
    name: "Pregnancy: Physiological Changes & Severe Gestational Anemia",
    short: "Pregnancy Physiology & Anemia",
    tags: ["Obstetric", "Physiology", "Aortocaval Compression", "Severe Anemia", "Transfusion Trigger", "Case Discussion"],
    tagline: "40–50% plasma volume expansion, aortocaval compression left lateral tilt, severe anemia & cardiac compensation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 13; Miller's Anesthesia, 10th ed., Ch. 69; Chestnut's Obstetric Anesthesia, 6th ed.",
    sections: [
      {
        h: "1. Multisystem Physiological Adaptations in Pregnancy",
        b: "• Cardiovascular Adaptations:\n  - Plasma volume increases by 45%–50%, while red blood cell mass increases by only 20%–30%. This physiological mismatch produces the \"Physiological Anemia of Pregnancy\" (normal nadir Hb ~10.5–11 g/dL at 28–32 weeks).\n  - Cardiac Output: Increases by 40%–50% (stroke volume +30%, heart rate +15–20 bpm).\n  - Systemic Vascular Resistance (SVR): Drops by 20%–30% due to low-resistance uteroplacental bed and vasodilatory prostacyclins.\n• Respiratory Adaptations:\n  - Minute ventilation increases by 50% (primarily driven by tidal volume via progesterone), producing a physiological chronic respiratory alkalosis (normal pregnancy ABG: pH 7.44, PaCO₂ 30–32 mmHg, HCO₃⁻ 20–22 mEq/L).\n  - Functional Residual Capacity (FRC): Decreases by 20%–30% at term. Paired with a 20% increase in oxygen consumption (VO₂), term parturients desaturate with extreme rapidity during apnea."
      },
      {
        h: "2. The Supine Hypotensive Syndrome (Aortocaval Compression)",
        b: "• Pathophysiology:\n  - Beyond 20 weeks gestation, the gravid uterus compresses the Inferior Vena Cava (IVC) when supine.\n  - Venous return to the right atrium drops by up to 30%–40%, causing maternal hypotension, pallor, dizziness, nausea, and acute fetal bradycardia.\n  - Compression of the descending aorta compromises uterine and placental arterial perfusion.\n• Mandatory Preventive Rule:\n  - LEFT LATERAL TILT (15 degrees) must be maintained at all times using a pelvic wedge under the right hip or tilting the operating table laterally to the left."
      },
      {
        h: "3. Severe Anemia (Hb < 7 g/dL) & Cardiac Decompensation",
        b: "• Severity Classification (WHO):\n  - Mild: 10.0–10.9 g/dL. Moderate: 7.0–9.9 g/dL. Severe: 4.0–6.9 g/dL. Very Severe / Decompensated: < 4.0 g/dL.\n• Hyperdynamic Compensatory Limits:\n  - Anemia decreases blood viscosity, reducing afterload and increasing venous return. Cardiac output rises to maintain tissue oxygen delivery.\n  - When Hb drops < 5–6 g/dL, cardiac compensatory limits are exceeded, leading to high-output heart failure, pulmonary edema, and tissue hypoxia.\n• Transfusion Strategy:\n  - Transfusion Trigger: Transfuse packed red blood cells if Hb < 7 g/dL in third trimester or if symptomatic (tachycardia, tachypnea, orthopnea, chest pain). In active bleeding, transfuse to keep Hb ≥ 8–9 g/dL.\n  - Administer IV Furosemide (10–20 mg) with transfusion in severe anemia to prevent transfusion-associated circulatory overload (TACO)!"
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is MAC of volatile anesthetics reduced by 30%–40% in pregnancy?\n    A: Due to elevated circulating progesterone levels and increased endogenous endorphins, which exert a sedative effect on the central nervous system.\n  - Q: Why do pregnant women require smaller doses of local anesthetics for spinal anesthesia?\n    A: Engorgement of the epidural venous plexus (Batson's plexus) compresses the subarachnoid space, reducing CSF volume by up to 20%–30%, leading to higher cephalad spread of local anesthetic."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 13, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026."
    ]
  },

  // 20. EMERGENCY LOWER SEGMENT CESAREAN SECTION (LSCS)
  {
    id: "case-emergency-lscs",
    cat: "case_obstetric",
    name: "Emergency Lower Segment Cesarean Section (LSCS)",
    short: "Emergency Crash LSCS",
    tags: ["Obstetric", "Emergency LSCS", "Category 1", "Crash Induction", "RSI", "CICO", "Case Discussion"],
    tagline: "Category 1 crash Cesarean, 30-min decision-to-delivery, failed intubation algorithm & spinal vs general",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 14; Miller's Anesthesia, 10th ed., Ch. 69; RCOG & OAA/DAS Guidelines.",
    sections: [
      {
        h: "1. Classification of Urgency of Cesarean Section (NICE / RCOG Staging)",
        b: "• Category 1 (Crash / Immediate Life Threat):\n  - Immediate threat to the life of the woman or fetus (e.g. sustained fetal bradycardia < 80 bpm, cord prolapse, uterine rupture, massive abruption, maternal collapse).\n  - Decision-to-Delivery Interval (DDI): Standard benchmark is < 30 minutes (often < 15 minutes in severe crisis).\n• Category 2 (Maternal or Fetal Compromise):\n  - Compromise not immediately life-threatening (e.g. failure to progress with early fetal distress). Benchmark DDI < 75 minutes.\n• Category 3: Needing early delivery but no maternal/fetal compromise.\n• Category 4: Elective delivery scheduled to suit mother and staff."
      },
      {
        h: "2. Spinal vs General Anesthesia in Category 1 LSCS",
        b: "• The Decision Dilemma:\n  - Spinal Anesthesia: If a functioning labor epidural is present, TOP-UP with 2% Lignocaine with adrenaline and bicarbonate (or 0.75% Ropivacaine) for rapid surgical block. If no epidural, a skilled rapid spinal (hyperbaric bupivacaine 1.8–2.0 mL) can be placed in 2–3 minutes.\n  - General Anesthesia: Indicated if severe sustained fetal bradycardia, massive maternal hemorrhage, failed/contraindicated regional block, or acute maternal collapse."
      },
      {
        h: "3. Rapid Sequence Induction (RSI) Protocol in Full-Stomach Parturient",
        b: "• The Aspiration Risk: All parturients beyond 16–20 weeks are considered \"FULL STOMACH\" due to progesterone-induced delayed gastric emptying, decreased lower esophageal sphincter tone, and elevated intragastric pressure.\n• Step-by-Step Crash Induction Protocol:\n  1. Aspiration Prophylaxis: IV Ranitidine 50 mg + Metoclopramide 10 mg + 30 mL 0.3M Sodium Citrate orally (neutralizes gastric acid immediately).\n  2. Optimal Positioning: Left lateral tilt with 20-degree head-up ramped position.\n  3. Preoxygenation: 100% O₂ for 3 minutes or 8 vital capacity breaths over 60 seconds with tight mask seal.\n  4. Rapid Sequence Induction: Ketamine 1.0–1.5 mg/kg (if shocked/bleeding) or Thiopentone 4–5 mg/kg / Propofol 2 mg/kg, immediately followed by Succinylcholine 1.5 mg/kg (or Rocuronium 1.2 mg/kg if Sugammadex 16 mg/kg immediately available).\n  5. Cricoid Pressure (Sellick's Maneuver): Apply 10 N awake, 30 N once unconscious. Maintain until ETT cuff is inflated and position verified by capnography.\n  6. Intubation with Video Laryngoscope: Styleted ETT size 6.5–7.0 mm."
      },
      {
        h: "4. The Obstetric Failed Intubation Algorithm (OAA / DAS Guidelines)",
        b: "• If Cannot Intubate after First Attempt:\n  1. CALL FOR IMMEDIATE HELP.\n  2. Attempt 2: Optimize position, change blade, reduce/release cricoid pressure, insert bougie or video laryngoscope. MAXIMUM 2 attempts at laryngoscopy!\n  3. If Failed Intubation: Declare Failed Intubation!\n  4. Insert Second-Generation Supraglottic Airway Device (SGA - ProSeal LMA, i-gel): Re-establishes oxygenation and provides gastric drainage.\n  5. DECISION: Can you ventilate via SGA?\n     * If YES: If maternal/fetal condition is critical (Category 1 crash), PROCEED WITH SURGERY via SGA using controlled ventilation and low airway pressures!\n     * If NO (Cannot Intubate, Cannot Oxygenate [CICO]): Perform emergency surgical cricothyroidotomy (scalpel-bougie-tube) immediately!"
      },
      {
        h: "5. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is Oxytocin given as a slow IV infusion rather than a rapid bolus?\n    A: Rapid IV bolus of oxytocin causes profound systemic vasodilation, acute hypotension, reflex tachycardia, myocardial ischemia, and transient pulmonary hypertension. Give 3–5 units SLOWLY over 1–2 minutes, followed by 10–20 units in 500 mL crystalloid infusion.\n  - Q: What are the second-line uterotonics if oxytocin fails in uterine atony?\n    A: Methylergometrine (0.2 mg IM; contraindicated in preeclampsia/hypertension); Carboprost / PGF2-alpha (250 mcg IM; contraindicated in asthma); Misoprostol / PGE1 (800–1000 mcg per rectum or sublingual)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 14, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "Mushambi MC, et al. Obstetric Anaesthetists' Association and Difficult Airway Society guidelines for the management of difficult and failed tracheal intubation in obstetrics. Anaesthesia 2015;70(11):1286-1306."
    ]
  },

  // 21. NON-OBSTETRIC SURGERY IN A PREGNANT PATIENT
  {
    id: "case-non-obstetric-surgery-pregnancy",
    cat: "case_obstetric",
    name: "Non-Obstetric Surgery in a Pregnant Patient",
    short: "Non-Obstetric Surgery in Pregnancy",
    tags: ["Obstetric", "Non-Obstetric Surgery", "Teratogenicity", "Preterm Labor", "Appendectomy", "Case Discussion"],
    tagline: "Second trimester sweet spot, teratogenicity myths vs facts, avoid fetal hypoxia & FHR monitoring",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 15; Miller's Anesthesia, 10th ed., Ch. 70; ASA/ACOG Consensus Guidelines.",
    sections: [
      {
        h: "1. Timing of Surgery & Trimester Considerations",
        b: "• Optimal Timing: THE SECOND TRIMESTER (14 to 28 Weeks) is the safest window for non-obstetric surgery:\n  - First Trimester: Period of active embryonic organogenesis (weeks 3–8); risk of teratogenicity and spontaneous abortion is highest.\n  - Third Trimester: High risk of stimulating preterm labor and delivery; massive uterus causes severe aortocaval compression and difficult surgical visualization.\n  - Second Trimester: Organogenesis complete, uterine size manageable, preterm labor risk lowest.\n• Emergency Surgery Rule: Essential or emergency surgery (e.g., acute appendicitis, cholecystitis, trauma, ovarian torsion) SHOULD NEVER BE DELAYED regardless of trimester!"
      },
      {
        h: "2. Teratogenicity: Current Scientific Evidence",
        b: "• What the Evidence Shows:\n  - NO CURRENTLY USED ANESTHETIC AGENT (Propofol, Volatiles, Ketamine, Opioids, Muscle relaxants, Local anesthetics) is a proven human teratogen when administered at clinical doses.\n  - Nitrous Oxide (N₂O): Inhibits methionine synthase, interfering with DNA synthesis in animal models; avoid in first trimester organogenesis.\n  - True Fetal Teratogens to Avoid in Pregnancy: ACE inhibitors, Angiotensin receptor blockers, Warfarin (causes fetal embryopathy), Valproate, Phenytoin.\n• The Greatest Fetal Hazard: FETAL HYPOXIA AND ACIDOSIS secondary to maternal hypotension, hypoxemia, hypercapnia, or hypocarbia (hypocarbia causes uterine vasoconstriction and left-shifts maternal oxyhemoglobin curve, impairing oxygen unloading to fetus)."
      },
      {
        h: "3. Perioperative Management & Fetal Heart Rate Monitoring",
        b: "• Fetal Heart Rate (FHR) Monitoring:\n  - Before 24 Weeks: Doppler FHR check pre- and postoperatively.\n  - Beyond 24 Weeks (Viable Fetus): Continuous intraoperative external Doppler FHR and tocodynamometry (if surgical field allows).\n  - Note: General anesthesia produces loss of FHR beat-to-beat variability (normal finding; does not indicate distress). Persistent fetal bradycardia (< 110 bpm) indicates maternal hypotension or hypoxemia; correct maternal parameters immediately."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: How does maternal hyperventilation harm the fetus?\n    A: Maternal hypocapnia (PaCO₂ < 30 mmHg) causes acute uterine artery vasoconstriction and shifts maternal Hb-O₂ curve to the left (Bohr effect), severely reducing oxygen delivery across the placenta to the fetus.\n  - Q: What are the rules for laparoscopic surgery in pregnancy?\n    A: Perform in second trimester; use open Hasson technique for trocar insertion; keep intra-abdominal insufflation pressure < 12–15 mmHg to preserve uteroplacental blood flow; maintain left lateral tilt."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 15, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 70, Elsevier, 2025/2026."
    ]
  },

  // 22. AMNIOTIC FLUID EMBOLISM (AFE)
  {
    id: "case-amniotic-fluid-embolism",
    cat: "case_obstetric",
    name: "Amniotic Fluid Embolism (AFE)",
    short: "Amniotic Fluid Embolism",
    tags: ["Obstetric", "AFE", "Anaphylactoid Syndrome", "DIC", "A-OK Protocol", "Cardiogenic Collapse", "Case Discussion"],
    tagline: "Triad of collapse, hypoxemia & DIC, anaphylactoid syndrome, A-OK resuscitation & VV-ECMO",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 16; Miller's Anesthesia, 10th ed., Ch. 69; SMFM Clinical Guideline: Amniotic Fluid Embolism.",
    sections: [
      {
        h: "1. Definition, Clinical Triad & Diagnostic Criteria",
        b: "• Definition: A catastrophic, unpredictable obstetric emergency triggered by the entry of amniotic fluid and fetal debris into the maternal venous circulation, initiating a profound systemic anaphylactoid reaction.\n• The Classic Clinical Triad:\n  1. Acute Cardiovascular Collapse (Severe hypotension, asystole / PEA).\n  2. Acute Hypoxemic Respiratory Failure (Cyanosis, bronchospasm, flash pulmonary edema).\n  3. Consumptive Coagulopathy / Disseminated Intravascular Coagulation (DIC).\n• SMFM Diagnostic Criteria for AFE (All 4 Required):\n  1. Sudden onset of cardiorespiratory arrest or hypotension with respiratory compromise.\n  2. Documentation of overt DIC (elevated PT/INR, aPTT, fibrinogen < 200 mg/dL, elevated D-dimer).\n  3. Clinical onset during labor or within 30 minutes of placental delivery.\n  4. Absence of other explainable medical causes."
      },
      {
        h: "2. Pathophysiology: Biphasic Hemodynamic Collapse",
        b: "• Biphasic Cardiovascular Response:\n  - Phase 1 (Transient Pulmonary Vasoconstriction - First 15–30 Minutes):\n    * Vasoactive mediators (thromboxane A2, endothelin, leukotrienes) trigger massive acute pulmonary arterial spasm.\n    * Acute, severe pulmonary hypertension leads to acute Right Ventricular (RV) dilatation, RV failure, and leftward shifting of the interventricular septum, crashing LV filling.\n  - Phase 2 (Left Ventricular Failure & Pulmonary Edema - Subsequent Hours):\n    * Direct myocardial depressant factors cause severe LV systolic dysfunction, cardiogenic shock, and non-cardiogenic permeability pulmonary edema.\n• Consumptive Coagulopathy & DIC:\n  - Amniotic fluid contains high concentrations of tissue factor, activating the extrinsic coagulation cascade, triggering massive intravascular microthrombosis, consumption of fibrinogen and platelets, and acute hyperfibrinolysis."
      },
      {
        h: "3. Step-by-Step Resuscitation & The 'A-OK' Protocol",
        b: "• Immediate Resuscitation Bundle:\n  1. CPR & RESCUE DELIVERY: If cardiac arrest occurs and fetus is viable, initiate Perimortem Cesarean Delivery (PMCD) within 4 MINUTES of arrest (relieves aortocaval compression, improving maternal venous return by 30%–40%).\n  2. 100% FiO₂, immediate endotracheal intubation, high PEEP.\n  3. Aggressive inotropic support: NOREPINEPHRINE (0.05–0.2 mcg/kg/min) + VASOPRESSIN (0.01–0.04 U/min) to support coronary perfusion; INHALED PROSTACYCLIN or iNO to reduce RV afterload.\n• THE 'A-OK' PHARMACOLOGICAL RESCUE PROTOCOL (Chest / Clark Regimen):\n  - A: ATROPINE (0.8 to 1.0 mg IV) — Blocks vagal-mediated pulmonary and cardiac reflexes.\n  - O: ONDANSETRON (8 mg IV) — Serotonin (5-HT3) antagonist; blocks serotonin-induced pulmonary vasoconstriction and vagal reflex bradycardia.\n  - K: KETOROLAC (30 mg IV) — Inhibits cyclooxygenase, blocking thromboxane synthesis and acute pulmonary hypertension.\n• Hemostatic Resuscitation (Massive Transfusion Protocol):\n  - Balanced 1:1:1 transfusion of PRBC, FFP, and Platelets.\n  - Cryoprecipitate (10–20 units) or Fibrinogen Concentrate (3–4 grams) to keep fibrinogen > 200 mg/dL.\n  - Tranexamic Acid (TXA): 1 g IV infused over 10 minutes to suppress hyperfibrinolysis."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is AFE now classified as 'Anaphylactoid Syndrome of Pregnancy'?\n    A: Because the maternal collapse is not caused by physical mechanical embolic obstruction, but rather by an overwhelming immunological, anaphylactoid release of inflammatory mediators (complement, arachidonic acid metabolites) in response to fetal antigens.\n  - Q: What is the 4-minute perimortem cesarean section rule?\n    A: In maternal cardiac arrest beyond 20 weeks gestation, if spontaneous circulation is not restored within 4 minutes of CPR, immediate bedside hysterotomy/delivery must be initiated and completed by 5 minutes to decompress the maternal IVC and optimize chances of maternal survival."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 16, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "Society for Maternal-Fetal Medicine (SMFM). Amniotic fluid embolism: diagnosis and management. Am J Obstet Gynecol 2016;215(2):B16-B24."
    ]
  },

  // 23. OBSTETRIC HEMORRHAGE & PLACENTA ACCRETA SPECTRUM
  {
    id: "case-obstetric-hemorrhage-pph",
    cat: "case_obstetric",
    name: "Obstetric Hemorrhage & Placenta Accreta Spectrum",
    short: "PPH & Placenta Accreta",
    tags: ["Obstetric", "PPH", "Accreta", "Increta", "Percreta", "MTP", "Tranexamic Acid", "Case Discussion"],
    tagline: "4 Ts of PPH, Placenta Accreta Spectrum invasiveness, MTP 1:1:1 cooler protocol & REBOA",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 17; Miller's Anesthesia, 10th ed., Ch. 69; ACOG Practice Bulletin No. 183.",
    sections: [
      {
        h: "1. Definition, Classification & The 4 Ts of PPH",
        b: "• Definitions of Postpartum Hemorrhage (PPH):\n  - Classic: Blood loss > 500 mL following vaginal delivery or > 1000 mL following Cesarean section.\n  - Current Re-definition (ACOG): Cumulative blood loss ≥ 1000 mL OR blood loss accompanied by signs or symptoms of hypovolemia within 24 hours postpartum.\n• The 4 Ts of PPH Etiology:\n  1. TONE (70%): Uterine atony (most common cause).\n  2. TRAUMA (20%): Lacerations of cervix, vagina, perineum; uterine rupture; broad ligament hematoma.\n  3. TISSUE (10%): Retained placenta, succenturiate lobe, abnormal placental invasion.\n  4. THROMBIN (1%): Pre-existing coagulopathy, DIC, severe thrombocytopenia.\n• Placenta Accreta Spectrum (PAS - Invasive Placentation):\n  - Accreta: Chorionic villi attach directly to myometrium without intervening decidua basalis (75%).\n  - Increta: Villi invade deeply into myometrium (15%).\n  - Percreta: Villi penetrate through full myometrium and uterine serosa, invading surrounding organs (bladder, pelvic sidewall) (10%)."
      },
      {
        h: "2. Preoperative Planning in Placenta Accreta Spectrum",
        b: "• Multidisciplinary Surgical Protocol:\n  - Elective delivery at 34–35 weeks in tertiary hybrid operating suite with gynecologic oncology, urology, interventional radiology, and blood bank.\n  - Prophylactic Interventional Radiology: Preoperative placement of bilateral internal iliac / uterine artery balloon occlusion catheters or Resuscitative Endovascular Balloon Occlusion of the Aorta (REBOA).\n• Vascular Access: Two large-bore 14G/16G peripheral lines, Rapid Infusion Catheter (RIC line), and invasive arterial line prior to incision."
      },
      {
        h: "3. Massive Transfusion Protocol (MTP) & Coagulation Optimization",
        b: "• The Obstetric MTP Activation Trigger: Ongoing active bleeding > 1500 mL or hemodynamic instability.\n• Balanced Cooler Delivery: Transfuse PRBC, FFP, and Platelets in a 1:1:1 ratio.\n• Specific Coagulation Targets:\n  - Hemoglobin: > 8 g/dL.\n  - Platelets: > 50,000 /mm³ (or > 100,000 if active severe microvascular oozing).\n  - Fibrinogen: > 200 mg/dL (CRITICAL: In pregnancy, baseline fibrinogen is elevated to 400–600 mg/dL; a fibrinogen level < 200 mg/dL indicates severe consumptive coagulopathy!). Transfuse Cryoprecipitate 10–20 units or Fibrinogen Concentrate 2–4 g.\n  - Ionized Calcium: > 1.1 mmol/L (citrate toxicity from massive PRBC transfusion binds calcium; hypocalcemia causes profound vasoplegia and coagulopathy; give Calcium Chloride 1 g IV after every 4 units blood).\n• Tranexamic Acid (WOMAN Trial):\n  - Administer TXA 1 gram IV over 10 minutes within 3 hours of hemorrhage onset; reduces maternal death from bleeding by >30% without increasing thromboembolism."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is fibrinogen the single best predictor of severity in PPH?\n    A: In normal term pregnancy, fibrinogen is elevated (400–600 mg/dL). A rapid drop below 200 mg/dL occurs before abnormal PT or aPTT, identifying early severe consumptive coagulopathy and massive bleeding.\n  - Q: What are the surgical interventions for refractory PPH?\n    A: Uterine compression sutures (B-Lynch, Hayman), bilateral uterine artery ligation (O'Leary stitches), internal iliac (hypogastric) artery ligation, and Cesarean hysterectomy."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 17, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 69, Elsevier, 2025/2026.",
      "ACOG Practice Bulletin No. 183: Postpartum Hemorrhage. Obstet Gynecol 2017;130(4):e168-e186."
    ]
  }
];
