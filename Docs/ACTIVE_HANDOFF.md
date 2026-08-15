# Active Handoff

Last updated: 2026-08-14
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director authority branch: `agent/director-stage2b-game-direction`

## Start here

GitHub is durable project memory. Chat is temporary context. Do not use `main` as gameplay/project authority.

Fresh Director recovery:
1. verify the head of `agent/director-stage2b-game-direction`;
2. read this file;
3. verify the exact issue/branch/CI/deployment evidence needed for the next decision;
4. before assigning, reviewing, integrating, or changing work, also read `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, `Docs/ACTIVE_PRODUCTION_SLATE.md`, and `Docs/IMPLEMENTATION_TRUTH_GATE.md`.

Execution authority order:

`exact task/issue + exact branch/commit/CI/deployment evidence > this handoff > product/operating laws > production slate > historical status/docs`

Green CI is not Director visual acceptance. Director acceptance is not owner physical-device acceptance. Deployment is a separate gate.

## Current canonical Stage 2B source

Canonical integration branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted canonical head:
`de2e62835e79567b4bbfc079a372ce2af4ee0879`

This supersedes prior canonical `706408e4e367782fed0ffc6e40d0cdd27a7e71bd` after SW-INT-005 combined acceptance.

### SW-INT-005 acceptance

Issue #91 is closed completed.
Integration branch: `agent/sw-int-005-weather-feel-polish`
Exact accepted head: `de2e62835e79567b4bbfc079a372ce2af4ee0879`
Workflow run: `31856905543` — **SUCCESS**

Accepted inputs:
- #81 SW-WORLD-007: `1ccae11a381b61f0e15138888dbccf9f97fb48ef`, run `31853925019` — SUCCESS
- #82 SW-FEEL-001: `a1d98d2150683f4151bdd0fec08b7ff3c5ff9033`, run `31854084156` — SUCCESS
- #90 SW-UI-005: `c6007883bbdecd65a22186510f13dd4b40778198`, run `31855004054` — SUCCESS

Combined proof on the exact assembled game passed:
- Stage 2B / QUALITY-001 / QUALITY-002 authority and browser gates;
- accepted pause/results and gameplay product identity;
- Storm Site launch/browser QA;
- Supercell/Derecho visual identity plus Tornado presentation exclusivity;
- physical destruction consequence plus one-structure visual proof;
- desktop field controls with exact mobile restoration;
- same-bundle score, personal-best, results, campaign persistence, reload, runtime, and transport checks;
- combined evidence packaging.

Director pixel review passed. No protected gameplay/scoring/damage/collision/ability/Cow-safety authority was reopened.

## Accepted visual/product outcomes

### Secondary storms — #81 accepted / closed

Supercell and Derecho no longer rely on the rejected saucer/wireframe/ghost-Tornado presentation. The final proof makes secondary storm presentation mutually exclusive with the accepted Tornado silhouette while restoring Tornado correctly when selected.

### Physical destruction — #82 accepted / closed

The first bounded structural-destruction slice now reads through roof/wall/facade failure and restrained material fragments instead of the inherited uniform cube burst. The authoritative lethal event, damage, score, collision, targetability, abilities, and Cow safety remain unchanged.

### Field controls — #90 accepted / closed

Desktop gameplay now uses a restrained product-native control strip with readable steering/ability/warning-area truth. Exact original full action text is restored on mobile, and no binding may clip in the desktop proof.

### Commercial shell remains accepted

- #83 SW-UI-003 pause/results identity: accepted / closed
- #86 SW-UI-004 gameplay product identity: accepted / closed
- #87 SW-INT-004 commercial shell: accepted / closed

Normal gameplay prominently identifies **Severe Weather Warning**, player-visible lab/prototype chrome is removed, pause/results belong to the same local-news/Americana universe, and core controls/timer/score/radar truth remain visible.

## QA Pages is now live for owner playtest

Issue #84 SW-QA-009 is closed completed.
PR #85 merged to `main` at:
`f0e80daaca03f702cc71440c7b00c315337e443b`

Publisher branch validation:
- branch head: `92f245ef5d7d33d5adc8c47487c935133d8b3c3b`
- no-deploy run: `31857344504` — **SUCCESS**

Live QA Pages deployment:
- workflow: `QA Pages Playtest`
- run: `31857742807` — **SUCCESS**
- Pages artifact ID: `9239659287`
- artifact digest: `sha256:f13439efca9816151180c4a57c4b5eb87c1667787d238fb1145cbfb18cbc40c3`
- public QA URL: `https://lybyerc-lab.github.io/Severe-Warning/`

The deploy logs prove `playtest-info.json` was stamped into the deployed artifact with source SHA and accepted canonical both equal to:
`de2e62835e79567b4bbfc079a372ce2af4ee0879`

Composition stamped for owner playtest:
`Stage 2B + QUALITY-001/002 + UI-003/004/005 + WORLD-007 + FEEL-001`

This deployment is **QA-only**. It does not imply owner physical acceptance, Android acceptance, or production/release authority.

## Next meaningful gate: owner playtest

Do not immediately widen systems just because CI and deployment are green. The next highest-value evidence is the owner actually playing canonical `de2e628...` on the public QA build.

Suggested lightweight owner pass:
1. play one normal Heartland run;
2. play County Fair or Gullwind Boardwalk if convenient;
3. try Supercell and Derecho if convenient;
4. judge destruction payoff, storm readability, pause/results, controls, and overall commercial feel;
5. report what feels cheap, confusing, frustrating, unexpectedly fun, or worth protecting.

Owner feedback is product evidence, not automatic code mutation. Translate it into bounded hypotheses/tasks before implementation.

## Likely next de-prototype priorities after owner feedback

Current candidates, not yet active implementation contracts:
1. tactile MOO-LAH + Storm Triangle reward/purchase presentation;
2. Secret Moo Level legendary-stage environment/HUD treatment;
3. broader world density/material-repetition pass;
4. bounded Tornado material-richness and small results-typography polish where evidence supports it.

Do not widen these into major systems without an exact task.

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
- Campaign remains the home backbone; Storm Sites expand around it.
- MOO-LAH is local-first earned gameplay currency, not RMT by default.
- Exactly three equipped active abilities in the Storm Triangle.
- Pull/Gust/Grid Zap base behavior remains protected unless an exact task reopens it.
- No stamina/wait/grind/forced ads.
- Phone is a platform, not an excuse to shrink the game.

Held unless separately assigned: Twin Tornadoes, Waterspout, satellite feat, full U.S. map, online/accounts/leaderboards, and large new feature expansion.

## Chat rollover rule

When context becomes heavy or uncertain, recover from Issue #71 and this file. Never ask the owner to reconstruct branch state, QA state, sequencing, deployment state, or prior decisions GitHub can prove.
