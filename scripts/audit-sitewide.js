const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const PORT = 8099;
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
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(content);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(os.tmpdir(), 'chrome-sitewide-audit');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9239',
    '--window-size=1280,900',
    '--disable-extensions',
    `--user-data-dir=${userDataDir}`
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9239/json');
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

  const errors = {};
  let currentPage = '';

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      const text = msg.params.args.map(a => a.value || a.description).join(' ');
      if (!errors[currentPage]) errors[currentPage] = [];
      errors[currentPage].push(text);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const pages = [
    'index.html',
    'study.html',
    'notes.html',
    'drugs.html',
    'critical-care.html',
    'workspace.html',
    'calculators.html',
    'crisis.html',
    'resuscitation-chamber.html',
    'regional-anaesthesia.html',
    'ventilator.html',
    'pricing.html'
  ];

  const results = {};

  for (const p of pages) {
    currentPage = p;
    await send('Page.navigate', { url: `http://localhost:${PORT}/${p}` });
    for (let w = 0; w < 30; w++) {
      await new Promise(r => setTimeout(r, 150));
      const r = await send('Runtime.evaluate', { expression: 'document.readyState' });
      if (r && r.result && (r.result.value === 'complete' || r.result.value === 'interactive')) break;
    }
    await new Promise(r => setTimeout(r, 700));

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const topEl = document.elementFromPoint(600, 30);
        const clickable = document.querySelector('a, button');
        const clickTarget = clickable ? document.elementFromPoint(
          clickable.getBoundingClientRect().left + 10,
          clickable.getBoundingClientRect().top + 10
        ) : null;
        return {
          title: document.title,
          topElement: topEl ? (topEl.tagName + '.' + (topEl.className || '').toString().slice(0, 30)) : 'null',
          isInteractive: Boolean(clickTarget)
        };
      })()`,
      returnByValue: true
    });
    results[p] = { ...check.result.value, errors: errors[p] || [] };
  }

  console.log('\n======================================================');
  console.log('SITEWIDE AUDIT RESULTS (12 PAGES):');
  console.log('======================================================');
  console.log(JSON.stringify(results, null, 2));

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
