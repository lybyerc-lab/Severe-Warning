# Severe Weather Warning — Fresh Chat Bootstrap

This file is a **recovery protocol**, not a copied status snapshot. Do not embed live worker status here. Live status belongs in `Docs/ACTIVE_HANDOFF.md` and exact GitHub evidence.

## One-door startup

Repository: `lybyerc-lab/Severe-Warning`

Branch-independent bootstrap issue: **#71 — DIRECTOR START HERE: current authority and fresh-chat recovery protocol**

Current Director authority branch: `agent/director-stage2b-game-direction`

A fresh ChatGPT/Director session should use the GitHub connector and read Issue #71 **before answering from memory**.

## Recovery sequence

1. Fetch Issue #71.
2. Fetch `agent/director-stage2b-game-direction` and confirm its current head.
3. Read `Docs/ACTIVE_HANDOFF.md` from that branch first for current execution truth.
4. Read `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, and `Docs/ACTIVE_PRODUCTION_SLATE.md` from the same Director branch.
5. Read the exact active issues named in `Docs/ACTIVE_HANDOFF.md` and their latest Director comments.
6. Inspect the exact live heads of active worker/integration branches named by the handoff.
7. Reconcile all prose against exact branch/commit/CI evidence. Newer exact evidence wins.
8. Resume as Game Director without asking the owner to reconstruct recoverable project state.

## Authority rule for fresh-chat recovery

For **current execution state**:

1. exact issue/task authority plus exact branch/commit/CI evidence;
2. current Director `Docs/ACTIVE_HANDOFF.md`;
3. product/operating laws in `Docs/GAME_DIRECTOR.md`, `AGENTS.md`, and `Docs/WORKER_STARTUP_ORDER.md`;
4. `Docs/ACTIVE_PRODUCTION_SLATE.md` for planning/queue context;
5. `CURRENT_STATUS.md`, old PR descriptions, old build-train files, and `main` as historical evidence unless explicitly reactivated.

Do not let an older planning/status document override a fresher handoff or exact evidence.

## Important warnings

- `main` is the GitHub default branch but is **not the current Stage 2B Director authority**.
- Do not assume branch existence means a Codex worker actually started.
- Owner-reported completion remains worker-reported until the exact result/evidence is pushed and reviewable.
- Clean diff, implementation correctness, executed QA evidence, Director acceptance, owner visual/play acceptance, and physical Android acceptance are separate gates.
- Worker startup order is `assigned worktree -> assigned branch -> exact SHA -> task-versioned docs -> scope/protection/proof plan -> edit`.
- Do not production-merge rejected or merely green candidates without the required acceptance gates.

## Product identity

The game is **Severe Weather Warning**.

The stable product north star is `Docs/GAME_DIRECTOR.md`. The fresh chat should recover the current project rather than re-derive its direction.

## First response after recovery

Keep it short:

1. confirm that current repo state was recovered;
2. state the actual current status from exact evidence;
3. state the single next owner action, only if one is genuinely required.

Do not dump a generic project history unless the owner asks for it.
