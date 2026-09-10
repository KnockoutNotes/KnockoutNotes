/* ==========================================================================
   KNOCKOUTNOTES — Ventilator DEVELOPMENT PLACEHOLDER geometry
   (ventilator-placeholder.js)

   This is explicitly NOT a representation of a real Boyle's machine or
   modern anaesthesia workstation. It is a generic, data-driven stand-in
   used only when no real .glb model is present at
   assets/ventilators/<machineId>/model.glb.

   It deliberately does NOT try to look like a machine (no machine-specific
   colours, no hand-placed "vaporizer-shaped" boxes, no trolley silhouette).
   Every component from ventilator-data.js becomes one identical pale
   wireframe block in an algorithmic grid layout with a floating text
   label — so it reads unmistakably as "components exist and are wired
   up" rather than "here is what the machine looks like". The engine
   (ventilator-3d.js) never imports anything machine-specific from here;
   it only calls buildPlaceholderMachine(machineId) and gets back a
   THREE.Group with correctly-named, correctly-tagged nodes — exactly the
   same contract a real .glb must satisfy (see VENTILATOR_3D_ASSET_SPEC.md).
   ========================================================================== */

import * as THREE from "./vendor/three/build/three.module.js";

const PLACEHOLDER_COLOR = 0x64748b;
const PLACEHOLDER_EDGE_COLOR = 0x94a3b8;

function makeLabelSprite(text) {
  const canvas = document.createElement("canvas");
  const scale = 4;
  canvas.width = 240 * scale;
  canvas.height = 48 * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.font = "600 13px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#e2e8f0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 120, 24, 232);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.42, 0.084, 1);
  sprite.raycast = () => {};
  return sprite;
}

/**
 * Builds an honest, non-representational development placeholder for the
 * given machine id, purely from its ventilator-data.js component list.
 * Every mesh: mesh.name = componentId, mesh.userData.componentId = componentId.
 * That is the ENTIRE contract the engine relies on — everything else
 * (system, internal, isHousing, rearView, animationId…) is joined in by
 * ventilator-3d.js's annotateFromData() from the data file, not set here,
 * so this function stays trivially simple and never duplicates data that
 * already lives in ventilator-data.js.
 */
export function buildPlaceholderMachine(machineId) {
  const machine = window.VentilatorData.machines[machineId];
  const root = new THREE.Group();
  root.name = machineId + "_placeholder_root";
  root.userData.isPlaceholder = true;

  const components = (machine && machine.components) || [];
  const cols = Math.ceil(Math.sqrt(components.length));
  const spacingX = 0.34;
  const spacingZ = 0.34;
  const baseY = 0.5;

  components.forEach((comp, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = (col - (cols - 1) / 2) * spacingX;
    const z = (row - (cols - 1) / 2) * spacingZ;
    const size = comp.internal ? 0.09 : 0.14;

    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshStandardMaterial({
      color: PLACEHOLDER_COLOR,
      metalness: 0.1,
      roughness: 0.85,
      transparent: true,
      opacity: 0.55
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = comp.id;
    mesh.userData.componentId = comp.id;
    mesh.userData.baseColor = PLACEHOLDER_COLOR;
    mesh.userData.baseOpacity = 0.55;
    mesh.userData.baseEmissive = 0x000000;
    mesh.position.set(x, baseY, z);

    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: PLACEHOLDER_EDGE_COLOR, transparent: true, opacity: 0.6 })
    );
    edges.raycast = () => {};
    mesh.add(edges);

    const label = makeLabelSprite(comp.name);
    label.position.set(0, size / 2 + 0.09, 0);
    mesh.add(label);

    root.add(mesh);
  });

  // A visible, unmissable index card floating above the block field —
  // this is the "3D asset pending" state called for in the brief, not a
  // subtle watermark that could be mistaken for finished work.
  const notice = makeLabelSprite("🚧 DEVELOPMENT PLACEHOLDER — 3D asset pending");
  notice.scale.set(1.1, 0.22, 1);
  notice.position.set(0, baseY + 0.9, 0);
  root.add(notice);

  return root;
}
