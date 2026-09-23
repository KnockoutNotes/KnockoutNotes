// ==========================================================================
// KnockoutNotes — Cloudflare Web Analytics (RUM) Beacon Configuration
// ==========================================================================
// One-time setup (does not require a code change or redeploy afterwards):
// 1. Cloudflare dashboard -> Analytics & Logs -> Web Analytics -> Add a site.
// 2. Point it at the production hostname already served by this Worker.
// 3. Cloudflare generates a snippet like:
//      <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
//        data-cf-beacon='{"token": "abcdef0123456789..."}'></script>
//    Copy only the token value.
// 4. Paste the token between the quotes below.
//
// Leave this empty to keep visitor analytics beacon disabled (default/current
// behaviour, zero external requests added to any page).
const KNOCKOUTNOTES_CF_BEACON_TOKEN = "";
