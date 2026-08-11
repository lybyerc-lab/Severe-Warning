# Active Handoff

Last updated: 2026-08-11 13:51 America/Chicago
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

Independent QA passed verifier 10/10 and browser QA 12/12, including deterministic failure/rearm, persistent unlock, dedicated Moo County Fair, cow safety, normal campaign regression, and protected gameplay authority.

### #63 SW-QA-002 - rapid prototype evidence lane

Branch: `agent/sw-qa-002-rapid-prototype-lane`
Exact accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`
Director status: **ACCEPTED integration candidate**.

Exact-head Actions Run `31494975840` succeeded with artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains explicitly non-production.

### #64 SW-PWA-001 - installable shell

Branch: `agent/sw-pwa-001-installable-shell`
Exact accepted head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
Director status: **ACCEPTED integration candidate**.

`test:pwa`, `qa:pwa`, and process verification are durable PASS. Physical Android install acceptance and production deployment remain separate gates.

### #68 SW-SCORE-001 - persistent scorekeeper

Branch: `agent/sw-score-001-persistent-scorekeeper`
Approved base: `43348db9b56ec18bca8418c8dfe13470aad4722d`
Exact accepted head: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
Director acceptance comment: `5257473178`
Director status: **ACCEPTED integration candidate**.

The returned head is one bounded commit touching only `package.json`, `runtime/sw-score-001-persistent-scorekeeper.js`, and its apply/verify/browser-QA scripts. The scorekeeper observes existing accepted run/result truth rather than recalculating score authority.

Returned browser evidence is 13/13 PASS with:
- first-run durable record creation;
- lower-score PB protection;
- higher-score NEW PERSONAL BEST with correct previous best and margin;
- reload persistence;
- campaign site/variant isolation;
- separate Moo record bucket;
- game build and scoring-version identity;
- reserved-only future Storm Triangle/upgrade metadata;
- newspaper record presentation plus replay/map actions;
- inherited GAME-002/campaign regression;
- zero page/runtime-console errors.

Freeze this exact head for downstream ancestry. No self-merge or production promotion is implied.

## Returned work with acceptance blockers

### #61 SW-WORLD-003 - storm hero

Recovered head: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
QA returned **FAIL for Director visual acceptance**.

Automated evidence is strong: static verifier 95/95, modern typecheck/build pass, browser QA pass, mobile budgets respected, bubble/round primitives suppressed, and no intentional protected gameplay-authority writes.

Human visual blocker remains: the storm no longer reads as attack bubbles, but still reads too much like a clean translucent geometric cone with visible square/effect primitives, especially at lower funnel / ground contact.

### Current WORLD assignment for #61

Branch: `agent/sw-world-004-storm-hero-acceptance-fix`
Exact base: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
Issue #61 activation comment: `5257312200`

Scope is only the proven visual defect: break the clean cone read, bury obvious effect primitives, preserve one coherent ragged connected storm mass and strong ground attachment, and keep gameplay authority/mobile budgets unchanged.

### #65 SW-UI-001 - newspaper presentation

Branch: `agent/sw-ui-001-newspaper-presentation`
Exact durable head: `43348db9b56ec18bca8418c8dfe13470aad4722d`

Worker verification passed and the source is the accepted sequencing base for #68. Final owner/product visual acceptance remains separate because returned screenshots were not made durable in GitHub.

### #66 SW-LEVEL-001 - Storm Site framework

Branch: `agent/sw-level-001-storm-site-framework`
Base: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
Exact durable head: `07e089f03bdb2943e6b3d64033010736805afb4a`

Durability is PASS and the diff is bounded. Static verification passed 9/9 plus inherited campaign 66/66 and V5.1 55/55.

Director acceptance remains blocked because browser QA exposed four issues:
1. return-to-home leaves Storm Site target/decor telemetry behind;
2. Coastal boat-launch signal was not actually demonstrated;
3. seven isolated-run console 404s require classification;
4. County Fair / Coastal screenshots still read too much like Heartland overlays or small arenas instead of materially authored places.

### Current QA assignment for #66

Verification branch: `agent/sw-qa-005-level-001-defect-repro`
Exact source/base: `07e089f03bdb2943e6b3d64033010736805afb4a`
Issue #66 activation comment: `5257314336`

QA must independently reproduce/classify all four blockers, distinguish product defects from harness defects, identify 404 origins, determine boat-launch reachability/testability, inspect authored-place identity, and rerun protected regressions. No product-code edits are authorized.

## Current GAME assignment: #67 SW-RPG-001 first implementation slice

Branch: `agent/sw-rpg-001-moolah-storm-triangle`
Exact base: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
Issue #67 activation comment: `5257476257`

GAME is now authorized to implement a bounded first RPG slice from the accepted scorekeeper head.

Required slice:
1. local-first MOO-LAH persistence and deterministic earn events from existing accepted run/results truth;
2. MOO-LAH earned surfaced through the existing newspaper/results language without redesigning #65;
3. a small persistent upgrade model for Pull, Gust, and Grid Zap, with at least one meaningful bounded upgrade path per ability and exact base/upgraded values documented;
4. exactly three active abilities per run as the Storm Triangle contract, with current roster establishing the loadout/persistence/schema/UI seam and no extra permanent HUD slots;
5. active upgrade/loadout identity written into #68 scorekeeper build metadata so records remain interpretable;
6. no movement-speed/turn-response treadmill. Storm Core progression, if touched, should be utility/combo-oriented.

Held for later #67 slices: Twin Tornadoes, Waterspout unlock, satellite feat, full Slingshot physics/record loop, full U.S. map, online economy/accounts, and broad progression content.

Required return: exact final SHA/changed files, browser proof for MOO-LAH earn/reload, persistent purchases, exact upgrade effects, correct scorekeeper build identity, newspaper legibility, normal campaign/GAME-002/#65/#68 regressions, anti-grind notes, and drift report.

## Integration

No Integration worker is active.

First-batch integration remains blocked by #61 visual acceptance. #62, #63, #64, and #68 are accepted candidates. #65 is durable but retains separate product visual acceptance. #66 is durable but acceptance-blocked.

Do not production-merge rejected QA #29.

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

1. Review exact WORLD correction return on `agent/sw-world-004-storm-hero-acceptance-fix`; then send corrected head to independent visual acceptance.
2. Review QA #66 defect classification and turn only confirmed implementation defects into a bounded WORLD follow-up after #61.
3. Review GAME #67 exact return for MOO-LAH persistence, bounded upgrade effects, scorekeeper build identity, anti-grind behavior, and protected regressions.
4. Preserve #62/#63/#64/#68 accepted heads exactly.
5. Start Integration only when the first-batch acceptance set and merge order are explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
