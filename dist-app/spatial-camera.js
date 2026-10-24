// ==========================================================================
// KNOCKOUTNOTES — Section Environment Tracker (spatial-camera.js)
// The page itself never rotates or moves — this only swaps the ambient
// background palette/waveforms and the HUD path label as the user scrolls
// past each named section. All spatial motion lives in the card carousels
// (spatial-scroll.js), scoped to their own card collections.
// ==========================================================================

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const sections = document.querySelectorAll("[data-env-state]");
  let activeState = "";

  const secNameMap = {
    hero: "KN // OR WORKSTATION",
    pearls: "KN // CLINICAL PEARLS",
    drugs: "KN // PHARMACOLOGY",
    criticalCare: "KN // ICU TELEMETRY",
    viva: "KN // VIVA DRILL CHAMBER",
    resources: "KN // REFERENCE SHELF"
  };

  let cachedPositions = [];
  function updateSectionOffsets() {
    cachedPositions = [];
    sections.forEach(sec => {
      cachedPositions.push({
        envState: sec.dataset.envState,
        top: sec.offsetTop,
        bottom: sec.offsetTop + sec.offsetHeight
      });
    });
  }

  window.addEventListener("resize", updateSectionOffsets, { passive: true });
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(updateSectionOffsets);
  } else {
    setTimeout(updateSectionOffsets, 100);
  }
  updateSectionOffsets();

  let scrollTicking = false;
  function checkEnvironments() {
    scrollTicking = false;
    const scrollMid = window.scrollY + window.innerHeight * 0.45;
    let found = null;

    for (let i = 0; i < cachedPositions.length; i++) {
      const pos = cachedPositions[i];
      if (scrollMid >= pos.top && scrollMid <= pos.bottom) {
        found = pos.envState;
        break;
      }
    }

    if (found && found !== activeState) {
      activeState = found;
      if (window.KnockoutSpatialBg && typeof window.KnockoutSpatialBg.setEnvironment === "function") {
        window.KnockoutSpatialBg.setEnvironment(found);
      }
      document.querySelectorAll("#knHudPath, #knHudPath3d, .kn-hud-path").forEach(hudPath => {
        if (secNameMap[found]) {
          hudPath.textContent = secNameMap[found];
        }
      });
    }
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(checkEnvironments);
    }
  }, { passive: true });
  checkEnvironments();
})();
