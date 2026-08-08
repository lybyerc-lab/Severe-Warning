# Active Handoff

Last updated: 2026-08-08 14:23 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current production direction: Three.js visual production
Active branch: `agent/threejs-visual-production-foundation`
Active build train: `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`
Visual style law: `Docs/THREEJS_VISUAL_STYLE_BIBLE.md`
Asset intake law: `Docs/ASSET_INTAKE_AND_PROVENANCE.md`

## Start here

The repository is the authoritative project memory. Do not restart renderer selection or migrate away from Three.js because the current art is unfinished.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read `CURRENT_STATUS.md`.
3. Read this file.
4. Read `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`.
5. Read `Docs/THREEJS_VISUAL_STYLE_BIBLE.md`.
6. Read `Docs/ASSET_INTAKE_AND_PROVENANCE.md` and `assets/production/asset-provenance.json`.
7. Read `Docs/DECISIONS.md`, especially D-012.
8. Inspect sealed Stage 1 source `f2060dff08ddb9df9f90ecd245940d8db86c7266` and current visual branch before changing production code.
9. Treat PlayCanvas branches/artifacts as research only unless the owner explicitly reopens that direction.

## Frozen fun reference

PR #26 exact head:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

Reference evidence:

- Workflow Run 6: `31094966986`
- artifact: `severe-weather-presentation-identity-6`
- debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

Protected gameplay includes direct storm steering, forward movement feel, Pull/Gust/Grid Zap, natural storm-contact destruction, score/combo/timer/stage/campaign truth, Cow 17 and safe-animal law, pause/reset cleanup, gameplay camera feel, and Android landscape input layout.

## Sealed Stage 1 asset-pipeline source

Exact source:

`f2060dff08ddb9df9f90ecd245940d8db86c7266`

Evidence:

- Three.js Asset Pipeline Foundation Run 5: `31270418326`, success
- artifact: `severe-weather-threejs-asset-pipeline-5`
- artifact digest: `sha256:90360c1811f0976d6f8d798c75997fb07b5eb6f6e51a8b1d885fa6ab3de0f3e5`
- debug APK SHA-256: `496439b2adc434c29cb0fd7db5ce6f03047efa20d964ba19cf397ef42be95b10`
- public QA: `https://lybyerc-lab.github.io/Severe-Warning/threejs/`
- QA overlay deployment Run 1: `31271092725`, success

The owner tested this public Three.js browser candidate and reported: **“Great build. Plays really well. I missed it.”**

That closes the browser owner gate for Stage 1 gameplay/fun and the authored-presentation seam. It does not approve current final graphics and it does not claim physical acceptance of the exact debug APK on Galaxy S26 Ultra.

## Owner visual mandate

On 2026-08-08 the owner directed:

- stay on this Three.js path until it is beautiful;
- build a much better graphics pipeline;
- make the opening cinematic beautiful;
- make the rest of the game reach the same visual standard;
- investigate useful sprites/assets on GitHub where they can help.

Do not interpret this as permission to sacrifice the fun baseline.

## Active art direction

Art thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

Do not aim for photorealism, generic toy-plastic low-poly, pixel-art collage, or unrelated asset-pack aesthetics.

External assets are ingredients only. Hero structures, destruction anatomy, Cow 17/Moo Brew identity, tornado presentation, landmarks, and cinematic close-up assets require a coherent project-owned/restyled visual language.

## External asset gate

Nothing from GitHub or another source enters production without exact provenance and license evidence.

Current reviewed candidates are recorded in `assets/production/asset-provenance.json`:

- Kenney Particle Pack, CC0, candidate for selected VFX sprites/cards;
- KayKit City Builder Bits, CC0, candidate secondary props/reference pool;
- Kenney Starter Kit City Builder assets, README-declared CC0 asset set, research-only until exact individual paths are recorded.

No runtime network asset dependency is allowed. Production files must ship locally in the web and Capacitor packages.

## Immediate milestone: hero visual acceptance slice

Stay narrow until the pipeline looks genuinely good.

Build one representative slice with:

- Hart Farm block with Cow 17/Moo Brew identity;
- Prairie Junction street/storefront view;
- road/terrain separation;
- production sky, storm light, haze/weather atmosphere;
- vegetation and utility dressing;
- one authored destructible structure with staged readable anatomy;
- selected dust/rain/debris VFX cards;
- deterministic pristine and damage evidence views.

The point is not to decorate the whole map. The point is to make one slice beautiful enough to become the yardstick for the whole game and the opening cinematic.

## Destruction requirement inside the hero slice

Ordinary tornado contact must visibly damage/destroy without an ability. Avoid roof-only spectacle and giant generic chunks. Use wall, interior, frame, trim, windows/doors, roof, and secondary material-specific debris within the mobile budget.

Pull/Gust/Zap amplify spectacle; they do not gate it.

## Opening cinematic follow-up

Keep the approved story:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio shift -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> gameplay.

Rebuild it in the same production Three.js world and visual language as gameplay. The current DOM/CSS intro is a temporary story prototype. No loading break. Keep it skippable. Start the warning clock at gameplay handoff.

## Acceptance law

Every meaningful visual candidate must satisfy both objective regressions and hands-on owner judgment.

Ask:

- Is steering still direct and fun?
- Is ordinary contact destruction satisfying?
- Does the world look authored rather than prototype-generated?
- Are roads and targets readable at gameplay speed?
- Do VFX add scale without obscuring control?
- Does destruction reveal believable anatomy rather than roof-heavy slabs?
- Would the opening cinematic look like this same game?
- Is this at least as fun as the sealed Three.js reference?

A green build that loses those comparisons does not advance.

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md`, `CURRENT_STATUS.md`, `Docs/ACTIVE_HANDOFF.md`, `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`, `Docs/THREEJS_VISUAL_STYLE_BIBLE.md`, `Docs/ASSET_INTAKE_AND_PROVENANCE.md`, and `Docs/DECISIONS.md`. Three.js is production. The sealed Stage 1 source is `f2060dff08ddb9df9f90ecd245940d8db86c7266`, and the owner browser verdict says it plays really well. Active work is the hero visual-production slice on `agent/threejs-visual-production-foundation`. Preserve gameplay authority. Use external assets only through the provenance/license/style gate. Stay on the representative slice until it is genuinely beautiful before widening the art conversion.
