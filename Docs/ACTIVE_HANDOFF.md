# Active Handoff

Last updated: 2026-08-14 16:36 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director authority branch: `agent/director-stage2b-game-direction`

## Start here

GitHub is durable project memory. Chat is temporary context. Do not use `main` as current gameplay/project authority.

For a fresh Director session:

1. verify the head of `agent/director-stage2b-game-direction`;
2. read this file;
3. verify only the exact issue/branch/CI evidence needed for the next decision;
4. before assigning, reviewing, integrating, or changing work, also read `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, `Docs/ACTIVE_PRODUCTION_SLATE.md`, and `Docs/IMPLEMENTATION_TRUTH_GATE.md`.

Execution authority order remains:

`exact task/issue + exact branch/commit/CI evidence > this handoff > product/operating laws > production slate > historical status/docs`

Assignment is not proof a worker ran. Branch creation is not completion. Green CI is not Director product acceptance. Browser acceptance is not physical Android acceptance.

## Current canonical Stage 2B source

Canonical integration branch:

`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted canonical head:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

This is a non-force fast-forward from the previous canonical `271e5d3d7b438727df8b217ad59b7974ff1374b6` and contains the bounded owner-playtest quality rescue.

### QUALITY rescue closure

Issues:
- #79 `SW-QUALITY-001: Owner-playtest quality rescue` — **closed completed**
- #80 `SW-QUALITY-002: Owner playtest visual rescue` — **closed completed**

Final rescue branch/head:

`agent/sw-quality-001-owner-playtest-rescue`
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Decisive engineering closure:
- workflow: `SW-QUALITY Owner Playtest Rescue`
- Actions run: `31834411255`
- exact head: `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`
- conclusion: **success**

The final commit over the independently visually reviewed candidate changed only `.github/workflows/sw-quality-001-owner-playtest-rescue.yml` to provide the inherited Storm Site QA server environment. No product/runtime visual source changed in that final CI-only step.

Independent QUALITY-002 visual evidence:
- branch: `agent/sw-qa-quality-002-visual-acceptance`
- durable evidence head: `ec723a14474e5db502b8a5fd7899807dad7db4d0`
- visual candidate reviewed: `f493e3d51f6d772d89bdbe945529ebde9d58196f`
- baseline: `271e5d3d7b438727df8b217ad59b7974ff1374b6`
- verdict: **PASS** for short-landscape newspaper, Tornado presentation, County Fair, Gullwind Boardwalk, Storm Site lifecycle, Cow 17 opening, and regression sniff test.

Accepted rescue outcomes to protect:
- Tornado reads as a connected dirty rotating whole-column storm mass;
- short-landscape newspaper is compact, readable, and launch-reachable;
- pause remains reachable on short landscape;
- quit-to-main-menu ends active-run presentation/lifecycle cleanly;
- County Fair and Gullwind Boardwalk have distinct environment identities;
- Storm Sites launch directly without inheriting the Heartland Cow 17 opener;
- Cow 17 opening has improved actor/camera/material staging and no prototype/debug chrome.

## Post-QUALITY-002 hostile audit

Audit branch:

`agent/sw-audit-post-quality-002-gap-map`

Durable audit head:

`ea2946912c623504e22da74a4f58463f373b3491`

Audit target:

`f493e3d51f6d772d89bdbe945529ebde9d58196f`

The audit added report/evidence only and changed no product source. It found **no P0 blockers**.

Material P1 gaps that remain:
1. Supercell and Derecho still read as sci-fi/UFO/laser primitives.
2. Pause/run-shell identity and site labels need coherent presentation.
3. Results newspaper lacks hierarchy/fanfare.
4. MOO-LAH/Storm Triangle presentation feels administrative.
5. Secret Moo Level environment/HUD needs bespoke legendary-stage polish.
6. Destruction consequence relies too heavily on instant despawn, generic block debris, and floating score text.

The audit explicitly found the accepted Tornado, Cow 17 opening, mobile newspaper selector, and County Fair/Gullwind environmental profiles acceptable.

## Active worker wave

All three current tasks use exact base:

`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

### #81 — SW-WORLD-007: Supercell and Derecho atmospheric identity overhaul
Branch:
`agent/sw-world-007-secondary-storm-forms`

Owned outcome:
- replace Supercell saucer/disc read with connected rotating severe-thunderstorm mass;
- replace Derecho cyan/wireframe wedge with advancing shelf/arcus storm wall;
- preserve all gameplay values and accepted Tornado presentation.

### #82 — SW-FEEL-001: Physical destruction consequence presentation
Branch:
`agent/sw-feel-001-destruction-consequence`

Owned outcome:
- add bounded physical failure presentation to authoritative lethal destruction events;
- make ordinary house/commercial destruction read through anatomy, directional debris, and dust;
- preserve health, damage, collision, scoring, targetability, and ability authority.

### #83 — SW-UI-003: Run-shell Americana identity for pause and results
Branch:
`agent/sw-ui-003-run-shell-identity`

Owned outcome:
- make pause belong to the Severe Weather Warning visual language;
- show correct active-site identity for Heartland, County Fair, Gullwind, and Moo Level;
- make results score/rank hierarchy and actions feel like a front-page event;
- preserve pause lifecycle, score/result truth, progression, and gameplay authority.

### Worker-state warning

These branches/issues are active assignments. Do **not** infer completion from their existence or from an Antigravity UI badge. Before review or integration, verify exact branch movement, final SHA, diff, executed QA, and returned evidence.

## Deliberately held follow-ons

Do not widen #81/#82/#83 into these areas.

Likely next bounded product work after current evidence returns:
- tactile MOO-LAH + Storm Triangle presentation/reward feedback;
- Secret Moo Level bespoke/legendary visual and HUD identity;
- broader world density/material repetition pass;
- additional destruction anatomy families after the first consequence slice proves its contract.

Twin Tornadoes, Waterspout, satellite feat, full U.S. map, online/accounts, and other future expansion remain held unless separately assigned.

## Product laws that remain binding

- Genre: mobile arcade destruction + light action RPG progression.
- Player fantasy: **YOU ARE THE STORM**.
- Fun/destruction first; beauty is first-class.
- Art thesis: **storm-charged stylized Americana**.
- Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
- Storm forms must read as connected atmospheric masses, never visible effect primitives.
- Authored world identity beats generic Blocktown repetition.
- Newspaper is recurring identity across selection and results, but gameplay UI need not literally become newspaper everywhere.
- Cow 17, cows, and Moo Brew remain the comic backbone; cows remain protected/non-targetable.
- Town/county campaign remains home backbone; Storm Sites expand around it.
- MOO-LAH is local-first earned gameplay currency, not RMT by default.
- Exactly three equipped active abilities in the Storm Triangle.
- Pull/Gust/Grid Zap base behavior remains protected unless an exact task reopens it.
- No stamina/wait/grind/forced ads.
- Phone is a platform, not an excuse to shrink the game.

## Public QA / deployment warning

Canonical source acceptance and Pages deployment are separate gates.

This handoff records `7d3e7e...` as the accepted canonical source. Do **not** claim the public QA root is serving that SHA unless the exact Pages publisher/deployment evidence is verified separately. The previously documented public QA deployment was based on `271e5d3...`.

## Immediate Director sequence

While #81/#82/#83 execute independently:

1. keep the Director knowledge branch current without touching worker branches;
2. when a worker returns, verify exact pushed head, diff, QA, evidence, and drift before acceptance;
3. do not integrate one worker merely because another is still running unless conflict/sequence evidence supports it;
4. after all relevant evidence returns, choose accepted heads and integration order;
5. only then update canonical/Pages and record the new state.

## Chat rollover rule

When context becomes heavy or uncertain, recover from Issue #71 and this file. Never ask the owner to reconstruct branch state, QA state, sequencing, or prior decisions that GitHub can prove.
