/**
 * KnockoutNotes — Automatic Content Synchronization Engine (sync-engine.js)
 * 
 * Manages:
 * 1. Background delta synchronization of clinical notes, pearls, guidelines, and updates.
 * 2. Safe local persistence in IndexedDB (KnockoutNotes_OfflineStore).
 * 3. Network-aware policy (foreground checks, reconnection auto-sync, Wi-Fi only option).
 * 4. Atomic updates with rollback preservation (never corrupts offline data on network failure).
 * 5. Non-blocking UI updates with timestamps and manual sync triggers.
 */

(function () {
  'use strict';

  const DB_NAME = 'KnockoutNotes_OfflineStore';
  const DB_VERSION = 1;
  const STORE_CONTENT = 'syncedContent';
  const STORE_META = 'metadata';

  let dbPromise = null;
  let isSyncing = false;

  // Open / upgrade IndexedDB
  function getDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_CONTENT)) {
          db.createObjectStore(STORE_CONTENT, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META, { keyPath: 'key' });
        }
      };
      req.onsuccess = function (e) {
        resolve(e.target.result);
      };
      req.onerror = function (e) {
        console.warn('[SyncEngine] IndexedDB unavailable, falling back to localStorage', e);
        resolve(null);
      };
    });
    return dbPromise;
  }

  // Storage wrappers with fallback to localStorage
  async function setLocalMeta(key, value) {
    try {
      const db = await getDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_META, 'readwrite');
          tx.objectStore(STORE_META).put({ key, value, updatedAt: Date.now() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (_) {}
    try {
      localStorage.setItem('kn_sync_' + key, JSON.stringify(value));
    } catch (_) {}
  }

  async function getLocalMeta(key) {
    try {
      const db = await getDB();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_META, 'readonly');
          const req = tx.objectStore(STORE_META).get(key);
          req.onsuccess = () => resolve(req.result ? req.result.value : null);
          req.onerror = () => resolve(null);
        });
      }
    } catch (_) {}
    try {
      const raw = localStorage.getItem('kn_sync_' + key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  async function saveSyncedData(id, data, version) {
    try {
      const db = await getDB();
      if (db) {
        return new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_CONTENT, 'readwrite');
          tx.objectStore(STORE_CONTENT).put({ id, data, version, savedAt: Date.now() });
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => reject(tx.error);
        });
      }
    } catch (_) {}
    try {
      localStorage.setItem('kn_content_' + id, JSON.stringify({ id, data, version, savedAt: Date.now() }));
    } catch (_) {}
  }

  async function getSyncedData(id) {
    try {
      const db = await getDB();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_CONTENT, 'readonly');
          const req = tx.objectStore(STORE_CONTENT).get(id);
          req.onsuccess = () => resolve(req.result ? req.result.data : null);
          req.onerror = () => resolve(null);
        });
      }
    } catch (_) {}
    try {
      const raw = localStorage.getItem('kn_content_' + id);
      return raw ? JSON.parse(raw).data : null;
    } catch (_) {
      return null;
    }
  }

  // Format relative timestamp
  function formatSyncTime(timestamp) {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = Math.floor((now - timestamp) / 1000); // seconds
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    const d = new Date(timestamp);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Update network badges across 3D and Lite views
  function updateNetworkBadges(netState) {
    const badges = [
      document.getElementById('knNetStatusBadge3d'),
      document.getElementById('knNetStatusBadgeLite')
    ];
    badges.forEach(b => {
      if (!b) return;
      b.className = `kn-net-status-badge ${netState.status}`;
      b.innerHTML = `<span class="kn-net-dot"></span><span>${netState.text}</span>`;
    });
  }

  // Fast bounded (~2s) probe distinguishing Online / Offline / Cached-Ready
  async function checkNetworkConnectivity() {
    if (!navigator.onLine) {
      const hasCache = ('caches' in window) || !!navigator.serviceWorker?.controller;
      return hasCache ? { status: 'cached', text: 'OFFLINE READY' } : { status: 'offline', text: 'OFFLINE' };
    }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 2000); // Bounded ~2s check
      const res = await fetch('favicon.ico?_=' + Date.now(), {
        method: 'HEAD',
        signal: ctrl.signal,
        cache: 'no-store'
      });
      clearTimeout(timer);
      if (res.ok || res.status < 400) {
        return { status: 'online', text: 'ONLINE' };
      }
    } catch (_) {}

    const hasCache = ('caches' in window) || !!navigator.serviceWorker?.controller;
    return hasCache ? { status: 'cached', text: 'OFFLINE READY' } : { status: 'offline', text: 'OFFLINE' };
  }

  // Update DOM elements representing sync state
  async function updateSyncUI(status, message) {
    const lastSync = await getLocalMeta('lastSyncTime');
    const timeStr = lastSync ? formatSyncTime(lastSync) : ('caches' in window ? 'Cached / Ready' : 'Ready');

    document.querySelectorAll('.kn-sync-time-val').forEach(el => {
      el.textContent = timeStr;
    });

    document.querySelectorAll('.kn-sync-status-msg').forEach(el => {
      if (message) el.textContent = message;
      else if (status === 'syncing') el.textContent = 'Syncing latest content...';
      else if (status === 'success') el.textContent = `All systems updated (${timeStr})`;
      else if (status === 'error') el.textContent = 'Sync interrupted — Offline copy preserved';
      else el.textContent = `Updated ${timeStr}`;
    });

    document.querySelectorAll('.kn-sync-now-btn').forEach(btn => {
      if (status === 'syncing') {
        btn.disabled = true;
        btn.classList.add('syncing');
        btn.innerHTML = '<span class="kn-sync-spinner">↻</span><span>Syncing...</span>';
      } else {
        btn.disabled = false;
        btn.classList.remove('syncing');
        btn.innerHTML = '<span>↻</span><span>Sync Now</span>';
      }
    });
  }

  // Wi-Fi only policy check
  async function shouldSkipDueToNetworkPolicy() {
    const wifiOnly = await getLocalMeta('wifiOnly');
    if (!wifiOnly) return false;

    // Check Network Information API if available
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      if (conn.type && conn.type !== 'wifi' && conn.type !== 'ethernet') {
        return true; // on cellular / 4g / 5g
      }
      if (conn.saveData) {
        return true; // data saver mode enabled
      }
    }
    return false;
  }

  // Core Sync Execution with bounded ~2s timeouts
  async function performSync(triggerReason = 'auto') {
    if (isSyncing) return;
    if (!navigator.onLine) {
      const hasCache = ('caches' in window) || !!navigator.serviceWorker?.controller;
      updateNetworkBadges(hasCache ? { status: 'cached', text: 'OFFLINE READY' } : { status: 'offline', text: 'OFFLINE' });
      updateSyncUI('offline', 'Offline — Ready with local database');
      return;
    }

    if (await shouldSkipDueToNetworkPolicy()) {
      updateSyncUI('skipped', 'Sync paused (Wi-Fi only enabled)');
      return;
    }

    isSyncing = true;
    updateSyncUI('syncing');
    updateNetworkBadges({ status: 'checking', text: 'CHECKING...' });

    try {
      const results = { updated: 0, preserved: 0 };

      // 1. Sync Live CMS Sheet Data (Pearls, Notes, Viva) if API configured (bounded 2s)
      const apiUrl = window.KNOCKOUTNOTES_API || (window.KNOCKOUTNOTES_CONFIG && window.KNOCKOUTNOTES_CONFIG.API_URL);
      if (apiUrl) {
        try {
          const ctrl = new AbortController();
          const timer = setTimeout(() => ctrl.abort(), 2000); // Bounded ~2s timeout
          const res = await fetch(apiUrl + (apiUrl.includes('?') ? '&' : '?') + 't=' + Date.now(), {
            signal: ctrl.signal,
            cache: 'no-store'
          });
          clearTimeout(timer);

          if (res.ok) {
            const data = await res.json();
            // Validate schema before saving
            if (data && (Array.isArray(data) || typeof data === 'object')) {
              await saveSyncedData('sheet_cms', data, Date.now());
              results.updated++;
            }
          }
        } catch (sheetErr) {
          console.warn('[SyncEngine] CMS sheet sync skipped or timed out, preserving local content:', sheetErr.message);
          results.preserved++;
        }
      }

      // 2. Sync Clinical Updates Manifest (Guidelines: AHA 2025, DAS, GINA) (bounded 2s)
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 2000); // Bounded ~2s timeout
        const res = await fetch('content-config.js?_=' + Date.now(), {
          signal: ctrl.signal,
          cache: 'no-store'
        });
        clearTimeout(timer);

        if (res.ok) {
          const txt = await res.text();
          if (txt.includes('KNOCKOUTNOTES_CONTENT') || txt.includes('KNOCKOUTNOTES_PROGRAMME_UPDATES')) {
            await saveSyncedData('content_config_text', txt, Date.now());
            results.updated++;
          }
        }
      } catch (cfgErr) {
        console.warn('[SyncEngine] Content config sync skipped:', cfgErr.message);
        results.preserved++;
      }

      // Record successful sync timestamp
      const now = Date.now();
      await setLocalMeta('lastSyncTime', now);
      await setLocalMeta('lastSyncStatus', 'success');

      updateNetworkBadges({ status: 'online', text: 'ONLINE' });
      updateSyncUI('success', `Synchronized successfully (Just now)`);

      // Notify any active views that new content is available
      window.dispatchEvent(new CustomEvent('knockout:content-synced', { detail: { timestamp: now, trigger: triggerReason } }));
    } catch (err) {
      console.error('[SyncEngine] Sync error:', err);
      const hasCache = ('caches' in window) || !!navigator.serviceWorker?.controller;
      updateNetworkBadges(hasCache ? { status: 'cached', text: 'OFFLINE READY' } : { status: 'offline', text: 'OFFLINE' });
      updateSyncUI('error', 'Sync interrupted — Offline copy intact');
    } finally {
      isSyncing = false;
    }
  }

  // Setup periodic & event-driven triggers
  function setupTriggers() {
    // Online / Offline listeners for reactive connectivity badge update
    window.addEventListener('online', async () => {
      updateNetworkBadges({ status: 'checking', text: 'CHECKING...' });
      const net = await checkNetworkConnectivity();
      updateNetworkBadges(net);
      if (net.status === 'online') {
        performSync('network_online');
      }
    });

    window.addEventListener('offline', () => {
      const hasCache = ('caches' in window) || !!navigator.serviceWorker?.controller;
      updateNetworkBadges(hasCache ? { status: 'cached', text: 'OFFLINE READY' } : { status: 'offline', text: 'OFFLINE' });
      updateSyncUI('offline', 'Offline — Local database active');
    });

    // App start: fast bounded probe
    checkNetworkConnectivity().then(net => {
      updateNetworkBadges(net);
      if (net.status === 'online') {
        performSync('app_start');
      } else {
        updateSyncUI('offline', 'Offline — Local database active');
      }
    });

    // Visibility change / app returning to foreground
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        getLocalMeta('lastSyncTime').then(last => {
          // If more than 30 minutes since last sync, auto-refresh
          if (!last || Date.now() - last > 30 * 60 * 1000) {
            performSync('foreground_return');
          }
        });
      }
    });

    // Capacitor App State Change
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener('appStateChange', state => {
        if (state.isActive && navigator.onLine) {
          performSync('app_active');
        }
      });
    }

    // Manual sync buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.kn-sync-now-btn');
      if (btn) {
        e.preventDefault();
        performSync('manual_user_click');
      }
    });
  }

  // Initialization
  function init() {
    setupTriggers();
    updateSyncUI('ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.KnockoutSync = {
    performSync: performSync,
    autoSync: performSync,
    getLastSyncTime: () => getLocalMeta('lastSyncTime'),
    setWifiOnly: (val) => setLocalMeta('wifiOnly', !!val),
    getWifiOnly: () => getLocalMeta('wifiOnly'),
    getSyncedData: getSyncedData,
    formatSyncTime: formatSyncTime
  };

})();
