# Severe Weather Current Status

Last updated: 2026-08-03
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Active candidate: HTML/WebGL `5.0.0 Heartland Campaign Foundation`
Primary target: single-player Android landscape
Active source: `MechanicsLab/SevereWeather_3D_Lab.html`
Android packaging: Capacitor 8.5.0 with local offline assets

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
4. `Docs/DECISION_LOG.md`
5. `Docs/NO_DRIFT_POLICY.md`
6. `Docs/DEVICE_TEST_LOG.md`
7. Historical Unity and Godot checkpoint documents

Important decisions and test evidence must be committed to the repository. Chat is working context, not durable project memory.

## Production decision

The enjoyable HTML/WebGL game is the production gameplay source. Capacitor packages the exact game locally for Android. Unity and Godot remain preserved historical experiments and are not active production paths.

Reopen an engine port only if measured physical-device evidence proves that the wrapped HTML build cannot meet an explicit requirement.

## Locked product direction

Severe Weather is a humorous, replayable mobile arcade destruction game in which the player directly controls the storm.

- Android landscape is the primary target.
- The visual target is a modernized mid-2000s arcade destruction game with soft toon lighting, bold silhouettes, expressive damage, readable atmosphere, and selective outlines.
- The response is a media circus, not a battle.
- News vans and storm chasers are invincible witnesses, never enemies or destruction targets.
- People remain protected and off-limits.
- Animals are invincible, non-targetable, and may appear in safe slapstick sequences.
- `Moo Brew` is the approved opening-cinematic coffee brand.
- Regional campaigns are approved: Heartland, Coastland, East Coast, and West Coast.
- Approved future storm forms include waterspouts, twin or satellite funnels, multi-vortex tornadoes, and a later fire-whirl variant only after real fire mechanics exist.
- Storm abilities must become visibly physical: lightning propagation through power infrastructure, wind-driven tree and prop reactions, and stronger Pull anticipation.
- The audio system must advance to layered weather ambience and material-specific destruction sounds.

The complete approved direction is recorded in `Docs/PRODUCT_VISION_AND_ROADMAP.md`.

## Active v5.0.0 candidate

The V5 integration branch now contains a deterministic four-stop Heartland campaign, real-time warning clock, and authored-world pass. Each stop has its own terrain profile, regional scenery, broadcast and media identity, bonus challenges, controlled animal density, and two destructible signature landmarks.

Automated evidence already accepted for the foundation:

- V5 structural verifier passed
- inherited strict full-round browser run passed all `11/11` checks in 185 seconds
- no page errors, console errors, or harness exception in that full round

Candidate-local evidence:

- all four authored worlds loaded in a `932 x 430` mobile-landscape browser
- unique terrain, scenery, landmark, challenge, broadcast, media, and density contracts were observed
- no page or console errors were observed

The authored-world commit still requires exact-commit CI, a new APK, Galaxy S26 Ultra play, and close/reopen persistence acceptance.

## v4.4.0 accepted contents

- Replaced Tornado Grid Zap's silent pole scoring with a bounded electrical cascade.
- Added storm-to-pole and pole-to-pole utility hops.
- Added bright core arcs, additive glow, traveling pulse markers, and automatic cleanup.
- Limited the cascade to a bounded utility chain to protect mobile performance.
- Preserved substation and blackout systems.
- Added the first narrow `MeshToonMaterial` test on utility assets.
- Advanced package, Android, in-game, build-info, and artifact identity to `4.4.0`.
- Android `versionCode`: `440`.
- APK name: `Severe-Weather-v4.4.0-Illustrated-Storm-debug.apk`.
- Replaced brittle hard-coded packaging identity with `package.json` as the version source of truth.
- Replaced legacy Android system-UI flags with modern immersive fullscreen handling.
- Restores fullscreen after WebView attachment, app resume, and window-focus return.

## Build and physical evidence

### Grid Zap gameplay pass

- Tested commit: `f6754c3124ef7bf32d82bfcd369afc05c2252a66`
- GitHub Actions run: `30681407457` (`Build Android Debug APK #26`)
- Artifact: `severe-weather-v4.4.0-illustrated-storm-26`
- APK SHA-256: `5036b118aae1fb86b1e98c5cbed3b1416cff4dfe859a5edf0c5e82dbb38ceb4c`
- Device: Galaxy S26 Ultra
- User verdict: `Good build`

A full Tornado Warning run reached the results and retry screen without a reported crash:

- Rank: `S+`
- Final score: `60737`
- Maximum combo: `3.5x`
- Objectives: `3/3`
- Landmarks: `2/2`
- Substations: `1/3`
- Bonus challenges: `2/3`
- Blocks cleared: `29`
- Chain reactions: `4`
- Media moments: `18`
- Footage bonus: `+2783`

### Immersive fullscreen pass

- Tested commit: `3bdbf528fd5ed48448299e3a2098b957154f1b20`
- GitHub Actions run: `30682005730` (`Build Android Debug APK #28`)
- Artifact: `severe-weather-v4.4.0-illustrated-storm-28`
- Device: Galaxy S26 Ultra
- User verdict: `It's good`

The persistent landscape status bar is accepted as resolved on the target device. System bars may be revealed temporarily by swipe and the game reclaims immersive fullscreen afterward.

Full evidence is recorded in `Docs/RELEASE_ACCEPTANCE_v4.4.0.md`.

## Known evidence gaps

Still unproven:

- exact-commit CI for the authored four-stop world pass
- V5 campaign persistence across Android close and reopen
- meaningful four-stop visual distinction on the Galaxy S26 Ultra
- ordinary or older Android performance
- sustained heat and battery behavior
- repeated Grid Zap stress across many runs
- interruption and close/reopen persistence beyond fullscreen focus return
- full-scene toon shading performance

## Immediate next milestone

Close V5 as one release candidate rather than returning to incremental visual experiments:

1. Pass strict full-round and four-stop authored-world CI from the exact candidate commit.
2. Build a new debug APK from that commit.
3. Play the four stops on the Galaxy S26 Ultra and judge distinction, controls, performance, heat, battery, and sound.
4. Close and reopen the app to verify campaign persistence.
5. Correct only release-blocking findings before merging V5.
