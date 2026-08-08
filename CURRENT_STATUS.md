# Severe Weather Warning Current Status

**Last updated:** 2026-08-08 11:51 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** Android landscape  
**Production renderer:** Three.js  
**Production revival branch:** `agent/threejs-production-revival`  
**Frozen gameplay/fun baseline:** PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`

## Canonical identity

The full product name is **Severe Weather Warning**.

- The player directly controls the storm.
- `Heartland` is campaign terminology, not the product title.
- The response is a media circus, not combat.
- People remain protected and are never targets.
- Animals and media crews remain invincible/non-targetable.
- Android landscape remains the primary design target.

## Production direction

Three.js is production again.

The PlayCanvas migration remains preserved as research evidence, but it is no longer the production-renderer direction. Do not continue stacking production features on the PlayCanvas lineage unless the owner explicitly reopens that decision.

The production revival begins directly from the Three.js build the owner prefers to play:

- Draft PR #26
- Exact baseline: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Workflow Run 6: `31094966986`
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

This branch is intentionally rooted at that exact head so the PlayCanvas steering/camera/destruction implementation is not production ancestry.

## Owner comparison that caused the pivot

On 2026-08-08 the owner tested the promoted PlayCanvas candidate and reported:

- PlayCanvas gameplay was improving, but forward play felt wrong; steering required backing up and maneuvering like a truck and trailer.
- Destruction was better than earlier PlayCanvas versions, but remained roof-heavy, used large chunks, and depended too much on Pull/Gust/Zap for satisfying breakup.
- The opening cutscene looked and felt like cheap animation.
- The game overall still looked prototype-quality.
- The original Three.js gameplay was more fun.
- The original Three.js destruction was better.
- Preferred direction: keep the fun Three.js game and improve its visuals/graphics pipeline instead of continuing the renderer migration.

That hands-on comparison is a production-direction result, not a request to make PlayCanvas numerically closer.

## Protected Three.js behavior

Graphics work must preserve:

- direct forward storm steering and accepted mobile input feel;
- Pull, Gust, and Grid Zap behavior;
- satisfying natural storm-contact destruction;
- continuous scoring and accepted combo behavior;
- three-minute warning clock and forward-only stage progression;
- Heartland campaign/progression/persistence contracts;
- pause/background/reset/cleanup behavior;
- Cow 17 and safe-animal law;
- accepted Android landscape controls.

A graphics milestone may not retune gameplay because an authored mesh, camera shot, or material is inconvenient.

## PlayCanvas status

PlayCanvas work remains valuable research and should not be deleted.

Retain its lessons on:

- explicit presentation/gameplay authority boundaries;
- staged building anatomy;
- debris mass hierarchy;
- camera/Cow 17 regression tests;
- exact-source artifact promotion;
- intro timing gates;
- assistant visual review before owner review.

But the promoted browser candidate lost the owner comparison on steering feel, natural destruction, overall visual quality, and opening presentation. Passing CI did not make it the more fun game.

PR #39 remains unmerged and is superseded by the Three.js production pivot. Its branch, workflow evidence, screenshots, and artifacts remain research references.

## Active build train

`Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`

The first production milestone is an **asset-pipeline foundation**, not another engine migration and not a gameplay rewrite.

### Stage 0: current

- production revival branch created directly from PR #26 head: yes
- Three.js restored as production direction: in progress in repo memory
- PlayCanvas preserved as research: yes
- gameplay code changed during pivot: no
- owner fun comparison recorded: yes

### Stage 1: next

Build a real authored-asset seam around the accepted Three.js game:

- GLB/glTF-first production asset registry;
- centralized loading/caching;
- presentation metadata separate from collision/damage truth;
- offline Capacitor-compatible assets;
- documented mobile texture/geometry budgets;
- missing-asset fallback;
- one existing destructible structure proving the pipeline without changing its gameplay executor.

Do not upgrade the Three.js version in this same milestone.

## Destruction direction

The next destruction visual pass must improve **ordinary tornado contact**, not only action abilities.

Target qualities:

- smaller and more varied breakup pieces where mobile budget allows;
- visible wall/interior/frame/trim anatomy rather than roof-dominant chunks;
- staged damage readable before full destruction;
- Pull/Gust/Zap amplify spectacle instead of being required for it;
- at least two structure types eventually prove reusable destruction anatomy;
- reset remains deterministic.

Useful PlayCanvas mass-hierarchy lessons may be ported as presentation ideas, but the Three.js gameplay/destruction executor remains the authority.

## Opening cinematic direction

Keep the canonical story beats, replace the implementation approach.

The final opening should be rendered from the same production world, assets, materials, lighting, characters, and atmosphere as gameplay:

newspaper -> farm reveal -> Cow 17 drinks Moo Brew -> weather/radio -> double take -> chickens scatter -> barn roof/tornado touchdown -> direct gameplay handoff.

No separate cheap-animation visual universe. No warning-clock consumption behind the cinematic. Keep it skippable.

## QA law learned from the migration

Numbers protect invariants; they do not automatically protect fun.

Every gameplay-facing visual milestone must include both objective regression evidence and an owner comparison against the frozen Three.js reference. Explicitly ask whether:

- forward steering still feels direct;
- ordinary contact destruction is satisfying;
- debris is varied rather than giant roof-heavy slabs;
- world/cinematic/gameplay share one visual language;
- the candidate is at least as fun as the frozen reference.

## Current QA boundary

The public QA deployment may still contain the last promoted PlayCanvas research candidate under `/playcanvas/`. That does not make PlayCanvas production.

Do not call the Three.js revival physically accepted until an exact revival Android artifact is installed and approved on the Galaxy S26 Ultra.

## Immediate next action

1. Finish Stage 0 repository-memory cleanup and mark PR #39 superseded/unmerged.
2. Inspect the PR #26 runtime seams for the smallest safe authored-asset integration point.
3. Create a descendant Stage 1 branch from `agent/threejs-production-revival`.
4. Add the asset registry/loader/material metadata/fallback path without changing gameplay executors.
5. Prove one existing destructible structure through that pipeline.
6. Run inherited browser checks plus a direct fun comparison before widening the art conversion.
