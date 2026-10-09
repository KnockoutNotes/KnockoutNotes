const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8095;
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
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9235',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=C:\\temp\\chrome-viewer-test'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9235/json');
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  for (const page of ['notes.html', 'drugs.html', 'critical-care.html']) {
    console.log('\n--- Testing card click & viewer on ' + page + ' ---');
    await send('Page.navigate', { url: 'http://localhost:' + PORT + '/' + page });
    for (let w = 0; w < 30; w++) {
      await new Promise(r => setTimeout(r, 200));
      const r = await send('Runtime.evaluate', { expression: 'document.readyState' });
      if (r && r.result && (r.result.value === 'complete' || r.result.value === 'interactive')) break;
    }
    await new Promise(r => setTimeout(r, 1000));

    // Click the active centered card CTA
    const clickResult = await send('Runtime.evaluate', {
      expression: `(() => {
        const card = document.querySelector('.kn-carousel-card[data-centered="true"]') || document.querySelector('.kn-file-row-wrap');
        if (!card) return { success: false, reason: 'no card found' };
        const cta = card.querySelector('.kn-file-arrow') || card;
        const anchor = card.querySelector('a');
        const href = anchor ? anchor.getAttribute('href') : null;
        const wired = card.dataset.kcClickWired;
        const centered = card.dataset.centered;
        const targetIdx = card.parentElement && card.parentElement._carousel ? card.parentElement._carousel.targetIndex : null;
        
        // Dispatch click
        cta.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return {
          success: true,
          text: card.textContent.trim().slice(0, 30),
          href,
          wired,
          centered,
          targetIdx
        };
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickResult.result.value);

    // Wait a moment for viewer to open and image to load
    await new Promise(r => setTimeout(r, 1500));

    const viewerState = await send('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.getElementById('knSpatialViewer');
        const img = document.getElementById('knViewerImg');
        const title = document.getElementById('knViewerTitle')?.textContent;
        return {
          isOpen: modal ? modal.classList.contains('open') : false,
          imgSrc: img ? img.src : null,
          imgDisplay: img ? img.style.display : null,
          imgNaturalWidth: img ? img.naturalWidth : 0,
          imgNaturalHeight: img ? img.naturalHeight : 0,
          title
        };
      })()`,
      returnByValue: true
    });
    console.log('Viewer state:', viewerState.result.value);

    // Test close
    await send('Runtime.evaluate', {
      expression: `(() => {
        const closeBtn = document.querySelector('#knSpatialViewer [data-close-viewer]');
        if (closeBtn) closeBtn.click();
      })()`
    });
    await new Promise(r => setTimeout(r, 400));
    const closed = await send('Runtime.evaluate', {
      expression: `document.getElementById('knSpatialViewer').classList.contains('open')`,
      returnByValue: true
    });
    console.log('Modal closed properly:', !closed.result.value);
  }

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
