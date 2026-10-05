/**
 * KnockoutNotes Cashfree LIVE Payment Gateway & Chapter PDF Client
 * Seamless integration for Study Notes PDF purchases, verification,
 * and post-login resumption across desktop and mobile.
 */

(function () {
  "use strict";

  // Cashfree Production SDK CDN URL
  const CASHFREE_SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

  let cashfreeSdkPromise = null;

  function loadCashfreeSDK() {
    if (window.Cashfree) {
      return Promise.resolve(window.Cashfree);
    }
    if (cashfreeSdkPromise) {
      return cashfreeSdkPromise;
    }
    cashfreeSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CASHFREE_SDK_URL;
      script.async = true;
      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error("Cashfree SDK failed to initialize"));
        }
      };
      script.onerror = () => {
        reject(new Error("Failed to load Cashfree checkout library"));
      };
      document.head.appendChild(script);
    });
    return cashfreeSdkPromise;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg, type = "info") {
    if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.showToast === "function") {
      window.KN_WORKSPACE.showToast(msg, type);
    } else {
      console.log(`[Toast ${type}]:`, msg);
    }
  }

  /**
   * Safe helper to download a PDF URL via temporary link
   */
  function triggerPdfDownload(downloadUrl, filename = "KnockoutNotes_Chapter.pdf") {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 2000);
  }

  /**
   * Modal Management
   */
  let modalEl = null;

  function getOrCreateModal() {
    if (modalEl && document.body.contains(modalEl)) {
      return modalEl;
    }
    modalEl = document.createElement("div");
    modalEl.id = "knPaymentModal";
    modalEl.className = "kn-payment-modal-backdrop";
    modalEl.style.display = "none";
    document.body.appendChild(modalEl);
    return modalEl;
  }

  function closeModal() {
    if (modalEl) {
      modalEl.style.display = "none";
      modalEl.innerHTML = "";
    }
  }

  function resolveDisplayPrice(info) {
    if (typeof info?.priceInr === 'number' && !isNaN(info.priceInr) && info.priceInr !== 49) {
      return info.priceInr;
    }
    const cat = String(info?.category || '').toLowerCase();
    const id = String(info?.chapterId || '').toLowerCase();
    const drugCats = ['induction', 'relaxants', 'reversal', 'opioids', 'nsaids', 'vasopressors', 'antihypertensives', 'alpha2', 'local', 'steroids', 'antidiabetics', 'pregnancy', 'miscellaneous', 'drugs'];
    if (drugCats.includes(cat)) return 12;
    const critCats = ['cc_principles', 'cc_airway', 'cc_respiratory', 'cc_hemodynamics', 'cc_sepsis', 'cc_neuro', 'cc_cardio', 'cc_renal', 'cc_gi', 'cc_trauma', 'cc_tox', 'cc_heme', 'cc_obs', 'cc_peds', 'cc_pharm', 'cc_advances', 'critical_care', 'critical', 'shock', 'respiratory', 'abg', 'antibiotics', 'poisoning'];
    if (critCats.includes(cat) || cat.startsWith('cc_') || cat.startsWith('cc-') || id.startsWith('cc-') || id.startsWith('cc_')) return 19;
    return 9;
  }

  /**
   * Render Purchase Confirmation Modal
   */
  function renderPurchaseModal(info) {
    const displayPrice = resolveDisplayPrice(info);
    const modal = getOrCreateModal();
    modal.innerHTML = `
      <div class="kn-payment-modal-card">
        <button type="button" class="kn-payment-modal-close" id="knPayModalClose" aria-label="Close">✕</button>

        <div class="kn-pay-header">
          <div class="kn-pay-badge">Official Study Notes PDF</div>
          <h3 class="kn-pay-title">${esc(info.chapterTitle || "Study Chapter")}</h3>
          <span class="kn-pay-cat">${esc(info.category || "Study Notes")}</span>
        </div>

        <div class="kn-pay-features">
          <div class="kn-pay-feat-item">
            <span class="kn-feat-icon">📄</span>
            <span>Comprehensive A4 format formatted for print &amp; tablet reading</span>
          </div>
          <div class="kn-pay-feat-item">
            <span class="kn-feat-icon">📊</span>
            <span>Complete clinical data, high-yield tables, and drug monographs</span>
          </div>
          <div class="kn-pay-feat-item">
            <span class="kn-feat-icon">🔒</span>
            <span>Permanent access &amp; unlimited re-downloads from your profile</span>
          </div>
        </div>

        <div class="kn-pay-pricing-box">
          <div class="kn-pay-price-label">Instant Access Fee</div>
          <div class="kn-pay-price-amount">₹${esc(displayPrice)} <span class="kn-pay-currency">INR</span></div>
          <div class="kn-pay-tax-note">Inclusive of all taxes &bull; Secured by Cashfree LIVE</div>
        </div>

        <div id="knPayModalError" class="kn-pay-error" style="display:none;"></div>

        <div class="kn-pay-actions">
          <button type="button" class="kn-btn kn-pay-submit-btn" id="knPayConfirmBtn">
            <span>Pay ₹${esc(displayPrice)} &amp; Download PDF</span>
          </button>
          <button type="button" class="kn-btn kn-pay-cancel-btn" id="knPayCancelBtn">Cancel</button>
        </div>

        <div class="kn-pay-footer-note">
          Supports UPI (GPay, PhonePe, Paytm), Debit/Credit Cards &amp; NetBanking.
        </div>
      </div>
    `;

    modal.style.display = "flex";

    document.getElementById("knPayModalClose")?.addEventListener("click", closeModal);
    document.getElementById("knPayCancelBtn")?.addEventListener("click", closeModal);

    document.getElementById("knPayConfirmBtn")?.addEventListener("click", async () => {
      const btn = document.getElementById("knPayConfirmBtn");
      const errBox = document.getElementById("knPayModalError");
      if (errBox) errBox.style.display = "none";

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="kn-pay-spinner"></span> Connecting to Cashfree LIVE...`;
      }

      try {
        await startCashfreeCheckout(info.chapterId, info.chapterTitle);
      } catch (err) {
        console.error("[Payment Checkout Error]:", err);
        if (errBox) {
          errBox.textContent = err.message || "Failed to initiate payment. Please try again.";
          errBox.style.display = "block";
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Pay ₹${esc(info.priceInr || 49)} &amp; Download PDF</span>`;
        }
      }
    });
  }

  /**
   * Render Downloading / Success State inside modal
   */
  function renderSuccessModal(downloadUrl, title) {
    const modal = getOrCreateModal();
    modal.innerHTML = `
      <div class="kn-payment-modal-card kn-pay-success-card">
        <div class="kn-pay-success-icon">✓</div>
        <h3 class="kn-pay-title" style="margin-top:12px;">Payment Verified!</h3>
        <p style="color:var(--kn-ws-text-muted); font-size:14px; margin:8px 0 20px;">
          Your official study notes PDF for <strong>${esc(title)}</strong> is ready.
        </p>

        <a href="${esc(downloadUrl)}" class="kn-btn kn-pay-submit-btn" id="knDirectDownloadLink" download>
          <span>📥 Download PDF Now</span>
        </a>

        <p style="font-size:12px; color:var(--kn-ws-text-muted); margin-top:16px;">
          If your download did not start automatically, click the button above. You can also re-download this chapter anytime from your profile.
        </p>

        <button type="button" class="kn-btn kn-pay-cancel-btn" style="margin-top:10px;" id="knSuccessCloseBtn">Close</button>
      </div>
    `;

    modal.style.display = "flex";
    document.getElementById("knSuccessCloseBtn")?.addEventListener("click", closeModal);

    // Auto trigger download
    triggerPdfDownload(downloadUrl, `KnockoutNotes_${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
  }

  /**
   * Step 1 & 2: Main Entry Point — Initiate Chapter Download
   */
  async function initiateChapterDownload(chapterId, fallbackTitle = "") {
    if (!chapterId) return;

    // 1. Auth Check: If not logged in, save pending action and prompt sign-in
    const isLoggedIn = window.KN_WORKSPACE && typeof window.KN_WORKSPACE.isLoggedIn === "function"
      ? window.KN_WORKSPACE.isLoggedIn()
      : false;

    if (!isLoggedIn) {
      try {
        localStorage.setItem("kn_pending_post_login_action", JSON.stringify({
          type: "download_pdf",
          chapterId: chapterId,
          chapterTitle: fallbackTitle,
          returnUrl: window.location.href,
          timestamp: Date.now()
        }));
      } catch (_) {}

      showToast("Please sign in or create a free account to download chapter PDFs.", "info");

      if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.openAuthModal === "function") {
        window.KN_WORKSPACE.openAuthModal("signin");
      } else {
        window.location.href = `workspace.html?return=${encodeURIComponent(window.location.href)}#profile`;
      }
      return;
    }

    // 2. User is logged in: Check price and existing entitlement status
    try {
      showToast("Checking chapter entitlement...", "info");

      const res = await fetch(`/api/payments/chapter-price?chapter_id=${encodeURIComponent(chapterId)}`, {
        credentials: "include"
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Unable to check chapter pricing");
      }

      const info = await res.json();

      // If user has already purchased OR is Server-Verified Admin:
      if (info.isPurchased || info.isAdminExempt) {
        showToast(
          info.isAdminExempt
            ? "Administrator verified — generating PDF monograph..."
            : "Chapter already unlocked — generating latest PDF monograph...",
          "success"
        );
        const downloadUrl = info.downloadUrl || `/api/study/download-pdf?chapter_id=${encodeURIComponent(chapterId)}`;
        triggerPdfDownload(downloadUrl, `KnockoutNotes_${(info.chapterTitle || chapterId).replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
        return;
      }

      // Non-admin, unpurchased: Display purchase confirmation modal
      renderPurchaseModal(info);
    } catch (err) {
      console.error("[Initiate Download Error]:", err);
      showToast(err.message || "Could not retrieve chapter details", "error");
    }
  }

  /**
   * Step 3: Call Backend Create Order & Launch Cashfree Live Hosted Checkout
   */
  async function startCashfreeCheckout(chapterId, chapterTitle) {
    // 1. Create Order on Backend
    const orderRes = await fetch("/api/payments/cashfree/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ chapterId })
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error(orderData.error || "Failed to initialize order");
    }

    // If server granted free access (admin bypass)
    if (orderData.adminExempt && orderData.downloadUrl) {
      showToast("Administrator access confirmed. Downloading PDF...", "success");
      renderSuccessModal(orderData.downloadUrl, chapterTitle || chapterId);
      return;
    }

    const paymentSessionId = orderData.paymentSessionId;
    const orderId = orderData.orderId;

    if (!paymentSessionId) {
      throw new Error("Payment session was not returned by gateway");
    }

    // 2. Load Cashfree SDK v3
    const CashfreeClass = await loadCashfreeSDK();
    const cashfree = CashfreeClass({ mode: "production" });

    // 3. Launch Checkout Modal
    const checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: "_modal"
    };

    cashfree.checkout(checkoutOptions).then(async (result) => {
      if (result.error) {
        console.warn("[Cashfree Checkout Error]:", result.error);
        const errBox = document.getElementById("knPayModalError");
        if (errBox) {
          errBox.textContent = result.error.message || "Payment cancelled or failed. Please try again.";
          errBox.style.display = "block";
        }
        const btn = document.getElementById("knPayConfirmBtn");
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>Retry Payment</span>`;
        }
        return;
      }

      if (result.paymentDetails || result.redirect) {
        // Customer completed payment or returned from flow: Verify on backend
        await verifyOrderAndDeliverPdf(orderId, chapterTitle || chapterId);
      }
    });
  }

  /**
   * Step 4: Server-Side Payment Verification & PDF Delivery
   */
  async function verifyOrderAndDeliverPdf(orderId, chapterTitle) {
    const btn = document.getElementById("knPayConfirmBtn");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="kn-pay-spinner"></span> Verifying payment with bank...`;
    }

    try {
      const res = await fetch(`/api/payments/cashfree/verify-order?order_id=${encodeURIComponent(orderId)}`, {
        credentials: "include"
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed");
      }

      if (data.success && data.paymentStatus === "SUCCESS") {
        showToast("Payment verified successfully!", "success");
        renderSuccessModal(data.downloadUrl, chapterTitle);
      } else if (data.paymentStatus === "PENDING") {
        const errBox = document.getElementById("knPayModalError");
        if (errBox) {
          errBox.innerHTML = `
            Payment is pending bank confirmation.
            <button type="button" class="kn-btn kn-btn-secondary" style="margin-top:8px; padding:4px 12px; font-size:12px;" onclick="window.KN_PAYMENTS.verifyOrderAndDeliverPdf('${esc(orderId)}', '${esc(chapterTitle)}')">
              Check Status Again
            </button>
          `;
          errBox.style.display = "block";
        }
      } else {
        throw new Error(data.message || `Payment ${data.paymentStatus || 'incomplete'}`);
      }
    } catch (err) {
      console.error("[Verify Order Exception]:", err);
      const errBox = document.getElementById("knPayModalError");
      if (errBox) {
        errBox.textContent = err.message || "Could not verify payment.";
        errBox.style.display = "block";
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>Check Payment Status</span>`;
      }
    }
  }

  /**
   * User Profile: Fetch and render user orders & entitlements
   */
  async function loadUserPaymentHistory() {
    try {
      const res = await fetch("/api/user/payments", { credentials: "include" });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("[Load Payment History Error]:", err);
      return null;
    }
  }

  /**
   * Admin Console: Load admin overview
   */
  async function loadAdminPaymentsOverview() {
    try {
      const res = await fetch("/api/admin/payments/overview", { credentials: "include" });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("[Load Admin Payments Error]:", err);
      return null;
    }
  }

  /**
   * Admin Console: Update chapter price
   */
  async function updateChapterPrice(chapterId, priceInr, title = "", category = "") {
    try {
      const res = await fetch("/api/admin/payments/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          chapterId,
          priceInr: Number(priceInr),
          title,
          category,
          isActive: 1
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update price");
      return data;
    } catch (err) {
      console.error("[Update Pricing Error]:", err);
      throw err;
    }
  }

  // Inject Modal & Button Styles
  function injectStyles() {
    if (document.getElementById("kn-payments-styles")) return;
    const style = document.createElement("style");
    style.id = "kn-payments-styles";
    style.textContent = `
      .kn-download-pdf-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 16px;
        background: linear-gradient(135deg, #e11d48, #be123c);
        color: #ffffff !important;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 9999px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        text-decoration: none;
        white-space: nowrap;
      }
      .kn-download-pdf-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(225, 29, 72, 0.5);
        background: linear-gradient(135deg, #f43f5e, #e11d48);
      }
      .kn-download-pdf-btn:active {
        transform: translateY(0);
      }
      .kn-download-pdf-btn .kn-download-icon {
        stroke: #ffffff;
        width: 15px;
        height: 15px;
      }
      .kn-payment-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .kn-payment-modal-card {
        background: #11141d;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 20px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(225, 29, 72, 0.2);
        max-width: 480px;
        width: 100%;
        padding: 28px;
        position: relative;
        color: #f1f5f9;
        animation: knPayModalFadeIn 0.25s ease-out;
      }
      @keyframes knPayModalFadeIn {
        from { opacity: 0; transform: scale(0.96) translateY(8px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      .kn-payment-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(255, 255, 255, 0.08);
        border: none;
        color: #94a3b8;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.15s;
      }
      .kn-payment-modal-close:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
      }
      .kn-pay-header {
        margin-bottom: 20px;
      }
      .kn-pay-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        background: rgba(225, 29, 72, 0.18);
        color: #fb7185;
        padding: 3px 10px;
        border-radius: 9999px;
        margin-bottom: 8px;
        border: 1px solid rgba(225, 29, 72, 0.3);
      }
      .kn-pay-title {
        font-size: 20px;
        font-weight: 700;
        margin: 0 0 4px;
        color: #ffffff;
        line-height: 1.3;
      }
      .kn-pay-cat {
        font-size: 12.5px;
        color: #94a3b8;
      }
      .kn-pay-features {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 22px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 14px 16px;
        border-radius: 12px;
      }
      .kn-pay-feat-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        font-size: 13px;
        line-height: 1.4;
        color: #cbd5e1;
      }
      .kn-feat-icon {
        font-size: 15px;
        flex-shrink: 0;
      }
      .kn-pay-pricing-box {
        text-align: center;
        background: linear-gradient(180deg, rgba(225, 29, 72, 0.12), rgba(225, 29, 72, 0.04));
        border: 1px solid rgba(225, 29, 72, 0.3);
        border-radius: 14px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .kn-pay-price-label {
        font-size: 12px;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 2px;
      }
      .kn-pay-price-amount {
        font-size: 32px;
        font-weight: 800;
        color: #ffffff;
      }
      .kn-pay-currency {
        font-size: 16px;
        font-weight: 600;
        color: #fb7185;
      }
      .kn-pay-tax-note {
        font-size: 11.5px;
        color: #64748b;
        margin-top: 4px;
      }
      .kn-pay-error {
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.35);
        color: #fca5a5;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 13px;
        margin-bottom: 16px;
        line-height: 1.4;
      }
      .kn-pay-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .kn-pay-submit-btn {
        background: linear-gradient(135deg, #e11d48, #be123c);
        color: #ffffff;
        border: none;
        border-radius: 10px;
        padding: 13px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 4px 16px rgba(225, 29, 72, 0.4);
        transition: all 0.2s;
        text-decoration: none;
      }
      .kn-pay-submit-btn:hover {
        background: linear-gradient(135deg, #f43f5e, #e11d48);
        transform: translateY(-1px);
        box-shadow: 0 6px 22px rgba(225, 29, 72, 0.55);
      }
      .kn-pay-submit-btn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
        transform: none;
      }
      .kn-pay-cancel-btn {
        background: transparent;
        color: #94a3b8;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 10px;
        font-size: 13.5px;
        cursor: pointer;
      }
      .kn-pay-cancel-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.05);
      }
      .kn-pay-footer-note {
        font-size: 11px;
        color: #64748b;
        text-align: center;
        margin-top: 14px;
      }
      .kn-pay-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: knPaySpin 0.8s linear infinite;
        display: inline-block;
      }
      @keyframes knPaySpin {
        to { transform: rotate(360deg); }
      }
      .kn-pay-success-card {
        text-align: center;
      }
      .kn-pay-success-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #10b981, #059669);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
        font-weight: 800;
        margin: 0 auto;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      }
      .kn-orders-table-wrap {
        overflow-x: auto;
        border: 1px solid var(--kn-ws-border, rgba(255,255,255,0.08));
        border-radius: 12px;
        background: var(--kn-ws-card-bg, rgba(255,255,255,0.02));
      }
      .kn-orders-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        text-align: left;
      }
      .kn-orders-table th {
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.04);
        color: var(--kn-ws-text-muted, #94a3b8);
        font-weight: 600;
        border-bottom: 1px solid var(--kn-ws-border, rgba(255,255,255,0.08));
        white-space: nowrap;
      }
      .kn-orders-table td {
        padding: 12px 14px;
        border-bottom: 1px solid var(--kn-ws-border, rgba(255,255,255,0.06));
        color: #f1f5f9;
        vertical-align: middle;
      }
      .kn-orders-table tr:last-child td {
        border-bottom: none;
      }
      .kn-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 11.5px;
        font-weight: 600;
      }
      .kn-status-success {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .kn-status-pending {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .kn-status-failed {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    `;
    document.head.appendChild(style);
  }

  // Self Initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStyles);
  } else {
    injectStyles();
  }

  // Export Global KN_PAYMENTS API
  window.KN_PAYMENTS = {
    initiateChapterDownload,
    startCashfreeCheckout,
    verifyOrderAndDeliverPdf,
    triggerPdfDownload,
    loadUserPaymentHistory,
    loadAdminPaymentsOverview,
    updateChapterPrice
  };

})();
