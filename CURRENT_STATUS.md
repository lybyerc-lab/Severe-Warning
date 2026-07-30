# Severe Weather Current Status

Last updated: 2026-07-30
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Active engine: Godot `4.7.1-stable`
Primary language: GDScript
Primary target: Android
Godot project root: `Godot/`

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/GODOT_MIGRATION_CHECKPOINT_2026-07-30.md`
4. `Docs/CONTEXT_CHECKPOINT_2026-07-30.md`
5. `Docs/TORNADO_TACTICAL_PRODUCT_DIRECTION.md`
6. `Docs/HTML_2_5_UNITY_PARITY_MATRIX.md`
7. Historical Unity implementation documents
8. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`

Important decisions and test evidence must be committed to the repository. Chat is working context, not durable project memory.

## Active engine decision

Production development has moved from Unity to Godot.

Unity source is preserved as a reference implementation and historical record. No new Unity gameplay work should occur while the Godot migration is active.

Godot `4.7.1-stable` with GDScript is the active production path. The Android-first foundation uses GDScript because Godot's current Android documentation still identifies C# Android export as experimental.

## Locked product direction

The engine changes. The game does not.

HTML 3D Lab v2.5 Tactical remains the authoritative gameplay, layout, pacing, comfort, and enjoyment reference.

The first production vertical slice remains Tornado and must include:

- pulled-back tactical camera and look-ahead
- comfortable mobile movement
- Pull, Gust, and Grid Zap
- generous destruction
- four readable districts
- score, combo, EF growth, timer, objectives, radar, and results
- persistent event-driven warning/news ticker
- safe storm chasers and captured-on-camera bonuses
- invincible flingable animals with safe landings
- opening broadcast and ending news recap
- improved tornado, landscape, destruction, atmosphere, audio, and aftermath
- people protected and off-limits

Physical Android testing remains authoritative.

## Godot foundation

The active Godot project contains:

- `Godot/project.godot`
- `Godot/scenes/main.tscn`
- `Godot/scripts/main.gd`

Current source foundation includes:

- Mobile rendering method
- landscape viewport configuration
- code-driven main scene
- tactical camera with velocity look-ahead
- Tornado movement
- Pull, Gust, and Grid Zap input actions
- three-minute timer
- score, combo, power, ticker, and HUD shell
- dense target block
- invincible flingable cow prototype
- safe storm-chaser visual placeholder

## Evidence status

The Godot foundation is source-only.

It has not yet been:

- parsed by Godot 4.7.1
- run in the Godot editor
- exported to Android
- installed on a physical device
- accepted for gameplay feel or performance

Do not describe it as compiled, playable, stable, or parity-complete until those gates pass.

## Preserved Unity status

The latest Unity checkpoint remains preserved at commit:

`98a576d926abdfa3345225a3959349f817f7cfde`

The Unity Tornado Tactical P1 source remains useful for reference values and system intent, but it is no longer the active build target.

## First Godot gate

1. Open `Godot/project.godot` in Godot `4.7.1-stable`.
2. Resolve every parser error.
3. Run `Godot/scenes/main.tscn`.
4. Confirm Tornado movement and tactical camera comfort.
5. Confirm Pull, Gust, and Grid Zap inputs fire.
6. Confirm ticker and HUD remain readable in landscape.
7. Confirm the cow can be flung without harm.
8. Add touch joystick and action buttons.
9. Commit an Android export preset.
10. Export and install the first Android APK.
11. Compare directly with HTML 2.5 on the same device.

## Known foundation limitations

- primitive visuals only
- keyboard controls only at the first checkpoint
- Pull is currently a feedback shell, not full orbit physics
- Grid Zap is currently a feedback/scoring shell, not a conductive chain
- target destruction is not yet implemented
- cow safe-landing and reset need a dedicated controller
- chaser is visual-only
- no Android export preset yet
- no Godot parser or headless validation has run
- final four-district county, objectives, radar, broadcast sequences, production audio, and authored graphics remain missing

## Immediate next action

Open the Godot project in `4.7.1-stable`, run the main scene, and capture the complete parser/runtime result before adding more systems.
