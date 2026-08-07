# Active Handoff

Last updated: 2026-08-07 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-slice migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
Current bounded milestone: PlayCanvas storm physics parity owner hands-on

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

Owner hands-on verdict:

- expanded build ran well
- 10% slower chase catch-up was much better
- current camera is as good as can presently be judged

Keep this camera/map combination frozen while judging storm physics.

## Current PlayCanvas storm-physics checkpoint

Implementation line:

- draft PR: #35
- base: `agent/playcanvas-storm-physics-handoff`
- head: `agent/playcanvas-storm-physics-parity`
- exact sealed source: `8d070e21cfe7720353ec842a02f1179bc33e9181`

Repository-owned PlayCanvas workflow:

- Run 53 / `31219969904`: **PASS**
- artifact: `severe-weather-playcanvas-slice-53`
- artifact ID: `9010066122`
- artifact SHA-256: `fd7e084e49d4cd4760351dc355f8f28fcdd185f4fc6765c1f33b245ef2e8c85c`
- static verification: **69/69 PASS**
- browser QA: **61/61 PASS**
- all required baseline, Pull, Gust, travel, junction, and debris screenshots sealed

Measured browser proof:

- visible/authority storm scale: `0.7717084052`
- Pull: 4 trees reacted
- Pull: 3 light props reacted
- Pull maximum inward displacement: `5.3740`
- Pull maximum tangential/orbit displacement: `1.3404`
- Gust: 4 trees reacted
- Gust: 5 light props reacted
- Gust maximum outward displacement: `5.0429`
- authoritative barn state reached stage 3 and roof-detached state
- 4 representative debris bodies airborne at the sampled destruction point
- authoritative roof was airborne
- reset restored active body count to 0 and airborne body count to 0
- Cow 17 remained `safe: true`

QA Pages promotion:

- QA commit: `bf75c0fd6ca07b9e54f58c1d1bceeafa6c0d092d`
- Run 72 / `31220379275`: **PASS**
- existing QA root rebuilt and deterministic QA4 remained green
- exact Run 53 artifact downloaded and re-verified
- public PlayCanvas metadata/source verification passed
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

Durable implementation shape:

- game-owned custom force law, not generic engine tornado feel
- radial inward suction
- tangential swirl/orbit
- vertical lift
- mass/resistance response
- Gust outward impulse
- Pull amplification
- representative trees/light props
- authoritative Moo-Brew roof/debris handoff
- real accepted ability executor remains upstream authority
- reset/dispose cleanup is blocking QA
- Cow 17 is excluded from the destructive body registry

## Next gate

Owner browser hands-on should judge the live Run 53 physics candidate, especially:

- Pull reads as clear inward suction
- light props visibly acquire orbit rather than simply sliding
- Gust reads as an outward blast
- tree reactions are readable at normal play speed
- detached Moo-Brew roof/debris looks energetic rather than random or weightless
- camera still feels like the frozen approved baseline

Do not tune the camera during this physics review.

After owner browser feedback, iterate the bounded physics slice if needed. Do not call storm physics matched, better, or physically accepted until an exact PlayCanvas Android APK is installed and approved on the Galaxy S26 Ultra.

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

For the camera/map checkpoint:

- committed: yes
- browser-QA passed: yes
- live browser hands-on accepted for this stage: yes
- Android PlayCanvas APK built: no
- physically accepted PlayCanvas migration on Galaxy S26 Ultra: no

For the storm-physics checkpoint:

- implementation: committed
- browser-QA: passed
- live public QA deployment: passed
- owner hands-on physics verdict: pending
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
