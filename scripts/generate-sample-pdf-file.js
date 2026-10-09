const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 8093;
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
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9247',
    '--window-size=1280,1000',
    '--disable-extensions',
    `--user-data-dir=${path.join(os.tmpdir(), 'chrome-pdf-gen-test')}`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const res = await fetch('http://127.0.0.1:9247/json');
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

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url: `http://localhost:${PORT}/receipt.html?mode=preview` });
  await new Promise(r => setTimeout(r, 2500));

  // Generate Base64 PDF using jsPDF doc.output('datauristring')
  const pdfOutput = await send('Runtime.evaluate', {
    expression: `(async () => {
      const jsPDF = window.jspdf ? window.jspdf.jsPDF : null;
      if (!jsPDF) return { error: 'jsPDF not loaded' };
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      const contentWidth = pageWidth - (margin * 2);

      const inv = {
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
      };

      // Header Banner
      doc.setFillColor(11, 19, 41);
      doc.rect(0, 0, pageWidth, 92, 'F');
      doc.setFillColor(0, 229, 255);
      doc.rect(0, 89, pageWidth, 3, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('KnockoutNotes', margin, 42);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text('MEDICAL EDUCATION & ANAESTHESIA ACADEMY', margin, 60);
      doc.setTextColor(0, 229, 255);
      doc.text('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev', margin, 74);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 229, 255);
      doc.text('SAMPLE PAYMENT RECEIPT', pageWidth - margin, 38, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(241, 245, 249);
      doc.text('Receipt No: ' + inv.invoice_number, pageWidth - margin, 53, { align: 'right' });
      doc.setTextColor(148, 163, 184);
      doc.text('Issued: 9 October 2026', pageWidth - margin, 66, { align: 'right' });
      doc.text('Paid: 9 October 2026 at 03:30 pm IST', pageWidth - margin, 79, { align: 'right' });

      // Watermark
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(36);
      doc.text('SAMPLE — NOT A VALID RECEIPT', pageWidth / 2, 420, { align: 'center', angle: 35 });

      // Metadata Cards
      const boxY = 110;
      const boxH = 96;
      const halfW = (contentWidth - 16) / 2;

      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, boxY, halfW, boxH, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('BILLED TO / STUDENT DETAILS', margin + 12, boxY + 18);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(inv.user_name, margin + 12, boxY + 36);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Email: ' + inv.user_email, margin + 12, boxY + 52);
      doc.text('Course: Anaesthesia & Critical Care Residency', margin + 12, boxY + 67);
      doc.text('Country of Supply: India', margin + 12, boxY + 82);

      const box2X = margin + halfW + 16;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(box2X, boxY, halfW, boxH, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text('TRANSACTION & GATEWAY DETAILS', box2X + 12, boxY + 18);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Order ID:', box2X + 12, boxY + 35);
      doc.setFont('helvetica', 'bold');
      doc.text(inv.order_id, box2X + 70, boxY + 35);

      doc.setFont('helvetica', 'normal');
      doc.text('Txn Ref:', box2X + 12, boxY + 50);
      doc.text(inv.cf_payment_id, box2X + 70, boxY + 50);

      doc.text('Method:', box2X + 12, boxY + 65);
      doc.text(inv.payment_method, box2X + 70, boxY + 65);

      doc.text('Status:', box2X + 12, boxY + 81);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('SAMPLE — NOT A REAL PAYMENT', box2X + 70, boxY + 81);

      // Table
      const tableY = boxY + boxH + 24;
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, tableY, contentWidth, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text('#', margin + 10, tableY + 16);
      doc.text('DESCRIPTION & EDUCATIONAL MODULE', margin + 35, tableY + 16);
      doc.text('QTY', margin + contentWidth - 140, tableY + 16, { align: 'center' });
      doc.text('TAX RATE', margin + contentWidth - 75, tableY + 16, { align: 'right' });
      doc.text('AMOUNT (INR)', margin + contentWidth - 10, tableY + 16, { align: 'right' });

      const rowY = tableY + 40;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1', margin + 10, rowY);

      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(inv.item_title, contentWidth - 210);
      doc.text(titleLines, margin + 35, rowY);

      const descY = rowY + (titleLines.length * 12);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('Interactive Clinical Monograph, Pressure/Flow Waveforms & Lifetime Study Notes Access', margin + 35, descY);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text('1', margin + contentWidth - 140, rowY, { align: 'center' });
      doc.text('0% (Exempt)', margin + contentWidth - 75, rowY, { align: 'right' });
      doc.text('Rs. 499.00', margin + contentWidth - 10, rowY, { align: 'right' });

      const dividerY = Math.max(descY + 18, rowY + 32);
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, dividerY, margin + contentWidth, dividerY);

      // Totals
      const totalY = dividerY + 28;
      const totalsLeft = margin + contentWidth - 220;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Subtotal:', totalsLeft, totalY);
      doc.text('Rs. 499.00', margin + contentWidth - 10, totalY, { align: 'right' });

      doc.text('Tax (Educational Exemption):', totalsLeft, totalY + 16);
      doc.text('Rs. 0.00', margin + contentWidth - 10, totalY + 16, { align: 'right' });

      doc.setFillColor(240, 253, 250);
      doc.setDrawColor(204, 251, 241);
      doc.roundedRect(totalsLeft - 10, totalY + 26, 230, 32, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('Total Paid:', totalsLeft, totalY + 47);
      doc.setTextColor(13, 148, 136);
      doc.text('Rs. 499.00', margin + contentWidth - 10, totalY + 47, { align: 'right' });

      // Notes
      const notesY = totalY + 84;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, notesY, contentWidth, 75, 4, 4, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('TERMS OF SUPPLY & EDUCATIONAL ACCESS', margin + 12, notesY + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('• This receipt certifies electronic enrolment and educational monograph unlock for medical residency study.', margin + 12, notesY + 29);
      doc.text('• Educational supplies under digital delivery. Access is perpetual and bound to verified registered email.', margin + 12, notesY + 41);
      doc.text('• For academic support: knockoutnotes.anaesthesia@gmail.com', margin + 12, notesY + 53);
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'bold');
      doc.text('• NOTICE: Fictional sample receipt for preview purposes only. No actual payment has been collected.', margin + 12, notesY + 66);

      // Footer
      const footerY = pageHeight - 55;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, footerY, margin + contentWidth, footerY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('KnockoutNotes Academic Publishing', margin, footerY + 16);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Verified Learning System // Secure Electronic Delivery', margin, footerY + 28);

      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Computer-generated receipt. No physical signature required.', pageWidth - margin, footerY + 16, { align: 'right' });

      return doc.output('datauristring');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  if (pdfOutput && pdfOutput.result && pdfOutput.result.value) {
    const rawUri = pdfOutput.result.value;
    const base64Data = rawUri.replace(/^data:application\/pdf;filename=[^;]+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(base64Data, 'base64');
    const outputPath = path.join(ARTIFACT_DIR, 'Sample_Receipt_KN-SAMPLE-2026-000123.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    console.log(`Generated official sample PDF to: ${outputPath} (${pdfBuffer.length} bytes)`);
  } else {
    console.error('Failed to generate PDF:', pdfOutput);
  }

  ws.close();
  chrome.kill();
  server.close();
  process.exit(0);
});
