/**
 * Part 1 of INI-CET SS 2026 Critical Care Recall Bank (Questions 1 to 20)
 * Extracted from Marrow Super Speciality INI-SS April 2026 Recall Session (YouTube eEJF3CC5Qx8)
 */

const SOURCE_URL = "https://youtu.be/eEJF3CC5Qx8";
const SOURCE_LABEL = "Marrow Super Speciality INI-SS April 2026 Recall Session (YouTube eEJF3CC5Qx8)";

const questions1To20 = [
  {
    "id": "INICET-SS-2026-CC-R001",
    "number": 1,
    "chapterId": 18,
    "chapter": "Severe ICU Infections & Antimicrobial Stewardship",
    "topicId": "cc-ventilator-associated-pneumonia",
    "subject": "Infectious Diseases",
    "subtopic": "VAP Quantitative Culture Diagnostic Cutoffs",
    "question": "In a mechanically ventilated patient suspected of having ventilator-associated pneumonia (VAP), what is the accepted diagnostic quantitative culture threshold for bronchoalveolar lavage (BAL) fluid?",
    "options": [
      "≥ 10^3 CFU/mL",
      "≥ 10^4 CFU/mL",
      "≥ 10^5 CFU/mL",
      "≥ 10^6 CFU/mL"
    ],
    "answer": "B",
    "explanation": "Quantitative microbiological diagnostic thresholds for ventilator-associated pneumonia (VAP) are standardized based on the sampling technique: for protected specimen brush (PSB) it is ≥ 10^3 CFU/mL; for bronchoalveolar lavage (BAL) it is ≥ 10^4 CFU/mL; and for non-bronchoscopic endotracheal aspirate (ETA) it is ≥ 10^5 CFU/mL. These thresholds distinguish true alveolar infection from upper airway colonization.",
    "whyWrong": {
      "A": "≥ 10^3 CFU/mL is the quantitative cutoff for protected specimen brush (PSB) samples, which sample a smaller volume (approx 0.001 mL) protected by a wax plug.",
      "B": "Correct answer: ≥ 10^4 CFU/mL is the established diagnostic threshold for BAL fluid in VAP.",
      "C": "≥ 10^5 CFU/mL is the diagnostic threshold for blind endotracheal aspirates (ETA).",
      "D": "≥ 10^6 CFU/mL is excessively high and would result in an unacceptable false-negative rate."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Quantitative thresholds: PSB = 10^3 CFU/mL, BAL = 10^4 CFU/mL, Endotracheal Aspirate = 10^5 CFU/mL.\n• Clinical Pulmonary Infection Score (CPIS) > 6 also suggests pneumonia but has lower specificity than quantitative cultures.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Infectious Diseases",
      "Ventilator-Associated Pneumonia"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "≥ 10^4 CFU/mL",
    "verified_answer": "B",
    "verified_answer_text": "≥ 10^4 CFU/mL",
    "concept_tested": "Quantitative diagnostic cutoffs for microbiological confirmation of ventilator-associated pneumonia across different sampling modalities",
    "high_yield_takeaway": [
      "Protected specimen brush (PSB) threshold is 10^3 CFU/mL.",
      "Bronchoalveolar lavage (BAL) threshold is 10^4 CFU/mL.",
      "Endotracheal aspirate (ETA) threshold is 10^5 CFU/mL."
    ],
    "sources": [
      SOURCE_LABEL,
      "IDSA/ATS VAP Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R002",
    "number": 2,
    "chapterId": 22,
    "chapter": "ICU Hematology, Hemostasis & Transfusion Medicine",
    "topicId": "cc-anticoagulation-reversal",
    "subject": "Pharmacology & Hematology",
    "subtopic": "LMWH & Neuraxial Anesthesia",
    "question": "A patient is receiving therapeutic-dose low-molecular-weight heparin (LMWH, enoxaparin 1 mg/kg BID) for pulmonary embolism. According to ASRA guidelines, what is the minimum recommended interval between the last therapeutic dose and the placement of a central neuraxial block?",
    "options": [
      "4 to 6 hours",
      "12 hours",
      "24 hours",
      "48 hours"
    ],
    "answer": "C",
    "explanation": "According to the American Society of Regional Anesthesia and Pain Medicine (ASRA) guidelines, therapeutic-dose LMWH (e.g., enoxaparin 1 mg/kg Q12H or 1.5 mg/kg daily) requires a minimum withholding interval of 24 hours prior to needle puncture or catheter placement to minimize the catastrophic risk of spinal/epidural hematoma. In contrast, prophylactic-dose LMWH (e.g., enoxaparin 40 mg daily) requires a minimum 12-hour interval.",
    "whyWrong": {
      "A": "4 to 6 hours is the withholding time for unfractionated heparin (UFH) intravenous infusion, accompanied by a normal aPTT check.",
      "B": "12 hours is the recommended minimum withholding interval for prophylactic-dose LMWH, not therapeutic dose.",
      "C": "Correct answer: 24 hours is mandatory for therapeutic-dose LMWH.",
      "D": "48 hours may be considered in severe renal impairment (CrCl < 30 mL/min) with anti-Xa monitoring, but standard guideline threshold for normal renal function is 24 hours."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Prophylactic LMWH: wait 12 hours before block.\n• Therapeutic LMWH: wait 24 hours before block.\n• Catheter removal: wait 24 hours after therapeutic dose, and restart therapeutic dose at least 4 hours after catheter removal.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Hematology & Transfusion",
      "Neuraxial Anesthesia & Anticoagulation"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "C",
    "speaker_answer_text": "24 hours",
    "verified_answer": "C",
    "verified_answer_text": "24 hours",
    "concept_tested": "ASRA safety intervals for central neuraxial procedures in patients on therapeutic LMWH",
    "high_yield_takeaway": [
      "Therapeutic LMWH requires 24 hours stoppage prior to neuraxial needle or catheter placement.",
      "Prophylactic LMWH requires 12 hours stoppage."
    ],
    "sources": [
      SOURCE_LABEL,
      "ASRA Regional Anesthesia in the Patient Receiving Antithrombotic or Thrombolytic Therapy Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R003",
    "number": 3,
    "chapterId": 8,
    "chapter": "Invasive Mechanical Ventilation & Graphics",
    "topicId": "cc-weaning-and-extubation",
    "subject": "Mechanical Ventilation",
    "subtopic": "Spontaneous Breathing Trial (SBT) Failure Criteria",
    "question": "A 62-year-old patient with an acute exacerbation of COPD is undergoing a spontaneous breathing trial (SBT) on pressure support ventilation (PSV 5 cmH2O, PEEP 5 cmH2O). After 30 minutes, the patient becomes agitated, respiratory rate increases to 38 breaths/min, SpO2 drops to 88%, and ABG reveals worsening hypercapnia (PaCO2 68 mmHg, pH 7.24). What is the most appropriate immediate action?",
    "options": [
      "Proceed with immediate tracheal extubation to non-invasive ventilation (NIV)",
      "Continue PSV trial for another 90 minutes (to complete 120 minutes)",
      "Switch to a T-piece trial to further challenge respiratory muscles",
      "Terminate the SBT immediately and return the patient to a comfortable resting mechanical ventilation mode"
    ],
    "answer": "D",
    "explanation": "The patient is demonstrating definitive objective and subjective criteria for Spontaneous Breathing Trial (SBT) failure: tachypnea (RR > 35), agitation/diaphoresis, hypoxemia (SpO2 < 90%), and acute respiratory acidosis. Continuing the trial or switching to T-piece causes severe diaphragmatic fatigue and cardiopulmonary compromise. The trial should be terminated immediately, the patient rested on full ventilatory support, the reversible causes investigated, and an SBT rescheduled after 24 hours.",
    "whyWrong": {
      "A": "Extubation in a patient actively failing an SBT with acute respiratory acidosis and severe tachypnea is unsafe and leads to high reintubation mortality.",
      "B": "Continuing an SBT when explicit failure criteria are met exhaust the patient and prolongs mechanical ventilation.",
      "C": "T-piece trial imposes an even higher work of breathing compared to PSV and would exacerbate respiratory muscle fatigue.",
      "D": "Correct answer: Immediate termination of SBT and return to comfortable resting ventilatory support is the standard of care."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• SBT failure criteria: RR > 35 breaths/min, RSBI (f/Vt) > 105, SpO2 < 90%, HR change > 20%, pH < 7.30 with rising PaCO2, diaphoresis, or agitation.\n• When failure occurs, rest the diaphragm on assist-control mode for at least 24 hours before repeating.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Weaning & SBT Failure"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "D",
    "speaker_answer_text": "Terminate the SBT immediately and return the patient to a comfortable resting mechanical ventilation mode",
    "verified_answer": "D",
    "verified_answer_text": "Terminate the SBT immediately and return the patient to a comfortable resting mechanical ventilation mode",
    "concept_tested": "Recognition of failed spontaneous breathing trial and management of acute diaphragmatic exhaustion",
    "high_yield_takeaway": [
      "SBT must be aborted immediately upon onset of hemodynamic instability, severe tachypnea (RR > 35), or acute respiratory acidosis.",
      "Patients should not be pushed through failed trials."
    ],
    "sources": [
      SOURCE_LABEL,
      "ATS/CHEST Weaning Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R004",
    "number": 4,
    "chapterId": 13,
    "chapter": "Acute Kidney Injury & Renal Replacement Therapy",
    "topicId": "cc-peritoneal-dialysis",
    "subject": "Renal Critical Care",
    "subtopic": "Peritoneal Dialysis Osmotic Agents",
    "question": "In conventional peritoneal dialysis (PD), which substance is most widely used as the primary osmotically active agent to generate the transmembrane osmotic gradient required for ultrafiltration?",
    "options": [
      "Dextrose (Glucose)",
      "Icodextrin",
      "Amino acids",
      "Mannitol"
    ],
    "answer": "A",
    "explanation": "Dextrose (glucose) in concentrations of 1.5%, 2.5%, and 4.25% is the classic and most widely used crystalloid osmotic agent in peritoneal dialysis fluids. It creates an osmotic gradient that drives transcapillary ultrafiltration across the peritoneal membrane through aquaporin-1 channels and small pores. Icodextrin is an alternative colloid osmotic agent derived from starch used primarily for long dwells.",
    "whyWrong": {
      "A": "Correct answer: Dextrose (glucose) is the universal, standard primary osmotic agent in conventional peritoneal dialysate solutions.",
      "B": "Icodextrin is a glucose polymer used selectively for long dwells (e.g., daytime dwell in APD or nighttime in CAPD) via colloid osmosis, but is not the conventional primary base agent.",
      "C": "Amino acid-based solutions (e.g., Nutrineal) are specialized solutions for malnourished PD patients, not the primary osmotic workhorse.",
      "D": "Mannitol is not used as a standard constituent of peritoneal dialysate."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Glucose: crystalloid osmosis, rapid absorption, standard in 1.5%, 2.5%, 4.25% bags.\n• Icodextrin: colloid osmosis, absorbed via lymphatics, ideal for long 8–16 hr dwells and high-transporters.\n• Three-pore model: small pores (solute + water), ultra-small pores/aquaporin-1 (free water only), large pores (macromolecules).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Renal Critical Care",
      "Peritoneal Dialysis"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Dextrose (Glucose)",
    "verified_answer": "A",
    "verified_answer_text": "Dextrose (Glucose)",
    "concept_tested": "Physiology of peritoneal dialysis ultrafiltration and standard osmotic agents",
    "high_yield_takeaway": [
      "Glucose (dextrose) is the primary crystalloid osmotic driver in standard peritoneal dialysate.",
      "Icodextrin provides colloid oncotic ultrafiltration across long dwell periods."
    ],
    "sources": [
      SOURCE_LABEL,
      "ISPD Practice Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R005",
    "number": 5,
    "chapterId": 16,
    "chapter": "Sedation, Analgesia, Delirium & Neuromuscular Blockade",
    "topicId": "cc-neuromuscular-blockade-reversal",
    "subject": "Pharmacology & ICU Procedures",
    "subtopic": "Sugammadex Dosing for CICI",
    "question": "During a rapid sequence induction (RSI), rocuronium (1.2 mg/kg) was administered. A 'Cannot Intubate, Cannot Oxygenate' (CICO) scenario develops immediately. What is the recommended dose of sugammadex for immediate rescue reversal of rocuronium-induced neuromuscular blockade?",
    "options": [
      "2 mg/kg IV",
      "4 mg/kg IV",
      "8 mg/kg IV",
      "16 mg/kg IV"
    ],
    "answer": "D",
    "explanation": "For immediate rescue reversal of high-dose rocuronium (1.0–1.2 mg/kg) within minutes of administration (such as in a CICO/CICI crisis), the recommended dose of sugammadex is 16 mg/kg IV. This high dose encapsulates all free and receptor-bound rocuronium molecules within approximately 3 minutes, restoring spontaneous ventilation faster than succinylcholine spontaneous recovery. For routine reversal of moderate block (TOF = 2), the dose is 2 mg/kg; for deep block (PTC 1–2), the dose is 4 mg/kg.",
    "whyWrong": {
      "A": "2 mg/kg is the dose for routine reversal of moderate neuromuscular blockade (reappearance of T2 on TOF).",
      "B": "4 mg/kg is the dose for deep neuromuscular blockade (1 to 2 post-tetanic twitches, no TOF twitches).",
      "C": "8 mg/kg is an intermediate non-standard dose not supported by airway crisis guidelines.",
      "D": "Correct answer: 16 mg/kg IV is the established rescue dose for immediate reversal of rocuronium in a cannot intubate cannot oxygenate emergency."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Sugammadex Dosing: Moderate block (TOF ≥ 2) = 2 mg/kg; Deep block (PTC 1-2) = 4 mg/kg; Immediate RSI rescue reversal (3 min post 1.2 mg/kg rocuronium) = 16 mg/kg.\n• Sugammadex binds steroidal NMBAs (rocuronium > vecuronium > pancuronium); it has zero effect on benzylisoquinoliniums (cisatracurium).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Pharmacology & Oncology",
      "Neuromuscular Blockade Reversal"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "D",
    "speaker_answer_text": "16 mg/kg IV",
    "verified_answer": "D",
    "verified_answer_text": "16 mg/kg IV",
    "concept_tested": "Emergency pharmacology of sugammadex in cannot-intubate-cannot-ventilate (CICO) scenarios",
    "high_yield_takeaway": [
      "16 mg/kg sugammadex IV reverses rocuronium 1.2 mg/kg within 3 minutes in an acute airway emergency.",
      "Moderate block = 2 mg/kg; Deep block = 4 mg/kg."
    ],
    "sources": [
      SOURCE_LABEL,
      "Difficult Airway Society (DAS) Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R006",
    "number": 6,
    "chapterId": 20,
    "chapter": "Endocrine & Metabolic Crises",
    "topicId": "cc-diabetic-ketoacidosis",
    "subject": "Electrolytes & Metabolic",
    "subtopic": "DKA Protocol Fluid & Insulin Adjustment",
    "question": "A 24-year-old patient with diabetic ketoacidosis (DKA) is receiving IV isotonic saline and regular insulin infusion at 0.1 U/kg/hr. After 4 hours, plasma glucose has decreased from 480 mg/dL to 230 mg/dL, but ABG still shows pH 7.18, bicarbonate 11 mEq/L, and an elevated anion gap of 18 mEq/L. What is the next best step in management?",
    "options": [
      "Stop insulin infusion and start subcutaneous basal insulin",
      "Add 5% dextrose to IV fluids and continue insulin infusion at 0.05–0.1 U/kg/hr",
      "Decrease insulin infusion rate to 0.01 U/kg/hr without adding dextrose",
      "Administer 100 mmol of sodium bicarbonate bolus"
    ],
    "answer": "B",
    "explanation": "In DKA management, when plasma glucose drops below 200–250 mg/dL while the anion gap and ketoacidosis remain unresolved (pH < 7.30, HCO3 < 18, high anion gap), insulin must NOT be discontinued or excessively reduced. Halting insulin allows continued lipolysis and ketogenesis. The standard protocol is to add 5% to 10% dextrose to the IV fluids while continuing insulin infusion (titrated to 0.02–0.05 U/kg/hr) to maintain euglycemia (150–200 mg/dL) while clearing ketoacidosis.",
    "whyWrong": {
      "A": "Stopping insulin while the anion gap is wide leads to persistent ketogenesis and clinical deterioration.",
      "B": "Correct answer: Adding 5% dextrose allows uninterrupted insulin infusion to suppress hepatic ketogenesis and close the anion gap safely.",
      "C": "Decreasing insulin to near zero without dextrose will cause rapid relapse of ketoacidosis.",
      "D": "Bicarbonate is indicated only if pH < 6.9; at pH 7.18, it is not recommended due to paradoxical CSF acidosis and hypokalemia."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Target blood glucose during DKA resolution: 150–200 mg/dL.\n• When blood glucose falls < 200–250 mg/dL before anion gap closes, add 5% Dextrose in 0.45% Saline and maintain insulin.\n• DKA resolution criteria: Blood glucose < 200 mg/dL PLUS two of: serum bicarbonate ≥ 15 mEq/L, venous pH > 7.30, and normal anion gap (≤ 12 mEq/L).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Electrolytes & Metabolic",
      "Diabetic Ketoacidosis"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Add 5% dextrose to IV fluids and continue insulin infusion at 0.05–0.1 U/kg/hr",
    "verified_answer": "B",
    "verified_answer_text": "Add 5% dextrose to IV fluids and continue insulin infusion at 0.05–0.1 U/kg/hr",
    "concept_tested": "Management of glucose-ketosis dissociation during DKA resuscitation",
    "high_yield_takeaway": [
      "Never stop insulin when glucose drops < 250 mg/dL if ketoacidosis is unclosed; add dextrose.",
      "Target plasma glucose is 150-200 mg/dL until anion gap normalizes."
    ],
    "sources": [
      SOURCE_LABEL,
      "ADA Consensus Statement on Hyperglycemic Crises",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R007",
    "number": 7,
    "chapterId": 21,
    "chapter": "Critical Care Clinical Nutrition & Metabolism",
    "topicId": "cc-parenteral-nutrition",
    "subject": "Nutrition & GI",
    "subtopic": "Peripheral Line Osmolarity Limits",
    "question": "What is the generally accepted maximum osmolarity limit for parenteral solutions or infusions administered through a peripheral intravenous catheter to prevent chemical thrombophlebitis?",
    "options": [
      "500 mOsm/L",
      "900 mOsm/L",
      "1200 mOsm/L",
      "1500 mOsm/L"
    ],
    "answer": "B",
    "explanation": "According to ASPEN and Infusion Nurses Society (INS) standards, solutions with an osmolarity greater than 900 mOsm/L should be infused via a central venous catheter. Infusing hypertonic solutions (> 900 mOsm/L) through peripheral veins leads to high rates of endothelial irritation, chemical thrombophlebitis, and extravasation injury. Peripheral parenteral nutrition (PPN) formulations are strictly tailored to stay below 800–900 mOsm/L.",
    "whyWrong": {
      "A": "500 mOsm/L is well below the allowable peripheral threshold and is typical of low-concentration crystalloids.",
      "B": "Correct answer: 900 mOsm/L is the international guideline cutoff for safe peripheral venous administration.",
      "C": "1200 mOsm/L represents standard central TPN formulations, which cause intense phlebitis if given peripherally.",
      "D": "1500 mOsm/L is highly hypertonic and must strictly be given via central venous access into high-flow vessels (e.g., SVC)."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Peripheral vein osmolarity cutoff: ≤ 900 mOsm/L.\n• Central line mandatory for osmolarity > 900 mOsm/L.\n• Dextrose 10% has ~505 mOsm/L; Dextrose 20% has ~1010 mOsm/L (requires central line); D50W has ~2525 mOsm/L.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Nutrition & GI",
      "Vascular Access & Parenteral Nutrition"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "900 mOsm/L",
    "verified_answer": "B",
    "verified_answer_text": "900 mOsm/L",
    "concept_tested": "Upper limits of solution osmolarity for peripheral venous administration vs central access indication",
    "high_yield_takeaway": [
      "Solutions > 900 mOsm/L require central venous catheterization to prevent severe chemical thrombophlebitis.",
      "Peripheral TPN is limited to ≤ 800-900 mOsm/L."
    ],
    "sources": [
      SOURCE_LABEL,
      "ASPEN Parenteral Nutrition Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R008",
    "number": 8,
    "chapterId": 15,
    "chapter": "Neurocritical Care & Raised ICP Management",
    "topicId": "cc-subarachnoid-hemorrhage",
    "subject": "Neurocritical Care",
    "subtopic": "Thunderclap Headache Diagnostic Algorithm",
    "question": "A 45-year-old previously healthy female presents to the emergency department with a severe 'thunderclap' headache that reached maximum intensity within 1 minute. A non-contrast head CT performed 8 hours after symptom onset is completely normal. What is the most appropriate next step in management?",
    "options": [
      "Discharge home with oral analgesics and close outpatient follow-up",
      "Perform a diagnostic lumbar puncture (LP) to evaluate for xanthochromia",
      "Order an electroencephalogram (EEG)",
      "Start high-dose intravenous steroids for suspected temporal arteritis"
    ],
    "answer": "B",
    "explanation": "In a patient presenting with acute thunderclap headache suspicious for aneurysmal subarachnoid hemorrhage (SAH), a non-contrast head CT has > 99% sensitivity only if performed within the first 6 hours of headache onset. Beyond 6 hours, CT sensitivity declines steadily. Therefore, guidelines mandate that if non-contrast CT is negative beyond 6 hours (or if clinical suspicion remains high), a lumbar puncture (LP) must be performed to assess CSF opening pressure, red blood cell counts in serial tubes, and spectrophotometric or visual xanthochromia.",
    "whyWrong": {
      "A": "Discharging without LP risks missing a sentinel subarachnoid bleed, carrying up to 50% mortality upon rebleeding.",
      "B": "Correct answer: Lumbar puncture with examination for xanthochromia and persistent RBCs is the gold-standard next step when CT is negative after 6 hours.",
      "C": "EEG evaluates for seizures or encephalopathy, but does not diagnose subarachnoid hemorrhage.",
      "D": "Temporal arteritis occurs in elderly individuals (> 50 yr) and presents with subacute headache and ESR elevation, not thunderclap headache."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Ottawa SAH Rule: Thunderclap headache reaches peak in < 1 minute.\n• Non-contrast CT sensitivity: > 99% within 6 hours, drops to ~85% at 24 hours and ~50% at 1 week.\n• LP protocol: Xanthochromia takes 6–12 hours to develop (due to RBC breakdown to bilirubin) and persists for 2 weeks.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Neurocritical Care",
      "Subarachnoid Hemorrhage"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Perform a diagnostic lumbar puncture (LP) to evaluate for xanthochromia",
    "verified_answer": "B",
    "verified_answer_text": "Perform a diagnostic lumbar puncture (LP) to evaluate for xanthochromia",
    "concept_tested": "Diagnostic evaluation and protocol for suspected subarachnoid hemorrhage following negative head CT",
    "high_yield_takeaway": [
      "Non-contrast CT sensitivity for SAH drops significantly after 6 hours from onset.",
      "Lumbar puncture looking for xanthochromia is mandatory after a negative CT performed > 6 hours from onset."
    ],
    "sources": [
      SOURCE_LABEL,
      "AHA/ASA Subarachnoid Hemorrhage Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R009",
    "number": 9,
    "chapterId": 17,
    "chapter": "Critical Care Applied Pharmacology & Pharmacokinetics",
    "topicId": "cc-anesthetic-gases",
    "subject": "Pharmacology & ICU Procedures",
    "subtopic": "Nitrous Oxide Contraindications",
    "question": "Nitrous oxide (N2O) is strictly contraindicated in which of the following clinical conditions due to its rapid diffusion into air-filled closed body cavities?",
    "options": [
      "Untreated tension pneumothorax",
      "Bronchial asthma",
      "Severe hypertension",
      "Mild traumatic brain injury without pneumocephalus"
    ],
    "answer": "A",
    "explanation": "Nitrous oxide is 34 times more soluble in blood than nitrogen. When N2O is administered, it diffuses into gas-containing closed cavities far more rapidly than nitrogen can diffuse out, leading to rapid expansion of volume in compliant spaces (e.g., bowel, pneumothorax) or dangerous increases in pressure in non-compliant spaces (e.g., pneumocephalus, middle ear, eye bubble). In a patient with pneumothorax, N2O can double its size within 10 minutes and rapidly transform it into a fatal tension pneumothorax.",
    "whyWrong": {
      "A": "Correct answer: Untreated pneumothorax is an absolute contraindication to nitrous oxide administration.",
      "B": "Bronchial asthma is not a contraindication; volatile agents and N2O do not cause bronchospasm (though volatile anesthetics are bronchodilators).",
      "C": "Severe hypertension is not a specific closed-gas cavity contraindication, although N2O causes mild sympathetic stimulation.",
      "D": "Mild TBI without pneumocephalus does not involve a closed air space, though caution with ICP is required."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Absolute contraindications to N2O: Pneumothorax, pneumocephalus, bowel obstruction, air embolism, intraocular gas bubble (sulfur hexafluoride/C3F8), and middle ear surgery.\n• N2O can increase pneumothorax volume by 100% in 10 minutes and 200% in 30 minutes.\n• N2O inactivates methionine synthase (vitamin B12 oxidation).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Pharmacology & Oncology",
      "Inhalational Anesthetics"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Untreated tension pneumothorax",
    "verified_answer": "A",
    "verified_answer_text": "Untreated tension pneumothorax",
    "concept_tested": "Physics and clinical contraindications of nitrous oxide diffusion into closed gas spaces",
    "high_yield_takeaway": [
      "Nitrous oxide is 34 times more soluble than nitrogen and expands air-filled enclosed spaces.",
      "Pneumothorax, pneumocephalus, and bowel obstruction are absolute contraindications."
    ],
    "sources": [
      SOURCE_LABEL,
      "Miller's Anesthesia",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R010",
    "number": 10,
    "chapterId": 10,
    "chapter": "Obstructive Airway Emergencies in ICU (Asthma & COPD)",
    "topicId": "cc-ventilating-obstructive-lung-disease",
    "subject": "Mechanical Ventilation",
    "subtopic": "Mechanical Ventilation in Severe Status Asthmaticus",
    "question": "Which of the following ventilatory strategies is most appropriate when initiating invasive mechanical ventilation in a patient with severe acute status asthmaticus and severe airflow obstruction?",
    "options": [
      "High respiratory rate (28–32/min) and long inspiratory time to maximize minute ventilation",
      "Low respiratory rate (10–12/min), high inspiratory flow rate (70–80 L/min), and prolonged expiratory time",
      "High PEEP (15 cmH2O) to stent open all medium and small bronchioles",
      "Tidal volume of 10–12 mL/kg of actual body weight to overcome high airway resistance"
    ],
    "answer": "B",
    "explanation": "In severe obstructive lung disease (asthma/COPD), the primary physiological hazard is dynamic hyperinflation and intrinsic PEEP (auto-PEEP) due to incomplete exhalation. The goal is to provide adequate expiratory time (Te) by adopting a low respiratory rate (10–12 breaths/min), small tidal volumes (6–8 mL/kg PBW), and a high peak inspiratory flow rate (70–80 L/min or higher). This shortens inspiratory time (Ti), maximizes I:E ratio (1:3 or 1:4), and minimizes air-trapping while tolerating permissive hypercapnia.",
    "whyWrong": {
      "A": "High respiratory rate dramatically shortens expiratory time, leading to severe breath-stacking, massive auto-PEEP, and circulatory arrest.",
      "B": "Correct answer: Low rate, high inspiratory flow, and prolonged expiratory time prevent dynamic hyperinflation.",
      "C": "Applying high external PEEP in severe asthma worsens hyperinflation and barotrauma because the obstruction is primarily intrathoracic and non-flow-limited during expiration.",
      "D": "High tidal volumes markedly increase plateau pressure and the risk of tension pneumothorax."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Mechanical ventilation in severe asthma: Target Pplat < 30 cmH2O, low tidal volume (6 mL/kg), low rate (8–12 bpm), high flow rate (70–90 L/min) to lengthen Te.\n• Accept permissive hypercapnia as long as pH > 7.15–7.20.\n• Sudden hypotension after intubation = disconnect ventilator and decompress chest.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Status Asthmaticus"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Low respiratory rate (10–12/min), high inspiratory flow rate (70–80 L/min), and prolonged expiratory time",
    "verified_answer": "B",
    "verified_answer_text": "Low respiratory rate (10–12/min), high inspiratory flow rate (70–80 L/min), and prolonged expiratory time",
    "concept_tested": "Mechanical ventilatory strategies to prevent dynamic hyperinflation in severe status asthmaticus",
    "high_yield_takeaway": [
      "Ventilator settings in severe asthma prioritize prolonged expiratory time via low respiratory rates (8-12 bpm) and high inspiratory flows.",
      "Permissive hypercapnia is well-tolerated."
    ],
    "sources": [
      SOURCE_LABEL,
      "ATS Guidelines on Mechanical Ventilation in Status Asthmaticus",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R011",
    "number": 11,
    "chapterId": 15,
    "chapter": "Neurocritical Care & Raised ICP Management",
    "topicId": "cc-delayed-cerebral-ischemia",
    "subject": "Neurocritical Care",
    "subtopic": "Post-SAH Vasospasm & Lindegaard Ratio",
    "question": "A 52-year-old patient on day 6 post-clipping of an anterior communicating artery aneurysm develops new-onset left arm pronator drift. Transcranial Doppler (TCD) shows a right middle cerebral artery (MCA) mean flow velocity of 210 cm/s and an extracranial internal carotid artery (ICA) velocity of 40 cm/s, yielding a Lindegaard ratio of 5.25. What is the diagnosis and the recommended immediate hemodynamic management?",
    "options": [
      "Severe hyperemia; induce moderate hypothermia",
      "True vasospasm; maintain euvolemia and induce hypertension using vasopressors (e.g., norepinephrine) to improve cerebral perfusion",
      "Hyperdynamic flow; aggressively reduce blood pressure to MAP < 65 mmHg",
      "Acute cerebral infarction; administer recombinant tissue plasminogen activator (rtPA)"
    ],
    "answer": "B",
    "explanation": "A Lindegaard ratio (mean MCA velocity / extracranial ICA velocity) > 3 indicates vasospasm, and a ratio > 6 (or MCA velocity > 200 cm/s with ratio > 3) confirms severe true intracranial arterial vasospasm, distinguishing it from generalized hyperemic flow (where ICA velocity is also proportionally elevated, keeping ratio < 3). Current guidelines for Delayed Cerebral Ischemia (DCI) / vasospasm recommend maintaining euvolemia and stepwise induced hypertension using vasopressors (e.g., norepinephrine, target MAP increase 20–25%) to augment collateral perfusion.",
    "whyWrong": {
      "A": "Hyperemia would cause a parallel increase in extracranial ICA velocity, resulting in a Lindegaard ratio < 3.",
      "B": "Correct answer: Lindegaard ratio > 3 with elevated MCA velocity confirms vasospasm; induced hypertension with euvolemia is the cornerstone of hemodynamic rescue.",
      "C": "Reducing MAP in vasospasm precipitates watershed cerebral infarction due to pressure-dependent perfusion in autoregulated beds.",
      "D": "Systemic thrombolysis is contraindicated after recent intracranial aneurysm surgery."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Lindegaard Ratio = MCA mean velocity / Extracranial ICA mean velocity.\n• Ratio < 3: Hyperemia. Ratio 3–6: Mild-moderate vasospasm. Ratio > 6: Severe vasospasm.\n• Modern DCI management: Euvolemia + Induced Hypertension (Hypervolemia has been abandoned). Nimodipine 60 mg Q4H improves outcomes.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Neurocritical Care",
      "Vasospasm & TCD Monitoring"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "True vasospasm; maintain euvolemia and induce hypertension using vasopressors",
    "verified_answer": "B",
    "verified_answer_text": "True vasospasm; maintain euvolemia and induce hypertension using vasopressors",
    "concept_tested": "Interpretation of Lindegaard ratio on TCD and modern hemodynamic management of post-SAH vasospasm",
    "high_yield_takeaway": [
      "Lindegaard ratio > 3 confirms vasospasm rather than hyperemia.",
      "Treatment involves euvolemic induced hypertension with vasopressors."
    ],
    "sources": [
      SOURCE_LABEL,
      "Neurocritical Care Society Consensus Conference on SAH",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R012",
    "number": 12,
    "chapterId": 5,
    "chapter": "Sepsis, Septic Shock & Host Response (2026 SSC)",
    "topicId": "cc-surviving-sepsis-2026",
    "subject": "Sepsis",
    "subtopic": "SSC 2026 Antimicrobial Timing Guidelines",
    "question": "According to the Surviving Sepsis Campaign guidelines, what is the recommended timeframe for administration of appropriate intravenous antimicrobials when septic shock is present or sepsis is highly probable?",
    "options": [
      "Within 1 hour of recognition",
      "Within 3 hours of recognition",
      "Within 6 hours of recognition",
      "Only after definitive microbiological culture results are available"
    ],
    "answer": "A",
    "explanation": "The Surviving Sepsis Campaign guidelines strongly recommend administering broad-spectrum intravenous antimicrobials immediately, ideally within 1 hour of recognition, in all patients with septic shock or where sepsis is definite or highly probable. Each hour of delay in antibiotic administration in septic shock is associated with an incremental increase in mortality.",
    "whyWrong": {
      "A": "Correct answer: Within 1 hour ('the golden hour') is the universal strong recommendation for septic shock.",
      "B": "Within 3 hours is acceptable only when sepsis is possible without shock while rapid diagnostic workup is underway.",
      "C": "6 hours is an unacceptable delay associated with significantly increased mortality.",
      "D": "Waiting for cultures delays therapy by 24–48 hours, leading to refractory shock and organ failure."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Septic shock / Definite Sepsis: Start broad-spectrum IV antimicrobials within 1 hour.\n• Possible sepsis without shock: Rapid diagnostic investigation; start antibiotics within 3 hours if infection remains suspected.\n• Blood cultures before antibiotics, provided doing so does not delay initiation beyond 45 minutes.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Sepsis",
      "Antimicrobial Timing"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Within 1 hour of recognition",
    "verified_answer": "A",
    "verified_answer_text": "Within 1 hour of recognition",
    "concept_tested": "Antimicrobial timing and bundle targets in septic shock",
    "high_yield_takeaway": [
      "Intravenous antimicrobials must be administered within 1 hour in patients with septic shock.",
      "Mortality increases progressively with every hour of delay."
    ],
    "sources": [
      SOURCE_LABEL,
      "Surviving Sepsis Campaign International Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R013",
    "number": 13,
    "chapterId": 2,
    "chapter": "Applied Physiology of Critical Illness",
    "topicId": "cc-endothelial-glycocalyx",
    "subject": "Physiology",
    "subtopic": "Endothelial Glycocalyx Shedding Biomarkers",
    "question": "Which of the following circulating biomarkers is considered the most specific and widely studied marker of endothelial glycocalyx degradation and vascular barrier breakdown in sepsis and critical illness?",
    "options": [
      "Syndecan-1",
      "Troponin I",
      "C-reactive protein (CRP)",
      "Creatine kinase-MB"
    ],
    "answer": "A",
    "explanation": "The endothelial glycocalyx is a carbohydrate-rich luminal gel lining vascular endothelium, composed of proteoglycans (syndecans, glypicans) and glycosaminoglycans (heparan sulfate, chondroitin sulfate, hyaluronic acid). During sepsis, ischemia-reperfusion, and hypervolemic fluid overload, reactive oxygen species and matrix metalloproteinases shed the glycocalyx. Circulating Syndecan-1 and heparan sulfate are the primary validated biomarkers of this degradation, directly correlating with vascular hyperpermeability and capillary leak.",
    "whyWrong": {
      "A": "Correct answer: Syndecan-1 is a transmembrane heparan sulfate proteoglycan shed into plasma upon glycocalyx destruction.",
      "B": "Troponin I is a specific biomarker of myocardial necrosis, not glycocalyx integrity.",
      "C": "CRP is a non-specific hepatic acute-phase reactant.",
      "D": "CK-MB is an enzyme marker of cardiac/skeletal muscle breakdown."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Glycocalyx components: Core proteins (Syndecan, Glypican) + side chains (Heparan sulfate, Chondroitin sulfate, Hyaluronan).\n• Biomarkers of degradation: Elevated plasma Syndecan-1 and Heparan sulfate.\n• Causes of shedding: Sepsis, ANP (triggered by rapid hypervolemic crystalloid boluses), trauma, ischemia-reperfusion.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Physiology",
      "Endothelial Glycocalyx"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Syndecan-1",
    "verified_answer": "A",
    "verified_answer_text": "Syndecan-1",
    "concept_tested": "Endothelial glycocalyx physiology and biomarkers of vascular barrier breakdown in critical illness",
    "high_yield_takeaway": [
      "Syndecan-1 is the primary clinical biomarker reflecting endothelial glycocalyx shedding and capillary leak.",
      "Rapid hypervolemia stimulates ANP release, triggering glycocalyx degradation."
    ],
    "sources": [
      SOURCE_LABEL,
      "Anesthesiology & Intensive Care Physiology Standards",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R014",
    "number": 14,
    "chapterId": 20,
    "chapter": "Endocrine & Metabolic Crises",
    "topicId": "cc-glycemic-control-icu",
    "subject": "Electrolytes & Metabolic",
    "subtopic": "ICU Blood Glucose Targets (NICE-SUGAR Trial)",
    "question": "Based on the landmark NICE-SUGAR trial and current international sepsis guidelines, what is the recommended target blood glucose range for critically ill adult patients receiving intravenous insulin therapy?",
    "options": [
      "80 to 110 mg/dL",
      "140 to 180 mg/dL",
      "180 to 220 mg/dL",
      "200 to 250 mg/dL"
    ],
    "answer": "B",
    "explanation": "The NICE-SUGAR multicenter randomized trial (6,104 patients) compared intensive insulin therapy (target 80–110 mg/dL) with conventional control (target 140–180 mg/dL). Intensive control resulted in higher 90-day mortality (27.5% vs 24.9%, p=0.02) and a significant increase in severe hypoglycemia (< 40 mg/dL, 6.8% vs 0.5%). Consequently, the Surviving Sepsis Campaign and major critical care societies endorse initiating insulin when blood glucose is > 180 mg/dL and targeting 140–180 mg/dL.",
    "whyWrong": {
      "A": "80 to 110 mg/dL was the Leuven trial target, which proved hazardous in the larger multicenter NICE-SUGAR trial due to lethal neuroglycopenic hypoglycemia.",
      "B": "Correct answer: 140 to 180 mg/dL represents the evidence-based optimal target balancing hyperglycemia control with hypoglycemia prevention.",
      "C": "180 to 220 mg/dL is too permissive and promotes glycosuria, dehydration, and impaired neutrophil phagocytosis.",
      "D": "200 to 250 mg/dL allows significant uncontrolled hyperglycemia."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Leuven study (2001, Van den Berghe): Monocentric surgical ICU, reported benefit of 80–110 mg/dL.\n• NICE-SUGAR (2009): Multicenter medical/surgical ICU, showed tight control (80–110) increased mortality and severe hypoglycemia.\n• Standard target today: 140–180 mg/dL, initiate insulin when BG > 180 mg/dL.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Electrolytes & Metabolic",
      "Glycemic Control"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "140 to 180 mg/dL",
    "verified_answer": "B",
    "verified_answer_text": "140 to 180 mg/dL",
    "concept_tested": "Evidence base for glycemic control in critical illness from Leuven to NICE-SUGAR",
    "high_yield_takeaway": [
      "NICE-SUGAR demonstrated increased mortality with tight glucose control (80-110 mg/dL).",
      "Current international target is 140-180 mg/dL."
    ],
    "sources": [
      SOURCE_LABEL,
      "NICE-SUGAR Study Group NEJM",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R015",
    "number": 15,
    "chapterId": 11,
    "chapter": "Cardiac Critical Care & Acute Coronary Syndromes",
    "topicId": "cc-chronic-thromboembolic-pulmonary-hypertension",
    "subject": "Cardiovascular Critical Care",
    "subtopic": "CTEPH Diagnostic Gold Standards",
    "question": "A 48-year-old male with a history of unprovoked pulmonary embolism 6 months ago presents with progressive dyspnea on exertion. Echocardiography suggests pulmonary hypertension. What is the most sensitive screening imaging modality to rule out Chronic Thromboembolic Pulmonary Hypertension (CTEPH)?",
    "options": [
      "Ventilation-Perfusion (V/Q) lung scan",
      "Chest radiography",
      "High-resolution CT (HRCT) of the chest",
      "Serum D-dimer assay"
    ],
    "answer": "A",
    "explanation": "A planar Ventilation-Perfusion (V/Q) lung scan is the recommended screening test of choice for Chronic Thromboembolic Pulmonary Hypertension (CTEPH), with a sensitivity of 96–97% and specificity > 90%. A normal V/Q scan completely rules out CTEPH. While CT pulmonary angiography (CTPA) is essential for surgical planning (pulmonary endarterectomy) and characterization of webs/bands, a normal CTPA does not definitively exclude distal CTEPH where V/Q scan remains superior.",
    "whyWrong": {
      "A": "Correct answer: V/Q scan has the highest diagnostic sensitivity (96-99%) and is the mandatory initial screening modality for CTEPH.",
      "B": "Chest radiography is non-specific, showing only enlarged pulmonary arteries or right ventricular enlargement.",
      "C": "HRCT assesses interstitial lung disease; it is not the vascular screening modality for CTEPH.",
      "D": "D-dimer has no role in ruling out chronic organized thrombi in CTEPH."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• CTEPH definition: Mean PAP > 20 mmHg, PCWP ≤ 15 mmHg, PVR > 2 Wood Units, with chronic organized fibrotic thromboemboli after ≥ 3 months of therapeutic anticoagulation.\n• Screening: V/Q scan is more sensitive than CTPA (normal V/Q rules out CTEPH).\n• Definitive hemodynamic confirmation: Right heart catheterization.\n• Treatment of choice: Pulmonary Endarterectomy (PEA).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Cardiovascular Critical Care",
      "CTEPH & Pulmonary Hypertension"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Ventilation-Perfusion (V/Q) lung scan",
    "verified_answer": "A",
    "verified_answer_text": "Ventilation-Perfusion (V/Q) lung scan",
    "concept_tested": "Diagnostic imaging algorithm and screening sensitivity in Chronic Thromboembolic Pulmonary Hypertension",
    "high_yield_takeaway": [
      "V/Q scan is the most sensitive screening investigation for CTEPH (>96% sensitivity).",
      "A normal V/Q scan reliably rules out CTEPH."
    ],
    "sources": [
      SOURCE_LABEL,
      "ESC/ERS Guidelines for the Diagnosis and Treatment of Pulmonary Hypertension",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R016",
    "number": 16,
    "chapterId": 5,
    "chapter": "Sepsis, Septic Shock & Host Response (2026 SSC)",
    "topicId": "cc-sepsis-screening-tools",
    "subject": "Sepsis",
    "subtopic": "Sepsis Bedside Screening Scores",
    "question": "In the updated Surviving Sepsis Campaign guidelines, which bedside screening tool is recommended over quick SOFA (qSOFA) for detecting sepsis and deteriorating patients outside the ICU?",
    "options": [
      "National Early Warning Score (NEWS or NEWS2)",
      "Systemic Inflammatory Response Syndrome (SIRS) criteria alone",
      "APACHE II score",
      "Glasgow Coma Scale alone"
    ],
    "answer": "A",
    "explanation": "The Surviving Sepsis Campaign guidelines recommend against using qSOFA as a single screening tool for sepsis due to its poor sensitivity (poor sensitivity leads to missed/delayed sepsis recognition). Instead, guidelines recommend using comprehensive early warning systems such as the National Early Warning Score (NEWS / NEWS2) or Modified Early Warning Score (MEWS), which exhibit substantially higher sensitivity for detecting clinical deterioration and sepsis.",
    "whyWrong": {
      "A": "Correct answer: NEWS / NEWS2 has higher sensitivity and is recommended over qSOFA for early detection of deteriorating ward patients.",
      "B": "SIRS criteria lack specificity, although they remain sensitive.",
      "C": "APACHE II is an ICU mortality prediction model calculated at 24 hours, not a bedside rapid screening triage tool.",
      "D": "GCS assesses only neurological status, ignoring hemodynamic and respiratory parameters."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• qSOFA: RR ≥ 22, Altered mental status (GCS < 15), SBP ≤ 100 mmHg. High specificity, but poor sensitivity (~50%); no longer recommended as single screening tool.\n• NEWS2: Incorporates RR, SpO2, supplemental oxygen, temperature, SBP, heart rate, and consciousness. Highly sensitive for early sepsis detection.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Sepsis",
      "Screening Tools"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "National Early Warning Score (NEWS or NEWS2)",
    "verified_answer": "A",
    "verified_answer_text": "National Early Warning Score (NEWS or NEWS2)",
    "concept_tested": "De-emphasis of qSOFA and adoption of NEWS2/MEWS in modern sepsis screening algorithms",
    "high_yield_takeaway": [
      "qSOFA has low sensitivity and should not be used as a standalone screening tool.",
      "NEWS2/MEWS early warning scores are endorsed for early sepsis identification."
    ],
    "sources": [
      SOURCE_LABEL,
      "Surviving Sepsis Campaign Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R017",
    "number": 17,
    "chapterId": 30,
    "chapter": "Extracorporeal Membrane Oxygenation (ECMO) & ECPR",
    "topicId": "cc-ecmo-monitoring-and-troubleshooting",
    "subject": "ICU Procedures & Monitoring",
    "subtopic": "ECMO Transmembrane Pressure Elevation",
    "question": "A patient on venovenous (VV) ECMO for severe ARDS develops a progressive increase in the transmembrane pressure (TMP = Ppre-membrane − Ppost-membrane) from 20 mmHg to 90 mmHg over 12 hours, accompanied by a rising plasma free hemoglobin and falling platelet count. What is the primary cause?",
    "options": [
      "Access cannula drainage insufficiency",
      "Clot formation and thrombosis within the membrane oxygenator",
      "Recirculation fraction elevation",
      "Severe systemic vasodilation"
    ],
    "answer": "B",
    "explanation": "Transmembrane pressure (TMP) represents the pressure gradient across the membrane oxygenator (Ppre-membrane − Ppost-membrane). Under normal conditions, TMP is < 30–50 mmHg depending on sweep and blood flow. A progressive, significant elevation in TMP (often > 50–60 mmHg) indicates increased resistance to blood flow within the oxygenator hollow fibers, pathognomonic of oxygenator thrombosis / clot formation. This causes mechanical shear stress, hemolysis (elevated plasma free Hb), consumptive thrombocytopenia, and oxygenator failure, necessitating emergency circuit/oxygenator exchange.",
    "whyWrong": {
      "A": "Access cannula drainage insufficiency manifests as negative drainage pressure (Ppre-pump becoming excessively negative, e.g. < -100 mmHg) and circuit chattering, not elevated TMP.",
      "B": "Correct answer: Oxygenator thrombosis increases internal resistance, driving up TMP and causing shear-induced hemolysis and thrombocytopenia.",
      "C": "Recirculation increases venous oxygen saturation in the drainage limb (SpreO2) but does not alter physical resistance across the oxygenator fibers.",
      "D": "Systemic vasodilation affects arterial blood pressure, not intrinsic oxygenator transmembrane resistance."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• ECMO Pressures: P1 (pre-pump / drainage: negative, normal -20 to -60 mmHg); P2 (pre-membrane: positive); P3 (post-membrane: lower than P2).\n• TMP = P2 − P3. Rising TMP (> 50–60 mmHg) = Oxygenator thrombosis.\n• Signs of failing oxygenator: High TMP, impaired gas transfer (drop in post-membrane PaO2), rising D-dimer, drop in platelets, and hemolysis.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "ICU Procedures & Monitoring",
      "ECMO Troubleshooting"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Clot formation and thrombosis within the membrane oxygenator",
    "verified_answer": "B",
    "verified_answer_text": "Clot formation and thrombosis within the membrane oxygenator",
    "concept_tested": "Pathophysiology and pressure profile interpretation in ECMO oxygenator thrombosis",
    "high_yield_takeaway": [
      "Elevated transmembrane pressure (TMP) indicates increased flow resistance from clot accumulation inside the oxygenator.",
      "Hallmarks include elevated TMP, hemolysis, consumptive thrombocytopenia, and impaired gas transfer."
    ],
    "sources": [
      SOURCE_LABEL,
      "ELSO Guidelines for ECMO Circuit Monitoring and Troubleshooting",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R018",
    "number": 18,
    "chapterId": 29,
    "chapter": "Critical Care Ultrasound & Echocardiography (POCUS)",
    "topicId": "cc-thoracic-ultrasound-pneumothorax",
    "subject": "Radiology",
    "subtopic": "Pneumothorax Ultrasound Signs",
    "question": "On bedside thoracic point-of-care ultrasound (POCUS), which of the following findings has a 100% specificity for the diagnosis of pneumothorax?",
    "options": [
      "Absence of lung sliding",
      "Absence of B-lines",
      "Identification of the 'Lung Point' sign",
      "Presence of the 'Barcode' (Stratosphere) sign on M-mode"
    ],
    "answer": "C",
    "explanation": "The 'Lung Point' sign is the pathognomonic ultrasound finding for pneumothorax, with virtually 100% specificity. It represents the physical transition zone at the margin of the pneumothorax where normal sliding lung (seashore sign) periodically alternates with motionless, air-separated parietal pleura (stratosphere/barcode sign) during respiratory excursion. In contrast, absence of lung sliding has high sensitivity (95–100%) but lower specificity (can occur in severe ARDS, consolidation, apnea, pleurodesis, and mainstem intubation).",
    "whyWrong": {
      "A": "Absence of lung sliding is sensitive but not specific; it occurs in pleurodesis, massive atelectasis, severe ARDS, apnea, and endobronchial intubation.",
      "B": "Absence of B-lines is non-specific; B-lines rule out pneumothorax at that interspace, but their absence alone is seen in normal dry lung.",
      "C": "Correct answer: Lung point has 100% specificity for pneumothorax.",
      "D": "Barcode / stratosphere sign on M-mode indicates absence of motion, but like absent sliding, can be seen in pleurodesis and severe emphysema."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Lung Point: Pathognomonic sign of pneumothorax (100% specific). Absent in total lung collapse.\n• Lung sliding: Sensitive for ruling out pneumothorax (NPV ~100%).\n• B-lines & Lung Pulse: Rules out pneumothorax at that specific rib space.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Radiology",
      "Point-of-Care Ultrasound (POCUS)"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "C",
    "speaker_answer_text": "Identification of the 'Lung Point' sign",
    "verified_answer": "C",
    "verified_answer_text": "Identification of the 'Lung Point' sign",
    "concept_tested": "Sensitivity versus specificity of sonographic signs in thoracic ultrasound for pneumothorax",
    "high_yield_takeaway": [
      "Lung Point is 100% specific for pneumothorax on lung ultrasound.",
      "Absence of lung sliding is sensitive but non-specific."
    ],
    "sources": [
      SOURCE_LABEL,
      "International Evidence-Based Recommendations for Point-of-Care Lung Ultrasound",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R019",
    "number": 19,
    "chapterId": 15,
    "chapter": "Neurocritical Care & Raised ICP Management",
    "topicId": "cc-myasthenia-gravis-crisis",
    "subject": "Neurocritical Care",
    "subtopic": "Myasthenia Gravis Clinical Presentation & Diagnosis",
    "question": "A 65-year-old female with a 10-year history of rheumatoid arthritis presents with progressive bilateral ptosis, diplopia, and generalized proximal muscle weakness that characteristically worsens toward the evening and improves after resting. Physical examination demonstrates intact deep tendon reflexes and preserved sensory examination. What is the most likely diagnosis?",
    "options": [
      "Myasthenia Gravis",
      "Guillain-Barré Syndrome (GBS)",
      "Lambert-Eaton Myasthenic Syndrome (LEMS)",
      "Polymyositis"
    ],
    "answer": "A",
    "explanation": "The clinical picture of fluctuating, fatigable weakness (ptosis, diplopia, proximal weakness) that worsens with exertion/evening and improves with rest, in a patient with a known autoimmune disorder (rheumatoid arthritis), with completely normal deep tendon reflexes and normal sensory examination, is classic for Myasthenia Gravis (MG). In Lambert-Eaton syndrome, reflexes are typically depressed/absent and improve with exercise, and autonomic symptoms are prominent. In GBS, areflexia is hallmark.",
    "whyWrong": {
      "A": "Correct answer: Fatigable weakness with normal reflexes, cranial nerve involvement (ptosis), and preserved sensation is diagnostic of Myasthenia Gravis.",
      "B": "GBS presents with ascending paralysis, early loss of deep tendon reflexes (areflexia), and frequent sensory paresthesias.",
      "C": "Lambert-Eaton features absent or diminished reflexes that facilitate post-exercise, dry mouth, and lower extremity predominance.",
      "D": "Polymyositis causes symmetric proximal muscle weakness and tenderness, elevated CK, and lacks ocular muscle involvement (ptosis/diplopia)."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Myasthenia Gravis: Post-synaptic AChR antibodies (85%) or MuSK (10-15%). Fatigable ptosis/diplopia, normal reflexes, normal pupils.\n• Diagnostic tests: Ice pack test, repetitive nerve stimulation (decremental response > 10%), single-fiber EMG (most sensitive).\n• Myasthenic crisis trigger: Infections, aminoglycosides, beta-blockers, fluoroquinolones.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Neurocritical Care",
      "Neuromuscular Junction Disorders"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Myasthenia Gravis",
    "verified_answer": "A",
    "verified_answer_text": "Myasthenia Gravis",
    "concept_tested": "Clinical presentation and diagnostic discrimination of myasthenia gravis from other neuromuscular disorders",
    "high_yield_takeaway": [
      "Fatigable weakness, ptosis, intact deep tendon reflexes, and normal sensory exam are hallmarks of myasthenia gravis.",
      "Frequently coexists with other autoimmune diseases."
    ],
    "sources": [
      SOURCE_LABEL,
      "Myasthenia Gravis Foundation of America Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R020",
    "number": 20,
    "chapterId": 15,
    "chapter": "Neurocritical Care & Raised ICP Management",
    "topicId": "cc-brain-death-determination",
    "subject": "Neurocritical Care",
    "subtopic": "Ancillary Testing in Brain Death (EEG)",
    "question": "When electroencephalography (EEG) is utilized as an ancillary confirmatory test for the determination of brain death in an adult, which of the following electrical patterns must be demonstrated?",
    "options": [
      "Burst suppression pattern with inter-burst intervals > 10 seconds",
      "Electrocerebral inactivity (electrocerebral silence) with no electrical activity > 2 microvolts",
      "Continuous diffuse delta-theta slowing",
      "Triphasic waves with fronto-occipital phase lag"
    ],
    "answer": "B",
    "explanation": "According to the American Academy of Neurology (AAN) and international brain death guidelines, when EEG is used as an ancillary test for brain death, it must demonstrate electrocerebral inactivity (ECI) or electrocerebral silence (ECS). ECI is defined as no electrical activity greater than 2 microvolts when recording from scalp electrode pairs at least 10 cm apart, using standard 10–20 electrode montage and high-sensitivity settings for a minimum of 30 minutes, with no response to intense somatosensory or auditory stimulation.",
    "whyWrong": {
      "A": "Burst suppression reflects deep cortical depression (seen in hypothermia, high-dose propofol/barbiturates, or postanoxic injury), but represents viable cortical neurons and is NOT brain death.",
      "B": "Correct answer: Electrocerebral inactivity (< 2 µV) is mandatory for brain death confirmation on EEG.",
      "C": "Continuous delta-theta slowing indicates non-specific encephalopathy with intact cerebral electrical generation.",
      "D": "Triphasic waves are characteristic of metabolic (e.g., hepatic or uremic) or toxic encephalopathy."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Brain death is fundamentally a clinical diagnosis (coma, absent brainstem reflexes, positive apnea test).\n• Ancillary tests (mandatory if apnea test unsafe or clinical exam incomplete): 4-vessel cerebral angiography (absent flow), radionuclide SPECT (empty light bulb sign), CTA/MRA, TCD (reverberating / oscillating flow or small systolic spikes), and EEG (electrocerebral inactivity < 2 µV).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Neurocritical Care",
      "Brain Death Determination"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Electrocerebral inactivity (electrocerebral silence) with no electrical activity > 2 microvolts",
    "verified_answer": "B",
    "verified_answer_text": "Electrocerebral inactivity (electrocerebral silence) with no electrical activity > 2 microvolts",
    "concept_tested": "Criteria and neurophysiological findings of ancillary EEG testing in brain death determination",
    "high_yield_takeaway": [
      "Electrocerebral inactivity (< 2 microvolts) on EEG is required to confirm brain death.",
      "Burst suppression pattern represents viable cortex and is not brain death."
    ],
    "sources": [
      SOURCE_LABEL,
      "AAN Updated Guidelines for Brain Death Determination",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  }
];

module.exports = { questions1To20 };
