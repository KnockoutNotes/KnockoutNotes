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

// Small dot-style marker — deliberately carries no numeral or text: a
// number or invented value rendered over real equipment (especially the
// ventilator's own screen) would read as fabricated data.
function makeMarkerSprite() {
  const canvas = document.createElement("canvas");
  const scale = 4;
  canvas.width = 64 * scale;
  canvas.height = 64 * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(32, 32, 12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(32, 32, 7, 0, Math.PI * 2);
  ctx.fillStyle = "#38bdf8";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#e0f2fe";
  ctx.stroke();
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, sizeAttenuation: true });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.075, 0.075, 1);
  sprite.userData.baseScale = 0.075;
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
  // Placeholder values only — overwritten by fitCameraToModel() once the
  // model has loaded and its real bounding box is known (see below). The
  // canvas is hidden behind the loading overlay until then, so nothing
  // visible is ever framed using these guesses.
  const defaultCamPos = new THREE.Vector3(1.8, 1.2, 2.1);
  const defaultTarget = new THREE.Vector3(0, 0.85, 0);
  camera.position.copy(defaultCamPos);
  let fitDistance = 2.6;

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
  // Plain click/touch-and-drag rotates the model, in any direction —
  // OrbitControls' own default behaviour.
  controls.enableRotate = true;
  // Zoom is handled ONLY by the side zoom bar (setZoomPercent/zoomStep
  // below), which sets camera.position directly and doesn't go through
  // OrbitControls at all — so this is permanently off, not toggled.
  // OrbitControls' own onMouseWheel bails out before calling
  // preventDefault() once enableZoom is false, which is what leaves normal
  // page-scroll-by-wheel working over the canvas as a side effect.
  controls.enableZoom = false;
  // No panning control is exposed anywhere in this UI (no pan reset, the
  // zoom bar only changes distance) — disabling it removes an entire class
  // of "the model silently drifted off-centre" reports from a stray
  // right-click-drag or two-finger pan, and combined with enableZoom=false
  // above, makes a two-finger touch a full no-op (see OrbitControls'
  // TOUCH.DOLLY_PAN handling: both must be false for it to bail out).
  controls.enablePan = false;
  // "pan-y" lets a vertical one-finger touch keep scrolling the page
  // normally (a horizontal one-finger drag still reaches OrbitControls to
  // rotate); it also already disables the browser's own native pinch-zoom
  // on this element, consistent with zoom being zoom-bar-only.
  renderer.domElement.style.touchAction = "pan-y";

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
    components.forEach((comp) => {
      const sprite = makeMarkerSprite();
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

  // Computes an initial camera position/target from the LOADED model's
  // actual bounding box (post frameModel scale/recentre), so the entire
  // workstation (from casters to monitor arm) is framed cleanly with generous padding.
  function fitCameraToModel() {
    const box = new THREE.Box3().setFromObject(modelGroup);
    if (box.isEmpty()) return;
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    // Visual center of mass of workstation (balancing high swing-arm monitor with wheeled base)
    defaultTarget.set(0, 0.78, 0);

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);

    // Frame the vertical height (1.70m) and effective width with generous padding
    const halfH = size.y * 0.52;
    const halfW = Math.hypot(size.x, size.z) * 0.52;
    const distV = halfH / Math.tan(vFov / 2);
    const distH = halfW / Math.tan(hFov / 2);
    const margin = 1.40; // generous breathing room around the workstation
    fitDistance = Math.max(distV, distH) * margin;

    // A balanced front-three-quarters elevated viewing perspective
    const dir = new THREE.Vector3(0.55, 0.26, 0.80).normalize();
    defaultCamPos.copy(defaultTarget).addScaledVector(dir, fitDistance);

    controls.minDistance = Math.max(1.35, fitDistance * 0.40);
    controls.maxDistance = fitDistance * 1.85;

    camera.position.copy(defaultCamPos);
    controls.target.copy(defaultTarget);
    controls.update();
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
    // Sized tightly to the decal itself (shrunk from an earlier, visibly
    // oversized rectangle — see the soft-edged texture below) so as little
    // of the surrounding housing as possible is covered.
    { position: { x: 0.158, y: 0.865, z: 0.033 }, size: { w: 0.1, d: 0.07 }, tiltX: -Math.PI / 4 },
    // Smaller circular logo mark, slightly further forward-facing (~17° off vertical).
    { position: { x: -0.064, y: 0.860, z: 0.038 }, size: { w: 0.055, d: 0.055 }, tiltX: -0.30 }
  ];

  // A soft radial-fade alpha map, rather than a hard-edged opaque plane, so
  // the patch blends into the surrounding housing instead of reading as a
  // visible rectangular sticker — the flat opaque version was clearly
  // visible as an artificial patch from a normal 3/4 viewing angle.
  function makeSoftPatchTexture() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.18, size / 2, size / 2, size * 0.5);
    grad.addColorStop(0, "rgba(238, 241, 244, 1)");
    grad.addColorStop(0.7, "rgba(238, 241, 244, 0.9)");
    grad.addColorStop(1, "rgba(238, 241, 244, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  function addBrandConcealment(root) {
    if (!BRAND_PATCHES.length) return;
    const patchTex = makeSoftPatchTexture();
    const patchMat = new THREE.MeshStandardMaterial({
      map: patchTex, transparent: true, roughness: 0.7, metalness: 0.05, side: THREE.DoubleSide, depthWrite: false
    });
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
    // A completed drag (rotation gesture) still fires a native "click" on
    // release — treat that as a drag, not a selection, so dragging never
    // also selects whatever hotspot happened to end up under the cursor.
    if (gestureDidDrag) { gestureDidDrag = false; return; }
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

  // -----------------------------------------------------------------------
  // Click-vs-drag tracking — rotation itself is a plain, always-on
  // click/touch-and-drag (OrbitControls' own default), but a drag that
  // ends over a hotspot marker must not ALSO select it: a native "click"
  // still fires on release even after real pointer movement, so this just
  // distinguishes "the user dragged to rotate" from "the user clicked" for
  // onClick below.
  // -----------------------------------------------------------------------
  let gestureStartX = 0;
  let gestureStartY = 0;
  let gestureDidDrag = false;
  const DRAG_THRESHOLD_PX = 6;

  function onStagePointerDownCapture(e) {
    gestureStartX = e.clientX;
    gestureStartY = e.clientY;
    gestureDidDrag = false;
  }

  function onStagePointerMoveCapture(e) {
    if (gestureDidDrag) return;
    const dx = e.clientX - gestureStartX;
    const dy = e.clientY - gestureStartY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) gestureDidDrag = true;
  }

  function onGesturePointerUp() {
    // gestureDidDrag also gates onClick's drag-vs-click check, for the
    // click that normally follows this same pointerup synchronously — so
    // it must still read true there (hence the deferred clear, not an
    // immediate one). A pointercancel produces no click at all, so
    // without this a canvas click dispatched with no intervening
    // pointerdown (e.g. a synthetic/programmatic one) would be silently
    // swallowed by a stale flag from an earlier cancelled gesture.
    if (gestureDidDrag) setTimeout(() => { gestureDidDrag = false; }, 0);
  }

  renderer.domElement.addEventListener("pointerdown", onStagePointerDownCapture, { capture: true });
  renderer.domElement.addEventListener("pointermove", onStagePointerMoveCapture, { capture: true });
  window.addEventListener("pointerup", onGesturePointerUp, { capture: true });
  window.addEventListener("pointercancel", onGesturePointerUp, { capture: true });

  // -----------------------------------------------------------------------
  // Zoom bar support — camera distance from target, expressed as a 0-100
  // percentage between controls.maxDistance (0) and controls.minDistance
  // (100), so the UI slider doesn't need to know actual scene units.
  // -----------------------------------------------------------------------
  function currentDistance() {
    return camera.position.distanceTo(controls.target);
  }
  function distanceToZoomPercent(dist) {
    const t = (controls.maxDistance - dist) / (controls.maxDistance - controls.minDistance);
    return THREE.MathUtils.clamp(t, 0, 1) * 100;
  }
  function zoomPercentToDistance(pct) {
    const t = THREE.MathUtils.clamp(pct, 0, 100) / 100;
    return THREE.MathUtils.lerp(controls.maxDistance, controls.minDistance, t);
  }
  function setZoomDistance(dist) {
    // Cancel any in-flight camera tween (a view-button press, or a hotspot
    // focus from the Systems Guide/Quiz) first — otherwise the tween's own
    // next step would overwrite the position this is about to set, on
    // whichever frame it happens to land on. The zoom bar must always be
    // the final word on camera distance.
    tween = null;
    const clamped = THREE.MathUtils.clamp(dist, controls.minDistance, controls.maxDistance);
    const dir = camera.position.clone().sub(controls.target);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.setLength(clamped);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  }
  function setZoomPercent(pct) { setZoomDistance(zoomPercentToDistance(pct)); }
  function getZoomPercent() { return distanceToZoomPercent(currentDistance()); }
  function zoomStep(deltaPct) { setZoomPercent(getZoomPercent() + deltaPct); }

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

  // Selecting a component (either by clicking a 3D marker or via the sidebar/panel)
  // highlights the marker, renders the info panel, and gently focuses the camera
  // without disorienting macro-zooms or compounding zoom levels.
  function focusComponent(id) {
    setActive(id);
    const m = markers.get(id);
    if (!m) return;
    if (onSelect) onSelect(id, m.comp);

    // Contextual target: gently bias target towards the component's Y height
    // while keeping X clamped near the machine centerline so the machine stays centered.
    const targetY = THREE.MathUtils.lerp(defaultTarget.y, m.sprite.position.y, 0.60);
    const targetX = THREE.MathUtils.clamp(m.sprite.position.x * 0.30, -0.16, 0.16);
    const targetZ = m.comp.view === "rear" ? -0.06 : 0.06;
    const toTarget = new THREE.Vector3(targetX, targetY, targetZ);

    // Gentle focus distance: maintains complete workstation context
    const targetDist = THREE.MathUtils.clamp(fitDistance * 0.72, 1.85, 2.35);

    // Camera orientation: if component is on front/rear and user is currently looking
    // from the opposite side, rotate to the appropriate front/rear 3/4 view.
    // Otherwise, preserve the user's current azimuth so the camera doesn't spin jarringly.
    const currentOffset = camera.position.clone().sub(controls.target);
    let dir = currentOffset.clone().normalize();

    if (m.comp.view === "front" && dir.z < 0.2) {
      const side = m.sprite.position.x >= 0 ? 0.45 : -0.45;
      dir.set(side, 0.22, 0.85).normalize();
    } else if (m.comp.view === "rear" && dir.z > -0.2) {
      const side = m.sprite.position.x >= 0 ? 0.45 : -0.45;
      dir.set(side, 0.22, -0.85).normalize();
    } else {
      dir.y = THREE.MathUtils.clamp(dir.y, 0.12, 0.35);
      dir.normalize();
    }

    const toPos = toTarget.clone().addScaledVector(dir, targetDist);
    tweenCamera(toPos, toTarget, 750);
  }

  function selectComponent(id) {
    focusComponent(id);
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
    clearSelection();
    const dir = new THREE.Vector3(0, 0.18, 1).normalize();
    tweenCamera(defaultTarget.clone().addScaledVector(dir, fitDistance), defaultTarget.clone(), 700);
  }
  function rearView() {
    clearSelection();
    const dir = new THREE.Vector3(0, 0.18, -1).normalize();
    tweenCamera(defaultTarget.clone().addScaledVector(dir, fitDistance), defaultTarget.clone(), 700);
  }
  function sideView() {
    clearSelection();
    const dir = new THREE.Vector3(1, 0.16, 0.12).normalize();
    tweenCamera(defaultTarget.clone().addScaledVector(dir, fitDistance), defaultTarget.clone(), 700);
  }

  // NOTE: found during a visual-quality audit — activateTab("explore") in
  // ventilator-ui.js calls this with amount=0 on every page load (not just
  // when the Inspect slider is touched). The old `amount < 0.999` check
  // treated that as "translucent", forcing transparent=true and
  // depthWrite=false on the ENTIRE model at rest — depth writes disabled on
  // an otherwise fully opaque model breaks correct draw-order between its
  // own overlapping geometry, which is what made the live model look
  // flatter/lower quality than the source GLB. `amount > 0.001` instead
  // treats exact 0 as "fully opaque, untouched" and only switches into the
  // transparent/no-depth-write mode once the slider has actually moved.
  function setTranslucent(amount) {
    const active = amount > 0.001;
    modelGroup.traverse(o => {
      if (!o.isMesh) return;
      if (!o.userData._origOpacity) {
        o.userData._origOpacity = o.material.opacity != null ? o.material.opacity : 1;
        o.userData._origTransparent = !!o.material.transparent;
      }
      o.material.transparent = active ? true : o.userData._origTransparent;
      o.material.opacity = THREE.MathUtils.lerp(o.userData._origOpacity, 0.18, amount);
      o.material.depthWrite = active ? false : true;
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
    // The trailing `false` here used to skip setting the canvas's own CSS
    // width/height, leaving it sized by its width/height ATTRIBUTES (which
    // setPixelRatio scales up, e.g. 2x on a Retina/HiDPI screen) instead of
    // the container's actual CSS size. With no CSS rule forcing the canvas
    // to 100%/100% either, a HiDPI canvas ended up rendered at twice the
    // container's size and got clipped by .vent-stage's overflow:hidden —
    // showing only its top-left quadrant, which put the (correctly
    // centred) model at the bottom-right corner of that visible crop. Omit
    // the flag so Three.js keeps the canvas's CSS size in sync with the
    // container on every device-pixel ratio.
    renderer.setSize(rect.width, rect.height);
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
    fitCameraToModel();
    animate();
    if (onLoaded) onLoaded({ isPlaceholder });
    return res;
  });

  window.__ventDebug = { scene, camera, controls, modelGroup, markers, defaultTarget, defaultCamPos };

  return {
    ready,
    resize,
    resetView,
    frontView,
    rearView,
    sideView,
    selectComponent,
    focusComponent,
    clearSelection,
    setTranslucent,
    setAutoRotate,
    setCalibrateMode,
    toggleFullscreen,
    isPlaceholder: () => isPlaceholder,
    setZoomPercent,
    getZoomPercent,
    zoomStep,
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("pointerdown", onStagePointerDownCapture, { capture: true });
      renderer.domElement.removeEventListener("pointermove", onStagePointerMoveCapture, { capture: true });
      window.removeEventListener("pointerup", onGesturePointerUp, { capture: true });
      window.removeEventListener("pointercancel", onGesturePointerUp, { capture: true });
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
