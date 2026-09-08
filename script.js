// ==========================================================================
// KnockoutNotes — Live Google Sheets API + Medical UI Interactions
// ==========================================================================

(function () {
  "use strict";

  function initKnockoutNotes() {
    const body = document.body;
    if (!body) return;

    // ------------------------------------------------------------------------
    // 1. Theme Engine (Obsidian Dark vs Clean Light)
    // ------------------------------------------------------------------------
    const themeBtn = document.getElementById("themeBtn");

    function applyTheme(theme) {
      const isDark = theme === "dark";
      body.classList.toggle("dark", isDark);
      localStorage.setItem("kn-theme", theme);
      if (themeBtn) {
        themeBtn.textContent = isDark ? "☀" : "☾";
        themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      }
    }

    const savedTheme = localStorage.getItem("kn-theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(savedTheme || (prefersDark ? "dark" : "light"));

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        applyTheme(body.classList.contains("dark") ? "light" : "dark");
      });
    }

    // ------------------------------------------------------------------------
    // 2. Active Nav Link Highlighting
    // ------------------------------------------------------------------------
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
    // 3. Mobile Navigation Drawer
    // ------------------------------------------------------------------------
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (menuBtn && mobileMenu) {
      menuBtn.addEventListener("click", () => {
        const open = mobileMenu.classList.toggle("open");
        menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
        menuBtn.textContent = open ? "✕" : "⋮";
      });
    }

    document.querySelectorAll("[data-close-menu]").forEach(link => {
      link.addEventListener("click", () => {
        if (mobileMenu) {
          mobileMenu.classList.remove("open");
          if (menuBtn) {
            menuBtn.setAttribute("aria-expanded", "false");
            menuBtn.textContent = "⋮";
          }
        }
      });
    });

    // ------------------------------------------------------------------------
    // 4. Active Recall Mechanics (Accordion / Answer Reveal)
    // ------------------------------------------------------------------------
    function wireRevealButtons(root = document) {
      root.querySelectorAll(".reveal").forEach(btn => {
        if (btn.dataset.wired) return;
        btn.dataset.wired = "1";
        btn.setAttribute("aria-expanded", "false");

        btn.addEventListener("click", () => {
          const target = document.getElementById(btn.dataset.target);
          if (!target) return;
          const open = target.classList.toggle("open");
          btn.setAttribute("aria-expanded", open ? "true" : "false");
          btn.textContent = open ? "Hide Answer" : "Reveal Answer";
        });
      });
    }

    wireRevealButtons();

    // ------------------------------------------------------------------------
    // 5. Scroll Entrance Animations (IntersectionObserver)
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
    // 6. Category Filter Pills
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
    // 7. In-Page Card Filter Search (Supports #search, #pearlSearch, .search)
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
    // 8. Universal Command Palette / Search Modal
    // ------------------------------------------------------------------------
    const searchModal = document.getElementById("knSearchModal");
    const modalInput = document.getElementById("knModalSearchInput");
    const modalClose = document.querySelectorAll("[data-close-modal]");
    const searchTriggers = document.querySelectorAll("[data-open-search], .nav-search-trigger");

    function openSearchModal() {
      if (!searchModal) return;
      searchModal.classList.add("open");
      if (modalInput) {
        modalInput.value = "";
        setTimeout(() => modalInput.focus(), 50);
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
    // 9. Google Sheets API Client with SessionStorage Caching
    // ------------------------------------------------------------------------
    function esc(s) {
      return String(s || "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
      }[ch]));
    }

    function norm(s) {
      return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    }

    function dateValue(s, fallback) {
      const d = Date.parse(s || "");
      return Number.isNaN(d) ? fallback : d;
    }

    const api = window.KNOCKOUTNOTES_API;
    const CACHE_KEY = "kn_api_data_v2";
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

    function loadData() {
      if (!api) return Promise.reject(new Error("KnockoutNotes API missing"));

      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL && Array.isArray(parsed.data)) {
            return Promise.resolve(parsed.data);
          }
        }
      } catch (_) {}

      return fetch(api + "?_=" + Date.now(), { cache: "no-store" })
        .then(r => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(payload => {
          if (!payload || payload.success !== true || !Array.isArray(payload.data)) {
            throw new Error("Invalid API payload");
          }
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
        links += `<a class="btn secondary" style="padding:7px 12px;font-size:12px;" href="${esc(x.url)}" target="_blank" rel="noopener">🔗 Official Source</a>`;
      }
      if (x.pdf) {
        links += `<a class="btn secondary" style="padding:7px 12px;font-size:12px;" href="${esc(x.pdf)}" target="_blank" rel="noopener">📄 PDF</a>`;
      }
      if (x.slides) {
        links += `<a class="btn secondary" style="padding:7px 12px;font-size:12px;" href="${esc(x.slides)}" target="_blank" rel="noopener">🎞 Slides</a>`;
      }
      return links ? `<div class="actions" style="margin-top:14px;gap:8px;">${links}</div>` : "";
    }

    // ------------------------------------------------------------------------
    // 10. Populate Marquee Ticker (Viva & Home)
    // ------------------------------------------------------------------------
    const ticker = document.getElementById("knLatestTicker");
    if (ticker) {
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
        // Duplicate for seamless continuous CSS marquee scroll
        ticker.innerHTML = items + items;
      }).catch(() => {
        ticker.innerHTML =
          '<span class="kn-ticker-item"><span class="kn-ticker-dot"></span>' +
          '<span class="kn-ticker-title">Latest high-yield notes and guideline updates.</span></span>';
      });
    }

    // ------------------------------------------------------------------------
    // 11. Populate Home Bento Guideline Watch Widget
    // ------------------------------------------------------------------------
    const homeUpdates = document.getElementById("knHomeUpdates");
    if (homeUpdates) {
      loadData().then(data => {
        const updates = newest(data.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        })).slice(0, 4);

        if (!updates.length) {
          homeUpdates.innerHTML = '<p class="text-muted" style="margin:0;font-size:13px;">No new alerts today.</p>';
          return;
        }

        homeUpdates.innerHTML = updates.map(x => `
          <a class="kn-search-result" style="padding:10px 14px;margin-bottom:8px;" href="recent-updates.html">
            <div class="kn-search-result-top">
              <span class="kn-search-type">🚨 ${esc(x.category || "Guideline")}</span>
              ${x.date ? `<span class="card-date">• ${esc(x.date)}</span>` : ""}
            </div>
            <h4 style="margin:4px 0 2px;font-size:14px;">${esc(x.title)}</h4>
            ${x.summary ? `<p style="font-size:12px;margin:0;color:var(--text-muted);">${esc(x.summary)}</p>` : ""}
          </a>`).join("");
      }).catch(() => {
        homeUpdates.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin:0;">Recent guideline updates will appear here.</p>';
      });
    }

    // ------------------------------------------------------------------------
    // 12. Populate Section Pages (Drugs, Critical Care, etc.)
    // ------------------------------------------------------------------------
    const sheetContent = document.getElementById("sheetContent");
    if (sheetContent) {
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
        if (!items.length) {
          sheetContent.innerHTML =
            '<div class="card bento-span-12"><p>No published entries for this section yet. Add a row in your Google Sheet.</p></div>';
          return;
        }

        sheetContent.innerHTML = items.map((x, i) => {
          const ansId = `sheet-answer-${page}-${i}`;
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
      }).catch(err => {
        console.error("KnockoutNotes API Error:", err);
        sheetContent.innerHTML =
          '<div class="card bento-span-12"><p>Content could not be loaded right now. Please try again shortly.</p></div>';
      });
    }

    // ------------------------------------------------------------------------
    // 13. Populate Recent Updates Grid (recent-updates.html)
    // ------------------------------------------------------------------------
    const recentGrid = document.getElementById("recentUpdatesGrid");
    if (recentGrid) {
      loadData().then(data => {
        const items = newest(data.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        })).slice(0, 30);

        if (!items.length) {
          recentGrid.innerHTML =
            '<div class="card bento-span-12"><p>No guideline updates have been added yet. Add a row in Google Sheets with <strong>Type = Update</strong>.</p></div>';
          return;
        }

        recentGrid.innerHTML = items.map((x, i) => {
          const ansId = `update-ans-${i}`;
          return `
            <article class="card fade visible">
              <div class="card-top">
                <div class="tag">🚨 ${esc(x.category || "Clinical Update")}</div>
                ${x.date ? `<span class="card-date">${esc(x.date)}</span>` : ""}
              </div>
              <h3>${esc(x.title)}</h3>
              ${x.summary ? `<p>${esc(x.summary)}</p>` : ""}
              ${x.answer ? `
                <div class="answer open" id="${ansId}" style="margin-top:8px;">
                  <div>${esc(x.answer)}</div>
                  ${x.reference ? `<small class="reference">Reference: ${esc(x.reference)}</small>` : ""}
                </div>` : ""}
              ${resourceLinks(x)}
            </article>`;
        }).join("");

        wireRevealButtons(recentGrid);
        if (observer) recentGrid.querySelectorAll(".fade").forEach(el => observer.observe(el));
      }).catch(err => {
        console.error("KnockoutNotes Recent Updates:", err);
        recentGrid.innerHTML =
          '<div class="card bento-span-12"><p>Recent updates could not be loaded right now.</p></div>';
      });
    }

    // Expose data loader for search module
    window.KnockoutNotesData = { loadData, newest };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKnockoutNotes);
  } else {
    initKnockoutNotes();
  }
})();
