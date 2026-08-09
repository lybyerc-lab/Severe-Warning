# Active Handoff

Last updated: 2026-08-09 18:10 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Production renderer: Three.js r128
Project mode: Stage 2A visual production with parallel worker lanes
Director/ops branch: `agent/director-multi-agent-ops`
Current world/storm PR: #45
Current world/storm branch: `agent/threejs-hero-slice6-world-identity-storm-silhouette`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## Start here

1. Read `AGENTS.md`.
2. Read the exact assigned GitHub issue/task handoff.
3. Read `Docs/ACTIVE_PRODUCTION_SLATE.md`.
4. Read only additional documents named by the task.
5. Verify the exact task base SHA and worker branch before changing anything.

The repository is durable memory. Chat is temporary working context.

## Current production truth

- Frozen gameplay/fun baseline: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
- Hero Slice 5 parent for Slice 6: `f42f12b3e4e6b38d49f6bcc0b129b4e335f13ecf`.
- PR #45 is the current bounded world/storm visual pass and remains NOT ACCEPTED until exact visual evidence and owner review pass.
- QA-root browser iteration is the fast human test loop.
- Android debug APK generation is opt-in for deliberate device checkpoints.

## Parallel production model

The owner remains creative director and should be free to brainstorm, jump between ideas, and react to builds.

The Director/Integration lane converts ideas into bounded tasks, keeps the production slate current, assigns exact file territory, reviews worker output, chooses merge order, manages QA, and records decisions.

Worker lanes operate independently on separate branches/worktrees. One writer per branch.

Initial lanes:

### WORLD

Finish Hero Slice 6 visual quality without weakening its road law or gameplay protections.

Focus:

- Main Street must stop reading as prototype box massing;
- water tower/municipal landmark must read as authored world art;
- road/curb/sidewalk/verge/lot hierarchy must remain obvious;
- farm fence/ditch must remain road-safe;
- default tornado silhouette must remain irregular and storm-like;
- keep mobile presentation cost bounded.

### QA

Reduce iteration wall-clock time without weakening evidence.

Focus:

- split the large sequential Hero Slice workflow into reusable build/evidence and parallel QA jobs;
- stop rebuilding immutable baselines unnecessarily;
- add path-aware triggering so docs-only/task-only updates do not launch expensive visual CI;
- generalize the QA Pages publisher around artifact manifests instead of hard-coded Slice 4/5 branches;
- preserve exact-source artifact identity and blocking regression gates.

### CINEMATIC

Build the opening-cinematic foundation in isolated presentation modules without wiring it into gameplay authority yet.

Locked scene direction:

`newspaper -> farm reveal -> bipedal Cow 17 leaning at fence with chickens -> Moo Brew sip -> weather/radio shift -> slow double take -> last sip -> cup drop -> chicken panic -> Cow 17 escape -> roof peel -> touchdown -> seamless gameplay handoff`

The first cinematic worker should focus on actor/prop/shot-controller foundations and deterministic QA framing, not a full production integration in one task.

## Protected gameplay

Unless a task explicitly says otherwise, workers must not change steering/input, gameplay camera feel, storm movement authority, Pull/Gust/Grid Zap, scoring/timing/campaign state, target damage/collision authority, Cow 17 safety, Neon persistence, pause/reset lifecycle, or Android touch layout.

## Visual identity

Art thesis: **storm-charged stylized Americana**.

Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.

Spatial law:

`road -> curb -> sidewalk -> verge -> lot -> building`

Stop solving architecture by stacking generic boxes.

## Evidence law

- Green CI is engineering evidence, not visual acceptance.
- Browser approval is not physical Android acceptance.
- Workers do not merge their own work or promote QA.
- Worker completion must return exact final SHA, changed files, test evidence, screenshots/reports when required, limitations, and protected-area statement.

## Next chat / next agent

Open the assigned task ticket first. Do not use an old generic handoff when a newer exact task handoff exists.
