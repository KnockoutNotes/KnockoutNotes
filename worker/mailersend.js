/**
 * KnockoutNotes MailerSend API Client & Email Logger
 *
 * Implements delivery via MailerSend REST API (POST https://api.mailersend.com/v1/email)
 * while preserving the exact email-sending interface, D1 email_logs tracking,
 * and rate-limit safety used by KnockoutNotes.
 */

// TEMPORARY MAILERSEND SANDBOX TEST SENDER:
// Uses the verified MailerSend test domain: test-86org8e1w31gew13.mlsender.net
// Replace with verified custom domain sender (e.g. notifications@knockoutnotes.com) once domain DNS is configured.
const DEFAULT_TEST_SENDER_EMAIL = 'notifications@test-86org8e1w31gew13.mlsender.net';
const DEFAULT_SENDER_NAME = 'KnockoutNotes';

/**
 * Parse a 'from' specification into { email, name }
 * Handles:
 *  - "Name <email@domain.com>"
 *  - "email@domain.com"
 *  - { email, name }
 *  - undefined / null (defaults to test domain sender)
 */
export function parseSender(fromInput) {
  if (!fromInput) {
    return { email: DEFAULT_TEST_SENDER_EMAIL, name: DEFAULT_SENDER_NAME };
  }

  if (typeof fromInput === 'object' && fromInput.email) {
    return {
      email: String(fromInput.email).trim().toLowerCase(),
      name: String(fromInput.name || DEFAULT_SENDER_NAME).trim()
    };
  }

  if (typeof fromInput === 'string') {
    const trimmed = fromInput.trim();
    // Match format: "Display Name <email@domain.com>"
    const rfcMatch = trimmed.match(/^(.*?)\s*<([^>]+)>$/);
    if (rfcMatch) {
      const parsedName = rfcMatch[1].replace(/["']/g, '').trim();
      const parsedEmail = rfcMatch[2].trim().toLowerCase();
      return {
        email: parsedEmail || DEFAULT_TEST_SENDER_EMAIL,
        name: parsedName || DEFAULT_SENDER_NAME
      };
    }
    // Single email address string
    return {
      email: trimmed.toLowerCase(),
      name: DEFAULT_SENDER_NAME
    };
  }

  return { email: DEFAULT_TEST_SENDER_EMAIL, name: DEFAULT_SENDER_NAME };
}

/**
 * Normalize recipient(s) to MailerSend array of { email, name? }
 */
function normalizeRecipients(to) {
  if (Array.isArray(to)) {
    return to.map(entry => {
      if (typeof entry === 'object' && entry !== null && entry.email) {
        return {
          email: String(entry.email).trim().toLowerCase(),
          ...(entry.name ? { name: String(entry.name).trim() } : {})
        };
      }
      return { email: String(entry).trim().toLowerCase() };
    });
  }

  if (typeof to === 'object' && to !== null && to.email) {
    return [{
      email: String(to.email).trim().toLowerCase(),
      ...(to.name ? { name: String(to.name).trim() } : {})
    }];
  }

  return [{ email: String(to).trim().toLowerCase() }];
}

/**
 * Send an email through MailerSend REST API and log to D1
 *
 * @param {Object} options
 * @param {string} options.apiKey - env.MAILERSEND_API_TOKEN
 * @param {string|Object} [options.from] - Sender string ("Name <email>") or object
 * @param {string|Array} options.to - Recipient email or array of recipients
 * @param {string} options.subject - Email subject
 * @param {string} [options.html] - HTML body
 * @param {string} [options.text] - Plain text body
 * @param {string} [options.emailType] - 'confirmation' | 'welcome' | 'admin_alert' | 'notification' | 'broadcast'
 * @param {number|string} [options.eventId] - Optional notification_events ID
 * @param {Object} [options.db] - Cloudflare D1 Database binding
 */
export async function sendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
  text,
  emailType = 'transactional',
  eventId = null,
  db = null
}) {
  const recipients = normalizeRecipients(to);
  const primaryRecipient = recipients[0]?.email || 'unknown';

  if (!apiKey) {
    console.warn(`[MailerSend] MAILERSEND_API_TOKEN is not configured. Email to ${primaryRecipient} was skipped.`);
    if (db) {
      await logEmailAttempt(db, {
        recipient: primaryRecipient,
        emailType,
        status: 'failed',
        errorMessage: 'MAILERSEND_API_TOKEN missing in environment',
        eventId
      });
    }
    return { success: false, error: 'MAILERSEND_API_TOKEN is missing' };
  }

  const sender = parseSender(from);

  try {
    const payload = {
      from: {
        email: sender.email,
        name: sender.name
      },
      to: recipients,
      subject,
      html: html || undefined,
      text: text || undefined
    };

    const res = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Capture MailerSend message ID from response headers
    const messageId = res.headers.get('x-message-id') || null;

    let responseData = null;
    let rawText = '';
    try {
      rawText = await res.text();
      if (rawText) {
        responseData = JSON.parse(rawText);
      }
    } catch (_) {
      // Non-JSON response body or empty body (common on 202 Accepted)
    }

    // Treat HTTP 2xx (including 200 and 202 Accepted) as successful
    if (!res.ok) {
      let errMessage = `HTTP ${res.status}`;
      if (responseData?.message) {
        errMessage = responseData.message;
        if (responseData.errors && typeof responseData.errors === 'object') {
          const details = Object.entries(responseData.errors)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join('; ');
          if (details) errMessage += ` (${details})`;
        }
      } else if (rawText) {
        errMessage = `HTTP ${res.status}: ${rawText.slice(0, 300)}`;
      }

      // Ensure no raw tokens or auth headers ever leak into logs
      errMessage = errMessage.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');

      console.error(`[MailerSend Error] to: ${primaryRecipient}, error: ${errMessage}`);
      if (db) {
        await logEmailAttempt(db, {
          recipient: primaryRecipient,
          emailType,
          status: 'failed',
          errorMessage: errMessage,
          eventId
        });
      }
      return { success: false, error: errMessage };
    }

    // Prefer header x-message-id, fallback to body id/data.id if present
    const resolvedId = messageId || responseData?.id || responseData?.data?.id || null;

    if (db) {
      await logEmailAttempt(db, {
        recipient: primaryRecipient,
        emailType,
        status: 'sent',
        messageId: resolvedId,
        eventId
      });
    }

    return { success: true, id: resolvedId };
  } catch (err) {
    let sanitizedError = (err?.message || String(err)).replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED]');
    console.error(`[MailerSend Exception] to: ${primaryRecipient}:`, sanitizedError);
    if (db) {
      await logEmailAttempt(db, {
        recipient: primaryRecipient,
        emailType,
        status: 'failed',
        errorMessage: sanitizedError,
        eventId
      });
    }
    return { success: false, error: sanitizedError };
  }
}

/**
 * Log email send attempt to D1
 * Maps MailerSend message ID into existing resend_id column so D1 schema is preserved unchanged.
 */
async function logEmailAttempt(db, { recipient, emailType, status, messageId = null, errorMessage = null, eventId = null }) {
  try {
    await db
      .prepare(`
        INSERT INTO email_logs (recipient_email, email_type, status, resend_id, error_message, event_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(recipient, emailType, status, messageId, errorMessage, eventId)
      .run();
  } catch (logErr) {
    console.error('[D1 Email Log Error]:', logErr);
  }
}

/**
 * Send emails to multiple recipients with safe rate-limiting throttle
 * Sequential processing with ~550ms delay keeps requests well within MailerSend limits.
 */
export async function sendBulkEmails({
  apiKey,
  from,
  recipients, // array of { email, unsubscribeToken }
  renderFn, // function({ unsubscribeToken, email }) returning { subject, html, text }
  emailType,
  eventId,
  db
}) {
  const results = {
    total: recipients.length,
    sent: 0,
    failed: 0,
    errors: []
  };

  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < recipients.length; i++) {
    const subscriber = recipients[i];
    const { subject, html, text } = renderFn(subscriber);

    const res = await sendEmail({
      apiKey,
      from,
      to: subscriber.email,
      subject,
      html,
      text,
      emailType,
      eventId,
      db
    });

    if (res.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({ email: subscriber.email, error: res.error });
    }

    // Rate-limit throttle: ~550ms delay between requests to stay safe
    if (i < recipients.length - 1) {
      await delay(550);
    }
  }

  return results;
}
