# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Authority order when sources disagree

Use the newest exact evidence, not the oldest confident prose.

1. Current repository code and exact-commit build/QA evidence
2. `CURRENT_STATUS.md`
3. `Docs/ACTIVE_HANDOFF.md`
4. The active build train for the current direction
5. `Docs/DECISIONS.md` and dated decision records
6. `Docs/ACCEPTED_BEHAVIOR.md`
7. `Docs/QA_BACKLOG.md`
8. `Docs/BUILD_LEDGER.md` and current migration ledgers
9. `Docs/SYSTEM_MAP.md`
10. `Docs/CODE_ANCHORS.md`
11. `Docs/RECOVERED_KNOWLEDGE_BASE.md`
12. Older handoffs, engine experiments, and historical plans

Historical documents remain evidence. They do not override newer exact-source truth.

## Required reading before changing code

Read these files in order:

1. `CURRENT_STATUS.md`
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`
4. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
5. `Docs/ACCEPTED_BEHAVIOR.md`
6. `Docs/QA_BACKLOG.md`
7. `Docs/BUILD_LEDGER.md`
8. `Docs/DECISIONS.md`
9. `Docs/SYSTEM_MAP.md`
10. `Docs/CODE_ANCHORS.md`
11. `Docs/IMPLEMENTATION_TRUTH_GATE.md`
12. `Docs/RECOVERED_KNOWLEDGE_BASE.md`

Then inspect the active branch, draft pull request, latest exact-source workflow evidence, and current `qa` deployment before proposing changes.

## Current direction

- Canonical product: **Severe Weather Warning**.
- PlayCanvas is the selected production-renderer direction.
- The accepted legacy runtime remains gameplay authority during the guarded migration.
- PlayCanvas may own visible presentation, camera, authored world geometry, and presentation-only detached debris only where the current migration contract explicitly allows it.
- The current migration train is `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`.
- The Galaxy S26 Ultra remains the final authority for Android behavior and physical acceptance.

## Operating laws

- Never describe code, CI, browser QA, packaging, or assistant review as physical acceptance.
- Preserve accepted behavior unless the user explicitly approves changing it.
- Follow the current stage in `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`; do not widen scope into a whole-county port or renderer rewrite.
- The accepted legacy executor continues to own movement, Pull/Gust/Zap, health, destruction state, scoring, combo, warning clock, campaign state, and safe-animal behavior until a later migration stage explicitly transfers authority.
- One writer per branch. Create a descendant branch for the next bounded milestone instead of mutating a sealed evidence branch.
- Exact-source identity is blocking evidence. A newer docs-only head must never be confused with an older tested gameplay source.
- Meaningful visual/physics candidates require assistant browser/artifact review before owner subjective review when practical. That diagnostic layer does not replace owner hands-on testing.
- Do not weaken QA to obtain green.
- Helper-only markers never prove executor integration. Follow `Docs/IMPLEMENTATION_TRUTH_GATE.md`.
- Artifact packaging must fail when required evidence is absent.
- Call `assembleDebug` output a debug APK, never a signed release APK.
- Do not merge an unaccepted gameplay milestone.
- Update repository memory with the implementation/evidence whenever practical so the next chat does not need archaeology.

## Status vocabulary

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI completed and produced the expected artifact.
- **Browser-QA passed**: repository-owned browser verification passed for an exact source.
- **Public QA deployed**: the exact browser artifact was re-verified and published to the QA Pages lane.
- **Owner browser-approved**: the owner tested the browser candidate and approved that bounded browser-stage behavior.
- **Physically accepted**: the exact Android artifact was tested and approved on the target device.
- **Merged**: an approved branch was integrated into its intended base.
