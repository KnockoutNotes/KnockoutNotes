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

  // Must match .kn-carousel's CSS `perspective` value (styles.css) — used
  // to derive exactly how much the active card's perspective foreshortening
  // grows it beyond its own layout box.
  const PERSPECTIVE_PX = 1200;

  // The active card sits closest to the camera (largest translateZ), and
  // CSS perspective foreshortening makes it render visibly larger than its
  // own layout box — growing outward from its centre in every direction,
  // top included. Computed per-instance from the actual card height rather
  // than a flat guess: a fixed px value tuned against one card template
  // (e.g. the compact library cards) undershoots taller ones (the home
  // page's richer bento content), clipping their top edge. Every card is
  // shifted down by this amount (and the container measured taller to
  // match) so the enlarged top edge always has clearance, on any content.
  function topPadFor(rawCardH) {
    const activeTz = stopsFor()[0].tz;
    const scaleFactor = PERSPECTIVE_PX / (PERSPECTIVE_PX - activeTz);
    const bulge = (rawCardH / 2) * (scaleFactor - 1);
    return Math.ceil(bulge) + 6;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // Cinematic overshoot curve used only for the one-time "deploy" animation
  // (cards rising out of the dock) — a normal ease would read as a fade-in,
  // this gives the brief physical overshoot-then-settle the brief asks for.
  function easeOutBack(t) {
    const c1 = 1.70158, c3 = c1 + 1;
    const x = t - 1;
    return 1 + c3 * x * x * x + c1 * x * x;
  }

  // The pose every card starts from before its section has ever entered the
  // viewport: hidden low behind the dock, deep in Z, small and transparent.
  // _deploy() blends each card from here to its normal computed depth-stop
  // pose over DEPLOY_DURATION_MS, staggered outward from the centre.
  const DOCK_POSE = { cy: 130, cz: -260, cry: 0, cs: 0.32, cop: 0, cbl: 3 };
  const DEPLOY_DURATION_MS = 620;
  const DEPLOY_STAGGER_MS = 70;

  // Depth "stops" the centred-outward falloff is interpolated between, so
  // Explicit spatial-position states, not a flat row with perspective
  // applied: ACTIVE (at:0) sits closest to the viewer and dead centre;
  // NEAR (at:1) and FAR (at:2, desktop only: at:3 OFFSCREEN) sit
  // increasingly further out in X, DEEPER in Z (translateZ falls, even
  // going negative — genuinely behind the active card, not just smaller),
  // LOWER in Y (translateY rises toward the dock beneath the stack, so the
  // whole arrangement reads as cards fanning up and out of one origin
  // point rather than sliding along a horizontal line), and tilted on
  // BOTH axes — rotateY toward the centre plus a slight rotateX lean —
  // for a genuine shallow radial arc. x/rot get their left/right sign
  // applied in _layout(); every other field here is symmetric.
  // Depth spread widened site-wide (active pops further forward, far cards
  // recede further back, with blur added on mobile's near/far stops where
  // there previously was none) so the sense of z-depth reads clearly on
  // every breakpoint, not just desktop. topPadFor() reads stops[0].tz live,
  // so the perspective top-clip compensation adapts automatically here.
  const STOPS_DESKTOP = [
    { at: 0, x: 0,   y: 0,  tz: 175,  rx: 0, ry: 0,  scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, x: 185, y: 22, tz: 35,   rx: 4, ry: 24, scale: 0.80, op: 0.90, blur: 0.5 },
    { at: 2, x: 310, y: 46, tz: -85,  rx: 7, ry: 36, scale: 0.68, op: 0.58, blur: 1.4 },
    { at: 3, x: 390, y: 60, tz: -140, rx: 9, ry: 42, scale: 0.55, op: 0.00, blur: 3.6 }
  ];
  const STOPS_TABLET = [
    { at: 0, x: 0,   y: 0,  tz: 140, rx: 0, ry: 0,  scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, x: 150, y: 18, tz: 24,  rx: 3, ry: 22, scale: 0.80, op: 0.72, blur: 0.6 },
    { at: 2, x: 245, y: 36, tz: -75, rx: 6, ry: 32, scale: 0.66, op: 0.12, blur: 1.9 }
  ];
  const STOPS_MOBILE = [
    { at: 0, x: 0,   y: 0,  tz: 105, rx: 0, ry: 0,  scale: 1.00, op: 1.00, blur: 0 },
    { at: 1, x: 100, y: 14, tz: -5,  rx: 4, ry: 22, scale: 0.78, op: 0.5,  blur: 0.4 },
    { at: 2, x: 155, y: 26, tz: -65, rx: 6, ry: 32, scale: 0.62, op: 0.0,  blur: 1.0 }
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
      x: lerp(a.x, b.x, localT),
      y: lerp(a.y, b.y, localT),
      tz: lerp(a.tz, b.tz, localT),
      rx: lerp(a.rx, b.rx, localT),
      ry: lerp(a.ry, b.ry, localT),
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
    // Deployment state: cards start docked/hidden and rise into their real
    // depth-stop positions once this carousel's section first scrolls into
    // view (see _wireDeployObserver/_deploy). Vertical page scroll never
    // drives this — it only ever fires once, from IntersectionObserver.
    this.deployed = false;
    this._deploying = false;
    this._lastCenteredCard = null;
    this._ambientScheduled = false;
    this._build();
    this._scheduleAmbientFlicker();
  }

  // Ambient horror-flicker: the neon flash shouldn't only ever react to
  // hover/tap/navigation — periodically re-fire it on whichever card is
  // currently active so the stack reads as a living, slightly unstable
  // light rather than something that only responds when touched. Spaced
  // 7-15s apart, well under any seizure-risk flash frequency (WCAG's
  // threshold is 3 flashes/sec; this is roughly one every ten seconds),
  // and skipped entirely under prefers-reduced-motion. Started once per
  // instance regardless of how many times _build()/refresh() re-run.
  Carousel.prototype._scheduleAmbientFlicker = function () {
    if (reduceMotion || this._ambientScheduled) return;
    this._ambientScheduled = true;
    const tick = () => {
      if (this.destroyed) return;
      const visible = document.body.classList.contains("mode-3d") && this.container.offsetParent !== null;
      if (visible && this.cards.length) {
        const idx = clamp(Math.round(this.currentIndex), 0, this.cards.length - 1);
        const card = this.cards[idx];
        if (card) {
          card.classList.remove("kn-neon-flicker");
          // eslint-disable-next-line no-unused-expressions
          card.offsetWidth;
          card.classList.add("kn-neon-flicker");
        }
      }
      setTimeout(tick, 7000 + Math.random() * 8000);
    };
    setTimeout(tick, 7000 + Math.random() * 8000);
  };

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
      if (card.dataset.deployT === undefined) card.dataset.deployT = "0";
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
    this._buildDock();
    this._wireCardClicks();
    this._wireHorizontalInput();
    this._wireHoverDepth();
    this._wireDeployObserver();
    this._layout();
  };

  // A small glowing origin point placed in normal document flow right after
  // the card stage — purely decorative, never intercepts pointer/keyboard
  // input. Cards animate as if rising out of it the first time this
  // carousel's section enters the viewport (see _wireDeployObserver).
  Carousel.prototype._buildDock = function () {
    let dock = this.container.parentElement && this.container.parentElement.querySelector(":scope > .kn-carousel-dock");
    if (dock) { this._dockEl = dock; return; }
    dock = document.createElement("div");
    dock.className = "kn-carousel-dock";
    dock.setAttribute("aria-hidden", "true");
    dock.innerHTML =
      '<span class="kn-dock-ring kn-dock-ring-2"></span>' +
      '<span class="kn-dock-ring kn-dock-ring-1"></span>' +
      '<span class="kn-dock-core"></span>';
    this.container.insertAdjacentElement("afterend", dock);
    this._dockEl = dock;
  };

  // Deployment fires exactly once per carousel instance, driven only by
  // section visibility — never by ongoing scroll position, and never
  // re-armed by a category-tab switch (existing already-deployed carousels
  // just get re-shown/refreshed as before). An immediate bounding-box check
  Carousel.prototype._wireDeployObserver = function () {
    if (this.deployed || this._deploying) return;
    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      this.deployed = true;
      this.cards.forEach(c => { c.dataset.deployT = "1"; });
      return;
    }
    if (!this._deployObserver) {
      this._deployObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) this._deploy();
        });
      }, { threshold: 0.1 });
      this._deployObserver.observe(this.container);
    }
    // Check immediately and in next frame: if carousel container is present in viewport, deploy immediately
    const checkNow = () => {
      if (this.deployed || this._deploying || this.destroyed) return;
      const r = this.container.getBoundingClientRect();
      if (r.width > 0 && r.top < (window.innerHeight || 800) && r.bottom > 0) {
        this._deploy();
      }
    };
    checkNow();
    requestAnimationFrame(checkNow);

    // Failsafe timer: guarantee cards are never permanently stuck at opacity 0
    setTimeout(() => {
      if (!this.deployed && !this._deploying && !this.destroyed) {
        this.deployImmediate();
      }
    }, 180);
  };

  Carousel.prototype._deploy = function () {
    if (this.deployed || this._deploying) return;
    if (this._deployObserver) { this._deployObserver.disconnect(); this._deployObserver = null; }
    if (reduceMotion) { this.deployed = true; this.cards.forEach(c => { c.dataset.deployT = "1"; }); this._layout(); return; }
    this._deploying = true;
    const now = performance.now();
    // Stagger outward from whichever card starts centred, so the active
    // card is the first to rise and side cards follow outward from it.
    const order = this.cards.slice().sort((a, b) =>
      Math.abs(Number(a.dataset.kcIndex) - this.currentIndex) - Math.abs(Number(b.dataset.kcIndex) - this.currentIndex)
    );
    order.forEach((card, i) => {
      card._deployStart = now + i * DEPLOY_STAGGER_MS;
      card.dataset.deployT = "0";
    });
    if (this._dockEl) this._dockEl.classList.add("active");
  };

  Carousel.prototype.deployImmediate = function () {
    if (this._deployObserver) { this._deployObserver.disconnect(); this._deployObserver = null; }
    this.deployed = true;
    this._deploying = false;
    this.cards.forEach(c => { c.dataset.deployT = "1"; });
    this._measureHeight();
    this._layout();
    if (this._dockEl) this._dockEl.classList.remove("active");
  };

  Carousel.prototype._measureHeight = function () {
    let maxH = 0;
    this.cards.forEach(c => { maxH = Math.max(maxH, c.scrollHeight); });
    if (maxH < 40) maxH = 340;
    this._topPad = topPadFor(maxH);
    // Non-active cards now sit visibly lower (translateY toward the dock,
    // see STOPS_*'s y field) as part of the genuine radial arc — add
    // headroom below the tallest card's own box so that vertical spread
    // settles inside the container instead of being clipped by its
    // overflow:hidden edge.
    // Only needs to clear the deepest card that's still actually visible
    // (FAR's y-offset — anything past that, OFFSCREEN, renders at opacity 0
    // so clipping it is invisible) plus a few px of safety margin, not the
    // full theoretical spread of every named stop.
    const arcBuffer = isMobile() ? 16 : (isTablet() ? 38 : 50);
    const total = maxH + arcBuffer + this._topPad;
    if (Math.abs(total - this._lastMeasuredH) > 1) {
      this._lastMeasuredH = total;
      this.container.style.setProperty("--carousel-h", total + "px");
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
      // Capture phase: a click on a card's CTA button ("View Monograph" / thumb)
      // always opens the holographic viewer immediately for that note.
      // A click on the general body of a non-centred card brings it to the centre.
      card.addEventListener("click", e => {
        const idx = Number(card.dataset.kcIndex);
        const isCta = Boolean(e.target && (
          e.target.closest(".kn-file-arrow, .kn-file-thumb") ||
          (e.target.classList && (e.target.classList.contains("kn-file-arrow") || e.target.classList.contains("kn-file-thumb")))
        ));
        const off = idx - Math.round(this.targetIndex);

        if (!isCta && off !== 0) {
          e.preventDefault();
          e.stopPropagation();
          this.goTo(idx);
          return;
        }

        // CTA clicked or centered card clicked: open the holographic viewer
        const href = (card.getAttribute && card.getAttribute("href")) || (card.querySelector && card.querySelector("a")?.getAttribute("href")) || "";
        const viewer = window.KnockoutSpatialViewer || window.KnockoutViewer;
        if (href && ASSET_HREF_RE.test(href) && viewer && typeof viewer.open === "function") {
          e.preventDefault();
          e.stopPropagation();
          if (off !== 0) {
            this.goTo(idx);
          }
          const items = this._itemsFromCards();
          viewer.open(items[idx] || { url: href, title: card.textContent.trim() }, items, idx);
        } else if (off !== 0) {
          e.preventDefault();
          e.stopPropagation();
          this.goTo(idx);
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

    // A quick neon-tube flicker on the moment a card is first touched by
    // the pointer (hover-in on desktop, tap on touch) — restarted from
    // scratch each time via the remove/reflow/add dance so rapid re-entry
    // (e.g. sweeping across the stack) always replays it.
    const flicker = card => {
      card.classList.remove("kn-neon-flicker");
      // eslint-disable-next-line no-unused-expressions
      card.offsetWidth;
      card.classList.add("kn-neon-flicker");
    };

    let hoveredCard = null;
    this.container.addEventListener("pointerover", e => {
      if (e.pointerType === "touch") return;
      const card = e.target.closest(".kn-carousel-card");
      if (!card || card === hoveredCard) return;
      hoveredCard = card;
      flicker(card);
    }, { passive: true });

    this.container.addEventListener("pointerout", e => {
      const card = e.target.closest(".kn-carousel-card");
      if (card === hoveredCard) hoveredCard = null;
    }, { passive: true });

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
      if (!card) return;
      if (card.dataset.centered === "true") card.classList.add("kc-pressed");
      flicker(card);
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
    const stops = stopsFor();
    const pad = this._topPad || 20;
    let newCentered = null;

    this.cards.forEach((card, i) => {
      const off = i - this.currentIndex;
      const aoff = Math.abs(off);
      const dir = off >= 0 ? 1 : -1;
      const centered = aoff < 0.03;

      // Explicit spatial state, interpolated by offset-from-centre: X/Z/Y/
      // rotateX/rotateY/scale/opacity/blur all come from the same named
      // stop (ACTIVE/NEAR/FAR/OFFSCREEN — see STOPS_DESKTOP), so a card
      // moving between them travels through a real 3D arc, not a flat row
      // with perspective sprinkled on. X and rotateY flip sign for the
      // left/right side; Y (toward the dock) and rotateX (lean) do not —
      // every non-active card leans/lowers the same way regardless of side.
      const d = interpStops(aoff, stops);
      let cx = dir * d.x;
      let cy = d.y;
      let cz = d.tz;
      let crx = d.rx;
      let cry = clamp(-dir * d.ry, -46, 46);
      let cs = d.scale;
      let cop = centered ? 1 : d.op;
      let cbl = d.blur;

      // Deployment blend: before this carousel's section has ever entered
      // the viewport, every card renders as a lerp from the dock pose
      // toward this same real spatial-state target — never a separate
      // visual state, just this pose animated in from below. deployT can
      // briefly exceed 1 (easeOutBack overshoot), the intended spring
      // settle, so it's only clamped for opacity (a >1 opacity is invalid).
      if (!this.deployed) {
        const t = parseFloat(card.dataset.deployT) || 0;
        cx = lerp(0, cx, t);
        cy = lerp(DOCK_POSE.cy, cy, t);
        cz = lerp(DOCK_POSE.cz, cz, t);
        crx = lerp(0, crx, t);
        cry = lerp(DOCK_POSE.cry, cry, t);
        cs = lerp(DOCK_POSE.cs, cs, t);
        cop = lerp(DOCK_POSE.cop, cop, t);
        cbl = lerp(DOCK_POSE.cbl, cbl, t);
      }
      cy += pad;

      card.style.setProperty("--cx", cx.toFixed(1) + "px");
      card.style.setProperty("--cy", cy.toFixed(1) + "px");
      card.style.setProperty("--cz", cz.toFixed(1) + "px");
      card.style.setProperty("--crx", crx.toFixed(1) + "deg");
      card.style.setProperty("--cry", cry.toFixed(1) + "deg");
      card.style.setProperty("--cs", Math.max(0, cs).toFixed(3));
      card.style.setProperty("--cop", clamp(cop, 0, 1).toFixed(3));
      card.style.setProperty("--cbl", Math.max(0, cbl).toFixed(2) + "px");
      card.style.zIndex = String(100 - Math.round(aoff * 10));
      card.dataset.centered = centered ? "true" : "false";
      card.style.pointerEvents = (cop < 0.04 || this._deploying) ? "none" : "";
      if (centered) newCentered = card;
    });

    // A card newly becoming the centred/active one — whether from Prev/
    // Next, a swipe, or a category-tab switch handing this carousel a
    // fresh set of cards — gets a one-shot neon "activate" flash so the
    // hand-off reads as a deliberate spatial event, not a static swap.
    // Gated on this.deployed so the carousel's own initial deploy-in
    // (already its own cinematic moment) never doubles up with this.
    if (!reduceMotion && this.deployed && newCentered && newCentered !== this._lastCenteredCard) {
      newCentered.classList.remove("kn-neon-activate");
      // eslint-disable-next-line no-unused-expressions
      newCentered.offsetWidth; // restart the animation
      newCentered.classList.add("kn-neon-activate");
    }
    this._lastCenteredCard = newCentered;
  };

  Carousel.prototype.tick = function () {
    if (this.destroyed || !this.cards.length) return;
    if (this._deploying) {
      const now = performance.now();
      let allDone = true;
      this.cards.forEach(card => {
        const raw = clamp((now - card._deployStart) / DEPLOY_DURATION_MS, 0, 1);
        card.dataset.deployT = String(easeOutBack(raw));
        if (raw < 1) allDone = false;
      });
      if (allDone) {
        this.deployed = true;
        this._deploying = false;
        if (this._dockEl) this._dockEl.classList.remove("active");
      }
    }
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
    const wasDeployed = this.deployed;
    if (changed) {
      this._build();
      if (wasDeployed) {
        this.deployed = true;
        this.cards.forEach(c => { c.dataset.deployT = "1"; });
      }
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
    "viva": [".grid"]
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
