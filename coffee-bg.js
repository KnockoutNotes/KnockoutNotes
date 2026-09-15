// ==========================================================================
// KNOCKOUTNOTES — Live Coffee Vapor & Steam Physics Canvas Engine (coffee-bg.js)
// Renders volumetric rising coffee steam and warm roasted espresso ambiance
// in the upper section of About. Smoothly fades away as you scroll down.
// Dark themed only.
// ==========================================================================

(function () {
  "use strict";

  function initCoffeeBg() {
    var heroSection = document.getElementById("knCoffeeHeroSection") || document.querySelector(".kn-about-coffee-hero-section");
    var canvas = document.getElementById("knCoffeeVaporCanvas");
    if (!canvas || !heroSection) return;

    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;

    function resize() {
      if (!heroSection) return;
      width = canvas.width = heroSection.offsetWidth;
      height = canvas.height = heroSection.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Mouse interactivity: wafts steam gently
    var mouse = { x: width * 0.5, y: height * 0.5, vx: 0, prevX: width * 0.5 };
    window.addEventListener("pointermove", function (e) {
      if (!heroSection) return;
      var rect = heroSection.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        var localX = e.clientX - rect.left;
        mouse.vx = (localX - mouse.prevX) * 0.15;
        mouse.prevX = localX;
        mouse.x = localX;
        mouse.y = e.clientY - rect.top;
      }
    }, { passive: true });

    // Steam & Vapor Particle Physics
    var particles = [];
    var MAX_PARTICLES = reduceMotion ? 12 : 55;

    function spawnParticle() {
      var sourceX = width * 0.5 + (Math.random() - 0.5) * Math.min(width * 0.45, 260);
      var sourceY = height * 0.88;
      return {
        x: sourceX,
        y: sourceY,
        originX: sourceX,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -(Math.random() * 0.85 + 0.85),
        radius: Math.random() * 16 + 12,
        growth: Math.random() * 0.28 + 0.22,
        alpha: 0,
        maxAlpha: Math.random() * 0.18 + 0.08,
        age: 0,
        lifespan: Math.random() * 160 + 140,
        curlSpeed: (Math.random() - 0.5) * 0.025,
        curlOffset: Math.random() * Math.PI * 2
      };
    }

    for (var i = 0; i < MAX_PARTICLES; i++) {
      var p = spawnParticle();
      p.age = Math.random() * p.lifespan;
      p.y -= (p.age / p.lifespan) * (height * 0.75);
      p.radius += p.growth * p.age;
      particles.push(p);
    }

    var scrollOpacity = 1;

    function updateScrollFade() {
      if (!heroSection) return;
      var rect = heroSection.getBoundingClientRect();
      var fadeDistance = rect.height * 0.65;
      var distanceToTop = rect.bottom;
      scrollOpacity = Math.max(0, Math.min(1, distanceToTop / fadeDistance));
      canvas.style.opacity = scrollOpacity.toFixed(3);
      heroSection.style.setProperty("--coffee-fade", scrollOpacity.toFixed(3));
    }

    window.addEventListener("scroll", updateScrollFade, { passive: true });
    updateScrollFade();

    function render() {
      if (document.hidden || scrollOpacity <= 0.01) {
        requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Dark Roasted Espresso Warm Radial Glow (Upper hero ambiance)
      var ambientGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.65, 10,
        width * 0.5, height * 0.65, Math.max(width, height) * 0.7
      );
      ambientGrad.addColorStop(0, "rgba(42, 23, 10, 0.42)");
      ambientGrad.addColorStop(0.5, "rgba(22, 11, 5, 0.25)");
      ambientGrad.addColorStop(1, "rgba(8, 4, 2, 0)");
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Warm Coffee Embers / Crema Shimmer
      var cremaGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.90, 0,
        width * 0.5, height * 0.90, Math.min(width * 0.28, 170)
      );
      cremaGrad.addColorStop(0, "rgba(217, 119, 6, 0.16)");
      cremaGrad.addColorStop(0.6, "rgba(180, 83, 9, 0.06)");
      cremaGrad.addColorStop(1, "rgba(180, 83, 9, 0)");
      ctx.fillStyle = cremaGrad;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.90, Math.min(width * 0.28, 170), 0, Math.PI * 2);
      ctx.fill();

      // 3. Volumetric Rising Coffee Steam & Vapor
      mouse.vx *= 0.92;

      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        pt.age++;

        var curl = Math.sin(pt.age * pt.curlSpeed + pt.curlOffset) * 0.85;
        pt.x += pt.vx + curl + mouse.vx * 0.3;
        pt.y += pt.vy;
        pt.radius += pt.growth;

        var lifeProgress = pt.age / pt.lifespan;
        if (lifeProgress < 0.2) {
          pt.alpha = (lifeProgress / 0.2) * pt.maxAlpha;
        } else {
          pt.alpha = (1 - (lifeProgress - 0.2) / 0.8) * pt.maxAlpha;
        }

        if (pt.age >= pt.lifespan || pt.y < -pt.radius) {
          particles[j] = spawnParticle();
          continue;
        }

        var steamGrad = ctx.createRadialGradient(
          pt.x, pt.y, 0,
          pt.x, pt.y, pt.radius
        );
        steamGrad.addColorStop(0, "rgba(254, 243, 199, " + pt.alpha + ")");
        steamGrad.addColorStop(0.4, "rgba(245, 158, 11, " + (pt.alpha * 0.45) + ")");
        steamGrad.addColorStop(1, "rgba(245, 158, 11, 0)");

        ctx.fillStyle = steamGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(render);
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCoffeeBg);
  } else {
    initCoffeeBg();
  }
})();
