import os
import re

print("Running Policy Pages Comprehensive Test Suite...")

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

assert "Policies & Information" in resources, "Policies & Information section missing from resources.html"
assert "Support Knockout Notes" in resources, "Support Knockout Notes section missing from resources.html"
assert "Buy Me a Coffee" in resources, "Buy Me a Coffee CTA missing from resources.html"
assert "https://razorpay.me/@anaesthesia" in resources, "Razorpay payment link missing from resources.html"

for p in POLICY_PAGES:
    assert f'href="{p}"' in resources, f"Link to {p} missing from resources.html"
print("[OK] resources.html correctly integrates Policies & Information grid and Buy Me a Coffee CTA.")

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

# 4. Check policy-config.js
assert os.path.exists("policy-config.js"), "policy-config.js missing"
with open("policy-config.js", "r", encoding="utf-8") as f:
    cfg = f.read()
assert "https://razorpay.me/@anaesthesia" in cfg, "Config missing supportUrl"
assert "knockoutnotes.anaesthesia@gmail.com" in cfg, "Config missing contactEmail"
print("[OK] policy-config.js verified.")

# 5. Check sw.js includes policy files in precache
with open("sw.js", "r", encoding="utf-8") as f:
    sw = f.read()
for p in POLICY_PAGES:
    assert f'"/{p}"' in sw, f"sw.js precache missing {p}"
print("[OK] sw.js precache includes all 6 policy pages.")

print("\nALL POLICY TESTS COMPLETED SUCCESSFULLY!")
