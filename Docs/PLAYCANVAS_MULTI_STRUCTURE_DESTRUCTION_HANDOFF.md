# PlayCanvas Multi-Structure Destruction Handoff

Last updated: 2026-08-07 America/Chicago
Status: bounded implementation lane ready
Parent browser-stage source: `f5f01678595bf857840759604f362c93f62598e8`
Parent bookkeeping head: `b2e0d1206100f5cfeee13b32d20d38df03d8d4db`

## Owner-approved baseline

Preserve without retuning:

- Run 53 tree Pull/Gust response
- Run 62 camera rotation stability
- Run 62 Cow 17 finite safe-flight behavior
- 190 x 190 Prairie Junction scale test
- one-stick camera-relative controls
- camera distance, height, base turn rate, dead zone, and trailing scale `0.9`
- accepted Pull, Gust, and Zap execution semantics
- score/combo/timer/campaign authority
- safe/invincible/non-targetable animal law

Latest owner hands-on result:

- camera runaway orbit corrected
- Cow 17 endless orbit corrected
- tree bend still good
- one currently destructible building understood as intentional bounded scope

## Goal

Expand the PlayCanvas production slice from one real destruction chain to a small representative set of genuinely damageable structures while the accepted legacy runtime remains gameplay authority.

This is not permission to create renderer-owned hit points or scoring.

## Required structure set

Bind four visible PlayCanvas structure archetypes to real accepted-runtime Living County targets:

1. residential house
2. Main Street storefront
3. farm/fair barn-style structure
4. Foundry Row industrial/workshop structure

Moo-Brew remains a separate protected destruction proof.

## Authority contract

The accepted legacy `targets` / `townBlocks` destruction system remains authoritative.

Expose a deterministic bounded set of non-tree target snapshots through `PLAYCANVAS_AUTHORITY_V1` with enough fields to mirror:

- stable target identity
- district/archetype
- x/z position
- health / maxHealth
- damage stage
- destroyed state
- points / block identity where available

Selection must be deterministic. Prefer one representative non-tree target per Living County district, nearest the initial playable storm area so all four remain inside the bounded Prairie Junction presentation footprint after the existing world transform.

The PlayCanvas renderer must not directly call `damageTarget`, mutate legacy target health, add score, or award combo.

## Visible destruction contract

Each bound structure must visibly communicate accepted authoritative state:

- intact
- first damage stage
- second damage stage
- destroyed/collapsed

Use distinct presentation weight by archetype:

- house: lighter roof/wall pieces
- storefront: broader facade/sign chunks
- barn/fair structure: roof-heavy breakup
- industrial/workshop: heavier, slower large chunks

Detached presentation chunks may enter the existing game-owned PlayCanvas storm force field only after authoritative damage/destruction says they should detach.

## Blocking implementation-truth checks

Browser QA must prove through normal visible controls and accepted authority:

- four bound structures exist and remain mapped inside the test world
- the accepted executor changes health/damage stage on at least two distinct structures during the scenario
- at least one structure reaches final destruction
- destruction causes score growth through accepted authority, not renderer-side scoring
- visible damage stages match authoritative target state
- detached chunks become storm-reactive only after authoritative stage/destruction transitions
- reset restores all four structures to intact authored presentation and clears detached chunk physics
- Cow 17 stays safe and excluded
- camera rotation stability suite remains green
- Run 53 tree response measurements remain within the protected envelope
- no road/terrain/tornado clearance regression
- no console/page errors

## Scope guard

Do not port all 36 Living County blocks in this milestone.

Do not add chain-reaction businesses yet.

Do not retune tree forces, camera feel, Cow 17 timing, storm speed, abilities, scoring law, combo law, warning clock, or map geometry.

## Exit criteria

A candidate may be promoted to `/playcanvas/` only after:

- exact-source PlayCanvas workflow passes
- inherited storm-physics QA passes
- inherited rotation-stability QA passes
- new multi-structure destruction QA passes
- required screenshots/report are sealed in the artifact
- artifact source stamp and digest are verified

Owner browser hands-on remains required before this destruction expansion is accepted for the browser stage.

No PlayCanvas Android physical acceptance is claimed by this milestone.
