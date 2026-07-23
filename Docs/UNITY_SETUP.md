# Unity Setup Checklist

## Install

- Unity Hub
- Unity 6.3 LTS
- Android Build Support
- Android SDK and NDK Tools
- OpenJDK

## Open

Open the folder `SevereWeather_UnityProductionStarter_v0.1.0` from Unity Hub.

## Resolve packages

The project declares:

- Universal Render Pipeline 17.3.0
- Input System 1.17.0

If Unity recommends a compatible patch package for the installed 6.3 LTS editor, accept the editor-supported patch within the same major package line.

## Generate the scene

Use:

`Tools > Severe Weather > Create Production Slice Scene`

## Validate

Use:

`Tools > Severe Weather > Validate Production Starter`

## Android

- Switch build platform to Android
- Use Landscape Left orientation
- Use IL2CPP for release builds
- Use Development Build for early device profiling
- Confirm active input handling supports the Input System

## First compile notes

The starter intentionally creates materials and graybox content at runtime. Replace these primitives through the Asset Laboratory rather than polishing them into final art.
