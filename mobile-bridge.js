/**
 * KnockoutNotes — Mobile Bridge & Android Native Integration Layer (mobile-bridge.js)
 * 
 * Provides:
 * 1. Hardware Back Button handling (closes modals, returns to previous views, or exits safely).
 * 2. Real-time Network Monitoring (online/offline events and Capacitor Network plugin).
 * 3. Online-Only Route Interception with high-contrast clinical offline warning modal.
 * 4. UI Status Badges synchronization across all pages.
 */

(function () {
  'use strict';

  // The 8 official offline-first sections
  const OFFLINE_SECTIONS = new Set([
    'index.html',
    '',
    '/',
    'study.html',
    'calculators.html',
    'critical-care.html',
    'resuscitation-chamber.html',
    'crisis.html',
    'regional-anaesthesia.html',
    'ventilator.html'
  ]);

  const SECTION_TITLES = {
    'index.html': 'Home Dashboard',
    'study.html': 'Study Mode',
    'calculators.html': 'Anaesthesia Calculators',
    'critical-care.html': 'Critical Care & Code',
    'resuscitation-chamber.html': 'Run a Code (ACLS/PALS)',
    'crisis.html': 'Crisis Mode',
    'regional-anaesthesia.html': 'Regional Blocks',
    'ventilator.html': '3D Anaesthesia Workstation',
    'notes.html': 'Clinical Notes & Monographs',
    'pearls.html': 'High-Yield Pearls',
    'drugs.html': 'Drug Monographs',
    'viva.html': 'Viva Drill Chamber',
    'recent-updates.html': 'Recent Clinical Updates',
    'resources.html': 'Resources & Guidelines',
    'pricing.html': 'Pricing & Supporter Tiers',
    'contact.html': 'Contact & Support'
  };

  let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  function normalizeRoute(urlStr) {
    try {
      const u = new URL(urlStr, window.location.origin);
      if (u.origin !== window.location.origin) return null; // external
      const p = u.pathname.split('/').pop() || 'index.html';
      return p;
    } catch (_) {
      return null;
    }
  }

  function isOfflineRoute(pathname) {
    const norm = (pathname || '').split('?')[0].split('#')[0].split('/').pop() || 'index.html';
    return OFFLINE_SECTIONS.has(norm);
  }

  // =========================================================================
  // 1. OFFLINE MODAL & INTERCEPTION
  // =========================================================================
  function createOfflineModal() {
    if (document.getElementById('knOfflineModal')) return;

    const modal = document.createElement('div');
    modal.id = 'knOfflineModal';
    modal.className = 'kn-modal kn-offline-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Internet Connection Required');

    modal.innerHTML = `
      <div class="kn-modal-backdrop" data-close-offline-modal></div>
      <div class="kn-modal-box kn-offline-modal-box">
        <div class="kn-offline-icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="kn-offline-svg">
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
        </div>
        <div class="kn-offline-header">
          <h2 class="kn-offline-title">Internet Connection Required</h2>
          <span class="kn-offline-badge">Online-Only Section</span>
        </div>
        <div class="kn-offline-body">
          <p id="knOfflineTargetMsg">The requested section requires an active internet connection to stream live updates and remote media.</p>
          <div class="kn-offline-pill-box">
            <span class="kn-offline-status-dot"></span>
            <strong>Status: Device is currently offline</strong>
          </div>
          <div class="kn-offline-guarantee">
            <p><strong>Available Offline Right Now:</strong></p>
            <ul>
              <li>⚡ Home Dashboard & Sitewide Search</li>
              <li>⚡ All 37+ Clinical & ABG Calculators</li>
              <li>⚡ Code Room (Run a Code ACLS/PALS & Crisis Mode)</li>
              <li>⚡ 64 Study Topics & 84 Drug Monographs</li>
              <li>⚡ 44 Regional Blocks & Sono-Anatomy</li>
              <li>⚡ 3D Anaesthesia Workstation</li>
            </ul>
          </div>
        </div>
        <div class="kn-offline-actions">
          <button type="button" class="btn-cinematic primary" id="knOfflineRetryBtn">⚡ Retry Connection</button>
          <button type="button" class="btn-cinematic glass" data-close-offline-modal>Return to Offline Tools</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-close-offline-modal]').forEach(el => {
      el.addEventListener('click', () => modal.classList.remove('active'));
    });

    const retryBtn = document.getElementById('knOfflineRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        retryBtn.textContent = 'Checking connection...';
        setTimeout(() => {
          if (navigator.onLine) {
            modal.classList.remove('active');
            if (window._knPendingOfflineTarget) {
              window.location.href = window._knPendingOfflineTarget;
            }
          } else {
            retryBtn.textContent = '⚡ Still Offline — Retry';
            const statusBox = modal.querySelector('.kn-offline-pill-box');
            if (statusBox) {
              statusBox.style.animation = 'knFlashRed 0.6s ease';
              setTimeout(() => statusBox.style.animation = '', 600);
            }
          }
        }, 500);
      });
    }
  }

  function showOfflineModal(targetUrl, sectionName) {
    createOfflineModal();
    window._knPendingOfflineTarget = targetUrl;
    const modal = document.getElementById('knOfflineModal');
    const msg = document.getElementById('knOfflineTargetMsg');
    if (msg) {
      const name = sectionName || SECTION_TITLES[normalizeRoute(targetUrl)] || 'This section';
      msg.textContent = `${name} requires an active internet connection. Please connect to Wi-Fi or mobile data to access this content.`;
    }
    if (modal) modal.classList.add('active');
  }

  // Intercept clicks on links that require internet when offline
  function setupLinkInterception() {
    document.addEventListener('click', function (e) {
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // External links
      if (href.startsWith('http://') || href.startsWith('https://')) {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) {
          if (!navigator.onLine) {
            e.preventDefault();
            showOfflineModal(href, 'External clinical reference');
          }
          return;
        }
      }

      // Internal page links
      const route = normalizeRoute(href);
      if (route && !isOfflineRoute(route)) {
        if (!navigator.onLine) {
          e.preventDefault();
          showOfflineModal(href, SECTION_TITLES[route] || route);
        }
      }
    }, true);
  }

  // =========================================================================
  // 2. NETWORK STATUS INDICATORS & EVENTS
  // =========================================================================
  function updateNetworkUI(online) {
    isOnline = online;
    const badges = document.querySelectorAll('.kn-net-status-badge');
    badges.forEach(badge => {
      if (online) {
        badge.className = 'kn-net-status-badge online';
        badge.innerHTML = '<span class="kn-net-dot"></span><span>ONLINE</span>';
        badge.setAttribute('title', 'Connected — Content sync active');
      } else {
        badge.className = 'kn-net-status-badge offline';
        badge.innerHTML = '<span class="kn-net-dot"></span><span>OFFLINE MODE</span>';
        badge.setAttribute('title', 'Offline — Core 8 sections fully operational');
      }
    });

    const banner = document.getElementById('knGlobalOfflineBanner');
    if (banner) {
      banner.style.display = online ? 'none' : 'flex';
    }
  }

  function setupNetworkListeners() {
    window.addEventListener('online', () => {
      updateNetworkUI(true);
      if (window.KnockoutSync && typeof window.KnockoutSync.autoSync === 'function') {
        window.KnockoutSync.autoSync('network_reconnected');
      }
    });

    window.addEventListener('offline', () => {
      updateNetworkUI(false);
    });

    // Capacitor Network Plugin support if present
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Network) {
      window.Capacitor.Plugins.Network.addListener('networkStatusChange', status => {
        updateNetworkUI(status.connected);
      });
      window.Capacitor.Plugins.Network.getStatus().then(status => {
        updateNetworkUI(status.connected);
      }).catch(() => {});
    }

    updateNetworkUI(navigator.onLine);
  }

  // =========================================================================
  // 3. HARDWARE BACK BUTTON (Capacitor Android)
  // =========================================================================
  function setupHardwareBackButton() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        // Priority 1: Close active offline modal
        const offModal = document.getElementById('knOfflineModal');
        if (offModal && offModal.classList.contains('active')) {
          offModal.classList.remove('active');
          return;
        }

        // Priority 2: Close active search modal
        const searchModal = document.getElementById('knSearchModal');
        if (searchModal && searchModal.classList.contains('active')) {
          searchModal.classList.remove('active');
          return;
        }

        // Priority 3: Close active mobile nav menu
        const mobileMenu = document.getElementById('mobileMenu') || document.getElementById('mobileMenu3d');
        if (mobileMenu && mobileMenu.classList.contains('active')) {
          mobileMenu.classList.remove('active');
          return;
        }

        // Priority 4: Crisis mode internal subview back button
        const cmBackBtn = document.getElementById('cmBackBtn');
        if (cmBackBtn && cmBackBtn.offsetParent !== null) {
          cmBackBtn.click();
          return;
        }

        // Priority 5: Regional blocks detail back button
        const rgBackBtn = document.getElementById('rgBackBtn');
        if (rgBackBtn && rgBackBtn.offsetParent !== null) {
          rgBackBtn.click();
          return;
        }

        // Priority 6: Standard browser history back or return to index.html
        const curPath = normalizeRoute(window.location.pathname);
        if (curPath && curPath !== 'index.html' && window.history.length > 1) {
          window.history.back();
        } else {
          // On root page, exit or minimize app
          window.Capacitor.Plugins.App.exitApp();
        }
      });
    }
  }

  // =========================================================================
  // 4. INITIALIZATION
  // =========================================================================
  function init() {
    createOfflineModal();
    setupLinkInterception();
    setupNetworkListeners();
    setupHardwareBackButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.KnockoutMobile = {
    isOnline: () => isOnline,
    isOfflineSection: isOfflineRoute,
    showOfflineModal: showOfflineModal,
    updateNetworkUI: updateNetworkUI
  };

})();
