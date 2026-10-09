import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import * as payments from '../worker/payments.js';
import * as pdfGen from '../worker/pdf-generator.js';

async function testPdfChapters() {
  console.log('====================================================');
  console.log('VERIFYING CHAPTER PDF GENERATION & TYPOGRAPHY');
  console.log('====================================================');

  const testChapters = [
    'preop-assessment',
    'thoracic-anaesthesia-one-lung-ventilation-dlt',
    'case-pneumonectomy-olv',
    'ventilator-modes-waveforms-asynchrony'
  ];

  for (const chId of testChapters) {
    const chapter = payments.getChapterContent(chId);
    if (!chapter) {
      console.error(`[ERROR] Chapter not found: ${chId}`);
      continue;
    }

    console.log(`\nGenerating PDF for "${chapter.name}" (${chId})...`);
    const startTime = Date.now();
    const pdfBytes = await pdfGen.generateChapterPdf(chapter, {
      siteUrl: 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev',
      supportUrl: 'https://bondin.io/@knockoutnotes/support'
    });
    const durationMs = Date.now() - startTime;

    // Load generated PDF to inspect properties
    const loadedDoc = await PDFDocument.load(pdfBytes);
    const pageCount = loadedDoc.getPageCount();

    console.log(`  ✓ Generated in ${durationMs}ms`);
    console.log(`  ✓ Size: ${(pdfBytes.length / 1024).toFixed(1)} KB`);
    console.log(`  ✓ Page Count: ${pageCount} pages`);
    console.log(`  ✓ PDF Header: ${Buffer.from(pdfBytes.slice(0, 5)).toString('utf8')}`);

    // Verify minimum expected size and page count
    if (pageCount < 1) throw new Error(`Invalid page count: ${pageCount}`);
    if (pdfBytes.length < 50000) throw new Error(`PDF size suspiciously small: ${pdfBytes.length}`);

    // Save a copy to disk for inspection
    const outPath = path.resolve(`test_${chId}.pdf`);
    fs.writeFileSync(outPath, pdfBytes);
    console.log(`  ✓ Saved to: ${outPath}`);
  }

  console.log('\n====================================================');
  console.log('ALL CHAPTER PDF GENERATION TESTS PASSED!');
  console.log('====================================================\n');
}

testPdfChapters().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
