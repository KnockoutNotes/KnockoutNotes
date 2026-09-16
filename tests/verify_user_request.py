import os
import re

print("==================================================")
print("VERIFYING USER REQUEST UPDATES")
print("==================================================")

EXPECTED_BONDIN_URL = "https://bondin.io/@knockoutnotes/support"

with open("resources.html", "r", encoding="utf-8") as f:
    resources_html = f.read()

assert 'username="@knockoutnotes"' in resources_html, "resources.html must have username='@knockoutnotes'"
assert 'username="knockoutnotes"' not in resources_html, "resources.html still has wrong username='knockoutnotes' without @"
assert EXPECTED_BONDIN_URL in resources_html, f"resources.html must have {EXPECTED_BONDIN_URL}"
print("[PASS] resources.html bondin widget uses @knockoutnotes handle and correct URL!")

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
    print(f" [OK] {page} footer verified with Connect, Follow & Support + coffee icon!")

with open("index.html", "r", encoding="utf-8") as f:
    index_html = f.read()

card_top_matches = len(re.findall(r'<div class="card-top">\s*<div class="tag">', index_html))
assert card_top_matches >= 12, f"Expected at least 12 explore cards with .card-top wrapping .tag, found {card_top_matches}"
print("[PASS] Explore cards in index.html wrap .tag inside .card-top!")

with open("styles.css", "r", encoding="utf-8") as f:
    styles_css = f.read()

assert ".dark .card, .dark .quick-card, .dark .bento-card, .dark .explore-card" in styles_css, "styles.css must include .explore-card in dark card styles"
assert "body:not(.dark) .card, body:not(.dark) .quick-card, body:not(.dark) .bento-card, body:not(.dark) .explore-card" in styles_css, "styles.css must include .explore-card in day mode card styles"
assert ".explore-card .tag" in styles_css, "styles.css must constrain .explore-card .tag"
assert "align-self: flex-start" in styles_css, "styles.css must set align-self: flex-start for tag"
print("[PASS] styles.css card rules correctly applied to .explore-card!")

print("\nALL USER REQUEST CRITERIA VERIFIED 100% SUCCESSFULLY! [OK]")
