# Ventilator & Anaesthesia Workstations — 3D Asset Specification

This document is the contract between the KnockoutNotes 3D educational
engine (`ventilator-3d.js`) and any real `.glb`/`.gltf` model that replaces
the current development placeholder. It is written for whoever builds or
commissions that model (3D artist, or a technical lead briefing one), not
for a KnockoutNotes engineer — no application code needs to change if this
contract is followed.

**Current status: no real models exist yet.** Both machines currently load
`ventilator-placeholder.js`, an intentionally plain, non-representational
stand-in (identical grey boxes in a grid, one per component, with a
floating "3D asset pending" label). It exists only to prove the
interaction system works; it must never be presented as, or mistaken for,
an accurate rendering of either machine. The running app shows a
persistent hazard-striped banner whenever the placeholder is active, and
that banner disappears automatically the moment a real model loads
successfully.

---

## 1. How a model gets loaded

Drop a file at:

```
assets/ventilators/boyles/model.glb
assets/ventilators/modern/model.glb
```

`ventilator-3d.js`'s `loadMachineModel(machineId)` tries this path first
(via `GLTFLoader`) and only falls back to the placeholder if the file is
missing or fails to parse. Nothing else in the engine, interaction layer,
or UI needs to change — the two machines are already fully independent
(their own components/systems/gas-pathways/safety-features/tour-steps/
troubleshooting/viva/drawers/monitor-config all live separately in
`ventilator-data.js`), so each machine's model can be delivered and
swapped in independently of the other.

## 2. The node/metadata contract

**The only thing a `.glb` node is REQUIRED to get right is its name.**
Every mesh that should be identifiable/clickable in the app must be named
*exactly* one of the `componentId` values listed in section 4, matching
the corresponding entry in `ventilator-data.js`. On load, the engine's
`annotateFromData()` joins each node to its data record by that id and
copies across every other contract field:

| Field           | Type            | Where it comes from | Meaning |
|-----------------|-----------------|----------------------|---------|
| `id` / node name | string          | the `.glb` node's name (authoritative) | must equal a `componentId` in `ventilator-data.js` |
| `name`          | string          | `ventilator-data.js` | display name shown in UI/labels |
| `category`      | string          | `ventilator-data.js` | display grouping shown in the info panel |
| `description`   | string          | `ventilator-data.js` | info-panel body text |
| `function`      | string          | `ventilator-data.js` | info-panel "Function" text |
| `system`        | enum string     | `ventilator-data.js` | groups nodes for the sidebar and Exploded View (see §3) |
| `safetyFeature` | string[]        | derived from `safetyFeatures[].componentIds` | which Safety Features panel entries reference this node |
| `vivaPoints`    | string[]        | `ventilator-data.js` | info-panel "Viva points" bullets |
| `tourStep`      | number[]        | derived from `tourSteps[].componentId` | which Guided Tour step(s) focus this node |
| `animationId`   | string \| null  | `ventilator-data.js` | which procedural animation (if any) this node participates in — see §5 |
| `internal`      | boolean         | `ventilator-data.js` | true = only meaningfully visible/relevant in X-Ray mode |
| `isHousing`     | boolean         | `ventilator-data.js` (derived: `frame_*` ids) | true = becomes semi-transparent in X-Ray mode |
| `rearView`      | boolean         | `ventilator-data.js` (derived: cylinder/yoke/pipeline/gauge ids) | true = this node is what "Rear View" / "Cylinder & Pipeline Supply" mode is framing |
| `flowPath`      | string[]        | derived from `flowPaths` | which Flow-Path gas keys (O2, AIR, N2O, FRESH_GAS, VOLATILE, INSPIRATORY, EXPIRATORY, CO2) include this node |

You do **not** need to author `system`/`internal`/`vivaPoints`/etc. inside
the modelling tool — they already exist in `ventilator-data.js` and are
joined in by id at runtime. The one exception: if your tool can author
per-node custom properties and export them as glTF node `extras` (Blender
custom properties do this automatically), `annotateFromData()` will read
`extras.componentId` in preference to the node's own name — useful if your
naming convention inside the DCC tool differs from the `componentId`
values, but not required.

A node that isn't named with a known `componentId` is simply inert
decoration (not raycastable, never highlighted) — use this freely for
pure-visual geometry (screws, cables, generic panel detail) that the
learner never needs to click.

## 3. Grouping for Exploded View

`groupBySystem()` runs after every load (placeholder or real) and
reparents every tagged node into a synthetic `THREE.Group` per distinct
`system` value, using `Object3D.attach()` (which preserves each node's
world transform during reparenting). **You do not need to organise your
`.glb`'s own hierarchy by system** — a flat list of named meshes works
identically to a deeply-nested one. Exploded View simply translates each
resulting group outward from the model's centre.

## 4. Required nodes per machine

### 4.1 Boyle's Anaesthesia Machine (`boyles`)

| # | Category (brief) | `componentId`(s) | Independent mesh? | Notes |
|---|---|---|---|---|
| 1 | Exterior geometry | `frame_boyles` | Yes — becomes transparent in X-Ray | Trolley body/column/base. May be a single mesh. |
| 2 | Rear geometry | *(same frame, viewed from `rearView`)* | — | No separate node required; "Rear View" only moves the camera, per §6. |
| 3 | Cylinder connections | `cylinder_O2_boyles`, `cylinder_N2O_boyles`, `yoke_O2_boyles`, `yoke_N2O_boyles` | Yes, each | Yokes need their own mesh for the Pin Index Safety System demo/click target. |
| 4 | Pipeline connections | `pipeline_inlet_O2_boyles`, `pipeline_inlet_N2O_boyles` | Yes, each | DISS demo click target. |
| 5 | Pressure system | `pressure_regulator_O2_boyles`, `pressure_regulator_N2O_boyles`, plus gauges `gauge_cylinder_O2_boyles`, `gauge_cylinder_N2O_boyles`, `gauge_pipeline_O2_boyles`, `gauge_pipeline_N2O_boyles` | Yes, each | Gauges are separate clickable nodes even though small. |
| 6 | Flowmeters | `flowmeter_block_boyles` (housing), `flowmeter_O2_boyles`, `flowmeter_N2O_boyles` (the two rotameter tubes/bobbins) | Yes, each | The two tube nodes need independent meshes for the `flow-bobbin` animation (§5) and individual click targets. |
| 7 | Vaporizer(s) | `vaporizer_boyles` | Yes | Single vaporizer on this machine — do not add a second. |
| 8 | Breathing system | `common_gas_outlet_boyles`, `breathing_hose_boyles` | Yes, each | |
| 9 | CO2 absorber | `co2_absorber_boyles` | Yes | Model can show granules as a separate decorative (untagged) sub-mesh if desired — not required for interaction. |
| 10 | APL valve | `apl_valve_boyles` | Yes | |
| 11 | Scavenging | `scavenging_hose_boyles` | Yes | |
| 12 | Ventilator | *(none — this machine has no integrated ventilator)* | — | `reservoir_bag_boyles` is the manual-ventilation equivalent. |
| 13 | Monitor | *(none — `hasMonitor:false` for this machine)* | — | |
| 14 | Drawers | *(none — `hasDrawers:false` for this machine)* | — | |
| 15 | Drawer contents | — | — | |
| 16 | Internal components | *(none flagged `internal` on this machine)* | — | Everything on the Boyle's machine is externally visible by design. |
| 17 | Animated components | `flowmeter_O2_boyles`, `flowmeter_N2O_boyles` (bobbin float), `reservoir_bag_boyles` (breathing), `apl_valve_boyles` (vent puff), `co2_absorber_boyles` (glow), `yoke_O2/N2O_boyles` (pin-index demo), `pipeline_inlet_O2/N2O_boyles` (DISS demo), `pressure_regulator_O2/N2O_boyles` (pressure-drop demo), `cylinder_O2/N2O_boyles` (highlight pulse) | — | See §5 — all of these are procedurally driven; no baked animation clips required. |
| 18 | Safety-related components | `yoke_O2_boyles`, `yoke_N2O_boyles` (PISS), `pipeline_inlet_O2_boyles`, `pipeline_inlet_N2O_boyles` (DISS), `flowmeter_O2_boyles`, `flowmeter_N2O_boyles` (hypoxic guard), `common_gas_outlet_boyles` (O2 flush), `apl_valve_boyles` (pressure relief), `scavenging_hose_boyles` | — | |

**Full required node list (22, plus `frame_boyles`):** see the table above;
every id is also enumerated in `ventilator-data.js`'s `boylesComponents`
array, which is the single source of truth if this table and the code
ever disagree.

### 4.2 Modern Anaesthesia Workstation (`modern`)

| # | Category (brief) | `componentId`(s) | Independent mesh? | Notes |
|---|---|---|---|---|
| 1 | Exterior geometry | `frame_modern` | Yes — becomes transparent in X-Ray | Cart body/column/head unit. |
| 2 | Rear geometry | *(same frame, viewed from `rearView`)* | — | Camera-only, per §6. |
| 3 | Cylinder connections | `cylinder_O2_modern`, `cylinder_air_modern`, `yoke_O2_modern`, `yoke_air_modern` | Yes, each | Backup cylinders only — this machine has no N2O cylinder. |
| 4 | Pipeline connections | `pipeline_inlet_O2_modern`, `pipeline_inlet_air_modern`, `pipeline_inlet_N2O_modern` | Yes, each | Three pipeline gases, unlike Boyle's two. |
| 5 | Pressure system | `pressure_regulator_block_modern` (flag `internal:true`), gauges `gauge_cylinder_O2_modern`, `gauge_pipeline_O2_modern`, `gauge_pipeline_air_modern`, `gauge_pipeline_N2O_modern` | Yes, each | Regulator block is internal — only meaningfully shown in X-Ray. |
| 6 | Flowmeters | `flow_control_module_modern`, `flowmeter_display_modern` | Yes, each | Electronic flow control, not glass rotameters — the display node should be a flat screen-shaped mesh so a canvas texture can be swapped onto it later if wanted (not required now). |
| 7 | Vaporizer(s) | `vaporizer_1_modern`, `vaporizer_2_modern` | Yes, each | **Two** vaporizers, side by side — do not merge into one mesh, the interlock demo needs to address them independently. |
| 8 | Breathing system | `common_gas_outlet_modern`, `breathing_circuit_modern`, `inspiratory_valve_modern` (internal), `expiratory_valve_modern` (internal) | Yes, each | The two one-way valves are internal — small nodes tucked inside the absorber head, only need to read clearly in X-Ray. |
| 9 | CO2 absorber | `co2_absorber_modern` | Yes | |
| 10 | APL valve | `apl_valve_modern` | Yes | |
| 11 | Scavenging | `scavenging_interface_modern` | Yes | |
| 12 | Ventilator | `ventilator_unit_modern`, `ventilator_bellows_modern` (internal), `ventilator_controls_modern` | Yes, each | `ventilator_bellows_modern` MUST be a separate mesh nested inside/behind a (separate, untagged or `isHousing`) transparent bellows-housing shell — the breathing animation moves this node's Y position independently every frame (§5). |
| 13 | Monitor | `monitor_screen_modern` | Yes | Must be a flat, forward-facing plane/box — the app can texture it with a live canvas (ECG/pleth/capno) if you want the physical screen to mirror the 2D monitor panel; not required for v1 but the mesh should be UV-mappable simply (a single front-facing quad is ideal). |
| 14 | Drawers | `drawer_1_modern`, `drawer_2_modern`, `drawer_3_modern` | Yes, each | Each drawer's mesh origin/pivot must be at the drawer's **closed** position — the app translates it forward along local +Z to "open" it (see §5). Do not bake an open/closed animation clip; the app drives this procedurally so it can also reverse it on close. |
| 15 | Drawer contents | *(no individual `.glb` nodes needed)* | — | Drawer contents are 2D data/UI (name/function/description/category/viva points per item in `ventilator-data.js`'s `modernDrawers`), not 3D geometry. If you do want tiny 3D props visible inside an opened drawer, they can be additional untagged decorative meshes parented to the drawer node — optional, not part of the interaction contract. |
| 16 | Internal components | `pressure_regulator_block_modern`, `inspiratory_valve_modern`, `expiratory_valve_modern`, `ventilator_bellows_modern` | — | These four are flagged `internal:true` in the data — they should be modelled but can be simple/low-detail since they're normally hidden by the housing and only emphasised in X-Ray mode. |
| 17 | Animated components | `flow_control_module_modern`, `vaporizer_1_modern`, `vaporizer_2_modern`, `breathing_circuit_modern`, `inspiratory_valve_modern`, `expiratory_valve_modern`, `co2_absorber_modern`, `apl_valve_modern`, `reservoir_bag_modern`, `ventilator_unit_modern`, `ventilator_bellows_modern`, `scavenging_interface_modern`, `battery_indicator_modern`, `drawer_1/2/3_modern`, `yoke_O2/air_modern`, `pipeline_inlet_*_modern`, `pressure_regulator_block_modern`, `cylinder_O2/air_modern` | — | Same note as Boyle's — all procedural, see §5. |
| 18 | Safety-related components | `yoke_O2_modern`, `yoke_air_modern` (PISS), `pipeline_inlet_*_modern` (DISS), `flow_control_module_modern` (hypoxic guard), `common_gas_outlet_modern` (O2 flush), `apl_valve_modern` (pressure relief), `ventilator_unit_modern` + `breathing_circuit_modern` (disconnect/high-pressure alarms), `battery_indicator_modern` (power backup), `scavenging_interface_modern` | — | |

**Full required node list (31, plus `frame_modern`):** enumerated
authoritatively in `ventilator-data.js`'s `modernComponents` array.

## 5. Animations — what needs a baked clip vs. what the engine already drives

**None of the current `animationId` values require a baked glTF
`AnimationClip`.** Every one is driven procedurally by the engine or the
UI layer from plain transform/material properties, so the model only
needs correct static geometry and correct pivot points:

| `animationId` | Driven by | What the model needs |
|---|---|---|
| `highlight-pulse` | material emissive intensity (engine) | nothing — works on any mesh |
| `pin-index-demo`, `diss-demo`, `pressure-drop-demo` | camera focus + info-panel text (no mesh transform) | nothing |
| `flow-bobbin` | *(reserved — not yet wired to a per-node transform; currently just highlightable)* | if you want the bobbin to visibly rise with flow later, model it as its own small node so a future Y-position tween can target it |
| `vaporizer-dial` | *(reserved, same as above)* | if a dial should rotate later, model the dial as a child node with its rotation pivot on the dial's own axis |
| `gas-flow-pulse` | the shared particle system (`engine.createFlow`), which reads each listed node's **world position** and threads a Catmull-Rom curve through them | nothing beyond correct position — no mesh-level animation at all |
| `absorber-glow`, `apl-vent`, `valve-flap`, `battery-blink` | reserved for future emissive/opacity pulses (engine-level, same mechanism as `highlight-pulse`) | nothing |
| `bag-breathe` | reserved for a future scale/position pulse on the reservoir bag mesh | model the bag so a uniform scale pulse reads naturally (avoid heavy asymmetric detail baked into the mesh silhouette) |
| `ventilator-cycle` | **already implemented**: every node with this `animationId` gets its resting Y captured at load and is oscillated `position.y` each frame while "Start Machine"/ventilator is running | the bellows/piston node's pivot origin should be at its own centre, and it must be a **separate mesh** from its housing (which should be a separate, static, possibly transparent shell) |
| `drawer-slide` | **already implemented**: on click, the app tweens the node from its captured closed position to `closedPosition + (0,0,0.4)` (or a custom `openOffset` if you supply one) | the drawer node's origin/pivot must be at its **closed** resting position, and it must be modelled as a self-contained mesh (drawer box + front face), not fused into the cart body |

If you later want richer per-node animation (e.g. an actual dial rotating,
a bobbin rising with flow rate, an APL valve flap visibly lifting), the
cleanest path is still procedural (extend the engine to read a named
child node and tween one property) rather than a baked clip, so it stays
controllable by the same start-machine/flow-speed/pause controls as
everything else. If a baked clip is unavoidable for some future feature,
glTF `AnimationClip`s are supported by the loader already in use
(`GLTFLoader`) — just document the clip name against the relevant
`componentId` here before wiring it up.

## 6. Rear View / Cylinder & Pipeline Supply

"Rear View" and the "Cylinder & Pipeline Supply" guided mode are **camera
moves only** (`camera.position`/`camera.target` tweens defined in each
machine's `cameraPresets.rear` in `ventilator-data.js`) — they do not hide
or swap any geometry. This means:

- The rear of the model must be **actually modelled**, not a flat
  backplate — every node flagged `rearView:true` in §4 (cylinders, yokes,
  cylinder/pipeline gauges, pipeline inlets) must be physically positioned
  and oriented on the rear/side of the machine where a real one would have
  them, and must remain individually clickable from that camera angle
  (i.e. not occluded by the housing from the `cameraPresets.rear`
  position/target given in `ventilator-data.js` for that machine).
- Do not hide the rear behind a solid uninterrupted back panel — leave the
  yokes/inlets/gauges exposed as they would be on the real equipment.

## 7. X-Ray View

X-Ray sets every `isHousing:true` node's material to ~12% opacity and
boosts emissive intensity on every `internal:true` node — both purely
material-property changes on the SAME meshes used in Normal View. This
means:

- `isHousing` nodes (`frame_boyles`, `frame_modern`) must use a material
  that can sensibly go semi-transparent (avoid baking unlit/emissive-only
  shading into the housing texture in a way that looks wrong at 12%
  opacity).
- `internal` nodes must be genuinely modelled sitting *inside* the housing
  volume (not merely tagged) so that making the housing transparent
  actually reveals them in a sensible location.

## 8. Performance / delivery format

- Deliver as `.glb` (binary, single file) at the two paths in §1.
- Reasonable poly budget for a real-time educational scene rendered
  alongside a live particle system and two other UI-heavy panels — treat
  this as a mid-detail hero prop, not a photogrammetry-scale asset.
  Concretely: keep both machines comfortably under ~150k triangles combined
  per machine, and under ~30 materials, so mobile WebGL (the site is
  tested down to 390px/mobile Safari-class GPUs) stays smooth.
- Bake/compress textures reasonably (a few 1–2K PBR texture sets is
  plenty for this scene — this is a labelled diagram people orbit and
  click, not a lighting showcase). DRACO mesh compression and KTX2 texture
  compression are both worth using once a real, texture-heavy model exists
  (`GLTFLoader` in this project does not yet have a `DRACOLoader`/
  `KTX2Loader` attached — that's a small, mechanical addition when the time
  comes, not an architectural change).
- Only one machine's model is ever loaded into the scene at a time — the
  engine calls `dispose()`/`clearMachine()` before loading the other, so
  there's no need to worry about combined memory footprint of both
  machines together.

## 9. Medical accuracy

This specification describes *where interactive geometry needs to exist
and how it needs to be named* — it does not specify exact dimensions,
proportions, valve internals, or brand-specific detailing, because no
particular real manufacturer/model has been chosen as the reference.
Whoever builds the final model (and whoever reviews the accompanying
`ventilator-data.js` text) should treat this as generic/representative
educational equipment unless a specific real machine is chosen as a named
reference — and either way, the finished result requires sign-off from a
qualified anaesthesiologist before clinical teaching use, per the
disclaimers already shown throughout the app.
