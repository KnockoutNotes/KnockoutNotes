/* ==========================================================================
   KNOCKOUTNOTES — Ventilator 3D Engine (ventilator-3d.js)
   Real WebGL/Three.js scene: camera, controls, raycasting.

   ASSET-READY ARCHITECTURE — read this before touching this file.

   This engine has ZERO knowledge of what a Boyle's machine or a modern
   workstation actually looks like. It only knows how to:
     1. load a named 3D model for a given machineId (loadMachineModel),
     2. join every node whose name matches a componentId in
        ventilator-data.js with that component's metadata
        (annotateFromData),
     3. group tagged nodes by their "system" field into synthetic groups
        for exploded view (groupBySystem),
     4. raycast, highlight, focus the camera, tween the camera, animate a
        gas-flow particle system along named nodes' world positions, and
        toggle exploded/X-ray view — all driven purely by componentId /
        system / internal metadata, never by hard-coded mesh names.

   loadMachineModel(machineId) is the ONE place that decides where geometry
   comes from: it tries assets/ventilators/<machineId>/model.glb first, and
   falls back to the honest, clearly-labelled development placeholder in
   ventilator-placeholder.js if no real model exists yet. Dropping in a
   real .glb whose mesh names match the componentId values in
   ventilator-data.js requires NO changes to this file. See
   VENTILATOR_3D_ASSET_SPEC.md for the full node/metadata contract and the
   exact node list required per machine.
   ========================================================================== */

import * as THREE from "./vendor/three/build/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";
import { buildPlaceholderMachine } from "./ventilator-placeholder.js";

const CYAN = 0x38bdf8;
const AMBER = 0xfbbf24;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Asset-loading layer — the only code that knows about .glb paths or the
// placeholder fallback. Everything below (the engine) just receives a
// THREE.Group of correctly-named nodes and doesn't care where it came from.
// ---------------------------------------------------------------------------

function tryLoadGLB(machineId) {
  return new Promise(resolve => {
    const loader = new GLTFLoader();
    const url = "assets/ventilators/" + machineId + "/model.glb";
    loader.load(url, gltf => resolve(gltf.scene), undefined, () => resolve(null));
  });
}

/**
 * Resolves to { group, isPlaceholder }. Real .glb nodes may carry their own
 * userData via glTF "extras" (GLTFLoader maps a node's extras object onto
 * object.userData automatically) — annotateFromData() below still applies
 * ventilator-data.js as the source of truth for every field except
 * componentId itself (read from extras.componentId if present, else the
 * node's name), so a modelling tool that can't author custom extras can
 * rely on node NAMING ALONE and still work correctly.
 */
function loadMachineModel(machineId) {
  return tryLoadGLB(machineId).then(gltfGroup => {
    if (gltfGroup) return { group: gltfGroup, isPlaceholder: false };
    return { group: buildPlaceholderMachine(machineId), isPlaceholder: true };
  });
}

/** Joins every named node to its ventilator-data.js component record. */
function annotateFromData(root, machineId) {
  const machine = window.VentilatorData.machines[machineId];
  const byId = {};
  (machine ? machine.components : []).forEach(c => { byId[c.id] = c; });
  root.traverse(o => {
    if (!o.isMesh) return;
    const id = o.userData.componentId || o.name;
    const data = byId[id];
    if (!data) return; // decorative/non-interactive node — never raycastable
    o.name = id;
    o.userData.componentId = id;
    o.userData.system = data.system || "frame";
    o.userData.internal = !!data.internal;
    o.userData.isHousing = !!data.isHousing;
    o.userData.rearView = !!data.rearView;
    o.userData.animationId = data.animationId || null;
    if (o.userData.baseOpacity == null) o.userData.baseOpacity = o.material.opacity != null ? o.material.opacity : 1;
    if (o.userData.baseEmissive == null) o.userData.baseEmissive = 0x000000;
  });
}

/**
 * Regroups every annotated mesh under a synthetic per-system THREE.Group
 * (created fresh each load, attached directly under root) using
 * Object3D.attach(), which preserves each mesh's world transform during
 * reparenting — so this works identically whether the source hierarchy is
 * the flat placeholder or an arbitrarily-nested real .glb. Exploded view
 * then just translates these groups; nothing else needs to know how the
 * model was originally organised.
 */
function groupBySystem(root) {
  const groups = {};
  const meshes = [];
  root.traverse(o => { if (o.isMesh && o.userData.componentId) meshes.push(o); });
  meshes.forEach(mesh => {
    const key = mesh.userData.system || "frame";
    if (!groups[key]) {
      const g = new THREE.Group();
      g.name = "sys_" + key;
      root.add(g);
      groups[key] = g;
    }
    groups[key].attach(mesh);
  });
  Object.values(groups).forEach(g => { g.userData.homePosition = g.position.clone(); });
  return groups;
}

/**
 * Fills in generic per-node animation state that a real .glb's own extras
 * could override but doesn't have to: a "drawer" node gets a default
 * open/close slide offset, and any node whose animationId is
 * "ventilator-cycle" gets its resting Y position captured so the breathing
 * animation has a baseline to oscillate around. Collected into
 * root.userData for the render loop to consume without re-traversing.
 */
function setupDefaultAnimationState(root) {
  const ventilatorCycleMeshes = [];
  root.traverse(o => {
    if (!o.isMesh || !o.userData.componentId) return;
    if (o.userData.system === "drawer" && !o.userData.openOffset) {
      o.userData.homePosition = o.position.clone();
      o.userData.openOffset = new THREE.Vector3(0, 0, 0.4);
    }
    if (o.userData.animationId === "ventilator-cycle") {
      o.userData.homeY = o.position.y;
      ventilatorCycleMeshes.push(o);
    }
  });
  root.userData.ventilatorCycleMeshes = ventilatorCycleMeshes;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function createEngine(container) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x030712);
  scene.fog = new THREE.Fog(0x030712, 6, 14);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100);
  camera.position.set(0, 1.5, 4.2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reduceMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.6;
  controls.maxDistance = 8;
  controls.minPolarAngle = 0.35;          // constrained vertical rotation —
  controls.maxPolarAngle = Math.PI - 0.35; // never flips under the floor
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.panSpeed = 0.6;
  controls.target.set(0, 1.0, 0);
  controls.update();

  // Limited pan: clamp the orbit target to a small box around the machine
  // so the user can nudge the framing but never "fly away" from the model.
  const PAN_LIMIT = 1.4;
  const homeTarget = new THREE.Vector3(0, 1.0, 0);
  controls.addEventListener("change", () => {
    controls.target.x = THREE.MathUtils.clamp(controls.target.x, homeTarget.x - PAN_LIMIT, homeTarget.x + PAN_LIMIT);
    controls.target.y = THREE.MathUtils.clamp(controls.target.y, homeTarget.y - PAN_LIMIT * 0.6, homeTarget.y + PAN_LIMIT * 0.6);
    controls.target.z = THREE.MathUtils.clamp(controls.target.z, homeTarget.z - PAN_LIMIT, homeTarget.z + PAN_LIMIT);
  });

  const ambient = new THREE.AmbientLight(0xaecbff, 0.55);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(2.5, 4, 3);
  scene.add(key);
  const rim = new THREE.DirectionalLight(CYAN, 0.35);
  rim.position.set(-3, 2, -2);
  scene.add(rim);

  const grid = new THREE.GridHelper(6, 24, 0x1e293b, 0x0f172a);
  grid.position.y = 0.001;
  grid.material.transparent = true;
  grid.material.opacity = 0.35;
  scene.add(grid);

  let machineGroup = null;
  let machineId = null;
  const hoverState = { mesh: null };
  const selectState = { mesh: null };
  const dimmed = new Set();
  let exploded = false;
  let xray = false;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoverCallbacks = [];
  const clickCallbacks = [];

  function pickableMeshes() {
    if (!machineGroup) return [];
    const list = [];
    machineGroup.traverse(o => { if (o.isMesh && o.userData.componentId) list.push(o); });
    return list;
  }

  function setPointerFromEvent(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
  }

  function raycastPick() {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickableMeshes(), false);
    return hits.length ? hits[0].object : null;
  }

  function applyHover(mesh) {
    if (hoverState.mesh === mesh) return;
    if (hoverState.mesh && hoverState.mesh !== selectState.mesh) {
      hoverState.mesh.material.emissive && hoverState.mesh.material.emissive.setHex(hoverState.mesh.userData.baseEmissive || 0x000000);
      hoverState.mesh.material.emissiveIntensity = hoverState.mesh.userData.baseEmissiveIntensity || 0;
      hoverState.mesh.scale.setScalar(1);
    }
    hoverState.mesh = mesh;
    if (mesh) {
      if (!mesh.material.emissive) mesh.material.emissive = new THREE.Color(0x000000);
      mesh.userData.baseEmissiveIntensity = mesh.material.emissiveIntensity || 0;
      mesh.material.emissive.setHex(CYAN);
      mesh.material.emissiveIntensity = 0.55;
      mesh.scale.setScalar(1.04);
    }
    hoverCallbacks.forEach(cb => cb(mesh));
  }

  function applySelect(mesh) {
    if (selectState.mesh && selectState.mesh !== mesh) {
      selectState.mesh.material.emissive && selectState.mesh.material.emissive.setHex(selectState.mesh.userData.baseEmissive || 0x000000);
      selectState.mesh.material.emissiveIntensity = selectState.mesh.userData.baseEmissiveIntensity || 0;
    }
    selectState.mesh = mesh;
    if (mesh) {
      if (!mesh.material.emissive) mesh.material.emissive = new THREE.Color(0x000000);
      mesh.material.emissive.setHex(AMBER);
      mesh.material.emissiveIntensity = 0.7;
    }
  }

  function onPointerMove(e) {
    setPointerFromEvent(e);
    const hit = raycastPick();
    applyHover(hit);
  }
  function onClick(e) {
    setPointerFromEvent(e);
    const hit = raycastPick();
    if (hit) {
      applySelect(hit);
      clickCallbacks.forEach(cb => cb(hit));
    }
  }
  renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
  renderer.domElement.addEventListener("click", onClick);

  // ---- Camera tweening (used by focus / reset / rear / side / tour) ----
  let tween = null;
  function tweenCamera(toPos, toTarget, duration) {
    if (reduceMotion) duration = 1;
    const fromPos = camera.position.clone();
    const fromTarget = controls.target.clone();
    const start = performance.now();
    tween = { fromPos, toPos: toPos.clone(), fromTarget, toTarget: toTarget.clone(), start, duration: duration || 800 };
  }
  function stepTween() {
    if (!tween) return;
    const t = Math.min(1, (performance.now() - tween.start) / tween.duration);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(tween.fromPos, tween.toPos, e);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, e);
    if (t >= 1) tween = null;
  }

  function boundsOf(object3D) {
    const box = new THREE.Box3().setFromObject(object3D);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    return { box, size, center };
  }

  function focusOnComponent(idOrMesh, opts) {
    opts = opts || {};
    const mesh = typeof idOrMesh === "string" ? getComponentMesh(idOrMesh) : idOrMesh;
    if (!mesh) return;
    const { center, size } = boundsOf(mesh);
    const radius = Math.max(size.x, size.y, size.z, 0.08);
    const dist = Math.max(0.5, radius * (opts.distanceFactor || 6));
    const dir = new THREE.Vector3(0.6, 0.35, 1).normalize();
    const toPos = center.clone().add(dir.multiplyScalar(dist));
    tweenCamera(toPos, center, opts.duration || 700);
  }

  function resetView() {
    const preset = window.VentilatorData.machines[machineId].cameraPresets.front;
    tweenCamera(new THREE.Vector3(...preset.position), new THREE.Vector3(...preset.target), 700);
  }
  function rearView() {
    const preset = window.VentilatorData.machines[machineId].cameraPresets.rear;
    tweenCamera(new THREE.Vector3(...preset.position), new THREE.Vector3(...preset.target), 900);
  }
  function sideView() {
    const preset = window.VentilatorData.machines[machineId].cameraPresets.side;
    tweenCamera(new THREE.Vector3(...preset.position), new THREE.Vector3(...preset.target), 900);
  }

  function toggleFullscreen() {
    const el = container.closest(".vent-stage") || container;
    if (!document.fullscreenElement) el.requestFullscreen && el.requestFullscreen().catch(() => {});
    else document.exitFullscreen && document.exitFullscreen().catch(() => {});
  }

  function getComponentMesh(id) {
    if (!machineGroup) return null;
    let found = null;
    machineGroup.traverse(o => { if (!found && o.userData.componentId === id) found = o; });
    return found;
  }
  function getComponentIds() {
    return pickableMeshes().map(m => m.userData.componentId);
  }

  function clearDim() {
    dimmed.forEach(m => {
      m.material.opacity = m.userData.baseOpacity;
      m.material.transparent = m.userData.baseOpacity < 1;
    });
    dimmed.clear();
  }
  function dimAllExcept(ids) {
    clearDim();
    const keep = new Set(ids);
    machineGroup.traverse(o => {
      if (o.isMesh && o.userData.componentId && !keep.has(o.userData.componentId)) {
        o.material.transparent = true;
        o.material.opacity = 0.08;
        dimmed.add(o);
      }
    });
  }
  const highlighted = new Set();
  function clearHighlight() {
    highlighted.forEach(m => {
      if (m.material.emissive) m.material.emissive.setHex(m.userData.baseEmissive || 0x000000);
      m.material.emissiveIntensity = m.userData.baseEmissiveIntensity2 || 0;
    });
    highlighted.clear();
  }
  function highlightComponents(ids, opts) {
    opts = opts || {};
    const color = opts.color || CYAN;
    ids.forEach(id => {
      const m = getComponentMesh(id);
      if (!m) return;
      if (!m.material.emissive) m.material.emissive = new THREE.Color(0x000000);
      m.userData.baseEmissiveIntensity2 = m.material.emissiveIntensity || 0;
      m.material.emissive.setHex(color);
      m.material.emissiveIntensity = opts.intensity != null ? opts.intensity : 0.6;
      highlighted.add(m);
    });
  }

  function setExploded(on) {
    exploded = on;
    if (!machineGroup) return;
    const subs = machineGroup.userData.systems;
    const center = new THREE.Vector3(0, 0.5, 0);
    Object.values(subs).forEach(g => {
      const home = g.userData.homePosition;
      if (on) {
        const dir = home.clone().sub(center);
        if (dir.lengthSq() < 0.0001) dir.set(Math.random() - 0.5, 0.3, Math.random() - 0.5);
        dir.normalize();
        const target = home.clone().add(dir.multiplyScalar(0.55));
        target.y += 0.15;
        g.userData.explodeTarget = target;
      } else {
        g.userData.explodeTarget = home.clone();
      }
      g.userData.explodeStart = g.position.clone();
      g.userData.explodeT0 = performance.now();
    });
  }

  function setXray(on) {
    xray = on;
    if (!machineGroup) return;
    machineGroup.traverse(o => {
      if (!o.isMesh) return;
      if (o.userData.isHousing) {
        o.material.transparent = true;
        o.material.opacity = on ? 0.12 : o.userData.baseOpacity;
      } else if (o.userData.internal) {
        if (!o.material.emissive) o.material.emissive = new THREE.Color(0x000000);
        o.material.emissiveIntensity = on ? 0.35 : (o.userData.baseEmissiveIntensity || 0);
      }
    });
  }

  // ---- Flow particle system: moves small spheres along the world-space
  // path formed by a component-id sequence. Educational visual only. ----
  function createFlow(ids, color) {
    const points = ids.map(id => {
      const m = getComponentMesh(id);
      if (!m) return null;
      const p = new THREE.Vector3();
      m.getWorldPosition(p);
      return p;
    }).filter(Boolean);
    if (points.length < 2) return { play(){}, pause(){}, setSpeed(){}, reset(){}, dispose(){} };

    const curve = new THREE.CatmullRomCurve3(points);
    const group = new THREE.Group();
    const N = 10;
    const particles = [];
    const geo = new THREE.SphereGeometry(0.015, 8, 8);
    for (let i = 0; i < N; i++) {
      const mat = new THREE.MeshBasicMaterial({ color: color || CYAN, transparent: true, opacity: 0.9 });
      const p = new THREE.Mesh(geo, mat);
      p.raycast = () => {};
      p.userData.t = i / N;
      group.add(p);
      particles.push(p);
    }
    scene.add(group);

    let playing = true;
    let speed = 1;
    function tick(dt) {
      if (!playing) return;
      particles.forEach(p => {
        p.userData.t = (p.userData.t + dt * 0.18 * speed) % 1;
        const pos = curve.getPointAt(p.userData.t);
        p.position.copy(pos);
      });
    }
    flowSystems.push(tick);
    return {
      play() { playing = true; },
      pause() { playing = false; },
      setSpeed(mult) { speed = mult; },
      reset() { particles.forEach((p, i) => { p.userData.t = i / N; }); },
      dispose() {
        const idx = flowSystems.indexOf(tick);
        if (idx >= 0) flowSystems.splice(idx, 1);
        scene.remove(group);
      }
    };
  }
  const flowSystems = [];

  function clearMachine() {
    if (!machineGroup) return;
    scene.remove(machineGroup);
    machineGroup.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
    machineGroup = null;
  }

  let machineIsPlaceholder = false;

  function init(id) {
    clearMachine();
    machineId = id;
    return loadMachineModel(id).then(({ group, isPlaceholder }) => {
      machineGroup = group;
      machineIsPlaceholder = isPlaceholder;
      machineGroup.userData.machineId = id;
      annotateFromData(machineGroup, id);
      machineGroup.userData.systems = groupBySystem(machineGroup);
      setupDefaultAnimationState(machineGroup);

      // The system layout isn't symmetric around the local origin (gas
      // supply/absorber/bag sit off to one side on the placeholder, and a
      // real .glb's own origin is unknown in advance), so recentre the
      // whole group in X/Z on its actual bounding box — otherwise the
      // camera presets (which target world 0,y,0) frame empty space next
      // to the machine instead of the machine itself. Floor (Y) is left
      // alone so the model still stands on the grid at y=0.
      const box = new THREE.Box3().setFromObject(machineGroup);
      const center = new THREE.Vector3();
      box.getCenter(center);
      machineGroup.position.x -= center.x;
      machineGroup.position.z -= center.z;
      scene.add(machineGroup);
      resetView();
      return machineGroup;
    });
  }

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  let lastT = performance.now();
  function animate() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    stepTween();
    if (machineGroup) {
      Object.values(machineGroup.userData.systems || {}).forEach(g => {
        if (g.userData.explodeTarget) {
          const t = Math.min(1, (now - g.userData.explodeT0) / 600);
          g.position.lerpVectors(g.userData.explodeStart, g.userData.explodeTarget, easeInOutCubic(t));
        }
      });
      // Drawer slide animation
      machineGroup.traverse(o => {
        if (o.userData.openOffset && o.userData.slideT0 != null) {
          const t = Math.min(1, (now - o.userData.slideT0) / 700);
          const target = o.userData.opening ? o.userData.homePosition.clone().add(o.userData.openOffset) : o.userData.homePosition.clone();
          o.position.lerpVectors(o.userData.slideFrom, target, easeInOutCubic(t));
        }
      });
      // Ventilator breathing motion — drives every node tagged
      // animationId:"ventilator-cycle" (e.g. a bellows or piston), found
      // generically at load time, not a hard-coded mesh reference.
      if (machineGroup.userData.ventilatorRunning) {
        const phase = (now / 1000) * (machineGroup.userData.ventRate || 0.25);
        const cycle = phase % 1;
        const insp = cycle < 0.4 ? cycle / 0.4 : 1 - (cycle - 0.4) / 0.6;
        (machineGroup.userData.ventilatorCycleMeshes || []).forEach(b => {
          b.position.y = b.userData.homeY - insp * 0.05;
        });
      }
    }
    flowSystems.forEach(fn => fn(dt));
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  function openDrawer(id, open) {
    const mesh = getComponentMesh(id);
    if (!mesh || !mesh.userData.openOffset) return;
    mesh.userData.opening = open;
    mesh.userData.slideFrom = mesh.position.clone();
    mesh.userData.slideT0 = performance.now();
  }

  function setVentilatorRunning(on, rate) {
    if (!machineGroup) return;
    machineGroup.userData.ventilatorRunning = on;
    if (rate) machineGroup.userData.ventRate = rate;
  }

  return {
    scene, camera, renderer, controls,
    init, dispose: clearMachine,
    onHover(cb) { hoverCallbacks.push(cb); },
    onClick(cb) { clickCallbacks.push(cb); },
    focusOnComponent, resetView, rearView, sideView, toggleFullscreen,
    setExploded, setXray, highlightComponents, clearHighlight, dimAllExcept, clearDim,
    createFlow, getComponentMesh, getComponentIds, applySelect,
    openDrawer, setVentilatorRunning,
    projectToScreen(id) {
      const mesh = getComponentMesh(id);
      if (!mesh) return null;
      const world = new THREE.Vector3();
      mesh.getWorldPosition(world);
      const proj = world.clone().project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      return { x: rect.left + (proj.x * 0.5 + 0.5) * rect.width, y: rect.top + (-proj.y * 0.5 + 0.5) * rect.height };
    },
    getMachineId: () => machineId,
    isPlaceholder: () => machineIsPlaceholder,
    getMachineGroup: () => machineGroup
  };
}
