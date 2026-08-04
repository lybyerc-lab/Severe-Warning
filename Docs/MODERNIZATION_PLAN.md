# Severe Weather Warning Modernization Plan

**Status:** Phases 1 through 4 implemented, automated, packaged, and physically accepted  
**Updated:** 2026-08-04 Central Time  
**Behavioral reference:** PR #15 at `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`  
**Current accepted modernization head:** PR #21 at `38125918bffdd712ae10731d4472adbf2051d838`  
**Next phase:** Phase 5, rendering, camera, world, buildings, and destruction

## Purpose

Modernize the working Three.js game because the historical patch chain, generated single-file runtime, shared lexical scope, broad globals, and incidental QA hooks slow development and increase regression risk.

This is a controlled strangler migration, not a rewrite.

## Non-negotiable constraints

- Product name remains **Severe Weather Warning**.
- Three.js remains production during the architecture migration.
- Three.js remains at r128 until a separate upgrade milestone.
- Heartland remains campaign terminology.
- Capacitor remains the Android packaging path.
- Accepted gameplay does not change without explicit owner approval.
- People, animals, and media safety laws remain protected.
- The protected PR chain remains unmerged until an integration plan is approved.
- PR #14 remains archived Babylon.js research and is not part of production.
- Defold remains Plan B for a specific measured blocker only.
- Netlify is excluded.
- No synthetic FPS fallback.
- No broad rewrite disguised as cleanup.
- One writer per branch.
- Generated V5.1 output must never be committed over the historical V4.3 source baseline.
- Every modernization workflow must verify source provenance before applying the accepted patch chain.

## Approved target stack

- Three.js r128 during modernization
- Vite
- strict TypeScript
- ES modules
- Capacitor
- Playwright and headless Chromium QA
- Blender to GLB/glTF
- optional KTX2 after measured need
- GitHub Actions for verification and packaging
- GitHub Pages for an approved hosted QA preview

## Target ownership boundaries

```text
src/
  app/               bootstrap, GameApp, GameContext
  core/              lifecycle, clocks, events, configuration
  gameplay/          storm, abilities, scoring, districts, campaign, destruction
  presentation/      renderer, scene, camera, atmosphere, tornado, effects
  world/             entities, buildings, landmarks, Heartland content
  platform/          input, audio, persistence, Android lifecycle
  ui/                HUD, menus, pause, results, campaign map
  qa/                bridge, scenarios, snapshots, visual evidence
  legacy/            temporary compatibility boundary
assets/
  models/ textures/ audio/ data/
tests/
  unit/ integration/ visual/ device/
```

The exact directory tree may evolve. Explicit ownership matters more than matching this sketch character for character.

## Runtime laws already established

### Lifecycle

Major systems use explicit lifecycle ownership:

```ts
export interface GameSystem<TContext> {
  initialize(context: TContext): Promise<void> | void;
  startRun(): void;
  update(frame: GameFrame): void;
  reset(): void;
  dispose(): void;
}
```

### Clock separation

Maintain separate:

- render time
- simulation time
- real warning-run time

The warning countdown remains monotonic and independent of render slowdown. Pause, resume transition, background suspension, and long suspension gaps charge zero warning time.

### Formal QA access

QA should use deliberate runtime contracts rather than arbitrary globals. The bridge must support deterministic setup, typed snapshots, viewport checks, real frame samples, reset, cleanup, and exact build metadata.

### Legacy-executor rule

A new typed system must not become a competing authority before parity is proven.

Use this order:

1. map the accepted legacy behavior
2. capture exact formulas, state transitions, ownership, and cleanup
3. add typed contracts and mirrors
4. wrap or observe the accepted executor
5. prove parity
6. replace the legacy executor only in a separately reviewed milestone

Phase 4 proved why this law is necessary. Class presence is not behavior parity.

## Phase record

### Phase 0: preserve the reference

**Status:** accepted reference preserved

- PR #15 remains intact
- exact artifact and automated evidence retained
- hands-on reference behavior reviewed
- Three.js V5.1 production slice remains the comparison baseline

### Phase 1: modern shell

**Status:** complete and physically accepted

Implemented:

- Vite build
- strict TypeScript
- ES-module entrypoint
- `GameApp`
- `GameContext`
- lifecycle contracts
- build metadata
- legacy runtime adapter
- formal QA bridge foundation
- Capacitor-compatible packaging

Accepted head:

`710ee8537e3d4ca6424b8bf32b282abae0dbfc28`

### Phase 2: clocks and run state

**Status:** complete and physically accepted

Implemented:

- render, simulation, and run-clock authority
- run activation and pause synchronization
- zero-time pause and suspension behavior
- lifecycle synchronization from real run state
- explicit clock-law QA
- player-mode forensic UI guard

Accepted head:

`381014d3d7f4ca6424b8bf32b282abae0dbfc28`

### Phase 3: input and abilities

**Status:** complete and physically accepted

Implemented:

- typed keyboard and touch input authority
- normalized movement snapshot
- ability-command authority and telemetry
- Pull, Gust, and Grid Zap delegation to the accepted legacy executor
- Android touch plus synthetic-click duplicate suppression
- atomic typed and compatibility joystick state
- inherited visual, clock, and control QA

Accepted head:

`b9d55188f91ade720a50837f15591c91209098ad`

### Phase 4: scoring, districts, campaign, and persistence

**Status:** complete, physically accepted, and promoted for review

Implemented:

- typed scoring mirrors and exact legacy contracts
- typed time-driven district mirror
- typed campaign mirror and exact Heartland definitions
- exact `severe_weather_campaign_v1` schema and recovery behavior
- legacy-executor wrappers for scoring, district, campaign, selection, save, load, retry, and next-stop paths
- clean-source provenance guard
- dedicated Phase 4 GitHub Actions and Android packaging gate
- exact-parity verification rather than marker-only checks

Protected values proven:

- combo cap `3.5x`
- combo increment `+0.05`
- combo decay `4.5 seconds`
- campaign score multipliers `1.0`, `1.1`, `1.15`, and `1.25`
- district boundaries at 120 and 60 seconds remaining
- forward-only stages 1 through 3
- exact Heartland stop IDs and targets
- exact star and unlock behavior
- exact save shape and malformed-save recovery

Accepted head:

`38125918bffdd712ae10731d4472adbf2051d838`

Sealed evidence:

- workflow run `30921480977`
- artifact `8897403311`
- artifact digest `sha256:91b94190e089a64028eb1497eecfdb4cd25a976282a0c0d529a42624ac8dbb05`
- APK SHA-256 `9e1f94e269cf4eeb5d6f58300752af61efb7e778a97c1d692fdd899e2ecda295`
- Phase 4 exact-parity verification `72/72`
- owner verdict `Everything was good.`

## Phase 5: rendering and world

**Status:** next

Phase 5 will be executed as controlled checkpoints. Do not combine architectural extraction with a Three.js upgrade or visual redesign.

### Checkpoint A: exact presentation source map

Map:

- scene creation and global ownership
- renderer construction and configuration
- canvas ownership
- resize handling
- camera construction, positioning, look target, and shake
- lighting
- fog and background
- atmosphere and weather layers
- tornado group and funnel layers
- suction rings and debris presentation
- world root and district dressing
- buildings, landmarks, media, animals, and effects
- Hart Farm construction and destruction state paths
- Cow 17 construction, updates, and reset paths
- quality-tier inputs and presentation-only differences
- material, geometry, texture, and render-target creation
- reset, removal, geometry disposal, material disposal, texture disposal, listener cleanup, and renderer disposal

Capture accepted constants and behavior. Do not infer replacements.

### Checkpoint B: presentation lifecycle and typed mirrors

Introduce explicit contracts for:

- renderer snapshot
- scene snapshot
- camera snapshot
- atmosphere snapshot
- tornado presentation snapshot
- world population snapshot
- resource and listener counts
- reset and disposal results

The first implementation should observe or wrap the accepted runtime. It must not replace visible behavior merely to create cleaner classes.

### Checkpoint C: fixed visual baselines

Preserve fixed captures for at least:

- desktop `1365x768`
- mobile landscape `915x412`
- the wide landscape geometry that previously exposed results-title crowding
- production hero scenario
- active gameplay with tornado, debris, dressing, Hart Farm, and Cow 17 visible
- each Hart Farm destruction state that can be deterministically prepared

Required existing production-slice truths include:

- Three.js r128 renderer identity
- at least three funnel layers
- three suction rings
- at least ten debris instances in the production scenario
- authored Hart Farm roof separation
- readable and decorated Cow 17
- at least twelve crop rows
- at least eighteen trees
- visible fences
- real measured frame samples rather than synthetic FPS

### Checkpoint D: Hart Farm reusable setpiece definition

Represent the accepted five-state language:

1. intact
2. damaged
3. roof peel
4. exposed or partial collapse
5. wreckage

The first reusable definition must preserve:

- existing geometry and visible composition
- stage thresholds
- visible meshes by stage
- detachable pieces
- score and audio event timing
- debris behavior
- reset behavior
- scene removal and disposal

Then prove the same contract on one second existing structure without inventing a new landmark or changing gameplay balance.

### Checkpoint E: quality and performance evidence

Quality tiers may alter presentation density only. They must not alter:

- score
- objectives
- collision
- ability range
- storm speed
- damage thresholds
- district timing
- campaign behavior

Evidence must include:

- real median FPS samples on desktop and mobile QA viewports
- draw-call, triangle, geometry, material, and texture counts where available
- before-and-after resource counts across repeated reset cycles
- no unbounded growth after repeated scenario setup and disposal
- Android artifact and physical device review

### Phase 5 automated exit gate

- clean historical source provenance
- strict TypeScript
- all inherited V5 through Phase 4 verification
- all inherited visual, clock, input, ability, score, district, campaign, and persistence QA
- fixed presentation snapshots
- scene and renderer contract probes
- deterministic camera and atmosphere snapshots
- Hart Farm five-state contract checks
- second-structure reuse proof
- resource cleanup and repeated-reset tests
- no page or console errors
- no player-visible QA diagnostics
- Capacitor synchronization
- Android APK assembly

### Phase 5 physical exit gate

On the exact packaged APK:

- camera framing and storm feel remain unchanged
- tornado, dust, debris, and atmosphere remain visually equivalent
- Hart Farm destruction remains readable through its stages
- Cow 17 remains readable and safe
- buildings, landmarks, media, and dressing remain present
- no flicker, missing meshes, frozen effects, or stale debris after retry
- no control, ability, clock, score, district, campaign, save, pause, or background regression
- repeated retry or next-stop does not leave duplicated world objects
- heat and performance observations are recorded for the tested device

## Phase 6: audio, UI, storage, Android lifecycle, and QA completion

Finish separation of:

- audio buses and event routing
- HUD, menus, pause, results, and campaign map
- storage and save migration
- Android lifecycle
- formal QA scenarios, snapshots, and captures
- QA build and player build separation

Exit gate:

- all inherited and new automated tests pass
- Android lifecycle tests pass
- player builds expose no QA UI
- no stale patch dependency remains for migrated systems

## Phase 7: retire patch archaeology

Only after parity is proven:

- stop rebuilding ordinary production through the historical patch chain
- make TypeScript modules the production source
- archive patch scripts with provenance
- keep reproducible release tags and migration documentation
- preserve the accepted legacy baseline

## Data-driven content direction

Move these definitions out of hardcoded renderer and gameplay forests where practical:

- campaigns and stops
- districts
- terrain and palette identity
- landmarks
- building placement
- destructible setpieces
- destruction thresholds
- challenges
- scoring targets and modifiers
- quality-tier density

Reference details and deferred product scope are preserved in `Docs/RECOVERED_KNOWLEDGE_BASE.md`.

## GitHub Pages QA preview

Add a QA-preview workflow that:

- deploys only from approved preview branches or explicit dispatch
- stamps exact source commit and workflow run
- exposes build metadata only in QA mode
- does not mutate production branches
- supports rollback by artifact or commit
- never claims physical acceptance
- does not use Netlify

## QA and player package separation

Produce explicit modes:

- QA browser preview
- QA Android APK
- player release candidate
- production release

Player-facing builds must not display QA badges, forensic panels, direct test controls, or debug telemetry.

## Build cadence

1. implement one coherent phase or checkpoint
2. run static, type, structural, deterministic, and inherited parity checks
3. provide one browser review point
4. perform one consolidated correction pass
5. synchronize Android and build one APK
6. complete physical Android acceptance
7. record exact evidence in the repository

Do not generate owner test builds for every internal refactor.

## Three.js upgrade policy

Do not combine:

- architecture modernization
- Three.js version upgrade
- major visual redesign
- gameplay redesign

After the modern TypeScript source becomes authoritative, perform a dedicated upgrade using official migration guidance, fixed visual captures, GLB and material checks, WebView testing, and a physical Android matrix.

## Completion definition

Modernization is complete when:

- the game boots from real TypeScript modules
- historical patch scripts are not required for normal production builds
- major systems have explicit lifecycle and ownership
- campaign and destruction content can be extended through validated data
- QA uses formal contracts
- QA and player package modes are distinct
- GitHub Pages preview and Android packaging are reproducible
- accepted gameplay remains intact
- owner-approved browser and APK evidence is recorded
