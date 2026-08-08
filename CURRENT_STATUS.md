# Severe Weather Warning Current Status

**Last updated:** 2026-08-08 14:23 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** Android landscape  
**Production renderer:** Three.js r128  
**Active visual-production branch:** `agent/threejs-visual-production-foundation`  
**Frozen gameplay/fun baseline:** PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`  
**Sealed Stage 1 source:** `f2060dff08ddb9df9f90ecd245940d8db86c7266`

## Canonical identity

The product is **Severe Weather Warning**. The player directly controls the storm. `Heartland` is campaign terminology only. People remain protected/absent from destruction targets. Animals and media crews remain invincible/non-targetable. The response remains a media circus, not combat.

## Production direction

Three.js is production. PlayCanvas is preserved research only.

The owner compared the PlayCanvas migration against the preserved Three.js game and preferred the Three.js movement, natural destruction, and overall fun. Production therefore resumed directly from PR #26 rather than attempting another renderer migration.

Graphics work may improve presentation but may not retune steering, forward movement, Pull/Gust/Grid Zap, authoritative destruction, scoring, timer/stages, campaign persistence, safe-animal behavior, pause/reset cleanup, or the accepted gameplay camera/input feel merely to make art integration easier.

## Stage 1 asset pipeline: accepted browser foundation

Stage 1 proved an authored-presentation seam around the accepted Three.js game.

Exact sealed source:

`f2060dff08ddb9df9f90ecd245940d8db86c7266`

Evidence:

- workflow: Three.js Asset Pipeline Foundation
- Run 5: `31270418326`
- artifact: `severe-weather-threejs-asset-pipeline-5`
- artifact digest: `sha256:90360c1811f0976d6f8d798c75997fb07b5eb6f6e51a8b1d885fa6ab3de0f3e5`
- debug APK SHA-256: `496439b2adc434c29cb0fd7db5ce6f03047efa20d964ba19cf397ef42be95b10`
- public production QA: `https://lybyerc-lab.github.io/Severe-Warning/threejs/`
- QA promotion commit: `7acebcea56ffa6960197f05e851ec6ef618fc4d1`
- Deploy Three.js QA Overlay Run 1: `31271092725`, success

The owner tested the public Three.js browser candidate on 2026-08-08 and reported: **“Great build. Plays really well. I missed it.”**

That is the owner browser PASS for the fun baseline and the Stage 1 presentation seam. It is **not** approval of final graphics quality and it is **not** physical acceptance of the exact debug APK on Galaxy S26 Ultra.

## Current graphics verdict

Gameplay is worth protecting. Graphics are now the blocker.

Owner direction:

- stay on this Three.js path until it is beautiful;
- make the opening cinematic beautiful;
- make the whole game share the same higher visual standard;
- evaluate useful external sprites/assets where they genuinely help.

The current DOM/CSS Moo Brew opening remains a story prototype, not the final cinematic implementation.

## Active visual-production foundation

Active branch:

`agent/threejs-visual-production-foundation`

It starts directly from sealed Stage 1 source `f2060dff...`.

Read these before widening art work:

- `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`
- `Docs/THREEJS_VISUAL_STYLE_BIBLE.md`
- `Docs/ASSET_INTAKE_AND_PROVENANCE.md`
- `assets/production/asset-provenance.json`

Art thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

External packs are ingredients, not the art director. CC0 is preferred. Unknown/unlicensed content is rejected. Production remains offline/local inside the web and Capacitor package.

## Initial external asset candidates

Reviewed but not yet imported:

- Kenney Particle Pack via `Calinou/kenney-particle-pack`, CC0, candidate for selected dust/rain/debris/light VFX sprites;
- KayKit City Builder Bits 1.0, CC0, candidate ingredient/reference pool for secondary town props and silhouettes;
- Kenney Starter Kit City Builder assets, README-declared CC0 asset set, research pool only until exact individual paths are recorded.

No external asset is production-approved merely because the pack license is acceptable.

## Immediate hero-slice milestone

Do not spread unfinished art across the whole game yet.

Build one representative visual acceptance slice containing:

- one Hart Farm block with Cow 17/Moo Brew identity;
- one Prairie Junction street/storefront view;
- strong road/terrain separation;
- production sky/storm-light treatment;
- representative vegetation and utility dressing;
- one authored destructible structure with readable staged anatomy;
- selected dust/rain/debris VFX cards;
- deterministic pristine and damage evidence views.

The slice must remain as fun and controllable as the frozen Three.js baseline.

## Destruction visual direction

Ordinary tornado contact must deliver spectacle without requiring an ability.

Improve:

- smaller/more varied secondary breakup within mobile budget;
- wall/interior/frame/trim/window/door/roof anatomy;
- readable staged damage before final destruction;
- material-specific debris and dust accents;
- bounded mass hierarchy.

Pull/Gust/Zap amplify or redirect destruction; they do not unlock the only satisfying visuals.

## Opening cinematic direction

Canonical story remains:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio shift -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> direct gameplay handoff.

Final implementation must use the same Three.js world, assets, materials, lighting, Cow 17, atmosphere, and VFX language as gameplay. No separate cheap-animation universe. No loading break. The warning clock begins only at the gameplay handoff.

## QA law

Objective regression evidence and owner visual/fun review are both required.

A green candidate does not advance if it looks worse, drives worse, hides the road, weakens ordinary destruction, or makes the opening feel disconnected from gameplay.

Galaxy S26 Ultra physical testing remains the final Android authority.
