# Active Handoff

Last updated: 2026-08-08 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-renderer migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
Current bounded milestone: staged multi-structure breakup + readable debris mass hierarchy

## Durable direction

PlayCanvas is the selected production-renderer direction. The accepted legacy runtime remains gameplay authority while PlayCanvas takes over visible presentation in bounded, reversible slices.

The current work is still a renderer/presentation migration. It is not permission to redesign accepted gameplay.

## Frozen gameplay reference

- Draft PR: #26
- Exact behavior-reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

PRs #24, #25, and #26 remain intentional unmerged behavior references. Do not casually merge, retarget, or rewrite them.

## Protected browser-stage behavior

### One-stick chase camera

Owner-approved browser-stage baseline remains frozen:

- one joystick controls storm movement
- storm leads, camera follows
- camera does not snap to instantaneous stick angle
- camera trailing scale: `0.9`
- visible/authority world scale target: `0.7717`
- exact camera baseline source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`
- Run 49 / `31214064434`

Owner hands-on result: the 10% slower chase catch-up was much better and as good as could then be judged in the current map.

### Storm tree response

Run 53 tree behavior is protected for this migration stage. Do not retune it during destruction-art work.

Exact protected measurements:

- Pull peak tree tilt: `0.4218329627222749 rad`
- Pull reacting trees: 4
- Gust peak tree tilt: `0.3673336055836977 rad`
- Gust reacting trees: 4
- Pull max inward light-prop displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward light-prop displacement: `5.042881747270892`

Owner hands-on description: tree bend is great.

### Camera/Cow 17 rotation stability

Exact corrected source:

- `f5f01678595bf857840759604f362c93f62598e8`
- Run 62 / `31222412094`
- static: **69/69 PASS**
- inherited storm physics: **61/61 PASS**
- rotation stability: **11/11 PASS**

Protected behavior:

- held steering cannot create a self-chasing camera orbit
- releasing steering leaves the camera settled
- Cow 17 safe flight is wall-clock bounded
- Cow 17 lands instead of orbiting forever
- Cow 17 cannot immediately relaunch while the storm remains nearby
- safe-animal law remains absolute

Owner hands-on result: both reported spin defects were corrected.

## Parent multi-structure proof

Exact source:

- `d2ca9fca3f36507d49e2157786e81928c4795897`
- draft PR #36
- PlayCanvas Run 72 / `31238071067`
- Pages Run 74 / `31238516301`

This proved real accepted-runtime destruction across multiple representative structures rather than PlayCanvas-owned fake HP.

Owner result on the publicly deployed parent checkpoint:

- buildings broke successfully
- destruction direction is what the game is going for

This owner result approved continuing the destruction-quality work. It was not Android physical acceptance.

## Current staged-destruction candidate

### PR #37

Title: `Add staged structure breakup and debris mass hierarchy`

- base: `agent/playcanvas-destruction-polish-handoff`
- head: `agent/playcanvas-destruction-mass-visual-pass`
- exact sealed source: `8d390f04223faaa268040afbeaa9eff885a81786`
- draft: yes
- merged: no

Scope:

- readable building anatomy instead of colored boxes only
- pitched roof silhouettes for house/barn
- windows, doors, awnings, loading doors, vents, loft trim, and dark interior wounds
- damage stages reveal interior/frame anatomy before final destruction
- detached structure pieces use explicit `trim`, `roof`, `wall`, and `frame` classes
- trim may travel/orbit visibly
- roofs resist but can lift
- walls remain heavy
- frame pieces remain very heavy and low
- structure debris remains isolated from the protected tree/light-prop `StormForceField`
- accepted legacy authority still owns HP, damage stages, destruction, scoring, combo, abilities, timer, and reset

## Run 76 sealed proof

PlayCanvas Production Slice Bootstrap:

- Run number: 76
- Run ID: `31259029449`
- exact source: `8d390f04223faaa268040afbeaa9eff885a81786`
- result: **PASS**
- artifact: `severe-weather-playcanvas-slice-76`
- artifact ID: `9022302146`
- artifact digest: `sha256:a93cbd962eacb59db434a774184bdd3b7a15dbc6b4cb6fe2230d10823f864289`
- downloaded artifact SHA-256 matched GitHub digest

Blocking evidence:

- main static contracts: **79/79 PASS**
- staged/multi-structure static contracts: **19/19 PASS**
- inherited storm-physics browser QA: **61/61 PASS**
- camera/Cow 17 rotation stability: **11/11 PASS**
- staged multi-structure browser QA: **22/22 PASS**
- console errors: 0
- page errors: 0

Protected tree and camera measurements remained unchanged/green.

Representative storefront debris evidence after real accepted destruction:

- trim body A: mass `1.1`, max horizontal travel about `28.87`, peak height about `23.61`
- trim body B: mass `1.5`, max horizontal travel about `24.44`, peak height about `15.93`
- roof: mass `4.8`, max horizontal travel about `1.95`, peak height about `14.03`
- wall: mass `7.3`, max horizontal travel about `1.28`, grounded
- frame: mass `11.5`, max horizontal travel about `0.43`, grounded

Interpretation: the class hierarchy is visible. Light trim is lively, roof lift is bounded/resistant, and wall/frame pieces remain materially heavier.

## Current live QA deployment

QA promotion:

- QA commit: `4822336f207239ae1444de57e85c6b0be8867bea`
- Deploy QA Pages Run 75 / `31259512722`: **PASS**
- existing QA root rebuild: passed
- deterministic QA4: passed
- exact Run 76 artifact re-verification: passed
- Pages deployment: passed
- public root verification: passed
- public PlayCanvas source/metadata verification: passed
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

Status vocabulary for this candidate:

- committed: yes
- built: yes
- browser-QA passed: yes
- publicly deployed: yes
- assistant exact-artifact review: passed for continued owner testing
- owner hands-on verdict on exact Run 76: pending
- PlayCanvas Android APK: not built
- physical Galaxy S26 Ultra Android acceptance: pending
- PR #37 merged: no

## Assistant playtest/review protocol

Owner request: periodically have the assistant play/review meaningful exact test candidates because the assistant may notice awkward physics, visuals, occlusion, camera behavior, or other feel issues that are difficult to describe precisely.

Operating rule:

1. automated QA remains blocking implementation truth
2. at meaningful visual/physics milestones, download the exact sealed artifact
3. inspect the exact browser trajectory, telemetry, and visual evidence; when the environment supports direct browser input, exercise the real visible controls as an additional diagnostic
4. record assistant subjective findings separately from automated pass/fail
5. do not weaken tests to make a subjective candidate green
6. owner hands-on remains the final browser-stage feel verdict
7. exact Android APK physical testing on the Galaxy S26 Ultra remains final mobile acceptance

The assistant review is diagnostic, not a substitute for owner hands-on or physical Android testing.

## Duplicate-lane cleanup

PR #38 (`Give structure destruction readable weight and staged anatomy`) was created during a retry from the older parent and later compared against the already-live PR #37 line.

- Run 77 exposed an overly ballistic experimental light sign and was rejected by assistant review despite green automation.
- Run 82 bounded that experimental sign, but the resulting breakup was less rich than the already-live Run 76 implementation.
- PR #38 was therefore closed without merge or promotion.
- Do not revive PR #38 unless a future historical comparison specifically needs it.

This is a positive drift-control result: newer commit time did not outrank the already-sealed better implementation.

## Next gate

Owner browser hands-on of exact Run 76 should judge:

- whether the staged breakup reads clearly while moving at normal play speed
- whether trim feels lively without looking weightless
- whether roof pieces feel resistant before they lift
- whether wall/frame pieces feel materially heavier
- whether building anatomy is sufficiently readable on the phone
- whether tree bend still feels great
- whether camera and Cow 17 remain stable

If the owner approves this bounded destruction-quality checkpoint, the next implementation should expand the proven destruction grammar across more of Prairie Junction without turning every scenery primitive into an uncontrolled physics body at once.

## Protected gameplay behavior

Preserve:

- direct storm controls
- one-stick camera-relative input
- current chase-camera distance/base turn rate/dead zone/0.9 trailing scale
- protected Run 53 tree response
- Pull, Gust, Zap semantics
- no duplicate mobile ability activation
- continuous scoring
- exact 3.5x combo cap
- +0.05 combo step
- 4.5 s combo decay
- three-minute warning clock
- pause/background time holding
- campaign progression/persistence
- destruction-state behavior
- safe/invincible/non-targetable animals
- deterministic reset and cleanup

## Process laws

- repository truth outranks chat memory
- one writer per branch
- do not weaken QA to obtain green
- exact-source identity is blocking evidence
- helper-only markers never prove executor integration
- accepted ability controls must trigger migrated presentation through the real executor path
- never describe browser QA as Android physical acceptance
- never call `assembleDebug` a signed release
- meaningful visual/physics candidate review should include assistant subjective artifact/playtest review before owner hands-on when practical
