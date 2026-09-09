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

  function checkEnvironments() {
    const scrollMid = window.scrollY + window.innerHeight * 0.45;
    let found = null;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollMid >= top && scrollMid <= bottom) {
        found = sec.dataset.envState;
      }
    });

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

  window.addEventListener("scroll", checkEnvironments, { passive: true });
  checkEnvironments();
})();
