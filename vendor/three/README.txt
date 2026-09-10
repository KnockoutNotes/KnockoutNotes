Vendored subset of three.js v0.160.0 (https://www.npmjs.com/package/three), MIT licensed.
Fetched from the public npm registry and included locally because this is a
static, no-build-step site (Cloudflare Workers assets) and the sandboxed dev
environment used to build this feature could not reach public CDNs.

Files included (only what ventilator-3d.js actually imports):
  build/three.module.js
  examples/jsm/controls/OrbitControls.js
  examples/jsm/loaders/GLTFLoader.js
  examples/jsm/utils/BufferGeometryUtils.js  (GLTFLoader's one dependency)

To upgrade: re-fetch the same four files from a newer three.js release and
replace them here — no other code changes needed unless three.js's public
API for these modules changes.
