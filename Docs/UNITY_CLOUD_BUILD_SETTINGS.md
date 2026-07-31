# Unity Cloud Build Settings

Last verified from repository source and supplied build log: 2026-07-29
Target: `Severe Weather Android`
Repository: `lybyerc-lab/Severe-Warning`

This file records the intended Unity Build Automation configuration. Dashboard settings remain external state. The latest supplied successful cloud run was attempt `6` at commit `80f2f14` on 2026-07-25.

## Basic settings

- Target name: `Severe Weather Android`
- Platform: Android
- Branch: `main`
- Project subfolder: blank
- Auto-detect Unity version: enabled
- Build with closest version: disabled
- Required Unity version: `6000.3.0f1`
- Android SDK availability: `35`
- Build profile path: blank
- Bundle ID: `com.lybyerclab.severewarning`
- Credentials: auto-generated debug keystore for device-test APKs
- Machine: Micro while the project remains eligible and stable on it
- Auto-build: disabled during the current lab iteration
- Repeating schedule: disabled

## Builder operating system

- Do not use a builder marked deprecated when a current option is available at the same acceptable cost.
- Preferred current Windows option for this lab: Windows 11 24H2 when available.
- If the dashboard labels the Windows option experimental, a current macOS Sequoia builder is an acceptable Android alternative when it remains within the intended cost tier.
- Record any OS change in `CURRENT_STATUS.md` and the next device-test entry.

## Advanced settings

- Build output: release/device-test output, not a Development Build
- Caching: Library caching enabled
- Git executable on Windows: Native
- Android App Bundle: disabled for device-test builds
- Split binary / OBB: disabled
- Asset packs: disabled
- Addressables: disabled until the project adopts Addressables
- Scene override list: blank; the pre-export method writes the build scene
- Pre-build script: blank
- Pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`
- Post-export method: blank
- Post-build script: blank
- Auto-build: disabled
- Auto-cancel: disabled unless automatic builds are later enabled

## Settings enforced by the pre-export method

`ProductionSliceBuilder` applies these settings inside Unity before every build:

- application version `0.1.9`
- Android version code `9`
- application identifier `com.lybyerclab.severewarning`
- IL2CPP scripting backend
- ARM64 architecture
- managed stripping level Medium
- Android minimum API 26
- target SDK Auto, with SDK 35 available in the cloud builder
- Vulkan only for the current device baseline
- APK output rather than AAB
- landscape-left orientation
- linear color space
- 2x MSAA
- soft shadows and mobile shadow distance
- generated Standard and unlit runtime material templates
- generated build identity
- generated production-slice scene

## Build #4 clean-build rule

Run Build #4 as a clean build after changing the builder OS or graphics/player settings. Later iterations may return to normal cached builds after Build #4 succeeds on-device.

## Security

- Never commit or paste raw Unity Cloud logs containing `-accessToken` values.
- Store only sanitized summaries in `Docs/DEVICE_TEST_LOG.md`.
- Keep the debug keystore for lab builds only. A controlled release keystore is a separate publishing gate.

## Build #4.1 temporary device-lab override

For the Build #4.1 physical movement gate, the pre-export method enforces:

- application version `0.1.5`
- Android version code `5`
- IL2CPP
- ARM64
- Vulkan only
- APK output
- Built-in Standard and unlit generated material templates only

The Vulkan-only and Built-in-template choices are temporary test controls. They prevent duplicate API compilation and unused URP Lit variant preparation while the authored URP pipeline asset remains an open production gate.

## Build #4.2 device-lab note

- Source branch after review: `main`
- Required base before patch: `96c9f780daf070648dc69a7f6cd431233b85617a`
- Application version: `0.1.6`
- Android version code: `6`
- Build label: `B4.2 CAMERA + SUPERCELL LAB`
- Keep Library caching enabled.
- Do not request a clean build unless the cached build fails for a cache-specific reason.
- Pre-export method remains `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`.
- Android output remains APK, ARM64, IL2CPP, Vulkan only for this device gate.

## Build #5 device-lab identity

- Application version: `0.1.7`
- Android version code: `7`
- HUD label: `B5 IMPACT + DESTRUCTION LAB`
- Expected source branch after review and merge: `main`
- Reuse Library cache; do not request a clean build unless Unity reports stale generated content.
- Preserve Unity `6000.3.0f1`, Android SDK 35, IL2CPP, ARM64, Vulkan, APK output, debug signing, and the existing pre-export method.

## Build #5.1 device-lab identity

- Application version: `0.1.8`
- Android version code: `8`
- Expected HUD: `B5.1 IMPACT READABILITY LAB`
- Expected source base before patch: `d0b7f15927c082b960c034ccc11ae7abaaaf63c3`
- Continue using the exact Unity `6000.3.0f1`, Android SDK 35, Windows 11 24H2 Micro builder, APK output, debug signing, Vulkan-only player settings, and the existing pre-export method.
- Reuse the Library cache. A clean build is not required unless Unity reports stale generated assets.

## Build #5.2 device-lab identity

- Application version: `0.1.9`
- Android version code: `9`
- Expected HUD: `B5.2 ABILITY FEEDBACK CLEANUP`
- Source base before the cleanup series: `7695875effea2dafb8bb8c1e6519f1b9181b1587`
- Last successful cloud commit: `80f2f1438d600b3b2857925e6aef60e48dd04444`
- Unity Build Automation attempt: `6`
- Result: successful Android IL2CPP/ARM64 compilation and APK packaging
- Unity: exact `6000.3.0f1`
- Output: APK with debug signing
- Graphics API: Vulkan only
- Pre-export method: `SevereWeather.Editor.ProductionSliceBuilder.CreateProductionSliceScene`

Compilation does not close the physical gate. A five-minute Android run must still confirm trail/ring removal, crop aftermath, effect cleanup, frame pacing, heat, and battery behavior.

## Current-head rule

The July 29 source additions after `80f2f14` have no supplied Unity build evidence. Before requesting another cloud build:

1. restore Unity 6 damping APIs
2. decide whether experimental Derecho/progression files remain quarantined or become an approved integration
3. run repository validation and checksum verification
4. confirm `CURRENT_STATUS.md` names the exact source head and intended test
5. preserve the successful `80f2f14` APK as the rollback artifact
