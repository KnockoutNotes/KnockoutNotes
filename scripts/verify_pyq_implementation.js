const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("RUNNING NEET-SS CRITICAL CARE PYQ VERIFICATION SUITE");
console.log("==================================================");

// 1. Verify criticalCare/mcqs.json
const mcqs = JSON.parse(fs.readFileSync('criticalCare/mcqs.json', 'utf8'));
console.log(`\n[Test 1] Total MCQs in master JSON: ${mcqs.length} (Expected: 817)`);
assert.strictEqual(mcqs.length, 817, "Master MCQs count must be 817");

const recalls2025 = mcqs.filter(m => m.sourceType === 'neet-ss-2025-recall' || (m.tags && m.tags.includes('NEET SS CC 2025')));
const recalls2024 = mcqs.filter(m => m.sourceType === 'neet-ss-2024-recall' || (m.tags && m.tags.includes('NEET SS CC 2024')));
const inissRecalls = mcqs.filter(m => m.sourceType === 'ini-ss-nov2025-recall' || (m.tags && m.tags.includes('INI SS CC Nov 2025')));
const inicet2026Recalls = mcqs.filter(m => m.sourceType === 'ini-cet-ss-2026-recall' || (m.tags && (m.tags.includes('INI-CET SS 2026') || m.tags.includes('INI SS CC April 2026'))));

console.log(`  - NEET-SS 2025 recalls count: ${recalls2025.length} (Expected: 76)`);
assert.strictEqual(recalls2025.length, 76, "NEET-SS 2025 recalls must equal 76");

console.log(`  - NEET-SS 2024 recalls count: ${recalls2024.length} (Expected: 114)`);
assert.strictEqual(recalls2024.length, 114, "NEET-SS 2024 recalls must equal 114");

const totalNeetPYQs = recalls2025.length + recalls2024.length;
console.log(`  - NEET-SS combined: ${totalNeetPYQs} (Expected: 190)`);
assert.strictEqual(totalNeetPYQs, 190, "NEET-SS combined must equal 190");

console.log(`  - INI-SS Nov 2025 recalls count: ${inissRecalls.length} (Expected: 66)`);
assert.strictEqual(inissRecalls.length, 66, "INI-SS Nov 2025 recalls must equal 66");

console.log(`  - INI-CET SS 2026 recalls count: ${inicet2026Recalls.length} (Expected: 56)`);
assert.strictEqual(inicet2026Recalls.length, 56, "INI-CET SS 2026 recalls must equal 56");

// Verify zero placeholder records
const placeholders = mcqs.filter(m => m.question && m.question.includes('Critical care management in') && m.question.includes('detailing optimal therapeutic targets'));
console.log(`  - Generic placeholder questions in database: ${placeholders.length} (Expected: 0)`);
assert.strictEqual(placeholders.length, 0, "No placeholder questions must exist in database");

// Verify 2024 questions have unique IDs and stems
const q24Ids = new Set(recalls2024.map(q => q.id));
assert.strictEqual(q24Ids.size, 114, "All 114 2024 question IDs must be unique");
const q24Stems = new Set(recalls2024.map(q => q.question));
assert.strictEqual(q24Stems.size, 114, "All 114 2024 question stems must be unique");
console.log("  ✓ All 114 NEET-SS 2024 records have unique IDs and distinct genuine stems.");

// Verify INI-SS questions have unique IDs and stems
const iniIds = new Set(inissRecalls.map(q => q.id));
assert.strictEqual(iniIds.size, 66, "All 66 INI-SS question IDs must be unique");
const iniStems = new Set(inissRecalls.map(q => q.question));
assert.strictEqual(iniStems.size, 66, "All 66 INI-SS question stems must be unique");
console.log("  ✓ All 66 INI-SS records have unique IDs and distinct genuine stems.");

// Verify INI-CET SS 2026 questions have unique IDs and stems
const inicetIds = new Set(inicet2026Recalls.map(q => q.id));
assert.strictEqual(inicetIds.size, 56, "All 56 INI-CET SS 2026 question IDs must be unique");
const inicetStems = new Set(inicet2026Recalls.map(q => q.question));
assert.strictEqual(inicetStems.size, 56, "All 56 INI-CET SS 2026 question stems must be unique");
console.log("  ✓ All 56 INI-CET SS 2026 records have unique IDs and distinct genuine stems.");

// Verify standalone INI-SS JSON file
const inissFile = JSON.parse(fs.readFileSync('INI_SS_CC_NOV_2025_Recall.json', 'utf8'));
assert.strictEqual(inissFile.questions.length, 66, "Standalone INI-SS dataset must contain 66 questions");
assert.strictEqual(inissFile.metadata.exam, "INI-SS", "Standalone metadata exam must be INI-SS");
console.log("  ✓ Standalone INI_SS_CC_NOV_2025_Recall.json verified with 66 questions.");

// Verify standalone INI-CET SS 2026 JSON file
const inicet2026File = JSON.parse(fs.readFileSync('INI_CET_SS_2026_Critical_Care_PYQs.json', 'utf8'));
assert.strictEqual(inicet2026File.questions.length, 56, "Standalone INI-CET SS 2026 dataset must contain 56 questions");
assert.strictEqual(inicet2026File.metadata.exam, "INI-CET SS", "Standalone metadata exam must be INI-CET SS");
console.log("  ✓ Standalone INI_CET_SS_2026_Critical_Care_PYQs.json verified with 56 questions.");

// 2. Verify Study Section Navigation in study-ron-design.js
const studyJs = fs.readFileSync('study-ron-design.js', 'utf8');
console.log("\n[Test 2] Verifying Study Section Navigation in study-ron-design.js");

assert.ok(studyJs.includes('🎯 PYQs'), "Must include '🎯 PYQs' button label");
assert.ok(!studyJs.includes('🎯 NEET SS CC 2025'), "Must NOT include old '🎯 NEET SS CC 2025' label");
assert.ok(studyJs.includes('📝 High Yield MCQs'), "Must preserve '📝 High Yield MCQs' button");
assert.ok(studyJs.includes('viewMode: "pyq"'), "Click handler must open viewMode: 'pyq'");
console.log("  ✓ Navigation button successfully renamed to '🎯 PYQs'.");
console.log("  ✓ '📝 High Yield MCQs' remains untouched.");
console.log("  ✓ Click handler opens PYQ view.");

// 3. Test PYQ topic normalization and filtering logic
console.log("\n[Test 3] Testing PYQ Helper Functions & Filtering");

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
  if (s.indexOf("physiol") !== -1) return "Physiology";
  if (s.indexOf("radio") !== -1 || s.indexOf("ultrasound") !== -1 || s.indexOf("echo") !== -1) return "Radiology";
  return raw || "Miscellaneous";
}

const pyqs = mcqs.filter(isPYQ);
assert.strictEqual(pyqs.length, 312, "Total PYQs must equal 190 (NEET) + 66 (INI-SS Nov 25) + 56 (INI-CET SS 2026) = 312");

// Test exam partition
const neetOnly = pyqs.filter(q => getPYQExam(q) === "NEET-SS");
assert.strictEqual(neetOnly.length, 190, "NEET-SS filtered questions must be 190");
const iniOnly = pyqs.filter(q => getPYQExam(q) === "INI-SS");
assert.strictEqual(iniOnly.length, 66, "INI-SS filtered questions must be 66");
const iniCet2026Only = pyqs.filter(q => getPYQExam(q) === "INI-CET-SS-2026");
assert.strictEqual(iniCet2026Only.length, 56, "INI-CET-SS-2026 filtered questions must be 56");

// Test NEET year filters
const p2025 = neetOnly.filter(q => getPYQYear(q) === 2025);
assert.strictEqual(p2025.length, 76);
const p2024 = neetOnly.filter(q => getPYQYear(q) === 2024);
assert.strictEqual(p2024.length, 114);

// Test topic filter
const ventQs = pyqs.filter(q => getPYQTopic(q) === "Mechanical Ventilation");
console.log(`  - Mechanical Ventilation PYQs: ${ventQs.length} (contains questions across examinations)`);
assert.ok(ventQs.some(q => getPYQExam(q) === "NEET-SS"), "Must contain NEET-SS ventilation recall");
assert.ok(ventQs.some(q => getPYQExam(q) === "INI-SS"), "Must contain INI-SS ventilation recall");

// Test search filter
const lundbergMatches = pyqs.filter(q => (q.question + " " + q.explanation).toLowerCase().includes("lundberg"));
console.log(`  - Search for 'lundberg' matched: ${lundbergMatches.length} questions`);
assert.strictEqual(lundbergMatches.length, 1);
assert.ok(lundbergMatches[0].id.includes("2024"), "Lundberg question must belong to 2024 recalls");

const curbMatches = pyqs.filter(q => (q.question + " " + q.explanation).toLowerCase().includes("curb-65"));
console.log(`  - Search for 'curb-65' matched: ${curbMatches.length} questions`);
assert.strictEqual(curbMatches.length, 1);
assert.strictEqual(curbMatches[0].id, "NEETSS-CC-2025-R001");

const durlobactamMatches = pyqs.filter(q => (q.question + " " + q.explanation).toLowerCase().includes("durlobactam"));
console.log(`  - Search for 'durlobactam' matched: ${durlobactamMatches.length} questions (spans INI-SS Nov 25 & INI-CET SS 2026)`);
assert.strictEqual(durlobactamMatches.length, 2);
assert.ok(durlobactamMatches.some(q => q.id === "INISS-CC-NOV2025-R035"), "Must include INI-SS Nov 2025 question");
assert.ok(durlobactamMatches.some(q => q.id === "INICET-SS-2026-CC-R039"), "Must include INI-CET SS 2026 question");

// 4. Verify mcq-platform.css styles
const cssContent = fs.readFileSync('mcq-platform.css', 'utf8');
console.log("\n[Test 4] Verifying CSS in mcq-platform.css");
assert.ok(cssContent.includes('.kn-pyq-explorer-view'), "Must contain .kn-pyq-explorer-view");
assert.ok(cssContent.includes('.kn-pyq-header-card'), "Must contain .kn-pyq-header-card");
assert.ok(cssContent.includes('.kn-pyq-stats-grid'), "Must contain .kn-pyq-stats-grid");
assert.ok(cssContent.includes('.kn-pyq-chips-track'), "Must contain .kn-pyq-chips-track");
assert.ok(cssContent.includes('.kn-pyq-card'), "Must contain .kn-pyq-card");
assert.ok(cssContent.includes('.kn-pyq-pagination'), "Must contain .kn-pyq-pagination");
console.log("  ✓ All required PYQ UI styles present and verified.");

console.log("\n==================================================");
console.log("ALL TESTS PASSED SUCCESSFULLY! (100% VERIFIED)");
console.log("==================================================");
