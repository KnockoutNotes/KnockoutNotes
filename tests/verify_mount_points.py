"""
Verify Subscription Widget Mount Points Across KnockoutNotes Pages
Checks:
1. Presence of subscribe-widget.css
2. Presence of subscribe-widget.js
3. Subscription widget mount point in .view-layer-3d
4. Subscription widget mount point in .view-layer-lite
5. Zero duplicate IDs
"""

import re
import os

PAGES = ['index.html', 'notes.html', 'calculators.html', 'recent-updates.html']

def verify_pages():
    print("==================================================")
    print("VERIFYING SUBSCRIPTION WIDGET MOUNT POINTS")
    print("==================================================")
    all_ok = True
    
    for page in PAGES:
        with open(page, 'r', encoding='utf-8') as f:
            html = f.read()

        # 1. CSS and JS inclusions
        has_css = 'subscribe-widget.css' in html
        has_js = 'subscribe-widget.js' in html
        
        # 2. View layers
        layer_split = html.split('class="view-layer-lite"')
        assert len(layer_split) == 2, f"{page}: Must contain exactly one view-layer-lite divider"
        part_3d, part_lite = layer_split[0], layer_split[1]
        
        has_3d_mount = ('class="kn-subscription-mount"' in part_3d or 'id="knSubscriptionWidget"' in part_3d)
        has_lite_mount = ('class="kn-subscription-mount"' in part_lite or 'id="knSubscriptionWidget"' in part_lite)
        
        # 3. Duplicate ID check
        kn_id_count = len(re.findall(r'id=["\']knSubscriptionWidget["\']', html))
        
        print(f"[{page}]")
        print(f"  - CSS link included: {has_css}")
        print(f"  - JS script included: {has_js}")
        print(f"  - 3D View mount present: {has_3d_mount}")
        print(f"  - Lite View mount present: {has_lite_mount}")
        print(f"  - Duplicate #knSubscriptionWidget IDs: {kn_id_count} (Must be <= 1)")
        
        if not (has_css and has_js and has_3d_mount and has_lite_mount and kn_id_count <= 1):
            all_ok = False
            print(f"  => FAILED verification on {page}")
        else:
            print(f"  => PASSED [OK]")

    print("==================================================")
    if all_ok:
        print("ALL 4 PAGES VERIFIED 100% CLEAN AND MOUNTED!")
    else:
        print("SOME PAGES FAILED VERIFICATION!")
    print("==================================================")
    return all_ok

if __name__ == '__main__':
    ok = verify_pages()
    exit(0 if ok else 1)
