// ============================================================================
// BATCH 1: CARDIOVASCULAR & THORACIC CLINICAL CASES (8 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), 2024 ESC/EACTS & ACC/AHA Guidelines.
// ============================================================================

module.exports = [
  // 1. MITRAL STENOSIS WITH PULMONARY HYPERTENSION
  {
    id: "case-mitral-stenosis-phtn",
    cat: "case_cardiac",
    name: "Mitral Stenosis with Pulmonary Hypertension",
    short: "Mitral Stenosis & PHTN",
    tags: ["Cardiac", "Mitral Stenosis", "PHTN", "Atrial Fibrillation", "Valvular Heart Disease", "Case Discussion"],
    tagline: "Slow HR 60–70 bpm, maintain sinus rhythm & atrial kick, avoid tachycardia & prevent surges in PVR",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 1; Miller's Anesthesia, 10th ed., Ch. 65; 2024 ESC/EACTS Valvular Guidelines.",
    sections: [
      {
        h: "1. Definition, Classification & Wilkins Score",
        b: "• Definition: Mechanical narrowing of the mitral orifice during diastole, predominantly secondary to chronic rheumatic carditis (>95%). Normal Mitral Valve Area (MVA) is 4.0–6.0 cm².\n• Severity Staging (2024 ESC / ACC/AHA Criteria):\n  - Mild MS: MVA > 1.5 cm², Mean Gradient < 5 mmHg, PASP < 30 mmHg.\n  - Moderate MS: MVA 1.0–1.5 cm², Mean Gradient 5–10 mmHg, PASP 30–50 mmHg.\n  - Severe MS: MVA < 1.0 cm² (indexed < 0.6 cm²/m²), Mean Gradient > 10 mmHg, PASP > 50 mmHg at rest.\n• Wilkins Echocardiographic Score (Range 4–16):\n  - Analyzes 4 morphologic features (Mobility, Subvalvular thickening, Leaflet thickening, Calcification) scored 1–4 each.\n  - Score ≤ 8: Favorable for Percutaneous Transvenous Mitral Commissurotomy (PTMC / BMV).\n  - Score > 11 or LA thrombus: Contraindication to PTMC; mandates open surgical Mitral Valve Replacement (MVR)."
      },
      {
        h: "2. Pathophysiology, Pressure Gradients & Reactive PHTN",
        b: "• Obstruction to LV Inflow: Elevated transmitral pressure gradient raises Left Atrial Pressure (LAP) from normal (6–10 mmHg) to 25–35 mmHg.\n• Retrograde Pulmonary Congestion: Elevated LAP increases pulmonary venous and capillary pressures. When PCWP exceeds 25 mmHg (plasma oncotic pressure), transudation produces pulmonary edema.\n• Two-Phase Pulmonary Hypertension:\n  1. Passive / Reactive PHTN: Direct retrograde backpressure from high LAP.\n  2. Obliterative / Vasoconstrictive PHTN: Longstanding congestion causes medial hypertrophy and intimal proliferation of pulmonary arterioles, producing fixed, precapillary PHTN (PASP > 60–80 mmHg), right ventricular strain, and secondary tricuspid regurgitation.\n• Atrial Fibrillation (AF): LA stretching causes chronic AF. Loss of atrial kick decreases LV end-diastolic volume by 20%–30%; rapid ventricular response precipitates flash pulmonary edema."
      },
      {
        h: "3. Preoperative Evaluation, Bedside Exam & Risk Stratification",
        b: "• Bedside Clinical Examination:\n  - General: Malar flush / facies mitralis (cyanotic, dusky cheeks from low cardiac output).\n  - Pulse: Low-volume, irregularly irregular pulse if in AF.\n  - Palpation: Tapping apical impulse (palpable loud S1), diastolic thrill at apex in left lateral decubitus, left parasternal heave (RVH), palpable P2.\n  - Auscultation: Loud S1, sharp opening snap (OS; shorter A2–OS interval indicates higher LAP and more severe stenosis), rumbling mid-diastolic murmur with presystolic accentuation (lost in AF).\n• Bedside Functional Capacity:\n  - NYHA Class I–IV grading. Inability to climb 2 flights of stairs (<4 METs) correlates with high perioperative mortality.\n• ACC/AHA Valvular Algorithm for Non-Cardiac Surgery:\n  - Symptomatic Severe MS (NYHA II–IV): Correct MS with PTMC or MVR before elective intermediate-to-high risk non-cardiac surgery.\n  - Asymptomatic Severe MS: If high-risk surgery, consider PTMC first; if intermediate-risk surgery, proceed with invasive hemodynamic monitoring."
      },
      {
        h: "4. Preoperative Optimization & Medication Guidelines",
        b: "• Heart Rate Control: Continue oral beta-blockers (Metoprolol) or Digoxin up to the morning of surgery. Target resting HR: 60–70 bpm.\n• Diuretics & Electrolytes: Continue Furosemide/Spironolactone for pulmonary congestion; check serum K⁺ and Mg²⁺ (hypokalemia provokes lethal digitalis arrhythmias).\n• Anticoagulation Bridging: Patients with MS and AF are on Warfarin (target INR 2.0–3.0) for stroke prevention (thromboembolism risk >15%/year). Discontinue Warfarin 5 days prior; bridge with therapeutic LMWH (Enoxaparin 1 mg/kg SC q12h). Stop LMWH 24h before surgery; check morning INR (<1.5)."
      },
      {
        h: "5. Anesthetic Strategy & The Cardinal Hemodynamic Goals",
        b: "• The 5 Cardinal Goals (\"Slow, Sinus, Full, SVR Maintained, PVR Low\"):\n  1. HEART RATE: Slow (60–70 bpm — most critical!). Tachycardia shortens diastole, producing upstream pulmonary edema and downstream LV collapse.\n  2. RHYTHM: Maintain sinus rhythm / strict ventricular rate control in AF.\n  3. PRELOAD: Adequate but cautious. Underfilling collapses the small LV; fluid overload causes pulmonary edema.\n  4. SVR: Maintain normal to elevated SVR to preserve coronary perfusion.\n  5. PVR: Prevent surges in PVR by strictly avoiding: Hypoxia, Hypercapnia, Acidosis, Hypothermia, High PEEP, and Pain.\n• Technique: General Anesthesia with endotracheal intubation is preferred. Single-shot spinal anaesthesia is CONTRAINDICATED (sudden vasodilation triggers severe reflex tachycardia and cardiovascular collapse). Titrated epidural may be used for lower-limb cases."
      },
      {
        h: "6. Intraoperative Monitoring & Vascular Access",
        b: "• Mandatory Monitoring Suite:\n  - 5-Lead ECG with automated ST-segment and arrhythmia analysis (Leads II and V5).\n  - Pre-induction Radial Arterial Line: Continuous beat-to-beat BP tracking, early identification of tachycardia, and blood gas analysis.\n  - Central Venous Catheter (US-guided Right IJV): Monitors CVP (reflecting RV function) and provides dedicated access for inotropes/vasopressors.\n  - Transesophageal Echocardiography (TEE): Gold-standard intraoperative monitor. Visualizes LV filling, transmitral pressure gradients, LA de-airing, RV contractility, and PASP via tricuspid regurgitant jet (4 × TRV² + RAP)."
      },
      {
        h: "7. Detailed Induction & Maintenance Pharmacology",
        b: "• Blunting Laryngoscopy Stress: Fentanyl 3–5 mcg/kg or Esmolol 0.5–1 mg/kg given 90s prior to intubation.\n• Induction Agents:\n  - ETOMIDATE (0.2–0.3 mg/kg IV): Agent of choice. Outstanding hemodynamic stability, zero myocardial depression, zero reflex tachycardia.\n  - High-Dose OPIOIDS (Fentanyl 3–5 mcg/kg): Excellent hemodynamic control.\n  - PROPOFOL: Extreme caution (causes severe vasodilation and myocardial depression).\n  - KETAMINE: STRICTLY CONTRAINDICATED (sympathomimetic; causes tachycardia and spikes PVR).\n• Muscle Relaxants:\n  - VECURONIUM (0.1 mg/kg) or CISATRACURIUM (0.15 mg/kg): Ideal, hemodynamically neutral.\n  - ROCURONIUM (0.6–0.9 mg/kg): Suitable for rapid sequence intubation.\n  - PANCURONIUM: CONTRAINDICATED (vagolytic tachycardia is catastrophic in MS).\n• Maintenance: Sevoflurane (0.8–1.2 MAC) in O₂/Air. AVOID Nitrous Oxide (N₂O elevates PVR by 20%–30%)."
      },
      {
        h: "8. Specific Intraoperative Concerns & Crisis Protocols",
        b: "• Hypotension Treatment:\n  - Drug of Choice: PHENYLEPHRINE (50–100 mcg IV bolus or 0.2–0.5 mcg/kg/min infusion). Elevates SVR and produces beneficial reflex bradycardia.\n  - AVOID EPHEDRINE (beta-1 stimulation causes tachycardia and precipitates flash pulmonary edema).\n• Sudden Atrial Fibrillation with Rapid Ventricular Response (RVR):\n  - If Unstable (Hypotension, pulmonary edema): Immediate Synchronized DC Cardioversion (50–100 J).\n  - If Stable: IV Esmolol (0.5 mg/kg bolus over 1 min, then 50–200 mcg/kg/min) or IV Amiodarone (150 mg over 10 min, then 1 mg/min).\n• Acute RV Failure / Pulmonary Hypertensive Crisis:\n  - 100% FiO₂, hyperventilate to PaCO₂ 30–35 mmHg, correct acidosis (pH > 7.45).\n  - Inhaled Nitric Oxide (iNO 20–40 ppm) or Inhaled Prostacyclin (Iloprost 10–20 mcg) selectively vasodilates pulmonary vascular bed without systemic hypotension."
      },
      {
        h: "9. Postoperative Concerns, Extubation & ICU Management",
        b: "• Extubation Checklist: Extubate only when fully awake, normothermic, completely reversed (TOF ratio > 0.9), and breathing comfortably without pain or shivering (shivering triples oxygen consumption and spikes HR).\n• Fluid Management: Strict fluid balance. Postoperative third-space fluid mobilization on POD 2–3 frequently causes delayed pulmonary edema.\n• Pain Management: Multimodal opioid-sparing analgesia (Paracetamol IV, regional nerve blocks, titrated opioids). Avoid NSAIDs if renal compromise present.\n• ICU Disposition: 24–48 hours continuous telemetry in HDU/ICU. Resume oral beta-blockers as soon as oral intake resumes; restart anticoagulation bridging when surgical hemostasis is verified."
      },
      {
        h: "10. Clinical Vignette & High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• Clinical Vignette:\n  A 38-year-old female with severe rheumatic MS (MVA 0.8 cm², mean gradient 15 mmHg, PASP 62 mmHg, in AF) undergoes emergency laparotomy for perforated appendicitis. Pre-induction radial arterial line is placed. Rapid sequence induction is performed with Fentanyl 150 mcg, Etomidate 14 mg, and Rocuronium 50 mg. During peritoneal wash, HR jumps from 68 to 134 bpm with new fine bibasilar crepitations on auscultation, and BP drops to 78/48 mmHg. Phenylephrine 100 mcg is given immediately, FiO₂ increased to 1.0, and Esmolol 30 mg bolus is administered. Heart rate slows to 66 bpm, blood pressure recovers to 110/68 mmHg, and pulmonary crepitations clear over 15 minutes with 20 mg IV furosemide.\n• High-Yield Exam Viva Pearls:\n  - Q: Why is mitral stenosis called a \"fixed-output state\"?\n    A: Because stroke volume cannot increase across the mechanically stenotic orifice. Attempts to increase cardiac output through tachycardia worsen hemodynamics by drastically truncating diastolic filling time.\n  - Q: Why is spinal anesthesia risky in severe MS?\n    A: The sudden loss of sympathetic tone causes venodilation, pooling, and a drop in SVR, triggering reflex tachycardia which dramatically worsens LV underfilling and causes severe pulmonary edema.\n  - Q: How does pregnancy precipitate decompensation in asymptomatic MS?\n    A: Blood volume expands by 40%–50% and resting HR increases by 15–20 bpm by the late 2nd trimester, unmasking previously asymptomatic mitral stenosis with sudden pulmonary edema."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 1, Jaypee Brothers Medical Publishers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65 (Cardiac Anesthesia), Elsevier, 2025/2026.",
      "Vahanian A, et al. 2021 ESC/EACTS Guidelines for the management of valvular heart disease. Eur Heart J 2022;43(7):561-632."
    ]
  },

  // 2. ISCHEMIC HEART DISEASE (IHD) FOR NON-CARDIAC SURGERY
  {
    id: "case-ischemic-heart-disease",
    cat: "case_cardiac",
    name: "Ischemic Heart Disease (IHD) for Non-Cardiac Surgery",
    short: "Ischemic Heart Disease",
    tags: ["Cardiac", "IHD", "CAD", "Myocardial Ischemia", "RCRI", "DAPT", "Case Discussion"],
    tagline: "Myocardial oxygen supply-demand balance, heart rate control 50–70 bpm, maintain CPP & lead II/V5 surveillance",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 2; Miller's Anesthesia, 10th ed., Ch. 13 & 65; 2024 ESC Guidelines on Non-Cardiac Surgery.",
    sections: [
      {
        h: "1. Definition, Classification & CCS Angina Staging",
        b: "• Definition: Myocardial oxygen supply-demand mismatch secondary to atheromatous coronary stenosis.\n• Canadian Cardiovascular Society (CCS) Functional Angina Staging:\n  - Class I: Angina only with strenuous or prolonged exertion.\n  - Class II: Slight limitation; angina walking >2 blocks or climbing >1 flight of stairs at normal pace.\n  - Class III: Marked limitation; angina walking 1–2 blocks or climbing 1 flight of stairs under normal conditions.\n  - Class IV: Inability to perform any activity without angina; angina present at rest.\n• Types of Perioperative Myocardial Infarction (PMI):\n  - Type 1 MI: Spontaneous plaque rupture, ulceration, and occlusive coronary thrombosis triggered by surgical stress, sympathetic catecholamines, and hypercoagulability.\n  - Type 2 MI: Ischemic necrosis secondary to supply-demand imbalance (prolonged tachycardia, hypotension, anemia, or hypoxemia) in the absence of plaque rupture."
      },
      {
        h: "2. Pathophysiology: Supply vs Demand & The Subendocardial Vulnerability",
        b: "• Determinants of Myocardial Oxygen Demand (MVO₂):\n  1. HEART RATE: Single most critical factor; increases beat frequency while shortening diastolic perfusion.\n  2. Afterload / Wall Tension: Governed by Laplace Law (T = P × r / 2h; systolic pressure and ventricular dilation increase wall tension).\n  3. Myocardial Contractility: Excessive inotropes waste energy.\n• Determinants of Myocardial Oxygen Supply:\n  1. Coronary Perfusion Pressure (CPP): CPP = Aortic Diastolic Pressure (ADP) - Left Ventricular End-Diastolic Pressure (LVEDP).\n  2. Diastolic Perfusion Time: The LV subendocardium is perfused exclusively during diastole. Tachycardia reduces diastole precipitously.\n  3. Arterial Oxygen Content (CaO₂ = 1.34 × Hb × SaO₂): Anemia (Hb < 8 g/dL) or hypoxemia severely curtails oxygen delivery.\n  4. Fixed Atherosclerotic Obstruction: Prevents distal autoregulatory vasodilatation, making regional myocardial blood flow entirely pressure-dependent.\n• Subendocardial Vulnerability: Highest intracavitary compressive force; first tissue layer to suffer ischemic necrosis."
      },
      {
        h: "3. Preoperative Evaluation, RCRI Scoring & AHA/ACC Flowchart",
        b: "• Revised Cardiac Risk Index (RCRI / Lee Criteria - 6 Independent Predictors, 1 Point Each):\n  1. High-risk surgery (Intraperitoneal, intrathoracic, or suprainguinal vascular)\n  2. History of ischemic heart disease (MI, positive stress test, angina, nitrate use, Q-waves)\n  3. History of congestive heart failure (pulmonary edema, PND, S3 gallop, rales, peripheral edema)\n  4. History of cerebrovascular disease (stroke, TIA)\n  5. Diabetes mellitus requiring preoperative insulin therapy\n  6. Preoperative serum creatinine > 2.0 mg/dL (177 mcmol/L)\n  - Risk of Major Adverse Cardiac Events (Cardiac Death, Arrest, Non-fatal MI):\n    * 0 points = 0.4% (Class I - Low Risk)\n    * 1 point = 0.9% (Class II - Low Risk)\n    * 2 points = 6.6% (Class III - Moderate Risk)\n    * ≥3 points = >11.0% (Class IV - High Risk)\n• AHA/ACC Flowchart for Preoperative Non-Cardiac Surgery:\n  - Emergency Surgery: Proceed directly to OR with invasive monitoring and postop surveillance.\n  - Acute Coronary Syndrome (ACS): Halt elective surgery; cardiology evaluation and revascularization.\n  - Stable CAD + Functional Capacity ≥ 4 METs (climbing 2 flights of stairs): Proceed to surgery without further testing.\n  - Elevated Risk Surgery + Poor / Unknown Functional Capacity (<4 METs): Pharmacological stress test (Dobutamine Echo or MPI) indicated ONLY if results will change clinical decision-making."
      },
      {
        h: "4. Preoperative Optimization & Dual Antiplatelet Therapy (DAPT) Decisions",
        b: "• DAPT Timing Rules (2024 ESC / ACC/AHA Guidelines):\n  - Elective surgery should be delayed at least 6 MONTHS following Drug-Eluting Stent (DES) implantation.\n  - In time-sensitive surgery (e.g. oncology): May proceed after 3 MONTHS if P2Y12 inhibitor cannot be continued.\n  - Elective surgery should be delayed at least 1 MONTH after Bare-Metal Stent (BMS) implantation.\n• Management for Intermediate-to-High Bleeding Risk Procedures:\n  - Discontinue P2Y12 inhibitor: Clopidogrel 5 days prior; Ticagrelor 3–5 days prior; Prasugrel 7 days prior.\n  - CONTINUE ASPIRIN throughout the perioperative period (unless intracranial surgery).\n  - Resume P2Y12 inhibitor within 48–72 hours postoperatively once surgical hemostasis is verified.\n• Morning of Surgery Drug Guidelines:\n  - CONTINUE: Beta-blockers, Statins (statins stabilize plaques and reduce 30-day mortality), Aspirin.\n  - WITHHOLD: ACE inhibitors / ARBs on morning of surgery (prevents refractory post-induction vasoplegia); SGLT2 inhibitors 3 days prior (prevents euglycemic DKA)."
      },
      {
        h: "5. Anesthetic Strategy & The Cardinal Hemodynamic Goals",
        b: "• The Cardinal Hemodynamic Goals (\"The IHD Golden Rules\"):\n  1. HEART RATE: 50 to 70 bpm. Avoid tachycardia aggressively.\n  2. BLOOD PRESSURE: Keep MAP within 20% of baseline. Maintain Aortic Diastolic Pressure (ADP) > 50–60 mmHg to preserve CPP.\n  3. PRELOAD: Keep LV volume normal. Avoid hypovolemia (reduces SV) and volume overload (elevates LVEDP, dropping CPP).\n  4. SVR: Maintain normal SVR. SVR drops compromise coronary perfusion pressure.\n  5. MYOCARDIAL CONTRACTILITY: Avoid excessive inotropes which waste oxygen.\n• Technique Selection:\n  - General Anesthesia: Permits controlled ventilation, tight hemodynamic monitoring, and cardioprotection via volatile-induced ischemic preconditioning.\n  - Regional / Neuraxial Anesthesia: Epidural or peripheral nerve blocks reduce neuroendocrine stress response and hypercoagulability. However, sudden high spinal block with rapid vasodilation and reflex tachycardia must be rigorously prevented."
      },
      {
        h: "6. Intraoperative Monitoring & Lead V5 / II Surveillance",
        b: "• Continuous ECG Surveillance:\n  - 5-Lead ECG with automated ST-segment trend monitoring is mandatory.\n  - Lead II: Monitors RCA / inferior wall ischemia and P-wave morphology / arrhythmias.\n  - Lead V5: Monitors LAD and circumflex / anterolateral wall ischemia (detects 75% of ischemic episodes alone; combined Lead II + V5 detects >85%; II + V4 + V5 detects >96%).\n• Invasive Arterial Line:\n  - Place prior to induction in patients with severe CAD, left main disease, low LVEF (<40%), or undergoing major fluid-shift surgery. Permits immediate detection of hypotension and pulse contour analysis (SVV / PPV).\n• Central Venous Pressure / TEE:\n  - TEE is the most sensitive monitor of intraoperative ischemia, detecting regional wall motion abnormalities (RWMA) within seconds of hypoperfusion, long before ECG ST changes or hemodynamic deterioration occur."
      },
      {
        h: "7. Detailed Induction & Maintenance Pharmacology",
        b: "• Blunting the Pressor Response of Laryngoscopy:\n  - Laryngoscopy stimulates sympathetic fibers, spiking HR and BP within 15 seconds.\n  - Pre-treatment 90 seconds prior to intubation: Fentanyl 3–5 mcg/kg IV, or Lignocaine 1.5 mg/kg IV, or Esmolol 0.5–1.0 mg/kg IV.\n• Induction Agents:\n  - ETOMIDATE (0.2–0.3 mg/kg IV): Agent of choice for compromised LV function or critical multivessel CAD. Maintains hemodynamics and CPP.\n  - PROPOFOL (1.0–1.5 mg/kg slow titration): Can be used if co-titrated with small doses of Phenylephrine or Norepinephrine; blunts sympathetic tone.\n  - KETAMINE: CONTRAINDICATED (causes sympathetic surge, tachycardia, hypertension, and marked increase in MVO₂).\n• Neuromuscular Blockers:\n  - VECURONIUM (0.1 mg/kg) or ROCURONIUM (0.6 mg/kg): Hemodynamically neutral.\n  - PANCURONIUM: STRICTLY CONTRAINDICATED (vagolytic tachycardia).\n• Maintenance:\n  - Volatile Anaesthetics (Sevoflurane or Isoflurane at 0.8–1.0 MAC): Provide pharmacological \"Anesthetic Preconditioning\" (mimics ischemic preconditioning via mitochondrial K_ATP channels, protecting myocardium against ischemic insults)."
      },
      {
        h: "8. Specific Intraoperative Concerns & Management of Ischemia",
        b: "• Protocol for Sudden Intraoperative ST-Segment Depression:\n  1. STEP 1: Check Heart Rate. If HR > 75 bpm, administer IV Esmolol (0.5 mg/kg bolus, then 50–100 mcg/kg/min infusion) or Metoprolol 1–2 mg IV.\n  2. STEP 2: Check Blood Pressure. If hypotension (MAP < 65 or >20% below baseline), administer PHENYLEPHRINE (50–100 mcg) or NOREPINEPHRINE to restore CPP.\n  3. STEP 3: If BP is high and HR is controlled, start NITROGLYCERIN (NTG) infusion (0.5–2 mcg/kg/min) to dilate coronary arteries and lower preload/wall tension.\n  4. STEP 4: Optimize Oxygen Carrying Capacity: Ensure FiO₂ > 0.50, check ABG, transfuse packed RBCs if Hemoglobin < 8–9 g/dL.\n  5. STEP 5: If refractory ischemia or cardiogenic shock ensues, alert surgical team, insert Intra-Aortic Balloon Pump (IABP), and consider urgent coronary angiography."
      },
      {
        h: "9. Postoperative Concerns, Silent MI & Extubation Criteria",
        b: "• Postoperative Myocardial Infarction (PMI) Timeline:\n  - The peak incidence of PMI is on Postoperative Days 1 to 3 (POD 1–3), driven by postoperative inflammatory cytokine storm, prothrombotic surge, hypercoagulability, fluid shifts, and acute surgical pain.\n  - SILENT ISCHEMIA: Up to 75%–85% of postoperative MIs are completely PAINLESS because systemic opioids and incisional pain mask anginal chest pain. Symptoms are atypical: unexplained hypotension, new tachycardia, dyspnea, or altered mental status.\n• Mandatory Postoperative Surveillance:\n  - High-risk patients require routine 12-lead ECG and serial high-sensitivity Troponin I/T measurements at 24 and 48 hours postoperatively.\n• Extubation Protocol:\n  - Smooth awake extubation avoiding coughing, bucking, shivering, or hypoxia. Administer IV Lignocaine 1 mg/kg or Dexmedetomidine 0.5 mcg/kg 10 minutes prior to extubation to prevent sympathetic surge."
      },
      {
        h: "10. Clinical Vignette & High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• Clinical Vignette:\n  A 67-year-old diabetic male with known CAD (DES to LAD 9 months ago, baseline HR 62 bpm, BP 130/80) undergoes open hemicolectomy under GA. Post-induction, SBP drops to 85/50 with HR 60. Ephedrine 6 mg is given; within 90 seconds HR spikes to 105 bpm and Lead V5 displays 2.5 mm ST-segment depression. The anesthesiologist recognizes that Ephedrine caused beta-1 tachycardia that tipped the myocardial oxygen balance. Esmolol 40 mg IV is administered immediately, dropping HR back to 64 bpm. SBP is restored to 125/75 using a low-dose Phenylephrine infusion. Within 4 minutes, ST segments in V5 return to baseline without enzyme elevation.\n• High-Yield Exam Viva Pearls:\n  - Q: Why is tachycardia far more hazardous than hypertension in IHD?\n    A: Hypertension increases MVO₂, but simultaneously increases aortic diastolic pressure (CPP). Tachycardia increases MVO₂ while simultaneously shortening diastole, starving the myocardium from both sides.\n  - Q: What are the two types of perioperative myocardial infarction?\n    A: Type 1 MI is acute plaque rupture and thrombosis caused by perioperative stress and hypercoagulability. Type 2 MI is myocardial ischemia caused by supply-demand mismatch (tachycardia, hypotension, anemia, or hypoxemia) without acute plaque rupture.\n  - Q: Why is Lead V5 the single most important monitoring lead in CAD?\n    A: Because it overlies the anterolateral left ventricle and reflects blood flow from the left anterior descending and circumflex arteries, capturing ~75% of all intraoperative ischemic episodes."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 2, Jaypee Brothers Medical Publishers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65 (Cardiac Anesthesia), Elsevier, 2025/2026.",
      "Halvorsen S, et al. 2022 ESC Guidelines on cardiovascular assessment and management of patients undergoing non-cardiac surgery. Eur Heart J 2022;43(38):3826-3924."
    ]
  },

  // 3. CABG ON CARDIOPULMONARY BYPASS
  {
    id: "case-cabg-cardiopulmonary-bypass",
    cat: "case_cardiac",
    name: "Coronary Artery Bypass Grafting (CABG) on CPB",
    short: "CABG on CPB",
    tags: ["Cardiac", "CABG", "CPB", "Cardioplegia", "Heparin Resistance", "Protamine Shock", "Case Discussion"],
    tagline: "Slow, small & normotensive, systemic heparinization ACT > 480s, cardioplegia arrest & protamine reversal",
    source: "Objective Anaesthesia Review, 6th ed.; Miller's Anesthesia, 10th ed., Ch. 65; Hensley's Practical Approach to Cardiothoracic Anesthesia, 6th ed.",
    sections: [
      {
        h: "1. Definition, Coronary Anatomy & Surgical Indications",
        b: "• Definition & Targets: Surgical revascularization using arterial conduits (Left Internal Mammary Artery [LIMA] to LAD; Radial Artery) and reversed saphenous vein grafts (SVG to diagonal, obtuse marginal [OM], and posterior descending artery [PDA]).\n• Class I Indications for CABG (AHA/ACC & EACTS):\n  1. Significant Left Main coronary artery disease (≥50% stenosis).\n  2. Triple vessel disease (≥70% stenosis in LAD, LCx, and RCA), especially with impaired LV function (LVEF < 50%) or diabetes mellitus.\n  3. Proximal LAD disease plus 1 or 2 other major vessels with inducible ischemia.\n• Syntax Score: Quantifies coronary lesion complexity. Score > 33 favors CABG over PCI."
      },
      {
        h: "2. Pathophysiology & Pre-Bypass Hemodynamic Goals",
        b: "• The Pre-Bypass Mantra (\"Slow, Small, Normotensive\"):\n  - Heart Rate: 50–65 bpm. Reduces MVO₂ and prolongs diastolic coronary perfusion.\n  - Ventricular Volume (Preload): Keep heart small. Avoid volume overload (elevates wall tension and compresses subendocardium).\n  - Blood Pressure: Maintain MAP 70–85 mmHg. Avoid hypotension (drops CPP across critical stenoses) and severe hypertension (spikes afterload and wall stress).\n  - Contractility: Avoid unnecessary inotropes before bypass; avoid myocardial depressants."
      },
      {
        h: "3. Preoperative Evaluation & Medication Management",
        b: "• History & Angiogram Review: Note left main stenosis (extreme hazard during induction!), number of distal targets, collateral circulation, and LV function (LVEF, LVEDP, regional wall motion).\n• Medications:\n  - Continue: Aspirin, Beta-blocker, Statin.\n  - Discontinue: Clopidogrel 5 days prior (Ticagrelor 3 days, Prasugrel 7 days) for elective CABG to reduce bleeding, unless acute coronary syndrome mandates urgent surgery.\n  - Withhold: ACE inhibitors / ARBs on morning of surgery (prevents post-CPB vasoplegic shock); SGLT2 inhibitors 3 days prior."
      },
      {
        h: "4. Systemic Anticoagulation & Heparin Resistance Management",
        b: "• Heparinization Protocol:\n  - Administer Heparin 300 to 400 units/kg via central line prior to aortic cannulation.\n  - Target Activated Clotting Time (ACT): Baseline ACT is 100–140 seconds. Safe full CPB initiation requires ACT > 480 seconds (or > 400 seconds on some machines).\n• Heparin Resistance Protocol:\n  - Defined as failure to reach ACT > 480 s despite 400–500 units/kg of heparin.\n  - Etiology: Antithrombin III (AT-III) deficiency, commonly induced by prolonged preoperative heparin infusions, sepsis, or congenital deficiency.\n  - Management: Administer Fresh Frozen Plasma (FFP, 2 units contains AT-III) or recombinant Antithrombin III concentrate (500–1000 units), then repeat ACT."
      },
      {
        h: "5. Cardiopulmonary Bypass Phases & Myocardial Protection",
        b: "• Cannulation Sequence: Ascending aorta cannulated first (keep SBP 90–100 mmHg to prevent aortic dissection), followed by venous cannulation (two-stage single cannula in right atrium or bicaval cannulation).\n• Initiation of CPB: Pump flow targeted to 2.4 L/min/m² cardiac index; confirm arterial line flat/non-pulsatile; turn OFF mechanical ventilation; administer volatile anesthetic via pump oxygenator vaporizer; maintain MAP 50–70 mmHg on pump.\n• Myocardial Protection (Cardioplegia Arrest):\n  - Aortic cross-clamp applied; cold (4°C) hyperkalemic blood cardioplegia (e.g. Del Nido or 4:1 blood:crystalloid) delivered antegrade via aortic root and/or retrograde via coronary sinus.\n  - Mechanism: K⁺ (16–20 mEq/L) depolarizes cardiac myocyte membrane, arresting heart in diastole and reducing MVO₂ by >95%.\n• Rewarming: Rewarm gradually to 36.5°C; avoid arterial outlet temperature > 37.0°C to prevent cerebral hyperthermia."
      },
      {
        h: "6. Weaning from CPB & Inotropic Support",
        b: "• Weaning Checklist (The \"RHYTHM\" Mnemonic):\n  - R (Rhythm): Stable sinus rhythm or AV pacing at 75–85 bpm; de-airing verified on TEE.\n  - H (Heart Rate / Heating): Core temperature > 36.0°C.\n  - Y (Ventilation): Lungs reinflated under direct vision; mechanical ventilation resumed (100% O₂, tidal volume 6–8 mL/kg).\n  - T (Transfusion / Trace): ABG within normal limits (pH > 7.30, K⁺ 4.0–5.0 mEq/L, ionized calcium > 1.1 mmol/L, Hematocrit > 24%–26%).\n  - M (Monitor): Arterial line transducer zeroed, TEE inspecting LV/RV wall motion and filling.\n• Pharmacological Support during Separation:\n  - If LV dysfunction: Dobutamine (2.5–5 mcg/kg/min) or Milrinone (0.25–0.5 mcg/kg/min).\n  - If vasoplegia: Norepinephrine (0.02–0.1 mcg/kg/min) or Vasopressin (0.01–0.04 units/min)."
      },
      {
        h: "7. Protamine Reversal & Catastrophic Protamine Reactions",
        b: "• Protamine Sulfate Administration:\n  - Dose: 1 mg of Protamine per 100 units of initial Heparin administered.\n  - Infuse SLOWLY over 10 to 15 minutes via peripheral vein or slow central venous infusion.\n• The 3 Types of Protamine Reactions:\n  - Type I (Rapid Administration): Histamine-mediated systemic vasodilation and hypotension. Treat with fluids and phenylephrine.\n  - Type II (Anaphylactoid / IgE-Mediated): True hypersensitivity with bronchospasm, flushing, and cardiovascular collapse. High risk in NPH insulin users, prior protamine exposure, fish allergy, and vasectomized males.\n  - Type III (Catastrophic Pulmonary Hypertension): Thromboxane A2 and endothelin release provoking acute, massive pulmonary vasoconstriction, acute RV dilation, and severe systemic hypotension. Stop protamine immediately, administer inotropes, calcium, pulmonary vasodilators, and prepare to re-cannulate for CPB."
      },
      {
        h: "8. Postoperative Management in CTICU",
        b: "• Bleeding & Chest Tube Drainage:\n  - Acceptable mediastinal drainage: < 100 mL/hr in first 4 hours.\n  - Excessive bleeding: > 200 mL/hr for 2 consecutive hours, or > 400 mL in 1 hour. Perform TEG/ROTEM to differentiate surgical bleeding from residual heparin, hypofibrinogenemia, or thrombocytopenia.\n• Cardiac Tamponade Signs: Sudden cessation of chest tube output followed by hypotension, tachycardia, elevated CVP, and equalizing diastolic pressures on Swan-Ganz / arterial tracing. Mandates immediate emergency surgical re-exploration."
      },
      {
        h: "9. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What are the consequences of accidental hyperthermic rewarming (>37.5°C) on CPB?\n    A: Accelerates cerebral oxygen consumption, exacerbates ischemic-reperfusion injury, and significantly increases postoperative delirium and cognitive dysfunction.\n  - Q: How does LIMA harvesting affect arterial line pressure monitoring?\n    A: Retraction of the sternal retractor during LIMA harvesting can compress the left subclavian artery, causing dampening and falsely low blood pressure readings in a left radial arterial line. A right radial arterial line is therefore preferred in CABG.\n  - Q: Why is Del Nido cardioplegia increasingly popular?\n    A: It contains lidocaine (fast sodium channel blocker) and magnesium, allowing prolonged, single-dose electromechanical arrest for up to 90 minutes without redosing."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65, Elsevier, 2025/2026.",
      "Hensley's Practical Approach to Cardiothoracic Anesthesia, 6th ed. Wolters Kluwer, 2019."
    ]
  },

  // 4. ANESTHETIC CONSIDERATIONS FOR A HYPERTENSIVE PATIENT
  {
    id: "case-anesthetic-hypertensive-patient",
    cat: "case_cardiac",
    name: "Anesthetic Considerations for a Hypertensive Patient",
    short: "Hypertensive Patient",
    tags: ["Cardiac", "Hypertension", "Autoregulation", "End-Organ Damage", "Case Discussion"],
    tagline: "Right-shifted cerebral autoregulation, target BP within 20% baseline, ACEi vasoplegia & intraoperative crisis management",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 3; Miller's Anesthesia, 10th ed., Ch. 18 & 40; 2024 ESH/ESC Hypertension Guidelines.",
    sections: [
      {
        h: "1. Definition, Classification & Target Organ Damage",
        b: "• Definition & Staging (2024 ESH / ACC/AHA Criteria):\n  - Normal BP: < 120/80 mmHg.\n  - Stage 1 Hypertension: 130–139 / 80–89 mmHg.\n  - Stage 2 Hypertension: ≥ 140 / ≥ 90 mmHg.\n  - Severe / Grade 3 Hypertension: SBP ≥ 180 mmHg or DBP ≥ 110 mmHg.\n• Target Organ Damage (TOD) Checklist:\n  1. Cardiac: Left ventricular hypertrophy (LVH), diastolic dysfunction, CAD, heart failure.\n  2. Cerebral: Transient ischemic attack (TIA), ischemic stroke, intracerebral hemorrhage, vascular dementia.\n  3. Renal: Nephrosclerosis, microalbuminuria, elevated serum creatinine, CKD.\n  4. Vascular: Peripheral artery disease, aortic aneurysm/dissection.\n  5. Retinal: Keith-Wagener-Barker retinopathy (Grade I–IV)."
      },
      {
        h: "2. Pathophysiology: Vascular Sclerosis & The Right-Shifted Autoregulation Curve",
        b: "• Right-Shifted Autoregulation Curve:\n  - In normotensive adults, cerebral blood flow (CBF) is autoregulated across MAP 50 to 150 mmHg.\n  - Chronic hypertension causes medial muscular hypertrophy and hyaline arteriolosclerosis, shifting the entire curve to the right (e.g. MAP 80 to 180 mmHg).\n  - Danger: Lowering MAP into a \"normal adult\" range (e.g. MAP 60 mmHg) induces cerebral, renal, and myocardial hypoperfusion and watershed ischemic stroke!\n• The Hemodynamic Rollercoaster:\n  - Chronic hypertensives have intense vascular constriction and diminished intravascular volume (pressure natriuresis).\n  - They display marked hemodynamic instability: severe post-induction hypotension (vasodilation + hypovolemia) followed by exaggerated hypertensive spikes during laryngoscopy, incision, and extubation."
      },
      {
        h: "3. Preoperative Evaluation & Postponement Criteria",
        b: "• When to Postpone Elective Surgery?\n  - Elective surgery should be postponed if SBP ≥ 180 mmHg or DBP ≥ 110 mmHg (Grade 3 / Severe Stage 2), especially in the presence of acute or uninvestigated target organ damage.\n  - For DBP 100–109 mmHg without acute TOD: Surgery can proceed with careful intraoperative hemodynamic control, as trials demonstrate no difference in 30-day outcomes.\n• Preoperative Investigations:\n  - ECG (voltage criteria for LVH, strain patterns, ischemic changes).\n  - Serum electrolytes, BUN, creatinine, fasting blood glucose.\n  - Echocardiogram if murmur, poor functional capacity, or suspected heart failure."
      },
      {
        h: "4. Preoperative Drug Management & ACEi Vasoplegia",
        b: "• Medication Management on Day of Surgery:\n  - CONTINUE: Beta-blockers, Calcium channel blockers (Amlodipine), Alpha-2 agonists (Clonidine: sudden omission triggers catastrophic rebound hypertension!).\n  - WITHHOLD: ACE inhibitors (Enalapril, Ramipril) and ARBs (Losartan, Telmisartan) on the morning of surgery (12–24h prior).\n• Mechanism of ACEi/ARB Vasoplegic Shock:\n  - General anesthesia suppresses the sympathetic nervous system.\n  - If the Renin-Angiotensin-Aldosterone System (RAAS) is simultaneously blocked by ACEi/ARB, the patient loses both major compensatory vasoconstrictor mechanisms, triggering refractory post-induction hypotension unresponsive to ephedrine or phenylephrine.\n  - Rescue Vasopressor for ACEi Vasoplegia: TERLIPRESSIN (1 mg IV) or VASOPRESSIN (0.5–1 unit IV bolus, then 0.01–0.04 units/min infusion) or METHYLENE BLUE (1–2 mg/kg IV)."
      },
      {
        h: "5. Intraoperative Strategy, Monitoring & Induction",
        b: "• Hemodynamic Targets: Keep MAP within ±20% of the patient's baseline resting blood pressure.\n• Monitoring: Arterial line indicated if severe hypertension, baseline labile pressures, significant CAD/LVH, or major surgical fluid shifts.\n• Blunting the Pressor Response to Laryngoscopy:\n  - Laryngoscopy spikes SBP by 40–60 mmHg within 30 seconds.\n  - Administer Fentanyl 3–5 mcg/kg, or Lignocaine 1.5 mg/kg, or Esmolol 0.5–1.0 mg/kg 90 seconds prior to intubation.\n• Induction Agents: Etomidate (0.2–0.3 mg/kg) or slow titrated Propofol co-administered with small crystalloid bolus. Vecuronium or Rocuronium for relaxation."
      },
      {
        h: "6. Intraoperative Crisis Management & Postoperative Care",
        b: "• Management of Intraoperative Hypertensive Crises (MAP > 20% above baseline):\n  - First rule out light anesthesia, hypoxemia, hypercapnia, or full urinary bladder.\n  - IV Labetalol: 5–10 mg boluses every 5–10 minutes (combined alpha and beta blockade; 1:7 ratio IV).\n  - IV Nicardipine: 5 mg/h infusion, titrated up by 2.5 mg/h every 15 min.\n  - IV Nitroglycerin (NTG): 0.5–2.0 mcg/kg/min (preferred if concurrent myocardial ischemia).\n• Emergence & Postoperative Care:\n  - Extubate deep or smooth awake using IV Lignocaine 1 mg/kg or Dexmedetomidine 0.5 mcg/kg to avoid emergence hypertension.\n  - Ensure adequate postoperative analgesia (pain is the #1 cause of postoperative hypertensive crises)."
      },
      {
        h: "7. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What is the primary hazard of rapidly lowering blood pressure in a chronic hypertensive?\n    A: Because the cerebral autoregulation curve is shifted to the right, acute normalization of BP can induce cerebral hypoperfusion, delirium, and ischemic stroke.\n  - Q: Why is Clonidine withdrawal dangerous?\n    A: Abrupt cessation causes a massive surge in circulating catecholamines within 18–36 hours, precipitating hypertensive encephalopathy, intracranial hemorrhage, or myocardial infarction.\n  - Q: What is the drug of choice for refractory post-induction vasoplegia in a patient on Telmisartan?\n    A: Vasopressin or Terlipressin, because V1 receptors are independent of adrenergic and angiotensin pathways."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 3, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 18 & 40, Elsevier, 2025/2026.",
      "Mancia G, et al. 2023 ESH Guidelines for the management of arterial hypertension. J Hypertens 2023;41(12):1874-2071."
    ]
  },

  // 5. TETRALOGY OF FALLOT (TOF)
  {
    id: "case-tetralogy-of-fallot",
    cat: "case_cardiac",
    name: "Tetralogy of Fallot (TOF)",
    short: "Tetralogy of Fallot",
    tags: ["Cardiac", "Congenital", "TOF", "Cyanotic Heart Disease", "Tet Spells", "Case Discussion"],
    tagline: "Preserve SVR, avoid infundibular spasm, maintain preload & hypercyanotic Tet spell rescue",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 4; Miller's Anesthesia, 10th ed., Ch. 73 (Pediatric Cardiac Anesthesia).",
    sections: [
      {
        h: "1. Definition & The 4 Classic Anatomical Defects",
        b: "• The 4 Hallmarks of Tetralogy of Fallot:\n  1. Large, non-restrictive Malalignment Ventricular Septal Defect (VSD).\n  2. Right Ventricular Outflow Tract Obstruction (RVOTO): Infundibular (subvalvular) muscular spasm, valvular, or supravalvular pulmonary stenosis.\n  3. Overriding Aorta (straddling the ventricular septum by up to 50%).\n  4. Right Ventricular Hypertrophy (RVH) secondary to chronic pressure overload.\n• Clinical Spectrum: Ranges from \"Pink Fallot\" (mild RVOTO, minimal shunting) to severely cyanotic Fallot with dynamic infundibular spasm."
      },
      {
        h: "2. Pathophysiology: Shunt Dynamics & The Hypercyanotic 'Tet Spell'",
        b: "• Determinants of Right-to-Left Shunt:\n  - In TOF, the VSD is non-restrictive (RV systolic pressure equals LV systolic pressure).\n  - The direction and magnitude of blood flow is dictated strictly by the ratio of Systemic Vascular Resistance (SVR) to Pulmonary Vascular Resistance (PVR + RVOTO):\n    * Shunt = SVR / (PVR + RVOTO)\n    * Decreased SVR or Increased RVOTO / PVR increases right-to-left shunting, bypassing the lungs and causing profound hypoxemia.\n• Pathophysiology of the 'Tet Spell' (Hypercyanotic Crisis):\n  - Triggered by crying, agitation, pain, tachycardia, acidosis, or hypovolemia.\n  - Sympathetic surge causes acute muscular spasm of the dynamic subpulmonary infundibulum (RVOTO spikes dramatically).\n  - Blood is diverted entirely away from the lungs across the VSD into the aorta, precipitating acute severe arterial desaturation (SpO₂ < 40%), hyperpnea, syncope, seizures, or cardiac arrest."
      },
      {
        h: "3. Preoperative Evaluation & Compensatory Polycythemia",
        b: "• Compensatory Secondary Polycythemia:\n  - Chronic hypoxemia stimulates renal erythropoietin secretion, driving Hematocrit to 55%–70%.\n  - Hazards: Hyperviscosity syndrome (cerebral venous thrombosis, headache, fatigue) and paradoxical coagulopathy (depletion of clotting factors and platelets).\n  - Preoperative Phlebotomy Rule: If Hematocrit > 65%, perform isovolemic hemodilution with 5% albumin or crystalloid prior to surgery to reduce microvascular thrombosis.\n• Paradoxical Air Embolism Hazard:\n  - Any intravenous air bubble can cross directly through the VSD into the systemic and cerebral circulation, causing instantaneous stroke. ALL IV lines must have air-bubble filters and meticulous de-airing."
      },
      {
        h: "4. Anesthetic Strategy & The Cardinal Hemodynamic Goals",
        b: "• The Cardinal Hemodynamic Goals in TOF:\n  1. MAINTAIN OR INCREASE SVR: Avoid systemic vasodilation (which worsens right-to-left shunt).\n  2. AVOID INFUNDIBULAR SPASM: Keep myocardial contractility and heart rate controlled; avoid exogenous inotropes.\n  3. MAINTAIN PRELOAD: A full intravascular volume keeps the RV cavity expanded and stents open the infundibulum.\n  4. KEEP PVR LOW: Avoid hypoxia, hypercapnia, acidosis, and hypothermia.\n• Technique:\n  - Inhalational or intravenous general anesthesia with complete neuromuscular blockade and invasive monitoring.\n  - Premedication is MANDATORY: Crying or agitation triggers infundibular spasm. Administer Oral Midazolam (0.5 mg/kg) or Ketamine (3–5 mg/kg IM) with parents present."
      },
      {
        h: "5. Detailed Induction & Maintenance Pharmacology",
        b: "• Induction Agents:\n  - KETAMINE (1–2 mg/kg IV or 4–6 mg/kg IM): Drug of choice in TOF! Ketamine increases SVR through sympathetic stimulation, reduces right-to-left shunt, and preserves airway tone.\n  - High-Dose OPIOIDS (Fentanyl 3–5 mcg/kg): Excellent hemodynamic stability, blunts infundibular irritability.\n  - PROPOFOL & ISOFLURANE / SEVOFLURANE: Caution! Significant reduction in SVR increases right-to-left shunting. If volatile used, titrate slowly and co-administer phenylephrine.\n• Muscle Relaxants: Rocuronium (0.6–0.9 mg/kg) or Vecuronium (0.1 mg/kg). Avoid Pancuronium (tachycardia worsens infundibular narrowing)."
      },
      {
        h: "6. Treatment Protocol for Acute Intraoperative Tet Spell",
        b: "• Step-by-Step Hypercyanotic Crisis Rescue Algorithm:\n  1. 100% FiO₂ delivered with tight seal / hyperventilation.\n  2. KNEE-CHEST POSITION (or flex hips tightly onto abdomen): Kinks femoral arteries, acutely increasing SVR and forcing blood into the pulmonary circulation.\n  3. IV FLUID BOLUS (Balanced crystalloid 10–20 mL/kg): Expands RV cavity and stents open the dynamic infundibulum.\n  4. PHENYLEPHRINE (5–10 mcg/kg IV bolus, then infusion): Pure alpha-1 agonist; elevates SVR, reversing the shunt.\n  5. ESMOLOL (0.5 mg/kg slow IV) or PROPRANOLOL (0.1 mg/kg slow IV): Relaxes infundibular muscular spasm and slows heart rate.\n  6. MORPHINE (0.1 mg/kg IV): Suppresses respiratory drive and reduces sympathetic discharge.\n  7. SODIUM BICARBONATE (1–2 mEq/kg IV): Corrects metabolic acidosis (acidosis worsens pulmonary vasoconstriction)."
      },
      {
        h: "7. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why do children with TOF instinctively squat during a cyanotic spell?\n    A: Squatting kinks the femoral arteries, acutely increasing Systemic Vascular Resistance (SVR), which shifts the shunt from right-to-left towards the pulmonary circulation, improving oxygenation.\n  - Q: Why is Ketamine the ideal induction agent in TOF?\n    A: Because it preserves or increases SVR, preventing worsening of the right-to-left shunt, unlike propofol which drops SVR.\n  - Q: What is the Blalock-Taussig (BT) shunt?\n    A: A palliative surgical systemic-to-pulmonary shunt connecting the subclavian artery to the pulmonary artery (modified BT shunt uses a GORE-TEX conduit) to augment pulmonary blood flow in severe TOF."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 4, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 73, Elsevier, 2025/2026.",
      "Baum VC, O'Flaherty JE. The Pediatric Cardiac Anesthesia Handbook. Wiley-Blackwell."
    ]
  },

  // 6. PATENT DUCTUS ARTERIOSUS (PDA) LIGATION
  {
    id: "case-patent-ductus-arteriosus",
    cat: "case_cardiac",
    name: "Patent Ductus Arteriosus (PDA) Ligation",
    short: "PDA Ligation",
    tags: ["Cardiac", "Pediatric", "PDA", "Left-to-Right Shunt", "Prematurity", "Case Discussion"],
    tagline: "Left-to-right shunt run-off, maintain SVR/PVR balance, post-ligation hypertension & coarctation check",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 5; Miller's Anesthesia, 10th ed., Ch. 73.",
    sections: [
      {
        h: "1. Definition, Anatomy & Left-to-Right Shunt Physiology",
        b: "• Anatomy: Persistent patency of the vessel connecting the proximal descending aorta (just distal to the left subclavian artery) to the roof of the main pulmonary artery bifurcation.\n• Shunt Hemodynamics:\n  - Under normal conditions, SVR exceeds PVR, producing a massive Left-to-Right Shunt.\n  - Continuous Run-off into Pulmonary Circulation: In diastole, aortic blood flows continuously into the low-resistance pulmonary bed (\"diastolic run-off\"), producing a wide pulse pressure (bounding water-hammer pulse) and low aortic diastolic pressure.\n  - Steal Phenomenon: Diastolic run-off steals blood from systemic organs, causing intestinal ischemia (necrotizing enterocolitis [NEC]), renal hypoperfusion, and intraventricular hemorrhage (IVH) in premature neonates.\n  - Pulmonary Overcirculation: Floods the pulmonary capillary bed, causing pulmonary edema, decreased lung compliance, and ventilator dependence."
      },
      {
        h: "2. Preoperative Medical Management & Indomethacin / Paracetamol",
        b: "• Pharmacological Closure:\n  - Intravenous Indomethacin or Ibuprofen (cyclooxygenase inhibitors blocking prostaglandin E2 synthesis) or IV Paracetamol (acetaminophen).\n  - If medical therapy fails, or in the presence of necrotizing enterocolitis, renal failure, or active bleeding, surgical or transcatheter closure is indicated.\n• Preoperative Checklist in Neonates:\n  - Check renal function and platelets (indomethacin causes transient renal insufficiency and platelet dysfunction).\n  - Check baseline blood gas and chest radiograph (pulmonary plethora, cardiomegaly)."
      },
      {
        h: "3. Anesthetic Management & Surgical Concerns",
        b: "• Monitoring Suite:\n  - Pre-ductal Pulse Oximeter placed on Right Upper Extremity (reflects brain/retinal oxygenation).\n  - Post-ductal Pulse Oximeter placed on Lower Extremity (detects accidental aortic coarctation/ligation!).\n  - Right Radial Arterial Line (pre-ductal BP monitoring).\n• Surgical Position: Right lateral decubitus position via left posterolateral thoracotomy. Retraction of the non-ventilated left lung causes hypoxemia and hypercapnia.\n• Critical Moment of Ductus Ligation (The Two Hazards):\n  1. ACCIDENTAL LIGATION OF DESCENDING AORTA OR LEFT PULMONARY ARTERY: Immediately verified by comparing pre- and post-ductal pulse oximeter plethysmography and palpating femoral pulses.\n  2. ACUTE INCREASE IN AFTERLOAD: Obliterating the low-resistance pulmonary run-off suddenly increases LV afterload, causing transient systemic hypertension and potential LV failure."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What is the continuous machinery murmur in PDA?\n    A: Heard best at the left upper sternal border; present throughout both systole and diastole because aortic pressure exceeds pulmonary artery pressure during the entire cardiac cycle.\n  - Q: What happens to pulse pressure in PDA?\n    A: Widens dramatically (e.g. 70/20 mmHg) due to continuous diastolic run-off of blood from the aorta into the pulmonary artery.\n  - Q: What is Eisenmenger syndrome in PDA?\n    A: Irreversible severe pulmonary vascular remodeling leading to PVR exceeding SVR, reversing the shunt to Right-to-Left, producing differential cyanosis (pink upper body, cyanotic lower limbs)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 5, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 73, Elsevier, 2025/2026."
    ]
  },

  // 7. PERMANENT PACEMAKER & CIED MANAGEMENT
  {
    id: "case-permanent-pacemaker",
    cat: "case_cardiac",
    name: "Permanent Pacemaker & CIED Management",
    short: "Pacemakers & CIEDs",
    tags: ["Cardiac", "Pacemaker", "ICD", "CIED", "Electrocautery", "EMI", "Case Discussion"],
    tagline: "NASPE/BPEG 5-letter code, magnet response, EMI mitigation & postoperative interrogation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 6; Miller's Anesthesia, 10th ed., Ch. 41; 2020 HRS/ASA Expert Consensus Statement on CIEDs.",
    sections: [
      {
        h: "1. The NASPE/BPEG Revised 5-Letter Pacemaker Code",
        b: "• The Revised NASPE/BPEG Generic (NBG) Code:\n  - Position I: Chamber Paced (O = None, A = Atrium, V = Ventricle, D = Dual A+V).\n  - Position II: Chamber Sensed (O = None, A = Atrium, V = Ventricle, D = Dual A+V).\n  - Position III: Response to Sensing (O = None, I = Inhibited, T = Triggered, D = Dual I+T).\n  - Position IV: Rate Modulation / Programmability (O = None, R = Rate-adaptive sensor active).\n  - Position V: Multisite Pacing (O = None, A = Atrium, V = Ventricle, D = Dual).\n• Common Modes:\n  - VVI: Paces ventricle, senses ventricle, inhibited by intrinsic R wave. Simple, reliable, but lacks AV synchrony.\n  - DDD: Paces both, senses both; maintains physiological AV synchrony."
      },
      {
        h: "2. Electromagnetic Interference (EMI) Hazards & Electrosurgery",
        b: "• The 4 Surgical EMI Risks:\n  1. INAPPROPRIATE INHIBITION: EMI from monopolar cautery is sensed as intrinsic cardiac activity, causing the pacemaker to inhibit firing, precipitating asystole in a pacemaker-dependent patient!\n  2. INADVERTENT REPROGRAMMING: Strong radiofrequency current resets generator into factory backup mode (VVI or VOO).\n  3. ICD FALSE SHOCKS: EMI sensed as ventricular fibrillation, triggering painful, dangerous high-voltage internal defibrillator shocks.\n  4. THERMAL MYOCARDIAL INJURY: Electrical energy conducted down the lead tip causes endocardial thermal burn and loss of capture.\n• Rules for Monopolar Electrosurgery:\n  - Use BIPOLAR cautery whenever possible (current restricted between forceps tips).\n  - If monopolar necessary: Place return pad as close to surgical site and as far from CIED generator as possible (current path must NEVER cross the heart or generator).\n  - Keep bursts short (< 4–5 seconds) and use lowest effective power."
      },
      {
        h: "3. Magnet Application Behavior: Pacemaker vs ICD",
        b: "• Pacemaker Response to Magnet:\n  - Applying a clinical ring magnet switches the pacemaker into an asynchronous fixed-rate pacing mode (DOO, VOO, or AOO) at a manufacturer-specific rate (e.g. Medtronic: 85 bpm; Boston Scientific: 100 bpm; St. Jude: 100 bpm).\n  - Sensing is disabled; EMI cannot cause inappropriate inhibition.\n• ICD (Defibrillator) Response to Magnet:\n  - Placing a magnet over an ICD SUSPENDS TACHYARRHYTHMIA DETECTION AND DEFIBRILLATOR SHOCKS (prevents false shocks from EMI).\n  - CRITICAL WARNING: A magnet DOES NOT alter the bradycardia pacing mode of an ICD! If the patient is pacemaker-dependent, an ICD must be formally reprogrammed to an asynchronous mode (VOO/DOO) prior to surgery by a programmer!"
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: How do you determine if a patient is pacemaker-dependent at the bedside?\n    A: Inquire if the patient has a history of syncope, complete heart block, or sinus node ablation. Review ECG: if 100% of complexes are paced with no intrinsic rhythm, the patient must be treated as pacemaker-dependent.\n  - Q: What backup equipment must be in the operating room for a patient with an ICD?\n    A: An external defibrillator with transcutaneous pacing pads placed on the patient prior to induction, and emergency atropine/isoproterenol.\n  - Q: What happens when the magnet is removed from an ICD?\n    A: Normal shock detection and anti-tachycardia therapy resume immediately."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 6, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 41, Elsevier, 2025/2026.",
      "Crossley GH, et al. The Heart Rhythm Society (HRS)/ASA Expert Consensus Statement on the perioperative management of patients with implantable defibrillators and pacemakers. Heart Rhythm 2011;8(7):1114-1154."
    ]
  },

  // 8. PERIPHERAL VASCULAR DISEASE & MAJOR AORTIC SURGERY
  {
    id: "case-peripheral-vascular-disease",
    cat: "case_cardiac",
    name: "Peripheral Vascular Disease & Major Aortic Surgery",
    short: "PVD & Aortic Surgery",
    tags: ["Cardiac", "Vascular", "PVD", "Aortic Cross-Clamp", "Reperfusion Shock", "Spinal Cord Ischemia", "Case Discussion"],
    tagline: "Aortic cross-clamp hemodynamics, declamp reperfusion shock, Adamkiewicz spinal protection & renal preservation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 7; Miller's Anesthesia, 10th ed., Ch. 66 (Vascular Anesthesia).",
    sections: [
      {
        h: "1. Definition, Clinical Staging & Systemic Atherosclerosis",
        b: "• Systemic Atherosclerosis Rule: PVD is never an isolated disease. Over 60%–80% of patients have severe concurrent Coronary Artery Disease (CAD), 30% have carotid stenosis, and 25% have renal artery stenosis.\n• Fontaine Classification of PVD:\n  - Stage I: Asymptomatic.\n  - Stage II: Intermittent claudication (IIa: walking distance >200m; IIb: <200m).\n  - Stage III: Rest pain (ischemic night pain, relieved by hanging foot dependent).\n  - Stage IV: Ischemic ulceration or gangrene."
      },
      {
        h: "2. Hemodynamics of Aortic Cross-Clamping & Declamping Shock",
        b: "• Hemodynamic Sequelae of Aortic Cross-Clamping:\n  - Sudden massive increase in Afterload: Systemic Vascular Resistance (SVR) spikes by 40%–100% depending on clamp level (infrarenal vs suprarenal vs thoracic).\n  - Left Ventricular Strain: SBP, MAP, and PCWP spike; acute subendocardial ischemia or LV failure may develop in patients with CAD.\n  - Distal Tissue Hypoperfusion: Severe anaerobic metabolism below the clamp produces lactic acid, prostaglandins, and endotoxins.\n• The Declamping Reperfusion Shock (The Danger Moment!):\n  - Sudden removal of clamp drops SVR dramatically.\n  - Ischemic metabolites (lactic acid, potassium, adenosine, kinins) wash into central circulation, triggering profound systemic vasodilation, myocardial depression, and severe hypotensive collapse.\n  - Prevention: Pre-load with 500–1000 mL crystalloid before declamp; inform surgeon to release clamp slowly; start Norepinephrine infusion; ensure K⁺ and pH are optimized."
      },
      {
        h: "3. Spinal Cord Ischemia & The Artery of Adamkiewicz",
        b: "• Anatomy: The Artery of Adamkiewicz (arteria radicularis magna) arises between T9 and L2 (typically left-sided, T9–T12) and supplies the anterior two-thirds of the spinal cord (anterior spinal artery).\n• Anterior Spinal Artery Syndrome: Cross-clamping above Adamkiewicz causes spinal cord ischemia, resulting in postoperative paraplegia and loss of pain/temperature sensation, with preserved dorsal column proprioception.\n• Spinal Protection Protocols in Thoracoabdominal Aneurysm Repair:\n  1. Cerebrospinal Fluid (CSF) Drainage: Continuous lumbar CSF catheter drainage maintains CSF pressure < 10 mmHg, augmenting Spinal Cord Perfusion Pressure (SCPP = MAP - CSFP).\n  2. Distal aortic perfusion (left heart bypass).\n  3. Moderate systemic hypothermia (32°C–34°C).\n  4. Soman/Motor Evoked Potential (MEP) neuromonitoring."
      },
      {
        h: "4. Renal Preservation & Postoperative Management",
        b: "• Renal Protection:\n  - Suprarenal clamping causes direct renal ischemia; infrarenal clamping reduces renal cortical blood flow by 30% via renin-angiotensin activation and renal vasoconstriction.\n  - Maintain intravascular euvolemia and MAP > 70 mmHg. Mannitol (0.25–0.5 g/kg) given 20 minutes before cross-clamping reduces free radical injury and promotes osmotic diuresis.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is a right radial arterial line mandatory in thoracic aortic surgery?\n    A: Because left subclavian artery clamping can dampen or obliterate the left radial arterial line trace.\n  - Q: What is the single most important cause of mortality following major vascular surgery?\n    A: Perioperative myocardial infarction (PMI), accounting for >50% of all perioperative deaths in PVD patients."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 7, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 66, Elsevier, 2025/2026."
    ]
  }
];
