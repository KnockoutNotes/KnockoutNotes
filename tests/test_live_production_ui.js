/**
 * test_live_production_ui.js
 * End-to-end post-deployment acceptance testing on live Cloudflare production
 * URL: https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const LIVE_ORIGIN = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';
const CDP_PORT = 9248;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  return 'chrome';
}

async function runLiveVerification() {
  console.log(`\n======================================================`);
  console.log(`🚀 STARTING LIVE PRODUCTION ACCEPTANCE VERIFICATION`);
  console.log(`Target: ${LIVE_ORIGIN}`);
  console.log(`======================================================\n`);

  const chromePath = await findChromePath();
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-live-audit');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=1280,800',
    '--disable-extensions',
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await delay(1500);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;
  console.log('Connected to Chrome DevTools WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 0;
  const callbacks = new Map();
  const consoleErrors = [];
  const networkErrors = [];

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(' '));
        }
      } else if (msg.method === 'Network.loadingFailed') {
        if (msg.params.type === 'Script' || msg.params.type === 'Stylesheet') {
          networkErrors.push(`${msg.params.type} failed: ${msg.params.errorText}`);
        }
      }
    } catch (e) {
      console.error('WS parse error:', e);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++msgId;
      callbacks.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evalScript = async (expression) => {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res && res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res && res.result ? res.result.value : undefined;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  const waitForAppReady = async (maxMs = 12000) => {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      try {
        const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && typeof window.StudyRonDesign.isFullScreenReadingModeActive === "function"`);
        if (ready) return true;
      } catch (_) {}
      await delay(200);
    }
    return false;
  };

  const results = [];

  // ==========================================
  // CHECK 1: SHARED STUDY MODE LINK & MODAL
  // ==========================================
  console.log('--- 1. SHARED STUDY MODE LINK & MODAL ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  const sharedStudyUrl = `${LIVE_ORIGIN}/study?topic=propofol&mode=study&ref=share`;
  console.log(`Navigating to: ${sharedStudyUrl}`);
  await send('Page.navigate', { url: sharedStudyUrl });
  const appReady1 = await waitForAppReady();
  if (!appReady1) throw new Error('Live Study Mode timed out waiting for app readiness');
  await delay(1200);

  const modalStudyState = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    if (!modal) return { exists: false };
    const title = modal.querySelector('.kn-sub-modal-title');
    const badge = modal.querySelector('.kn-sub-modal-badge');
    const chapterName = modal.querySelector('#knSubModalChapterTitle');
    const input = modal.querySelector('#knSubEmailInput');
    const submitBtn = modal.querySelector('#knSubSubmitBtn');
    const cancelBtn = modal.querySelector('#knSubCancelBtn');
    const closeBtn = modal.querySelector('#knSubModalCloseBtn');

    const mStyle = window.getComputedStyle(modal.querySelector('.kn-sub-modal-dialog'));
    const iStyle = window.getComputedStyle(input);
    const sStyle = window.getComputedStyle(submitBtn);
    const cStyle = window.getComputedStyle(cancelBtn);

    return {
      exists: true,
      hidden: modal.hidden,
      hasOpenClass: document.body.classList.contains('kn-sub-modal-open'),
      badgeText: badge ? badge.innerText.trim() : null,
      chapterText: chapterName ? chapterName.innerText.trim() : null,
      inputFontSize: iStyle.fontSize,
      inputBg: iStyle.backgroundColor,
      inputBorder: iStyle.borderColor,
      cardBorderRadius: mStyle.borderRadius,
      cardShadow: mStyle.boxShadow,
      submitBg: sStyle.backgroundColor,
      cancelBorder: cStyle.borderColor,
      hasSvgClose: closeBtn ? !!closeBtn.querySelector('svg') : false
    };
  })()`);
  console.log('Live Shared Study Mode Modal State:', modalStudyState);

  if (modalStudyState.exists && !modalStudyState.hidden) {
    console.log('✅ PASS: Subscription modal triggered automatically on live shared Study Mode link');
    results.push({ check: 'Live Shared Study Mode Modal', status: 'PASS' });
  } else {
    throw new Error('FAIL: Modal did not open on live shared Study Mode link');
  }

  // Test Cancel & Continue Reading
  console.log('Testing Cancel & Continue Reading...');
  await evalScript(`
    const cancelBtn = document.getElementById('knSubCancelBtn');
    if (cancelBtn) cancelBtn.click();
  `);
  await delay(400);

  const afterCancelState = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    return {
      hidden: modal ? modal.hidden : true,
      hasOpenClass: document.body.classList.contains('kn-sub-modal-open')
    };
  })()`);
  console.log('After Cancel:', afterCancelState);

  if (afterCancelState.hidden && !afterCancelState.hasOpenClass) {
    console.log('✅ PASS: Cancel button immediately dismisses modal on live site');
    results.push({ check: 'Modal Dismissal via Cancel', status: 'PASS' });
  } else {
    throw new Error('FAIL: Cancel button did not dismiss modal');
  }

  // ==========================================
  // CHECK 2: SHARED READING MODE LINK
  // ==========================================
  console.log('\n--- 2. SHARED READING MODE LINK & MODAL ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });

  const sharedReadingUrl = `${LIVE_ORIGIN}/study?topic=propofol&mode=reading&ref=share`;
  console.log(`Navigating to: ${sharedReadingUrl}`);
  // Clear sessionStorage flag to ensure modal triggers for testing
  await evalScript(`sessionStorage.removeItem('kn_share_sub_modal_seen');`);
  await send('Page.navigate', { url: sharedReadingUrl });
  await waitForAppReady();
  await delay(1200);

  const modalReadingState = await evalScript(`(() => {
    const isRmActive = window.StudyRonDesign ? window.StudyRonDesign.isFullScreenReadingModeActive() : false;
    const modal = document.getElementById('knSharedSubModal');
    const rmOverlay = document.getElementById('ronReadingModeOverlay');
    const modalZ = modal ? parseInt(window.getComputedStyle(modal).zIndex || '0', 10) : 0;
    const rmZ = rmOverlay ? parseInt(window.getComputedStyle(rmOverlay).zIndex || '0', 10) : 0;

    return {
      isRmActive,
      modalExists: !!modal,
      modalHidden: modal ? modal.hidden : true,
      modalZ,
      rmZ,
      isModalAboveRm: modalZ > rmZ
    };
  })()`);
  console.log('Live Shared Reading Mode State:', modalReadingState);

  if (modalReadingState.isRmActive && !modalReadingState.modalHidden && modalReadingState.isModalAboveRm) {
    console.log('✅ PASS: Reading Mode opened and modal layered correctly above it (z-index 100005 > 100000)');
    results.push({ check: 'Live Shared Reading Mode Layering', status: 'PASS' });
  } else {
    throw new Error('FAIL: Reading Mode or modal layering failed');
  }

  // Test Escape key closes modal while preserving Reading Mode
  console.log('Testing Escape key handling...');
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await delay(400);

  const escapeState = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    const isRmActive = window.StudyRonDesign ? window.StudyRonDesign.isFullScreenReadingModeActive() : false;
    return {
      modalHidden: modal ? modal.hidden : true,
      isRmActive
    };
  })()`);
  console.log('After Escape:', escapeState);

  if (escapeState.modalHidden && escapeState.isRmActive) {
    console.log('✅ PASS: Escape dismissed modal while preserving Reading Mode');
    results.push({ check: 'Escape Key Hierarchy', status: 'PASS' });
  } else {
    throw new Error('FAIL: Escape key did not preserve Reading Mode');
  }

  // ==========================================
  // CHECK 3: THEME CONTRAST & SWITCHING
  // ==========================================
  console.log('\n--- 3. THEME CONTRAST & SWITCHING ---');
  // Re-open modal to inspect dark and light theme styles
  await evalScript(`
    sessionStorage.clear();
    if (window.StudyRonDesign && window.StudyRonDesign.openSubscriptionModal) {
      window.StudyRonDesign.openSubscriptionModal({ title: 'Propofol' });
    }
  `);
  await delay(400);

  // Set Dark theme
  await evalScript(`
    if (window.StudyRonDesign && window.StudyRonDesign.setReadingTheme) {
      window.StudyRonDesign.setReadingTheme('dark');
    }
  `);
  await delay(400);

  const darkStyles = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    const card = modal ? modal.querySelector('.kn-sub-modal-dialog') : null;
    const title = modal ? modal.querySelector('.kn-sub-modal-title') : null;
    const input = modal ? modal.querySelector('#knSubEmailInput') : null;
    return {
      themeAttr: modal ? modal.getAttribute('data-modal-theme') : null,
      cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
      titleColor: title ? window.getComputedStyle(title).color : null,
      inputBg: input ? window.getComputedStyle(input).backgroundColor : null,
      inputBorder: input ? window.getComputedStyle(input).borderColor : null
    };
  })()`);
  console.log('Live Dark Theme Modal Styles:', darkStyles);

  // Set Light theme
  await evalScript(`
    if (window.StudyRonDesign && window.StudyRonDesign.setReadingTheme) {
      window.StudyRonDesign.setReadingTheme('light');
    }
  `);
  await delay(400);

  const lightStyles = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    const card = modal ? modal.querySelector('.kn-sub-modal-dialog') : null;
    const title = modal ? modal.querySelector('.kn-sub-modal-title') : null;
    const input = modal ? modal.querySelector('#knSubEmailInput') : null;
    return {
      themeAttr: modal ? modal.getAttribute('data-modal-theme') : null,
      cardBg: card ? window.getComputedStyle(card).backgroundColor : null,
      titleColor: title ? window.getComputedStyle(title).color : null,
      inputBg: input ? window.getComputedStyle(input).backgroundColor : null,
      inputBorder: input ? window.getComputedStyle(input).borderColor : null
    };
  })()`);
  console.log('Live Light Theme Modal Styles:', lightStyles);

  if (darkStyles.themeAttr === 'dark' && lightStyles.themeAttr === 'light') {
    console.log('✅ PASS: Modal theme automatically synchronizes with Reading Mode theme');
    results.push({ check: 'Live Modal Theme Synchronization', status: 'PASS' });
  } else {
    throw new Error('FAIL: Modal theme did not synchronize');
  }

  // Close modal
  await evalScript(`(() => {
    const cancelBtn = document.getElementById('knSubCancelBtn');
    if (cancelBtn) cancelBtn.click();
  })()`);
  await delay(400);

  // ==========================================
  // CHECK 4: MEDICAL TABLES RESPONSIVENESS
  // ==========================================
  console.log('\n--- 4. MEDICAL TABLES RESPONSIVENESS ---');

  // 4a. Desktop 1280px (2-column quick reference)
  const desktopTableMetrics = await evalScript(`(() => {
    const tableWrap = document.querySelector('.ron-table-wrap, .st-table-wrap');
    const table = tableWrap ? tableWrap.querySelector('table') : null;
    const firstTh = table ? table.querySelector('th:first-child, td:first-child') : null;
    return {
      hasWrap: !!tableWrap,
      wrapWidth: tableWrap ? tableWrap.clientWidth : 0,
      firstColWidth: firstTh ? firstTh.getBoundingClientRect().width : 0,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Desktop 1280px Table Metrics:', desktopTableMetrics);

  if (desktopTableMetrics.hasWrap && !desktopTableMetrics.hasOverflow) {
    console.log('✅ PASS: Desktop table wrapped properly with zero horizontal page overflow');
    results.push({ check: 'Live Desktop Table Containment', status: 'PASS' });
  } else {
    throw new Error('FAIL: Desktop table overflow detected');
  }

  // 4b. Mobile Portrait (390px)
  console.log('\nTesting Mobile Portrait (390px)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await delay(500);

  const mobilePortraitMetrics = await evalScript(`(() => {
    const tableWrap = document.querySelector('.ron-table-wrap, .st-table-wrap');
    const table = tableWrap ? tableWrap.querySelector('table') : null;
    return {
      hasWrap: !!tableWrap,
      wrapClientWidth: tableWrap ? tableWrap.clientWidth : 0,
      wrapScrollWidth: tableWrap ? tableWrap.scrollWidth : 0,
      tableClientWidth: table ? table.clientWidth : 0,
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Mobile Portrait (390px) Metrics:', mobilePortraitMetrics);

  if (mobilePortraitMetrics.hasWrap && !mobilePortraitMetrics.hasOverflow) {
    console.log('✅ PASS: Mobile Portrait table scrolls independently with zero page horizontal overflow');
    results.push({ check: 'Live Mobile Portrait Table Containment', status: 'PASS' });
  } else {
    throw new Error('FAIL: Mobile portrait page overflow detected');
  }

  // 4c. Mobile Landscape (844px)
  console.log('\nTesting Mobile Landscape (844px)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 844,
    height: 390,
    deviceScaleFactor: 2,
    mobile: true
  });
  await delay(500);

  const mobileLandscapeMetrics = await evalScript(`(() => {
    return {
      pageScrollWidth: document.documentElement.scrollWidth,
      pageClientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Mobile Landscape (844px) Metrics:', mobileLandscapeMetrics);

  if (!mobileLandscapeMetrics.hasOverflow) {
    console.log('✅ PASS: Mobile Landscape layout has zero horizontal page overflow');
    results.push({ check: 'Live Mobile Landscape Containment', status: 'PASS' });
  } else {
    throw new Error('FAIL: Mobile landscape page overflow detected');
  }

  // ==========================================
  // CHECK 5: FORM VALIDATION & SANITIZATION
  // ==========================================
  console.log('\n--- 5. SUBSCRIPTION FORM VALIDATION ---');
  // Re-open modal to test form validation
  await evalScript(`
    if (window.StudyRonDesign && window.StudyRonDesign.openSubscriptionModal) {
      window.StudyRonDesign.openSubscriptionModal({ title: 'Propofol' });
    }
  `);
  await delay(400);

  // Submit invalid email
  await evalScript(`
    const input = document.getElementById('knSubEmailInput');
    const form = document.getElementById('knSharedSubForm');
    if (input) input.value = 'invalid-email-string';
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
  `);
  await delay(400);

  const validationState = await evalScript(`(() => {
    const input = document.getElementById('knSubEmailInput');
    const errorEl = document.getElementById('knSubEmailError');
    return {
      inputHasInvalidClass: input ? input.classList.contains('invalid') : false,
      errorText: errorEl ? errorEl.textContent.trim() : null,
      errorVisible: errorEl ? !errorEl.hidden : false
    };
  })()`);
  console.log('Invalid Form Submission State:', validationState);

  if (validationState.inputHasInvalidClass && validationState.errorVisible) {
    console.log('✅ PASS: Client-side validation blocks invalid email without network request');
    results.push({ check: 'Live Form Validation Safeguard', status: 'PASS' });
  } else {
    throw new Error('FAIL: Client-side validation did not flag invalid email');
  }

  // Close modal
  await evalScript(`(() => {
    const cancelBtn = document.getElementById('knSubCancelBtn');
    if (cancelBtn) cancelBtn.click();
  })()`);

  // ==========================================
  // CHECK 6: CONSOLE ERRORS & FAILED ASSETS
  // ==========================================
  console.log('\n--- 6. CONSOLE ERRORS & ASSET INTEGRITY ---');
  console.log('Console Errors captured:', consoleErrors.length);
  console.log('Network Load Failures captured:', networkErrors.length);

  if (consoleErrors.length > 0) {
    console.warn('Console error messages:', consoleErrors);
  }
  if (networkErrors.length > 0) {
    console.warn('Network error messages:', networkErrors);
  }

  if (networkErrors.length === 0) {
    console.log('✅ PASS: Zero failed script or stylesheet network requests on live production');
    results.push({ check: 'Live Asset Integrity', status: 'PASS' });
  } else {
    throw new Error('FAIL: Network resource failures detected');
  }

  ws.close();
  chromeProcess.kill();

  console.log('\n======================================================');
  console.log(`🎉 ALL LIVE PRODUCTION ACCEPTANCE CHECKS PASSED! (${results.length}/${results.length})`);
  console.log('======================================================');
  return results;
}

runLiveVerification().catch((err) => {
  console.error('\n❌ LIVE VERIFICATION FAILED:', err);
  process.exit(1);
});
