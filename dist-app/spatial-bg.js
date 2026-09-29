// ==========================================================================
// KNOCKOUTNOTES — Procedural Anaesthesia Canvas Engine (spatial-bg.js)
// Real-Time Waveforms: ECG, Capnography, SpO2 Plethysmograph
// Minimal, Calm Clinical Aesthetic — Reduced Noise & Zero Glitter
// ==========================================================================

(function () {
  "use strict";

  const canvas = document.getElementById("knSpatialCanvas");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    // Respect the user's preference: no waveform animation, no particle
    // drift, no pointer reactivity. Leave the canvas blank rather than
    // rendering a single static frame that still competes visually.
    window.KnockoutSpatialBg = { setEnvironment: () => {}, triggerRipple: () => {} };
    return;
  }

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Environmental state presets
  const ENVIRONMENTS = {
    hero: {
      accent: [56, 189, 248],     // Cyan #38bdf8
      secondary: [96, 165, 250],  // Blue #60a5fa
      ecg: true,
      capno: true,
      pleth: true,
      circuitRings: true,
      particleSpeed: 0.35,
      density: 294,
      glowPoints: 4
    },
    pearls: {
      accent: [56, 189, 248],     // Cyan
      secondary: [52, 211, 153],  // Emerald #34d399
      ecg: true,
      capno: false,
      pleth: true,
      circuitRings: true,
      particleSpeed: 0.3,
      density: 266,
      glowPoints: 3
    },
    drugs: {
      accent: [129, 140, 248],    // Indigo #818cf8
      secondary: [244, 63, 94],   // Rose #f43f5e
      ecg: true,
      capno: false,
      pleth: false,
      circuitRings: false,
      particleSpeed: 0.25,
      density: 280,
      glowPoints: 3
    },
    criticalCare: {
      accent: [251, 191, 36],    // Amber #fbbf24
      secondary: [56, 189, 248],  // Cyan
      ecg: true,
      capno: true,
      pleth: true,
      circuitRings: true,
      particleSpeed: 0.45,
      density: 308,
      glowPoints: 4
    },
    viva: {
      accent: [167, 139, 250],   // Violet #a78bfa
      secondary: [56, 189, 248], // Cyan
      ecg: true,
      capno: false,
      pleth: false,
      circuitRings: false,
      particleSpeed: 0.3,
      density: 252,
      glowPoints: 3
    },
    resources: {
      accent: [56, 189, 248],    // Cyan
      secondary: [148, 163, 184],// Slate
      ecg: false,
      capno: false,
      pleth: false,
      circuitRings: true,
      particleSpeed: 0.2,
      density: 210,
      glowPoints: 2
    },
    study: {
      accent: [56, 189, 248],    // Cyan #38bdf8
      secondary: [96, 165, 250], // Blue #60a5fa
      ecg: false,
      capno: false,
      pleth: false,
      circuitRings: false,
      particleSpeed: 0.18,
      density: 190,
      glowPoints: 2
    }
  };

  const pageType = document.body.dataset.contentPage || "hero";
  let currentEnvKey = "hero";
  if (pageType === "pearls") currentEnvKey = "pearls";
  else if (pageType === "drugs") currentEnvKey = "drugs";
  else if (pageType === "critical-care") currentEnvKey = "criticalCare";
  else if (pageType === "viva") currentEnvKey = "viva";
  else if (pageType === "study") currentEnvKey = "study";
  else if (pageType === "resources" || pageType === "notes" || pageType === "recent-updates") currentEnvKey = "resources";

  let env = Object.assign({}, ENVIRONMENTS[currentEnvKey] || ENVIRONMENTS.hero);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  });

  let mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5 };
  let ripples = [];

  window.addEventListener("pointermove", (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  }, { passive: true });

  window.addEventListener("pointerdown", (e) => {
    // Snap the repulsion point straight to the tap/click location instead
    // of only nudging targetX/Y — mouse.x/y otherwise eases toward it at
    // 4%/frame (see the tick() lerp below), which reads fine for a moving
    // cursor but meant a plain tap (no drag, so no pointermove) barely
    // registered with nearby dots even though the ripple still fired.
    mouse.x = mouse.targetX = e.clientX;
    mouse.y = mouse.targetY = e.clientY;
    if (ripples.length < 4) {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.min(width, height) * 0.35,
        alpha: 0.45,
        speed: 4.0
      });
    }
  }, { passive: true });

  const isSmallScreen = () => window.innerWidth <= 720;

  let particles = [];
  let glowOrbs = [];
  function initParticles() {
    particles = [];
    // The width-based ceiling existed to keep dot spacing sane on very
    // narrow canvases, but at its old /14 divisor it silently clamped
    // desktop counts to ~100-110 regardless of density — capping out well
    // below the density values above once those were raised ~3.5x. /4
    // gives those values real headroom on typical viewports while still
    // tapering off on genuinely narrow ones.
    const densityCap = isSmallScreen() ? Math.ceil(env.density * 0.6) : env.density;
    const count = Math.min(densityCap, Math.floor(width / 4));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * env.particleSpeed,
        vy: (Math.random() - 0.5) * env.particleSpeed,
        repelVx: 0,
        repelVy: 0,
        size: Math.random() * 1.9 + 0.7,
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    // A handful of larger, softly-blurred "light points" — bounded, slow,
    // never a busy starfield — that read as ambient depth rather than icons.
    glowOrbs = [];
    const orbCount = isSmallScreen() ? Math.max(1, Math.floor((env.glowPoints || 2) * 0.5)) : (env.glowPoints || 2);
    for (let i = 0; i < orbCount; i++) {
      glowOrbs.push({
        x: width * (0.15 + Math.random() * 0.7),
        y: height * (0.15 + Math.random() * 0.7),
        vx: (Math.random() - 0.5) * env.particleSpeed * 0.4,
        vy: (Math.random() - 0.5) * env.particleSpeed * 0.4,
        r: 70 + Math.random() * 90,
        useSecondary: i % 2 === 1
      });
    }
  }
  initParticles();

  let waveTime = 0;

  // Lead II ECG (P, Q, R, S, T complex)
  function getEcgY(t) {
    const cycle = t % 1;
    if (cycle < 0.12) return 0;
    if (cycle < 0.20) {
      const p = (cycle - 0.12) / 0.08;
      return Math.sin(p * Math.PI) * 0.18; // P wave
    }
    if (cycle < 0.30) return 0; // PR segment
    if (cycle < 0.33) {
      const p = (cycle - 0.30) / 0.03;
      return -Math.sin(p * Math.PI) * 0.14; // Q wave
    }
    if (cycle < 0.39) {
      const p = (cycle - 0.33) / 0.06;
      return Math.sin(p * Math.PI) * 1.0; // R wave peak
    }
    if (cycle < 0.44) {
      const p = (cycle - 0.39) / 0.05;
      return -Math.sin(p * Math.PI) * 0.25; // S wave
    }
    if (cycle < 0.54) return 0; // ST segment
    if (cycle < 0.70) {
      const p = (cycle - 0.54) / 0.16;
      return Math.sin(p * Math.PI) * 0.32; // T wave
    }
    return 0; // TP baseline
  }

  // Arterial Blood Pressure (ABP / Invasive Arterial Line) with Dicrotic Notch
  function getAbpY(t) {
    const cycle = t % 1;
    // Systolic rapid upstroke
    if (cycle < 0.16) {
      const p = cycle / 0.16;
      return Math.sin(p * Math.PI * 0.5) * 1.0;
    }
    // Peak systolic decline to dicrotic notch
    if (cycle < 0.32) {
      const p = (cycle - 0.16) / 0.16;
      return 1.0 - p * 0.48; // drops to 0.52
    }
    // Dicrotic notch & secondary wave (aortic valve closure recoil)
    if (cycle < 0.44) {
      const p = (cycle - 0.32) / 0.12;
      return 0.52 + Math.sin(p * Math.PI) * 0.12;
    }
    // Diastolic runoff
    if (cycle < 0.88) {
      const p = (cycle - 0.44) / 0.44;
      return 0.52 * Math.exp(-p * 2.2);
    }
    return 0.52 * Math.exp(-2.2);
  }

  // Capnography CO2 (Phase I baseline, Phase II upstroke, Phase III plateau, Phase IV inspiration)
  function getCapnoY(t) {
    const cycle = t % 1;
    if (cycle < 0.32) return 0; // Phase I: inspiratory baseline
    if (cycle < 0.42) {
      const p = (cycle - 0.32) / 0.10;
      return Math.sin(p * Math.PI * 0.5) * 0.75; // Phase II: expiratory upstroke
    }
    if (cycle < 0.76) {
      const p = (cycle - 0.42) / 0.34;
      return 0.75 + p * 0.22; // Phase III: alveolar plateau with alpha angle
    }
    if (cycle < 0.84) {
      const p = (cycle - 0.76) / 0.08;
      return 0.97 * (1 - p); // Phase IV: rapid inspiratory downstroke
    }
    return 0;
  }

  // SpO2 Photoplethysmograph
  function getPlethY(t) {
    const cycle = t % 1;
    if (cycle < 0.18) {
      const p = cycle / 0.18;
      return Math.sin(p * Math.PI * 0.5);
    }
    if (cycle < 0.34) {
      const p = (cycle - 0.18) / 0.16;
      return 1.0 - p * 0.42;
    }
    if (cycle < 0.44) {
      const p = (cycle - 0.34) / 0.10;
      return 0.58 + Math.sin(p * Math.PI) * 0.12;
    }
    if (cycle < 0.86) {
      const p = (cycle - 0.44) / 0.42;
      return 0.58 * (1 - p * p);
    }
    return 0;
  }

  let animId = null;

  function render() {
    if (document.hidden || document.body.classList.contains("mode-lite")) {
      animId = requestAnimationFrame(render);
      return;
    }

    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    ctx.clearRect(0, 0, width, height);

    const isDark = document.body.classList.contains("dark");
    const [r, g, b] = env.accent;
    const [r2, g2, b2] = env.secondary;

    // 1. Clinical Telemetry Grid Layer (Clean calibration grid)
    ctx.strokeStyle = isDark ? `rgba(${r}, ${g}, ${b}, 0.038)` : `rgba(2, 132, 199, 0.08)`;
    ctx.lineWidth = 1;
    const gridSize = 54;
    const offsetX = (mouse.x - width * 0.5) * 0.018;
    const offsetY = (mouse.y - height * 0.5) * 0.018;

    ctx.beginPath();
    for (let x = (offsetX % gridSize); x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = (offsetY % gridSize); y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 1b. Ambient Knowledge Glow Orbs (Cinematic anaesthetic vapor glow in Day Mode)
    for (let i = 0; i < glowOrbs.length; i++) {
      const orb = glowOrbs[i];
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < -orb.r) orb.x = width + orb.r;
      else if (orb.x > width + orb.r) orb.x = -orb.r;
      if (orb.y < -orb.r) orb.y = height + orb.r;
      else if (orb.y > height + orb.r) orb.y = -orb.r;

      const px = orb.x + (mouse.x - width * 0.5) * 0.025;
      const py = orb.y + (mouse.y - height * 0.5) * 0.025;
      const [gr, gg, gb] = orb.useSecondary ? env.secondary : env.accent;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, orb.r);
      grad.addColorStop(0, isDark ? `rgba(${gr}, ${gg}, ${gb}, 0.09)` : `rgba(2, 132, 199, 0.08)`);
      grad.addColorStop(1, `rgba(${gr}, ${gg}, ${gb}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, orb.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Breathing Circuit Geometry Motifs (Rotary Anesthetic Vaporizer Dial Accent)
    if (env.circuitRings && !isSmallScreen()) {
      const cx = width * 0.86 + (mouse.x - width * 0.5) * 0.02;
      const cy = height * 0.42 + (mouse.y - height * 0.5) * 0.02;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(waveTime * 0.10);

      for (let ring = 1; ring <= 2; ring++) {
        const rad = ring * 90;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.strokeStyle = isDark ? `rgba(${r}, ${g}, ${b}, ${0.03 * ring})` : `rgba(2, 132, 199, ${0.07 * ring})`;
        ctx.setLineDash([6, 16]);
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 3. Multi-Channel Physiological Monitoring Telemetry (Anchored near viewport base)
    waveTime += 0.011;
    const baseY = height * 0.84;
    const sweepProgress = (waveTime * 1.5) % 1;
    const sweepHeadX = sweepProgress * width;

    // A. Lead II ECG (Green/Cyan CRT phosphor in dark, vivid cerulean in day)
    if (env.ecg) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.45)" : "rgba(2, 132, 199, 0.85)";
      ctx.lineWidth = isDark ? 1.6 : 1.8;
      if (isDark) {
        ctx.shadowColor = "rgba(56, 189, 248, 0.55)";
        ctx.shadowBlur = 6;
      } else {
        ctx.shadowColor = "rgba(2, 132, 199, 0.4)";
        ctx.shadowBlur = 4;
      }

      const ecgWaveLength = 220;
      for (let x = 0; x <= width; x += 3) {
        const progress = (x / ecgWaveLength - waveTime * 1.5);
        const yOffset = getEcgY(progress) * 44;
        const y = baseY - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Soft glowing phosphor sweep head on ECG (Both Dark and Day Mode)
      const sweepY = baseY - getEcgY(sweepHeadX / ecgWaveLength - waveTime * 1.5) * 44;
      ctx.beginPath();
      ctx.arc(sweepHeadX, sweepY, isDark ? 3 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
      ctx.shadowColor = isDark ? "#38bdf8" : "rgba(2, 132, 199, 0.8)";
      ctx.shadowBlur = isDark ? 10 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // B. Arterial Blood Pressure (ABP / Invasive Arterial Line, Ruby / Coral Red)
    if (env.ecg && !isSmallScreen()) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? "rgba(244, 63, 94, 0.35)" : "rgba(225, 29, 72, 0.78)";
      ctx.lineWidth = isDark ? 1.4 : 1.6;
      if (isDark) {
        ctx.shadowColor = "rgba(244, 63, 94, 0.45)";
        ctx.shadowBlur = 5;
      } else {
        ctx.shadowColor = "rgba(225, 29, 72, 0.35)";
        ctx.shadowBlur = 3;
      }

      const abpWaveLength = 220;
      for (let x = 0; x <= width; x += 3) {
        // Synchronized with ECG with physiologic ~120ms electromechanical delay
        const progress = ((x - 28) / abpWaveLength - waveTime * 1.5);
        const yOffset = getAbpY(progress) * 36;
        const y = (baseY - 45) - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // C. Capnography Waveform (EtCO2, Amber / Yellow Plateau)
    if (env.capno) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? "rgba(251, 191, 36, 0.32)" : "rgba(217, 119, 6, 0.75)";
      ctx.lineWidth = isDark ? 1.3 : 1.5;

      const capnoWaveLength = 360;
      for (let x = 0; x <= width; x += 4) {
        const progress = (x / capnoWaveLength - waveTime * 0.75);
        const yOffset = getCapnoY(progress) * 32;
        const y = (baseY - 95) - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // D. SpO2 Plethysmograph (Emerald Green)
    if (env.pleth) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? "rgba(52, 211, 153, 0.30)" : "rgba(5, 150, 105, 0.75)";
      ctx.lineWidth = isDark ? 1.2 : 1.5;

      const plethWaveLength = 190;
      for (let x = 0; x <= width; x += 4) {
        const progress = (x / plethWaveLength - waveTime * 1.35);
        const yOffset = getPlethY(progress) * 22;
        const y = (baseY + 44) - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4. Volatile Anaesthetic Vapor & Alveolar Gas Dispersion Physics
    // Simulated mechanical ventilation tidal breathing rhythm (~12 bpm)
    const tidalBreathing = Math.sin(waveTime * 0.9) * 0.15;
    const repelRadius = isSmallScreen() ? 90 : 150;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < repelRadius * repelRadius && distSq > 4) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / repelRadius) * 1.3;
        p.repelVx += (dx / dist) * force;
        p.repelVy += (dy / dist) * force;
      }
      p.repelVx *= 0.93;
      p.repelVy *= 0.93;

      // Laminar gas flow with tidal breathing modulation
      p.x += p.vx * (1 + tidalBreathing) + p.repelVx;
      p.y += p.vy + p.repelVy;

      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      const depthFactor = (p.z + 400) / 800;
      const px = p.x + (mouse.x - width * 0.5) * 0.015 * depthFactor;
      const py = p.y + (mouse.y - height * 0.5) * 0.015 * depthFactor;

      ctx.beginPath();
      ctx.arc(px, py, p.size * depthFactor, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.72})`
        : `rgba(2, 132, 199, ${p.alpha * 0.68})`;
      ctx.fill();
    }

    // 5. Tactile Acoustic Transducer Pressure Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;
      rip.alpha *= 0.93;

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark
        ? `rgba(${r}, ${g}, ${b}, ${rip.alpha})`
        : `rgba(2, 132, 199, ${rip.alpha * 0.8})`;
      ctx.lineWidth = 1.5;
      if (isDark) {
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        ctx.shadowBlur = 8;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (rip.alpha < 0.01 || rip.radius > rip.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    animId = requestAnimationFrame(render);
  }

  function setEnvironment(key) {
    if (ENVIRONMENTS[key]) {
      env = Object.assign({}, ENVIRONMENTS[key]);
      initParticles();
    }
  }

  render();

  window.KnockoutSpatialBg = {
    setEnvironment: setEnvironment,
    triggerRipple: (x, y) => {
      ripples.push({
        x: x || width * 0.5,
        y: y || height * 0.5,
        radius: 4,
        maxRadius: Math.min(width, height) * 0.35,
        alpha: 0.5,
        speed: 4.5
      });
    }
  };
})();

