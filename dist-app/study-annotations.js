/**
 * KNOCKOUTNOTES — Stylus / Pen Handwriting & Annotation Engine (study-annotations.js)
 * Strictly scoped to the Study section (body[data-content-page="study"]).
 *
 * SPECIFICATION & HIGH-FIDELITY EXPERIENCE:
 * 1. Logged-in Users Only: Drawing features are strictly active only when a user is logged in.
 * 2. Hardware Pen vs Finger: S-Pen / Apple Pencil hardware is strictly detected via pointerType.
 *    Fingers always scroll and tap freely without accidental drawing.
 * 3. Silky Smooth Writing: Quadratic Midpoint Spline smoothing and coalesced event processing
 *    for fluid, latency-free ink matching Samsung Notes and OneNote.
 * 4. Smart Straight-Line Highlighter: Constant opacity without dark overlapping splotches,
 *    locking horizontally across text lines for immaculate revision highlighting.
 * 5. S-Pen Barrel Button Eraser: Holding the S-Pen button continuously erases strokes along the
 *    drag path; context menu popup is suppressed. Dedicated Eraser button with tooltip in toolbar.
 * 6. Hover Tooltips: Hovering over tools with S-Pen or mouse reveals descriptive name pills.
 */

(function () {
  "use strict";

  // Check if we are strictly in the study section
  function isStudySection() {
    return document.body && document.body.getAttribute("data-content-page") === "study";
  }

  // Tool Definitions
  const TOOLS = {
    PEN: "pen",
    PENCIL: "pencil",
    HIGHLIGHTER: "highlighter",
    ERASER: "eraser",
    READ: "read"
  };

  const DEFAULT_COLORS = [
    "#0284c7", // Sky blue (matches Ron accent)
    "#ef4444", // Coral red
    "#10b981", // Emerald green
    "#f59e0b", // Amber yellow
    "#8b5cf6", // Purple
    "#0f172a", // Slate black
    "#ec4899", // Rose pink
    "#ffffff"  // Crisp white (for dark mode)
  ];

  // Core State
  let activeTool = TOOLS.PEN;
  let activeColor = DEFAULT_COLORS[0];
  let isDrawingModeActive = false; // true when toolbar is open and drawing is active
  let userDismissedToolbar = false; // true if user explicitly tapped ✕
  let stylusDetected = false;
  let toastShown = false;
  let isDrawing = false;
  let isErasing = false;
  let penActive = false; // Flag for hardware palm rejection while pen touches
  let penActiveTimeout = null;
  let currentStroke = null;
  let strokes = [];
  let undoStack = [];
  let currentTopicId = null;
  let dockSide = "right"; // "right" or "left"
  let highlightStartY = null;

  // DOM Elements
  let canvas = null;
  let ctx = null;
  let toolbar = null;
  let floatChip = null;
  let stageContainer = null;

  /**
   * Check if user is logged in
   */
  function isUserLoggedIn() {
    if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.isLoggedIn === "function") {
      if (window.KN_WORKSPACE.isLoggedIn()) return true;
    }
    try {
      const user = localStorage.getItem("kn_user") || sessionStorage.getItem("kn_user");
      return !!user && user !== "null" && user !== "undefined";
    } catch (_) {
      return false;
    }
  }

  /**
   * Strict Hardware Stylus / Pen Event Detector
   * Never infers pen from touch altitudeAngle (preventing finger false-positives).
   */
  function isStylusEvent(e) {
    if (!e) return false;
    if (e.pointerType === "pen" || e.pointerType === "stylus") return true;
    if (e.touchType === "stylus") return true;
    if (e.touches && e.touches.length > 0) {
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].touchType === "stylus") return true;
      }
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].touchType === "stylus") return true;
      }
    }
    return false;
  }

  /**
   * Check if S-Pen Barrel Button or Eraser Mode is Active
   */
  function isBarrelOrEraser(e) {
    if (activeTool === TOOLS.ERASER) return true;
    if (!e) return false;
    // S-Pen barrel button: button 2 (right click), button 5, or buttons mask 2 or 32
    if (e.button === 2 || e.button === 5) return true;
    if (e.buttons && ((e.buttons & 2) !== 0 || (e.buttons & 32) !== 0)) return true;
    return false;
  }

  /**
   * Get active topic ID across all representations
   */
  function getActiveTopicId() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get("item") || params.get("topic") || params.get("t");
      if (fromParam) return fromParam;
    } catch (_) {}

    if (window.__ACTIVE_STUDY_ITEM && window.__ACTIVE_STUDY_ITEM.id) {
      return window.__ACTIVE_STUDY_ITEM.id;
    }

    const bookmarkBtn = document.querySelector(".kn-monograph-action-bar [data-kn-bookmark-id]");
    if (bookmarkBtn) {
      const rawId = bookmarkBtn.getAttribute("data-kn-bookmark-id") || "";
      const cleaned = rawId.replace(/^study:/, "").trim();
      if (cleaned) return cleaned;
    }

    const titleEl = document.querySelector(".ron-diagnosis-title");
    if (titleEl && titleEl.textContent) {
      return titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    try {
      const catParam = new URLSearchParams(window.location.search).get("cat");
      if (catParam) return "cat_" + catParam;
    } catch (_) {}

    const catTitle = document.querySelector(".ron-title-scoop h1");
    if (catTitle && catTitle.textContent) {
      return "cat_" + catTitle.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    }

    return "study_overview";
  }

  function getStorageKey(topicId) {
    const user = window.KN_WORKSPACE && window.KN_WORKSPACE.getUser ? window.KN_WORKSPACE.getUser() : null;
    const uid = user && (user.id || user.uid || user.email) ? (user.id || user.uid || user.email) : "guest";
    return `kn_annotations_${uid}_${topicId}`;
  }

  function loadStrokes(topicId) {
    if (!topicId || !isUserLoggedIn()) return;
    currentTopicId = topicId;
    strokes = [];
    undoStack = [];

    try {
      const saved = localStorage.getItem(getStorageKey(topicId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          strokes = parsed;
        }
      }
    } catch (e) {
      console.warn("[AnnotationEngine] Failed to load strokes:", e);
    }
    redrawAll();
  }

  function saveStrokes() {
    if (!currentTopicId || !isUserLoggedIn()) return;
    try {
      localStorage.setItem(getStorageKey(currentTopicId), JSON.stringify(strokes));
    } catch (e) {
      console.warn("[AnnotationEngine] Failed to save strokes:", e);
    }
  }

  function getStageContainer() {
    return document.querySelector(".ron-screen") ||
           document.getElementById("ronStudyApp") ||
           document.querySelector(".ron-stage-container") ||
           document.getElementById("stStage") ||
           document.getElementById("stDetail");
  }

  function setupCanvas() {
    if (!isStudySection() || !isUserLoggedIn()) return;

    stageContainer = getStageContainer();
    if (!stageContainer) return;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "kn-annotation-canvas";
      ctx = canvas.getContext("2d", { willReadFrequently: false });
    }

    if (canvas.parentElement !== stageContainer) {
      stageContainer.appendChild(canvas);
    }

    syncCanvasDimensions();
  }

  function syncCanvasDimensions() {
    if (!stageContainer || !canvas || !ctx) return;
    const rect = stageContainer.getBoundingClientRect();
    const width = Math.max(stageContainer.scrollWidth, stageContainer.offsetWidth, rect.width, 320);
    const height = Math.max(stageContainer.scrollHeight, stageContainer.offsetHeight, rect.height, 500);

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);

    if (Math.abs(canvas.width - targetW) > 2 || Math.abs(canvas.height - targetH) > 2) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll();
    }
  }

  function showStylusDetectedToast() {
    if (!isUserLoggedIn()) return;
    if (document.getElementById("knStylusToast")) return;
    const toast = document.createElement("div");
    toast.className = "kn-stylus-toast";
    toast.id = "knStylusToast";
    toast.innerHTML = `<span>✏️</span><span>Stylus Detected — S Pen / Apple Pencil Active</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 3200);
  }

  function getCanvasCoords(e) {
    if (!canvas) return { x: 0, y: 0, pressure: 0.5 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
    const pressure = (e.pressure !== undefined && e.pressure > 0) ? e.pressure : 0.5;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      pressure: Math.min(Math.max(pressure, 0.15), 1.0)
    };
  }

  /**
   * Internal Drawing & Erasing Handlers
   */
  function onPointerDown(e) {
    if (!isUserLoggedIn()) return;
    if (!activeTool || activeTool === TOOLS.READ) return;

    const pt = getCanvasCoords(e);

    // S-Pen Barrel button or Eraser tool
    if (isBarrelOrEraser(e)) {
      isErasing = true;
      isDrawing = false;
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    isErasing = false;
    isDrawing = true;

    // Straight-line highlighter initial baseline
    if (activeTool === TOOLS.HIGHLIGHTER) {
      highlightStartY = pt.y;
    } else {
      highlightStartY = null;
    }

    currentStroke = {
      tool: activeTool,
      color: activeColor,
      points: [pt]
    };

    // Render initial dot
    renderStrokeSegment(currentStroke, 0, 0);
  }

  function onPointerMove(e) {
    if (!isUserLoggedIn()) return;

    const pt = getCanvasCoords(e);

    // Dynamic S-Pen button press during motion switches to eraser
    if (isBarrelOrEraser(e)) {
      isErasing = true;
      if (isDrawing) {
        isDrawing = false;
        currentStroke = null;
      }
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    if (isErasing) {
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    if (!isDrawing || !currentStroke) return;

    // Straight-line lock for Highlighter (Samsung Notes style)
    if (currentStroke.tool === TOOLS.HIGHLIGHTER && highlightStartY !== null) {
      const dy = Math.abs(pt.y - highlightStartY);
      // Lock horizontally if within 26px vertical range of the initial text line
      if (dy < 26) {
        pt.y = highlightStartY;
      }
    }

    currentStroke.points.push(pt);
    const len = currentStroke.points.length;

    if (currentStroke.tool === TOOLS.HIGHLIGHTER) {
      // Re-render whole highlighter stroke to avoid alpha stacking
      redrawAll();
      renderHighlighterStroke(currentStroke);
    } else {
      // Render smooth spline segment incrementally
      renderStrokeSegment(currentStroke, len - 2, len - 1);
    }
  }

  function onPointerUp(e) {
    if (isErasing) {
      isErasing = false;
      return;
    }

    if (!isDrawing) return;
    isDrawing = false;

    if (currentStroke && currentStroke.points.length > 0) {
      strokes.push(currentStroke);
      undoStack = [];
      saveStrokes();
      currentStroke = null;
      redrawAll();
    }
    highlightStartY = null;
  }

  /**
   * Quadratic Midpoint Spline Rendering (Silky Smooth Samsung Notes / OneNote style)
   */
  function renderStrokeSegment(stroke, startIndex, endIndex) {
    if (!ctx || !stroke.points || stroke.points.length === 0) return;
    const pts = stroke.points;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (pts.length === 1 || startIndex === endIndex) {
      // Single tap circular dot
      const p = pts[0];
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = stroke.tool === TOOLS.PENCIL ? 0.7 : 0.96;
      const radius = stroke.tool === TOOLS.PENCIL ? (1.2 + p.pressure * 1.5) : (1.8 + p.pressure * 2.8);
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const p1 = pts[startIndex];
    const p2 = pts[endIndex];

    if (stroke.tool === TOOLS.PENCIL) {
      ctx.globalAlpha = 0.72;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.2 + p2.pressure * 2.0;
    } else {
      // Ballpoint Pen with dynamic pressure smoothing
      ctx.globalAlpha = 0.98;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.6 + p2.pressure * 3.2;
    }

    if (pts.length === 2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else {
      // Midpoint curve interpolation
      const prev = pts[startIndex - 1] || p1;
      const mid1 = { x: (prev.x + p1.x) / 2, y: (prev.y + p1.y) / 2 };
      const mid2 = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

      ctx.beginPath();
      ctx.moveTo(mid1.x, mid1.y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2.x, mid2.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Straight-Line Uniform Highlighter (Single Path, zero splotches)
   */
  function renderHighlighterStroke(stroke) {
    if (!ctx || !stroke.points || stroke.points.length < 2) return;
    const pts = stroke.points;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "square";
    ctx.lineJoin = "bevel";
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = 22;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Redraw All Strokes
   */
  function redrawAll() {
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.tool === TOOLS.HIGHLIGHTER) {
        renderHighlighterStroke(s);
      } else {
        if (s.points.length === 1) {
          renderStrokeSegment(s, 0, 0);
        } else {
          for (let j = 0; j < s.points.length - 1; j++) {
            renderStrokeSegment(s, j, j + 1);
          }
        }
      }
    }
  }

  /**
   * Continuous Stroke-Level Eraser
   */
  function eraseAtPoint(x, y) {
    const radius = 32;
    const originalLength = strokes.length;

    strokes = strokes.filter((stroke) => {
      return !stroke.points.some((p) => {
        const dx = p.x - x;
        const dy = p.y - y;
        return dx * dx + dy * dy <= radius * radius;
      });
    });

    if (strokes.length !== originalLength) {
      redrawAll();
      saveStrokes();
    }
  }

  function undo() {
    if (strokes.length === 0) return;
    const popped = strokes.pop();
    undoStack.push(popped);
    redrawAll();
    saveStrokes();
  }

  function redo() {
    if (undoStack.length === 0) return;
    const stroke = undoStack.pop();
    strokes.push(stroke);
    redrawAll();
    saveStrokes();
  }

  function clearAll() {
    if (strokes.length === 0) return;
    if (confirm("Clear all handwriting annotations on this topic?")) {
      undoStack = [...strokes];
      strokes = [];
      redrawAll();
      saveStrokes();
    }
  }

  function isToolbarElement(target) {
    if (!target) return false;
    return !!(target.closest && target.closest("#knPenToolbar, #knPalettePopover, #knPenFloatChip"));
  }

  /**
   * Pointer Interceptor System
   * - Blocks Android contextmenu when S-Pen button is held.
   * - Uses pointer capture on canvas to prevent Android Chrome from dropping pen frames.
   * - Never intercepts finger touch unless palm rejection is shielding an active stylus stroke.
   */
  function setupPointerInterceptors() {
    // Suppress context menu for S-Pen barrel button
    document.addEventListener("contextmenu", (e) => {
      if (isStylusEvent(e) || penActive || isBarrelOrEraser(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { capture: true });

    // 1. POINTERDOWN (Capture Phase)
    document.addEventListener("pointerdown", (e) => {
      if (!isStudySection() || !isUserLoggedIn()) return;
      if (isToolbarElement(e.target)) return;

      const isStylus = isStylusEvent(e);

      if (isStylus) {
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
        }

        penActive = true;
        if (penActiveTimeout) clearTimeout(penActiveTimeout);

        if (!isDrawingModeActive && !userDismissedToolbar) {
          showToolbar();
        }

        if (isDrawingModeActive) {
          if (activeTool && activeTool !== TOOLS.READ) {
            e.preventDefault();
            e.stopPropagation();
            setupCanvas();

            // Lock pointer capture to canvas to prevent browser from cancelling stroke
            try {
              if (canvas && typeof canvas.setPointerCapture === "function") {
                canvas.setPointerCapture(e.pointerId);
              }
            } catch (_) {}

            onPointerDown(e);
          }
        }
      } else if (e.pointerType === "touch") {
        // Finger Touch:
        if (isDrawingModeActive && penActive) {
          // Palm Rejection: reject finger touch ONLY when pen is actively writing!
          e.preventDefault();
          e.stopPropagation();
        }
        // When penActive is false, fingers scroll and tap topic cards freely!
      } else if (e.pointerType === "mouse") {
        if (isDrawingModeActive && activeTool && activeTool !== TOOLS.READ) {
          if (!isToolbarElement(e.target)) {
            setupCanvas();
            onPointerDown(e);
          }
        }
      }
    }, { capture: true, passive: false });

    // 2. POINTERMOVE (Capture Phase)
    document.addEventListener("pointermove", (e) => {
      if (!isStudySection() || !isUserLoggedIn()) return;

      const isStylus = isStylusEvent(e);

      // S-Pen Hover detection (~1.5cm above screen)
      if (isStylus && !isDrawing && !isErasing) {
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
        }
        if (!isDrawingModeActive && !userDismissedToolbar) {
          showToolbar();
        }
      }

      if (isDrawing || isErasing) {
        if (isStylus || e.pointerType === "mouse") {
          e.preventDefault();
          e.stopPropagation();

          // High-refresh rate coalesced events (120Hz/240Hz sampling on Galaxy S26 Ultra)
          const events = (e.getCoalescedEvents && e.getCoalescedEvents().length > 0)
            ? e.getCoalescedEvents()
            : [e];

          for (let i = 0; i < events.length; i++) {
            onPointerMove(events[i]);
          }
        }
      }
    }, { capture: true, passive: false });

    // 3. POINTERUP & POINTERCANCEL (Capture Phase)
    const handlePointerEnd = (e) => {
      if (!isStudySection() || !isUserLoggedIn()) return;

      if (isDrawing || isErasing) {
        e.preventDefault();
        onPointerUp(e);
      }

      try {
        if (canvas && typeof canvas.releasePointerCapture === "function") {
          canvas.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      if (isStylusEvent(e)) {
        if (penActiveTimeout) clearTimeout(penActiveTimeout);
        penActiveTimeout = setTimeout(() => {
          penActive = false;
        }, 320);
      }
    };

    document.addEventListener("pointerup", handlePointerEnd, { capture: true, passive: false });
    document.addEventListener("pointercancel", handlePointerEnd, { capture: true, passive: false });
  }

  /**
   * Floating Toolbar with Tooltips on Hover
   */
  function renderToolbar() {
    if (!isStudySection() || !isUserLoggedIn()) return;
    if (toolbar && toolbar.parentElement) toolbar.remove();

    toolbar = document.createElement("div");
    toolbar.className = `kn-pen-toolbar dock-${dockSide} kn-hidden`;
    toolbar.id = "knPenToolbar";

    toolbar.innerHTML = `
      <button type="button" class="kn-tool-btn active" data-tool="pen" data-tooltip="Ballpoint Pen" title="Ballpoint Pen" aria-label="Ballpoint Pen">
        ✏️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="pencil" data-tooltip="Fine Pencil" title="Fine Pencil" aria-label="Fine Pencil">
        🖊️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="highlighter" data-tooltip="Straight Highlighter" title="Straight Highlighter" aria-label="Highlighter">
        🖍️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="eraser" data-tooltip="Stroke Eraser" title="Stroke Eraser (or hold S-Pen button)" aria-label="Eraser">
        🧼
      </button>
      <button type="button" class="kn-tool-btn" data-tool="read" data-tooltip="Scroll / Read Mode" title="Scroll &amp; Read Mode (Finger Navigation)" aria-label="Read Mode">
        🖐️
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Color Swatch Button -->
      <button type="button" class="kn-tool-btn" id="knColorPickerBtn" data-tooltip="Ink Palette" title="Choose Ink Color" aria-label="Palette" style="color:${activeColor}">
        🎨
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Undo / Redo -->
      <button type="button" class="kn-tool-btn" id="knUndoBtn" data-tooltip="Undo Stroke" title="Undo Stroke" aria-label="Undo">
        ↩️
      </button>
      <button type="button" class="kn-tool-btn" id="knRedoBtn" data-tooltip="Redo Stroke" title="Redo Stroke" aria-label="Redo">
        ↪️
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Clear All -->
      <button type="button" class="kn-tool-btn" id="knClearAllBtn" data-tooltip="Clear Annotations" title="Clear All Annotations" aria-label="Clear All">
        🗑️
      </button>

      <!-- Left / Right Dock Switcher -->
      <button type="button" class="kn-tool-btn kn-dock-switch-btn" id="knDockSwitchBtn" data-tooltip="Switch Side" title="Switch Side (Left / Right)" aria-label="Switch Side">
        ⇄
      </button>

      <!-- Dismiss Toolbar -->
      <button type="button" class="kn-tool-btn" id="knDismissToolbarBtn" data-tooltip="Close (Enable Scrolling)" title="Close Toolbar &amp; Enable Stylus Scrolling (✕)" aria-label="Hide">
        ✕
      </button>
    `;

    document.body.appendChild(toolbar);
    attachToolbarEvents();
  }

  function renderFloatingChip() {
    if (!isStudySection() || !isUserLoggedIn()) return;
    if (floatChip && floatChip.parentElement) floatChip.remove();

    floatChip = document.createElement("button");
    floatChip.type = "button";
    floatChip.className = `kn-pen-float-chip dock-${dockSide} kn-hidden`;
    floatChip.id = "knPenFloatChip";
    floatChip.title = "Re-open Stylus Drawing Tools";
    floatChip.setAttribute("aria-label", "Open Stylus Tools");
    floatChip.setAttribute("data-tooltip", "Open Drawing Tools");
    floatChip.innerHTML = "✏️";

    floatChip.addEventListener("click", () => {
      userDismissedToolbar = false;
      showToolbar();
    });

    document.body.appendChild(floatChip);
  }

  function showFloatingChip() {
    if (!isUserLoggedIn()) return;
    if (!floatChip) renderFloatingChip();
    if (floatChip) {
      floatChip.classList.remove("kn-hidden");
    }
  }

  function hideFloatingChip() {
    if (floatChip) {
      floatChip.classList.add("kn-hidden");
    }
  }

  function showToolbar() {
    if (!isUserLoggedIn()) {
      if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.openAuthModal === "function") {
        window.KN_WORKSPACE.openAuthModal();
      } else {
        alert("Please sign in to your KnockoutNotes account to use stylus annotations.");
      }
      return;
    }

    setupCanvas();
    if (!toolbar) renderToolbar();
    if (!floatChip) renderFloatingChip();

    userDismissedToolbar = false;
    isDrawingModeActive = true;

    if (toolbar) {
      toolbar.classList.remove("kn-hidden");
    }
    hideFloatingChip();

    if (!activeTool || activeTool === TOOLS.READ) {
      setTool(TOOLS.PEN);
    }
  }

  function hideToolbar() {
    userDismissedToolbar = true;
    isDrawingModeActive = false;
    isDrawing = false;
    isErasing = false;
    activeTool = null;

    if (toolbar) {
      toolbar.classList.add("kn-hidden");
    }
    if (canvas) {
      canvas.classList.remove("active-mode");
    }

    if (isUserLoggedIn()) {
      showFloatingChip();
    }
  }

  function attachToolbarEvents() {
    if (!toolbar) return;

    toolbar.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tool = btn.getAttribute("data-tool");
        if (tool === "read") {
          setTool(TOOLS.READ);
        } else if (activeTool === tool) {
          setTool(TOOLS.READ);
        } else {
          setTool(tool);
        }
      });
    });

    toolbar.querySelector("#knUndoBtn")?.addEventListener("click", undo);
    toolbar.querySelector("#knRedoBtn")?.addEventListener("click", redo);
    toolbar.querySelector("#knClearAllBtn")?.addEventListener("click", clearAll);

    const switchBtn = toolbar.querySelector("#knDockSwitchBtn");
    if (switchBtn) {
      switchBtn.addEventListener("click", () => {
        if (dockSide === "right") {
          dockSide = "left";
          toolbar.classList.remove("dock-right");
          toolbar.classList.add("dock-left");
          if (floatChip) {
            floatChip.classList.remove("dock-right");
            floatChip.classList.add("dock-left");
          }
        } else {
          dockSide = "right";
          toolbar.classList.remove("dock-left");
          toolbar.classList.add("dock-right");
          if (floatChip) {
            floatChip.classList.remove("dock-left");
            floatChip.classList.add("dock-right");
          }
        }
      });
    }

    const dismissBtn = toolbar.querySelector("#knDismissToolbarBtn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", hideToolbar);
    }

    const colorBtn = toolbar.querySelector("#knColorPickerBtn");
    if (colorBtn) {
      colorBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleColorPalette(colorBtn);
      });
    }
  }

  function setTool(tool) {
    activeTool = tool === TOOLS.READ ? null : tool;
    if (toolbar) {
      toolbar.querySelectorAll("[data-tool]").forEach((btn) => {
        const btnTool = btn.getAttribute("data-tool");
        if ((tool === TOOLS.READ && btnTool === "read") || (activeTool && btnTool === activeTool)) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }
  }

  function toggleColorPalette(anchor) {
    let popover = document.getElementById("knPalettePopover");
    if (popover) {
      popover.remove();
      return;
    }

    popover = document.createElement("div");
    popover.className = "kn-palette-popover";
    popover.id = "knPalettePopover";

    popover.innerHTML = DEFAULT_COLORS.map(
      (c) => `
      <div class="kn-color-swatch ${c === activeColor ? "selected" : ""}" style="background: ${c}" data-color="${c}"></div>
    `
    ).join("");

    const rect = anchor.getBoundingClientRect();
    if (dockSide === "right") {
      popover.style.right = (window.innerWidth - rect.left + 12) + "px";
      popover.style.top = Math.max(12, rect.top - 30) + "px";
    } else {
      popover.style.left = (rect.right + 12) + "px";
      popover.style.top = Math.max(12, rect.top - 30) + "px";
    }

    popover.querySelectorAll(".kn-color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        activeColor = swatch.getAttribute("data-color");
        anchor.style.color = activeColor;
        popover.remove();
      });
    });

    document.body.appendChild(popover);

    setTimeout(() => {
      const closeHandler = (e) => {
        if (!popover.contains(e.target) && e.target !== anchor) {
          popover.remove();
          document.removeEventListener("pointerdown", closeHandler);
        }
      };
      document.addEventListener("pointerdown", closeHandler);
    }, 50);
  }

  function cleanupLoggedOutState() {
    if (toolbar && toolbar.parentElement) toolbar.remove();
    if (floatChip && floatChip.parentElement) floatChip.remove();
    if (canvas && canvas.parentElement) canvas.remove();
    toolbar = null;
    floatChip = null;
    canvas = null;
    ctx = null;
    isDrawingModeActive = false;
    isDrawing = false;
    isErasing = false;
    stylusDetected = false;
  }

  function monitorStudyNavigation() {
    if (!isStudySection()) return;

    let lastTopic = null;

    const syncTopic = () => {
      if (!isStudySection()) {
        cleanupLoggedOutState();
        return;
      }

      if (!isUserLoggedIn()) {
        cleanupLoggedOutState();
        return;
      }

      const topicId = getActiveTopicId();
      if (topicId !== lastTopic) {
        lastTopic = topicId;
        if (isDrawingModeActive) {
          setupCanvas();
          loadStrokes(topicId);
        }
      }
    };

    window.addEventListener("popstate", syncTopic);
    window.addEventListener("kn:study-topic-loaded", syncTopic);
    window.addEventListener("kn:auth-changed", () => {
      if (isUserLoggedIn()) {
        syncTopic();
      } else {
        cleanupLoggedOutState();
      }
    });
    window.addEventListener("resize", () => {
      if (isDrawingModeActive) syncCanvasDimensions();
    }, { passive: true });
  }

  // Export module globally
  window.KN_ANNOTATIONS = {
    init: monitorStudyNavigation,
    showToolbar,
    hideToolbar,
    setTool,
    undo,
    redo,
    clearAll,
    loadStrokes,
    setupCanvas,
    isDrawingModeActive: () => isDrawingModeActive
  };

  // Boot listeners
  setupPointerInterceptors();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      monitorStudyNavigation();
    });
  } else {
    monitorStudyNavigation();
  }
})();
