# Antigravity Handoff: Phase 5 Rendering, Camera, World, and Destruction

**Project:** Severe Weather Warning  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Handoff branch:** `agent/phase4-knowledge-antigravity-handoff`  
**Required work branch:** `agent/phase5-rendering-world-antigravity`  
**PR target:** `agent/phase4-knowledge-antigravity-handoff`  
**Mode:** Controlled strangler migration, not a rewrite or visual redesign

## 1. Mission

Implement Modernization Phase 5 by creating explicit, typed, testable ownership boundaries for:

- renderer and canvas state
- scene lifecycle
- camera state and shake
- atmosphere and lighting
- tornado presentation
- world population and dressing
- buildings and landmarks
- destruction setpieces
- resource reset and disposal
- presentation-only quality tiers

Preserve the accepted game exactly.

The goal is not to make the game prettier, newer, more realistic, or more elaborate. The goal is to make the existing Three.js presentation deliberate, observable, reusable, and safe to extend later.

## 2. Read before changing code

Read in this exact order:

1. `CURRENT_STATUS.md`
2. `Docs/RECOVERED_KNOWLEDGE_BASE.md`
3. this file
4. `Docs/MODERNIZATION_PLAN.md`
5. `Docs/MODERNIZATION_DEVICE_ACCEPTANCE_2026-08-04.md`
6. `Docs/DECISION_2026-08-04_RECOVERED_KNOWLEDGE_AND_AGENT_PROTOCOL.md`
7. `Docs/ANTIGRAVITY_PHASE4_HANDOFF.md`
8. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
9. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
10. `Docs/NO_DRIFT_POLICY.md`
11. current code, workflows, QA scripts, accepted artifacts, and PR history

Repository code and exact build evidence outrank prose when they conflict.

## 3. Branch protocol

Do not write to the handoff branch or any earlier branch.

Start with:

```bash
git fetch origin
git switch -c agent/phase5-rendering-world-antigravity \
  origin/agent/phase4-knowledge-antigravity-handoff
git rev-parse HEAD
```

Record the exact starting SHA in:

- the first Phase 5 status note
- `Docs/PHASE5_PRESENTATION_SOURCE_MAP.md`
- the eventual draft PR body

Rules:

- one writer per branch
- no force pushes unless correcting Antigravity's own unpublished local history
- no merge, rebase, retarget, close, or squash of the protected PR stack
- no changes to `main`
- no changes to PR #14 or Babylon.js laboratory files
- no Netlify work
- draft PR only
- do not report a GitHub comparison URL as a pull request
- do not report a final SHA until the branch is pushed and that exact remote SHA resolves through GitHub

## 4. Current accepted baseline

### Production and platform

- Three.js r128
- Vite 8.1.5
- TypeScript 7.0.2 with strict checking
- Playwright 1.55.0
- Capacitor 8.5.0
- pnpm 11.9.0
- Node.js 22 in CI
- JDK 21 in CI
- Android landscape
- offline local assets

### Accepted modernization heads

- Phase 1: `710ee8537e3d4ca6424b8bf32b282abae0dbfc28`
- Phase 2: `381014d3d7f4ca6424b8bf32b282abae0dbfc28`
- Phase 3: `b9d55188f91ade720a50837f15591c91209098ad`
- Phase 4: `38125918bffdd712ae10731d4472adbf2051d838`

### Phase 4 sealed package

- workflow run `30921480977`
- artifact `8897403311`
- artifact digest `sha256:91b94190e089a64028eb1497eecfdb4cd25a976282a0c0d529a42624ac8dbb05`
- APK SHA-256 `9e1f94e269cf4eeb5d6f58300752af61efb7e778a97c1d692fdd899e2ecda295`
- owner verdict `Everything was good.`

### Accepted presentation truths

Existing QA and physical evidence require preservation of:

- Three.js r128 renderer identity
- elevated tactical camera feel
- mobile and desktop framing
- visible fog, atmosphere, lighting, tornado, dust, and debris
- at least three funnel layers in the production hero scenario
- exactly three suction rings in the production hero scenario
- at least ten debris instances in the production hero scenario
- authored Hart Farm roof separation
- readable and decorated Cow 17
- at least twelve crop rows
- at least eighteen trees
- visible fences
- buildings, landmarks, media crews, animals, and regional dressing
- real measured frame samples rather than synthetic FPS
- results and HUD safe-area containment

### Accepted behavior to preserve

- direct joystick and keyboard movement
- Pull, Gust, and Grid Zap
- no duplicate Android ability activation
- three-minute real-time warning clock
- pause and background time hold
- exact score and combo behavior
- time-driven forward-only districts
- Heartland stars, unlocks, retry, next-stop, and persistence
- QA4 input isolation
- deterministic reset and cleanup
- media moments, footage bonus, Cow 17 report, and results presentation

## 5. Phase 4 audit lessons are mandatory

The first Antigravity Phase 4 submission contained useful structure but also dangerous false greens. Phase 5 must not repeat them.

Mandatory corrections carried forward as rules:

1. **Never commit generated V5.1 output over the historical source.**
2. `MechanicsLab/SevereWeather_Warning.html` must remain byte-for-byte identical to the handoff baseline in the branch diff.
3. Add a workflow provenance guard before TypeScript, patching, or browser QA.
4. Build the accepted game by replaying the complete patch chain.
5. Map exact legacy behavior before creating contracts.
6. Start with typed mirrors and wrappers, not competing presentation authorities.
7. Verify camera, renderer, scene, world, destruction, and cleanup behavior, not marker strings.
8. Do not invent visual constants, quality laws, destruction stages, or asset definitions.
9. Add a dedicated Phase 5 GitHub Actions and Android packaging workflow.
10. Treat local checks as preliminary until the exact pushed head passes GitHub Actions.

Before every push, this command or an equivalent must succeed:

```bash
git diff --exit-code \
  origin/agent/phase4-knowledge-antigravity-handoff -- \
  MechanicsLab/SevereWeather_Warning.html
```

Any committed diff to that file is an automatic rejection unless the technical lead explicitly authorizes a source-baseline change.

## 6. Protected product and presentation laws

Do not alter:

- product name
- campaign identity
- storm feel
- ability feel
- camera feel
- camera field of view
- camera target behavior
- camera shake behavior
- renderer settings
- tone mapping
- exposure
- shadows
- fog identity
- atmosphere timing
- tornado silhouette
- funnel-layer count or behavior
- suction-ring count or behavior
- debris behavior
- Hart Farm visual composition or stage timing
- Cow 17 appearance, scale, safety, or behavior
- world density
- building placement
- landmark placement
- media or animal safety
- quality-tier gameplay behavior
- Three.js version
- score, combo, district, campaign, or save behavior
- audio balance
- HUD or result layout

A cleanup that changes the visible game is a regression.

## 7. Scope

### In scope

- exact presentation and world source map
- typed contracts and read-only snapshots
- one Phase 5 legacy compatibility bridge
- renderer, scene, camera, atmosphere, tornado, world, and destruction mirrors
- explicit reset and disposal observation
- resource and listener accounting
- fixed visual baseline generation and comparison
- deterministic Hart Farm state preparation
- reusable destruction-setpiece data contract
- Hart Farm represented through that contract without visual change
- proof of the same lifecycle contract on one second existing structure
- presentation-only quality-tier contracts
- Phase 5 structural and browser QA
- dedicated Phase 5 workflow
- Android synchronization and debug APK assembly
- Phase 5 documentation and evidence packaging

### Out of scope

- Three.js upgrade
- renderer replacement
- engine migration
- new GLB models
- Blender production work
- new textures or materials
- KTX2 adoption
- visual polish or redesign
- new lighting
- new weather effects
- new ability presentation
- new tornado forms
- new destruction stages or thresholds
- new buildings or landmarks
- new campaign stops or regions
- Moo Brew cinematic
- newspaper recap
- new Cow 17 behavior
- chickens or expanded farmyard behavior
- terrain resistance
- storm progression or mastery
- audio redesign
- major UI redesign
- player release packaging
- PR-stack integration or merge decisions

## 8. Required source map

Before implementation, create:

`Docs/PHASE5_PRESENTATION_SOURCE_MAP.md`

It must identify the exact accepted paths for:

### Renderer and canvas

- canvas lookup and ownership
- renderer construction
- renderer options
- size and pixel-ratio updates
- tone mapping and exposure
- shadow configuration
- resize listeners
- render call ownership
- renderer disposal

### Scene and atmosphere

- scene creation
- background
- fog
- lights
- weather and atmosphere groups
- dust, rain, lightning, or cloud presentation where present
- group ownership and reset paths

### Camera

- camera construction
- field of view
- near and far planes
- initial position
- mobile framing adjustments
- look target
- follow or containment behavior
- shake state and decay
- resize behavior

### Tornado presentation

- root group
- funnel layers
- suction rings
- dust and debris layers
- ability visual dependencies
- update functions
- reset and rebuild functions

### World

- world root
- district dressing
- terrain
- roads
- crop rows
- trees
- fences
- buildings
- landmarks
- utility objects
- media crews
- animals
- Cow 17
- object registries and lookup structures

### Destruction

- damage event entry points
- state and threshold storage
- Hart Farm construction
- Hart Farm state transitions
- roof separation
- detached pieces
- debris spawning
- audio and score event timing
- reset and rebuild
- second existing structure candidate

### Resource lifecycle

- geometry creation and reuse
- material creation and reuse
- texture ownership
- render targets if any
- event listeners
- animation-loop ownership
- object removal
- geometry disposal
- material disposal
- texture disposal
- renderer disposal

For each item, record:

- exact legacy symbol or function
- source location or stable anchor
- writer and readers
- reset path
- disposal path
- QA access path
- whether the new typed layer will observe, wrap, or eventually replace it

Do not begin structural replacement before this map is committed.

## 9. Suggested architecture

Exact paths may change when evidence supports a better boundary. Keep ownership explicit.

```text
src/presentation/
  renderer/
    renderer-contracts.ts
    renderer-system.ts
  scene/
    scene-contracts.ts
    scene-system.ts
  camera/
    camera-contracts.ts
    camera-system.ts
  atmosphere/
    atmosphere-contracts.ts
    atmosphere-system.ts
  tornado/
    tornado-presentation-contracts.ts
    tornado-presentation-system.ts

src/world/
  world-contracts.ts
  world-system.ts
  setpieces/
    destructible-setpiece-contracts.ts
    destructible-setpiece-system.ts
    hart-farm-definition.ts
    second-structure-definition.ts

src/legacy/
  legacy-runtime-adapter.ts

runtime/
  modernization-phase5-presentation-world.js

scripts/
  apply-modernization-phase5-presentation-world.mjs
  verify-modernization-phase5-presentation-world.mjs
  qa-modernization-phase5-presentation-world.mjs
  compare-phase5-visual-baseline.mjs
```

### Renderer mirror responsibilities

- expose immutable renderer configuration
- expose size and pixel ratio
- expose render and reset counters
- expose resource information available from Three.js
- observe accepted resize and render behavior
- never create a second WebGL renderer

### Scene mirror responsibilities

- expose scene identity and root-group counts
- expose background, fog, and light state
- track reset and disposal evidence
- never create a competing production scene

### Camera mirror responsibilities

- expose immutable projection and transform snapshots
- expose look target and shake state where available
- preserve mobile and desktop framing
- never write new camera values merely to satisfy a test

### Atmosphere mirror responsibilities

- expose accepted fog, lighting, weather, and effect-layer state
- preserve update timing and visibility
- avoid duplicate effects or competing animation loops

### World mirror responsibilities

- expose counts and identities for accepted world categories
- observe spawn, reset, and disposal behavior
- preserve object placement and density
- avoid a second world registry that can drift from the live scene

### Setpiece responsibilities

- represent current authored states and transitions
- preserve visual composition, event timing, score timing, and audio timing
- support deterministic reset and disposal
- provide a reusable data contract without inventing new art

## 10. Compatibility strategy

Use the established strangler pattern.

- one Phase 5 lexical bridge
- typed systems attach only after the accepted runtime exists
- fallback behavior matches the accepted runtime before attachment
- do not create a second renderer, scene, camera, world, tornado, or destruction executor
- legacy objects may remain the real authorities during this phase
- typed mirrors must synchronize atomically after accepted mutation paths
- no arbitrary new `globalThis` surface
- expose only deliberate adapter and QA contracts
- preserve the existing animation loop
- preserve the existing render call until a later separately reviewed replacement milestone

A safe Phase 5 result may contain more observation than replacement. That is acceptable. A clean class hierarchy with visual drift is not.

## 11. Visual baseline protocol

Create:

`Docs/PHASE5_VISUAL_BASELINE.md`

The Phase 5 workflow must compare the accepted Phase 4 base and the Phase 5 head on the same runner.

### Required viewports

- desktop `1365x768`
- mobile landscape `915x412`
- a wide landscape regression viewport matching or exceeding the geometry that previously exposed top-title crowding

### Required scenarios

- initial game presentation
- deterministic production hero scenario
- active tornado and debris presentation
- Hart Farm intact
- Hart Farm damaged
- Hart Farm roof peel
- Hart Farm exposed or partial collapse
- Hart Farm wreckage where deterministically reachable
- Cow 17 visible
- results screen

### Comparison law

Do not invent a generous visual-diff threshold.

Use this process:

1. build and capture the accepted Phase 4 base twice
2. measure base-to-base repeat-run noise
3. document the noise and its causes
4. set the candidate threshold no looser than the measured noise plus a small documented margin
5. compare Phase 5 head against the accepted base
6. retain raw images, diff images, metrics, and semantic snapshots

If deterministic capture cannot be achieved for a scenario, stop and report the nondeterminism instead of weakening the threshold until the test passes.

Semantic checks remain mandatory even when pixel comparison passes.

## 12. Hart Farm reusable setpiece contract

The accepted five-state language is:

1. intact
2. damaged
3. roof peel
4. exposed or partial collapse
5. wreckage

Do not invent thresholds or visuals. Map the existing runtime.

The reusable definition must be able to describe:

- stable ID
- existing scene objects
- accepted stage values
- accepted transition conditions
- visible objects by stage
- detached objects by stage
- debris behavior
- score events
- audio events
- reset behavior
- object removal
- resource disposal
- QA preparation and snapshot

Hart Farm must remain visually equivalent.

### Second-structure proof

Choose one existing structure only after completing the source map.

Requirements:

- use the same lifecycle and data contract
- preserve the structure's existing authored states
- do not create new art
- do not invent missing destruction stages
- do not alter scoring or thresholds

If no existing structure can safely prove reuse, stop and report that evidence. Do not fabricate a second five-stage setpiece merely to satisfy the checklist.

## 13. Resource and cleanup evidence

Phase 5 must make resource behavior observable.

Capture where available:

- scene child counts
- world-category counts
- geometries
- materials
- textures
- render targets
- active listeners
- active timers
- animation-loop count
- detached debris count
- setpiece object count

Run repeated deterministic cycles:

1. prepare scenario
2. advance to stable presentation
3. record counts
4. reset or rebuild
5. record counts
6. repeat at least five times

Required result:

- no duplicate renderer
- no duplicate animation loop
- no unbounded listener growth
- no unbounded geometry, material, texture, or world-object growth
- no stale detached debris after reset
- no duplicated Hart Farm or Cow 17

Do not claim complete GPU leak proof from JavaScript counts alone. Report exactly what the evidence covers.

## 14. Quality-tier law

Quality tiers may alter presentation density only.

They must not alter:

- score
- combo
- objectives
- collision
- ability range
- ability cooldown
- storm speed
- damage thresholds
- district timing
- campaign behavior
- save behavior

Map current quality behavior before creating a data definition.

Do not add a new quality tier or rebalance existing tiers in Phase 5.

## 15. Required automated tests

### Structural and contract tests

- historical source remains unchanged
- one renderer
- one production scene
- one production camera
- one animation loop
- renderer settings match accepted values
- camera projection and transform match accepted values per viewport
- scene background, fog, and lights match accepted values
- tornado layer and suction-ring counts match accepted values
- world population minimums match accepted production-slice truths
- Hart Farm states and reset match accepted behavior
- second structure uses the same lifecycle contract without visual or scoring changes
- resource counts remain bounded across repeated cycles
- typed mirrors agree with live legacy objects

### Inherited browser QA

Run all existing suites on desktop and mobile landscape:

- `qa:v510`
- `qa:phase2`
- `qa:phase3`
- `qa:phase4`

### Phase 5 browser QA

Prove:

- shell and lifecycle identity
- exact Phase 5 bridge attachment
- renderer, scene, camera, atmosphere, tornado, world, and destruction snapshots
- fixed visual baseline comparison
- production-slice semantic checks
- Hart Farm deterministic states
- Cow 17 visibility and identity
- repeated-reset cleanup
- no page errors
- no console errors
- no player-visible QA or forensic panel in normal mode

### Performance evidence

- use real frame samples
- compare base and head on the same runner
- document repeat-run noise
- do not invent an absolute FPS claim from one cloud runner
- fail material regressions using a documented tolerance derived from the accepted baseline

### Android gate

- Capacitor asset parity
- debug APK assembly
- exact source commit in package manifest
- artifact digest
- APK SHA-256

## 16. Existing script chain

Install:

```bash
pnpm install --frozen-lockfile
```

Current inherited script names from `package.json`:

```text
modern:typecheck
modern:build
audio:generate
patch:v431
patch:v440
patch:v441
patch:v442
patch:v450
patch:v500
patch:v510
patch:phase2
patch:phase3
patch:phase4
verify:v500
verify:v510
verify:phase2
verify:phase3
verify:phase4
qa:v510
qa:phase2
qa:phase3
qa:phase4
cap:sync
```

Add coherent Phase 5 scripts:

```text
patch:phase5
verify:phase5
qa:phase5
```

Do not hide multiple unrelated jobs behind vague script names.

## 17. Required Phase 5 workflow

Create a dedicated Phase 5 workflow.

The authoritative order should remain equivalent to:

1. frozen dependency install
2. clean historical source provenance guard
3. script syntax checks
4. strict TypeScript
5. verified audio generation
6. accepted historical gameplay chain
7. V5 verification
8. V5.1 production-slice patch and verification
9. Phase 2 patch and verification
10. Phase 3 patch and verification
11. Phase 4 patch and verification
12. Phase 5 patch and verification
13. Vite build and offline packaging
14. inherited visual QA
15. inherited clock QA
16. inherited input and ability QA
17. inherited score, district, campaign, and persistence QA
18. Phase 5 scene, renderer, camera, world, destruction, cleanup, and visual QA
19. Capacitor synchronization
20. debug APK assembly
21. evidence packaging and upload

The workflow must use:

- frozen dependencies
- read-only permissions unless a documented step truly requires a write
- exact source commit stamping
- diagnostics upload on browser failure
- final artifact upload only after every gate passes

## 18. Implementation rhythm

Work in substantial checkpoints and commit each checkpoint separately.

### Checkpoint A: source map and baseline

- complete `Docs/PHASE5_PRESENTATION_SOURCE_MAP.md`
- complete `Docs/PHASE5_VISUAL_BASELINE.md`
- capture accepted constants and ownership
- prove historical source remains clean

### Checkpoint B: typed presentation mirrors

- renderer
- scene
- camera
- atmosphere
- tornado
- contract probes and snapshots

### Checkpoint C: typed world and lifecycle mirrors

- world categories
- buildings and landmarks
- animals and media
- resource and listener accounting
- reset and disposal evidence

### Checkpoint D: reusable setpiece contract

- Hart Farm definition
- deterministic state snapshots
- second existing structure proof
- no new art or gameplay behavior

### Checkpoint E: full gate and packaging

- inherited and Phase 5 QA
- dual-build visual comparison
- Android synchronization
- one review APK
- evidence package

Do not create a separate owner APK for every checkpoint.

## 19. Stop conditions

Proceed without repeatedly asking routine implementation questions.

Stop and request owner or technical-lead direction when evidence shows that proceeding would require:

- changing camera feel or framing
- changing renderer settings
- changing fog, lighting, atmosphere, tornado, debris, or world presentation
- changing Hart Farm states, thresholds, score events, or audio events
- inventing a second setpiece or missing destruction stages
- changing Cow 17 appearance or behavior
- adding or replacing art assets
- changing quality-tier behavior
- changing Three.js version
- changing gameplay, score, district, campaign, or save behavior
- committing generated HTML over the source baseline
- creating a second renderer, scene, camera, or animation loop
- weakening visual QA because the candidate differs from the base
- merging or rewriting protected branches

A failing test is not automatically a stop condition. Diagnose implementation, nondeterminism, and harness assumptions first.

## 20. Required draft PR

Open an actual draft PR:

- Head: `agent/phase5-rendering-world-antigravity`
- Base: `agent/phase4-knowledge-antigravity-handoff`
- Suggested title: `Extract Phase 5 rendering world and destruction contracts`

The PR body must include:

- exact starting remote SHA
- exact final remote SHA
- source-map summary
- visual-baseline method and measured repeat-run noise
- systems mirrored or wrapped
- legacy executors retained
- renderer, scene, camera, atmosphere, tornado, and world contracts
- Hart Farm contract
- second-structure result
- resource cleanup evidence
- workflow run and artifact IDs
- APK hash
- known limitations
- exact physical-device tests still required

Keep the PR draft and unmerged.

## 21. Definition of done

Phase 5 is ready for owner review only when:

- the historical source file has no branch diff
- strict TypeScript passes
- all inherited verification passes
- Phase 5 structural verification passes
- desktop, mobile, and wide-landscape visual QA pass
- repeat-run visual noise is measured and documented
- renderer, scene, camera, atmosphere, tornado, and world mirrors agree with the live runtime
- Hart Farm remains visually and behaviorally equivalent
- the same setpiece lifecycle contract is proven on a second existing structure or a documented stop condition explains why it cannot be done safely
- repeated reset and cleanup counts remain bounded
- real frame samples show no material same-runner regression
- Capacitor assets match the web package
- Android APK assembles
- exact evidence is packaged
- the draft PR is open
- no protected branch is modified

Physical acceptance remains the owner's decision after installing and playing the exact Phase 5 APK.

## 22. Physical device test requirements

The final report must ask the owner to verify:

- camera framing and movement feel
- tornado silhouette and atmosphere
- dust, debris, lighting, and world dressing
- Hart Farm destruction readability through the run
- Cow 17 visibility and safety
- no missing or duplicated buildings, landmarks, media, or animals
- Retry County clears stale debris and duplicate world objects
- Next Stop rebuilds the correct world cleanly
- controls, abilities, clock, score, districts, campaign, save, pause, and background behavior remain correct
- heat and performance observations during a complete run and at least one retry

## 23. Final reporting format

At completion, report:

```text
Branch:
Starting remote SHA:
Final remote SHA:
Draft PR number and URL:
Workflow run:
Artifact ID:
Artifact digest:
APK SHA-256:
Typecheck:
Inherited QA:
Phase 5 QA:
Visual baseline and repeat-run noise:
Hart Farm contract:
Second-structure result:
Cleanup and resource evidence:
Known limitations:
Physical tests required:
```

Do not report `complete` merely because code compiles or local screenshots look similar. Report exactly what the evidence proves.
