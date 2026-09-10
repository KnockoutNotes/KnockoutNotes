/* ==========================================================================
   KNOCKOUTNOTES — Ventilator 3D Engine (ventilator-3d.js)
   Real WebGL/Three.js scene: camera, controls, raycasting, machine builders.

   Placeholder-geometry architecture: each machine is built from simple
   primitives, but every interactive part is a uniquely-named Object3D
   (mesh.name === componentId, matching ventilator-data.js) with
   mesh.userData populated the same way a real GLB's named nodes would be.
   buildMachine() tries to load assets/ventilators/<id>/model.glb first and
   falls back to the procedural placeholder if none exists, so a real model
   can be dropped in later without touching the interaction/animation code —
   only the node names in the .glb need to match the componentId values.
   ========================================================================== */

import * as THREE from "./vendor/three/build/three.module.js";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "./vendor/three/examples/jsm/loaders/GLTFLoader.js";

const CYAN = 0x38bdf8;
const AMBER = 0xfbbf24;
const HOUSING_GREY = 0xdfe4ec;
const BOYLES_BLUE = 0x2f5fa8;
const VAPORIZER_A = 0xf0c419; // agent-colour convention varies by manufacturer/agent — illustrative only
const VAPORIZER_B = 0xcc3a3a;
const ABSORBENT_COLOR = 0xf1d9d6; // fresh soda-lime granule tone — colour-change indicator is product-dependent
const CYLINDER_COLORS = { O2: 0xe7ecf3, N2O: 0x4f7dd6, AIR: 0x2c333d };

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// Machine builders — placeholder geometry, uniquely-named nodes.
// ---------------------------------------------------------------------------

function labelSprite(text) {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "700 28px 'JetBrains Mono', monospace";
  ctx.fillStyle = "#020617";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

function mkMesh(geo, color, opts) {
  opts = opts || {};
  const mat = new THREE.MeshStandardMaterial({
    color, metalness: opts.metalness != null ? opts.metalness : 0.35,
    roughness: opts.roughness != null ? opts.roughness : 0.55,
    transparent: !!opts.transparent, opacity: opts.opacity != null ? opts.opacity : 1
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.baseColor = color;
  mesh.userData.baseOpacity = mat.opacity;
  mesh.userData.baseEmissive = 0x000000;
  return mesh;
}

function tagComponent(mesh, data) {
  mesh.name = data.id;
  mesh.userData.componentId = data.id;
  mesh.userData.subsystem = data.subsystem || "frame";
  mesh.userData.isHousing = !!data.isHousing;
  mesh.userData.internal = !!data.internal;
  return mesh;
}

function addLabelDot(group, position) {
  // Small always-present index dot at each component's anchor, purely
  // cosmetic — the real identification affordance is hover/click, this just
  // helps a bare placeholder scene read as "a real machine" from a distance.
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 8, 8),
    new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.55 })
  );
  dot.position.copy(position);
  dot.raycast = () => {}; // decorative only, never intercepts picking
  group.add(dot);
}

function buildBoylesMachine() {
  const root = new THREE.Group();
  root.name = "boyles_root";

  const subsystems = {};
  function sub(name, pos) {
    const g = new THREE.Group();
    g.name = "sys_" + name;
    g.position.set(pos[0], pos[1], pos[2]);
    g.userData.homePosition = g.position.clone();
    root.add(g);
    subsystems[name] = g;
    return g;
  }
  const gasSupply = sub("gasSupply", [0, 0, -0.55]);
  const pressure = sub("pressure", [0, 0, -0.3]);
  const flow = sub("flow", [0, 0, 0.15]);
  const vaporizer = sub("vaporizer", [0, 0, 0.4]);
  const breathing = sub("breathing", [0.55, 0, 0.55]);
  const absorber = sub("absorber", [0.55, 0, 0.55]);
  const scavenging = sub("scavenging", [0.55, -0.3, 0.75]);

  // Frame — blue trolley body, light-grey base cart (reference: classic
  // blue Boyle's-style trolley with a canopy/hood over the flowmeter bank).
  const base = mkMesh(new THREE.BoxGeometry(1.0, 0.08, 0.9), HOUSING_GREY, { metalness: 0.4, roughness: 0.55 });
  base.position.set(0, 0.04, 0);
  tagComponent(base, { id: "frame_boyles", subsystem: "frame", isHousing: true });
  root.add(base);
  const casterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 12);
  [[-0.42, -0.38], [0.42, -0.38], [-0.42, 0.38], [0.42, 0.38]].forEach(([x, z]) => {
    const c = mkMesh(casterGeo, 0x0f172a, { roughness: 0.7 });
    c.position.set(x, 0.02, z);
    c.rotation.x = Math.PI / 2;
    c.raycast = () => {};
    root.add(c);
  });
  const column = mkMesh(new THREE.BoxGeometry(0.16, 0.75, 0.35), BOYLES_BLUE, { metalness: 0.35, roughness: 0.45 });
  column.position.set(0, 0.46, -0.15);
  tagComponent(column, { id: "frame_boyles", subsystem: "frame", isHousing: true });
  root.add(column);
  const shelf = mkMesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), BOYLES_BLUE, { metalness: 0.4, roughness: 0.45 });
  shelf.position.set(0, 0.85, 0.05);
  tagComponent(shelf, { id: "frame_boyles", subsystem: "frame", isHousing: true });
  root.add(shelf);
  const canopy = mkMesh(new THREE.BoxGeometry(0.36, 0.03, 0.45), BOYLES_BLUE, { metalness: 0.4, roughness: 0.45 });
  canopy.position.set(0, 1.22, 0.18);
  canopy.raycast = () => {};
  root.add(canopy);

  // ---- Gas supply: cylinders (rear) ----
  function cylinderRig(gas, x) {
    const g = gasSupply;
    const body = mkMesh(new THREE.CylinderGeometry(0.055, 0.055, 0.55, 16), CYLINDER_COLORS[gas], { metalness: 0.3, roughness: 0.4 });
    body.position.set(x, 0.42, -0.3);
    tagComponent(body, window.VentilatorData.machines.boyles.components.find(c => c.id === "cylinder_" + gas + "_boyles"));
    g.add(body);
    const shoulder = mkMesh(new THREE.SphereGeometry(0.055, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), CYLINDER_COLORS[gas], { metalness: 0.3 });
    shoulder.position.set(x, 0.695, -0.3);
    shoulder.raycast = () => {};
    g.add(shoulder);
    const valve = mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 10), 0x1e293b, { metalness: 0.6 });
    valve.position.set(x, 0.75, -0.3);
    valve.raycast = () => {};
    g.add(valve);
    const yoke = mkMesh(new THREE.BoxGeometry(0.1, 0.06, 0.08), 0x1e293b, { metalness: 0.6, roughness: 0.35 });
    yoke.position.set(x, 0.2, -0.16);
    tagComponent(yoke, window.VentilatorData.machines.boyles.components.find(c => c.id === "yoke_" + gas + "_boyles"));
    g.add(yoke);
    const gauge = mkMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), 0xf8fafc, { metalness: 0.2, roughness: 0.3 });
    gauge.position.set(x, 0.3, -0.13);
    gauge.rotation.x = Math.PI / 2;
    tagComponent(gauge, window.VentilatorData.machines.boyles.components.find(c => c.id === "gauge_cylinder_" + gas + "_boyles"));
    g.add(gauge);
    addLabelDot(g, new THREE.Vector3(x, 0.42, -0.3));
    return { body, yoke, gauge };
  }
  cylinderRig("O2", -0.28);
  cylinderRig("N2O", 0.28);

  // Pipeline inlets (rear-bottom)
  function pipelineInlet(gas, x) {
    const g = pressure;
    const inlet = mkMesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 10), 0x334155, { metalness: 0.6 });
    inlet.position.set(x, 0.12, -0.44);
    inlet.rotation.x = Math.PI / 2;
    tagComponent(inlet, window.VentilatorData.machines.boyles.components.find(c => c.id === "pipeline_inlet_" + gas + "_boyles"));
    g.add(inlet);
    const gauge = mkMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.018, 16), 0xf8fafc, { roughness: 0.3 });
    gauge.position.set(x, 0.55, -0.16);
    gauge.rotation.z = Math.PI / 2;
    tagComponent(gauge, window.VentilatorData.machines.boyles.components.find(c => c.id === "gauge_pipeline_" + gas + "_boyles"));
    g.add(gauge);
    const regulator = mkMesh(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 12), 0x475569, { metalness: 0.5 });
    regulator.position.set(x, 0.3, -0.3);
    tagComponent(regulator, window.VentilatorData.machines.boyles.components.find(c => c.id === "pressure_regulator_" + gas + "_boyles"));
    g.add(regulator);
    return { inlet, gauge, regulator };
  }
  pipelineInlet("O2", -0.28);
  pipelineInlet("N2O", 0.28);

  // Flowmeter block (front-top, on shelf)
  const flowBlockCase = mkMesh(new THREE.BoxGeometry(0.32, 0.32, 0.06), 0xe2e8f0, { transparent: true, opacity: 0.28, roughness: 0.15, metalness: 0.1 });
  flowBlockCase.position.set(0, 1.05, 0.18);
  tagComponent(flowBlockCase, { id: "flowmeter_block_boyles", subsystem: "flow" });
  flow.add(flowBlockCase);
  function flowTube(gas, x) {
    const tube = mkMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 12), 0xbfdbfe, { transparent: true, opacity: 0.5, roughness: 0.1 });
    tube.position.set(x, 1.05, 0.19);
    tagComponent(tube, window.VentilatorData.machines.boyles.components.find(c => c.id === "flowmeter_" + gas + "_boyles"));
    flow.add(tube);
    const bobbin = mkMesh(new THREE.SphereGeometry(0.014, 10, 8), 0x0f172a, { metalness: 0.6 });
    bobbin.position.set(x, 1.0, 0.19);
    bobbin.raycast = () => {};
    bobbin.userData.isBobbin = true;
    flow.add(bobbin);
    return { tube, bobbin };
  }
  const bobbinO2 = flowTube("O2", -0.06);
  const bobbinN2O = flowTube("N2O", 0.06);

  // Vaporizer
  const vap = mkMesh(new THREE.BoxGeometry(0.18, 0.22, 0.16), VAPORIZER_A, { metalness: 0.3, roughness: 0.4 });
  vap.position.set(0, 1.02, 0.4);
  tagComponent(vap, { id: "vaporizer_boyles", subsystem: "vaporizer" });
  vaporizer.add(vap);
  const vapDial = mkMesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), 0xf8fafc, {});
  vapDial.position.set(0, 1.1, 0.49);
  vapDial.rotation.x = Math.PI / 2;
  vapDial.raycast = () => {};
  vaporizer.add(vapDial);

  const cgo = mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10), 0x1e293b, { metalness: 0.6 });
  cgo.position.set(0, 0.95, 0.5);
  tagComponent(cgo, { id: "common_gas_outlet_boyles", subsystem: "vaporizer" });
  vaporizer.add(cgo);

  // Breathing system: hose -> absorber -> bag, APL valve, scavenging
  const hose = mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 10), 0x475569, { roughness: 0.6 });
  hose.position.set(0.3, 0.85, 0.55);
  hose.rotation.z = Math.PI / 2.2;
  tagComponent(hose, { id: "breathing_hose_boyles", subsystem: "breathing" });
  breathing.add(hose);

  const absorberCanister = mkMesh(new THREE.CylinderGeometry(0.09, 0.09, 0.28, 16), 0xeef2f6, { transparent: true, opacity: 0.55, roughness: 0.15 });
  absorberCanister.position.set(0.55, 0.62, 0.55);
  tagComponent(absorberCanister, { id: "co2_absorber_boyles", subsystem: "absorber" });
  absorber.add(absorberCanister);
  const absorbentFill = mkMesh(new THREE.CylinderGeometry(0.075, 0.075, 0.2, 16), ABSORBENT_COLOR, { roughness: 0.9 });
  absorbentFill.position.set(0.55, 0.6, 0.55);
  absorbentFill.raycast = () => {};
  absorber.add(absorbentFill);

  const apl = mkMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16), 0x334155, { metalness: 0.5 });
  apl.position.set(0.55, 0.78, 0.55);
  tagComponent(apl, { id: "apl_valve_boyles", subsystem: "breathing" });
  breathing.add(apl);

  const bag = mkMesh(new THREE.SphereGeometry(0.11, 16, 12), 0x0f766e, { transparent: true, opacity: 0.85, roughness: 0.55 });
  bag.scale.set(1, 1.3, 1);
  bag.position.set(0.72, 0.5, 0.55);
  tagComponent(bag, { id: "reservoir_bag_boyles", subsystem: "breathing" });
  breathing.add(bag);

  const scavHose = mkMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 10), 0x475569, { roughness: 0.6 });
  scavHose.position.set(0.55, 0.35, 0.7);
  scavHose.rotation.x = Math.PI / 5;
  tagComponent(scavHose, { id: "scavenging_hose_boyles", subsystem: "scavenging" });
  scavenging.add(scavHose);

  root.userData.subsystems = subsystems;
  root.userData.machineId = "boyles";
  return root;
}

function buildModernWorkstation() {
  const root = new THREE.Group();
  root.name = "modern_root";

  const subsystems = {};
  function sub(name, pos) {
    const g = new THREE.Group();
    g.name = "sys_" + name;
    g.position.set(pos[0], pos[1], pos[2]);
    g.userData.homePosition = g.position.clone();
    root.add(g);
    subsystems[name] = g;
    return g;
  }
  const gasSupply = sub("gasSupply", [-0.5, 0, -0.5]);
  const pressure = sub("pressure", [0, 0, -0.35]);
  const flow = sub("flow", [0, 0, 0.05]);
  const vaporizer = sub("vaporizer", [0, 0, 0.3]);
  const breathing = sub("breathing", [0.45, 0, 0.55]);
  const absorber = sub("absorber", [0.45, 0, 0.55]);
  const ventilator = sub("ventilator", [-0.55, 0, 0.35]);
  const monitor = sub("monitor", [0, 0.55, -0.05]);
  const scavenging = sub("scavenging", [0.45, -0.3, 0.75]);
  const power = sub("power", [-0.45, 0.9, -0.3]);
  const drawer = sub("drawer", [0, -0.3, 0.2]);

  const M = window.VentilatorData.machines.modern.components;
  const find = id => M.find(c => c.id === id);

  // Cart body — light clinical white/grey shell with a blue accent trim,
  // matching typical modern integrated-workstation colour language.
  const cartBase = mkMesh(new THREE.BoxGeometry(1.15, 0.1, 0.95), 0x3b4a63, { metalness: 0.4, roughness: 0.5 });
  cartBase.position.set(0, 0.05, 0);
  tagComponent(cartBase, { id: "frame_modern", subsystem: "frame", isHousing: true });
  root.add(cartBase);
  const casterGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12);
  [[-0.48, -0.4], [0.48, -0.4], [-0.48, 0.4], [0.48, 0.4]].forEach(([x, z]) => {
    const c = mkMesh(casterGeo, 0x0f172a, { roughness: 0.7 });
    c.position.set(x, 0.02, z);
    c.rotation.x = Math.PI / 2;
    c.raycast = () => {};
    root.add(c);
  });
  const column = mkMesh(new THREE.BoxGeometry(0.9, 0.55, 0.5), HOUSING_GREY, { metalness: 0.2, roughness: 0.5 });
  column.position.set(0, 0.4, -0.05);
  tagComponent(column, { id: "frame_modern", subsystem: "frame", isHousing: true });
  root.add(column);
  const head = mkMesh(new THREE.BoxGeometry(0.75, 0.5, 0.4), 0xeef1f5, { metalness: 0.15, roughness: 0.5 });
  head.position.set(0, 0.9, 0.1);
  tagComponent(head, { id: "frame_modern", subsystem: "frame", isHousing: true });
  root.add(head);
  const accentTrim = mkMesh(new THREE.BoxGeometry(0.75, 0.03, 0.41), 0x2f5fa8, { metalness: 0.3, roughness: 0.4 });
  accentTrim.position.set(0, 0.66, 0.1);
  accentTrim.raycast = () => {};
  root.add(accentTrim);

  // Drawers
  ["drawer_1_modern", "drawer_2_modern", "drawer_3_modern"].forEach((id, i) => {
    const d = mkMesh(new THREE.BoxGeometry(0.85, 0.12, 0.42), 0xe4e8ee, { metalness: 0.15, roughness: 0.55 });
    d.position.set(0, 0.13 + i * 0.14, 0.22);
    tagComponent(d, find(id));
    d.userData.homePosition = d.position.clone();
    d.userData.openOffset = new THREE.Vector3(0, 0, 0.45);
    drawer.add(d);
    const handle = mkMesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), 0x94a3b8, { metalness: 0.7 });
    handle.position.set(0, 0.03, 0.22);
    handle.raycast = () => {};
    d.add(handle);
  });

  // Backup cylinders (side/rear of cart)
  function cylinderRig(gas, x) {
    const g = gasSupply;
    const body = mkMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 14), CYLINDER_COLORS[gas], { metalness: 0.3 });
    body.position.set(x, 0.36, -0.32);
    tagComponent(body, find("cylinder_" + gas + "_modern"));
    g.add(body);
    const yoke = mkMesh(new THREE.BoxGeometry(0.08, 0.05, 0.06), 0x1e293b, { metalness: 0.6 });
    yoke.position.set(x, 0.16, -0.2);
    tagComponent(yoke, find("yoke_" + gas + "_modern"));
    g.add(yoke);
    const gauge = mkMesh(new THREE.CylinderGeometry(0.028, 0.028, 0.016, 14), 0xf8fafc, {});
    gauge.position.set(x, 0.24, -0.17);
    gauge.rotation.x = Math.PI / 2;
    tagComponent(gauge, find("gauge_cylinder_" + gas + "_modern") || { id: "cylinder_" + gas + "_modern", subsystem: "gasSupply" });
    g.add(gauge);
    addLabelDot(g, new THREE.Vector3(x, 0.36, -0.32));
    return { body, yoke, gauge };
  }
  cylinderRig("O2", -0.22);
  cylinderRig("air", 0.22);

  // Pipeline inlets
  ["O2", "air", "N2O"].forEach((gas, i) => {
    const x = -0.3 + i * 0.15;
    const inlet = mkMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.045, 10), 0x334155, { metalness: 0.6 });
    inlet.position.set(x, 0.66, -0.28);
    inlet.rotation.x = Math.PI / 2;
    tagComponent(inlet, find("pipeline_inlet_" + gas + "_modern"));
    pressure.add(inlet);
    const gauge = mkMesh(new THREE.CylinderGeometry(0.024, 0.024, 0.014, 14), 0xf8fafc, {});
    gauge.position.set(x, 0.78, -0.05);
    gauge.rotation.x = Math.PI / 2;
    tagComponent(gauge, find("gauge_pipeline_" + gas + "_modern"));
    pressure.add(gauge);
  });
  const regBlock = mkMesh(new THREE.BoxGeometry(0.3, 0.1, 0.12), 0x475569, { metalness: 0.5 });
  regBlock.position.set(0, 0.55, -0.28);
  tagComponent(regBlock, find("pressure_regulator_block_modern"));
  pressure.add(regBlock);

  // Flow control + display
  const flowPanel = mkMesh(new THREE.BoxGeometry(0.28, 0.14, 0.03), 0x1f2937, { metalness: 0.4 });
  flowPanel.position.set(-0.15, 1.0, 0.32);
  tagComponent(flowPanel, find("flow_control_module_modern"));
  flow.add(flowPanel);
  const flowDisplay = mkMesh(new THREE.PlaneGeometry(0.22, 0.1), 0x0ea5e9, { emissive: undefined });
  flowDisplay.material.emissive = new THREE.Color(0x0ea5e9);
  flowDisplay.material.emissiveIntensity = 0.4;
  flowDisplay.position.set(-0.15, 1.0, 0.335);
  tagComponent(flowDisplay, find("flowmeter_display_modern"));
  flow.add(flowDisplay);

  // Vaporizers — two agent-specific units side by side (colour illustrative
  // only; real vaporizer colour conventions vary by manufacturer/agent).
  [["vaporizer_1_modern", 0.05, VAPORIZER_A], ["vaporizer_2_modern", 0.22, VAPORIZER_B]].forEach(([id, x, color]) => {
    const v = mkMesh(new THREE.BoxGeometry(0.14, 0.2, 0.16), color, { metalness: 0.25, roughness: 0.4 });
    v.position.set(x, 0.98, 0.32);
    tagComponent(v, find(id));
    vaporizer.add(v);
  });
  const cgo = mkMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10), 0x1e293b, { metalness: 0.6 });
  cgo.position.set(0.15, 0.92, 0.42);
  tagComponent(cgo, find("common_gas_outlet_modern"));
  vaporizer.add(cgo);

  // Breathing circuit + absorber + APL + bag
  const circuit = mkMesh(new THREE.CylinderGeometry(0.018, 0.018, 0.3, 10), 0x475569, { roughness: 0.6 });
  circuit.position.set(0.3, 0.8, 0.5);
  circuit.rotation.z = Math.PI / 2.3;
  tagComponent(circuit, find("breathing_circuit_modern"));
  breathing.add(circuit);
  const inspValve = mkMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), 0x334155, {});
  inspValve.position.set(0.42, 0.72, 0.5);
  tagComponent(inspValve, find("inspiratory_valve_modern"));
  breathing.add(inspValve);
  const expValve = mkMesh(new THREE.CylinderGeometry(0.03, 0.03, 0.025, 12), 0x334155, {});
  expValve.position.set(0.5, 0.72, 0.45);
  tagComponent(expValve, find("expiratory_valve_modern"));
  breathing.add(expValve);
  const absorberCanister = mkMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.26, 16), 0xeef2f6, { transparent: true, opacity: 0.55, roughness: 0.15 });
  absorberCanister.position.set(0.45, 0.55, 0.55);
  tagComponent(absorberCanister, find("co2_absorber_modern"));
  absorber.add(absorberCanister);
  const absorbentFillModern = mkMesh(new THREE.CylinderGeometry(0.066, 0.066, 0.18, 16), ABSORBENT_COLOR, { roughness: 0.9 });
  absorbentFillModern.position.set(0.45, 0.53, 0.55);
  absorbentFillModern.raycast = () => {};
  absorber.add(absorbentFillModern);
  const apl = mkMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 16), 0x334155, { metalness: 0.5 });
  apl.position.set(0.45, 0.7, 0.55);
  tagComponent(apl, find("apl_valve_modern"));
  breathing.add(apl);
  const bag = mkMesh(new THREE.SphereGeometry(0.1, 16, 12), 0x0f766e, { transparent: true, opacity: 0.85 });
  bag.scale.set(1, 1.3, 1);
  bag.position.set(0.6, 0.42, 0.55);
  tagComponent(bag, find("reservoir_bag_modern"));
  breathing.add(bag);

  // Ventilator module + bellows
  const ventBox = mkMesh(new THREE.BoxGeometry(0.28, 0.4, 0.3), 0x1f2937, { metalness: 0.35 });
  ventBox.position.set(-0.55, 0.55, 0.35);
  tagComponent(ventBox, find("ventilator_unit_modern"));
  ventilator.add(ventBox);
  const bellowsHousing = mkMesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 16), 0xcbd5e1, { transparent: true, opacity: 0.3 });
  bellowsHousing.position.set(-0.55, 0.78, 0.35);
  bellowsHousing.raycast = () => {};
  ventilator.add(bellowsHousing);
  const bellows = mkMesh(new THREE.CylinderGeometry(0.065, 0.065, 0.16, 16), 0x38bdf8, { transparent: true, opacity: 0.55 });
  bellows.position.set(-0.55, 0.74, 0.35);
  tagComponent(bellows, find("ventilator_bellows_modern"));
  bellows.userData.homeY = bellows.position.y;
  ventilator.add(bellows);
  const ventControls = mkMesh(new THREE.BoxGeometry(0.24, 0.1, 0.02), 0x111827, { metalness: 0.4 });
  ventControls.position.set(-0.55, 0.4, 0.5);
  tagComponent(ventControls, find("ventilator_controls_modern"));
  ventilator.add(ventControls);

  // Monitor — mounted on an arm at the top-left of the workstation, tilted
  // toward the user (reference: integrated monitor arm on modern machines).
  const monArm = mkMesh(new THREE.CylinderGeometry(0.015, 0.015, 0.4, 8), 0x475569, { metalness: 0.6 });
  monArm.position.set(-0.32, 1.35, 0.15);
  monArm.raycast = () => {};
  monitor.add(monArm);
  const monScreen = mkMesh(new THREE.BoxGeometry(0.36, 0.26, 0.03), 0x0b1220, { metalness: 0.3, roughness: 0.4 });
  monScreen.position.set(-0.32, 1.58, 0.22);
  monScreen.rotation.x = -0.15;
  tagComponent(monScreen, find("monitor_screen_modern"));
  monitor.add(monScreen);

  // Power/battery
  const battery = mkMesh(new THREE.SphereGeometry(0.02, 10, 8), 0x22c55e, {});
  battery.material.emissive = new THREE.Color(0x22c55e);
  battery.material.emissiveIntensity = 0.6;
  battery.position.set(-0.4, 1.02, 0.31);
  tagComponent(battery, find("battery_indicator_modern"));
  power.add(battery);

  const scavHose = mkMesh(new THREE.CylinderGeometry(0.014, 0.014, 0.4, 10), 0x475569, { roughness: 0.6 });
  scavHose.position.set(0.45, 0.3, 0.7);
  scavHose.rotation.x = Math.PI / 5;
  tagComponent(scavHose, find("scavenging_interface_modern"));
  scavenging.add(scavHose);

  root.userData.subsystems = subsystems;
  root.userData.machineId = "modern";
  root.userData.bellowsMesh = bellows;
  return root;
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
    const subs = machineGroup.userData.subsystems;
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

  function init(id) {
    clearMachine();
    machineId = id;
    return tryLoadGLB(id).then(gltfGroup => {
      machineGroup = gltfGroup || (id === "boyles" ? buildBoylesMachine() : buildModernWorkstation());
      machineGroup.userData.machineId = id;
      // The subsystem layout isn't symmetric around the local origin (gas
      // supply/absorber/bag sit off to one side), so recentre the whole
      // group in X/Z on its actual bounding box — otherwise the camera
      // presets (which target world 0,y,0) frame empty space next to the
      // machine instead of the machine itself. Floor (Y) is left alone so
      // the model still stands on the grid at y=0. This also transparently
      // handles a future real GLB whose own origin isn't centred.
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

  function tryLoadGLB(id) {
    return new Promise(resolve => {
      const loader = new GLTFLoader();
      const url = "assets/ventilators/" + id + "/model.glb";
      loader.load(url, gltf => {
        const group = gltf.scene;
        group.userData.subsystems = {};
        group.traverse(o => {
          if (o.isMesh) {
            o.userData.componentId = o.name;
            o.userData.baseOpacity = o.material.opacity != null ? o.material.opacity : 1;
            o.userData.baseEmissive = 0x000000;
          }
        });
        resolve(group);
      }, undefined, () => resolve(null));
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
      Object.values(machineGroup.userData.subsystems || {}).forEach(g => {
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
      // Bellows breathing motion (modern only, when ventilator running)
      if (machineGroup.userData.bellowsMesh && machineGroup.userData.ventilatorRunning) {
        const b = machineGroup.userData.bellowsMesh;
        const phase = (now / 1000) * (machineGroup.userData.ventRate || 0.25);
        const cycle = phase % 1;
        const insp = cycle < 0.4 ? cycle / 0.4 : 1 - (cycle - 0.4) / 0.6;
        b.position.y = b.userData.homeY - insp * 0.05;
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
    getMachineGroup: () => machineGroup
  };
}
