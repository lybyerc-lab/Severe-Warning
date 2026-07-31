# HTML Mobile Production Plan

## Phase 0 - Gameplay reference

- preserve v3.0.0 as the stable pre-district reference in Git history
- complete the v3.1.0 three-district arcade slice
- complete the v3.2.0 news-crew and storm-chaser coverage loop
- complete the v3.3.0 district-topography and graphics-depth pass
- complete the v3.3.1 county-edge, damage-scar, road-routing, and commercial-silhouette cleanup
- complete the v4.0.0 Living County authored-block, staged-destruction, and chain-reaction pass
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
- [x] build a debug APK without paid cloud-build services through GitHub Actions

## Phase 3 - Physical-device acceptance

- [x] install v3.2.0 on the target Galaxy S26 Ultra
- [x] complete one full Tornado run with HTML-equivalent look and play
- verify joystick ownership and simultaneous action-button touches after each input change
- verify audio initialization, focus, pause/resume, and mute behavior
- verify localStorage cosmetic persistence across close/reopen
- record sustained FPS, heat, battery use, and WebGL context behavior
- [x] test at least one complete three-minute run
- test one retry, one close/reopen persistence cycle, and one airplane-mode run on the current release candidate

The current work PC cannot install the Android Studio/SDK/JDK toolchain under company policy. GitHub Actions is the proven debug-build machine; physical installation and acceptance remain manual device-security steps. The repository handoff is in `Docs/ANDROID_PACKAGING.md`.

## Phase 4 - One-town content proof

- [x] replace the flat board with district-specific elevation, terrain-following roads, contour cues, and a drainage creek
- [x] introduce varied Main Street offices and industrial warehouse silhouettes
- [x] replace random structure scatter with authored blocks and district-specific homes, storefronts, barns, workshops, vegetation, and signage
- [x] add readable pre-collapse damage stages, block-clear bonuses, and four chain-reaction businesses
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
