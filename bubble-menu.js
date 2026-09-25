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
    { label: 'Critical Care', href: 'critical-care.html', ariaLabel: 'Critical Care & Code' },
    { label: 'Resuscitation', href: 'resuscitation-chamber.html', ariaLabel: 'Resuscitation Chamber' },
    { label: 'About', href: 'resources.html', ariaLabel: 'About KnockoutNotes' }
  ];

  // Mobile Primary Bar Links (< 768px)
  // Minimalist: Home, Notes, Calculator
  var MOBILE_PRIMARY_LINKS = [
    { label: 'Home', href: 'index.html', ariaLabel: 'Home' },
    { label: 'Notes', href: 'notes.html', ariaLabel: 'Clinical Notes' },
    { label: 'Calculator', href: 'calculators.html', ariaLabel: 'Anaesthesia Calculators', shortLabel: 'Calc' }
  ];

  // Mobile 3-Dot Drawer Items (2-Column Grid)
  // Strictly excludes Home, Notes, and Calculator (and removed Valve Lesions, Pearls, Viva)
  var MOBILE_MORE_ITEMS = [
    { label: 'Study Mode', href: 'study.html', ariaLabel: 'Study Mode — Anaesthesia & Drug Reference', icon: '🎓', desc: 'Anaesthesia & Drugs' },
    { label: 'Regional Blocks', href: 'regional-anaesthesia.html', ariaLabel: 'Regional Anaesthesia — Nerve Blocks', icon: '💉', desc: 'Nerve Blocks · NYSORA' },
    { label: '3D Workstation', href: 'ventilator.html', ariaLabel: '3D Anaesthesia Workstation', icon: '🫁', desc: 'Interactive Machine' },
    { label: 'Drugs Library', href: 'drugs.html', ariaLabel: 'Pharmacology Library', icon: '💊', desc: 'Dosing & Kinetics' },
    { label: 'Critical Care', href: 'critical-care.html', ariaLabel: 'Critical Care & Code Blue', icon: '⚡', desc: 'ICU & Resuscitation' },
    { label: 'Resuscitation', href: 'resuscitation-chamber.html', ariaLabel: 'Resuscitation Chamber', icon: '🚨', desc: 'ALS Protocols' },
    { label: 'Recent Updates', href: 'recent-updates.html', ariaLabel: 'Recent Updates & Changelog', icon: '✨', desc: 'Latest Features' },
    { label: 'About & Evidence', href: 'resources.html', ariaLabel: 'About KnockoutNotes', icon: '📖', desc: 'Evidence & Methodology' }
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
      var isCurPage = item.href === currentPath || (currentPath === "index.html" && item.href === "index.html");
      var isCurHash = item.href.indexOf("#") !== -1 && (currentPath + currentHash).indexOf(item.href) !== -1;
      var isActive = isCurHash || (!item.href.includes("#") && isCurPage);

      return [
        '<a href="' + item.href + '"',
        '   class="kn-desktop-link' + (isActive ? ' active' : '') + '"',
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
      return item.href === currentPath;
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
        ? '<span class="calc-label-full">' + item.label + '</span><span class="calc-label-short">' + item.shortLabel + '</span>'
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
      var isCurPage = item.href === currentPath;
      var isCurHash = item.href.indexOf("#") !== -1 && (currentPath + currentHash).indexOf(item.href) !== -1;
      var isActive = isCurHash || (!item.href.includes("#") && isCurPage);

      return [
        '<li class="kn-more-item" role="none">',
        '  <a class="kn-more-card' + (isActive ? ' active-route' : '') + '"',
        '     role="menuitem"',
        '     href="' + item.href + '"',
        '     data-card-index="' + idx + '"',
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
        if (href.indexOf("#") !== -1) {
          isMatch = (targetPath + targetHash).indexOf(href) !== -1;
        } else {
          isMatch = (href === targetPath || (targetPath === "index.html" && href === "index.html"));
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

  function initNavigation() {
    renderDesktopNav();
    renderMobileBubbleMenu();
    syncThemeIcons();
    handleHashRoute();
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
