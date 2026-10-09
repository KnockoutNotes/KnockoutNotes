const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8097;
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
    '--remote-debugging-port=9237',
    '--window-size=1280,900',
    '--disable-extensions',
    '--user-data-dir=C:\\temp\\chrome-invoice-test'
  ]);
  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9237/json');
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
  await send('Page.navigate', { url: `http://localhost:${PORT}/workspace.html` });
  for (let w = 0; w < 30; w++) {
    await new Promise(r => setTimeout(r, 200));
    const r = await send('Runtime.evaluate', { expression: 'document.readyState' });
    if (r && r.result && (r.result.value === 'complete' || r.result.value === 'interactive')) break;
  }
  await new Promise(r => setTimeout(r, 1000));

  const testInvoiceResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        if (!window.KN_INVOICES) return { error: 'KN_INVOICES not found' };
        let generated = false;
        // Mock save so headless doesn't hang on file dialog
        const origSave = window.jspdf ? window.jspdf.jsPDF.prototype.save : null;
        await window.KN_INVOICES.generatePdf({
          invoice_number: 'INV-KN-2026-00042',
          invoice_date: new Date().toISOString(),
          user_name: 'Dr. Test Student',
          user_email: 'resident@hospital.org',
          item_title: 'Percutaneous Tracheostomy & Cricothyroidotomy',
          amount_inr: 49,
          order_id: 'order_kn_1728456789_test',
          cf_payment_id: 'cf_pay_99887766',
          payment_method: 'UPI (Google Pay)',
          payment_status: 'PAID'
        });
        return { success: true };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Invoice test result:', testInvoiceResult.result.value);

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
