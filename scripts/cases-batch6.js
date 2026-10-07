// ============================================================================
// BATCH 6: TRAUMA, ORTHOPEDIC, AIRWAY & GERIATRIC CASES (8 Cases)
// Reference: Objective Anaesthesia Review (6th ed., Tata/Kulkarni/Divatia),
// Miller's Anesthesia (10th ed.), 2022 ASA & DAS Guidelines, ASRA LAST Guidelines.
// ============================================================================

module.exports = [
  // 1. MANAGING THE DIFFICULT AIRWAY
  {
    id: "case-managing-difficult-airway",
    cat: "case_trauma_ortho_special",
    name: "Managing Difficult Airway",
    short: "Difficult Airway Management",
    tags: ["Airway", "Difficult Airway", "LEMON", "DAS 2015", "ASA 2022", "Awake Fibreoptic", "CICO", "Case Discussion"],
    tagline: "LEMON assessment, 2022 ASA/DAS algorithms, awake fibreoptic protocol, scalpel-bougie-tube & extubation strategy",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 33; Miller's Anesthesia, 10th ed., Ch. 44; 2022 ASA Difficult Airway Guidelines; 2015 DAS Guidelines.",
    sections: [
      {
        h: "1. Definition, Bedside Airway Predictors & LEMON Score",
        b: "• Definition: Clinical situation where an anticipated or unanticipated difficulty arises in facemask ventilation, supraglottic airway placement, laryngoscopy, or tracheal intubation.\n• LEMON Bedside Airway Assessment Score:\n  - L: Look Externally (Facial trauma, micrognathia, large tongue, beard, morbid obesity).\n  - E: Evaluate 3-3-2 Rule:\n    • Inter-incisor gap ≥ 3 fingerbreadths (mouth opening > 4 cm).\n    • Hyomental distance ≥ 3 fingerbreadths (> 6 cm).\n    • Thyroid-to-hyoid distance ≥ 2 fingerbreadths (> 3–4 cm).\n  - M: Mallampati Score (Modified Samsoon & Young):\n    • Class I: Soft palate, fauces, uvula, and anterior/posterior pillars visible.\n    • Class II: Soft palate, fauces, and uvula visible.\n    • Class III: Soft palate and base of uvula visible.\n    • Class IV: Only hard palate visible (strong predictor of difficult laryngoscopy).\n  - O: Obstruction / Obesity (Stridor, peritonsillar abscess, Ludwig's angina, BMI > 35).\n  - N: Neck Mobility (Atlanto-occipital extension < 35° or cervical spine immobilization).\n• Cormack-Lehane Laryngoscopy Grading:\n  - Grade 1: Full view of glottic opening and vocal cords.\n  - Grade 2: Posterior portion of glottis/arytenoids visible (2a: partial cords; 2b: arytenoids only).\n  - Grade 3: Only epiglottis visible (3a: liftable; 3b: adherent to pharynx).\n  - Grade 4: Neither vocal cords nor epiglottis visible (soft palate only)."
      },
      {
        h: "2. The Difficult Airway Algorithms (2022 ASA & 2015 DAS)",
        b: "• The 4 Progressive Plan Architecture:\n  - PLAN A: Facemask Ventilation & Primary Tracheal Intubation:\n    • Optimize head position (sniffing position / ramped in obesity), pre-oxygenate to ETO₂ > 90%.\n    • Use Videolaryngoscope (VL) as first-line device + Bougie/Stylet.\n    • MAXIMUM 3 ATTEMPTS allowed (changing blade size, operator, or device between attempts).\n  - PLAN B: Secondary Intubation Rescue / Supraglottic Airway Device (SAD):\n    • Insert 2nd-generation SAD (e.g. i-gel, ProSeal LMA) with gastric drainage port.\n    • Maximum 2 attempts. If SAD achieves adequate ventilation: oxygenate, wake patient up, or intubate via SAD using AFOI.\n  - PLAN C: Facemask Ventilation Rescue:\n    • If SAD fails: Attempt two-person facemask ventilation with oropharyngeal/nasopharyngeal airways.\n    • Administer Sugammadex (16 mg/kg) if Rocuronium used to reverse neuromuscular block.\n  - PLAN D: CANNOT INTUBATE, CANNOT OXYGENATE (CICO):\n    • DECLARE CICO EMERGENCY! Call for immediate help.\n    • 100% O₂, ensure 100% neuromuscular relaxation (prevents laryngeal spasm)."
      },
      {
        h: "3. Plan D Emergency Protocol: Emergency Front-of-Neck Access (eFONA)",
        b: "• SCALPEL-BOUGIE-TUBE EMERGENCY CRICOTHYROIDOTOMY (DAS Technique of Choice):\n  1. Laryngeal Hand: Stabilize the thyroid and cricoid cartilages with non-dominant hand.\n  2. Transverse Stab: Make a transverse incision through cricothyroid membrane using a No. 10 scalpel blade (if anatomy palpated; vertical incision if impalpable/obese).\n  3. Rotate Scalpel: Turn blade 90° so cutting edge faces caudally (feet), gently retracting to create a triangular gap.\n  4. Bougie Insertion: Slide coude-tip gum elastic bougie along scalpel flat into the trachea (confirm tracheal clicks or hold-up at carina at 10–15 cm).\n  5. Rail-Road Tube: Rail-road a cuffed 6.0 mm (or 5.0 mm) cuffed endotracheal tube over bougie into the trachea.\n  6. Inflate cuff, confirm EtCO₂ waveform, and secure tube."
      },
      {
        h: "4. Awake Fibreoptic Intubation (AFOI) Protocol (Gold Standard for Known Difficult Airway)",
        b: "• Indications: Anticipated difficult airway, severe stridor, unstable cervical spine, limited mouth opening (< 1.5 cm), head/neck tumors.\n• Preparation & Topicalization Bundle:\n  - Antisialagogue: Glycopyrrolate 0.2 mg IM 30–45 min prior (dries secretions for optical clarity).\n  - Nasal Preparation (if nasal): Xylometazoline 0.1% drops + 4% Lignocaine soaked ribbons.\n  - Airway Blocks / Topicalization:\n    • Nebulized 4% Lignocaine (4 mL) via face mask with 6 L/min O₂.\n    • Superior Laryngeal Nerve (SLN) Block: 2 mL of 2% Lignocaine injected at greater cornu of hyoid bone.\n    • Transtracheal / Recurrent Laryngeal Nerve Block: 3–4 mL of 2% or 4% Lignocaine injected into cricothyroid membrane during inspiration; patient coughs, spraying vocal cords.\n  - Target Sedation: DEXMEDETOMIDINE infusion (0.5–1 mcg/kg over 10 min, then 0.2–0.5 mcg/kg/hr) maintains spontaneous respiration, patient cooperativeness, and patent airway."
      },
      {
        h: "5. Extubation Strategy for the Difficult Airway",
        b: "• DAS Difficult Airway Extubation Guidelines:\n  - Assess Risk: High-risk extubation if prior difficult intubation, airway edema, morbid obesity, or surgical site swelling.\n  - Prerequisites: Patient wide awake, normothermic, full reversal of neuromuscular block (TOF ratio > 0.9), and POSITIVE CUFF LEAK TEST.\n  - Advanced Extubation Tool: Airway Exchange Catheter (Cook AEC).\n    • Insert AEC through ETT before extubation; advance to mid-trachea (depth 22–24 cm).\n    • Remove ETT over AEC, leaving AEC in situ.\n    • AEC serves as a guide for immediate re-intubation if airway failure occurs within 30–60 minutes; can deliver oxygen via Rapi-Fit adapter."
      },
      {
        h: "6. High-Yield Exam Viva Pearls (Tata 6th ed.)",
        b: "• High-Yield Exam Viva Pearls:\n  - Q: What are the three axes of the airway and how are they aligned?\n    A: Oral axis (OA), Pharyngeal axis (PA), and Laryngeal axis (LA). In the \"sniffing the morning air\" position (35° cervical flexion and 85° atlanto-occipital extension), PA and LA align, and OA approaches the common line, providing an optimal line of sight.\n  - Q: Why is needle cricothyroidotomy with high-pressure jet ventilation less preferred than scalpel-bougie-tube?\n    A: High complication rate: barotrauma, subcutaneous emphysema, catastrophic failure rate (> 60% in emergencies), and inability to eliminate CO₂."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 33, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 44, Elsevier, 2025/2026.",
      "2022 American Society of Anesthesiologists Practice Guidelines for Management of the Difficult Airway. Anesthesiology 2022;136(1):31-81.",
      "Difficult Airway Society 2015 guidelines for management of unanticipated difficult intubation in adults. Br J Anaesth 2015;115(6):827-848."
    ]
  },

  // 2. BURNS & INHALATIONAL INJURY MANAGEMENT
  {
    id: "case-major-burns-management",
    cat: "case_trauma_ortho_special",
    name: "Burns & Inhalational Injury Management",
    short: "Major Burns & Inhalational Injury",
    tags: ["Trauma", "Burns", "Parkland Formula", "Inhalational Injury", "Succinylcholine Contraindication", "Carbon Monoxide", "Case Discussion"],
    tagline: "Parkland-Baxter resuscitation, inhalational injury triage, sux lethal hyperkalemia rule & altered relaxant pharmacokinetics",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 29; Miller's Anesthesia, 10th ed., Ch. 73; American Burn Association (ABA) Guidelines.",
    sections: [
      {
        h: "1. Definition, Burn Surface Area Estimation & Parkland Formula",
        b: "• Wallace Rule of Nines for Total Body Surface Area (% TBSA):\n  - Head & Neck: 9% (Child: 18%).\n  - Each Upper Limb: 9% (Child: 9%).\n  - Anterior Trunk: 18% (Child: 18%).\n  - Posterior Trunk: 18% (Child: 18%).\n  - Each Lower Limb: 18% (Child: 14%).\n  - Perineum: 1% (Child: 1%).\n  - Patient's palm (including fingers) = approximately 1% TBSA.\n• Fluid Resuscitation Formulas:\n  - Parkland (Baxter) Formula: Total 24h Ringer's Lactate = 4 mL × Weight (kg) × % TBSA burnt (2nd and 3rd degree).\n    • First 8 hours: Administer 50% (calculated from the EXACT TIME OF BURN INJURY, not hospital arrival!).\n    • Next 16 hours: Administer remaining 50%.\n  - Modern ABA Consensus Guidelines: 2 to 4 mL/kg/% TBSA. Avoid \"fluid creep\" (excessive resuscitation causing abdominal compartment syndrome and ARDS).\n  - Resuscitation Targets: Hourly Urine Output 0.5 to 1.0 mL/kg/hr in adults (1.0–1.5 mL/kg/hr in children); MAP > 65 mmHg; normalizing base deficit."
      },
      {
        h: "2. Pathophysiology: Inhalational Injury & Systemic Toxicity",
        b: "• Triad of Inhalational Injury:\n  1. Supraglottic Thermal Injury: Massive upper airway and laryngeal edema. May progress rapidly over 12–24h from subtle voice hoarseness to complete asphyxial airway obstruction!\n  2. Subglottic Chemical Tracheobronchitis: Inhaled toxic combustion products (aldehydes, sulfur oxides) cause mucosal sloughing, bronchospasm, and cast formation.\n  3. Systemic Toxic Gas Inhalation:\n     - Carbon Monoxide (CO): Binds hemoglobin with 200–250× higher affinity than O₂, forming carboxyhemoglobin (COHb) and shifting O₂-Hb dissociation curve to the left. NOTE: Standard pulse oximeters CANNOT distinguish COHb from oxyhemoglobin, falsely reading normal SpO₂ (98%–100%)!\n     - Cyanide (HCN): Inhibits cytochrome c oxidase in mitochondrial electron transport chain, causing profound lactic acidosis and cellular histotoxic hypoxia."
      },
      {
        h: "3. Preoperative Evaluation: Airway Triage & Emergency Escharotomy",
        b: "• Airway Inspection for Inhalational Burn Red Flags:\n  - Facial burns, singed nasal vibrissae / eyebrows, carbonaceous sputum, hoarseness of voice, brassy cough, resting stridor.\n  - EARLY INTUBATION MANDATE: If red flags exist, INTUBATE IMMEDIATELY before progressive edema obliterates laryngeal anatomy!\n• Circumferential Full-Thickness Burns:\n  - Circumferential Chest Wall Burns: Act as a rigid vise, severely restricting chest excursion and ventilation. Requires emergent bedside ESCHAROTOMY (lateral chest wall incised down to subcutaneous fat).\n  - Circumferential Limb Burns: Causes compartment syndrome; requires urgent limb escharotomy/fasciotomy."
      },
      {
        h: "4. Pharmacology: The Succinylcholine Contraindication & Relaxant Resistance",
        b: "• SUCCINYLCHOLINE CONTRAINDICATION (Lethal Hyperkalemia):\n  - Thermal injury triggers massive up-regulation and proliferation of immature extrajunctional acetylcholine receptors (alpha-7 and gamma subunits) across the ENTIRE muscle membrane surface.\n  - Depolarization by Succinylcholine causes catastrophic, uncontrolled systemic efflux of intracellular potassium (serum K⁺ can surge by 5 to 10 mEq/L within 2 minutes!), triggering immediate refractory ventricular fibrillation or cardiac arrest!\n  - Safety Window: Sux is safe ONLY within the first 24 hours post-burn. It is STRICTLY CONTRAINDICATED from 24 hours post-burn up to 1 to 2 YEARS (until full re-epithelialization and muscle healing occurs!).\n• Non-Depolarizing Muscle Relaxants (NDMRs):\n  - RESISTANCE to NDMRs (Rocuronium, Vecuronium): Due to receptor up-regulation, 2 to 3-fold higher doses are required to achieve neuromuscular blockade. Quantitative TOF monitoring is mandatory."
      },
      {
        h: "5. Specific Intraoperative Concerns: Massive Excision & Temperature Control",
        b: "• Massive Blood Loss During Burn Tangential Excision:\n  - Blood loss averages 200 to 400 mL per 1% TBSA excised.\n  - Ensure multiple large-bore IV access, blood warmers, and massive transfusion protocol (MTP 1:1:1) activated.\n  - Topical hemostasis: Epinephrine-soaked gauze and subcutaneous clysis.\n• Severe Hypothermia Hazard:\n  - Loss of epidermal barrier, wet surgical fields, and open tissues cause rapid core heat loss.\n  - Maintain OT ambient temperature at 28°C–32°C; use forced-air warming blankets, fluid warmers, and humidified breathing circuits."
      },
      {
        h: "6. Postoperative Concerns, Sepsis & Exam Pearls",
        b: "• Hypermetabolic State & Catabolism:\n  - Metabolic rate increases up to 200% above baseline. Enteral nutrition should be initiated early.\n  - Sepsis & Multi-Organ Dysfunction: Leading cause of late mortality (> 72 hours post-burn).\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: How is carbon monoxide poisoning managed?\n    A: 100% FiO₂ via tight-fitting mask or ETT (reduces COHb half-life from 320 minutes on room air down to 60–80 minutes). Hyperbaric oxygen (HBO at 2.5–3.0 atm) further reduces half-life to 20–30 minutes in severe toxicity.\n  - Q: What is the antidote for suspected cyanide poisoning in fire victims?\n    A: HYDROXOCOBALAMIN (Cyanokit; 5 g IV over 15 min), which binds cyanide to form non-toxic cyanocobalamin excreted in urine."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 29, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 73, Elsevier, 2025/2026.",
      "American Burn Association Practice Guidelines for Burn Shock Resuscitation. J Burn Care Res 2016;37(3):159-181."
    ]
  },

  // 3. GERIATRIC PATIENT WITH MULTIMORBIDITY & FRAILTY
  {
    id: "case-geriatric-patient-anaesthesia",
    cat: "case_trauma_ortho_special",
    name: "Geriatric Patient with Multimorbidity & Frailty",
    short: "Geriatric Patient & Frailty",
    tags: ["Geriatric", "Frailty", "CFS Score", "CAM-ICU", "Delirium", "Pharmacokinetics", "Case Discussion"],
    tagline: "Clinical Frailty Scale, blunted organ reserve, altered pharmacokinetics, 'start low go slow' & delirium prevention",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 27; Miller's Anesthesia, 10th ed., Ch. 71; AGS Beers Criteria 2023.",
    sections: [
      {
        h: "1. Definition, Clinical Frailty Scale (CFS) & Organ Aging",
        b: "• Definition: Chronological age ≥ 65 years. Frailty is a distinct biological syndrome of decreased physiological reserve and vulnerability to perioperative decompensation.\n• Dalhousie Clinical Frailty Scale (CFS 1–9 Scoring):\n  - CFS 1: Very Fit (active, energetic).\n  - CFS 2: Fit (no active disease, moderately active).\n  - CFS 3: Managing Well (medical problems well controlled).\n  - CFS 4: Living with Very Mild Frailty (symptoms limit activities, not dependent).\n  - CFS 5: Mild Frailty (needs help with instrumental ADLs: finances, heavy chores).\n  - CFS 6: Moderate Frailty (needs help with bathing, dressing, climbing stairs).\n  - CFS 7: Severe Frailty (completely dependent for personal care).\n  - CFS 8: Very Severe Frailty (completely dependent, approaching end of life).\n  - CFS 9: Terminally Ill.\n  - Impact: CFS ≥ 5 strongly predicts postoperative delirium, prolonged ICU stay, loss of independence, and 1-year mortality."
      },
      {
        h: "2. Pathophysiology: Cardiovascular, Respiratory & Neural Aging",
        b: "• Cardiovascular Alterations:\n  - Arterial elastance decreases (arteriosclerosis), producing systolic hypertension and widened pulse pressure.\n  - Left Ventricular Diastolic Dysfunction: Myocardial stiffening makes LV filling highly dependent on atrial kick (loss of sinus rhythm in AF causes precipitous hypotension!).\n  - Blunted Baroreceptor Reflex: Vasodilation causes severe hypotension with blunted compensatory tachycardia.\n• Respiratory Alterations:\n  - Decreased chest wall compliance and alveolar elastance (senile emphysema).\n  - Closing Capacity (CC) increases with age: CC exceeds FRC in supine position at age 44, and in upright sitting position at age 66, causing dependent airway closure, atelectasis, and hypoxemia.\n  - Blunted ventilatory responses to hypoxia and hypercapnia.\n• Central Nervous System:\n  - Brain mass decreases by 10%–20%; neuronal loss and reduced synthesis of acetylcholine, dopamine, and GABA.\n  - Minimum Alveolar Concentration (MAC) of volatile anesthetics decreases by 6% per decade of life after 40."
      },
      {
        h: "3. Pharmacokinetics & Pharmacodynamics: \"Start Low, Go Slow\"",
        b: "• Altered Body Composition:\n  - Decreased total body water (by 15%) → Decreased central volume of distribution for hydrophilic drugs (e.g. Propofol, muscle relaxants) → Higher initial peak plasma concentrations!\n  - Increased total body fat (by 35%) → Expanded volume of distribution and prolonged elimination half-life for lipophilic drugs (e.g. Midazolam, Fentanyl, Diazepam).\n  - Serum Albumin decreases → Increased free (unbound, active) fraction of acidic drugs (e.g. Propofol, Thiopental, Diazepam).\n  - Alpha-1 Acid Glycoprotein increases → Decreased free fraction of basic drugs (e.g. Lignocaine).\n• Renal & Hepatic Elimination:\n  - Renal mass and GFR decrease by 1 mL/min/year after age 40 (normal serum creatinine is misleading due to reduced muscle mass!). Drug clearance is markedly delayed."
      },
      {
        h: "4. Anesthetic Strategy, Monitoring & Hemodynamic Management",
        b: "• Dosing Protocol (\"Rule of Halves\"):\n  - Reduce induction doses of Propofol/Etomidate by 40%–50%.\n  - Inject slowly: Circulation time is prolonged; premature bolus re-dosing causes massive overdosing and cardiovascular collapse!\n• Neuraxial Anesthesia Considerations:\n  - Spinal anesthesia produces rapid, unpredictable rostral cephalad spread due to reduced CSF volume and narrowed intervertebral spaces.\n  - Sympathectomy causes severe, refractory hypotension. Use low-dose isobaric/hyperbaric bupivacaine (5–7.5 mg) with titrated fentanyl/morphine.\n• Depth of Anesthesia Monitoring:\n  - Processed EEG / BIS monitoring is recommended (target BIS 40–60). Avoid burst suppression, which directly correlates with postoperative delirium."
      },
      {
        h: "5. Specific Intraoperative Concerns & Delirium Prophylaxis",
        b: "• Beers Criteria (2023 Update) — Drugs to STRICTLY AVOID:\n  - Benzodiazepines (Midazolam, Lorazepam): Strongly trigger delirium.\n  - Anticholinergics (Atropine, Scopolamine): Crosses blood-brain barrier, precipitating central anticholinergic syndrome (Glycopyrrolate is safe as it is a quaternary amine).\n  - Meperidine / Pethidine: Toxic normeperidine accumulation.\n• Multimodal Opioid-Sparing Analgesia:\n  - Regional peripheral nerve blocks (e.g. PENG, Fascia Iliaca, Erector Spinae Plane blocks) + IV Paracetamol.\n  - Continue baseline beta-blockers and statins; maintain strict normothermia (prevent shivering and myocardial ischemia)."
      },
      {
        h: "6. Postoperative Delirium (POD) Screening & Exam Pearls",
        b: "• CAM-ICU (Confusion Assessment Method for ICU) Tool:\n  - Feature 1: Acute onset or fluctuating course of mental status.\n  - Feature 2: Inattention (letters test: squeeze hand on letter 'A').\n  - Feature 3: Altered level of consciousness (RASS score other than 0).\n  - Feature 4: Disorganized thinking.\n  - Diagnosis: Positive if Feature 1 + Feature 2 + EITHER Feature 3 OR 4.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is normal serum creatinine misleading in elderly patients?\n    A: Muscle mass decreases markedly with age (sarcopenia); creatinine generation is reduced in proportion to GFR reduction. Creatinine clearance must be calculated using Cockcroft-Gault formula."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 27, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 71, Elsevier, 2025/2026.",
      "American Geriatrics Society 2023 Updated AGS Beers Criteria for Potentially Inappropriate Medication Use in Older Adults. J Am Geriatr Soc 2023;71(7):2052-2081."
    ]
  },

  // 4. PROXIMAL FRACTURE FEMUR & BONE CEMENT IMPLANTATION SYNDROME
  {
    id: "case-proximal-fracture-femur-bcis",
    cat: "case_trauma_ortho_special",
    name: "Proximal Fracture Femur & Bone Cement Implantation Syndrome",
    short: "Femur Fracture & BCIS",
    tags: ["Orthopedic", "Hip Fracture", "BCIS", "Bone Cement", "Donaldson Criteria", "PENG Block", "Case Discussion"],
    tagline: "48-hour surgery window, Donaldson BCIS staging, fat/monomer embolization, pre-cementing protocol & RV resuscitation",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 28; Miller's Anesthesia, 10th ed., Ch. 70; AAGBI Safety Guideline: Reducing risk of BCIS.",
    sections: [
      {
        h: "1. Definition, Epidemiology & The 48-Hour Surgical Window",
        b: "• Definition: Fractures of the proximal femur (femoral neck, intertrochanteric, or subtrochanteric) in elderly patients with osteoporosis.\n• The 48-Hour Surgical Window Mandate:\n  - Surgery within 24 to 48 hours of admission significantly reduces 30-day mortality, pneumonia, pressure ulcers, and deep vein thrombosis (NICE / AAOS Guidelines).\n  - Preoperative delay should be limited strictly to reversing acute life-threatening medical conditions (e.g. severe hypovolemia, acute decompensated heart failure, severe hyperkalemia).\n• Bone Cement Implantation Syndrome (BCIS):\n  - Characterized by acute hypoxia, hypotension, cardiac arrhythmias, loss of consciousness, and/or cardiac arrest occurring at the time of cement insertion, prosthesis insertion, or joint reduction during cemented hemiarthroplasty or total hip replacement."
      },
      {
        h: "2. Donaldson Classification & Staging of BCIS",
        b: "• Donaldson BCIS Severity Grading:\n  - Grade 1 (Mild): Moderate fall in SBP (drop ≥ 20%) OR moderate desaturation (SpO₂ < 94% on room air or PaO₂/FiO₂ < 300).\n  - Grade 2 (Severe): Severe fall in SBP (drop ≥ 40%) OR severe desaturation (SpO₂ < 88% or PaO₂/FiO₂ < 200) OR transient loss of consciousness.\n  - Grade 3 (Catastrophic): Cardiovascular collapse / cardiac arrest requiring immediate CPR / inotropic resuscitation (associated with > 50% mortality in elderly patients!)."
      },
      {
        h: "3. Pathophysiology: Monomer Toxicity vs Embolic Phenomenon",
        b: "• The Embolic Phenomenon (Primary Mechanism):\n  - Pressurization of Polymethylmethacrylate (PMMA) bone cement forces marrow contents, fat globules, bone fragments, and air bubbles under high pressure into the open medullary venous channels.\n  - Massive embolization showers into the pulmonary vascular bed, causing acute pulmonary microvascular occlusion, intense reflex vasoconstriction, and acute right ventricular failure / sudden drop in LV preload.\n• Methylmethacrylate (MMA) Monomer Toxicity (Secondary):\n  - Absorbed monomer causes direct vasodilation, myocardial depression, and histamine release."
      },
      {
        h: "4. The Pre-Cementing Prophylaxis Protocol (AAGBI Guidelines)",
        b: "• Step-by-Step Prevention Protocol:\n  1. SURGICAL-ANAESTHETIC COMMUNICATION: Surgeon MUST announce clearly 2 to 3 minutes before cement application (\"CEMENTING IN 2 MINUTES\").\n  2. 100% OXYGEN: Switch FiO₂ to 1.0 immediately before cementing.\n  3. HEMODYNAMIC OPTIMIZATION: Ensure intravascular volume is replete; maintain baseline SBP or elevate by 10%–15% using IV fluid bolus or vasopressor infusion (Phenylephrine / Noradrenaline).\n  4. SURGICAL MITIGATION TECHNIQUES:\n     - Thorough pulsatile marrow lavage to remove fat and debris.\n     - Suction drying of femoral canal.\n     - Avoid excessive manual pressurization of cement.\n     - Drill a distal medullary venting hole to relieve intramedullary pressure during prosthesis insertion."
      },
      {
        h: "5. Resuscitation Protocol for Established BCIS Collapse",
        b: "• Immediate Crisis Action:\n  - If sudden drop in EtCO₂, desaturation, or severe hypotension occurs during cementing:\n  1. Inform surgeon immediately; abort prosthesis manipulation.\n  2. Discontinue any volatile agents / anesthetics; 100% O₂.\n  3. AGGRESSIVE RESUSCITATION FOR ACUTE RIGHT VENTRICULAR FAILURE:\n     - Fluid bolus to maintain RV filling pressure.\n     - IV EPINEPHRINE (ADRENALINE 50–100 mcg bolus, or 1 mg if cardiac arrest): Drug of choice to restore coronary perfusion pressure and inotropic support to the failing RV.\n     - IV Noradrenaline infusion to maintain SVR.\n     - Initiate CPR immediately if pulseless electrical activity (PEA) develops."
      },
      {
        h: "6. Regional Analgesia Blocks, Postoperative Care & Exam Pearls",
        b: "• Pericapsular Nerve Group (PENG) Block & Fascia Iliaca Compartment Block (FICB):\n  - PENG Block: Targets femoral nerve, obturator nerve, and accessory obturator nerve articular branches along the iliopubic eminence. Provides outstanding anterior hip analgesia without motor weakness.\n  - Safe to perform in ED on admission; reduces opioid requirements and confusion.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is sudden drop in EtCO₂ the earliest monitor sign of BCIS?\n    A: Embolization of bone marrow fat and cement into the pulmonary circulation creates sudden pulmonary vascular occlusion and massive alveolar dead space, dropping expired EtCO₂ instantly.\n  - Q: Is uncemented prosthesis safer than cemented in elderly hip fracture?\n    A: Uncemented eliminates BCIS risk, but has higher rates of intraoperative periprosthetic fractures, post-op thigh pain, and revision rates; cemented is preferred provided BCIS safety protocol is followed."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 28, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 70, Elsevier, 2025/2026.",
      "Griffiths R, et al. Safety guideline: reducing the risk from bone cement in surgery. Anaesthesia 2015;70(5):623-626."
    ]
  },

  // 5. CATARACT SURGERY & OPHTHALMIC REGIONAL BLOCKS
  {
    id: "case-cataract-ophthalmic-blocks",
    cat: "case_trauma_ortho_special",
    name: "Cataract Surgery & Ophthalmic Regional Blocks",
    short: "Cataract & Ophthalmic Blocks",
    tags: ["Ophthalmology", "Cataract", "Peribulbar Block", "Retrobulbar", "Oculocardiac Reflex", "Brainstem Anesthesia", "Case Discussion"],
    tagline: "Orbital anatomy, peribulbar vs retrobulbar technique, oculocardiac reflex rescue & brainstem anesthesia protocol",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 34; Miller's Anesthesia, 10th ed., Ch. 75; Royal College of Anaesthetists Guidelines.",
    sections: [
      {
        h: "1. Definition, Orbital Anatomy & Intraocular Pressure (IOP)",
        b: "• Definition: Surgical extraction of opacified crystalline lens with intraocular lens (IOL) implantation (Phacoemulsification).\n• Orbital Anatomy & Fascia Bulbi (Tenon's Capsule):\n  - Muscle Cone: Formed by the four rectus muscles originating from the Annulus of Zinn. Encloses the optic nerve, ophthalmic artery, and ciliary ganglion.\n  - Retrobulbar Space: Inside the muscle cone.\n  - Peribulbar Space: Outside the muscle cone, between muscles and orbital bony walls (freely communicates with retrobulbar space via intermuscular septa).\n• Normal Intraocular Pressure (IOP): 10 to 21 mmHg.\n  - Factors raising IOP: Hypoxemia, hypercapnia, hypertension, coughing, straining, succinylcholine, ketamine, and external orbital pressure.\n  - Factors lowering IOP: Inhalational anesthetics, propofol, opioids, hypothermia, hyperventilation, and hyperosmolar agents (Mannitol)."
      },
      {
        h: "2. Peribulbar vs Retrobulbar Block: Technique & Safety",
        b: "• Peribulbar Block (Technique of Choice):\n  - Needle: 25G, 25 mm Atkinson (blunt-beveled) needle.\n  - Inferotemporal Injection: Needle inserted at the junction of lateral 1/3rd and medial 2/3rds of the inferior orbital rim; advanced tangentially under the globe along the orbital floor (depth ≤ 25 mm).\n  - Volume: 5 to 7 mL of local anesthetic mixture (0.5% Bupivacaine + 2% Lignocaine + Hyaluronidase 15–30 IU/mL).\n  - Medial / Superomedial Injection (if required): 2 to 3 mL at medial canthus (caruncle).\n• Comparison: Retrobulbar vs Peribulbar:\n  - Retrobulbar needle penetrates the muscle cone: Higher risk of retrobulbar hemorrhage, optic nerve trauma, globe penetration, and subarachnoid injection into optic nerve sheath!\n  - Peribulbar deposits LA outside the cone: Significantly safer, accomplishes both sensory block (ciliary nerves) AND motor akinesia (CN III, IV, VI, VII via diffuse spread) with minimal complication risk."
      },
      {
        h: "3. The Oculocardiac Reflex (OCR / Aschner Reflex)",
        b: "• Reflex Arc:\n  - Afferent Limb: Trigeminal Nerve (CN V₁ — Ophthalmic division via short and long ciliary nerves → ciliary ganglion → Gasserian ganglion).\n  - Center: Trigeminal sensory nucleus in brainstem (communicates with vagal visceral motor nucleus via internuncial fibers).\n  - Efferent Limb: Vagus Nerve (CN X) via cardiac branches.\n• Clinical Triggers & Presentation:\n  - Triggered by: Traction on extraocular muscles (especially MEDIAL RECTUS), pressure on the globe, retrobulbar injection, or ocular trauma.\n  - Presentation: Sudden sinus bradycardia (drop in HR > 20%), junctional rhythm, AV block, ventricular ectopics, or asystole.\n• Immediate Emergency Protocol:\n  1. Instantly ask surgeon: \"STOP TRACTION / REMOVE RETRACTOR!\"\n  2. Reflex usually resolves spontaneously within seconds of releasing traction.\n  3. If bradycardia persists or recurs: Administer IV ATROPINE 0.5 mg (or Glycopyrrolate 0.2 mg).\n  4. Infiltrate additional local anesthetic into the extraocular muscle to block afferent nerves."
      },
      {
        h: "4. Catastrophic Complications: Brainstem Anesthesia & Globe Perforation",
        b: "• 1. Brainstem Anesthesia (Subarachnoid / Subdural Sheath Injection):\n  - Mechanism: Accidental penetration of the optic nerve sheath (an extension of the meninges surrounding subarachnoid space) allows local anesthetic to track directly into the chiasm and brainstem.\n  - Clinical Sequence: Starts 2 to 10 minutes post-injection with contralateral amaurosis (blindness in opposite eye), cranial nerve palsies, dysphagia, sudden shivering/apnea, unconsciousness, severe hypotension, and cardiac arrest.\n  - Emergency Protocol: Call for help, secure airway (immediate endotracheal intubation), 100% O₂, mechanical ventilation, inotropes/fluids. Recovery typically takes 2 to 4 hours as LA is redistributed.\n• 2. Globe Perforation:\n  - High-risk patients: High axial myopia (axial length > 26 mm; thin sclera and posterior staphyloma), enophthalmos, previous scleral buckle.\n  - Signs: Sudden severe pain, sudden increase in IOP, loss of red reflex, intraocular hemorrhage. Terminate surgery; immediate retinal review."
      },
      {
        h: "5. Specific Intraoperative Concerns: Akinesia & Cough Prevention",
        b: "• Globe Akinesia Assessment: Complete immobility of the eye in all 4 quadrants (superior, inferior, medial, lateral) within 5–10 minutes.\n• Honan Intraocular Pressure Reducer: Gentle orbital compression (30 mmHg for 10–15 min) lowers IOP and promotes anesthetic dispersion.\n• Cough Suppression: Coughing during open-globe surgery causes catastrophic expulsive choroidal hemorrhage and extrusion of ocular contents. Mitigation: Pre-op codeine/dextromethorphan; avoid irritant gases."
      },
      {
        h: "6. Postoperative Concerns, Ambulatory Discharge & Exam Pearls",
        b: "• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is Hyaluronidase added to ophthalmic local anesthetic mixtures?\n    A: Hyaluronidase hydrolyzes hyaluronic acid in orbital connective tissue, dramatically speeding local anesthetic penetration, reducing onset time of akinesia, and improving block quality.\n  - Q: How does Succinylcholine affect intraocular pressure?\n    A: Succinylcholine causes sustained tonic contracture of extraocular muscles, raising IOP by 6 to 12 mmHg within 1 to 4 minutes (use with caution in open-globe trauma; Rocuronium 1.2 mg/kg is preferred)."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 34, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 75, Elsevier, 2025/2026.",
      "Local Anaesthesia for Ophthalmic Surgery: Joint Guidelines from the Royal College of Anaesthetists and Royal College of Ophthalmologists."
    ]
  },

  // 6. MORBID OBESITY & BARIATRIC SURGERY
  {
    id: "case-morbid-obesity-bariatric",
    cat: "case_trauma_ortho_special",
    name: "Morbid Obesity & Bariatric Surgery",
    short: "Morbid Obesity & Bariatric",
    tags: ["Obesity", "Bariatric", "STOP-Bang", "OS-MRS", "Ramped Position", "Drug Dosing", "PEEP", "Case Discussion"],
    tagline: "OS-MRS & STOP-Bang scoring, ramped HELP position, IBW vs TBW dosing, rapid desaturation & CPAP recruitment",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 25; Miller's Anesthesia, 10th ed., Ch. 72; ASMBS Guidelines.",
    sections: [
      {
        h: "1. Definition, BMI Classification & Perioperative Scorings",
        b: "• WHO Body Mass Index (BMI = Weight in kg / Height in m²) Classification:\n  - Class I (Moderate): BMI 30.0–34.9 kg/m².\n  - Class II (Severe): BMI 35.0–39.9 kg/m².\n  - Class III (Morbid): BMI 40.0–49.9 kg/m².\n  - Super Obesity: BMI 50.0–59.9 kg/m².\n  - Super-Super Obesity: BMI ≥ 60.0 kg/m².\n• Obesity Surgery Mortality Risk Score (OS-MRS Scored 0–5):\n  - Predicts 90-day mortality based on 5 risk factors (1 point each):\n    1. BMI ≥ 50 kg/m².\n    2. Male gender.\n    3. Age ≥ 45 years.\n    4. Hypertension.\n    5. Risk factors for Pulmonary Embolism (prior DVT/PE, PHTN, hypoventilation).\n  - Class A (0–1 pt): Low risk (0.2% mortality).\n  - Class B (2–3 pts): Intermediate risk (1.2% mortality).\n  - Class C (4–5 pts): High risk (2.4%–3.0% mortality).\n• STOP-Bang Score for Obstructive Sleep Apnea (OSA):\n  - Snoring, Tiredness, Observed apnea, high Blood Pressure, BMI > 35, Age > 50, Neck circumference > 40 cm (16 inches), Gender male (Score ≥ 5 indicates high OSA risk)."
      },
      {
        h: "2. Pathophysiology: Respiratory Mechanics & Rapid Desaturation",
        b: "• Respiratory Pathophysiology:\n  - Restrictive lung mechanics: Heavy chest wall and visceral adiposity push diaphragm cephalad, reducing chest wall and lung compliance.\n  - Dramatic FRC Reduction: Functional Residual Capacity (FRC) decreases exponentially with BMI. In supine position, FRC drops BELOW Closing Capacity, causing massive basilar atelectasis and right-to-left intrapulmonary shunt.\n  - High Metabolic Demand: Resting oxygen consumption (VO₂) and CO₂ production are elevated by 50%–100% due to metabolically active adipose tissue.\n  - RAPID DESATURATION ON APNEA: The lethal combination of markedly reduced FRC (oxygen reservoir) and double VO₂ causes oxygen desaturation from 100% to < 70% in less than 90–120 seconds during induction!"
      },
      {
        h: "3. Preoperative Evaluation & Ramped Positioning Protocol",
        b: "• Bedside Airway Examination:\n  - Neck circumference > 43 cm (17 inches) is the single strongest clinical predictor of difficult laryngoscopy in obesity.\n• RAMPED / HEAD-ELEVATED LARYNGOSCOPY POSITION (HELP):\n  - Supine position is strictly contraindicated for induction in morbid obesity!\n  - Align the patient's external auditory meatus (tragus) horizontally with the sternal notch by placing ramps/pillows under head, shoulders, and upper back.\n  - Advantages: Aligns the oral, pharyngeal, and laryngeal axes; allows breast tissue and redundant chest wall fat to fall away from the laryngoscope handle; maximizes FRC and prolongs safe apnea time."
      },
      {
        h: "4. Pharmacological Dosing Principles: IBW vs TBW vs LBW",
        b: "• Dosing Weight Definitions:\n  - Ideal Body Weight (IBW): Calculated from Broca's or Devine formula: Male = 50 kg + 2.3 kg for each inch over 5 ft; Female = 45.5 kg + 2.3 kg per inch over 5 ft.\n  - Total Body Weight (TBW): Actual scale weight.\n  - Lean Body Weight (LBW): Typically 120%–130% of IBW.\n• Drug Dosing Rules:\n  - DOSE ON IDEAL BODY WEIGHT (IBW):\n    • Vecuronium, Cisatracurium, Atracurium (avoids prolonged paralysis).\n    • Rocuronium maintenance.\n    • Opioids (Fentanyl, Morphine, Remifentanil) to prevent severe respiratory depression.\n  - DOSE ON TOTAL BODY WEIGHT (TBW):\n    • Succinylcholine (1.0–1.5 mg/kg TBW: pseudocholinesterase activity increases in obesity).\n    • Neostigmine and Sugammadex (2–4 mg/kg TBW ensures full reversal of rocuronium).\n  - DOSE ON LEAN BODY WEIGHT (LBW):\n    • Propofol induction dose (avoids severe hypotension).\n    • Rocuronium intubation dose (if rapid paralysis needed, 1.0 mg/kg LBW)."
      },
      {
        h: "5. Specific Intraoperative Concerns & Lung-Protective Ventilation",
        b: "• Ventilatory Strategy during Laparoscopic Bariatric Surgery:\n  - Tidal Volume: 6 to 8 mL/kg of IDEAL Body Weight (NEVER dose tidal volume on actual weight — causes severe volutrauma and ARDS!).\n  - Positive End-Expiratory Pressure (PEEP): 8 to 12 cmH₂O mandatory to counteract elevated intra-abdominal and chest wall pressures.\n  - Alveolar Recruitment Maneuvers: Periodic sustained inflations (30–40 cmH₂O for 20–30 seconds) immediately restore collapsed alveoli and improve oxygenation.\n• Thromboembolism Prophylaxis: Sequential compression devices (SCDs) + subcutaneous low molecular weight heparin (Enoxaparin 40 mg q12h)."
      },
      {
        h: "6. Postoperative Concerns, CPAP Strategy & Exam Pearls",
        b: "• Extubation Protocol:\n  - Patient must be FULLY AWAKE, breathing spontaneously with complete neuromuscular recovery (TOF ratio > 0.9).\n  - Extubate in REVERSE TRENDELENBURG (Head-Up 30°–45°) position (never flat!).\n• Postoperative Positive Airway Pressure (CPAP / BiPAP):\n  - Resume patient's home CPAP immediately in the PACU to prevent airway collapse, atelectasis, and hypercapnic respiratory failure.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is Desflurane preferred for maintenance in morbid obesity?\n    A: Desflurane has the lowest blood-gas partition coefficient (0.42) and lowest fat-gas partition coefficient of all potent volatiles, producing minimal accumulation in adipose tissue and remarkably rapid, predictable emergence."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 25, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 72, Elsevier, 2025/2026.",
      "American Society for Metabolic and Bariatric Surgery (ASMBS) Clinical Practice Guidelines."
    ]
  },

  // 7. COLLES' FRACTURE & UPPER EXTREMITY REGIONAL ANAESTHESIA
  {
    id: "case-colles-fracture-regional",
    cat: "case_trauma_ortho_special",
    name: "Colles' Fracture & Upper Extremity Regional Anaesthesia",
    short: "Colles' Fracture & Regional",
    tags: ["Orthopedic", "Colles Fracture", "Bier Block", "IVRA", "Supraclavicular Block", "LAST", "Intralipid", "Case Discussion"],
    tagline: "Bier's block double-cuff protocol, 20-minute tourniquet deflation rule, supraclavicular block & ASRA LAST rescue",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 31; Miller's Anesthesia, 10th ed., Ch. 52; ASRA LAST Checklist 2020.",
    sections: [
      {
        h: "1. Definition, Fracture Patterns & Anesthetic Options",
        b: "• Definition: Extra-articular fracture of the distal radius within 2.5 cm of the wrist joint, with dorsal displacement and dorsal angulation (dinner fork deformity).\n• Anesthetic Modalities for Closed Reduction / Percutaneous Pinning / ORIF:\n  1. Hematoma Block (ER reduction): 10 mL of 1% Lignocaine injected directly into fracture hematoma under aseptic technique.\n  2. Intravenous Regional Anesthesia (IVRA / Bier's Block): Ideal for short manipulations (< 60 min).\n  3. Ultrasound-Guided Supraclavicular Brachial Plexus Block: Gold standard for open reduction internal fixation (ORIF) and prolonged surgery."
      },
      {
        h: "2. Intravenous Regional Anesthesia (Bier's Block) Protocol",
        b: "• Equipment & Setup:\n  - Double-pneumatic tourniquet with independent calibrated pressure gauges.\n  - 22G or 20G IV cannula placed in distal vein of fractured extremity; second IV cannula in contralateral arm for systemic access.\n• Step-by-Step Execution:\n  1. EXSANGUINATION: Elevate arm for 2–3 minutes and wrap snugly with an Esmarch rubber bandage from fingertips to the lower edge of the double cuff (if fracture is too painful, elevate arm for 5 minutes without tight wrapping).\n  2. PROXIMAL CUFF INFLATION: Inflate proximal cuff to 100 mmHg ABOVE baseline systolic BP (or minimum 250 mmHg). Verify complete loss of radial pulse.\n  3. REMOVE ESMARCH BANDAGE & INJECT LOCAL ANESTHETIC:\n     - Inject 0.5% PRESERVATIVE-FREE LIGNOCAINE at 3 mg/kg (typically 30–40 mL in adults) slowly over 2–3 minutes.\n     - Analgesia and muscle relaxation develop within 5 to 10 minutes.\n  4. MANAGING TOURNIQUET PAIN (at 25–30 minutes):\n     - Inflate distal cuff over the anesthetized area, then DEFLATE proximal cuff.\n  5. THE 20-MINUTE TOURNIQUET SAFETY RULE:\n     - NEVER deflate the tourniquet earlier than 20 minutes from injection, even if surgery finishes in 5 minutes! Premature release floods systemic circulation with a lethal bolus of free local anesthetic, triggering LAST!\n  6. CYCLIC DEFLATION (at end of surgery > 20 min):\n     - Deflate cuff for 10 seconds, reinflate for 1 minute, repeat twice, then fully release."
      },
      {
        h: "3. Ultrasound-Guided Supraclavicular Brachial Plexus Block",
        b: "• Anatomy (\"The Spinal Cord of the Arm\"):\n  - Brachial plexus trunks/divisions lie compact posterosuperior to the pulsating subclavian artery above the first rib.\n• Ultrasound Sonoanatomy & Technique:\n  - High-frequency linear probe placed in the supraclavicular fossa transverse to the clavicle.\n  - Identify: Subclavian artery on the hyperechoic first rib, pleural line, and brachial plexus (\"cluster of grapes\" appearance).\n  - In-plane needle approach from lateral to medial.\n  - Target \"Corner Pocket\": Deposit 5–8 mL of LA at the junction of the first rib and subclavian artery to block the inferior trunk (C8–T1) for ulnar sparing.\n  - Total LA Volume: 20 to 25 mL of 0.375% Ropivacaine or 0.25% Bupivacaine.\n  - Complications: Pneumothorax (1%), phrenic nerve block / hemidiaphragmatic paresis (50%), Horner's syndrome, recurrent laryngeal nerve block."
      },
      {
        h: "4. Local Anesthetic Systemic Toxicity (LAST) ASRA 2020 Protocol",
        b: "• Clinical Manifestations:\n  - CNS Signs (Initial): Metallic taste, perioral numbness, tinnitus, visual disturbances, tremors, followed by tonic-clonic seizures and coma.\n  - Cardiovascular Signs: Hypertension and tachycardia, followed rapidly by refractory bradycardia, wide QRS, ventricular tachycardia/fibrillation, and asystole.\n• Step-by-Step LAST Emergency Management Checklist:\n  1. STOP LOCAL ANESTHETIC INJECTION IMMEDIATELY! Call for help and LAST rescue cart.\n  2. AIRWAY & OXYGENATION: 100% FiO₂; hyperventilate to prevent acidosis and hypercapnia (acidosis dramatically increases free drug and lowers seizure threshold!).\n  3. SEIZURE CONTROL: IV Midazolam 1–2 mg (avoid Propofol if cardiovascular depression is present).\n  4. 20% LIPID EMULSION (INTRALIPID) PROTOCOL:\n     - Bolus: 1.5 mL/kg IV over 2 to 3 minutes.\n     - Continuous Infusion: 0.25 mL/kg/min.\n     - If cardiovascular collapse persists: Repeat bolus once or twice (q5min) and double infusion rate to 0.5 mL/kg/min (Max cumulative dose: 12 mL/kg).\n  5. ACLS MODIFICATIONS FOR LAST:\n     - AVOID Vasopressin, Calcium channel blockers, and Beta-blockers.\n     - REDUCE EPINEPHRINE DOSES: Give small boluses of ≤ 1 mcg/kg (10–50 mcg); standard 1 mg doses impair lipid resuscitation and worsen arrhythmias!\n     - AVOID Lignocaine and Procainamide (class I antiarrhythmics)."
      },
      {
        h: "5. Specific Intraoperative Concerns & Hematoma Block Hazards",
        b: "• Hematoma Block Precautions:\n  - Strict aseptic prep to prevent converting a closed fracture into osteomyelitis.\n  - Aspirate dark fracture hematoma blood before injection.\n  - Avoid exceeding maximum safe dose of Lignocaine (3–4 mg/kg plain)."
      },
      {
        h: "6. Postoperative Concerns, Compartment Syndrome & Exam Pearls",
        b: "• Masking Compartment Syndrome Warning:\n  - Long-acting dense regional blocks can potentially mask the pain of forearm compartment syndrome. Document baseline neurovascular status; counsel nursing staff to monitor for tense swelling, pain on passive finger extension, and paresthesias.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: Why is Bupivacaine strictly contraindicated for Bier's block?\n    A: Bupivacaine has high cardiotoxicity and dissociates slowly from cardiac sodium channels (\"fast in, slow out\"). Tourniquet leak or release triggers lethal, refractory ventricular arrhythmias."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 31, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 52, Elsevier, 2025/2026.",
      "American Society of Regional Anesthesia and Pain Medicine (ASRA) Checklist for Management of LAST (2020 update)."
    ]
  },

  // 8. KYPHOSCOLIOSIS FOR CORRECTIVE SPINE SURGERY
  {
    id: "case-kyphoscoliosis-spine-surgery",
    cat: "case_trauma_ortho_special",
    name: "Kyphoscoliosis for Corrective Spine Surgery",
    short: "Kyphoscoliosis Spine Surgery",
    tags: ["Spine", "Kyphoscoliosis", "Cobb Angle", "SSEP", "MEP", "Stagnara Wake-Up", "Prone Position", "Case Discussion"],
    tagline: "Cobb's angle > 60°, restrictive lung defect, SSEP/MEP neuro-monitoring TIVA, prone positioning & Stagnara wake-up test",
    source: "Objective Anaesthesia Review, 6th ed., Ch. 30; Miller's Anesthesia, 10th ed., Ch. 70; SRS Guidelines.",
    sections: [
      {
        h: "1. Definition, Cobb's Angle & Pulmonary Compromise",
        b: "• Definition: Complex three-dimensional spinal deformity combining lateral curvature (scoliosis) and excessive thoracic sagittal curvature (kyphosis).\n• Cobb's Angle Measurement:\n  - Angle formed between perpendicular lines drawn from the superior endplate of the uppermost tilted vertebra and the inferior endplate of the lowermost tilted vertebra on standing AP spine radiograph.\n  - Classification & Severity:\n    • Mild: Cobb angle 10°–20°.\n    • Moderate: 20°–40°.\n    • Severe: 40°–60°.\n    • Critical: > 60° (causes severe restrictive pulmonary impairment; indication for surgical posterior spinal instrumented fusion).\n    • > 100°: Severe alveolar hypoventilation, chronic hypoxia, pulmonary arterial hypertension, cor pulmonale, and premature cardiorespiratory failure."
      },
      {
        h: "2. Pathophysiology: Restrictive Defect & Cor Pulmonale",
        b: "• Respiratory Mechanics:\n  - Severe chest wall distortion and rib crowding severely reduce chest wall compliance (by up to 75%).\n  - Restrictive Lung Defect: Proportional reduction in Total Lung Capacity (TLC), Vital Capacity (VC), and FRC. FEV1/FVC ratio remains normal.\n  - Microvascular Compression: Chronic alveolar hypoxia triggers pulmonary arteriolar remodeling, high PVR, and right ventricular hypertrophy (Cor Pulmonale).\n• Cardiac Compression: Direct mechanical distortion of the mediastinum impairs cardiac venous return and limits stroke volume."
      },
      {
        h: "3. Preoperative Evaluation, Bedside PFTs & Transfusion Planning",
        b: "• Bedside Pulmonary Function Tests & Risk Stratification:\n  - Vital Capacity (VC) < 40%–50% of predicted: High risk of prolonged postoperative mechanical ventilation.\n  - Arterial Blood Gas (ABG): PaCO₂ > 45 mmHg indicates chronic alveolar hypoventilation and exhaustion of respiratory reserve.\n  - Sabrasez Breath-Holding Test: Normal > 25 seconds; < 15 seconds warns of severely compromised cardiorespiratory reserve.\n• Echocardiography: Assess PASP, RV dilatation, and tricuspid regurgitation.\n• Massive Blood Loss Planning: Multiple osteotomies and extensive decortication of up to 10–12 spinal levels cause massive bleeding (often 1–2 blood volumes). Prepare Cell Saver, TXA infusion, and cross-matched blood."
      },
      {
        h: "4. Intraoperative Neuromonitoring (IONM) & Anesthetic Requirements",
        b: "• Multimodal Neuro-Monitoring Modalities:\n  1. Somatosensory Evoked Potentials (SSEP):\n     - Evaluates posterior columns of spinal cord (dorsal sensory pathway; blood supply from paired posterior spinal arteries).\n     - Warning Threshold: 50% decrease in amplitude OR 10% increase in latency.\n  2. Motor Evoked Potentials (MEP / Transcranial Electrical MEP):\n     - Evaluates anterior spinal cord and corticospinal tracts (anterior motor pathway; blood supply from single anterior spinal artery).\n     - Crucial because spinal traction/ischemia damages motor tracts before sensory tracts!\n• Anesthetic Regimen for IONM (Total Intravenous Anesthesia — TIVA):\n  - PROPOFOL (80–150 mcg/kg/min) + REMIFENTANIL (0.1–0.3 mcg/kg/min) or FENTANYL.\n  - VOLATILE ANESTHETICS: Inhibit synaptic transmission in the cerebral cortex and anterior horn cells. Keep volatile concentration < 0.5 MAC or eliminate entirely.\n  - NEUROMUSCULAR BLOCKADE: STRICTLY AVOID muscle relaxants after intubation (complete absence of muscle relaxation is required to record compound muscle action potentials from peripheral muscles during MEP!)."
      },
      {
        h: "5. Specific Intraoperative Concerns: Prone Positioning & Stagnara Wake-Up Test",
        b: "• Prone Positioning Protocol (Jackson Spine Table):\n  - Abdomen MUST Hang Completely Free: Any abdominal compression pushes the diaphragm cephalad, raises peak airway pressures, and compresses the IVC, forcing massive blood shunting through the epidural Batson's venous plexus (causing torrential surgical bleeding!).\n  - Eyes & Face Free of Pressure: Prone headrest/pins; check eyes every 15 minutes to prevent Ischemic Optic Neuropathy (ION) or central retinal artery occlusion.\n• STAGNARA WAKE-UP TEST (When IONM signals are lost or unavailable):\n  - Preoperative counseling is mandatory so the patient understands the procedure.\n  - Discontinue propofol and remifentanil while maintaining analgesia and reassurance.\n  - Once patient is conscious, ask them to \"WIGGLE YOUR TOES\" and \"MOVE YOUR ANKLES\".\n  - Once purposeful bilateral lower-limb movement is verified, immediately re-deepen anesthesia."
      },
      {
        h: "6. Postoperative Concerns, Extubation Criteria & Exam Pearls",
        b: "• Postoperative Mechanical Ventilation Triggers:\n  - Prolonged surgery (> 6–8 hours), blood loss > 30%–50% blood volume, preoperative VC < 40%, severe facial edema in prone position.\n• High-Yield Exam Viva Pearls (Tata 6th ed.):\n  - Q: What causes Postoperative Visual Loss (POVL) after prone spinal surgery?\n    A: Ischemic Optic Neuropathy (ION) secondary to prolonged hypotension, anemia, massive fluid resuscitation, high venous pressure from abdominal compression, and direct orbital pressure.\n  - Q: Why is Tranexamic Acid (TXA) routinely used in major scoliosis surgery?\n    A: TXA loading dose (10–30 mg/kg) followed by 1–5 mg/kg/hr infusion reduces perioperative blood loss and transfusion requirements by 30%–50% without increasing thrombotic complications."
      }
    ],
    references: [
      "Objective Anaesthesia Review, 6th ed., Ch. 30, Jaypee Brothers, 2024.",
      "Miller's Anesthesia, 10th ed., Ch. 70, Elsevier, 2025/2026.",
      "Scoliosis Research Society (SRS) and North American Spine Society (NASS) Practice Guidelines."
    ]
  }
];
