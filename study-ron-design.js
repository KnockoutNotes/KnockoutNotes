/* ==========================================================================
   KNOCKOUTNOTES — Study Mode Controller (study-ron-design.js)
   1. Point-wise approach to ALL descriptions (no walls of text)
   2. Optimized ECG and vector diagnostic figures (SVG waveforms & diagrams)
   3. Chemical structure positioned on the right of chemical descriptions
   4. Mobile optimized (touch-scrolling, portrait and landscape responsiveness)
   5. Two-line main category menu (Pregnancy moved to Line 2)
   6. Left-side vertical calculators & emergency protocols bubbles
   7. Fast smooth-scrolling subsection buttons with scroll spy
   ========================================================================== */
(function () {
  "use strict";

  const isLightMode = () => !document.body.classList.contains("dark");

  const ICONS = {
    close: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    back: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
    scale: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>`,
    pill: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    cal: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    sliders: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`
  };

  // State
  let activeCat = "all";
  let activeItem = null;
  let searchFilter = "";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const HIGHLIGHT_RE = new RegExp(
    "\\d+(?:\\.\\d+)?(?:\\s?[\\u2013-]\\s?\\d+(?:\\.\\d+)?)?\\s?" +
      "(?:mg\\/kg\\/min|mcg\\/kg\\/min|mg\\/kg\\/h(?:r)?|mcg\\/kg\\/h(?:r)?|units?\\/kg\\/h(?:r)?|" +
      "mg\\/kg|mcg\\/kg|mg\\/min|mcg\\/min|mL\\/kg|ml\\/kg|mEq\\/kg|mg|mcg|g\\/kg|g|mL|ml|units?|IU|mEq|" +
      "mmHg|bpm|minutes?|mins?|hours?|hrs?|seconds?|secs?|%)" +
      "|\\b(?:contraindicated|black[\\s-]box warning|boxed warning|do not (?:administer|give|use)|" +
      "never give|never use|avoid in|life-threatening|malignant hyperthermia|anaphylaxis|" +
      "status epilepticus|FDA-approved|off-label|first-line|second-line)\\b",
    "gi"
  );

  function highlightKeyValues(text) {
    if (!text) return "";
    return text.replace(HIGHLIGHT_RE, (m) => `<strong><u>${m}</u></strong>`);
  }

  function getData() {
    return window.KN_STUDY || { categories: [], topics: [], drugs: [] };
  }

  function getItemsInCat(catId) {
    const data = getData();
    const all = [...(data.topics || []), ...(data.drugs || [])];
    if (catId === "all") return all;
    return all.filter((it) => it.cat === catId);
  }

  function findItem(id) {
    const data = getData();
    return (data.topics || []).find((t) => t.id === id) ||
           (data.drugs || []).find((d) => d.id === id) || null;
  }

  // Related Calculators & Crisis Protocols
  function getRelatedTools(item) {
    const tools = [];
    const text = (item.name + " " + (item.tags || []).join(" ") + " " + (item.cat || "")).toLowerCase();

    if (text.includes("local") || text.includes("lignocaine") || text.includes("bupivacaine") || text.includes("ropivacaine") || text.includes("nerve")) {
      tools.push({ label: "🧮 Local Anaesthetic Max Dose", url: "calculators.html?calc=local" });
      tools.push({ label: "🚨 Crisis: LAST Protocol", url: "crisis.html#last" });
      tools.push({ label: "🎯 Regional Blocks 3D", url: "regional.html" });
    }
    if (text.includes("hyperthermia") || text.includes("succinylcholine") || text.includes("scoline") || text.includes("volatile")) {
      tools.push({ label: "🚨 Malignant Hyperthermia Protocol", url: "crisis.html#mh" });
    }
    if (text.includes("airway") || text.includes("intubation") || text.includes("cricoid") || text.includes("rsi") || text.includes("laryngo") || text.includes("broncho")) {
      tools.push({ label: "🚨 Crisis: Difficult Airway / CICO", url: "crisis.html#airway" });
      tools.push({ label: "🚨 Bronchospasm Protocol", url: "crisis.html#bronchospasm" });
      tools.push({ label: "🫁 Ventilator Station 3D", url: "ventilator.html" });
    }
    if (text.includes("blood") || text.includes("transfusion") || text.includes("fluid") || text.includes("ebl") || text.includes("shock")) {
      tools.push({ label: "🧮 Estimated Blood Loss & Transfusion", url: "calculators.html?calc=ebl" });
      tools.push({ label: "🧮 Maintenance Fluid & Deficit", url: "calculators.html?calc=fluid" });
    }
    if (text.includes("abg") || text.includes("acid") || text.includes("bicarbonate") || text.includes("anion") || text.includes("gas")) {
      tools.push({ label: "🧮 ABG Anion Gap & Delta Ratio", url: "calculators.html?calc=abg" });
    }
    if (text.includes("cvs") || text.includes("cardiac") || text.includes("hypertens") || text.includes("pressure") || text.includes("pressor") || text.includes("vaso") || text.includes("ecg") || text.includes("rhythm") || text.includes("murmur")) {
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html?calc=map" });
      tools.push({ label: "🧮 Revised Cardiac Risk Index (RCRI)", url: "calculators.html?calc=rcri" });
      tools.push({ label: "🚨 Code Room: ACLS Algorithms", url: "crisis.html#acls" });
    }
    if (text.includes("peds") || text.includes("paediatric") || text.includes("child") || text.includes("neonate")) {
      tools.push({ label: "🧮 Paediatric Dosing & Vitals", url: "calculators.html?calc=peds" });
      tools.push({ label: "🚨 Neonatal Resuscitation Protocol", url: "crisis.html#neonatal" });
    }
    if (text.includes("obstetric") || text.includes("pregnancy") || text.includes("eclampsia") || text.includes("labour")) {
      tools.push({ label: "🚨 Maternal Collapse & Eclampsia", url: "crisis.html#ob" });
    }
    if (text.includes("relaxant") || text.includes("rocuronium") || text.includes("vecuronium") || text.includes("sugammadex") || text.includes("tof")) {
      tools.push({ label: "🧮 Neuromuscular Blockade Reversal", url: "calculators.html?calc=peds" });
    }
    if (text.includes("anaphylaxis") || text.includes("allergy") || text.includes("histamine")) {
      tools.push({ label: "🚨 Anaphylaxis Emergency Protocol", url: "crisis.html#anaphylaxis" });
    }
    if (text.includes("antibiotic") || text.includes("sepsis") || text.includes("infection") || text.includes("microb") || text.includes("carbapenem") || text.includes("colistin")) {
      tools.push({ label: "🧮 Sepsis Bundle & Fluids", url: "calculators.html?calc=fluid" });
      tools.push({ label: "🧮 ABG Anion Gap & Delta", url: "calculators.html?calc=abg" });
      tools.push({ label: "🚨 Crisis: Anaphylaxis", url: "crisis.html#anaphylaxis" });
    }
    if (text.includes("poison") || text.includes("toxic") || text.includes("overdose") || text.includes("organophosphate") || text.includes("paracetamol") || text.includes("celphos") || text.includes("snake")) {
      tools.push({ label: "🚨 Crisis: LAST / Toxin Rescue", url: "crisis.html#last" });
      tools.push({ label: "🚨 Code Room: ACLS Protocols", url: "crisis.html#acls" });
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html?calc=map" });
    }
    if (text.includes("shock") || text.includes("hemodynamic") || text.includes("inotrope") || text.includes("tamponade")) {
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html?calc=map" });
      tools.push({ label: "🧮 Estimated Blood Loss & MTP", url: "calculators.html?calc=ebl" });
      tools.push({ label: "🚨 Crisis: ACLS & Resuscitation", url: "crisis.html#acls" });
    }
    if (text.includes("respiratory") || text.includes("ards") || text.includes("weaning") || text.includes("hyperinflation") || text.includes("peep") || text.includes("extubation")) {
      tools.push({ label: "🫁 Ventilator Station 3D", url: "ventilator.html" });
      tools.push({ label: "🧮 ABG Anion Gap & Delta", url: "calculators.html?calc=abg" });
      tools.push({ label: "🚨 Crisis: Bronchospasm & Airway", url: "crisis.html#bronchospasm" });
    }

    if (tools.length < 2) {
      tools.push({ label: "🧮 Medical Calculators Suite", url: "calculators.html" });
      tools.push({ label: "🚨 Code Room & Emergency Algorithms", url: "crisis.html" });
    }

    const seen = new Set();
    return tools.filter(t => {
      if (seen.has(t.url)) return false;
      seen.add(t.url);
      return true;
    });
  }

  // Get list of subsections for fast scroll navigation
  function getItemSubsections(item) {
    const isDrug = !item.sections;
    if (isDrug) {
      return [
        { id: "sec-overview", label: "Overview & Indications" },
        { id: "sec-structure", label: "Chemical Structure" },
        { id: "sec-pd", label: "Pharmacodynamics" },
        { id: "sec-pk", label: "Pharmacokinetics" },
        { id: "sec-dosage", label: "Dosage & Admin" },
        { id: "sec-offLabel", label: "Off-Label Uses" },
        { id: "sec-complications", label: "Complications & Warnings" },
        { id: "sec-references", label: "References" }
      ];
    }

    if (item.sections && item.sections.length) {
      return item.sections.map((s, idx) => ({
        id: `sec-${idx}`,
        label: s.h ? s.h.replace(/^[0-9.]+\s*/, '') : `Section ${idx + 1}`
      }));
    }

    return [{ id: "sec-0", label: "Clinical Overview" }];
  }

  // Navigation actions
  function openTopic(id) {
    if (!id) return;
    const item = findItem(id);
    if (!item) return;
    activeItem = item;
    activeCat = item.cat;

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("item", id);
      window.history.pushState({ item: id }, "", url.toString());
    } catch (e) {}

    renderRonBoard();

    const mount = document.getElementById("ronStudyApp");
    if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function backToCategory() {
    activeItem = null;
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("item");
      if (activeCat && activeCat !== "all") {
        url.searchParams.set("cat", activeCat);
      } else {
        url.searchParams.delete("cat");
      }
      window.history.pushState({ cat: activeCat }, "", url.toString());
    } catch (e) {}

    renderRonBoard();

    const mount = document.getElementById("ronStudyApp");
    if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderRonBoard() {
    // Both light and dark modes now use this controller
    // CSS variables handle all color differences

    let mount = document.getElementById("ronStudyApp");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "ronStudyApp";
      mount.className = "ron-study-app";
      const stage = document.getElementById("stStage");
      if (stage) stage.prepend(mount);
    }
    mount.style.display = "block";

    // Read URL state
    const urlParams = new URLSearchParams(window.location.search);
    const itemParam = urlParams.get("item") || urlParams.get("topic");
    const catParam = urlParams.get("cat");

    if (itemParam) {
      if (!activeItem || activeItem.id !== itemParam) {
        activeItem = findItem(itemParam);
      }
      if (activeItem) activeCat = activeItem.cat;
    } else {
      activeItem = null;
    }

    if (!activeItem) {
      if (catParam) {
        activeCat = catParam;
      }
    }

    const data = getData();
    const categories = data.categories || [];
    const currentCatObj = categories.find((c) => c.id === activeCat) || { label: "All Study Topics", icon: "✦", desc: "Comprehensive source-cited medical and anaesthesia study library" };

    if (activeItem) {
      renderSelectedTopicView(mount, activeItem, currentCatObj, categories);
      mountAll3D(mount);
    } else {
      renderCategoryOverview(mount, activeCat, currentCatObj, categories);
      mountAllCard3D(mount);
    }
  }

  // ==========================================================================
  // TOP MENU: TWO BALANCED LINES FOR ALL CATEGORIES
  // Note: Line 1 (Clinical Examination & Investigations), Line 2 (Pharmacology + Pregnancy)
  // ==========================================================================
  function renderTopPillsTrack(allCats, activeId) {
    const totalCount = getData().topics.length + getData().drugs.length;

    // Line 1: Clinical Domains, Investigations & Critical Care (Includes Antibiotics & Poisoning)
    const line1Cats = allCats.filter(c => ["anaesthesia", "examination", "ecg", "abg", "equipment", "pft", "antibiotics", "poisoning", "shock", "respiratory"].includes(c.id));
    // Line 2: Pharmacology & Drug Monographs (Includes pregnancy / Drugs in Pregnancy)
    const line2Cats = allCats.filter(c => !["anaesthesia", "examination", "ecg", "abg", "equipment", "pft", "antibiotics", "poisoning", "shock", "respiratory"].includes(c.id));

    let line1HTML = `
      <button type="button" class="ron-nav-pill ${activeId === 'all' ? 'active' : ''}" data-ron-cat="all">
        <span>✦</span> All Topics &amp; Drugs <span class="ron-pill-count">${totalCount}</span>
      </button>
    `;
    line1HTML += line1Cats.map((c) => {
      const count = getItemsInCat(c.id).length;
      return `
        <button type="button" class="ron-nav-pill ${activeId === c.id ? 'active' : ''}" data-ron-cat="${c.id}">
          <span>${c.icon}</span> ${esc(c.label)} <span class="ron-pill-count">${count}</span>
        </button>
      `;
    }).join("");

    let line2HTML = line2Cats.map((c) => {
      const count = getItemsInCat(c.id).length;
      return `
        <button type="button" class="ron-nav-pill ${activeId === c.id ? 'active' : ''}" data-ron-cat="${c.id}">
          <span>${c.icon}</span> ${esc(c.label)} <span class="ron-pill-count">${count}</span>
        </button>
      `;
    }).join("");

    return `
      <div class="ron-nav-pills-container">
        <div class="ron-nav-row" role="tablist" aria-label="Clinical Domains &amp; Investigations">
          ${line1HTML}
        </div>
        <div class="ron-nav-row" role="tablist" aria-label="Pharmacology &amp; Drug Classes">
          ${line2HTML}
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // STANDARD PHARMACOLOGICAL CLASSIFICATION ENGINE
  // ==========================================================================
  function getDrugClassificationGroup(item) {
    if (!item) return "General";
    const cls = (item.classification || "").toLowerCase();
    const cat = item.cat || "";

    if (cat === "relaxants") {
      if (cls.includes("non-depolaris") || cls.includes("non-depolariz")) return "Non-Depolarising Neuromuscular Blockers";
      if (cls.includes("depolaris") || cls.includes("depolariz")) return "Depolarising Neuromuscular Blockers";
      return "Other Neuromuscular Blockers";
    }

    if (cat === "induction") {
      if (cls.includes("alkylphenol")) return "Alkylphenols (GABA-A Agonists)";
      if (cls.includes("imidazole")) return "Carboxylated Imidazoles";
      if (cls.includes("nmda") || cls.includes("arylcycloalkylamine") || cls.includes("phencyclidine")) return "NMDA Receptor Antagonists & Dissociatives";
      if (cls.includes("barbiturate")) return "Barbiturates";
      if (cls.includes("benzodiazepine")) return "Benzodiazepines";
      return "Intravenous Induction Agents";
    }

    if (cat === "local") {
      if (cls.includes("aminoamide") || cls.includes("amide")) return "Aminoamide Local Anaesthetics";
      if (cls.includes("aminoester") || cls.includes("ester")) return "Aminoester Local Anaesthetics";
      return "Local Anaesthetics";
    }

    if (cat === "reversal") {
      if (cls.includes("cyclodextrin") || cls.includes("srba") || cls.includes("selective relaxant")) return "Selective Relaxant Binding Agents (SRBA)";
      if (cls.includes("cholinesterase") || cls.includes("carbamate")) return "Acetylcholinesterase Inhibitors";
      return "Reversal Agents";
    }

    if (cat === "opioids") {
      if (cls.includes("partial") || cls.includes("mixed")) return "Partial Agonists & Mixed Agonist-Antagonists";
      if (cls.includes("antagonist")) return "Pure Opioid Receptor Antagonists";
      if (cls.includes("atypical") || cls.includes("dual-mechanism")) return "Atypical & Dual-Mechanism Opioids";
      if (cls.includes("phenylpiperidine") || cls.includes("anilidopiperidine")) return "Synthetic Mu-Opioid Agonists (Phenylpiperidines)";
      if (cls.includes("phenanthrene") || cls.includes("morphinan")) return "Natural & Semi-Synthetic Agonists (Phenanthrenes)";
      return "Opioids";
    }

    if (cat === "nsaids") {
      if (cls.includes("selective cox-2") || cls.includes("coxib")) return "Selective COX-2 Inhibitors";
      if (cls.includes("para-aminophenol") || cls.includes("cox-3") || (item.name || "").toLowerCase().includes("paracetamol")) return "Central Analgesics & Antipyretics (Para-Aminophenols)";
      if (cls.includes("non-selective")) return "Non-Selective NSAIDs (COX-1 & COX-2 Inhibitors)";
      return "Non-Opioid Analgesics";
    }

    if (cat === "vasopressors") {
      if (cls.includes("non-adrenergic") || cls.includes("peptide")) return "Non-Adrenergic Peptide Vasopressors";
      if (cls.includes("alpha-1") && !cls.includes("beta")) return "Pure Alpha-1 Adrenergic Vasopressors";
      if (cls.includes("inodilator") || cls.includes("pde") || cls.includes("inotropic")) return "Inotropes & Inodilators";
      if (cls.includes("sympathomimetic")) return "Direct Sympathomimetic Vasopressors & Inotropes";
      return "Vasopressors & Inotropes";
    }

    if (cat === "antihypertensives") {
      if (cls.includes("ace") || cls.includes("angiotensin-converting")) return "ACE Inhibitors";
      if (cls.includes("arb") || cls.includes("receptor blocker")) return "Angiotensin II Receptor Blockers (ARBs)";
      if (cls.includes("calcium channel") || cls.includes("ccb")) return "Calcium Channel Blockers (CCBs)";
      if (cls.includes("beta-") || cls.includes("adrenoceptor antagonist")) return "Beta-Adrenergic Antagonists";
      if (cls.includes("vasodilator") || cls.includes("nitric oxide donor")) return "Direct Vasodilators & Nitrates";
      return "Antihypertensive Agents";
    }

    if (cat === "antidiabetics") {
      if (cls.includes("insulin")) return "Insulins & Basal Analogues";
      if (cls.includes("biguanide")) return "Biguanides";
      if (cls.includes("sglt2")) return "SGLT2 Inhibitors";
      if (cls.includes("glp-1")) return "GLP-1 Receptor Agonists";
      if (cls.includes("sulfonylurea")) return "Sulfonylureas";
      if (cls.includes("dpp-4")) return "DPP-4 Inhibitors";
      if (cls.includes("thiazolidinedione") || cls.includes("tzd")) return "Thiazolidinediones";
      return "Antidiabetic Agents";
    }

    if (cat === "pregnancy") {
      if (cls.includes("uterotonic") || cls.includes("oxytocin") || cls.includes("prostaglandin") || cls.includes("ergot")) return "Uterotonics & Myometrial Active Agents";
      return "Obstetric Pharmacology";
    }

    if (cat === "alpha2") return "Alpha-2 Adrenergic Agonists";
    if (cat === "steroids") return "Corticosteroids";

    if (cat === "miscellaneous") {
      if (cls.includes("antiemetic") || cls.includes("5-ht3")) return "Antiemetics";
      if (cls.includes("cation") || cls.includes("electrolyte") || cls.includes("buffer")) return "Electrolytes & Systemic Buffers";
      if (cls.includes("antidote") || cls.includes("fat emulsion") || cls.includes("dantrolene")) return "Antidotes & Crisis Rescue Agents";
      if (cls.includes("parasympatholytic") || cls.includes("muscarinic")) return "Parasympatholytics (Antimuscarinics)";
      if (cls.includes("antiarrhythmic")) return "Antiarrhythmic Agents";
      return "Miscellaneous Clinical Agents";
    }

    if (item.classification) {
      return item.classification.split("•")[0].trim();
    }
    return "Clinical Reference";
  }

  function getDrugClassificationBadge(it) {
    if (!it) return "CLINICAL";
    const cls = (it.classification || "").toLowerCase();
    const cat = it.cat || "";

    if (cat === "relaxants") {
      if (cls.includes("non-depolaris") || cls.includes("non-depolariz")) {
        if (cls.includes("aminosteroid")) return "NON-DEPOLARISING • AMINOSTEROID";
        if (cls.includes("benzylisoquinolinium")) return "NON-DEPOLARISING • BENZYLISOQUINOLINIUM";
        if (cls.includes("chlorofumarate")) return "NON-DEPOLARISING • CHLOROFUMARATE";
        return "NON-DEPOLARISING NMB";
      }
      if (cls.includes("depolaris") || cls.includes("depolariz")) {
        return "DEPOLARISING NMB";
      }
    }

    if (cat === "induction") {
      if (cls.includes("alkylphenol")) return "ALKYLPHENOL • GABA-A";
      if (cls.includes("imidazole")) return "IMIDAZOLE ESTER";
      if (cls.includes("nmda") || cls.includes("phencyclidine")) return "NMDA ANTAGONIST / DISSOCIATIVE";
      if (cls.includes("barbiturate")) return "BARBITURATE";
      if (cls.includes("benzodiazepine")) return "BENZODIAZEPINE";
    }

    if (cat === "local") {
      if (cls.includes("aminoamide") || cls.includes("amide")) return "AMINOAMIDE LA";
      if (cls.includes("aminoester") || cls.includes("ester")) return "AMINOESTER LA";
    }

    if (cat === "reversal") {
      if (cls.includes("cyclodextrin") || cls.includes("srba")) return "SRBA CYCLODEXTRIN";
      if (cls.includes("cholinesterase") || cls.includes("carbamate")) return "ANTICHOLINESTERASE";
    }

    if (cat === "opioids") {
      if (cls.includes("pure") && cls.includes("antagonist")) return "PURE OPIOID ANTAGONIST";
      if (cls.includes("partial") || cls.includes("mixed")) return "PARTIAL / MIXED AGONIST";
      if (cls.includes("atypical") || cls.includes("dual-mechanism")) return "ATYPICAL OPIOID";
      if (cls.includes("phenylpiperidine")) return "SYNTHETIC PHENYLPIPERIDINE";
      if (cls.includes("phenanthrene")) return "PHENANTHRENE OPIOID";
    }

    if (cat === "vasopressors") {
      if (cls.includes("non-adrenergic") || cls.includes("peptide")) return "NON-ADRENERGIC PEPTIDE";
      if (cls.includes("alpha-1") && !cls.includes("beta")) return "PURE ALPHA-1 AGONIST";
      if (cls.includes("inodilator") || cls.includes("pde")) return "INODILATOR / PDE-3 INHIBITOR";
      if (cls.includes("sympathomimetic")) return "SYMPATHOMIMETIC INOTROPE";
    }

    if (cat === "nsaids") {
      if (cls.includes("selective cox-2") || cls.includes("coxib")) return "SELECTIVE COX-2 INHIBITOR";
      if (cls.includes("para-aminophenol") || (it.name || "").toLowerCase().includes("paracetamol")) return "CENTRAL ANALGESIC";
      if (cls.includes("non-selective")) return "NON-SELECTIVE NSAID";
    }

    if (cat === "antihypertensives") {
      if (cls.includes("ace")) return "ACE INHIBITOR";
      if (cls.includes("arb")) return "ARB ANTAGONIST";
      if (cls.includes("calcium channel") || cls.includes("ccb")) return "CALCIUM CHANNEL BLOCKER";
      if (cls.includes("beta-")) return "BETA-ADRENOCEPTOR BLOCKER";
      if (cls.includes("vasodilator") || cls.includes("nitric oxide")) return "DIRECT VASODILATOR";
    }

    if (cat === "antidiabetics") {
      if (cls.includes("insulin")) return "INSULIN ANALOGUE";
      if (cls.includes("biguanide")) return "BIGUANIDE";
      if (cls.includes("sglt2")) return "SGLT2 INHIBITOR";
      if (cls.includes("glp-1")) return "GLP-1 AGONIST";
      if (cls.includes("sulfonylurea")) return "SULFONYLUREA";
      if (cls.includes("dpp-4")) return "DPP-4 INHIBITOR";
    }

    if (it.brand) return it.brand.toUpperCase();
    if (it.classification) return it.classification.split("•")[0].trim().toUpperCase().slice(0, 32);
    return it.cat ? it.cat.toUpperCase() : "CLINICAL";
  }

  function getDrugClassificationBadgeClass(it) {
    if (!it) return "";
    const cls = (it.classification || "").toLowerCase();
    if (cls.includes("depolaris") && !cls.includes("non-")) return "ron-badge-depol";
    if (cls.includes("non-depolaris")) return "ron-badge-nondepol";
    if (cls.includes("antagonist") || cls.includes("reversal")) return "ron-badge-antagonist";
    if (cls.includes("aminoamide")) return "ron-badge-amide";
    if (cls.includes("aminoester")) return "ron-badge-ester";
    return "";
  }

  function renderTopicCard(it) {
    const isDrug = !it.sections;
    const has3D = window.KN_STRUCTURES_3D && !!window.KN_STRUCTURES_3D[it.id];
    const drugBadge = isDrug
      ? `<div class="ron-med-capsule"><div class="ron-med-icon-bulb">${ICONS.pill}</div><div class="ron-med-name-bulb">${esc(it.brand || 'Rx Drug')}</div></div>`
      : `<div class="ron-med-capsule"><div class="ron-med-icon-bulb">${ICONS.doc}</div><div class="ron-med-name-bulb">${it.sections ? it.sections.length : 1} Sections</div></div>`;

    const catBadgeText = getDrugClassificationBadge(it);
    const badgeClass = getDrugClassificationBadgeClass(it);

    return `
      <div class="ron-card ron-interactive-topic-card ${has3D ? 'ron-card-has-3d' : ''}" data-topic-id="${it.id}" role="button" tabindex="0" title="Click to open ${esc(it.name)}">
        <div class="ron-card-header">
          <span class="ron-topic-item-cat ${badgeClass}">${esc(catBadgeText)}</span>
          <div class="kn-card-actions-group">
            ${window.KN_WORKSPACE ? window.KN_WORKSPACE.renderBookmarkBtn({
              content_id: 'study:' + it.id,
              content_type: 'study',
              title: it.short || it.name,
              category: it.cat || 'Study Topics',
              route: 'study.html?topic=' + it.id
            }) : ''}
            ${window.KN_WORKSPACE ? window.KN_WORKSPACE.renderStickyBtn({
              content_id: 'study:' + it.id,
              content_type: 'study',
              title: it.short || it.name,
              route: 'study.html?topic=' + it.id
            }) : ''}
            <span class="ron-card-scale-icon">${ICONS.scale}</span>
          </div>
        </div>
        <div class="ron-card-body-row">
          <div class="ron-card-text-col">
            <h4 class="ron-card-title">${esc(it.short || it.name)}</h4>
            <div class="ron-card-tagline">
              ${it.classification ? `<div class="ron-card-cls-text">${esc(it.classification)}</div>` : ''}
              ${it.tagline && it.tagline !== it.classification ? `<div class="ron-card-tagline-sub">${esc(it.tagline)}</div>` : ''}
            </div>
          </div>
          ${has3D ? `
            <div class="ron-card-3d-wrap" title="3D Conformer: ${esc(it.name)}">
              <div class="ron-card-3d-canvas-box" data-tile-drug="${esc(it.id)}">
                <div class="ron-card-3d-placeholder">🔄</div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="ron-card-footer-row">
          ${drugBadge}
          <span class="ron-card-read-link">Read Description →</span>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 1: CATEGORY OVERVIEW
  // ==========================================================================
  function renderCategoryOverview(mount, catId, currentCat, allCats) {
    let items = getItemsInCat(catId);
    if (searchFilter.trim()) {
      const q = searchFilter.trim().toLowerCase();
      items = items.filter((it) => {
        return [it.name, it.short, it.tagline, it.cat, it.brand, it.classification].concat(it.tags || []).filter(Boolean).join(" ").toLowerCase().includes(q);
      });
    }

    let groupsHTML = "";
    if (!items.length) {
      groupsHTML = `
        <div style="grid-column: 1 / -1; background:var(--ron-bg-card); border-radius:24px; padding:36px; text-align:center; color:var(--ron-text-empty);">
          <p style="font-size:16px; font-weight:700;">No items found matching "${esc(searchFilter)}"</p>
          <p style="font-size:13px; color:var(--ron-text-hint);">Try searching for propofol, RSI, TOF, difficult airway, or select a category above.</p>
        </div>
      `;
    } else {
      // Group items by classification
      const groupsMap = new Map();
      items.forEach((it) => {
        const groupName = getDrugClassificationGroup(it);
        if (!groupsMap.has(groupName)) groupsMap.set(groupName, []);
        groupsMap.get(groupName).push(it);
      });

      // Standard pharmacological ordering for relaxants: Depolarising first, then Non-Depolarising
      let orderedGroupNames = Array.from(groupsMap.keys());
      if (catId === "relaxants") {
        orderedGroupNames.sort((a, b) => {
          const aDepol = a.toLowerCase().includes("depolarising") && !a.toLowerCase().includes("non-");
          const bDepol = b.toLowerCase().includes("depolarising") && !b.toLowerCase().includes("non-");
          if (aDepol && !bDepol) return -1;
          if (!aDepol && bDepol) return 1;
          return 0;
        });
      }

      groupsHTML = orderedGroupNames.map((gName) => {
        const groupItems = groupsMap.get(gName);
        const groupCards = groupItems.map(renderTopicCard).join("");

        // Show header if multiple groups or meaningful classification title
        const showHeader = orderedGroupNames.length > 1 || (gName !== "General" && gName !== "Clinical Reference");

        if (!showHeader) {
          return `<div class="ron-flow-grid">${groupCards}</div>`;
        }

        return `
          <div class="ron-classification-group">
            <div class="ron-classification-group-header">
              <div class="ron-classification-group-info">
                <span class="ron-classification-group-pill">PHARMACOLOGICAL CLASSIFICATION</span>
                <h3 class="ron-classification-group-title">${esc(gName)}</h3>
              </div>
              <span class="ron-classification-group-count">${groupItems.length} ${groupItems.length === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div class="ron-flow-grid">
              ${groupCards}
            </div>
          </div>
        `;
      }).join("");
    }

    mount.innerHTML = `
      <div class="ron-device-frame">
        <div class="ron-screen">

          <!-- 1. Header Bar: Scoop Tab + Inline Search -->
          <div class="ron-header-bar">
            <div class="ron-header-top-row">
              <div class="ron-header-left">
                <button class="ron-close-btn" id="ronResetBtn" title="Reset View" aria-label="Reset View">
                  ${ICONS.close}
                </button>
                <div class="ron-title-scoop">
                  <h1>${esc(currentCat.label)}</h1>
                </div>
              </div>

              <!-- Top Inline Search Input -->
              <div class="ron-inline-search-wrap">
                <input type="search" id="ronInlineSearchInput" class="ron-inline-search-input"
                  placeholder="🔍 Search all 171 topics &amp; drugs (e.g. Propofol, RSI, TOF)..."
                  value="${esc(searchFilter)}" autocomplete="off">
              </div>
            </div>

            <!-- Two-Line Categories Menu -->
            ${renderTopPillsTrack(allCats, catId)}
          </div>

          <!-- 2. Summary Banner -->
          <div class="ron-summary-banner">
            <div class="ron-profile-card">
              <div class="ron-avatar-wrap" style="font-size:32px;">
                ${currentCat.icon}
              </div>
              <div class="ron-profile-info">
                <span class="ron-profile-meta">SYLLABUS CATEGORY</span>
                <span class="ron-profile-name">${esc(currentCat.label)}</span>
                <div class="ron-profile-progress"></div>
              </div>
            </div>

            <div class="ron-stats-area">
              <div class="ron-stats-header">
                <div class="ron-diagnosis-block">
                  <span class="ron-diagnosis-label">CATEGORY OVERVIEW</span>
                  <h2 class="ron-diagnosis-title">${esc(currentCat.desc || "Anaesthesia &amp; Critical Care Reference")}</h2>
                </div>

                <div class="ron-vitals-strip">
                  <div class="ron-vital-item">
                    <span class="ron-vital-label">Available Entries</span>
                    <span class="ron-vital-val">${items.length} <small>topics</small></span>
                  </div>
                  <div class="ron-vital-item">
                    <span class="ron-vital-label">Exam Yield</span>
                    <span class="ron-vital-val">High <small>★★★★★</small></span>
                  </div>
                  <div class="ron-vital-item">
                    <span class="ron-vital-label">Source</span>
                    <span class="ron-vital-val">Miller / FDA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Connected Cards Grid -->
          <div class="ron-flowchart-stage">
            <div class="ron-guideline-track">
              <div class="ron-guideline-line"></div>
              <div style="display:flex; justify-content:space-around; width:100%; padding-right:70px;">
                <div class="ron-step-node" title="Section 1">${ICONS.doc}</div>
                <div class="ron-step-node" title="Section 2">${ICONS.pill}</div>
              </div>
              <button class="ron-plus-action-btn" id="ronPlusBtn" title="Search all topics">+</button>
            </div>

            <div class="ron-classification-stage-content">
              ${groupsHTML}
            </div>
          </div>

          <!-- 4. Bottom Scrubber Dock -->
          ${renderBottomDock(catId, allCats)}

        </div>
      </div>

      <!-- Quick Topics Modal -->
      ${renderTopicsModal()}
    `;

    mountAllCard3D(mount);
  }

  // ==========================================================================
  // VIEW 2: SELECTED TOPIC (COMPLETE DESCRIPTION, VERTICAL BUBBLES ON LEFT)
  // ==========================================================================
  function renderSelectedTopicView(mount, item, currentCat, allCats) {
    const isDrug = !item.sections;
    const subsections = getItemSubsections(item);

    // Fast-scroll action pills
    const subPillsHTML = subsections.map((sub, i) => `
      <button type="button" class="ron-filter-pill ${i === 0 ? 'active' : ''}" data-target-id="${sub.id}">
        ${esc(sub.label)}
      </button>
    `).join("");

    // Metrics Strip
    let vitalsHTML = "";
    if (isDrug) {
      vitalsHTML = `
        <div class="ron-vital-item">
          <span class="ron-vital-label">Classification</span>
          <span class="ron-vital-val" style="font-size:13.5px;">${esc(item.classification || 'Anaesthetic')}</span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Brand Name</span>
          <span class="ron-vital-val" style="font-size:13.5px;">${esc(item.brand || 'Generic')}</span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Onset</span>
          <span class="ron-vital-val">Rapid <small>&lt; 1 min</small></span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Safety Status</span>
          <span class="ron-vital-val" style="color:var(--ron-color-warning); font-size:13.5px;">Boxed Warning</span>
        </div>
      `;
    } else {
      vitalsHTML = `
        <div class="ron-vital-item">
          <span class="ron-vital-label">Exam Yield</span>
          <span class="ron-vital-val">High <small>★★★★★</small></span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Clinical Scope</span>
          <span class="ron-vital-val" style="font-size:13.5px;">${esc(currentCat.label)}</span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Subsections</span>
          <span class="ron-vital-val">${item.sections ? item.sections.length : 1} <small>clinical areas</small></span>
        </div>
        <div class="ron-vital-item">
          <span class="ron-vital-label">Guideline Source</span>
          <span class="ron-vital-val" style="font-size:13.5px;">Miller / ASA</span>
        </div>
      `;
    }

    // Related Clinical Tools as VERTICAL BUBBLES ON THE LEFT
    const relatedTools = getRelatedTools(item);
    const verticalToolsHTML = `
      <div class="ron-related-tools-vertical">
        <div class="ron-vertical-tools-heading">
          <span style="font-size:13px;">🔗</span> CALCULATORS &amp; PROTOCOLS
        </div>
        ${relatedTools.map(t => `
          <a href="${t.url}" class="ron-vertical-tool-pill" title="${esc(t.label)}">
            <span>${esc(t.label)}</span>
            <span class="ron-tool-arrow">↗</span>
          </a>
        `).join("")}
      </div>
    `;

    // Render COMPLETE description (all subsections in full sequence)
    const completeDescriptionHTML = renderCompleteDescription(item, isDrug);

    mount.innerHTML = `
      <div class="ron-device-frame">
        <div class="ron-screen">

          <!-- 1. Header Bar: Back Button + Scoop Tab + Search -->
          <div class="ron-header-bar">
            <div class="ron-header-top-row">
              <div class="ron-header-left">
                <button class="ron-close-btn" id="ronBackToCatBtn" title="Back to Category View" aria-label="Back">
                  ${ICONS.back}
                </button>
                <div class="ron-title-scoop">
                  <h1>${esc(currentCat.label)}</h1>
                </div>
              </div>

              <!-- Top Inline Search Input -->
              <div class="ron-inline-search-wrap">
                <input type="search" id="ronInlineSearchInput" class="ron-inline-search-input"
                  placeholder="🔍 Search all 171 topics &amp; drugs..."
                  value="${esc(searchFilter)}" autocomplete="off">
              </div>
            </div>

            <!-- Two-Line Categories Menu -->
            ${renderTopPillsTrack(allCats, item.cat)}
          </div>

          <!-- 2. Topic Hero Layout: Left Side (Profile + Vertical Tools) & Right Side (Header + Fast Scroll Buttons) -->
          <div class="ron-topic-hero-layout">

            <!-- Left Side: Profile Card + Vertical Calculators & Protocols Bubbles -->
            <div class="ron-topic-left-col">
              <div class="ron-profile-card">
                <div class="ron-avatar-wrap" style="font-size:32px;">
                  ${currentCat.icon}
                </div>
                <div class="ron-profile-info">
                  <span class="ron-profile-meta">${esc(item.source ? item.source.slice(0, 36) + '...' : 'SOURCE CITED')}</span>
                  <span class="ron-profile-name">${esc(item.short || item.name)}</span>
                  <div class="ron-profile-progress"></div>
                </div>
              </div>

              <!-- Vertical Bubbles on Left Side -->
              ${verticalToolsHTML}
            </div>

            <!-- Right Side: Title + Vitals + Fast Scroll Subsection Buttons -->
            <div class="ron-topic-main-col">
              <div class="ron-stats-header">
                <div class="ron-diagnosis-block">
                  <span class="ron-diagnosis-label">STUDY TOPIC MONOGRAPH</span>
                  <h2 class="ron-diagnosis-title">${esc(item.name)}</h2>
                  ${item.classification ? `
                    <div class="ron-topic-classification-hero">
                      <span class="ron-cls-hero-pill">STANDARD CLASSIFICATION</span>
                      <span class="ron-cls-hero-text">${esc(item.classification)}</span>
                    </div>
                  ` : ''}
                  ${item.tagline && item.tagline !== item.classification ? `<p style="margin:6px 0 0; font-size:14px; color:var(--ron-text-tagline); line-height:1.5;">${esc(item.tagline)}</p>` : ''}
                  <div class="kn-monograph-action-bar">
                    ${window.KN_WORKSPACE ? window.KN_WORKSPACE.renderBookmarkBtn({
                      content_id: 'study:' + item.id,
                      content_type: 'study',
                      title: item.name,
                      category: item.cat || 'Study Topics',
                      route: 'study.html?topic=' + item.id
                    }) : ''}
                    ${window.KN_WORKSPACE ? window.KN_WORKSPACE.renderStickyBtn({
                      content_id: 'study:' + item.id,
                      content_type: 'study',
                      title: item.name,
                      route: 'study.html?topic=' + item.id
                    }) : ''}
                    ${window.KN_WORKSPACE ? window.KN_WORKSPACE.renderNoteBtn({
                      content_id: 'study:' + item.id,
                      content_type: 'study',
                      title: item.name,
                      route: 'study.html?topic=' + item.id
                    }) : ''}
                  </div>
                </div>

                <div class="ron-vitals-strip">
                  ${vitalsHTML}
                </div>
              </div>

              <!-- Fast Scroll Subsection Navigation Pills -->
              <div class="ron-action-pills-row" style="margin-top:16px;">
                <button class="ron-slider-btn" id="ronOpenAllTopicsBtn" title="Browse Topics Directory" aria-label="Browse Topics">
                  ${ICONS.sliders}
                </button>
                ${subPillsHTML}
              </div>
            </div>

          </div>

          <!-- 3. THE MAIN CONTAINER BOX (Complete Description in Full Sequence) -->
          <div class="ron-stage-container" id="ronMainContentBox">
            
            <!-- Top Section Header Pill -->
            <div style="text-align:center;">
              <div class="ron-stage-pill" id="ronStagePillTitle">
                ${esc(subsections[0] ? subsections[0].label : item.name)}
              </div>
            </div>

            <!-- Guideline Track Line with Step Nodes -->
            <div class="ron-guideline-track" style="margin-bottom:20px;">
              <div class="ron-guideline-line"></div>
              <div style="display:flex; justify-content:space-around; width:100%; padding-right:70px;">
                <div class="ron-step-node" title="Clinical Description">${ICONS.doc}</div>
                <div class="ron-step-node" title="Examination &amp; Protocols">${ICONS.edit}</div>
              </div>
              <button class="ron-plus-action-btn" id="ronPlusBtn" title="Search all topics">+</button>
            </div>

            <!-- Complete Clinical Description (All Subsections Point-Wise with Optimized Diagrams) -->
            <div class="ron-description-container" id="ronActiveDescriptionBox">
              ${completeDescriptionHTML}
            </div>

          </div>

          <!-- Note: All Topics option removed from lower left end of topic view -->

        </div>
      </div>

      <!-- Quick Topics Modal -->
      ${renderTopicsModal()}
    `;

    // Mount 3D molecule viewers if present
    mountAll3D(mount);

    // Setup scroll spy to highlight the corresponding button as user scrolls
    setupScrollSpy(subsections);
  }

  // ==========================================================================
  // CARD 3D MOLECULE THUMBNAIL CONTROLLER (Shared Single-Context WebGL)
  // ==========================================================================
  function mountAllCard3D(root) {
    function tryMountCards() {
      const boxes = Array.from((root || document).querySelectorAll("[data-tile-drug]"));
      if (!boxes.length) return true;
      if (typeof window.KNMountTileMolecule !== "function") return false;

      let unmounted = 0;
      boxes.forEach((box) => {
        if (!box.isConnected || box.classList.contains("st-has-canvas")) return;
        const drugId = box.getAttribute("data-tile-drug");
        if (!drugId) return;
        try {
          const ok = window.KNMountTileMolecule(box, drugId);
          if (!ok) unmounted++;
        } catch (e) {
          unmounted++;
        }
      });
      return unmounted === 0;
    }

    if (typeof window.KNMountTileMolecule === "function") {
      requestAnimationFrame(tryMountCards);
      setTimeout(tryMountCards, 60);
      setTimeout(tryMountCards, 250);
      setTimeout(tryMountCards, 750);
    }

    window.addEventListener("kn-molecule3d-ready", tryMountCards, { once: true });
    let attempts = 0;
    const timer = setInterval(() => {
      attempts++;
      if (typeof window.KNMountTileMolecule === "function") {
        const allDone = tryMountCards();
        if (allDone || attempts > 35) clearInterval(timer);
      }
    }, 80);
  }

  // ==========================================================================
  // 3D MOLECULE MOUNTING CONTROLLER (Interactive WebGL Rotating Conformer)
  // ==========================================================================
  function mountAll3D(root) {
    function attemptAll() {
      const nodes = Array.from((root || document).querySelectorAll(".st-molecule-viewer[data-drug]"));
      if (!nodes.length) return true;

      let allDone = true;
      nodes.forEach((node) => {
        if (!node.isConnected || node.classList.contains("st-has-canvas")) return;
        const drugId = node.getAttribute("data-drug");
        const data = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[drugId];
        if (!data) {
          const ph = node.querySelector(".st-molecule-placeholder");
          if (ph) ph.textContent = "3D structure not available";
          return;
        }

        // Strategy 1: Full interactive 3D viewer
        if (typeof window.KNMountMolecule3D === "function") {
          try {
            const ok = window.KNMountMolecule3D(node, data, { isThumbnail: false });
            if (ok) return;
          } catch (err) {
            console.warn("KNMountMolecule3D error for " + drugId, err);
          }
        }

        // Strategy 2: Single-context tile renderer fallback
        if (typeof window.KNMountTileMolecule === "function") {
          try {
            const ok = window.KNMountTileMolecule(node, drugId);
            if (ok) return;
          } catch (err) {
            console.warn("KNMountTileMolecule error for " + drugId, err);
          }
        }

        allDone = false;
      });
      return allDone;
    }

    if (typeof window.KNMountMolecule3D === "function" || typeof window.KNMountTileMolecule === "function") {
      requestAnimationFrame(attemptAll);
      setTimeout(attemptAll, 60);
      setTimeout(attemptAll, 200);
      setTimeout(attemptAll, 600);
      setTimeout(attemptAll, 1200);
    }

    window.addEventListener("kn-molecule3d-ready", attemptAll, { once: true });
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (typeof window.KNMountMolecule3D === "function" || typeof window.KNMountTileMolecule === "function") {
        const done = attemptAll();
        if (done || count > 35) clearInterval(interval);
      }
    }, 80);
  }

  // ==========================================================================
  // COMPLETE DESCRIPTION RENDERER (ALL SUBSECTIONS IN FULL POINT-WISE APPROACH)
  // ==========================================================================
  function renderCompleteDescription(item, isDrug) {
    const sourceCalloutHTML = item.source ? `
      <div class="ron-source-callout">
        <span class="ron-source-icon">📚</span>
        <div class="ron-source-body">
          <strong style="text-transform:uppercase; letter-spacing:0.04em; font-size:11.5px; color:var(--ron-text-muted);">SOURCE REFERENCE</strong>
          <p style="margin:2px 0 0; font-size:13px; color:var(--ron-text-secondary); font-style:italic;">${esc(item.source)}</p>
        </div>
      </div>
    ` : "";

    if (isDrug) {
      const drugSections = [
        { id: "sec-overview", title: "Overview & Clinical Indications", text: (item.tagline ? item.tagline + "\n\n" : "") + (item.desc || (item.brand ? `Brand: ${item.brand}\nClass: ${item.classification || ''}` : '')) },
        { id: "sec-structure", title: "Chemical Structure & Formulation", text: item.structure },
        { id: "sec-pd", title: "Pharmacodynamics & Receptor Targets", text: item.pd },
        { id: "sec-pk", title: "Pharmacokinetics & Elimination", text: item.pk },
        { id: "sec-dosage", title: "Dosage & Administration Guidelines", text: item.dosage },
        { id: "sec-offLabel", title: "Off-Label & Perioperative Uses", text: item.offLabel },
        { id: "sec-complications", title: "Complications & Boxed Warnings", text: item.complications }
      ];

      const cardsHTML = drugSections.filter(s => s.text).map(s => {
        // Chemical Structure: Wrap 2D/3D structure to fit tight with text
        if (s.id === "sec-structure") {
          const rec2d = window.KN_STRUCTURES && window.KN_STRUCTURES[item.id];
          const has3d = window.KN_STRUCTURES_3D && window.KN_STRUCTURES_3D[item.id];

          if (rec2d || has3d) {
            return `
              <div class="ron-card ron-notes-card" id="${s.id}">
                <div class="ron-card-header">
                  <h3 class="ron-card-title" style="text-transform:uppercase; font-size:15px; letter-spacing:0.04em; color:var(--ron-accent); margin:0;">
                    ${esc(s.title)}
                  </h3>
                  <span class="ron-card-scale-icon">${ICONS.scale}</span>
                </div>
                <div class="ron-prose ron-structure-tight-prose" style="margin-top:14px;">
                  <div class="ron-structure-float-wrap">
                    ${rec2d ? `
                      <div class="ron-structure-tight-card">
                        <div class="ron-structure-tight-head">
                          <span class="ron-structure-badge">📐 2D Structure</span>
                          ${rec2d.formula ? `<span class="ron-structure-formula-chip">${esc(rec2d.formula)}</span>` : ''}
                        </div>
                        <div class="ron-structure-svg-compact">
                          ${rec2d.svg}
                        </div>
                      </div>
                    ` : ''}
                    ${has3d ? `
                      <div class="ron-structure-tight-card">
                        <div class="ron-structure-tight-head">
                          <span class="ron-structure-badge">🔄 3D Conformer</span>
                          <span class="ron-structure-3d-hint">Rotate 360°</span>
                        </div>
                        <div class="st-molecule-viewer ron-structure-3d-compact" data-drug="${esc(item.id)}">
                          <div class="st-molecule-placeholder" style="display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:var(--ron-text-hint);">Loading 3D...</div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                  ${formatProseLines(s.text)}
                </div>
              </div>
            `;
          }
        }

        // Standard drug section card
        const classificationCallout = (s.id === "sec-overview" && item.classification) ? `
          <div class="ron-classification-box">
            <div class="ron-classification-box-header">
              <span class="ron-classification-box-icon">🏷️</span>
              <span class="ron-classification-box-label">LATEST &amp; STANDARD PHARMACOLOGICAL CLASSIFICATION</span>
            </div>
            <div class="ron-classification-box-body">
              <div class="ron-classification-primary">${esc(item.classification.split('•')[0].trim())}</div>
              ${item.classification.includes('•') ? `<div class="ron-classification-secondary">${esc(item.classification.split('•').slice(1).join('•').trim())}</div>` : ''}
            </div>
          </div>
        ` : "";

        return `
          <div class="ron-card ron-notes-card" id="${s.id}">
            <div class="ron-card-header">
              <h3 class="ron-card-title" style="text-transform:uppercase; font-size:15px; letter-spacing:0.04em; color:var(--ron-accent); margin:0;">
                ${esc(s.title)}
              </h3>
              <span class="ron-card-scale-icon">${ICONS.scale}</span>
            </div>
            <div class="ron-prose" style="margin-top:14px;">
              ${classificationCallout}
              ${formatProseLines(s.text)}
            </div>
          </div>
        `;
      }).join("") + (item.references && item.references.length ? `
        <div class="ron-card ron-notes-card" id="sec-references">
          <div class="ron-card-header">
            <h3 class="ron-card-title" style="text-transform:uppercase; font-size:15px; letter-spacing:0.04em; color:var(--ron-accent); margin:0;">
              References &amp; Prescribing Guidelines
            </h3>
            <span class="ron-card-scale-icon">${ICONS.scale}</span>
          </div>
          <ul style="margin:14px 0 0; padding-left:22px; font-size:14px; color:var(--ron-text-body); line-height:1.8;">
            ${item.references.map((r) => `<li style="margin-bottom:8px;">📚 ${highlightKeyValues(esc(r))}</li>`).join("")}
          </ul>
        </div>
      ` : "");

      return sourceCalloutHTML + cardsHTML;
    }

    // Clinical Topics
    if (item.sections && item.sections.length) {
      const cardsHTML = item.sections.map((sec, idx) => {
        // Point-wise body
        let bodyHTML = "";
        if (typeof sec.b === "string") {
          bodyHTML = formatProseLines(sec.b);
        } else if (Array.isArray(sec.b)) {
          bodyHTML = sec.b.map((b) => `<div class="ron-point-row"><span class="ron-point-bullet">•</span><div class="ron-point-text">${highlightKeyValues(esc(b))}</div></div>`).join("");
        } else if (sec.b) {
          bodyHTML = `<div class="ron-point-row"><span class="ron-point-bullet">•</span><div class="ron-point-text">${highlightKeyValues(esc(String(sec.b)))}</div></div>`;
        }

        // Callout blocks (pearl, pitfall, example)
        let calloutsHTML = "";
        if (sec.pearl) {
          calloutsHTML += `
            <div class="ron-callout ron-callout-pearl">
              <span class="ron-callout-badge">💡 Clinical Key Point</span>
              <div>${formatProseLines(sec.pearl)}</div>
            </div>`;
        }
        if (sec.pitfall) {
          calloutsHTML += `
            <div class="ron-callout ron-callout-pitfall">
              <span class="ron-callout-badge">⚠️ Lethal Pitfall &amp; Safety Warning</span>
              <div>${formatProseLines(sec.pitfall)}</div>
            </div>`;
        }
        if (sec.example) {
          calloutsHTML += `
            <div class="ron-callout ron-callout-example">
              <span class="ron-callout-badge">🧩 Worked Clinical Case Example</span>
              <div>${formatProseLines(sec.example)}</div>
            </div>`;
        }

        // Clinical Vector Diagram / ECG Waveform
        let diagramHTML = "";
        if (sec.diagram && typeof window.KN_GET_DIAGRAM === "function") {
          const dSvg = window.KN_GET_DIAGRAM(sec.diagram);
          if (dSvg) {
            diagramHTML = `
              <div class="ron-diagram-card">
                <div class="ron-diagram-header">
                  <span class="ron-diagram-badge">📈 Diagnostic Vector Diagram &amp; Waveform</span>
                </div>
                <div class="ron-diagram-body">
                  ${dSvg}
                </div>
              </div>
            `;
          }
        }

        // Section Images / Figures (Floated to wrap tight with text)
        let imagesHTML = "";
        if (Array.isArray(sec.images)) {
          imagesHTML = sec.images.map(img => `
            <div class="ron-figure-wrap-float">
              <img src="${esc(img.src)}" alt="${esc(img.alt || 'Clinical Diagram')}" class="ron-figure-img" loading="lazy">
              ${img.caption ? `<p class="ron-figure-caption">🔍 ${esc(img.caption)}</p>` : ''}
            </div>
          `).join("");
        } else if (sec.image) {
          imagesHTML = `
            <div class="ron-figure-wrap-float">
              <img src="${esc(sec.image.src)}" alt="${esc(sec.image.alt || 'Clinical Diagram')}" class="ron-figure-img" loading="lazy">
              ${sec.image.caption ? `<p class="ron-figure-caption">🔍 ${esc(sec.image.caption)}</p>` : ''}
            </div>
          `;
        }

        // Table
        let tableHTML = "";
        if (sec.table && sec.table.headers && sec.table.rows) {
          const ths = sec.table.headers.map(h => `<th>${esc(h)}</th>`).join("");
          const trs = sec.table.rows.map(row => {
            const tds = row.map(cell => {
              if (cell && typeof cell === "object") {
                const badge = cell.badge ? `<span class="ron-table-badge" style="background:${cell.badgeColor || 'var(--ron-accent)'};">${esc(cell.badge)}</span>` : '';
                return `<td>${badge} <strong>${highlightKeyValues(esc(cell.text || ''))}</strong></td>`;
              }
              return `<td>${highlightKeyValues(esc(String(cell)))}</td>`;
            }).join("");
            return `<tr>${tds}</tr>`;
          }).join("");

          tableHTML = `
            <div class="ron-table-wrap">
              <table class="ron-clinical-table">
                <thead><tr>${ths}</tr></thead>
                <tbody>${trs}</tbody>
              </table>
              ${sec.table.caption ? `<p class="ron-table-caption">📋 ${esc(sec.table.caption)}</p>` : ''}
            </div>
          `;
        }

        // Cross-links
        let crossLinksHTML = "";
        if (sec.crossLinks && sec.crossLinks.length) {
          crossLinksHTML = `
            <div class="ron-crosslinks-bar">
              <span class="ron-crosslinks-label">Related References:</span>
              ${sec.crossLinks.map(c => `
                <button type="button" class="ron-crosslink-bubble" data-topic-id="${c.item}">
                  ${esc(c.label)} ↗
                </button>
              `).join("")}
            </div>
          `;
        }

        return `
          <div class="ron-card ron-notes-card" id="sec-${idx}">
            <div class="ron-card-header">
              <h3 class="ron-card-title" style="font-size:17px; font-weight:750; color:var(--ron-text-primary); margin:0;">
                ${esc(sec.h || `Section ${idx + 1}`)}
              </h3>
              <span class="ron-card-scale-icon">${ICONS.scale}</span>
            </div>
            <div class="ron-prose ron-figure-tight-prose" style="margin-top:14px;">
              ${imagesHTML}
              ${bodyHTML}
              ${calloutsHTML}
              ${diagramHTML}
              ${tableHTML}
              ${crossLinksHTML}
            </div>
          </div>
        `;
      }).join("");

      return sourceCalloutHTML + cardsHTML;
    }

    return `
      <div class="ron-card ron-notes-card">
        <p style="font-size:14px; color:var(--ron-text-empty);">No extended text available for this topic.</p>
      </div>
    `;
  }

  // ==========================================================================
  // POINT-WISE APPROACH TO ALL DESCRIPTIONS
  // Converts raw clinical text into clean, structured points with bold highlights
  // ==========================================================================
  function formatProseLines(rawText) {
    if (!rawText) return "";
    const lines = rawText.split("\n");
    let result = "";

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      // 1. Numbered Heading / Step (e.g. "1. Pathophysiological Mechanisms:", "2. Mitral Stenosis (MS):")
      if (/^\d+\.\s/.test(trimmed)) {
        result += `<div class="ron-numbered-point">
          <div class="ron-point-num-badge">${trimmed.match(/^\d+/)[0]}</div>
          <div class="ron-point-num-content">
            <h4 class="ron-point-title">${highlightKeyValues(esc(trimmed.replace(/^\d+\.\s*/, "")))}</h4>
          </div>
        </div>`;
      }
      // 2. Existing Bullet (e.g. "• ...", "- ...", "* ...")
      else if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.replace(/^[\u2022\-\*]\s*/, "");
        result += `<div class="ron-point-row">
          <span class="ron-point-bullet">•</span>
          <div class="ron-point-text">${highlightKeyValues(esc(text))}</div>
        </div>`;
      }
      // 3. Sub-point with key label (e.g. "Auscultation Finding: ...", "Anaesthetic Goals: ...", "Severity Criteria: ...")
      else if (/^([A-Z][A-Za-z0-9\s\/\(\)-]{2,32}):\s+(.+)$/.test(trimmed)) {
        const match = trimmed.match(/^([A-Z][A-Za-z0-9\s\/\(\)-]{2,32}):\s+(.+)$/);
        result += `<div class="ron-point-row ron-point-keyval">
          <span class="ron-point-bullet">•</span>
          <div class="ron-point-text">
            <strong class="ron-point-label">${esc(match[1])}:</strong> ${highlightKeyValues(esc(match[2]))}
          </div>
        </div>`;
      }
      // 4. Standard Paragraph -> Split into clean sentence-level points
      else {
        const sentences = trimmed.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g);
        if (sentences && sentences.length > 1) {
          sentences.forEach(s => {
            const st = s.trim();
            if (st) {
              result += `<div class="ron-point-row">
                <span class="ron-point-bullet">•</span>
                <div class="ron-point-text">${highlightKeyValues(esc(st))}</div>
              </div>`;
            }
          });
        } else {
          result += `<div class="ron-point-row">
            <span class="ron-point-bullet">•</span>
            <div class="ron-point-text">${highlightKeyValues(esc(trimmed))}</div>
          </div>`;
        }
      }
    });

    return result;
  }

  // Fast scroll to target section card
  function fastScrollToSection(targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    // Highlight button
    document.querySelectorAll("[data-target-id]").forEach(p => {
      if (p.getAttribute("data-target-id") === targetId) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    // Update Stage Pill Title
    const titlePill = document.getElementById("ronStagePillTitle");
    const heading = target.querySelector(".ron-card-title");
    if (titlePill && heading) {
      titlePill.textContent = heading.textContent.trim();
    }

    // Scroll smoothly and fast
    const yOffset = -90;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // Scroll spy to update active button as user scrolls
  function setupScrollSpy(subsections) {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          document.querySelectorAll("[data-target-id]").forEach(p => {
            if (p.getAttribute("data-target-id") === id) {
              p.classList.add("active");
            } else {
              p.classList.remove("active");
            }
          });

          const titlePill = document.getElementById("ronStagePillTitle");
          const heading = entry.target.querySelector(".ron-card-title");
          if (titlePill && heading) {
            titlePill.textContent = heading.textContent.trim();
          }
        }
      });
    }, {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0
    });

    subsections.forEach(sub => {
      const el = document.getElementById(sub.id);
      if (el) observer.observe(el);
    });
  }

  // ==========================================================================
  // BOTTOM DOCK SCRUBBER (Used for Category View only)
  // ==========================================================================
  function renderBottomDock(activeId, allCats) {
    const totalCount = getData().topics.length + getData().drugs.length;
    const streamHTML = allCats.map((c) => {
      const count = getItemsInCat(c.id).length;
      return `
        <span class="ron-dock-node ${c.id === activeId ? 'active-text' : ''}" data-ron-cat="${c.id}" title="${esc(c.label)}">
          <span>${c.icon}</span> ${esc(c.label.split(' ')[0])}
          <span class="ron-badge-bubble">${count}</span>
        </span>
      `;
    }).join("");

    const activeCatObj = allCats.find((c) => c.id === activeId) || { icon: "✦", label: "All Topics" };

    return `
      <div class="ron-dock-wrap">
        <div class="ron-dock-shell">
          <div class="ron-dock-calendar">
            <span class="ron-dock-cal-icon">${ICONS.cal}</span>
            <span class="ron-dock-cal-label">${totalCount} TOPICS</span>
          </div>

          <div class="ron-dock-stream">
            ${streamHTML}
          </div>

          <div class="ron-dock-pill-active">
            <span style="font-size:14px;">${activeCatObj.icon}</span>
            <span>${esc(activeCatObj.label.split(' ')[0])}</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // TOPICS DIRECTORY MODAL
  // ==========================================================================
  function renderTopicsModal() {
    return `
      <div class="ron-topics-modal" id="ronTopicsModal" hidden>
        <div class="ron-topics-sheet">
          <div class="ron-topics-sheet-head">
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="font-size:24px;">✦</span>
              <div>
                <h2>Knockout Notes Study Library</h2>
                <p style="margin:2px 0 0; font-size:12.5px; color:var(--ron-text-empty);">Browse 171 source-cited anaesthesia &amp; critical care topics, clinical exams, ECGs, antibiotics, toxicology &amp; drug monographs</p>
              </div>
            </div>
            <button class="ron-close-btn" id="ronCloseModalBtn" aria-label="Close dialog">
              ${ICONS.close}
            </button>
          </div>

          <div class="ron-sheet-search">
            <input type="search" id="ronSheetSearchInput"
              placeholder="Type to filter topics (e.g. Propofol, RSI, TOF, Difficult Airway)..." autocomplete="off">
          </div>

          <div class="ron-sheet-grid" id="ronSheetGrid">
            ${renderAllTopicCards("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderAllTopicCards(query) {
    const data = getData();
    const all = [...(data.topics || []), ...(data.drugs || [])];
    const q = (query || "").trim().toLowerCase();

    const matched = all.filter((it) => {
      if (!q) return true;
      return [it.name, it.short, it.tagline, it.cat, it.brand, it.classification].concat(it.tags || []).filter(Boolean).join(" ").toLowerCase().includes(q);
    });

    return matched.map((it) => `
      <div class="ron-topic-item-card ron-interactive-topic-card" data-topic-id="${it.id}">
        <span class="ron-topic-item-cat ${getDrugClassificationBadgeClass(it)}">${esc(getDrugClassificationBadge(it))}</span>
        <strong class="ron-topic-item-name">${esc(it.short || it.name)}</strong>
        <span class="ron-topic-item-tag">${esc(it.classification ? it.classification.split('•')[0].trim() : (it.tagline || ''))}</span>
      </div>
    `).join("");
  }

  // ==========================================================================
  // GLOBAL CLICK LISTENER DELEGATION
  // ==========================================================================
  document.addEventListener("click", (e) => {

    // 1. Topic Card clicked -> Open Topic Description
    const topicCard = e.target.closest("[data-topic-id]");
    if (topicCard) {
      if (e.target.closest("[data-kn-bookmark-id], [data-kn-sticky-id], .kn-btn-icon-action, .kn-action-chip-btn")) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      const id = topicCard.getAttribute("data-topic-id");
      if (id) {
        const modal = document.getElementById("ronTopicsModal");
        if (modal) modal.hidden = true;
        openTopic(id);
      }
      return;
    }

    // 2. Fast Scroll Subsection Action Button clicked -> Smooth fast scroll!
    const subPill = e.target.closest("[data-target-id]");
    if (subPill) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = subPill.getAttribute("data-target-id");
      if (targetId) {
        fastScrollToSection(targetId);
      }
      return;
    }

    // 3. Back Button clicked -> Back to Category
    if (e.target.closest("#ronBackToCatBtn")) {
      e.preventDefault();
      e.stopPropagation();
      backToCategory();
      return;
    }

    // 4. Reset Button clicked -> Reset to All Categories
    if (e.target.closest("#ronResetBtn")) {
      e.preventDefault();
      e.stopPropagation();
      activeCat = "all";
      searchFilter = "";
      backToCategory();
      return;
    }

    // 5. Category Pill clicked -> Switch Category
    const catPill = e.target.closest("[data-ron-cat]");
    if (catPill) {
      e.preventDefault();
      e.stopPropagation();
      const cat = catPill.getAttribute("data-ron-cat");
      if (cat) {
        activeCat = cat;
        activeItem = null;
        searchFilter = "";
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("item");
          if (cat !== "all") url.searchParams.set("cat", cat);
          else url.searchParams.delete("cat");
          window.history.pushState({ cat }, "", url.toString());
        } catch (err) {}
        renderRonBoard();
      }
      return;
    }

    // 6. Modal Open Triggers
    if (e.target.closest("#ronPlusBtn, #ronOpenAllTopicsBtn")) {
      e.preventDefault();
      e.stopPropagation();
      const modal = document.getElementById("ronTopicsModal");
      if (modal) {
        modal.hidden = false;
        const input = document.getElementById("ronSheetSearchInput");
        if (input) input.focus();
      }
      return;
    }

    // 7. Modal Close Trigger
    if (e.target.closest("#ronCloseModalBtn") || (e.target.id === "ronTopicsModal")) {
      const modal = document.getElementById("ronTopicsModal");
      if (modal) modal.hidden = true;
      return;
    }
  });

  // Smooth horizontal wheel scrolling for scrubber dock stream
  document.addEventListener("wheel", (e) => {
    const stream = e.target.closest(".ron-dock-stream");
    if (stream && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      stream.scrollLeft += e.deltaY;
    }
  }, { passive: false });

  // Real-time search inputs
  document.addEventListener("input", (e) => {
    if (e.target.id === "ronInlineSearchInput") {
      searchFilter = e.target.value;
      renderRonBoard();
      const input = document.getElementById("ronInlineSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    } else if (e.target.id === "ronSheetSearchInput") {
      const grid = document.getElementById("ronSheetGrid");
      if (grid) grid.innerHTML = renderAllTopicCards(e.target.value);
    }
  });

  // Browser navigation
  window.addEventListener("popstate", () => {
    renderRonBoard();
  });

  // Theme switch observer (strictly gates on dark class changes; never fires on scroll classes)
  let lastIsDark = document.body.classList.contains("dark");
  const observer = new MutationObserver(() => {
    const isDark = document.body.classList.contains("dark");
    if (isDark !== lastIsDark) {
      lastIsDark = isDark;
      if (activeItem) mountAll3D();
      else mountAllCard3D();
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  // 3D Ready listener & window resize trigger
  window.addEventListener("kn-molecule3d-ready", () => {
    mountAllCard3D();
    mountAll3D();
  });

  window.addEventListener("resize", () => {
    if (activeItem) mountAll3D();
    else mountAllCard3D();
  }, { passive: true });

  // Floating Back to Top Button for deep study reading
  function initBackToTop() {
    let btn = document.getElementById("ronBackToTopBtn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "ronBackToTopBtn";
      btn.type = "button";
      btn.className = "ron-back-to-top";
      btn.setAttribute("aria-label", "Back to top");
      btn.innerHTML = `<span class="ron-btt-icon" aria-hidden="true">↑</span><span class="ron-btt-text">Top</span>`;
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      document.body.appendChild(btn);
    }

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (btn) {
            if (window.scrollY > 480) {
              btn.classList.add("ron-btt-visible");
            } else {
              btn.classList.remove("ron-btt-visible");
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  window.__RON_STUDY_ACTIVE = true;

  // Initial boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(renderRonBoard, 50);
      initBackToTop();
    });
  } else {
    setTimeout(renderRonBoard, 50);
    initBackToTop();
  }
})();
