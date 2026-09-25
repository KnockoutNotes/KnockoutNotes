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

const CPK_COLOR = {
  H: 0xe5e7eb, C: 0x4b5563, N: 0x3b82f6, O: 0xef4444, S: 0xeab308,
  Cl: 0x22c55e, F: 0x86efac, Br: 0x92400e,
};
const CPK_RADIUS = {
  H: 0.26, C: 0.42, N: 0.4, O: 0.38, S: 0.48, Cl: 0.46, F: 0.36, Br: 0.5,
};
const DEFAULT_COLOR = 0xa78bfa;
const DEFAULT_RADIUS = 0.42;

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
function mountMolecule3D(container, data) {
  disposeMount(container);
  if (!data || !data.atoms || !data.atoms.length) return false;

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
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 13);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x38bdf8, 0.55);
  rim.position.set(-5, -2, -6);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const sphereGeo = new THREE.SphereGeometry(1, 16, 12);
  const cylGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.55, metalness: 0.05 });
  const matCache = new Map();

  data.atoms.forEach(([el, x, y, z]) => {
    let mat = matCache.get(el);
    if (!mat) {
      mat = new THREE.MeshStandardMaterial({ color: CPK_COLOR[el] || DEFAULT_COLOR, roughness: 0.35, metalness: 0.1 });
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
    mesh.scale.set(0.13, len, 0.13);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(up, end.clone().sub(start).normalize());
    group.add(mesh);
  });

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
