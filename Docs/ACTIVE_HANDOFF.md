# Active Handoff

Last updated: 2026-08-02 17:27 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Current milestone: `v4.5.0 Storm Feel Overhaul`
Current build-train gate: Stage 5 Android QA Packaging

## Start here

The repository is the authoritative project memory. Do not restart diagnosis from chat history.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read every file listed by `AGENTS.md`.
3. Inspect branch `qa`.
4. Inspect draft PR `#10`.
5. Inspect the latest QA Pages and Android workflows before changing code.
6. Continue from the exact state below.

## Active branches and pull request

- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft gameplay PR: `#10`
- Browser QA branch: `qa`
- Accepted baseline on `main`: v4.4.2

## Stage 4 exit evidence

Stage 4 passed on the Galaxy S26 Ultra through GitHub Pages in Chrome.

Visible build badge:

- `QA Stage 4 · QA #46 · 803f6fa`

Exact commit:

- `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`

Deterministic report:

- version: `QA4_DETERMINISTIC_V1`
- passed: `true`
- duration: `30001 ms`
- score: `8011`
- final stage: `3`
- transitions: `1 > 2 > 3`
- failed checks: none
- console errors: none
- blocked pause attempts: `0`
- audio cleanup: passed with `voices=0`

Passed checks:

- input isolation
- Pull
- Gust
- tree response
- Grid Zap
- popup batching and DOM rendering
- collapse
- score beyond `3999`
- district progression
- score beyond `7999`
- results
- audio cleanup
- console errors
- duration
- monotonic progression

Popup evidence:

- `layerFound=true`
- `queuedHits=1`
- `rampagePopups=0->1`
- `connected=true`
- text: `DEMOLISHED!+3211.6x`

Durable evidence file:

- `Docs/Evidence/QA4_STAGE4_PASS_QA46_803f6fa.json`
- Evidence commit: `5753e6ee68267858de09e6f1c43d5ae6521e245e`

## Stage 4 status

- Committed: yes
- Built: yes, evidenced by the deployed QA #46 page
- Browser-QA passed: yes
- Physically tested in mobile Chrome: yes
- Android APK physically accepted: no
- Merged: no

Stage 4 exit criteria are satisfied. Do not reopen QA4 unless a later regression is demonstrated.

## Normal browser-round evidence

Earlier Galaxy S26 Ultra Chrome evidence from QA build `5ad8277` also proved:

- complete Tornado warning run reached results
- final score `125462`
- grade `S+`
- objectives `3/3`
- all three districts completed
- score continued beyond former `3999` and `7999` ceilings
- final results matched accumulated score

Together, the normal full round and passing deterministic test satisfy the Stage 4 browser gate.

## Resolved QA4 defects

### Hidden pause overlay intercepted QA taps

Resolved with inactive hit-test isolation, `visibility: hidden`, `inert`, HTML `hidden`, hard `display: none`, and centralized pause-overlay state ownership.

### Popup layer lookup

Resolved with `getRampageFeedbackLayer()` and direct `document.getElementById('rampageFeedbackLayer')` fallback.

### Popup ownership and timing

Resolved by testing the actual v4.5.0 DOM `.rampage-popup` output and flushing the real `90 ms` batching queue before assertion.

### Fragile verification process

Resolved by:

- `scripts/verify-qa-package.mjs`
- `scripts/run-qa4-headless.mjs`
- workflow stabilization commit `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`

## Active next stage: Stage 5 Android QA Packaging

Goal: produce a QA APK that installs over the previous QA build and is traceable to an exact commit.

Required work:

1. Inspect the current Android workflow and package identity.
2. Establish a persistent QA-only signing key through GitHub Secrets.
3. Preserve a stable QA application ID.
4. Increase version code monotonically.
5. Build only from the accepted Stage 4 candidate or an exact descendant that changes packaging only.
6. Publish the APK through a stable GitHub prerelease or equivalent download location.
7. Record exact commit, workflow run, version code, APK SHA-256, and artifact name.
8. Verify installation over the prior QA APK without uninstalling.

Security rule:

- Never commit signing key material.
- Never expose secrets in workflow logs.
- Use a QA-only key, not a production distribution key.

## Stage 6 after packaging

After Stage 5 succeeds, perform one meaningful Galaxy S26 Ultra APK acceptance run covering:

- audible and responsive music
- accepted wind ambience
- believable ability and destruction audio
- glass not overrepresented
- no unidentified synthetic sound
- readable rampage feedback
- forward-only districts
- complete three-minute run
- retry and cleanup
- fullscreen, controls, frame pacing, heat, and battery

Only explicit approval of the exact APK completes v4.5.0 and permits PR #10 to be marked ready for merge.

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
- QA4 input isolation
- QA4 popup batching and rendering
- zero-error deterministic cleanup

## New-chat prompt

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10, branch `qa`, `Docs/ACTIVE_HANDOFF.md`, and the Android packaging workflows. Stage 4 passed on `QA #46 · 803f6fa`. Begin Stage 5 Android QA Packaging. Do not reopen QA4 without evidence of a regression, and do not alter accepted gameplay while working on signing, versioning, or APK delivery.
