/**
 * KnockoutNotes Distributed Rate Limiter & Progressive Lockout Engine
 * Backed by Cloudflare D1 with automatic in-memory fallback.
 */

// In-memory fallback map for environments without D1 binding or transient failures
const memCache = new Map();

/**
 * Ensure rate_limits table exists in D1 (idempotent, safe fallback)
 */
let tableChecked = false;
export async function ensureRateLimitTable(db) {
  if (tableChecked || !db) return;
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        first_request_at INTEGER NOT NULL,
        last_request_at INTEGER NOT NULL,
        blocked_until INTEGER NOT NULL DEFAULT 0
      )
    `).run();
    tableChecked = true;
  } catch (_) {
    // If permission or migration already handled, proceed gracefully
    tableChecked = true;
  }
}

/**
 * Check rate limit for a given key
 * @param {object} db - Cloudflare D1 database binding
 * @param {string} key - Unique rate-limiting key (e.g. "sub:1.2.3.4")
 * @param {number} maxRequests - Max requests allowed within window
 * @param {number} windowSeconds - Duration of window in seconds
 * @param {number} blockSeconds - Duration of block in seconds if exceeded
 * @returns {Promise<{ allowed: boolean, remaining: number, retryAfter: number }>}
 */
export async function checkRateLimit(db, key, maxRequests = 10, windowSeconds = 60, blockSeconds = 300) {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const blockMs = blockSeconds * 1000;

  if (db) {
    try {
      await ensureRateLimitTable(db);

      // Atomic UPSERT to eliminate concurrency race conditions (CWE-362)
      const query = `
        INSERT INTO rate_limits (key, count, first_request_at, last_request_at, blocked_until)
        VALUES (?1, 1, ?2, ?2, 0)
        ON CONFLICT(key) DO UPDATE SET
          count = CASE
            WHEN rate_limits.blocked_until > ?2 THEN rate_limits.count
            WHEN (?2 - rate_limits.first_request_at) > ?3 THEN 1
            ELSE rate_limits.count + 1
          END,
          first_request_at = CASE
            WHEN rate_limits.blocked_until > ?2 THEN rate_limits.first_request_at
            WHEN (?2 - rate_limits.first_request_at) > ?3 THEN ?2
            ELSE rate_limits.first_request_at
          END,
          last_request_at = ?2,
          blocked_until = CASE
            WHEN rate_limits.blocked_until > ?2 THEN rate_limits.blocked_until
            WHEN (?2 - rate_limits.first_request_at) <= ?3 AND (rate_limits.count + 1) > ?4 THEN (?2 + ?5)
            ELSE 0
          END
        RETURNING count, first_request_at, blocked_until;
      `;

      const row = await db
        .prepare(query)
        .bind(key, now, windowMs, maxRequests, blockMs)
        .first();

      if (row) {
        // 1. Is key currently blocked?
        if (row.blocked_until && row.blocked_until > now) {
          const retryAfter = Math.max(1, Math.ceil((row.blocked_until - now) / 1000));
          return { allowed: false, remaining: 0, retryAfter };
        }

        // 2. Did this request cause the key to be blocked?
        if (row.count > maxRequests) {
          return { allowed: false, remaining: 0, retryAfter: blockSeconds };
        }

        // 3. Allowed
        return { allowed: true, remaining: Math.max(0, maxRequests - row.count), retryAfter: 0 };
      }
    } catch (dbErr) {
      console.warn('[Rate Limit DB Fallback]:', dbErr?.message);
    }
  }

  // In-memory fallback
  const cached = memCache.get(key);
  if (cached) {
    if (cached.blockedUntil && cached.blockedUntil > now) {
      const retryAfter = Math.max(1, Math.ceil((cached.blockedUntil - now) / 1000));
      return { allowed: false, remaining: 0, retryAfter };
    }
    if (now - cached.firstRequestAt > windowMs) {
      memCache.set(key, { count: 1, firstRequestAt: now, blockedUntil: 0 });
      return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
    }
    cached.count += 1;
    if (cached.count > maxRequests) {
      cached.blockedUntil = now + blockMs;
      return { allowed: false, remaining: 0, retryAfter: blockSeconds };
    }
    return { allowed: true, remaining: Math.max(0, maxRequests - cached.count), retryAfter: 0 };
  }

  memCache.set(key, { count: 1, firstRequestAt: now, blockedUntil: 0 });
  return { allowed: true, remaining: maxRequests - 1, retryAfter: 0 };
}

/**
 * Reset rate limit / clear lock for a key (e.g. after successful authentication)
 */
export async function resetRateLimit(db, key) {
  memCache.delete(key);
  if (db) {
    try {
      await db.prepare('DELETE FROM rate_limits WHERE key = ?').bind(key).run();
    } catch (_) {}
  }
}

/**
 * Extract trustworthy client IP from Cloudflare request headers
 */
export function getClientIp(request) {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  ).trim();
}
