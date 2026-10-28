/**
 * diagnose_live_android_modal.js
 * Inspects actual live production DOM and computed styles on simulated Android device
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const LIVE_URL = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study?topic=propofol&mode=study&ref=share';
const CDP_PORT = 9255;
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

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
  const chromePath = await findChromePath();
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-android-diag');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--window-size=390,844',
    '--user-agent=Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
    '--disable-extensions',
    '--no-sandbox',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await delay(1500);

  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const tabs = await listRes.json();
  const wsUrl = (tabs.find((t) => t.type === 'page') || tabs[0]).webSocketDebuggerUrl;

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
    } catch (e) {}
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
  await send('DOM.enable');
  await send('CSS.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true
  });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true });

  console.log('Navigating to Live URL:', LIVE_URL);
  await send('Page.navigate', { url: LIVE_URL });

  // Wait for app ready
  for (let i = 0; i < 40; i++) {
    try {
      const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined"`);
      if (ready) break;
    } catch (_) {}
    await delay(200);
  }
  await delay(1500);

  // Capture screenshot of live modal
  const ss = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(OUT_DIR, 'android_live_current_rendered.png'), Buffer.from(ss.data, 'base64'));
  console.log('Saved screenshot: android_live_current_rendered.png');

  // Inspect DOM and computed styles
  const inspection = await evalScript(`(() => {
    const modal = document.getElementById('knSharedSubModal');
    if (!modal) return { modalFound: false };

    const dialog = modal.querySelector('.kn-sub-modal-dialog, .kn-sub-modal-card');
    const closeBtn = modal.querySelector('#knSubModalCloseBtn');
    const badge = modal.querySelector('.kn-sub-modal-badge');
    const title = modal.querySelector('#knSubModalTitle, .kn-sub-modal-title');
    const desc = modal.querySelector('#knSubModalDesc, .kn-sub-modal-desc');
    const form = modal.querySelector('#knSharedSubForm, .kn-sub-modal-form');
    const field = modal.querySelector('.kn-sub-modal-field, .kn-sub-input-wrap');
    const label = modal.querySelector('.kn-sub-modal-label, .kn-sub-label');
    const input = modal.querySelector('#knSubEmailInput');
    const submitBtn = modal.querySelector('#knSubSubmitBtn');
    const cancelBtn = modal.querySelector('#knSubCancelBtn');

    function getDetails(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        tagName: el.tagName,
        className: el.className,
        outerHTML: el.outerHTML.substring(0, 300),
        computed: {
          display: s.display,
          position: s.position,
          width: s.width,
          height: s.height,
          margin: s.margin,
          padding: s.padding,
          fontFamily: s.fontFamily,
          fontSize: s.fontSize,
          color: s.color,
          backgroundColor: s.backgroundColor,
          border: s.border,
          borderRadius: s.borderRadius,
          appearance: s.appearance || s.webkitAppearance,
          zIndex: s.zIndex,
          boxShadow: s.boxShadow
        }
      };
    }

    return {
      modalFound: true,
      modalHTML: modal.outerHTML.substring(0, 500),
      dialog: getDetails(dialog),
      closeBtn: getDetails(closeBtn),
      badge: getDetails(badge),
      title: getDetails(title),
      desc: getDetails(desc),
      form: getDetails(form),
      field: getDetails(field),
      label: getDetails(label),
      input: getDetails(input),
      submitBtn: getDetails(submitBtn),
      cancelBtn: getDetails(cancelBtn),
      loadedStylesheets: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
      loadedScripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src)
    };
  })()`);

  console.log('\n--- DOM & COMPUTED STYLE INSPECTION ---');
  console.log(JSON.stringify(inspection, null, 2));

  ws.close();
  chromeProcess.kill();
}

main().catch(console.error);
