/**
 * ============================================================================
 * KNOCKOUT NOTES — Emergency Screen Wake Lock Manager (emergency-wake-lock.js)
 * Screen Wake Lock API controller for critical resuscitation & crisis workflows.
 * 
 * Safety & Privacy Guardrails:
 * - Acquired ONLY during active emergency sessions (active code, running CPR timer,
 *   active crisis management views).
 * - Never keeps screen awake across normal browsing, home page, or static reading.
 * - Releases cleanly when code/crisis stops or user exits.
 * - Automatically re-acquires on document visibility recovery if emergency is still active.
 * - 100% resilient with feature detection: never throws uncaught exceptions if
 *   WakeLock is unsupported, denied by user, or revoked by OS battery saver.
 * ============================================================================
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KnockoutEmergencyWakeLock = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  let wakeLockSentinel = null;
  let isEmergencyRequested = false;
  let isAcquiring = false;
  let statusBannerEl = null;

  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator && typeof navigator.wakeLock.request === 'function';

  /**
   * Request screen wake lock for an active emergency workflow.
   * @param {string} [contextLabel] - Diagnostic label for the emergency context.
   */
  async function requestLock(contextLabel) {
    isEmergencyRequested = true;
    updateStatusIndicator(true, contextLabel);

    if (!isSupported) {
      return false;
    }

    if (wakeLockSentinel && !wakeLockSentinel.released) {
      return true;
    }

    if (document.visibilityState !== 'visible') {
      return false;
    }

    if (isAcquiring) return false;
    isAcquiring = true;

    try {
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
        // If release was triggered externally (e.g. OS battery saver or tab switch)
        // while emergency is still requested, do not force an immediate loop;
        // visibilitychange handler will re-acquire when visible.
        updateStatusIndicator(isEmergencyRequested && document.visibilityState === 'visible', contextLabel);
      });

      updateStatusIndicator(true, contextLabel);
      return true;
    } catch (err) {
      // Gracefully handle NotAllowedError or battery saver denial
      wakeLockSentinel = null;
      updateStatusIndicator(false, contextLabel);
      return false;
    } finally {
      isAcquiring = false;
    }
  }

  /**
   * Release screen wake lock when emergency workflow terminates or is paused.
   */
  async function releaseLock() {
    isEmergencyRequested = false;
    updateStatusIndicator(false);

    if (!wakeLockSentinel) return;

    try {
      const lock = wakeLockSentinel;
      wakeLockSentinel = null;
      if (!lock.released) {
        await lock.release();
      }
    } catch (_) {
      // Ignored: already released or revoked
    }
  }

  /**
   * Query whether an emergency session is actively holding the wake lock.
   */
  function isActive() {
    return isEmergencyRequested;
  }

  /**
   * Query whether the Wake Lock API is supported by the current browser.
   */
  function hasSupport() {
    return isSupported;
  }

  /**
   * Renders or toggles subtle non-disruptive wake lock status pill in the UI.
   */
  function updateStatusIndicator(active, label) {
    if (typeof document === 'undefined') return;

    // Check if an existing status element exists or create one inside active HUD
    let el = document.getElementById('knWakeLockStatus');
    if (!el) {
      const hudContainer = document.querySelector('.chamber-hero-top, .cm-top-inner, .site-hud');
      if (hudContainer) {
        el = document.createElement('div');
        el.id = 'knWakeLockStatus';
        el.className = 'kn-wakelock-pill';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        el.innerHTML = '<span class="kn-wakelock-dot"></span><span class="kn-wakelock-text">Screen Awake</span>';
        hudContainer.appendChild(el);
      }
    }

    if (el) {
      if (active) {
        el.classList.add('active');
        const textSpan = el.querySelector('.kn-wakelock-text');
        if (textSpan) {
          textSpan.textContent = label ? `Screen Awake (${label})` : 'Screen Awake (Active Code)';
        }
        el.title = 'Screen staying awake during active emergency resuscitation protocol.';
      } else {
        el.classList.remove('active');
      }
    }
  }

  // Handle visibility changes: Re-acquire wake lock when tab returns if emergency is still active
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && isEmergencyRequested) {
        requestLock();
      }
    });

    // Release cleanly on page unload
    window.addEventListener('pagehide', () => {
      if (wakeLockSentinel) {
        try {
          wakeLockSentinel.release();
        } catch (_) {}
      }
    });
  }

  return {
    requestLock,
    releaseLock,
    isActive,
    hasSupport
  };
});
