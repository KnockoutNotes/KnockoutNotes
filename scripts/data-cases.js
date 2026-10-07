// Comprehensive Clinical Case Discussions (39 Cases)
// Based on Table of Contents of Objective Anaesthesia Review (6th ed.), Miller's Anesthesia (10th ed.) & standard curricula.
// Covers all 36 chapters from textbook image + CABG, Posterior Cranial Fossa lesion & Supratentorial brain tumour.

const cases = [
  // ============================================================================
  // CARDIOVASCULAR & THORACIC CASES (case_cardiac)
  // ============================================================================
  {
    id: "case-mitral-stenosis-phtn",
    cat: "case_cardiac",
    name: "Mitral Stenosis with Pulmonary Hypertension",
    short: "Mitral Stenosis & PHTN",
    tags: ["Cardiac", "Mitral Stenosis", "PHTN", "Atrial Fibrillation", "Case Discussion"],
    tagline: "Slow heart rate 60–70 bpm, maintain sinus rhythm & atrial kick, avoid tachycardia & prevent surges in PVR",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 1 (Mitral Stenosis with Pulmonary Hypertension); Miller's Anesthesia, 10th ed., Ch. 65; 2024 ESC/EACTS Guidelines for Valvular Heart Disease.",
    sections: [
      {
        h: "1. Case Scenario & Bedside Clinical Examination",
        b: "A 36-year-old female (gravida 2 para 1) with rheumatic heart disease diagnosed 8 years ago presents for elective open cholecystectomy. She reports progressive dyspnea on exertion (NYHA Class III) and orthopnea requiring 3 pillows. Physical examination reveals a malar flush (mitral facies), pulse 86 bpm irregularly irregular (atrial fibrillation), BP 106/68 mmHg, elevated JVP with prominent v-wave, loud first heart sound (S1), sharp opening snap, and a low-pitched rumbling mid-diastolic murmur with presystolic accentuation at the apex (best heard with bell in left lateral decubitus position). Auscultation over the left second intercostal space reveals an accentuated, palpable pulmonary component of the second heart sound (P2). Transthoracic echocardiogram demonstrates a thickened, calcified mitral valve with \"hockey-stick\" anterior leaflet motion, mitral valve area (MVA) 0.9 cm² (severe MS), mean transmitral gradient 14 mmHg, severe left atrial enlargement (LA diameter 54 mm), severe pulmonary hypertension with estimated pulmonary artery systolic pressure (PASP) 65 mmHg, and preserved LV systolic function (LVEF 55%)."
      },
      {
        h: "2. Pathophysiology & Cardinal Haemodynamic Goals",
        b: "Mitral stenosis produces mechanical obstruction to left ventricular inflow during diastole, causing elevated left atrial pressures, left atrial dilatation (predisposing to AF and thrombus formation), retrograde pulmonary venous congestion, and reactive pulmonary arterial hypertension:\n\n• The Cardinal Haemodynamic Goals (The \"Slow, Sinus, Full & SVR Normal\" Rule):\n  1. HEART RATE (SLOW, 60–70 bpm — MOST CRITICAL): Diastole accounts for 65% of the cardiac cycle at 60 bpm, but drops to <35% at 120 bpm. Tachycardia drastically shortens diastolic filling time across the fixed stenotic orifice, precipitating immediate upstream left atrial hypertension, acute pulmonary edema, and simultaneous downstream LV underfilling with cardiovascular collapse.\n  2. RHYTHM (SINUS RHYTHM PRESERVATION): Loss of the \"atrial kick\" in atrial fibrillation reduces LV stroke volume by 20%–30% in mitral stenosis. Rapid ventricular response (RVR) in AF must be aggressively prevented or cardioverted.\n  3. PRELOAD (ADEQUATELY MAINTAINED): Avoid both hypovolemia (precipitates underfilling of the small, underfilled LV) and fluid overload (precipitates pulmonary edema).\n  4. AFTERLOAD / SVR (NORMAL TO SLIGHTLY ELEVATED): Maintain systemic vascular resistance to preserve coronary perfusion pressure.\n  5. PULMONARY VASCULAR RESISTANCE (KEEP LOW): Avoid all triggers that raise PVR: Hypoxia, Hypercapnia, Acidosis, Hypothermia, High PEEP, and Pain/Agitation, which precipitate acute right ventricular decompensation."
      },
      {
        h: "3. Preoperative Optimization & Investigation Review",
        b: "• Medical Optimization:\n  - Rate Control in AF: Continue beta-blockers (metoprolol) or digoxin up to the morning of surgery to keep resting HR 60–70 bpm (exercise HR < 90 bpm).\n  - Diuretic Optimization: Continue furosemide to treat pulmonary congestion; check serum potassium and magnesium (hypokalemia predisposes to digitalis toxicity and arrhythmias).\n  - Anticoagulation Bridging: Patients with severe MS and AF are on warfarin (target INR 2.0–3.0) for stroke prevention. Stop warfarin 5 days prior; bridge with therapeutic low-molecular-weight heparin (LMWH) or unfractionated heparin, holding LMWH 24h prior to surgery. Check INR on the morning of surgery (must be < 1.5).\n• Cardiology Review: If MVA < 1.0 cm² with pliable leaflets and no LA thrombus, consider Percutaneous Transvenous Mitral Commissurotomy (PTMC / BMV) before elective major non-cardiac surgery."
      },
      {
        h: "4. Anesthetic Technique & Intraoperative Strategy",
        b: "• Choice of Anesthesia:\n  - General Anesthesia with endotracheal intubation is the gold standard for major abdominal surgery in severe MS with severe PHTN. Allows tight control of ventilation (avoiding hypercapnia and hypoxia), depth of anaesthesia, and invasive monitoring.\n  - Neuraxial Anesthesia Precautions: Dense single-shot spinal anaesthesia is CONTRAINDICATED (sudden drop in SVR triggers severe reflex tachycardia and profound hypotension). Continuous epidural anaesthesia with slow, incremental titration can be considered for lower-limb procedures.\n• Induction & Intubation:\n  - Preoxygenation 100% O₂ for 3–5 minutes.\n  - Pre-induction blunting of sympathetic intubation response: Fentanyl 3–5 mcg/kg or Esmolol 0.5–1.0 mg/kg.\n  - Induction: Etomidate 0.2–0.3 mg/kg or titrated Propofol + Vecuronium / Rocuronium 0.9 mg/kg.\n  - Maintenance: Sevoflurane in O₂/Air (avoid Nitrous Oxide! N₂O increases pulmonary vascular resistance and is strictly contraindicated in PHTN!)."
      },
      {
        h: "5. Monitoring, Inotropic Support & Crisis Management",
        b: "• Monitoring Suite: Invasive Arterial Line placed pre-induction; Central Venous Line (to monitor central venous pressure and infuse vasoactive drugs); Transesophageal Echocardiography (TEE) for real-time LV filling and RV function.\n• Vasopressor of Choice for Hypotension:\n  - PHENYLEPHRINE (pure alpha-1 agonist): Drug of choice for hypotension in MS. It elevates SVR and produces a reflex bradycardia (which is highly beneficial!).\n  - AVOID EPHEDRINE: Ephedrine stimulates beta-1 receptors, causing tachycardia that can trigger fatal pulmonary edema.\n• Management of Sudden Intraoperative Atrial Fibrillation with RVR:\n  - If hemodynamically unstable (hypotension, pulmonary edema): Immediate Synchronized DC Cardioversion (50–100 J).\n  - If stable: IV Amiodarone (150 mg bolus over 10 min, then 1 mg/min) or Esmolol (titrated ultra-short acting beta-blocker)."
      },
      {
        h: "6. Postoperative Care & High-Yield Exam Viva Pearls",
        b: "• PACU / ICU Management:\n  - Strict fluid restriction; continue analgesia (multimodal opioid-sparing with TAP block or thoracic epidural).\n  - Avoid shivering (dramatically spikes VO₂ and heart rate); aggressive rewarming.\n• High-Yield Exam Viva Questions:\n  - Q: Why is mitral stenosis called a \"fixed-output state\"? A: Because stroke volume cannot increase across the mechanically stenotic orifice, and attempting to increase cardiac output via tachycardia decreases output further by truncating diastolic filling time.\n  - Q: How does pregnancy worsen mitral stenosis? A: Pregnancy increases plasma volume by 40%–50% and resting heart rate by 15–20 bpm, often precipitating first-time pulmonary edema in the second trimester."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 1, Jaypee Brothers Medical Publishers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65 (Cardiac Anesthesia), Elsevier, 2025/2026.",
      "Vahanian A, et al. 2021 ESC/EACTS Guidelines for the management of valvular heart disease. Eur Heart J 2022;43(7):561-632."
    ]
  },
  {
    id: "case-ischemic-heart-disease",
    cat: "case_cardiac",
    name: "Ischemic Heart Disease (IHD) for Non-Cardiac Surgery",
    short: "Ischemic Heart Disease",
    tags: ["Cardiac", "IHD", "CAD", "Myocardial Ischemia", "Case Discussion"],
    tagline: "Myocardial oxygen supply-demand balance, heart rate control 50–70 bpm, maintain CPP & lead II/V5 surveillance",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 2 (Ischemic Heart Disease); Miller's Anesthesia, 10th ed., Ch. 13 & 65; 2024 ESC Guidelines on Non-Cardiac Surgery.",
    sections: [
      {
        h: "1. Case Scenario & Bedside Evaluation",
        b: "A 64-year-old male with a history of hypertension, dyslipidemia, and an anterior wall STEMI 18 months ago (treated with drug-eluting stent to LAD) presents for elective laparoscopic hemicolectomy. He reports CCS Class II angina (chest tightness when climbing two flights of stairs in cold weather, relieved by rest). Medications: Aspirin 75 mg OD, Clopidogrel 75 mg OD, Atorvastatin 40 mg OD, Metoprolol succinate 50 mg OD, Ramipril 5 mg OD. Bedside exam: HR 64 bpm regular, BP 138/82 mmHg, normal heart sounds with S4 gallop, no murmurs, chest clear. ECG: Normal sinus rhythm, Q-waves in V1–V3, flat T waves in aVL. Echocardiogram: Anterior wall hypokinesia, LVEF 45%, no significant valvular disease."
      },
      {
        h: "2. Pathophysiology of Myocardial Oxygen Supply vs Demand",
        b: "Perioperative myocardial infarction (PMI) is the leading cause of perioperative mortality in non-cardiac surgery. It occurs via two mechanisms: Type 1 MI (plaque rupture and coronary thrombosis triggered by perioperative surgical stress, catecholamines, and hypercoagulability) and Type 2 MI (supply-demand mismatch from prolonged tachycardia, hypotension, or anemia):\n\n• Determinants of Myocardial Oxygen Demand (MVO₂):\n  1. HEART RATE (Primary determinant; increases energy consumption and simultaneously shortens diastolic perfusion time!)\n  2. Left Ventricular Wall Tension / Afterload (Laplace law: P × r / 2h)\n  3. Myocardial Contractility (inotropy)\n• Determinants of Myocardial Oxygen Supply:\n  1. Coronary Perfusion Pressure (CPP = Aortic Diastolic BP - LV End-Diastolic Pressure [LVEDP])\n  2. Diastolic Perfusion Time (governed by heart rate)\n  3. Arterial Oxygen Content (CaO₂ = 1.34 × Hb × SaO₂)\n  4. Coronary Vascular Resistance & Anatomy (stenotic lesions prevent compensatory autoregulatory vasodilation).\n• The Cardinal Anesthetic Goal: Keep HR 50–70 bpm, maintain aortic diastolic pressure, avoid hypotension (reduces CPP), and avoid tachycardia (reduces diastolic time and spikes demand)."
      },
      {
        h: "3. Preoperative Optimization & Dual Antiplatelet Therapy (DAPT) Decisions",
        b: "• DAPT Timing Rules (2024 ESC / ACC/AHA Guidelines):\n  - Elective surgery should be delayed at least 6 months after Drug-Eluting Stent (DES) implantation (minimum 3 months if high-risk oncology surgery cannot wait).\n  - For non-cardiac surgery with intermediate-to-high bleeding risk: Hold P2Y12 inhibitor (Clopidogrel hold for 5 days, Ticagrelor for 3–5 days, Prasugrel for 7 days) while CONTINUING ASPIRIN throughout the perioperative period.\n  - Restart P2Y12 inhibitor within 48–72 hours postoperatively once surgical hemostasis is confirmed.\n• Medication Instructions on Morning of Surgery:\n  - Continue Aspirin, Beta-blocker, and Statin on morning of surgery with a sip of water.\n  - Withhold ACE inhibitor (Ramipril) on morning of surgery (prevents refractory post-induction vasoplegia)."
      },
      {
        h: "4. Anesthetic Management & Intraoperative Ischemia Monitoring",
        b: "• Monitoring Suite:\n  - 5-Lead ECG with automated ST-segment analysis: Lead II (monitors inferior wall / RCA) and Lead V5 (monitors anterolateral wall / LAD & LCx). Combined II + V5 monitoring detects >85% of intraoperative ischemic events.\n  - Radial Arterial Line placed pre-induction for beat-to-beat pressure control.\n• Induction Strategy:\n  - Smooth intravenous induction blunting the sympathetic surge of laryngoscopy: Fentanyl 3–5 mcg/kg or Lidocaine 1.5 mg/kg administered 90 seconds prior to intubation.\n  - Induction: Etomidate 0.2–0.3 mg/kg (cardiovascular stability) or carefully titrated Propofol + Vecuronium/Rocuronium.\n  - Maintenance: Sevoflurane (provides ischemic preconditioning) titrated to MAC 0.8–1.0 with opioid analgesia."
      },
      {
        h: "5. Intraoperative Management of Ischemia & Tachycardia",
        b: "• If ST-segment depression / T-wave inversion develops intraoperatively:\n  1. Check Heart Rate: If HR > 75 bpm, administer IV Esmolol (bolus 0.5 mg/kg, then infusion) or Metoprolol (1–2 mg IV increments) to lower HR to < 65 bpm.\n  2. Check Blood Pressure: If MAP is low, administer Phenylephrine or Norepinephrine to restore coronary perfusion pressure.\n  3. If BP is elevated with ischemia: Start Nitroglycerin (NTG) infusion (0.5–2 mcg/kg/min) to promote coronary vasodilation and lower preload/wall tension.\n  4. Optimize Oxygenation & Anemia: Keep FiO₂ > 0.50; maintain Hemoglobin > 8–9 g/dL."
      },
      {
        h: "6. Postoperative Surveillance & High-Yield Viva Points",
        b: "• Postoperative Peak Ischemia Window: >70% of perioperative MIs occur in the first 48–72 hours postoperatively (peak on Post-Op Day 1–2 due to cytokine surge, hypercoagulability, fluid shifts, and pain-induced sympathetic drive).\n• Silent Ischemia: Up to 80% of perioperative MIs are PAINLESS / SILENT because postoperative opioids and wound pain mask classic angina. High-risk patients require routine serial troponins and 12-lead ECGs for 48 hours.\n• High-Yield Viva Pearl:\n  - Q: Why is tachycardia more dangerous than hypertension in IHD? A: Hypertension increases myocardial oxygen demand, but simultaneously increases aortic diastolic pressure (raising coronary perfusion). Tachycardia increases demand while actively decreasing diastolic filling time, attacking oxygen balance from both sides."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 2, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65, Elsevier, 2025/2026.",
      "Halvorsen S, et al. 2022 ESC Guidelines on cardiovascular assessment and management of patients undergoing non-cardiac surgery. Eur Heart J 2022;43(38):3826-3924."
    ]
  },
  {
    id: "case-cabg-cardiopulmonary-bypass",
    cat: "case_cardiac",
    name: "Coronary Artery Bypass Grafting (CABG) on CPB",
    short: "CABG on CPB",
    tags: ["Cardiac", "CABG", "CPB", "Cardioplegia", "Heparin Protamine", "Case Discussion"],
    tagline: "Hemodynamic goals 'slow, small & normotensive', systemic heparinization ACT > 480s, CPB phases & protamine reversal",
    source: "Objective Anaesthesia Review, 6th ed.; Miller's Anesthesia, 10th ed., Ch. 65 (Cardiac Anesthesia); Hensley's Practical Approach to Cardiothoracic Anesthesia, 6th ed.",
    sections: [
      {
        h: "1. Case Scenario & Preoperative Anatomy",
        b: "A 58-year-old male with severe triple vessel coronary artery disease (CAD) and 85% distal left main stenosis presents for elective on-pump CABG (LIMA to LAD, saphenous vein grafts to OM and RCA). Echo demonstrates global LV hypokinesia, LVEF 40%, LVEDP elevated, no significant valvular regurgitation. Preoperative coronary angiography details are reviewed to identify target coronary vessels, viability, and collateral flow."
      },
      {
        h: "2. Cardinal Pre-Bypass Haemodynamic Goals",
        b: "Before going on Cardiopulmonary Bypass (CPB), the diseased heart must be protected from catastrophic ischemic arrest:\n\n• The \"Slow, Small, Normotensive\" Mantra:\n  - Slow Heart Rate: 50–65 bpm (minimizes MVO₂ and prolongs diastolic coronary perfusion).\n  - Small Ventricular Size: Avoid volume overload (decreases wall tension and reduces subendocardial compression).\n  - Normotensive to Mildly Hypertensive: Keep MAP 70–85 mmHg to perfuse critical stenotic vessels.\n  - Preserved Contractility: Avoid excessive inotropes (which waste oxygen) and excessive myocardial depressants."
      },
      {
        h: "3. Systemic Anticoagulation & Heparin Monitoring",
        b: "• Heparin Administration:\n  - Dose: 300 to 400 units/kg of bovine lung / porcine intestinal Heparin administered via a central line before aortic cannulation.\n  - Target Activated Clotting Time (ACT): Baseline ACT is typically 100–140 seconds. Safe full CPB initiation requires ACT > 400 to 480 seconds.\n• Heparin Resistance:\n  - Defined as failure to achieve ACT > 400–480 s despite 400–500 units/kg of heparin.\n  - Etiology: Antithrombin III (AT-III) deficiency (often caused by preoperative therapeutic heparin infusions or congenital deficiency).\n  - Treatment: Administer 2 units of Fresh Frozen Plasma (contains AT-III) or recombinant Antithrombin III concentrate (500–1000 units)."
      },
      {
        h: "4. Conduct of Cardiopulmonary Bypass (CPB)",
        b: "• Cannulation Phases: Ascortic cannulation first (keep SBP 90–100 to prevent aortic dissection), followed by venous cannulation (two-stage single cannula in right atrium or bicaval cannulation).\n• Initiation of Bypass: Full pump flow target 2.4 L/min/m² cardiac index; confirm arterial line pulsatility ceases; turn off mechanical ventilator once full flow is established; administer volatile anesthetic via oxygenator vaporizer.\n• Myocardial Protection (Cardioplegia Arrest):\n  - Aorta is cross-clamped; cold (4°C) hyperkalemic blood cardioplegia (e.g. Del Nido or 4:1 blood:crystalloid) delivered antegrade via aortic root and/or retrograde via coronary sinus.\n  - Mechanism: High potassium (K⁺ 16–20 mEq/L) depolarizes cardiac myocyte membrane, inducing rapid electromechanical arrest in diastole, reducing MVO₂ by >95%.\n• Rewarming: Rewarm gradually to 36.5°C (prevent hyperthermia > 37.5°C which causes cerebral injury)."
      },
      {
        h: "5. Weaning from CPB & Protamine Reversal",
        b: "• Checklists for Weaning (The \"RHYTHM\" mnemonic):\n  - Rhythm: Stable sinus rhythm or AV paced at 75–85 bpm; de-airing complete.\n  - Heart Rate / Temperature: Core temp > 36°C.\n  - Ventilation: Lungs re-expanded under direct vision (clear atelectasis); ventilator restarted.\n  - Metabolic: ABG normal (pH > 7.30, K⁺ 4.0–5.0, ionized calcium > 1.1 mmol/L, Hematocrit > 24%–26%).\n• Protamine Sulfate Reversal:\n  - Dose: 1 mg of Protamine per 100 units of initial Heparin administered.\n  - Administration Technique: Infuse SLOWLY over 10 to 15 minutes via peripheral vein or slow central line.\n  - PROTAMINE REACTIONS (Life-Threatening):\n    1. Type I (Rapid Injection): Systemic vasodilation and hypotension (histamine release).\n    2. Type II (Anaphylactoid/IgE-mediated): Bronchospasm, facial flushing, cardiovascular collapse (higher risk in NPH insulin users, vasectomized men, fish allergy).\n    3. Type III (Catastrophic Pulmonary Hypertension): Thromboxane A2 release triggering acute severe pulmonary vasoconstriction, acute RV failure, and systemic hypotension. Stop protamine immediately, administer inotropes, calcium, and consider returning to CPB."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 65, Elsevier, 2025/2026.",
      "Hensley's Practical Approach to Cardiothoracic Anesthesia, 6th ed. Wolters Kluwer, 2019."
    ]
  },
  {
    id: "case-anesthetic-hypertensive-patient",
    cat: "case_cardiac",
    name: "Anesthetic Considerations for a Hypertensive Patient",
    short: "Hypertensive Patient",
    tags: ["Cardiac", "Hypertension", "Autoregulation", "End-Organ Damage", "Case Discussion"],
    tagline: "Right-shifted cerebral autoregulation, target BP within 20% baseline, ACEi vasoplegia & intraoperative crisis management",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 3 (Anesthetic Considerations for a Hypertensive Patient); Miller's Anesthesia, 10th ed., Ch. 18 & 40; 2024 ESH/ESC Hypertension Guidelines.",
    sections: [
      {
        h: "1. Case Scenario & End-Organ Evaluation",
        b: "A 56-year-old male with poorly controlled essential hypertension for 12 years presents for elective open inguinal hernia repair. On presentation, his blood pressure is 184/108 mmHg, HR 78 bpm. He takes amlodipine 10 mg and telmisartan 40 mg irregularly. Fundoscopy reveals Grade II hypertensive retinopathy (arteriolar narrowing, arteriovenous nicking). ECG shows voltage criteria for Left Ventricular Hypertrophy (Sokolow-Lyon index > 35 mm) with lateral strain pattern. Serum creatinine is 1.4 mg/dL. He has no chest pain or dyspnea."
      },
      {
        h: "2. Pathophysiology: Vascular Sclerosis & The Right-Shifted Autoregulation Curve",
        b: "Chronic hypertension causes medial hypertrophy and arteriolar remodeling throughout the cerebral, renal, and coronary vascular beds:\n\n• Right-Shifted Autoregulation:\n  - Normal Cerebral Autoregulation: Constant cerebral blood flow between Mean Arterial Pressures (MAP) of 50 and 150 mmHg.\n  - Chronic Hypertensive Autoregulation: The entire curve shifts to the right (e.g. MAP 80 to 180 mmHg). Lowering blood pressure into a \"normal adult\" range (e.g. MAP 60 mmHg) can induce cerebral and renal hypoperfusion and ischemic stroke!\n• The Haemodynamic Rollercoaster:\n  - Hypertensive patients are intensely volume contracted (pressure natriuresis) with blunted baroreceptor reflexes.\n  - They exhibit marked hemodynamic lability: profound hypotension on induction of anaesthesia (vasodilation + volume depletion) followed by severe hypertensive surges during laryngoscopy, surgical incision, and emergence."
      },
      {
        h: "3. Decision to Cancel / Postpone Surgery",
        b: "• Cancellation Thresholds (2024 International Guidelines):\n  - Elective Surgery Postponement Cutoff: Stage 3 Severe Hypertension — Systolic BP ≥ 180 mmHg or Diastolic BP ≥ 110 mmHg.\n  - Why postpone? Severe Stage 3 hypertension increases the risk of perioperative myocardial infarction, ventricular arrhythmias, intracranial hemorrhage, and postoperative stroke.\n  - Delay elective surgery to titrate oral antihypertensives gradually over days to weeks (avoid acute oral or IV precipitous drops in the holding area).\n  - If surgery is urgent/emergency: Proceed with invasive arterial monitoring and continuous IV vasodilator infusions (labetalol, nicardipine)."
      },
      {
        h: "4. Perioperative Antihypertensive Drug Management",
        b: "• Beta-Blockers & Calcium Channel Blockers: CONTINUE up to the morning of surgery with a sip of water (abrupt beta-blocker withdrawal triggers rebound tachycardia, malignant hypertension, and MI).\n• ACE Inhibitors & Angiotensin Receptor Blockers (ARBs - e.g. Telmisartan, Ramipril):\n  - WITHHOLD ON THE MORNING OF SURGERY (24h prior).\n  - Rationale: Concomitant general anaesthesia and active AT1 blockade triggers refractory \"vasoplegic syndrome\" resistant to phenylephrine and ephedrine. Requires Vasopressin (0.5–1 unit bolus) or Terlipressin to restore vascular tone.\n• Diuretics: Withhold on morning of surgery (prevents additive hypovolemia and intraoperative hypotension)."
      },
      {
        h: "5. Intraoperative Management & Crisis Treatment",
        b: "• Blood Pressure Target: Maintain MAP within 20% of the patient's baseline pre-induction pressure.\n• Blunting the Pressor Response to Laryngoscopy:\n  - Intravenous Fentanyl (3 mcg/kg), Lignocaine (1.5 mg/kg IV 90s pre-intubation), or Esmolol (0.5–1 mg/kg) given before direct laryngoscopy.\n• Intraoperative Hypertensive Crisis Treatment:\n  - Labetalol: Combined alpha-1 and beta-blocker (ratio 1:7 IV). Dose: 5 to 20 mg IV slow boluses every 10 min. Ideal when hypertension is accompanied by tachycardia.\n  - Nicardipine: Dihydropyridine calcium channel blocker (5–15 mg/h infusion). Reduces afterload without depressing myocardium.\n  - Nitroglycerin: Infusion (0.5–3 mcg/kg/min) preferred if ischemia or pulmonary congestion is present.\n  - Sodium Nitroprusside (SNP): Reserved for severe refractory crisis (watch for cyanide toxicity with infusions > 2 mcg/kg/min for > 24h)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 3, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 18 & 40, Elsevier, 2025/2026.",
      "Mancia G, et al. 2023 ESH Guidelines for the management of arterial hypertension. J Hypertens 2023;41(12):1874-2071."
    ]
  },
  {
    id: "case-tetralogy-of-fallot",
    cat: "case_cardiac",
    name: "Tetralogy of Fallot (TOF)",
    short: "Tetralogy of Fallot",
    tags: ["Cardiac", "TOF", "Congenital", "Cyanotic", "Hypercyanotic Spell", "Case Discussion"],
    tagline: "Anatomic tetrad, right-to-left shunt dynamics, hypercyanotic Tet spell protocol & avoiding air bubbles in IV lines",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 4 (Tetralogy of Fallot); Miller's Anesthesia, 10th ed., Ch. 66 (Pediatric Cardiac Anesthesia); Cote CJ, A Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Case Scenario & The Anatomic Tetrad",
        b: "A 4-year-old boy (weight 14 kg) with unrepaired Tetralogy of Fallot presents for elective dental extractions under general anaesthesia. The mother describes a history of squatting during physical play and two episodes of \"blue spells\" (hypercyanotic episodes) precipitated by crying and hunger. Physical examination: Central cyanosis, clubbing of fingers (Grade 3), pulse 100 bpm, SpO₂ 78% on room air. Auscultation reveals a single second heart sound and a harsh, ejection systolic murmur (Grade 3/6) at the left upper sternal border. Preoperative hematocrit is 56% (compensatory secondary polycythemia).\n\n• The Anatomic Tetrad of Fallot:\n  1. Large, non-restrictive subaortic Ventricular Septal Defect (VSD)\n  2. Right Ventricular Outflow Tract Obstruction (RVOTO - infundibular subvalvular, valvular, or supravalvular stenosis)\n  3. Overriding Aorta (straddling the VSD)\n  4. Right Ventricular Hypertrophy (secondary to chronic high RV pressure)."
      },
      {
        h: "2. Pathophysiology & Right-to-Left Shunt Dynamics",
        b: "Because the VSD is large and non-restrictive, pressures in the right and left ventricles are equal. The direction and magnitude of blood flow across the VSD are dictated entirely by the balance between Pulmonary Vascular Resistance + RVOTO vs Systemic Vascular Resistance (SVR):\n\n• If SVR drops or RVOTO increases: Right-to-left shunting increases, deoxygenated blood pours directly into the aorta, producing severe cyanosis and profound hypoxemia.\n• If SVR rises or RVOTO relaxes: Pulmonary blood flow increases, improving oxygenation.\n• CARDINAL HAEMODYNAMIC GOALS:\n  1. MAINTAIN OR INCREASE SVR: Avoid systemic vasodilation (propofol boluses, isoflurane overdose, histamine release).\n  2. AVOID INCREASING RVOTO: Prevent sympathetic stimulation, hypercontractility, tachycardia, and endogenous catecholamine surges which spasm the dynamic muscular infundibulum.\n  3. PRESERVE PRELOAD: Hypovolemia decreases RV cavity size, worsening dynamic subvalvular outflow tract obstruction.\n  4. AVOID SURGES IN PVR: Prevent hypoxia, hypercapnia, acidosis, and hypothermia."
      },
      {
        h: "3. The Hypercyanotic (\"Tet\") Spell — Emergency Resuscitation Protocol",
        b: "A dynamic spasm of the infundibular muscle triggered by crying, pain, dehydration, or light anaesthesia, causing near-complete cessation of pulmonary blood flow and acute life-threatening cyanosis:\n\n• Immediate Step-by-Step Treatment Protocol:\n  1. FiO₂ 1.0: Administer 100% inspired oxygen immediately (dilates pulmonary vasculature and supports tissue oxygenation).\n  2. Knee-Chest Position: Flex hips and knees tightly against the chest (in older child, squatting). Mechanically kinks the femoral arteries, abruptly elevating Systemic Vascular Resistance (SVR), which forces blood from the RV across the pulmonary valve rather than through the VSD!\n  3. Deepen Anaesthesia: Administer Ketamine (1–2 mg/kg IV) or Fentanyl; calms the child, relieves infundibular spasm, and raises SVR.\n  4. Fluid Bolus: Rapid IV infusion of 10–20 mL/kg balanced crystalloid to expand RV end-diastolic volume and dilate the infundibulum.\n  5. Phenylephrine (The Vasopressor of Choice): 5 to 10 mcg/kg IV bolus. Selectively constricts systemic vascular beds (skyrockets SVR), reversing the shunt from right-to-left to left-to-right!\n  6. Beta-Blocker (Esmolol / Propranolol): IV Esmolol (0.5 mg/kg bolus over 1 min) to relax the dynamic infundibular muscle spasm and slow heart rate."
      },
      {
        h: "4. Anesthetic Execution & Strict Safety Rules",
        b: "• Sedative Premedication: Oral Midazolam (0.5 mg/kg) given 30 minutes pre-induction is mandatory to prevent agitation and crying that precipitate Tet spells in the preoperative holding area.\n• Induction of Anaesthesia:\n  - Ketamine (2–3 mg/kg IV or 5–8 mg/kg IM) is the induction agent of choice in cyanotic heart disease. It maintains SVR, supports heart rate, and provides profound analgesia without depressing contractility.\n  - Inhalational Induction: Sevoflurane in 100% O₂ titrated gradually; avoid rapid concentration surges that drop SVR.\n• THE CRITICAL DE-AIRING MANDATE (PARADOXICAL EMBOLISM):\n  - ALL IV lines MUST be meticulously de-aired with air-eliminating filters or bubble traps!\n  - In the presence of a right-to-left shunt across the VSD, even a micro-bubble of air injected into a peripheral IV line passes directly into the systemic circulation and into the cerebral or coronary arteries, causing immediate stroke or cardiac arrest!"
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 4, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 66, Elsevier, 2025/2026.",
      "Cote CJ, et al. A Practice of Anesthesia for Infants and Children, 6th ed. Elsevier, 2019."
    ]
  },
  {
    id: "case-patent-ductus-arteriosus",
    cat: "case_cardiac",
    name: "Patent Ductus Arteriosus (PDA) Ligation",
    short: "PDA Ligation",
    tags: ["Cardiac", "PDA", "Congenital", "Preterm", "Recurrent Laryngeal", "Case Discussion"],
    tagline: "Left-to-right shunt in preterm neonates, pre/post-ductal SpO2 monitoring, test clamping & avoiding RLN injury",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 5 (Patent Ductus Arteriosus); Miller's Anesthesia, 10th ed., Ch. 66; Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Anatomy, Pathophysiology & Shunt Dynamics",
        b: "• Anatomy: The ductus arteriosus connects the pulmonary artery bifurcation to the descending aorta just distal to the left subclavian artery. In utero, it shunts 90% of RV output away from the unexpanded lungs into the placenta. In preterm neonates, lack of muscular media and low oxygen sensitivity leads to persistent patency.\n• Left-to-Right Shunting:\n  - After birth, as pulmonary vascular resistance drops, blood shunts left-to-right from the high-pressure aorta into the low-pressure pulmonary circulation.\n  - Sequelae: Massive pulmonary overcirculation (pulmonary edema, ventilator dependence, bronchopulmonary dysplasia) and \"diastolic steal\" from the systemic circulation, predisposing to necrotizing enterocolitis (NEC), intraventricular hemorrhage (IVH), and renal failure.\n• Medical vs Surgical Treatment: Medical closure attempted with cyclooxygenase inhibitors (Indomethacin, Ibuprofen, or IV Paracetamol). If medical therapy fails or is contraindicated (active bleeding, NEC, severe renal dysfunction), surgical or transcatheter ligation is indicated."
      },
      {
        h: "2. Intraoperative Monitoring & The Test Clamping Protocol",
        b: "• Dual-Site Pulse Oximetry:\n  - Pre-ductal: Right hand/wrist (reflects arterial oxygenation proximal to the ductus).\n  - Post-ductal: Left foot or right foot (reflects systemic oxygenation distal to the ductus).\n• Radial Arterial Line: Right radial arterial line preferred (preserves monitoring if the left subclavian artery is accidentally clamped or distorted).\n• Surgical Exposure: Left posterolateral thoracotomy via 3rd or 4th intercostal space.\n• THE CRITICAL TEST CLAMPING PROTOCOL:\n  - Before permanent ligation or titanium clip application, the surgeon test-clamps the suspected ductus for 1 to 2 minutes:\n    1. Confirm Rise in Diastolic Blood Pressure: Clamping the run-off ductus eliminates diastolic runoff, instantly raising systemic diastolic BP and narrowing pulse pressure.\n    2. Confirm Preserved Post-Ductal Perfusion: Verify that pulse oximeter waveform and pulse in the foot remain vigorous (rules out accidental clamping of the descending aorta!).\n    3. Verify Lung Perfusion: Confirm left pulmonary artery pulse is intact (rules out accidental clamping of the LPA!)."
      },
      {
        h: "3. Surgical Complications & Life-Threatening Hazards",
        b: "• Recurrent Laryngeal Nerve (RLN) Injury: The left RLN loops around the ligamentum arteriosum / ductus arteriosus. Traction or electrocautery injury produces vocal cord palsy, hoarseness, stridor, and extubation failure.\n• Catastrophic Hemorrhage: The preterm ductus is paper-thin and friable. Avulsion or tear causes torrential aortic hemorrhage. Blood products must be in the operating room prior to incision; maintain two secure IV lines.\n• Chylothorax: Thoracic duct injury during mediastinal dissection.\n• Sudden Left Ventricular Afterload Surge: Ligation suddenly removes the low-resistance pulmonary run-off, increasing LV afterload and occasionally triggering transient LV failure; inotropic support (milrinone or epinephrine) may be required."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 5, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 66, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-permanent-pacemaker",
    cat: "case_cardiac",
    name: "Permanent Pacemaker & CIED Management",
    short: "Pacemaker & CIED",
    tags: ["Cardiac", "Pacemaker", "CIED", "ICD", "Electrocautery EMI", "Case Discussion"],
    tagline: "Preoperative interrogation, NASPE/BPEG code, magnet application response, electrocautery EMI mitigation & reprogramming",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 6 (Permanent Pacemaker); Miller's Anesthesia, 10th ed., Ch. 42; 2023 HRS/ASA Expert Consensus on Perioperative Management of CIEDs.",
    sections: [
      {
        h: "1. Case Scenario & The NASPE/BPEG Code",
        b: "A 72-year-old male with a dual-chamber permanent pacemaker (PPM) implanted 4 years ago for symptomatic complete heart block presents for open radical prostatectomy. Medications: Apixaban, Atorvastatin. He feels well and denies syncope or dizziness. Bedside evaluation requires decoding his device function:\n\n• The 5-Letter NASPE/BPEG (NBG) Pacemaker Code:\n  - Position I: Chamber Paced (A = Atrium, V = Ventricle, D = Dual A+V, O = None)\n  - Position II: Chamber Sensed (A, V, D, O)\n  - Position III: Response to Sensing (I = Inhibited, T = Triggered, D = Dual [I+T], O = None)\n  - Position IV: Rate Modulation (R = Rate responsive, O = None)\n  - Position V: Multisite Pacing (A, V, D, O — e.g. biventricular CRT).\n• Common Modes: DDD (dual chamber sensing and pacing, preserves AV synchrony), VVIR (single ventricle pacing with accelerometer rate adaptation for exercise in permanent AF)."
      },
      {
        h: "2. The Electromagnetic Interference (EMI) Hazard",
        b: "Monopolar electrocautery (\"bovie\") is the primary perioperative threat to cardiac implantable electronic devices (CIEDs):\n\n• Consequences of Monopolar Electrosurgery EMI:\n  1. Electrical Oversensing: The device interprets electrocautery radiofrequency noise as intrinsic cardiac activity, inhibiting pacemaker output (causing profound asystole in a pacemaker-dependent patient!).\n  2. Inappropriate Tachycardia Therapy in ICDs: An Implantable Cardioverter-Defibrillator (ICD) interprets electrical noise as ventricular fibrillation, delivering an inappropriate high-voltage shock to the awake or anesthetized patient!\n  3. Power-On Reset: High-energy EMI resets the device to factory back-up default mode (often VOO or VVI at 60 bpm).\n  4. Thermal Myocardial Injury: Current conducted along the lead causes thermal burn at the lead-myocardium interface, causing permanent threshold rise or perforation."
      },
      {
        h: "3. Magnet Application: Pacemaker vs ICD Behavior",
        b: "A CLINICAL DISTINCTION EXAMINERS TEST EXHAUSTIVELY:\n\n• Magnet Over a PACEMAKER (PPM):\n  - Converts the pacemaker into an ASYNCHRONOUS mode (e.g. VOO or DOO) at a fixed manufacturer-specific rate (e.g. Medtronic = 85 bpm, Boston Scientific = 100 bpm, St. Jude = 90 or 100 bpm).\n  - Sensing is completely disabled; therefore, electrocautery EMI CANNOT cause oversensing or asystole.\n  - Removing the magnet immediately restores normal programmed sensing and pacing.\n• Magnet Over an IMPLANTABLE CARDIOVERTER-DEFIBRILLATOR (ICD):\n  - SUSPENDS TACHYARRHYTHMIA DETECTION AND DEFIBRILLATION SHOCKS ONLY!\n  - DOES NOT ALTER PACEMAKER FUNCTION! (Does NOT make the pacemaker asynchronous!).\n  - In a pacemaker-dependent patient with an ICD, a magnet will prevent inappropriate shocks, but will NOT prevent pacemaker inhibition from EMI; formal interrogation and reprogramming to asynchronous pacing (VOO/DOO) before surgery is mandatory!"
      },
      {
        h: "4. Intraoperative Electrocautery Safety Rules",
        b: "• Positioning the Grounding Plate: Position the return electrode plate so the electrical current path DOES NOT cross the pulse generator or cardiac leads (e.g. place plate on the right thigh for pelvic/prostate surgery).\n• Bipolar Electrocautery: Use bipolar cautery wherever feasible (current passes only between forceps tips; negligible EMI).\n• Monopolar Rules: If monopolar must be used, use short, intermittent bursts (< 2–3 seconds), set to the lowest effective energy, and keep the active pencil > 15 cm away from the device.\n• External Defibrillator Ready: External defibrillator pads must be placed on the patient pre-induction whenever ICD therapies are disabled."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 6, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 42, Elsevier, 2025/2026.",
      "Crossley GH, et al. The Heart Rhythm Society (HRS) / American Society of Anesthesiologists (ASA) Expert Consensus Statement on the perioperative management of patients with cardiac implantable electronic devices. Heart Rhythm 2011 (Reaffirmed 2023)."
    ]
  },
  {
    id: "case-peripheral-vascular-disease",
    cat: "case_cardiac",
    name: "Peripheral Vascular Disease & Major Aortic Surgery",
    short: "PVD & Aortic Surgery",
    tags: ["Vascular", "PVD", "Aorta", "Cross-Clamp", "Renal Protection", "Spinal Cord Ischemia", "Case Discussion"],
    tagline: "Aortic cross-clamping hemodynamics, declamping shock, renal preservation, heparinization & artery of Adamkiewicz protection",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 7 (Peripheral Vascular Disease); Miller's Anesthesia, 10th ed., Ch. 67 (Vascular Anesthesia); Rutherford's Vascular Surgery and Endovascular Therapy, 10th ed.",
    sections: [
      {
        h: "1. Case Scenario & Vascular Patient Risk Profile",
        b: "A 68-year-old male with a 45 pack-year smoking history, severe peripheral vascular disease (ankle-brachial index 0.45 bilateral, rest pain), hypertension, and chronic kidney disease presents for open infrarenal abdominal aortic aneurysm (AAA) repair (aneurysm diameter 6.2 cm). Vascular surgery patients have the highest incidence of occult multi-organ atherosclerotic disease: >60% have significant coronary artery disease, 30% have carotid stenosis, and 40% have renal artery involvement."
      },
      {
        h: "2. The Physiology of Aortic Cross-Clamping",
        b: "Placement of a surgical cross-clamp on the aorta produces dramatic, immediate systemic hemodynamic derangements:\n\n• Cardiovascular Sequelae (Clamp Application):\n  - Massive Increase in Afterload: Aortic impedance surges, left ventricular end-systolic volume and wall stress rise abruptly, predisposing to acute LV failure and subendocardial ischemia.\n  - Blood Volume Redistribution: Blood volume is shifted from the splanchnic and lower extremity vascular beds into the central venous circulation, raising CVP and preload.\n  - Management: Deepen anaesthesia; administer vasodilators (Nitroglycerin or Nicardipine) before clamp application to blunt LV afterload spikes.\n• Renal & Spinal Cord Ischemia:\n  - Infrarenal clamping reduces renal blood flow by 35%–40% due to reflex renal vasoconstriction (renin-angiotensin activation).\n  - Suprarenal / Thoracic clamping jeopardizes the Artery of Adamkiewicz (arteria radicularis magna, originating between T9 and L2 in 85% of individuals), which supplies the anterior two-thirds of the spinal cord (anterior spinal artery syndrome: paraplegia, loss of pain and temperature with preserved dorsal column proprioception)."
      },
      {
        h: "3. The Physiology of Aortic Declamping (\"Declamping Shock\")",
        b: "Releasing the aortic clamp is the most hemodynamically hazardous phase of the operation:\n\n• Pathophysiology of Declamping Shock:\n  1. Sudden Loss of Afterload: SVR plummets instantaneously as blood pools into the dilated, paralyzed lower extremity vasculature.\n  2. Central Hypovolemia: Effective circulating blood volume drops into the reperfused ischemic vascular beds.\n  3. Reperfusion Washout Surge: Lactic acid, potassium, prostaglandins, and myocardial depressant factors accumulated in the ischemic lower extremities wash into the central circulation, causing acute metabolic acidosis, hyperkalemia, and myocardial depression.\n• Declamping Preparation Protocol:\n  - Volume Load: Pre-load the patient with balanced crystalloids / blood products to elevate CVP by 2–4 mmHg before release.\n  - Discontinue Vasodilators prior to declamping.\n  - Controlled Release: Request the surgeon to release the clamp SLOWLY and incrementally (\"partial declamping\").\n  - Vasopressors Ready: Phenylephrine or Norepinephrine running to support SVR."
      },
      {
        h: "4. Renal & Spinal Cord Protection Bundles",
        b: "• Renal Protection: Maintain intravascular volume, MAP > 70 mmHg, and urine output > 0.5 mL/kg/h. Mannitol (0.25–0.5 g/kg IV) given 15–20 minutes prior to clamp application promotes osmotic diuresis and scavenges free radicals.\n• Spinal Cord Protection (Thoracoabdominal Aneurysms):\n  - Cerebrospinal Fluid (CSF) Drainage: Place lumbar intrathecal catheter to keep CSF pressure < 10 cmH₂O (Spinal Perfusion Pressure = Distal MAP - CSF Pressure).\n  - Motor Evoked Potentials (MEP) / SSEP neuromonitoring.\n  - Mild hypothermia (34°C) and left heart bypass."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 7, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026."
    ]
  },

  // ============================================================================
  // RESPIRATORY & THORACIC CASES (case_resp)
  // ============================================================================
  {
    id: "case-pneumonectomy-olv",
    cat: "case_resp",
    name: "Pneumonectomy & One-Lung Ventilation",
    short: "Pneumonectomy & OLV",
    tags: ["Thoracic", "Pneumonectomy", "OLV", "Double Lumen Tube", "HPV", "Case Discussion"],
    tagline: "Preoperative ppoFEV1/ppoDLCO, left double-lumen tube positioning, managing hypoxemia & avoiding post-pneumonectomy pulmonary edema",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 8 (Pneumonectomy); Miller's Anesthesia, 10th ed., Ch. 64 (Thoracic Anesthesia); Kaplan's Thoracic Anesthesia, 2nd ed.",
    sections: [
      {
        h: "1. Preoperative Pulmonary Assessment: The \"Three-Legged Stool\"",
        b: "Evaluating a patient for lung resection requires testing three distinct physiological components:\n\n• 1. Mechanics / Spirometry (ppoFEV1):\n  - Post-bronchodilator FEV1 measured. Calculate Predicted Postoperative FEV1 (ppoFEV1%) based on the number of functioning segments to be resected (19 total segments: 10 right, 9 left):\n  - ppoFEV1% = Preop FEV1% × (1 - [Number of functional segments resected / Total segments]).\n  - Safe threshold: ppoFEV1 > 40% (low risk); < 30% indicates extreme high risk for postoperative respiratory failure.\n• 2. Parenchymal Gas Exchange (ppoDLCO):\n  - Diffusing capacity for carbon monoxide. ppoDLCO > 40% is safe; < 30% carries high mortality.\n• 3. Cardiopulmonary Reserve / Exercise Capacity (VO₂ max):\n  - Formal CPET (Cardiopulmonary Exercise Testing) is indicated if ppoFEV1 or ppoDLCO < 40%.\n  - VO₂ max > 20 mL/kg/min (can climb > 3 flights of stairs / 15 meters) indicates safe resection.\n  - VO₂ max < 10 mL/kg/min (cannot climb 1 flight of stairs) indicates prohibitive operative mortality."
      },
      {
        h: "2. One-Lung Ventilation (OLV) & Hypoxic Pulmonary Vasoconstriction",
        b: "• Physiology of OLV in the Lateral Decubitus Position:\n  - The dependent (lower) lung is ventilated and carries ~60% of total blood flow.\n  - The non-dependent (upper, operative) lung is collapsed, creating an obligatory right-to-left intrapulmonary shunt of blood through unventilated lung.\n• Hypoxic Pulmonary Vasoconstriction (HPV):\n  - An intrinsic physiological defense mechanism of pulmonary vascular smooth muscle. In response to alveolar hypoxia (PAO₂ < 60 mmHg) in the collapsed lung, local pulmonary arterioles constrict, diverting 40%–50% of blood flow away from the non-ventilated lung to the ventilated dependent lung, significantly improving oxygenation.\n• Factors that Inhibit HPV (Worsening Hypoxemia):\n  - Inhalational anesthetics > 1.0 MAC (dose-dependently blunt HPV; keep volatile ≤ 1.0 MAC or use TIVA with propofol)\n  - Vasodilators (nitroglycerin, nitroprusside, nifedipine, beta-agonists)\n  - High or very low pulmonary artery pressures\n  - Hypocapnia (alkalosis) or severe hypothermia."
      },
      {
        h: "3. Double-Lumen Tube (DLT) Selection & Fiberoptic Confirmation",
        b: "• Left vs Right DLT Selection:\n  - LEFT DLT IS THE DEFAULT TUBE FOR ALMOST ALL PROCEDURES (including left pneumonectomy, where it is withdrawn into the trachea before the bronchus is stapled).\n  - Right DLT is avoided because the right upper lobe bronchus takes off only 1.5–2.0 cm distal to the carina; aligning the right DLT ventilation slot over the RUL orifice is notoriously difficult and easily obstructed.\n• Sizing:\n  - Adult Female: 35 or 37 Fr DLT.\n  - Adult Male: 39 or 41 Fr DLT.\n• Mandatory Bronchoscopic Confirmation Protocol (Two Checks):\n  1. Check via Tracheal Lumen: Advance pediatric bronchoscope through tracheal lumen. Visualize the tracheal carina. Confirm the blue bronchial cuff is situated just beneath the carina in the left main bronchus with zero cuff herniation over the carina.\n  2. Check via Bronchial Lumen: Advance scope through bronchial lumen. Visualize the bronchial tip and confirm clear visualization of the left upper and lower lobe bronchial bifurcations."
      },
      {
        h: "4. Stepwise Management of Hypoxemia During OLV",
        b: "If SpO₂ drops < 90% during one-lung ventilation, execute the standard stepwise protocol:\n\n1. Increase FiO₂ to 1.0 on the ventilator.\n2. Verify Tube Position: Pass bronchoscope immediately to rule out DLT dislodgement, cuff herniation, or mucus plugging.\n3. Optimize Dependent Lung: Apply 5 cmH₂O PEEP to the dependent lung and deliver a gentle recruitment maneuver.\n4. CPAP to Non-Dependent Lung (Most Effective Maneuver): Apply 2 to 5 cmH₂O of Continuous Positive Airway Pressure (CPAP) with 100% O₂ to the collapsed operative lung. This oxygenates blood traversing the non-dependent lung without expanding the lung enough to interfere with surgery.\n5. Intermittent Two-Lung Ventilation: If severe hypoxemia persists, ask the surgeon to pause surgery and ventilate both lungs."
      },
      {
        h: "5. Post-Pneumonectomy Pulmonary Edema (Fatal Complication)",
        b: "• Pathophysiology:\n  - Occurs 24 to 72 hours postoperatively with up to 50% mortality. The entire cardiac output is forced through the single remaining lung's vascular bed. High pulmonary capillary pressures combined with lymphatic disruption cause massive alveolar flooding.\n• Strict Fluid Restriction Protocol:\n  - TOTAL PERIOPERATIVE FLUIDS MUST BE STRICTLY LIMITED TO < 1.5 to 2.0 Liters in the first 24 hours (crystalloids < 1 mL/kg/h).\n  - Treat intraoperative hypotension with vasopressors (Norepinephrine / Phenylephrine), NEVER with crystalloid boluses!\n• Bronchial Stump Pressure Test: Before closure, the surgeon immerses the bronchial stump in saline; ventilate to 30 cmH₂O airway pressure to ensure zero air bubbles (absence of bronchopleural fistula)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 8, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 64 (Thoracic Anesthesia), Elsevier, 2025/2026.",
      "Slinger P. Principles and Practice of Anesthesia for Thoracic Surgery, 2nd ed. Springer, 2019."
    ]
  },
  {
    id: "case-bronchiectasis-lung-abscess",
    cat: "case_resp",
    name: "Bronchiectasis with Lung Abscess",
    short: "Bronchiectasis & Abscess",
    tags: ["Thoracic", "Bronchiectasis", "Lung Abscess", "Spillage", "Isolation", "Case Discussion"],
    tagline: "Isolation of infected lung, preventing contralateral spillage, copious secretions & massive hemoptysis crisis plan",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 9 (Bronchiectasis with Lung Abscess); Miller's Anesthesia, 10th ed., Ch. 64; Kaplan's Thoracic Anesthesia.",
    sections: [
      {
        h: "1. Clinical Scenario & The Contralateral Spillage Threat",
        b: "A 45-year-old male with long-standing bronchiectasis and a cavitary lung abscess in the right lower lobe producing > 150 mL/day of foul-smelling purulent sputum presents for right lower lobectomy. He has ongoing low-grade fever, clubbing, and coarse crackles over the right hemithorax.\n\n• THE CARDINAL LIFE-THREATENING ANAESTHETIC GOAL:\n  - Strict, immediate anatomical isolation of the diseased, infected lung to PREVENT CONTAMINATION AND FLOODING OF THE HEALTHY CONTRALATERAL LUNG.\n  - Spillage of purulent secretions or blood into the dependent healthy lung during induction produces catastrophic acute airway obstruction, asphyxiation, severe hypoxemia, and secondary contralateral pneumonia."
      },
      {
        h: "2. Preoperative Optimization & Postural Drainage",
        b: "• Secretion Clearance: Intensive chest physiotherapy and postural drainage in the days leading up to surgery; continue nebulized bronchodilators.\n• Antibiotic Therapy: Targeted intravenous antibiotics guided by sputum culture for at least 7–14 days.\n• Morning of Surgery: The patient should perform vigorous coughing and postural drainage immediately before entering the operating room to empty cavity contents."
      },
      {
        h: "3. Airway Isolation Strategy & Induction Protocol",
        b: "• Positioning During Induction:\n  - Keep the patient in a 30-degree head-up or sitting position, or tilted slightly TOWARD the diseased right side (dependent position) so that gravity retains purulent secretions in the right hemithorax.\n• Airway Isolation Options:\n  1. Left-Sided Double-Lumen Tube (Gold Standard): Provides absolute anatomical separation and allows independent suctioning and toilet of both lungs.\n  2. Bronchial Blocker with Suction Channel (e.g. Arndt or Cohen blocker): Useful if difficult intubation precludes DLT placement; blocker balloon is inflated in the right lower lobe bronchus or right intermediate bronchus.\n• Induction Technique:\n  - Rapid Sequence Induction or Awake Fiberoptic Intubation with DLT: Avoid vigorous positive pressure mask ventilation (forces infected secretions into distal alveolar units).\n  - Immediately upon intubation, inflate the bronchial cuff, position scope, verify absolute seal, and perform deep tracheobronchial suctioning."
      },
      {
        h: "4. Massive Hemoptysis Crisis Protocol",
        b: "• Erosion of hypertrophied bronchial arteries by the chronic abscess can trigger torrential hemoptysis (> 200–500 mL in minutes):\n  - Immediate Isolation: Inflate DLT cuff or bronchial blocker to isolate the bleeding lung and protect the healthy lung.\n  - 100% O₂, large-bore rigid bronchoscopy suction, reverse any coagulopathy, and consider emergency bronchial artery embolization (BAE) or emergency thoracotomy."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 9, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 64, Elsevier, 2025/2026."
    ]
  },
  {
    id: "case-copd-perioperative",
    cat: "case_resp",
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    short: "COPD Perioperative",
    tags: ["Thoracic", "COPD", "Auto-PEEP", "Dynamic Hyperinflation", "Ventilation", "Case Discussion"],
    tagline: "Expiratory flow limitation, dynamic hyperinflation / auto-PEEP, prolonged I:E ratio 1:3 & regional vs general anaesthesia",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 10 (Chronic Obstructive Pulmonary Disease); Miller's Anesthesia, 10th ed., Ch. 40; GOLD COPD Guidelines (2024 update).",
    sections: [
      {
        h: "1. Case Scenario & Functional Staging",
        b: "A 66-year-old male with a 50 pack-year smoking history and severe COPD (GOLD Stage III, FEV1 38% predicted, FEV1/FVC 0.52) presents for elective open repair of an infraumbilical incisional hernia. He is on tiotropium, salmeterol/fluticasone, and salbutamol inhalers. Baseline room air ABG: pH 7.37, PaCO₂ 48 mmHg, PaO₂ 62 mmHg, HCO₃⁻ 27 mEq/L (compensated chronic respiratory acidosis with hypoxemia). Exam reveals barrel chest, prolonged expiratory phase, pursed-lip breathing, and scattered bilateral expiratory polyphonic wheezes."
      },
      {
        h: "2. Pathophysiology: Flow Limitation & Dynamic Hyperinflation (Auto-PEEP)",
        b: "• Loss of Elastic Recoil & Airway Collapse: Destruction of alveolar attachments (emphysema) causes early airway closure during expiration, trapping air inside the alveoli.\n• Dynamic Hyperinflation & Intrinsic PEEP (Auto-PEEP):\n  - When the mechanical ventilator initiates a breath before the patient has completed the previous exhalation, trapped gas progressively builds up with every cycle.\n  - Consequences of Auto-PEEP:\n    1. Severe Hypotension: Intrinsic PEEP of 15–20 cmH₂O compresses the IVC and right atrium, impeding venous return and plunging cardiac output.\n    2. Barotrauma: Alveolar overdistension leads to pneumothorax and tension pneumothorax.\n    3. Overestimated Plateau Pressures: Falsely suggests worsening lung compliance."
      },
      {
        h: "3. Mechanical Ventilation Strategy for COPD",
        b: "The cornerstone of mechanical ventilation in severe airflow obstruction is PROLONGING EXPIRATORY TIME:\n\n• Ventilator Setup:\n  - Mode: Volume-controlled or pressure-controlled ventilation.\n  - Tidal Volume: 6 to 8 mL/kg of predicted body weight.\n  - Low Respiratory Rate: 8 to 10 breaths/min (allows sufficient time for complete exhalation).\n  - Prolonged I:E Ratio: 1:3, 1:4, or 1:5.\n  - High Inspiratory Flow Rates (60–80 L/min): Delivers the tidal volume quickly, maximizing the remaining time in the respiratory cycle for exhalation.\n  - Extrinsic PEEP: Match extrinsic PEEP to ~70%–80% of intrinsic PEEP (reduces work of breathing and stents small airways open without increasing total hyperinflation).\n• Target Permissive Hypercapnia: Accept elevated PaCO₂ (50–60 mmHg) provided pH remains > 7.25. DO NOT attempt to normalize PaCO₂ to 40 mmHg in chronic CO₂ retainers (causes profound metabolic alkalosis, hypokalemia, and failure to wean!)."
      },
      {
        h: "4. Anesthetic Technique & Postoperative Extubation",
        b: "• Regional vs General: For infraumbilical surgery, regional anaesthesia (spinal or epidural) with sensory level restricted to T10 is safe and preserves diaphragmatic function. Avoid high thoracic levels (> T4) which paralyze intercostal and abdominal expiratory muscles.\n• Emergence & Extubation: Extubate awake in high Fowler position once bronchodilators have been administered and full neuromuscular reversal is confirmed. Have non-invasive ventilation (NIV / BiPAP) ready in PACU to prevent reintubation."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 10, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 40, Elsevier, 2025/2026.",
      "Global Initiative for Chronic Obstructive Lung Disease (GOLD) Report 2024."
    ]
  },
  {
    id: "case-intercostal-drain-empyema",
    cat: "case_resp",
    name: "Intercostal Drain (ICD) Insertion & Thoracic Empyema",
    short: "ICD & Empyema",
    tags: ["Thoracic", "ICD", "Chest Tube", "Empyema", "Re-expansion Pulmonary Edema", "Case Discussion"],
    tagline: "Safe triangle of chest drain insertion, underwater seal physics, avoiding neurovascular bundle & re-expansion pulmonary edema",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 11 (Intercostal Drain); Miller's Anesthesia, 10th ed., Ch. 64; BTS Pleural Disease Guideline.",
    sections: [
      {
        h: "1. The Anatomical \"Safe Triangle\" for Chest Drain Insertion",
        b: "The British Thoracic Society (BTS) defines the Safe Triangle to minimize accidental injury to internal thoracic vessels, long thoracic nerve, heart, and abdominal viscera (liver/spleen):\n\n• Anatomical Boundaries of the Safe Triangle:\n  - Anterior Border: Lateral edge of the Pectoralis Major muscle\n  - Posterior Border: Anterior border of the Latissimus Dorsi muscle\n  - Inferior Border: 5th Intercostal Space (level of the nipple in men or inframammary fold)\n  - Apex: Axilla.\n• Insertion Rule: The needle, blunt clamp, and chest tube MUST always traverse the intercostal space DIRECTLY OVER THE SUPERIOR BORDER OF THE LOWER RIB to avoid the intercostal neurovascular bundle (Vein, Artery, Nerve - VAN) which runs along the subcostal groove on the inferior margin of the rib above."
      },
      {
        h: "2. The Three-Chamber Underwater Seal System",
        b: "• Underwater Seal Bottle Physics:\n  - Chamber 1 (Collection Chamber): Collects pleural fluid, blood, or pus.\n  - Chamber 2 (Water Seal Chamber): Contains 2 cm of sterile water acting as a one-way valve. Allows air and fluid to exit the pleural space during expiration, but prevents atmospheric air from entering during inspiration. Continuous bubbling in Chamber 2 indicates an active persistent air leak (bronchopleural fistula).\n  - Chamber 3 (Suction Control Chamber): Regulates the amount of negative pressure applied to the pleural cavity (typically set to -10 to -20 cmH₂O by water level, independent of wall suction regulator)."
      },
      {
        h: "3. Re-Expansion Pulmonary Edema (RPE) — Pathophysiology & Prevention",
        b: "A potentially fatal complication that occurs after rapid evacuation of large pneumothoraces or pleural effusions that have been present for > 3 to 7 days:\n\n• Pathophysiology:\n  - Rapid expansion of a chronically collapsed lung causes sudden mechanical alveolar shear stress, reperfusion injury, and massive free radical release, severely damaging the alveolar-capillary membrane and causing acute non-cardiogenic pulmonary edema in the re-expanded lung (and occasionally contralaterally).\n• The Golden Rule of Pleural Drainage:\n  - NEVER drain more than 1.0 to 1.5 Liters of pleural fluid in a single session!\n  - If > 1.0 L has drained rapidly, or if the patient develops persistent coughing, chest tightness, or dyspnea, clamp the drain for 1 to 2 hours before resuming drainage."
      },
      {
        h: "4. Anesthesia for Thoracoscopic Decortication for Empyema",
        b: "• Multiloculated chronic empyema requires VATS or open thoracotomy for decortication.\n• Requires One-Lung Ventilation (left DLT); significant pulmonary parenchymal restriction; septic profile requiring hemodynamic monitoring and invasive lines."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 11, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 64, Elsevier, 2025/2026.",
      "Roberts ME, et al. British Thoracic Society Guideline for pleural disease. Thorax 2023;78(Suppl 3):s1-s42."
    ]
  }
];

module.exports = cases;
