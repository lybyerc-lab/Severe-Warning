# Severe Weather

Severe Weather is a mobile-first, single-player arcade destruction game. The player directly controls a tornado, supercell, or derecho across stylized town and city districts.

The active game is the HTML/WebGL build at `MechanicsLab/SevereWeather_3D_Lab.html`. The planned Android path is to package this game in a local native web wrapper while preserving offline play and the existing browser feel.

## Current gameplay baseline

Version `3.2.0 Live Coverage Edition` contains:

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
- `Docs/`: product direction, decisions, validation history, and historical checkpoints
- `Godot/`: preserved migration experiment
- `Assets/`, `Packages/`, `ProjectSettings/`: preserved Unity implementation history
- `Tools/validate_project.py`: repository structure and source validation

## Current evidence

Automated browser testing of v3.2.0 completed a full Tornado run at approximately 60 FPS with all three district challenges, both landmarks, all three sequential substations, eight captured media moments, a `+1289` footage bonus, and a successful mobile retry. The results card and controls fit an `844x390` mobile-landscape viewport. This is not a substitute for physical Android acceptance.

Read `CURRENT_STATUS.md` and `Docs/DECISION_LOG.md` before planning implementation work.
