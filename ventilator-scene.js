/* ==========================================================================
   KNOCKOUTNOTES — Anaesthesia Workstation 3D scene (ventilator-scene.js)

   A small, self-contained Three.js scene: loads assets/models/ventilatormodel.glb
   if present, falls back to a clearly-labelled generic stand-in silhouette
   if it is missing or fails to load. Hotspots are NOT dependent on named
   mesh nodes inside the .glb — the supplied model may be a single, unnamed,
   uncoloured mesh, so every interactive point is a small marker object
   positioned in the scene by coordinates from ventilator-data.js, raycast
   independently of whatever geometry sits underneath it. This means the
   feature works whether the .glb turns out to have rich named sub-meshes
   or is one flat blob — no code changes needed either way, only the marker
   coordinates might need re-tuning (see the calibration mode below).
   ========================================================================== */

import * as THREE from "three";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "./vendor/three/examples/jsm/loaders/DRACOLoader.js";

// The real workstation .glb is exported with required Draco geometry
// compression (KHR_draco_mesh_compression) — GLTFLoader refuses to load it
// without a DRACOLoader attached. One decoder instance is shared across
// loads; the decoder files are vendored locally, same as the rest of Three.js.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./vendor/three/examples/jsm/libs/draco/gltf/");

const MARKER_COLOR = 0x38bdf8;
const MARKER_ACTIVE_COLOR = 0xfbbf24;
const MARKER_HOVER_COLOR = 0x7dd3fc;
const TARGET_HEIGHT = 1.7; // normalized model space every hotspot coordinate assumes

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function makeMarkerSprite(index) {
  const canvas = document.createElement("canvas");
  const scale = 4;
  canvas.width = 64 * scale;
  canvas.height = 64 * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(32, 32, 26, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#38bdf8";
  ctx.stroke();
  ctx.font = "700 26px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#e0f2fe";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(index + 1), 32, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.11, 0.11, 1);
  sprite.userData.baseScale = 0.11;
  return sprite;
}

/** Generic, non-representational stand-in silhouette (see project README for context on why). */
function buildPlaceholderMachine() {
  const root = new THREE.Group();
  root.name = "workstation_placeholder";
  root.userData.isPlaceholder = true;

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.25, roughness: 0.7 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.2, roughness: 0.8 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.1, roughness: 0.3, emissive: 0x0369a1, emissiveIntensity: 0.4 });

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.12, 0.5), darkMat);
  base.position.set(0, 0.06, 0);
  root.add(base);

  [[-0.24, 0.28], [0.24, 0.28], [-0.24, -0.28], [0.24, -0.28]].forEach(([x, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16), darkMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, 0.04, z);
    root.add(wheel);
  });

  const column = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.85, 0.4), bodyMat);
  column.position.set(0, 0.55, 0.02);
  root.add(column);

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.22), bodyMat);
  head.position.set(0, 1.13, 0.12);
  root.add(head);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.02), glassMat);
  screen.position.set(0, 1.16, 0.24);
  root.add(screen);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.3), darkMat);
  shelf.position.set(0, 0.48, 0.32);
  root.add(shelf);

  [-0.06, 0.06].forEach(x => {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 16), new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5, roughness: 0.4 }));
    cyl.position.set(x, 0.55, -0.36);
    root.add(cyl);
  });

  root.traverse(o => { if (o.isMesh) { o.userData.isPlaceholderMesh = true; } });
  return root;
}

export function createWorkstationScene(container, opts) {
  const { modelUrl, components, onSelect, onHover, onLoaded } = opts;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 50);
  const defaultCamPos = new THREE.Vector3(1.55, 1.15, 1.85);
  const defaultTarget = new THREE.Vector3(0, 0.75, 0);
  camera.position.copy(defaultCamPos);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 0.6;
  controls.maxDistance = 5.5;
  controls.maxPolarAngle = Math.PI * 0.49 + 0.35;
  controls.target.copy(defaultTarget);

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2.5, 4, 2.5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x38bdf8, 0.5);
  rim.position.set(-3, 1.5, -2);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 48),
    new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.95, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = false;
  scene.add(floor);

  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  const markerGroup = new THREE.Group();
  scene.add(markerGroup);

  const markers = new Map(); // id -> { sprite, hit, comp }
  let isPlaceholder = true;
  let activeId = null;
  let hoveredId = null;
  let calibrateMode = false;

  function buildMarkers() {
    markerGroup.clear();
    markers.clear();
    components.forEach((comp, i) => {
      const sprite = makeMarkerSprite(i);
      sprite.position.set(comp.position.x, comp.position.y, comp.position.z);
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hit.position.copy(sprite.position);
      hit.userData.componentId = comp.id;
      markerGroup.add(sprite);
      markerGroup.add(hit);
      markers.set(comp.id, { sprite, hit, comp });
    });
  }
  buildMarkers();

  function frameModel(object3D) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3();
    box.getSize(size);
    const height = Math.max(size.y, 0.001);
    const scale = TARGET_HEIGHT / height;
    object3D.scale.setScalar(scale);
    box.setFromObject(object3D);
    const center = new THREE.Vector3();
    box.getCenter(center);
    object3D.position.x -= center.x;
    object3D.position.z -= center.z;
    object3D.position.y -= box.min.y;
  }

  // ---------------------------------------------------------------------
  // Branding concealment — the supplied .glb's texture carries a faint
  // manufacturer-style decal baked into the artwork on the beveled edge
  // between the top and front faces of the housing (confirmed by directly
  // raycasting the visible decal in the model's own, untransformed local
  // space — NOT a flat top-down guess). Per instructions we must not
  // re-export/edit the source asset, so this adds small opaque, colour-
  // matched patch meshes ON TOP of the known decal regions — a concealment
  // overlay, not a modification of the GLB itself.
  //
  // Coordinates and surface normals below are in the loaded root's OWN
  // local space (i.e. added as children of `root`, before frameModel's
  // scale/recentre is applied) so they scale and move with the model
  // automatically — no manual space conversion required.
  // ---------------------------------------------------------------------
  const BRAND_PATCHES = [
    // Main decal/text, on the ~45° bevel between top and front faces.
    { position: { x: 0.158, y: 0.865, z: 0.033 }, size: { w: 0.13, d: 0.09 }, tiltX: -Math.PI / 4 },
    // Smaller circular logo mark, slightly further forward-facing (~17° off vertical).
    { position: { x: -0.064, y: 0.860, z: 0.038 }, size: { w: 0.07, d: 0.07 }, tiltX: -0.30 }
  ];

  function addBrandConcealment(root) {
    if (!BRAND_PATCHES.length) return;
    const patchMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.75, metalness: 0.05, side: THREE.DoubleSide });
    BRAND_PATCHES.forEach(p => {
      const geo = new THREE.PlaneGeometry(p.size.w, p.size.d);
      const mesh = new THREE.Mesh(geo, patchMat);
      mesh.position.set(p.position.x, p.position.y, p.position.z);
      mesh.rotation.x = p.tiltX;
      mesh.renderOrder = 1;
      mesh.raycast = () => {}; // decorative only — never intercepts hotspot/calibration picking
      root.add(mesh);
    });
  }

  function loadModel() {
    return new Promise(resolve => {
      if (!modelUrl) { resolve({ isPlaceholder: true }); return; }
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      loader.load(
        modelUrl,
        gltf => {
          const root = gltf.scene || gltf.scenes[0];
          addBrandConcealment(root);
          frameModel(root);
          modelGroup.add(root);
          resolve({ isPlaceholder: false, root });
        },
        undefined,
        () => {
          const placeholder = buildPlaceholderMachine();
          modelGroup.add(placeholder);
          resolve({ isPlaceholder: true, root: placeholder });
        }
      );
    });
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function hitTargets() {
    return Array.from(markers.values()).filter(m => m.sprite.visible).map(m => m.hit);
  }

  // A marker for a front-tagged (resp. rear-tagged) component only makes
  // sense while the camera is actually looking from roughly that side —
  // otherwise (sprites ignore depth testing so they stay visible/clickable
  // through the mesh) it would appear to sit on top of whatever unrelated
  // geometry happens to be facing the camera instead. Side-on views keep
  // everything visible since both faces are reasonably in view there.
  const SIDE_DEADZONE = 0.35;
  function updateMarkerVisibility() {
    const camZ = camera.position.z - defaultTarget.z;
    markers.forEach(m => {
      const view = m.comp.view;
      let visible = true;
      if (view === "front") visible = camZ > -SIDE_DEADZONE;
      else if (view === "rear") visible = camZ < SIDE_DEADZONE;
      m.sprite.visible = visible;
      m.hit.visible = visible;
    });
  }

  function setPointer(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function pick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hitTargets(), false);
    return hits.length ? hits[0].object.userData.componentId : null;
  }

  function pickSurface() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(modelGroup.children, true);
    return hits.length ? hits[0] : null;
  }

  function setHover(id) {
    if (hoveredId === id) return;
    hoveredId = id;
    markers.forEach((m, mid) => {
      const color = mid === activeId ? MARKER_ACTIVE_COLOR : mid === id ? MARKER_HOVER_COLOR : MARKER_COLOR;
      // sprite colour is baked into its texture; tint via material color instead for cheap hover feedback
      m.sprite.material.color.setHex(color === MARKER_COLOR ? 0xffffff : color);
    });
    if (onHover) onHover(id, id ? markers.get(id).comp : null);
  }

  function setActive(id) {
    activeId = id;
    markers.forEach((m, mid) => {
      m.sprite.material.color.setHex(mid === activeId ? MARKER_ACTIVE_COLOR : 0xffffff);
    });
  }

  function onPointerMove(e) {
    setPointer(e);
    const id = pick();
    renderer.domElement.style.cursor = id ? "pointer" : calibrateMode ? "crosshair" : "grab";
    setHover(id);
  }

  function onClick(e) {
    setPointer(e);
    const id = pick();
    if (id) { selectComponent(id); return; }
    if (calibrateMode) {
      const hit = pickSurface();
      if (hit) {
        const local = hit.point.clone();
        // eslint-disable-next-line no-console
        console.log(`[calibrate] position: { x: ${local.x.toFixed(3)}, y: ${local.y.toFixed(3)}, z: ${local.z.toFixed(3)} }`);
        window.dispatchEvent(new CustomEvent("vent:calibrate-point", { detail: local }));
      }
    }
  }

  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("click", onClick);

  // --- Camera tweening ---
  let tween = null;
  function tweenCamera(toPos, toTarget, duration = 900) {
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    const d = reduceMotion ? 1 : duration;
    tween = { start, d, fromPos, fromTarget, toPos, toTarget };
  }
  function stepTween() {
    if (!tween) return;
    const t = Math.min(1, (performance.now() - tween.start) / tween.d);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (t >= 1) tween = null;
  }

  function selectComponent(id) {
    setActive(id);
    const m = markers.get(id);
    if (!m) return;
    const dir = m.sprite.position.clone().sub(defaultTarget).normalize();
    const toPos = m.sprite.position.clone().add(dir.multiplyScalar(0.75)).add(new THREE.Vector3(0, 0.15, 0));
    tweenCamera(toPos, m.sprite.position.clone(), 850);
    if (onSelect) onSelect(id, m.comp);
  }

  function clearSelection() {
    activeId = null;
    markers.forEach(m => m.sprite.material.color.setHex(0xffffff));
  }

  function resetView() {
    clearSelection();
    tweenCamera(defaultCamPos.clone(), defaultTarget.clone(), 700);
  }
  function frontView() {
    tweenCamera(new THREE.Vector3(0, 1.1, 2.2), new THREE.Vector3(0, 0.75, 0), 700);
  }
  function rearView() {
    tweenCamera(new THREE.Vector3(0, 1.1, -2.2), new THREE.Vector3(0, 0.75, 0), 700);
  }
  function sideView() {
    tweenCamera(new THREE.Vector3(2.3, 1.05, 0), new THREE.Vector3(0, 0.75, 0), 700);
  }

  function setTranslucent(amount) {
    modelGroup.traverse(o => {
      if (!o.isMesh) return;
      if (!o.userData._origOpacity) {
        o.userData._origOpacity = o.material.opacity != null ? o.material.opacity : 1;
        o.userData._origTransparent = !!o.material.transparent;
      }
      o.material.transparent = amount < 0.999 ? true : o.userData._origTransparent;
      o.material.opacity = THREE.MathUtils.lerp(o.userData._origOpacity, 0.18, amount);
      o.material.depthWrite = amount < 0.999 ? false : true;
    });
  }

  function setAutoRotate(on) {
    controls.autoRotate = on && !reduceMotion;
    controls.autoRotateSpeed = 0.6;
  }

  function setCalibrateMode(on) { calibrateMode = on; }

  function toggleFullscreen() {
    const el = container.closest(".vent-stage") || container;
    if (!document.fullscreenElement) { el.requestFullscreen && el.requestFullscreen().catch(() => {}); }
    else { document.exitFullscreen && document.exitFullscreen().catch(() => {}); }
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(rect.width, rect.height, false);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let raf = null;
  function animate() {
    raf = requestAnimationFrame(animate);
    stepTween();
    controls.update();
    updateMarkerVisibility();
    markers.forEach((m, id) => {
      const scale = m.sprite.userData.baseScale * (id === activeId ? 1.25 + Math.sin(performance.now() / 220) * 0.08 : 1);
      m.sprite.scale.set(scale, scale, 1);
    });
    renderer.render(scene, camera);
  }

  let ready = loadModel().then(res => {
    isPlaceholder = res.isPlaceholder;
    resize();
    animate();
    if (onLoaded) onLoaded({ isPlaceholder });
    return res;
  });

  return {
    ready,
    resize,
    resetView,
    frontView,
    rearView,
    sideView,
    selectComponent,
    clearSelection,
    setTranslucent,
    setAutoRotate,
    setCalibrateMode,
    toggleFullscreen,
    isPlaceholder: () => isPlaceholder,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
