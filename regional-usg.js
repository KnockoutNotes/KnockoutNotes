/* ==========================================================================
   KNOCKOUTNOTES — Simulated B-mode ultrasound (regional-usg.js)

   Turns one `sono.image` scene from regional-data.js into a realistic,
   scanner-like B-mode frame on a <canvas>. It is a small physics-flavoured
   simulation rather than a drawing:
     1. Tissue map      structures are rasterised (with organic, slightly
                        irregular outlines) into a tissue-index map, a map of
                        specular reflectors (fascia, bone, pleura, needle,
                        vessel walls, epineurium) and a flag map (bone/pleura/gas).
     2. Echogenicity    each tissue gets its own scatter texture — striated
                        muscle, honeycomb or hypoechoic nerves, anechoic
                        vessels and local anaesthetic, septated fat, organ.
     3. Beam physics    attenuation is integrated along each beam line
                        (vertical for linear, radial for curvilinear) with TGC
                        compensation, giving acoustic shadowing behind bone,
                        posterior enhancement behind fluid, lung A-lines below
                        the pleura and needle reverberation.
     4. Speckle         complex Gaussian scatterers are convolved with a
                        depth-dependent point-spread function, envelope-detected
                        and log-compressed — which is what makes real speckle.
   The outlines used here are exported so the SVG overlay can highlight the
   exact same shapes on hover. Deterministic per block (seeded PRNG).
   No external images are used.
   ========================================================================== */
(function () {
  "use strict";

  const W = 400;
  const H = 300;
  // Curvilinear sector: virtual apex above the image, radii in scene units.
  const FAN = { ax: 200, ay: -170, r0: 176, r1: 470, half: 25 * Math.PI / 180 };

  /* ---------------------------------------------------------------- utils */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Smooth value noise in [-1, 1].
  function makeNoise(rand) {
    const P = new Uint8Array(512);
    const G = new Float32Array(256);
    for (let i = 0; i < 256; i++) { P[i] = i; G[i] = rand() * 2 - 1; }
    for (let i = 255; i > 0; i--) { const j = (rand() * (i + 1)) | 0; const t = P[i]; P[i] = P[j]; P[j] = t; }
    for (let i = 0; i < 256; i++) P[i + 256] = P[i];
    return function (x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = x - xi, yf = y - yi;
      const X = xi & 255, Y = yi & 255;
      const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = G[P[P[X] + Y]], b = G[P[P[X + 1] + Y]], c = G[P[P[X] + Y + 1]], d = G[P[P[X + 1] + Y + 1]];
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ------------------------------------------------------ organic outlines */
  // Ellipse with a gently irregular border (real structures are never perfect).
  function organicLoop(cx, cy, rx, ry, rotDeg, amp, rand) {
    const n = Math.max(24, Math.min(72, Math.round((rx + ry) * 0.9)));
    const ph = [rand() * 6.283, rand() * 6.283, rand() * 6.283];
    const rot = (rotDeg || 0) * Math.PI / 180;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const out = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2;
      const k = 1 + amp * (0.55 * Math.sin(2 * a + ph[0]) + 0.3 * Math.sin(3 * a + ph[1]) + 0.15 * Math.sin(5 * a + ph[2]));
      const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
      out.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
    }
    return out;
  }

  const onBorder = (p) => p[0] <= 1 || p[0] >= W - 1 || p[1] <= 1 || p[1] >= H - 1;

  function subdivide(pts, closed, step) {
    const out = [];
    const n = pts.length;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const k = Math.max(1, Math.ceil(len / step));
      for (let j = 0; j < k; j++) {
        const t = j / k;
        out.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], fixed: j === 0 && onBorder(a), border: onBorder(a) && onBorder(b) });
      }
    }
    if (!closed) out.push({ p: pts[n - 1].slice(), fixed: true });
    return out;
  }

  function jitter(list, amp, rand, closed) {
    const n = list.length;
    const ph = rand() * 6.283, ph2 = rand() * 6.283;
    return list.map((q, i) => {
      if (q.fixed || q.border || amp === 0 || (!closed && i === 0)) return q.p;
      const prev = list[(i - 1 + n) % n].p, next = list[(i + 1) % n].p;
      let nx = -(next[1] - prev[1]), ny = next[0] - prev[0];
      const l = Math.hypot(nx, ny) || 1;
      nx /= l; ny /= l;
      const s = i / n * Math.PI * 2;
      const d = amp * (0.65 * Math.sin(3 * s * (closed ? 1 : 2) + ph) + 0.35 * Math.sin(7 * s + ph2));
      return [q.p[0] + nx * d, q.p[1] + ny * d];
    });
  }

  function chaikin(pts, closed) {
    const out = [];
    const n = pts.length;
    if (!closed) out.push(pts[0]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      if (onBorder(a) && onBorder(b)) { out.push(a); continue; }
      out.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25]);
      out.push([a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]);
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  }

  function organicPoly(p, amp, rand) {
    return chaikin(jitter(subdivide(p, true, 9), amp, rand, true), true);
  }

  function organicLine(ln, amp, rand) {
    return chaikin(jitter(subdivide(ln, false, 8), amp, rand, false), false);
  }

  function loopsOf(st, amp, rand) {
    if (st.c) return [organicLoop(st.c[0], st.c[1], st.c[2], st.c[2], 0, amp, rand)];
    if (st.el) return [organicLoop(st.el[0], st.el[1], st.el[2], st.el[3], st.el[4], amp, rand)];
    if (st.cs) return st.cs.map((c) => organicLoop(c[0], c[1], c[2], c[2], 0, amp, rand));
    if (st.p) return [organicPoly(st.p, amp * 30, rand)];
    return [];
  }

  // Irregularity of each tissue's outline (fraction of radius; ×30 = units for polygons).
  const AMP = { muscle: 0.05, nerve: 0.025, artery: 0.012, vein: 0.07, organ: 0.03, bowel: 0.04, tendon: 0.04, space: 0.02 };
  const LINE_AMP = { fascia: 0.7, ligament: 0.35, bone: 0.45, pleura: 0.3, artery: 0.2 };

  /* --------------------------------------------------------------- geometry */
  const geoCache = new WeakMap();

  function prepare(scene, key) {
    if (geoCache.has(scene)) return geoCache.get(scene);
    const rand = mulberry32(hash("geo|" + (key || "")));
    const items = scene.s.map((st) => {
      if (st.t === "outline" || st.t === "point" || st.t === "marker") return { st, kind: "none" };
      if (st.ln && !st.p && !st.el && !st.c && !st.cs) {
        return { st, kind: "line", lines: [organicLine(st.ln, LINE_AMP[st.t] == null ? 0.5 : LINE_AMP[st.t], rand)] };
      }
      if (st.t === "sheath") {
        return { st, kind: "line", closed: true, lines: loopsOf(st, 0.03, rand) };
      }
      return { st, kind: "region", loops: loopsOf(st, AMP[st.t] == null ? 0.04 : AMP[st.t], rand) };
    });
    const spreads = (scene.spreads || []).map((s) => loopsOf(s, 0.11, rand)[0]).filter(Boolean);
    const geo = { items, spreads };
    geoCache.set(scene, geo);
    return geo;
  }

  function pathD(loops, closed) {
    return loops.map((l) => "M" + l.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") + (closed ? "Z" : "")).join("");
  }

  /* ------------------------------------------------------------- tissues */
  // Texture codes
  const T_BG = 0, T_MUS = 1, T_NHYPO = 2, T_NHON = 3, T_ART = 4, T_VEIN = 5, T_LA = 6, T_ORG = 7, T_BOW = 8, T_TEN = 9, T_FLUID = 10;
  // Relative attenuation (soft tissue = 1). Fluid ≪ tissue → posterior enhancement.
  const ALPHA = [1, 1.1, 1, 1, 0.1, 0.12, 0.1, 1, 1.3, 1.3, 0.1];
  const LAYER = { organ: 1, bowel: 1, muscle: 2, spread: 3, fluid: 3, tendon: 4, vein: 5, artery: 6, nerve: 7 };

  function codeFor(st) {
    switch (st.t) {
      case "muscle": return T_MUS;
      case "nerve": return st.e === "honey" ? T_NHON : T_NHYPO;
      case "artery": return T_ART;
      case "vein": return T_VEIN;
      case "organ": return T_ORG;
      case "bowel": return T_BOW;
      case "tendon": return T_TEN;
      case "space": return st.fluid ? T_FLUID : -1;
      default: return -1;
    }
  }

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  function tracePath(ctx, loops, closed) {
    ctx.beginPath();
    loops.forEach((l) => {
      l.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
      if (closed) ctx.closePath();
    });
  }

  /* ---------------------------------------------------------------- draw */
  // opts: { key, scale, needle, spread }
  function draw(canvas, scene, opts) {
    const o = Object.assign({ scale: 2, needle: true, spread: true, key: "kn" }, opts || {});
    const S = o.scale;
    const Wp = Math.round(W * S), Hp = Math.round(H * S);
    const N = Wp * Hp;
    const curvi = scene.probe === "curvilinear";
    const geo = prepare(scene, o.key);
    const rand = mulberry32(hash("px|" + o.key));
    const nA = makeNoise(rand), nB = makeNoise(rand), nC = makeNoise(rand);

    /* ---- 1. ordered region list (layered) ---- */
    const regions = [];
    geo.items.forEach((it) => {
      if (it.kind !== "region") return;
      const code = codeFor(it.st);
      if (code < 0) return;
      const layer = code === T_FLUID ? LAYER.fluid : LAYER[it.st.t] || 2;
      regions.push({ it, code, layer, loops: it.loops, st: it.st });
    });
    if (o.spread) geo.spreads.forEach((loop) => regions.push({ code: T_LA, layer: LAYER.spread, loops: [loop], st: { t: "spread" } }));
    regions.sort((a, b) => a.layer - b.layer);
    regions.forEach((r, i) => { r.id = i + 1; });

    // per-region texture parameters
    regions.forEach((r) => {
      const st = r.st;
      r.fib = ((st.el && st.el[4]) || 0) * Math.PI / 180 + (rand() - 0.5) * 0.35;
      if (r.code === T_NHON) {
        const rad = st.c ? st.c[2] : st.el ? Math.min(st.el[2], st.el[3]) : st.cs ? st.cs.reduce((s, c) => s + c[2], 0) / st.cs.length : 8;
        r.cell = clamp(rad / 2.3, 2.2, 6.5);
        r.seed = (rand() * 1e6) | 0;
      }
      if (r.code === T_ORG && st.el) r.sinus = /kid/.test(st.id || "") ? st.el : null;
      if (r.code === T_TEN && st.el) r.fib = (st.el[4] || 0) * Math.PI / 180;
    });

    /* ---- 2. rasterise index / reflector / flag maps ---- */
    const cI = makeCanvas(Wp, Hp), xI = cI.getContext("2d", { willReadFrequently: true });
    const cR = makeCanvas(Wp, Hp), xR = cR.getContext("2d", { willReadFrequently: true });
    const cF = makeCanvas(Wp, Hp), xF = cF.getContext("2d", { willReadFrequently: true });
    [xI, xR, xF].forEach((x) => { x.setTransform(S, 0, 0, S, 0, 0); x.lineJoin = "round"; x.lineCap = "round"; });
    xI.fillStyle = "rgb(0,0,255)"; xI.fillRect(0, 0, W, H);
    xR.fillStyle = "#000"; xR.fillRect(0, 0, W, H);
    xF.fillStyle = "#000"; xF.fillRect(0, 0, W, H);

    const RIM = { [T_MUS]: [1.1, 0.18], [T_NHYPO]: [1.0, 0.24], [T_NHON]: [1.0, 0.24], [T_ART]: [1.5, 0.32], [T_VEIN]: [0.8, 0.15], [T_ORG]: [1.2, 0.34], [T_BOW]: [2.0, 0.46], [T_TEN]: [1.0, 0.3], [T_LA]: [1.0, 0.12], [T_FLUID]: [0.8, 0.08] };
    const white = (a) => `rgba(255,255,255,${clamp(a, 0, 1).toFixed(3)})`;

    function paintRegion(r) {
      tracePath(xI, r.loops, true);
      xI.fillStyle = `rgb(${r.id},${(r.id * 53) & 255},${255 - r.id})`;
      xI.fill();
      tracePath(xR, r.loops, true);
      xR.fillStyle = "#000";
      xR.fill();
      const rim = RIM[r.code];
      if (rim) { xR.lineWidth = rim[0]; xR.strokeStyle = white(rim[1]); xR.stroke(); }
      if (r.code === T_BOW) { tracePath(xF, r.loops, true); xF.fillStyle = "rgb(0,0,255)"; xF.fill(); }
    }

    function strokeLines(it, width, alpha) {
      tracePath(xR, it.lines, !!it.closed);
      xR.lineWidth = width; xR.strokeStyle = white(alpha); xR.stroke();
    }

    regions.filter((r) => r.layer < LAYER.spread).forEach(paintRegion);
    geo.items.forEach((it) => {
      if (it.kind !== "line") return;
      const t = it.st.t;
      if (t === "fascia") strokeLines(it, 1.3, 0.42);
      else if (t === "ligament") strokeLines(it, 1.8, 0.62);
      else if (t === "sheath") strokeLines(it, 1.0, 0.3);
      else if (t === "artery") strokeLines(it, 1.2, 0.35);
    });
    regions.filter((r) => r.layer >= LAYER.spread).forEach(paintRegion);
    geo.items.forEach((it) => {
      if (it.kind !== "line") return;
      const t = it.st.t;
      if (t === "bone") {
        strokeLines(it, 6, 0.18);
        strokeLines(it, 2.8, 0.85);
        tracePath(xF, it.lines, false); xF.lineWidth = 3.2; xF.strokeStyle = "rgb(255,0,0)"; xF.stroke();
      } else if (t === "pleura") {
        strokeLines(it, 1.8, 0.72);
        tracePath(xF, it.lines, false); xF.lineWidth = 2.1; xF.strokeStyle = "rgb(0,255,0)"; xF.stroke();
      }
    });

    // Needle: specular shaft (brightest when parallel to the probe) + reverberation.
    if (o.needle) {
      xR.globalCompositeOperation = "lighter";
      (scene.needles || []).forEach((nd) => {
        const [x1, y1] = nd.from, [x2, y2] = nd.to;
        const ang = Math.atan2(y2 - y1, x2 - x1);
        const h = Math.abs(Math.cos(ang));
        const I = 0.4 + 0.6 * h * h;
        let bx = 0, by = 1;
        if (curvi) {
          const mx = (x1 + x2) / 2 - FAN.ax, my = (y1 + y2) / 2 - FAN.ay;
          const l = Math.hypot(mx, my); bx = mx / l; by = my / l;
        }
        for (let k = 4; k >= 1; k--) {
          const off = 2.5 * k;
          xR.beginPath(); xR.moveTo(x1 + bx * off, y1 + by * off); xR.lineTo(x2 + bx * off, y2 + by * off);
          xR.lineWidth = 1.1; xR.strokeStyle = white(I * h * 0.42 * Math.pow(0.62, k - 1)); xR.stroke();
        }
        xR.beginPath(); xR.moveTo(x1, y1); xR.lineTo(x2, y2);
        xR.lineWidth = 1.2; xR.strokeStyle = white(I * 0.85); xR.stroke();
        xR.beginPath(); xR.arc(x2, y2, 1.5, 0, Math.PI * 2); xR.fillStyle = white(1); xR.fill();
      });
      xR.globalCompositeOperation = "source-over";
    }

    const dI = xI.getImageData(0, 0, Wp, Hp).data;
    const dR = xR.getImageData(0, 0, Wp, Hp).data;
    const dF = xF.getImageData(0, 0, Wp, Hp).data;

    /* ---- 3. resolve index map & echogenicity ---- */
    const byId = [null];
    regions.forEach((r) => { byId[r.id] = r; });
    const idx = new Uint8Array(N);
    const amp = new Float32Array(N);
    const refl = new Float32Array(N);
    const codeAt = new Uint8Array(N);

    // Honeycomb (Worley F1) for fascicular nerves.
    function worley(x, y, cell, seed) {
      const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      let best = 1e9;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const cx = gx + i, cy = gy + j;
          const h1 = hash2(cx, cy, seed), h2 = hash2(cy, cx, seed + 17);
          const fx = (cx + 0.2 + 0.6 * h1) * cell, fy = (cy + 0.2 + 0.6 * h2) * cell;
          const d = (x - fx) * (x - fx) + (y - fy) * (y - fy);
          if (d < best) best = d;
        }
      }
      return Math.sqrt(best) / cell;
    }

    for (let py = 0; py < Hp; py++) {
      const sy = (py + 0.5) / S;
      for (let px = 0; px < Wp; px++) {
        const p = py * Wp + px;
        const q = p * 4;
        const r = dI[q], g = dI[q + 1], b = dI[q + 2];
        let id;
        if (g === ((r * 53) & 255) && b === 255 - r && (r === 0 || byId[r])) id = r;
        else id = px > 0 ? idx[p - 1] : (py > 0 ? idx[p - Wp] : 0);
        idx[p] = id;
        const reg = byId[id];
        const code = reg ? reg.code : T_BG;
        codeAt[p] = code;
        refl[p] = dR[q] / 255;

        const sx = (px + 0.5) / S;
        let a;
        switch (code) {
          case T_MUS: {
            const c = Math.cos(reg.fib), s = Math.sin(reg.fib);
            const u = sx * c + sy * s, v = -sx * s + sy * c;
            const ridge = 1 - Math.abs(nA(u * 0.035, v * 0.3));
            a = 0.034 + 0.014 * nB(sx * 0.06, sy * 0.06) + 0.28 * Math.pow(ridge, 14);
            break;
          }
          case T_NHYPO: {
            const ridge = 1 - Math.abs(nC(sx * 0.25, sy * 0.25));
            a = 0.03 + 0.09 * Math.pow(ridge, 9);
            break;
          }
          case T_NHON: {
            const d = worley(sx, sy, reg.cell, reg.seed);
            a = d < 0.42 ? 0.035 : 0.28 + 0.2 * clamp((d - 0.42) * 2.5, 0, 1);
            break;
          }
          case T_ART: a = 0.004; break;
          case T_VEIN: a = 0.012; break;
          case T_LA: case T_FLUID: a = 0.008; break;
          case T_ORG: {
            a = 0.2 + 0.04 * nB(sx * 0.2, sy * 0.2);
            if (reg.sinus) {
              const e = reg.sinus;
              const dx = (sx - e[0]) / (e[2] * 0.52), dy = (sy - e[1]) / (e[3] * 0.42);
              const rr = dx * dx + dy * dy + 0.25 * nC(sx * 0.12, sy * 0.12);
              if (rr < 1) a = 0.55 + 0.2 * nA(sx * 0.3, sy * 0.3);
              else if (rr < 1.9) a = 0.1 + 0.04 * nA(sx * 0.2, sy * 0.2); // hypoechoic medullary pyramids
            }
            break;
          }
          case T_BOW: {
            const gas = nA(sx * 0.045, sy * 0.07) + 0.5 * nB(sx * 0.12, sy * 0.12);
            a = gas > 0.42 ? 0.95 : 0.2 + 0.1 * nC(sx * 0.1, sy * 0.1);
            break;
          }
          case T_TEN: {
            const c = Math.cos(reg.fib), s = Math.sin(reg.fib);
            const u = sx * c + sy * s, v = -sx * s + sy * c;
            a = 0.34 + 0.26 * Math.pow(1 - Math.abs(nA(u * 0.05, v * 0.55)), 6);
            break;
          }
          default: {
            // skin → subcutaneous fat with septa → connective tissue
            const ridge = 1 - Math.abs(nA(sx * 0.055, sy * 0.2));
            a = 0.11 + 0.045 * nB(sx * 0.03, sy * 0.03) + 0.4 * Math.pow(ridge, 8);
            const skin = curvi ? 0 : clamp(1 - sy / 6, 0, 1);
            a = a * (1 - skin) + 0.7 * skin;
          }
        }
        amp[p] = a;
      }
    }

    /* ---- 4. beam model: attenuation, shadow, enhancement, pleura ---- */
    // Polar (curvilinear) or column (linear) beam grid in scene units.
    const nRay = Math.round(Wp * (curvi ? 1.15 : 1));
    const nDep = Math.round(Hp * (curvi ? 1.05 : 1));
    const beamDepth = curvi ? FAN.r1 - FAN.r0 : H;
    const K = 2.4 / H;                 // tissue attenuation per scene unit
    const trP = new Float32Array(nRay * nDep);
    const lungP = new Float32Array(nRay * nDep);
    const step = beamDepth / nDep;
    const boneF = Math.pow(0.02, 1 / (3.2 / step));
    const gasF = Math.pow(0.6, step);

    function beamToXY(j, i) {
      const d = (i + 0.5) * step;
      if (!curvi) return [(j + 0.5) / nRay * W, d];
      const th = -FAN.half + (j + 0.5) / nRay * 2 * FAN.half;
      const r = FAN.r0 + d;
      return [FAN.ax + r * Math.sin(th), FAN.ay + r * Math.cos(th)];
    }

    for (let j = 0; j < nRay; j++) {
      let T = 1;
      let state = 0;          // 0 tissue, 1 in pleura, 2 below pleura (air)
      let pd = 0;
      for (let i = 0; i < nDep; i++) {
        const [x, y] = beamToXY(j, i);
        const k = j * nDep + i;
        const px = (x * S) | 0, py = (y * S) | 0;
        if (px < 0 || py < 0 || px >= Wp || py >= Hp) { trP[k] = T; continue; }
        const p = py * Wp + px;
        const q = p * 4;
        trP[k] = T;
        const d = (i + 0.5) * step;
        if (state === 2) { lungP[k] = d / pd; continue; }
        const pleura = dF[q + 1] > 110;
        if (pleura && state === 0) { state = 1; pd = d; }
        else if (!pleura && state === 1) { state = 2; lungP[k] = d / pd; continue; }
        T *= Math.exp(-K * ALPHA[codeAt[p]] * step);
        if (dF[q] > 110) T *= boneF;
        if (dF[q + 2] > 110 && amp[p] > 0.8) T *= gasF;
      }
    }

    /* ---- 5. complex scatter field ---- */
    const re = new Float32Array(N);
    const im = new Float32Array(N);
    const focus = (scene.needles && scene.needles[0] ? scene.needles[0].to[1] : H * 0.5);
    const inFan = curvi ? new Uint8Array(N) : null;
    const gain = new Float32Array(nDep);
    for (let i = 0; i < nDep; i++) {
      const d = (i + 0.5) * step;
      const f = d / beamDepth;
      const df = ((curvi ? FAN.ay + FAN.r0 + d : d) - focus) / 45;
      gain[i] = Math.exp(K * d) * (1 - 0.42 * Math.pow(f, 1.3)) * (1 + 0.16 * Math.exp(-df * df));
    }

    let spare = null;
    const gauss = () => {
      if (spare !== null) { const s = spare; spare = null; return s; }
      const u = rand() || 1e-9, v = rand();
      const m = Math.sqrt(-2 * Math.log(u));
      spare = m * Math.sin(6.2831853 * v);
      return m * Math.cos(6.2831853 * v);
    };

    for (let py = 0; py < Hp; py++) {
      const y = (py + 0.5) / S;
      for (let px = 0; px < Wp; px++) {
        const x = (px + 0.5) / S;
        const p = py * Wp + px;
        let j, i;
        if (curvi) {
          const dx = x - FAN.ax, dy = y - FAN.ay;
          const th = Math.atan2(dx, dy);
          const r = Math.hypot(dx, dy);
          if (Math.abs(th) > FAN.half || r < FAN.r0 || r > FAN.r1) continue;
          inFan[p] = 1;
          j = Math.min(nRay - 1, Math.max(0, Math.floor((th + FAN.half) / (2 * FAN.half) * nRay)));
          i = Math.min(nDep - 1, Math.max(0, Math.floor((r - FAN.r0) / step)));
        } else {
          j = Math.min(nRay - 1, Math.floor(x / W * nRay));
          i = Math.min(nDep - 1, Math.floor(y / step));
        }
        const k = j * nDep + i;
        const G = gain[i] * trP[k];
        let A = amp[p], R = refl[p];
        const q = lungP[k];
        if (q > 1) {
          // Aerated lung: no tissue signal, only artefact — A-lines at multiples of the pleural depth.
          A = 0.05 * (1 + 0.6 * nC(x * 0.05, y * 0.4));
          R = 0;
          for (let n = 2; n <= 4; n++) {
            const w = 1.3 / (q > 0 ? (y / q) : 1);
            const dd = Math.abs(q - n) / w;
            if (dd < 1) R = Math.max(R, (0.62 / (n - 1)) * (1 - dd * dd));
          }
        }
        const frag = R > 0 ? 0.55 + 0.45 * nB(x * 0.13, y * 0.13) : 0;
        re[p] = (A * gauss() + R * frag * (0.9 + 0.4 * rand())) * G + 0.003 * gauss() * Math.sqrt(gain[i]);
        im[p] = (A * gauss() + R * 0.35 * gauss()) * G + 0.003 * gauss() * Math.sqrt(gain[i]);
      }
    }

    /* ---- 6. point-spread function (separable, depth-dependent) ---- */
    const sigY = 0.75 * S;
    function kernel(sig) {
      const rad = Math.max(1, Math.ceil(sig * 2.5));
      const k = new Float32Array(rad * 2 + 1);
      let e = 0;
      for (let i = -rad; i <= rad; i++) { const v = Math.exp(-(i * i) / (2 * sig * sig)); k[i + rad] = v; e += v * v; }
      const nrm = 1 / Math.sqrt(e);
      for (let i = 0; i < k.length; i++) k[i] *= nrm;
      return { k, rad };
    }
    const tmpR = new Float32Array(N), tmpI = new Float32Array(N);
    const kCache = new Map();
    for (let py = 0; py < Hp; py++) {
      const y = py / S;
      const f = curvi ? clamp((y - 6) / H, 0, 1) : clamp(Math.abs(y - focus) / H, 0, 1);
      const sx = (curvi ? 1.4 + 2.4 * f : 1.4 + 1.2 * f) * S;
      const key = Math.round(sx * 4);
      let kk = kCache.get(key);
      if (!kk) { kk = kernel(key / 4); kCache.set(key, kk); }
      const { k, rad } = kk;
      const row = py * Wp;
      for (let px = 0; px < Wp; px++) {
        let ar = 0, ai = 0;
        for (let t = -rad; t <= rad; t++) {
          const xx = px + t < 0 ? 0 : px + t >= Wp ? Wp - 1 : px + t;
          const w = k[t + rad];
          ar += re[row + xx] * w; ai += im[row + xx] * w;
        }
        tmpR[row + px] = ar; tmpI[row + px] = ai;
      }
    }
    const ky = kernel(sigY);
    const out = new Float32Array(N);
    for (let py = 0; py < Hp; py++) {
      for (let px = 0; px < Wp; px++) {
        let ar = 0, ai = 0;
        for (let t = -ky.rad; t <= ky.rad; t++) {
          const yy = py + t < 0 ? 0 : py + t >= Hp ? Hp - 1 : py + t;
          const w = ky.k[t + ky.rad];
          ar += tmpR[yy * Wp + px] * w; ai += tmpI[yy * Wp + px] * w;
        }
        out[py * Wp + px] = Math.sqrt(ar * ar + ai * ai);
      }
    }

    /* ---- 7. log compression → grey ---- */
    const ctx = canvas.getContext("2d");
    canvas.width = Wp; canvas.height = Hp;
    const img = ctx.createImageData(Wp, Hp);
    const px4 = img.data;
    const DR = 50;            // displayed dynamic range, dB
    const REF = 3.4;          // amplitude that maps to white
    const lg = tmpR;          // reuse buffer: log-compressed image
    for (let p = 0; p < N; p++) {
      const db = 20 * Math.log10(out[p] / REF + 1e-6);
      lg[p] = clamp((db + DR) / DR, 0, 1);
    }
    // light speckle-reduction smoothing, as scanners do after log compression
    const ks = kernel(1.9 * S);
    let ksum = 0;
    for (let i = 0; i < ks.k.length; i++) ksum += ks.k[i];
    const sm = tmpI;
    for (let py = 0; py < Hp; py++) {
      for (let px = 0; px < Wp; px++) {
        let a = 0;
        for (let t = -ks.rad; t <= ks.rad; t++) {
          const xx = px + t < 0 ? 0 : px + t >= Wp ? Wp - 1 : px + t;
          a += lg[py * Wp + xx] * ks.k[t + ks.rad];
        }
        sm[py * Wp + px] = a / ksum;
      }
    }
    for (let py = 0; py < Hp; py++) {
      for (let px = 0; px < Wp; px++) {
        let a = 0;
        for (let t = -ks.rad; t <= ks.rad; t++) {
          const yy = py + t < 0 ? 0 : py + t >= Hp ? Hp - 1 : py + t;
          a += sm[yy * Wp + px] * ks.k[t + ks.rad];
        }
        lg[py * Wp + px] = a / ksum;
      }
    }
    // second light smoothing pass (compounds with the first for a soft, low-noise frame)
    const ks2 = kernel(1.1 * S);
    let ksum2 = 0;
    for (let i = 0; i < ks2.k.length; i++) ksum2 += ks2.k[i];
    for (let py = 0; py < Hp; py++) {
      for (let px = 0; px < Wp; px++) {
        let a = 0;
        for (let t = -ks2.rad; t <= ks2.rad; t++) {
          const xx = px + t < 0 ? 0 : px + t >= Wp ? Wp - 1 : px + t;
          a += lg[py * Wp + xx] * ks2.k[t + ks2.rad];
        }
        sm[py * Wp + px] = a / ksum2;
      }
    }
    for (let py = 0; py < Hp; py++) {
      for (let px = 0; px < Wp; px++) {
        let a = 0;
        for (let t = -ks2.rad; t <= ks2.rad; t++) {
          const yy = py + t < 0 ? 0 : py + t >= Hp ? Hp - 1 : py + t;
          a += sm[yy * Wp + px] * ks2.k[t + ks2.rad];
        }
        lg[py * Wp + px] = a / ksum2;
      }
    }
    for (let p = 0; p < N; p++) {
      const q = p * 4;
      let v = 0;
      if (!curvi || inFan[p]) v = Math.pow(lg[p], 2.35) * 0.92;
      const g = v * 255;
      px4[q] = g; px4[q + 1] = g; px4[q + 2] = Math.min(255, g * 1.03 + 1); px4[q + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  function hash2(x, y, seed) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // SVG path of the curvilinear sector (for framing / clipping the overlay).
  function fanPath() {
    const { ax, ay, r0, r1, half } = FAN;
    const p = (r, a) => [ax + r * Math.sin(a), ay + r * Math.cos(a)].map((v) => v.toFixed(1)).join(",");
    return `M${p(r0, -half)} A${r0},${r0} 0 0,0 ${p(r0, half)} L${p(r1, half)} A${r1},${r1} 0 0,1 ${p(r1, -half)} Z`;
  }

  window.KNRegionalUS = { draw, prepare, pathD, fanPath, FAN };
})();
