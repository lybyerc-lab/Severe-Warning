# v4.4.0 Illustrated Storm Feedback Acceptance

Date: 2026-07-31
Release: `4.4.0 Illustrated Storm Feedback`
Target device: Galaxy S26 Ultra
Active source: `MechanicsLab/SevereWeather_Warning.html`
Android packaging: Capacitor 8.5.0

## Gameplay and Grid Zap acceptance

### Build evidence

- Tested branch commit: `f6754c3124ef7bf32d82bfcd369afc05c2252a66`
- GitHub Actions run: `30681407457` (`Build Android Debug APK #26`)
- Artifact: `severe-weather-v4.4.0-illustrated-storm-26`
- APK: `Severe-Weather-v4.4.0-Illustrated-Storm-debug.apk`
- APK SHA-256: `5036b118aae1fb86b1e98c5cbed3b1416cff4dfe859a5edf0c5e82dbb38ceb4c`

### Physical result

- The APK installed and launched successfully.
- The user reported: `Good build`.
- A full Tornado Warning run reached the results and retry screen without a reported crash.
- Rank: `S+`
- Final score: `60737`
- Maximum combo: `3.5x`
- Objectives: `3/3`
- Landmarks: `2/2`
- Substations: `1/3`
- Bonus challenges: `2/3`
- Blocks cleared: `29`
- Chain reactions: `4`
- Media moments: `18`
- Footage bonus: `+2783`
- Cosmetic progress: `2/3 to unlock`

### Accepted systems

- Grid Zap is no longer a silent pole-scoring action.
- The effect uses a bounded storm-to-pole and pole-to-pole electrical cascade.
- Temporary arc and pulse objects use deterministic cleanup.
- Utility assets carry the first narrow `MeshToonMaterial` visual test.
- The accepted run did not reveal a reported crash or stuck-effect blocker.

## Immersive fullscreen acceptance

### Build evidence

- Tested branch commit: `3bdbf528fd5ed48448299e3a2098b957154f1b20`
- GitHub Actions run: `30682005730` (`Build Android Debug APK #28`)
- Artifact: `severe-weather-v4.4.0-illustrated-storm-28`
- Artifact digest: `sha256:a93871d8b78b1576ccc39ebadd42318ed8224e1b4f397296d091dd2f31ecde65`

### Physical result

- The updated APK built successfully after replacing legacy Android system-UI flags with `WindowInsetsControllerCompat`.
- The activity restores immersive mode after WebView attachment, app resume, and window-focus return.
- The user reported: `It's good` after testing the fullscreen correction.
- The previously persistent landscape status bar is accepted as resolved on the target device.
- System bars remain temporarily revealable by swipe and the game can reclaim immersive fullscreen afterward.

## Decision

v4.4.0 passes its first illustrated-storm vertical-slice gate on the target high-end Android device. The branch may merge into `main`.

This acceptance does not prove:

- ordinary or older Android performance
- sustained heat and battery behavior
- repeated Grid Zap stress over many runs
- broad full-scene toon shading performance
- interruption and close/reopen persistence beyond the fullscreen focus-return path

The next visual-feedback work should expand carefully from the accepted slice rather than applying full-scene cel shading in one pass.