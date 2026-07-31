# Severe Weather HTML Game

The HTML/WebGL build is the active gameplay source and the planned foundation for the Android release. It is no longer classified as a frozen mechanics reference.

## Current build

- `SevereWeather_3D_Lab.html`
- Version: `4.0.0 Living County Edition`
- Runtime: self-contained Three.js/WebGL game with locally bundled fonts
- Primary target: Android landscape through the Capacitor project in `../android/`
- Mode: single-player only

Version 4.0.0 contains a three-district arcade run:

1. Pine Ridge neighborhood
2. Main Street
3. County Fair blackout finale

It also contains district transitions, randomized bonus challenges, thirteen destructible comedy props, sequential substation activation, a persistent Neon Funnel cosmetic unlock, mobile result-screen fitting, expanded results telemetry, and a deterministic bot route.

The v3.2 coverage system replaces enemy-looking red vehicle boxes with four satellite news vans and five storm-chaser SUVs. Crews maintain an observation radius, retreat when the storm becomes unsafe, flash cameras for nearby destruction, publish temporary live headlines, award bounded footage bonuses, and appear on radar. Crews are invincible witnesses and never destruction targets.

The v3.3 graphics pass replaces the flat four-tile board with a continuous height-mapped county. Pine Ridge is physically raised, Main Street sits on a broad rise, County Fair rolls across low knolls, and the east side drops into a visible creek. Roads, shoulders, lane markings, structures, landmarks, animals, storm effects, and media crews follow the terrain height while destruction and steering retain predictable X/Z arcade collision.

The v3.3.1 cleanup extends terrain beyond the playable boundary so the tactical camera never exposes a black void, moves the softened damage scar beneath roads and bridges, reduces contour and creek-bank artifacts, routes every media vehicle along roads and intersections, and gives commercial districts varied office and warehouse silhouettes.

The v4.0 Living County pass replaces the randomized 210-object scatter with 36 authored road blocks. Pine Ridge now reads as homes with porches, garages, windows, chimneys, and trees; Main Street uses signed storefront and office facades; Foundry Row uses broad workshops with service doors and rooftop vents; and the fair/farm side uses barns and open vegetation. Structures visibly lean, compress, darken, and shed debris before collapsing into footprint-scaled ruins. Clearing an entire block awards a Block Buster bonus. Four original set-piece businesses can trigger shockwaves and collateral destruction: Last Chance Gas, Twister Shine Car Wash, Hanks Propane, and Totally Legal Fireworks.

## Controls

- Desktop movement: WASD or arrow keys
- Mobile movement: lower-left virtual joystick
- Primary ability: Space or left action button
- Secondary ability: Q or middle action button
- Tertiary ability: E or right action button
- Storm selection: 1, 2, 3 or the storm tabs

## Verification

Use `?bot=true` to run the deterministic automated playtest route. `node scripts/build-web.mjs` copies this canonical source to the generated `www/index.html`, verifies its content-security policy and offline-resource boundary, and bundles local fonts. Automated browser testing validates startup, stage progression, scoring, objectives, unlocks, replay reset, responsive layout, and console stability. Physical Android testing remains required for touch comfort, thermals, sustained frame pacing, sound, and WebView compatibility.

## Preserved builds

- `SevereWeather_MechanicsLab_v0.7.1.html`: transition-era baseline
- `SevereWeather_MechanicsLab_v0.8.0.html`: compact experiment; its internal page title says `v1.3.5`

Unity and Godot source remain in the repository as historical experiments and implementation references. Do not port new HTML gameplay into those engines unless a measured Android-wrapper blocker reopens the engine decision.
