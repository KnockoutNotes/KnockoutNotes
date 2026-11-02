const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

const PORT = 8142;
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
  console.log(`Functional test server running on ${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(ROOT, 'scratch/chrome-cdp-profile-func-e2e');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9282',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=' + userDataDir
  ]);

  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch('http://127.0.0.1:9282/json');
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

  async function evaluate(expression) {
    const r = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (r.exceptionDetails) {
      throw new Error(`Evaluation error: ${JSON.stringify(r.exceptionDetails)}`);
    }
    return r.result ? r.result.value : undefined;
  }

  async function safeNavigate(url) {
    await send('Page.navigate', { url });
    // Wait until document is ready and study data is loaded
    for (let i = 0; i < 40; i++) {
      await new Promise(r => setTimeout(r, 250));
      try {
        const ready = await evaluate(`(() => {
          return document.readyState === 'complete' && !!document.querySelector('.ron-topic-detail-card, .ron-dashboard, .ron-topic-grid');
        })()`);
        if (ready) {
          // Extra buffer for topic rendering if topic param was present
          await new Promise(r => setTimeout(r, 400));
          return;
        }
      } catch (_) {}
    }
  }

  const results = [];

  try {
    console.log('\n--- 1. TEST URL MODES: mode=quick vs mode=detailed ---');
    // Direct link with ?topic=propofol&mode=quick
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=quick`);

    const checkQuick = await evaluate(`(() => {
      const isQuickBtnActive = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const hasMatrix = !!document.querySelector('.kn-qr-summary-matrix');
      const subPillCount = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      return { isQuickBtnActive, hasQrWrapper, hasMatrix, subPillCount };
    })()`);

    assert(checkQuick.isQuickBtnActive, 'Quick mode button is active with ?mode=quick');
    assert(checkQuick.hasQrWrapper, '.kn-qr-wrapper is rendered');
    assert(checkQuick.hasMatrix, '.kn-qr-summary-matrix is rendered');
    assert.strictEqual(checkQuick.subPillCount, 15, '15 fast-scroll pills rendered in Quick mode');
    console.log('✅ PASS: ?topic=propofol&mode=quick loads Quick Review mode cleanly');
    results.push({ test: 'URL ?mode=quick', status: 'PASS' });

    // Direct link with ?topic=propofol&mode=detailed
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=detailed`);

    const checkDetailed = await evaluate(`(() => {
      const isDetailedBtnActive = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      const hasSecQuickRef = !!document.getElementById('sec-quick-ref');
      const hasSecIdentity = !!document.getElementById('sec-identity');
      const subPillCount = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      return { isDetailedBtnActive, hasSecQuickRef, hasSecIdentity, subPillCount };
    })()`);

    assert(checkDetailed.isDetailedBtnActive, 'Detailed button is active with ?mode=detailed');
    assert(checkDetailed.hasSecQuickRef, '#sec-quick-ref rendered in Detailed mode');
    assert(checkDetailed.hasSecIdentity, '#sec-identity rendered in Detailed mode');
    assert.strictEqual(checkDetailed.subPillCount, 20, '20 fast-scroll pills rendered in Detailed mode');
    console.log('✅ PASS: ?topic=propofol&mode=detailed loads Detailed Notes cleanly');
    results.push({ test: 'URL ?mode=detailed', status: 'PASS' });

    console.log('\n--- 2. TEST REVIEW ALIASES: review=quick vs review=detailed ---');
    // Test review=quick alias
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=ketamine&review=quick`);

    const checkReviewQuick = await evaluate(`(() => {
      const mode = window.KN_DRUG_REVIEW ? window.KN_DRUG_REVIEW.getDrugReviewMode() : null;
      const isQuickBtn = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      return { mode, isQuickBtn };
    })()`);
    assert.strictEqual(checkReviewQuick.mode, 'quick', 'review=quick alias properly recognized');
    assert(checkReviewQuick.isQuickBtn, 'Quick button active with review=quick');
    console.log('✅ PASS: ?topic=ketamine&review=quick alias recognized');
    results.push({ test: 'Alias ?review=quick', status: 'PASS' });

    // Test review=detailed alias
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=ketamine&review=detailed`);

    const checkReviewDetailed = await evaluate(`(() => {
      const mode = window.KN_DRUG_REVIEW ? window.KN_DRUG_REVIEW.getDrugReviewMode() : null;
      const isDetailedBtn = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      return { mode, isDetailedBtn };
    })()`);
    assert.strictEqual(checkReviewDetailed.mode, 'detailed', 'review=detailed alias properly recognized');
    assert(checkReviewDetailed.isDetailedBtn, 'Detailed button active with review=detailed');
    console.log('✅ PASS: ?topic=ketamine&review=detailed alias recognized');
    results.push({ test: 'Alias ?review=detailed', status: 'PASS' });

    console.log('\n--- 3. TEST IN-PAGE MODE SWITCHING & TOC SYNCHRONIZATION ---');
    // Click Quick Review button
    await evaluate(`document.getElementById('knDrugModeQuickBtn').click()`);
    await new Promise(r => setTimeout(r, 400));

    const checkSwitchedQuick = await evaluate(`(() => {
      const isQuick = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const hasQr = !!document.querySelector('.kn-qr-wrapper');
      const pills = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      const storedPref = localStorage.getItem('kn_drug_mode_pref');
      return { isQuick, hasQr, pills, storedPref };
    })()`);
    assert(checkSwitchedQuick.isQuick, 'Quick button is active after click');
    assert(checkSwitchedQuick.hasQr, '.kn-qr-wrapper is visible after switch to Quick');
    assert.strictEqual(checkSwitchedQuick.pills, 15, 'Pill count updated to 15');
    assert.strictEqual(checkSwitchedQuick.storedPref, 'quick', 'Preference persisted to localStorage');
    console.log('✅ PASS: In-page mode switch to Quick updates content, pills, and localStorage');
    results.push({ test: 'In-page switch to Quick', status: 'PASS' });

    // Click Detailed Notes button
    await evaluate(`document.getElementById('knDrugModeDetailedBtn').click()`);
    await new Promise(r => setTimeout(r, 400));

    const checkSwitchedDetailed = await evaluate(`(() => {
      const isDetailed = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      const hasSecQuickRef = !!document.getElementById('sec-quick-ref');
      const pills = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      const storedPref = localStorage.getItem('kn_drug_mode_pref');
      return { isDetailed, hasSecQuickRef, pills, storedPref };
    })()`);
    assert(checkSwitchedDetailed.isDetailed, 'Detailed button is active after click');
    assert(checkSwitchedDetailed.hasSecQuickRef, '#sec-quick-ref is visible after switch to Detailed');
    assert.strictEqual(checkSwitchedDetailed.pills, 20, 'Pill count updated to 20');
    assert.strictEqual(checkSwitchedDetailed.storedPref, 'detailed', 'Preference persisted to localStorage');
    console.log('✅ PASS: In-page mode switch to Detailed updates content, pills, and localStorage');
    results.push({ test: 'In-page switch to Detailed', status: 'PASS' });

    console.log('\n--- 4. TEST FULL-SCREEN READING MODE SYNCHRONIZATION ---');
    // Open Full-Screen Reading Mode
    await evaluate(`window.StudyRonDesign.openFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 500));

    const checkRmOpen = await evaluate(`(() => {
      const isActive = window.StudyRonDesign.isFullScreenReadingModeActive();
      const bodyTarget = document.getElementById('ronRmBodyTarget');
      const hasToggleInRm = !!bodyTarget?.querySelector('.kn-drug-mode-container');
      const tocItems = document.querySelectorAll('#ronRmTocList .ron-rm-toc-item').length;
      return { isActive, hasToggleInRm, tocItems };
    })()`);
    assert(checkRmOpen.isActive, 'Reading Mode is active');
    assert(checkRmOpen.hasToggleInRm, 'Mode selector container present inside Reading Mode');
    assert.strictEqual(checkRmOpen.tocItems, 20, 'Reading Mode TOC has 20 items in Detailed mode');
    console.log('✅ PASS: Reading Mode opens with synchronized mode toggle and TOC');
    results.push({ test: 'Reading Mode Launch & TOC', status: 'PASS' });

    // Switch to Quick mode inside Reading Mode
    await evaluate(`document.querySelector('#ronRmBodyTarget #knDrugModeQuickBtn').click()`);
    await new Promise(r => setTimeout(r, 400));

    const checkRmSwitchQuick = await evaluate(`(() => {
      const bodyTarget = document.getElementById('ronRmBodyTarget');
      const hasQrInRm = !!bodyTarget?.querySelector('.kn-qr-wrapper');
      const tocItems = document.querySelectorAll('#ronRmTocList .ron-rm-toc-item').length;
      const isRmStillActive = window.StudyRonDesign.isFullScreenReadingModeActive();
      return { hasQrInRm, tocItems, isRmStillActive };
    })()`);
    assert(checkRmSwitchQuick.isRmStillActive, 'Reading Mode remains active during mode switch');
    assert(checkRmSwitchQuick.hasQrInRm, 'Quick Review content rendered inside Reading Mode');
    assert.strictEqual(checkRmSwitchQuick.tocItems, 15, 'Reading Mode TOC dynamically updated to 15 items');
    console.log('✅ PASS: In-Reading-Mode switch to Quick retains reader state and updates TOC');
    results.push({ test: 'In-Reading-Mode mode switch', status: 'PASS' });

    // Exit Reading Mode
    await evaluate(`window.StudyRonDesign.exitFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 400));

    console.log('\n--- 5. TEST NON-DRUG TOPICS INTEGRITY ---');
    // Load preop-assessment
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=preop-assessment`);

    const checkNonDrug = await evaluate(`(() => {
      const hasDrugModeToggle = !!document.querySelector('.kn-drug-mode-container');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const title = document.querySelector('.ron-diagnosis-title')?.textContent.trim();
      const sections = document.querySelectorAll('.ron-card.ron-notes-card').length;
      return { hasDrugModeToggle, hasQrWrapper, title, sections };
    })()`);
    assert(!checkNonDrug.hasDrugModeToggle, 'Non-drug topic must NOT display drug mode toggle');
    assert(!checkNonDrug.hasQrWrapper, 'Non-drug topic must NOT render drug quick review wrapper');
    assert(checkNonDrug.title.includes('Preoperative Assessment'), 'Correct non-drug topic title rendered');
    assert(checkNonDrug.sections >= 8, 'All non-drug sections rendered');
    console.log('✅ PASS: Non-drug topics (preop-assessment) completely unaffected');
    results.push({ test: 'Non-drug topics isolation', status: 'PASS' });

    console.log('\n--- 6. TEST MCQS, BOOKMARKS, SHARING & MODAL ---');
    // Load propofol again
    await safeNavigate(`http://127.0.0.1:${PORT}/study.html?topic=propofol`);

    const checkIntegrations = await evaluate(`(() => {
      const shareBtn = document.getElementById('knStudyShareBtn');
      const bookmarkBtn = document.getElementById('ronTbBookmarkBtn') || document.querySelector('.kn-bookmark-btn');
      const mcqBtn = document.querySelector('.kn-topic-mcq-btn') || document.querySelector('.ron-topic-mcq-banner');
      const pdfBtn = document.querySelector('.kn-download-pdf-btn');
      return {
        hasShare: !!shareBtn,
        hasBookmark: !!bookmarkBtn,
        hasMcq: !!mcqBtn,
        hasPdf: !!pdfBtn
      };
    })()`);
    assert(checkIntegrations.hasShare, 'Share button present');
    assert(checkIntegrations.hasBookmark, 'Bookmark button present');
    assert(checkIntegrations.hasMcq, 'MCQ association button/banner present');
    assert(checkIntegrations.hasPdf, 'PDF download button present');
    console.log('✅ PASS: MCQs, Bookmarks, Chapter Sharing and PDF integrations intact');
    results.push({ test: 'Study integrations integrity', status: 'PASS' });

    console.log('\n======================================================');
    console.log('ALL BROWSER FUNCTIONAL & E2E TESTS PASSED (100% SUCCESS)');
    console.log('======================================================');

    fs.writeFileSync(
      path.join(__dirname, '../.planning/BROWSER_FUNCTIONAL_VALIDATION_REPORT.json'),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('Test failure:', err);
    process.exit(1);
  } finally {
    ws.close();
    chrome.kill();
    server.close();
  }
});
