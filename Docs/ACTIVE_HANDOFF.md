# Active Handoff

Last updated: 2026-08-08 11:51 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current production direction: Three.js revival + graphics pipeline
Active branch: `agent/threejs-production-revival`
Active build train: `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`

## Start here

The repository is the authoritative project memory. Do not restart renderer selection from chat history.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read `CURRENT_STATUS.md`.
3. Read this file.
4. Read `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`.
5. Read `Docs/DECISIONS.md`, especially D-011 and D-012.
6. Inspect draft PR #26 and exact head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
7. Inspect the current revival branch and its descendant implementation PR before changing production code.
8. Treat PlayCanvas PRs/artifacts as research unless the owner explicitly reopens that direction.

## Frozen production gameplay reference

Draft PR #26: **Restore Moo Brew presentation identity and readable cows**

Exact head:

`1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

Evidence:

- Workflow Run 6: `31094966986`
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

This is the gameplay/fun ancestry for resumed production work.

Do not replace or retune during graphics-pipeline work:

- direct storm steering;
- forward movement feel;
- Pull/Gust/Grid Zap execution;
- natural storm-contact destruction;
- scoring/combo/timer/stage/campaign truth;
- safe-animal behavior and Cow 17;
- pause/background/reset/cleanup behavior;
- Android landscape input layout.

## Owner verdict that ended the PlayCanvas production migration

On 2026-08-08 the owner tested the promoted PlayCanvas candidate and reported:

- forward driving felt wrong and required backing up/steering like a truck and trailer;
- destruction improved but remained too large-chunk and roof-heavy;
- satisfying breakup depended too much on action abilities;
- the opening looked like cheap animation;
- the wider game remained graphically prototype-quality;
- the original Three.js gameplay was more fun;
- the original Three.js destruction was better.

The owner then approved returning production to Three.js and building the graphics pipeline there.

This is a production-direction verdict. Do not treat the PlayCanvas line as merely waiting for another tuning pass.

## PlayCanvas research status

Preserve, do not delete:

- PR #35 rotation-stable storm-physics research;
- PR #36 multi-structure destruction research;
- PR #37 staged anatomy/debris mass-hierarchy research;
- PR #39 gated Moo Brew opening research;
- Run 53/62/76/83 reports and artifacts;
- camera/Cow 17 regression ideas;
- explicit authority/presentation adapter lessons;
- exact-source artifact promotion discipline;
- assistant visual-review gate.

PR #39 is superseded by the renderer pivot and must remain unmerged. Its current public `/playcanvas/` candidate is research QA only.

## Current branch state

`agent/threejs-production-revival` was created directly from PR #26 exact head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.

Stage 0 work on this branch is documentation/architecture truth only. No gameplay code should change during the pivot seal.

Front-door repo memory should say:

- Three.js production;
- PlayCanvas research;
- PR #26 frozen fun baseline;
- graphics pipeline next;
- owner fun comparison is a required gate.

## Immediate implementation milestone

**Stage 1: authored asset pipeline foundation**

Create a descendant implementation branch from `agent/threejs-production-revival` after Stage 0 is sealed.

The bounded Stage 1 job is:

- identify the smallest safe presentation seam around one existing destructible Three.js structure;
- add one explicit production asset registry;
- make GLB/glTF the preferred authored 3D asset format;
- centralize loading/caching;
- keep presentation metadata separate from gameplay collision and damage truth;
- require local/offline Capacitor-compatible assets;
- document mobile texture/geometry budgets;
- provide a fallback presentation if an optional authored asset is unavailable;
- prove one existing structure through the pipeline without changing steering, abilities, scoring, timing, camera feel, safe animals, or destruction executor semantics.

Do not upgrade the Three.js version in Stage 1.

## Destruction follow-up after Stage 1

Once the asset seam is proven, improve presentation around the accepted destruction executor:

- ordinary tornado contact must visibly damage/destroy without using an ability;
- smaller/varied debris where mobile budget allows;
- wall, interior, frame, trim, windows/doors, and roof anatomy;
- staged damage before final breakup;
- Pull/Gust/Zap amplify spectacle rather than unlock the only satisfying damage path;
- at least two structures eventually prove reusable destruction anatomy;
- reset remains deterministic.

Port lessons, not the PlayCanvas gameplay executor.

## Cinematic follow-up

The canonical Moo Brew sequence remains approved as story:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio -> Cow 17 double take -> chickens scatter -> barn roof/tornado touchdown -> gameplay.

The implementation must eventually be rebuilt using the same production Three.js world, assets, materials, lighting, characters, and atmosphere as gameplay. No separate cheap-animation layer. Keep it skippable and start the warning clock only at the gameplay handoff.

## QA and acceptance law

Automated checks protect invariants but do not prove fun.

For every meaningful gameplay-facing visual candidate, record both:

- objective regression evidence; and
- owner hands-on comparison against PR #26.

Explicit questions:

- Can the tornado drive forward naturally without backing up to steer?
- Is ordinary contact destruction satisfying without an ability?
- Are debris pieces varied and readable rather than giant roof-heavy slabs?
- Does the world look authored rather than prototype-generated?
- Does the cinematic look like the same game as gameplay?
- Is this at least as fun as the frozen Three.js reference?

A green candidate that loses those comparisons does not advance.

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md`, `CURRENT_STATUS.md`, `Docs/ACTIVE_HANDOFF.md`, `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`, and `Docs/DECISIONS.md`. Three.js is production again under D-012. Start from PR #26 exact head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`. Preserve its gameplay feel and natural destruction. PlayCanvas is research only. Continue the bounded graphics-pipeline milestone without changing gameplay authority or upgrading the renderer in the same pass.
