# Severe Weather

Severe Weather is a mobile-first, single-player arcade destruction game. The player directly controls a tornado, supercell, or derecho across stylized town and city districts.

The active game is the HTML/WebGL build at `MechanicsLab/SevereWeather_3D_Lab.html`. A Capacitor 8 Android wrapper now packages that exact game and its fonts locally while preserving offline play and the existing browser feel.

## Current gameplay baseline

Version `3.3.0 High Country Edition` contains:

- three-minute single-player warning runs
- Pine Ridge, Main Street, and County Fair districts
- Tornado, Supercell, and Derecho storm classes
- mobile joystick and three action buttons
- pulled-back tactical camera and movement look-ahead
- score, combo, EF progression, objectives, radar, and results
- buildings, landmarks, power infrastructure, persistent ruins, and invincible airborne animals
- distinct news vans and storm-chaser SUVs that film destruction, retreat from danger, and never act as enemies or targets
- camera flashes, live reporting chatter, captured-footage scoring, media radar markers, and an end-of-run coverage recap
- thirteen destructible comedy props with slapstick callouts
- one randomized bonus challenge per district
- sequential County Fair substation finale
- persistent Neon Funnel cosmetic unlock
- deterministic browser playtest mode through `?bot=true`
- district-shaped elevation: Pine Ridge, the Main Street rise, rolling County Fair ground, and an eastern drainage creek
- terrain-following roads, shoulders, lane markings, structures, storm effects, animals, and media crews
- GPU-instanced road markings, low-cost ridge silhouettes, contour cues, and stormier color/lighting treatment

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

Automated browser testing of v3.2.0 completed a full Tornado run at approximately 60 FPS with all three district challenges, both landmarks, all three sequential substations, eight captured media moments, a `+1289` footage bonus, and a successful mobile retry. The offline bundle also passed a separate `844x390` mobile-landscape layout check with local fonts loaded and no document overflow.

GitHub Actions compiled the v3.2.0 debug APK successfully. The APK installed on a Galaxy S26 Ultra, looked and played like the HTML build, and completed a full Tornado run with an `S+` rank, score `23621`, all objectives, both landmarks, all substations, all district bonuses, seventeen media moments, and the Neon Funnel unlock. This proves the Capacitor strategy on the primary high-end test phone; it does not represent a broad Android device matrix.

The current v3.3.0 source adds the graphics and terrain pass after that Android proof. Its full automated Tornado run held approximately 60 FPS, produced an `S+` with score `23016`, completed every objective/landmark/substation/district bonus, retried cleanly, and emitted no observed console warnings or errors. It must receive a new APK/device check before being called the physically accepted Android release.

Read `CURRENT_STATUS.md` and `Docs/DECISION_LOG.md` before planning implementation work.
