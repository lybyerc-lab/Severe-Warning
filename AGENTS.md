# Severe Weather Warning Agent Operating Contract

This repository is the durable project memory. Chat is working context only.

## Mission

Build **Severe Weather Warning** as a fun, humorous, polished Three.js mobile arcade destruction game while protecting the gameplay feel that already works.

The owner is the creative director. The owner is expected to brainstorm freely, jump between ideas, react to builds, and decide what is fun. The owner is **not** expected to manually coordinate branches, QA, task dependencies, or implementation details.

The Director/Integration agent owns decomposition, sequencing, worker handoffs, conflict prevention, evidence review, integration, QA promotion, and repository memory.

Worker agents execute bounded tasks. They do not silently redirect the product.

## Authority order

When sources disagree, prefer newer exact evidence over older confident prose.

1. Exact task ticket/handoff for the worker's assigned task
2. Current repository code and exact-commit CI/QA evidence
3. `Docs/ACTIVE_PRODUCTION_SLATE.md`
4. `CURRENT_STATUS.md`
5. `Docs/ACTIVE_HANDOFF.md`
6. `Docs/DECISION_LOG.md` and `Docs/DECISIONS.md`
7. Active visual/build-train documentation
8. Accepted-behavior, QA, system-map, and historical documentation

Historical Unity, Godot, PlayCanvas, and older HTML experiments remain evidence only. They do not override the current Three.js production direction.

## Current production truth

- Product: **Severe Weather Warning**
- Production renderer: **Three.js r128**
- Frozen gameplay/fun reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`
- Current Stage 2A world/storm work: PR #45, branch `agent/threejs-hero-slice6-world-identity-storm-silhouette`
- Current project slate: `Docs/ACTIVE_PRODUCTION_SLATE.md`
- Public browser QA root: `https://lybyerc-lab.github.io/Severe-Warning/`
- Android APK generation is opt-in for deliberate device checkpoints, not ordinary visual iteration.

Exact task base SHA is always supplied in the worker ticket. Do not infer a newer base and do not rebase yourself unless the task explicitly tells you to.

## Multi-agent production law

1. **One task, one worker, one branch/worktree.** Never share a writable branch between agents.
2. **One integration owner.** Worker agents do not merge their own work into production branches.
3. Every worker task must specify:
   - stable task ID;
   - exact base SHA;
   - branch name;
   - goal and non-goals;
   - allowed file territory;
   - protected/forbidden areas;
   - required verification;
   - required return evidence.
4. Workers must stay inside their allowed territory. If required work crosses a protected boundary, stop and report the dependency instead of improvising.
5. New ideas discovered during implementation belong in the production slate or an issue. Do not expand the current task just because the idea is attractive.
6. A worker's successful test run is evidence, not acceptance. Integration and visual review remain separate gates.
7. The Director/Integration lane decides merge order and whether stale worker branches should be refreshed, cherry-picked, or abandoned.

## Protected gameplay law

Unless a task explicitly says otherwise, do **not** retune or rewrite:

- steering/input or accepted gameplay camera feel;
- storm speed/movement authority;
- Pull, Gust, or Grid Zap behavior;
- scoring, combo, timer, warning stages, objectives, rank, or campaign authority;
- target health, points, damage/destruction authority, gameplay coordinates, or collision truth;
- Cow 17/animal safety or targetability;
- Neon unlock/selection/persistence authority;
- pause/reset/lifecycle behavior;
- Android touch layout.

Presentation layers may read gameplay truth. They may not become gameplay authority.

## Current visual laws

- Art thesis: **storm-charged stylized Americana**.
- Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
- Roads own protected corridors before decorative placement.
- Town spatial hierarchy: `road -> curb -> sidewalk -> verge -> lot -> building`.
- Farm spatial hierarchy must visibly stop fences/ditches/details for road crossings and resume afterward.
- Stop solving architecture by stacking generic boxes.
- Storm is the hero.
- Mobile restraint matters: bounded objects, draw calls, effects, particles, and materials.
- External assets require exact provenance/license evidence and must be made stylistically coherent.

## Opening cinematic locked direction

The final opening is **Moo Brew Touchdown**, built inside the same Three.js world and visual language as gameplay.

Canonical beat:

`newspaper -> farm reveal -> Cow 17 and chickens at fence -> weather/radio shift -> slow double take -> last Moo Brew sip -> cup drop -> chicken panic -> Cow 17 escape -> barn roof peel -> tornado touchdown -> seamless gameplay handoff`

Locked director choices:

- Cow 17 is upright/bipedal for the character beat, leaning casually on the fence like a coworker at an office water cooler.
- Cow 17 sips a recognizable Moo Brew cup.
- Chickens perform small conversational acting beats: pecking, head bobs, glances, interruption-like reactions, then delayed weather recognition.
- Humor comes primarily from timing and body language, not mandatory spoken dialogue.
- No separate DOM/CSS cartoon universe.
- No loading break.
- Warning clock begins only at gameplay handoff.
- Target 10-15 seconds; first viewing may be mandatory, repeats remain skippable.

## QA cadence

### Rapid iteration

Browser-first is the default loop:

1. exact-source build;
2. static/process checks;
3. inherited gameplay regression QA;
4. bounded visual QA;
5. same-runner performance evidence where relevant;
6. exact web evidence artifact;
7. human screenshot review;
8. promote reviewed candidate to QA root;
9. owner/informal playtest feedback;
10. record outcome in repo memory.

### Android

Generate an APK only for deliberate device checkpoints such as milestone acceptance, touch/camera/lifecycle changes, WebView/device-only behavior, or release candidates. Physical Android acceptance requires an actual install and run on the target device.

## Worker startup checklist

Before editing:

1. Read this file.
2. Read the assigned task issue/handoff completely.
3. Read `Docs/ACTIVE_PRODUCTION_SLATE.md`.
4. Read `Docs/IMPLEMENTATION_TRUTH_GATE.md`; its machine-checkable implementation-truth rules remain blocking.
5. Read only the additional docs named by the task.
6. Verify `git rev-parse HEAD` equals the exact task base SHA.
7. Verify the current branch matches the task branch/worktree.
8. Inspect only the relevant implementation and tests before proposing edits.

## Worker completion contract

Return all of the following:

- task ID;
- exact final commit SHA;
- changed-file list;
- concise implementation summary;
- tests/commands run and their result;
- screenshots/reports when the task requires them;
- known limitations or follow-up dependencies;
- explicit statement that protected gameplay areas were not intentionally changed.

Do not merge. Do not promote QA. Do not claim owner visual acceptance or physical Android acceptance.

## Status vocabulary

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI produced expected evidence.
- **Browser-QA passed**: repository browser verification passed for the exact source.
- **Public QA deployed**: exact verified web artifact is live at the QA root.
- **Owner browser-approved**: owner played and approved the bounded browser-stage behavior.
- **Physically accepted**: exact Android artifact was installed, played, and approved on the target device.
- **Merged**: approved branch was integrated into its intended base.
