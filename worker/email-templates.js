/**
 * KnockoutNotes Responsive Email Templates
 * Standard HTML + CSS with inline styles for maximum email client compatibility.
 */

const BASE_STYLES = `
  body { margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; line-height: 1.6; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; overflow: hidden; }
  .header { padding: 32px 28px 24px; text-align: center; background: linear-gradient(180deg, #1e293b 0%, #111827 100%); border-bottom: 1px solid #1f2937; }
  .brand-badge { display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 9999px; margin-bottom: 12px; }
  .header h1 { margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; }
  .header p { margin: 6px 0 0; font-size: 13px; color: #94a3b8; }
  .content { padding: 32px 28px; }
  .content h2 { margin-top: 0; font-size: 20px; font-weight: 700; color: #f8fafc; }
  .content p { margin: 0 0 16px; font-size: 15px; color: #cbd5e1; }
  .highlight-card { background: #1e293b; border-left: 4px solid #38bdf8; border-radius: 6px; padding: 16px 20px; margin: 20px 0; }
  .highlight-card p { margin: 0; font-size: 14px; color: #e2e8f0; }
  .btn-container { text-align: center; margin: 28px 0; }
  .btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4); }
  .btn:hover { background-color: #0369a1; }
  .footer { padding: 24px 28px; background-color: #0b0f19; border-top: 1px solid #1f2937; font-size: 12px; color: #64748b; text-align: center; }
  .footer a { color: #38bdf8; text-decoration: underline; }
  .footer p { margin: 4px 0; }
  .raw-link { word-break: break-all; font-size: 13px; color: #38bdf8; }
`;

function wrapLayout(title, contentHtml, footerHtml = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${BASE_STYLES}</style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="wrapper">
      <div class="header">
        <div class="brand-badge">Clinical Reference</div>
        <h1>KnockoutNotes</h1>
        <p>Anaesthesia & Critical Care Reference Workstation</p>
      </div>
      <div class="content">
        ${contentHtml}
      </div>
      <div class="footer">
        ${footerHtml || `
          <p>&copy; ${new Date().getFullYear()} KnockoutNotes. All rights reserved.</p>
          <p>You are receiving this because you subscribed to updates on KnockoutNotes.</p>
        `}
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 1. Double Opt-In Verification Email
 */
export function renderVerificationEmail({ siteUrl, verificationToken, email }) {
  const verifyUrl = `${siteUrl.replace(/\/$/, '')}/subscribe/verify?token=${encodeURIComponent(verificationToken)}`;
  
  const content = `
    <h2>Verify your email address</h2>
    <p>Thank you for subscribing to KnockoutNotes updates! To complete your subscription and receive notifications when new clinical notes, calculators, or protocols are published, please confirm your email address.</p>
    <div class="btn-container">
      <a href="${verifyUrl}" class="btn" target="_blank">Confirm Subscription</a>
    </div>
    <p style="font-size: 13px; color: #94a3b8;">If the button above does not work, copy and paste this verification URL into your browser:</p>
    <p><a href="${verifyUrl}" class="raw-link">${verifyUrl}</a></p>
    <div class="highlight-card">
      <p>This verification link will expire in 48 hours. If you did not request this subscription, no action is needed — your address will not be subscribed.</p>
    </div>
  `;

  const footer = `
    <p>&copy; ${new Date().getFullYear()} KnockoutNotes &bull; Anaesthesia & Critical Care</p>
    <p>Clinical Reference and Training Workstation</p>
  `;

  const text = `Verify your email address for KnockoutNotes

Thank you for subscribing to KnockoutNotes updates. To complete your subscription, please visit the link below:

${verifyUrl}

This link expires in 48 hours. If you did not request this, you can safely ignore this email.
`;

  return {
    subject: 'Confirm your subscription to KnockoutNotes',
    html: wrapLayout('Confirm your subscription - KnockoutNotes', content, footer),
    text
  };
}

/**
 * 2. Welcome Email
 */
export function renderWelcomeEmail({ siteUrl, unsubscribeToken, email }) {
  const unsubUrl = `${siteUrl.replace(/\/$/, '')}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const content = `
    <h2>Welcome to KnockoutNotes!</h2>
    <p>Your subscription is confirmed. You will now receive notifications whenever new peer-reviewed clinical notes, airway algorithms, anaesthesia calculators, and drug references are published.</p>
    
    <div class="highlight-card">
      <p><strong>Explore Quick Tools:</strong></p>
      <ul style="margin: 8px 0 0; padding-left: 20px; color: #cbd5e1; font-size: 14px;">
        <li><a href="${siteUrl}/notes.html" style="color: #38bdf8;">Clinical Notes & Drug Library</a></li>
        <li><a href="${siteUrl}/calculators.html" style="color: #38bdf8;">Interactive Medical Calculators (ABG, Paediatrics, Infusions)</a></li>
        <li><a href="${siteUrl}/resuscitation-chamber.html" style="color: #38bdf8;">3D Resuscitation Chamber</a></li>
        <li><a href="${siteUrl}/ventilator.html" style="color: #38bdf8;">Interactive Mechanical Ventilator</a></li>
      </ul>
    </div>

    <div class="btn-container">
      <a href="${siteUrl}" class="btn" target="_blank">Open KnockoutNotes Workstation</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">You can manage your subscription or unsubscribe at any time using the link in the footer below.</p>
  `;

  const footer = `
    <p>&copy; ${new Date().getFullYear()} KnockoutNotes &bull; Anaesthesia & Critical Care</p>
    <p><a href="${unsubUrl}">Unsubscribe from all future emails</a></p>
  `;

  const text = `Welcome to KnockoutNotes!

Your subscription is confirmed. You will now receive notifications when new clinical notes and tools are published.

Explore KnockoutNotes: ${siteUrl}
Clinical Notes: ${siteUrl}/notes.html
Calculators: ${siteUrl}/calculators.html

To unsubscribe: ${unsubUrl}
`;

  return {
    subject: 'Welcome to KnockoutNotes — Subscription Confirmed',
    html: wrapLayout('Welcome to KnockoutNotes', content, footer),
    text
  };
}

/**
 * 3. Content Notification Email (Update / Note / Calculator / Resource)
 */
export function renderContentNotificationEmail({ siteUrl, eventType, title, summary, contentUrl, unsubscribeToken }) {
  const targetUrl = contentUrl || siteUrl;
  const unsubUrl = `${siteUrl.replace(/\/$/, '')}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;
  
  const badges = {
    update: { label: 'Programme Update', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    notes: { label: 'New Clinical Note', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)' },
    calculator: { label: 'New Clinical Calculator', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    resource: { label: 'New Resource', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' }
  };

  const badge = badges[eventType] || badges.update;

  const content = `
    <div style="display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: ${badge.color}; background: ${badge.bg}; border-radius: 4px; margin-bottom: 12px;">
      ${badge.label}
    </div>
    <h2>${title}</h2>
    ${summary ? `<p style="font-size: 15px; color: #cbd5e1; white-space: pre-line;">${summary}</p>` : ''}
    
    <div class="btn-container">
      <a href="${targetUrl}" class="btn" target="_blank">View on KnockoutNotes</a>
    </div>
  `;

  const footer = `
    <p>&copy; ${new Date().getFullYear()} KnockoutNotes &bull; Anaesthesia & Critical Care</p>
    <p>Sent to active subscribers &bull; <a href="${unsubUrl}">Unsubscribe</a></p>
  `;

  const text = `[${badge.label}] ${title}

${summary || ''}

View now: ${targetUrl}

To unsubscribe: ${unsubUrl}
`;

  return {
    subject: `KnockoutNotes: ${title}`,
    html: wrapLayout(title, content, footer),
    text
  };
}

/**
 * 4. Broadcast Email
 */
export function renderBroadcastEmail({ siteUrl, subject, message, actionUrl, actionText, unsubscribeToken }) {
  const unsubUrl = `${siteUrl.replace(/\/$/, '')}/unsubscribe?token=${encodeURIComponent(unsubscribeToken)}`;

  const content = `
    <h2>${subject}</h2>
    <div style="font-size: 15px; color: #cbd5e1; white-space: pre-line; margin-bottom: 20px;">
      ${message}
    </div>
    ${actionUrl ? `
      <div class="btn-container">
        <a href="${actionUrl}" class="btn" target="_blank">${actionText || 'Learn More'}</a>
      </div>
    ` : ''}
  `;

  const footer = `
    <p>&copy; ${new Date().getFullYear()} KnockoutNotes &bull; Anaesthesia & Critical Care</p>
    <p>Sent to active subscribers &bull; <a href="${unsubUrl}">Unsubscribe</a></p>
  `;

  const text = `${subject}

${message}

${actionUrl ? `Link: ${actionUrl}` : ''}

To unsubscribe: ${unsubUrl}
`;

  return {
    subject,
    html: wrapLayout(subject, content, footer),
    text
  };
}

/**
 * 5. Admin Notification Emails
 */
export function renderAdminAlertEmail({ type, email, details = {} }) {
  const isSubscribe = type === 'new_subscriber';
  const title = isSubscribe ? 'New Subscriber Confirmed' : 'Subscriber Opt-Out';

  const content = `
    <h2 style="color: ${isSubscribe ? '#10b981' : '#f59e0b'};">${title}</h2>
    <div class="highlight-card">
      <p><strong>Email:</strong> ${email}</p>
      ${details.source ? `<p><strong>Source:</strong> ${details.source}</p>` : ''}
      ${details.date ? `<p><strong>Time:</strong> ${details.date}</p>` : ''}
      ${details.totalActive !== undefined ? `<p><strong>Total Active Subscribers:</strong> ${details.totalActive}</p>` : ''}
    </div>
  `;

  const footer = `
    <p>KnockoutNotes Internal Automated Notification</p>
  `;

  const text = `${title}
Email: ${email}
Time: ${details.date || new Date().toISOString()}
Total Active Subscribers: ${details.totalActive !== undefined ? details.totalActive : 'N/A'}
`;

  return {
    subject: `[KnockoutNotes Alert] ${title}: ${email}`,
    html: wrapLayout(title, content, footer),
    text
  };
}
