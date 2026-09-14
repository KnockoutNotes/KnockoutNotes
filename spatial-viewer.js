// ==========================================================================
// KNOCKOUTNOTES — Holographic Spatial Content Viewer (spatial-viewer.js)
// 3D Foreground Document Viewer (Images, PDFs, PPTs) with 'OPEN SIMPLE VIEW'
// ==========================================================================

(function () {
  "use strict";

  let activeItemIndex = -1;
  let currentItemsList = [];
  let currentScale = 1.0;
  let lastFocused = null;

  function lockScroll(locked) {
    // No same-file fallback on purpose: this viewer only ever opens from a
    // user click, well after script.js has run and defined this on
    // DOMContentLoaded, and a plain `overflow: hidden` fallback would just
    // reintroduce the exact sticky-header corruption bug this shared,
    // reference-counted lock exists to avoid (see script.js).
    if (window.KnockoutScrollLock && typeof window.KnockoutScrollLock.set === "function") {
      window.KnockoutScrollLock.set("spatial-viewer", locked);
    }
  }

  function initSpatialViewer() {
    let viewer = document.getElementById("knSpatialViewer");
    if (!viewer) {
      viewer = document.createElement("div");
      viewer.id = "knSpatialViewer";
      viewer.className = "spatial-viewer-overlay";
      viewer.setAttribute("role", "dialog");
      viewer.setAttribute("aria-modal", "true");
      viewer.innerHTML = `
        <div class="spatial-viewer-backdrop" data-close-viewer></div>
        <div class="spatial-viewer-hud">
          <div class="viewer-top-bar">
            <div class="viewer-title-group">
              <span class="viewer-kicker" id="knViewerKicker">HOLOGRAPHIC DOCUMENT INSPECTION</span>
              <h3 class="viewer-title" id="knViewerTitle">Document Inspection</h3>
            </div>
            <div class="viewer-actions">
              <button class="btn-hud simple-view-btn" id="knViewerSimpleView" title="Open distraction-free clean document view">
                <span>⚡ OPEN SIMPLE VIEW</span>
              </button>
              <button class="btn-hud" id="knViewerZoomIn" title="Zoom In">+</button>
              <button class="btn-hud" id="knViewerZoomOut" title="Zoom Out">−</button>
              <button class="btn-hud" id="knViewerFullscreen" title="Fullscreen">⛶</button>
              <button class="btn-hud close-btn" data-close-viewer title="Close Viewer (ESC)">✕</button>
            </div>
          </div>

          <div class="viewer-stage" id="knViewerStage">
            <div class="viewer-content-plane" id="knViewerContentPlane">
              <img id="knViewerImg" src="" alt="Clinical Document" decoding="async" style="display:none;">
              <iframe id="knViewerFrame" src="" style="display:none;" title="Document Preview"></iframe>
              <div id="knViewerFallback" class="viewer-fallback" style="display:none;">
                <div class="viewer-fallback-icon">📄</div>
                <h4 id="knViewerFallbackTitle">Presentation Document</h4>
                <p>Click below to download or open the presentation slides directly.</p>
                <a id="knViewerDownloadBtn" class="btn-cinematic primary" href="" download target="_blank" rel="noopener">Open Presentation →</a>
              </div>
            </div>
          </div>

          <div class="viewer-bottom-bar">
            <div class="viewer-nav-group">
              <button class="btn-hud" id="knViewerPrev">← PREV ITEM</button>
              <span class="viewer-counter" id="knViewerCounter">01 / 01</span>
              <button class="btn-hud" id="knViewerNext">NEXT ITEM →</button>
            </div>
            <div class="viewer-hud-status">
              <span>RESOLUTION: <strong id="knViewerRes">ORIGINAL CLINICAL ASSET</strong></span>
              <span class="hud-status-dot"></span>
              <span>INSPECTION: <strong style="color:var(--accent-cyan);">ACTIVE</strong></span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(viewer);
    }

    const modal = viewer;
    const img = document.getElementById("knViewerImg");
    const frame = document.getElementById("knViewerFrame");
    const fallback = document.getElementById("knViewerFallback");
    const fallbackTitle = document.getElementById("knViewerFallbackTitle");
    const downloadBtn = document.getElementById("knViewerDownloadBtn");
    const titleEl = document.getElementById("knViewerTitle");
    const kickerEl = document.getElementById("knViewerKicker");
    const counterEl = document.getElementById("knViewerCounter");
    const plane = document.getElementById("knViewerContentPlane");
    const simpleViewBtn = document.getElementById("knViewerSimpleView");

    function openItem(item, itemsList, index) {
      if (!item) return;
      const wasOpen = modal.classList.contains("open");
      if (!wasOpen) lastFocused = document.activeElement;
      currentItemsList = itemsList || [item];
      activeItemIndex = index !== undefined ? index : currentItemsList.indexOf(item);
      currentScale = 1.0;
      if (plane) plane.style.transform = `scale(${currentScale})`;

      const url = item.url || item.href || item;
      const title = item.title || "Clinical Document";
      const isPdf = (typeof item === "object" && item.type === "pdf") || /\.pdf(?:$|\?)/i.test(url);
      const isPpt = (typeof item === "object" && (item.type === "ppt" || item.type === "pptx")) || /\.(?:ppt|pptx)(?:$|\?)/i.test(url);

      titleEl.textContent = title;
      if (isPdf) {
        kickerEl.textContent = "PORTABLE DOCUMENT FORMAT // CLINICAL SUMMARY";
      } else if (isPpt) {
        kickerEl.textContent = "SLIDE PRESENTATION // CLINICAL SEMINAR";
      } else {
        kickerEl.textContent = "HIGH-RESOLUTION INFOGRAPHIC // CLINICAL PEARL";
      }

      counterEl.textContent = `${String(activeItemIndex + 1).padStart(2, "0")} / ${String(currentItemsList.length).padStart(2, "0")}`;

      img.style.display = "none";
      frame.style.display = "none";
      fallback.style.display = "none";

      if (isPdf) {
        frame.style.display = "block";
        frame.src = url;
      } else if (isPpt) {
        fallback.style.display = "block";
        fallbackTitle.textContent = title;
        downloadBtn.href = url;
      } else {
        img.style.display = "block";
        img.src = url;
      }

      simpleViewBtn.onclick = () => {
        window.open(url, "_blank", "noopener,noreferrer");
      };

      modal.classList.add("open");
      if (!wasOpen) {
        lockScroll(true);
        // Move focus into the modal so keyboard users don't keep tabbing
        // through the now visually-hidden page underneath it — the close
        // button is always present and is the safest universal landing
        // spot (Prev/Next/zoom controls can be absent or mid-transition
        // depending on the item type).
        const closeBtn = modal.querySelector(".close-btn");
        if (closeBtn) closeBtn.focus();
      }

      if (window.KnockoutSpatialBg && typeof window.KnockoutSpatialBg.triggerRipple === "function") {
        window.KnockoutSpatialBg.triggerRipple(window.innerWidth * 0.5, window.innerHeight * 0.5);
      }
    }

    function closeViewer() {
      modal.classList.remove("open");
      lockScroll(false);
      if (img) img.src = "";
      if (frame) frame.src = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
      lastFocused = null;
    }

    modal.querySelectorAll("[data-close-viewer]").forEach(btn => {
      btn.addEventListener("click", closeViewer);
    });

    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let panStartX = 0;
    let panStartY = 0;
    let stagePinchDist = null;
    let stagePinchScale = 1.0;

    function applyTransform() {
      if (plane) {
        plane.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${currentScale})`;
      }
    }

    const stage = document.getElementById("knViewerStage");
    if (stage) {
      stage.style.touchAction = "none";

      stage.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".viewer-actions, button, a")) return;
        if (currentScale > 1.0) {
          isPanning = true;
          panStartX = e.clientX - panX;
          panStartY = e.clientY - panY;
          stage.style.cursor = "grabbing";
        }
      });

      window.addEventListener("pointermove", (e) => {
        if (isPanning) {
          panX = e.clientX - panStartX;
          panY = e.clientY - panStartY;
          applyTransform();
        }
      });

      window.addEventListener("pointerup", () => {
        isPanning = false;
        if (stage) stage.style.cursor = currentScale > 1.0 ? "grab" : "default";
      });

      // Pinch zoom on mobile devices
      stage.addEventListener("touchstart", (e) => {
        if (e.touches.length === 2) {
          stagePinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          stagePinchScale = currentScale;
        }
      }, { passive: true });

      stage.addEventListener("touchmove", (e) => {
        if (e.touches.length === 2 && stagePinchDist) {
          const newDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (stagePinchDist > 10) {
            const factor = newDist / stagePinchDist;
            currentScale = Math.min(3.5, Math.max(0.6, stagePinchScale * factor));
            applyTransform();
            if (e.cancelable) e.preventDefault();
          }
        }
      }, { passive: false });

      stage.addEventListener("touchend", (e) => {
        if (e.touches.length < 2) stagePinchDist = null;
      }, { passive: true });
    }

    document.getElementById("knViewerZoomIn").addEventListener("click", () => {
      currentScale = Math.min(3.5, currentScale + 0.25);
      applyTransform();
      if (stage) stage.style.cursor = "grab";
    });

    document.getElementById("knViewerZoomOut").addEventListener("click", () => {
      currentScale = Math.max(0.6, currentScale - 0.25);
      if (currentScale <= 1.0) { panX = 0; panY = 0; }
      applyTransform();
      if (stage) stage.style.cursor = currentScale > 1.0 ? "grab" : "default";
    });

    document.getElementById("knViewerFullscreen").addEventListener("click", () => {
      if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    document.getElementById("knViewerPrev").addEventListener("click", () => {
      if (currentItemsList.length > 1) {
        const prevIdx = (activeItemIndex - 1 + currentItemsList.length) % currentItemsList.length;
        openItem(currentItemsList[prevIdx], currentItemsList, prevIdx);
      }
    });

    document.getElementById("knViewerNext").addEventListener("click", () => {
      if (currentItemsList.length > 1) {
        const nextIdx = (activeItemIndex + 1) % currentItemsList.length;
        openItem(currentItemsList[nextIdx], currentItemsList, nextIdx);
      }
    });

    const FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
    window.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("open")) return;
      if (e.key === "Escape") { closeViewer(); return; }
      if (e.key === "ArrowLeft") { document.getElementById("knViewerPrev").click(); return; }
      if (e.key === "ArrowRight") { document.getElementById("knViewerNext").click(); return; }
      // Focus trap: without this, Tab walks off the last control here and
      // into the underlying page, which is still in the tab order even
      // though this overlay visually covers it.
      if (e.key !== "Tab") return;
      const focusable = Array.from(modal.querySelectorAll(FOCUSABLE_SEL)).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Intercept clicks on clinical asset links — 3D View only. Lite View must
    // keep its plain link behaviour untouched.
    document.addEventListener("click", (e) => {
      if (!document.body.classList.contains("mode-3d")) return;
      const link = e.target.closest("a[href*='assets/']");
      if (link && link.closest(".view-layer-lite")) return;
      if (link && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        const href = link.getAttribute("href");
        if (/\.(?:jpg|jpeg|png|webp|pdf|ppt|pptx)(?:$|\?)/i.test(href)) {
          e.preventDefault();
          const title = link.querySelector(".kn-file-title")?.textContent || link.textContent.trim();
          openItem({ url: href, title: title }, [ { url: href, title: title } ], 0);
        }
      }
    });

    window.KnockoutSpatialViewer = {
      open: openItem,
      close: closeViewer
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSpatialViewer);
  } else {
    initSpatialViewer();
  }
})();
