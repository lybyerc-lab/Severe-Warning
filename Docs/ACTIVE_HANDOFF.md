# Active Handoff

Last updated: 2026-08-11 15:38 America/Chicago
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

A Director branch/comment assignment is authority to start, not proof an external worker session is active. Owner report of completion is **worker-reported complete** until the exact commit/evidence is durable and reviewable.

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
Status: **ACCEPTED integration candidate**.

Independent QA passed verifier 10/10 and browser QA 12/12, including deterministic failure/rearm, persistent unlock, dedicated Moo County Fair, cow safety, normal campaign regression, and protected gameplay authority.

### #63 SW-QA-002 - rapid prototype evidence lane
Branch: `agent/sw-qa-002-rapid-prototype-lane`
Exact accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`
Status: **ACCEPTED integration candidate**.

Exact-head Actions Run `31494975840` succeeded with artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains non-production.

### #64 SW-PWA-001 - installable shell
Branch: `agent/sw-pwa-001-installable-shell`
Exact accepted head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
Status: **ACCEPTED integration candidate**.

`test:pwa`, `qa:pwa`, and process verification are durable PASS. Physical Android install acceptance and production deployment remain separate gates.

### #68 SW-SCORE-001 - persistent scorekeeper
Branch: `agent/sw-score-001-persistent-scorekeeper`
Exact accepted head: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
Status: **ACCEPTED integration candidate**.

Returned browser evidence is 13/13 PASS with durable first-run records, lower-score PB protection, NEW PERSONAL BEST/previous-best margin, reload persistence, site/variant isolation, separate Moo records, game/scoring version identity, newspaper presentation, replay/map actions, and inherited GAME-002/campaign regression.

### #67 SW-RPG-001 - MOO-LAH + Storm Triangle foundation
Branch: `agent/sw-rpg-001-moolah-storm-triangle`
Exact accepted head: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Status: **ACCEPTED integration candidate for first RPG slice**.

Accepted behavior:
- local-first `severe_weather_moolah_v1` persistence;
- deterministic MOO-LAH at `floor(final accepted score / 100)` with no sub-100 participation stipend;
- newspaper MOO-LAH reward/purchase rail;
- exactly three Storm Triangle slots: Pull, Gust, Grid Zap;
- persistent bounded upgrades: Pull `2.50s -> 3.25s`, Gust target damage `90 -> 115`, Grid Zap node cap `8 -> 10` while damage remains `135`;
- active upgrade/loadout identity written into SCORE-001 build metadata.

Proof: RPG verifier 9/9, browser QA 10/10, campaign 66/66, V5.1 55/55, GAME-002 10/10, UI-001 8/8 + browser 9/9, SCORE-001 9/9 + browser 13/13, implementation truth 28/28.

## Durable but acceptance-blocked work

### #61 SW-WORLD-003 - storm hero
Recovered exact head: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
Independent QA verdict: **FAIL for product visual acceptance**.

Automated evidence passes, bubble clusters are gone, and protected gameplay authority stayed clean. Remaining visual defect: storm still reads too much like a tidy translucent geometric cone with visible square/card effect primitives, especially at lower funnel/ground contact.

### #65 SW-UI-001 - newspaper presentation
Branch: `agent/sw-ui-001-newspaper-presentation`
Exact durable head: `43348db9b56ec18bca8418c8dfe13470aad4722d`

Worker verification passed and this is the accepted sequencing base for #68. Final owner/product visual acceptance remains separate because returned screenshots were not made durable in GitHub.

### #66 SW-LEVEL-001 - Storm Site framework
Branch: `agent/sw-level-001-storm-site-framework`
Exact durable head: `07e089f03bdb2943e6b3d64033010736805afb4a`

Durability PASS; static verification passed 9/9 plus campaign 66/66 and V5.1 55/55. Product/behavioral acceptance remains blocked pending exact QA classification of:
1. site -> home teardown/restoration;
2. Coastal boat-launch signal reachability/proof;
3. seven isolated-run 404s;
4. County Fair / Coastal Boardwalk authored-place identity.

## Current worker-return closure state

Owner reports **all current worker tasks completed** at 2026-08-11 15:38 America/Chicago. Director checked durable repo state before accepting anything.

### WORLD - SW-WORLD-004 correction
Assigned branch: `agent/sw-world-004-storm-hero-acceptance-fix`
Exact starting SHA: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
Remote at Director check: **still exactly the starting SHA**.
Issue #61 closure comment: `5258598452`.

Status: **worker-reported complete locally; exact correction commit/evidence not yet durable**.

WORLD's next work is publication/evidence closure only:
- preserve exact completed local correction;
- record final SHA/clean state/changed files;
- push exact commit without amend/rebase/retune;
- return default/Main Street/ground-contact visual evidence, before/after, counts, regression/drift proof;
- explicitly confirm the candidate avoids attack bubbles, tidy cone, and visible square/card primitives.

Do not assign further WORLD feature work until this exact correction state is durable. Once durable, send exact correction SHA to independent visual acceptance. If it passes, #61 can stop blocking first-batch integration.

### QA - SW-QA-005 LEVEL-001 defect reproduction
Verification branch/source under test: `agent/sw-qa-005-level-001-defect-repro` / `07e089f03bdb2943e6b3d64033010736805afb4a`
Branch staying at source SHA is expected because product-code edits are forbidden.
Issue #66 closure comment: `5258599910`.

Status: **worker-reported complete; classification return not yet durable in Issue #66**.

QA's next work is evidence publication only. Return:
- exact commands/environment and tested SHA;
- teardown/restoration reproduction and telemetry;
- boat-launch signal reachability/observability and product-vs-harness classification;
- all seven 404 origins and classification;
- County Fair/Coastal authored-place visual verdict with screenshot refs/hashes where available;
- inherited protected regressions;
- ranked product defect / harness defect / proof limitation list;
- confirmation of zero product-code edits.

Once durable, Director converts only confirmed product defects into WORLD's next bounded #66 correction after WORLD-004 closure.

### GAME - SW-RPG-002 Slingshot synergy
Assigned branch: `agent/sw-rpg-002-slingshot-synergy`
Exact starting SHA: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Remote at Director check: **still exactly the starting SHA**.
Issue #67 closure comment: `5258601296`.

Status: **worker-reported complete locally; exact Slingshot commit/evidence not yet durable**.

GAME's next work is publication/evidence closure only:
- preserve exact completed local Slingshot state;
- record final SHA/clean state/changed files;
- push exact commit without amend/rebase/retune;
- return deterministic Pull capture -> Gust launch -> substantial travel -> physical impact proof;
- prove ordinary Pull and Gust remain correct independently;
- prove light/heavy object differentiation;
- return telemetry/record proof if implemented plus inherited regressions and drift report;
- confirm player/storm aim drives launch and there is no invisible auto-targeting or extra HUD slot.

Do not launch Twin Tornadoes, Waterspout, satellite feat, map, online systems, #66 fixes, or WORLD renderer work from a guessed base. Once Slingshot is durable and accepted, establish the next GAME base from that exact head.

## Integration

No Integration worker is active.

First-batch integration remains blocked by #61 visual acceptance. Accepted candidates currently include #62, #63, #64, #68, and first #67 RPG slice. #65 is durable but retains separate product visual acceptance. #66 is durable but acceptance-blocked. Do not production-merge rejected QA #29.

## Product laws

- Genre: arcade destruction game with light action RPG progression.
- Full player-facing title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone.
- Exactly three active abilities per run in the Storm Triangle; storm form/passives are separate.
- Physical/discoverable synergy is a replay pillar. Named prototype: **Pull + Gust = Slingshot**.
- MOO-LAH is earned gameplay currency, not a manipulative retention economy.
- Persistent local-first scorekeeping is a core system.
- Newspaper presentation is recurring UI identity for storm select, UNLEASH STORM, and results.
- Weather Map direction is a stylized nostalgic U.S. destination selector.
- Storm Sites are authored substantial destruction fantasies with signature moments, not generic procedural arenas.
- Phone is a platform, not the intended size of the game. Preserve controller-friendly architecture where practical.
- Become C++-ready, not C++-dependent. No rewrite.

## Immediate Director actions

1. Wait only for durable return closure, not more feature authoring.
2. When WORLD-004 publishes, inspect exact diff/evidence and send exact head to independent visual QA. Do not self-accept from WORLD return alone.
3. When QA-005 posts classification, convert only confirmed #66 product defects into a bounded WORLD correction after #61 is closed.
4. When RPG-002 publishes, inspect exact Slingshot source/behavior and either accept/freeze it or pin a concrete defect before assigning the next GAME slice.
5. Preserve #62/#63/#64/#68/#67-first-slice accepted heads exactly.
6. Start Integration only when the first-batch acceptance set and merge order are explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
