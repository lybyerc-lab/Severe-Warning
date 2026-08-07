# Active Handoff

Last updated: 2026-08-07 America/Chicago  
Repository: `lybyerc-lab/Severe-Warning`  
Current direction: guarded PlayCanvas production-slice migration  
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`

## Durable decision

PlayCanvas is the selected production-renderer direction. The migration is intended to improve visual quality, authored world geometry, storm atmosphere, camera presentation, character readability, and the opening cinematic without redesigning the gameplay that was physically accepted as fun.

The accepted legacy runtime remains gameplay authority during the migration slice.

## Frozen behavior reference

- Draft PR: #26
- Branch: `agent/presentation-identity-moo-brew-pass`
- Exact reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

PRs #24, #25, and #26 remain an intentional unmerged draft stack. Do not casually retarget or merge them.

## Current PlayCanvas browser checkpoint

The first authority-backed PlayCanvas slice is browser-playable.

Sealed owner-tested candidate:

- implementation PR: #32, still draft/unmerged
- exact tested source: `540087c3ea08c56b3b47dffb0b448608a934c350`
- PlayCanvas workflow: Run 34 / `31173231741`
- artifact: `severe-weather-playcanvas-slice-34`
- artifact digest: `sha256:f7f90a48b6bd4a4b67b2523d90ec914ad291ad969c93d47d3a70dea7168c458d`
- static verification: 50/50
- browser QA: 44/44
- QA Pages deployment: Run 69 / `31173467773`
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

The live candidate uses a one-stick third-person chase camera. Forward input leaves camera heading stable, sustained turns rotate the camera gradually behind travel intent, and chase distance stays stable.

Important provenance note: after Run 34 was sealed, two harmless documentation-history commits were accidentally created then removed on the PR #32 branch. The final tree effect is zero, but PR #32's branch head may therefore be newer than the exact tested source. Do not treat a newer PR #32 head as the QA-tested source without a new exact-head run. The map-expansion lane intentionally roots from exact source `540087c3...`.

## Latest owner hands-on findings

Accepted direction:

- PlayCanvas graphics are a major improvement over the older renderer.
- The corrected tornado funnel reads upright.
- The first simple follow-camera implementation did not feel right because steering and camera rotation felt too directly coupled.
- The one-stick third-person chase model feels better and, in the current small testing arena, feels pretty good.
- The owner expects further camera polish only after the map is larger enough to judge real travel, look-ahead, occlusion, and turn behavior.

Current camera values are therefore a **testing-arena baseline**. Do not keep tuning them in the small arena.

## Active coordination branch

- handoff branch: `agent/playcanvas-prairie-expansion-handoff`
- exact technical parent: `540087c3ea08c56b3b47dffb0b448608a934c350`
- Antigravity work branch: `agent/playcanvas-prairie-expansion-antigravity`
- AG PR target: `agent/playcanvas-prairie-expansion-handoff`
- assignment: `Docs/ANTIGRAVITY_PLAYCANVAS_MAP_EXPANSION_HANDOFF.md`

Keep one writer per branch.

## Next implementation milestone

Expand Prairie Junction into a bounded larger testing world so the chase camera can be judged at meaningful travel distances.

Required direction:

1. preserve current one-stick chase-camera baseline values
2. preserve accepted gameplay authority and visible storm speed
3. expand terrain and connected road network
4. provide multiple intersections and visually distinct blocks/landmarks
5. retain Moo-Brew proxy, Cow 17, vehicle, electrical target, Pull, Gust, Zap, score/combo, timer, and reset
6. prove road/terrain clearance at separated locations
7. add long-travel and sweeping-turn browser QA
8. package spawn, long-travel, turn, and separated road-geometry screenshots
9. return exact-head evidence before any QA-site promotion

This is not a full county port and not the storm-physics rebuild yet.

## Camera baseline protection

Current source values include:

- initial horizontal camera offsets: X 30, Z 36
- chase height: 28
- look target Y: 3.6
- chase turn rate: 1.05 rad/s
- heading dead zone: 10 degrees
- observed-movement threshold: 0.28
- stick intent threshold: 0.12
- max camera step: 0.12 s

Do not retune these during map expansion unless a reproducible blocking defect requires an isolated, measured fix.

Map expansion must not make the storm appear materially faster simply by stretching the presentation transform. Preserve deterministic visible displacement within the handoff's comparison tolerance.

## Protected gameplay behavior

Preserve:

- direct storm controls
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

For the current PlayCanvas line:

- committed: yes
- built: yes for sealed browser candidate
- browser-QA passed: yes for exact source `540087c3...`
- live QA deployed: yes for exact source `540087c3...`
- Android PlayCanvas APK built: no
- physically accepted on Galaxy S26 Ultra: no
- PR #32 merged: no

Never convert browser success into physical acceptance language.

## Process laws

- repository truth outranks chat memory
- one writer per branch
- do not weaken QA to obtain green
- exact-source identity is blocking evidence
- helper-only markers never prove executor integration
- do not call `assembleDebug` a signed release
- do not claim an APK until assembly, artifact inspection, and checksum verification are complete
- physical Galaxy S26 Ultra testing is final authority
- historical Three.js source/evidence remains protected until PlayCanvas is physically accepted