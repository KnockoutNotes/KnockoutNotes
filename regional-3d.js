/* ==========================================================================
   KNOCKOUTNOTES — Regional block 3D spread viewer (regional-3d.js)

   A procedural mannequin (no external model) whose skin is painted per
   vertex from each block's `spread.three` definition in regional-data.js.

   Coordinate conventions (patient in anatomical position, palms forward):
     +y up, +z anterior (patient faces the viewer), +x = patient's LEFT.
   Segment parameters used by the data file:
     trunk      y height, th 0 (anterior midline) → 90 (lateral) → 180
                (posterior midline) on either side; derm computed from y/th.
     neck/head  t 0 (bottom) → 1 (top); th as trunk (0 front → 180 back).
     shoulder   t 0 (top) → 1 (bottom); th 0 ant, 90 lat, 180 post, 270 med.
     limbs      t 0 proximal → 1 distal; th 0 anterior, 90 lateral,
                180 posterior, 270 medial (wraps).
     hand/digit th 0 palmar, 90 radial, 180 dorsal, 270 ulnar; u 0 radial → 1 ulnar.
     foot       t 0 heel → 1 toes; th 0 dorsal, 90 lateral, 180 plantar,
                270 medial; u 0 medial → 1 lateral.
   ========================================================================== */

import * as THREE from "three";
import { OrbitControls } from "./vendor/three/examples/jsm/controls/OrbitControls.js";

const KIND_COLOR = { exp: "#0ea5e9", var: "#f59e0b", tgt: "#8b5cf6", eff: "#f43f5e" };
const KIND_LABEL = {
  exp: "Expected anaesthesia / analgesia",
  var: "Variable / inconsistent",
  tgt: "Deep target (no skin anaesthesia)",
  eff: "Side effect"
};
const SKIN = new THREE.Color("#dfe4ec");

const DERM = { C2: 2, C3: 3, C4: 4, C5: 5, C6: 6, C7: 7, C8: 8, T1: 9, T2: 10, T3: 11, T4: 12, T5: 13, T6: 14, T7: 15, T8: 16, T9: 17, T10: 18, T11: 19, T12: 20, L1: 21, L2: 22, L3: 23, L4: 24, L5: 25, S1: 26, S2: 27, S3: 28, S4: 29, S5: 30 };

// Anterior trunk height → dermatome index. Posterior bands sit higher (see dermAt).
const DERM_Y = [
  [1.475, 4], [1.412, 4], [1.405, 10], [1.36, 11], [1.31, 12], [1.278, 13], [1.245, 14], [1.21, 15],
  [1.175, 16], [1.14, 17], [1.075, 18], [1.04, 19], [1.005, 20], [0.965, 21], [0.93, 22], [0.9, 23],
  [0.86, 25], [0.82, 28], [0.77, 30]
];

function dermAt(y, thAbs) {
  const yEff = y - 0.065 * (1 - Math.cos(thAbs * Math.PI / 180)) / 2;
  if (yEff >= DERM_Y[0][0]) return DERM_Y[0][1];
  for (let i = 0; i < DERM_Y.length - 1; i++) {
    const [y0, d0] = DERM_Y[i];
    const [y1, d1] = DERM_Y[i + 1];
    if (yEff <= y0 && yEff >= y1) return d0 + (d1 - d0) * (y0 - yEff) / (y0 - y1);
  }
  return DERM_Y[DERM_Y.length - 1][1];
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function rangeM(v, r, f) {
  if (!r) return 1;
  return smooth(r[0] - f, r[0] + f, v) * (1 - smooth(r[1] - f, r[1] + f, v));
}

// Angular membership on a 0–360 circle; ranges may wrap (e.g., [300, 60]).
function angleM(v, r, f) {
  if (!r) return 1;
  let a = r[0], b = r[1];
  let width = b - a;
  if (width < 0) width += 360;
  const centre = a + width / 2;
  let d = Math.abs(((v - centre) % 360 + 540) % 360 - 180);
  const half = width / 2;
  return 1 - smooth(half - f, half + f, d);
}

/* ------------------------------------------------------------------------
   Mannequin geometry definitions
   ------------------------------------------------------------------------ */
const TRUNK = [
  [0.77, 0.110, 0.074, -0.012], [0.80, 0.150, 0.098, -0.012], [0.84, 0.172, 0.112, -0.016], [0.88, 0.180, 0.116, -0.016],
  [0.93, 0.174, 0.108, -0.010], [0.98, 0.160, 0.100, -0.004], [1.03, 0.148, 0.095, 0.000], [1.08, 0.146, 0.096, 0.004],
  [1.13, 0.150, 0.100, 0.004], [1.18, 0.156, 0.105, 0.002], [1.24, 0.164, 0.111, 0.000], [1.30, 0.172, 0.115, 0.002],
  [1.35, 0.178, 0.112, 0.000], [1.395, 0.184, 0.102, -0.004], [1.425, 0.170, 0.090, -0.008], [1.45, 0.128, 0.074, -0.010],
  [1.475, 0.062, 0.052, -0.010]
];

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function trunkProfile(y) {
  const n = TRUNK.length;
  if (y <= TRUNK[0][0]) return TRUNK[0].slice(1);
  if (y >= TRUNK[n - 1][0]) return TRUNK[n - 1].slice(1);
  let i = 0;
  while (i < n - 2 && y > TRUNK[i + 1][0]) i++;
  const a = TRUNK[Math.max(0, i - 1)], b = TRUNK[i], c = TRUNK[i + 1], d = TRUNK[Math.min(n - 1, i + 2)];
  const t = (y - b[0]) / (c[0] - b[0]);
  return [1, 2, 3].map((k) => catmull(a[k], b[k], c[k], d[k], t));
}

const SE = 2 / 2.5; // superellipse exponent → slightly boxy torso section
const bump = (y, c, w) => Math.exp(-((y - c) / w) * ((y - c) / w));
// Angular Gaussian with wraparound (0–360°), for muscle bulges placed at a
// given compass angle (0 = anterior, 90 = lateral, 180 = posterior, 270 = medial).
function angBump(thDeg, center, width) {
  let d = Math.abs(thDeg - center);
  if (d > 180) d = 360 - d;
  return Math.exp(-(d / width) * (d / width));
}

// Surface muscle definition for the limb tubes: each entry adds a smooth
// radial bulge (fraction of the base radius) centred at a point along the
// segment (t, 0–1) and a compass angle around it. Purely cosmetic — applied
// as a multiplier on the cross-section radius, so it never affects the
// anchor/anatomy data, only how the mannequin's skin is shaped.
function limbBump(seg, t, thDeg) {
  let b = 0;
  if (seg === "upperArm") {
    b += 0.30 * bump(t, 0.30, 0.14) * angBump(thDeg, 0, 48);    // biceps brachii (anterior)
    b += 0.26 * bump(t, 0.28, 0.16) * angBump(thDeg, 180, 52);  // triceps (posterior)
  } else if (seg === "forearm") {
    b += 0.22 * bump(t, 0.15, 0.13) * angBump(thDeg, 340, 50);  // flexor mass (anteromedial)
    b += 0.16 * bump(t, 0.13, 0.12) * angBump(thDeg, 90, 40);   // brachioradialis / extensors (lateral)
  } else if (seg === "thigh") {
    b += 0.34 * bump(t, 0.40, 0.19) * angBump(thDeg, 0, 50);    // quadriceps (anterior)
    b += 0.30 * bump(t, 0.35, 0.19) * angBump(thDeg, 180, 55);  // hamstrings (posterior)
    b += 0.22 * bump(t, 0.04, 0.08) * angBump(thDeg, 185, 65);  // gluteal shelf (proximal posterior)
    b += 0.16 * bump(t, 0.30, 0.16) * angBump(thDeg, 270, 36);  // adductors (medial)
  } else if (seg === "leg") {
    b += 0.36 * bump(t, 0.18, 0.13) * angBump(thDeg, 180, 50);  // gastrocnemius/soleus (posterior)
    b += 0.14 * bump(t, 0.12, 0.11) * angBump(thDeg, 0, 36);    // tibialis anterior ridge
  }
  return b;
}

// Trunk muscle definition — pectorals, lats and a subtle abdominal ridge —
// as a fractional outward scale applied radially about the profile centre.
// Angles here are the absolute (0–180, mirrored L/R) compass convention:
// 0 = anterior midline, 90 = lateral, 180 = posterior midline.
function trunkBump(y, psiDeg) {
  const thAbs = psiDeg <= 180 ? psiDeg : 360 - psiDeg;
  let b = 0;
  b += 0.30 * bump(y, 1.365, 0.042) * angBump(thAbs, 42, 28);  // pectoralis major
  b += 0.22 * bump(y, 1.27, 0.07) * angBump(thAbs, 148, 30);   // latissimus dorsi
  b += 0.09 * bump(y, 1.15, 0.16) * angBump(thAbs, 6, 18);     // rectus abdominis ridge
  return b;
}

function trunkPoint(y, psiDeg) {
  const psi = psiDeg * Math.PI / 180;
  const [rx, rz0, zc] = trunkProfile(y);
  const s = Math.sin(psi), c = Math.cos(psi);
  let rz = rz0;
  if (c < 0) rz += 0.02 * bump(y, 0.865, 0.055) * (-c);
  else rz += 0.008 * bump(y, 1.31, 0.05) * c;
  const m = 1 + trunkBump(y, psiDeg);
  const x = rx * m * Math.sign(s) * Math.pow(Math.abs(s), SE);
  const z = zc + rz * m * Math.sign(c) * Math.pow(Math.abs(c), SE);
  return new THREE.Vector3(x, y, z);
}

function lerpTable(table, t) {
  if (t <= table[0][0]) return table[0][1];
  for (let i = 0; i < table.length - 1; i++) {
    const [t0, v0] = table[i], [t1, v1] = table[i + 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const e = k * k * (3 - 2 * k);
      return v0 + (v1 - v0) * e;
    }
  }
  return table[table.length - 1][1];
}

function frameFor(axis, side, anteriorHint, lateralHint) {
  const a = axis.clone().normalize();
  const A = anteriorHint.clone().sub(a.clone().multiplyScalar(anteriorHint.dot(a))).normalize();
  const lat = lateralHint ? lateralHint.clone() : new THREE.Vector3(side, 0, 0);
  const L = lat.sub(a.clone().multiplyScalar(lat.dot(a))).sub(A.clone().multiplyScalar(lat.dot(A))).normalize();
  return { a, A, L };
}

// Arm in anatomical position (palm forward, thumb lateral).
//   "default"   ~20° abduction so the lateral chest wall stays visible
//   "abducted"  90° abduction (PECS / serratus positioning) — the arm's
//               lateral aspect then faces upward.
function armDefs(s, side, pose) {
  const defs = [];
  const Z = new THREE.Vector3(0, 0, 1);
  const S = new THREE.Vector3(s * 0.19, 1.395, -0.004);
  let E, Wr, latHint;
  if (pose === "abducted") {
    E = new THREE.Vector3(s * 0.465, 1.43, -0.01);
    Wr = new THREE.Vector3(s * 0.725, 1.455, 0.0);
    latHint = new THREE.Vector3(0, 1, 0);
  } else {
    E = new THREE.Vector3(s * 0.285, 1.135, -0.012);
    Wr = new THREE.Vector3(s * 0.37, 0.888, 0.004);
  }
  const fUA = frameFor(E.clone().sub(S), s, Z, latHint);
  defs.push({ seg: "upperArm", side, pose, p0: S, p1: E, frame: fUA, rA: [[0, 0.049], [0.15, 0.046], [0.5, 0.041], [1, 0.036]], rL: [[0, 0.05], [0.15, 0.047], [0.5, 0.042], [1, 0.037]], capStart: 0.02, capEnd: 0.03 });
  const fFA = frameFor(Wr.clone().sub(E), s, Z, latHint);
  defs.push({ seg: "forearm", side, pose, p0: E, p1: Wr, frame: fFA, rA: [[0, 0.033], [0.25, 0.036], [0.6, 0.028], [1, 0.02]], rL: [[0, 0.037], [0.25, 0.041], [0.6, 0.033], [1, 0.027]], capStart: 0.03, capEnd: 0.015 });
  const a = fFA.a;
  const palmEnd = Wr.clone().add(a.clone().multiplyScalar(0.09));
  defs.push({ seg: "hand", side, pose, p0: Wr.clone().add(a.clone().multiplyScalar(-0.004)), p1: palmEnd, frame: fFA, rA: [[0, 0.018], [0.4, 0.016], [1, 0.012]], rL: [[0, 0.03], [0.35, 0.041], [1, 0.039]], capStart: 0.01, capEnd: 0.008, hand: true });
  const fingers = [[2, 0.026, 0.074, 0.0088], [3, 0.008, 0.082, 0.0092], [4, -0.01, 0.077, 0.0086], [5, -0.027, 0.06, 0.0076]];
  fingers.forEach(([d, off, len, r]) => {
    const base = palmEnd.clone().add(fFA.L.clone().multiplyScalar(off)).add(a.clone().multiplyScalar(-0.006));
    const dir = a.clone().add(fFA.L.clone().multiplyScalar(off * 0.9)).normalize();
    defs.push({ seg: "digit", digit: d, side, pose, p0: base, p1: base.clone().add(dir.multiplyScalar(len)), frame: fFA, rA: [[0, r], [1, r * 0.82]], rL: [[0, r], [1, r * 0.85]], capStart: 0.004, capEnd: r });
  });
  const tBase = Wr.clone().add(a.clone().multiplyScalar(0.03)).add(fFA.L.clone().multiplyScalar(0.034)).add(fFA.A.clone().multiplyScalar(0.01));
  const tDir = a.clone().multiplyScalar(0.85).add(fFA.L.clone().multiplyScalar(0.4)).add(fFA.A.clone().multiplyScalar(0.3)).normalize();
  defs.push({ seg: "digit", digit: 1, side, pose, p0: tBase, p1: tBase.clone().add(tDir.multiplyScalar(0.066)), frame: fFA, rA: [[0, 0.012], [1, 0.0095]], rL: [[0, 0.012], [1, 0.0095]], capStart: 0.006, capEnd: 0.0095 });
  return defs;
}

function tubeDefs() {
  const defs = [];
  [-1, 1].forEach((s) => {
    const side = s < 0 ? "R" : "L";
    const Z = new THREE.Vector3(0, 0, 1);
    const Y = new THREE.Vector3(0, 1, 0);
    defs.push(...armDefs(s, side, "default"));
    // Blocks are always drawn on the patient's right, so only that arm needs the abducted pose.
    if (side === "R") defs.push(...armDefs(s, side, "abducted"));

    const H = new THREE.Vector3(s * 0.092, 0.87, 0.0);
    const K = new THREE.Vector3(s * 0.1, 0.485, 0.012);
    const Ak = new THREE.Vector3(s * 0.106, 0.088, -0.008);
    defs.push({ seg: "thigh", side, p0: H, p1: K, frame: frameFor(K.clone().sub(H), s, Z), rA: [[0, 0.088], [0.2, 0.08], [0.6, 0.063], [0.9, 0.053], [1, 0.05]], rL: [[0, 0.092], [0.2, 0.084], [0.6, 0.066], [0.9, 0.055], [1, 0.052]], capStart: 0.04, capEnd: 0.02 });
    defs.push({ seg: "leg", side, p0: K, p1: Ak, frame: frameFor(Ak.clone().sub(K), s, Z), rA: [[0, 0.05], [0.22, 0.056], [0.55, 0.044], [1, 0.031]], rL: [[0, 0.051], [0.22, 0.055], [0.55, 0.043], [1, 0.034]], capStart: 0.02, capEnd: 0.02 });
    const heel = new THREE.Vector3(s * 0.106, 0.042, -0.05);
    const toe = new THREE.Vector3(s * 0.114, 0.028, 0.19);
    defs.push({ seg: "foot", side, p0: heel, p1: toe, frame: frameFor(toe.clone().sub(heel), s, Y), rA: [[0, 0.034], [0.35, 0.037], [0.75, 0.022], [1, 0.013]], rL: [[0, 0.03], [0.55, 0.044], [1, 0.04]], capStart: 0.02, capEnd: 0.012, foot: true });
  });
  const neckBase = new THREE.Vector3(0, 1.43, -0.012);
  const neckTop = new THREE.Vector3(0, 1.585, 0.0);
  defs.push({ seg: "neck", side: "both", p0: neckBase, p1: neckTop, frame: { a: neckTop.clone().sub(neckBase).normalize(), A: new THREE.Vector3(0, 0, 1), L: new THREE.Vector3(1, 0, 0) }, rA: [[0, 0.05], [1, 0.045]], rL: [[0, 0.056], [0.5, 0.05], [1, 0.047]], capStart: 0, capEnd: 0, globalSide: true });
  return defs;
}

function tubePoint(def, t, thDeg) {
  const th = thDeg * Math.PI / 180;
  const c = def.p0.clone().lerp(def.p1, t);
  const m = 1 + limbBump(def.seg, t, thDeg);
  const rA = lerpTable(def.rA, t) * m, rL = lerpTable(def.rL, t) * m;
  const dir = def.frame.A.clone().multiplyScalar(Math.cos(th) * rA).add(def.frame.L.clone().multiplyScalar(Math.sin(th) * rL));
  const n = def.frame.A.clone().multiplyScalar(Math.cos(th) / Math.max(rA, 1e-4)).add(def.frame.L.clone().multiplyScalar(Math.sin(th) / Math.max(rL, 1e-4))).normalize();
  return { p: c.add(dir), n };
}

/* ------------------------------------------------------------------------
   Geometry builders — each returns { geometry, params[] } where params
   holds the painting parameters for every vertex.
   ------------------------------------------------------------------------ */
function buildTube(def) {
  const RS = def.seg === "digit" ? 12 : 36;
  const LS = def.seg === "digit" ? 6 : def.seg === "hand" || def.seg === "foot" ? 16 : 28;
  const CAP = 5;
  const positions = [];
  const params = [];
  const rings = [];
  const len = def.p0.distanceTo(def.p1);

  function addRing(t, scale, offset, tParam) {
    const ring = [];
    for (let i = 0; i < RS; i++) {
      const thDeg = i * 360 / RS;
      const th = thDeg * Math.PI / 180;
      const m = 1 + limbBump(def.seg, tParam, thDeg);
      const rA = lerpTable(def.rA, t) * scale * m, rL = lerpTable(def.rL, t) * scale * m;
      const c = def.p0.clone().lerp(def.p1, t).add(def.frame.a.clone().multiplyScalar(offset));
      const p = c.add(def.frame.A.clone().multiplyScalar(Math.cos(th) * rA)).add(def.frame.L.clone().multiplyScalar(Math.sin(th) * rL));
      ring.push(positions.length / 3);
      positions.push(p.x, p.y, p.z);
      params.push(paramFor(def, tParam, thDeg, p));
    }
    rings.push(ring);
  }

  if (def.capStart > 0) {
    for (let k = CAP; k >= 1; k--) {
      const phi = (k / CAP) * Math.PI / 2;
      addRing(0, Math.max(0.05, Math.cos(phi)), -Math.sin(phi) * def.capStart, 0);
    }
  }
  for (let j = 0; j <= LS; j++) addRing(j / LS, 1, 0, j / LS);
  if (def.capEnd > 0) {
    for (let k = 1; k <= CAP; k++) {
      const phi = (k / CAP) * Math.PI / 2;
      addRing(1, Math.max(0.05, Math.cos(phi)), Math.sin(phi) * def.capEnd, 1);
    }
  }
  void len;

  const index = [];
  for (let r = 0; r < rings.length - 1; r++) {
    const a = rings[r], b = rings[r + 1];
    for (let i = 0; i < RS; i++) {
      const i2 = (i + 1) % RS;
      index.push(a[i], b[i], a[i2], a[i2], b[i], b[i2]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(fixWinding(index, positions, def));
  geometry.computeVertexNormals();
  return { geometry, params };
}

// Make every tube's triangles face outward regardless of side-mirrored frames.
function fixWinding(index, positions, def) {
  const P = (i) => new THREE.Vector3(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
  const a = P(index[0]), b = P(index[1]), c = P(index[2]);
  const normal = b.clone().sub(a).cross(c.clone().sub(a));
  const centre = def.p0.clone().lerp(def.p1, 0.5);
  const out = a.clone().sub(centre);
  out.sub(def.frame.a.clone().multiplyScalar(out.dot(def.frame.a)));
  if (normal.dot(out) < 0) {
    for (let i = 0; i < index.length; i += 3) {
      const tmp = index[i + 1];
      index[i + 1] = index[i + 2];
      index[i + 2] = tmp;
    }
  }
  return index;
}

function paramFor(def, t, thDeg, p) {
  const base = { seg: def.seg, side: def.side, t, th: thDeg, x: p.x, y: p.y };
  if (def.globalSide) {
    // neck: frame L = +x (patient's left); convert to side-aware 0–180.
    base.th = thDeg <= 180 ? thDeg : 360 - thDeg;
    base.side = p.x >= 0 ? "L" : "R";
  }
  if (def.hand || def.seg === "digit") base.u = 0.5 - 0.5 * Math.sin(thDeg * Math.PI / 180);
  if (def.foot) base.u = 0.5 + 0.5 * Math.sin(thDeg * Math.PI / 180);
  if (def.digit) base.d = def.digit;
  return base;
}

function buildTrunk() {
  const RS = 72;
  const y0 = 0.77, y1 = 1.475, LS = 90;
  const positions = [];
  const params = [];
  const rings = [];
  for (let j = 0; j <= LS; j++) {
    const y = y0 + (y1 - y0) * j / LS;
    const ring = [];
    for (let i = 0; i < RS; i++) {
      const psi = i * 360 / RS;
      const p = trunkPoint(y, psi);
      ring.push(positions.length / 3);
      positions.push(p.x, p.y, p.z);
      const thAbs = psi <= 180 ? psi : 360 - psi;
      params.push({ seg: "trunk", side: p.x >= 0 ? "L" : "R", y, th: thAbs, x: p.x, derm: dermAt(y, thAbs) });
    }
    rings.push(ring);
  }
  const index = [];
  for (let r = 0; r < rings.length - 1; r++) {
    const a = rings[r], b = rings[r + 1];
    for (let i = 0; i < RS; i++) {
      const i2 = (i + 1) % RS;
      index.push(a[i], a[i2], b[i], a[i2], b[i2], b[i]);
    }
  }
  // caps
  [[0, y0 - 0.004, -1], [LS, y1 + 0.004, 1]].forEach(([r, y, dir]) => {
    const [, , zc] = trunkProfile(y);
    const ci = positions.length / 3;
    positions.push(0, y, zc);
    params.push({ seg: "trunk", side: "both", y, th: 90, x: 0, derm: dermAt(y, 90) });
    const ring = rings[r];
    for (let i = 0; i < RS; i++) {
      const i2 = (i + 1) % RS;
      if (dir < 0) index.push(ci, ring[i2], ring[i]);
      else index.push(ci, ring[i], ring[i2]);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return { geometry, params };
}

const HEAD = { c: new THREE.Vector3(0, 1.657, 0.008), r: new THREE.Vector3(0.079, 0.108, 0.094) };

function headPoint(h, thAbs, side) {
  const psi = (side === "L" ? thAbs : -thAbs) * Math.PI / 180;
  const polar = Math.PI * (1 - h);
  const s = Math.sin(polar);
  const p = new THREE.Vector3(
    HEAD.c.x + HEAD.r.x * s * Math.sin(psi),
    HEAD.c.y + HEAD.r.y * Math.cos(polar),
    HEAD.c.z + HEAD.r.z * s * Math.cos(psi)
  );
  const n = new THREE.Vector3((p.x - HEAD.c.x) / (HEAD.r.x * HEAD.r.x), (p.y - HEAD.c.y) / (HEAD.r.y * HEAD.r.y), (p.z - HEAD.c.z) / (HEAD.r.z * HEAD.r.z)).normalize();
  return { p, n };
}

function buildHead() {
  const RS = 48, LS = 30;
  const positions = [];
  const params = [];
  for (let j = 0; j <= LS; j++) {
    const h = j / LS;
    for (let i = 0; i < RS; i++) {
      const psiDeg = i * 360 / RS;
      const thAbs = psiDeg <= 180 ? psiDeg : 360 - psiDeg;
      const side = psiDeg <= 180 ? "L" : "R";
      const { p } = headPoint(h, thAbs, side);
      positions.push(p.x, p.y, p.z);
      params.push({ seg: "head", side: Math.abs(p.x) < 1e-5 ? "both" : side, t: h, th: thAbs, x: p.x });
    }
  }
  const index = [];
  for (let j = 0; j < LS; j++) {
    for (let i = 0; i < RS; i++) {
      const i2 = (i + 1) % RS;
      const a = j * RS + i, b = (j + 1) * RS + i, c = j * RS + i2, d = (j + 1) * RS + i2;
      index.push(a, c, b, c, d, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return { geometry, params };
}

function buildShoulder(s) {
  const side = s < 0 ? "R" : "L";
  const c = new THREE.Vector3(s * 0.172, 1.393, -0.006);
  const r = 0.062;
  const geometry = new THREE.SphereGeometry(r, 32, 18);
  geometry.translate(c.x, c.y, c.z);
  const pos = geometry.attributes.position;
  const params = [];
  for (let i = 0; i < pos.count; i++) {
    const p = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const d = p.clone().sub(c);
    const t = 1 - (d.y / r + 1) / 2;
    let th = Math.atan2(d.x * s, d.z) * 180 / Math.PI;
    if (th < 0) th += 360;
    params.push({ seg: "shoulder", side, t, th, x: p.x });
  }
  return { geometry, params, centre: c, radius: r };
}

function buildEar(s) {
  const side = s < 0 ? "R" : "L";
  const geometry = new THREE.SphereGeometry(1, 16, 12);
  geometry.scale(0.012, 0.03, 0.02);
  geometry.translate(s * 0.08, 1.652, -0.004);
  const params = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) params.push({ seg: "ear", side, t: 0.5, th: 90, x: s });
  return { geometry, params };
}

/* ------------------------------------------------------------------------
   Viewer
   ------------------------------------------------------------------------ */
// Region of the body to frame for each block: [xMin, xMax, yMin, yMax, zCentre].
// The camera distance is computed to fit this box in the current panel size.
const FOCUS = {
  upperR: [-0.5, 0.12, 0.7, 1.8, 0], lowerR: [-0.24, 0.12, -0.02, 1.02, 0], footR: [-0.22, 0.02, -0.01, 0.22, 0.07],
  chestR: [-0.32, 0.14, 1.02, 1.56, 0], backR: [-0.26, 0.22, 0.92, 1.58, 0], abdo: [-0.26, 0.26, 0.84, 1.32, 0],
  abdoR: [-0.26, 0.18, 0.86, 1.3, 0], pelvisR: [-0.26, 0.22, 0.7, 1.14, 0], neckR: [-0.22, 0.14, 1.34, 1.79, 0],
  head: [-0.15, 0.15, 1.5, 1.8, 0], full: [-0.48, 0.48, -0.02, 1.8, 0]
};
const VIEWS = { anterior: [0, 0.12, 1], posterior: [0, 0.12, -1], right: [-1, 0.12, 0.05], left: [1, 0.12, 0.05] };
// Only the relevant body part is shown: the mannequin is sectioned at these
// heights [keep y ≥ lo, keep y ≤ hi]; null = whole body.
const CLIP = {
  upperR: [0.74, 9], lowerR: [-1, 1.1], footR: [-1, 0.56], chestR: [0.84, 9], backR: [0.8, 9],
  abdo: [0.66, 1.5], abdoR: [0.66, 1.5], pelvisR: [0.42, 1.34], neckR: [1.16, 9], head: [1.3, 9], full: null
};
// Block colours when several blocks are combined on one model.
const COMBO_COLORS = ["#0ea5e9", "#a855f7", "#22c55e", "#f97316"];

export function createSpreadViewer(container) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  } catch (err) {
    container.innerHTML = '<div class="rg-3d-fallback">3D view needs WebGL, which is not available in this browser.</div>';
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;
  const clipLo = new THREE.Plane(new THREE.Vector3(0, 1, 0), 10);
  const clipHi = new THREE.Plane(new THREE.Vector3(0, -1, 0), 10);
  const clipPlanes = [clipLo, clipHi];
  const canvas = renderer.domElement;
  canvas.className = "rg-3d-canvas";
  container.appendChild(canvas);

  const labelLayer = document.createElement("div");
  labelLayer.className = "rg-3d-labels";
  container.appendChild(labelLayer);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 30);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2b3445, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(1.6, 3.2, 2.6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfdbfe, 0.55);
  fill.position.set(-2.2, 1.2, -1.8);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x38bdf8, 0.35);
  rim.position.set(0, 2, -3);
  scene.add(rim);

  // floor ring (matches the site's holographic language)
  const floor = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.62, 64), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.07, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2;
  floor.add(disc);
  [0.34, 0.5, 0.62].forEach((r) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.004, r, 96), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    floor.add(ring);
  });
  floor.position.y = 0.001;
  scene.add(floor);

  // body
  const bodyMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, metalness: 0.04, side: THREE.DoubleSide, clippingPlanes: clipPlanes });
  // Where the model is sectioned, the inside of the shell reads as a cut surface.
  bodyMat.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace("#include <color_fragment>",
      "#include <color_fragment>\n  if (!gl_FrontFacing) diffuseColor.rgb = vec3(0.16, 0.2, 0.28);");
  };
  const parts = [];
  const tDefs = tubeDefs();
  const tubeBySeg = {};
  tDefs.forEach((d) => {
    const built = buildTube(d);
    built.pose = d.pose && d.side === "R" ? d.pose : "any";
    parts.push(built);
    const key2 = d.seg + ":" + d.side + (d.digit ? ":" + d.digit : "") + (d.pose ? "@" + d.pose : "");
    tubeBySeg[key2] = d;
  });
  const trunk = buildTrunk();
  parts.push(trunk);
  const head = buildHead();
  parts.push(head);
  const shoulders = { R: buildShoulder(-1), L: buildShoulder(1) };
  parts.push(shoulders.R, shoulders.L);
  parts.push(buildEar(-1), buildEar(1));

  const body = new THREE.Group();
  parts.forEach((part) => {
    const n = part.geometry.attributes.position.count;
    part.geometry.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
    part.mesh = new THREE.Mesh(part.geometry, bodyMat);
    body.add(part.mesh);
  });
  // nose — orientation cue only (never painted)
  const noseGeo = new THREE.SphereGeometry(1, 20, 14);
  noseGeo.scale(0.011, 0.02, 0.014);
  const nose = new THREE.Mesh(noseGeo, new THREE.MeshStandardMaterial({ color: SKIN, roughness: 0.6, clippingPlanes: clipPlanes }));
  nose.position.set(0, 1.642, 0.096);
  body.add(nose);
  scene.add(body);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.rotateSpeed = 0.85;
  controls.minPolarAngle = 0.12;
  controls.maxPolarAngle = Math.PI - 0.12;
  canvas.style.touchAction = "pan-y";

  /* ---------------- anchors ---------------- */
  function surface(desc) {
    if (typeof desc === "string") return ANCHORS[desc] ? ANCHORS[desc]() : null;
    const side = desc.side === "L" ? "L" : "R";
    if (desc.seg === "trunk") {
      const psi = side === "L" ? desc.th : 360 - desc.th;
      const p = trunkPoint(desc.y, psi);
      const p2 = trunkPoint(desc.y, psi + 1.5);
      const p3 = trunkPoint(desc.y + 0.01, psi);
      const n = p2.clone().sub(p).cross(p3.clone().sub(p)).normalize();
      const out = new THREE.Vector3(p.x, 0, p.z - trunkProfile(desc.y)[2]);
      if (n.dot(out) < 0) n.negate();
      return { p, n };
    }
    if (desc.seg === "head") return headPoint(desc.t, desc.th, side);
    if (desc.seg === "neck") {
      const def = tubeBySeg["neck:both"];
      const raw = side === "L" ? desc.th : 360 - desc.th;
      return tubePoint(def, desc.t, raw);
    }
    if (desc.seg === "shoulder") {
      const sh = shoulders[side];
      const s = side === "R" ? -1 : 1;
      const polar = Math.PI * desc.t;
      const th = desc.th * Math.PI / 180;
      const dir = new THREE.Vector3(s * Math.sin(polar) * Math.sin(th), Math.cos(polar), Math.sin(polar) * Math.cos(th));
      return { p: sh.centre.clone().add(dir.clone().multiplyScalar(sh.radius)), n: dir.normalize() };
    }
    const pose = side === "R" ? state.pose : "default";
    const def = tubeBySeg[desc.seg + ":" + side] || tubeBySeg[desc.seg + ":" + side + "@" + pose] ||
      tubeBySeg[desc.seg + ":" + side + ":2@" + pose];
    if (!def) return null;
    return tubePoint(def, desc.t, desc.th);
  }

  const R = "R";
  const deepAt = (x, y, z) => () => ({ p: new THREE.Vector3(x, y, z), n: new THREE.Vector3(0, 0, 1), deep: true });
  const ANCHORS = {
    isb: () => surface({ seg: "neck", side: R, t: 0.42, th: 100 }),
    scb: () => surface({ seg: "trunk", side: R, y: 1.44, th: 55 }),
    icb: () => surface({ seg: "trunk", side: R, y: 1.385, th: 38 }),
    axb: () => surface({ seg: "upperArm", side: R, t: 0.14, th: 300 }),
    icbn: () => surface({ seg: "upperArm", side: R, t: 0.12, th: 270 }),
    axNerve: () => surface({ seg: "upperArm", side: R, t: 0.08, th: 170 }),
    ssnb: () => surface({ seg: "trunk", side: R, y: 1.43, th: 150 }),
    fnb: () => surface({ seg: "thigh", side: R, t: 0.07, th: 345 }),
    sifi: () => surface({ seg: "trunk", side: R, y: 0.955, th: 58 }),
    peng: () => surface({ seg: "thigh", side: R, t: 0.035, th: 25 }),
    acb: () => surface({ seg: "thigh", side: R, t: 0.58, th: 300 }),
    ipack: () => surface({ seg: "thigh", side: R, t: 0.9, th: 262 }),
    pop: () => surface({ seg: "thigh", side: R, t: 0.88, th: 180 }),
    ankle: () => surface({ seg: "leg", side: R, t: 0.95, th: 250 }),
    sciaticSub: () => surface({ seg: "thigh", side: R, t: 0.09, th: 183 }),
    sciaticGlute: () => surface({ seg: "thigh", side: R, t: 0.02, th: 177 }),
    sciaticAnt: () => surface({ seg: "thigh", side: R, t: 0.42, th: 320 }),
    obturator: () => surface({ seg: "thigh", side: R, t: 0.05, th: 270 }),
    lumbarPlexus: () => surface({ seg: "trunk", side: R, y: 1.045, th: 145 }),
    lfcn: () => surface({ seg: "thigh", side: R, t: 0.03, th: 55 }),
    saphAnkle: () => surface({ seg: "leg", side: R, t: 0.92, th: 295 }),
    sifiSupra: () => surface({ seg: "trunk", side: R, y: 0.975, th: 48 }),
    tfp: () => surface({ seg: "trunk", side: R, y: 1.038, th: 108 }),
    penileN: () => surface({ seg: "trunk", side: R, y: 0.81, th: 10 }),
    pecs: () => surface({ seg: "trunk", side: R, y: 1.34, th: 42 }),
    sap: () => surface({ seg: "trunk", side: R, y: 1.245, th: 92 }),
    esp: () => surface({ seg: "trunk", side: R, y: 1.35, th: 170 }),
    espLow: () => surface({ seg: "trunk", side: R, y: 1.24, th: 170 }),
    tpvb: () => surface({ seg: "trunk", side: R, y: 1.375, th: 168 }),
    tap: () => surface({ seg: "trunk", side: R, y: 1.035, th: 92 }),
    tapSub: () => surface({ seg: "trunk", side: R, y: 1.2, th: 30 }),
    rsb: () => surface({ seg: "trunk", side: R, y: 1.095, th: 14 }),
    ql: () => surface({ seg: "trunk", side: R, y: 1.04, th: 128 }),
    iih: () => surface({ seg: "trunk", side: R, y: 0.965, th: 55 }),
    scp: () => surface({ seg: "neck", side: R, t: 0.5, th: 118 }),
    scalp: () => surface({ seg: "head", side: R, t: 0.66, th: 22 }),
    spinal: () => surface({ seg: "trunk", side: R, y: 1.0, th: 180 }),
    epiduralT: () => surface({ seg: "trunk", side: R, y: 1.26, th: 180 }),
    epiduralL: () => surface({ seg: "trunk", side: R, y: 1.03, th: 180 }),
    caudal: () => surface({ seg: "trunk", side: R, y: 0.9, th: 180 }),
    diaphragmR: deepAt(-0.085, 1.19, 0.0),
    shoulderJoint: deepAt(-0.19, 1.395, -0.004),
    rotatorCuff: deepAt(-0.12, 1.35, -0.088),
    hipCapsule: deepAt(-0.092, 0.87, 0.05),
    kneeAnterior: deepAt(-0.1, 0.49, 0.045),
    kneePostCapsule: deepAt(-0.1, 0.5, -0.035),
    pectorals: deepAt(-0.085, 1.335, 0.1)
  };
  const DEEP_SIZE = {
    diaphragmR: [0.1, 0.028, 0.085], shoulderJoint: [0.042, 0.042, 0.042], rotatorCuff: [0.07, 0.055, 0.014],
    hipCapsule: [0.05, 0.042, 0.022], kneeAnterior: [0.045, 0.04, 0.016], kneePostCapsule: [0.048, 0.03, 0.015],
    pectorals: [0.075, 0.06, 0.014]
  };

  /* ---------------- state ---------------- */
  const state = { block: null, variant: null, combo: null, labels: false, needle: true, spread: true, pose: "default" };

  function applyPose() {
    parts.forEach((p) => { p.mesh.visible = !p.pose || p.pose === "any" || p.pose === state.pose; });
  }
  const overlay = new THREE.Group();
  scene.add(overlay);
  let deepMeshes = [];
  let needleGroups = [];
  let entryRings = [];
  let labelEls = [];

  function regionsOf(block, variantId) {
    const t = block.spread.three;
    if (t.variants && t.variants.length) {
      const v = t.variants.find((x) => x.id === variantId) || t.variants[0];
      return { regions: v.regions || [], needle: v.needle || t.needle };
    }
    return { regions: t.regions || [], needle: t.needle };
  }

  function activeRegions() {
    return regionsOf(state.block, state.variant);
  }

  // One layer per block shown: a single block, or each block of a combination.
  function layers() {
    if (state.combo) {
      return state.combo.map((c) => Object.assign({ block: c.block, color: new THREE.Color(c.color), hex: c.color }, regionsOf(c.block, null)));
    }
    return [Object.assign({ block: state.block, color: null, hex: null }, activeRegions())];
  }

  function sideWeight(par, side) {
    if (!side || side === "both") return 1;
    if (par.seg === "trunk" || par.seg === "head" || par.seg === "neck") {
      const x = par.x;
      return side === "R" ? 1 - smooth(-0.006, 0.006, x) : smooth(-0.006, 0.006, x);
    }
    return par.side === side ? 1 : 0;
  }

  function membership(par, r) {
    const segs = [].concat(r.seg);
    if (segs.indexOf(par.seg) === -1) return 0;
    let m = sideWeight(par, r.side);
    if (!m) return 0;
    if (r.d && (!par.d || r.d.indexOf(par.d) === -1)) return 0;
    const wrap = !(par.seg === "trunk" || par.seg === "head" || par.seg === "neck");
    if (r.t) m *= rangeM(par.t, r.t, 0.03);
    if (r.th) {
      if (wrap) {
        m *= angleM(par.th, r.th, 7);
      } else {
        // 0° and 180° are the anterior/posterior midlines, not region edges.
        const lo = r.th[0] <= 0 ? -999 : r.th[0];
        const hi = r.th[1] >= 180 ? 999 : r.th[1];
        m *= rangeM(par.th, [lo, hi], 6);
      }
    }
    if (r.u) m *= rangeM(par.u, r.u, 0.05);
    if (r.derm && par.seg === "trunk") m *= rangeM(par.derm, [DERM[r.derm[0]] - 0.5, DERM[r.derm[1]] + 0.5], 0.3);
    return m;
  }

  function paintCombo() {
    const ls = layers();
    const tmp = new THREE.Color();
    const eff = new THREE.Color(KIND_COLOR.eff);
    parts.forEach((part) => {
      const attr = part.geometry.attributes.color;
      part.params.forEach((par, i) => {
        tmp.copy(SKIN);
        if (state.spread) {
          ls.forEach((L) => {
            let m = 0, carve = 0, e = 0;
            L.regions.forEach((r) => {
              const w = membership(par, r);
              if (w <= 0.001) return;
              if (r.k === "none") carve = Math.max(carve, w);
              else if (r.k === "eff") e = Math.max(e, w);
              else m = Math.max(m, w * (r.k === "var" ? 0.5 : 1));
            });
            m *= 1 - carve;
            if (m > 0.001) tmp.lerp(L.color, m * 0.9);
            if (e > 0.001) tmp.lerp(eff, e * 0.9);
          });
        }
        attr.setXYZ(i, tmp.r, tmp.g, tmp.b);
      });
      attr.needsUpdate = true;
    });
  }

  function paint() {
    if (state.combo) { paintCombo(); return; }
    const { regions } = activeRegions();
    const tmp = new THREE.Color();
    const cols = regions.map((r) => new THREE.Color(r.k === "nerve" ? r.col : r.k === "none" ? SKIN : KIND_COLOR[r.k]));
    parts.forEach((part) => {
      const attr = part.geometry.attributes.color;
      part.params.forEach((par, i) => {
        tmp.copy(SKIN);
        if (state.spread) {
          regions.forEach((r, ri) => {
            const m = membership(par, r);
            if (m > 0.001) tmp.lerp(cols[ri], m * (r.k === "none" ? 1 : r.k === "var" ? 0.82 : 0.9));
          });
        }
        attr.setXYZ(i, tmp.r, tmp.g, tmp.b);
      });
      attr.needsUpdate = true;
    });
  }

  function clearOverlay() {
    overlay.children.slice().forEach((c) => {
      overlay.remove(c);
      c.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    });
    deepMeshes = [];
    needleGroups = [];
    entryRings = [];
  }

  function buildDeep() {
    const deep = [];
    layers().forEach((L) => (L.block.spread.three.deep || []).forEach((d) => deep.push(Object.assign({ hex: L.hex }, d))));
    deep.forEach((d) => {
      const size = DEEP_SIZE[d.at] || [0.04, 0.04, 0.04];
      const at = ANCHORS[d.at]();
      const col = d.k === "tgt" && d.hex ? d.hex : KIND_COLOR[d.k] || KIND_COLOR.tgt;
      const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(col), transparent: true, opacity: d.faint ? 0.35 : 0.62, depthTest: false, depthWrite: false });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
      mesh.scale.set(size[0], size[1], size[2]);
      mesh.position.copy(at.p);
      mesh.renderOrder = 10;
      mesh.userData.base = size;
      overlay.add(mesh);
      deepMeshes.push(mesh);
    });
  }

  function buildNeedles() {
    layers().forEach((L) => buildNeedle(L.needle, L.hex));
    applyToggles();
  }

  function buildNeedle(needle, hex) {
    if (!needle) return;
    const at = surface(needle.a);
    if (!at) return;
    const FROM = { lateral: [-1, 0, 0], medial: [1, 0, 0], cranial: [0, 1, 0], caudal: [0, -1, 0], anterior: [0, 0, 1], posterior: [0, 0, -1] };
    const f = new THREE.Vector3(...(FROM[needle.from] || [0, 0, 0]));
    const o = at.n.clone().multiplyScalar(0.6).add(f.multiplyScalar(0.8)).normalize();
    const g = new THREE.Group();
    const steel = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.9, roughness: 0.25 });
    const shaftLen = 0.095;
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0012, 0.0012, shaftLen, 10), steel);
    shaft.position.y = shaftLen / 2 - 0.012;
    g.add(shaft);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0032, 0.014, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.9, roughness: 0.3 }));
    hub.position.y = shaftLen - 0.012 + 0.007;
    g.add(hub);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.062, 20), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, roughness: 0.1 }));
    barrel.position.y = shaftLen - 0.012 + 0.014 + 0.031;
    g.add(barrel);
    const fluid = new THREE.Mesh(new THREE.CylinderGeometry(0.0078, 0.0078, 0.04, 20), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.55 }));
    fluid.position.y = shaftLen - 0.012 + 0.014 + 0.022;
    g.add(fluid);
    const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 0.004, 20), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    plunger.position.y = shaftLen - 0.012 + 0.014 + 0.066;
    g.add(plunger);
    g.position.copy(at.p);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), o);
    overlay.add(g);
    needleGroups.push(g);

    const ring = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.012, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(hex || "#fbbf24"), transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    ring.position.copy(at.p.clone().add(at.n.clone().multiplyScalar(0.002)));
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), at.n);
    overlay.add(ring);
    entryRings.push(ring);
  }

  function addLabel(text, k, at, hex) {
    const el = document.createElement("div");
    el.className = `rg-3d-label rg-k-${k}`;
    el.innerHTML = `<span class="rg-3d-dot"></span><span class="rg-3d-text"></span>`;
    el.querySelector(".rg-3d-text").textContent = text;
    if (hex) el.querySelector(".rg-3d-dot").style.background = hex;
    labelLayer.appendChild(el);
    labelEls.push({ el, p: at.p.clone(), n: at.n.clone(), deep: !!at.deep, k });
  }

  function buildLabels() {
    labelEls.forEach((l) => l.el.remove());
    labelEls = [];
    if (state.combo) {
      // Combination: name each block at its needle entry, plus its side effects.
      layers().forEach((L) => {
        const at = L.needle && surface(L.needle.a);
        if (at) addLabel(`${L.block.short}`, "block", at, L.hex);
        (L.block.spread.three.labels || []).forEach((l) => {
          if (l.k !== "eff") return;
          const a2 = surface(l.a);
          if (a2) addLabel(l.x, "eff", a2);
        });
      });
      applyToggles();
      return;
    }
    const list = state.block.spread.three.labels || [];
    const { needle } = activeRegions();
    list.forEach((l) => {
      const anchorDesc = l.k === "needle" && needle ? needle.a : l.a;
      const at = surface(anchorDesc);
      if (at) addLabel(l.x, l.k, at);
    });
    applyToggles();
  }

  function legend() {
    if (state.combo) {
      const out = state.combo.map((c) => ({ label: c.block.short, color: c.color }));
      if (state.combo.some((c) => (c.block.spread.three.deep || []).some((d) => d.k === "eff") || regionsOf(c.block).regions.some((r) => r.k === "eff"))) {
        out.push({ label: KIND_LABEL.eff, color: KIND_COLOR.eff });
      }
      out.push({ label: "Paler shade = variable spread", color: "rgba(148,163,184,0.6)" });
      return out;
    }
    const { regions } = activeRegions();
    const seen = new Map();
    regions.forEach((r) => {
      if (r.k === "none") return;
      if (r.k === "nerve") { if (!seen.has(r.n)) seen.set(r.n, r.col); return; }
      if (!seen.has(KIND_LABEL[r.k])) seen.set(KIND_LABEL[r.k], KIND_COLOR[r.k]);
    });
    (state.block.spread.three.deep || []).forEach((d) => {
      const label = KIND_LABEL[d.k];
      if (!seen.has(label)) seen.set(label, KIND_COLOR[d.k]);
    });
    return Array.from(seen, ([label, color]) => ({ label, color }));
  }

  function applyToggles() {
    needleGroups.forEach((g) => { g.visible = state.needle; });
    entryRings.forEach((r) => { r.visible = state.needle; });
    deepMeshes.forEach((m) => { m.visible = state.spread; });
    labelLayer.classList.toggle("rg-labels-on", state.labels);
    labelEls.forEach((l) => {
      const hide = ((l.k === "needle" || l.k === "block") && !state.needle) || ((l.k === "tgt" || l.k === "eff") && l.deep && !state.spread);
      l.el.classList.toggle("rg-hidden-kind", hide);
    });
  }

  /* ---------------- camera ---------------- */
  let focusBox = FOCUS.full;
  let viewDir = VIEWS.anterior;
  let zoomFactor = 1;

  function setClip(range) {
    clipLo.constant = range ? -range[0] : 10;
    clipHi.constant = range ? range[1] : 10;
    floor.visible = !range || range[0] < 0.05;
  }

  // Combined framing / sectioning for one or more focus regions.
  function focusFor(keys) {
    const boxes = keys.map((k) => FOCUS[k] || FOCUS.full);
    const box = [Math.min(...boxes.map((b) => b[0])), Math.max(...boxes.map((b) => b[1])), Math.min(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3])), 0];
    const clips = keys.map((k) => (k in CLIP ? CLIP[k] : null));
    const clip = clips.some((c) => !c) ? null : [Math.min(...clips.map((c) => c[0])), Math.max(...clips.map((c) => c[1]))];
    return { box, clip };
  }

  function fitDistance(box) {
    const halfH = (box[3] - box[2]) / 2;
    const halfW = (box[1] - box[0]) / 2;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return Math.max(halfH / tanV, halfW / (tanV * camera.aspect)) * 1.08 + 0.12;
  }

  function applyView() {
    resize();
    const box = focusBox;
    const target = new THREE.Vector3((box[0] + box[1]) / 2, (box[2] + box[3]) / 2, box[4]);
    const dir = new THREE.Vector3(...viewDir).normalize();
    controls.target.copy(target);
    camera.position.copy(target.clone().add(dir.multiplyScalar(fitDistance(box) * zoomFactor)));
    camera.updateProjectionMatrix();
    controls.update();
  }

  function setView(name) {
    viewDir = Array.isArray(name) ? name : (VIEWS[name] || VIEWS.anterior);
    applyView();
  }

  function zoom(factor) {
    const target = controls.target;
    const offset = camera.position.clone().sub(target);
    const len = Math.min(5, Math.max(0.25, offset.length() * factor));
    zoomFactor = len / fitDistance(focusBox);
    camera.position.copy(target.clone().add(offset.setLength(len)));
    controls.update();
  }

  function reset() {
    const blocks = state.combo ? state.combo.map((c) => c.block) : [state.block];
    const f = focusFor(blocks.map((b) => b.spread.three.focus || "full"));
    focusBox = f.box;
    setClip(f.clip);
    zoomFactor = 1;
    const views = Array.from(new Set(blocks.map((b) => b.spread.three.view || "anterior")));
    setView(views.length === 1 ? views[0] : "anterior");
  }

  /* ---------------- sizing / loop ---------------- */
  function resize() {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 300;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  let visible = true;
  const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; });
  io.observe(container);

  const v = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  let raf = 0;
  let disposed = false;
  function frame(time) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!visible || !container.isConnected) return;
    controls.update();
    const pulse = 1 + Math.sin(time / 420) * 0.06;
    deepMeshes.forEach((m) => m.scale.set(m.userData.base[0] * pulse, m.userData.base[1] * pulse, m.userData.base[2] * pulse));
    entryRings.forEach((r) => r.scale.setScalar(1 + (Math.sin(time / 300) + 1) * 0.25));
    renderer.render(scene, camera);

    if (state.labels) layoutLabels();
  }

  // Project labels, flip those near the right edge, then push overlapping
  // labels downward so they never sit on top of each other.
  function layoutLabels() {
    const w = container.clientWidth, h = container.clientHeight;
    const shown = [];
    labelEls.forEach((l) => {
      v.copy(l.p).project(camera);
      toCam.copy(camera.position).sub(l.p);
      const facing = l.deep || l.n.dot(toCam) > 0;
      const onScreen = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
      l.x = (v.x + 1) / 2 * w;
      l.y = (1 - v.y) / 2 * h;
      l.visible = facing && onScreen && !l.el.classList.contains("rg-hidden-kind");
      l.el.classList.toggle("rg-occluded", !l.visible);
      if (!l.visible) return;
      if (!l.size) l.size = [l.el.offsetWidth || 160, l.el.offsetHeight || 22];
      l.flip = l.x + l.size[0] > w - 6;
      shown.push(l);
    });
    shown.sort((a, b) => a.y - b.y);
    const boxes = [];
    shown.forEach((l) => {
      const bw = l.size[0], bh = l.size[1];
      let x0 = l.flip ? l.x - bw : l.x;
      let y = l.y;
      for (let i = 0; i < 8; i++) {
        const hit = boxes.find((b) => x0 < b[2] && x0 + bw > b[0] && y - bh / 2 < b[3] && y + bh / 2 > b[1]);
        if (!hit) break;
        y = hit[3] + bh / 2 + 2;
      }
      boxes.push([x0, y - bh / 2, x0 + bw, y + bh / 2]);
      l.el.classList.toggle("rg-flip", l.flip);
      l.el.style.transform = `translate(${l.x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
  }
  raf = requestAnimationFrame(frame);

  function rebuild() {
    clearOverlay();
    paint();
    buildDeep();
    buildNeedles();
    buildLabels();
  }

  return {
    setBlock(block, variantId) {
      state.combo = null;
      state.block = block;
      const t = block.spread.three;
      state.pose = t.pose || "default";
      applyPose();
      state.variant = variantId || (t.variants && t.variants[0] ? t.variants[0].id : null);
      rebuild();
      reset();
      return legend();
    },
    // blocks: array of block objects (max 4) painted in distinct colours.
    setCombination(blocks) {
      const list = (blocks || []).slice(0, COMBO_COLORS.length);
      state.combo = list.map((b, i) => ({ block: b, color: COMBO_COLORS[i] }));
      state.block = list[0] || null;
      state.pose = list.some((b) => b.spread.three.pose === "abducted") ? "abducted" : "default";
      applyPose();
      if (!list.length) {
        clearOverlay();
        labelEls.forEach((l) => l.el.remove());
        labelEls = [];
        parts.forEach((part) => {
          const attr = part.geometry.attributes.color;
          for (let i = 0; i < attr.count; i++) attr.setXYZ(i, SKIN.r, SKIN.g, SKIN.b);
          attr.needsUpdate = true;
        });
        focusBox = FOCUS.full; setClip(null); zoomFactor = 1; setView("anterior");
        return [];
      }
      rebuild();
      reset();
      return legend();
    },
    colors: COMBO_COLORS.slice(),
    setVariant(id) {
      state.variant = id;
      rebuild();
      return legend();
    },
    setToggles(t) {
      const repaint = t.spread !== undefined && t.spread !== state.spread;
      Object.assign(state, t);
      if (repaint) paint();
      applyToggles();
    },
    setView,
    zoom,
    reset,
    legend,
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      clearOverlay();
      parts.forEach((p) => p.geometry.dispose());
      bodyMat.dispose();
      renderer.dispose();
      container.innerHTML = "";
    }
  };
}
