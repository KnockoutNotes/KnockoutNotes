/**
 * KnockoutNotes Client Subscription Widget & Modal Controller
 * Embeds cleanly into public pages and communicates with /api/subscribe
 * Supports highlighted hero pill, footer pill, and universal glassmorphism modal dialog.
 */

(function() {
  'use strict';

  // ------------------------------------------------------------------------
  // 1. Universal Subscription Modal Setup (#knSubscribeModal)
  // ------------------------------------------------------------------------
  function setupSubscribeModal() {
    let modal = document.getElementById('knSubscribeModal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'knSubscribeModal';
    modal.className = 'kn-sub-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Subscribe to KnockoutNotes Updates');

    modal.innerHTML = `
      <div class="kn-sub-modal-backdrop" data-close-subscribe-modal></div>
      <div class="kn-sub-modal-box">
        <div class="kn-sub-modal-top">
          <div class="kn-subscribe-badge" style="margin-bottom: 0;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Clinical Alerts &amp; Updates
          </div>
          <button type="button" class="kn-sub-modal-close" data-close-subscribe-modal aria-label="Close modal">×</button>
        </div>
        <h3 class="kn-subscribe-title">Stay Current with Anaesthesia &amp; ICU Practice</h3>
        <p class="kn-subscribe-subtitle">
          Receive concise email notifications when new clinical notes, airway algorithms, medical calculators, or drug infusion protocols are published on KnockoutNotes. Zero spam. Unsubscribe anytime.
        </p>
        <form class="kn-subscribe-form" id="knModalSubscribeForm">
          <div class="kn-subscribe-input-wrapper">
            <input 
              type="email" 
              class="kn-subscribe-input" 
              placeholder="Enter your email (e.g. doctor@hospital.org)" 
              required 
              aria-label="Email address for subscription"
            >
          </div>
          <button type="submit" class="kn-subscribe-btn">
            <span>Subscribe for Updates</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
          <div class="kn-subscribe-message"></div>
        </form>
        <div class="kn-subscribe-footer-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Double opt-in verification required. We respect medical privacy.
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Wire close handlers
    modal.querySelectorAll('[data-close-subscribe-modal]').forEach(el => {
      el.addEventListener('click', () => closeSubscribeModal());
    });

    // Wire form submit handler
    const form = modal.querySelector('form');
    const input = modal.querySelector('.kn-subscribe-input');
    const btn = modal.querySelector('.kn-subscribe-btn');
    const msgBox = modal.querySelector('.kn-subscribe-message');
    const btnSpan = btn.querySelector('span');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      msgBox.className = 'kn-subscribe-message';
      msgBox.style.display = 'none';

      const email = (input.value || '').trim();
      if (!email) return;

      btn.disabled = true;
      const originalText = btnSpan.textContent;
      btnSpan.textContent = 'Sending confirmation...';

      const pageSource = window.location.pathname.replace(/^\//, '') || 'home';

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            sourcePage: pageSource
          })
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          msgBox.textContent = data.error || 'Failed to submit subscription. Please try again.';
          msgBox.className = 'kn-subscribe-message error';
          msgBox.style.display = 'block';
        } else {
          msgBox.textContent = data.message || 'Please check your email to verify your subscription.';
          msgBox.className = 'kn-subscribe-message success';
          msgBox.style.display = 'block';
          input.value = '';
        }
      } catch (err) {
        msgBox.textContent = 'Network error. Please check your connection and try again.';
        msgBox.className = 'kn-subscribe-message error';
        msgBox.style.display = 'block';
      } finally {
        btn.disabled = false;
        btnSpan.textContent = originalText;
      }
    });

    return modal;
  }

  function openSubscribeModal() {
    const modal = setupSubscribeModal();
    if (!modal) return;
    modal.classList.add('open');
    const input = modal.querySelector('.kn-subscribe-input');
    if (input) {
      setTimeout(() => input.focus(), 150);
    }
  }

  function closeSubscribeModal() {
    const modal = document.getElementById('knSubscribeModal');
    if (!modal) return;
    modal.classList.remove('open');
  }

  // Keyboard accessibility: ESC key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSubscribeModal();
    }
  });

  // Global delegation for all pill buttons or links with data-kn-open-subscribe
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-kn-open-subscribe]');
    if (trigger) {
      e.preventDefault();
      openSubscribeModal();
    }
  });

  // ------------------------------------------------------------------------
  // 2. Inline Mount Points Initialization (.kn-subscription-mount)
  // ------------------------------------------------------------------------
  function initSubscriptionWidgets() {
    // Ensure modal is prepared
    setupSubscribeModal();

    const mountPoints = document.querySelectorAll('#knSubscriptionWidget, .kn-subscription-mount');
    if (!mountPoints.length) return;

    mountPoints.forEach(mount => {
      if (mount.dataset.initialized === 'true') return;
      mount.dataset.initialized = 'true';

      const pageSource = window.location.pathname.replace(/^\//, '') || 'home';

      mount.innerHTML = `
        <div class="kn-subscribe-section">
          <div class="kn-subscribe-card">
            <div class="kn-subscribe-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Clinical Alerts &amp; Updates
            </div>
            <h3 class="kn-subscribe-title">Stay Current with Anaesthesia &amp; ICU Practice</h3>
            <p class="kn-subscribe-subtitle">
              Receive concise notifications when new clinical notes, airway algorithms, medical calculators, or drug infusion protocols are published on KnockoutNotes. Zero spam. Unsubscribe anytime.
            </p>
            <form class="kn-subscribe-form" id="knWidgetForm_${Math.random().toString(36).substr(2, 6)}">
              <div class="kn-subscribe-input-wrapper">
                <input 
                  type="email" 
                  class="kn-subscribe-input" 
                  placeholder="Enter your email (e.g. doctor@hospital.org)" 
                  required 
                  aria-label="Email address for subscription"
                >
              </div>
              <button type="submit" class="kn-subscribe-btn">
                <span>Subscribe for Updates</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
              <div class="kn-subscribe-message"></div>
            </form>
            <div class="kn-subscribe-footer-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Double opt-in verification required. We respect medical privacy.
            </div>
          </div>
        </div>
      `;

      const form = mount.querySelector('form');
      const input = mount.querySelector('.kn-subscribe-input');
      const btn = mount.querySelector('.kn-subscribe-btn');
      const msgBox = mount.querySelector('.kn-subscribe-message');
      const btnSpan = btn.querySelector('span');

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msgBox.className = 'kn-subscribe-message';
        msgBox.style.display = 'none';

        const email = (input.value || '').trim();
        if (!email) return;

        btn.disabled = true;
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Sending confirmation...';

        try {
          const res = await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              sourcePage: pageSource
            })
          });

          const data = await res.json();

          if (!res.ok || data.error) {
            msgBox.textContent = data.error || 'Failed to submit subscription. Please try again.';
            msgBox.className = 'kn-subscribe-message error';
            msgBox.style.display = 'block';
          } else {
            msgBox.textContent = data.message || 'Please check your email to verify your subscription.';
            msgBox.className = 'kn-subscribe-message success';
            msgBox.style.display = 'block';
            input.value = '';
          }
        } catch (err) {
          msgBox.textContent = 'Network error. Please check your connection and try again.';
          msgBox.className = 'kn-subscribe-message error';
          msgBox.style.display = 'block';
        } finally {
          btn.disabled = false;
          btnSpan.textContent = originalText;
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubscriptionWidgets);
  } else {
    initSubscriptionWidgets();
  }

  // Global APIs for SPA navigation and direct invocation
  window.initKnockoutSubscriptionWidgets = initSubscriptionWidgets;
  window.openKnockoutSubscribeModal = openSubscribeModal;
  window.closeKnockoutSubscribeModal = closeSubscribeModal;
})();
