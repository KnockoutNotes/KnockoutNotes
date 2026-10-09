const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8098;
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
  const userDataDir = path.join(require('os').tmpdir(), 'chrome-study-test');
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9238',
    '--window-size=1280,900',
    '--disable-extensions',
    `--user-data-dir=${userDataDir}`
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9238/json');
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

  const consoleErrors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  console.log('\n--- Navigating to study.html ---');
  await send('Page.navigate', { url: `http://localhost:${PORT}/study.html` });
  for (let w = 0; w < 30; w++) {
    await new Promise(r => setTimeout(r, 200));
    const r = await send('Runtime.evaluate', { expression: 'document.readyState' });
    if (r && r.result && (r.result.value === 'complete' || r.result.value === 'interactive')) break;
  }
  await new Promise(r => setTimeout(r, 2000));

  const studyState = await send('Runtime.evaluate', {
    expression: `(() => {
      const out = {};
      out.title = document.title;
      out.hasData = Boolean(window.KN_STUDY && window.KN_STUDY.topics && window.KN_STUDY.topics.length);
      out.topicsCount = window.KN_STUDY && window.KN_STUDY.topics ? window.KN_STUDY.topics.length : 0;
      out.categoriesCount = window.KN_STUDY && window.KN_STUDY.categories ? window.KN_STUDY.categories.length : 0;
      
      // Check tabs rendered in UI
      const tabs = Array.from(document.querySelectorAll('.study-ron-tab, .study-tab-btn, [role="tab"], .kn-ron-tab'));
      out.tabs = tabs.map(t => t.textContent.trim());

      // Check Case Discussions in KN_STUDY.topics
      const topics = (window.KN_STUDY && window.KN_STUDY.topics) || [];
      const caseTopics = topics.filter(t => t.category === 'case-discussions' || t.category === 'Case Discussions' || (t.tags && t.tags.includes('Case Discussion')));
      out.caseTopicsCount = caseTopics.length;
      out.ihdCase = Boolean(topics.find(c => c.id && (c.id.includes('ischemic') || c.id.includes('ihd'))));
      out.copdCase = Boolean(topics.find(c => c.id && c.id.includes('copd')));
      out.pneumonectomyCase = Boolean(topics.find(c => c.id && (c.id.includes('pneumonectomy') || c.id.includes('olv'))));

      // Check IHD case images
      const ihd = topics.find(c => c.id && (c.id.includes('ischemic') || c.id.includes('ihd')));
      out.ihdId = ihd ? ihd.id : null;
      out.ihdTitle = ihd ? ihd.title : null;
      out.ihdSectionImages = ihd && ihd.sections ? ihd.sections.filter(s => s.image).map(s => s.image.src) : [];

      return out;
    })()`,
    returnByValue: true
  });

  console.log('Study Section State:', JSON.stringify(studyState.result.value, null, 2));
  console.log('Console Errors:', consoleErrors);

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
