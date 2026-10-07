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

  // Topic mapping to KnockoutNotes Study Mode
  var TOPIC_TO_STUDY = {
    "cc-management-of-brain-dead-organ-donors": "brain-death-organ-donation",
    "cc-catheter-related-blood-stream-infection": "central-venous-pulmonary-artery-catheters",
    "cc-scoring-systems-in-the-icu": "icu-organization-scoring-ethics",
    "cc-assessing-adequacy-of-oxygen-delivery": "venturi-oxygen-devices",
    "cc-shock-pathophysiology-and-classification": "hemodynamics-shock-approach",
    "cc-haemodynamic-monitoring-i": "asa-monitoring",
    "cc-central-venous-line-and-cvp-measurement": "central-venous-pulmonary-artery-catheters",
    "cc-cardiac-output-monitoring": "hemodynamics-shock-approach",
    "cc-assessing-fluid-responsiveness-in-the-icu": "fluid-responsiveness-dynamic-indices",
    "cc-cardiogenic-shock-i": "cardiogenic-shock-scai",
    "cc-cardiogenic-shock-ii": "cardiogenic-shock-scai",
    "cc-anaphylactic-shock": "anaphylactic-neurogenic-endocrine-shock",
    "cc-organ-dysfunction-in-sepsis": "sepsis3-hour1-bundle-resuscitation",
    "cc-sepsis-2026-clinical-guidelines": "sepsis3-hour1-bundle-resuscitation",
    "cc-extracorporeal-therapies-in-sepsis": "haemodialysis-crrt-dialysis-circuit",
    "cc-respiratory-management-in-specific-clinical-scenarios-i": "acute-respiratory-failure-types",
    "cc-respiratory-management-in-specific-clinical-scenarios-ii": "acute-respiratory-failure-types",
    "cc-niv-failure-predictors-hacor-score": "thrive-hfno-apneic-oxygenation",
    "cc-high-flow-nasal-cannula-hfnc-and-rox-index": "thrive-hfno-apneic-oxygenation",
    "cc-basics-of-mechanical-ventilation": "ventilators-classification",
    "cc-ventilator-graphics-and-basic-modes-of-mechanical-ventilation": "ventilator-modes-waveforms-asynchrony",
    "cc-patient-ventilator-asynchrony": "ventilator-modes-waveforms-asynchrony",
    "cc-weaning-from-mechanical-ventilation": "ventilator-liberation-weaning-failure",
    "cc-advanced-modes-of-mechanical-ventilation": "ventilators-classification",
    "cc-acute-respiratory-distress-syndrome-i": "ards-berlin-lung-protective",
    "cc-acute-respiratory-distress-syndrome-ii": "ards-refractory-rescue-ecmo",
    "cc-acute-severe-asthma": "status-asthmaticus-copd-icu",
    "cc-acute-exacerbation-of-copd": "status-asthmaticus-copd-icu",
    "cc-malignant-arrhythmias-in-the-icu": "acute-coronary-syndromes-cardiogenic-shock",
    "cc-cardiac-tamponade-and-pericardial-emergencies": "cardiac-arrhythmias-tamponade-pocus",
    "cc-post-cardiac-arrest-care": "hypoxic-ischemic-encephalopathy-ttm-postarrest",
    "cc-acute-kidney-injury": "aki-kdigo-crrt-modalities",
    "cc-renal-replacement-therapy": "haemodialysis-crrt-dialysis-circuit",
    "cc-interpreting-abg": "abg-interpretation",
    "cc-disorders-of-calcium-magnesium-phosphorus-metabolism": "severe-electrolyte-disturbances-icu",
    "cc-icu-management-of-traumatic-brain-injury": "tbi-neuromonitoring-raised-icp",
    "cc-monitoring-and-management-of-raised-icp": "tbi-neuromonitoring-raised-icp",
    "cc-status-epilepticus": "status-epilepticus-rse-srse",
    "cc-brain-death": "brain-death-organ-donor-resuscitation",
    "cc-pharmacokinetics": "pkpd-organ-support-crrt-ecmo-vasodilators",
    "cc-interpreting-antibiogram-and-mic": "empiric-sepsis-mdr-bundles",
    "cc-massive-transfusion-in-the-icu": "hypovolemic-hemorrhagic-shock",
    "cc-hematological-emergencies-in-critical-illness": "hypovolemic-hemorrhagic-shock",
    "cc-general-approach-to-poisoning": "toxidromes-general-approach",
    "cc-paracetamol-poisoning": "toxidromes-general-approach",
    "cc-organophosphorus-poisoning": "organophosphates-carbamates",
    "cc-management-of-burn-patient-in-icu": "burn-resuscitation-inhalation-injury",
    "cc-polytrauma-resuscitation-and-damage-control": "trauma-resuscitation-damage-control",
    "cc-obstetric-critical-care-general-considerations": "preeclampsia-eclampsia-hellp-syndrome",
    "cc-preeclampsia-eclampsia-and-hellp": "preeclampsia-eclampsia-hellp-syndrome",
    "cc-vv-and-va-ecmo-indications-and-circuits": "ecmo-vv-va-principles-cannulation",
    "cc-ecmo-cannulation-mechanics-and-troubleshooting": "ecmo-vv-va-principles-cannulation",
    "cc-infections-in-the-immunocompromised-host": "antifungals-icu"
  };

  var STUDY_TO_TOPIC = {};
  for (var tk in TOPIC_TO_STUDY) {
    if (Object.prototype.hasOwnProperty.call(TOPIC_TO_STUDY, tk)) {
      STUDY_TO_TOPIC[TOPIC_TO_STUDY[tk]] = tk;
    }
  }

  // State
  var state = {
    mcqs: [],             // All loaded MCQs
    chapters: [],         // All chapters
    topics: [],           // All topics
    viewMode: "directory",// "directory" | "practice" | "builder" | "exam" | "results" | "review"
    practiceFilter: {
      chapterId: "",
      topicId: "",
      exam: "all",
      difficulty: "all",
      view: "all",        // "all" | "bookmarks" | "incorrect"
      search: ""
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
    return String.fromCharCode(65 + i);
  }

  function correctIndex(m) {
    var a = String(m.answer || "").trim().toUpperCase();
    var code = a.charCodeAt(0) - 65;
    return (code >= 0 && code < m.options.length) ? code : -1;
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
      fetchJson(MASTER_MCQ_FILE).catch(function () { return []; }),
      fetchJson(CHAPTERS_FILE).catch(function () { return []; }),
      fetchJson(TOPICS_FILE).catch(function () { return []; }),
      Promise.all(CHUNK_FILES.map(function (c) {
        return fetchJson(c).catch(function () { return []; });
      }))
    ]).then(function (results) {
      var master = results[0];
      var chaps = results[1] || [];
      var topics = results[2] || [];
      var chunks = results[3] || [];

      var arrays = [];
      if (Array.isArray(master) && master.length) arrays.push(master);
      chunks.forEach(function (c) {
        if (Array.isArray(c) && c.length) arrays.push(c);
      });

      var merged = mergeMcqs(arrays);
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
      if (ch && String(m.chapterId) !== String(ch)) return false;
      if (tp && m.topicId !== tp) return false;
      if (ex !== "all" && m.exam !== ex) return false;
      if (df !== "all" && m.difficulty !== df) return false;
      if (vf === "bookmarks" && !state.bookmarks[m.id]) return false;
      if (vf === "incorrect") {
        var ans = state.answers[m.id];
        if (!ans || ans.correct) return false;
      }
      if (sq) {
        var qText = (m.question + " " + (m.options || []).join(" ") + " " + (m.explanation || "")).toLowerCase();
        if (qText.indexOf(sq) === -1) return false;
      }
      return true;
    });

    // If specific subtopic filter produced 0 results, fall back to chapter questions
    if (state.practiceList.length === 0 && tp) {
      state.practiceList = state.mcqs.filter(function (m) {
        if (ch && String(m.chapterId) !== String(ch)) return false;
        if (ex !== "all" && m.exam !== ex) return false;
        if (df !== "all" && m.difficulty !== df) return false;
        if (vf === "bookmarks" && !state.bookmarks[m.id]) return false;
        if (vf === "incorrect") {
          var ans2 = state.answers[m.id];
          if (!ans2 || ans2.correct) return false;
        }
        return true;
      });
    }

    if (state.practiceIndex >= state.practiceList.length) {
      state.practiceIndex = 0;
    }
  }

  // ── UI Rendering: Top Bar & Navigation ──────────────────────────────────
  function renderTopBar() {
    var isExam = state.viewMode === "exam";
    var isResults = state.viewMode === "results";
    var isReview = state.viewMode === "review";

    var title = "NEET-SS / INI-SS Critical Care MCQ Master Engine";
    var sub = "293 Verified Examination Questions & Landmark Trials";

    if (isExam) {
      title = state.exam.title || "Custom Examination";
      sub = "Live Test Mode · Q " + (state.exam.currentIndex + 1) + " of " + state.exam.questions.length;
    } else if (isResults) {
      title = "Examination Performance Analytics";
      sub = "Scorecard & Clinical Topic Diagnostic";
    } else if (isReview) {
      title = "Post-Test In-Depth Review";
      sub = "Rationales, Why-Wrong & Study Links";
    }

    var actions = '';
    if (isExam) {
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--danger kn-mcq-btn--sm" data-action="submit-exam">Finish &amp; Submit Test</button>';
    } else if (isResults) {
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--sm" data-action="go-directory">Directory</button>';
      actions += '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent kn-mcq-btn--sm" data-action="go-builder">New Custom Test</button>';
    } else {
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

    // Hero & Stats
    var html = (
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
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--accent" data-action="go-builder">⚡ Build Custom Mock Test</button>' +
          '<button type="button" class="kn-mcq-btn" data-action="practice-filter-view" data-view="bookmarks">⭐ Starred (' + bookmarkedCount + ')</button>' +
          '<button type="button" class="kn-mcq-btn" data-action="practice-filter-view" data-view="incorrect">❌ Mistakes (' + (answeredCount - correctCount) + ')</button>' +
        '</div>' +
      '</section>' +

      '<section class="kn-mcq-stats-strip">' +
        '<div class="kn-mcq-stat-card"><span class="kn-mcq-stat-val">' + totalQuestions + '</span><span class="kn-mcq-stat-label">Total Questions</span></div>' +
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
      return (
        '<div class="kn-mcq-qcard" style="text-align:center; padding:48px 20px;">' +
          '<h3 style="margin-top:0;">📭 No questions match your current filters</h3>' +
          '<p style="color:var(--text-muted); margin-bottom:20px;">Try clearing filters or switching chapters to view available MCQs.</p>' +
          '<button type="button" class="kn-mcq-btn kn-mcq-btn--primary" data-action="clear-filters">Reset All Filters</button>' +
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

    var html = (
      '<div class="kn-mcq-filter-bar">' +
        '<div class="kn-mcq-filter-group" style="flex:1;">' +
          '<select class="kn-mcq-select" id="knPracticeChapSelect">' + chapterSelectOpts + '</select>' +
          '<select class="kn-mcq-select" id="knPracticeViewSelect">' +
            '<option value="all"' + (state.practiceFilter.view === "all" ? " selected" : "") + '>All Questions</option>' +
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
            '<span class="kn-mcq-badge kn-mcq-badge--exam">' + esc(m.exam) + (m.year ? ' ' + m.year : '') + '</span>' +
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
      var correctText = letterAt(cIdx) + ". " + m.options[cIdx];
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
            '<p>' + esc(m.examPearl) + '</p>' +
          '</div>'
        );
      }

      // Links: Study This Topic + External Citation
      html += (
        '<div class="kn-mcq-links-row">' +
          '<a href="' + esc(getStudyLink(m.topicId, m.chapterId)) + '" class="kn-mcq-study-link">' +
            '📚 Study This Topic in Knockout Notes →' +
          '</a>'
      );

      if (m.hyperlinkedReference && m.hyperlinkedReference.url) {
        html += (
          '<a href="' + esc(m.hyperlinkedReference.url) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-ref-link">' +
            '📄 Reference: ' + esc(m.hyperlinkedReference.label || "Authoritative Source") + ' ↗' +
          '</a>'
        );
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
            '<span class="kn-mcq-badge kn-mcq-badge--exam">' + esc(currentQ.exam) + '</span>' +
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
            '<a href="' + esc(getStudyLink(wt.topicId, wt.chapterId)) + '" class="kn-mcq-btn kn-mcq-btn--sm kn-mcq-btn--primary">📖 Study Topic in Knockout Notes →</a>' +
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
    var total = list.length;
    var idx = exam.reviewIndex || 0;
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
        '<a href="' + esc(getStudyLink(m.topicId, m.chapterId)) + '" class="kn-mcq-study-link">' +
          '📚 Study This Topic in Knockout Notes →' +
        '</a>'
    );
    if (m.hyperlinkedReference && m.hyperlinkedReference.url) {
      html += (
        '<a href="' + esc(m.hyperlinkedReference.url) + '" target="_blank" rel="noopener noreferrer" class="kn-mcq-ref-link">' +
          '📄 Reference: ' + esc(m.hyperlinkedReference.label) + ' ↗' +
        '</a>'
      );
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

    // Clear prior timer
    if (state.exam && state.exam.timerInterval) {
      clearInterval(state.exam.timerInterval);
    }

    state.exam = {
      id: "exam-" + Date.now(),
      title: (examTarget === "all" ? "NEET-SS & INI-SS" : examTarget) + " Mock Test (" + selectedQuestions.length + " Qs)",
      questions: selectedQuestions,
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

    if (totalSeconds > 0) {
      state.exam.timerInterval = setInterval(function () {
        if (state.exam.timerRemaining > 0) {
          state.exam.timerRemaining--;
          var badge = container ? container.querySelector(".kn-mcq-timer-badge") : null;
          if (badge) {
            var mins = Math.floor(state.exam.timerRemaining / 60);
            var secs = state.exam.timerRemaining % 60;
            badge.textContent = "⏱ " + (mins < 10 ? "0" : "") + mins + ":" + (secs < 10 ? "0" : "") + secs;
          }
        } else {
          clearInterval(state.exam.timerInterval);
          submitExam(true);
        }
      }, 1000);
    }

    state.viewMode = "exam";
    state.paletteOpen = false;
    persistExam();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
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

    if (state.exam.timerInterval) {
      clearInterval(state.exam.timerInterval);
      state.exam.timerInterval = null;
    }

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

      if (action === "exit-to-study") {
        triggerHaptic();
        if (typeof window.KN_STUDY_RETURN === "function") {
          if (container && container.parentElement) {
            container.parentElement.removeChild(container);
            container = null;
          }
          window.KN_STUDY_RETURN();
        } else {
          window.location.href = "study.html";
        }
        return;
      }

      if (action === "go-directory") {
        triggerHaptic();
        state.viewMode = "directory";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "go-builder") {
        triggerHaptic();
        state.viewMode = "builder";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "go-results") {
        triggerHaptic();
        state.viewMode = "results";
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (action === "practice-all") {
        triggerHaptic();
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
        state.practiceFilter.view = btn.getAttribute("data-view");
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
    document.addEventListener("keydown", function (e) {
      if (!container || !container.offsetParent) return;
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
    if (opts.viewMode) {
      state.viewMode = opts.viewMode;
    } else if (opts.chapterId !== undefined || opts.topicId !== undefined) {
      state.viewMode = "practice";
      var tId = opts.topicId ? String(opts.topicId) : "";
      if (tId && STUDY_TO_TOPIC[tId]) {
        tId = STUDY_TO_TOPIC[tId];
      }
      state.practiceFilter.chapterId = opts.chapterId ? String(opts.chapterId) : "";
      state.practiceFilter.topicId = tId;
      state.practiceFilter.view = opts.view || "all";
      state.practiceIndex = 0;
    } else {
      state.viewMode = "directory";
    }

    render();
    loadData().then(function () {
      filterPracticeList();
      render();
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function close() {
    if (typeof window.KN_STUDY_RETURN === "function") {
      if (container && container.parentElement) {
        container.parentElement.removeChild(container);
        container = null;
      }
      window.KN_STUDY_RETURN();
    } else {
      state.viewMode = "directory";
      render();
    }
  }

  window.KN_MCQ = {
    open: open,
    close: close,
    startTest: startCustomExam,
    _state: state,
    _ready: true
  };

  // Auto-init if on a page with #knMcqSection or query param mcq=true
  document.addEventListener("DOMContentLoaded", function () {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("view") === "mcq" || urlParams.get("mcq") === "true") {
      var chParam = urlParams.get("chapter") || urlParams.get("chapterId");
      var tpParam = urlParams.get("topic") || urlParams.get("topicId");
      setTimeout(function () {
        open({ chapterId: chParam, topicId: tpParam });
      }, 100);
    }
  });

})();
