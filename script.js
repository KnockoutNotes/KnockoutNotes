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
    function wireRevealButtons(root = document) {
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
    // 8. In-Page Card Filter Search
    // ------------------------------------------------------------------------
    const searchInputs = document.querySelectorAll("#search, #pearlSearch, .search");
    searchInputs.forEach(input => {
      input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();
        document.querySelectorAll(".filter-card").forEach(card => {
          const matches = card.innerText.toLowerCase().includes(q);
          card.style.display = matches ? "flex" : "none";
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
    // 10. Live Animated ECG Waveform Monitor (Hero Visualization)
    // ------------------------------------------------------------------------
    const ecgCanvases = Array.from(document.querySelectorAll("#knEcgCanvas, .ecg-screen canvas"));
    if (ecgCanvases.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      function resizeCanvases() {
        ecgCanvases.forEach(cvs => {
          if (cvs.offsetWidth) {
            cvs.width = cvs.offsetWidth;
            cvs.height = cvs.offsetHeight;
          }
        });
      }
      resizeCanvases();
      window.addEventListener("resize", resizeCanvases);

      function getEcgY(progress) {
        const p = progress % 1;
        if (p < 0.12) return 0;
        if (p < 0.22) {
          const t = (p - 0.12) / 0.1;
          return Math.sin(t * Math.PI) * 0.2;
        }
        if (p < 0.32) return 0;
        if (p < 0.36) {
          const t = (p - 0.32) / 0.04;
          return -Math.sin(t * Math.PI) * 0.15;
        }
        if (p < 0.44) {
          const t = (p - 0.36) / 0.08;
          return Math.sin(t * Math.PI) * 0.95;
        }
        if (p < 0.50) {
          const t = (p - 0.44) / 0.06;
          return -Math.sin(t * Math.PI) * 0.28;
        }
        if (p < 0.60) return 0;
        if (p < 0.78) {
          const t = (p - 0.60) / 0.18;
          return Math.sin(t * Math.PI) * 0.35;
        }
        return 0;
      }

      let scanX = 0;
      const speed = 2.2;
      const scanWidth = 35;
      const maxW = 600;
      const history = new Array(maxW).fill(0);

      function renderEcg() {
        if (document.hidden) {
          requestAnimationFrame(renderEcg);
          return;
        }

        const isDark = body.classList.contains("dark");
        const traceColor = isDark ? "#38bdf8" : "#0284c7";
        const glowColor = isDark ? "rgba(56, 189, 248, 0.4)" : "rgba(2, 132, 199, 0.3)";

        const cycleLength = 220;
        const progress = (scanX % cycleLength) / cycleLength;
        const sampleVal = getEcgY(progress);

        ecgCanvases.forEach(cvs => {
          if (cvs.offsetParent === null) return; // Skip hidden canvas
          const eCtx = cvs.getContext("2d");
          const ecgW = cvs.width || 500;
          const ecgH = cvs.height || 170;
          const midY = ecgH * 0.58;
          const curY = midY - sampleVal * (ecgH * 0.42);

          eCtx.clearRect(scanX, 0, scanWidth, ecgH);

          history[Math.floor(scanX)] = curY;
          const prevX = scanX > 0 ? scanX - speed : 0;
          const prevY = history[Math.floor(prevX)] || midY;

          eCtx.beginPath();
          eCtx.moveTo(prevX, prevY);
          eCtx.lineTo(scanX, curY);
          eCtx.strokeStyle = traceColor;
          eCtx.lineWidth = 2.2;
          eCtx.lineCap = "round";
          eCtx.shadowColor = glowColor;
          eCtx.shadowBlur = 10;
          eCtx.stroke();
          eCtx.shadowBlur = 0;

          eCtx.beginPath();
          eCtx.arc(scanX, curY, 3.4, 0, Math.PI * 2);
          eCtx.fillStyle = isDark ? "#ffffff" : traceColor;
          eCtx.shadowColor = glowColor;
          eCtx.shadowBlur = 12;
          eCtx.fill();
          eCtx.shadowBlur = 0;
        });

        scanX += speed;
        if (scanX >= maxW) {
          scanX = 0;
        }

        requestAnimationFrame(renderEcg);
      }

      renderEcg();
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
    // 16. Dual-Route Recent Updates Engine (recent-updates.html)
    // Route 1: Instant peer-reviewed programmatic guidelines (AHA 2025, GINA, ESICM ARDS, DAS, Sepsis)
    // Route 2: Real-time Cloud Google Sheets & Excel API synchronisation
    // Merges without duplicates and sorts by date/priority.
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
            window.KnCarousel.mount(recentGrid);
          }
        });
      }

      // Step 1: Instant rendering from Programme Route (guaranteed zero loading delay)
      renderUpdatesList(programmeUpdates);

      // Step 2: Asynchronous Cloud Sheet & Excel Route
      loadData().then(sheetData => {
        const sheetUpdates = sheetData.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        });

        // Merge dual routes without duplicates
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
        console.warn("KnockoutNotes Sheet Route skipped, Programme Route active:", err);
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
