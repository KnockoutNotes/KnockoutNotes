// ==========================================================================
// KNOCKOUTNOTES — Unified Navigation Controller (bubble-menu.js)
// Desktop & Tablet (>= 768px): Apple iOS-Themed Glass Floating Capsule with Smooth Shifting Pill Indicator
// Mobile (< 768px): Minimalist Floating Capsule Bar (Home, Notes, Calculator, Search, 3-Dot, Theme)
//                  + 2-Column Glass Card Overlay for Secondary Sections
// ==========================================================================

(function () {
  "use strict";

  // Desktop Navigation Links (>= 768px)
  // Cleaned: Valve Lesions, Pearls, and Viva removed (available inside Notes)
  var DESKTOP_LINKS = [
    { label: 'Home', href: 'index.html', ariaLabel: 'Home' },
    { label: 'Study', href: 'study.html', ariaLabel: 'Study Mode — Anaesthesia & Drug Reference' },
    { label: 'Notes', href: 'notes.html', ariaLabel: 'Clinical Notes' },
    { label: 'Calculators', href: 'calculators.html', ariaLabel: 'Anaesthesia Calculators' },
    { label: 'Regional', href: 'regional-anaesthesia.html', ariaLabel: 'Regional Anaesthesia — Nerve Blocks' },
    { label: '3D Workstation', href: 'ventilator.html', ariaLabel: '3D Anaesthesia Workstation' },
    { label: 'Drugs', href: 'drugs.html', ariaLabel: 'Pharmacology Library' },
    { label: 'Critical Care', href: 'critical-care.html', ariaLabel: 'Critical Care & Code', matchPaths: ['critical-care.html', 'resuscitation-chamber.html'] },
    { label: 'About', href: 'resources.html', ariaLabel: 'About KnockoutNotes' },
    { label: 'Sign In', href: 'workspace.html', ariaLabel: 'Sign In / Personal Workspace', isAuthLink: true }
  ];

  // Mobile Primary Bar Links (< 768px)
  // Minimalist: Home, Study Mode, Calculator
  var MOBILE_PRIMARY_LINKS = [
    { label: 'Home', href: 'index.html', ariaLabel: 'Home' },
    { label: 'Study Mode', href: 'study.html', ariaLabel: 'Study Mode — Anaesthesia & Drug Reference', shortLabel: 'Study' },
    { label: 'Calculator', href: 'calculators.html', ariaLabel: 'Anaesthesia Calculators', shortLabel: 'Calc' }
  ];

  // Mobile 3-Dot Drawer Items (2-Column Grid)
  // Strictly excludes Home, Study Mode, and Calculator
  var MOBILE_MORE_ITEMS = [
    { label: 'Clinical Notes', href: 'notes.html', ariaLabel: 'Clinical & Study Notes', icon: '📝', desc: 'Notes, Pearls & Viva', matchPaths: ['notes.html', 'pearls.html', 'viva.html'] },
    { label: 'Regional Blocks', href: 'regional-anaesthesia.html', ariaLabel: 'Regional Anaesthesia — Nerve Blocks', icon: '💉', desc: 'Nerve Blocks · NYSORA' },
    { label: '3D Workstation', href: 'ventilator.html', ariaLabel: '3D Anaesthesia Workstation', icon: '🫁', desc: 'Interactive Machine' },
    { label: 'Drugs Library', href: 'drugs.html', ariaLabel: 'Pharmacology Library', icon: '💊', desc: 'Dosing & Kinetics' },
    { label: 'Critical Care', href: 'critical-care.html', ariaLabel: 'Critical Care & Code Blue', icon: '⚡', desc: 'ICU & Resuscitation', matchPaths: ['critical-care.html', 'resuscitation-chamber.html'] },
    { label: 'Recent Updates', href: 'recent-updates.html', ariaLabel: 'Recent Updates & Changelog', icon: '✨', desc: 'Latest Features' },
    { label: 'About & Evidence', href: 'resources.html', ariaLabel: 'About KnockoutNotes', icon: '📖', desc: 'Evidence & Methodology' },
    { label: 'Sign In', href: 'workspace.html', ariaLabel: 'Sign In / Personal Workspace', icon: '👤', desc: 'Bookmarks & Notes', matchPaths: ['workspace.html'], isAuthLink: true }
  ];

  var isMobileMenuOpen = false;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var currentActiveDesktopLink = null;
  var setDesktopIndicatorTo = null;
  var currentActiveMobileLink = null;
  var setMobileIndicatorTo = null;

  function getCurrentPath() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    if (path === "") path = "index.html";
    return path;
  }

  // ------------------------------------------------------------------------
  // 1. Render Minimalist Desktop Navigation (>= 768px)
  // ------------------------------------------------------------------------
  function renderDesktopNav() {
    if (document.getElementById("knDesktopNav")) return;

    var currentPath = getCurrentPath();
    var currentHash = window.location.hash;

    var nav = document.createElement("nav");
    nav.id = "knDesktopNav";
    nav.className = "kn-desktop-nav";
    nav.setAttribute("aria-label", "KnockoutNotes desktop navigation");

    var linksHtml = DESKTOP_LINKS.map(function (item) {
      var isCurPage = item.href === currentPath || (currentPath === "index.html" && item.href === "index.html") ||
        (item.matchPaths && item.matchPaths.indexOf(currentPath) !== -1);
      var isCurHash = item.href.indexOf("#") !== -1 && (currentPath + currentHash).indexOf(item.href) !== -1;
      var isActive = isCurHash || (!item.href.includes("#") && isCurPage);
      var authAttrs = item.isAuthLink ? ' data-auth-nav-link="true" id="knDesktopAuthNavLink"' : '';

      return [
        '<a href="' + item.href + '"',
        '   class="kn-desktop-link' + (isActive ? ' active' : '') + (item.isAuthLink ? ' kn-auth-nav-link' : '') + '"',
        authAttrs,
        '   role="menuitem"',
        '   aria-label="' + item.ariaLabel + '">',
        '  ' + item.label,
        '</a>'
      ].join("");
    }).join("\n");

    nav.innerHTML = [
      '<div class="kn-desktop-nav-capsule">',
      '  <a class="kn-desktop-brand" href="index.html" aria-label="KnockoutNotes Home">',
      '    <img src="knockoutnotes_icon.png" alt="KnockoutNotes emblem" class="kn-desktop-logo">',
      '    <span class="kn-desktop-brand-name">Knockout<span>Notes</span></span>',
      '  </a>',
      '  <div class="kn-desktop-links" role="menubar">',
      '    <div class="kn-desktop-indicator" aria-hidden="true"></div>',
      linksHtml,
      '  </div>',
      '  <div class="kn-desktop-actions">',
      '    <button type="button" class="kn-desktop-action-btn kn-desktop-search-btn" data-open-search title="Search Database (⌘K)" aria-label="Open search">',
      '      <span class="kn-icon-search">⌕</span>',
      '      <span class="kn-search-text">Search</span>',
      '      <kbd>⌘K</kbd>',
      '    </button>',
      '    <button type="button" class="kn-desktop-action-btn kn-desktop-theme-btn" id="knDesktopThemeToggle" title="Toggle theme" aria-label="Toggle theme">',
      '      <span class="kn-theme-icon-slot">☾</span>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join("\n");

    // Insert at the top of the body
    var firstChild = document.body.firstChild;
    document.body.insertBefore(nav, firstChild);

    // Bind desktop theme button
    var themeBtn = nav.querySelector("#knDesktopThemeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }

    // Setup smooth Apple iOS sliding indicator
    setupDesktopIndicator(nav);
  }

  // ------------------------------------------------------------------------
  // Apple iOS-Themed Smooth Shifting Indicator for Desktop
  // ------------------------------------------------------------------------
  function setupDesktopIndicator(nav) {
    var linksContainer = nav.querySelector(".kn-desktop-links");
    var indicator = nav.querySelector(".kn-desktop-indicator");
    if (!linksContainer || !indicator) return;

    var links = Array.from(linksContainer.querySelectorAll(".kn-desktop-link"));
    currentActiveDesktopLink = linksContainer.querySelector(".kn-desktop-link.active");

    setDesktopIndicatorTo = function (el) {
      if (!el) {
        indicator.style.opacity = "0";
        return;
      }
      var left = el.offsetLeft;
      var width = el.offsetWidth;
      indicator.style.transform = "translateX(" + left + "px)";
      indicator.style.width = width + "px";
      indicator.style.opacity = "1";
    };

    // Initial positioning with slight delay for font render
    if (currentActiveDesktopLink) {
      setTimeout(function () {
        setDesktopIndicatorTo(currentActiveDesktopLink);
      }, 50);
    } else {
      indicator.style.opacity = "0";
    }

    links.forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        setDesktopIndicatorTo(link);
      });
      link.addEventListener("focus", function () {
        setDesktopIndicatorTo(link);
      });
    });

    linksContainer.addEventListener("mouseleave", function () {
      if (currentActiveDesktopLink) {
        setDesktopIndicatorTo(currentActiveDesktopLink);
      } else {
        indicator.style.opacity = "0";
      }
    });

    window.addEventListener("resize", function () {
      if (currentActiveDesktopLink) {
        setDesktopIndicatorTo(currentActiveDesktopLink);
      }
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 2. Render Mobile Navigation (< 768px): Minimalist Capsule & 2-Col 3-Dot Drawer
  // ------------------------------------------------------------------------
  function renderMobileBubbleMenu() {
    if (document.getElementById("knBubbleNav")) return;

    var currentPath = getCurrentPath();
    var currentHash = window.location.hash;

    // Check if current page is one of the secondary 3-dot items
    var isMoreActive = MOBILE_MORE_ITEMS.some(function (item) {
      return item.href === currentPath || (item.matchPaths && item.matchPaths.indexOf(currentPath) !== -1);
    });

    // Mobile Header Floating Capsule Bar
    var bubbleNav = document.createElement("nav");
    bubbleNav.id = "knBubbleNav";
    bubbleNav.className = "bubble-menu";
    bubbleNav.setAttribute("aria-label", "KnockoutNotes mobile navigation");

    var primaryLinksHtml = MOBILE_PRIMARY_LINKS.map(function (item) {
      var isCurPage = item.href === currentPath || (currentPath === "index.html" && item.href === "index.html");
      var isActive = (!item.href.includes("#") && isCurPage);

      var labelHtml = item.shortLabel
        ? '<span class="nav-label-full calc-label-full">' + item.label + '</span><span class="nav-label-short calc-label-short">' + item.shortLabel + '</span>'
        : item.label;

      return [
        '<a href="' + item.href + '"',
        '   class="bubble-nav-link' + (isActive ? ' active' : '') + '"',
        '   role="menuitem"',
        '   aria-label="' + item.ariaLabel + '">',
        '  ' + labelHtml,
        '</a>'
      ].join("");
    }).join("\n");

    bubbleNav.innerHTML = [
      '<div class="bubble-bar-capsule">',
      '  <a class="bubble-logo-link" href="index.html" aria-label="KnockoutNotes Home">',
      '    <img src="knockoutnotes_icon.png" alt="KnockoutNotes emblem" class="bubble-logo">',
      '  </a>',
      '  <div class="bubble-nav-links" role="menubar">',
      '    <div class="kn-mobile-indicator" aria-hidden="true"></div>',
      primaryLinksHtml,
      '  </div>',
      '  <div class="bubble-nav-actions">',
      '    <button type="button" class="bubble-action-btn kn-bubble-search-btn" id="knBubbleSearchBtn" data-open-search title="Search Database (⌘K)" aria-label="Open search">',
      '      <span>⌕</span>',
      '    </button>',
      '    <button type="button" class="bubble-action-btn kn-more-toggle-btn' + (isMoreActive ? ' has-active' : '') + '" id="knBubbleMenuToggle" title="More sections" aria-label="More navigation options" aria-expanded="false">',
      '      <span class="kn-dots-icon">⋮</span>',
      '      <span class="kn-active-dot" aria-hidden="true"></span>',
      '    </button>',
      '    <button type="button" class="bubble-action-btn kn-bubble-theme-btn" id="knBubbleThemeBtn" title="Toggle dark/light theme" aria-label="Toggle theme">',
      '      <span class="kn-theme-icon-slot">☾</span>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join("\n");

    // Mobile 2-Column Glass Overlay for Extended Sections
    var overlay = document.createElement("div");
    overlay.id = "knBubbleOverlay";
    overlay.className = "bubble-menu-items";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "More navigation options");

    var moreCardsHtml = MOBILE_MORE_ITEMS.map(function (item, idx) {
      var isCurPage = item.href === currentPath ||
        (item.matchPaths && item.matchPaths.indexOf(currentPath) !== -1);
      var isCurHash = item.href.indexOf("#") !== -1 && (currentPath + currentHash).indexOf(item.href) !== -1;
      var isActive = isCurHash || (!item.href.includes("#") && isCurPage);
      var authAttrs = item.isAuthLink ? ' data-auth-nav-link="true" id="knMobileAuthNavLink"' : '';

      return [
        '<li class="kn-more-item" role="none">',
        '  <a class="kn-more-card' + (isActive ? ' active-route' : '') + '"',
        '     role="menuitem"',
        '     href="' + item.href + '"',
        '     data-card-index="' + idx + '"',
        authAttrs,
        '     aria-label="' + item.ariaLabel + '">',
        '    <div class="kn-more-card-top">',
        '      <span class="kn-more-card-icon" aria-hidden="true">' + item.icon + '</span>',
        '      <span class="kn-more-card-arrow" aria-hidden="true">→</span>',
        '    </div>',
        '    <div class="kn-more-card-body">',
        '      <span class="kn-more-card-label">' + item.label + '</span>',
        '      <span class="kn-more-card-desc">' + item.desc + '</span>',
        '    </div>',
        '  </a>',
        '</li>'
      ].join("\n");
    }).join("\n");

    overlay.innerHTML = [
      '<div class="kn-more-container">',
      '  <div class="kn-more-header">',
      '    <div class="kn-more-heading">',
      '      <span class="kn-more-title">More Sections</span>',
      '      <span class="kn-more-sub">KnockoutNotes Suite</span>',
      '    </div>',
      '    <button type="button" class="kn-more-close-btn" id="knBubbleCloseBtn" aria-label="Close menu">✕</button>',
      '  </div>',
      '  <ul class="kn-more-grid" role="menu" aria-label="Extended menu links">',
      moreCardsHtml,
      '  </ul>',
      '  <div class="pill-close-hint">Tap outside or press <kbd>ESC</kbd> to close</div>',
      '</div>'
    ].join("\n");

    document.body.appendChild(bubbleNav);
    document.body.appendChild(overlay);

    setupMobileIndicator(bubbleNav);
    bindMobileEvents(bubbleNav, overlay);
  }

  // ------------------------------------------------------------------------
  // Apple iOS-Themed 3D Glass Shifting Indicator for Mobile Main Menu
  // Strictly applies ONLY to the primary navigation links (Home, Notes, Calc)
  // NEVER applies to the 3-dot menu or utility buttons
  // ------------------------------------------------------------------------
  function setupMobileIndicator(bubbleNav) {
    var linksContainer = bubbleNav.querySelector(".bubble-nav-links");
    var indicator = bubbleNav.querySelector(".kn-mobile-indicator");
    if (!linksContainer || !indicator) return;

    var links = Array.from(linksContainer.querySelectorAll(".bubble-nav-link"));
    currentActiveMobileLink = linksContainer.querySelector(".bubble-nav-link.active");

    setMobileIndicatorTo = function (el) {
      if (!el) {
        indicator.style.opacity = "0";
        return;
      }
      var left = el.offsetLeft;
      var width = el.offsetWidth;
      indicator.style.transform = "translateX(" + left + "px)";
      indicator.style.width = width + "px";
      indicator.style.opacity = "1";
    };

    if (currentActiveMobileLink) {
      setTimeout(function () {
        setMobileIndicatorTo(currentActiveMobileLink);
      }, 60);
    } else {
      indicator.style.opacity = "0";
    }

    links.forEach(function (link) {
      link.addEventListener("click", function () {
        links.forEach(function (l) { l.classList.remove("active"); });
        link.classList.add("active");
        currentActiveMobileLink = link;
        setMobileIndicatorTo(link);
      });
      link.addEventListener("mouseenter", function () {
        setMobileIndicatorTo(link);
      });
    });

    linksContainer.addEventListener("mouseleave", function () {
      if (currentActiveMobileLink) {
        setMobileIndicatorTo(currentActiveMobileLink);
      } else {
        indicator.style.opacity = "0";
      }
    });

    window.addEventListener("resize", function () {
      if (currentActiveMobileLink) {
        setMobileIndicatorTo(currentActiveMobileLink);
      }
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 3. Mobile Open/Close State & Smooth Animation
  // ------------------------------------------------------------------------
  function setMobileMenuState(open) {
    var overlay = document.getElementById("knBubbleOverlay");
    var toggleBtn = document.getElementById("knBubbleMenuToggle");
    if (!overlay || !toggleBtn) return;

    // Do not open if viewport is desktop/tablet (>= 768px)
    if (open && window.innerWidth >= 768) {
      return;
    }

    isMobileMenuOpen = open;
    toggleBtn.classList.toggle("open", open);
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    overlay.setAttribute("aria-hidden", open ? "false" : "true");

    // Coordinate with KnockoutScrollLock
    if (window.KnockoutScrollLock && typeof window.KnockoutScrollLock.set === "function") {
      window.KnockoutScrollLock.set("bubble-menu", open);
    }

    // Direct DOM scroll safeguard
    if (!open) {
      document.body.classList.remove("kn-scroll-locked");
      document.body.style.top = "";
    }

    var cards = Array.from(overlay.querySelectorAll(".kn-more-card"));
    var header = overlay.querySelector(".kn-more-header");
    var gsap = window.gsap;

    if (open) {
      overlay.style.display = "flex";

      if (gsap && !prefersReducedMotion) {
        gsap.killTweensOf(cards);
        if (header) gsap.killTweensOf(header);

        gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" });

        if (header) {
          gsap.fromTo(header, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" });
        }

        gsap.fromTo(cards,
          { scale: 0.88, y: 16, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.32, stagger: 0.04, ease: "back.out(1.4)" }
        );
      } else {
        overlay.style.opacity = "1";
        cards.forEach(function (c) { c.style.opacity = "1"; c.style.transform = "none"; });
      }

      var firstCard = overlay.querySelector(".kn-more-card");
      if (firstCard) firstCard.focus();
    } else {
      if (gsap && !prefersReducedMotion) {
        gsap.killTweensOf(cards);
        gsap.to(cards, {
          scale: 0.92,
          y: 8,
          opacity: 0,
          duration: 0.16,
          ease: "power2.in"
        });
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.18,
          ease: "power2.in",
          onComplete: function () {
            overlay.style.display = "none";
          }
        });
      } else {
        overlay.style.display = "none";
      }

      if (toggleBtn) toggleBtn.focus();
    }
  }

  function bindMobileEvents(nav, overlay) {
    var toggleBtn = document.getElementById("knBubbleMenuToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setMobileMenuState(!isMobileMenuOpen);
      });
    }

    var closeBtn = document.getElementById("knBubbleCloseBtn");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        setMobileMenuState(false);
      });
    }

    var themeBtn = document.getElementById("knBubbleThemeBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }

    // Click outside overlay container to close
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.classList.contains("kn-more-container")) {
        setMobileMenuState(false);
      }
    });

    // Escape key
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setMobileMenuState(false);
      }
    });

    // Card clicks
    overlay.querySelectorAll(".kn-more-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        var href = card.getAttribute("href");
        if (!href) return;

        var curPath = getCurrentPath();
        var targetPath = href.split("#")[0] || "index.html";
        var targetHash = href.indexOf("#") !== -1 ? href.substring(href.indexOf("#")) : "";

        // Same-page hash navigation
        if ((targetPath === curPath || (curPath === "" && targetPath === "index.html")) && targetHash) {
          e.preventDefault();
          setMobileMenuState(false);
          try {
            history.pushState(null, "", href);
          } catch (_) {}
          handleHashRoute();
          return;
        }

        // Cross-page navigation: ensure menu is closed and scroll lock released immediately
        setMobileMenuState(false);
      });
    });
  }

  // ------------------------------------------------------------------------
  // 4. Shared Utilities & Event Handlers
  // ------------------------------------------------------------------------
  function toggleTheme() {
    var isDark = document.body.classList.contains("dark");
    var nextTheme = isDark ? "light" : "dark";
    document.body.classList.toggle("dark", !isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    try { localStorage.setItem("kn-theme", nextTheme); } catch (_) {}
    syncThemeIcons();

    document.querySelectorAll("#themeBtn, #themeBtn3d, .theme-btn").forEach(function (b) {
      b.textContent = isDark ? "☾" : "☀";
    });
  }

  function syncThemeIcons() {
    var isDark = document.body.classList.contains("dark");
    var icon = isDark ? "☀" : "☾";
    document.querySelectorAll(".kn-theme-icon-slot").forEach(function (slot) {
      slot.textContent = icon;
    });
  }

  function handleHashRoute() {
    var hash = window.location.hash;
    if (!hash) return;

    if (hash === "#valves" || hash === "#cardiology") {
      var valveBtn = document.querySelector('[data-filter="valves"]');
      if (valveBtn) valveBtn.click();
      var targetSection = document.getElementById("pearls3d") || document.getElementById("pearls");
      if (targetSection) {
        setTimeout(function () {
          targetSection.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    } else if (hash === "#pearls") {
      var targetSection = document.getElementById("pearls3d") || document.getElementById("pearls");
      if (targetSection) {
        setTimeout(function () {
          targetSection.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    } else {
      var targetEl = document.querySelector(hash);
      if (targetEl) {
        setTimeout(function () {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    }
  }

  // Universal search click handler
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-open-search]");
    if (!btn) return;
    var searchModal = document.getElementById("knSearchModal");
    var modalInput = document.getElementById("knModalSearchInput");
    if (searchModal) {
      searchModal.classList.add("open");
      if (window.KnockoutScrollLock && typeof window.KnockoutScrollLock.set === "function") {
        window.KnockoutScrollLock.set("search", true);
      }
      if (modalInput) {
        modalInput.value = "";
        setTimeout(function () { modalInput.focus(); }, 60);
      }
      if (window.KnockoutNotesSiteSearch && typeof window.KnockoutNotesSiteSearch.trigger === "function") {
        window.KnockoutNotesSiteSearch.trigger("");
      }
    }
  });

  // Responsive resize watcher: if viewport reaches >= 768px, force close mobile menu & unlock scroll
  window.addEventListener("resize", function () {
    if (window.innerWidth >= 768 && isMobileMenuOpen) {
      setMobileMenuState(false);
    }
  }, { passive: true });

  // Browser back/forward cache safeguard
  window.addEventListener("pageshow", function () {
    setMobileMenuState(false);
    document.body.classList.remove("kn-scroll-locked");
    document.body.style.top = "";
  });

  window.addEventListener("popstate", function () {
    setMobileMenuState(false);
    document.body.classList.remove("kn-scroll-locked");
    document.body.style.top = "";
    handleHashRoute();
  });

  window.addEventListener("hashchange", handleHashRoute);

  // Theme observer
  var themeObserver = new MutationObserver(syncThemeIcons);
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  function setActiveRoute(targetPath, targetHash) {
    targetPath = targetPath || getCurrentPath();
    targetHash = targetHash !== undefined ? targetHash : window.location.hash;

    // Desktop
    var desktopNav = document.getElementById("knDesktopNav");
    if (desktopNav) {
      var dLinks = Array.from(desktopNav.querySelectorAll(".kn-desktop-link"));
      var dActive = null;
      dLinks.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var isMatch = false;
        var linkItem = DESKTOP_LINKS.filter(function (d) { return d.href === href; })[0];
        if (href.indexOf("#") !== -1) {
          isMatch = (targetPath + targetHash).indexOf(href) !== -1;
        } else {
          isMatch = (href === targetPath || (targetPath === "index.html" && href === "index.html")) ||
            (linkItem && linkItem.matchPaths && linkItem.matchPaths.indexOf(targetPath) !== -1);
        }
        if (isMatch) {
          link.classList.add("active");
          dActive = link;
        } else {
          link.classList.remove("active");
        }
      });
      currentActiveDesktopLink = dActive;
      if (typeof setDesktopIndicatorTo === "function" && dActive) {
        setDesktopIndicatorTo(dActive);
      }
    }

    // Mobile Primary Bar
    var bubbleNav = document.getElementById("knBubbleNav");
    if (bubbleNav) {
      var mLinks = Array.from(bubbleNav.querySelectorAll(".bubble-nav-link"));
      var mActive = null;
      mLinks.forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var isMatch = (href === targetPath || (targetPath === "index.html" && href === "index.html"));
        if (isMatch) {
          link.classList.add("active");
          mActive = link;
        } else {
          link.classList.remove("active");
        }
      });
      currentActiveMobileLink = mActive;
      if (typeof setMobileIndicatorTo === "function" && mActive) {
        setMobileIndicatorTo(mActive);
      }
    }

    // HUD path indicator
    var hudPath = document.getElementById("knHudPath3d");
    if (hudPath) {
      var labels = {
        "index.html": "KN // OR WORKSTATION",
        "notes.html": "KN // STUDY REPOSITORY",
        "calculators.html": "KN // ANAESTHESIA CALCULATORS",
        "ventilator.html": "KN // ANAESTHESIA WORKSTATION",
        "drugs.html": "KN // PHARMACOLOGY LIBRARY",
        "critical-care.html": "KN // CRITICAL CARE & CODE",
        "resources.html": "KN // EVIDENCE & POLICIES"
      };
      if (labels[targetPath]) hudPath.textContent = labels[targetPath];
    }
  }

  function syncAuthNavLinks() {
    var isLoggedIn = window.KN_WORKSPACE && window.KN_WORKSPACE.isLoggedIn();
    var user = isLoggedIn ? window.KN_WORKSPACE.getUser() : null;
    var label = isLoggedIn ? 'Workspace' : 'Sign In';

    // Desktop auth link in main menu
    var dskLink = document.getElementById("knDesktopAuthNavLink");
    if (dskLink) {
      dskLink.textContent = label;
      dskLink.setAttribute("title", isLoggedIn ? (user && user.name ? user.name + "'s Workspace" : "Personal Workspace") : "Sign In or Register");
      dskLink.setAttribute("aria-label", label);
    }

    // Mobile auth card in 3-dot drawer
    var mobCard = document.getElementById("knMobileAuthNavLink");
    if (mobCard) {
      var lblEl = mobCard.querySelector(".kn-more-card-label");
      var descEl = mobCard.querySelector(".kn-more-card-desc");
      if (lblEl) lblEl.textContent = label;
      if (descEl) descEl.textContent = isLoggedIn ? "Bookmarks & Notes" : "Sign In or Register";
    }

    // 3D HUD Nav Links & Header Nav Links
    document.querySelectorAll("[data-auth-nav-link]").forEach(function (el) {
      if (el.id !== "knDesktopAuthNavLink" && el.id !== "knMobileAuthNavLink") {
        if (el.querySelector("span") || el.hasAttribute("data-close-menu")) {
          el.innerHTML = label + ' <span>&rarr;</span>';
        } else {
          el.textContent = label;
        }
      }
    });
  }

  // Intercept click on Sign In / Workspace main menu link
  document.addEventListener("click", function (e) {
    var authLink = e.target.closest("[data-auth-nav-link]");
    if (authLink) {
      var isLoggedIn = window.KN_WORKSPACE && window.KN_WORKSPACE.isLoggedIn();
      if (!isLoggedIn) {
        e.preventDefault();
        e.stopPropagation();
        if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.openAuthModal === "function") {
          window.KN_WORKSPACE.openAuthModal("signin");
        } else {
          ensureWorkspaceAssets();
          var checkInterval = setInterval(function () {
            if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.openAuthModal === "function") {
              clearInterval(checkInterval);
              window.KN_WORKSPACE.openAuthModal("signin");
            }
          }, 40);
          setTimeout(function () { clearInterval(checkInterval); }, 1500);
        }
      }
    }
  }, true);

  window.addEventListener("kn:auth-change", function () {
    syncAuthNavLinks();
  });

  function ensureWorkspaceAssets() {
    if (!document.querySelector('link[href*="workspace.css"]')) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "workspace.css";
      document.head.appendChild(link);
    }
    if (!window.KN_WORKSPACE && !document.querySelector('script[src*="workspace-engine.js"]')) {
      var script = document.createElement("script");
      script.src = "workspace-engine.js";
      script.onload = function () {
        if (window.KN_WORKSPACE) {
          window.KN_WORKSPACE.updateNavUser();
          syncAuthNavLinks();
        }
      };
      document.body.appendChild(script);
    } else if (window.KN_WORKSPACE) {
      window.KN_WORKSPACE.updateNavUser();
      syncAuthNavLinks();
    }
  }

  function initNavScrollAutoHide() {
    var isHome = document.body.getAttribute("data-content-page") === "home" ||
                 window.location.pathname.endsWith("index.html") ||
                 window.location.pathname === "/" ||
                 window.location.pathname === "";
    if (isHome) return; // Keep navigation pinned on Home page

    var lastY = window.scrollY;
    var ticking = false;

    function handleScroll() {
      ticking = false;
      if (isMobileMenuOpen) return;

      var y = Math.max(0, window.scrollY || window.pageYOffset || (document.documentElement ? document.documentElement.scrollTop : 0) || 0);
      var delta = y - lastY;

      // The moment user scrolls down past the top (y > 10), scroll off immediately!
      if (delta > 2 && y > 10) {
        document.body.classList.add("kn-nav-scrolled-off", "kn-nav-autohidden");
      } else if (delta < -4 || y <= 10) {
        // Scrolling up or near top reveals it smoothly
        document.body.classList.remove("kn-nav-scrolled-off", "kn-nav-autohidden");
      }
      lastY = y;
    }

    var triggerScroll = function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener("scroll", triggerScroll, { passive: true });
    window.addEventListener("touchmove", triggerScroll, { passive: true });
    window.addEventListener("wheel", triggerScroll, { passive: true });
  }

  function initNavigation() {
    try {
      var savedTheme = localStorage.getItem("kn-theme");
      if (savedTheme === "dark" || (savedTheme === null && !document.body.classList.contains("light"))) {
        document.body.classList.add("dark");
        document.documentElement.classList.add("dark");
      } else if (savedTheme === "light") {
        document.body.classList.remove("dark");
        document.documentElement.classList.remove("dark");
      }
    } catch (_) {}

    renderDesktopNav();
    renderMobileBubbleMenu();
    syncThemeIcons();
    handleHashRoute();
    ensureWorkspaceAssets();
    syncAuthNavLinks();
    initNavScrollAutoHide();
    document.body.classList.add("kn-nav-mounted");
  }

  window.KnockoutNavigation = {
    init: initNavigation,
    openMobileMenu: function () { setMobileMenuState(true); },
    closeMobileMenu: function () { setMobileMenuState(false); },
    setActiveRoute: setActiveRoute,
    handleHashRoute: handleHashRoute
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }
})();
