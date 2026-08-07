# Active Handoff

Last updated: 2026-08-07 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-slice migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
Current bounded milestone: PlayCanvas storm physics parity

## Durable decision

PlayCanvas is the selected production-renderer direction. The accepted legacy runtime remains gameplay authority while PlayCanvas takes over visible presentation in bounded, reversible slices.

## Frozen gameplay reference

- Draft PR: #26
- Exact reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

PRs #24, #25, and #26 remain intentional unmerged behavior references. Do not casually merge, retarget, or rewrite them.

## Accepted storm-response oracles

Gust:

- exact physically accepted head: `4c91694b406dfca119f457135276bc145837c169`
- PR #6
- preserve visible tree bend-away/recovery and bounded light-prop shove

Pull:

- exact physically accepted head: `82c455fff9ddb0e6a37f60b583a87b58f73173a4`
- PR #8
- preserve readable inward suction, tree anticipation/lean/recovery, light-prop inward/orbital response, and clean reset/arbitration

## Current PlayCanvas browser checkpoint

Latest owner-tested live candidate:

- implementation line: draft PR #34
- exact tested source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`
- PlayCanvas workflow: Run 49 / `31214064434`
- static verification: **57/57 PASS**
- browser QA: **47/47 PASS**
- QA Pages deployment: Run 71 / `31214441569`
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`
- terrain: `190 x 190`
- connected junctions: 9
- visible/authority scale: `0.771708` versus sealed `0.7717`
- camera trailing scale: `0.9`

Owner hands-on verdict:

- expanded build ran well
- camera was initially pivoting too far forward during turns
- 10% slower chase catch-up was much better
- current camera is as good as can presently be judged

Treat this camera/map combination as the frozen browser-stage baseline while restoring storm physics.

## Active physics lane

- handoff branch: `agent/playcanvas-storm-physics-handoff`
- assignment: `Docs/PLAYCANVAS_STORM_PHYSICS_PARITY_HANDOFF.md`
- parent source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`
- goal: restore representative tree, light-prop, roof, and debris response using a game-owned force law while the accepted runtime remains gameplay authority

## Protected gameplay behavior

Preserve:

- direct storm controls and one-stick camera-relative input
- current chase-camera values
- Pull, Gust, Zap semantics
- no duplicate mobile ability activation
- continuous scoring
- exact 3.5x combo cap
- +0.05 combo step
- 4.5 s combo decay
- three-minute warning clock
- pause/background holding
- destruction-state behavior
- safe/invincible/non-targetable animals
- deterministic reset and cleanup

## Acceptance vocabulary

For the browser-approved camera/map checkpoint:

- committed: yes
- browser-QA passed: yes
- live browser hands-on accepted for this stage: yes
- Android PlayCanvas APK built: no
- physically accepted PlayCanvas migration on Galaxy S26 Ultra: no
- PR #34 merged: no

For the storm-physics lane:

- implementation: starting
- browser-QA: pending
- live owner test: pending
- Android physical acceptance: pending

Never convert browser success into physical Android acceptance language.

## Process laws

- repository truth outranks chat memory
- one writer per branch
- do not weaken QA to obtain green
- exact-source identity is blocking evidence
- helper-only markers never prove executor integration
- accepted ability controls must trigger migrated presentation through the real executor path
- do not call `assembleDebug` a signed release
- physical Galaxy S26 Ultra testing remains final authority
- historical renderer/source evidence remains protected until PlayCanvas is physically accepted
