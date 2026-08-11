# Active Handoff

Last updated: 2026-08-11 16:05 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## Director operating law

Repository state is durable memory. Chat is temporary context. Never use `main` as project authority.

Startup law:

`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Worker-state law, reaffirmed by owner:

**Assignment is authority to start. Branch movement / returned evidence is proof that work actually happened. Director acceptance is a separate gate.**

Do not confuse lack of branch movement with lack of assignment/authority. Conversely, do not infer completed execution merely from an assignment, prepared branch, or owner-independent assumption.

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

### #63 SW-QA-002 - rapid prototype evidence lane
Branch: `agent/sw-qa-002-rapid-prototype-lane`
Exact accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`
Status: **ACCEPTED prototype evidence lane only**. Do not promote prototype authority into production.

### #64 SW-PWA-001 - installable shell
Branch: `agent/sw-pwa-001-installable-shell`
Exact accepted head: `7cda055a4773c5c9dc69c0d02018cd9454a86628`
Status: **ACCEPTED integration candidate**.

`test:pwa`, `qa:pwa`, and process verification are durable PASS. Physical Android install acceptance and production deployment remain separate gates.

### #65 SW-UI-001 - newspaper presentation
Branch: `agent/sw-ui-001-newspaper-presentation`
Exact durable head: `43348db9b56ec18bca8418c8dfe13470aad4722d`
Status: durable accepted sequencing lineage; final owner/product visual acceptance remains separate because original returned screenshots were not durable.

### #68 SW-SCORE-001 - persistent scorekeeper
Branch: `agent/sw-score-001-persistent-scorekeeper`
Exact accepted head: `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
Status: **ACCEPTED integration candidate**.

### #67 SW-RPG-001 - MOO-LAH + Storm Triangle foundation
Branch: `agent/sw-rpg-001-moolah-storm-triangle`
Exact accepted head: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Status: **ACCEPTED integration candidate for first RPG slice**.

Accepted foundation:
- local-first `severe_weather_moolah_v1`;
- deterministic score-derived MOO-LAH;
- newspaper reward/purchase rail;
- exactly three Storm Triangle active slots: Pull, Gust, Grid Zap;
- bounded persistent upgrades;
- active upgrade/loadout identity in SCORE-001 metadata;
- no movement/camera or score-formula authority drift.

## WORLD-004 tornado correction - durable, awaiting independent QA

Issue: #61
Implementation branch: `agent/sw-world-004-storm-hero-acceptance-fix`
Base: `f9430bc0cee0d02b3aacf2eb0909183d14912617`
Exact durable head: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
Worker return comment: `5258823665`

Director verified the exact head is one commit ahead of base and changes only:
- `runtime/threejs-visual-hero-slice6-stability-guard.js`
- `runtime/threejs-visual-hero-slice6.js`
- `scripts/qa-threejs-hero-slice6.mjs`
- `scripts/verify-threejs-hero-slice6.mjs`

WORLD return reports:
- ragged wedge/condensation mesh-ribbon profile;
- `visibleBoxes: 0` and `visiblePhase6Dust: 0` in required frames;
- 99/99 static verifier PASS;
- modern build PASS;
- focused Chromium evidence PASS;
- no intentional protected gameplay/system drift.

WORLD self-report is **not** Director visual acceptance.

### QA assignment - SW-QA-006
Branch: `agent/sw-qa-006-world-004-visual-acceptance`
Exact source under test: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
Director activation comment #61: `5258867278`
Status: **ASSIGNED / AUTHORIZED TO START**. For this no-product-edit task, branch movement is not required; return evidence proves execution.

Binary acceptance question:
Does the exact corrected head read immediately as one connected ragged tornado/storm mass, with no attack-bubble read, no tidy translucent cone, and no visible square/card effect primitives?

If QA passes, freeze `347159f1...` as the WORLD visual integration input and feed that exact head to Integration. If QA fails, pin only the concrete visual defect.

## #66 SW-LEVEL-001 - QA classification complete; WORLD correction assigned

Original implementation branch: `agent/sw-level-001-storm-site-framework`
Base: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
Durable head: `07e089f03bdb2943e6b3d64033010736805afb4a`
Original status: durability PASS, product/behavioral acceptance FAIL.

### QA-005 classification return
Issue #66 QA return comment: `5258792205`
Exact tested source: `07e089f03bdb2943e6b3d64033010736805afb4a`
No product source edits.

Confirmed findings:
1. **P0 product/runtime defect:** Storm Site -> Heartland/home restores selection flag but leaves stale site world state. Post-return still has active site variant, 13 site targets, 16 decorative meshes, and boat signature state. Root cause: Heartland path restores visibility but does not dispose Storm Site world/targets.
2. **Boat signal product behavior PASS; QA helper defect:** real `boat-launch-signal` is reachable and observable. Existing `destroySignature()` chooses the first signature target, pier coaster, instead of the boat.
3. **Packaging/preparation:** three unique missing Kenney VFX textures, not seven unique origins: `dirt_01.png`, `smoke_03.png`, `trace_03.png`. Existing checksum-pinned vendor preparation resolves them. Final package preparation belongs to Integration.
4. **P1 product-facing acceptance blocker:** County Fair / Coastal captures are obscured by Hart Farm/newspaper opening presentation, so screenshots do not prove the authored locations. This is a launch/cinematic-handoff or evidence-timing failure that must be corrected/proven.
5. Static campaign/V5.1/LEVEL and main browser input/scoring/V5.1 protections passed. Separate red signals remain for `playerPauseForensicsHidden` and Hart Farm activation/failure/unlock progression in the assembled QA run. QA did not prove those were caused by LEVEL source; do not absorb them opportunistically into the LEVEL fix.

### WORLD assignment - SW-WORLD-005
Branch: `agent/sw-world-005-level-001-acceptance-fix`
Exact base: `07e089f03bdb2943e6b3d64033010736805afb4a`
Director activation comment #66: `5258869511`
Status: **ASSIGNED / AUTHORIZED TO START**.

Authorized correction only:
- P0 full Storm Site teardown + accepted Heartland/home world restoration;
- P1 player-visible County Fair / Coastal handoff so authored place is actually visible/playable and screenshot-proofable;
- fix the level QA helper to explicitly test `boat-launch-signal`;
- use existing approved vendor preparation for browser proof, without redesigning storm VFX.

Protected:
- no WORLD-004 renderer imports;
- no RPG/scorekeeper/newspaper/PWA feature changes;
- no Waterspout/U.S. map implementation;
- no movement/camera/ability/scoring/campaign/cow retune;
- do not silently fix unrelated clock/Moo red results unless exact causal proof points to this LEVEL diff.

Do not feed #66 into Integration until the correction exact head is Director accepted.

## GAME - SW-RPG-002 Slingshot restarted cleanly

Issue: #67
Task: **Pull + Gust = Slingshot**
Approved exact base: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Branch: `agent/sw-rpg-002-slingshot-synergy`
Director correction/restart comment: `5258871547`

### Critical truth correction
The prior assumption that a completed Slingshot state existed was false.

GAME returned conclusive local evidence:
- no local Slingshot branch;
- no usable origin branch in the GAME checkout;
- no worktree or reflog containing Slingshot work;
- current clean GAME worktree remains RPG-001 at `ce1e47c...`;
- sole unreachable commit is unrelated Slice 6 presentation work.

Connector-side GitHub does contain the prepared Slingshot branch, but it is untouched at exact base `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`.

Therefore:
- SW-RPG-002 was assigned previously;
- execution/completion was never proven;
- there is **no completed Slingshot state to recover or accept**;
- the false closure assumption is superseded.

GAME is now **ASSIGNED / AUTHORIZED TO START** a clean implementation of the existing Slingshot contract from exact base `ce1e47c...`.

If the GAME checkout cannot see the remote branch but has the exact base commit locally, Director pre-authorizes local task branch creation directly from that SHA, followed by exact branch/HEAD verification.

Required behavior remains:
- Pull captures/holds physical debris;
- Gust during a valid window launches it as a substantial projectile;
- player/storm aim and physical state determine direction;
- no invisible auto-targeting;
- light/heavy object differentiation;
- ordinary Pull and Gust independently preserved;
- no extra HUD slot;
- no WORLD/#66/Twins/Waterspout/satellite/map/online drift.

Branch movement/return evidence will prove this restarted implementation actually happened.

## Integration - owner-confirmed running

Issue: #70 SW-INT-003
Branch: `agent/sw-int-003-stage2b-accepted-stack`
Exact starting SHA: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Director activation: `5258622796`
Latest Director status: `5258872735`

Owner explicitly confirms Integration is **still running** as of 2026-08-11 16:05 America/Chicago. Treat the session as active. Current remote branch still resolving to the starting SHA does not contradict that; branch movement/evidence will prove executed work when it lands.

Current accepted assembly input:
- #62 Moo Level lineage;
- #65 newspaper lineage;
- #68 scorekeeper lineage;
- accepted #67 RPG-001 lineage;
- add exact #64 PWA task delta without promoting prototype-only #63 authority.

Do not yet import:
- WORLD-004 until SW-QA-006 passes exact `347159f1...`;
- #66 until SW-WORLD-005 correction is accepted;
- Slingshot until GAME actually implements it and Director accepts the exact head.

Integration owns final assembly, intentional conflict resolution, exact-source combined verification, PWA/package preparation, candidate packaging, and release-artifact reporting. It does not invent missing feature work.

## Product laws

- Genre: arcade destruction game with light action RPG progression.
- Full player-facing title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone.
- Exactly three active abilities per run in the Storm Triangle; storm form/passives are separate.
- Physical/discoverable synergy is a replay pillar. Named prototype: **Pull + Gust = Slingshot**.
- MOO-LAH is earned gameplay currency, not a manipulative retention economy.
- Persistent local-first scorekeeping is core.
- Newspaper presentation is recurring UI identity for storm select, UNLEASH STORM, and results.
- Weather Map direction is a stylized nostalgic U.S. destination selector.
- Storm Sites are authored substantial destruction fantasies with signature moments, not generic procedural arenas.
- Phone is a platform, not the intended size of the game.
- Become C++-ready, not C++-dependent. No rewrite.

## Immediate Director actions

1. QA executes exact-head WORLD-004 visual acceptance on `347159f1...`.
2. WORLD executes bounded #66 acceptance correction from `07e089f...`.
3. GAME executes Slingshot cleanly from accepted RPG-001 `ce1e47c...`; do not refer to it as recovery/completion until evidence exists.
4. Integration continues the accepted-stack assembly while those lanes work.
5. When exact accepted outputs return, feed them to Integration one at a time with provenance.
6. Keep separate clock/Moo red signals visible; do not attribute them to #66 without causal proof.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
