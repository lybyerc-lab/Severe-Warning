# Unity Setup Checklist

## Install

- Unity Hub
- Unity `6000.3.0f1`
- Android Build Support
- Android SDK and NDK Tools
- OpenJDK

Use the exact editor version for build reproduction. Do not silently upgrade the project during a device gate.

## Open

Open the repository root containing `Assets/`, `Packages/`, and `ProjectSettings/`.

Current checkout folder in this workspace: `Severe-Warning-main`.

## Resolve packages

The project declares:

- Universal Render Pipeline `17.3.0`
- Input System `1.17.0`

Allow Unity to restore the locked manifest dependencies. Record any package change in the status and build evidence.

## Generate the scene

Use:

`Tools > Severe Weather > Create Production Slice Scene`

The builder creates `Assets/SevereWeather/Scenes/ProductionSlice.unity`, generated runtime materials/build identity, and the build-scene list.

## Validate

Use:

`Tools > Severe Weather > Validate Production Starter`

Also run the repository validator from repository root:

```powershell
& "C:\Users\clybyer\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" Tools\validate_project.py
```

## Android baseline

- Landscape Left
- IL2CPP
- ARM64
- Android minimum API 26
- Vulkan only for the current device laboratory
- APK output with debug signing
- Application version `0.1.9`
- Android version code `9`

## Current compile gate

The supplied successful Build #5.2 artifact applies to commit `80f2f14`. Later July 29 source changes must be compiled as a new exact-head candidate before they are treated as working.

The project intentionally creates graybox content at runtime. Replace primitives through the Asset Laboratory rather than polishing them into final art.
