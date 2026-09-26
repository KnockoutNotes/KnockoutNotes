/* ==========================================================================
   KNOCKOUTNOTES — High-Performance 3D Molecule & Procedural Viewer
   (study-molecule-3d.js)
   Renders explicit-H 3D chemical conformers and procedural medical device
   models as glossy CPK-coloured spheres + bond cylinders using Three.js.
   ========================================================================== */
import * as THREE from "three";

// Classic CPK ball-and-stick palette
const CPK_COLOR = {
  H: 0xf3f6f9, C: 0x9aa5b0, N: 0x2f7fe0, O: 0xf0362a, S: 0xf0c419,
  Cl: 0x2ecc71, F: 0x8fe38a, Br: 0xb23a3a, Na: 0x9333ea, Mg: 0xf59e0b,
  K: 0xa855f7, Ca: 0xef4444, Fe: 0xea580c, P: 0xf97316, I: 0x7c3aed
};
const CPK_RADIUS = {
  H: 0.38, C: 0.64, N: 0.62, O: 0.60, S: 0.70, Cl: 0.68, F: 0.56, Br: 0.74,
  Na: 0.76, Mg: 0.72, K: 0.82, Ca: 0.80, Fe: 0.74, P: 0.70, I: 0.82
};
const DEFAULT_COLOR = 0xa78bfa;
const DEFAULT_RADIUS = 0.64;
const BOND_RADIUS = 0.13;

const mounts = new WeakMap();
const activeQueue = []; // FIFO to enforce maximum concurrent WebGL contexts
const MAX_ACTIVE_CONTEXTS = 6;

// Global visibility listener: pause all active viewers when tab is hidden or device locked
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    const isHidden = document.hidden;
    activeQueue.forEach((container) => {
      const m = mounts.get(container);
      if (m) {
        if (isHidden) {
          m.pause();
        } else if (m.isVisible) {
          m.resume();
        }
      }
    });
  });
}

function disposeMount(container) {
  const m = mounts.get(container);
  if (!m) return;
  m.cleanup();
  mounts.delete(container);
  const qIdx = activeQueue.indexOf(container);
  if (qIdx !== -1) activeQueue.splice(qIdx, 1);

  // Restore fallback 2D diagram visibility so cards never turn blank or empty
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg, .st-tile-fallback-icon, .st-molecule-placeholder");
  if (fallback) fallback.style.display = "";
  container.classList.remove("st-has-canvas");
}

/**
 * Mounts a high-performance rotating 3D viewer into `container`.
 * Returns true on success, false if WebGL is unavailable.
 */
function mountMolecule3D(container, data, opts) {
  if (!container || !container.isConnected) return false;
  disposeMount(container);

  const hasAtoms = data && data.atoms && data.atoms.length;
  const hasParts = data && data.parts && data.parts.length;
  if (!hasAtoms && !hasParts) return false;

  // Enforce max concurrent WebGL contexts to prevent mobile browser context crashes
  while (activeQueue.length >= MAX_ACTIVE_CONTEXTS) {
    const oldest = activeQueue.shift();
    if (oldest && oldest !== container) {
      disposeMount(oldest);
    }
  }

  const fitMargin = (opts && opts.fitMargin) || 1.25;
  const isThumb = !!(opts && opts.isThumbnail) || (container.clientWidth > 0 && container.clientWidth < 100);
  const isMobile = typeof window !== "undefined" && (
    window.innerWidth <= 768 ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
  );

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isThumb,
      alpha: true,
      powerPreference: "low-power",
      precision: isMobile ? "mediump" : "highp"
    });
  } catch (err) {
    return false;
  }

  const maxDPR = isThumb ? 1.0 : (isMobile ? 1.5 : 2.0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDPR));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const canvas = renderer.domElement;
  canvas.className = "st-molecule-canvas";
  canvas.style.touchAction = "pan-y"; // NEVER block mobile vertical page scrolling
  if (isThumb) {
    canvas.style.pointerEvents = "none";
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    disposeMount(container);
  }, { once: true });

  const scene = new THREE.Scene();
  const fov = 32;
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 200);

  let boundingRadius = data.boundingRadius || 0;
  if (hasAtoms) {
    data.atoms.forEach(([el, x, y, z]) => {
      const r = Math.sqrt(x * x + y * y + z * z) + (CPK_RADIUS[el] || DEFAULT_RADIUS);
      if (r > boundingRadius) boundingRadius = r;
    });
  }
  if (hasParts && !data.boundingRadius) {
    data.parts.forEach((p) => {
      const [px, py, pz] = p.pos || [0, 0, 0];
      const maxDim = p.radius || (p.args && Math.max(...p.args)) || 1;
      const r = Math.sqrt(px * px + py * py + pz * pz) + maxDim;
      if (r > boundingRadius) boundingRadius = r;
    });
  }
  boundingRadius = Math.max(boundingRadius, 1.5);
  const dist = (boundingRadius * fitMargin) / Math.sin(THREE.MathUtils.degToRad(fov / 2));
  camera.position.set(0, 0, dist);

  // Soft lighting setup
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30363f, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(5, 7, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.55);
  fill.position.set(-6, 2, 5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x93c5fd, 0.4);
  rim.position.set(-3, -4, -7);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const disposables = [];

  // 1. Procedural 3D device parts
  if (hasParts) {
    data.parts.forEach((p) => {
      let geo;
      const args = p.args || [];
      switch (p.geo) {
        case "cylinder":
          geo = new THREE.CylinderGeometry(...(args.length ? args : [1, 1, 1, 14]));
          break;
        case "sphere":
          geo = new THREE.SphereGeometry(...(args.length ? args : [1, 16, 12]));
          break;
        case "box":
          geo = new THREE.BoxGeometry(...(args.length ? args : [1, 1, 1]));
          break;
        case "torus":
          geo = new THREE.TorusGeometry(...(args.length ? args : [1, 0.25, 12, 20]));
          break;
        case "cone":
          geo = new THREE.ConeGeometry(...(args.length ? args : [1, 1, 14]));
          break;
        case "ring":
          geo = new THREE.RingGeometry(...(args.length ? args : [0.5, 1, 16]));
          break;
        case "capsule":
          if (typeof THREE.CapsuleGeometry === "function") {
            geo = new THREE.CapsuleGeometry(...(args.length ? args : [0.5, 1, 8, 12]));
          } else {
            geo = new THREE.CylinderGeometry(args[0] || 0.5, args[0] || 0.5, args[1] || 1, 14);
          }
          break;
        default:
          geo = new THREE.BoxGeometry(1, 1, 1);
      }
      disposables.push(geo);

      const mat = new THREE.MeshStandardMaterial({
        color: p.color !== undefined ? p.color : 0x9aa5b0,
        roughness: p.roughness !== undefined ? p.roughness : 0.22,
        metalness: p.metalness !== undefined ? p.metalness : 0.25,
        transparent: !!p.transparent || (p.opacity !== undefined && p.opacity < 1),
        opacity: p.opacity !== undefined ? p.opacity : 1.0,
        wireframe: !!p.wireframe,
      });
      disposables.push(mat);

      const mesh = new THREE.Mesh(geo, mat);
      if (p.pos) mesh.position.set(...p.pos);
      if (p.rot) mesh.rotation.set(...p.rot);
      if (p.scale) {
        if (Array.isArray(p.scale)) mesh.scale.set(...p.scale);
        else mesh.scale.setScalar(p.scale);
      }
      group.add(mesh);
    });
  }

  // 2. CPK Ball-and-stick molecules (isolated geometries & materials per renderer)
  if (hasAtoms) {
    const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
    const bondMat = new THREE.MeshStandardMaterial({ color: 0xc7d0da, roughness: 0.28, metalness: 0.35 });
    disposables.push(sphereGeo, cylGeo, bondMat);

    const matCache = new Map();

    data.atoms.forEach(([el, x, y, z]) => {
      let mat = matCache.get(el);
      if (!mat) {
        mat = new THREE.MeshStandardMaterial({
          color: CPK_COLOR[el] || DEFAULT_COLOR,
          roughness: 0.18,
          metalness: 0.08
        });
        matCache.set(el, mat);
        disposables.push(mat);
      }
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(CPK_RADIUS[el] || DEFAULT_RADIUS);
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    if (data.bonds) {
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      data.bonds.forEach(([i, j]) => {
        const a = data.atoms[i];
        const b = data.atoms[j];
        if (!a || !b) return;
        start.set(a[1], a[2], a[3]);
        end.set(b[1], b[2], b[3]);
        const len = start.distanceTo(end);
        if (len < 0.01) return;
        const mesh = new THREE.Mesh(cylGeo, bondMat);
        mesh.scale.set(BOND_RADIUS, len, BOND_RADIUS);
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(up, end.clone().sub(start).normalize());
        group.add(mesh);
      });
    }
  }

  // Soft contact shadow
  let minY = Infinity;
  if (hasAtoms) {
    data.atoms.forEach(([, , y]) => { if (y < minY) minY = y; });
  }
  if (hasParts) {
    data.parts.forEach((p) => {
      const py = (p.pos && p.pos[1]) || 0;
      const h = (p.args && p.args[1]) || (p.radius || 1);
      const y = py - h / 2;
      if (y < minY) minY = y;
    });
  }
  if (minY === Infinity) minY = -2;

  const shadowRadius = Math.max(3.2, boundingRadius * 0.85);
  const shadowGeo = new THREE.CircleGeometry(shadowRadius, 20);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.20, depthWrite: false });
  disposables.push(shadowGeo, shadowMat);
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = minY - 0.7;
  group.add(shadowDisc);

  // Resize handler
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (!raf && isVisible) {
      renderer.render(scene, camera);
    }
  }

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // Test first render before hiding fallback!
  try {
    renderer.render(scene, camera);
  } catch (err) {
    // If WebGL fails, clean up immediately and leave fallback visible
    ro.disconnect();
    disposables.forEach((d) => d.dispose && d.dispose());
    renderer.dispose();
    return false;
  }

  // First render was successful! Safely attach canvas and hide fallback
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg, .st-tile-fallback-icon, .st-molecule-placeholder");
  if (fallback) fallback.style.display = "none";
  container.classList.add("st-has-canvas");
  container.appendChild(canvas);

  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isVisible = true;
  let raf = null;
  let isInteracting = false;
  let resumeTimer = null;

  function tick() {
    if (!container.isConnected) {
      disposeMount(container);
      return;
    }
    if (!isVisible || document.hidden) {
      raf = null;
      return;
    }
    raf = requestAnimationFrame(tick);
    if (!reducedMotion && !isInteracting) {
      group.rotation.y += 0.007;
    }
    renderer.render(scene, camera);
  }

  function resumeRAF() {
    if (!raf && isVisible && !document.hidden && container.isConnected) {
      raf = requestAnimationFrame(tick);
    }
  }

  function pauseRAF() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  // Pre-render anticipation: start loop 100px before entering viewport, pause when scrolled away
  const io = ("IntersectionObserver" in window) ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible = true;
        resumeRAF();
      } else {
        isVisible = false;
        pauseRAF();
      }
    });
  }, { rootMargin: "100px 0px" }) : null;

  if (io) io.observe(container);
  resumeRAF();

  // Pointer drag controls for full viewer
  if (!isThumb) {
    let startX = 0, startY = 0;
    let startRotY = 0, startRotX = 0;

    const onPointerDown = (e) => {
      isInteracting = true;
      startX = e.clientX;
      startY = e.clientY;
      startRotY = group.rotation.y;
      startRotX = group.rotation.x;
      if (canvas.setPointerCapture) {
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (resumeTimer) clearTimeout(resumeTimer);
    };

    const onPointerMove = (e) => {
      if (!isInteracting) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      group.rotation.y = startRotY + dx * 0.012;
      group.rotation.x = Math.max(-1.1, Math.min(1.1, startRotX + dy * 0.012));
      renderer.render(scene, camera);
    };

    const onPointerUp = (e) => {
      if (!isInteracting) return;
      isInteracting = false;
      if (canvas.releasePointerCapture) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
      }
      resumeTimer = setTimeout(() => {
        resumeRAF();
      }, 1200);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
  }

  const mountRecord = {
    renderer,
    scene,
    get isVisible() { return isVisible; },
    resume: resumeRAF,
    pause: pauseRAF,
    cleanup: () => {
      pauseRAF();
      if (resumeTimer) clearTimeout(resumeTimer);
      if (io) io.disconnect();
      ro.disconnect();
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };

  mounts.set(container, mountRecord);
  activeQueue.push(container);
  return true;
}

window.KNMountMolecule3D = mountMolecule3D;
window.KNDisposeMolecule3D = disposeMount;
window.dispatchEvent(new CustomEvent("kn-molecule3d-ready"));
