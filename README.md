# Severe Weather - Unity Production Starter

Severe Weather is a direct-control weather destruction action RPG set in a dense living urban-rural region.

The player is the storm. Unity is the production track; the HTML builds are preserved as a Mechanics Laboratory.

## Current production target

- Unity `6000.3.0f1`
- Universal Render Pipeline package with a deterministic lit Built-in device-lab baseline while authored URP assets remain an open gate
- Android first
- Unity Build Automation connected to GitHub `main`
- Future WebGL, desktop, console, and Switch-class targets remain later gates

## Production gameplay currently wired

- Direct-control Tornado and Supercell
- Distinct movement, positioning, and ability verbs
- Runtime-generated connected county graybox
- Viewport-contained County High and action-responsive Impact camera behavior
- Separate Tornado and Supercell framing profiles
- Mobile and desktop input
- Five-stage, material-aware damage
- Conductive network chaining
- Direction-aware crop, vegetation, vehicle, utility, and structural reactions
- Mobility-aware props, approximate mass, and wind response
- Capped temporary effects and material-shaped fragments
- Animated Supercell rain/hail and Tornado ground contact
- Collider-aware runtime density validation
- Immediate ability, target, impact-stage, FX, fragment, camera, performance, graphics, and build telemetry
- Deterministic scene generation and Android player settings

Damageable targets move through:

`Intact -> Stressed -> Damaged -> Critical -> Destroyed`

This remains a procedural laboratory slice, not final art or a production-ready game.

## Source-present experiments

The repository also contains experimental July 29 source for Derecho, EF score/rating progression, a NOAA/EAS banner, invincible animals, and a power-substation cascade.

These files are not currently integrated into the production loop:

- `GameBootstrap` still switches only Tornado and Supercell.
- Derecho is never instantiated.
- EF and NOAA systems are never created.
- Animals and cascade components are not attached to the generated region.
- No supplied Unity build validates these additions.

The production roster therefore remains Tornado and Supercell until an explicit integration decision and successful build/device gates.

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

The repository is the canonical durable project record. Important conclusions become project truth only when committed with their evidence.

## Controls

Desktop:

- WASD or arrow keys: move
- Space: hold primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: switch Tornado/Supercell

Android Build #5.2:

- Drag in the lower-left capture area to create a floating joystick.
- Movement is camera-relative.
- Hold `PULL` or `HAIL`.
- Tap `GUST` or `FRONT`.
- Tap `ZAP` or `GRID`.
- Tap the top-center storm button to switch storm.
- Use the mixed-material lane near spawn to compare staged reactions.
- Keep debug telemetry visible during the device gate.

## Cloud build

Unity Build Automation uses:

- repository: `lybyerc-lab/Severe-Warning`
- branch: `main`
- project subfolder: blank
- Unity: exact `6000.3.0f1`
- platform: Android APK
- pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- IL2CPP and ARM64
- Android minimum API 26
- Vulkan-only current device baseline
- debug signing and Library caching

The current pre-export method sets application version `0.1.9`, Android version code `9`, generated Standard/unlit runtime materials, build identity, production-slice scene, and quality defaults.

## Evidence status

- Build #1 compiled and installed but displayed a black screen.
- Build #2 rendered the graybox world.
- Build #3 proved touch registration but failed movement readability.
- Build #4 improved feedback but exposed a stationary storm root.
- Build #4.1 fixed translation.
- Build #4.2 passed the camera-foundation gate.
- Build #5 proved staged damage but failed impact readability.
- Build #5.1 corrected major crop/effect problems but still failed final presentation and lacked the five-minute stress record.
- Unity Build Automation successfully compiled and packaged Build #5.2 at commit `80f2f14`.
- Build #5.2 still lacks its complete physical Android acceptance record.
- Later July 29 source changes remain uncompiled and unverified by the supplied evidence.

See `CURRENT_STATUS.md` for the exact active gate.
