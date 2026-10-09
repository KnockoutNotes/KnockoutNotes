const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8092;
const ROOT = path.resolve(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, decodeURIComponent(reqPath));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const content = fs.readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Content-Length': content.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });
    res.end(content);
  } else {
    // console.log('[404]', req.url);
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9232',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=C:\\temp\\chrome-debug-profile-diagnose'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9232/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);
  let id = 1;
  const send = (m, p={}) => new Promise(r => {
    const cur = id++;
    const h = (e) => {
      const d = JSON.parse(e.data);
      if (d.id === cur) { ws.removeEventListener('message', h); r(d.result); }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: cur, method: m, params: p }));
  });

  const consoleMessages = [];
  const failedRequests = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Console.messageAdded') {
      consoleMessages.push(msg.params.message);
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push({ type: msg.params.type, text: msg.params.args.map(a => a.value || a.description).join(' ') });
    } else if (msg.method === 'Network.responseReceived') {
      if (msg.params.response.status >= 400) {
        failedRequests.push({ url: msg.params.response.url, status: msg.params.response.status });
      }
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

  const pages = ['notes.html', 'drugs.html', 'critical-care.html'];
  const report = {};

  for (const p of pages) {
    consoleMessages.length = 0;
    failedRequests.length = 0;

    await send('Page.navigate', { url: `http://localhost:${PORT}/${p}` });
    for (let w = 0; w < 30; w++) {
      await new Promise(r => setTimeout(r, 200));
      const r = await send('Runtime.evaluate', { expression: 'document.readyState' });
      if (r && r.result && (r.result.value === 'complete' || r.result.value === 'interactive')) break;
    }
    await new Promise(r => setTimeout(r, 1000));

    const pageInfo = await send('Runtime.evaluate', {
      expression: `(() => {
        const out = {};
        out.url = window.location.href;
        out.ready = document.readyState;
        out.contentLib = !!window.KnockoutNotesLibrary;
        out.contentCfg = !!window.KNOCKOUTNOTES_CONTENT;
        out.title = document.title;
        out.carouselCount = window.KnCarousel && window.KnCarousel.list ? window.KnCarousel.list.length : 0;
        out.carousels = window.KnCarousel && window.KnCarousel.list ? window.KnCarousel.list.map(c => ({
          containerTag: c.container.tagName,
          containerClass: c.container.className,
          cardsCount: c.cards ? c.cards.length : 0,
          deployed: c.deployed,
          height: c.container.style.height || window.getComputedStyle(c.container).height,
          display: window.getComputedStyle(c.container).display
        })) : [];

        // Check images on page
        const imgs = Array.from(document.querySelectorAll('img'));
        out.totalImages = imgs.length;
        out.brokenImages = imgs.filter(img => img.naturalWidth === 0 && img.src).map(img => ({
          src: img.src,
          alt: img.alt,
          class: img.className
        }));

        // Check cards in DOM
        const cards = Array.from(document.querySelectorAll('.card, .kn-file-row, .kn-carousel-card, .drug-card, .bento-card'));
        out.cardsCount = cards.length;

        // Check library tabs / categories
        const tabs = Array.from(document.querySelectorAll('.kn-library-tab, [role="tab"]'));
        out.tabsCount = tabs.length;
        out.tabs = tabs.map(t => (t.textContent || '').trim());

        return out;
      })()`,
      returnByValue: true
    });

    report[p] = {
      ...pageInfo.result.value,
      consoleErrors: consoleMessages.filter(m => m.level === 'error' || m.type === 'error'),
      failedRequests: [...failedRequests]
    };
  }

  console.log('\n======================================================');
  console.log('DIAGNOSTIC REPORT FOR NOTES, DRUGS, CRITICAL CARE:');
  console.log('======================================================');
  console.log(JSON.stringify(report, null, 2));

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
