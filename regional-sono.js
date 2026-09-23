/* ==========================================================================
   KNOCKOUTNOTES — Regional block image renderer (regional-sono.js)

   Renders one `sono.image` scene from regional-data.js two ways:
     mode "sono" — simulated B-mode ultrasound frame (canvas, regional-usg.js)
                   under an SVG overlay with hover/tap outlines and labels and
                   toggles for labels/needle/spread. Landmark scenes (scalp)
                   keep the drawn SVG map.
     mode "line" — exam-style line diagram (paper, coloured outlines,
                   always-on leader labels) for drawing in exams.
   Plus brachial and lumbosacral plexus schematics with the block level
   highlighted. All artwork is original, generated here — no external images.
   ========================================================================== */
(function () {
  "use strict";

  let uidCounter = 0;
  const W = 400;
  const H = 300;

  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const pts = (arr) => arr.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  const PILL = {
    muscle: ["#be123c", "#fff"], nerve: ["#f59e0b", "#1c1003"], artery: ["#dc2626", "#fff"],
    vein: ["#2563eb", "#fff"], bone: ["#475569", "#fff"], pleura: ["#0d9488", "#fff"],
    bowel: ["#0f766e", "#fff"], organ: ["#7c3aed", "#fff"], fascia: ["#0891b2", "#fff"],
    ligament: ["#0891b2", "#fff"], sheath: ["#0891b2", "#fff"], tendon: ["#6b7280", "#fff"],
    space: ["#0284c7", "#fff"], marker: ["#15803d", "#fff"], point: ["#e11d48", "#fff"],
    needle: ["#f8fafc", "#0f172a"], spread: ["#0ea5e9", "#fff"]
  };

  const LINE = {
    muscle: { fill: "#fde2e4", stroke: "#9f1239" },
    nerve: { fill: "#fde047", stroke: "#854d0e" },
    artery: { fill: "#fecaca", stroke: "#b91c1c" },
    vein: { fill: "#bfdbfe", stroke: "#1d4ed8" },
    tendon: { fill: "#e5e7eb", stroke: "#4b5563" },
    organ: { fill: "#ede9fe", stroke: "#6d28d9" },
    bowel: { fill: "#ecfdf5", stroke: "#0f766e" }
  };

  function centroid(st) {
    if (st.c) return [st.c[0], st.c[1]];
    if (st.el) return [st.el[0], st.el[1]];
    if (st.cs) {
      let x = 0, y = 0;
      st.cs.forEach((c) => { x += c[0]; y += c[1]; });
      return [x / st.cs.length, y / st.cs.length];
    }
    const list = st.p || st.ln || [];
    if (!list.length) return [W / 2, H / 2];
    if (st.ln) return list[Math.floor((list.length - 1) / 2)];
    let x = 0, y = 0;
    list.forEach((p) => { x += p[0]; y += p[1]; });
    return [x / list.length, y / list.length];
  }

  function ellipseTag(e, attrs) {
    const rot = e[4] ? ` transform="rotate(${e[4]} ${e[0]} ${e[1]})"` : "";
    return `<ellipse cx="${e[0]}" cy="${e[1]}" rx="${e[2]}" ry="${e[3]}"${rot} ${attrs}/>`;
  }

  function shapeTag(st, attrs) {
    if (st.path) return `<path d="${st.path}" ${attrs}/>`;
    if (st.c) return `<circle cx="${st.c[0]}" cy="${st.c[1]}" r="${st.c[2]}" ${attrs}/>`;
    if (st.el) return ellipseTag(st.el, attrs);
    if (st.p) return `<polygon points="${pts(st.p)}" ${attrs}/>`;
    if (st.ln) return `<polyline points="${pts(st.ln)}" fill="none" ${attrs}/>`;
    if (st.cs) return st.cs.map((c) => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" ${attrs}/>`).join("");
    return "";
  }

  // Region below a polyline down to the image floor (acoustic shadow / lung).
  function belowPolygon(line, floor) {
    const first = line[0];
    const last = line[line.length - 1];
    return pts(line.concat([[last[0], floor], [first[0], floor]]));
  }

  /* ------------------------------------------------------------------------
     Definitions (patterns / filters) — suffixed with a unique id per render
     ------------------------------------------------------------------------ */
  function defs(u, mode) {
    if (mode === "line") {
      return `<defs>
        <pattern id="hatch-${u}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#94a3b8" stroke-width="1"/>
        </pattern>
        <marker id="arw-${u}" viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L6,3 L0,6 z" fill="#334155"/>
        </marker>
      </defs>`;
    }
    return `<defs>
      <filter id="spk-${u}" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${(uidCounter * 7) % 97}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.87  0 0 0 0 0.9  0 0 0 1.4 -0.55"/>
      </filter>
      <filter id="glow-${u}" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.4" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <pattern id="mus-${u}" width="14" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)">
        <rect width="14" height="7" fill="#3a404b"/>
        <line x1="0" y1="2" x2="14" y2="2" stroke="#6b7280" stroke-width="0.8" opacity="0.55"/>
        <line x1="0" y1="5.5" x2="9" y2="5.5" stroke="#8b93a1" stroke-width="0.6" opacity="0.4"/>
      </pattern>
      <pattern id="hon-${u}" width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="#9ca3af"/>
        <circle cx="2.5" cy="2.5" r="1.25" fill="#1f2937"/>
      </pattern>
      <pattern id="fib-${u}" width="10" height="3" patternUnits="userSpaceOnUse">
        <rect width="10" height="3" fill="#8f97a3"/>
        <line x1="0" y1="1.5" x2="10" y2="1.5" stroke="#e5e7eb" stroke-width="0.9"/>
      </pattern>
      <pattern id="lung-${u}" width="400" height="26" patternUnits="userSpaceOnUse">
        <rect width="400" height="26" fill="#090b10"/>
        <line x1="0" y1="20" x2="400" y2="20" stroke="#cbd5e1" stroke-width="1.2" opacity="0.35"/>
      </pattern>
      <pattern id="bow-${u}" width="30" height="18" patternUnits="userSpaceOnUse">
        <rect width="30" height="18" fill="#161b24"/>
        <path d="M2,6 q6,-5 12,0 t12,0" stroke="#cbd5e1" stroke-width="1" fill="none" opacity="0.45"/>
      </pattern>
      <linearGradient id="shd-${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0.92"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.98"/>
      </linearGradient>
      <linearGradient id="att-${u}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="0.55" stop-color="#000" stop-opacity="0.08"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.55"/>
      </linearGradient>
      <radialGradient id="skin-${u}" cx="0.45" cy="0.4" r="0.7">
        <stop offset="0" stop-color="#f6d6bd"/>
        <stop offset="1" stop-color="#d9a987"/>
      </radialGradient>
      <clipPath id="clip-${u}">
        <path d="M120,6 Q200,-2 280,6 L398,294 Q200,318 2,294 Z"/>
      </clipPath>
    </defs>`;
  }

  /* ------------------------------------------------------------------------
     Structure drawing — ultrasound mode
     ------------------------------------------------------------------------ */
  const LAYER_ORDER = { muscle: 1, organ: 2, bowel: 2, tendon: 3, fascia: 4, sheath: 4, ligament: 4, space: 6, bone: 5, pleura: 5, vein: 7, artery: 7, nerve: 8, marker: 9, outline: 0, point: 9 };

  function sonoStructure(st, u) {
    const sid = ` data-sid="${esc(st.id)}"`;
    const cls = ` class="rg-s rg-t-${st.t}"`;
    switch (st.t) {
      case "muscle":
        return `<g${cls}${sid}>${shapeTag(st, `fill="url(#mus-${u})" fill-opacity="0.78" stroke="#d1d5db" stroke-opacity="0.75" stroke-width="1.5"`)}</g>`;
      case "nerve": {
        const fill = st.e === "honey" ? `url(#hon-${u})` : "#06080d";
        return `<g${cls}${sid}>${shapeTag(st, `fill="${fill}" stroke="#e5e7eb" stroke-width="1.5"`)}</g>`;
      }
      case "artery":
        return `<g${cls}${sid}>${st.ln
          ? shapeTag(st, `stroke="#fca5a5" stroke-width="2" stroke-dasharray="4 3"`)
          : `<g class="rg-pulse">${shapeTag(st, `fill="#000" stroke="#e2e8f0" stroke-width="2.2"`)}</g>`}</g>`;
      case "vein":
        return `<g${cls}${sid}>${shapeTag(st, `fill="#030406" stroke="#94a3b8" stroke-width="1"`)}</g>`;
      case "bone":
        return `<g${cls}${sid}><polygon points="${belowPolygon(st.ln, H)}" fill="url(#shd-${u})"/>` +
          `<polyline points="${pts(st.ln)}" fill="none" stroke="#f8fafc" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow-${u})"/></g>`;
      case "pleura":
        return `<g${cls}${sid}><polygon class="rg-lung" points="${belowPolygon(st.ln, H)}" fill="url(#lung-${u})" opacity="0.85"/>` +
          `<polyline points="${pts(st.ln)}" fill="none" stroke="#f1f5f9" stroke-width="2.6" stroke-linecap="round" filter="url(#glow-${u})"/></g>`;
      case "bowel":
        return `<g${cls}${sid}>${shapeTag(st, `fill="url(#bow-${u})" opacity="0.9"`)}</g>`;
      case "organ":
        return `<g${cls}${sid}>${shapeTag(st, `fill="#262c36" stroke="#9ca3af" stroke-width="1.2"`)}</g>`;
      case "tendon":
        return `<g${cls}${sid}>${shapeTag(st, `fill="url(#fib-${u})" stroke="#f1f5f9" stroke-width="1.2"`)}</g>`;
      case "fascia":
        return `<g${cls}${sid}>${shapeTag(st, `stroke="#e2e8f0" stroke-width="1.6" stroke-opacity="0.9" stroke-linecap="round"`)}</g>`;
      case "ligament":
        return `<g${cls}${sid}>${shapeTag(st, `stroke="#f8fafc" stroke-width="2.6" stroke-linecap="round" filter="url(#glow-${u})"`)}</g>`;
      case "sheath":
        return `<g${cls}${sid}>${shapeTag(st, `fill="none" stroke="#e2e8f0" stroke-width="1.4" stroke-opacity="0.85"`)}</g>`;
      case "space":
        return `<g${cls}${sid}>${shapeTag(st, `fill="rgba(56,189,248,0.07)" stroke="rgba(125,211,252,0.75)" stroke-width="1.2" stroke-dasharray="4 3"`)}</g>`;
      case "marker": {
        const c = centroid(st);
        return `<g${cls}${sid}><circle cx="${c[0]}" cy="${c[1]}" r="7" fill="transparent"/>` +
          `<path d="M${c[0] - 6},${c[1]} h12 M${c[0]},${c[1] - 6} v12" stroke="#4ade80" stroke-width="1.6"/></g>`;
      }
      case "outline":
        return `<g class="rg-outline">${shapeTag(st, `stroke="#8a5a3b" stroke-width="2.6" stroke-linejoin="round" fill="${st.id === "head" ? `url(#skin-${u})` : st.id === "eye" ? "#f8fafc" : "#efc3a3"}"`).replace('fill="none" ', "")}</g>`;
      case "point": {
        const c = centroid(st);
        return `<g${cls}${sid}><circle cx="${c[0]}" cy="${c[1]}" r="9" fill="rgba(225,29,72,0.18)"/>` +
          `<circle cx="${c[0]}" cy="${c[1]}" r="4.2" fill="#e11d48" stroke="#fff" stroke-width="1.4"/></g>`;
      }
      default:
        return "";
    }
  }

  /* ------------------------------------------------------------------------
     Structure drawing — exam line-diagram mode
     ------------------------------------------------------------------------ */
  function lineStructure(st, u) {
    const sid = ` data-sid="${esc(st.id)}"`;
    const cls = ` class="rg-s rg-t-${st.t}"`;
    const col = LINE[st.t];
    switch (st.t) {
      case "muscle":
      case "organ":
      case "tendon":
      case "bowel":
        return `<g${cls}${sid}>${shapeTag(st, `fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.3"`)}</g>`;
      case "nerve": {
        const circles = st.cs ? st.cs : (st.c ? [st.c] : null);
        let dots = "";
        if (circles) {
          circles.forEach((c) => {
            if (c[2] >= 6) dots += `<circle cx="${c[0] - c[2] * 0.3}" cy="${c[1] - c[2] * 0.2}" r="${(c[2] * 0.2).toFixed(1)}" fill="#854d0e"/><circle cx="${c[0] + c[2] * 0.3}" cy="${c[1] + c[2] * 0.25}" r="${(c[2] * 0.2).toFixed(1)}" fill="#854d0e"/>`;
          });
        } else if (st.el) {
          dots = `<circle cx="${st.el[0] - st.el[2] * 0.3}" cy="${st.el[1]}" r="${(st.el[3] * 0.25).toFixed(1)}" fill="#854d0e"/><circle cx="${st.el[0] + st.el[2] * 0.3}" cy="${st.el[1]}" r="${(st.el[3] * 0.25).toFixed(1)}" fill="#854d0e"/>`;
        }
        return `<g${cls}${sid}>${shapeTag(st, `fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.3"`)}${dots}</g>`;
      }
      case "artery":
        if (st.ln) return `<g${cls}${sid}>${shapeTag(st, `stroke="#b91c1c" stroke-width="1.6" stroke-dasharray="4 3"`)}</g>`;
        return `<g${cls}${sid}>${shapeTag(st, `fill="${col.fill}" stroke="${col.stroke}" stroke-width="2.2"`)}${st.c ? `<circle cx="${st.c[0]}" cy="${st.c[1]}" r="${Math.max(1.5, st.c[2] - 3)}" fill="none" stroke="#b91c1c" stroke-width="0.8"/>` : ""}</g>`;
      case "vein":
        return `<g${cls}${sid}>${shapeTag(st, `fill="${col.fill}" stroke="${col.stroke}" stroke-width="1.2"`)}</g>`;
      case "bone": {
        const band = st.ln.map((p) => [p[0], p[1] + 16]).reverse();
        return `<g${cls}${sid}><polygon points="${pts(st.ln.concat(band))}" fill="url(#hatch-${u})" opacity="0.7"/>` +
          `<polyline points="${pts(st.ln)}" fill="none" stroke="#1f2937" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>`;
      }
      case "pleura":
        return `<g${cls}${sid}>${shapeTag(st, `stroke="#0f766e" stroke-width="2" stroke-dasharray="6 3"`)}</g>`;
      case "fascia":
      case "sheath":
        return `<g${cls}${sid}>${shapeTag(st, `${st.t === "sheath" ? 'fill="none" ' : ""}stroke="#334155" stroke-width="1.1"`)}</g>`;
      case "ligament":
        return `<g${cls}${sid}>${shapeTag(st, `stroke="#0f172a" stroke-width="2.2"`)}</g>`;
      case "space":
        return `<g${cls}${sid}>${shapeTag(st, `fill="rgba(2,132,199,0.06)" stroke="#0284c7" stroke-width="1.1" stroke-dasharray="4 3"`)}</g>`;
      case "marker": {
        const c = centroid(st);
        return `<g${cls}${sid}><path d="M${c[0] - 5},${c[1] - 5} l10,10 M${c[0] + 5},${c[1] - 5} l-10,10" stroke="#15803d" stroke-width="1.8"/></g>`;
      }
      case "outline":
        return `<g class="rg-outline">${shapeTag(st, `stroke="#1f2937" stroke-width="1.8" stroke-linejoin="round" fill="#fff7ed"`).replace('fill="none" ', "")}</g>`;
      case "point": {
        const c = centroid(st);
        return `<g${cls}${sid}><circle cx="${c[0]}" cy="${c[1]}" r="4" fill="#e11d48" stroke="#1f2937" stroke-width="1"/></g>`;
      }
      default:
        return "";
    }
  }

  /* ------------------------------------------------------------------------
     Needle, spread and labels
     ------------------------------------------------------------------------ */
  function needleTag(n, mode) {
    const [x1, y1] = n.from;
    const [x2, y2] = n.to;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    if (mode === "line") {
      // Needles usually enter at the image edge, so start the drawn shaft a
      // quarter of the way in and put the syringe glyph behind that point —
      // keeping the syringe inside the frame.
      const ux = dx / len, uy = dy / len;
      const sx = x1 + dx * 0.26, sy = y1 + dy * 0.26;
      const bx = sx, by = sy;
      const angle = Math.atan2(uy, ux) * 180 / Math.PI;
      return `<g class="rg-needle-g"><line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${x2}" y2="${y2}" stroke="#111827" stroke-width="1.8" stroke-linecap="round"/>` +
        `<circle cx="${x2}" cy="${y2}" r="2.2" fill="#111827"/>` +
        `<g transform="translate(${bx},${by}) rotate(${angle})"><rect x="-34" y="-5" width="26" height="10" rx="2" fill="#fff" stroke="#111827" stroke-width="1.2"/>` +
        `<rect x="-8" y="-2.5" width="8" height="5" fill="#94a3b8" stroke="#111827" stroke-width="0.8"/><line x1="-46" y1="0" x2="-34" y2="0" stroke="#111827" stroke-width="1.4"/>` +
        `<line x1="-46" y1="-5" x2="-46" y2="5" stroke="#111827" stroke-width="1.4"/></g></g>`;
    }
    let reverb = "";
    for (let i = 1; i <= 2; i++) {
      const o = 4.2 * i;
      reverb += `<line x1="${(x1 + nx * o).toFixed(1)}" y1="${(y1 + ny * o).toFixed(1)}" x2="${(x2 + nx * o).toFixed(1)}" y2="${(y2 + ny * o).toFixed(1)}" stroke="#e2e8f0" stroke-width="1" stroke-opacity="${0.28 / i}" stroke-dasharray="6 5"/>`;
    }
    return `<g class="rg-needle-g">${reverb}<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/>` +
      `<circle class="rg-tip" cx="${x2}" cy="${y2}" r="3" fill="#fff"/></g>`;
  }

  function spreadTag(s, mode) {
    const attrs = mode === "line"
      ? `fill="rgba(37,99,235,0.14)" stroke="#2563eb" stroke-width="1.3" stroke-dasharray="4 3"`
      : `fill="rgba(56,189,248,0.30)" stroke="rgba(125,211,252,0.95)" stroke-width="1.3" stroke-dasharray="5 3"`;
    if (s.el) return ellipseTag(s.el, attrs);
    if (s.c) return `<circle cx="${s.c[0]}" cy="${s.c[1]}" r="${s.c[2]}" ${attrs}/>`;
    return "";
  }

  function spreadTop(s) {
    if (s.el) return [s.el[0], s.el[1] - s.el[3]];
    if (s.c) return [s.c[0], s.c[1] - s.c[2]];
    return [W / 2, H / 2];
  }

  // Nudge a label vertically until it no longer overlaps labels already placed.
  function placeLabel(at, w, h, placed) {
    const clampX = (x) => Math.min(Math.max(x, w / 2 + 2), W - w / 2 - 2);
    const clampY = (y) => Math.min(Math.max(y, h / 2 + 2), H - h / 2 - 2);
    const x = clampX(at[0]);
    const offsets = [0, -1, 1, -2, 2, -3, 3, -4, 4];
    for (const k of offsets) {
      const y = clampY(at[1] + k * (h + 2));
      const box = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
      const hit = placed.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]);
      if (!hit) { placed.push(box); return [x, y]; }
    }
    const y = clampY(at[1]);
    placed.push([x - w / 2, y - h / 2, x + w / 2, y + h / 2]);
    return [x, y];
  }

  function labelTag(id, text, type, at, anchor, mode, extraClass, placed) {
    const fs = mode === "line" ? 8.6 : 9.2;
    const wEst = text.length * (fs * 0.6) + 12;
    const hPill = fs + 7;
    const [x, y] = placeLabel(at, wEst, hPill, placed);
    const lead = anchor && Math.hypot(anchor[0] - x, anchor[1] - y) > 12
      ? `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${anchor[0].toFixed(1)}" y2="${anchor[1].toFixed(1)}" class="rg-lead" ${mode === "line" ? 'stroke="#334155" stroke-width="0.8"' : 'stroke="rgba(255,255,255,0.75)" stroke-width="0.9"'}/>` +
        `<circle cx="${anchor[0].toFixed(1)}" cy="${anchor[1].toFixed(1)}" r="1.8" fill="${mode === "line" ? "#334155" : "#fff"}"/>`
      : "";
    const cls = `rg-lab${extraClass ? " " + extraClass : ""}`;
    if (mode === "line") {
      return `<g class="${cls}" data-lab="${esc(id)}">${lead}<rect x="${(x - wEst / 2).toFixed(1)}" y="${(y - hPill / 2).toFixed(1)}" width="${wEst.toFixed(1)}" height="${hPill}" rx="3" fill="#fffdf7" stroke="#cbd5e1" stroke-width="0.6"/>` +
        `<text x="${x.toFixed(1)}" y="${(y + fs * 0.35).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#0f172a" font-weight="600">${esc(text)}</text></g>`;
    }
    const col = PILL[type] || PILL.fascia;
    return `<g class="${cls}" data-lab="${esc(id)}">${lead}<rect x="${(x - wEst / 2).toFixed(1)}" y="${(y - hPill / 2).toFixed(1)}" width="${wEst.toFixed(1)}" height="${hPill}" rx="${hPill / 2}" fill="${col[0]}" stroke="rgba(255,255,255,0.5)" stroke-width="0.6"/>` +
      `<text x="${x.toFixed(1)}" y="${(y + fs * 0.35).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="${col[1]}" font-weight="700">${esc(text)}</text></g>`;
  }

  /* ------------------------------------------------------------------------
     Scene → SVG string
     ------------------------------------------------------------------------ */
  function sceneSVG(scene, mode, opts) {
    const u = "rg" + (++uidCounter);
    const landmark = scene.probe === "landmark";
    const curvi = scene.probe === "curvilinear";
    const compact = !!opts.compact;
    const draw = mode === "line" ? lineStructure : sonoStructure;
    const sorted = scene.s.slice().sort((a, b) => (LAYER_ORDER[a.t] || 5) - (LAYER_ORDER[b.t] || 5));

    let bg;
    if (mode === "line") {
      bg = `<rect width="${W}" height="${H}" fill="#fbfaf6"/>`;
    } else if (landmark) {
      bg = `<rect width="${W}" height="${H}" fill="#0b1220"/>`;
    } else {
      bg = `<rect width="${W}" height="${H}" fill="#07090d"/><rect width="${W}" height="${H}" filter="url(#spk-${u})" opacity="0.55"/>` +
        `<rect width="${W}" height="10" fill="#cbd5e1" opacity="0.18"/>`;
    }

    let body = sorted.map((st) => draw(st, u)).join("");
    if (mode === "sono" && !landmark) body += `<rect width="${W}" height="${H}" fill="url(#att-${u})" pointer-events="none"/>`;

    const spreads = (scene.spreads || []).map((s) => spreadTag(s, mode)).join("");
    const needles = (scene.needles || []).map((n) => needleTag(n, mode)).join("");

    let frame = "";
    if (!compact) {
      const txt = mode === "line" ? "#475569" : "#e2e8f0";
      frame += `<text x="8" y="${curvi ? 22 : 16}" font-size="8.5" font-weight="800" fill="${txt}" letter-spacing="0.08em">${esc(scene.left || "")}</text>`;
      frame += `<text x="${W - 8}" y="${curvi ? 22 : 16}" font-size="8.5" font-weight="800" fill="${txt}" letter-spacing="0.08em" text-anchor="end">${esc(scene.right || "")}</text>`;
      if (mode === "sono" && !landmark) {
        frame += `<circle cx="${curvi ? 112 : 6}" cy="${curvi ? 12 : 22}" r="3" fill="#38bdf8"/>`;
        const depth = scene.depth || 4;
        for (let i = 0; i <= depth; i++) {
          const y = 10 + i * (H - 20) / depth;
          frame += `<line x1="${W - 4}" y1="${y.toFixed(1)}" x2="${W - (i % 1 === 0 ? 10 : 7)}" y2="${y.toFixed(1)}" stroke="#94a3b8" stroke-width="1"/>`;
          if (i > 0) frame += `<text x="${W - 13}" y="${(y + 3).toFixed(1)}" font-size="7" fill="#94a3b8" text-anchor="end">${i}</text>`;
        }
        frame += `<text x="${W - 13}" y="${H - 4}" font-size="7" fill="#94a3b8" text-anchor="end">cm</text>`;
      }
    }

    let labels = "";
    if (!compact) {
      const placed = [];
      scene.s.forEach((st) => {
        if (!st.l || st.t === "outline" || st.lab === false) return;
        const anchor = centroid(st);
        const at = st.lab || [anchor[0], anchor[1] - 16];
        labels += labelTag(st.id, st.l, st.t, at, anchor, mode, st.key ? "rg-key" : "", placed);
      });
      if (mode === "sono") {
        (scene.needles || []).forEach((n, i) => {
          const at = [n.from[0] + (n.to[0] - n.from[0]) * 0.2, n.from[1] + (n.to[1] - n.from[1]) * 0.2 - 12];
          labels += labelTag("__needle" + i, scene.needles.length > 1 ? `Needle ${i + 1}` : "Needle", "needle", at, null, mode, "rg-lab-needle", placed);
        });
        if ((scene.spreads || []).length && !landmark) {
          const top = spreadTop(scene.spreads[0]);
          labels += labelTag("__spread", "LA spread", "spread", [top[0] + 36, top[1] - 12], top, mode, "rg-lab-spread", placed);
        }
      }
    }

    const clip = curvi && mode === "sono" ? ` clip-path="url(#clip-${u})"` : "";
    const cls = `rg-img rg-mode-${mode}${landmark ? " rg-landmark" : ""}${compact ? " rg-compact" : ""}`;
    return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(opts.aria || "Regional block image")}" font-family="Plus Jakarta Sans, system-ui, sans-serif">` +
      defs(u, mode) +
      `<g${clip}>${bg}<g class="rg-structs">${body}</g><g class="rg-spread" pointer-events="none">${spreads}</g><g class="rg-needle" pointer-events="none">${needles}</g></g>` +
      `<g class="rg-frame" pointer-events="none">${frame}</g><g class="rg-labels" pointer-events="none">${labels}</g></svg>`;
  }

  /* ------------------------------------------------------------------------
     Simulated-ultrasound overlay — the B-mode frame itself is a canvas drawn
     by regional-usg.js; this SVG only carries hit areas, hover outlines,
     scanner annotations and labels, using the same organic outlines.
     ------------------------------------------------------------------------ */
  function probeInfo(scene) {
    const d = scene.depth || 4;
    if (scene.probe === "curvilinear") return { name: "C5-1", preset: d >= 7 ? "ABD" : "MSK", mhz: d >= 7 ? 3.5 : 4.5 };
    return { name: "L15-4", preset: "NERVE", mhz: d <= 2 ? 15 : d <= 3 ? 13 : d <= 4 ? 11 : 9 };
  }

  function realOverlaySVG(scene, opts, key) {
    const US = window.KNRegionalUS;
    const geo = US.prepare(scene, key);
    const compact = !!opts.compact;
    const curvi = scene.probe === "curvilinear";
    let hits = "";
    geo.items.forEach((it) => {
      const st = it.st;
      if (!st.id || !st.l) return;
      const col = (PILL[st.t] || PILL.fascia)[0];
      const sid = ` data-sid="${esc(st.id)}" style="--c:${col}"`;
      const cls = ` class="rg-s rg-t-${st.t}${it.kind === "line" ? " rg-s-line" : ""}"`;
      if (it.kind === "region") {
        hits += `<g${cls}${sid}><path d="${US.pathD(it.loops, true)}"/></g>`;
      } else if (it.kind === "line") {
        hits += `<g${cls}${sid}><path class="rg-hitline" d="${US.pathD(it.lines, !!it.closed)}"/><path d="${US.pathD(it.lines, !!it.closed)}"/></g>`;
      } else if (st.t === "marker") {
        const c = centroid(st);
        hits += `<g${cls}${sid}><circle cx="${c[0]}" cy="${c[1]}" r="8" class="rg-hitdot"/>` +
          `<path class="rg-mark" d="M${c[0] - 5},${c[1]} h10 M${c[0]},${c[1] - 5} v10"/></g>`;
      }
    });

    let frame = "";
    let labels = "";
    if (!compact) {
      const info = probeInfo(scene);
      const depth = scene.depth || 4;
      const txt = 'fill="#cbd5e1" font-size="7" font-weight="600" letter-spacing="0.04em"';
      frame += `<text x="7" y="${H - 16}" ${txt} opacity="0.85">${info.name} · ${info.preset}</text>`;
      frame += `<text x="7" y="${H - 7}" ${txt} opacity="0.7">${info.mhz} MHz · D ${depth.toFixed(1)} cm · G 54 · DR 60</text>`;
      frame += `<text x="${curvi ? 128 : 16}" y="${curvi ? 12 : 12}" font-size="8" font-weight="800" fill="#e2e8f0" letter-spacing="0.08em" opacity="0.9">${esc(scene.left || "")}</text>`;
      frame += `<text x="${curvi ? 272 : W - 24}" y="12" font-size="8" font-weight="800" fill="#e2e8f0" letter-spacing="0.08em" text-anchor="end" opacity="0.9">${esc(scene.right || "")}</text>`;
      // probe orientation marker (screen-left = probe marker side)
      frame += `<path d="M${curvi ? 118 : 6},4 l5,0 l-2.5,5 z" fill="#38bdf8"/>`;
      // depth scale with half-centimetre ticks and focal-zone marker
      for (let i = 0; i <= depth * 2; i++) {
        const y = 4 + i * (H - 8) / (depth * 2);
        const major = i % 2 === 0;
        frame += `<line x1="${W - 3}" y1="${y.toFixed(1)}" x2="${W - (major ? 10 : 6)}" y2="${y.toFixed(1)}" stroke="#cbd5e1" stroke-width="1" opacity="0.8"/>`;
        if (major && i > 0 && i < depth * 2) frame += `<text x="${W - 12}" y="${(y + 2.5).toFixed(1)}" font-size="7" fill="#cbd5e1" text-anchor="end" opacity="0.85">${i / 2}</text>`;
      }
      const fy = scene.needles && scene.needles[0] ? scene.needles[0].to[1] : H / 2;
      frame += `<path d="M${W - 3},${fy} l-5,-3.5 v7 z" fill="#fbbf24" opacity="0.9"/>`;

      const placed = [];
      scene.s.forEach((st) => {
        if (!st.l || st.t === "outline" || st.lab === false) return;
        const anchor = centroid(st);
        const at = st.lab || [anchor[0], anchor[1] - 16];
        labels += labelTag(st.id, st.l, st.t, at, anchor, "sono", st.key ? "rg-key" : "", placed);
      });
      (scene.needles || []).forEach((n, i) => {
        const at = [n.from[0] + (n.to[0] - n.from[0]) * 0.2, n.from[1] + (n.to[1] - n.from[1]) * 0.2 - 12];
        labels += labelTag("__needle" + i, scene.needles.length > 1 ? `Needle ${i + 1}` : "Needle", "needle", at, null, "sono", "rg-lab-needle", placed);
      });
      if ((scene.spreads || []).length) {
        const top = spreadTop(scene.spreads[0]);
        labels += labelTag("__spread", "LA spread", "spread", [top[0] + 36, top[1] - 12], top, "sono", "rg-lab-spread", placed);
      }
    }
    const cls = `rg-img rg-mode-sono rg-real${compact ? " rg-compact" : ""}`;
    return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(opts.aria || "Simulated ultrasound image")}" font-family="Plus Jakarta Sans, system-ui, sans-serif">` +
      `<g class="rg-structs">${hits}</g><g class="rg-frame" pointer-events="none">${frame}</g><g class="rg-labels" pointer-events="none">${labels}</g></svg>`;
  }

  // Rendered frames are cached per block/scale/toggle state.
  const frameCache = new Map();
  function frameFor(block, scale, needle, spread) {
    const key = `${block.id}|${scale}|${needle ? 1 : 0}|${spread ? 1 : 0}`;
    let c = frameCache.get(key);
    if (!c) {
      c = document.createElement("canvas");
      window.KNRegionalUS.draw(c, block.sono.image, { key: block.id, scale, needle, spread });
      frameCache.set(key, c);
      if (frameCache.size > 40) frameCache.delete(frameCache.keys().next().value);
    }
    return c;
  }

  function paintFrame(canvas, block, scale, needle, spread) {
    const src = frameFor(block, scale, needle, spread);
    canvas.width = src.width;
    canvas.height = src.height;
    canvas.getContext("2d").drawImage(src, 0, 0);
  }

  const isReal = (scene) => scene.probe !== "landmark" && !!window.KNRegionalUS;

  /* ------------------------------------------------------------------------
     Interactive controller
     ------------------------------------------------------------------------ */
  function render(container, block, options) {
    const opts = Object.assign({ mode: "sono", labels: false, needle: true, spread: true, compact: false }, options || {});
    const scene = block.sono.image;
    const real = opts.mode === "sono" && isReal(scene);
    let canvas = null;
    let scale = 1;
    if (real) {
      container.innerHTML = `<canvas class="rg-us-canvas" aria-hidden="true"></canvas>` +
        realOverlaySVG(scene, { compact: opts.compact, aria: `${block.name} — simulated ultrasound image` }, block.id);
      container.classList.add("rg-us-busy");
      canvas = container.querySelector("canvas");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cw = container.clientWidth || 600;
      const cap = window.matchMedia("(pointer: coarse)").matches ? 1.5 : 2;
      scale = Math.max(1, Math.min(cap, Math.round(cw * dpr / W * 4) / 4));
    } else {
      container.innerHTML = sceneSVG(scene, opts.mode, { compact: opts.compact, aria: `${block.name} — ${opts.mode === "line" ? "exam line diagram" : "ultrasound schematic"}` });
    }
    const svg = container.querySelector("svg");
    let flags = { needle: opts.needle, spread: opts.spread };
    let pending = 0;
    function repaint() {
      if (!real) return;
      cancelAnimationFrame(pending);
      container.classList.add("rg-us-busy");
      // let the browser paint the current state first, then simulate
      pending = requestAnimationFrame(() => setTimeout(() => {
        if (!canvas.isConnected) return;
        paintFrame(canvas, block, scale, flags.needle, flags.spread);
        container.classList.remove("rg-us-busy");
      }, 0));
    }
    repaint();
    const listeners = [];
    let pinned = null;

    const setFlag = (cls, on) => svg.classList.toggle(cls, !!on);
    setFlag("rg-show-labels", opts.labels || opts.mode === "line");
    setFlag("rg-hide-needle", !opts.needle);
    setFlag("rg-hide-spread", !opts.spread);

    function activate(sid, on) {
      svg.querySelectorAll(`[data-sid="${CSS.escape(sid)}"]`).forEach((el) => el.classList.toggle("rg-hover", on));
      const lab = svg.querySelector(`[data-lab="${CSS.escape(sid)}"]`);
      if (lab) lab.classList.toggle("rg-lab-on", on);
    }

    function select(sid) {
      if (pinned && pinned !== sid) activate(pinned, false);
      pinned = sid;
      if (sid) activate(sid, true);
      listeners.forEach((fn) => fn(sid));
    }

    if (!opts.compact && opts.mode === "sono") {
      svg.addEventListener("pointerover", (e) => {
        const el = e.target.closest("[data-sid]");
        if (el && e.pointerType === "mouse") activate(el.dataset.sid, true);
      });
      svg.addEventListener("pointerout", (e) => {
        const el = e.target.closest("[data-sid]");
        if (el && e.pointerType === "mouse" && el.dataset.sid !== pinned) activate(el.dataset.sid, false);
      });
      svg.addEventListener("click", (e) => {
        const el = e.target.closest("[data-sid]");
        if (!el) { select(null); return; }
        select(pinned === el.dataset.sid ? null : el.dataset.sid);
      });
    }

    return {
      svg,
      setLabels: (on) => setFlag("rg-show-labels", on || opts.mode === "line"),
      setNeedle: (on) => {
        setFlag("rg-hide-needle", !on);
        if (real && flags.needle !== !!on) { flags.needle = !!on; repaint(); }
      },
      setSpread: (on) => {
        setFlag("rg-hide-spread", !on);
        if (real && flags.spread !== !!on) { flags.spread = !!on; repaint(); }
      },
      select,
      onSelect: (fn) => listeners.push(fn)
    };
  }

  function thumb(block) {
    if (isReal(block.sono.image)) return `<canvas class="rg-us-thumb" data-us-thumb="${esc(block.id)}" aria-label="${esc(block.name)}"></canvas>`;
    return sceneSVG(block.sono.image, "sono", { compact: true, aria: block.name });
  }

  // Tiles render their simulated frame lazily, one per tick, as they scroll in.
  let thumbIO = null;
  const thumbQueue = [];
  let thumbTimer = 0;
  function pumpThumbs() {
    thumbTimer = 0;
    const el = thumbQueue.shift();
    if (!el) return;
    if (el.isConnected) {
      const b = (window.KN_REGIONAL.blocks || []).find((x) => x.id === el.dataset.usThumb);
      if (b) { paintFrame(el, b, 0.8, true, true); el.classList.add("rg-ready"); }
    }
    if (thumbQueue.length) thumbTimer = setTimeout(pumpThumbs, 0);
  }
  function hydrateThumbs(root) {
    const list = root.querySelectorAll("canvas[data-us-thumb]:not(.rg-ready)");
    if (!list.length) return;
    if (!thumbIO) {
      thumbIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          thumbIO.unobserve(e.target);
          thumbQueue.push(e.target);
        });
        if (!thumbTimer && thumbQueue.length) thumbTimer = setTimeout(pumpThumbs, 0);
      }, { rootMargin: "200px" });
    }
    list.forEach((c) => thumbIO.observe(c));
  }

  /* ------------------------------------------------------------------------
     Plexus schematics
     ------------------------------------------------------------------------ */
  // Node: [x, y, label, placement] — "a" label above-right (clear of the
  // edges leaving the node), "r" label to the right (terminal nodes).
  const BRACHIAL = {
    vb: [440, 236],
    nodes: {
      C5: [30, 28, "C5"], C6: [30, 72, "C6"], C7: [30, 116, "C7"], C8: [30, 160, "C8"], T1: [30, 204, "T1"],
      UT: [104, 50, "Upper trunk", "a"], MT: [104, 116, "Middle trunk", "a"], LT: [104, 182, "Lower trunk", "a"],
      DIV: [176, 116, "Divisions", "a"],
      LC: [252, 62, "Lateral cord", "a"], PC: [252, 116, "Posterior cord", "a"], MC: [252, 170, "Medial cord", "a"],
      MCN: [340, 30, "Musculocutaneous", "r"], AX: [340, 80, "Axillary", "r"], RAD: [340, 116, "Radial", "r"],
      MED: [340, 158, "Median", "r"], ULN: [340, 204, "Ulnar", "r"], SSN: [160, 14, "Suprascapular", "r"]
    },
    edges: [["C5", "UT"], ["C6", "UT"], ["C7", "MT"], ["C8", "LT"], ["T1", "LT"],
      ["UT", "DIV"], ["MT", "DIV"], ["LT", "DIV"], ["DIV", "LC"], ["DIV", "PC"], ["DIV", "MC"],
      ["LC", "MCN"], ["LC", "MED"], ["MC", "MED"], ["MC", "ULN"], ["PC", "AX"], ["PC", "RAD"], ["UT", "SSN"]],
    columns: [["Roots", 30], ["Trunks", 104], ["Divisions", 176], ["Cords", 252], ["Branches", 340]]
  };

  const LUMBOSACRAL = {
    vb: [440, 276],
    nodes: {
      L1: [30, 28, "L1"], L2: [30, 60, "L2"], L3: [30, 92, "L3"], L4: [30, 124, "L4"], L5: [30, 156, "L5"],
      S1: [30, 188, "S1"], S2: [30, 220, "S2"], S3: [30, 252, "S3"],
      IH: [150, 16, "Iliohypogastric", "a"], II: [150, 38, "Ilioinguinal", "a"], GF: [150, 60, "Genitofemoral", "a"],
      LFCN: [150, 84, "Lat. fem. cutaneous", "a"], FEM: [150, 110, "Femoral", "a"], AOBT: [150, 134, "Acc. obturator", "a"],
      OBT: [150, 156, "Obturator", "a"], SCI: [150, 214, "Sciatic", "a"], PFCN: [150, 256, "Post. fem. cutaneous", "r"],
      SAPH: [280, 96, "Saphenous", "r"], NVM: [280, 120, "N. to vastus medialis", "r"], HIP: [280, 146, "Hip capsule (articular)", "r"],
      KNEE: [280, 176, "Post. knee capsule", "r"], TIB: [280, 206, "Tibial", "a"], CPN: [280, 246, "Common peroneal", "a"],
      SUR: [356, 196, "Sural", "r"], SPN: [356, 226, "Sup. peroneal", "r"], DPN: [356, 256, "Deep peroneal", "r"]
    },
    edges: [["L1", "IH"], ["L1", "II"], ["L1", "GF"], ["L2", "GF"], ["L2", "LFCN"], ["L3", "LFCN"],
      ["L2", "FEM"], ["L3", "FEM"], ["L4", "FEM"], ["L3", "AOBT"], ["L4", "AOBT"], ["L2", "OBT"], ["L3", "OBT"], ["L4", "OBT"],
      ["L4", "SCI"], ["L5", "SCI"], ["S1", "SCI"], ["S2", "SCI"], ["S3", "SCI"], ["S1", "PFCN"], ["S2", "PFCN"], ["S3", "PFCN"],
      ["FEM", "SAPH"], ["FEM", "NVM"], ["FEM", "HIP"], ["OBT", "HIP"], ["AOBT", "HIP"], ["OBT", "KNEE"],
      ["SCI", "TIB"], ["SCI", "CPN"], ["TIB", "KNEE"], ["TIB", "SUR"], ["CPN", "SPN"], ["CPN", "DPN"]],
    columns: [["Roots", 30], ["Nerves", 150], ["Branches", 280]]
  };

  function plexus(container, cfg) {
    const def = cfg.type === "brachial" ? BRACHIAL : LUMBOSACRAL;
    const hi = new Set(cfg.hi || []);
    const vari = new Set(cfg.vari || []);
    const [vw, vh] = def.vb;
    let out = `<svg class="rg-plexus" viewBox="0 0 ${vw} ${vh + 20}" role="img" aria-label="${esc(cfg.type)} plexus schematic" font-family="Plus Jakarta Sans, system-ui, sans-serif">`;
    out += `<rect width="${vw}" height="${vh + 20}" rx="10" fill="#fbfaf6"/>`;
    def.columns.forEach(([name, x]) => {
      out += `<text x="${x}" y="${vh + 14}" font-size="8" fill="#64748b" font-weight="700" text-anchor="middle" letter-spacing="0.06em">${name.toUpperCase()}</text>`;
    });
    def.edges.forEach(([a, b]) => {
      const A = def.nodes[a], B = def.nodes[b];
      const on = hi.has(a) && hi.has(b);
      const vOn = (vari.has(a) || vari.has(b)) && (hi.has(a) || hi.has(b) || vari.has(a) && vari.has(b));
      const mx = (A[0] + B[0]) / 2;
      out += `<path d="M${A[0]},${A[1]} C${mx},${A[1]} ${mx},${B[1]} ${B[0]},${B[1]}" fill="none" stroke="${on ? "#0284c7" : vOn ? "#d97706" : "#94a3b8"}" stroke-width="${on ? 2.6 : 1.1}" ${vOn && !on ? 'stroke-dasharray="4 3"' : ""} opacity="${on || vOn ? 1 : 0.8}"/>`;
    });
    Object.entries(def.nodes).forEach(([id, [x, y, label, place]]) => {
      const on = hi.has(id);
      const v = vari.has(id);
      const fill = on ? "#0284c7" : v ? "#f59e0b" : "#fff";
      const stroke = on ? "#075985" : v ? "#b45309" : "#475569";
      const isRoot = /^(C|T|L|S)\d$/.test(id);
      out += `<circle cx="${x}" cy="${y}" r="${isRoot ? 8 : 5}" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`;
      if (isRoot) {
        out += `<text x="${x}" y="${y + 3}" font-size="7.5" font-weight="800" text-anchor="middle" fill="${on ? "#fff" : "#0f172a"}">${label}</text>`;
      } else {
        const ty = place === "a" ? y - 7 : y + 3;
        const tx = place === "a" ? x + 4 : x + 8;
        out += `<text x="${tx}" y="${ty}" font-size="8.2" font-weight="${on ? 800 : 600}" fill="${on ? "#075985" : v ? "#92400e" : "#334155"}" paint-order="stroke" stroke="#fbfaf6" stroke-width="3">${esc(label)}</text>`;
      }
    });
    if (cfg.zone) {
      out += `<text x="${vw - 8}" y="14" font-size="8.5" font-weight="800" text-anchor="end" fill="#0284c7">▲ Block level: ${esc(cfg.zone)}</text>`;
    }
    out += `</svg>`;
    container.innerHTML = out;
  }

  window.KNRegionalSono = { render, thumb, hydrateThumbs, plexus };
})();
