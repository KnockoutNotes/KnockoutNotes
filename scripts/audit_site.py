import os
import re

def audit_html_assets():
    root_files = [f for f in os.listdir('.') if f.endswith('.html')]
    missing = []
    
    for f in root_files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            
        # Scripts
        for m in re.finditer(r'<script\b[^>]*?\bsrc=["\']([^"\']+)["\']', content, re.IGNORECASE):
            src = m.group(1).strip()
            if src.startswith(('http://', 'https://', '//', 'data:')):
                continue
            clean = src.split('?')[0].split('#')[0].lstrip('/')
            if not os.path.exists(clean):
                missing.append((f, 'script', src, clean))
                
        # Stylesheets
        for m in re.finditer(r'<link\b[^>]*?\bhref=["\']([^"\']+)["\'][^>]*?>', content, re.IGNORECASE):
            tag = m.group(0)
            if 'stylesheet' not in tag.lower():
                continue
            href = m.group(1).strip()
            if href.startswith(('http://', 'https://', '//', 'data:')):
                continue
            clean = href.split('?')[0].split('#')[0].lstrip('/')
            if not os.path.exists(clean):
                missing.append((f, 'stylesheet', href, clean))

    print(f"Total root HTML files scanned: {len(root_files)}")
    print(f"Total missing script/style assets: {len(missing)}")
    for item in missing:
        print("  MISSING:", item)
    return missing

def audit_nav_links():
    root_files = [f for f in os.listdir('.') if f.endswith('.html')]
    broken_links = []
    
    for f in root_files:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            content = fp.read()
            
        for m in re.finditer(r'<a\b[^>]*?\bhref=["\']([^"\']+)["\']', content, re.IGNORECASE):
            href = m.group(1).strip()
            if href.startswith(('http://', 'https://', '//', 'mailto:', 'tel:', 'javascript:', '#', 'data:')):
                continue
            clean = href.split('?')[0].split('#')[0].lstrip('/')
            if not clean:
                continue
            if not os.path.exists(clean):
                broken_links.append((f, href, clean))

    print(f"Total internal links with missing targets: {len(broken_links)}")
    for item in broken_links[:20]:
        print("  BROKEN LINK:", item)
    return broken_links

if __name__ == '__main__':
    audit_html_assets()
    audit_nav_links()
