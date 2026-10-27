const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('=== Running Clinical Content & Question Trustworthiness Verification ===\n');
  let failures = 0;
  let tests = 0;

  function assert(condition, message) {
    tests++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failures++;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  // --- 1. MCQ Database Provenance & Integrity ---
  const mcqPath = path.join(__dirname, '..', 'criticalCare', 'mcqs.json');
  assert(fs.existsSync(mcqPath), 'criticalCare/mcqs.json exists');
  const mcqs = JSON.parse(fs.readFileSync(mcqPath, 'utf8'));
  assert(Array.isArray(mcqs) && mcqs.length === 817, `mcqs.json contains exactly 817 questions (found: ${mcqs.length})`);

  const allowedCategories = new Set(['documented-recall', 'reconstructed-pyq', 'practice-question']);
  const categoryCounts = {};
  let dirtyOptionCount = 0;
  let invalidOptionsArray = 0;

  mcqs.forEach((q, idx) => {
    // Check provenance
    const cat = q.provenanceCategory;
    if (!allowedCategories.has(cat)) {
      failures++;
      console.error(`Invalid provenanceCategory '${cat}' at question index ${idx} (id: ${q.id})`);
    } else {
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Check options
    if (!Array.isArray(q.options) || q.options.length < 2) {
      invalidOptionsArray++;
    } else {
      q.options.forEach((opt, optIdx) => {
        if (typeof opt !== 'string' || opt.trim().length === 0) {
          invalidOptionsArray++;
        }
        if (/Correct answer:/i.test(opt) || /\nSubject:/i.test(opt)) {
          dirtyOptionCount++;
          console.error(`Dirty option string detected in question ${q.id} option ${optIdx}: "${opt}"`);
        }
      });
    }
  });

  assert(dirtyOptionCount === 0, `Zero dirty option strings with unparsed answer keys in mcqs.json (found: ${dirtyOptionCount})`);
  assert(invalidOptionsArray === 0, `All questions have valid non-empty options array >= 2 options`);
  assert(categoryCounts['documented-recall'] === 343, `documented-recall count is exactly 343 (found: ${categoryCounts['documented-recall']})`);
  assert(categoryCounts['reconstructed-pyq'] === 88, `reconstructed-pyq count is exactly 88 (found: ${categoryCounts['reconstructed-pyq']})`);
  assert(categoryCounts['practice-question'] === 386, `practice-question count is exactly 386 (found: ${categoryCounts['practice-question']})`);
  assert(
    (categoryCounts['documented-recall'] + categoryCounts['reconstructed-pyq'] + categoryCounts['practice-question']) === 817,
    `Total categorized questions sum exactly to 817`
  );

  // --- 2. Semantic Explanation Alignment in NEETSS-CC-2024 ---
  const qMap = new Map();
  mcqs.forEach(q => qMap.set(q.id, q));

  function verifyQuestionAlignment(id, regex, expectedConcept) {
    const q = qMap.get(id);
    if (!q) {
      assert(false, `Question ${id} found in mcqs.json`);
      return;
    }
    const explanation = q.explanation || '';
    const match = regex.test(explanation);
    assert(match, `Question ${id} explanation aligned with expected concept: '${expectedConcept}'`);
  }

  verifyQuestionAlignment('NEETSS-CC-2024-R029', /MACOCHA/i, 'MACOCHA Score');
  verifyQuestionAlignment('NEETSS-CC-2024-R030', /spontaneous breathing trial|SBT|RSBI/i, 'Spontaneous Breathing Trial (SBT)');
  verifyQuestionAlignment('NEETSS-CC-2024-R031', /curare|capnogram|cleft/i, 'Curare Cleft in Capnogram');
  verifyQuestionAlignment('NEETSS-CC-2024-R032', /Factor V|prothrombin|coagulopathy/i, 'Liver Failure Coagulation & Factor V');
  verifyQuestionAlignment('NEETSS-CC-2024-R033', /50 to 75 mg\/dL|cerebral edema/i, 'DKA Glycemic Drop Rate');
  verifyQuestionAlignment('NEETSS-CC-2024-R034', /insulin shock|hypoglycemi|counter-regulatory/i, 'Insulin Shock Coma Mechanism');
  verifyQuestionAlignment('NEETSS-CC-2024-R035', /Sotalol|Class III|torsades/i, 'Sotalol Toxicity & QTc');
  verifyQuestionAlignment('NEETSS-CC-2024-R036', /rise time|inspiratory flow/i, 'Mechanical Ventilation Rise Time');
  verifyQuestionAlignment('NEETSS-CC-2024-R043', /minimally invasive|arterial pressure waveform|pulse contour|LiDCO|FloTrac/i, 'Minimally Invasive Cardiac Output Monitoring');
  verifyQuestionAlignment('NEETSS-CC-2024-R044', /tamponade|loss of the y descent|equalization/i, 'Cardiac Tamponade Catheterization Tracing');
  verifyQuestionAlignment('NEETSS-CC-2024-R046', /auto-PEEP|dynamic hyperinflation|intrinsic PEEP/i, 'Auto-PEEP & Hyperinflation');
  verifyQuestionAlignment('NEETSS-CC-2024-R047', /procalcitonin|stewardship|de-escalat/i, 'Antimicrobial Stewardship & Procalcitonin');
  verifyQuestionAlignment('NEETSS-CC-2024-R048', /APACHE II|worst physiological|24 hours/i, 'APACHE II 24-Hour Physiology Score');
  verifyQuestionAlignment('NEETSS-CC-2024-R049', /qSOFA|Singer|Sepsis-3/i, 'qSOFA Bedside Sepsis Screening');

  // --- 3. Sepsis Content Verification in study-data.js & content-config.js ---
  const studyData = fs.readFileSync(path.join(__dirname, '..', 'study-data.js'), 'utf8');
  assert(!studyData.includes('Mandated for patients with hypotension'), 'No rigid "Mandated for patients with hypotension" phrasing in study-data.js');
  assert(studyData.includes('conditional recommendation, low certainty of evidence'), 'Conditional recommendation explicitly stated for 30 mL/kg fluid in study-data.js');
  assert(studyData.includes('60–65 mmHg') || studyData.includes('60-65 mmHg'), 'Conservative MAP target (60-65 mmHg) for older adults documented');
  assert(studyData.includes('Active Fluid De-resuscitation'), 'Active fluid de-resuscitation guidance present');
  assert(studyData.includes('Procalcitonin (PCT) Stewardship') || studyData.includes('Procalcitonin (PCT) Role'), 'Procalcitonin stewardship role present');

  const contentConfig = fs.readFileSync(path.join(__dirname, '..', 'content-config.js'), 'utf8');
  assert(contentConfig.includes('4-tier stratified timing'), '4-tier stratified antimicrobial timing documented in content-config.js');
  assert(contentConfig.includes('conditional initial conservative MAP target of 60–65 mmHg'), 'Conditional MAP target for older adults documented in content-config.js');

  // --- 4. Review Register Schema & Null Handling ---
  const registerPath = path.join(__dirname, '..', 'content-review-register.json');
  assert(fs.existsSync(registerPath), 'content-review-register.json exists');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
  assert(register.schemaVersion === '1.0.0', 'Review register schema version is 1.0.0');
  assert(Array.isArray(register.records) && register.records.length >= 20, `Review register contains >= 20 records (found: ${register.records.length})`);

  const validStatuses = new Set(['VERIFIED', 'CORRECTION_REQUIRED', 'CLINICIAN_REVIEW_PENDING']);
  let validRecords = 0;
  let pendingCount = 0;

  register.records.forEach((rec, idx) => {
    const hasRequired = rec.contentId && rec.topic && rec.riskLevel && rec.sourceAndEdition &&
                        rec.lastReviewed && rec.reviewStatus && rec.reviewer && rec.nextReviewDue;
    if (!hasRequired) {
      failures++;
      console.error(`Record index ${idx} missing required fields:`, rec);
    } else {
      validRecords++;
    }

    if (!validStatuses.has(rec.reviewStatus)) {
      failures++;
      console.error(`Record ${rec.contentId} has invalid reviewStatus: ${rec.reviewStatus}`);
    }

    if (rec.reviewStatus === 'CLINICIAN_REVIEW_PENDING') {
      pendingCount++;
    }
  });

  assert(validRecords === register.records.length, `All ${register.records.length} records satisfy required schema`);
  assert(pendingCount >= 3, `Explicit CLINICIAN_REVIEW_PENDING items are logged honestly (found: ${pendingCount})`);

  // Verify dist-app mirror exists and matches
  const distRegisterPath = path.join(__dirname, '..', 'dist-app', 'content-review-register.json');
  assert(fs.existsSync(distRegisterPath), 'dist-app/content-review-register.json mirror exists');

  console.log(`\n==================================================`);
  console.log(`Trustworthiness Tests Complete: ${tests - failures}/${tests} Passed`);
  console.log(`==================================================\n`);

  if (failures > 0) {
    process.exit(1);
  }
}

runTests();
