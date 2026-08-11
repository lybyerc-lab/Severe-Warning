# Active Handoff

Last updated: 2026-08-11 08:00 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## Start here in a new chat / new Director session

The repository is durable memory. Chat is temporary working context.

1. Read `AGENTS.md` on `agent/director-stage2b-game-direction` for current operating law.
2. Read `Docs/GAME_DIRECTOR.md` for product direction.
3. Read `Docs/WORKER_STARTUP_ORDER.md` for the Stage 2B drift/process adjustments discovered during launch.
4. Read `Docs/ACTIVE_PRODUCTION_SLATE.md` for sequencing.
5. For any worker task, read the exact GitHub issue and its latest Director comments before acting.
6. Do not infer worker completion from branch activity alone. Review exact returned heads and required evidence.

Important startup law for workers:

`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> scope/protection/proof plan -> edit`

Never interpret task authority from an unverified checkout.

## Current production truth

- Frozen gameplay/fun reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
- Rejected but technically green QA #29 source: `b501737e71e61b979901d4899d969390aa37b1f4`.
- QA #29 remains **owner product-rejected** because the default tornado read as attack bubbles / graphics regression and the Cow Level was presentation-only.
- Do not production-merge QA #29 merely because its CI was green.
- Browser-first remains the active production path. Android packaging is deliberate/opt-in for physical checkpoints.
- Phone is a platform, not the intended size of the game. Design toward substantial handheld/controller-friendly play without claiming a solved console port.

## Stage 2B first batch status

### WORLD #61 — SW-WORLD-003

Issue: `https://github.com/lybyerc-lab/Severe-Warning/issues/61`
Branch: `agent/sw-world-003-storm-hero-recovery`
Base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Goal: recover the default tornado as one coherent dangerous storm mass and remove the attack-bubble read without touching protected gameplay authority.

At the 2026-08-11 08:00 checkpoint, the GitHub branch still pointed at the exact base SHA. Treat WORLD as launched/in progress but with **no committed result yet** unless newer evidence exists.

### GAME #62 — SW-GAME-002

Issue: `https://github.com/lybyerc-lab/Severe-Warning/issues/62`
Branch: `agent/sw-game-002-moo-level-unlock`
Base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Observed branch head at checkpoint: `3d3733b18cd45c877c7f4bcf3990bf77fc625f0f`

Goal: Hart Farm becomes a real unlock encounter for a persistent, separate, replayable MOO LEVEL bonus stage.

The branch has active commits, but **has not yet been Director-reviewed in this handoff**. Do not call it finished or integrate it without reviewing the exact worker return, diff, deterministic evidence, persistence, cow safety, and normal-campaign regression proof.

### QA #63 — SW-QA-002

Issue: `https://github.com/lybyerc-lab/Severe-Warning/issues/63`
Branch: `agent/sw-qa-002-rapid-prototype-lane`
Base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Reviewed head: `4361a1cb8931766548281379ae22d703675ee1df`

Director drift/code-shape verdict: **PASS**.

The branch is exactly one commit ahead of the frozen base and added only six bounded prototype/QA files. It did not modify runtime/gameplay/presentation or existing production/publisher/auto-promoter/Android workflows.

Acceptance is **not complete yet** because the new workflow is `workflow_dispatch`-only and exists only on the worker branch. GitHub requires a manually dispatched workflow to exist on the default branch, so the required harmless example run/artifact/screenshots could not yet self-prove pre-integration.

Latest Director comment on #63 requires the smallest safe pre-integration execution path, followed by a real example run proving exact SHA, elapsed time, artifact/screenshots, `productionAuthority: false`, `qaPagesDispatched: false`, and no publisher/Pages dispatch.

Do not weaken production QA or touch runtime/gameplay/presentation to solve this.

## Process adjustments learned during this batch

These are binding lessons, not chat-only observations.

1. **Checkout before docs.** WORLD, GAME, and QA all initially read governing files from the wrong checkout because the launch wording put doc reading before branch/SHA verification. The launch notes were corrected and `Docs/WORKER_STARTUP_ORDER.md` now makes the order permanent.
2. **Environment gap != repository defect.** QA lacked local Windows `ffmpeg`, while the Ubuntu workflow deliberately installs it. Use CI for CI-owned evidence; do not mutate the repo merely to make one local machine match CI.
3. **New workflows need a self-proof plan.** A branch-only `workflow_dispatch` file cannot manually dispatch itself before it exists on the default branch. Workflow tasks must include a safe pre-integration execution mechanism in their design.
4. **Clean diff != complete ticket.** QA-002 has excellent drift discipline but still needs the executed evidence required by its ticket. Keep scope verdict, implementation verdict, and execution/evidence verdict separate.
5. **Drift is a defect.** Every task states what changes, what remains unchanged, and how both will be proved. Integration rejects unexplained collateral changes even when tests are green.

## Stage 2B product direction that must survive chat rollover

Core genre: **arcade destruction game with light action RPG progression**.

Current high-level loop:

`U.S. Weather Map -> choose Storm Site -> choose Storm Form + exactly 3 active abilities -> UNLEASH STORM -> destruction/objectives/secrets -> newspaper results + records -> MOO-LAH/progression -> upgrades/unlocks -> replay or move`

Important laws/directions:

- Full player-facing title is **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Cows and Moo Brew are the comic backbone, not the entire joke vocabulary.
- **MOO-LAH** is the gameplay currency direction, earned through play rather than a manipulative retention economy.
- Exactly **three active abilities** are equipped per run in the **Storm Triangle**. Storm form and passives are separate.
- Ability synergies should be physical/discoverable, not spreadsheet bonuses. Canonical prototype example: **Pull + Gust = Slingshot**, pulling an object in and launching it across the map.
- Synergy can grow into feats/secrets/unlocks, including deliberately absurd late-game discoveries such as pulling down a satellite when the right build/progression/site conditions are met.
- Individual abilities must remain fun on their own. Synergy adds discovery rather than repairing weak abilities.
- Persistent scorekeeping is a must-have core system. Local-first records precede optional social leaderboards. Records should retain site/build/Storm Triangle/version identity.
- Newspaper presentation is the recurring UI family for storm selection, UNLEASH STORM, and end-run score/record results.
- The Weather Map should evolve into a stylized nostalgic U.S. destination-select map.
- Storm Sites should be authored substantial places with recognizable destruction fantasies and signature chains, not featureless procedural maps.
- Free Storm, location mastery, Storm Day variants, archive/scrapbook, score pace, and special challenge editions are approved directions with places in the game, but should be sequenced rather than dumped into the current first-batch workers.
- Cow-fucius is an approved recurring humor concept. Loading/transitions are the preferred first home; Moo Brew spokesperson/philosopher connection remains intentionally flexible.

## Current queue after first-batch evidence

Do not launch all of these blindly. Choose exact bases and seams after reviewing #61/#62/#63 returns.

- #64 PWA shell, especially after QA lane semantics are settled.
- #65 newspaper presentation family.
- #66 Storm Site registry / U.S. map expansion / authored site structure.
- #67 RPG, MOO-LAH, Storm Triangle, upgrades, synergies.
- #68 persistent scorekeeper / records / competitive replay loop.

No CIN worker and no Integration worker are active for this Stage 2B first batch unless newer exact task direction says otherwise.

## Architecture direction

Do **not** start a C++ rewrite now.

Strategic direction is to become **C++-ready, not C++-dependent**: keep simulation/game state/input/rendering boundaries clean so expensive isolated systems could later be tested as C++/WebAssembly modules if profiling proves a real need. Stage 2B should remain focused on proving the game and minimizing drift rather than opening another rewrite era.

## Next actions in a fresh chat

1. When QA returns from the #63 bounded follow-up, inspect GitHub directly and decide whether the real example run closes the remaining acceptance blocker.
2. When GAME says finished, inspect its exact head, diff, unlock persistence, dedicated MOO LEVEL, cow safety, and normal-campaign regression evidence. Do not rely on the pasted worker summary alone.
3. When WORLD says finished, inspect exact screenshots/evidence and judge the tornado visually against the attack-bubble rejection. Green tests alone are insufficient.
4. Only after first-batch seams are known should the Director assign exact bases for #64-#68.
5. No production merge of rejected QA #29.

## Chat rollover rule

When the active chat becomes heavy enough that context handling feels sluggish or uncertain, refresh this durable handoff and start a new project chat instead of trying to preserve everything through one giant conversation.

The new chat should treat GitHub issues, exact SHAs, `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, and this handoff as the source of truth. The owner should not have to reconstruct the project manually.
