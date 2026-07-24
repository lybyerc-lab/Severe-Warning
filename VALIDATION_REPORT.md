# Validation Report

Last updated: 2026-07-24

## Proven gates

- Required project files present
- Unity package manifest parses as JSON
- URP and Input System dependencies declared
- Namespace, brace-balance, and tab checks pass through `Tools/validate_project.py`
- SHA-256 project inventory is maintained
- Unity `6000.3.0f1` restored packages and compiled prior candidates in Unity Build Automation
- Production slice scene generated through the configured pre-export method
- Android APKs built, installed, and launched on a physical Android device
- Build #4.1 proved transform-authoritative Tornado and Supercell translation
- Build #4.2 proved improved camera containment and Supercell framing
- Build #5 proved five-stage damage, material-stage telemetry, hail target detection, and precipitation-cylinder removal

## Build #5 physical result

Build #5 is a systems pass and presentation fail.

Physical screenshots proved:

- movement and camera behavior remained stable
- stage and material telemetry changed as targets were damaged
- Hail Swath detected multiple targets
- rain and hail streaks rendered
- crop collapse produced repeated dark upright slabs
- the hail rectangle remained visibly diagnostic
- generic line bursts and solid ground-contact geometry remained laboratory-quality
- Supercell geometry obscured the impact area during attacks

## Build #5.1 validation intent

The current candidate adds:

- force-direction capture for deformation and collapse
- kinematic ground-hugging crop destruction
- delayed and mass-clamped vegetation release
- lighter damage color treatment
- material-shaped temporary fragments
- an explicit cap of 18 transient effect roots and 42 fragments
- HUD FX and fragment counts
- falling hail and localized impacts without a rectangle
- animated Tornado dust arcs without a solid orange disk
- denser Supercell rain and low-opacity mist arcs without blue spheres
- lower-shelf Supercell fading during active abilities
- visual-only staged windows, roof, door, crossarm, and crown reactions
- application version `0.1.8` and Android version code `8`
- repository-memory updates in the same patch

## Static checks required before commit

- exact base commit is `d0b7f15927c082b960c034ccc11ae7abaaaf63c3`
- changed paths match the reviewed Build #5.1 scope
- no unexpected untracked files
- `git diff --cached --check` passes
- `sha256sum -c SHA256SUMS.txt` passes
- `python Tools/validate_project.py` passes
- Build #5.1 HUD and version strings are present
- Tornado and Supercell approved movement speeds remain unchanged
- crop collapse contains no 78-degree root rotation
- SupercellController no longer invokes `StormActionVfx.Swath`
- GameBootstrap no longer creates `Dust Contact Haze` or precipitation mist spheres
- effect and fragment capacities are present
- no new project files are introduced

## Gates still open

- Build #5.1 Unity compilation
- Build #5.1 Android APK generation
- physical validation of directional crop and vegetation behavior
- physical validation that HAIL reads as weather rather than a debug shape
- physical validation of material distinction and automatic cleanup
- physical validation of Supercell attack-time target visibility
- five-minute frame pacing and thermal test
- staged or asynchronous startup generation
- Unity `.meta` migration for authored assets
- production environment assets, final materials, VFX, audio, fracture prefabs, and broader profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
