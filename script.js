// ==========================================================================
// KNOCKOUTNOTES — Unified Core JavaScript Engine
// Theme, ECG Telemetry, Ambient Particles, API Client & UI Interactions
// ==========================================================================

(function () {
  "use strict";

  function initKnockoutNotes() {
    const body = document.body;
    if (!body) return;

    // ------------------------------------------------------------------------
    // 1. Theme Engine (Obsidian Dark default vs Clean Light)
    // ------------------------------------------------------------------------
    const themeBtn = document.getElementById("themeBtn");

    function applyTheme(theme) {
      const isDark = theme === "dark";
      body.classList.toggle("dark", isDark);
      try { localStorage.setItem("kn-theme", theme); } catch (_) {}
      if (themeBtn) {
        themeBtn.textContent = isDark ? "☀" : "☾";
        themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
      }
    }

    let savedTheme = null;
    try { savedTheme = localStorage.getItem("kn-theme"); } catch (_) {}
    // Default to dark theme for Active Theory aesthetic if no preference stored
    applyTheme(savedTheme || "dark");

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        applyTheme(body.classList.contains("dark") ? "light" : "dark");
      });
    }

    // ------------------------------------------------------------------------
    // 2. Floating Navigation Scroll State & Active Links
    // ------------------------------------------------------------------------
    const nav = document.querySelector(".site-nav");
    if (nav) {
      window.addEventListener("scroll", () => {
        nav.classList.toggle("scrolled", window.scrollY > 24);
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
    // 9. Ambient Canvas Particle Network (Active Theory Inspiration)
    // ------------------------------------------------------------------------
    const particleCanvas = document.getElementById("knParticleCanvas");
    if (particleCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const ctx = particleCanvas.getContext("2d");
      let width = (particleCanvas.width = window.innerWidth);
      let height = (particleCanvas.height = window.innerHeight);

      window.addEventListener("resize", () => {
        width = particleCanvas.width = window.innerWidth;
        height = particleCanvas.height = window.innerHeight;
      });

      const numParticles = Math.min(45, Math.floor(width / 30));
      const particles = [];

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 1.8 + 0.8,
          alpha: Math.random() * 0.5 + 0.2
        });
      }

      let animId = null;

      function renderParticles() {
        if (document.hidden) {
          animId = requestAnimationFrame(renderParticles);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        const isDark = body.classList.contains("dark");
        const dotColor = isDark ? "56, 189, 248" : "2, 132, 199";

        // Update & draw particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${dotColor}, ${p.alpha * (isDark ? 0.8 : 0.4)})`;
          ctx.fill();

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 110) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(${dotColor}, ${(1 - dist / 110) * 0.14})`;
              ctx.lineWidth = 0.8;
              ctx.stroke();
            }
          }
        }

        animId = requestAnimationFrame(renderParticles);
      }

      renderParticles();
    }

    // ------------------------------------------------------------------------
    // 10. Live Animated ECG Waveform Monitor (Hero Visualization)
    // ------------------------------------------------------------------------
    const ecgCanvas = document.getElementById("knEcgCanvas");
    if (ecgCanvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const eCtx = ecgCanvas.getContext("2d");
      let ecgW = (ecgCanvas.width = ecgCanvas.offsetWidth || 500);
      let ecgH = (ecgCanvas.height = ecgCanvas.offsetHeight || 170);

      window.addEventListener("resize", () => {
        if (ecgCanvas.offsetWidth) {
          ecgW = ecgCanvas.width = ecgCanvas.offsetWidth;
          ecgH = ecgCanvas.height = ecgCanvas.offsetHeight;
        }
      });

      // Authentic P-Q-R-S-T waveform pattern
      // Values between -1.0 and +1.0
      function getEcgY(progress) {
        const p = progress % 1;
        // Baseline flat
        if (p < 0.12) return 0;
        // P wave
        if (p < 0.22) {
          const t = (p - 0.12) / 0.1;
          return Math.sin(t * Math.PI) * 0.2;
        }
        // PR segment
        if (p < 0.32) return 0;
        // Q dip
        if (p < 0.36) {
          const t = (p - 0.32) / 0.04;
          return -Math.sin(t * Math.PI) * 0.15;
        }
        // R spike (dramatic upward deflection)
        if (p < 0.44) {
          const t = (p - 0.36) / 0.08;
          return Math.sin(t * Math.PI) * 0.95;
        }
        // S dip
        if (p < 0.50) {
          const t = (p - 0.44) / 0.06;
          return -Math.sin(t * Math.PI) * 0.28;
        }
        // ST segment
        if (p < 0.60) return 0;
        // T wave (repolarization)
        if (p < 0.78) {
          const t = (p - 0.60) / 0.18;
          return Math.sin(t * Math.PI) * 0.35;
        }
        // TP baseline
        return 0;
      }

      let scanX = 0;
      const speed = 2.2;
      const scanWidth = 35;
      const history = new Array(Math.ceil(ecgW)).fill(0);
      const midY = ecgH * 0.58;

      function renderEcg() {
        if (document.hidden) {
          requestAnimationFrame(renderEcg);
          return;
        }

        const isDark = body.classList.contains("dark");
        const traceColor = isDark ? "#38bdf8" : "#0284c7";
        const glowColor = isDark ? "rgba(56, 189, 248, 0.4)" : "rgba(2, 132, 199, 0.3)";

        // Clear scan beam zone
        eCtx.clearRect(scanX, 0, scanWidth, ecgH);

        // Compute current sample
        const cycleLength = 220; // pixels per cardiac cycle
        const progress = (scanX % cycleLength) / cycleLength;
        const sampleVal = getEcgY(progress);
        const curY = midY - sampleVal * (ecgH * 0.42);

        history[Math.floor(scanX)] = curY;

        // Draw line segment
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

        // Glowing cursor head
        eCtx.beginPath();
        eCtx.arc(scanX, curY, 3.5, 0, Math.PI * 2);
        eCtx.fillStyle = "#ffffff";
        eCtx.shadowColor = traceColor;
        eCtx.shadowBlur = 14;
        eCtx.fill();
        eCtx.shadowBlur = 0;

        scanX += speed;
        if (scanX >= ecgW) {
          scanX = 0;
        }

        requestAnimationFrame(renderEcg);
      }

      renderEcg();
    }

    // ------------------------------------------------------------------------
    // 11. Google Sheets API Client with SessionStorage Caching
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
    const CACHE_KEY = "kn_api_data_v3";
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
        ticker.innerHTML = items + items;
      }).catch(() => {
        ticker.innerHTML =
          '<span class="kn-ticker-item"><span class="kn-ticker-dot"></span>' +
          '<span class="kn-ticker-title">High-yield anaesthesia, critical care & viva updates.</span></span>';
      });
    }

    // ------------------------------------------------------------------------
    // 13. Populate Home Bento Guideline Watch Widget
    // ------------------------------------------------------------------------
    const homeUpdates = document.getElementById("knHomeUpdates");
    if (homeUpdates) {
      loadData().then(data => {
        const updates = newest(data.filter(x => {
          const t = norm(x.type);
          return ["update", "recent update", "guideline update", "guideline"].includes(t);
        })).slice(0, 4);

        if (!updates.length) {
          homeUpdates.innerHTML = '<p style="margin:0;font-size:13.5px;color:var(--text-muted);">No new guideline alerts today.</p>';
          return;
        }

        homeUpdates.innerHTML = updates.map(x => `
          <a class="kn-search-result" style="padding:12px 16px;margin-bottom:10px;" href="recent-updates.html">
            <div class="kn-search-result-top">
              <span class="kn-search-type">🚨 ${esc(x.category || "Guideline")}</span>
              ${x.date ? `<span class="card-date">• ${esc(x.date)}</span>` : ""}
            </div>
            <h4 style="margin:6px 0 4px;font-size:14.5px;">${esc(x.title)}</h4>
            ${x.summary ? `<p style="font-size:12.5px;margin:0;color:var(--text-secondary);">${esc(x.summary)}</p>` : ""}
          </a>`).join("");
      }).catch(() => {
        homeUpdates.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin:0;">Recent guideline alerts will appear here.</p>';
      });
    }

    // ------------------------------------------------------------------------
    // 14. Populate Section Pages (Drugs, Critical Care, etc.)
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
    // 15. Populate Recent Updates Grid (recent-updates.html)
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
                <div class="answer open" id="${ansId}" style="margin-top:10px;">
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

    window.KnockoutNotesData = { loadData, newest };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initKnockoutNotes);
  } else {
    initKnockoutNotes();
  }
})();
