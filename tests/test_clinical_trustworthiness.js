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

  // Verify R038 option completeness (no truncated phrases)
  const q038 = qMap.get('NEETSS-CC-2024-R038');
  assert(q038 && q038.options[0].includes('reduces'), 'NEETSS-CC-2024-R038 Option A contains complete sentence with "reduces"');
  assert(q038 && q038.options[2].includes('deposition'), 'NEETSS-CC-2024-R038 Option C contains complete sentence with "deposition"');

  // Verify R112 explanation has no rigid "mandate" phrasing
  const q112 = qMap.get('NEETSS-CC-2024-R112');
  assert(q112 && !q112.explanation.includes('mandates'), 'NEETSS-CC-2024-R112 explanation has no rigid "mandates" phrasing');
  assert(q112 && q112.explanation.includes('conditional recommendation, low certainty of evidence'), 'NEETSS-CC-2024-R112 explanation cites conditional recommendation');

  // --- 3. Sepsis Content Verification in study-data.js & content-config.js ---
  const studyData = fs.readFileSync(path.join(__dirname, '..', 'study-data.js'), 'utf8');
  assert(!studyData.includes('Mandated for patients with hypotension'), 'No rigid "Mandated for patients with hypotension" phrasing in study-data.js');
  assert(studyData.includes('conditional recommendation, low certainty of evidence'), 'Conditional recommendation explicitly stated for 30 mL/kg fluid in study-data.js');
  assert(studyData.includes('60–65 mmHg') || studyData.includes('60-65 mmHg'), 'Conservative MAP target (60-65 mmHg) for older adults documented');
  assert(studyData.includes('Active Fluid De-resuscitation'), 'Active fluid de-resuscitation guidance present');
  assert(studyData.includes('Procalcitonin (PCT) Stewardship') || studyData.includes('Procalcitonin (PCT) Role'), 'Procalcitonin stewardship role present');

  // Phase 2 / 2.1 Content Checks: SDD/SOD, Pediatric Sepsis Steroids, Blood Purification
  assert(studyData.includes('Selective Decontamination in ICU (SDD vs SOD)'), 'Selective Decontamination in ICU (SDD vs SOD) curriculum present');
  assert(studyData.includes('SuDDICU Randomized Clinical Trial'), 'SuDDICU trial results cited in SDD section');
  assert(studyData.includes('odds ratio [OR] 0.91, 95% CI 0.82–1.02; p = 0.10'), 'Accurate SuDDICU statistical results documented');
  assert(!studyData.includes('STRICTLY NOT RECOMMENDED by the Indian Society'), 'No unverified universal ISCCM mandate claim');
  assert(!studyData.includes('> 50% ESBL'), 'No arbitrary unsubstantiated ESBL threshold');
  assert(studyData.includes('settings with low baseline antimicrobial resistance') || studyData.includes('low prevalence of antimicrobial resistance'), 'SDD bounded to settings with low baseline AMR');
  assert(studyData.includes('conditional recommendation suggesting the use of SDD (moderate-certainty evidence)'), 'SDD recommendation accurately labeled with moderate-certainty evidence in SSC 2026');
  assert(!studyData.includes('use of SDD specifically in clinical settings with low baseline antimicrobial resistance (conditional recommendation, low certainty of evidence)'), 'No incorrect low-certainty label for SDD in SSC 2026');

  assert(studyData.includes('Pediatric Surviving Sepsis Campaign Guidelines (pSSC 2020 / 2026)'), 'pSSC 2020/2026 pediatric sepsis steroid guidance present');
  assert(studyData.includes('evidence is insufficient to issue a recommendation for or against treatment'), 'pSSC evidence insufficiency in persistent shock documented');
  assert(studyData.includes('Stress-dose corticosteroids SHOULD be administered in children with suspected or documented adrenal insufficiency'), 'Stress-dose corticosteroids indicated for adrenal insufficiency');
  assert(!studyData.includes('NEVER use adult fixed 200 mg/d in children!'), 'Categorical contraindication phrasing replaced with weight-based rationale');

  assert(studyData.includes('Clinical Trial Evidence & Evidence Certainty'), 'Blood purification section accurately details evidence certainty');
  assert(studyData.includes('conditional recommendation, very-low-certainty evidence'), 'Routine blood purification preserved with very-low-certainty evidence');
  assert(studyData.includes('conditional recommendation, low-certainty evidence'), 'Polymyxin B hemoperfusion preserved with low-certainty evidence');
  assert(studyData.includes('Evidence-Traced Clinical Safety Considerations & Potential Harms'), 'Blood purification traces harms to clinical evidence');
  assert(!studyData.includes('demonstrated zero significant benefit'), 'No colloquial "zero benefit" claim in blood purification');

  const contentConfig = fs.readFileSync(path.join(__dirname, '..', 'content-config.js'), 'utf8');
  assert(contentConfig.includes('4-tier stratified timing'), '4-tier stratified antimicrobial timing documented in content-config.js');
  assert(contentConfig.includes('conditional initial conservative MAP target of 60–65 mmHg'), 'Conditional MAP target for older adults documented in content-config.js');

  // --- 4. Review Register Schema & Null Handling ---
  const registerPath = path.join(__dirname, '..', 'content-review-register.json');
  assert(fs.existsSync(registerPath), 'content-review-register.json exists');
  const register = JSON.parse(fs.readFileSync(registerPath, 'utf8'));
  assert(register.schemaVersion === '1.0.0', 'Review register schema version is 1.0.0');
  assert(Array.isArray(register.records) && register.records.length >= 20, `Review register contains >= 20 records (found: ${register.records.length})`);

  const validStatuses = new Set(['VERIFIED', 'CORRECTION_REQUIRED', 'CORRECTED', 'QUALIFIED', 'CLINICIAN_REVIEW_PENDING']);
  let validRecords = 0;
  let clinicianSignOffCount = 0;

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

    if (rec.clinicianSignOffRequired === true) {
      clinicianSignOffCount++;
    }
  });

  assert(validRecords === register.records.length, `All ${register.records.length} records satisfy required schema`);
  assert(clinicianSignOffCount >= 3, `Explicit clinicianSignOffRequired items tracked transparently (found: ${clinicianSignOffCount})`);

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
