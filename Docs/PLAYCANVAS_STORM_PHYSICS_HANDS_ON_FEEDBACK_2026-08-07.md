# PlayCanvas Storm Physics Hands-On Feedback — 2026-08-07

Status: owner browser hands-on feedback recorded. Tree bend accepted for this browser-stage slice. Camera and Cow 17 rotation defects were reproduced, corrected, browser-gated, and redeployed for owner retest. No Android physical acceptance is claimed.

## Original tested candidate

- PR: #35 `Restore PlayCanvas storm physics parity slice`
- exact tested source: `8d070e21cfe7720353ec842a02f1179bc33e9181`
- PlayCanvas workflow: Run 53 / `31219969904`
- QA Pages deployment: Run 72 / `31220379275`
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

## Owner verdict

Owner feedback:

> Tree bend is great! the camera gets stuck spinning around somtimes, as does the cow.

Interpretation:

- **Tree bend:** accepted for the current browser-stage physics slice. Preserve the Run 53 tree-response behavior and do not retune its force constants in the rotation-stability correction.
- **Camera:** rejected defect. The chase camera could continue orbiting instead of settling after steering.
- **Cow 17:** rejected defect. Cow 17 could remain in the safe airborne orbit instead of completing a comedic flight and landing.

## Root causes found

### Camera feedback loop

`controls.refresh()` reprojects a held screen-space input through the current chase-camera basis every rendered frame. The old `setTravelIntent()` treated each reprojected world vector as a new desired heading. During a sustained lateral hold, camera rotation changed the world vector, which moved the target heading again, so the camera could chase itself around the tornado indefinitely.

A first correction stabilized held-stick intent, but Run 58 showed a second real defect: after stick release, residual authority/render travel was being interpreted as a fresh camera target, producing nearly one radian of additional camera wandering.

Final correction contract:

- preserve one-stick camera-relative input
- preserve owner-approved camera distance, base turn rate, dead zone, and trailing scale `0.9`
- distinguish a real change in stick direction from a world-vector change caused only by camera rotation
- a stationary held stick produces one stable desired heading
- camera reaches that bounded target and stops turning
- release freezes the last intentional target rather than retargeting from residual travel
- release must not cause wandering

### Cow 17 orbit loop

The accepted bovine slapstick system enters orbit while a cow is inside `storm.radius * 1.8`. Its airborne orbit radius can remain inside that same threshold indefinitely, so the landing branch may never execute.

A first finite-orbit correction used capped simulation time. Run 58 proved that was not sufficient in wall-clock terms: under the heavy authority frame Cow 17 was still airborne more than six seconds later, with altitude continuing toward the 20-unit cap. Cow-Cam slow motion could stretch the flight further.

Final correction contract:

- Cow 17 remains safe, invincible, and non-targetable
- keep a visible comedic airborne orbit
- orbit window is bounded by monotonic wall time, not capped simulation delta
- total flight is also wall-clock bounded with a smooth forced descent envelope
- do not immediately relaunch while the storm remains nearby
- re-arm only after the storm moves beyond `2.2 * storm.radius`

## Failed diagnostic gate: Run 58

Exact source:

- `4e15c760815e19cedf067cee56ccd1c22a941db5`
- workflow Run 58 / `31221725089`

Important result:

- inherited full storm-physics browser suite: **PASS**
- accepted tree response therefore remained protected
- new rotation-stability QA: **FAIL**, correctly blocking promotion

Run 58 measurements:

- held desired camera target drift: `0`
- held camera target therefore no longer chased itself
- camera still turning after the first short settle window
- release heading drift: about `0.9237 rad`
- Cow 17 remained airborne beyond `6.3 s`
- Cow 17 altitude reached `20`

The gate was not weakened. The remaining behavior defects were corrected.

## Corrected sealed browser candidate: Run 62

Exact source:

- `f5f01678595bf857840759604f362c93f62598e8`
- workflow Run 62 / `31222412094`
- artifact: `severe-weather-playcanvas-slice-62`
- artifact digest: `sha256:4e59ba01045869b4a752d2dc8071aac361b4513a214e5d6d664296ddac0b37e0`
- downloaded ZIP SHA-256 matched GitHub exactly

Verification:

- strict TypeScript: passed
- static contracts: **69/69 passed**
- inherited storm-physics browser QA: **61/61 passed**
- dedicated rotation-stability QA: **11/11 passed**
- evidence contract: passed
- console errors: none
- page errors: none

Camera evidence:

- held desired-heading drift: `0`
- bounded held turn: `1.3962 rad`
- camera settled and stopped turning
- headless low-frame-rate settle measurement: `4673 ms`
- release heading drift: `0`
- release desired-heading drift: `0`

Cow 17 evidence:

- safe flight started through the real authority path
- orbit lock engaged
- Cow 17 landed in `3050 ms`
- altitude returned to `0.8`
- Cow 17 remained `safe: true`
- Cow 17 remained grounded during the post-landing hold while the storm stayed nearby
- re-arm remained locked until material storm separation

Protected tree response remained numerically identical to the accepted Run 53 browser slice:

- Pull peak tree tilt: `0.4218329627222749 rad`
- Pull trees reacting: 4
- Gust peak tree tilt: `0.3673336055836977 rad`
- Gust trees reacting: 4
- Pull max inward light-prop displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward light-prop displacement: `5.042881747270892`

## Public QA redeployment

QA branch promotion commit:

- `723d50a034a5643db60f38afba8997212d5a45c6`

Deploy QA Pages:

- Run 73 / `31222935770`
- existing QA root rebuild: passed
- deterministic QA4: passed
- exact Run 62 artifact download and re-verification: passed
- Pages deployment: passed
- public QA root verification: passed
- public PlayCanvas source/metadata verification: passed

Live owner-retest path:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

## Protected behavior

The correction did not alter:

- accepted Run 53 tree bend response
- Pull/Gust force constants for trees
- storm movement speed
- camera height/distance/base turn rate/dead zone/0.9 trailing scale
- Pull/Gust/Zap executor semantics
- scoring/combo/timer behavior
- safe-animal law
- world/map geometry

## Acceptance boundary

Current state:

- committed: yes
- built: yes
- browser-QA passed: yes
- publicly deployed: yes
- owner browser retest of the corrected rotation behavior: **pending**
- PlayCanvas Android APK built: no
- physically accepted on Galaxy S26 Ultra as an Android APK: no
- PR #35 merged: no

Do not convert automated browser success into owner acceptance or Android physical acceptance language.
