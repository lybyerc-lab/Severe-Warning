# Severe Weather - Unity Production Starter v0.1.0

This package begins the production track for **Severe Weather**, a direct-control weather destruction action RPG set in a dense living urban-rural region.

The HTML prototype is preserved as a mechanics laboratory. It is no longer treated as the final rendering or world-production pipeline.

## Target editor

- Unity 6.3 LTS
- Universal Render Pipeline
- Android first
- Future desktop, console, and Switch-class targets

## What is included

- A Unity project scaffold with URP and Input System package declarations
- Runtime bootstrapping that creates a dense playable graybox region from an empty scene
- Direct-control Tornado and Supercell implementations
- Distinct Supercell verbs: Hail Swath, Gust Front, and Electrical Network
- Hybrid County High and Impact camera behavior
- Material-aware damage and conductive network chaining
- Wind-reactive props
- Runtime density validation
- Editor menu tools that build and validate the production slice scene
- Production art, audio, level-design, and migration standards
- Frozen HTML mechanics laboratory reference

## First desktop setup

1. Install Unity Hub.
2. Install Unity 6.3 LTS with Android Build Support, Android SDK and NDK Tools, and OpenJDK.
3. Open this folder as a Unity project.
4. Wait for packages to resolve.
5. Use **Tools > Severe Weather > Create Production Slice Scene**.
6. Open `Assets/SevereWeather/Scenes/ProductionSlice.unity` if Unity does not open it automatically.
7. Enter Play Mode.
8. Use **Tools > Severe Weather > Validate Production Starter** before building.

## Controls in the starter scene

Desktop:

- WASD or arrow keys: move the storm
- Space: primary ability
- Q: secondary ability
- E: tertiary ability
- Tab: switch between Tornado and Supercell

Mobile:

- Drag on the left side: move
- Hold the large right-side zone: primary ability
- Tap the upper-right zone: secondary ability
- Tap the middle-right zone: tertiary ability
- Tap the storm label at top-center: switch storms

## Important status

This is a production architecture and graybox starter, not final art. It is designed to prevent further investment in the prototype renderer while preserving the mechanics and design discoveries already proven through playtesting.

Unity is not installed in the current chat execution environment, so the project could not be opened or compiled in the Unity Editor here. The C# source has been structurally validated, the project layout has been checked, and all runtime dependencies are declared. The first real compile and device build remain desktop-editor gates.

## Canonical design source

The ChatGPT project conversation remains the canonical design and decision record. The documents in `Docs/` mirror the current production direction so the project can survive tool and chat transitions.
