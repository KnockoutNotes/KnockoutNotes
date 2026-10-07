// ============================================================================
// BATCH 2: RESPIRATORY & THORACIC CLINICAL CASES (4 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), GOLD 2024 & EACTS Thoracic Guidelines.
// ============================================================================

module.exports = [
  // 9. PNEUMONECTOMY & ONE-LUNG VENTILATION
  {
    id: "case-pneumonectomy-olv",
    cat: "case_resp",
    name: "Pneumonectomy & One-Lung Ventilation",
    short: "Pneumonectomy & OLV",
    tags: ["Respiratory", "Thoracic", "Pneumonectomy", "OLV", "Double Lumen Tube", "Hypoxemia Protocol", "Case Discussion"],
    tagline: "ppoFEV1 & ppoDLCO rules, DLT placement & bronchoscopy check, HPV physiology & OLV hypoxemia rescue",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 8; Miller's Anesthesia, 10th ed., Ch. 67 (Thoracic Anesthesia); ACCP Guidelines.",
    sections: [
      {
        h: "1. Definition & Preoperative Resectability: The 'Rule of 40s' (ppoFEV1 & ppoDLCO)",
        b: "• Definition: Complete surgical excision of an entire lung (right or left), most commonly for central bronchogenic carcinoma.\n• The 3-Tier Preoperative Functional Assessment (ACCP / ESTS Algorithm):\n  1. Spirometry & Diffusion Capacity:\n     - FEV₁ > 2.0 L (for pneumonectomy) or > 1.5 L (for lobectomy) or > 80% predicted = Safe for resection without further testing.\n     - If FEV₁ < 80% or DLCO < 80%, calculate Predicted Postoperative (ppo) values.\n  2. Calculation of ppoFEV₁ & ppoDLCO:\n     - ppoFEV₁ = Preop FEV₁ × [1 - (Number of functional subsegments removed / 19 total segments)].\n     - Right lung has 10 segments (55% function); Left lung has 9 segments (45% function).\n     - Quantitative V/Q scan is mandatory if severe obstruction or prior lobectomy.\n  3. Risk Stratification by Predicted Postoperative Values:\n     - ppoFEV₁ > 40% AND ppoDLCO > 40%: Average surgical risk (<5% mortality).\n     - ppoFEV₁ or ppoDLCO 30%–40%: Intermediate risk; requires Cardiopulmonary Exercise Testing (CPET).\n     - ppoFEV₁ or ppoDLCO < 30%: High risk of postoperative respiratory failure and death.\n  4. Cardiopulmonary Exercise Testing (CPET - Gold Standard):\n     - VO₂ max > 20 mL/kg/min (or >75% predicted): Low risk; safe for pneumonectomy.\n     - VO₂ max 10–20 mL/kg/min (35%–75%): Moderate risk; consider lobectomy / sublobar resection.\n     - VO₂ max < 10 mL/kg/min (or <35% predicted): Prohibitive surgical mortality (>25%); resection CONTRAINDICATED."
      },
      {
        h: "2. Pathophysiology of One-Lung Ventilation & Hypoxic Pulmonary Vasoconstriction",
        b: "• One-Lung Ventilation (OLV) Shunt Dynamics:\n  - When the operative lung is collapsed, gravity and positive pressure ventilate the dependent lung (55%–60% of total perfusion), while the non-dependent collapsed lung receives 40%–45% of perfusion without ventilation (true right-to-left intrapulmonary shunt: Qs/Qt spikes from normal 5% to 25%–35%).\n• Hypoxic Pulmonary Vasoconstriction (HPV):\n  - Intrinsic compensatory physiological response of pulmonary arteriolar smooth muscle to alveolar hypoxia (PAO₂ < 60 mmHg).\n  - Diverts 40%–50% of blood flow AWAY from the hypoxic, non-dependent collapsed lung toward the well-ventilated dependent lung, mitigating severe hypoxemia.\n• Factors Inhibiting HPV (Directly Worsening Shunt & Hypoxemia!):\n  1. Volatile Anesthetics > 1.0 MAC (Sevoflurane/Desflurane inhibit HPV in a dose-dependent fashion; maintain MAC ≤ 1.0 or use Propofol TIVA).\n  2. Vasodilators (Nitroglycerin, Nitroprusside, Calcium channel blockers, Sildenafil).\n  3. Hypocapnia (alkalosis inhibits HPV).\n  4. Very high or very low pulmonary artery pressures (PAP).\n  5. High PEEP in dependent lung (diverts blood back to non-dependent lung!)."
      },
      {
        h: "3. Double-Lumen Tube (DLT) Selection, Sizing & Bronchoscopic Verification",
        b: "• DLT Selection Rules:\n  - LEFT-SIDED DLT is the default choice for almost all thoracic procedures (including right-sided pneumonectomy/lobectomy), because the left main bronchus is long (4–5 cm) before branching into secondary bronchi.\n  - RIGHT-SIDED DLT is used ONLY when left main bronchus is obstructed by tumor, distorted by aneurysms, or for left-sided sleeve pneumonectomy. (Hazard: Right upper lobe bronchus originates only 1.5–2 cm from carina; the slotted bronchial cuff can easily occlude the RUL orifice!).\n• Sizing Guidelines:\n  - Adult Females: Height < 160 cm -> 35 Fr; Height > 160 cm -> 37 Fr.\n  - Adult Males: Height < 170 cm -> 37–39 Fr; Height > 170 cm -> 39–41 Fr.\n• Mandatory 3-Step Fiberoptic Bronchoscopic (FOB) Verification:\n  1. Tracheal View: FOB down tracheal lumen. Confirm carina is sharp; blue bronchial cuff is visible in left main bronchus immediately below carina without herniation.\n  2. Bronchial View: FOB down bronchial lumen. Advance into left main bronchus; visualize bronchial tip entering bronchial tree; verify left upper and lower lobe bronchial orifices are widely patent.\n  3. Repositioning in Lateral Decubitus Position: Re-check tube position with FOB after turning patient lateral (DLTs migrate in >35% of position changes!)."
      },
      {
        h: "4. Step-by-Step Hypoxemia Protocol during One-Lung Ventilation",
        b: "• Management Algorithm for Acute Hypoxemia during OLV (SpO₂ < 90%):\n  1. STEP 1: Increase FiO₂ to 1.0 (100% Oxygen).\n  2. STEP 2: Check DLT Position immediately with Fiberoptic Bronchoscope (Dislodgement into trachea or herniation of bronchial cuff is the #1 cause of sudden hypoxemia during OLV!).\n  3. STEP 3: Confirm Dependent Lung Ventilation: Suction secretions, verify adequate tidal volume (4–6 mL/kg PBW), ensure driving pressure < 15 cmH₂O.\n  4. STEP 4: Apply CPAP (2–5 cmH₂O) with 100% O₂ to the NON-DEPENDENT (Operative) Lung: Restores oxygenation to non-ventilated blood; most effective intervention for hypoxemia during OLV.\n  5. STEP 5: Apply PEEP (5 cmH₂O) to the DEPENDENT lung (use cautiously: excessive PEEP increases dependent lung PVR and shifts perfusion to the collapsed lung).\n  6. STEP 6: Ask surgeon to clamp the pulmonary artery of the operative lung (converts 30% shunt to 0% immediately!).\n  7. STEP 7: If life-threatening hypoxemia persists: Resume TWO-LUNG VENTILATION immediately."
      },
      {
        h: "5. Post-Pneumonectomy Pulmonary Edema (PPPE) & Fluid Restriction",
        b: "• Pathogenesis & Lethality:\n  - Highly lethal complication (mortality > 50%–70%) occurring in 2%–4% of pneumonectomy patients within 24–72 hours postoperatively.\n  - Mechanism: The entire cardiac output is forced through a single remaining pulmonary vascular bed, doubling capillary flow and shear stress. Fluid overload, high airway pressures, and endothelial damage trigger acute low-pressure permeability pulmonary edema.\n• Strict Fluid Restriction Guidelines in Pneumonectomy:\n  - Total intraoperative fluids: < 1.5 to 2.0 Liters (or < 15–20 mL/kg for entire surgery).\n  - Postoperative maintenance: Maximum 1 mL/kg/hr.\n  - Avoid high positive fluid balance on POD 0 (< 1000 mL net balance)."
      },
      {
        h: "6. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: Why is fluid restriction far stricter in pneumonectomy than in lobectomy?\n    A: Because the entire pulmonary microvascular bed is reduced by 50% (or 55% in right pneumonectomy). The remaining lung receives 100% of cardiac output at elevated microvascular pressures, making it acutely vulnerable to fatal hydrostatic and permeability pulmonary edema.\n  - Q: Why should the bronchial cuff of a DLT never be inflated with more than 2–3 mL of air?\n    A: Overinflation creates high mucosal contact pressure (>30 cmH₂O), causing bronchial mucosal ischemia, necrosis, and catastrophic bronchial rupture.\n  - Q: What are the absolute indications for One-Lung Ventilation?\n    A: 1. Isolation to prevent spillage of pus (lung abscess, bronchiectasis) or blood (massive hemoptysis) to the healthy lung. 2. Control of distribution of ventilation (bronchopleural fistula, giant unilateral lung cyst/bullae, tracheobronchial disruption). 3. Unilateral bronchopulmonary lavage."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 8, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026.",
      "Slinger P, et al. Principles and Practice of Anesthesia for Thoracic Surgery. Springer."
    ]
  },

  // 10. BRONCHIECTASIS WITH LUNG ABSCESS
  {
    id: "case-bronchiectasis-lung-abscess",
    cat: "case_resp",
    name: "Bronchiectasis with Lung Abscess",
    short: "Bronchiectasis & Abscess",
    tags: ["Respiratory", "Bronchiectasis", "Lung Abscess", "Airway Soiling", "Cross-Contamination", "Case Discussion"],
    tagline: "Lung isolation prior to induction, posture optimization, spillage prevention & bronchial toilet",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 9; Miller's Anesthesia, 10th ed., Ch. 67.",
    sections: [
      {
        h: "1. Definition, Pathophysiology & The Cross-Contamination Threat",
        b: "• Definition: Chronic, irreversible abnormal dilatation of bronchi and bronchioles accompanied by chronic necrotizing infection, copious purulent sputum production (>50–100 mL/day), and localized cavitation with necrotic debris (lung abscess).\n• The Primary Anesthetic Danger (Contamination of Healthy Lung):\n  - Copious secretions (often foul-smelling, anaerobic, and blood-stained) can flood the trachea upon induction of anaesthesia or loss of protective airway reflexes.\n  - Aspiration of infected pus into the contralateral healthy lung produces acute asphyxiation, severe necrotizing pneumonia, and bilateral respiratory failure.\n• Pathophysiological Impairment: Severe ventilation-perfusion mismatch, intrapulmonary shunting, chronic hypoxemia, reactive pulmonary hypertension, and secondary cor pulmonale."
      },
      {
        h: "2. Preoperative Optimization & Postural Drainage",
        b: "• Antimicrobial Therapy: Culture-directed parenteral antibiotics for 7–14 days to minimize active sputum volume and microbial load.\n• Postural Drainage & Chest Physiotherapy:\n  - Vigorous postural drainage (prone, head-down, or lateral depending on abscess segment) combined with chest percussion.\n  - Morning of Surgery: Patient performs active coughing and postural drainage immediately before entering the operating theatre to clear pooled secretions.\n• Bronchodilator Therapy: Inhaled salbutamol and ipratropium to optimize baseline airway caliber."
      },
      {
        h: "3. Airway Strategy & Lung Isolation Protocols",
        b: "• Airway Strategy to Prevent Spillage:\n  1. AWAKE INTUBATION OR SITTING INDUCTION:\n     - If abscess is large and secretions are uncontrollable: Awake fibreoptic intubation with topical local anesthesia OR intubation in the semi-upright / sitting position preserves active airway reflexes.\n  2. IMMEDIATE BRONCHIAL ISOLATION:\n     - Place a Left-Sided Double Lumen Tube (DLT) immediately.\n     - If left lung is diseased: Use a right-sided DLT or Univent tube / Arndt bronchial blocker placed under direct bronchoscopic guidance.\n  3. IMMEDIATE ISOLATION & BRONCHIAL TOILET:\n     - Inflate the bronchial cuff immediately upon tracheal entry.\n     - Suction both lumens thoroughly with separate sterile suction catheters before placing patient into lateral decubitus position."
      },
      {
        h: "4. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: How do you position a patient with unilateral lung abscess before lung isolation is achieved?\n    A: Place the patient with the diseased lung DEPENDENT (downward) or keep head elevated. This uses gravity to keep purulent secretions trapped in the diseased lung, preventing spillage across the carina into the healthy upright lung.\n  - Q: What are the bronchial blocker alternatives to DLT in bronchiectasis?\n    A: Arndt wire-guided endobronchial blocker, Cohen tip-deflecting blocker, or Fuji Uniblocker. They can be inserted through a single-lumen ETT, avoiding tube exchange for postoperative ventilation.\n  - Q: Why is post-operative extubation hazardous in bronchiectasis?\n    A: Secretions continue to pool. Extubation should be performed ONLY when the patient is wide awake with a strong cough reflex; bronchoaspiration and toilet must be performed immediately prior to extubation."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 9, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026."
    ]
  },

  // 11. CHRONIC OBSTRUCTIVE PULMONARY DISEASE (COPD)
  {
    id: "case-copd-perioperative",
    cat: "case_resp",
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    short: "COPD Perioperative",
    tags: ["Respiratory", "COPD", "GOLD Criteria", "Bedside PFTs", "Auto-PEEP", "Bronchospasm", "Case Discussion"],
    tagline: "GOLD 2024 staging, bedside PFTs, expiratory time prolongation, auto-PEEP disconnect test & bronchodilators",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 10; Miller's Anesthesia, 10th ed., Ch. 45; GOLD 2024 Report.",
    sections: [
      {
        h: "1. Definition, GOLD 2024 Criteria & BODE Index",
        b: "• Definition (GOLD 2024): A heterogeneous lung condition characterized by chronic respiratory symptoms (dyspnea, cough, sputum) due to abnormalities of the airways (bronchitis) and/or alveoli (emphysema) that cause persistent, often progressive, airflow obstruction.\n• Spirometric Diagnostic Criterion: Post-bronchodilator FEV₁ / FVC ratio < 0.70 (or < Lower Limit of Normal).\n• Severity of Airflow Obstruction (GOLD 1–4 Staging based on Post-Bronchodilator FEV₁):\n  - GOLD 1 (Mild): FEV₁ ≥ 80% predicted.\n  - GOLD 2 (Moderate): 50% ≤ FEV₁ < 80% predicted.\n  - GOLD 3 (Severe): 30% ≤ FEV₁ < 50% predicted.\n  - GOLD 4 (Very Severe): FEV₁ < 30% predicted.\n• Combined Assessment Framework (GOLD 2024 Groups A, B, E):\n  - Group A: 0–1 moderate exacerbations (not requiring hospital admission), mMRC 0–1 or CAT < 10.\n  - Group B: 0–1 moderate exacerbations, mMRC ≥ 2 or CAT ≥ 10.\n  - Group E (Exacerbation-Prone): ≥ 2 moderate exacerbations or ≥ 1 exacerbation requiring hospitalization.\n• The BODE Index (0–10 Score predicting 4-year survival):\n  - B: Body Mass Index (BMI < 21 = 1 point)\n  - O: Obstruction (FEV₁ % predicted: >65% = 0, 50–64% = 1, 36–49% = 2, ≤35% = 3)\n  - D: Dyspnea (mMRC scale 0–4)\n  - E: Exercise capacity (6-minute walk distance in meters)."
      },
      {
        h: "2. Bedside Pulmonary Function Tests (Clinical Assessment at Bedside)",
        b: "• When full formal spirometry is unavailable or for rapid bedside assessment in pre-anesthesia clinic:\n  1. SABRASEZ BREATH-HOLDING TEST:\n     - Patient inhales maximally and holds breath.\n     - Normal: > 25 to 30 seconds.\n     - Abnormal / Compromised Reserve: 15 to 25 seconds.\n     - Severe Cardiopulmonary Disease: < 15 seconds (high risk of postoperative ventilatory failure!).\n  2. SINGLE BREATH COUNT TEST:\n     - Patient takes a deep breath and counts out loud at 2 counts per second.\n     - Normal: Counts > 30.\n     - Impaired: Counts 15–20.\n     - Severe Impairment (VC < 1 Liter): Inability to count to 15.\n  3. SNIDER MATCH TEST (Match-Blowing Test):\n     - Lighted paper match held 15 cm (6 inches) from patient's mouth with mouth held wide open (patient must NOT purse lips).\n     - Extinguishing the match indicates Peak Expiratory Flow Rate > 150 L/min and FEV₁ > 1.6 Liters.\n     - Inability to blow out match correlates with FEV₁ < 1.0 Liter.\n  4. GREENE'S COUGH TEST:\n     - Assess the strength and quality of patient's cough.\n     - Hollow, wet, feeble cough indicates poor expiratory muscle strength and inability to clear secretions postoperatively.\n  5. WRIGHT'S PEAK FLOW METER:\n     - Normal adult PEFR: 450–600 L/min in males, 350–450 L/min in females. Value < 200 L/min indicates severe obstruction."
      },
      {
        h: "3. Pathophysiology: Dynamic Hyperinflation & Auto-PEEP",
        b: "• Airflow Limitation & Expiratory Time Constant:\n  - Loss of elastic recoil (emphysema) and airway narrowing (bronchitis) dramatically prolong the expiratory time constant (τ = R × C).\n  - If the expiratory time during mechanical ventilation is shorter than the time required for passive exhalation, the next breath is delivered before alveolar emptying is complete.\n• Dynamic Hyperinflation & Auto-PEEP (Intrinsic PEEP):\n  - Progressive air-trapping \"stacks\" breaths, creating elevated positive end-expiratory pressure within alveoli (Auto-PEEP of 10–25 cmH₂O).\n  - Consequences of Severe Auto-PEEP:\n    1. Hemodynamic Collapse: High intrathoracic pressure compresses superior and inferior vena cava, severely impeding venous return, decreasing RV preload, dropping cardiac output, and causing profound hypotension.\n    2. Pulmonary Barotrauma / Volutrauma: Alveolar rupture causing tension pneumothorax or pneumomediastinum.\n    3. Increased Work of Breathing & Trigger Failure during weaning."
      },
      {
        h: "4. Preoperative Optimization & Smoking Cessation",
        b: "• Smoking Cessation Timeline:\n  - 12 to 24 Hours: Carbon monoxide half-life is 4–6 hours; carboxyhemoglobin drops from 8%–10% to normal (<1%), shifting oxyhemoglobin dissociation curve to the right and improving tissue oxygen delivery; nicotine levels fall.\n  - 48 Hours: Sputum volume temporarily spikes as ciliary motility recovers.\n  - 2 to 4 Weeks: Sputum volume decreases; small airway function improves.\n  - 6 to 8 Weeks: Airway reactivity normalizes, ciliary clearance fully recovers, and postoperative pulmonary complications (PPC) decrease significantly (by >40%–50%).\n• Pharmacological Optimization:\n  - Continue baseline inhaled LABA/LAMA and inhaled corticosteroids (ICS) up to and including the morning of surgery.\n  - In patients with active wheezing or recent exacerbation: 5–7 day course of oral Prednisolone (30–40 mg OD) prior to elective surgery."
      },
      {
        h: "5. Intraoperative Mechanical Ventilation Strategy",
        b: "• Lung-Protective & Expiratory-Prolonging Ventilation Guidelines:\n  1. Tidal Volume: 6 to 8 mL/kg of Predicted Body Weight (PBW). Avoid high volumes.\n  2. Respiratory Rate: Low (8 to 10 breaths/min). Low rate provides a long expiratory time (Te).\n  3. I:E Ratio: 1:3 or 1:4 (prolongs expiration to permit complete alveolar emptying).\n  4. Inspiratory Flow Rate: High peak flow (60–80 L/min) delivers tidal volume quickly, leaving more time for expiration.\n  5. Applied PEEP: Low (0 to 5 cmH₂O). Do not apply high external PEEP.\n  6. Permissive Hypercapnia: Tolerate elevated PaCO₂ (50–65 mmHg) provided arterial pH > 7.20–7.25.\n• THE DISCONNECT TEST FOR INTRAOPERATIVE HYPOTENSION IN COPD:\n  - If a patient with COPD develops sudden hypotension and tachycardia on the ventilator:\n  - IMMEDIATELY DISCONNECT THE ENDOTRACHEAL TUBE FROM THE BREATHING CIRCUIT!\n  - Allow 20–30 seconds for passive exhalation and decompress the stacked air.\n  - If blood pressure recovers immediately, the hypotension was caused by severe Auto-PEEP!"
      },
      {
        h: "6. Treatment of Intraoperative Bronchospasm",
        b: "• Clinical Signs: High peak airway pressures with normal plateau pressure (increased airway resistance: Ppeak - Pplat > 10 cmH₂O), wheezing on auscultation, upward-sloping \"shark-fin\" capnograph waveform, and falling tidal volumes.\n• Step-by-Step Bronchospasm Treatment Protocol:\n  1. 100% FiO₂; deepen anaesthesia immediately by increasing volatile anaesthetic (Sevoflurane is a potent bronchodilator).\n  2. Inhaled Beta-2 Agonist: Salbutamol (albuterol) 8–10 puffs delivered directly into ETT via in-line MDI spacer adapter.\n  3. Inhaled Ipratropium Bromide: 4–6 puffs via MDI.\n  4. IV Hydrocortisone (100 mg) or Methylprednisolone (60–120 mg).\n  5. IV Magnesium Sulfate (1.5 to 2.0 grams infused over 15 minutes): Relaxes bronchial smooth muscle by inhibiting calcium influx.\n  6. IV Ketamine (0.5–1.0 mg/kg): Potent bronchodilator via sympathomimetic and direct antimuscarinic actions.\n  7. Subcutaneous / IV Epinephrine (10–50 mcg IV or 0.3 mg IM/SC) if refractory life-threatening bronchospasm with cardiovascular collapse."
      },
      {
        h: "7. Postoperative Care, Extubation & PPC Prevention",
        b: "• ARISCAT Risk Score for Postoperative Pulmonary Complications (PPC):\n  - 7 variables: Age, Preop SpO₂, Respiratory infection within 1 month, Preop anemia, Surgical incision site (upper abdominal/thoracic), Duration of surgery (>2h), Emergency surgery.\n  - High score (>45 points): >42% risk of pulmonary complications.\n• Extubation Checklist: Extubate fully awake when patient is breathing spontaneously with clear airway, normal capnography, and adequate reversal (TOF > 0.9). Early transition to Non-Invasive Ventilation (NIV / BiPAP) in PACU prevents re-intubation.\n• Postoperative Analgesia: Thoracic epidural, erector spinae plane (ESP) block, or rectus sheath blocks provide superior analgesia without systemic opioid-induced respiratory depression."
      },
      {
        h: "8. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What does the shark-fin waveform on capnography indicate?\n    A: Prolonged, obstructed expiratory gas flow characteristic of bronchospasm or severe chronic obstructive airway disease.\n  - Q: Why should Desflurane be avoided during induction or airway manipulation in COPD?\n    A: Desflurane is pungent and irritates the airway, triggering severe coughing, laryngospasm, and reflex bronchoconstriction at concentrations > 1 MAC.\n  - Q: What is the target PaO₂ / SpO₂ in chronic CO₂-retainers?\n    A: Target SpO₂ 88%–92% (PaO₂ 60–70 mmHg). Excessive oxygen administration (FiO₂ 1.0) eliminates hypoxic drive and worsens V/Q mismatch by reversing regional hypoxic pulmonary vasoconstriction."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 10, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 45, Elsevier, 2025/2026.",
      "Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management, and Prevention of COPD (2024 Report)."
    ]
  },

  // 12. INTERCOSTAL DRAIN (ICD) INSERTION & THORACIC EMPYEMA
  {
    id: "case-intercostal-drain-empyema",
    cat: "case_resp",
    name: "Intercostal Drain (ICD) Insertion & Thoracic Empyema",
    short: "ICD & Thoracic Empyema",
    tags: ["Respiratory", "Empyema", "ICD", "Tension Pneumothorax", "Safe Triangle", "Re-expansion Pulmonary Edema", "Case Discussion"],
    tagline: "Safe triangle anatomy, underwater seal principles, re-expansion pulmonary edema & decortication OLV",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 11; Miller's Anesthesia, 10th ed., Ch. 67; BTS Pleural Disease Guidelines.",
    sections: [
      {
        h: "1. Definition, Empyema Stages & Anatomy of the 'Safe Triangle'",
        b: "• Definition: Collection of pus within the pleural space, almost always secondary to parapneumonic effusion, thoracic trauma, or esophageal rupture.\n• The 3 Pathological Stages of Thoracic Empyema (American Thoracic Society):\n  1. Exudative Stage (Stage 1): Sterile pleural effusion with low viscosity; responds to antibiotics and simple chest tube drainage.\n  2. Fibrinopurulent Stage (Stage 2): Thick, turbid pus with heavy fibrin deposition, forming multi-loculated compartments; requires video-assisted thoracoscopic surgery (VATS) or intrapleural fibrinolytics.\n  3. Organizing / Chronic Stage (Stage 3): Dense, fibrotic pleural peel encasing the lung, preventing re-expansion (\"trapped lung\"); requires open thoracotomy and formal surgical decortication.\n• The British Thoracic Society (BTS) 'Safe Triangle' for ICD Insertion:\n  - Anterior Border: Lateral border of Pectoralis Major.\n  - Posterior Border: Anterior border of Latissimus Dorsi.\n  - Inferior Border: 5th intercostal space (horizontal line at level of nipple in males / inframammary fold in females).\n  - Apex: Base of the axilla.\n  - Insertion Technique: Always insert chest tube ABOVE the rib border (upper border of the 5th or 6th rib) to avoid injuring the intercostal neurovascular bundle (Vein, Artery, Nerve: VAN) running in the subcostal groove along the lower border of each rib."
      },
      {
        h: "2. The Underwater Seal Drainage System Mechanics",
        b: "• Mechanics & Physical Principles:\n  - A one-way valve mechanism allowing air and fluid to escape the pleural cavity while preventing atmospheric air from entering during inspiration.\n  - The underwater seal tube must be submerged exactly 2 cm beneath sterile water level.\n• Clinical Observations & Troubleshooting:\n  - Column Swing / Tidaling: Fluid column rises during inspiration (negative intrapleural pressure) and falls during expiration in a spontaneously breathing patient (reversed during positive-pressure mechanical ventilation!). Absence of swing indicates tube occlusion or complete lung re-expansion.\n  - Continuous Bubbling in Underwater Seal: Indicates continuous air leak (bronchopleural fistula or leak in external drainage tubing).\n• CLAMPING RULES:\n  - NEVER clamp an ICD during patient transport or mechanical ventilation! Clamping a chest tube in the presence of an active air leak converts a simple pneumothorax into a FATAL TENSION PNEUMOTHORAX within minutes!"
      },
      {
        h: "3. Re-Expansion Pulmonary Edema (REPE) Hazard",
        b: "• Pathophysiology & Risk Factors:\n  - Life-threatening unilateral (or bilateral) pulmonary edema occurring following rapid evacuation of large-volume pleural fluid or air (> 1.0–1.5 Liters) in a chronically collapsed lung (> 72 hours).\n  - Mechanism: Sudden mechanical traction on chronically ischemic pulmonary capillaries increases vascular permeability; reperfusion injury releases toxic oxygen-free radicals.\n• Mandatory Preventive Rule:\n  - Limit initial drainage of chronic pleural effusion to MAXIMUM 1.0 to 1.5 Liters in the first hour. Clamp chest tube for 1 hour after draining 1000 mL to allow gradual alveolar capillary adaptation."
      },
      {
        h: "4. Anesthetic Management for Surgical Decortication",
        b: "• Lung Isolation: Left or right-sided DLT is placed to achieve complete collapse of the diseased lung, providing surgical exposure for peel decortication.\n• Intraoperative Challenges:\n  - Dense fibrothorax adheres lung to chest wall and diaphragm; surgical dissection risks massive hemorrhage from intercostal vessels, pulmonary vessels, or systemic bronchial collaterals.\n  - Lung Parenchymal Air Leaks: Aggressive decortication often tears lung parenchyma, resulting in high-volume air leaks. Test lung at end of decortication with 25–30 cmH₂O sustained positive pressure under saline immersion to identify and repair major bronchial lacerations."
      },
      {
        h: "5. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What are the emergency management steps for suspected Tension Pneumothorax?\n    A: Immediate needle thoracostomy with a large-bore cannula (14G or 16G) inserted into the 2nd intercostal space in the midclavicular line (or 4th/5th intercostal space anterior axillary line), followed immediately by formal tube thoracostomy in the safe triangle.\n  - Q: Why is Nitrous Oxide contraindicated in patients with an undrained pneumothorax?\n    A: Nitrous oxide is 34 times more soluble than nitrogen. It diffuses rapidly into the closed air space much faster than nitrogen can leave, doubling the volume of a pneumothorax in 10 minutes and tripling it in 30 minutes, converting it into a tension pneumothorax.\n  - Q: What does persistent bubbling in both inspiration and expiration signify?\n    A: A large, continuous bronchopleural fistula (BPF) with communication between the tracheobronchial tree and the pleural space."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 11, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 67, Elsevier, 2025/2026.",
      "Havelock T, et al. Pleural procedures and thoracic ultrasound: British Thoracic Society Pleural Disease Guideline 2010/2023. Thorax."
    ]
  }
];
