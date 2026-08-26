# Severe Warning — backlog

The living list. **This file is the source of truth**, not a chat message and not
a published board. It lives in the repo so it survives container rewinds, agent
handoffs and the gap between sessions, and so AG can read it without being told
what is in it.

Rules for keeping it alive:

- Update it **in the same commit** as the work it describes. A backlog updated
  later is a backlog that is already wrong.
- Move things to **Landed** rather than deleting them. The record of why
  something was done is worth more than a short file.
- **Parked** is not a graveyard. Anything there must say exactly where the work
  lives, so picking it back up is a lookup and not an excavation.
- Numbers in here are measured, not estimated. If a figure cannot be measured
  right now, say so instead of guessing.

State at last update: 103 models, 1.20 MB of the ~2 MB budget (60%). 3 branches,
0 open PRs, 127 archive tags. `qa` is the default and the working branch.

---

## Next up — AG (assets)

All current batch requests completed. Open for next director requests.

## Next up — Code & Modernization

1. **Source HTML File Renaming.** Transition source HTML file name from `MechanicsLab/SevereWeather_3D_Lab.html` to canonical `SevereWeather_Warning.html`, updating all build pipelines, verification scripts, and CI paths cleanly.
2. **County Fair & Industrial Landmark Animations.** Ferris wheel / Carousel continuous rotation with glowing light trails and 32m Foundry stack smoke plume particles.
3. **Reviving Parked MOO-LAH Economy & Storm Upgrades.** Port the persistent storm currency, upgrade shop, and cosmetic funnel skins into modern shell.

## Decisions open

Nothing blocking. The board is clear.

---

## Parked — do not lose, not being worked

- **MOO-LAH — storm currency, upgrades and skins.**
  Lives at tag `archive/agent/sw-rpg-001-moolah-storm-triangle`, commit
  `ce1e47c`. 423 lines: a runtime module, a QA script, a verify script, wired
  to the persistent scorekeeper.
  **Catch:** it predates the patch-chain flattening, so it sits in `runtime/`
  behind an `apply-*.mjs`. Reviving it means porting into the inlined game, not
  checking the branch out. Budget for that, not for a merge.
  The name is reserved: nothing else in the game may be called MOO-LAH, which
  is why the discount store is UDDER VALUE.

- **`fire-hydrant`, `fire-hydrant-wreck`.** Authored, welded, deliberately not
  placed. They render 5–8 pixels tall at the game's own cameras while costing
  308 triangles an instance, more than a street lamp at 252 or a signal at 300.
  Worth reviving only if the camera ever moves closer.

- **`hart-barn`, `hart-barn-wreck`.** The hero Hart Farm barn's likeness, and
  the hero barn does not want a model — see Standing rules. Keep as reference
  or retire; do not wire.

---

## Standing rules — settled, do not relitigate

- **First law: nothing that moves is ever harmed.** Enforced at `damageTarget`,
  which is the single chokepoint every hazard reaches a target through.
  The dealership draws the line precisely: **a car with a driver is a protected
  actor; a car parked on a lot is inventory.** Town cars drive, so the storm
  cannot touch them. Lot cars do not, so it can.

- **The hero Hart Farm barn is not model-backed, deliberately.** Its collapse
  detaches `roofLeft`, `frontWall`, the ridge and both doors **by name** across
  four stages. Point a single-mesh model at it and every stage fires, every
  point is awarded, every gag toast prints, and nothing moves on screen.

- **FRAMING keeps its toggle.** STORM is the better view and CLASSIC stays
  available; people like different views.

- **Export contract lives in `Docs/GLB_PIPELINE_HANDOFF.md`**, including the
  three rules that cost us a round each to learn: one mesh and one material for
  anything instanced, triangles budgeted against a model's neighbours rather
  than the cap, and near-neutral `COLOR_0` on anything that stands on many lots.

- **The build refuses to ship a model batch that cannot load.** Two guards in
  `scripts/build-web.mjs`, both added because the failure they catch is silent:
  a `.glb` anywhere but `assets/models` fails the build (the Unity-era `Assets/`
  tree differs only by case and is not packaged), and any name passed to
  `instantiateActorModel`/`loadActorModel` that is not packaged fails it too.
  Both are proven against negative controls. If a batch lands and the build goes
  red with either message, that is the guard working, not a broken build.

- **Town layout is deterministic on purpose.** Lot jitter, rotation and gaps are
  hashed from each lot's own coordinates, never `Math.random()`. The town is
  rebuilt every run and the visual regression gate compares one build's render
  against another's; random placement would mean it never passes again.

---

## Landed

Newest first. Kept for the reasoning, not the changelog.

- Broadsheet Newspaper Presentation & "Moo Brew Touchdown" Opening Cutscene:
  - Created type-safe opening cinematic subsystem (`src/presentation/cinematics/`) with Cow 17 actor rig, Moo Brew coffee cup, chickens, fence staging, and a 1.5s cubic-smooth camera spline blend to player follow camera.
  - Created broadsheet newspaper presentation system (`src/ui/newspaper/`) with morning lead forecast kicker, period launch styling (`EXTRA! EXTRA! ISSUE THE WARNING!`), and evening edition results dispatch with integrated MOO-LAH shop.
  - Added unit test suites `src/presentation/cinematics/opening-cinematic.test.ts` and `src/ui/newspaper/newspaper-presentation.test.ts` (100% pass across 31 total tests).
  - Inlined `[SW:UI:NEWSPAPER_PRESENTATION_V1]` and `[SW:CINEMATIC:PLAYABLE_OPENING_V1]` in `MechanicsLab/SevereWeather_3D_Lab.html`.
  - Added `scripts/verify-newspaper-opening.mjs` verification suite.
- CI Hardening & TypeScript Hygiene:
  - Cleaned up unused imports across test suites and systems ensuring strict `tsc --noEmit` adherence (`noUnusedLocals`).
  - Added `scripts/lib`, `vite.config.ts`, and `vite.prelude.config.ts` to `RENDER_INPUTS` in `scripts/visual-regression-gate.mjs` ensuring historical baseline rebuilds match their exact configuration.
- Building-Specific Debris FX & Color Mapping:
  - Enhanced `spawnActorChunks` with building-specific color palettes (primary wall paint, foundation stone/mortar, structural wood timber, and galvanized metal trim).
  - Added varied fragment geometries (elongated structural planks, flat wall panels, and shattered blocks).
- Revived MOO-LAH Economy & Storm Upgrades:
  - Ported parked MOO-LAH destruction economy and Storm Triangle upgrade loadout (`pull`, `gust`, `gridZap`) into `src/gameplay/economy/` (`MoolahSystem`, `moolah-contracts.ts`).
  - Added unit test suite `src/gameplay/economy/moolah-system.test.ts` (100% pass).
  - Inlined `[SW:GAME:RPG_V1]` in `MechanicsLab/SevereWeather_3D_Lab.html` with persistent LocalStorage schema (`severe_weather_rpg_v1`).
  - Added `scripts/verify-moolah-economy.mjs` verification suite.
- County Fair & Industrial Landmark Animations:
  - Added continuous Ferris wheel mechanical rotation (`speed: 0.22`) for authored and procedural wheel models in District 3.
  - Added active rising industrial smoke plume particle systems to the 32m twin smelting chimneys on the Foundry in District 2.
  - Added `emitSmoke` and `emitMoltenEmber` to `ParticleSystem` (`src/presentation/vfx/`) with unit test coverage.
- Phase 8 Physics & Engine Subsystems Modularization:
  - Created type-safe vortex physics system under `src/gameplay/physics/` (`TornadoPhysicsSystem`, `tornado-physics-contracts.ts`) implementing Rankine vortex velocity fields, radial suction vectors, and ballistic debris particles.
  - Implemented `CollisionDetectionSystem` enforcing the `damageTarget` chokepoint, multi-stage structure degradation, and First Law invariant protection.
  - Created `ParticleSystem` (`src/presentation/vfx/`) and `GameLoopController` (`src/gameplay/loop/`).
  - Added unit test suite `src/gameplay/physics/tornado-physics-system.test.ts` (100% pass across all 27 unit tests).
  - Inlined `[SW:ARCH:PHASE8_ENGINE_BRIDGE]` in `MechanicsLab/SevereWeather_3D_Lab.html` with marker `MODERNIZATION_PHASE8_ENGINE_V1`.
  - Added automated structural verification (`verify-modernization-phase8-engine.mjs` - 19/19 checks pass) and live headless Chrome CDP probe (`qa-modernization-phase8-engine.mjs`).
- Phase 7 Audio & Traffic Subsystems Modularization:
  - Created type-safe audio subsystem under `src/audio/` (`AudioSystem`, `audio-contracts.ts`) managing master/sfx/ambient/ui gain mix, sprite cue playback, and synthesizer fallback.
  - Connected generated 41-clip audio sprite (`assets/audio/storm-feel-sprite.wav` and `assets/audio/storm-feel-manifest.json`) resolving audio load errors and warning logs.
  - Created type-safe ambient traffic subsystem under `src/gameplay/traffic/` (`TrafficSystem`, `traffic-contracts.ts`, `traffic-system.test.ts`) spawning all 4 authored vehicles (`town-car`, `pickup-truck`, `news-van`, `storm-chaser-vehicle`) with waypoint route navigation and panic flee behaviors enforcing the First Law invariant.
  - Inlined `[SW:ARCH:PHASE7_AUDIO_TRAFFIC_BRIDGE]` in `MechanicsLab/SevereWeather_3D_Lab.html` with marker `MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1`.
  - Added verification test suite (`verify-modernization-phase7-audio-traffic.mjs` - 22/22 checks pass) and headless Chrome CDP probe (`qa-modernization-phase7-audio-traffic.mjs`).
- Phase 6 HUD & UI TypeScript Modularization:
  - Created type-safe TypeScript UI subsystem under `src/ui/` (`HudSystem`, `RampageFeedbackSystem`, `DistrictTransitionSystem`, `ResultsSystem`, and master `UISubsystem`).
  - Added unit test suite `src/ui/hud/hud-system.test.ts` (100% pass across all 20 test cases).
  - Inlined `[SW:ARCH:PHASE6_UI_BRIDGE]` / `[SW:SOURCE:modernization-phase6-ui.js]` in `MechanicsLab/SevereWeather_3D_Lab.html` with marker `MODERNIZATION_PHASE6_UI_V1`.
  - Added automated structural verification (`verify-modernization-phase6-ui.mjs` - 40/40 checks pass) and live headless Chrome CDP probe (`qa-modernization-phase6-ui.mjs`).
- County-Wide High-Detail Model Overhaul (Residential, Commercial, Landmarks & Vehicles):
  - Upgraded 24+ primary models and wrecks (`ranch-house`, `ranch-house-garage`, `craftsman-house`, `craftsman-house-garage`, `split-level-house`, `district-barn`, `grocery-store`, `car-dealership`, `discount-store`, `commercial-shop`, `commercial-shop-gable`, `commercial-shop-mansard`, `commercial-shop-deco`, `courthouse`, `gas-station`, `substation`, `farm-windmill`, `grain-bin`, `water-tower`, `coffee-cup`, `lot-car`) with authentic structural geometry, multi-layer siding, stone foundations, window mullions, shutters, porches, and rooftop HVAC machinery.
  - Re-authored the `coffee-cup` (MOO-BREW) with a proper vertical C-shaped cup handle, dome sipping lid with drinking spout, insulated cardboard sleeve, and espresso spill wreck.
  - Preserved 100% Single Mesh Contract compliance across all 103 `.glb` files with 0 footprint/Y-min/geometry violations (total payload 1.067 MB / 2.0 MB budget).
  - Fixed `ACTOR_MODEL_PATH` routing and ensured vertex-color fidelity across swapped models.
- Residential House Road Alignment & Visible Garage Driveways:
  - Aligned all residential houses and commercial storefronts parallel to the adjacent perimeter street, ensuring front entrances, porches, and garage doors face outward directly towards the road.
  - Prioritized garage house models (`ranch-house-garage`, `craftsman-house-garage`) across residential blocks with procedural white overhead door panels.
  - Adjusted ground dressing lift and pad layering so wide concrete driveway slabs (`drivewayMat`, $4.8\text{m}$ width) connect cleanly from the garage and front facade straight to the asphalt road shoulder.
- QA 90 Playability & Clean Skyline Hotfix:
  - Fixed startup `ReferenceError: Cannot access 'streetPropSets' before initialization` causing black screen in QA 90.
  - Removed obtrusive overhead wire lines that formed thick spiderleg polygons across roads; preserved high-detail authored utility poles with step-down transformer cans and dynamic electric blowout particle bursts.
  - Verified 0 browser console/runtime errors across live Playwright/CDP round simulation.
- County Micro-Dressing (Driveway Mailboxes, Industrial Rail Spur & Pasture Fencing):
  - Placed 47 `rural-mailbox` + `rural-mailbox-wreck` props at the heads of residential driveways along Pine Ridge and the farm belt via instanced street props (costing 1 draw call, fully destructible).
  - Added continuous industrial rail spur tracks (crushed rock ballast bed, 150 creosote timber ties, dual steel rails) along Foundry Row ($X: -280 \to -40, Z = 96$).
  - Added rustic split-rail cedar timber fencing enclosing agricultural pastures in District 3 (instanced into 1 draw call).
- Power grid overhaul, catenary lines & transformer blowout FX:
  - Re-authored `power-pole` + `power-pole-wreck` ($1.2\text{m} \times 9.0\text{m} \times 1.2\text{m}$) with authentic cylindrical high-voltage transformer drum cans, tiered crossarms, blue glazed ceramic insulators, and steel conduit.
  - Generated county-wide catenary utility power lines spanning between all 117 poles in a single draw call via `THREE.LineSegments`.
  - Added dynamic wire snapping and transformer blowout spark particle bursts with lightning flash and electrical sound FX upon storm impact.
- Dealership lot & parked inventory cars wired in-engine: Placed `car-dealership` as a
  named county anchor with an expanded 44m x 22m paved parking apron and 2 rows of 4
  color-tinted destructible `lot-car` inventory sedans (points: 60, health: 65, wreck: `lot-car-wreck`).
  All inventory cars take damage, flip, and collapse under storm wind/debris while adhering
  to the First Law (parked cars on lots are inventory).
- Round 2 3D Model visual polish:
  - Corrected `coffee-cup` handle orientation from horizontal to a proper **vertical ceramic C-ear handle** along the side of the mug, eliminating the 'trash can' appearance.
  - Re-authored `inflatable-mascot` from stiff vertical tubes to a **dynamic S-curve dancing tube man** with wildly flailing wavy arms, yellow fringe fingers, mayor suit/tie, and cartoon smiley face.
  - Re-authored `oak-tree` with natural root flares firmly planted on the ground and clustered low-poly organic canopy masses.
- Build guards against silent model-batch failures — wrong-case directory, and
  gameplay naming a model that is not packaged.
- 3D Model visual repairs & geometry normal fix: Corrected vertex winding order and
  outward normal calculation in core primitives (`addCylinder`, `addCone`, `addBarrelVault`).
  Re-authored `coffee-cup` (solid flared ceramic mug with sleeve & foam topping, fixing the
  inverted cone hole), `foundry` (sealed continuous sawtooth roof bays & 32m smelting stack,
  eliminating floating wedges), `courthouse` (integrated clock tower, belfry & solid dome,
  eliminating floating slices), `bbq-grill` (rounded kettle bowl, domed lid, wire grate,
  eliminating the hourglass cones), and `industrial-warehouse-curved` (sealed barrel vault).
- Car dealership (`car-dealership` + wreck) with high-ceiling glass showroom, service
  garage bay, brand pylon sign, and parked inventory car (`lot-car` / `parked-car` + wreck)
  with near-neutral COLOR_0 for runtime lot row tinting.
- Attached garage house variants (`ranch-house-garage`, `craftsman-house-garage` + wrecks),
  restoring suburban attached garage silhouettes in a single welded mesh per house.
- Authentic supermarket & discount store branding: `MOO-MART` green/white pasture branding
  on `grocery-store` + wreck, `UDDER VALUE` red/yellow discount branding on `discount-store` + wreck.
- Sidewalks downtown, gravel shoulder left alone in the farm belt. 20 continuous
  runs rather than 72 per-block slabs.
- Named store anchors with parking, driveways for every house. 65 ground slabs,
  no new assets.
- AG's storefront batch landed and the tint rebuilt for it. Every new model had
  gone to `Assets/models/` rather than `assets/models/`, so none were packaged
  and 39 buildings had fallen back to procedural boxes. 30 shopfronts across 6
  silhouettes and 8 tints now.
- Town asymmetry: lot shift, off-axis rotation, mixed uses, occasional gaps.
  Distinct building yaws 4 → 94.
- Rain that reads as rain, a horizon without a seam, an unclipped radar label.
- Two barns and a road of farmhouses, not a belt of eighteen barns.
- Pole wrecks — the storm leaves a trail. 117 stumps for the same 2 draw calls
  the original boxes cost.
- The damage regression: 122 of 140 destructible props were taking damage with
  nothing to show for it. One root cause, one shared helper.
- Storm cloud shader — canopy and supercell wall cloud.
