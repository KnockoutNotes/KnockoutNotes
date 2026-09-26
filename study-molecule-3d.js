/* ==========================================================================
   KNOCKOUTNOTES — Rotating 3D ball-and-stick molecule viewer
   (study-molecule-3d.js)
   Renders the explicit-H 3D conformers in study-structures-3d.js (RDKit
   ETKDG-embedded, MMFF/UFF-optimized — see scripts/generate_chemical_
   structures.py) as CPK-coloured spheres + bond cylinders using the site's
   already-vendored Three.js build (same library as regional-3d.js /
   ventilator-scene.js). Transparent renderer background so the molecule
   sits directly over the card/poster gradient behind it.

   This is an ES module (needs the "three" import map — see study.html) so
   it self-registers a plain global (window.KNMountMolecule3D) that the
   classic study-ui.js script can call; study-ui.js is loaded with `defer`
   so it always runs after this module has set that global.
   ========================================================================== */
import * as THREE from "three";

// Classic CPK ball-and-stick palette (matches the reference glossy-render
// look: light brushed-silver carbon, vivid red oxygen, vivid blue nitrogen,
// near-white hydrogen) — spheres sized large and closely packed relative to
// the bond sticks (bigger than a textbook ball-and-stick model, short of a
// full space-filling one) for that dense, chunky product-render look.
const CPK_COLOR = {
  H: 0xf3f6f9, C: 0x9aa5b0, N: 0x2f7fe0, O: 0xf0362a, S: 0xf0c419,
  Cl: 0x2ecc71, F: 0x8fe38a, Br: 0xb23a3a,
};
const CPK_RADIUS = {
  H: 0.4, C: 0.66, N: 0.64, O: 0.62, S: 0.72, Cl: 0.7, F: 0.58, Br: 0.75,
};
const DEFAULT_COLOR = 0xa78bfa;
const DEFAULT_RADIUS = 0.66;
const BOND_RADIUS = 0.14;

const mounts = new WeakMap();

function disposeMount(container) {
  const m = mounts.get(container);
  if (!m) return;
  cancelAnimationFrame(m.raf);
  m.ro.disconnect();
  m.scene.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  });
  m.renderer.dispose();
  if (m.renderer.domElement.parentNode) m.renderer.domElement.parentNode.removeChild(m.renderer.domElement);
  // Restore fallback 2D diagram visibility so cards never turn blank or empty
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg, .st-molecule-placeholder");
  if (fallback) fallback.style.display = "";
  container.classList.remove("st-has-canvas");
  mounts.delete(container);
}

/**
 * Mounts a rotating 3D ball-and-stick viewer into `container` (any element
 * with a defined size — see .st-molecule-viewer in study.css). Returns
 * true on success, false if WebGL isn't available (caller should fall back
 * to the flat 2D diagram).
 */
function mountMolecule3D(container, data, opts) {
  disposeMount(container);
  const hasAtoms = data && data.atoms && data.atoms.length;
  const hasParts = data && data.parts && data.parts.length;
  if (!hasAtoms && !hasParts) return false;
  const fitMargin = (opts && opts.fitMargin) || 1.25;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (err) {
    return false;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "st-molecule-canvas";

  // Hide the flat-2D-SVG or loading placeholder fallback without destroying it
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg, .st-molecule-placeholder");
  if (fallback) fallback.style.display = "none";
  container.classList.add("st-has-canvas");
  container.appendChild(canvas);

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

  // Bright, mostly-white studio lighting (several soft-ish sources rather
  // than one hard key light) is what gives glossy CPK renders like the
  // reference their rounded specular highlight on every sphere.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x30363f, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(5, 7, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-6, 2, 5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x93c5fd, 0.45);
  rim.position.set(-3, -4, -7);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  // 1. Procedural 3D device parts (for medical equipment & clinical devices)
  if (hasParts) {
    data.parts.forEach((p) => {
      let geo;
      const args = p.args || [];
      switch (p.geo) {
        case "cylinder":
          geo = new THREE.CylinderGeometry(...(args.length ? args : [1, 1, 1, 20]));
          break;
        case "sphere":
          geo = new THREE.SphereGeometry(...(args.length ? args : [1, 24, 18]));
          break;
        case "box":
          geo = new THREE.BoxGeometry(...(args.length ? args : [1, 1, 1]));
          break;
        case "torus":
          geo = new THREE.TorusGeometry(...(args.length ? args : [1, 0.25, 16, 32]));
          break;
        case "cone":
          geo = new THREE.ConeGeometry(...(args.length ? args : [1, 1, 20]));
          break;
        case "ring":
          geo = new THREE.RingGeometry(...(args.length ? args : [0.5, 1, 24]));
          break;
        case "capsule":
          if (typeof THREE.CapsuleGeometry === "function") {
            geo = new THREE.CapsuleGeometry(...(args.length ? args : [0.5, 1, 8, 16]));
          } else {
            geo = new THREE.CylinderGeometry(args[0] || 0.5, args[0] || 0.5, args[1] || 1, 16);
          }
          break;
        default:
          geo = new THREE.BoxGeometry(1, 1, 1);
      }
      const mat = new THREE.MeshPhysicalMaterial({
        color: p.color !== undefined ? p.color : 0x9aa5b0,
        roughness: p.roughness !== undefined ? p.roughness : 0.25,
        metalness: p.metalness !== undefined ? p.metalness : 0.25,
        clearcoat: p.clearcoat !== undefined ? p.clearcoat : 0.85,
        clearcoatRoughness: p.clearcoatRoughness !== undefined ? p.clearcoatRoughness : 0.1,
        transparent: !!p.transparent || (p.opacity !== undefined && p.opacity < 1),
        opacity: p.opacity !== undefined ? p.opacity : 1.0,
        wireframe: !!p.wireframe,
      });
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

  // 2. CPK Ball-and-stick molecules (for chemical structures and pharmacological topics)
  if (hasAtoms) {
    const sphereGeo = new THREE.SphereGeometry(1, 32, 24);
    const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
    const bondMat = new THREE.MeshPhysicalMaterial({
      color: 0xc7d0da, roughness: 0.3, metalness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.2,
    });
    const matCache = new Map();

    data.atoms.forEach(([el, x, y, z]) => {
      let mat = matCache.get(el);
      if (!mat) {
        mat = new THREE.MeshPhysicalMaterial({
          color: CPK_COLOR[el] || DEFAULT_COLOR,
          roughness: 0.14, metalness: 0.05,
          clearcoat: 1, clearcoatRoughness: 0.08,
        });
        matCache.set(el, mat);
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

  // Soft contact shadow: a translucent dark disc below the lowest point
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

  const shadowRadius = Math.max(3.4, boundingRadius * 0.85);
  const shadowGeo = new THREE.CircleGeometry(shadowRadius, 40);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = minY - 0.7;
  group.add(shadowDisc);

  const paused = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let raf;
  function tick() {
    // Self-cleaning: once this container leaves the document (the reading
    // page re-renders its innerHTML on every navigation), stop rendering
    // and release the WebGL context rather than leaking it.
    if (!container.isConnected) {
      disposeMount(container);
      return;
    }
    raf = requestAnimationFrame(tick);
    if (!paused) group.rotation.y += 0.006;
    renderer.render(scene, camera);
  }
  tick();

  mounts.set(container, { renderer, scene, raf, ro });
  return true;
}

window.KNMountMolecule3D = mountMolecule3D;
window.KNDisposeMolecule3D = disposeMount;
window.dispatchEvent(new CustomEvent("kn-molecule3d-ready"));
