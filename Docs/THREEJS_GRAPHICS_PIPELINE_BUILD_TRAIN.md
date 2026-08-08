# Three.js Graphics Pipeline Build Train

Date: 2026-08-08
Status: active production direction
Branch: `agent/threejs-production-revival`
Production baseline: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

## Mission

Improve the visual production quality of **Severe Weather Warning** without sacrificing the gameplay feel that already works.

The accepted Three.js game remains the gameplay and destruction authority. This train is not an engine rewrite and is not permission to redesign steering, abilities, scoring, campaign timing, safe-animal behavior, or destruction rules while doing art work.

## Owner comparison that triggered this train

On 2026-08-08 the owner compared the promoted PlayCanvas browser candidate against the preserved Three.js game and reported:

- gameplay is improving in PlayCanvas, but forward movement feels wrong and requires backing/steering like a truck and trailer;
- destruction is somewhat improved but still relies on large chunks, roof-heavy breakup, and action abilities for the more satisfying effects;
- the PlayCanvas opening and the game overall still read as cheap/prototype animation;
- the original Three.js gameplay was more fun;
- the original Three.js destruction was better;
- the preferred direction is to retain the Three.js gameplay and improve the visual pipeline instead of continuing the renderer migration.

That owner comparison outranks the earlier renderer-direction hypothesis.

## Frozen gameplay baseline

The production revival starts from draft PR #26 head:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

Reference evidence:

- Workflow Run 6: `31094966986`
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

Protected behavior includes:

- direct storm steering and forward play feel;
- Pull, Gust, and Grid Zap input/execution;
- natural storm-contact destruction;
- scoring, combo, warning clock, districts, campaign, and persistence;
- Cow 17 and safe-animal behavior;
- pause/background/reset/cleanup behavior;
- Android landscape control layout.

A graphics milestone may not retune those systems merely to make a visual implementation easier.

## Renderer rule

- Three.js remains production.
- Keep the production Three.js version frozen during the first art-pipeline milestone.
- Do not combine an engine-version upgrade with asset-pipeline construction, destruction changes, or cinematic redesign.
- PlayCanvas remains preserved research evidence. Do not delete its branches, artifacts, reports, or lessons.

## Stage 0: Production pivot and evidence seal

Goal: make repository truth match the owner decision before visual implementation resumes.

Required:

- branch directly from the PR #26 accepted gameplay head;
- record the renderer pivot in `Docs/DECISIONS.md`;
- replace PlayCanvas-as-production language in front-door repository memory;
- preserve PlayCanvas as research, not production ancestry;
- keep PR #39 unmerged and mark it superseded by the production pivot;
- record the owner comparison above as the reason.

Exit gate:

- front-door docs consistently name Three.js as production;
- no gameplay code change in Stage 0;
- exact baseline SHA remains visible in repo memory.

## Stage 1: Asset pipeline foundation

Goal: make real authored art a first-class input instead of expanding procedural prototype geometry.

Required architecture:

- one explicit asset registry for production visual assets;
- GLB/glTF as the preferred authored 3D interchange format;
- centralized loading and caching rather than ad-hoc loaders inside gameplay code;
- explicit material/presentation metadata separate from gameplay collision and damage truth;
- mobile texture and geometry budgets documented and mechanically checkable;
- fallback presentation when an optional authored asset fails to load;
- production assets must work offline inside the Capacitor package;
- no network dependency at runtime;
- no change to authoritative gameplay collision just because the presentation mesh changes.

Initial asset categories:

- buildings and destructible anatomy;
- terrain/road dressing;
- farm props and Moo Brew identity;
- vegetation/light props;
- cows/chickens/media props;
- tornado presentation layers;
- cinematic-only camera markers and set dressing where useful.

Exit gate:

- at least one existing structure uses the registry and an authored presentation asset while retaining the accepted gameplay executor and collision truth;
- missing-asset fallback works;
- desktop and 932x430 mobile-landscape browser QA pass;
- Android package contains every required asset locally;
- no accepted-control or destruction regression.

## Stage 2: Destruction presentation upgrade

Goal: make ordinary tornado contact satisfying before abilities are required.

Direction:

- smaller and more numerous readable breakup pieces where performance allows;
- wall, roof, trim, window/door, frame, and interior anatomy instead of roof-dominant chunks;
- visible staged damage before final destruction;
- contact destruction must produce meaningful visible damage on its own;
- Pull/Gust/Zap amplify or redirect destruction rather than being the only path to spectacle;
- retain mass hierarchy lessons from PlayCanvas without importing its gameplay executor;
- keep debris bounded and mobile-safe.

Exit gate:

- ordinary storm contact can visibly damage and destroy a test structure without using an ability;
- breakup is not dominated by one giant roof slab;
- at least two distinct structure types prove reusable destruction anatomy;
- reset fully restores structure and debris state;
- gameplay feel remains the PR #26 baseline.

## Stage 3: World rendering and atmosphere

Goal: remove the broad prototype look using one coherent production visual language.

Scope:

- physically coherent materials;
- lighting and shadow discipline;
- sky, clouds, storm light, haze, rain/dust/debris atmosphere;
- road/terrain material separation and topology readability;
- vegetation and prop density budgets;
- authored landmark silhouettes;
- camera-facing readability at gameplay speed.

Do not redesign gameplay while tuning visual composition.

Exit gate:

- Prairie Junction and one farm block read as authored places rather than debug geometry;
- roads remain visually and topologically legible;
- stable mobile frame pacing on the Galaxy target;
- no camera/control regressions.

## Stage 4: In-engine opening cinematic

Goal: replace the cheap separate-animation feel with a short scene rendered by the same world, assets, materials, lighting, and characters used in gameplay.

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

- no loading break between cinematic and gameplay;
- no separate visual universe;
- skippable;
- warning clock begins at the gameplay handoff, not behind the cinematic;
- cinematic camera work must not alter accepted gameplay camera/steering after handoff.

Exit gate:

- owner says the opening looks like the same game they are about to play;
- no cheap-card/overlay-animation dependency for the core scene;
- gameplay begins fresh and immediately controllable.

## Stage 5: Mobile production hardening

Goal: make the improved art pipeline sustainable on Android.

Required:

- asset-size budget report;
- geometry/texture counts;
- draw-call and material-count evidence;
- LOD/instancing strategy where measured need exists;
- compressed/local packaged assets where supported by the frozen renderer/toolchain;
- prolonged-session frame pacing, heat, and battery checks;
- exact APK evidence and Galaxy S26 Ultra acceptance.

## QA law: protect fun, not only numbers

Automated tests remain necessary, but the previous migration proved that numerically stable systems can still feel worse.

Every meaningful gameplay-facing visual candidate therefore needs both:

1. objective regression evidence, and
2. a short owner fun/readability check.

New subjective acceptance prompts should explicitly cover:

- Can I drive the tornado forward where I intend without backing up to steer?
- Does ordinary storm contact feel destructive without an ability?
- Are breakup pieces varied and readable rather than giant roof-heavy slabs?
- Does the world look authored rather than prototype-generated?
- Does the cinematic look like the same game as gameplay?
- Is the game at least as fun as the frozen Three.js reference?

A candidate that passes CI but loses the fun comparison does not advance.
