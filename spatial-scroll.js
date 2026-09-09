// ==========================================================================
// KNOCKOUTNOTES — 3D Card Carousel Engine (spatial-scroll.js)
// 3D VIEW ONLY. The page itself (hero, headings, nav, prose) stays static.
// This engine turns ONE designated card collection at a time into a bounded
// horizontal spatial carousel: the centred card projects forward and stays
// sharp, its immediate neighbours are angled/scaled back, and anything
// beyond that fades out rather than cluttering the screen. Vertical page
// scroll drives which card is centred; clicking a side card, the arrows,
// the dots, or a swipe/drag all move the carousel directly. Lite View is
// never touched — every carousel is built only on nodes inside
// .view-layer-3d, opted into explicitly by page code (see bottom of file
// and content-library.js), never by scanning the whole page.
// ==========================================================================

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Depth "stops" the centred-outward falloff is interpolated between, so
  // translateZ/rotateY/scale/opacity/blur all move together as one card
  // becomes the centre and its neighbours fall away — a real stack of
  // cards in space, not a flat row with a fade applied.
  const STOPS_DESKTOP = [
    { at: 0, tz: 170, rot: 0, scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, tz: -115, rot: 27, scale: 0.85, op: 0.74, blur: 1.0 },
    { at: 2, tz: -300, rot: 41, scale: 0.70, op: 0.10, blur: 2.4 },
    { at: 3, tz: -320, rot: 44, scale: 0.64, op: 0.00, blur: 3.0 }
  ];
  const STOPS_MOBILE = [
    { at: 0, tz: 90, rot: 0, scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, tz: -80, rot: 22, scale: 0.86, op: 0.46, blur: 0 },
    { at: 2, tz: -160, rot: 32, scale: 0.74, op: 0.00, blur: 0 }
  ];

  function interpStops(aoff, stops) {
    const maxAt = stops[stops.length - 1].at;
    const t = clamp(aoff, 0, maxAt);
    let a = stops[0], b = stops[stops.length - 1];
    for (let i = 0; i < stops.length - 1; i++) {
      if (t >= stops[i].at && t <= stops[i + 1].at) {
        a = stops[i]; b = stops[i + 1];
        break;
      }
    }
    const span = b.at - a.at || 1;
    const localT = (t - a.at) / span;
    return {
      tz: lerp(a.tz, b.tz, localT),
      rot: lerp(a.rot, b.rot, localT),
      scale: lerp(a.scale, b.scale, localT),
      op: lerp(a.op, b.op, localT),
      blur: lerp(a.blur, b.blur, localT)
    };
  }

  let uid = 0;

  function Carousel(container, opts) {
    this.id = ++uid;
    this.container = container;
    this.opts = Object.assign({ stepFactor: 0.6 }, opts || {});
    this.cards = [];
    this.currentIndex = 0;
    this.targetIndex = 0;
    this.manual = false;
    this.manualBaselineScrollY = 0;
    this.dragging = false;
    this.destroyed = false;
    this.settled = true;
    this.dotsEl = null;
    this._build();
  }

  Carousel.prototype._directChildren = function () {
    return Array.from(this.container.children).filter(
      el => el.nodeType === 1 && !el.classList.contains("kn-carousel-controls")
    );
  };

  Carousel.prototype._controlsReserve = function () {
    return isMobile() ? 46 : 56;
  };

  Carousel.prototype._build = function () {
    const children = this._directChildren();
    if (!children.length) {
      this.cards = [];
      return;
    }

    this.container.classList.add("kn-carousel");

    // The carousel-card class switches a card from its flat-list layout to
    // the taller vertical card layout (thumbnail + name + descriptor + CTA)
    // — apply it *before* measuring, or offsetHeight reports the old flat
    // row's height and the reserved space ends up too short, clipping the
    // CTA under the controls bar.
    children.forEach((card, i) => {
      card.classList.add("kn-carousel-card");
      card.dataset.kcIndex = String(i);
    });

    let maxH = 0;
    children.forEach(c => { maxH = Math.max(maxH, c.offsetHeight); });
    if (maxH < 40) maxH = 340;
    maxH += this._controlsReserve();
    this.container.style.setProperty("--carousel-h", maxH + "px");
    this.container.style.height = "var(--carousel-h)";

    this.cards = children;

    this.currentIndex = clamp(this.currentIndex, 0, this.cards.length - 1);
    this.targetIndex = this.currentIndex;

    this._buildControls();
    this._wireCardClicks();
    this._wireDrag();
    this._layout();
  };

  Carousel.prototype._buildControls = function () {
    let controls = this.container.querySelector(":scope > .kn-carousel-controls");
    if (controls) controls.remove();
    if (this.cards.length < 2) return;

    controls = document.createElement("div");
    controls.className = "kn-carousel-controls";

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "kn-carousel-arrow kn-carousel-prev";
    prev.setAttribute("aria-label", "Previous card");
    prev.textContent = "←";
    prev.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(Math.round(this.targetIndex) - 1);
    });

    const dots = document.createElement("div");
    dots.className = "kn-carousel-dots";
    this.cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "kn-carousel-dot" + (i === Math.round(this.targetIndex) ? " active" : "");
      dot.setAttribute("aria-label", "Go to card " + (i + 1));
      dot.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        this.goTo(i);
      });
      dots.appendChild(dot);
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "kn-carousel-arrow kn-carousel-next";
    next.setAttribute("aria-label", "Next card");
    next.textContent = "→";
    next.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(Math.round(this.targetIndex) + 1);
    });

    controls.appendChild(prev);
    controls.appendChild(dots);
    controls.appendChild(next);
    this.container.appendChild(controls);
    this.dotsEl = dots;
  };

  Carousel.prototype._wireCardClicks = function () {
    this.cards.forEach((card, i) => {
      if (card.dataset.kcClickWired) return;
      card.dataset.kcClickWired = "1";
      // Capture phase: a click on a card that is NOT currently centred just
      // brings it to the centre and never reaches the card's own link/button
      // handlers (asset viewer, reveal button, etc). A click on the centred
      // card passes through untouched.
      card.addEventListener("click", e => {
        const off = Number(card.dataset.kcIndex) - Math.round(this.targetIndex);
        if (off !== 0) {
          e.preventDefault();
          e.stopPropagation();
          this.goTo(Number(card.dataset.kcIndex));
        }
      }, true);
    });
  };

  Carousel.prototype._wireDrag = function () {
    if (this.container.dataset.kcDragWired) return;
    this.container.dataset.kcDragWired = "1";
    this.container.style.touchAction = "pan-y";

    let startX = 0, startIdx = 0, active = false, moved = false;

    const onDown = e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true;
      moved = false;
      this.dragging = true;
      startX = e.clientX;
      startIdx = this.targetIndex;
    };
    const onMove = e => {
      if (!active) return;
      const w = this.container.getBoundingClientRect().width || 560;
      const step = w * this.opts.stepFactor * (isMobile() ? 0.78 : 1);
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (!moved) return;
      this.manual = true;
      this.targetIndex = clamp(startIdx - dx / step, 0, this.cards.length - 1);
      this._updateDots();
    };
    const onUp = () => {
      if (!active) return;
      active = false;
      this.dragging = false;
      if (moved) this.goTo(Math.round(this.targetIndex));
    };

    this.container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    this.container.tabIndex = 0;
    this.container.addEventListener("keydown", e => {
      if (e.key === "ArrowLeft") { e.preventDefault(); this.goTo(Math.round(this.targetIndex) - 1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); this.goTo(Math.round(this.targetIndex) + 1); }
    });
  };

  Carousel.prototype.goTo = function (i) {
    this.manual = true;
    this.manualBaselineScrollY = window.scrollY;
    this.targetIndex = clamp(Math.round(i), 0, this.cards.length - 1);
    this._updateDots();
  };

  Carousel.prototype.setScrollProgress = function (t) {
    if (this.manual || this.cards.length < 2) return;
    const raw = clamp(t, 0, 1) * (this.cards.length - 1);
    // While the page is actively scrolling, track continuously (cards drift
    // through one another mid-gesture); once scrolling settles, snap to the
    // nearest whole card so the active one comes to rest exactly centred.
    this.targetIndex = this.settled ? Math.round(raw) : raw;
  };

  Carousel.prototype._updateDots = function () {
    if (!this.dotsEl) return;
    const nearest = Math.round(this.targetIndex);
    Array.from(this.dotsEl.children).forEach((d, i) => d.classList.toggle("active", i === nearest));
  };

  Carousel.prototype._layout = function () {
    const mobile = isMobile();
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || 560;
    const stepPx = w * this.opts.stepFactor * (mobile ? 0.78 : 1);
    const stops = mobile ? STOPS_MOBILE : STOPS_DESKTOP;

    this.cards.forEach((card, i) => {
      const off = i - this.currentIndex;
      const aoff = Math.abs(off);
      const dir = off >= 0 ? 1 : -1;
      const centered = aoff < 0.03;

      const d = interpStops(aoff, stops);
      const cx = off * stepPx;
      const cz = d.tz;
      const cry = clamp(-dir * d.rot, -44, 44);
      const cs = d.scale;
      const cop = centered ? 1 : d.op;
      const cbl = d.blur;

      card.style.setProperty("--cx", cx.toFixed(1) + "px");
      card.style.setProperty("--cz", cz.toFixed(1) + "px");
      card.style.setProperty("--cry", cry.toFixed(1) + "deg");
      card.style.setProperty("--cs", cs.toFixed(3));
      card.style.setProperty("--cop", clamp(cop, 0, 1).toFixed(3));
      card.style.setProperty("--cbl", cbl.toFixed(2) + "px");
      card.style.zIndex = String(100 - Math.round(aoff * 10));
      card.dataset.centered = centered ? "true" : "false";
      card.style.pointerEvents = cop < 0.04 ? "none" : "";
    });
  };

  Carousel.prototype.tick = function () {
    if (this.destroyed || !this.cards.length) return;
    if (reduceMotion) {
      this.currentIndex = this.targetIndex;
    } else {
      this.currentIndex += (this.targetIndex - this.currentIndex) * 0.14;
      if (Math.abs(this.targetIndex - this.currentIndex) < 0.001) this.currentIndex = this.targetIndex;
    }
    this._layout();
  };

  Carousel.prototype.refresh = function () {
    const children = this._directChildren();
    const changed = children.length !== this.cards.length || children.some((c, i) => c !== this.cards[i]);
    if (changed) {
      this._build();
      return;
    }
    let maxH = 0;
    this.cards.forEach(c => { maxH = Math.max(maxH, c.scrollHeight); });
    if (maxH > 40) this.container.style.setProperty("--carousel-h", (maxH + this._controlsReserve()) + "px");
    this._layout();
  };

  const carousels = [];

  function mount(container, opts) {
    if (!container) return null;
    const existing = carousels.find(c => c.container === container);
    if (existing) return existing;
    const c = new Carousel(container, opts);
    carousels.push(c);
    return c;
  }

  // ---- Scroll-driven progress: maps a carousel's vertical position through
  // the viewport to a 0..1 progress value across its own card count. ----
  function computeProgress(container) {
    const rect = container.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const viewH = window.innerHeight;
    const focalY = viewH * 0.5;
    const range = Math.max(viewH * 0.7, 420);
    const norm = clamp((centerY - focalY) / range, -1, 1);
    return (1 - norm) / 2;
  }

  // A manual interaction (click / drag / arrow / dot) should stick until the
  // user actually scrolls the page a meaningful distance — not the first
  // incidental pixel of scroll a click itself can cause (focus, layout
  // settling). That incidental-scroll false-clear was the "Next never
  // works" bug: the very next animation frame would silently snap the
  // target back to the scroll-computed position.
  const MANUAL_RELEASE_DISTANCE = 70;

  let scrollIdleTimer = null;
  window.addEventListener("scroll", () => {
    carousels.forEach(c => {
      if (c.manual && !c.dragging && Math.abs(window.scrollY - c.manualBaselineScrollY) > MANUAL_RELEASE_DISTANCE) {
        c.manual = false;
      }
      c.settled = false;
    });
    clearTimeout(scrollIdleTimer);
    scrollIdleTimer = setTimeout(() => {
      carousels.forEach(c => { c.settled = true; });
    }, 150);
  }, { passive: true });

  window.addEventListener("resize", () => {
    carousels.forEach(c => c.refresh());
  });

  function frame() {
    const is3D = document.body.classList.contains("mode-3d");
    if (is3D) {
      carousels.forEach(c => {
        if (!c.manual) c.setScrollProgress(computeProgress(c.container));
        c.tick();
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Content that mounted while Lite View was active (or before layout
  // settled) can end up measured at zero size; re-measure once 3D becomes
  // visible again.
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".kn-mode-btn[data-mode='3d']").forEach(btn => {
      btn.addEventListener("click", () => {
        setTimeout(() => carousels.forEach(c => c.refresh()), 60);
      });
    });
  });

  window.KnCarousel = { mount, list: carousels };

  // ---- Auto-init for static, page-authored card grids. Dynamic content
  // (Google-Sheets grids, the drug/pearl/note/critical-care topic library)
  // is mounted explicitly by script.js / content-library.js once it exists,
  // since it isn't in the DOM yet at this point. ----
  const STATIC_TARGETS = {
    "home": [".bento-grid"],
    "critical-care": [".grid"],
    "viva": [".grid"],
    "resources": [".grid"]
  };

  function autoInit() {
    const page = document.body.dataset.contentPage || "";
    const selectors = STATIC_TARGETS[page] || [];
    selectors.forEach(sel => {
      document.querySelectorAll(".view-layer-3d " + sel).forEach(el => {
        if (el.dataset.kcSkip === "1" || el.children.length < 2) return;
        mount(el);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit);
  } else {
    autoInit();
  }
})();
