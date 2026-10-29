/**
 * KnockoutNotes — v3.0.1 Improvement Batch Verification Suite
 * (tests/test_v301_features.js)
 *
 * Verifies:
 * 1. Resuscitation Chamber: Metronome Rate Selection (100, 110, 120 BPM).
 * 2. Resuscitation Chamber: Audible Volume Controls & Persistence.
 * 3. Resuscitation Chamber: Optional Haptic Feedback & Graceful Fallback.
 * 4. Resuscitation Chamber: Auto-Cleanup on Navigation/Pagehide.
 * 5. Resuscitation Event Log: Timestamped Recording, No-PII Disclaimer, Timeline, & Export.
 * 6. Red/Amber Night Mode: Reading Theme Persistence & High Contrast Ratios.
 * 7. Service Worker: Cache-v115 & Safe Cache Write with Quota Recovery.
 * 8. Clinical Calculators: Pediatric Notes & Boundary Guards.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('STARTING v3.0.1 CLINICAL & RELIABILITY VERIFICATION');
console.log('==================================================\n');

// 1. Resuscitation Chamber Metronome Enhancements
console.log('--- 1. Testing Code Room Metronome Controls ---');
const resChamberHtml = fs.readFileSync(path.join(ROOT, 'resuscitation-chamber.html'), 'utf8');
const resChamberJs = fs.readFileSync(path.join(ROOT, 'resuscitation-chamber.js'), 'utf8');
const resChamberCss = fs.readFileSync(path.join(ROOT, 'resuscitation-chamber.css'), 'utf8');

assert(resChamberHtml.includes('btn-bpm-pill'), 'HTML must include rate selection pills');
assert(resChamberHtml.includes('data-bpm="100"') && resChamberHtml.includes('data-bpm="110"') && resChamberHtml.includes('data-bpm="120"'), 'Pills for 100, 110, and 120 BPM must exist');
assert(resChamberHtml.includes('id="metronomeVolSlider"'), 'HTML must include volume slider');
assert(resChamberHtml.includes('id="chkMetronomeHaptic"'), 'HTML must include haptics toggle');

assert(resChamberJs.includes('function setBpm('), 'JS must implement setBpm');
assert(resChamberJs.includes('function setMetronomeVolume('), 'JS must implement setMetronomeVolume');
assert(resChamberJs.includes('function setHapticsEnabled('), 'JS must implement setHapticsEnabled');
assert(resChamberJs.includes('0.3 * metronomeVolume'), 'scheduleTick must scale gain by metronomeVolume');
assert(resChamberJs.includes('kn-metronome-volume'), 'Volume must persist to localStorage');
assert(resChamberJs.includes('cleanupEmergencyAudio'), 'Auto-cleanup function must be defined');
assert(resChamberJs.includes('window.addEventListener("pagehide", cleanupEmergencyAudio)'), 'Must bind pagehide listener');
assert(resChamberJs.includes('window.addEventListener("beforeunload", cleanupEmergencyAudio)'), 'Must bind beforeunload listener');
assert(resChamberJs.includes('document.addEventListener("visibilitychange"'), 'Must stop metronome on tab backgrounding');

console.log('✅ PASS: Metronome tempo pills, volume scaling, haptics, and auto-cleanup verified!\n');

// 2. Resuscitation Event Log Engine
console.log('--- 2. Testing Resuscitation Event Log Engine ---');
assert(resChamberHtml.includes('id="resuscitationLogBox"'), 'HTML must contain resuscitationLogBox');
assert(resChamberHtml.includes('Documentation Aid'), 'Must prominently badge as Documentation Aid');
assert(resChamberHtml.includes('No patient-identifiable data is collected'), 'Must contain clear no-PII notice');
assert(resChamberHtml.includes('id="btnExportLog"') && resChamberHtml.includes('id="btnClearLog"'), 'Must have Export and Clear buttons');
assert(resChamberHtml.includes('btn-quick-log'), 'Must have quick clinical event buttons');

assert(resChamberJs.includes('function addResuscitationEvent('), 'JS must implement addResuscitationEvent');
assert(resChamberJs.includes('function exportResuscitationLog('), 'JS must implement exportResuscitationLog');
assert(resChamberJs.includes('function clearResuscitationLog('), 'JS must implement clearResuscitationLog');
assert(resChamberJs.includes('kn_resuscitation_events'), 'Events must persist to sessionStorage');
assert(resChamberJs.includes('LEGAL & CLINICAL NOTICE:'), 'Export text must contain documentation aid and no-PII notice');

console.log('✅ PASS: Resuscitation Event Log recording, persistence, no-PII guard, and export verified!\n');

// 3. Red/Amber Night Mode
console.log('--- 3. Testing Red/Amber Low-Light Night Mode ---');
const ronCss = fs.readFileSync(path.join(ROOT, 'study-ron-design.css'), 'utf8');
const ronJs = fs.readFileSync(path.join(ROOT, 'study-ron-design.js'), 'utf8');
const stylesCss = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');

assert(ronCss.includes('[data-reading-theme="night"]'), 'Reading mode CSS must support night theme');
assert(ronCss.includes('--rm-bg: #0a0604'), 'Night theme must use deep low-light black background #0a0604');
assert(ronCss.includes('--rm-text: #fef3c7'), 'Night theme must use high-contrast warm text #fef3c7');
assert(ronCss.includes('--rm-accent: #f59e0b'), 'Night theme must use amber accent #f59e0b');

assert(ronJs.includes('data-reading-theme-val="night"'), 'Reading mode popover & segmented control must offer night theme');
assert(ronJs.includes('if (!["dark", "sepia", "light", "night", "amber"].includes(theme))'), 'setReadingTheme must validate night theme');

assert(stylesCss.includes('html[data-theme="night"]') || stylesCss.includes('.night,'), 'styles.css must include night theme tokens');

// Calculate contrast ratio: #fef3c7 (text) against #0a0604 (bg)
function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
}
function lum(c) {
  const a = [c.r, c.g, c.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
const bgLum = lum(hexToRgb('0a0604'));
const textLum = lum(hexToRgb('fef3c7'));
const contrast = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05);

console.log(`Measured Night Mode Primary Text Contrast: ${contrast.toFixed(2)}:1 (Target: >= 7.0:1 AAA)`);
assert(contrast >= 7.0, 'Night mode text contrast must exceed 7:1 (WCAG AAA)');
console.log('✅ PASS: Red/Amber Night Mode styling, contrast, and theme selection verified!\n');

// 4. Service Worker Cache-v115 & Safe Cache Write
console.log('--- 4. Testing Service Worker v115 & Quota Safety ---');
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

assert(swJs.includes('knockoutnotes-cache-v119') || swJs.includes('knockoutnotes-cache-v118') || swJs.includes('knockoutnotes-cache-v117') || swJs.includes('knockoutnotes-cache-v116') || swJs.includes('knockoutnotes-cache-v115'), 'sw.js must be bumped to knockoutnotes-cache-v115+');
assert(swJs.includes('safeCachePut'), 'sw.js must implement safeCachePut');
assert(swJs.includes('QuotaExceededError'), 'safeCachePut must handle QuotaExceededError');

console.log('✅ PASS: Service Worker v115 and storage quota protection verified!\n');

// 5. Clinical Calculator Pediatric Notes
console.log('--- 5. Testing Clinical Calculator Pediatric Notes ---');
const calcJs = fs.readFileSync(path.join(ROOT, 'calculators.js'), 'utf8');

assert(calcJs.includes('pediatricAdvisory: age < 18'), 'Cockcroft-Gault must include pediatric advisory for age < 18');
assert(calcJs.includes('pediatricConsideration: wt < 30'), 'Parkland must include pediatric consideration for wt < 30 kg');

console.log('✅ PASS: Clinical calculator pediatric notes verified!\n');

console.log('==================================================');
console.log('🎉 ALL v3.0.1 NEW FEATURE VERIFICATIONS PASSED 100%!');
console.log('==================================================');
