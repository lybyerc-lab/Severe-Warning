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
- Android APK built successfully through Unity Cloud
- APK installed and launched on a physical Android device
- Startup hotfix was validated by Build #2 rendering the generated region and HUD
- Tornado/Supercell switching worked on-device

## Physical defects discovered

Build #2 exposed the following mobile-input defects:

- movement was not clear or reliably controllable
- world-axis movement did not match the isometric camera presentation
- visible ability buttons and touch-detection zones were different layouts
- short tap events could be lost between `Update` and `FixedUpdate`
- no joystick or input telemetry existed for diagnosis

## Build #3 validation intent

The current candidate adds:

- shared safe-area control geometry
- dedicated movement-touch ownership
- screen-scaled floating joystick and dead zone
- camera-relative Tornado and Supercell movement
- latched one-shot inputs
- exact button hit zones and pressed-state feedback
- MOVE and POS device telemetry

## Gates still open

- Build #3 Unity compilation
- Build #3 Android APK generation
- physical validation of movement direction, touch ownership, all abilities, and safe-area placement
- sustained frame pacing and thermal testing
- staged/asynchronous startup generation
- Unity `.meta` file migration
- production art, materials, VFX, audio, destruction assets, and profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
