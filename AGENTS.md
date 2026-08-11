# CURRENT DIRECTOR REDIRECT

**Fresh ChatGPT/Director sessions: do not use this `main`-branch file as current Severe Weather Warning execution authority.**

`main` is the GitHub default branch and contains useful historical repository-memory snapshots, but active Stage 2B Director authority currently lives on:

`agent/director-stage2b-game-direction`

Before interpreting project status:

1. Use the GitHub connector.
2. Read GitHub Issue **#71 — DIRECTOR START HERE: current authority and fresh-chat recovery protocol**.
3. Follow Issue #71 to the current Director branch.
4. Read `Docs/ACTIVE_HANDOFF.md` from that Director branch first for current execution truth.
5. Reconcile all prose against exact issue/branch/commit/CI evidence.

Do not switch project authority back to `main` merely because GitHub opens it by default.

---

# HISTORICAL MAIN-BRANCH STARTUP CONTRACT

The content below is retained as historical repository memory. It does **not** override Issue #71 or the current Director branch.

# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Required reading before changing code

Read these files in order:

1. `Docs/ACTIVE_HANDOFF.md`
2. `Docs/BUILD_TRAIN.md`
3. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
4. `Docs/ACCEPTED_BEHAVIOR.md`
5. `Docs/QA_BACKLOG.md`
6. `Docs/BUILD_LEDGER.md`
7. `Docs/DECISIONS.md`
8. `Docs/SYSTEM_MAP.md`
9. `Docs/CODE_ANCHORS.md`

Then inspect the active branch, draft pull request, and latest successful QA build before proposing changes.

## Operating laws

- Never describe code, CI, or packaging success as physical acceptance.
- The Galaxy S26 Ultra physical test is the final authority for Android behavior.
- Preserve accepted behavior unless the user explicitly approves changing it.
- Follow the current stage in `Docs/BUILD_TRAIN.md`; do not skip ahead, widen scope, or request an APK early without explicit user approval.
- Record every meaningful QA result in `Docs/BUILD_LEDGER.md`.
- Record active defects and acceptance criteria in `Docs/QA_BACKLOG.md`.
- Update `Docs/ACTIVE_HANDOFF.md` whenever the active branch, build, milestone, build-train stage, or next action changes.
- Record durable product or architecture decisions in `Docs/DECISIONS.md`.
- Use stable searchable code anchors defined in `Docs/CODE_ANCHORS.md`.
- Do not merge an unaccepted gameplay milestone.

## Status vocabulary

Use these terms precisely:

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI completed and produced the expected artifact.
- **Browser-QA passed**: tested successfully through the GitHub Pages QA lane.
- **Physically accepted**: tested and approved on the target Android device.
- **Merged**: accepted branch integrated into `main`.
