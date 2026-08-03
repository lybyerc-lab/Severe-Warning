# Severe Weather

Severe Weather is a mobile-first, single-player arcade destruction game. The player directly controls a tornado, supercell, or derecho across stylized town and city districts.

The active game is the HTML/WebGL build at `MechanicsLab/SevereWeather_3D_Lab.html`. A Capacitor 8 Android wrapper now packages that exact game and its fonts locally while preserving offline play and the existing browser feel.

## Inherited gameplay baseline

Version `4.0.0 Living County Edition` contains:

- three-minute single-player warning runs
- Pine Ridge, Main Street, and County Fair districts
- Tornado, Supercell, and Derecho storm classes
- mobile joystick and three action buttons
- pulled-back tactical camera and movement look-ahead
- score, combo, EF progression, objectives, radar, and results
- buildings, landmarks, power infrastructure, persistent ruins, and invincible airborne animals
- distinct news vans and storm-chaser SUVs that film destruction, retreat from danger, stay on the road grid, and never act as enemies or targets
- camera flashes, live reporting chatter, captured-footage scoring, media radar markers, and an end-of-run coverage recap
- thirteen destructible comedy props with slapstick callouts
- one randomized bonus challenge per district
- sequential County Fair substation finale
- persistent Neon Funnel cosmetic unlock
- deterministic browser playtest mode through `?bot=true`
- district-shaped elevation: Pine Ridge, the Main Street rise, rolling County Fair ground, and an eastern drainage creek
- terrain-following roads, shoulders, lane markings, structures, storm effects, animals, and media crews
- GPU-instanced road markings, low-cost ridge silhouettes, restrained contour cues, and stormier color/lighting treatment
- an extended county terrain apron, softened under-road damage scars, layered road/creek surfaces, and varied office/warehouse silhouettes
- a 36-block authored county layout that replaces the old randomized building scatter
- recognizable homes, garages, porches, barns, storefronts, offices, workshops, windows, signs, chimneys, and rooftop equipment
- two visible damage stages before collapse, footprint-sized persistent rubble, and ballistic debris that bounces across the terrain
- block-clear bonuses and four optional chain-reaction businesses with collateral destruction, shockwaves, radar diamonds, and original local-news jokes

## Active V5 candidate

`v5.0.0 Heartland Campaign Foundation` layers a four-stop mobile campaign over the accepted destruction loop:

- television weather-map selection with locked progression
- persistent stars, best scores, run counts, selected stop, and furthest unlock
- Lincoln County, Prairie Junction, Grain Belt, and State Fair finale
- distinct road-safe terrain profiles, ground palettes, regional scenery, broadcasts, media rosters, challenges, and animal density
- eight destructible signature landmarks across the tour
- per-stop scoring targets and modifiers
- a monotonic three-minute warning clock that remains correct at low render rates
- deterministic structural verification and a mobile-landscape four-stop browser sweep

The candidate is not physically accepted until the exact APK passes on the Galaxy S26 Ultra, including close/reopen campaign persistence.

The design reference is the readable, humorous, replayable city-block destruction structure associated with classic arcade destruction games. This project must develop its own storms, districts, humor, names, art, and progression rather than copying another game's protected characters or assets.

## Product constraints

- Android landscape is the primary target.
- The game is single-player; multiplayer is out of scope.
- People remain protected and off-limits as targets.
- Humor comes from fictional signs, props, excitable local reporting, reckless-but-invincible storm chasers, animals with safe landings, and environmental slapstick.
- News crews and storm chasers are witnesses. They report, film, reposition, and retreat; the player is never rewarded for targeting them.
- Physical Android testing is authoritative for touch comfort, performance, heat, battery, audio, and final readability.

## Repository layout

- `MechanicsLab/`: active HTML game and preserved browser experiments
- `android/`: generated Capacitor Android Studio project
- `scripts/build-web.mjs`: deterministic offline web-bundle builder
- `Docs/`: product direction, decisions, validation history, and historical checkpoints
- `Godot/`: preserved migration experiment
- `Assets/`, `Packages/`, `ProjectSettings/`: preserved Unity implementation history
- `Tools/validate_project.py`: repository structure and source validation

## Current evidence

The V5 campaign foundation passed its structural verifier and the inherited strict full-round browser run passed all `11/11` required checks in 185 seconds with no browser errors. A local mobile-landscape authored-world sweep constructed all four stops with unique terrain, scenery, landmark, challenge, media, and density contracts and no page or console errors. Exact-commit CI and physical Android acceptance for the authored-world candidate remain pending.

Automated browser testing of v3.2.0 completed a full Tornado run at approximately 60 FPS with all three district challenges, both landmarks, all three sequential substations, eight captured media moments, a `+1289` footage bonus, and a successful mobile retry. The offline bundle also passed a separate `844x390` mobile-landscape layout check with local fonts loaded and no document overflow.

GitHub Actions compiled the v3.2.0 debug APK successfully. The APK installed on a Galaxy S26 Ultra, looked and played like the HTML build, and completed a full Tornado run with an `S+` rank, score `23621`, all objectives, both landmarks, all substations, all district bonuses, seventeen media moments, and the Neon Funnel unlock. This proves the Capacitor strategy on the primary high-end test phone; it does not represent a broad Android device matrix.

The v3.3.1 County Roads APK compiled in GitHub Actions and the user confirmed that it looked and played like the HTML build on a Galaxy S26 Ultra. The first v4.0.0 browser startup/visual pass rendered the authored blocks and richer structures at a reported 60-61 FPS with no observed console warnings or errors. The offline builder and inline-script parser also pass. A complete v4.0.0 bot run, retry check, synchronized APK build, and physical-device acceptance are still required before v4 is called stable.

Read `CURRENT_STATUS.md` and `Docs/DECISION_LOG.md` before planning implementation work.
