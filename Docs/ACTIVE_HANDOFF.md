# Active Handoff

Last updated: 2026-08-07 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-slice migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
Current bounded milestone: rotation-stable PlayCanvas storm physics owner retest

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

## Frozen camera/map checkpoint

Owner-approved browser-stage baseline:

- exact tested source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`
- PlayCanvas workflow: Run 49 / `31214064434`
- static verification: **57/57 PASS**
- browser QA: **47/47 PASS**
- QA Pages deployment: Run 71 / `31214441569`
- terrain: `190 x 190`
- connected junctions: 9
- visible/authority scale: `0.771708` versus sealed `0.7717`
- camera trailing scale: `0.9`

Earlier owner hands-on verdict:

- expanded build ran well
- 10% slower chase catch-up was much better
- camera was as good as could then be judged

## Storm-physics hands-on result and protected behavior

The first live storm-physics candidate was exact source:

- `8d070e21cfe7720353ec842a02f1179bc33e9181`
- Run 53 / `31219969904`
- QA Pages Run 72 / `31220379275`

Owner feedback on that exact live candidate:

> Tree bend is great! the camera gets stuck spinning around somtimes, as does the cow.

Durable interpretation:

- **Tree bend is accepted for this browser-stage slice and is frozen.** Do not retune the Run 53 tree force response during camera/Cow fixes.
- camera continuous-orbit behavior was a rejected defect
- Cow 17 continuous airborne orbit was a rejected defect

Protected Run 53 tree numbers:

- Pull peak tree tilt: `0.4218329627222749 rad`
- Pull trees reacting: 4
- Gust peak tree tilt: `0.3673336055836977 rad`
- Gust trees reacting: 4
- Pull max inward light-prop displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward light-prop displacement: `5.042881747270892`

## Rotation defect diagnosis

### Camera

Held screen-space input was reprojected through the changing chase-camera basis every frame and treated as a fresh world-space target. This could create a self-chasing orbit.

A first correction stabilized the held target, but diagnostic Run 58 proved a second defect remained: releasing the stick allowed residual storm/render travel to retarget the camera, causing about `0.9237 rad` of post-release wandering.

### Cow 17

The accepted bovine slapstick code remains in orbit while the cow is within `storm.radius * 1.8`. Its authored orbit can stay inside that same threshold forever.

A first finite-orbit fix used capped simulation time. Diagnostic Run 58 proved that under the heavy authority frame Cow 17 could still remain airborne beyond `6.3 s` wall time and reach the `20`-unit altitude cap. Cow-Cam slow motion could stretch it further.

## Diagnostic Run 58

- exact source: `4e15c760815e19cedf067cee56ccd1c22a941db5`
- workflow: Run 58 / `31221725089`
- inherited storm-physics browser suite: **PASS**
- new rotation-stability suite: **FAIL**, correctly blocking promotion
- held desired camera target drift: `0`
- release heading drift: about `0.9237 rad`
- Cow 17 remained airborne past `6.3 s`
- Cow 17 altitude reached `20`

Important: the inherited suite staying green proves the accepted tree physics survived the first camera/Cow correction attempt.

## Current sealed corrected candidate

Implementation line:

- draft PR: #35
- base: `agent/playcanvas-storm-physics-handoff`
- head: `agent/playcanvas-storm-physics-parity`
- exact promoted source: `f5f01678595bf857840759604f362c93f62598e8`

Final correction shape:

- `[SW:PLAYCANVAS:HELD_INTENT_STABILITY]`
  - stationary held stick gets one stable desired camera heading
  - camera rotation alone cannot retarget that held direction
- `[SW:PLAYCANVAS:RELEASE_SETTLE]`
  - stick release freezes the last intentional chase target
  - residual authority/render motion cannot invent a late camera command
- `[SW:PLAYCANVAS:COW_ORBIT_STABILITY]`
  - Cow 17 orbit uses monotonic wall time
  - orbit window is bounded
  - total flight is wall-clock bounded with a smooth forced descent envelope
  - immediate relaunch remains locked while the storm stays nearby
  - re-arm requires separation beyond `2.2 * storm.radius`

No tree-force constants, storm speed, camera distance/base turn rate/dead zone/0.9 trailing scale, abilities, scoring, combo, timer, or map geometry were intentionally changed.

## Run 62 sealed proof

Repository-owned PlayCanvas workflow:

- Run 62 / `31222412094`: **PASS**
- exact source: `f5f01678595bf857840759604f362c93f62598e8`
- artifact: `severe-weather-playcanvas-slice-62`
- artifact ID: `9010957717`
- artifact digest: `sha256:4e59ba01045869b4a752d2dc8071aac361b4513a214e5d6d664296ddac0b37e0`
- downloaded ZIP SHA-256 matched GitHub exactly
- strict TypeScript: passed
- static verification: **69/69 PASS**
- inherited storm-physics browser QA: **61/61 PASS**
- dedicated rotation-stability QA: **11/11 PASS**
- evidence contract: passed
- console errors: none
- page errors: none

Camera evidence:

- held desired-heading drift: `0`
- bounded turn: `1.3962 rad`
- camera eventually settled and stopped turning
- headless low-frame-rate settle measurement: `4673 ms`
- release heading drift: `0`
- release desired-heading drift: `0`

Cow 17 evidence:

- real authority safe flight started
- orbit lock engaged
- Cow 17 landed in `3050 ms`
- landed altitude: `0.8`
- Cow 17 remained `safe: true`
- Cow 17 remained grounded while the storm stayed nearby
- re-arm remained locked until material storm separation

Protected tree evidence remained numerically identical to Run 53:

- Pull peak tree tilt: `0.4218329627222749 rad`
- Gust peak tree tilt: `0.3673336055836977 rad`
- Pull max inward displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward displacement: `5.042881747270892`

## Current live QA deployment

QA promotion:

- QA commit: `723d50a034a5643db60f38afba8997212d5a45c6`
- Deploy QA Pages Run 73 / `31222935770`: **PASS**
- existing QA root rebuild: passed
- deterministic QA4: passed
- exact Run 62 artifact download/re-verification: passed
- Pages deployment: passed
- public root verification: passed
- public PlayCanvas source/metadata verification: passed
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

## Next gate

Owner browser retest of the exact Run 62 candidate should focus narrowly on:

- tree bend still feels great
- camera no longer enters a runaway orbit during steering
- releasing the stick leaves the camera settled rather than continuing to swing
- Cow 17 completes the airborne comedy beat and lands instead of orbiting indefinitely
- Cow 17 does not immediately relaunch while the storm remains nearby

Do not retune tree response during this retest. If rotation stability is owner-approved, continue the bounded storm-physics expansion from this source behavior.

Do not call storm physics matched, better, or physically accepted until an exact PlayCanvas Android APK is installed and approved on the Galaxy S26 Ultra.

## Protected gameplay behavior

Preserve:

- direct storm controls and one-stick camera-relative input
- current chase-camera distance/base turn rate/dead zone/0.9 trailing scale
- accepted Run 53 tree bend response
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

For the camera/map checkpoint:

- committed: yes
- browser-QA passed: yes
- earlier live browser hands-on accepted for that stage: yes
- Android PlayCanvas APK built: no
- physically accepted PlayCanvas migration on Galaxy S26 Ultra: no

For the corrected storm-physics checkpoint:

- implementation: committed
- browser-QA: passed
- live public QA deployment: passed
- owner retest of camera/Cow correction: pending
- Android PlayCanvas APK: not built
- physical Android acceptance: pending
- PR #35 merged: no

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
