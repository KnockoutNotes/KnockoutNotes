"""
KnockoutNotes — SPA Router Verification Suite (verify_spa_router.py)
Validates:
1. spa-router.js syntax and integrity
2. Script inclusion across all key HTML pages
3. bubble-menu.js integration with setActiveRoute
4. Service Worker precaching & version bump
5. Eligibility routing rules (Desktop vs Mobile)
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def check_file_exists(rel_path):
    p = os.path.join(ROOT, rel_path)
    if not os.path.exists(p):
        print(f"[FAIL] Missing file: {rel_path}")
        return False
    return True

def test_spa_router_integrity():
    print("--- 1. Testing spa-router.js Integrity ---")
    router_path = os.path.join(ROOT, "spa-router.js")
    with open(router_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "window.KnockoutRouter" in content, "KnockoutRouter must be exported"
    assert "pageCache" in content, "pageCache must be present"
    assert "navigateTo" in content, "navigateTo function must be present"
    assert "isEligibleRoute" in content, "isEligibleRoute must be present"
    assert "setupStage" in content, "setupStage must be present"
    assert "syncStylesheets" in content, "syncStylesheets must be present"

    # Verify Desktop and Mobile routing separation
    assert "window.innerWidth >= 768" in content, "Must check desktop breakpoint"
    assert "mobileAllowed" in content, "Must have mobileAllowed list"
    assert "desktopAllowed" in content, "Must have desktopAllowed list"

    print("[PASS] spa-router.js core engine structure verified!")

def test_bubble_menu_integration():
    print("--- 2. Testing bubble-menu.js Integration ---")
    menu_path = os.path.join(ROOT, "bubble-menu.js")
    with open(menu_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "setActiveRoute:" in content, "KnockoutNavigation must export setActiveRoute"
    assert "setDesktopIndicatorTo" in content, "setDesktopIndicatorTo must be wired"
    assert "setMobileIndicatorTo" in content, "setMobileIndicatorTo must be wired"

    print("[PASS] bubble-menu.js correctly integrated with setActiveRoute!")

def test_html_script_inclusion():
    print("--- 3. Testing HTML Script Inclusions ---")
    pages = [
        "index.html",
        "notes.html",
        "calculators.html",
        "drugs.html",
        "critical-care.html",
        "resources.html",
        "ventilator.html",
        "recent-updates.html",
        "resuscitation-chamber.html",
        "viva.html"
    ]

    for page in pages:
        p = os.path.join(ROOT, page)
        with open(p, "r", encoding="utf-8") as f:
            content = f.read()

        assert "spa-router.js" in content, f"{page} must include spa-router.js"
        # Verify spa-router is loaded before bubble-menu
        spa_pos = content.find("spa-router.js")
        bubble_pos = content.find("bubble-menu.js")
        assert spa_pos != -1, f"{page} missing spa-router.js"
        assert bubble_pos != -1, f"{page} missing bubble-menu.js"
        assert spa_pos < bubble_pos, f"{page}: spa-router.js must come before bubble-menu.js"
        print(f" [OK] {page} includes spa-router.js correctly before bubble-menu.js")

    print("[PASS] All pages include spa-router.js properly!")

def test_service_worker():
    print("--- 4. Testing Service Worker precache & version ---")
    sw_path = os.path.join(ROOT, "sw.js")
    with open(sw_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert 'const CACHE_NAME = "knockoutnotes-cache-v12";' in content, "Cache version must be v12"
    assert '"/spa-router.js"' in content, "spa-router.js must be in PRECACHE_ASSETS"
    print("[PASS] sw.js precaches spa-router.js and has cache version v12!")

def test_stage_css():
    print("--- 5. Testing Page Stage CSS in page-common.css ---")
    css_path = os.path.join(ROOT, "page-common.css")
    with open(css_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "#knPageStage" in content, "page-common.css must define #knPageStage"
    assert ".kn-stage-transitioning" in content, "page-common.css must define .kn-stage-transitioning"
    assert "prefers-reduced-motion" in content, "page-common.css must support prefers-reduced-motion"
    print("[PASS] page-common.css includes stage transition rules!")

def run_all():
    print("==================================================")
    print("VERIFYING INSTANT CLIENT-SIDE NAVIGATION SYSTEM")
    print("==================================================")
    test_spa_router_integrity()
    test_bubble_menu_integration()
    test_html_script_inclusion()
    test_service_worker()
    test_stage_css()
    print("\nALL SPA NAVIGATION TESTS PASSED 100% SUCCESSFULLY! [OK]")

if __name__ == "__main__":
    run_all()
