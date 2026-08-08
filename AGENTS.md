# Severe Weather Repository Startup Contract

This repository is the durable project memory. Chat history is working context only.

## Authority order when sources disagree

Use the newest exact evidence and owner acceptance result, not the oldest confident prose.

1. Current repository code and exact-commit build/QA evidence
2. `CURRENT_STATUS.md`
3. `Docs/ACTIVE_HANDOFF.md`
4. The active build train for the current production direction
5. `Docs/DECISIONS.md` and dated decision records
6. `Docs/ACCEPTED_BEHAVIOR.md`
7. `Docs/QA_BACKLOG.md`
8. `Docs/BUILD_LEDGER.md`
9. `Docs/SYSTEM_MAP.md`
10. `Docs/CODE_ANCHORS.md`
11. `Docs/RECOVERED_KNOWLEDGE_BASE.md`
12. Older handoffs, engine experiments, migration ledgers, and historical plans

Historical engine experiments remain evidence. They do not override a newer owner comparison or the current production branch.

## Required reading before changing production code

Read these files in order:

1. `CURRENT_STATUS.md`
2. `Docs/ACTIVE_HANDOFF.md`
3. `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`
4. `Docs/PRODUCT_VISION_AND_ROADMAP.md`
5. `Docs/ACCEPTED_BEHAVIOR.md`
6. `Docs/QA_BACKLOG.md`
7. `Docs/BUILD_LEDGER.md`
8. `Docs/DECISIONS.md`
9. `Docs/SYSTEM_MAP.md`
10. `Docs/CODE_ANCHORS.md`
11. `Docs/IMPLEMENTATION_TRUTH_GATE.md`
12. `Docs/RECOVERED_KNOWLEDGE_BASE.md`

Then inspect the active branch, the frozen Three.js reference PR, the current production draft PR, latest exact-source workflow evidence, and the current `qa` deployment before proposing changes.

## Current direction

- Canonical product: **Severe Weather Warning**.
- Three.js is the production renderer again.
- Production revival branch: `agent/threejs-production-revival`.
- Frozen gameplay/fun baseline: PR #26 head `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.
- PlayCanvas is preserved research evidence and is not production ancestry.
- The active train is `Docs/THREEJS_GRAPHICS_PIPELINE_BUILD_TRAIN.md`.
- The Galaxy S26 Ultra remains the final authority for Android behavior and physical acceptance.

## Operating laws

- Never describe code, CI, browser QA, packaging, or assistant review as physical acceptance.
- Preserve the PR #26 gameplay feel unless the owner explicitly approves changing it.
- Do not combine graphics-pipeline work with steering, ability, score, timing, campaign, safe-animal, or gameplay-camera redesign.
- Keep the production Three.js version frozen during the first asset-pipeline milestone.
- Do not use a renderer migration as a substitute for an art pipeline.
- One writer per branch. Create a descendant branch for each bounded milestone rather than mutating sealed evidence branches.
- Exact-source identity is blocking evidence. A newer docs-only head must never be confused with an older tested gameplay source.
- Meaningful visual candidates require objective regression evidence and owner hands-on fun/readability comparison.
- Do not weaken QA to obtain green.
- Helper-only markers never prove executor integration. Follow `Docs/IMPLEMENTATION_TRUTH_GATE.md`.
- Artifact packaging must fail when required evidence is absent.
- Call `assembleDebug` output a debug APK, never a signed release APK.
- Do not merge an unaccepted gameplay milestone.
- Update repository memory with implementation/evidence whenever practical so the next chat does not need archaeology.

## Fun regression gate

A production candidate must not pass merely because numbers stayed stable.

Explicitly check:

- forward storm steering feels direct and does not require backing up to steer;
- ordinary storm contact is satisfying without Pull/Gust/Zap;
- destruction is not dominated by giant roof-heavy chunks;
- the world and cinematic read as the same authored game rather than separate prototype layers;
- the candidate is at least as fun as the frozen Three.js reference.

## Status vocabulary

- **Committed**: source exists in Git.
- **Building**: CI is running.
- **Built**: CI completed and produced the expected artifact.
- **Browser-QA passed**: repository-owned browser verification passed for an exact source.
- **Public QA deployed**: the exact browser artifact was re-verified and published to the QA Pages lane.
- **Owner browser-approved**: the owner tested the browser candidate and approved that bounded browser-stage behavior.
- **Physically accepted**: the exact Android artifact was tested and approved on the target device.
- **Merged**: an approved branch was integrated into its intended base.
