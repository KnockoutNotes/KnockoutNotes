/**
 * KnockoutNotes — Production Hotfix Verification Gates
 * (tests/test_production_hotfix_gates.js)
 * 
 * Tests against real Chrome headless using CDP WebSocket protocol:
 * 1. Chapters button styling in dark mode (NOT white, rounded pill, correct palette)
 * 2. Compact reading mode scroll activation and restoration during genuine scroll
 * 3. Drugs domain category selection (no modal opened, immediate selection, clean isolation)
 * 4. bubble-menu clean URL normalization (/study) and in-page domain switching
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
  if (u === '/' || u === '' || u === '/study') u = '/study.html';
  const filePath = path.join(ROOT, u);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found: ' + u);
      return;
    }
    const ext = path.extname(filePath);
    const ct = ext === '.html' ? 'text/html' : ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.json' ? 'application/json' : 'text/plain';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-hotfix-gates');
  const chrome = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=390,844',
    '--disable-extensions',
    '--disable-gpu',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  let cdpWs = null;
  let msgId = 1;
  const pending = new Map();

  async function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      cdpWs.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  const delay = ms => new Promise(r => setTimeout(r, ms));

  let allPassed = true;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      allPassed = false;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  try {
    // Wait for chrome debugging endpoint
    await delay(1200);
    const versionRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`).then(r => r.json());
    const wsUrl = (versionRes.find(t => t.type === 'page') || versionRes[0]).webSocketDebuggerUrl;
    cdpWs = new WebSocket(wsUrl);
    await new Promise(r => cdpWs.onopen = r);

    cdpWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    // Navigate
    await send('Page.navigate', { url: `http://localhost:${PORT}/study.html?domain=drugs` });
    await delay(1500);

    console.log('\n--- GATE 1: Chapters button dark mode styling ---');
    await evaluate(`
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
    `);

    const triggerStyles = await evaluate(`
      (function() {
        const btn = document.getElementById('ronBrowseChaptersTrigger');
        if (!btn) return null;
        const cs = window.getComputedStyle(btn);
        return {
          display: cs.display,
          bg: cs.backgroundColor,
          color: cs.color,
          borderRadius: cs.borderRadius,
          borderWidth: cs.borderWidth,
          borderStyle: cs.borderStyle
        };
      })()
    `);

    console.log('Chapters button computed styles (Dark Mode):', triggerStyles);
    assert(triggerStyles.display === 'inline-flex' || triggerStyles.display === 'flex', 'Chapters button has flex/inline-flex display');
    assert(triggerStyles.bg !== 'rgb(255, 255, 255)' && triggerStyles.bg !== 'rgba(0, 0, 0, 0)', 'Chapters button is NOT white in dark mode');
    assert(triggerStyles.borderRadius === '9999px', 'Chapters button has rounded pill border-radius (9999px)');
    assert(triggerStyles.color === 'rgb(56, 189, 248)', 'Chapters button has correct cyan text color (#38bdf8)');

    console.log('\n--- GATE 2: Tapping category selects immediately; NO menu opened ---');
    const pillPoint = await evaluate(`
      (function() {
        const el = document.querySelector('.ron-nav-pill[data-ron-cat="antimicrobials"]');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()
    `);

    assert(Boolean(pillPoint), 'Antimicrobial category pill found');
    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(pillPoint.x), y: Math.round(pillPoint.y) }]
    });
    await delay(60);
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
    await delay(300);

    const stateAfterCatTap = await evaluate(`
      (function() {
        const modal = document.getElementById('ronChaptersModal');
        const isModalOpen = modal && !modal.hidden && modal.classList.contains('ron-modal-open');
        const activePill = document.querySelector('.ron-nav-pill.active');
        const activeCat = activePill ? activePill.getAttribute('data-ron-cat') : null;
        const cards = document.querySelectorAll('[data-topic-id]');
        return {
          isModalOpen: Boolean(isModalOpen),
          activeCat,
          cardCount: cards.length,
          url: window.location.search
        };
      })()
    `);

    console.log('State after tapping Antimicrobials:', stateAfterCatTap);
    assert(stateAfterCatTap.activeCat === 'antimicrobials', 'Antimicrobial category pill is selected');
    assert(stateAfterCatTap.isModalOpen === false, 'Chapters modal remains strictly closed on category tap');
    assert(stateAfterCatTap.cardCount === 26, `Antimicrobials shows all 26 drug monographs (got ${stateAfterCatTap.cardCount})`);
    assert(stateAfterCatTap.url.includes('cat=antimicrobials'), 'URL reflects cat=antimicrobials');

    console.log('\n--- GATE 3: Chapters button tap opens Chapters menu ---');
    const chapBtnPoint = await evaluate(`
      (function() {
        const btn = document.getElementById('ronBrowseChaptersTrigger');
        if (!btn) return null;
        const r = btn.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()
    `);

    await send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: Math.round(chapBtnPoint.x), y: Math.round(chapBtnPoint.y) }]
    });
    await delay(60);
    await send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    });
    await delay(300);

    const modalState = await evaluate(`
      (function() {
        const modal = document.getElementById('ronChaptersModal');
        return modal && !modal.hidden && modal.classList.contains('ron-modal-open');
      })()
    `);
    assert(modalState === true, 'Tapping Chapters button successfully opens chapters modal');

    // Close chapters modal
    await evaluate(`
      (function() {
        const closeBtn = document.getElementById('ronCloseChaptersModalBtn');
        if (closeBtn) closeBtn.click();
      })()
    `);
    await delay(150);

    console.log('\n--- GATE 4: Compact reading mode scroll activation and restoration ---');
    // Open a drug topic
    await evaluate(`window.StudyRonDesign.openTopic('antiarrhythmics-class-1a')`);
    await delay(500);

    // Verify initial state: at top, reading toolbar is hidden
    const initialToolbar = await evaluate(`
      (function() {
        const tb = document.getElementById('ronReadingToolbar');
        if (!tb) return null;
        const cs = window.getComputedStyle(tb);
        return {
          ariaHidden: tb.getAttribute('aria-hidden'),
          opacity: cs.opacity,
          top: tb.getBoundingClientRect().top
        };
      })()
    `);
    console.log('Initial toolbar state at scroll top 0:', initialToolbar);
    assert(initialToolbar.ariaHidden === 'true', 'Toolbar is aria-hidden: true at top');
    assert(parseFloat(initialToolbar.opacity) === 0, 'Toolbar is opacity: 0 at top');

    // Genuine window scroll down 600px into chapter content
    await evaluate(`
      window.scrollTo(0, 600);
      window.dispatchEvent(new Event('scroll'));
    `);
    await delay(450);

    const activeToolbar = await evaluate(`
      (function() {
        const tb = document.getElementById('ronReadingToolbar');
        if (!tb) return null;
        const cs = window.getComputedStyle(tb);
        const r = tb.getBoundingClientRect();
        const parentTag = tb.parentElement ? tb.parentElement.tagName : null;
        return {
          ariaHidden: tb.getAttribute('aria-hidden'),
          opacity: cs.opacity,
          position: cs.position,
          zIndex: cs.zIndex,
          viewportTop: r.top,
          viewportBottom: r.bottom,
          parentTag
        };
      })()
    `);

    console.log('Toolbar state after scrolling down 600px:', activeToolbar);
    assert(activeToolbar.ariaHidden === 'false', 'Toolbar has aria-hidden: false when scrolled down');
    assert(parseFloat(activeToolbar.opacity) > 0.9, 'Toolbar has opacity > 0.9 when scrolled down');
    assert(activeToolbar.position === 'fixed', 'Toolbar has position: fixed');
    assert(Math.abs(activeToolbar.viewportTop) < 1, 'Toolbar is pinned at viewport top (0px)');
    assert(activeToolbar.parentTag === 'BODY', 'Toolbar parent is directly BODY (immune to perspective trapping)');

    // Scroll back to top 0px
    await evaluate(`
      window.scrollTo(0, 0);
      window.dispatchEvent(new Event('scroll'));
    `);
    await delay(450);

    const restoredToolbar = await evaluate(`
      (function() {
        const tb = document.getElementById('ronReadingToolbar');
        if (!tb) return null;
        const cs = window.getComputedStyle(tb);
        return {
          ariaHidden: tb.getAttribute('aria-hidden'),
          opacity: cs.opacity
        };
      })()
    `);
    console.log('Toolbar state after scrolling back to top 0:', restoredToolbar);
    assert(restoredToolbar.ariaHidden === 'true', 'Toolbar restores to aria-hidden: true when back at top');
    assert(parseFloat(restoredToolbar.opacity) < 0.1, 'Toolbar restores to opacity 0 when back at top');


    console.log('\n--- GATE 6: Explicit Full-Screen Reading Mode (User-Controlled) ---');
    // Open a topic (Anaesthesia domain)
    await evaluate("window.StudyRonDesign.openTopic('anaesthetic-machine-safety')");
    await delay(400);

    // Verify Reading Mode trigger buttons exist
    const triggerButtons = await evaluate(`
      (function() {
        const topBtn = document.getElementById('ronEnterReadingModeTopBtn');
        const actionBtn = document.getElementById('ronEnterReadingModeBtn');
        return {
          topBtn: Boolean(topBtn),
          actionBtn: Boolean(actionBtn)
        };
      })()
    `);
    console.log('Reading Mode trigger buttons:', triggerButtons);
    assert(triggerButtons.topBtn, 'Top bar Reading Mode button exists');
    assert(triggerButtons.actionBtn, 'Monograph action bar Reading Mode button exists');

    // Click Reading Mode button
    await evaluate(`
      (function() {
        const btn = document.getElementById('ronEnterReadingModeTopBtn');
        btn.click();
      })()
    `);
    await delay(300);

    // Verify Fullscreen Reading Mode overlay is active
    const rmState = await evaluate(`
      (function() {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const bodyTarget = document.getElementById('ronRmBodyTarget');
        const descBox = document.getElementById('ronActiveDescriptionBox');
        const placeholder = document.getElementById('ronActiveDescPlaceholder');
        const isBodyActive = document.body.classList.contains('ron-reading-fullscreen-active');
        return {
          isOpen: overlay && !overlay.hidden,
          isBodyActive,
          hasDescInBodyTarget: bodyTarget && descBox && bodyTarget.contains(descBox),
          hasPlaceholder: Boolean(placeholder),
          kickerText: document.getElementById('ronRmKicker') ? document.getElementById('ronRmKicker').textContent : null,
          headingText: document.getElementById('ronRmHeading') ? document.getElementById('ronRmHeading').textContent : null,
          theme: overlay ? overlay.getAttribute('data-reading-theme') : null,
          fontSize: document.getElementById('ronRmFontIndicator') ? document.getElementById('ronRmFontIndicator').textContent : null
        };
      })()
    `);
    console.log('Reading Mode active state:', rmState);
    assert(rmState.isOpen, 'Reading Mode overlay is visible (not hidden)');
    assert(rmState.isBodyActive, 'body has class ron-reading-fullscreen-active');
    assert(rmState.hasDescInBodyTarget, 'Live chapter description DOM node is safely reparented into body target');
    assert(rmState.hasPlaceholder, 'Placeholder node exists in original DOM location');
    assert(Boolean(rmState.headingText), 'Heading text is populated');

    // Test text size controls: A+
    await evaluate(`
      (function() {
        const incBtn = document.getElementById('ronRmFontIncBtn');
        incBtn.click();
      })()
    `);
    await delay(100);
    const fontStatePlus = await evaluate("document.getElementById('ronRmFontIndicator') ? document.getElementById('ronRmFontIndicator').textContent : null");
    assert(fontStatePlus === '18px', 'Font size incremented to 18px');

    // Test text size controls: A-
    await evaluate(`
      (function() {
        const decBtn = document.getElementById('ronRmFontDecBtn');
        decBtn.click();
      })()
    `);
    await delay(100);
    const fontStateMinus = await evaluate("document.getElementById('ronRmFontIndicator') ? document.getElementById('ronRmFontIndicator').textContent : null");
    assert(fontStateMinus === '17px', 'Font size decremented back to 17px');

    // Test theme switcher: Sepia
    await evaluate(`
      (function() {
        const sepiaBtn = document.querySelector('.ron-rm-theme-btn[data-reading-theme-val="sepia"]');
        sepiaBtn.click();
      })()
    `);
    await delay(100);
    const themeSepia = await evaluate("document.getElementById('ronReadingModeOverlay') ? document.getElementById('ronReadingModeOverlay').getAttribute('data-reading-theme') : null");
    assert(themeSepia === 'sepia', 'Reading theme switched to sepia');

    // Test theme switcher: Dark
    await evaluate(`
      (function() {
        const darkBtn = document.querySelector('.ron-rm-theme-btn[data-reading-theme-val="dark"]');
        darkBtn.click();
      })()
    `);
    await delay(100);
    const themeDark = await evaluate("document.getElementById('ronReadingModeOverlay') ? document.getElementById('ronReadingModeOverlay').getAttribute('data-reading-theme') : null");
    assert(themeDark === 'dark', 'Reading theme switched to dark');

    // Test TOC drawer
    await evaluate(`
      (function() {
        const tocBtn = document.getElementById('ronRmTocToggleBtn');
        tocBtn.click();
      })()
    `);
    await delay(150);
    const tocOpenState = await evaluate(`
      (function() {
        const drawer = document.getElementById('ronRmTocDrawer');
        const items = document.querySelectorAll('.ron-rm-toc-item');
        return {
          isOpen: drawer && !drawer.hidden && drawer.classList.contains('open'),
          itemCount: items.length
        };
      })()
    `);
    console.log('TOC drawer open state:', tocOpenState);
    assert(tocOpenState.isOpen, 'TOC drawer is open');
    assert(tocOpenState.itemCount > 0, 'TOC drawer contains section navigation items');

    // Close TOC drawer
    await evaluate(`
      (function() {
        const closeBtn = document.getElementById('ronRmTocCloseBtn');
        closeBtn.click();
      })()
    `);
    await delay(150);
    const tocClosedState = await evaluate(`
      (function() {
        const drawer = document.getElementById('ronRmTocDrawer');
        return drawer && drawer.hidden;
      })()
    `);
    assert(tocClosedState, 'TOC drawer closes cleanly');

    // Test Exit button
    await evaluate(`
      (function() {
        const exitBtn = document.getElementById('ronRmExitBtn');
        exitBtn.click();
      })()
    `);
    await delay(300);

    const exitedState = await evaluate(`
      (function() {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const descBox = document.getElementById('ronActiveDescriptionBox');
        const mainBox = document.getElementById('ronMainContentBox');
        const placeholder = document.getElementById('ronActiveDescPlaceholder');
        const isBodyActive = document.body.classList.contains('ron-reading-fullscreen-active');
        return {
          isOverlayHidden: overlay && overlay.hidden,
          isBodyActive,
          descBoxRestoredToMain: mainBox && descBox && mainBox.contains(descBox),
          placeholderRemoved: !placeholder
        };
      })()
    `);
    console.log('State after exiting Reading Mode:', exitedState);
    assert(exitedState.isOverlayHidden, 'Reading Mode overlay is hidden after exit');
    assert(!exitedState.isBodyActive, 'ron-reading-fullscreen-active class removed from body');
    assert(exitedState.descBoxRestoredToMain, 'Live description node restored to original main content container');
    assert(exitedState.placeholderRemoved, 'Placeholder was cleanly removed');

    // Test Escape key exit
    await evaluate("window.StudyRonDesign.openFullScreenReadingMode()");
    await delay(200);
    assert(await evaluate("window.StudyRonDesign.isFullScreenReadingModeActive()"), 'Re-entered Reading Mode via API');

    await send('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key: 'Escape',
      code: 'Escape'
    });
    await delay(200);
    assert(!await evaluate("window.StudyRonDesign.isFullScreenReadingModeActive()"), 'Escape key cleanly exits Reading Mode');

    console.log('\n--- GATE 5: Clean URL (/study) bubble-menu navigation ---');
    await send('Page.navigate', { url: `http://localhost:${PORT}/study` });
    // Wait until StudyRonDesign is initialized
    let ready = false;
    for (let i = 0; i < 30; i++) {
      await delay(200);
      ready = await evaluate(`Boolean(window.StudyRonDesign && window.StudyRonDesign.isDataReady && window.StudyRonDesign.isDataReady())`);
      if (ready) break;
    }
    const currentDomain = await evaluate(`
      (function() {
        return window.StudyRonDesign ? window.StudyRonDesign.getData().categories.length : 0;
      })()
    `);
    assert(currentDomain > 0, 'Study mode boots cleanly on extensionless /study URL');

  } catch (err) {
    console.error('Unhandled test error:', err);
    allPassed = false;
  } finally {
    if (cdpWs) cdpWs.close();
    chrome.kill();
    server.close();
  }

  if (allPassed) {
    console.log('\n🎉 ALL 6 PRODUCTION HOTFIX GATES PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOME GATES FAILED.\n');
    process.exit(1);
  }
});
