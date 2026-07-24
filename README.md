# Severe Weather - Unity Production Starter

Severe Weather is a direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. The HTML prototype is preserved as a frozen Mechanics Laboratory; Unity is the production track.

## Current production target

- Unity `6000.3.0f1`
- Universal Render Pipeline package with a deterministic lit built-in device-lab baseline while the authored URP asset gate remains open
- Android first
- Unity Build Automation connected to GitHub `main`
- Future WebGL, desktop, console, and Switch-class targets remain later gates

## What is included

- Runtime bootstrapping that creates a playable procedural county test region from an empty scene
- Direct-control Tornado and Supercell implementations
- Distinct Tornado and Supercell verbs
- Viewport-contained County High and action-responsive Impact camera behavior
- Separate Tornado and Supercell framing profiles
- Mobile and desktop input
- Material-aware five-stage damage and conductive network chaining
- Mobility-aware props, approximate mass, and wind response
- Material-colored impact bursts and recent-impact telemetry
- Animated Supercell rain and hail curtains with ground mist
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

Android Build #5 impact and destruction laboratory:

- Start a drag in the lower-left control area to create a floating joystick.
- Movement is camera-relative.
- The storm root uses transform-authoritative motion and reports actual resolved speed.
- The camera uses a soft world-space leash plus screen-space containment.
- Hold `PULL` or `HAIL` for the primary ability.
- Tap `GUST` or `FRONT` for the secondary ability.
- Tap `ZAP` or `GRID` for the tertiary ability.
- Tap the top-center storm button to switch storm.
- Attack the mixed-material target lane near the initial spawn to compare staged reactions.
- INPUT, POS, ACTUAL speed, DIST, FPS, camera state, target count, recent impact stage, render pipeline, graphics API, build version, and commit telemetry remain visible during the device gate.

## Damage stages

Damageable targets move through:

`Intact -> Stressed -> Damaged -> Critical -> Destroyed`

Crop, vegetation, glass, wood, metal, vehicles, infrastructure, and masonry use different deformation, release, resistance, and collapse behavior. Structural targets collapse in place during this laboratory pass rather than becoming single weightless rigidbodies.

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

The pre-export method sets application version `0.1.7`, Android version code `7`, IL2CPP, ARM64, Vulkan-only device-lab rendering, generated built-in runtime materials, build identity, the production-slice scene, and quality defaults.

## Honest status

- Build #1 compiled and installed but displayed a black screen.
- Build #2 rendered the graybox world and switched between Tornado and Supercell.
- Build #3 confirmed mobile input registration but failed movement readability and visual-quality gates.
- Build #4 improved lighting and feedback, but physical testing proved the storm root stayed at spawn.
- Build #4.1 fixed actual translation and passed the movement gate.
- Build #4.2 improved screen-space camera containment and reframed the Supercell without reducing either storm speed.
- Build #5 is the first focused impact and staged-destruction laboratory.

This remains a production architecture and procedural lab slice, not final art or a production-ready game.
