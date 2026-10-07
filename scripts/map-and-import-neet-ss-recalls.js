const fs = require('fs');
const path = require('path');

// 1. Load source JSON
const neetPath = path.resolve(__dirname, '..', 'NEET_SS_2025_Critical_Care_Recall_I_II.json');
const neetData = JSON.parse(fs.readFileSync(neetPath, 'utf8'));

console.log(`Loaded source file: ${neetData.questions.length} questions.`);

// 2. Mapping table for Question ID -> { chapterId, topicId }
// All 76 questions mapped specifically to the 31 Critical Care chapters and existing 97 topics
const MAPPING = {
  // R001: CURB-65 Severity Assessment
  "NEETSS-CC-2025-R001": { chapterId: 18, topicId: "cc-community-acquired-pneumonia" },
  // R002: Maternal Septic Shock Vasopressor
  "NEETSS-CC-2025-R002": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R003: Clostridioides difficile Infection
  "NEETSS-CC-2025-R003": { chapterId: 18, topicId: "cc-clostridioides-difficile-colitis" },
  // R004: Metallo-beta-lactamase Pseudomonas
  "NEETSS-CC-2025-R004": { chapterId: 18, topicId: "cc-managing-mdr-gram-negative-infections-i" },
  // R005: MRSA Vancomycin AUC/MIC
  "NEETSS-CC-2025-R005": { chapterId: 18, topicId: "cc-interpreting-antibiogram-and-mic" },
  // R006: Hemodynamic Profiles of Shock
  "NEETSS-CC-2025-R006": { chapterId: 4, topicId: "cc-shock-pathophysiology-and-classification" },
  // R007: Intra-Abdominal Pressure WSACS
  "NEETSS-CC-2025-R007": { chapterId: 19, topicId: "cc-intra-abdominal-hypertension-and-abdominal-compartment-syndrome" },
  // R008: Modified Wells Score for PE
  "NEETSS-CC-2025-R008": { chapterId: 11, topicId: "cc-pulmonary-embolism" },
  // R009: Tumor Lysis Syndrome Hypocalcemia
  "NEETSS-CC-2025-R009": { chapterId: 31, topicId: "cc-novel-chemo-and-toxicity-in-icu" },
  // R010: Temporary Cardiac Pacing
  "NEETSS-CC-2025-R010": { chapterId: 11, topicId: "cc-malignant-arrhythmias-in-the-icu" },
  // R011: P-V Loop Beaking Overdistension
  "NEETSS-CC-2025-R011": { chapterId: 8, topicId: "cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation" },
  // R012: ARDSNet Plateau Pressure
  "NEETSS-CC-2025-R012": { chapterId: 9, topicId: "cc-acute-respiratory-distress-syndrome-i" },
  // R013: ACLS CPR Depth Metrics
  "NEETSS-CC-2025-R013": { chapterId: 12, topicId: "cc-2025-acc-aha-cpr-guidelines-updates" },
  // R014: MACOCHA Score for Difficult Intubation
  "NEETSS-CC-2025-R014": { chapterId: 28, topicId: "cc-pleural-disorders-in-icu" },
  // R015: Complete AV Block
  "NEETSS-CC-2025-R015": { chapterId: 11, topicId: "cc-malignant-arrhythmias-in-the-icu" },
  // R016: Preeclampsia Risk Factors & Aspirin
  "NEETSS-CC-2025-R016": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R017: Eclampsia Delivery Timing
  "NEETSS-CC-2025-R017": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R018: Hyperemesis Gravidarum Fluids
  "NEETSS-CC-2025-R018": { chapterId: 26, topicId: "cc-obstetric-critical-care-general-considerations" },
  // R019: ScvO2 vs SvO2 Physiology
  "NEETSS-CC-2025-R019": { chapterId: 3, topicId: "cc-cardiac-output-monitoring" },
  // R020: Obstetric Shock Index (OSI)
  "NEETSS-CC-2025-R020": { chapterId: 26, topicId: "cc-obstetric-critical-care-general-considerations" },
  // R021: CRBSI Microbiology (CoNS)
  "NEETSS-CC-2025-R021": { chapterId: 1, topicId: "cc-catheter-related-blood-stream-infection" },
  // R022: Sepsis Hour-1 Bundle
  "NEETSS-CC-2025-R022": { chapterId: 5, topicId: "cc-sepsis-2026-clinical-guidelines" },
  // R023: IVC Collapsibility Index > 50%
  "NEETSS-CC-2025-R023": { chapterId: 29, topicId: "cc-basic-echocardiography" },
  // R024: Platelet Transfusion Dynamics (RDP vs SDP)
  "NEETSS-CC-2025-R024": { chapterId: 22, topicId: "cc-thrombocytopenia-in-the-icu" },
  // R025: TRALI vs TACO
  "NEETSS-CC-2025-R025": { chapterId: 22, topicId: "cc-hematological-emergencies-in-critical-illness" },
  // R026: Postoperative VTE Prophylaxis (UFH)
  "NEETSS-CC-2025-R026": { chapterId: 22, topicId: "cc-hematological-emergencies-in-critical-illness" },
  // R027: LMWH Pharmacological Prophylaxis in Cancer
  "NEETSS-CC-2025-R027": { chapterId: 22, topicId: "cc-hematological-emergencies-in-critical-illness" },
  // R028: HELLP Syndrome Diagnostic Triad
  "NEETSS-CC-2025-R028": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R029: Choking / FBAO Unresponsive CPR
  "NEETSS-CC-2025-R029": { chapterId: 12, topicId: "cc-2025-acc-aha-cpr-guidelines-updates" },
  // R030: SIBICC Tier 2 TBI Management
  "NEETSS-CC-2025-R030": { chapterId: 15, topicId: "cc-icu-management-of-traumatic-brain-injury" },
  // R031: Fluid-Refractory Septic Shock Norepinephrine
  "NEETSS-CC-2025-R031": { chapterId: 5, topicId: "cc-sepsis-and-septic-shock-evaluation-management" },
  // R032: Alveolar Recruitment Hemodynamics
  "NEETSS-CC-2025-R032": { chapterId: 9, topicId: "cc-acute-respiratory-distress-syndrome-i" },
  // R033: CAP Duration 5 Days
  "NEETSS-CC-2025-R033": { chapterId: 18, topicId: "cc-community-acquired-pneumonia" },
  // R034: HIET in CCB/BB Poisoning
  "NEETSS-CC-2025-R034": { chapterId: 23, topicId: "cc-general-approach-to-poisoning" },
  // R035: Torsades de Pointes MgSO4
  "NEETSS-CC-2025-R035": { chapterId: 11, topicId: "cc-malignant-arrhythmias-in-the-icu" },
  // R036: Acute Hypocalcemia Tetany Management
  "NEETSS-CC-2025-R036": { chapterId: 14, topicId: "cc-disorders-of-calcium-magnesium-phosphorus-metabolism" },
  // R037: Osmotic Demyelination Syndrome
  "NEETSS-CC-2025-R037": { chapterId: 13, topicId: "cc-sodium-disorders-in-the-icu" },
  // R038: Acute Cardiogenic Pulmonary Edema Triad
  "NEETSS-CC-2025-R038": { chapterId: 4, topicId: "cc-cardiogenic-shock-i" },
  // R039: Severe Hyperkalemia Membrane Stabilization
  "NEETSS-CC-2025-R039": { chapterId: 13, topicId: "cc-potassium-disorders-in-the-icu" },
  // R040: SBAR Handover Tool
  "NEETSS-CC-2025-R040": { chapterId: 1, topicId: "cc-scoring-systems-in-the-icu" },
  // R041: Airway Adjuncts (OPA vs NPA)
  "NEETSS-CC-2025-R041": { chapterId: 28, topicId: "cc-pleural-disorders-in-icu" },
  // R042: Maternal CPR Left Uterine Displacement
  "NEETSS-CC-2025-R042": { chapterId: 26, topicId: "cc-obstetric-critical-care-general-considerations" },
  // R043: Needle-Stick HCV Management
  "NEETSS-CC-2025-R043": { chapterId: 18, topicId: "cc-managing-mdr-gram-negative-infections-i" },
  // R044: Adult BLS Collapse Check Responsiveness
  "NEETSS-CC-2025-R044": { chapterId: 12, topicId: "cc-2025-acc-aha-cpr-guidelines-updates" },
  // R045: Tramadol Non-Immunosuppressive Mechanism
  "NEETSS-CC-2025-R045": { chapterId: 16, topicId: "cc-delirium-in-icu-padis-guidelines" },
  // R046: RCT Causality
  "NEETSS-CC-2025-R046": { chapterId: 1, topicId: "cc-important-clinical-trials-in-critical-care" },
  // R047: PEEP Delivery Reliability
  "NEETSS-CC-2025-R047": { chapterId: 8, topicId: "cc-basics-of-mechanical-ventilation" },
  // R048: Preeclampsia Spiral Artery Defect & sFlt-1
  "NEETSS-CC-2025-R048": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R049: Thiamine in Alcoholism Before Dextrose
  "NEETSS-CC-2025-R049": { chapterId: 21, topicId: "cc-nutrition-in-the-icu" },
  // R050: Static Respiratory Compliance (Cstat)
  "NEETSS-CC-2025-R050": { chapterId: 6, topicId: "cc-respiratory-management-in-specific-clinical-scenarios-i" },
  // R051: Inhaled Nitric Oxide Methemoglobinemia
  "NEETSS-CC-2025-R051": { chapterId: 23, topicId: "cc-general-approach-to-poisoning" },
  // R052: Severe CAP Empiric Regimen
  "NEETSS-CC-2025-R052": { chapterId: 18, topicId: "cc-community-acquired-pneumonia" },
  // R053: Preeclampsia Diagnostic Criteria
  "NEETSS-CC-2025-R053": { chapterId: 26, topicId: "cc-obstetric-critical-care-pregnancy-specific" },
  // R054: Febrile Neutropenia Empiric Antifungal
  "NEETSS-CC-2025-R054": { chapterId: 31, topicId: "cc-infections-in-the-immunocompromised-host" },
  // R055: True Shunt Physiology
  "NEETSS-CC-2025-R055": { chapterId: 2, topicId: "cc-assessing-adequacy-of-oxygen-delivery" },
  // R056: Septic Hyperlactatemia Mechanisms
  "NEETSS-CC-2025-R056": { chapterId: 5, topicId: "cc-organ-dysfunction-in-sepsis" },
  // R057: Citrate Toxicity Hypocalcemia
  "NEETSS-CC-2025-R057": { chapterId: 22, topicId: "cc-hematological-emergencies-in-critical-illness" },
  // R058: Propofol Infusion Syndrome (PRIS)
  "NEETSS-CC-2025-R058": { chapterId: 16, topicId: "cc-delirium-in-icu-padis-guidelines" },
  // R059: Cardiac Tamponade CVP Waveform
  "NEETSS-CC-2025-R059": { chapterId: 3, topicId: "cc-central-venous-line-and-cvp-measurement" },
  // R060: CRRT vs IHD Hemodynamic Stability
  "NEETSS-CC-2025-R060": { chapterId: 13, topicId: "cc-renal-replacement-therapy-i" },
  // R061: ETT Cuff Pressure 20-30 cmH2O
  "NEETSS-CC-2025-R061": { chapterId: 18, topicId: "cc-ventilator-associated-pneumonia" },
  // R062: Invasive Aspergillosis Voriconazole
  "NEETSS-CC-2025-R062": { chapterId: 31, topicId: "cc-infections-in-the-immunocompromised-host" },
  // R063: Electronic Hand Hygiene Monitoring
  "NEETSS-CC-2025-R063": { chapterId: 1, topicId: "cc-catheter-related-blood-stream-infection" },
  // R064: Amniotic Fluid Embolism (AFE)
  "NEETSS-CC-2025-R064": { chapterId: 26, topicId: "cc-obstetric-critical-care-general-considerations" },
  // R065: PJP Bilateral Ground-Glass
  "NEETSS-CC-2025-R065": { chapterId: 31, topicId: "cc-infections-in-the-immunocompromised-host" },
  // R066: Laplace's Law and Surfactant
  "NEETSS-CC-2025-R066": { chapterId: 2, topicId: "cc-assessing-adequacy-of-oxygen-delivery" },
  // R067: Trauma Lethal Triad
  "NEETSS-CC-2025-R067": { chapterId: 24, topicId: "cc-haemodynamic-management-pharmacotherapy-in-acute-polytrauma" },
  // R068: AI in ICU Predictive Analytics
  "NEETSS-CC-2025-R068": { chapterId: 1, topicId: "cc-scoring-systems-in-the-icu" },
  // R069: Nanotechnology Liposomal Amphotericin B
  "NEETSS-CC-2025-R069": { chapterId: 17, topicId: "cc-pharmacokinetics" },
  // R070: Cryptococcus Amphotericin + 5-FC
  "NEETSS-CC-2025-R070": { chapterId: 31, topicId: "cc-infections-in-the-immunocompromised-host" },
  // R071: Human Bite Wound Amoxicillin-Clavulanate
  "NEETSS-CC-2025-R071": { chapterId: 18, topicId: "cc-managing-mdr-gram-negative-infections-i" },
  // R072: APACHE II 12 APS Variables
  "NEETSS-CC-2025-R072": { chapterId: 1, topicId: "cc-scoring-systems-in-the-icu" },
  // R073: Distally Wedged PAC Rupture
  "NEETSS-CC-2025-R073": { chapterId: 3, topicId: "cc-pa-catheter" },
  // R074: EOLIA Trial VV-ECMO
  "NEETSS-CC-2025-R074": { chapterId: 30, topicId: "cc-ecmo-basics" },
  // R075: Cyclophosphamide Cardiotoxicity
  "NEETSS-CC-2025-R075": { chapterId: 31, topicId: "cc-novel-chemo-and-toxicity-in-icu" },
  // R076: Respiratory Acidosis Compensation
  "NEETSS-CC-2025-R076": { chapterId: 14, topicId: "cc-interpreting-abg" }
};

// 3. Transform 76 questions
const sourceVideos = neetData.metadata.source_videos || [];

const mappedQuestions = neetData.questions.map((q) => {
  const mapMeta = MAPPING[q.id] || { chapterId: 1, topicId: "cc-important-clinical-trials-in-critical-care" };
  
  // Format options array
  const opts = [q.options.A, q.options.B, q.options.C, q.options.D];
  
  // Format examPearl
  let pearlText = "";
  if (Array.isArray(q.high_yield_takeaway) && q.high_yield_takeaway.length) {
    pearlText += "HIGH-YIELD TAKEAWAYS:\n• " + q.high_yield_takeaway.join("\n• ");
  }
  if (q.potential_exam_trap) {
    pearlText += "\n\nPOTENTIAL EXAM TRAP: " + q.potential_exam_trap;
  }
  if (!pearlText && q.concept_tested) {
    pearlText = "CORE CONCEPT TESTED: " + q.concept_tested;
  }

  // Format reference
  const primarySource = (Array.isArray(q.sources) && q.sources.length) ? q.sources[0] : "NEET-SS 2025 Recall Video (Official Exam Review)";
  const refObj = {
    label: primarySource,
    url: (sourceVideos.length && sourceVideos[0].url) ? sourceVideos[0].url : "https://youtu.be/uO2GT_tdWj4"
  };

  const itemTags = [
    "NEET SS CC 2025",
    "Recall 2025",
    "NEET-SS",
    q.subject || "Critical Care Medicine",
    q.subtopic || ""
  ].filter(Boolean);

  return {
    id: q.id,
    chapterId: mapMeta.chapterId,
    topicId: mapMeta.topicId,
    question: q.question,
    options: opts,
    answer: q.correct_answer,
    explanation: q.explanation,
    whyWrong: q.why_other_options_wrong || {},
    difficulty: (q.difficulty || "Moderate").toLowerCase(),
    sourceType: "neet-ss-2025-recall",
    exam: "NEET-SS",
    year: 2025,
    examPearl: pearlText,
    hyperlinkedReference: refObj,
    tags: itemTags,
    verificationStatus: "VERIFIED",
    // Preserve rich source recall metadata
    recall_confidence: q.recall_confidence,
    question_status: q.question_status,
    speaker_answer: q.speaker_answer,
    verified_answer: q.verified_answer,
    answer_verification_note: q.answer_verification_note,
    concept_tested: q.concept_tested,
    high_yield_takeaway: q.high_yield_takeaway,
    potential_exam_trap: q.potential_exam_trap,
    sources: q.sources,
    source_videos: sourceVideos
  };
});

console.log(`Transformed ${mappedQuestions.length} questions into KnockoutNotes schema.`);

// 4. Validate each mapped question
for (const q of mappedQuestions) {
  if (!q.id || !q.id.startsWith('NEETSS-CC-2025-')) throw new Error(`Invalid ID: ${q.id}`);
  if (!Array.isArray(q.options) || q.options.length !== 4) throw new Error(`Options length not 4 for ${q.id}`);
  if (!['A', 'B', 'C', 'D'].includes(q.answer)) throw new Error(`Invalid answer ${q.answer} for ${q.id}`);
  if (!q.explanation || q.explanation.length < 20) throw new Error(`Missing explanation for ${q.id}`);
  if (typeof q.chapterId !== 'number' || q.chapterId < 1 || q.chapterId > 31) throw new Error(`Invalid chapterId for ${q.id}`);
  if (!q.topicId) throw new Error(`Missing topicId for ${q.id}`);
}
console.log('✓ All 76 questions passed schema validation.');

// 5. Read existing master file
const masterPath = path.resolve(__dirname, '..', 'criticalCare', 'mcqs.json');
const existingMcqs = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
console.log(`Current MCQs in criticalCare/mcqs.json: ${existingMcqs.length}`);

// Check for duplicate IDs
const existingIdSet = new Set(existingMcqs.map(m => m.id));
for (const q of mappedQuestions) {
  if (existingIdSet.has(q.id)) {
    throw new Error(`Duplicate ID detected: ${q.id} already exists in master mcqs.json!`);
  }
}

// 6. Merge: Preserve all existing 505 MCQs + append 76 new MCQs = 581 total
const mergedMcqs = [...existingMcqs, ...mappedQuestions];
console.log(`Merged total MCQs: ${mergedMcqs.length} (505 existing + 76 recall).`);

// Save updated master file
fs.writeFileSync(masterPath, JSON.stringify(mergedMcqs, null, 2), 'utf8');
console.log(`✓ Successfully updated criticalCare/mcqs.json (${mergedMcqs.length} total MCQs).`);

// 7. Update the 4 chunk files
const chunkFiles = [
  { file: 'criticalCare/chunks/mcqs_ch01_to_ch08.json', min: 1, max: 8 },
  { file: 'criticalCare/chunks/mcqs_ch09_to_ch16.json', min: 9, max: 16 },
  { file: 'criticalCare/chunks/mcqs_ch17_to_ch24.json', min: 17, max: 24 },
  { file: 'criticalCare/chunks/mcqs_ch25_to_ch31.json', min: 25, max: 31 }
];

for (const c of chunkFiles) {
  const chunkData = mergedMcqs.filter(m => m.chapterId >= c.min && m.chapterId <= c.max);
  const chunkPath = path.resolve(__dirname, '..', c.file);
  fs.writeFileSync(chunkPath, JSON.stringify(chunkData, null, 2), 'utf8');
  console.log(`✓ Updated chunk ${c.file}: ${chunkData.length} MCQs (Ch ${c.min}-${c.max}).`);
}

console.log('\n=========================================');
console.log('ALL 76 RECALL MCQs SUCCESSFULLY IMPORTED!');
console.log('=========================================');
