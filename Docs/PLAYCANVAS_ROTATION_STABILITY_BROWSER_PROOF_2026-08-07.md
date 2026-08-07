# PlayCanvas Rotation Stability Browser Proof — 2026-08-07

Status: automated browser QA passed and exact artifact publicly deployed for owner retest. Not Android physically accepted.

## Owner-reported defect

Original live storm-physics candidate:

- exact source `8d070e21cfe7720353ec842a02f1179bc33e9181`
- PlayCanvas Run 53 / `31219969904`
- Pages Run 72 / `31220379275`

Owner feedback:

> Tree bend is great! the camera gets stuck spinning around somtimes, as does the cow.

Protected result:

- Run 53 tree bend is accepted for this browser-stage slice.
- Tree force constants were not intentionally retuned during the rotation correction.

## Diagnostic Run 58

- exact source `4e15c760815e19cedf067cee56ccd1c22a941db5`
- workflow Run 58 / `31221725089`
- inherited storm-physics browser suite: passed
- new rotation-stability suite: failed, correctly blocking promotion

Evidence isolated two remaining defects after the first correction:

- held camera desired target drift was already `0`
- release still produced about `0.9237 rad` of heading drift because residual storm/render travel became a new target
- Cow 17 remained airborne beyond `6.3 s` wall time
- Cow 17 reached altitude `20`
- capped simulation time was therefore not a sufficient bound for the bovine gag under low frame rate / Cow-Cam slow motion

## Final correction

### Camera

Anchors:

- `[SW:PLAYCANVAS:HELD_INTENT_STABILITY]`
- `[SW:PLAYCANVAS:RELEASE_SETTLE]`

Behavior:

- camera-basis rotation alone cannot retarget a stationary held stick
- the held desired heading remains stable
- camera turns only toward the bounded intentional target
- releasing the stick freezes that last target
- residual authority/render movement after release cannot invent a late camera command

Preserved values:

- camera distance
- base turn rate
- dead zone
- owner-approved trailing scale `0.9`
- one-stick camera-relative input semantics

### Cow 17

Anchor:

- `[SW:PLAYCANVAS:COW_ORBIT_STABILITY]`

Behavior:

- Cow 17 remains safe, invincible, and non-targetable
- Cow 17 remains excluded from the destructive PlayCanvas force-body registry
- orbit duration uses monotonic wall time
- total flight uses a wall-clock bounded descent envelope
- landing locks immediate relaunch while the storm remains nearby
- re-arm requires separation beyond `2.2 * storm.radius`

## Sealed Run 62

Exact promoted source:

`f5f01678595bf857840759604f362c93f62598e8`

Repository-owned PlayCanvas workflow:

- Run 62 / `31222412094`
- result: success
- exact-source identity: passed
- accepted gameplay authority reconstruction: passed
- strict TypeScript: passed
- static contracts: **69/69 passed**
- inherited storm-physics browser QA: **61/61 passed**
- rotation-stability QA: **11/11 passed**
- evidence contract: passed
- console errors: none
- page errors: none

Artifact:

- `severe-weather-playcanvas-slice-62`
- artifact ID `9010957717`
- GitHub digest `sha256:4e59ba01045869b4a752d2dc8071aac361b4513a214e5d6d664296ddac0b37e0`
- downloaded ZIP SHA-256 matched GitHub exactly
- `SOURCE_SHA.txt` matched the exact promoted source

Required rotation screenshots present:

- `playcanvas-slice-camera-stability.png`
- `playcanvas-slice-cow-stability.png`

All inherited baseline/physics screenshots were also present.

## Camera measurements

- held desired-target drift: `0`
- bounded held turn: `1.3962 rad`
- camera reached the dead-zone boundary and stopped turning
- headless low-frame-rate settle measurement: `4673 ms`
- release heading drift: `0`
- release desired-target drift: `0`

The headless settle time is not a physical Galaxy performance measurement. The important blocking behavior is bounded convergence and zero post-release wander.

## Cow 17 measurements

- safe flight started through the real authority path
- orbit lock engaged
- Cow 17 landed in `3050 ms`
- landed altitude `0.8`
- Cow 17 remained `safe: true`
- Cow 17 remained grounded through the post-landing hold while the storm stayed nearby
- re-arm remained locked until material storm separation

## Protected tree measurements

Run 62 preserved the accepted Run 53 browser-stage tree response numerically:

- Pull peak tree tilt `0.4218329627222749 rad`
- Pull trees reacting: 4
- Gust peak tree tilt `0.3673336055836977 rad`
- Gust trees reacting: 4
- Pull max inward light-prop displacement `5.374028004530404`
- Pull max tangential/orbit displacement `1.340381940964075`
- Gust max outward light-prop displacement `5.042881747270892`

## Public deployment

QA branch promotion:

- commit `723d50a034a5643db60f38afba8997212d5a45c6`

Deploy QA Pages:

- Run 73 / `31222935770`
- legacy QA root rebuild: passed
- deterministic QA4: passed
- exact Run 62 artifact download/re-verification: passed
- Pages deployment: passed
- public root verification: passed
- public PlayCanvas source/metadata verification: passed

Live owner-retest path:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

## Acceptance boundary

Current classification:

- committed: yes
- built: yes
- browser-QA passed: yes
- publicly deployed: yes
- owner browser retest of corrected rotation behavior: pending
- PlayCanvas Android APK built: no
- physically accepted on Galaxy S26 Ultra as an Android APK: no
- PR #35 merged: no

Do not convert this automated browser proof into owner acceptance or Android physical acceptance language.
