# Validation Report

Last updated: 2026-07-24

## Proven gates

- Required project files are present.
- Unity package manifest parses as JSON.
- URP and Input System dependencies are declared.
- Unity `6000.3.0f1` restored packages and compiled prior candidates in Unity Build Automation.
- Production slice scene generation is wired through `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`.
- Prior Android APKs built, installed, and launched on a physical Android device.
- Build #4.1 proved transform-authoritative Tornado and Supercell translation.
- Build #4.2 proved improved camera containment and Supercell framing.
- Build #5 proved five-stage damage, material-stage telemetry, hail target detection, and precipitation-cylinder removal.
- Build #5.1 proved bounded FX/fragment telemetry and corrected the vertical crop-spike defect.

## Build #5.1 physical result

Build #5.1 is a mechanical pass and presentation fail.

Physical screenshots proved:

- movement, camera behavior, storm switching, target detection, and damage stages remained functional
- the blue HAIL rectangle and orange Tornado ground disk were removed
- FX and fragment counts remained within the `18` and `42` caps in the captured frames
- trees, utility pieces, roofs, and props reacted directionally
- crops stayed near the ground instead of becoming vertical black spikes
- the Supercell still produced a dark triangular trail wedge and looping blue ground lines
- Tornado PULL still produced an oversized pale ring and dark center rings
- flattened crops read as scattered orange boards
- the supplied session did not include the required five-minute stress test

## Build #5.2 candidate

Branch: `agent/build5-2-ability-feedback-cleanup`

The candidate currently includes:

- `Build52PresentationPatch` runtime governor
- Supercell trail suppression
- oversized ring/swath suppression
- looping ground-mist suppression
- thinner, lower-alpha Tornado dust arcs
- thinner hail drops
- row-preserving, darker, thinner flattened crops
- bounded destroyed-crop thinning and distant flattened-crop culling
- cleanup elapsed-time and crop-management HUD telemetry
- application version `0.1.9`
- Build label `5.2`
- Android version code `9`
- Unity 6 `Rigidbody.linearDamping` and `Rigidbody.angularDamping`
- removal of the failed temporary self-editing GitHub Action
- updated current status, decision log, and file inventory

## Static verification completed

- Build #5.2 branch is based on Build #5.1 `main` commit `7695875effea2dafb8bb8c1e6519f1b9181b1587`.
- `main` remains untouched.
- The temporary workflow file is absent from the branch diff.
- `ProductionSliceBuilder` reports `0.1.9` and Android version code `9`.
- `BuildIdentity` reports version `0.1.9` and build `5.2`.
- `DamageableStructure` uses `linearDamping` and `angularDamping`; deprecated `drag` and `angularDrag` assignments are removed.
- The HUD label is `B5.2 ABILITY FEEDBACK CLEANUP` and includes cleanup/crop telemetry.
- `FILE_INVENTORY.txt` includes the new runtime source and contains 57 project paths.

## Required before merge

- Refresh `SHA256SUMS.txt` from the final branch contents.
- Run `python Tools/validate_project.py` against the final branch checkout.
- Run a Unity Cloud compile from the reviewed final commit.
- Confirm the generated APK displays `B5.2 ABILITY FEEDBACK CLEANUP`, version `0.1.9`, and Android code `9`.

## Physical Android gate

1. Confirm Tornado and Supercell movement, speed, switching, targeting, and camera containment are unchanged.
2. Confirm no dark triangular trail follows the Supercell.
3. Confirm HAIL has weather-shaped falling streaks and localized impacts without looping blue scribbles or a rectangle.
4. Confirm Tornado PULL has no giant pale boundary ring dominating the town.
5. Confirm flattened crops remain low, darker, and broadly row-oriented rather than reading as scattered boards.
6. Confirm FX never exceeds `18` and FRAG never exceeds `42`.
7. Run repeated destruction until `CLEANUP T+300s` or greater.
8. Confirm effect and fragment counts fall after attacks rather than remaining pinned at their caps.
9. Record FPS, heat, clutter, and stutter after the five-minute run.

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
