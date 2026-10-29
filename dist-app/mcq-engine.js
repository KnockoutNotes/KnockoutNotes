/* ==========================================================================
   KNOCKOUTNOTES — NEET-SS / INI-SS Dedicated Full-Page MCQ Engine
   File: mcq-engine.js
   Architecture & Capabilities:
   1. Dedicated Full-Page Experience: Replaces tiny popup with full page UI
      with Chapter Directory, Custom Test Builder, Timed Exam Interface,
      Interactive Palette Drawer, High-Performance Results, Post-Test Review,
      and Study Links back to Knockout Notes study modules.
   2. Data-Driven & Extensible: Loads from master criticalCare/mcqs.json and
      chapter chunks (ch01-08, ch09-16, ch17-24, ch25-31).
   3. Offline-First & PWA: Standard cache-compatible fetch; localStorage persistence.
   4. Quality & Metadata: Strict 4-option schema, why-wrong rationale, exam pearls,
      verified citations, difficulty & exam filters.
   5. Mobile-Optimized: Touch targets >= 48px, one-handed bottom nav bar,
      sticky score & timer HUD, responsive palette drawer.
   ========================================================================== */

(function () {
  "use strict";

  if (window.KN_MCQ && window.KN_MCQ._ready) return;

  var STORAGE_PROGRESS_KEY = "kn_cc_mcq_progress_v2";
  var STORAGE_BOOKMARKS_KEY = "kn_cc_mcq_bookmarks_v2";
  var STORAGE_TEST_KEY = "kn_cc_mcq_active_test_v1";

  // Data URLs
  var MASTER_MCQ_FILE = "criticalCare/mcqs.json";
  var CHAPTERS_FILE = "criticalCare/chapters.json";
  var TOPICS_FILE = "criticalCare/topics.json";
  var CHUNK_FILES = [
    "criticalCare/chunks/mcqs_ch01_to_ch08.json",
    "criticalCare/chunks/mcqs_ch09_to_ch16.json",
    "criticalCare/chunks/mcqs_ch17_to_ch24.json",
    "criticalCare/chunks/mcqs_ch25_to_ch31.json"
  ];

  // Topic mapping to KnockoutNotes Study Mode (covers all 95 topicIds in question bank)
  var TOPIC_TO_STUDY = {
    // Chapter 1: Fundamentals of Critical Care & ICU Systems
    "cc-management-of-brain-dead-organ-donors": "brain-death-organ-donation",
    "cc-end-of-life-care-in-the-icu": "brain-death-organ-donation",
    "cc-important-clinical-trials-in-critical-care": "icu-organization-scoring-ethics",
    "cc-scoring-systems-in-the-icu": "icu-organization-scoring-ethics",
    "cc-catheter-related-blood-stream-infection": "central-venous-pulmonary-artery-catheters",

    // Chapter 2: Applied Physiology of Critical Illness
    "cc-assessing-adequacy-of-oxygen-delivery": "venturi-oxygen-devices",

    // Chapter 3: Advanced Hemodynamic Monitoring & Echocardiography
    "cc-shock-pathophysiology-and-classification": "hemodynamics-shock-approach",
    "cc-haemodynamic-monitoring-i": "asa-monitoring",
    "cc-central-venous-line-and-cvp-measurement": "central-venous-pulmonary-artery-catheters",
    "cc-cardiac-output-monitoring": "hemodynamics-shock-approach",
    "cc-pa-catheter": "central-venous-pulmonary-artery-catheters",
    "cc-assessing-fluid-responsiveness-in-the-icu": "fluid-responsiveness-dynamic-indices",

    // Chapter 4: Shock Syndromes & Vasoactive Therapeutics
    "cc-cardiogenic-shock-i": "cardiogenic-shock-scai",
    "cc-cardiogenic-shock-ii": "cardiogenic-shock-scai",
    "cc-anaphylactic-shock": "anaphylactic-neurogenic-endocrine-shock",

    // Chapter 5: Sepsis, Septic Shock & Host Response (2026 SSC)
    "cc-sepsis-and-septic-shock-evaluation-management": "septic-shock-resuscitation",
    "cc-organ-dysfunction-in-sepsis": "sepsis3-hour1-bundle-resuscitation",
    "cc-sepsis-2026-clinical-guidelines": "sepsis3-hour1-bundle-resuscitation",
    "cc-extracorporeal-therapies-in-sepsis": "haemodialysis-crrt-dialysis-circuit",

    // Chapter 6: Acute Respiratory Failure & Mechanics
    "cc-respiratory-management-in-specific-clinical-scenarios-i": "acute-respiratory-failure-types",
    "cc-respiratory-management-in-specific-clinical-scenarios-ii": "acute-respiratory-failure-types",

    // Chapter 7: Non-Invasive Respiratory Support (HFNC & NIV)
    "cc-hfnc-mechanics-rox-index": "thrive-hfno-apneic-oxygenation",
    "cc-niv-failure-predictors-hacor-score": "thrive-hfno-apneic-oxygenation",

    // Chapter 8: Invasive Mechanical Ventilation & Graphics
    "cc-basics-of-mechanical-ventilation": "ventilators-classification",
    "cc-advanced-modes-of-mechanical-ventilation": "ventilators-classification",
    "cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation": "ventilator-modes-waveforms-asynchrony",
    "cc-patient-ventilator-asynchrony": "ventilator-modes-waveforms-asynchrony",
    "cc-weaning-from-mechanical-ventilation": "ventilator-liberation-weaning-failure",

    // Chapter 9: Acute Respiratory Distress Syndrome (ARDS)
    "cc-acute-respiratory-distress-syndrome-i": "ards-berlin-lung-protective",
    "cc-acute-respiratory-distress-syndrome-ii": "ards-refractory-rescue-ecmo",

    // Chapter 10: Obstructive Airway Emergencies in ICU (Asthma & COPD)
    "cc-copd-and-asthma": "status-asthmaticus-copd-icu",

    // Chapter 11: Cardiac Critical Care & Acute Coronary Syndromes
    "cc-pulmonary-embolism": "massive-pe-cor-pulmonale",
    "cc-mi-acs": "acute-coronary-syndromes-cardiogenic-shock",
    "cc-icu-management-of-acs-i": "acute-coronary-syndromes-cardiogenic-shock",
    "cc-icu-management-of-acs-ii": "acute-coronary-syndromes-cardiogenic-shock",
    "cc-right-ventricular-failure-in-the-icu": "rv-failure-pulmonary-hypertension-icu",
    "cc-aortic-dissection": "acute-aortic-syndromes-hypertensive-crises",
    "cc-pericarditis-and-myocarditis": "cardiac-arrhythmias-tamponade-pocus",
    "cc-malignant-arrhythmias-in-the-icu": "cardiac-arrhythmias-tamponade-pocus",

    // Chapter 12: Resuscitation, Cardiac Arrest & Post-ROSC Care
    "cc-post-cardiac-arrest-management-prognostication": "hypoxic-ischemic-encephalopathy-ttm-postarrest",
    "cc-2025-acc-aha-cpr-guidelines-updates": "hypoxic-ischemic-encephalopathy-ttm-postarrest",

    // Chapter 13: Acute Kidney Injury & Renal Replacement Therapy
    "cc-acute-kidney-injury-i": "aki-kdigo-crrt-modalities",
    "cc-acute-kidney-injury-ii": "aki-kdigo-crrt-modalities",
    "cc-renal-replacement-therapy-i": "aki-kdigo-crrt-modalities",
    "cc-renal-replacement-therapy-ii": "citrate-anticoagulation-crrt-protocols",
    "cc-sodium-disorders-in-the-icu": "severe-electrolyte-disturbances-icu",
    "cc-potassium-disorders-in-the-icu": "severe-electrolyte-disturbances-icu",

    // Chapter 14: Complex Acid-Base Disorders & Blood Gas Analysis
    "cc-interpreting-abg": "abg-interpretation",
    "cc-disorders-of-calcium-magnesium-phosphorus-metabolism": "severe-electrolyte-disturbances-icu",

    // Chapter 15: Neurocritical Care & Raised ICP Management
    "cc-traumatic-brain-injury": "tbi-neuromonitoring-raised-icp",
    "cc-icu-management-of-traumatic-brain-injury": "tbi-neuromonitoring-raised-icp",
    "cc-icp-monitoring": "tbi-neuromonitoring-raised-icp",
    "cc-intracranial-haemorrhage": "subarachnoid-intracerebral-hemorrhage-icu",
    "cc-subarachnoid-haemorrhage": "subarachnoid-intracerebral-hemorrhage-icu",
    "cc-status-epilepticus": "status-epilepticus-rse-srse",

    // Chapter 16: Sedation, Analgesia, Delirium & Neuromuscular Blockade
    "cc-neuromuscular-disorders-in-icu-i": "neuromuscular-weakness-gbs-myasthenia-icu",
    "cc-neuromuscular-disorders-in-icu-ii": "neuromuscular-blockade-train-of-four-icu",
    "cc-delirium-in-icu-padis-guidelines": "icu-sedation-analgesia-delirium-padis",

    // Chapter 17: Critical Care Applied Pharmacology & Pharmacokinetics
    "cc-pharmacokinetics": "pkpd-organ-support-crrt-ecmo-vasodilators",

    // Chapter 18: Severe ICU Infections & Antimicrobial Stewardship
    "cc-ventilator-associated-pneumonia": "severe-pneumonia-cap-hap-vap",
    "cc-community-acquired-pneumonia": "severe-pneumonia-cap-hap-vap",
    "cc-managing-mdr-gram-negative-infections-i": "multidrug-resistant-pathogens-icu",
    "cc-managing-mdr-gram-negative-infections-ii": "multidrug-resistant-pathogens-icu",
    "cc-interpreting-antibiogram-and-mic": "empiric-sepsis-mdr-bundles",
    "cc-cns-infections-in-icu": "cns-infections-meningitis-encephalitis-icu",
    "cc-leptospirosis-rickettsial-diseases": "empiric-sepsis-mdr-bundles",
    "cc-dengue-fever": "empiric-sepsis-mdr-bundles",
    "cc-clostridioides-difficile-colitis": "fungal-infections-clostridioides-oncology-icu",

    // Chapter 19: Gastrointestinal, Hepatic & Abdominal Catastrophes
    "cc-acute-liver-failure": "acute-liver-failure-nutrition-icu",
    "cc-decompensated-cld": "acute-liver-failure-nutrition-icu",
    "cc-acute-pancreatitis": "acute-gi-bleeding-pancreatitis-icu",
    "cc-acute-mesenteric-ischemia": "abdominal-compartment-syndrome-mesenteric-ischemia",
    "cc-intra-abdominal-hypertension-and-abdominal-compartment-syndrome": "abdominal-compartment-syndrome-mesenteric-ischemia",

    // Chapter 20: Endocrine & Metabolic Crises
    "cc-glucose-control-in-icu": "rhabdomyolysis-endocrine-emergencies-icu",
    "cc-endocrine-emergencies": "rhabdomyolysis-endocrine-emergencies-icu",

    // Chapter 21: Critical Care Clinical Nutrition & Metabolism
    "cc-nutrition-in-the-icu": "nutrition-in-the-icu",

    // Chapter 22: ICU Hematology, Hemostasis & Transfusion Medicine
    "cc-hematological-emergencies-in-critical-illness": "massive-transfusion-rotem-teg-coagulopathy",
    "cc-thrombocytopenia-in-the-icu": "dic-hit-thrombotic-microangiopathies",

    // Chapter 23: Clinical Toxicology & Toxidromes
    "cc-general-approach-to-poisoning": "toxidromes-general-approach",
    "cc-acetaminophen-toxicity": "toxicology-antidotes-extracorporeal-elimination",
    "cc-pesticides": "organophosphates-carbamates",
    "cc-management-of-snake-bites": "toxicology-antidotes-extracorporeal-elimination",
    "cc-recreational-drug-toxicity": "toxicology-antidotes-extracorporeal-elimination",

    // Chapter 24: Polytrauma & Damage Control Resuscitation
    "cc-haemodynamic-management-pharmacotherapy-in-acute-polytrauma": "trauma-resuscitation-damage-control",

    // Chapter 25: Major Burns & Inhalational Injuries
    "cc-management-of-burn-patient-in-icu": "burn-resuscitation-inhalation-injury",

    // Chapter 26: Obstetric Critical Care & Maternal Emergencies
    "cc-obstetric-critical-care-general-considerations": "preeclampsia-eclampsia-hellp-syndrome",
    "cc-obstetric-critical-care-pregnancy-specific": "preeclampsia-eclampsia-hellp-syndrome",

    // Chapter 27: Paediatric & Neonatal Emergencies in Adult ICU
    "cc-paediatric-shock-sepsis-formulas": "pediatric-septic-shock-resuscitation",
    "cc-paediatric-status-asthmaticus-dka": "pediatric-status-asthmaticus-epilepticus",

    // Chapter 28: Critical Care Bedside Procedures & Invasive Devices
    "cc-pleural-disorders-in-icu": "icu-bronchoscopy-tracheostomy-complications",

    // Chapter 29: Critical Care Ultrasound & Echocardiography (POCUS)
    "cc-basic-echocardiography": "pocus-critical-care-vexus-blue-rush",

    // Chapter 30: Extracorporeal Membrane Oxygenation (ECMO) & ECPR
    "cc-ecmo-basics": "ecmo-vv-va-principles-cannulation",
    "cc-managing-a-patient-on-ecmo": "ecmo-vv-va-principles-cannulation",

    // Chapter 31: Special ICU Populations, Oncology & Environmental Crises
    "cc-infections-in-the-immunocompromised-host": "antifungals-icu",
    "cc-novel-chemo-and-toxicity-in-icu": "antifungals-icu"
  };

  var STUDY_TO_TOPIC = {};
  for (var tk in TOPIC_TO_STUDY) {
    if (Object.prototype.hasOwnProperty.call(TOPIC_TO_STUDY, tk)) {
      var sKey = TOPIC_TO_STUDY[tk];
      if (!STUDY_TO_TOPIC[sKey]) {
        STUDY_TO_TOPIC[sKey] = [];
      }
      STUDY_TO_TOPIC[sKey].push(tk);
    }
  }

  // PYQ Helper Functions
  // PYQ Helper Functions
  function isPYQ(m) {
    if (!m) return false;
    if (m.sourceType === "neet-ss-2025-recall" || m.sourceType === "neet-ss-2024-recall" || m.sourceType === "ini-ss-nov2025-recall" || m.sourceType === "ini-cet-ss-2026-recall") return true;
    if (m.tags && (m.tags.indexOf("NEET SS CC 2025") !== -1 || m.tags.indexOf("NEET SS CC 2024") !== -1 || m.tags.indexOf("INI SS CC Nov 2025") !== -1 || m.tags.indexOf("INI SS CC April 2026") !== -1 || m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("Recall Nov 2025") !== -1 || m.tags.indexOf("Recall 2026") !== -1 || m.tags.indexOf("Recall 2025") !== -1 || m.tags.indexOf("Recall 2024") !== -1)) return true;
    return false;
  }

  function getPYQExam(m) {
    if (!m) return "NEET-SS";
    if (m.exam === "INI-CET SS" || m.sourceType === "ini-cet-ss-2026-recall") return "INI-CET-SS-2026";
    if (m.tags && (m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("INI SS CC April 2026") !== -1)) return "INI-CET-SS-2026";
    if (m.exam === "INI-SS" || m.sourceType === "ini-ss-nov2025-recall") return "INI-SS";
    if (m.tags && (m.tags.indexOf("INI-SS") !== -1 || m.tags.indexOf("INI SS CC Nov 2025") !== -1)) return "INI-SS";
    return "NEET-SS";
  }

  function getPYQYear(m) {
    if (!m) return 2025;
    if (m.year) return Number(m.year);
    if (m.sourceType === "ini-cet-ss-2026-recall" || (m.tags && (m.tags.indexOf("INI-CET SS 2026") !== -1 || m.tags.indexOf("Recall 2026") !== -1))) return 2026;
    if (m.sourceType === "neet-ss-2024-recall" || (m.tags && m.tags.indexOf("NEET SS CC 2024") !== -1)) return 2024;
    return 2025;
  }

  function getPYQTopic(m) {
    var raw = "";
    if (m.tags && m.tags.length > 3 && m.tags[3]) {
      raw = m.tags[3];
    } else if (m.topic) {
      raw = m.topic;
    } else if (m.subject) {
      raw = m.subject;
    }
    var s = String(raw).trim().toLowerCase();
    if (s.indexOf("ventilat") !== -1 || s.indexOf("respirat") !== -1) return "Mechanical Ventilation";
    if (s.indexOf("hemodynam") !== -1 || s.indexOf("cardio") !== -1) return "Hemodynamics";
    if (s.indexOf("sepsis") !== -1 || s.indexOf("septic") !== -1) return "Sepsis";
    if (s.indexOf("neuro") !== -1 || s.indexOf("tbi") !== -1 || s.indexOf("icp") !== -1) return "Neurocritical Care";
    if (s.indexOf("acid") !== -1 || s.indexOf("abg") !== -1) return "Acid-Base Disorders";
    if (s.indexOf("renal") !== -1 || s.indexOf("kidney") !== -1) return "Renal Critical Care";
    if (s.indexOf("cpr") !== -1 || s.indexOf("acls") !== -1 || s.indexOf("resuscit") !== -1) return "ACLS / CPR";
    if (s.indexOf("infect") !== -1 || s.indexOf("antibi") !== -1 || s.indexOf("pneumon") !== -1) return "Infectious Diseases";
    if (s.indexOf("toxico") !== -1 || s.indexOf("poison") !== -1) return "Toxicology";
    if (s.indexOf("trauma") !== -1 || s.indexOf("burn") !== -1) return "Trauma & Burns";
    if (s.indexOf("nutrit") !== -1 || s.indexOf("gastro") !== -1 || s.indexOf("gi") !== -1) return "Nutrition & GI";
    if (s.indexOf("obstetric") !== -1 || s.indexOf("pregnan") !== -1 || s.indexOf("maternal") !== -1) return "Obstetric Critical Care";
    if (s.indexOf("electrolyt") !== -1 || s.indexOf("sodium") !== -1 || s.indexOf("potassium") !== -1 || s.indexOf("calcium") !== -1) return "Electrolytes & Metabolic";
    if (s.indexOf("hematol") !== -1 || s.indexOf("thromb") !== -1 || s.indexOf("platelet") !== -1) return "Hematology & Transfusion";
    if (s.indexOf("procedur") !== -1 || s.indexOf("monitor") !== -1 || s.indexOf("catheter") !== -1) return "ICU Procedures & Monitoring";
    if (s.indexOf("pharm") !== -1 || s.indexOf("drug") !== -1 || s.indexOf("chemo") !== -1) return "Pharmacology & Oncology";
    return raw || "Miscellaneous";
  }

  function getSanitizedReference(refObj) {
    if (!refObj) return { url: "", label: "" };
    var rawUrl = (refObj.url || "").trim();
    var rawLabel = (refObj.label || "").trim();
    var lowerUrl = rawUrl.toLowerCase();
    var lowerLabel = rawLabel.toLowerCase();

    var isPromoUrl = lowerUrl.indexOf("youtu") !== -1 || lowerUrl.indexOf("doctutorials") !== -1;
    var isPromoLabel = lowerLabel.indexOf("doctutorials") !== -1 || lowerLabel.indexOf("youtube") !== -1;

    var validUrl = isPromoUrl ? "" : rawUrl;
    var validLabel = isPromoLabel ? "" : rawLabel;

    return { url: validUrl, label: validLabel };
  }

  // State
  var state = {
    mcqs: [],             // All loaded MCQs
    chapters: [],         // All chapters
    topics: [],           // All topics
    viewMode: "directory",// "directory" | "practice" | "builder" | "exam" | "results" | "review" | "pyq"
    practiceFilter: {
      chapterId: "",
      topicId: "",
      exam: "all",
      difficulty: "all",
      view: "all",        // "all" | "bookmarks" | "incorrect" | "pyq" | "recall2025"
      search: ""
    },
    pyq: {
      exam: "NEET-SS",    // "NEET-SS" | "INI-SS" | "INI-CET-SS-2026"
      year: "all",        // "all" | "2025" | "2024" (or "nov2025" for INI-SS)
      mode: "topic",      // "topic" (Topic-wise Explorer) | "all" (All Questions) | "frequent" (Frequently Asked Topics)
      topic: "all",       // "all" | normalized topic string
      search: "",
      page: 0,
      pageSize: 7,        // 7 per page matching the reference UI
      expanded: {},       // questionId -> true
      faqExamFilter: "all", // "all" | "NEET-SS" | "INI-SS" | "INI-CET-SS-2026"
      faqSort: "freq",      // "freq" | "name"
      faqSearch: ""
    },
    practiceIndex: 0,
    practiceList: [],
    // Active Exam / Custom Test Session
    exam: {
      id: null,
      title: "Custom Mock Test",
      questions: [],
      currentIndex: 0,
      userAnswers: {},    // questionId -> selectedOption (0, 1, 2, 3)
      markedForReview: {},// questionId -> true
      startTime: null,
      timerDuration: 0,   // seconds, 0 = untimed
      timerRemaining: 0,
      timerInterval: null,
      isSubmitted: false,
      results: null
    },
    answers: {},          // Overall question practice answers { qId: { selected, correct } }
    bookmarks: {},        // questionId -> true
    loading: true,
    error: null,
    paletteOpen: false
  };

  var loadPromise = null;
  var container = null;
  var hasWiredKeydown = false;

  // Restore LocalStorage
  try {
    var savedAnswers = localStorage.getItem(STORAGE_PROGRESS_KEY);
    if (savedAnswers) state.answers = JSON.parse(savedAnswers) || {};
  } catch (_) { state.answers = {}; }

  try {
    var savedBookmarks = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    if (savedBookmarks) state.bookmarks = JSON.parse(savedBookmarks) || {};
  } catch (_) { state.bookmarks = {}; }

  // Check if incomplete exam was saved
  try {
    var savedTest = localStorage.getItem(STORAGE_TEST_KEY);
    if (savedTest) {
      var parsedTest = JSON.parse(savedTest);
      if (parsedTest && parsedTest.questions && parsedTest.questions.length && !parsedTest.isSubmitted) {
        state.exam = parsedTest;
        // Don't auto-launch exam, but keep state available
      }
    }
  } catch (_) {}

  function persistProgress() {
    try { localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(state.answers)); } catch (_) {}
  }
  function persistBookmarks() {
    try { localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(state.bookmarks)); } catch (_) {}
  }
  function persistExam() {
    try {
      if (state.exam && state.exam.questions && state.exam.questions.length) {
        localStorage.setItem(STORAGE_TEST_KEY, JSON.stringify(state.exam));
      } else {
        localStorage.removeItem(STORAGE_TEST_KEY);
      }
    } catch (_) {}
  }

  // Helpers
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function letterAt(i) {
    if (typeof i !== "number" || i < 0 || i > 25) return "?";
    return String.fromCharCode(65 + i);
  }

  function correctIndex(m) {
    var a = String(m.answer || "").trim().toUpperCase();
    var code = a.charCodeAt(0) - 65;
    return (code >= 0 && m.options && code < m.options.length) ? code : -1;
  }

  function chapterObj(id) {
    return state.chapters.find(function (c) { return String(c.id) === String(id); }) || null;
  }

  function chapterTitle(id) {
    var ch = chapterObj(id);
    return ch ? ch.title : "Chapter " + id;
  }

  function topicObj(id) {
    return state.topics.find(function (t) { return t.id === id; }) || null;
  }

  function topicTitle(id) {
    var tp = topicObj(id);
    return tp ? tp.title : id;
  }

  function getStudyLink(topicId, chapterId) {
    if (topicId && TOPIC_TO_STUDY[topicId]) {
      return "study.html?topic=" + encodeURIComponent(TOPIC_TO_STUDY[topicId]);
    }
    return "study.html?domain=critical";
  }

  function triggerHaptic() {
    try {
      if (navigator.vibrate) navigator.vibrate(8);
    } catch (_) {}
  }

  // ── Data Loader ──────────────────────────────────────────────────────────
  function mergeMcqs(arrays) {
    var seen = {};
    var out = [];
    arrays.forEach(function (arr) {
      if (!Array.isArray(arr)) return;
      arr.forEach(function (m) {
        if (!m || !m.id || seen[m.id]) return;
        seen[m.id] = true;
        out.push(m);
      });
    });
    out.sort(function (a, b) {
      if (a.chapterId !== b.chapterId) return (a.chapterId || 0) - (b.chapterId || 0);
      return String(a.id).localeCompare(String(b.id));
    });
    return out;
  }

  function loadData() {
    if (loadPromise) return loadPromise;

    state.loading = true;
    var fetchJson = function (url) {
      return fetch(url).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + url);
        return res.json();
      });
    };

    loadPromise = Promise.all([
      fetchJson(CHAPTERS_FILE).catch(function () { return []; }),
      fetchJson(TOPICS_FILE).catch(function () { return []; }),
      fetchJson(MASTER_MCQ_FILE).catch(function () {
        // Fallback to chunks only if master file fails
        return Promise.all(CHUNK_FILES.map(function (c) {
          return fetchJson(c).catch(function () { return []; });
        })).then(function (chunkResults) {
          return [].concat.apply([], chunkResults);
        });
      })
    ]).then(function (results) {
      var chaps = results[0] || [];
      var topics = results[1] || [];
      var rawMcqs = results[2] || [];

      var merged = mergeMcqs([rawMcqs]);
      state.mcqs = merged;
      state.chapters = Array.isArray(chaps) ? chaps : [];
      state.topics = Array.isArray(topics) ? topics : [];
      state.loading = false;
      state.error = merged.length ? null : new Error("No MCQ data found.");

      filterPracticeList();
      return merged;
    }).catch(function (err) {
      state.loading = false;
      state.error = err || new Error("Failed to load MCQs");
      return [];
    });

    return loadPromise;
  }

  // ── Practice List Filtering ──────────────────────────────────────────────
  function filterPracticeList() {
    var f = state.practiceFilter;
    var ch = f.chapterId;
    var tp = f.topicId;
    var ex = f.exam;
    var df = f.difficulty;
    var vf = f.view;
    var sq = (f.search || "").trim().toLowerCase();

    state.practiceList = state.mcqs.filter(function (m) {
      if (vf === "recall2025") {
        if (m.sourceType !== "neet-ss-2025-recall" && (!m.tags || m.tags.indexOf("NEET SS CC 2025") === -1)) return false;
      } else if (vf === "recall2024") {
        if (m.sourceType !== "neet-ss-2024-recall" && (!m.tags || m.tags.indexOf("NEET SS CC 2024") === -1)) return false;
      } else if (vf === "pyq") {
        if (!isPYQ(m)) return false;
        var pExam = state.pyq.exam || "NEET-SS";
        if (pExam !== "all" && getPYQExam(m) !== pExam) return false;
        if (pExam === "NEET-SS") {
          if (state.pyq.year === "2025" && getPYQYear(m) !== 2025) return false;
          if (state.pyq.year === "2024" && getPYQYear(m) !== 2024) return false;
        }
        if (state.pyq.topic && state.pyq.topic !== "all" && getPYQTopic(m) !== state.pyq.topic) return false;
      }
      if (!tp && ch && String(m.chapterId) !== String(ch)) return false;
      if (tp) {
        if (Array.isArray(tp)) {
          if (tp.indexOf(m.topicId) === -1) return false;
        } else if (m.topicId !== tp) {
          return false;
        }
      }
      if (ex === "NEET-SS-2025-RECALL") {
        if (m.sourceType !== "neet-ss-2025-recall" && (!m.tags || m.tags.indexOf("NEET SS CC 2025") === -1)) return false;
      } else if (ex === "NEET-SS-2024-RECALL") {
        if (m.sourceType !== "neet-ss-2024-recall" && (!m.tags || m.tags.indexOf("NEET SS CC 2024") === -1)) return false;
      } else if (ex === "INI-SS-2025-RECALL" || ex === "INI-SS-NOV2025-RECALL") {
        if (m.sourceType !== "ini-ss-nov2025-recall" && (!m.tags || m.tags.indexOf("INI SS CC Nov 2025") === -1)) return false;
      } else if (ex === "INI-CET-SS-2026-RECALL" || ex === "INICET-SS-2026-RECALL") {
        if (m.sourceType !== "ini-cet-ss-2026-recall" && (!m.tags || m.tags.indexOf("INI-CET SS 2026") === -1)) return false;
      } else if (ex === "NEET-SS-PYQ") {
        if (!isPYQ(m) || getPYQExam(m) !== "NEET-SS") return false;
      } else if (ex === "INI-SS-PYQ") {
        if (!isPYQ(m) || getPYQExam(m) !== "INI-SS") return false;
      } else if (ex === "INI-CET-SS-2026-PYQ") {
        if (!isPYQ(m) || getPYQExam(m) !== "INI-CET-SS-2026") return false;
      } else if (ex !== "all" && m.exam !== ex) {
        return false;
      }
      if (df !== "all" && m.difficulty !== df) return false;
      if (vf === "bookmarks" && !state.bookmarks[m.id]) return false;
      if (vf === "incorrect") {
        var ans = state.answers[m.id];
        if (!ans || ans.correct) return false;
      }
      if (sq) {
        var tagStr = (m.tags || []).join(" ");
        var qText = (m.question + " " + (m.options || []).join(" ") + " " + (m.explanation || "") + " " + tagStr + " " + (m.concept_tested || "")).toLowerCase();
        if (qText.indexOf(sq) === -1) return false;
      }
      return true;
    });

    if (state.practiceIndex < 0 || state.practiceIndex >= state.practiceList.length) {
      state.practiceIndex = 0;
    }
  }

  // ── UI Rendering: Top Bar & Navigation ──────────────────────────────────
  function renderTopBar() {
    var isExam = state.viewMode === "exam";
    var isResults = state.viewMode === "results";
    var isReview = state.viewMode === "review";
    var isPyq = state.viewMode === "pyq";

    var title = "NEET-SS / INI-SS Critical Care MCQ Master Engine";
    var totalCount = state.mcqs.length || 505;
    var sub = totalCount + " Verified Examination Questions & Landmark Trials";

    if (isExam) {
      title = state.exam.title || "Custom Examination";
      sub = "Live Test Mode · Q " + (state.exam.currentIndex + 1) + " of " + state.exam.questions.length;
    } else if (isResults) {
      title = "Examination Performance Analytics";
      sub = "Scorecard & Clinical Topic Diagnostic";
    } else if (isReview) {
      title = "Post-Test In-Depth Review";
      sub = "Rationales, Why-Wrong & Study Links";
    } else if (isPyq) {
      title = "NEET-SS Critical Care — PYQs";
      sub = "Verified Previous Year Questions & Dynamic Question Explorer";
    }

    var actions = '';
    if (isExam) {
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--danger kn-mcq-btn--sm" data-action="submit-exam">Finish &amp; Submit Test</button>';
    } else if (isResults) {
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="go-directory">Directory</button>';
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent kn-mcq-btn--sm" data-action="go-builder">New Custom Test</button>';
    } else {
      if (!isPyq) {
        actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent kn-mcq-btn--sm" data-action="go-pyq">🎯 PYQs</button>';
      }
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary kn-mcq-btn--sm" data-action="go-builder">⚡ Create Custom Test</button>';
      if (state.viewMode !== "directory") {
        actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="go-directory">All Chapters</button>';
      }
    }
    actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--study-exit" data-action="exit-to-study" title="Return to Study Mode">← Study Mode</button>';

    return (
      '<header class="kn-mcq-topbar">' +
        '<div class="kn-mcq-brand-wrap">' +
          '<div class="kn-mcq-brand-icon">📝</div>' +
          '<div>' +
            '<h1 class="kn-mcq-topbar-title">' + esc(title) + '</h1>' +
            '<div class="kn-mcq-topbar-sub">' + esc(sub) + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="kn-mcq-topbar-actions">' + actions + '</div>' +
      '</header>'
    );
  }

  // ── UI: Chapter Directory View ──────────────────────────────────────────
  function renderDirectoryView() {
    var totalQuestions = state.mcqs.length;
    var answeredCount = 0;
    var correctCount = 0;

    state.mcqs.forEach(function (m) {
      var a = state.answers[m.id];
      if (a) {
        answeredCount++;
        if (a.correct) correctCount++;
      }
    });

    var accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
    var bookmarkedCount = Object.keys(state.bookmarks).length;

    // In-progress test banner for interrupted/resumable exams
    var resumeBannerHTML = "";
    if (state.exam && state.exam.questions && state.exam.questions.length && !state.exam.isSubmitted) {
      var examAnsCount = Object.keys(state.exam.userAnswers || {}).length;
      var examTotalQ = state.exam.questions.length;
      resumeBannerHTML = (
        '<div class="kn-mcq-resume-banner" style="margin-bottom:20px; padding:16px 20px; background:linear-gradient(135deg, rgba(2,132,199,0.12), rgba(14,165,233,0.06)); border:1.5px solid rgba(2,132,199,0.3); border-radius:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">' +
          '<div style="display:flex; align-items:center; gap:12px;">' +
            '<span style="font-size:24px;">⏱️</span>' +
            '<div>' +
              '<div style="font-weight:800; font-size:15px; color:var(--text-primary,#0f172a);">In-Progress Mock Test Detected</div>' +
              '<div style="font-size:13px; color:var(--text-secondary,#475569);">' + esc(state.exam.title) + ' · ' + examAnsCount + ' of ' + examTotalQ + ' answered</div>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; gap:8px;">' +
            '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="resume-exam" style="font-weight:700;">Resume Test →</button>' +
            '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="discard-exam" style="color:var(--mcq-danger,#ef4444); background:transparent; border-color:rgba(239,68,68,0.3);">Discard</button>' +
          '</div>' +
        '</div>'
      );
    }

    // Hero & Stats
    var html = (
      resumeBannerHTML +
      '<section class="kn-mcq-hero">' +
        '<div class="kn-mcq-hero-badges">' +
          '<span class="kn-mcq-badge kn-mcq-badge--ch">🏥 CRITICAL CARE</span>' +
          '<span class="kn-mcq-badge kn-mcq-badge--exam">NEET-SS &amp; INI-SS</span>' +
          '<span class="kn-mcq-badge">2026 EVIDENCE REVISED</span>' +
        '</div>' +
        '<h2 class="kn-mcq-hero-title">Dedicated <span>NEET-SS / INI-SS</span> Question Platform</h2>' +
        '<p class="kn-mcq-hero-desc">' +
          'Comprehensive multi-chapter practice engine for MD/DNB Anaesthesia and Critical Care subspecialty aspirants. ' +
          'Solve chapter-wise authentic questions with why-wrong options, clinical pearls, and landmark citations, ' +
          'or configure timed custom tests tailored to your weak areas.' +
        '</p>' +
        '<div class="kn-mcq-hero-actions">' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="practice-all">Solve All ' + totalQuestions + ' MCQs</button>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-pyq" style="background: linear-gradient(135deg, #0284c7, #0369a1); box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35); font-weight:800;">🎯 NEET SS Critical Care PYQs (' + (state.mcqs.filter(isPYQ).length || 190) + ')</button>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-builder">⚡ Build Custom Mock Test</button>' +
          '<button type="button" class="kn-mcq-btn" data-action="practice-filter-view" data-view="bookmarks">⭐ Starred (' + bookmarkedCount + ')</button>' +
          '<button type="button" class="kn-mcq-btn" data-action="practice-filter-view" data-view="incorrect">❌ Mistakes (' + (answeredCount - correctCount) + ')</button>' +
        '</div>' +
      '</section>' +

      '<section class="kn-mcq-stats-strip">' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + totalQuestions + '</span><span class="kn-mcq-stat-label">Total Questions</span></div>' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:#0284c7;">' + (state.mcqs.filter(isPYQ).length || 190) + '</span><span class="kn-mcq-stat-label">PYQ Bank</span></div>' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + answeredCount + '</span><span class="kn-mcq-stat-label">Solved</span></div>' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:var(--mcq-success);">' + correctCount + '</span><span class="kn-mcq-stat-label">Correct</span></div>' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + accuracy + '%</span><span class="kn-mcq-stat-label">Accuracy</span></div>' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:#f59e0b;">' + bookmarkedCount + '</span><span class="kn-mcq-stat-label">Bookmarks</span></div>' +
      '</section>'
    );

    // Search and Filters Bar
    html += (
      '<div class="kn-mcq-filter-bar">' +
        '<div class="kn-mcq-filter-group" style="flex:1;">' +
          '<div class="kn-mcq-search-box">' +
            '<span class="kn-mcq-search-icon">🔍</span>' +
            '<input type="search" placeholder="Search chapters, topics, formulas..." id="knMcqDirSearch" value="' + esc(state.practiceFilter.search) + '">' +
          '</div>' +
        '</div>' +
        '<div class="kn-mcq-filter-group">' +
          '<select class="kn-mcq-select" id="knMcqDirExamFilter">' +
            '<option value="all">All Exams (NEET-SS &amp; INI-SS)</option>' +
            '<option value="NEET-SS-PYQ"' + (state.practiceFilter.exam === "NEET-SS-PYQ" ? " selected" : "") + '>🎯 NEET-SS PYQs (190 MCQs)</option>' +
            '<option value="NEET-SS-2025-RECALL"' + (state.practiceFilter.exam === "NEET-SS-2025-RECALL" ? " selected" : "") + '>🎯 NEET-SS 2025 Recall (76 MCQs)</option>' +
            '<option value="NEET-SS-2024-RECALL"' + (state.practiceFilter.exam === "NEET-SS-2024-RECALL" ? " selected" : "") + '>🎯 NEET-SS 2024 Recall (114 MCQs)</option>' +
            '<option value="NEET-SS"' + (state.practiceFilter.exam === "NEET-SS" ? " selected" : "") + '>NEET-SS Only</option>' +
            '<option value="INI-SS"' + (state.practiceFilter.exam === "INI-SS" ? " selected" : "") + '>INI-SS Only</option>' +
          '</select>' +
          '<select class="kn-mcq-select" id="knMcqDirDiffFilter">' +
            '<option value="all">All Difficulties</option>' +
            '<option value="easy"' + (state.practiceFilter.difficulty === "easy" ? " selected" : "") + '>Easy</option>' +
            '<option value="moderate"' + (state.practiceFilter.difficulty === "moderate" ? " selected" : "") + '>Moderate</option>' +
            '<option value="difficult"' + (state.practiceFilter.difficulty === "difficult" ? " selected" : "") + '>Difficult</option>' +
          '</select>' +
        '</div>' +
      '</div>'
    );

    // Chapter Cards Grid
    var chapterCounts = {};
    var chapterCorrect = {};
    state.mcqs.forEach(function (m) {
      var cid = m.chapterId;
      chapterCounts[cid] = (chapterCounts[cid] || 0) + 1;
      var a = state.answers[m.id];
      if (a && a.correct) {
        chapterCorrect[cid] = (chapterCorrect[cid] || 0) + 1;
      }
    });

    var sq = (state.practiceFilter.search || "").toLowerCase().trim();
    var filteredChapters = state.chapters.filter(function (c) {
      if (!chapterCounts[c.id]) return false;
      if (!sq) return true;
      var txt = (c.title + " " + c.description + " chapter " + c.id).toLowerCase();
      return txt.indexOf(sq) !== -1;
    });

    html += '<div class="kn-mcq-chapter-grid">';
    filteredChapters.forEach(function (c) {
      var count = chapterCounts[c.id] || 0;
      var corr = chapterCorrect[c.id] || 0;
      var chPct = count ? Math.round((corr / count) * 100) : 0;

      html += (
        '<div class="kn-mcq-chapter-card" data-action="open-chapter" data-chapter-id="' + c.id + '">' +
          '<div class="kn-mcq-chapter-card-head">' +
            '<div class="kn-mcq-chapter-icon">' + (c.icon || "📖") + '</div>' +
            '<div class="kn-mcq-chapter-info">' +
              '<div class="kn-mcq-ch-num">Chapter ' + String(c.id).padStart(2, "0") + '</div>' +
              '<h3 class="kn-mcq-ch-title">' + esc(c.title) + '</h3>' +
            '</div>' +
          '</div>' +
          '<p class="kn-mcq-chapter-desc">' + esc(c.description || "") + '</p>' +
          '<div class="kn-mcq-chapter-footer">' +
            '<div class="kn-mcq-ch-pill">' + count + ' MCQs ' + (corr > 0 ? '· ' + corr + ' Solved (' + chPct + '%)' : '') + '</div>' +
            '<span class="kn-mcq-ch-action-arrow">Solve Chapter →</span>' +
          '</div>' +
        '</div>'
      );
    });
    html += '</div>';

    return html;
  }

  // ── UI: Custom Test Builder ──
  function renderBuilderView() {
    var chaptersList = state.chapters.filter(function (c) {
      return state.mcqs.some(function (m) { return m.chapterId === c.id; });
    });

    var html = (
      '<div class="kn-mcq-builder-card">' +
        '<div class="kn-mcq-builder-header">' +
          '<h2 class="kn-mcq-builder-title">⚡ Configure Custom NEET-SS / INI-SS Mock Test</h2>' +
          '<p class="kn-mcq-builder-sub">Select your target exam, chapters, question count, and time limits. Questions are randomized without repetition.</p>' +
        '</div>' +
        (state.exam && state.exam.questions && state.exam.questions.length && !state.exam.isSubmitted ?
          '<div style="margin-bottom:16px; padding:12px 16px; background:rgba(2,132,199,0.08); border:1px solid rgba(2,132,199,0.25); border-radius:8px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">' +
            '<span style="font-size:13px; font-weight:700;">Notice: You have an in-progress test (' + esc(state.exam.title) + '). Creating a new test will replace it.</span>' +
            '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--primary" data-action="resume-exam">Resume Current Test →</button>' +
          '</div>' : '') +

        '<div class="kn-mcq-builder-grid">' +
          // 1. Target Exam
          '<div class="kn-mcq-builder-field">' +
            '<label class="kn-mcq-builder-label">Target Examination</label>' +
            '<div class="kn-mcq-chips-row" id="builderExamGroup">' +
              '<div class="kn-mcq-chip is-selected" data-val="all">Both (NEET-SS + INI-SS)</div>' +
              '<div class="kn-mcq-chip" data-val="NEET-SS">NEET-SS Only</div>' +
              '<div class="kn-mcq-chip" data-val="INI-SS">INI-SS Only</div>' +
            '</div>' +
          '</div>' +

          // 2. Question Count
          '<div class="kn-mcq-builder-field">' +
            '<label class="kn-mcq-builder-label">Question Count</label>' +
            '<div class="kn-mcq-chips-row" id="builderCountGroup">' +
              '<div class="kn-mcq-chip" data-val="10">10 Questions</div>' +
              '<div class="kn-mcq-chip is-selected" data-val="25">25 Questions</div>' +
              '<div class="kn-mcq-chip" data-val="50">50 Questions</div>' +
              '<div class="kn-mcq-chip" data-val="100">100 Questions</div>' +
            '</div>' +
          '</div>' +

          // 3. Difficulty
          '<div class="kn-mcq-builder-field">' +
            '<label class="kn-mcq-builder-label">Difficulty Filter</label>' +
            '<div class="kn-mcq-chips-row" id="builderDiffGroup">' +
              '<div class="kn-mcq-chip is-selected" data-val="all">All Difficulties</div>' +
              '<div class="kn-mcq-chip" data-val="easy">Easy</div>' +
              '<div class="kn-mcq-chip" data-val="moderate">Moderate</div>' +
              '<div class="kn-mcq-chip" data-val="difficult">Difficult</div>' +
            '</div>' +
          '</div>' +

          // 4. Timer
          '<div class="kn-mcq-builder-field">' +
            '<label class="kn-mcq-builder-label">Examination Timer</label>' +
            '<div class="kn-mcq-chips-row" id="builderTimerGroup">' +
              '<div class="kn-mcq-chip is-selected" data-val="0">No Timer (Untimed)</div>' +
              '<div class="kn-mcq-chip" data-val="60">1 Min / Question</div>' +
              '<div class="kn-mcq-chip" data-val="90">1.5 Min / Question</div>' +
              '<div class="kn-mcq-chip" data-val="120">2 Min / Question</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // 5. Chapter Selection Multi-select
        '<div class="kn-mcq-builder-field" style="margin-bottom:24px;">' +
          '<div class="kn-mcq-builder-label">' +
            '<span>Included Chapters (31 Core Disciplines)</span>' +
            '<div style="display:flex; gap:8px;">' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" id="btnSelectAllChaps">Select All</button>' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" id="btnClearAllChaps">Clear</button>' +
            '</div>' +
          '</div>' +
          '<div class="kn-mcq-multiselect-box" id="builderChapsBox">'
    );

    chaptersList.forEach(function (c) {
      var qCount = state.mcqs.filter(function (m) { return m.chapterId === c.id; }).length;
      html += (
        '<label class="kn-mcq-check-row">' +
          '<input type="checkbox" name="builder_chapter" value="' + c.id + '" checked>' +
          '<span>Ch ' + String(c.id).padStart(2, "0") + ' · ' + esc(c.title) + ' (' + qCount + ' MCQs)</span>' +
        '</label>'
      );
    });

    html += (
          '</div>' +
        '</div>' +

        '<div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap;">' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" id="btnLaunchCustomTest" style="font-size:15px; padding:12px 28px;">🚀 Launch Examination Now</button>' +
          '<button type="button" class="kn-mcq-btn" data-action="go-directory">Cancel</button>' +
        '</div>' +
      '</div>'
    );

    return html;
  }

  // ── UI: Single Practice Card View (Immediate Learning Feedback) ──
  function renderPracticeView() {
    var list = state.practiceList;
    var total = list.length;

    if (!total) {
      var isTopicFiltered = !!state.practiceFilter.topicId;
      var chId = state.practiceFilter.chapterId;
      var chCount = 0;
      if (chId) {
        chCount = state.mcqs.filter(function (m) {
          return String(m.chapterId) === String(chId);
        }).length;
      }

      var emptyTitle = isTopicFiltered
        ? "No topic-specific MCQs yet"
        : "No questions match your current filters";
      var emptyMsg = isTopicFiltered
        ? "Questions for this topic have not been added to the question bank yet. You can practice related questions from this chapter or explore the full question directory."
        : "Try clearing filters, switching chapters, or resetting search to view available MCQs.";

      var chapterBtnHTML = "";
      if (chId && chCount > 0) {
        chapterBtnHTML = (
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="practice-chapter" data-chapter-id="' + esc(chId) + '">' +
            'Practice Chapter ' + esc(chId) + ' MCQs (' + chCount + ' questions)' +
          '</button>'
        );
      }

      return (
        '<div class="kn-mcq-empty-box">' +
          '<div class="kn-mcq-empty-icon">📝</div>' +
          '<h3 class="kn-mcq-empty-title">' + esc(emptyTitle) + '</h3>' +
          '<p class="kn-mcq-empty-desc">' + esc(emptyMsg) + '</p>' +
          '<div class="kn-mcq-empty-actions">' +
            chapterBtnHTML +
            '<button type="button" class="kn-mcq-btn" data-action="go-directory">Browse All Chapters</button>' +
            '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-builder">⚡ Build Custom Mock Test</button>' +
            '<button type="button" class="kn-mcq-btn" data-action="exit-to-study">← Return to Study Mode</button>' +
          '</div>' +
        '</div>'
      );
    }

    var m = list[state.practiceIndex];
    var isStarred = !!state.bookmarks[m.id];
    var ans = state.answers[m.id];
    var cIdx = correctIndex(m);

    // Filter controls
    var chapterSelectOpts = '<option value="">All Chapters (' + state.mcqs.length + ' MCQs)</option>';
    state.chapters.forEach(function (c) {
      var cnt = state.mcqs.filter(function (x) { return x.chapterId === c.id; }).length;
      if (!cnt) return;
      var sel = String(state.practiceFilter.chapterId) === String(c.id) ? " selected" : "";
      chapterSelectOpts += '<option value="' + c.id + '"' + sel + '>Ch ' + c.id + ' · ' + esc(c.title) + ' (' + cnt + ')</option>';
    });

    var topicBadgeHTML = "";
    if (state.practiceFilter.topicId) {
      var tpVal = state.practiceFilter.topicId;
      var tpName = Array.isArray(tpVal) ? (tpVal.length === 1 ? topicTitle(tpVal[0]) : tpVal.length + " Subtopics") : topicTitle(tpVal);
      topicBadgeHTML = (
        '<span class="kn-mcq-badge kn-mcq-badge--topic" style="font-size:12px; padding:6px 12px; font-weight:700;">' +
          'Topic Filter: ' + esc(tpName) + ' (' + total + ' MCQs)' +
        '</span>' +
        (state.practiceFilter.chapterId ? '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="practice-chapter" data-chapter-id="' + esc(state.practiceFilter.chapterId) + '" title="View all questions in this chapter">All Chapter MCQs</button>' : '')
      );
    }

    var pyqBanner = '';
    if (state.practiceFilter.view === "pyq") {
      var pExam = state.pyq.exam || "NEET-SS";
      var pyqYearLabel = "";
      if (pExam === "INI-CET-SS-2026") {
        pyqYearLabel = "April 2026 Session";
      } else if (pExam === "INI-SS") {
        pyqYearLabel = "November 2025 Session";
      } else {
        pyqYearLabel = state.pyq.year === "all" ? "All Years (2024 & 2025)" : ("Year " + state.pyq.year);
      }
      var bannerExamIcon = pExam === "INI-CET-SS-2026" ? "⭐ INI-CET SS" : (pExam === "INI-SS" ? "🏛️ INI-SS" : "🎯 NEET-SS");
      pyqBanner = (
        '<div class="kn-pyq-banner-bar">' +
          '<span>' + bannerExamIcon + ' Critical Care PYQs · ' + esc(pyqYearLabel) + ' (' + total + ' Questions)</span>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="pyq-return-to-explorer">🗂️ Switch to Topic Explorer</button>' +
        '</div>'
      );
    }

    var html = (
      pyqBanner +
      '<div class="kn-mcq-filter-bar">' +
        '<div class="kn-mcq-filter-group" style="flex:1; flex-wrap:wrap; gap:8px;">' +
          '<select class="kn-mcq-select" id="knPracticeChapSelect">' + chapterSelectOpts + '</select>' +
          (state.practiceFilter.chapterId || state.practiceFilter.topicId ? '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="practice-all" title="View all questions across all chapters">View All MCQs (' + state.mcqs.length + ')</button>' : '') +
          topicBadgeHTML +
          '<select class="kn-mcq-select" id="knPracticeViewSelect">' +
            '<option value="all"' + (state.practiceFilter.view === "all" ? " selected" : "") + '>All Questions (' + state.mcqs.length + ')</option>' +
            '<option value="pyq"' + (state.practiceFilter.view === "pyq" ? " selected" : "") + '>' +
              (state.pyq.exam === 'INI-CET-SS-2026' ? '⭐ INI-CET SS PYQs (April 2026 · ' + countIniCet2026 + ')' :
                (state.pyq.exam === 'INI-SS' ? '🏛️ INI-SS PYQs (Nov 2025 · ' + countIniAll + ')' :
                  ('🎯 NEET-SS PYQs (' + (state.pyq.year === 'all' ? 'All Years · ' + countNeetAll : (state.pyq.year === '2025' ? '2025 · ' + countNeet2025 : '2024 · ' + countNeet2024)) + ')')
                )
              ) +
            '</option>' +
            '<option value="bookmarks"' + (state.practiceFilter.view === "bookmarks" ? " selected" : "") + '>⭐ Bookmarked (' + Object.keys(state.bookmarks).length + ')</option>' +
            '<option value="incorrect"' + (state.practiceFilter.view === "incorrect" ? " selected" : "") + '>❌ Mistakes</option>' +
          '</select>' +
        '</div>' +
        '<div class="kn-mcq-filter-group">' +
          '<span style="font-size:13px; font-weight:750; color:var(--text-secondary);">' +
            'Question ' + (state.practiceIndex + 1) + ' of ' + total +
          '</span>' +
        '</div>' +
      '</div>' +

      '<article class="kn-mcq-qcard">' +
        '<div class="kn-mcq-qhead">' +
          '<div class="kn-mcq-badges">' +
            '<span class="kn-mcq-badge kn-mcq-badge--ch">Ch ' + m.chapterId + ' · ' + esc(chapterTitle(m.chapterId)) + '</span>' +
            '<span class="kn-mcq-badge kn-mcq-badge--topic">' + esc(topicTitle(m.topicId)) + '</span>' +
            '<span class="kn-mcq-badge kn-mcq-badge--diff" data-diff="' + esc(m.difficulty) + '">' + esc(m.difficulty) + '</span>' +
            (isPYQ(m) ?
              (getPYQExam(m) === "INI-CET-SS-2026" ?
                '<span class="kn-mcq-badge kn-mcq-badge--recall" style="background:#0d9488; color:#fff; font-weight:800; border-color:#14b8a6;">INI-CET SS April 2026</span>' :
                (getPYQExam(m) === "INI-SS" ?
                  '<span class="kn-mcq-badge kn-mcq-badge--recall" style="background:#4338ca; color:#fff; font-weight:800; border-color:#6366f1;">INI-SS CC Nov 2025</span>' :
                  '<span class="kn-mcq-badge kn-mcq-badge--recall" style="background:#0284c7; color:#fff; font-weight:800; border-color:#38bdf8;">' + (m.year === 2024 ? 'NEET SS CC 2024' : 'NEET SS CC 2025') + '</span>'
                )
              ) +
              '<span class="kn-mcq-badge" style="background:rgba(56,189,248,0.12); color:#0284c7; font-weight:700;">' + (m.question_status === 'exact_recall' ? '🎯 Exact Recall' : '🔬 Reconstructed') + '</span>' +
              '<span class="kn-mcq-badge" style="background:rgba(16,185,129,0.12); color:#059669; font-weight:700;">✓ Verified</span>' +
              '<span class="kn-mcq-badge" style="color:var(--text-secondary); font-size:10.5px;">' + (m.recall_confidence ? esc(m.recall_confidence) : 'Verified') + '</span>'
              : '<span class="kn-mcq-badge kn-mcq-badge--exam">' + esc(m.exam) + (m.year ? ' ' + m.year : '') + '</span>'
            ) +
          '</div>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="toggle-bookmark" data-id="' + m.id + '">' +
            (isStarred ? '★ Bookmarked' : '☆ Bookmark') +
          '</button>' +
        '</div>' +

        '<p class="kn-mcq-stem">' + esc(m.question) + '</p>' +

        '<div class="kn-mcq-options" role="group" aria-label="Options">'
    );

    m.options.forEach(function (opt, i) {
      var cls = "kn-mcq-opt";
      var mark = "";
      if (ans) {
        if (i === cIdx) {
          cls += " is-correct";
          mark = '<span class="kn-mcq-opt-mark" style="color:var(--mcq-success);">✓</span>';
        } else if (i === ans.selected) {
          cls += " is-wrong";
          mark = '<span class="kn-mcq-opt-mark" style="color:var(--mcq-danger);">✗</span>';
        }
      }

      html += (
        '<button type="button" class="' + cls + '" data-action="select-practice-option" data-idx="' + i + '"' + (ans ? ' disabled' : '') + '>' +
          '<span class="kn-mcq-opt-letter">' + letterAt(i) + '</span>' +
          '<span class="kn-mcq-opt-text">' + esc(opt) + '</span>' +
          mark +
        '</button>'
      );
    });

    html += '</div>';

    // Rationale section once answered
    if (ans) {
      var correctText = (cIdx >= 0 && m.options && m.options[cIdx])
        ? letterAt(cIdx) + ". " + m.options[cIdx]
        : (m.answer || "(Unspecified)");
      var bannerClass = ans.correct ? "is-correct" : "is-wrong";
      var bannerIcon = ans.correct ? "✓" : "✗";
      var bannerMsg = ans.correct
        ? "<strong>Correct!</strong> Well done."
        : "<strong>Incorrect.</strong> You chose " + letterAt(ans.selected) + ". Correct: <strong>" + esc(correctText) + "</strong>";

      html += (
        '<div class="kn-mcq-feedback">' +
          '<div class="kn-mcq-banner-result ' + bannerClass + '">' +
            '<span style="font-size:18px; font-weight:800;">' + bannerIcon + '</span>' +
            '<div>' + bannerMsg + '</div>' +
          '</div>' +

          '<div class="kn-mcq-sec-box">' +
            '<div class="kn-mcq-sec-title">📖 Comprehensive Clinical Explanation</div>' +
            '<p>' + esc(m.explanation) + '</p>' +
          '</div>'
      );

      // Answer verification note for recall questions
      if (m.answer_verification_note) {
        html += (
          '<div class="kn-mcq-verification-box" style="margin-top:14px; padding:12px 16px; border-radius:12px; background:rgba(2,132,199,0.06); border-left:4px solid #0284c7; font-size:13px; color:var(--text-main, #1e293b); line-height:1.5;">' +
            '<strong style="color:#0284c7;">✓ Answer Verification:</strong> ' + esc(m.answer_verification_note) +
            (m.speaker_answer && m.speaker_answer !== m.verified_answer ? '<div style="margin-top:4px; font-size:12px; color:var(--text-muted);"><em>Speaker recall draft: ' + esc(m.speaker_answer) + '</em></div>' : '') +
          '</div>'
        );
      }

      // Why Wrong
      var wrongKeys = Object.keys(m.whyWrong || {}).sort();
      if (wrongKeys.length) {
        html += (
          '<div class="kn-mcq-sec-box">' +
            '<div class="kn-mcq-sec-title">❌ Why Other Options Are Wrong</div>' +
            '<ul class="kn-mcq-why-list">'
        );
        wrongKeys.forEach(function (k) {
          var optIdx = k.charCodeAt(0) - 65;
          var isUserPick = ans.selected === optIdx;
          html += (
            '<li class="' + (isUserPick ? 'is-user-pick' : '') + '">' +
              '<strong>Option ' + esc(k) + (isUserPick ? ' (Your Pick)' : '') + ':</strong> ' +
              esc(m.whyWrong[k]) +
            '</li>'
          );
        });
        html += '</ul></div>';
      }

      // Exam Pearl
      if (m.examPearl) {
        html += (
          '<div class="kn-mcq-pearl-box">' +
            '<span class="kn-mcq-pearl-label">💡 NEET-SS Examination Pearl</span>' +
            '<p style="white-space:pre-line;">' + esc(m.examPearl) + '</p>' +
          '</div>'
        );
      }

      // Links: Study This Topic + External Citation
      html += (
        '<div class="kn-mcq-links-row">' +
          '<a href="' + esc(getStudyLink(m.topicId, m.chapterId)) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-study-link">' +
            '📚 Study This Topic in Knockout Notes ↗' +
          '</a>'
      );

      var refClean = getSanitizedReference(m.hyperlinkedReference);
      var validRefUrl = refClean.url;
      var validRefLabel = refClean.label;

      if (validRefUrl && validRefLabel) {
        html += (
          '<a href="' + esc(validRefUrl) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-ref-link">' +
            '📄 Reference: ' + esc(validRefLabel) + ' ↗' +
          '</a>'
        );
      } else if (validRefLabel) {
        var isGuideline = validRefLabel.toLowerCase().indexOf("guideline") !== -1 || validRefLabel.toLowerCase().indexOf("surviving sepsis") !== -1 || validRefLabel.toLowerCase().indexOf("consensus") !== -1;
        var badgePrefix = isGuideline ? "📄 Guideline: " : "📄 Reference: ";
        html += '<span class="kn-mcq-badge" style="padding:6px 12px; font-size:12px;">' + badgePrefix + esc(validRefLabel) + '</span>';
      }
      html += '</div></div>';
    }

    html += '</article>';

    // Bottom Navigation Bar
    html += (
      '<div class="kn-mcq-bottombar">' +
        '<button type="button" class="kn-mcq-btn" data-action="prev-practice"' + (state.practiceIndex <= 0 ? ' disabled' : '') + '>← Previous</button>' +
        '<div style="display:flex; gap:8px;">' +
          '<button type="button" class="kn-mcq-btn" data-action="go-directory">Directory</button>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-builder">⚡ Mock Test</button>' +
        '</div>' +
        '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="next-practice"' + (state.practiceIndex >= total - 1 ? ' disabled' : '') + '>Next →</button>' +
      '</div>'
    );

    return html;
  }

  // ── UI: Live Examination Interface ──
  function renderExamView() {
    var exam = state.exam;
    var total = exam.questions.length;
    var currentQ = exam.questions[exam.currentIndex];
    var isMarked = !!exam.markedForReview[currentQ.id];
    var currentAnswer = exam.userAnswers[currentQ.id];

    // Format timer
    var timerStr = "Untimed";
    if (exam.timerDuration > 0) {
      var mins = Math.floor(exam.timerRemaining / 60);
      var secs = exam.timerRemaining % 60;
      timerStr = (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
    }

    var answeredCount = Object.keys(exam.userAnswers).length;

    var html = (
      '<div class="kn-mcq-exam-header">' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
          '<span style="font-weight:800; font-size:15px;">' + esc(exam.title) + '</span>' +
          '<span class="kn-mcq-badge">' + (exam.currentIndex + 1) + ' / ' + total + '</span>' +
          '<span class="kn-mcq-badge" style="background:var(--mcq-success-bg); color:var(--mcq-success);">' + answeredCount + ' Answered</span>' +
          (exam.insufficientNotice ? '<span class="kn-mcq-badge" style="background:rgba(245,158,11,0.12); color:#d97706; font-size:11px;">' + esc(exam.insufficientNotice) + '</span>' : '') +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:10px;">' +
          '<div class="kn-mcq-timer-badge">⏱ ' + timerStr + '</div>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" id="btnTogglePalette">' +
            (state.paletteOpen ? 'Hide Grid ▲' : 'Question Grid ▼') +
          '</button>' +
        '</div>' +
      '</div>'
    );

    // Question Grid / Palette Drawer
    if (state.paletteOpen) {
      html += (
        '<div class="kn-mcq-palette-drawer">' +
          '<div class="kn-mcq-palette-grid">'
      );
      exam.questions.forEach(function (q, idx) {
        var cls = "kn-mcq-palette-btn";
        if (idx === exam.currentIndex) cls += " is-active";
        if (exam.markedForReview[q.id]) cls += " is-review";
        else if (exam.userAnswers[q.id] !== undefined) cls += " is-answered";

        html += '<button type="button" class="' + cls + '" data-action="jump-exam-q" data-idx="' + idx + '">' + (idx + 1) + '</button>';
      });
      html += (
          '</div>' +
          '<div class="kn-mcq-palette-legend">' +
            '<span><span class="kn-mcq-legend-dot" style="background:var(--mcq-success);"></span>Answered</span>' +
            '<span><span class="kn-mcq-legend-dot" style="background:#f59e0b;"></span>Marked for Review</span>' +
            '<span><span class="kn-mcq-legend-dot" style="background:var(--bg-surface); border:1px solid #94a3b8;"></span>Not Answered</span>' +
          '</div>' +
        '</div>'
      );
    }

    // Active Question Card
    html += (
      '<article class="kn-mcq-qcard">' +
        '<div class="kn-mcq-qhead">' +
          '<div class="kn-mcq-badges">' +
            '<span class="kn-mcq-badge kn-mcq-badge--ch">Ch ' + currentQ.chapterId + ' · ' + esc(chapterTitle(currentQ.chapterId)) + '</span>' +
            '<span class="kn-mcq-badge kn-mcq-badge--diff" data-diff="' + esc(currentQ.difficulty) + '">' + esc(currentQ.difficulty) + '</span>' +
            (currentQ.sourceType === "neet-ss-2025-recall" || (currentQ.id && currentQ.id.indexOf("NEETSS-CC-2025-") !== -1) ?
              '<span class="kn-mcq-badge kn-mcq-badge--recall" style="background:#0284c7; color:#fff; font-weight:800; border-color:#38bdf8;">NEET SS CC 2025</span>'
              : '<span class="kn-mcq-badge kn-mcq-badge--exam">' + esc(currentQ.exam) + '</span>'
            ) +
          '</div>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="toggle-exam-review">' +
            (isMarked ? '🚩 Marked for Review' : '⚐ Mark for Review') +
          '</button>' +
        '</div>' +

        '<p class="kn-mcq-stem">' + esc(currentQ.question) + '</p>' +

        '<div class="kn-mcq-options" role="group" aria-label="Options">'
    );

    currentQ.options.forEach(function (opt, i) {
      var isPicked = currentAnswer === i;
      var cls = "kn-mcq-opt" + (isPicked ? " is-selected" : "");
      html += (
        '<button type="button" class="' + cls + '" data-action="select-exam-option" data-idx="' + i + '">' +
          '<span class="kn-mcq-opt-letter">' + letterAt(i) + '</span>' +
          '<span class="kn-mcq-opt-text">' + esc(opt) + '</span>' +
          (isPicked ? '<span class="kn-mcq-opt-mark" style="color:var(--accent-cyan);">●</span>' : '') +
        '</button>'
      );
    });

    html += (
        '</div>' +
      '</article>' +

      '<div class="kn-mcq-bottombar">' +
        '<button type="button" class="kn-mcq-btn" data-action="prev-exam-q"' + (exam.currentIndex <= 0 ? ' disabled' : '') + '>← Previous</button>' +
        '<button type="button" class="kn-mcq-btn kn-mcq-btn--danger" data-action="submit-exam">Submit Test</button>' +
        '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="next-exam-q"' + (exam.currentIndex >= total - 1 ? ' disabled' : '') + '>Next →</button>' +
      '</div>'
    );

    return html;
  }

  // ── UI: Test Results Scorecard & Diagnostic ──
  function renderResultsView() {
    var exam = state.exam;
    var res = exam.results;
    if (!res) return '<div class="kn-mcq-qcard">No results available.</div>';

    var html = (
      '<div class="kn-mcq-result-card">' +
        '<div class="kn-mcq-result-hero">' +
          '<div class="kn-mcq-score-dial">' +
            '<span class="kn-mcq-score-pct">' + res.percent + '%</span>' +
            '<span class="kn-mcq-score-sub">Accuracy</span>' +
          '</div>' +
          '<div class="kn-mcq-result-meta">' +
            '<h3>' + esc(res.headline) + '</h3>' +
            '<p>' + esc(res.feedback) + '</p>' +
            '<div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="review-all">Review All (' + res.total + ')</button>' +
              (res.incorrect > 0 ? '<button type="button" class="kn-mcq-btn kn-mcq-btn--danger" data-action="review-incorrect">Review ' + res.incorrect + ' Mistakes</button>' : '') +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-builder">⚡ Re-test</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="kn-mcq-stats-strip">' +
          '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + res.total + '</span><span class="kn-mcq-stat-label">Total Questions</span></div>' +
          '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:var(--mcq-success);">' + res.correct + '</span><span class="kn-mcq-stat-label">Correct</span></div>' +
          '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:var(--mcq-danger);">' + res.incorrect + '</span><span class="kn-mcq-stat-label">Incorrect</span></div>' +
          '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val" style="color:#64748b;">' + res.unanswered + '</span><span class="kn-mcq-stat-label">Unanswered</span></div>' +
          '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + res.score + ' / ' + res.total + '</span><span class="kn-mcq-stat-label">Raw Score</span></div>' +
        '</div>'
    );

    // Chapter-wise Performance Breakdown
    if (res.chapterBreakdown && res.chapterBreakdown.length) {
      html += (
        '<h3 style="margin:24px 0 12px 0; font-size:17px; font-weight:800;">Chapter-wise Performance Breakdown</h3>' +
        '<div class="kn-mcq-table-wrap">' +
          '<table class="kn-mcq-table">' +
            '<thead>' +
              '<tr>' +
                '<th>Chapter</th>' +
                '<th>Questions</th>' +
                '<th>Correct</th>' +
                '<th>Accuracy</th>' +
                '<th>Action</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>'
      );

      res.chapterBreakdown.forEach(function (row) {
        var pct = row.total ? Math.round((row.correct / row.total) * 100) : 0;
        var color = pct >= 75 ? "var(--mcq-success)" : pct >= 50 ? "var(--accent-cyan)" : "var(--mcq-danger)";
        html += (
          '<tr>' +
            '<td><strong>Ch ' + row.chapterId + '</strong> · ' + esc(row.title) + '</td>' +
            '<td>' + row.total + '</td>' +
            '<td>' + row.correct + '</td>' +
            '<td><strong style="color:' + color + ';">' + pct + '%</strong></td>' +
            '<td><button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="practice-chapter" data-chapter-id="' + row.chapterId + '">Practice Chapter</button></td>' +
          '</tr>'
        );
      });
      html += '</tbody></table></div>';
    }

    // Weak Topics Diagnosed
    if (res.weakTopics && res.weakTopics.length) {
      html += (
        '<h3 style="margin:24px 0 12px 0; font-size:17px; font-weight:800; color:var(--mcq-danger);">⚠️ Weak Areas Diagnosed (Study Recommended)</h3>' +
        '<div style="display:flex; flex-direction:column; gap:8px;">'
      );
      res.weakTopics.forEach(function (wt) {
        html += (
          '<div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:12px; background:var(--bg-surface); border:1px solid var(--border-subtle); flex-wrap:wrap; gap:8px;">' +
            '<div>' +
              '<strong>' + esc(wt.title) + '</strong> ' +
              '<span style="font-size:12px; color:var(--text-muted);">(Ch ' + wt.chapterId + ')</span>' +
            '</div>' +
            '<a href="' + esc(getStudyLink(wt.topicId, wt.chapterId)) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--primary">📖 Study Topic in Knockout Notes ↗</a>' +
          '</div>'
        );
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  // ── UI: Post-Test Review Mode ──
  function renderReviewView() {
    var exam = state.exam;
    var list = exam.reviewList || exam.questions;
    var total = list ? list.length : 0;
    if (!total) {
      return (
        '<div class="kn-mcq-empty-box" style="margin:40px auto; max-width:540px;">' +
          '<div class="kn-mcq-empty-icon">✅</div>' +
          '<h3 class="kn-mcq-empty-title">No Questions in this Review Category</h3>' +
          '<p class="kn-mcq-empty-desc">You answered all questions correctly in this section.</p>' +
          '<div class="kn-mcq-empty-actions">' +
            '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="go-results">← Back to Scorecard</button>' +
            '<button type="button" class="kn-mcq-btn" data-action="review-all">Review All Questions</button>' +
          '</div>' +
        '</div>'
      );
    }
    var idx = exam.reviewIndex || 0;
    if (idx >= total) idx = 0;
    var m = list[idx];
    var userPick = exam.userAnswers[m.id];
    var cIdx = correctIndex(m);

    var html = (
      '<div class="kn-mcq-filter-bar">' +
        '<div class="kn-mcq-filter-group">' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="go-results">← Back to Scorecard</button>' +
          '<span style="font-size:13px; font-weight:800;">Reviewing ' + (idx + 1) + ' of ' + total + '</span>' +
        '</div>' +
        '<div class="kn-mcq-filter-group">' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="review-all">All</button>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--danger kn-mcq-btn--sm" data-action="review-incorrect">Mistakes</button>' +
        '</div>' +
      '</div>' +

      '<article class="kn-mcq-qcard">' +
        '<div class="kn-mcq-qhead">' +
          '<div class="kn-mcq-badges">' +
            '<span class="kn-mcq-badge kn-mcq-badge--ch">Ch ' + m.chapterId + ' · ' + esc(chapterTitle(m.chapterId)) + '</span>' +
            '<span class="kn-mcq-badge kn-mcq-badge--topic">' + esc(topicTitle(m.topicId)) + '</span>' +
            '<span class="kn-mcq-badge kn-mcq-badge--diff" data-diff="' + esc(m.difficulty) + '">' + esc(m.difficulty) + '</span>' +
            (m.sourceType === "neet-ss-2025-recall" || (m.id && m.id.indexOf("NEETSS-CC-2025-") !== -1) ?
              '<span class="kn-mcq-badge kn-mcq-badge--recall" style="background:#0284c7; color:#fff; font-weight:800; border-color:#38bdf8;">NEET SS CC 2025</span>'
              : '<span class="kn-mcq-badge kn-mcq-badge--exam">' + esc(m.exam) + '</span>'
            ) +
          '</div>' +
        '</div>' +

        '<p class="kn-mcq-stem">' + esc(m.question) + '</p>' +

        '<div class="kn-mcq-options">'
    );

    m.options.forEach(function (opt, i) {
      var cls = "kn-mcq-opt";
      var mark = "";
      if (i === cIdx) {
        cls += " is-correct";
        mark = '<span class="kn-mcq-opt-mark" style="color:var(--mcq-success);">✓ (Correct)</span>';
      } else if (userPick === i) {
        cls += " is-wrong";
        mark = '<span class="kn-mcq-opt-mark" style="color:var(--mcq-danger);">✗ (Your Answer)</span>';
      }

      html += (
        '<div class="' + cls + '" style="cursor:default;">' +
          '<span class="kn-mcq-opt-letter">' + letterAt(i) + '</span>' +
          '<span class="kn-mcq-opt-text">' + esc(opt) + '</span>' +
          mark +
        '</div>'
      );
    });

    html += '</div>';

    // Rationale
    html += (
      '<div class="kn-mcq-feedback">' +
        '<div class="kn-mcq-sec-box">' +
          '<div class="kn-mcq-sec-title">📖 Comprehensive Clinical Explanation</div>' +
          '<p>' + esc(m.explanation) + '</p>' +
        '</div>'
    );

    var wrongKeys = Object.keys(m.whyWrong || {}).sort();
    if (wrongKeys.length) {
      html += (
        '<div class="kn-mcq-sec-box">' +
          '<div class="kn-mcq-sec-title">❌ Why Other Options Are Wrong</div>' +
          '<ul class="kn-mcq-why-list">'
      );
      wrongKeys.forEach(function (k) {
        var optIdx = k.charCodeAt(0) - 65;
        var isUserPick = userPick === optIdx;
        html += (
          '<li class="' + (isUserPick ? 'is-user-pick' : '') + '">' +
            '<strong>Option ' + esc(k) + (isUserPick ? ' (Your Pick)' : '') + ':</strong> ' +
            esc(m.whyWrong[k]) +
          '</li>'
        );
      });
      html += '</ul></div>';
    }

    if (m.examPearl) {
      html += (
        '<div class="kn-mcq-pearl-box">' +
          '<span class="kn-mcq-pearl-label">💡 NEET-SS Examination Pearl</span>' +
          '<p>' + esc(m.examPearl) + '</p>' +
        '</div>'
      );
    }

    html += (
      '<div class="kn-mcq-links-row">' +
        '<a href="' + esc(getStudyLink(m.topicId, m.chapterId)) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-study-link">' +
          '📚 Study This Topic in Knockout Notes ↗' +
        '</a>'
    );
    var refCleanReview = getSanitizedReference(m.hyperlinkedReference);
    var validRefUrlReview = refCleanReview.url;
    var validRefLabelReview = refCleanReview.label;

    if (validRefUrlReview && validRefLabelReview) {
      html += (
        '<a href="' + esc(validRefUrlReview) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-ref-link">' +
          '📄 Reference: ' + esc(validRefLabelReview) + ' ↗' +
        '</a>'
      );
    } else if (validRefLabelReview) {
      var isGuidelineRev = validRefLabelReview.toLowerCase().indexOf("guideline") !== -1 || validRefLabelReview.toLowerCase().indexOf("surviving sepsis") !== -1 || validRefLabelReview.toLowerCase().indexOf("consensus") !== -1;
      var badgePrefixRev = isGuidelineRev ? "📄 Guideline: " : "📄 Reference: ";
      html += '<span class="kn-mcq-badge" style="padding:6px 12px; font-size:12px;">' + badgePrefixRev + esc(validRefLabelReview) + '</span>';
    }
    html += '</div></div></article>';

    // Bottom Navigation
    html += (
      '<div class="kn-mcq-bottombar">' +
        '<button type="button" class="kn-mcq-btn" data-action="prev-review"' + (idx <= 0 ? ' disabled' : '') + '>← Previous</button>' +
        '<button type="button" class="kn-mcq-btn" data-action="go-results">Back to Results</button>' +
        '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="next-review"' + (idx >= total - 1 ? ' disabled' : '') + '>Next →</button>' +
      '</div>'
    );

    return html;
  }


  // ── UI: PYQ Explorer View (Matching Knockout V03 Screenshot Reference) ───────
  function getFilteredPYQs() {
    var exam = state.pyq.exam || "NEET-SS";
    var yr = state.pyq.year;
    var sq = (state.pyq.search || "").trim().toLowerCase();
    var tp = state.pyq.topic;

    return state.mcqs.filter(function (m) {
      if (!isPYQ(m)) return false;
      var qExam = getPYQExam(m);
      if (exam !== "all" && qExam !== exam) return false;

      var qYr = getPYQYear(m);
      if (exam === "NEET-SS") {
        if (yr === "2025" && qYr !== 2025) return false;
        if (yr === "2024" && qYr !== 2024) return false;
      }
      if (tp && tp !== "all" && getPYQTopic(m) !== tp) return false;
      if (sq) {
        var tagStr = (m.tags || []).join(" ");
        var qText = (m.question + " " + (m.options || []).join(" ") + " " + (m.explanation || "") + " " + tagStr + " " + (m.concept_tested || "") + " " + (m.examPearl || "")).toLowerCase();
        if (qText.indexOf(sq) === -1) return false;
      }
      return true;
    });
  }

  function getPYQTopicCounts() {
    var exam = state.pyq.exam || "NEET-SS";
    var yr = state.pyq.year;
    var counts = { "all": 0 };
    state.mcqs.forEach(function (m) {
      if (!isPYQ(m)) return;
      var qExam = getPYQExam(m);
      if (exam !== "all" && qExam !== exam) return;

      var qYr = getPYQYear(m);
      if (exam === "NEET-SS") {
        if (yr === "2025" && qYr !== 2025) return;
        if (yr === "2024" && qYr !== 2024) return;
      }
      counts["all"]++;
      var t = getPYQTopic(m);
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }

  function renderPyqCardsHTML(filtered) {
    if (!filtered.length) {
      return (
        '<div class="kn-mcq-empty-box" style="padding:40px 20px;">' +
          '<div class="kn-mcq-empty-icon">🔍</div>' +
          '<h3 class="kn-mcq-empty-title">No questions found</h3>' +
          '<p class="kn-mcq-empty-desc">No recall questions match your active topic or search filters for Year ' + esc(state.pyq.year) + '.</p>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="pyq-clear-search">Reset Topic &amp; Search</button>' +
        '</div>'
      );
    }

    var start = state.pyq.page * state.pyq.pageSize;
    var end = Math.min(start + state.pyq.pageSize, filtered.length);
    var paged = filtered.slice(start, end);

    var html = '<div class="kn-pyq-cards-list" id="knPyqCardsContainer">';
    paged.forEach(function (m, idx) {
      var isExpanded = !!state.pyq.expanded[m.id];
      var ans = state.answers[m.id];
      var isAnswered = !!ans;
      var cIdx = correctIndex(m);
      var topicName = getPYQTopic(m);
      var qYear = getPYQYear(m);

      var confText = m.recall_confidence || "Verified";
      if (confText === "high") confText = "🎯 High Recall Confidence";
      else if (confText === "moderate") confText = "🔬 Moderate Recall Confidence";
      else if (confText === "verified") confText = "✓ Verified Recall";
      var confClass = (confText.indexOf("100%") !== -1 || confText.toLowerCase().indexOf("high") !== -1) ? "high" : "verified";

      // Question ID / number label
      var qNumLabel = "Q" + (start + idx + 1);
      if (m.number) qNumLabel = "Q" + m.number;
      else if (m.id && m.id.indexOf("-R") !== -1) qNumLabel = "R" + m.id.split("-R")[1];
      else if (m.id && m.id.indexOf("-Q") !== -1) qNumLabel = "Q" + m.id.split("-Q")[1];

      html += (
        '<div class="kn-pyq-card ' + (isExpanded ? 'is-expanded' : '') + '" data-id="' + esc(m.id) + '">' +
          '<div class="kn-pyq-card-header" data-action="pyq-toggle-card" data-id="' + esc(m.id) + '" role="button" tabindex="0" aria-expanded="' + isExpanded + '" aria-label="Toggle details for ' + esc(qNumLabel) + '">' +
            '<div class="kn-pyq-badges-row">' +
              '<div class="kn-pyq-badges-left">' +
                '<span class="kn-pyq-badge kn-pyq-badge--qnum">' + esc(qNumLabel) + '</span>' +
                '<span class="kn-pyq-badge kn-pyq-badge--topic">' + esc(topicName) + '</span>' +
                '<span class="kn-pyq-badge kn-pyq-badge--year">' + qYear + '</span>' +
              '</div>' +
              '<div class="kn-pyq-badges-right">' +
                '<span class="kn-pyq-badge kn-pyq-badge--conf ' + confClass + '">' + esc(confText) + '</span>' +
              '</div>' +
            '</div>' +
            '<h3 class="kn-pyq-stem">' + esc(m.question) + '</h3>' +
            '<div class="kn-pyq-card-toggle">' +
              '<span>' + (isExpanded ? '▲ Hide Options &amp; Explanation' : '▼ View Options, Answer &amp; Pearls') + '</span>' +
            '</div>' +
          '</div>'
      );

      if (isExpanded) {
        html += '<div class="kn-pyq-card-body">';

        // Options
        html += '<div class="kn-pyq-options-grid">';
        (m.options || []).forEach(function (optText, oIdx) {
          var oKey = letterAt(oIdx);
          var optBtnClass = "kn-pyq-opt-btn";
          if (isAnswered) {
            if (oIdx === cIdx) optBtnClass += " is-correct";
            else if (ans.selected === oIdx) optBtnClass += " is-wrong";
          }

          var rationale = (m.whyWrong && m.whyWrong[oKey]) ? m.whyWrong[oKey] : "";
          if (!rationale && typeof optText === "object" && optText.rationale) {
            rationale = optText.rationale;
          }

          var displayText = (typeof optText === "object" && optText.text) ? optText.text : optText;

          html += (
            '<button type="button" class="' + optBtnClass + '" data-action="pyq-select-option" data-id="' + esc(m.id) + '" data-idx="' + oIdx + '">' +
              '<span class="kn-pyq-opt-key">' + oKey + '</span>' +
              '<div class="kn-pyq-opt-text">' +
                '<div>' + esc(displayText) + '</div>' +
                (isAnswered && rationale ? '<div class="kn-pyq-opt-rationale">' + esc(rationale) + '</div>' : '') +
              '</div>' +
            '</button>'
          );
        });
        html += '</div>';

        // Answer verification note for recall questions (shown once answered)
        if (isAnswered && m.answer_verification_note) {
          html += (
            '<div class="kn-mcq-verification-box" style="margin-top:4px; padding:12px 16px; border-radius:12px; background:rgba(2,132,199,0.06); border-left:4px solid #0284c7; font-size:13px; color:var(--text-main, #1e293b); line-height:1.5;">' +
              '<strong style="color:#0284c7;">✓ Answer Verification:</strong> ' + esc(m.answer_verification_note) +
            '</div>'
          );
        }

        // Verified Answer Banner (shown once answered)
        if (isAnswered) {
          var ansLetter = cIdx >= 0 ? letterAt(cIdx) : (m.answer ? String(m.answer).trim().toUpperCase() : "");
          html += (
            '<div class="kn-pyq-verified-banner">' +
              '<span>✓ Verified Answer: Option ' + esc(ansLetter) + '</span>' +
            '</div>'
          );
        }

        // Explanation & Clinical Rationale
        if (m.explanation) {
          html += (
            '<div class="kn-pyq-expl-box">' +
              '<strong style="display:block; margin-bottom:6px; color:var(--accent-cyan, #0284c7);">📖 Clinical Recall Synthesis &amp; Rationale</strong>' +
              '<p style="margin:0; line-height:1.65;">' + esc(m.explanation) + '</p>' +
            '</div>'
          );
        }

        // Why Other Options Are Wrong (shown once answered)
        var wrongKeys = Object.keys(m.whyWrong || {}).sort();
        if (isAnswered && wrongKeys.length) {
          html += (
            '<div class="kn-mcq-sec-box">' +
              '<div class="kn-mcq-sec-title">❌ Why Other Options Are Wrong</div>' +
              '<ul class="kn-mcq-why-list">'
          );
          wrongKeys.forEach(function (k) {
            var optIdx = k.charCodeAt(0) - 65;
            var isUserPick = ans && ans.selected === optIdx;
            html += (
              '<li class="' + (isUserPick ? 'is-user-pick' : '') + '">' +
                '<strong>Option ' + esc(k) + (isUserPick ? ' (Your Pick)' : '') + ':</strong> ' +
                esc(m.whyWrong[k]) +
              '</li>'
            );
          });
          html += '</ul></div>';
        }

        // High-Yield Takeaway / Pearl
        if (m.examPearl) {
          var pearlTitle = getPYQExam(m) === "INI-CET-SS-2026" ? "💡 INI-CET SS 2026 High-Yield Pearl" :
            (getPYQExam(m) === "INI-SS" ? "💡 INI-SS High-Yield Pearl" : "💡 NEET-SS High-Yield Pearl");
          html += (
            '<div class="kn-pyq-pearl-box">' +
              '<span class="kn-mcq-pearl-label" style="display:block; font-size:11px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase; color:var(--accent-amber, #d97706); margin-bottom:4px;">' + esc(pearlTitle) + '</span>' +
              '<div style="line-height:1.6;">' + esc(m.examPearl) + '</div>' +
            '</div>'
          );
        }

        // Contextual Links & Medical References (Cleaned: No DocTutorials / YouTube promotional links)
        var studyLinkUrl = getStudyLink(m.topicId, m.chapterId);
        var refClean = getSanitizedReference(m.hyperlinkedReference);
        var validRefUrl = refClean.url;
        var validRefLabel = refClean.label;

        html += '<div class="kn-mcq-links-row" style="margin-top:6px;">';
        if (studyLinkUrl) {
          html += (
            '<a href="' + esc(studyLinkUrl) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-study-link">' +
              '📚 Study This Topic in Knockout Notes ↗' +
            '</a>'
          );
        }
        if (validRefUrl && validRefLabel) {
          html += (
            '<a href="' + esc(validRefUrl) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-ref-link">' +
              '📄 Reference: ' + esc(validRefLabel) + ' ↗' +
            '</a>'
          );
        } else if (validRefLabel) {
          var isGuidelinePyq = validRefLabel.toLowerCase().indexOf("guideline") !== -1 || validRefLabel.toLowerCase().indexOf("surviving sepsis") !== -1 || validRefLabel.toLowerCase().indexOf("consensus") !== -1;
          var badgePrefixPyq = isGuidelinePyq ? "📄 Guideline: " : "📄 Reference: ";
          html += '<span class="kn-mcq-badge" style="padding:6px 12px; font-size:12px;">' + badgePrefixPyq + esc(validRefLabel) + '</span>';
        }
        html += '</div>';

        html += (
          '<div class="kn-pyq-meta-footer">' +
            '<span>Subtopic: ' + esc(m.subtopic || topicName) + '</span>' +
            '<span>Source: Faculty Consensus Recall Panel</span>' +
          '</div>'
        );

        html += '</div>'; // End body
      }

      html += '</div>'; // End card
    });
    html += '</div>';
    return html;
  }

  function renderPyqPaginationHTML(filtered) {
    if (!filtered.length) return '';
    var start = state.pyq.page * state.pyq.pageSize;
    var end = Math.min(start + state.pyq.pageSize, filtered.length);
    var isFirst = state.pyq.page === 0;
    var isLast = end >= filtered.length;

    return (
      '<div class="kn-pyq-pagination" id="knPyqPaginationContainer">' +
        '<span class="kn-pyq-pagination-count">' +
          'Showing ' + (start + 1) + '–' + end + ' of ' + filtered.length + ' questions' +
        '</span>' +
        '<div class="kn-pyq-pagination-actions">' +
          '<button type="button" class="kn-pyq-page-btn" data-action="pyq-prev-page"' + (isFirst ? ' disabled' : '') + '>Prev</button>' +
          '<button type="button" class="kn-pyq-page-btn" data-action="pyq-next-page"' + (isLast ? ' disabled' : '') + '>Next</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ── Canonical Topic to Study Topic Mapping ──────────────────────────────
  var CANONICAL_TOPIC_TO_STUDY = {
    "Mechanical Ventilation": {
      studyId: "ventilator-modes-waveforms-asynchrony",
      title: "Ventilator Modes, Waveforms & Asynchrony"
    },
    "Hemodynamics": {
      studyId: "fluid-responsiveness-dynamic-indices",
      title: "Dynamic Fluid Responsiveness & Resuscitation"
    },
    "ICU Procedures & Monitoring": {
      studyId: "pocus-critical-care-vexus-blue-rush",
      title: "Bedside POCUS, Vascular Imaging & VExUS"
    },
    "Infectious Diseases": {
      studyId: "multidrug-resistant-pathogens-icu",
      title: "Severe ICU Infections & MDR Pathogens"
    },
    "Pharmacology & Oncology": {
      studyId: "vasopressors-inotropes-titration-protocols",
      title: "Vasoactive Therapeutics & ICU Pharmacology"
    },
    "Toxicology": {
      studyId: "toxicology-antidotes-extracorporeal-elimination",
      title: "Clinical Toxicology, Antidotes & EXTRIP"
    },
    "Sepsis": {
      studyId: "sepsis3-hour1-bundle-resuscitation",
      title: "Sepsis-3 Definitions & Hour-1 Bundle"
    },
    "Neurocritical Care": {
      studyId: "tbi-neuromonitoring-raised-icp",
      title: "Traumatic Brain Injury & Raised ICP"
    },
    "Nutrition & GI": {
      studyId: "acute-liver-failure-nutrition-icu",
      title: "ICU Clinical Nutrition & Refeeding"
    },
    "ACLS / CPR": {
      studyId: "hypoxic-ischemic-encephalopathy-ttm-postarrest",
      title: "Post-Cardiac Arrest Care & TTM"
    },
    "Trauma & Burns": {
      studyId: "trauma-resuscitation-damage-control",
      title: "Polytrauma Resuscitation & Damage Control"
    },
    "Electrolytes & Metabolic": {
      studyId: "severe-electrolyte-disturbances-icu",
      title: "Severe Electrolyte Disturbances (Na/K/Ca)"
    },
    "Obstetric Critical Care": {
      studyId: "preeclampsia-eclampsia-hellp-syndrome",
      title: "Obstetric Critical Care & Preeclampsia"
    },
    "Renal Critical Care": {
      studyId: "aki-kdigo-crrt-modalities",
      title: "Acute Kidney Injury & CRRT Modalities"
    },
    "Cardiovascular Critical Care": {
      studyId: "cardiogenic-shock-scai",
      title: "Cardiogenic Shock & Acute Coronary Care"
    },
    "Acid-Base Disorders": {
      studyId: "abg-metabolic-acidosis",
      title: "Complex Acid-Base & ABG Interpretation"
    },
    "Hematology & Transfusion": {
      studyId: "massive-transfusion-rotem-teg-coagulopathy",
      title: "Massive Transfusion (MTP) & ROTEM/TEG"
    },
    "Physiology": {
      studyId: "hemodynamics-shock-approach",
      title: "Applied Physiology & Oxygen Delivery"
    },
    "Pediatric Critical Care": {
      studyId: "pediatric-septic-shock-resuscitation",
      title: "Pediatric Shock & Resuscitation"
    },
    "Radiology": {
      studyId: "pocus-critical-care-vexus-blue-rush",
      title: "Chest Radiography & Critical Care Ultrasound"
    },
    "Scoring Systems & General ICU": {
      studyId: "icu-organization-scoring-ethics",
      title: "ICU Organization & Severity Scores"
    },
    "Miscellaneous": {
      studyId: "icu-organization-scoring-ethics",
      title: "ICU Organization & Quality Bundles"
    }
  };

  function computeFrequentlyAskedTopics(filterExam) {
    filterExam = filterExam || "all";
    var topicMap = {};
    var totalPYQs = 0;

    state.mcqs.forEach(function (m) {
      if (!isPYQ(m)) return;
      var ex = getPYQExam(m);
      if (filterExam !== "all" && ex !== filterExam) return;

      totalPYQs++;
      var tName = getPYQTopic(m);
      if (!topicMap[tName]) {
        topicMap[tName] = {
          name: tName,
          total: 0,
          neet: 0,
          iniSs: 0,
          iniCet: 0,
          concepts: {}
        };
      }
      topicMap[tName].total++;
      if (ex === "INI-CET-SS-2026") {
        topicMap[tName].iniCet++;
      } else if (ex === "INI-SS") {
        topicMap[tName].iniSs++;
      } else {
        topicMap[tName].neet++;
      }

      if (m.tags && Array.isArray(m.tags)) {
        m.tags.forEach(function (tag) {
          if (!tag) return;
          var cleanTag = String(tag).trim();
          if (cleanTag && cleanTag !== tName && cleanTag.length > 2 && cleanTag.length < 35 && cleanTag.indexOf("Recall") === -1 && cleanTag.indexOf("NEET") === -1 && cleanTag.indexOf("INI") === -1) {
            topicMap[tName].concepts[cleanTag] = (topicMap[tName].concepts[cleanTag] || 0) + 1;
          }
        });
      }
    });

    var list = [];
    for (var k in topicMap) {
      if (Object.prototype.hasOwnProperty.call(topicMap, k)) {
        var item = topicMap[k];
        var pct = totalPYQs > 0 ? ((item.total / totalPYQs) * 100) : 0;
        var sortedConcepts = Object.keys(item.concepts).sort(function (a, b) {
          return item.concepts[b] - item.concepts[a];
        }).slice(0, 4);

        var studyInfo = CANONICAL_TOPIC_TO_STUDY[item.name] || {
          studyId: "icu-organization-scoring-ethics",
          title: "Critical Care Curriculum"
        };

        list.push({
          name: item.name,
          total: item.total,
          neet: item.neet,
          iniSs: item.iniSs,
          iniCet: item.iniCet,
          percentage: pct,
          concepts: sortedConcepts,
          studyId: studyInfo.studyId,
          studyTitle: studyInfo.title
        });
      }
    }

    list.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    });

    list.forEach(function (item, idx) {
      item.rank = idx + 1;
    });

    return {
      totalPYQs: totalPYQs,
      topics: list
    };
  }

  function renderPyqFrequentlyAskedCardsHTML() {
    var examFilter = state.pyq.faqExamFilter || "all";
    var data = computeFrequentlyAskedTopics(examFilter);
    var sortMode = state.pyq.faqSort || "freq";
    var query = (state.pyq.faqSearch || "").trim().toLowerCase();

    var filtered = data.topics.filter(function (t) {
      if (!query) return true;
      if (t.name.toLowerCase().indexOf(query) !== -1) return true;
      if (t.studyTitle.toLowerCase().indexOf(query) !== -1) return true;
      for (var i = 0; i < t.concepts.length; i++) {
        if (t.concepts[i].toLowerCase().indexOf(query) !== -1) return true;
      }
      return false;
    });

    if (sortMode === "name") {
      filtered.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else {
      filtered.sort(function (a, b) { return b.total - a.total; });
    }

    if (!filtered.length) {
      return (
        '<div class="kn-pyq-faq-empty" id="knPyqFaqCardsContainer">' +
          '<div style="font-size:32px; margin-bottom:10px;">🔍</div>' +
          '<h4 style="margin:0 0 6px 0;">No matching high-yield topics found</h4>' +
          '<p style="color:var(--text-muted); margin:0 0 16px 0;">Try adjusting your search terms or exam filter.</p>' +
          '<button type="button" class="kn-pyq-page-btn" data-action="faq-clear-search">Clear Search</button>' +
        '</div>'
      );
    }

    var maxTotal = data.topics.length ? data.topics[0].total : 1;
    var cardsHTML = '';

    filtered.forEach(function (topic) {
      var barPct = Math.round((topic.total / maxTotal) * 100);
      var sharePct = topic.percentage.toFixed(1);

      // Rank Badge
      var rankBadgeHTML = '';
      if (topic.rank === 1) {
        rankBadgeHTML = '<span class="kn-pyq-rank-badge kn-pyq-rank-badge--gold">🥇 Rank #1</span>';
      } else if (topic.rank === 2) {
        rankBadgeHTML = '<span class="kn-pyq-rank-badge kn-pyq-rank-badge--silver">🥈 Rank #2</span>';
      } else if (topic.rank === 3) {
        rankBadgeHTML = '<span class="kn-pyq-rank-badge kn-pyq-rank-badge--bronze">🥉 Rank #3</span>';
      } else {
        rankBadgeHTML = '<span class="kn-pyq-rank-badge">Rank #' + topic.rank + '</span>';
      }

      // Yield Category Badge
      var yieldTagHTML = '';
      if (topic.rank <= 3) {
        yieldTagHTML = '<span class="kn-pyq-yield-tag kn-pyq-yield-tag--must-know">🔥 Must-Know (High Yield)</span>';
      } else if (topic.rank <= 8) {
        yieldTagHTML = '<span class="kn-pyq-yield-tag kn-pyq-yield-tag--core">⚡ Core Exam Priority</span>';
      } else if (topic.rank <= 14) {
        yieldTagHTML = '<span class="kn-pyq-yield-tag kn-pyq-yield-tag--consistent">📈 Regular Exam Yield</span>';
      } else {
        yieldTagHTML = '<span class="kn-pyq-yield-tag kn-pyq-yield-tag--subspec">🎯 Focused Subspecialty</span>';
      }

      // Concept chips
      var conceptsHTML = '';
      if (topic.concepts && topic.concepts.length) {
        conceptsHTML = '<div class="kn-pyq-concepts-row">';
        topic.concepts.forEach(function (c) {
          conceptsHTML += '<span class="kn-pyq-concept-chip">' + esc(c) + '</span>';
        });
        conceptsHTML += '</div>';
      }

      cardsHTML += (
        '<article class="kn-pyq-rank-card">' +
          '<div class="kn-pyq-rank-card-header">' +
            '<div class="kn-pyq-rank-top-row">' +
              '<div class="kn-pyq-rank-badges-wrap">' +
                rankBadgeHTML +
                yieldTagHTML +
              '</div>' +
              '<div class="kn-pyq-rank-stat-pill">' +
                '<strong>' + topic.total + '</strong> Qs &bull; ' + sharePct + '% Share' +
              '</div>' +
            '</div>' +
            '<h3 class="kn-pyq-rank-title">' + esc(topic.name) + '</h3>' +
          '</div>' +

          '<div class="kn-pyq-rank-card-body">' +
            '<!-- Relative Frequency Bar -->' +
            '<div class="kn-pyq-freq-bar-wrap" title="' + sharePct + '% of verified PYQs">' +
              '<div class="kn-pyq-freq-bar-bg">' +
                '<div class="kn-pyq-freq-bar-fill" style="width:' + barPct + '%;"></div>' +
              '</div>' +
            '</div>' +

            '<!-- Exam Breakdown -->' +
            '<div class="kn-pyq-breakdown-row">' +
              '<span class="kn-pyq-breakdown-chip kn-pyq-breakdown-chip--neet" title="NEET-SS Recall Questions">🎯 NEET-SS: <strong>' + topic.neet + '</strong></span>' +
              '<span class="kn-pyq-breakdown-chip kn-pyq-breakdown-chip--ini" title="INI-SS Nov 2025 Recall Questions">🏛️ INI-SS: <strong>' + topic.iniSs + '</strong></span>' +
              '<span class="kn-pyq-breakdown-chip kn-pyq-breakdown-chip--inicet" title="INI-CET SS 2026 Recall Questions">⭐ INI-CET: <strong>' + topic.iniCet + '</strong></span>' +
            '</div>' +

            conceptsHTML +
          '</div>' +

          '<div class="kn-pyq-rank-card-footer">' +
            '<button type="button" class="kn-pyq-faq-btn kn-pyq-faq-btn--study" data-action="faq-study-topic" data-study-id="' + esc(topic.studyId) + '">' +
              '📖 Study Chapter' +
            '</button>' +
            '<button type="button" class="kn-pyq-faq-btn kn-pyq-faq-btn--practise" data-action="faq-practise-topic" data-topic="' + esc(topic.name) + '">' +
              '📝 Practise ' + topic.total + ' PYQs' +
            '</button>' +
          '</div>' +
        '</article>'
      );
    });

    return '<div class="kn-pyq-faq-grid" id="knPyqFaqCardsContainer">' + cardsHTML + '</div>';
  }

  function renderPyqFrequentlyAskedView() {
    var examFilter = state.pyq.faqExamFilter || "all";
    var data = computeFrequentlyAskedTopics(examFilter);
    var sortMode = state.pyq.faqSort || "freq";

    // Calculate totals across all exams for filter pill counts
    var allData = computeFrequentlyAskedTopics("all");
    var neetData = computeFrequentlyAskedTopics("NEET-SS");
    var iniData = computeFrequentlyAskedTopics("INI-SS");
    var iniCetData = computeFrequentlyAskedTopics("INI-CET-SS-2026");

    var topTopic = data.topics.length ? data.topics[0] : null;
    var topTopicStr = topTopic ? (topTopic.name + ' (' + topTopic.percentage.toFixed(1) + '%)') : 'Mechanical Ventilation';

    return (
      '<div class="kn-pyq-explorer-view kn-pyq-faq-view">' +
        '<!-- 1. Header Card (Aligned with Study Section Design Language) -->' +
        '<section class="kn-pyq-header-card kn-pyq-header-card--faq">' +
          '<div class="kn-pyq-header-top">' +
            '<div>' +
              '<div class="kn-pyq-badge-eyebrow">HIGH-YIELD FREQUENCY ENGINE</div>' +
              '<h2 class="kn-pyq-title">🔥 Frequently Asked Topics — Critical Care PYQs</h2>' +
              '<p class="kn-pyq-subtitle">Topic rankings automatically derived from all 312+ verified recall questions (NEET-SS, INI-SS &amp; INI-CET SS). Prioritize high-yield topics with direct links to exam-oriented study chapters and topic question sets.</p>' +
            '</div>' +
            '<div class="kn-pyq-header-actions">' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--study-exit" data-action="faq-back-to-pyq" title="Return to Topic Explorer">← PYQ Explorer</button>' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--study-exit" data-action="exit-to-study" title="Return to Study Mode">← Study Mode</button>' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary kn-mcq-btn--sm" data-action="go-builder">⚡ Custom Test</button>' +
            '</div>' +
          '</div>' +
          '<div class="kn-pyq-stats-grid">' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">TOTAL PYQS ANALYZED</div>' +
              '<div class="kn-pyq-stat-val">' + data.totalPYQs + '</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">EXAM DOMAINS</div>' +
              '<div class="kn-pyq-stat-val">' + data.topics.length + ' Topics</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">#1 HIGH-YIELD DOMAIN</div>' +
              '<div class="kn-pyq-stat-val" style="font-size:14.5px;">' + esc(topTopicStr) + '</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">TOP 3 TOPICS SHARE</div>' +
              '<div class="kn-pyq-stat-val">33.0% of All Qs</div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<!-- 2. Controls Wrap: Exam Scope Switcher, View Mode & Sort -->' +
        '<div class="kn-pyq-controls-wrap">' +
          '<div class="kn-pyq-switchers-row">' +
            '<div class="kn-pyq-pill-group" role="tablist" aria-label="Exam Scope">' +
              '<span class="kn-pyq-group-label">Exam:</span>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (examFilter === "all" ? "active" : "") + '" data-action="faq-set-exam-filter" data-exam="all">All Exams (' + allData.totalPYQs + ')</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (examFilter === "NEET-SS" ? "active" : "") + '" data-action="faq-set-exam-filter" data-exam="NEET-SS">🎯 NEET-SS (' + neetData.totalPYQs + ')</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (examFilter === "INI-SS" ? "active" : "") + '" data-action="faq-set-exam-filter" data-exam="INI-SS">🏛️ INI-SS Nov 25 (' + iniData.totalPYQs + ')</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (examFilter === "INI-CET-SS-2026" ? "active" : "") + '" data-action="faq-set-exam-filter" data-exam="INI-CET-SS-2026">⭐ INI-CET 2026 (' + iniCetData.totalPYQs + ')</button>' +
            '</div>' +

            '<div class="kn-pyq-pill-group" role="tablist" aria-label="Viewing Mode">' +
              '<span class="kn-pyq-group-label">View:</span>' +
              '<button type="button" class="kn-pyq-pill-btn" data-action="pyq-set-mode" data-mode="topic">🗂️ Topic-wise Explorer</button>' +
              '<button type="button" class="kn-pyq-pill-btn" data-action="pyq-set-mode" data-mode="all">📋 All Questions</button>' +
              '<button type="button" class="kn-pyq-pill-btn active kn-pyq-pill-btn--freq" data-action="pyq-set-mode" data-mode="frequent">🔥 Frequently Asked</button>' +
            '</div>' +

            '<div class="kn-pyq-pill-group" role="tablist" aria-label="Sort Frequency">' +
              '<span class="kn-pyq-group-label">Sort:</span>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (sortMode === "freq" ? "active" : "") + '" data-action="faq-set-sort" data-sort="freq">Highest Frequency</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (sortMode === "name" ? "active" : "") + '" data-action="faq-set-sort" data-sort="name">A–Z</button>' +
            '</div>' +
          '</div>' +

          '<div class="kn-pyq-search-wrap">' +
            '<input type="search" class="kn-pyq-search-input" id="knPyqFaqSearchInput"' +
              ' placeholder="Search frequently asked topics or tested concepts (e.g., Ventilation, Sepsis, Driving Pressure, Auto-PEEP)..."' +
              ' value="' + esc(state.pyq.faqSearch) + '" autocomplete="off">' +
            (state.pyq.faqSearch ? '<button type="button" class="kn-pyq-search-clear" data-action="faq-clear-search" aria-label="Clear search">×</button>' : '') +
          '</div>' +
        '</div>' +

        '<!-- 3. Topic Cards Grid -->' +
        renderPyqFrequentlyAskedCardsHTML() +
      '</div>'
    );
  }

  function renderPyqView() {
    if (state.pyq.mode === "frequent" || state.pyq.mode === "frequently-asked" || state.pyq.mode === "faq") {
      return renderPyqFrequentlyAskedView();
    }

    var counts = getPYQTopicCounts();
    var filtered = getFilteredPYQs();

    // Calculate total counts per exam and year
    var countNeetAll = 0, countNeet2025 = 0, countNeet2024 = 0;
    var countIniAll = 0;
    var countIniCet2026 = 0;
    state.mcqs.forEach(function (m) {
      if (!isPYQ(m)) return;
      var ex = getPYQExam(m);
      if (ex === "INI-CET-SS-2026") {
        countIniCet2026++;
      } else if (ex === "INI-SS") {
        countIniAll++;
      } else {
        countNeetAll++;
        var yr = getPYQYear(m);
        if (yr === 2025) countNeet2025++;
        if (yr === 2024) countNeet2024++;
      }
    });

    var selectedExam = state.pyq.exam || "NEET-SS";
    var selectedYear = state.pyq.year;
    var activeTopic = state.pyq.topic;

    var examTitle = "NEET-SS Critical Care — PYQs";
    var examTargetText = selectedYear === "all" ? "NEET-SS 2024/25" : ("NEET-SS " + selectedYear);
    if (selectedExam === "INI-CET-SS-2026") {
      examTitle = "INI-CET SS 2026 Critical Care — Recall PYQs";
      examTargetText = "INI-CET SS April 2026";
    } else if (selectedExam === "INI-SS") {
      examTitle = "INI-SS Critical Care — Recall PYQs";
      examTargetText = "INI-SS Nov 2025";
    }

    // Predefined topic chip ordering
    var topicOrder = [
      "all",
      "Mechanical Ventilation",
      "Hemodynamics",
      "Sepsis",
      "Neurocritical Care",
      "Acid-Base Disorders",
      "Renal Critical Care",
      "ACLS / CPR",
      "Infectious Diseases",
      "Obstetric Critical Care",
      "Cardiovascular Critical Care",
      "Electrolytes & Metabolic",
      "ICU Procedures & Monitoring",
      "Pharmacology & Oncology",
      "Toxicology",
      "Hematology & Transfusion",
      "Trauma & Burns",
      "Nutrition & GI",
      "Physiology",
      "Radiology",
      "Miscellaneous"
    ];

    // Predefined topic chip display map
    var topicDisplayMap = {
      "all": "All Topics",
      "Mechanical Ventilation": "Ventilation",
      "Hemodynamics": "Hemodynamics",
      "Sepsis": "Sepsis",
      "Neurocritical Care": "NeuroICU",
      "Acid-Base Disorders": "Acid-Base",
      "Renal Critical Care": "Renal",
      "ACLS / CPR": "ACLS/CPR",
      "Infectious Diseases": "Infections",
      "Obstetric Critical Care": "Obstetrics",
      "Cardiovascular Critical Care": "Cardiology",
      "Electrolytes & Metabolic": "Metabolic",
      "ICU Procedures & Monitoring": "Procedures",
      "Pharmacology & Oncology": "Pharmacology",
      "Toxicology": "Toxicology",
      "Hematology & Transfusion": "Hematology",
      "Trauma & Burns": "Trauma",
      "Nutrition & GI": "Nutrition/GI",
      "Physiology": "Physiology",
      "Radiology": "Radiology",
      "Miscellaneous": "Misc"
    };

    // Build topic chips
    var chipsHTML = "";
    topicOrder.forEach(function (tKey) {
      var cCount = counts[tKey] || 0;
      if (tKey !== "all" && cCount === 0) return; // Hide empty chips for current year filter
      var label = topicDisplayMap[tKey] || tKey;
      var isActive = activeTopic === tKey;
      chipsHTML += (
        '<button type="button" class="kn-pyq-chip ' + (isActive ? 'active' : '') + '" data-action="pyq-set-topic" data-topic="' + esc(tKey) + '">' +
          esc(label) + ' <span class="kn-pyq-chip-count">(' + cCount + ')</span>' +
        '</button>'
      );
    });

    // Sub-filters: for NEET-SS show Years, for INI-SS / INI-CET show Sessions
    var periodSelectorHTML = "";
    if (selectedExam === "INI-CET-SS-2026") {
      periodSelectorHTML = (
        '<div class="kn-pyq-pill-group" role="tablist" aria-label="Examination Session">' +
          '<span class="kn-pyq-group-label">Session:</span>' +
          '<button type="button" class="kn-pyq-pill-btn active" data-action="pyq-set-session" data-session="april2026">April 2026 (' + countIniCet2026 + ')</button>' +
        '</div>'
      );
    } else if (selectedExam === "INI-SS") {
      periodSelectorHTML = (
        '<div class="kn-pyq-pill-group" role="tablist" aria-label="Examination Session">' +
          '<span class="kn-pyq-group-label">Session:</span>' +
          '<button type="button" class="kn-pyq-pill-btn active" data-action="pyq-set-session" data-session="nov2025">Nov 2025 (' + countIniAll + ')</button>' +
        '</div>'
      );
    } else {
      periodSelectorHTML = (
        '<div class="kn-pyq-pill-group" role="tablist" aria-label="Examination Year">' +
          '<span class="kn-pyq-group-label">Year:</span>' +
          '<button type="button" class="kn-pyq-pill-btn ' + (selectedYear === "all" ? "active" : "") + '" data-action="pyq-set-year" data-year="all">All Years (' + countNeetAll + ')</button>' +
          '<button type="button" class="kn-pyq-pill-btn ' + (selectedYear === "2025" ? "active" : "") + '" data-action="pyq-set-year" data-year="2025">2025 (' + countNeet2025 + ')</button>' +
          '<button type="button" class="kn-pyq-pill-btn ' + (selectedYear === "2024" ? "active" : "") + '" data-action="pyq-set-year" data-year="2024">2024 (' + countNeet2024 + ')</button>' +
        '</div>'
      );
    }

    return (
      '<div class="kn-pyq-explorer-view">' +
        '<!-- 1. Header Card (Aligned with Study Section Design Language) -->' +
        '<section class="kn-pyq-header-card">' +
          '<div class="kn-pyq-header-top">' +
            '<div>' +
              '<h2 class="kn-pyq-title">' + esc(examTitle) + '</h2>' +
              '<p class="kn-pyq-subtitle">Verified Previous Year Question Bank • Real Recall Questions &amp; In-Depth Explanations</p>' +
            '</div>' +
            '<div class="kn-pyq-header-actions">' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-pyq-freq-trigger-btn" data-action="pyq-set-mode" data-mode="frequent" title="View exam topic frequency rankings">🔥 Frequently Asked Topics</button>' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--study-exit" data-action="exit-to-study" title="Return to Study Mode">← Study Mode</button>' +
              '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary kn-mcq-btn--sm" data-action="go-builder">⚡ Custom Test</button>' +
            '</div>' +
          '</div>' +
          '<div class="kn-pyq-stats-grid">' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">AVAILABLE QS</div>' +
              '<div class="kn-pyq-stat-val" id="knPyqTotalQsVal">' + filtered.length + '</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">EXAM TARGET</div>' +
              '<div class="kn-pyq-stat-val">' + esc(examTargetText) + '</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">SPECIALTY</div>' +
              '<div class="kn-pyq-stat-val">Critical Care</div>' +
            '</div>' +
            '<div class="kn-pyq-stat-item">' +
              '<div class="kn-pyq-stat-label">RECALL QUESTIONS</div>' +
              '<div class="kn-pyq-stat-val">Faculty Verified</div>' +
            '</div>' +
          '</div>' +
        '</section>' +

        '<!-- 2. Controls Wrap: Exam Switcher, Year/Session Filter, Viewing Mode & Search -->' +
        '<div class="kn-pyq-controls-wrap">' +
          '<div class="kn-pyq-switchers-row">' +
            '<div class="kn-pyq-pill-group" role="tablist" aria-label="Select Examination">' +
              '<span class="kn-pyq-group-label">Exam:</span>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (selectedExam === "NEET-SS" ? "active" : "") + '" data-action="pyq-set-exam" data-exam="NEET-SS">🎯 NEET-SS (' + countNeetAll + ')</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (selectedExam === "INI-SS" ? "active" : "") + '" data-action="pyq-set-exam" data-exam="INI-SS">🏛️ INI-SS Nov 25 (' + countIniAll + ')</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (selectedExam === "INI-CET-SS-2026" ? "active" : "") + '" data-action="pyq-set-exam" data-exam="INI-CET-SS-2026">⭐ INI-CET SS 2026 (' + countIniCet2026 + ')</button>' +
            '</div>' +

            periodSelectorHTML +

            '<div class="kn-pyq-pill-group" role="tablist" aria-label="Viewing Mode">' +
              '<span class="kn-pyq-group-label">View:</span>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (state.pyq.mode === "topic" ? "active" : "") + '" data-action="pyq-set-mode" data-mode="topic">🗂️ Topic Explorer</button>' +
              '<button type="button" class="kn-pyq-pill-btn ' + (state.pyq.mode === "all" ? "active" : "") + '" data-action="pyq-set-mode" data-mode="all">📋 All Questions</button>' +
              '<button type="button" class="kn-pyq-pill-btn kn-pyq-pill-btn--freq ' + (state.pyq.mode === "frequent" ? "active" : "") + '" data-action="pyq-set-mode" data-mode="frequent">🔥 Frequently Asked</button>' +
            '</div>' +
          '</div>' +

          '<div class="kn-pyq-search-wrap">' +
            '<input type="search" class="kn-pyq-search-input" id="knPyqSearchInput"' +
              ' placeholder="Search questions by keyword, topic, or rationale..."' +
              ' value="' + esc(state.pyq.search) + '" autocomplete="off">' +
            (state.pyq.search ? '<button type="button" class="kn-pyq-search-clear" data-action="pyq-clear-search" aria-label="Clear search">×</button>' : '') +
          '</div>' +

          '<div class="kn-pyq-chips-track">' +
            chipsHTML +
          '</div>' +
        '</div>' +

        '<!-- 3. Question Cards in Topic Explorer Mode -->' +
        renderPyqCardsHTML(filtered) +

        '<!-- 4. Pagination Footer -->' +
        renderPyqPaginationHTML(filtered) +
      '</div>'
    );
  }

  // ── Master Render Function ───────────────────────────────────────────────
  function render() {
    if (!container) return;

    if (state.loading) {
      container.innerHTML = (
        renderTopBar() +
        '<div class="kn-mcq-qcard" style="text-align:center; padding:60px 20px;">' +
          '<div style="font-size:28px; margin-bottom:12px;">⏳</div>' +
          '<h3 style="margin:0 0 8px 0;">Loading High Yield MCQ Engine…</h3>' +
          '<p style="color:var(--text-muted); margin:0;">Accessing offline cache and 31 clinical chapter banks.</p>' +
        '</div>'
      );
      return;
    }

    if (state.error) {
      container.innerHTML = (
        renderTopBar() +
        '<div class="kn-mcq-qcard" style="text-align:center; padding:40px 20px;">' +
          '<h3 style="color:var(--mcq-danger);">⚠️ Failed to load questions</h3>' +
          '<p>' + esc(state.error.message) + '</p>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="retry">Retry</button>' +
        '</div>'
      );
      return;
    }

    var bodyContent = '';
    if (state.viewMode === "directory") {
      bodyContent = renderDirectoryView();
    } else if (state.viewMode === "pyq") {
      bodyContent = renderPyqView();
    } else if (state.viewMode === "builder") {
      bodyContent = renderBuilderView();
    } else if (state.viewMode === "practice") {
      bodyContent = renderPracticeView();
    } else if (state.viewMode === "exam") {
      bodyContent = renderExamView();
    } else if (state.viewMode === "results") {
      bodyContent = renderResultsView();
    } else if (state.viewMode === "review") {
      bodyContent = renderReviewView();
    }

    container.innerHTML = renderTopBar() + bodyContent;
  }

  // ── Actions & Logic ──────────────────────────────────────────────────────
  function startCustomExam(opts) {
    opts = opts || {};
    var examTarget = opts.exam || "all";
    var count = opts.count || 25;
    var difficulty = opts.difficulty || "all";
    var chapterIds = opts.chapterIds || [];
    var timerPerQ = opts.timerPerQ || 0; // seconds

    // Filter candidate pool
    var pool = state.mcqs.filter(function (m) {
      if (examTarget !== "all" && m.exam !== examTarget) return false;
      if (difficulty !== "all" && m.difficulty !== difficulty) return false;
      if (chapterIds.length && chapterIds.indexOf(String(m.chapterId)) === -1 && chapterIds.indexOf(Number(m.chapterId)) === -1) {
        return false;
      }
      return true;
    });

    if (!pool.length) {
      alert("No questions matched your selection. Please broaden your chapter or exam filters.");
      return;
    }

    // Shuffle without repetition
    var shuffled = pool.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    var selectedQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    var totalSeconds = timerPerQ > 0 ? selectedQuestions.length * timerPerQ : 0;

    clearExamTimer();

    var insufficientNotice = (selectedQuestions.length < count)
      ? ("Loaded all " + selectedQuestions.length + " MCQs available in selection (requested " + count + ").")
      : null;

    state.exam = {
      id: "exam-" + Date.now(),
      title: (examTarget === "all" ? "NEET-SS & INI-SS" : examTarget) + " Mock Test (" + selectedQuestions.length + " Qs)",
      questions: selectedQuestions,
      insufficientNotice: insufficientNotice,
      currentIndex: 0,
      userAnswers: {},
      markedForReview: {},
      startTime: Date.now(),
      timerDuration: totalSeconds,
      timerRemaining: totalSeconds,
      timerInterval: null,
      isSubmitted: false,
      results: null
    };

    startExamTimer();

    state.viewMode = "exam";
    state.paletteOpen = false;
    persistExam();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startExamTimer() {
    clearExamTimer();
    if (!state.exam || state.exam.isSubmitted || state.exam.timerRemaining <= 0) return;
    var lastTick = Date.now();
    state.exam.timerInterval = setInterval(function () {
      if (!state.exam || state.exam.isSubmitted) {
        clearExamTimer();
        return;
      }
      var now = Date.now();
      var elapsed = Math.round((now - lastTick) / 1000);
      if (elapsed >= 1) {
        state.exam.timerRemaining = Math.max(0, state.exam.timerRemaining - elapsed);
        lastTick = now;
        var badge = container ? container.querySelector(".kn-mcq-timer-badge") : null;
        if (badge) {
          var mins = Math.floor(state.exam.timerRemaining / 60);
          var secs = state.exam.timerRemaining % 60;
          badge.textContent = "⏱ " + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
        }
        if (state.exam.timerRemaining <= 0) {
          clearExamTimer();
          submitExam(true);
        }
      }
    }, 1000);
  }

  function clearExamTimer() {
    if (state.exam && state.exam.timerInterval) {
      clearInterval(state.exam.timerInterval);
      state.exam.timerInterval = null;
    }
  }

  function submitExam(auto) {
    if (!state.exam || state.exam.isSubmitted) return;

    var answeredCount = Object.keys(state.exam.userAnswers).length;
    var total = state.exam.questions.length;

    if (!auto) {
      var msg = "Are you sure you want to submit your examination?\n" +
                "You have answered " + answeredCount + " of " + total + " questions.";
      if (!window.confirm(msg)) return;
    }

    clearExamTimer();

    state.exam.isSubmitted = true;

    // Evaluate
    var correct = 0;
    var incorrect = 0;
    var unanswered = 0;
    var chapterStats = {};
    var weakTopicMap = {};

    state.exam.questions.forEach(function (m) {
      var cIdx = correctIndex(m);
      var userPick = state.exam.userAnswers[m.id];
      var chId = m.chapterId;

      if (!chapterStats[chId]) {
        chapterStats[chId] = { chapterId: chId, title: chapterTitle(chId), total: 0, correct: 0 };
      }
      chapterStats[chId].total++;

      if (userPick === undefined) {
        unanswered++;
      } else if (userPick === cIdx) {
        correct++;
        chapterStats[chId].correct++;
      } else {
        incorrect++;
        if (m.topicId) {
          weakTopicMap[m.topicId] = {
            topicId: m.topicId,
            title: topicTitle(m.topicId),
            chapterId: chId
          };
        }
      }

      // Also record into persistent practice answers
      if (userPick !== undefined) {
        state.answers[m.id] = { selected: userPick, correct: userPick === cIdx };
      }
    });

    persistProgress();

    var pct = total ? Math.round((correct / total) * 100) : 0;
    var headline = pct >= 80 ? "🏆 Excellent! Exam Ready" : pct >= 60 ? "📈 Good Performance — Refine Weak Topics" : "🎯 High Yield Revision Required";
    var feedback = "You scored " + correct + " out of " + total + " (" + pct + "%). " +
      (incorrect > 0 ? "Review your " + incorrect + " incorrect answers and high-yield topics below before testing again." : "Flawless score across all domains!");

    var chapterBreakdown = Object.values(chapterStats).sort(function (a, b) {
      return a.chapterId - b.chapterId;
    });

    state.exam.results = {
      total: total,
      correct: correct,
      incorrect: incorrect,
      unanswered: unanswered,
      score: correct,
      percent: pct,
      headline: headline,
      feedback: feedback,
      chapterBreakdown: chapterBreakdown,
      weakTopics: Object.values(weakTopicMap)
    };

    persistExam();
    state.viewMode = "results";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Event Handlers & Delegation ──────────────────────────────────────────
  function wireEvents() {
    if (!container) return;

    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;

      var action = btn.getAttribute("data-action");

      if (action === "go-pyq") {
        triggerHaptic();
        clearExamTimer();
        state.viewMode = "pyq";
        state.pyq.mode = "topic";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "pyq-set-exam") {
        triggerHaptic();
        state.pyq.exam = btn.getAttribute("data-exam") || "NEET-SS";
        state.pyq.year = "all";
        state.pyq.page = 0;
        state.pyq.topic = "all";
        try {
          var urlPyq2 = new URL(window.location.href);
          urlPyq2.searchParams.set("view", "pyq");
          urlPyq2.searchParams.set("exam", state.pyq.exam);
          window.history.replaceState({ view: "pyq", exam: state.pyq.exam }, "", urlPyq2.toString());
        } catch (_) {}
        filterPracticeList();
        render();
        return;
      }

      if (action === "pyq-set-session") {
        triggerHaptic();
        state.pyq.page = 0;
        state.pyq.topic = "all";
        filterPracticeList();
        render();
        return;
      }

      if (action === "pyq-set-year") {
        triggerHaptic();
        state.pyq.year = btn.getAttribute("data-year") || "all";
        state.pyq.page = 0;
        state.pyq.topic = "all";
        filterPracticeList();
        render();
        return;
      }

      if (action === "pyq-set-mode") {
        triggerHaptic();
        var targetMode = btn.getAttribute("data-mode");
        if (targetMode === "all") {
          state.pyq.mode = "all";
          state.practiceFilter.view = "pyq";
          state.practiceFilter.exam = "all";
          state.practiceIndex = 0;
          filterPracticeList();
          state.viewMode = "practice";
        } else if (targetMode === "frequent") {
          state.pyq.mode = "frequent";
          state.viewMode = "pyq";
        } else {
          state.pyq.mode = "topic";
          state.viewMode = "pyq";
        }
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "faq-set-exam-filter") {
        triggerHaptic();
        state.pyq.faqExamFilter = btn.getAttribute("data-exam") || "all";
        render();
        return;
      }

      if (action === "faq-set-sort") {
        triggerHaptic();
        state.pyq.faqSort = btn.getAttribute("data-sort") || "freq";
        render();
        return;
      }

      if (action === "faq-clear-search") {
        triggerHaptic();
        state.pyq.faqSearch = "";
        render();
        return;
      }

      if (action === "faq-practise-topic") {
        triggerHaptic();
        var tName = btn.getAttribute("data-topic");
        state.pyq.mode = "topic";
        state.pyq.topic = tName || "all";
        state.pyq.page = 0;
        state.viewMode = "pyq";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "faq-study-topic") {
        triggerHaptic();
        var studyId = btn.getAttribute("data-study-id");
        if (studyId) {
          window.location.href = "study.html?topic=" + encodeURIComponent(studyId);
        }
        return;
      }

      if (action === "faq-back-to-pyq") {
        triggerHaptic();
        state.pyq.mode = "topic";
        state.viewMode = "pyq";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "pyq-return-to-explorer") {
        triggerHaptic();
        state.pyq.mode = "topic";
        state.viewMode = "pyq";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "pyq-set-topic") {
        triggerHaptic();
        state.pyq.topic = btn.getAttribute("data-topic") || "all";
        state.pyq.page = 0;
        render();
        return;
      }

      if (action === "pyq-toggle-card") {
        triggerHaptic();
        var cardId = btn.getAttribute("data-id");
        state.pyq.expanded[cardId] = !state.pyq.expanded[cardId];
        render();
        return;
      }

      if (action === "pyq-select-option") {
        triggerHaptic();
        var qId = btn.getAttribute("data-id");
        var optIdx = parseInt(btn.getAttribute("data-idx"), 10);
        var curQ = state.mcqs.find(function (x) { return x.id === qId; });
        if (curQ && state.answers[qId] === undefined) {
          state.answers[qId] = {
            selected: optIdx,
            correct: optIdx === correctIndex(curQ)
          };
          state.pyq.expanded[qId] = true;
          persistProgress();
          render();
        }
        return;
      }

      if (action === "pyq-clear-search") {
        triggerHaptic();
        state.pyq.search = "";
        state.pyq.page = 0;
        render();
        return;
      }

      if (action === "pyq-prev-page") {
        triggerHaptic();
        if (state.pyq.page > 0) {
          state.pyq.page--;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (action === "pyq-next-page") {
        triggerHaptic();
        state.pyq.page++;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (action === "exit-to-study") {
        triggerHaptic();
        close();
        return;
      }

      if (action === "go-directory") {
        triggerHaptic();
        clearExamTimer();
        state.viewMode = "directory";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "go-builder") {
        triggerHaptic();
        clearExamTimer();
        state.viewMode = "builder";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "go-results") {
        triggerHaptic();
        state.viewMode = "results";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "resume-exam") {
        triggerHaptic();
        state.viewMode = "exam";
        render();
        startExamTimer();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "discard-exam") {
        triggerHaptic();
        clearExamTimer();
        state.exam = {
          id: null,
          title: "Custom Mock Test",
          questions: [],
          currentIndex: 0,
          userAnswers: {},
          markedForReview: {},
          timerDuration: 0,
          timerRemaining: 0,
          timerInterval: null,
          isSubmitted: false,
          results: null
        };
        persistExam();
        render();
      } else if (action === "practice-all") {
        triggerHaptic();
        clearExamTimer();
        state.practiceFilter.chapterId = "";
        state.practiceFilter.topicId = "";
        state.practiceFilter.view = "all";
        state.practiceIndex = 0;
        filterPracticeList();
        state.viewMode = "practice";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "open-chapter") {
        triggerHaptic();
        clearExamTimer();
        var chId = btn.getAttribute("data-chapter-id");
        state.practiceFilter.chapterId = chId;
        state.practiceFilter.topicId = "";
        state.practiceFilter.view = "all";
        state.practiceIndex = 0;
        filterPracticeList();
        state.viewMode = "practice";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "practice-chapter") {
        triggerHaptic();
        clearExamTimer();
        var chId2 = btn.getAttribute("data-chapter-id");
        state.practiceFilter.chapterId = chId2;
        state.practiceFilter.topicId = "";
        state.practiceIndex = 0;
        filterPracticeList();
        state.viewMode = "practice";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "practice-filter-view") {
        triggerHaptic();
        var targetV = btn.getAttribute("data-view");
        state.practiceFilter.view = targetV;
        if (targetV === "recall2025") {
          state.practiceFilter.chapterId = "";
          state.practiceFilter.topicId = "";
          state.practiceFilter.exam = "all";
          state.practiceFilter.difficulty = "all";
          state.practiceFilter.search = "";
        }
        state.practiceIndex = 0;
        filterPracticeList();
        state.viewMode = "practice";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "clear-filters") {
        triggerHaptic();
        state.practiceFilter = { chapterId: "", topicId: "", exam: "all", difficulty: "all", view: "all", search: "" };
        state.practiceIndex = 0;
        filterPracticeList();
        render();
      } else if (action === "select-practice-option") {
        triggerHaptic();
        var optIdx = parseInt(btn.getAttribute("data-idx"), 10);
        var curQ = state.practiceList[state.practiceIndex];
        if (curQ && state.answers[curQ.id] === undefined) {
          state.answers[curQ.id] = {
            selected: optIdx,
            correct: optIdx === correctIndex(curQ)
          };
          persistProgress();
          render();
        }
      } else if (action === "toggle-bookmark") {
        triggerHaptic();
        var qId = btn.getAttribute("data-id");
        if (state.bookmarks[qId]) delete state.bookmarks[qId];
        else state.bookmarks[qId] = true;
        persistBookmarks();
        render();
      } else if (action === "prev-practice") {
        triggerHaptic();
        if (state.practiceIndex > 0) {
          state.practiceIndex--;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "next-practice") {
        triggerHaptic();
        if (state.practiceIndex < state.practiceList.length - 1) {
          state.practiceIndex++;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "select-exam-option") {
        triggerHaptic();
        var eOptIdx = parseInt(btn.getAttribute("data-idx"), 10);
        var eq = state.exam.questions[state.exam.currentIndex];
        state.exam.userAnswers[eq.id] = eOptIdx;
        persistExam();
        render();
      } else if (action === "toggle-exam-review") {
        triggerHaptic();
        var req = state.exam.questions[state.exam.currentIndex];
        if (state.exam.markedForReview[req.id]) delete state.exam.markedForReview[req.id];
        else state.exam.markedForReview[req.id] = true;
        persistExam();
        render();
      } else if (action === "prev-exam-q") {
        triggerHaptic();
        if (state.exam.currentIndex > 0) {
          state.exam.currentIndex--;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "next-exam-q") {
        triggerHaptic();
        if (state.exam.currentIndex < state.exam.questions.length - 1) {
          state.exam.currentIndex++;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "jump-exam-q") {
        triggerHaptic();
        var jIdx = parseInt(btn.getAttribute("data-idx"), 10);
        state.exam.currentIndex = jIdx;
        state.paletteOpen = false;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "submit-exam") {
        triggerHaptic();
        submitExam(false);
      } else if (action === "review-all") {
        triggerHaptic();
        state.exam.reviewList = state.exam.questions;
        state.exam.reviewIndex = 0;
        state.viewMode = "review";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "review-incorrect") {
        triggerHaptic();
        var wrongList = state.exam.questions.filter(function (q) {
          return state.exam.userAnswers[q.id] !== correctIndex(q);
        });
        if (!wrongList.length) {
          alert("No mistakes to review!");
          return;
        }
        state.exam.reviewList = wrongList;
        state.exam.reviewIndex = 0;
        state.viewMode = "review";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "prev-review") {
        triggerHaptic();
        if (state.exam.reviewIndex > 0) {
          state.exam.reviewIndex--;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "next-review") {
        triggerHaptic();
        if (state.exam.reviewIndex < state.exam.reviewList.length - 1) {
          state.exam.reviewIndex++;
          render();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } else if (action === "retry") {
        loadPromise = null;
        loadData().then(render);
      }
    });

    // Delegated Change / Input Events
    container.addEventListener("input", function (e) {
      if (e.target.id === "knMcqDirSearch") {
        state.practiceFilter.search = e.target.value;
        render();
        var inp = document.getElementById("knMcqDirSearch");
        if (inp) {
          inp.focus();
          inp.setSelectionRange(inp.value.length, inp.value.length);
        }
      }
    });

    container.addEventListener("input", function (e) {
      if (e.target && e.target.id === "knPyqSearchInput") {
        state.pyq.search = e.target.value;
        state.pyq.page = 0;
        var filtered = getFilteredPYQs();
        var cardsContainer = container.querySelector("#knPyqCardsContainer");
        var paginationContainer = container.querySelector("#knPyqPaginationContainer");
        var statCountEl = container.querySelector("#knPyqTotalQsVal");
        if (statCountEl) statCountEl.textContent = filtered.length;
        if (cardsContainer) cardsContainer.outerHTML = renderPyqCardsHTML(filtered);
        if (paginationContainer) paginationContainer.outerHTML = renderPyqPaginationHTML(filtered);
      } else if (e.target && e.target.id === "knPyqFaqSearchInput") {
        state.pyq.faqSearch = e.target.value;
        var faqCardsContainer = container.querySelector("#knPyqFaqCardsContainer");
        if (faqCardsContainer) {
          faqCardsContainer.outerHTML = renderPyqFrequentlyAskedCardsHTML();
        }
      }
    });

    container.addEventListener("change", function (e) {
      if (e.target.id === "knMcqDirExamFilter") {
        state.practiceFilter.exam = e.target.value;
        filterPracticeList();
        render();
      } else if (e.target.id === "knMcqDirDiffFilter") {
        state.practiceFilter.difficulty = e.target.value;
        filterPracticeList();
        render();
      } else if (e.target.id === "knPracticeChapSelect") {
        state.practiceFilter.chapterId = e.target.value;
        state.practiceFilter.topicId = "";
        state.practiceIndex = 0;
        filterPracticeList();
        render();
      } else if (e.target.id === "knPracticeViewSelect") {
        state.practiceFilter.view = e.target.value;
        if (e.target.value === "pyq") {
          state.practiceFilter.exam = "all";
        }
        state.practiceIndex = 0;
        filterPracticeList();
        render();
      }
    });

    // Builder Chips and Toggles
    container.addEventListener("click", function (e) {
      var chip = e.target.closest(".kn-mcq-chip");
      if (chip) {
        var group = chip.parentElement;
        group.querySelectorAll(".kn-mcq-chip").forEach(function (c) { c.classList.remove("is-selected"); });
        chip.classList.add("is-selected");
        return;
      }

      if (e.target.id === "btnSelectAllChaps") {
        var box = document.getElementById("builderChapsBox");
        if (box) box.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = true; });
      } else if (e.target.id === "btnClearAllChaps") {
        var box2 = document.getElementById("builderChapsBox");
        if (box2) box2.querySelectorAll('input[type="checkbox"]').forEach(function (cb) { cb.checked = false; });
      } else if (e.target.id === "btnTogglePalette") {
        state.paletteOpen = !state.paletteOpen;
        render();
      } else if (e.target.id === "btnLaunchCustomTest") {
        // Collect builder selections
        var eg = document.querySelector("#builderExamGroup .kn-mcq-chip.is-selected");
        var cg = document.querySelector("#builderCountGroup .kn-mcq-chip.is-selected");
        var dg = document.querySelector("#builderDiffGroup .kn-mcq-chip.is-selected");
        var tg = document.querySelector("#builderTimerGroup .kn-mcq-chip.is-selected");

        var examVal = eg ? eg.getAttribute("data-val") : "all";
        var countVal = cg ? parseInt(cg.getAttribute("data-val"), 10) : 25;
        var diffVal = dg ? dg.getAttribute("data-val") : "all";
        var timerVal = tg ? parseInt(tg.getAttribute("data-val"), 10) : 0;

        var selectedChaps = [];
        var chapsBox = document.getElementById("builderChapsBox");
        if (chapsBox) {
          chapsBox.querySelectorAll('input[type="checkbox"]:checked').forEach(function (cb) {
            selectedChaps.push(cb.value);
          });
        }

        if (!selectedChaps.length) {
          alert("Please select at least one chapter.");
          return;
        }

        startCustomExam({
          exam: examVal,
          count: countVal,
          difficulty: diffVal,
          timerPerQ: timerVal,
          chapterIds: selectedChaps
        });
      }
    });

    // Keyboard Shortcuts (Arrows, 1-4, M)
    if (!hasWiredKeydown) {
      hasWiredKeydown = true;
      document.addEventListener("keydown", function (e) {
        if (!container || !document.body.contains(container) || !container.offsetParent) return;
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

        if (state.viewMode === "practice") {
          if (e.key === "ArrowLeft") {
            if (state.practiceIndex > 0) {
              state.practiceIndex--;
              render();
            }
          } else if (e.key === "ArrowRight") {
            if (state.practiceIndex < state.practiceList.length - 1) {
              state.practiceIndex++;
              render();
            }
          } else if (["1", "2", "3", "4", "a", "b", "c", "d", "A", "B", "C", "D"].indexOf(e.key) !== -1) {
            var k = e.key.toUpperCase();
            var idx = (k === "1" || k === "A") ? 0 : (k === "2" || k === "B") ? 1 : (k === "3" || k === "C") ? 2 : 3;
            var curQ = state.practiceList[state.practiceIndex];
            if (curQ && state.answers[curQ.id] === undefined) {
              state.answers[curQ.id] = { selected: idx, correct: idx === correctIndex(curQ) };
              persistProgress();
              render();
            }
          } else if (e.key === "m" || e.key === "M") {
            var curQ2 = state.practiceList[state.practiceIndex];
            if (curQ2) {
              if (state.bookmarks[curQ2.id]) delete state.bookmarks[curQ2.id];
              else state.bookmarks[curQ2.id] = true;
              persistBookmarks();
              render();
            }
          }
        }
      });
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  function open(opts) {
    opts = opts || {};
    var mount = document.getElementById("knMcqSection") ||
                document.getElementById("ronStudyApp") ||
                document.querySelector(".st-page") ||
                document.body;

    if (!container) {
      container = document.createElement("div");
      container.className = "kn-mcq-platform";
      container.id = "knMcqPlatform";

      // If dedicated section exists, put it there
      var dedicatedSection = document.getElementById("knMcqSection");
      if (dedicatedSection) {
        dedicatedSection.innerHTML = "";
        dedicatedSection.appendChild(container);
      } else if (mount.id === "ronStudyApp") {
        mount.innerHTML = "";
        mount.appendChild(container);
      } else {
        mount.prepend(container);
      }
      wireEvents();
    }

    // Configure initial view based on options
    if (opts.viewMode === "pyq" || opts.view === "pyq") {
      state.viewMode = "pyq";
      var rawMode = opts.pyqMode || opts.mode || "topic";
      if (rawMode === "frequently-asked" || rawMode === "faq" || rawMode === "frequent") {
        state.pyq.mode = "frequent";
      } else {
        state.pyq.mode = rawMode;
      }
      var targetExam = opts.pyqExam || opts.exam;
      if (targetExam) {
        var teUpper = String(targetExam).trim().toUpperCase();
        if (teUpper.indexOf("2026") !== -1 || teUpper.indexOf("INI-CET") !== -1 || teUpper.indexOf("INICET") !== -1) {
          state.pyq.exam = "INI-CET-SS-2026";
        } else if (teUpper.indexOf("INI") !== -1 || teUpper.indexOf("NOV") !== -1) {
          state.pyq.exam = "INI-SS";
        } else if (teUpper.indexOf("NEET") !== -1) {
          state.pyq.exam = "NEET-SS";
        }
      }
      if (opts.pyqYear || opts.year) state.pyq.year = opts.pyqYear || opts.year;
      if (opts.pyqTopic || opts.topic) state.pyq.topic = opts.pyqTopic || opts.topic;
      state.pyq.page = 0;
      state.pyq.search = "";
      try {
        var urlPyq = new URL(window.location.href);
        urlPyq.searchParams.set("view", "pyq");
        if (state.pyq.exam) urlPyq.searchParams.set("exam", state.pyq.exam);
        window.history.replaceState({ view: "pyq", exam: state.pyq.exam }, "", urlPyq.toString());
      } catch (_) {}
    } else if (opts.chapterId !== undefined || opts.topicId !== undefined) {
      state.viewMode = opts.viewMode || "practice";
      var tId = opts.topicId ? String(opts.topicId).trim() : "";
      var mappedTopics = "";
      if (tId) {
        if (STUDY_TO_TOPIC[tId]) {
          mappedTopics = STUDY_TO_TOPIC[tId];
        } else {
          mappedTopics = tId;
        }
      }
      var chId = opts.chapterId ? String(opts.chapterId).trim() : "";
      state.practiceFilter.chapterId = chId;
      state.practiceFilter.topicId = mappedTopics;
      state.practiceFilter.view = opts.view || "all";
      state.practiceIndex = 0;

      // Update URL parameters for clean contextual navigation
      try {
        var url = new URL(window.location.href);
        url.searchParams.set("view", "mcq");
        if (chId) url.searchParams.set("chapter", chId);
        else url.searchParams.delete("chapter");
        if (tId) url.searchParams.set("topic", tId);
        else url.searchParams.delete("topic");
        window.history.replaceState({ view: "mcq", chapter: chId, topic: tId }, "", url.toString());
      } catch (_) {}
    } else if (opts.viewMode) {
      state.viewMode = opts.viewMode;
      if (opts.view) {
        state.practiceFilter.view = opts.view;
        state.practiceFilter.chapterId = "";
        state.practiceFilter.topicId = "";
      }
      try {
        var url2 = new URL(window.location.href);
        url2.searchParams.set("view", "mcq");
        if (opts.view === "recall2025") url2.searchParams.set("recall", "2025");
        window.history.replaceState({ view: "mcq", subview: opts.view }, "", url2.toString());
      } catch (_) {}
    } else {
      if (opts.view) {
        state.practiceFilter.view = opts.view;
      }
      state.viewMode = "directory";
    }

    if (state.mcqs.length) {
      filterPracticeList();
    }
    render();
    loadData().then(function () {
      filterPracticeList();
      render();
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function close() {
    clearExamTimer();
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete("view");
      url.searchParams.delete("mcq");
      url.searchParams.delete("chapter");
      url.searchParams.delete("chapterId");
      // Note: Preserve 'topic' / 'topicId' so Study Mode retains the active topic upon return
      window.history.replaceState({}, "", url.toString());
    } catch (_) {}

    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
      container = null;
    }

    if (typeof window.KN_STUDY_RETURN === "function") {
      window.KN_STUDY_RETURN();
    } else {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = "study.html";
      }
    }
  }

  window.KN_MCQ = {
    open: open,
    close: close,
    startTest: startCustomExam,
    _state: state,
    _ready: true
  };

  // Auto-init if on a page with #knMcqSection or query param mcq=true or view=pyq
  function checkUrlAndInit() {
    var urlParams = new URLSearchParams(window.location.search);
    var isPyqParam = urlParams.get("view") === "pyq" || urlParams.get("pyq") === "true" || urlParams.get("view") === "mcq" || urlParams.get("mcq") === "true";
    if (isPyqParam) {
      var modeParam = urlParams.get("mode") || urlParams.get("pyqMode");
      if (!modeParam && (urlParams.get("faq") === "true" || urlParams.get("frequent") === "true" || urlParams.get("freq") === "true")) {
        modeParam = "frequent";
      }
      open({
        viewMode: "pyq",
        view: "pyq",
        pyqExam: urlParams.get("exam") || urlParams.get("pyqExam"),
        pyqYear: urlParams.get("year") || urlParams.get("pyqYear") || urlParams.get("session"),
        pyqTopic: urlParams.get("topic") || urlParams.get("pyqTopic"),
        pyqMode: modeParam
      });
      return;
    }
    if (urlParams.get("view") === "mcq" || urlParams.get("mcq") === "true") {
      var chParam = urlParams.get("chapter") || urlParams.get("chapterId");
      var tpParam = urlParams.get("topic") || urlParams.get("topicId");
      var vParam = urlParams.get("recall") === "2025" ? "recall2025" : (urlParams.get("subview") || "all");
      open({ chapterId: chParam, topicId: tpParam, view: vParam });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkUrlAndInit);
  } else {
    checkUrlAndInit();
  }

})();
