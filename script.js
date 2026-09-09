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
      document.querySelectorAll("#themeBtn, .theme-btn, [data-theme-btn]").forEach(btn => {
        btn.textContent = isDark ? "☀" : "☾";
        btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      });
    }

    let savedTheme = null;
    try { savedTheme = localStorage.getItem("kn-theme"); } catch (_) {}
    applyTheme(savedTheme || "dark");

    document.querySelectorAll("#themeBtn, .theme-btn, [data-theme-btn]").forEach(btn => {
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
    // 4. Mobile Navigation Drawer
    // ------------------------------------------------------------------------
    document.querySelectorAll(".menu-btn, #menuBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const header = btn.closest(".site-hud, .site-nav, header") || document;
        const mobileMenu = header.querySelector(".mobile-menu") || document.getElementById("mobileMenu");
        if (mobileMenu) {
          const open = mobileMenu.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = open ? "✕" : "⋮";
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
    const observer = ("IntersectionObserver" in window)
      ? new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              observer.unobserve(e.target);
            }
          });
        }, { threshold: 0.08 })
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
    // 11. Google Sheets API Client & Data Cache
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
    // 12. Populate Marquee Ticker (Viva & Home)
    // ------------------------------------------------------------------------
    const tickers = document.querySelectorAll("#knLatestTicker, .kn-latest-ticker");
    if (tickers.length) {
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
    // 13. Populate Home Bento Guideline Watch Widget
    // ------------------------------------------------------------------------
    const homeUpdatesList = document.querySelectorAll("#knHomeUpdates, .kn-home-updates");
    if (homeUpdatesList.length) {
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
    // 14. Populate Section Pages (Drugs, Critical Care, etc.)
    // ------------------------------------------------------------------------
    const sheetContents = document.querySelectorAll("#sheetContent, .sheet-content");
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
    // 15. Populate Recent Updates Grid (recent-updates.html)
    // ------------------------------------------------------------------------
    const recentGrids = document.querySelectorAll("#recentUpdatesGrid, #recentUpdatesGrid3d, #recentUpdatesGridLite, .recent-updates-grid");
    if (recentGrids.length) {
      loadData().then(data => {
        const items = newest(data.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        })).slice(0, 30);

        recentGrids.forEach(recentGrid => {
          if (!items.length) {
            recentGrid.innerHTML =
              '<div class="card bento-span-12"><p>No guideline updates have been added yet. Add a row in Google Sheets with <strong>Type = Update</strong>.</p></div>';
            return;
          }

          const prefix = recentGrid.id || (recentGrid.closest(".view-layer-lite") ? "lite" : "3d");
          recentGrid.innerHTML = items.map((x, i) => {
            const ansId = `update-ans-${prefix}-${i}`;
            return `
              <article class="card fade visible">
                <div class="card-top">
                  <div class="tag">🚨 ${esc(x.category || "Clinical Update")}</div>
                  ${x.date ? `<span class="card-date">${esc(x.date)}</span>` : ""}
                </div>
                <h3>${esc(x.title)}</h3>
                ${x.summary ? `<p>${esc(x.summary)}</p>` : ""}
                ${x.answer ? `
                  <div class="answer open" id="${ansId}" style="margin-top:10px;">
                    <div>${esc(x.answer)}</div>
                    ${x.reference ? `<small class="reference">Reference: ${esc(x.reference)}</small>` : ""}
                  </div>` : ""}
                ${resourceLinks(x)}
              </article>`;
          }).join("");

          wireRevealButtons(recentGrid);
          if (observer) recentGrid.querySelectorAll(".fade").forEach(el => observer.observe(el));
        });
      }).catch(err => {
        console.error("KnockoutNotes Recent Updates:", err);
        recentGrids.forEach(recentGrid => {
          recentGrid.innerHTML =
            '<div class="card bento-span-12"><p>Recent updates could not be loaded right now.</p></div>';
        });
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
