/**
 * Part 3 of INI-CET SS 2026 Critical Care Recall Bank (Questions 41 to 56)
 * Extracted from Marrow Super Speciality INI-SS April 2026 Recall Session (YouTube eEJF3CC5Qx8)
 */

const SOURCE_URL = "https://youtu.be/eEJF3CC5Qx8";
const SOURCE_LABEL = "Marrow Super Speciality INI-SS April 2026 Recall Session (YouTube eEJF3CC5Qx8)";

const questions41To56 = [
  {
    "id": "INICET-SS-2026-CC-R041",
    "number": 41,
    "chapterId": 20,
    "chapter": "Endocrine & Metabolic Crises",
    "topicId": "cc-hyperkalemia-cardiac-membrane-stabilization",
    "subject": "Electrolytes & Metabolic",
    "subtopic": "Hyperkalemia Cardiac Membrane Stabilization",
    "question": "A 60-year-old ESRD patient presents with severe hyperkalemia (serum potassium 7.6 mEq/L). The ECG displays wide QRS complexes, peaked T waves, and loss of P waves. According to ERC/AHA resuscitation guidelines, what is the immediate first-line medication to administer for cardiac membrane stabilization?",
    "options": [
      "Regular insulin 10 units IV with 50 mL of 50% dextrose",
      "Intravenous calcium (10 mL of 10% calcium chloride or 30 mL of 10% calcium gluconate)",
      "Sodium polystyrene sulfonate (Kayexalate) orally",
      "Nebulized albuterol (salbutamol) 10–20 mg"
    ],
    "answer": "B",
    "explanation": "In severe hyperkalemia with ECG changes (peaked T waves, PR prolongation, wide QRS, sine-wave pattern), the immediate priority is to antagonize potassium's cardiotoxic effects on cardiac myocytes by administering intravenous calcium (10 mL of 10% calcium chloride or 30 mL of 10% calcium gluconate over 2–5 minutes). Calcium raises the action potential threshold potential toward normal, restoring the normal difference between resting membrane potential and threshold, thereby immediately stabilizing the myocyte membrane and preventing ventricular fibrillation/asystole within 1–3 minutes. It does not lower serum potassium; intracellular shifting agents (insulin/dextrose, salbutamol) must follow immediately.",
    "whyWrong": {
      "A": "Insulin/dextrose shifts potassium intracellularly, but takes 15–30 minutes to begin acting and does not provide instantaneous membrane stabilization.",
      "B": "Correct answer: IV Calcium acts within 1-3 minutes to stabilize the cardiac membrane and prevent fatal dysrhythmias.",
      "C": "Potassium binders take hours to days to eliminate potassium through the colon.",
      "D": "Inhaled beta-2 agonists take 15–30 minutes to lower potassium and are adjuncts to insulin, not the initial membrane stabilizer."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Hyperkalemia Management Hierarchy:\n  1. Membrane Stabilization (immediate, lasts 30–60 min): IV Calcium (gluconate or chloride).\n  2. Intracellular Shift (acts in 15–30 min, lasts 4–6 hr): Insulin 10U + D50W 50 mL, Salbutamol 10–20 mg neb, NaHCO3 (only if metabolic acidosis).\n  3. Elimination (acts in hr): Loop diuretics, K+ binders (Patiromer, ZS-9), Hemodialysis (definitive workhorse).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Electrolytes & Metabolic",
      "Hyperkalemia Emergency Management"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Intravenous calcium (10% calcium chloride or calcium gluconate)",
    "verified_answer": "B",
    "verified_answer_text": "Intravenous calcium (10% calcium chloride or calcium gluconate)",
    "concept_tested": "Immediate cardiac membrane stabilization in life-threatening hyperkalemia",
    "high_yield_takeaway": [
      "IV calcium chloride or gluconate immediately stabilizes the myocardial membrane in hyperkalemia with ECG changes.",
      "Calcium does not alter serum potassium concentration."
    ],
    "sources": [
      SOURCE_LABEL,
      "ERC/AHA Guidelines for Resuscitation in Electrolyte Emergencies",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R042",
    "number": 42,
    "chapterId": 8,
    "chapter": "Invasive Mechanical Ventilation & Graphics",
    "topicId": "cc-auto-peep-measurement",
    "subject": "Mechanical Ventilation",
    "subtopic": "Auto-PEEP Measurement in Ventilated vs Spontaneously Breathing Patients",
    "question": "Which of the following statements regarding the measurement of intrinsic PEEP (auto-PEEP) is TRUE?",
    "options": [
      "Auto-PEEP can only be measured in paralyzed patients and cannot be evaluated in spontaneously breathing patients",
      "In mechanically ventilated, passively breathing or paralyzed patients, static auto-PEEP is measured by an end-expiratory occlusion hold, whereas in spontaneously breathing patients, an esophageal balloon catheter is required to measure dynamic auto-PEEP",
      "The end-expiratory occlusion hold reliably measures auto-PEEP during vigorous patient respiratory efforts",
      "Dynamic auto-PEEP is always higher than static auto-PEEP because it includes all slow lung units"
    ],
    "answer": "B",
    "explanation": "Static intrinsic PEEP (auto-PEEP) in mechanically ventilated patients is accurately measured using an end-expiratory occlusion hold (usually 2 to 3 seconds) on a passive, well-sedated or paralyzed patient. During occlusion, alveolar and airway pressures equilibrate across all lung units, allowing the ventilator transducer to measure total PEEP (auto-PEEP = Total PEEP − Set PEEP). However, in actively or spontaneously breathing patients, patient efforts distort the circuit pressure during the hold; therefore, an esophageal balloon catheter is required to measure dynamic auto-PEEP (defined as the negative esophageal pressure deflection before the onset of inspiratory flow). Dynamic auto-PEEP measures fast-emptying units and is typically lower than static auto-PEEP.",
    "whyWrong": {
      "A": "Auto-PEEP can be measured in spontaneously breathing patients using an esophageal balloon catheter.",
      "B": "Correct answer: End-expiratory hold requires passive breathing; spontaneous breathing necessitates esophageal balloon manometry.",
      "C": "Vigorous respiratory efforts invalidate the end-expiratory hold maneuver on the ventilator.",
      "D": "Dynamic auto-PEEP is typically lower than static auto-PEEP because it fails to capture pressure in slowly emptying alveolar compartments with long time constants."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Static auto-PEEP: Requires end-expiratory hold in a relaxed/paralyzed patient. Equilibrates fast and slow compartments.\n• Dynamic auto-PEEP in spontaneous breathing: Esophageal catheter measures negative ΔPes required to overcome intrinsic PEEP and trigger inspiratory flow.\n• Auto-PEEP causes patient-ventilator asynchrony (ineffective triggering).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Auto-PEEP Measurement"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Static auto-PEEP is measured by end-expiratory hold in passive patients; esophageal balloon is required in spontaneously breathing patients",
    "verified_answer": "B",
    "verified_answer_text": "Static auto-PEEP is measured by end-expiratory hold in passive patients; esophageal balloon is required in spontaneously breathing patients",
    "concept_tested": "Methods and physiological principles of measuring static versus dynamic auto-PEEP",
    "high_yield_takeaway": [
      "End-expiratory hold maneuver measures static auto-PEEP in passive patients.",
      "Esophageal manometry is required to quantify dynamic intrinsic PEEP during spontaneous breathing."
    ],
    "sources": [
      SOURCE_LABEL,
      "Tobin's Principles and Practice of Mechanical Ventilation",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R043",
    "number": 43,
    "chapterId": 19,
    "chapter": "Gastrointestinal, Hepatic & Abdominal Catastrophes",
    "topicId": "cc-stress-ulcer-prophylaxis",
    "subject": "Pharmacology & Oncology",
    "subtopic": "Stress Ulcer Prophylaxis Indications & Evidence (REVISE / PEPTIC)",
    "question": "Which of the following clinical conditions constitutes a major independent risk factor mandating stress ulcer prophylaxis (SUP) in critically ill ICU patients?",
    "options": [
      "Invasive mechanical ventilation anticipated for > 48 hours, or severe coagulopathy (platelets < 50,000/mcL, INR > 1.5, or aPTT > 2x control)",
      "Uncomplicated acute appendicitis undergoing laparoscopic surgery",
      "Isolated mild hypomagnesemia",
      "Age > 50 years without organ failure"
    ],
    "answer": "A",
    "explanation": "Classic risk stratification established by Cook et al. and confirmed by modern trials (PEPTIC and REVISE trials) demonstrates that two primary independent risk factors mandate stress ulcer prophylaxis in the ICU: (1) Invasive mechanical ventilation anticipated for > 48 hours, and (2) Pre-existing or acute severe coagulopathy (INR > 1.5, aPTT > 2x control, or platelet count < 50,000/mcL). In the absence of these major criteria (or multiple minor criteria such as severe burns > 35%, severe traumatic brain injury, septic shock), routine SUP is unnecessary and increases the risk of ventilator-associated pneumonia and Clostridioides difficile colitis.",
    "whyWrong": {
      "A": "Correct answer: Mechanical ventilation > 48 hours and coagulopathy are the two classic, validated independent indications for SUP.",
      "B": "Uncomplicated elective/minor surgery does not meet criteria for ICU stress ulcer prophylaxis.",
      "C": "Isolated electrolyte abnormalities are not indications for SUP.",
      "D": "Age alone without major illness does not warrant acid suppression."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Two major independent risk factors for clinically important GI bleeding: Mechanical ventilation > 48 hr, Coagulopathy.\n• PEPTIC Trial (JAMA 2020) & REVISE Trial (NEJM 2024): PPIs vs H2RAs show similar mortality and modest reduction in overt GI bleeding, with low baseline bleeding rates (~1–2%).\n• Discontinue SUP once patients are extubated and tolerating enteral feeds.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Pharmacology & Oncology",
      "Stress Ulcer Prophylaxis"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Invasive mechanical ventilation anticipated for > 48 hours, or severe coagulopathy",
    "verified_answer": "A",
    "verified_answer_text": "Invasive mechanical ventilation anticipated for > 48 hours, or severe coagulopathy",
    "concept_tested": "Independent indications for stress ulcer prophylaxis in critically ill adult patients",
    "high_yield_takeaway": [
      "Mechanical ventilation > 48 hours and severe coagulopathy are the two major indications for stress ulcer prophylaxis.",
      "Indiscriminate prophylaxis carries risks of nosocomial infection and C. difficile."
    ],
    "sources": [
      SOURCE_LABEL,
      "Surviving Sepsis Campaign Guidelines & REVISE Trial NEJM 2024",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R044",
    "number": 44,
    "chapterId": 8,
    "chapter": "Invasive Mechanical Ventilation & Graphics",
    "topicId": "cc-respiratory-time-constant",
    "subject": "Mechanical Ventilation",
    "subtopic": "Calculation of Respiratory Time Constant",
    "question": "A mechanically ventilated patient with COPD has a total respiratory system compliance (Crs) of 100 mL/cmH2O (0.1 L/cmH2O) and an inspiratory airway resistance (R) of 20 cmH2O/L/s. What is the respiratory time constant (τ, Tau), and what percentage of passive lung volume is exhaled after 3 time constants?",
    "options": [
      "Time constant = 2.0 seconds; 95% of volume exhaled",
      "Time constant = 0.2 seconds; 50% of volume exhaled",
      "Time constant = 5.0 seconds; 63% of volume exhaled",
      "Time constant = 0.5 seconds; 99% of volume exhaled"
    ],
    "answer": "A",
    "explanation": "The respiratory time constant (τ, Tau) is the product of respiratory compliance and resistance: τ = Compliance × Resistance. Converting compliance to Liters: Crs = 100 mL/cmH2O = 0.1 L/cmH2O. Airway resistance R = 20 cmH2O/L/s. Therefore: τ = 0.1 L/cmH2O × 20 cmH2O/L/s = 2.0 seconds. Under exponential lung emptying: 1 time constant (1τ) empties 63.2% of the tidal volume; 2 time constants (2τ) empty 86.5%; 3 time constants (3τ = 6.0 seconds) empty 95.0%; and 4–5 time constants (8–10 seconds) empty > 98–99%. In COPD, a prolonged time constant (2.0 s) dictates that expiratory time must be at least 6 to 8 seconds to prevent breath-stacking and auto-PEEP.",
    "whyWrong": {
      "A": "Correct answer: τ = 0.1 × 20 = 2.0 seconds, and 3τ corresponds to 95% volume exhalation.",
      "B": "0.2 seconds is an arithmetic error by a factor of 10, and 50% corresponds to half-life (t1/2 = 0.693τ), not 3τ.",
      "C": "5.0 seconds is incorrect compliance/resistance inversion.",
      "D": "0.5 seconds is the time constant of a stiff ARDS lung, not an obstructed COPD lung."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Time Constant Formula: τ = Crs × Raw (Units: L/cmH2O × cmH2O/L/sec = seconds).\n• Exponential Emptying: 1τ = 63% exhaled; 2τ = 86% exhaled; 3τ = 95% exhaled; 4τ = 98% exhaled; 5τ = 99.3% exhaled.\n• Normal lung: τ ~ 0.5 s (exhalation complete in ~2.0 s).\n• ARDS lung: Low compliance -> Short τ (< 0.3 s, fast emptying).\n• COPD/Asthma: High resistance -> Long τ (> 1.5–2.0 s, requires long Te > 6 s).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Respiratory Time Constant & Physics"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Time constant = 2.0 seconds; 95% of volume exhaled",
    "verified_answer": "A",
    "verified_answer_text": "Time constant = 2.0 seconds; 95% of volume exhaled",
    "concept_tested": "Calculation and clinical physiological application of the respiratory time constant in mechanical ventilation",
    "high_yield_takeaway": [
      "Time constant τ equals Compliance multiplied by Resistance (τ = Crs × R).",
      "Three time constants are required to exhale 95% of the tidal volume."
    ],
    "sources": [
      SOURCE_LABEL,
      "Nunn's Applied Respiratory Physiology",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R045",
    "number": 45,
    "chapterId": 24,
    "chapter": "Polytrauma & Damage Control Resuscitation",
    "topicId": "cc-blunt-abdominal-trauma-fast",
    "subject": "Trauma & Burns",
    "subtopic": "FAST Positive in Hemodynamically Stable Trauma",
    "question": "A 26-year-old male is brought to the resuscitation bay following a motor vehicle collision with blunt torso trauma. His vital signs show heart rate 98 bpm, blood pressure 124/82 mmHg, and GCS 15. An extended focused assessment with sonography for trauma (eFAST) is positive for free fluid in Morison's pouch. What is the most appropriate next step in management?",
    "options": [
      "Immediate emergency exploratory laparotomy in the operating room",
      "Contrast-enhanced computed tomography (CECT) of the abdomen and pelvis",
      "Diagnostic peritoneal lavage (DPL)",
      "Discharge home after 4 hours of observation"
    ],
    "answer": "B",
    "explanation": "In blunt abdominal trauma, eFAST rapidly identifies hemoperitoneum. However, management is dictated entirely by hemodynamic stability: (1) If the patient is hemodynamically UNSTABLE with a positive FAST, immediate exploratory laparotomy is indicated without delaying for imaging; (2) If the patient is hemodynamically STABLE (as in this patient with BP 124/82 and HR 98) with a positive FAST, the gold-standard next step is Contrast-Enhanced Computed Tomography (CECT) of the abdomen and pelvis. CECT accurately identifies the injured solid organ, grades injury severity, identifies active arterial blush/extravasation (amenable to angioembolization), and guides non-operative management (NOM).",
    "whyWrong": {
      "A": "Immediate exploratory laparotomy in a stable patient leads to high rates of non-therapeutic laparotomy; stable solid organ injuries are managed non-operatively.",
      "B": "Correct answer: CECT abdomen/pelvis is the standard diagnostic imaging of choice for hemodynamically stable blunt trauma with positive FAST.",
      "C": "DPL is an invasive historical test rarely used today, superseded by eFAST and CT.",
      "D": "Discharge is unsafe; hemoperitoneum requires solid organ injury grading and admission."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Blunt Trauma Algorithm:\n  • FAST (+) + Unstable -> Operating Room (Exploratory Laparotomy).\n  • FAST (+) + Stable -> CECT Abdomen & Pelvis (determines Non-Operative Management vs Angioembolization).\n  • FAST (-) + Unstable -> Rule out other shock sources (pelvic binder, chest tube, re-FAST).\n  • FAST (-) + Stable -> Serial exams / CT if high clinical suspicion.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Trauma & Burns",
      "eFAST & Trauma Resuscitation"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Contrast-enhanced computed tomography (CECT) of the abdomen and pelvis",
    "verified_answer": "B",
    "verified_answer_text": "Contrast-enhanced computed tomography (CECT) of the abdomen and pelvis",
    "concept_tested": "Management algorithm for hemodynamically stable versus unstable blunt trauma with positive FAST",
    "high_yield_takeaway": [
      "Hemodynamically stable blunt trauma patients with positive FAST should proceed to contrast-enhanced CT of the abdomen.",
      "Laparotomy is reserved for hemodynamically unstable patients with free fluid."
    ],
    "sources": [
      SOURCE_LABEL,
      "ATLS Advanced Trauma Life Support 10th Edition",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R046",
    "number": 46,
    "chapterId": 18,
    "chapter": "Severe ICU Infections & Antimicrobial Stewardship",
    "topicId": "cc-clostridioides-difficile-infection",
    "subject": "Infectious Diseases",
    "subtopic": "Clostridioides difficile First-Line Therapy (IDSA Guidelines)",
    "question": "According to the updated IDSA/SHEA clinical practice guidelines for an initial episode of Clostridioides difficile infection (CDI) in adults, which oral antimicrobial is recommended as the preferred first-line therapy over oral vancomycin?",
    "options": [
      "Fidaxomicin (200 mg PO BID for 10 days)",
      "Oral Metronidazole (500 mg PO TID)",
      "Intravenous Vancomycin",
      "Ciprofloxacin"
    ],
    "answer": "A",
    "explanation": "In the updated IDSA/SHEA guidelines, oral fidaxomicin (200 mg twice daily for 10 days) is the preferred initial treatment for an episode of Clostridioides difficile infection (CDI). Fidaxomicin is a bactericidal macrocyclic antibiotic with a narrow antimicrobial spectrum that preserves normal intestinal anaerobic microbiota, resulting in sustained clinical response and significantly lower recurrence rates compared to vancomycin. Oral vancomycin (125 mg 4 times daily) remains an acceptable alternative where fidaxomicin is unavailable. Oral metronidazole is no longer recommended as first-line due to high recurrence and lower cure rates.",
    "whyWrong": {
      "A": "Correct answer: Fidaxomicin is the preferred agent endorsed by IDSA guidelines due to lower recurrence rates.",
      "B": "Metronidazole is relegated to an alternative only when vancomycin and fidaxomicin are unavailable.",
      "C": "Intravenous vancomycin is not excreted into the colonic lumen and is completely ineffective for luminal C. difficile colitis.",
      "D": "Ciprofloxacin is a fluoroquinolone that triggers C. difficile infection by destroying normal flora."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Initial CDI Episode: Fidaxomicin 200 mg BID x 10 days (preferred) OR Vancomycin 125 mg QID x 10 days.\n• Severe Fulminant CDI (shock, ileus, megacolon): High-dose oral Vancomycin (500 mg Q6H via NG tube + retention enemas) PLUS IV Metronidazole (500 mg Q8H).\n• Recurrent CDI: Bezlotoxumab (anti-toxin B monoclonal antibody) or Fecal Microbiota Transplantation (FMT for ≥ 2 recurrences).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Infectious Diseases",
      "Clostridioides difficile Infection"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Fidaxomicin (200 mg PO BID for 10 days)",
    "verified_answer": "A",
    "verified_answer_text": "Fidaxomicin (200 mg PO BID for 10 days)",
    "concept_tested": "Current IDSA/SHEA preferred first-line antimicrobial recommendations for Clostridioides difficile infection",
    "high_yield_takeaway": [
      "Fidaxomicin is preferred over vancomycin for initial CDI due to significantly reduced disease recurrence.",
      "Metronidazole is no longer recommended as first-line therapy."
    ],
    "sources": [
      SOURCE_LABEL,
      "IDSA/SHEA Focused Update on Clostridioides difficile Infection in Adults",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R047",
    "number": 47,
    "chapterId": 6,
    "chapter": "Acute Respiratory Failure & Mechanics",
    "topicId": "cc-nebulization-aerosol-mechanics",
    "subject": "Pharmacology & ICU Procedures",
    "subtopic": "Aerosol Particle Size & Lower Airway Deposition",
    "question": "For inhaled aerosol therapy and nebulization, what Mass Median Aerodynamic Diameter (MMAD) particle size range is optimal for therapeutic drug deposition in the human lower respiratory tract and bronchioles?",
    "options": [
      "1 to 5 microns (µm)",
      "> 15 microns (µm)",
      "< 0.5 microns (µm)",
      "25 to 50 microns (µm)"
    ],
    "answer": "A",
    "explanation": "Aerosol particle deposition in the respiratory tract is strictly governed by particle diameter (MMAD): (1) Particles > 10 µm impact in the oropharynx and upper airway; (2) Particles between 5 and 10 µm deposit in the large conducting airways (trachea and main bronchi); (3) Particles between 1 and 5 µm achieve optimal deposition in the lower airways, medium/small bronchioles, and terminal airways via sedimentation; and (4) Ultra-fine particles < 0.5 µm remain suspended like a gas and are largely exhaled without deposition. Therefore, 1 to 5 µm is the target size for bronchodilators and inhaled corticosteroids.",
    "whyWrong": {
      "A": "Correct answer: 1 to 5 microns is the respirable fraction depositing in small airways and bronchioles.",
      "B": "> 15 microns particles impact almost exclusively in the oropharynx, mouth, and upper larynx.",
      "C": "< 0.5 microns particles remain in suspension through Brownian motion and are exhaled without therapeutic benefit.",
      "D": "25 to 50 microns represents nasal sprays designed for localized nasal mucosal deposition."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Aerosol Mechanics:\n  • > 10 µm: Upper airway / oropharyngeal impaction (inertial impaction).\n  • 5–10 µm: Tracheobronchial conducting airways.\n  • 1–5 µm: Lower airways and bronchioles (gravitational sedimentation) — OPTIMAL RESPIRABLE FRACTION.\n  • < 1 µm (especially < 0.5 µm): Diffusion / Brownian motion, ~80% exhaled.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Pharmacology & Oncology",
      "Aerosol Therapy & Respiratory Mechanics"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "1 to 5 microns (µm)",
    "verified_answer": "A",
    "verified_answer_text": "1 to 5 microns (µm)",
    "concept_tested": "Aerodynamic particle size distribution and respiratory deposition mechanics for aerosolized medications",
    "high_yield_takeaway": [
      "Mass Median Aerodynamic Diameter (MMAD) between 1 and 5 microns provides optimal deposition in lower airways.",
      "Particles > 10 microns impact in the upper pharynx."
    ],
    "sources": [
      SOURCE_LABEL,
      "American College of Chest Physicians Aerosol Therapy Consensus",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R048",
    "number": 48,
    "chapterId": 9,
    "chapter": "Acute Respiratory Distress Syndrome (ARDS)",
    "topicId": "cc-transpulmonary-pressure-monitoring",
    "subject": "Mechanical Ventilation",
    "subtopic": "Transpulmonary Pressure Targets in ARDS",
    "question": "When utilizing esophageal manometry (Pes) as a surrogate for pleural pressure in severe ARDS, what is the recommended upper limit of end-inspiratory transpulmonary pressure (P_L,insp = Pplat − Pes,insp) to prevent alveolar hyperinflation and barotrauma?",
    "options": [
      "< 20 to 25 cmH2O",
      "< 5 cmH2O",
      "< 45 cmH2O",
      "< 60 cmH2O"
    ],
    "answer": "A",
    "explanation": "Transpulmonary pressure (P_L) represents the true distending stress applied directly across the lung parenchyma, independent of chest wall elastance, calculated as airway pressure minus pleural pressure (approximated by esophageal balloon pressure: P_L = Paw − Pes). In conditions with stiff chest walls (obesity, intra-abdominal hypertension), high airway plateau pressures (e.g., 34 cmH2O) may reflect chest wall stiffness rather than lung hyperdistension. Guidelines recommend titrating ventilation to keep end-inspiratory transpulmonary pressure < 20 to 25 cmH2O to prevent stress-induced barotrauma, and end-expiratory P_L between 0 and +5 cmH2O to prevent cyclical alveolar collapse/atelectrauma.",
    "whyWrong": {
      "A": "Correct answer: End-inspiratory transpulmonary pressure < 20-25 cmH2O prevents lung overdistension and VILI.",
      "B": "< 5 cmH2O is the target for end-expiratory transpulmonary pressure, not inspiratory pressure.",
      "C": "< 45 cmH2O is excessively high and causes alveolar rupture and pneumothorax.",
      "D": "< 60 cmH2O causes gross barotrauma and pulmonary edema."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Transpulmonary Pressure: P_L = Paw − Ppl (using Pes as surrogate).\n• Targets in ARDS:\n  • End-Inspiratory P_L: Maintain < 20–25 cmH2O (prevents overdistension/volutrauma).\n  • End-Expiratory P_L: Maintain > 0 to +5 cmH2O (prevents end-expiratory alveolar collapse/atelectrauma).\n• Especially valuable in obese patients and abdominal compartment syndrome where chest wall elastance is elevated.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Transpulmonary Pressure & Esophageal Manometry"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "< 20 to 25 cmH2O",
    "verified_answer": "A",
    "verified_answer_text": "< 20 to 25 cmH2O",
    "concept_tested": "Physiological targets for end-inspiratory and end-expiratory transpulmonary pressure monitoring in ARDS",
    "high_yield_takeaway": [
      "End-inspiratory transpulmonary pressure should be kept < 20-25 cmH2O to avoid overdistension.",
      "End-expiratory transpulmonary pressure should remain positive (> 0 cmH2O) to prevent atelectrauma."
    ],
    "sources": [
      SOURCE_LABEL,
      "EPVent-1 & EPVent-2 Trials NEJM / JAMA",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R049",
    "number": 49,
    "chapterId": 7,
    "chapter": "Non-Invasive Respiratory Support (HFNC & NIV)",
    "topicId": "cc-niv-evidence-based-indications",
    "subject": "Mechanical Ventilation",
    "subtopic": "First-Line Indications for Non-Invasive Ventilation (NIV)",
    "question": "For which of the following acute respiratory failure presentations is Non-Invasive Ventilation (NIV, bilevel positive airway pressure) established as the unequivocal first-line therapy with Level 1A evidence for reducing endotracheal intubation and mortality?",
    "options": [
      "Severe acute exacerbation of COPD with respiratory acidosis (pH < 7.35, PaCO2 > 45 mmHg) and Acute Cardiogenic Pulmonary Edema (ACPE)",
      "Severe Acute Respiratory Distress Syndrome (ARDS) with PaO2/FiO2 < 100",
      "Post-esophagectomy anastomotic dehiscence with mediastinitis",
      "Comatose patient with acute massive intracerebral hemorrhage (GCS 4)"
    ],
    "answer": "A",
    "explanation": "European Respiratory Society (ERS) and American Thoracic Society (ATS) clinical practice guidelines assign strong Level 1A recommendations for Non-Invasive Ventilation (NIV) in two primary conditions: (1) Acute hypercapnic respiratory failure due to acute COPD exacerbation with respiratory acidosis (pH ≤ 7.35 and PaCO2 > 45 mmHg), where NIV reduces intubation rates by > 60% and reduces hospital mortality by ~50%; and (2) Acute Cardiogenic Pulmonary Edema (ACPE), where CPAP or BiPAP rapidly relieves dyspnea, improves hemodynamics by decreasing LV preload and afterload, and reduces intubation rates. In severe de novo hypoxemic ARDS (P/F < 150), NIV has high failure rates (> 50%) and may delay necessary intubation.",
    "whyWrong": {
      "A": "Correct answer: COPD exacerbation with acidosis and acute cardiogenic pulmonary edema are the two premier Level 1A indications for NIV.",
      "B": "Severe ARDS (P/F < 100) is a major predictor of NIV failure and increased mortality due to patient self-inflicted lung injury (P-SILI); early intubation or HFNC is favored.",
      "C": "Recent upper GI anastomosis carries risk of anastomotic disruption from gastric distension.",
      "D": "Severe coma (GCS < 8) and inability to protect the airway are absolute contraindications to NIV."
    },
    "difficulty": "easy",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Level 1A Indications for NIV:\n  1. Acute COPD exacerbation with respiratory acidosis (pH 7.25–7.35, PaCO2 > 45).\n  2. Acute Cardiogenic Pulmonary Edema.\n• Other good indications: Post-extubation prophylaxis in high-risk patients (hypercapnic, age > 65), immunocompromised hypoxemic patients, chest trauma/flail chest.\n• Contraindications: Cardiac/respiratory arrest, severe encephalopathy (GCS < 8), severe hemodynamic instability, facial trauma, high aspiration risk.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Non-Invasive Ventilation Indications"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "Severe acute exacerbation of COPD with respiratory acidosis and Acute Cardiogenic Pulmonary Edema",
    "verified_answer": "A",
    "verified_answer_text": "Severe acute exacerbation of COPD with respiratory acidosis and Acute Cardiogenic Pulmonary Edema",
    "concept_tested": "Evidence-based first-line clinical indications and contraindications for Non-Invasive Ventilation",
    "high_yield_takeaway": [
      "NIV is the undisputed first-line respiratory therapy for hypercapnic COPD exacerbations and cardiogenic pulmonary edema.",
      "Avoid in severe coma, vomiting, and severe de novo hypoxemic ARDS."
    ],
    "sources": [
      SOURCE_LABEL,
      "ERS/ATS Clinical Practice Guidelines on Non-Invasive Ventilation",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R050",
    "number": 50,
    "chapterId": 19,
    "chapter": "Gastrointestinal, Hepatic & Abdominal Catastrophes",
    "topicId": "cc-cirrhosis-perioperative-risk",
    "subject": "Nutrition & GI",
    "subtopic": "Cirrhosis Perioperative Risk Assessment (VOCAL-Penn Score)",
    "question": "Which modern validated prognostic scoring system integrates age, albumin, bilirubin, platelet count, BMI, ASA physical status class, and specific surgical category/approach to provide superior 30- and 90-day postoperative mortality prediction in patients with liver cirrhosis undergoing non-transplant surgery?",
    "options": [
      "VOCAL-Penn (Validation of Post-Operative Mortality in Cirrhosis) score",
      "Child-Turcotte-Pugh (CTP) score",
      "MELD-Na score",
      "APACHE IV score"
    ],
    "answer": "A",
    "explanation": "While the Child-Turcotte-Pugh (CTP) and MELD/MELD-Na scores were historically used to estimate surgical risk in cirrhotic patients, neither was designed or validated specifically for perioperative risk, as they fail to account for patient age, surgical invasiveness, or laparoscopic vs open approaches. The VOCAL-Penn (Validation of Post-Operative Mortality in Cirrhosis) model was developed and externally validated specifically for non-transplant surgical risk in cirrhosis. It incorporates 9 variables: age, albumin, bilirubin, platelet count, BMI, ASA class, surgical category, emergency vs elective status, and open vs laparoscopic approach, demonstrating significantly higher discriminative accuracy (c-statistic > 0.85) for 30-, 90-, and 180-day postoperative mortality.",
    "whyWrong": {
      "A": "Correct answer: VOCAL-Penn is the modern surgical-specific risk calculator validated for cirrhotic patients undergoing surgery.",
      "B": "Child-Pugh score is an empirical bedside liver reserve score created in 1964 for portacaval shunts; it lacks surgical specificity.",
      "C": "MELD-Na was designed to prioritize liver organ allocation on transplant waitlists, not for perioperative surgical risk stratification.",
      "D": "APACHE IV is a generalized ICU mortality score calculated 24 hours after ICU admission."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Perioperative Cirrhosis Risk:\n  • Historical: Child-Pugh class (Class A = ~10% mortality; Class B = ~30%; Class C = 70–80% mortality). MELD score (> 15 carries high surgical risk).\n  • Modern Gold Standard: VOCAL-Penn Score (validated specifically for non-transplant surgeries; available as online calculator).\n• Laparoscopic approaches markedly reduce bleeding and postoperative ascites decompensation.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Nutrition & GI",
      "Cirrhosis Perioperative Risk"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "VOCAL-Penn (Validation of Post-Operative Mortality in Cirrhosis) score",
    "verified_answer": "A",
    "verified_answer_text": "VOCAL-Penn (Validation of Post-Operative Mortality in Cirrhosis) score",
    "concept_tested": "Perioperative risk assessment tools and the modern VOCAL-Penn model in cirrhosis",
    "high_yield_takeaway": [
      "VOCAL-Penn score is specifically validated for predicting postoperative mortality in patients with cirrhosis.",
      "Outperforms Child-Pugh and MELD by incorporating surgical invasiveness and patient-specific variables."
    ],
    "sources": [
      SOURCE_LABEL,
      "Mahmud N et al. Gastroenterology / Hepatology (VOCAL-Penn Study)",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R051",
    "number": 51,
    "chapterId": 15,
    "chapter": "Neurocritical Care & Raised ICP Management",
    "topicId": "cc-critical-illness-polyneuropathy",
    "subject": "Neurocritical Care",
    "subtopic": "Critical Illness Polyneuropathy (CIP) Electrodiagnostics",
    "question": "In a patient with ICU-acquired weakness (ICUAW) secondary to septic shock, which electrodiagnostic pattern on nerve conduction studies (NCS) and electromyography (EMG) is characteristic of pure Critical Illness Polyneuropathy (CIP), distinguishing it from acute inflammatory demyelinating polyneuropathy (AIDP/GBS)?",
    "options": [
      "Marked slowing of motor and sensory conduction velocities (< 70% of lower limit of normal) with conduction blocks and prolonged distal motor latencies",
      "Normal or near-normal nerve conduction velocities with markedly reduced compound muscle action potential (CMAP) and sensory nerve action potential (SNAP) amplitudes, accompanied by spontaneous fibrillations on EMG",
      "Significant decremental response (> 10%) on low-frequency repetitive nerve stimulation",
      "Preserved sensory action potentials (SNAPs) with elevated creatine kinase (> 10,000 U/L)"
    ],
    "answer": "B",
    "explanation": "Critical Illness Polyneuropathy (CIP) is a primary distal axonal sensory-motor polyneuropathy. Electrodiagnostically, axonal degenerations present with preserved or only mildly reduced conduction velocities, but severely reduced amplitudes of both compound muscle action potentials (CMAPs) and sensory nerve action potentials (SNAPs). Needle EMG reveals acute denervation with fibrillation potentials and positive sharp waves. In contrast, demyelinating neuropathies (such as GBS/AIDP) display marked conduction slowing, prolonged distal latencies, conduction blocks, and temporal dispersion. Critical Illness Myopathy (CIM) spares SNAPs and preserves normal sensory potentials.",
    "whyWrong": {
      "A": "Severe velocity slowing and conduction blocks are characteristic of demyelinating processes (GBS/AIDP), not axonal CIP.",
      "B": "Correct answer: Pure axonal neuropathy features normal/near-normal conduction velocities with reduced CMAP/SNAP amplitudes.",
      "C": "Decremental response on repetitive nerve stimulation is pathognomonic of myasthenia gravis / neuromuscular junction transmission defect.",
      "D": "Preserved SNAPs with markedly elevated CK is typical of Critical Illness Myopathy (CIM) or acute necrotizing myopathy, not CIP."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• ICUAW Differential Diagnosis:\n  • CIP (Axonal polyneuropathy): Reduced CMAP + Reduced SNAP amplitudes; conduction velocities near-normal. Fibrillations on EMG.\n  • CIM (Myopathy): Reduced CMAP, NORMAL SNAP (sensory spared). Decreased muscle membrane excitability on direct muscle stimulation (dms).\n  • GBS (Demyelinating): Slow conduction velocities, conduction block, prolonged F-wave latencies, albuminocytological dissociation on LP.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Neurocritical Care",
      "Critical Illness Polyneuropathy"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Normal or near-normal nerve conduction velocities with markedly reduced CMAP and SNAP amplitudes",
    "verified_answer": "B",
    "verified_answer_text": "Normal or near-normal nerve conduction velocities with markedly reduced CMAP and SNAP amplitudes",
    "concept_tested": "Electrophysiological differentiation between Critical Illness Polyneuropathy, Critical Illness Myopathy, and demyelinating GBS",
    "high_yield_takeaway": [
      "Critical Illness Polyneuropathy (CIP) is a primary axonal polyneuropathy with preserved velocities but reduced CMAP and SNAP amplitudes.",
      "Sensory nerve action potentials (SNAPs) are reduced in CIP but completely preserved in Critical Illness Myopathy (CIM)."
    ],
    "sources": [
      SOURCE_LABEL,
      "Muscle & Nerve / Neurocritical Care Society Guidelines on ICU-Acquired Weakness",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R052",
    "number": 52,
    "chapterId": 23,
    "chapter": "Clinical Toxicology & Toxidromes",
    "topicId": "cc-local-anesthetic-systemic-toxicity",
    "subject": "Toxicology",
    "subtopic": "LAST Resuscitation & 20% Lipid Emulsion Protocol",
    "question": "A patient experiences local anesthetic systemic toxicity (LAST) with tonic-clonic seizures followed by wide-complex ventricular tachycardia after an axillary brachial plexus block with bupivacaine. After securing the airway with 100% oxygen, what is the recommended initial bolus dose and infusion rate of 20% lipid emulsion according to ASRA guidelines?",
    "options": [
      "1.5 mL/kg IV bolus over 2–3 minutes, followed by a continuous infusion of 0.25 mL/kg/min",
      "0.1 mL/kg IV bolus, followed by 0.01 mL/kg/min",
      "10 mL/kg IV bolus, followed by 1.0 mL/kg/min",
      "100 mL of 50% dextrose bolus with 20 units of insulin"
    ],
    "answer": "A",
    "explanation": "According to the American Society of Regional Anesthesia and Pain Medicine (ASRA) LAST guidelines, the definitive antidote for bupivacaine-induced LAST is 20% intravenous lipid emulsion (Intralipid): (1) Initial bolus: 1.5 mL/kg lean body mass over 2–3 minutes (approx. 100 mL for a 70 kg adult); (2) Continuous infusion: immediately start 0.25 mL/kg/min (approx. 18 mL/min for 70 kg); (3) For persistent cardiovascular instability, repeat the 1.5 mL/kg bolus once or twice and double the infusion to 0.5 mL/kg/min; (4) Recommended maximum total dose is 10–12 mL/kg over the first 30 minutes. In ACLS modifications: avoid vasopressin, reduce epinephrine doses to < 1 mcg/kg boluses, and avoid calcium channel blockers and local anesthetics (e.g., lidocaine).",
    "whyWrong": {
      "A": "Correct answer: 1.5 mL/kg bolus followed by 0.25 mL/kg/min infusion is the standard ASRA protocol.",
      "B": "0.1 mL/kg is subtherapeutic by a factor of 15.",
      "C": "10 mL/kg bolus exceeds the maximum cumulative safety ceiling for initial bolus and risks fat embolism.",
      "D": "Dextrose/insulin is not an antidote for local anesthetic cardiac receptor blockade."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• LAST Lipid Protocol: 20% Lipid emulsion 1.5 mL/kg IV bolus -> 0.25 mL/kg/min infusion. Max total dose ~12 mL/kg.\n• Mechanism of Lipid Rescue: 'Lipid sink' / shuttle (sequesters lipophilic bupivacaine away from myocardium) + metabolic conditioning (restores myocardial fatty acid oxidation).\n• ACLS Modifications for LAST: Small epinephrine doses (≤ 1 mcg/kg), NO vasopressin, NO lidocaine/procainamide, prioritize cardiopulmonary bypass/ECPR if refractory.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Toxicology",
      "Local Anesthetic Toxicity (LAST)"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "A",
    "speaker_answer_text": "1.5 mL/kg IV bolus over 2–3 minutes, followed by a continuous infusion of 0.25 mL/kg/min",
    "verified_answer": "A",
    "verified_answer_text": "1.5 mL/kg IV bolus over 2–3 minutes, followed by a continuous infusion of 0.25 mL/kg/min",
    "concept_tested": "Dosing protocol and clinical modifications of 20% lipid emulsion in local anesthetic systemic toxicity",
    "high_yield_takeaway": [
      "20% lipid emulsion is given as a 1.5 mL/kg bolus followed by a 0.25 mL/kg/min infusion in LAST.",
      "Avoid large doses of epinephrine and avoid vasopressin."
    ],
    "sources": [
      SOURCE_LABEL,
      "ASRA Checklist for Managing Local Anesthetic Systemic Toxicity",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R053",
    "number": 53,
    "chapterId": 8,
    "chapter": "Invasive Mechanical Ventilation & Graphics",
    "topicId": "cc-cardiovascular-effects-of-peep",
    "subject": "Mechanical Ventilation",
    "subtopic": "Hemodynamic Impact of Increasing PEEP on Right Ventricular Function",
    "question": "In a patient with pre-existing right ventricular dysfunction and pulmonary hypertension on mechanical ventilation, which of the following cardiovascular adverse effects is most likely to occur if PEEP is increased from 5 to 18 cmH2O?",
    "options": [
      "Decreased right ventricular afterload and marked increase in cardiac output",
      "Increased right ventricular afterload (due to compression of intra-alveolar pulmonary capillaries and increased West Zone 1/2 conditions) combined with decreased RV preload, precipitating acute RV failure",
      "Marked increase in systemic venous return to the right atrium",
      "Elimination of ventricular interdependence"
    ],
    "answer": "B",
    "explanation": "Increasing PEEP has dual deleterious effects on right ventricular (RV) performance: (1) Preload effect: Increased intrathoracic pressure compresses the vena cava and elevates right atrial pressure, blunting the venous return pressure gradient and decreasing RV end-diastolic filling; (2) Afterload effect: High alveolar pressure distends non-dependent alveoli, compressing intra-alveolar pulmonary capillaries and converting lung regions into West Zone 1 (alveolar pressure > arterial pressure) and Zone 2. This increases pulmonary vascular resistance (PVR) and markedly increases RV afterload. In a compromised, thin-walled RV, this precipitates acute cor pulmonale, tricuspid regurgitation, leftward interventricular septal shift (ventricular interdependence), and cardiogenic shock.",
    "whyWrong": {
      "A": "Increasing PEEP increases RV afterload, it does NOT decrease it unless it recruits severely atelectatic, hypoxic lung regions.",
      "B": "Correct answer: Increased RV afterload and decreased venous return are the primary mechanisms of RV decompensation under high PEEP.",
      "C": "PEEP elevates right atrial pressure, which decreases the pressure gradient for systemic venous return.",
      "D": "Ventricular interdependence is exaggerated, not eliminated, causing the RV to impinge on the LV cavity."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Cardiovascular Effects of PEEP:\n  • RV Preload: Decreased (elevated CVP reduces venous return gradient).\n  • RV Afterload: Increased (compression of intra-alveolar vessels; PVR follows a U-shaped curve with lowest PVR at FRC).\n  • LV Preload: Decreased (due to reduced RV output + leftward septal shift).\n  • LV Afterload: Decreased (decreased transmural LV systolic pressure — beneficial in left heart failure!).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Cardiovascular Effects of PEEP"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Increased right ventricular afterload combined with decreased RV preload, precipitating acute RV failure",
    "verified_answer": "B",
    "verified_answer_text": "Increased right ventricular afterload combined with decreased RV preload, precipitating acute RV failure",
    "concept_tested": "Heart-lung interactions and the pathophysiology of high PEEP on right ventricular loading conditions",
    "high_yield_takeaway": [
      "High PEEP increases RV afterload via alveolar capillary compression and decreases RV preload.",
      "Can precipitate acute cor pulmonale in vulnerable patients."
    ],
    "sources": [
      SOURCE_LABEL,
      "Robotham & Scharf Heart-Lung Interactions in Health and Disease",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R054",
    "number": 54,
    "chapterId": 19,
    "chapter": "Gastrointestinal, Hepatic & Abdominal Catastrophes",
    "topicId": "cc-post-reperfusion-syndrome",
    "subject": "ICU Procedures & Monitoring",
    "subtopic": "Post-Reperfusion Syndrome in Organ Transplantation",
    "question": "Immediately following vascular clamp release and reperfusion of a donor renal allograft during kidney transplantation, the patient abruptly develops profound hypotension (MAP drops by 35%), bradycardia, and ST-segment depression. What is the diagnosis and the underlying pathophysiological cause?",
    "options": [
      "Hyperacute antibody-mediated rejection due to preformed HLA antibodies",
      "Post-Reperfusion Syndrome (PRS) caused by the sudden systemic washout of cold, hyperkalemic, acidic preservative solution containing vasoactive inflammatory mediators and ischemic metabolites",
      "Tension pneumothorax from central line placement",
      "Protamine-induced anaphylaxis"
    ],
    "answer": "B",
    "explanation": "Post-Reperfusion Syndrome (PRS)—commonly recognized in liver and kidney transplantation—is defined as a significant decrease in mean arterial pressure (> 30% below baseline for ≥ 5 minutes) occurring within the first 5 minutes of vascular un-clamping and graft reperfusion. The sudden release of vascular clamps floods the systemic circulation with cold allograft effluent containing acidic metabolites, high potassium (from preservative flush solutions like UW solution), lactate, free radicals, cytokines, and micro-aggregates. This causes sudden acute myocardial depression, peripheral vasoplegia, and transient bradyarrhythmias. Management involves volume loading, calcium chloride, sodium bicarbonate, and vasopressor boluses (norepinephrine/epinephrine).",
    "whyWrong": {
      "A": "Hyperacute rejection causes microvascular graft thrombosis over hours to days with graft cyanosis, not instantaneous hemodynamic collapse upon clamp release.",
      "B": "Correct answer: Post-reperfusion syndrome is caused by the sudden influx of cold, hyperkalemic, acidotic preservation washout.",
      "C": "Tension pneumothorax causes progressive peak pressure elevation and asymmetric breath sounds, unrelated to the second of clamp release.",
      "D": "Protamine is given post-heparinization at the conclusion, not upon vascular anastomotic clamp release."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• Post-Reperfusion Syndrome (Aggarwal Criteria): Drop in MAP > 30% for ≥ 1 min within 5 min of reperfusion.\n• Mediators: High potassium, cold temperature, low pH (< 7.0), adenosine, cytokines, reactive oxygen species.\n• Prophylaxis & Management: Thorough graft flushing with albumin/cold saline before release, pre-emptive volume loading, Calcium chloride (1 g IV) to counter hyperkalemic myocardial depression, and Norepinephrine/epinephrine boluses.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "ICU Procedures & Monitoring",
      "Post-Reperfusion Syndrome & Transplantation"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Post-Reperfusion Syndrome (PRS) caused by sudden washout of cold, hyperkalemic, acidic preservative fluid and ischemic metabolites",
    "verified_answer": "B",
    "verified_answer_text": "Post-Reperfusion Syndrome (PRS) caused by sudden washout of cold, hyperkalemic, acidic preservative fluid and ischemic metabolites",
    "concept_tested": "Etiology, clinical presentation, and hemodynamic management of post-reperfusion syndrome in solid organ transplantation",
    "high_yield_takeaway": [
      "Post-reperfusion syndrome occurs within 5 minutes of vascular un-clamping due to cold, acidotic, hyperkalemic allograft effluent.",
      "Treated with calcium, vasopressors, and volume resuscitation."
    ],
    "sources": [
      SOURCE_LABEL,
      "Transplantation Anesthesia Standards & Liver/Renal Transplantation Guidelines",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R055",
    "number": 55,
    "chapterId": 13,
    "chapter": "Acute Kidney Injury & Renal Replacement Therapy",
    "topicId": "cc-regional-citrate-anticoagulation",
    "subject": "Renal Critical Care",
    "subtopic": "Regional Citrate Anticoagulation (RCA) in CRRT",
    "question": "During regional citrate anticoagulation (RCA) in continuous renal replacement therapy (CRRT), what is the metabolic fate of the systemic citrate returned to the patient, and why is continuous intravenous calcium chloride/gluconate infusion mandatory?",
    "options": [
      "Citrate is excreted unchanged in the urine; calcium is infused to prevent systemic hypercalcemia",
      "Citrate is metabolized in the liver, kidneys, and skeletal muscle mitochondria into three bicarbonate molecules per citrate molecule; systemic calcium infusion is mandatory to replace calcium lost in the effluent dialysate/filter and maintain normal systemic ionized calcium",
      "Citrate binds irreversibly to antithrombin III; calcium prevents citrate toxicity",
      "Citrate is converted into lactic acid; calcium buffers the lactic acidosis"
    ],
    "answer": "B",
    "explanation": "In regional citrate anticoagulation (RCA), citrate is infused pre-filter to chelate ionized calcium (target circuit iCa < 0.25–0.35 mmol/L), inhibiting the tenase and prothrombinase coagulation cascades within the extracorporeal circuit. Approximately 40–50% of the calcium-citrate complex is removed across the dialyzer into the effluent. The remaining citrate enters the patient's systemic circulation, where it is rapidly metabolized in hepatocytes and skeletal muscle mitochondria via the Krebs cycle to produce 3 moles of sodium bicarbonate (HCO3-) per mole of citrate. Because ionized calcium was lost in the effluent, a separate, dedicated systemic calcium infusion is mandatory post-filter to normalize systemic ionized calcium (target 1.1–1.3 mmol/L) and prevent severe hypocalcemic tetany, hypotension, and myocardial depression.",
    "whyWrong": {
      "A": "Citrate is metabolized to bicarbonate, not excreted unchanged; calcium infusion replaces lost calcium to prevent hypocalcemia, not hypercalcemia.",
      "B": "Correct answer: Citrate metabolizes to bicarbonate (3:1 ratio); systemic calcium replaces filter calcium losses.",
      "C": "Citrate chelates calcium, having no interaction with antithrombin III (which is heparin's cofactor).",
      "D": "Citrate enters the citric acid (Krebs) cycle and generates bicarbonate, not lactic acid."
    },
    "difficulty": "hard",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• RCA Principles: Circuit iCa target = 0.25–0.35 mmol/L (prevents filter clotting). Systemic iCa target = 1.12–1.30 mmol/L.\n• 1 molecule of trisodium citrate yields 3 molecules of HCO3- (risk of metabolic alkalosis if over-infused).\n• Citrate Accumulation ('Citrate Lock'): Occurs in severe hepatic failure or shock. Hallmarks: High total calcium to ionized calcium ratio (> 2.5), refractory metabolic acidosis with wide anion gap, and hypocalcemia.",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Renal Critical Care",
      "Regional Citrate Anticoagulation"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Citrate is metabolized in the liver to bicarbonate; calcium infusion replaces calcium lost in effluent to maintain normal systemic ionized calcium",
    "verified_answer": "B",
    "verified_answer_text": "Citrate is metabolized in the liver to bicarbonate; calcium infusion replaces calcium lost in effluent to maintain normal systemic ionized calcium",
    "concept_tested": "Metabolic pathways, calcium replacement physiology, and complications of regional citrate anticoagulation in CRRT",
    "high_yield_takeaway": [
      "Citrate chelates circuit calcium and is metabolized systemically in the liver to bicarbonate (1:3 ratio).",
      "Calcium lost in the filter effluent must be replaced with dedicated systemic IV calcium infusion."
    ],
    "sources": [
      SOURCE_LABEL,
      "KDIGO Clinical Practice Guideline for Acute Kidney Injury",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  },
  {
    "id": "INICET-SS-2026-CC-R056",
    "number": 56,
    "chapterId": 9,
    "chapter": "Acute Respiratory Distress Syndrome (ARDS)",
    "topicId": "cc-electrical-impedance-tomography",
    "subject": "Mechanical Ventilation",
    "subtopic": "Electrical Impedance Tomography (EIT) in Mechanical Ventilation",
    "question": "What is the primary clinical application of bedside Electrical Impedance Tomography (EIT) during mechanical ventilation in patients with Acute Respiratory Distress Syndrome (ARDS)?",
    "options": [
      "Invasive measurement of pulmonary artery wedge pressure",
      "Continuous, radiation-free, real-time monitoring of regional distribution of lung ventilation, allowing simultaneous identification of non-dependent alveolar hyperdistension and dependent alveolar collapse during decremental PEEP titration",
      "Definitive histological diagnosis of pulmonary fibrosis",
      "Continuous optical monitoring of bronchial ciliary beat frequency"
    ],
    "answer": "B",
    "explanation": "Electrical Impedance Tomography (EIT) is an advanced, non-invasive, radiation-free bedside imaging technology that uses a circular belt containing 16 or 32 electrodes placed around the patient's thorax (typically at the 4th–5th intercostal space). By injecting tiny, imperceptible high-frequency electrical currents and measuring voltage drops across the thorax, it constructs continuous cross-sectional dynamic images of lung impedance, which correlate directly with regional ventilation and aeration. During a decremental PEEP titration trial, EIT uniquely quantifies the percentage of alveolar collapse in dependent lung regions versus alveolar hyperdistension in non-dependent regions, pinpointing the individual 'optimal PEEP' that minimizes both VILI mechanisms.",
    "whyWrong": {
      "A": "PAWP requires invasive pulmonary artery catheterization, not surface thoracic impedance tomography.",
      "B": "Correct answer: EIT provides real-time cross-sectional functional imaging of regional ventilation, collapse, and overdistension to optimize PEEP.",
      "C": "Histological diagnosis requires surgical or transbronchial lung biopsy.",
      "D": "EIT measures electrical impedance of air versus tissue, not microscopic ciliary motion."
    },
    "difficulty": "medium",
    "sourceType": "ini-cet-ss-2026-recall",
    "exam": "INI-CET SS",
    "year": 2026,
    "examPearl": "HIGH-YIELD TAKEAWAYS:\n• EIT Principles: Lung tissue electrical impedance changes linearly with lung aeration (air is a poor electrical conductor; impedance increases with inhalation).\n• Optimal PEEP on EIT: Identified at the intersection where the curve of collapsed lung units (dependent zones) and hyperdistended lung units (non-dependent zones) crosses with minimal combined lung injury.\n• EIT also detects real-time regional pendelluft and perfusion distribution (via hypertonic saline bolus contrast).",
    "hyperlinkedReference": {
      "label": SOURCE_LABEL,
      "url": SOURCE_URL
    },
    "tags": [
      "INI-CET SS 2026",
      "INI SS CC April 2026",
      "Recall 2026",
      "Mechanical Ventilation",
      "Electrical Impedance Tomography"
    ],
    "verificationStatus": "VERIFIED",
    "recall_confidence": "high",
    "question_status": "verified_recall",
    "speaker_answer": "B",
    "speaker_answer_text": "Continuous, radiation-free, real-time monitoring of regional distribution of lung ventilation, identifying alveolar hyperdistension and collapse during PEEP titration",
    "verified_answer": "B",
    "verified_answer_text": "Continuous, radiation-free, real-time monitoring of regional distribution of lung ventilation, identifying alveolar hyperdistension and collapse during PEEP titration",
    "concept_tested": "Physiological principles, clinical imaging capabilities, and PEEP titration utilizing Electrical Impedance Tomography (EIT)",
    "high_yield_takeaway": [
      "Electrical Impedance Tomography provides radiation-free, real-time bedside imaging of regional lung ventilation distribution.",
      "Identifies regional collapse versus hyperdistension to individualize optimal PEEP in ARDS."
    ],
    "sources": [
      SOURCE_LABEL,
      "Consensus Statement on Electrical Impedance Tomography in Mechanical Ventilation",
      "KnockoutNotes Critical Care Medicine Verification Panel"
    ]
  }
];

module.exports = { questions41To56 };
