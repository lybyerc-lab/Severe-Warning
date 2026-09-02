# Active Handoff

Last updated: 2026-08-28 America/Chicago
Repository: `lybyerc-lab/Severe-Warning`
Working branch: **`qa`** — this is the default branch and where work lands.
Current milestone: `v5.1.0 Three.js Production Slice`

> **Read `Docs/BACKLOG.md` first.** It is the living work board and it is kept
> current in the same commit as the work. Everything below the next section is
> historical narrative from the v5.0.0 campaign push and is retained for the
> reasoning, not as a description of the present.

## Current state — 2026-08-28

- **All three workflows are green.** Validate project, Build Signed Android QA
  APK, and QA Automated Full Round. The latter two had been red for at least a
  dozen consecutive commits and the Full Round had never passed in its recorded
  history; both were restored on 2026-08-27. See the Landed section of
  `Docs/BACKLOG.md` for what was actually wrong — most of it was checks that had
  decayed against a moving codebase, not code going bad.
- **128 models, 2,246,432 bytes of a 4 MB budget (54%).** The budget was
  re-derived from measurement on 2026-08-28 (`assets/models/README.md`).
  **Displace-before-adding is lifted** (director, 2026-08-29): a batch may open
  by adding, and nothing has to be retired to make room. The cap is what is
  left — if a batch would take the payload past 4,194,304 bytes it has to name
  what it retires and show the measurement. Repairs never count against it.
- **A run can be lost now.** Funnel integrity drains whenever the storm is not
  destroying anything and ropes the run out at zero, with the newspaper printing
  how long the storm held. It arms on the first hit, gives a 3.5s grace window,
  and refills on every scoring event, so it punishes coasting rather than
  travelling. Rules are pure and unit-tested in
  `src/gameplay/run/integrity-system.ts`; drain is 5.5 / 8 / 11 per second by
  district. If you are writing a QA driver, note that a random walk starves —
  `qa-play-full-round.mjs` steers at the nearest live target for this reason.

- **The shop is a choice, not a checklist.** Three slots against six upgrades,
  and `swRpgUpgradeActive` means owned AND slotted (`swRpgUpgradeOwned` is the
  old meaning). Catalogue is 6,450 MOO-LAH against ~1,078 for a strong run, so
  roughly six rounds to own everything. `pnpm verify:economy` fails the build if
  the page's table and `moolah-system.ts` disagree — they had already drifted
  once, and the tested half was not the shipped half.

- **The EF ladder is walked, not jumped.** The badge used to go EF-2 -> EF-4
  with EF-3 never displayed: district 1 caps at EF-2 while the score climbs past
  it, so a good run hits the district-2 boundary already above the EF-4 gate and
  the ceiling lifted two rungs in one frame. `stepEfRating` now limits the climb
  to one rung per 2.5 seconds of run clock, carrying multiplier and funnel scale
  with it. Demotions stay immediate. Open question in `Docs/BACKLOG.md`: the
  score gates themselves still do not bind for a strong run.

- **See-through models: fixed and now gated.** `industrial-warehouse-curved`,
  `farm-windmill` and `tractor` were repaired under ASSET-001; the library
  passes 128/128. `pnpm models:seethrough` is no longer advisory -- it runs as
  a step in the QA Automated Full Round workflow, so a model with a hole in it
  cannot reach `qa` again.
- The branches named further down (`agent/v500-heartland-campaign` and friends)
  are archived. Do not look for them.

## Historical — v5.0.0 campaign push (2026-08-03)

## V5 fast-track override

On 2026-08-03, the user explicitly approved advancing directly to V5 instead of waiting for the remaining v4.5.0 signing ceremony. This satisfies the build-train requirement for explicit approval before widening or skipping a stage.

- Active integration branch: `agent/v500-heartland-campaign`
- Source base: browser-QA-passed `qa` gameplay plus current `main` build infrastructure
- V5 contract: `Docs/V5_BUILD_TRAIN.md`
- V5 implementation: deterministic campaign, real-time clock, authored world-tour, mobile results containment, and Cow Signature patches
- V5 verifier: `scripts/verify-v500-campaign.mjs`
- Cow Signature gameplay commit: `cffbeb2` (`Add Cow 17 signature system`)
- Exact CI candidate head: `4917d16`; automated evidence commit: `80bd3bd`
- Pages run #49: built, deterministic browser-QA passed, and deployed from exact commit `8b193b5`
- Full-round run #4: workflow execution was green, but its report correctly recorded `roundCompleted=FAIL` and `reachedDistrictThree=FAIL`; the workflow did not yet enforce failed report checks
- Root cause: the three-minute countdown used the simulation delta capped at `0.1 s`; at headless `3 FPS`, 205 wall-clock seconds advanced only about 47 game seconds
- Correction: `scripts/apply-v500-realtime-clock-fix.mjs` separates the warning clock from capped simulation time, preserves pause/background behavior, and makes any failed required playtest check fail CI
- Pages run #50: passed and deployed exact commit `c445324`
- Strict full-round run #5: passed all `11/11` required checks in 185 seconds; reached district 3, finished at time 0, and recorded no page errors, console errors, or harness exception
- Current authored-world candidate: four road-safe terrain profiles, regional scenery and challenges, eight destructible signature landmarks, distinct media rosters, and controlled animal density
- Local mobile-landscape sweep: all four stops constructed successfully with unique contracts and no page or console errors; exact-commit CI evidence remains pending
- Cow Signature candidate: persistent Cow 17, frame-rate-independent safe cattle flight, Cow-Cam, broadcast callouts, Moo Brew sponsorship, hay-bale landings, and Bovine Situation Report
- Local Cow Signature verification: full patch train passed from untouched base, V5 verifier `66/66`, offline web bundle built, and 1365x630 plus 932x430 mobile-landscape layouts showed no results or control overlap
- Exact-commit CI: Pages #53 passed, signed Android QA #6 passed, and strict full-round/world-tour QA #8 passed
- Full-round evidence: district 3 reached, final time `0`, score `21606`, all `11/11` checks passed, and zero page or console errors
- World-tour evidence: all `17/17` checks passed; Cow 17 remained tagged across animal densities `38/24/18/8`, four hay-bale zones loaded per stop, and the safe-animal invariant held
- Current status: Cow Signature is committed, deployed, automated-browser-QA passed, and packaged as signed QA-6; Galaxy S26 Ultra acceptance remains pending
- Android debug delivery: relevant pull-request updates now automatically package the exact PR head; manual workflow dispatch remains available for arbitrary refs
- V5 Android debug run #47: passed from exact commit `b3dcc63`; artifact `severe-weather-v5.0.0-mobile-test-47` contains `Severe-Weather-v5.0.0-Mobile-Test-47.apk`
- APK SHA-256: `d21a30878f090b20e4ceb0a8e9c3acaf770f4ede0c4f7d7409094fe717ea6a07`
- Signed QA run #5: workflow `30842904406`, exact source `569e688`, artifact `severe-weather-v5.0.0-qa-5`, package `com.lybyerclab.severeweather.qa`, version code `500005`, version name `5.0.0-qa.5`
- Physical update status: QA-5 installed over QA-3 without uninstalling; update-in-place is verified for the signed QA application ID
- Physical gameplay status: QA-5 looked and played like the HTML on the Galaxy S26 Ultra; Cow Signature commit `cffbeb2` has not yet been physically tested
- Signed QA run #6: workflow `30849403030`, exact source `4917d16`, artifact `severe-weather-v5.0.0-qa-6`, version code `500006`, version name `5.0.0-qa.6`
- QA-6 APK SHA-256: `eb7299af09b1888307cc91507028b44d00b3ae5b01a90969a67c28a8eb23a0d8`
- Important boundary: inherited v4.5.0 gameplay is protected behavior, but the v4.5.0 milestone was not retroactively declared physically accepted

## Start here

The repository is the authoritative project memory. Do not restart diagnosis from chat history.

Required startup sequence:

1. Read `AGENTS.md`.
2. Read every file listed by `AGENTS.md`.
3. Inspect branch `qa`.
4. Inspect draft PR `#13`.
5. Inspect the latest QA Pages and Android workflows before changing code.
6. Continue from the exact state below.

## Active branches and pull request

- V5 integration branch: `agent/v500-heartland-campaign`
- Gameplay branch: `agent/v450-storm-feel-overhaul`
- Draft V5 PR: `#13`
- Browser QA branch: `qa`
- Accepted baseline on `main`: v4.4.2

## Stage 4 exit evidence

Stage 4 passed on the Galaxy S26 Ultra through GitHub Pages in Chrome.

- Visible build badge: `QA Stage 4 Â· QA #46 Â· 803f6fa`
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

## Signed QA continuity status

- Packaging source changes committed: yes
- Manual workflow available on `main`: yes
- Persistent QA signing secrets configured: proven
- Signed APK built: yes, through QA-5
- Update-in-place verified: yes, QA-3 to QA-5 on Galaxy S26 Ultra
- Packaging continuity gate: complete for the QA application ID

## Immediate next action

1. Download and install signed QA-6 over QA-5; do not uninstall QA-5 first.
2. Play one full Galaxy S26 Ultra run focused on Cow-Cam timing, report readability, cattle visibility, frame pacing, heat, and battery.
3. Close and reopen the app to verify campaign and Cow 17 career persistence.
4. Record physical acceptance or specific corrections before merging PR #13.

The signing ceremony remains inherited packaging work, but it no longer blocks V5 source development.

## Security rule

- Never commit signing key material.
- Never paste passwords or base64 key data into chat.
- Never expose secrets in workflow logs.
- Use this QA-only key, not a production distribution key.
- Back up the JKS and credentials in an encrypted vault. Losing the key permanently breaks update continuity for this QA application ID.

## Inherited v4.5 physical checklist

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

These checks remain regression coverage for V5. They do not prevent the V5 branch from advancing through browser QA.

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

> Open `lybyerc-lab/Severe-Warning`. Read `AGENTS.md` and every file it lists, including `Docs/V5_BUILD_TRAIN.md`. Inspect `agent/v500-heartland-campaign`, branch `qa`, and the latest workflows. Continue V5 browser QA without weakening inherited storm gameplay. Do not describe V5 as physically accepted until the exact APK passes on the Galaxy S26 Ultra.
