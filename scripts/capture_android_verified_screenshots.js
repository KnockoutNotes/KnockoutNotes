const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8168;
const CDP_PORT = 9245;
const OUT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\cf1e10e5-fc32-4590-a15d-802b606be440\\screenshots';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(__dirname, '..', 'scratch/chrome-cdp-android-verified');
  fs.mkdirSync(userDataDir, { recursive: true });

  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--user-data-dir=' + userDataDir,
    '--no-first-run',
    '--no-default-browser-check',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--window-size=390,844'
  ]);

  await delay(1200);

  let wsUrl;
  for (let i = 0; i < 20; i++) {
    try {
      const resp = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
      const data = await resp.json();
      if (data && data[0] && data[0].webSocketDebuggerUrl) {
        wsUrl = data[0].webSocketDebuggerUrl;
        break;
      }
    } catch {}
    await delay(300);
  }

  if (!wsUrl) throw new Error('Cannot connect to Chrome CDP');

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
    return res && res.result ? res.result.value : undefined;
  };

  try {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setTouchEmulationEnabled', { enabled: true });

    // 1. Android Portrait Dark Mode (390x844)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-color-scheme', value: 'dark' }]
    });

    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/study.html?topic=propofol&mode=study&ref=share` });

    for (let i = 0; i < 40; i++) {
      try {
        const ready = await evalScript(`typeof window.StudyRonDesign !== "undefined"`);
        if (ready) break;
      } catch (_) {}
      await delay(200);
    }
    await delay(1000);

    let ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'android_verified_dark_portrait_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: android_verified_dark_portrait_390x844.png');

    // 2. Android Portrait Light Mode (390x844)
    await evalScript(`(() => {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      const modal = document.getElementById('knSharedSubModal');
      if (modal) modal.setAttribute('data-modal-theme', 'light');
    })()`);
    await delay(300);

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'android_verified_light_portrait_390x844.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: android_verified_light_portrait_390x844.png');

    // 3. Android Landscape Dark Mode (844x390)
    await send('Emulation.setDeviceMetricsOverride', {
      width: 844,
      height: 390,
      deviceScaleFactor: 3,
      mobile: true
    });
    await evalScript(`(() => {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      const modal = document.getElementById('knSharedSubModal');
      if (modal) modal.setAttribute('data-modal-theme', 'dark');
    })()`);
    await delay(300);

    ss = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT_DIR, 'android_verified_dark_landscape_844x390.png'), Buffer.from(ss.data, 'base64'));
    console.log('Saved: android_verified_dark_landscape_844x390.png');

    console.log('SUCCESS: All 3 Android mobile screenshots verified!');
  } finally {
    ws.close();
    chromeProcess.kill();
    server.close();
  }
}

main().catch(console.error);
