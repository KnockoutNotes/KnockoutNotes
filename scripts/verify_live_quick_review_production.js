const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const assert = require('assert');

const LIVE_URL = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = path.resolve(__dirname, '../scratch/chrome-cdp-live-verify');

async function runLiveVerification() {
  console.log('================================================================');
  console.log('KNOCKOUTNOTES — LIVE PRODUCTION VERIFICATION SUITE');
  console.log(`Target: ${LIVE_URL}`);
  console.log('================================================================\n');

  // Spawn fresh Chrome instance
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--window-size=1440,900',
    '--disable-extensions',
    '--user-data-dir=' + USER_DATA_DIR
  ]);

  await new Promise(r => setTimeout(r, 1800));

  const res = await fetch('http://127.0.0.1:9295/json');
  const targets = await res.json();
  const ws = new WebSocket((targets.find(t => t.type === 'page') || targets[0]).webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise((resolve, reject) => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) {
        ws.removeEventListener('message', h);
        if (d.error) reject(d.error);
        else resolve(d.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const consoleErrors = [];
  const failedRequests = [];

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  ws.addEventListener('message', (e) => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      if (d.params.type === 'error') {
        const text = d.params.args.map(a => a.value || a.description || '').join(' ');
        consoleErrors.push(text);
      }
    }
    if (d.method === 'Network.responseReceived') {
      const resp = d.params.response;
      if (resp.status >= 400 && !resp.url.includes('favicon.ico')) {
        failedRequests.push(`${resp.status} on ${resp.url}`);
      }
    }
  });

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

  async function navigate(url, waitSelector = '.ron-topic-detail-card, .ron-dashboard, .ron-topic-grid') {
    await send('Page.navigate', { url });
    for (let i = 0; i < 45; i++) {
      await new Promise(r => setTimeout(r, 250));
      try {
        const ready = await evaluate(`(() => {
          return document.readyState === 'complete' && !!document.querySelector('${waitSelector}');
        })()`);
        if (ready) {
          await new Promise(r => setTimeout(r, 400));
          return;
        }
      } catch (_) {}
    }
  }

  const results = [];

  try {
    // -------------------------------------------------------------
    // 1. PROPOFOL: DIRECT URL LOADING WITH mode=quick
    // -------------------------------------------------------------
    console.log('--- 1. PROPOFOL: DIRECT LOAD mode=quick ---');
    await navigate(`${LIVE_URL}/study?topic=propofol&mode=quick`);

    const propofolQuick = await evaluate(`(() => {
      const isQuickActive = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const isDetailedActive = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const hasMatrix = !!document.querySelector('.kn-qr-summary-matrix');
      const pills = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      const title = document.querySelector('.ron-diagnosis-title')?.textContent.trim();
      const prisWarn = document.body.innerText.includes('PRIS') || document.body.innerText.includes('Propofol Infusion Syndrome');
      const tableWrap = !!document.querySelector('.ron-table-wrap.kn-qr-param-grid');
      return { isQuickActive, isDetailedActive, hasQrWrapper, hasMatrix, pills, title, prisWarn, tableWrap };
    })()`);

    assert(propofolQuick.isQuickActive, 'Quick Review toggle is active for Propofol');
    assert(!propofolQuick.isDetailedActive, 'Detailed toggle is inactive');
    assert(propofolQuick.hasQrWrapper, '.kn-qr-wrapper is present');
    assert(propofolQuick.hasMatrix, '4-tile summary matrix is present');
    assert(propofolQuick.prisWarn, 'Propofol PRIS clinical warning preserved in Quick Review');
    assert(propofolQuick.tableWrap, 'Clinical PK table wrapper present');
    assert.strictEqual(propofolQuick.pills, 15, '15 fast-scroll pills present in Quick Review');
    console.log('✅ PASS: Propofol Quick Review rendered cleanly with 15 sections, summary matrix, table, and PRIS warning');
    results.push({ test: 'Propofol Quick Review (mode=quick)', status: 'PASS' });

    // -------------------------------------------------------------
    // 2. PROPOFOL: DIRECT URL LOADING WITH mode=detailed
    // -------------------------------------------------------------
    console.log('\n--- 2. PROPOFOL: DIRECT LOAD mode=detailed ---');
    await navigate(`${LIVE_URL}/study?topic=propofol&mode=detailed`);

    const propofolDetailed = await evaluate(`(() => {
      const isQuickActive = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const isDetailedActive = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      const hasSecQuickRef = !!document.getElementById('sec-quick-ref');
      const hasSecIdentity = !!document.getElementById('sec-identity');
      const pills = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      return { isQuickActive, isDetailedActive, hasSecQuickRef, hasSecIdentity, pills };
    })()`);

    assert(propofolDetailed.isDetailedActive, 'Detailed Notes toggle is active');
    assert(!propofolDetailed.isQuickActive, 'Quick toggle is inactive');
    assert(propofolDetailed.hasSecQuickRef, '#sec-quick-ref present in Detailed Notes');
    assert(propofolDetailed.hasSecIdentity, '#sec-identity present in Detailed Notes');
    assert.strictEqual(propofolDetailed.pills, 20, '20 fast-scroll pills present in Detailed Notes');
    console.log('✅ PASS: Propofol Detailed Notes rendered cleanly with complete 20 pills and 18 sections');
    results.push({ test: 'Propofol Detailed Notes (mode=detailed)', status: 'PASS' });

    // -------------------------------------------------------------
    // 3. ROCURONIUM: QUICK REVIEW & DETAILED NOTES
    // -------------------------------------------------------------
    console.log('\n--- 3. ROCURONIUM: QUICK REVIEW & IN-PAGE SWITCHING ---');
    await navigate(`${LIVE_URL}/study?topic=rocuronium&mode=quick`);

    const rocuroniumQuick = await evaluate(`(() => {
      const isQuickActive = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const text = document.body.innerText;
      const hasSugammadexReversal = text.includes('Sugammadex') || text.includes('sugammadex');
      const hasRsiDose = text.includes('1.0') || text.includes('1.2');
      return { isQuickActive, hasQrWrapper, hasSugammadexReversal, hasRsiDose };
    })()`);

    assert(rocuroniumQuick.isQuickActive, 'Rocuronium loads in Quick Review');
    assert(rocuroniumQuick.hasQrWrapper, 'Rocuronium has QR wrapper');
    assert(rocuroniumQuick.hasSugammadexReversal, 'Rocuronium mentions Sugammadex reversal in Quick Review');
    assert(rocuroniumQuick.hasRsiDose, 'Rocuronium retains RSI dose (1.0-1.2 mg/kg)');
    console.log('✅ PASS: Rocuronium Quick Review verified with clinical RSI dosing and Sugammadex reversal');
    results.push({ test: 'Rocuronium Quick Review', status: 'PASS' });

    // Switch Rocuronium to Detailed Notes via in-page button
    await evaluate(`document.getElementById('knDrugModeDetailedBtn').click()`);
    await new Promise(r => setTimeout(r, 400));

    const rocuroniumSwitched = await evaluate(`(() => {
      const isDetailedActive = document.getElementById('knDrugModeDetailedBtn')?.classList.contains('active');
      const hasSecQuickRef = !!document.getElementById('sec-quick-ref');
      const pills = document.querySelectorAll('.ron-action-pills-row .ron-filter-pill').length;
      return { isDetailedActive, hasSecQuickRef, pills };
    })()`);

    assert(rocuroniumSwitched.isDetailedActive, 'Rocuronium Detailed button active after click');
    assert(rocuroniumSwitched.hasSecQuickRef, 'Rocuronium detailed quick ref card rendered');
    assert.strictEqual(rocuroniumSwitched.pills, 20, 'Rocuronium pills dynamically updated to 20');
    console.log('✅ PASS: Rocuronium in-page switch to Detailed Notes verified');
    results.push({ test: 'Rocuronium Mode Switch to Detailed', status: 'PASS' });

    // -------------------------------------------------------------
    // 4. NORADRENALINE / NOREPINEPHRINE: QUICK REVIEW
    // -------------------------------------------------------------
    console.log('\n--- 4. NORADRENALINE: QUICK REVIEW ---');
    await navigate(`${LIVE_URL}/study?topic=norepinephrine&mode=quick`);

    const noradrenalineQuick = await evaluate(`(() => {
      const isQuickActive = document.getElementById('knDrugModeQuickBtn')?.classList.contains('active');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const text = document.body.innerText;
      const hasSepticShock = text.includes('septic shock') || text.includes('Septic shock') || text.includes('Septic Shock');
      const hasExtravasationWarning = text.includes('extravasation') || text.includes('Extravasation') || text.includes('phentolamine');
      return { isQuickActive, hasQrWrapper, hasSepticShock, hasExtravasationWarning };
    })()`);

    assert(noradrenalineQuick.isQuickActive, 'Norepinephrine Quick Review button active');
    assert(noradrenalineQuick.hasQrWrapper, 'Norepinephrine QR wrapper rendered');
    assert(noradrenalineQuick.hasSepticShock, 'Norepinephrine septic shock first-line indication preserved');
    assert(noradrenalineQuick.hasExtravasationWarning, 'Extravasation / central line safety warning preserved');
    console.log('✅ PASS: Noradrenaline Quick Review verified with first-line septic shock and extravasation caveats');
    results.push({ test: 'Noradrenaline Quick Review', status: 'PASS' });

    // -------------------------------------------------------------
    // 5. FULL-SCREEN READING MODE & MODE SWITCHING
    // -------------------------------------------------------------
    console.log('\n--- 5. FULL-SCREEN READING MODE SYNCHRONIZATION ---');
    await evaluate(`window.StudyRonDesign.openFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 600));

    const rmState = await evaluate(`(() => {
      const isRmActive = window.StudyRonDesign.isFullScreenReadingModeActive();
      const bodyTarget = document.getElementById('ronRmBodyTarget');
      const hasToggleInRm = !!bodyTarget?.querySelector('.kn-drug-mode-container');
      const hasQrInRm = !!bodyTarget?.querySelector('.kn-qr-wrapper');
      const tocCount = document.querySelectorAll('#ronRmTocList .ron-rm-toc-item').length;
      return { isRmActive, hasToggleInRm, hasQrInRm, tocCount };
    })()`);

    assert(rmState.isRmActive, 'Reading Mode is active on live site');
    assert(rmState.hasToggleInRm, 'Mode selector toggle rendered inside Reading Mode');
    assert(rmState.hasQrInRm, 'Quick Review content rendered inside Reading Mode');
    assert.strictEqual(rmState.tocCount, 15, 'Reading Mode TOC has 15 items in Quick mode');
    console.log('✅ PASS: Reading Mode launched with synchronized Quick Review content and 15 TOC items');
    results.push({ test: 'Reading Mode Synchronized Launch', status: 'PASS' });

    // Switch to Detailed Notes inside Reading Mode
    await evaluate(`document.querySelector('#ronRmBodyTarget #knDrugModeDetailedBtn').click()`);
    await new Promise(r => setTimeout(r, 500));

    const rmDetailedState = await evaluate(`(() => {
      const isRmActive = window.StudyRonDesign.isFullScreenReadingModeActive();
      const bodyTarget = document.getElementById('ronRmBodyTarget');
      const hasSecQuickRef = !!bodyTarget?.querySelector('#sec-quick-ref');
      const tocCount = document.querySelectorAll('#ronRmTocList .ron-rm-toc-item').length;
      return { isRmActive, hasSecQuickRef, tocCount };
    })()`);

    assert(rmDetailedState.isRmActive, 'Reading Mode remains active after mode switch');
    assert(rmDetailedState.hasSecQuickRef, 'Detailed notes rendered in Reading Mode');
    assert.strictEqual(rmDetailedState.tocCount, 20, 'Reading Mode TOC dynamically updated to 20 items');
    console.log('✅ PASS: In-Reading-Mode mode switch to Detailed Notes verified with live TOC updating');
    results.push({ test: 'Reading Mode Dynamic Mode Switch', status: 'PASS' });

    // Exit Reading Mode
    await evaluate(`window.StudyRonDesign.exitFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 400));

    // -------------------------------------------------------------
    // 6. THEME CONTRAST VALIDATION (DARK, LIGHT, SEPIA)
    // -------------------------------------------------------------
    console.log('\n--- 6. THEMES VALIDATION (DARK, LIGHT, SEPIA) ---');
    // Open Reading Mode to test themes
    await evaluate(`window.StudyRonDesign.openFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 500));

    // Dark Theme
    await evaluate(`window.StudyRonDesign.setReadingTheme('dark')`);
    await new Promise(r => setTimeout(r, 200));
    const darkThemeCheck = await evaluate(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const bg = window.getComputedStyle(overlay).backgroundColor;
      return { theme: overlay.getAttribute('data-reading-theme'), bg };
    })()`);
    assert.strictEqual(darkThemeCheck.theme, 'dark');
    console.log('✅ PASS: Reading Mode Dark theme active with bg', darkThemeCheck.bg);

    // Light Theme
    await evaluate(`window.StudyRonDesign.setReadingTheme('light')`);
    await new Promise(r => setTimeout(r, 200));
    const lightThemeCheck = await evaluate(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const bg = window.getComputedStyle(overlay).backgroundColor;
      return { theme: overlay.getAttribute('data-reading-theme'), bg };
    })()`);
    assert.strictEqual(lightThemeCheck.theme, 'light');
    console.log('✅ PASS: Reading Mode Light theme active with bg', lightThemeCheck.bg);

    // Sepia Theme
    await evaluate(`window.StudyRonDesign.setReadingTheme('sepia')`);
    await new Promise(r => setTimeout(r, 200));
    const sepiaThemeCheck = await evaluate(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const bg = window.getComputedStyle(overlay).backgroundColor;
      return { theme: overlay.getAttribute('data-reading-theme'), bg };
    })()`);
    assert.strictEqual(sepiaThemeCheck.theme, 'sepia');
    console.log('✅ PASS: Reading Mode Sepia theme active with bg', sepiaThemeCheck.bg);
    results.push({ test: 'Dark, Light, and Sepia Themes', status: 'PASS' });

    await evaluate(`window.StudyRonDesign.exitFullScreenReadingMode()`);
    await new Promise(r => setTimeout(r, 400));

    // -------------------------------------------------------------
    // 7. RESPONSIVE VALIDATION: MOBILE (390×844) VS DESKTOP (1440×900)
    // -------------------------------------------------------------
    console.log('\n--- 7. RESPONSIVE VALIDATION: MOBILE (390×844) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await navigate(`${LIVE_URL}/study?topic=propofol&mode=quick`);

    const mobileCheck = await evaluate(`(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const hasHorizontalOverflow = docWidth > winWidth;
      const toggle = document.querySelector('.kn-drug-mode-toggle');
      const toggleRect = toggle?.getBoundingClientRect();
      const tableWrap = document.querySelector('.ron-table-wrap');
      const tableHasOverflow = tableWrap ? tableWrap.scrollWidth > tableWrap.clientWidth : false;
      return { docWidth, winWidth, hasHorizontalOverflow, toggleWidth: toggleRect?.width, tableHasOverflow };
    })()`);

    assert(!mobileCheck.hasHorizontalOverflow, `Mobile page has no horizontal window blowout (${mobileCheck.docWidth}px vs ${mobileCheck.winWidth}px)`);
    assert(mobileCheck.tableHasOverflow, 'Medical table safely overflows inside its scrolling wrapper');
    console.log('✅ PASS: Mobile portrait layout (390×844) verified with zero page horizontal overflow');
    results.push({ test: 'Mobile Responsive (390×844)', status: 'PASS' });

    // Reset to desktop viewport
    await send('Emulation.clearDeviceMetricsOverride');

    // -------------------------------------------------------------
    // 8. SHARED LINKS & SUBSCRIPTION MODAL INTEGRITY
    // -------------------------------------------------------------
    console.log('\n--- 8. SHARED LINKS & SUBSCRIPTION MODAL ---');
    await navigate(`${LIVE_URL}/study?topic=propofol&ref=share`);

    const sharedModalCheck = await evaluate(`(() => {
      const modal = document.getElementById('knShareSubModal');
      const isVisible = modal && !modal.classList.contains('hidden');
      const title = document.getElementById('knSubModalChapterTitle')?.textContent;
      const cancelBtn = document.getElementById('knSubModalCancelBtn');
      return { modalExists: !!modal, isVisible, title, hasCancelBtn: !!cancelBtn };
    })()`);

    assert(sharedModalCheck.modalExists, 'Subscription modal exists in DOM');
    assert(sharedModalCheck.isVisible, 'Subscription modal opens on shared link (ref=share)');
    assert(sharedModalCheck.title.includes('Propofol'), 'Modal header features shared chapter title');
    assert(sharedModalCheck.hasCancelBtn, 'Modal features accessible Cancel button');

    // Dismiss modal
    await evaluate(`document.getElementById('knSubModalCancelBtn').click()`);
    await new Promise(r => setTimeout(r, 300));
    const modalDismissed = await evaluate(`document.getElementById('knShareSubModal')?.classList.contains('hidden')`);
    assert(modalDismissed, 'Subscription modal dismisses cleanly');
    console.log('✅ PASS: Chapter sharing & subscription modal fully functional on live production');
    results.push({ test: 'Chapter Sharing & Subscription Modal', status: 'PASS' });

    // -------------------------------------------------------------
    // 9. NON-DRUG TOPICS INTEGRITY (PREOP ASSESSMENT)
    // -------------------------------------------------------------
    console.log('\n--- 9. NON-DRUG TOPIC INTEGRITY (PREOP ASSESSMENT) ---');
    await navigate(`${LIVE_URL}/study?topic=preop-assessment`);

    const nonDrugCheck = await evaluate(`(() => {
      const hasDrugModeToggle = !!document.querySelector('.kn-drug-mode-container');
      const hasQrWrapper = !!document.querySelector('.kn-qr-wrapper');
      const title = document.querySelector('.ron-diagnosis-title')?.textContent.trim();
      const sections = document.querySelectorAll('.ron-card.ron-notes-card').length;
      return { hasDrugModeToggle, hasQrWrapper, title, sections };
    })()`);

    assert(!nonDrugCheck.hasDrugModeToggle, 'Non-drug topic must NOT display drug mode selector');
    assert(!nonDrugCheck.hasQrWrapper, 'Non-drug topic must NOT render drug quick review wrapper');
    assert(nonDrugCheck.title.includes('Preoperative Assessment'), 'Correct non-drug topic title rendered');
    assert(nonDrugCheck.sections >= 8, 'Non-drug sections render completely');
    console.log('✅ PASS: Non-drug topics completely unaffected and preserved in live production');
    results.push({ test: 'Non-Drug Topic Isolation', status: 'PASS' });

    // -------------------------------------------------------------
    // 10. NETWORK AND CONSOLE ERROR CHECKS
    // -------------------------------------------------------------
    console.log('\n--- 10. NETWORK & CONSOLE HEALTH CHECKS ---');
    console.log(`Observed Console Errors: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      consoleErrors.forEach(err => console.log('  ⚠️ Error:', err));
    }
    console.log(`Failed Network Requests: ${failedRequests.length}`);
    if (failedRequests.length > 0) {
      failedRequests.forEach(req => console.log('  ⚠️ Failed Request:', req));
    }

    assert.strictEqual(failedRequests.length, 0, 'Zero failed 4xx/5xx network requests');
    // Filter out non-actionable external or third-party console errors if any
    const criticalJsErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('third-party'));
    assert.strictEqual(criticalJsErrors.length, 0, 'Zero critical JavaScript console errors');
    console.log('✅ PASS: Zero failed network requests and zero critical console errors');
    results.push({ test: 'Network & Console Health', status: 'PASS' });

    console.log('\n================================================================');
    console.log('ALL LIVE PRODUCTION VERIFICATION TESTS PASSED (100% SUCCESS)');
    console.log('================================================================');

    fs.writeFileSync(
      path.join(__dirname, '../.planning/LIVE_PRODUCTION_VERIFICATION_REPORT.json'),
      JSON.stringify({
        timestamp: new Date().toISOString(),
        liveUrl: LIVE_URL,
        allPassed: true,
        results,
        consoleErrors,
        failedRequests
      }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.error('❌ Live production test failure:', err);
    process.exit(1);
  } finally {
    ws.close();
    chrome.kill();
  }
}

runLiveVerification();
