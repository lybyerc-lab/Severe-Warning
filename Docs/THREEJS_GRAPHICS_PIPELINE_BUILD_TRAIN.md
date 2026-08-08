# Three.js Graphics Pipeline Build Train

Date: 2026-08-08
Status: active production direction
Production renderer: Three.js r128
Frozen gameplay/fun baseline: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
Sealed Stage 1 source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`
Active visual branch: `agent/threejs-visual-production-foundation`

## Mission

Improve the visual production quality of **Severe Weather Warning** without sacrificing the gameplay feel that already works.

The accepted Three.js game remains gameplay/destruction authority. This train is not an engine rewrite and is not permission to redesign steering, abilities, scoring, campaign timing, safe-animal behavior, or authoritative destruction while doing art work.

## Owner verdicts that govern this train

### Renderer/gameplay pivot

On 2026-08-08 the owner compared the promoted PlayCanvas browser candidate against the preserved Three.js game and reported that PlayCanvas steering felt wrong, destruction remained too roof-heavy/large-chunk and ability-dependent, the opening looked cheap, the wider game remained prototype-quality, and the original Three.js gameplay/destruction were more fun.

Production returned to Three.js under D-012.

### Stage 1 browser acceptance

The owner later tested the sealed Three.js Stage 1 browser candidate at `/threejs/` and reported: **“Great build. Plays really well. I missed it.”**

That is the browser owner PASS for the fun baseline and authored-presentation seam.

It is not final graphics approval and it is not physical acceptance of the exact debug APK on Galaxy S26 Ultra.

### Active visual mandate

The owner then directed: stay on this path until it is beautiful, make the opening cinematic beautiful, raise the whole game to the same visual standard, and evaluate useful external sprites/assets where they genuinely help.

## Frozen behavior law

Graphics milestones may not retune merely for implementation convenience:

- direct storm steering and forward play feel;
- Pull, Gust, and Grid Zap input/execution;
- natural storm-contact destruction authority;
- scoring, combo, warning clock, stages, campaign, and persistence;
- Cow 17 and safe-animal behavior;
- pause/background/reset/cleanup behavior;
- gameplay camera feel;
- Android landscape control layout.

## Renderer law

- Three.js remains production.
- Keep the renderer version frozen during the visual foundation unless a separately approved technical milestone proves an upgrade is necessary.
- Do not combine a renderer upgrade with asset-pipeline, destruction, world-art, or cinematic changes.
- PlayCanvas remains preserved research evidence. Port lessons, not its gameplay executor.

## Visual laws

Read `Docs/THREEJS_VISUAL_STYLE_BIBLE.md`.

Art thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

Gameplay and cinematic must share one visual universe. External asset packs are ingredients, not the art director.

## Asset/provenance law

Read:

- `Docs/ASSET_INTAKE_AND_PROVENANCE.md`
- `assets/production/asset-provenance.json`

CC0 is preferred for external visual assets. Unknown/unlicensed content is rejected. Every production import requires exact source revision/path, license evidence, local destination/checksum, and transformation notes. Runtime network asset dependencies are forbidden.

## Stage 0: Production pivot and evidence seal — COMPLETE

Completed:

- production revival rooted directly at PR #26 exact head;
- Three.js restored as production;
- PlayCanvas preserved as research;
- D-012 recorded;
- PlayCanvas PR #39 closed unmerged as superseded research;
- no gameplay code changed for the pivot itself.

## Stage 1: Asset pipeline foundation — BROWSER OWNER PASS

Sealed source:

`f2060dff08ddb9df9f90ecd245940d8db86c7266`

Evidence:

- Three.js Asset Pipeline Foundation Run 5: `31270418326`, success
- artifact: `severe-weather-threejs-asset-pipeline-5`
- artifact digest: `sha256:90360c1811f0976d6f8d798c75997fb07b5eb6f6e51a8b1d885fa6ab3de0f3e5`
- debug APK SHA-256: `496439b2adc434c29cb0fd7db5ce6f03047efa20d964ba19cf397ef42be95b10`
- public QA: `https://lybyerc-lab.github.io/Severe-Warning/threejs/`

Stage 1 proved:

- an explicit authored presentation seam around accepted gameplay truth;
- optional asset loading with fallback;
- packaged local/offline asset path;
- static mutation guards around protected gameplay fields;
- browser success/fallback evidence;
- same-runner performance comparison;
- Android debug packaging;
- owner browser confirmation that the game still plays really well.

The current JSON storefront is a pipeline proof, not the final production art format. GLB/glTF remains the preferred wider authored 3D direction.

## Stage 2A: Visual production foundation and hero slice — ACTIVE

Goal: establish a coherent visual system on one representative slice before spreading unfinished art across the map.

Required:

- visual style bible enforced;
- asset provenance/license manifest enforced;
- one Hart Farm block with Cow 17/Moo Brew identity;
- one Prairie Junction street/storefront view;
- stronger road/terrain separation;
- production sky/storm-light/haze direction;
- representative vegetation and utility dressing;
- selected mobile-friendly dust/rain/debris VFX cards;
- one authored destructible structure with readable material/anatomy language;
- deterministic pristine and damage evidence views;
- no gameplay-authority change.

Exit gate:

- owner says the slice no longer reads as prototype-generated;
- road/target readability survives gameplay speed;
- storm/VFX add scale without hiding steering;
- same slice is credible as a cinematic environment;
- inherited gameplay regression suite remains green;
- mobile performance remains credible.

## Stage 2B: Destruction presentation upgrade — NEXT AFTER 2A VISUAL LANGUAGE HOLDS

Goal: make ordinary tornado contact satisfying before abilities are required while preserving the accepted destruction executor.

Direction:

- smaller and more numerous readable secondary breakup pieces where budget allows;
- wall, roof, trim, window/door, frame, and interior anatomy instead of roof-dominant chunks;
- visible staged damage before final destruction;
- material-specific dust/debris accents;
- Pull/Gust/Zap amplify or redirect spectacle rather than gate it;
- retain useful PlayCanvas mass-hierarchy lessons without importing its gameplay executor;
- keep debris bounded/mobile-safe.

Exit gate:

- ordinary storm contact visibly damages and destroys a test structure without an ability;
- breakup is not dominated by one giant roof slab;
- at least two structure types prove reusable anatomy;
- reset fully restores structure/debris state;
- gameplay feel remains the frozen baseline.

## Stage 3: World rendering and atmosphere

Goal: widen the accepted hero-slice language into authored places instead of debug geometry.

Scope:

- coherent material library;
- lighting/shadow discipline;
- sky, clouds, storm light, haze, rain/dust/debris atmosphere;
- road/terrain material separation and topology readability;
- vegetation and prop density budgets;
- authored landmark silhouettes;
- camera-facing readability at gameplay speed.

Exit gate:

- Prairie Junction and farm districts read as authored places;
- roads remain visually/topologically legible;
- representative mobile frame pacing remains stable;
- no camera/control regression.

## Stage 4: In-engine opening cinematic

Goal: replace the cheap separate-animation feel with a short scene rendered by the same production world, assets, materials, lighting, characters, and atmosphere as gameplay.

Canonical beats remain:

1. warning newspaper;
2. farm reveal;
3. Cow 17 drinks Moo Brew;
4. weather shift/radio warning;
5. Cow 17 double take;
6. chickens scatter;
7. barn roof/tornado touchdown;
8. direct tactical handoff into gameplay.

Rules:

- no loading break;
- no separate visual universe;
- skippable;
- warning clock begins at gameplay handoff;
- cinematic camera cannot alter accepted gameplay steering/camera after handoff.

Exit gate:

- owner says the opening is beautiful and looks like the same game they are about to play;
- the current DOM/CSS intro is no longer the core visual implementation;
- gameplay begins fresh and immediately controllable.

## Stage 5: Mobile production hardening

Goal: make the improved visual pipeline sustainable on Android.

Required:

- asset-size budget report;
- geometry/texture/material counts;
- draw-call evidence;
- LOD/instancing strategy where measured need exists;
- compressed/local packaged assets where supported by the frozen renderer/toolchain;
- prolonged-session frame pacing, heat, and battery checks;
- exact APK evidence and Galaxy S26 Ultra physical acceptance.

## QA law: protect fun and beauty

Automated tests protect invariants but do not prove fun or visual quality.

Every meaningful visual candidate needs:

1. objective regression evidence;
2. assistant visual review of representative deterministic evidence;
3. owner hands-on fun/readability/beauty check before widening.

Explicit questions:

- Can I drive the tornado forward naturally without backing up to steer?
- Does ordinary storm contact feel destructive without an ability?
- Are breakup pieces varied/readable rather than giant roof-heavy slabs?
- Does the world look authored rather than prototype-generated?
- Are roads/targets readable under weather effects?
- Does the cinematic look like the same game as gameplay?
- Is the candidate at least as fun as the frozen Three.js reference?
- Is the representative slice genuinely beautiful enough to become the rest of the game's yardstick?

A candidate that passes CI but loses those comparisons does not advance.
