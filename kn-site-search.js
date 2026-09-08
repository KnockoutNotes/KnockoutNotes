// ==========================================================================
// KnockoutNotes — Unified Sitewide Search Engine
// Combines local asset categories + Google Sheets live content
// ==========================================================================

(function () {
  "use strict";

  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[c]));

  const norm = s => String(s || "").toLowerCase().trim();

  const pageForType = type => {
    const t = norm(type);
    if (t.includes("pearl")) return "pearls.html";
    if (t.includes("note")) return "notes.html";
    if (t.includes("viva")) return "viva.html";
    if (t.includes("drug")) return "drugs.html";
    if (t.includes("critical") || t.includes("icu")) return "critical-care.html";
    if (t.includes("update") || t.includes("guideline")) return "recent-updates.html";
    return "index.html";
  };

  async function initSearch() {
    let localCache = null;

    async function getLibraryEntries() {
      if (localCache) return localCache;
      let library = null;
      try {
        if (window.KnockoutNotesLibrary && typeof window.KnockoutNotesLibrary.config === "function") {
          library = await window.KnockoutNotesLibrary.config();
        }
      } catch (_) {}

      const out = [];
      for (const [page, data] of Object.entries(library?.pages || {})) {
        for (const c of data.categories || []) {
          const pageHref = page === "criticalCare" ? "critical-care.html" : `${page}.html`;
          out.push({
            Type: page === "criticalCare" ? "Critical Care" : page.charAt(0).toUpperCase() + page.slice(1),
            Category: c.kicker || c.title,
            Title: c.title,
            Summary: c.description || "",
            href: pageHref
          });
          // Also index specific sub-items if present
          if (Array.isArray(c.files)) {
            c.files.forEach((f, idx) => {
              out.push({
                Type: page === "criticalCare" ? "Critical Care" : page.charAt(0).toUpperCase() + page.slice(1),
                Category: c.title,
                Title: f.title || `${c.title} #${idx + 1}`,
                Summary: `Visual infographic in ${c.title}`,
                href: f.url
              });
            });
          }
        }
      }
      localCache = out;
      return out;
    }

    async function getRemoteEntries() {
      if (window.KnockoutNotesData && typeof window.KnockoutNotesData.loadData === "function") {
        try {
          return await window.KnockoutNotesData.loadData();
        } catch (_) {}
      }
      return [];
    }

    function wireSearchInstance(inputId, clearId, resultsId, statusId) {
      const input = document.getElementById(inputId);
      const clear = document.getElementById(clearId);
      const results = document.getElementById(resultsId);
      const status = document.getElementById(statusId);

      if (!input || !results) return null;

      let timer = null;

      async function executeSearch(query) {
        const q = norm(query !== undefined ? query : input.value);
        if (clear) clear.style.display = q ? "block" : "none";
        results.innerHTML = "";

        if (!q) {
          if (status) status.textContent = "Start typing to search pearls, notes, drugs, viva and guidelines.";
          return;
        }

        if (status) status.textContent = "Searching KnockoutNotes database…";

        const [remote, local] = await Promise.all([getRemoteEntries(), getLibraryEntries()]);
        const combined = [
          ...remote.map(x => ({
            ...x,
            href: x.href || pageForType(x.type || x.Type)
          })),
          ...local
        ];

        const matches = combined.filter(x => {
          const corpus = [
            x.Type || x.type,
            x.Category || x.category,
            x.Title || x.title,
            x.Summary || x.summary,
            x.Answer || x.answer,
            x.Reference || x.reference
          ].join(" ").toLowerCase();
          return corpus.includes(q);
        }).slice(0, 16);

        if (!matches.length) {
          if (status) status.textContent = "No matching medical content found.";
          results.innerHTML = '<div class="kn-search-empty">No results found. Try another drug, clinical score, guideline, or physiology term.</div>';
          return;
        }

        if (status) status.textContent = `${matches.length} result${matches.length === 1 ? "" : "s"} found`;

        results.innerHTML = matches.map(item => {
          const typeName = item.Type || item.type || "Content";
          const catName = item.Category || item.category || "";
          const title = item.Title || item.title || "Untitled";
          const summary = item.Summary || item.summary || item.Answer || item.answer || "";
          const href = item.href || pageForType(typeName);
          const isExternalOrFile = href.startsWith("assets/") || href.startsWith("http");

          return `
            <a class="kn-search-result" href="${esc(href)}" ${isExternalOrFile ? 'target="_blank" rel="noopener"' : ""}>
              <div class="kn-search-result-top">
                <span class="kn-search-type">${esc(typeName)}</span>
                ${catName ? `<span class="card-date">• ${esc(catName)}</span>` : ""}
              </div>
              <h4>${esc(title)}</h4>
              ${summary ? `<p>${esc(summary)}</p>` : ""}
            </a>`;
        }).join("");
      }

      input.addEventListener("input", () => {
        clearTimeout(timer);
        timer = setTimeout(() => executeSearch(), 200);
      });

      if (clear) {
        clear.addEventListener("click", () => {
          input.value = "";
          executeSearch("");
          input.focus();
        });
      }

      return { executeSearch };
    }

    // In-page search bar
    const inPageSearch = wireSearchInstance("knSiteSearch", "knSearchClear", "knSearchResults", "knSearchStatus");
    // Global Command Palette Modal search bar
    const modalSearch = wireSearchInstance("knModalSearchInput", "knModalSearchClear", "knModalSearchResults", "knModalSearchStatus");

    window.KnockoutNotesSiteSearch = {
      trigger: (query = "") => {
        if (modalSearch) modalSearch.executeSearch(query);
        if (inPageSearch) inPageSearch.executeSearch(query);
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
})();
