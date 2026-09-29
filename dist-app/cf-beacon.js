// ==========================================================================
// KnockoutNotes — Cloudflare Web Analytics (RUM) Beacon Loader
// Loads the official Cloudflare beacon script only when a site token has
// been configured in analytics-config.js. No-op (zero network requests)
// until that token is set, matching the site's existing "empty until
// configured" pattern used by sheet-config.js.
// ==========================================================================
(function () {
  "use strict";
  if (typeof KNOCKOUTNOTES_CF_BEACON_TOKEN === "undefined" || !KNOCKOUTNOTES_CF_BEACON_TOKEN) {
    return;
  }
  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: KNOCKOUTNOTES_CF_BEACON_TOKEN }));
  document.head.appendChild(s);
})();
