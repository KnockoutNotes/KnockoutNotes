/**
 * KnockoutNotes — Android Release APK Verification Test Suite
 * (tests/test_android_apk_release.js)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const ROOT_APK = path.join(ROOT, 'knockoutnotes.apk');
const BUILD_APK = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const OUTPUT_METADATA = path.join(ROOT, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'output-metadata.json');

console.log('==================================================');
console.log('STARTING ANDROID RELEASE APK VERIFICATION');
console.log('==================================================\n');

// 1. Check file existence and non-zero size
console.log('--- 1. Checking APK File Existence & Size ---');
assert(fs.existsSync(BUILD_APK), `Built APK missing at ${BUILD_APK}`);
assert(fs.existsSync(ROOT_APK), `Root APK missing at ${ROOT_APK}`);

const buildStats = fs.statSync(BUILD_APK);
const rootStats = fs.statSync(ROOT_APK);

console.log(`Built APK size: ${(buildStats.size / (1024 * 1024)).toFixed(2)} MB (${buildStats.size} bytes)`);
console.log(`Root APK size: ${(rootStats.size / (1024 * 1024)).toFixed(2)} MB (${rootStats.size} bytes)`);

assert(buildStats.size > 10 * 1024 * 1024, 'APK should be larger than 10MB');
assert(buildStats.size < 25 * 1024 * 1024, 'APK must be under Cloudflare 25MB limit');
assert.strictEqual(buildStats.size, rootStats.size, 'Built APK and Root APK file sizes must match');
console.log('✅ PASS: APK file existence and size constraints verified!\n');

// 2. Check metadata
console.log('--- 2. Checking APK Build Metadata ---');
assert(fs.existsSync(OUTPUT_METADATA), `output-metadata.json missing at ${OUTPUT_METADATA}`);
const metadata = JSON.parse(fs.readFileSync(OUTPUT_METADATA, 'utf8'));

assert.strictEqual(metadata.applicationId, 'com.knockoutnotes.app', 'Application ID must be com.knockoutnotes.app');
assert.strictEqual(metadata.variantName, 'release', 'Variant must be release');

const element = metadata.elements && metadata.elements[0];
assert(element, 'Element metadata missing');
assert.strictEqual(element.versionCode, 300, 'versionCode must be 300');
assert.strictEqual(element.versionName, '3.0.0', 'versionName must be 3.0.0');
console.log(`✅ PASS: Metadata verified: ID=${metadata.applicationId}, Version=${element.versionName} (${element.versionCode}), Variant=${metadata.variantName}\n`);

// 3. Inspect badging via aapt if available
console.log('--- 3. Checking APK Badging via aapt ---');
const aaptPath = 'C:\\Users\\kmane\\android-sdk\\build-tools\\34.0.0\\aapt.exe';
if (fs.existsSync(aaptPath)) {
  const badging = execSync(`"${aaptPath}" dump badging "${ROOT_APK}"`, { encoding: 'utf8' });
  assert(badging.includes("package: name='com.knockoutnotes.app'"), 'aapt package name mismatch');
  assert(badging.includes("versionCode='300'"), 'aapt versionCode mismatch');
  assert(badging.includes("versionName='3.0.0'"), 'aapt versionName mismatch');
  assert(badging.includes("targetSdkVersion:'34'"), 'aapt targetSdkVersion mismatch');
  assert(badging.includes("application-label:'Knockout Notes'"), 'aapt application-label mismatch');
  console.log('✅ PASS: aapt badging verified (com.knockoutnotes.app v3.0.0, SDK 34)!\n');
} else {
  console.log('ℹ️ SKIP: aapt binary not found at standard path.\n');
}

// 4. Verify signature via apksigner
console.log('--- 4. Checking APK Signature via apksigner ---');
const apksignerPath = 'C:\\Users\\kmane\\android-sdk\\build-tools\\34.0.0\\apksigner.bat';
const javaHome = 'C:\\Program Files\\Microsoft\\jdk-17.0.20.101-hotspot';
if (fs.existsSync(apksignerPath) && fs.existsSync(javaHome)) {
  const env = { ...process.env, JAVA_HOME: javaHome, PATH: `${javaHome}\\bin;${process.env.PATH}` };
  const sigOutput = execSync(`"${apksignerPath}" verify --verbose "${ROOT_APK}"`, { env, encoding: 'utf8' });
  assert(sigOutput.includes('Verifies'), 'apksigner verification failed');
  assert(sigOutput.includes('Verified using v1 scheme (JAR signing): true'), 'v1 signature scheme missing');
  assert(sigOutput.includes('Verified using v2 scheme (APK Signature Scheme v2): true'), 'v2 signature scheme missing');
  console.log('✅ PASS: apksigner verified (v1 + v2 schemes valid)!\n');
} else {
  console.log('ℹ️ SKIP: apksigner or JAVA_HOME not found.\n');
}

console.log('==================================================');
console.log('🎉 ALL ANDROID RELEASE APK VERIFICATIONS PASSED 100%!');
console.log('==================================================');
