# Active Handoff

Last updated: 2026-08-06 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current direction: guarded PlayCanvas production-slice migration
Current build-train: `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
Current milestone: first browser-playable PlayCanvas candidate is live on QA

## Durable decision

The owner explicitly selected PlayCanvas as the production-renderer direction after physically testing the PR #26 Android build.

The migration is intended to improve visual quality, scene composition, terrain and road reliability, character presentation, storm atmosphere, and the opening cinematic. It is not permission to redesign the gameplay that already feels excellent.

## Frozen behavior reference

- Draft PR: #26
- Head branch: `agent/presentation-identity-moo-brew-pass`
- Exact reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Verified workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK: `Severe-Weather-v5.1.0-Presentation-Identity-6.apk`
- APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

PRs #24, #25, and #26 remain protected historical stack context. Do not casually retarget, squash, or rewrite them.

## Physical findings that drove the renderer change

Accepted and protected:

- Multiple physical Android rounds remained fun.
- The owner described the gameplay as still awesome.
- Pull, Gust, Zap, destruction, scoring, campaign timing, and safe-animal behavior remain protected reference behavior.

Rejected or requiring correction:

- Prairie Junction / level two contains road and terrain topology defects.
- The storm visibly passes underneath roads or terrain in many places.
- Sand-like or ground-material patches cover portions of the road.
- The opening cutscene looks rough and is not accepted.
- The old rendering/art-production approach does not reach the desired visual quality.

## Current implementation branch

- Draft PR: #32 `Build first playable PlayCanvas authority-backed slice`
- Branch: `agent/playcanvas-playable-moo-brew-slice`
- Verified playable source SHA: `5936bb12e022741a0964b2c80be9304780ee68d0`
- Base/migration-memory branch: `agent/playcanvas-production-slice-handoff`
- PR #32 remains draft and unmerged.

## Current architecture

The playable migration candidate uses a deliberately transitional compatibility seam:

- accepted legacy runtime remains gameplay authority
- PlayCanvas 2.21.3 is the visible renderer
- hidden same-origin authority frame supplies live state and accepted executor access
- Phase 3 input/ability bridge remains authoritative for keyboard, joystick, Pull, Gust, and Zap
- accepted warning clock, scoring/combo, destruction, campaign/runtime state, reset, and safe-animal state remain authoritative
- PlayCanvas renders the visible tornado, HUD, roads, buildings, Cow 17, vehicle, electrical target, and destruction proxy

This proves renderer replacement without gameplay replacement. The hidden legacy renderer is transitional and is not the final mobile-performance architecture.

## Browser-playable proof

Authoritative evidence: `Docs/PLAYCANVAS_PLAYABLE_QA_PREVIEW_2026-08-06.md`

PlayCanvas workflow Run 18:

- Run ID: `31136370444`
- exact source: `5936bb12e022741a0964b2c80be9304780ee68d0`
- result: success
- PlayCanvas: `2.21.3`, revision `b1767d5`
- engine SHA-256: `d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4`
- static verifier: `42/42`
- Chromium browser QA: `37/37`
- artifact: `severe-weather-playcanvas-slice-18`
- artifact digest: `sha256:169784d02b11170d3e0f24d6e61fdc8a01d5ccb07b3561680fdf2cce909b3bc2`

Real-executor proof from the browser harness:

- authoritative storm moved `24.489997958350216` world units
- storm-to-live-target distance reduced `28.30194339616981 -> 3.841874542459748`
- Gust accepted
- Pull accepted
- Zap accepted
- production-barn health reduced `760 -> 437.19999999999976`
- score advanced `0 -> 217`
- combo advanced `1.00x -> 1.10x` and stayed within protected `3.5x` cap
- Cow 17 remained safe
- reset restored active 180-second warning run
- cleanup removed PlayCanvas canvas and authority frame

## Live QA preview

Existing QA root remains intact:

`https://lybyerc-lab.github.io/Severe-Warning/`

Playable PlayCanvas preview:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`

Live PlayCanvas metadata:

`https://lybyerc-lab.github.io/Severe-Warning/playcanvas/qa-playcanvas-build.json`

QA Pages Run 67:

- Run ID: `31136838498`
- QA branch SHA: `14c1b3945957cb480aa7734e9a277580e42772dc`
- old QA root rebuild: success
- deterministic QA4: success
- sealed Run 18 artifact verification: success
- Pages deploy: success
- post-deploy public URL verification: success
- live metadata exact source SHA: `5936bb12e022741a0964b2c80be9304780ee68d0`

## What the owner can test now

The PlayCanvas QA preview supports:

- keyboard WASD / arrow movement
- touch joystick
- Pull, Gust, Zap buttons and 1/2/3 keys
- live warning timer
- live score/combo
- authoritative storm movement rendered in PlayCanvas
- visible destruction-state response
- Cow 17, vehicle, and electrical target
- reset

This is a first playable migration slice, not final art or mobile acceptance.

## Current classification

- Committed: yes
- Built: yes
- Browser-QA passed: yes
- Live QA preview verified: yes
- Browser playable: yes
- Android APK built for PlayCanvas: no
- Physically accepted on Galaxy S26 Ultra: no
- PR #32 merged: no

## Next gate

1. Collect owner hands-on feedback from the live `/playcanvas/` QA preview.
2. Fix presentation and control defects without weakening gameplay authority.
3. Keep the existing QA root as reference until the PlayCanvas slice is explicitly accepted.
4. Once browser behavior/presentation are acceptable, package the bounded candidate through Capacitor Android.
5. Inspect exact APK/artifact/checksum evidence.
6. Perform Galaxy S26 Ultra testing for gameplay feel, roads/terrain, Cow 17 readability, frame pacing, heat, lifecycle, and controls.
7. Do not widen into full multi-county migration before the bounded slice passes physical acceptance.

## Process laws

- Repository truth outranks chat memory.
- One writer per implementation branch.
- Do not weaken QA to obtain a green badge.
- Existing gameplay simulation remains authoritative until a separately proven migration step changes that boundary.
- Automated browser success is not physical Android acceptance.
- Do not claim an APK exists until assembly, upload, inspection, and SHA-256 verification are complete.
- Historical Three.js source and evidence remain intact as the behavior reference until a PlayCanvas slice is physically accepted.
