# Validation Report

Last updated: 2026-07-29

## Evidence scope

This report distinguishes four different claims:

1. static repository validation
2. Unity compilation
3. Android packaging
4. physical-device acceptance

Passing one claim does not imply the others.

## Proven gates

- Required project files are present.
- `Packages/manifest.json` parses and declares URP and the Input System.
- Unity `6000.3.0f1` has compiled prior production candidates in Unity Build Automation.
- The production slice is generated through `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`.
- Prior APKs installed and launched on a physical Android device.
- Build #4.1 proved transform-authoritative Tornado and Supercell translation.
- Build #4.2 proved camera containment and separate Supercell framing.
- Build #5 proved five-stage damage, material-stage telemetry, hail target detection, and precipitation-cylinder removal.
- Build #5.1 proved bounded FX/fragment telemetry and corrected the vertical crop-spike defect.

## Latest physical baseline

Build #5.1 at commit `7695875effea2dafb8bb8c1e6519f1b9181b1587` is the latest recorded physical baseline.

It confirmed stable movement, switching, targeting, staged damage, removal of the HAIL rectangle and Tornado ground disk, bounded FX/fragment counts in captured frames, and directional reactions. It still failed presentation quality because of the Supercell trail wedge, looping line artifacts, oversized Tornado feedback, board-like flattened crops, and the missing five-minute stress record.

## Latest Unity compile/package baseline

Unity Build Automation attempt `6` checked out commit `80f2f1438d600b3b2857925e6aef60e48dd04444`.

The supplied log proves:

- Unity version `6000.3.0f1`
- production-slice generation for Build #5.2
- successful IL2CPP/ARM64 Android compilation
- successful APK packaging
- final result `Success`
- no automated unit-test execution; the test step recorded zero duration

The supplied APK is a readable ZIP container with an Android manifest and Unity player data. This evidence applies only to commit `80f2f14`.

## Current-head audit

Audited `main` head before this documentation update: `13215c779fb236a3f2452f33b552cf70cdedcc2b`.

Confirmed current configuration:

- application version `0.1.9`
- Android version code `9`
- build label `5.2`
- HUD label `B5.2 ABILITY FEEDBACK CLEANUP`
- IL2CPP
- ARM64
- Vulkan only
- Android minimum API 26
- generated Standard and unlit runtime materials
- Build #5.2 cleanup telemetry and presentation governor

Confirmed source-present but inactive additions:

- Derecho type and controller
- EF score/rating manager
- NOAA/EAS banner
- invincible animals
- power-substation cascade helper

Integration gaps:

- Bootstrap switches and instantiates only Tornado and Supercell.
- EF, NOAA, animal, and cascade components are never created or attached.
- Derecho has no dedicated camera/HUD/visual integration.
- Tornado gust balance changed outside the locked Build #5.2 cleanup scope.
- `DamageableStructure` uses deprecated `Rigidbody.drag` and `Rigidbody.angularDrag` properties again.
- No supplied Unity build validates the July 29 source delta.

## Repository integrity

Before this documentation audit:

- `Tools/validate_project.py` failed because `FILE_INVENTORY.txt` omitted seven added files.
- `SHA256SUMS.txt` had seven mismatched tracked files.
- `CURRENT_STATUS.md` and `VALIDATION_REPORT.md` had been rolled back from Build #5.2 to Build #5.1.
- The append-only Build #5.2 decision entry had been removed.

This documentation update restores the canonical record and refreshes inventory/checksum metadata. Final command results are recorded in the Git diff and commit evidence; rerun the commands below after any subsequent content change.

Post-update static results:

- `Tools/validate_project.py`: passed
- C# files: `31`
- current Markdown documents in `Docs/`: `14`
- project files outside `.git`: `63`
- SHA-256 entries verified: `62`
- SHA-256 mismatches: `0`
- `git diff --check`: passed

## Required verification commands

From repository root:

```powershell
& "C:\Users\clybyer\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" Tools\validate_project.py
git diff --check
git status --short
```

Validate `SHA256SUMS.txt` with a SHA-256 checker before commit or build.

## Gates still open

- restore Unity 6 damping APIs
- decide the fate and scope of the experimental Derecho/progression batch
- Unity compile of the exact post-audit current head
- Android APK generation from that exact head
- full Build #5.2 five-minute physical test
- physical validation of effect cleanup, crop aftermath, frame pacing, heat, and battery
- staged or asynchronous startup generation
- authored URP assets and `.meta` migration
- production environment assets, materials, VFX, audio, fracture prefabs, and broader profiling

A successful cloud build proves compilation and packaging. Physical Android evidence remains authoritative for controls, readability, heat, battery, sound, and performance.
