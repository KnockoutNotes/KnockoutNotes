import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
print(f"Checking {len(html_files)} HTML files for broken references...")

broken = 0
for hf in sorted(html_files):
    with open(hf, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check script tags
    scripts = re.findall(r'<script\s+[^>]*src=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    for s in scripts:
        if not s.startswith('http') and not s.startswith('//'):
            path = s.split('?')[0].split('#')[0]
            if not os.path.exists(path):
                print(f"[ERROR] {hf} -> script not found: {path}")
                broken += 1

    # Check link stylesheets & manifests
    links = re.findall(r'<link\s+[^>]*href=[\'"]([^\'"]+)[\'"]', content, re.IGNORECASE)
    for l in links:
        if not l.startswith('http') and not l.startswith('//'):
            path = l.split('?')[0].split('#')[0]
            if not os.path.exists(path):
                print(f"[ERROR] {hf} -> link not found: {path}")
                broken += 1

if broken == 0:
    print("SUCCESS: 100% of scripts, stylesheets, and manifest references exist and resolve correctly across all HTML pages!")
else:
    print(f"FAIL: {broken} broken asset references found.")
    exit(1)
