# Severe Weather Warning Active Production Slate

Last updated: 2026-08-10
Status: canonical near-term work queue

This file exists so project direction survives short chat windows. Product identity lives in `Docs/GAME_DIRECTOR.md`. Chat is temporary working context.

## Operating law

- GitHub is durable project memory.
- Owner feedback may be qualitative. The Director translates it into game-design and implementation contracts.
- The owner is not the branch/QA/task coordinator.
- Green CI is engineering evidence, not game-quality acceptance.
- Prototype gear is for answering uncertain visual/game-feel questions quickly.
- Production gear remains exact-source, sealed, regression-gated, integration-reviewed, and owner-playtested.
- One worker, one task, one writable branch/worktree.

## Current public QA checkpoint

Public QA root:

`https://lybyerc-lab.github.io/Severe-Warning/`

Exact deployed Stage 2A integration candidate:

- PR #59
- Hero Slice Run #29
- source `b501737e71e61b979901d4899d969390aa37b1f4`
- artifact `severe-weather-threejs-hero-slice6-web-29`
- Pages publisher Run #84

Status: technically green and publicly playable, but **not visual/product accepted**.

## QA #29 owner playtest truth

Positive:

- a full round was fun;
- core tornado-control/destruction gameplay remains worth protecting.

Blocking notes:

1. Default tornado reads like **"attack bubbles"**.
2. Graphics feel regressed in some areas.
3. Existing Hart Farm cow-ring Easter egg has no clear gameplay purpose.
4. Owner wants a genuine secret Cow Level. The Hart Farm encounter should unlock it.
5. Game needs stronger replayability and commercial-mobile presentation.
6. Quality target is a real video game that is exciting to show people, not merely a demonstration of Three.js or AI-generated code.

These notes are product truth for Stage 2B.

## Active phase

# Stage 2B: Make It Feel Like a Game

Umbrella issue: #60

North star: `Docs/GAME_DIRECTOR.md`

Director docs branch: `agent/director-stage2b-game-direction`

First-batch coordination base:

`ca7ec1a9dcdc4c6ca8d73304fd99108385f29f39`

That coordination base descends directly from public QA #29 source `b501737e71e61b979901d4899d969390aa37b1f4` and adds Stage 2B direction/docs only. It does not alter gameplay/runtime behavior.

Acceptance question:

> Does the candidate look and play materially more like a finished, replayable commercial mobile game than QA #29?

If the answer requires an explanation of where to look, the change probably did not move far enough.

## First parallel batch

All first-batch workers verify HEAD equals the Stage 2B coordination base above before editing.

### SW-WORLD-003: Storm hero recovery

Issue: #61
Branch: `agent/sw-world-003-storm-hero-recovery`
State: ready for WORLD Codex launch

Goal:

- remove the mobile "attack bubbles" read;
- recover the tornado as one connected atmospheric hero mass;
- audit graphics regression against stronger earlier visual evidence;
- preserve gameplay authority.

Director visual bias: ragged condensation-column/wedge hybrid, continuous mass, streak structure, dark inner core, lower debris sheath, strong ground attachment, broken cloud-base transition, no visible effect primitives.

### SW-GAME-002: Real Moo Level path

Issue: #62
Branch: `agent/sw-game-002-moo-level-unlock`
State: ready for GAME Codex launch

Goal:

- convert Hart Farm cow ring into a clear short unlock challenge;
- persist `mooLevelUnlocked`;
- reveal a secret MOO LEVEL node;
- build a dedicated roughly 90-second Moo County Fair bovine score-attack bonus stage;
- make cow relocation/airtime and a MOO METER meaningful;
- provide a replayable best score and clear return path.

This is an intentional bounded reopening of secret-level/progression authority. Unrelated gameplay remains protected.

### SW-QA-002: Rapid prototype evidence lane

Issue: #63
Branch: `agent/sw-qa-002-rapid-prototype-lane`
State: ready for QA Codex launch

Goal:

- create a fast exact-source build/smoke/screenshot/web-artifact lane for prototypes;
- materially shorten the time from idea to visual evidence;
- give prototype evidence zero production authority;
- preserve all existing full sealed QA and Pages-publisher contracts.

## Next queue after first batch

Do not launch these until first-batch evidence teaches us what should be kept.

### Destruction and game-feel pass

Planned owner: GAME plus presentation support.

Focus:

- stronger impact/readability;
- destruction-stage anatomy;
- directional debris and dust;
- restrained camera impulse;
- sound/music punctuation;
- combo/score feedback;
- escalating spectacle without visual clutter.

The task should preserve ordinary-contact destruction authority unless a specific behavior is deliberately reopened.

### Replay loop and progression pass

Build on real playtest lessons from the Moo Level rather than inventing a detached meta-game.

Candidate systems:

- score mastery and challenge routes;
- rotating/branching objectives;
- persistent secret/cosmetic/storm-form unlocks;
- campaign/map reasons to revisit locations;
- local-news/media collection or milestone moments;
- absurd tracked statistics;
- clear near-miss goals that generate "one more run."

### Commercial presentation pass

Focus on moments that make the game feel shippable:

- menu/weather-map hierarchy;
- unlock/reward moments;
- results-screen motivation;
- readable objective presentation;
- sound/UI transitions;
- visual consistency across cinematic, gameplay, and results.

## Existing accepted/protected features

Preserve unless a specific Stage 2B issue reopens them:

- direct steering/input/general gameplay-camera feel;
- ordinary tornado movement authority;
- Pull and Gust behavior;
- integrated Grid Zap values/topology from SW-GAME-001;
- road-safe utilities;
- normal campaign scoring/timing/objectives;
- Neon unlock/selection/persistence;
- Cow 17 safety/targetability;
- opening Moo Brew cinematic lifecycle and warning-clock handoff;
- browser-first rapid iteration and opt-in Android checkpoints.

## Moo Level product law

The Hart Farm ring is an unlock encounter, not the final secret level.

The actual Moo Level must be a dedicated authored playable bonus stage with its own objective/score identity and replay reason.

The desired folklore is:

> "Wait, you haven't unlocked the cow level yet?"

## Director autonomy decision

The owner has explicitly asked the Director to take the reins on game-development translation.

The owner should be able to say things like:

- "attack bubbles";
- "Blocktown";
- "it feels regressed";
- "I want an actual cow level";
- "this isn't satisfying enough";
- "this is fun";

and have the Director turn that into concrete design, worker scope, sequencing, evidence, and acceptance criteria.

Do not make the owner pre-specify technical implementation merely because the feedback is qualitative.

## Android

Android remains opt-in for deliberate physical-device checkpoints. Browser approval never silently becomes device acceptance.

## Integration law

Workers do not merge themselves. The Director reviews exact heads and evidence first.

A Stage 2B integrated candidate may auto-promote to the QA root only after it passes the normal exact-source integration workflow. Public QA is still a playtest gate, not production/release approval.
