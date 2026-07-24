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
- Build #4.1 proved transform-authoritative Tornado and Supercell translation works on Android
- Build #4.2 proved camera containment and separate Supercell framing materially improve playability

## Build #4.2 physical result

Build #4.2 compiled, packaged, installed, launched, and preserved movement on the physical device. Camera behavior improved for both storms, and the Supercell now fits the frame with readable roads and buildings.

Physical testing also found:

- the Supercell rain and hail representation is still an opaque blue primitive cylinder
- target damage lacks strong material-specific stage readability
- collapse behavior is still too generic
- the current environment remains procedural laboratory content

## Build #5 validation intent

The current candidate adds:

- animated local-space rain and hail streaks under the Supercell
- low transparent precipitation mist instead of the blue cylinder
- five shared damage stages
- material-specific tint, deformation, release, and collapse behavior
- throttled impact bursts and critical-stage rings
- in-place structural collapse instead of whole-building launch behavior
- a mixed-material impact lane inside the starter interaction radius
- recent material and stage telemetry on the device HUD
- preserved Tornado and Supercell speeds
- preserved Build #4.2 viewport containment
- application version `0.1.7` and Android version code `7`
- repository-memory updates in the same patch

## Static checks required before commit

- exact base commit is `fd54c7c2b0764e8e4b301700caba997a27b08378`
- changed paths match the reviewed Build #5 scope
- no unexpected untracked files
- `git diff --cached --check` passes
- `sha256sum -c SHA256SUMS.txt` passes
- `python Tools/validate_project.py` passes
- Supercell source no longer creates `Rain and Hail Core` as a cylinder
- precipitation source contains `PrecipitationFieldAnimator`
- damage source contains all five `DamageStage` values
- damage source does not dynamically release structural collapse bodies
- Tornado speed remains `28f`
- Supercell speed remains `16.5f`
- application version and Android version code are correct

## Gates still open

- Build #5 Unity compilation
- Build #5 Android APK generation
- physical validation of precipitation readability
- physical validation of every material stage response
- physical validation that impact VFX do not cause sustained frame loss or excessive object allocation
- five-minute frame pacing and thermal test
- staged or asynchronous startup generation
- Unity `.meta` file migration for authored assets
- production environment assets, final materials, VFX, audio, destruction prefabs, pooling, and broader profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
