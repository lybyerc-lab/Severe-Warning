# Build Ledger

This ledger records meaningful build and QA outcomes. CI success and physical acceptance are separate states.

## Accepted milestones

### v4.4.0

- Result: physically accepted
- Scope: fullscreen and illustrated storm feedback baseline
- Merge commit: `8fef0e0cc3b3a30fa6b2845b70e72fca367dc657`

### v4.4.1

- Exact tested head: `4c91694b406dfca119f457135276bc145837c169`
- Result: physically accepted
- User finding: tree pull is good
- Merge commit: `578777de9d50f0f44313681746b19b427e2376b1`

### v4.4.2

- Exact tested head: `82c455fff9ddb0e6a37f60b583a87b58f73173a4`
- Android build: `#35`
- APK SHA-256: `40ae278133e9d6d000a9d80a2b0331871b0f5075ee9b34e9138430bd88590f7d`
- Result: physically accepted as a good build
- Merge commit: `3b3727da55c91439f99772f7ef5d1c50cdc957a5`

## v4.5.0 Storm Feel Overhaul

### Android build #39

- Exact head: `77817f1ef4705791d90b24b4419e390934f832e8`
- CI: passed
- APK SHA-256: `7e73a353e68aca9733404821c7f431b65ab28ea07af6c9267ac04491064474e9`
- Physical result: rejected
- Finding: wind was good, but ability and damage sounds resembled 1980s pews and pings

### Android build #41

- Exact head: `ca68eba9a9731b0dea6bb1fe8c505584ec74bd32`
- CI: failed
- Cause: FFmpeg missing from runner
- Artifact: none

### Android build #42

- Exact head: `4bdfa74d5de6a7a26c57202542bea0c1214075b5`
- CI: passed
- APK SHA-256: `2b1b88fc07fef0ade862cc11b2e5c6e5f540fb66ab968b026f47c21ab13a5270`
- Physical result: partial acceptance only
- Protected result: continuous wind ambience sounded great

### Android build #46

- Exact head: `ead2beb7eb0b4358894909d558690ef718dca488`
- CI: passed
- APK SHA-256: `c5523eb86e5fbd45089ff194587475b92be00b4c2de77722a0d74706f42c5ed4`
- Physical result: rejected as complete milestone
- Findings:
  - no audible music
  - excessive glass shattering
  - intermittent unidentified synthetic sound
  - rampage feedback returned

## Browser QA lane

### Pages run #1

- Result: failed
- Cause: initial Pages workflow structure

### Pages run #2

- Commit: `b2cc0f7bd4cafa28c85e61c8f99f946047436392`
- Result: failed before jobs
- Cause: YAML syntax error at line 116

### Pages run #3

- QA branch commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Build job: passed
- Deploy job: initially blocked by `github-pages` environment branch protection
- Rerun after allowing branch `qa`: passed in 17 seconds
- Artifact: produced
- URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- Physical browser result: opened successfully on Galaxy S26 Ultra

### Audio Lab and QA correction candidate

- Correction script commit: `0b54ce1d30e280e9f68376fbb122a7790e6ab5c0`
- Patch-chain commit: `6e1395664c3990f0d2349efd527113eeb09e3153`
- Exact gameplay delivery candidate: `7e600462520223930db1e255638bb9fcf83330c3`
- Delivery channel: GitHub Pages QA branch
- Source verification: correction script passed local Node syntax checking and a representative generated-source fixture before commit
- CI result: awaiting verified Pages result
- Browser QA result: not yet tested
- Physical Android result: not tested; no APK built for this candidate
- Included corrections:
  - Audio Lab and bounded recent-event log
  - music gain and diagnostic visibility
  - strict glass routing and throttling
  - rampage aggregation, callout cap, and candidate thresholds
  - forward-only district progression and monotonic stage-three clock
- Follow-up: verify the exact Pages candidate, then test on Galaxy S26 Ultra browser before requesting another APK

### QA Pages run #20 full-round evidence

- Visible build stamp: `QA Stages 1-3 · QA #20 · 5ad8277`
- Delivery channel: GitHub Pages opened in Chrome on Galaxy S26 Ultra
- Evidence date: 2026-08-02
- Browser result: complete Tornado warning run reached the results screen
- Grade: `S+`
- Final score: `125462`
- Maximum combo: `3.5x`
- Objectives: `3/3`
- Landmarks: `2/2`
- Substations: `3/3`
- Bonus challenges: `2/3`
- Blocks cleared: `25`
- Chain reactions: `4`
- Media moments: `20`
- Footage bonus: `+5228`
- District score snapshots:
  - Pine Ridge: `19767`
  - Main Street: `70821`
  - County Fair finale: `125462`
- Proven by this run:
  - total score continued well beyond the former `3999` and `7999` ceilings
  - all three districts completed in one round
  - final results matched the accumulated total score
  - QA Visual and QA Audio controls were present and reachable
- Not proven by this screenshot alone:
  - Stage 4 deterministic report pass
  - all Audio Lab acceptance checks
  - exact popup-award arithmetic during each boundary crossing
  - physical Android APK acceptance
- Follow-up: run `?qa4=run`, inspect the generated report, and repeat once for consistency

## Entry template

### Build or QA identifier

- Exact commit:
- Delivery channel:
- CI result:
- Artifact checksum:
- Browser QA result:
- Physical Android result:
- Accepted behavior:
- Rejected behavior:
- Follow-up:
