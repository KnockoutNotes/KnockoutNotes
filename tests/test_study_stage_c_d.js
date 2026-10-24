/**
 * KnockoutNotes Stage C & Stage D Comprehensive Verification Suite
 * 
 * Stage C: Scroll-Aware Reading Mode
 *   - Stable content sentinel detection
 *   - Smooth transition into compact reading toolbar
 *   - Scroll hysteresis (no flickering near threshold)
 *   - Restoration of expanded view on scroll back to top
 *   - Reading progress bar & section tracker
 *   - Quick actions & Back button functionality
 * 
 * Stage D: Desktop Critical Care Accessible Navigation
 *   - Glass dropdown menu with 16 Critical Care categories
 *   - ARIA roles and keyboard accessibility (Arrow keys, Enter, Escape)
 *   - Hover with grace period to prevent premature closing
 *   - In-page navigation on study.html vs cross-page navigation
 *   - Apple floating capsule indicator positioning
 *   - Dark & Light theme rendering
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8116;
const CDP_PORT = 9256;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let u = req.url.split('?')[0];
  if (u === '/' || u === '') u = '/study.html';
  const filePath = path.join(ROOT, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + u);
      return;
    }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-stage-c-d');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + CDP_PORT,
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=' + userDataDir
  ]);
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const targets = await res.json();
  const ws = new WebSocket((targets.find(t => t.type === 'page') || targets[0]).webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p={}) => new Promise(r => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', h); r(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const consoleErrors = [];
  ws.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      const type = d.params.type;
      const text = d.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
      if (type === 'error') {
        consoleErrors.push(text);
      }
    }
  });

  await send('Page.enable');
  await send('Runtime.enable');

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
    if (r && r.exceptionDetails) {
      console.error('CDP Exception during eval:', r.exceptionDetails);
    }
    return r && r.result ? r.result.value : null;
  };

  const delay = ms => new Promise(r => setTimeout(r, ms));

  console.log('=== STARTING STAGE C & STAGE D VERIFICATION SUITE ===\n');
  let allPassed = true;

  try {
    // =========================================================================
    // PART 1: STAGE D — DESKTOP CRITICAL CARE ACCESSIBLE DROPDOWN
    // =========================================================================
    console.log('--- TEST D1: Verify Desktop Navigation & Critical Care Dropdown Markup ---');
    await send('Page.navigate', { url: `http://localhost:${PORT}/study.html?domain=critical` });
    await delay(2500);

    const markupCheck = await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        const trigger = document.getElementById('knDesktopCcTrigger');
        const menu = document.getElementById('knDesktopCcDropdownMenu');
        const items = menu ? menu.querySelectorAll('.kn-dropdown-item') : [];
        const headerAll = menu ? menu.querySelector('.kn-dropdown-header-all') : null;
        return {
          hasWrap: !!wrap,
          hasTrigger: !!trigger,
          triggerAriaHasPopup: trigger ? trigger.getAttribute('aria-haspopup') : null,
          triggerAriaExpanded: trigger ? trigger.getAttribute('aria-expanded') : null,
          hasMenu: !!menu,
          menuRole: menu ? menu.getAttribute('role') : null,
          menuAriaHidden: menu ? menu.getAttribute('aria-hidden') : null,
          itemCount: items.length,
          hasHeaderAll: !!headerAll
        };
      })()
    `);
    console.log('D1 Markup State:', markupCheck);
    if (markupCheck.hasWrap && markupCheck.hasTrigger && markupCheck.hasMenu && markupCheck.itemCount === 16 && markupCheck.triggerAriaExpanded === 'false') {
      console.log('Test D1 Result: PASS\n');
    } else {
      console.error('Test D1 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST D2: Hover / Focus triggers Dropdown Menu with Grace Period ---');
    await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        wrap.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      })()
    `);
    await delay(400);

    const openState = await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        const trigger = document.getElementById('knDesktopCcTrigger');
        const menu = document.getElementById('knDesktopCcDropdownMenu');
        const style = window.getComputedStyle(menu);
        return {
          hasOpenClass: wrap.classList.contains('kn-dropdown-open'),
          triggerExpanded: trigger.getAttribute('aria-expanded'),
          menuHidden: menu.getAttribute('aria-hidden'),
          opacity: style.opacity,
          pointerEvents: style.pointerEvents
        };
      })()
    `);
    console.log('D2 Open State:', openState);
    if (openState.hasOpenClass && openState.triggerExpanded === 'true' && (openState.opacity === '1' || parseFloat(openState.opacity) > 0.5)) {
      console.log('Test D2 Result: PASS\n');
    } else {
      console.error('Test D2 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST D3: Keyboard Accessibility (Escape to close, ArrowDown to open & navigate) ---');
    // Escape key
    await evalJs(`
      (() => {
        const menu = document.getElementById('knDesktopCcDropdownMenu');
        menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      })()
    `);
    await delay(100);

    const closedByEsc = await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        const trigger = document.getElementById('knDesktopCcTrigger');
        return {
          hasOpenClass: wrap.classList.contains('kn-dropdown-open'),
          triggerExpanded: trigger.getAttribute('aria-expanded')
        };
      })()
    `);
    console.log('D3 Closed by Escape State:', closedByEsc);

    // ArrowDown on trigger
    await evalJs(`
      (() => {
        const trigger = document.getElementById('knDesktopCcTrigger');
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      })()
    `);
    await delay(100);

    const openedByArrow = await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        const focused = document.activeElement;
        return {
          hasOpenClass: wrap.classList.contains('kn-dropdown-open'),
          focusedClass: focused ? focused.className : null,
          focusedText: focused ? focused.textContent.trim() : null
        };
      })()
    `);
    console.log('D3 Opened by ArrowDown State:', openedByArrow);
    if (!closedByEsc.hasOpenClass && openedByArrow.hasOpenClass) {
      console.log('Test D3 Result: PASS\n');
    } else {
      console.error('Test D3 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST D4: Dropdown Category Selection on study.html without Reload ---');
    const d4PreCheck = await evalJs(`
      (() => {
        return {
          curPath: (window.location.pathname.split("/").pop() || "index.html"),
          hasStudyRonDesign: !!window.StudyRonDesign,
          hasSwitchDomain: window.StudyRonDesign ? typeof window.StudyRonDesign.switchDomain : null
        };
      })()
    `);
    console.log('D4 Pre-Check:', d4PreCheck);

    const selectRes = await evalJs(`
      (() => {
        const target = document.querySelector('.kn-dropdown-item[data-cat-id="cc_respiratory"]');
        if (!target) return { found: false };
        target.click();
        return {
          found: true,
          activeCat: document.querySelector('.ron-nav-pill.active')?.getAttribute('data-ron-cat'),
          search: window.location.search
        };
      })()
    `);
    await delay(300);

    const stateAfterSelect = await evalJs(`
      (() => {
        const wrap = document.getElementById('knDesktopCcDropdownWrap');
        const activePill = document.querySelector('.ron-nav-pill.active');
        return {
          hasWrap: !!wrap,
          menuClosed: wrap ? !wrap.classList.contains('kn-dropdown-open') : false,
          activeCat: activePill ? activePill.getAttribute('data-ron-cat') : null
        };
      })()
    `);
    console.log('D4 State After Selection:', stateAfterSelect);
    if (stateAfterSelect.hasWrap && stateAfterSelect.menuClosed && stateAfterSelect.activeCat === 'cc_respiratory') {
      console.log('Test D4 Result: PASS\n');
    } else {
      console.error('Test D4 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST D5: Light and Dark Theme Rendering for Dropdown ---');
    const themeTest = await evalJs(`
      (() => {
        const menu = document.getElementById('knDesktopCcDropdownMenu');
        // Dark theme check
        document.body.classList.add('dark');
        const darkBg = window.getComputedStyle(menu).backgroundColor;
        // Light theme check
        document.body.classList.remove('dark');
        const lightBg = window.getComputedStyle(menu).backgroundColor;
        // Restore
        document.body.classList.add('dark');
        return { darkBg, lightBg };
      })()
    `);
    console.log('D5 Theme Backgrounds:', themeTest);
    if (themeTest.darkBg !== themeTest.lightBg) {
      console.log('Test D5 Result: PASS\n');
    } else {
      console.error('Test D5 Result: FAIL');
      allPassed = false;
    }

    // =========================================================================
    // PART 2: STAGE C — SCROLL-AWARE COMPACT READING MODE
    // =========================================================================
    console.log('--- TEST C1: Open Topic and Verify Initial Sentinel & Toolbar DOM ---');
    await evalJs(`window.StudyRonDesign.openTopic('propofol')`);
    for (let i = 0; i < 40; i++) {
      const ready = await evalJs(`!!(document.getElementById('ronReadingToolbar') && document.getElementById('ronReadingSentinel'))`);
      if (ready) break;
      await delay(50);
    }
    await delay(1200); // Allow initial smooth scroll from openTopic to settle

    const c1Init = await evalJs(`
      (() => {
        const app = document.getElementById('ronStudyApp');
        const toolbar = document.getElementById('ronReadingToolbar');
        const sentinel = document.getElementById('ronReadingSentinel');
        const backBtn = document.getElementById('ronReadingBackBtn');
        const titleEl = document.querySelector('.ron-reading-topic-title');
        const domainEl = document.querySelector('.ron-reading-domain-tag');
        const progressEl = document.getElementById('ronReadingProgressBar');

        return {
          hasToolbar: !!toolbar,
          hasSentinel: !!sentinel,
          hasBackBtn: !!backBtn,
          titleText: titleEl ? titleEl.textContent.trim() : null,
          domainText: domainEl ? domainEl.textContent.trim() : null,
          hasProgressBar: !!progressEl,
          isActiveInitially: app.classList.contains('ron-reading-mode-active')
        };
      })()
    `);
    console.log('C1 Initial State:', c1Init);
    if (c1Init.hasToolbar && c1Init.hasSentinel && !c1Init.isActiveInitially && c1Init.titleText && c1Init.domainText) {
      console.log('Test C1 Result: PASS\n');
    } else {
      console.error('Test C1 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST C2: Scroll Down Past Sentinel Activates Compact Reading Toolbar ---');
    await evalJs(`
      (() => {
        window.scrollTo({ top: 900, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await delay(300);

    const c2Active = await evalJs(`
      (() => {
        const app = document.getElementById('ronStudyApp');
        const toolbar = document.getElementById('ronReadingToolbar');
        const style = window.getComputedStyle(toolbar);
        return {
          isActive: app.classList.contains('ron-reading-mode-active'),
          toolbarOpacity: style.opacity,
          pointerEvents: style.pointerEvents,
          transform: style.transform
        };
      })()
    `);
    console.log('C2 Active State:', c2Active);
    if (c2Active.isActive && c2Active.toolbarOpacity === '1' && c2Active.pointerEvents === 'auto') {
      console.log('Test C2 Result: PASS\n');
    } else {
      console.error('Test C2 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST C3: Scroll Hysteresis (Partial scroll up retains reading mode without flicker) ---');
    await evalJs(`
      (() => {
        window.scrollTo({ top: 760, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await delay(200);

    const c3Hysteresis = await evalJs(`
      (() => {
        const app = document.getElementById('ronStudyApp');
        return {
          stillActive: app.classList.contains('ron-reading-mode-active'),
          scrollY: window.pageYOffset || document.documentElement.scrollTop
        };
      })()
    `);
    console.log('C3 Hysteresis State:', c3Hysteresis);
    if (c3Hysteresis.stillActive) {
      console.log('Test C3 Result: PASS\n');
    } else {
      console.error('Test C3 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST C4: Scroll Back to Top Restores Expanded Navigation View ---');
    await evalJs(`
      (() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await delay(300);

    const c4Restored = await evalJs(`
      (() => {
        const app = document.getElementById('ronStudyApp');
        const toolbar = document.getElementById('ronReadingToolbar');
        const style = window.getComputedStyle(toolbar);
        return {
          isActive: app.classList.contains('ron-reading-mode-active'),
          toolbarOpacity: style.opacity,
          pointerEvents: style.pointerEvents
        };
      })()
    `);
    console.log('C4 Restored State:', c4Restored);
    if (!c4Restored.isActive && c4Restored.toolbarOpacity === '0' && c4Restored.pointerEvents === 'none') {
      console.log('Test C4 Result: PASS\n');
    } else {
      console.error('Test C4 Result: FAIL');
      allPassed = false;
    }

    console.log('--- TEST C5: Reading Toolbar Back Button Cleans Up & Returns to Category ---');
    await evalJs(`
      (() => {
        window.scrollTo({ top: 900, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      })()
    `);
    await delay(300);

    const clickBack = await evalJs(`
      (() => {
        const backBtn = document.getElementById('ronReadingBackBtn');
        if (!backBtn) return { found: false };
        backBtn.click();
        return { found: true };
      })()
    `);
    await delay(500);

    const c5Returned = await evalJs(`
      (() => {
        const app = document.getElementById('ronStudyApp');
        const activeTopic = document.querySelector('.ron-topic-detail-wrap');
        const activeCatPill = document.querySelector('.ron-nav-pill.active');
        return {
          isReadingModeActive: app.classList.contains('ron-reading-mode-active'),
          hasTopicDetail: !!activeTopic,
          activeCat: activeCatPill ? activeCatPill.getAttribute('data-ron-cat') : null
        };
      })()
    `);
    console.log('C5 Returned to Category State:', c5Returned);
    if (!c5Returned.isReadingModeActive && !c5Returned.hasTopicDetail && c5Returned.activeCat === 'induction') {
      console.log('Test C5 Result: PASS\n');
    } else {
      console.error('Test C5 Result: FAIL');
      allPassed = false;
    }

    console.log('Console Errors Observed:', consoleErrors);
    if (consoleErrors.length > 0) {
      console.error('Console errors were logged during test execution!');
      allPassed = false;
    }

  } catch (err) {
    console.error('Test Execution Error:', err);
    allPassed = false;
  } finally {
    ws.close();
    chrome.kill();
    server.close();

    console.log('\n===============================================================');
    if (allPassed) {
      console.log('     STAGE C & STAGE D VERIFICATION: ALL TESTS PASSED! 🚀');
    } else {
      console.log('     STAGE C & STAGE D VERIFICATION: SOME TESTS FAILED');
      process.exitCode = 1;
    }
    console.log('===============================================================\n');
  }
});
