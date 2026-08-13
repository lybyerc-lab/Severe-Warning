# Active Handoff

Last updated: 2026-08-13 10:45 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`

## Director operating law

Repository state is durable memory. Chat is temporary context. Never use `main` as project authority.

Startup law:
`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Worker-state law:
**Assignment is authority to start. Branch movement / returned evidence is proof that work actually happened. Director acceptance is a separate gate.**

Green CI is evidence, not automatic product acceptance. Worker-reported completion is not Director acceptance. Drift is a product defect.

Current tooling constraint: Codex/Work usage is exhausted until August 18, 2026. Antigravity may be used as a bounded worker harness only. It does not replace Director authority or GitHub source truth.

## Accepted / frozen foundation

- #62 SW-GAME-002 Hart Farm unlock + real Moo Level
  - accepted head `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
- #63 SW-QA-002 prototype evidence lane only
  - head `73b28e07a5b05dd632226af851b06a32e99bb068`
  - never promote prototype authority wholesale
- #64 SW-PWA-001 installable shell
  - accepted head `7cda055a4773c5c9dc69c0d02018cd9454a86628`
  - Integration may use only the task delta relative to `73b28e07a5b05dd632226af851b06a32e99bb068`
- #65 SW-UI-001 newspaper presentation
  - durable head `43348db9b56ec18bca8418c8dfe13470aad4722d`
- #68 SW-SCORE-001 persistent scorekeeper
  - accepted head `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
- #67 SW-RPG-001 MOO-LAH + Storm Triangle foundation
  - accepted head `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

## GAME lane: SW-RPG-002 Slingshot — ACCEPTED

Issue: #67
Branch: `agent/sw-rpg-002-slingshot-synergy`
Accepted base: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Exact accepted head: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
Worker closure comment: `5259294815`
Director acceptance comment: `5282590058`

Director re-verified:
- remote branch resolves exactly to `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`;
- exactly one commit ahead / zero behind accepted base;
- only five expected RPG-002 files changed: `package.json`, `runtime/sw-rpg-002-slingshot.js`, apply script, verifier, browser QA script;
- independent Antigravity QA returned **PASS**;
- ordinary Pull and Gust remain independently usable;
- Pull + Gust produces bounded physical Slingshot launch/impact behavior;
- no invisible target-position auto-targeting;
- light/heavy behavior remains materially different;
- cows remain protected;
- Storm Triangle remains exactly three active slots;
- unrelated UI red was not patched or masked.

Status: **DIRECTOR ACCEPTED AND FROZEN.** Do not edit, amend, rebase, or self-merge. Eligible for later Integration input only after Integration's existing blocked candidate is recovered and green.

## WORLD visual lane: SW-WORLD-006 — ACCEPTED

Issue: #73
Independent QA issue: #76 SW-QA-008
Branch: `agent/sw-world-006-planar-cone-acceptance-fix`
Rejected comparison base: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
Exact accepted head: `1264617b49a95241024f52ba550713ba28d84888`
QA acceptance comment #76: `5282725587`
Director acceptance comment #73: `5282728612`

History:
- prior local WORLD-006 completion was lost and formally unrecoverable;
- Antigravity was authorized to reconstruct only the pinned planar-cone defect from exact rejected base `347159f1...`;
- durable reconstructed candidate is exactly one commit ahead / zero behind;
- only changed file: `runtime/threejs-visual-hero-slice6.js`;
- commit message: `fix(world-006): break planar cone read with dirty irregular volumetric lower funnel`.

Independent SW-QA-008 verdict: **PASS**.

Accepted visual result:
- tidy translucent planar-cone read is genuinely gone;
- default storm reads immediately as one dirty, irregular, connected tornado / condensation mass;
- lower-funnel / ground contact now reads as stronger dirty connected circulation;
- no product-code mutation or merge occurred during independent QA.

Status: **DIRECTOR ACCEPTED AND FROZEN.** Do not edit, amend, rebase, or self-merge. Eligible for later Integration input after Integration recovery/green gates.

## #66 Storm Site lane — FROZEN, NOT YET DIRECTOR ACCEPTED

Issue: #66
QA issue: #72 SW-QA-007
Branch: `agent/sw-world-005-level-001-acceptance-fix`
Exact frozen head: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
Latest Director QA classification comment #72: `5282502983`

The previous `ffmpeg` / missing prepared-VFX environment blocker is resolved by the GitHub Actions harness.

Corrected Actions run `31715118431` successfully performed:
- exact frozen source checkout;
- ffmpeg setup;
- approved checksum-pinned Kenney VFX preparation;
- deterministic v5.1 + GAME-002 + LEVEL construction;
- production packaging;
- implementation truth 28/28 PASS;
- campaign fixture 66/66 PASS;
- v5.1 fixture 55/55 PASS;
- Storm Site static/contract 12/12 PASS;
- real browser execution.

Focused LEVEL browser behavior is green:
- executorIntegration PASS;
- campaignHomeRestored PASS;
- mooProtected PASS;
- fairLaunch PASS;
- fairReplayVariation PASS;
- fairSignature PASS;
- boardwalkLaunch PASS;
- boardwalkReplayVariation PASS;
- boatLaunchSignalOnly PASS;
- noHttpErrors PASS.

Evidence hashes:
- County Fair screenshot `669acaaafd62a4a2389c965c6c614d36edbd1e900f6e7c683662ca93bb4a58ee`
- Coastal screenshot `1e2cc19453f2b9f129b5286f29f73ff9bad12a141ad8d36d95e4e39c3e43cd16`

Remaining browser reds:
- `noPageErrors` FAIL;
- `noRuntimeConsoleErrors` FAIL.

Exact global modern-shell error:
`Legacy runtime contract is incomplete: hasClockBridge, hasInputAbilityBridge, hasScoringCampaignBridge, hasPresentationWorldBridge`

Director classification:
- this is no longer an environment/package blocker;
- focused LEVEL behavior is green;
- remaining red is a global modern-shell / legacy-contract bootstrap condition not yet causally attributed to LEVEL;
- do NOT edit WORLD-005/LEVEL product source from this signal;
- keep exact `1350cee...` frozen and OUT of Integration;
- next action is same-runner/base A/B or equivalent causal proof for the modern-shell red.

## Integration lane: SW-INT-003 — FROZEN / BLOCKED LOCAL CANDIDATE

Issue: #70
Branch: `agent/sw-int-003-stage2b-accepted-stack`
Exact remote SHA as of 2026-08-13: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

Remote remains intentionally untouched. Previous Integration worker assembled an accepted-stack candidate locally, but mandatory GAME-002 browser QA was red, so it correctly did not push.

First Integration action remains recovery/classification, NOT new assembly:
1. locate/preserve the exact prior local candidate if it still exists;
2. return exact local SHA if committed, otherwise worktree/HEAD/status/staged/unstaged/untracked/changed-file set;
3. recover exact PWA delta/conflict provenance;
4. recover exact GAME-002 failing checks and observed vs expected state;
5. run same-runner A/B against accepted source `ce1e47c...` if possible;
6. classify integration regression vs harness/environment/pre-existing discrepancy;
7. do not weaken QA, reset, clean, rebase, amend, or silently reconstruct missing local work.

Do not append new inputs while Integration remains red.

Once Integration is genuinely green, append accepted inputs one at a time with full regression proof:
1. SW-RPG-002 exact `97aa6ae...`;
2. SW-WORLD-006 exact `1264617b...`;
3. SW-LEVEL-001 only after separate Director acceptance of exact `1350cee...`.

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

1. Classify SW-QA-007 modern-shell red with same-runner/base A/B or equivalent causal proof. No LEVEL edits without causality.
2. Recover/preserve SW-INT-003 exact local candidate before any reconstruction or new imports.
3. Once Integration base candidate is green, append accepted Slingshot and WORLD inputs one at a time, with exact provenance and full regression gates.
4. Keep `1350cee...` out until Director accepted.
5. Keep unrelated Moo/UI/clock signals separate unless causal proof ties them to the active diff.
6. No new feature expansion until this accepted-stack landing is under control.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
