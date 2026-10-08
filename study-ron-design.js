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
  let activeDomain = "anaesthesia";
  let activeCat = "all";
  let activeItem = null;
  let searchFilter = "";
  let hoverPreviewTimeout = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const HIGHLIGHT_RE = new RegExp(
    "\\b\\d+(?:\\.\\d+)?(?:\\s?[\\u2013-]\\s?\\d+(?:\\.\\d+)?)?\\s*" +
      "(?:mg\\/kg\\/min|mcg\\/kg\\/min|mg\\/kg\\/h(?:r)?|mcg\\/kg\\/h(?:r)?|units?\\/kg\\/h(?:r)?|" +
      "mg\\/kg|mcg\\/kg|mg\\/min|mcg\\/min|mL\\/kg|ml\\/kg|mEq\\/kg|mg|mcg|g\\/kg|g\\b|mL|ml|units?|IU|mEq|" +
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

  function formatInlineContent(str) {
    if (!str) return "";
    let clean = String(str)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(b|strong)>/gi, "**")
      .replace(/<\/?(i|em)>/gi, "*")
      .replace(/<\/?u>/gi, "")
      .replace(/<\/?span[^>]*>/gi, "")
      .replace(/<sub>0<\/sub>/gi, "₀").replace(/<sub>1<\/sub>/gi, "₁").replace(/<sub>2<\/sub>/gi, "₂")
      .replace(/<sub>3<\/sub>/gi, "₃").replace(/<sub>4<\/sub>/gi, "₄").replace(/<sub>5<\/sub>/gi, "₅")
      .replace(/<sub>i<\/sub>/gi, "ᵢ").replace(/<sub>e<\/sub>/gi, "ₑ").replace(/<sub>a<\/sub>/gi, "ₐ")
      .replace(/<\/?sub>/gi, "")
      .replace(/<sup>\+<\/sup>/gi, "⁺").replace(/<sup>-<\/sup>/gi, "⁻").replace(/<sup>2\+<\/sup>/gi, "²⁺")
      .replace(/<sup>2<\/sup>/gi, "²").replace(/<sup>3<\/sup>/gi, "³")
      .replace(/<\/?sup>/gi, "");
    let res = esc(clean);
    res = res.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    res = res.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    res = highlightKeyValues(res);
    return res;
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

  // ==========================================================================
  // STUDY PROGRESS & ACTIVE RECALL TRACKING (LocalStorage: kn_study_progress_v1)
  // Mastered | Flagged for Revision | Remaining (Reset-friendly)
  // ==========================================================================
  const STUDY_PROGRESS_KEY = "kn_study_progress_v1";

  function getStudyProgress() {
    try {
      const raw = localStorage.getItem(STUDY_PROGRESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { mastered: {}, revision: {} };
  }

  function setStudyProgress(progress) {
    try {
      localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent("kn:study-progress-updated", { detail: progress }));
    } catch (e) {}
  }

  function getItemProgressState(itemId) {
    const p = getStudyProgress();
    if (p.mastered && p.mastered[itemId]) return "mastered";
    if (p.revision && p.revision[itemId]) return "revision";
    return "unstudied";
  }

  function toggleItemProgress(itemId, targetState) {
    const p = getStudyProgress();
    if (!p.mastered) p.mastered = {};
    if (!p.revision) p.revision = {};

    const current = getItemProgressState(itemId);
    if (current === targetState) {
      // Toggle off -> back to unstudied
      delete p.mastered[itemId];
      delete p.revision[itemId];
    } else {
      if (targetState === "mastered") {
        p.mastered[itemId] = Date.now();
        delete p.revision[itemId];
      } else if (targetState === "revision") {
        p.revision[itemId] = Date.now();
        delete p.mastered[itemId];
      }
    }
    setStudyProgress(p);
    return getItemProgressState(itemId);
  }

  function resetStudyProgress() {
    if (window.confirm("Reset all study progress (Mastered & Revision status) on this device?")) {
      try {
        localStorage.removeItem(STUDY_PROGRESS_KEY);
      } catch (e) {}
      try {
        window.dispatchEvent(new CustomEvent("kn:study-progress-updated", { detail: { mastered: {}, revision: {} } }));
      } catch (e) {}
      renderRonBoard();
    }
  }

  function getStudyProgressStats() {
    const data = getData();
    const total = (data.topics || []).length + (data.drugs || []).length;
    const p = getStudyProgress();
    const masteredCount = Object.keys(p.mastered || {}).length;
    const revisionCount = Object.keys(p.revision || {}).length;
    const remainingCount = Math.max(0, total - (masteredCount + revisionCount));
    const percent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
    return { total, masteredCount, revisionCount, remainingCount, percent };
  }

  // Related Calculators & Crisis Protocols
  function getRelatedTools(item) {
    const tools = [];
    const text = (item.name + " " + (item.tags || []).join(" ") + " " + (item.cat || "")).toLowerCase();

    if (text.includes("local") || text.includes("lignocaine") || text.includes("bupivacaine") || text.includes("ropivacaine") || text.includes("nerve")) {
      tools.push({ label: "🧮 Local Anaesthetic Max Dose", url: "calculators.html#calcWeights3d" });
      tools.push({ label: "🚨 Crisis: LAST Protocol", url: "crisis.html#last" });
      tools.push({ label: "🎯 Regional Blocks 3D", url: "regional-anaesthesia.html" });
    }
    if (text.includes("hyperthermia") || text.includes("succinylcholine") || text.includes("scoline") || text.includes("volatile")) {
      tools.push({ label: "🚨 Malignant Hyperthermia Protocol", url: "crisis.html#mh" });
    }
    if (text.includes("airway") || text.includes("intubation") || text.includes("cricoid") || text.includes("rsi") || text.includes("laryngo") || text.includes("broncho")) {
      tools.push({ label: "🚨 Crisis: CICO / Difficult Airway", url: "crisis.html#cico" });
      tools.push({ label: "🚨 Bronchospasm Protocol", url: "crisis.html#bronchospasm" });
      tools.push({ label: "🫁 Ventilator Station 3D", url: "ventilator.html" });
    }
    if (text.includes("blood") || text.includes("transfusion") || text.includes("fluid") || text.includes("ebl") || text.includes("shock")) {
      tools.push({ label: "🧮 Estimated Blood Loss & Transfusion", url: "calculators.html#mablCard3d" });
      tools.push({ label: "🧮 Maintenance Fluid & Deficit", url: "calculators.html#calcParkland3d" });
    }
    if (text.includes("abg") || text.includes("acid") || text.includes("bicarbonate") || text.includes("anion") || text.includes("gas")) {
      tools.push({ label: "🧮 ABG Anion Gap & Delta Ratio", url: "calculators.html#tabAbg3d" });
    }
    if (text.includes("cvs") || text.includes("cardiac") || text.includes("hypertens") || text.includes("pressure") || text.includes("pressor") || text.includes("vaso") || text.includes("ecg") || text.includes("rhythm") || text.includes("murmur")) {
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html#vasoCard3d" });
      tools.push({ label: "🧮 Revised Cardiac Risk Index (RCRI)", url: "calculators.html#calcRcri3d" });
      tools.push({ label: "⚡ Code Room: ACLS Algorithms", url: "resuscitation-chamber.html" });
    }
    if (text.includes("peds") || text.includes("paediatric") || text.includes("child") || text.includes("neonate")) {
      tools.push({ label: "🧮 Paediatric Dosing & Vitals", url: "calculators.html#paedsHero" });
      tools.push({ label: "👶 Paediatric Airway & Resuscitation", url: "calculators.html#paedsHero" });
    }
    if (text.includes("obstetric") || text.includes("pregnancy") || text.includes("eclampsia") || text.includes("labour")) {
      tools.push({ label: "🤰 Maternal Collapse & Eclampsia", url: "notes.html?cat=obs" });
    }
    if (text.includes("relaxant") || text.includes("rocuronium") || text.includes("vecuronium") || text.includes("sugammadex") || text.includes("tof")) {
      tools.push({ label: "💊 Neuromuscular Blockade & Reversal", url: "study.html?cat=induction" });
    }
    if (text.includes("anaphylaxis") || text.includes("allergy") || text.includes("histamine")) {
      tools.push({ label: "🚨 Anaphylaxis Emergency Protocol", url: "crisis.html#anaphylaxis" });
    }
    if (text.includes("antibiotic") || text.includes("sepsis") || text.includes("infection") || text.includes("microb") || text.includes("carbapenem") || text.includes("colistin")) {
      tools.push({ label: "🧮 Sepsis Bundle & Fluids", url: "calculators.html#calcParkland3d" });
      tools.push({ label: "🧮 ABG Anion Gap & Delta", url: "calculators.html#tabAbg3d" });
      tools.push({ label: "🚨 Crisis: Anaphylaxis", url: "crisis.html#anaphylaxis" });
    }
    if (text.includes("poison") || text.includes("toxic") || text.includes("overdose") || text.includes("organophosphate") || text.includes("paracetamol") || text.includes("celphos") || text.includes("snake")) {
      tools.push({ label: "🚨 Crisis: LAST / Toxin Rescue", url: "crisis.html#last" });
      tools.push({ label: "⚡ Code Room: ACLS Protocols", url: "resuscitation-chamber.html" });
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html#vasoCard3d" });
    }
    if (text.includes("shock") || text.includes("hemodynamic") || text.includes("inotrope") || text.includes("tamponade")) {
      tools.push({ label: "🧮 MAP & SVR Calculator", url: "calculators.html#vasoCard3d" });
      tools.push({ label: "🧮 Estimated Blood Loss & MTP", url: "calculators.html#mablCard3d" });
      tools.push({ label: "⚡ Crisis: ACLS & Resuscitation", url: "resuscitation-chamber.html" });
    }
    if (text.includes("respiratory") || text.includes("ards") || text.includes("weaning") || text.includes("hyperinflation") || text.includes("peep") || text.includes("extubation")) {
      tools.push({ label: "🫁 Ventilator Station 3D", url: "ventilator.html" });
      tools.push({ label: "🧮 ABG Anion Gap & Delta", url: "calculators.html#tabAbg3d" });
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

  function triggerHapticFeedback() {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(8);
      } catch (err) {}
    }
  }

  // ==========================================================================
  // THREE MASTER DOMAINS & COMPREHENSIVE CURRICULUM DEFINITIONS
  // 1. ANAESTHESIA | 2. CRITICAL CARE | 3. DRUGS
  // ==========================================================================
  const DOMAIN_DEFS = {
    anaesthesia: {
      id: "anaesthesia",
      label: "ANAESTHESIA",
      icon: "💉",
      desc: "Clinical anaesthesia practice, airway management, monitoring, equipment & subspecialty chapters",
      cats: [
        { id: "all", label: "All Anaesthesia", icon: "✦", desc: "Comprehensive clinical anaesthesia syllabus based on Miller's Anesthesia (10th ed.) & standard curricula", filter: (it) => (["anaesthesia", "examination", "ecg", "equipment", "pft"].includes(it.cat) || (it.cat === "pain" && ["acute-pain-multimodal-analgesia-pca", "regional-neuraxial-analgesia-catheters", "neuropathic-pain-crps-post-surgical", "chronic-post-surgical-pain-neuromodulation", "cancer-pain-opioid-rotation-palliative", "interventional-sympathetic-nerve-blocks", "novel-non-opioid-analgesic-pharmacology", "opioid-induced-hyperalgesia-tolerance-tapering"].includes(it.id))) },
        // --- 5 PROMINENT CORE TABS (FIRST) ---
        { id: "general", label: "General Anaesthesia", icon: "💉", desc: "Induction, maintenance, emergence, crisis checklists & peri-operative safety", filter: (it) => [
          "preop-assessment", "asa-pscore", "airway-assessment", "airway-devices-equipment",
          "supraglottic-airways-lma", "rsi", "thrive-hfno-apneic-oxygenation", "jet-ventilation-hfjv-emergency",
          "anaesthesia-machine", "anaesthesia-workstation-check", "asa-monitoring",
          "nerve-stimulator-neuromuscular-monitoring", "fluid-transfusion", "regional-physiology",
          "vaporizers-device", "infusion-pumps-tci", "ponv", "acute-pain-multimodal-analgesia-pca",
          "malignant-hyperthermia", "anaphylaxis-anaesthesia", "eras", "dka-perioperative-glycaemic-protocols"
        ].includes(it.id) },
        { id: "equipment", label: "Anaesthesia Equipment & Machine", icon: "⚙️", desc: "Workstations, breathing circuits, vaporizers, gas supply & monitoring hardware", filter: (it) => it.cat === "equipment" },
        { id: "examination", label: "Preoperative Examination / Evaluation", icon: "📋", desc: "Systematic bedside pre-anaesthetic evaluation — Airway, CVS, RS, CNS & GI", filter: (it) => it.cat === "examination" || ["preop-assessment", "airway-assessment"].includes(it.id) },
        { id: "ecg", label: "ECG", icon: "📈", desc: "Systematic 12-lead ECG analysis, axis, blocks, infarction, arrhythmias & pacemakers", filter: (it) => it.cat === "ecg" },
        { id: "pft", label: "PFT / Pulmonary Function Tests", icon: "📊", desc: "Preoperative spirometry, flow-volume loops, DLCO & post-op predicted lung function", filter: (it) => it.cat === "pft" },
        // --- MILLER'S ANESTHESIA (10TH EDITION) CURRICULUM SECTIONS ---
        { id: "sec_intro", label: "Sec I — Introduction & Perioperative Medicine", icon: "🏛️", desc: "Miller Sec I: Scope of practice, perioperative medicine, patient safety, human factors & ERAS", filter: (it) => ["eras", "asa-pscore", "preop-assessment", "dka-perioperative-glycaemic-protocols", "anaesthesia-workstation-check"].includes(it.id) },
        { id: "sec_phys_pharm", label: "Sec II — Anesthetic Physiology & Pharmacology", icon: "🧪", desc: "Miller Sec II: Consciousness, autonomic physiology, inhalational kinetics, TCI, NMBAs & local anaesthetics", filter: (it) => ["regional-physiology", "vaporizers-device", "infusion-pumps-tci", "novel-non-opioid-analgesic-pharmacology", "opioid-induced-hyperalgesia-tolerance-tapering"].includes(it.id) },
        { id: "sec_management", label: "Sec III — Anaesthesia Management & Monitoring", icon: "🎛️", desc: "Miller Sec III: Airway algorithms, neuraxial/regional blocks, cardiovascular monitoring, fluids & transfusion", filter: (it) => ["airway-assessment", "airway-devices-equipment", "supraglottic-airways-lma", "rsi", "thrive-hfno-apneic-oxygenation", "jet-ventilation-hfjv-emergency", "asa-monitoring", "central-venous-pulmonary-artery-catheters", "nerve-stimulator-neuromuscular-monitoring", "fluid-transfusion", "regional-neuraxial-analgesia-catheters", "interventional-sympathetic-nerve-blocks", "ecg-pacemaker"].includes(it.id) },
        { id: "sec_subspecialties", label: "Sec IV — Adult Subspecialty Anaesthesia", icon: "🏥", desc: "Miller Sec IV: Cardiothoracic, neuroanaesthesia, obstetric, endocrine, renal, ophthalmic/ENT, trauma & geriatric", filter: (it) => ["thoracic-anaesthesia-one-lung-ventilation-dlt", "cardiac-anaesthesia-cpb-valvular-heart-disease", "neuroanaesthesia-cbf-icp-craniotomy", "obstetric-anaesthesia-labour-analgesia-high-risk", "endocrine-anaesthesia-pheochromocytoma-thyroid", "renal-transplant-turp-syndrome-esrd", "ophthalmic-ent-laser-airway-fire-protocols", "trauma-ortho-bcis-geriatric-anaesthesia"].includes(it.id) },
        { id: "sec_pediatrics", label: "Sec V — Pediatric Anaesthesia", icon: "👶", desc: "Miller Sec V: Pediatric applied physiology, surgical emergencies, pyloric stenosis, CDH, TEF, clefts & blocks", filter: (it) => [
          "pediatric-anaesthesia-neonatal-emergencies", "peds-physiology-developmental",
          "peds-pyloric-stenosis", "peds-congenital-diaphragmatic-hernia",
          "peds-tracheoesophageal-fistula", "peds-cleft-lip-palate", "peds-adenotonsillectomy",
          "peds-congenital-abdominal-wall-defects", "peds-inguinal-hernia-hydrocele",
          "peds-exploratory-laparotomy", "peds-regional-nerve-blocks"
        ].includes(it.id) },
        { id: "sec_postop", label: "Sec VI — Postoperative Care & Pain", icon: "🛌", desc: "Miller Sec VI: PACU discharge criteria, PONV, acute multimodal pain, PCA protocols & persistent post-surgical pain", filter: (it) => ["ponv", "acute-pain-multimodal-analgesia-pca", "neuropathic-pain-crps-post-surgical", "chronic-post-surgical-pain-neuromodulation", "cancer-pain-opioid-rotation-palliative"].includes(it.id) },
        { id: "sec_critical_care", label: "Sec VII — Critical Care & Resuscitation", icon: "⚡", desc: "Miller Sec VII: Perioperative critical care, CPB circuits, ECMO physiology, CRRT & malignant ventricular arrhythmias", filter: (it) => ["cardiopulmonary-bypass-cpb", "ecmo-extracorporeal-membrane-oxygenation", "haemodialysis-crrt-dialysis-circuit", "ambu-bag-bvm", "ecg-vt", "ecg-vf"].includes(it.id) },
        { id: "sec_safety_research", label: "Sec VIII — Professional, Safety & Environment", icon: "🛡️", desc: "Miller Sec VIII: Malignant hyperthermia, anaphylaxis, operating room hazards, gas supply & theatre safety", filter: (it) => ["malignant-hyperthermia", "anaphylaxis-anaesthesia", "medical-gas-cylinders", "humidification-scavenging", "soda-lime-absorbents", "warming-suction-devices"].includes(it.id) }
      ]
    },
    critical: {
      id: "critical",
      label: "CRITICAL CARE",
      icon: "🫁",
      desc: "Complete 16-chapter intensive care syllabus (Washington Manual & consensus guidelines)",
      cats: [
        { id: "all", label: "All Critical Care", icon: "✦", desc: "Complete 16-chapter Critical Care master syllabus (Washington Manual & consensus guidelines)", filter: (it) => (it.cat && it.cat.startsWith("cc_")) || ["shock", "respiratory", "abg", "antibiotics", "poisoning"].includes(it.cat) || (it.cat === "pain" && it.id !== "chronic-post-surgical-pain-neuromodulation" && it.id !== "regional-neuraxial-analgesia-catheters") || (it.id && (it.id.includes("sepsis") || it.id.includes("shock") || it.id.includes("ards") || it.id.includes("ventilator"))) },
        { id: "cc_principles", label: "General Principles", icon: "🏛️", desc: "ICU organization, triage, severity scoring systems (APACHE, SOFA, NEWS2), ethics & organ donation", filter: (it) => it.cat === "cc_principles" },
        { id: "cc_airway", label: "Airway Management", icon: "🫁", desc: "Difficult airway in ICU, physiological RSI, video laryngoscopy & percutaneous tracheostomy", filter: (it) => it.cat === "cc_airway" || (it.id && it.id.includes("rsi")) || ((it.name || "").toLowerCase().includes("rsi")) },
        { id: "cc_respiratory", label: "Respiratory Critical Care", icon: "💨", desc: "ARDS, mechanical ventilation modes, APRV, waveforms, asynchrony, severe asthma & PE", filter: (it) => it.cat === "cc_respiratory" || it.cat === "respiratory" },
        { id: "cc_hemodynamics", label: "Hemodynamic Support", icon: "⚡", desc: "Shock classification, invasive monitoring, PiCCO, vasopressors, inotropes & dynamic preload", filter: (it) => it.cat === "cc_hemodynamics" || it.cat === "shock" },
        { id: "cc_sepsis", label: "Sepsis & Infections", icon: "🛡️", desc: "Sepsis-3 1-hour bundle, MDR pathogens, PK/PD beta-lactam infusions & source control", filter: (it) => it.cat === "cc_sepsis" || it.cat === "antibiotics" || (it.id && it.id.includes("sepsis")) },
        { id: "cc_neuro", label: "Neurological Critical Care", icon: "🧠", desc: "Coma, GCS/FOUR score, TBI, raised ICP, status epilepticus, stroke & EVT, GBS, CNS infections & brain death", filter: (it) => it.cat === "cc_neuro" },
        { id: "cc_cardio", label: "Cardiovascular Critical Care", icon: "❤️", desc: "Acute coronary syndromes, cardiogenic shock (SCAI), malignant arrhythmias & cardiac tamponade", filter: (it) => it.cat === "cc_cardio" },
        { id: "cc_renal", label: "Renal & Metabolic Support", icon: "🧪", desc: "AKI (KDIGO), CRRT modalities, acid-base disorders & severe electrolyte emergencies", filter: (it) => it.cat === "cc_renal" || it.cat === "abg" },
        { id: "cc_gi", label: "Gastrointestinal & Hepatic", icon: "🔬", desc: "Acute GI bleeding, severe acute pancreatitis, acute liver failure, ICU nutrition & refeeding", filter: (it) => it.cat === "cc_gi" },
        { id: "cc_trauma", label: "Trauma & Burns", icon: "🩹", desc: "Polytrauma resuscitation, ATLS principles, damage control surgery, pelvic fractures & burn care", filter: (it) => it.cat === "cc_trauma" },
        { id: "cc_tox", label: "Poisoning & Toxicology", icon: "☠️", desc: "Toxidromes, targeted antidotes, EXTRIP extracorporeal elimination, heatstroke & hypothermia", filter: (it) => it.cat === "cc_tox" || it.cat === "poisoning" },
        { id: "cc_heme", label: "Hematology & Transfusion", icon: "🩸", desc: "Massive transfusion protocols (MTP), ROTEM/TEG, DIC, HIT & transfusion reactions", filter: (it) => it.cat === "cc_heme" },
        { id: "cc_obs", label: "Obstetric Critical Care", icon: "🤰", desc: "Severe pre-eclampsia, eclampsia, HELLP syndrome, amniotic fluid embolism & obstetric hemorrhage", filter: (it) => it.cat === "cc_obs" },
        { id: "cc_peds", label: "Pediatric Critical Care", icon: "👶", desc: "Pediatric acute respiratory failure, croup, PALS protocols, pediatric septic shock & vasoactive support", filter: (it) => it.cat === "cc_peds" },
        { id: "cc_pharm", label: "ICU Pharmacology", icon: "💊", desc: "SCCM PADIS guidelines (pain, agitation, delirium), sedation protocols & neuromuscular blockade with TOF", filter: (it) => it.cat === "cc_pharm" },
        { id: "cc_advances", label: "Research & Recent Advances", icon: "🚀", desc: "Extracorporeal membrane oxygenation (VV vs VA ECMO), multiorgan critical care POCUS (BLUE/RUSH/VExUS)", filter: (it) => it.cat === "cc_advances" },
        { id: "pain", label: "Pain Medicine & Analgosedation", icon: "⚡", desc: "ICU analgosedation, PADIS guidelines, CPOT/BPS, trauma/burn pain, opioid tapering & palliative care", filter: (it) => it.cat === "pain" && it.id !== "chronic-post-surgical-pain-neuromodulation" && it.id !== "regional-neuraxial-analgesia-catheters" }
      ]
    },
    drugs: {
      id: "drugs",
      label: "DRUGS",
      icon: "💊",
      desc: "Pharmacological monographs, receptor dynamics, kinetics and dosing guidelines",
      cats: [
        { id: "all", label: "All Drugs", icon: "✦", desc: "Complete library of 84 drug monographs", filter: (it) => !it.sections },
        { id: "induction", label: "Induction Agents", icon: "💉", desc: "Intravenous hypnotics (propofol, etomidate, ketamine, thiopental)", filter: (it) => it.cat === "induction" },
        { id: "relaxants", label: "Neuromuscular Blockers", icon: "⚡", desc: "Depolarising and non-depolarising neuromuscular blockers", filter: (it) => it.cat === "relaxants" },
        { id: "reversal", label: "Reversal Agents", icon: "🔄", desc: "Sugammadex, neostigmine, glycopyrrolate & atropine", filter: (it) => it.cat === "reversal" },
        { id: "opioids", label: "Opioids", icon: "🌿", desc: "Analgesic opioids and pure opioid receptor antagonists", filter: (it) => it.cat === "opioids" },
        { id: "nsaids", label: "Non-opioid Analgesics", icon: "💊", desc: "NSAIDs, paracetamol, parecoxib and adjuvant analgesics", filter: (it) => it.cat === "nsaids" },
        { id: "vasopressors", label: "Vasopressors & Inotropes", icon: "❤️", desc: "Catecholamines, vasopressin, milrinone & inotropes", filter: (it) => it.cat === "vasopressors" },
        { id: "antihypertensives", label: "Cardiovascular Drugs", icon: "🩸", desc: "Antihypertensives, beta-blockers and antiarrhythmics", filter: (it) => it.cat === "antihypertensives" },
        { id: "alpha2", label: "Sedatives (Alpha-2)", icon: "🧠", desc: "Dexmedetomidine, clonidine & neuro-sedatives", filter: (it) => it.cat === "alpha2" },
        { id: "local", label: "Local Anaesthetics", icon: "💉", desc: "Aminoamides and aminoesters for regional anaesthesia", filter: (it) => it.cat === "local" },
        { id: "steroids", label: "ICU Drugs (Steroids)", icon: "🧬", desc: "Hydrocortisone, dexamethasone & methylprednisolone", filter: (it) => it.cat === "steroids" },
        { id: "antidiabetics", label: "ICU Drugs (Antidiabetics)", icon: "🩸", desc: "Insulin protocols and glycemic management", filter: (it) => it.cat === "antidiabetics" },
        { id: "pregnancy", label: "Obstetric & Pediatric Drugs", icon: "🤰", desc: "Drugs in pregnancy, lactation and uterotonics", filter: (it) => it.cat === "pregnancy" },
        { id: "miscellaneous", label: "Emergency Drugs", icon: "🚨", desc: "Dantrolene, intralipid, adrenaline & resuscitation drugs", filter: (it) => it.cat === "miscellaneous" }
      ]
    },
    cases: {
      id: "cases",
      label: "CASE DISCUSSIONS",
      icon: "📑",
      desc: "Clinical case discussions, exam viva scenarios & perioperative management plans (Objective Anaesthesia Review 6th ed.)",
      cats: [
        { id: "all", label: "All Cases", icon: "✦", desc: "Complete library of 39 clinical case scenarios & exam viva discussions", filter: (it) => it.cat && it.cat.startsWith("case_") },
        { id: "case_cardiac", label: "Cardiovascular & Thoracic", icon: "❤️", desc: "Mitral stenosis, IHD, CABG, hypertension, TOF, PDA, pacemaker & vascular disease", filter: (it) => it.cat === "case_cardiac" },
        { id: "case_resp", label: "Respiratory & Thoracic", icon: "🫁", desc: "Pneumonectomy, one-lung ventilation, bronchiectasis, lung abscess, COPD & intercostal drain management", filter: (it) => it.cat === "case_resp" },
        { id: "case_neuro", label: "Neuroanaesthesia & Spine", icon: "🧠", desc: "Supratentorial brain tumours, posterior cranial fossa sitting craniotomy, TBI, hydrocephalus & spinal dysraphism", filter: (it) => it.cat === "case_neuro" },
        { id: "case_obstetric", label: "Obstetric Anaesthesia", icon: "🤰", desc: "Severe preeclampsia, gestational anemia, emergency crash LSCS, non-obstetric surgery, AFE & massive PPH", filter: (it) => it.cat === "case_obstetric" },
        { id: "case_pediatric", label: "Pediatric Surgical Cases", icon: "👶", desc: "Cleft lip & palate repair, tonsillectomy emergencies & pediatric surgical scenarios", filter: (it) => it.cat === "case_pediatric" },
        { id: "case_general_subspecialty", label: "General, Endocrine & Renal", icon: "🏥", desc: "Portal hypertension & cirrhosis, lap/robotic cholecystectomy, retrosternal goiter, diabetes & renal transplant", filter: (it) => it.cat === "case_general_subspecialty" },
        { id: "case_trauma_ortho_special", label: "Trauma, Ortho & Special", icon: "🩹", desc: "Anticipated difficult airway, major burns resuscitation, geriatric frailty, BCIS hip fracture, cataract & kyphoscoliosis", filter: (it) => it.cat === "case_trauma_ortho_special" }
      ]
    }
  };

  function inferDomainFromCat(catId, item) {
    if (catId && catId.startsWith("case_")) return "cases";
    if (item && item.cat && item.cat.startsWith("case_")) return "cases";
    if (item && item.id && (item.id.startsWith("case-") || item.id.startsWith("case_"))) return "cases";
    if (activeDomain === "cases" && (!catId || catId === "all")) return "cases";
    if (item && item.cat === "pain") {
      const icuPainIds = [
        "icu-analgosedation-padis-delirium",
        "opioid-induced-hyperalgesia-tolerance-tapering",
        "novel-non-opioid-analgesic-pharmacology",
        "trauma-burn-procedural-analgesia-icu",
        "cancer-pain-opioid-rotation-palliative",
        "interventional-sympathetic-nerve-blocks"
      ];
      if (icuPainIds.includes(item.id)) return "critical";
      if (activeDomain === "critical") return "critical";
      return "anaesthesia";
    }
    if (item && item.id && (item.id.startsWith("cc-") || item.id.startsWith("cc_") || item.cat === "cc_neuro")) return "critical";
    if (!catId || catId === "all") return activeDomain || "anaesthesia";
    if (catId.startsWith("cc_") || catId === "cc_neuro") return "critical";
    const drugCats = ["induction", "relaxants", "reversal", "opioids", "nsaids", "vasopressors", "antihypertensives", "alpha2", "local", "steroids", "antidiabetics", "pregnancy", "miscellaneous"];
    if (drugCats.includes(catId)) return "drugs";
    const critCats = ["respiratory", "shock", "abg", "antibiotics", "poisoning", "sepsis", "neuro_icu", "airway_icu", "cardio_icu"];
    if (critCats.includes(catId)) return "critical";
    if (catId === "pain") {
      if (activeDomain === "critical") return "critical";
      return "anaesthesia";
    }
    return "anaesthesia";
  }

  // Critical Care category to chapter ID mapping for MCQ engine integration
  const CAT_TO_CHAPTER = {
    "cc_principles": 1,
    "cc_airway": 6,
    "cc_respiratory": 8,
    "respiratory": 8,
    "cc_hemodynamics": 3,
    "shock": 4,
    "cc_sepsis": 5,
    "antibiotics": 18,
    "cc_neuro": 15,
    "cc_cardio": 11,
    "cc_renal": 13,
    "abg": 14,
    "cc_gi": 19,
    "cc_trauma": 24,
    "cc_tox": 23,
    "poisoning": 23,
    "cc_heme": 22,
    "cc_obs": 26,
    "cc_peds": 27,
    "cc_pharm": 17,
    "cc_advances": 30,
    "pain": 16,
    // Anaesthesia Clinical Cross-over Mappings (valid question bank chapters 1-31)
    "equipment": 8,
    "ecg": 11,
    "pft": 14,
    "sec_pediatrics": 27,
    "sec_critical_care": 1,
    "sec_postop": 30,
    // Drug Monographs Category Mappings
    "induction": 17,
    "relaxants": 16,
    "reversal": 16,
    "opioids": 16,
    "nsaids": 16,
    "vasopressors": 4,
    "local": 16,
    "pregnancy": 26,
    "antihypertensives": 11,
    "alpha2": 17,
    "steroids": 20,
    "antidiabetics": 20,
    "miscellaneous": 17
  };

  const STUDY_ITEM_TO_CHAPTER = {
    // Ch 1: Fundamentals of Critical Care & ICU Systems
    "icu-organization-scoring-ethics": 1,
    "brain-death-organ-donation": 1,
    "icu-triage-communication-ethics": 1,
    "icu-quality-infection-bundles": 1,
    "brain-death-organ-donor-resuscitation": 1,

    // Ch 2: Applied Physiology of Critical Illness
    "venturi-oxygen-devices": 2,

    // Ch 3: Advanced Hemodynamic Monitoring & Echocardiography
    "hemodynamics-shock-approach": 3,
    "asa-monitoring": 3,
    "central-venous-pulmonary-artery-catheters": 3,
    "advanced-hemodynamic-monitoring-picco": 3,
    "fluid-responsiveness-dynamic-indices": 3,

    // Ch 4: Shock Syndromes & Vasoactive Therapeutics
    "cardiogenic-shock-scai": 4,
    "anaphylactic-neurogenic-endocrine-shock": 4,
    "obstructive-shock-icu": 4,
    "vasopressors-inotropes-titration-protocols": 4,

    // Ch 5: Sepsis, Septic Shock & Host Response (2026 SSC)
    "septic-shock-resuscitation": 5,
    "sepsis3-hour1-bundle-resuscitation": 5,

    // Ch 6: Acute Respiratory Failure & Mechanics
    "acute-respiratory-failure-types": 6,
    "difficult-airway-icu-extubation": 6,

    // Ch 7: Non-Invasive Respiratory Support (HFNC & NIV)
    "thrive-hfno-apneic-oxygenation": 7,

    // Ch 8: Invasive Mechanical Ventilation & Graphics
    "ventilators-classification": 8,
    "ventilator-modes-waveforms-asynchrony": 8,
    "ventilator-liberation-weaning-failure": 8,
    "aprv-titration-lung-protective": 8,

    // Ch 9: Acute Respiratory Distress Syndrome (ARDS)
    "ards-berlin-lung-protective": 9,
    "ards-refractory-rescue-ecmo": 9,
    "ards-advanced-rescue-therapies": 9,

    // Ch 10: Obstructive Airway Emergencies in ICU (Asthma & COPD)
    "status-asthmaticus-copd-icu": 10,

    // Ch 11: Cardiac Critical Care & Acute Coronary Syndromes
    "acute-coronary-syndromes-cardiogenic-shock": 11,
    "cardiac-arrhythmias-tamponade-pocus": 11,
    "massive-pe-cor-pulmonale": 11,
    "rv-failure-pulmonary-hypertension-icu": 11,
    "acute-aortic-syndromes-hypertensive-crises": 11,
    "acute-decompensated-heart-failure-valvular": 11,

    // Ch 12: Resuscitation, Cardiac Arrest & Post-ROSC Care
    "hypoxic-ischemic-encephalopathy-ttm-postarrest": 12,

    // Ch 13: Acute Kidney Injury & Renal Replacement Therapy
    "aki-kdigo-crrt-modalities": 13,
    "haemodialysis-crrt-dialysis-circuit": 13,
    "citrate-anticoagulation-crrt-protocols": 13,

    // Ch 14: Complex Acid-Base Disorders & Blood Gas Analysis
    "abg-interpretation": 14,
    "severe-electrolyte-disturbances-icu": 14,

    // Ch 15: Neurocritical Care & Raised ICP Management
    "tbi-neuromonitoring-raised-icp": 15,
    "status-epilepticus-rse-srse": 15,
    "acute-ischemic-stroke-evt-icu": 15,
    "subarachnoid-intracerebral-hemorrhage-icu": 15,
    "coma-altered-mental-status-encephalopathy": 15,

    // Ch 16: Sedation, Analgesia, Delirium & Neuromuscular Blockade
    "icu-sedation-analgesia-delirium-padis": 16,
    "icu-analgosedation-padis-delirium": 16,
    "neuromuscular-weakness-gbs-myasthenia-icu": 16,
    "neuromuscular-blockade-train-of-four-icu": 16,
    "propofol-infusion-syndrome-icu-withdrawal": 16,
    "acute-pain-multimodal-analgesia-pca": 16,
    "regional-neuraxial-analgesia-catheters": 16,
    "neuropathic-pain-crps-post-surgical": 16,
    "cancer-pain-opioid-rotation-palliative": 16,
    "trauma-burn-procedural-analgesia-icu": 16,
    "opioid-induced-hyperalgesia-tolerance-tapering": 16,
    "interventional-sympathetic-nerve-blocks": 16,
    "novel-non-opioid-analgesic-pharmacology": 16,

    // Ch 17: Critical Care Applied Pharmacology & Pharmacokinetics
    "pkpd-organ-support-crrt-ecmo-vasodilators": 17,

    // Ch 18: Severe ICU Infections & Antimicrobial Stewardship
    "empiric-sepsis-mdr-bundles": 18,
    "multidrug-resistant-pathogens-icu": 18,
    "severe-pneumonia-cap-hap-vap": 18,
    "cns-infections-meningitis-encephalitis-icu": 18,
    "fungal-infections-clostridioides-oncology-icu": 18,

    // Ch 19: Gastrointestinal, Hepatic & Abdominal Catastrophes
    "acute-gi-bleeding-pancreatitis-icu": 19,
    "acute-liver-failure-nutrition-icu": 19,
    "abdominal-compartment-syndrome-mesenteric-ischemia": 19,
    "hepatorenal-syndrome-icu-nutrition-protocols": 19,

    // Ch 20: Endocrine & Metabolic Crises
    "rhabdomyolysis-endocrine-emergencies-icu": 20,

    // Ch 21: Critical Care Clinical Nutrition & Metabolism
    "nutrition-in-the-icu": 21,

    // Ch 22: ICU Hematology, Hemostasis & Transfusion Medicine
    "hypovolemic-hemorrhagic-shock": 22,
    "massive-transfusion-rotem-teg-coagulopathy": 22,
    "dic-hit-thrombotic-microangiopathies": 22,
    "acute-transfusion-reactions-trali-taco": 22,
    "doac-reversal-ttp-hlh-critical-care": 22,

    // Ch 23: Clinical Toxicology & Toxidromes
    "toxidromes-general-approach": 23,
    "organophosphates-carbamates": 23,
    "toxicology-antidotes-extracorporeal-elimination": 23,
    "toxic-alcohols-cyanide-co-poisoning": 23,
    "cardiotoxic-drug-overdose-serotonin-syndrome": 23,

    // Ch 24: Polytrauma & Damage Control Resuscitation
    "trauma-resuscitation-damage-control": 24,
    "thoracic-trauma-flail-chest-cardiac-contusion": 24,
    "extremity-compartment-syndrome-fat-embolism": 24,

    // Ch 25: Major Burns & Inhalational Injuries
    "burn-resuscitation-inhalation-injury": 25,

    // Ch 26: Obstetric Critical Care & Maternal Emergencies
    "preeclampsia-eclampsia-hellp-syndrome": 26,
    "amniotic-fluid-embolism-obstetric-hemorrhage": 26,
    "cardiac-arrest-pregnancy-resuscitative-hysterotomy": 26,
    "acute-fatty-liver-pregnancy-obstetric-sepsis": 26,

    // Ch 27: Paediatric & Neonatal Emergencies in Adult ICU
    "pediatric-respiratory-failure-pals": 27,
    "pediatric-septic-shock-resuscitation": 27,
    "pediatric-status-asthmaticus-epilepticus": 27,
    "pediatric-dka-cerebral-edema-misc": 27,

    // Ch 28: Critical Care Bedside Procedures & Invasive Devices
    "percutaneous-tracheostomy-icu": 28,
    "efona-surgical-airway-crico": 28,
    "icu-bronchoscopy-tracheostomy-complications": 28,

    // Ch 29: Critical Care Ultrasound & Echocardiography (POCUS)
    "pocus-critical-care-vexus-blue-rush": 29,

    // Ch 30: Extracorporeal Membrane Oxygenation (ECMO) & ECPR
    "ecmo-vv-va-principles-cannulation": 30,
    "ecco2r-cytokine-adsorption-blood-purification": 30,

    // Ch 31: Special ICU Populations, Oncology & Environmental Crises
    "antifungals-icu": 31,
    "environmental-emergencies-heat-hypothermia-drowning": 31,

    // Ch 32–44: Anaesthesia Core Pillars & Miller 10th Edition Curriculum
    "preop-assessment": 34,
    "asa-pscore": 34,
    "airway-assessment": 6,
    "anaesthesia-machine": 33,
    "anaesthesia-workstation-check": 33,
    "rsi": 6,
    "fluid-transfusion": 22,
    "malignant-hyperthermia": 44,
    "ponv": 42,
    "regional-physiology": 38,
    "anaphylaxis-anaesthesia": 4,
    "eras": 37,
    "dka-perioperative-glycaemic-protocols": 20,
    "obstetric-anaesthesia-labour-analgesia-high-risk": 26,
    "neuroanaesthesia-cbf-icp-craniotomy": 15,
    "thoracic-anaesthesia-one-lung-ventilation-dlt": 40,
    "cardiac-anaesthesia-cpb-valvular-heart-disease": 11,
    "pediatric-anaesthesia-neonatal-emergencies": 27,
    "endocrine-anaesthesia-pheochromocytoma-thyroid": 20,
    "renal-transplant-turp-syndrome-esrd": 13,
    "ophthalmic-ent-laser-airway-fire-protocols": 40,
    "trauma-ortho-bcis-geriatric-anaesthesia": 24,

    // Clinical Examination Bedside Topics
    "exam-airway": 6,
    "exam-cvs": 11,
    "exam-respiratory": 8,
    "exam-cns": 15,
    "exam-gi": 19,

    // ECG Topics
    "ecg-basic": 11,
    "ecg-axis": 11,
    "ecg-lvh": 11,
    "ecg-rvh": 11,
    "ecg-bbb": 11,
    "ecg-mi": 11,
    "ecg-blocks": 11,
    "ecg-vt": 11,
    "ecg-vf": 12,
    "ecg-hyperkalemia": 13,
    "ecg-hypokalemia": 13,
    "ecg-pacemaker": 11,

    // Equipment Topics
    "breathing-systems-mapleson": 8,
    "circle-system": 8,
    "vaporizers-device": 33,
    "airway-devices-equipment": 6,
    "supraglottic-airways-lma": 6,
    "humidification-scavenging": 33,
    "warming-suction-devices": 33,
    "medical-gas-cylinders": 33,
    "infusion-pumps-tci": 17,
    "soda-lime-absorbents": 33,
    "cardiopulmonary-bypass-cpb": 30,
    "jet-ventilation-hfjv-emergency": 28,
    "haemodialysis-crrt-dialysis-circuit": 13,
    "nerve-stimulator-neuromuscular-monitoring": 16,
    "ambu-bag-bvm": 12,

    // PFT Topics
    "pft-how-to-read": 8,
    "pft-obstructive": 10,
    "pft-restrictive": 8,
    "pft-flow-volume-loops": 8,
    "pft-postop-fev1-dlco": 8
  };

  // Set of 156 topic IDs that have verified questions in NEET-SS / INI-SS Question Bank
  const TOPICS_WITH_MCQS_SET = new Set([
    "cc-management-of-brain-dead-organ-donors","brain-death-organ-donation",
    "cc-catheter-related-blood-stream-infection","central-venous-pulmonary-artery-catheters",
    "cc-end-of-life-care-in-the-icu","cc-important-clinical-trials-in-critical-care",
    "icu-organization-scoring-ethics","cc-assessing-adequacy-of-oxygen-delivery",
    "venturi-oxygen-devices","cc-haemodynamic-monitoring-i","asa-monitoring",
    "cc-central-venous-line-and-cvp-measurement","cc-assessing-fluid-responsiveness-in-the-icu",
    "fluid-responsiveness-dynamic-indices","cc-pa-catheter","cc-cardiac-output-monitoring",
    "hemodynamics-shock-approach","cc-cardiogenic-shock-i","cardiogenic-shock-scai",
    "cc-cardiogenic-shock-ii","cc-sepsis-and-septic-shock-evaluation-management",
    "septic-shock-resuscitation","cc-sepsis-2026-clinical-guidelines",
    "sepsis3-hour1-bundle-resuscitation","cc-organ-dysfunction-in-sepsis",
    "cc-extracorporeal-therapies-in-sepsis","haemodialysis-crrt-dialysis-circuit",
    "cc-respiratory-management-in-specific-clinical-scenarios-i","acute-respiratory-failure-types",
    "cc-hfnc-mechanics-rox-index","thrive-hfno-apneic-oxygenation",
    "cc-niv-failure-predictors-hacor-score","cc-basics-of-mechanical-ventilation",
    "ventilators-classification","cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation",
    "ventilator-modes-waveforms-asynchrony","cc-patient-ventilator-asynchrony",
    "cc-weaning-from-mechanical-ventilation","ventilator-liberation-weaning-failure",
    "cc-advanced-modes-of-mechanical-ventilation","cc-acute-respiratory-distress-syndrome-i",
    "ards-berlin-lung-protective","cc-acute-respiratory-distress-syndrome-ii",
    "ards-refractory-rescue-ecmo","cc-copd-and-asthma","status-asthmaticus-copd-icu",
    "cc-mi-acs","acute-coronary-syndromes-cardiogenic-shock","cc-pulmonary-embolism",
    "massive-pe-cor-pulmonale","cc-post-cardiac-arrest-management-prognostication",
    "hypoxic-ischemic-encephalopathy-ttm-postarrest","cc-acute-kidney-injury-i",
    "aki-kdigo-crrt-modalities","cc-renal-replacement-therapy-ii",
    "citrate-anticoagulation-crrt-protocols","cc-renal-replacement-therapy-i",
    "cc-interpreting-abg","abg-interpretation","cc-traumatic-brain-injury",
    "tbi-neuromonitoring-raised-icp","cc-icp-monitoring","cc-neuromuscular-disorders-in-icu-ii",
    "neuromuscular-blockade-train-of-four-icu","cc-right-ventricular-failure-in-the-icu",
    "rv-failure-pulmonary-hypertension-icu","cc-aortic-dissection",
    "acute-aortic-syndromes-hypertensive-crises","cc-2025-acc-aha-cpr-guidelines-updates",
    "cc-sodium-disorders-in-the-icu","severe-electrolyte-disturbances-icu",
    "cc-potassium-disorders-in-the-icu","cc-subarachnoid-haemorrhage",
    "subarachnoid-intracerebral-hemorrhage-icu","cc-icu-management-of-traumatic-brain-injury",
    "cc-neuromuscular-disorders-in-icu-i","neuromuscular-weakness-gbs-myasthenia-icu",
    "cc-delirium-in-icu-padis-guidelines","icu-sedation-analgesia-delirium-padis",
    "cc-pericarditis-and-myocarditis","cardiac-arrhythmias-tamponade-pocus",
    "cc-acute-kidney-injury-ii","cc-disorders-of-calcium-magnesium-phosphorus-metabolism",
    "cc-icu-management-of-acs-i","cc-icu-management-of-acs-ii","cc-intracranial-haemorrhage",
    "cc-pharmacokinetics","pkpd-organ-support-crrt-ecmo-vasodilators",
    "cc-managing-mdr-gram-negative-infections-i","multidrug-resistant-pathogens-icu",
    "cc-managing-mdr-gram-negative-infections-ii","cc-community-acquired-pneumonia",
    "severe-pneumonia-cap-hap-vap","cc-cns-infections-in-icu",
    "cns-infections-meningitis-encephalitis-icu","cc-clostridioides-difficile-colitis",
    "fungal-infections-clostridioides-oncology-icu","cc-acute-liver-failure",
    "acute-liver-failure-nutrition-icu","cc-decompensated-cld","cc-acute-pancreatitis",
    "acute-gi-bleeding-pancreatitis-icu",
    "cc-intra-abdominal-hypertension-and-abdominal-compartment-syndrome",
    "abdominal-compartment-syndrome-mesenteric-ischemia","cc-glucose-control-in-icu",
    "rhabdomyolysis-endocrine-emergencies-icu","cc-endocrine-emergencies",
    "cc-nutrition-in-the-icu","nutrition-in-the-icu",
    "cc-hematological-emergencies-in-critical-illness",
    "massive-transfusion-rotem-teg-coagulopathy","cc-thrombocytopenia-in-the-icu",
    "dic-hit-thrombotic-microangiopathies","cc-acetaminophen-toxicity",
    "toxicology-antidotes-extracorporeal-elimination","cc-pesticides",
    "organophosphates-carbamates","cc-recreational-drug-toxicity",
    "cc-haemodynamic-management-pharmacotherapy-in-acute-polytrauma",
    "trauma-resuscitation-damage-control","cc-ventilator-associated-pneumonia",
    "cc-dengue-fever","empiric-sepsis-mdr-bundles","cc-leptospirosis-rickettsial-diseases",
    "cc-general-approach-to-poisoning","toxidromes-general-approach",
    "cc-management-of-snake-bites","cc-interpreting-antibiogram-and-mic",
    "cc-acute-mesenteric-ischemia","cc-management-of-burn-patient-in-icu",
    "burn-resuscitation-inhalation-injury","cc-obstetric-critical-care-pregnancy-specific",
    "preeclampsia-eclampsia-hellp-syndrome","cc-obstetric-critical-care-general-considerations",
    "cc-paediatric-shock-sepsis-formulas","pediatric-septic-shock-resuscitation",
    "cc-paediatric-status-asthmaticus-dka","pediatric-status-asthmaticus-epilepticus",
    "cc-pleural-disorders-in-icu","icu-bronchoscopy-tracheostomy-complications",
    "cc-basic-echocardiography","pocus-critical-care-vexus-blue-rush",
    "cc-ecmo-basics","ecmo-vv-va-principles-cannulation",
    "cc-managing-a-patient-on-ecmo","cc-infections-in-the-immunocompromised-host",
    "antifungals-icu","cc-novel-chemo-and-toxicity-in-icu",
    "cc-scoring-systems-in-the-icu","cc-shock-pathophysiology-and-classification",
    "cc-anaphylactic-shock","anaphylactic-neurogenic-endocrine-shock",
    "cc-respiratory-management-in-specific-clinical-scenarios-ii",
    "cc-malignant-arrhythmias-in-the-icu","cc-status-epilepticus",
    "status-epilepticus-rse-srse"
  ]);

  function hasTopicMCQs(id) {
    if (!id) return false;
    return TOPICS_WITH_MCQS_SET.has(id);
  }

  function hasChapterMCQs(chId) {
    const num = parseInt(chId, 10);
    return !isNaN(num) && num >= 1 && num <= 31;
  }

  function getItemsForDomainAndCat(domainId, catId) {
    const data = getData();
    const all = [...(data.topics || []), ...(data.drugs || [])];
    const dom = DOMAIN_DEFS[domainId] || DOMAIN_DEFS.anaesthesia;
    const catObj = dom.cats.find(c => c.id === catId);
    if (!catObj) {
      const direct = all.filter(it => it.cat === catId);
      if (direct.length) return direct;
      return all.filter(dom.cats[0].filter);
    }
    return all.filter(catObj.filter);
  }

  function getCategoryMeta(domainId, catId) {
    const dom = DOMAIN_DEFS[domainId] || DOMAIN_DEFS.anaesthesia;
    const found = dom.cats.find(c => c.id === catId) || dom.cats[0];
    const items = getItemsForDomainAndCat(domainId, found.id);
    return {
      id: found.id,
      label: found.label,
      icon: found.icon,
      desc: found.desc || dom.desc,
      count: items.length,
      domain: dom
    };
  }

  // ==========================================================================
  // NEW STUDY MODE NAVIGATION ARCHITECTURE:
  // 3 Primary Domains (Vertical) + Secondary Categories (Single-Line Horizontal)
  // ==========================================================================
  function renderNewDomainNavSystem(currentDomain, currentCat) {
    const dom = DOMAIN_DEFS[currentDomain] || DOMAIN_DEFS.anaesthesia;
    const allDomains = Object.values(DOMAIN_DEFS);

    const domainCounts = {
      anaesthesia: getItemsForDomainAndCat("anaesthesia", "all").length,
      critical: getItemsForDomainAndCat("critical", "all").length,
      drugs: getItemsForDomainAndCat("drugs", "all").length,
      cases: getItemsForDomainAndCat("cases", "all").length
    };

    // 1. Primary Vertical Domains Menu
    const domainTabsHTML = allDomains.map((d) => {
      const isActive = d.id === currentDomain;
      const count = domainCounts[d.id] || 0;
      return `
        <button type="button" 
                class="ron-domain-tab ${isActive ? 'active' : ''}" 
                data-ron-domain="${d.id}" 
                role="tab" 
                aria-selected="${isActive}" 
                title="${esc(d.desc)}">
          <span class="ron-domain-tab-icon">${d.icon}</span>
          <span class="ron-domain-tab-text">${esc(d.label)}</span>
          <span class="ron-domain-tab-count">${count}</span>
        </button>
      `;
    }).join("");

    // 2. Secondary Horizontal Categories (Single Line Track)
    const catPillsHTML = dom.cats.map((c) => {
      const count = getItemsForDomainAndCat(dom.id, c.id).length;
      const isActive = c.id === currentCat;
      return `
        <button type="button" 
                class="ron-nav-pill ${isActive ? 'active' : ''}" 
                data-ron-domain="${dom.id}" 
                data-ron-cat="${c.id}" 
                role="tab" 
                aria-selected="${isActive}" 
                title="${esc(c.desc || c.label)}">
          <span>${c.icon}</span> ${esc(c.label)} <span class="ron-pill-count">${count}</span>
        </button>
      `;
    }).join("");

    return `
      <div class="ron-domain-nav-system" id="ronDomainNavSystem">
        <!-- 1. Primary Vertical Domains Menu -->
        <div class="ron-domain-vertical-menu" role="tablist" aria-label="Primary Study Domains">
          ${domainTabsHTML}
        </div>

        <!-- 2. Secondary Horizontal Categories Bar (Smooth single line) -->
        <div class="ron-secondary-horizontal-bar" id="ronSecondaryBar">
          <div class="ron-secondary-header-strip">
            <div class="ron-secondary-domain-pill">
              <span class="ron-secondary-dot"></span>
              <span class="ron-secondary-domain-title">${esc(dom.label)}</span>
              <span class="ron-secondary-sub">— ${esc(dom.desc)}</span>
            </div>
            <div class="ron-scroll-indicator-wrap" aria-hidden="true">
              <span class="ron-scroll-hint">Swipe categories</span>
              <span class="ron-scroll-arrow">→</span>
            </div>
          </div>
          <div class="ron-category-single-row ron-cat-animating" id="ronCategorySingleRow" role="tablist" aria-label="${esc(dom.label)} Categories">
            ${catPillsHTML}
          </div>
        </div>
      </div>
    `;
  }

  function previewCategoriesForDomain(domainId) {
    const dom = DOMAIN_DEFS[domainId];
    if (!dom) return;
    const singleRow = document.getElementById("ronCategorySingleRow");
    if (!singleRow) return;

    document.querySelectorAll(".ron-domain-tab").forEach((tab) => {
      const d = tab.getAttribute("data-ron-domain");
      if (d === domainId) {
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.classList.remove("active");
        tab.setAttribute("aria-selected", "false");
      }
    });

    const titleEl = document.querySelector(".ron-secondary-domain-title");
    if (titleEl) titleEl.textContent = dom.label;
    const subEl = document.querySelector(".ron-secondary-sub");
    if (subEl) subEl.textContent = "— " + dom.desc;

    const catPillsHTML = dom.cats.map((c) => {
      const count = getItemsForDomainAndCat(dom.id, c.id).length;
      const isActive = c.id === activeCat && dom.id === activeDomain;
      return `
        <button type="button" 
                class="ron-nav-pill ${isActive ? 'active' : ''}" 
                data-ron-domain="${dom.id}" 
                data-ron-cat="${c.id}" 
                role="tab" 
                aria-selected="${isActive}" 
                title="${esc(c.desc || c.label)}">
          <span>${c.icon}</span> ${esc(c.label)} <span class="ron-pill-count">${count}</span>
        </button>
      `;
    }).join("");

    singleRow.innerHTML = catPillsHTML;
    singleRow.classList.remove("ron-cat-animating");
    void singleRow.offsetWidth;
    singleRow.classList.add("ron-cat-animating");
  }

  // Navigation actions
  function openTopic(id) {
    if (!id) return;
    const item = findItem(id);
    if (!item) return;
    searchFilter = "";
    activeItem = item;
    activeCat = item.cat;
    activeDomain = inferDomainFromCat(item.cat, item);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set("domain", activeDomain);
      url.searchParams.set("cat", activeCat);
      url.searchParams.set("item", id);
      window.history.pushState({ domain: activeDomain, cat: activeCat, item: id }, "", url.toString());
    } catch (e) {}

    renderRonBoard();

    const mount = document.getElementById("ronStudyApp");
    if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function backToCategory(newCatId) {
    activeItem = null;
    searchFilter = "";
    if (newCatId) {
      for (const dKey of Object.keys(DOMAIN_DEFS)) {
        if (DOMAIN_DEFS[dKey].cats.some(c => c.id === newCatId)) {
          activeDomain = dKey;
          activeCat = newCatId;
          break;
        }
      }
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete("item");
      url.searchParams.delete("topic");
      if (activeDomain) url.searchParams.set("domain", activeDomain);
      if (activeCat && activeCat !== "all") {
        url.searchParams.set("cat", activeCat);
      } else {
        url.searchParams.delete("cat");
      }
      window.history.pushState({ domain: activeDomain, cat: activeCat }, "", url.toString());
    } catch (e) {}

    renderRonBoard();

    const mount = document.getElementById("ronStudyApp");
    if (mount) mount.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderRonBoard() {
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
    const domainParam = urlParams.get("domain");
    const catParam = urlParams.get("cat");
    const itemParam = urlParams.get("item") || urlParams.get("topic");

    if (searchFilter.trim().length > 0) {
      activeItem = null;
    } else if (itemParam) {
      if (!activeItem || activeItem.id !== itemParam) {
        activeItem = findItem(itemParam);
      }
      if (activeItem) {
        activeCat = activeItem.cat;
        activeDomain = inferDomainFromCat(activeItem.cat, activeItem);
      }
    } else {
      activeItem = null;
    }

    if (!activeItem) {
      if (catParam) {
        activeCat = catParam;
        if (domainParam && ["anaesthesia", "critical", "drugs", "cases"].includes(domainParam)) {
          activeDomain = domainParam;
        } else {
          activeDomain = inferDomainFromCat(catParam);
        }
      } else if (domainParam && ["anaesthesia", "critical", "drugs", "cases"].includes(domainParam)) {
        activeDomain = domainParam;
        activeCat = "all";
      }
    }

    const currentCatObj = getCategoryMeta(activeDomain, activeCat);

    if (activeItem) {
      window.__ACTIVE_STUDY_ITEM = activeItem;
      renderSelectedTopicView(mount, activeItem, currentCatObj);
      mountAll3D(mount);
      try {
        window.dispatchEvent(new CustomEvent("kn:study-topic-loaded", { detail: { topicId: activeItem.id, item: activeItem } }));
      } catch (_) {}
    } else {
      window.__ACTIVE_STUDY_ITEM = null;
      renderCategoryOverview(mount, activeCat, currentCatObj);
      mountAllCard3D(mount);
      try {
        window.dispatchEvent(new CustomEvent("kn:study-topic-loaded", { detail: { topicId: null } }));
      } catch (_) {}
    }
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

    let catBadgeText = "";
    let badgeClass = "";
    if (isDrug) {
      catBadgeText = getDrugClassificationBadge(it);
      badgeClass = getDrugClassificationBadgeClass(it);
    } else {
      if (activeDomain === "cases" || (it.cat && it.cat.startsWith("case_"))) {
        catBadgeText = "CLINICAL CASE";
      } else if (activeDomain === "critical" || (it.cat && it.cat.startsWith("cc_"))) {
        catBadgeText = "CRITICAL CARE";
      } else {
        catBadgeText = "ANAESTHESIA";
      }
    }

    const progState = getItemProgressState(it.id);
    const progBadge = progState === "mastered"
      ? `<span class="kn-card-progress-pill kn-pill-mastered" title="Mastered">✓ Mastered</span>`
      : progState === "revision"
      ? `<span class="kn-card-progress-pill kn-pill-revision" title="Flagged for Revision">⚑ Revision</span>`
      : "";

    const mappedChapter = STUDY_ITEM_TO_CHAPTER[it.id] || CAT_TO_CHAPTER[it.cat];
    const canShowMcqBtn = hasTopicMCQs(it.id) || (mappedChapter && hasChapterMCQs(mappedChapter));

    return `
      <div class="ron-card ron-interactive-topic-card ${has3D ? 'ron-card-has-3d' : ''} ${progState !== 'unstudied' ? 'kn-card-' + progState : ''}" data-topic-id="${it.id}" role="button" tabindex="0" title="Click to open ${esc(it.name)}">
        <div class="ron-card-header">
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span class="ron-topic-item-cat ${badgeClass}">${esc(catBadgeText)}</span>
            ${progBadge}
          </div>
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
              ${isDrug && it.classification ? `<div class="ron-card-cls-text">${esc(it.classification)}</div>` : ''}
              ${it.tagline && (!isDrug || it.tagline !== it.classification) ? `<div class="ron-card-tagline-sub">${esc(it.tagline)}</div>` : ''}
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
          <div style="display:flex; align-items:center; gap:8px; margin-left:auto;">
            ${canShowMcqBtn ? `
            <button type="button" class="kn-action-btn kn-topic-mcq-btn" data-topic-mcq-target="${esc(it.id)}" title="Practice High Yield MCQs on ${esc(it.short || it.name)}" style="padding:2px 8px; font-size:11px; display:inline-flex; align-items:center; gap:4px; border-radius:6px; background:rgba(2,132,199,0.08); border:1px solid rgba(2,132,199,0.25); color:var(--accent-cyan,#0284c7); font-weight:700;">
              <span>📝</span><span>MCQs</span>
            </button>
            ` : ''}
            <span class="ron-card-read-link">Read →</span>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // VIEW 1: CATEGORY OVERVIEW
  // ==========================================================================
  function renderCategoryOverview(mount, catId, currentCatObj) {
    const isSearching = !!searchFilter.trim();
    let items;
    if (isSearching) {
      const q = searchFilter.trim().toLowerCase();
      const tokens = q.split(/\s+/).filter(Boolean);
      const data = getData();
      const all = [...(data.topics || []), ...(data.drugs || [])];
      items = all.filter((it) => {
        const text = [
          it.name,
          it.short,
          it.tagline,
          it.cat,
          it.brand,
          it.classification,
          (it.aliases || []).join(" "),
          (it.tags || []).join(" ")
        ].filter(Boolean).join(" ").toLowerCase();
        return tokens.every(tok => text.includes(tok));
      });
      // Sort: exact matches first, then prefix matches
      items.sort((a, b) => {
        const aName = (a.short || a.name || "").toLowerCase();
        const bName = (b.short || b.name || "").toLowerCase();
        const aExact = aName === q;
        const bExact = bName === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const aStarts = aName.startsWith(q);
        const bStarts = bName.startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    } else {
      items = getItemsForDomainAndCat(activeDomain, catId);
    }

    let groupsHTML = "";
    if (!items.length) {
      groupsHTML = `
        <div style="grid-column: 1 / -1; background:var(--ron-bg-card); border-radius:24px; padding:36px; text-align:center; color:var(--ron-text-empty);">
          <div style="font-size:32px; margin-bottom:12px;">🔍</div>
          <p style="font-size:17px; font-weight:700;">No items found matching "${esc(searchFilter)}"</p>
          <p style="font-size:13px; color:var(--ron-text-hint); margin-top:8px;">Try searching for a drug (e.g. <em>Propofol</em>), clinical case (<em>CABG</em>, <em>Posterior Fossa</em>), or topic (<em>PFT</em>, <em>ARDS</em>, <em>Spinal</em>).</p>
          <button type="button" class="ron-clear-search-btn" id="ronClearSearchEmptyBtn" style="margin-top:16px; padding:8px 18px; background:rgba(56, 189, 248, 0.15); border:1px solid rgba(56, 189, 248, 0.4); color:#38bdf8; border-radius:10px; cursor:pointer; font-weight:700;">Clear Search</button>
        </div>
      `;
    } else if (isSearching) {
      // Universal search returns flat connected grid across all domains
      groupsHTML = `<div class="ron-flow-grid">${items.map(renderTopicCard).join("")}</div>`;
    } else if (activeDomain === "drugs") {
      // Group items by classification ONLY for drugs
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
    } else {
      // Clean flat grid for Anaesthesia, Critical Care, and Case Discussions without artificial classification subheaders
      groupsHTML = `<div class="ron-flow-grid">${items.map(renderTopicCard).join("")}</div>`;
    }

    mount.innerHTML = `
      <div class="ron-device-frame">
        <div class="ron-screen">

          <!-- 1. Header Bar: Scoop Tab + Inline Search -->
          <div class="ron-header-bar">
            <div class="ron-header-top-row">
              <div class="ron-header-left">
                <button class="ron-close-btn" id="ronResetBtn" title="Reset to All" aria-label="Reset View">
                  ${ICONS.close}
                </button>
                <div class="ron-title-scoop">
                  <h1>${esc(isSearching ? 'Search Results' : currentCatObj.label)}</h1>
                </div>
              </div>

              <!-- Top Inline Search Input -->
              <div class="ron-inline-search-wrap">
                <input type="search" id="ronInlineSearchInput" class="ron-inline-search-input"
                  placeholder="🔍 Search all 308 topics, cases &amp; drugs (e.g. Propofol, CABG, ARDS, TOF)..."
                  value="${esc(searchFilter)}" autocomplete="off">
                ${searchFilter ? `<button type="button" id="ronInlineSearchClearBtn" class="ron-inline-search-clear-btn" aria-label="Clear search">×</button>` : ""}
              </div>
              <button type="button" class="ron-mcq-pill-btn" id="ronOpenMcqBtn" title="High Yield MCQ Practice — NEET-SS / INI-SS" aria-label="Open High Yield MCQ Practice">📝 High Yield MCQs</button>
              <button type="button" class="ron-mcq-pill-btn ron-mcq-recall-btn" id="ronOpenRecall2025Btn" title="NEET SS 2025 Critical Care Recall — 76 MCQs" aria-label="Open NEET SS 2025 Critical Care Recall">🎯 NEET SS CC 2025</button>
            </div>

            <!-- New 3-Domain Vertical & Single Horizontal Category Track -->
            ${renderNewDomainNavSystem(activeDomain, catId)}
          </div>

          <!-- 2. Summary Banner -->
          ${isSearching ? `
            <div class="ron-summary-banner ron-search-active-banner" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 20px; padding: 18px 22px; margin-bottom: 20px; backdrop-filter: blur(12px);">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
                <div style="display:flex; align-items:center; gap:16px;">
                  <div style="font-size:28px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); border-radius:14px; width:48px; height:48px; display:flex; align-items:center; justify-content:center;">🔍</div>
                  <div>
                    <span style="font-size:11px; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; color:#38bdf8;">UNIVERSAL STUDY SEARCH</span>
                    <h2 style="font-size:17px; font-weight:700; color:var(--ron-text-primary,#f8fafc); margin:2px 0 0 0;">${items.length} ${items.length === 1 ? 'match' : 'matches'} for "${esc(searchFilter)}"</h2>
                    <p style="font-size:12px; color:var(--ron-text-secondary,#94a3b8); margin:3px 0 0 0;">Searching across 308 topics, cases &amp; drug monographs.</p>
                  </div>
                </div>
                <button type="button" class="ron-clear-search-btn" id="ronClearSearchBtn" style="padding:8px 16px; background:rgba(239, 68, 68, 0.15); border:1px solid rgba(239, 68, 68, 0.4); color:#f87171; border-radius:10px; font-size:12.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                  ✕ Clear Search
                </button>
              </div>
            </div>
          ` : `
            <div class="ron-summary-banner">
              <div class="ron-profile-card">
                <div class="ron-avatar-wrap" style="font-size:32px;">
                  ${currentCatObj.icon}
                </div>
                <div class="ron-profile-info">
                  <span class="ron-profile-meta">${esc(currentCatObj.domain.label)} SYLLABUS</span>
                  <span class="ron-profile-name">${esc(currentCatObj.label)}</span>
                  <div class="ron-profile-progress"></div>
                </div>
              </div>

              <div class="ron-stats-area">
                <div class="ron-stats-header">
                  <div class="ron-diagnosis-block">
                    <span class="ron-diagnosis-label">${esc(currentCatObj.domain.label)} OVERVIEW</span>
                    <h2 class="ron-diagnosis-title">${esc(currentCatObj.desc)}</h2>
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
          `}

          <!-- Study Progress & Recall Metrics Bar -->
          ${(() => {
            const stats = getStudyProgressStats();
            return `
              <div class="kn-study-progress-tracker" style="margin: 0 0 16px 0; padding: 12px 16px; background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 14px; backdrop-filter: blur(8px);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:12px; font-size:12.5px; font-weight:700;">
                    <span style="color:#38bdf8;">📊 Study Mastery: ${stats.percent}%</span>
                    <span style="color:#10b981;">✓ Mastered: ${stats.masteredCount}</span>
                    <span style="color:#f59e0b;">⚑ Revision: ${stats.revisionCount}</span>
                    <span style="color:#94a3b8;">○ Remaining: ${stats.remainingCount} / ${stats.total}</span>
                  </div>
                  <button type="button" class="kn-reset-progress-btn" style="background:transparent; border:1px solid rgba(239, 68, 68, 0.4); color:#ef4444; font-size:11px; padding:3px 8px; border-radius:6px; cursor:pointer;" title="Reset progress records">
                    ↺ Reset Progress
                  </button>
                </div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; display:flex;">
                  <div style="width:${stats.percent}%; height:100%; background:linear-gradient(90deg, #10b981, #059669); transition:width 0.3s ease;"></div>
                  <div style="width:${stats.total > 0 ? (stats.revisionCount / stats.total) * 100 : 0}%; height:100%; background:linear-gradient(90deg, #f59e0b, #d97706); transition:width 0.3s ease;"></div>
                </div>
              </div>
            `;
          })()}

          <!-- 3. Connected Cards Grid -->
          <div class="ron-flowchart-stage">
            <div class="ron-classification-stage-content">
              ${groupsHTML}
            </div>
          </div>

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
  function renderSelectedTopicView(mount, item, currentCatObj) {
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
          <span class="ron-vital-val" style="font-size:13.5px;">${esc(currentCatObj.label)}</span>
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
                  <h1>${esc(currentCatObj.label)}</h1>
                </div>
              </div>

              <!-- Top Inline Search Input -->
              <div class="ron-inline-search-wrap">
                <input type="search" id="ronInlineSearchInput" class="ron-inline-search-input"
                  placeholder="🔍 Search all 308 topics, cases &amp; drugs (e.g. Propofol, CABG, ARDS, TOF)..."
                  value="${esc(searchFilter)}" autocomplete="off">
                ${searchFilter ? `<button type="button" id="ronInlineSearchClearBtn" class="ron-inline-search-clear-btn" aria-label="Clear search">×</button>` : ""}
              </div>
              <button type="button" class="ron-mcq-pill-btn" id="ronOpenMcqBtn" title="High Yield MCQ Practice — NEET-SS / INI-SS" aria-label="Open High Yield MCQ Practice">📝 High Yield MCQs</button>
              <button type="button" class="ron-mcq-pill-btn ron-mcq-recall-btn" id="ronOpenRecall2025Btn" title="NEET SS 2025 Critical Care Recall — 76 MCQs" aria-label="Open NEET SS 2025 Critical Care Recall">🎯 NEET SS CC 2025</button>
            </div>

            <!-- New 3-Domain Vertical & Single Horizontal Category Track -->
            ${renderNewDomainNavSystem(activeDomain, activeCat)}
          </div>

          <!-- 2. Topic Hero Layout: Left Side (Profile + Vertical Tools) & Right Side (Header + Fast Scroll Buttons) -->
          <div class="ron-topic-hero-layout">

            <!-- Left Side: Profile Card + Vertical Calculators & Protocols Bubbles -->
            <div class="ron-topic-left-col">
              <div class="ron-profile-card">
                <div class="ron-avatar-wrap" style="font-size:32px;">
                  ${currentCatObj.icon}
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
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:16px; flex-wrap:wrap; margin-bottom:4px;">
                    <div style="flex:1; min-width:240px;">
                      <span class="ron-diagnosis-label">STUDY TOPIC MONOGRAPH</span>
                      <h2 class="ron-diagnosis-title" style="margin:2px 0 0;">${esc(item.name)}</h2>
                    </div>
                    <button type="button" class="kn-download-pdf-btn" data-chapter-id="${esc(item.id)}" title="Download Official Branded PDF Monograph" onclick="if(window.KN_PAYMENTS)window.KN_PAYMENTS.initiateChapterDownload('${esc(item.id)}', '${esc(item.name).replace(/'/g, "\\'")}');">
                      <svg class="kn-download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      <span>Download PDF</span>
                    </button>
                  </div>
                  ${isDrug && item.classification ? `
                    <div class="ron-topic-classification-hero">
                      <span class="ron-cls-hero-pill">STANDARD CLASSIFICATION</span>
                      <span class="ron-cls-hero-text">${esc(item.classification)}</span>
                    </div>
                  ` : ''}
                  ${item.tagline && (!isDrug || item.tagline !== item.classification) ? `<p style="margin:6px 0 0; font-size:14px; color:var(--ron-text-tagline); line-height:1.5;">${esc(item.tagline)}</p>` : ''}
                  <div class="kn-monograph-action-bar">
                    ${(() => {
                      const prog = getItemProgressState(item.id);
                      return `
                        <button type="button" class="kn-action-btn kn-study-progress-btn kn-progress-master-btn ${prog === 'mastered' ? 'active-mastered' : ''}" data-kn-progress-target="${esc(item.id)}" data-kn-progress-action="mastered" title="Mark as Mastered" aria-pressed="${prog === 'mastered' ? 'true' : 'false'}" aria-label="Mark ${esc(item.name)} as Mastered">
                          <span>${prog === 'mastered' ? '✓' : '○'}</span> <span>Mastered</span>
                        </button>
                        <button type="button" class="kn-action-btn kn-study-progress-btn kn-progress-revision-btn ${prog === 'revision' ? 'active-revision' : ''}" data-kn-progress-target="${esc(item.id)}" data-kn-progress-action="revision" title="Flag for Revision" aria-pressed="${prog === 'revision' ? 'true' : 'false'}" aria-label="Flag ${esc(item.name)} for Revision">
                          <span>${prog === 'revision' ? '⚑' : '⚐'}</span> <span>Revision</span>
                        </button>
                      `;
                    })()}
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
                    <button type="button" class="kn-action-btn kn-pen-toggle-btn" title="Toggle Stylus / Pen Annotations" onclick="if(window.KN_ANNOTATIONS)window.KN_ANNOTATIONS.showToolbar();">
                      <span>✏️</span> <span>Draw</span>
                    </button>
                    ${(() => {
                      const mappedChapter = STUDY_ITEM_TO_CHAPTER[item.id] || CAT_TO_CHAPTER[activeCat] || CAT_TO_CHAPTER[activeDomain];
                      const showTopicMcq = hasTopicMCQs(item.id);
                      const showChapterMcq = mappedChapter && hasChapterMCQs(mappedChapter);
                      let buttons = "";
                      if (showTopicMcq) {
                        buttons += `
                        <button type="button" class="kn-action-btn kn-topic-mcq-btn" data-topic-mcq-target="${esc(item.id)}" data-mcq-mode="topic" title="Practice High Yield MCQs for ${esc(item.short || item.name)}">
                          <span>📝</span> <span>Topic MCQs</span>
                        </button>
                        `;
                      }
                      if (showChapterMcq) {
                        buttons += `
                        <button type="button" class="kn-action-btn kn-topic-mcq-btn" data-topic-mcq-target="${esc(item.id)}" data-mcq-mode="chapter" data-chapter-id="${mappedChapter}" title="Practice All Chapter ${mappedChapter} MCQs">
                          <span>📚</span> <span>Ch ${mappedChapter} MCQs</span>
                        </button>
                        `;
                      }
                      return buttons;
                    })()}
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

              ${(() => {
                const mappedChapter = STUDY_ITEM_TO_CHAPTER[item.id] || CAT_TO_CHAPTER[activeCat] || CAT_TO_CHAPTER[activeDomain];
                const showTopicMcq = hasTopicMCQs(item.id);
                const showChapterMcq = mappedChapter && hasChapterMCQs(mappedChapter);
                if (!showTopicMcq && !showChapterMcq) return "";
                const launchMode = showTopicMcq ? "topic" : "chapter";
                return `
                <div class="ron-topic-mcq-banner">
                  <div class="ron-topic-mcq-banner-left">
                    <span class="ron-topic-mcq-icon">📝</span>
                    <div>
                      <h4 class="ron-topic-mcq-title">Practice High Yield MCQs</h4>
                      <p class="ron-topic-mcq-desc">Master this topic with authentic NEET-SS / INI-SS clinical recall and practice questions with detailed rationale.</p>
                    </div>
                  </div>
                  <button type="button" class="ron-topic-mcq-launch-btn" data-topic-mcq-target="${esc(item.id)}" data-mcq-mode="${launchMode}" ${launchMode === 'chapter' ? `data-chapter-id="${mappedChapter}"` : ''}>
                    <span>Solve MCQs</span> <span>→</span>
                  </button>
                </div>
                `;
              })()}
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
    const initialBoxes = (root || document).querySelectorAll("[data-tile-drug]");
    if (!initialBoxes.length) return;

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
        if (allDone || attempts > 20) clearInterval(timer);
      } else if (attempts > 20) {
        clearInterval(timer);
      }
    }, 100);
  }

  // ==========================================================================
  // 3D MOLECULE MOUNTING CONTROLLER (Interactive WebGL Rotating Conformer)
  // ==========================================================================
  function mountAll3D(root) {
    const initialNodes = (root || document).querySelectorAll(".st-molecule-viewer[data-drug]");
    if (!initialNodes.length) return;

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
    }

    window.addEventListener("kn-molecule3d-ready", attemptAll, { once: true });
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (typeof window.KNMountMolecule3D === "function" || typeof window.KNMountTileMolecule === "function") {
        const done = attemptAll();
        if (done || count > 20) clearInterval(interval);
      } else if (count > 20) {
        clearInterval(interval);
      }
    }, 100);
  }

  // ==========================================================================
  // COMPLETE DESCRIPTION RENDERER (ALL SUBSECTIONS IN FULL POINT-WISE APPROACH)
  // ==========================================================================
  function renderCompleteDescription(item, isDrug) {
    const renderFigureItem = (img) => {
      if (!img || !img.src) return "";
      const isWide = !!(img.wide || img.fullWidth);
      const wrapCls = isWide ? "ron-figure-wrap-full" : "ron-figure-wrap-float";
      return `
        <figure class="${wrapCls}" data-zoom-src="${esc(img.src)}" data-zoom-caption="${esc(img.caption || '')}" data-zoom-alt="${esc(img.alt || 'Clinical Reference Diagram')}" role="button" tabindex="0" title="Click to inspect and zoom">
          <div class="ron-figure-zoom-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <span>Zoom</span>
          </div>
          <img src="${esc(img.src)}" alt="${esc(img.alt || 'Clinical Diagram')}" class="ron-figure-img" loading="lazy">
          ${img.caption ? `<figcaption class="ron-figure-caption"><span class="ron-caption-mag">🔍</span> ${esc(img.caption)}</figcaption>` : ''}
        </figure>
      `;
    };

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

        let monographFigureHTML = "";
        if (s.id === "sec-overview" && (item.image || item.images)) {
          if (Array.isArray(item.images)) {
            monographFigureHTML = item.images.map(renderFigureItem).join("");
          } else if (item.image) {
            monographFigureHTML = renderFigureItem(item.image);
          }
        }

        return `
          <div class="ron-card ron-notes-card" id="${s.id}">
            <div class="ron-card-header">
              <h3 class="ron-card-title" style="text-transform:uppercase; font-size:15px; letter-spacing:0.04em; color:var(--ron-accent); margin:0;">
                ${esc(s.title)}
              </h3>
              <span class="ron-card-scale-icon">${ICONS.scale}</span>
            </div>
            <div class="ron-prose ron-figure-tight-prose" style="margin-top:14px;">
              ${classificationCallout}
              ${monographFigureHTML}
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
          bodyHTML = sec.b.map((b) => `<div class="ron-point-row"><span class="ron-point-bullet">•</span><div class="ron-point-text">${formatInlineContent(b)}</div></div>`).join("");
        } else if (sec.b) {
          bodyHTML = `<div class="ron-point-row"><span class="ron-point-bullet">•</span><div class="ron-point-text">${formatInlineContent(String(sec.b))}</div></div>`;
        }

        // Callout blocks (pearl, pitfall, example)
        let calloutsHTML = "";
        if (sec.callout) {
          const cType = sec.callout.type || "pearl";
          const cTitle = sec.callout.title || (cType === "pitfall" ? "⚠️ Lethal Pitfall & Safety Warning" : "💡 Clinical Key Point");
          calloutsHTML += `
            <div class="ron-callout ron-callout-${cType}">
              <span class="ron-callout-badge">${esc(cTitle)}</span>
              <div>${formatProseLines(sec.callout.text)}</div>
            </div>`;
        }
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

        // Section Images / Figures (Floated or full-width, with zoom dock triggers)
        let imagesHTML = "";
        const renderFigureItem = (img) => {
          if (!img || !img.src) return "";
          const isWide = !!(img.wide || img.fullWidth);
          const wrapCls = isWide ? "ron-figure-wrap-full" : "ron-figure-wrap-float";
          return `
            <figure class="${wrapCls}" data-zoom-src="${esc(img.src)}" data-zoom-caption="${esc(img.caption || '')}" data-zoom-alt="${esc(img.alt || 'Clinical Reference Diagram')}" role="button" tabindex="0" title="Click to inspect and zoom">
              <div class="ron-figure-zoom-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                <span>Zoom</span>
              </div>
              <img src="${esc(img.src)}" alt="${esc(img.alt || 'Clinical Diagram')}" class="ron-figure-img" loading="lazy">
              ${img.caption ? `<figcaption class="ron-figure-caption"><span class="ron-caption-mag">🔍</span> ${esc(img.caption)}</figcaption>` : ''}
            </figure>
          `;
        };
        if (Array.isArray(sec.images)) {
          imagesHTML = sec.images.map(renderFigureItem).join("");
        } else if (sec.image) {
          imagesHTML = renderFigureItem(sec.image);
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

      let exampleCardHTML = "";
      if (item.example) {
        exampleCardHTML = `
          <div class="ron-card ron-notes-card" id="sec-case-example">
            <div class="ron-card-header">
              <h3 class="ron-card-title" style="font-size:17px; font-weight:750; color:var(--ron-text-primary); margin:0;">
                Worked Clinical Case Vignette
              </h3>
              <span class="ron-card-scale-icon">${ICONS.scale}</span>
            </div>
            <div class="ron-prose ron-figure-tight-prose" style="margin-top:14px;">
              <div class="ron-callout ron-callout-example">
                <span class="ron-callout-badge">🧩 Bedside Clinical Scenario</span>
                <div>${formatProseLines(item.example)}</div>
              </div>
            </div>
          </div>
        `;
      }

      let refsCardHTML = "";
      if (item.references && item.references.length) {
        const refs = Array.isArray(item.references) ? item.references : [item.references];
        refsCardHTML = `
          <div class="ron-card ron-notes-card" id="sec-references">
            <div class="ron-card-header">
              <h3 class="ron-card-title" style="font-size:17px; font-weight:750; color:var(--ron-text-primary); margin:0;">
                Standard References &amp; Clinical Guidelines
              </h3>
              <span class="ron-card-scale-icon">${ICONS.scale}</span>
            </div>
            <ul style="margin:14px 0 0; padding-left:22px; font-size:14px; color:var(--ron-text-body); line-height:1.8;">
              ${refs.map((r) => `<li style="margin-bottom:8px;">📚 ${highlightKeyValues(esc(r))}</li>`).join("")}
            </ul>
          </div>
        `;
      }

      return sourceCalloutHTML + cardsHTML + exampleCardHTML + refsCardHTML;
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

      // 1. Numbered Heading / Step with Title and Body (e.g. "1. Title: Description" or "1. Heading")
      const numMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
      if (numMatch) {
        const num = numMatch[1];
        const rest = numMatch[2];
        const colonMatch = rest.match(/^(\*{0,2})([A-Za-z0-9\s\/\(\)-]{2,50})\1(?::|—|–)\s+(.+)$/);
        if (colonMatch) {
          result += `<div class="ron-numbered-point">
            <div class="ron-point-num-badge">${num}</div>
            <div class="ron-point-num-content">
              <h4 class="ron-point-title">${formatInlineContent(colonMatch[2])}</h4>
              <div class="ron-point-desc" style="font-size:14px; color:var(--ron-text-body); line-height:1.7; margin-top:4px;">${formatInlineContent(colonMatch[3])}</div>
            </div>
          </div>`;
        } else {
          result += `<div class="ron-numbered-point">
            <div class="ron-point-num-badge">${num}</div>
            <div class="ron-point-num-content">
              <h4 class="ron-point-title">${formatInlineContent(rest)}</h4>
            </div>
          </div>`;
        }
      }
      // 2. Existing Bullet (e.g. "• ...", "- ...", "* ...")
      else if (trimmed.startsWith("• ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.replace(/^[\u2022\-\*]\s*/, "");
        const subMatch = text.match(/^(\*{0,2})([A-Za-z0-9\s\/\(\)-]{2,45})\1(?::|—|–)\s+(.+)$/);
        if (subMatch) {
          result += `<div class="ron-point-row ron-point-keyval">
            <span class="ron-point-bullet">•</span>
            <div class="ron-point-text">
              <strong class="ron-point-label">${formatInlineContent(subMatch[2])}:</strong> ${formatInlineContent(subMatch[3])}
            </div>
          </div>`;
        } else {
          result += `<div class="ron-point-row">
            <span class="ron-point-bullet">•</span>
            <div class="ron-point-text">${formatInlineContent(text)}</div>
          </div>`;
        }
      }
      // 3. Sub-point with key label (e.g. "Auscultation Finding: ...", "Anaesthetic Goals: ...", "Severity Criteria: ...")
      else if (/^(\*{0,2})([A-Z0-9][A-Za-z0-9\s\/\(\)-]{1,45})\1(?::|—|–)\s+(.+)$/.test(trimmed)) {
        const match = trimmed.match(/^(\*{0,2})([A-Z0-9][A-Za-z0-9\s\/\(\)-]{1,45})\1(?::|—|–)\s+(.+)$/);
        result += `<div class="ron-point-row ron-point-keyval">
          <span class="ron-point-bullet">•</span>
          <div class="ron-point-text">
            <strong class="ron-point-label">${formatInlineContent(match[2])}:</strong> ${formatInlineContent(match[3])}
          </div>
        </div>`;
      }
      // 4. Standard Paragraph -> Split into clean sentence-level points without breaking decimals or abbreviations
      else {
        // Protect decimals (e.g. 0.5 mg) and common abbreviations from being broken into fragmented points
        const protectedText = trimmed
          .replace(/(\d)\.(\d)/g, "$1\u2024$2")
          .replace(/\b(e\.g|i\.e|vs|approx|etc|vol|no|dr|fig|tab|al|ed)\./gi, "$1\u2024");
        
        // Split on sentence-ending punctuation followed by whitespace and a capital letter or quote
        const sentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"'\u201C\u2018])/);
        const validSentences = sentences
          .map(s => s.replace(/\u2024/g, ".").trim())
          .filter(s => s.length > 0);

        if (validSentences.length > 1) {
          validSentences.forEach(st => {
            result += `<div class="ron-point-row">
              <span class="ron-point-bullet">•</span>
              <div class="ron-point-text">${formatInlineContent(st)}</div>
            </div>`;
          });
        } else {
          result += `<div class="ron-point-row">
            <span class="ron-point-bullet">•</span>
            <div class="ron-point-text">${formatInlineContent(trimmed)}</div>
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
                <p style="margin:2px 0 0; font-size:12.5px; color:var(--ron-text-empty);">Browse 308 source-cited anaesthesia &amp; critical care topics, clinical case discussions, exams, ECGs, antibiotics, toxicology &amp; drug monographs</p>
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
    // 00a. Clinical Figure / Flowchart Zoom Trigger (Top priority: clicking any image opens dock!)
    const figTrigger = e.target.closest(
      "[data-zoom-src], .ron-figure-wrap-float, .ron-figure-wrap-full, .ron-figure-img, figure, .st-diagram-wrap, .st-section-img, .ron-prose img, #ronMainContentBox img"
    );
    if (figTrigger && !e.target.closest(".ron-zoom-dock-container, [data-close-zoom-dock]")) {
      const wrap = figTrigger.closest("[data-zoom-src]") || figTrigger;
      const imgEl = wrap.querySelector("img") || (wrap.tagName === "IMG" ? wrap : null);
      const src = wrap.getAttribute("data-zoom-src") || (imgEl && (imgEl.getAttribute("src") || imgEl.src)) || "";
      const caption = wrap.getAttribute("data-zoom-caption") || (wrap.querySelector(".ron-figure-caption, figcaption") && wrap.querySelector(".ron-figure-caption, figcaption").textContent) || "";
      const alt = wrap.getAttribute("data-zoom-alt") || (imgEl && (imgEl.getAttribute("alt") || imgEl.alt)) || "Clinical Reference Diagram";

      if (src && !src.startsWith("data:image/svg+xml;base64")) {
        e.preventDefault();
        e.stopPropagation();
        openImageZoomDock({ src, caption, alt });
        return;
      }
    }

    // 00b. Zoom Dock Close Trigger
    if (e.target.closest("[data-close-zoom-dock]") || e.target.id === "ronImageZoomDock") {
      e.preventDefault();
      e.stopPropagation();
      closeImageZoomDock();
      return;
    }

    // 00c. Clear Search Action
    if (e.target.closest("#ronClearSearchBtn, #ronClearSearchEmptyBtn, #ronInlineSearchClearBtn, .ron-clear-search-btn")) {
      e.preventDefault();
      e.stopPropagation();
      searchFilter = "";
      renderRonBoard();
      const input = document.getElementById("ronInlineSearchInput");
      if (input) input.focus();
      return;
    }

    // 0a. Progress Toggle Action (Mastered / Revision)
    const progBtn = e.target.closest(".kn-study-progress-btn");
    if (progBtn) {
      e.preventDefault();
      e.stopPropagation();
      const targetId = progBtn.getAttribute("data-kn-progress-target");
      const action = progBtn.getAttribute("data-kn-progress-action");
      if (targetId && action) {
        triggerHapticFeedback();
        toggleItemProgress(targetId, action);
        if (activeItem && activeItem.id === targetId) {
          renderRonBoard();
        }
      }
      return;
    }

    // 0b. Reset Progress Action
    if (e.target.closest(".kn-reset-progress-btn")) {
      e.preventDefault();
      e.stopPropagation();
      resetStudyProgress();
      return;
    }

    // 0c. High Yield MCQs Buttons (Header pill OR Topic button / banner)
    const topicMcqBtn = e.target.closest("[data-topic-mcq-target]");
    if (topicMcqBtn) {
      e.preventDefault();
      e.stopPropagation();
      triggerHapticFeedback();
      const topicId = topicMcqBtn.getAttribute("data-topic-mcq-target");
      const mode = topicMcqBtn.getAttribute("data-mcq-mode") || "topic";
      const explicitChapter = topicMcqBtn.getAttribute("data-chapter-id");
      const mappedChapter = explicitChapter || STUDY_ITEM_TO_CHAPTER[topicId] || CAT_TO_CHAPTER[activeCat] || CAT_TO_CHAPTER[activeDomain];
      const validCh = mappedChapter && hasChapterMCQs(mappedChapter) ? String(mappedChapter) : "";
      if (window.KN_MCQ && typeof window.KN_MCQ.open === "function") {
        if (mode === "all") {
          window.KN_MCQ.open({ viewMode: "practice", chapterId: "", topicId: "" });
        } else if (mode === "chapter") {
          window.KN_MCQ.open({
            viewMode: "practice",
            chapterId: validCh,
            topicId: ""
          });
        } else {
          // Topic mode: must open filtered to this exact topic!
          window.KN_MCQ.open({
            viewMode: "practice",
            topicId: topicId,
            chapterId: validCh
          });
        }
      }
      return;
    }

    if (e.target.closest("#ronOpenRecall2025Btn, .ron-mcq-recall-btn")) {
      e.preventDefault();
      e.stopPropagation();
      triggerHapticFeedback();
      if (window.KN_MCQ && typeof window.KN_MCQ.open === "function") {
        window.KN_MCQ.open({
          viewMode: "practice",
          view: "recall2025"
        });
      }
      return;
    }

    if (e.target.closest(".ron-mcq-pill-btn")) {
      e.preventDefault();
      e.stopPropagation();
      triggerHapticFeedback();
      const mappedChapter = CAT_TO_CHAPTER[activeCat] || CAT_TO_CHAPTER[activeDomain];
      const validCh = mappedChapter && hasChapterMCQs(mappedChapter) ? String(mappedChapter) : "";
      if (window.KN_MCQ && typeof window.KN_MCQ.open === "function") {
        window.KN_MCQ.open({
          viewMode: validCh ? "practice" : "directory",
          chapterId: validCh,
          topicId: ""
        });
      }
      return;
    }

    // 1. Topic Card clicked -> Open Topic Description
    const topicCard = e.target.closest("[data-topic-id]");
    if (topicCard) {
      if (e.target.closest("[data-kn-bookmark-id], [data-kn-sticky-id], .kn-btn-icon-action, .kn-action-chip-btn, .kn-card-progress-pill, [data-topic-mcq-target]")) {
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

    // 4. Reset Button clicked -> Reset to All Categories in current domain
    if (e.target.closest("#ronResetBtn")) {
      e.preventDefault();
      e.stopPropagation();
      triggerHapticFeedback();
      activeCat = "all";
      searchFilter = "";
      backToCategory();
      return;
    }

    // 5. Primary Domain Tab clicked -> Switch Domain
    const domainTab = e.target.closest("[data-ron-domain]:not([data-ron-cat])");
    if (domainTab) {
      e.preventDefault();
      e.stopPropagation();
      const targetDomain = domainTab.getAttribute("data-ron-domain");
      if (targetDomain && targetDomain !== activeDomain) {
        triggerHapticFeedback();
        activeDomain = targetDomain;
        activeCat = "all";
        activeItem = null;
        searchFilter = "";
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("item");
          url.searchParams.delete("topic");
          url.searchParams.set("domain", activeDomain);
          url.searchParams.delete("cat");
          window.history.pushState({ domain: activeDomain, cat: "all" }, "", url.toString());
        } catch (err) {}
        renderRonBoard();
      }
      return;
    }

    // 6. Secondary Category Pill clicked -> Switch Category
    const catPill = e.target.closest("[data-ron-cat]");
    if (catPill) {
      e.preventDefault();
      e.stopPropagation();
      const cat = catPill.getAttribute("data-ron-cat");
      const domain = catPill.getAttribute("data-ron-domain") || activeDomain;
      if (cat) {
        triggerHapticFeedback();
        activeDomain = domain;
        activeCat = cat;
        activeItem = null;
        searchFilter = "";
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("item");
          url.searchParams.delete("topic");
          url.searchParams.set("domain", activeDomain);
          if (cat !== "all") url.searchParams.set("cat", cat);
          else url.searchParams.delete("cat");
          window.history.pushState({ domain: activeDomain, cat }, "", url.toString());
        } catch (err) {}
        renderRonBoard();
        const activeNode = document.querySelector(`[data-ron-cat="${cat}"][data-ron-domain="${domain}"]`);
        if (activeNode) {
          activeNode.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
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

  // Smooth horizontal wheel scrolling for horizontal category row
  document.addEventListener("wheel", (e) => {
    const singleRow = e.target.closest && e.target.closest(".ron-category-single-row");
    if (singleRow && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      singleRow.scrollLeft += e.deltaY;
    }
  }, { passive: true });

  // Real-time search inputs
  document.addEventListener("input", (e) => {
    if (e.target.id === "ronInlineSearchInput") {
      searchFilter = e.target.value;
      if (searchFilter.trim().length > 0 && activeItem) {
        activeItem = null;
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("item");
          url.searchParams.delete("topic");
          window.history.replaceState({ domain: activeDomain, cat: activeCat }, "", url.toString());
        } catch (_) {}
      }
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
  window.addEventListener("hashchange", () => {
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
    let isBttVisible = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (btn) {
            const shouldShow = window.scrollY > 480;
            if (shouldShow !== isBttVisible) {
              isBttVisible = shouldShow;
              btn.classList.toggle("ron-btt-visible", shouldShow);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ==========================================================================
  // CLINICAL IMAGE ZOOM DOCK / LIGHTBOX CONTROLLER
  // ==========================================================================
  let currentZoomScale = 1.0;
  let isPanning = false;
  let startPanX = 0;
  let startPanY = 0;
  let panTranslateX = 0;
  let panTranslateY = 0;
  let initialPinchDistance = 0;
  let initialPinchScale = 1.0;

  function updateZoomTransform() {
    const img = document.getElementById("ronZoomImage");
    const levelText = document.getElementById("ronZoomLevelText");
    if (!img) return;
    img.style.transform = `translate(${panTranslateX}px, ${panTranslateY}px) scale(${currentZoomScale})`;
    if (levelText) levelText.textContent = `${Math.round(currentZoomScale * 100)}%`;
  }

  function setZoom(scale) {
    const newScale = Math.min(Math.max(scale, 0.4), 4.5);
    currentZoomScale = newScale;
    if (currentZoomScale <= 1.0) {
      panTranslateX = 0;
      panTranslateY = 0;
    }
    updateZoomTransform();
  }

  function ensureZoomDockDOM() {
    let dock = document.getElementById("ronImageZoomDock");
    if (!dock) {
      dock = document.createElement("div");
      dock.id = "ronImageZoomDock";
      dock.className = "ron-zoom-dock-modal";
      dock.setAttribute("role", "dialog");
      dock.setAttribute("aria-modal", "true");
      dock.setAttribute("aria-label", "Image Zoom Inspection Dock");
      dock.hidden = true;
      dock.innerHTML = `
        <div class="ron-zoom-dock-backdrop" data-close-zoom-dock></div>
        <div class="ron-zoom-dock-container">
          <header class="ron-zoom-dock-header">
            <div class="ron-zoom-dock-title-group">
              <span class="ron-zoom-dock-tag">CLINICAL REFERENCE FIGURE</span>
              <h4 class="ron-zoom-dock-title" id="ronZoomDockTitle">Clinical Diagram</h4>
            </div>
            <div class="ron-zoom-dock-header-actions">
              <button type="button" class="ron-zoom-btn-close" data-close-zoom-dock aria-label="Close Zoom Dock (ESC)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                <span>Close (ESC)</span>
              </button>
            </div>
          </header>

          <main class="ron-zoom-stage" id="ronZoomStage">
            <div class="ron-zoom-viewport" id="ronZoomViewport">
              <img id="ronZoomImage" src="" alt="Clinical Figure" draggable="false">
            </div>
          </main>

          <footer class="ron-zoom-dock-footer">
            <p class="ron-zoom-dock-caption" id="ronZoomDockCaption"></p>
            <div class="ron-zoom-pill-controls" role="toolbar" aria-label="Zoom controls">
              <button type="button" class="ron-zoom-pill-btn" id="ronZoomOutBtn" title="Zoom Out (−)" aria-label="Zoom Out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button type="button" class="ron-zoom-pill-level" id="ronZoomResetBtn" title="Reset Zoom (100%)" aria-label="Reset Zoom">
                <span id="ronZoomLevelText">100%</span>
              </button>
              <button type="button" class="ron-zoom-pill-btn" id="ronZoomInBtn" title="Zoom In (+)" aria-label="Zoom In">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <div class="ron-zoom-pill-sep"></div>
              <button type="button" class="ron-zoom-pill-btn" id="ronZoomFitBtn" title="Fit to Screen" aria-label="Fit to Screen">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Fit</span>
              </button>
              <button type="button" class="ron-zoom-pill-btn" id="ronZoomActualBtn" title="Actual Size (1:1)" aria-label="Actual Size">
                <span>1:1</span>
              </button>
            </div>
          </footer>
        </div>
      `;
      document.body.appendChild(dock);

      const outBtn = dock.querySelector("#ronZoomOutBtn");
      if (outBtn) outBtn.addEventListener("click", () => setZoom(currentZoomScale * 0.8));

      const inBtn = dock.querySelector("#ronZoomInBtn");
      if (inBtn) inBtn.addEventListener("click", () => setZoom(currentZoomScale * 1.25));

      const resetBtn = dock.querySelector("#ronZoomResetBtn");
      if (resetBtn) resetBtn.addEventListener("click", () => setZoom(1.0));

      const fitBtn = dock.querySelector("#ronZoomFitBtn");
      if (fitBtn) fitBtn.addEventListener("click", () => setZoom(1.0));

      const actualBtn = dock.querySelector("#ronZoomActualBtn");
      if (actualBtn) actualBtn.addEventListener("click", () => {
        setZoom(currentZoomScale === 1.0 ? 1.5 : 1.0);
      });

      const zoomImg = dock.querySelector("#ronZoomImage");
      if (zoomImg) {
        zoomImg.addEventListener("click", (e) => {
          e.stopPropagation();
          setZoom(currentZoomScale > 1.2 ? 1.0 : 1.8);
        });
      }

      const stage = dock.querySelector("#ronZoomStage");
      if (stage) {
        stage.addEventListener("dblclick", (e) => {
          e.preventDefault();
          setZoom(currentZoomScale > 1.2 ? 1.0 : 2.0);
        });

        stage.addEventListener("wheel", (e) => {
          e.preventDefault();
          const factor = e.deltaY < 0 ? 1.15 : 0.87;
          setZoom(currentZoomScale * factor);
        }, { passive: false });

        stage.addEventListener("pointerdown", (e) => {
          if (e.target.closest(".ron-zoom-pill-controls, .ron-zoom-btn-close")) return;
          isPanning = true;
          startPanX = e.clientX - panTranslateX;
          startPanY = e.clientY - panTranslateY;
          stage.setPointerCapture(e.pointerId);
          stage.classList.add("is-panning");
        });
        stage.addEventListener("pointermove", (e) => {
          if (!isPanning) return;
          panTranslateX = e.clientX - startPanX;
          panTranslateY = e.clientY - startPanY;
          updateZoomTransform();
        });
        stage.addEventListener("pointerup", () => {
          isPanning = false;
          stage.classList.remove("is-panning");
        });
        stage.addEventListener("pointercancel", () => {
          isPanning = false;
          stage.classList.remove("is-panning");
        });

        stage.addEventListener("touchstart", (e) => {
          if (e.touches.length === 2) {
            initialPinchDistance = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            initialPinchScale = currentZoomScale;
          }
        }, { passive: true });
        stage.addEventListener("touchmove", (e) => {
          if (e.touches.length === 2 && initialPinchDistance > 0) {
            e.preventDefault();
            const currentDist = Math.hypot(
              e.touches[0].clientX - e.touches[1].clientX,
              e.touches[0].clientY - e.touches[1].clientY
            );
            const ratio = currentDist / initialPinchDistance;
            setZoom(initialPinchScale * ratio);
          }
        }, { passive: false });
      }
    }
    return dock;
  }

  function openImageZoomDock(opts) {
    if (!opts || !opts.src) return;
    const dock = ensureZoomDockDOM();
    const img = dock.querySelector("#ronZoomImage");
    const titleEl = dock.querySelector("#ronZoomDockTitle");
    const captionEl = dock.querySelector("#ronZoomDockCaption");

    currentZoomScale = 1.0;
    panTranslateX = 0;
    panTranslateY = 0;

    if (img) {
      img.src = opts.src;
      img.alt = opts.alt || opts.caption || "Clinical Reference Diagram";
    }
    if (titleEl) {
      titleEl.textContent = opts.alt && opts.alt !== "Clinical Reference Diagram" ? opts.alt : (opts.caption || "Inspection View");
    }
    if (captionEl) {
      captionEl.textContent = opts.caption || "";
      captionEl.style.display = opts.caption ? "block" : "none";
    }

    updateZoomTransform();
    dock.removeAttribute("hidden");
    dock.hidden = false;
    dock.style.display = "flex";
    void dock.offsetWidth;
    dock.classList.add("open");
    document.body.classList.add("ron-zoom-dock-open");
  }

  function closeImageZoomDock() {
    const dock = document.getElementById("ronImageZoomDock");
    if (dock) {
      dock.classList.remove("open");
      document.body.classList.remove("ron-zoom-dock-open");
      setTimeout(() => {
        if (!dock.classList.contains("open")) {
          dock.setAttribute("hidden", "true");
          dock.hidden = true;
          dock.style.display = "none";
        }
      }, 200);
    }
  }

  window.openImageZoomDock = openImageZoomDock;
  window.closeImageZoomDock = closeImageZoomDock;

  // Keyboard accessibility for topic cards and Zoom Dock
  document.addEventListener("keydown", (e) => {
    const dock = document.getElementById("ronImageZoomDock");
    if (dock && dock.classList.contains("open")) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeImageZoomDock();
        return;
      }
      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom(currentZoomScale * 1.2);
        return;
      }
      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        setZoom(currentZoomScale * 0.8);
        return;
      }
      if (e.key === "0") {
        e.preventDefault();
        setZoom(1.0);
        return;
      }
    }

    if (e.key === "Enter" || e.key === " ") {
      const zoomFig = e.target.closest && e.target.closest("[data-zoom-src]");
      if (zoomFig) {
        e.preventDefault();
        zoomFig.click();
        return;
      }
      const topicCard = e.target.closest(".ron-interactive-topic-card, [data-topic-id]");
      if (topicCard && !e.target.closest("button, a, input, select, textarea")) {
        e.preventDefault();
        topicCard.click();
      }
    }
  });

  window.__RON_STUDY_ACTIVE = true;
  window.KN_STUDY_RETURN = function () {
    renderRonBoard();
  };
  window.StudyRonDesign = {
    openTopic: openTopic,
    backToCategory: backToCategory,
    selectCategory: function (catId) {
      backToCategory(catId);
    },
    setFilter: function (q) {
      searchFilter = q || "";
      renderRonBoard();
    },
    renderRonBoard: renderRonBoard,
    getData: getData
  };

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
