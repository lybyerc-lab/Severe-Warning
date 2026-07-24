# Validation Report

Last updated: 2026-07-23

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
- Startup hotfix was validated by Build #2 rendering the generated region and HUD
- Build #3 confirmed mobile joystick telemetry, storm position changes, storm switching, and primary-resource consumption on-device

## Physical defects discovered

Build #3 exposed the following feel, interaction, and rendering defects:

- movement input registered, but the camera immediately followed the storm and hid visible translation
- the opening crop field provided weak landmarks and little parallax
- crops were damageable but lacked colliders, so physics queries could not interact with them
- ability input could consume resources without visible world feedback
- the flat emergency material path produced unacceptable lighting and material separation
- tornado and supercell visual rotation was mostly invisible because symmetrical primitives rotated around their own axes
- the camera could reveal black space beyond the generated county ground
- existing rigidbody ordering and default mass behavior could produce implausible prop and structure physics
- per-renderer material instances undermined mobile batching

## Build #4 validation intent

The current candidate adds:

- soft-leash camera movement with slower catch-up and significant-target impact sampling
- stronger differentiated Tornado and Supercell movement
- speed, distance, build identity, render pipeline, graphics API, FPS, action, and target telemetry
- generated Standard and URP material templates that survive shader stripping, with a stable lit built-in Build #4 baseline
- lit world materials, soft shadows, fog, ambient lighting, transparent storm layers, and 2x MSAA
- visible storm trails, ground contact, internal orbit, action rings, swaths, arcs, and lightning paths
- collider-backed crops, a starter interaction pocket, farm road markings, backdrop terrain, and distant hills
- mobility classes, approximate mass, pre-destruction prop release, and wind/physics conflict protection
- collider-aware density validation
- throttled passive-field and camera-density queries
- deterministic Android versioning, IL2CPP, ARM64, Vulkan, and OpenGLES3 fallback
- sanitized repository-memory updates

## Gates still open

- Build #4 Unity compilation
- Build #4 Android APK generation
- physical validation of camera leash, movement visibility, both storm movement profiles, all ability feedback, crop interaction, vehicle response, world-edge coverage, lighting, shadows, fog, and transparency
- five-minute frame pacing and thermal test
- staged/asynchronous startup generation
- Unity `.meta` file migration for authored assets
- production environment assets, final materials, VFX, audio, destruction prefabs, and broader profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
