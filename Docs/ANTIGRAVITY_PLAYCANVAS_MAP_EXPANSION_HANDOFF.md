# Antigravity Handoff: PlayCanvas Prairie Junction Map Expansion

**Project:** Severe Weather Warning  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Authoritative parent branch:** `agent/playcanvas-prairie-expansion-handoff`  
**Parent source before handoff docs:** `540087c3ea08c56b3b47dffb0b448608a934c350`  
**Required work branch:** `agent/playcanvas-prairie-expansion-antigravity`  
**PR target:** `agent/playcanvas-prairie-expansion-handoff`  
**Mode:** Expand the browser-playable Prairie Junction testing world enough to evaluate the one-stick third-person chase camera at meaningful travel distances. Do not tune the accepted camera baseline in this assignment unless a reproducible blocking defect requires it.

## Mission

Turn the current small PlayCanvas test arena into a larger connected Prairie Junction test world while preserving the accepted gameplay authority and the camera feel that the owner just approved as a good testing-arena baseline.

This is **not** a full county port and it is **not** the storm-physics rebuild yet. The purpose is to create enough world scale, connected roads, landmarks, and travel room to expose the next real camera/presentation issues before camera polish and physics expansion.

The owner hands-on verdict on the current build is:

> The one-stick chase camera feels better and pretty good in the testing arena. It will still need polish when the map gets larger.

Treat that as the design boundary for this assignment.

## Sealed parent evidence

The technical parent is the exact browser-tested source:

- source SHA: `540087c3ea08c56b3b47dffb0b448608a934c350`
- PlayCanvas workflow: Run **34** / `31173231741`
- artifact: `severe-weather-playcanvas-slice-34`
- artifact digest: `sha256:f7f90a48b6bd4a4b67b2523d90ec914ad291ad969c93d47d3a70dea7168c458d`
- static verification: **50/50**
- browser QA: **44/44**
- forward-input camera heading delta: `0 rad`
- sustained-right camera heading delta: about `0.315 rad` / `18 degrees`
- chase-distance drift: effectively zero
- console errors: `0`
- page errors: `0`

The exact candidate was promoted by QA Pages Run **69** / `31173467773` and verified live at:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

That web acceptance is not Android or physical acceptance.

## Read before changing code

1. `AGENTS.md`
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/AGENT_BRIDGE.md`
4. `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
5. `Docs/ACCEPTED_BEHAVIOR.md`
6. `Docs/IMPLEMENTATION_TRUTH_GATE.md`
7. `Docs/PLAYCANVAS_BROWSER_PROOF_2026-08-06.md`
8. `Docs/PLAYCANVAS_HANDS_ON_FEEDBACK_2026-08-06.md`
9. this handoff
10. current PR #32 diff and source

Repository code and exact evidence outrank prose when they conflict.

## Branch procedure

Start from the handoff branch exactly:

```bash
gh repo clone lybyerc-lab/Severe-Warning
cd Severe-Warning
git fetch origin
git switch -c agent/playcanvas-prairie-expansion-antigravity \
  origin/agent/playcanvas-prairie-expansion-handoff
git rev-parse HEAD
```

Record the starting SHA in the draft PR body. Keep one writer on the work branch.

## Frozen camera baseline

Do not casually retune these values during map expansion. They are the current owner-approved testing-arena baseline in `playcanvas-slice/src/main.ts` and `playcanvas-slice/src/chase-camera.ts`:

- initial horizontal offset X: `30`
- initial horizontal offset Z: `36`
- chase distance: derived from the above offsets
- chase height: `28`
- look target Y: `3.6`
- turn rate: `1.05 rad/s`
- heading dead zone: `10 degrees`
- observed-movement threshold: `0.28`
- one-stick intent threshold: `0.12`
- maximum camera time step: `0.12 s`

Preserve the behavioral contract:

- one joystick remains the only movement/look interaction
- gameplay authority owns actual storm movement
- stick input is camera-relative
- forward travel does not rotate camera materially
- a sustained turn rotates camera gradually behind travel intent
- small corrections do not whip the world around
- chase distance remains stable
- reset restores deterministic camera heading

If a blocking defect forces a camera-value change, isolate it in its own commit, explain the measured failure, preserve the pre-change value in the PR body, and add a regression test. Do not tune by aesthetic guesswork in this assignment.

## Preserve visible storm speed

Map expansion must not make the storm feel artificially faster merely because the presentation mapping was stretched.

Before changing `createWorldTransform` or any presentation scale:

1. measure the Run 34 visible storm displacement for a deterministic input duration
2. record the effective PlayCanvas-units-per-authority-unit relationship
3. keep the candidate visible displacement within **plus or minus 10%** for the same deterministic input duration unless the owner explicitly approves a speed change

Prefer expanding terrain, road layout, and world extents around the existing mapping rather than globally scaling movement.

Gameplay movement speed remains protected authority behavior.

## Required map expansion

Build a bounded larger Prairie Junction test world, not the whole county.

Minimum target:

- terrain footprint at least roughly `180 x 180` PlayCanvas world units
- continuous authored road network large enough for sustained straight travel and sweeping turns
- at least **four connected intersections** or equivalent connected junctions
- at least **three visually distinct blocks/areas** so camera orientation can be judged without a compass HUD
- retain the current Moo-Brew gameplay proxy, Cow 17, vehicle, electrical target, and tornado
- add lightweight buildings/landmarks sufficient to make movement and camera rotation visually legible
- keep all new roads explicitly above terrain using the existing road-height contract
- preserve clear sidewalks/shoulders at intersections
- no terrain or dressing material may cover road surfaces
- tornado ground contact must remain visibly above the road/terrain contract

Reasonable examples of visual areas are a storefront block, residential block, small parking/service block, utility corner, or similar Prairie Junction language. These are presentation landmarks, not permission to invent new gameplay systems.

Do not add a full district progression system, new campaign rules, new score rules, or a second gameplay authority.

## Performance discipline

The expansion should be mobile-minded from the start:

- prefer shared materials and reusable geometry helpers
- avoid one shadow-casting light per building
- avoid unnecessary transparent surfaces
- do not multiply entities purely for decorative noise
- keep the current directional-light strategy unless evidence justifies a change
- report final PlayCanvas entity count
- if far clip must increase for the larger world, change only the clipping requirement, not chase-camera feel values

This is not the final Android performance gate, but do not build an obviously disposable desktop-only scene.

## Gameplay authority boundary

The accepted legacy runtime remains authoritative for:

- storm movement
- Pull
- Gust
- Zap
- scoring and combo
- warning clock
- destruction state
- Cow 17 safety
- reset

The PlayCanvas world may mirror and present those states. Do not duplicate them as new authoritative gameplay systems.

Protected laws still include:

- exact 3.5x combo cap
- +0.05 combo steps
- 4.5 s combo decay
- continuous scoring
- three-minute warning clock
- no duplicate mobile ability activation
- safe/invincible/non-targetable animals
- pause/background time holding
- deterministic cleanup/reset

## Blocking browser QA

Extend the existing exact-head workflow. Do not weaken existing checks.

The candidate must prove at minimum:

1. exact pushed source identity
2. real PlayCanvas `2.21.3` loaded-engine version/revision authority
3. all existing Pull/Gust/Zap, score/combo, Cow 17, cleanup, road-clearance, and error checks remain green
4. camera baseline constants remain unchanged from the sealed parent unless a separately justified defect fix exists
5. deterministic forward movement still produces materially stable camera heading
6. deterministic sustained turns still rotate the chase camera gradually rather than staying fixed or snapping
7. chase distance remains stable through longer movement windows
8. visible storm displacement for a deterministic input duration stays within plus or minus 10% of the sealed parent baseline
9. expanded terrain/world extents meet the committed minimum
10. at least four connected road junctions are present
11. road/terrain height contracts hold at multiple separated junctions, not only the original intersection
12. the storm can complete a longer straight-travel test and a sweeping-turn test without leaving the authored terrain footprint
13. no console errors
14. no uncaught page errors
15. disposal and reset remain clean

Add or retain evidence for the measured values rather than only boolean markers.

## Screenshot evidence

Package at least:

- spawn/initial framing screenshot
- long-travel screenshot showing the larger world and chase framing
- sweeping-turn screenshot showing camera/world relationship after a sustained turn
- one separated road/terrain geometry screenshot away from the original intersection

Inspect them manually. A green machine report with a blank, clipped, repetitive, unreadable, or obviously broken world is a failure.

## Files expected to change

Likely:

- `playcanvas-slice/src/scene.ts`
- reusable geometry helpers if needed
- `scripts/verify-playcanvas-slice.mjs`
- `scripts/qa-playcanvas-slice.mjs`
- evidence/workflow assertions if necessary
- focused documentation/ledger entries

Avoid broad edits to the accepted gameplay runtime.

## Protected files and systems

Do not redesign:

- `MechanicsLab/SevereWeather_3D_Lab.html`
- legacy gameplay executors
- scoring/combo laws
- abilities
- campaign timing
- save schemas
- Android package identity
- PRs #24, #25, #26
- `main`
- the live QA root

Do not merge PR #32 or any older draft stack as part of this assignment.

## No QA-site promotion from the AG branch

Return the green exact-head artifact first. Do **not** overwrite `/playcanvas/` from the AG work branch.

ChatGPT will inspect the artifact, reports, screenshots, and exact source. If credible, the candidate can then be promoted through the guarded `qa` workflow for owner hands-on testing.

## Required return package

Open a draft PR targeting `agent/playcanvas-prairie-expansion-handoff` and return:

- starting SHA
- final source SHA
- draft PR number
- changed-file list
- workflow run ID and run number
- engine version/revision proof
- artifact name, ID, digest
- static report pass count and failed checks
- browser report pass count and failed checks
- Run 34 vs candidate visible-displacement comparison
- final terrain/world extents
- road junction count
- entity count
- screenshot paths plus manual visual verdict
- explicit statement that Android was not built and physical acceptance was not claimed

Do not call the stage successful until the exact pushed head is green and the complete artifact has been inspected.