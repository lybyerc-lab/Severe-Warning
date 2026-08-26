# Validation Report

Last updated: 2026-08-03

## Evidence scope

The active playable is `MechanicsLab/SevereWeather_Warning.html`. This report separates browser validation, repository integrity, Android packaging, and physical-device acceptance. Passing one gate does not imply the others.

## v5.0.0 authored-world candidate

The V5 campaign foundation and real-time warning clock passed deterministic source verification. Strict full-round workflow run #5 completed in 185 seconds and passed all `11/11` required checks, including district three and results at time zero, with no page errors, console errors, or harness exception.

A local `932 x 430` mobile-landscape sweep loaded Lincoln County, Prairie Junction, Grain Belt, and the State Fair finale. It observed four unique terrain profiles, eight unique destructible landmark contracts, regional scenery and animation, four challenge and broadcast identities, distinct media call-sign rosters, and intentional animal counts of `38`, `24`, `18`, and `8`. No page or console errors were observed.

This local sweep is implementation evidence, not release acceptance. The exact authored-world commit must still pass CI, produce a new APK, and pass Galaxy S26 Ultra gameplay and close/reopen persistence checks.

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

## v3.3.1 county-cleanup browser checks

The County Roads Edition addresses issues visible in the first physical v3.3.0 screenshot: an exposed black world edge, an overly solid damage trail, prominent contour rings, a bright repetitive creek-bank strip, identical dark commercial towers, and media vehicles crossing open lots.

Confirmed during the automated road-routing run:

- an `1800 x 1800` terrain apron filled the camera background without changing the `800 x 800` playable boundary
- road, shoulder, creek, and damage layers rendered in a stable visual order
- the damage scar remained beneath asphalt and bridges
- all nine media vehicles spawned on roads and routed through grid intersections
- road-bound crews still captured eight media moments and awarded `+1504` footage
- the run completed at `S+`, score `24830`, objectives `3/3`, landmarks `2/2`, substations `3/3`, and district bonuses `3/3`
- observed frame rate remained approximately `60 FPS`
- observed console warnings or errors: `0`

The final visual-only tune narrowed and softened damage stamps and varied commercial building dimensions, colors, roof caps, and antennas. A fresh `844x390` check of that exact source reported document dimensions `844x390`, no horizontal or vertical overflow, the `95x95` joystick fully inside the viewport, a settled `61 FPS`, and no observed console warnings or errors. A visual capture showed the county apron covering the former void and multiple news/chaser vehicles positioned on asphalt.

## v4.0.0 Living County checks

The first v4 pass replaced the random target scatter with 36 authored blocks and richer district-specific structures. Browser startup confirmed that the canonical HTML loaded, produced two canvases, advanced the automated route, and rendered the new Pine Ridge lots, roads, media traffic, damage stages, persistent debris, and v4 badge. The reported rate settled at `60-61 FPS`; observed startup console warnings or errors were `0`.

The canonical source and both inline scripts passed the offline builder and JavaScript parser. The source, generated `www/index.html`, and synchronized Android `public/index.html` matched at SHA-256 `10b0629a905cf2ec432190a27478efcbd2f0f3ebcce5fa602415381a68e4834b`; both build-info files report version `4.0.0`. The resulting screenshot is useful visual/startup evidence, not a complete-run acceptance record. The browser controller was subsequently denied permission to restart localhost, so a full v4 bot result, retry reset, chain-reaction completion count, mobile-landscape result-card fit, and final console pass remain open rather than being inferred.

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

- complete the deterministic v4.0.0 bot run and retry check
- build and install a synchronized v4.0.0 APK
- verify real multi-touch, browser back, pause/resume, and orientation behavior after the terrain change
- run repeated five-minute rounds while recording frame pacing, heat, and battery behavior
- verify audio focus and interruption recovery
- test cosmetic persistence after fully closing and reopening the Android app
- test one ordinary or older Android device before making broad compatibility claims
- confirm human players can distinguish news vans from storm-chaser SUVs without relying on radar colors
- confirm eight to twelve coverage moments per round feels lively rather than repetitive
- replace the generated Capacitor launcher icon and splash art before public release
- establish the release-signing workflow; never commit the signing key or passwords

Earlier browser acceptance, GitHub Actions compilation, and the successful Galaxy S26 Ultra runs prove that the HTML game can ship through the local Capacitor wrapper without an engine rewrite. A complete v4.0.0 browser run, v4 physical-device evidence, and a broader performance sample remain authoritative before a public mobile release claim.
