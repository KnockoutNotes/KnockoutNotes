/**
 * KnockoutNotes Cashfree LIVE Payment Gateway & Chapter Entitlements Controller
 * Implements Cashfree Production API (2023-08-01), Order Creation, Server-Side
 * Verification, Webhook Signature Validation, Admin Exemption, and Secure PDF Delivery.
 */

import { timingSafeEqual, generateSecureToken, parseCookies, validateAdminSession } from './auth.js';
import { generateChapterPdf } from './pdf-generator.js';
import { STUDY_TOPICS } from './study-topics.js';

// Production API Base URL (Live directly — per strict project requirement)
const CASHFREE_LIVE_BASE_URL = 'https://api.cashfree.com/pg';

// Designated Administrator Accounts Allowlist
const ADMIN_EMAILS = new Set([
  'kmaneesh1997@gmail.com'
]);

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...headers
    }
  });
}

function getSiteUrl(request, env) {
  if (env.SITE_URL) return env.SITE_URL.replace(/\/$/, '');
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Robust server-side verification of Administrator Status
 * Never trusts frontend flags or client request parameters!
 */
export async function isServerAdmin(userAuth, env, request = null) {
  if (userAuth && userAuth.user && userAuth.user.email) {
    const userEmail = userAuth.user.email.trim().toLowerCase();
    if (ADMIN_EMAILS.has(userEmail)) return true;
    const envAdmin = (env.ADMIN_NOTIFICATION_EMAIL || env.ADMIN_EMAIL || '').trim().toLowerCase();
    if (envAdmin && userEmail === envAdmin) return true;
  }

  if (request && env && env.DB) {
    try {
      const cookies = parseCookies(request);
      if (cookies.admin_session) {
        const session = await validateAdminSession(env.DB, cookies.admin_session);
        if (session) return true;
      }
    } catch (_) {}
  }

  return false;
}

/**
 * Get canonical Study Topic by ID
 */
export function getChapterContent(chapterId) {
  if (!chapterId) return null;
  return STUDY_TOPICS.find((t) => t.id === chapterId) || null;
}

/**
 * Resolve price for a chapter in INR
 */
export async function getChapterPrice(db, chapterId) {
  if (!db || !chapterId) return 49.0;

  try {
    const custom = await db
      .prepare('SELECT price_inr, is_active FROM chapter_prices WHERE chapter_id = ?')
      .bind(chapterId)
      .first();

    if (custom && custom.is_active === 1 && typeof custom.price_inr === 'number') {
      return custom.price_inr;
    }

    const fallback = await db
      .prepare('SELECT price_inr FROM chapter_prices WHERE chapter_id = ?')
      .bind('default')
      .first();

    if (fallback && typeof fallback.price_inr === 'number') {
      return fallback.price_inr;
    }
  } catch (err) {
    console.warn('[Pricing Lookup Error, using default ₹49]:', err);
  }

  return 49.0;
}

/**
 * Check if user is entitled to a chapter
 */
export async function checkUserEntitlement(db, userId, chapterId) {
  if (!db || !userId || !chapterId) return false;
  try {
    const row = await db
      .prepare('SELECT id FROM chapter_entitlements WHERE user_id = ? AND chapter_id = ?')
      .bind(userId, chapterId)
      .first();
    return !!row;
  } catch (err) {
    console.error('[Entitlement Check Error]:', err);
    return false;
  }
}

/**
 * Grant entitlement to user for a chapter
 */
export async function grantUserEntitlement(db, userId, userEmail, chapterId, orderId = null, grantedBy = 'payment') {
  if (!db || !userId || !chapterId) return false;
  try {
    await db
      .prepare(`
        INSERT INTO chapter_entitlements (user_id, user_email, chapter_id, order_id, granted_by, created_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, chapter_id) DO UPDATE SET
          order_id = COALESCE(excluded.order_id, chapter_entitlements.order_id),
          granted_by = excluded.granted_by
      `)
      .bind(userId, userEmail, chapterId, orderId, grantedBy)
      .run();
    return true;
  } catch (err) {
    console.error('[Grant Entitlement Error]:', err);
    return false;
  }
}

/**
 * --------------------------------------------------------------------------
 * 1. GET CHAPTER PRICING & ENTITLEMENT STATUS
 * GET /api/payments/chapter-price?chapter_id=...
 * --------------------------------------------------------------------------
 */
export async function handleGetChapterPricing(request, env, userAuth) {
  const url = new URL(request.url);
  const chapterId = (url.searchParams.get('chapter_id') || '').trim();

  if (!chapterId) {
    return jsonResponse({ error: 'Chapter ID is required' }, 400);
  }

  const chapter = getChapterContent(chapterId);
  if (!chapter) {
    return jsonResponse({ error: 'Chapter not found in Study Notes syllabus' }, 404);
  }

  const isAdmin = await isServerAdmin(userAuth, env, request);
  let isPurchased = false;

  if (isAdmin) {
    isPurchased = true;
  } else if (userAuth && userAuth.user) {
    isPurchased = await checkUserEntitlement(env.DB, userAuth.user.id, chapterId);
  }

  const priceInr = await getChapterPrice(env.DB, chapterId);

  return jsonResponse({
    chapterId,
    chapterTitle: chapter.name,
    category: chapter.cat,
    priceInr,
    currency: 'INR',
    isPurchased,
    isAdminExempt: isAdmin,
    downloadUrl: isPurchased ? `/api/study/download-pdf?chapter_id=${encodeURIComponent(chapterId)}` : null
  });
}

/**
 * --------------------------------------------------------------------------
 * 2. CREATE CASHFREE LIVE ORDER
 * POST /api/payments/cashfree/create-order
 * --------------------------------------------------------------------------
 */
export async function handleCreateCashfreeOrder(request, env, userAuth) {
  if (!userAuth || !userAuth.user) {
    return jsonResponse({ error: 'Authentication required. Please log in.', code: 'AUTH_REQUIRED' }, 401);
  }

  const user = userAuth.user;

  try {
    const { chapterId, customerPhone } = await request.json();
    const cleanChapterId = (chapterId || '').trim();

    if (!cleanChapterId) {
      return jsonResponse({ error: 'Valid chapter ID is required.' }, 400);
    }

    const chapter = getChapterContent(cleanChapterId);
    if (!chapter) {
      return jsonResponse({ error: 'Selected study chapter was not found.' }, 404);
    }

    // 1. Check if Administrator
    if (await isServerAdmin(userAuth, env, request)) {
      await grantUserEntitlement(env.DB, user.id, user.email, cleanChapterId, null, 'admin_exempt');
      return jsonResponse({
        success: true,
        adminExempt: true,
        chapterId: cleanChapterId,
        message: 'Administrator verified — Free instant download authorized.',
        downloadUrl: `/api/study/download-pdf?chapter_id=${encodeURIComponent(cleanChapterId)}`
      });
    }

    // 2. Check if already purchased
    const alreadyEntitled = await checkUserEntitlement(env.DB, user.id, cleanChapterId);
    if (alreadyEntitled) {
      return jsonResponse({
        success: true,
        alreadyPurchased: true,
        chapterId: cleanChapterId,
        message: 'Chapter already unlocked.',
        downloadUrl: `/api/study/download-pdf?chapter_id=${encodeURIComponent(cleanChapterId)}`
      });
    }

    // 3. Resolve exact price from database
    const amountInr = await getChapterPrice(env.DB, cleanChapterId);
    const siteUrl = getSiteUrl(request, env);

    // 4. Verify Cashfree Production credentials configuration
    if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
      return jsonResponse({
        error: 'Cashfree payment gateway credentials are not yet configured on the server.',
        code: 'GATEWAY_CREDENTIALS_MISSING',
        missingConfig: ['CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY']
      }, 503);
    }

    // 5. Generate internal unique Order ID
    const orderId = `order_kn_${Date.now()}_${generateSecureToken(4)}`;

    // 6. Call Cashfree LIVE Create Order API
    const cfPayload = {
      order_id: orderId,
      order_amount: Number(amountInr.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: `user_${user.id}`,
        customer_name: (user.name || user.email.split('@')[0]).slice(0, 50),
        customer_email: user.email,
        customer_phone: (customerPhone || '9999999999').replace(/[^0-9]/g, '').slice(-10) || '9999999999'
      },
      order_meta: {
        return_url: `${siteUrl}/study.html?order_id={order_id}&payment_action=verify&chapter_id=${encodeURIComponent(cleanChapterId)}`,
        notify_url: `${siteUrl}/api/payments/cashfree/webhook`,
        payment_methods: 'upi,cc,dc,nb'
      },
      order_note: `KnockoutNotes Chapter: ${chapter.name.slice(0, 40)}`
    };

    const cfHeaders = {
      'x-client-id': env.CASHFREE_APP_ID.trim(),
      'x-client-secret': env.CASHFREE_SECRET_KEY.trim(),
      'x-api-version': env.CASHFREE_API_VERSION || '2023-08-01',
      'Content-Type': 'application/json'
    };

    const cfResponse = await fetch(`${CASHFREE_LIVE_BASE_URL}/orders`, {
      method: 'POST',
      headers: cfHeaders,
      body: JSON.stringify(cfPayload)
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok || !cfData.payment_session_id) {
      console.error('[Cashfree Create Order Error Response]:', cfData);
      return jsonResponse({
        error: cfData.message || 'Failed to initiate secure payment session with Cashfree.',
        code: cfData.code || 'CASHFREE_API_ERROR',
        details: cfData
      }, 502);
    }

    // 7. Store order in D1 database
    await env.DB
      .prepare(`
        INSERT INTO orders (
          order_id, user_id, user_email, chapter_id, chapter_title,
          amount_inr, currency, cf_order_id, payment_session_id,
          payment_status, raw_cf_response, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, datetime('now'), datetime('now'))
      `)
      .bind(
        orderId,
        user.id,
        user.email,
        cleanChapterId,
        chapter.name,
        amountInr,
        'INR',
        String(cfData.cf_order_id || ''),
        cfData.payment_session_id,
        JSON.stringify(cfData)
      )
      .run();

    return jsonResponse({
      success: true,
      orderId,
      cfOrderId: cfData.cf_order_id,
      paymentSessionId: cfData.payment_session_id,
      amountInr,
      currency: 'INR',
      chapterId: cleanChapterId,
      chapterTitle: chapter.name
    });
  } catch (err) {
    console.error('[Create Cashfree Order Exception]:', err);
    return jsonResponse({ error: 'Server error creating payment order: ' + err.message }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 3. VERIFY CASHFREE LIVE ORDER
 * GET /api/payments/cashfree/verify-order?order_id=...
 * --------------------------------------------------------------------------
 */
export async function handleVerifyCashfreeOrder(request, env, userAuth) {
  if (!userAuth || !userAuth.user) {
    return jsonResponse({ error: 'Authentication required' }, 401);
  }

  const url = new URL(request.url);
  const orderId = (url.searchParams.get('order_id') || '').trim();

  if (!orderId) {
    return jsonResponse({ error: 'Order ID is required' }, 400);
  }

  const user = userAuth.user;

  try {
    // 1. Fetch order record from D1
    const order = await env.DB
      .prepare('SELECT * FROM orders WHERE order_id = ?')
      .bind(orderId)
      .first();

    if (!order) {
      return jsonResponse({ error: 'Order record not found' }, 404);
    }

    // Security: Ensure order belongs to authenticated user (unless admin)
    if (order.user_id !== user.id && !(await isServerAdmin(userAuth, env, request))) {
      return jsonResponse({ error: 'Unauthorized to access this order' }, 403);
    }

    // If order is already verified SUCCESS in our DB
    if (order.payment_status === 'SUCCESS') {
      return jsonResponse({
        success: true,
        paymentStatus: 'SUCCESS',
        orderId: order.order_id,
        chapterId: order.chapter_id,
        chapterTitle: order.chapter_title,
        downloadUrl: `/api/study/download-pdf?chapter_id=${encodeURIComponent(order.chapter_id)}`
      });
    }

    // 2. Fetch live status directly from Cashfree Server API
    if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
      return jsonResponse({ error: 'Cashfree credentials not configured on server' }, 503);
    }

    const cfHeaders = {
      'x-client-id': env.CASHFREE_APP_ID.trim(),
      'x-client-secret': env.CASHFREE_SECRET_KEY.trim(),
      'x-api-version': env.CASHFREE_API_VERSION || '2023-08-01',
      'Content-Type': 'application/json'
    };

    const cfOrderRes = await fetch(`${CASHFREE_LIVE_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: cfHeaders
    });

    const cfOrderData = await cfOrderRes.json();

    if (!cfOrderRes.ok) {
      return jsonResponse({
        error: cfOrderData.message || 'Failed to verify order status with Cashfree.',
        paymentStatus: order.payment_status,
        details: cfOrderData
      }, 502);
    }

    // Also fetch payment attempts for reference ID and method
    let cfPaymentId = null;
    let paymentMethod = null;
    try {
      const paymentsRes = await fetch(`${CASHFREE_LIVE_BASE_URL}/orders/${encodeURIComponent(orderId)}/payments`, {
        headers: cfHeaders
      });
      if (paymentsRes.ok) {
        const paymentsList = await paymentsRes.json();
        if (Array.isArray(paymentsList) && paymentsList.length > 0) {
          const successful = paymentsList.find(p => p.payment_status === 'SUCCESS') || paymentsList[0];
          cfPaymentId = String(successful.cf_payment_id || '');
          paymentMethod = successful.payment_group || successful.payment_method || null;
        }
      }
    } catch (e) {
      console.warn('[Fetch Payment Attempts Error]:', e);
    }

    // Cashfree order_status can be: PAID, ACTIVE, EXPIRED, TERMINATED
    if (cfOrderData.order_status === 'PAID') {
      // 3. Mark Order as SUCCESS in DB
      await env.DB
        .prepare(`
          UPDATE orders
          SET payment_status = 'SUCCESS',
              cf_payment_id = COALESCE(?, cf_payment_id),
              payment_method = COALESCE(?, payment_method),
              raw_cf_response = ?,
              verified_at = datetime('now'),
              updated_at = datetime('now')
          WHERE order_id = ?
        `)
        .bind(cfPaymentId, paymentMethod, JSON.stringify(cfOrderData), orderId)
        .run();

      // 4. Grant Entitlement
      await grantUserEntitlement(env.DB, order.user_id, order.user_email, order.chapter_id, orderId, 'payment');

      return jsonResponse({
        success: true,
        paymentStatus: 'SUCCESS',
        orderId: order.order_id,
        chapterId: order.chapter_id,
        chapterTitle: order.chapter_title,
        amountInr: order.amount_inr,
        downloadUrl: `/api/study/download-pdf?chapter_id=${encodeURIComponent(order.chapter_id)}`
      });
    }

    // If order is active or pending
    if (cfOrderData.order_status === 'ACTIVE') {
      return jsonResponse({
        success: false,
        paymentStatus: 'PENDING',
        orderId: order.order_id,
        chapterId: order.chapter_id,
        message: 'Payment is currently pending bank confirmation. Please refresh in a moment.'
      });
    }

    // If expired or failed
    const failedStatus = cfOrderData.order_status === 'EXPIRED' ? 'EXPIRED' : 'FAILED';
    await env.DB
      .prepare(`
        UPDATE orders
        SET payment_status = ?,
            raw_cf_response = ?,
            updated_at = datetime('now')
        WHERE order_id = ?
      `)
      .bind(failedStatus, JSON.stringify(cfOrderData), orderId)
      .run();

    return jsonResponse({
      success: false,
      paymentStatus: failedStatus,
      orderId: order.order_id,
      chapterId: order.chapter_id,
      message: `Payment was not completed (${failedStatus}).`
    });
  } catch (err) {
    console.error('[Verify Cashfree Order Exception]:', err);
    return jsonResponse({ error: 'Server error during verification: ' + err.message }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 4. CASHFREE WEBHOOK HANDLER
 * POST /api/payments/cashfree/webhook
 * --------------------------------------------------------------------------
 */
export async function handleCashfreeWebhook(request, env) {
  const signature = request.headers.get('x-webhook-signature');
  const timestamp = request.headers.get('x-webhook-timestamp');

  if (!signature || !timestamp) {
    return jsonResponse({ error: 'Missing webhook signature headers' }, 401);
  }

  const rawBody = await request.text();

  // Signature verification using Cashfree secret
  const secretKey = env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY;
  if (secretKey) {
    try {
      const encoder = new TextEncoder();
      const dataToSign = encoder.encode(timestamp + rawBody);
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey.trim()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      const sigBuffer = await crypto.subtle.sign('HMAC', key, dataToSign);
      const computedBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBuffer)));

      if (!timingSafeEqual(signature, computedBase64)) {
        console.error('[Cashfree Webhook Signature Mismatch]');
        return jsonResponse({ error: 'Invalid webhook signature' }, 401);
      }
    } catch (err) {
      console.error('[Webhook Signature Verify Error]:', err);
      return jsonResponse({ error: 'Webhook cryptographic verification error' }, 500);
    }
  }

  try {
    const event = JSON.parse(rawBody);
    const orderData = event.data && event.data.order ? event.data.order : null;
    const paymentData = event.data && event.data.payment ? event.data.payment : null;

    const orderId = (orderData && orderData.order_id) || (paymentData && paymentData.order_id) || null;

    if (!orderId) {
      return jsonResponse({ status: 'ignored', reason: 'No order_id in webhook payload' });
    }

    const order = await env.DB
      .prepare('SELECT * FROM orders WHERE order_id = ?')
      .bind(orderId)
      .first();

    if (!order) {
      return jsonResponse({ status: 'ignored', reason: 'Order not found in database' });
    }

    // Process payment success / order paid
    const eventType = event.type || '';
    const isSuccess =
      eventType.includes('PAYMENT_SUCCESS') ||
      eventType.includes('ORDER_PAID') ||
      (paymentData && paymentData.payment_status === 'SUCCESS') ||
      (orderData && orderData.order_status === 'PAID');

    if (isSuccess) {
      const cfPaymentId = paymentData ? String(paymentData.cf_payment_id || '') : null;
      const paymentMethod = paymentData ? (paymentData.payment_group || null) : null;

      // Update Order idempotently
      await env.DB
        .prepare(`
          UPDATE orders
          SET payment_status = 'SUCCESS',
              cf_payment_id = COALESCE(?, cf_payment_id),
              payment_method = COALESCE(?, payment_method),
              raw_cf_response = ?,
              verified_at = COALESCE(verified_at, datetime('now')),
              updated_at = datetime('now')
          WHERE order_id = ?
        `)
        .bind(cfPaymentId, paymentMethod, rawBody, orderId)
        .run();

      // Grant entitlement
      await grantUserEntitlement(env.DB, order.user_id, order.user_email, order.chapter_id, orderId, 'payment');
    }

    return jsonResponse({ status: 'acknowledged' }, 200);
  } catch (err) {
    console.error('[Cashfree Webhook Processing Error]:', err);
    return jsonResponse({ error: 'Internal webhook processing error' }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 5. DOWNLOAD BRANDED CHAPTER PDF
 * GET /api/study/download-pdf?chapter_id=...
 * --------------------------------------------------------------------------
 */
export async function handleDownloadChapterPDF(request, env, userAuth) {
  if (!userAuth || !userAuth.user) {
    return jsonResponse({ error: 'Authentication required. Please sign in to download.' }, 401);
  }

  const url = new URL(request.url);
  const chapterId = (url.searchParams.get('chapter_id') || '').trim();

  if (!chapterId) {
    return jsonResponse({ error: 'Chapter ID is required' }, 400);
  }

  const chapter = getChapterContent(chapterId);
  if (!chapter) {
    return jsonResponse({ error: 'Study chapter not found in syllabus' }, 404);
  }

  const user = userAuth.user;
  const isAdmin = await isServerAdmin(userAuth, env, request);

  // Authorization check: User must be Admin OR have active entitlement in DB
  let isAuthorized = false;

  if (isAdmin) {
    isAuthorized = true;
    await grantUserEntitlement(env.DB, user.id, user.email, chapterId, null, 'admin_exempt');
  } else {
    isAuthorized = await checkUserEntitlement(env.DB, user.id, chapterId);
  }

  if (!isAuthorized) {
    return jsonResponse({
      error: 'Chapter purchase required prior to PDF download.',
      code: 'PURCHASE_REQUIRED',
      chapterId
    }, 403);
  }

  try {
    // Generate branded PDF on demand
    const pdfBytes = await generateChapterPdf(chapter);

    // Track download metric
    try {
      await env.DB
        .prepare(`
          UPDATE chapter_entitlements
          SET download_count = download_count + 1,
              last_downloaded_at = datetime('now')
          WHERE user_id = ? AND chapter_id = ?
        `)
        .bind(user.id, chapterId)
        .run();
    } catch (_) {}

    const sanitizedFilename = `KnockoutNotes_${chapter.short || chapter.id}`.replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf';

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedFilename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Length': String(pdfBytes.length)
      }
    });
  } catch (err) {
    console.error('[PDF Generation Error]:', err);
    return jsonResponse({ error: 'Failed to generate chapter PDF: ' + err.message }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 6. USER PAYMENT HISTORY & PURCHASES
 * GET /api/user/payments
 * --------------------------------------------------------------------------
 */
export async function handleGetUserPaymentHistory(request, env, userAuth) {
  if (!userAuth || !userAuth.user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  const user = userAuth.user;

  try {
    // Fetch user orders
    const orders = await env.DB
      .prepare(`
        SELECT order_id, chapter_id, chapter_title, amount_inr, currency,
               payment_status, cf_payment_id, payment_method, created_at, verified_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `)
      .bind(user.id)
      .all();

    // Fetch user entitlements
    const entitlements = await env.DB
      .prepare(`
        SELECT chapter_id, granted_by, download_count, last_downloaded_at, created_at
        FROM chapter_entitlements
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .bind(user.id)
      .all();

    return jsonResponse({
      orders: orders.results || [],
      entitlements: entitlements.results || [],
      isAdmin: await isServerAdmin(userAuth, env, request)
    });
  } catch (err) {
    console.error('[User Payment History Error]:', err);
    return jsonResponse({ error: 'Failed to retrieve payment records' }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 7. ADMIN: PAYMENT OVERVIEW & CHAPTER PRICING MANAGEMENT
 * GET /api/admin/payments/overview
 * --------------------------------------------------------------------------
 */
export async function handleAdminPaymentsOverview(request, env, userAuth) {
  if (!(await isServerAdmin(userAuth, env, request))) {
    return jsonResponse({ error: 'Administrator access required' }, 403);
  }

  try {
    // Revenue stats
    const stats = await env.DB
      .prepare(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_orders,
          SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount_inr ELSE 0 END) as total_revenue_inr,
          SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed_orders
        FROM orders
      `)
      .first();

    // Recent orders
    const recentOrders = await env.DB
      .prepare(`
        SELECT order_id, user_id, user_email, chapter_id, chapter_title,
               amount_inr, payment_status, cf_payment_id, payment_method, created_at, verified_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 100
      `)
      .all();

    // Chapter pricing list
    const prices = await env.DB
      .prepare('SELECT * FROM chapter_prices ORDER BY chapter_id ASC')
      .all();

    return jsonResponse({
      stats: {
        totalOrders: stats?.total_orders || 0,
        successfulOrders: stats?.successful_orders || 0,
        totalRevenueInr: stats?.total_revenue_inr || 0,
        pendingOrders: stats?.pending_orders || 0,
        failedOrders: stats?.failed_orders || 0
      },
      orders: recentOrders.results || [],
      pricing: prices.results || [],
      gatewayConfig: {
        configured: Boolean(env.CASHFREE_APP_ID && env.CASHFREE_SECRET_KEY),
        app_id_configured: Boolean(env.CASHFREE_APP_ID),
        secret_configured: Boolean(env.CASHFREE_SECRET_KEY),
        webhook_configured: Boolean(env.CASHFREE_WEBHOOK_SECRET || env.CASHFREE_SECRET_KEY),
        environment: 'production',
        api_version: env.CASHFREE_API_VERSION || '2023-08-01'
      }
    });
  } catch (err) {
    console.error('[Admin Payments Overview Error]:', err);
    return jsonResponse({ error: 'Failed to fetch admin payment overview' }, 500);
  }
}

/**
 * --------------------------------------------------------------------------
 * 8. ADMIN: UPDATE CHAPTER PRICING
 * POST /api/admin/payments/pricing
 * --------------------------------------------------------------------------
 */
export async function handleAdminUpdatePricing(request, env, userAuth) {
  if (!(await isServerAdmin(userAuth, env, request))) {
    return jsonResponse({ error: 'Administrator access required' }, 403);
  }

  try {
    const { chapterId, title, category, priceInr, isActive } = await request.json();
    const cleanChapterId = (chapterId || '').trim();

    if (!cleanChapterId) {
      return jsonResponse({ error: 'Chapter ID is required' }, 400);
    }

    const price = typeof priceInr === 'number' && priceInr >= 0 ? priceInr : 49.0;
    const active = isActive === 0 ? 0 : 1;

    let displayTitle = (title || '').trim();
    let displayCat = (category || 'Study Notes').trim();

    if (!displayTitle && cleanChapterId !== 'default') {
      const found = getChapterContent(cleanChapterId);
      if (found) {
        displayTitle = found.name;
        displayCat = found.cat;
      } else {
        displayTitle = cleanChapterId;
      }
    } else if (!displayTitle) {
      displayTitle = 'Standard Chapter PDF';
    }

    await env.DB
      .prepare(`
        INSERT INTO chapter_prices (chapter_id, title, category, price_inr, is_active, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(chapter_id) DO UPDATE SET
          price_inr = excluded.price_inr,
          title = excluded.title,
          category = excluded.category,
          is_active = excluded.is_active,
          updated_at = datetime('now')
      `)
      .bind(cleanChapterId, displayTitle, displayCat, price, active)
      .run();

    return jsonResponse({
      success: true,
      message: `Price for "${displayTitle}" successfully updated to ₹${price}.`,
      chapterId: cleanChapterId,
      priceInr: price
    });
  } catch (err) {
    console.error('[Admin Update Pricing Error]:', err);
    return jsonResponse({ error: 'Failed to update pricing: ' + err.message }, 500);
  }
}
