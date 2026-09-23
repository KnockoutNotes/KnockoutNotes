/**
 * KnockoutNotes Cloudflare Worker
 * Handles Subscription API, Double Opt-In Verification, Unsubscribe,
 * Admin Authentication, Content Publishing Notifications, and Admin Dashboard API.
 * Static assets fall back transparently to env.ASSETS.
 */

import {
  generateSecureToken,
  verifyPassword,
  parseCookies,
  createSessionCookie,
  clearSessionCookie,
  validateAdminSession
} from './auth.js';

import {
  renderVerificationEmail,
  renderWelcomeEmail,
  renderContentNotificationEmail,
  renderBroadcastEmail,
  renderAdminAlertEmail
} from './email-templates.js';

import { sendEmail, sendBulkEmails } from './mailersend.js';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listContent,
  getContentById,
  createContent,
  updateContent,
  setContentStatus,
  deleteContent,
  listAuditLogs,
  recordAuditLog
} from './cms.js';
import {
  listFiles,
  handleFileUpload,
  deleteFile,
  serveFile,
  isR2Configured
} from './files.js';
import { getWebAnalytics } from './analytics.js';


// Standard CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders
    }
  });
}

function redirectResponse(url, extraHeaders = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url,
      ...extraHeaders
    }
  });
}

function getSiteUrl(request, env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim()) && email.length <= 254;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Handle preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ==========================================
    // 0. ADMIN ROUTE INTERCEPTION & AUTH GUARD
    // ==========================================
    // Canonicalize /admin/login.html -> /admin/login
    if (pathname === '/admin/login.html') {
      return redirectResponse('/admin/login');
    }

    // Login page handling
    if (pathname === '/admin/login') {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      if (session) {
        return redirectResponse('/admin/');
      }
      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }
    }

    // Canonicalize /admin/index.html -> /admin/
    if (pathname === '/admin/index.html') {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      if (!session) {
        return redirectResponse('/admin/login');
      }
      return redirectResponse('/admin/');
    }

    // Canonicalize /admin (without trailing slash) -> /admin/
    if (pathname === '/admin') {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      if (!session) {
        return redirectResponse('/admin/login');
      }
      return redirectResponse('/admin/');
    }

    // Admin dashboard and sub-routes (/admin/, /admin/content, etc.)
    // Note: static files with extensions (.css, .js, .png, etc.) pass through directly to ASSETS below
    if (pathname === '/admin/' || (pathname.startsWith('/admin/') && !pathname.includes('.'))) {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      if (!session) {
        return redirectResponse('/admin/login');
      }
      if (env.ASSETS) {
        const adminReq = new Request(new URL('/admin/', request.url), request);
        return env.ASSETS.fetch(adminReq);
      }
    }

    // ==========================================
    // 1. PUBLIC SUBSCRIPTION ROUTES
    // ==========================================


    // POST /api/subscribe
    if (pathname === '/api/subscribe' && request.method === 'POST') {
      if (!env.DB) {
        return jsonResponse({ error: 'Database binding not configured' }, 500);
      }

      try {
        const body = await request.json();
        const email = (body.email || '').trim().toLowerCase();
        const name = (body.name || '').trim();
        const sourcePage = (body.sourcePage || 'website').trim();

        if (!isValidEmail(email)) {
          return jsonResponse({ error: 'Please enter a valid email address.' }, 400);
        }

        const siteUrl = getSiteUrl(request, env);
        const existing = await env.DB
          .prepare('SELECT * FROM subscribers WHERE email = ?')
          .bind(email)
          .first();

        let unsubscribeToken;

        if (existing) {
          if (existing.status === 'active') {
            return jsonResponse({
              success: true,
              message: "You're already subscribed to KnockoutNotes."
            });
          }

          if (existing.status === 'banned') {
            return jsonResponse({ error: 'Unable to subscribe this email address.' }, 403);
          }

          // Existing pending or unsubscribed subscriber -> reactivate directly to active
          unsubscribeToken = existing.unsubscribe_token || generateSecureToken(24);
          await env.DB
            .prepare(`
              UPDATE subscribers 
              SET status = 'active', verified_at = datetime('now'), unsubscribed_at = NULL, verification_token = NULL, unsubscribe_token = ?, source_page = COALESCE(?, source_page), updated_at = datetime('now')
              WHERE id = ?
            `)
            .bind(unsubscribeToken, sourcePage, existing.id)
            .run();
        } else {
          // New subscriber insert directly as active
          unsubscribeToken = generateSecureToken(24);
          await env.DB
            .prepare(`
              INSERT INTO subscribers (email, name, status, verified_at, unsubscribe_token, source_page, created_at, updated_at)
              VALUES (?, ?, 'active', datetime('now'), ?, ?, datetime('now'), datetime('now'))
            `)
            .bind(email, name || null, unsubscribeToken, sourcePage)
            .run();
        }

        // Dispatch exactly ONE welcome email in background
        const supportUrl = env.SUPPORT_URL || 'https://bondin.io/@knockoutnotes/support';
        const welcomeTemplate = renderWelcomeEmail({
          siteUrl,
          supportUrl,
          unsubscribeToken,
          email
        });

        ctx.waitUntil(
          sendEmail({
            apiKey: env.MAILERSEND_API_TOKEN,
            from: env.FROM_EMAIL,
            to: email,
            subject: welcomeTemplate.subject,
            html: welcomeTemplate.html,
            text: welcomeTemplate.text,
            emailType: 'welcome',
            db: env.DB
          })
        );

        // Notify Admin of new active subscriber
        const adminNotifyEmail = env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL;
        if (adminNotifyEmail) {
          const activeCountRow = await env.DB
            .prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'")
            .first();

          const adminAlert = renderAdminAlertEmail({
            type: 'new_subscriber',
            email: email,
            details: {
              source: sourcePage,
              date: new Date().toUTCString(),
              totalActive: activeCountRow?.count || 1
            }
          });

          ctx.waitUntil(
            sendEmail({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              to: adminNotifyEmail,
              subject: adminAlert.subject,
              html: adminAlert.html,
              text: adminAlert.text,
              emailType: 'admin_alert',
              db: env.DB
            })
          );
        }

        return jsonResponse({
          success: true,
          message: "You're in! Check your inbox for a little welcome note."
        });
      } catch (err) {
        console.error('[Subscribe Error]:', err);
        return jsonResponse({ error: 'Failed to process subscription. Please try again.' }, 500);
      }
    }

    // GET /subscribe/verify?token=...
    if (pathname === '/subscribe/verify' && request.method === 'GET') {
      const token = url.searchParams.get('token');
      const siteUrl = getSiteUrl(request, env);

      if (!token || !env.DB) {
        return redirectResponse(`${siteUrl}/subscribe-confirmed.html?status=invalid`);
      }

      try {
        const now = new Date().toISOString();
        const subscriber = await env.DB
          .prepare('SELECT * FROM subscribers WHERE verification_token = ? AND status != "banned"')
          .bind(token)
          .first();

        if (!subscriber) {
          return redirectResponse(`${siteUrl}/subscribe-confirmed.html?status=invalid`);
        }

        if (subscriber.verification_expires_at && subscriber.verification_expires_at < now) {
          return redirectResponse(`${siteUrl}/subscribe-confirmed.html?status=expired`);
        }

        // Activate subscriber
        await env.DB
          .prepare(`
            UPDATE subscribers 
            SET status = 'active', verified_at = datetime('now'), verification_token = NULL, updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(subscriber.id)
          .run();

        // Send Welcome email
        const welcome = renderWelcomeEmail({
          siteUrl,
          supportUrl: env.SUPPORT_URL,
          unsubscribeToken: subscriber.unsubscribe_token,
          email: subscriber.email
        });

        ctx.waitUntil(
          sendEmail({
            apiKey: env.MAILERSEND_API_TOKEN,
            from: env.FROM_EMAIL,
            to: subscriber.email,
            subject: welcome.subject,
            html: welcome.html,
            text: welcome.text,
            emailType: 'welcome',
            db: env.DB
          })
        );

        // Notify Admin of new confirmed subscriber
        const adminNotifyEmail = env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL;
        if (adminNotifyEmail) {
          const activeCountRow = await env.DB
            .prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'")
            .first();

          const adminAlert = renderAdminAlertEmail({
            type: 'new_subscriber',
            email: subscriber.email,
            details: {
              source: subscriber.source_page || 'website',
              date: new Date().toUTCString(),
              totalActive: activeCountRow?.count || 1
            }
          });

          ctx.waitUntil(
            sendEmail({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              to: adminNotifyEmail,
              subject: adminAlert.subject,
              html: adminAlert.html,
              text: adminAlert.text,
              emailType: 'admin_alert',
              db: env.DB
            })
          );
        }

        return redirectResponse(`${siteUrl}/subscribe-confirmed.html?status=success`);
      } catch (err) {
        console.error('[Verify Error]:', err);
        return redirectResponse(`${siteUrl}/subscribe-confirmed.html?status=error`);
      }
    }

    // GET /unsubscribe?token=...
    if (pathname === '/unsubscribe' && request.method === 'GET') {
      const token = url.searchParams.get('token');
      const siteUrl = getSiteUrl(request, env);

      if (!token || !env.DB) {
        return redirectResponse(`${siteUrl}/unsubscribe-confirmed.html?status=invalid`);
      }

      try {
        const subscriber = await env.DB
          .prepare('SELECT * FROM subscribers WHERE unsubscribe_token = ?')
          .bind(token)
          .first();

        if (!subscriber) {
          return redirectResponse(`${siteUrl}/unsubscribe-confirmed.html?status=invalid`);
        }

        if (subscriber.status === 'unsubscribed') {
          return redirectResponse(`${siteUrl}/unsubscribe-confirmed.html?status=already`);
        }

        // Unsubscribe
        await env.DB
          .prepare(`
            UPDATE subscribers 
            SET status = 'unsubscribed', unsubscribed_at = datetime('now'), updated_at = datetime('now')
            WHERE id = ?
          `)
          .bind(subscriber.id)
          .run();

        // Notify Admin
        const adminNotifyEmail = env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL;
        if (adminNotifyEmail) {
          const activeCountRow = await env.DB
            .prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'")
            .first();

          const adminAlert = renderAdminAlertEmail({
            type: 'unsubscribe',
            email: subscriber.email,
            details: {
              date: new Date().toUTCString(),
              totalActive: activeCountRow?.count || 0
            }
          });

          ctx.waitUntil(
            sendEmail({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              to: adminNotifyEmail,
              subject: adminAlert.subject,
              html: adminAlert.html,
              text: adminAlert.text,
              emailType: 'admin_alert',
              db: env.DB
            })
          );
        }

        return redirectResponse(`${siteUrl}/unsubscribe-confirmed.html?status=success`);
      } catch (err) {
        console.error('[Unsubscribe Error]:', err);
        return redirectResponse(`${siteUrl}/unsubscribe-confirmed.html?status=error`);
      }
    }

    // ==========================================
    // 2. ADMIN AUTHENTICATION
    // ==========================================

    // POST /api/admin/login
    if (pathname === '/api/admin/login' && request.method === 'POST') {
      try {
        const { username, password } = await request.json();
        const expectedUsername = env.ADMIN_USERNAME || 'admin.knockoutnotes';
        const expectedPasswordHash = env.ADMIN_PASSWORD_HASH || '';

        if (!username || !password) {
          return jsonResponse({ error: 'Username and password are required' }, 400);
        }

        const isUserValid = (username.trim() === expectedUsername);
        const isPassValid = await verifyPassword(password, expectedPasswordHash);

        if (!isUserValid || !isPassValid) {
          return jsonResponse({ error: 'Invalid credentials' }, 401);
        }

        const sessionId = generateSecureToken(32);
        const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
        const ip = request.headers.get('CF-Connecting-IP') || '';
        const ua = request.headers.get('User-Agent') || '';

        if (env.DB) {
          await env.DB
            .prepare(`
              INSERT INTO admin_sessions (session_id, admin_username, expires_at, ip_address, user_agent, created_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))
            `)
            .bind(sessionId, expectedUsername, expiresAt, ip, ua)
            .run();

          await recordAuditLog(env.DB, expectedUsername, 'login', 'session', sessionId, { ip, ua }, ip);
        }

        const cookie = createSessionCookie(sessionId);
        return jsonResponse({ success: true, username: expectedUsername }, 200, {
          'Set-Cookie': cookie
        });
      } catch (err) {
        console.error('[Admin Login Error]:', err);
        return jsonResponse({ error: 'Login process failed' }, 500);
      }
    }

    // POST /api/admin/logout
    if (pathname === '/api/admin/logout' && request.method === 'POST') {
      const cookies = parseCookies(request);
      const sessionId = cookies.admin_session;

      if (sessionId && env.DB) {
        const session = await validateAdminSession(env.DB, sessionId);
        if (session) {
          const ip = request.headers.get('CF-Connecting-IP') || '';
          await recordAuditLog(env.DB, session.admin_username, 'logout', 'session', sessionId, 'Admin signed out', ip);
        }
        await env.DB
          .prepare('DELETE FROM admin_sessions WHERE session_id = ?')
          .bind(sessionId)
          .run();
      }

      return jsonResponse({ success: true }, 200, {
        'Set-Cookie': clearSessionCookie()
      });
    }


    // GET /api/admin/me
    if (pathname === '/api/admin/me' && request.method === 'GET') {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      if (!session) {
        return jsonResponse({ authenticated: false }, 401);
      }
      return jsonResponse({ authenticated: true, username: session.admin_username });
    }

    // ==========================================
    // 3. ADMIN SECURE API MIDDLEWARE & ROUTES
    // ==========================================
    if (pathname.startsWith('/api/admin/')) {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);

      if (!session) {
        return jsonResponse({ error: 'Unauthorized. Admin session invalid or expired.' }, 401);
      }

      // GET /api/admin/stats
      if (pathname === '/api/admin/stats' && request.method === 'GET') {
        try {
          const totalRow = await env.DB.prepare('SELECT COUNT(*) as count FROM subscribers').first();
          const activeRow = await env.DB.prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'active'").first();
          const pendingRow = await env.DB.prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'pending'").first();
          const unsubRow = await env.DB.prepare("SELECT COUNT(*) as count FROM subscribers WHERE status = 'unsubscribed'").first();

          const emailsSentRow = await env.DB.prepare("SELECT COUNT(*) as count FROM email_logs WHERE status = 'sent'").first();
          const emailsFailedRow = await env.DB.prepare("SELECT COUNT(*) as count FROM email_logs WHERE status = 'failed'").first();

          // CMS Content Counts
          let contentCounts = { notes: 0, pearls: 0, calculators: 0, updates: 0, total: 0 };
          let fileCount = 0;
          try {
            const noteCountRow = await env.DB.prepare("SELECT COUNT(*) as count FROM content WHERE content_type = 'note'").first();
            const pearlCountRow = await env.DB.prepare("SELECT COUNT(*) as count FROM content WHERE content_type = 'pearl'").first();
            const calcCountRow = await env.DB.prepare("SELECT COUNT(*) as count FROM content WHERE content_type = 'calculator'").first();
            const updateCountRow = await env.DB.prepare("SELECT COUNT(*) as count FROM content WHERE content_type = 'update'").first();
            const filesCountRow = await env.DB.prepare("SELECT COUNT(*) as count FROM files").first();

            contentCounts = {
              notes: noteCountRow?.count || 0,
              pearls: pearlCountRow?.count || 0,
              calculators: calcCountRow?.count || 0,
              updates: updateCountRow?.count || 0,
              total: (noteCountRow?.count || 0) + (pearlCountRow?.count || 0) + (calcCountRow?.count || 0) + (updateCountRow?.count || 0)
            };
            fileCount = filesCountRow?.count || 0;
          } catch (_) {
            // Migration may be pending in some environments
          }

          const recentEvents = await env.DB
            .prepare('SELECT * FROM notification_events ORDER BY created_at DESC LIMIT 5')
            .all();

          return jsonResponse({
            subscribers: {
              total: totalRow?.count || 0,
              active: activeRow?.count || 0,
              pending: pendingRow?.count || 0,
              unsubscribed: unsubRow?.count || 0
            },
            emails: {
              sent: emailsSentRow?.count || 0,
              failed: emailsFailedRow?.count || 0
            },
            content: contentCounts,
            files: {
              total: fileCount,
              r2_configured: isR2Configured(env)
            },
            recentEvents: recentEvents?.results || []
          });
        } catch (err) {
          console.error('[Admin Stats Error]:', err);
          return jsonResponse({ error: 'Failed to fetch statistics' }, 500);
        }
      }


      // GET /api/admin/subscribers
      if (pathname === '/api/admin/subscribers' && request.method === 'GET') {
        try {
          const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
          const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get('limit') || '25', 10)));
          const offset = (page - 1) * limit;
          const status = url.searchParams.get('status') || 'all';
          const query = (url.searchParams.get('q') || '').trim();

          let sql = 'SELECT id, email, name, status, source_page, created_at, verified_at, unsubscribed_at FROM subscribers WHERE 1=1';
          let countSql = 'SELECT COUNT(*) as count FROM subscribers WHERE 1=1';
          const params = [];
          const countParams = [];

          if (status !== 'all') {
            sql += ' AND status = ?';
            countSql += ' AND status = ?';
            params.push(status);
            countParams.push(status);
          }

          if (query) {
            sql += ' AND (email LIKE ? OR name LIKE ?)';
            countSql += ' AND (email LIKE ? OR name LIKE ?)';
            const wildcard = `%${query}%`;
            params.push(wildcard, wildcard);
            countParams.push(wildcard, wildcard);
          }

          sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
          params.push(limit, offset);

          const countRow = await env.DB.prepare(countSql).bind(...countParams).first();
          const rows = await env.DB.prepare(sql).bind(...params).all();

          const total = countRow?.count || 0;
          return jsonResponse({
            subscribers: rows.results || [],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          });
        } catch (err) {
          console.error('[Admin Subscribers Error]:', err);
          return jsonResponse({ error: 'Failed to fetch subscribers' }, 500);
        }
      }

      // POST /api/admin/subscribers/delete
      if (pathname === '/api/admin/subscribers/delete' && request.method === 'POST') {
        try {
          const { id } = await request.json();
          if (!id) return jsonResponse({ error: 'Subscriber ID is required' }, 400);

          await env.DB.prepare('DELETE FROM subscribers WHERE id = ?').bind(id).run();
          return jsonResponse({ success: true, message: 'Subscriber removed' });
        } catch (err) {
          console.error('[Delete Subscriber Error]:', err);
          return jsonResponse({ error: 'Failed to delete subscriber' }, 500);
        }
      }

      // POST /api/admin/subscribers/toggle-status
      if (pathname === '/api/admin/subscribers/toggle-status' && request.method === 'POST') {
        try {
          const { id, status } = await request.json();
          if (!id || !['active', 'pending', 'unsubscribed', 'banned'].includes(status)) {
            return jsonResponse({ error: 'Valid ID and status required' }, 400);
          }

          await env.DB
            .prepare("UPDATE subscribers SET status = ?, updated_at = datetime('now') WHERE id = ?")
            .bind(status, id)
            .run();

          return jsonResponse({ success: true, message: `Subscriber status changed to ${status}` });
        } catch (err) {
          console.error('[Toggle Status Error]:', err);
          return jsonResponse({ error: 'Failed to update subscriber' }, 500);
        }
      }

      // GET /api/admin/subscribers/export
      if (pathname === '/api/admin/subscribers/export' && request.method === 'GET') {
        try {
          const rows = await env.DB
            .prepare('SELECT id, email, name, status, source_page, created_at, verified_at, unsubscribed_at FROM subscribers ORDER BY id ASC')
            .all();

          const list = rows.results || [];
          let csv = 'ID,Email,Name,Status,Source,CreatedAt,VerifiedAt,UnsubscribedAt\n';
          list.forEach(r => {
            const escape = s => `"${(s || '').toString().replace(/"/g, '""')}"`;
            csv += `${r.id},${escape(r.email)},${escape(r.name)},${r.status},${escape(r.source_page)},${r.created_at || ''},${r.verified_at || ''},${r.unsubscribed_at || ''}\n`;
          });

          return new Response(csv, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv; charset=utf-8',
              'Content-Disposition': `attachment; filename="knockoutnotes_subscribers_${Date.now()}.csv"`
            }
          });
        } catch (err) {
          console.error('[Export CSV Error]:', err);
          return jsonResponse({ error: 'Failed to export subscribers' }, 500);
        }
      }

      // GET /api/admin/logs
      if (pathname === '/api/admin/logs' && request.method === 'GET') {
        try {
          const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
          const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get('limit') || '25', 10)));
          const offset = (page - 1) * limit;

          const countRow = await env.DB.prepare('SELECT COUNT(*) as count FROM email_logs').first();
          const rows = await env.DB
            .prepare('SELECT * FROM email_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
            .bind(limit, offset)
            .all();

          const total = countRow?.count || 0;
          return jsonResponse({
            logs: rows.results || [],
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          });
        } catch (err) {
          console.error('[Admin Logs Error]:', err);
          return jsonResponse({ error: 'Failed to fetch logs' }, 500);
        }
      }

      // POST /api/admin/content/publish (Publish new note / calculator / update / resource)
      if (pathname === '/api/admin/content/publish' && request.method === 'POST') {
        try {
          const body = await request.json();
          const {
            eventType, // 'update', 'notes', 'calculator', 'resource'
            title,
            summary,
            contentUrl,
            idempotencyKey,
            sendTestEmail,
            testEmailAddress
          } = body;

          if (!title || !eventType) {
            return jsonResponse({ error: 'Title and eventType are required' }, 400);
          }

          const siteUrl = getSiteUrl(request, env);

          // Handle test send mode
          if (sendTestEmail) {
            const recipient = testEmailAddress || env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL;
            if (!recipient) {
              return jsonResponse({ error: 'Test email address is required' }, 400);
            }

            const template = renderContentNotificationEmail({
              siteUrl,
              eventType,
              title,
              summary,
              contentUrl,
              unsubscribeToken: 'mock-test-token'
            });

            const sendRes = await sendEmail({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              to: recipient,
              subject: `[TEST] ${template.subject}`,
              html: template.html,
              text: template.text,
              emailType: 'notification',
              db: env.DB
            });

            if (!sendRes.success) {
              return jsonResponse({ error: `Test send failed: ${sendRes.error}` }, 500);
            }

            return jsonResponse({ success: true, message: `Test email sent to ${recipient}` });
          }

          // Real Broadcast Check Idempotency Key
          if (idempotencyKey) {
            const existingEvent = await env.DB
              .prepare('SELECT id FROM notification_events WHERE idempotency_key = ?')
              .bind(idempotencyKey)
              .first();

            if (existingEvent) {
              return jsonResponse({
                error: 'This update has already been published and notified (idempotency key matched).'
              }, 409);
            }
          }

          // Fetch active subscribers
          const activeRows = await env.DB
            .prepare("SELECT email, unsubscribe_token FROM subscribers WHERE status = 'active'")
            .all();

          const recipients = activeRows.results || [];

          if (recipients.length === 0) {
            return jsonResponse({
              success: true,
              message: 'No active subscribers found to notify.',
              recipientsCount: 0
            });
          }

          // Record notification event in D1
          const eventInsert = await env.DB
            .prepare(`
              INSERT INTO notification_events (event_type, title, summary, content_url, idempotency_key, recipient_count, sent_by, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
            `)
            .bind(
              eventType,
              title,
              summary || null,
              contentUrl || null,
              idempotencyKey || null,
              recipients.length,
              session.admin_username
            )
            .run();

          const eventId = eventInsert.meta?.last_row_id || null;

          // Dispatch bulk emails in background
          ctx.waitUntil(
            sendBulkEmails({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              recipients,
              renderFn: sub =>
                renderContentNotificationEmail({
                  siteUrl,
                  eventType,
                  title,
                  summary,
                  contentUrl,
                  unsubscribeToken: sub.unsubscribe_token
                }),
              emailType: 'notification',
              eventId,
              db: env.DB
            })
          );

          return jsonResponse({
            success: true,
            message: `Notification broadcast queued for ${recipients.length} active subscriber(s).`,
            recipientsCount: recipients.length,
            eventId
          });
        } catch (err) {
          console.error('[Content Publish Error]:', err);
          return jsonResponse({ error: 'Failed to publish content notification' }, 500);
        }
      }

      // POST /api/admin/broadcast (Manual broadcast message to all active subscribers)
      if (pathname === '/api/admin/broadcast' && request.method === 'POST') {
        try {
          const body = await request.json();
          const {
            subject,
            message,
            actionUrl,
            actionText,
            idempotencyKey,
            sendTestEmail,
            testEmailAddress
          } = body;

          if (!subject || !message) {
            return jsonResponse({ error: 'Subject and message are required' }, 400);
          }

          const siteUrl = getSiteUrl(request, env);

          // Handle test send mode
          if (sendTestEmail) {
            const recipient = testEmailAddress || env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL;
            if (!recipient) {
              return jsonResponse({ error: 'Test email address is required' }, 400);
            }

            const template = renderBroadcastEmail({
              siteUrl,
              subject: `[TEST] ${subject}`,
              message,
              actionUrl,
              actionText,
              unsubscribeToken: 'mock-test-token'
            });

            const sendRes = await sendEmail({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              to: recipient,
              subject: template.subject,
              html: template.html,
              text: template.text,
              emailType: 'broadcast',
              db: env.DB
            });

            if (!sendRes.success) {
              return jsonResponse({ error: `Test broadcast failed: ${sendRes.error}` }, 500);
            }

            return jsonResponse({ success: true, message: `Test broadcast sent to ${recipient}` });
          }

          // Real Broadcast Check Idempotency Key
          if (idempotencyKey) {
            const existingEvent = await env.DB
              .prepare('SELECT id FROM notification_events WHERE idempotency_key = ?')
              .bind(idempotencyKey)
              .first();

            if (existingEvent) {
              return jsonResponse({
                error: 'This broadcast has already been sent (idempotency key matched).'
              }, 409);
            }
          }

          // Fetch active subscribers
          const activeRows = await env.DB
            .prepare("SELECT email, unsubscribe_token FROM subscribers WHERE status = 'active'")
            .all();

          const recipients = activeRows.results || [];

          if (recipients.length === 0) {
            return jsonResponse({
              success: true,
              message: 'No active subscribers found to broadcast to.',
              recipientsCount: 0
            });
          }

          // Record notification event in D1
          const eventInsert = await env.DB
            .prepare(`
              INSERT INTO notification_events (event_type, title, summary, content_url, idempotency_key, recipient_count, sent_by, created_at)
              VALUES ('broadcast', ?, ?, ?, ?, ?, ?, datetime('now'))
            `)
            .bind(
              subject,
              message,
              actionUrl || null,
              idempotencyKey || null,
              recipients.length,
              session.admin_username
            )
            .run();

          const eventId = eventInsert.meta?.last_row_id || null;

          // Dispatch bulk emails in background
          ctx.waitUntil(
            sendBulkEmails({
              apiKey: env.MAILERSEND_API_TOKEN,
              from: env.FROM_EMAIL,
              recipients,
              renderFn: sub =>
                renderBroadcastEmail({
                  siteUrl,
                  subject,
                  message,
                  actionUrl,
                  actionText,
                  unsubscribeToken: sub.unsubscribe_token
                }),
              emailType: 'broadcast',
              eventId,
              db: env.DB
            })
          );

          return jsonResponse({
            success: true,
            message: `Broadcast queued for ${recipients.length} active subscriber(s).`,
            recipientsCount: recipients.length,
            eventId
          });
        } catch (err) {
          console.error('[Broadcast Error]:', err);
          return jsonResponse({ error: 'Failed to send broadcast' }, 500);
        }
      }

      // ----------------------------------------------------
      // WEB ANALYTICS ENDPOINT (Cloudflare GraphQL aggregate)
      // ----------------------------------------------------
      if (pathname === '/api/admin/analytics' && request.method === 'GET') {
        const period = url.searchParams.get('period') || '7d';
        const analyticsData = await getWebAnalytics(env, { period });
        return jsonResponse(analyticsData);
      }

      // ----------------------------------------------------
      // CATEGORIES CRUD ENDPOINTS
      // ----------------------------------------------------
      if (pathname === '/api/admin/categories' && request.method === 'GET') {
        try {
          const type = url.searchParams.get('type') || 'all';
          const categories = await listCategories(env.DB, { type });
          return jsonResponse({ categories });
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (pathname === '/api/admin/categories' && request.method === 'POST') {
        try {
          const data = await request.json();
          const created = await createCategory(env.DB, data, session.admin_username);
          return jsonResponse({ success: true, category: created }, 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/categories/') && request.method === 'PUT') {
        try {
          const catId = pathname.replace('/api/admin/categories/', '');
          const data = await request.json();
          const updated = await updateCategory(env.DB, catId, data, session.admin_username);
          return jsonResponse({ success: true, category: updated });
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/categories/') && request.method === 'DELETE') {
        try {
          const catId = pathname.replace('/api/admin/categories/', '');
          const result = await deleteCategory(env.DB, catId, session.admin_username);
          return jsonResponse(result);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      // ----------------------------------------------------
      // CONTENT CRUD ENDPOINTS (Notes, Pearls, Calculators, Updates)
      // ----------------------------------------------------
      if (pathname === '/api/admin/content' && request.method === 'GET') {
        try {
          const options = {
            type: url.searchParams.get('type') || 'all',
            status: url.searchParams.get('status') || 'all',
            category_id: url.searchParams.get('category_id') || null,
            q: url.searchParams.get('q') || '',
            page: url.searchParams.get('page') || '1',
            limit: url.searchParams.get('limit') || '20'
          };
          const data = await listContent(env.DB, options);
          return jsonResponse(data);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (pathname.startsWith('/api/admin/content/') && request.method === 'GET') {
        try {
          const contentId = pathname.replace('/api/admin/content/', '');
          const item = await getContentById(env.DB, contentId);
          if (!item) return jsonResponse({ error: 'Content item not found' }, 404);
          return jsonResponse({ content: item });
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (pathname === '/api/admin/content' && request.method === 'POST') {
        try {
          const data = await request.json();
          const created = await createContent(env.DB, data, session.admin_username);
          return jsonResponse({ success: true, content: created }, 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/content/') && pathname.endsWith('/status') && request.method === 'POST') {
        try {
          const contentId = pathname.replace('/api/admin/content/', '').replace('/status', '');
          const { status } = await request.json();
          const result = await setContentStatus(env.DB, contentId, status, session.admin_username);
          return jsonResponse({ success: true, ...result });
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/content/') && request.method === 'PUT') {
        try {
          const contentId = pathname.replace('/api/admin/content/', '');
          const data = await request.json();
          const updated = await updateContent(env.DB, contentId, data, session.admin_username);
          return jsonResponse({ success: true, content: updated });
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/content/') && request.method === 'DELETE') {
        try {
          const contentId = pathname.replace('/api/admin/content/', '');
          const result = await deleteContent(env.DB, contentId, session.admin_username);
          return jsonResponse(result);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      // ----------------------------------------------------
      // FILE MANAGER ENDPOINTS (Cloudflare R2 & Metadata)
      // ----------------------------------------------------
      if (pathname === '/api/admin/files' && request.method === 'GET') {
        try {
          const options = {
            folder: url.searchParams.get('folder') || 'all',
            q: url.searchParams.get('q') || '',
            page: url.searchParams.get('page') || '1',
            limit: url.searchParams.get('limit') || '30'
          };
          const data = await listFiles(env.DB, env, options);
          return jsonResponse(data);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      if (pathname === '/api/admin/files/upload' && request.method === 'POST') {
        try {
          const result = await handleFileUpload(request, env.DB, env, session.admin_username);
          await recordAuditLog(env.DB, session.admin_username, 'file_upload', 'file', result.id, { filename: result.filename, storage_key: result.storage_key });
          return jsonResponse({ success: true, file: result }, 201);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      if (pathname.startsWith('/api/admin/files/') && request.method === 'DELETE') {
        try {
          const fileId = pathname.replace('/api/admin/files/', '');
          const result = await deleteFile(fileId, env.DB, env, session.admin_username);
          await recordAuditLog(env.DB, session.admin_username, 'file_delete', 'file', fileId, { filename: result.filename });
          return jsonResponse(result);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
      }

      // ----------------------------------------------------
      // AUDIT LOGS ENDPOINT
      // ----------------------------------------------------
      if (pathname === '/api/admin/audit-logs' && request.method === 'GET') {
        try {
          const options = {
            page: url.searchParams.get('page') || '1',
            limit: url.searchParams.get('limit') || '30'
          };
          const data = await listAuditLogs(env.DB, options);
          return jsonResponse(data);
        } catch (err) {
          return jsonResponse({ error: err.message }, 500);
        }
      }

      // ----------------------------------------------------
      // SETTINGS & SYSTEM STATUS ENDPOINT
      // ----------------------------------------------------
      if (pathname === '/api/admin/settings/status' && request.method === 'GET') {
        return jsonResponse({
          database: { connected: Boolean(env.DB), name: 'knockoutnotes-db' },
          mailersend: { configured: Boolean(env.MAILERSEND_API_TOKEN), from_email: env.FROM_EMAIL || 'Not configured' },
          r2_storage: { configured: isR2Configured(env), bucket: isR2Configured(env) ? 'Bound' : 'Not bound' },
          analytics: {
            configured: Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ZONE_ID),
            rum_configured: Boolean(env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_ACCOUNT_ID && env.CF_BEACON_TOKEN)
          },
          site_url: getSiteUrl(request, env),
          admin_username: env.ADMIN_USERNAME || 'admin.knockoutnotes'
        });
      }
    }

    // ==========================================
    // PUBLIC ASSET SERVING FROM R2 (/api/files/*)
    // ==========================================
    if (pathname.startsWith('/api/files/')) {
      const storageKey = pathname.replace('/api/files/', '');
      return serveFile(storageKey, env, request);
    }




    // ==========================================
    // 5. STATIC ASSET FALLBACK (100% OF SITE FILES)
    // ==========================================
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Not Found', { status: 404 });
  }
};
