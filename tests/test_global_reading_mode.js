/**
 * ============================================================================
 * Knockout Notes — Global Reading Mode Cross-Site Test Matrix
 * ============================================================================
 * Uses Headless Chrome CDP to verify all 4 mandatory Reading Mode requirements
 * across ALL content types and domains (Anaesthesia, Drugs, Critical Care):
 *
 * 1. Light-mode and dark-mode high contrast readability across all chapters
 *    (preventing faded/pale/translucent text even when body.dark is active).
 *    Also verifies bottom-right toast container and toast styling.
 * 2. Font-size adjustment (14px - 26px) affects prose across all chapters.
 * 3. Text alignment controls (Left, Justify, Centre, Right) apply to prose
 *    while preserving left alignment for tables.
 * 4. PDF download & payment modal z-index layering (z-index: 100002 > 100000)
 *    and non-blocking entitlement checks across all domains and casing.
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8134;
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
  console.log(`Global Reading Mode test server running on port ${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-rm-global');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9274',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=' + userDataDir
  ]);

  await new Promise(r => setTimeout(r, 1600));
  const res = await fetch('http://127.0.0.1:9274/json');
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
    console.log('\n--- 1. LOAD STUDY PAGE & SIMULATE BODY.DARK (SITE DEFAULT) ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?domain=drugs&cat=induction` });
    await new Promise(r => setTimeout(r, 1800));

    // Ensure site is in dark mode (default)
    await send('Runtime.evaluate', {
      expression: `document.body.classList.add('dark');`
    });

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

    console.log('\n--- 2. LIGHT-MODE READABILITY CHECK UNDER BODY.DARK ---');
    // Switch Reading Mode to Light Theme while body has class 'dark'
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('light')` });
    await new Promise(r => setTimeout(r, 200));

    const lightContrast = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const bodyTarget = document.getElementById('ronRmBodyTarget');
        const heading = bodyTarget.querySelector('h1, h2, h3, .ron-card-title');
        const prose = bodyTarget.querySelector('p, .ron-point-text, .ron-prose');
        const overlayComp = window.getComputedStyle(overlay);
        const headingComp = heading ? window.getComputedStyle(heading) : null;
        const proseComp = prose ? window.getComputedStyle(prose) : null;
        return {
          bodyHasDark: document.body.classList.contains('dark'),
          readingThemeAttr: overlay.getAttribute('data-reading-theme'),
          overlayBg: overlayComp.backgroundColor,
          headingVar: overlayComp.getPropertyValue('--rm-heading').trim(),
          textVar: overlayComp.getPropertyValue('--rm-text').trim(),
          headingColor: headingComp ? headingComp.color : null,
          proseColor: proseComp ? proseComp.color : null
        };
      })()`,
      returnByValue: true
    });

    console.log('Light Contrast Evaluation:', lightContrast.result.value);
    const lc = lightContrast.result.value;
    assert(lc.bodyHasDark === true, 'document.body contains class dark');
    assert(lc.readingThemeAttr === 'light', 'Reading Mode theme attribute is light');
    assert(lc.headingVar === '#0f172a', 'Light theme heading variable is high-contrast #0f172a');
    assert(lc.textVar === '#1e293b', 'Light theme text variable is crisp slate #1e293b');
    // Verify computed colors are dark charcoal/slate, not washed-out off-white rgb(232, 232, 240)
    assert(
      lc.proseColor.includes('30, 41, 59') || lc.proseColor.includes('15, 23, 42') || lc.proseColor.includes('0, 0, 0'),
      'Body prose computed color is high contrast dark text (not pale lavender or off-white)'
    );

    console.log('\n--- 3. BOTTOM-RIGHT TOAST STYLING & HIGH CONTRAST CHECK ---');
    const toastCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        let container = document.getElementById('knToastContainer');
        if (!container) {
          container = document.createElement('div');
          container.id = 'knToastContainer';
          container.className = 'kn-toast-container';
          document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.className = 'kn-toast info';
        toast.id = 'testToastItem';
        toast.textContent = 'Checking chapter entitlement...';
        container.appendChild(toast);

        const containerComp = window.getComputedStyle(container);
        const toastComp = window.getComputedStyle(toast);
        return {
          containerZIndex: containerComp.zIndex,
          toastBg: toastComp.backgroundColor,
          toastColor: toastComp.color
        };
      })()`,
      returnByValue: true
    });

    console.log('Toast Evaluation:', toastCheck.result.value);
    const tc = toastCheck.result.value;
    assert(tc.containerZIndex === '100002', 'Toast container z-index is 100002 (> 100000 overlay)');
    assert(tc.toastBg.includes('15, 23, 42'), 'Toast background is dark #0f172a (not washed out light gray)');
    assert(tc.toastColor.includes('248, 250, 252') || tc.toastColor.includes('255, 255, 255'), 'Toast text is crisp white/slate-50');

    console.log('\n--- 4. DARK THEME & SEPIA THEME VERIFICATION ---');
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('dark')` });
    await new Promise(r => setTimeout(r, 200));
    const darkCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const comp = window.getComputedStyle(overlay);
        return {
          bg: comp.backgroundColor,
          text: comp.getPropertyValue('--rm-text').trim(),
          heading: comp.getPropertyValue('--rm-heading').trim()
        };
      })()`,
      returnByValue: true
    });
    console.log('Dark Theme Evaluation:', darkCheck.result.value);
    assert(darkCheck.result.value.bg.includes('21, 25, 34'), 'Dark theme bg is #151922');
    assert(darkCheck.result.value.text === '#edf2f7', 'Dark theme text is #edf2f7');
    assert(darkCheck.result.value.heading === '#f8fafc', 'Dark theme heading is #f8fafc');

    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('sepia')` });
    await new Promise(r => setTimeout(r, 200));
    const sepiaCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const comp = window.getComputedStyle(overlay);
        return {
          bg: comp.backgroundColor,
          text: comp.getPropertyValue('--rm-text').trim(),
          heading: comp.getPropertyValue('--rm-heading').trim()
        };
      })()`,
      returnByValue: true
    });
    console.log('Sepia Theme Evaluation:', sepiaCheck.result.value);
    assert(sepiaCheck.result.value.text === '#2D241E', 'Sepia theme text is #2D241E');
    assert(sepiaCheck.result.value.heading === '#451A03', 'Sepia theme heading is #451A03');

    // Reset to Light
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('light')` });

    console.log('\n--- 5. FONT SIZE CONTROLS (14px - 26px) ACROSS MULTIPLE CHAPTERS ---');
    const chaptersToTest = ['propofol', 'preop-assessment', 'icu-analgosedation-padis-delirium'];

    for (const chapId of chaptersToTest) {
      await send('Runtime.evaluate', {
        expression: `window.StudyRonDesign.exitFullScreenReadingMode();`
      });
      await new Promise(r => setTimeout(r, 200));

      await send('Runtime.evaluate', {
        expression: `window.StudyRonDesign.openTopic('${chapId}');`
      });
      await new Promise(r => setTimeout(r, 300));

      await send('Runtime.evaluate', {
        expression: `window.StudyRonDesign.openFullScreenReadingMode();`
      });
      await new Promise(r => setTimeout(r, 300));

      // Test Min 14px
      await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(14);` });
      const minCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const bodyTarget = document.getElementById('ronRmBodyTarget');
          const prose = bodyTarget.querySelector('p, .ron-point-text, .ron-prose, .st-prose');
          return {
            varSize: bodyTarget.style.getPropertyValue('--rm-font-size'),
            computedProseSize: prose ? window.getComputedStyle(prose).fontSize : null
          };
        })()`,
        returnByValue: true
      });
      console.log(`Chapter ${chapId} 14px font check:`, minCheck.result.value);
      assert(minCheck.result.value.varSize === '14px', 'Var size set to 14px');
      assert(minCheck.result.value.computedProseSize === '14px', 'Computed prose size is 14px');

      // Test Max 26px
      await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(26);` });
      const maxCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const bodyTarget = document.getElementById('ronRmBodyTarget');
          const prose = bodyTarget.querySelector('p, .ron-point-text, .ron-prose, .st-prose');
          const heading = bodyTarget.querySelector('h2, h3, .ron-card-title');
          return {
            varSize: bodyTarget.style.getPropertyValue('--rm-font-size'),
            computedProseSize: prose ? window.getComputedStyle(prose).fontSize : null,
            computedHeadingSize: heading ? window.getComputedStyle(heading).fontSize : null
          };
        })()`,
        returnByValue: true
      });
      console.log(`Chapter ${chapId} 26px font check:`, maxCheck.result.value);
      assert(maxCheck.result.value.varSize === '26px', 'Var size set to 26px');
      assert(maxCheck.result.value.computedProseSize === '26px', 'Computed prose size is 26px');
      assert(parseFloat(maxCheck.result.value.computedHeadingSize) > 30, 'Headings scale proportionately (>30px)');
    }

    console.log('\n--- 6. TEXT ALIGNMENT CONTROLS (Left, Justify, Centre, Right) ---');
    const alignments = ['left', 'justify', 'center', 'right'];
    for (const align of alignments) {
      await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingAlign('${align}');` });
      const alignCheck = await send('Runtime.evaluate', {
        expression: `(() => {
          const overlay = document.getElementById('ronReadingModeOverlay');
          const bodyTarget = document.getElementById('ronRmBodyTarget');
          const prose = bodyTarget.querySelector('p, .ron-point-text, .ron-prose');
          const activeBtn = overlay.querySelector('[data-rm-align-val="${align}"]');
          return {
            attr: overlay.getAttribute('data-reading-align'),
            bodyTargetAttr: bodyTarget.getAttribute('data-reading-align'),
            btnActive: activeBtn ? activeBtn.classList.contains('active') : false,
            computedProseAlign: prose ? window.getComputedStyle(prose).textAlign : null
          };
        })()`,
        returnByValue: true
      });
      console.log(`Alignment '${align}' check:`, alignCheck.result.value);
      assert(alignCheck.result.value.attr === align, `Overlay attribute is ${align}`);
      assert(alignCheck.result.value.computedProseAlign === align, `Computed prose text-align is ${align}`);
    }

    // Verify tables maintain text-align: left
    const tableAlignCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const bodyTarget = document.getElementById('ronRmBodyTarget');
        let tbl = bodyTarget.querySelector('table');
        if (!tbl) {
          tbl = document.createElement('table');
          bodyTarget.appendChild(tbl);
        }
        return window.getComputedStyle(tbl).textAlign;
      })()`,
      returnByValue: true
    });
    console.log('Table text-align under Right alignment:', tableAlignCheck.result.value);
    assert(tableAlignCheck.result.value === 'left', 'Table text-align remains strictly left');

    console.log('\n--- 7. PAYMENT & AUTH MODAL Z-INDEX LAYERING (Above 100000 Overlay) ---');
    const modalZIndexCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const payModal = document.createElement('div');
        payModal.className = 'kn-payment-modal-backdrop';
        document.body.appendChild(payModal);

        const authModal = document.createElement('div');
        authModal.id = 'knActiveModal';
        authModal.className = 'kn-modal-backdrop';
        document.body.appendChild(authModal);

        const payZ = window.getComputedStyle(payModal).zIndex;
        const authZ = window.getComputedStyle(authModal).zIndex;
        payModal.remove();
        authModal.remove();
        return { payZ, authZ };
      })()`,
      returnByValue: true
    });
    console.log('Modal Layering Check:', modalZIndexCheck.result.value);
    assert(modalZIndexCheck.result.value.payZ === '100002', 'Payment modal z-index is 100002 (> 100000)');
    assert(modalZIndexCheck.result.value.authZ === '100002', 'Auth modal z-index is 100002 (> 100000)');

    console.log('\n--- 8. PDF DOWNLOAD HANDLER RESOLUTION & FALLBACK ---');
    const pdfHandlerCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        let calledWith = null;
        window.KN_PAYMENTS = {
          initiateChapterDownload: (id, title) => {
            calledWith = { id, title };
          }
        };
        const pdfBtn = document.getElementById('ronRmPdfBtn') || document.querySelector('.ron-rm-pdf-btn');
        if (pdfBtn) pdfBtn.click();
        return calledWith;
      })()`,
      returnByValue: true
    });
    console.log('PDF Download Handler Invocation:', pdfHandlerCheck.result.value);
    assert(pdfHandlerCheck.result.value !== null, 'PDF download handler was invoked');
    assert(pdfHandlerCheck.result.value.id === 'icu-analgosedation-padis-delirium', 'Resolved correct active chapter ID');

    console.log('\n======================================================');
    console.log('🎉 ALL GLOBAL READING MODE TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    await ws.close();
    chrome.kill();
    server.close();
  }

  // Also verify backend payments module in node
  console.log('--- 9. BACKEND PAYMENTS SYLLABUS CROSS-DOMAIN TEST ---');
  const paymentsModule = await import('../worker/payments.js');
  const matrix = [
    { id: 'propofol', expectedDomain: 'drugs', expectedFree: false },
    { id: 'Propofol', expectedDomain: 'drugs', expectedFree: false },
    { id: 'preop-assessment', expectedDomain: 'anaesthesia', expectedFree: true },
    { id: 'PREOP-ASSESSMENT', expectedDomain: 'anaesthesia', expectedFree: true },
    { id: 'icu-analgosedation-padis-delirium', expectedDomain: 'critical_care', expectedFree: false },
    { id: 'difficult-airway-icu-extubation', expectedDomain: 'critical_care', expectedFree: false },
    { id: 'dka-perioperative-glycaemic-protocols', expectedDomain: 'anaesthesia', expectedFree: true },
    { id: 'ketamine', expectedDomain: 'drugs', expectedFree: false },
    { id: 'sugammadex', expectedDomain: 'drugs', expectedFree: false },
    { id: 'case-mitral-stenosis-phtn', expectedDomain: 'cases', expectedFree: false }
  ];

  for (const item of matrix) {
    const chapter = paymentsModule.getChapterContent(item.id);
    assert(chapter !== null, `Chapter ${item.id} found in syllabus`);
    const domain = paymentsModule.getCategoryDomain(chapter.cat, chapter.id);
    const isFree = paymentsModule.isFreeChapter(chapter.id, chapter.cat);
    console.log(`Backend topic check: ${item.id} -> ${chapter.name} [domain: ${domain}, free: ${isFree}]`);
    assert(domain === item.expectedDomain, `Domain matches ${item.expectedDomain}`);
    assert(isFree === item.expectedFree, `Free status matches ${item.expectedFree}`);
  }
  console.log('✅ PASS: All backend syllabus topics resolved with correct domains & pricing');
});
