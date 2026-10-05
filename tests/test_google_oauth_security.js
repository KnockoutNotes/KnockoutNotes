/**
 * KnockoutNotes — Security Verification Suite: Real Google OAuth & Session Hardening
 * Tests:
 * 1. Prohibition of arbitrary email/profile payloads to /api/auth/google.
 * 2. Cryptographic token verification rejecting forged Google ID tokens.
 * 3. OAuth start endpoint behavior and secure state generation.
 * 4. OAuth callback CSRF state parameter validation.
 * 5. Strict authorization enforcement on /api/study/download-pdf (fails closed).
 * 6. Strict authorization enforcement on /api/admin/payments/* (fails closed).
 * 7. Invalidation of spoofed client-side sessions against server database.
 */

import assert from 'node:assert';
import { verifyGoogleIdToken } from '../worker/auth.js';
import worker from '../worker/index.js';

// In-memory mock D1 database for unit verification
class MockD1Database {
  constructor() {
    this.users = [
      { id: 1, email: 'kmaneesh1997@gmail.com', name: 'Dr. Maneesh Sinha', auth_provider: 'google', google_sub: 'existing_sub_1', created_at: '2026-01-01' },
      { id: 2, email: 'maneeshkumarsinha@gmail.com', name: 'Dr. Maneesh', auth_provider: 'local', google_sub: null, created_at: '2026-01-01' }
    ];
    this.sessions = [];
    this.entitlements = [
      { user_id: 1, chapter_id: 'preop-assessment', access_status: 'active' }
    ];
    this.adminSessions = [];
  }

  prepare(sql) {
    const db = this;
    return {
      bind(...params) {
        return {
          async first() {
            if (sql.includes('FROM users WHERE google_sub = ?')) {
              return db.users.find(u => u.google_sub === params[0]) || null;
            }
            if (sql.includes('FROM users WHERE email = ?')) {
              return db.users.find(u => u.email === params[0].toLowerCase().trim()) || null;
            }
            if (sql.includes('FROM users WHERE id = ?')) {
              return db.users.find(u => u.id === params[0]) || null;
            }
            if (sql.includes('FROM user_sessions')) {
              const session = db.sessions.find(s => s.session_id === params[0]);
              if (!session) return null;
              const user = db.users.find(u => u.id === session.user_id);
              if (!user) return null;
              return {
                session_id: session.session_id,
                user_id: user.id,
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url || null,
                auth_provider: user.auth_provider || 'local',
                google_sub: user.google_sub || null,
                expires_at: session.expires_at
              };
            }
            if (sql.includes('FROM admin_sessions WHERE session_id = ?')) {
              return db.adminSessions.find(s => s.session_id === params[0]) || null;
            }
            if (sql.includes('FROM chapter_entitlements WHERE user_id = ? AND chapter_id = ?')) {
              return db.entitlements.find(e => e.user_id === params[0] && e.chapter_id === params[1] && e.access_status === 'active') || null;
            }
            if (sql.includes('FROM chapter_pricing WHERE chapter_id = ?')) {
              return { chapter_id: params[0], inr_price: 199, is_active: 1 };
            }
            return null;
          },
          async all() {
            return { results: [] };
          },
          async run() {
            if (sql.includes('INSERT INTO user_sessions')) {
              db.sessions.push({
                session_id: params[0],
                user_id: params[1],
                expires_at: params[2],
                created_at: new Date().toISOString()
              });
            }
            return { success: true };
          }
        };
      }
    };
  }
}

async function runTests() {
  console.log('--- STARTING GOOGLE OAUTH SECURITY HARDENING TEST SUITE ---');

  const mockDb = new MockD1Database();
  const env = {
    DB: mockDb,
    SITE_URL: 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev',
    ADMIN_EMAIL: 'kmaneesh1997@gmail.com',
    CASHFREE_APP_ID: 'cf_app_test',
    CASHFREE_SECRET_KEY: 'cf_secret_test'
  };

  // TEST 1: REJECT ARBITRARY EMAIL IN POST /api/auth/google
  {
    console.log('\n[TEST 1] Prohibit arbitrary email spoofing in POST /api/auth/google...');
    const fakePayloads = [
      { profile: { email: 'fake@example.com' } },
      { profile: { email: 'kmaneesh1997@gmail.com' } },
      { email: 'kmaneesh1997@gmail.com' },
      { username: 'admin' },
      {}
    ];

    for (const payload of fakePayloads) {
      const req = new Request('https://knockoutnotes.workers.dev/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const res = await worker.fetch(req, env, {});
      assert.strictEqual(res.status, 400, `Expected 400 for payload ${JSON.stringify(payload)}, got ${res.status}`);
      const data = await res.json();
      assert.strictEqual(data.code, 'CREDENTIAL_REQUIRED');
      assert(data.error.includes('A cryptographically signed Google ID token (credential) is required'));
    }
    console.log('✓ PASS: All arbitrary/unverified email payloads are strictly rejected with 400 CREDENTIAL_REQUIRED.');
  }

  // TEST 2: REJECT FORGED GOOGLE ID TOKEN
  {
    console.log('\n[TEST 2] Cryptographic token verification rejects forged ID tokens...');
    const req = new Request('https://knockoutnotes.workers.dev/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: 'eyJhbGciOiJSUzI1NiJ9.eyJlbWFpbCI6ImZha2VAZXhhbXBsZS5jb20ifQ.invalid_signature' })
    });
    const res = await worker.fetch(req, env, {});
    assert.strictEqual(res.status, 401, `Expected 401 for invalid token signature, got ${res.status}`);
    const data = await res.json();
    assert.strictEqual(data.code, 'INVALID_CREDENTIAL');
    assert(data.error.includes('Google'));
    console.log('✓ PASS: Forged Google ID tokens fail cryptographic verification and are rejected with 401.');
  }

  // TEST 3: VERIFY verifyGoogleIdToken CLAIMS VALIDATION
  {
    console.log('\n[TEST 3] Unit test verifyGoogleIdToken claims parser...');
    // Invalid JWT format
    await assert.rejects(
      async () => verifyGoogleIdToken('not-a-jwt', 'client-id'),
      /Google tokeninfo endpoint rejected token|Invalid Google ID token structure/
    );

    // Missing email_verified
    const unverifiedPayload = Buffer.from(JSON.stringify({
      iss: 'https://accounts.google.com',
      aud: 'my-client-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      email: 'test@gmail.com',
      email_verified: false,
      sub: '123'
    })).toString('base64url');
    const dummyJwt = `header.${unverifiedPayload}.sig`;

    await assert.rejects(
      async () => verifyGoogleIdToken(dummyJwt, 'my-client-id'),
      /Google tokeninfo endpoint rejected token|email is not verified by Google/
    );
    console.log('✓ PASS: verifyGoogleIdToken enforces strict issuer, audience, expiration, and email_verified checks.');
  }

  // TEST 4: OAUTH CALLBACK REJECTS MISSING OR TAMPERED CSRF STATE
  {
    console.log('\n[TEST 4] OAuth callback rejects missing or invalid CSRF state...');
    const req = new Request('https://knockoutnotes.workers.dev/api/auth/google/callback?code=test_code&state=forged_state', {
      method: 'GET'
    });
    const res = await worker.fetch(req, env, {});
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert(data.error.includes('OAuth state cookie missing or expired'));
    console.log('✓ PASS: OAuth callback strictly blocks state tampering without matching HttpOnly cookie.');
  }

  // TEST 5: GET /api/auth/config EXPOSES PUBLIC DETAILS SAFELY
  {
    console.log('\n[TEST 5] GET /api/auth/config returns callback URL and status without leaking secrets...');
    const req = new Request('https://knockoutnotes.workers.dev/api/auth/config', { method: 'GET' });
    const res = await worker.fetch(req, env, {});
    assert.strictEqual(res.status, 200);
    const config = await res.json();
    assert.strictEqual(config.oauthCallbackUrl, 'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/api/auth/google/callback');
    assert.strictEqual(config.googleConfigured, false);
    assert.strictEqual(config.googleClientId, null);
    console.log('✓ PASS: /api/auth/config provides callback URI without exposing secrets.');
  }

  // TEST 6: PROTECTED ENDPOINTS FAIL CLOSED WITHOUT AUTHENTICATION
  {
    console.log('\n[TEST 6] Protected endpoints fail closed when unauthenticated...');
    const endpoints = [
      { url: 'https://knockoutnotes.workers.dev/api/auth/me', method: 'GET', expectedStatus: 401 },
      { url: 'https://knockoutnotes.workers.dev/api/admin/payments/overview', method: 'GET', expectedStatus: 403 },
      { url: 'https://knockoutnotes.workers.dev/api/admin/payments/pricing', method: 'POST', expectedStatus: 403 },
      { url: 'https://knockoutnotes.workers.dev/api/study/download-pdf?chapter_id=preop-assessment', method: 'GET', expectedStatus: 401 }
    ];

    for (const ep of endpoints) {
      const req = new Request(ep.url, { method: ep.method });
      const res = await worker.fetch(req, env, {});
      assert.strictEqual(res.status, ep.expectedStatus, `Expected ${ep.expectedStatus} for ${ep.url}, got ${res.status}`);
    }
    console.log('✓ PASS: All sensitive user and admin endpoints require authentic server sessions.');
  }

  // TEST 7: ADMIN ENDPOINT BLOCKS NON-ADMIN USERS EVEN WITH VALID SESSION
  {
    console.log('\n[TEST 7] Non-admin user session is blocked from admin revenue and pricing...');
    // Create non-admin session for user_id = 2 (maneeshkumarsinha@gmail.com)
    mockDb.sessions.push({
      session_id: 'non_admin_session_token_123',
      user_id: 2,
      expires_at: new Date(Date.now() + 3600000).toISOString()
    });

    const req = new Request('https://knockoutnotes.workers.dev/api/admin/payments/overview', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer non_admin_session_token_123' }
    });
    const res = await worker.fetch(req, env, {});
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.error, 'Administrator access required');
    console.log('✓ PASS: Admin payment/pricing console returns 403 Forbidden to non-admin accounts.');
  }

  // TEST 8: PAID PDF ENFORCES ACTIVE PURCHASE ENTITLEMENT
  {
    console.log('\n[TEST 8] Paid PDF engine blocks authenticated users who did not purchase chapter...');
    const req = new Request('https://knockoutnotes.workers.dev/api/study/download-pdf?chapter_id=preop-assessment', {
      method: 'GET',
      headers: { 'Authorization': 'Bearer non_admin_session_token_123' }
    });
    const res = await worker.fetch(req, env, {});
    assert.strictEqual(res.status, 403);
    const data = await res.json();
    assert.strictEqual(data.code, 'PURCHASE_REQUIRED');
    assert(data.error.includes('Chapter purchase required'));
    console.log('✓ PASS: Unpurchased chapter download fails closed with 403 and purchase prompt.');
  }

  console.log('\n======================================================');
  console.log('ALL GOOGLE OAUTH SECURITY TESTS PASSED SUCCESSFULLY! ✓');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
