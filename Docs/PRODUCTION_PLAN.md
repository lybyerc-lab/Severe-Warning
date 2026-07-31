# HTML Mobile Production Plan

## Phase 0 - Gameplay reference

- preserve v3.0.0 as the stable pre-district reference in Git history
- complete the v3.1.0 three-district arcade slice
- complete the v3.2.0 news-crew and storm-chaser coverage loop
- verify startup, full-run completion, replay reset, and responsive landscape layout

## Phase 1 - Human browser acceptance

- play Tornado manually across all three districts
- confirm movement, camera distance, ability timing, challenge clarity, coverage cadence, crew readability, humor, and replay desire
- tune the County Fair sequence only from observed play rather than automated score totals

## Phase 2 - Android wrapper proof

- [x] create a minimal Capacitor 8 Android shell
- [x] bundle the HTML, JavaScript, and fonts locally
- [x] lock sensor-landscape orientation and immersive fullscreen behavior
- [x] add safe pause/resume timing and local-only web security settings
- [ ] build a debug APK without paid cloud-build services on a permitted Android build machine

## Phase 3 - Physical-device acceptance

- install on the target Android phone
- verify joystick ownership and simultaneous action-button touches
- verify audio initialization, focus, pause/resume, and mute behavior
- verify localStorage cosmetic persistence across close/reopen
- record sustained FPS, heat, battery use, and WebGL context behavior
- test at least one complete three-minute run and one retry

The current work PC cannot install the Android Studio/SDK/JDK toolchain under company policy. Phase 2 native compilation and all Phase 3 checks must occur on a permitted personal or managed build machine; the repository handoff is in `Docs/ANDROID_PACKAGING.md`.

## Phase 4 - One-town content proof

- improve district-specific building silhouettes and signage
- add district-aware reporter lines only after the current event-driven headlines remain readable in human play
- expand environmental comedy without targeting people
- add varied destruction sounds and reduce repetition
- add one additional challenge variant per district only if current challenges remain readable
- preserve Tornado, Supercell, and Derecho mechanical differences

## Phase 5 - Campaign decision

Expand beyond the first fictional town only when browser and Android playtests show that players want another run. Additional towns must provide distinct landmarks, props, hazards, visual identity, and challenge combinations rather than merely recoloring the same block.

## Production release gate

No Android-ready claim until:

- the bundled app works offline
- touch controls remain comfortable for a complete run
- the game resumes safely after interruption
- saves and the cosmetic unlock survive close/reopen
- frame pacing, heat, battery, and sound are acceptable on the real phone
- the game remains funny and replayable after repeated runs
- the last verified HTML release remains recoverable
