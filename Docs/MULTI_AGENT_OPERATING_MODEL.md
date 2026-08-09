# Severe Weather Warning Multi-Agent Operating Model

Status: active production process
Owner role: Creative Director
Integration role: Director/Integrator
Worker model: bounded parallel coding agents on isolated branches/worktrees

## Purpose

Increase production throughput without sacrificing gameplay protection, visual judgment, exact-source evidence, or repository memory.

The owner should be able to focus on ideas, humor, feel, visual reactions, playtesting, and product direction. The production system should absorb the coordination burden.

## Roles

### Creative Director

The owner:

- proposes ideas freely;
- changes creative emphasis when something feels more important;
- plays QA candidates;
- decides whether the game is fun and whether visuals are worth keeping;
- approves meaningful direction changes.

The owner does not need to manually maintain dependency graphs, CI topology, branch ancestry, worker file ownership, QA evidence, or merge order.

### Director/Integrator

The Director/Integrator:

- translates ideas into durable production decisions and task inventory;
- protects the active acceptance slice from scope drift;
- creates worker task IDs and exact handoffs;
- pins exact base SHAs;
- assigns non-overlapping file territories;
- reviews worker output and CI evidence;
- requests follow-up fixes when needed;
- decides merge/cherry-pick/rebase/abandon order;
- maintains `AGENTS.md`, `CURRENT_STATUS.md`, `Docs/ACTIVE_PRODUCTION_SLATE.md`, and decision history;
- controls QA-root promotion and acceptance language.

### Worker Agent

A worker:

- receives one bounded task;
- verifies the exact base SHA;
- works only in the assigned branch/worktree;
- stays inside allowed file territory;
- runs the required verification;
- returns exact final SHA and evidence;
- never self-merges or self-promotes QA;
- does not broaden product scope.

## Branch law

- One writable branch/worktree per worker.
- One worker per branch.
- Worker branch names start with the stable task ID.
- Workers never push directly to another worker's branch.
- Production/integration branches are updated only by the Director/Integrator.
- Sealed evidence branches remain immutable.

## Task handoff contract

Every task ticket must contain:

1. Task ID
2. Role/lane
3. Exact repository
4. Exact base SHA
5. Worker branch name
6. Goal
7. Why the task exists
8. Allowed file territory
9. Forbidden/protected territory
10. Required reading
11. Implementation constraints
12. Required verification
13. Definition of done
14. Required return format
15. Non-goals

If the task cannot be completed without crossing a forbidden boundary, the worker stops and reports the dependency.

## Initial lanes

### SW-WORLD

World/storm visual quality and Stage 2A acceptance work.

Owns bounded Hero Slice 6 presentation code, its verifier/QA evidence, and directly related art modules when explicitly assigned.

Does not own core gameplay authority.

### SW-QA

CI throughput, reusable build/evidence jobs, cache/reference strategy, QA publisher generalization, diagnostics, and test orchestration.

Does not weaken blocking acceptance gates to gain speed.

### SW-CIN

Opening-cinematic presentation foundation: articulated presentation actors, Moo Brew props, shot controller, deterministic cinematic framing, cinematic-only VFX/animation helpers.

Initial cinematic tasks do not wire new logic into warning-clock authority, gameplay input, scoring, damage, or animal gameplay state.

### Future lanes

Add only when useful and non-overlapping, for example:

- SW-PERF for draw-call/material/object-budget reduction;
- SW-AUDIO for authored weather/destruction/cinematic soundstage;
- SW-ASSET for provenance-safe art intake and conversion;
- SW-REGION for later campaign expansion.

## Integration cadence

1. Director creates/updates production slate.
2. Director opens bounded worker tasks from a pinned source.
3. Workers run in parallel.
4. Director reviews returned SHAs/diffs/evidence independently.
5. Work that fails scope, tests, performance, or visual intent is returned to the same lane for correction.
6. Accepted worker changes are integrated in dependency order.
7. Exact integrated candidate runs blocking CI.
8. Human visual evidence is inspected.
9. Reviewed candidate may be promoted to QA root.
10. Owner plays and gives direction.
11. Outcome is recorded in repo memory.

## QA throughput principles

- Build once, test many.
- Parallelize independent browser suites against the same exact candidate artifact.
- Reuse immutable verified baseline artifacts when possible.
- Avoid expensive CI on docs/task-only changes.
- Keep exact-source identity and artifact digests blocking.
- Keep failure diagnostics easy to inspect.
- Make QA publishing manifest-driven instead of milestone-name-driven.
- Android packaging is opt-in for deliberate device checkpoints.

## Creative idea capture

Ideas are welcome at any time.

The Director classifies each meaningful idea as:

- **active**: solving the current acceptance slice;
- **queued**: approved direction waiting for its dependency;
- **parked**: preserved but not approved for implementation;
- **rejected**: deliberately not pursuing, with reason when useful.

A new idea does not silently erase unfinished active work.

## Acceptance law

A worker can finish a task. CI can finish a build. Neither equals product acceptance.

Visual acceptance still requires human evidence review. Owner browser approval still requires hands-on play. Physical Android acceptance still requires the exact Android artifact on the target device.
