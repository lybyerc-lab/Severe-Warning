# PlayCanvas Storm Physics Hands-On Feedback — 2026-08-07

Status: owner browser hands-on feedback recorded. Tree bend accepted for this browser-stage slice. Camera and Cow 17 rotation defects under correction. No Android physical acceptance is claimed.

## Tested candidate

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
- **Camera:** rejected defect. The chase camera can enter a continuous orbit instead of settling behind a held travel direction.
- **Cow 17:** rejected defect. Cow 17 can remain in the safe airborne orbit indefinitely instead of completing a comedic flight and landing.

## Root causes found

### Camera feedback loop

`controls.refresh()` reprojects a held screen-space input through the current chase-camera basis every rendered frame. The old `setTravelIntent()` treated each reprojected world vector as a new desired heading. During a sustained lateral hold, camera rotation changed the world vector, which moved the target heading again, so the camera could chase itself around the tornado indefinitely.

Correction contract:

- preserve one-stick camera-relative input
- preserve owner-approved camera turn rate and trailing scale
- distinguish a real change in stick direction from a world-vector change caused only by camera rotation
- a stationary held stick must produce one stable desired heading
- camera must settle and stop turning
- release must not cause wandering

### Cow 17 orbit loop

The accepted bovine slapstick system enters orbit while a cow is inside `storm.radius * 1.8`. Its airborne orbit radius can remain inside that same threshold indefinitely, so the landing branch may never execute.

Correction contract:

- Cow 17 remains safe, invincible, and non-targetable
- keep a visible comedic airborne orbit
- bound an individual orbit to a finite time window
- force descent/landing after that window
- do not immediately relaunch while the storm remains nearby
- re-arm only after the storm moves materially away

## Protected behavior

The correction must not alter:

- accepted Run 53 tree bend response
- Pull/Gust force constants for trees
- storm movement speed
- camera height/distance/base turn rate/0.9 trailing scale
- Pull/Gust/Zap executor semantics
- scoring/combo/timer behavior
- safe-animal law
- world/map geometry

## Next gate

Repository-owned browser QA must add explicit long-hold camera no-spin coverage plus Cow 17 bounded-flight/landing coverage before the corrected build is promoted back to `/playcanvas/` for another owner test.
