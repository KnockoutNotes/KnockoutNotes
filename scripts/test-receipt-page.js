const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const PORT = 8092;
const ROOT = path.resolve(__dirname, '..');
const ARTIFACT_DIR = 'C:\\Users\\kmane\\.gemini\\antigravity\\brain\\361898ab-c15c-4e35-bc31-d7aa336953b9';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(ROOT, urlPath === '/' ? 'index.html' : urlPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      'Cache-Control': 'no-store'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`);
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9246',
    '--window-size=1280,1000',
    '--disable-extensions',
    `--user-data-dir=${path.join(os.tmpdir(), 'chrome-receipt-test')}`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9246/json');
  const targets = await res.json();
  const pageTarget = targets.find(t => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(r => {
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

  console.log('\n--- Navigating to receipt.html?mode=preview ---');
  await send('Page.navigate', { url: `http://localhost:${PORT}/receipt.html?mode=preview` });
  await new Promise(r => setTimeout(r, 2500));

  // Inspect DOM State
  const domState = await send('Runtime.evaluate', {
    expression: `(() => {
      return {
        title: document.title,
        receiptNum: document.getElementById('knReceiptNum')?.textContent,
        customerName: document.getElementById('knCustomerName')?.textContent,
        customerEmail: document.getElementById('knCustomerEmail')?.textContent,
        productTitle: document.getElementById('knProductTitle')?.textContent,
        itemAmount: document.getElementById('knItemAmount')?.textContent,
        grandTotal: document.getElementById('knGrandTotal')?.textContent,
        orderId: document.getElementById('knOrderId')?.textContent,
        txnRef: document.getElementById('knTxnRef')?.textContent,
        issueDate: document.getElementById('knIssueDate')?.textContent,
        paymentDate: document.getElementById('knPaymentDate')?.textContent,
        hasWatermark: Boolean(document.getElementById('knWatermark')),
        watermarkText: document.getElementById('knWatermark')?.textContent?.replace(/\\s+/g, ' ').trim(),
        hasBanner: Boolean(document.getElementById('knSampleBanner')),
        statusBadge: document.getElementById('knStatusBadge')?.textContent
      };
    })()`,
    returnByValue: true
  });

  console.log('DOM State:', JSON.stringify(domState.result.value, null, 2));

  // Test PDF generation execution
  console.log('\n--- Testing PDF Generator Execution on Sample Data ---');
  const pdfTest = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        if (!window.KN_INVOICES) return { error: 'KN_INVOICES not found' };
        const res = await window.KN_INVOICES.generatePdf({
          is_sample: true,
          invoice_number: "KN-SAMPLE-2026-000123",
          issue_date: "2026-10-09T10:00:00.000Z",
          payment_date: "2026-10-09T10:00:00.000Z",
          order_id: "KN_ORD_SMPL_VENT_2026",
          cf_payment_id: "TEST_TXN_8F31A2",
          payment_method: "UPI / Net Banking / Card",
          payment_status: "SAMPLE — NOT A REAL PAYMENT",
          user_name: "Sample Learner",
          user_email: "learner@sample.knockoutnotes.com",
          item_title: "Critical Care — Mechanical Ventilation",
          amount_inr: 499.00,
          currency: "INR"
        });
        return { success: true, res };
      } catch (e) {
        return { error: e.message };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('PDF Test Result:', JSON.stringify(pdfTest.result.value, null, 2));

  // Capture screenshot of the receipt
  console.log('\n--- Capturing Receipt Screenshot ---');
  const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
  if (screenshotRes && screenshotRes.data) {
    const imgBuffer = Buffer.from(screenshotRes.data, 'base64');
    const screenshotPath = path.join(ARTIFACT_DIR, 'sample_payment_receipt_preview.png');
    fs.writeFileSync(screenshotPath, imgBuffer);
    console.log(`Saved receipt screenshot to: ${screenshotPath}`);
  }

  console.log('Console Errors:', consoleErrors);

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
