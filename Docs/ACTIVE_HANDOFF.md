# Active Handoff

Last updated: 2026-08-14 16:54 America/Chicago
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

Execution authority order:

`exact task/issue + exact branch/commit/CI evidence > this handoff > product/operating laws > production slate > historical status/docs`

Assignment is not proof a worker ran. AG completion is not durable completion until pushed. Green CI is not Director visual/product acceptance. Browser acceptance is not physical Android acceptance.

## Current canonical Stage 2B source

Canonical integration branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted canonical head:
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

This is a non-force fast-forward from previous canonical `271e5d3d7b438727df8b217ad59b7974ff1374b6` and contains the accepted owner-playtest QUALITY-001/002 rescue.

### Accepted rescue evidence

Issues #79 and #80 are closed completed.

Final rescue branch/head:
`agent/sw-quality-001-owner-playtest-rescue`
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Decisive workflow:
- `SW-QUALITY Owner Playtest Rescue`
- run `31834411255`
- exact head `7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`
- conclusion **success**

Independent QUALITY-002 visual evidence:
- branch `agent/sw-qa-quality-002-visual-acceptance`
- evidence head `ec723a14474e5db502b8a5fd7899807dad7db4d0`
- visual candidate `f493e3d51f6d772d89bdbe945529ebde9d58196f`
- baseline `271e5d3d7b438727df8b217ad59b7974ff1374b6`
- verdict **PASS** for short-landscape newspaper, Tornado, County Fair, Gullwind, Storm Site lifecycle, Cow 17 opening, and regression sniff test.

Protected accepted outcomes:
- Tornado is a connected dirty rotating whole-column storm mass;
- short-landscape newspaper is compact/readable/launch-reachable;
- pause remains reachable;
- quit-to-main-menu cleanly ends the active run;
- County Fair and Gullwind Boardwalk are environmentally distinct;
- Storm Sites do not inherit the Heartland Cow 17 opener;
- Cow 17 opening has improved actor/camera/material staging and no prototype/debug chrome.

## Post-QUALITY-002 audit

Audit branch/head:
`agent/sw-audit-post-quality-002-gap-map`
`ea2946912c623504e22da74a4f58463f373b3491`

No P0 blockers.

P1 gaps driving the current wave:
1. Supercell/Derecho still read as sci-fi primitives.
2. Pause/run-shell identity and site labels.
3. Results hierarchy/fanfare.
4. MOO-LAH/Storm Triangle tactile presentation.
5. Secret Moo Level bespoke visual/HUD identity.
6. Physical destruction consequence/anatomy.

## WEEKEND HOLD CHECKPOINT — current worker wave

All three tasks were assigned from exact base:
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Owner reports all AG workers completed. All three now have durable task commits on origin, but none are authorized for integration until their exact evidence gates below are satisfied.

### #81 — SW-WORLD-007 Supercell and Derecho atmospheric identity

Branch:
`agent/sw-world-007-secondary-storm-forms`

Latest durable head verified at checkpoint:
`bd24ea9e2cfa075459c2518d266584dfc6b8a81f`

Diff state:
- exactly one commit ahead of canonical base;
- bounded new WORLD-007 runtime/apply/verify/QA/workflow plus visual evidence files;
- no integration/deployment performed.

Workflow evidence:
- `SW-WORLD-007 Secondary Storm Forms`
- run `31843555614`
- exact head `bd24ea9e2cfa075459c2518d266584dfc6b8a81f`
- conclusion **success**
- own QA plus inherited QUALITY-001/002, newspaper, Storm Site gates passed.

**IMPORTANT VISUAL-EVIDENCE DEFECT:**
The uploaded workflow artifact `sw-world-007-visual-review` was downloaded and inspected. All five requested PNGs are byte-for-byte identical, all SHA-256:
`85a90ca03c6456beeb8e1785105eb913949f344d009cae4eda21fae83bd7c212`

All five show the newspaper selector instead of distinct Supercell/Derecho/Tornado gameplay states. Therefore #81 is **NOT Director visually accepted** despite green CI.

A correction was requested from the WORLD-007 AG worker:
- freeze product source/design intent;
- fix only capture/QA harness needed to enter truthful storm gameplay states;
- regenerate distinct captures;
- rerun gates;
- push correction to the same branch;
- return new pushed SHA + capture hashes;
- no merge/deploy.

Fresh Director action: re-read the exact branch head. If it advanced beyond `bd24ea9e...`, inspect only the correction diff, workflow, and regenerated evidence before making any acceptance decision.

### #82 — SW-FEEL-001 Physical destruction consequence

Branch:
`agent/sw-feel-001-destruction-consequence`

Latest durable head verified:
`1e77d38f00684c297c778ec0811859520ced21d8`

Diff state:
- exactly one commit ahead of canonical base;
- adds bounded FEEL-001 runtime/apply/verify/browser-QA files, completion report, telemetry, and three evidence captures;
- no unrelated integration/deployment performed.

Durable worker evidence:
- completion report: `artifacts/feel-001-evidence/SW_FEEL_001_COMPLETION_REPORT.md`
- static verifier: **16/16 PASS**
- Playwright behavioral QA: **9/9 PASS**
- inherited implementation-truth, city-fabric destruction, GAME-002, LEVEL-001, QUALITY-001, QUALITY-002 verifiers reported PASS;
- fixed pools reported: 48 debris meshes, 8 shockwave rings, 24 dust puffs;
- worker reports reset-to-zero cleanup and no intentional health/damage/collision/scoring/ability/Cow-safety drift.

Evidence captures committed under:
`artifacts/feel-001-evidence/captures/`

At checkpoint there is **no GitHub Actions run** for this branch. Treat the committed worker QA as durable evidence, but not CI confirmation and not Director visual acceptance.

Fresh Director action: inspect exact captures/telemetry and source seam, verify gameplay-authority invariants from diff/QA, and decide whether an independent visual acceptance pass is needed before integration.

### #83 — SW-UI-003 Run-shell Americana identity

Branch:
`agent/sw-ui-003-run-shell-identity`

Latest durable head verified:
`87001b43933b07006d8ea1708c0f8d35aaa19673`

Diff state:
- two commits ahead of canonical base;
- adds bounded UI-003 runtime/apply/verify/browser-QA/workflow, committed pause/results captures, and `artifacts/sw-ui-003/report.json`;
- no integration/deployment performed.

Durable local report:
- `artifacts/sw-ui-003/report.json`
- `passed: true`
- Heartland/County Fair/Gullwind/Moo pause identity checks true;
- results grade stamp/layout checks true;
- 844x390 and 1280x720 fit checks true;
- no page, console, asset transport, or HTTP 404 errors reported.

GitHub Actions evidence:
- workflow `SW-UI-003 Run Shell Identity`
- run `31844332814`
- exact head `87001b43933b07006d8ea1708c0f8d35aaa19673`
- conclusion **failure before product tests ran**

Exact failure cause:
- `actions/setup-node@v4` is configured with `cache: npm`;
- workflow then uses `npm ci`;
- repository has no npm lockfile because the project uses pnpm;
- setup-node fails with `Dependencies lock file is not found`;
- install/verifier/browser-QA steps are skipped.

Therefore #83 is **not rejected as product work**, but is **CI-unclosed**.

A CI-only correction was requested from the UI-003 AG worker:
- freeze product runtime and committed visual assertions/evidence;
- change only workflow/harness to the established Node 22 + corepack/pnpm frozen-install pattern;
- install Chromium if browser QA requires it;
- rerun existing verifier/QA unchanged;
- push correction to same branch;
- no merge/deploy.

Fresh Director action: re-read branch head. If it advanced beyond `87001b4...`, verify the correction is workflow/harness-only and require green CI before Director acceptance.

## QA Pages publisher defect

Issue #84 `SW-QA-009: Refresh QA Pages publisher for accepted rescue canonical` is open.

Current `main` workflow `.github/workflows/qa-pages-playtest.yml` is stale:
- defaults/falls back to pre-rescue `271e5d3...`;
- deterministic assembly stops at `apply-sw-ui-002-landscape-unleash.mjs`;
- it does not assemble the accepted QUALITY-001 + QUALITY-002 visual/frame-bridge stages.

Latest successful QA Pages Playtest publisher run at discovery was `31763225553`, still from the earlier landscape-correction publisher state.

Do **not** edit/deploy that workflow casually while active product branches are under review. #84 is an infrastructure correction task, not product-authoring authority.

## Repo hygiene completed before weekend hold

The active authority layer was cleaned so stale documents no longer masquerade as current truth:
- root `README.md` now points to Stage 2B authority;
- `REPOSITORY_BOOTSTRAP.md` now redirects away from obsolete Unity setup;
- `Docs/AGENT_BRIDGE.md` is superseded/history-only;
- `Docs/REPLAY_EXPANSION_STATUS.md` is superseded/history-only;
- `Docs/ACCEPTED_BEHAVIOR.md` distinguishes historical Android acceptance from current Stage 2B authority;
- `Docs/DOCUMENT_AUTHORITY_MAP.md` classifies current authority versus historical repository memory.

Proven completed old issues were also closed instead of remaining a fake active backlog. Historical docs/ledgers remain in Git for archaeology and exact milestone evidence.

## Product laws that remain binding

- Genre: mobile arcade destruction + light action RPG progression.
- Player fantasy: **YOU ARE THE STORM**.
- Fun/destruction first; beauty is first-class.
- Art thesis: **storm-charged stylized Americana**.
- Visual promise: **beautiful at a glance, readable at speed, cinematic up close**.
- Storm forms must read as connected atmospheric masses, never visible effect primitives.
- Authored world identity beats generic Blocktown repetition.
- Newspaper is recurring identity across selection/results; gameplay UI need not literally be newspaper everywhere.
- Cow 17, cows, and Moo Brew remain comic backbone; cows remain protected/non-targetable.
- Campaign remains home backbone; Storm Sites expand around it.
- MOO-LAH is local-first earned gameplay currency, not RMT by default.
- Exactly three equipped active abilities in the Storm Triangle.
- Pull/Gust/Grid Zap base behavior remains protected unless an exact task reopens it.
- No stamina/wait/grind/forced ads.
- Phone is a platform, not an excuse to shrink the game.

## Public QA / deployment warning

Canonical source acceptance and Pages deployment are separate gates.

Canonical accepted source remains `7d3e7e...`. Do not claim public QA serves that SHA without exact deployment evidence. The publisher itself is currently known stale under #84.

## Immediate Director sequence after weekend / fresh recovery

1. Verify current Director branch head and this handoff.
2. Re-read exact heads of #81/#82/#83 branches.
3. For #81, require truthful distinct storm gameplay captures after the harness correction before visual acceptance.
4. For #82, review the durable one-commit diff, telemetry, and captures; add independent visual QA if needed.
5. For #83, require the CI-only pnpm workflow correction and a green exact-head run before acceptance.
6. Do not integrate any worker merely because AG says completed.
7. Once individual accepted heads exist, determine conflict/integration order from exact diffs.
8. Keep canonical at `7d3e7e...` until that review is complete.
9. Fix/review #84 separately before intentionally refreshing public QA Pages.
10. No production/main merge or Android acceptance claim follows automatically from any of the above.

## Deliberately held follow-ons

After current worker evidence is accepted, likely next bounded product work:
- tactile MOO-LAH + Storm Triangle presentation/reward feedback;
- Secret Moo Level bespoke/legendary visual and HUD identity;
- broader world density/material repetition pass;
- additional destruction anatomy families after SW-FEEL-001 proves its contract.

Twin Tornadoes, Waterspout, satellite feat, full U.S. map, online/accounts, and other future expansion remain held unless separately assigned.

## Chat rollover rule

When context becomes heavy or uncertain, recover from Issue #71 and this file. Never ask the owner to reconstruct branch state, QA state, sequencing, or prior decisions GitHub can prove.
