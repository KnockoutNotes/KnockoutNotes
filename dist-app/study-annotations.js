/**
 * KNOCKOUTNOTES — Handwriting, Stylus & Annotation Engine (study-annotations.js)
 * Implements Pointer Events Level 2, palm rejection, pressure-sensitive drawing,
 * multi-tool ink rendering (ballpoint, pencil, highlighter, eraser),
 * local offline persistence and sync for logged-in users.
 */

(function () {
  "use strict";

  // Tool Definitions
  const TOOLS = {
    PEN: "pen",
    PENCIL: "pencil",
    HIGHLIGHTER: "highlighter",
    ERASER: "eraser"
  };

  const DEFAULT_COLORS = ["#0284c7", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#0f172a"];

  // State
  let activeTool = null; // null = inactive/navigation mode
  let activeColor = DEFAULT_COLORS[0];
  let isDrawing = false;
  let penActive = false; // Flag to enforce hardware palm rejection
  let currentStroke = null;
  let strokes = [];
  let undoStack = [];
  let currentTopicId = null;

  // DOM Elements
  let canvas = null;
  let ctx = null;
  let toolbar = null;
  let stageContainer = null;
  let resizeObserver = null;

  /**
   * Check if user is logged in
   */
  function isUserLoggedIn() {
    if (window.KN_WORKSPACE && typeof window.KN_WORKSPACE.isLoggedIn === "function") {
      return window.KN_WORKSPACE.isLoggedIn();
    }
    try {
      const user = localStorage.getItem("kn_user");
      return !!user && user !== "null";
    } catch (_) {
      return false;
    }
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
   * Initialize or attach the annotation canvas over .ron-stage-container
   */
  function setupCanvas() {
    stageContainer = document.getElementById("ronMainContentBox") || document.querySelector(".ron-stage-container");
    if (!stageContainer) return;

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "kn-annotation-canvas";
      ctx = canvas.getContext("2d");
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
  }

  /**
   * Resize canvas matching the scrollable scrollHeight of the stage
   */
  function syncCanvasDimensions() {
    if (!stageContainer || !canvas || !ctx) return;
    const rect = stageContainer.getBoundingClientRect();
    const width = stageContainer.scrollWidth || rect.width;
    const height = Math.max(stageContainer.scrollHeight, rect.height, 400);

    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.scale(dpr, dpr);
      redrawAll();
    }
  }

  /**
   * Pointer Events with Stylus Palm Rejection
   */
  function attachPointerListeners(cvs) {
    cvs.addEventListener("pointerdown", onPointerDown, { passive: false });
    cvs.addEventListener("pointermove", onPointerMove, { passive: false });
    cvs.addEventListener("pointerup", onPointerUp, { passive: false });
    cvs.addEventListener("pointercancel", onPointerCancel, { passive: false });
  }

  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure !== undefined && e.pressure > 0 ? e.pressure : 0.5
    };
  }

  function onPointerDown(e) {
    if (!activeTool) return;

    // Palm Rejection: If an active stylus / pen is in use, block finger touches completely
    if (e.pointerType === "pen") {
      penActive = true;
    } else if (e.pointerType === "touch" && penActive) {
      e.preventDefault();
      return;
    }

    // Barrel button eraser shortcut check (S Pen button)
    let toolToUse = activeTool;
    if (e.button === 5 || e.buttons === 32) {
      toolToUse = TOOLS.ERASER;
    }

    e.preventDefault();
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
  }

  function onPointerMove(e) {
    if (!isDrawing) return;

    if (e.pointerType === "touch" && penActive) {
      e.preventDefault();
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

    // Draw the new segment incrementally
    drawSegment(currentStroke, currentStroke.points.length - 2, currentStroke.points.length - 1);
  }

  function onPointerUp(e) {
    if (!isDrawing) return;
    isDrawing = false;

    if (currentStroke && currentStroke.points.length > 0) {
      strokes.push(currentStroke);
      undoStack = []; // Reset redo
      saveStrokes();
      currentStroke = null;
    }

    if (e.pointerType === "pen") {
      // Allow slight delay before letting touch register again
      setTimeout(() => {
        penActive = false;
      }, 400);
    }
  }

  function onPointerCancel(e) {
    onPointerUp(e);
  }

  /**
   * Rendering individual segment with smoothing & pressure
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
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else if (stroke.tool === TOOLS.PENCIL) {
      ctx.globalAlpha = 0.65;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.5 + p2.pressure * 2.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    } else {
      // Default Ballpoint Pen
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 1.5 + p2.pressure * 3.5;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * Redraw all existing strokes
   */
  function redrawAll() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < strokes.length; i++) {
      const s = strokes[i];
      if (s.points.length < 2) continue;
      for (let j = 0; j < s.points.length - 1; j++) {
        drawSegment(s, j, j + 1);
      }
    }
  }

  /**
   * Stroke-level Eraser
   */
  function eraseAtPoint(x, y) {
    const radius = 24;
    const originalLength = strokes.length;

    strokes = strokes.filter((stroke) => {
      // Check if any point in the stroke lies within radius
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
   * Create Floating Toolbar
   */
  function renderToolbar() {
    if (toolbar) toolbar.remove();

    toolbar = document.createElement("div");
    toolbar.className = "kn-pen-toolbar";
    toolbar.id = "knPenToolbar";

    toolbar.innerHTML = `
      <button type="button" class="kn-tool-btn" data-tool="pen" title="Ballpoint Pen (S Pen / Apple Pencil)">✏️</button>
      <button type="button" class="kn-tool-btn" data-tool="pencil" title="Pencil">🖊️</button>
      <button type="button" class="kn-tool-btn" data-tool="highlighter" title="Highlighter">🖍️</button>
      <button type="button" class="kn-tool-btn" data-tool="eraser" title="Eraser">🧹</button>
      <div class="kn-pen-divider"></div>
      <button type="button" class="kn-tool-btn" id="knColorPickerBtn" title="Color Swatches" style="color: ${activeColor}">🎨</button>
      <div class="kn-pen-divider"></div>
      <button type="button" class="kn-tool-btn" id="knUndoBtn" title="Undo">↩️</button>
      <button type="button" class="kn-tool-btn" id="knRedoBtn" title="Redo">↪️</button>
      <div class="kn-pen-divider"></div>
      <button type="button" class="kn-tool-btn kn-toggle-collapse-btn" id="knCollapseBtn" title="Hide/Show Toolbar">✕</button>
    `;

    document.body.appendChild(toolbar);
    attachToolbarEvents();
  }

  function attachToolbarEvents() {
    if (!toolbar) return;

    toolbar.querySelectorAll("[data-tool]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const tool = btn.getAttribute("data-tool");
        if (activeTool === tool) {
          // Toggle off
          setTool(null);
        } else {
          setTool(tool);
        }
      });
    });

    toolbar.querySelector("#knUndoBtn").addEventListener("click", undo);
    toolbar.querySelector("#knRedoBtn").addEventListener("click", redo);

    const collapseBtn = toolbar.querySelector("#knCollapseBtn");
    collapseBtn.addEventListener("click", () => {
      if (toolbar.classList.contains("minimized")) {
        toolbar.classList.remove("minimized");
        collapseBtn.innerText = "✕";
      } else {
        toolbar.classList.add("minimized");
        collapseBtn.innerText = "✏️";
        setTool(null);
      }
    });

    const colorBtn = toolbar.querySelector("#knColorPickerBtn");
    colorBtn.addEventListener("click", () => {
      toggleColorPalette(colorBtn);
    });
  }

  function setTool(tool) {
    activeTool = tool;
    if (toolbar) {
      toolbar.querySelectorAll("[data-tool]").forEach((btn) => {
        if (btn.getAttribute("data-tool") === tool) {
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

    popover.querySelectorAll(".kn-color-swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        activeColor = swatch.getAttribute("data-color");
        anchor.style.color = activeColor;
        popover.remove();
      });
    });

    document.body.appendChild(popover);

    // Auto close when clicking outside
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
    let lastTopic = null;

    const checkTopic = () => {
      if (!isUserLoggedIn()) {
        if (toolbar) toolbar.remove();
        if (canvas) canvas.remove();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const topicId = params.get("topic") || params.get("t");

      if (topicId && topicId !== lastTopic) {
        lastTopic = topicId;
        setupCanvas();
        if (!toolbar) renderToolbar();
        loadStrokes(topicId);
      } else if (!topicId) {
        lastTopic = null;
        if (canvas) canvas.remove();
      }
    };

    setInterval(checkTopic, 600);
    window.addEventListener("popstate", checkTopic);
    window.addEventListener("kn:auth-changed", checkTopic);
  }

  // Export module globally
  window.KN_ANNOTATIONS = {
    init: monitorStudyNavigation,
    setTool,
    undo,
    redo,
    loadStrokes
  };

  // Auto-boot if document is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", monitorStudyNavigation);
  } else {
    monitorStudyNavigation();
  }
})();
