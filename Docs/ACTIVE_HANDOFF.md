# Active Handoff

Last updated: 2026-08-11 11:53 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## Director startup

Repository state is durable memory. Chat is temporary context.

1. Read `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, and `Docs/WORKER_STARTUP_ORDER.md` from the Director branch.
2. Read this handoff and `Docs/ACTIVE_PRODUCTION_SLATE.md`.
3. Read exact active issues and latest Director comments.
4. Inspect exact branch heads before claiming completion, liveness, or acceptance.
5. Never use `main` as project authority.

Startup law:

`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

A Director launch comment or prepared branch is assignment authority, not proof that an external worker session is actually running. Actual liveness requires branch movement, an explicit worker return, or an owner statement.

If a prepared remote branch is absent locally and network is unavailable, the Director may explicitly authorize local branch creation from the exact approved SHA only when that exact commit object already exists locally. Never substitute another SHA.

## Production truth

- Frozen gameplay/fun reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
- Rejected but technically green QA #29 source: `b501737e71e61b979901d4899d969390aa37b1f4`.
- QA #29 remains owner product-rejected because the default tornado read as attack bubbles / graphics regression and Cow Level was presentation-only.
- Browser-first remains the production path. Android is opt-in for deliberate physical checkpoints.
- Green CI is engineering evidence, not product acceptance.
- Drift is a product defect.

## Accepted / frozen work

### #62 SW-GAME-002 - Hart Farm unlock + real Moo Level

Branch: `agent/sw-game-002-moo-level-unlock`
Exact accepted head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Director status: **ACCEPTED integration candidate**.

QA independently executed the exact source and returned:
- `verify:sw-game-002` PASS 10/10;
- `qa:sw-game-002` PASS 12/12;
- Hart Farm deterministic failure -> later success/rearm without campaign penalty;
- locked -> unlocked persistence;
- dedicated `mode: "moo"` Moo County Fair launch with safe cows and sponsor props;
- objective completion evidence;
- normal campaign regression and zero browser/runtime errors;
- protected movement/camera/abilities/scoring/world authority unchanged.

### #63 SW-QA-002 - rapid prototype evidence lane

Branch: `agent/sw-qa-002-rapid-prototype-lane`
Exact accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`

Director status: **ACCEPTED integration candidate**.

Exact-head GitHub Actions Run `31494975840` succeeded with artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains explicitly non-production.

### #64 SW-PWA-001 - installable shell

Branch: `agent/sw-pwa-001-installable-shell`
Exact accepted head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`

Director status: **ACCEPTED integration candidate**.

Scope/code-shape PASS plus durable execution evidence:
- `pnpm run test:pwa` PASS;
- `pnpm run qa:pwa` PASS for `/Severe-Warning/` scope, non-installed browser play, deterministic build-identity supersession, offline fallback, and no page errors;
- `pnpm run verify:process` PASS 28/28.

Physical Android install acceptance and production deployment remain separate gates.

## Completed work awaiting final acceptance / durability

### #61 SW-WORLD-003 - storm hero recovery

Branch: `agent/sw-world-003-storm-hero-recovery`
Frozen base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Recovered durable head: `f9430bc0cee0d02b3aacf2eb0909183d14912617`

The recovery is now durable. Exact diff is one commit and stays bounded to:
- `runtime/threejs-visual-hero-slice6-town-polish.js`;
- `runtime/threejs-visual-hero-slice6.js`;
- `scripts/qa-threejs-hero-slice6.mjs`;
- `scripts/verify-threejs-hero-slice6.mjs`.

The recovered implementation suppresses inherited round/bubble-like storm primitives and builds a more connected ragged wedge/condensation-column read with condensation streaks and lower-circulation ground pull.

Final visual acceptance still requires exact-head executed/browser evidence that a human can inspect: default storm hero, Main Street, lower-funnel/ground-contact, before/after comparison, mobile budget counts, and protected-gameplay regression.

Latest Director launch on #61 assigns QA to independent exact-head visual acceptance on verification branch `agent/sw-qa-004-world-003-visual-acceptance`, based exactly at `f9430bc0cee0d02b3aacf2eb0909183d14912617`. No product-code edits are authorized.

### #65 SW-UI-001 - newspaper presentation

Branch: `agent/sw-ui-001-newspaper-presentation`
Exact completed head: `43348db9b56ec18bca8418c8dfe13470aad4722d`

GAME published the exact completed result and return package. The branch is one commit ahead of GAME-002 and changes only:
- `package.json`;
- `runtime/sw-ui-001-newspaper-presentation.js`;
- bounded apply/verify/browser-QA scripts.

Returned verification:
- SW-UI-001 verifier 8/8;
- inherited campaign verifier 66/66;
- V5.1 production slice 55/55;
- inherited SW-GAME-002 10/10;
- process verifier 28/28;
- browser presentation report 9/9 with no page/runtime-console errors.

Worker reports preserved mobile evidence for storm select, Moo card/results, and normal results. Those screenshots were not committed at the returned head, so final Director visual/product acceptance remains separate. However, the exact head is durable and is approved as the real sequencing base for #68. Do not reopen #65 feature scope unless visual review exposes a concrete defect.

### #66 SW-LEVEL-001 - Storm Site framework

Branch: `agent/sw-level-001-storm-site-framework`
Approved start: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Owner reports WORLD completed the implementation, but GitHub still shows the remote branch at the untouched starting SHA. Treat #66 as **worker-complete locally, durable return missing**.

Latest Director assignment on #66 is publication/evidence closure only: return to the preserved completed #66 worktree, identify/freeze the exact completed state, publish that exact state, and return the original browser/visual/regression package. Do not rebuild it from memory, reset/rebase it, or add new feature scope.

## Next-wave assignments issued

Important: the following launch authority is durable, but actual external worker-session liveness must still be verified by branch movement/return or an owner statement.

### GAME -> #68 SW-SCORE-001

Branch: `agent/sw-score-001-persistent-scorekeeper`
Exact base: `43348db9b56ec18bca8418c8dfe13470aad4722d`

The branch already exists at the exact completed #65 head.

Goal: local-first persistent records and competitive replay loop that plugs into the real newspaper/results seam.

Required direction:
- PB per site and meaningful mode/variant;
- best rank/medal and selected absurd/site records from existing truth;
- durable reload persistence;
- storm/build identity available today;
- scoring/game version identity;
- NEW PERSONAL BEST, previous best/margin, next milestone, and replay motivation in the existing newspaper language;
- reserve clean schema seams for future Storm Triangle/upgrade metadata without implementing #67 RPG.

Protected: no score-formula rewrite, no newspaper redesign, no MOO-LAH/RPG, no online account requirement, no movement/camera/ability/campaign/cow/world/PWA authority changes.

### QA -> #61 WORLD-003 exact-head visual acceptance

Verification branch: `agent/sw-qa-004-world-003-visual-acceptance`
Exact source/base: `f9430bc0cee0d02b3aacf2eb0909183d14912617`

No product edits. Execute and persist the storm visual/regression evidence needed for Director acceptance.

### WORLD -> #66 publication/evidence closure

Return to the preserved completed #66 local state and make the exact already-completed result durable. No new site implementation until that state is safe and reviewable.

## Queue after this wave

### #67 SW-RPG-001

Keep queued while GAME owns #68 and until progression/ability tuning can reopen without colliding with score/results architecture. MOO-LAH, Storm Triangle, meaningful upgrades, and physical synergies remain the intended next major progression layer after the current score/evidence seams are safe.

### Integration

No Integration worker is active yet. First-batch integration can begin only after #61 visual acceptance is resolved and an explicit merge order is chosen. #62, #63, and #64 are accepted candidates. #65 is a durable downstream sequencing base but still has separate visual/product acceptance. #66 remains non-durable until WORLD publishes its completed state.

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

1. Verify actual next-wave worker liveness by branch movement/return, not by comments alone.
2. Review QA's exact-head #61 visual evidence and accept/reject WORLD-003 on the human visual question.
3. Review #66 immediately when WORLD publishes the exact completed head/evidence; then feed WORLD the next conflict-safe site/world task.
4. Review #68 exact-head return for local record correctness, persistence, version integrity, and newspaper integration; then decide whether GAME moves to #67 or another results/progression seam.
5. Preserve #62/#63/#64 accepted heads exactly.
6. Do not production-merge rejected QA #29.
7. Start Integration only when the first-batch acceptance set and merge order are explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
