Three.js r160, vendored from the npm package (three@0.160.0) for use as a
plain browser ES module — this site has no build step, so the library is
served as a static file rather than installed via npm/bundler.

Files:
  build/three.module.js                        - core library (ESM build)
  examples/jsm/controls/OrbitControls.js        - camera orbit/pan/zoom
  examples/jsm/loaders/GLTFLoader.js            - .glb/.gltf loader
  examples/jsm/loaders/DRACOLoader.js           - Draco geometry decoder (required by the real workstation .glb)
  examples/jsm/libs/draco/gltf/*                - Draco decoder runtime (wasm + asm.js fallback), referenced by DRACOLoader's decoderPath
  examples/jsm/utils/BufferGeometryUtils.js     - GLTFLoader dependency

Used by: ventilator-scene.js (Anaesthesia Workstation 3D page).
See LICENSE for the Three.js license (MIT).
