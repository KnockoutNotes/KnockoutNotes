module.exports = [
  {
    id: "peds-physiology-developmental",
    cat: "anaesthesia",
    name: "Paediatric & Neonatal Applied Physiology",
    short: "Paediatric Physiology",
    tags: ["Paediatric", "Physiology", "Neonatal", "Airway", "Pharmacology"],
    tagline: "Airway anatomy, respiratory mechanics, transitional circulation, and altered pharmacology in infants",
    source: "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia); Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; Cote CJ, Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Airway Anatomy & Technical Implications",
        b: "Anatomical differences between the neonate/infant and adult create distinct challenges for mask ventilation and intubation:\n\n• Large Occiput: Causes passive neck flexion when supine, occluding the upper airway. Placement of a shoulder roll (folded towel beneath shoulders) aligns the oral, pharyngeal, and laryngeal axes into the neutral \"sniffing\" position.\n• Obligate Nasal Breathing: Neonates preferentially breathe through the nose up to 3–6 months due to high apposition of the soft palate and epiglottis. Nasal secretions, choanal atresia, or small-bore feeding tubes significantly increase airway resistance.\n• Cephalad Larynx: The vocal cords lie at the level of C3–C4 in a full-term neonate (C3 in preterm) compared to C4–C5 in an older child and C5–C6 in an adult. The tongue is relatively large and fills the oral cavity, predisposing to airway obstruction upon loss of consciousness.\n• Epiglottis: Narrow, long, rigid, omega (Ω)-shaped, and angled 45 degrees posteriorly toward the glottis. A straight Miller blade (size 0 or 1) placed in the paraglossal space directly lifting the epiglottis provides superior glottic visualization compared to a curved Macintosh blade.\n• Cricoid Cartilage & Glottic Geometry: Historic teaching held that the cricoid was the narrowest circular point. High-resolution MRI and videobronchoscopy demonstrate that the glottic aperture (rima glottidis) and subglottic cricoid ring are elliptical. Modern pediatric practice routinely utilizes Microcuff cuffed endotracheal tubes with low-pressure cuffs (keeping cuff pressure ≤ 20 cmH₂O) down to term infants without increasing subglottic stenosis."
      },
      {
        h: "2. Respiratory Mechanics, Gas Exchange & Rapid Desaturation",
        b: "Neonates and infants have extraordinarily high metabolic demands and fragile respiratory reserves:\n\n• Oxygen Consumption (VO₂): 6 to 8 mL/kg/min in neonates (double the adult rate of 3 mL/kg/min). Coupled with a small Functional Residual Capacity (FRC ~25–30 mL/kg), the oxygen store-to-consumption ratio is severely depleted, causing catastrophic desaturation within seconds of apnoea.\n• Chest Wall & Lung Compliance: The infant thoracic cage is highly compliant and cartilaginous (horizontal ribs without mechanical bucket-handle advantage), while the lung parenchyma has low compliance due to immature collagen and elastin. During deep breathing or airway obstruction, strong diaphragmatic contractions pull the soft chest wall inward (sternal and intercostal retractions), reducing effective tidal volume.\n• Closing Capacity vs FRC: Closing capacity exceeds FRC in infants under 1 year of age during normal tidal breathing, causing constant basilar airway collapse, atelectasis, and intrapulmonary shunt. Application of 4–5 cmH₂O PEEP is mandatory on mechanical ventilation.\n• Diaphragmatic Muscle Composition: Type I slow-twitch fatigue-resistant muscle fibers constitute only 10%–20% of the preterm diaphragm and 25%–30% of the term infant diaphragm (compared to 50%–60% in adults), making infants highly vulnerable to diaphragmatic fatigue and hypercapnic respiratory failure."
      },
      {
        h: "3. Transitional Cardiovascular Physiology & Autonomic Regulation",
        b: "• Non-Compliant Left Ventricle: The neonatal myocardium has fewer, disorganized myofibrils and non-contractile mass with an underdeveloped sarcoplasmic reticulum, relying heavily on extracellular calcium influx. The left ventricle is relatively stiff and non-compliant, operating near the peak of its Frank-Starling curve.\n• Rate-Dependent Cardiac Output: Because stroke volume cannot significantly increase in response to fluid loading or inotropes, Cardiac Output = Heart Rate × Stroke Volume is strictly rate-dependent. Bradycardia (HR < 100 in neonate, < 80 in infant) plummets cardiac output and represents an immediate emergency.\n• Autonomic Imbalance: The parasympathetic nervous system is fully developed at birth, whereas sympathetic innervation of the heart and peripheral vasculature is immature. Vagal stimulation (laryngoscopy, suctioning, hypoxia, peritoneal traction) triggers profound, precipitous bradycardia. Premedication with Atropine (0.02 mg/kg IV, minimum 0.1 mg) or Glycopyrrolate (0.01 mg/kg IV) is recommended during difficult infant intubation or with succinylcholine.\n• Transitional Circulation & Persistent Pulmonary Hypertension (PPHN): Hypoxia, acidosis, hypothermia, or hypercapnia trigger severe pulmonary vasoconstriction, reopening the ductus arteriosus and foramen ovale with right-to-left shunting and refractory cyanosis."
      },
      {
        h: "4. Pediatric Pharmacokinetics & Drug Handling",
        b: "• Body Fluid Compartments: Total body water comprises 80% of body weight in preterm neonates and 70%–75% in term infants (vs 55%–60% in adults). Extracellular fluid volume is 40% of body weight (vs 20% in adults). Hydrophilic drugs (e.g. succinylcholine, non-depolarising NMBAs, aminoglycosides) distribute into a much larger volume of distribution (Vd), necessitating larger initial weight-based loading doses (e.g. Succinylcholine 2–3 mg/kg IV in infants vs 1 mg/kg in adults; Rocuronium 0.6–0.9 mg/kg).\n• Reduced Plasma Protein Binding: Serum albumin and alpha-1-acid glycoprotein concentrations are low in the first 6–12 months. Local anaesthetics (bupivacaine, ropivacaine) and highly protein-bound hypnotics have a larger free unbound active fraction, markedly increasing the risk of systemic toxicity (LAST).\n• Hepatic & Renal Clearance: Cytochrome P450 enzyme systems, phase II glucuronidation, and glomerular filtration rate (GFR ~30% of adult values at birth) are immature, reaching adult maturation between 6 and 12 months. Drug elimination half-lives are prolonged, requiring lengthened redosing intervals for repeat doses."
      },
      {
        h: "5. Thermoregulation & Hypothermia Consequences",
        b: "• High Surface Area-to-Volume Ratio: Neonates lose heat 3 to 4 times faster than adults via radiation (60%), convection (15%), evaporation (20%), and conduction (5%).\n• Non-Shivering Thermogenesis: Neonates cannot shiver to generate heat. Instead, cold stress stimulates norepinephrine release, activating non-shivering thermogenesis via metabolism of brown adipose tissue (located in the interscapular region, axillae, mediastinum, and around kidneys). This process consumes massive amounts of oxygen and glucose.\n• Sequelae of Intraoperative Hypothermia: Pulmonary vasoconstriction and right-to-left shunting, metabolic acidosis, delayed drug metabolism (prolonged neuromuscular blockade and delayed emergence), impaired platelet function and coagulopathy, and increased postoperative wound infection.\n• Thermal Protection Protocol: Maintain OR ambient temperature 24–26°C for neonates; use underbody forced-air warming blankets, fluid warmers, humidified breathing circuits, clear plastic wrap (cling wrap) around non-surgical extremities, and cotton hats covering the scalp."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers Medical Publishers.",
      "Cote CJ, Lerman J, Anderson BJ. A Practice of Anesthesia for Infants and Children, 6th ed. Elsevier, 2019.",
      "Holzman RS, et al. A Practical Approach to Pediatric Anesthesia, 3rd ed. Wolters Kluwer, 2022."
    ]
  },
  {
    id: "peds-pyloric-stenosis",
    cat: "anaesthesia",
    name: "Infantile Hypertrophic Pyloric Stenosis (IHPS)",
    short: "Pyloric Stenosis",
    tags: ["Paediatric", "Pyloric Stenosis", "Metabolic Alkalosis", "Electrolytes", "Stomach Decompression"],
    tagline: "Medical not surgical emergency — hypochloremic hypokalemic metabolic alkalosis resuscitation, stomach decompression & Ramstedt pyloromyotomy",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; UpToDate \"Infantile hypertrophic pyloric stenosis\" (2025/2026).",
    sections: [
      {
        h: "1. Clinical Presentation & Biochemical Pathophysiology",
        b: "• Epidemiology: Affects infants typically between 3 and 6 weeks of life, with a 4:1 male-to-female predominance (classically first-born males). Hypertrophy of the circular and longitudinal muscular layers of the pylorus produces severe gastric outlet obstruction.\n• Triad of Symptoms: Non-bilious projectile vomiting immediately after feeds, persistent hunger, dehydration, weight loss, and a palpable olive-shaped mass in the right upper quadrant (\"pyloric olive\").\n• Classic Electrolyte Derangement: Loss of gastric hydrochloric acid (HCl) and potassium (KCl) in vomitus produces Hypochloremic Hypokalemic Metabolic Alkalosis:\n  1. Gastric Loss: Loss of H⁺ and Cl⁻ causes initial metabolic alkalosis with hypochloremia.\n  2. Renal Compensation: Kidneys initially excrete sodium and bicarbonate to mitigate alkalosis. With progressing dehydration and aldosterone activation, the kidney reabsorbs Na⁺ in exchange for K⁺ and H⁺.\n  3. Paradoxical Aciduria: As systemic hypokalemia worsens, renal distal tubules are forced to exchange H⁺ for Na⁺ to preserve intravascular volume, leading to excretion of acidic urine in the presence of severe systemic alkalosis."
      },
      {
        h: "2. Preoperative Resuscitation & Strict Surgical Readiness Criteria",
        b: "IHPS IS A MEDICAL RESUSCITATION EMERGENCY, NEVER A SURGICAL EMERGENCY. Surgery must NEVER proceed until dehydration, electrolyte disturbances, and acid-base status are fully corrected:\n\n• Resuscitation Fluid Regimen:\n  - Initial Bolus: 10–20 mL/kg of balanced crystalloid or 0.9% Normal Saline if infant is in clinical hypovolemic shock.\n  - Deficit & Maintenance: 5% Dextrose in 0.45% Saline + 20 mEq/L KCl (added only AFTER urine output is documented) at 1.5 times maintenance rate.\n• Mandatory Biochemical Readiness Criteria Before Induction:\n  - Serum Chloride > 100 mEq/L (most critical predictor of outcome and post-op apnoea prevention)\n  - Serum Potassium > 3.5 mEq/L\n  - Serum Bicarbonate (HCO₃⁻) < 28–30 mEq/L\n  - Blood pH < 7.45\n  - Urine Output > 1 to 2 mL/kg/h with specific gravity < 1.010."
      },
      {
        h: "3. Gastric Decompression & Induction Strategy",
        b: "Even after prolonged fasting, the infant with IHPS has a FULL STOMACH filled with thick curdled milk and secretions, posing an extreme risk of pulmonary aspiration upon induction:\n\n• Four-Position Stomach Suction Protocol:\n  - Insert a wide-bore 10 or 12 Fr orogastric/nasogastric tube immediately prior to induction.\n  - Aspirate the stomach thoroughly with a syringe in 4 positions: Supine, Left Lateral, Right Lateral, and Prone. Gently palpate the epigastrium while aspirating.\n  - Leave the tube open to air or apply gentle continuous suction during induction.\n• Induction Technique Options:\n  - Option A: Modified Rapid Sequence Induction (RSI) with Cricoid Pressure: Preoxygenate with 100% O₂ for 3 minutes; administer Atropine 0.02 mg/kg (blunts bradycardia), Propofol 2.5–3.0 mg/kg, and Rocuronium 0.9–1.2 mg/kg (or Succinylcholine 2 mg/kg). Cricoid pressure applied; intubate with a styleted cuffed or uncuffed ETT without positive pressure mask ventilation.\n  - Option B: Awake Endotracheal Intubation: Used in neonates with severe airway difficulty or extreme aspiration concern; require expert technique with swaddling and gentle suction."
      },
      {
        h: "4. Intraoperative Maintenance & Pyloromyotomy Technique",
        b: "• Surgical Procedure: Open or laparoscopic Ramstedt extramucosal pyloromyotomy. The hypertrophic pyloric muscle is longitudinally incised down to the submucosa until the mucosa bulges out, relieving obstruction.\n• Muscle Relaxation: Minimal relaxation required once incision is made. Avoid long-acting relaxants. If rocuronium was used, sugammadex (2–4 mg/kg) ensures prompt, complete neuromuscular reversal.\n• Mucosal Perforation Test: Surgeon injects 10–20 mL of air through the orogastric tube while immersing the duodenum in saline. If bubbles appear, mucosal perforation is present and repaired primarily."
      },
      {
        h: "5. Postoperative Analgesia & Apnoea Monitoring",
        b: "• Multimodal Opioid-Sparing Analgesia: Infiltration of surgical ports/incision with 0.2% Ropivacaine or 0.25% Bupivacaine (max 2 mg/kg). IV Paracetamol 15 mg/kg. Opioids should be strictly avoided due to profound respiratory depression risk.\n• Postoperative Apnoea Risk: Prolonged CSF alkalosis blunts the central hypercapnic respiratory drive. Infants with uncorrected preop alkalosis or given intraoperative opioids have high rates of postoperative central apnoea. Monitor in High-Dependency Unit with continuous pulse oximetry and apnoea alarms for at least 12–24 hours.\n• Feeding: Small volume oral electrolyte/glucose feeds initiated at 4–6 hours postoperatively, gradually escalating to breast milk/formula."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "MacDonald A, et al. Perioperative management of infantile hypertrophic pyloric stenosis. BJA Education 2018;18(12):370-375."
    ]
  },
  {
    id: "peds-congenital-diaphragmatic-hernia",
    cat: "anaesthesia",
    name: "Congenital Diaphragmatic Hernia (CDH)",
    short: "Congenital Diaphragmatic Hernia",
    tags: ["Paediatric", "CDH", "PPHN", "Pulmonary Hypoplasia", "Neonatal Emergency"],
    tagline: "Bochdalek posterolateral defect, severe pulmonary hypoplasia, PPHN gentle ventilation & delayed surgical repair",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; CDH EURO Consortium Consensus Guidelines (2020 update).",
    sections: [
      {
        h: "1. Embryology, Anatomy & The Pathophysiological Triad",
        b: "• Anatomy: Defect in the closure of the pleuroperitoneal canal during embryonic development (8th–10th gestational week). Bochdalek posterolateral hernia accounts for 85%–90% of cases (predominantly left-sided, 85%); Morgagni retrosternal hernia accounts for 2%–5%.\n• Classic Clinical Triad at Delivery: Severe respiratory distress within hours of birth, cyanosis refractory to oxygen, and a scaphoid abdomen with barrel-shaped chest (bowel loops occupy the hemithorax).\n• The Pathophysiological Triad:\n  1. Pulmonary Hypoplasia: Bilateral reduction in bronchial branching, alveolar surface area, and total lung volume (most severe ipsilaterally, but present contralaterally due to mediastinal shift).\n  2. Pulmonary Vascular Remodeling & Hyperreactivity: Hypertrophied smooth muscle extending into peripheral pre-capillary intra-acinar arteries. Extremely responsive to vasoconstrictive stimuli (hypoxia, acidosis, hypothermia, agitation).\n  3. Persistent Pulmonary Hypertension of the Newborn (PPHN): Suprasystemic pulmonary artery pressures produce massive right-to-left shunting across the ductus arteriosus and foramen ovale, refractory hypoxemia, and right ventricular failure."
      },
      {
        h: "2. Immediate Delivery Room Resuscitation Rules",
        b: "The survival of a neonate with CDH is heavily dictated by avoiding iatrogenic barotrauma and bowel distension in the first 10 minutes of life:\n\n• ABSOLUTE RULE: DO NOT PERFORM BAG-VALVE-MASK VENTILATION! Mask ventilation forces air into the stomach and herniated intestinal loops, rapidly expanding bowel volume in the chest, compressing the lung, and shifting the mediastinum, precipitating cardiovascular collapse.\n• Immediate Gentle Endotracheal Intubation: Intubate immediately with an appropriate cuffed or uncuffed ETT without trial of face mask ventilation.\n• Large-Bore Decompression: Place a 10 Fr double-lumen Replogle or suction catheter to continuous low-pressure suction to continuously decompress the stomach.\n• Dual-Site Pulse Oximetry: Place pre-ductal probe on the right hand/wrist and post-ductal probe on the left hand or either foot. A pre-to-post-ductal saturation difference > 10% confirms active right-to-left ductal shunting from severe PPHN."
      },
      {
        h: "3. Gentle Lung-Protective Ventilation Strategy",
        b: "Historic aggressive hyperventilation to \"blow off CO₂ and dilate pulmonary vessels\" caused fatal barotrauma/volutrauma to the hypoplastic contralateral lung. Modern consensus enforces a strict Gentle Ventilation Strategy:\n\n• Conventional Mechanical Ventilation Parameters:\n  - Mode: Pressure-controlled or volume-targeted ventilation.\n  - Peak Inspiratory Pressure (PIP): Keep strictly < 20–25 cmH₂O (prevent pneumothorax of the single functional lung).\n  - PEEP: 3 to 5 cmH₂O.\n  - Tidal Volume: 3.5 to 5.0 mL/kg.\n  - Respiratory Rate: 40 to 60 breaths/min.\n• Target Physiological Goals (Permissive Hypercapnia):\n  - Pre-ductal SpO₂: 85%–95% (avoid hyperoxia-induced oxidative lung injury).\n  - PaCO₂: 45 to 60 mmHg (permissive hypercapnia) with arterial pH > 7.25.\n  - Mean Airway Pressure: Kept as low as compatible with oxygenation.\n• High-Frequency Oscillatory Ventilation (HFOV): Switched early if PIP > 25 cmH₂O is required to maintain oxygenation or if severe respiratory acidosis (pH < 7.20) persists."
      },
      {
        h: "4. Hemodynamic Management & PPHN Therapy",
        b: "• Target Mean Arterial Pressure (MAP): Maintain MAP at age-appropriate normal values (≥ 40–45 mmHg in term neonates) to minimize right-to-left ductal shunting.\n• Targeted Inotropic Support: Milrinone (0.33–0.5 mcg/kg/min) is the drug of choice for CDH with PPHN — provides pulmonary vasodilation and improves left ventricular diastolic compliance. Epinephrine or Dopamine added if systemic hypotension occurs.\n• Inhaled Nitric Oxide (iNO): Initiated at 10–20 ppm if pre-ductal SpO₂ < 85% persists despite optimal lung recruitment and echo confirms elevated PVR with preserved LV function.\n• Extracorporeal Membrane Oxygenation (ECMO): Veno-arterial (VA) ECMO used as a rescue modality in tertiary centers for reversible respiratory/cardiovascular failure (birth weight > 2.0 kg, gestational age > 34 weeks, absence of major lethal chromosomal abnormalities)."
      },
      {
        h: "5. Timing of Surgery & Intraoperative Anesthetic Plan",
        b: "• Delayed Surgery Protocol: CDH repair is NEVER an emergency. Surgery is delayed for 24 to 72 hours (sometimes up to a week) until physiological stabilization is achieved:\n  - Normal pulmonary artery pressures (sub-systemic on echo)\n  - Pre-ductal SpO₂ ≥ 90% on FiO₂ ≤ 0.50\n  - Urine output > 1 mL/kg/h and normal serum lactate\n  - Inotropic weaning progressing.\n• Intraoperative Anesthetic Technique:\n  - Maintain established ICU ventilator parameters — DO NOT hand-ventilate aggressively!\n  - Balanced High-Opioid / Muscle Relaxant Anaesthesia: Fentanyl 5–10 mcg/kg, Vecuronium/Pancuronium/Rocuronium. Avoid nitrous oxide (contraindicated; diffuses into bowel loops).\n  - Visceral Reduction: As the surgeon reduces bowel loops into the small abdominal cavity, peak airway pressures surge and venous return plummets (Abdominal Compartment Syndrome). If airway pressures exceed 25 cmH₂O, the surgeon must perform staged silo closure rather than primary fascia closure.\n  - Postoperative Care: Return to NICU intubated, muscle relaxed, and sedated; gradual weaning over several days."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Snoek KG, et al. Standardized Postnatal Management of Infants with Congenital Diaphragmatic Hernia in Europe: The CDH EURO Consortium Consensus - 2015 Update. Neonatology 2016;110(1):66-74.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "UpToDate: \"Congenital diaphragmatic hernia in the neonate\" (Wolters Kluwer, 2025/2026)."
    ]
  },
  {
    id: "peds-tracheoesophageal-fistula",
    cat: "anaesthesia",
    name: "Tracheoesophageal Fistula & Esophageal Atresia (TEF / EA)",
    short: "Tracheoesophageal Fistula",
    tags: ["Paediatric", "TEF", "Esophageal Atresia", "VACTERL", "Airway Isolation"],
    tagline: "Gross Type C anatomy, VACTERL association, avoiding gastric distension & positioning ETT bevel past fistula",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; UpToDate \"Tracheoesophageal fistula and esophageal atresia\" (2025/2026).",
    sections: [
      {
        h: "1. Anatomical Classification & Clinical Recognition",
        b: "• Gross Classification of TEF / Esophageal Atresia:\n  - Type C (Vogt IIIb) — 85% to 87% (Most Common): Proximal blind-ending esophageal pouch with a distal tracheoesophageal fistula entering the posterior trachea within 1–2 cm above the carina.\n  - Type A (Vogt II) — 7% to 8%: Isolated Esophageal Atresia without fistula (gasless scaphoid abdomen on X-ray).\n  - Type E (H-type) — 3% to 4%: Tracheoesophageal fistula without atresia; presents later in infancy with coughing, choking during feeds, and recurrent pneumonias.\n  - Type B: Proximal fistula with distal atresia (<1%).\n  - Type D: Fistula from both proximal and distal pouches (<1%).\n• Clinical Presentation: Polyhydramnios in prenatal history; excessive frothy oral and nasal secretions, coughing, choking, and cyanosis with the very first feed. Inability to pass a stiff 10 Fr radiopaque catheter into the stomach (stops at 10–12 cm from lips). Chest radiograph demonstrates coiled catheter in the upper pouch; presence of air in the GI tract confirms a distal fistula."
      },
      {
        h: "2. Associated Anomalies (The VACTERL Association)",
        b: "Over 50% of infants with TEF/EA have associated congenital malformations, summarized by the VACTERL mnemonic:\n\n• V: Vertebral anomalies (hemivertebrae, scoliosis, sacral agenesis) — 60%\n• A: Anal atresia (imperforate anus) — 15%\n• C: Cardiac anomalies (VSD, ASD, Tetralogy of Fallot, Coarctation, PDA, Right-Sided Aortic Arch) — 35% (Preoperative echocardiography is mandatory! A right-sided aortic arch alters surgical thoracotomy from the standard right side to a left thoracotomy!)\n• TE: Tracheoesophageal fistula with esophageal atresia — 100%\n• R: Renal and urinary anomalies (renal agenesis, horseshoe kidney, hydronephrosis) — 20%\n• L: Limb anomalies (radial ray dysplasia, absent radius, polydactyly) — 10%.\n• Waterston Risk Stratification: Weight > 2.5 kg without severe pneumonia or cardiac anomaly carries >95% survival; birth weight < 1.8 kg or severe cyanotic heart disease drops survival to <60%."
      },
      {
        h: "3. Preoperative Optimization & Gastric Suctioning",
        b: "• Upper Pouch Suction: Continuous low-pressure suction (Replogle tube 8–10 Fr) placed in the upper esophageal pouch to prevent spillover aspiration into the trachea.\n• Positioning: Upright 45-degree head-up position minimizes passive gastroesophageal reflux through the distal fistula into the tracheobronchial tree.\n• Aspiration Pneumonia Treatment: Antibiotics (ampicillin + gentamicin), oxygen supplementation, and pulmonary physiotherapy before surgical correction if severe chemical pneumonitis has developed.\n• Avoid Bag-Mask Ventilation: Face mask ventilation forces gas preferentially down the low-resistance fistula into the stomach, causing gastric distension, diaphragmatic splinting, and potential gastric perforation!"
      },
      {
        h: "4. Intraoperative Airway & ETT Positioning Strategy",
        b: "THE DEFINITIVE ANAESTHETIC CHALLENGE IS AIRWAY MANAGEMENT PRIOR TO FISTULA LIGATION:\n\n• Spontaneous vs Gentle Controlled Ventilation:\n  - Inhalational or gentle intravenous induction maintaining spontaneous ventilation until the endotracheal tube is correctly positioned.\n  - If neuromuscular blockade is administered prematurely before the ETT seals the fistula, positive pressure ventilation inflates the stomach, causing cardiovascular collapse.\n• Endotracheal Tube Positioning Techniques:\n  1. Fiberoptic Bronchoscopic Guidance (Gold Standard): Pass an ultrathin 2.2 mm bronchoscope through the ETT, visualize the fistula orifice on the posterior tracheal wall, and advance the ETT under direct vision until the tip lies distal to the fistula but proximal to the carina.\n  2. Intentional Right Endobronchial Intubation & Pull-Back Technique: Advance the ETT deliberately into the right main bronchus (confirmed by unilateral right breath sounds and absent left sounds), then slowly withdraw the tube until bilateral breath sounds are restored. This places the tip just above the carina, effectively bypassing the distal fistula.\n  3. Bevel Rotation: Rotate the ETT 180 degrees so the bevel faces posteriorly, physically occluding the fistula orifice against the posterior tracheal wall.\n• Gastrostomy Caveat: If the infant has an existing gastrostomy tube, venting the tube underwater prevents gastric distension; if ventilation is lost down the fistula, the gastrostomy can be transiently clamped or fogarty catheter occlusion deployed."
      },
      {
        h: "5. Surgical Procedure & Postoperative Pitfalls",
        b: "• Procedure: Right extrapleural thoracotomy or thoracoscopic repair. The azygos vein is divided, the tracheoesophageal fistula is identified, dissected, and doubly ligated/transected, followed by primary end-to-end esophageal anastomosis.\n• Post-Ligation Ventilation: Once the fistula is ligated, conventional positive pressure ventilation can proceed without hazard.\n• Extubation Decision: Extubate awake in the OR only if the infant is vigorous, normothermic, has minimal lung disease, and no tracheomalacia. If tracheal collapse (tracheomalacia, common in TEF due to deficiency of tracheal cartilage) is present, maintain postoperative elective ventilation.\n• Strict Neck Positioning: DO NOT hyperextend the neck after esophageal anastomosis (disrupts surgical suture lines). Tape a suction catheter marked with maximum safe length to prevent accidental deep suctioning through the repair."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "Dingemann J, et al. ERNICA Consensus Conference on the Management of Patients with Esophageal Atresia and Tracheoesophageal Fistula. Eur J Pediatr Surg 2020;30(6):465-476."
    ]
  },
  {
    id: "peds-cleft-lip-palate",
    cat: "anaesthesia",
    name: "Cleft Lip and Cleft Palate Surgery",
    short: "Cleft Lip & Palate",
    tags: ["Paediatric", "Cleft Lip", "Cleft Palate", "Airway", "Dingman Gag", "RAE Tube"],
    tagline: "Rule of 10s, syndromic craniofacial airway, oral south RAE tube, Dingman gag hazards & emergence tongue suture",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; Cote CJ, Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Embryology, Surgical Timing & The Rule of 10s",
        b: "• Embryology: Failure of fusion of the maxillary and frontonasal prominences (cleft lip, 6th gestational week) or secondary palate shelves (cleft palate, 8th–12th week). May occur in isolation or as part of complex syndromes (Pierre Robin sequence, Treacher Collins, Goldenhar syndrome, 22q11 deletion / DiGeorge syndrome).\n• The Classic \"Rule of 10s\" (Wilhelmmesen & Musgrave) for Cleft Lip Repair:\n  1. Age ≥ 10 weeks of age (allows physiological recovery from neonatal transitional circulation)\n  2. Weight ≥ 10 pounds (4.5 kg)\n  3. Hemoglobin ≥ 10 g/dL\n  4. White blood cell count < 10,000 /mm³ without active URI.\n• Timing of Cleft Palate Repair: Typically performed between 9 and 18 months of age — timed before significant phonation and speech development begins, balancing facial maxillary growth against velopharyngeal competence."
      },
      {
        h: "2. Preoperative Airway Assessment & Syndromic Features",
        b: "• Airway Examination: Evaluate for associated micrognathia, retrognathia, glossoptosis, and high-arched cleft palate. In Pierre Robin sequence (micrognathia, glossoptosis, cleft palate), the tongue falls posteriorly, causing severe upper airway obstruction and anticipated difficult direct laryngoscopy.\n• Associated Anomalies: Screen for congenital heart defects (ECHO), cervical spine abnormalities (Goldenhar), and immunodeficiency (DiGeorge syndrome).\n• Recent Upper Respiratory Tract Infection (URI): Common in cleft children due to abnormal Eustachian tube dysfunction and chronic otitis media. If active wheezing, purulent nasal discharge, or fever is present, postpone surgery for 2 to 4 weeks to avoid perioperative bronchospasm and laryngospasm."
      },
      {
        h: "3. Airway Management, Oral RAE Tube & Dingman Gag Hazards",
        b: "• Preformed South-Facing Oral RAE Endotracheal Tube:\n  - The tube of choice for cleft surgeries. The preformed pre-molded curve rests over the chin, directing the circuit inferiorly and clearing the surgical field for the surgeon.\n  - Secure Taping: Must be taped strictly in the midline over the mandible. If taped to the corner of the mouth, it distorts the lip anatomy and misguides surgical symmetry.\n• The Dingman Mouth Gag — Life-Threatening Hazards:\n  - Used during cleft palate repair to depress the tongue and open the oral cavity.\n  1. Accidental Extubation: Insertion of the gag can dislodge the tube out of the trachea.\n  2. Endobronchial Intubation: Flexion of the neck or downward pressure from the tongue blade can push the ETT tip deep into the right main bronchus.\n  3. Kinking / Obstruction: The blade can compress the lumen of the RAE tube against the lower teeth.\n  4. Tongue Ischemia: Excessive prolonged pressure can produce massive postoperative tongue edema and necrosis. Recheck bilateral breath sounds immediately after the Dingman gag is opened and locked!"
      },
      {
        h: "4. Intraoperative Analgesia & Adrenaline Infiltration Precautions",
        b: "• Surgical Infiltration: The surgeon infiltrates the lip and palate with Local Anaesthetic containing Epinephrine (typically 1:200,000 or 1:100,000) for surgical hemostasis and postoperative analgesia.\n• Epinephrine Safety Threshold: Maximum safe dose is 10 mcg/kg (0.1 mL/kg of 1:100,000 or 0.2 mL/kg of 1:200,000). Monitor ECG continuously for tachycardia, premature ventricular contractions (PVCs), and ventricular arrhythmias. If halothane or high-dose volatile agents are used, myocardial sensitization to catecholamines is marked; maintain deep anaesthesia or switch to sevoflurane/TIVA.\n• Multimodal Analgesia: IV Paracetamol 15 mg/kg, IV Dexamethasone 0.25–0.5 mg/kg (reduces airway and tongue swelling), and bilateral Infraorbital Nerve Blocks (for cleft lip) or Greater Palatine and Nasopalatine blocks (for cleft palate)."
      },
      {
        h: "5. Emergence, Tongue Traction Suture & Post-Extubation Airway",
        b: "• Emergence Strategy:\n  - Suction the oropharynx thoroughly under direct vision before gag removal to clear blood clots and secretions.\n  - Extubate only when the infant is fully awake, responding vigorously, and has intact protective laryngeal reflexes.\n• The Tongue Traction Suture (Lifesaving Technique):\n  - Before extubation, the surgeon places a heavy 2-0 or 3-0 silk traction suture through the anterior third of the tongue.\n  - If the infant develops glossoptosis and upper airway obstruction after extubation in recovery, gentle traction on the suture pulls the tongue forward, instantly opening the pharyngeal airway without needing oropharyngeal airways that would disrupt surgical suture lines.\n• Post-Palatoplasty Airway Obstruction: Closing a wide cleft palate converts a chronically wide pharyngeal airway into a narrow, swollen passage. Observe in HDU; place infant in lateral or prone position."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "Cote CJ, et al. A Practice of Anesthesia for Infants and Children, 6th ed. Elsevier, 2019."
    ]
  },
  {
    id: "peds-adenotonsillectomy",
    cat: "anaesthesia",
    name: "Adenotonsillectomy & Paediatric OSA",
    short: "Adenotonsillectomy",
    tags: ["Paediatric", "Tonsillectomy", "OSA", "Bleeding Tonsil", "Airway Fire"],
    tagline: "Severe obstructive sleep apnea, dexamethasone antiemesis, opioid sensitivity & emergency post-tonsillectomy bleeding resuscitation",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; AAO-HNS Clinical Practice Guideline: Tonsillectomy in Children (2019/2024 update).",
    sections: [
      {
        h: "1. Indications, Severity Grading & Paediatric OSA Risk Factors",
        b: "• Core Surgical Indications:\n  1. Obstructive Sleep Apnea Syndrome (OSAS) secondary to adenotonsillar hypertrophy\n  2. Recurrent acute tonsillitis (Paradise criteria: ≥7 episodes in 1 year, ≥5 per year for 2 years, or ≥3 per year for 3 years).\n• Polysomnography (Sleep Study) Severity:\n  - Mild OSA: Apnea-Hypopnea Index (AHI) 1 to 5 events/hr\n  - Moderate OSA: AHI 5 to 10 events/hr\n  - Severe OSA: AHI > 10 events/hr or oxygen saturation nadir < 80%.\n• High-Risk Criteria for Postoperative Respiratory Complications:\n  - Age < 3 years old\n  - Severe OSA (AHI > 10 or nadir SpO₂ < 80%)\n  - Craniofacial anomalies (e.g. Down syndrome, achondroplasia)\n  - Failure to thrive, morbid obesity, or neuromuscular disorders\n  - Cor pulmonale or pulmonary hypertension (p-pulmonale on ECG, RV hypertrophy).\n  *These high-risk children require mandatory overnight inpatient admission with continuous pulse oximetry monitoring.*"
      },
      {
        h: "2. Preoperative Assessment & Premedication Rules",
        b: "• Airway Examination: Enlarge tonsils graded 1+ to 4+ (4+ = \"kissing tonsils\" meeting in the midline, predisposing to immediate obstruction upon induction of anaesthesia).\n• Premedication Protocol:\n  - In children with documented severe OSA, SEDATIVE PREMEDICATION (Midazolam) MUST BE STRICTLY AVOIDED OR REDUCED TO MINIMAL DOSES. Benzodiazepines abolish upper airway tone, causing catastrophic airway obstruction in the holding area.\n  - Parental presence during inhalational induction or non-pharmacological distraction is preferred."
      },
      {
        h: "3. Intraoperative Airway, Mouth Gag & Dexamethasone",
        b: "• Induction & Endotracheal Intubation:\n  - Inhalational induction with sevoflurane in 100% O₂; achieve adequate anaesthetic depth before attempting IV cannulation.\n  - Oral south-facing RAE tube or reinforced armoured tube. The tube must be positioned strictly in the midline groove of the Boyle-Davis mouth gag.\n  - Boyle-Davis Gag Checks: Once suspended by the Draffin bipod, recheck chest auscultation, inspect ETT depth (gag suspension can pull the tube up into the larynx or push it into the bronchus), and verify that the endotracheal tube is not kinked against the mandibular blade.\n• Dexamethasone (Mandatory Single-Dose Administration):\n  - Dose: 0.5 mg/kg IV (maximum 8–10 mg) administered early in surgery.\n  - Proven Benefits: Significantly reduces postoperative nausea and vomiting (PONV), dramatically reduces pharyngeal and uvular edema, shortens time to oral intake, and reduces post-discharge analgesic requirements."
      },
      {
        h: "4. Multimodal Analgesia & The Codeine Black Box Warning",
        b: "• Multimodal Opioid-Sparing Regimen:\n  - IV Paracetamol 15 mg/kg administered at induction.\n  - IV NSAIDs: Ibuprofen 10 mg/kg or Ketorolac 0.5 mg/kg (high-quality Cochrane reviews show NSAIDs do NOT increase postoperative tonsillectomy bleeding rates when used perioperatively).\n  - Local Anaesthetic Infiltration: Peritonsillar infiltration with 0.25% bupivacaine with 1:200,000 adrenaline provides immediate emergence analgesia and surgical hemostasis.\n• FDA BLACK BOX WARNING ON CODEINE & TRAMADOL:\n  - Codeine and Tramadol are ABSOLUTELY CONTRAINDICATED in children under 12 years (and under 18 following tonsillectomy/adenoidectomy).\n  - Mechanism: Both are prodrugs converted to morphine/active metabolites via hepatic CYP2D6. Children who are CYP2D6 \"ultra-rapid metabolizers\" generate lethal serum morphine concentrations even from normal doses, causing fatal postoperative respiratory depression."
      },
      {
        h: "5. Bleeding Post-Tonsillectomy: The Resuscitation Emergency Protocol",
        b: "POST-TONSILLECTOMY HEMORRHAGE (PTH) IS ONE OF THE MOST DANGEROUS EMERGENCIES IN PAEDIATRIC ANAESTHESIA:\n\n• Classification:\n  - Primary Hemorrhage (<24 hours post-op, 0.5%–1%): Usually technical/surgical failure of hemostasis.\n  - Secondary Hemorrhage (5 to 10 days post-op, 3%–5%): Occurs when the surgical eschar/fibrin clot sloughs off, often triggered by local infection.\n• The Hidden Blood Loss Danger:\n  - Children swallow large quantities of blood into the stomach without coughing or spitting. The child may present in profound hypovolemic shock (tachycardia, pallor, prolonged capillary refill, delayed hypotension) with a stomach completely full of clotted blood!\n• Resuscitation Before Anaesthesia:\n  1. Establish two large-bore IV lines immediately.\n  2. Resuscitate with 20 mL/kg balanced crystalloid bolus and request emergency cross-matched Packed Red Blood Cells.\n  3. NEVER induce anaesthesia until hypovolemia is corrected!\n• Modified Rapid Sequence Induction (RSI) Protocol:\n  - Prepare TWO working suction units with large-bore Yankauer suction catheters.\n  - Have a styleted endotracheal tube one half-size smaller than age-appropriate norm ready.\n  - 100% preoxygenation for 3–5 minutes with child in slight head-up or lateral position.\n  - Ketamine 1.5–2.0 mg/kg IV (preserves hemodynamics) or Propofol + Rocuronium 1.0–1.2 mg/kg (rapid onset).\n  - Cricoid pressure applied; intubate under direct vision while clearing massive blood clots from the pharynx.\n  - Decompress stomach thoroughly with an orogastric tube before extubation!"
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Mitchell RB, et al. Clinical Practice Guideline: Tonsillectomy in Children. Otolaryngol Head Neck Surg 2019;160(1_suppl):S1-S42.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "FDA Drug Safety Communication: Codeine and tramadol in children (FDA Alert 2017/2023)."
    ]
  },
  {
    id: "peds-congenital-abdominal-wall-defects",
    cat: "anaesthesia",
    name: "Omphalocele and Gastroschisis",
    short: "Omphalocele & Gastroschisis",
    tags: ["Paediatric", "Omphalocele", "Gastroschisis", "Abdominal Wall Defect", "Neonatal Surgery"],
    tagline: "Distinguishing anatomical features, fluid/heat loss, staged silo reduction & intra-abdominal hypertension monitoring",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; Cote CJ, Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Distinguishing Anatomy, Pathophysiology & Associated Syndromes",
        b: "A clear understanding of the fundamental differences between Gastroschisis and Omphalocele dictates perioperative management:\n\n• GASTROSCHISIS:\n  - Defect Location: Small (< 4 cm) full-thickness abdominal wall defect strictly to the RIGHT of a normally inserted umbilical cord.\n  - Sac: ABSENT (no covering membrane). The bowel loops have been bathed in amniotic fluid for months, presenting thickened, edematous, inflamed, and matted with fibrinous peel.\n  - Associated Anomalies: Rare (< 10%), mostly intestinal atresia (25%) due to vascular compromise at the defect.\n  - Fluid & Heat Loss: MASSIVE evaporative fluid loss and hypothermia.\n\n• OMPHALOCELE:\n  - Defect Location: Central midline defect through the umbilical ring (often large, 4 to >10 cm). The umbilical cord inserts directly onto the apex of the hernia sac.\n  - Sac: PRESENT (bowel, liver, and spleen enclosed in a translucent sac composed of peritoneum internally and amnion externally).\n  - Associated Anomalies: VERY HIGH (> 50%–70%): Congenital heart defects (ASD, VSD, Tetralogy of Fallot in 35%), Chromosomal trisomies (Trisomy 13, 18, 21 in 20%), Beckwith-Wiedemann Syndrome (omphalocele, macroglossia, gigantism, severe neonatal hypoglycaemia due to pancreatic islet cell hyperplasia — check blood glucose every 30 minutes!)."
      },
      {
        h: "2. Immediate Preoperative Delivery Room Care & Fluid Resuscitation",
        b: "• Sterile Protection & Evaporative Loss Prevention:\n  - Place the lower half of the neonate and exposed viscera into a sterile transparent plastic \"bowel bag\" (sterile polyethylene silo/bag) up to the axillae.\n  - NEVER place wet gauze directly on exposed bowel (causes severe evaporative cooling and adheres to serosa).\n  - Support the eviscerated bowel upright in the midline; avoid acute lateral torsion of the mesentery, which produces mesenteric vascular thrombosis and intestinal gangrene.\n• Decompression:\n  - Insert an 8 to 10 Fr Replogle or nasogastric tube to continuous suction to prevent gastric and bowel distension.\n• Aggressive Fluid Therapy:\n  - Fluid requirements in gastroschisis can reach 150 to 200 mL/kg/day balanced crystalloid (Plasmalyte or Ringer's lactate) to compensate for massive retroperitoneal and evaporative 3rd space fluid shifts. Monitor urine output, lactate, and perfusion."
      },
      {
        h: "3. Surgical Repair Options: Primary Closure vs Staged Silo Reduction",
        b: "• Primary Fascial Closure:\n  - Preferred if the defect is small and the abdominal cavity can accommodate the viscera without excessive tension.\n• Staged Silo Reduction (Spring-Loaded Silo):\n  - In large gastroschisis or giant omphalocele containing the liver, primary closure is impossible.\n  - A preformed spring-loaded silo is placed at the bedside or in the OR; the surgeon gradually reduces the bowel loops into the abdominal cavity by gravity and gentle manual compression over 3 to 7 days, followed by delayed formal fascial/skin closure."
      },
      {
        h: "4. Intraoperative Anesthetic Strategy & Abdominal Compartment Syndrome",
        b: "THE CARDINAL LIFE-THREATENING INTRAOPERATIVE HAZARD IS ABDOMINAL COMPARTMENT SYNDROME (ACS):\n\n• Anesthetic Technique:\n  - Modified RSI or awake intubation with cuffed ETT.\n  - High-dose opioid / relaxant technique. AVOID NITROUS OXIDE (strictly contraindicated; diffuses into bowel, preventing reduction).\n• Pathophysiology of Sudden Reduction:\n  - Forcing edematous bowel into an underdeveloped peritoneal cavity produces sudden, massive elevations in Intra-Abdominal Pressure (IAP):\n    1. Inferior Vena Cava Compression: Decreases venous return to the heart, causing profound systemic hypotension and cardiac arrest.\n    2. Diaphragmatic Cephalad Splinting: Causes peak airway pressure to surge > 35–40 cmH₂O, severe hypercapnia, and hypoxemia.\n    3. Renal & Mesenteric Hypoperfusion: Renal vein compression triggers immediate anuria; mesenteric ischemia causes bowel necrosis.\n• Objective Intraoperative Monitoring Thresholds:\n  - Intrabladder Pressure (via urinary catheter) or Intragastric Pressure: Must stay strictly < 20 mmHg (27 cmH₂O).\n  - Airway Peak Inspiratory Pressure: If PIP increases by > 10 cmH₂O or exceeds 30 cmH₂O, the surgeon must ABORT primary closure and convert to a silo.\n  - Lower Extremity Perfusion: Continuously monitor pulse oximeter probe placed on the foot; loss of waveform or cyanosis indicates IVC occlusion."
      },
      {
        h: "5. Postoperative Care & Extubation Rules",
        b: "• Elective Postoperative Ventilation:\n  - All neonates undergoing abdominal wall defect repair must remain intubated and mechanically ventilated in the NICU for 24 to 72 hours postoperatively.\n• Total Parenteral Nutrition (TPN):\n  - Prolonged intestinal ileus and dysmotility (lasting 2 to 6 weeks in gastroschisis) necessitates central venous catheterization and early TPN.\n• Analgesia: Continuous fentanyl (1–2 mcg/kg/h) or morphine infusion; avoid regional epidural techniques in the presence of intra-abdominal hypertension."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "Cote CJ, et al. A Practice of Anesthesia for Infants and Children, 6th ed. Elsevier, 2019."
    ]
  },
  {
    id: "peds-inguinal-hernia-hydrocele",
    cat: "anaesthesia",
    name: "Paediatric Inguinal Herniotomy & Incarcerated Hernia",
    short: "Inguinal Herniotomy",
    tags: ["Paediatric", "Hernia", "Preterm Apnea", "Caudal Block", "Awake Spinal", "Incarcerated Hernia"],
    tagline: "Prematurity apnoea risk < 60 weeks PCA, awake spinal vs caudal block, ilioinguinal nerve block & emergency strangulated hernia",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; Cote CJ, Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Embryology, Prematurity & Post-Anaesthetic Apnoea Risk",
        b: "• Embryology: Patent processus vaginalis (congenital persistence of peritoneal diverticulum) leading to indirect inguinal hernia. High incidence in preterm infants (up to 30%).\n• POST-ANAESTHETIC APNOEA IN EX-PREMATURE INFANTS (CRITICAL SAFETY THRESHOLD):\n  - Definition: Unexplained cessation of breathing for > 15–20 seconds, or shorter with bradycardia or desaturation, occurring up to 12 to 24 hours after general anaesthesia.\n  - The High-Risk Cutoff: Post-Conceptual Age (PCA = Gestational age at birth + Post-natal age in weeks) < 60 weeks (some centers use 52–56 weeks).\n  - Predisposing Risk Factors: Anemia (Hematocrit < 30% doubles apnoea risk!), ongoing history of apnoea in the NICU, administration of opioids or muscle relaxants.\n  - Practice Mandate: Any ex-preterm infant < 60 weeks PCA MUST be admitted for overnight cardiorespiratory apnoea and pulse oximetry monitoring for at least 24 hours. Elective surgery is ideally delayed until PCA > 60 weeks."
      },
      {
        h: "2. Anaesthetic Technique Choices: General vs Awake Regional",
        b: "Three established anaesthetic pathways exist for paediatric inguinal herniotomy:\n\n• Option A: General Anaesthesia with LMA + Regional Block:\n  - In older infants (> 60 weeks PCA) and children. LMA placement under sevoflurane maintains spontaneous ventilation with minimal airway instrumentation.\n  - Supplemented with a single-shot Caudal Block or Ilioinguinal/Iliohypogastric nerve block for complete intra- and post-op analgesia.\n• Option B: Awake Spinal Anaesthesia (GAS and PANDA Trials):\n  - Specifically employed in ex-premature infants < 60 weeks PCA to avoid general anaesthetic agents and reduce postoperative apnoea.\n  - Technique: Infant held in seated or lateral position; 25G or 27G pencil-point needle inserted at L4–L5 or L5–S1 (spinal cord ends at L3 in neonates!).\n  - Dose: 0.5% Hyperbaric Bupivacaine 1 mg/kg (0.2 mL/kg) for infants < 5 kg. Provides 60–75 minutes of dense motor and sensory blockade.\n• Option C: Awake Caudal Epidural Anaesthesia:\n  - High-volume caudal block (1.25–1.5 mL/kg of 0.25% bupivacaine or 0.2% ropivacaine) provides T10 surgical anaesthesia without endotracheal intubation."
      },
      {
        h: "3. Peripheral Nerve Blocks for Inguinal Hernia",
        b: "• Ultrasound-Guided / Landmark Ilioinguinal & Iliohypogastric (II/IH) Nerve Block:\n  - Landmark Technique: Needle entry point 1 cm medial and 1 cm superior to the anterior superior iliac spine (ASIS). Direct needle perpendicularly until a distinctive \"fascial pop\" through the external oblique aponeurosis is felt.\n  - Ultrasound Guidance (Gold Standard): Place high-frequency linear probe on a line connecting ASIS to umbilicus. Identify the external oblique, internal oblique, and transversus abdominis muscle layers. Inject local anaesthetic into the fascial plane between internal oblique and transversus abdominis around the II/IH nerves.\n  - Dose: 0.2% Ropivacaine or 0.25% Bupivacaine 0.25–0.3 mL/kg (max 2 mg/kg).\n  - Complications: Femoral nerve palsy (quadriceps weakness / transient knee bucking if LA tracks under fascia iliaca), intestinal puncture (if inserted too deep)."
      },
      {
        h: "4. The Incarcerated / Strangulated Inguinal Hernia Emergency",
        b: "• Presentation: Irreducible, tender, erythematous groin mass, bilious vomiting, abdominal distension, fever, and leukocytosis. High risk of testicle ischemia (compression of testicular vessels) and bowel necrosis.\n• Immediate Management:\n  - Attempt gentle taxis (reduction) under sedation only if within 6–8 hours and NO signs of peritonitis/strangulation.\n  - If taxis fails or signs of ischemia exist, emergency exploratory surgery is indicated immediately.\n• Anesthetic Execution: FULL STOMACH PROTOCOL. Correct dehydration with balanced crystalloid bolus; rapid sequence induction (RSI) with cuffed ETT; avoid nitrous oxide. Postoperative PICU admission."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Davidson AJ, et al. Neurodevelopmental outcome at 2 years of age after general anaesthesia and awake-regional anaesthesia in infancy (GAS): an international multicentre, randomised controlled trial. Lancet 2016;387(10015):239-250.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers."
    ]
  },
  {
    id: "peds-exploratory-laparotomy",
    cat: "anaesthesia",
    name: "Paediatric Exploratory Laparotomy & Neonatal Bowel Emergencies",
    short: "Paediatric Laparotomy",
    tags: ["Paediatric", "Laparotomy", "Volvulus", "NEC", "Septic Shock", "Fluid Resuscitation"],
    tagline: "Malrotation with midgut volvulus, necrotizing enterocolitis, massive fluid shifts, temperature maintenance & inotropic resuscitation",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; Cote CJ, Practice of Anesthesia for Infants and Children, 6th ed.",
    sections: [
      {
        h: "1. Core Surgical Etiologies & The Time-Critical Emergency",
        b: "Acute abdominal emergencies requiring exploratory laparotomy in neonates and young infants:\n\n• Intestinal Malrotation with Midgut Volvulus (True Hyper-Acute Surgical Emergency):\n  - Failure of normal 270-degree counterclockwise embryonic rotation of the midgut around the superior mesenteric artery (SMA). Narrow mesenteric base predisposes to clockwise twisting (volvulus) of the entire midgut, strangulating SMA flow.\n  - Presentation: Bilious vomiting in a previously healthy term neonate (first 30 days of life) followed by rapid abdominal distension, hematochezia, and catastrophic septic/hypovolemic shock. Surgical delay leads to complete bowel gangrene and short bowel syndrome.\n  - Surgical Solution: Ladd Procedure (counterclockwise untwisting, division of Ladd peritoneal bands, widening of mesentery, placing cecum in left lower quadrant and appendectomy).\n• Necrotizing Enterocolitis (NEC):\n  - Affects premature, low birth weight infants (< 1500 g). Ischemia and bacterial colonization of immature gut mucosa.\n  - Bell Staging: Stage I (suspected), Stage II (pneumatosis intestinalis on X-ray), Stage III (advanced with pneumoperitoneum / perforation, septic shock, thrombocytopenia, severe acidosis).\n• Other Etiologies: Intussusception (ileocolic, \"currant jelly\" stool, target sign on US), Meconium Ileus (cystic fibrosis), and Hirshsprung disease with toxic megacolon."
      },
      {
        h: "2. Preoperative Resuscitation & Correction of Derangements",
        b: "NEVER INDUCE ANAESTHESIA IN AN UNRESUSCITATED, MORIBUND INFANT UNLESS ACTIVE INTERNAL EXSANGUINATION IS OCCURRING:\n\n• Resuscitation Vascular Access: Establish at least two wide-bore peripheral IV lines (22G or 24G) in upper extremities (lower extremity lines may suffer compromised venous return during abdominal manipulation or IVC compression).\n• Fluid Replacement: 20 mL/kg balanced crystalloid bolus, repeated to restore capillary refill < 2 seconds, heart rate, and blood pressure. Correct severe metabolic acidosis and hyperkalemia.\n• Gastric Decompression: Wide-bore orogastric tube on continuous suction to decompress massive fluid and gas accumulation.\n• Transfusion Targets: Maintain Hematocrit > 35% in neonates, Platelets > 50,000–100,000/mm³, Fibrinogen > 150 mg/dL with Fresh Frozen Plasma and Cryoprecipitate."
      },
      {
        h: "3. Induction, Airway & The Nitrous Oxide Contraindication",
        b: "• Modified Rapid Sequence Induction (RSI):\n  - Preoxygenate with 100% O₂ for 3–5 minutes.\n  - Premedicate with Atropine (0.02 mg/kg IV) to blunt severe vagal bradycardia from laryngoscopy or peritoneal traction.\n  - Ketamine (1.5–2.0 mg/kg IV) is the induction agent of choice in septic, hemodynamically unstable infants. Etomidate (0.2–0.3 mg/kg) is an alternative.\n  - Rocuronium (0.9–1.2 mg/kg) or Succinylcholine (2 mg/kg) with cricoid pressure.\n• STRICT CONTRAINDICATION: NITROUS OXIDE (N₂O):\n  - Nitrous oxide is 34 times more soluble than nitrogen. It rapidly diffuses into air-filled closed spaces faster than nitrogen can leave, expanding closed intestinal gas volume by 200%–300% within 30 minutes, converting partial bowel obstruction into intestinal perforation and worsening abdominal compartment syndrome!"
      },
      {
        h: "4. Intraoperative Fluid Management & Temperature Control",
        b: "• Third-Space Evaporative Fluid Losses:\n  - Major neonatal laparotomy with exposed bowel produces massive 3rd space fluid shifts of 10 to 15 mL/kg/h of balanced crystalloid on top of maintenance (4-2-1 rule).\n  - Fluid warmer on all IV lines; use 10% Dextrose with electrolytes if infant at risk for hypoglycaemia.\n• Thermal Defense:\n  - Open neonatal laparotomy causes devastating convective and evaporative heat loss. Maintain OR temperature 25–26°C; overhead radiant warmers; plastic bowel drapes; warmed saline irrigation."
      },
      {
        h: "5. Hemodynamic Instability, Reperfusion & Post-Op PICU",
        b: "• The Reperfusion Shock Phenomenon:\n  - When the surgeon untwists a midgut volvulus or relieves strangulated bowel, massive ischemic toxins, lactic acid, potassium, and inflammatory cytokines wash into the systemic circulation, causing abrupt hypotension, severe acidemia, and malignant arrhythmias.\n  - Have Epinephrine infusion (0.05–0.2 mcg/kg/min) and Calcium Gluconate (100 mg/kg) ready.\n• Postoperative Disposition: Transfer to PICU/NICU intubated, sedated, and paralyzed on mechanical ventilation."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "Cote CJ, et al. A Practice of Anesthesia for Infants and Children, 6th ed. Elsevier, 2019."
    ]
  },
  {
    id: "peds-regional-nerve-blocks",
    cat: "anaesthesia",
    name: "Paediatric Regional Anaesthesia & Caudal Block",
    short: "Paediatric Regional",
    tags: ["Paediatric", "Regional", "Caudal Block", "Armitage Formula", "Penile Block", "LAST"],
    tagline: "Sacral hiatus anatomy, Armitage dosing formula, penile and TAP blocks, additives & avoiding LAST in infants",
    source: "Miller's Anesthesia, 10th ed., Ch. 76; Rebecca Jacob, Pediatric Anaesthesia, 2nd ed.; European Society of Regional Anaesthesia & Pain Therapy (ESRA/ASRA) Pediatric Guidelines (2022/2024 update).",
    sections: [
      {
        h: "1. Paediatric Neuraxial Anatomy Pearls",
        b: "Key developmental anatomical differences between infants and adults:\n\n• Termination of Spinal Cord (Conus Medullaris):\n  - In full-term neonates, the spinal cord terminates at L3 (compared to L1–L2 in adults).\n  - Reaches the adult L1 level by 12 months of age.\n• Termination of Dural Sac:\n  - In neonates, the dural sac extends down to S3–S4 (compared to S2 in adults).\n  - Consequently, during caudal epidural injection, the margin of safety between the sacrococcygeal ligament and the dural sac is narrow, increasing the risk of accidental dural puncture.\n• Loose Epidural Adipose Tissue:\n  - Infant epidural space contains gelatinous, loose, poorly lobulated fat, facilitating effortless cephalad spread of local anaesthetic solution."
      },
      {
        h: "2. Caudal Epidural Block: Landmarks & Needle Insertion Technique",
        b: "The single most common regional anaesthetic technique performed in pediatric practice worldwide:\n\n• Indications: Surgical procedures below the umbilicus — inguinal herniotomy, orchidopexy, circumcision, hypospadias repair, clubfoot correction, lower limb orthopedic surgery.\n• Landmark Triangle:\n  - Place child in lateral position with hips and knees flexed.\n  - Palpate the bilateral Posterior Superior Iliac Spines (PSIS). An equilateral triangle constructed with the base connecting both PSIS points has its downward apex resting precisely over the Sacral Hiatus.\n  - Palpate the bilateral Sacral Cornua (bony prominences on either side of the hiatus) and the central depression of the sacrococcygeal membrane.\n• Puncture Technique:\n  - Use a 22G or 24G short-bevel needle or 22G IV cannula.\n  - Insert needle in midline at a 45-to-60 degree angle to the skin until a distinctive \"pop\" or give is felt penetrating the sacrococcygeal ligament.\n  - Depress the needle angle to 20 degrees (almost parallel to sacrum) and advance NO MORE than 1 to 2 mm into the caudal canal (advancing further risks dural puncture!).\n  - Aspiration: Meticulous aspiration for blood or CSF. Resistance during injection must be minimal (the \"whoosh test\" with air or ultrasound confirmation)."
      },
      {
        h: "3. Armitage Dosing Formula & Local Anaesthetic Selection",
        b: "Cephalad spread of local anaesthetic in children is directly proportional to injected volume and body weight:\n\n• The Armitage Volume Formula (using 0.2% Ropivacaine or 0.25% Bupivacaine / Levobupivacaine):\n  - Lumbosacral Block (S1–S5, e.g. Circumcision, Penile surgery): 0.5 mL/kg\n  - Thoracolumbar Block (T10, e.g. Inguinal hernia, Orchidopexy): 1.0 mL/kg\n  - Mid-Thoracic Block (T6–T8, e.g. Lower abdominal, Umbilical surgery): 1.25 mL/kg (Maximum safe volume = 20 mL).\n• Drug of Choice:\n  - Ropivacaine 0.2% is preferred over bupivacaine due to superior motor sparing and substantially lower cardiotoxicity profile.\n• Evidence-Based Caudal Additives:\n  - Clonidine (1 mcg/kg): Extends analgesia duration from 4–6 hours up to 10–12 hours without increasing respiratory depression or urinary retention.\n  - Preservative-Free Morphine (30–50 mcg/kg): Used for major thoracic/abdominal surgery (gives 18–24h analgesia; requires 24h respiratory monitoring for delayed apnoea).\n  - Fentanyl (1 mcg/kg): Modest prolongation, higher incidence of nausea."
      },
      {
        h: "4. Peripheral Blocks: Penile Block & Ultrasound TAP Block",
        b: "• Dorsal Penile Nerve Block (DPNB):\n  - Indications: Circumcision, distal penile surgery.\n  - Subpubic Technique: Insert needle at 10:30 and 1:30 o'clock positions at the base of the penis just beneath the pubic symphysis, traversing Buck's fascia. Inject 0.5% lignocaine or 0.2% ropivacaine without adrenaline (1–2 mL per side).\n  - Ring Block: Subcutaneous infiltration around the base of the shaft.\n  - ABSOLUTE CONTRAINDICATION: EPINEPHRINE IS STRICTLY PROHIBITED in penile blocks (produces end-arterial vasospasm, penile ischemia, and gangrene!).\n• Transversus Abdominis Plane (TAP) Block:\n  - Ultrasound-guided deposition between internal oblique and transversus abdominis muscles (0.3–0.5 mL/kg 0.2% ropivacaine per side) for umbilical/lower abdominal surgery."
      },
      {
        h: "5. Local Anaesthetic Systemic Toxicity (LAST) in Infants",
        b: "• Why Infants are Extremely Vulnerable to LAST:\n  - Low alpha-1-acid glycoprotein concentrations result in higher free, pharmacologically active unbound fraction of bupivacaine/ropivacaine.\n  - Immature hepatic cytochrome P450 clearance prolongs elimination half-life.\n  - Cardiotoxicity can manifest suddenly without prodromal neurological warning signs under general anaesthesia: profound bradycardia, widening QRS, ventricular tachycardia/fibrillation, and asystole.\n• Maximum Weight-Based Local Anaesthetic Doses:\n  - Bupivacaine / Ropivacaine: 2.0 to 2.5 mg/kg (Plain), 3.0 mg/kg (with Epinephrine).\n  - Lignocaine: 4.0 mg/kg (Plain), 7.0 mg/kg (with Epinephrine).\n• Lipid Emulsion Rescue Protocol (Intralipid 20%):\n  - Bolus: 1.5 mL/kg IV over 2–3 minutes.\n  - Infusion: 0.25 mL/kg/min (continue for at least 10 minutes after hemodynamic stability returns)."
      }
    ],
    references: [
      "Miller's Anesthesia, 10th ed., Ch. 76 (Pediatric Anesthesia), Elsevier, 2025/2026.",
      "Jacob R. Pediatric Anaesthesia, 2nd ed. Jaypee Brothers.",
      "Ivani G, et al. Pediatric Regional Anesthesia: Joint ESRA/ASRA Recommendations. Reg Anesth Pain Med 2018;43(2):129-141.",
      "American Society of Regional Anesthesia and Pain Medicine (ASRA) Checklist for Management of LAST (2020 update)."
    ]
  }
];
