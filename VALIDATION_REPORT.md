# Validation Report

Last updated: 2026-07-31

## Evidence scope

The active playable is `MechanicsLab/SevereWeather_3D_Lab.html`. This report separates browser validation, repository integrity, Android packaging, and physical-device acceptance. Passing one gate does not imply the others.

## v3.1.0 browser acceptance

The Storm Town Rampage vertical slice completed a full automated Tornado round in the in-app Chromium browser.

Observed result:

- rank: `S+`
- final score: `22625`
- district objectives: `3/3`
- landmarks: `2/2`
- substations: `3/3`
- randomized bonus challenges: `3/3`
- cosmetic reward: `NEON FUNNEL UNLOCKED!`
- district scores: `2999`, `7999`, `22625`
- frame rate: approximately `60 FPS`
- browser warnings or errors: `0`

The retry control was also exercised. It closed the results overlay, reset the timer, score, district, and challenge state, rebuilt a single clean world, and resumed play without a browser error.

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
- the results card fit completely inside the viewport after its mobile-height correction
- Tornado, Supercell, and Derecho selectors exposed the correct action labels and EAS descriptions
- observed frame rate remained approximately `56-60 FPS`
- browser warnings or errors: `0`

This is a responsive-browser check, not proof of touch feel, thermal stability, battery use, or Android WebView behavior.

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
- Markdown documents in `Docs/`: `19`
- project files outside `.git`: `76`
- `FILE_INVENTORY.txt`: synchronized
- SHA-256 registry: verified with zero mismatches
- `git diff --check`: passed

## Historical Unity evidence

Older Unity and Godot work remains in the repository as reference material. The current production direction is the HTML/WebGL game, packaged for Android as a local single-player experience. Previous Unity compilation and APK evidence does not validate the v3.1.0 HTML build.

## Gates still open

- install the packaged build on a physical Android phone
- verify real multi-touch controls, browser back behavior, pause/resume, and orientation lock
- run repeated five-minute rounds while recording frame pacing, heat, and battery behavior
- verify audio focus and interruption recovery
- test cosmetic persistence after fully closing and reopening the Android app
- add an offline Android wrapper and release-signing workflow

Browser acceptance proves that this vertical slice is playable and internally consistent. Physical Android evidence remains authoritative for whether it is ready to ship as a mobile game.
