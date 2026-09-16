import os
import re

print("Running Policy Pages & About Section Comprehensive Test Suite...")

POLICY_PAGES = [
    "shipping-policy.html",
    "contact.html",
    "pricing.html",
    "terms-and-conditions.html",
    "privacy-policy.html",
    "refund-policy.html"
]

# 1. Verify all 6 files exist
for p in POLICY_PAGES:
    assert os.path.exists(p), f"Missing policy file: {p}"
print("[OK] All 6 policy HTML files exist on disk.")

# 2. Verify resources.html integration
with open("resources.html", "r", encoding="utf-8") as f:
    resources = f.read()

# Must have Policies & Information with small tabs
assert "Policies & Information" in resources, "Policies & Information section missing from resources.html"
assert "policy-pill-tabs" in resources, "policy-pill-tabs container missing from resources.html"
assert "policy-tab-btn" in resources, "policy-tab-btn missing from resources.html"

# Verify innovative Buy Me a Coffee / Bondin support card is present
assert "kn-coffee-card" in resources, "kn-coffee-card missing from resources.html"
assert "bondin-support" in resources, "bondin-support widget missing from resources.html"
assert 'username="@knockoutnotes"' in resources, "@knockoutnotes username missing in bondin widget"

for p in POLICY_PAGES:
    assert f'href="{p}"' in resources, f"Link to {p} missing from resources.html"
print("[OK] resources.html correctly integrates Policies & Information tabs and innovative Buy Me a Coffee card.")

# 3. Check each policy page for strict privacy and legal compliance
FORBIDDEN_PATTERNS = [
    r'\[INSERT\s+[^\]]+\]',
    r'CIN\s*:\s*[A-Z0-9]+',
    r'GSTIN\s*:\s*[A-Z0-9]+',
    r'LLPIN\s*:\s*[A-Z0-9]+',
]

for p in POLICY_PAGES:
    with open(p, "r", encoding="utf-8") as f:
        html = f.read()

    # Check title and brand
    assert "<title>" in html and "Knockout Notes" in html, f"Missing title or brand in {p}"
    
    # Check for forbidden raw placeholders
    for pattern in FORBIDDEN_PATTERNS:
        match = re.search(pattern, html, re.IGNORECASE)
        assert not match, f"Forbidden placeholder pattern '{pattern}' found in {p}: {match.group(0) if match else ''}"
    
    # Check official brand contact email
    assert "knockoutnotes.anaesthesia@gmail.com" in html, f"Official brand email missing in {p}"

print("[OK] All 6 policy pages pass privacy, placeholder, and legal entity tests.")

# 4. Check sw.js includes policy files in precache
with open("sw.js", "r", encoding="utf-8") as f:
    sw = f.read()
for p in POLICY_PAGES:
    assert f'"/{p}"' in sw, f"sw.js precache missing {p}"
print("[OK] sw.js precache includes all 6 policy pages.")

print("\nALL POLICY TESTS COMPLETED SUCCESSFULLY!")
