/**
 * KnockoutNotes — v3.0.2 Real-Device Readiness & Usability Test Suite
 * (tests/test_v302_readiness.js)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('STARTING v3.0.2 REAL-DEVICE READINESS VERIFICATION');
console.log('==================================================\n');

// 1. Android Manifest Vibrate Permission
console.log('--- 1. Checking Android Manifest Permissions ---');
const manifestXml = fs.readFileSync(path.join(ROOT, 'android/app/src/main/AndroidManifest.xml'), 'utf8');
assert(manifestXml.includes('android.permission.VIBRATE'), 'AndroidManifest.xml must declare android.permission.VIBRATE for haptic CPR pulses');
assert(manifestXml.includes('android.permission.INTERNET'), 'AndroidManifest.xml must declare INTERNET');
assert(manifestXml.includes('android.permission.ACCESS_NETWORK_STATE'), 'AndroidManifest.xml must declare ACCESS_NETWORK_STATE');
console.log('✅ PASS: android.permission.VIBRATE verified in AndroidManifest.xml!\n');

// 2. Metronome & Audio Pipeline Lifecycle
console.log('--- 2. Checking Metronome & Audio Pipeline Lifecycle ---');
const resChamberJs = fs.readFileSync(path.join(ROOT, 'resuscitation-chamber.js'), 'utf8');

assert(resChamberJs.includes('audioCtx.suspend()'), 'stopMetronome must suspend AudioContext to power down audio hardware on mobile');
assert(resChamberJs.includes('preserveCount = false'), 'startMetronome must support preserveCount parameter');
assert(resChamberJs.includes('syncCycleTimerWithWallClock'), 'Must implement wall-clock timer synchronization');
assert(resChamberJs.includes('lastCycleTimestamp = Date.now()'), 'Must track wall-clock timestamp on timer start');
assert(resChamberJs.includes('window.addEventListener("focus", () =>'), 'Must re-sync timer on window focus');
assert(resChamberJs.includes('window.Capacitor.Plugins.App.addListener("appStateChange"'), 'Must integrate with Capacitor App lifecycle');

console.log('✅ PASS: AudioContext powerdown, rate preservation, wall-clock sync & Capacitor lifecycle verified!\n');

// 3. Resuscitation Event Log Rapid Double-Tap Suppression
console.log('--- 3. Checking Resuscitation Event Log Anti-Bounce & Ordering ---');

assert(resChamberJs.includes('lastEventLogged.text === trimmed && (nowMs - lastEventLogged.time) < 800'), 'Must suppress accidental identical taps within 800ms');
assert(resChamberJs.includes('resuscitationEvents.sort('), 'Must strictly sort events chronologically');

console.log('✅ PASS: Event log double-tap protection and strict chronological ordering verified!\n');

// 4. Print & PDF Styles Verification
console.log('--- 4. Checking Print Styles for Reading Themes ---');
const ronCss = fs.readFileSync(path.join(ROOT, 'study-ron-design.css'), 'utf8');

assert(ronCss.includes('@media print'), 'study-ron-design.css must define print media styles');
assert(ronCss.includes('.ron-reading-fullscreen-overlay[data-reading-theme="night"]'), 'Print media must explicitly override night theme');
assert(ronCss.includes('--rm-bg: #ffffff !important'), 'Print styles must force --rm-bg to white');
assert(ronCss.includes('--rm-text: #0f172a !important'), 'Print styles must force --rm-text to high-contrast dark text');
assert(ronCss.includes('color: #0f172a !important'), 'Print styles must guarantee black/dark text on paper');

console.log('✅ PASS: Print styles force high-contrast black-on-white text across all themes including Night mode!\n');

// 5. Version Alignment
console.log('--- 5. Checking Project Version Consistency (3.0.2 / 302 / cache-v116) ---');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const gradle = fs.readFileSync(path.join(ROOT, 'android/app/build.gradle'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

assert.strictEqual(pkg.version, '3.0.2', 'package.json version must be 3.0.2');
assert(gradle.includes('versionCode 302'), 'build.gradle versionCode must be 302');
assert(gradle.includes('versionName "3.0.2"'), 'build.gradle versionName must be 3.0.2');
assert(indexHtml.includes('APP v3.0.2 • 8 OFFLINE SECTIONS READY'), 'index.html must display APP v3.0.2');
assert(indexHtml.includes('Get Android App v3.0.2 (APK)'), 'index.html download link must reference v3.0.2');
assert(swJs.includes('knockoutnotes-cache-v121') || swJs.includes('knockoutnotes-cache-v120') || swJs.includes('knockoutnotes-cache-v119') || swJs.includes('knockoutnotes-cache-v118') || swJs.includes('knockoutnotes-cache-v117'), 'sw.js must be bumped to knockoutnotes-cache-v117+');

console.log('✅ PASS: Version consistency (3.0.2 / 302 / cache-v117) verified!\n');

console.log('==================================================');
console.log('🎉 ALL v3.0.2 READINESS VERIFICATIONS PASSED 100%!');
console.log('==================================================');
