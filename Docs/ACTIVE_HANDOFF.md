# Active Handoff

Last updated: 2026-08-13 13:54 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`

## Director operating law

Repository state is durable memory. Chat is temporary context. Never use `main` as product/gameplay authority.

Startup law:
`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Worker-state law:
**Assignment is authority to start. Branch movement / returned evidence is proof that work actually happened. Director acceptance is a separate gate.**

Green CI is evidence, not automatic product acceptance. Worker-reported completion is not Director acceptance. Drift is a product defect.

Current tooling constraint: Codex/Work usage is exhausted until August 18, 2026. Antigravity may be used only as a bounded worker harness. It does not replace Director authority or GitHub source truth.

## Accepted / frozen Stage 2B inputs

### #62 SW-GAME-002 Hart Farm unlock + real Moo Level
Accepted head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

### #64 SW-PWA-001 installable shell
Accepted head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
Prototype parent: `73b28e07a5b05dd632226af851b06a32e99bb068`
Integration may use only the accepted PWA delta relative to that prototype parent. Never wholesale promote #63 prototype authority.

### #65 SW-UI-001 newspaper presentation
Durable head: `43348db9b56ec18bca8418c8dfe13470aad4722d`

### #68 SW-SCORE-001 persistent scorekeeper
Accepted head: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`

### #67 SW-RPG-001 MOO-LAH + Storm Triangle foundation
Accepted head: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

## GAME lane: SW-RPG-002 Slingshot — DIRECTOR ACCEPTED

Issue: #67
Branch: `agent/sw-rpg-002-slingshot-synergy`
Accepted base: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Exact accepted head: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
Director acceptance comment: `5282590058`

Verified:
- exactly one commit ahead / zero behind accepted RPG-001 base;
- only five expected RPG-002 files changed;
- independent Antigravity QA verdict PASS;
- Pull alone remains usable;
- Gust alone remains usable and preserves accepted standalone semantics;
- Pull + Gust produces bounded physical Slingshot capture/release/travel/impact behavior;
- aim derives from player/storm motion or camera-forward direction, not target-position auto-targeting;
- light/heavy behavior materially differs;
- cows remain protected;
- exactly three Storm Triangle active slots remain;
- unrelated UI red was not patched or masked.

Status: **DIRECTOR ACCEPTED AND FROZEN.** Do not edit, amend, rebase, or self-merge.

## WORLD lane: SW-WORLD-006 — DIRECTOR ACCEPTED

Issue: #73
Independent QA issue: #76 SW-QA-008
Branch: `agent/sw-world-006-planar-cone-acceptance-fix`
Rejected comparison base: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
Exact accepted head: `1264617b49a95241024f52ba550713ba28d84888`
QA acceptance comment #76: `5282725587`
Director acceptance comment #73: `5282728612`

History:
- prior local WORLD-006 completion was lost and formally unrecoverable;
- Antigravity reconstructed only the pinned planar-cone defect from exact rejected base;
- durable candidate is exactly one commit ahead / zero behind;
- only changed file is `runtime/threejs-visual-hero-slice6.js`.

Independent QA verdict: PASS.
Accepted result:
- tidy translucent planar-cone read is gone;
- default storm reads immediately as one dirty, irregular, connected tornado/condensation mass;
- lower-funnel / ground contact reads as stronger dirty connected circulation;
- no product mutation occurred during independent QA.

Status: **DIRECTOR ACCEPTED AND FROZEN.** Do not edit, amend, rebase, or self-merge.

## LEVEL lane: SW-LEVEL-001 Storm Sites — DIRECTOR ACCEPTED

Issue: #66
QA issue: #72 SW-QA-007
Branch: `agent/sw-world-005-level-001-acceptance-fix`
Exact accepted head: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
QA final PASS comment #72: `5285073443`
Director acceptance comment #66: `5285075102`

Prior exact-source corrected QA run `31715118431` established:
- ffmpeg/audio/VFX prerequisites valid;
- implementation truth 28/28 PASS;
- campaign fixture 66/66 PASS;
- v5.1 fixture 55/55 PASS;
- Storm Site static/contract 12/12 PASS;
- production web build PASS;
- real browser executor integration PASS;
- County Fair launch/replay/signature PASS;
- Coastal launch/replay PASS;
- accepted-path `boat-launch-signal` proof PASS;
- campaign/home teardown-restoration PASS;
- Moo protection PASS;
- no HTTP errors;
- Fair screenshot SHA-256 `669acaaafd62a4a2389c965c6c614d36edbd1e900f6e7c683662ca93bb4a58ee`;
- Coastal screenshot SHA-256 `1e2cc19453f2b9f129b5286f29f73ff9bad12a141ad8d36d95e4e39c3e43cd16`.

That run still reported a modern-shell legacy-contract error. Final causal A/B/C harness then tested:
- A accepted pre-LEVEL base `89aeac92d032bfc6546cb8da7c52effc7a408aa1`;
- B original LEVEL head `07e089f03bdb2943e6b3d64033010736805afb4a`;
- C corrected LEVEL head `1350cee7535220fb9fc5e7c1b4de284e6aae8156`.

Harness branch: `agent/sw-qa-007-actions-harness`
Exact harness SHA: `84934ea88296af84a21ef1500fd1a460a1cea822`
Actions run: `31732518475`

Causal result:
- correctly constructed playable sources A/B/C all bootstrap successfully;
- all three have `noPageErrors=true` and `noRuntimeConsoleErrors=true`;
- all four bridge flags are true on all three;
- zero HTTP errors;
- no legacy-contract error appears on constructed playable sources;
- raw/unpatched HTML reproduces the same missing-four-bridges error across A/B/C.

Therefore the bridge red was a **global shell/harness construction condition, not introduced by LEVEL**.

Important harness nuance: run `31732518475` is globally red because its later `verify:sw-level-001` step was incorrectly invoked after the checkout had already been transformed into the task-versioned playable source. On C, the verifier attempted to replay `apply-v431-source-patch.mjs` and failed with `document title: expected exactly one source match, found 0`. This is a double-application / harness-ordering error. It does not invalidate the prior exact-source 12/12 LEVEL verifier or the clean A/B/C browser causal result.

Status: **DIRECTOR ACCEPTED AND FROZEN.** No LEVEL edits are authorized or required. Exact `1350cee...` is eligible for Integration input after the Integration base candidate is validated correctly.

## Integration lane: SW-INT-003 — RECOVERED / PRESERVED / NOT YET PROMOTED

Issue: #70
Canonical branch: `agent/sw-int-003-stage2b-accepted-stack`
Canonical remote SHA: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Preservation branch: `archive/sw-int-003-frozen-6fc3d64`
Exact preserved candidate: `6fc3d64c81b286f7743aaac46ba98e1f4a916dc3`
Case-B Director classification comment: `5284906545`
Preservation verification comment: `5284939418`

Recovery/classification result:
- prior frozen local assembly was successfully recovered at exact `6fc3d64...`;
- candidate is one local commit ahead of accepted base `ce1e47c...`;
- same GAME-002 runner was executed against accepted baseline and recovered candidate;
- baseline reproduced the same 11/12 red;
- classification: **CASE B — baseline reproducibility / harness / environment discrepancy**;
- no causal evidence currently ties the GAME-002 red to the PWA Integration assembly;
- no product/test edits were made during recovery/classification;
- canonical remote branch was intentionally left untouched.

Durable preservation:
- GitHub archive ref `archive/sw-int-003-frozen-6fc3d64` points exactly to `6fc3d64c81b286f7743aaac46ba98e1f4a916dc3`;
- canonical Integration ref still points exactly to `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`.

Local-worktree nuance:
- the recovered worktree is not literally clean because it contains untracked tool/generated material such as `.tools/`, prepared VFX, QA reference material, and static reports;
- zero product/test files were edited, staged, committed, or deleted;
- none of those untracked artifacts are part of the preserved commit.

### Next Integration law

Do **not** append Slingshot/WORLD/LEVEL immediately.

First validate the exact preserved Integration candidate `6fc3d64...` in the **correct task-versioned constructed-source runner** that has now proven the modern-shell bridge behavior clean.

Required next Integration proof:
1. compare accepted base `ce1e47c...` and preserved candidate `6fc3d64...` under the same correct runner;
2. verify exact PWA delta provenance and no prototype-wholesale import;
3. run full inherited GAME-002 / scorekeeper / RPG-001 / PWA / process gates on the candidate;
4. confirm browser/page/runtime/HTTP errors are clean or causally inherited;
5. only after this base candidate is genuinely validated may the canonical Integration branch move.

After the base candidate is validated, append Director-accepted inputs **one at a time**, with full regression proof after each append:
1. SW-RPG-002 Slingshot exact `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`;
2. SW-WORLD-006 exact `1264617b49a95241024f52ba550713ba28d84888`;
3. SW-LEVEL-001 exact `1350cee7535220fb9fc5e7c1b4de284e6aae8156`.

No bulk merge. No feature authoring. No QA weakening. No opportunistic unrelated fixes.

## QA Pages owner playtest

Public QA URL: `https://lybyerc-lab.github.io/Severe-Warning/`
Last confirmed published gameplay source: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61` (RPG-002 owner-playtest stack). This is QA/playtest infrastructure, not product acceptance authority.

## Product laws

- Genre: mobile arcade destruction with light action RPG progression.
- Full title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone; cows are protected/non-disposable comic actors.
- Newspaper presentation is recurring identity for select, `UNLEASH STORM`, and results.
- Town/county campaign remains home territory/backbone.
- Storm Sites are authored substantial destruction fantasies, not generic tiny arenas.
- Replay variation law: **same place, different storm day**.
- MOO-LAH is local-first gameplay currency.
- Exactly three equipped active abilities in the Storm Triangle. Storm forms/passives remain separate.
- Advanced powers consume one of the three slots.
- Physical/discoverable synergy is a replay pillar. First accepted concrete synergy: **Pull + Gust = Slingshot**.
- Twin Tornadoes, Waterspout, satellite feat, full U.S. map, and online/accounts remain future/held-back scope unless separately assigned.
- No stamina/wait/grind/forced ads.
- Controller-friendly, local-first, C++-ready not C++-dependent.
- Phone is a platform, not the intended size of the game.

## Current priority order

1. Validate preserved Integration candidate `6fc3d64...` in the correct constructed-source runner.
2. If clean, move the canonical Integration branch to that exact validated base candidate.
3. Append accepted Slingshot, WORLD-006, and LEVEL-001 one at a time with full regression gates after every append.
4. Keep unrelated Moo/UI/clock signals separate unless causal proof ties them to the active diff.
5. No new feature expansion until the accepted Stage 2B stack is landed and owner-playtestable.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
