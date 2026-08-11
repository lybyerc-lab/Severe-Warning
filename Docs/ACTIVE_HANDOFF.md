# Active Handoff

Last updated: 2026-08-11 11:10 America/Chicago
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

If a prepared remote branch is absent locally and network is unavailable, the Director may explicitly authorize local branch creation from the exact approved SHA only when that exact commit object already exists locally. Never substitute another SHA.

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

Branch: `agent/sw-world-003-storm-hero-recovery`
Original base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Owner previously reported WORLD-003 complete, but GitHub still shows the assigned branch at the untouched base and no durable worker return.

**Current WORLD assignment:** recovery/evidence only. The latest Director comment on #61 directs WORLD to locate, freeze, and persist the already-completed local WORLD-003 state without redesign or retuning. WORLD-003 remains the first-batch visual gate until the actual completed head and required screenshots are durable and Director-reviewed.

### GAME #62 - SW-GAME-002

Finished GAME branch: `agent/sw-game-002-moo-level-unlock`
Frozen GAME head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Director code-shape review remains provisionally PASS for the Hart Farm unlock encounter and persistent dedicated MOO LEVEL.

**Current QA assignment:** independent GAME-002 evidence closure on verification branch `agent/sw-qa-003-game-002-evidence-closure`, starting exactly at `89aeac92d032bfc6546cb8da7c52effc7a408aa1`.

QA must execute and persist the existing `verify:sw-game-002` and `qa:sw-game-002` proof, including Hart Farm unlock, failure rearm, persistence, dedicated Moo County Fair launch, cow safety, normal-campaign regression, screenshots, exact commands/environment, and drift statement. No product-code change is expected. If the exact commit is unavailable locally and network is unavailable, stop and report rather than substituting authority.

### QA #63 - SW-QA-002

Accepted branch: `agent/sw-qa-002-rapid-prototype-lane`
Accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`

Director status: **ACCEPTED integration candidate**.

Exact-head GitHub Actions Run `31494975840` completed successfully and uploaded artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains explicitly non-production.

## Next-wave state

### QA #64 - SW-PWA-001

Branch: `agent/sw-pwa-001-installable-shell`
Approved base: `73b28e07a5b05dd632226af851b06a32e99bb068`
Worker-complete head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`

Owner reports QA completed the assignment. Director review finds the branch exactly one commit ahead with changes confined to package scripts, `pwa/*`, bounded web build/serve/QA scripts, and QA-package verification.

Director scope/code-shape verdict: **PASS and frozen**.

The implementation provides the Severe Weather Warning manifest/install shell, project-relative scope/start paths, source identity, stale-cache defenses, versioned managed cache cleanup, offline fallback, and static/Playwright QA harnesses. No gameplay or promotion authority moved.

Final acceptance remains separate because no exact-head GitHub Actions run is associated with `7cda055a...` and the worker's executed local `test:pwa` / `qa:pwa` report is not yet persisted in the issue. Do not send QA back for feature work merely because that evidence is not yet durable. Reconcile the existing evidence independently when available.

QA has moved on to #62 evidence closure.

### GAME #65 - SW-UI-001

Branch: `agent/sw-ui-001-newspaper-presentation`
Exact starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Goal: one coherent **Severe Weather Warning** local-newspaper presentation family across storm selection, **UNLEASH STORM**, opening-newspaper identity where practical, and end-run results.

At the latest Director check, the remote branch still points to its exact starting SHA. Do not infer active execution merely from assignment. Protect GAME-002 Moo Level behavior, unlock truth, score/stat calculations, storm-selection semantics, movement/camera, campaign timing/objectives, WORLD presentation, and QA/PWA authority.

### WORLD #66 - SW-LEVEL-001

Branch: `agent/sw-level-001-storm-site-framework`
Starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Owner reports WORLD completed this task. GitHub still shows the remote branch at the starting SHA and Issue #66 has no final worker return.

Treat #66 as **worker-complete locally, durable return missing**. Preserve/freeze the local completed state. Do not reset, rebase, delete, overwrite, or add new #66 feature work. WORLD is currently reassigned to #61 recovery because WORLD-003 is the higher-value integration blocker.

## Queue after current seams

- #67 `SW-RPG-001`: MOO-LAH, Storm Triangle, meaningful upgrades, synergies. Keep queued until progression/ability tuning can reopen safely and current UI/site seams are stable enough for an exact base.
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
3. Manage QA on #62 exact-head evidence closure; accept or pin a concrete defect from executed proof.
4. Reconcile the already-completed PWA #64 local execution evidence without reopening feature scope.
5. Watch GAME #65 and visually review the newspaper presentation when its exact returned head appears.
6. Immediately feed freed lanes the next conflict-safe task after acceptance or a bounded return blocker.
7. Keep #67 and #68 queued until their overlap seams are safe.
8. Do not production-merge rejected QA #29.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
