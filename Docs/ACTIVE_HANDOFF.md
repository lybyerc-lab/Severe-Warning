# Active Handoff

Last updated: 2026-08-08 13:06 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current production direction: Three.js revival + graphics pipeline
Production revival branch: `agent/threejs-production-revival`
Active build train: `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`

## Start here

The repository is the authoritative project memory. Do not restart renderer selection from chat history.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read `CURRENT_STATUS.md`.
3. Read this file.
4. Read `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`.
5. Read `Docs/DECISIONS.md`, especially D-011 and D-012.
6. Inspect draft PR #26 exact head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
7. Inspect draft PR #41 and exact sealed Stage 1 source `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
8. Inspect the current `/threejs/` public QA metadata before changing the next milestone.
9. Treat PlayCanvas PRs/artifacts as research unless the owner explicitly reopens that direction.

## Frozen production gameplay reference

Draft PR #26: **Restore Moo Brew presentation identity and readable cows**

Exact head:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

Evidence:

- Workflow Run 6: `31094966986`
- artifact: `severe-weather-presentation-identity-6`
- debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

This remains the gameplay/fun ancestry for resumed production work.

Protected during graphics work:

- direct forward storm steering;
- Pull/Gust/Grid Zap;
- natural storm-contact destruction;
- score/combo/timer/stage/campaign truth;
- Cow 17 and safe-animal behavior;
- pause/background/reset/cleanup;
- Android landscape controls.

## Why PlayCanvas stopped being production

Owner hands-on comparison on 2026-08-08 found that the promoted PlayCanvas candidate:

- felt like backing/steering a truck and trailer when trying to play forward;
- remained too roof-heavy and large-chunk in destruction;
- depended too much on actions for satisfying breakup;
- had a cheap-looking opening and broad prototype visual quality;
- was less fun than the preserved Three.js game;
- had weaker natural destruction than the preserved Three.js game.

D-012 therefore restored Three.js as production. PR #39 is closed unmerged and preserved as research.

## Current production milestone

### Stage 1: authored asset-pipeline foundation

Draft PR: #41 `Add guarded Three.js asset pipeline foundation`

Branch:

`agent/threejs-asset-pipeline-foundation`

Exact sealed source:

`f2060dff08ddb9df9f90ecd245940d8db86c7266`

Parent production revival checkpoint:

`87ef50e6eae155636f042f3639070acb55f049aa`

Frozen gameplay reference:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

## Stage 1 implementation boundary

The Stage 1 asset pipeline proves an authored presentation seam around the accepted Three.js gameplay.

Allowed authoritative presentation assignment:

`target.meshData = authored`

Forbidden in this milestone:

- health/max-health writes;
- damage-stage/destroyed writes;
- target coordinate/kind/material-family writes;
- score/combo/timer/campaign writes;
- movement/input changes;
- Pull/Gust/Grid Zap changes;
- safe-animal changes;
- Three.js version upgrade.

The static verifier fails on protected gameplay mutations.

The accepted procedural presentation remains the fallback when an authored asset is missing, invalid, stale after county rebuild, or arrives after a structure has already been damaged.

## Stage 1 proof asset

`structure.storefront.v1`

Purpose: prove the external asset/registry/cache/validation/fallback/package seam, not final art quality.

- archetype: shop
- 12 authored presentation parts
- wall/base, interior, roof, trim, glass, door, awning, sign, and rooftop anatomy
- local/offline packaged asset
- accepted gameplay truth stayed 165/165 HP, 110 points, damage stage 0, destroyed false during swap

The current JSON structure adapter is a proof adapter. Preferred wider authored-asset direction remains GLB/glTF after this seam receives owner browser approval.

## Stage 1 exact evidence

Workflow: **Three.js Asset Pipeline Foundation Run 5**

- run ID: `31270418326`
- exact source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`
- conclusion: PASS
- artifact: `severe-weather-threejs-asset-pipeline-5`
- artifact ID: `9025583871`
- artifact digest: `sha256:90360c1811f0976d6f8d798c75997fb07b5eb6f6e51a8b1d885fa6ab3de0f3e5`
- debug APK SHA-256: `496439b2adc434c29cb0fd7db5ce6f03047efa20d964ba19cf397ef42be95b10`

Run 5 passed:

- exact-head checkout/identity;
- frozen PR #26 rebuild;
- Stage 1 static mutation guard;
- candidate build and packaging;
- complete inherited Three.js browser QA;
- authored-storefront success path;
- invalid-asset fallback path;
- same-runner frozen-reference performance comparison;
- offline asset packaging;
- Capacitor asset synchronization;
- debug APK assembly;
- exact-source artifact seal.

Focused visual evidence:

- actual runtime camera freeze: true
- tornado hidden for evidence only: true
- storefront frame width coverage: ~54%
- storefront frame height coverage: ~67%
- storefront centered
- 12 authored damage parts visible to the runtime

Assistant verdict: Stage 1 pipeline seam is approved for owner browser testing. The art itself remains prototype/blocky and is not production-art approval.

## Public QA

Owner test link:

`https://lybyerc-lab.github.io/Severe-Warning/threejs/`

Promotion:

- QA commit: `7acebcea56ffa6960197f05e851ec6ef618fc4d1`
- workflow: Deploy Three.js QA Overlay Run 1
- run ID: `31271092725`
- build: PASS
- deploy: PASS
- live verification: PASS

The deployment intentionally preserves:

- existing QA root;
- `/playcanvas/` research candidate;
- exact Stage 1 Three.js candidate under `/threejs/`.

## Owner test gate now blocking Stage 2

Do not begin Stage 2 or widen the authored-art conversion until the owner tests the exact `/threejs/` candidate.

Ask explicitly:

- Does forward steering feel like the fun Three.js version, with no truck/trailer backing behavior?
- Does ordinary tornado contact destruction still feel good without using Pull/Gust/Zap?
- Does the candidate feel at least as fun as the frozen PR #26 reference?
- Does the authored storefront cause any collision, camera, destruction, or readability weirdness?
- Does the game remain stable after reset/restart?

Graphics are still expected to look prototype-like at Stage 1. Do not ask the owner to approve final graphics from this candidate.

## Stage 2 direction after owner approval

Improve destruction presentation around the accepted Three.js executor:

- ordinary contact must visibly damage/destroy without abilities;
- smaller and more varied debris within mobile budget;
- wall/interior/frame/trim/window/door/roof anatomy;
- staged damage before final breakup;
- Pull/Gust/Zap amplify spectacle rather than unlock it;
- at least two structure types prove reusable anatomy;
- deterministic reset and bounded debris remain mandatory.

Port useful PlayCanvas presentation lessons, not its gameplay executor.

## Later graphics direction

After the pipeline/destruction seam is trustworthy:

- bounded GLB/glTF loader/metadata adapter without simultaneous Three.js upgrade;
- PBR material discipline;
- lighting/shadow/atmosphere improvements;
- terrain/roads/vegetation/landmarks;
- mobile geometry/texture/material/draw-call budgets;
- in-engine opening using the same world/assets/materials/lighting as gameplay.

Canonical opening remains:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> gameplay.

## Acceptance law

A green CI run is not owner approval. A browser deployment is not Android physical acceptance.

Current Stage 1 state:

- browser QA: passed
- assistant pipeline evidence review: passed
- public QA: deployed
- owner browser verdict: pending
- debug APK: built
- Galaxy S26 Ultra physical acceptance: no
- PR #41: draft/unmerged

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md`, `CURRENT_STATUS.md`, `Docs/ACTIVE_HANDOFF.md`, `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`, and `Docs/DECISIONS.md`. Three.js is production under D-012. Frozen gameplay/fun reference is PR #26 exact head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`. Stage 1 asset-pipeline candidate is PR #41 exact source `f2060dff08ddb9df9f90ecd245940d8db86c7266`, Run 5 `31270418326`, publicly deployed at `/threejs/`. Owner browser verdict is pending and blocks Stage 2. Preserve gameplay feel and natural destruction; PlayCanvas is research only.
