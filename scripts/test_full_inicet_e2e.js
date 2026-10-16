const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('INI-CET SS 2026 CRITICAL CARE PYQ END-TO-END AUDIT');
console.log('====================================================');

// 1. Check datasets
const masterPath = 'criticalCare/mcqs.json';
const standalonePath = 'INI_CET_SS_2026_Critical_Care_PYQs.json';
const distMasterPath = 'dist-app/criticalCare/mcqs.json';
const distStandalonePath = 'dist-app/INI_CET_SS_2026_Critical_Care_PYQs.json';

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const standalone = JSON.parse(fs.readFileSync(standalonePath, 'utf8'));
const distMaster = JSON.parse(fs.readFileSync(distMasterPath, 'utf8'));
const distStandalone = JSON.parse(fs.readFileSync(distStandalonePath, 'utf8'));

console.log(`[Test 1] Dataset Counts & Integrity`);
assert.strictEqual(standalone.questions.length, 56, 'Standalone must have 56 questions');
assert.strictEqual(distStandalone.questions.length, 56, 'Dist standalone must have 56 questions');
assert.strictEqual(master.length, 817, 'Master must have 817 total questions');
assert.strictEqual(distMaster.length, 817, 'Dist master must have 817 total questions');

const iniQuestions = master.filter(m => m.sourceType === 'ini-cet-ss-2026-recall' || (m.tags && m.tags.includes('INI-CET SS 2026')));
assert.strictEqual(iniQuestions.length, 56, 'Master must contain exactly 56 INI-CET SS 2026 questions');
console.log('  ✓ Datasets verified and synchronized across root and dist-app.');

// 2. Check Chunk Files
console.log(`[Test 2] Chunk Files Synchrony & Fallback Coverage`);
const chunks = [
  'criticalCare/chunks/mcqs_ch01_to_ch08.json',
  'criticalCare/chunks/mcqs_ch09_to_ch16.json',
  'criticalCare/chunks/mcqs_ch17_to_ch24.json',
  'criticalCare/chunks/mcqs_ch25_to_ch31.json'
];

let totalInChunks = 0;
let iniInChunks = 0;
for (const c of chunks) {
  const cData = JSON.parse(fs.readFileSync(c, 'utf8'));
  const distCData = JSON.parse(fs.readFileSync(path.join('dist-app', c), 'utf8'));
  assert.strictEqual(cData.length, distCData.length, `Chunk ${c} must match in dist-app`);
  totalInChunks += cData.length;
  iniInChunks += cData.filter(m => m.sourceType === 'ini-cet-ss-2026-recall' || (m.tags && m.tags.includes('INI-CET SS 2026'))).length;
}
assert.strictEqual(totalInChunks, 817, 'Total MCQs across chunks must equal 817');
assert.strictEqual(iniInChunks, 56, 'All 56 INI-CET SS 2026 questions must be present in chunk files');
console.log(`  ✓ All 817 MCQs and all 56 INI-CET SS 2026 questions present in chunk fallbacks.`);

// 3. Emulate mcq-engine.js state and UI logic
console.log(`[Test 3] UI State & Simulation`);

// Check mcq-engine.js file parity
const rootEngine = fs.readFileSync('mcq-engine.js', 'utf8');
const distEngine = fs.readFileSync('dist-app/mcq-engine.js', 'utf8');
assert.strictEqual(rootEngine, distEngine, 'dist-app/mcq-engine.js must be identical to root mcq-engine.js');

function isPYQ(m) {
  if (!m) return false;
  if (m.sourceType === "neet-ss-2025-recall" || m.sourceType === "neet-ss-2024-recall" || m.sourceType === "ini-ss-nov2025-recall" || m.sourceType === "ini-cet-ss-2026-recall") return true;
  if (m.tags && (m.tags.indexOf("NEET SS CC 2025") !== -1 || m.tags.indexOf("NEET SS CC 2024") !== -1 || m.tags.indexOf("INI SS CC Nov 2025") !== -1 || m.tags.indexOf("INI SS CC April 2026") !== -1 || m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("Recall Nov 2025") !== -1 || m.tags.indexOf("Recall 2026") !== -1 || m.tags.indexOf("Recall 2025") !== -1 || m.tags.indexOf("Recall 2024") !== -1)) return true;
  return false;
}

function getPYQExam(m) {
  if (!m) return "NEET-SS";
  if (m.exam === "INI-CET SS" || m.sourceType === "ini-cet-ss-2026-recall") return "INI-CET-SS-2026";
  if (m.tags && (m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("INI SS CC April 2026") !== -1)) return "INI-CET-SS-2026";
  if (m.exam === "INI-SS" || m.sourceType === "ini-ss-nov2025-recall") return "INI-SS";
  if (m.tags && (m.tags.indexOf("INI-SS") !== -1 || m.tags.indexOf("INI SS CC Nov 2025") !== -1)) return "INI-SS";
  return "NEET-SS";
}

function getPYQYear(m) {
  if (!m) return 2025;
  if (m.year) return Number(m.year);
  if (m.sourceType === "ini-cet-ss-2026-recall" || (m.tags && (m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("Recall 2026") !== -1))) return 2026;
  if (m.sourceType === "neet-ss-2024-recall" || (m.tags && m.tags.indexOf("NEET SS CC 2024") !== -1)) return 2024;
  return 2025;
}

function getPYQTopic(m) {
  var raw = "";
  if (m.tags && m.tags.length > 3 && m.tags[3]) {
    raw = m.tags[3];
  } else if (m.topic) {
    raw = m.topic;
  } else if (m.subject) {
    raw = m.subject;
  }
  var s = String(raw).trim().toLowerCase();
  if (s.indexOf("ventilat") !== -1 || s.indexOf("respirat") !== -1) return "Mechanical Ventilation";
  if (s.indexOf("hemodynam") !== -1 || s.indexOf("cardio") !== -1) return "Hemodynamics";
  if (s.indexOf("sepsis") !== -1 || s.indexOf("septic") !== -1) return "Sepsis";
  if (s.indexOf("neuro") !== -1 || s.indexOf("tbi") !== -1 || s.indexOf("icp") !== -1) return "Neurocritical Care";
  if (s.indexOf("acid") !== -1 || s.indexOf("abg") !== -1) return "Acid-Base Disorders";
  if (s.indexOf("renal") !== -1 || s.indexOf("kidney") !== -1) return "Renal Critical Care";
  if (s.indexOf("cpr") !== -1 || s.indexOf("acls") !== -1 || s.indexOf("resuscit") !== -1) return "ACLS / CPR";
  if (s.indexOf("infect") !== -1 || s.indexOf("antibi") !== -1 || s.indexOf("pneumon") !== -1) return "Infectious Diseases";
  if (s.indexOf("toxico") !== -1 || s.indexOf("poison") !== -1) return "Toxicology";
  if (s.indexOf("trauma") !== -1 || s.indexOf("burn") !== -1) return "Trauma & Burns";
  if (s.indexOf("nutrit") !== -1 || s.indexOf("gastro") !== -1 || s.indexOf("gi") !== -1) return "Nutrition & GI";
  if (s.indexOf("obstetric") !== -1 || s.indexOf("pregnan") !== -1 || s.indexOf("maternal") !== -1) return "Obstetric Critical Care";
  if (s.indexOf("electrolyt") !== -1 || s.indexOf("sodium") !== -1 || s.indexOf("potassium") !== -1 || s.indexOf("calcium") !== -1) return "Electrolytes & Metabolic";
  if (s.indexOf("hematol") !== -1 || s.indexOf("thromb") !== -1 || s.indexOf("platelet") !== -1) return "Hematology & Transfusion";
  if (s.indexOf("procedur") !== -1 || s.indexOf("monitor") !== -1 || s.indexOf("catheter") !== -1) return "ICU Procedures & Monitoring";
  if (s.indexOf("pharm") !== -1 || s.indexOf("drug") !== -1 || s.indexOf("chemo") !== -1) return "Pharmacology & Oncology";
  return raw || "Miscellaneous";
}

function getFilteredPYQs(exam, yr, tp, sq) {
  return master.filter(function (m) {
    if (!isPYQ(m)) return false;
    var qExam = getPYQExam(m);
    if (exam !== "all" && qExam !== exam) return false;

    var qYr = getPYQYear(m);
    if (exam === "NEET-SS") {
      if (yr === "2025" && qYr !== 2025) return false;
      if (yr === "2024" && qYr !== 2024) return false;
    }
    if (tp && tp !== "all" && getPYQTopic(m) !== tp) return false;
    if (sq) {
      var tagStr = (m.tags || []).join(" ");
      var qText = (m.question + " " + (m.options || []).join(" ") + " " + (m.explanation || "") + " " + tagStr + " " + (m.concept_tested || "") + " " + (m.examPearl || "")).toLowerCase();
      if (qText.indexOf(sq) === -1) return false;
    }
    return true;
  });
}

// Check exam separation
const neetQuestions = getFilteredPYQs('NEET-SS', 'all', 'all', '');
const ini2025Questions = getFilteredPYQs('INI-SS', 'all', 'all', '');
const ini2026Questions = getFilteredPYQs('INI-CET-SS-2026', 'all', 'all', '');

assert.strictEqual(neetQuestions.length, 190, 'NEET-SS must have 190 questions');
assert.strictEqual(ini2025Questions.length, 66, 'INI-SS Nov 2025 must have 66 questions');
assert.strictEqual(ini2026Questions.length, 56, 'INI-CET SS 2026 must have 56 questions');
console.log(`  ✓ Strict exam separation verified: NEET-SS (190), INI-SS Nov 25 (66), INI-CET SS 2026 (56) = Total 312 PYQs.`);

// Check Topic Filtering in INI-CET SS 2026
const ventQuestions = getFilteredPYQs('INI-CET-SS-2026', 'all', 'Mechanical Ventilation', '');
const neuroQuestions = getFilteredPYQs('INI-CET-SS-2026', 'all', 'Neurocritical Care', '');
const pharmQuestions = getFilteredPYQs('INI-CET-SS-2026', 'all', 'Pharmacology & Oncology', '');

assert.strictEqual(ventQuestions.length, 10, 'Mechanical Ventilation should have 10 questions in INI-CET SS 2026');
assert.strictEqual(neuroQuestions.length, 6, 'Neurocritical Care should have 6 questions in INI-CET SS 2026');
assert.strictEqual(pharmQuestions.length, 5, 'Pharmacology & Oncology should have 5 questions in INI-CET SS 2026');
console.log(`  ✓ Topic filtering verified: Mechanical Ventilation (10), Neurocritical Care (6), Pharmacology (5).`);

// Check Keyword Search in INI-CET SS 2026
const durloSearch = getFilteredPYQs('INI-CET-SS-2026', 'all', 'all', 'durlobactam');
const stenoSearch = getFilteredPYQs('INI-CET-SS-2026', 'all', 'all', 'stenotrophomonas');
const eitSearch = getFilteredPYQs('INI-CET-SS-2026', 'all', 'all', 'electrical impedance');

assert.strictEqual(durloSearch.length, 1, 'Search for durlobactam must match 1 question in INI-CET SS 2026');
assert.strictEqual(stenoSearch.length, 1, 'Search for stenotrophomonas must match 1 question in INI-CET SS 2026');
assert.strictEqual(eitSearch.length, 1, 'Search for electrical impedance must match 1 question in INI-CET SS 2026');
console.log(`  ✓ Keyword search verified: durlobactam, stenotrophomonas, and electrical impedance tomograph match expected questions.`);

// 4. Verify all 56 questions have 4 options, valid answer, detailed explanation, why-wrongs, and pearls
for (let i = 0; i < ini2026Questions.length; i++) {
  const q = ini2026Questions[i];
  assert.ok(q.id.startsWith('INICET-SS-2026-CC-R'), `${q.id} must have INICET prefix`);
  assert.strictEqual(q.options.length, 4, `${q.id} must have exactly 4 options`);
  assert.ok(['A', 'B', 'C', 'D'].includes(q.answer), `${q.id} must have answer A, B, C, or D`);
  assert.ok(q.explanation.length > 50, `${q.id} must have substantive explanation`);
  assert.ok(q.whyWrong && Object.keys(q.whyWrong).length >= 1, `${q.id} must have whyWrong rationale`);
  assert.ok(q.examPearl && q.examPearl.length > 20, `${q.id} must have exam pearl`);
}
console.log(`  ✓ All 56 INI-CET SS 2026 questions validated for options, answer key, explanation, whyWrong, and exam pearls.`);

console.log('====================================================');
console.log('ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
console.log('====================================================');
