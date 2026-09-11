// ==========================================================================
// KNOCKOUTNOTES — Page Motion (page-motion.js)
// Cross-page transitions between nav clicks + subtle hero parallax depth.
// Kept separate from script.js since both pieces are pure presentation and
// have nothing to do with data/content wiring.
// ==========================================================================

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ------------------------------------------------------------------------
  // 1. Cross-page transitions: fade+lift the current page out before an
  // internal nav click actually navigates, so the swap between pages reads
  // as one continuous motion instead of an instant jump-cut. The matching
  // entrance (knPageEnter) is pure CSS, driven off the mode-3d/mode-lite
  // class every page already carries — see styles.css.
  // ------------------------------------------------------------------------
  var EXIT_MS = 260;

  function resolveUrl(href) {
    try { return new URL(href, window.location.href); } catch (_) { return null; }
  }

  function isTransitionable(a) {
    if (!a || !a.getAttribute("href")) return false;
    if (a.hasAttribute("download")) return false;
    if (a.dataset.noTransition !== undefined) return false;
    var target = (a.getAttribute("target") || "").toLowerCase();
    if (target && target !== "_self") return false;
    var url = resolveUrl(a.href);
    if (!url || url.origin !== window.location.origin) return false;
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    // Same-page anchor (including a bare "#") — let native in-page scroll happen.
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
      return false;
    }
    return true;
  }

  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !isTransitionable(a)) return;

      e.preventDefault();
      var href = a.href;
      document.body.classList.add("kn-page-exit");
      window.setTimeout(function () {
        window.location.href = href;
      }, EXIT_MS);
    }, true);

    // A page restored from the back/forward cache keeps its old DOM state,
    // including a lingering kn-page-exit class from the click that navigated
    // away — clear it so returning via Back doesn't show a frozen-invisible page.
    window.addEventListener("pageshow", function () {
      document.body.classList.remove("kn-page-exit");
    });
  }

  // ------------------------------------------------------------------------
  // 2. Hero parallax: the hero's telemetry/visual card drifts at a fraction
  // of scroll speed while the hero is on screen, for a light sense of depth.
  // transform-only, rAF-throttled, and paused entirely once the hero has
  // scrolled out of view — negligible cost on the rest of the page.
  // ------------------------------------------------------------------------
  if (!reduceMotion && "IntersectionObserver" in window) {
    var heroVisuals = Array.from(document.querySelectorAll(".hero .hero-visual"));

    if (heroVisuals.length) {
      var heroVisible = false;
      var io = new IntersectionObserver(function (entries) {
        heroVisible = entries.some(function (entry) { return entry.isIntersecting; });
        if (!heroVisible) {
          heroVisuals.forEach(function (el) { el.style.transform = ""; });
        }
      }, { threshold: 0 });
      Array.from(document.querySelectorAll(".hero")).forEach(function (hero) { io.observe(hero); });

      var ticking = false;
      function updateParallax() {
        ticking = false;
        if (!heroVisible) return;
        var y = window.scrollY || window.pageYOffset || 0;
        // Fades out completely once the hero is well off screen, and stays
        // untouched (empty inline transform) near the very top so it never
        // fights the element's own .fade entrance transition on load.
        if (y < 4) {
          heroVisuals.forEach(function (el) { el.style.transform = ""; });
          return;
        }
        var offset = Math.min(y * 0.1, 46);
        heroVisuals.forEach(function (el) {
          el.style.transform = "translate3d(0, " + offset.toFixed(1) + "px, 0)";
        });
      }
      window.addEventListener("scroll", function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateParallax);
        }
      }, { passive: true });
    }
  }
})();
