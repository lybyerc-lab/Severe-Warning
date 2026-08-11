# Worker Startup Order and Checkout-Context Law

Status: binding multi-agent process companion
Last updated: 2026-08-11

## Why this exists

During Stage 2B launch of WORLD-003, GAME-002, and QA-002, all three workers attempted to read governing documents from their current checkout before switching into the assigned frozen task branch/base. This caused valid task-era files such as `Docs/GAME_DIRECTOR.md` to appear missing or stale and led workers toward locating substitutes or reinterpreting authority.

This is a concrete drift mechanism.

## Binding law

**A worker must establish task checkout context before interpreting repository documentation.**

For any task that specifies an exact branch/worktree and exact base SHA, startup order is mandatory:

1. Enter the assigned worktree.
2. Switch to the exact assigned task branch.
3. Verify the current branch is exactly the task branch.
4. Verify `git rev-parse HEAD` equals the exact task base SHA.
5. Only after branch/SHA verification succeeds, read `AGENTS.md`, the assigned issue/handoff, `Docs/GAME_DIRECTOR.md`, `Docs/ACTIVE_PRODUCTION_SLATE.md`, `Docs/IMPLEMENTATION_TRUTH_GATE.md`, and any additional task-named documents from that checkout.
6. Then state the intended change, protected unchanged behavior, and proof plan before editing.

If branch or SHA verification fails, stop and report the mismatch. Do not continue by reading whatever documentation happens to be present in the current checkout.

## Forbidden recovery behavior

Before checkout verification, workers must not:

- search for an alternate or 'canonical' replacement for a task-named document;
- declare a task document stale or missing based on the wrong checkout;
- substitute documentation from another branch, default branch, or newer Director branch;
- rebase, merge, reset, or otherwise move the task base in order to make a document appear;
- reinterpret task authority because the pre-switch checkout tells a different story;
- expand scope to reconcile differences between unrelated checkout states.

The task's specified branch and base define the documentation context unless the Director explicitly changes the task contract.

## Why order matters

Repository documentation is versioned source. A file that is absent, older, or different on one branch may be present and correct on the task's exact frozen base. Reading docs before establishing checkout identity mixes two different historical contexts and can create false contradictions.

The dangerous sequence is:

`wrong checkout -> document appears missing/stale -> worker searches for substitute -> authority is reinterpreted -> implementation drifts`

The required sequence is:

`assigned worktree -> assigned branch -> exact SHA verified -> governing docs read -> bounded task interpretation -> implementation`

## Stage 2B execution adjustments discovered in practice

These are now part of the process model, not informal chat memory.

### 1. Checkout context comes before documentation context

The first Stage 2B launch prompt accidentally told workers to read governing files before switching/verifying their assigned checkout. WORLD, GAME, and QA all independently hit the same failure mode. Future launch prompts must always put branch/SHA verification before task-versioned document reading.

### 2. Environment gaps are not automatically repository defects

QA-002 reported that the local Windows worktree did not have `ffmpeg`, while the Ubuntu GitHub Actions workflow deliberately installs it before the dependent evidence steps.

Director rule:

- distinguish missing local tooling from a product/repository failure before changing source;
- run safe local checks that the environment supports;
- use the declared CI environment for evidence owned by that environment;
- record the local limitation in return evidence;
- do not add dependencies, rewrite workflows, or weaken gates merely to make one developer machine resemble CI.

If CI cannot cover a genuinely required local-only dependency, stop and report the dependency instead of improvising.

### 3. New workflow tasks need a pre-integration self-proof path

QA-002 introduced a new `workflow_dispatch`-only prototype workflow on its worker branch. GitHub manual dispatch requires the workflow file to exist on the repository default branch before it can receive a dispatch, so the branch could not execute its own required harmless example run before integration.

Future workflow-authoring tasks must answer during task design:

- How can this new workflow be executed before it reaches the default branch?
- Is a temporary branch-only/path-limited trigger required for self-validation?
- Can the validation trigger be structurally prevented from promoting QA, merging, publishing, or gaining production authority?

A workflow implementation is not acceptance-complete until its required execution evidence is actually obtainable.

### 4. Code-shape approval and acceptance evidence are separate gates

QA-002 demonstrated a useful distinction: a branch can have an excellent drift profile and still be incomplete because required executed evidence is missing.

Director review should therefore explicitly separate:

- **scope/drift verdict**: did the branch change only what the ticket authorized?
- **implementation verdict**: does the code appear to implement the requested mechanism?
- **execution/evidence verdict**: did the required run, artifact, screenshot, regression, or device evidence actually occur?

Do not promote a clean diff into a completed task merely because the implementation looks correct.

## Director / task-authoring rule

Future worker launch prompts and issue startup instructions should reflect this same order. Do not tell workers to read task-versioned governing docs before switching/verifying the task checkout.

When a newer process law must apply to a deliberately frozen older base, add that law directly to the task issue/launch note rather than rebasing the worker solely to obtain newer documentation.

For tasks that create or materially change CI/workflow machinery, the ticket must include an explicit pre-integration execution plan so the new machinery can prove itself before it gains authority.

## Completion relevance

Checkout identity is part of drift evidence. Worker completion should report:

- task branch;
- starting base SHA;
- final SHA;
- confirmation that governing docs were read only after task checkout verification;
- any mismatch encountered before editing;
- environment-specific limitations that affected local verification;
- for new workflows, exact executed validation evidence or a clearly stated blocker.

## Process lesson

These incidents are not treated as worker mistakes to remember informally. They are treated as production-system defects with durable fixes.

**Never interpret task authority from an unverified checkout.**

**Never change the repository merely because one local environment differs from the declared evidence environment.**

**Never call a new workflow complete until there is a valid way to execute and prove it.**
