// ==========================================================================
// KNOCKOUTNOTES — 3D Card Carousel Engine (spatial-scroll.js)
// 3D VIEW ONLY. The page itself (hero, headings, nav, prose) stays static,
// and normal vertical page scrolling is never touched. This engine turns
// ONE designated card collection at a time into a bounded HORIZONTAL
// spatial carousel: the centred card projects forward and stays sharp, its
// immediate neighbours are angled/scaled back, and anything beyond that
// fades out rather than cluttering the screen. The carousel is driven only
// by horizontal input scoped to its own stage — horizontal wheel/trackpad
// delta, Shift+wheel, pointer drag, touch swipe, the side arrow buttons,
// and the keyboard arrow keys. Lite View is never touched — every carousel
// is built only on nodes inside .view-layer-3d, opted into explicitly by
// page code (see bottom of file and content-library.js), never by scanning
// the whole page.
// ==========================================================================

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
  const isTablet = () => window.matchMedia("(max-width: 1024px)").matches;

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
  const STOPS_TABLET = [
    { at: 0, tz: 130, rot: 0, scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, tz: -95, rot: 25, scale: 0.85, op: 0.68, blur: 0.6 },
    { at: 2, tz: -220, rot: 36, scale: 0.72, op: 0.08, blur: 1.6 }
  ];
  const STOPS_MOBILE = [
    { at: 0, tz: 90, rot: 0, scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, tz: -80, rot: 22, scale: 0.86, op: 0.46, blur: 0 },
    { at: 2, tz: -160, rot: 32, scale: 0.74, op: 0.00, blur: 0 }
  ];

  function stopsFor() {
    if (isMobile()) return STOPS_MOBILE;
    if (isTablet()) return STOPS_TABLET;
    return STOPS_DESKTOP;
  }

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
    this.destroyed = false;
    // Snap-animation state (goTo() sets these; tick() eases toward them).
    this._animFrom = 0;
    this._animStart = 0;
    this._animDur = 320;
    // True while the user is actively dragging/wheeling: currentIndex then
    // tracks targetIndex closely with no easing lag, so input feels 1:1.
    // Once input stops, a released goTo() takes over with a timed ease.
    this._trackingRaw = false;
    this._velocity = 0;
    this._lastMoveT = 0;
    this._lastMoveX = 0;
    this._lastMeasuredH = 0;
    this._build();
  }

  Carousel.prototype._directChildren = function () {
    return Array.from(this.container.children).filter(
      el => el.nodeType === 1 && !el.classList.contains("kn-carousel-controls")
    );
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
    // row's height and the carousel ends up too short, clipping the CTA.
    children.forEach((card, i) => {
      card.classList.add("kn-carousel-card");
      card.dataset.kcIndex = String(i);
    });

    this.container.style.height = "var(--carousel-h)";
    this.cards = children;

    this.currentIndex = clamp(this.currentIndex, 0, this.cards.length - 1);
    this.targetIndex = this.currentIndex;

    // Height is driven purely by the tallest card's real rendered height —
    // no reserved strip for controls, since the arrows now float beside the
    // stage rather than occupying dedicated vertical space. A ResizeObserver
    // (rather than a one-off measurement) keeps this correct as content
    // changes after mount — late web-font swaps, or a card growing when an
    // "answer" reveal inside it is toggled open — instead of the container
    // clipping content that has since grown taller than the last measurement.
    this._measureHeight();
    if (window.ResizeObserver) {
      if (this._resizeObserver) this._resizeObserver.disconnect();
      this._resizeObserver = new ResizeObserver(() => {
        if (this._roScheduled) return;
        this._roScheduled = true;
        requestAnimationFrame(() => {
          this._roScheduled = false;
          this._measureHeight();
        });
      });
      this.cards.forEach(c => this._resizeObserver.observe(c));
    }

    this._buildControls();
    this._wireCardClicks();
    this._wireHorizontalInput();
    this._wireHoverDepth();
    this._layout();
  };

  Carousel.prototype._measureHeight = function () {
    let maxH = 0;
    this.cards.forEach(c => { maxH = Math.max(maxH, c.scrollHeight); });
    if (maxH < 40) maxH = 340;
    if (Math.abs(maxH - this._lastMeasuredH) > 1) {
      this._lastMeasuredH = maxH;
      this.container.style.setProperty("--carousel-h", maxH + "px");
    }
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
    prev.setAttribute("aria-label", "Previous item");
    prev.innerHTML = '<span aria-hidden="true">&#8249;</span>';
    prev.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(Math.round(this.targetIndex) - 1);
    });

    const next = document.createElement("button");
    next.type = "button";
    next.className = "kn-carousel-arrow kn-carousel-next";
    next.setAttribute("aria-label", "Next item");
    next.innerHTML = '<span aria-hidden="true">&#8250;</span>';
    next.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      this.goTo(Math.round(this.targetIndex) + 1);
    });

    controls.appendChild(prev);
    controls.appendChild(next);
    this.container.appendChild(controls);
  };

  const ASSET_HREF_RE = /\.(?:jpg|jpeg|png|webp|pdf|ppt|pptx)(?:$|\?)/i;

  // Build the viewer's itemsList from the carousel's own cards, so Prev/Next
  // in the document viewer walks the SAME collection the carousel shows —
  // whatever category/page this carousel belongs to, never hardcoded.
  Carousel.prototype._itemsFromCards = function () {
    return this.cards.map(c => {
      const url = c.getAttribute("href") || "";
      const titleEl = c.querySelector(".kn-file-title");
      const title = (titleEl ? titleEl.textContent : c.textContent || "").trim();
      return { url, title };
    });
  };

  Carousel.prototype._wireCardClicks = function () {
    this.cards.forEach((card, i) => {
      if (card.dataset.kcClickWired) return;
      card.dataset.kcClickWired = "1";
      // Capture phase: a click on a card that is NOT currently centred just
      // brings it to the centre and never reaches the card's own link/button
      // handlers (asset viewer, reveal button, etc).
      card.addEventListener("click", e => {
        const idx = Number(card.dataset.kcIndex);
        const off = idx - Math.round(this.targetIndex);
        if (off !== 0) {
          e.preventDefault();
          e.stopPropagation();
          this.goTo(idx);
          return;
        }
        // Centred card: if it's a link to one of OUR OWN clinical assets
        // (never an external Recent-Updates URL, even one that happens to
        // end in .pdf), open the holographic viewer directly with the FULL
        // collection this carousel holds, so Prev/Next inside the viewer
        // walks every item in this category — not just the one card that
        // was clicked (that singleton-list bug is why the viewer used to
        // show "01 / 01" no matter what).
        const href = card.getAttribute && card.getAttribute("href");
        if (href && href.includes("assets/") && ASSET_HREF_RE.test(href) && window.KnockoutSpatialViewer) {
          e.preventDefault();
          e.stopPropagation();
          const items = this._itemsFromCards();
          window.KnockoutSpatialViewer.open(items[idx], items, idx);
        }
      }, true);
    });
  };

  // ---- Horizontal-only input: wheel (deltaX or Shift+wheel), pointer drag,
  // touch swipe. A wheel gesture that is primarily VERTICAL is left alone so
  // the page scrolls normally — the carousel never hijacks page scroll. ----
  Carousel.prototype._wireHorizontalInput = function () {
    if (this.container.dataset.kcInputWired) return;
    this.container.dataset.kcInputWired = "1";
    this.container.style.touchAction = "pan-y";

    let wheelIdleTimer = null;
    this.container.addEventListener("wheel", e => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!horizontal) return; // dominant vertical delta: let the page scroll
      e.preventDefault();
      const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const w = this.container.getBoundingClientRect().width || 560;
      const step = w * this.opts.stepFactor * (isMobile() ? 0.78 : 1);
      this._trackingRaw = true;
      this.targetIndex = clamp(this.targetIndex + delta / step, 0, this.cards.length - 1);
      clearTimeout(wheelIdleTimer);
      wheelIdleTimer = setTimeout(() => {
        this._trackingRaw = false;
        this.goTo(Math.round(this.targetIndex));
      }, 140);
    }, { passive: false });

    let startX = 0, startY = 0, startIdx = 0, active = false, moved = false, axisLocked = null;

    const onDown = e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active = true;
      moved = false;
      axisLocked = null;
      this.dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startIdx = this.targetIndex;
      this._velocity = 0;
      this._lastMoveT = performance.now();
      this._lastMoveX = e.clientX;
    };
    const onMove = e => {
      if (!active) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (axisLocked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        // Decide once per gesture: a mostly-vertical drag is a page scroll,
        // not a carousel swipe — release it back to the browser immediately.
        axisLocked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axisLocked !== "x") return;
      moved = true;
      this._trackingRaw = true;
      const now = performance.now();
      const dt = Math.max(1, now - this._lastMoveT);
      const instVel = (e.clientX - this._lastMoveX) / dt; // px/ms
      this._velocity = this._velocity * 0.5 + instVel * 0.5;
      this._lastMoveT = now;
      this._lastMoveX = e.clientX;
      const w = this.container.getBoundingClientRect().width || 560;
      const step = w * this.opts.stepFactor * (isMobile() ? 0.78 : 1);
      this.targetIndex = clamp(startIdx - dx / step, 0, this.cards.length - 1);
    };
    const onUp = () => {
      if (!active) return;
      active = false;
      this.dragging = false;
      this._trackingRaw = false;
      if (moved) {
        // Physical "fling": a fast short flick projects a little extra
        // momentum onto the release point before rounding to the nearest
        // card, so a quick swipe advances even when the raw drag distance
        // was under half a card-width — like flicking a real card.
        const w = this.container.getBoundingClientRect().width || 560;
        const step = w * this.opts.stepFactor * (isMobile() ? 0.78 : 1);
        const flingMs = 170;
        const projected = this.targetIndex - clamp((this._velocity * flingMs) / step, -0.9, 0.9);
        this.goTo(projected);
      }
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

  // ---- Restrained "physical card" pointer response: the centred card
  // tilts very slightly toward the pointer and lifts a few px, like a
  // holographic card responding to a hand. Neighbours get a much weaker
  // echo of the same effect. Touch devices get a gentle press/active depth
  // response instead, since there's no hover position to track. ----
  Carousel.prototype._wireHoverDepth = function () {
    if (reduceMotion) return;
    if (this.container.dataset.kcHoverWired) return;
    this.container.dataset.kcHoverWired = "1";

    const resetCard = card => {
      card.style.removeProperty("--hrx");
      card.style.removeProperty("--hry");
      card.style.removeProperty("--hz");
    };

    this.container.addEventListener("pointermove", e => {
      if (e.pointerType === "touch" || this.dragging) return;
      const card = e.target.closest(".kn-carousel-card");
      if (!card || card.dataset.kcIndex === undefined) return;
      const isCentred = card.dataset.centered === "true";
      const weight = isCentred ? 1 : 0.18;
      const rect = card.getBoundingClientRect();
      const nx = clamp((e.clientX - rect.left) / rect.width, 0, 1) - 0.5;
      const ny = clamp((e.clientY - rect.top) / rect.height, 0, 1) - 0.5;
      card.style.setProperty("--hrx", (-ny * 6 * weight).toFixed(2) + "deg");
      card.style.setProperty("--hry", (nx * 8 * weight).toFixed(2) + "deg");
      card.style.setProperty("--hz", (12 * weight).toFixed(1) + "px");
    }, { passive: true });

    this.container.addEventListener("pointerleave", () => {
      this.cards.forEach(resetCard);
    }, true);

    this.container.addEventListener("pointerdown", e => {
      if (e.pointerType !== "touch") return;
      const card = e.target.closest(".kn-carousel-card");
      if (card && card.dataset.centered === "true") card.classList.add("kc-pressed");
    });
    ["pointerup", "pointercancel"].forEach(evt => {
      this.container.addEventListener(evt, () => {
        this.cards.forEach(c => c.classList.remove("kc-pressed"));
      });
    });
  };

  Carousel.prototype.goTo = function (i) {
    const newTarget = clamp(Math.round(i), 0, this.cards.length - 1);
    const dist = Math.abs(newTarget - this.currentIndex);
    this._animFrom = this.currentIndex;
    this._animStart = performance.now();
    // ~250-450ms for a normal single-item snap; a longer jump (e.g.
    // clicking a far-off card) eases a little slower, capped so it never
    // feels sluggish.
    this._animDur = clamp(260 + dist * 60, 260, 460);
    this.targetIndex = newTarget;
  };

  Carousel.prototype._layout = function () {
    const mobile = isMobile();
    const rect = this.container.getBoundingClientRect();
    const w = rect.width || 560;
    const stepPx = w * this.opts.stepFactor * (mobile ? 0.78 : 1);
    const stops = stopsFor();

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
    } else if (this._trackingRaw) {
      // Actively dragging/wheeling: follow the input closely (light
      // smoothing only, no timed easing) so the gesture feels 1:1.
      this.currentIndex += (this.targetIndex - this.currentIndex) * 0.4;
      if (Math.abs(this.targetIndex - this.currentIndex) < 0.002) this.currentIndex = this.targetIndex;
    } else {
      // Settled/snapping: ease from where input left off to the target
      // card on a fixed timeline (see goTo) instead of an open-ended lerp,
      // so repeated Next clicks retarget cleanly with no animation queue.
      const t = clamp((performance.now() - this._animStart) / this._animDur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.currentIndex = lerp(this._animFrom, this.targetIndex, eased);
      if (t >= 1) this.currentIndex = this.targetIndex;
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
    this._measureHeight();
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

  window.addEventListener("resize", () => {
    carousels.forEach(c => c.refresh());
  });

  function frame() {
    const is3D = document.body.classList.contains("mode-3d");
    if (is3D) {
      carousels.forEach(c => c.tick());
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
