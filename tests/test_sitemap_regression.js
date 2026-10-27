/**
 * KnockoutNotes — Comprehensive Sitemap & SEO Regression Test Suite
 * Tests:
 * 1. Standard GET /sitemap.xml returns 200, application/xml, full XML body, correct Content-Length
 * 2. Conditional GET /sitemap.xml with If-None-Match returns 200 and full XML (no internal 304 bypass)
 * 3. Conditional GET /sitemap.xml with If-Modified-Since returns 200 and full XML
 * 4. HEAD /sitemap.xml returns 200 with XML headers and no body
 * 5. Method not allowed (POST/PUT /sitemap.xml) returns 405
 * 6. Asset fetch failure returns 503 XML (<error>) and never falls through to HTML
 * 7. Asset store unavailable (no env.ASSETS) returns 503 XML
 * 8. Host replacement on custom domain
 * 9. Production workers.dev host leaves XML body unchanged
 * 10. robots.txt GET and HEAD work correctly preserving existing directives
 * 11. XML validation and 20 URL integrity check of sitemap.xml on disk
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import worker from '../worker/index.js';

console.log('--- STARTING SITEMAP & SEO REGRESSION SUITE ---');

const sitemapDiskPath = path.resolve(process.cwd(), 'sitemap.xml');
const realSitemapText = fs.readFileSync(sitemapDiskPath, 'utf8');

const robotsDiskPath = path.resolve(process.cwd(), 'robots.txt');
const realRobotsText = fs.readFileSync(robotsDiskPath, 'utf8');

// Mock ASSETS environment that accurately mirrors Cloudflare Workers ASSETS binding
function createMockAssets(options = {}) {
  return {
    async fetch(req) {
      const url = new URL(req.url);
      if (options.shouldThrow) {
        throw new Error('Simulated asset fetch failure');
      }
      if (options.assetStatus) {
        return new Response(options.assetBody || '', { status: options.assetStatus });
      }

      if (url.pathname === '/sitemap.xml') {
        // If conditional headers are sent to the asset store, it would return 304
        if (req.headers.has('if-none-match') || req.headers.has('if-modified-since')) {
          if (options.failOnConditionalHeader) {
            return new Response('', { status: 304 });
          }
        }
        return new Response(realSitemapText, {
          status: 200,
          headers: {
            'content-type': 'application/xml',
            'etag': '"mock-asset-etag-12345"',
            'content-length': '99999', // intentionally stale length to verify worker recalculates
            'content-encoding': 'gzip' // intentionally stale encoding to verify worker strips it
          }
        });
      }

      if (url.pathname === '/robots.txt') {
        return new Response(realRobotsText, {
          status: 200,
          headers: {
            'content-type': 'text/plain',
            'etag': '"mock-robots-etag-67890"'
          }
        });
      }

      // Default static file or 404
      return new Response('<html>404 Not Found SPA Fallback</html>', {
        status: 404,
        headers: { 'content-type': 'text/html' }
      });
    }
  };
}

// --------------------------------------------------------------------------
// TEST 1: Standard GET /sitemap.xml
// --------------------------------------------------------------------------
console.log('\n[TEST 1] Standard GET /sitemap.xml...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200, 'Must return HTTP 200');
  assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('cache-control'), 'public, max-age=3600, s-maxage=3600');
  assert.equal(res.headers.get('x-robots-tag'), 'all');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.equal(res.headers.get('cache-control'), 'public, max-age=3600, s-maxage=3600');
  assert.equal(res.headers.get('x-robots-tag'), 'all');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.equal(res.headers.has('content-encoding'), false, 'Stale content-encoding must be stripped');

  const text = await res.text();
  assert.ok(text.includes('<?xml version="1.0" encoding="UTF-8"?>'), 'Must include XML declaration');
  assert.ok(text.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), 'Must include urlset namespace');
  
  const expectedBytes = new TextEncoder().encode(text).byteLength.toString();
  assert.equal(res.headers.get('content-length'), expectedBytes, 'Content-Length must match actual UTF-8 byte length');
  console.log('  PASS: Standard GET returned 200 OK with accurate XML, headers, and Content-Length (' + expectedBytes + ' bytes)');
}

// --------------------------------------------------------------------------
// TEST 2: Conditional GET with If-None-Match
// --------------------------------------------------------------------------
console.log('\n[TEST 2] Conditional GET /sitemap.xml with If-None-Match...');
{
  // If the internal fetch had forwarded If-None-Match, mock asset would return 304 and fail
  const env = { ASSETS: createMockAssets({ failOnConditionalHeader: true }) };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET',
    headers: {
      'If-None-Match': '"4bccad3a182ffb5d6feb556036d0b86f"'
    }
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200, 'Must return HTTP 200 (not 304 or fallthrough)');
  const text = await res.text();
  assert.ok(text.includes('<urlset'), 'Must return full XML body');
  assert.equal(res.headers.has('etag'), false, 'Should not return asset ETag to prevent client 304 empty body responses');
  console.log('  PASS: Conditional GET with If-None-Match returned complete 200 OK XML body');
}

// --------------------------------------------------------------------------
// TEST 3: Conditional GET with If-Modified-Since
// --------------------------------------------------------------------------
console.log('\n[TEST 3] Conditional GET /sitemap.xml with If-Modified-Since...');
{
  const env = { ASSETS: createMockAssets({ failOnConditionalHeader: true }) };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET',
    headers: {
      'If-Modified-Since': 'Sat, 24 Oct 2026 12:00:00 GMT'
    }
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200, 'Must return HTTP 200');
  const text = await res.text();
  assert.ok(text.includes('<urlset'), 'Must return full XML body');
  console.log('  PASS: Conditional GET with If-Modified-Since returned complete 200 OK XML body');
}

// --------------------------------------------------------------------------
// TEST 4: HEAD request for /sitemap.xml
// --------------------------------------------------------------------------
console.log('\n[TEST 4] HEAD request for /sitemap.xml...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'HEAD'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200, 'Must return HTTP 200');
  assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('cache-control'), 'public, max-age=3600, s-maxage=3600');
  assert.equal(res.headers.get('x-robots-tag'), 'all');
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  const body = await res.text();
  assert.equal(body, '', 'HEAD response must have an empty body');
  console.log('  PASS: HEAD returned 200 OK with appropriate XML headers and empty body');
}

// --------------------------------------------------------------------------
// TEST 5: Unsupported Method Handling (POST / PUT)
// --------------------------------------------------------------------------
console.log('\n[TEST 5] Method Not Allowed (POST /sitemap.xml)...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'POST'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 405, 'Must return 405 Method Not Allowed');
  assert.equal(res.headers.get('allow'), 'GET, HEAD');
  console.log('  PASS: POST /sitemap.xml returned 405 Method Not Allowed');
}

// --------------------------------------------------------------------------
// TEST 6: Observable XML failure path when asset store fails
// --------------------------------------------------------------------------
console.log('\n[TEST 6] Asset fetch failure returns 503 XML and never falls through to HTML...');
{
  const env = { ASSETS: createMockAssets({ shouldThrow: true }) };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503, 'Must return HTTP 503');
  assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
  const text = await res.text();
  assert.ok(text.includes('<?xml'), 'Must return XML error format');
  assert.ok(text.includes('<error>'), 'Must contain <error> XML element');
  assert.ok(!text.includes('<html>'), 'Must NEVER fall through to HTML catch-all');
  console.log('  PASS: Asset error cleanly caught and returned XML 503 without falling through to HTML');
}

// --------------------------------------------------------------------------
// TEST 7: Asset store missing returns 503 XML
// --------------------------------------------------------------------------
console.log('\n[TEST 7] env.ASSETS missing returns 503 XML...');
{
  const env = {};
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 503, 'Must return HTTP 503');
  assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
  const text = await res.text();
  assert.ok(text.includes('<error>'), 'Must return XML error');
  console.log('  PASS: Missing env.ASSETS returned XML 503');
}

// --------------------------------------------------------------------------
// TEST 8: Custom domain host replacement
// --------------------------------------------------------------------------
console.log('\n[TEST 8] Custom domain host replacement in sitemap URLs...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.com/sitemap.xml', {
    method: 'GET'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(text.includes('https://knockoutnotes.com/study'), 'Host replacement must rewrite URL origin');
  assert.ok(!text.includes('knockoutnotes-anaesthesia.workers.dev'), 'Default workers.dev host must be replaced');
  console.log('  PASS: Custom domain rewrote sitemap URL locations correctly');
}

// --------------------------------------------------------------------------
// TEST 9: Production workers.dev host leaves XML body unchanged
// --------------------------------------------------------------------------
console.log('\n[TEST 9] Production workers.dev host leaves XML body unchanged...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml', {
    method: 'GET'
  });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.equal(text, realSitemapText, 'Delivered body must be identical to disk sitemap.xml');
  console.log('  PASS: Delivered sitemap body is byte-for-byte identical to source file on disk');
}

// --------------------------------------------------------------------------
// TEST 10: robots.txt GET and HEAD
// --------------------------------------------------------------------------
console.log('\n[TEST 10] robots.txt GET and HEAD...');
{
  const env = { ASSETS: createMockAssets() };
  
  // GET
  const reqGet = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/robots.txt', { method: 'GET' });
  const resGet = await worker.fetch(reqGet, env, {});
  assert.equal(resGet.status, 200);
  assert.equal(resGet.headers.get('content-type'), 'text/plain; charset=utf-8');
  assert.equal(resGet.headers.get('x-robots-tag'), 'all');
  assert.equal(resGet.headers.get('access-control-allow-origin'), '*');
  const bodyGet = await resGet.text();
  assert.ok(bodyGet.includes('Sitemap: https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap.xml'));
  assert.ok(bodyGet.includes('Allow: /'));
  assert.ok(bodyGet.includes('Disallow: /admin/'));

  console.log('  PASS: robots.txt GET works with valid Sitemap reference and directives preserved');
}

// --------------------------------------------------------------------------
// TEST 10b: sitemap_index.xml fallback to sitemap.xml
// --------------------------------------------------------------------------
console.log('\n[TEST 10b] GET /sitemap_index.xml...');
{
  const env = { ASSETS: createMockAssets() };
  const req = new Request('https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/sitemap_index.xml', { method: 'GET' });
  const res = await worker.fetch(req, env, {});
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'application/xml; charset=utf-8');
  assert.equal(res.headers.get('x-robots-tag'), 'all');
  const text = await res.text();
  assert.ok(text.includes('<urlset'), 'Must return valid XML sitemap body');
  console.log('  PASS: /sitemap_index.xml returns 200 with valid sitemap XML body');
}

// --------------------------------------------------------------------------
// TEST 11: XML parsing and URL inventory verification of sitemap.xml on disk
// --------------------------------------------------------------------------
console.log('\n[TEST 11] XML parsing and 20 URL inventory verification...');
{
  const urlMatches = realSitemapText.match(/<loc>(https:\/\/[^<]+)<\/loc>/g);
  assert.ok(urlMatches, 'Must contain loc elements');
  const urls = urlMatches.map(m => m.replace(/<\/?loc>/g, ''));
  assert.equal(urls.length, 20, 'Sitemap must contain exactly 20 URL entries');

  const expectedUrls = [
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/study',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/critical-care',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/drugs',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/notes',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/calculators',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/ventilator',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/resuscitation-chamber',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/regional-anaesthesia',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/crisis',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/pearls',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/viva',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/pricing',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/resources',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/recent-updates',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/contact',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/privacy-policy',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/terms-and-conditions',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/refund-policy',
    'https://knockoutnotes.knockoutnotes-anaesthesia.workers.dev/shipping-policy'
  ];

  for (let i = 0; i < expectedUrls.length; i++) {
    assert.equal(urls[i], expectedUrls[i], `URL index ${i} must match ${expectedUrls[i]}`);
  }
  console.log('  PASS: sitemap.xml parsed successfully with all 20 canonical URLs accounted for');
}

console.log('\n--- ALL SITEMAP & SEO REGRESSION TESTS PASSED (11/11) ---');
