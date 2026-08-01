# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Required reading before changing code

Read these files in order:

1. `Docs/ACTIVE_HANDOFF.md`
2. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
3. `Docs/ACCEPTED_BEHAVIOR.md`
4. `Docs/QA_BACKLOG.md`
5. `Docs/BUILD_LEDGER.md`
6. `Docs/DECISIONS.md`
7. `Docs/SYSTEM_MAP.md`
8. `Docs/CODE_ANCHORS.md`

Then inspect the active branch, draft pull request, and latest successful QA build before proposing changes.

## Operating laws

- Never describe code, CI, or packaging success as physical acceptance.
- The Galaxy S26 Ultra physical test is the final authority for Android behavior.
- Preserve accepted behavior unless the user explicitly approves changing it.
- Record every meaningful QA result in `Docs/BUILD_LEDGER.md`.
- Record active defects and acceptance criteria in `Docs/QA_BACKLOG.md`.
- Update `Docs/ACTIVE_HANDOFF.md` whenever the active branch, build, milestone, or next action changes.
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
