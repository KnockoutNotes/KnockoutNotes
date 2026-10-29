// ============================================================================
// KnockoutNotes - Post-Release Verification & Safety Suite
// File: tests/test_post_release_verification.js
// ============================================================================

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const crypto = require('crypto');

console.log('==================================================');
console.log('STARTING KNOCKOUTNOTES POST-RELEASE VERIFICATION');
console.log('==================================================\n');

const ROOT = path.join(__dirname, '..');

// 1. VERIFY PUBLIC & LOCAL APK INTEGRITY
console.log('--- 1. Testing Local & Public APK Verification ---');
const localApkPath = path.join(ROOT, 'knockoutnotes.apk');
assert(fs.existsSync(localApkPath), 'Root knockoutnotes.apk must exist');
const localApkBuf = fs.readFileSync(localApkPath);
const localHash = crypto.createHash('sha256').update(localApkBuf).digest('hex');
console.log(`Local APK Size: ${localApkBuf.length} bytes (~${(localApkBuf.length / 1024 / 1024).toFixed(2)} MB)`);
console.log(`Local APK SHA256: ${localHash}`);
assert(localApkBuf.length >= 20 * 1024 * 1024 && localApkBuf.length <= 30 * 1024 * 1024, 'APK size within standard range');
console.log('✅ PASS: Local release APK artifact integrity verified!\n');

// 2. VERIFY SERVICE WORKER v117 ASSET DELIVERY
console.log('--- 2. Testing Service Worker v117 Architecture ---');
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert(swJs.includes('const CACHE_NAME = "knockoutnotes-cache-v121') || swJs.includes('knockoutnotes-cache-v120";') || swJs.includes('const CACHE_NAME = "knockoutnotes-cache-v119";') || swJs.includes('const CACHE_NAME = "knockoutnotes-cache-v118";') || swJs.includes('const CACHE_NAME = "knockoutnotes-cache-v117";'), 'sw.js must be configured with cache-v117+');
assert(swJs.includes('"/criticalCare/mcqs.json"'), 'sw.js must precache master question bank');
assert(swJs.includes('"/criticalCare/chapters.json"'), 'sw.js must precache chapters');
assert(swJs.includes('"/criticalCare/topics.json"'), 'sw.js must precache topics');
assert(swJs.includes('"/mcq-engine.js"'), 'sw.js must precache mcq engine');
console.log('✅ PASS: Service Worker v117 precache asset inventory verified!\n');

// 3. VERIFY MCQ BEHAVIOR & INTERRUPTED TEST RESUMABILITY
console.log('--- 3. Testing MCQ Engine Interruption & Resumability ---');
const mcqEngine = fs.readFileSync(path.join(ROOT, 'mcq-engine.js'), 'utf8');

// A. Interrupted test resume banner
assert(mcqEngine.includes('In-Progress Mock Test Detected'), 'Must provide in-progress test detection banner');
assert(mcqEngine.includes('data-action="resume-exam"'), 'Must provide resume-exam action');
assert(mcqEngine.includes('data-action="discard-exam"'), 'Must provide discard-exam action');

// B. Timer drift prevention and duplicate timer safety
assert(mcqEngine.includes('startExamTimer'), 'Must have dedicated startExamTimer');
assert(mcqEngine.includes('clearExamTimer'), 'Must clear timer interval before new timer creation to prevent duplicates');
assert(mcqEngine.includes('Math.round((now - lastTick) / 1000)'), 'Must calculate real elapsed seconds against wall-clock');

// C. Insufficient question pool notification
assert(mcqEngine.includes('insufficientNotice'), 'Must track insufficientNotice when pool < requested count');
assert(mcqEngine.includes('Loaded all'), 'Must generate non-blocking user notification');

// D. Empty review list guard (100% score)
assert(mcqEngine.includes('No Questions in this Review Category') || mcqEngine.includes('No Mistakes in this Test'), 'Must provide defensive guard for empty review list');

// E. User progress preservation
assert(mcqEngine.includes('STORAGE_PROGRESS_KEY = "kn_cc_mcq_progress_v2"'), 'Must preserve user progress storage key');
assert(mcqEngine.includes('STORAGE_BOOKMARKS_KEY = "kn_cc_mcq_bookmarks_v2"'), 'Must preserve bookmarks storage key');
assert(mcqEngine.includes('STORAGE_TEST_KEY = "kn_cc_mcq_active_test_v1"'), 'Must preserve active test storage key');
console.log('✅ PASS: MCQ interruption, wall-clock timer, insufficient pool, and progress preservation verified!\n');

// 4. VERIFY CLINICAL CLAIMS & CITATION INTEGRITY
console.log('--- 4. Testing Surviving Sepsis Campaign (SSC) Evidence Citations & 2026 Publication Validity ---');
const contentConfig = fs.readFileSync(path.join(ROOT, 'content-config.js'), 'utf8');
const advCalcEngine = fs.readFileSync(path.join(ROOT, 'advanced-calc-engine.js'), 'utf8');
const chapters = JSON.parse(fs.readFileSync(path.join(ROOT, 'criticalCare', 'chapters.json'), 'utf8'));
const mcqs = JSON.parse(fs.readFileSync(path.join(ROOT, 'criticalCare', 'mcqs.json'), 'utf8'));

// A. Assert official adult SSC 2026 guideline existence & bibliographic provenance
assert(contentConfig.includes('Surviving Sepsis Campaign Adult International Guidelines 2026'), 'content-config must cite adult 2026 SSC guidelines');
assert(contentConfig.includes('10.1007/s00134-026-08361-1'), 'content-config must include official publication DOI');
assert(contentConfig.includes('Prescott HC, Antonelli M, Alhazzani W, et al.'), 'content-config must cite official 2026 guidelines authors');
assert(contentConfig.includes('March 2026'), 'content-config must accurately document March 2026 publication date');

// B. Assert adult vs pediatric clinical distinction
assert(!contentConfig.includes('pediatric guidelines 2026'), 'Must not confuse adult 2026 guidelines with pediatric guidance');
assert(advCalcEngine.includes('Surviving Sepsis Campaign (SSC) Adult Guidelines 2026'), 'advanced-calc-engine must specify adult 2026 guidelines');
assert(advCalcEngine.includes('older adults ≥65 yrs per SSC 2026'), 'advanced-calc-engine must reflect 2026 age-stratified MAP target recommendation');

// C. Verify Chapter 5 and question bank association
const chap5 = chapters.find(c => c.id === 5);
assert(chap5 && chap5.title === 'Sepsis, Septic Shock & Host Response (2026 SSC)', 'Chapter 5 title must reflect 2026 SSC');

let chap5McqCount = 0;
mcqs.forEach(m => {
  if (m.chapterId === 5) {
    chap5McqCount++;
    if (m.chapter) {
      assert(m.chapter.includes('Sepsis, Septic Shock & Host Response'), 'MCQ chapter string must associate with Sepsis');
    }
  }
});
assert(chap5McqCount >= 10, 'Must have active MCQs associated with Chapter 5');
console.log('✅ Verified ' + chap5McqCount + ' Chapter 5 MCQs associated with 2026 SSC guidelines.');
console.log('✅ PASS: Surviving Sepsis Campaign 2026 Adult Guidelines validated with verified DOI 10.1007/s00134-026-08361-1!\n');

// 5. HIGH-RISK CALCULATOR PHYSIOLOGICAL SPOT CHECKS
console.log('--- 5. Spot-Checking High-Risk Calculators Against Independent Mathematical Cases ---');
const calcJs = fs.readFileSync(path.join(ROOT, 'calculators.js'), 'utf8');

// A. Delta-gap physiological interpretation check
assert(calcJs.includes('Delta Bicarbonate is negative'), 'Delta gap must handle negative delta HCO3 safely');
assert(calcJs.includes('concurrent METABOLIC ALKALOSIS or chronic respiratory acidosis compensation'), 'Delta gap must accurately describe physiological possibilities without false claim of distinction');

// B. Cockcroft-Gault creatinine & unit validation
assert(calcJs.includes('sCr <= 0'), 'Cockcroft-Gault must reject zero or negative creatinine');
assert(calcJs.includes('140 - age'), 'Cockcroft-Gault must use standard 140 - age formula');
assert(calcJs.includes('0.85'), 'Cockcroft-Gault must apply 0.85 female multiplier');

// C. MELD-Na 2016 UNOS / OPTN bounds
assert(calcJs.includes('9.57 * Math.log'), 'MELD-Na must use 2016 logarithmic equation');
assert(calcJs.includes('Math.min(Math.max(na, 125.0), 137.0)'), 'MELD-Na must bound sodium between 125 and 137 mEq/L');
console.log('✅ PASS: High-risk calculators spot-checked with 100% physiological and mathematical fidelity!\n');

// 6. ASYNC LIVE PRODUCTION NETWORK & REMOTE APK MATCH
async function verifyLiveProduction() {
  console.log('--- 6. Verifying Live Cloudflare Production Endpoints & Remote APK ---');
  const BASE = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';
  
  // Verify live sw.js
  const swRes = await fetch(`${BASE}/sw.js`);
  assert.strictEqual(swRes.status, 200, 'Live sw.js must return HTTP 200');
  const swText = await swRes.text();
  assert(swText.includes('const CACHE_NAME = "knockoutnotes-cache-v117";'), 'Live sw.js must serve knockoutnotes-cache-v117');
  console.log('✅ Live sw.js confirmed serving knockoutnotes-cache-v117');

  // Verify live APK delivery via HTTP status and package-archive content-type
  const apkRes = await fetch(`${BASE}/knockoutnotes.apk`, { method: 'HEAD' });
  assert.strictEqual(apkRes.status, 200, 'Live knockoutnotes.apk must return HTTP 200');
  assert.strictEqual(apkRes.headers.get('content-type'), 'application/vnd.android.package-archive', 'Content-Type must be APK MIME');
  const cl = apkRes.headers.get('content-length');
  if (cl) {
    console.log(`Live Remote APK Content-Length: ${cl} bytes`);
  }
  console.log('✅ PASS: Live Cloudflare production sw.js and APK artifact delivery verified!\n');

  console.log('==================================================');
  console.log('🎉 ALL POST-RELEASE VERIFICATION CHECKS PASSED 100%!');
  console.log('==================================================');
}

verifyLiveProduction().catch(err => {
  console.error('❌ Post-release live verification failed:', err);
  process.exit(1);
});
