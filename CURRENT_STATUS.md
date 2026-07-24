# Severe Weather Current Status

Last updated: 2026-07-23
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

- Initial production starter commit: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Android startup hotfix commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`
- Build #3 mobile-input commit: `32ec421528e75632bae793ba0569c8770baa0d42`
- Unity Cloud Build Automation is connected to `main`.
- Build #1 compiled and installed but launched to a black screen.
- Build #2 rendered the generated county graybox and allowed storm switching.
- Build #3 confirmed that mobile touch input, joystick telemetry, and position updates were registering.
- Build #3 failed the physical feel gate because the camera immediately followed the storm, so movement was not perceptible.
- Build #3 failed the visual-quality gate because the runtime used flat unlit materials, the opening area was a weak interaction test zone, and storm actions lacked visible feedback.

## Active work: Build #4 feel and render recovery

Approved scope:

- soft-leash camera that allows visible on-screen storm travel
- increased and differentiated Tornado and Supercell travel response
- speed, distance, build identity, graphics API, render-pipeline, and action telemetry
- guaranteed Standard and URP material templates during pre-export, using the stable lit built-in pipeline for Build #4 while the authored URP asset gate remains open
- lit world materials, soft shadows, fog, ambient lighting, and 2x MSAA
- transparent layered storm visuals, contact shadows, motion trails, and visible internal rotation
- immediate action rings, swaths, arcs, lightning paths, target counts, and no-target feedback
- collider-backed crops and a deliberate starter interaction pocket
- larger backdrop terrain and distant hills to remove black world edges
- mobility classes, approximate mass, pre-destruction prop release, and wind/physics conflict protection
- collider-aware density validation
- throttled passive-field and camera target queries
- deterministic Android settings: version `0.1.4`, version code `4`, IL2CPP, ARM64, Vulkan with OpenGLES3 fallback
- repository-memory updates in the same patch

Explicitly outside Build #4:

- production environment asset packs
- final audio
- missions, progression, economy, or menus
- third storm
- full building-fracture prefabs
- camera orbit controls
- full Unity `.meta` migration
- asynchronous region generation and loading-screen architecture

## Build #4 physical acceptance gate

On the physical Android device:

1. Confirm `B4 FEEL + RENDER LAB` and version `0.1.4` are visible.
2. Confirm the opening view contains road markings, crops, a small building, a vehicle, a tree, and a conductive power pole.
3. Confirm no black world edge is visible during normal navigation.
4. Hold full joystick input for two seconds and confirm the Tornado visibly crosses the screen before the camera leash follows.
5. Confirm Tornado speed approaches 28 world units per second and distance telemetry increases.
6. Repeat with Supercell and confirm it is slower and heavier.
7. Confirm PULL/HAIL, GUST/FRONT, and ZAP/GRID each show distinct immediate visual feedback.
8. Confirm no-target lightning does not consume its resource and reports `NO CONDUCTIVE TARGET`.
9. Confirm crops bend, darken, and can be released physically.
10. Confirm a vehicle can rock or slide under a strong gust before total destruction.
11. Confirm the tornado and supercell visibly animate while stationary.
12. Confirm lit materials, shadows, fog, transparency, graphics API, and render-pipeline telemetry work on the device.
13. Confirm frame rate remains near 60 and does not remain below 45 in the starter pocket.
14. Run for five minutes and record heat, stutter, control clarity, and any visual defects.
15. Append the exact result to `Docs/DEVICE_TEST_LOG.md` before approving the build.

## Known open issues after Build #4

- Runtime region generation remains synchronous.
- World content remains procedural graybox geometry rather than production art assets.
- Unity `.meta` files for persistent authored assets are not yet committed.
- Final audio, VFX, destruction prefabs, profiling, and device-matrix coverage remain future gates.
