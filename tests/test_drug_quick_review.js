// Comprehensive Test Suite for Universal Drug Quick Review Mode
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('KNOCKOUTNOTES — UNIVERSAL DRUG QUICK REVIEW TEST SUITE');
console.log('================================================================\n');

// 1. Mock Browser Environment
global.MutationObserver = class { observe() {} disconnect() {} takeRecords() { return []; } };
global.window = {
  location: { search: '', href: 'https://knockoutnotes.com/study.html?topic=propofol' },
  history: {
    replaceState: (_state, _title, url) => {
      global.window.location.href = url;
      const qIndex = url.indexOf('?');
      global.window.location.search = qIndex !== -1 ? url.slice(qIndex) : '';
    }
  },
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; }
  },
  matchMedia: () => ({ matches: false }),
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.localStorage = global.window.localStorage;
global.document = {
  body: { classList: { contains: () => false, add: () => {}, remove: () => {} } },
  documentElement: { classList: { contains: () => false } },
  getElementById: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, classList: { add: () => {} } }),
  readyState: 'loading'
};

// Load canonical data
require('../study-data.js');
const drugs = window.KN_STUDY.drugs;
assert.strictEqual(drugs.length, 126, 'Should load all 126 canonical drug monographs');
console.log('✅ Test 1: Canonical data source loaded successfully (126 monographs)');

// Load study-ron-design.js
const jsContent = fs.readFileSync(path.join(__dirname, '../study-ron-design.js'), 'utf8');
eval(jsContent);

assert(window.KN_DRUG_REVIEW, 'window.KN_DRUG_REVIEW must be exported');
const {
  getDrugReviewMode,
  setDrugReviewMode,
  getItemSubsections,
  renderDrugQuickReview,
  renderDrugModeToggle
} = window.KN_DRUG_REVIEW;
console.log('✅ Test 2: Universal Drug Quick Review controller API verified');

// Test 3: Default mode for new visitors is 'quick'
window.localStorage.removeItem('kn_drug_mode_pref');
window.location.search = '';
assert.strictEqual(getDrugReviewMode(), 'quick', 'First-time visitors must default to "quick" review mode');
console.log('✅ Test 3: Default mode for first-time visitors is "quick"');

// Test 4: Mode persistence in localStorage
setDrugReviewMode('detailed');
assert.strictEqual(window.localStorage.getItem('kn_drug_mode_pref'), 'detailed', 'localStorage must persist "detailed"');
assert.strictEqual(getDrugReviewMode(), 'detailed', 'getDrugReviewMode must return "detailed"');
setDrugReviewMode('quick');
assert.strictEqual(window.localStorage.getItem('kn_drug_mode_pref'), 'quick', 'localStorage must persist "quick"');
assert.strictEqual(getDrugReviewMode(), 'quick', 'getDrugReviewMode must return "quick"');
console.log('✅ Test 4: Mode preference successfully persisted in localStorage');

// Test 5: URL query parameter override (?mode=detailed or ?mode=quick)
window.location.search = '?topic=propofol&mode=detailed';
assert.strictEqual(getDrugReviewMode(), 'detailed', 'URL ?mode=detailed must take precedence');
window.location.search = '?topic=propofol&mode=quick';
assert.strictEqual(getDrugReviewMode(), 'quick', 'URL ?mode=quick must take precedence');
window.location.search = '?topic=propofol&review=detailed';
assert.strictEqual(getDrugReviewMode(), 'detailed', 'URL ?review=detailed must take precedence');
window.location.search = '';
console.log('✅ Test 5: URL parameter override and deep linking (?mode=... / ?review=...) verified');

// Test 6: Subsection count and IDs in both modes
const propofol = drugs.find(d => d.id === 'propofol');
const quickSubs = getItemSubsections(propofol, 'quick');
const detailedSubs = getItemSubsections(propofol, 'detailed');

assert.strictEqual(quickSubs.length, 15, 'Quick Review must have exactly 15 subsections');
assert.strictEqual(detailedSubs.length, 20, 'Detailed Notes must have 18 subsections + Quick Ref + References');

const EXPECTED_15_IDS = [
  'qr-sec-identity', 'qr-sec-moa', 'qr-sec-dosage', 'qr-sec-time-profile',
  'qr-sec-pk', 'qr-sec-physio', 'qr-sec-indications', 'qr-sec-adverse',
  'qr-sec-contraindications', 'qr-sec-renal-hepatic', 'qr-sec-interactions',
  'qr-sec-monitoring', 'qr-sec-antidote', 'qr-sec-exam-pearls', 'qr-sec-clinical-pearls'
];

EXPECTED_15_IDS.forEach((id, idx) => {
  assert.strictEqual(quickSubs[idx].id, id, `Quick Review subsection ${idx + 1} ID must be ${id}`);
});
console.log('✅ Test 6: Subsection lists and IDs for both modes verified (15 QR / 20 Detailed)');

// Test 7: Mode Toggle Capsule Markup
const quickToggleHTML = renderDrugModeToggle('quick');
assert(quickToggleHTML.includes('kn-drug-mode-container'), 'Toggle must contain kn-drug-mode-container');
assert(quickToggleHTML.includes('kn-mode-quick active'), 'Quick button must be active');
assert(quickToggleHTML.includes('aria-selected="true"'), 'Quick button must have aria-selected="true"');

const detailedToggleHTML = renderDrugModeToggle('detailed');
assert(detailedToggleHTML.includes('kn-mode-detailed active'), 'Detailed button must be active');
console.log('✅ Test 7: Mode toggle capsule markup and ARIA accessibility verified');

// Test 8: Representative monographs verification
const REPRESENTATIVE_DRUGS = [
  'propofol', 'ketamine', 'etomidate', 'rocuronium', 'sugammadex',
  'norepinephrine', 'vasopressin', 'remifentanil', 'dexmedetomidine', 'atracurium'
];

REPRESENTATIVE_DRUGS.forEach(id => {
  const d = drugs.find(x => x.id === id);
  assert(d, `Drug ${id} must exist in database`);
  const qrHTML = renderDrugQuickReview(d);

  // Check all 15 IDs are present in rendered HTML
  EXPECTED_15_IDS.forEach(secId => {
    assert(qrHTML.includes(`id="${secId}"`), `Drug ${d.name} must include section id="${secId}"`);
  });

  // Check no undefined or NaN values in output
  assert(!qrHTML.includes('undefined'), `Drug ${d.name} Quick Review must not contain "undefined"`);
  assert(!qrHTML.includes('NaN'), `Drug ${d.name} Quick Review must not contain "NaN"`);
  assert(qrHTML.includes('kn-qr-summary-matrix'), `Drug ${d.name} must include 4-tile summary matrix`);
  assert(qrHTML.includes('kn-qr-param-grid'), `Drug ${d.name} must include PK parameter grid`);
  assert(qrHTML.includes('kn-qr-antidote-box'), `Drug ${d.name} must include antidote box`);
});
console.log(`✅ Test 8: All ${REPRESENTATIVE_DRUGS.length} representative monographs render complete 15 sections cleanly`);

// Test 9: Complete 126 Drug Monographs Quality & Non-Corruption Audit
let totalRenderedLen = 0;
drugs.forEach((d, i) => {
  const qrHTML = renderDrugQuickReview(d);
  totalRenderedLen += qrHTML.length;
  EXPECTED_15_IDS.forEach(secId => {
    assert(qrHTML.includes(`id="${secId}"`), `Monograph #${i + 1} (${d.id}) missing section ${secId}`);
  });
  assert(!qrHTML.includes('undefined'), `Monograph #${i + 1} (${d.id}) contains "undefined"`);
});
console.log(`✅ Test 9: All 126 drug monographs validated without errors (total QR HTML: ${Math.round(totalRenderedLen / 1024)} KB)`);

// Test 10: CSS File Integrity and Themes
const cssContent = fs.readFileSync(path.join(__dirname, '../study-ron-design.css'), 'utf8');
assert(cssContent.includes('.kn-drug-mode-container'), 'CSS must include .kn-drug-mode-container');
assert(cssContent.includes('.kn-qr-summary-matrix'), 'CSS must include .kn-qr-summary-matrix');
assert(cssContent.includes('.kn-qr-antidote-box'), 'CSS must include .kn-qr-antidote-box');
assert(cssContent.includes('[data-reading-theme="sepia"] .kn-drug-mode-toggle'), 'CSS must support sepia theme');
assert(cssContent.includes('body:not(.dark) .kn-drug-mode-toggle'), 'CSS must support light theme');
assert(cssContent.includes('@media (max-width: 640px)'), 'CSS must include responsive mobile rules');
console.log('✅ Test 10: CSS styling, theme support (light/dark/sepia), and responsive breakpoints verified');

// Test 11: Binary Parity Between Root and dist-app
const rootJs = fs.readFileSync(path.join(__dirname, '../study-ron-design.js'), 'utf8');
const distJs = fs.readFileSync(path.join(__dirname, '../dist-app/study-ron-design.js'), 'utf8');
const rootCss = fs.readFileSync(path.join(__dirname, '../study-ron-design.css'), 'utf8');
const distCss = fs.readFileSync(path.join(__dirname, '../dist-app/study-ron-design.css'), 'utf8');

assert.strictEqual(rootJs, distJs, 'study-ron-design.js must have 100% binary parity with dist-app/');
assert.strictEqual(rootCss, distCss, 'study-ron-design.css must have 100% binary parity with dist-app/');
console.log('✅ Test 11: 100% binary parity between root and dist-app/ confirmed');

console.log('\n================================================================');
console.log('ALL 11 AUTOMATED VERIFICATION SUITES PASSED (100% SUCCESS)');
console.log('================================================================');
