# PlayCanvas Migration Build Train

Last updated: 2026-08-07 America/Chicago  
Status: Stage 1 browser-playable sub-slice active; larger Prairie Junction test-world expansion next  
Authority: explicit owner decision plus physical testing of the PR #26 Android build

## Purpose

Move Severe Weather toward PlayCanvas without losing the accepted storm gameplay that already feels excellent on the target Android device.

This is a renderer and presentation migration, not permission to redesign scoring, controls, abilities, campaign timing, safe-animal behavior, or destruction laws.

## Source and branch boundary

- Frozen behavior reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Verified reference workflow: run `31094966986`
- Verified reference artifact: `severe-weather-presentation-identity-6`
- Verified debug APK: `Severe-Weather-v5.1.0-Presentation-Identity-6.apk`
- Verified APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`
- PRs #24, #25, and #26 remain draft, stacked, unmerged, and must not be casually retargeted.

## Current PlayCanvas checkpoint

A bounded authority-backed PlayCanvas slice is now browser-playable.

Sealed owner-tested browser source:

- source: `540087c3ea08c56b3b47dffb0b448608a934c350`
- draft implementation PR: #32
- PlayCanvas workflow: Run 34 / `31173231741`
- artifact: `severe-weather-playcanvas-slice-34`
- static verification: 50/50
- browser QA: 44/44
- QA Pages deployment: Run 69 / `31173467773`
- live path: `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

This candidate uses a one-stick third-person chase camera. Owner hands-on testing found the graphics substantially improved and the current chase camera better and pretty good in the small testing arena.

The current camera is now a **testing-arena baseline**. Do not keep tuning it in the small arena. The next step is a larger Prairie Junction test world so camera polish can be judged at real travel distances.

This browser checkpoint is not Android or physical acceptance.

## Owner physical findings on 2026-08-06

Accepted:

- The gameplay remains awesome after multiple physical rounds.
- The working storm feel is the protected reference.
- Cows read more clearly as cows than before.

Rejected or requiring correction:

- Prairie Junction / level two has road and terrain topology defects in the older renderer.
- The storm visibly passes underneath roads or terrain in multiple places in the older renderer.
- Sand-like or ground-material patches cover portions of the road in the older renderer.
- The opening cutscene looks rough and is not physically accepted.
- The older graphics approach does not deliver the desired visual quality.

## Selected direction

PlayCanvas is the selected production-renderer direction.

Use PlayCanvas Engine with TypeScript and the existing web toolchain where practical. Keep GitHub as source truth and preserve browser QA, Capacitor Android packaging, exact-commit workflows, artifacts, checksums, and physical-device acceptance.

The PlayCanvas Editor may be used for scene composition, lighting, materials, cameras, animation, and effects, but the repository must retain exportable, reproducible source and build truth.

## Stage 0: Freeze and map behavior

Goal: prevent the migration from silently changing the fun game.

Required:

- inventory the real gameplay executor and state contracts
- define adapter boundaries for storm transform, abilities, targets, scoring, campaign, destruction, animals, UI, and reset
- record reference values and deterministic scenarios from PR #26
- preserve Pull, Gust, Zap, score continuity, combo law, district timing, safe-animal law, pause/background behavior, and cleanup

Current status:

- explicit gameplay-authority bridge exists for the PlayCanvas slice
- real movement and ability executors are exercised by browser QA
- score/combo, timer, destruction proxy, Cow 17 safety, reset, and cleanup are represented in the browser evidence
- the legacy runtime remains authoritative

Exit criteria remain in force as the slice expands.

## Stage 1: Moo-Brew production slice

Build only:

- the opening newspaper and farm reveal
- Cow 17 drinking Moo Brew and reacting
- weather shift, chicken scatter, barn-roof beat, and tornado touchdown
- one corrected Prairie Junction intersection
- one house or storefront
- one cow
- one vehicle
- one electrical target
- Pull, Gust, Zap, and one destruction chain
- transition to a contained score view

Visual target:

- polished miniature disaster-comedy world
- authored roads and terrain
- strong silhouettes and readable materials
- convincing storm lighting and atmosphere
- unmistakable Cow 17 and Moo-Brew identity
- no photorealism requirement

Current Stage 1 sub-checkpoint:

- playable Prairie Junction renderer/authority proof exists
- corrected upright tornado exists
- Cow 17, vehicle, electrical target, Moo-Brew proxy, abilities, HUD, timer, score/combo, and reset are browser-playable
- one-stick chase camera is hands-on credible in the small arena
- canonical Moo-Brew opening sequence and final production art remain incomplete
- Android PlayCanvas packaging remains incomplete

### Stage 1A: Prairie Junction scale test

Before further camera polishing, expand only the bounded Prairie Junction testing world.

Goal:

- create enough connected road/terrain/world scale to evaluate long travel, sweeping turns, look-ahead needs, occlusion, and framing without porting a whole county

Requirements:

- preserve current testing-arena chase-camera values
- preserve visible storm-speed relationship to gameplay authority
- expand authored terrain and road network
- provide multiple connected intersections and visually distinct areas
- retain current gameplay-authority bridge and interactive slice objects
- prove road/terrain clearances at separated locations
- add long-travel and sweeping-turn browser QA plus screenshots
- return exact-head evidence before QA-site promotion

Detailed assignment: `Docs/ANTIGRAVITY_PLAYCANVAS_MAP_EXPANSION_HANDOFF.md`.

## Stage 2: Blocking visual and geometry QA

The slice fails if any of these occur:

- tornado or debris renders under roads or terrain
- road surface is covered by terrain dressing or material bleed
- road shoulders, intersections, or terrain elevations visibly separate incorrectly
- cutscene framing clips or loses its focal subject
- Cow 17 is not immediately recognizable in motion
- gameplay input, warning clock, scoring, combo, or ability semantics differ from the reference
- reset leaves entities, listeners, particles, or UI state behind

Required evidence:

- fixed-camera road and terrain screenshots
- tornado-ground-contact screenshots
- intro phase screenshots
- real-executor telemetry for abilities and destruction
- accepted-base and candidate comparison from the same runner

## Stage 3: Mobile performance gate

Measure on the Galaxy S26 Ultra and in same-runner CI comparisons:

- frame pacing during ordinary play and dense destruction
- particle and transparent-layer pressure
- shadow and light cost
- memory growth across retry and reset
- device heat and sustained-session behavior
- Android lifecycle and resume behavior

Use quality tiers for shadows, particles, post effects, and storm layers. Do not hide unacceptable defaults behind a future optimization promise.

## Stage 4: Physical acceptance

The migration slice is accepted only when the exact Android APK is installed and played on the target device.

Owner acceptance must confirm:

- the game still feels awesome
- the visual improvement is obvious
- roads and terrain are trustworthy
- the tornado never disappears beneath the world
- Cow 17 reads clearly
- the opening looks intentionally cinematic
- controls, scoring, timing, abilities, and destruction remain correct
- frame pacing, heat, and battery are acceptable

## Migration decision after the slice

Only after Stage 4 may the project choose among:

1. continue full PlayCanvas production migration
2. revise the PlayCanvas slice and retest
3. stop the migration and retain the frozen reference

Do not port all counties before the production slice passes physical acceptance.

## Process laws

- repository truth outranks chat memory
- one writer per branch
- do not weaken QA to obtain a green result
- do not claim an APK exists until assembly, upload, download or inspection, and SHA-256 verification are complete
- automated green status is not physical acceptance
- keep historical Three.js source and evidence intact as the behavior reference
- do not merge or retarget the existing stacked PRs without an explicit integration plan