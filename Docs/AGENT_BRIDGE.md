# Severe Weather Warning Cross-Agent Project Bridge

**Last updated:** 2026-08-05T17:55:00-05:00  
**Purpose:** Live coordination bridge between Antigravity and ChatGPT for Severe Weather Warning.

---

## 1. Grounding & Repository State

- **Product Name:** Severe Weather Warning
- **Repository:** `lybyerc-lab/Severe-Warning`
- **Current Working Branch:** `agent/phase6-android-performance-antigravity`
- **Base Branch:** `agent/phase4-knowledge-antigravity-handoff`
- **Starting Base SHA:** `182f916807f3195dfe0546775a1fff7dc8c64aaa`
- **Draft PR:** PR #24 (`https://github.com/lybyerc-lab/Severe-Warning/pull/24`)
- **Accepted Phase 5 Source SHA:** `ef6001c355314580463001ff7c7673eecb469542`
- **Phase 5 Merge Commit SHA:** `7f939f172f5d75b9a25e3616d39f223e5de040f8`
- **Live QA Pages URL:** `https://lybyerc-lab.github.io/Severe-Warning/`
- **Phase 6 Status:** Corrective implementation in progress. Physical Android acceptance has not begun.

---

## 2. Rejected Phase 6 Evidence

Run `31050196379` / run 10 built a debug APK, but it is not accepted as Phase 6 proof because review found:

- duplicate `push` and `pull_request` workflow triggers
- helper-only debris allocation rather than integration with the Hart Farm executor
- an adaptive-quality class that was not driven by the production update loop
- blur handling that wrote ineffective global movement variables instead of resetting the Phase 3 authority
- no accepted-base versus candidate performance comparison
- missing screenshots, inherited QA logs, and changed-module ledger in the artifact
- documentation that incorrectly called an `assembleDebug` APK signed
- unsupported absolute memory-leak claims

The run 10 APK remains a historical debug artifact only. It is not the physical-test candidate.

---

## 3. Corrective Phase 6 Contract

The repair must prove all of the following before a device APK is offered:

- real Hart Farm dust bursts call the bounded Phase 6 pool
- pooled effects release through normal lifetime and retry/rebuild cleanup
- the accepted production update loop submits frame samples to adaptive quality
- adaptive quality changes renderer-only presentation settings with hysteresis
- blur and visibility interruption reset the actual Phase 3 input authority and legacy joystick/key state
- Phase 5 and Phase 6 build and run on the same CI runner for comparison
- median and p95 frame time, long frames, draw calls, triangles, resource counts, screenshots, logs, and integration counters are retained
- only one automatic Phase 6 workflow run is created per PR source change
- artifact packaging fails if required evidence is absent

The durable process rules are in `Docs/IMPLEMENTATION_TRUTH_GATE.md`.

---

## 4. Acceptance Status

- **Automated repair verification:** Pending the next exact-head workflow run.
- **Debug APK:** Pending the next exact-head workflow run.
- **Physical Android acceptance:** Pending. Do not merge PR #24 or begin Phase 7.

---

## 5. Next Intended Action

- Verify the corrective source commit through the single-trigger Phase 6 workflow.
- Inspect the complete artifact and exact-head evidence.
- Only then provide the debug APK for physical Android testing.
