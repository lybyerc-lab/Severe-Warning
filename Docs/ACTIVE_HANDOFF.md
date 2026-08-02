# Active Handoff

Last updated: 2026-08-02 17:22 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current milestone: `v4.5.0 Storm Feel Overhaul`
Current build-train gate: Stage 4 automated deterministic browser QA

## Start here

The repository is the authoritative project memory. Do not restart diagnosis from chat history.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read every file listed by `AGENTS.md`.
3. Inspect branch `qa`.
4. Inspect draft PR `#10`.
5. Inspect the latest QA Pages workflow before changing code.
6. Continue from the exact state below.

## Active branches and pull request

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Accepted baseline on `main`: v4.4.2

## Current exact state

Latest QA stabilization commits on branch `qa`:

- Batched popup assertion fix: `74ac33a4117d163c28ed5785c910095023bf9d81`
- Named package verifier: `c9a2ef31e8c41a0945e2a300ce625d4da73cac77`
- Headless QA4 browser runner: `c50fe8006c5fb6fc5295f8a4372590cdd7630091`
- Workflow stabilization and automated QA gate: `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`

Status of `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`:

- Committed: yes
- Building: not directly verified
- Built: not verified
- Browser-QA passed: no evidence yet
- Physically accepted: no
- Merged: no

Do not describe it more positively without workflow and artifact evidence.

## What is actually proven

### Normal full browser round

Galaxy S26 Ultra Chrome evidence from QA build `5ad8277`:

- Complete Tornado run reached results.
- Final score: `125462`.
- Grade: `S+`.
- Objectives: `3/3`.
- All three districts completed.
- Score continued beyond the former `3999` and `7999` ceilings.
- QA Visual and QA Audio controls were present.

This proves the normal browser gameplay loop and score continuity. It does not prove Stage 4 deterministic QA.

### QA4 deterministic test

The deterministic test now runs end to end on the Galaxy S26 Ultra.

Latest physically observed report from visible badge `QA Stage 4 · QA #42 · 699da8e`:

- Duration: `30005 ms`.
- Score: `8055`.
- District transitions: `1 > 2 > 3`.
- Passed checks:
  - input isolation
  - Pull
  - Gust
  - tree response
  - Grid Zap
  - collapse
  - score beyond `3999`
  - district progression
  - score beyond `7999`
  - results
  - audio cleanup
  - console errors
  - duration
  - monotonic progression
- Only failed check: `popup`.
- Popup detail: `layerFound=true rampagePopups=0->0 connected=false text=""`.

This is major progress. The pause-overlay defect is resolved and the full deterministic sequence executes.

## Resolved QA4 defects

### Hidden pause overlay intercepted QA taps

Forensic evidence showed the test handler never entered and the tap landed on `button.pause-btn` under the Visual Lab.

Resolved through:

- inactive overlay hit-test isolation
- `visibility: hidden`
- `inert`
- HTML `hidden`
- hard `display: none !important`
- centralized pause overlay state ownership

The later QA4 reports prove input isolation now passes and the test runs.

### Popup layer lookup

The v4.5.0 feedback layer was added after the static element cache was formed. A direct DOM fallback was added through `getRampageFeedbackLayer()`.

The latest physical report proves `layerFound=true`.

### Popup assertion ownership

The old test incorrectly inspected a 3D sprite array. v4.5.0 uses DOM `.rampage-popup` nodes.

The test now checks the real DOM feedback system.

### Popup batching timing

The QA corrections intentionally queue popup hits for `90 ms` before rendering. The test was checking immediately.

Commit `74ac33a4117d163c28ed5785c910095023bf9d81` now:

1. clears prior feedback
2. calls the real `spawnScorePopup()`
3. verifies one queued hit
4. cancels the pending timer
5. calls the real `flushRampageHudPopups()`
6. verifies the connected `.rampage-popup` and expected text

## Latest failed workflow

GitHub Actions run: `30769528427`

Exact commit: `74ac33a4117d163c28ed5785c910095023bf9d81`

Result:

- patch syntax passed
- all deterministic patches applied
- web bundle built
- QA build `#43` stamped
- package verification failed
- Pages deployment skipped

Root cause:

- the workflow still required `QA4_POPUP_ASSERTION_V3`
- the corrected build generated `QA4_POPUP_ASSERTION_V4`
- this was a stale verification gate, not a gameplay or build failure

## Process correction now committed

The previous workflow duplicated truth across dozens of anonymous shell `grep` lines. That caused correct builds to fail on stale markers.

The stabilization candidate `803f6fa8e80686afb97a9bb0cbee5cf6e085130d` changes the process:

- `scripts/verify-qa-package.mjs` performs named package checks and reports exact failures.
- `scripts/run-qa4-headless.mjs` serves `www`, launches headless Chrome, runs `?qa4=run`, waits for `window.__SEVERE_WEATHER_QA4_REPORT__`, saves the report and screenshot, and fails CI when `passed !== true`.
- the Pages workflow deploys only after automated QA4 passes.
- failure artifacts include the QA report, screenshot, Chrome log, and server log.

## Immediate next action

Do not ask the user to run another phone test yet.

1. Inspect the workflow generated by commit `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`.
2. If it failed, open the exact failing job log and the uploaded QA4 artifacts.
3. Fix only the observed automated failure.
4. Repeat automated CI until the report says `passed: true`.
5. Deploy the passing Pages artifact.
6. Ask for one final Galaxy S26 Ultra acceptance run.
7. Record the result in `Docs/BUILD_LEDGER.md` and `Docs/QA_BACKLOG.md`.
8. Advance to Stage 5 only after Stage 4 passes.

## Expected remaining passes

Best estimate:

1. One automated stabilization pass in GitHub Actions.
2. One final Galaxy S26 Ultra acceptance pass.

A third pass is justified only if automation or the physical device reveals a genuine new defect. Do not create another patch loop for stale verification markers.

## Build-train rule

- Stage 4 must pass automated browser QA before another Android APK is requested.
- Stage 5 signing and update-in-place work remains locked.
- A cloud build is not physical acceptance.
- A browser pass is not Android acceptance.

## Latest Android APK

- Build: `#46`
- Exact head: `ead2beb7eb0b4358894909d558690ef718dca488`
- SHA-256: `c5523eb86e5fbd45089ff194587475b92be00b4c2de77722a0d74706f42c5ed4`
- Status: physically tested, not accepted

## Protected behavior

Do not regress:

- v4.4.0 fullscreen and illustrated presentation
- v4.4.1 Gust tree response
- v4.4.2 Pull response
- v4.5.0 wind ambience from APK #42
- realistic recorded-effect direction from APK #46
- continuous scoring across district boundaries
- forward-only district progression
- working QA4 input isolation

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10, branch `qa`, and `Docs/ACTIVE_HANDOFF.md`. Continue from workflow stabilization commit `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`. Do not restart QA4 diagnosis from scratch and do not request another phone test until the automated QA4 workflow passes.
