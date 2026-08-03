# Build Ledger

This ledger records meaningful build and QA outcomes. CI success and physical acceptance are separate states.

## v5.0.0 Heartland Campaign Foundation

### Initial campaign integration

- Branch: `agent/v500-heartland-campaign`
- Main/QA infrastructure merge: `2cc16f6`
- Campaign implementation commit: `d6365d5`
- Scope: four-stop Heartland weather map, ordered unlocks, stars, persistent campaign progress, per-stop presentation and scoring rules, next-stop results flow, V5 workflow identity
- Deterministic patch chain: passed locally from base source through v5.0.0
- V5 structural verifier: `25/25` passed
- Browser QA: pending
- Android physical result: pending
- Classification: committed, not yet browser-QA passed, not physically accepted, not merged

### V5 Pages run #48

- Exact commit: `5fa7b1babf3603c1d6a28feae9e18467e6125041`
- Workflow run: `30827107115`
- Result: success
- V5 package verification: passed
- QA4 deterministic browser verification: passed
- GitHub Pages deployment: passed
- Physical Galaxy S26 Ultra browser result: pending
- Classification: built and automated browser-QA passed; not physically accepted; not merged

### V5 automated full-round run #3

- Exact commit: `5fa7b1babf3603c1d6a28feae9e18467e6125041`
- Workflow run: `30827107150`
- Result: failed before gameplay
- Failed step: `Install Playwright browser harness`
- Historical finding: runs #1 and #2 failed in the same workflow, so this is inherited QA infrastructure rather than a V5 gameplay regression
- Correction: pin Playwright in project development dependencies and use `pnpm exec` instead of injecting it with npm after a pnpm install
- Verification: rerun pending

### V5 Pages run #49 and automated full-round run #4

- Exact commit: `8b193b594b6cb0f7087823340fc68dd40d08be39`
- Pages workflow run: `30827683623`
- Pages result: success
- Full-round workflow run: `30827683132`
- Workflow execution result: success
- Report result: failed `roundCompleted` and `reachedDistrictThree`
- Runtime evidence: 205 wall-clock seconds, approximately 47 game-clock seconds elapsed, final district 1, about `3 FPS`
- Root cause: the warning countdown consumed the same `0.1 s`-capped delta used to protect simulation stability
- Gate defect: the report process returned success when named checks failed unless the browser harness itself threw
- Durable failed-run evidence: `Docs/QA_AUTOPLAY_REPORT.md`, `Docs/QA_AUTOPLAY_REPORT.json`, and `Docs/QA_AUTOPLAY_SCREENSHOT.png`
- Correction: monotonic real-time warning clock plus strict failed-check exit status
- Classification: infrastructure ran successfully, gameplay acceptance failed, correction pending rerun

### V5 Pages run #50 and strict automated full-round run #5

- Exact commit: `c445324951311efdd0bc1da80f28b53c47d49e81`
- Pages workflow run: `30828700285` / run #50
- Pages result: success and deployed
- V5 structural verifier: `30/30` passed
- Full-round workflow run: `30828701004` / run #5
- Full-round result: success with strict failed-check exit status active
- Runtime: 185 seconds
- Required checks: `11/11` passed
- Final district: 3
- Final time: 0
- Final destruction score: `24170`
- Maximum combo: `3.5x`
- Page errors: 0
- Console errors: 0
- Harness exception: none
- Durable evidence: `Docs/QA_AUTOPLAY_REPORT.md`, `Docs/QA_AUTOPLAY_REPORT.json`, and `Docs/QA_AUTOPLAY_SCREENSHOT.png`
- Classification: built, deployed, and automated-browser-QA passed; four-stop campaign play and physical Android acceptance pending

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

### Pages run #3

- QA branch commit: `62a2dc861539be917ea3305fb7e5a651655a15d5`
- Build job: passed
- Deploy job: passed after allowing branch `qa` in the Pages environment
- Artifact: produced
- URL: `https://lybyerc-lab.github.io/Severe-Warning/`
- Physical browser result: opened successfully on Galaxy S26 Ultra

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
- Proven:
  - total score continued beyond former `3999` and `7999` ceilings
  - all three districts completed in one round
  - final results matched accumulated score
  - QA Visual and QA Audio controls were present and reachable

### QA4 deterministic physical run on QA #42

- Visible build stamp: `QA Stage 4 · QA #42 · 699da8e`
- Delivery channel: GitHub Pages opened in Chrome on Galaxy S26 Ultra
- Duration: `30005 ms`
- Score: `8055`
- District transitions: `1 > 2 > 3`
- All checks passed except popup
- Popup detail: `layerFound=true rampagePopups=0->0 connected=false text=""`
- Important result: hidden pause overlay defect was resolved and the deterministic test completed end to end
- Status: Browser-QA not passed because one assertion remained

### QA4 popup batching correction candidate

- Exact commit: `74ac33a4117d163c28ed5785c910095023bf9d81`
- Change: exercise the real `90 ms` popup batching queue synchronously before inspecting `.rampage-popup` output
- Workflow run: `30769528427`
- Patch syntax: passed
- Full patch chain: passed
- Web build: passed
- QA identity: stamped as build `#43`
- Package verification: failed
- Deploy: skipped
- Root cause: stale workflow gate required `QA4_POPUP_ASSERTION_V3` while the corrected artifact contained `QA4_POPUP_ASSERTION_V4`
- Classification: process/gate failure, not gameplay failure

### QA4 workflow stabilization candidate

- Named package verifier: `c9a2ef31e8c41a0945e2a300ce625d4da73cac77`
- Headless browser runner: `c50fe8006c5fb6fc5295f8a4372590cdd7630091`
- Workflow integration: `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`
- Purpose:
  - replace anonymous shell marker failures with named verification output
  - run the full 30-second QA4 test automatically in headless Chrome
  - capture JSON report and screenshot
  - prevent Pages deployment unless QA4 passes

### QA Stage 4 pass on QA #46

- Visible build stamp: `QA Stage 4 · QA #46 · 803f6fa`
- Exact commit: `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`
- Delivery channel: GitHub Pages in Chrome on Galaxy S26 Ultra
- Evidence date: 2026-08-02 17:24 America/Chicago
- Deterministic report version: `QA4_DETERMINISTIC_V1`
- Result: `passed=true`
- Duration: `30001 ms`
- Score: `8011`
- Final stage: `3`
- District transitions: `1 > 2 > 3`
- Event count: `31`
- Audio voice count observed during run: `7`
- Blocked pause attempts: `0`
- Console errors: `0`
- Failed checks: none
- Popup evidence: `layerFound=true queuedHits=1 rampagePopups=0->1 connected=true text="DEMOLISHED!+3211.6x"`
- Audio cleanup evidence: `voices=0 context=running`
- Durable evidence file: `Docs/Evidence/QA4_STAGE4_PASS_QA46_803f6fa.json`
- Evidence commit: `5753e6ee68267858de09e6f1c43d5ae6521e245e`
- Classification:
  - Built: yes
  - Browser-QA passed: yes
  - Mobile Chrome physical browser test: passed
  - Android APK physically accepted: no
  - Merged: no
- Build-train consequence: Stage 4 complete; Stage 5 Android QA Packaging is now active

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
