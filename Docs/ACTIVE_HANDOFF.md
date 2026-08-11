# Active Handoff

Last updated: 2026-08-11 08:19 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Product title: **Severe Weather Warning**
Production renderer: Three.js r128
Active phase: **Stage 2B: Make It Feel Like a Game**
Director branch: `agent/director-stage2b-game-direction`
First-batch coordination base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`
Public QA root: `https://lybyerc-lab.github.io/Severe-Warning/`

## New Director session startup

The repository is durable memory. Chat is temporary working context.

1. Read `AGENTS.md` from `agent/director-stage2b-game-direction`.
2. Read `Docs/GAME_DIRECTOR.md`.
3. Read `Docs/WORKER_STARTUP_ORDER.md`.
4. Read this handoff and `Docs/ACTIVE_PRODUCTION_SLATE.md`.
5. Read the exact active issues and latest Director comments before acting.
6. Inspect live worker branch heads. Newer exact evidence beats this prose.
7. Do not use `main` as project authority.

Mandatory worker startup law:

`assigned worktree -> assigned branch -> exact SHA verified -> task-versioned governing docs -> intended change / protected behavior / proof plan -> edit`

Never interpret task authority from an unverified checkout.

## Production truth

- Frozen gameplay/fun reference: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- Sealed Stage 1 graphics source: `f2060dff08ddb9df9f90ecd245940d8db86c7266`.
- Rejected but technically green QA #29 source: `b501737e71e61b979901d4899d969390aa37b1f4`.
- QA #29 remains owner product-rejected because the default tornado read as attack bubbles / graphics regression and the Cow Level was presentation-only.
- Browser-first remains the production path. Android is opt-in for deliberate physical checkpoints.
- Green CI is engineering evidence, not product acceptance.
- Drift is treated as a product defect.

## Stage 2B live worker board

### WORLD #61 — SW-WORLD-003

Issue: #61
Branch: `agent/sw-world-003-storm-hero-recovery`
Original base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Status at this handoff: **still active / not yet Director-reviewed as complete** unless newer branch evidence exists.

Goal remains to recover the default tornado as one coherent, dangerous atmospheric hero mass and remove the attack-bubble read without changing protected gameplay authority.

WORLD remains the visual gate for the first Stage 2B integrated candidate. Green tests alone are insufficient. Acceptance requires representative mobile screenshots including default hero read, Main Street, and lower funnel / ground contact.

### GAME #62 — SW-GAME-002

Issue: #62
Finished worker branch: `agent/sw-game-002-moo-level-unlock`
Frozen worker head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`
Original base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Owner reported on 2026-08-11 that the GAME worker completed its task.

Director code-shape review already found the implementation on-scope: Hart Farm unlock challenge, persistent `mooLevelUnlocked`, locked/unlocked MOO LEVEL node, dedicated Moo County Fair score attack, safe-cow identity, best score, return path, and guarded normal-campaign wrappers.

Important acceptance distinction: the GitHub issue currently does not contain the worker's final executed browser/QA evidence return. Do not send GAME back for more feature work merely because the evidence is not persisted. Keep the finished branch frozen. Before integrating GAME-002, the Director still must reconcile the exact-head executed proof for failure/rearm, persistence, dedicated Moo Level, cow safety, and normal-campaign regression. If that proof exists outside GitHub, persist the outcome or independently verify rather than asking the owner to coordinate logs.

### QA #63 — SW-QA-002

Issue: #63
Finished/accepted branch: `agent/sw-qa-002-rapid-prototype-lane`
Accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`
Original base: `82e6c6fbeffffc3ee929c00260f924e36c70de28`

Director status: **ACCEPTED integration candidate**.

Exact-head GitHub Actions Run `31494975840` completed successfully. It verified exact source identity, built the prototype candidate, ran mobile Chromium boot/control/render/screenshot smoke, packaged evidence, and uploaded artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`).

The prototype lane remains explicitly non-production with `productionAuthority: false`, `qaPagesDispatched: false`, and no Pages/publisher/Android promotion authority.

Keep the accepted QA branch frozen unless a new Director correction is issued.

## Newly launched follow-up work

GAME and QA workers are free after completing their first-batch tasks. The next wave was launched with exact bases and inherited-behavior guards rather than leaving the lanes idle.

### QA -> PWA #64 — SW-PWA-001

Issue: #64
Branch: `agent/sw-pwa-001-installable-shell`
Exact base: `73b28e07a5b05dd632226af851b06a32e99bb068`

Launch authority is the latest Director comment on #64, which supersedes the older queued line in the issue body.

Goal: make the GitHub Pages/browser build installable as **Severe Weather Warning** with correct `/Severe-Warning/` project scope, standalone launch, manifest/icons, and a cache/update strategy that cannot trap testers on stale QA builds.

Protected: sealed production QA/Pages publisher/Android gates, prototype zero-authority semantics, normal browser play, all gameplay.

### GAME -> Newspaper UI #65 — SW-UI-001

Issue: #65
Branch: `agent/sw-ui-001-newspaper-presentation`
Exact base: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Launch authority is the latest Director comment on #65, which supersedes the older queued line in the issue body.

Goal: create one coherent **Severe Weather Warning** local-newspaper presentation family across storm selection, **UNLEASH STORM**, opening-newspaper identity where practical, and end-run results.

Protected: GAME-002 Moo Level behavior, unlock truth, scores/stats calculations, storm-selection semantics, Pull/Gust/Grid Zap, movement/camera, campaign timing/objectives, WORLD presentation, QA/PWA authority. This task does not add MOO-LAH, RPG systems, scorekeeper architecture, U.S. map expansion, or unrelated replay features.

## Remaining queue

Do not launch these blindly. Choose exact bases after the active seams and acceptance evidence are known.

- #66 `SW-LEVEL-001`: extensible Storm Site framework / U.S. map destination structure.
- #67 `SW-RPG-001`: MOO-LAH, Storm Triangle, upgrades, synergies.
- #68 `SW-SCORE-001`: persistent scorekeeper, records, competitive replay loop.

No Stage 2B Integration worker is active yet unless newer exact direction says otherwise.

## Product direction that must survive rollover

Canonical direction remains in `Docs/GAME_DIRECTOR.md` and issue-specific companions. High-level laws:

- Genre: arcade destruction game with light action RPG progression.
- Full player-facing title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone.
- Exactly three active abilities per run in the Storm Triangle; storm form/passives are separate.
- Physical/discoverable synergy is a replay pillar. Named prototype: **Pull + Gust = Slingshot**.
- Individual abilities remain fun on their own.
- MOO-LAH is earned gameplay currency, not a manipulative retention economy.
- Persistent local-first scorekeeping is a must-have core system.
- Newspaper presentation is recurring UI identity for storm select, UNLEASH STORM, and results.
- Weather Map direction is a stylized nostalgic U.S. destination selector.
- Storm Sites are authored substantial destruction fantasies with signature moments, not generic procedural arenas.
- Phone is a platform, not the intended size of the game. Preserve controller-friendly architecture where practical.
- Become C++-ready, not C++-dependent. No rewrite.

## Immediate Director actions

1. Watch WORLD #61 for its first committed completion evidence and judge the tornado visually, not only structurally.
2. Reconcile GAME #62 final executed evidence before integration; do not ask the owner to reconstruct worker logs.
3. Manage active PWA #64 and UI #65 workers against their exact launch comments and bases.
4. Do not launch #66-#68 until exact conflict-safe bases are chosen.
5. Do not production-merge rejected QA #29.
6. Do not start Integration until the first-batch candidate set is actually acceptable and the merge order is explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. The next Director should recover from GitHub, not from owner memory.