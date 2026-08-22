# Branch archive manifest

Generated 2026-08-22T13:22:49Z from `origin`.

## Why this file exists

This repository carries 127 remote branches across **two unrelated histories**
(`main` and `qa` share no common ancestor). Before any of them are deleted,
their tips need to be recorded somewhere durable.

The `archive/<branch>` tags **now exist on the remote** - 126 of them, one per
branch, created by the **Archive branch tags** workflow. `qa` is deliberately not
archived; it is the live trunk.

Deleting a branch is therefore non-destructive: its tip stays reachable through
its tag. Verify any time with:

```
git ls-remote --tags origin | grep -c 'refs/tags/archive/'   # expect 126
```

Getting them created took a detour worth recording. Agent sessions cannot write
refs: they reach GitHub through a proxy that refuses outright ("Write access to
this GitHub API path is not permitted through this proxy"), their git credential
is scoped to the `qa` branch so `git push --tags` returns 403, there is no `gh`
CLI, and the GitHub MCP tool set exposes `get_tag` but no tag-creation call. A
workflow has the repository's own token and is not proxied - but GitHub only
registers `workflow_dispatch` workflows from the DEFAULT branch, which is `main`,
which sessions cannot push to and which the settings UI currently refuses to
change ("Could not change default branch"). `on: push` carries no such
requirement, so the workflow is driven by `.github/archive-tags.trigger`
instead: `apply` creates tags, anything else is a dry run.

## Trunks

| branch | tip | date | version | note |
|---|---|---|---|---|
| `qa` | 4da5f97 | 2026-08-22 | 5.1.0 | live trunk |
| `main` | f0e80da | 2026-08-14 | 4.4.2 | superseded, unrelated history |

## Archived branches (126)

| branch | tip | date | subject |
|---|---|---|---|
| `agent/android-black-screen-hotfix` | 23e638f | 2026-07-23 | Fix Android startup black screen |
| `agent/build4-1-motion-silhouette` | 96c9f78 | 2026-07-23 | Fix storm translation and refine visual silhouette |
| `agent/build4-2-camera-containment` | fd54c7c | 2026-07-24 | Contain fast storms and reframe supercell |
| `agent/build4-feel-render-recovery` | 91ee1a2 | 2026-07-23 | Recover movement feel and rendering baseline |
| `agent/build5-1-impact-readability` | 7695875 | 2026-07-24 | Fix directional impact readability and effect limits |
| `agent/build5-2-ability-feedback-cleanup` | 80f2f14 | 2026-07-24 | Refresh Build 5.2 project checksums |
| `agent/build5-impact-destruction` | d0b7f15 | 2026-07-24 | Add staged impact and precipitation feedback |
| `agent/city-fabric-destruction-pass` | 1f0df3b | 2026-08-05 | test: handle already-active city screenshot state |
| `agent/context-checkpoint-2026-07-30` | 98a576d | 2026-07-30 | Point current status to context checkpoint |
| `agent/director-multi-agent-ops` | 19591f8 | 2026-08-10 | Resolve utility and Grid Zap worker ownership |
| `agent/director-stage2b-game-direction` | 787750a | 2026-08-14 | docs(director): sync current status to deployed canonical |
| `agent/github-connector-playbook` | dbc9b87 | 2026-07-24 | Refresh checksums for connector playbook |
| `agent/godot-migration-foundation` | ea96f31 | 2026-07-30 | Implement Godot Tornado Tactical foundation |
| `agent/godot-migration-foundation-v1` | 3efc83a | 2026-07-30 | Harden Godot runtime setup |
| `agent/mobile-controls-build3` | 32ec421 | 2026-07-23 | Fix mobile controls and persist project memory |
| `agent/modernization-phase-1-shell` | 710ee85 | 2026-08-03 | Freeze modernization dependencies |
| `agent/modernization-phase-2-clocks` | 381014d | 2026-08-04 | Test player and forensic pause modes |
| `agent/modernization-phase-3-input-abilities` | b9d5518 | 2026-08-04 | Synchronize joystick authority and legacy mirrors |
| `agent/phase3-knowledge-antigravity-handoff` | 6398863 | 2026-08-04 | Add Antigravity Phase 4 handoff |
| `agent/phase4-knowledge-antigravity-handoff` | 182f916 | 2026-08-05 | docs: record final Phase 5 repository truth in AGENT_BRIDGE.md |
| `agent/phase4-scoring-campaign-antigravity` | 3812591 | 2026-08-04 | Synchronize clocks after deterministic scenario setup |
| `agent/phase6-android-performance-antigravity` | b0fff3c | 2026-08-05 | ci: passively observe frames without blocking the game loop |
| `agent/playcanvas-camera-spin-guard` | 8d070e2 | 2026-08-07 | Require PlayCanvas storm physics evidence |
| `agent/playcanvas-destruction-mass-visual-pass` | 8d390f0 | 2026-08-08 | Keep detached structure debris in the spectacle band |
| `agent/playcanvas-destruction-polish-handoff` | 5bff15c | 2026-08-08 | Update active handoff to staged destruction Run 76 |
| `agent/playcanvas-destruction-weight-art` | bbad1a4 | 2026-08-08 | Verify bounded structure debris flight |
| `agent/playcanvas-destruction-weight-art-handoff` | b7c9bad | 2026-08-08 | Route destruction weight and art lane through PlayCanvas CI |
| `agent/playcanvas-moo-brew-intro` | fdb5679 | 2026-08-08 | Fix deterministic intro QA transition settling |
| `agent/playcanvas-moo-brew-intro-handoff` | 91ff8e2 | 2026-08-08 | Refresh PlayCanvas handoff and stage Moo Brew intro |
| `agent/playcanvas-moo-brew-slice-antigravity` | f08744f | 2026-08-06 | docs: update ACTIVE_HANDOFF.md with verified PlayCanvas slice bootstrap  |
| `agent/playcanvas-multi-structure-destruction` | d2ca9fc | 2026-08-07 | Align PlayCanvas authority with central Living County |
| `agent/playcanvas-multi-structure-handoff` | 28ed613 | 2026-08-07 | Record multi-structure Run 72 and Pages Run 74 |
| `agent/playcanvas-playable-moo-brew-slice` | 7e92f78 | 2026-08-07 | Remove accidental map handoff placeholder |
| `agent/playcanvas-prairie-expansion-antigravity` | c4e1c27 | 2026-08-07 | Verify frame-bounded chase camera QA |
| `agent/playcanvas-prairie-expansion-handoff` | 3844cd8 | 2026-08-07 | Record Prairie expansion browser proof |
| `agent/playcanvas-production-slice-handoff` | 6cb275f | 2026-08-06 | Advance active handoff to playable PlayCanvas QA preview |
| `agent/playcanvas-storm-physics-handoff` | 5aeb4e0 | 2026-08-07 | Record PlayCanvas rotation stability browser proof |
| `agent/playcanvas-storm-physics-parity` | b2e0d12 | 2026-08-07 | Merge rotation stability memory into physics branch |
| `agent/presentation-identity-fix-staging` | 71be18f | 2026-08-05 | test: verify actual presentation artifact packaging |
| `agent/presentation-identity-moo-brew-pass` | 1f4292c | 2026-08-06 | fix: make deterministic intro visibility exact |
| `agent/project-context-modernization` | 335a656 | 2026-08-03 | Record current production and modernization decisions |
| `agent/repair-antigravity-current` | 13215c7 | 2026-07-29 | Restore Build 5.2 HUD cleanup telemetry |
| `agent/sw-art-001-google-ai-art-pipeline` | 6fd4223 | 2026-08-15 | Preserve Google art brief authority metadata |
| `agent/sw-art-002-google-live-reference` | 67fcd17 | 2026-08-15 | Request Tornado visual development reference |
| `agent/sw-art-003-meshy-3d-pipeline` | 407d892 | 2026-08-15 | Flatten archived Cow 17 source download |
| `agent/sw-art-004-meshy-multi-image-cow17` | 3d4afa1 | 2026-08-15 | Launch one guarded Cow 17 multi-image generation |
| `agent/sw-art-005-cow17-face-refine` | 44ed9bd | 2026-08-15 | Request one Gemini Cow 17 face refinement |
| `agent/sw-art-006-cow17-refined-face-meshy` | 4329f5c | 2026-08-15 | Launch one refined-face Meshy 6 candidate |
| `agent/sw-art-007-cow17-texture` | bdccb87 | 2026-08-15 | abort |
| `agent/sw-art-008-cow17-rig-motion` | 36ea0fc | 2026-08-15 | Launch one Cow 17 rig and movement task |
| `agent/sw-art-008-cow17-rigging` | 29d6d61 | 2026-08-15 | Launch one Cow 17 rigging task |
| `agent/sw-art-009-cow17-runtime-integration` | 54e0784 | 2026-08-17 | ci(art-009): relaunch Cow proof after setup timeout |
| `agent/sw-audit-post-quality-002-gap-map` | ea29469 | 2026-08-14 | audit(quality-002): publish SW-AUDIT-POST-QUALITY-002 gap audit report a |
| `agent/sw-cin-001-moo-brew-foundation` | b795396 | 2026-08-10 | Add Moo Brew cinematic foundation |
| `agent/sw-cin-002-acting-polish` | 7ec8e9e | 2026-08-10 | Polish Cow 17 cinematic acting readability |
| `agent/sw-cin-003-playable-opening` | 9da153b | 2026-08-10 | Complete playable Moo Brew opening integration |
| `agent/sw-cin-004-duplicate-opening-cleanup` | 101036a | 2026-08-17 | ci(cin): allow deterministic asset preparation |
| `agent/sw-feel-001-destruction-consequence` | a1d98d2 | 2026-08-14 | test(feel-001): prove lethal uniform-cube swarm is absent |
| `agent/sw-game-001-cowcam-gridzap-polish` | 85f1ad6 | 2026-08-10 | fix: propagate Grid Zap along utility routes |
| `agent/sw-game-002-moo-level-unlock` | 89aeac9 | 2026-08-11 | test: prove Moo encounter failure rearm |
| `agent/sw-int-001-stage2a-integration` | 9ffc7da | 2026-08-10 | ci: route automatic QA promotion through allowed publisher |
| `agent/sw-int-002-visible-difference-integration` | b501737 | 2026-08-10 | fix: initialize WORLD storm before opening |
| `agent/sw-int-003-append-slingshot` | e0591f6 | 2026-08-13 | integrate(rpg-002): append accepted Slingshot delta onto validated PWA b |
| `agent/sw-int-003-level001-stack` | 4e5b4c7 | 2026-08-13 | integrate(level-001): append accepted Storm Site framework |
| `agent/sw-int-003-pwa-identity-404-fix` | 00e5796 | 2026-08-13 | fix(pwa): make qa-build.json identity lookup opt-in via severe-weather-q |
| `agent/sw-int-003-stage2b-accepted-stack` | de2e628 | 2026-08-14 | qa(int-005): read FEEL mount marker from version |
| `agent/sw-int-003-world006-stack` | 5f9a75d | 2026-08-13 | integrate(world-006): append accepted WORLD visual stack |
| `agent/sw-int-004-commercial-shell` | 706408e | 2026-08-14 | ci(int-004): prove accepted commercial shell together |
| `agent/sw-int-005-weather-feel-polish` | de2e628 | 2026-08-14 | qa(int-005): read FEEL mount marker from version |
| `agent/sw-int-005-world-resolution` | 1791bd0 | 2026-08-14 | chore(int-005): resolve canonical and WORLD package scripts |
| `agent/sw-level-001-storm-site-framework` | 07e089f | 2026-08-11 | feat: add Storm Site framework proof package |
| `agent/sw-ops-001-antigravity-bridge` | 10ccd27 | 2026-08-15 | chore(ops): tighten Antigravity smoke budget |
| `agent/sw-ops-002-antigravity-sandbox-worker` | 4c633f7 | 2026-08-16 | test(ops): require continuation envelope checks |
| `agent/sw-polish-001-quality-rescue` | f31b17c | 2026-08-14 | test(polish): make hostile review judge actual player scenes |
| `agent/sw-pwa-001-installable-shell` | 7cda055 | 2026-08-11 | feat(pwa): add installable web shell |
| `agent/sw-qa-001-throughput` | f9b56fe | 2026-08-10 | ci: bind Pages publisher API token |
| `agent/sw-qa-002-rapid-prototype-lane` | 73b28e0 | 2026-08-11 | ci: assert prototype manifest authority |
| `agent/sw-qa-003-game-002-evidence-closure` | 89aeac9 | 2026-08-11 | test: prove Moo encounter failure rearm |
| `agent/sw-qa-004-ui-001-visual-acceptance` | 43348db | 2026-08-11 | feat: add newspaper presentation system |
| `agent/sw-qa-004-world-003-visual-acceptance` | f9430bc | 2026-08-11 | Recover connected storm hero presentation |
| `agent/sw-qa-005-level-001-defect-repro` | 07e089f | 2026-08-11 | feat: add Storm Site framework proof package |
| `agent/sw-qa-006-world-004-visual-acceptance` | 347159f | 2026-08-11 | fix: recover ragged tornado hero mass |
| `agent/sw-qa-007-actions-harness` | 84934ea | 2026-08-13 | fix(qa): add apply-sw-game-002-moo-level prerequisite to patch chain |
| `agent/sw-qa-007-level-001-acceptance` | 1350cee | 2026-08-11 | fix: restore Storm Site acceptance paths |
| `agent/sw-qa-009-hostile-playtest` | a2bebaa | 2026-08-14 | ci(review): run hostile Stage 2B visual playtest |
| `agent/sw-qa-quality-002-visual-acceptance` | ec723a1 | 2026-08-14 | docs(qa): record QUALITY-002 visual acceptance evidence and evaluation r |
| `agent/sw-quality-001-owner-playtest-rescue` | 7d3e7e7 | 2026-08-14 | ci(quality-rescue): serve local runtime for inherited storm site QA |
| `agent/sw-rpg-001-moolah-storm-triangle` | ce1e47c | 2026-08-11 | feat: add MOO-LAH storm triangle foundation |
| `agent/sw-rpg-002-slingshot-synergy` | 97aa6ae | 2026-08-11 | feat(game): add Pull Gust slingshot synergy |
| `agent/sw-score-001-persistent-scorekeeper` | 3d1661c | 2026-08-11 | feat: add persistent local scorekeeper |
| `agent/sw-ui-001-newspaper-presentation` | 43348db | 2026-08-11 | feat: add newspaper presentation system |
| `agent/sw-ui-002-landscape-unleash` | 271e5d3 | 2026-08-13 | ci(ui): run landscape proof before inherited regression |
| `agent/sw-ui-005-field-controls` | c600788 | 2026-08-14 | fix(ui-005): keep full desktop bindings visible |
| `agent/sw-ui-006-mobile-orientation-touch` | 5103d6a | 2026-08-15 | Fix UI-006 effective visibility proof |
| `agent/sw-world-001-slice6-finish` | b2be51d | 2026-08-10 | Polish Slice 6 storm and Main Street presentation |
| `agent/sw-world-002-break-blocktown` | fa2aef2 | 2026-08-10 | feat: deepen authored town and storm silhouette |
| `agent/sw-world-003-storm-hero-recovery` | f9430bc | 2026-08-11 | Recover connected storm hero presentation |
| `agent/sw-world-004-storm-hero-acceptance-fix` | 347159f | 2026-08-11 | fix: recover ragged tornado hero mass |
| `agent/sw-world-005-level-001-acceptance-fix` | 1350cee | 2026-08-11 | fix: restore Storm Site acceptance paths |
| `agent/sw-world-006-planar-cone-acceptance-fix` | 1264617 | 2026-08-13 | fix(world-006): break planar cone read with dirty irregular volumetric l |
| `agent/sw-world-007-secondary-storm-forms` | 1ccae11 | 2026-08-14 | test(world-007): verify authoritative current-storm read |
| `agent/sw-world-008-tornado-heritage` | f321e40 | 2026-08-17 | fix(world): strengthen tornado condensation breakup |
| `agent/threejs-asset-pipeline-foundation` | f2060df | 2026-08-08 | Make storefront evidence camera authoritative in QA |
| `agent/threejs-hero-slice4-world-cohesion-storm-volume` | 0c90db6 | 2026-08-08 | Build Hero Slice 4 world cohesion and storm volume |
| `agent/threejs-hero-slice5-rainbow-cow-level` | f42f12b | 2026-08-08 | Remove temporary Slice 5 staging file |
| `agent/threejs-hero-slice6-world-identity-storm-silhouette` | 242cb92 | 2026-08-09 | Record repo memory QA cadence and opening direction |
| `agent/threejs-production-revival` | da42b8b | 2026-08-08 | Refresh handoff with sealed Three.js QA candidate |
| `agent/threejs-production-slice` | c49ba1c | 2026-08-03 | Correct authored barn detachment QA state |
| `agent/threejs-visual-production-foundation` | 9515a3a | 2026-08-08 | Fix town ground visual refresh idempotence |
| `agent/tornado-tactical-implementation` | c457474 | 2026-07-29 | Record Tornado Tactical P1 source status |
| `agent/tornado-tactical-p1-hardening` | ec054aa | 2026-07-29 | Record merged Tornado Tactical P1 status |
| `agent/tornado-tactical-pivot` | c0963a8 | 2026-07-29 | Refresh inventory for tactical pivot |
| `agent/tornado-tactical-v1` | a349660 | 2026-07-29 | Document Tornado Tactical v1 implementation |
| `agent/v450-storm-feel-overhaul` | ead2beb | 2026-08-01 | ci: verify rampage feedback and adaptive music |
| `agent/v500-heartland-campaign` | d366cc9 | 2026-08-03 | Record automated full-round QA playtest |
| `agent/visual-engine-lab-foundation` | f439db0 | 2026-08-03 | test: update evidence screenshots and report for dynamic HEAD |
| `agent/visual-superiority-gate` | 503bd45 | 2026-08-03 | test: add paired visual superiority browser QA evidence and report |
| `archive/sw-int-003-frozen-6fc3d64` | 6fc3d64 | 2026-08-11 | feat(pwa): add installable web shell |
| `ci/qa-pages-full-stage2b-ready` | 23d7c5e | 2026-08-13 | ci(pages): prepare full Stage 2B playtest publisher |
| `ci/sw-int-003-level-game-handoff-closure` | 8a71a7c | 2026-08-13 | ci(int-003): close full Stage 2B packaged GAME handoff |
| `ci/sw-int-003-level001-closure` | a264003 | 2026-08-13 | ci(int-003): add LEVEL-001 full-stack closure |
| `ci/sw-int-003-ubuntu-ab-harness` | 2cd4099 | 2026-08-13 | ci(int-003): drive accepted opening through natural handoff |
| `ci/sw-int-003-world-game-handoff-closure` | d6de5be | 2026-08-13 | ci(int-003): close WORLD packaged GAME through real opening handoff |
| `ci/sw-int-003-world-moo-bootstrap-diag` | b6f7760 | 2026-08-13 | ci(int-003): diagnose packaged Moo bootstrap on WORLD stack |
| `claude/pull-repo-cw2mn8` | 13d2ff5 | 2026-08-20 | ci(android): build the Vite modern shell before packaging |
| `main` | f0e80da | 2026-08-14 | Merge PR #85: refresh QA Pages publisher for accepted canonical |
