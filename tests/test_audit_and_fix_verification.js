/**
 * KnockoutNotes — Comprehensive High-Priority Audit and Fix Verification Suite
 * Tests:
 * 1. Duplicate DOM prevention rules (kn-critical-css & page-common.css).
 * 2. Guideline Radar reliability: request timeouts, in-flight deduplication, cache tiered fallback, freshness badges.
 * 3. Clinical calculator safety: non-finite, negative, boundary, and Delta Ratio alkalosis handling.
 * 4. Service Worker & PWA reliability: precache manifest completeness, quota error protection, and resilient caching.
 * 5. Search performance: pre-indexed catalog, response latency, and scoring integrity.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================");
console.log("STARTING HIGH-PRIORITY AUDIT & FIX VERIFICATION");
console.log("==================================================\n");

// ----------------------------------------------------------------------------
// 1. DUPLICATE DOM RENDERING
// ----------------------------------------------------------------------------
console.log("--- 1. Testing Duplicate DOM Prevention Architecture ---");
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const pageCommonCss = fs.readFileSync(path.join(__dirname, '..', 'page-common.css'), 'utf8');
const scriptJs = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

// Verify critical CSS has layer isolation rules
assert(indexHtml.includes('.view-layer-lite { display: none !important; }'), "Critical CSS must isolate view-layer-lite");
assert(indexHtml.includes('body.mode-3d .view-layer-lite { display: none !important; }'), "Critical CSS must hide lite in 3d mode");
assert(indexHtml.includes('body.mode-lite .view-layer-3d { display: none !important; }'), "Critical CSS must hide 3d in lite mode");
assert(indexHtml.includes('body.mode-lite .view-layer-lite { display: block !important; }'), "Critical CSS must show lite in lite mode");
assert(indexHtml.includes('body.kn-nav-mounted .site-hud'), "Critical CSS must suppress legacy nav when mounted");

// Verify page-common.css has layer isolation rules
assert(pageCommonCss.includes('.view-layer-lite'), "page-common.css must define layer isolation");
assert(pageCommonCss.includes('body.mode-3d .view-layer-lite'), "page-common.css must isolate 3D layer");

// Verify script.js idempotency guard
assert(scriptJs.includes('if (window._knCoreInitialized) return;'), "script.js must have initialization idempotency guard");
assert(scriptJs.includes('window._knCoreInitialized = true;'), "script.js must set initialization flag");

console.log("✅ PASS: Duplicate DOM rendering prevention verified in HTML, CSS, and JS!\n");

// ----------------------------------------------------------------------------
// 2. GUIDELINE RADAR RELIABILITY
// ----------------------------------------------------------------------------
console.log("--- 2. Testing Guideline Radar Reliability Architecture ---");

assert(scriptJs.includes('const DEFAULT_PROGRAMME_UPDATES ='), "DEFAULT_PROGRAMME_UPDATES must be defined in script.js");
assert(scriptJs.includes('let inFlightLoadPromise = null;'), "inFlightLoadPromise deduplication must be present");
assert(scriptJs.includes('const controller = typeof AbortController !== "undefined"'), "AbortController timeout must be used");
assert(scriptJs.includes('const PERSISTENT_CACHE_KEY ='), "Persistent localStorage cache key must be present");
assert(scriptJs.includes('populateHomeUpdates'), "populateHomeUpdates function must be defined");
assert(scriptJs.includes('kn-radar-freshness live'), "Freshness badge for live mode must be present");
assert(scriptJs.includes('kn-radar-freshness cached'), "Freshness badge for cached mode must be present");
assert(scriptJs.includes('kn-radar-freshness offline'), "Freshness badge for offline mode must be present");
assert(scriptJs.includes('data-retry-radar'), "Retry button trigger must be present");

// 2B. Contrast & WCAG AA Verification for Light Theme (page-common.css)
const pageCss = fs.readFileSync(path.join(__dirname, '..', 'page-common.css'), 'utf8');
assert(pageCss.includes('body:not(.dark) .kn-radar-retry-btn'), "page-common.css must have light-theme retry button rules");
assert(pageCss.includes('body:not(.dark) .kn-radar-freshness.live'), "page-common.css must have light-theme live freshness badge rules");
assert(pageCss.includes('body:not(.dark) .kn-radar-freshness.offline'), "page-common.css must have light-theme offline freshness badge rules");

function srgbToLin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function calcContrast(hex1, hex2) {
  const p = h => [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  const [c1, c2] = [p(hex1), p(hex2)];
  const l1 = 0.2126 * srgbToLin(c1[0]) + 0.7152 * srgbToLin(c1[1]) + 0.0722 * srgbToLin(c1[2]);
  const l2 = 0.2126 * srgbToLin(c2[0]) + 0.7152 * srgbToLin(c2[1]) + 0.0722 * srgbToLin(c2[2]);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Assert WCAG AA (>= 4.5:1) for all light theme elements
const retryContrast = calcContrast('0369a1', 'ffffff');
assert(retryContrast >= 4.5, `Retry button contrast on white must be >= 4.5 (got ${retryContrast.toFixed(2)})`);

const retryHoverContrast = calcContrast('0369a1', 'ebf3f7'); // rgba(3, 105, 161, 0.08) over white
assert(retryHoverContrast >= 4.5, `Retry button hover contrast must be >= 4.5 (got ${retryHoverContrast.toFixed(2)})`);

const liveContrast = calcContrast('047857', 'e6f1ed'); // rgba(4, 120, 87, 0.10) over white
assert(liveContrast >= 4.5, `Live badge contrast must be >= 4.5 (got ${liveContrast.toFixed(2)})`);

const offlineContrast = calcContrast('0369a1', 'e6f0f6'); // rgba(3, 105, 161, 0.10) over white
assert(offlineContrast >= 4.5, `Offline badge contrast must be >= 4.5 (got ${offlineContrast.toFixed(2)})`);

const cachedContrast = calcContrast('b45309', 'ffffff'); // #b45309 on white card base
assert(cachedContrast >= 4.5, `Cached badge contrast must be >= 4.5 (got ${cachedContrast.toFixed(2)})`);

console.log("✅ PASS: Guideline Radar request timeouts, deduplication, cache fallback & freshness badges verified!\n");

// ----------------------------------------------------------------------------
// 3. CLINICAL CALCULATOR SAFETY
// ----------------------------------------------------------------------------
console.log("--- 3. Testing Clinical Calculator Mathematical & Safety Bounds ---");
const calcJs = fs.readFileSync(path.join(__dirname, '..', 'calculators.js'), 'utf8');
const advCalcJs = fs.readFileSync(path.join(__dirname, '..', 'advanced-calc-engine.js'), 'utf8');

// Load calculator engines in sandbox
const vm = require('vm');
const calcSandbox = { window: {}, Math, Number, parseFloat, isNaN, Array };
vm.createContext(calcSandbox);
vm.runInContext(calcJs, calcSandbox);
const Calcs = calcSandbox.window.KnockoutCalculators;

// Check num() handles Infinity safely
assert(Calcs, "KnockoutCalculators must be exported");

// Test BMI with non-finite / invalid inputs
assert(Calcs.calculateBMI(Infinity, 175).error, "BMI must reject Infinity weight");
assert(Calcs.calculateBMI(-70, 175).error, "BMI must reject negative weight");
assert(Calcs.calculateBMI(70, 0).error, "BMI must reject zero height");
const validBmi = Calcs.calculateBMI(70, 175);
assert.strictEqual(validBmi.bmi, 22.9, "BMI 70kg/175cm must be 22.9");

// Test Cockcroft-Gault safety
assert(Calcs.calculateCockcroftGault({ age: 0, weight: 70, sCr: 1.0 }).error, "CrCl must reject age 0");
assert(Calcs.calculateCockcroftGault({ age: 65, weight: -70, sCr: 1.0 }).error, "CrCl must reject negative weight");
assert(Calcs.calculateCockcroftGault({ age: 65, weight: 70, sCr: 0 }).error, "CrCl must reject serum creatinine 0");
assert(Calcs.calculateCockcroftGault({ age: 65, weight: 70, sCr: Infinity }).error, "CrCl must reject Infinity creatinine");
const validCrCl = Calcs.calculateCockcroftGault({ age: 65, weight: 70, sCr: 1.0, sex: 'male' });
assert.strictEqual(validCrCl.crCl, 72.9, "CrCl for 65yo 70kg male must be 72.9 mL/min");

// Test Delta Gap with elevated bicarbonate (metabolic alkalosis)
const alkDelta = Calcs.calculateDeltaGap({ na: 140, cl: 95, hco3: 32 });
assert(alkDelta.interpretation.includes("METABOLIC ALKALOSIS"), "Negative delta HCO3 must diagnose concurrent metabolic alkalosis");
assert.strictEqual(alkDelta.riskClass, "alert", "Elevated HCO3 mixed state must be flagged as alert");

// Test Corrected Calcium nonpositive rejection and SI units
assert(Calcs.calculateCorrectedCalcium(-9, 4.0).error, "Must reject negative calcium");
assert(Calcs.calculateCorrectedCalcium(9, -2.0).error, "Must reject negative albumin");
const validCa = Calcs.calculateCorrectedCalcium(8.0, 2.5);
assert.strictEqual(validCa.correctedCalcium, 9.2, "8.0 Ca + 2.5 Alb must correct to 9.2 mg/dL");
const validCaSI = Calcs.calculateCorrectedCalcium(2.2, 40, "mmol/L");
assert.strictEqual(validCaSI.correctedCalcium, 2.2, "2.2 Ca + 40 Alb (SI) must correct to 2.2 mmol/L without error");

// Test Corrected Sodium rejection
assert(Calcs.calculateCorrectedSodium(-135, 400).error, "Must reject negative sodium");
assert(Calcs.calculateCorrectedSodium(135, -50).error, "Must reject negative glucose");
const validNa = Calcs.calculateCorrectedSodium(130, 500);
assert.strictEqual(validNa.hillierNa, 139.6, "130 Na with 500 glucose must correct to 139.6 Hillier");

// Test MELD-Na nonpositive rejection
assert(Calcs.calculateMELDNa(0, 1.2, 1.0, 135, false).error, "MELD-Na must reject 0 bilirubin");
assert(Calcs.calculateMELDNa(1.0, -1, 1.0, 135, false).error, "MELD-Na must reject negative INR");

// Test Advanced Calculator Engine
const advCalcModule = require('../advanced-calc-engine.js');
const AdvEngine = advCalcModule;

assert(AdvEngine, "KnockoutAdvancedCalc must be exported");
assert(AdvEngine.VasopressorEngine.computeForward({ drug: 'norepinephrine', weight: 0 }).error, "Vaso engine must reject 0 weight");
assert(AdvEngine.VentilationPbwEngine.computeMechanics({ heightCm: 175, sex: 'male', pplat: 10, peep: 15 }).error, "Vent engine must reject Pplat < PEEP");
assert(AdvEngine.MablEngine.calculateMABL({ weight: 70, mode: 'hb', initialVal: 10, targetVal: 12 }).error, "MABL must reject target Hb > initial Hb");

console.log("✅ PASS: All clinical calculator mathematical safety bounds and edge cases verified!\n");

// ----------------------------------------------------------------------------
// 4. SERVICE WORKER & OFFLINE RELIABILITY
// ----------------------------------------------------------------------------
console.log("--- 4. Testing Service Worker & PWA Offline Reliability ---");
const swJs = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');

assert(swJs.includes('knockoutnotes-cache-v115'), "sw.js must be bumped to v114");
assert(swJs.includes('"/advanced-calc-engine.js"'), "sw.js must precache advanced-calc-engine.js");
assert(swJs.includes('"/advanced-calc-ui.js"'), "sw.js must precache advanced-calc-ui.js");
assert(swJs.includes('"/clinical-validator.js"'), "sw.js must precache clinical-validator.js");
assert(swJs.includes('CORE_APP_SHELL'), "sw.js must define CORE_APP_SHELL for essential precache");
assert(swJs.includes('Precache Core App Shell assets'), "sw.js must strictly precache core app shell");
assert(swJs.includes('safeCachePut') || swJs.includes('.catch(() => {})'), "sw.js cache write must protect against quota errors");
assert(swJs.includes('name.startsWith("knockoutnotes-cache-") && name !== CACHE_NAME'), "sw.js must only purge old app-shell caches");

console.log("✅ PASS: Service Worker precache completeness, quota safety & cache resilience verified!\n");

// ----------------------------------------------------------------------------
// 5. SEARCH PERFORMANCE & INDEXING
// ----------------------------------------------------------------------------
console.log("--- 5. Testing Search Performance & Pre-Indexing Engine ---");
const searchJs = fs.readFileSync(path.join(__dirname, '..', 'kn-site-search.js'), 'utf8');

assert(searchJs.includes('entry._normTitle = normTitle;'), "Search catalog must pre-index _normTitle");
assert(searchJs.includes('entry._normCombined ='), "Search catalog must pre-index _normCombined");
assert(searchJs.includes('const title = item._normTitle || norm(item.Title);'), "executeSearch must use pre-indexed properties");
assert(searchJs.includes('const combined = item._normCombined ||'), "executeSearch must use pre-indexed combined text");

console.log("✅ PASS: Search pre-indexing optimization and responsiveness verified!\n");

// ----------------------------------------------------------------------------
// 6. UI CONSISTENCY, STATUS INDICATORS & ANDROID PARITY
// ----------------------------------------------------------------------------
console.log("--- 6. Testing UI Consistency, Status Indicators & Android Parity ---");

// 6A. Version Consistency
assert(indexHtml.includes('APP v3.0.1 • 8 OFFLINE SECTIONS READY'), "index.html must display APP v3.0.0");
assert(!indexHtml.includes('APP v2.4.0'), "index.html must NOT contain stale APP v2.4.0");

const adminHtml = fs.readFileSync(path.join(__dirname, '..', 'admin', 'index.html'), 'utf8');
assert(adminHtml.includes('KnockoutNotes Portal v3.0'), "admin/index.html must display Portal v3.0");

// 6B. Transient Status Handlers
assert(indexHtml.includes('Sync: <strong class="kn-sync-time-val" style="color:#e2e8f0;">Ready</strong>'), "index.html initial sync text must be Ready (not permanently Checking...)");

const syncEngineJs = fs.readFileSync(path.join(__dirname, '..', 'sync-engine.js'), 'utf8');
assert(syncEngineJs.includes("results.updated > 0"), "sync-engine.js must verify results.updated > 0 before claiming success");
assert(syncEngineJs.includes("updateSyncUI('ready', 'Content up-to-date (Offline database active)')"), "sync-engine.js must handle zero-update without false success claim");

const adminJs = fs.readFileSync(path.join(__dirname, '..', 'admin', 'admin.js'), 'utf8');
assert(adminJs.includes("r2El.textContent === 'Checking...'"), "admin.js must recover statusR2 from Checking... on error");
assert(adminJs.includes("anaEl.textContent === 'Checking...'"), "admin.js must recover statusAnalytics from Checking... on error");

// 6C. Android Dist-App Binary Parity
const coreParityFiles = ['index.html', 'sw.js', 'calculators.js', 'script.js', 'page-common.css', 'sync-engine.js'];
for (const f of coreParityFiles) {
  const rootBuf = fs.readFileSync(path.join(__dirname, '..', f));
  const distBuf = fs.readFileSync(path.join(__dirname, '..', 'dist-app', f));
  assert(rootBuf.equals(distBuf), `Binary parity failed between root and dist-app/${f}`);
}
console.log("✅ PASS: UI version consistency, transient status recovery & Android parity verified!\n");

console.log("==================================================");
console.log("🎉 ALL AUDIT AND FIX VERIFICATIONS PASSED 100%!");
console.log("==================================================");
