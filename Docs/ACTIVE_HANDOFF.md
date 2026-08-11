# Active Handoff

Last updated: 2026-08-11 10:21 America/Chicago
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
5. Read exact active issues and latest Director comments before acting.
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

## First-batch completion state

### WORLD #61 - SW-WORLD-003

Owner reports the WORLD worker completed its task. At the latest GitHub check, the assigned branch still pointed at the original frozen base and the durable implementation/evidence return had not appeared yet.

Treat #61 as **worker-reported complete, durable return still missing**. Do not send WORLD back for redesign. Reconcile/persist the completed result and visually judge the required tornado screenshots before first-batch integration acceptance.

### GAME #62 - SW-GAME-002

Finished branch: `agent/sw-game-002-moo-level-unlock`
Frozen head: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Owner reports GAME completed its task. Director code-shape review found it on-scope for the Hart Farm unlock encounter and persistent dedicated MOO LEVEL. Final exact-head browser/QA evidence still needs Director reconciliation before integration. Do not send GAME back for feature work merely because the evidence is not persisted.

### QA #63 - SW-QA-002

Finished/accepted branch: `agent/sw-qa-002-rapid-prototype-lane`
Accepted head: `73b28e07a5b05dd632226af851b06a32e99bb068`

Director status: **ACCEPTED integration candidate**.

Exact-head GitHub Actions Run `31494975840` completed successfully and uploaded artifact `severe-weather-prototype-SW-QA-002-preintegration-4` (artifact ID `9102613291`). Prototype authority remains explicitly non-production.

## Next worker wave - Director launch authority issued 2026-08-11 10:21

The owner directed the Game Director to keep worker lanes moving. The following assignments are now explicitly activated by the latest Director comments on their issues.

Important state law: assignment/launch authority is durable in GitHub, but actual worker-session liveness must still be verified by branch movement, worker return, or other exact execution evidence. Do not confuse an assigned branch with proof that an external worker process is alive.

### QA -> #64 SW-PWA-001

Issue: #64
Branch: `agent/sw-pwa-001-installable-shell`
Exact starting SHA: `73b28e07a5b05dd632226af851b06a32e99bb068`

Goal: installable **Severe Weather Warning** PWA shell with correct `/Severe-Warning/` scope, standalone launch, manifest/icons, deterministic source identity, and an update/cache strategy that cannot trap testers on stale QA builds.

Protected: SW-QA-002 zero production authority, sealed QA/Pages/publisher/Android gates, ordinary browser play, all gameplay.

Latest Director activation comment on #64 supersedes the earlier prepared-only correction.

### GAME -> #65 SW-UI-001

Issue: #65
Branch: `agent/sw-ui-001-newspaper-presentation`
Exact starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Goal: one coherent **Severe Weather Warning** local-newspaper presentation family across storm selection, **UNLEASH STORM**, opening-newspaper identity where practical, and end-run results.

Protected: GAME-002 Moo Level behavior, unlock truth, score/stat calculations, storm-selection semantics, Pull/Gust/Grid Zap, movement/camera, campaign timing/objectives, WORLD presentation, QA/PWA authority.

Latest Director activation comment on #65 supersedes the earlier prepared-only correction.

### WORLD -> #66 SW-LEVEL-001

Issue: #66
Branch: `agent/sw-level-001-storm-site-framework`
Exact starting SHA: `89aeac92d032bfc6546cb8da7c52effc7a408aa1`

Goal: first scalable Storm Site registration/definition framework, preserving the existing town/county campaign as home territory and proving the contract with a County Fair/Fairground site and a Coastal Boardwalk/Pier site.

Key laws:
- authored variability should read **same place, different storm day**;
- sites must remain substantial enough for real tornado movement, route choice, combos, and spectacle;
- County Fair must remain distinct from the secret Moo Level;
- coastal proof may expose a boat-launch feat signal, but Waterspout progression remains later authority;
- do not implement newspaper UI, MOO-LAH/RPG, scorekeeper, or full U.S. map UI in this task;
- do not absorb or rewrite the missing WORLD-003 storm-renderer return.

Latest Director launch comment on #66 is the exact task authority.

## Queue after this wave

- #67 `SW-RPG-001`: MOO-LAH, Storm Triangle, meaningful upgrades, synergies. Keep queued until the first Stage 2B acceptance/playtest seam is solid enough to reopen progression and ability tuning safely.
- #68 `SW-SCORE-001`: persistent local-first scorekeeper, records, competitive replay loop. Keep queued until #65 establishes the results/newspaper seam so score persistence can integrate without parallel results-UI collision.

No Stage 2B Integration worker is active yet. Integration waits for first-batch acceptance reconciliation and exact merge order.

## Product direction that must survive rollover

- Genre: arcade destruction game with light action RPG progression.
- Full player-facing title: **Severe Weather Warning**.
- Fun/destruction first; beauty is first-class.
- Storm is the visual hero and must read as one connected dangerous mass.
- Cows and Moo Brew are the comic backbone.
- Exactly three active abilities per run in the Storm Triangle; storm form/passives are separate.
- Physical/discoverable synergy is a replay pillar. Named prototype: **Pull + Gust = Slingshot**.
- MOO-LAH is earned gameplay currency, not a manipulative retention economy.
- Persistent local-first scorekeeping is a must-have core system.
- Newspaper presentation is recurring UI identity for storm select, UNLEASH STORM, and results.
- Weather Map direction is a stylized nostalgic U.S. destination selector.
- Storm Sites are authored substantial destruction fantasies with signature moments, not generic procedural arenas.
- Phone is a platform, not the intended size of the game. Preserve controller-friendly architecture where practical.
- Become C++-ready, not C++-dependent. No rewrite.

## Immediate Director actions

1. Verify branch movement/worker return on #64, #65, and #66 rather than assuming external worker liveness from launch comments.
2. Reconcile/persist WORLD #61's completed return and judge the tornado visually when evidence becomes available.
3. Reconcile GAME #62 final executed evidence before integration.
4. Review each next-wave exact returned head and evidence, then immediately assign the freed lane its next conflict-safe task rather than leaving it idle.
5. Keep #67 and #68 queued until their declared seams are safe.
6. Do not production-merge rejected QA #29.
7. Do not start Integration until the first-batch candidate set is acceptable and merge order is explicit.

## Chat rollover rule

When context becomes heavy or uncertain, refresh this file and start a new project chat. The next Director should recover from GitHub, not from owner memory.
