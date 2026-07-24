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
- Build #4.1 motion/silhouette commit: `96c9f780daf070648dc69a7f6cd431233b85617a`
- Unity Build Automation is connected to GitHub `main` and builds with Unity `6000.3.0f1`.

## Build #4.1 physical evidence

Build #4.1 launched successfully on Android and displayed `B4.1 MOTION + SILHOUETTE LAB` with version `0.1.5`.

Confirmed on the physical device:

- Tornado and Supercell both translate through the world.
- Input, actual speed, position, and distance telemetry agree.
- Supercell movement speed feels appropriately heavy.
- The movement-authority defect from Build #4 is resolved.
- The revised tornado silhouette is a clear improvement over the stacked-cylinder version.

New physical findings:

- The regular Tornado can outrun the camera and leave the visible frame.
- The Supercell cloud mass occupies too much of the screen and obscures roads, buildings, targets, and its own ground footprint.
- Camera recovery is based only on a world-space leash and does not enforce screen-space containment.
- The world and storm visuals remain procedural graybox quality and still require later production-art work.

Build #4.1 passes the movement gate but fails the camera-containment and Supercell-framing gates.

## Active work: Build #4.2 camera containment and Supercell framing

Approved scope:

- preserve existing Tornado and Supercell movement speeds
- add viewport-aware soft containment and hard screen-edge recovery
- make Tornado camera catch-up scale with actual storm speed
- reduce the Tornado world-space leash so the storm cannot disappear before recovery
- keep the Supercell camera response heavier than the Tornado camera
- increase Supercell camera distance and raise its focus point
- reduce and flatten Supercell cloud lobes into a broad shelf-cloud silhouette
- add a darker central updraft core and retain a visible rain/hail core
- add `CAM SAFE`, `CAM CATCHUP`, and `CAM RECOVER` device telemetry
- bump application version to `0.1.6` and Android version code to `6`
- update repository memory in the same commit

Explicitly outside Build #4.2:

- movement-speed reductions used to hide camera defects
- input-system changes
- new abilities or a third storm
- missions, progression, economy, or menus
- production environment art packs
- final audio
- full building-fracture prefabs
- authored URP pipeline migration
- asynchronous region generation

## Build #4.2 physical acceptance gate

1. Confirm `B4.2 CAMERA + SUPERCELL LAB` and version `0.1.6` are visible.
2. Drive the Tornado at full input in multiple directions for at least ten seconds.
3. Confirm the Tornado never leaves the visible screen.
4. Confirm the HUD normally reports `CAM SAFE`, briefly reports `CAM CATCHUP`, and uses `CAM RECOVER` only near a hard edge.
5. Confirm hard recovery returns the Tornado to frame immediately without a prolonged off-screen period.
6. Confirm Tornado speed remains approximately the Build #4.1 value rather than being reduced to mask the problem.
7. Switch to Supercell and confirm its movement speed remains appropriately heavy.
8. Confirm the complete Supercell silhouette fits comfortably in the view during navigation.
9. Confirm roads, buildings, targets, the rain core, and the ground footprint remain readable beneath or around the Supercell.
10. Confirm both storms remain controllable while the camera changes between navigation and impact framing.
11. Confirm abilities and storm switching still work.
12. Record frame pacing, heat, and any new defects in `Docs/DEVICE_TEST_LOG.md`.

## Known open issues after Build #4.2

- The world remains procedural graybox geometry rather than production art.
- The project still needs a committed authored URP asset strategy.
- Runtime region generation remains synchronous.
- Persistent authored Unity assets still require `.meta` migration.
- Final audio, destruction assets, profiling, and broader device coverage remain open gates.
