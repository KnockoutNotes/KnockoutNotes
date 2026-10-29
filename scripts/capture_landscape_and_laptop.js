const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8080;
const CDP_PORT = 9290;
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-landscape');
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
      returnByValue: true
    });
    return res && res.result ? res.result.value : undefined;
  };

  const ensureReadingMode = async () => {
    for (let i = 0; i < 30; i++) {
      const state = await evalScript(`(() => {
        const overlay = document.getElementById('ronReadingModeOverlay');
        const content = document.getElementById('ronRmContentWrapper');
        if (overlay && content && !overlay.hidden) return 'ready';
        if (window.StudyRonDesign && window.StudyRonDesign.openFullScreenReadingMode) {
          window.StudyRonDesign.openFullScreenReadingMode();
        }
        return 'waiting';
      })()`);
      if (state === 'ready') break;
      await delay(250);
    }
    await evalScript(`(() => {
      const m = document.getElementById('knSharedSubModal');
      if (m) m.hidden = true;
    })()`);
    await delay(200);
  };

  const measureState = async () => {
    return await evalScript(`(() => {
      const overlay = document.getElementById('ronReadingModeOverlay');
      const content = document.getElementById('ronRmContentWrapper');
      const topbar = document.getElementById('ronRmTopbar');
      const csContent = content ? window.getComputedStyle(content) : null;
      const contentRect = content ? content.getBoundingClientRect() : null;
      const viewportWidth = window.innerWidth;
      const contentWidth = contentRect ? Math.round(contentRect.width) : null;
      const leftMargin = contentRect ? Math.round(contentRect.left) : null;
      const rightMargin = contentRect ? Math.round(viewportWidth - contentRect.right) : null;

      return {
        viewportWidth,
        viewportHeight: window.innerHeight,
        widthMode: overlay ? overlay.getAttribute('data-reading-width') : null,
        readingContainerWidth: contentWidth,
        leftMargin,
        rightMargin,
        usablePercent: contentWidth ? Math.round((contentWidth / viewportWidth) * 100) : null,
        paddingLeft: csContent ? csContent.paddingLeft : null,
        paddingRight: csContent ? csContent.paddingRight : null,
        topbarHeight: topbar ? topbar.offsetHeight : null,
        docScrollWidth: document.documentElement.scrollWidth,
        hasPageHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
      };
    })()`);
  };

  try {
    await send('Page.enable');
    await send('Runtime.enable');

    // 1. Laptop 1280x800 Wide
    console.log('Capturing Laptop 1280x800...');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await ensureReadingMode();
    await evalScript(`window.StudyRonDesign.setReadingWidth('wide')`);
    await delay(400);
    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_laptop_1280x800_wide.png'), Buffer.from(ss.data, 'base64'));
    const laptop1280 = await measureState();
    console.log('Laptop 1280 Wide:', JSON.stringify(laptop1280, null, 2));

    // 2. Mobile Landscape 844x390
    console.log('\nCapturing Mobile Landscape 844x390...');
    await send('Emulation.setDeviceMetricsOverride', { width: 844, height: 390, deviceScaleFactor: 3, mobile: true });
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=reading` });
    await ensureReadingMode();
    await delay(400);
    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'overhaul_mobile_844x390_landscape.png'), Buffer.from(ss.data, 'base64'));
    const mobile844 = await measureState();
    console.log('Mobile 844 Landscape:', JSON.stringify(mobile844, null, 2));

    // Update measurements JSON
    const measPath = path.join(OUT_DIR, 'overhaul_measurements.json');
    let meas = {};
    if (fs.existsSync(measPath)) {
      meas = JSON.parse(fs.readFileSync(measPath, 'utf8'));
    }
    meas.laptop1280_wide = laptop1280;
    meas.mobile844_landscape = mobile844;
    fs.writeFileSync(measPath, JSON.stringify(meas, null, 2));
    console.log('\n✅ Successfully captured Laptop 1280x800 and Mobile Landscape 844x390!');

  } finally {
    ws.close();
    chromeProcess.kill();
  }
}

main().catch(console.error);
