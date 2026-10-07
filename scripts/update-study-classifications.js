const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../study-data.js');
let content = fs.readFileSync(filePath, 'utf8');

const CLASSIFICATION_MAP = {
  // Core Anaesthesia
  'preop-assessment': 'Perioperative Medicine • Clinical Risk Assessment & Optimization',
  'asa-pscore': 'Risk Stratification • ASA Physical Status & Emergency Sub-classifications',
  'airway-assessment': 'Airway Management • Bedside Prediction & Difficult Airway Algorithm',
  'anaesthesia-machine': 'Anaesthetic Delivery Systems • Workstation Architecture & Breathing Circuits',
  'anaesthesia-workstation-check': 'Patient Safety & Equipment • Pre-Use Checkout Protocol (ASA/APSF)',
  'rsi': 'Airway & Induction • Rapid Sequence Induction, Cricoid Pressure & Aspiration Prophylaxis',
  'asa-monitoring': 'Intraoperative Monitoring • ASA Standard Monitoring & Vigilance',
  'fluid-transfusion': 'Perioperative Fluid Therapy • Crystalloids, Colloids & Patient Blood Management',
  'malignant-hyperthermia': 'Anaesthetic Emergencies • Ryanodine Receptor Pharmacogenetics & Dantrolene',
  'ponv': 'Postoperative Care • Apfel Score Stratification & Multimodal Antiemetic Prophylaxis',
  'regional-physiology': 'Regional Anaesthesia • Neuraxial Blockade Physiology & Differential Block',
  'anaphylaxis-anaesthesia': 'Anaesthetic Emergencies • Immediate Resuscitation & Mast Cell Tryptase',
  'eras': 'Perioperative Medicine • Enhanced Recovery After Surgery Evidence Bundles',
  'dka-perioperative-glycaemic-protocols': 'Endocrine & Metabolic Management • Perioperative Glycaemic Control & DKA',
  'obstetric-anaesthesia-labour-analgesia-high-risk': 'Adult Subspecialties • Obstetric Anaesthesia, Labour Analgesia & PPH',
  'neuroanaesthesia-cbf-icp-craniotomy': 'Adult Subspecialties • Neuroanaesthesia, ICP Dynamics & Sitting Position',
  'thoracic-anaesthesia-one-lung-ventilation-dlt': 'Adult Subspecialties • Thoracic Anaesthesia, OLV & Lung Isolation',
  'cardiac-anaesthesia-cpb-valvular-heart-disease': 'Adult Subspecialties • Cardiac Anaesthesia, CPB Circuit & Valvular Lesions',
  'pediatric-anaesthesia-neonatal-emergencies': 'Pediatric Anaesthesia • Neonatal Airway, Fasting & Surgical Emergencies',
  'endocrine-anaesthesia-pheochromocytoma-thyroid': 'Adult Subspecialties • Endocrine Resection & Roizen Optimization',
  'renal-transplant-turp-syndrome-esrd': 'Adult Subspecialties • Renal Transplantation & TURP Syndrome Prevention',
  'ophthalmic-ent-laser-airway-fire-protocols': 'Adult Subspecialties • Airway Fire Protocol & Oculocardiac Reflex',
  'trauma-ortho-bcis-geriatric-anaesthesia': 'Adult Subspecialties • BCIS Resuscitation, Fat Embolism & Frailty',

  // Examination
  'exam-airway': 'Clinical Examination • Bedside Airway & Predictors of Difficult Intubation',
  'exam-cvs': 'Clinical Examination • Cardiovascular Examination & Valvular Murmurs',
  'exam-respiratory': 'Clinical Examination • Respiratory System Examination & Bedside PFTs',
  'exam-cns': 'Clinical Examination • Central Nervous System & Cranial Nerves',
  'exam-gi': 'Clinical Examination • Gastrointestinal Examination & Gastric Ultrasound',

  // ECG
  'ecg-basic': 'Electrocardiography • Systematic 12-Lead ECG Analysis',
  'ecg-axis': 'Electrocardiography • Hexaxial Reference & Quadrant Rules',
  'ecg-lvh': 'Electrocardiography • Left Ventricular Hypertrophy (Sokolow-Lyon & Cornell)',
  'ecg-rvh': 'Electrocardiography • Right Ventricular Hypertrophy Criteria',
  'ecg-bbb': 'Electrocardiography • Bundle Branch Blocks & Sgarbossa Criteria',
  'ecg-mi': 'Electrocardiography • Myocardial Infarction & STEMI Equivalents',
  'ecg-blocks': 'Electrocardiography • Atrioventricular Heart Blocks (1st, 2nd & 3rd Degree)',
  'ecg-vt': 'Electrocardiography • Ventricular Tachyarrhythmias & Diagnostic Algorithms',
  'ecg-vf': 'Electrocardiography • ACLS Pulseless Arrest & Defibrillation Protocols',
  'ecg-hyperkalemia': 'Electrocardiography • Hyperkalaemia Progressive ECG Changes',
  'ecg-hypokalemia': 'Electrocardiography • Hypokalaemia Progressive ECG Changes',
  'ecg-pacemaker': 'Electrocardiography • Cardiac Pacing & Pacemaker Rhythms',

  // Equipment
  'breathing-systems-mapleson': 'Breathing Systems • Mapleson Circuits (A–F) & Spontaneous/Controlled Ventilation',
  'circle-system': 'Breathing Systems • Circle System Architecture & Low-Flow Anaesthesia',
  'ventilators-classification': 'Anaesthesia Workstation • Ventilator Classification & Bellows Mechanics',
  'vaporizers-device': 'Equipment & Physics • Vaporizer Physics & Hazard Interlocks',
  'airway-devices-equipment': 'Airway Equipment • Laryngoscopes, Video Laryngoscopy & ETTs',
  'supraglottic-airways-lma': 'Airway Equipment • Supraglottic Airway Devices & LMA Generations',
  'humidification-scavenging': 'Environmental Safety • Scavenging Systems & Humidification',
  'warming-suction-devices': 'Patient Safety • Active Patient Warming & Suction Systems',
  'medical-gas-cylinders': 'Gas Supply Systems • Medical Gas Cylinders & Pin Index Safety',
  'venturi-oxygen-devices': 'Oxygen Delivery • Venturi Principle & Fixed FiO2 Systems',
  'infusion-pumps-tci': 'IV Drug Delivery • Target-Controlled Infusion & Syringe Drivers',
  'soda-lime-absorbents': 'Environmental Safety • CO2 Absorbents & Soda Lime Chemistry',
  'central-venous-pulmonary-artery-catheters': 'Hemodynamic Hardware • Central Venous & PA Catheters (Swan-Ganz)',
  'cardiopulmonary-bypass-cpb': 'Perfusion Systems • Cardiopulmonary Bypass Circuit & Components',
  'thrive-hfno-apneic-oxygenation': 'Oxygenation Systems • High-Flow Nasal Oxygen & THRIVE',
  'jet-ventilation-hfjv-emergency': 'Specialized Ventilation • High-Frequency & Emergency Jet Ventilation',
  'ecmo-extracorporeal-membrane-oxygenation': 'Extracorporeal Life Support • ECMO Cannulation & Circuit Architecture',
  'haemodialysis-crrt-dialysis-circuit': 'Renal Replacement Hardware • Hemodialysis & CRRT Circuit Physiology',
  'nerve-stimulator-neuromuscular-monitoring': 'Neuromuscular Hardware • Quantitative TOF & Peripheral Nerve Stimulators',
  'ambu-bag-bvm': 'Resuscitation Hardware • Bag-Valve-Mask Manual Resuscitators',

  // Pain topics in Anaesthesia
  'acute-pain-multimodal-analgesia-pca': 'Postoperative Care & Pain • Acute Multimodal Analgesia & PCA Protocols',
  'regional-neuraxial-analgesia-catheters': 'Regional Anaesthesia & Pain • Thoracic Epidural & Fascial Plane Blocks',
  'neuropathic-pain-crps-post-surgical': 'Postoperative Care & Pain • Neuropathic Pain Syndromes & CRPS (Budapest)',
  'chronic-post-surgical-pain-neuromodulation': 'Postoperative Care & Pain • Chronic Post-Surgical Pain & Neuromodulation',
  'cancer-pain-opioid-rotation-palliative': 'Postoperative Care & Pain • Cancer Pain & WHO Opioid Rotation',
  'interventional-sympathetic-nerve-blocks': 'Regional Anaesthesia & Pain • Interventional Sympathetic Neurolysis',
  'novel-non-opioid-analgesic-pharmacology': 'Anesthetic Pharmacology • Systemic Lidocaine, Magnesium & Gabapentinoids',
  'opioid-induced-hyperalgesia-tolerance-tapering': 'Opioid Pharmacology • Opioid-Induced Hyperalgesia & Weaning Protocols'
};

let updated = 0;
for (const [id, classification] of Object.entries(CLASSIFICATION_MAP)) {
  // Match the topic object start by id: "preop-assessment"
  // Check if classification already exists
  const idRegex = new RegExp(`({\\s*"id":\\s*"${id}",[\\s\\S]*?"short":\\s*"[^"]*",)`);
  if (!content.includes(`"id": "${id}"`)) {
    console.warn(`ID not found: ${id}`);
    continue;
  }

  // Check if topic already has a classification field
  const topicBlockRegex = new RegExp(`({\\s*"id":\\s*"${id}",[\\s\\S]*?"sections":\\s*\\[)`);
  const match = content.match(topicBlockRegex);
  if (match) {
    const block = match[0];
    if (block.includes('"classification":')) {
      console.log(`Topic ${id} already has classification, replacing...`);
      const replaceRegex = new RegExp(`({\\s*"id":\\s*"${id}",[\\s\\S]*?)"classification":\\s*"[^"]*",`);
      content = content.replace(replaceRegex, `$1"classification": "${classification}",`);
      updated++;
    } else {
      // Inject classification right before "tagline":
      const taglineRegex = new RegExp(`({\\s*"id":\\s*"${id}",[\\s\\S]*?)("tagline":)`);
      if (taglineRegex.test(content)) {
        content = content.replace(taglineRegex, `$1"classification": "${classification}",\n    $2`);
        updated++;
      } else {
        console.warn(`Tagline not found for topic: ${id}`);
      }
    }
  } else {
    console.warn(`Could not match topic block for: ${id}`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully updated ${updated} topics with Miller classifications.`);
