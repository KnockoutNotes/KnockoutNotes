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
      density: 18                 // ~70% reduction in particles
    },
    pearls: {
      accent: [56, 189, 248],     // Cyan
      secondary: [52, 211, 153],  // Emerald #34d399
      ecg: true,
      capno: false,
      pleth: true,
      circuitRings: true,
      particleSpeed: 0.3,
      density: 16
    },
    drugs: {
      accent: [129, 140, 248],    // Indigo #818cf8
      secondary: [244, 63, 94],   // Rose #f43f5e
      ecg: true,
      capno: false,
      pleth: false,
      circuitRings: false,
      particleSpeed: 0.25,
      density: 18
    },
    criticalCare: {
      accent: [251, 191, 36],    // Amber #fbbf24
      secondary: [56, 189, 248],  // Cyan
      ecg: true,
      capno: true,
      pleth: true,
      circuitRings: true,
      particleSpeed: 0.45,
      density: 20
    },
    viva: {
      accent: [167, 139, 250],   // Violet #a78bfa
      secondary: [56, 189, 248], // Cyan
      ecg: true,
      capno: false,
      pleth: false,
      circuitRings: false,
      particleSpeed: 0.3,
      density: 16
    },
    resources: {
      accent: [56, 189, 248],    // Cyan
      secondary: [148, 163, 184],// Slate
      ecg: false,
      capno: false,
      pleth: false,
      circuitRings: true,
      particleSpeed: 0.2,
      density: 14
    }
  };

  const pageType = document.body.dataset.contentPage || "hero";
  let currentEnvKey = "hero";
  if (pageType === "pearls") currentEnvKey = "pearls";
  else if (pageType === "drugs") currentEnvKey = "drugs";
  else if (pageType === "critical-care") currentEnvKey = "criticalCare";
  else if (pageType === "viva") currentEnvKey = "viva";
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
  function initParticles() {
    particles = [];
    const densityCap = isSmallScreen() ? Math.ceil(env.density * 0.5) : env.density;
    const count = Math.min(densityCap, Math.floor(width / 55));
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * env.particleSpeed,
        vy: (Math.random() - 0.5) * env.particleSpeed,
        size: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.45 + 0.15
      });
    }
  }
  initParticles();

  let waveTime = 0;

  // Lead II ECG
  function getEcgY(t) {
    const cycle = t % 1;
    if (cycle < 0.12) return 0;
    if (cycle < 0.20) {
      const p = (cycle - 0.12) / 0.08;
      return Math.sin(p * Math.PI) * 0.18;
    }
    if (cycle < 0.30) return 0;
    if (cycle < 0.33) {
      const p = (cycle - 0.30) / 0.03;
      return -Math.sin(p * Math.PI) * 0.14;
    }
    if (cycle < 0.39) {
      const p = (cycle - 0.33) / 0.06;
      return Math.sin(p * Math.PI) * 1.0;
    }
    if (cycle < 0.44) {
      const p = (cycle - 0.39) / 0.05;
      return -Math.sin(p * Math.PI) * 0.25;
    }
    if (cycle < 0.54) return 0;
    if (cycle < 0.70) {
      const p = (cycle - 0.54) / 0.16;
      return Math.sin(p * Math.PI) * 0.32;
    }
    return 0;
  }

  // Capnography CO2 (Square waveform)
  function getCapnoY(t) {
    const cycle = t % 1;
    if (cycle < 0.35) return 0;
    if (cycle < 0.45) {
      const p = (cycle - 0.35) / 0.10;
      return Math.sin(p * Math.PI * 0.5) * 0.75;
    }
    if (cycle < 0.75) {
      const p = (cycle - 0.45) / 0.30;
      return 0.75 + p * 0.20;
    }
    if (cycle < 0.82) {
      const p = (cycle - 0.75) / 0.07;
      return 0.95 * (1 - p);
    }
    return 0;
  }

  // SpO2 Plethysmograph
  function getPlethY(t) {
    const cycle = t % 1;
    if (cycle < 0.18) {
      const p = cycle / 0.18;
      return Math.sin(p * Math.PI * 0.5);
    }
    if (cycle < 0.32) {
      const p = (cycle - 0.18) / 0.14;
      return 1.0 - p * 0.45;
    }
    if (cycle < 0.42) {
      const p = (cycle - 0.32) / 0.10;
      return 0.55 + Math.sin(p * Math.PI) * 0.12;
    }
    if (cycle < 0.85) {
      const p = (cycle - 0.42) / 0.43;
      return 0.55 * (1 - p * p);
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

    // 1. Subtle Engineering Grid Layer (Extremely faint)
    ctx.strokeStyle = isDark ? `rgba(${r}, ${g}, ${b}, 0.018)` : `rgba(${r}, ${g}, ${b}, 0.025)`;
    ctx.lineWidth = 1;
    const gridSize = 56;
    const offsetX = (mouse.x - width * 0.5) * 0.02;
    const offsetY = (mouse.y - height * 0.5) * 0.02;

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

    // 2. Breathing Circuit Geometry Motifs (Soft outline) — skipped on small
    // screens to keep the canvas lightweight on mobile browsers.
    if (env.circuitRings && !isSmallScreen()) {
      const cx = width * 0.84 + (mouse.x - width * 0.5) * 0.025;
      const cy = height * 0.45 + (mouse.y - height * 0.5) * 0.025;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(waveTime * 0.12);

      for (let ring = 1; ring <= 2; ring++) {
        const rad = ring * 95;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.025 * ring})`;
        ctx.setLineDash([6, 16]);
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 3. Real-Time Waveforms (Anchored gracefully near bottom)
    waveTime += 0.010;
    const baseY = height * 0.82;

    // A. Lead II ECG
    if (env.ecg) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? `rgba(${r}, ${g}, ${b}, 0.35)` : `rgba(${r}, ${g}, ${b}, 0.22)`;
      ctx.lineWidth = 1.6;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
      ctx.shadowBlur = 6;

      const ecgWaveLength = 220;
      for (let x = 0; x <= width; x += 3) {
        const progress = (x / ecgWaveLength - waveTime * 1.6);
        const yOffset = getEcgY(progress) * 44;
        const y = baseY - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // B. Capnography Waveform (EtCO2)
    if (env.capno) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? `rgba(${r2}, ${g2}, ${b2}, 0.20)` : `rgba(${r2}, ${g2}, ${b2}, 0.12)`;
      ctx.lineWidth = 1.3;

      const capnoWaveLength = 340;
      for (let x = 0; x <= width; x += 4) {
        const progress = (x / capnoWaveLength - waveTime * 0.8);
        const yOffset = getCapnoY(progress) * 32;
        const y = (baseY - 60) - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // C. SpO2 Plethysmograph
    if (env.pleth) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(52, 211, 153, ${isDark ? 0.18 : 0.10})`;
      ctx.lineWidth = 1.1;

      const plethWaveLength = 190;
      for (let x = 0; x <= width; x += 4) {
        const progress = (x / plethWaveLength - waveTime * 1.4);
        const yOffset = getPlethY(progress) * 24;
        const y = (baseY + 45) - yOffset;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4. Subtle Ambient Gas Drift (NO filaments, NO glitter)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      const depthFactor = (p.z + 400) / 800;
      const px = p.x + (mouse.x - width * 0.5) * 0.015 * depthFactor;
      const py = p.y + (mouse.y - height * 0.5) * 0.015 * depthFactor;

      ctx.beginPath();
      ctx.arc(px, py, p.size * depthFactor, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * (isDark ? 0.55 : 0.28)})`;
      ctx.fill();
    }

    // 5. Tactile Click Ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;
      rip.alpha *= 0.93;

      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${rip.alpha})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
      ctx.shadowBlur = 8;
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
