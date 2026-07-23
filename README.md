# Severe Weather - Unity Production Starter

Severe Weather is a direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. The HTML prototype is preserved as a frozen Mechanics Laboratory; Unity is the production track.

## Current production target

- Unity `6000.3.0f1`
- Universal Render Pipeline
- Android first
- Unity Build Automation connected to GitHub `main`
- Future WebGL, desktop, console, and Switch-class targets remain later gates

## What is included

- Runtime bootstrapping that creates a playable graybox region from an empty scene
- Direct-control Tornado and Supercell implementations
- Distinct Supercell verbs: Hail Swath, Gust Front, and Electrical Network
- Hybrid County High and Impact camera behavior
- Mobile and desktop input
- Material-aware damage and conductive network chaining
- Wind-reactive props
- Runtime density validation
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
6. Other current production documents in `Docs/`
7. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md` for historical context

The repository is the canonical durable project record. Important chat conclusions must be committed before they are treated as persistent project truth.

## Current mobile controls

Desktop:

- WASD or arrow keys: move
- Space: primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: switch Tornado/Supercell

Android Build #3 input laboratory:

- Start a drag in the lower-left control area to create a floating joystick.
- Movement is camera-relative.
- Hold the large right button for Suction or Hail Swath.
- Tap the left companion button for Gust or Gust Front.
- Tap the middle companion button for Lightning or Electrical Network.
- Tap the top-center storm button to switch storm.
- Temporary MOVE and POS telemetry verifies input and translation on-device.

## Cloud build

Unity Build Automation uses:

- repository: `lybyerc-lab/Severe-Warning`
- branch: `main`
- project subfolder: blank
- Unity version: auto-detect exact `6000.3.0f1`
- platform: Android
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- debug signing for device-test APKs

## Honest status

- Build #1 compiled and installed but displayed a black screen.
- The focused startup hotfix added a guaranteed runtime shader, early camera creation, and on-screen startup diagnostics.
- Build #2 compiled, installed, rendered the graybox world, and switched between Tornado and Supercell.
- Build #2 physical testing exposed movement and ability-hitbox defects.
- Build #3 is the focused mobile-control alignment pass.

This remains a production architecture and graybox starter, not final art or a production-ready game.
