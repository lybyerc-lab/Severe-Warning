# Severe Weather Warning Documentation Authority Map

Last updated: 2026-08-14 16:39 America/Chicago

Purpose: prevent old but valuable repository documents from being mistaken for current execution or product authority.

## Authority rule

For current execution state, use this order:

1. exact current task issue + exact branch/commit/CI/evidence;
2. `Docs/ACTIVE_HANDOFF.md`;
3. `AGENTS.md`, `Docs/GAME_DIRECTOR.md`, `Docs/WORKER_STARTUP_ORDER.md`, and `Docs/IMPLEMENTATION_TRUTH_GATE.md`;
4. `Docs/ACTIVE_PRODUCTION_SLATE.md`;
5. current bounded companion direction such as `Docs/LEVEL_AND_RPG_EXPANSION.md`;
6. historical/status/build-train material only as evidence of what happened before.

Newer exact evidence beats older prose.

## CURRENT / SAFE FOR AUTHORITY

### Fresh-session and execution recovery
- Issue #71 — `DIRECTOR START HERE: current authority and fresh-chat recovery protocol`
- `Docs/ACTIVE_HANDOFF.md`
- `CURRENT_STATUS.md` — concise snapshot only; exact evidence and ACTIVE_HANDOFF outrank it
- `Docs/NEW_CHAT_BOOTSTRAP.md`

### Binding operating/product law
- `AGENTS.md`
- `Docs/GAME_DIRECTOR.md`
- `Docs/WORKER_STARTUP_ORDER.md`
- `Docs/IMPLEMENTATION_TRUTH_GATE.md`
- `Docs/NO_DRIFT_POLICY.md` where not superseded by the stronger AGENTS drift contract

### Current planning/product companions
- `Docs/ACTIVE_PRODUCTION_SLATE.md`
- `Docs/LEVEL_AND_RPG_EXPANSION.md`
- `Docs/STAGE2B_REPLAY_EXPANSION_INDEX.md`
- `Docs/STORM_SITE_FANTASY_CATALOG.md`
- `Docs/HUMOR_BIBLE.md`

### Historical acceptance register with current supersession rules
- `Docs/ACCEPTED_BEHAVIOR.md`

## HISTORICAL / DO NOT USE AS CURRENT STATUS

These documents remain useful evidence, design archaeology, or milestone history. They do not define current branches, active workers, canonical SHAs, next actions, or acceptance state unless an exact current task explicitly reactivates them.

### Superseded handoffs / recovered snapshots
- `Docs/SEVERE_WEATHER_MASTER_CONTEXT_HANDOFF.md`
- `Docs/RECOVERED_KNOWLEDGE_BASE.md`
- `Docs/ANTIGRAVITY_PHASE4_HANDOFF.md`
- `Docs/ANTIGRAVITY_PHASE5_HANDOFF.md`
- `Docs/AGENT_BRIDGE.md` — now a redirect/supersession notice
- dated context checkpoints and dated decision handoffs

### Superseded plans / build trains / queues
- `Docs/PRODUCTION_PLAN.md`
- `Docs/MODERNIZATION_PLAN.md`
- `Docs/BUILD_TRAIN.md`
- `Docs/V5_BUILD_TRAIN.md`
- `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`
- `Docs/QA_BACKLOG.md`
- `Docs/REPLAY_EXPANSION_STATUS.md` — now a redirect/supersession notice

### Historical validation / source-map snapshots
- `VALIDATION_REPORT.md`
- `Docs/QA_AUTOPLAY_REPORT.md` and `.json`
- `Docs/QA_V500_WORLD_TOUR_REPORT.md` and `.json`
- `Docs/PHASE5_PRESENTATION_SOURCE_MAP.md`
- `Docs/PHASE5_VISUAL_BASELINE.md`
- `Docs/PHASE6_PERFORMANCE_SOURCE_MAP.md`
- `Docs/PRESENTATION_IDENTITY_SOURCE_MAP.md`
- `Docs/THREEJS_ASSET_PIPELINE_SOURCE_MAP.md`
- `Docs/SYSTEM_MAP.md` until it is explicitly refreshed against the current Stage 2B runtime
- `Docs/CODE_ANCHORS.md` as an older anchor catalog; current task/source inspection wins

### Historical roadmap / engine / milestone material
- `Docs/PRODUCT_VISION_AND_ROADMAP.md` — useful product archaeology; `GAME_DIRECTOR.md` is the current north star
- Hero Slice 4/5/6 documents
- Unity, Godot, PlayCanvas, Babylon, migration, modernization, and old release-acceptance documents
- old version/build-specific tuning and device reports

## ROOT FILES THAT ARE HISTORICAL ARTIFACTS

- `FILE_INVENTORY.txt` — old repository inventory, not a current recursive manifest
- `SHA256SUMS.txt` — old snapshot checksums, not a checksum of the current Stage 2B tree
- `REPOSITORY_BOOTSTRAP.md` — now a redirect away from the obsolete Unity bootstrap

Do not use these files to decide what the current production tree contains.

## LEDGERS AND LOGS

The following may contain old entries by design and should not be “cleaned” merely for age:

- `Docs/BUILD_LEDGER.md`
- `Docs/DECISION_LOG.md`
- `Docs/DEVICE_TEST_LOG.md`
- dated QA incident reports
- committed audit/evidence directories

A historical entry is valid evidence for its exact milestone. It does not automatically describe the present.

## Current canonical checkpoint at this map update

Director authority branch:
`agent/director-stage2b-game-direction`

Canonical integration branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact accepted Stage 2B head:
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

Active bounded wave at this snapshot:
- #81 `SW-WORLD-007`
- #82 `SW-FEEL-001`
- #83 `SW-UI-003`

This final section is a dated snapshot. If the workers or canonical branch move, exact GitHub evidence and `Docs/ACTIVE_HANDOFF.md` outrank it.
