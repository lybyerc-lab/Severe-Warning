# Severe Weather Warning

**Severe Weather Warning** is a mobile-first, single-player arcade destruction game in which the player directly controls the storm.

The active production game is again the Three.js/WebGL build rooted at `MechanicsLab/SevereWeather_3D_Lab.html` and the accepted modernization/runtime layers. Capacitor packages the same offline web build for Android landscape play.

PlayCanvas, Unity, Godot, and Babylon.js work remain preserved as experiments, research, or historical evidence. They are not the active production renderer path.

## Canonical identity

- Full product name: **Severe Weather Warning**
- Current campaign/content family: **Heartland**
- Production renderer: **Three.js**
- Primary platform: **Android landscape**
- Browser build: QA and rapid gameplay/art review
- Android build: physical touch, performance, audio, lifecycle, heat, battery, and final acceptance

“Heartland” is campaign terminology, not a replacement title for the game.

## Production revival baseline

The production revival is intentionally rooted directly at draft PR #26 head:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

Reference evidence:

- Workflow Run 6: `31094966986`
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

Active production revival branch:

`agent/threejs-production-revival`

The branch begins at the exact Three.js gameplay build the owner preferred over the promoted PlayCanvas candidate. The pivot itself does not change gameplay code.

## Why the renderer direction changed back

A promoted PlayCanvas research candidate passed extensive automated QA but lost the owner hands-on comparison.

Observed problems included:

- forward movement that felt like backing and steering a truck/trailer rather than directly driving the storm;
- destruction that remained too roof-heavy and large-chunk oriented;
- too much dependence on Pull/Gust/Zap for satisfying breakup;
- an opening that looked like cheap separate animation;
- an overall prototype visual feel;
- less enjoyable gameplay and weaker natural destruction than the preserved Three.js build.

The lesson is simple: stable numbers are useful, but they do not automatically preserve fun.

## Protected gameplay baseline

Graphics and art-pipeline work must preserve:

- direct storm steering and forward play feel;
- Pull, Gust, and Grid Zap behavior;
- satisfying natural storm-contact destruction;
- continuous scoring and accepted combo behavior;
- forward-only district/stage progression;
- three-minute real-time warning clock;
- Heartland campaign progression and persistence contracts;
- QA input isolation and deterministic reset/cleanup;
- people protected and never targetable;
- animals invincible, non-targetable, and used only for safe slapstick;
- news crews and storm chasers as invincible witnesses, never enemies.

## Engine and pipeline decisions

- Three.js is production.
- Keep the production Three.js version frozen during the first graphics-pipeline milestone.
- Do not combine an engine upgrade with asset-pipeline construction, destruction redesign, or cinematic work.
- PlayCanvas is preserved research evidence, not production ancestry.
- No engine rewrite is justified by visual dissatisfaction alone.
- The immediate strategy is to improve the Three.js asset, art, destruction, rendering, and authoring pipeline while protecting the game that is already fun.

## Active milestone: graphics pipeline foundation

See `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`.

The first implementation milestone is intentionally small:

- establish one explicit production asset registry;
- prefer authored GLB/glTF assets for production 3D presentation;
- centralize loading/caching;
- keep presentation meshes/materials separate from gameplay collision and damage truth;
- define mobile geometry/texture budgets;
- require offline/local Capacitor-compatible assets;
- provide missing-asset fallbacks;
- prove the pipeline on one existing destructible structure before converting the wider world.

The first pipeline milestone must not retune steering, abilities, scoring, timing, camera feel, safe animals, or gameplay destruction authority.

## Destruction visual direction

The next destruction pass should make ordinary tornado contact satisfying on its own.

Target presentation:

- smaller and more varied breakup pieces where mobile performance allows;
- wall/interior/frame/trim anatomy instead of roof-dominant breakup;
- staged visible damage before final destruction;
- Pull/Gust/Zap amplify or redirect spectacle rather than being required for it;
- reusable destruction anatomy across at least two distinct structures;
- deterministic reset and bounded debris.

Useful presentation lessons from the PlayCanvas research, including staged anatomy and mass hierarchy, may be brought back without importing its gameplay executor.

## Opening cinematic direction

Keep the canonical story, replace the cheap separate-animation implementation.

The production opening should use the same world, models, materials, lighting, characters, atmosphere, and renderer as gameplay:

warning newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio shift -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> direct gameplay handoff.

It stays skippable, cannot consume the warning clock behind the scene, and should look like the same game the player is about to control.

## Repository map

- `MechanicsLab/`: active Three.js game source and preserved browser laboratories
- `runtime/`: maintained Three.js runtime source fragments
- `android/`: Capacitor Android project
- `scripts/`: build, patch, verification, QA, and packaging tools
- `Docs/`: product direction, current decisions, device evidence, build trains, and historical records
- `playcanvas-slice/`: preserved renderer-migration research, not active production
- `Experiments/`: isolated renderer and visual-engine research
- `Godot/`: preserved migration experiment
- `Assets/`, `Packages/`, `ProjectSettings/`: preserved Unity history

## Required reading before production implementation

1. `CURRENT_STATUS.md`
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`
4. `Docs/DECISIONS.md`
5. `Docs/ACCEPTED_BEHAVIOR.md`
6. `Docs/QA_BACKLOG.md`
7. `Docs/IMPLEMENTATION_TRUTH_GATE.md`

The repository is the durable project record. Chat is working context until resulting decisions and evidence are committed here.
