// ==========================================================================
// KNOCKOUTNOTES — Controlled 3D Spatial Camera Engine (spatial-camera.js)
// Subtle Scroll Depth Parallax, Section Environmental Triggering, Zero Erratic Zoom
// ==========================================================================

(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  let currentZ = 0;
  let targetZ = 0;
  let pitch = 0;
  let targetPitch = 0;
  let yaw = 0;
  let targetYaw = 0;

  // Gentle cursor parallax (max 3 degrees)
  window.addEventListener("pointermove", (e) => {
    const normX = (e.clientX / window.innerWidth) - 0.5;
    const normY = (e.clientY / window.innerHeight) - 0.5;
    targetPitch = -normY * 2.8;
    targetYaw = normX * 2.8;
  }, { passive: true });

  // Native scroll tracking: gentle depth translation
  function onScroll() {
    targetZ = window.scrollY * 0.18; // Controlled 0.18px per scroll px
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Section environmental tracking
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
      const hudPath = document.getElementById("knHudPath");
      if (hudPath && secNameMap[found]) {
        hudPath.textContent = secNameMap[found];
      }
    }
  }

  window.addEventListener("scroll", checkEnvironments, { passive: true });

  // Camera loop
  function updateCamera() {
    currentZ += (targetZ - currentZ) * 0.08;
    pitch += (targetPitch - pitch) * 0.08;
    yaw += (targetYaw - yaw) * 0.08;

    document.documentElement.style.setProperty("--cam-pitch", `${pitch.toFixed(2)}deg`);
    document.documentElement.style.setProperty("--cam-yaw", `${yaw.toFixed(2)}deg`);
    document.documentElement.style.setProperty("--cam-z", `${currentZ.toFixed(1)}px`);

    requestAnimationFrame(updateCamera);
  }

  updateCamera();

  window.KnockoutSpatialCamera = {
    warpToZ: (z) => { targetZ = z; }
  };
})();
