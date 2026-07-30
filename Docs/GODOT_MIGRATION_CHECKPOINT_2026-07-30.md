# Severe Weather Godot Migration Checkpoint

Date: 2026-07-30
Status: ACTIVE ENGINE MIGRATION
Repository: `lybyerc-lab/Severe-Warning`
Godot project root: `Godot/`
Target engine: Godot `4.7.1-stable`
Primary language: GDScript
Primary platform: Android
Authoritative gameplay reference: HTML 3D Lab v2.5 Tactical

## Engine decision

Production development moves from Unity to Godot.

The Unity source remains preserved as a reference implementation and historical record. It is no longer the active production path unless a measured blocker forces the decision to be revisited.

This is a rewrite of the production implementation, not an automatic conversion of Unity scenes or C# components.

## Why GDScript

The Android-first project uses GDScript for the migration foundation. Godot's stable Android documentation still describes C# Android export as experimental, so the initial production path avoids that risk.

## Preserved product direction

The engine changes. The game does not.

The following remain locked:

- player is the storm
- Tornado is the first complete vertical slice
- HTML 2.5 defines comfort, pacing, layout, and enjoyment
- pulled-back tactical camera
- direct Pull, Gust, and Grid Zap actions
- generous destruction
- score, combo, EF growth, timer, objectives, radar, and results
- persistent warning/news ticker
- storm chasers and captured-on-camera bonuses
- invincible flingable animals
- four readable districts
- people protected and off-limits
- physical Android testing is authoritative

## Godot foundation added

The `Godot/` directory now contains:

- `project.godot`
- `scenes/main.tscn`
- `scripts/main.gd`

The foundation currently provides source for:

- Godot Mobile rendering method
- landscape project orientation
- code-driven main scene
- tactical camera with velocity look-ahead
- Tornado movement
- Pull, Gust, and Grid Zap inputs
- three-minute timer
- score, combo, power, ticker, and HUD shell
- dense target block
- conductive-action placeholder scoring
- invincible flingable cow prototype
- safe storm-chaser visual placeholder
- Android-oriented 1280x720 reference viewport

## Evidence status

The Godot foundation has been written to source control.

It has not yet been:

- parsed by Godot 4.7.1
- run in the Godot editor
- exported to Android
- installed on a physical device
- accepted for gameplay feel or performance

Do not describe it as compiled, playable, stable, or parity-complete until those gates pass.

## Migration sequence

1. Open `Godot/project.godot` in Godot 4.7.1-stable.
2. Resolve every parser or runtime error.
3. Confirm the tactical camera and Tornado movement in desktop play mode.
4. Add touch joystick and action buttons.
5. Export the first Android APK.
6. Test on the same physical device used for HTML 2.5.
7. Match camera and movement comfort before expanding systems.
8. Port real destruction events, scoring, combo, EF growth, cow orbit/fling, ticker, and chaser logic.
9. Build the four-district county.
10. Add authored graphics, audio, weather, and aftermath.

## Unity preservation rule

Do not delete the Unity project during the first Godot migration gates.

Unity remains useful for:

- reference values
- damage tuning
- system names and intent
- comparison of prior experiments
- recovery if a migration detail was overlooked

No new Unity gameplay work should occur while the Godot migration is active.

## First Godot acceptance gate

The first Godot build must prove:

1. project opens without parser errors
2. main scene runs
3. Tornado moves comfortably
4. tactical camera remains readable
5. Pull, Gust, and Grid Zap inputs fire
6. ticker and HUD remain readable in landscape
7. cow launches and remains non-harmful
8. target block is immediately accessible
9. Android APK exports successfully
10. physical-device frame rate is measured

## Known foundation limitations

- primitive graphics only
- keyboard controls only at the first source checkpoint
- Pull behavior is currently a feedback shell rather than full orbit physics
- Grid Zap is currently a feedback/scoring shell rather than a real conductive chain
- target destruction is not yet implemented
- cow safe-landing and reset behavior require a dedicated controller
- chaser is visual-only at the first Godot checkpoint
- no Android export preset is committed yet
- no automated Godot parser or headless validation has run

## Next exact action

Install or open Godot 4.7.1-stable, load `Godot/project.godot`, run the main scene, and capture the complete parser/runtime result before expanding the migration.
