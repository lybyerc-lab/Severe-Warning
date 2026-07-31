# Validation Report

Last updated: 2026-07-31

## Evidence scope

The active playable is `MechanicsLab/SevereWeather_3D_Lab.html`. This report separates browser validation, repository integrity, Android packaging, and physical-device acceptance. Passing one gate does not imply the others.

## v3.2.0 browser acceptance

The Live Coverage Edition completed a full automated Tornado round in the in-app Chromium browser.

Observed result:

- rank: `S+`
- final score: `25781`
- district objectives: `3/3`
- landmarks: `2/2`
- substations: `3/3`
- randomized bonus challenges: `3/3`
- cosmetic reward: `NEON FUNNEL EQUIPPED`
- media moments: `8`
- awarded footage bonus: `+1289`
- district scores: `2999`, `7999`, `25781`
- frame rate: approximately `60 FPS`
- observed rendering or interaction failures: `0`

The retry control was exercised at the mobile viewport. It closed the results overlay, reset the timer, score, footage count, district, and challenge state, rebuilt a single clean world, and resumed play.

## News and storm-chaser checks

- Four white satellite news vans and five yellow camera-equipped storm-chaser SUVs replaced the ten generic red boxes.
- Crews pursued observation positions around the player storm and retreated after entering their role-specific danger radius.
- Crews remained invincible and were never counted as targets or destruction.
- Nearby destruction triggered a visible camera flash, a temporary crew-specific live headline, and a footage bonus.
- News vans and storm chasers used different filming ranges, speeds, and radar markers.
- The results screen reported actual media moments and awarded footage points.
- An initial untuned round produced `43` media moments and overwhelmed the broadcast. A global cooldown produced `8` moments in the accepted round.

## Progression and finale checks

- The three districts advance in order: Pine Ridge, Main Street, and County Fair.
- Randomized district challenges respond to the correct destructible props.
- County Fair grid nodes unlock sequentially rather than allowing an immediate finale clear.
- With 43 seconds left in the finale, only one of three substations was destroyed and the next-node countdown remained active.
- Completing all three bonus challenges persisted and equipped the Neon Funnel cosmetic through `localStorage` key `severe_weather_cosmetics_v1`.

## Mobile browser checks

The build was exercised at a landscape viewport of `844 x 390` pixels.

Confirmed:

- joystick remained visible and usable at `95 x 95` pixels
- all three action buttons remained visible at `50 x 50` pixels
- compact HUD, radar, district, and challenge information fit on screen
- footage telemetry remained visible while the less important FPS field hid at the mobile breakpoint
- the expanded results card measured `313.25` pixels high, from `y=38.375` to `bottom=351.625`, completely inside the viewport
- observed frame rate remained approximately `60 FPS`

This is a responsive-browser check, not proof of touch feel, thermal stability, battery use, or Android WebView behavior.

## Android wrapper checks

Capacitor `8.5.0` created and synchronized the native Android project. The wrapper is configured for Android API 24 or newer, hardware-accelerated WebGL, sensor-landscape orientation, immersive fullscreen, local HTTPS-scheme assets, no cleartext traffic, and no remote navigation allowlist.

The deterministic bundle builder:

- rejected external HTTP script and stylesheet resources
- required a content-security-policy declaration
- copied local Inter and Outfit WOFF2 fonts
- produced the same HTML bytes in the source, `www`, and synchronized Android asset directories
- produced SHA-256 `121d944f46980528830f736204ea249ca9ffde526adf1b95aaa58010f1f1bb2d`

The synchronized offline bundle was opened separately in Chromium at `844x390`. Local fonts reported loaded, the document had zero horizontal and vertical overflow, both WebGL and radar canvases were present, and the gameplay/HUD rendered without an observed layout failure.

GitHub Actions run `30653818627` compiled the debug APK successfully from commit `d2b8fde67b76e7d5d5faa7991f9984801586836b`. Gradle reported `BUILD SUCCESSFUL`; artifact `severe-weather-v3.2.0-debug-2` was downloaded and unpacked. The APK was readable, contained the Android manifest, DEX, and local `assets/public/index.html`, and matched its included SHA-256 record:

```text
35d8996f6d3bdc30dafdbae42b395efb89a99d200f4444e2d7d922024ab6963c  app-debug.apk
```

The managed work PC still has no permitted local Android Studio, SDK, JDK, `adb`, or `sdkmanager` installation. GitHub Actions is the proven no-install debug-build path.

## v3.2.0 physical Android acceptance

The debug APK installed and launched on a Galaxy S26 Ultra. The user reported visual and gameplay parity with the HTML build and submitted a completed Tornado results screen showing:

- rank `S+`
- score `23621`
- maximum combo `3.5x`
- objectives `3/3`
- landmarks `2/2`
- substations `3/3`
- bonus challenges `3/3`
- seventeen media moments and `+1817` footage
- Neon Funnel unlocked

This accepts the wrapper strategy and complete-run gameplay on the reported high-end phone. It does not prove lower-end Android performance, sustained thermal/battery behavior, or every lifecycle/persistence scenario.

## v3.3.0 terrain-pass browser checks

The High Country Edition replaced the four flat ground tiles with one continuous height-mapped county. Browser inspection confirmed terrain-following roads, shoulders, lane markings, buildings, props, landmarks, storm movement, damage swath, animals, and media vehicles. Pine Ridge, Main Street, County Fair, and the eastern creek use different elevation signatures and contour cues.

The automated Tornado run completed at approximately `60 FPS` with zero observed console warnings or errors. Results were `S+`, score `23016`, objectives `3/3`, landmarks `2/2`, substations `3/3`, district bonuses `3/3`, seven media moments, `+1067` footage, and Neon Funnel retained. Retry closed the results overlay, returned to Pine Ridge, reset the timer, and resumed play in a clean world.

At the `844x390` landscape viewport, the final bundle reported document dimensions exactly `844x390`, loaded both local font families, kept the `95x95` joystick inside the viewport, rendered the terrain and district card, and emitted no observed console warnings or errors.

## Repository integrity

Validation commands use the bundled Python runtime when `python` is not available on `PATH`:

```powershell
& "C:\Users\clybyer\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" Tools\validate_project.py
git diff --check
git status --short
```

Final pre-commit results:

- `Tools/validate_project.py`: passed
- C# files: `34`
- Markdown documents in `Docs/`: `20`
- tracked and intended project files: `136`
- `FILE_INVENTORY.txt`: synchronized
- SHA-256 registry: verified with zero mismatches
- `git diff --check`: passed

## Historical Unity evidence

Older Unity and Godot work remains in the repository as reference material. The current production direction is the HTML/WebGL game, packaged for Android as a local single-player experience. Previous Unity compilation and APK evidence does not validate the v3.2.0 HTML build.

## Gates still open

- build and install a synchronized v3.3.0 APK
- verify real multi-touch, browser back, pause/resume, and orientation behavior after the terrain change
- run repeated five-minute rounds while recording frame pacing, heat, and battery behavior
- verify audio focus and interruption recovery
- test cosmetic persistence after fully closing and reopening the Android app
- test one ordinary or older Android device before making broad compatibility claims
- confirm human players can distinguish news vans from storm-chaser SUVs without relying on radar colors
- confirm eight to twelve coverage moments per round feels lively rather than repetitive
- replace the generated Capacitor launcher icon and splash art before public release
- establish the release-signing workflow; never commit the signing key or passwords

Browser acceptance, GitHub Actions compilation, and the successful Galaxy S26 Ultra run prove that the HTML game can ship through the local Capacitor wrapper without an engine rewrite. Physical evidence for v3.3.0 and a broader performance sample remain authoritative before a public mobile release claim.
