/**
 * KnockoutNotes — Android Web Asset Packaging Script (scripts/build-android-bundle.js)
 * 
 * Curates and packages all 8 offline-first sections, scripts, styles, models,
 * and vendored libraries into dist-app/ for Capacitor Android compilation.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.resolve(ROOT, 'dist-app');

console.log('[Bundle] Starting Android web asset preparation...');

// Ensure clean destination directory
if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true, force: true });
}
fs.mkdirSync(DEST, { recursive: true });

function copyFile(srcRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(DEST, srcRel);
  if (fs.existsSync(src)) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  } else {
    console.warn(`[Bundle] Warning: File not found: ${srcRel}`);
  }
}

function copyDir(srcRel, filterFn) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(DEST, srcRel);
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcEntry = path.join(src, entry.name);
    const destEntry = path.join(dest, entry.name);
    const relPath = path.join(srcRel, entry.name).replace(/\\/g, '/');

    if (filterFn && !filterFn(relPath)) continue;

    if (entry.isDirectory()) {
      copyDir(relPath, filterFn);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

// 1. Root HTML Pages
const HTML_PAGES = [
  'index.html',
  'study.html',
  'calculators.html',
  'critical-care.html',
  'resuscitation-chamber.html',
  'crisis.html',
  'regional-anaesthesia.html',
  'ventilator.html',
  'notes.html',
  'pearls.html',
  'drugs.html',
  'viva.html',
  'recent-updates.html',
  'resources.html',
  'pricing.html',
  'contact.html',
  'workspace.html',
  'terms-and-conditions.html',
  'privacy-policy.html',
  'refund-policy.html',
  'shipping-policy.html'
];
HTML_PAGES.forEach(copyFile);

// 2. Root CSS Files
const CSS_FILES = [
  'styles.css',
  'page-common.css',
  'mobile-app.css',
  'calculators.css',
  'crisis.css',
  'study.css',
  'study-ron-design.css',
  'workspace.css',
  'ventilator.css',
  'regional.css',
  'resuscitation-chamber.css',
  'library-styles.css',
  'bubble-menu.css',
  'border-glow.css',
  'subscribe-widget.css',
  'policy-common.css',
  'study-annotations.css'
];
CSS_FILES.forEach(copyFile);

// 3. Root JavaScript Engines & Modules
const JS_FILES = [
  'mobile-bridge.js',
  'sync-engine.js',
  'script.js',
  'spa-router.js',
  'kn-site-search.js',
  'page-motion.js',
  'bubble-menu.js',
  'border-glow.js',
  'cf-beacon.js',
  'analytics-config.js',
  'sheet-config.js',
  'content-config.js',
  'content-library.js',
  'spatial-bg.js',
  'spatial-camera.js',
  'spatial-scroll.js',
  'spatial-viewer.js',
  'coffee-bg.js',
  'subscribe-widget.js',
  'calculators.js',
  'advanced-calc-engine.js',
  'advanced-calc-ui.js',
  'abg-engine.js',
  'paeds-chart-engine.js',
  'paeds-pdf-export.js',
  'study-data.js',
  'study-structures.js',
  'study-structures-3d.js',
  'study-molecule-3d.js',
  'study-ui.js',
  'study-ron-design.js',
  'workspace-engine.js',
  'crisis.js',
  'resuscitation-chamber.js',
  'regional-data.js',
  'regional-ui.js',
  'regional-usg.js',
  'regional-3d.js',
  'regional-sono.js',
  'ventilator-data.js',
  'ventilator-scene.js',
  'ventilator-schematics.js',
  'ventilator-ui.js',
  'policy-config.js',
  'study-annotations.js',
  'mcq-engine.js',
  'sw.js'
];
JS_FILES.forEach(copyFile);

// 4. Manifests & Icons
const STATIC_ASSETS = [
  'knockoutnotes_icon.png',
  'knockoutnotes_wordmark.png',
  'manifest.json',
  'manifest-calculators.json'
];
STATIC_ASSETS.forEach(copyFile);

// 5. Vendor Libraries (Three.js, Draco, GSAP, jsPDF)
copyDir('vendor');

// 6. Selected Asset Folders (core 3D models and regional sono-anatomy)
copyDir('assets/models');
copyDir('assets/regional');

// 7. Critical Care Curriculum & MCQ Question Banks
copyDir('criticalCare');

console.log('[Bundle] Successfully assembled Android web distribution in dist-app/');
