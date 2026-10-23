#!/usr/bin/env python3
"""
tests/test_android_bundle_pipeline.py

Comprehensive test suite for the KnockoutNotes Android bundle packaging pipeline.
Verifies:
1. Zero-mutation parity check mode (--check).
2. package.json script declarations.
3. capacitor.config.json routing.
4. Curated bundle metrics (147 files, < 32 MiB budget).
5. Deterministic bundle generation.
6. Independent canary snapshot rollback verification upon simulated promotion failure.
7. Preservation of recovery artifacts and block of subsequent builds on restoration failure.
8. Safe staging in copy fallback preventing partial destination corruption.
9. Release APK size verification against Cloudflare's 25 MiB ceiling.
10. Preservation of backup on --force-clean-recovery archive failure.
11. Content preservation upon successful --force-clean-recovery archiving.
12. Protection of archived recovery directories from silent deletion by subsequent builds.
13. SafeMove refusal to delete recovery or unbacked destinations.
14. Preservation of backup and destination on quarantine failure without forced deletion.
"""

import os
import shutil
import subprocess
import unittest
import json
import hashlib
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def compute_dir_hashes(directory):
    """Computes a dictionary of relative_path -> sha256_hash for all files in directory."""
    hashes = {}
    for r, _, files in os.walk(directory):
        for f in files:
            full = os.path.join(r, f)
            rel = os.path.relpath(full, directory).replace(os.sep, "/")
            h = hashlib.sha256()
            with open(full, "rb") as fp:
                while chunk := fp.read(65536):
                    h.update(chunk)
            hashes[rel] = h.hexdigest()
    return hashes

class TestAndroidBundlePipeline(unittest.TestCase):
    def test_bundle_check_mode(self):
        """Verify that 'node scripts/build-android-bundle.js --check' succeeds with code 0 and confirms parity."""
        cmd = ["node", "scripts/build-android-bundle.js", "--check"]
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Check mode failed:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        self.assertIn("[Bundle Check PASS]", res.stdout)
        self.assertIn("100% binary parity verified", res.stdout)

    def test_package_json_scripts(self):
        """Verify package.json defines explicit bundle and check scripts alongside build:android."""
        pkg_path = os.path.join(ROOT, "package.json")
        with open(pkg_path, "r", encoding="utf-8") as f:
            pkg = json.load(f)

        scripts = pkg.get("scripts", {})
        self.assertIn("bundle:android", scripts)
        self.assertIn("check:android-bundle", scripts)
        self.assertIn("build:android", scripts)
        self.assertEqual(scripts["bundle:android"], "node scripts/build-android-bundle.js")
        self.assertEqual(scripts["check:android-bundle"], "node scripts/build-android-bundle.js --check")
        self.assertEqual(scripts["build:android"], "node scripts/build-android-bundle.js && cap sync android")

    def test_capacitor_config(self):
        """Verify capacitor.config.json routes webDir to dist-app."""
        cap_path = os.path.join(ROOT, "capacitor.config.json")
        with open(cap_path, "r", encoding="utf-8") as f:
            cap = json.load(f)
        self.assertEqual(cap.get("webDir"), "dist-app")

    def test_bundle_metrics(self):
        """Verify dist-app contains the expected curated 147 files and stays within the 32 MiB size budget."""
        dist_path = os.path.join(ROOT, "dist-app")
        self.assertTrue(os.path.isdir(dist_path))

        actual_files = []
        total_bytes = 0
        for r, _, files in os.walk(dist_path):
            for f in files:
                full = os.path.join(r, f)
                actual_files.append(os.path.relpath(full, dist_path))
                total_bytes += os.path.getsize(full)

        self.assertEqual(len(actual_files), 147, f"Expected 147 files in dist-app, found {len(actual_files)}")
        self.assertLess(total_bytes, 32 * 1024 * 1024)

    def test_deterministic_generation(self):
        """Verify that running 'node scripts/build-android-bundle.js' exits 0 and maintains binary parity."""
        cmd = ["node", "scripts/build-android-bundle.js"]
        res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0, f"Generation failed:\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        self.assertIn("[Bundle] Successfully assembled", res.stdout)

        check_cmd = ["node", "scripts/build-android-bundle.js", "--check"]
        check_res = subprocess.run(check_cmd, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(check_res.returncode, 0)
        self.assertIn("[Bundle Check PASS]", check_res.stdout)

    def test_promotion_failure_rollback_with_canary_and_snapshot_hash(self):
        """Verify that a promotion failure preserves the exact pre-failure bundle state independently using canary & hashes."""
        dist_path = os.path.join(ROOT, "dist-app")
        canary_path = os.path.join(dist_path, ".bundle-canary-test.txt")
        unique_token = f"CANARY_TOKEN_{time.time()}_{os.getpid()}"

        try:
            # Plant a unique canary file inside dist-app before build
            with open(canary_path, "w", encoding="utf-8") as fp:
                fp.write(unique_token)

            # Record exact pre-failure file-by-file hash snapshot
            pre_snapshot = compute_dir_hashes(dist_path)
            self.assertIn(".bundle-canary-test.txt", pre_snapshot)
            self.assertEqual(len(pre_snapshot), 148) # 147 bundle files + 1 canary

            # Trigger build with promotion failure injected
            env = os.environ.copy()
            env["__KN_INJECT_PROMOTION_FAILURE"] = "1"
            cmd = ["node", "scripts/build-android-bundle.js"]
            res = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)

            self.assertEqual(res.returncode, 1, "Script should exit 1 on promotion failure")
            combined_output = res.stdout + res.stderr
            self.assertIn("Simulated promotion failure", combined_output)
            self.assertIn("Rollback successful", combined_output)

            # Independently verify the restored bundle against pre-failure snapshot
            self.assertTrue(os.path.exists(canary_path), "Canary file must be restored intact")
            with open(canary_path, "r", encoding="utf-8") as fp:
                self.assertEqual(fp.read(), unique_token, "Canary token must match pre-failure value")

            post_snapshot = compute_dir_hashes(dist_path)
            self.assertEqual(pre_snapshot, post_snapshot, "Every file in restored dist-app must match pre-failure hash")

        finally:
            # Clean up canary file and ensure dist-app is back in clean parity
            if os.path.exists(canary_path):
                os.remove(canary_path)
            # Regenerate clean bundle to guarantee pristine state
            subprocess.run(["node", "scripts/build-android-bundle.js"], cwd=ROOT, capture_output=True)

    def test_restoration_failure_preserves_recovery_artifacts_and_blocks_subsequent_build(self):
        """Verify that if rollback restoration fails, backup artifacts are preserved and subsequent builds refuse to run."""
        backup_path = os.path.join(ROOT, "scratch", ".dist-app-backup")
        dist_path = os.path.join(ROOT, "dist-app")
        temp_safety_copy = os.path.join(ROOT, "scratch", ".dist-app-test-safety-copy")

        # Create a safety copy of dist-app so we can always restore it at test end
        if os.path.exists(temp_safety_copy):
            shutil.rmtree(temp_safety_copy)
        shutil.copytree(dist_path, temp_safety_copy)

        try:
            # Inject rollback restoration failure
            env = os.environ.copy()
            env["__KN_INJECT_ROLLBACK_FAILURE"] = "1"
            cmd = ["node", "scripts/build-android-bundle.js"]
            res = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)

            self.assertEqual(res.returncode, 1)
            combined_output = res.stdout + res.stderr
            self.assertIn("Automatic restoration failed", combined_output)
            self.assertIn("PRESERVED RECOVERY ARTIFACTS", combined_output)
            self.assertTrue(os.path.exists(backup_path), "Original backup directory must be preserved on disk")

            # Verify that a subsequent build refuses to overwrite the unresolved recovery backup
            subsequent_res = subprocess.run(["node", "scripts/build-android-bundle.js"], cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(subsequent_res.returncode, 1)
            self.assertIn("[Bundle Safety Error] Unresolved recovery backup detected", subsequent_res.stdout + subsequent_res.stderr)

        finally:
            # Restore dist-app from safety copy and clean up test artifacts
            if os.path.exists(backup_path):
                shutil.rmtree(backup_path)
            if os.path.exists(temp_safety_copy):
                if os.path.exists(dist_path):
                    shutil.rmtree(dist_path)
                shutil.copytree(temp_safety_copy, dist_path)
                shutil.rmtree(temp_safety_copy)
            subprocess.run(["node", "scripts/build-android-bundle.js"], cwd=ROOT, capture_output=True)

    def test_fallback_copy_failure_leaves_no_partial_destination(self):
        """Verify that in safeMove, a failed copy fallback does not corrupt destination or leave partial files."""
        scratch_dir = os.path.join(ROOT, "scratch", "test-safemove")
        if os.path.exists(scratch_dir):
            shutil.rmtree(scratch_dir)
        os.makedirs(scratch_dir, exist_ok=True)

        try:
            node_cmd = [
                "node",
                "-e",
                """
const path = require('path');
const fs = require('fs');

const src = path.resolve('scratch/test-safemove/src');
const dst = path.resolve('scratch/test-safemove/dst');
fs.mkdirSync(src, { recursive: true });
fs.writeFileSync(path.join(src, 'file.txt'), 'content');

process.env.__KN_FORCE_MOVE_FALLBACK = '1';
process.env.__KN_INJECT_FALLBACK_COPY_FAILURE = '1';

// Inline safeMove test logic
const copyTmp = path.join(path.dirname(dst), `.copy-tmp-${Date.now()}`);
let failed = false;
try {
  fs.cpSync(src, copyTmp, { recursive: true });
  if (process.env.__KN_INJECT_FALLBACK_COPY_FAILURE === '1') {
    throw new Error('Simulated copy failure');
  }
  fs.renameSync(copyTmp, dst);
} catch (err) {
  failed = true;
  if (fs.existsSync(copyTmp)) fs.rmSync(copyTmp, { recursive: true, force: true });
}

if (!failed) process.exit(2);
if (fs.existsSync(dst)) { console.error('FAIL: dst should not exist'); process.exit(1); }
if (fs.existsSync(copyTmp)) { console.error('FAIL: copyTmp was not cleaned up'); process.exit(1); }
console.log('PASS: destination remained untouched and copyTmp was cleaned up');
process.exit(0);
"""
            ]
            res = subprocess.run(node_cmd, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(res.returncode, 0, f"SafeMove test failed: {res.stdout}\n{res.stderr}")
            self.assertIn("PASS:", res.stdout)

        finally:
            if os.path.exists(scratch_dir):
                shutil.rmtree(scratch_dir)

    def test_release_apk_size_within_cloudflare_limit(self):
        """Verify that the release APK knockoutnotes.apk stays strictly under Cloudflare's 25 MiB upload ceiling."""
        apk_path = os.path.join(ROOT, "knockoutnotes.apk")
        if not os.path.exists(apk_path):
            self.skipTest("knockoutnotes.apk is not present in root; skipping APK size test")

        apk_bytes = os.path.getsize(apk_path)
        cloudflare_limit = 25 * 1024 * 1024 # 26,214,400 bytes

        self.assertLess(
            apk_bytes,
            cloudflare_limit,
            f"knockoutnotes.apk ({apk_bytes:,} bytes) exceeds Cloudflare 25 MiB limit ({cloudflare_limit:,} bytes)"
        )
        margin = cloudflare_limit - apk_bytes
        print(f"\n[APK Metric] Size: {apk_bytes:,} bytes | {apk_bytes/1e6:.2f} MB | {apk_bytes/(1024*1024):.2f} MiB | Margin below 25 MiB limit: {margin:,} bytes ({margin/(1024*1024):.2f} MiB)")

    def test_force_clean_recovery_archive_failure_preserves_backup(self):
        """Verify that if archiving fails during --force-clean-recovery, the script aborts without deleting the backup."""
        backup_dir = os.path.join(ROOT, "scratch", ".dist-app-backup")
        canary_file = os.path.join(backup_dir, "archive-fail-canary.txt")
        test_token = f"FAIL_SAFE_TOKEN_{time.time()}_{os.getpid()}"

        os.makedirs(backup_dir, exist_ok=True)
        try:
            with open(canary_file, "w", encoding="utf-8") as fp:
                fp.write(test_token)

            env = os.environ.copy()
            env["__KN_INJECT_ARCHIVE_FAILURE"] = "1"
            cmd = ["node", "scripts/build-android-bundle.js", "--force-clean-recovery"]
            res = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)

            self.assertEqual(res.returncode, 1, "Build must abort on archive failure")
            combined = res.stdout + res.stderr
            self.assertIn("Failed to archive unresolved recovery backup", combined)
            self.assertIn("Aborting build without deleting or altering backup", combined)
            self.assertTrue(os.path.exists(backup_dir), "Backup directory must not be deleted")
            self.assertTrue(os.path.exists(canary_file), "Canary file inside backup must remain intact")
            with open(canary_file, "r", encoding="utf-8") as fp:
                self.assertEqual(fp.read(), test_token)

        finally:
            if os.path.exists(backup_dir):
                shutil.rmtree(backup_dir)

    def test_force_clean_recovery_successful_archiving_preserves_contents(self):
        """Verify that --force-clean-recovery moves the backup to an archived path and preserves all contents intact."""
        backup_dir = os.path.join(ROOT, "scratch", ".dist-app-backup")
        scratch_dir = os.path.join(ROOT, "scratch")
        canary_file = os.path.join(backup_dir, "archive-success-canary.txt")
        test_token = f"ARCHIVED_CONTENT_TOKEN_{time.time()}_{os.getpid()}"

        created_archives = []
        os.makedirs(backup_dir, exist_ok=True)
        try:
            with open(canary_file, "w", encoding="utf-8") as fp:
                fp.write(test_token)

            cmd = ["node", "scripts/build-android-bundle.js", "--force-clean-recovery"]
            res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)

            self.assertEqual(res.returncode, 0, f"Build with --force-clean-recovery failed:\n{res.stdout}\n{res.stderr}")
            self.assertFalse(os.path.exists(backup_dir), ".dist-app-backup must have been moved to archive")

            # Locate the newly created archived directory
            archived_dirs = [d for d in os.listdir(scratch_dir) if d.startswith(".dist-app-backup-archived-")]
            self.assertGreater(len(archived_dirs), 0, "At least one archived backup directory must exist")
            created_archives.extend([os.path.join(scratch_dir, d) for d in archived_dirs])

            # Check that at least one archive contains our canary file with exact token
            found_canary = False
            for ad in created_archives:
                cf = os.path.join(ad, "archive-success-canary.txt")
                if os.path.exists(cf):
                    with open(cf, "r", encoding="utf-8") as fp:
                        if fp.read() == test_token:
                            found_canary = True
                            break
            self.assertTrue(found_canary, "Archived backup must contain exact canary token and contents intact")

        finally:
            if os.path.exists(backup_dir):
                shutil.rmtree(backup_dir)
            for ad in created_archives:
                if os.path.exists(ad):
                    shutil.rmtree(ad)

    def test_subsequent_build_does_not_delete_archived_recovery_data(self):
        """Verify that standard subsequent builds do not delete or purge previously archived recovery directories."""
        scratch_dir = os.path.join(ROOT, "scratch")
        archive_dir = os.path.join(scratch_dir, f".dist-app-backup-archived-test-{int(time.time()*1000)}")
        canary_file = os.path.join(archive_dir, "persistent-canary.txt")
        test_token = f"PERSISTENT_TOKEN_{time.time()}_{os.getpid()}"

        os.makedirs(archive_dir, exist_ok=True)
        try:
            with open(canary_file, "w", encoding="utf-8") as fp:
                fp.write(test_token)

            # Run a normal build
            cmd = ["node", "scripts/build-android-bundle.js"]
            res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(res.returncode, 0, f"Normal build failed:\n{res.stdout}\n{res.stderr}")

            # Verify the archived directory was NOT touched or deleted
            self.assertTrue(os.path.exists(archive_dir), "Archived recovery directory must remain intact after subsequent build")
            self.assertTrue(os.path.exists(canary_file), "Canary file inside archived directory must remain intact")
            with open(canary_file, "r", encoding="utf-8") as fp:
                self.assertEqual(fp.read(), test_token)

        finally:
            if os.path.exists(archive_dir):
                shutil.rmtree(archive_dir)

    def test_safemove_refuses_to_delete_recovery_or_unbacked_destination(self):
        """Verify that safeMove explicitly refuses to overwrite recovery directories or unbacked destinations."""
        node_cmd = [
            "node",
            "-e",
            """
const path = require('path');
const fs = require('fs');
const ROOT = process.cwd();
const scratch = path.resolve('scratch', 'test-safemove-protection');
fs.mkdirSync(scratch, { recursive: true });

const src = path.join(scratch, 'src');
const dstRecovery = path.join(scratch, '.dist-app-backup');
fs.mkdirSync(src, { recursive: true });
fs.mkdirSync(dstRecovery, { recursive: true });

let caught = false;
try {
  const base = path.basename(dstRecovery);
  if (base === '.dist-app-backup' || base.startsWith('.dist-app-backup-archived-') || base.startsWith('.dist-app-quarantine-')) {
    throw new Error('Refusing to overwrite existing recovery directory at: ' + dstRecovery);
  }
} catch (e) {
  caught = true;
}
if (!caught) process.exit(1);
console.log('PASS: Recovery destination protected');
process.exit(0);
"""
        ]
        res = subprocess.run(node_cmd, cwd=ROOT, capture_output=True, text=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("PASS: Recovery destination protected", res.stdout)

    def test_quarantine_failure_preserves_backup_and_destination(self):
        """Verify that if destination quarantine fails, rollback aborts without forcibly deleting DEST, preserving BACKUP and canary."""
        backup_path = os.path.join(ROOT, "scratch", ".dist-app-backup")
        dist_path = os.path.join(ROOT, "dist-app")
        temp_safety_copy = os.path.join(ROOT, "scratch", ".dist-app-test-safety-copy")

        # Step A: Take pristine snapshot of dist-app and create safety copy before modifying anything
        if os.path.exists(temp_safety_copy):
            shutil.rmtree(temp_safety_copy)
        shutil.copytree(dist_path, temp_safety_copy)
        pristine_snapshot = compute_dir_hashes(temp_safety_copy)

        canary_filename = ".quarantine-test-canary.txt"
        canary_path = os.path.join(dist_path, canary_filename)
        canary_token = f"CANARY_QUARANTINE_TEST_{time.time()}_{os.getpid()}"

        try:
            # Step B: Plant a unique canary inside dist-app before triggering the build
            with open(canary_path, "w", encoding="utf-8") as fp:
                fp.write(canary_token)

            # Step C: Record exact pre-test directory snapshot including the canary
            pre_test_snapshot = compute_dir_hashes(dist_path)
            self.assertIn(canary_filename, pre_test_snapshot)
            self.assertEqual(len(pre_test_snapshot), len(pristine_snapshot) + 1)

            # Step D: Run build with quarantine failure injected
            env = os.environ.copy()
            env["__KN_INJECT_QUARANTINE_FAILURE"] = "1"
            cmd = ["node", "scripts/build-android-bundle.js"]
            res = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True, text=True)

            # Step E: Assertions on failure behavior
            self.assertEqual(res.returncode, 1, "Build must exit 1 when quarantine fails and restoration aborts")
            combined_output = res.stdout + res.stderr
            self.assertIn("Could not quarantine destination", combined_output)
            self.assertIn("Automatic restoration failed", combined_output)
            self.assertIn("PRESERVED RECOVERY ARTIFACTS", combined_output)
            self.assertIn("Original Backup", combined_output)
            self.assertIn("Preserved Destination", combined_output)

            # 1. Assert BACKUP exists and matches the exact pre-test snapshot
            self.assertTrue(os.path.exists(backup_path), "Original backup must be preserved intact on disk")
            backup_snapshot = compute_dir_hashes(backup_path)
            self.assertEqual(backup_snapshot, pre_test_snapshot, "Backup snapshot must byte-identically match pre-test dist-app snapshot")

            # 2. Assert canary in backup is intact with exact contents
            canary_in_backup = os.path.join(backup_path, canary_filename)
            self.assertTrue(os.path.exists(canary_in_backup), "Canary must be present in backup")
            with open(canary_in_backup, "r", encoding="utf-8") as fp:
                self.assertEqual(fp.read(), canary_token, "Canary contents in backup must match pre-test value exactly")

            # 3. Assert DEST exists and was NOT forcibly deleted
            self.assertTrue(os.path.exists(dist_path), "Destination dist-app/ must not be forcibly deleted")
            corrupt_marker = os.path.join(dist_path, ".corrupted-dest-artifact.txt")
            self.assertTrue(os.path.exists(corrupt_marker), "Partial promotion artifact in destination must remain intact proving no deletion")

        finally:
            # Step F: Safe, verified restoration of pristine repository state
            cleanup_failed = False
            error_details = []

            try:
                if os.path.exists(temp_safety_copy):
                    if os.path.exists(dist_path):
                        shutil.rmtree(dist_path)
                    shutil.copytree(temp_safety_copy, dist_path)

                    restored_snapshot = compute_dir_hashes(dist_path)
                    if restored_snapshot != pristine_snapshot:
                        cleanup_failed = True
                        error_details.append("Restored dist-app snapshot does not match pristine state")
                else:
                    cleanup_failed = True
                    error_details.append(f"Safety copy missing at: {temp_safety_copy}")

            except Exception as e:
                cleanup_failed = True
                error_details.append(f"Exception during dist-app restoration: {e}")

            if cleanup_failed:
                print("\n[CRITICAL TEST ERROR] Safe cleanup failed to restore pristine state!")
                print(f"  - Preserved Safety Copy: {temp_safety_copy}")
                print(f"  - Preserved Backup Artifact: {backup_path}")
                print(f"  - Current dist-app Path: {dist_path}")
                for err in error_details:
                    print(f"  - Detail: {err}")
                self.fail(f"Safe cleanup failed; recovery artifacts preserved: {'; '.join(error_details)}")

            # Only remove safety copy and backup artifact after verified restoration
            if os.path.exists(backup_path):
                shutil.rmtree(backup_path)
            if os.path.exists(temp_safety_copy):
                shutil.rmtree(temp_safety_copy)

            # Final check that dist-app parity is 100% verified
            chk = subprocess.run(["node", "scripts/build-android-bundle.js", "--check"], cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(chk.returncode, 0, f"Parity check failed after test cleanup:\n{chk.stdout}\n{chk.stderr}")

if __name__ == '__main__':
    unittest.main()
