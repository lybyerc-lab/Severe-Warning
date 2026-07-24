# Severe Weather Current Status

Last updated: 2026-07-24
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Unity editor: `6000.3.0f1`
Primary target: Android

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
4. Current production documents in `Docs/`
5. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`
6. Frozen HTML Mechanics Laboratory

Important project decisions and test evidence must be committed to the repository. Chat is working context, not the durable source of truth.

## Tested baseline

- Initial production starter: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Android startup hotfix: `23e638f5dbfb0522f512209fa636a17147c6c7d1`
- Build #3 mobile-input commit: `32ec421528e75632bae793ba0569c8770baa0d42`
- Build #4 feel/render commit: `91ee1a257bbe8e771d73097c9c4a3c781c53c225`
- Unity Build Automation is connected to GitHub `main` and builds with Unity `6000.3.0f1`.
- Build #1 launched to a black screen.
- Build #2 rendered the generated region and allowed storm switching.
- Build #3 aligned mobile control hitboxes and confirmed joystick input registration.
- Build #4 added lit materials, shadows, visible action feedback, props, a starter interaction pocket, and a wider county backdrop.

## Build #4 physical evidence

Build #4 launched successfully on Android and displayed `B4 FEEL + RENDER LAB` with version `0.1.4`.

The physical screenshot recorded:

- `INPUT +1.00, 0.00`
- reported `SPEED 28.0`
- reported `DIST 123.7`
- actual `POS -121.8, 111.9`
- configured spawn `-122.0, 112.0`
- `FPS 60`
- render pipeline `Built-in`
- graphics API `Vulkan`

This proves touch input and commanded velocity were active, but the storm root stayed essentially at spawn. The speed and distance counters were measuring requested displacement rather than resolved world translation. Build #4 therefore fails the movement gate.

Visual presentation improved but still fails the target-quality gate because the tornado reads as stacked primitive layers, the debug HUD clips at compact landscape height, controls lack sufficient contrast, and the environment remains procedural graybox content.

## Active work: Build #4.1 motion and silhouette correction

Approved scope:

- make the storm root transform-authoritative and stop mixing `Rigidbody.MovePosition` with direct transform rotation
- measure actual resolved position delta for speed and distance telemetry
- display `MOTION OK` or `MOTION BLOCKED` from physical translation evidence
- apply the same correction to Tornado and Supercell movement
- widen and slow the camera leash so motion remains perceptible
- replace stacked tornado cylinders with overlapping smooth condensation lobes and a distinct dark core
- reduce oversized debris and contact-disk clutter
- fix HUD clipping and improve button/joystick contrast
- build only the material templates used by the active Built-in lab pipeline
- use Vulkan only for this device gate to reduce duplicate shader work
- bump application version to `0.1.5` and Android version code to `5`
- update repository memory in the same commit

Explicitly outside Build #4.1:

- production environment art packs
- final audio
- missions, progression, economy, or menus
- third storm
- full building-fracture prefabs
- full Unity `.meta` migration
- asynchronous region generation
- final authored URP pipeline asset and production post-processing

## Build #4.1 physical acceptance gate

1. Confirm `B4.1 MOTION + SILHOUETTE LAB` and version `0.1.5` are visible.
2. Hold full right input for two seconds.
3. Confirm X or Z position changes by at least 35 world units.
4. Confirm `ACTUAL` speed approaches 28 for Tornado.
5. Confirm `DIST` matches the real position change rather than increasing while position is frozen.
6. Confirm the HUD says `MOTION OK`, never `MOTION BLOCKED`, during valid steering.
7. Confirm the storm visibly crosses its camera leash before the camera follows.
8. Repeat with Supercell and confirm slower, heavier translation.
9. Confirm Tornado silhouette no longer reads as a stack of flat cylinders.
10. Confirm HUD text fits without clipping and all controls remain readable.
11. Confirm abilities and storm switching still function.
12. Record frame pacing, heat, and any new defects in `Docs/DEVICE_TEST_LOG.md`.

## Known open issues after Build #4.1

- The world remains procedural graybox geometry rather than production art.
- The project still needs a committed authored URP asset strategy.
- Runtime region generation remains synchronous.
- Persistent authored Unity assets still require `.meta` migration.
- Final audio, destruction assets, profiling, and broader device coverage remain open gates.
