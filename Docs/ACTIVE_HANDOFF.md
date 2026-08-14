# Active Handoff

Last updated: 2026-08-14
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director authority branch: `agent/director-stage2b-game-direction`

## Start here

GitHub is durable project memory. Chat is temporary context. Do not use `main` as current gameplay/project authority.

Fresh Director recovery:
1. verify the head of `agent/director-stage2b-game-direction`;
2. read this file;
3. verify only the exact issue/branch/CI evidence required for the next decision;
4. before assigning, reviewing, integrating, or changing work, also read `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, `Docs/ACTIVE_PRODUCTION_SLATE.md`, and `Docs/IMPLEMENTATION_TRUTH_GATE.md`.

Execution authority order:

`exact task/issue + exact branch/commit/CI evidence > this handoff > product/operating laws > production slate > historical status/docs`

Green CI is not Director visual acceptance. Director acceptance is not owner physical-device acceptance. Deployment is a separate gate.

## Current canonical Stage 2B source

Canonical integration branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted canonical head:
`706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

This was non-force fast-forwarded from prior canonical `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4` after SW-INT-004 combined acceptance.

### SW-INT-004 commercial-shell acceptance

Issue #87 is closed completed.

Integration branch:
`agent/sw-int-004-commercial-shell`

Exact accepted head:
`706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

Workflow proof:
- workflow: `SW-INT-004 Commercial Shell`
- run: `31851282218`
- conclusion: **SUCCESS**
- artifact: `sw-int-004-commercial-shell`
- artifact digest: `sha256:5a176e1934a31f6efe52a44f68b6561b83e1bd30415a41f943f649a99ba2b583`

Accepted inputs:
- #83 SW-UI-003 cleaned head `76042f632398d4bef917a08436dc2338034fb3e6`
- #86 SW-UI-004 head `8becea1133864057050d6cd48ad033dc9992c445`

Combined acceptance proof passed:
- inherited Stage 2B / QUALITY-001 / QUALITY-002 static and browser gates;
- UI-003 full browser proof;
- Storm Site browser QA;
- combined gameplay/pause/results coexistence QA;
- no page/runtime/HTTP errors in the combined gate.

Director pixel review passed:
- normal gameplay prominently identifies **Severe Weather Warning**;
- visible `SEVERE WEATHER 3D`, `3D LAB`, and `PRODUCTION SLICE` chrome is removed;
- Pull/Gust/Zap, timer, score, radar, and gameplay truth remain visible;
- pause reads as an authored Severe Weather Warning run-dispatch card and fits 844x390;
- results read as a front-page event with dominant score/rank, grade stamp, grouped stats, and large actions.

## Accepted presentation slices

### #83 — SW-UI-003 Run-shell Americana identity

State: **Director accepted / closed**
Exact accepted cleaned head:
`76042f632398d4bef917a08436dc2338034fb3e6`
Exact-head workflow run:
`31850349941` — **SUCCESS**

Accepted outcomes:
- pause belongs to the Severe Weather Warning local-news/Americana identity;
- Heartland, County Fair, Gullwind Boardwalk, and Moo Level identities are correct;
- results have clear score/rank hierarchy, grade stamp, grouped stats, and reachable actions;
- unrelated generated VFX files were removed before final acceptance.

### #86 — SW-UI-004 Gameplay product identity

State: **Director accepted / closed**
Exact accepted head:
`8becea1133864057050d6cd48ad033dc9992c445`
Workflow run:
`31850999825` — **SUCCESS**

Accepted outcomes:
- gameplay masthead uses **Severe Weather Warning**;
- internal `3D LAB`, `PRODUCTION SLICE`, and `SEVERE WEATHER 3D` labels are not player-facing;
- NOAA warning no longer advertises internal `3D` implementation identity;
- controls and gameplay truth remain intact.

A separate older desktop technical control legend remains a possible later HUD-polish task. It did not block UI-004.

## Still NOT accepted: secondary storm forms

Issue #81 `SW-WORLD-007` remains open and visually rejected.

Branch:
`agent/sw-world-007-secondary-storm-forms`

Truthful evidence history:
- initial worker head `bd24ea9...` had invalid identical selector screenshots;
- capture harness was corrected;
- exact truthful head `b7d8c6408b5dc0eff8589bc5c6c8a209a1fac965` passed workflow run `31850040071`;
- those truthful pixels proved Supercell still looked like a UFO/saucer and Derecho like geometric sheets, so Director rejected the product result.

Direct bounded correction work then added:
- atmospheric sprite-mass replacement layer;
- visibility lock to keep rejected legacy Supercell/Derecho geometry suppressed after storm selection/runtime visibility refreshes;
- QA-only Cow-Cam chrome suppression for storm evidence.

Latest branch head at this handoff:
`4caeae17d5c7949f1ef110e9ef9df3d209c375b6`

Latest workflow:
`31851426172` — **in progress at handoff**

Fresh Director action:
- verify exact current head/run;
- if green, download and inspect the five truthful storm frames;
- accept only if Supercell reads label-free as a severe rotating thunderstorm and Derecho as an advancing shelf/arcus wall;
- keep #81 out of canonical until that visual bar passes.

The prior inherited UI-001 `mooResultsLegibleFixture` failure on a WORLD run was classified as an independent fixture rebuild, not a proven WORLD product regression. Do not use that classification to waive visual acceptance.

## Still NOT accepted: destruction consequence

Issue #82 `SW-FEEL-001` remains open and visually rejected pending latest correction evidence.

Branch:
`agent/sw-feel-001-destruction-consequence`

Engineering lineage:
- original worker head `1e77d38f00684c297c778ec0811859520ced21d8`;
- accidental cross-worker package registrations were removed;
- exact-source CI gate added;
- truthful capture QA added so evidence must hide menu, focus a real lethal destruction event, show visible effects, and produce distinct screenshot hashes.

Truthful head `23c8576dca6de1c47c0a42dc11a78505847b3096` passed run `31850468812`, but Director pixel review rejected the result because generic chunks still dominated the read.

A structural-anatomy correction then added roof/wall/facade failure panels. Run `31850869183` was technically green, but pixels still showed generic fragment burst dominating the structure failure.

Latest correction adds **structural priority**:
- structural buildings allow only two small generic fragments;
- roof/wall/facade anatomy panels bypass that suppression and remain dominant;
- trees/cows are excluded from the throttle;
- authoritative lethal event, damage, score, collision, targetability, abilities, and Cow safety remain untouched.

Latest branch head at this handoff:
`d84e5bd66fcb46518324efa8a7c23a1598702658`

Latest workflow:
`31851501064` — **in progress at handoff**

Fresh Director action:
- verify exact current head/run;
- if green, download truthful FEEL evidence and inspect whether building failure reads through roof/wall/facade anatomy rather than cubes/confetti;
- do not integrate #82 until the physical consequence is visually convincing.

## QA Pages publisher

Issue #84 `SW-QA-009` remains open.
Draft PR #85 remains unmerged.
Branch:
`agent/sw-qa-009-pages-publisher-refresh`

The publisher was previously corrected and no-deploy validated at head:
`37df138bce04f7384e5d0e42ded13831fdc1ad83`
Validation run:
`31850189242` — **SUCCESS**

However, that validation targeted the previous canonical `7d3e7e...` before SW-INT-004 acceptance.

**The publisher branch is now stale again relative to canonical `706408e4...`.**
Before any Pages merge/deploy:
1. update the publisher contract/default to exact new canonical `706408e4...`;
2. ensure its deterministic assembly includes accepted UI-003 + UI-004 after QUALITY-002;
3. rerun the branch-only no-deploy validator against exact new canonical;
4. review the diff/evidence;
5. only then intentionally merge/deploy if desired.

Public QA must not be claimed to serve the new canonical until exact Pages deployment evidence exists.

## Product laws that remain binding

- Genre: mobile arcade destruction + light action RPG progression.
- Player fantasy: **YOU ARE THE STORM**.
- Fun/destruction first; beauty is first-class.
- Art thesis: **storm-charged stylized Americana**.
- Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
- Storm forms must read as connected atmospheric masses, never visible effect primitives.
- Authored world identity beats generic Blocktown repetition.
- Newspaper is recurring identity across selection/results; gameplay UI need not literally be newspaper everywhere.
- Cow 17, cows, and Moo Brew remain the comic backbone; cows remain protected/non-targetable.
- Campaign remains home backbone; Storm Sites expand around it.
- MOO-LAH is local-first earned gameplay currency, not RMT by default.
- Exactly three equipped active abilities in the Storm Triangle.
- Pull/Gust/Grid Zap base behavior remains protected unless an exact task reopens it.
- No stamina/wait/grind/forced ads.
- Phone is a platform, not an excuse to shrink the game.

## Near-term de-prototype priorities

1. Finish #81 secondary storm visual identity without reopening mechanics.
2. Finish #82 physical destruction consequence without changing gameplay authority.
3. Refresh #84 publisher to exact new canonical, no-deploy validate, then choose whether to publish QA.
4. After those gates, highest-value remaining visual/product work includes:
   - tactile MOO-LAH + Storm Triangle reward/purchase presentation;
   - Secret Moo Level legendary-stage identity;
   - broader world density/material repetition pass;
   - bounded cleanup of the remaining technical desktop control legend.

Twin Tornadoes, Waterspout, satellite feat, full U.S. map, online/accounts, and other future expansion remain held unless separately assigned.

## Chat rollover rule

When context becomes heavy or uncertain, recover from Issue #71 and this file. Never ask the owner to reconstruct branch state, QA state, sequencing, or prior decisions GitHub can prove.
