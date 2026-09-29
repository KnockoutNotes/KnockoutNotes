/**
 * KnockoutNotes Admin — 3D Workstation Interactive Marker Positioner
 *
 * Provides a live 3D Three.js viewport for the Anaesthesia Workstation
 * with real-time raycast surface snapping ("busy moving the pointer"),
 * marker drag-and-drop, label editing, D1 persistence and code export.
 */

import * as THREE from 'three';
import { OrbitControls } from '/vendor/three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from '/vendor/three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from '/vendor/three/examples/jsm/loaders/DRACOLoader.js';

const TARGET_HEIGHT = 1.7; // Normalized height matching ventilator-scene.js
const MARKER_COLOR = 0x38bdf8;
const MARKER_ACTIVE_COLOR = 0xfbbf24;
const MARKER_HOVER_COLOR = 0x7dd3fc;

let workstationComponents = [];
let selectedComponentId = null;
let isRepositioning = false;
let isDraggingMarker = false;

let scene, camera, renderer, controls;
let modelGroup, markerGroup, activeHighlightRing;
let raycaster, pointer;
let isSceneInitialized = false;
let modelMeshes = [];

function round3(n) {
  return Math.round(Number(n) * 1000) / 1000;
}

function makeMarkerTexture(number, colorHex) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  // Outer glow
  const grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 60);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  // Pin circle
  ctx.fillStyle = colorHex || '#38bdf8';
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Number / label
  if (number != null) {
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function init3DScene() {
  const container = document.getElementById('ventAdminStage');
  if (!container || isSceneInitialized) return;

  const width = container.clientWidth || 600;
  const height = container.clientHeight || 500;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060911);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
  camera.position.set(0.7, 1.35, 2.7);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0.9, 0);
  controls.maxDistance = 5.5;
  controls.minDistance = 0.5;
  controls.maxPolarAngle = Math.PI / 2 + 0.05;

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(2.5, 4.0, 3.0);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
  fillLight.position.set(-3.0, 2.5, -2.5);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
  backLight.position.set(0, 3.0, -3.5);
  scene.add(backLight);

  // Groups
  modelGroup = new THREE.Group();
  scene.add(modelGroup);

  markerGroup = new THREE.Group();
  scene.add(markerGroup);

  // Active Highlight Ring
  const ringGeo = new THREE.TorusGeometry(0.045, 0.007, 16, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color: MARKER_ACTIVE_COLOR });
  activeHighlightRing = new THREE.Mesh(ringGeo, ringMat);
  activeHighlightRing.rotation.x = Math.PI / 2;
  activeHighlightRing.visible = false;
  scene.add(activeHighlightRing);

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  loadModel();

  // Event Listeners
  renderer.domElement.addEventListener('pointerdown', onStagePointerDown);
  renderer.domElement.addEventListener('pointermove', onStagePointerMove);
  window.addEventListener('pointerup', onStagePointerUp);

  const ro = new ResizeObserver(() => {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // Pulse active ring
    if (activeHighlightRing.visible) {
      const s = 1.0 + Math.sin(performance.now() / 200) * 0.15;
      activeHighlightRing.scale.set(s, s, s);
    }

    renderer.render(scene, camera);
  }
  animate();

  isSceneInitialized = true;
}

function loadModel() {
  const loadingEl = document.getElementById('ventAdminLoading');
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/vendor/three/examples/jsm/libs/draco/gltf/');

  const loader = new GLTFLoader();
  loader.setDRACOLoader(dracoLoader);

  loader.load(
    '/assets/models/ventilatormodel.glb',
    (gltf) => {
      const root = gltf.scene;
      modelMeshes = [];

      root.traverse((child) => {
        if (child.isMesh) {
          modelMeshes.push(child);
          child.castShadow = false;
          child.receiveShadow = false;
          if (child.material) {
            child.material.envMapIntensity = 0.9;
          }
        }
      });

      // Frame & normalize
      const box = new THREE.Box3().setFromObject(root);
      const size = new THREE.Vector3();
      box.getSize(size);
      const height = Math.max(size.y, 0.001);
      const scale = TARGET_HEIGHT / height;
      root.scale.setScalar(scale);

      box.setFromObject(root);
      const center = new THREE.Vector3();
      box.getCenter(center);
      root.position.x -= center.x;
      root.position.z -= center.z;
      root.position.y -= box.min.y;

      modelGroup.add(root);
      if (loadingEl) loadingEl.style.display = 'none';

      rebuildMarkers3D();
    },
    undefined,
    (err) => {
      console.warn('[Workstation 3D] Failed to load GLB model:', err);
      // Build fallback stand-in box
      const geo = new THREE.BoxGeometry(0.7, 1.4, 0.6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
      const standin = new THREE.Mesh(geo, mat);
      standin.position.y = 0.7;
      modelGroup.add(standin);
      modelMeshes = [standin];
      if (loadingEl) loadingEl.style.display = 'none';
      rebuildMarkers3D();
    }
  );
}

function rebuildMarkers3D() {
  markerGroup.clear();

  workstationComponents.forEach((c, idx) => {
    const isSelected = c.id === selectedComponentId;
    const colorHex = isSelected ? '#fbbf24' : '#38bdf8';
    const texture = makeMarkerTexture(idx + 1, colorHex);

    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(0.08, 0.08, 1);
    sprite.position.set(c.position.x, c.position.y, c.position.z);
    sprite.userData.componentId = c.id;
    sprite.userData.index = idx;

    // Invisible hit sphere for easy clicking/dragging
    const hitGeo = new THREE.SphereGeometry(0.05, 12, 12);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hit = new THREE.Mesh(hitGeo, hitMat);
    hit.position.copy(sprite.position);
    hit.userData.componentId = c.id;

    markerGroup.add(sprite);
    markerGroup.add(hit);
  });

  updateActiveHighlight();
}

function updateActiveHighlight() {
  const comp = workstationComponents.find((c) => c.id === selectedComponentId);
  if (comp && activeHighlightRing) {
    activeHighlightRing.position.set(comp.position.x, comp.position.y, comp.position.z);
    activeHighlightRing.visible = true;
  } else if (activeHighlightRing) {
    activeHighlightRing.visible = false;
  }
}

function setPointerFromEvent(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

function pickSurface() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(modelMeshes, true);
  return hits.length ? hits[0] : null;
}

function pickMarker() {
  raycaster.setFromCamera(pointer, camera);
  const targets = markerGroup.children.filter((o) => o.isMesh); // hit spheres
  const hits = raycaster.intersectObjects(targets, false);
  return hits.length ? hits[0].object.userData.componentId : null;
}

function onStagePointerDown(e) {
  setPointerFromEvent(e);

  if (isRepositioning && selectedComponentId) {
    const hit = pickSurface();
    if (hit) {
      updateComponentPosition(selectedComponentId, hit.point);
      setRepositionMode(false);
      showHint(`📍 Placed marker at X: ${round3(hit.point.x)}, Y: ${round3(hit.point.y)}, Z: ${round3(hit.point.z)}`);
    }
    return;
  }

  const markerId = pickMarker();
  if (markerId) {
    selectComponent(markerId);
    isDraggingMarker = true;
    controls.enabled = false;
    e.preventDefault();
  }
}

function onStagePointerMove(e) {
  setPointerFromEvent(e);

  if (isRepositioning && selectedComponentId) {
    const hit = pickSurface();
    if (hit) {
      updateComponentPosition(selectedComponentId, hit.point, false);
      updateCoordinatesHud(hit.point);
    }
    return;
  }

  if (isDraggingMarker && selectedComponentId) {
    const hit = pickSurface();
    if (hit) {
      updateComponentPosition(selectedComponentId, hit.point, true);
      updateCoordinatesHud(hit.point);
    }
    return;
  }

  // Hover detection for cursor styling
  const markerId = pickMarker();
  renderer.domElement.style.cursor = markerId ? 'pointer' : isRepositioning ? 'crosshair' : 'grab';
}

function onStagePointerUp() {
  if (isDraggingMarker) {
    isDraggingMarker = false;
    controls.enabled = true;
    rebuildMarkers3D();
  }
}

function updateComponentPosition(id, pt, syncInputs = true) {
  const comp = workstationComponents.find((c) => c.id === id);
  if (!comp) return;

  comp.position.x = round3(pt.x);
  comp.position.y = round3(pt.y);
  comp.position.z = round3(pt.z);

  // Move marker sprite & hit mesh in real-time
  markerGroup.children.forEach((child) => {
    if (child.userData.componentId === id) {
      child.position.set(comp.position.x, comp.position.y, comp.position.z);
    }
  });

  updateActiveHighlight();

  if (syncInputs) {
    const xEl = document.getElementById('ventPosX');
    const yEl = document.getElementById('ventPosY');
    const zEl = document.getElementById('ventPosZ');
    if (xEl) xEl.value = comp.position.x;
    if (yEl) yEl.value = comp.position.y;
    if (zEl) zEl.value = comp.position.z;
  }
}

function updateCoordinatesHud(pt) {
  const hud = document.getElementById('ventCoordHud');
  if (hud) {
    hud.textContent = `Position: X: ${round3(pt.x).toFixed(3)} | Y: ${round3(pt.y).toFixed(3)} | Z: ${round3(pt.z).toFixed(3)}`;
  }
}

function setRepositionMode(active) {
  isRepositioning = active;
  const btn = document.getElementById('ventMovePointerBtn');
  const hintEl = document.getElementById('ventMoveHint');

  if (btn) {
    btn.classList.toggle('active', active);
    btn.textContent = active ? '🔴 Click Surface to Lock Position' : '📍 Move Pointer (Click/Drag on 3D Surface)';
  }

  if (hintEl) {
    hintEl.textContent = active
      ? 'Move mouse across the 3D machine surface ("busy moving the pointer"), then click to lock.'
      : 'Click "Move Pointer" or drag a marker directly on the 3D surface.';
  }

  if (renderer && renderer.domElement) {
    renderer.domElement.style.cursor = active ? 'crosshair' : 'grab';
  }
}

function showHint(msg) {
  const hintEl = document.getElementById('ventMoveHint');
  if (hintEl) hintEl.textContent = msg;
}

function selectComponent(id) {
  selectedComponentId = id;
  const comp = workstationComponents.find((c) => c.id === id);
  if (!comp) return;

  const sel = document.getElementById('ventCompSelect');
  if (sel) sel.value = id;

  // Fill form inputs
  const setVal = (elmId, val) => {
    const el = document.getElementById(elmId);
    if (el) el.value = val || '';
  };

  setVal('ventCompId', comp.id);
  setVal('ventCompName', comp.name);
  setVal('ventCompView', comp.view || 'front');
  setVal('ventCompSystem', comp.system || 'ventilator');
  setVal('ventPosX', comp.position.x);
  setVal('ventPosY', comp.position.y);
  setVal('ventPosZ', comp.position.z);
  setVal('ventCompSummary', comp.summary);
  setVal('ventCompFunction', comp.function);
  setVal('ventCompSafety', comp.safety);
  setVal('ventVivaPrompt', comp.viva?.prompt || '');
  setVal('ventVivaAnswer', comp.viva?.answer || '');

  updateCoordinatesHud(comp.position);
  rebuildMarkers3D();

  // Orbit camera smoothly towards component
  if (camera && controls) {
    const targetZ = comp.view === 'rear' ? -0.1 : 0.1;
    controls.target.set(comp.position.x * 0.4, comp.position.y, targetZ);
  }
}

function populateComponentSelect() {
  const sel = document.getElementById('ventCompSelect');
  const countBadge = document.getElementById('ventMarkerCountBadge');
  if (!sel) return;

  sel.innerHTML = workstationComponents
    .map((c, i) => `<option value="${c.id}">${i + 1}. ${escapeHtml(c.name)} (${c.view})</option>`)
    .join('');

  if (countBadge) {
    countBadge.textContent = `${workstationComponents.length} Markers`;
  }

  sel.onchange = () => selectComponent(sel.value);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
}

// -------------------------------------------------------------
// Public Controller & Wireup
// -------------------------------------------------------------
export async function loadWorkstationAdmin() {
  init3DScene();

  const alertEl = document.getElementById('workstationAlert');
  if (alertEl) alertEl.style.display = 'none';

  try {
    const res = await fetch('/api/admin/workstation-markers');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.components) && data.components.length > 0) {
        workstationComponents = data.components;
      }
    }
  } catch (_) {
    // fallback
  }

  if (!workstationComponents.length && window.VentilatorData?.components) {
    workstationComponents = JSON.parse(JSON.stringify(window.VentilatorData.components));
  }

  populateComponentSelect();
  if (workstationComponents.length) {
    selectComponent(workstationComponents[0].id);
  }
}

// Setup action listeners
function initEventListeners() {
  const moveBtn = document.getElementById('ventMovePointerBtn');
  if (moveBtn) moveBtn.onclick = () => setRepositionMode(!isRepositioning);

  // Camera presets
  const frontBtn = document.getElementById('ventCamFrontBtn');
  if (frontBtn) {
    frontBtn.onclick = () => {
      camera.position.set(0, 1.25, 2.5);
      controls.target.set(0, 0.9, 0);
    };
  }
  const rearBtn = document.getElementById('ventCamRearBtn');
  if (rearBtn) {
    rearBtn.onclick = () => {
      camera.position.set(0, 1.25, -2.5);
      controls.target.set(0, 0.9, 0);
    };
  }
  const sideBtn = document.getElementById('ventCamSideBtn');
  if (sideBtn) {
    sideBtn.onclick = () => {
      camera.position.set(2.4, 1.25, 0.1);
      controls.target.set(0, 0.9, 0);
    };
  }
  const resetBtn = document.getElementById('ventCamResetBtn');
  if (resetBtn) {
    resetBtn.onclick = () => {
      camera.position.set(0.7, 1.35, 2.7);
      controls.target.set(0, 0.9, 0);
    };
  }

  // Opacity slider
  const opacitySlider = document.getElementById('ventOpacitySlider');
  if (opacitySlider) {
    opacitySlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      const isTranslucent = val > 0.01;
      modelMeshes.forEach((mesh) => {
        if (mesh.material) {
          mesh.material.transparent = isTranslucent;
          mesh.material.opacity = THREE.MathUtils.lerp(1.0, 0.18, val);
          mesh.material.depthWrite = !isTranslucent;
        }
      });
    };
  }

  // Form field inputs live binding
  const bindInput = (elmId, field) => {
    const el = document.getElementById(elmId);
    if (!el) return;
    el.addEventListener('input', () => {
      const comp = workstationComponents.find((c) => c.id === selectedComponentId);
      if (!comp) return;

      if (field === 'x' || field === 'y' || field === 'z') {
        comp.position[field] = round3(parseFloat(el.value) || 0);
        updateComponentPosition(comp.id, comp.position, false);
      } else if (field === 'vivaPrompt') {
        comp.viva = comp.viva || { prompt: '', answer: '' };
        comp.viva.prompt = el.value;
      } else if (field === 'vivaAnswer') {
        comp.viva = comp.viva || { prompt: '', answer: '' };
        comp.viva.answer = el.value;
      } else {
        comp[field] = el.value;
        if (field === 'name') populateComponentSelect();
      }
    });
  };

  bindInput('ventCompId', 'id');
  bindInput('ventCompName', 'name');
  bindInput('ventCompView', 'view');
  bindInput('ventCompSystem', 'system');
  bindInput('ventPosX', 'x');
  bindInput('ventPosY', 'y');
  bindInput('ventPosZ', 'z');
  bindInput('ventCompSummary', 'summary');
  bindInput('ventCompFunction', 'function');
  bindInput('ventCompSafety', 'safety');
  bindInput('ventVivaPrompt', 'vivaPrompt');
  bindInput('ventVivaAnswer', 'vivaAnswer');

  // + New Marker
  const addBtn = document.getElementById('ventAddNewMarkerBtn');
  if (addBtn) {
    addBtn.onclick = () => {
      const newId = `marker-${Date.now().toString().slice(-4)}`;
      const newComp = {
        id: newId,
        name: 'New Workstation Marker',
        view: 'front',
        system: 'flowControl',
        position: { x: 0, y: 1.1, z: 0.25 },
        summary: 'Component summary description.',
        function: 'Clinical purpose and functional description.',
        safety: 'Standard clinical precautions.',
        viva: { prompt: '', answer: '' }
      };
      workstationComponents.push(newComp);
      populateComponentSelect();
      selectComponent(newId);
      setRepositionMode(true);
      showHint('New marker created! Click anywhere on the 3D model to place it.');
    };
  }

  // Delete Marker
  const delBtn = document.getElementById('ventDeleteMarkerBtn');
  if (delBtn) {
    delBtn.onclick = () => {
      if (!selectedComponentId) return;
      if (!confirm(`Delete marker "${selectedComponentId}"?`)) return;
      workstationComponents = workstationComponents.filter((c) => c.id !== selectedComponentId);
      populateComponentSelect();
      if (workstationComponents.length) {
        selectComponent(workstationComponents[0].id);
      } else {
        selectedComponentId = null;
        rebuildMarkers3D();
      }
    };
  }

  // Save to D1
  const saveBtn = document.getElementById('ventSaveAllBtn');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving to D1…';
      const alertEl = document.getElementById('workstationAlert');
      try {
        const res = await fetch('/api/admin/workstation-markers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ components: workstationComponents })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save');
        if (alertEl) {
          alertEl.className = 'alert-banner success';
          alertEl.textContent = `Successfully saved ${data.count} workstation markers to Cloudflare D1! Live site & app are updated.`;
          alertEl.style.display = 'block';
        }
      } catch (err) {
        if (alertEl) {
          alertEl.className = 'alert-banner error';
          alertEl.textContent = `Save failed: ${err.message}`;
          alertEl.style.display = 'block';
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save to Cloudflare D1';
      }
    };
  }

  // Export Code
  const exportBtn = document.getElementById('ventExportCodeBtn');
  const exportWrap = document.getElementById('ventExportWrap');
  const exportText = document.getElementById('ventExportCodeText');
  const copyBtn = document.getElementById('ventCopyCodeBtn');

  if (exportBtn && exportWrap && exportText) {
    exportBtn.onclick = () => {
      const code = `// Updated Workstation Markers (${new Date().toISOString()})\nwindow.VentilatorData.components = ${JSON.stringify(workstationComponents, null, 2)};\n`;
      exportText.value = code;
      exportWrap.style.display = exportWrap.style.display === 'none' ? 'block' : 'none';
      if (exportWrap.style.display === 'block') {
        exportText.select();
      }
    };
  }

  if (copyBtn && exportText) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(exportText.value).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => (copyBtn.textContent = 'Copy Code'), 2000);
      });
    };
  }

  // Revert
  const revertBtn = document.getElementById('ventRevertBtn');
  if (revertBtn) {
    revertBtn.onclick = () => {
      if (confirm('Revert all workstation markers to factory defaults from ventilator-data.js?')) {
        if (window.VentilatorData?.components) {
          workstationComponents = JSON.parse(JSON.stringify(window.VentilatorData.components));
          populateComponentSelect();
          if (workstationComponents.length) selectComponent(workstationComponents[0].id);
        }
      }
    };
  }
}

// Fine nudge helper
window.nudgeVentPosition = function(axis, delta) {
  const comp = workstationComponents.find((c) => c.id === selectedComponentId);
  if (!comp) return;
  comp.position[axis] = round3(comp.position[axis] + delta);
  updateComponentPosition(comp.id, comp.position);
};

// Global hook for switchView
window.loadWorkstationAdmin = loadWorkstationAdmin;

document.addEventListener('DOMContentLoaded', initEventListeners);
