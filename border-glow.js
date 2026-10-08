// ==========================================================================
// KNOCKOUTNOTES — React Bits BorderGlow Engine (border-glow.js)
// Centralized, lightweight, rAF-throttled cursor-following border glow
// ==========================================================================

(function () {
  "use strict";

  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Explicit card selectors
  var CARD_SELECTOR = [
    ".card",
    ".calc-box",
    ".calc-hero-card",
    ".abg-step-card",
    ".abg-banner-impression",
    ".chamber-portal-card",
    ".vent-info-video-card",
    ".vent-explain-box",
    ".kn-file-row.kn-carousel-card",
    ".kn-file-row"
  ].join(", ");

  // Structural and interactive non-card elements to strictly exclude
  function isExcluded(el) {
    if (!el || el.nodeType !== 1) return true;
    if (el.closest("header, .site-hud, .bubble-menu, footer, .footer, .kn-modal, #knSearchModal, #ventSchematicModal, .kn-mode-switch-dock")) {
      return true;
    }
    if (el.tagName === "CANVAS" || el.id === "knSpatialCanvas" || el.id === "ventStage" || el.classList.contains("vent-canvas-host")) {
      return true;
    }
    if (el.tagName === "TABLE" || el.tagName === "FORM" || el.tagName === "INPUT" || el.tagName === "BUTTON" || el.tagName === "SELECT") {
      return true;
    }
    if (el.classList.contains("container") || el.classList.contains("spatial-stage") || el.classList.contains("spatial-world") || el.classList.contains("hero")) {
      return true;
    }
    return false;
  }

  function getCenterOfElement(el) {
    var rect = el.getBoundingClientRect();
    return [rect.width / 2, rect.height / 2];
  }

  function getEdgeProximity(el, x, y) {
    var center = getCenterOfElement(el);
    var cx = center[0];
    var cy = center[1];
    var dx = x - cx;
    var dy = y - cy;
    var kx = Infinity;
    var ky = Infinity;
    if (dx !== 0) kx = cx / Math.abs(dx);
    if (dy !== 0) ky = cy / Math.abs(dy);
    var minK = Math.min(kx, ky);
    if (minK === 0) return 1;
    return Math.min(Math.max(1 / minK, 0), 1);
  }

  function getCursorAngle(el, x, y) {
    var center = getCenterOfElement(el);
    var dx = x - center[0];
    var dy = y - center[1];
    if (dx === 0 && dy === 0) return 0;
    var radians = Math.atan2(dy, dx);
    var degrees = radians * (180 / Math.PI) + 90;
    if (degrees < 0) degrees += 360;
    return degrees;
  }

  function attachCardGlow(card) {
    if (!card || card.dataset.borderGlowInit === "true") return;
    if (isExcluded(card)) return;

    card.dataset.borderGlowInit = "true";
    card.classList.add("border-glow-card");

    // Detect light surface theme if applied locally
    var computed = window.getComputedStyle(card);
    var br = computed.borderRadius;
    if (br && br !== "0px") {
      card.style.setProperty("--border-radius", br);
    }

    // Ensure edge-light span exists
    if (!card.querySelector(".edge-light")) {
      var edgeLight = document.createElement("span");
      edgeLight.className = "edge-light";
      edgeLight.setAttribute("aria-hidden", "true");
      card.insertBefore(edgeLight, card.firstChild);
    }

    // Touch devices and reduced-motion skip interactive cursor tracking
    if (isTouch || prefersReducedMotion) return;

    var rafId = null;
    var pendingX = 0;
    var pendingY = 0;

    function onPointerMove(e) {
      var rect = card.getBoundingClientRect();
      pendingX = e.clientX - rect.left;
      pendingY = e.clientY - rect.top;

      if (!rafId) {
        rafId = requestAnimationFrame(function () {
          rafId = null;
          var edge = getEdgeProximity(card, pendingX, pendingY);
          var angle = getCursorAngle(card, pendingX, pendingY);
          card.style.setProperty("--edge-proximity", (edge * 100).toFixed(2));
          card.style.setProperty("--cursor-angle", angle.toFixed(2) + "deg");
        });
      }
    }

    function onPointerLeave() {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      card.style.setProperty("--edge-proximity", "0");
    }

    card.addEventListener("pointermove", onPointerMove, { passive: true });
    card.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  function initBorderGlow(root) {
    var scope = root || document;
    var cards = scope.querySelectorAll(CARD_SELECTOR);
    for (var i = 0; i < cards.length; i++) {
      attachCardGlow(cards[i]);
    }
  }

  // Observe dynamically created cards (e.g. content-library category changes, search results)
  function initObserver() {
    if (!("MutationObserver" in window)) return;
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var addedNodes = mutations[i].addedNodes;
        for (var j = 0; j < addedNodes.length; j++) {
          var node = addedNodes[j];
          if (node.nodeType === 1) {
            if (node.matches && node.matches(CARD_SELECTOR)) {
              attachCardGlow(node);
            }
            var childCards = node.querySelectorAll ? node.querySelectorAll(CARD_SELECTOR) : [];
            for (var k = 0; k < childCards.length; k++) {
              attachCardGlow(childCards[k]);
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  window.initBorderGlow = initBorderGlow;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initBorderGlow();
      initObserver();
    });
  } else {
    initBorderGlow();
    initObserver();
  }
})();
