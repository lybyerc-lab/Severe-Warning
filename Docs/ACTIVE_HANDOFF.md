# Active Handoff

Last updated: 2026-08-11 16:59 America/Chicago
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
  - accepted head `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
- #63 SW-QA-002 prototype evidence lane only
  - head `73b28e07a5b05dd632226af851b06a32e99bb068`
  - do not promote prototype authority wholesale
- #64 SW-PWA-001 installable shell
  - accepted head `7cda055a4773c5c9dc69c0d02018cd9454a86628`
  - Integration uses only the task delta relative to `73b28e07a5b05dd632226af851b06a32e99bb068`
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

What improved:
- attack-bubble read removed;
- no visible square/card primitive system;
- static verifier 99/99 PASS;
- typecheck/build/browser green;
- protected gameplay/system drift not found.

Sole pinned product defect:
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

At shutdown, remote WORLD-006 still resolves to exact base `347159f1...`; assignment is active, execution branch movement not yet proven.

## #66 Storm Site lane

### WORLD-005 durable correction

Branch: `agent/sw-world-005-level-001-acceptance-fix`
Base: `07e089f03bdb2943e6b3d64033010736805afb4a`
Exact durable head: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
Worker closure comment #66: `5259215734`

Verified one commit ahead of base, changing only:
- `runtime/sw-level-001-storm-site-framework.js`
- `scripts/qa-sw-level-001.mjs`
- `scripts/verify-sw-level-001.mjs`

WORLD returned evidence for:
- full Storm Site -> Heartland teardown/restoration;
- player-visible Fair/Coastal handoff;
- explicit accepted-path `boat-launch-signal` damage proof;
- no Waterspout unlock;
- approved vendor preparation of three Kenney VFX inputs;
- focused Storm Site browser 12/12 PASS;
- campaign 66/66, V5.1 55/55, process 28/28 PASS;
- zero page/HTTP/runtime-console errors in WORLD's prepared package;
- separate Moo `encounterUnlocked` red left untouched/unattributed.

### SW-QA-007 result: BLOCKED / NOT ACCEPTED

Issue: #72
Verification branch: `agent/sw-qa-007-level-001-acceptance`
Exact source: `1350cee7535220fb9fc5e7c1b4de284e6aae8156`
Director activation #66: comment `5259238266`
Director classification #66: comment `5259334731`
Director classification #72: comment `5259335632`

Independent QA passed:
- implementation-truth 28/28;
- campaign fixture 66/66;
- V5.1 fixture 55/55;
- Storm Site static/contract gate 12/12;
- real executor binding;
- authored Fair/Coastal contracts;
- teardown ordering;
- explicit `boat-launch-signal` damage-path contract;
- no Waterspout unlock authority;
- candidate diff remains limited to the declared LEVEL runtime plus two QA scripts, with no static movement/ability/scoring/Grid Zap/Moo/tornado-renderer retune found.

Independent browser acceptance was NOT validly produced because:
1. exact-source build hit the repository-required recorded-storm-effects step and `ffmpeg` was unavailable in the QA Windows environment; QA did not bypass it;
2. the local QA checkout did not contain the three prepared Kenney VFX inputs:
   - `assets/production/vfx/kenney/dirt_01.png`
   - `assets/production/vfx/kenney/smoke_03.png`
   - `assets/production/vfx/kenney/trace_03.png`
3. therefore no valid independent Fair/Coastal screenshots/hashes, teardown runtime telemetry, page/HTTP/runtime-console observations, or runtime boat-damage proof were captured.

Director classification:
- **QA BLOCKED / NOT ACCEPTED**;
- no new LEVEL gameplay defect is proven;
- do NOT reopen WORLD-005 product code from this result;
- keep exact `1350cee...` frozen;
- no Integration handoff yet;
- next QA run must use a suitable environment with `ffmpeg`, perform the already-approved checksum-pinned VFX preparation, build the exact frozen source, then rerun full browser acceptance;
- if that prepared exact-source run fails behaviorally, classify the concrete product defect then;
- separate Moo `encounterUnlocked` remains unexercised/unattributed in QA-007.

## GAME lane: SW-RPG-002 Slingshot

Issue: #67
Branch: `agent/sw-rpg-002-slingshot-synergy`
Base: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`
Exact durable head: `97aa6ae792ed5fb201c0fd35d748a4dfff971e61`
Worker closure comment: `5259294815`
Status: **DURABLE / NOT YET DIRECTOR ACCEPTED**. Independent acceptance still required before Integration input.

Returned behavior/evidence:
- Pull captures eligible physical target through accepted Pull loop;
- Gust in valid held window releases bounded moving debris;
- direction derives from player/storm motion or camera-forward aim, not target-position auto-targeting;
- light/heavy differentiation: mass 1 speed 145 vs mass 5 speed 67.08;
- ordinary Pull remains independent;
- ordinary Gust retains accepted standalone 90 damage;
- exactly three Storm Triangle slots remain;
- browser QA 7/7 PASS, zero page/runtime errors;
- verifier 8/8 PASS;
- SCORE-001 browser 13/13 PASS including inherited GAME-002 + normal campaign;
- RPG-001 browser 10/10 PASS;
- process 28/28 PASS;
- separate protected UI-001 `mooResultsLegibleFixture` remains 8/9 and was not masked or patched.

Next GAME step: independent exact-head QA / Director review. Do not hand to Integration before acceptance.

## Integration lane: SW-INT-003

Issue: #70
Branch: `agent/sw-int-003-stage2b-accepted-stack`
Exact remote SHA at shutdown: `ce1e47c858cdbca5039fb7ad7ad2545f4537c238`

Integration assembled the accepted-stack candidate locally, but mandatory GAME-002 browser QA was red. It correctly did NOT push.

Director landing directive #70: comment `5259284234`.

Owner reports Integration finished the assigned landing-mode tasks. Treat that as valid direct session evidence. Exact final local-candidate closure evidence is still not durable on Issue #70, and the remote branch intentionally remains untouched.

First Integration action next session:
1. recover/preserve the exact local assembled candidate;
2. post exact local candidate SHA if committed, otherwise branch/HEAD/status/changed-file set;
3. post exact PWA delta/conflict provenance;
4. post exact GAME-002 failing checks, observed vs expected state, command/environment, page/runtime errors;
5. state whether accepted-source `ce1e47c...` comparison was completed in the same runner; if not, say `comparison not completed`;
6. only then classify integration defect vs harness/pre-existing discrepancy.

Do not reconstruct from scratch unless preserved local state is genuinely lost and that loss is explicitly proven. Do not weaken QA or import #66/WORLD/RPG-002 while the inherited gate is red.

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
3. QA-007: rerun exact `1350cee...` only in a build-capable environment with `ffmpeg` and approved checksum-pinned VFX preparation; do not change LEVEL source merely to make QA runnable.
4. WORLD: continue SW-WORLD-006 from `347159f1...`; accept only if the planar-cone read is genuinely gone.
5. GAME: independently verify/Director-review Slingshot exact head `97aa6ae...`; if accepted, freeze it for later Integration append.
6. Keep WORLD-004 rejected and out of Integration.
7. Keep #66 and RPG-002 out of Integration until exact-head Director acceptance.
8. Never treat separate Moo/clock/UI red signals as authority for opportunistic fixes without causal proof.

## Repo housekeeping

Issues #74 and #75 were accidental temporary/duplicate task shells created during Director setup and were immediately closed as not planned. They carry no product or worker authority. Canonical new task issues are #72 QA-007 and #73 WORLD-006.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. Recover from GitHub, not owner memory.
