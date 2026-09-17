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

import { sendEmail, sendBulkEmails } from './resend.js';

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

        const verificationToken = generateSecureToken(24);
        const unsubscribeToken = generateSecureToken(24);
        // Expiration: 48 hours from now
        const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

        if (existing) {
          if (existing.status === 'active') {
            return jsonResponse({
              success: true,
              message: 'You are already subscribed to KnockoutNotes updates!'
            });
          }

          if (existing.status === 'banned') {
            return jsonResponse({ error: 'Unable to subscribe this email address.' }, 403);
          }

          // Existing pending or unsubscribed subscriber -> refresh token and re-send verification
          await env.DB
            .prepare(`
              UPDATE subscribers 
              SET verification_token = ?, verification_expires_at = ?, status = 'pending', updated_at = datetime('now')
              WHERE id = ?
            `)
            .bind(verificationToken, expiresAt, existing.id)
            .run();
        } else {
          // New subscriber insert
          await env.DB
            .prepare(`
              INSERT INTO subscribers (email, name, status, verification_token, verification_expires_at, unsubscribe_token, source_page, created_at, updated_at)
              VALUES (?, ?, 'pending', ?, ?, ?, ?, datetime('now'), datetime('now'))
            `)
            .bind(email, name || null, verificationToken, expiresAt, unsubscribeToken, sourcePage)
            .run();
        }

        // Dispatch verification email in background
        const emailTemplate = renderVerificationEmail({ siteUrl, verificationToken, email });
        ctx.waitUntil(
          sendEmail({
            apiKey: env.RESEND_API_KEY,
            from: env.FROM_EMAIL,
            to: email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
            emailType: 'confirmation',
            db: env.DB
          })
        );

        return jsonResponse({
          success: true,
          message: 'Confirmation email sent! Please check your inbox and verify your subscription.'
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
          unsubscribeToken: subscriber.unsubscribe_token,
          email: subscriber.email
        });

        ctx.waitUntil(
          sendEmail({
            apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
              apiKey: env.RESEND_API_KEY,
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
    }

    // ==========================================
    // 4. ADMIN HTML INTERCEPTION & PROTECTION
    // ==========================================
    // Protect /admin and /admin/index.html on the server level
    if (pathname === '/admin' || pathname === '/admin/' || pathname === '/admin/index.html') {
      const cookies = parseCookies(request);
      const session = await validateAdminSession(env.DB, cookies.admin_session);
      const siteUrl = getSiteUrl(request, env);

      if (!session) {
        return redirectResponse(`${siteUrl}/admin/login.html`);
      }

      // If authenticated and path is /admin or /admin/, serve admin/index.html via ASSETS
      if (env.ASSETS) {
        const adminIndexReq = new Request(new URL('/admin/index.html', request.url), request);
        return env.ASSETS.fetch(adminIndexReq);
      }
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
