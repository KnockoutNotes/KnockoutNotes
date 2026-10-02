/**
 * KNOCKOUTNOTES — Stylus / Pen Handwriting & Annotation Engine (study-annotations.js)
 * Strictly scoped to the Study section (body[data-content-page="study"]).
 *
 * SPECIFICATION & USER BEHAVIOR:
 * 1. Automatic Stylus Detection: The moment a stylus (Samsung S Pen, Apple Pencil,
 *    Surface Pen, or standard active stylus) is detected via hover or touch,
 *    the floating annotation toolbar appears immediately at the screen edge.
 * 2. Drawing Mode Active: Touching with stylus DRAWS on the screen with pressure
 *    dynamics. Normal touch like kinetic scrolling is OFF for the stylus.
 *    Fingers can still scroll the page, with palm rejection shielding stray touches
 *    while the stylus is writing.
 * 3. Drawing Mode Closed: When the user dismisses the floating window (via ✕),
 *    normal touch with stylus is ON. The stylus behaves like a standard finger
 *    (scrolling the webpage, tapping links, etc.). A sleek floating pen chip (✏️)
 *    remains available at the edge to re-open drawing mode with one tap.
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
  let penActive = false; // Flag for hardware palm rejection while pen touches
  let penActiveTimeout = null;
  let currentStroke = null;
  let strokes = [];
  let undoStack = [];
  let currentTopicId = null;
  let dockSide = "right"; // "right" or "left"

  // DOM Elements
  let canvas = null;
  let ctx = null;
  let toolbar = null;
  let floatChip = null;
  let stageContainer = null;
  let resizeObserver = null;
  let mutationObserver = null;

  /**
   * Robust Stylus / Pen Event Detector
   * Covers Samsung S-Pen (Android Chrome/Samsung Internet), Apple Pencil (iPadOS Safari),
   * Windows Ink, and standard Pointer Events Level 2/3.
   */
  function isStylusEvent(e) {
    if (!e) return false;
    if (e.pointerType === "pen" || e.pointerType === "stylus") return true;
    if (e.touchType === "stylus") return true;
    if (e.altitudeAngle !== undefined && e.altitudeAngle > 0) return true;
    if (e.touches && e.touches.length > 0) {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.touchType === "stylus" || (t.altitudeAngle !== undefined && t.altitudeAngle > 0)) {
          return true;
        }
      }
    }
    if (e.changedTouches && e.changedTouches.length > 0) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.touchType === "stylus" || (t.altitudeAngle !== undefined && t.altitudeAngle > 0)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if user is logged in
   */
  function isUserLoggedIn() {
    if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.isLoggedIn === "function") {
      if (window.KN_WORKSPACE.isLoggedIn()) return true;
    }
    try {
      const user = localStorage.getItem("kn_user");
      return !!user && user !== "null" && user !== "undefined";
    } catch (_) {
      return false;
    }
  }

  /**
   * Get active topic ID across all URL and DOM representations
   * Always returns a valid string (never null) so annotations can always be persisted.
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

  /**
   * Storage Key for Topic Annotations
   */
  function getStorageKey(topicId) {
    const user = window.KN_WORKSPACE && window.KN_WORKSPACE.getUser ? window.KN_WORKSPACE.getUser() : null;
    const uid = user && (user.id || user.uid || user.email) ? (user.id || user.uid || user.email) : "guest";
    return `kn_annotations_${uid}_${topicId}`;
  }

  /**
   * Load strokes for active topic
   */
  function loadStrokes(topicId) {
    if (!topicId) return;
    currentTopicId = topicId;
    strokes = [];
    undoStack = [];

    try {
      let saved = localStorage.getItem(getStorageKey(topicId));
      if (!saved && isUserLoggedIn()) {
        saved = localStorage.getItem(`kn_annotations_guest_${topicId}`);
      }
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

  /**
   * Persist strokes
   */
  function saveStrokes() {
    if (!currentTopicId) return;
    try {
      localStorage.setItem(getStorageKey(currentTopicId), JSON.stringify(strokes));
    } catch (e) {
      console.warn("[AnnotationEngine] Failed to save strokes:", e);
    }
  }

  /**
   * Get the primary study container to mount canvas over
   */
  function getStageContainer() {
    return document.querySelector(".ron-screen") ||
           document.getElementById("ronStudyApp") ||
           document.querySelector(".ron-stage-container") ||
           document.getElementById("stStage") ||
           document.getElementById("stDetail");
  }

  /**
   * Initialize or attach the annotation canvas over the full study stage
   */
  function setupCanvas() {
    if (!isStudySection()) return;

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

    if (!resizeObserver && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        syncCanvasDimensions();
      });
      resizeObserver.observe(stageContainer);
    }

    if (!mutationObserver && window.MutationObserver) {
      mutationObserver = new MutationObserver(() => {
        if (canvas && canvas.parentElement !== stageContainer && stageContainer) {
          stageContainer.appendChild(canvas);
        }
        syncCanvasDimensions();
      });
      mutationObserver.observe(stageContainer, { childList: true, subtree: true });
    }
  }

  /**
   * Resize canvas matching the container with high-DPI scaling
   */
  function syncCanvasDimensions() {
    if (!stageContainer || !canvas || !ctx) return;
    const rect = stageContainer.getBoundingClientRect();
    const width = Math.max(stageContainer.scrollWidth, stageContainer.offsetWidth, rect.width, 320);
    const height = Math.max(stageContainer.scrollHeight, stageContainer.offsetHeight, rect.height, 500);

    const dpr = window.devicePixelRatio || 1;
    const targetW = Math.round(width * dpr);
    const targetH = Math.round(height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      redrawAll();
    }
  }

  /**
   * Notification toast when stylus is detected
   */
  function showStylusDetectedToast() {
    if (document.getElementById("knStylusToast")) return;
    const toast = document.createElement("div");
    toast.className = "kn-stylus-toast";
    toast.id = "knStylusToast";
    toast.innerHTML = `<span>✏️</span><span>Stylus Detected — S Pen / Apple Pencil Active</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 3400);
  }

  /**
   * Convert Pointer/Touch event client coordinates to canvas-space coordinates
   */
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
   * Internal drawing stroke handlers
   */
  function onPointerDown(e) {
    if (!activeTool || activeTool === TOOLS.READ) return;

    let toolToUse = activeTool;
    // S Pen barrel button shortcut toggles eraser
    if (e.button === 5 || e.buttons === 32 || (e.buttons & 2)) {
      toolToUse = TOOLS.ERASER;
    }

    isDrawing = true;
    const pt = getCanvasCoords(e);

    if (toolToUse === TOOLS.ERASER) {
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    currentStroke = {
      tool: toolToUse,
      color: activeColor,
      points: [pt]
    };

    // Draw immediate initial dot
    drawSegment(currentStroke, 0, 0);
  }

  function onPointerMove(e) {
    if (!isDrawing) return;

    const pt = getCanvasCoords(e);

    if (activeTool === TOOLS.ERASER || e.button === 5 || e.buttons === 32 || (e.buttons & 2)) {
      eraseAtPoint(pt.x, pt.y);
      return;
    }

    if (!currentStroke) return;
    currentStroke.points.push(pt);

    // Render segment incrementally
    drawSegment(currentStroke, currentStroke.points.length - 2, currentStroke.points.length - 1);
  }

  function onPointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentStroke && currentStroke.points.length > 0) {
      strokes.push(currentStroke);
      undoStack = [];
      saveStrokes();
      currentStroke = null;
    }
  }

  /**
   * Segment rendering with pressure and tool dynamics
   */
  function drawSegment(stroke, startIndex, endIndex) {
    if (!ctx || !stroke.points || stroke.points.length === 0) return;
    const p1 = stroke.points[startIndex];
    const p2 = stroke.points[endIndex] || p1;

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (startIndex === endIndex || stroke.points.length === 1) {
      // Single tap dot
      ctx.fillStyle = stroke.color;
      ctx.globalAlpha = stroke.tool === TOOLS.HIGHLIGHTER ? 0.35 : 0.95;
      const radius = stroke.tool === TOOLS.HIGHLIGHTER ? 12 : (1.6 + p1.pressure * 2.5);
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    if (stroke.tool === TOOLS.HIGHLIGHTER) {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else if (stroke.tool === TOOLS.PENCIL) {
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.2 + p2.pressure * 2.2;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else {
      // Default Ballpoint Pen with smooth pressure dynamics
      ctx.globalAlpha = 0.96;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.6 + p2.pressure * 3.4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Redraw all strokes on canvas with high-DPI transform preservation
   */
  function redrawAll() {
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.points.length === 1) {
        drawSegment(s, 0, 0);
      } else {
        for (let j = 0; j < s.points.length - 1; j++) {
          drawSegment(s, j, j + 1);
        }
      }
    }
  }

  /**
   * Stroke-level Eraser
   */
  function eraseAtPoint(x, y) {
    const radius = 26;
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

  /**
   * Undo/Redo
   */
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

  /**
   * Clear all annotations on this topic
   */
  function clearAll() {
    if (strokes.length === 0) return;
    if (confirm("Clear all handwriting annotations on this topic?")) {
      undoStack = [...strokes];
      strokes = [];
      redrawAll();
      saveStrokes();
    }
  }

  /**
   * Check if an event target belongs to toolbar or popovers
   */
  function isToolbarElement(target) {
    if (!target) return false;
    return !!(target.closest && target.closest("#knPenToolbar, #knPalettePopover, #knPenFloatChip"));
  }

  /**
   * MASTER GLOBAL POINTER INTERCEPTOR (Capture Phase)
   * Controls when normal touch like scrolling is on or off for stylus.
   */
  function setupPointerInterceptors() {
    // 1. POINTERDOWN (Capture Phase, passive: false)
    document.addEventListener("pointerdown", (e) => {
      if (!isStudySection()) return;

      // Never intercept interactions with toolbar controls or floating chip
      if (isToolbarElement(e.target)) return;

      const isStylus = isStylusEvent(e);

      if (isStylus) {
        // Detect Stylus
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
        }

        // Maintain palm rejection shield while stylus is touching
        penActive = true;
        if (penActiveTimeout) clearTimeout(penActiveTimeout);

        // Auto-reveal toolbar if not explicitly dismissed by user
        if (!isDrawingModeActive && !userDismissedToolbar) {
          showToolbar();
        }

        // When Drawing Mode is OPEN: Normal touch with stylus like scrolling is OFF
        if (isDrawingModeActive) {
          if (activeTool && activeTool !== TOOLS.READ) {
            e.preventDefault();
            e.stopPropagation();
            setupCanvas();
            onPointerDown(e);
          }
        }
        // When Drawing Mode is CLOSED: Stylus acts as normal touch (scrolling is ON, not prevented)
      } else if (e.pointerType === "touch") {
        // Finger Touch:
        if (isDrawingModeActive && penActive) {
          // Palm Rejection: palm is resting on the glass while stylus writes
          e.preventDefault();
          e.stopPropagation();
        }
        // When penActive is false, fingers scroll the page smoothly without interception
      } else if (e.pointerType === "mouse") {
        if (isDrawingModeActive && activeTool && activeTool !== TOOLS.READ) {
          // Desktop testing / mouse drawing support
          if (!isToolbarElement(e.target)) {
            setupCanvas();
            onPointerDown(e);
          }
        }
      }
    }, { capture: true, passive: false });

    // 2. POINTERMOVE (Capture Phase, passive: false)
    document.addEventListener("pointermove", (e) => {
      if (!isStudySection()) return;

      const isStylus = isStylusEvent(e);

      if (isStylus && !isDrawing) {
        // S Pen Hover detection (S Pen emits pointermove while hovering ~1.5cm above screen)
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
          if (!isDrawingModeActive && !userDismissedToolbar) {
            showToolbar();
          }
        }
      }

      if (isDrawing) {
        if (isStylus || e.pointerType === "mouse") {
          e.preventDefault();
          e.stopPropagation();
          onPointerMove(e);
        }
      }
    }, { capture: true, passive: false });

    // 3. POINTERUP & POINTERCANCEL (Capture Phase, passive: false)
    const handlePointerEnd = (e) => {
      if (!isStudySection()) return;

      if (isDrawing) {
        e.preventDefault();
        onPointerUp(e);
      }

      if (isStylusEvent(e)) {
        // Keep palm rejection active for 350ms after lifting pen
        if (penActiveTimeout) clearTimeout(penActiveTimeout);
        penActiveTimeout = setTimeout(() => {
          penActive = false;
        }, 350);
      }
    };

    document.addEventListener("pointerup", handlePointerEnd, { capture: true, passive: false });
    document.addEventListener("pointercancel", handlePointerEnd, { capture: true, passive: false });

    // Additional hover/touch triggers for legacy devices
    ["pointerenter", "pointerover"].forEach((evt) => {
      document.addEventListener(evt, (e) => {
        if (isStudySection() && isStylusEvent(e)) {
          if (!stylusDetected) {
            stylusDetected = true;
            if (!toastShown) {
              toastShown = true;
              showStylusDetectedToast();
            }
            if (!isDrawingModeActive && !userDismissedToolbar) {
              showToolbar();
            }
          }
        }
      }, { capture: true, passive: true });
    });

    document.addEventListener("touchstart", (e) => {
      if (isStudySection() && isStylusEvent(e)) {
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
          if (!isDrawingModeActive && !userDismissedToolbar) {
            showToolbar();
          }
        }
      }
    }, { capture: true, passive: true });
  }

  /**
   * Create Floating Vertical Toolbar on Left or Right
   */
  function renderToolbar() {
    if (!isStudySection()) return;
    if (toolbar && toolbar.parentElement) toolbar.remove();

    toolbar = document.createElement("div");
    toolbar.className = `kn-pen-toolbar dock-${dockSide} kn-hidden`;
    toolbar.id = "knPenToolbar";

    toolbar.innerHTML = `
      <button type="button" class="kn-tool-btn active" data-tool="pen" title="Ballpoint Pen (S Pen / Apple Pencil)" aria-label="Pen">
        ✏️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="pencil" title="Pencil" aria-label="Pencil">
        🖊️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="highlighter" title="Highlighter" aria-label="Highlighter">
        🖍️
      </button>
      <button type="button" class="kn-tool-btn" data-tool="eraser" title="Eraser" aria-label="Eraser">
        🧹
      </button>
      <button type="button" class="kn-tool-btn" data-tool="read" title="Scroll &amp; Read Mode (Finger Navigation)" aria-label="Read Mode">
        🖐️
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Color Swatch Button -->
      <button type="button" class="kn-tool-btn" id="knColorPickerBtn" title="Choose Ink Color" aria-label="Palette" style="color:${activeColor}">
        🎨
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Undo / Redo -->
      <button type="button" class="kn-tool-btn" id="knUndoBtn" title="Undo Stroke" aria-label="Undo">
        ↩️
      </button>
      <button type="button" class="kn-tool-btn" id="knRedoBtn" title="Redo Stroke" aria-label="Redo">
        ↪️
      </button>

      <div class="kn-pen-divider"></div>

      <!-- Clear All -->
      <button type="button" class="kn-tool-btn" id="knClearAllBtn" title="Clear All Annotations" aria-label="Clear All">
        🗑️
      </button>

      <!-- Left / Right Dock Switcher -->
      <button type="button" class="kn-tool-btn kn-dock-switch-btn" id="knDockSwitchBtn" title="Switch Side (Left / Right)" aria-label="Switch Side">
        ⇄
      </button>

      <!-- Dismiss Toolbar -->
      <button type="button" class="kn-tool-btn" id="knDismissToolbarBtn" title="Hide Toolbar &amp; Enable Stylus Scrolling (✕)" aria-label="Hide">
        ✕
      </button>
    `;

    document.body.appendChild(toolbar);
    attachToolbarEvents();
  }

  /**
   * Floating Chip to Re-open Toolbar when closed
   */
  function renderFloatingChip() {
    if (!isStudySection()) return;
    if (floatChip && floatChip.parentElement) floatChip.remove();

    floatChip = document.createElement("button");
    floatChip.type = "button";
    floatChip.className = `kn-pen-float-chip dock-${dockSide} kn-hidden`;
    floatChip.id = "knPenFloatChip";
    floatChip.title = "Re-open Stylus Drawing Tools";
    floatChip.setAttribute("aria-label", "Open Stylus Tools");
    floatChip.innerHTML = "✏️";

    floatChip.addEventListener("click", () => {
      userDismissedToolbar = false;
      showToolbar();
    });

    document.body.appendChild(floatChip);
  }

  function showFloatingChip() {
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

  /**
   * Reveal Toolbar and Activate Drawing Mode
   * Normal touch with stylus is now OFF (stylus draws).
   */
  function showToolbar() {
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

  /**
   * Hide Toolbar and Deactivate Drawing Mode
   * Normal touch with stylus like scrolling is now ON!
   */
  function hideToolbar() {
    userDismissedToolbar = true;
    isDrawingModeActive = false;
    isDrawing = false;
    activeTool = null;

    if (toolbar) {
      toolbar.classList.add("kn-hidden");
    }
    if (canvas) {
      canvas.classList.remove("active-mode");
    }

    // Display re-open chip so user can bring drawing tools back anytime
    showFloatingChip();
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

    // Switch between left and right side dock
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

    // Dismiss toolbar (Closes drawing mode, enables normal stylus scrolling)
    const dismissBtn = toolbar.querySelector("#knDismissToolbarBtn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", hideToolbar);
    }

    // Color picker
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

  /**
   * Monitor Study Mode Navigation & Topic Changes
   * Ensures canvas is always mounted and strokes are properly associated.
   * NEVER hides the toolbar automatically.
   */
  function monitorStudyNavigation() {
    if (!isStudySection()) return;

    let lastTopic = null;

    const checkTopic = () => {
      if (!isStudySection()) {
        if (toolbar) toolbar.remove();
        if (floatChip) floatChip.remove();
        if (canvas) canvas.remove();
        toolbar = null;
        floatChip = null;
        canvas = null;
        return;
      }

      setupCanvas();
      if (!toolbar) renderToolbar();
      if (!floatChip) renderFloatingChip();

      const topicId = getActiveTopicId();
      if (topicId !== lastTopic) {
        lastTopic = topicId;
        loadStrokes(topicId);
      }
    };

    // Periodic synchronization
    setInterval(checkTopic, 600);
    window.addEventListener("popstate", checkTopic);
    window.addEventListener("kn:auth-changed", checkTopic);
    window.addEventListener("kn:study-topic-loaded", checkTopic);
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
      renderFloatingChip();
    });
  } else {
    monitorStudyNavigation();
    renderFloatingChip();
  }
})();
