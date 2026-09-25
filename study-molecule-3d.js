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

// Classic CPK ball-and-stick palette (matches the reference render: dark
// grey carbon, red oxygen, blue nitrogen, near-white hydrogen) — spheres
// sized noticeably larger relative to the bond sticks than a textbook
// space-filling model, for that glossy ball-and-stick look.
const CPK_COLOR = {
  H: 0xf1f5f9, C: 0x3f4753, N: 0x2f6fed, O: 0xe23636, S: 0xe6c119,
  Cl: 0x22c55e, F: 0x8fe38a, Br: 0x9a2f2f,
};
const CPK_RADIUS = {
  H: 0.32, C: 0.52, N: 0.5, O: 0.48, S: 0.58, Cl: 0.56, F: 0.46, Br: 0.6,
};
const DEFAULT_COLOR = 0xa78bfa;
const DEFAULT_RADIUS = 0.52;
const BOND_RADIUS = 0.1;

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
  // Clears out the flat-2D-SVG fallback content the placeholder started
  // with (see structureBodyHTML() in study-ui.js) now that the real 3D
  // viewer is confirmed working.
  container.innerHTML = "";
  container.appendChild(canvas);

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
    color: 0xb8c2cf, roughness: 0.45, metalness: 0.15, clearcoat: 0.5, clearcoatRoughness: 0.3,
  });
  const matCache = new Map();

  data.atoms.forEach(([el, x, y, z]) => {
    let mat = matCache.get(el);
    if (!mat) {
      mat = new THREE.MeshPhysicalMaterial({
        color: CPK_COLOR[el] || DEFAULT_COLOR,
        roughness: 0.22, metalness: 0.05,
        clearcoat: 0.85, clearcoatRoughness: 0.15,
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
