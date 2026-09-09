// ==========================================================================
// KNOCKOUTNOTES — Scroll-Driven Spatial Depth Engine (spatial-scroll.js)
// 3D VIEW ONLY. Drives the major content blocks (and the cards inside the
// block nearest the viewer) through bounded Z-space as the user scrolls:
// the section closest to the viewport's focal line comes forward and stays
// sharp; sections above/below recede, shrink, dim and soften — a controlled
// spatial carousel, not free camera movement. Lite View is never touched:
// every selector below is scoped to .view-layer-3d.
// ==========================================================================

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  const mqMobile = window.matchMedia("(max-width: 720px)");

  let blocks = [];
  let cards = [];
  let raf = null;
  let running = false;
  let measureQueued = false;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function makeEntry(el) {
    return {
      el,
      top: 0,
      height: 0,
      inView: true,
      curTz: 0, curScale: 1, curOp: 1, curBlur: 0, curRot: 0,
      tgtTz: 0, tgtScale: 1, tgtOp: 1, tgtBlur: 0, tgtRot: 0
    };
  }

  function collect() {
    blocks = Array.from(
      document.querySelectorAll(".view-layer-3d .spatial-world > .container > *")
    ).map(makeEntry);
    blocks.forEach(b => b.el.classList.add("depth-block"));

    cards = Array.from(
      document.querySelectorAll(".view-layer-3d .card, .view-layer-3d .explore-card")
    ).map(makeEntry);
    cards.forEach(c => c.el.classList.add("depth-card"));

    measure();
    setupVisibilityTracking();
  }

  function measure() {
    blocks.forEach(b => {
      const r = b.el.getBoundingClientRect();
      b.top = r.top + window.scrollY;
      b.height = r.height;
    });
    cards.forEach(c => {
      const r = c.el.getBoundingClientRect();
      c.top = r.top + window.scrollY;
      c.height = r.height;
    });
  }

  let io = null;
  function setupVisibilityTracking() {
    if (io) io.disconnect();
    if (!("IntersectionObserver" in window)) return;
    io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const target = entry.target;
        const list = target.classList.contains("depth-card") ? cards : blocks;
        const item = list.find(x => x.el === target);
        if (item) item.inView = entry.isIntersecting;
      });
    }, { rootMargin: "60% 0px 60% 0px" });
    blocks.forEach(b => io.observe(b.el));
    cards.forEach(c => io.observe(c.el));
  }

  function queueMeasure() {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => {
      measure();
      measureQueued = false;
    });
  }

  function applyDepth(entry, focalY, range, cfg) {
    const center = entry.top + entry.height / 2;
    const norm = clamp((center - focalY) / range, -1.5, 1.5);
    const absN = Math.min(Math.abs(norm), 1);
    const t = smoothstep(absN);
    const dir = norm >= 0 ? 1 : -1;

    entry.tgtTz = lerp(cfg.forward, cfg.recede, t);
    entry.tgtScale = lerp(cfg.scaleNear, cfg.scaleFar, t);
    entry.tgtOp = lerp(1, cfg.opFar, t);
    entry.tgtBlur = lerp(0, cfg.blurFar, t);
    entry.tgtRot = dir * lerp(0, cfg.rotFar, t);
  }

  const blockCfgDesktop = { forward: 60, recede: -240, scaleNear: 1.015, scaleFar: 0.9, opFar: 0.45, blurFar: 3, rotFar: 6 };
  const blockCfgMobile  = { forward: 22, recede: -90,  scaleNear: 1.0,   scaleFar: 0.96, opFar: 0.55, blurFar: 0, rotFar: 2 };
  const cardCfgDesktop  = { forward: 18, recede: -60,  scaleNear: 1.02,  scaleFar: 0.96, opFar: 0.7,  blurFar: 1.2, rotFar: 3 };

  function tick() {
    raf = null;
    if (!running) return;

    const is3D = document.body.classList.contains("mode-3d");
    if (!is3D) {
      raf = requestAnimationFrame(tick);
      return;
    }

    const mobile = mqMobile.matches;
    const viewH = window.innerHeight;
    const focalY = window.scrollY + viewH * 0.42;
    const blockRange = viewH * (mobile ? 1.1 : 0.95);
    const cardRange = viewH * 0.5;
    const bCfg = mobile ? blockCfgMobile : blockCfgDesktop;

    blocks.forEach(b => {
      if (!b.inView) return;
      applyDepth(b, focalY, blockRange, bCfg);
      b.curTz += (b.tgtTz - b.curTz) * 0.12;
      b.curScale += (b.tgtScale - b.curScale) * 0.12;
      b.curOp += (b.tgtOp - b.curOp) * 0.12;
      b.curBlur += (b.tgtBlur - b.curBlur) * 0.12;
      b.curRot += (b.tgtRot - b.curRot) * 0.12;

      b.el.style.setProperty("--dz", b.curTz.toFixed(1) + "px");
      b.el.style.setProperty("--dscale", b.curScale.toFixed(3));
      b.el.style.setProperty("--dop", b.curOp.toFixed(3));
      b.el.style.setProperty("--dblur", b.curBlur.toFixed(2) + "px");
      b.el.style.setProperty("--drot", b.curRot.toFixed(2) + "deg");
    });

    if (!mobile) {
      cards.forEach(c => {
        if (!c.inView) return;
        applyDepth(c, focalY, cardRange, cardCfgDesktop);
        c.curTz += (c.tgtTz - c.curTz) * 0.14;
        c.curScale += (c.tgtScale - c.curScale) * 0.14;
        c.curOp += (c.tgtOp - c.curOp) * 0.14;
        c.curRot += (c.tgtRot - c.curRot) * 0.14;

        c.el.style.setProperty("--cdz", c.curTz.toFixed(1) + "px");
        c.el.style.setProperty("--cdscale", c.curScale.toFixed(3));
        c.el.style.setProperty("--cdop", c.curOp.toFixed(3));
        c.el.style.setProperty("--cdrot", c.curRot.toFixed(2) + "deg");
      });
    }

    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function init() {
    collect();
    start();

    window.addEventListener("scroll", () => {}, { passive: true });
    window.addEventListener("resize", queueMeasure, { passive: true });

    // Content that loads asynchronously (Google Sheets grids, drug library
    // tabs) changes block heights after the initial layout — re-measure
    // once it lands instead of guessing.
    document.addEventListener("knLibraryReady", () => {
      queueMeasure();
      setupVisibilityTracking();
    });

    if ("MutationObserver" in window) {
      const worlds = document.querySelectorAll(".view-layer-3d .spatial-world");
      const mo = new MutationObserver(() => queueMeasure());
      worlds.forEach(w => mo.observe(w, { childList: true, subtree: true }));
    }

    // Re-collect if the mode switches into 3D after starting in Lite.
    document.querySelectorAll(".kn-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => queueMeasure());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
