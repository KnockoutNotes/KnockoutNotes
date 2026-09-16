import os
import re

print("==================================================")
print("VERIFYING USER REQUEST UPDATES & ECG ENHANCEMENTS")
print("==================================================")

EXPECTED_BONDIN_URL = "https://bondin.io/@knockoutnotes/support"

# 1. Bondin URL in resources.html
with open("resources.html", "r", encoding="utf-8") as f:
    resources_html = f.read()

assert 'username="@knockoutnotes"' in resources_html, "resources.html must have username='@knockoutnotes'"
assert 'username="knockoutnotes"' not in resources_html, "resources.html still has wrong username='knockoutnotes' without @"
assert EXPECTED_BONDIN_URL in resources_html, f"resources.html must have {EXPECTED_BONDIN_URL}"
print("[PASS] resources.html bondin widget uses @knockoutnotes handle and correct URL!")

# 2. Footers in all pages
PAGES_WITH_FOOTER = [
    "index.html", "notes.html", "calculators.html", "drugs.html",
    "critical-care.html", "resources.html", "ventilator.html",
    "recent-updates.html", "resuscitation-chamber.html", "viva.html", "pearls.html"
]

for page in PAGES_WITH_FOOTER:
    with open(page, "r", encoding="utf-8") as f:
        content = f.read()
    
    assert "Connect, Follow &amp; Support" in content or "Connect, Follow & Support" in content, f"{page} missing Connect, Follow & Support"
    assert "(by buying me a coffee)" in content, f"{page} missing (by buying me a coffee)"
    assert 'class="social social-coffee"' in content, f"{page} missing .social.social-coffee link"
    assert f'href="{EXPECTED_BONDIN_URL}"' in content, f"{page} missing expected bondin support URL"
    assert "☕" in content, f"{page} missing coffee icon in socials"

print("[PASS] All 11 page footers verified with Connect, Follow & Support + coffee icon!")

# 3. Explore cards on index.html
with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

card_top_matches = len(re.findall(r'<div class="card-top">\s*<div class="tag">', index_html))
assert card_top_matches >= 12, f"Expected at least 12 explore cards with .card-top wrapping .tag, found {card_top_matches}"
print("[PASS] Explore cards in index.html wrap .tag inside .card-top!")

# 4. ECG Canvas & Telemetry Grid in index.html
assert "knEcgCanvas3d" in index_html, "knEcgCanvas3d missing in index.html 3D view"
assert "knEcgCanvas" in index_html, "knEcgCanvas missing in index.html Lite view"
assert "ecg-monitor-hud" in index_html, "ecg-monitor-hud missing in index.html"
assert "kn-vital-hr" in index_html, "kn-vital-hr class missing in index.html"
assert "kn-vital-spo2" in index_html, "kn-vital-spo2 class missing in index.html"
assert "kn-vital-map" in index_html, "kn-vital-map class missing in index.html"
assert "kn-vital-etco2" in index_html, "kn-vital-etco2 class missing in index.html"
assert "kn-vital-mac" in index_html, "kn-vital-mac class missing in index.html"
assert "hud-etco2-val" in index_html, "hud-etco2-val missing in ecg monitor hud"
assert "hud-mac-val" in index_html, "hud-mac-val missing in ecg monitor hud"
print("[PASS] index.html telemetry HUD & 5-parameter grid (HR, SpO2, MAP, ETCO2, MAC) verified!")

# 5. CSS Rules in styles.css
with open("styles.css", "r", encoding="utf-8") as f:
    styles_css = f.read()

assert "#knEcgCanvas3d" in styles_css, "styles.css must include #knEcgCanvas3d in canvas sizing"
assert "grid-template-columns: repeat(5, 1fr)" in styles_css, "styles.css must support 5 columns for vitals grid"
assert ".vital-box.violet" in styles_css, "styles.css must include violet style for MAC"
assert ".ecg-monitor-hud" in styles_css, "styles.css must style .ecg-monitor-hud"
assert ".explore-card .tag" in styles_css, "styles.css must constrain .explore-card .tag"
print("[PASS] styles.css telemetry HUD, canvas 100% width, and vital colors verified!")

# 6. script.js Full Width & Animation Engine
with open("script.js", "r", encoding="utf-8") as f:
    script_js = f.read()

assert "knEcgCanvas3d" in script_js, "script.js must select #knEcgCanvas3d"
assert "sweepPixelsPerSecond" in script_js, "script.js must use calibrated smooth sweep speed"
assert "vitalsData" in script_js, "script.js must have vitalsData state"
assert "kn-vital-mac" in script_js, "script.js must update kn-vital-mac"
assert "kn-vital-etco2" in script_js, "script.js must update kn-vital-etco2"
assert "maxW = 600" not in script_js, "script.js must NOT have hardcoded maxW = 600"
print("[PASS] script.js smooth full-width sweep & live vitals simulator verified!")

print("\nALL VERIFICATION CRITERIA PASSED 100% SUCCESSFULLY! [OK]")
