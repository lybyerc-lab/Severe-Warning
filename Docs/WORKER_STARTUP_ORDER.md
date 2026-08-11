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

## Director / task-authoring rule

Future worker launch prompts and issue startup instructions should reflect this same order. Do not tell workers to read task-versioned governing docs before switching/verifying the task checkout.

When a newer process law must apply to a deliberately frozen older base, add that law directly to the task issue/launch note rather than rebasing the worker solely to obtain newer documentation.

## Completion relevance

Checkout identity is part of drift evidence. Worker completion should report:

- task branch;
- starting base SHA;
- final SHA;
- confirmation that governing docs were read only after task checkout verification;
- any mismatch encountered before editing.

## Process lesson

This incident is not treated as a worker mistake to remember informally. It is treated as a production-system defect with a durable fix.

**Never interpret task authority from an unverified checkout.**
