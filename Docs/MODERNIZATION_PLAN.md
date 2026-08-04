# Severe Weather Warning Modernization Plan

**Status:** Approved direction, implementation not yet started  
**Prepared:** 2026-08-03 Central Time  
**Starting reference:** PR #15 at `c49ba1c52ac58d3bd1c6e1d60d7e84cd28a16c72`

## Purpose

Modernize the production structure because the current patch-chain and generated single-file runtime are slowing development and increasing regression risk.

This is a controlled migration of the working Three.js game, not a rewrite.

## Non-negotiable constraints

- Product name remains **Severe Weather Warning**.
- Three.js remains the production renderer.
- Heartland remains campaign terminology.
- Capacitor remains the Android packaging path.
- Accepted gameplay behavior must remain unchanged unless the owner explicitly approves a design change.
- PR #13, PR #14, and PR #15 remain protected and unmerged until explicitly approved.
- Babylon.js remains archived research.
- Defold remains Plan B, not an active port.
- Netlify is not part of this project.
- No synthetic FPS fallback.
- No broad rewrite disguised as cleanup.

## Problem statement

The active build currently depends on:

- historical patch scripts
- exact-string HTML replacement
- large generated inline scripts
- runtime fragments sharing lexical scope
- broad global state
- QA access through incidental `globalThis` hooks
- source, generated output, and test fixture responsibilities overlapping

These methods supported rapid iteration, but now create unnecessary friction for ordinary feature and art work.

## Approved target stack

- Three.js
- Vite
- TypeScript with `strict` checking
- ES modules
- Capacitor
- Playwright
- Blender to GLB/glTF
- optional KTX2 texture compression after measured need

Do not upgrade the Three.js version during the first architecture migration.

## Target source layout

```text
src/
  app/
    bootstrap.ts
    game-app.ts
    game-context.ts

  core/
    clocks.ts
    lifecycle.ts
    events.ts
    config.ts

  gameplay/
    storm/
    abilities/
    scoring/
    districts/
    campaign/
    destruction/

  presentation/
    renderer/
    camera/
    atmosphere/
    tornado/
    effects/

  world/
    entities/
    buildings/
    landmarks/
    heartland/

  platform/
    input/
    audio/
    persistence/
    android/

  ui/
    hud/
    menus/
    results/

  qa/
    bridge/
    scenarios/
    snapshots/

  legacy/
    legacy-runtime-adapter.ts

assets/
  models/
  textures/
  audio/
  data/

tests/
  unit/
  integration/
  visual/
  device/
```

The final structure may vary where implementation evidence supports a better division. The ownership boundaries are more important than matching this tree character for character.

## Runtime contracts

### Game lifecycle

Every major system should have explicit lifecycle ownership.

```ts
export interface GameSystem {
  initialize(context: GameContext): Promise<void> | void;
  startRun(): void;
  update(frame: GameFrame): void;
  reset(): void;
  dispose(): void;
}
```

### Shared context

```ts
export interface GameContext {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.Camera;
  clocks: GameClocks;
  events: GameEvents;
  assets: AssetRegistry;
  input: InputSystem;
  audio: AudioSystem;
  campaign: CampaignState;
}
```

The exact interface should evolve through implementation, but shared access must be deliberate and typed.

### Clock separation

Maintain three explicit time concepts:

- render time
- simulation time
- real run-clock time

The three-minute warning countdown must remain monotonic and independent of render slowdown.

## Data-driven content direction

Move these definitions out of hardcoded renderer logic where practical:

- campaigns and stops
- district contracts
- terrain and palette identity
- landmark definitions
- building placement
- destructible setpieces
- destruction-state thresholds
- challenges
- score targets and modifiers
- quality-tier density

Example:

```ts
export interface DestructibleSetpieceDefinition {
  id: string;
  position: [number, number, number];
  stages: Array<{
    id: string;
    threshold: number;
  }>;
}
```

Hart Farm should become the first proven reusable setpiece definition.

## Formal QA bridge

QA should use an intentional runtime interface rather than probing arbitrary globals.

```ts
export interface SevereWeatherQaBridge {
  prepareScenario(id: QaScenarioId): Promise<void>;
  advance(milliseconds: number): void;
  getSnapshot(): QaSnapshot;
  captureFrame(name: string): Promise<void>;
}
```

The bridge must support:

- deterministic scenario setup
- gameplay-state snapshots
- responsive viewport checks
- visual captures
- real frame samples
- reset and cleanup verification
- exact build metadata

## Migration strategy

Use a strangler pattern.

### Phase 0: preserve the reference

- keep PR #15 unchanged
- retain its exact artifact and QA evidence
- record owner gameplay findings
- use it as the behavioral and visual comparison baseline

### Phase 1: modern shell

Create:

- Vite build
- strict TypeScript configuration
- module entrypoint
- `GameApp`
- `GameContext`
- lifecycle contracts
- build metadata
- legacy runtime adapter
- canonical product title

Exit gate:

- game boots through the modern shell
- accepted controls and run behavior remain intact
- browser QA passes
- Android package builds

### Phase 2: clocks and run state

Extract:

- run activation
- pause state
- render clock
- simulation clock
- warning countdown
- reset/dispose lifecycle

Exit gate:

- real-time warning behavior matches the reference
- pause and resume remain correct
- deterministic reset passes repeatedly

### Phase 3: input and abilities

Extract:

- mobile joystick
- keyboard support
- Pull
- Gust
- Grid Zap
- input isolation

Exit gate:

- controls feel unchanged in browser and APK
- QA4 input isolation remains intact

### Phase 4: scoring, districts, and campaign

Extract:

- score accumulation
- combos
- district progression
- campaign progression
- persistence

Exit gate:

- score remains continuous
- district progression remains forward-only
- campaign save compatibility is preserved

### Phase 5: rendering and world

Extract:

- renderer ownership
- camera
- atmosphere
- tornado visuals
- world dressing
- buildings
- destruction setpieces

Exit gate:

- fixed before/after visual comparisons
- no performance regression beyond agreed budget
- Hart Farm and Cow 17 remain readable

### Phase 6: audio, UI, persistence, and QA

Finish separation of:

- audio buses and events
- HUD and menus
- results
- storage
- formal QA bridge

Exit gate:

- all accepted automated tests pass
- Android lifecycle tests pass
- no stale patch dependency remains for migrated systems

### Phase 7: retire patch archaeology

Only after parity is proven:

- stop rebuilding the game through the full historical patch chain
- archive patch scripts with provenance
- keep reproducible release tags and migration documentation

## GitHub Pages QA preview

The current workflow packages `web-preview` but does not deploy it.

Add a GitHub Pages QA-preview workflow that:

- deploys only from approved preview branches or explicit dispatch
- stamps exact source commit and workflow run
- exposes build metadata visibly in QA mode
- does not alter the production branch
- supports rollback by artifact/commit
- does not claim physical-device acceptance

Do not use Netlify.

## Build cadence

Work in substantial milestones:

1. implement a coherent phase
2. complete automated verification
3. provide one browser QA review point
4. perform one consolidated correction pass
5. assemble APK
6. complete physical-device acceptance

Do not create a separate owner test build for every small internal refactor.

## Three.js upgrade policy

The current runtime identifies as Three.js r128.

Do not combine:

- architecture modernization
- renderer-version upgrade
- major visual redesign

First establish the modern structure and golden tests on the current renderer behavior. Upgrade Three.js in a dedicated later milestone with official migration guidance and controlled visual comparisons.

## Completion definition

Modernization is complete when:

- the game boots from a real TypeScript module entrypoint
- historical patch scripts are no longer required for ordinary production builds
- major systems have explicit ownership and lifecycle
- campaign and destruction content are data-driven enough to extend safely
- QA uses a formal bridge
- browser preview and Android packaging remain reproducible
- accepted gameplay remains intact
- the owner approves the resulting browser and APK behavior
