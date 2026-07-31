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

Native Gradle compilation was not run. The managed work PC has no permitted Android Studio, Android SDK, JDK, `adb`, or `sdkmanager` installation. This is an environment gate, not a passed build.

The repository now contains a manually triggered GitHub Actions workflow for the first native compilation. Its presence is not build evidence; this report must record the run URL, commit, result, and APK hash after the workflow completes.

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

- install the packaged build on a physical Android phone
- verify real multi-touch controls, browser back behavior, pause/resume, and orientation lock
- run repeated five-minute rounds while recording frame pacing, heat, and battery behavior
- verify audio focus and interruption recovery
- test cosmetic persistence after fully closing and reopening the Android app
- confirm human players can distinguish news vans from storm-chaser SUVs without relying on radar colors
- confirm eight to twelve coverage moments per round feels lively rather than repetitive
- compile the existing Android wrapper on a permitted build machine
- replace the generated Capacitor launcher icon and splash art before public release
- establish the release-signing workflow; never commit the signing key or passwords

Browser acceptance and wrapper synchronization prove that this vertical slice is playable and packageable as local web assets. Physical Android evidence remains authoritative for whether it is ready to ship as a mobile game.
