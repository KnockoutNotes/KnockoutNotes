// ==========================================================================
// KNOCKOUTNOTES — Unified Navigation Controller (bubble-menu.js)
// Desktop & Tablet (>= 768px): Minimalist Horizontal Pill Navbar
// Mobile (< 768px): React Bits BubbleMenu Floating Capsule & Staggered Reveal
// ==========================================================================

(function () {
  "use strict";

  var DESKTOP_LINKS = [
    { label: 'Home', href: 'index.html', ariaLabel: 'Home' },
    { label: 'Notes', href: 'notes.html', ariaLabel: 'Clinical Notes' },
    { label: 'Pearls', href: 'pearls.html', ariaLabel: 'Clinical Pearls' },
    { label: 'Valve Lesions', href: 'notes.html#valves', ariaLabel: 'Valve Lesions Haemodynamics' },
    { label: 'Calculators', href: 'calculators.html', ariaLabel: 'Anaesthesia Calculators' },
    { label: '3D Workstation', href: 'ventilator.html', ariaLabel: '3D Anaesthesia Workstation' },
    { label: 'Drugs', href: 'drugs.html', ariaLabel: 'Pharmacology Library' },
    { label: 'Critical Care', href: 'critical-care.html', ariaLabel: 'Critical Care & Code' },
    { label: 'Viva', href: 'notes.html#viva', ariaLabel: 'Viva Exam Drills in Notes' },
    { label: 'About', href: 'resources.html', ariaLabel: 'About KnockoutNotes' }
  ];

  var MOBILE_ITEMS = [
    { label: 'Home', href: 'index.html', ariaLabel: 'Home', hoverColor: '#0284c7' },
    { label: 'Notes', href: 'notes.html', ariaLabel: 'Clinical Notes', hoverColor: '#0ea5e9' },
    { label: 'Pearls', href: 'pearls.html', ariaLabel: 'Clinical Pearls', hoverColor: '#06b6d4' },
    { label: 'Valve Lesions', href: 'notes.html#valves', ariaLabel: 'Valve Lesions Haemodynamics', hoverColor: '#0d9488' },
    { label: 'Calculators', href: 'calculators.html', ariaLabel: 'Anaesthesia Calculators', hoverColor: '#2563eb' },
    { label: '3D Workstation', href: 'ventilator.html', ariaLabel: '3D Anaesthesia Workstation', hoverColor: '#7c3aed' },
    { label: 'Drugs', href: 'drugs.html', ariaLabel: 'Drug Library', hoverColor: '#0891b2' },
    { label: 'Critical Care & Code', href: 'critical-care.html', ariaLabel: 'Critical Care & Code', hoverColor: '#dc2626' },
    { label: 'Viva Drills', href: 'notes.html#viva', ariaLabel: 'Viva Exam Drills in Notes', hoverColor: '#9333ea' },
    { label: 'Recent Updates', href: 'recent-updates.html', ariaLabel: 'Recent Updates', hoverColor: '#0284c7' },
    { label: 'About & Evidence', href: 'resources.html', ariaLabel: 'About KnockoutNotes', hoverColor: '#059669' }
  ];

  var isMobileMenuOpen = false;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getCurrentPath() {
    return window.location.pathname.split("/").pop() || "index.html";
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
    }).join("");

    nav.innerHTML = [
      '<div class="kn-desktop-nav-capsule">',
      '  <a class="kn-desktop-brand" href="index.html" aria-label="KnockoutNotes Home">',
      '    <img src="knockoutnotes_icon.png" alt="KnockoutNotes emblem" class="kn-desktop-logo">',
      '    <span class="kn-desktop-brand-name">Knockout<span>Notes</span></span>',
      '  </a>',
      '  <div class="kn-desktop-links" role="menubar">',
      linksHtml,
      '  </div>',
      '  <div class="kn-desktop-actions">',
      '    <button type="button" class="kn-desktop-action-btn kn-desktop-search-btn" data-open-search title="Search Database (⌘K)" aria-label="Open search">',
      '      <span>Search</span>',
      '      <kbd>⌘K</kbd>',
      '    </button>',
      '    <button type="button" class="kn-desktop-action-btn kn-desktop-theme-btn" id="knDesktopThemeToggle" title="Toggle theme" aria-label="Toggle theme">',
      '      <span class="kn-theme-icon-slot">☾</span>',
      '    </button>',
      '  </div>',
      '</div>'
    ].join("\n");

    // Insert at the top of the body or active presentation layer
    var firstChild = document.body.firstChild;
    document.body.insertBefore(nav, firstChild);

    // Bind desktop theme button
    var themeBtn = nav.querySelector("#knDesktopThemeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }
  }

  // ------------------------------------------------------------------------
  // 2. Render Mobile BubbleMenu (< 768px)
  // ------------------------------------------------------------------------
  function renderMobileBubbleMenu() {
    if (document.getElementById("knBubbleNav")) return;

    var currentPath = getCurrentPath();
    var currentHash = window.location.hash;

    // Mobile Header Bar
    var bubbleNav = document.createElement("nav");
    bubbleNav.id = "knBubbleNav";
    bubbleNav.className = "bubble-menu";
    bubbleNav.setAttribute("aria-label", "KnockoutNotes mobile navigation");

    bubbleNav.innerHTML = [
      '<a class="bubble logo-bubble" href="index.html" aria-label="KnockoutNotes Home">',
      '  <img src="knockoutnotes_icon.png" alt="KnockoutNotes emblem" class="bubble-logo">',
      '  <span class="bubble-brand-name">Knockout<span>Notes</span></span>',
      '</a>',
      '<div class="bubble-actions">',
      '  <button type="button" class="bubble-action-btn" id="knBubbleSearchBtn" data-open-search title="Search (⌘K)" aria-label="Open search">',
      '    <span>⌕</span>',
      '  </button>',
      '  <button type="button" class="bubble-action-btn" id="knBubbleThemeBtn" title="Toggle Theme" aria-label="Toggle dark/light theme">',
      '    <span class="kn-theme-icon-slot">☾</span>',
      '  </button>',
      '  <button type="button" class="bubble toggle-bubble menu-btn" id="knBubbleMenuToggle" aria-label="Open mobile navigation" aria-expanded="false">',
      '    <span class="menu-line"></span>',
      '    <span class="menu-line"></span>',
      '  </button>',
      '</div>'
    ].join("\n");

    // Mobile Fullscreen Staggered Overlay
    var overlay = document.createElement("div");
    overlay.id = "knBubbleOverlay";
    overlay.className = "bubble-menu-items";
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Mobile navigation menu");

    var pillsHtml = MOBILE_ITEMS.map(function (item, idx) {
      var isCurPage = item.href === currentPath || (currentPath === "index.html" && item.href === "index.html");
      var isCurHash = item.href.indexOf("#") !== -1 && (currentPath + currentHash).indexOf(item.href) !== -1;
      var isActive = isCurHash || (!item.href.includes("#") && isCurPage);

      return [
        '<li class="pill-col" role="none">',
        '  <a class="pill-link' + (isActive ? ' active-route' : '') + '"',
        '     role="menuitem"',
        '     href="' + item.href + '"',
        '     data-pill-index="' + idx + '"',
        '     aria-label="' + item.ariaLabel + '"',
        '     style="--hover-bg: ' + item.hoverColor + ';">',
        '    <span class="pill-label">' + item.label + '</span>',
        '    <span class="pill-arrow" aria-hidden="true">→</span>',
        '  </a>',
        '</li>'
      ].join("\n");
    }).join("\n");

    overlay.innerHTML = [
      '<ul class="pill-list" role="menu" aria-label="Menu links">',
      pillsHtml,
      '</ul>',
      '<div class="pill-close-hint">Tap outside or press <kbd>ESC</kbd> to close</div>'
    ].join("\n");

    document.body.appendChild(bubbleNav);
    document.body.appendChild(overlay);

    bindMobileEvents(bubbleNav, overlay);
  }

  // ------------------------------------------------------------------------
  // 3. Mobile Open/Close State & Robust Scroll-Lock Handling
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

    var bubbles = Array.from(overlay.querySelectorAll(".pill-link"));
    var labels = Array.from(overlay.querySelectorAll(".pill-label"));
    var gsap = window.gsap;

    if (open) {
      overlay.style.display = "flex";

      if (gsap && !prefersReducedMotion) {
        gsap.killTweensOf(bubbles.concat(labels));
        gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%" });
        gsap.set(labels, { y: 16, autoAlpha: 0 });

        bubbles.forEach(function (bubble, i) {
          var tl = gsap.timeline({ delay: i * 0.05 });
          tl.to(bubble, {
            scale: 1,
            duration: 0.35,
            ease: "back.out(1.5)"
          });
          if (labels[i]) {
            tl.to(labels[i], {
              y: 0,
              autoAlpha: 1,
              duration: 0.28,
              ease: "power3.out"
            }, "-=0.25");
          }
        });
      } else {
        bubbles.forEach(function (b) { b.style.opacity = "1"; b.style.transform = "none"; });
        labels.forEach(function (l) { l.style.opacity = "1"; l.style.transform = "none"; });
      }

      var firstLink = overlay.querySelector(".pill-link");
      if (firstLink) firstLink.focus();
    } else {
      if (gsap && !prefersReducedMotion) {
        gsap.killTweensOf(bubbles.concat(labels));
        gsap.to(labels, { y: 12, autoAlpha: 0, duration: 0.15, ease: "power3.in" });
        gsap.to(bubbles, {
          scale: 0,
          duration: 0.15,
          ease: "power3.in",
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

    var themeBtn = document.getElementById("knBubbleThemeBtn");
    if (themeBtn) {
      themeBtn.addEventListener("click", toggleTheme);
    }

    // Click outside to close
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) {
        setMobileMenuState(false);
      }
    });

    // Escape key
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setMobileMenuState(false);
      }
    });

    // Pill link clicks
    overlay.querySelectorAll(".pill-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        var href = link.getAttribute("href");
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

  function initNavigation() {
    renderDesktopNav();
    renderMobileBubbleMenu();
    syncThemeIcons();
    handleHashRoute();
  }

  window.KnockoutNavigation = {
    init: initNavigation,
    openMobileMenu: function () { setMobileMenuState(true); },
    closeMobileMenu: function () { setMobileMenuState(false); }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
  } else {
    initNavigation();
  }
})();
