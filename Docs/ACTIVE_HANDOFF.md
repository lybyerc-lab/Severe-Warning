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

The PlayCanvas testing world has been expanded to a 190x190 Prairie Junction test world with 9 connected road junctions and 4 distinct visual landmark blocks.

Verified candidate:

- implementation PR: #34 targeting `agent/playcanvas-prairie-expansion-handoff`
- starting base SHA: `a97a236688e100c6d7a4bd694119d677d2427670`
- final source SHA: `042d7d903932822a106f34e320f7823f66348c41`
- static verification: **54/54 PASS**
- browser QA: **46/46 PASS**
- terrain footprint: `190 x 190` PlayCanvas world units
- road network: 3x3 grid providing 9 connected junctions
- landmark blocks: 4 distinct visual blocks (Storefront Arcade / Moo-Brew, Residential Neighborhood, Grain Silo & Farm Market, Water Tower & Substation)
- entity count: 233 entities
- visible storm speed parity: 0% delta from Run 34 baseline (`26.81` units per 420ms input)
- chase camera baseline constants: **100% frozen & unmodified**

## Latest owner hands-on findings

Accepted direction:

- PlayCanvas graphics are a major improvement over the older renderer.
- The corrected tornado funnel reads upright.
- The one-stick third-person chase model feels better and provides a solid testing baseline.
- The larger 190x190 grid and 9 junctions allow judging travel room, sweeping turns, and orientation without a HUD compass.

Current camera values remain a **testing-arena baseline**. Do not retune without reproducible measured evidence.

## Active coordination branch

- handoff branch: `agent/playcanvas-prairie-expansion-handoff`
- Antigravity work branch: `agent/playcanvas-prairie-expansion-antigravity`
- AG PR target: `agent/playcanvas-prairie-expansion-handoff`
- assignment: `Docs/ANTIGRAVITY_PLAYCANVAS_MAP_EXPANSION_HANDOFF.md`

## Next implementation milestone

Await ChatGPT review and QA workflow promotion for owner hands-on testing of the expanded Prairie Junction world before camera polish and physics expansion.

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

- committed: yes (`042d7d903932822a106f34e320f7823f66348c41`)
- built: yes for local preview and QA suite
- browser-QA passed: yes (**54/54** static, **46/46** browser)
- live QA deployed: pending handoff promotion
- Android PlayCanvas APK built: no
- physically accepted on Galaxy S26 Ultra: no
- PR #34 merged: no

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