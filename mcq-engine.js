/* ==========================================================================
   KNOCKOUTNOTES — NEET-SS / INI-SS Critical Care MCQ Practice Engine
   File: mcq-engine.js
   Architecture:
   - Data-driven: Loads from criticalCare/mcqs.json (master) and individual
     chunk files (mcqs_ch01_to_ch08.json, mcqs_ch09_to_ch16.json,
     mcqs_ch17_to_ch24.json, mcqs_ch25_to_ch31.json).
   - Offline-first: Uses standard fetch compatible with Service Worker cache.
   - Persistence: Remembers answers & bookmarks in localStorage.
   - Keyboard accessible: Arrows (prev/next), keys 1-4 / A-D, Escape to close.
   - Filters: Chapter, Topic, Bookmarked only (⭐), Incorrect only (❌).
   - Exposed API: window.KN_MCQ.open({ chapterId, topicId }) / .close().
   ========================================================================== */

(function () {
  "use strict";

  if (window.KN_MCQ && window.KN_MCQ._ready) return;

  var STORAGE_PROGRESS_KEY = "kn_cc_mcq_progress_v1";
  var STORAGE_BOOKMARKS_KEY = "kn_cc_mcq_bookmarks_v1";

  // Primary data files and chunks
  var MASTER_MCQ_FILE = "criticalCare/mcqs.json";
  var CHAPTERS_FILE = "criticalCare/chapters.json";
  var TOPICS_FILE = "criticalCare/topics.json";

  var CHUNK_FILES = [
    "criticalCare/chunks/mcqs_ch01_to_ch08.json",
    "criticalCare/chunks/mcqs_ch09_to_ch16.json",
    "criticalCare/chunks/mcqs_ch17_to_ch24.json",
    "criticalCare/chunks/mcqs_ch25_to_ch31.json"
  ];

  // Session state
  var state = {
    mcqs: [],            // merged, deduplicated, sorted question bank
    chapters: [],        // chapter metadata
    topics: [],          // topic metadata
    filtered: [],        // questions matching current filters
    chapterFilter: "",   // "" = all chapters
    topicFilter: "",     // "" = all topics
    viewFilter: "all",   // "all" | "bookmarks" | "incorrect"
    index: 0,            // current question index in filtered list
    answers: {},         // questionId -> { selected: index, correct: bool }
    bookmarks: {},       // questionId -> true
    loading: true,
    error: null
  };

  var loadPromise = null;
  var overlay = null;

  // Restore persistence
  try {
    var savedAnswers = localStorage.getItem(STORAGE_PROGRESS_KEY);
    if (savedAnswers) state.answers = JSON.parse(savedAnswers) || {};
  } catch (_) {
    state.answers = {};
  }

  try {
    var savedBookmarks = localStorage.getItem(STORAGE_BOOKMARKS_KEY);
    if (savedBookmarks) state.bookmarks = JSON.parse(savedBookmarks) || {};
  } catch (_) {
    state.bookmarks = {};
  }

  function persistProgress() {
    try {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(state.answers));
    } catch (_) {}
  }

  function persistBookmarks() {
    try {
      localStorage.setItem(STORAGE_BOOKMARKS_KEY, JSON.stringify(state.bookmarks));
    } catch (_) {}
  }

  // ── Helpers ─────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function letterAt(i) {
    return String.fromCharCode(65 + i); // 0 -> A, 1 -> B, ...
  }

  function correctIndex(m) {
    var a = String(m.answer || "").trim().toUpperCase();
    var code = a.charCodeAt(0) - 65;
    return (code >= 0 && code < m.options.length) ? code : -1;
  }

  function chapterTitle(id) {
    var ch = state.chapters.find(function (c) { return String(c.id) === String(id); });
    return ch ? ch.title : "";
  }

  function topicTitle(id) {
    if (!id) return "";
    var t = state.topics.find(function (x) { return x.id === id; });
    return t ? t.title : id;
  }

  function optionText(raw) {
    var s = String(raw || "").trim();
    return s.replace(/^[A-Z][.\)]\s+/, "");
  }

  // ── Resilient Data Fetching ─────────────────────────────────────────────
  function safeFetchJSON(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
      return res.json();
    }).catch(function (err) {
      console.warn("[MCQ Engine] Failed to fetch " + url + ":", err);
      return null;
    });
  }

  function mergeMcqs(arrays) {
    var seen = {};
    var out = [];
    arrays.forEach(function (arr) {
      (arr || []).forEach(function (m) {
        if (!m || !m.id || !m.question || !Array.isArray(m.options) ||
            m.options.length < 2 || !m.answer) return;
        var key = m.id + "|" + (m.chapterId || "") + "|" + String(m.question).trim().slice(0, 80).toLowerCase();
        if (seen[key]) return;
        seen[key] = true;
        out.push(m);
      });
    });
    return out;
  }

  function loadData() {
    if (loadPromise) return loadPromise;

    loadPromise = Promise.all([
      safeFetchJSON(MASTER_MCQ_FILE),
      safeFetchJSON(CHAPTERS_FILE),
      safeFetchJSON(TOPICS_FILE),
      Promise.all(CHUNK_FILES.map(safeFetchJSON))
    ]).then(function (results) {
      var masterMcqs = results[0];
      var chapters = results[1] || [];
      var topics = results[2] || [];
      var chunkResults = results[3] || [];

      var mcqArrays = [];
      if (Array.isArray(masterMcqs) && masterMcqs.length > 0) {
        mcqArrays.push(masterMcqs);
      }
      chunkResults.forEach(function (c) {
        if (Array.isArray(c) && c.length > 0) {
          mcqArrays.push(c);
        }
      });

      var merged = mergeMcqs(mcqArrays);

      state.mcqs = merged;
      state.chapters = Array.isArray(chapters) ? chapters : [];
      state.topics = Array.isArray(topics) ? topics : [];
      state.loading = false;
      state.error = merged.length ? null : new Error("No MCQ questions available in data sources.");

      applyFilters();
      return merged;
    }).catch(function (err) {
      state.loading = false;
      state.error = err || new Error("Failed to load MCQ data.");
      return [];
    });

    return loadPromise;
  }

  // ── Filtering ───────────────────────────────────────────────────────────
  function applyFilters() {
    var ch = state.chapterFilter;
    var tp = state.topicFilter;
    var vf = state.viewFilter;

    state.filtered = state.mcqs.filter(function (m) {
      if (ch && String(m.chapterId) !== String(ch)) return false;
      if (tp && m.topicId !== tp) return false;
      if (vf === "bookmarks" && !state.bookmarks[m.id]) return false;
      if (vf === "incorrect") {
        var ans = state.answers[m.id];
        if (!ans || ans.correct) return false;
      }
      return true;
    });

    if (state.index >= state.filtered.length) {
      state.index = 0;
    }
  }

  function topicsWithMcqs() {
    var ch = state.chapterFilter;
    var ids = {};
    state.mcqs.forEach(function (m) {
      if (m.topicId && (!ch || String(m.chapterId) === String(ch))) {
        ids[m.topicId] = true;
      }
    });
    return state.topics
      .filter(function (t) { return ids[t.id]; })
      .map(function (t) { return { id: t.id, title: t.title, chapterId: t.chapterId }; });
  }

  function viewStats() {
    var answered = 0, correct = 0;
    state.filtered.forEach(function (m) {
      var a = state.answers[m.id];
      if (a) {
        answered++;
        if (a.correct) correct++;
      }
    });
    var pct = answered ? Math.round((correct / answered) * 100) : 0;
    return { answered: answered, correct: correct, total: state.filtered.length, pct: pct };
  }

  // ── Rendering ───────────────────────────────────────────────────────────
  function renderBadges(m) {
    var badges = [];
    badges.push('<span class="kn-mcq-badge kn-mcq-badge--chapter">Ch ' +
      esc(m.chapterId) + " · " + esc(chapterTitle(m.chapterId)) + "</span>");
    if (m.topicId) {
      badges.push('<span class="kn-mcq-badge kn-mcq-badge--topic">' + esc(topicTitle(m.topicId)) + "</span>");
    }
    if (m.difficulty) {
      badges.push('<span class="kn-mcq-badge kn-mcq-badge--diff" data-diff="' +
        esc(m.difficulty) + '">' + esc(m.difficulty) + "</span>");
    }
    if (m.exam) {
      badges.push('<span class="kn-mcq-badge">' + esc(m.exam) +
        (m.year ? " " + esc(m.year) : "") + "</span>");
    }
    if (m.sourceType) {
      badges.push('<span class="kn-mcq-badge kn-mcq-badge--source">' + esc(m.sourceType) + "</span>");
    }
    return badges.join("");
  }

  function renderOptions(m) {
    var a = state.answers[m.id];
    var cIdx = correctIndex(m);
    return m.options.map(function (opt, i) {
      var cls = "kn-mcq-option";
      var ariaPressed = "false";
      if (a) {
        if (i === cIdx) cls += " is-correct";
        else if (i === a.selected) cls += " is-wrong";
        if (i === a.selected) ariaPressed = "true";
      }
      return (
        '<button type="button" class="' + cls + '" data-mcq-option="' + i + '" ' +
        'aria-pressed="' + ariaPressed + '"' + (a ? " disabled" : "") + ">" +
        '<span class="kn-mcq-option-letter">' + letterAt(i) + "</span>" +
        '<span class="kn-mcq-option-text">' + esc(optionText(opt)) + "</span>" +
        (a && i === cIdx ? '<span class="kn-mcq-option-mark">✓</span>' : "") +
        (a && i === a.selected && i !== cIdx ? '<span class="kn-mcq-option-mark">✗</span>' : "") +
        "</button>"
      );
    }).join("");
  }

  function renderFeedback(m) {
    var a = state.answers[m.id];
    if (!a) return "";
    var cIdx = correctIndex(m);
    var correctLabel = letterAt(cIdx) + ". " + optionText(m.options[cIdx]);

    var banner = a.correct
      ? '<div class="kn-mcq-answer-banner is-correct"><span class="kn-mcq-banner-icon">✓</span>' +
        "<span><strong>Correct!</strong> Answer " + esc(correctLabel) + "</span></div>"
      : '<div class="kn-mcq-answer-banner is-wrong"><span class="kn-mcq-banner-icon">✗</span>' +
        "<span><strong>Incorrect.</strong> You chose " + esc(letterAt(a.selected) + ". " + optionText(m.options[a.selected])) +
        " — Correct answer: <strong>" + esc(correctLabel) + "</strong></span></div>";

    var html = banner;

    html += '<div class="kn-mcq-section"><h4 class="kn-mcq-section-title">📖 Explanation</h4>' +
      "<p>" + esc(m.explanation) + "</p></div>";

    // Why wrong cards
    var wrongKeys = Object.keys(m.whyWrong || {}).sort();
    if (wrongKeys.length) {
      html += '<div class="kn-mcq-section"><h4 class="kn-mcq-section-title">❌ Why the other options are wrong</h4><ul class="kn-mcq-whywrong">';
      wrongKeys.forEach(function (k) {
        var optIdx = k.charCodeAt(0) - 65;
        var picked = a.selected === optIdx;
        html += '<li class="' + (picked ? "is-picked" : "") + '">' +
          "<strong>Option " + esc(k) + (picked ? " (your answer)" : "") + ":</strong> " +
          esc(m.whyWrong[k]) + "</li>";
      });
      html += "</ul></div>";
    }

    if (m.examPearl) {
      html += '<div class="kn-mcq-pearl"><span class="kn-mcq-pearl-label">💡 Exam Pearl</span>' +
        "<p>" + esc(m.examPearl) + "</p></div>";
    }

    if (m.hyperlinkedReference && m.hyperlinkedReference.url) {
      html += '<a class="kn-mcq-ref" href="' + esc(m.hyperlinkedReference.url) +
        '" target="_blank" rel="noopener noreferrer">📄 ' +
        esc(m.hyperlinkedReference.label || "Reference") + " ↗</a>";
    }

    return html;
  }

  function renderQuestion() {
    if (state.loading) {
      return '<div class="kn-mcq-loading" role="status">⏳ Loading High Yield MCQs…</div>';
    }
    if (state.error) {
      return '<div class="kn-mcq-error" role="alert"><p>⚠️ ' + esc(state.error.message) +
        '</p><button type="button" class="kn-mcq-nav-btn" data-mcq-action="retry">↻ Retry</button></div>';
    }
    if (!state.filtered.length) {
      var msg = "📭 No MCQs match the selected filters.";
      if (state.viewFilter === "bookmarks") msg = "⭐ You have not bookmarked any MCQs yet. Star a question to save it here for quick revision.";
      if (state.viewFilter === "incorrect") msg = "🎉 Great work! No incorrectly answered MCQs under this filter.";
      return '<div class="kn-mcq-empty">' + esc(msg) + '</div>';
    }

    var m = state.filtered[state.index];
    var isBookmarked = !!state.bookmarks[m.id];

    return (
      '<article class="kn-mcq-qcard">' +
        '<div class="kn-mcq-qcard-header">' +
          '<div class="kn-mcq-badges">' + renderBadges(m) + '</div>' +
          '<button type="button" class="kn-mcq-star-btn ' + (isBookmarked ? 'is-starred' : '') + '" ' +
            'data-mcq-action="toggle-bookmark" title="' + (isBookmarked ? 'Remove Bookmark' : 'Bookmark Question (B)') + '" aria-label="Bookmark">' +
            (isBookmarked ? '★ Bookmarked' : '☆ Bookmark') +
          '</button>' +
        '</div>' +
        '<p class="kn-mcq-question">' + esc(m.question) + '</p>' +
        '<div class="kn-mcq-options" role="group" aria-label="Answer options">' +
          renderOptions(m) +
        '</div>' +
        '<div class="kn-mcq-feedback" aria-live="polite">' + renderFeedback(m) + '</div>' +
      '</article>'
    );
  }

  function render() {
    if (!overlay) return;
    var stats = viewStats();
    var total = state.filtered.length;
    var qNum = total ? state.index + 1 : 0;

    // Chapter <select>
    var chOpts = ['<option value="">All Chapters (' + esc(state.mcqs.length) + ' MCQs)</option>'];
    var chapterCounts = {};
    state.mcqs.forEach(function (m) {
      chapterCounts[m.chapterId] = (chapterCounts[m.chapterId] || 0) + 1;
    });

    state.chapters.forEach(function (c) {
      if (!chapterCounts[c.id]) return;
      chOpts.push('<option value="' + esc(c.id) + '"' +
        (String(state.chapterFilter) === String(c.id) ? ' selected' : '') + '>' +
        'Ch ' + esc(c.id) + ' · ' + esc(c.title) + ' (' + esc(chapterCounts[c.id]) + ')</option>');
    });

    // Topic <select>
    var tpOpts = ['<option value="">All Topics</option>'];
    topicsWithMcqs().forEach(function (t) {
      tpOpts.push('<option value="' + esc(t.id) + '"' +
        (state.topicFilter === t.id ? ' selected' : '') + '>#' +
        esc(t.id) + ' · ' + esc(t.title) + '</option>');
    });

    // View filter options (All, Bookmarks, Incorrect)
    var bCount = Object.keys(state.bookmarks).length;
    var iCount = 0;
    state.mcqs.forEach(function (m) {
      var a = state.answers[m.id];
      if (a && !a.correct) iCount++;
    });

    var viewOpts = [
      '<option value="all"' + (state.viewFilter === "all" ? " selected" : "") + '>All Questions</option>',
      '<option value="bookmarks"' + (state.viewFilter === "bookmarks" ? " selected" : "") + '>⭐ Starred (' + bCount + ')</option>',
      '<option value="incorrect"' + (state.viewFilter === "incorrect" ? " selected" : "") + '>❌ Incorrect (' + iCount + ')</option>'
    ];

    overlay.querySelector(".kn-mcq-chapter-select").innerHTML = chOpts.join("");
    overlay.querySelector(".kn-mcq-topic-select").innerHTML = tpOpts.join("");
    var viewSelect = overlay.querySelector(".kn-mcq-view-select");
    if (viewSelect) viewSelect.innerHTML = viewOpts.join("");

    overlay.querySelector(".kn-mcq-counter").textContent =
      total ? "Question " + qNum + " of " + total : "No questions";
    overlay.querySelector(".kn-mcq-score").innerHTML =
      '<span class="kn-mcq-score-correct">✓ ' + stats.correct + "</span> / " +
      esc(stats.answered) + " answered · " + esc(stats.pct) + "%";
    overlay.querySelector(".kn-mcq-progress-fill").style.width =
      (total ? Math.round((stats.answered / total) * 100) : 0) + "%";
    overlay.querySelector(".kn-mcq-body").innerHTML = renderQuestion();

    var prevBtn = overlay.querySelector('[data-mcq-action="prev"]');
    var nextBtn = overlay.querySelector('[data-mcq-action="next"]');
    if (prevBtn) prevBtn.disabled = state.index <= 0;
    if (nextBtn) nextBtn.disabled = state.index >= total - 1;
  }

  // ── Overlay Lifecycle & Event Delegation ────────────────────────────────
  function ensureOverlay() {
    if (overlay) return overlay;

    var host = document.getElementById("ronStudyApp") ||
               document.querySelector(".ron-study-app") ||
               document.body;

    overlay = document.createElement("div");
    overlay.className = "kn-mcq-overlay";
    overlay.id = "knMcqOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "knMcqTitle");
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="kn-mcq-sheet">' +
        '<div class="kn-mcq-sheet-head">' +
          '<div class="kn-mcq-title-wrap">' +
            '<span class="kn-mcq-title-icon">📝</span>' +
            '<h2 class="kn-mcq-title" id="knMcqTitle">High Yield MCQ Practice</h2>' +
            '<span class="kn-mcq-subtitle">Critical Care · NEET-SS / INI-SS</span>' +
          '</div>' +
          '<div class="kn-mcq-head-actions">' +
            '<button type="button" class="kn-mcq-reset-btn" data-mcq-action="reset-progress" title="Reset answers for current filter">↺ Reset</button>' +
            '<button type="button" class="kn-mcq-close-btn" data-mcq-action="close" aria-label="Close MCQ Practice">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="kn-mcq-toolbar">' +
          '<div class="kn-mcq-filters">' +
            '<label class="kn-mcq-filter-label">Chapter' +
              '<select class="kn-mcq-select kn-mcq-chapter-select" data-mcq-filter="chapter" aria-label="Filter by chapter"></select>' +
            '</label>' +
            '<label class="kn-mcq-filter-label">Topic' +
              '<select class="kn-mcq-select kn-mcq-topic-select" data-mcq-filter="topic" aria-label="Filter by topic"></select>' +
            '</label>' +
            '<label class="kn-mcq-filter-label">View' +
              '<select class="kn-mcq-select kn-mcq-view-select" data-mcq-filter="view" aria-label="Filter by view"></select>' +
            '</label>' +
          '</div>' +
          '<div class="kn-mcq-hud">' +
            '<span class="kn-mcq-counter"></span>' +
            '<span class="kn-mcq-score"></span>' +
          '</div>' +
        '</div>' +
        '<div class="kn-mcq-progress" aria-hidden="true"><div class="kn-mcq-progress-fill"></div></div>' +
        '<div class="kn-mcq-body"></div>' +
        '<div class="kn-mcq-footer">' +
          '<button type="button" class="kn-mcq-nav-btn" data-mcq-action="prev">← Previous</button>' +
          '<span class="kn-mcq-shortcut-hint">Keys: ← / →, 1-4, B (Bookmark)</span>' +
          '<button type="button" class="kn-mcq-nav-btn kn-mcq-nav-btn--primary" data-mcq-action="next">Next →</button>' +
        '</div>' +
      '</div>';

    host.appendChild(overlay);

    // Delegated click events
    overlay.addEventListener("click", function (e) {
      var actionBtn = e.target.closest("[data-mcq-action]");
      if (actionBtn) {
        var action = actionBtn.getAttribute("data-mcq-action");
        if (action === "close") { close(); }
        else if (action === "retry") {
          state.loading = true; state.error = null; loadPromise = null;
          loadData().then(render); render();
        }
        else if (action === "prev") { goTo(state.index - 1); }
        else if (action === "next") { goTo(state.index + 1); }
        else if (action === "toggle-bookmark") { toggleCurrentBookmark(); }
        else if (action === "reset-progress") { resetProgress(); }
        return;
      }

      var optBtn = e.target.closest("[data-mcq-option]");
      if (optBtn && !optBtn.disabled) {
        selectOption(parseInt(optBtn.getAttribute("data-mcq-option"), 10));
      }
    });

    // Delegated change events for dropdowns
    overlay.addEventListener("change", function (e) {
      var sel = e.target.closest("[data-mcq-filter]");
      if (!sel) return;
      var fType = sel.getAttribute("data-mcq-filter");
      if (fType === "chapter") {
        state.chapterFilter = sel.value;
        state.topicFilter = "";
      } else if (fType === "topic") {
        state.topicFilter = sel.value;
      } else if (fType === "view") {
        state.viewFilter = sel.value;
      }
      state.index = 0;
      applyFilters();
      render();
    });

    // Keyboard navigation
    window.addEventListener("keydown", function (e) {
      if (!overlay || overlay.hidden) return;

      if (e.key === "Escape") {
        close();
        return;
      }

      // Ignore when user is focusing a select or form input
      if (["SELECT", "INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        goTo(state.index - 1);
      } else if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        goTo(state.index + 1);
      } else if (["1", "a", "A"].includes(e.key)) {
        selectOption(0);
      } else if (["2", "b", "B"].includes(e.key)) {
        // 'b' toggles bookmark if question is already answered or shift pressed
        if (e.key.toLowerCase() === "b" && e.shiftKey) {
          toggleCurrentBookmark();
        } else {
          selectOption(1);
        }
      } else if (["3", "c", "C"].includes(e.key)) {
        selectOption(2);
      } else if (["4", "d", "D"].includes(e.key)) {
        selectOption(3);
      } else if (e.key === "m" || e.key === "M") {
        toggleCurrentBookmark();
      }
    });

    return overlay;
  }

  function selectOption(i) {
    var m = state.filtered[state.index];
    if (!m || state.answers[m.id]) return;
    var cIdx = correctIndex(m);
    state.answers[m.id] = { selected: i, correct: i === cIdx };
    persistProgress();
    triggerHaptic();
    render();
  }

  function toggleCurrentBookmark() {
    var m = state.filtered[state.index];
    if (!m) return;
    if (state.bookmarks[m.id]) {
      delete state.bookmarks[m.id];
    } else {
      state.bookmarks[m.id] = true;
    }
    persistBookmarks();
    triggerHaptic();
    render();
  }

  function resetProgress() {
    var total = state.filtered.length;
    if (!total) return;
    if (!window.confirm("Reset your recorded answers for the " + total + " questions currently shown?")) return;
    state.filtered.forEach(function (m) {
      delete state.answers[m.id];
    });
    persistProgress();
    state.index = 0;
    render();
  }

  function goTo(i) {
    if (i < 0 || i >= state.filtered.length) return;
    state.index = i;
    render();
    var body = overlay && overlay.querySelector(".kn-mcq-body");
    if (body) body.scrollTop = 0;
  }

  function triggerHaptic() {
    try {
      if (navigator.vibrate) navigator.vibrate(8);
    } catch (_) {}
  }

  // ── Public API ──────────────────────────────────────────────────────────
  function open(opts) {
    opts = opts || {};
    if (opts.chapterId !== undefined) state.chapterFilter = String(opts.chapterId);
    if (opts.topicId !== undefined) state.topicFilter = String(opts.topicId);
    if (opts.viewFilter) state.viewFilter = String(opts.viewFilter);

    state.index = 0;
    applyFilters();

    var ov = ensureOverlay();
    ov.hidden = false;
    document.body.classList.add("kn-mcq-open");
    render();

    loadData().then(function () {
      applyFilters();
      render();
    });

    var closeBtn = ov.querySelector(".kn-mcq-close-btn");
    if (closeBtn && typeof closeBtn.focus === "function") closeBtn.focus();
  }

  function close() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("kn-mcq-open");
  }

  window.KN_MCQ = {
    open: open,
    close: close,
    _state: state,
    _ready: true
  };
})();
