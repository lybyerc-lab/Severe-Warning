# Phase 5 Presentation & World Source Map

**Recorded:** 2026-08-04 Central Time  
**Branch:** `agent/phase5-rendering-world-antigravity`  
**Starting Base Remote SHA:** `cd89b5ececa6e95848961d625f84eaa7bc7f72c7`  
**Source Baseline:** `MechanicsLab/SevereWeather_Warning.html` (Unchanged in branch diff)

---

## 1. Provenance & Clean Source Law

- `MechanicsLab/SevereWeather_Warning.html` is the unpatched historical source baseline.
- `git diff --exit-code origin/agent/phase4-knowledge-antigravity-handoff -- MechanicsLab/SevereWeather_Warning.html` MUST pass before every build and QA execution.
- Production bundle is generated at build time by executing the exact patch chain through Phase 5.

---

## 2. Presentation System Mapping

### 2.1 Renderer & Canvas State
- **Legacy Globals**: `renderer`, `canvas`
- **Source Region**: `[SW:SOURCE:v510-foundation.js]` in `MechanicsLab/SevereWeather_Warning.html`
- **Anchor**: `THREE.WebGLRenderer({ canvas: ..., antialias: true, alpha: false })`
- **Config**: ShadowMap enabled (`THREE.PCFSoftShadowMap`), ToneMapping (`THREE.ACESFilmicToneMapping`), exposure `1.0`, pixel ratio `Math.min(window.devicePixelRatio, 2)`.
- **Typed Authority**: `RendererSystem` in `src/presentation/renderer/renderer-system.ts`

### 2.2 Scene & Atmosphere
- **Legacy Globals**: `scene`, `ambientLight`, `directionalLight`, `fog`
- **Source Region**: `[SW:SOURCE:v510-foundation.js]` in `MechanicsLab/SevereWeather_Warning.html`
- **Anchor**: `scene = new THREE.Scene()`, `scene.fog = new THREE.FogExp2('#1a2634', 0.0075)`
- **Lights**: Main directional light (`#ffea9f`, intensity `1.75`), ambient light (`#2a3b4c`, intensity `0.6`), rim light (`#8ab4f8`, intensity `0.4`).
- **Typed Authority**: `SceneSystem` and `AtmosphereSystem` in `src/presentation/scene/` and `src/presentation/atmosphere/`

### 2.3 Camera & Shake
- **Legacy Globals**: `camera`, `cameraTarget`, `shakeAmount`, `shakeDecay`
- **Source Region**: `[SW:SOURCE:v510-foundation.js]` in `MechanicsLab/SevereWeather_Warning.html`
- **Anchor**: `THREE.PerspectiveCamera(45, width/height, 0.1, 1000)`
- **Framing**: Elevated tactical view ($Y=48\text{m}$, $Z=64\text{m}$, target at storm center $(X, 0, Z)$).
- **Mobile Framing**: Camera distance scales dynamically for wide landscape aspect ratios without clipping.
- **Typed Authority**: `CameraSystem` in `src/presentation/camera/camera-system.ts`

### 2.4 Tornado Presentation
- **Legacy Globals**: `tornadoGroup`, `funnelLayers`, `suctionRings`, `debrisGroup`, `dustCloudGroup`
- **Source Region**: `[SW:SOURCE:v510-tornado.js]` in `MechanicsLab/SevereWeather_Warning.html`
- **Anchor**: `createTornadoGroup()`, `updateTornadoVisuals()`
- **Layers**: 4 volumetric funnel cylinders (Dark Core `#0c1520`, Middle Vortex `#2b3f52`, Condensation Sheath `#475e73`), 3 Torus suction rings (`#3b2a1c`), particle debris orbits.
- **Typed Authority**: `TornadoPresentationSystem` in `src/presentation/tornado/tornado-presentation-system.ts`

### 2.5 World & Categories
- **Legacy Globals**: `worldGroup`, `buildings`, `landmarks`, `trees`, `cropRows`, `fences`, `mediaCrews`, `cows`, `cow17`
- **Source Region**: `[SW:SOURCE:v510-world.js]` in `MechanicsLab/SevereWeather_Warning.html`
- **Anchor**: `prepareCampaignWorld()`, `HEARTLAND_WORLD_BLUEPRINTS`
- **Population Truths**: $\ge 12$ crop rows, $\ge 18$ trees, Hart Farm complex, Lincoln County silos, Prairie Junction depot, State Fair towers, media news vans, Cow 17 with ear tag #17.
- **Typed Authority**: `WorldSystem` in `src/world/world-system.ts`

### 2.6 Hart Farm 5-Stage Setpiece Destruction
- **Legacy Globals**: `hartFarmBuilding`, `hartFarmRoof`, `hartFarmDamageStage`, `hartFarmDebris`
- **Source Region**: `[SW:SOURCE:v510-world.js]` in `MechanicsLab/SevereWeather_Warning.html` / `v510-runtime.js`
- **Stage Language**:
  1. `intact` (0-15% damage)
  2. `damaged` (15-40% damage: wall cracks, loose shingles)
  3. `roof peel` (40-65% damage: left & right roof panel separation, flight plan logged)
  4. `exposed` / `partial collapse` (65-90% damage: exposed timber framing)
  5. `wreckage` (90-100% damage: complete rubble field)
- **Typed Authority**: `HartFarmDefinition` & `DestructibleSetpieceSystem` in `src/world/setpieces/`

### 2.7 Second Structure Setpiece (Grain Silo)
- **Legacy Structure**: `grainSiloLandmark` (Lincoln County / Grain Belt)
- **Stage Language**:
  1. `intact`
  2. `chipped / scorched`
  3. `dome cap pop`
  4. `structural tilt`
  5. `rubble pile`
- **Typed Authority**: `GrainSiloDefinition` in `src/world/setpieces/`

---

## 3. Resource & Disposal Accounting
- Geometries, Materials, Textures, and Scene Children tracked across reset cycles.
- Repeated 5-cycle reset test verifies no memory leaks or duplicate object accumulation.
