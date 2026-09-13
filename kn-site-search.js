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
    if (t.includes("calc")) return "calculators.html";
    if (t.includes("pearl")) return "notes.html#pearls";
    if (t.includes("valve")) return "notes.html";
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
      // Index Calculators
      const calcEntries = [
        { Type: "Calculator", Category: "Emergency & Resuscitation", Title: "Paediatric Drug Chart & Airway Sizer", Summary: "Interactive paediatric resuscitation dosing, ETT sizing, Table 42-6 equipment, and i-gel selector from PedsDrugChart.xlsx with PDF export.", href: "calculators.html#paedsHero" },
        { Type: "Calculator", Category: "Emergency & Resuscitation", Title: "COPUR Paediatric Airway Score", Summary: "Colorado paediatric difficult airway score assessing Chin, Opening, Previous/OSA, Uvula, Range.", href: "calculators.html#calcCopur" },
        { Type: "Calculator", Category: "Emergency & Resuscitation", Title: "Parkland Burn Resuscitation Calculator", Summary: "Baxter/Parkland crystalloid burn resuscitation formula for first 24 hours.", href: "calculators.html#calcParkland" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "Wilson Risk Score (Difficult Intubation)", Summary: "5-factor risk score predicting difficult direct laryngoscopy (weight, mobility, buck teeth, jaw movement, retrognathia).", href: "calculators.html#calcWilson" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "Child-Pugh Score (Cirrhosis & Periop Mortality)", Summary: "Surgical risk and mortality stratification in liver disease (bilirubin, albumin, INR, ascites, encephalopathy).", href: "calculators.html#calcChildPugh" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "Body Mass Index (BMI)", Summary: "WHO adult body mass index calculation and nutritional classification.", href: "calculators.html#calcBmi" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "METs Functional Capacity", Summary: "ACC/AHA and ESAIC perioperative cardiac functional reserve stratification.", href: "calculators.html#calcMets" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "Duke Activity Status Index (DASI)", Summary: "Validated 12-item cardiorespiratory functional capacity and peak VO2 score.", href: "calculators.html#calcDasi" },
        { Type: "Calculator", Category: "Perioperative Assessment", Title: "STOP-Bang OSA Screening", Summary: "Obstructive sleep apnoea perioperative screening questionnaire.", href: "calculators.html#calcStopBang" },
        { Type: "Calculator", Category: "Renal Clearance", Title: "Creatinine Clearance (Cockcroft–Gault)", Summary: "Estimated renal clearance with Actual, Ideal, and Adjusted body weight options.", href: "calculators.html#calcCrCl" },
        { Type: "Calculator", Category: "ABG & Acid–Base", Title: "Arterial Blood Gas (ABG) Clinical Analysis", Summary: "Step-by-step blood gas analysis: pH, SBE, PaCO₂, Winter's formula compensation, Figge anion gap, delta ratio, and oxygenation.", href: "calculators.html#abgHero" },
        { Type: "Calculator", Category: "ABG & Acid–Base", Title: "Serum Anion Gap & Albumin Correction", Summary: "Evaluation of metabolic acidosis and unmeasured anions with Figge albumin formula in ABG suite.", href: "calculators.html#abgHero" },
        { Type: "Calculator", Category: "ABG & Acid–Base", Title: "Winter's Formula (Expected PaCO₂)", Summary: "Respiratory compensation evaluator for primary metabolic acidosis in ABG suite.", href: "calculators.html#abgHero" },
        { Type: "Calculator", Category: "ABG & Acid–Base", Title: "Delta Gap & Delta Ratio", Summary: "Evaluation of mixed metabolic acidosis and alkalosis in ABG suite.", href: "calculators.html#abgHero" },
        { Type: "Calculator", Category: "ABG & Acid–Base", Title: "P/F Ratio & Berlin ARDS Classification", Summary: "Arterial oxygenation ratio (PaO₂/FiO₂), expected PaO₂, and alveolar-arterial (A-a) gradient.", href: "calculators.html#abgHero" }
      ];

      // Index Text Pearls in Notes
      const pearlEntries = [
        { Type: "Pearls", Category: "Valve Lesions", Title: "Mitral Stenosis: Rate Matters", Summary: "Tachycardia shortens diastole and impairs LV filling. Haemodynamic goals in MS.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Valve Lesions", Title: "Aortic Stenosis: Fixed Output State", Summary: "Fixed LV outflow tract obstruction and coronary perfusion pressure goals in AS.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Valve Lesions", Title: "Aortic & Mitral Regurgitation: Forward Flow", Summary: "Fast, forward, full: haemodynamic goals in AR and MR.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Pharmacology", Title: "Succinylcholine Intubating Dose", Summary: "1–1.5 mg/kg depolarizing NMBA mechanism and duration.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Pharmacology", Title: "Sugammadex Block Reversal Dosing", Summary: "2 mg/kg moderate block, 4 mg/kg deep block, 16 mg/kg immediate reversal.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Physiology", Title: "FRC as an Oxygen Reservoir", Summary: "Denitrogenation and maximisation of functional residual capacity.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Airway", Title: "Can't Intubate, Can't Oxygenate (CICO)", Summary: "Immediate progression to emergency scalpel-bougie-tube front-of-neck access.", href: "notes.html#pearls" },
        { Type: "Pearls", Category: "Critical Care", Title: "Sudden Loss of ETCO₂", Summary: "Differentiating circuit disconnection, displacement, PE, and cardiac arrest.", href: "notes.html#pearls" }
      ];

      out.push(...calcEntries, ...pearlEntries);
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

    function wireSearchElement(input, clear, results, status) {
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

    // Wire all in-page search containers
    const inPageInstances = [];
    document.querySelectorAll(".kn-site-search").forEach(wrap => {
      const input = wrap.querySelector("input[type='search'], input");
      const clear = wrap.querySelector("button");
      const section = wrap.closest(".kn-search-card, .kn-search-section, section");
      const results = section ? section.querySelector(".kn-search-results") : null;
      const status = section ? section.querySelector(".kn-search-status") : null;
      if (input && results) {
        const inst = wireSearchElement(input, clear, results, status);
        if (inst) inPageInstances.push(inst);
      }
    });

    // Global Command Palette Modal search bar
    const modalInput = document.getElementById("knModalSearchInput");
    const modalClear = document.getElementById("knModalSearchClear");
    const modalResults = document.getElementById("knModalSearchResults");
    const modalStatus = document.getElementById("knModalSearchStatus");
    const modalSearch = wireSearchElement(modalInput, modalClear, modalResults, modalStatus);

    window.KnockoutNotesSiteSearch = {
      trigger: (query = "") => {
        if (modalSearch) modalSearch.executeSearch(query);
        inPageInstances.forEach(inst => inst.executeSearch(query));
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSearch);
  } else {
    initSearch();
  }
})();
