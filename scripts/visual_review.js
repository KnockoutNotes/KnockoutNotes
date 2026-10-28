/**
 * visual_review.js
 * Comprehensive visual review and screenshot suite for KnockoutNotes UI Polish
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const CDP_PORT = 9243;
const ARTIFACT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440';
const OUT_DIR = path.join(ARTIFACT_DIR, 'screenshots');

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

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Artifact destination: ${OUT_DIR}`);

  const chromePath = await findChromePath();
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-vis-profile');
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

  chromeProcess.on('error', (err) => console.error('Chrome spawn error:', err));
  await delay(1500);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;
  console.log('Connected to Chrome DevTools WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 0;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
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

  const capture = async (filename) => {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(OUT_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[Captured] ${filename} (${buffer.length} bytes)`);
    return outPath;
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  const waitForAppReady = async (maxMs = 8000) => {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
      try {
        const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && typeof window.StudyRonDesign.isFullScreenReadingModeActive === "function"`);
        if (ready) return true;
      } catch (_) {}
      await delay(150);
    }
    return false;
  };

  console.log('\n======================================================');
  console.log('1. SHARED PROPOFOL IN STUDY MODE (PORTRAIT 390x844)');
  console.log('======================================================');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  console.log('Navigating to Shared Propofol in Study Mode...');
  await send('Page.navigate', {
    url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=study&ref=share`
  });
  await waitForAppReady();
  await delay(1000);

  // 1. Dark Mode Portrait (390 x 844)
  console.log('Setting Dark Mode for Subscription Modal (Portrait 390x844)...');
  await evalScript(`
    localStorage.setItem('kn-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
  `);
  await delay(600);
  await capture('01_modal_dark_portrait_390x844.png');

  // 2. Light Mode Portrait (390 x 844)
  console.log('Setting Light Mode for Subscription Modal (Portrait 390x844)...');
  await evalScript(`
    localStorage.setItem('kn-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
  `);
  await delay(600);
  await capture('02_modal_light_portrait_390x844.png');

  console.log('\n======================================================');
  console.log('2. SHARED PROPOFOL IN STUDY MODE (LANDSCAPE 844x390)');
  console.log('======================================================');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 844,
    height: 390,
    deviceScaleFactor: 2,
    mobile: true
  });
  await delay(500);

  // 3. Dark Mode Landscape (844 x 390)
  console.log('Setting Dark Mode for Subscription Modal (Landscape 844x390)...');
  await evalScript(`
    localStorage.setItem('kn-theme', 'dark');
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
  `);
  await delay(600);
  await capture('03_modal_dark_landscape_844x390.png');

  // 4. Light Mode Landscape (844 x 390)
  console.log('Setting Light Mode for Subscription Modal (Landscape 844x390)...');
  await evalScript(`
    localStorage.setItem('kn-theme', 'light');
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
  `);
  await delay(600);
  await capture('04_modal_light_landscape_844x390.png');

  console.log('\n======================================================');
  console.log('3. SHARED PROPOFOL IN READING MODE (DESKTOP 1280x800)');
  console.log('======================================================');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  console.log('Navigating to Shared Propofol in Reading Mode (mode=reading&ref=share)...');
  await send('Page.navigate', {
    url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading&ref=share`
  });
  await waitForAppReady();
  await delay(1200);
  await capture('05_reading_mode_shared_desktop.png');

  // Dismiss subscription modal via Continue Reading
  console.log('Dismissing subscription modal to reveal article content...');
  await evalScript(`
    const cancelBtn = document.getElementById('knSubCancelBtn');
    if (cancelBtn) cancelBtn.click();
    else {
      const modal = document.getElementById('knSharedSubModal');
      if (modal) modal.style.display = 'none';
    }
  `);
  await delay(600);

  console.log('\n======================================================');
  console.log('4. QUICK REFERENCE MEDICAL TABLE (DESKTOP & MOBILE 390PX)');
  console.log('======================================================');

  // 6. Quick Reference Table on Desktop (1280px)
  console.log('Focusing on Propofol Quick Reference Table (Desktop 1280px)...');
  await evalScript(`(() => {
    const qrTable = document.querySelector('.ron-table-wrap table, .st-table-wrap table');
    if (qrTable) qrTable.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await delay(600);
  await capture('06_quick_ref_table_desktop.png');

  const desktopQuickRefMetrics = await evalScript(`(() => {
    const tableWrap = document.querySelector('.ron-table-wrap, .st-table-wrap');
    const table = tableWrap ? tableWrap.querySelector('table') : null;
    const firstTh = table ? table.querySelector('th:first-child, td:first-child') : null;
    return {
      wrapClientWidth: tableWrap ? tableWrap.clientWidth : null,
      tableClientWidth: table ? table.clientWidth : null,
      firstColWidth: firstTh ? firstTh.getBoundingClientRect().width : null,
      firstColText: firstTh ? firstTh.innerText.trim() : null,
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      pageHasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Desktop Quick Reference Metrics:', desktopQuickRefMetrics);

  // 7. Quick Reference Table on Mobile (390px)
  console.log('\nSwitching to Mobile 390px Viewport for Quick Reference Table...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await delay(600);
  await evalScript(`(() => {
    const qrTable = document.querySelector('.ron-table-wrap table, .st-table-wrap table');
    if (qrTable) qrTable.scrollIntoView({ behavior: 'instant', block: 'center' });
  })()`);
  await delay(600);
  await capture('07_quick_ref_table_mobile_390.png');

  const mobileQuickRefMetrics = await evalScript(`(() => {
    const tableWrap = document.querySelector('.ron-table-wrap, .st-table-wrap');
    const table = tableWrap ? tableWrap.querySelector('table') : null;
    return {
      wrapClientWidth: tableWrap ? tableWrap.clientWidth : null,
      wrapScrollWidth: tableWrap ? tableWrap.scrollWidth : null,
      tableClientWidth: table ? table.clientWidth : null,
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      pageHasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Mobile Quick Reference Metrics:', mobileQuickRefMetrics);

  console.log('\n======================================================');
  console.log('5. DENSE CLINICAL TABLE (MEROPENEM DESKTOP & MOBILE 390PX)');
  console.log('======================================================');

  // 8. Dense Table Desktop
  console.log('Navigating to Meropenem Monograph in Reading Mode...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 2,
    mobile: false
  });
  await send('Page.navigate', {
    url: `http://127.0.0.1:${PORT}/study.html?topic=meropenem&mode=reading`
  });
  await waitForAppReady();
  await delay(1200);

  // Scroll to dense table
  await evalScript(`(() => {
    const tables = document.querySelectorAll('.ron-table-wrap table, .st-table-wrap table');
    if (tables.length > 0) {
      tables[0].scrollIntoView({ behavior: 'instant', block: 'center' });
    }
  })()`);
  await delay(600);
  await capture('08_dense_clinical_table_desktop.png');

  // 9. Dense Table Mobile (390px)
  console.log('Inspecting Dense Clinical Table on Mobile (390px)...');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await delay(600);
  await capture('09_dense_clinical_table_mobile_390.png');

  const denseMobileMetrics = await evalScript(`(() => {
    const tableWrap = document.querySelector('.ron-table-wrap, .st-table-wrap');
    const table = tableWrap ? tableWrap.querySelector('table') : null;
    return {
      wrapClientWidth: tableWrap ? tableWrap.clientWidth : null,
      wrapScrollWidth: tableWrap ? tableWrap.scrollWidth : null,
      tableClientWidth: table ? table.clientWidth : null,
      docScrollWidth: document.documentElement.scrollWidth,
      docClientWidth: document.documentElement.clientWidth,
      pageHasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    };
  })()`);
  console.log('Dense Mobile Table Metrics:', denseMobileMetrics);

  console.log('\n======================================================');
  console.log('6. MODAL DETAILED POLISH & THEME SWITCHING INTEGRITY');
  console.log('======================================================');

  // Navigate back to shared page to inspect modal elements
  await evalScript(`sessionStorage.clear();`);
  await send('Page.navigate', {
    url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading&ref=share`
  });
  await waitForAppReady();
  await delay(1200);

  const modalInspection = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    if (!modal) return { exists: false };
    const closeBtn = modal.querySelector('#knSubModalCloseBtn');
    const emailInput = modal.querySelector('#knSubEmailInput');
    const submitBtn = modal.querySelector('#knSubSubmitBtn');
    const cancelBtn = modal.querySelector('#knSubCancelBtn');
    const title = modal.querySelector('.kn-sub-modal-title');
    const badge = modal.querySelector('.kn-sub-modal-badge');
    const privacy = modal.querySelector('.kn-sub-modal-footer-note');

    const cStyle = closeBtn ? window.getComputedStyle(closeBtn) : {};
    const iStyle = emailInput ? window.getComputedStyle(emailInput) : {};
    const sStyle = submitBtn ? window.getComputedStyle(submitBtn) : {};
    const cnStyle = cancelBtn ? window.getComputedStyle(cancelBtn) : {};
    const tStyle = title ? window.getComputedStyle(title) : {};

    return {
      exists: true,
      hasSvgClose: closeBtn ? !!closeBtn.querySelector('svg') : false,
      closeBtnAriaLabel: closeBtn ? closeBtn.getAttribute('aria-label') : null,
      closeBtnWidth: cStyle.width,
      closeBtnHeight: cStyle.height,
      inputPlaceholder: emailInput ? emailInput.getAttribute('placeholder') : null,
      inputFontSize: iStyle.fontSize,
      inputRadius: iStyle.borderRadius,
      submitText: submitBtn ? submitBtn.innerText.trim() : null,
      submitBg: sStyle.backgroundColor,
      submitColor: sStyle.color,
      submitRadius: sStyle.borderRadius,
      cancelText: cancelBtn ? cancelBtn.innerText.trim() : null,
      cancelBg: cnStyle.backgroundColor,
      cancelColor: cnStyle.color,
      cancelBorder: cnStyle.borderColor,
      badgeText: badge ? badge.innerText.trim() : null,
      titleText: title ? title.innerText.trim() : null,
      titleColor: tStyle.color,
      privacyText: privacy ? privacy.innerText.trim() : null
    };
  })()`);
  console.log('Modal Visual Element Inspection:', modalInspection);

  // Verify theme switching updates modal correctly and does NOT alter user's selected reading theme
  const themeSwitchTest = await evalScript(`(() => {
    // 1. User selects 'sepia' reading theme
    if (window.StudyRonDesign && window.StudyRonDesign.setReadingTheme) {
      window.StudyRonDesign.setReadingTheme('sepia');
    }
    const savedReadingTheme1 = localStorage.getItem('kn-reading-theme');

    // 2. Page dark mode toggle occurs (e.g. system scheme or page toggle)
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
    const modal = document.getElementById('knSharedSubModal');
    const modalThemeDark = modal ? modal.getAttribute('data-modal-theme') : null;
    const readingThemeAfterDark = localStorage.getItem('kn-reading-theme');

    // 3. Page light mode toggle occurs
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark');
    if (window.syncSharedSubscriptionModalTheme) window.syncSharedSubscriptionModalTheme();
    const modalThemeLight = modal ? modal.getAttribute('data-modal-theme') : null;
    const readingThemeAfterLight = localStorage.getItem('kn-reading-theme');

    return {
      initialUserChoice: savedReadingTheme1,
      modalThemeDark,
      readingThemeAfterDark,
      modalThemeLight,
      readingThemeAfterLight,
      isReadingThemeUntouched: (savedReadingTheme1 === 'sepia' && readingThemeAfterDark === 'sepia' && readingThemeAfterLight === 'sepia')
    };
  })()`);
  console.log('Theme Switching Isolation Test:', themeSwitchTest);

  ws.close();
  chromeProcess.kill();

  console.log('\n======================================================');
  console.log('🎉 VISUAL REVIEW SUITE COMPLETED SUCCESSFULLY!');
  console.log('======================================================');
}

main().catch((err) => {
  console.error('Visual review failure:', err);
  process.exit(1);
});
