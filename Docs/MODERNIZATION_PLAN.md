# Severe Weather Warning Modernization Plan

**Status:** Phases 1 through 3 implemented, automated, packaged, and physically accepted  
**Updated:** 2026-08-04 Central Time  
**Behavioral reference:** PR #15 at `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`  
**Current accepted modernization head:** PR #19 at `b9d55188f91ade720a50837f15591c91209098ad`  
**Next phase:** Phase 4, scoring, districts, campaign, and persistence

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
- PR #13 through PR #19 remain protected draft history until an integration plan is approved.
- PR #14 remains archived Babylon.js research and is not part of production.
- Defold remains Plan B for a specific measured blocker only.
- Netlify is excluded.
- No synthetic FPS fallback.
- No broad rewrite disguised as cleanup.
- One writer per branch.

## Approved target stack

- Three.js
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
  presentation/      renderer, camera, atmosphere, tornado, effects
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

`381014d3d7f4a128e5c6e285200fdb2790af94b5`

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

## Phase 4: scoring, districts, campaign, and persistence

**Status:** next

### Extract

- score accumulation
- combo state
- footage and media bonuses
- challenge scoring
- district progression and thresholds
- campaign progression
- stars and best scores
- ordered unlocks
- selected stop, furthest unlock, and run counts
- save schema, migration, validation, reset, and recovery

### Data-driven direction

Create explicit definitions for:

- campaigns and stops
- district order and contracts
- terrain and palette identity
- landmarks and objectives
- challenge pools
- score targets and modifiers
- unlock conditions
- quality-tier density
- next-stop relationships

Add validators for duplicate IDs, missing references, invalid order, impossible thresholds, broken links, and incompatible save versions.

### Protected behavior

- score remains continuous across district boundaries
- district progression remains forward-only
- combo behavior remains compatible
- three-minute clock remains unchanged
- campaign save compatibility is preserved
- retry does not duplicate rewards
- next-stop opens the correct stop
- QA and bot scenarios do not contaminate player saves

### Required automated evidence

- deterministic full run
- district-boundary score continuity
- combo continuity
- forward-only district transition
- star thresholds
- unlock order
- retry behavior
- save creation and reload
- older-save compatibility or deterministic migration
- corrupt-save recovery
- QA save isolation
- repeated reset and cleanup
- inherited Phase 1 through Phase 3 QA
- Android synchronization and APK assembly

### Physical exit gate

On the exact packaged APK:

- played results equal the displayed score and objectives
- best score persists after process restart
- stars and unlocks persist
- retry does not duplicate progress
- next-stop opens the correct level
- no timing, control, pause, background, or results regression

## Phase 5: rendering and world

Extract:

- renderer and scene ownership
- camera
- atmosphere
- tornado presentation
- world dressing
- buildings and landmarks
- destruction setpieces
- quality-tier presentation

Exit gate:

- fixed before-and-after visual comparisons
- measured performance budget
- no quality-tier gameplay differences
- Hart Farm remains readable
- Cow 17 remains readable

Hart Farm should become the first reusable five-stage setpiece definition, then prove reuse on a second structure.

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

1. implement one coherent phase
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
