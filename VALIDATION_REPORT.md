# Validation Report

Last updated: 2026-07-24

## Proven gates

- Required project files present
- Unity package manifest parses as JSON
- URP and Input System dependencies declared
- Namespace, brace-balance, and tab checks pass through `Tools/validate_project.py`
- SHA-256 project inventory is maintained
- Unity `6000.3.0f1` restored packages and compiled the project in Unity Build Automation
- Production slice scene generated through the configured pre-export method
- Android APKs built successfully through Unity Cloud
- APK installed and launched on a physical Android device
- Build #2 proved the startup hotfix renders the generated region and HUD
- Build #3 proved mobile input registration and storm switching
- Build #4 physical telemetry isolated a movement-authority defect
- Build #4.1 physical testing proved transform-authoritative Tornado and Supercell translation works on Android
- Build #4.1 confirmed the Supercell movement speed is appropriate

## Build #4.1 physical result

Build #4.1 compiled, packaged, installed, launched, and moved both storm roots correctly on the physical device. Input, actual speed, position, and distance telemetry agreed. The movement defect is therefore closed.

Physical testing also found:

- the fast Tornado can leave camera range before the world-space leash catches up
- the Supercell cloud mass fills too much of the view
- roads, buildings, targets, and the ground footprint can become obscured
- world-space leash distance alone is not a sufficient camera-safety contract

## Build #4.2 validation intent

The current candidate adds:

- separate Tornado and Supercell navigation and impact distances
- a smaller Tornado leash with speed-scaled catch-up
- viewport-aware soft containment
- immediate hard screen-edge recovery
- `CAM SAFE`, `CAM CATCHUP`, and `CAM RECOVER` telemetry
- wider and higher Supercell framing
- smaller, flatter shelf-cloud lobes
- a dark central Supercell updraft core
- a visible trailing rain and hail core
- preserved Tornado and Supercell movement speeds
- compact device-lab HUD updates
- application version `0.1.6` and Android version code `6`
- Vulkan-only Android device-lab output
- repository-memory updates in the same patch

## Static checks required before commit

- exact base commit is `96c9f780daf070648dc69a7f6cd431233b85617a`
- changed paths match the reviewed Build #4.2 scope
- no unexpected untracked files
- `git diff --cached --check` passes
- `sha256sum -c SHA256SUMS.txt` passes
- `python Tools/validate_project.py` passes
- camera source contains viewport containment and hard recovery
- Tornado speed values remain unchanged
- Supercell speed values remain unchanged
- application version and Android version code are correct

## Gates still open

- Build #4.2 Unity compilation
- Build #4.2 Android APK generation
- physical validation that the Tornado never remains off-screen
- physical validation of soft catch-up and hard recovery behavior
- physical validation that the Supercell fits the frame and preserves world readability
- five-minute frame pacing and thermal test
- staged or asynchronous startup generation
- Unity `.meta` file migration for authored assets
- production environment assets, final materials, VFX, audio, destruction prefabs, and broader profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
