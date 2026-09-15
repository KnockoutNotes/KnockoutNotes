import re
import os

print("Verifying Navigation Architecture and Constraints...")

with open("bubble-menu.js", "r", encoding="utf-8") as f:
    js = f.read()

with open("bubble-menu.css", "r", encoding="utf-8") as f:
    css = f.read()

with open("notes.html", "r", encoding="utf-8") as f:
    notes_html = f.read()

# 1. Check DESKTOP_LINKS
desktop_links_match = re.search(r'var DESKTOP_LINKS\s*=\s*\[(.*?)\];', js, re.DOTALL)
assert desktop_links_match, "DESKTOP_LINKS array not found"
desktop_links_str = desktop_links_match.group(1)
desktop_labels = re.findall(r"label:\s*'([^']+)'", desktop_links_str)

assert "Valve Lesions" not in desktop_labels, "Valve Lesions must not be in DESKTOP_LINKS"
assert "Pearls" not in desktop_labels, "Pearls must not be in DESKTOP_LINKS"
assert "Viva" not in desktop_labels, "Viva must not be in DESKTOP_LINKS"

for item in ['Home', 'Notes', 'Calculators', '3D Workstation', 'Drugs', 'Critical Care', 'About']:
    assert item in desktop_labels, f"{item} missing from DESKTOP_LINKS"
print(f"[OK] DESKTOP_LINKS verified: {desktop_labels}")

# 2. Check MOBILE_PRIMARY_LINKS
mob_primary_match = re.search(r'var MOBILE_PRIMARY_LINKS\s*=\s*\[(.*?)\];', js, re.DOTALL)
assert mob_primary_match, "MOBILE_PRIMARY_LINKS array not found"
mob_primary_str = mob_primary_match.group(1)
mob_primary_labels = re.findall(r"label:\s*'([^']+)'", mob_primary_str)
for item in ['Home', 'Notes', 'Calculator']:
    assert item in mob_primary_labels, f"{item} missing from MOBILE_PRIMARY_LINKS"
print(f"[OK] MOBILE_PRIMARY_LINKS verified: {mob_primary_labels}")

# 3. Check MOBILE_MORE_ITEMS (3-dot menu)
mob_more_match = re.search(r'var MOBILE_MORE_ITEMS\s*=\s*\[(.*?)\];', js, re.DOTALL)
assert mob_more_match, "MOBILE_MORE_ITEMS array not found"
mob_more_str = mob_more_match.group(1)
mob_more_labels = re.findall(r"label:\s*'([^']+)'", mob_more_str)

# Must NOT show Home, Notes, or Calculator
assert "Home" not in mob_more_labels, "Home MUST NOT be in 3-dot menu"
assert "Notes" not in mob_more_labels, "Notes MUST NOT be in 3-dot menu"
assert "Calculator" not in mob_more_labels, "Calculator MUST NOT be in 3-dot menu"
assert "Calculators" not in mob_more_labels, "Calculators MUST NOT be in 3-dot menu"
assert "Valve Lesions" not in mob_more_labels, "Valve Lesions must not be in 3-dot menu"
assert "Pearls" not in mob_more_labels, "Pearls must not be in 3-dot menu"
assert "Viva" not in mob_more_labels, "Viva must not be in 3-dot menu"

for item in ['3D Workstation', 'Drugs Library', 'Critical Care', 'Resuscitation', 'Recent Updates', 'About & Evidence']:
    assert item in mob_more_labels, f"{item} missing from MOBILE_MORE_ITEMS"
print(f"[OK] MOBILE_MORE_ITEMS verified (no Home/Notes/Calc): {mob_more_labels}")

# 4. Check CSS for 2-column grid and Apple iOS glass aesthetics
assert "grid-template-columns: repeat(2, 1fr)" in css, "Mobile more menu must be a 2-column grid"
assert ".kn-desktop-indicator" in css, "Desktop sliding pill indicator missing"
assert ".bubble-bar-capsule" in css, "Mobile floating capsule missing"
assert "backdrop-filter" in css, "Glassmorphism backdrop-filter missing"
print("[OK] CSS verified: 2-column grid, iOS glassmorphism, and sliding pill indicator present.")

# 5. Check notes.html: Valve Lesions, Pearls, and Viva preserved
assert "valves" in notes_html, "Valve Lesions content must NOT be removed from notes.html"
assert "pearls" in notes_html, "Pearls content must NOT be removed from notes.html"
assert "viva" in notes_html, "Viva content must NOT be removed from notes.html"
print("[OK] notes.html verified: Valve Lesions, Pearls, and Viva sections intact.")

print("\nALL NAVIGATION CONSTRAINTS MET 100% SUCCESSFULLY!")
