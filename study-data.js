/* ==========================================================================
   KNOCKOUTNOTES — Study Mode content (study-data.js)

   Structured, source-cited reference content for exam and clinical-practice
   revision. Every topic and drug monograph carries a source line rendered
   at the very top of its detail view.

   Sourcing (summarised and reworded — never copied verbatim):
     General topics  — Miller's Anesthesia (10th ed.), Barash Clinical
                        Anesthesia, Morgan & Mikhail's Clinical Anesthesiology,
                        Stoelting's Pharmacology & Physiology in Anesthetic
                        Practice, ASA/major society guidelines, UpToDate, and
                        Q1/Q2 anaesthesia & medicine journals.
     Drug monographs — FDA-approved prescribing information (label) for the
                        cited brand, cross-checked against UpToDate "Drug
                        information" monographs, Miller's Anesthesia (10th
                        ed.) and Stoelting's Pharmacology & Physiology (5th
                        ed.). FDA-approved dosage is drawn from the label;
                        anything outside that is explicitly marked off-label.

   Content reviewed/updated Sept 2026. This is a revision aid, not a
   substitute for the primary label or guideline — always confirm current
   dosing against the institutional formulary and the live FDA label before
   clinical use.
   ========================================================================== */
(function () {
  "use strict";

  const categories = [
    { id: "anaesthesia", label: "Anaesthesia", icon: "🫀", desc: "Core practice topics — assessment, airway, physiology, safety" },
    { id: "equipment", label: "Ventilators & Devices", icon: "🌬️", desc: "Breathing systems, Mapleson circuits, ventilators & anaesthesia equipment" },
    { id: "induction", label: "Induction Agents", icon: "💉", desc: "IV hypnotics used to induce general anaesthesia" },
    { id: "relaxants", label: "Muscle Relaxants", icon: "🧬", desc: "Depolarising & non-depolarising neuromuscular blockers" },
    { id: "reversal", label: "Reversal Agents", icon: "🔄", desc: "Sugammadex & neostigmine" },
    { id: "opioids", label: "Opioids", icon: "💊", desc: "Perioperative opioid analgesics" },
    { id: "nsaids", label: "NSAIDs & Analgesics", icon: "🩹", desc: "Non-opioid multimodal analgesia" },
    { id: "vasopressors", label: "Vasopressors & Inotropes", icon: "❤️", desc: "Haemodynamic support agents" },
    { id: "local", label: "Local Anaesthetics", icon: "🧊", desc: "Amide & ester local anaesthetics" }
  ];

  const SRC = {
    fdaUpToDate: (brand, mfr) =>
      `FDA-approved prescribing information — ${brand} (${mfr}); UpToDate "Drug information" monograph (2025); Miller's Anesthesia, 10th ed.; Stoelting's Pharmacology & Physiology in Anesthetic Practice, 5th ed.`
  };

  // ========================================================================
  // ANAESTHESIA — general practice topics
  // ========================================================================
  const topics = [];

  topics.push({
    id: "preop-assessment",
    cat: "anaesthesia",
    name: "Preoperative Assessment & Optimisation",
    short: "Preop Assessment",
    tags: ["ASA guideline", "Risk stratification"],
    tagline: "History, airway exam, risk scoring, and medication management before surgery",
    source: "ASA Practice Advisory for Preanesthesia Evaluation (2022 update); Miller's Anesthesia, 10th ed., Ch. 12; UpToDate \"Preoperative medical evaluation of the healthy adult patient\" (2025).",
    sections: [
      { h: "Goals", b: "Identify comorbidity that changes anaesthetic plan or perioperative risk, optimise modifiable disease (glycaemic control, anaemia, heart failure), obtain informed consent, and set expectations. Routine testing in low-risk patients undergoing low-risk surgery adds cost without changing outcome and is discouraged." },
      { h: "History & Examination", b: "Focus on exercise tolerance (METs), cardiac and respiratory symptoms, airway history (previous difficult intubation, OSA, snoring), bleeding/anaesthesia family history, allergies, and current medications including anticoagulants, herbal supplements and recreational drug use." },
      { h: "Risk Stratification", b: "ASA Physical Status Classification for overall fitness; Revised Cardiac Risk Index (RCRI) or NSQIP/ACS calculators for perioperative cardiac risk; STOP-BANG for undiagnosed OSA. Functional capacity ≥4 METs generally obviates further cardiac testing before intermediate-risk surgery." },
      { h: "Medication Management", b: "Continue beta-blockers, statins and most antihypertensives; hold ACE-inhibitors/ARBs the morning of surgery per many protocols (institution-dependent) to reduce induction hypotension; bridge or hold anticoagulants per ASRA/ACC guidance depending on thromboembolic risk and procedure bleeding risk; continue insulin/oral hypoglycaemics per a sliding protocol." },
      { h: "Fasting", b: "ASA fasting guidelines: clear fluids up to 2 h, breast milk 4 h, light meal/infant formula 6 h, and full meal/non-human milk 8 h before elective anaesthesia — aimed at minimising pulmonary aspiration risk while limiting unnecessary dehydration." }
    ]
  });

  topics.push({
    id: "asa-pscore",
    cat: "anaesthesia",
    name: "ASA Physical Status Classification",
    short: "ASA-PS",
    tags: ["Risk", "Classification"],
    tagline: "Six-tier system describing a patient's systemic disease burden before anaesthesia",
    source: "American Society of Anesthesiologists — ASA Physical Status Classification System (approved Oct 2014, reaffirmed 2020); Miller's Anesthesia, 10th ed., Ch. 12.",
    sections: [
      { h: "Classification", b: "ASA I — normal healthy patient. ASA II — mild systemic disease without functional limitation (e.g. controlled hypertension, smoking, obesity 30<BMI<40). ASA III — severe systemic disease with functional limitation (e.g. poorly controlled diabetes with complications, COPD, morbid obesity). ASA IV — severe systemic disease that is a constant threat to life (recent MI/CVA <3 months, ongoing cardiac ischaemia, sepsis). ASA V — moribund patient not expected to survive without the operation. ASA VI — declared brain-dead patient for organ donation." },
      { h: "'E' Modifier", b: "Add 'E' for emergency surgery — defined as delay in treatment that would significantly increase threat to life or body part — appended to the numeric class (e.g. ASA IIIE)." },
      { h: "Clinical Use & Limits", b: "Correlates with perioperative mortality and morbidity and is widely used for risk communication and audit, but it is a subjective, inter-rater-variable measure of physiologic reserve, not a surgical risk calculator by itself — it does not account for the specific procedure planned." }
    ]
  });

  topics.push({
    id: "airway-assessment",
    cat: "anaesthesia",
    name: "Airway Assessment & Difficult Airway Management",
    short: "Difficult Airway",
    tags: ["ASA algorithm", "DAS guideline"],
    tagline: "Predicting and managing the anticipated and unanticipated difficult airway",
    source: "ASA Practice Guidelines for Management of the Difficult Airway (2022); Difficult Airway Society (DAS) 2015 guidelines for unanticipated difficult intubation in adults; Miller's Anesthesia, 10th ed., Ch. 30.",
    sections: [
      { h: "Bedside Predictors", b: "Mallampati class III/IV, thyromental distance <6 cm, interincisor gap <3 cm, limited neck extension, retrognathia, high BMI, OSA, and a history of previous difficult laryngoscopy each independently predict difficult direct laryngoscopy; no single test has high sensitivity alone, so multiple tests are combined (e.g. the LEMON approach)." },
      { h: "Difficult Mask Ventilation Predictors", b: "Beard, obesity (BMI >26), lack of teeth, age >55, history of snoring/OSA — the 'BONES' or 'OBESE' mnemonics — should be assessed alongside laryngoscopy predictors, since a difficult-airway plan must always have a mask-ventilation rescue pathway." },
      { h: "ASA Difficult Airway Algorithm", b: "Stepwise approach: assess likelihood/impact of difficulty → consider awake intubation for anticipated severe difficulty → attempt intubation after induction if feasible → if intubation fails, call for help and optimise mask/SGA ventilation → if 'cannot intubate, cannot oxygenate' (CICO), proceed to emergency invasive airway (front-of-neck access — cricothyroidotomy)." },
      { h: "Awake Techniques", b: "Awake fibreoptic intubation (with topical local anaesthesia ± sedation) is preferred when severe difficulty is anticipated with both intubation and ventilation, preserving spontaneous ventilation until the airway is secured." },
      { h: "Extubation", b: "Difficult-airway extubation is itself a recognised high-risk event; DAS extubation guidelines recommend planning (low-risk vs at-risk strategy), consideration of an airway exchange catheter, and full readiness to re-intubate before extubating a known difficult airway." }
    ]
  });

  topics.push({
    id: "rsi",
    cat: "anaesthesia",
    name: "Rapid Sequence Induction (RSI)",
    short: "RSI",
    tags: ["Aspiration prophylaxis", "Full stomach"],
    tagline: "Induction technique to minimise the aspiration window in patients at high aspiration risk",
    source: "Morgan & Mikhail's Clinical Anesthesiology, 7th ed., Ch. 19; UpToDate \"Rapid sequence induction and intubation (RSII) in adults\" (2025).",
    sections: [
      { h: "Indications", b: "Full stomach (recent oral intake, trauma, pregnancy from the second trimester, bowel obstruction, gastroparesis/diabetes, symptomatic reflux, emergency surgery) — any state with a materially increased risk of regurgitation and pulmonary aspiration." },
      { h: "Technique", b: "Pre-oxygenate to an end-tidal O2 close to 90% (3–5 min tidal breathing or 8 vital-capacity breaths), give a predetermined dose of a fast-onset induction agent immediately followed by a rapid-onset relaxant (succinylcholine 1–1.5 mg/kg or rocuronium 1.0–1.2 mg/kg), and intubate without intervening positive-pressure mask ventilation unless desaturation mandates gentle low-pressure ventilation." },
      { h: "Cricoid Pressure", b: "Classically 10 N before loss of consciousness rising to 30 N after, to occlude the oesophagus against the cricoid cartilage — its efficacy has been questioned by more recent evidence and some protocols now omit it or apply it more selectively; it should be released promptly if it impairs laryngoscopic view." },
      { h: "Modified RSI", b: "A gentler variant using titrated induction with a longer-acting non-depolarising relaxant and cautious mask ventilation is sometimes used in physiologically fragile patients where the classic technique's abrupt haemodynamic swings pose greater risk than a brief aspiration window." }
    ]
  });

  topics.push({
    id: "anaesthesia-machine",
    cat: "anaesthesia",
    name: "Anaesthesia Machine & Breathing Circuits",
    short: "Machine & Circuits",
    tags: ["Circle system", "Vaporizers"],
    tagline: "Gas delivery, vaporizers, CO2 absorption and circuit checks",
    source: "Miller's Anesthesia, 10th ed., Ch. 21 (Anesthesia Delivery Systems); ASA Recommendations for Pre-Anesthesia Checkout Procedures (2008, in current use).",
    sections: [
      { h: "Gas Supply & Flowmeters", b: "Pipeline (colour- and pin-indexed) and cylinder back-up supply O2, N2O and air; flowmeters (electronic in modern machines) meter fresh gas flow; a hypoxic-guard (proportioning) system prevents delivery of a hypoxic O2/N2O mixture." },
      { h: "Vaporizers", b: "Agent-specific, variable-bypass vaporizers (sevoflurane, isoflurane, desflurane [heated, pressurised due to high volatility] ) are calibrated for a single agent and interlocked so only one can be engaged at a time, preventing accidental co-administration." },
      { h: "Circle Breathing System", b: "Unidirectional valves and a CO2 absorber (soda lime/Amsorb) allow rebreathing of exhaled gas after CO2 removal, conserving volatile agent and heat/humidity; low fresh-gas-flow anaesthesia relies on absorber integrity — colour change signals exhaustion." },
      { h: "Machine Check", b: "A pre-use check verifies gas supply pressures, the low-pressure leak test, vaporizer function, breathing-circuit integrity, unidirectional valve function, scavenging, and ventilator/backup self-inflating bag availability before every anaesthetic." }
    ]
  });

  topics.push({
    id: "asa-monitoring",
    cat: "anaesthesia",
    name: "ASA Standard Monitoring",
    short: "Standard Monitoring",
    tags: ["ASA standard", "Safety"],
    tagline: "Minimum monitoring standards during all anaesthesia care",
    source: "ASA Standards for Basic Anesthetic Monitoring (amended 2020); Miller's Anesthesia, 10th ed., Ch. 40.",
    sections: [
      { h: "Standard I", b: "Qualified anaesthesia personnel must be continuously present during all general anaesthetics, regional anaesthetics, and monitored anaesthesia care." },
      { h: "Standard II — Oxygenation", b: "Continuous pulse oximetry with audible variable-pitch tone and inspired-oxygen-concentration analysis with a low-concentration alarm; adequate illumination and exposure of the patient are required to assess colour." },
      { h: "Ventilation", b: "Continual assessment via observation and, for every general anaesthetic, quantitative end-tidal CO2 (capnography) confirming correct tracheal tube/SGA placement and ongoing ventilation; a disconnect/low-pressure alarm is required for mechanically ventilated patients." },
      { h: "Circulation", b: "ECG continuously displayed from induction to leaving the anaesthetising location; blood pressure and heart rate evaluated at least every 5 minutes; and at least one additional circulatory-function method (palpation, auscultation, arterial waveform, peripheral pulse plethysmography or oximetry)." },
      { h: "Temperature", b: "Monitored when clinically significant changes in body temperature are intended, anticipated or suspected — universal in prolonged general anaesthesia given the risk of unintentional perioperative hypothermia." }
    ]
  });

  topics.push({
    id: "fluid-transfusion",
    cat: "anaesthesia",
    name: "Fluid Management & Blood Transfusion",
    short: "Fluids & Transfusion",
    tags: ["Goal-directed therapy", "PBM"],
    tagline: "Perioperative fluid strategy and transfusion thresholds",
    source: "Barash Clinical Anesthesia, 8th ed., Ch. 24; AABB blood transfusion guidelines; UpToDate \"Perioperative blood management: Strategies to minimize transfusions\" (2025).",
    sections: [
      { h: "Crystalloids vs Colloids", b: "Balanced crystalloids (e.g. lactated Ringer's, Plasma-Lyte) are preferred first-line over 0.9% saline, which in large volumes causes hyperchloraemic metabolic acidosis; colloids expand plasma volume more per mL but carry cost, anaphylaxis and (for some starches) renal-injury/coagulopathy concerns and are used more selectively." },
      { h: "Goal-Directed Fluid Therapy", b: "Dynamic indices — stroke volume variation, pulse pressure variation, oesophageal Doppler or arterial-waveform-derived stroke volume — guide fluid boluses in major surgery better than fixed-volume regimens, reducing complications in several trials, particularly in high-risk abdominal surgery." },
      { h: "Transfusion Thresholds", b: "A restrictive strategy (transfuse RBCs at Hb ≤7–8 g/dL in most stable patients, a higher threshold ~8 g/dL in cardiac disease) is non-inferior to liberal transfusion in most surgical populations and reduces transfusion exposure; massive transfusion protocols target a roughly 1:1:1 ratio of RBC:FFP:platelets in major haemorrhage." },
      { h: "Patient Blood Management", b: "Preoperative anaemia correction (iron ± erythropoietin), intraoperative cell salvage, antifibrinolytics (tranexamic acid) and meticulous surgical haemostasis reduce allogeneic transfusion need and are now standard components of enhanced-recovery and PBM pathways." }
    ]
  });

  topics.push({
    id: "malignant-hyperthermia",
    cat: "anaesthesia",
    name: "Malignant Hyperthermia",
    short: "Malignant Hyperthermia",
    tags: ["MHAUS protocol", "Emergency"],
    tagline: "Life-threatening hypermetabolic crisis triggered by volatile agents/succinylcholine",
    source: "Malignant Hyperthermia Association of the United States (MHAUS) treatment protocol; Miller's Anesthesia, 10th ed., Ch. 39; UpToDate \"Malignant hyperthermia: Diagnosis and management of acute crisis\" (2025).",
    sections: [
      { h: "Mechanism", b: "An inherited (usually autosomal dominant, RYR1 mutation most common; CACNA1S less commonly) hypersensitivity of the skeletal-muscle ryanodine receptor causes uncontrolled sarcoplasmic reticulum calcium release on exposure to a volatile anaesthetic or succinylcholine, driving sustained muscle contraction, massive heat and CO2 production, and rhabdomyolysis." },
      { h: "Clinical Features", b: "Earliest and most sensitive sign is a rapid, otherwise-unexplained rise in end-tidal CO2 despite increased minute ventilation, with tachycardia, masseter spasm (especially after succinylcholine), muscle rigidity, mixed acidosis, hyperkalaemia, myoglobinuria, and hyperthermia (a later sign, sometimes >40°C)." },
      { h: "Immediate Management", b: "Stop all triggering agents, hyperventilate with 100% O2 at high fresh-gas flow (or switch circuit/CO2 absorber), give dantrolene 2.5 mg/kg IV bolus repeated every 5 min to effect (up to ~10 mg/kg or more), actively cool the patient, treat hyperkalaemia and arrhythmias, and monitor for and treat DIC/rhabdomyolysis-induced renal injury in ICU." },
      { h: "Dantrolene", b: "Acts as a ryanodine-receptor antagonist, reducing calcium release from the sarcoplasmic reticulum; the ready-to-use nanocrystalline suspension (Ryanodex) reconstitutes far faster than conventional dantrolene sodium, which matters in a time-critical crisis." },
      { h: "Follow-up", b: "Monitor in ICU for recrudescence for at least 24 h, and refer the patient and family for caffeine-halothane contracture testing or genetic testing to guide future anaesthetic planning for relatives." }
    ]
  });

  topics.push({
    id: "ponv",
    cat: "anaesthesia",
    name: "Postoperative Nausea and Vomiting (PONV)",
    short: "PONV",
    tags: ["Apfel score", "Prophylaxis"],
    tagline: "Risk-stratified multimodal prevention and rescue treatment",
    source: "Society for Ambulatory Anesthesia (SAMBA) Consensus Guidelines for the Management of PONV (4th ed., 2020); Miller's Anesthesia, 10th ed., Ch. 74.",
    sections: [
      { h: "Risk Factors", b: "The simplified Apfel score assigns one point each for female sex, history of PONV/motion sickness, non-smoking status, and planned postoperative opioids — risk rises from ~10% (0 factors) to ~80% (4 factors); volatile anaesthesia, nitrous oxide, longer surgery and certain procedures (laparoscopic, gynaecological, strabismus) add further risk." },
      { h: "Baseline Risk Reduction", b: "Where feasible: prefer propofol-based TIVA over volatile agents, avoid nitrous oxide, minimise opioids via multimodal analgesia, and ensure adequate hydration — each independently lowers PONV risk." },
      { h: "Pharmacologic Prophylaxis", b: "Combine agents from different classes for moderate–high risk: a 5-HT3 antagonist (ondansetron 4 mg IV), dexamethasone 4–8 mg IV at induction, and/or a NK-1 antagonist (aprepitant) or transdermal scopolamine; droperidol (low-dose) is also effective, with monitoring for QT prolongation." },
      { h: "Rescue Treatment", b: "Use an agent from a class not already given for prophylaxis; if PONV occurs despite a 5-HT3 antagonist, a second 5-HT3 dose within 6 h is usually ineffective — switch class instead." }
    ]
  });

  topics.push({
    id: "regional-physiology",
    cat: "anaesthesia",
    name: "Neuraxial Blockade — Physiology & Comparison with GA",
    short: "Neuraxial Physiology",
    tags: ["Spinal", "Epidural"],
    tagline: "Physiologic effects of spinal/epidural block and outcome comparisons with general anaesthesia",
    source: "Barash Clinical Anesthesia, 8th ed., Ch. 17; Miller's Anesthesia, 10th ed., Ch. 55; Cochrane systematic reviews on neuraxial vs general anaesthesia outcomes.",
    sections: [
      { h: "Sympathetic Blockade", b: "Local anaesthetic blocks sympathetic preganglionic B-fibres at a level typically 2 segments above the sensory block and motor block 2 segments below — the resulting vasodilation and, at higher blocks, cardioaccelerator (T1–T4) sympathectomy explain the characteristic hypotension and bradycardia of high spinal/epidural anaesthesia." },
      { h: "Respiratory Effects", b: "Low-to-mid thoracic blocks are usually well tolerated by a healthy patient (accessory and diaphragmatic function preserved via phrenic C3–C5), but high blocks impairing intercostal/abdominal muscle function reduce cough effectiveness and expiratory reserve, which matters in patients with limited pulmonary reserve." },
      { h: "Differences: Spinal vs Epidural", b: "Spinal anaesthesia uses a small dose injected into CSF for rapid, dense block of fixed duration (single shot) or catheter-extendable; epidural anaesthesia uses a larger volume in the epidural space for a slower-onset, segmentally titratable block, usable for prolonged analgesia via catheter (e.g. labour, postoperative)." },
      { h: "Outcome Evidence", b: "Neuraxial techniques (alone or combined with GA) reduce blood loss, venous thromboembolism, respiratory complications, and possibly mortality in high-risk major surgery compared with GA alone in several meta-analyses, though the effect size and applicability vary by procedure and modern GA practice." }
    ]
  });

  topics.push({
    id: "anaphylaxis-anaesthesia",
    cat: "anaesthesia",
    name: "Anaphylaxis Under Anaesthesia",
    short: "Perioperative Anaphylaxis",
    tags: ["Emergency", "NMBA allergy"],
    tagline: "Recognition and immediate management of intraoperative anaphylaxis",
    source: "Association of Anaesthetists (AAGBI) Suspected Anaphylactic Reactions Associated with Anaesthesia guideline (2021); Miller's Anesthesia, 10th ed., Ch. 38.",
    sections: [
      { h: "Common Triggers", b: "Neuromuscular blocking agents (especially rocuronium and succinylcholine) account for the largest share of perioperative anaphylaxis in most series, followed by chlorhexidine, antibiotics (especially beta-lactams), latex, and patent blue dye/contrast." },
      { h: "Recognition", b: "Sudden hypotension and/or bronchospasm (often the only two signs under drapes, since cutaneous flushing/urticaria may be hidden or delayed) with tachycardia; grading runs from mild cutaneous reaction (Grade I) to cardiac arrest (Grade IV) using systems such as Ring & Messmer." },
      { h: "Immediate Management", b: "Stop the suspected trigger, call for help, give 100% O2, lay flat with legs raised, and give IM/IV epinephrine titrated to severity (IV boluses of 50 µg titrated in a monitored setting for hypotension/bronchospasm, escalating to resuscitation doses for cardiovascular collapse) plus aggressive IV crystalloid; add antihistamine and corticosteroid as second-line only after epinephrine and fluids." },
      { h: "Follow-up", b: "Send serum tryptase at time of reaction, 1–2 h later, and at 24 h (baseline) to confirm mast-cell activation; refer to an allergy/anaesthesia clinic for skin-prick/intradermal testing to identify the culprit agent and document safe alternatives for future anaesthesia." }
    ]
  });

  topics.push({
    id: "eras",
    cat: "anaesthesia",
    name: "Enhanced Recovery After Surgery (ERAS)",
    short: "ERAS",
    tags: ["ERAS Society", "Multimodal"],
    tagline: "Evidence-based perioperative care bundle to accelerate functional recovery",
    source: "ERAS Society consensus guidelines (colorectal, 2018 update, and procedure-specific pathways); Miller's Anesthesia, 10th ed., Ch. 84.",
    sections: [
      { h: "Preoperative Elements", b: "Patient education/counselling, carbohydrate loading up to 2 h preoperatively (reducing insulin resistance), avoidance of prolonged fasting and mechanical bowel prep (procedure-dependent), and preoperative anaemia correction." },
      { h: "Intraoperative Elements", b: "Goal-directed fluid therapy avoiding both hypo- and hypervolaemia, opioid-sparing multimodal analgesia (regional/neuraxial blocks, paracetamol, NSAIDs, ketamine, lidocaine infusion where appropriate), maintenance of normothermia, PONV prophylaxis, and minimally invasive surgical technique where possible." },
      { h: "Postoperative Elements", b: "Early mobilisation (within hours), early oral intake, early urinary catheter and drain removal, opioid-sparing analgesia continued, and structured discharge criteria — together shortening length of stay and reducing complications versus traditional care in multiple randomised trials and meta-analyses." },
      { h: "Audit", b: "ERAS pathways depend on protocol compliance audited against defined elements; higher compliance correlates with better outcomes, making ongoing audit (e.g. via the ERAS Interactive Audit System) a core part of the programme rather than a one-time protocol change." }
    ]
  });

  // ========================================================================
  // VENTILATORS & DEVICES — breathing systems, ventilators, equipment
  // ========================================================================

  topics.push({
    id: "breathing-systems-mapleson",
    cat: "equipment",
    name: "Breathing Systems & Mapleson Circuits (A–F)",
    short: "Mapleson Circuits",
    tags: ["Classification", "Non-rebreathing"],
    tagline: "Classification of anaesthetic breathing systems and the six Mapleson (A–F) circuits",
    source: "Miller's Anesthesia, 10th ed., Ch. 21 (Anesthesia Delivery Systems); Dorsch & Dorsch, Understanding Anesthesia Equipment, 5th ed.; Morgan & Mikhail's Clinical Anesthesiology, 7th ed., Ch. 4.",
    sections: [
      { h: "Classification of Breathing Systems", b: "Breathing systems are classified as open (no reservoir or valves, e.g. an open mask with gas simply blown across the face), semi-open (a reservoir but no rebreathing of exhaled gas at adequate fresh gas flow — the Mapleson A–F systems), semi-closed (partial rebreathing after CO2 absorption — the circle system at low-to-moderate fresh gas flow, the most widely used adult system today), and closed (fresh gas flow matched exactly to metabolic uptake, with the APL/relief valve closed and no gas vented — a variant of circle-system use rather than a separate system). The Mapleson systems are valveless of unidirectional flow control (gas can move both ways through the tubing) and rely entirely on fresh gas flow, tubing volume and component arrangement to prevent rebreathing; the circle system instead uses unidirectional valves and a CO2 absorber, covered in the next topic." },
      { h: "Mapleson Classification — Diagrams (A–F)", b: "All six systems share the same basic parts — a reservoir bag, corrugated tubing, an adjustable pressure-limiting (APL) valve, and a fresh gas (FG) inlet — arranged in different orders relative to the patient. The functionally important difference is simply where the FG inlet and the APL valve sit relative to the patient.", diagram: "mapleson-grid" },
      { h: "Mapleson A (Magill attachment / Lack circuit)", b: "Fresh gas enters at the machine end, right next to the reservoir bag; the APL valve sits at the patient end, just before the face mask/tube connector, with a long corrugated tube in between. This arrangement makes Mapleson A the most efficient system for spontaneous ventilation — during exhalation, dead-space and alveolar gas fill the tube first and are preferentially vented through the nearby APL valve before fresh gas has to be wasted, so fresh gas flow approximately equal to the patient's own minute ventilation is enough to prevent rebreathing. It is markedly inefficient for controlled (positive-pressure) ventilation, where the mechanics reverse and very high fresh gas flow would be needed — so Mapleson A is essentially not used for controlled ventilation. The Lack circuit is a coaxial modification of Mapleson A that relocates the APL valve to the machine end via a narrow inner expiratory limb (for the operator's convenience) while preserving Mapleson A's functional (efficient-for-spontaneous-ventilation) behaviour." },
      { h: "Mapleson B and C", b: "In both B and C the fresh gas inlet and the APL valve are clustered together at the patient end, with the reservoir bag at the machine end — B has a length of corrugated tubing between the valve and the bag, while C omits the tubing so the bag sits directly behind the valve (a compact, low-volume assembly). Neither is efficient for spontaneous or for controlled ventilation — commonly quoted rule-of-thumb fresh gas flows of roughly 1.5–2× minute ventilation are needed to limit rebreathing in either mode. Mapleson B is now essentially of historical/exam interest only; Mapleson C's compact, low-dead-space design is still found in some self-inflating-bag-free manual resuscitation and transport circuits." },
      { h: "Mapleson D and the Bain circuit", b: "Mapleson D places the fresh gas inlet at the patient end but moves the APL valve to the machine end, next to the reservoir bag, with a long corrugated tube carrying exhaled gas back toward the valve — essentially the mirror image of Mapleson A. This makes D relatively efficient for controlled ventilation (a fresh gas flow of roughly 2–2.5× minute ventilation is a commonly cited rule of thumb to avoid rebreathing during positive-pressure ventilation) but inefficient for spontaneous ventilation, where a considerably higher flow is needed. The Bain circuit is a coaxial version of Mapleson D in which the fresh gas is delivered through a narrow inner tube running the length of the outer corrugated (expiratory) tube — lighter and less bulky at the patient end, but the inner tube's patency must be checked before use (a kinked or disconnected inner tube causes a large increase in apparatus dead space and can go unnoticed — classically checked with the Pethick test, observing bag deflation on the oxygen flush with the outer tube occluded)." },
      { h: "Mapleson E and F (Ayre's T-piece / Jackson-Rees)", b: "Mapleson E (Ayre's T-piece) has no valve and no bag: fresh gas enters at a simple T-junction next to the patient connector, and an open-ended length of tubing extending away from the patient acts as a reservoir for fresh gas during the expiratory pause — its volume needs to be at least the patient's tidal volume to avoid entraining room air, but not so large that it adds excessive apparatus dead space. Mapleson F is the Jackson-Rees modification, which replaces the plain open tail with an open-tailed (or side-vented) reservoir bag, letting the operator see spontaneous breathing movements and manually assist or control ventilation by intermittently occluding the tail. Both are low-resistance, valveless systems that made them historically popular for paediatric anaesthesia, though modern paediatric circle systems have replaced them in many settings; both need a comparatively high fresh gas flow (commonly cited as roughly 2–3× minute ventilation) because there is no valve to conserve fresh gas between breaths." },
      { h: "Exam pearls", b: "The single most tested contrast is: Mapleson A — valve near the patient — most efficient for spontaneous ventilation; Mapleson D — valve near the machine/bag — most efficient for controlled ventilation (“A for Awake/spontaneous, D for Ventilated/controlled” is a common memory aid). B and C are largely obsolete teaching points. E and F are the valveless paediatric T-piece systems. None of the Mapleson systems allow truly low fresh gas flow anaesthesia — that requires the circle system with CO2 absorption, covered next." }
    ]
  });

  topics.push({
    id: "circle-system",
    cat: "equipment",
    name: "Circle Breathing System & Low-Flow Anaesthesia",
    short: "Circle System",
    tags: ["Semi-closed", "CO2 absorption"],
    tagline: "The semi-closed rebreathing circuit that is the standard adult breathing system today",
    source: "Miller's Anesthesia, 10th ed., Ch. 21; Dorsch & Dorsch, Understanding Anesthesia Equipment, 5th ed.",
    sections: [
      { h: "Components", b: "A fresh gas inlet, inspiratory and expiratory corrugated limbs each with a unidirectional (one-way) valve, a Y-piece connecting to the patient, a CO2 absorber canister, an APL valve for manual ventilation (replaced functionally by the ventilator's relief valve when in mechanical-ventilation mode), and a reservoir bag. The unidirectional valves force gas to flow in one direction only around the circle, which — together with CO2 absorption — is what allows exhaled gas to be safely rebreathed after the CO2 is removed, unlike the valveless Mapleson systems." },
      { h: "CO2 absorption", b: "Traditional soda lime (mainly calcium hydroxide with a small amount of sodium and/or potassium hydroxide as activators) reacts with CO2 and water to form calcium carbonate, releasing heat; a pH-sensitive colour indicator (commonly ethyl violet, colourless to purple) signals exhaustion. Newer low- or no-strong-alkali absorbents (e.g. calcium hydroxide with calcium chloride, marketed as Amsorb Plus) were introduced to reduce the strong-alkali-driven degradation of volatile agents." },
      { h: "Advantages of low-flow anaesthesia", b: "Running the circle system at low fresh gas flow (rebreathing most exhaled gas after CO2 removal) conserves volatile anaesthetic agent (lower cost and drug consumption), conserves the patient's own heat and humidity better than high-flow anaesthesia (reducing airway drying and heat loss), and reduces operating-room atmospheric pollution and the environmental/greenhouse-gas footprint of volatile agents — an increasingly emphasised consideration in current sustainable-anaesthesia guidance." },
      { h: "Hazard: desiccated absorbent", b: "If CO2 absorbent is allowed to dry out (classically after high fresh gas flow is left running through an idle machine, e.g. over a weekend) it can react with sevoflurane to form Compound A (nephrotoxic in rats at high concentration; clinical significance in humans remains debated, and low-flow sevoflurane use is generally considered safe in modern practice) and, more dangerously, react exothermically with desflurane or isoflurane to generate carbon monoxide and significant heat, with case reports of absorbent-canister fires. Current practice is to turn off fresh gas flow (or the whole machine) when not actively in use rather than leaving flow running continuously." },
      { h: "Unidirectional valve integrity", b: "A stuck-open or incompetent unidirectional valve can allow exhaled gas to bypass the absorber and be rebreathed unabsorbed (hypercapnia), while a stuck-closed valve causes a closed-loop obstruction to ventilation — checking valve competency and free movement is part of the standard pre-use anaesthesia machine check." }
    ]
  });

  topics.push({
    id: "ventilators-classification",
    cat: "equipment",
    name: "Anaesthesia Ventilators — Classification, Bellows & Modes",
    short: "Ventilator Classification",
    tags: ["Bellows", "Ventilation modes"],
    tagline: "How anaesthesia ventilators are powered, cycled, and the modes available on modern workstations",
    source: "Miller's Anesthesia, 10th ed., Ch. 21; Dorsch & Dorsch, Understanding Anesthesia Equipment, 5th ed.",
    sections: [
      { h: "Power & drive mechanism", b: "Pneumatically driven bellows ventilators use a compressed driving gas to squeeze a bellows containing the patient's tidal volume, transmitting the pressure rather than mixing the driving gas with the breathing circuit gas. Electronically driven piston ventilators instead use a computer-controlled piston or turbine to deliver gas directly, without a driving-gas interface; because there is no bellows to fill, piston ventilators can more precisely deliver the set tidal volume and automatically compensate for fresh gas flow and breathing-circuit compliance/gas compression, and they do not consume additional driving gas — relevant when running on a limited cylinder supply." },
      { h: "Ascending vs descending bellows", b: "Ascending (“standing”) bellows rise during exhalation and are now near-universal in modern anaesthesia machines because they are inherently safer if a circuit disconnection or major leak occurs: the bellows fails to fill, visibly collapses under gravity, and reliably triggers a low-pressure/low-volume alarm. Older descending (“hanging”) bellows are pulled down by a weight and can continue moving up and down under gravity even after a disconnection (entraining room air at the leak), giving a false visual impression of normal cycling and relying entirely on pressure/volume alarms — rather than the bellows' own visible behaviour — to detect the problem." },
      { h: "Cycling", b: "Ventilators are also described by how they end inspiration: time-cycled (inspiration ends after a preset time), volume-cycled (ends once a preset volume has been delivered), pressure-cycled (ends once a preset pressure is reached), or flow-cycled (ends once inspiratory flow falls to a preset fraction of peak flow, as in pressure-support ventilation)." },
      { h: "Common ventilation modes on anaesthesia workstations", b: "Volume-controlled ventilation (VCV) delivers a fixed tidal volume with a variable, flow-dependent pressure. Pressure-controlled ventilation (PCV) delivers a fixed inspiratory pressure with a variable, compliance-dependent volume, and typically produces a more favourable decelerating inspiratory flow pattern. Pressure-controlled ventilation with volume guarantee (marketed under various vendor-specific names) automatically adjusts the delivered pressure breath-to-breath to achieve a clinician-set target tidal volume, combining PCV's flow pattern with VCV's volume reliability. Synchronised intermittent mandatory ventilation (SIMV) and pressure-support ventilation (PSV) allow a spontaneously breathing patient (e.g. during emergence, or under combined general/regional anaesthesia) to trigger and augment their own breaths." },
      { h: "Fresh gas flow compensation", b: "Older pneumatic bellows ventilators add the fresh gas flow entering the circuit during inspiration to the delivered tidal volume, so a higher fresh gas flow modestly increases the volume actually delivered to the patient above the set value. Modern microprocessor-controlled and piston ventilators electronically measure and compensate for fresh gas flow and circuit compliance, so the set tidal volume is what is actually delivered regardless of fresh gas flow — an important patient-safety refinement highlighted in Miller's equipment chapter." }
    ]
  });

  topics.push({
    id: "vaporizers-device",
    cat: "equipment",
    name: "Vaporizers — Variable-Bypass Design & the Desflurane Exception",
    short: "Vaporizers",
    tags: ["Variable-bypass", "Desflurane"],
    tagline: "How agent-specific vaporizers meter volatile anaesthetic into the fresh gas stream, and why desflurane needs a different design",
    source: "Miller's Anesthesia, 10th ed., Ch. 21; Stoelting's Pharmacology & Physiology in Anesthetic Practice, 5th ed.; Dorsch & Dorsch, Understanding Anesthesia Equipment, 5th ed.",
    sections: [
      { h: "Variable-bypass principle", b: "Fresh gas entering the vaporizer is split between a bypass channel and a vaporizing chamber in a ratio set by the concentration dial (the “splitting ratio”); gas leaving the chamber is saturated with anaesthetic vapour at the chamber's temperature and saturated vapour pressure, then rejoins the bypass flow to produce the dialled output concentration. A temperature-compensating valve (classically a bimetallic strip or expanding bellows) automatically widens the split into the vaporizing chamber as the liquid agent cools during vaporisation (which would otherwise reduce vapour output), keeping the delivered concentration accurate across a range of ambient and internal temperatures." },
      { h: "Agent-specific design", b: "Each variable-bypass vaporizer is calibrated, and mechanically keyed (e.g. Selectatec-style agent-specific filling collars), for one volatile agent only, because the splitting ratio needed depends on that agent's own saturated-vapour-pressure curve. Filling or using the wrong agent in a vaporizer produces a dangerously inaccurate — usually excessive — output concentration, and modern keyed-filler systems are specifically designed to prevent this." },
      { h: "The desflurane exception", b: "Desflurane boils at approximately 23.5°C — close to room temperature — with a saturated vapour pressure of roughly 669 mmHg (about 88.5 kPa) at 20°C, both far too high and unstable for a conventional variable-bypass design to control accurately. The Tec 6 / D-Vapor-style desflurane vaporizer instead electrically heats a sealed liquid-desflurane reservoir to a fixed temperature of about 39°C (raising its vapour pressure to roughly 1300 mmHg, about 2 atmospheres), and electronically injects a metered flow of desflurane vapour into the fresh gas stream in proportion to fresh gas flow — a heated, pressurised gas/vapour blender rather than a passive variable-bypass splitter. A safety interlock prevents any desflurane delivery until the unit reaches its correct operating temperature." },
      { h: "Interlock systems", b: "Mechanical or electronic interlocks on modern anaesthesia workstations physically or electronically prevent more than one vaporizer being engaged (turned on) at the same time, preventing accidental simultaneous delivery of two volatile agents." },
      { h: "Vaporizer safety checks", b: "Tipping or overfilling a variable-bypass vaporizer can flood the bypass chamber with liquid agent, risking a dangerous overdose the next time it is used, so vaporizers should be filled upright via the agent-specific keyed port only and kept upright in transport; a leak check with each vaporizer individually turned on (as well as off) is part of the standard pre-use anaesthesia machine check." }
    ]
  });

  topics.push({
    id: "airway-devices-equipment",
    cat: "equipment",
    name: "Airway Devices — Tubes, Supraglottic Airways & Videolaryngoscopy",
    short: "Airway Devices",
    tags: ["SADs", "Videolaryngoscopy"],
    tagline: "The hardware used to secure and maintain the airway, from simple masks to hyperangulated video blades",
    source: "Miller's Anesthesia, 10th ed., Ch. 28–30; Difficult Airway Society (DAS) 2015 guidelines for unanticipated difficult intubation; UpToDate \"Devices for difficult airway management in adults\" (2025).",
    sections: [
      { h: "Endotracheal tubes", b: "Cuffed tubes are now used routinely even in young children (provided the tube is correctly sized and cuff pressure is monitored, typically kept below about 20–25 cmH2O to reduce the risk of tracheal mucosal ischaemia), a shift from older practice favouring uncuffed paediatric tubes. Specialised tubes include reinforced/armoured (kink-resistant) tubes, preformed RAE tubes (oral or nasal, e.g. for ENT or ophthalmic surgery where the circuit connection needs to be kept clear of the surgical field), double-lumen tubes (for one-lung ventilation in thoracic surgery), and laser-resistant tubes (for airway laser surgery)." },
      { h: "Supraglottic airway devices (SADs)", b: "First-generation SADs (e.g. the classic laryngeal mask airway) are a simple cuffed mask sitting over the laryngeal inlet. Second-generation SADs add an integrated drain/gastric channel alongside the airway channel, allowing passage of an orogastric tube to decompress the stomach and generally achieving a higher oropharyngeal leak (seal) pressure — examples include the LMA ProSeal, LMA Supreme, and the i-gel, whose non-inflatable, gel-like thermoplastic elastomer cuff conforms to perilaryngeal anatomy without needing cuff inflation. Second-generation devices are now generally preferred over first-generation devices where a SAD is chosen, for their better seal and additional aspiration protection." },
      { h: "Videolaryngoscopes", b: "Macintosh-geometry-blade videolaryngoscopes (e.g. C-MAC) give a view similar to conventional direct laryngoscopy but displayed on a screen, and current difficult-airway guidance increasingly supports videolaryngoscopy as a reasonable first-line/routine tool rather than reserving it only for known difficult airways. Hyperangulated-blade videolaryngoscopes (e.g. GlideScope, McGrath X-blade) provide an indirect, markedly improved glottic view in anticipated difficult airways, but because the line of sight around the curved blade does not match the line along which the tube must be advanced, they require a matched rigid or malleable stylet shaped to the blade's curvature." },
      { h: "Airway adjuncts", b: "Bougies (gum-elastic or coudé-tip introducers) are used to railroad a tube into the trachea when only the epiglottis or posterior larynx can be seen; stylets (rigid or malleable) shape a tube for direct or video laryngoscopy; hollow intubating introducers (e.g. Frova, Aintree) allow jet oxygenation through the introducer itself or railroading a tube or flexible fibrescope over it; flexible fibreoptic bronchoscopes are used for awake or asleep fibreoptic intubation (see the Difficult Airway Management topic)." },
      { h: "Difficult airway cart", b: "Current major-society guidance (ASA 2022 difficult airway guidelines; DAS 2015) recommends that a dedicated, immediately available difficult-airway cart or trolley — stocked with a range of laryngoscope blades, supraglottic airway devices, bougies/introducers, a videolaryngoscope, and equipment for emergency front-of-neck (surgical) airway access — be present in every location where general anaesthesia is administered." }
    ]
  });

  topics.push({
    id: "humidification-scavenging",
    cat: "equipment",
    name: "Humidification, Filtration & Scavenging Systems",
    short: "Humidification & Scavenging",
    tags: ["HME", "Waste gas"],
    tagline: "Conditioning inspired gas and safely removing waste anaesthetic gas from the operating room",
    source: "Miller's Anesthesia, 10th ed., Ch. 21; NIOSH Publication No. 2007-151, Waste Anesthetic Gases: Occupational Hazards in Hospitals; Dorsch & Dorsch, Understanding Anesthesia Equipment, 5th ed.",
    sections: [
      { h: "Heat and moisture exchangers (HMEs)", b: "Passive devices placed at the patient end of the breathing circuit that trap heat and moisture from exhaled gas in a hygroscopic or hydrophobic element and return some of it to the next inspired breath, partly replacing the conditioning function of the nose and upper airway that is bypassed by tracheal intubation. HMEs are simple and inexpensive but add a small amount of dead space and resistance to the circuit; many combine an integral bacterial/viral filter (an HME-F, or 'Heat and Moisture Exchanging Filter')." },
      { h: "Active (heated) humidifiers", b: "Electrically heated water-bath or heated-wire humidifier systems actively add heat and water vapour to inspired gas, providing more complete conditioning than a passive HME. They are generally reserved for situations where an HME's passive conditioning is judged insufficient — prolonged mechanical ventilation (e.g. ICU), very long surgery, and neonatal/paediatric anaesthesia, where airway drying and heat loss are a greater concern." },
      { h: "Breathing system filters", b: "Bacterial/viral filters, placed at the patient (Y-piece or mask) end of the circuit, reduce cross-contamination risk between successive patients on the same anaesthesia machine and help protect the machine's internal breathing-system components and CO2 absorber from soiling." },
      { h: "Scavenging systems", b: "Excess/waste gas vented from the APL valve or ventilator relief valve is removed from the operating room by a scavenging system: active systems use a vacuum-driven disposal route with a receiving system and an interface/relief valve that prevents excess positive or negative pressure being transmitted back to the breathing circuit; passive systems rely on the gas's own positive pressure and wide-bore tubing routed to an outside vent, with no vacuum assistance. An Active Gas Scavenging System (AGSS) interface must never be allowed to apply negative pressure to, or otherwise restrict, the breathing circuit itself." },
      { h: "Occupational exposure limits", b: "NIOSH recommends a time-weighted-average exposure limit of 25 ppm for nitrous oxide during the period of administration, and a 1-hour ceiling limit of 2 ppm for halogenated volatile agents used alone; when a halogenated agent is used together with nitrous oxide, NIOSH recommends the halogenated-agent limit be kept to no more than 0.5 ppm. There is currently no specific NIOSH recommended exposure limit for isoflurane, desflurane or sevoflurane individually, though other bodies (e.g. ACGIH) have published their own occupational exposure guidance for some agents. Properly functioning scavenging, a good mask/circuit seal, and minimising deliberate flushing or spillage are the main controls used to keep trace operating-room gas concentrations within these limits." }
    ]
  });

  topics.push({
    id: "warming-suction-devices",
    cat: "equipment",
    name: "Patient Warming, Fluid Warming & Suction Devices",
    short: "Warming & Suction",
    tags: ["Normothermia", "Massive transfusion"],
    tagline: "Equipment used to prevent perioperative hypothermia and manage airway/surgical suction",
    source: "Miller's Anesthesia, 10th ed., Ch. 89 (Perioperative Temperature Regulation); Barash Clinical Anesthesia, 8th ed.",
    sections: [
      { h: "Why perioperative hypothermia matters", b: "General and neuraxial anaesthesia both impair central thermoregulation — vasodilation-driven core-to-peripheral heat redistribution is the dominant mechanism of the early temperature drop after induction. Even mild hypothermia (core temperature below about 36°C) is associated with an increased risk of surgical site infection, coagulopathy and increased blood loss, delayed drug metabolism and prolonged recovery/discharge times, and patient discomfort from shivering — routine core or near-core temperature monitoring and active warming are now standard of care for all but the briefest procedures." },
      { h: "Forced-air warming", b: "The most widely used active warming method: a blower unit forces warmed air through a single-use inflatable blanket placed over or under the patient. It is effective and generally safe; correct blanket placement matters, since directing the warm-air hose at the patient without the intended blanket attached is a recognised burn-risk error." },
      { h: "Other warming modalities", b: "Conductive warming mattresses or pads (circulating-water or resistive-polymer electric systems), warmed intravenous fluids, and passive measures (raising ambient theatre temperature, minimising skin exposure) are commonly used adjuncts, particularly for cases with large surface exposure or in neonates/infants." },
      { h: "Fluid and blood warmers", b: "In-line fluid warmers condition routine maintenance intravenous fluid before it reaches the patient. High-capacity rapid-infusion warmers (e.g. the Belmont Rapid Infuser, Level 1 system) can deliver large volumes of warmed fluid or blood products very rapidly during massive haemorrhage, and are typically integrated into a hospital's massive transfusion protocol." },
      { h: "Suction devices", b: "Wall-mounted or portable vacuum suction with a collection canister and tubing must be immediately available and checked before induction of every general anaesthetic, particularly in a patient at increased aspiration risk (see Rapid Sequence Induction). A rigid-tip (Yankauer) sucker is the standard tool for clearing oropharyngeal secretions or blood during airway management, while flexible fine-bore catheters are used for tracheal or nasogastric suctioning." }
    ]
  });

  // ========================================================================
  // DRUG MONOGRAPH BUILDER
  // ========================================================================
  const drugs = [];
  function addDrug(d) { drugs.push(d); }

  // ---------------- INDUCTION AGENTS ----------------
  addDrug({
    id: "propofol", cat: "induction", name: "Propofol", brand: "Diprivan",
    tagline: "IV sedative-hypnotic for induction and maintenance of anaesthesia/sedation",
    tags: ["GABA-A agonist", "TIVA"],
    source: SRC.fdaUpToDate("Diprivan (propofol) injectable emulsion label", "Fresenius Kabi/AstraZeneca"),
    structure: "2,6-diisopropylphenol — a substituted phenol, structurally unrelated to barbiturates or other IV anaesthetics. Highly lipophilic and water-insoluble, so it is formulated as a white, oil-in-water emulsion (soybean oil, glycerol, egg lecithin), which accounts for injection pain and the need for aseptic single-use handling (supports bacterial growth if contaminated).",
    pd: "Potentiates GABA-A receptor chloride-channel activity (increasing chloride conductance and hyperpolarising neurons), with additional actions reducing NMDA receptor activity at higher concentrations. Produces dose-dependent sedation to general anaesthesia, amnesia (weaker than benzodiazepines), and has antiemetic and anticonvulsant properties. Causes dose-dependent decreases in blood pressure (direct vasodilation and myocardial depression) and respiratory depression/apnoea, with relatively preserved cerebral autoregulation and reduced cerebral metabolic rate and ICP.",
    pk: "Onset ~30 seconds (one arm-to-brain circulation time); rapid redistribution gives a short context-sensitive half-time after brief use, though it prolongs with long infusions. Extensively hepatically metabolised (glucuronidation and sulfation) to inactive metabolites with additional extrahepatic (lung, kidney) clearance, renally excreted; high clearance approaches or exceeds hepatic blood flow. Highly protein bound (~98%).",
    dosage: "FDA-approved: Induction of general anaesthesia — 2–2.5 mg/kg IV in healthy adults <55 y, titrated in ~40 mg increments every 10 seconds; reduce dose and titrate more slowly in the elderly, debilitated or ASA III/IV patients. Maintenance of general anaesthesia — 100–200 mcg/kg/min IV infusion (or intermittent bolus), titrated to effect. Monitored anaesthesia care sedation — initial infusion 25–75 mcg/kg/min or slow bolus 0.5 mg/kg over 3–5 min. ICU sedation (mechanically ventilated adults) — 5 mcg/kg/min initially, titrated in increments to a maximum labelled rate.",
    offLabel: "Procedural sedation outside the ICU/OR by appropriately trained non-anaesthesia personnel in some institutional protocols; refractory status epilepticus infusion; refractory chemotherapy-induced or palliative-care nausea at sub-hypnotic doses; treatment of PONV at sub-hypnotic bolus doses (10–20 mg).",
    complications: "Dose-dependent hypotension and apnoea/respiratory depression requiring airway support; pain on injection (reduced by lidocaine co-administration or large-vein injection); rare but serious Propofol Infusion Syndrome (PRIS) with prolonged high-dose infusion — metabolic acidosis, rhabdomyolysis, hyperkalaemia, cardiac failure/arrhythmia, more common in children, critical illness, high catecholamine/steroid states, and prolonged high infusion rates; anaphylaxis (egg/soy allergy is not a strict contraindication per current evidence but caution is often exercised); bacterial contamination risk given the lipid emulsion vehicle."
  });

  addDrug({
    id: "etomidate", cat: "induction", name: "Etomidate", brand: "Amidate",
    tagline: "Haemodynamically stable IV induction agent, imidazole derivative",
    tags: ["Cardiac-stable induction", "Adrenal suppression"],
    source: SRC.fdaUpToDate("Amidate (etomidate) injection label", "Hospira/Pfizer"),
    structure: "An imidazole-containing carboxylated compound, structurally unrelated to other IV induction agents; the imidazole ring confers water solubility at acidic pH but the marketed formulation is in propylene glycol, contributing to injection pain and haemolysis at the injection site.",
    pd: "Potentiates GABA-A receptor activity similarly to other GABAergic hypnotics, producing hypnosis without significant analgesia. Its hallmark is minimal effect on heart rate, blood pressure or cardiac output/contractility, making it favoured for induction in patients with poor cardiovascular reserve. Reduces cerebral metabolic rate, cerebral blood flow and ICP while maintaining cerebral perfusion pressure. Causes reversible, dose-dependent inhibition of adrenocortical 11β-hydroxylase, suppressing cortisol/aldosterone synthesis for several hours even after a single induction dose.",
    pk: "Onset ~30–60 seconds; short duration after a single bolus due to rapid redistribution (context-sensitive half-time rises with repeated dosing/infusion, which is why it is not used for maintenance infusion). Hepatic and plasma esterase hydrolysis to inactive metabolites, renal excretion of metabolites; high protein binding (~75%).",
    dosage: "FDA-approved: Induction of general anaesthesia — 0.2–0.6 mg/kg IV (typical adult dose ~0.3 mg/kg) given over 30–60 seconds. Not indicated by the label for maintenance infusion or for use beyond induction due to adrenal suppression risk with repeated/continuous dosing.",
    offLabel: "Occasionally used (with caution and clinical justification) as a single induction dose in septic or critically ill patients for rapid sequence induction where haemodynamic stability is prioritised, despite ongoing debate about even single-dose adrenal suppression in sepsis; procedural sedation induction in select high-risk cardiac patients.",
    complications: "Adrenocortical suppression (most clinically significant with infusion or repeat dosing; single-dose clinical significance in sepsis remains debated in the literature) — some clinicians give stress-dose steroids empirically after use in critically ill/septic patients. Pain on injection and superficial thrombophlebitis. Myoclonus (common, from disinhibition of subcortical structures, not epileptiform) — attenuated by opioid or benzodiazepine pre-treatment. Postoperative nausea/vomiting more frequent than with propofol. No significant histamine release; minimal respiratory depression compared with other inducers, though apnoea can still occur especially with opioid co-administration."
  });

  addDrug({
    id: "ketamine", cat: "induction", name: "Ketamine", brand: "Ketalar",
    tagline: "NMDA-antagonist dissociative anaesthetic with analgesic and bronchodilator properties",
    tags: ["NMDA antagonist", "Dissociative anaesthesia"],
    source: SRC.fdaUpToDate("Ketalar (ketamine hydrochloride) injection label", "Par Pharmaceutical"),
    structure: "An arylcycloalkylamine, a phencyclidine (PCP) derivative; exists as a racemic mixture of R(-) and S(+) enantiomers in most formulations (esketamine, the S(+) enantiomer, is a separately approved product with roughly twice the potency).",
    pd: "Non-competitive NMDA-receptor antagonist producing a 'dissociative' anaesthetic state (functional dissociation between thalamocortical and limbic systems) with profound analgesia, amnesia, and often-preserved airway reflexes, spontaneous ventilation, and pharyngeal-laryngeal tone. Unlike most inducers, it stimulates the sympathetic nervous system (central and by inhibiting catecholamine reuptake), typically increasing heart rate, blood pressure and cardiac output — but exerts direct negative inotropy unmasked in catecholamine-depleted/critically ill patients. Bronchodilator (useful in reactive airway disease/status asthmaticus). Increases cerebral blood flow and, historically thought to raise ICP, though this concern has been substantially revised by more recent evidence in ventilated patients.",
    pk: "Onset ~30–60 seconds IV (3–4 min IM); highly lipophilic with rapid brain uptake and redistribution giving short duration after a single dose. Extensive hepatic metabolism via CYP3A4/2B6 to norketamine (an active metabolite with ~20–30% of parent potency), then further metabolised and renally excreted.",
    dosage: "FDA-approved (Ketalar label): Induction — 1–4.5 mg/kg IV over 60 seconds, or 6.5–13 mg/kg IM. Maintenance — repeat half to full induction dose as needed, or IV infusion (commonly cited 0.1–0.5 mg/mg/kg/h in clinical use, titrated). Diagnostic and surgical procedures not requiring skeletal muscle relaxation may use the same induction dosing.",
    offLabel: "Sub-dissociative analgesic infusion for acute and chronic/refractory pain (typically 0.1–0.3 mg/kg IV bolus or low-dose infusion); adjunct for opioid-sparing multimodal perioperative analgesia; procedural sedation in the emergency department; treatment-resistant depression (as esketamine, Spravato, which itself carries a separate FDA approval for this indication); status asthmaticus refractory to standard bronchodilators; prehospital/battlefield analgesia and induction given its haemodynamic and airway-reflex profile.",
    complications: "Emergence phenomena — vivid dreams, hallucinations, dysphoria (reduced by co-administered benzodiazepine and by minimising external stimulation during emergence). Hypertension, tachycardia, increased myocardial oxygen demand (relatively contraindicated in poorly controlled ischaemic heart disease/severe hypertension). Hypersalivation (often premedicated with an antisialagogue). Laryngospasm risk from secretions despite preserved reflexes. Direct myocardial depression can be unmasked and cause hypotension in catecholamine-depleted critically ill/shock patients. Elevated intraocular pressure. Potential for misuse/diversion (Schedule III controlled substance in the US)."
  });

  addDrug({
    id: "thiopental", cat: "induction", name: "Thiopental (Sodium Thiopental)", brand: "Pentothal",
    tagline: "Ultra-short-acting barbiturate induction agent (historic gold standard; discontinued in the US market)",
    tags: ["Barbiturate", "Historic agent"],
    source: "FDA-approved prescribing information for Pentothal (thiopental sodium), last US-marketed formulation (Hospira) — product discontinued from the US market in 2011; UpToDate \"Barbiturates\" monograph (2025); Miller's Anesthesia, 10th ed., Ch. 21.",
    structure: "An oxybarbiturate with a sulfur atom replacing the oxygen at C2 of the barbituric-acid ring (a thiobarbiturate), which increases lipid solubility and speeds onset/redistribution compared with oxybarbiturates. Formulated as a highly alkaline (pH ~10–11) sodium salt powder for reconstitution; extravasation or intra-arterial injection causes severe tissue/vascular injury.",
    pd: "Potentiates GABA-A receptor chloride conductance (and at higher concentrations can directly activate the receptor), producing dose-dependent CNS depression from sedation to deep anaesthesia; no analgesic effect (can be antanalgesic at low doses). Dose-dependent myocardial depression and venodilation causing hypotension, and respiratory depression/apnoea. Reduces cerebral metabolic rate, cerebral blood flow and ICP — historically used for cerebral protection/burst suppression.",
    pk: "Onset ~30 seconds; short duration after a single dose from rapid redistribution to muscle/fat, but a long elimination half-life (~10+ hours) means repeated dosing causes marked accumulation and prolonged sedation, unlike propofol. Hepatic metabolism (mainly CYP-mediated oxidation), renal excretion of metabolites.",
    dosage: "Historic FDA-approved dosing: Induction — 3–5 mg/kg IV in healthy adults, titrated; lower doses in the elderly/hypovolaemic. No longer available in the US market (discontinued by the sole remaining manufacturer, Hospira, in 2011, related to manufacturing and its use in lethal injection); still used in some other countries. Included here for historical/comparative and exam relevance.",
    offLabel: "Was used off-label historically for status epilepticus refractory to first- and second-line agents and for therapeutic burst suppression in refractory intracranial hypertension — largely supplanted by propofol and other agents where thiopental is unavailable.",
    complications: "Severe tissue necrosis/thrombosis with extravasation or inadvertent intra-arterial injection (historically managed with local anaesthetic/vasodilator injection into the artery). Laryngospasm/bronchospasm (histamine release) more than propofol. Absolute contraindication in acute intermittent porphyria (barbiturates induce ALA synthase and can precipitate a life-threatening attack). Hypotension in hypovolaemic/cardiac-compromised patients. Prolonged recovery with repeated dosing due to zero-order-like accumulation kinetics at high cumulative doses."
  });

  addDrug({
    id: "midazolam", cat: "induction", name: "Midazolam", brand: "Versed",
    tagline: "Short-acting benzodiazepine used for premedication, sedation, and co-induction",
    tags: ["Benzodiazepine", "GABA-A modulator"],
    source: SRC.fdaUpToDate("Versed (midazolam) injection label", "Pfizer"),
    structure: "An imidazobenzodiazepine — the imidazole ring confers water solubility at acidic pH (parenteral formulation), with ring closure to the more lipophilic, CNS-active form occurring at physiological pH after injection, which speeds CNS penetration relative to older benzodiazepines.",
    pd: "Positive allosteric modulator at the benzodiazepine site of the GABA-A receptor, increasing the frequency of chloride-channel opening in response to GABA — producing sedation, anxiolysis, anterograde amnesia, and anticonvulsant effects, without direct analgesia. Minimal cardiovascular effect at sedative doses though can cause hypotension at induction doses or with opioid co-administration; dose-dependent respiratory depression, potentiated markedly by concurrent opioids.",
    pk: "Onset 1–3 min IV (peak effect slightly later); short-to-intermediate duration from hepatic clearance (though longer and less predictable than propofol/etomidate). Hepatic CYP3A4 metabolism to 1-hydroxymidazolam (active metabolite, renally excreted, can accumulate in renal failure), plasma protein binding ~97%. Elimination half-life prolonged in obesity, elderly, hepatic impairment and with CYP3A4 inhibitors.",
    dosage: "FDA-approved: Premedication (adults) — 1–2 mg IV increments (or 0.07–0.08 mg/kg IM), titrated. Conscious/procedural sedation — initial 0.5–2 mg IV slow increments, titrated to effect, total usually <5 mg. Induction of general anaesthesia — 0.1–0.3 mg/kg IV (lower with opioid premedication or in the elderly/high-risk). Continuous ICU sedation — 0.02–0.1 mg/kg/h IV infusion, titrated.",
    offLabel: "Intranasal or buccal administration for paediatric premedication/procedural sedation and for aborting seizures when IV access is unavailable; intramuscular use for acute agitation; adjunct in refractory status epilepticus (continuous infusion).",
    complications: "Dose-dependent respiratory depression and apnoea, markedly potentiated by opioids — a leading cause of sedation-related respiratory events; paradoxical agitation (particularly in children and the elderly); prolonged sedation/delayed emergence in the elderly, obese, hepatically impaired or with drug interactions (CYP3A4 inhibitors e.g. azoles, some macrolides); anterograde amnesia (therapeutic but can be distressing if unexpected); flumazenil is the specific reversal agent for benzodiazepine-induced sedation/respiratory depression."
  });

  // ---------------- MUSCLE RELAXANTS ----------------
  addDrug({
    id: "succinylcholine", cat: "relaxants", name: "Succinylcholine (Suxamethonium)", brand: "Anectine",
    tagline: "Depolarising neuromuscular blocker with the fastest onset — first-line for RSI",
    tags: ["Depolarising NMBA", "Fastest onset"],
    source: SRC.fdaUpToDate("Anectine (succinylcholine chloride) injection label", "Hospira/Pfizer"),
    structure: "Two acetylcholine molecules joined back-to-back through their acetate methyl groups (a bis-choline ester) — the only depolarising neuromuscular blocker in clinical use; its structural resemblance to acetylcholine explains both its nicotinic agonist activity and its rapid hydrolysis by plasma cholinesterase.",
    pd: "Binds nicotinic acetylcholine receptors at the neuromuscular junction as an agonist, causing sustained depolarisation of the motor endplate (seen clinically as fasciculations) followed by a depolarising (Phase I) block as receptors become desensitised/inactivated; with prolonged or repeated exposure a Phase II (desensitising, non-depolarising-like) block can develop. Causes transient hyperkalaemia (~0.5 mEq/L in normal patients, dangerously exaggerated in denervation states, burns, severe trauma/immobility, and neuromuscular disease due to extrajunctional receptor upregulation). Stimulates autonomic ganglia and cardiac muscarinic receptors — can cause bradycardia (especially with repeat dosing or in children) or, less predictably, tachycardia.",
    pk: "Fastest onset of any NMBA (~30–60 seconds) and shortest duration (~5–10 min) among clinically used relaxants, due to rapid hydrolysis by plasma (pseudo/butyryl-) cholinesterase — not acetylcholinesterase. Duration is markedly prolonged in patients with atypical or deficient plasma cholinesterase (genetic variants, liver disease, pregnancy, certain drugs) — can extend to hours in homozygous atypical enzyme.",
    dosage: "FDA-approved: Rapid sequence intubation (adults) — 1–1.5 mg/kg IV. Short surgical procedures — 0.3–1.1 mg/kg IV. Intramuscular route (when IV unavailable, e.g. paediatric laryngospasm) — up to 3–4 mg/kg IM (max 150 mg). Continuous infusion (rarely used now) — 2.5 mg/min titrated (with monitoring for Phase II block).",
    offLabel: "Treatment of severe laryngospasm refractory to positive-pressure ventilation and jaw thrust, often via the IM or intraosseous route when IV access is not yet secured — a well-established emergency use though not the primary labelled indication.",
    complications: "Hyperkalaemia — potentially fatal in patients with burns (after ~24 h and for up to 1–2 years), spinal cord injury, stroke, prolonged immobility, severe intra-abdominal sepsis, or neuromuscular disease (extrajunctional receptor proliferation); FDA black-box warning for risk of hyperkalaemic cardiac arrest, especially in undiagnosed skeletal-muscle myopathy in paediatric patients (label restricts routine paediatric use to emergency airway control). Malignant hyperthermia triggering agent. Masseter muscle rigidity (may herald MH). Bradycardia/arrhythmia, especially with repeat dosing in children (often premedicated with atropine). Myalgia postoperatively (from fasciculations). Prolonged paralysis in pseudocholinesterase deficiency. Increased intraocular, intracranial and intragastric pressure (clinical significance debated, historically a relative caution in open-globe injury)."
  });

  addDrug({
    id: "rocuronium", cat: "relaxants", name: "Rocuronium", brand: "Zemuron",
    tagline: "Intermediate-acting aminosteroid non-depolarising NMBA; fastest onset of its class, reversible by sugammadex",
    tags: ["Non-depolarising NMBA", "Aminosteroid"],
    source: SRC.fdaUpToDate("Zemuron (rocuronium bromide) injection label", "Merck"),
    structure: "An aminosteroid (2-morpholino-androstane derivative) non-depolarising neuromuscular blocker, structurally related to vecuronium but modified to accelerate onset; monoquaternary structure.",
    pd: "Competitive antagonist at the nicotinic acetylcholine receptor on the postjunctional motor endplate, preventing depolarisation and producing flaccid paralysis — reversible by acetylcholinesterase inhibitors (neostigmine, once spontaneous recovery has begun) or, distinctively, by sugammadex which directly encapsulates the rocuronium molecule regardless of block depth. Minimal histamine release and minimal cardiovascular/autonomic effect at clinical doses.",
    pk: "Onset 1–2 min at intubating dose (fastest onset of the non-depolarisers, approaching succinylcholine at higher/RSI doses), duration intermediate (~30–40 min at intubating dose, longer with repeat dosing). Primarily hepatic uptake and biliary excretion (largely unchanged drug), with minor renal excretion — duration prolonged in hepatic impairment more than renal impairment, though renal failure can still modestly prolong effect.",
    dosage: "FDA-approved: Tracheal intubation — 0.6 mg/kg IV (onset ~1–2 min, duration ~30 min) for routine intubation; 0.9–1.2 mg/kg IV for rapid sequence intubation (onset ~60–90 seconds). Maintenance — 0.1–0.15 mg/kg IV as needed, or continuous infusion 0.01 mg/kg/min, titrated to twitch monitoring.",
    offLabel: "High-dose use specifically to allow reliable RSI when succinylcholine is contraindicated (e.g. hyperkalaemia risk, MH susceptibility) — this is well accepted practice though the precise 'RSI dose' framing extends beyond the base labelled intubating dose range.",
    complications: "Residual neuromuscular blockade if reversal is inadequate or omitted — a major cause of postoperative pulmonary complications; anaphylaxis (rocuronium is now one of the most commonly implicated NMBAs in perioperative anaphylaxis in several national registries); prolonged block in hepatic failure; requires quantitative neuromuscular monitoring (train-of-four) to confirm adequate reversal before extubation."
  });

  addDrug({
    id: "vecuronium", cat: "relaxants", name: "Vecuronium", brand: "Norcuron",
    tagline: "Intermediate-acting aminosteroid non-depolariser with minimal cardiovascular effect",
    tags: ["Non-depolarising NMBA", "Aminosteroid"],
    source: SRC.fdaUpToDate("Norcuron (vecuronium bromide) injection label (brand discontinued; generic vecuronium bromide for injection remains FDA-approved)", "originally Organon"),
    structure: "A monoquaternary aminosteroid, the des-methyl analogue of pancuronium (removal of one quaternary methyl group), which reduces vagolytic and ganglion-blocking activity compared with pancuronium while retaining an intermediate duration of action.",
    pd: "Competitive nicotinic-receptor antagonist at the neuromuscular junction, as for other non-depolarisers. Essentially free of histamine release and has minimal effect on heart rate or blood pressure at clinical doses, making it cardiovascularly 'silent' compared with pancuronium.",
    pk: "Onset ~2–3 min, intermediate duration (~25–40 min) similar to rocuronium and atracurium. Metabolised partly in the liver (deacetylation to an active metabolite, 3-desacetylvecuronium, with ~50–70% of parent potency) and excreted mainly biliary with a renal component — duration prolonged in both hepatic and renal impairment, and metabolite accumulation can prolong block in renal failure with repeated dosing/infusion.",
    dosage: "FDA-approved: Tracheal intubation — 0.08–0.1 mg/kg IV (onset ~2.5–3 min). Maintenance — 0.01–0.015 mg/kg IV increments as needed, or continuous infusion ~0.001 mg/kg/min (1 mcg/kg/min), titrated to neuromuscular monitoring.",
    offLabel: "Continuous ICU sedation-adjunct neuromuscular blockade (e.g. severe ARDS with ventilator dyssynchrony, refractory status asthmaticus) though cisatracurium is often preferred in renal/hepatic failure and for ICU use given more organ-independent clearance.",
    complications: "Prolonged neuromuscular blockade in hepatic or renal impairment, and with prolonged ICU infusion (risk of ICU-acquired weakness/prolonged paralysis, particularly with concurrent corticosteroids); residual block if reversal inadequate; generally well tolerated haemodynamically, so unexplained bradycardia/hypotension during its use should prompt evaluation of other causes rather than being attributed to the drug itself."
  });

  addDrug({
    id: "atracurium", cat: "relaxants", name: "Atracurium", brand: "Tracrium",
    tagline: "Intermediate-acting benzylisoquinolinium NMBA cleared independently of organ function",
    tags: ["Non-depolarising NMBA", "Hofmann elimination"],
    source: SRC.fdaUpToDate("Tracrium (atracurium besylate) injection label", "originally GlaxoSmithKline"),
    structure: "A bis-benzylisoquinolinium compound, formulated as a mixture of ten stereoisomers; notable for undergoing spontaneous, organ-independent degradation (Hofmann elimination) at physiological pH and temperature, in addition to non-specific plasma ester hydrolysis.",
    pd: "Competitive antagonism at the nicotinic neuromuscular junction receptor, as for other non-depolarisers. Can cause dose-dependent histamine release, particularly with rapid bolus administration, producing transient hypotension, flushing and tachycardia (or reflex bradycardia); ganglionic and cardiac muscarinic effects are minimal at clinical doses.",
    pk: "Onset ~2–3 min, intermediate duration (~30–45 min). Roughly 70–90% is degraded by Hofmann elimination (a temperature- and pH-dependent, non-enzymatic chemical process) with the remainder via non-specific plasma esterase hydrolysis — clearance is therefore essentially independent of hepatic and renal function, an advantage in organ failure. One breakdown product, laudanosine, is a CNS stimulant that can accumulate with prolonged high-dose infusion, particularly in hepatic/renal impairment (laudanosine itself is cleared partly by the liver).",
    dosage: "FDA-approved: Tracheal intubation/maintenance — 0.4–0.5 mg/kg IV initial dose (onset ~2–3 min), with maintenance doses of 0.08–0.1 mg/kg IV as needed; continuous infusion 5–10 mcg/kg/min (0.3–0.6 mg/kg/h), titrated to neuromuscular monitoring.",
    offLabel: "Was historically favoured (alongside cisatracurium) for neuromuscular blockade in patients with combined hepatic and renal failure specifically because of organ-independent Hofmann clearance — cisatracurium has largely replaced it in this role due to a more favourable histamine-release/potency profile.",
    complications: "Histamine-mediated flushing, hypotension, bronchospasm — more pronounced than with cisatracurium or vecuronium, so slower injection is advised, particularly in patients with reactive airway disease or haemodynamic instability. Laudanosine-related CNS excitation (seizure-threshold lowering) theoretically with very prolonged high-dose infusion, rarely clinically significant at standard use. Anaphylaxis (benzylisoquinoliniums as a class are implicated in perioperative NMBA allergy, though less frequently than rocuronium in most registries)."
  });

  addDrug({
    id: "cisatracurium", cat: "relaxants", name: "Cisatracurium", brand: "Nimbex",
    tagline: "A single stereoisomer of atracurium with minimal histamine release; preferred in organ failure and ICU use",
    tags: ["Non-depolarising NMBA", "Hofmann elimination"],
    source: SRC.fdaUpToDate("Nimbex (cisatracurium besylate) injection label", "AbbVie"),
    structure: "The 1R-cis,1'R-cis stereoisomer of atracurium — isolating this single isomer from the ten-isomer atracurium mixture increases potency roughly fourfold while substantially reducing histamine-releasing activity.",
    pd: "Competitive nicotinic-receptor antagonist at the neuromuscular junction. Essentially free of clinically significant histamine release even at doses well above ED95, and has no significant vagolytic or ganglion-blocking (autonomic) activity — haemodynamically the most stable of the benzylisoquinoliniums.",
    pk: "Onset ~2–3 min (slower than rocuronium), intermediate duration (~40–60 min at intubating dose). Degraded predominantly by Hofmann elimination (organ-independent), with negligible contribution from plasma esterases (unlike atracurium) — clearance is essentially unaffected by hepatic or renal failure, making it a preferred agent for prolonged neuromuscular blockade in ICU patients with multi-organ dysfunction.",
    dosage: "FDA-approved: Tracheal intubation — 0.15–0.2 mg/kg IV (onset ~2 min at higher dose). Maintenance — 0.03 mg/kg IV as needed, or continuous infusion 1–3 mcg/kg/min (0.06–0.18 mg/kg/h), titrated to twitch monitoring; ICU continuous infusion per critical-care protocols with regular train-of-four assessment.",
    offLabel: "First-line continuous neuromuscular blockade in severe ARDS with ventilator dyssynchrony/proning (supported by trial evidence for short-course early paralysis in severe ARDS) and in refractory status asthmaticus, favoured over aminosteroids partly for organ-independent clearance during prolonged infusion.",
    complications: "Prolonged block still possible with very prolonged ICU infusion, particularly with concurrent corticosteroid use (ICU-acquired weakness/critical illness myopathy); laudanosine accumulation theoretically possible but clinically negligible at standard dosing; minimal histamine release makes unexplained hypotension during use unlikely to be attributable to the drug itself; requires ongoing quantitative neuromuscular monitoring during prolonged infusion."
  });

  addDrug({
    id: "pancuronium", cat: "relaxants", name: "Pancuronium", brand: "Pavulon",
    tagline: "Long-acting aminosteroid NMBA with vagolytic (tachycardic) properties",
    tags: ["Non-depolarising NMBA", "Long-acting"],
    source: SRC.fdaUpToDate("Pavulon (pancuronium bromide) injection label (brand largely discontinued; generic pancuronium bromide remains available)", "originally Organon"),
    structure: "A bis-quaternary aminosteroid neuromuscular blocker with two acetylcholine-like fragments incorporated into a steroid nucleus, giving it high nicotinic-receptor affinity and a notably long duration of action.",
    pd: "Competitive nicotinic antagonist at the neuromuscular junction. Distinctively vagolytic — blocks cardiac muscarinic (M2) receptors and inhibits neuronal catecholamine reuptake — producing a dose-dependent increase in heart rate, blood pressure and cardiac output, useful when a mild tachycardic effect is desired (e.g. co-induction with high-dose opioid anaesthesia, historically in cardiac surgery) but undesirable in patients who cannot tolerate tachycardia.",
    pk: "Onset ~3–5 min, long duration (~60–100 min or longer), with cumulative prolongation on repeat dosing. Primarily renal excretion of unchanged drug (~40–70%) with a hepatic metabolite (3-desacetylpancuronium, weakly active) — duration is significantly prolonged in renal failure, and to a lesser extent in hepatic failure.",
    dosage: "FDA-approved: Tracheal intubation/maintenance — 0.06–0.1 mg/kg IV initial dose, with maintenance doses of 0.01 mg/kg IV as needed, titrated to neuromuscular monitoring; typically avoided for continuous infusion given its long duration and cumulative effect.",
    offLabel: "Occasionally selected specifically for its vagolytic tachycardic effect during high-dose opioid cardiac anaesthesia to offset opioid-induced bradycardia — a recognised though now less common practice as shorter-acting agents with more favourable reversal profiles have largely supplanted it.",
    complications: "Prolonged/residual neuromuscular blockade — particularly problematic in renal failure and in prolonged ICU use, historically associated with a higher incidence of postoperative residual paralysis than intermediate-acting agents; tachycardia/hypertension from vagolytic activity, relatively contraindicated where tachycardia is poorly tolerated (severe coronary disease, hypertrophic cardiomyopathy); slower and less complete reversal by neostigmine than intermediate-acting NMBAs; not effectively reversed by sugammadex in current standard practice (sugammadex is approved and validated for aminosteroid NMBAs, but pancuronium reversal data/labelling are more limited than for rocuronium/vecuronium)."
  });

  addDrug({
    id: "mivacurium", cat: "relaxants", name: "Mivacurium", brand: "Mivacron",
    tagline: "Short-acting benzylisoquinolinium NMBA hydrolysed by plasma cholinesterase",
    tags: ["Non-depolarising NMBA", "Short-acting"],
    source: SRC.fdaUpToDate("Mivacron (mivacurium chloride) injection label (brand discontinued in the US; included for comparative/exam relevance)", "originally GlaxoWellcome"),
    structure: "A bis-benzylisoquinolinium diester compound; the ester linkages make it susceptible to hydrolysis by plasma (butyryl-) cholinesterase, the same enzyme that metabolises succinylcholine — giving it the shortest duration of any non-depolarising NMBA.",
    pd: "Competitive nicotinic-receptor antagonist at the neuromuscular junction. Can cause dose- and rate-dependent histamine release (flushing, hypotension, tachycardia) similar to or slightly greater than atracurium, mitigated by slow injection.",
    pk: "Onset ~2–3 min, short duration (~15–20 min), roughly 2–3 times longer than succinylcholine but much shorter than other non-depolarisers, uniquely among them due to plasma cholinesterase hydrolysis. Like succinylcholine, duration is markedly prolonged in patients with atypical or deficient plasma cholinesterase.",
    dosage: "Historic FDA-approved dosing: Tracheal intubation — 0.15–0.2 mg/kg IV (onset ~2–3 min); maintenance — 0.1 mg/kg IV as needed, or continuous infusion 4–10 mcg/kg/min, titrated. No longer commercially available in the US market (withdrawn primarily for commercial reasons) but retained here for comparative pharmacology and examination relevance.",
    offLabel: "Was used for short surgical procedures needing brief non-depolarising relaxation (e.g. laryngoscopy, bronchoscopy, short laparoscopic cases) as an alternative to succinylcholine when a non-depolarising profile was preferred — a labelled, not off-label, use, retained here for completeness.",
    complications: "Prolonged block in plasma cholinesterase deficiency (as for succinylcholine) — same genetic/acquired risk factors apply (liver disease, pregnancy, certain drugs, homozygous atypical enzyme variants). Histamine-related hypotension/flushing/bronchospasm with rapid injection. Not reversible by sugammadex (a benzylisoquinolinium, not an aminosteroid) — reversal relies on spontaneous recovery or, once sufficient recovery has begun, an acetylcholinesterase inhibitor."
  });

  // ---------------- REVERSAL AGENTS ----------------
  addDrug({
    id: "sugammadex", cat: "reversal", name: "Sugammadex", brand: "Bridion",
    tagline: "Modified gamma-cyclodextrin that selectively encapsulates rocuronium/vecuronium for rapid reversal at any depth of block",
    tags: ["Selective relaxant binding agent", "Encapsulation"],
    source: SRC.fdaUpToDate("Bridion (sugammadex) injection label", "Merck"),
    structure: "A modified gamma-cyclodextrin — a cyclic oligosaccharide with a lipophilic central cavity and a hydrophilic exterior modified with thioether side chains terminating in carboxyl groups, engineered to form a tight, high-affinity 1:1 host–guest inclusion complex specifically with the aminosteroid neuromuscular blockers.",
    pd: "Acts by direct molecular encapsulation, not enzyme inhibition: it binds rocuronium (highest affinity) and, to a lesser extent, vecuronium and pancuronium, forming an inactive complex that lowers free plasma NMBA concentration, creating a concentration gradient that draws NMBA molecules away from the neuromuscular junction back into plasma for encapsulation and renal excretion. Unlike neostigmine it does not depend on any pre-existing degree of spontaneous recovery and has no cholinergic (muscarinic) side effects because it does not act on acetylcholinesterase.",
    pk: "Onset within 1–3 minutes for reversal of deep block (dose-dependent). Not metabolised — the sugammadex-rocuronium complex is eliminated almost entirely unchanged by the kidneys via glomerular filtration; elimination half-life ~2 h in patients with normal renal function, significantly prolonged in renal impairment (not recommended in severe renal impairment, including dialysis, per the FDA label, due to limited clearance data).",
    dosage: "FDA-approved: Reversal of moderate block (reappearance of T2 on train-of-four) — 2 mg/kg IV. Reversal of deep block (post-tetanic count ≥1–2, no TOF response) — 4 mg/kg IV. Immediate reversal (3 minutes after rocuronium 1.2 mg/kg for RSI) — 16 mg/kg IV. Dosing is based on actual body weight.",
    offLabel: "Off-label emergency reversal of rocuronium-induced block in a 'cannot intubate, cannot ventilate' rescue scenario at the 16 mg/kg dose specifically to restore spontaneous ventilation rapidly — this dose is labelled for immediate reversal after RSI dosing, and its rescue use in true CICO crises is a recognised though technically off-label extension of that indication.",
    complications: "Hypersensitivity/anaphylaxis (a recognised, sometimes severe reaction reported post-marketing — FDA label carries a warning); marked bradycardia including rare cases of cardiac arrest reported shortly after administration, warranting monitoring; can transiently reduce the efficacy of hormonal contraceptives (by binding progestogens) — patients are advised to use additional non-hormonal contraception; coagulation parameter effects — can transiently prolong aPTT/PT; interaction with subsequently administered aminosteroid NMBAs (re-paralysis with rocuronium/vecuronium may be difficult to achieve or require higher, non-aminosteroid alternative dosing for a period after sugammadex); does not reverse benzylisoquinolinium NMBAs (atracurium, cisatracurium, mivacurium)."
  });

  addDrug({
    id: "neostigmine", cat: "reversal", name: "Neostigmine", brand: "Prostigmin",
    tagline: "Acetylcholinesterase inhibitor used to reverse non-depolarising neuromuscular blockade",
    tags: ["Anticholinesterase", "Reversal agent"],
    source: SRC.fdaUpToDate("Prostigmin (neostigmine methylsulfate) injection label", "originally ICN/Valeant; generic neostigmine widely available"),
    structure: "A synthetic quaternary ammonium carbamate ester — the quaternary charge prevents significant blood-brain-barrier penetration (unlike physostigmine, a tertiary amine), confining its cholinergic effects mainly to the periphery.",
    pd: "Reversibly inhibits acetylcholinesterase (carbamylates the enzyme's active site), increasing acetylcholine concentration at the neuromuscular junction to competitively overcome residual non-depolarising NMBA occupancy of nicotinic receptors, restoring neuromuscular transmission. Because acetylcholine also accumulates at muscarinic sites (cardiac, glandular, smooth muscle), it is essentially always co-administered with an antimuscarinic (glycopyrrolate or atropine) to prevent bradycardia, salivation, bronchospasm and increased GI motility.",
    pk: "Onset ~5–10 min (slower than glycopyrrolate's onset, so glycopyrrolate/atropine timing is matched to avoid a mismatch period of unopposed bradycardia or tachycardia), duration ~45–90 min. Hydrolysed partly by plasma cholinesterase and hepatic metabolism, with significant renal excretion of unchanged drug (~50%) — duration is prolonged in renal failure, which conveniently roughly parallels prolongation of many renally-cleared NMBAs in the same patients.",
    dosage: "FDA-approved: Reversal of non-depolarising neuromuscular blockade — 0.5–2.5 mg IV (commonly dosed 0.03–0.07 mg/kg, up to a total ~5 mg), given with an antimuscarinic (glycopyrrolate ~0.2 mg per 1 mg neostigmine, or atropine 0.4–0.8 mg per 1 mg neostigmine). There is a labelled ceiling dose (~0.07 mg/kg or 5 mg total) beyond which additional neostigmine does not further antagonise block and instead can worsen neuromuscular function.",
    offLabel: "Treatment of acute colonic pseudo-obstruction (Ogilvie syndrome) — a well-established off-label use, given as a slow monitored IV infusion (2 mg over 3–5 min) under cardiac monitoring for its prokinetic parasympathomimetic effect on colonic smooth muscle; myasthenia gravis diagnosis/treatment (oral neostigmine, a related but separate labelled indication for the oral formulation).",
    complications: "Requires reliable neuromuscular monitoring (train-of-four) — administering neostigmine when no spontaneous recovery has begun ('deep block') is ineffective and can paradoxically worsen block by a excess-acetylcholine desensitisation mechanism at the neuromuscular junction; bradycardia/asystole risk if given without adequate antimuscarinic cover or with mistimed antimuscarinic administration; bronchospasm/increased secretions in reactive airway disease; nausea/vomiting and increased bowel motility (can worsen risk of anastomotic leak concerns in some surgical contexts, debated); does not reverse depolarising block (succinylcholine) — in fact, by inhibiting acetylcholinesterase (and to some extent plasma cholinesterase), it can prolong succinylcholine's action if given during residual succinylcholine effect."
  });

  // ---------------- OPIOIDS ----------------
  addDrug({
    id: "fentanyl", cat: "opioids", name: "Fentanyl", brand: "Sublimaze",
    tagline: "Highly lipophilic synthetic opioid; the mainstay perioperative opioid for rapid analgesia",
    tags: ["Mu agonist", "Synthetic opioid"],
    source: SRC.fdaUpToDate("Sublimaze (fentanyl citrate) injection label", "Akorn/generic"),
    structure: "A synthetic phenylpiperidine derivative, structurally distinct from morphine but sharing the mu-opioid pharmacophore; extremely high lipid solubility (much greater than morphine) drives its rapid CNS onset and its suitability for transdermal/transmucosal formulations.",
    pd: "High-affinity full agonist at the mu-opioid receptor (with weaker kappa/delta activity), producing analgesia, sedation, euphoria, and dose-dependent respiratory depression (reduced responsiveness to hypercapnia) via brainstem respiratory centres. Causes minimal histamine release and relatively preserved haemodynamic stability compared with morphine, making it favoured for cardiac and haemodynamically unstable patients; can cause bradycardia via central vagal stimulation. High-dose rapid administration can cause chest wall/glottic rigidity ('wooden chest syndrome').",
    pk: "Onset ~1–2 min (fastest onset of standard IV opioids other than remifentanil/alfentanil), short duration after a single bolus (~30–60 min) due to rapid redistribution, but repeated dosing/infusion causes significant context-sensitive half-time prolongation due to accumulation in fat and muscle depots. Hepatic CYP3A4 metabolism to inactive metabolites (norfentanyl), renal excretion — minimal active renal-cleared metabolite burden (unlike morphine), so it is relatively favoured in renal impairment.",
    dosage: "FDA-approved: Adjunct to general anaesthesia — low dose 2 mcg/kg IV for minor procedures, moderate dose 2–20 mcg/kg IV for more stimulating procedures; high-dose (20–50 mcg/kg) as a primary anaesthetic component for major surgery (e.g. cardiac surgery), given the label's very wide dosing range depending on procedure. Postoperative/analgesic titration — 25–100 mcg IV increments as needed.",
    offLabel: "Intranasal fentanyl for breakthrough or procedural analgesia in settings without IV access (paediatric emergency departments, prehospital care); neuraxial (epidural/intrathecal) administration as an adjunct to local anaesthetic for labour and postoperative analgesia — a common, well-established but technically off-label route relative to the IV/transdermal/transmucosal labelled routes; patient-controlled analgesia (IV PCA) protocols.",
    complications: "Dose-dependent respiratory depression/apnoea, the leading cause of opioid-related perioperative mortality, potentiated by co-administered sedatives; chest wall rigidity with rapid high-dose bolus, which can impair mask ventilation and may require a muscle relaxant or naloxone to treat; bradycardia; nausea/vomiting, pruritus; tolerance and hyperalgesia with prolonged/high-dose infusion; physical dependence and misuse potential (Schedule II controlled substance); accumulation with prolonged infusion prolongs recovery time despite the short single-dose half-life."
  });

  addDrug({
    id: "morphine", cat: "opioids", name: "Morphine", brand: "Duramorph / Astramorph",
    tagline: "Prototypical opioid analgesic; slower onset, longer duration, renally-cleared active metabolite",
    tags: ["Mu agonist", "Phenanthrene opioid"],
    source: SRC.fdaUpToDate("Duramorph (morphine sulfate) injection label", "Baxter/generic"),
    structure: "A naturally occurring phenanthrene alkaloid derived from the opium poppy (Papaver somniferum) — the prototype against which all other opioids are historically compared; relatively low lipid solubility compared with fentanyl, which slows its CNS onset.",
    pd: "Full agonist at the mu-opioid receptor (weaker kappa activity) producing analgesia, sedation, euphoria, miosis, and dose-dependent respiratory depression. Causes histamine release with rapid IV administration, which can produce flushing, pruritus and hypotension (more pronounced than with fentanyl or hydromorphone). Reduces gut motility (constipation, delayed gastric emptying) more prominently and durably than fentanyl.",
    pk: "Onset ~5–10 min IV (slower than fentanyl due to lower lipophilicity), duration 3–4 h. Hepatic glucuronidation to morphine-6-glucuronide (an active metabolite with analgesic and respiratory-depressant activity, contributing to prolonged/delayed toxicity) and morphine-3-glucuronide (largely inactive/possibly neuroexcitatory); both metabolites are renally excreted and accumulate significantly in renal failure, an important distinction from fentanyl.",
    dosage: "FDA-approved: Intravenous analgesia (adults) — 2.5–15 mg IV as a single dose, titrated slowly; may repeat every 3–4 h as needed. Epidural — 5 mg initially, may repeat with 1–2 mg after 1 h if needed (up to 10 mg/24 h). Intrathecal — 0.2–1 mg single dose (preservative-free formulation).",
    offLabel: "Intrathecal/epidural use for extended postoperative analgesia after major abdominal, orthopaedic or cardiac surgery beyond the exact labelled dosing ranges in some institutional protocols; use in patient-controlled analgesia (IV PCA) pumps; palliative/cancer-pain titration to higher doses than acute-pain labelling reflects, guided by tolerance and response.",
    complications: "Histamine-mediated hypotension/flushing/pruritus with rapid IV bolus (slow administration recommended); accumulation of active renally-cleared metabolites (morphine-6-glucuronide) causing delayed, prolonged sedation/respiratory depression in renal impairment — a key reason fentanyl or hydromorphone may be preferred in renal failure; respiratory depression, particularly with neuraxial administration where delayed (several-hour) respiratory depression can occur from rostral CSF spread — requires extended monitoring after neuraxial morphine; constipation, nausea, urinary retention, pruritus (more common via the neuraxial route); tolerance, physical dependence, misuse potential (Schedule II)."
  });

  addDrug({
    id: "hydromorphone", cat: "opioids", name: "Hydromorphone", brand: "Dilaudid",
    tagline: "Semi-synthetic mu-opioid roughly 5–7x more potent than morphine, without an active renal metabolite burden of comparable clinical significance",
    tags: ["Mu agonist", "Semi-synthetic opioid"],
    source: SRC.fdaUpToDate("Dilaudid (hydromorphone hydrochloride) injection label", "Purdue Pharma/generic"),
    structure: "A semi-synthetic phenanthrene opioid derived by hydrogenation and oxidation of morphine (a 'hydrogenated ketone' of morphine) — the structural modification increases potency and somewhat increases lipid solubility relative to morphine.",
    pd: "Full mu-opioid receptor agonist with a pharmacodynamic profile similar to morphine (analgesia, sedation, respiratory depression, miosis) but with less histamine release and somewhat less pruritus/nausea reported by some patients compared with morphine, though individual variability is significant.",
    pk: "Onset ~5 min IV, duration 3–4 h. Hepatic glucuronidation to hydromorphone-3-glucuronide (an inactive/neuroexcitatory-at-high-concentration metabolite rather than a clinically significant analgesically active one, unlike morphine-6-glucuronide) — this metabolite still accumulates in renal failure and has been associated with neuroexcitatory effects (myoclonus, seizures) at very high accumulated concentrations, but hydromorphone is nonetheless often considered more favourable than morphine in renal impairment.",
    dosage: "FDA-approved: Intravenous analgesia (adults, opioid-naive) — 0.2–1 mg IV every 2–3 h as needed, titrated; higher doses may be required in opioid-tolerant patients. Epidural/intrathecal use is described in some institutional protocols though the primary FDA label centres on IV/IM/subcutaneous/oral dosing.",
    offLabel: "Neuraxial (epidural/intrathecal) administration for postoperative or labour analgesia, and IV PCA protocols — both common in practice but outside the core parenteral labelling; use in opioid rotation for patients with morphine-related adverse effects (e.g. pruritus, neuroexcitatory metabolite accumulation) in cancer/palliative pain management.",
    complications: "Respiratory depression (dose-equivalent risk to other mu agonists — potency difference from morphine makes dosing-error/mg-confusion a recognised medication-safety hazard); myoclonus/neuroexcitation with very high accumulated doses, particularly in renal impairment; nausea, constipation, pruritus, sedation; tolerance/dependence/misuse potential (Schedule II); high potency increases the consequence of ten-fold dosing errors, a recognised patient-safety concern highlighted by ISMP and similar bodies."
  });

  addDrug({
    id: "remifentanil", cat: "opioids", name: "Remifentanil", brand: "Ultiva",
    tagline: "Ultra-short-acting mu-opioid metabolised by non-specific plasma/tissue esterases, independent of organ function",
    tags: ["Mu agonist", "Ester-metabolised"],
    source: SRC.fdaUpToDate("Ultiva (remifentanil hydrochloride) injection label", "originally GlaxoSmithKline/generic"),
    structure: "A synthetic phenylpiperidine (fentanyl-class) opioid uniquely bearing an ester linkage in its structure, which allows rapid hydrolysis by non-specific blood and tissue esterases — a metabolic pathway distinct from every other opioid in routine clinical use.",
    pd: "High-affinity full mu-opioid receptor agonist producing analgesia and dose-dependent respiratory depression comparable in nature to fentanyl, but distinguished pharmacokinetically rather than pharmacodynamically. Can cause bradycardia and hypotension, particularly with bolus administration or in combination with propofol; chest wall rigidity possible with rapid administration, as with other potent mu agonists.",
    pk: "Onset ~1 min; the defining feature is an essentially constant, ultra-short context-sensitive half-time (~3–5 min) regardless of infusion duration, because clearance depends on ubiquitous non-specific esterase hydrolysis rather than hepatic/renal function — this makes it uniquely titratable but means analgesia disappears within minutes of stopping the infusion, requiring pre-emptive transition to a longer-acting analgesic before emergence/extubation if postoperative pain is expected.",
    dosage: "FDA-approved: Induction (as an infusion, with an induction agent) — 0.5–1 mcg/kg/min. Maintenance of general anaesthesia — 0.0625–2 mcg/kg/min IV infusion, titrated with N2O or a volatile agent/propofol. Postoperative analgesia (monitored setting) — 0.025–0.2 mcg/kg/min. Not given as a simple single IV bolus for postoperative analgesia due to its ultra-short duration and risk of acute tolerance/hyperalgesia.",
    offLabel: "Monitored anaesthesia care/procedural sedation infusion in spontaneously breathing patients requiring dense, rapidly reversible analgesia (e.g. awake craniotomy, awake fibreoptic intubation) — a widely adopted though technically off-label extension of its labelled maintenance-anaesthesia use; obstetric analgesia via patient-controlled IV infusion where neuraxial analgesia is contraindicated.",
    complications: "Rapid offset means analgesia vanishes almost immediately on stopping the infusion — inadequate transition planning is a recognised cause of severe emergence pain; opioid-induced hyperalgesia and acute tolerance are more clinically apparent with remifentanil than most other opioids, particularly after high-dose or prolonged intraoperative infusion; bradycardia and hypotension, especially combined with propofol; chest wall rigidity with rapid bolus/high infusion rates; apnoea if not carefully titrated in spontaneously breathing sedation cases; does NOT require dose adjustment for renal or hepatic failure given its unique esterase-dependent clearance — a distinguishing pharmacokinetic advantage."
  });

  addDrug({
    id: "sufentanil", cat: "opioids", name: "Sufentanil", brand: "Sufenta",
    tagline: "Extremely potent fentanyl analogue (~5–10x fentanyl), used in high-dose cardiac/major surgery and neuraxial analgesia",
    tags: ["Mu agonist", "High-potency synthetic opioid"],
    source: SRC.fdaUpToDate("Sufenta (sufentanil citrate) injection label", "originally Janssen/generic"),
    structure: "A thienyl analogue of fentanyl (a phenylpiperidine derivative with a thiophene ring substitution) — among the most potent opioids in routine clinical use, with very high mu-receptor affinity and lipophilicity.",
    pd: "Full mu-opioid receptor agonist with a pharmacodynamic profile similar to fentanyl (analgesia, sedation, respiratory depression, minimal histamine release, relative haemodynamic stability) but at roughly 5–10 times fentanyl's potency — allowing very small absolute doses/volumes, notably useful in neuraxial formulations.",
    pk: "Onset ~1–3 min IV, with a shorter context-sensitive half-time than fentanyl at comparable infusion durations, though longer than remifentanil. Hepatic CYP3A4 metabolism to largely inactive metabolites, renal/biliary excretion.",
    dosage: "FDA-approved: Adjunct to general anaesthesia — low dose 1–2 mcg/kg IV for maintenance with N2O/O2; moderate to high dose (2–8 mcg/kg, up to 30 mcg/kg for very major procedures such as cardiac surgery) as a primary anaesthetic component, per the label's wide procedure-dependent range. Epidural (labelled route for obstetric analgesia in some markets/products) — small microgram doses (e.g. 10–15 mcg) combined with local anaesthetic.",
    offLabel: "Intrathecal administration as an adjunct to local anaesthetic for labour epidural/combined spinal-epidural and postoperative analgesia — an extremely common and well-studied but technically off-label neuraxial route relative to the primary systemic anaesthesia-adjunct labelling in the US.",
    complications: "Chest wall rigidity, more prominent risk given its high potency with rapid bolus dosing — often necessitates neuromuscular blockade for airway control if it occurs; profound respiratory depression proportional to its potency, demanding careful dose-volume accuracy (small-volume dosing errors have outsized effect); bradycardia; pruritus with neuraxial use; tolerance/dependence/misuse potential (Schedule II) — potency makes diversion particularly dangerous."
  });

  addDrug({
    id: "alfentanil", cat: "opioids", name: "Alfentanil", brand: "Alfenta",
    tagline: "Fast-onset, short-duration fentanyl analogue, less potent than fentanyl but with quicker peak effect",
    tags: ["Mu agonist", "Rapid-onset synthetic opioid"],
    source: SRC.fdaUpToDate("Alfenta (alfentanil hydrochloride) injection label", "originally Janssen/generic"),
    structure: "A tetrazole-substituted fentanyl analogue with a lower pKa than fentanyl, meaning a greater fraction exists in the un-ionised (lipid-soluble, membrane-permeable) form at physiological pH — this drives its notably fast onset despite lower overall lipophilicity than fentanyl.",
    pd: "Full mu-opioid receptor agonist, roughly one-quarter to one-tenth the potency of fentanyl, with a similar qualitative adverse-effect profile (respiratory depression, minimal histamine release, chest wall rigidity risk with rapid bolus, bradycardia).",
    pk: "Fastest peak effect-site concentration of the fentanyl-class opioids (onset ~1–2 min, peak effect even faster than fentanyl due to the pKa/ionisation effect) and short duration due to a small volume of distribution and rapid hepatic clearance. Hepatic CYP3A4 metabolism to largely inactive metabolites; clearance can be significantly reduced by potent CYP3A4 inhibitors and in cirrhosis.",
    dosage: "FDA-approved: Induction — 8–20 mcg/kg IV, incremental doses of 3–5 mcg/kg for maintenance. Maintenance infusion for general anaesthesia — 0.5–3 mcg/kg/min, titrated. Monitored anaesthesia care sedation-analgesia — small incremental doses (e.g. 3–8 mcg/kg initial) titrated carefully.",
    offLabel: "Rapid-onset analgesic adjunct for brief, painful procedures (e.g. line placement, brief endoscopy, ECT) where its very fast peak effect is advantageous — largely covered by its broad labelled indications but sometimes used in dosing patterns tailored to very short procedures beyond typical labelled examples.",
    complications: "Chest wall rigidity with rapid bolus, particularly notable given its fast onset; respiratory depression; bradycardia and hypotension; markedly prolonged effect possible with hepatic impairment or concurrent potent CYP3A4 inhibitors (e.g. certain azole antifungals, protease inhibitors) due to reliance on hepatic metabolism; tolerance/dependence/misuse potential (Schedule II)."
  });

  // ---------------- NSAIDs & ANALGESICS ----------------
  addDrug({
    id: "ketorolac", cat: "nsaids", name: "Ketorolac", brand: "Toradol",
    tagline: "Potent parenteral NSAID for short-term (≤5 day) moderate-to-severe acute pain, opioid-sparing",
    tags: ["NSAID", "COX-1/COX-2 inhibitor"],
    source: SRC.fdaUpToDate("Toradol (ketorolac tromethamine) injection label", "Roche/generic"),
    structure: "A pyrrolizine carboxylic acid derivative NSAID, structurally related to indomethacin/tolmetin, formulated for parenteral (IV/IM) as well as oral and ophthalmic use — one of the few NSAIDs with an approved parenteral formulation of comparable analgesic potency to opioids for acute pain.",
    pd: "Non-selective, reversible inhibition of cyclooxygenase-1 and -2, reducing prostaglandin synthesis — producing analgesic, anti-inflammatory and antipyretic effects without direct opioid-receptor activity, hence no respiratory depression or sedation. Inhibits platelet COX-1, reversibly impairing platelet aggregation for the drug's duration of action (unlike aspirin's irreversible effect).",
    pk: "Onset ~10 min IV/IM, peak analgesic effect ~1–2 h, duration 4–6 h. Highly protein bound (~99%). Hepatic metabolism (partial) with predominant renal excretion of both unchanged drug and a conjugated metabolite — renal impairment significantly prolongs elimination and increases toxicity risk.",
    dosage: "FDA-approved: Adults <65 y, normal renal function — 30 mg IV or 60 mg IM single dose, or 15–30 mg IV/IM every 6 h, maximum 120 mg/day, for no more than 5 days total combined duration (all routes). Adults ≥65 y, renally impaired, or <50 kg — reduced dose 15 mg IV/IM, maximum 60 mg/day. Not approved for epidural/intrathecal use, and contraindicated as an analgesic adjunct in neuraxial anaesthesia in the label.",
    offLabel: "Use beyond the labelled 5-day maximum duration in select chronic-pain contexts under close monitoring (not standard, and generally discouraged given cumulative GI/renal risk); use in paediatric postoperative analgesia protocols at weight-based doses lower than the primary adult labelling, which is common in paediatric surgical practice though outside the core adult label.",
    complications: "Black-box warnings: GI bleeding/ulceration/perforation risk (increased with dose, duration >5 days, elderly, concurrent anticoagulants/corticosteroids/other NSAIDs, or history of peptic ulcer disease); risk of increased perioperative bleeding from platelet inhibition — contraindicated in patients with active bleeding, prior to major surgery where haemostasis is critical, and in patients on anticoagulants; renal toxicity (reduces renal prostaglandin-mediated perfusion — risk of acute kidney injury, especially with hypovolaemia, pre-existing renal impairment, or concurrent nephrotoxins/ACE-inhibitors); contraindicated in labour/delivery, nursing mothers, and in patients with advanced renal impairment; cardiovascular thrombotic risk (class warning for NSAIDs, though data specifically for short-course ketorolac are more limited than for chronic NSAID use); bronchospasm/anaphylactoid reactions in aspirin-/NSAID-sensitive asthmatics."
  });

  addDrug({
    id: "ibuprofen", cat: "nsaids", name: "Ibuprofen", brand: "Motrin / Advil (IV: Caldolor)",
    tagline: "Propionic-acid NSAID; oral and IV formulations for mild-to-moderate pain and multimodal perioperative analgesia",
    tags: ["NSAID", "Propionic acid derivative"],
    source: SRC.fdaUpToDate("Caldolor (ibuprofen) injection label; Motrin/generic ibuprofen oral label", "Cumberland Pharmaceuticals (IV)/generic (oral)"),
    structure: "A propionic acid derivative NSAID (2-(4-isobutylphenyl)propanoic acid) — one of the earliest and most widely used members of this NSAID subclass.",
    pd: "Non-selective, reversible COX-1/COX-2 inhibition reducing prostaglandin synthesis, giving analgesic, antipyretic and anti-inflammatory effects. Reversible antiplatelet effect via COX-1 inhibition, less pronounced/durable than aspirin.",
    pk: "Oral onset ~30–60 min, IV onset somewhat faster; short elimination half-life (~2 h), allowing frequent dosing. Hepatic oxidative metabolism (CYP2C9-mediated) to inactive metabolites, predominantly renal excretion.",
    dosage: "FDA-approved: Oral — 400–800 mg every 6 h as needed (adult), maximum 3200 mg/day (prescription dosing; OTC labelling caps lower at 1200 mg/day). IV (Caldolor) — for pain, 400–800 mg IV every 6 h as needed (infused over at least 30 min), maximum 3200 mg/day; for fever, 400 mg initially then 400 mg every 4–6 h or 100–200 mg every 4 h.",
    offLabel: "Component of scheduled multimodal postoperative analgesia protocols (alternating/combined with paracetamol) at standard labelled doses but as part of an off-label-in-combination regimen not specifically studied as a fixed co-administration by the FDA label itself; paediatric perioperative use at weight-based dosing per paediatric-specific references.",
    complications: "GI ulceration/bleeding risk (lower than ketorolac at equivalent short-term use but still present, increased with dose/duration, elderly, concurrent anticoagulants); renal impairment risk, particularly with hypovolaemia or concurrent nephrotoxic drugs; cardiovascular thrombotic risk (class warning, boxed warning on label); platelet inhibition increasing perioperative bleeding risk; bronchospasm in aspirin-exacerbated respiratory disease; fluid retention/hypertension exacerbation."
  });

  addDrug({
    id: "diclofenac", cat: "nsaids", name: "Diclofenac", brand: "Voltaren",
    tagline: "Phenylacetic-acid NSAID available in oral, topical, ophthalmic and IV formulations",
    tags: ["NSAID", "Phenylacetic acid derivative"],
    source: SRC.fdaUpToDate("Dyloject (diclofenac sodium) injection label; Voltaren/generic diclofenac oral and topical labels", "Hikma (IV)/generic"),
    structure: "A phenylacetic acid derivative NSAID with a distinctive diphenylamine backbone bearing two chlorine substituents — relatively COX-2 preferential compared with some other non-selective NSAIDs, though it still meaningfully inhibits COX-1.",
    pd: "Reversible inhibition of COX-1 and COX-2 (some relative COX-2 preference) reducing prostaglandin synthesis, giving analgesic, anti-inflammatory and antipyretic effects; also has some additional proposed actions on the lipoxygenase pathway and phospholipase A2, though the clinical significance of these is less certain than the COX effect.",
    pk: "Oral onset variable by formulation (immediate vs delayed/extended release), short elimination half-life (~2 h) but with accumulation in synovial fluid prolonging local anti-inflammatory effect beyond plasma half-life. Extensive hepatic metabolism (CYP2C9 predominant) to metabolites with some activity, and significant first-pass effect (~50% oral bioavailability).",
    dosage: "FDA-approved: Oral immediate-release — 50 mg two to three times daily (max 150 mg/day) for pain/osteoarthritis/rheumatoid arthritis-type indications. IV (Dyloject) — 37.5 mg IV every 6 h as needed for acute moderate-to-severe pain (max 150 mg/day), infused over 15 seconds. Topical gel/patch formulations dosed per specific product labelling for localised musculoskeletal pain.",
    offLabel: "Use as part of multimodal perioperative analgesia protocols alongside paracetamol/opioids, at labelled doses but in combination regimens not specifically studied together by the FDA; extended perioperative courses beyond typical short-term acute-pain framing in some enhanced-recovery pathways.",
    complications: "Boxed warning shared across the NSAID class: cardiovascular thrombotic events (myocardial infarction, stroke) and serious, potentially fatal GI bleeding/ulceration/perforation, both risks rising with dose and duration; hepatotoxicity — diclofenac carries a comparatively higher signal for clinically significant transaminase elevation among NSAIDs, warranting liver-function monitoring with prolonged use; renal impairment; platelet inhibition/bleeding risk; hypersensitivity/bronchospasm in NSAID-sensitive patients; fluid retention and blood-pressure elevation."
  });

  addDrug({
    id: "celecoxib", cat: "nsaids", name: "Celecoxib", brand: "Celebrex",
    tagline: "Selective COX-2 inhibitor with reduced antiplatelet/GI-ulcer risk relative to non-selective NSAIDs",
    tags: ["NSAID", "Selective COX-2 inhibitor"],
    source: SRC.fdaUpToDate("Celebrex (celecoxib) capsule label", "Pfizer/generic"),
    structure: "A diaryl-substituted pyrazole containing a sulfonamide group — the first selective COX-2 inhibitor approved in the US; the sulfonamide moiety means cross-sensitivity is a consideration in patients with sulfonamide allergy (though the clinical cross-reactivity risk is debated).",
    pd: "Selective, reversible inhibition of COX-2 with much less effect on COX-1 at therapeutic doses — this spares COX-1-mediated gastric mucosal protection and platelet thromboxane production (hence minimal antiplatelet effect), while retaining anti-inflammatory/analgesic efficacy via COX-2 (prostaglandin) inhibition; COX-2 selectivity is also implicated in a relatively increased cardiovascular thrombotic risk signal seen across the class of selective COX-2 inhibitors.",
    pk: "Onset within ~1 h orally, elimination half-life ~11 h allowing once- or twice-daily dosing. Hepatic CYP2C9 metabolism (genetic polymorphism affects clearance — poor metabolisers require dose reduction), biliary/faecal and renal excretion of metabolites.",
    dosage: "FDA-approved: Osteoarthritis — 200 mg once daily or 100 mg twice daily. Rheumatoid arthritis — 100–200 mg twice daily. Acute pain (adults) — 400 mg initial dose, then 200 mg on day 1 if needed, then 200 mg twice daily as needed thereafter.",
    offLabel: "Component of multimodal perioperative analgesia (preoperative or postoperative dosing) specifically chosen when minimal antiplatelet effect is desired (e.g. in surgery with high bleeding concern) — a widely adopted enhanced-recovery-pathway practice not centred in the original label's arthritis/acute-pain framing.",
    complications: "Boxed warning: cardiovascular thrombotic risk (may be dose- and duration-dependent, a defining concern that led to withdrawal of related COX-2 inhibitors rofecoxib and valdecoxib from the market) and GI bleeding/ulceration/perforation risk (lower than non-selective NSAIDs but not eliminated, particularly with concurrent aspirin, which negates much of the GI advantage); renal impairment (COX-2 also contributes to renal prostaglandin synthesis, so renal risk is not eliminated despite COX-1 sparing); sulfonamide-related hypersensitivity reactions; fluid retention/hypertension; contraindicated in the setting of coronary artery bypass graft (CABG) perioperative pain per the label."
  });

  addDrug({
    id: "paracetamol", cat: "nsaids", name: "Paracetamol (Acetaminophen)", brand: "Tylenol / Ofirmev (IV)",
    tagline: "Non-opioid, non-NSAID analgesic/antipyretic — core component of multimodal perioperative analgesia",
    tags: ["Analgesic/antipyretic", "COX inhibition (central)"],
    source: SRC.fdaUpToDate("Ofirmev (acetaminophen) injection label; Tylenol/generic acetaminophen oral label", "Mallinckrodt (IV)/generic"),
    structure: "Para-aminophenol derivative (N-acetyl-para-aminophenol) — chemically distinct from both NSAIDs and opioids, with a mechanism that remains incompletely understood.",
    pd: "Proposed mechanisms include weak, predominantly central COX inhibition (COX-1/COX-2/possibly a COX-3 splice variant), and activation of descending serotonergic inhibitory pathways; unlike NSAIDs it has minimal peripheral anti-inflammatory effect and essentially no antiplatelet or GI-mucosal effect, and unlike opioids no respiratory depression, sedation or dependence potential at therapeutic doses.",
    pk: "Rapid onset (IV faster than oral), elimination half-life ~2–3 h. Predominantly hepatic metabolism via glucuronidation and sulfation (safe pathways at therapeutic dose), with a minor CYP2E1-mediated pathway producing the toxic metabolite NAPQI, normally rapidly detoxified by conjugation with glutathione — glutathione depletion (overdose, malnutrition, chronic alcohol use) allows NAPQI to accumulate and cause hepatocellular necrosis.",
    dosage: "FDA-approved: Oral/IV (adults and adolescents ≥50 kg) — 650–1000 mg every 4–6 h as needed, maximum 4000 mg/day (many institutions and updated labelling recommend a more conservative 3000 mg/day ceiling, particularly with any hepatic risk factors); IV infused over 15 minutes. Weight-based dosing (patients <50 kg, and paediatric) per the IV label — 15 mg/kg every 6 h, maximum 75 mg/kg/day (not to exceed the adult max).",
    offLabel: "Not typically used off-label — near-universal on-label use as a scheduled (not just PRN) component of multimodal, opioid-sparing perioperative and ERAS analgesia protocols, an application well within its labelled analgesic indication though the specific 'scheduled multimodal' framing is a practice pattern rather than a distinct label claim.",
    complications: "Boxed warning (IV formulation): risk of severe hepatotoxicity, most often from exceeding the maximum daily dose, especially with pre-existing liver disease, chronic alcohol use, malnutrition, or dosing errors from multiple acetaminophen-containing products being combined unknowingly; rare but serious hypersensitivity/skin reactions (Stevens-Johnson syndrome, toxic epidermal necrolysis — a labelled warning); minimal cardiovascular, renal, GI or platelet effects compared with NSAIDs, which is its principal safety advantage in multimodal regimens; requires total daily acetaminophen dose reconciliation across all formulations (oral, IV, combination opioid-acetaminophen products) to avoid inadvertent overdose."
  });

  // ---------------- VASOPRESSORS & INOTROPES ----------------
  addDrug({
    id: "phenylephrine", cat: "vasopressors", name: "Phenylephrine", brand: "Neo-Synephrine (IV: Vazculep)",
    tagline: "Pure alpha-1 agonist vasopressor; first-line for anaesthesia-induced hypotension, especially with tachycardia",
    tags: ["Alpha-1 agonist", "Vasopressor"],
    source: SRC.fdaUpToDate("Vazculep (phenylephrine hydrochloride) injection label", "Eagle Pharmaceuticals/generic"),
    structure: "A synthetic, non-catecholamine phenylethylamine derivative structurally related to epinephrine but lacking the catechol hydroxyl at one ring position, which makes it resistant to COMT metabolism (though it remains a substrate for MAO) and gives it a longer duration than the endogenous catecholamines.",
    pd: "Direct, near-selective alpha-1 adrenergic receptor agonist causing arterial and venous vasoconstriction, raising systemic vascular resistance and blood pressure; has negligible direct beta-adrenergic (inotropic/chronotropic) activity, so heart rate typically falls reflexively (baroreceptor-mediated reflex bradycardia) as blood pressure rises — a pharmacodynamic profile useful when a pressor without tachycardia is desired (e.g. hypotension with reflex/baseline tachycardia, hypertrophic cardiomyopathy, aortic stenosis).",
    pk: "Onset within ~1 min IV bolus (immediate), very short duration (~15–20 min) requiring repeat bolus or infusion for sustained effect. Metabolised by monoamine oxidase (MAO) in the gut wall and liver; minimal renal excretion of unchanged drug.",
    dosage: "FDA-approved (Vazculep): Bolus for hypotension — 0.1–0.5 mg IV, may repeat every 10–15 min as needed. Continuous infusion — initial rate 0.1–0.18 mg/min, titrated to target blood pressure, then typically reduced to a maintenance range (often ~0.04–0.06 mg/min per institutional protocol, within the label's dose-titration framework).",
    offLabel: "First-line vasopressor for spinal-anaesthesia-induced hypotension in obstetric anaesthesia (widely supported by obstetric anaesthesia society guidance as preferred over ephedrine for reducing fetal acidosis risk) — a well-established practice that sits somewhat beyond the drug's original general hypotension labelling; low-dose infusion to maintain uteroplacental perfusion during caesarean delivery under neuraxial anaesthesia.",
    complications: "Reflex bradycardia (can be pronounced, sometimes requiring an antimuscarinic or dose reduction); excessive vasoconstriction reducing cardiac output and organ (including uteroplacental and splanchnic) perfusion if overdosed, since it does not increase and can indirectly reduce cardiac output via increased afterload and reflex bradycardia; tissue necrosis with extravasation (potent vasoconstrictor); hypertension if overdosed, with risk of reflex bradyarrhythmia; relatively contraindicated as sole agent in severe bradycardia or where increased afterload is poorly tolerated (e.g. severe left ventricular failure)."
  });

  addDrug({
    id: "norepinephrine", cat: "vasopressors", name: "Norepinephrine (Noradrenaline)", brand: "Levophed",
    tagline: "First-line vasopressor in septic and most distributive/vasodilatory shock; potent alpha-1 with modest beta-1 activity",
    tags: ["Alpha/beta agonist", "Catecholamine"],
    source: SRC.fdaUpToDate("Levophed (norepinephrine bitartrate) injection label", "Hospira/Pfizer"),
    structure: "An endogenous catecholamine (the primary neurotransmitter of the sympathetic nervous system) — a phenylethylamine with a catechol ring, differing from epinephrine only by lacking the N-methyl substituent.",
    pd: "Potent alpha-1 agonist (dominant effect, causing marked vasoconstriction and increased systemic vascular resistance/blood pressure) with modest beta-1 agonist activity (mild positive inotropy/chronotropy), and minimal beta-2 activity — net effect is increased mean arterial pressure with generally preserved or only modestly changed cardiac output and typically little to no reflex tachycardia at clinical doses due to the balancing beta-1 stimulation.",
    pk: "Onset within 1–2 min IV infusion, very short duration (elimination half-life ~1–2 min) — requires continuous infusion for sustained effect, essentially eliminated moment-to-moment on stopping. Metabolised by catechol-O-methyltransferase (COMT) and monoamine oxidase (MAO), predominantly hepatic, with renal excretion of metabolites.",
    dosage: "FDA-approved: Continuous IV infusion — initial 0.5–1 mcg/min, titrated to target mean arterial pressure (commonly ≥65 mmHg in septic shock per Surviving Sepsis Campaign guidance), with typical maintenance ranges of 2–20 mcg/min or higher in refractory shock (institutional/guideline-driven, as the FDA label provides broad titration guidance rather than a fixed ceiling).",
    offLabel: "Peripheral (rather than strictly central-line) short-term administration in a large proximal IV in low-to-moderate doses for a limited duration — increasingly supported by emergency/critical-care literature and used as an accepted deviation from the traditionally central-line-only administration practice, particularly while central access is being obtained.",
    complications: "Tissue ischaemia/necrosis with extravasation (a potent vasoconstrictor — phentolamine infiltration is the standard antidote if extravasation occurs); excessive vasoconstriction can reduce perfusion to extremities, skin, and splanchnic/renal beds if overdosed relative to the degree of shock; arrhythmias (less common than with epinephrine/dopamine but possible, especially with pre-existing ischaemic heart disease); reflex bradycardia is uncommon but can occur; requires central venous access for prolonged/high-dose infusion per most institutional protocols, given extravasation risk."
  });

  addDrug({
    id: "epinephrine", cat: "vasopressors", name: "Epinephrine (Adrenaline)", brand: "Adrenalin",
    tagline: "Endogenous catecholamine with potent alpha and beta activity; first-line in anaphylaxis and cardiac arrest",
    tags: ["Alpha/beta agonist", "Catecholamine"],
    source: SRC.fdaUpToDate("Adrenalin (epinephrine) injection label", "Par Pharmaceutical/generic"),
    structure: "The principal endogenous adrenal medullary catecholamine — a phenylethylamine with a catechol ring and an N-methyl substituent (distinguishing it structurally from norepinephrine).",
    pd: "Non-selective agonist at alpha-1, alpha-2, beta-1 and beta-2 adrenergic receptors — effects are notably dose-dependent: at low doses beta-2-mediated vasodilation can dominate in some vascular beds (mild BP effect, increased HR/contractility via beta-1), while at higher doses alpha-1-mediated vasoconstriction dominates, raising systemic vascular resistance and blood pressure; beta-2 activity also produces bronchodilation and mast-cell stabilisation, central to its role in anaphylaxis; beta-1 activity increases heart rate, contractility and myocardial oxygen demand, with pro-arrhythmic potential.",
    pk: "Onset within 1–2 min IV (faster than IM), very short duration (elimination half-life a few minutes) — requires bolus repetition or continuous infusion for sustained effect. Metabolised by COMT and MAO, hepatic and at sympathetic nerve terminals, renal excretion of metabolites.",
    dosage: "FDA-approved: Anaphylaxis — 0.3–0.5 mg IM (1 mg/mL '1:1000' concentration), may repeat every 5–15 min as needed; for severe/refractory cases with cardiovascular collapse, IV titrated boluses (e.g. 50–100 mcg increments of the 0.1 mg/mL '1:10,000' concentration) or infusion in a monitored setting. Cardiac arrest (ACLS) — 1 mg IV/IO every 3–5 min. Cardiogenic/vasodilatory shock (adjunct) — continuous infusion typically 0.01–0.5 mcg/kg/min, titrated to effect (per critical-care/ACLS dosing frameworks referenced by and consistent with the label's general adrenergic-support indication).",
    offLabel: "Nebulised epinephrine for post-extubation or croup-related upper-airway oedema/stridor — a well-established, though technically off-label, use exploiting its alpha-mediated mucosal vasoconstriction; low-dose 'push-dose' epinephrine (diluted boluses, e.g. 5–20 mcg increments) for acute perioperative hypotension/bradycardia — increasingly used in anaesthesia practice though outside the primary anaphylaxis/arrest labelling framework.",
    complications: "Tachyarrhythmias (including ventricular arrhythmias, particularly with volatile anaesthetic sensitisation of the myocardium, e.g. halothane historically, less so with modern agents) and hypertension, risking myocardial ischaemia or intracranial haemorrhage at excessive doses; tissue necrosis with extravasation (vasoconstrictor); anxiety, tremor, headache; pulmonary oedema (afterload-mediated) in vulnerable hearts; lactic acidosis with high-dose/prolonged infusion (beta-2-mediated); accidental overdose from concentration confusion between the 1 mg/mL and 0.1 mg/mL formulations is a recognised, serious medication-safety hazard highlighted in FDA and ISMP safety communications."
  });

  addDrug({
    id: "vasopressin", cat: "vasopressors", name: "Vasopressin (Arginine Vasopressin)", brand: "Vasostrict",
    tagline: "Non-catecholamine V1-receptor vasopressor; second-line/adjunct in septic and vasodilatory shock",
    tags: ["V1 receptor agonist", "Non-catecholamine"],
    source: SRC.fdaUpToDate("Vasostrict (vasopressin) injection label", "Par Pharmaceutical/Endo"),
    structure: "A nonapeptide hormone identical to endogenous arginine vasopressin (antidiuretic hormone), synthesised in the hypothalamus and released from the posterior pituitary — structurally and functionally distinct from the catecholamine pressors.",
    pd: "Agonist at V1 (vascular smooth muscle) receptors, causing direct vasoconstriction independent of adrenergic pathways — of particular value in vasodilatory/septic shock where adrenergic receptors may be downregulated or desensitised ('catecholamine-resistant' shock); also acts at renal V2 receptors promoting free-water reabsorption (antidiuretic effect, relevant to fluid balance during use). Does not have direct inotropic/chronotropic activity, and unlike catecholamines does not increase myocardial oxygen demand directly, though excessive vasoconstriction can still reduce cardiac output via increased afterload.",
    pk: "Onset within minutes of IV infusion, short half-life (~10–20 min) requiring continuous infusion for sustained effect. Metabolised by tissue peptidases (liver and kidney) and renally excreted.",
    dosage: "FDA-approved: Septic shock — continuous IV infusion 0.01–0.07 units/min, titrated (commonly a fixed low dose such as 0.03–0.04 units/min is used clinically as an adjunct to norepinephrine per Surviving Sepsis Campaign practice, layered on the label's titration range).",
    offLabel: "Adjunct vasopressor in refractory vasoplegic shock post-cardiac surgery/cardiopulmonary bypass; adjunct/alternative to epinephrine in cardiac arrest algorithms in some historical ACLS iterations (subsequently de-emphasised in later ACLS updates in favour of epinephrine alone); treatment of catecholamine-refractory hypotension in various ICU vasoplegic states beyond septic shock specifically.",
    complications: "Excessive vasoconstriction causing peripheral (digital), splanchnic, or coronary ischaemia — particularly a concern in patients with pre-existing vascular disease; hyponatraemia/water retention from V2-mediated antidiuretic effect with prolonged use; decreased cardiac output if afterload increase is poorly tolerated by a failing ventricle; not typically titrated up aggressively for further pressor effect once at usual adjunct doses (unlike norepinephrine) — used as a fixed-dose adjunct rather than the primary titrated agent in most septic shock protocols."
  });

  addDrug({
    id: "dopamine", cat: "vasopressors", name: "Dopamine", brand: "Intropin",
    tagline: "Dose-dependent dopaminergic/beta/alpha agonist catecholamine; now a second-line agent in most shock states",
    tags: ["Dopaminergic/alpha/beta agonist", "Catecholamine"],
    source: SRC.fdaUpToDate("Dopamine hydrochloride injection label (brand Intropin discontinued; generic dopamine widely available)", "originally DuPont/generic"),
    structure: "An endogenous catecholamine, the immediate metabolic precursor of norepinephrine in the catecholamine synthesis pathway — a phenylethylamine with a catechol ring but no beta-hydroxyl or N-substitution.",
    pd: "Classically dose-dependent receptor activity (a simplification with substantial overlap in practice): at low doses (~1–3 mcg/kg/min) dopaminergic (D1) receptor activation predominates, promoting renal and splanchnic vasodilation ('renal-dose dopamine' — now known not to confer meaningful renoprotection and largely abandoned clinically); at moderate doses (~3–10 mcg/kg/min) beta-1 activity dominates, increasing heart rate and contractility; at higher doses (>10 mcg/kg/min) alpha-1-mediated vasoconstriction predominates, raising systemic vascular resistance.",
    pk: "Onset within minutes of infusion, very short half-life (~2 min) requiring continuous titrated infusion. Metabolised by MAO and COMT (partly converted to norepinephrine endogenously), renal excretion of metabolites.",
    dosage: "FDA-approved: Continuous IV infusion — typically initiated at 2–5 mcg/kg/min and titrated according to haemodynamic response, up to 20–50 mcg/kg/min in refractory cases per the label's broad dose range, though most guideline-directed use favours norepinephrine as first-line with dopamine reserved for select bradycardia-associated hypotension or specific circumstances.",
    offLabel: "Symptomatic bradycardia unresponsive to atropine, as a temporising chronotropic/pressor infusion while preparing for pacing (an ACLS-recognised use consistent with broad labelling); historically for 'renal protection' in early acute kidney injury/oliguria — this use is now considered outdated and not supported by contemporary evidence, and is generally discouraged.",
    complications: "Tachyarrhythmias (more arrhythmogenic than norepinephrine at equipotent pressor doses — several trials show higher arrhythmia rates with dopamine vs norepinephrine in septic shock); tissue necrosis with extravasation; myocardial ischaemia risk from increased oxygen demand; nausea/vomiting; can suppress anterior pituitary hormone release (prolactin, TSH) with prolonged infusion; generally relegated to second-line status behind norepinephrine in septic shock (per Surviving Sepsis Campaign) given the comparatively worse arrhythmia/mortality signal in trial data."
  });

  addDrug({
    id: "dobutamine", cat: "vasopressors", name: "Dobutamine", brand: "Dobutrex",
    tagline: "Predominantly beta-1 agonist inotrope for cardiogenic shock/low cardiac output states; minimal vasopressor effect",
    tags: ["Beta-1 agonist", "Inotrope"],
    source: SRC.fdaUpToDate("Dobutamine injection label (brand Dobutrex discontinued; generic dobutamine widely available)", "originally Eli Lilly/generic"),
    structure: "A synthetic catecholamine analogue (a racemic mixture of two stereoisomers with differing receptor selectivity that together produce its net pharmacologic profile) structurally related to dopamine but engineered for more selective beta-1 activity.",
    pd: "Predominantly beta-1 agonist, producing positive inotropy (increased contractility/stroke volume) and modest positive chronotropy, with weaker beta-2 (mild vasodilation) and minimal alpha-1 activity — net haemodynamic effect is increased cardiac output with little to no change, or a mild decrease, in systemic vascular resistance/blood pressure, distinguishing it functionally from vasopressor catecholamines.",
    pk: "Onset within minutes, short half-life (~2 min) requiring continuous infusion. Metabolised by COMT and conjugation, renal excretion of metabolites.",
    dosage: "FDA-approved: Continuous IV infusion — 2.5–15 mcg/kg/min, titrated to haemodynamic/clinical response (up to 20 mcg/kg/min in some protocols per the label's upper titration range) for short-term management of cardiac decompensation (e.g. cardiogenic shock, acute decompensated heart failure with low output).",
    offLabel: "Pharmacologic stress agent for dobutamine stress echocardiography (a well-established, though formally separate, diagnostic-use application distinct from its haemodynamic-support labelling); adjunct inotropic support in septic shock with demonstrated myocardial dysfunction/low cardiac output despite adequate fluid resuscitation and vasopressor therapy, per Surviving Sepsis Campaign guidance.",
    complications: "Tachyarrhythmias and increased myocardial oxygen demand, which can precipitate or worsen myocardial ischaemia in patients with coronary artery disease; hypotension (from beta-2-mediated vasodilation, especially in hypovolaemic patients — volume status should be optimised before starting); tachyphylaxis with prolonged infusion (beta-receptor downregulation); can precipitate significant tachycardia/arrhythmia during stress-echo use, requiring cardiac monitoring and readiness to treat; not a vasopressor — should not be relied upon alone to raise blood pressure in hypotensive shock without adequate perfusion pressure support from a true vasopressor."
  });

  // ---------------- LOCAL ANAESTHETICS ----------------
  addDrug({
    id: "lidocaine", cat: "local", name: "Lidocaine", brand: "Xylocaine",
    tagline: "Prototypical amide local anaesthetic; intermediate potency/duration, also used IV for analgesia and as an antiarrhythmic",
    tags: ["Amide LA", "Class Ib antiarrhythmic"],
    source: SRC.fdaUpToDate("Xylocaine (lidocaine hydrochloride) injection label", "Fresenius Kabi/generic"),
    structure: "An amide local anaesthetic (the prototype of the amide class) — an amide linkage connects the aromatic (lipophilic) ring to the tertiary amine (hydrophilic) terminus via an intermediate alkyl chain; amide LAs are metabolised hepatically, unlike ester LAs which are hydrolysed by plasma cholinesterase.",
    pd: "Blocks voltage-gated sodium channels from the intracellular side of the neuronal membrane (in the un-ionised, membrane-permeant form which then re-ionises intracellularly to bind the channel), preventing sodium influx, action-potential propagation and thus nerve conduction — this produces sensory and motor block depending on concentration and the fibre type blocked (smaller, less myelinated fibres are generally blocked preferentially, though the classic size-based rule has important exceptions). Also blocks cardiac sodium channels (Class Ib antiarrhythmic activity) and has systemic analgesic/anti-hyperalgesic effects when given IV, independent of nerve blockade at the injection site.",
    pk: "Intermediate onset (~2–5 min for infiltration/most blocks) and intermediate duration (~1–2 h plain, longer with epinephrine). Hepatic CYP3A4/1A2 metabolism (amide hydrolysis by hepatic microsomal enzymes) to active metabolites (monoethylglycinexylidide, MEGX, contributing to systemic toxicity risk with prolonged high-dose infusion or hepatic impairment), renal excretion of metabolites.",
    dosage: "FDA-approved: Infiltration/peripheral nerve block — dose varies by block and formulation/concentration (0.5–2% solutions), maximum single dose typically cited as 4.5 mg/kg plain (up to ~300 mg) or 7 mg/kg with epinephrine (up to ~500 mg) per standard local anaesthetic dosing guidance referenced in the label and toxicology literature. IV antiarrhythmic (ventricular arrhythmia) — 1–1.5 mg/kg IV bolus, may repeat, followed by infusion 1–4 mg/min.",
    offLabel: "IV lidocaine infusion as a component of multimodal perioperative analgesia (particularly in abdominal surgery, shown in several trials to reduce opioid consumption, pain scores and speed return of bowel function) — a widely adopted ERAS practice that is off-label relative to its approved antiarrhythmic/local-anaesthetic indications; topical/nebulised use for cough suppression during awake airway procedures.",
    complications: "Local anaesthetic systemic toxicity (LAST) from inadvertent intravascular injection or absorption of an excessive dose — early CNS signs (perioral numbness, tinnitus, metallic taste, agitation) progressing to seizures, then cardiovascular signs (arrhythmia, conduction block, cardiovascular collapse), managed per ASRA LAST checklist with airway management, seizure control, and IV lipid emulsion ('lipid rescue') for cardiovascular toxicity; methaemoglobinaemia (more classically associated with prilocaine/benzocaine but reported); transient neurologic symptoms with high-concentration intrathecal lidocaine (historically noted with 5% hyperbaric lidocaine, contributing to reduced use for spinal anaesthesia); allergic reactions are rare with amide LAs (more common with esters, related to PABA metabolite) but can occur, sometimes related to preservatives."
  });

  addDrug({
    id: "bupivacaine", cat: "local", name: "Bupivacaine", brand: "Marcaine / Sensorcaine (liposomal: Exparel)",
    tagline: "Long-acting amide local anaesthetic with high potency; historically the most cardiotoxic amide LA",
    tags: ["Amide LA", "Long-acting"],
    source: SRC.fdaUpToDate("Marcaine (bupivacaine hydrochloride) injection label; Exparel (bupivacaine liposome injectable suspension) label", "Pfizer (Marcaine)/Pacira (Exparel)"),
    structure: "An amide local anaesthetic, a butyl-substituted analogue of mepivacaine — the longer alkyl chain on the piperidine nitrogen increases lipid solubility, potency and duration relative to mepivacaine/lidocaine, but also increases cardiotoxicity potential; marketed both as the standard hydrochloride solution and as a liposomal extended-release suspension (Exparel) for prolonged single-injection analgesia.",
    pd: "Sodium-channel blockade as for other amide LAs, but bupivacaine binds and dissociates from cardiac sodium channels more slowly than lidocaine ('fast-in, slow-out' kinetics), which underlies its disproportionately high cardiotoxicity relative to its CNS-toxicity threshold compared with other amide LAs — cardiac arrest can occur with little preceding CNS warning, and resuscitation from bupivacaine-induced cardiac arrest is notoriously difficult without lipid emulsion therapy.",
    pk: "Slower onset (~5–10 min) than lidocaine, but long duration (4–8 h plain, longer with epinephrine; the liposomal formulation, Exparel, is designed for sustained release over up to ~72–96 h). Hepatic amide metabolism (CYP3A4/CYP1A2), renal excretion of metabolites; highly protein bound, which is relevant to toxicity risk in states of hypoproteinaemia.",
    dosage: "FDA-approved (Marcaine, standard solution): Epidural/peripheral nerve block/infiltration — concentration and volume vary by block and indication (0.25–0.75% solutions), with a commonly cited maximum single dose of 2.5–3 mg/kg (institution/reference-dependent, consistent with cumulative local anaesthetic toxicity thresholds referenced in the label and toxicology literature); Exparel (liposomal) — up to 266 mg (20 mL of 1.3%) infiltrated into the surgical site for postsurgical analgesia, per its specific label, not intended for other routes (not for epidural, intrathecal, or nerve block outside its approved indications originally, though label expansions have since added some peripheral nerve block indications).",
    offLabel: "Off-label use of Exparel (liposomal bupivacaine) for peripheral nerve blocks beyond its originally-approved surgical-site infiltration indication was common in practice before subsequent label expansions for certain blocks — always verify the current, specific approved routes on the live label given this product's evolving indication history; use of plain bupivacaine at lower concentrations (e.g. 0.0625–0.125%) for labour epidural analgesia to preserve motor function while providing sensory analgesia.",
    complications: "Local anaesthetic systemic toxicity (LAST) with a disproportionately severe cardiotoxic profile — ventricular arrhythmias and cardiac arrest can occur abruptly, sometimes refractory to standard ACLS without prompt IV lipid emulsion therapy (a defining feature that led to the widespread adoption of lipid rescue protocols); the FDA label specifically warns against the use of the 0.75% concentration in obstetric epidural anaesthesia due to reports of cardiac arrest with accidental intravascular injection at that concentration; chondrolysis reported with continuous intra-articular infusion (labelled warning against this specific use); methaemoglobinaemia is not a typical bupivacaine effect (more an ester/prilocaine issue)."
  });

  addDrug({
    id: "ropivacaine", cat: "local", name: "Ropivacaine", brand: "Naropin",
    tagline: "Long-acting amide LA, single (S)-enantiomer, developed for a wider margin of cardiac safety than bupivacaine",
    tags: ["Amide LA", "Long-acting", "Single enantiomer"],
    source: SRC.fdaUpToDate("Naropin (ropivacaine hydrochloride) injection label", "originally AstraZeneca/generic"),
    structure: "An amide local anaesthetic structurally similar to bupivacaine and mepivacaine (a propyl-substituted piperidine analogue) but manufactured and marketed as a pure S(-)-enantiomer rather than a racemic mixture — the S-enantiomer is inherently less cardiotoxic and less potent at blocking cardiac sodium channels than the R-enantiomer, which is the rationale behind its improved safety margin.",
    pd: "Sodium-channel blockade mechanism as for other amide LAs. Compared with bupivacaine, ropivacaine shows a degree of differential/selective sensory-over-motor blockade at lower concentrations (useful for labour analgesia/ambulatory regional techniques wanting sensory analgesia with less motor block) and a wider margin between the dose causing CNS toxicity and the dose causing cardiotoxicity, translating to a better safety profile in the event of accidental intravascular injection, though it is not risk-free.",
    pk: "Onset (~10–15 min) and duration (4–8 h, dose/concentration-dependent) broadly similar to bupivacaine. Hepatic CYP1A2 (major) and CYP3A4 metabolism, renal excretion of metabolites; slightly less lipid-soluble/potent than bupivacaine at equal concentrations, which is part of why higher concentrations of ropivacaine are used to achieve comparable block density.",
    dosage: "FDA-approved: Epidural (surgical anaesthesia) — 0.5–1% solutions, dose dependent on block level required. Epidural labour/postoperative analgesia — 0.2% solution, typically as an infusion (e.g. 6–14 mL/h per label-referenced ranges) or intermittent bolus. Peripheral nerve block/infiltration — 0.2–0.75% depending on indication and desired block density. Maximum recommended single dose per label guidance is procedure/concentration specific, generally referenced around 3–4 mg/kg for major blocks (verify against the live label and institutional protocol for the specific block being performed).",
    offLabel: "Continuous peripheral nerve catheter infusions for ambulatory/outpatient postoperative analgesia at low concentrations (e.g. 0.1–0.2%) — extends beyond some of the originally-studied indication scenarios though widely supported in the regional anaesthesia literature and largely consistent with its labelled peripheral-block use.",
    complications: "Local anaesthetic systemic toxicity, though the threshold and severity for cardiotoxicity is generally more favourable than bupivacaine at equivalent doses — still managed per ASRA LAST protocol including lipid emulsion if cardiovascular toxicity occurs; CNS toxicity (seizures) can still occur with excessive dose or intravascular injection; hypotension/bradycardia with high neuraxial blocks from sympathetic blockade; motor block with higher concentrations, potentially delaying ambulation after regional techniques if not carefully dosed."
  });

  addDrug({
    id: "chloroprocaine", cat: "local", name: "Chloroprocaine", brand: "Nesacaine",
    tagline: "Fast-onset, short-acting ester local anaesthetic; hydrolysed rapidly by plasma cholinesterase, favoured in obstetrics for emergency conversion",
    tags: ["Ester LA", "Rapid onset/offset"],
    source: SRC.fdaUpToDate("Nesacaine (chloroprocaine hydrochloride) injection label", "Sintetica/generic"),
    structure: "An ester local anaesthetic, a chlorinated derivative of procaine — the ester linkage (rather than the amide linkage of lidocaine/bupivacaine/ropivacaine) makes it susceptible to rapid hydrolysis by plasma (pseudo)cholinesterase, giving it the fastest systemic clearance of any clinically used local anaesthetic.",
    pd: "Sodium-channel blockade mechanism as for other local anaesthetics. Its ester structure means metabolism does not depend on hepatic function, and its very rapid plasma hydrolysis (half-life of only ~20–45 seconds in adults) underlies both its short duration of action and its comparatively wide safety margin against systemic toxicity even with substantial epidural dosing.",
    pk: "Fast onset (~6–12 min epidural), short duration (~30–60 min plain, longer with epinephrine). Hydrolysed almost entirely by plasma cholinesterase (ester hydrolysis), producing minimal hepatic/renal clearance burden; one metabolite is para-aminobenzoic acid (PABA), which is implicated in the higher rate of allergic reactions seen with ester LAs generally compared with amides.",
    dosage: "FDA-approved: Epidural anaesthesia (surgical) — 2–3% solution, dose and volume per the block/level required. Historically avoided for spinal anaesthesia in the US due to concerns (largely attributed to formulation preservatives/antioxidants in earlier products rather than the drug itself) about neurotoxicity with large-volume/high-concentration intrathecal use; preservative-free formulations have since re-enabled some off-label intrathecal use in select practice.",
    offLabel: "Rapid emergency conversion of an existing labour epidural to surgical anaesthesia for urgent caesarean delivery — exploiting its fast onset; preservative-free chloroprocaine for intrathecal use in ambulatory/short-duration spinal anaesthesia (an increasingly supported off-label practice given its fast offset, favourable for same-day surgery, though formal FDA labelling for the intrathecal route remains limited).",
    complications: "Historically reported neurotoxicity (arachnoiditis, prolonged neurologic deficit) with large-volume intrathecal use of earlier formulations was subsequently attributed largely to the antioxidant sodium bisulfite (and low pH) rather than chloroprocaine itself — modern preservative-free formulations have a substantially better safety record for off-label intrathecal use, though caution and informed practice remain warranted; allergic/hypersensitivity reactions (more common with ester LAs due to PABA metabolite) — important in patients with a reported 'local anaesthetic allergy' history, which is much more often ester-related than amide-related; can antagonise the analgesic effect of subsequently administered epidural opioids/local anaesthetics in some reports (a recognised but incompletely understood interaction, particularly noted with epidural morphine)."
  });

  addDrug({
    id: "mepivacaine", cat: "local", name: "Mepivacaine", brand: "Polocaine / Carbocaine",
    tagline: "Intermediate-duration amide LA, similar profile to lidocaine but with less vasodilation and longer duration",
    tags: ["Amide LA", "Intermediate duration"],
    source: SRC.fdaUpToDate("Polocaine (mepivacaine hydrochloride) injection label", "Hospira/generic"),
    structure: "An amide local anaesthetic in the same pipecoloxylidide chemical family as bupivacaine and ropivacaine (a methyl-substituted piperidine analogue), but with a shorter alkyl substituent giving it intermediate potency and duration, closer to lidocaine.",
    pd: "Sodium-channel blockade mechanism as for other amide LAs. Notably causes less intrinsic vasodilation than lidocaine, giving it a somewhat longer duration of action even without added epinephrine — a practical advantage in situations (e.g. some obstetric or outpatient blocks, or in patients where epinephrine is undesirable) where a plain (epinephrine-free) solution with reasonable duration is wanted.",
    pk: "Onset (~3–5 min) and duration (~1.5–3 h plain, longer with epinephrine or in slower-turnover tissue planes) intermediate between lidocaine and bupivacaine/ropivacaine. Hepatic amide metabolism, renal excretion of metabolites; notably has slower placental clearance relative to some other amides, historically leading to caution about neonatal accumulation with maternal epidural mepivacaine use — a consideration in choosing obstetric local anaesthetics.",
    dosage: "FDA-approved: Peripheral nerve block/infiltration/epidural — concentration (1–2%) and volume dependent on the specific block and indication; maximum recommended dose per label-referenced local anaesthetic dosing guidance is generally cited around 4–5 mg/kg (verify against the live label and institutional protocol for the specific block).",
    offLabel: "Popular choice for peripheral nerve blocks in ambulatory/outpatient surgery specifically because its intermediate duration provides adequate surgical anaesthesia while allowing more predictable, earlier resolution of motor block for same-day discharge — a widely adopted practice pattern within its labelled peripheral-block indications rather than a distinct off-label use per se.",
    complications: "Local anaesthetic systemic toxicity as for other amide LAs, managed per ASRA LAST protocol; relatively longer neonatal elimination half-life historically raised concern about fetal/neonatal accumulation with maternal epidural use in obstetrics, contributing to more selective obstetric use compared with lidocaine/bupivacaine/ropivacaine in contemporary practice; methaemoglobinaemia is not a typical mepivacaine effect; generally well tolerated with a safety profile similar in kind to lidocaine, differing mainly in duration and vasoactivity."
  });

  window.KN_STUDY = { categories, topics, drugs };
})();
