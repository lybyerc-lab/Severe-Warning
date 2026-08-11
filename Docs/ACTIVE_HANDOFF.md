# Active Handoff

Last updated: 2026-08-11 16:56 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

## Director operating law

Repository state is durable memory. Chat is temporary context. Never use `main` as project authority.

Startup law:
`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Worker-state law:
**Assignment is authority to start. Branch movement / returned evidence is proof that work actually happened. Director acceptance is a separate gate.**

Green CI is engineering evidence, not product acceptance. Worker-reported completion is not Director acceptance. Drift is a product defect.

## Accepted / frozen foundation

- #62 SW-GAME-002 Hart Farm unlock + real Moo Level
  - branch `agent/sw-game-002-moo-level-unlock`
  - accepted head `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
- #63 SW-QA-002 prototype evidence lane only
  - head `73b28e07a5b05dd632226af851b06a32e99bb068`
  - do not promote prototype authority wholesale
- #64 SW-PWA-001 installable shell
  - accepted head `7cda055a4773c5c9dc69c0d02018cd9454a86628`
  - Integration uses the task delta relative to `73b28e07a5b05dd632226af851b06a32e99bb068`
- #65 SW-UI-001 newspaper presentation
  - durable head `43348db9b56ec18bca8418c8dfe13470aad4722d`
- #68 SW-SCORE-001 persistent scorekeeper
  - accepted head `3d1661cfdd019f0285dc8556d0e598c22f0cb489`
- #67 SW-RPG-001 MOO-LAH + Storm Triangle foundation
  - accepted head `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

## WORLD visual lane

### WORLD-004 / QA-006 result: REJECTED

Issue: #61
Rejected exact head: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
QA closure comment: `5259177517`

SW-QA-006 tested the exact head and returned **FAIL for Director visual acceptance**.

What improved:
- attack-bubble read removed;
- no visible square/card primitive system;
- static verifier 99/99 PASS;
- typecheck/build/browser green;
- protected gameplay/system drift not found.

Sole pinned remaining product defect:
**The tornado still reads as a tidy translucent planar geometric cone, strongest at lower-funnel/ground contact.** Long clean translucent strips converge too orderly instead of reading as dirty irregular condensation/lower circulation.

WORLD-004 stays OUT of Integration.

### WORLD-006 assigned

Issue: #73 `SW-WORLD-006: Remove planar-cone tornado read`
Branch: `agent/sw-world-006-planar-cone-acceptance-fix`
Exact base: `347159f1baa4988fa2c93428cd4562ef78b38a9d`
Director activation on #61: comment `5259239987`

Scope is one defect only:
- break tidy planar/conical construction into dirty irregular condensation/lower circulation;
- preserve one coherent connected tornado/storm silhouette;
- do not regress to bubbles, discs, cards, disconnected wisps, or broad redesign;
- preserve movement/camera/abilities/scoring/campaign/cows/Moo/Storm Sites/newspaper/scorekeeper/RPG/PWA/Neon/cinematic lifecycle.

At shutdown, remote WORLD-006 branch still resolves to exact base `347159f1...`; assignment is active, execution branch movement not yet proven.

## #66 Storm Site lane

Original head `07e089f03bdb2943e6b3d64033010736805afb4a` failed QA-005 because:
- Storm Site -> Heartland left stale Site state;
- player-facing Fair/Coastal captures were obscured by inherited opening presentation;
- old QA helper did not explicitly select the boat signal;
- three Kenney VFX inputs required approved vendor preparation.

### WORLD-005 durable correction

Branch: `agent/sw-world-005-level-001-acceptance-fix`
Base: `07e089f03bdb2943e6b3d64033010736805afb4a`
Exact durable head: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
Worker closure comment #66: `5259215734`

Verified one commit ahead of base, changing only:
- `runtime/sw-level-001-storm-site-framework.js`
- `scripts/qa-sw-level-001.mjs`
- `scripts/verify-sw-level-001.mjs`

Returned evidence:
- Heartland restoration clears Site root/state, targets, decor, variant, signatures and restores accepted campaign world;
- Fair/Coastal opening overlay issue corrected for player-visible launch proof;
- Coastal explicitly tests `boat-launch-signal` through accepted damage handling;
- no Waterspout unlock/progression;
- approved VFX preparation resolves `dirt_01.png`, `smoke_03.png`, `trace_03.png`;
- focused packaged Storm Site QA 12/12 PASS;
- campaign 66/66, V5.1 55/55, process 28/28 PASS;
- inherited V5.1/movement/abilities/scoring browser QA PASS;
- zero page/HTTP/runtime-console errors in focused package;
- separate Moo `encounterUnlocked` red remains classified pre-existing/unrelated and was not patched.

### QA-007 assigned

Issue: #72 `SW-QA-007: Independent SW-WORLD-005 Storm Site acceptance`
Verification branch: `agent/sw-qa-007-level-001-acceptance`
Exact source: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
Director activation #66: comment `5259238266`

No product edits. Must independently accept/reject teardown restoration, authored Fair/Coastal visibility, explicit boat signal, vendor-prepared zero-error browser proof, and protected regressions.

Do not feed #66 to Integration until QA-007 passes and Director freezes the exact head.

## GAME lane: SW-RPG-002 Slingshot

Issue: #67
Branch: `agent/sw-rpg-002-slingshot-synergy`
Base: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Exact durable head: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
Worker closure comment: `5259294815`
Status: **DURABLE / NOT YET DIRECTOR ACCEPTED**. Independent acceptance still required before Integration input.

Changed files:
- `package.json`
- `runtime/sw-rpg-002-slingshot.js`
- `scripts/apply-sw-rpg-002-slingshot.mjs`
- `scripts/verify-sw-rpg-002-slingshot.mjs`
- `scripts/qa-sw-rpg-002-slingshot.mjs`

Returned behavior/evidence:
- Pull captures eligible physical target through accepted Pull loop;
- Gust in valid held window releases bounded moving debris;
- direction derives from player/storm motion or camera-forward aim, not target-position auto-targeting;
- light/heavy differentiation observed: mass 1 speed 145 vs mass 5 speed 67.08;
- ordinary Pull remains independent;
- ordinary Gust retains accepted standalone 90 damage;
- exactly three Storm Triangle slots remain;
- browser QA 7/7 PASS, zero page/runtime errors;
- verifier 8/8 PASS;
- SCORE-001 browser 13/13 PASS including inherited GAME-002 + normal campaign;
- RPG-001 browser 10/10 PASS;
- process 28/28 PASS;
- separate protected UI-001 `mooResultsLegibleFixture` remains 8/9 and was not masked or patched.

Next GAME step next session: independent exact-head QA / Director review. Do not hand to Integration before acceptance.

## Integration lane: SW-INT-003

Issue: #70
Branch: `agent/sw-int-003-stage2b-accepted-stack`
Exact remote SHA at shutdown: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

Integration assembled the accepted-stack candidate locally, but mandatory GAME-002 browser QA was red. Correctly did NOT push.

Director landing directive #70: comment `5259284234`.

Owner reports Integration finished the assigned landing-mode tasks before shutdown. Treat that as valid direct session evidence. However, as of this handoff update, the exact final local-candidate closure report is not durable on Issue #70, and the remote branch intentionally remains untouched.

Known durable classification:
- local assembled candidate existed;
- mandatory GAME-002 browser QA red;
- no bad/red candidate pushed;
- preserve local assembly rather than rebuild/reset/rebase;
- do not weaken QA;
- do not import #66, WORLD, or RPG-002 while the inherited gate is red.

First Integration action next session:
1. recover/preserve the exact local assembled candidate;
2. post exact local candidate SHA if committed, otherwise branch/HEAD/status/changed-file set;
3. post exact PWA delta/conflict provenance;
4. post exact GAME-002 failing checks, observed vs expected state, command/environment, page/runtime errors;
5. state whether accepted-source `ce1e47c...` comparison was completed in the same runner; if not, say `comparison not completed`;
6. only then classify integration defect vs harness/pre-existing discrepancy.

Do not reconstruct from scratch unless the preserved local state is genuinely lost and that loss is explicitly proven.

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
- Physical/discoverable synergy is a replay pillar. First concrete synergy: **Pull + Gust = Slingshot**.
- Twin Tornadoes, Waterspout, satellite feat, full U.S. map, and online/accounts remain future/held-back scope unless separately assigned.
- No stamina/wait/grind/forced ads.
- Controller-friendly, local-first, C++-ready not C++-dependent.
- Phone is a platform, not the intended size of the game.

## Shutdown checkpoint / next-session priority

1. Fetch this file live first.
2. Integration: recover and durably post the preserved SW-INT-003 landing evidence before any new assembly work.
3. QA: complete SW-QA-007 exact-head acceptance of `1350cee...`.
4. WORLD: continue SW-WORLD-006 from `347159f1...`; accept only if the planar-cone read is genuinely gone.
5. GAME: independently verify/Director-review Slingshot exact head `97aa6ae...`; if accepted, freeze it for later Integration append.
6. Keep WORLD-004 rejected and out of Integration.
7. Keep #66 and RPG-002 out of Integration until exact-head Director acceptance.
8. Never treat the separate Moo/clock/UI red signals as authority for opportunistic fixes without causal proof.

## Repo housekeeping

Issues #74 and #75 were accidental temporary/duplicate task shells created during Director setup and were immediately closed as not planned. They carry no product or worker authority. Canonical new task issues are #72 QA-007 and #73 WORLD-006.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
