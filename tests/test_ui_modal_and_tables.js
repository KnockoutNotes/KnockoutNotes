/**
 * test_ui_modal_and_tables.js
 * Verification of Subscription Modal UI, Light/Dark Theme contrast, and Medical Table Responsiveness
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const assert = require('assert');

const PORT = 8162;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createStaticServer() {
  return http.createServer((req, res) => {
    let parsedUrl;
    try {
      parsedUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
    } catch {
      res.writeHead(400);
      return res.end();
    }

    if (parsedUrl.pathname === '/api/subscribe') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, message: 'Subscribed' }));
    }

    let filePath = path.join(__dirname, '..', parsedUrl.pathname === '/' ? 'study.html' : parsedUrl.pathname);
    if (parsedUrl.pathname === '/study') filePath = path.join(__dirname, '..', 'study.html');

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      return res.end('Not found');
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function runTest() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  console.log(`UI Polish test server running on port ${PORT}`);

  const chromePath = await findChromePath();
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-profile-ui-test');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=1280,800'
  ]);

  await delay(1200);

  let wsUrl;
  for (let i = 0; i < 20; i++) {
    try {
      const resp = await fetch('http://127.0.0.1:9232/json');
      const data = await resp.json();
      if (data && data[0] && data[0].webSocketDebuggerUrl) {
        wsUrl = data[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await delay(300);
  }

  if (!wsUrl) {
    throw new Error('Failed to connect to headless Chrome debugger');
  }

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });

  let reqId = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = reqId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evalScript(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('Script error: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  try {
    await send('Page.enable');
    await send('DOM.enable');
    await send('CSS.enable');

    async function waitForAppReady() {
      for (let i = 0; i < 40; i++) {
        try {
          const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined" && typeof window.StudyRonDesign.isFullScreenReadingModeActive === "function"`);
          if (ready) return true;
        } catch (_) {}
        await delay(150);
      }
      return false;
    }

    console.log('\n--- 1. VERIFY SUBSCRIPTION MODAL IN DARK MODE (DEFAULT) ---');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html` });
    await waitForAppReady();
    await evalScript(`sessionStorage.clear(); localStorage.setItem('kn-theme', 'dark');`);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=fentanyl&mode=study&ref=share` });
    await waitForAppReady();
    await delay(700);

    const modalStylesDark = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      const dialog = modal ? modal.querySelector('.kn-sub-modal-dialog') : null;
      const title = modal ? modal.querySelector('.kn-sub-modal-title') : null;
      const input = modal ? modal.querySelector('#knSubEmailInput') : null;
      const submitBtn = modal ? modal.querySelector('#knSubSubmitBtn') : null;
      const cancelBtn = modal ? modal.querySelector('#knSubCancelBtn') : null;
      const closeBtn = modal ? modal.querySelector('#knSubModalCloseBtn') : null;

      if (!dialog) return null;
      const dStyle = window.getComputedStyle(dialog);
      const tStyle = window.getComputedStyle(title);
      const iStyle = window.getComputedStyle(input);
      const sStyle = window.getComputedStyle(submitBtn);
      const cStyle = window.getComputedStyle(cancelBtn);
      const clStyle = window.getComputedStyle(closeBtn);

      return {
        cardBg: dStyle.backgroundColor,
        cardRadius: dStyle.borderRadius,
        cardShadow: dStyle.boxShadow,
        cardColor: dStyle.color,
        titleColor: tStyle.color,
        inputBg: iStyle.backgroundColor,
        inputBorder: iStyle.borderColor,
        inputRadius: iStyle.borderRadius,
        submitBg: sStyle.backgroundColor,
        submitColor: sStyle.color,
        submitRadius: sStyle.borderRadius,
        cancelBg: cStyle.backgroundColor,
        cancelColor: cStyle.color,
        cancelBorder: cStyle.borderColor,
        closeRadius: clStyle.borderRadius
      };
    })()`);

    console.log('Dark Mode Modal Styles:', modalStylesDark);
    assert(modalStylesDark !== null, 'Subscription modal card rendered in DOM');
    assert(modalStylesDark.cardBg === 'rgb(21, 25, 34)', 'Card background is dark slate #151922 in dark mode');
    assert(modalStylesDark.titleColor === 'rgb(248, 250, 252)', 'Title text is high contrast bright slate #f8fafc');
    assert(modalStylesDark.inputBg === 'rgb(30, 41, 59)', 'Input background is slate-800 #1e293b in dark mode');
    assert(modalStylesDark.inputBorder === 'rgb(51, 65, 85)', 'Input border is slate-700 #334155 in dark mode');
    assert(modalStylesDark.cancelBorder === 'rgb(51, 65, 85)', 'Cancel button border is slate-700 #334155 in dark mode');
    assert(parseInt(modalStylesDark.cardRadius, 10) >= 18, 'Card has rounded corners (>= 18px)');
    assert(modalStylesDark.submitBg === 'rgb(2, 132, 199)', 'Submit button has brand primary blue background');
    assert(modalStylesDark.submitColor === 'rgb(255, 255, 255)', 'Submit button has white text');
    console.log('✅ PASS: Subscription modal dark mode provides seamless contrast and styling');

    console.log('\n--- 2. VERIFY SUBSCRIPTION MODAL IN LIGHT MODE ---');
    await evalScript(`(() => {
      localStorage.setItem('kn-theme', 'light');
      sessionStorage.clear();
    })()`);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=rocuronium&mode=study&ref=share` });
    await waitForAppReady();
    await delay(700);

    const modalStylesLight = await evalScript(`(() => {
      const modal = document.getElementById('knSharedSubModal');
      const dialog = modal ? modal.querySelector('.kn-sub-modal-dialog') : null;
      const title = modal ? modal.querySelector('.kn-sub-modal-title') : null;
      const input = modal ? modal.querySelector('#knSubEmailInput') : null;
      const submitBtn = modal ? modal.querySelector('#knSubSubmitBtn') : null;
      const cancelBtn = modal ? modal.querySelector('#knSubCancelBtn') : null;
      const closeBtn = modal ? modal.querySelector('#knSubModalCloseBtn') : null;

      if (!dialog) return null;
      const dStyle = window.getComputedStyle(dialog);
      const tStyle = window.getComputedStyle(title);
      const iStyle = window.getComputedStyle(input);
      const sStyle = window.getComputedStyle(submitBtn);
      const cStyle = window.getComputedStyle(cancelBtn);
      const clStyle = window.getComputedStyle(closeBtn);

      return {
        cardBg: dStyle.backgroundColor,
        cardRadius: dStyle.borderRadius,
        cardShadow: dStyle.boxShadow,
        cardColor: dStyle.color,
        titleColor: tStyle.color,
        inputBg: iStyle.backgroundColor,
        inputBorder: iStyle.borderColor,
        inputRadius: iStyle.borderRadius,
        submitBg: sStyle.backgroundColor,
        submitColor: sStyle.color,
        submitRadius: sStyle.borderRadius,
        cancelBg: cStyle.backgroundColor,
        cancelBorder: cStyle.borderColor,
        closeRadius: clStyle.borderRadius
      };
    })()`);

    console.log('Light Mode Modal Styles:', modalStylesLight);
    assert(modalStylesLight !== null, 'Subscription modal card rendered in DOM in light mode');
    assert(modalStylesLight.cardBg === 'rgb(255, 255, 255)', 'Card background is white in light mode');
    assert(modalStylesLight.titleColor === 'rgb(15, 23, 42)', 'Title text is slate-900 in light mode');
    assert(modalStylesLight.inputBg === 'rgb(255, 255, 255)', 'Input background is white in light mode');
    assert(modalStylesLight.inputBorder === 'rgb(203, 213, 225)', 'Input border is slate-300 in light mode');
    assert(modalStylesLight.cancelBorder === 'rgb(203, 213, 225)', 'Cancel button border is slate-300 in light mode');
    console.log('✅ PASS: Subscription modal styled with high polish in light mode');
    console.log('✅ PASS: Subscription modal dark mode provides seamless contrast and styling');

    console.log('\n--- 3. VERIFY MEDICAL TABLES IN STUDY MODE ---');
    // Dismiss modal to inspect tables
    await evalScript(`document.getElementById('knSubCancelBtn').click();`);
    await delay(300);

    const tableStudyState = await evalScript(`(() => {
      const tableWrap = document.querySelector('.ron-table-wrap');
      const table = tableWrap ? tableWrap.querySelector('.ron-clinical-table') : null;
      const firstTh = table ? table.querySelector('th:first-child') : null;
      const firstTd = table ? table.querySelector('td:first-child') : null;

      if (!tableWrap || !table) return null;
      const wStyle = window.getComputedStyle(tableWrap);
      const thStyle = window.getComputedStyle(firstTh);
      const tdStyle = window.getComputedStyle(firstTd);

      return {
        hasWrap: true,
        wrapOverflowX: wStyle.overflowX,
        wrapBorderRadius: wStyle.borderRadius,
        thBg: thStyle.backgroundColor,
        thColor: thStyle.color,
        thFontWeight: thStyle.fontWeight,
        tdFontWeight: tdStyle.fontWeight,
        firstColWidth: thStyle.width
      };
    })()`);

    console.log('Study Mode Table Styles:', tableStudyState);
    assert(tableStudyState !== null, 'Table wrapper and .ron-clinical-table found in monograph');
    assert(tableStudyState.wrapOverflowX === 'auto', 'Table wrapper has overflow-x: auto for independent scrolling');
    assert(parseInt(tableStudyState.wrapBorderRadius, 10) >= 12, 'Table wrapper has rounded corners (>= 12px)');
    assert(parseInt(tableStudyState.thFontWeight, 10) >= 700, 'Table headers have bold font weight (>= 700)');
    console.log('✅ PASS: Medical table wrapper and headers properly styled in Study Mode');

    console.log('\n--- 4. VERIFY MEDICAL TABLES IN READING MODE ---');
    await evalScript(`window.StudyRonDesign.openFullScreenReadingMode();`);
    await delay(400);

    const rmTableState = await evalScript(`(() => {
      const rmOverlay = document.getElementById('ronReadingModeOverlay');
      const bodyTarget = document.getElementById('ronRmBodyTarget');
      const tableWrap = bodyTarget ? bodyTarget.querySelector('.ron-table-wrap') : null;
      const table = tableWrap ? tableWrap.querySelector('.ron-clinical-table') : null;
      const firstTh = table ? table.querySelector('th:first-child') : null;

      const wStyle = tableWrap ? window.getComputedStyle(tableWrap) : null;
      const thStyle = firstTh ? window.getComputedStyle(firstTh) : null;

      return {
        isRmOpen: window.StudyRonDesign.isFullScreenReadingModeActive(),
        tableInReadingMode: !!table,
        wrapOverflowX: wStyle ? wStyle.overflowX : null,
        thColor: thStyle ? thStyle.color : null
      };
    })()`);

    console.log('Reading Mode Table State:', rmTableState);
    assert(rmTableState.isRmOpen, 'Reading Mode is active');
    assert(rmTableState.tableInReadingMode, 'Medical table present in Reading Mode body');
    assert(rmTableState.wrapOverflowX === 'auto', 'Table wrapper retains overflow-x: auto in Reading Mode');
    console.log('✅ PASS: Medical table seamlessly functions inside Reading Mode');

    console.log('\n--- 5. MOBILE VIEWPORT OVERFLOW CHECK (390px Mobile Portrait) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await delay(300);

    const mobileOverflow = await evalScript(`(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const tableWrap = document.querySelector('#ronRmBodyTarget .ron-table-wrap') || document.querySelector('.ron-table-wrap');
      const hasHorizontalScroll = tableWrap ? tableWrap.scrollWidth > tableWrap.clientWidth : false;

      return {
        docScrollWidth: docW,
        windowInnerWidth: winW,
        pageHasOverflow: docW > winW,
        tableWrapClientWidth: tableWrap ? tableWrap.clientWidth : 0,
        tableWrapScrollWidth: tableWrap ? tableWrap.scrollWidth : 0
      };
    })()`);

    console.log('Mobile Portrait Metrics:', mobileOverflow);
    assert(!mobileOverflow.pageHasOverflow, `Page horizontal overflow detected: docWidth=${mobileOverflow.docScrollWidth} > windowWidth=${mobileOverflow.windowInnerWidth}`);
    console.log('✅ PASS: No page-level horizontal overflow on mobile; tables scroll safely inside their wrappers');

    console.log('\n======================================================');
    console.log('🎉 ALL UI MODAL & MEDICAL TABLE TESTS PASSED!');
    console.log('======================================================');
  } finally {
    ws.close();
    chromeProcess.kill();
    server.close();
  }
}

runTest().catch((err) => {
  console.error('❌ TEST FAILED:', err);
  process.exit(1);
});
