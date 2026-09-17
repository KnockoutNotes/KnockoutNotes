/**
 * KnockoutNotes Worker Authentication & Cryptographic Utilities
 * Uses standard Web Crypto API (supported natively in Cloudflare Workers).
 */

/**
 * Convert Uint8Array to hex string
 */
export function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 */
export function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Generate a cryptographically secure random hex string
 */
export function generateSecureToken(byteLength = 32) {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return toHex(array);
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Derive PBKDF2-HMAC-SHA256 hash using Web Crypto
 */
export async function pbkdf2Sha256(password, saltBytes, iterations = 100000, keyLengthBytes = 32) {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: iterations,
      hash: 'SHA-256'
    },
    passwordKey,
    keyLengthBytes * 8
  );

  return toHex(derivedBits);
}

/**
 * Verify a plaintext password against stored hash format:
 * "pbkdf2:100000:<saltHex>:<hashHex>"
 * Also supports direct match if stored as raw secret string for convenience
 */
export async function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;

  // Check if storedHash uses PBKDF2 format
  if (storedHash.startsWith('pbkdf2:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 4) return false;
    const [, iterStr, saltHex, expectedHash] = parts;
    const iterations = parseInt(iterStr, 10);
    const saltBytes = fromHex(saltHex);
    const computedHash = await pbkdf2Sha256(password, saltBytes, iterations);
    return timingSafeEqual(computedHash, expectedHash);
  }

  // Fallback: If the secret was configured as plaintext string
  return timingSafeEqual(password, storedHash);
}

/**
 * Parse cookies from request
 */
export function parseCookies(request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = {};
  cookieHeader.split(';').forEach(pair => {
    const [name, ...rest] = pair.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(rest.join('='));
    }
  });
  return cookies;
}

/**
 * Generate a Set-Cookie header string for admin session
 */
export function createSessionCookie(sessionId, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return `admin_session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

/**
 * Generate a clear cookie header string for logout
 */
export function clearSessionCookie() {
  return `admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Validate an active admin session against D1
 */
export async function validateAdminSession(db, sessionId) {
  if (!sessionId || typeof sessionId !== 'string') return null;

  const now = new Date().toISOString();
  const session = await db
    .prepare('SELECT * FROM admin_sessions WHERE session_id = ? AND expires_at > ?')
    .bind(sessionId, now)
    .first();

  return session || null;
}
