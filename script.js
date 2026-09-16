// ==========================================================================
// KNOCKOUTNOTES — Unified Core JavaScript Engine (script.js)
// Mode Switcher (3D vs Lite), Theme, ECG Monitor, API Client & UI Interactions
// ==========================================================================

(function () {
  "use strict";

  function initKnockoutNotes() {
    const body = document.body;
    if (!body) return;

    // ------------------------------------------------------------------------
    // 1. Dual-Mode Switcher Controller (3D View vs Lite View)
    // ------------------------------------------------------------------------
    function initModeSwitch() {
      let savedMode = null;
      try { savedMode = localStorage.getItem("kn_view_mode"); } catch (_) {}
      const defaultMode = savedMode || "3d";

      function applyMode(mode) {
        const is3D = mode === "3d";
        body.classList.toggle("mode-3d", is3D);
        body.classList.toggle("mode-lite", !is3D);
        try { localStorage.setItem("kn_view_mode", mode); } catch (_) {}

        // Update mode toggle buttons
        document.querySelectorAll(".kn-mode-btn").forEach(btn => {
          const btnMode = btn.dataset.mode;
          btn.classList.toggle("active", btnMode === mode);
        });
      }

      applyMode(defaultMode);

      document.querySelectorAll(".kn-mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          applyMode(btn.dataset.mode);
        });
      });
    }

    initModeSwitch();

    // ------------------------------------------------------------------------
    // 2. Theme Engine (Obsidian Void default vs Clean Luminescence)
    // ------------------------------------------------------------------------
    function applyTheme(theme) {
      const isDark = theme === "dark";
      body.classList.toggle("dark", isDark);
      try { localStorage.setItem("kn-theme", theme); } catch (_) {}
      document.querySelectorAll("#themeBtn, #themeBtn3d, .theme-btn, [data-theme-btn]").forEach(btn => {
        btn.textContent = isDark ? "☀" : "☾";
        btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      });
    }

    let savedTheme = null;
    try { savedTheme = localStorage.getItem("kn-theme"); } catch (_) {}
    applyTheme(savedTheme || "dark");

    document.querySelectorAll("#themeBtn, #themeBtn3d, .theme-btn, [data-theme-btn]").forEach(btn => {
      btn.addEventListener("click", () => {
        applyTheme(body.classList.contains("dark") ? "light" : "dark");
      });
    });

    // ------------------------------------------------------------------------
    // 3. Floating Medical HUD Navigation Scroll State & Active Links
    // ------------------------------------------------------------------------
    const huds = document.querySelectorAll(".site-hud, .site-nav");
    if (huds.length) {
      window.addEventListener("scroll", () => {
        const isScrolled = window.scrollY > 20;
        huds.forEach(hud => hud.classList.toggle("scrolled", isScrolled));
      }, { passive: true });
    }

    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-menu a").forEach(link => {
      const href = link.getAttribute("href");
      if (href === currentPath || (currentPath === "" && href === "index.html")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // ------------------------------------------------------------------------
    // 3b. Background Scroll Lock (mobile drawer / search modal)
    // ------------------------------------------------------------------------
    // Reference-counted so the drawer and the search modal (which can, in
    // principle, both want the lock at once — e.g. ⌘K fired while the menu
    // is open) don't clobber each other's unlock. Without this, the page
    // kept scrolling underneath an open mobile menu or search modal.
    //
    // Deliberately NOT `overflow: hidden` on <html>/<body>: toggling
    // overflow on the root breaks WebKit's position:sticky containing-
    // block bookkeeping for descendants (the site's own sticky header),
    // which is exactly what made the mobile drawer open fine once and then
    // "stick"/stop responding on the very next open — the header's sticky
    // context got corrupted by the first lock/unlock cycle. Locking the
    // BODY to position:fixed at its current scroll offset avoids touching
    // <html> or its overflow entirely, which is the standard robust
    // technique for this on mobile Safari/WebKit.
    const scrollLockReasons = new Set();
    let scrollLockY = 0;
    function setScrollLock(id, locked) {
      const wasActive = scrollLockReasons.size > 0;
      if (locked) scrollLockReasons.add(id); else scrollLockReasons.delete(id);
      const active = scrollLockReasons.size > 0;
      if (active && !wasActive) {
        scrollLockY = window.scrollY || window.pageYOffset || 0;
        body.style.top = (-scrollLockY) + "px";
        body.classList.add("kn-scroll-locked");
      } else if (!active && wasActive) {
        body.classList.remove("kn-scroll-locked");
        body.style.top = "";
        window.scrollTo(0, scrollLockY);
      }
    }
    // Exposed so other independently-loaded scripts (e.g. spatial-viewer.js's
    // document viewer) share this SAME reference-counted lock instead of
    // reinventing their own — a second, uncoordinated lock could unlock the
    // page while another overlay still needs it locked, and (worse) any
    // reimplementation that reaches for plain `overflow: hidden` on
    // <html>/<body> reintroduces the exact sticky-header corruption bug this
    // technique exists to avoid (see the comment above setScrollLock).
    window.KnockoutScrollLock = { set: setScrollLock };

    // ------------------------------------------------------------------------
    // 4. Mobile Navigation Drawer
    // ------------------------------------------------------------------------
    document.querySelectorAll(".menu-btn, #menuBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const header = btn.closest(".site-hud, .site-nav, header") || document;
        const mobileMenu = header.querySelector(".mobile-menu") || document.getElementById("mobileMenu");
        if (mobileMenu) {
          const willOpen = !mobileMenu.classList.contains("open");
          // Snapshot/lock scroll BEFORE the menu's own class toggle grows
          // .site-hud's height (it's a flow sibling of the header capsule,
          // not an overlay) — capturing scrollY after that point picks up
          // whatever the browser's scroll-anchoring already shifted it by
          // to compensate for ~500px of new content appearing above the
          // fold, which was the actual cause of the drawer "sticking":
          // each open/close cycle restored to a wrong, drifting offset.
          if (willOpen) setScrollLock("menu", true);
          mobileMenu.classList.toggle("open", willOpen);
          btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
          btn.textContent = willOpen ? "✕" : "⋮";
          if (!willOpen) setScrollLock("menu", false);
        }
      });
    });

    document.querySelectorAll("[data-close-menu]").forEach(link => {
      link.addEventListener("click", () => {
        document.querySelectorAll(".mobile-menu.open").forEach(m => m.classList.remove("open"));
        document.querySelectorAll(".menu-btn, #menuBtn").forEach(b => {
          b.setAttribute("aria-expanded", "false");
          b.textContent = "⋮";
        });
        setScrollLock("menu", false);
      });
    });

    // ------------------------------------------------------------------------
    // 5. Active Recall Mechanics (Accordion / Answer Reveal)
    // ------------------------------------------------------------------------
    // ------------------------------------------------------------------------
    // 4b. Progressive Web App (PWA) Engine:
    // - Full offline support & background update checks
    // - One-click Install app button for Android and PC/Desktop
    // - Online/Offline status banner
    // - Seamless "Update Available — Reload to update" toast
    // ------------------------------------------------------------------------
    let deferredPrompt = null;
    let newWorker = null;

    function showNetworkPill(isOnline) {
      let pill = document.getElementById("knNetworkPill");
      if (!pill) {
        pill = document.createElement("div");
        pill.id = "knNetworkPill";
        pill.className = "kn-network-pill";
        document.body.appendChild(pill);
      }
      pill.textContent = isOnline ? "● Online — Up to date" : "● Offline Mode — Working Offline";
      pill.className = `kn-network-pill ${isOnline ? "online" : "offline"} show`;
      window.setTimeout(() => {
        pill.classList.remove("show");
      }, 3500);
    }

    window.addEventListener("online", () => showNetworkPill(true));
    window.addEventListener("offline", () => showNetworkPill(false));

    function createUpdateToast() {
      let toast = document.getElementById("knUpdateToast");
      if (!toast) {
        toast = document.createElement("div");
        toast.id = "knUpdateToast";
        toast.className = "kn-pwa-toast";
        toast.setAttribute("role", "alert");
        toast.innerHTML = `
          <div class="kn-pwa-toast-icon">⚡</div>
          <div class="kn-pwa-toast-content">
            <div class="kn-pwa-toast-title">Update Available</div>
            <div class="kn-pwa-toast-desc">A fresh clinical update is ready to load.</div>
            <div class="kn-pwa-toast-actions">
              <button class="kn-pwa-btn primary" id="knPwaUpdateBtn">Update Now</button>
              <button class="kn-pwa-btn ghost" id="knPwaDismissBtn">Later</button>
            </div>
          </div>
        `;
        document.body.appendChild(toast);

        toast.querySelector("#knPwaUpdateBtn").addEventListener("click", () => {
          if (newWorker) {
            newWorker.postMessage({ action: "skipWaiting" });
          } else {
            window.location.reload();
          }
        });

        toast.querySelector("#knPwaDismissBtn").addEventListener("click", () => {
          toast.classList.remove("show");
        });
      }
      toast.classList.add("show");
    }

    if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").then((reg) => {
          // Check for background updates periodically when online
          reg.addEventListener("updatefound", () => {
            const installingWorker = reg.installing;
            if (!installingWorker) return;
            installingWorker.addEventListener("statechange", () => {
              if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                newWorker = installingWorker;
                createUpdateToast();
              }
            });
          });

          // Check for service worker updates whenever the page gains focus or online
          window.addEventListener("online", () => reg.update().catch(() => {}));
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              reg.update().catch(() => {});
            }
          });
        }).catch(() => {});

        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      });
    }

    // Capture install prompt for Android and PC desktop Chrome/Edge
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Show install button in HUD if not already installed and not in standalone mode
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
      if (isStandalone) return;

      const isCalcPage = window.location.pathname.includes("calculators");
      const appTitle = isCalcPage ? "Install Calculators App" : "Install App";
      const appDesc = isCalcPage
        ? "Add offline Clinical Calculators & Paediatric Sizer to your home screen or PC desktop."
        : "Add KnockoutNotes to your device for instant offline access and updates.";

      // 1. Inject subtle Install button in navigation HUDs
      document.querySelectorAll(".nav-actions").forEach((actions) => {
        if (!actions.querySelector(".hud-install-btn")) {
          const btn = document.createElement("button");
          btn.className = "hud-install-btn";
          btn.title = isCalcPage ? "Install Offline Calculators App" : "Install KnockoutNotes App";
          btn.innerHTML = `<span>⤓</span> <span>${isCalcPage ? "Install Calc" : "Install"}</span>`;
          btn.addEventListener("click", () => promptInstall());
          actions.insertBefore(btn, actions.firstChild);
        }
      });

      // 2. Also inject install option in mobile menus
      document.querySelectorAll(".mobile-menu").forEach((menu) => {
        if (!menu.querySelector(".menu-install-link")) {
          const a = document.createElement("a");
          a.className = "menu-install-link";
          a.href = "#";
          a.innerHTML = `<span>⤓ ${isCalcPage ? "Install Calculators App" : "Install App (Offline)"}</span> <span>✦</span>`;
          a.addEventListener("click", (evt) => {
            evt.preventDefault();
            promptInstall();
          });
          menu.insertBefore(a, menu.firstChild);
        }
      });

      // 3. Wire any in-page banner install buttons
      document.querySelectorAll("#btnInstallCalcBanner3d, #btnInstallCalcBanner").forEach((btn) => {
        btn.addEventListener("click", () => promptInstall());
      });

      function promptInstall() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            document.querySelectorAll(".hud-install-btn, .menu-install-link").forEach(el => el.remove());
          });
        }
      }
    });

    // Fallback click handler for static banner buttons if clicked before beforeinstallprompt
    document.querySelectorAll("#btnInstallCalcBanner3d, #btnInstallCalcBanner").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
        } else {
          // Check if already installed
          if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) {
            showNetworkPill(navigator.onLine);
          } else {
            alert("To install on PC: Click the 'Install' icon (⤓) in your browser address bar.\n\nTo install on Android: Tap browser menu (⋮) -> 'Install app' or 'Add to Home screen'.\n\nTo install on iOS: Tap Share (⬆) -> 'Add to Home Screen'.");
          }
        }
      });
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      document.querySelectorAll(".hud-install-btn, .menu-install-link").forEach(el => el.remove());
      showNetworkPill(true);
    });

    // ------------------------------------------------------------------------
    // 5. Active Recall Answer Reveal & Mastery Helpers
    // ------------------------------------------------------------------------
    const UNDERSTOOD_KEY = "kn_understood_cards";
    function getUnderstoodCards() {
      try { return JSON.parse(localStorage.getItem(UNDERSTOOD_KEY) || "[]"); } catch(_) { return []; }
    }
    function toggleUnderstoodCard(id) {
      if (!id) return false;
      try {
        let list = getUnderstoodCards();
        const exists = list.includes(id);
        if (exists) {
          list = list.filter(item => item !== id);
        } else {
          list.push(id);
        }
        localStorage.setItem(UNDERSTOOD_KEY, JSON.stringify(list));
        return !exists;
      } catch(_) { return false; }
    }

    function wireRevealButtons(root = document) {
      // Wire active recall mastery toggles in all answers
      root.querySelectorAll(".answer").forEach((ans, idx) => {
        const card = ans.closest(".card, .quick-card");
        const cardId = ans.id || (card && card.id) || `ans_${idx}`;
        if (!ans.querySelector(".kn-answer-actions")) {
          const understoodList = getUnderstoodCards();
          const isUnderstood = understoodList.includes(cardId);

          const actions = document.createElement("div");
          actions.className = "kn-answer-actions";
          actions.innerHTML = `
            <button type="button" class="kn-action-btn ${isUnderstood ? "understood-active" : ""}" data-card-id="${cardId}">
              <span>${isUnderstood ? "✓ Understood" : "○ Mark as Understood"}</span>
            </button>
          `;
          ans.appendChild(actions);

          const actionBtn = actions.querySelector(".kn-action-btn");
          actionBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const nowUnderstood = toggleUnderstoodCard(cardId);
            actionBtn.classList.toggle("understood-active", nowUnderstood);
            actionBtn.querySelector("span").textContent = nowUnderstood ? "✓ Understood" : "○ Mark as Understood";
          });
        }
      });

      root.querySelectorAll(".reveal").forEach(btn => {
        if (btn.dataset.wired) return;
        btn.dataset.wired = "1";
        btn.setAttribute("aria-expanded", "false");

        btn.addEventListener("click", () => {
          let target = null;
          const container = btn.closest(".view-layer-3d, .view-layer-lite, .spatial-stage, .lite-stage, .card, .quick-card") || document;
          if (btn.dataset.target) {
            target = container.querySelector("#" + CSS.escape(btn.dataset.target));
          }
          if (!target) {
            target = btn.closest(".card, .quick-card")?.querySelector(".answer");
          }
          if (!target && btn.dataset.target) {
            target = document.getElementById(btn.dataset.target);
          }
          if (!target) return;

          const open = target.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = open ? "Hide Answer" : "Reveal Answer";
          if (window.KnockoutSpatialBg && typeof window.KnockoutSpatialBg.triggerRipple === "function") {
            const rect = btn.getBoundingClientRect();
            window.KnockoutSpatialBg.triggerRipple(rect.left + rect.width * 0.5, rect.top + rect.height * 0.5);
          }
        });
      });
    }

    wireRevealButtons();

    // ------------------------------------------------------------------------
    // 5b. Hash Navigation & Answer Auto-Reveal
    // ------------------------------------------------------------------------
    function handleHashReveal() {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;
      const is3D = body.classList.contains("mode-3d");
      let target = null;
      if (is3D) {
        target = document.getElementById(hash + "3d") || document.getElementById(hash);
      } else {
        target = document.getElementById(hash) || document.getElementById(hash.replace(/3d$/, ""));
      }
      if (!target) return;
      const answer = target.classList.contains("answer") ? target : target.querySelector(".answer");
      if (answer) {
        answer.classList.add("open");
        const btn = target.closest(".card, .quick-card")?.querySelector(".reveal");
        if (btn) {
          btn.textContent = "Hide Answer";
          btn.setAttribute("aria-expanded", "true");
        }
      }
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.classList.remove("kn-highlight-pulse");
        void target.offsetWidth;
        target.classList.add("kn-highlight-pulse");
      }, 150);
    }
    handleHashReveal();
    window.addEventListener("hashchange", handleHashReveal);

    // ------------------------------------------------------------------------
    // 6. Scroll Entrance Animations (IntersectionObserver)
    // ------------------------------------------------------------------------
    // Staggered cascade: siblings that share a parent (a row of bento cards,
    // a grid of pearls) get an incremental --fade-delay so they rise in as a
    // wave rather than all popping in on the same frame. Computed once from
    // static DOM order — no layout thrashing, just a custom-property write.
    function applyFadeStagger(root = document) {
      const groups = new Map();
      root.querySelectorAll(".fade").forEach(el => {
        if (el.style.getPropertyValue("--fade-delay")) return;
        const parent = el.parentElement;
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(el);
      });
      groups.forEach(siblings => {
        siblings.forEach((el, i) => {
          el.style.setProperty("--fade-delay", (Math.min(i, 5) * 90) + "ms");
        });
      });
    }
    applyFadeStagger();

    const observer = ("IntersectionObserver" in window)
      ? new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              observer.unobserve(e.target);
            }
          });
        }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" })
      : null;

    if (observer) {
      document.querySelectorAll(".fade").forEach(el => observer.observe(el));
    }

    // ------------------------------------------------------------------------
    // 7. Category Filter Pills
    // ------------------------------------------------------------------------
    document.querySelectorAll("[data-filter]").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach(x => x.classList.remove("active"));
        btn.classList.add("active");
        const category = (btn.dataset.filter || "all").toLowerCase();
        document.querySelectorAll(".filter-card").forEach(card => {
          const cardCat = (card.dataset.category || "").toLowerCase();
          const matches = category === "all" || cardCat === category;
          card.style.display = matches ? "flex" : "none";
        });
      });
    });

    // ------------------------------------------------------------------------
    // 8. In-Page Card Filter Search (Supports Titles, Tags, & Answers)
    // ------------------------------------------------------------------------
    const searchInputs = document.querySelectorAll("#search, #pearlSearch, #pearlSearch3d, .search");
    searchInputs.forEach(input => {
      input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        document.querySelectorAll(".filter-card").forEach(card => {
          const content = (card.textContent || "").toLowerCase();
          const matches = !q || content.includes(q);
          card.style.display = matches ? "flex" : "none";
          // If query matched text specifically in answer, auto reveal the answer for active recall convenience
          if (q && matches) {
            const ans = card.querySelector(".answer");
            if (ans && ans.textContent.toLowerCase().includes(q)) {
              ans.classList.add("open");
              const btn = card.querySelector(".reveal");
              if (btn) {
                btn.textContent = "Hide Answer";
                btn.setAttribute("aria-expanded", "true");
              }
            }
          }
        });
      });
    });

    // ------------------------------------------------------------------------
    // 9. Universal Command Palette / Search Modal
    // ------------------------------------------------------------------------
    const searchModal = document.getElementById("knSearchModal");
    const modalInput = document.getElementById("knModalSearchInput");
    const modalClose = document.querySelectorAll("[data-close-modal]");
    const searchTriggers = document.querySelectorAll("[data-open-search], .nav-search-trigger, .btn-hud-tool");

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.classList.add("open");
      setScrollLock("search", true);
      if (modalInput) {
        modalInput.value = "";
        setTimeout(() => modalInput.focus(), 60);
      }
      if (window.KnockoutNotesSiteSearch && typeof window.KnockoutNotesSiteSearch.trigger === "function") {
        window.KnockoutNotesSiteSearch.trigger("");
      }
    }

    function closeSearchModal() {
      if (!searchModal) return;
      searchModal.classList.remove("open");
      setScrollLock("search", false);
    }

    searchTriggers.forEach(btn => btn.addEventListener("click", openSearchModal));
    modalClose.forEach(btn => btn.addEventListener("click", closeSearchModal));

    window.addEventListener("keydown", e => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchModal && searchModal.classList.contains("open")) {
          closeSearchModal();
        } else {
          openSearchModal();
        }
      } else if (e.key === "Escape" && searchModal && searchModal.classList.contains("open")) {
        closeSearchModal();
      }
    });

    // ------------------------------------------------------------------------
    // 10. Live Animated ECG Waveform Monitor & Vitals Engine (Hero Centerpiece)
    // ------------------------------------------------------------------------
    const ecgCanvases = Array.from(document.querySelectorAll("#knEcgCanvas, #knEcgCanvas3d, .ecg-screen canvas"));
    if (ecgCanvases.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Dynamic state tracked per canvas to support full PC screen widths and multi-layers
      const canvasStates = new Map();

      function resizeCanvas(cvs) {
        const parent = cvs.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssW = Math.floor(rect.width);
        const cssH = Math.floor(rect.height);

        if (cvs.width !== Math.round(cssW * dpr) || cvs.height !== Math.round(cssH * dpr)) {
          cvs.width = Math.round(cssW * dpr);
          cvs.height = Math.round(cssH * dpr);
        }
        cvs.style.width = cssW + "px";
        cvs.style.height = cssH + "px";

        const ctx = cvs.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Scale context to CSS pixels
        }

        let state = canvasStates.get(cvs);
        if (!state) {
          state = {
            scanX: 0,
            history: new Float32Array(cssW + 120).fill(0),
            cssW: cssW,
            cssH: cssH
          };
          canvasStates.set(cvs, state);
        } else {
          if (state.history.length < cssW + 120) {
            const newHist = new Float32Array(cssW + 120);
            newHist.set(state.history.subarray(0, Math.min(state.history.length, cssW)));
            state.history = newHist;
          }
          state.cssW = cssW;
          state.cssH = cssH;
          if (state.scanX >= cssW) {
            state.scanX = 0;
          }
        }
      }

      function resizeAllCanvases() {
        ecgCanvases.forEach(resizeCanvas);
      }

      resizeAllCanvases();
      window.addEventListener("resize", resizeAllCanvases, { passive: true });

      if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
          resizeAllCanvases();
        });
        document.querySelectorAll(".ecg-screen").forEach(el => ro.observe(el));
      }

      // Smooth continuous Lead II ECG waveform model (physiological P, Q, R, S, T, U)
      function getEcgY(progress) {
        const p = ((progress % 1) + 1) % 1;
        // Baseline
        if (p < 0.14) return 0;
        // P-wave (Atrial depolarisation)
        if (p < 0.24) {
          const t = (p - 0.14) / 0.10;
          return Math.sin(t * Math.PI) * 0.18;
        }
        // PR segment
        if (p < 0.34) return 0;
        // Q-wave (Septal depolarisation)
        if (p < 0.37) {
          const t = (p - 0.34) / 0.03;
          return -Math.sin(t * Math.PI) * 0.14;
        }
        // R-wave (Sharp QRS ventricular depolarisation spike)
        if (p < 0.43) {
          const t = (p - 0.37) / 0.06;
          return Math.sin(t * Math.PI) * 1.05;
        }
        // S-wave (Late ventricular depolarisation)
        if (p < 0.47) {
          const t = (p - 0.43) / 0.04;
          return -Math.sin(t * Math.PI) * 0.32;
        }
        // ST segment
        if (p < 0.56) return 0;
        // T-wave (Ventricular repolarisation)
        if (p < 0.76) {
          const t = (p - 0.56) / 0.20;
          return Math.pow(Math.sin(t * Math.PI), 1.25) * 0.32;
        }
        // U-wave (Purkinje repolarisation)
        if (p < 0.82) {
          const t = (p - 0.76) / 0.06;
          return Math.sin(t * Math.PI) * 0.04;
        }
        return 0;
      }

      // Live Physiological Vitals Simulator (Drifts smoothly within clinical normal targets)
      const vitalsData = {
        hr: 72,
        spo2: 99,
        map: 85,
        etco2: 38,
        mac: 1.05
      };

      function updateVitalsDisplay(tickEl) {
        document.querySelectorAll(".kn-vital-hr, .hud-hr-val").forEach(el => { el.textContent = vitalsData.hr; });
        document.querySelectorAll(".kn-vital-spo2").forEach(el => { el.textContent = vitalsData.spo2; });
        document.querySelectorAll(".kn-vital-map").forEach(el => { el.textContent = vitalsData.map; });
        document.querySelectorAll(".kn-vital-etco2, .hud-etco2-val").forEach(el => { el.textContent = vitalsData.etco2; });
        document.querySelectorAll(".kn-vital-mac, .hud-mac-val").forEach(el => { el.textContent = vitalsData.mac.toFixed(2); });

        if (tickEl) {
          document.querySelectorAll(".vital-box .vital-val").forEach(el => {
            el.classList.add("vital-tick");
            setTimeout(() => el.classList.remove("vital-tick"), 260);
          });
        }
      }

      function tickVitals() {
        if (document.hidden) return;
        // Natural physiological drift
        const hrDrift = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
        vitalsData.hr = Math.max(69, Math.min(75, vitalsData.hr + hrDrift));

        const rSpo2 = Math.random();
        vitalsData.spo2 = rSpo2 > 0.85 ? 100 : (rSpo2 < 0.08 ? 98 : 99);

        const mapDrift = Math.floor(Math.random() * 3) - 1;
        vitalsData.map = Math.max(83, Math.min(88, vitalsData.map + mapDrift));

        const etco2Drift = Math.floor(Math.random() * 3) - 1;
        vitalsData.etco2 = Math.max(36, Math.min(39, vitalsData.etco2 + etco2Drift));

        const macDrift = (Math.random() - 0.5) * 0.02;
        vitalsData.mac = +(Math.max(1.02, Math.min(1.08, vitalsData.mac + macDrift))).toFixed(2);

        updateVitalsDisplay(true);
      }

      // Automatically animate values every 3 seconds
      setInterval(tickVitals, 3000);
      updateVitalsDisplay(false);

      // Smooth calibrated sweep parameters: ~68 px/sec (calm, authentic 25 mm/s clinical sweep)
      let lastTime = performance.now();
      const sweepPixelsPerSecond = 68;
      const scanWidth = 26; // Erase bar ahead of sweep head

      function renderEcg(now) {
        if (document.hidden) {
          lastTime = now;
          requestAnimationFrame(renderEcg);
          return;
        }

        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        const step = sweepPixelsPerSecond * dt;

        const isDark = body.classList.contains("dark");
        const traceColor = isDark ? "#38bdf8" : "#0284c7";
        const glowColor = isDark ? "rgba(56, 189, 248, 0.45)" : "rgba(2, 132, 199, 0.35)";

        ecgCanvases.forEach(cvs => {
          if (cvs.offsetParent === null) return;
          let state = canvasStates.get(cvs);
          if (!state) {
            resizeCanvas(cvs);
            state = canvasStates.get(cvs);
            if (!state) return;
          }

          const eCtx = cvs.getContext("2d");
          if (!eCtx) return;

          const w = state.cssW;
          const h = state.cssH;
          if (w <= 0 || h <= 0) return;

          const cycleLength = 175; // Diagnostic wave cycle width
          const midY = h * 0.58;
          const amp = h * 0.40;

          const startX = state.scanX;
          const endX = startX + step;

          // Erase ahead (sweep gap) with wrap-around support for smooth edge transition
          eCtx.clearRect(startX, 0, scanWidth, h);
          if (startX + scanWidth > w) {
            eCtx.clearRect(0, 0, (startX + scanWidth) - w, h);
          }

          // Sample waveform position and draw segment
          const progress = (startX % cycleLength) / cycleLength;
          const sampleVal = getEcgY(progress);
          const curY = midY - sampleVal * amp;

          const prevIndex = Math.floor(startX);
          state.history[prevIndex] = curY;

          const prevX = startX > 0 ? startX - step : 0;
          const prevY = state.history[Math.floor(prevX)] || curY;

          eCtx.beginPath();
          eCtx.moveTo(prevX, prevY);
          eCtx.lineTo(startX, curY);
          eCtx.strokeStyle = traceColor;
          eCtx.lineWidth = 2.2;
          eCtx.lineCap = "round";
          eCtx.lineJoin = "round";
          eCtx.shadowColor = glowColor;
          eCtx.shadowBlur = 8;
          eCtx.stroke();
          eCtx.shadowBlur = 0;

          // Glowing phosphor sweep head dot
          eCtx.beginPath();
          eCtx.arc(startX, curY, 3.2, 0, Math.PI * 2);
          eCtx.fillStyle = isDark ? "#ffffff" : traceColor;
          eCtx.shadowColor = glowColor;
          eCtx.shadowBlur = 12;
          eCtx.fill();
          eCtx.shadowBlur = 0;

          // Advance scanX across the FULL WIDTH of the canvas without artificial caps
          state.scanX = endX;
          if (state.scanX >= w) {
            state.scanX = 0;
          }
        });

        requestAnimationFrame(renderEcg);
      }

      requestAnimationFrame(renderEcg);
    }

    // ------------------------------------------------------------------------
    // 11. Loading Skeletons — written synchronously, before any fetch, so a
    // slow API response never reads as a blank/broken section. Overwritten
    // wholesale the moment real content arrives via the existing innerHTML
    // assignments below.
    // ------------------------------------------------------------------------
    function skeletonCards(n) {
      let html = "";
      for (let i = 0; i < n; i++) {
        html += `
          <div class="card kn-skeleton-card" aria-hidden="true">
            <div class="kn-skeleton-line kn-sk-tag"></div>
            <div class="kn-skeleton-line kn-sk-title"></div>
            <div class="kn-skeleton-line kn-sk-body"></div>
            <div class="kn-skeleton-line kn-sk-body"></div>
          </div>`;
      }
      return html;
    }

    function skeletonTickerItems(n) {
      let html = "";
      for (let i = 0; i < n; i++) {
        html += '<span class="kn-ticker-item kn-skeleton-ticker-item" aria-hidden="true"><span class="kn-skeleton-line"></span></span>';
      }
      return html;
    }

    // ------------------------------------------------------------------------
    // 12. Google Sheets API Client & Data Cache
    // ------------------------------------------------------------------------
    const CACHE_KEY = "kn_sheet_cache_v4";
    const CACHE_TTL_MS = 60 * 1000;

    function esc(s) {
      return String(s || "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      }[c]));
    }

    function norm(s) {
      return String(s || "").toLowerCase().trim();
    }

    function dateValue(d, order) {
      const parsed = Date.parse(d);
      return !Number.isNaN(parsed) ? parsed : -order;
    }

    function loadData() {
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw);
          if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
            return Promise.resolve(cached.data);
          }
        }
      } catch (_) {}

      const apiUrl = window.KNOCKOUTNOTES_API
        || (window.KNOCKOUTNOTES_CONFIG && window.KNOCKOUTNOTES_CONFIG.API_URL)
        || "https://script.google.com/macros/s/AKfycbzS4wg6AKdKvMYCDxyHMb8wKtEIqNZLddhKyqq0MKUh_pDjYUqLklq2TYnPA2W_-gE/exec";

      return fetch(apiUrl)
        .then(r => {
          if (!r.ok) throw new Error("HTTP error " + r.status);
          return r.json();
        })
        .then(payload => {
          if (!payload || !Array.isArray(payload.data)) return [];
          const items = payload.data.map((x, i) => ({
            type: x.Type || "",
            category: x.Category || "",
            title: x.Title || "",
            summary: x.Summary || "",
            answer: x.Answer || "",
            reference: x.Reference || "",
            date: x.Date || "",
            url: x.URL || x.Url || x.url || "",
            pdf: x.PDF || x.Pdf || "",
            slides: x.Slides || "",
            tags: x.Tags || "",
            order: i
          })).filter(x => x.title);

          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: items }));
          } catch (_) {}

          return items;
        });
    }

    function newest(items) {
      return items.slice().sort(
        (a, b) => dateValue(b.date, b.order) - dateValue(a.date, a.order)
      );
    }

    function resourceLinks(x) {
      let links = "";
      if (x.url) {
        links += `<a class="btn-cinematic glass" style="padding:7px 14px;font-size:12px;" href="${esc(x.url)}" target="_blank" rel="noopener">🔗 Source</a>`;
      }
      if (x.pdf) {
        links += `<a class="btn-cinematic glass" style="padding:7px 14px;font-size:12px;" href="${esc(x.pdf)}" target="_blank" rel="noopener">📄 PDF</a>`;
      }
      if (x.slides) {
        links += `<a class="btn-cinematic glass" style="padding:7px 14px;font-size:12px;" href="${esc(x.slides)}" target="_blank" rel="noopener">🎞 Slides</a>`;
      }
      return links ? `<div class="hero-actions" style="margin-top:16px;gap:8px;">${links}</div>` : "";
    }

    // ------------------------------------------------------------------------
    // 13. Populate Marquee Ticker (Viva & Home)
    // ------------------------------------------------------------------------
    const tickers = document.querySelectorAll("#knLatestTicker, .kn-latest-ticker");
    if (tickers.length) {
      tickers.forEach(t => { t.innerHTML = skeletonTickerItems(6); });
      loadData().then(data => {
        const latest = newest(data).slice(0, 8);
        if (!latest.length) throw new Error("Empty ticker");
        const items = latest.map(x => `
          <span class="kn-ticker-item">
            <span class="kn-ticker-dot"></span>
            <span class="kn-ticker-type">${esc(x.type || "Note")}</span>
            <span class="kn-ticker-title">${esc(x.title)}</span>
            ${x.date ? `<span class="kn-ticker-date">${esc(x.date)}</span>` : ""}
          </span>`).join("");
        tickers.forEach(t => { t.innerHTML = items + items; });
      }).catch(() => {
        tickers.forEach(t => {
          t.innerHTML =
            '<span class="kn-ticker-item"><span class="kn-ticker-dot"></span>' +
            '<span class="kn-ticker-title">High-yield anaesthesia, critical care & viva updates.</span></span>';
        });
      });
    }

    // ------------------------------------------------------------------------
    // 14. Populate Home Bento Guideline Watch Widget
    // ------------------------------------------------------------------------
    const homeUpdatesList = document.querySelectorAll("#knHomeUpdates, #knHomeUpdates3d, .kn-home-updates");
    if (homeUpdatesList.length) {
      homeUpdatesList.forEach(el => { el.innerHTML = skeletonCards(2); });
      loadData().then(data => {
        const updates = newest(data.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        })).slice(0, 4);

        homeUpdatesList.forEach(homeUpdates => {
          if (!updates.length) {
            homeUpdates.innerHTML = '<p style="margin:0;font-size:13.5px;color:var(--text-muted);">No new guideline alerts today.</p>';
            return;
          }

          homeUpdates.innerHTML = updates.map(x => `
            <a class="kn-search-result" style="padding:14px 18px;margin-bottom:10px;" href="recent-updates.html">
              <div class="kn-search-result-top">
                <span class="kn-search-type">🚨 ${esc(x.category || "Guideline")}</span>
                ${x.date ? `<span class="card-date">• ${esc(x.date)}</span>` : ""}
              </div>
              <h4 style="margin:6px 0 4px;font-size:15px;">${esc(x.title)}</h4>
              ${x.summary ? `<p style="font-size:13px;margin:0;color:var(--text-secondary);">${esc(x.summary)}</p>` : ""}
            </a>`).join("");
        });
      }).catch(() => {
        homeUpdatesList.forEach(homeUpdates => {
          homeUpdates.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin:0;">Recent guideline alerts will appear here.</p>';
        });
      });
    }

    // ------------------------------------------------------------------------
    // 15. Populate Section Pages (Drugs, Critical Care, etc.)
    // ------------------------------------------------------------------------
    const sheetContents = document.querySelectorAll("#sheetContent, #sheetContent3d, .sheet-content");
    if (sheetContents.length) {
      const page = norm(body.dataset.contentPage || "");
      const typeMap = {
        pearls: ["pearl", "pearls"],
        notes: ["note", "notes"],
        viva: ["viva"],
        drugs: ["drug", "drugs", "pharmacology"],
        "critical-care": ["critical care", "criticalcare", "icu", "critical"]
      };
      const allowed = (typeMap[page] || []).map(norm);

      sheetContents.forEach(el => { el.innerHTML = skeletonCards(3); });
      loadData().then(data => {
        const items = newest(data.filter(x => allowed.includes(norm(x.type))));
        sheetContents.forEach((sheetContent, idx) => {
          if (!items.length) {
            sheetContent.innerHTML =
              '<div class="card bento-span-12"><p>No published entries for this section yet. Add a row in your Google Sheet.</p></div>';
            return;
          }

          sheetContent.innerHTML = items.map((x, i) => {
            const ansId = `sheet-answer-${page}-${idx}-${i}`;
            return `
              <article class="card filter-card fade visible" data-category="${esc(norm(x.category))}">
                <div class="card-top">
                  <div class="tag">💊 ${esc(x.category || x.type)}</div>
                  ${x.date ? `<span class="card-date">${esc(x.date)}</span>` : ""}
                </div>
                <h3>${esc(x.title)}</h3>
                ${x.summary ? `<p>${esc(x.summary)}</p>` : ""}
                ${x.answer ? `
                  <button class="reveal" data-target="${ansId}">Reveal Answer</button>
                  <div class="answer" id="${ansId}">
                    <div>${esc(x.answer)}</div>
                    ${x.reference ? `<small class="reference">Reference: ${esc(x.reference)}</small>` : ""}
                  </div>` : ""}
                ${resourceLinks(x)}
              </article>`;
          }).join("");

          wireRevealButtons(sheetContent);
          if (observer) sheetContent.querySelectorAll(".fade").forEach(el => observer.observe(el));
          if (window.KnCarousel && sheetContent.closest(".view-layer-3d")) {
            window.KnCarousel.mount(sheetContent);
          }
        });
      }).catch(err => {
        console.error("KnockoutNotes API Error:", err);
        sheetContents.forEach(sheetContent => {
          sheetContent.innerHTML =
            '<div class="card bento-span-12"><p>Content could not be loaded right now. Please try again shortly.</p></div>';
        });
      });
    }

    // ------------------------------------------------------------------------
    // 16. Latest Clinical Evidence Feed (recent-updates.html)
    // Instant peer-reviewed clinical practice guidelines (AHA 2025, GINA, ESICM ARDS, DAS, Sepsis)
    // with continuous synchronisation. Merges without duplicates and sorts by priority.
    // ------------------------------------------------------------------------
    const recentGrids = document.querySelectorAll("#recentUpdatesGrid, #recentUpdatesGrid3d, #recentUpdatesGridLite, .recent-updates-grid");
    if (recentGrids.length) {
      const programmeUpdates = (window.KNOCKOUTNOTES_PROGRAMME_UPDATES || [
        {
          id: "aha-cpr-ecc-2025",
          type: "Update",
          category: "Resuscitation",
          date: "2025 Update",
          title: "2025 AHA Guidelines for CPR & ECC",
          summary: "Major updates to adult and paediatric basic and advanced life support algorithms, resuscitation quality metrics, and post-cardiac arrest care standards.",
          bullets: [
            "<strong>Chest Compression Metrics:</strong> Strict rate of 100–120/min, depth 5–6 cm (2–2.4 in), complete chest recoil, and chest compression fraction (CCF) &gt; 80%.",
            "<strong>Refractory Shockable Rhythms:</strong> Double sequential external defibrillation (DSED) and vector change (VC) defibrillation endorsed for persistent VF/pVT.",
            "<strong>Waveform Capnography:</strong> Continuous quantitative EtCO2; values &lt; 10 mmHg guide CPR compression optimization; sudden rise &gt; 35–40 mmHg indicates ROSC.",
            "<strong>Post-ROSC Care:</strong> Strict targeted temperature management (32°C–36°C or active fever prevention &lt; 37.5°C), normoxia (SpO2 92–98%), and immediate coronary angiography."
          ],
          reference: "2025 AHA Guidelines for CPR and ECC, Circulation Guideline Supplement.",
          url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines"
        },
        {
          id: "gina-asthma-2025-2026",
          type: "Update",
          category: "Pulmonology & Airway",
          date: "Global Strategy",
          title: "GINA Asthma Strategy & Perioperative Care Update",
          summary: "Global Initiative for Asthma (GINA) strategy applied to acute bronchospasm, elective surgical optimization, and perioperative airway management.",
          bullets: [
            "<strong>Reliever Paradigm:</strong> Anti-inflammatory reliever therapy (as-needed low-dose ICS-formoterol) preferred across all tracks; avoid SABA-only treatment to reduce severe exacerbations.",
            "<strong>Preoperative Optimization:</strong> Defer elective surgery if active wheeze, recent systemic corticosteroid bursts, or FEV1 &lt; 80%; prescribe 3–5 days of oral prednisolone (0.5–1 mg/kg/day) for suboptimal control.",
            "<strong>Intraoperative Airway Strategy:</strong> Prioritise regional anesthesia; use volatile agents (sevoflurane) or ketamine for bronchodilation; avoid desflurane and airway instrumentation during light anaesthesia planes.",
            "<strong>Acute Bronchospasm Protocol:</strong> High-dose nebulized SABA + ipratropium, IV magnesium sulphate (25–50 mg/kg, max 2 g), IV dexamethasone/hydrocortisone, and low-rate, prolonged expiratory time ventilation."
          ],
          reference: "Global Initiative for Asthma (GINA). Global Strategy for Asthma Management and Prevention.",
          url: "https://ginasthma.org/reports/"
        },
        {
          id: "esicm-ards-new-definition",
          type: "Update",
          category: "Critical Care",
          date: "Consensus Definition",
          title: "New Global Definition of ARDS (ESICM Consensus Update)",
          summary: "Major international consensus statement updating and expanding the Berlin definition for intensive care and perioperative acute hypoxaemic respiratory failure.",
          bullets: [
            "<strong>Inclusion of Non-Invasive Modalities:</strong> Recognizes ARDS in patients on High-Flow Nasal Cannula (HFNC ≥ 30 L/min) or continuous CPAP/NIV without requiring invasive endotracheal intubation.",
            "<strong>SpO2/FiO2 Staging Index:</strong> Formal validation of SpO2/FiO2 ratio (≤ 315 when SpO2 ≤ 97%) as an accurate surrogate for PaO2/FiO2, ensuring rapid bedside diagnosis in resource-variable settings.",
            "<strong>Point-of-Care Ultrasound (POCUS):</strong> Lung ultrasound demonstrating bilateral interstitial/alveolar syndromes (B-lines) formally accepted alongside chest X-ray and CT imaging.",
            "<strong>Lung Protective Mechanical Ventilation:</strong> Strict low tidal volume (4–6 mL/kg PBW), driving pressure &lt; 14 cmH2O, plateau pressure &lt; 30 cmH2O, and early prone positioning (≥ 16 h/day) for severe hypoxaemia."
          ],
          reference: "European Society of Intensive Care Medicine (ESICM). New Global Definition of ARDS, Intensive Care Medicine.",
          url: "https://www.esicm.org/resources/guidelines-consensus/"
        },
        {
          id: "das-difficult-airway-2025",
          type: "Update",
          category: "Airway",
          date: "2025 Guidelines",
          title: "DAS 2025 Difficult Airway Guidelines",
          summary: "Updated international algorithms for anticipated and unanticipated difficult tracheal intubation in adults, videolaryngoscopy first-line protocols, and emergency front-of-neck airway access (eFONA).",
          bullets: [
            "<strong>Videolaryngoscopy Priority:</strong> Routine first-line use of videolaryngoscopy recommended for all anticipated and unanticipated difficult airways.",
            "<strong>Limited Intubation Attempts:</strong> Maximum 3 attempts at tracheal intubation before declaring failure and proceeding immediately to Plan B (SGA insertion).",
            "<strong>eFONA Scalpel-Bougie-Tube:</strong> Standardized scalpel-bougie-tube technique as the gold-standard rescue for can't intubate, can't oxygenate (CICO) crises."
          ],
          reference: "Difficult Airway Society (DAS) 2025 Guidelines, British Journal of Anaesthesia.",
          url: "https://das.uk.com/guidelines"
        },
        {
          id: "surviving-sepsis-2026",
          type: "Update",
          category: "Critical Care",
          date: "2026 Guidelines",
          title: "Surviving Sepsis Campaign International Guidelines 2026",
          summary: "Consensus guidelines for the management of sepsis and septic shock: 1-hour resuscitation bundle, early balanced crystalloids, dynamic hemodynamic assessment, and vasopressor strategies.",
          bullets: [
            "<strong>1-Hour Bundle:</strong> Measure lactate, obtain blood cultures before antibiotics, administer broad-spectrum antimicrobials within 1 hr, and initiate crystalloid fluid resuscitation.",
            "<strong>Balanced Crystalloids over Saline:</strong> Use buffered crystalloids (Plasma-Lyte / Ringer's) for initial fluid loading (30 mL/kg within 3 hrs).",
            "<strong>First-Line Vasopressor:</strong> Noradrenaline titrated to MAP ≥ 65 mmHg; add vasopressin early if high-dose noradrenaline is needed."
          ],
          reference: "Surviving Sepsis Campaign 2026, Critical Care Medicine / Intensive Care Medicine.",
          url: "https://www.sccm.org/SurvivingSepsisCampaign/Guidelines"
        }
      ]);

      function normalizeKey(str) {
        return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      }

      function renderUpdatesList(items) {
        recentGrids.forEach(recentGrid => {
          if (!items.length) {
            recentGrid.innerHTML =
              '<div class="card bento-span-12"><p>No guideline updates have been added yet.</p></div>';
            return;
          }

          const prefix = recentGrid.id || (recentGrid.closest(".view-layer-lite") ? "lite" : "3d");
          recentGrid.innerHTML = items.map((x, i) => {
            const ansId = `update-ans-${prefix}-${i}`;
            const link = x.url || x.pdf || x.slides || "";
            const tag = link ? "a" : "div";
            const linkAttrs = link ? ` href="${esc(link)}" target="_blank" rel="noopener noreferrer"` : "";

            let bulletsHtml = "";
            if (Array.isArray(x.bullets) && x.bullets.length) {
              bulletsHtml = `<ul style="padding-left:18px;margin:8px 0 12px;color:var(--text-secondary);font-size:13.5px;line-height:1.7;">${x.bullets.map(b => `<li>${b}</li>`).join("")}</ul>`;
            }

            return `
              <${tag} class="card fade visible kn-update-card"${linkAttrs}>
                <div class="card-top">
                  <div class="tag">🚨 ${esc(x.category || "Clinical Update")}</div>
                  ${x.date ? `<span class="card-date">${esc(x.date)}</span>` : ""}
                </div>
                <h3>${esc(x.title)}</h3>
                ${x.summary ? `<p style="margin-bottom:8px;">${esc(x.summary)}</p>` : ""}
                ${bulletsHtml}
                ${x.answer ? `
                  <div class="answer open" id="${ansId}" style="margin-top:10px;">
                    <div>${esc(x.answer)}</div>
                    ${x.reference && !x.bullets ? `<small class="reference">Reference: ${esc(x.reference)}</small>` : ""}
                  </div>` : ""}
                ${x.reference && !x.answer ? `<small class="reference" style="display:block;margin-top:10px;">Reference: ${esc(x.reference)}</small>` : ""}
                ${link ? `<span class="kn-update-open">→ Open guideline source</span>` : ""}
              </${tag}>`;
          }).join("");

          wireRevealButtons(recentGrid);
          if (observer) recentGrid.querySelectorAll(".fade").forEach(el => observer.observe(el));
          if (window.KnCarousel && recentGrid.closest(".view-layer-3d")) {
            const existing = window.KnCarousel.list ? window.KnCarousel.list.find(c => c.container === recentGrid) : null;
            if (existing) {
              existing.refresh();
              if (!existing.deployed) existing._deploy();
            } else {
              const c = window.KnCarousel.mount(recentGrid);
              if (c && !c.deployed) c._deploy();
            }
          }
        });
      }

      // Step 1: Instant rendering from guideline evidence base (guaranteed zero loading delay)
      renderUpdatesList(programmeUpdates);

      // Step 2: Asynchronous guideline synchronisation
      loadData().then(sheetData => {
        const sheetUpdates = sheetData.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        });

        // Merge updates without duplicates
        const seen = new Set();
        const merged = [];

        // Add sheet updates (cloud has freshness precedence)
        sheetUpdates.forEach(su => {
          const key = normalizeKey(su.title);
          seen.add(key);
          const progMatch = programmeUpdates.find(pu => normalizeKey(pu.title) === key);
          if (progMatch && progMatch.bullets && (!su.bullets || !su.bullets.length)) {
            su.bullets = progMatch.bullets;
          }
          merged.push(su);
        });

        // Append remaining programmatic items not yet in sheet
        programmeUpdates.forEach(pu => {
          const key = normalizeKey(pu.title);
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(pu);
          }
        });

        renderUpdatesList(merged);
      }).catch(err => {
        console.warn("KnockoutNotes updates feed active:", err);
      });
    }

    window.KnockoutNotesData = { loadData, newest };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKnockoutNotes);
  } else {
    initKnockoutNotes();
  }
})();
