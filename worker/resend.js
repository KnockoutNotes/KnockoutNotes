/**
 * KnockoutNotes Resend API Client & Email Logger
 */

/**
 * Send an email through Resend REST API and log to D1
 */
export async function sendEmail({
  apiKey,
  from,
  to,
  subject,
  html,
  text,
  emailType,
  eventId = null,
  db = null
}) {
  if (!apiKey) {
    console.warn(`[Resend] RESEND_API_KEY is not configured. Email to ${to} was skipped.`);
    if (db) {
      await logEmailAttempt(db, {
        recipient: to,
        emailType,
        status: 'failed',
        errorMessage: 'RESEND_API_KEY missing in environment',
        eventId
      });
    }
    return { success: false, error: 'RESEND_API_KEY is missing' };
  }

  const sender = from || 'KnockoutNotes <onboarding@resend.dev>';

  try {
    const payload = {
      from: sender,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text
    };

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      const errMessage = data?.message || `HTTP ${res.status}: ${JSON.stringify(data)}`;
      console.error(`[Resend Error] to: ${to}, error: ${errMessage}`);
      if (db) {
        await logEmailAttempt(db, {
          recipient: to,
          emailType,
          status: 'failed',
          errorMessage: errMessage,
          eventId
        });
      }
      return { success: false, error: errMessage };
    }

    const resendId = data?.id || null;
    if (db) {
      await logEmailAttempt(db, {
        recipient: to,
        emailType,
        status: 'sent',
        resendId,
        eventId
      });
    }

    return { success: true, id: resendId };
  } catch (err) {
    console.error(`[Resend Exception] to: ${to}:`, err);
    if (db) {
      await logEmailAttempt(db, {
        recipient: to,
        emailType,
        status: 'failed',
        errorMessage: err.message,
        eventId
      });
    }
    return { success: false, error: err.message };
  }
}

/**
 * Log email send attempt to D1
 */
async function logEmailAttempt(db, { recipient, emailType, status, resendId = null, errorMessage = null, eventId = null }) {
  try {
    await db
      .prepare(`
        INSERT INTO email_logs (recipient_email, email_type, status, resend_id, error_message, event_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      .bind(recipient, emailType, status, resendId, errorMessage, eventId)
      .run();
  } catch (logErr) {
    console.error('[D1 Email Log Error]:', logErr);
  }
}

/**
 * Send emails to multiple recipients with gentle throttling
 * Concurrency limit 2 to respect Resend rate limits
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

    // Rate-limit throttle: ~550ms delay every request to safely stay within 2 req/sec
    if (i < recipients.length - 1) {
      await delay(550);
    }
  }

  return results;
}
