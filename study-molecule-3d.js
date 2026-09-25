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
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg");
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
  if (!data || !data.atoms || !data.atoms.length) return false;
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

  // Hide the flat-2D-SVG fallback without destroying it, so if WebGL context
  // is ever lost or disposed, the fallback is safely restored.
  const fallback = container.querySelector(".st-tile-structure, .st-structure-svg");
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
  // Fit the camera distance to THIS molecule's own bounding sphere (max
  // atom distance from centre + that atom's own drawn radius) rather than
  // a fixed z — bigger molecules (e.g. the bis-benzylisoquinolinium NMBs,
  // ~140 atoms) were spilling past the frame edges at a fixed distance
  // tuned for smaller ones. `fitMargin` adds breathing room around the
  // molecule; callers mounting into a small poster tile (see
  // observeTileMolecules() in study-ui.js) pass a larger margin so the
  // whole structure reads clearly small rather than filling/cropping the
  // tile, while the bigger detail-view card keeps a closer default fit.
  let boundingRadius = 0;
  data.atoms.forEach(([el, x, y, z]) => {
    const r = Math.sqrt(x * x + y * y + z * z) + (CPK_RADIUS[el] || DEFAULT_RADIUS);
    if (r > boundingRadius) boundingRadius = r;
  });
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

  const sphereGeo = new THREE.SphereGeometry(1, 32, 24);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 14);
  // MeshPhysicalMaterial's clearcoat adds the extra glassy highlight layer
  // that makes CPK spheres read as glossy plastic/glass balls rather than
  // flat-shaded circles — matching the reference image's look.
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

  // Soft contact shadow: a translucent dark disc a little below the
  // molecule's lowest atom, always facing the camera side-on relative to
  // rotation (it's a child of `group` so it spins with the molecule,
  // reading as a grounding shadow rather than a flat sticker).
  let minY = Infinity;
  data.atoms.forEach(([, , y]) => { if (y < minY) minY = y; });
  const shadowGeo = new THREE.CircleGeometry(3.4, 40);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false });
  const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisc.rotation.x = -Math.PI / 2;
  shadowDisc.position.y = minY - 0.9;
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
