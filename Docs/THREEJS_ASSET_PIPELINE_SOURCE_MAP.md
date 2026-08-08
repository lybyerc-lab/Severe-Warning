# Three.js Asset Pipeline Source Map

Date: 2026-08-08
Milestone: Stage 1 asset-pipeline foundation
Branch: `agent/threejs-asset-pipeline-foundation`
Frozen gameplay reference: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

## Purpose

This milestone proves that authored presentation data can enter the existing Three.js game without moving gameplay authority into the art pipeline.

The proof asset is intentionally narrow. It is not the final art style and it is not a claim that the graphics pipeline is complete.

## Accepted gameplay seam

`runtime/city-fabric-destruction.js` already separates target truth from presentation:

Gameplay target truth includes:

- `health`
- `maxHealth`
- `stage`
- `damageStage`
- `destroyed`
- `points`
- `kind`
- `materialFamily`
- world target coordinates

Presentation is carried by:

- `target.meshData`

Stage 1 uses that existing separation. The asset pipeline may replace an **intact target's** `meshData` presentation, but it does not redefine the target's gameplay fields.

## New source files

### `assets/production/structures/storefront-v1.json`

First external authored structure specification.

- id: `structure.storefront.v1`
- archetype: `shop`
- schema: `SW_STRUCTURE_ASSET_V1`
- local/offline asset
- anatomy includes shell, wall/base, interior wound, roof/parapet, pilasters, glass, door, awning, sign, roof unit, and rear service door
- parts carry presentation anatomy tags that can later support more sophisticated damage visuals

This JSON proof format is a foundation adapter, not the final preferred production interchange. GLB/glTF remains the preferred authored 3D direction before broad art conversion.

### `runtime/threejs-asset-pipeline.js`

Guarded presentation runtime.

Responsibilities:

- registry of production presentation assets;
- local loading and caching;
- schema validation;
- building the proof presentation mesh;
- generation guard so an async result cannot attach to a rebuilt county;
- intact-target guard so late art cannot replace a structure already damaged by gameplay;
- fallback preservation;
- diagnostic snapshot bridge.

Explicitly forbidden responsibilities:

- storm input or movement;
- Pull/Gust/Grid Zap execution;
- health mutation;
- score/combo mutation;
- warning-clock mutation;
- campaign/progression mutation;
- destruction-stage mutation;
- target coordinate mutation;
- safe-animal behavior.

### `scripts/apply-threejs-asset-pipeline.mjs`

Installs the runtime only after the accepted presentation/city-fabric patch chain exists and before the first world initialization.

It fails closed when the accepted prerequisite markers are missing.

### `scripts/verify-threejs-asset-pipeline.mjs`

Static contract verifier.

Important gate: it scans the new runtime for assignments to protected target truth fields and for obvious score/clock/ability mutation paths.

It also verifies the authored structure anatomy, local asset URL, package commands, and offline packaging seam.

### `scripts/qa-threejs-asset-pipeline.mjs`

Browser proof at 932x430.

Success path verifies:

- renderer remains Three.js r128;
- exactly one authored storefront presentation attaches;
- accepted shop health stays `165`;
- accepted shop points stay `110`;
- damage stage remains intact;
- authored anatomy exposes at least ten damage parts;
- the accepted city-fabric bridge remains alive.

Fallback path intercepts the authored asset with an intentionally invalid schema and verifies:

- the authored presentation is not applied;
- the accepted procedural city remains present;
- the failure is reported rather than converted into gameplay corruption.

### `scripts/build-web.mjs`

Copies `assets/production/` into the offline web package and records the first authored asset digest in `build-info.json`.

The Android synchronization gate verifies the same asset exists inside the Capacitor packaged web assets.

### `.github/workflows/threejs-asset-pipeline.yml`

Exact-source milestone workflow.

It builds both:

- frozen Three.js reference `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`;
- current Stage 1 candidate.

Then it runs the complete inherited browser QA train, the new success/fallback asset QA, same-runner performance evidence, offline packaging, Android synchronization, and debug APK assembly.

## Stage 1 mutation boundary

The only authoritative target assignment introduced by this milestone is:

`target.meshData = authored`

Additional `__sw...` properties are diagnostic/private presentation bookkeeping only.

If a later asset implementation needs to mutate health, damage stage, destroyed state, points, score, input, timer, campaign, or target position, that is no longer a Stage 1 presentation change and requires a separately approved gameplay/destruction milestone.

## Fallback law

Authored presentation is optional until it proves itself.

When the asset is missing, invalid, stale after a county rebuild, or arrives after the target is damaged, the accepted gameplay/presentation fallback remains authoritative. The game must continue rather than converting an art-loading failure into a gameplay failure.

## Future GLB/glTF adapter

The production target is authored GLB/glTF assets with explicit validation and mobile budgets.

Do not add a GLTF loader by upgrading Three.js inside this milestone. The next adapter should be introduced as a bounded pipeline extension after this external-asset/fallback seam passes browser QA and owner review.

The desired future contract is:

- registry entry declares format and local asset path;
- loader returns presentation nodes only;
- metadata maps authored nodes to damage/anatomy roles;
- gameplay target truth remains unchanged;
- missing/invalid assets retain the accepted fallback;
- packaging proves every required asset is local/offline;
- mobile geometry, texture, material, and draw-call budgets are checked before wider conversion.
