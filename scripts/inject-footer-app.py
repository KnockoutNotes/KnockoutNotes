#!/usr/bin/env python3
"""
Inject compact 1-line footer app download row into all pages.
"""

import glob
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent

APP_ROW_STANDARD = """      <!-- Android App Download Row -->
      <div class="footer-app-row">
        <span class="footer-app-row-text">📱 Knockout Notes Android App (Offline)</span>
        <a href="knockoutnotes.apk" download="knockoutnotes.apk" class="footer-app-row-btn" title="Download Knockout Notes Android App (APK)">
          <span>⬇ Download APK</span>
          <span class="footer-app-row-size">23.8 MB</span>
        </a>
      </div>
"""

APP_ROW_POLICY = """    <!-- Android App Download Row -->
    <div class="footer-app-row" style="margin-bottom: 20px;">
      <span class="footer-app-row-text">📱 Knockout Notes Android App (Offline)</span>
      <a href="knockoutnotes.apk" download="knockoutnotes.apk" class="footer-app-row-btn" title="Download Knockout Notes Android App (APK)">
        <span>⬇ Download APK</span>
        <span class="footer-app-row-size">23.8 MB</span>
      </a>
    </div>
"""

APP_ROW_CRISIS = """    <!-- Android App Download Row -->
    <div class="footer-app-row" style="margin-top: 24px; margin-bottom: 24px;">
      <span class="footer-app-row-text">📱 Knockout Notes Android App (Offline)</span>
      <a href="knockoutnotes.apk" download="knockoutnotes.apk" class="footer-app-row-btn" title="Download Knockout Notes Android App (APK)">
        <span>⬇ Download APK</span>
        <span class="footer-app-row-size">23.8 MB</span>
      </a>
    </div>
"""

def process_file(file_path: Path):
    content = file_path.read_text(encoding="utf-8")
    
    # Don't duplicate if already injected
    # (except index.html where we might have already done both layers)
    if "footer-app-row" in content and "index.html" not in file_path.name:
        print(f"Skipping {file_path.name}: already contains footer-app-row")
        return False

    modified = False

    # 1. Standard pages with "<strong>Connect, Follow &amp; Support"
    cf_target = "<strong>Connect, Follow &amp; Support <span class=\"footer-support-sub\">(by buying me a coffee)</span></strong>"
    if cf_target in content:
        # Check all occurrences
        parts = content.split(cf_target)
        new_content = ""
        for i in range(len(parts) - 1):
            chunk = parts[i]
            # If this chunk doesn't end with footer-app-row
            if "footer-app-row" not in chunk[-300:]:
                chunk += APP_ROW_STANDARD
                modified = True
            chunk += cf_target
            new_content += chunk
        new_content += parts[-1]
        content = new_content

    # 2. Policy pages with '<footer class="policy-footer-nav">'
    policy_target = '<footer class="policy-footer-nav">'
    if policy_target in content and "footer-app-row" not in content:
        content = content.replace(policy_target, APP_ROW_POLICY + "    " + policy_target)
        modified = True

    # 3. Crisis Mode with '</main>'
    if "crisis.html" in file_path.name and "footer-app-row" not in content:
        content = content.replace("</main>", APP_ROW_CRISIS + "  </main>")
        modified = True

    if modified:
        file_path.write_text(content, encoding="utf-8")
        print(f"Updated: {file_path.relative_to(PROJECT_ROOT)}")
        return True
    return False


def main():
    target_patterns = [
        "*.html",
        "dist-app/*.html",
    ]
    
    total = 0
    updated = 0
    
    for pat in target_patterns:
        for p in PROJECT_ROOT.glob(pat):
            name = p.name
            if name.startswith("admin") or "confirmed" in name:
                continue
            total += 1
            if process_file(p):
                updated += 1
                
    print(f"\nDone! Processed {total} files, updated {updated} files.")

if __name__ == "__main__":
    main()
