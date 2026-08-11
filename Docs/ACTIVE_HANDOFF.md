# Active Handoff

Last updated: 2026-08-11 13:32 America/Chicago
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

Independent QA passed `verify:sw-game-002` 10/10 and browser QA 12/12, including deterministic failure/rearm, persistent unlock, dedicated Moo County Fair, cow safety, normal campaign regression, and protected gameplay authority.

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

## Returned work with acceptance blockers

### #61 SW-WORLD-003 - storm hero

Recovered branch: `agent/sw-world-003-storm-hero-recovery`
Recovered head: `f9430bc0cee0d02b3aacf2eb0909183d14912617`

QA completed independent exact-head visual acceptance on `agent/sw-qa-004-world-003-visual-acceptance` and returned **FAIL for Director visual acceptance**.

Automated evidence is strong:
- static verifier 95/95;
- modern typecheck/build pass;
- browser QA PASS with zero failures;
- presentation counts within mobile budgets;
- inherited round sprites / production dodecahedra / legacy dust bowl suppressed;
- no intentional protected gameplay-authority writes.

But human visual judgment remains a blocker: the attack-bubble read is gone, yet the default storm still reads too much like a clean translucent geometric cone with visible square/effect primitives, especially at lower funnel / ground contact. It does not yet read as the required ragged connected condensation-column / wedge mass.

### Current WORLD assignment for #61

Branch: `agent/sw-world-004-storm-hero-acceptance-fix`
Exact base: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
Issue #61 Director activation comment: `5257312200`

Scope is only the proven visual defect:
- break the clean translucent cone read;
- eliminate or visually bury obvious square/effect primitives;
- retain one coherent storm mass, strong ground attachment, asymmetry, ragged upper transition, and directional lower circulation;
- do not regress to attack bubbles, stacked discs, or disconnected wisps;
- preserve mobile budgets and all gameplay authority.

No #66 imports, no broad town/world rewrite, no RPG/scorekeeper/newspaper/PWA work.

### #65 SW-UI-001 - newspaper presentation

Branch: `agent/sw-ui-001-newspaper-presentation`
Exact durable head: `43348db9b56ec18bca8418c8dfe13470aad4722d`

Worker verification passed and the exact source is the approved sequencing base for scorekeeper work. Final owner/product visual acceptance remains separate because returned screenshots were not made durable in GitHub.

### #66 SW-LEVEL-001 - Storm Site framework

Branch: `agent/sw-level-001-storm-site-framework`
Base: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
Exact durable head: `07e089f03bdb2943e6b3d64033010736805afb4a`

WORLD successfully recovered, froze, and published the preserved result. Durability is **PASS**. Exact diff is one bounded commit containing only `package.json`, `runtime/sw-level-001-storm-site-framework.js`, and its apply/verify/QA scripts.

The framework establishes:
- `STORM_SITE_REGISTRY` with Heartland home, County Fair, and Coastal Boardwalk;
- common Storm Site launch contract;
- authored replay variation telemetry;
- County Fair and Coastal site bounds / object caps;
- Ferris-wheel signature telemetry;
- Coastal boat-launch signal defined statically;
- Moo protection maintained.

Static verification passed 9/9 plus inherited campaign 66/66 and V5.1 55/55.

Director acceptance is **FAIL / blocked** because the fresh browser run exposed:
1. return-to-home leaves Storm Site target/decor telemetry behind, so campaign-home restoration is not proven;
2. boat-launch signal was not actually demonstrated in the browser path;
3. seven isolated-run console 404s need classification;
4. County Fair / Coastal screenshots still read too much like Heartland overlays or small arenas rather than materially authored distinct places.

### Current QA assignment for #66

Verification branch: `agent/sw-qa-005-level-001-defect-repro`
Exact source/base: `07e089f03bdb2943e6b3d64033010736805afb4a`
Issue #66 Director activation comment: `5257314336`

QA must independently reproduce and classify all four blockers, distinguish product defects from harness defects, identify 404 origins, determine boat-launch reachability/testability, inspect authored-place identity, and rerun protected regressions. No product-code edits are authorized.

## #68 SW-SCORE-001 - persistent scorekeeper

Branch: `agent/sw-score-001-persistent-scorekeeper`
Approved base: `43348db9b56ec18bca8418c8dfe13470aad4722d`

Owner reports SW-SCORE-001 is **complete and committed locally**, and later reports all workers finished their current tasks. However, Director's latest GitHub check still shows remote `agent/sw-score-001-persistent-scorekeeper` at the untouched base `43348db9...`; Issue #68 contains no exact completed source SHA / return package yet.

Treat #68 as **worker-complete locally, durable return missing**. Do not invent a head or base downstream work on `43348db9...`.

GAME publication/evidence closure remains required: publish the exact completed commit and return PB creation / lower-score preservation / higher-score NEW PERSONAL BEST / previous-best margin / reload persistence / mode isolation / Moo separation / scoring-version identity / newspaper legibility / protected regression / drift evidence.

## Current GAME assignment: #67 read-only preflight

Issue: `SW-RPG-001: MOO-LAH economy and light action RPG ability progression`
Director preflight comment: `5257316620`

Because #68 is complete locally but not durable, GAME may advance only through a **read-only preflight** using the actual local completed #68 commit.

Before anything else GAME must record exact local #68 SHA, branch, and status. No #67 code edits or implementation commits are authorized yet.

Preflight deliverable maps:
- MOO-LAH persistence and earning events from existing run/result truth;
- newspaper reward integration without redesign;
- bounded Pull/Gust/Grid Zap upgrade dimensions with current/base values identified;
- Storm Core utility without movement-speed/turn-response treadmill;
- exactly three active abilities in Storm Triangle; storm form/passives separate;
- interaction with #68 build/version record metadata;
- Coastal boat-launch -> Waterspout feat seam without assuming #66 acceptance;
- Pull + Gust = Slingshot synergy authority;
- anti-grind/local-first limits;
- exact files/seams likely to change;
- smallest player-meaningful implementation slice.

No source changes until actual #68 head is durable and Director establishes the exact #67 base.

## Integration

No Integration worker is active.

First-batch integration remains blocked by #61 visual acceptance. #62, #63, and #64 are accepted candidates. #65 is a durable downstream base but still has separate product visual acceptance. #66 is durable but acceptance-blocked. #68 is locally complete but non-durable.

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
3. Watch for the actual #68 completed head to become durable. Do not authorize #67 source edits before that exact SHA exists in durable repo state.
4. Once #68 is durable, review scorekeeper behavior/version integrity; if accepted enough for sequencing, create #67 implementation branch from that exact head.
5. Preserve #62/#63/#64 accepted heads exactly.
6. Start Integration only when the first-batch acceptance set and merge order are explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
