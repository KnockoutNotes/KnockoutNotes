// ==========================================================================
// KnockoutNotes — Service Worker (sw.js)
// Cache-First strategy with network fallback for offline medical access
// ==========================================================================

const CACHE_NAME = "knockoutnotes-cache-v1";

const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./notes.html",
  "./drugs.html",
  "./critical-care.html",
  "./calculators.html",
  "./ventilator.html",
  "./viva.html",
  "./resuscitation-chamber.html",
  "./recent-updates.html",
  "./resources.html",
  "./styles.css",
  "./page-common.css",
  "./calculators.css",
  "./library-styles.css",
  "./script.js",
  "./kn-site-search.js",
  "./content-library.js",
  "./content-config.js",
  "./sheet-config.js",
  "./ventilator-scene.js",
  "./spatial-viewer.js",
  "./knockoutnotes_icon.png",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
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

  // Cache-first, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached resource, then fetch updated copy in background (stale-while-revalidate for local assets)
        if (requestUrl.origin === location.origin) {
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {});
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
      }).catch(() => {
        // Offline fallback for HTML navigation requests
        if (event.request.headers.get("accept")?.includes("text/html")) {
          return caches.match("./index.html");
        }
      });
    })
  );
});
