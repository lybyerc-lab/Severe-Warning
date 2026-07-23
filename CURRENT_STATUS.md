# Severe Weather Current Status

Last updated: 2026-07-23
Repository: `lybyerc-lab/Severe-Warning`
Default branch: `main`
Unity editor: `6000.3.0f1`
Primary target: Android

## Canonical memory order

1. Current repository code and physical-device evidence
2. This status file
3. `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
4. Current production documents in `Docs/`
5. `Docs/Archive/SEVERE_WEATHER_ALL_MARKDOWNS.md`
6. Frozen HTML Mechanics Laboratory

Important project decisions and test evidence must be committed to the repository. Chat is working context, not the durable source of truth.

## Tested baseline

- Initial production starter commit: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Android startup hotfix commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`
- Unity Cloud Build Automation is connected to `main`.
- Build #1 compiled and installed but launched to a black screen.
- Build #2 compiled, installed, rendered the generated county graybox, displayed the HUD, and allowed Tornado/Supercell switching.
- Build #2 physical testing exposed unreliable movement feedback and mismatched ability-button hit zones.

## Active work: Build #3 mobile controls

Approved scope:

- one shared safe-area-aware control layout for HUD drawing and touch detection
- dedicated movement-touch ownership
- screen-scaled floating joystick with dead zone
- camera-relative movement for Tornado and Supercell
- latched one-shot taps so FixedUpdate cannot miss short ability presses
- exact ability and storm-switch hit boxes
- pressed-state feedback
- temporary movement vector and storm-position telemetry
- repository-memory updates in the same patch

Explicitly outside Build #3:

- loading-screen and staged region generation
- art and shader polish
- audio
- `.meta` migration
- camera orbit controls
- new storms or missions

## Build #3 acceptance gate

On the physical Android device:

1. Drag in the lower-left area and confirm the joystick appears at the first touch point.
2. Move in all eight directions and confirm the ground moves in the expected screen-relative direction.
3. Confirm MOVE telemetry changes and POS telemetry updates continuously.
4. Cross the left/right screen boundary while steering and confirm the movement finger remains owned by the joystick.
5. Hold the primary ability and confirm only its matching button highlights.
6. Tap secondary and tertiary abilities and confirm the correct matching button highlights and the resource cost responds when a valid target is available.
7. Switch between Tornado and Supercell and repeat movement and all three abilities.
8. Confirm controls remain clear of Android system bars and display cutouts.
9. Record frame pacing, heat, and any control ambiguity.

## Known open issues after Build #3

- Startup still generates the region synchronously.
- The guaranteed runtime shader is intentionally simple and unlit.
- Unity `.meta` files are not yet committed.
- Production art, audio, VFX, destruction assets, and profiling remain future gates.
