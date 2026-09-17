// ==========================================================================
// KNOCKOUTNOTES — Instant Client-Side Navigation Engine (spa-router.js)
// Enables instantaneous page & tab transitions across internal sections.
// Keeps background canvas (#knSpatialCanvas), shell, header & footer mounted.
// Preserves in-memory DOM state, scroll positions, and category filter states.
// ==========================================================================

(function () {
  "use strict";

  // Check browser support for modern client-side navigation
  if (!window.fetch || !window.DOMParser || !window.history.pushState) {
    return; // Gracefully fallback to standard MPA navigation
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // In-memory cache for visited pages
  // Key: normalized path (e.g. 'index.html', 'notes.html', 'calculators.html')
  // Value: {
  //   element: HTMLElement (the kn-page-view holding page content),
  //   title: string,
  //   contentPage: string,
  //   scrollY: number,
  //   initialized: boolean
  // }
  var pageCache = new Map();
  var prefetchCache = new Map(); // url -> Promise<string>
  var currentPagePath = normalizePath(window.location.pathname);
  var isNavigating = false;
  var stageRoot = null;

  var SHELL_IDS = new Set([
    "knSpatialCanvas",
    "knModeSwitch",
    "knDesktopNav",
    "knBubbleNav",
    "knBubbleOverlay",
    "knSearchModal",
    "knPageStage",
    "knSpatialViewer"
  ]);

  var SHELL_CLASSES = [
    "kn-updates-pill",
    "kn-corner-support",
    "spatial-viewer-overlay"
  ];

  function normalizePath(rawPath) {
    if (!rawPath) return "index.html";
    var p = rawPath.split("?")[0].split("#")[0].split("/").pop() || "index.html";
    if (p === "" || p === "/") p = "index.html";
    return p;
  }

  function getCurrentPath() {
    return normalizePath(window.location.pathname);
  }

  function isEligibleRoute(href) {
    if (!href) return false;
    var trimmed = href.trim();
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("mailto:") ||
      trimmed.startsWith("tel:") ||
      trimmed.startsWith("javascript:")
    ) {
      return false;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        var url = new URL(trimmed);
        if (url.origin !== window.location.origin) return false;
        trimmed = url.pathname;
      } catch (_) {
        return false;
      }
    }

    // Skip non-HTML files
    if (/\.(pdf|png|jpe?g|webp|gif|svg|json|xml|zip)$/i.test(trimmed.split("#")[0].split("?")[0])) {
      return false;
    }

    var targetPath = normalizePath(trimmed);
    var isDesktop = window.innerWidth >= 768;

    if (isDesktop) {
      // Desktop / PC mode: Instant navigation across main menu sections
      var desktopAllowed = [
        "index.html",
        "notes.html",
        "calculators.html",
        "drugs.html",
        "critical-care.html",
        "resources.html",
        "recent-updates.html",
        "resuscitation-chamber.html",
        "ventilator.html",
        "viva.html"
      ];
      return desktopAllowed.indexOf(targetPath) !== -1;
    } else {
      // Mobile view (< 768px): Strictly primary bar items (Home, Notes, Calculator)
      // Secondary 3-dot drawer items load separately as specified
      var mobileAllowed = [
        "index.html",
        "notes.html",
        "calculators.html"
      ];
      return mobileAllowed.indexOf(targetPath) !== -1;
    }
  }

  function isShellElement(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return true;
    if (node.tagName === "SCRIPT" || node.tagName === "STYLE" || node.tagName === "LINK") return true;
    if (node.id && SHELL_IDS.has(node.id)) return true;
    for (var i = 0; i < SHELL_CLASSES.length; i++) {
      if (node.classList.contains(SHELL_CLASSES[i])) return true;
    }
    return false;
  }

  // ------------------------------------------------------------------------
  // Setup Shell & Mount Initial Page View into Cache
  // ------------------------------------------------------------------------
  function setupStage() {
    stageRoot = document.getElementById("knPageStage");
    if (!stageRoot) {
      stageRoot = document.createElement("div");
      stageRoot.id = "knPageStage";
      stageRoot.className = "kn-page-stage";

      // Collect all non-shell children of body
      var bodyChildren = Array.from(document.body.childNodes);
      var contentNodes = [];
      var insertRefNode = null;

      bodyChildren.forEach(function (child) {
        if (!isShellElement(child)) {
          contentNodes.push(child);
          if (!insertRefNode) insertRefNode = child;
        }
      });

      var initialView = document.createElement("div");
      initialView.className = "kn-page-view";
      initialView.setAttribute("data-page-path", currentPagePath);
      initialView.style.display = "block";

      contentNodes.forEach(function (node) {
        initialView.appendChild(node);
      });

      stageRoot.appendChild(initialView);

      if (insertRefNode && insertRefNode.parentNode === document.body) {
        document.body.insertBefore(stageRoot, insertRefNode);
      } else {
        document.body.appendChild(stageRoot);
      }

      var initialContentPage = document.body.getAttribute("data-content-page") || "home";
      pageCache.set(currentPagePath, {
        element: initialView,
        title: document.title,
        contentPage: initialContentPage,
        scrollY: window.scrollY || 0,
        initialized: true
      });
    }
  }

  // ------------------------------------------------------------------------
  // Background Prefetching
  // ------------------------------------------------------------------------
  function prefetch(url) {
    var targetPath = normalizePath(url);
    if (pageCache.has(targetPath) || prefetchCache.has(targetPath)) return;

    var p = fetch(targetPath, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) throw new Error("Fetch failed: " + r.status);
        return r.text();
      })
      .catch(function () {
        prefetchCache.delete(targetPath);
      });

    prefetchCache.set(targetPath, p);
  }

  // ------------------------------------------------------------------------
  // Synchronize Stylesheets from Target Document
  // ------------------------------------------------------------------------
  function syncStylesheets(parsedDoc) {
    var links = parsedDoc.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href) {
        var existing = document.querySelector('link[rel="stylesheet"][href="' + href + '"]');
        if (!existing) {
          var newLink = document.createElement("link");
          newLink.rel = "stylesheet";
          newLink.href = href;
          document.head.appendChild(newLink);
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // Initialize Page-Specific Logic for Newly Mounted Views
  // ------------------------------------------------------------------------
  function initMountedPage(targetPath, viewEl) {
    if (targetPath === "notes.html" || targetPath === "notes") {
      if (window.KnockoutNotesLibrary && typeof window.KnockoutNotesLibrary.init === "function") {
        window.KnockoutNotesLibrary.init("notes");
      }
    } else if (targetPath === "drugs.html" || targetPath === "drugs") {
      if (window.KnockoutNotesLibrary && typeof window.KnockoutNotesLibrary.init === "function") {
        window.KnockoutNotesLibrary.init("drugs");
      }
    } else if (targetPath === "critical-care.html") {
      if (window.KnockoutNotesLibrary && typeof window.KnockoutNotesLibrary.init === "function") {
        window.KnockoutNotesLibrary.init("criticalCare");
      }
    } else if (targetPath === "calculators.html") {
      if (window.KnockoutCalculators && typeof window.KnockoutCalculators.init === "function") {
        window.KnockoutCalculators.init();
      }
    } else if (targetPath === "resources.html") {
      if (window.KnockoutCoffeeBg && typeof window.KnockoutCoffeeBg.init === "function") {
        window.KnockoutCoffeeBg.init();
      }
    }

    if (typeof window.initBorderGlow === "function") {
      window.initBorderGlow();
    }

    if (typeof window.initKnockoutSubscriptionWidgets === "function") {
      window.initKnockoutSubscriptionWidgets();
    }
  }

  // ------------------------------------------------------------------------
  // Client-Side Navigation Swapper
  // ------------------------------------------------------------------------
  function navigateTo(targetHref, options) {
    if (!stageRoot) setupStage();
    options = options || {};

    var urlObj;
    try {
      urlObj = new URL(targetHref, window.location.href);
    } catch (_) {
      window.location.assign(targetHref);
      return;
    }

    var targetPath = normalizePath(urlObj.pathname);
    var targetHash = urlObj.hash || "";

    // If already on the target page and only hash changed
    if (targetPath === currentPagePath) {
      if (targetHash) {
        if (options.pushState !== false) {
          window.history.pushState(null, "", targetPath + targetHash);
        }
        if (window.KnockoutNavigation && typeof window.KnockoutNavigation.setActiveRoute === "function") {
          window.KnockoutNavigation.setActiveRoute(targetPath, targetHash);
        }
        var targetEl = document.querySelector(targetHash);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
      return;
    }

    if (isNavigating) return;
    isNavigating = true;

    // Save scroll of current page
    var currentEntry = pageCache.get(currentPagePath);
    if (currentEntry) {
      currentEntry.scrollY = window.scrollY || 0;
    }

    // Update browser history
    if (options.pushState !== false) {
      window.history.pushState(null, "", targetPath + (targetHash || ""));
    }

    // Update navigation capsules & 3D indicator
    if (window.KnockoutNavigation && typeof window.KnockoutNavigation.setActiveRoute === "function") {
      window.KnockoutNavigation.setActiveRoute(targetPath, targetHash);
    }

    // Emit lifecycle event before unmounting
    window.dispatchEvent(new CustomEvent("kn:page-leave", {
      detail: { from: currentPagePath, to: targetPath }
    }));

    // Begin subtle transition fade
    if (!reduceMotion && stageRoot) {
      stageRoot.classList.add("kn-stage-transitioning");
    }

    var transitionDelay = reduceMotion ? 0 : 80;

    setTimeout(function () {
      // Hide current view
      if (currentEntry && currentEntry.element) {
        currentEntry.element.style.display = "none";
      }

      // Check if target is already in in-memory cache
      if (pageCache.has(targetPath)) {
        var cached = pageCache.get(targetPath);
        cached.element.style.display = "block";
        document.title = cached.title;
        document.body.setAttribute("data-content-page", cached.contentPage);

        // Restore scroll position or target hash
        if (targetHash) {
          var hashEl = cached.element.querySelector(targetHash);
          if (hashEl) {
            hashEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
          } else {
            window.scrollTo(0, 0);
          }
        } else {
          window.scrollTo(0, cached.scrollY || 0);
        }

        completeNavigation(targetPath, targetHash, true);
      } else {
        // Fetch and construct new page view
        var fetchPromise = prefetchCache.get(targetPath) || fetch(targetPath, { credentials: "same-origin" }).then(function (r) {
          if (!r.ok) throw new Error("HTTP error " + r.status);
          return r.text();
        });

        fetchPromise.then(function (html) {
          var parser = new DOMParser();
          var parsedDoc = parser.parseFromString(html, "text/html");

          // Sync stylesheets
          syncStylesheets(parsedDoc);

          var newTitle = parsedDoc.title || document.title;
          var newContentPage = parsedDoc.body.getAttribute("data-content-page") || "notes";

          var newView = document.createElement("div");
          newView.className = "kn-page-view";
          newView.setAttribute("data-page-path", targetPath);
          newView.style.display = "block";

          // Extract non-shell content nodes
          var parsedChildren = Array.from(parsedDoc.body.childNodes);
          parsedChildren.forEach(function (child) {
            if (!isShellElement(child)) {
              newView.appendChild(document.importNode(child, true));
            }
          });

          stageRoot.appendChild(newView);

          document.title = newTitle;
          document.body.setAttribute("data-content-page", newContentPage);

          // Store in cache
          pageCache.set(targetPath, {
            element: newView,
            title: newTitle,
            contentPage: newContentPage,
            scrollY: 0,
            initialized: true
          });

          // Run page-specific controllers
          initMountedPage(targetPath, newView);

          // Restore scroll
          if (targetHash) {
            var hashEl = newView.querySelector(targetHash);
            if (hashEl) {
              hashEl.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
            } else {
              window.scrollTo(0, 0);
            }
          } else {
            window.scrollTo(0, 0);
          }

          completeNavigation(targetPath, targetHash, false);
        }).catch(function (err) {
          console.warn("[KnockoutRouter] Fallback to full page load:", err);
          window.location.assign(targetHref);
        });
      }
    }, transitionDelay);
  }

  function completeNavigation(targetPath, targetHash, fromCache) {
    currentPagePath = targetPath;
    isNavigating = false;

    // Remove transition styling
    if (!reduceMotion && stageRoot) {
      setTimeout(function () {
        if (stageRoot) stageRoot.classList.remove("kn-stage-transitioning");
      }, 50);
    } else {
      if (stageRoot) stageRoot.classList.remove("kn-stage-transitioning");
    }

    // If bubble menu hash router is present, coordinate
    if (window.KnockoutNavigation && typeof window.KnockoutNavigation.handleHashRoute === "function") {
      window.KnockoutNavigation.handleHashRoute();
    }

    // Trigger window resize to settle carousels/canvases
    window.dispatchEvent(new Event("resize"));

    // Emit page-enter event
    window.dispatchEvent(new CustomEvent("kn:page-enter", {
      detail: { path: targetPath, hash: targetHash, fromCache: fromCache }
    }));
  }

  // ------------------------------------------------------------------------
  // Event Listeners: Link Interception & Background Prefetch
  // ------------------------------------------------------------------------
  document.addEventListener("click", function (e) {
    // Ignore modified clicks (Ctrl, Cmd, Shift, Middle click)
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }

    var anchor = e.target.closest("a");
    if (!anchor) return;

    var href = anchor.getAttribute("href");
    if (!href) return;

    // Check if link opens in new window
    if (anchor.target && anchor.target !== "_self") return;

    // Check eligibility
    if (!isEligibleRoute(href)) return;

    e.preventDefault();

    // If search modal is open, close it
    var searchModal = document.getElementById("knSearchModal");
    if (searchModal && searchModal.classList.contains("open")) {
      searchModal.classList.remove("open");
      if (window.KnockoutScrollLock && typeof window.KnockoutScrollLock.set === "function") {
        window.KnockoutScrollLock.set("search", false);
      }
    }

    // If mobile menu is open, close it
    if (window.KnockoutNavigation && typeof window.KnockoutNavigation.closeMobileMenu === "function") {
      window.KnockoutNavigation.closeMobileMenu();
    }

    navigateTo(href);
  });

  // Prefetch on hover / touchstart for 0ms perception
  document.addEventListener("pointerenter", function (e) {
    var anchor = e.target.closest("a");
    if (!anchor) return;
    var href = anchor.getAttribute("href");
    if (href && isEligibleRoute(href)) {
      prefetch(href);
    }
  }, { passive: true });

  document.addEventListener("touchstart", function (e) {
    var anchor = e.target.closest("a");
    if (!anchor) return;
    var href = anchor.getAttribute("href");
    if (href && isEligibleRoute(href)) {
      prefetch(href);
    }
  }, { passive: true });

  // Browser Back / Forward Button Handling
  window.addEventListener("popstate", function () {
    var newPath = getCurrentPath();
    var hash = window.location.hash || "";
    navigateTo(newPath + hash, { pushState: false });
  });

  // Export public API
  window.KnockoutRouter = {
    navigate: navigateTo,
    prefetch: prefetch,
    getCurrentPath: getCurrentPath,
    getCache: function () { return pageCache; }
  };

  // Setup on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupStage);
  } else {
    setupStage();
  }
})();
