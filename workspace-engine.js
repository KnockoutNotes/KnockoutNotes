/* ==========================================================================
   KNOCKOUTNOTES — Universal User Accounts & Personal Workspace Engine
   (workspace-engine.js)
   - Client session manager, Cloudflare D1 integration, and offline sync queue
   - Universal bookmarking, personal notes, and contextual sticky notes
   - Dynamic UI modals for Auth, Sticky Notes, and Note Editor
   - Works seamlessly online, offline, and on localhost:8080
   ========================================================================== */

(function () {
  "use strict";

  // SVG Icons
  const ICONS = {
    bookmarkOutline: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
    bookmarkFilled: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
    stickyNote: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/></svg>`,
    noteDoc: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    close: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    user: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`
  };

  // State Management
  const STORAGE_KEYS = {
    user: "kn_user",
    token: "kn_session_token",
    bookmarks: "kn_bookmarks",
    notes: "kn_notes",
    stickyNotes: "kn_sticky_notes",
    syncQueue: "kn_sync_queue",
    pendingAction: "kn_pending_post_login_action"
  };

  function safeJSONParse(str, fallback) {
    try {
      return str ? JSON.parse(str) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  let currentUser = safeJSONParse(localStorage.getItem(STORAGE_KEYS.user), null);
  let sessionToken = localStorage.getItem(STORAGE_KEYS.token) || "";
  let bookmarksCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.bookmarks), []);
  let notesCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.notes), []);
  let stickyCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.stickyNotes), []);
  let syncQueue = safeJSONParse(localStorage.getItem(STORAGE_KEYS.syncQueue), []);
  let isSyncing = false;

  // Event Dispatcher
  const eventListeners = {};

  function triggerEvent(name, detail) {
    const customEvent = new CustomEvent("kn:" + name, { detail });
    window.dispatchEvent(customEvent);
    if (eventListeners[name]) {
      eventListeners[name].forEach((fn) => {
        try { fn(detail); } catch (e) { console.error(e); }
      });
    }
  }

  // Toast Notification
  function showToast(message, type = "info") {
    let container = document.getElementById("knToastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "knToastContainer";
      container.className = "kn-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "kn-toast " + type;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      setTimeout(() => toast.remove(), 250);
    }, 2800);
  }

  // API Call Wrapper with Network & Offline Fallback
  async function apiCall(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    if (sessionToken) {
      headers["Authorization"] = `Bearer ${sessionToken}`;
    }

    try {
      const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      return { ok: true, data };
    } catch (err) {
      return { ok: false, error: err.message || "Network request failed" };
    }
  }

  // Queue Offline Mutations
  function enqueueSync(action, table, payload) {
    syncQueue.push({
      action,
      table,
      payload,
      timestamp: Date.now()
    });
    localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(syncQueue));
    triggerEvent("sync-status", { syncing: false, queueLength: syncQueue.length });
  }

  // Synchronize Offline Queue with Backend
  async function syncOfflineQueue() {
    if (isSyncing || !sessionToken || !navigator.onLine) return;
    if (syncQueue.length === 0) {
      // Refresh local cache from server
      await pullServerData();
      return;
    }

    isSyncing = true;
    triggerEvent("sync-status", { syncing: true, queueLength: syncQueue.length });

    const batch = [...syncQueue];
    const res = await apiCall("/api/user/sync", "POST", { batch });

    if (res.ok) {
      // Clear processed queue
      syncQueue = [];
      localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify([]));
      await pullServerData();
      showToast("Workspace synced successfully", "success");
    }

    isSyncing = false;
    triggerEvent("sync-status", { syncing: false, queueLength: syncQueue.length });
  }

  // Pull Fresh Bookmarks & Notes from Cloudflare D1
  async function pullServerData() {
    if (!sessionToken) return;

    try {
      const [bmRes, ntRes, stRes] = await Promise.all([
        apiCall("/api/user/bookmarks"),
        apiCall("/api/user/notes"),
        apiCall("/api/user/sticky-notes")
      ]);

      if (bmRes.ok && bmRes.data?.bookmarks) {
        bookmarksCache = bmRes.data.bookmarks;
        localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarksCache));
        triggerEvent("bookmarks-change", { bookmarks: bookmarksCache });
      }

      if (ntRes.ok && ntRes.data?.notes) {
        notesCache = ntRes.data.notes;
        localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesCache));
        triggerEvent("notes-change", { notes: notesCache });
      }

      if (stRes.ok && stRes.data?.sticky_notes) {
        stickyCache = stRes.data.sticky_notes;
        localStorage.setItem(STORAGE_KEYS.stickyNotes, JSON.stringify(stickyCache));
        triggerEvent("sticky-change", { stickyNotes: stickyCache });
      }
    } catch (_) {}
  }

  // ==========================================================================
  // AUTHENTICATION CONTROLLER (Phase 1)
  // ==========================================================================
  async function login(email, password) {
    const res = await apiCall("/api/auth/login", "POST", { email, password });
    if (!res.ok) {
      // For local testing on standalone python server where API returns 404 or 501, provide mock offline session
      if (res.error.includes("404") || res.error.includes("501") || res.error.includes("Failed to fetch")) {
        const mockUser = {
          id: "u_" + Math.random().toString(36).substring(2, 9),
          email,
          name: email.split("@")[0],
          avatar_url: null,
          created_at: new Date().toISOString()
        };
        const mockToken = "mock_session_" + Date.now();
        setSession(mockUser, mockToken);
        showToast("Signed in (Offline/Local Mode)");
        executePendingAction();
        return { ok: true, user: mockUser };
      }
      return { ok: false, error: res.error };
    }

    setSession(res.data.user, res.data.session_token);
    showToast(`Welcome back, ${res.data.user.name || "Doctor"}!`, "success");
    await syncOfflineQueue();
    executePendingAction();
    return { ok: true, user: res.data.user };
  }

  async function register(email, password, name) {
    const res = await apiCall("/api/auth/register", "POST", { email, password, name });
    if (!res.ok) {
      if (res.error.includes("404") || res.error.includes("501") || res.error.includes("Failed to fetch")) {
        const mockUser = {
          id: "u_" + Math.random().toString(36).substring(2, 9),
          email,
          name: name || email.split("@")[0],
          avatar_url: null,
          created_at: new Date().toISOString()
        };
        const mockToken = "mock_session_" + Date.now();
        setSession(mockUser, mockToken);
        showToast("Account created (Offline/Local Mode)");
        executePendingAction();
        return { ok: true, user: mockUser };
      }
      return { ok: false, error: res.error };
    }

    setSession(res.data.user, res.data.session_token);
    showToast("Registration successful! Welcome to KnockoutNotes.", "success");
    await syncOfflineQueue();
    executePendingAction();
    return { ok: true, user: res.data.user };
  }

  async function loginWithGoogle(credentialOrProfile = null) {
    let payload = {};

    if (credentialOrProfile && credentialOrProfile.credential) {
      payload = { credential: credentialOrProfile.credential };
    } else if (credentialOrProfile && credentialOrProfile.profile) {
      payload = { profile: credentialOrProfile.profile };
    } else if (window.google && window.google.accounts && window.google.accounts.id && window.KN_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.prompt();
      return { ok: true, pending: true };
    } else {
      // Prompt modal or input for email
      const email = prompt("Enter your Google Account email:", "doctor@gmail.com");
      if (!email) return { ok: false, error: "Cancelled" };
      const cleanEmail = email.trim();
      const derivedName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase());
      payload = {
        profile: {
          email: cleanEmail,
          name: derivedName.startsWith("Dr") ? derivedName : ("Dr. " + derivedName),
          picture: null
        }
      };
    }

    const res = await apiCall("/api/auth/google", "POST", payload);

    if (!res.ok) {
      if (res.error.includes("404") || res.error.includes("501") || res.error.includes("Failed to fetch")) {
        const cleanEmail = payload.profile?.email || "dr.google@gmail.com";
        const derivedName = payload.profile?.name || "Dr. Google";
        const mockUser = {
          id: "u_google_" + Math.random().toString(36).substring(2, 9),
          email: cleanEmail,
          name: derivedName,
          avatar_url: payload.profile?.picture || null,
          created_at: new Date().toISOString()
        };
        const mockToken = "mock_google_session_" + Date.now();
        setSession(mockUser, mockToken);
        showToast(`Signed in with Google! Welcome, ${derivedName}.`, "success");
        executePendingAction();
        return { ok: true, user: mockUser };
      }
      return { ok: false, error: res.error };
    }

    setSession(res.data.user, res.data.session_token);
    showToast(`Signed in with Google! Welcome, ${res.data.user.name || "Doctor"}.`, "success");
    await syncOfflineQueue();
    executePendingAction();
    return { ok: true, user: res.data.user };
  }

  async function logout() {
    if (sessionToken) {
      apiCall("/api/auth/logout", "POST").catch(() => {});
    }
    currentUser = null;
    sessionToken = "";
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.token);
    triggerEvent("auth-change", { user: null });
    updateNavUser();
    showToast("Signed out");
    if (window.location.pathname.endsWith("workspace.html")) {
      window.location.reload();
    }
  }

  function setSession(user, token) {
    currentUser = user;
    sessionToken = token;
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.token, token);
    triggerEvent("auth-change", { user });
    updateNavUser();
  }

  function executePendingAction() {
    const pending = safeJSONParse(localStorage.getItem(STORAGE_KEYS.pendingAction), null);
    if (!pending) return;
    localStorage.removeItem(STORAGE_KEYS.pendingAction);

    if (pending.type === "bookmark" && pending.item) {
      toggleBookmark(pending.item);
    } else if (pending.type === "sticky" && pending.item) {
      openStickyModal(pending.item);
    } else if (pending.type === "note" && pending.item) {
      openNoteModal(pending.item);
    } else if (pending.type === "download_pdf" && pending.chapterId) {
      if (pending.returnUrl && window.location.pathname.includes("workspace.html") && !pending.returnUrl.includes("workspace.html")) {
        try {
          localStorage.setItem(STORAGE_KEYS.pendingAction, JSON.stringify(pending));
          window.location.href = pending.returnUrl;
          return;
        } catch (_) {}
      }
      if (window.KN_PAYMENTS && typeof window.KN_PAYMENTS.initiateChapterDownload === "function") {
        window.KN_PAYMENTS.initiateChapterDownload(pending.chapterId, pending.chapterTitle);
      }
    }
  }

  // ==========================================================================
  // BOOKMARK SYSTEM (Phase 2 & Phase 5)
  // ==========================================================================
  function normalizeContentId(id, type = "study") {
    if (!id) return "";
    return id.includes(":") ? id : `${type}:${id}`;
  }

  function isBookmarked(contentId) {
    const norm = normalizeContentId(contentId);
    return bookmarksCache.some((b) => b.content_id === norm);
  }

  async function toggleBookmark(item, triggerEl) {
    if (!currentUser) {
      localStorage.setItem(
        STORAGE_KEYS.pendingAction,
        JSON.stringify({ type: "bookmark", item })
      );
      openAuthModal("signin", "Sign in to save bookmarks to your personal workspace.");
      return false;
    }

    const normId = normalizeContentId(item.content_id || item.id, item.content_type || "study");
    const existingIndex = bookmarksCache.findIndex((b) => b.content_id === normId);
    let bookmarked = false;

    if (existingIndex !== -1) {
      // Remove bookmark
      bookmarksCache.splice(existingIndex, 1);
      bookmarked = false;
      showToast("Bookmark removed");
    } else {
      // Add bookmark
      const newBookmark = {
        id: "bm_" + Date.now(),
        content_id: normId,
        content_type: item.content_type || "study",
        title: item.title || item.name || "Untitled",
        route: item.route || window.location.pathname + window.location.hash,
        category: item.category || item.cat || "General",
        metadata: item.metadata || {},
        created_at: new Date().toISOString()
      };
      bookmarksCache.unshift(newBookmark);
      bookmarked = true;
      showToast("Bookmarked to Personal Workspace", "success");
    }

    // Persist locally
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarksCache));
    enqueueSync(bookmarked ? "insert" : "delete", "user_bookmarks", { content_id: normId, ...item });

    // Update all matching buttons on current page
    updateBookmarkButtons(normId, bookmarked);
    triggerEvent("bookmarks-change", { bookmarks: bookmarksCache });

    // Push to server in background
    apiCall("/api/user/bookmarks", "POST", {
      content_id: normId,
      content_type: item.content_type || "study",
      title: item.title || item.name || "Untitled",
      route: item.route || window.location.pathname + window.location.hash,
      category: item.category || item.cat || "General",
      metadata: item.metadata || {}
    }).catch(() => {});

    return bookmarked;
  }

  function updateBookmarkButtons(normId, isBookmarkedNow) {
    document.querySelectorAll(`[data-kn-bookmark-id="${normId}"]`).forEach((btn) => {
      btn.classList.toggle("active-bookmark", isBookmarkedNow);
      btn.innerHTML = isBookmarkedNow ? ICONS.bookmarkFilled : ICONS.bookmarkOutline;
      btn.title = isBookmarkedNow ? "Bookmarked (Click to remove)" : "Add to Bookmarks";
      btn.setAttribute("aria-pressed", isBookmarkedNow ? "true" : "false");
    });
  }

  // ==========================================================================
  // STICKY NOTES SYSTEM (Phase 4)
  // ==========================================================================
  function getStickyNotes(contentId) {
    if (!contentId) return [...stickyCache];
    const norm = normalizeContentId(contentId);
    return stickyCache.filter((s) => s.content_id === norm);
  }

  async function saveStickyNote(data) {
    if (!currentUser) {
      openAuthModal("signin", "Sign in to save sticky notes.");
      return null;
    }

    const normId = normalizeContentId(data.content_id, data.content_type);
    let record;

    if (data.id) {
      const idx = stickyCache.findIndex((s) => s.id === data.id);
      if (idx !== -1) {
        stickyCache[idx] = {
          ...stickyCache[idx],
          note_text: data.note_text,
          color: data.color || "yellow",
          updated_at: new Date().toISOString()
        };
        record = stickyCache[idx];
      }
    } else {
      record = {
        id: "stk_" + Date.now(),
        content_id: normId,
        content_type: data.content_type || "study",
        content_title: data.content_title || data.title || "Untitled",
        route: data.route || window.location.pathname + window.location.hash,
        note_text: data.note_text,
        color: data.color || "yellow",
        created_at: new Date().toISOString()
      };
      stickyCache.unshift(record);
    }

    localStorage.setItem(STORAGE_KEYS.stickyNotes, JSON.stringify(stickyCache));
    enqueueSync(data.id ? "update" : "insert", "user_sticky_notes", record);
    triggerEvent("sticky-change", { stickyNotes: stickyCache });
    showToast("Sticky note saved", "success");

    // Sync to backend
    apiCall("/api/user/sticky-notes", "POST", record).catch(() => {});
    return record;
  }

  async function deleteStickyNote(id) {
    stickyCache = stickyCache.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.stickyNotes, JSON.stringify(stickyCache));
    enqueueSync("delete", "user_sticky_notes", { id });
    triggerEvent("sticky-change", { stickyNotes: stickyCache });
    showToast("Sticky note deleted");
    apiCall(`/api/user/sticky-notes?id=${id}`, "DELETE").catch(() => {});
  }

  // ==========================================================================
  // PERSONAL NOTES SYSTEM (Phase 3)
  // ==========================================================================
  function getNotes(filterCat, searchQuery, sortBy = "newest") {
    let list = [...notesCache];

    if (filterCat && filterCat !== "all") {
      if (filterCat === "pinned") {
        list = list.filter((n) => n.is_pinned);
      } else if (filterCat === "standalone") {
        list = list.filter((n) => !n.content_id);
      } else {
        list = list.filter((n) => n.content_type === filterCat);
      }
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((n) =>
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.body && n.body.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (sortBy === "alphabetical") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    } else {
      list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return list;
  }

  async function saveNote(data) {
    if (!currentUser) {
      openAuthModal("signin", "Sign in to save notes.");
      return null;
    }

    let record;
    if (data.id) {
      const idx = notesCache.findIndex((n) => n.id === data.id);
      if (idx !== -1) {
        notesCache[idx] = {
          ...notesCache[idx],
          title: data.title || "Untitled Note",
          body: data.body || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          is_pinned: !!data.is_pinned,
          updated_at: new Date().toISOString()
        };
        record = notesCache[idx];
      }
    } else {
      record = {
        id: "nt_" + Date.now(),
        title: data.title || "Untitled Note",
        body: data.body || "",
        content_id: data.content_id ? normalizeContentId(data.content_id, data.content_type) : null,
        content_type: data.content_type || null,
        content_title: data.content_title || null,
        route: data.route || (data.content_id ? window.location.pathname + window.location.hash : null),
        tags: Array.isArray(data.tags) ? data.tags : [],
        is_pinned: !!data.is_pinned,
        created_at: new Date().toISOString()
      };
      notesCache.unshift(record);
    }

    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesCache));
    enqueueSync(data.id ? "update" : "insert", "user_notes", record);
    triggerEvent("notes-change", { notes: notesCache });
    showToast("Personal note saved", "success");

    apiCall("/api/user/notes", "POST", record).catch(() => {});
    return record;
  }

  async function deleteNote(id) {
    notesCache = notesCache.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notesCache));
    enqueueSync("delete", "user_notes", { id });
    triggerEvent("notes-change", { notes: notesCache });
    showToast("Note deleted");
    apiCall(`/api/user/notes?id=${id}`, "DELETE").catch(() => {});
  }

  // ==========================================================================
  // DYNAMIC MODALS
  // ==========================================================================
  function closeModal() {
    const existing = document.getElementById("knActiveModal");
    if (existing) existing.remove();
  }

  function openAuthModal(initialTab = "signin", customHint = "") {
    closeModal();

    const backdrop = document.createElement("div");
    backdrop.id = "knActiveModal";
    backdrop.className = "kn-modal-backdrop";

    backdrop.innerHTML = `
      <div class="kn-modal-sheet" role="dialog" aria-modal="true" aria-label="Sign In or Register">
        <div class="kn-modal-header">
          <h3 class="kn-modal-title" id="knAuthModalTitle">Personal Workspace</h3>
          <button type="button" class="kn-modal-close" data-close-modal aria-label="Close">${ICONS.close}</button>
        </div>

        <div class="kn-auth-tabs">
          <button type="button" class="kn-auth-tab ${initialTab === 'signin' ? 'active' : ''}" data-tab="signin">Sign In</button>
          <button type="button" class="kn-auth-tab ${initialTab === 'register' ? 'active' : ''}" data-tab="register">Create Account</button>
        </div>

        <div class="kn-modal-body">
          ${customHint ? `<div class="kn-form-hint" style="color:var(--kn-ws-accent); font-weight:600; margin-bottom:8px;">💡 ${customHint}</div>` : ""}

          <!-- Google Sign In Button -->
          <button type="button" class="kn-btn-google" id="knGoogleAuthBtn" style="margin-bottom:12px;">
            <svg class="kn-google-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div class="kn-auth-divider">
            <span>or continue with email</span>
          </div>

          <!-- Sign In Form -->
          <form id="knSignInForm" style="${initialTab === 'signin' ? '' : 'display:none;'}">
            <div class="kn-form-group">
              <label class="kn-form-label">Email Address</label>
              <input type="email" class="kn-form-input" id="knAuthEmail" required placeholder="doctor@hospital.org" autocomplete="email">
            </div>
            <div class="kn-form-group" style="margin-top:12px;">
              <label class="kn-form-label">Password</label>
              <input type="password" class="kn-form-input" id="knAuthPassword" required placeholder="••••••••" autocomplete="current-password">
            </div>
            <div id="knAuthError" class="kn-form-error" style="display:none;"></div>
            <button type="submit" class="kn-btn kn-btn-primary" style="width:100%; margin-top:16px;">Sign In with Email</button>
          </form>

          <!-- Register Form -->
          <form id="knRegisterForm" style="${initialTab === 'register' ? '' : 'display:none;'}">
            <div class="kn-form-group">
              <label class="kn-form-label">Full Name</label>
              <input type="text" class="kn-form-input" id="knRegName" required placeholder="Dr. Jane Doe" autocomplete="name">
            </div>
            <div class="kn-form-group" style="margin-top:12px;">
              <label class="kn-form-label">Email Address</label>
              <input type="email" class="kn-form-input" id="knRegEmail" required placeholder="doctor@hospital.org" autocomplete="email">
            </div>
            <div class="kn-form-group" style="margin-top:12px;">
              <label class="kn-form-label">Password (min 8 characters)</label>
              <input type="password" class="kn-form-input" id="knRegPassword" minlength="8" required placeholder="••••••••" autocomplete="new-password">
            </div>
            <div id="knRegError" class="kn-form-error" style="display:none;"></div>
            <button type="submit" class="kn-btn kn-btn-primary" style="width:100%; margin-top:16px;">Create Account with Email</button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Google Sign In Button click
    backdrop.querySelector("#knGoogleAuthBtn")?.addEventListener("click", async () => {
      const res = await loginWithGoogle();
      if (res && res.ok) {
        closeModal();
      }
    });

    // Tab switching
    const tabs = backdrop.querySelectorAll(".kn-auth-tab");
    const signInForm = backdrop.querySelector("#knSignInForm");
    const regForm = backdrop.querySelector("#knRegisterForm");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const isSign = tab.dataset.tab === "signin";
        signInForm.style.display = isSign ? "" : "none";
        regForm.style.display = isSign ? "none" : "";
      });
    });

    // Close bindings
    backdrop.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Sign In Submit
    signInForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errBox = backdrop.querySelector("#knAuthError");
      errBox.style.display = "none";
      const email = backdrop.querySelector("#knAuthEmail").value.trim();
      const password = backdrop.querySelector("#knAuthPassword").value;

      const res = await login(email, password);
      if (res.ok) {
        closeModal();
      } else {
        errBox.textContent = res.error || "Invalid credentials";
        errBox.style.display = "block";
      }
    });

    // Register Submit
    regForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errBox = backdrop.querySelector("#knRegError");
      errBox.style.display = "none";
      const name = backdrop.querySelector("#knRegName").value.trim();
      const email = backdrop.querySelector("#knRegEmail").value.trim();
      const password = backdrop.querySelector("#knRegPassword").value;

      const res = await register(email, password, name);
      if (res.ok) {
        closeModal();
      } else {
        errBox.textContent = res.error || "Registration failed";
        errBox.style.display = "block";
      }
    });
  }

  // Sticky Note Modal / Editor
  function openStickyModal(item, existingSticky = null) {
    if (!currentUser) {
      localStorage.setItem(STORAGE_KEYS.pendingAction, JSON.stringify({ type: "sticky", item }));
      openAuthModal("signin", "Sign in to add personal sticky notes.");
      return;
    }

    closeModal();

    const title = item.title || item.name || "Educational Monograph";
    let selectedColor = existingSticky?.color || "yellow";

    const backdrop = document.createElement("div");
    backdrop.id = "knActiveModal";
    backdrop.className = "kn-modal-backdrop";

    backdrop.innerHTML = `
      <div class="kn-modal-sheet" role="dialog" aria-modal="true" aria-label="Personal Sticky Note">
        <div class="kn-modal-header">
          <h3 class="kn-modal-title">Sticky Note</h3>
          <button type="button" class="kn-modal-close" data-close-modal aria-label="Close">${ICONS.close}</button>
        </div>

        <div class="kn-modal-body">
          <div class="kn-note-linked-source">
            <span>Linked to:</span>
            <strong>${title}</strong>
          </div>

          <div class="kn-form-group">
            <label class="kn-form-label">Note Color</label>
            <div class="kn-color-selector">
              <button type="button" class="kn-color-dot kn-color-yellow ${selectedColor === 'yellow' ? 'active' : ''}" data-color="yellow" title="Yellow"></button>
              <button type="button" class="kn-color-dot kn-color-blue ${selectedColor === 'blue' ? 'active' : ''}" data-color="blue" title="Blue"></button>
              <button type="button" class="kn-color-dot kn-color-green ${selectedColor === 'green' ? 'active' : ''}" data-color="green" title="Green"></button>
              <button type="button" class="kn-color-dot kn-color-pink ${selectedColor === 'pink' ? 'active' : ''}" data-color="pink" title="Pink"></button>
              <button type="button" class="kn-color-dot kn-color-purple ${selectedColor === 'purple' ? 'active' : ''}" data-color="purple" title="Purple"></button>
            </div>
          </div>

          <div class="kn-form-group">
            <label class="kn-form-label">Your Note</label>
            <textarea id="knStickyText" class="kn-form-textarea" placeholder="Key clinical pearl, personal reminder, or exam question nuance..." rows="4">${existingSticky ? existingSticky.note_text : ''}</textarea>
          </div>
        </div>

        <div class="kn-modal-footer">
          ${existingSticky ? `<button type="button" class="kn-btn kn-btn-danger" id="knDeleteStickyBtn" style="margin-right:auto;">Delete</button>` : ''}
          <button type="button" class="kn-btn kn-btn-secondary" data-close-modal>Cancel</button>
          <button type="button" class="kn-btn kn-btn-primary" id="knSaveStickyBtn">Save Sticky Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Color picker
    backdrop.querySelectorAll(".kn-color-dot").forEach((dot) => {
      dot.addEventListener("click", () => {
        backdrop.querySelectorAll(".kn-color-dot").forEach((d) => d.classList.remove("active"));
        dot.classList.add("active");
        selectedColor = dot.dataset.color;
      });
    });

    // Close bindings
    backdrop.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Save
    backdrop.querySelector("#knSaveStickyBtn").addEventListener("click", async () => {
      const text = backdrop.querySelector("#knStickyText").value.trim();
      if (!text) {
        showToast("Please enter a note", "error");
        return;
      }

      await saveStickyNote({
        id: existingSticky?.id,
        content_id: item.content_id || item.id,
        content_type: item.content_type || "study",
        content_title: title,
        route: item.route || window.location.pathname + window.location.hash,
        note_text: text,
        color: selectedColor
      });
      closeModal();
    });

    // Delete
    const delBtn = backdrop.querySelector("#knDeleteStickyBtn");
    if (delBtn) {
      delBtn.addEventListener("click", async () => {
        if (confirm("Delete this sticky note?")) {
          await deleteStickyNote(existingSticky.id);
          closeModal();
        }
      });
    }
  }

  // Personal Note Editor Modal
  function openNoteModal(item = null, existingNote = null) {
    if (!currentUser) {
      localStorage.setItem(STORAGE_KEYS.pendingAction, JSON.stringify({ type: "note", item }));
      openAuthModal("signin", "Sign in to create personal notes.");
      return;
    }

    closeModal();

    const title = existingNote?.title || (item ? `Notes on ${item.title || item.name}` : "");
    const body = existingNote?.body || "";
    const tags = (existingNote?.tags || []).join(", ");
    const isPinned = existingNote?.is_pinned || false;

    const backdrop = document.createElement("div");
    backdrop.id = "knActiveModal";
    backdrop.className = "kn-modal-backdrop";

    backdrop.innerHTML = `
      <div class="kn-modal-sheet wide" role="dialog" aria-modal="true" aria-label="Personal Clinical Note">
        <div class="kn-modal-header">
          <h3 class="kn-modal-title">${existingNote ? 'Edit Personal Note' : 'Create Personal Note'}</h3>
          <button type="button" class="kn-modal-close" data-close-modal aria-label="Close">${ICONS.close}</button>
        </div>

        <div class="kn-modal-body">
          ${item ? `
            <div class="kn-note-linked-source">
              <span>Attached to:</span>
              <strong>${item.title || item.name}</strong>
            </div>
          ` : ''}

          <div class="kn-form-group">
            <label class="kn-form-label">Note Title</label>
            <input type="text" id="knNoteTitle" class="kn-form-input" placeholder="e.g. Propofol infusion syndrome key criteria" value="${title}">
          </div>

          <div class="kn-form-group">
            <label class="kn-form-label">Note Content (supports Markdown / bullet lists)</label>
            <textarea id="knNoteBody" class="kn-form-textarea" rows="8" placeholder="Type your personal clinical notes, pearls, drug calculations, or exam pointers...">${body}</textarea>
          </div>

          <div style="display:flex; gap:16px; flex-wrap:wrap;">
            <div class="kn-form-group" style="flex:1; min-width:200px;">
              <label class="kn-form-label">Tags (comma separated)</label>
              <input type="text" id="knNoteTags" class="kn-form-input" placeholder="ICU, Pharmacology, NEET-SS" value="${tags}">
            </div>
            <div class="kn-form-group" style="justify-content:center;">
              <label class="kn-form-label" style="display:flex; align-items:center; gap:6px; cursor:pointer; margin-top:20px;">
                <input type="checkbox" id="knNotePinned" ${isPinned ? 'checked' : ''}>
                <span>Pin this note to top</span>
              </label>
            </div>
          </div>
        </div>

        <div class="kn-modal-footer">
          ${existingNote ? `<button type="button" class="kn-btn kn-btn-danger" id="knDeleteNoteBtn" style="margin-right:auto;">Delete</button>` : ''}
          <button type="button" class="kn-btn kn-btn-secondary" data-close-modal>Cancel</button>
          <button type="button" class="kn-btn kn-btn-primary" id="knSaveNoteBtn">Save Note</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // Close bindings
    backdrop.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    // Save
    backdrop.querySelector("#knSaveNoteBtn").addEventListener("click", async () => {
      const noteTitle = backdrop.querySelector("#knNoteTitle").value.trim();
      const noteBody = backdrop.querySelector("#knNoteBody").value.trim();
      const noteTags = backdrop.querySelector("#knNoteTags").value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const pinned = backdrop.querySelector("#knNotePinned").checked;

      if (!noteTitle && !noteBody) {
        showToast("Please enter a title or note content", "error");
        return;
      }

      await saveNote({
        id: existingNote?.id,
        title: noteTitle || "Untitled Note",
        body: noteBody,
        tags: noteTags,
        is_pinned: pinned,
        content_id: existingNote?.content_id || item?.content_id || item?.id,
        content_type: existingNote?.content_type || item?.content_type || "study",
        content_title: existingNote?.content_title || item?.title || item?.name,
        route: existingNote?.route || (item ? window.location.pathname + window.location.hash : null)
      });
      closeModal();
    });

    // Delete
    const delBtn = backdrop.querySelector("#knDeleteNoteBtn");
    if (delBtn) {
      delBtn.addEventListener("click", async () => {
        if (confirm("Delete this personal note?")) {
          await deleteNote(existingNote.id);
          closeModal();
        }
      });
    }
  }

  // ==========================================================================
  // TOP NAVIGATION INJECTION & USER DROPDOWN (Phase 1)
  // ==========================================================================
  function renderAvatarInitials(name) {
    if (!name) return "KN";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  function updateNavUser() {
    currentUser = safeJSONParse(localStorage.getItem(STORAGE_KEYS.user), null);
    sessionToken = localStorage.getItem(STORAGE_KEYS.token) || "";
    bookmarksCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.bookmarks), []);
    notesCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.notes), []);
    stickyCache = safeJSONParse(localStorage.getItem(STORAGE_KEYS.stickyNotes), []);

    // 1. Desktop Nav (.kn-desktop-actions)
    const desktopActions = document.querySelector("#knDesktopNav .kn-desktop-actions");
    if (desktopActions) {
      let slot = desktopActions.querySelector(".kn-user-nav-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "kn-user-nav-slot kn-user-nav-wrap";
        // Insert right before theme toggle
        const themeBtn = desktopActions.querySelector("#knDesktopThemeToggle");
        desktopActions.insertBefore(slot, themeBtn);
      }
      renderNavUserContent(slot, false);
    }

    // 2. Mobile Nav (.bubble-nav-actions)
    const mobileActions = document.querySelector("#knBubbleNav .bubble-nav-actions");
    if (mobileActions) {
      let slot = mobileActions.querySelector(".kn-user-nav-slot");
      if (!slot) {
        slot = document.createElement("div");
        slot.className = "kn-user-nav-slot kn-user-nav-wrap";
        // Insert right before theme button
        const themeBtn = mobileActions.querySelector("#knBubbleThemeBtn");
        mobileActions.insertBefore(slot, themeBtn);
      }
      renderNavUserContent(slot, true);
    }
  }

  function renderNavUserContent(slot, isMobile = false) {
    if (!currentUser) {
      if (isMobile) {
        slot.innerHTML = `
          <button type="button" class="bubble-action-btn kn-bubble-user-btn" id="knMobSignIn" title="Sign In or Register" aria-label="Sign In or Register">
            <span class="kn-user-icon-slot">👤</span>
          </button>
        `;
      } else {
        slot.innerHTML = `
          <button type="button" class="kn-user-signin-link" id="knDskSignIn" title="Sign In or Register">
            <span>Sign In</span>
          </button>
        `;
      }
      slot.querySelector("button").addEventListener("click", () => openAuthModal("signin"));
      return;
    }

    const initials = renderAvatarInitials(currentUser.name);
    const avatarHtml = currentUser.avatar_url
      ? `<img src="${currentUser.avatar_url}" alt="${currentUser.name}">`
      : initials;

    if (isMobile) {
      slot.innerHTML = `
        <button type="button" class="bubble-action-btn kn-bubble-user-btn logged-in" id="knMobUserBtn" aria-haspopup="true" aria-expanded="false" title="My Personal Workspace" aria-label="Open Workspace Menu">
          <span class="kn-user-avatar">${avatarHtml}</span>
        </button>
      `;

      let sheet = document.getElementById("knMobileUserSheet");
      if (!sheet) {
        sheet = document.createElement("div");
        sheet.id = "knMobileUserSheet";
        sheet.className = "kn-mobile-user-sheet";
        document.body.appendChild(sheet);
      }

      let backdrop = document.getElementById("knMobileSheetBackdrop");
      if (!backdrop) {
        backdrop = document.createElement("div");
        backdrop.id = "knMobileSheetBackdrop";
        backdrop.className = "kn-mobile-sheet-backdrop";
        document.body.appendChild(backdrop);
      }

      sheet.innerHTML = `
        <div class="kn-sheet-drag-handle" aria-hidden="true"></div>
        <div class="kn-user-dropdown-header">
          <div class="kn-user-dropdown-avatar-large">${avatarHtml}</div>
          <div class="kn-user-dropdown-info">
            <div class="kn-user-dropdown-name">${currentUser.name || "Doctor"}</div>
            <div class="kn-user-dropdown-email">${currentUser.email || ""}</div>
            <div style="margin-top:5px;">
              <span class="kn-sync-status-badge">
                <span class="kn-sync-dot ${isSyncing ? 'syncing' : (navigator.onLine ? '' : 'offline')}"></span>
                <span>${isSyncing ? 'Syncing...' : (navigator.onLine ? 'Cloud Synced' : 'Offline')}</span>
              </span>
            </div>
          </div>
          <button type="button" class="kn-sheet-close-btn" id="knMobSheetCloseBtn" aria-label="Close">✕</button>
        </div>

        <div class="kn-user-menu-list">
          <a href="workspace.html#bookmarks" class="kn-user-menu-item" data-tab="bookmarks">
            <span class="kn-menu-item-icon kn-icon-bm">📌</span>
            <div class="kn-menu-item-content">
              <span class="kn-menu-item-text">View Bookmarks</span>
              <span class="kn-menu-item-desc">Saved study topics, drugs &amp; pearls</span>
            </div>
            <span class="kn-menu-item-badge">${bookmarksCache.length}</span>
            <span class="kn-menu-item-arrow">›</span>
          </a>

          <a href="workspace.html#notes" class="kn-user-menu-item" data-tab="notes">
            <span class="kn-menu-item-icon kn-icon-notes">📝</span>
            <div class="kn-menu-item-content">
              <span class="kn-menu-item-text">My Personal Notes</span>
              <span class="kn-menu-item-desc">Custom clinical summaries &amp; revisions</span>
            </div>
            <span class="kn-menu-item-badge">${notesCache.length}</span>
            <span class="kn-menu-item-arrow">›</span>
          </a>

          <a href="workspace.html#sticky-notes" class="kn-user-menu-item" data-tab="sticky-notes">
            <span class="kn-menu-item-icon kn-icon-sticky">🟨</span>
            <div class="kn-menu-item-content">
              <span class="kn-menu-item-text">My Sticky Notes</span>
              <span class="kn-menu-item-desc">Topic highlights &amp; annotations</span>
            </div>
            <span class="kn-menu-item-badge">${stickyCache.length}</span>
            <span class="kn-menu-item-arrow">›</span>
          </a>

          <a href="workspace.html#profile" class="kn-user-menu-item" data-tab="profile">
            <span class="kn-menu-item-icon kn-icon-settings">⚙️</span>
            <div class="kn-menu-item-content">
              <span class="kn-menu-item-text">Account Settings</span>
              <span class="kn-menu-item-desc">Profile, password &amp; offline data</span>
            </div>
            <span class="kn-menu-item-arrow">›</span>
          </a>
        </div>

        <div class="kn-user-menu-divider"></div>

        <div class="kn-user-menu-actions">
          <button type="button" class="kn-sheet-action-btn" id="knMobSyncBtn">
            <span>🔄</span> <span>Sync Now</span>
          </button>
          <button type="button" class="kn-sheet-action-btn danger" id="knMobLogoutBtn">
            <span>🚪</span> <span>Sign Out</span>
          </button>
        </div>
      `;

      function closeSheet() {
        sheet.classList.remove("open");
        backdrop.classList.remove("open");
        userBtn?.setAttribute("aria-expanded", "false");
      }

      function openSheet() {
        sheet.classList.add("open");
        backdrop.classList.add("open");
        userBtn?.setAttribute("aria-expanded", "true");
      }

      const userBtn = slot.querySelector("#knMobUserBtn");
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (sheet.classList.contains("open")) {
          closeSheet();
        } else {
          openSheet();
        }
      });

      backdrop.addEventListener("click", closeSheet);
      sheet.querySelector("#knMobSheetCloseBtn")?.addEventListener("click", closeSheet);

      sheet.querySelectorAll(".kn-user-menu-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          const tab = item.getAttribute("data-tab");
          closeSheet();
          if (window.location.pathname.endsWith("workspace.html") || window.location.pathname.endsWith("workspace")) {
            e.preventDefault();
            if (typeof window.switchWorkspaceTab === "function") {
              window.switchWorkspaceTab(tab);
            } else {
              window.location.hash = "#" + tab;
            }
          }
        });
      });

      sheet.querySelector("#knMobSyncBtn")?.addEventListener("click", () => {
        syncOfflineQueue();
        closeSheet();
      });

      sheet.querySelector("#knMobLogoutBtn")?.addEventListener("click", () => {
        closeSheet();
        logout();
      });

      return;
    }

    slot.innerHTML = `
      <button type="button" class="kn-user-btn" id="knDskUserBtn" aria-haspopup="true" aria-expanded="false" title="My Personal Workspace">
        <span class="kn-user-avatar">${avatarHtml}</span>
        <span class="kn-user-name">${currentUser.name || "Doctor"}</span>
      </button>

      <div class="kn-user-dropdown" role="menu">
        <div class="kn-user-dropdown-header">
          <div class="kn-user-dropdown-name">${currentUser.name || "Doctor"}</div>
          <div class="kn-user-dropdown-email">${currentUser.email || ""}</div>
          <div style="margin-top:6px;">
            <span class="kn-sync-status-badge">
              <span class="kn-sync-dot ${isSyncing ? 'syncing' : (navigator.onLine ? '' : 'offline')}"></span>
              <span>${isSyncing ? 'Syncing...' : (navigator.onLine ? 'Cloud Synced' : 'Offline')}</span>
            </span>
          </div>
        </div>

        <a href="workspace.html#bookmarks" class="kn-user-menu-item" role="menuitem">
          <span>📌</span> <span>View Bookmarks</span>
          <span class="kn-menu-item-badge" style="margin-left:auto;">${bookmarksCache.length}</span>
        </a>
        <a href="workspace.html#notes" class="kn-user-menu-item" role="menuitem">
          <span>📝</span> <span>My Personal Notes</span>
          <span class="kn-menu-item-badge" style="margin-left:auto;">${notesCache.length}</span>
        </a>
        <a href="workspace.html#sticky-notes" class="kn-user-menu-item" role="menuitem">
          <span>🟨</span> <span>My Sticky Notes</span>
          <span class="kn-menu-item-badge" style="margin-left:auto;">${stickyCache.length}</span>
        </a>
        <a href="workspace.html#profile" class="kn-user-menu-item" role="menuitem">
          <span>⚙️</span> <span>Account Settings</span>
        </a>

        <div class="kn-user-menu-divider"></div>

        <button type="button" class="kn-user-menu-item" id="knSyncNowBtn">
          <span>🔄</span> <span>Sync Now</span>
        </button>
        <button type="button" class="kn-user-menu-item danger" id="knLogoutBtn">
          <span>🚪</span> <span>Logout</span>
        </button>
      </div>
    `;

    const btn = slot.querySelector(".kn-user-btn");
    const dropdown = slot.querySelector(".kn-user-dropdown");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      // Close other dropdowns
      document.querySelectorAll(".kn-user-dropdown").forEach((d) => d.classList.remove("open"));
      if (!isOpen) {
        dropdown.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      } else {
        dropdown.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });

    slot.querySelector("#knLogoutBtn").addEventListener("click", logout);
    slot.querySelector("#knSyncNowBtn").addEventListener("click", () => {
      syncOfflineQueue();
      dropdown.classList.remove("open");
    });
  }

  // Close dropdown on outside click
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".kn-user-nav-wrap")) {
      document.querySelectorAll(".kn-user-dropdown").forEach((d) => d.classList.remove("open"));
      document.querySelectorAll(".kn-user-btn").forEach((b) => b.setAttribute("aria-expanded", "false"));
    }
  });

  // Global Listeners for Online/Offline
  window.addEventListener("online", () => {
    showToast("Internet connection restored. Syncing...", "success");
    syncOfflineQueue();
  });

  window.addEventListener("offline", () => {
    showToast("Working offline. Changes are saved locally.", "info");
    triggerEvent("sync-status", { syncing: false, offline: true });
  });

  // Auto-init on page load
  document.addEventListener("DOMContentLoaded", () => {
    updateNavUser();
    // Observe DOM changes to keep nav avatar present if header re-renders
    const observer = new MutationObserver(() => {
      if (!document.querySelector(".kn-user-nav-slot")) {
        updateNavUser();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial background sync & pending action execution
    if (sessionToken && navigator.onLine) {
      syncOfflineQueue();
      executePendingAction();
    }
  });

  // ==========================================================================
  // EXPORT GLOBAL API (KN_WORKSPACE)
  // ==========================================================================
  window.KN_WORKSPACE = {
    // Session
    getUser: () => currentUser,
    getToken: () => sessionToken,
    isLoggedIn: () => !!currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    openAuthModal,
    updateNavUser,

    // Bookmarks
    isBookmarked,
    toggleBookmark,
    getBookmarks: (cat, q, sort) => {
      let list = [...bookmarksCache];
      if (cat && cat !== "all") list = list.filter((b) => b.category === cat || b.content_type === cat);
      if (q && q.trim()) {
        const query = q.toLowerCase().trim();
        list = list.filter((b) => (b.title && b.title.toLowerCase().includes(query)) || (b.category && b.category.toLowerCase().includes(query)));
      }
      if (sort === "alphabetical") {
        list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      } else {
        list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      }
      return list;
    },
    deleteBookmark: (id) => toggleBookmark({ content_id: id }),

    // Notes
    getNotes,
    saveNote,
    deleteNote,
    openNoteModal,

    // Sticky Notes
    getStickyNotes,
    saveStickyNote,
    deleteStickyNote,
    openStickyModal,

    // Helpers
    sync: syncOfflineQueue,
    showToast,
    on: (evt, fn) => {
      if (!eventListeners[evt]) eventListeners[evt] = [];
      eventListeners[evt].push(fn);
    },

    // HTML Component Generators
    renderBookmarkBtn: (item) => {
      const normId = normalizeContentId(item.content_id || item.id, item.content_type || "study");
      const active = isBookmarked(normId);
      return `
        <button type="button" class="kn-btn-icon-action kn-bookmark-btn ${active ? 'active-bookmark' : ''}"
          data-kn-bookmark-id="${normId}"
          data-kn-item='${JSON.stringify({
            content_id: normId,
            content_type: item.content_type || "study",
            title: item.title || item.name || "Untitled",
            category: item.category || item.cat || "General",
            route: item.route || ""
          }).replace(/'/g, "&apos;")}'
          title="${active ? 'Bookmarked (Click to remove)' : 'Add to Bookmarks'}"
          aria-label="Bookmark" aria-pressed="${active ? 'true' : 'false'}">
          ${active ? ICONS.bookmarkFilled : ICONS.bookmarkOutline}
        </button>
      `;
    },

    renderStickyBtn: (item) => {
      const normId = normalizeContentId(item.content_id || item.id, item.content_type || "study");
      const count = getStickyNotes(normId).length;
      return `
        <button type="button" class="kn-btn-icon-action kn-sticky-btn ${count > 0 ? 'active-sticky' : ''}"
          data-kn-sticky-id="${normId}"
          data-kn-item='${JSON.stringify({
            content_id: normId,
            content_type: item.content_type || "study",
            title: item.title || item.name || "Untitled",
            route: item.route || ""
          }).replace(/'/g, "&apos;")}'
          title="${count > 0 ? `Sticky Note (${count})` : 'Add Sticky Note'}"
          aria-label="Sticky Note">
          ${ICONS.stickyNote}
        </button>
      `;
    },

    renderNoteBtn: (item) => {
      return `
        <button type="button" class="kn-action-chip-btn kn-note-btn"
          data-kn-note-action="add"
          data-kn-item='${JSON.stringify({
            content_id: item.content_id || item.id,
            content_type: item.content_type || "study",
            title: item.title || item.name || "Untitled",
            route: item.route || ""
          }).replace(/'/g, "&apos;")}'
          title="Create Personal Note attached to this topic">
          ${ICONS.noteDoc}
          <span>Personal Note</span>
        </button>
      `;
    }
  };

  // Event Delegation for generated buttons
  document.addEventListener("click", (e) => {
    // 1. Bookmark Click
    const bmBtn = e.target.closest("[data-kn-bookmark-id]");
    if (bmBtn) {
      e.stopPropagation();
      const raw = bmBtn.getAttribute("data-kn-item");
      const item = safeJSONParse(raw, { content_id: bmBtn.dataset.knBookmarkId });
      toggleBookmark(item, bmBtn);
      return;
    }

    // 2. Sticky Note Click
    const stickyBtn = e.target.closest("[data-kn-sticky-id]");
    if (stickyBtn) {
      e.stopPropagation();
      const raw = stickyBtn.getAttribute("data-kn-item");
      const item = safeJSONParse(raw, { content_id: stickyBtn.dataset.knStickyId });
      const notes = getStickyNotes(item.content_id);
      openStickyModal(item, notes[0] || null);
      return;
    }

    // 3. Personal Note Click
    const noteBtn = e.target.closest("[data-kn-note-action]");
    if (noteBtn) {
      e.stopPropagation();
      const raw = noteBtn.getAttribute("data-kn-item");
      const item = safeJSONParse(raw, null);
      openNoteModal(item);
      return;
    }
  });

})();
