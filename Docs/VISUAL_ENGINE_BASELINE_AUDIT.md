# Visual Engine Baseline Audit

Date: 2026-08-03  
Inspected commit: `d366cc9a1d6ec97192e5245a41bd193a21a769bc`  
Integration branch: `agent/v500-heartland-campaign`  
Production control source: `MechanicsLab/SevereWeather_3D_Lab.html`

## Source-truth boundary

The checked-in HTML is the stable Three.js control source. CI reconstructs the active V5 candidate by applying the ordered v4.3.1 through v5 patch train. Consequently, a symbol can be absent from the base HTML yet present in the built V5 runtime. The control source, patch scripts, and generated browser package must be considered together. This audit does not change any of them.

## Renderer and scene

| Area | Production implementation | Stable anchor or location |
|---|---|---|
| Three.js | Embedded minified UMD build, revision `128`; no runtime CDN | HTML line 18; `THREE.REVISION` export in embedded distribution |
| Scene | One `THREE.Scene`; dark background and exponential fog | lines 869-915 |
| Renderer | `THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })`; ACES filmic tone mapping; soft shadows | lines 884-913 |
| Camera | `PerspectiveCamera`, 45-degree FOV, near `0.1`, far `1000` | lines 875-880 |
| Camera composition | Initial position `(0, 78 * mobileFactor, 110 * mobileFactor)` looking at origin. Animation follows the storm with movement look-ahead, containment, optional shake, and Cow-Cam patch blending. | lines 875-882 and main loop; Cow Signature patch camera anchor |
| Lighting | Ambient, hemisphere, and shadow-casting directional light | lines 895-913 |
| Resize | Updates camera aspect/projection and renderer size | lines 1213-1217 |
| Main loop | `requestAnimationFrame`; capped simulation delta; monotonic real-time warning-clock patch; one render at loop end | lines 3344-3894; `apply-v500-realtime-clock-fix.mjs` |

The camera is a pulled-back tactical perspective camera, not an orthographic camera or orbit-control camera. The base values are proven; exact runtime distance is dynamic and affected by storm form, mobile factor, movement look-ahead, containment patches, shake, and Cow-Cam. There is no user-controlled free orbit in production.

## World construction

| System | Construction and behavior | Source anchors |
|---|---|---|
| Terrain | 800-by-800 vertex-colored displaced plane plus a low-detail 1800-by-1800 county apron, contours, regional V5 terrain profiles, fog/palette adjustments | `terrainHeightAt`, `districtGroundColor`, `conformPlaneToTerrain`, `apply-v500-world-tour-patch.mjs` |
| Roads | Authored horizontal/vertical road meshes conformed to terrain; instanced lane marks; V5 world patch preserves road-safe terrain | `createTerrainRoad`, `addInstancedRoadMarks` |
| Water | Transparent creek material and conformed creek geometry | terrain block near lines 1036-1048 |
| Buildings | Procedural houses, commercial buildings, authored living-county blocks, damage stages, persistent ruins | `createHouseMesh`, `createCommercialMesh`, `buildLivingCounty`, `applyTargetDamageStage` |
| Landmarks | Procedural landmark proxies plus eight V5 signature landmarks | `createLandmarkMesh`; `apply-v500-world-tour-patch.mjs` |
| Regional scenery | V5 patch injects four terrain/scenery contracts and stop-specific dressing | `[SW:WORLD:CAMPAIGN_IDENTITY]` in generated runtime |
| Vegetation | Procedural low-poly trees, grouped by authored block; accepted Gust/Pull response patches | `createTreeMesh`; `[SW:WORLD:TREE_RESPONSE]` |
| Utilities | Pole groups, crossbars, power-line graph behavior, substations, lightning and blackout events | pole construction near line 1048; `createSubstationMesh`; `[SW:WORLD:POWER_GRID]` |
| Vehicles | Procedural town cars, road-following media vehicles, news vans, storm-chaser SUVs | `createTownCarGroup`, `spawnTownCars`, `createMediaVehicleMesh`, `updateMediaCrews` |
| Media | Invincible observers with road snapping, safe-distance retreat, flashes, headlines, and footage scoring | lines 1811 onward; `[SW:LAW:MEDIA-NOT-COMBAT]` |
| Animals | V5 patches create bounded, safe animals; Cow Signature patch adds persistent Cow 17, flight telemetry, Cow-Cam, hay landings, and LOD-aware construction | `apply-v500-world-tour-patch.mjs`, `apply-v500-cow-signature-patch.mjs`; `[SW:LAW:SAFE-ANIMALS]` |

## Storm and effects

The tornado is already layered rather than a single cone: a mesocyclone cloud group, inner cylinder funnel, translucent outer funnel, touchdown dust bowl, point debris, and a ground ring. The main loop animates rotation, opacity, scale, particles, ground response, storm translation, and storm-form-specific layers. Supercell and derecho have separate cloud/hail or bow-echo/microburst constructs.

Ability visuals remain coupled to gameplay functions:

- Grid Zap begins in `triggerAbility`, then uses lightning targets, utility nodes, flashes, arcs, sparks, and blackout events.
- Gust applies visible pressure/dust response and accepted tree/loose-prop motion through the v4.4.1 patch.
- Pull applies vegetation anticipation, loose-object response, debris orbit, and safe animal flight through the v4.4.2 and V5 patches.

The renderer currently consumes gameplay-owned arrays and mutable objects directly. There is no renderer-neutral event stream or world snapshot boundary.

## Materials, atmosphere, and particles

- Materials are primarily `MeshStandardMaterial` and `MeshBasicMaterial`, with line, points, sprite, and canvas-backed sign materials.
- The illustrated look uses flat shading, selected emissive/readability treatment, color scripting, ACES tone mapping, fog, and bounded shadow casting. It does not use a global toon shader or full-screen outline pass.
- Particle-like systems are custom bounded arrays and Three.js `Points`, plus short-lived mesh puffs/rings/sparks. No general-purpose particle engine owns their lifecycle.
- Destruction favors visible mesh pieces and persistent footprint ruins. Buildings use authored state changes rather than unrestricted structural physics.

## State ownership

| Truth | Current owner | Renderer coupling |
|---|---|---|
| Gameplay truth | storm input, abilities, damage, score, combo, objectives, warning clock, district/campaign state | Directly mutates scene objects and DOM |
| World-state truth | target arrays, media arrays, animals, pickups, utilities, set pieces, terrain helpers | Stored beside meshes; often mesh-backed |
| Rendering behavior | scene graph, materials, effects, camera, animation, resize | Same inline script and loop |
| UI behavior | DOM overlays, panels, headlines, results, map, QA tools | Calls gameplay and presentation functions directly |
| Audio behavior | Web Audio buses, manifest clips, event routing, voice limits | Triggered from gameplay/destruction paths |
| QA behavior | URL modes, injected harness functions, deterministic timers and state inspection | Patch-injected access to runtime internals |

This coupling is why the Babylon laboratory must begin with a read-only contract rather than replacing the active renderer.

## Destruction, reset, and cleanup

Targets advance through visual damage, then destruction creates debris, puffs, shockwaves, and persistent ruins. Debris and transient effects use caps and lifetime retirement; exact caps differ by system and patch stage. `resetWarningRun` restores gameplay state and rebuilds or resets world systems. Visibility handling pauses warning-clock charge during backgrounding.

Potential leak risks requiring future adapter tests:

- window/document listeners are installed globally and not explicitly removed;
- the production renderer has no explicit `renderer.dispose()` path;
- canvas sign textures and per-object materials rely on scene lifetime rather than central registries;
- patch-injected timeouts and QA schedules require explicit cancellation on retry;
- transient geometries/materials must be retired on every path, including retry during an active effect;
- AudioContext voices and timers are a separate cleanup responsibility;
- direct arrays containing meshes can retain disposed objects if splice/retire paths diverge.

The existing QA4 cleanup test and full-round run are strong regression evidence, but they do not prove repeated scene construction/disposal or heap stability.

## Mobile and performance controls

Production detects a mobile-sized viewport and adjusts camera distance, pixel ratio, HUD, controls, effects, and object density. Existing controls include renderer pixel-ratio limits, bounded particles/debris/audio voices, instanced road marks and ridge rocks, controlled animal density, shadow configuration, limited popup counts, and regional scenery budgets. There is no unified runtime quality tier or diagnostic HUD reporting draw calls, vertices, materials, textures, and cleanup deltas.

## QA instrumentation

The generated V5 runtime exposes deterministic QA4, full-round, world-tour, campaign, Cow 17, Cow-Cam, audio, and layout hooks. CI has proven a complete 190-second round and a four-stop sweep with zero page or console errors at the inspected head. Those hooks are production-specific and must not become the Babylon renderer API.

## Stable integration anchors

The durable integration points are the named anchors in `Docs/CODE_ANCHORS.md`, especially gameplay control, abilities, run clock, destruction, media, animals, bovine signature, power grid, lifecycle, cleanup, and the protected design laws. Some anchors exist only after the patch train; an adapter must operate on the generated runtime or receive explicit source anchors through a separately reviewed production change.

## Audit command

Run from repository root:

```powershell
node scripts/audit-visual-engine-readiness.mjs
```

It writes `Docs/Evidence/VisualEngineLab/visual-engine-baseline.json` and fails if the expected Three.js scene/renderer source is unavailable. The script reports marker confidence and limitations; it does not claim runtime reachability from string detection.

