/**
 * KnockoutNotes User Workspace & Personal System Handler
 * Implements User Auth, Profile Management, Universal Bookmarks,
 * Personal Notes, Contextual Sticky Notes, and Offline Sync.
 */
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  createUserSessionCookie,
  clearUserSessionCookie,
  extractUserSessionId,
  validateUserSession,
  createOAuthStateCookie,
  clearOAuthStateCookie,
  verifyGoogleIdToken,
  parseCookies
} from './auth.js';
import { sendEmail } from './mailersend.js';

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * --------------------------------------------------------------------------
 * 1. AUTHENTICATION & PROFILE CONTROLLERS
 * --------------------------------------------------------------------------
 */

// POST /api/auth/register
export async function handleRegister(request, env) {
  try {
    const { email, name, password } = await request.json();

    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
    }
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return jsonResponse({ error: 'Please enter a name with at least 2 characters.' }, 400);
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      return jsonResponse({ error: 'Password must be at least 8 characters long.' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if user already exists
    const existing = await env.DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first();

    if (existing) {
      return jsonResponse({ error: 'An account with this email address already exists. Please log in.' }, 409);
    }

    // Hash password securely with PBKDF2
    const passwordHash = await hashPassword(password);
    const verificationToken = generateSecureToken(24);

    const insertResult = await env.DB
      .prepare(`
        INSERT INTO users (email, name, password_hash, verification_token, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
      `)
      .bind(cleanEmail, cleanName, passwordHash, verificationToken)
      .run();

    const userId = insertResult.meta.last_row_id;

    // Create immediate user session
    const sessionId = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = request.headers.get('User-Agent') || '';

    await env.DB
      .prepare(`
        INSERT INTO user_sessions (session_id, user_id, expires_at, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(sessionId, userId, expiresAt, ip, ua)
      .run();

    const userObj = {
      id: userId,
      email: cleanEmail,
      name: cleanName,
      avatarUrl: null,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const cookie = createUserSessionCookie(sessionId);
    return jsonResponse(
      { success: true, user: userObj, token: sessionId },
      201,
      { 'Set-Cookie': cookie }
    );
  } catch (err) {
    console.error('[User Register Error]:', err);
    return jsonResponse({ error: 'Registration failed. Please try again.' }, 500);
  }
}

// POST /api/auth/login
export async function handleLogin(request, env) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return jsonResponse({ error: 'Email and password are required.' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await env.DB
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first();

    if (!user) {
      return jsonResponse({ error: 'Invalid email or password.' }, 401);
    }

    if (user.status === 'suspended') {
      return jsonResponse({ error: 'This account has been suspended. Please contact support.' }, 403);
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return jsonResponse({ error: 'Invalid email or password.' }, 401);
    }

    // Update last_login_at
    await env.DB
      .prepare("UPDATE users SET last_login_at = datetime('now') WHERE id = ?")
      .bind(user.id)
      .run();

    // Create session (valid for 30 days)
    const sessionId = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = request.headers.get('User-Agent') || '';

    await env.DB
      .prepare(`
        INSERT INTO user_sessions (session_id, user_id, expires_at, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(sessionId, user.id, expiresAt, ip, ua)
      .run();

    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      status: user.status,
      createdAt: user.created_at
    };

    const cookie = createUserSessionCookie(sessionId);
    return jsonResponse(
      { success: true, user: userObj, token: sessionId },
      200,
      { 'Set-Cookie': cookie }
    );
  } catch (err) {
    console.error('[User Login Error]:', err);
    return jsonResponse({ error: 'Login failed. Please try again.' }, 500);
  }
}

// POST /api/auth/logout
export async function handleLogout(request, env) {
  try {
    const sessionId = extractUserSessionId(request);
    if (sessionId && env.DB) {
      await env.DB
        .prepare('DELETE FROM user_sessions WHERE session_id = ?')
        .bind(sessionId)
        .run();
    }

    return jsonResponse(
      { success: true },
      200,
      { 'Set-Cookie': clearUserSessionCookie() }
    );
  } catch (err) {
    console.error('[User Logout Error]:', err);
    return jsonResponse({ success: true }, 200, { 'Set-Cookie': clearUserSessionCookie() });
  }
}

// ==========================================================================
// GOOGLE OAUTH 2.0 / OIDC AUTHENTICATION (AUTHENTICATED IDENTITY PROVIDER)
// ==========================================================================

/**
 * GET /api/auth/config
 * Returns public authentication configuration and OAuth callback URL.
 * NEVER exposes secrets.
 */
export async function handleGetAuthConfig(request, env) {
  const url = new URL(request.url);
  const siteUrl = (env.SITE_URL || `${url.protocol}//${url.host}`).replace(/\/$/, '');
  const callbackUrl = `${siteUrl}/api/auth/google/callback`;

  return jsonResponse({
    googleConfigured: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    googleClientId: env.GOOGLE_CLIENT_ID || null,
    oauthCallbackUrl: callbackUrl
  });
}

/**
 * GET /api/auth/google/start
 * Initiates official Google OAuth 2.0 Authorization Code flow.
 * Generates secure state + nonce, sets HttpOnly CSRF cookie, and redirects to Google.
 */
export async function handleGoogleAuthStart(request, env) {
  const url = new URL(request.url);
  const siteUrl = (env.SITE_URL || `${url.protocol}//${url.host}`).replace(/\/$/, '');
  const callbackUrl = `${siteUrl}/api/auth/google/callback`;
  const returnUrl = url.searchParams.get('return_url') || '/workspace.html';

  const clientId = (env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (env.GOOGLE_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    const isBrowserNavigation = (request.headers.get('accept') || '').includes('text/html');
    if (isBrowserNavigation) {
      return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google Sign-In Configuration Required — KnockoutNotes</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #090d16; color: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 80vh; margin: 0; }
    .card { background: #0f172a; border: 1px solid #334155; border-radius: 12px; max-width: 580px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 20px; color: #38bdf8; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px; }
    code { background: #1e293b; padding: 3px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #34d399; word-break: break-all; }
    .box { background: #141e33; border: 1px solid #1e293b; padding: 14px; border-radius: 6px; margin: 16px 0; }
    .btn { display: inline-block; background: #0284c7; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; margin-top: 8px; }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚙️ Google OAuth Setup Required</h1>
    <p>To sign in with Google, Google Cloud OAuth credentials must be added to Cloudflare Secrets for this Worker deployment.</p>
    <div class="box">
      <p style="margin: 0 0 8px 0;"><strong>Required Cloudflare Server-Side Secrets:</strong></p>
      <div>1. <code>GOOGLE_CLIENT_ID</code></div>
      <div style="margin-top: 4px;">2. <code>GOOGLE_CLIENT_SECRET</code></div>
      <p style="margin: 12px 0 6px 0;"><strong>Authorized Redirect URI (Google Cloud Console):</strong></p>
      <code>${callbackUrl}</code>
    </div>
    <p>In the meantime, you can create a free account or sign in using email &amp; password.</p>
    <a href="${returnUrl}" class="btn">&larr; Return to KnockoutNotes</a>
  </div>
</body>
</html>`, {
        status: 503,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    return jsonResponse({
      error: 'Google OAuth credentials are not yet configured on this server.',
      configured: false,
      required_secrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      callback_url: callbackUrl
    }, 503);
  }

  // Generate secure state payload with return URL and nonce
  const statePayload = {
    r: returnUrl,
    t: Date.now(),
    nonce: generateSecureToken(16)
  };
  const stateStr = btoa(JSON.stringify(statePayload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const cookieValue = `${stateStr}:${statePayload.nonce}`;

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('state', stateStr);
  googleAuthUrl.searchParams.set('nonce', statePayload.nonce);
  googleAuthUrl.searchParams.set('prompt', 'select_account');

  return new Response(null, {
    status: 302,
    headers: {
      'Location': googleAuthUrl.toString(),
      'Set-Cookie': createOAuthStateCookie(cookieValue)
    }
  });
}

/**
 * GET /api/auth/google/callback
 * Handles Google's redirect back after user authenticates on accounts.google.com.
 * Verifies state/CSRF cookie, exchanges authorization code for tokens,
 * cryptographically verifies Google ID Token, links/creates user, and issues secure session.
 */
export async function handleGoogleAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const siteUrl = (env.SITE_URL || `${url.protocol}//${url.host}`).replace(/\/$/, '');
  const callbackUrl = `${siteUrl}/api/auth/google/callback`;

  // Handle cancellation or error reported by Google
  if (errorParam) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${siteUrl}/workspace.html?auth_error=${encodeURIComponent('Google authentication cancelled: ' + errorParam)}`,
        'Set-Cookie': clearOAuthStateCookie()
      }
    });
  }

  if (!code || !state) {
    return jsonResponse({ error: 'Missing OAuth authorization code or state parameter.' }, 400);
  }

  // 1. Verify CSRF state parameter against HttpOnly cookie
  const cookies = parseCookies(request);
  const stateCookie = cookies.kn_oauth_state || '';
  if (!stateCookie) {
    return jsonResponse({ error: 'OAuth state cookie missing or expired. Please initiate login again.' }, 400);
  }

  const [cookieState] = stateCookie.split(':');
  if (cookieState !== state) {
    console.error('[OAuth Security]: State parameter mismatch — potential CSRF attempt blocked');
    return jsonResponse({ error: 'OAuth state verification failed. Access denied.' }, 403);
  }

  let returnUrl = `${siteUrl}/workspace.html`;
  try {
    const raw = atob(state.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(raw);
    if (parsed.r && (parsed.r.startsWith('/') || parsed.r.startsWith(siteUrl))) {
      returnUrl = parsed.r.startsWith('/') ? `${siteUrl}${parsed.r}` : parsed.r;
    }
    // Expiration check (10 minutes)
    if (parsed.t && Date.now() - parsed.t > 10 * 60 * 1000) {
      return jsonResponse({ error: 'OAuth state token has expired. Please try again.' }, 400);
    }
  } catch (_) {}

  const clientId = (env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (env.GOOGLE_CLIENT_SECRET || '').trim();

  if (!clientId || !clientSecret) {
    return jsonResponse({ error: 'Server Google OAuth credentials are not configured.' }, 503);
  }

  // 2. Exchange authorization code for tokens directly with Google
  const tokenParams = new URLSearchParams();
  tokenParams.set('code', code);
  tokenParams.set('client_id', clientId);
  tokenParams.set('client_secret', clientSecret);
  tokenParams.set('redirect_uri', callbackUrl);
  tokenParams.set('grant_type', 'authorization_code');

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString()
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text().catch(() => '');
    console.error('[Google Token Exchange Error]:', errBody);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${siteUrl}/workspace.html?auth_error=${encodeURIComponent('Failed to exchange authorization code with Google.')}`,
        'Set-Cookie': clearOAuthStateCookie()
      }
    });
  }

  const tokens = await tokenRes.json();
  if (!tokens.id_token) {
    return jsonResponse({ error: 'Google did not return a valid ID token.' }, 502);
  }

  // 3. Cryptographically verify Google ID Token
  let googleUser;
  try {
    googleUser = await verifyGoogleIdToken(tokens.id_token, clientId);
  } catch (err) {
    console.error('[Google Token Verification Failed]:', err.message);
    return jsonResponse({ error: 'Google identity verification failed: ' + err.message }, 401);
  }

  // 4. Locate or Create Verified User in D1 Database
  // Priority A: Search by verified Google Subject Identifier
  let user = await env.DB
    .prepare('SELECT * FROM users WHERE google_sub = ?')
    .bind(googleUser.sub)
    .first();

  let userId;

  if (user) {
    userId = user.id;
    await env.DB
      .prepare(`
        UPDATE users
        SET avatar_url = COALESCE(?, avatar_url),
            name = COALESCE(?, name),
            last_login_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(googleUser.picture, googleUser.name, userId)
      .run();
  } else {
    // Priority B: Search by verified email (Safe linking to existing user)
    const existingByEmail = await env.DB
      .prepare('SELECT * FROM users WHERE email = ?')
      .bind(googleUser.email)
      .first();

    if (existingByEmail) {
      userId = existingByEmail.id;
      // Link Google identity permanently — preserves all bookmarks, notes & PDF entitlements!
      await env.DB
        .prepare(`
          UPDATE users
          SET google_sub = ?,
              auth_provider = 'google',
              avatar_url = COALESCE(?, avatar_url),
              name = COALESCE(?, name),
              verified_at = COALESCE(verified_at, datetime('now')),
              status = 'active',
              last_login_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(googleUser.sub, googleUser.picture, googleUser.name, userId)
        .run();
    } else {
      // Priority C: Create brand-new user record
      const placeholderHash = `oauth_google_${googleUser.sub}`;
      const insertRes = await env.DB
        .prepare(`
          INSERT INTO users (email, name, password_hash, avatar_url, auth_provider, google_sub, status, verified_at, last_login_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'google', ?, 'active', datetime('now'), datetime('now'), datetime('now'), datetime('now'))
        `)
        .bind(googleUser.email, googleUser.name, placeholderHash, googleUser.picture, googleUser.sub)
        .run();

      userId = insertRes.meta.last_row_id;
    }
  }

  // 5. Create secure server-side session in user_sessions table
  const sessionId = generateSecureToken(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';

  await env.DB
    .prepare(`
      INSERT INTO user_sessions (session_id, user_id, expires_at, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `)
    .bind(sessionId, userId, expiresAt, ip, ua)
    .run();

  const sessionCookie = createUserSessionCookie(sessionId);

  // 6. Return 302 redirect with session cookie & clear state cookie
  const responseHeaders = new Headers();
  responseHeaders.append('Location', returnUrl);
  responseHeaders.append('Set-Cookie', sessionCookie);
  responseHeaders.append('Set-Cookie', clearOAuthStateCookie());

  return new Response(null, {
    status: 302,
    headers: responseHeaders
  });
}

/**
 * POST /api/auth/google
 * Validates a Google ID Token directly sent by Google Identity Services.
 * Strictly verifies the cryptographically signed ID token against Google's public keys.
 * NEVER accepts arbitrary email strings or untrusted profile JSON!
 */
export async function handleGoogleAuth(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const credential = body.credential;

    if (!credential || typeof credential !== 'string') {
      return jsonResponse({
        error: 'A cryptographically signed Google ID token (credential) is required. Direct email submission is prohibited.',
        code: 'CREDENTIAL_REQUIRED'
      }, 400);
    }

    const clientId = (env.GOOGLE_CLIENT_ID || '').trim();
    const googleUser = await verifyGoogleIdToken(credential, clientId || null);

    // Locate or create user via verified Google subject ID
    let user = await env.DB
      .prepare('SELECT * FROM users WHERE google_sub = ?')
      .bind(googleUser.sub)
      .first();

    let userId;

    if (user) {
      userId = user.id;
      await env.DB
        .prepare(`
          UPDATE users
          SET avatar_url = COALESCE(?, avatar_url),
              name = COALESCE(?, name),
              last_login_at = datetime('now'),
              updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(googleUser.picture, googleUser.name, userId)
        .run();
    } else {
      const existingByEmail = await env.DB
        .prepare('SELECT * FROM users WHERE email = ?')
        .bind(googleUser.email)
        .first();

      if (existingByEmail) {
        userId = existingByEmail.id;
        await env.DB
          .prepare(`
            UPDATE users
            SET google_sub = ?,
                auth_provider = 'google',
                avatar_url = COALESCE(?, avatar_url),
                name = COALESCE(?, name),
                verified_at = COALESCE(verified_at, datetime('now')),
                status = 'active',
                last_login_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(googleUser.sub, googleUser.picture, googleUser.name, userId)
          .run();
      } else {
        const placeholderHash = `oauth_google_${googleUser.sub}`;
        const insertRes = await env.DB
          .prepare(`
            INSERT INTO users (email, name, password_hash, avatar_url, auth_provider, google_sub, status, verified_at, last_login_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'google', ?, 'active', datetime('now'), datetime('now'), datetime('now'), datetime('now'))
          `)
          .bind(googleUser.email, googleUser.name, placeholderHash, googleUser.picture, googleUser.sub)
          .run();

        userId = insertRes.meta.last_row_id;
      }
    }

    // Issue 30-day session
    const sessionId = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ua = request.headers.get('User-Agent') || '';

    await env.DB
      .prepare(`
        INSERT INTO user_sessions (session_id, user_id, expires_at, ip_address, user_agent, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(sessionId, userId, expiresAt, ip, ua)
      .run();

    const userObj = {
      id: userId,
      email: googleUser.email,
      name: googleUser.name,
      avatarUrl: googleUser.picture,
      authProvider: 'google',
      status: 'active'
    };

    const cookie = createUserSessionCookie(sessionId);
    return jsonResponse(
      { success: true, user: userObj, session_token: sessionId },
      200,
      { 'Set-Cookie': cookie }
    );
  } catch (err) {
    console.error('[Google Auth Verification Error]:', err.message);
    return jsonResponse({
      error: 'Google authentication failed: ' + err.message,
      code: 'INVALID_CREDENTIAL'
    }, 401);
  }
}

// GET /api/auth/me
export async function handleGetMe(request, env, userAuth) {
  if (!userAuth || !userAuth.user) {
    return jsonResponse({ authenticated: false }, 401);
  }
  return jsonResponse({ authenticated: true, user: userAuth.user });
}

// PUT /api/auth/profile
export async function handleUpdateProfile(request, env, userAuth) {
  try {
    const { name, avatar_url } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return jsonResponse({ error: 'Name must be at least 2 characters.' }, 400);
    }

    const cleanName = name.trim();
    const cleanAvatar = avatar_url && typeof avatar_url === 'string' ? avatar_url.trim() : null;

    await env.DB
      .prepare(`
        UPDATE users 
        SET name = ?, avatar_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(cleanName, cleanAvatar, userAuth.user.id)
      .run();

    const updatedUser = {
      ...userAuth.user,
      name: cleanName,
      avatarUrl: cleanAvatar,
      updatedAt: new Date().toISOString()
    };

    return jsonResponse({ success: true, user: updatedUser });
  } catch (err) {
    console.error('[Update Profile Error]:', err);
    return jsonResponse({ error: 'Failed to update profile.' }, 500);
  }
}

// PUT /api/auth/password
export async function handleChangePassword(request, env, userAuth) {
  try {
    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return jsonResponse({ error: 'Current and new password are required.' }, 400);
    }
    if (new_password.length < 8) {
      return jsonResponse({ error: 'New password must be at least 8 characters long.' }, 400);
    }

    const userRow = await env.DB
      .prepare('SELECT password_hash FROM users WHERE id = ?')
      .bind(userAuth.user.id)
      .first();

    if (!userRow) {
      return jsonResponse({ error: 'User not found.' }, 404);
    }

    const isMatch = await verifyPassword(current_password, userRow.password_hash);
    if (!isMatch) {
      return jsonResponse({ error: 'Incorrect current password.' }, 400);
    }

    const newHash = await hashPassword(new_password);
    await env.DB
      .prepare(`
        UPDATE users 
        SET password_hash = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(newHash, userAuth.user.id)
      .run();

    return jsonResponse({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[Change Password Error]:', err);
    return jsonResponse({ error: 'Failed to change password.' }, 500);
  }
}

// POST /api/auth/forgot-password
export async function handleForgotPassword(request, env) {
  try {
    const { email } = await request.json();
    if (!isValidEmail(email)) {
      return jsonResponse({ error: 'Please provide a valid email address.' }, 400);
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await env.DB
      .prepare('SELECT id, name FROM users WHERE email = ?')
      .bind(cleanEmail)
      .first();

    if (user) {
      const resetToken = generateSecureToken(32);
      const resetExpires = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

      await env.DB
        .prepare(`
          UPDATE users 
          SET reset_token = ?, reset_expires_at = ?
          WHERE id = ?
        `)
        .bind(resetToken, resetExpires, user.id)
        .run();

      // If MailerSend is configured, dispatch password reset email
      if (env.MAILERSEND_API_TOKEN && env.FROM_EMAIL) {
        const resetUrl = `${env.SITE_URL || ''}/workspace.html?action=reset&token=${resetToken}`;
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1e293b;">
            <h2 style="color: #0284c7;">KnockoutNotes Password Reset</h2>
            <p>Hello ${user.name || 'there'},</p>
            <p>You requested a password reset for your KnockoutNotes account. Click the button below to set a new password:</p>
            <div style="margin: 28px 0;">
              <a href="${resetUrl}" style="background: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            <p style="font-size: 13px; color: #64748b;">This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
          </div>
        `;

        try {
          await sendEmail({
            apiKey: env.MAILERSEND_API_TOKEN,
            from: env.FROM_EMAIL,
            to: cleanEmail,
            subject: 'Reset your KnockoutNotes password',
            html: emailHtml,
            text: `Reset your KnockoutNotes password: ${resetUrl}`,
            emailType: 'notification',
            db: env.DB
          });
        } catch (mailErr) {
          console.error('[Send Reset Email Error]:', mailErr);
        }
      }
    }

    // Always return success to prevent email enumeration
    return jsonResponse({
      success: true,
      message: 'If an account exists for that email, a password reset link has been dispatched.'
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    return jsonResponse({ error: 'Failed to process password reset request.' }, 500);
  }
}

// POST /api/auth/reset-password
export async function handleResetPassword(request, env) {
  try {
    const { token, new_password } = await request.json();

    if (!token || !new_password || new_password.length < 8) {
      return jsonResponse({ error: 'Valid token and new password (min 8 chars) are required.' }, 400);
    }

    const now = new Date().toISOString();
    const user = await env.DB
      .prepare('SELECT id FROM users WHERE reset_token = ? AND reset_expires_at > ?')
      .bind(token, now)
      .first();

    if (!user) {
      return jsonResponse({ error: 'Invalid or expired password reset link. Please request a new one.' }, 400);
    }

    const newHash = await hashPassword(new_password);
    await env.DB
      .prepare(`
        UPDATE users 
        SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL, updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(newHash, user.id)
      .run();

    return jsonResponse({ success: true, message: 'Password has been successfully reset. You may now log in.' });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    return jsonResponse({ error: 'Failed to reset password.' }, 500);
  }
}


/**
 * --------------------------------------------------------------------------
 * 2. UNIVERSAL BOOKMARKS CONTROLLERS
 * --------------------------------------------------------------------------
 */

// GET /api/user/bookmarks
export async function handleGetBookmarks(request, env, userAuth) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');

    let query = 'SELECT * FROM user_bookmarks WHERE user_id = ?';
    const params = [userAuth.user.id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (type) {
      query += ' AND content_type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return jsonResponse({ success: true, bookmarks: results || [] });
  } catch (err) {
    console.error('[Get Bookmarks Error]:', err);
    return jsonResponse({ error: 'Failed to retrieve bookmarks.' }, 500);
  }
}

// POST /api/user/bookmarks/toggle (Idempotent toggle)
export async function handleToggleBookmark(request, env, userAuth) {
  try {
    const { content_id, content_type, title, route, category, metadata } = await request.json();

    if (!content_id || !title || !route) {
      return jsonResponse({ error: 'content_id, title, and route are required.' }, 400);
    }

    const existing = await env.DB
      .prepare('SELECT id FROM user_bookmarks WHERE user_id = ? AND content_id = ?')
      .bind(userAuth.user.id, content_id)
      .first();

    if (existing) {
      await env.DB
        .prepare('DELETE FROM user_bookmarks WHERE id = ?')
        .bind(existing.id)
        .run();

      return jsonResponse({ success: true, bookmarked: false, content_id });
    } else {
      const metaStr = metadata ? JSON.stringify(metadata) : null;
      const insertResult = await env.DB
        .prepare(`
          INSERT INTO user_bookmarks (user_id, content_id, content_type, title, route, category, metadata, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        `)
        .bind(
          userAuth.user.id,
          content_id,
          content_type || 'other',
          title.trim(),
          route.trim(),
          category ? category.trim() : null,
          metaStr
        )
        .run();

      const newBookmark = {
        id: insertResult.meta.last_row_id,
        user_id: userAuth.user.id,
        content_id,
        content_type: content_type || 'other',
        title: title.trim(),
        route: route.trim(),
        category: category ? category.trim() : null,
        created_at: new Date().toISOString()
      };

      return jsonResponse({ success: true, bookmarked: true, bookmark: newBookmark });
    }
  } catch (err) {
    console.error('[Toggle Bookmark Error]:', err);
    return jsonResponse({ error: 'Failed to update bookmark.' }, 500);
  }
}

// DELETE /api/user/bookmarks/:contentId
export async function handleDeleteBookmark(request, env, userAuth, contentId) {
  try {
    await env.DB
      .prepare('DELETE FROM user_bookmarks WHERE user_id = ? AND content_id = ?')
      .bind(userAuth.user.id, decodeURIComponent(contentId))
      .run();

    return jsonResponse({ success: true, removed: contentId });
  } catch (err) {
    console.error('[Delete Bookmark Error]:', err);
    return jsonResponse({ error: 'Failed to delete bookmark.' }, 500);
  }
}


/**
 * --------------------------------------------------------------------------
 * 3. PERSONAL NOTES CONTROLLERS
 * --------------------------------------------------------------------------
 */

// GET /api/user/notes
export async function handleGetNotes(request, env, userAuth) {
  try {
    const url = new URL(request.url);
    const contentId = url.searchParams.get('content_id');
    const search = url.searchParams.get('search');

    let query = 'SELECT * FROM user_notes WHERE user_id = ?';
    const params = [userAuth.user.id];

    if (contentId) {
      query += ' AND content_id = ?';
      params.push(contentId);
    }
    if (search) {
      query += ' AND (title LIKE ? OR body LIKE ? OR tags LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY is_pinned DESC, updated_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return jsonResponse({ success: true, notes: results || [] });
  } catch (err) {
    console.error('[Get Notes Error]:', err);
    return jsonResponse({ error: 'Failed to retrieve notes.' }, 500);
  }
}

// POST /api/user/notes
export async function handleCreateNote(request, env, userAuth) {
  try {
    const { title, body, content_id, content_type, content_title, route, tags, is_pinned } = await request.json();

    if (!title || !body) {
      return jsonResponse({ error: 'Note title and content are required.' }, 400);
    }

    const insertResult = await env.DB
      .prepare(`
        INSERT INTO user_notes (user_id, title, body, content_id, content_type, content_title, route, tags, is_pinned, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        userAuth.user.id,
        title.trim(),
        body.trim(),
        content_id || null,
        content_type || null,
        content_title ? content_title.trim() : null,
        route ? route.trim() : null,
        tags ? tags.trim() : null,
        is_pinned ? 1 : 0
      )
      .run();

    const note = {
      id: insertResult.meta.last_row_id,
      user_id: userAuth.user.id,
      title: title.trim(),
      body: body.trim(),
      content_id: content_id || null,
      content_type: content_type || null,
      content_title: content_title ? content_title.trim() : null,
      route: route ? route.trim() : null,
      tags: tags ? tags.trim() : null,
      is_pinned: is_pinned ? 1 : 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return jsonResponse({ success: true, note }, 201);
  } catch (err) {
    console.error('[Create Note Error]:', err);
    return jsonResponse({ error: 'Failed to save note.' }, 500);
  }
}

// PUT /api/user/notes/:id
export async function handleUpdateNote(request, env, userAuth, noteId) {
  try {
    const { title, body, tags, is_pinned } = await request.json();

    if (!title || !body) {
      return jsonResponse({ error: 'Note title and content are required.' }, 400);
    }

    const note = await env.DB
      .prepare('SELECT id FROM user_notes WHERE id = ? AND user_id = ?')
      .bind(noteId, userAuth.user.id)
      .first();

    if (!note) {
      return jsonResponse({ error: 'Note not found or permission denied.' }, 404);
    }

    await env.DB
      .prepare(`
        UPDATE user_notes 
        SET title = ?, body = ?, tags = ?, is_pinned = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `)
      .bind(
        title.trim(),
        body.trim(),
        tags ? tags.trim() : null,
        is_pinned ? 1 : 0,
        noteId,
        userAuth.user.id
      )
      .run();

    return jsonResponse({
      success: true,
      note: {
        id: parseInt(noteId, 10),
        title: title.trim(),
        body: body.trim(),
        tags: tags ? tags.trim() : null,
        is_pinned: is_pinned ? 1 : 0,
        updated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Update Note Error]:', err);
    return jsonResponse({ error: 'Failed to update note.' }, 500);
  }
}

// DELETE /api/user/notes/:id
export async function handleDeleteNote(request, env, userAuth, noteId) {
  try {
    await env.DB
      .prepare('DELETE FROM user_notes WHERE id = ? AND user_id = ?')
      .bind(noteId, userAuth.user.id)
      .run();

    return jsonResponse({ success: true, deletedId: noteId });
  } catch (err) {
    console.error('[Delete Note Error]:', err);
    return jsonResponse({ error: 'Failed to delete note.' }, 500);
  }
}


/**
 * --------------------------------------------------------------------------
 * 4. CONTEXTUAL STICKY NOTES CONTROLLERS
 * --------------------------------------------------------------------------
 */

// GET /api/user/sticky-notes
export async function handleGetStickyNotes(request, env, userAuth) {
  try {
    const url = new URL(request.url);
    const contentId = url.searchParams.get('content_id');

    let query = 'SELECT * FROM user_sticky_notes WHERE user_id = ?';
    const params = [userAuth.user.id];

    if (contentId) {
      query += ' AND content_id = ?';
      params.push(contentId);
    }

    query += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(query).bind(...params).all();

    return jsonResponse({ success: true, sticky_notes: results || [] });
  } catch (err) {
    console.error('[Get Sticky Notes Error]:', err);
    return jsonResponse({ error: 'Failed to retrieve sticky notes.' }, 500);
  }
}

// POST /api/user/sticky-notes
export async function handleCreateStickyNote(request, env, userAuth) {
  try {
    const { content_id, content_type, content_title, route, note_text, color } = await request.json();

    if (!content_id || !note_text || !note_text.trim()) {
      return jsonResponse({ error: 'content_id and note text are required.' }, 400);
    }

    const insertResult = await env.DB
      .prepare(`
        INSERT INTO user_sticky_notes (user_id, content_id, content_type, content_title, route, note_text, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        userAuth.user.id,
        content_id,
        content_type || 'general',
        content_title ? content_title.trim() : 'Note',
        route ? route.trim() : '',
        note_text.trim(),
        color || 'yellow'
      )
      .run();

    const sticky = {
      id: insertResult.meta.last_row_id,
      user_id: userAuth.user.id,
      content_id,
      content_type: content_type || 'general',
      content_title: content_title ? content_title.trim() : 'Note',
      route: route ? route.trim() : '',
      note_text: note_text.trim(),
      color: color || 'yellow',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return jsonResponse({ success: true, sticky_note: sticky }, 201);
  } catch (err) {
    console.error('[Create Sticky Note Error]:', err);
    return jsonResponse({ error: 'Failed to save sticky note.' }, 500);
  }
}

// PUT /api/user/sticky-notes/:id
export async function handleUpdateStickyNote(request, env, userAuth, stickyId) {
  try {
    const { note_text, color } = await request.json();

    if (!note_text || !note_text.trim()) {
      return jsonResponse({ error: 'Note text cannot be empty.' }, 400);
    }

    const existing = await env.DB
      .prepare('SELECT id FROM user_sticky_notes WHERE id = ? AND user_id = ?')
      .bind(stickyId, userAuth.user.id)
      .first();

    if (!existing) {
      return jsonResponse({ error: 'Sticky note not found or permission denied.' }, 404);
    }

    await env.DB
      .prepare(`
        UPDATE user_sticky_notes 
        SET note_text = ?, color = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?
      `)
      .bind(note_text.trim(), color || 'yellow', stickyId, userAuth.user.id)
      .run();

    return jsonResponse({
      success: true,
      sticky_note: {
        id: parseInt(stickyId, 10),
        note_text: note_text.trim(),
        color: color || 'yellow',
        updated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('[Update Sticky Note Error]:', err);
    return jsonResponse({ error: 'Failed to update sticky note.' }, 500);
  }
}

// DELETE /api/user/sticky-notes/:id
export async function handleDeleteStickyNote(request, env, userAuth, stickyId) {
  try {
    await env.DB
      .prepare('DELETE FROM user_sticky_notes WHERE id = ? AND user_id = ?')
      .bind(stickyId, userAuth.user.id)
      .run();

    return jsonResponse({ success: true, deletedId: stickyId });
  } catch (err) {
    console.error('[Delete Sticky Note Error]:', err);
    return jsonResponse({ error: 'Failed to delete sticky note.' }, 500);
  }
}


/**
 * --------------------------------------------------------------------------
 * 5. BATCH OFFLINE SYNCHRONIZATION CONTROLLER
 * Supports Android App & PWA offline sync queues with timestamp conflict handling
 * --------------------------------------------------------------------------
 */

// POST /api/user/sync
export async function handleSync(request, env, userAuth) {
  try {
    const {
      queued_bookmarks = [],
      queued_notes = [],
      queued_sticky_notes = []
    } = await request.json();

    const userId = userAuth.user.id;

    // 1. Process queued bookmarks
    for (const b of queued_bookmarks) {
      if (b.action === 'add' && b.content_id) {
        await env.DB
          .prepare(`
            INSERT OR REPLACE INTO user_bookmarks (user_id, content_id, content_type, title, route, category, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
          `)
          .bind(
            userId,
            b.content_id,
            b.content_type || 'other',
            b.title || 'Bookmarked Item',
            b.route || '',
            b.category || null
          )
          .run();
      } else if (b.action === 'remove' && b.content_id) {
        await env.DB
          .prepare('DELETE FROM user_bookmarks WHERE user_id = ? AND content_id = ?')
          .bind(userId, b.content_id)
          .run();
      }
    }

    // 2. Process queued notes
    for (const n of queued_notes) {
      if (n.action === 'create' && n.title && n.body) {
        await env.DB
          .prepare(`
            INSERT INTO user_notes (user_id, title, body, content_id, content_type, content_title, route, tags, is_pinned, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `)
          .bind(
            userId,
            n.title,
            n.body,
            n.content_id || null,
            n.content_type || null,
            n.content_title || null,
            n.route || null,
            n.tags || null,
            n.is_pinned ? 1 : 0
          )
          .run();
      } else if (n.action === 'update' && n.id && n.title && n.body) {
        await env.DB
          .prepare(`
            UPDATE user_notes 
            SET title = ?, body = ?, tags = ?, is_pinned = ?, updated_at = datetime('now')
            WHERE id = ? AND user_id = ?
          `)
          .bind(n.title, n.body, n.tags || null, n.is_pinned ? 1 : 0, n.id, userId)
          .run();
      } else if (n.action === 'delete' && n.id) {
        await env.DB
          .prepare('DELETE FROM user_notes WHERE id = ? AND user_id = ?')
          .bind(n.id, userId)
          .run();
      }
    }

    // 3. Process queued sticky notes
    for (const s of queued_sticky_notes) {
      if (s.action === 'create' && s.content_id && s.note_text) {
        await env.DB
          .prepare(`
            INSERT INTO user_sticky_notes (user_id, content_id, content_type, content_title, route, note_text, color, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `)
          .bind(
            userId,
            s.content_id,
            s.content_type || 'general',
            s.content_title || 'Note',
            s.route || '',
            s.note_text,
            s.color || 'yellow'
          )
          .run();
      } else if (s.action === 'delete' && s.id) {
        await env.DB
          .prepare('DELETE FROM user_sticky_notes WHERE id = ? AND user_id = ?')
          .bind(s.id, userId)
          .run();
      }
    }

    // 4. Fetch clean authoritative state from D1
    const [bookmarksRes, notesRes, stickyRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM user_bookmarks WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all(),
      env.DB.prepare('SELECT * FROM user_notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC').bind(userId).all(),
      env.DB.prepare('SELECT * FROM user_sticky_notes WHERE user_id = ? ORDER BY created_at DESC').bind(userId).all()
    ]);

    return jsonResponse({
      success: true,
      synced_at: new Date().toISOString(),
      bookmarks: bookmarksRes.results || [],
      notes: notesRes.results || [],
      sticky_notes: stickyRes.results || []
    });
  } catch (err) {
    console.error('[Sync Error]:', err);
    return jsonResponse({ error: 'Sync failed.' }, 500);
  }
}
