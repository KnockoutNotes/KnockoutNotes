/**
 * KNOCKOUTNOTES — Stylus / Pen Handwriting Engine (study-annotations.js)
 * Strictly scoped to the Study section (body[data-content-page="study"]).
 * Automatically reveals a sleek floating vertical toolbar on the left/right
 * side the moment an Apple Pencil, Samsung S Pen, or stylus is detected.
 * Includes Pen, Pencil, Highlighter, Eraser, Swatches, Palm Rejection, and Local/Cloud Storage.
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

  // State
  let activeTool = null; // null = viewing/navigation mode, string = drawing mode
  let activeColor = DEFAULT_COLORS[0];
  let isDrawing = false;
  let penActive = false; // Flag for hardware palm rejection
  let currentStroke = null;
  let strokes = [];
  let undoStack = [];
  let currentTopicId = null;
  let dockSide = "right"; // "right" or "left"
  let stylusDetected = false;
  let toastShown = false;

  // DOM Elements
  let canvas = null;
  let ctx = null;
  let toolbar = null;
  let stageContainer = null;
  let resizeObserver = null;
  let mutationObserver = null;

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

    const stageBox = document.getElementById("ronMainContentBox");
    if (stageBox) {
      const titleEl = document.querySelector(".ron-diagnosis-title");
      if (titleEl && titleEl.textContent) {
        return titleEl.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      }
      return "current_topic";
    }

    return null;
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
      // Fallback: check guest key if logged in user has no strokes yet
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
   * Initialize or attach the annotation canvas over #ronMainContentBox
   */
  function setupCanvas() {
    if (!isStudySection()) return;

    stageContainer = document.getElementById("ronMainContentBox") ||
                     document.querySelector(".ron-stage-container") ||
                     document.querySelector(".ron-screen");
    if (!stageContainer) return;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "kn-annotation-canvas";
      ctx = canvas.getContext("2d", { willReadFrequently: false });
      attachPointerListeners(canvas);
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
        syncCanvasDimensions();
      });
      mutationObserver.observe(stageContainer, { childList: true, subtree: true });
    }
  }

  /**
   * Resize canvas matching the scrollable scrollHeight of the stage
   */
  function syncCanvasDimensions() {
    if (!stageContainer || !canvas || !ctx) return;
    const rect = stageContainer.getBoundingClientRect();
    const width = Math.max(stageContainer.scrollWidth, rect.width, 320);
    const height = Math.max(stageContainer.scrollHeight, rect.height, 500);

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
   * Global Pen & Stylus Detection Listener
   * When any pen/stylus interacts or hovers near the screen, reveal the floating sidebar immediately
   */
  function setupGlobalPenDetection() {
    const handleGlobalPointer = (e) => {
      if (!isStudySection()) return;

      const isStylus = e.pointerType === "pen" ||
                       (e.pointerType === "touch" && e.altitudeAngle !== undefined && e.altitudeAngle > 0) ||
                       (e.touches && e.touches[0] && e.touches[0].touchType === "stylus");

      if (isStylus) {
        if (!stylusDetected) {
          stylusDetected = true;
          if (!toastShown) {
            toastShown = true;
            showStylusDetectedToast();
          }
        }

        // Ensure canvas and toolbar exist
        setupCanvas();
        if (!toolbar) renderToolbar();
        showToolbar();

        if (activeTool !== TOOLS.PENCIL && activeTool !== TOOLS.HIGHLIGHTER && activeTool !== TOOLS.ERASER) {
          setTool(TOOLS.PEN);
        }
      }
    };

    ["pointerdown", "pointermove", "pointerenter"].forEach((evt) => {
      window.addEventListener(evt, handleGlobalPointer, { capture: true, passive: true });
      document.addEventListener(evt, handleGlobalPointer, { capture: true, passive: true });
    });
    document.addEventListener("touchstart", (e) => {
      if (e.touches && e.touches[0] && e.touches[0].touchType === "stylus") {
        handleGlobalPointer(e);
      }
    }, { capture: true, passive: true });
  }

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
   * Pointer Events with Stylus Palm Rejection
   */
  function attachPointerListeners(cvs) {
    cvs.addEventListener("pointerdown", onPointerDown, { passive: false });
    cvs.addEventListener("pointermove", onPointerMove, { passive: false });
    cvs.addEventListener("pointerup", onPointerUp, { passive: false });
    cvs.addEventListener("pointercancel", onPointerCancel, { passive: false });
    cvs.addEventListener("pointerleave", onPointerCancel, { passive: false });
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const pressure = (e.pressure !== undefined && e.pressure > 0) ? e.pressure : 0.5;
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: Math.min(Math.max(pressure, 0.15), 1.0)
    };
  }

  function onPointerDown(e) {
    if (!activeTool) return;

    const isPen = e.pointerType === "pen" ||
                  (e.pointerType === "touch" && e.altitudeAngle !== undefined && e.altitudeAngle > 0);

    // Palm Rejection: When a stylus/pen is present or actively writing, reject finger touches
    if (isPen) {
      penActive = true;
      if (!stylusDetected) {
        stylusDetected = true;
        showStylusDetectedToast();
      }
    } else if (e.pointerType === "touch" && penActive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // S Pen Barrel button shortcut (Eraser toggle)
    let toolToUse = activeTool;
    if (e.button === 5 || e.buttons === 32) {
      toolToUse = TOOLS.ERASER;
    }

    e.preventDefault();
    isDrawing = true;

    try {
      if (canvas && typeof canvas.setPointerCapture === "function") {
        canvas.setPointerCapture(e.pointerId);
      }
    } catch (_) {}

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
  }

  function onPointerMove(e) {
    if (!isDrawing) return;

    // Palm Rejection: ignore touches during pen drawing
    if (e.pointerType === "touch" && penActive) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.preventDefault();
    const pt = getCanvasCoords(e);

    if (activeTool === TOOLS.ERASER || e.button === 5 || e.buttons === 32) {
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

    try {
      if (canvas && typeof canvas.releasePointerCapture === "function") {
        canvas.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}

    if (currentStroke && currentStroke.points.length > 0) {
      strokes.push(currentStroke);
      undoStack = [];
      saveStrokes();
      currentStroke = null;
    }

    if (e.pointerType === "pen") {
      // Retain palm rejection shield for 400ms post-stroke
      setTimeout(() => {
        penActive = false;
      }, 400);
    }
  }

  function onPointerCancel(e) {
    onPointerUp(e);
  }

  /**
   * Rendering individual segment with smooth curves & pressure dynamics
   */
  function drawSegment(stroke, startIndex, endIndex) {
    if (!ctx || startIndex < 0 || endIndex >= stroke.points.length) return;
    const p1 = stroke.points[startIndex];
    const p2 = stroke.points[endIndex];

    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

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
   * Redraw all strokes on canvas
   */
  function redrawAll() {
    if (!ctx || !canvas) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.points.length === 1) {
        // Single tap dot
        drawSegment(s, 0, 0);
      } else {
        for (let j = 0; j < s.points.length - 1; j++) {
          drawSegment(s, j, j + 1);
        }
      }
    }
    ctx.restore();
  }

  /**
   * Stroke-level Eraser (Samsung Notes / GoodNotes style)
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
      <button type="button" class="kn-tool-btn" id="knDismissToolbarBtn" title="Hide Toolbar" aria-label="Hide">
        ✕
      </button>
    `;

    document.body.appendChild(toolbar);
    attachToolbarEvents();
  }

  function showToolbar() {
    setupCanvas();
    if (!toolbar) renderToolbar();
    if (toolbar) {
      toolbar.classList.remove("kn-hidden");
    }
    // If no active tool is set, default to pen
    if (!activeTool) {
      setTool(TOOLS.PEN);
    }
  }

  function hideToolbar() {
    if (toolbar) {
      toolbar.classList.add("kn-hidden");
      setTool(null);
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

    // Switch between left and right side dock
    const switchBtn = toolbar.querySelector("#knDockSwitchBtn");
    if (switchBtn) {
      switchBtn.addEventListener("click", () => {
        if (dockSide === "right") {
          dockSide = "left";
          toolbar.classList.remove("dock-right");
          toolbar.classList.add("dock-left");
        } else {
          dockSide = "right";
          toolbar.classList.remove("dock-left");
          toolbar.classList.add("dock-right");
        }
      });
    }

    // Dismiss toolbar
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

    if (canvas) {
      if (activeTool) {
        canvas.classList.add("active-mode");
      } else {
        canvas.classList.remove("active-mode");
      }
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

    // Auto close on outside click
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
   */
  function monitorStudyNavigation() {
    if (!isStudySection()) return;

    let lastTopic = null;

    const checkTopic = () => {
      if (!isStudySection()) {
        if (toolbar) toolbar.remove();
        if (canvas) canvas.remove();
        return;
      }

      const topicId = getActiveTopicId();

      if (topicId) {
        setupCanvas();
        if (!toolbar) renderToolbar();

        if (topicId !== lastTopic) {
          lastTopic = topicId;
          loadStrokes(topicId);

          // If stylus was previously detected in session, reveal toolbar
          if (stylusDetected) {
            showToolbar();
          }
        }
      } else {
        lastTopic = null;
        if (canvas) {
          // If we are browsing categories, keep canvas detached until topic opened
          if (canvas.parentElement) canvas.remove();
        }
        if (toolbar) {
          hideToolbar();
        }
      }
    };

    // Responsive checks
    setInterval(checkTopic, 500);
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
    setupCanvas
  };

  // Boot listeners
  setupGlobalPenDetection();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", monitorStudyNavigation);
  } else {
    monitorStudyNavigation();
  }
})();
