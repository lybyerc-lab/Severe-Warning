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
- Build #4.2 camera/Supercell commit: `fd54c7c2b0764e8e4b301700caba997a27b08378`
- Unity Build Automation is connected to GitHub `main` and builds with Unity `6000.3.0f1`.

## Build #4.2 physical evidence

Build #4.2 launched successfully on Android and displayed `B4.2 CAMERA + SUPERCELL LAB` with version `0.1.6`.

Confirmed on the physical device:

- Tornado and Supercell movement remain functional.
- Tornado camera containment is improved.
- The camera transition between Tornado and Supercell is improved.
- The complete Supercell fits in the navigation frame.
- Roads, buildings, targets, and the Supercell ground footprint remain readable.
- Frame telemetry remained near 60 FPS in the captured scene.

New physical finding:

- The Supercell precipitation placeholder is still an opaque blue cylinder and reads as a silo rather than rain and hail.
- Existing targets darken and collapse, but impacts still lack a clear staged material response and readable hit feedback.
- The world and storm visuals remain procedural laboratory geometry rather than production art.

Build #4.2 passes the movement and camera-foundation gate. The next approved phase is impact readability and staged destruction.

## Active work: Build #5 impact and destruction laboratory

Approved scope:

- replace the Supercell blue precipitation cylinder with animated rain and hail streaks plus low ground mist
- add shared `Intact`, `Stressed`, `Damaged`, `Critical`, and `Destroyed` stages
- make crop, vegetation, glass, wood, metal, vehicle, infrastructure, and masonry reactions visibly different
- add throttled material-colored impact bursts and critical-stage rings
- keep structural targets from becoming weightless whole-building rigidbodies at collapse
- add a compact mixed-material impact lane near the initial spawn
- preserve Build #4.2 movement speeds and camera behavior
- add device telemetry for the most recent material and damage stage
- bump application version to `0.1.7` and Android version code to `7`
- update repository memory in the same commit

Explicitly outside Build #5:

- a third storm
- missions, progression, economy, or menus
- final environment art packs
- final audio
- authored fracture meshes and production destruction prefabs
- authored URP pipeline migration
- asynchronous region generation
- people or casualty simulation

## Build #5 physical acceptance gate

1. Confirm `B5 IMPACT + DESTRUCTION LAB` and version `0.1.7` are visible.
2. Confirm the blue Supercell cylinder is gone.
3. Confirm rain and hail streaks visibly fall beneath and behind the Supercell without obscuring the world.
4. Confirm low mist remains near the ground footprint.
5. Attack the mixed-material starter lane with Tornado suction, gust, and lightning.
6. Attack the same lane with Supercell hail, gust front, and electrical network.
7. Confirm the HUD reports material and stage transitions such as `IMPACT Glass Damaged`.
8. Confirm crops flatten, vegetation leans or falls, glass compresses/shatters, metal deforms/releases, and masonry resists longer.
9. Confirm structural buildings collapse in place rather than launching as single weightless blocks.
10. Confirm vehicles rock, slide, tip, and release before destruction.
11. Confirm abilities and storm switching remain functional.
12. Confirm camera containment remains stable during impacts.
13. Record frame pacing, heat, object spam, and any new defects in `Docs/DEVICE_TEST_LOG.md`.

## Known open issues after Build #5

- Procedural primitives are still stand-ins for authored production assets.
- The project still needs a committed authored URP asset strategy.
- Runtime region generation remains synchronous.
- Persistent authored Unity assets still require `.meta` migration.
- Final audio, fracture assets, pooling, profiling, and broader device coverage remain open gates.
