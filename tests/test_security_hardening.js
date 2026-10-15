/**
 * KnockoutNotes Security Hardening Regression Test Suite
 * Tests Rate Limiting, Open Redirect Prevention, XSS Sanitization,
 * Security Headers, File Storage Sandboxing, and Webhook Freshness.
 */

import assert from 'node:assert/strict';
import { checkRateLimit, resetRateLimit } from '../worker/rate-limit.js';
import { getSafeReturnUrl, escapeHtml } from '../worker/user-workspace.js';
import {
  renderAdminAlertEmail,
  renderContentNotificationEmail,
  renderBroadcastEmail
} from '../worker/email-templates.js';
import { serveFile } from '../worker/files.js';
import { handleCashfreeWebhook } from '../worker/payments.js';

console.log('--- STARTING COMPLETE SECURITY HARDENING TEST SUITE ---');

// --------------------------------------------------------------------------
// TEST 1: Rate Limiter Sliding Window and Progressive Lockout
// --------------------------------------------------------------------------
console.log('\n[TEST 1] Rate Limiter Sliding Window & Progressive Lockout...');
{
  const testKey = 'test_ip_suite_' + Date.now();
  // Max 3 requests in 10-second window, 5-second block
  const r1 = await checkRateLimit(null, testKey, 3, 10, 5);
  assert.equal(r1.allowed, true, 'Request 1 should be allowed');
  assert.equal(r1.remaining, 2, 'Remaining should be 2');

  const r2 = await checkRateLimit(null, testKey, 3, 10, 5);
  assert.equal(r2.allowed, true, 'Request 2 should be allowed');
  assert.equal(r2.remaining, 1, 'Remaining should be 1');

  const r3 = await checkRateLimit(null, testKey, 3, 10, 5);
  assert.equal(r3.allowed, true, 'Request 3 should be allowed');
  assert.equal(r3.remaining, 0, 'Remaining should be 0');

  // 4th request exceeds max
  const r4 = await checkRateLimit(null, testKey, 3, 10, 5);
  assert.equal(r4.allowed, false, 'Request 4 must be blocked');
  assert.ok(r4.retryAfter > 0, 'Retry-After should be > 0');

    // Reset rate limit
  await resetRateLimit(null, testKey);
  const r5 = await checkRateLimit(null, testKey, 3, 10, 5);
  assert.equal(r5.allowed, true, 'Request after reset should be allowed');

  // Test D1-backed atomic path
  const storage = new Map();
  const mockD1 = {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() { return { success: true }; },
            async first() {
              if (sql.includes('INSERT INTO rate_limits')) {
                const [key, now, windowMs, maxRequests, blockMs] = args;
                const existing = storage.get(key);
                if (!existing) {
                  const entry = { count: 1, first_request_at: now, blocked_until: 0 };
                  storage.set(key, entry);
                  return entry;
                }
                if (existing.blocked_until > now) {
                  return existing;
                }
                if ((now - existing.first_request_at) > windowMs) {
                  existing.count = 1;
                  existing.first_request_at = now;
                  existing.blocked_until = 0;
                  return existing;
                }
                existing.count += 1;
                if (existing.count > maxRequests) {
                  existing.blocked_until = now + blockMs;
                }
                return existing;
              }
              return null;
            }
          };
        }
      };
    }
  };

  const d1Res1 = await checkRateLimit(mockD1, 'd1_test_key', 2, 60, 300);
  assert.equal(d1Res1.allowed, true, 'D1 request 1 should be allowed');
  assert.equal(d1Res1.remaining, 1, 'D1 remaining should be 1');

  const d1Res2 = await checkRateLimit(mockD1, 'd1_test_key', 2, 60, 300);
  assert.equal(d1Res2.allowed, true, 'D1 request 2 should be allowed');
  assert.equal(d1Res2.remaining, 0, 'D1 remaining should be 0');

  const d1Res3 = await checkRateLimit(mockD1, 'd1_test_key', 2, 60, 300);
  assert.equal(d1Res3.allowed, false, 'D1 request 3 must be blocked');

  console.log('✓ PASS: Rate limiter correctly tracks quota and enforces lockout (in-memory & atomic D1).');
}

// --------------------------------------------------------------------------
// TEST 2: Open Redirect Prevention in OAuth Flow
// --------------------------------------------------------------------------
console.log('\n[TEST 2] Open Redirect Neutralization in OAuth Flow...');
{
  const siteUrl = 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev';

  // Dangerous vectors
  assert.equal(getSafeReturnUrl('//evil.com', siteUrl), '/workspace.html', 'Protocol-relative URL must be neutralized');
  assert.equal(getSafeReturnUrl('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev.attacker.com', siteUrl), '/workspace.html', 'Subdomain hijacking must be neutralized');
  assert.equal(getSafeReturnUrl('javascript:alert(1)', siteUrl), '/workspace.html', 'javascript: scheme must be neutralized');
  assert.equal(getSafeReturnUrl('data:text/html,bad', siteUrl), '/workspace.html', 'data: scheme must be neutralized');
  assert.equal(getSafeReturnUrl('/\\evil.com', siteUrl), '/workspace.html', 'Backslash path traversal must be neutralized');

  // Legitimate safe vectors
  assert.equal(getSafeReturnUrl('/workspace.html#notes', siteUrl), '/workspace.html#notes', 'Safe relative path must be preserved');
  assert.equal(getSafeReturnUrl('/study.html?ch=ch01', siteUrl), '/study.html?ch=ch01', 'Safe query path must be preserved');
  assert.equal(getSafeReturnUrl(`${siteUrl}/notes.html`, siteUrl), '/notes.html', 'Authorized origin URL must resolve to safe relative path');
  console.log('✓ PASS: All open redirect attack vectors are strictly neutralized.');
}

// --------------------------------------------------------------------------
// TEST 3: Reflected XSS Neutralization in OAuth Fallback Page
// --------------------------------------------------------------------------
console.log('\n[TEST 3] Reflected XSS Neutralization...');
{
  const xssPayload = '"><script>alert("XSS")</script><a href="';
  const siteUrl = 'https://knockoutnotes.com';
  const safeReturn = getSafeReturnUrl(xssPayload, siteUrl);
  assert.equal(safeReturn, '/workspace.html', 'Dangerous XSS string rejected by safe URL filter');

  const escaped = escapeHtml(xssPayload);
  assert.ok(!escaped.includes('<script>'), 'HTML tags must be escaped');
  assert.ok(escaped.includes('&lt;script&gt;'), 'Characters must be HTML entities');
  console.log('✓ PASS: Reflected XSS vectors in return_url are eliminated.');
}

// --------------------------------------------------------------------------
// TEST 4: Email Template Sanitization (HTML & Email Injection)
// --------------------------------------------------------------------------
console.log('\n[TEST 4] Email Template Sanitization Against HTML Injection...');
{
  const maliciousEmail = 'victim+<img src=x onerror=alert(1)>@example.com';
  const maliciousSource = 'website"><script>alert("pwned")</script>';

  const alertEmail = renderAdminAlertEmail({
    type: 'new_subscriber',
    email: maliciousEmail,
    details: { source: maliciousSource, totalActive: 10 }
  });

  assert.ok(!alertEmail.html.includes('<img src=x'), 'Malicious img tag must not be raw in HTML email');
  assert.ok(!alertEmail.html.includes('<script>'), 'Script tag must not be raw in HTML email');
  assert.ok(alertEmail.html.includes('&lt;img src=x'), 'Img tag must be HTML-escaped');
  assert.ok(alertEmail.html.includes('&lt;script&gt;'), 'Script tag must be HTML-escaped');

  const bcast = renderBroadcastEmail({
    siteUrl: 'https://knockoutnotes.com',
    subject: '<b style="color:red">Urgent</b>',
    message: '<marquee>Attack</marquee>',
    actionUrl: 'https://knockoutnotes.com',
    actionText: 'Click',
    unsubscribeToken: 'tok123'
  });
  assert.ok(!bcast.html.includes('<marquee>'), 'Broadcast message must not render raw HTML tags');
  assert.ok(bcast.html.includes('&lt;marquee&gt;'), 'Broadcast message HTML tags must be escaped');
  console.log('✓ PASS: Email templates are fully protected against HTML/email injection.');
}

// --------------------------------------------------------------------------
// TEST 5: File Storage Serving Security (Sandbox CSP & Nosniff)
// --------------------------------------------------------------------------
console.log('\n[TEST 5] File Storage Security Headers & Sandboxing...');
{
  const mockBucket = {
    async get(key) {
      return {
        body: '<?xml version="1.0"?><svg><script>alert(1)</script></svg>',
        httpEtag: '"mock-etag-123"',
        writeHttpMetadata(headers) {
          headers.set('Content-Type', 'image/svg+xml');
        }
      };
    }
  };

  const response = await serveFile('test/malicious.svg', { R2_STORAGE: mockBucket }, new Request('http://localhost/api/files/test/malicious.svg'));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff', 'Must include nosniff');
  assert.equal(response.headers.get('Content-Security-Policy'), "default-src 'none'; sandbox", 'Must include sandbox CSP');
  console.log('✓ PASS: File storage serving enforces nosniff and sandbox CSP.');
}

// --------------------------------------------------------------------------
// TEST 6: Cashfree Webhook Replay Protection
// --------------------------------------------------------------------------
console.log('\n[TEST 6] Cashfree Webhook Replay Protection...');
{
  const oldTimestamp = Date.now() - 30 * 60 * 1000; // 30 minutes ago (expired)
  const req = new Request('http://localhost/api/payments/cashfree/webhook', {
    method: 'POST',
    headers: {
      'x-webhook-signature': 'mock-sig',
      'x-webhook-timestamp': String(oldTimestamp),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ type: 'PAYMENT_SUCCESS_WEBHOOK' })
  });

  const res = await handleCashfreeWebhook(req, {
    CASHFREE_WEBHOOK_SECRET: 'test_sec_123'
  });

  assert.equal(res.status, 401, 'Expired webhook must be rejected with 401');
  const body = await res.json();
  assert.ok(body.error.includes('tolerance') || body.error.includes('expired'), 'Error must indicate timestamp expiration');
  console.log('✓ PASS: Replay attacks with stale timestamps are rejected.');
}

// --------------------------------------------------------------------------
// TEST 7: Robots.txt & .gitignore Protection
// --------------------------------------------------------------------------
console.log('\n[TEST 7] Repository & Search Indexing Guards...');
{
  import('node:fs').then(fs => {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    assert.ok(gitignore.includes('.dev.vars'), '.gitignore must exclude .dev.vars');
    assert.ok(gitignore.includes('.env'), '.gitignore must exclude .env');
    assert.ok(gitignore.includes('*.pem'), '.gitignore must exclude certificates/keys');

    const robots = fs.readFileSync('robots.txt', 'utf8');
    assert.ok(robots.includes('Disallow: /admin/'), 'robots.txt must disallow /admin/');
    assert.ok(robots.includes('Disallow: /api/'), 'robots.txt must disallow /api/');
    console.log('✓ PASS: Repository ignores secrets and robots.txt protects admin/API routes.');

    console.log('\n======================================================');
    console.log('ALL SECURITY HARDENING TESTS COMPLETED SUCCESSFULLY! ✓');
    console.log('======================================================\n');
  });
}
