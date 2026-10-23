/**
 * KnockoutNotes — Android Web Asset Packaging Script (scripts/build-android-bundle.js)
 * 
 * Curates and packages all offline-first sections, scripts, styles, models,
 * and vendored libraries into dist-app/ for Capacitor Android compilation.
 * 
 * Modes:
 *   node scripts/build-android-bundle.js         -> Staged, validated atomic generation with rollback
 *   node scripts/build-android-bundle.js --check -> Read-only verification of dist-app parity
 *   node scripts/build-android-bundle.js --force-clean-recovery -> Cleans unrecovered backup before build
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.resolve(ROOT, 'dist-app');
const STAGE = path.resolve(ROOT, 'scratch', '.dist-app-staging');
const BACKUP = path.resolve(ROOT, 'scratch', '.dist-app-backup');

// Maximum uncompressed size budget for offline web bundle (~32 MiB, keeping final compiled APK < 24 MB)
const MAX_BUNDLE_BYTES = 32 * 1024 * 1024;

// 1. Root HTML Pages (22 files)
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
  'receipt.html',
  'terms-and-conditions.html',
  'privacy-policy.html',
  'refund-policy.html',
  'shipping-policy.html'
];

// 2. Root CSS Files (19 files)
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
  'study-annotations.css',
  'mcq-platform.css',
  'critical-care-curriculum.css'
];

// 3. Root JavaScript Engines & Modules (50 files)
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
  'critical-care-curriculum.js',
  'payments-client.js',
  'invoice-generator.js',
  'sw.js'
];

// 4. Manifests, Recalls & Icons (9 files)
const STATIC_ASSETS = [
  'knockoutnotes_icon.png',
  'knockoutnotes_icon-72.png',
  'knockoutnotes_wordmark.png',
  'manifest.json',
  'manifest-calculators.json',
  'NEET_SS_2024_Critical_Care_Recall_Consolidated.json',
  'NEET_SS_2025_Critical_Care_Recall_V03.json',
  'INI_SS_CC_NOV_2025_Recall.json',
  'INI_CET_SS_2026_Critical_Care_PYQs.json'
];

// 5. Curated Directory Trees (vendor libs, 3D models, regional ultrasound)
const ASSET_DIRS = [
  'vendor',
  'assets/models',
  'assets/regional'
];

function collectDirFiles(dirRel) {
  const dirAbs = path.join(ROOT, dirRel);
  const results = [];
  if (!fs.existsSync(dirAbs)) return results;

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const rel = path.relative(ROOT, fullPath).replace(/\\/g, '/');
        results.push(rel);
      }
    }
  }

  walk(dirAbs);
  return results;
}

function getAllExpectedFiles() {
  const all = [
    ...HTML_PAGES,
    ...CSS_FILES,
    ...JS_FILES,
    ...STATIC_ASSETS
  ];
  for (const dir of ASSET_DIRS) {
    all.push(...collectDirFiles(dir));
  }
  return all.sort();
}

/**
 * Safely moves src to dst.
 * Prefers atomic fs.renameSync.
 * If rename fails (e.g. cross-volume, EXDEV, or Windows file-handle contention),
 * falls back to copying into a temporary sibling directory first, validating,
 * and then swapping, ensuring that a failed copy never leaves a partial/corrupt destination.
 */
function safeMove(src, dst) {
  if (!fs.existsSync(src)) return false;

  const forceFallback = process.env.__KN_FORCE_MOVE_FALLBACK === '1';

  if (!forceFallback) {
    try {
      fs.renameSync(src, dst);
      return true;
    } catch (renameErr) {
      // Fall through to staged copy fallback on Windows rename/handle errors
    }
  }

  // Staged copy fallback:
  // Copy into a unique temporary directory first to guarantee a failed copy cannot leave a partial destination
  const copyTmp = path.join(path.dirname(dst), `.copy-tmp-${Date.now()}-${Math.floor(Math.random() * 10000)}`);
  try {
    if (fs.existsSync(copyTmp)) {
      fs.rmSync(copyTmp, { recursive: true, force: true });
    }
    fs.cpSync(src, copyTmp, { recursive: true });

    // Injection hook for testing fallback copy failure
    if (process.env.__KN_INJECT_FALLBACK_COPY_FAILURE === '1') {
      throw new Error('Simulated fallback copy failure');
    }

    if (fs.existsSync(dst)) {
      fs.rmSync(dst, { recursive: true, force: true });
    }
    fs.renameSync(copyTmp, dst);
    fs.rmSync(src, { recursive: true, force: true });
    return true;
  } catch (copyErr) {
    if (fs.existsSync(copyTmp)) {
      try { fs.rmSync(copyTmp, { recursive: true, force: true }); } catch (_) {}
    }
    throw copyErr;
  }
}

function checkParity() {
  console.log('[Bundle Check] Verifying dist-app/ parity against canonical root sources...');
  if (!fs.existsSync(DEST)) {
    console.error(`[Bundle Check Error] Destination directory does not exist: ${DEST}`);
    process.exit(1);
  }

  const expectedFiles = getAllExpectedFiles();
  const missingInDist = [];
  const mismatchedFiles = [];

  for (const rel of expectedFiles) {
    const srcPath = path.join(ROOT, rel);
    const distPath = path.join(DEST, rel);

    if (!fs.existsSync(srcPath)) {
      console.error(`[Bundle Check Error] Canonical source file missing in root: ${rel}`);
      process.exit(1);
    }
    if (!fs.existsSync(distPath)) {
      missingInDist.push(rel);
      continue;
    }

    const srcBuf = fs.readFileSync(srcPath);
    const distBuf = fs.readFileSync(distPath);
    if (!srcBuf.equals(distBuf)) {
      mismatchedFiles.push(rel);
    }
  }

  // Check for unexpected extraneous files in dist-app
  const actualDistFiles = [];
  function walkDist(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walkDist(fullPath);
      } else if (entry.isFile()) {
        actualDistFiles.push(path.relative(DEST, fullPath).replace(/\\/g, '/'));
      }
    }
  }
  walkDist(DEST);

  const unexpectedInDist = actualDistFiles.filter(f => !expectedFiles.includes(f));

  if (missingInDist.length > 0 || mismatchedFiles.length > 0 || unexpectedInDist.length > 0) {
    console.error(`[Bundle Check FAILED] dist-app/ is out of sync with root sources!`);
    if (missingInDist.length > 0) {
      console.error(`  Missing in dist-app (${missingInDist.length}):`, missingInDist);
    }
    if (mismatchedFiles.length > 0) {
      console.error(`  Content mismatch (${mismatchedFiles.length}):`, mismatchedFiles);
    }
    if (unexpectedInDist.length > 0) {
      console.error(`  Unexpected extraneous files (${unexpectedInDist.length}):`, unexpectedInDist);
    }
    process.exit(1);
  }

  const totalBytes = actualDistFiles.reduce((sum, f) => sum + fs.statSync(path.join(DEST, f)).size, 0);
  const mib = (totalBytes / (1024 * 1024)).toFixed(2);
  const mb = (totalBytes / 1000000).toFixed(2);
  console.log(`[Bundle Check PASS] 100% binary parity verified: ${expectedFiles.length} files, ${mib} MiB (${mb} MB) in dist-app/.`);
  process.exit(0);
}

function buildBundle() {
  console.log('[Bundle] Starting Android web asset preparation...');

  // Step 0: Detect unresolved recovery backup from prior failure
  if (fs.existsSync(BACKUP)) {
    if (process.argv.includes('--force-clean-recovery')) {
      console.warn(`[Bundle Warning] Removing unresolved recovery backup at ${BACKUP} due to explicit --force-clean-recovery flag.`);
      fs.rmSync(BACKUP, { recursive: true, force: true });
    } else {
      console.error(`[Bundle Safety Error] Unresolved recovery backup detected at: ${BACKUP}`);
      console.error('A previous build may have failed during promotion or rollback.');
      console.error('To protect potentially recoverable artifacts, this script will not automatically overwrite or delete this backup.');
      console.error('Please inspect and manually restore or remove the backup directory before proceeding (or pass --force-clean-recovery).');
      process.exit(1);
    }
  }

  // Step 1: Pre-flight validation of all root sources (Zero destruction before validation)
  const expectedFiles = getAllExpectedFiles();
  const missingSources = expectedFiles.filter(f => !fs.existsSync(path.join(ROOT, f)));
  if (missingSources.length > 0) {
    console.error(`[Bundle Error] Cannot build bundle: ${missingSources.length} canonical source files missing in root:`);
    for (const m of missingSources) {
      console.error(`  - ${m}`);
    }
    process.exit(1);
  }

  // Step 2: Clean and prepare staging directory
  if (fs.existsSync(STAGE)) {
    fs.rmSync(STAGE, { recursive: true, force: true });
  }
  fs.mkdirSync(STAGE, { recursive: true });

  try {
    // Step 3: Copy all files into STAGE
    let copiedCount = 0;
    let totalBytes = 0;

    for (const rel of expectedFiles) {
      const srcPath = path.join(ROOT, rel);
      const stagePath = path.join(STAGE, rel);

      fs.mkdirSync(path.dirname(stagePath), { recursive: true });
      fs.copyFileSync(srcPath, stagePath);

      const stat = fs.statSync(stagePath);
      if (stat.size === 0 && !rel.endsWith('LICENSE') && !rel.endsWith('README.txt')) {
        throw new Error(`Copied file is unexpectedly empty: ${rel}`);
      }
      copiedCount++;
      totalBytes += stat.size;
    }

    // Step 4: Verify budget constraints
    if (totalBytes > MAX_BUNDLE_BYTES) {
      const mib = (totalBytes / (1024 * 1024)).toFixed(2);
      const maxMib = (MAX_BUNDLE_BYTES / (1024 * 1024)).toFixed(2);
      throw new Error(`Bundle size ${mib} MiB (${(totalBytes / 1e6).toFixed(2)} MB) exceeds maximum threshold of ${maxMib} MiB`);
    }

    // Step 5: Promotion with rollback capability
    // If an existing dist-app/ exists, back it up first to scratch/.dist-app-backup.
    // If promotion fails (or is interrupted by a recoverable error), rollback restores the backup.
    const hadExistingDest = fs.existsSync(DEST);
    if (hadExistingDest) {
      try {
        safeMove(DEST, BACKUP);
      } catch (backupErr) {
        throw new Error(`Failed to create backup of existing dist-app/ before promotion: ${backupErr.message}`);
      }
    }

    try {
      // Failure injection hook for automated testing of rollback safety
      if (process.env.__KN_INJECT_PROMOTION_FAILURE === '1' || process.env.__KN_INJECT_ROLLBACK_FAILURE === '1') {
        throw new Error('Simulated promotion failure for rollback testing');
      }

      safeMove(STAGE, DEST);

      // Promotion succeeded: cleanup backup and staging
      if (fs.existsSync(BACKUP)) {
        try { fs.rmSync(BACKUP, { recursive: true, force: true }); } catch (cleanupErr) {
          console.warn(`[Bundle Warning] Could not remove backup after successful promotion: ${cleanupErr.message}`);
        }
      }
      if (fs.existsSync(STAGE)) {
        try { fs.rmSync(STAGE, { recursive: true, force: true }); } catch (_) {}
      }

    } catch (promoErr) {
      console.error(`[Bundle Error] Promotion step failed: ${promoErr.message}`);

      if (hadExistingDest && fs.existsSync(BACKUP)) {
        console.warn('[Bundle Rollback] Attempting to restore previous valid dist-app/ from backup...');
        try {
          // Failure injection hook for automated testing of rollback restoration failure
          if (process.env.__KN_INJECT_ROLLBACK_FAILURE === '1') {
            throw new Error('Simulated rollback restoration failure');
          }

          // If a partial/corrupted DEST exists, quarantine it instead of blindly deleting
          if (fs.existsSync(DEST)) {
            const quarantineDir = path.resolve(ROOT, 'scratch', `.dist-app-quarantine-${Date.now()}`);
            try {
              safeMove(DEST, quarantineDir);
              console.warn(`[Bundle Rollback] Moved corrupted/partial destination to quarantine at: ${quarantineDir}`);
            } catch (qErr) {
              console.error(`[Bundle Rollback Error] Could not quarantine destination: ${qErr.message}`);
              try { fs.rmSync(DEST, { recursive: true, force: true }); } catch (_) {}
            }
          }

          safeMove(BACKUP, DEST);
          console.warn('[Bundle Rollback] Rollback successful: previous valid dist-app/ restored intact.');
        } catch (rollbackErr) {
          console.error(`[Bundle Rollback CRITICAL] Automatic restoration failed: ${rollbackErr.message}`);
          console.error(`[Bundle Rollback CRITICAL] PRESERVED RECOVERY ARTIFACTS:`);
          console.error(`  - Original Backup: ${BACKUP}`);
          if (fs.existsSync(STAGE)) {
            console.error(`  - Staging Artifact: ${STAGE}`);
          }
          console.error(`[Bundle Rollback] Please inspect or restore ${BACKUP} manually.`);
          throw new Error(`Promotion failed (${promoErr.message}) AND Rollback failed (${rollbackErr.message})`);
        }
      }

      // Re-throw to be caught by outer handler
      throw promoErr;
    }

    const mib = (totalBytes / (1024 * 1024)).toFixed(2);
    const mb = (totalBytes / 1000000).toFixed(2);
    console.log(`[Bundle] Successfully assembled ${copiedCount} files (${mib} MiB / ${mb} MB) into dist-app/`);
    process.exit(0);

  } catch (err) {
    console.error(`[Bundle Error] Build failed: ${err.message}`);
    // If BACKUP exists (i.e. restoration failed), preserve STAGE as well for manual recovery
    if (fs.existsSync(STAGE) && !fs.existsSync(BACKUP)) {
      try { fs.rmSync(STAGE, { recursive: true, force: true }); } catch (_) {}
    }
    process.exit(1);
  }
}

if (process.argv.includes('--check')) {
  checkParity();
} else {
  buildBundle();
}
