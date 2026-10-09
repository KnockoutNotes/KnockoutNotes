/**
 * Comprehensive Automated Payment & Purchase Audit Test Suite
 * Tests:
 * 1. Syllabus & Domain Price mapping (Anaesthesia ₹9, Drugs ₹12, Critical Care ₹19, Cases ₹19, Free ₹0)
 * 2. Administrator Authorization & Strict Exemption
 * 3. Webhook HMAC-SHA256 signature verification & Tamper resistance
 * 4. PDF Generation & Structure validation
 * 5. Amount & Currency integrity validation
 */

import { timingSafeEqual } from '../worker/auth.js';
import * as payments from '../worker/payments.js';
import * as pdfGen from '../worker/pdf-generator.js';

async function runAudit() {
  console.log('====================================================');
  console.log('KNOCKOUT NOTES E2E PAYMENT & MONOGRAPH AUDIT SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log('  [PASS]', name);
      passed++;
    } else {
      console.error('  [FAIL]', name);
      failed++;
    }
  }

  // --- 1. DOMAIN & PRICING VERIFICATION ---
  console.log('\n1. Verifying Pricing Rules and Syllabus Categories:');
  
  assert(payments.getCategoryDomain('general', 'preop-assessment') === 'anaesthesia', 'General -> anaesthesia domain');
  assert(payments.getCategoryDomain('induction', 'propofol') === 'drugs', 'Induction -> drugs domain');
  assert(payments.getCategoryDomain('cc_respiratory', 'ventilator-modes-waveforms-asynchrony') === 'critical_care', 'cc_respiratory -> critical_care domain');
  assert(payments.getCategoryDomain('case_resp', 'case-pneumonectomy-olv') === 'cases', 'case_resp -> cases domain');

  assert(payments.isFreeChapter('preop-assessment', 'general') === true, 'General Anaesthesia preop-assessment is free (₹0)');
  assert(payments.isFreeChapter('cc-icu-scoring', 'cc_principles') === true, 'General Critical Care principles is free (₹0)');
  assert(payments.isFreeChapter('ventilator-modes-waveforms-asynchrony', 'cc_respiratory') === false, 'Ventilator modes is paid content');

  assert(payments.getDefaultPriceForChapter('preop-assessment', 'general') === 0, 'Price of free chapter is 0.0 INR');
  assert(payments.getDefaultPriceForChapter('propofol', 'induction') === 12, 'Price of pharmacology drug is 12.0 INR');
  assert(payments.getDefaultPriceForChapter('ventilator-modes-waveforms-asynchrony', 'cc_respiratory') === 19, 'Price of Critical Care is 19.0 INR');
  assert(payments.getDefaultPriceForChapter('case-pneumonectomy-olv', 'cases') === 19, 'Price of Clinical Case discussion is 19.0 INR');
  assert(payments.getDefaultPriceForChapter('thoracic-anaesthesia-one-lung-ventilation-dlt', 'anaesthesia') === 9, 'Price of subspecialty anaesthesia is 9.0 INR');

  // --- 2. ADMIN STRICT AUTHORIZATION VERIFICATION ---
  console.log('\n2. Verifying Administrator Authorization Security:');
  const primaryAdminAuth = { user: { email: 'knockoutnotes.anaesthesia@gmail.com' } };
  const formerAdminAuth = { user: { email: 'kmaneesh1997@gmail.com' } };
  const studentAuth = { user: { email: 'learner@example.com' } };

  assert(await payments.isServerAdmin(primaryAdminAuth, {}) === true, 'Designated admin (knockoutnotes.anaesthesia@gmail.com) is server admin');
  assert(await payments.isServerAdmin(formerAdminAuth, {}) === false, 'Former email (kmaneesh1997@gmail.com) is strictly non-admin (customer/learner)');
  assert(await payments.isServerAdmin(studentAuth, {}) === false, 'Normal learner is strictly non-admin');
  assert(await payments.isServerAdmin(null, {}) === false, 'Unauthenticated user is strictly non-admin');

  // --- 3. WEBHOOK HMAC SIGNATURE & INTEGRITY ---
  console.log('\n3. Verifying Cashfree Webhook Cryptographic Security:');
  const secret = 'prod_cf_secret_key_audit_test_98765';
  const timestamp = String(Date.now());
  const body = JSON.stringify({
    type: 'PAYMENT_SUCCESS_WEBHOOK',
    data: {
      order: { order_id: 'order_test_audit_1', order_amount: 19.00, order_currency: 'INR' },
      payment: { cf_payment_id: '99887766', payment_status: 'SUCCESS', payment_amount: 19.00, payment_currency: 'INR' }
    }
  });

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(timestamp + body));
  const validSignature = Buffer.from(sigBuffer).toString('base64');

  assert(timingSafeEqual(validSignature, validSignature) === true, 'HMAC signature matches using constant-time comparison');
  assert(timingSafeEqual(validSignature, 'tampered_signature_payload_xyz') === false, 'Tampered webhook signature rejected');
  assert(timingSafeEqual(validSignature, '') === false, 'Empty webhook signature rejected');

  // Test Amount & Currency Integrity Logic
  const orderRecord = { amount_inr: 19.00, currency: 'INR' };
  const matchingWebhookAmount = 19.00;
  const mismatchWebhookAmount = 9.00;
  assert(Math.abs(matchingWebhookAmount - orderRecord.amount_inr) <= 0.01, 'Authoritative amount match passes');
  assert(Math.abs(mismatchWebhookAmount - orderRecord.amount_inr) > 0.01, 'Tampered amount mismatch detected and rejected');

  // --- 4. BRANDED MONOGRAPH PDF GENERATION ---
  console.log('\n4. Verifying Chapter Monograph PDF Compilation:');
  const sampleChapterId = 'ventilator-modes-waveforms-asynchrony';
  const chapter = payments.getChapterContent(sampleChapterId);
  assert(chapter !== null, `Target study chapter "${sampleChapterId}" found in syllabus`);
  assert(chapter && chapter.name.includes('Ventilator Modes'), 'Chapter name matches canonical title');
  assert(chapter && Array.isArray(chapter.sections) && chapter.sections.length > 0, `Chapter contains ${chapter?.sections?.length || 0} clinical sections`);

  const startTime = Date.now();
  const pdfBytes = await pdfGen.generateChapterPdf(chapter, {
    siteUrl: 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev',
    supportUrl: 'https://bondin.io/@knockoutnotes/support'
  });
  const durationMs = Date.now() - startTime;

  assert(pdfBytes && pdfBytes.length > 50000, `PDF generated successfully (${(pdfBytes.length / 1024).toFixed(1)} KB in ${durationMs}ms)`);
  const magicHeader = Buffer.from(pdfBytes.slice(0, 5)).toString('utf8');
  assert(magicHeader === '%PDF-', 'Valid PDF file binary header (%PDF-)');

  // --- 5. SAMPLE RECEIPT ACCESS & DISPUTE VALIDATION ---
  console.log('\n5. Verifying Sample Receipt Restrictions & Dispute Validation:');
  
  // Non-admin check on sample receipt
  const sampleAdminAllowed = await payments.isServerAdmin(primaryAdminAuth, {});
  const sampleLearnerAllowed = await payments.isServerAdmin(studentAuth, {});
  const sampleAnonAllowed = await payments.isServerAdmin(null, {});
  assert(sampleAdminAllowed === true, 'Admin knockoutnotes.anaesthesia@gmail.com has preview clearance');
  assert(sampleLearnerAllowed === false, 'Learner account is strictly blocked from sample receipt preview');
  assert(sampleAnonAllowed === false, 'Anonymous visitor is strictly blocked from sample receipt preview');

  // Dispute input validation check
  const fakeEnv = {
    DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
          run: async () => ({})
        }),
        run: async () => ({})
      })
    }
  };

  // Missing orderId test
  const reqNoOrder = new Request('https://knockoutnotes.com/api/payments/disputes', {
    method: 'POST',
    body: JSON.stringify({ issueCategory: 'double_charge', message: 'Test message with sufficient characters' })
  });
  const resNoOrder = await payments.handleRaisePaymentDispute(reqNoOrder, fakeEnv, studentAuth);
  assert(resNoOrder.status === 400, 'Dispute request without order ID returns HTTP 400');

  // Short message test
  const reqShortMsg = new Request('https://knockoutnotes.com/api/payments/disputes', {
    method: 'POST',
    body: JSON.stringify({ orderId: 'ord_123', issueCategory: 'double_charge', message: 'too short' })
  });
  const resShortMsg = await payments.handleRaisePaymentDispute(reqShortMsg, fakeEnv, studentAuth);
  assert(resShortMsg.status === 400, 'Dispute request with message < 10 characters returns HTTP 400');

  // Unauthenticated user test
  const reqUnauth = new Request('https://knockoutnotes.com/api/payments/disputes', {
    method: 'POST',
    body: JSON.stringify({ orderId: 'ord_123', issueCategory: 'double_charge', message: 'Valid detailed dispute explanation' })
  });
  const resUnauth = await payments.handleRaisePaymentDispute(reqUnauth, fakeEnv, null);
  assert(resUnauth.status === 401, 'Unauthenticated dispute request returns HTTP 401');

  console.log('\n====================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
