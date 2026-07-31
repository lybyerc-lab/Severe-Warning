# Severe Weather HTML Game

The HTML/WebGL build is the active gameplay source and the planned foundation for the Android release. It is no longer classified as a frozen mechanics reference.

## Current build

- `SevereWeather_3D_Lab.html`
- Version: `3.1.0 Storm Town Rampage Slice`
- Runtime: self-contained Three.js/WebGL game
- Primary target: Android landscape through a local web-app wrapper
- Mode: single-player only

Version 3.1.0 adds a three-district arcade run:

1. Pine Ridge neighborhood
2. Main Street
3. County Fair blackout finale

It also adds district transitions, randomized bonus challenges, thirteen destructible comedy props, sequential substation activation, a persistent Neon Funnel cosmetic unlock, mobile result-screen fitting, expanded results telemetry, and an updated deterministic bot route.

## Controls

- Desktop movement: WASD or arrow keys
- Mobile movement: lower-left virtual joystick
- Primary ability: Space or left action button
- Secondary ability: Q or middle action button
- Tertiary ability: E or right action button
- Storm selection: 1, 2, 3 or the storm tabs

## Verification

Use `?bot=true` to run the deterministic automated playtest route. Automated browser testing validates startup, stage progression, scoring, objectives, unlocks, replay reset, responsive layout, and console stability. Physical Android testing remains required for touch comfort, thermals, sustained frame pacing, sound, and WebView compatibility.

## Preserved builds

- `SevereWeather_MechanicsLab_v0.7.1.html`: transition-era baseline
- `SevereWeather_MechanicsLab_v0.8.0.html`: compact experiment; its internal page title says `v1.3.5`

Unity and Godot source remain in the repository as historical experiments and implementation references. Do not port new HTML gameplay into those engines unless a measured Android-wrapper blocker reopens the engine decision.
