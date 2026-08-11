# Active Handoff

Last updated: 2026-08-11 10:57 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## Director startup

Repository state is durable memory. Chat is temporary context.

1. Read `AGENTS.md` from the Director branch.
2. Read `Docs/GAME_DIRECTOR.md` and `Docs/WORKER_STARTUP_ORDER.md`.
3. Read this handoff and `Docs/ACTIVE_PRODUCTION_SLATE.md`.
4. Read exact active issues and latest Director comments.
5. Inspect live worker branch heads before claiming completion or liveness.
6. Never use `main` as project authority.

Startup law:

`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

For a prepared remote branch whose local ref is absent and network access is unavailable, the Director may explicitly authorize local branch creation from the exact approved commit SHA only if that commit object already exists locally. See `Docs/WORKER_STARTUP_ORDER.md` and the latest task comment. Never substitute another SHA.

## Production truth

- Frozen gameplay/fun reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
- Rejected but technically green QA #29 source: `b501737e71e61b979901d4899d969390aa37b1f4`.
- QA #29 remains owner product-rejected because the default tornado read as attack bubbles / graphics regression and Cow Level was presentation-only.
- Browser-first remains the production path. Android is opt-in for deliberate physical checkpoints.
- Green CI is engineering evidence, not product acceptance.
- Drift is a product defect.

## First-batch state

### WORLD #61 - SW-WORLD-003

Issue: #61
Branch: `agent/sw-world-003-storm-hero-recovery`
Original base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Owner previously reported WORLD-003 complete, but GitHub still shows the assigned branch at the untouched base and no durable worker return.

**Current WORLD assignment:** recovery/evidence only. The latest Director comment on #61 reassigns WORLD to locate, freeze, and persist the already-completed local WORLD-003 state without redesign or retuning. Read-only worktree/branch/reflog inspection is explicitly authorized for forensic recovery. Do not create a fresh storm implementation from the base.

WORLD-003 remains a first-batch integration gate because visual acceptance requires the actual completed head plus screenshots for default hero read, Main Street, and lower-funnel/ground-contact.

### GAME #62 - SW-GAME-002

Finished branch: `agent/sw-game-002-moo-level-unlock`
Frozen head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Owner reports GAME complete. Director code-shape review found the Hart Farm unlock encounter and persistent dedicated MOO LEVEL on-scope. Final exact-head browser/QA evidence still needs Director reconciliation before first-batch integration. Do not send GAME back for new feature work merely because evidence is not persisted.

### QA #63 - SW-QA-002

Accepted branch: `agent/sw-qa-002-rapid-prototype-lane`
Accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`

Director status: **ACCEPTED integration candidate**.

Exact-head GitHub Actions Run `31494975840` completed successfully and uploaded artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains explicitly non-production.

## Current next-wave assignments

### QA -> #64 SW-PWA-001

Branch: `agent/sw-pwa-001-installable-shell`
Exact starting SHA: `73b28e07a5b05dd632226af851b06a32e99bb068`

QA reported a local missing-ref blocker. Director independently confirmed the remote branch exists at the exact approved SHA and authorized local branch creation from that SHA if the commit object exists locally. No alternate SHA, branch, rebase, or substitute checkout is allowed.

Goal: installable **Severe Weather Warning** PWA shell with correct `/Severe-Warning/` scope, standalone launch, manifest/icons, deterministic source identity, and a cache/update strategy that cannot trap testers on stale QA builds.

### GAME -> #65 SW-UI-001

Branch: `agent/sw-ui-001-newspaper-presentation`
Exact starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Goal: one coherent **Severe Weather Warning** local-newspaper presentation family across storm selection, **UNLEASH STORM**, opening-newspaper identity where practical, and end-run results.

Protect GAME-002 Moo Level behavior, unlock truth, score/stat calculations, storm-selection semantics, movement/camera, campaign timing/objectives, WORLD presentation, and QA/PWA authority.

### WORLD #66 - SW-LEVEL-001

Branch: `agent/sw-level-001-storm-site-framework`
Starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Owner reports WORLD has completed this task. At the latest GitHub check, the remote branch still points to the starting SHA and Issue #66 has no final worker return.

Treat #66 as **worker-complete locally, durable return missing**. The latest Director comment freezes the local completed state and forbids new #66 feature work, reset, rebase, deletion, or overwrite. Record/preserve the exact local final SHA and evidence, then publish the exact frozen result when connectivity permits.

WORLD is no longer implementing #66. It has been reassigned to #61 return recovery because WORLD-003 remains the higher-value first-batch integration blocker.

## Queue after current seams

- #67 `SW-RPG-001`: MOO-LAH, Storm Triangle, meaningful upgrades, synergies. Keep queued until progression/ability tuning can reopen safely and the current UI/site seams are stable enough for an exact base.
- #68 `SW-SCORE-001`: persistent local-first scorekeeper, records, competitive replay loop. Keep queued until #65 establishes the results/newspaper seam so persistence does not collide with parallel results UI work.

No Stage 2B Integration worker is active. First-batch integration waits for WORLD-003 visual evidence and GAME-002 evidence reconciliation plus an explicit merge order.

## Product laws

- Genre: arcade destruction game with light action RPG progression.
- Full player-facing title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone.
- Exactly three active abilities per run in the Storm Triangle; storm form/passives are separate.
- Physical/discoverable synergy is a replay pillar. Named prototype: **Pull + Gust = Slingshot**.
- MOO-LAH is earned gameplay currency, not a manipulative retention economy.
- Persistent local-first scorekeeping is a must-have core system.
- Newspaper presentation is recurring UI identity for storm select, UNLEASH STORM, and results.
- Weather Map direction is a stylized nostalgic U.S. destination selector.
- Storm Sites are authored substantial destruction fantasies with signature moments, not generic procedural arenas.
- Phone is a platform, not the intended size of the game. Preserve controller-friendly architecture where practical.
- Become C++-ready, not C++-dependent. No rewrite.

## Immediate Director actions

1. Manage WORLD on #61 recovery until the completed storm head and visual evidence are durable and reviewable.
2. Preserve completed #66 locally and review it once its exact head/evidence are published.
3. Watch QA #64 after exact-SHA local-ref recovery and review its returned PWA evidence.
4. Watch GAME #65 and visually review the newspaper presentation without allowing gameplay-authority drift.
5. Reconcile GAME #62 executed evidence before first-batch integration.
6. Immediately feed freed lanes the next conflict-safe task after acceptance or a bounded return blocker, without launching #67/#68 into known seam collisions.
7. Do not production-merge rejected QA #29.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
