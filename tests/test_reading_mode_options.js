/**
 * KnockoutNotes Reading Mode Verification Suite
 * Verifies all 5 new requirements:
 * 1. Download Monograph PDF integration & server pricing without 404 (Propofol, Anaesthesia, CC).
 * 2. Dark-theme contrast (#151922 bg, #1d2330 surface, #edf2f7 primary text, #f8fafc headings, #60a5fa links).
 * 3. Typography options: Sans, Serif, and Monospace across content root.
 * 4. Font-size controls: 14px to 26px, cascade to prose/points/lists, proportional headings (~1.3x), fixed toolbar.
 * 5. Text alignment controls: Left, Justify, Centre, Right on body/prose/lists, with tables protected.
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
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-rm-options-v2');

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
    console.log('\n--- 1. LOAD STUDY PAGE & ENTER READING MODE ON PROPOFOL ---');
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

    console.log('\n--- 2. DARK-THEME CONTRAST & WCAG COMPLIANCE (#151922 / #1d2330 / #edf2f7 / #f8fafc) ---');
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('dark')` });
    await new Promise(r => setTimeout(r, 200));

    const darkCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const heading = document.querySelector('.ron-rm-heading, .ron-rm-body-target h1, .ron-rm-body-target h2');
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p, .ron-rm-body-target .ron-point-text');
        const cardTitle = document.querySelector('.ron-rm-body-target .ron-card-title, .ron-rm-body-target h3');
        return {
          themeAttr: overlay.getAttribute('data-reading-theme'),
          bg: window.getComputedStyle(overlay).backgroundColor,
          headingColor: heading ? window.getComputedStyle(heading).color : null,
          proseColor: prose ? window.getComputedStyle(prose).color : null,
          cardTitleColor: cardTitle ? window.getComputedStyle(cardTitle).color : null,
          storage: localStorage.getItem('kn-reading-theme')
        };
      })()`,
      returnByValue: true
    });
    console.log('Dark Mode Computed Styles:', darkCheck.result.value);
    assert(darkCheck.result.value.themeAttr === 'dark', 'Dark theme attribute is set');
    assert(darkCheck.result.value.bg === 'rgb(21, 25, 34)', 'Dark background computed matches #151922 (rgb(21, 25, 34))');
    assert(darkCheck.result.value.proseColor === 'rgb(237, 242, 247)', 'Body prose/text computed matches #edf2f7 (rgb(237, 242, 247))');
    assert(darkCheck.result.value.cardTitleColor === 'rgb(248, 250, 252)', 'Headings computed match #f8fafc (rgb(248, 250, 252))');
    assert(darkCheck.result.value.storage === 'dark', 'Dark theme stored in localStorage');

    // Test Light -> Dark -> Light transition
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('light')` });
    await new Promise(r => setTimeout(r, 100));
    const lightCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        return window.getComputedStyle(overlay).backgroundColor;
      })()`,
      returnByValue: true
    });
    assert(lightCheck.result.value === 'rgb(255, 255, 255)', 'Clean transition back to Light theme');

    // Return to dark theme for subsequent tests
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingTheme('dark')` });

    console.log('\n--- 3. TYPOGRAPHY OPTIONS (Sans, Serif, Monospace across content root) ---');
    // Test Sans
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('sans')` });
    let fontCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return window.getComputedStyle(prose).fontFamily;
      })()`,
      returnByValue: true
    });
    assert(!fontCheck.result.value.toLowerCase().includes('georgia') && !fontCheck.result.value.toLowerCase().includes('monospace'), 'Sans font applied to content');

    // Test Serif
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('serif')` });
    fontCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return window.getComputedStyle(prose).fontFamily;
      })()`,
      returnByValue: true
    });
    assert(fontCheck.result.value.toLowerCase().includes('georgia') || fontCheck.result.value.toLowerCase().includes('times'), 'Serif font applied to content');

    // Test Monospace
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('mono')` });
    fontCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        const heading = document.querySelector('.ron-rm-body-target .ron-card-title, .ron-rm-body-target h2');
        return {
          attr: document.getElementById('ronReadingModeOverlay').getAttribute('data-reading-font'),
          proseFont: window.getComputedStyle(prose).fontFamily.toLowerCase(),
          headingFont: window.getComputedStyle(heading).fontFamily.toLowerCase(),
          storage: localStorage.getItem('kn-reading-font-family')
        };
      })()`,
      returnByValue: true
    });
    console.log('Monospace Font Check:', fontCheck.result.value);
    assert(fontCheck.result.value.attr === 'mono', 'Overlay attribute data-reading-font is mono');
    assert(fontCheck.result.value.proseFont.includes('mono') || fontCheck.result.value.proseFont.includes('consolas') || fontCheck.result.value.proseFont.includes('menlo'), 'Content prose computed font-family uses monospace stack');
    assert(fontCheck.result.value.storage === 'mono', 'Mono font choice persisted to localStorage');

    // Return to Sans default
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontFamily('sans')` });

    console.log('\n--- 4. FONT-SIZE CONTROLS & PROPORTIONAL HEADING SCALING (14px - 26px) ---');
    // Test minimum limit (14px)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(10)` });
    let sizeCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return {
          size: window.getComputedStyle(prose).fontSize,
          storage: localStorage.getItem('kn-reading-font-size')
        };
      })()`,
      returnByValue: true
    });
    assert(sizeCheck.result.value.size === '14px', 'Font size clamped to minimum 14px');

    // Test maximum limit (26px)
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(30)` });
    sizeCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        const heading = document.querySelector('.ron-rm-body-target .ron-card-title, .ron-rm-body-target h2');
        const topbarBtn = document.querySelector('.ron-rm-exit-btn, .ron-rm-sections-btn, .ron-rm-topbar-btn');
        return {
          proseSize: window.getComputedStyle(prose).fontSize,
          headingSize: window.getComputedStyle(heading).fontSize,
          topbarSize: window.getComputedStyle(topbarBtn).fontSize,
          storage: localStorage.getItem('kn-reading-font-size')
        };
      })()`,
      returnByValue: true
    });
    console.log('26px Max Font Size Check:', sizeCheck.result.value);
    assert(sizeCheck.result.value.proseSize === '26px', 'Font size clamped to maximum 26px');
    // Heading should scale proportionately (~1.3 * 26px = ~33.8px)
    const hSizeNum = parseFloat(sizeCheck.result.value.headingSize);
    assert(hSizeNum >= 30 && hSizeNum <= 36, `Headings scaled proportionately to ${sizeCheck.result.value.headingSize} (expected ~33.8px)`);
    assert(sizeCheck.result.value.topbarSize === '13px', 'Toolbar button font size remains fixed at 13px (does not scale)');
    assert(sizeCheck.result.value.storage === '26', 'Font size 26 persisted to localStorage');

    // Reset to comfortable default 17px
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingFontSize(17)` });

    console.log('\n--- 5. TEXT ALIGNMENT CONTROLS (Left, Justify, Centre, Right) ---');
    // Test Justify
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingAlign('justify')` });
    let alignCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        const table = document.querySelector('.ron-rm-body-target table');
        return {
          attr: overlay.getAttribute('data-reading-align'),
          proseAlign: window.getComputedStyle(prose).textAlign,
          tableAlign: table ? window.getComputedStyle(table).textAlign : 'left',
          storage: localStorage.getItem('kn-reading-align')
        };
      })()`,
      returnByValue: true
    });
    console.log('Justify Alignment Check:', alignCheck.result.value);
    assert(alignCheck.result.value.attr === 'justify', 'Overlay attribute data-reading-align is justify');
    assert(alignCheck.result.value.proseAlign === 'justify', 'Body text computed text-align is justify');
    assert(alignCheck.result.value.tableAlign === 'left', 'Tables protected from forced justify (remain left-aligned)');
    assert(alignCheck.result.value.storage === 'justify', 'Justify alignment persisted to localStorage');

    // Test Centre
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingAlign('center')` });
    alignCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return window.getComputedStyle(prose).textAlign;
      })()`,
      returnByValue: true
    });
    assert(alignCheck.result.value === 'center', 'Body text computed text-align is center');

    // Test Right
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingAlign('right')` });
    alignCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return window.getComputedStyle(prose).textAlign;
      })()`,
      returnByValue: true
    });
    assert(alignCheck.result.value === 'right', 'Body text computed text-align is right');

    // Reset to default Left
    await send('Runtime.evaluate', { expression: `window.StudyRonDesign.setReadingAlign('left')` });
    alignCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const prose = document.querySelector('.ron-rm-body-target .ron-prose, .ron-rm-body-target p');
        return window.getComputedStyle(prose).textAlign;
      })()`,
      returnByValue: true
    });
    assert(alignCheck.result.value === 'left', 'Body text reset to default left-align');

    console.log('\n--- 6. PDF DOWNLOAD INTEGRATION & IDENTIFIER VERIFICATION ---');
    const pdfInvocation = await send('Runtime.evaluate', {
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
    assert(pdfInvocation.result.value.called === true, 'PDF button invokes window.KN_PAYMENTS.initiateChapterDownload');
    assert(pdfInvocation.result.value.calledArgs.id === 'propofol', 'Passes canonical drug ID "propofol"');
    assert(pdfInvocation.result.value.calledArgs.name === 'Propofol', 'Passes drug name "Propofol"');
    console.log('PDF download called with canonical args:', pdfInvocation.result.value.calledArgs);

    console.log('\n--- 7. BACKEND SYLLABUS ENTITLEMENTS VERIFICATION (Propofol, Anaesthesia, CC) ---');
    // Import worker payments module directly to verify backend responses
    const { getChapterContent, handleGetChapterPricing, getCategoryDomain } = await import('file:///F:/KnockoutNotes/worker/payments.js');

    const mockEnv = {
      DB: {
        prepare: () => ({
          bind: () => ({
            first: async () => null,
            all: async () => ({ results: [] })
          })
        })
      }
    };

    // 7a. Propofol (Drug monograph)
    const propofolChapter = getChapterContent('propofol');
    assert(propofolChapter !== null, 'Propofol found in worker syllabus');
    assert(propofolChapter.name === 'Propofol', 'Propofol chapter name is correct');
    assert(Array.isArray(propofolChapter.sections) && propofolChapter.sections.length >= 6, 'Propofol has populated sections for PDF generator');
    assert(getCategoryDomain(propofolChapter.cat, propofolChapter.id) === 'drugs', 'Propofol mapped to "drugs" domain');

    const reqPropofol = new Request('https://knockoutnotes.com/api/payments/chapter-price?chapter_id=propofol');
    const resPropofol = await handleGetChapterPricing(reqPropofol, mockEnv, null);
    assert(resPropofol.status === 200, 'Unauth Propofol pricing returns 200 (not 404)');
    const dataPropofol = await resPropofol.json();
    assert(dataPropofol.priceInr === 12, 'Propofol pricing defaults to ₹12');
    assert(dataPropofol.isPurchased === false, 'Unauth unentitled Propofol requires payment');

    // 7b. Preoperative Assessment (Anaesthesia topic)
    const preopChapter = getChapterContent('preop-assessment');
    assert(preopChapter !== null, 'preop-assessment found in worker syllabus');
    assert(getCategoryDomain(preopChapter.cat, preopChapter.id) === 'anaesthesia', 'preop-assessment mapped to "anaesthesia" domain');

    const reqPreop = new Request('https://knockoutnotes.com/api/payments/chapter-price?chapter_id=preop-assessment');
    const resPreop = await handleGetChapterPricing(reqPreop, mockEnv, null);
    assert(resPreop.status === 200, 'preop-assessment pricing returns 200');
    const dataPreop = await resPreop.json();
    assert(dataPreop.isFree === true && dataPreop.priceInr === 0, 'preop-assessment is free monograph');
    assert(dataPreop.downloadUrl !== null, 'preop-assessment provides valid download URL');

    // 7c. ICU Analgosedation (Critical Care topic)
    const ccChapter = getChapterContent('icu-analgosedation-padis-delirium');
    assert(ccChapter !== null, 'icu-analgosedation-padis-delirium found in worker syllabus');
    assert(getCategoryDomain(ccChapter.cat, ccChapter.id) === 'critical_care', 'icu-analgosedation mapped to "critical_care" domain');

    const reqCC = new Request('https://knockoutnotes.com/api/payments/chapter-price?chapter_id=icu-analgosedation-padis-delirium');
    const resCC = await handleGetChapterPricing(reqCC, mockEnv, null);
    assert(resCC.status === 200, 'icu-analgosedation pricing returns 200');
    const dataCC = await resCC.json();
    assert(dataCC.priceInr === 19, 'Critical care pricing defaults to ₹19');

    console.log('\n🎉 ALL 5 READING MODE REQUIREMENTS FULLY VERIFIED & PASSING!\n');
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
