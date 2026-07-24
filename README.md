# Severe Weather - Unity Production Starter

Severe Weather is a direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. The HTML prototype is preserved as a frozen Mechanics Laboratory; Unity is the production track.

## Current production target

- Unity `6000.3.0f1`
- Universal Render Pipeline package with a deterministic lit built-in Build #4 baseline while the authored URP asset gate remains open
- Android first
- Unity Build Automation connected to GitHub `main`
- Future WebGL, desktop, console, and Switch-class targets remain later gates

## What is included

- Runtime bootstrapping that creates a playable procedural county test region from an empty scene
- Direct-control Tornado and Supercell implementations
- Distinct Supercell verbs: Hail Swath, Gust Front, and Electrical Network
- Soft-leash County High and action-responsive Impact camera behavior
- Mobile and desktop input
- Material-aware damage and conductive network chaining
- Mobility-aware props, approximate mass, and wind response
- Collider-aware runtime density validation
- Immediate ability feedback through rings, swaths, arcs, lightning paths, target counts, and no-target messages
- Cloud-generated lit material templates, build identity, and deterministic Android player settings
- Editor scene-generation and project-readiness tools
- Production art, audio, level-design, migration, and No-Drift standards
- Frozen HTML Mechanics Laboratory
- Persistent repository memory through current status, decisions, and device-test evidence

## Persistent project memory

Read these before planning work:

1. `CURRENT_STATUS.md`
2. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
3. `Docs/NO_DRIFT_POLICY.md`
4. `Docs/DECISION_LOG.md`
5. `Docs/DEVICE_TEST_LOG.md`
6. `Docs/UNITY_CLOUD_BUILD_SETTINGS.md`
7. Other current production documents in `Docs/`
8. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md` for historical context

The repository is the canonical durable project record. Important chat conclusions must be committed before they are treated as persistent project truth.

## Current mobile controls

Desktop:

- WASD or arrow keys: move
- Space: primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: switch Tornado/Supercell

Android Build #4.1 motion and silhouette laboratory:

- Start a drag in the lower-left control area to create a floating joystick.
- Movement is camera-relative.
- The storm root uses transform-authoritative motion and reports actual resolved speed.
- The storm can move visibly inside a wider, slower camera leash before the camera follows.
- Hold `PULL` or `HAIL` for the primary ability.
- Tap `GUST` or `FRONT` for the secondary ability.
- Tap `ZAP` or `GRID` for the tertiary ability.
- Tap the top-center storm button to switch storm.
- MOVE, POS, SPEED, DIST, FPS, target count, render pipeline, graphics API, build version, and commit telemetry remain visible during the device gate.

## Cloud build

Unity Build Automation uses:

- repository: `lybyerc-lab/Severe-Warning`
- branch: `main`
- project subfolder: blank
- Unity version: auto-detect exact `6000.3.0f1`
- platform: Android
- Android SDK availability: `35`
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- APK output and debug signing for device-test builds
- Library caching

The pre-export method sets application version `0.1.5`, Android version code `5`, IL2CPP, ARM64, Vulkan-only device-lab rendering, generated built-in runtime materials, build identity, the production-slice scene, and quality defaults.

## Honest status

- Build #1 compiled and installed but displayed a black screen.
- Build #2 rendered the graybox world and switched between Tornado and Supercell.
- Build #3 confirmed mobile input registration and position changes, but failed movement readability and visual-quality gates.
- Build #4 improved lighting, props, feedback, and framing, but physical testing proved the storm root stayed at spawn while intended speed and distance counters advanced.
- Build #4.1 fixes actual translation, makes telemetry honest, widens the camera leash, reduces shader-build scope, and replaces the stacked-cylinder tornado silhouette with overlapping condensation lobes.

This remains a production architecture and procedural lab slice, not final art or a production-ready game.
