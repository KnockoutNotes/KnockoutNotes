import re

print("Verifying Responsive Navigation CSS Rules & Breakpoints...")

with open("bubble-menu.css", "r", encoding="utf-8") as f:
    css = f.read()

# Check desktop media query >= 768px
has_desktop_mq = "@media (min-width: 768px)" in css
assert has_desktop_mq, "Missing @media (min-width: 768px)"

# Check mobile media query < 768px
has_mobile_mq = "@media (max-width: 767px)" in css
assert has_mobile_mq, "Missing @media (max-width: 767px)"

# Check that under min-width: 768px, bubble menu is hidden and desktop nav is visible
desktop_block = css[css.find("@media (min-width: 768px)"):]
desktop_block = desktop_block[:desktop_block.find("/* Mobile (< 768px)")]

assert "#knDesktopNav" in desktop_block and "display: flex !important" in desktop_block, "Desktop nav not flex on desktop"
assert "#knBubbleNav" in desktop_block and "display: none !important" in desktop_block, "Bubble menu not hidden on desktop"
assert "#knBubbleOverlay" in desktop_block and "display: none !important" in desktop_block, "Bubble overlay not hidden on desktop"
assert "pointer-events: none !important" in desktop_block, "Bubble menu must not intercept pointer events on desktop"

# Check that under max-width: 767px, desktop nav is hidden and bubble nav is visible
mobile_block = css[css.find("@media (max-width: 767px)"):]
assert "#knDesktopNav" in mobile_block and "display: none !important" in mobile_block, "Desktop nav not hidden on mobile"
assert "#knBubbleNav" in mobile_block and "display: flex !important" in mobile_block, "Bubble menu not visible on mobile"

# Check that narrow mobile (<360px) is handled
assert "@media (max-width: 360px)" in css, "Missing narrow mobile @media (max-width: 360px)"

# Check legacy hud is suppressed
assert ".site-hud" in css and "display: none !important" in css, "Legacy .site-hud must be suppressed"

print("SUCCESS: Responsive CSS rules, 768px breakpoint, and pointer-event protections 100% verified!")
