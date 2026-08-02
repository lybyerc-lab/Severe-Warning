# Active Handoff

Last updated: 2026-08-02 17:39 America/Chicago
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

- Visible build badge: `QA Stage 4 · QA #46 · 803f6fa`
- Exact commit: `803f6fa8e80686afb97a9bb0cbee5cf6e085130d`
- Report version: `QA4_DETERMINISTIC_V1`
- Passed: `true`
- Duration: `30001 ms`
- Score: `8011`
- Final stage: `3`
- Transitions: `1 > 2 > 3`
- Failed checks: none
- Console errors: none
- Blocked pause attempts: `0`
- Audio cleanup: passed with `voices=0`

Durable evidence:

- `Docs/Evidence/QA4_STAGE4_PASS_QA46_803f6fa.json`
- Evidence commit: `5753e6ee68267858de09e6f1c43d5ae6521e245e`

Stage 4 is closed unless a later regression is demonstrated.

## Stage 5 implementation now committed

### Signing-aware Android configuration on `qa`

Commit: `ee09167fd82f3394d38e7334cf11e960e1daefcc`

`android/app/build.gradle` now accepts externally supplied:

- application ID
- version code
- version name
- QA keystore path
- keystore password
- key alias
- key password

Release builds fail closed when signing values are absent. No fallback release certificate is permitted.

### One-time signing setup helper on `qa`

Commit: `daa677771fb01adb030249151e6ad9c140a5382b`

File:

- `scripts/setup-qa-signing.sh`

Purpose:

- generate one persistent QA-only JKS locally
- retain the key outside the repository
- upload base64 key material and passwords to GitHub repository secrets
- refuse to overwrite an existing key

Required secrets:

- `SEVERE_WEATHER_QA_KEYSTORE_BASE64`
- `SEVERE_WEATHER_QA_KEYSTORE_PASSWORD`
- `SEVERE_WEATHER_QA_KEY_ALIAS`
- `SEVERE_WEATHER_QA_KEY_PASSWORD`

### Signing-material exclusions on `qa`

Commit: `1d138fd731a76404e27f7e67a6b4fb491d64db71`

`.gitignore` now rejects common keystore, private-key, certificate, and signing directories.

### Manual signed-QA workflow on `main`

Initial workflow commit: `aa5ee7e9e9631dd69233e20443f0ce6dcaf9857c`

Hardened workflow commit: `1368a290d8fa4a8257b8e0659398ff22dfc89541`

File:

- `.github/workflows/android-qa-signed.yml`

Workflow behavior:

- manually packages an exact source ref, defaulting to `qa`
- checks out the proven gameplay branch without merging it
- derives a monotonically increasing version code as `450000 + workflow run number`
- uses stable QA application ID `com.lybyerclab.severeweather.qa`
- uses version name `4.5.0-qa.<run number>`
- applies the accepted deterministic patch chain
- rebuilds, stamps, verifies, and synchronizes the offline web bundle
- restores the persistent signing key only inside the runner
- assembles a signed release APK
- verifies the APK signature and certificate digest
- verifies package ID, version code, and version name
- records APK SHA-256 and package metadata
- uploads the signed package for 30 days
- deletes restored signing material even after failure

## Current Stage 5 status

- Packaging source changes committed: yes
- Manual workflow available on `main`: yes
- Persistent QA signing secrets configured: not yet proven
- Signed APK built: no
- Update-in-place verified: no
- Stage 5 complete: no

## Immediate next action

A human with repository access must perform the one-time key ceremony from a trusted computer:

```bash
bash scripts/setup-qa-signing.sh lybyerc-lab/Severe-Warning
```

Requirements:

- Java `keytool`
- GitHub CLI `gh`
- authenticated `gh auth status`
- secure storage for the generated JKS and both passwords

After secrets exist:

1. Run `Build Signed Android QA APK` from GitHub Actions with `source_ref=qa`.
2. Inspect the artifact manifest, signer digest, version code, and SHA-256.
3. Install that first dedicated QA APK on the Galaxy S26 Ultra.
4. Run the workflow again to create a higher version code.
5. Install the second APK over the first without uninstalling.
6. Record update-in-place evidence in `Docs/BUILD_LEDGER.md`.
7. Advance to Stage 6 physical gameplay acceptance.

## Security rule

- Never commit signing key material.
- Never paste passwords or base64 key data into chat.
- Never expose secrets in workflow logs.
- Use this QA-only key, not a production distribution key.
- Back up the JKS and credentials in an encrypted vault. Losing the key permanently breaks update continuity for this QA application ID.

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

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists. Then inspect PR #10, branch `qa`, `Docs/ACTIVE_HANDOFF.md`, and `.github/workflows/android-qa-signed.yml` on `main`. Stage 4 passed on `QA #46 · 803f6fa`. Stage 5 packaging code is committed. Confirm whether the four QA signing secrets exist, then run the signed workflow with `source_ref=qa`. Do not reopen QA4 or alter accepted gameplay while completing signing and update-in-place verification.
