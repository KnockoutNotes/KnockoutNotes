// ==========================================================================
// KnockoutNotes — Service Worker (sw.js)
// Production PWA Service Worker:
// - Network-First for HTML navigation requests (with cached & offline fallback)
// - Stale-While-Revalidate with safe response cloning for static app shell assets
// ==========================================================================

const CACHE_NAME = "knockoutnotes-cache-v51";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/notes.html",
  "/study.html",
  "/study-data.js",
  "/study-structures.js",
  "/study-structures-3d.js",
  "/study-molecule-3d.js",
  "/study-ui.js",
  "/study.css",
  "/drugs.html",
  "/critical-care.html",
  "/calculators.html",
  "/ventilator.html",
  "/viva.html",
  "/resuscitation-chamber.html",
  "/regional-anaesthesia.html",
  "/regional.css",
  "/regional-data.js",
  "/regional-sono.js",
  "/regional-usg.js",
  "/regional-ui.js",
  "/regional-3d.js",
  "/recent-updates.html",
  "/resources.html",
  "/shipping-policy.html",
  "/contact.html",
  "/pricing.html",
  "/terms-and-conditions.html",
  "/privacy-policy.html",
  "/refund-policy.html",
  "/policy-config.js",
  "/policy-common.css",
  "/styles.css",
  "/page-common.css",
  "/calculators.css",
  "/library-styles.css",
  "/ventilator.css",
  "/bubble-menu.css",
  "/border-glow.css",
  "/script.js",
  "/kn-site-search.js",
  "/content-library.js",
  "/content-config.js",
  "/sheet-config.js",
  "/page-motion.js",
  "/spatial-bg.js",
  "/spatial-camera.js",
  "/spatial-scroll.js",
  "/spatial-viewer.js",
  "/ventilator-scene.js",
  "/calculators.js",
  "/paeds-chart-engine.js",
  "/paeds-pdf-export.js",
  "/abg-engine.js",
  "/spa-router.js",
  "/bubble-menu.js",
  "/border-glow.js",
  "/subscribe-widget.css",
  "/subscribe-widget.js",
  "/coffee-bg.js",
  "/vendor/gsap/gsap.min.js",
  "/vendor/jspdf/jspdf.umd.min.js",
  "/vendor/jspdf/jspdf.plugin.autotable.min.js",
  "/knockoutnotes_icon.png",
  "/manifest.json",
  "/manifest-calculators.json",
  "/assets/references/ecmo-circuit-diagram.png",
  "/assets/references/haemodialysis-circuit-diagram.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // Only handle GET requests and http/https scheme
  if (event.request.method !== "GET" || !requestUrl.protocol.startsWith("http")) {
    return;
  }

  // Bypass range requests and video streaming from service worker cache
  if (event.request.headers.get("range") || requestUrl.pathname.endsWith(".mp4")) {
    return;
  }

  // Bypass API routes, Admin routes, and Verification/Unsubscribe endpoints
  if (requestUrl.pathname.startsWith("/api/") || 
      requestUrl.pathname.startsWith("/admin") ||
      requestUrl.pathname.startsWith("/subscribe/verify") ||
      requestUrl.pathname.startsWith("/unsubscribe")) {
    return;
  }

  const isNavigation = event.request.mode === "navigate" ||
    (event.request.headers.get("accept") && event.request.headers.get("accept").includes("text/html"));

  // 1. Navigation Requests: Network-First
  // Prevents "site not available" loops when navigating between pages on deployed site and installed PWA
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback to cache for the exact requested URL
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Try pathname match if query string was present
          const cachedPath = await caches.match(requestUrl.pathname);
          if (cachedPath) {
            return cachedPath;
          }
          // Last-resort offline fallback: index.html
          return (await caches.match("/index.html")) || (await caches.match("/"));
        })
    );
    return;
  }

  // 2. Static Assets: Cache-First / Stale-While-Revalidate with safe response cloning
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource, then revalidate in background for local origin
        if (requestUrl.origin === location.origin) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              }
            })
            .catch(() => {});
        }
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
