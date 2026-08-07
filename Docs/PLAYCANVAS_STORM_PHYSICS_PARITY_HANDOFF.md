# PlayCanvas Storm Physics Parity Handoff

Last updated: 2026-08-07 America/Chicago
Status: active bounded implementation lane
Parent browser-approved source: `c4e1c273b82b7d08024dd1d12586f06dc2522897`

## Mission

Restore visible storm/environment physics in the PlayCanvas production slice without changing the accepted gameplay executor.

The first milestone is deliberately bounded. It is not permission to port all counties, replace gameplay authority, retune the owner-approved chase camera, or introduce generic engine physics as the source of tornado feel.

## Frozen presentation baseline

Owner hands-on testing of the expanded 190x190 Prairie Junction browser build found the one-stick chase camera good enough for the current stage. Freeze:

- one-stick camera-relative movement
- camera height and distance
- 10-degree heading dead zone
- storm/world visible scale
- owner-approved trailing response scale `0.9`
- current 190x190 terrain and nine-junction map

Do not retune these while evaluating storm physics.

## Gameplay authority law

The accepted legacy runtime remains authoritative for:

- storm transform, radius, and EF multiplier
- Pull / Gust / Zap acceptance and cooldowns
- damage and destruction state
- scoring and combo
- warning clock
- Cow 17 state and safe-animal law
- reset

PlayCanvas may add presentation-side physical motion only after the accepted executor path accepts the relevant ability or publishes the relevant damage state.

## Accepted behavior oracles

### Gust

Physical Android reference:

- exact accepted head: `4c91694b406dfca119f457135276bc145837c169`
- PR #6
- accepted result: intact small trees visibly bend away from the storm and recover; light props receive a bounded shove/wobble; heavy objects stay planted.

Reference tuning from the accepted implementation:

- tree tilt: `0.18 + strength * 0.22`
- bend: `180 ms`
- hold: `100 ms`
- recover: `680 ms`
- spring: `exp(-3.6t) * cos(4.0*pi*t)`
- light-prop shove: `1.5 + falloff * 4.5` world units
- light-prop motion duration: `340 ms`

### Pull

Physical Android reference:

- exact accepted head: `82c455fff9ddb0e6a37f60b583a87b58f73173a4`
- PR #8
- accepted result: environment clearly reads inward suction; trees anticipate, lean inward, hold, and recover; light props move modestly inward with orbital wobble; repeated Gust/Pull/reset leaves no stale reactions.

Reference tuning from the accepted implementation:

- tree tilt: `0.20 + strength * 0.26`
- anticipation: `110 ms`
- bend: `260 ms`
- hold: `240 ms`
- recover: `860 ms`
- spring: `exp(-3.4t) * cos(3.8*pi*t)`
- Pull range: storm radius times about `3.2`
- light-prop inward travel cap: `2.2 + falloff * 5.8`
- orbital wobble: about `0.6 .. 1.7` world units
- light-prop motion duration: `680 ms`

These numbers are behavior references, not a requirement to preserve Three.js implementation details.

## First bounded PlayCanvas physics slice

Implement only enough representative bodies to prove the force model:

1. several intact small trees near the Moo-Brew block
2. several lightweight loose props such as a mailbox/sign/planks
3. the authoritative Moo-Brew roof once its accepted destruction state reports roof detachment
4. optional small roof/debris chunks tied to authoritative barn damage stage

Do not include Cow 17 in destructive bodies. Cow 17 must remain safe, invincible, and non-targetable.

## Force-model ownership

Use a repository-owned custom storm force/presentation model, not generic rigid-body defaults, with explicit components for:

- radial inward suction
- tangential swirl/orbit
- vertical lift for detached debris
- mass/resistance categories
- damping/ground contact
- Gust outward impulse
- Pull amplification
- bounded turbulence

The first pass may be kinematic/deterministic if that gives better parity and repeatability. PlayCanvas owns visible transforms; the game owns the force law.

## Required integration truth

A helper-only demo is not implementation.

Required player-facing path:

- visible Pull/Gust controls call the existing accepted authority bridge
- only an accepted ability starts the corresponding PlayCanvas reaction
- authoritative barn roof-detached/damage state starts roof/chunk physics
- normal render updates advance the storm-force model from authoritative storm position/radius/EF state
- reset restores all presentation bodies exactly to their authored state
- dispose leaves no running physics state

## Required telemetry

Expose bounded runtime telemetry sufficient for browser QA to prove:

- force-field update count
- accepted Pull reaction count
- accepted Gust reaction count
- tree reaction count by ability
- light-prop displacement count by ability
- active/airborne debris count
- roof-airborne state
- maximum registered body count
- reset count
- dispose/cleanup state

## Browser QA

Blocking checks must use the actual visible controls where practical.

At minimum:

- click visible Pull and prove one or more nearby trees lean inward
- prove one or more light props move inward and acquire tangential displacement
- click visible Gust after reset and prove trees bend away and light props move outward
- prove camera constants and visible storm-speed parity remain unchanged
- drive real barn destruction through accepted authority and prove detached roof/chunks enter visible debris motion
- reset and prove every body returns to authored position/rotation with zero active reaction state
- Cow 17 remains safe
- no console or page errors

Capture screenshots for Pull, Gust, and roof/debris motion.

## Acceptance boundary

Browser green means browser-QA passed only.

Do not call storm physics matched, better, or physically accepted until the exact PlayCanvas Android APK is installed and approved on the Galaxy S26 Ultra. The older accepted PR #6/#8 behavior remains the oracle until that happens.
