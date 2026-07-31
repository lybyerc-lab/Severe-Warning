# Severe Weather

Severe Weather is a mobile-first, single-player arcade destruction game. The player directly controls a tornado, supercell, or derecho across stylized town and city districts.

The active game is the HTML/WebGL build at `MechanicsLab/SevereWeather_3D_Lab.html`. The planned Android path is to package this game in a local native web wrapper while preserving offline play and the existing browser feel.

## Current gameplay baseline

Version `3.1.0 Storm Town Rampage Slice` contains:

- three-minute single-player warning runs
- Pine Ridge, Main Street, and County Fair districts
- Tornado, Supercell, and Derecho storm classes
- mobile joystick and three action buttons
- pulled-back tactical camera and movement look-ahead
- score, combo, EF progression, objectives, radar, and results
- buildings, landmarks, power infrastructure, persistent ruins, storm chasers, and invincible airborne animals
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
- Humor comes from fictional signs, props, weather reporting, vehicles, animals with safe landings, and environmental slapstick.
- Physical Android testing is authoritative for touch comfort, performance, heat, battery, audio, and final readability.

## Repository layout

- `MechanicsLab/`: active HTML game and preserved browser experiments
- `Docs/`: product direction, decisions, validation history, and historical checkpoints
- `Godot/`: preserved migration experiment
- `Assets/`, `Packages/`, `ProjectSettings/`: preserved Unity implementation history
- `Tools/validate_project.py`: repository structure and source validation

## Current evidence

Automated browser testing of v3.1.0 completed a full Tornado run at approximately 60 FPS with no browser warnings or errors. It verified all three district challenges, both landmarks, all three sequential substations, the Neon Funnel unlock, replay reset, and an `844x390` mobile-landscape layout. This is not a substitute for physical Android acceptance.

Read `CURRENT_STATUS.md` and `Docs/DECISION_LOG.md` before planning implementation work.
