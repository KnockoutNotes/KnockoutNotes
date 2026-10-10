const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("RUNNING NEET-SS CRITICAL CARE PYQ VERIFICATION SUITE");
console.log("==================================================");

// 1. Verify criticalCare/mcqs.json
const mcqs = JSON.parse(fs.readFileSync('criticalCare/mcqs.json', 'utf8'));
console.log(`\n[Test 1] Total MCQs in master JSON: ${mcqs.length}`);

const recalls2025 = mcqs.filter(m => m.sourceType === 'neet-ss-2025-recall' || (m.tags && m.tags.includes('NEET SS CC 2025')));
const recalls2024 = mcqs.filter(m => m.sourceType === 'neet-ss-2024-recall' || (m.tags && m.tags.includes('NEET SS CC 2024')));

console.log(`  - 2025 recalls count: ${recalls2025.length} (Expected: 76)`);
assert.strictEqual(recalls2025.length, 76, "2025 recalls must equal 76");

console.log(`  - 2024 recalls count: ${recalls2024.length} (Expected: 114)`);
assert.strictEqual(recalls2024.length, 114, "2024 recalls must equal 114");

const totalPYQs = recalls2025.length + recalls2024.length;
console.log(`  - All Years combined: ${totalPYQs} (Expected: 190)`);
assert.strictEqual(totalPYQs, 190, "Combined PYQs must equal 190");

// Verify zero placeholder records
const placeholders = mcqs.filter(m => m.question && m.question.includes('Critical care management in') && m.question.includes('detailing optimal therapeutic targets'));
console.log(`  - Generic placeholder questions in database: ${placeholders.length} (Expected: 0)`);
assert.strictEqual(placeholders.length, 0, "No placeholder questions must exist in database");

// Verify 2024 questions have unique IDs and stems
const q24Ids = new Set(recalls2024.map(q => q.id));
assert.strictEqual(q24Ids.size, 114, "All 114 2024 question IDs must be unique");
const q24Stems = new Set(recalls2024.map(q => q.question));
assert.strictEqual(q24Stems.size, 114, "All 114 2024 question stems must be unique");
console.log("  ✓ All 114 2024 records have unique IDs and distinct genuine stems.");

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
  if (m.sourceType === "neet-ss-2025-recall" || m.sourceType === "neet-ss-2024-recall") return true;
  if (m.tags && (m.tags.indexOf("NEET SS CC 2025") !== -1 || m.tags.indexOf("NEET SS CC 2024") !== -1 || m.tags.indexOf("Recall 2025") !== -1 || m.tags.indexOf("Recall 2024") !== -1)) return true;
  return false;
}

function getPYQYear(m) {
  if (!m) return 2025;
  if (m.year) return Number(m.year);
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

const pyqs = mcqs.filter(isPYQ);
assert.strictEqual(pyqs.length, 190);

// Test year filters
const p2025 = pyqs.filter(q => getPYQYear(q) === 2025);
assert.strictEqual(p2025.length, 76);
const p2024 = pyqs.filter(q => getPYQYear(q) === 2024);
assert.strictEqual(p2024.length, 114);

// Test topic filter
const ventQs = pyqs.filter(q => getPYQTopic(q) === "Mechanical Ventilation");
console.log(`  - Mechanical Ventilation PYQs: ${ventQs.length} (contains questions from both 2024 and 2025)`);
assert.ok(ventQs.some(q => getPYQYear(q) === 2024), "Must contain 2024 ventilation recall");
assert.ok(ventQs.some(q => getPYQYear(q) === 2025), "Must contain 2025 ventilation recall");

// Test search filter
const lundbergMatches = pyqs.filter(q => (q.question + " " + q.explanation).toLowerCase().includes("lundberg"));
console.log(`  - Search for 'lundberg' matched: ${lundbergMatches.length} questions`);
assert.strictEqual(lundbergMatches.length, 1);
assert.ok(lundbergMatches[0].id.includes("2024"), "Lundberg question must belong to 2024 recalls");

const curbMatches = pyqs.filter(q => (q.question + " " + q.explanation).toLowerCase().includes("curb-65"));
console.log(`  - Search for 'curb-65' matched: ${curbMatches.length} questions`);
assert.strictEqual(curbMatches.length, 1);
assert.strictEqual(curbMatches[0].id, "NEETSS-CC-2025-R001");

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
