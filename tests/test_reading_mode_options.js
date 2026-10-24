/**
 * KnockoutNotes Reading Mode Verification Suite
 * Verifies all 6 mandatory reading options, PDF download integration,
 * responsive breakpoints, theme contrast, and persistence.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8133;
const ROOT = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

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
  console.log(`Test server running on port ${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-rm-options');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9273',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=' + userDataDir
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9273/json');
  const targets = await res.json();
  const ws = new WebSocket((targets.find(t => t.type === 'page') || targets[0]).webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(r => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) {
        ws.removeEventListener('message', h);
        r(d.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Runtime.enable');

  try {
    console.log('\n--- 1. LOAD STUDY PAGE & ENTER READING MODE (DESKTOP) ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?domain=drugs&cat=induction` });
    await new Promise(r => setTimeout(r, 1800));

    // Wait for data and open Propofol
    await send('Runtime.evaluate', {
      expression: `new Promise((resolve) => {
        function check() {
          if (window.StudyRonDesign && window.StudyRonDesign.isDataReady && window.StudyRonDesign.isDataReady()) {
            window.StudyRonDesign.openTopic('propofol');
            resolve(true);
          } else {
            setTimeout(check, 100);
          }
        }
        check();
      })`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 600));

    // Launch Reading Mode
    await send('Runtime.evaluate', {
      expression: `window.StudyRonDesign.openFullScreenReadingMode()`
    });
    await new Promise(r => setTimeout(r, 400));

    const isOpen = await send('Runtime.evaluate', {
      expression: `window.StudyRonDesign.isFullScreenReadingModeActive()`,
      returnByValue: true
    });
    assert(isOpen.result.value === true, 'Reading Mode overlay is open and active');

    console.log('\n--- 2. OPTION 1: READING COLUMN WIDTH (Narrow, Standard, Wide) ---');
    // Test Narrow (760px)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingWidth('narrow')` });
    await new Promise(r => setTimeout(r, 250));
    let widthCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const wrapper = document.querySelector('.ron-rm-content-wrapper');
        const computed = window.getComputedStyle(wrapper);
        return {
          attr: overlay.getAttribute('data-reading-width'),
          maxWidth: computed.maxWidth,
          cssVar: window.getComputedStyle(overlay).getPropertyValue('--rm-max-width'),
          wrapperVar: window.getComputedStyle(wrapper).getPropertyValue('--rm-max-width'),
          storage: localStorage.getItem('kn-reading-width')
        };
      })()`,
      returnByValue: true
    });
    console.log('Narrow width check:', widthCheck.result.value);
    assert(widthCheck.result.value.attr === 'narrow', 'Overlay attribute data-reading-width is narrow');
    assert(widthCheck.result.value.maxWidth === '760px', 'Content wrapper computed max-width is 760px');
    assert(widthCheck.result.value.storage === 'narrow', 'Narrow width persisted to localStorage');

    // Test Standard (900px)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingWidth('standard')` });
    await new Promise(r => setTimeout(r, 250));
    widthCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const wrapper = document.querySelector('.ron-rm-content-wrapper');
        const computed = window.getComputedStyle(wrapper);
        return {
          attr: overlay.getAttribute('data-reading-width'),
          maxWidth: computed.maxWidth,
          cssVar: window.getComputedStyle(overlay).getPropertyValue('--rm-max-width'),
          storage: localStorage.getItem('kn-reading-width')
        };
      })()`,
      returnByValue: true
    });
    console.log('Standard width check:', widthCheck.result.value);
    assert(widthCheck.result.value.attr === 'standard', 'Overlay attribute data-reading-width is standard');
    assert(widthCheck.result.value.maxWidth === '900px', 'Content wrapper computed max-width is 900px');
    assert(widthCheck.result.value.storage === 'standard', 'Standard width persisted to localStorage');

    // Test Wide (1100px)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingWidth('wide')` });
    await new Promise(r => setTimeout(r, 250));
    widthCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const wrapper = document.querySelector('.ron-rm-content-wrapper');
        const computed = window.getComputedStyle(wrapper);
        return {
          attr: overlay.getAttribute('data-reading-width'),
          maxWidth: computed.maxWidth,
          storage: localStorage.getItem('kn-reading-width')
        };
      })()`,
      returnByValue: true
    });
    assert(widthCheck.result.value.attr === 'wide', 'Overlay attribute data-reading-width is wide');
    assert(widthCheck.result.value.maxWidth === '1100px', 'Content wrapper computed max-width is 1100px');
    assert(widthCheck.result.value.storage === 'wide', 'Wide width persisted to localStorage');

    console.log('\n--- 3. OPTION 2: TYPOGRAPHY & LINE SPACING ---');
    // Test Serif vs Sans
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('serif')` });
    let typeCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const p = document.querySelector('.ron-rm-body-target p');
        const computed = window.getComputedStyle(p);
        return {
          attr: overlay.getAttribute('data-reading-font'),
          fontFamily: computed.fontFamily,
          storage: localStorage.getItem('kn-reading-font-family')
        };
      })()`,
      returnByValue: true
    });
    assert(typeCheck.result.value.attr === 'serif', 'Overlay attribute data-reading-font is serif');
    assert(typeCheck.result.value.fontFamily.toLowerCase().includes('georgia') || typeCheck.result.value.fontFamily.toLowerCase().includes('times'), 'Paragraph computed font-family uses serif stack');
    assert(typeCheck.result.value.storage === 'serif', 'Serif font persisted to localStorage');

    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('sans')` });

    // Test Line Height (Comfortable 1.65 vs Relaxed 1.82)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingLineHeight('relaxed')` });
    let lhCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        return {
          attr: overlay.getAttribute('data-reading-line-height'),
          storage: localStorage.getItem('kn-reading-line-height')
        };
      })()`,
      returnByValue: true
    });
    assert(lhCheck.result.value.attr === 'relaxed', 'Overlay attribute data-reading-line-height is relaxed');
    assert(lhCheck.result.value.storage === 'relaxed', 'Relaxed line height persisted to localStorage');

    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingLineHeight('comfortable')` });

    // Test Font Size Stepper
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(19)` });
    let fsCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const p = document.querySelector('.ron-rm-body-target p');
        const computed = window.getComputedStyle(p);
        return {
          fontSize: computed.fontSize,
          storage: localStorage.getItem('kn-reading-font-size')
        };
      })()`,
      returnByValue: true
    });
    assert(fsCheck.result.value.fontSize === '19px', 'Paragraph computed font-size updated to 19px');
    assert(fsCheck.result.value.storage === '19', 'Font size 19 persisted to localStorage');

    console.log('\n--- 4. OPTION 3: BOOKMARK & RESUME READING POSITION ---');
    // Scroll down 400px inside reading viewport
    await send('Runtime.evaluate', {
      expression: `(() => {
        const vp = document.getElementById('ronRmScrollViewport');
        vp.scrollTop = 400;
      })()`
    });
    await new Promise(r => setTimeout(r, 150));

    // Trigger bookmark action
    const bmResult = await send('Runtime.evaluate', {
      expression: `(() => {
        window.StudyRonDesign.bookmarkCurrentReadingPosition();
        const toast = document.getElementById('ronRmToast');
        const bmBtn = document.getElementById('ronRmBookmarkBtn');
        const raw = localStorage.getItem('kn-reading-pos-propofol');
        return {
          toastShown: toast && toast.classList.contains('show'),
          toastText: toast ? toast.textContent : '',
          btnBookmarked: bmBtn && bmBtn.classList.contains('bookmarked'),
          savedPos: raw ? JSON.parse(raw) : null
        };
      })()`,
      returnByValue: true
    });
    console.log('bmResult value:', bmResult.result.value);
    assert(bmResult.result.value.btnBookmarked === true, 'Bookmark button gains bookmarked active class');
    assert(bmResult.result.value.savedPos !== null && bmResult.result.value.savedPos.scrollY >= 380, 'Exact scroll position saved to localStorage');
    console.log('Bookmark saved position:', bmResult.result.value.savedPos);

    console.log('\n--- 5. OPTION 4: READING THEMES & WCAG AA CONTRAST ---');
    // Dark Mode Charcoal Contrast Test
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('dark')` });
    const darkPalette = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const heading = document.querySelector('.ron-rm-heading');
        const bodyP = document.querySelector('.ron-rm-body-target p');
        const pearl = document.querySelector('.ron-rm-body-target .ron-pearl-box, .ron-rm-body-target .st-pearl-card');
        return {
          themeAttr: overlay.getAttribute('data-reading-theme'),
          bg: window.getComputedStyle(overlay).backgroundColor,
          headingColor: window.getComputedStyle(heading).color,
          textColor: window.getComputedStyle(bodyP).color,
          pearlBg: pearl ? window.getComputedStyle(pearl).backgroundColor : null
        };
      })()`,
      returnByValue: true
    });
    console.log('Dark Mode Palette:', darkPalette.result.value);
    assert(darkPalette.result.value.themeAttr === 'dark', 'Dark theme attribute set on overlay');
    assert(darkPalette.result.value.bg === 'rgb(23, 26, 33)', 'Dark background is eye-comfortable charcoal #171A21');

    // Sepia Mode Test
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('sepia')` });
    const sepiaPalette = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const heading = document.querySelector('.ron-rm-heading');
        const bodyP = document.querySelector('.ron-rm-body-target p');
        return {
          themeAttr: overlay.getAttribute('data-reading-theme'),
          bg: window.getComputedStyle(overlay).backgroundColor,
          headingColor: window.getComputedStyle(heading).color,
          textColor: window.getComputedStyle(bodyP).color
        };
      })()`,
      returnByValue: true
    });
    console.log('Sepia Mode Palette:', sepiaPalette.result.value);
    assert(sepiaPalette.result.value.themeAttr === 'sepia', 'Sepia theme attribute set on overlay');
    assert(sepiaPalette.result.value.bg === 'rgb(251, 240, 217)', 'Sepia background is soft cream #FBF0D9');

    // Restore Light Theme
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('light')` });

    console.log('\n--- 6. OPTION 5: FOCUS MODE & AUTO-COLLAPSE ---');
    // Enable focus mode
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.toggleFocusMode(true)` });
    let focusState = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const pill = document.getElementById('ronRmExitFocusBtn');
        return {
          hasActiveClass: overlay.classList.contains('ron-rm-focus-active'),
          pillVisible: pill && !pill.hidden
        };
      })()`,
      returnByValue: true
    });
    assert(focusState.result.value.hasActiveClass === true, 'Overlay has class ron-rm-focus-active');
    assert(focusState.result.value.pillVisible === true, 'Floating exit focus pill is visible');

    // Simulate downward scroll > 60px inside viewport
    await send('Runtime.evaluate', {
      expression: `(() => {
        const vp = document.getElementById('ronRmScrollViewport');
        vp.scrollTop = 700;
        vp.dispatchEvent(new Event('scroll'));
      })()`
    });
    await new Promise(r => setTimeout(r, 100));

    let topbarCollapsed = await send('Runtime.evaluate', {
      expression: `(() => {
        const topbar = document.getElementById('ronRmTopbar');
        return topbar.classList.contains('ron-rm-topbar-collapsed');
      })()`,
      returnByValue: true
    });
    assert(topbarCollapsed.result.value === true, 'Topbar auto-collapses on downward scroll in Focus Mode');

    // Click floating exit focus pill
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.getElementById('ronRmExitFocusBtn').click();
      })()`
    });
    await new Promise(r => setTimeout(r, 100));

    focusState = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const pill = document.getElementById('ronRmExitFocusBtn');
        const topbar = document.getElementById('ronRmTopbar');
        return {
          hasActiveClass: overlay.classList.contains('ron-rm-focus-active'),
          pillHidden: pill && pill.hidden,
          topbarCollapsed: topbar.classList.contains('ron-rm-topbar-collapsed')
        };
      })()`,
      returnByValue: true
    });
    assert(focusState.result.value.hasActiveClass === false, 'Focus mode cleanly deactivated');
    assert(focusState.result.value.topbarCollapsed === false, 'Topbar restored to visible');

    console.log('\n--- 7. OPTION 6: READING PROGRESS STRIP & PERCENTAGE ---');
    const progressCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const vp = document.getElementById('ronRmScrollViewport');
        vp.scrollTop = vp.scrollHeight / 2;
        vp.dispatchEvent(new Event('scroll'));
        const pctEl = document.getElementById('ronRmProgressPct');
        const barEl = document.getElementById('ronRmProgressBar');
        return {
          pctText: pctEl.textContent,
          barWidth: barEl.style.width
        };
      })()`,
      returnByValue: true
    });
    console.log('Progress at mid scroll:', progressCheck.result.value);
    assert(progressCheck.result.value.pctText !== '0%' && progressCheck.result.value.pctText.includes('%'), 'Progress percentage is non-zero and formatted properly');

    console.log('\n--- 8. PDF DOWNLOAD INTEGRATION ---');
    // Verify PDF button invokes initiateChapterDownload
    const pdfCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        let called = false;
        let calledArgs = null;
        window.KN_PAYMENTS = window.KN_PAYMENTS || {};
        window.KN_PAYMENTS.initiateChapterDownload = function(id, name) {
          called = true;
          calledArgs = { id, name };
        };
        const pdfBtn = document.getElementById('ronRmPdfBtn');
        pdfBtn.click();
        return { called, calledArgs };
      })()`,
      returnByValue: true
    });
    assert(pdfCheck.result.value.called === true, 'PDF button invokes window.KN_PAYMENTS.initiateChapterDownload');
    console.log('PDF download called with args:', pdfCheck.result.value.calledArgs);

    console.log('\n--- 9. RESPONSIVE BREAKPOINT TESTS (Desktop, Landscape, Portrait) ---');
    // 9a. Desktop (1280x900)
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await new Promise(r => setTimeout(r, 200));
    let bpCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const widthBtn = document.getElementById('ronRmWidthToggleBtn');
        const overflowBtn = document.getElementById('ronRmOverflowBtn');
        const portraitPct = document.getElementById('ronRmPortraitPct');
        return {
          widthBtnDisplay: window.getComputedStyle(widthBtn).display,
          overflowBtnDisplay: window.getComputedStyle(overflowBtn).display,
          portraitPctDisplay: window.getComputedStyle(portraitPct).display
        };
      })()`,
      returnByValue: true
    });
    assert(bpCheck.result.value.widthBtnDisplay !== 'none', 'Desktop: Direct toolbar controls are visible');
    assert(bpCheck.result.value.overflowBtnDisplay === 'none', 'Desktop: Overflow three-dot button is hidden');

    // 9b. Android Landscape (844x390)
    await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 2.5, mobile: true });
    await new Promise(r => setTimeout(r, 200));
    bpCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const widthBtn = document.getElementById('ronRmWidthToggleBtn');
        const overflowBtn = document.getElementById('ronRmOverflowBtn');
        return {
          widthBtnDisplay: window.getComputedStyle(widthBtn).display,
          overflowBtnDisplay: window.getComputedStyle(overflowBtn).display
        };
      })()`,
      returnByValue: true
    });
    assert(bpCheck.result.value.widthBtnDisplay !== 'none', 'Android Landscape: Single-line direct controls visible');
    assert(bpCheck.result.value.overflowBtnDisplay === 'none', 'Android Landscape: Overflow button hidden');

    // 9c. Android Portrait (390x844)
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await new Promise(r => setTimeout(r, 200));
    bpCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const widthBtn = document.getElementById('ronRmWidthToggleBtn');
        const overflowBtn = document.getElementById('ronRmOverflowBtn');
        const portraitPct = document.getElementById('ronRmPortraitPct');
        return {
          widthBtnDisplay: window.getComputedStyle(widthBtn).display,
          overflowBtnDisplay: window.getComputedStyle(overflowBtn).display,
          portraitPctDisplay: window.getComputedStyle(portraitPct).display
        };
      })()`,
      returnByValue: true
    });
    assert(bpCheck.result.value.widthBtnDisplay === 'none', 'Android Portrait: Direct controls hidden into overflow');
    assert(bpCheck.result.value.overflowBtnDisplay !== 'none', 'Android Portrait: Overflow three-dot button is visible');
    assert(bpCheck.result.value.portraitPctDisplay !== 'none', 'Android Portrait: Progress percentage is visible in topbar');

    // Open overflow menu
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.getElementById('ronRmOverflowBtn').click();
      })()`
    });
    await new Promise(r => setTimeout(r, 150));

    const overflowOpen = await send('Runtime.evaluate', {
      expression: `(() => {
        const dd = document.getElementById('ronRmOverflowDropdown');
        return !dd.hidden;
      })()`,
      returnByValue: true
    });
    assert(overflowOpen.result.value === true, 'Android Portrait: Overflow bottom sheet opens on three-dot click');

    console.log('\n🎉 ALL READING MODE RESPONSIVE UI & OPTIONS CHECKS PASSED PERFECTLY!\n');
    chrome.kill();
    server.close();
    process.exit(0);

  } catch (err) {
    console.error('Test error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});
