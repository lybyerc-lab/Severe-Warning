# System Map

## Runtime architecture

### Gameplay source

Primary source:
- `MechanicsLab/SevereWeather_3D_Lab.html`

Responsibilities:
- Three.js world rendering
- storm controls and abilities
- destruction, scoring, combo, districts, objectives, UI, audio routing, and QA hooks

Current risk:
- The file is large and patch scripts use exact text replacement. Stable anchors should be added before broader modularization.

### Deterministic source patches

Location:
- `scripts/apply-v431-source-patch.mjs`
- `scripts/apply-v440-source-patch.mjs`
- `scripts/apply-v441-source-patch.mjs`
- `scripts/apply-v442-source-patch.mjs`
- `scripts/fix-v450-parser.mjs`
- `scripts/apply-v450-source-patch.mjs`
- `scripts/apply-v450-rampage-music-patch.mjs`

Purpose:
- Reconstruct the current web game deterministically during CI.

Rule:
- Patch scripts must be idempotent where practical and fail loudly on missing or duplicate anchors.

### Web build

Primary script:
- `scripts/build-web.mjs`

Output:
- `www/index.html`
- `www/audio/*`

### Audio generation

Scripts:
- `scripts/generate-storm-audio.mjs`
- `scripts/apply-recorded-storm-effects.mjs`
- `scripts/append-rampage-music.mjs`

Output:
- `assets/audio/storm-feel-sprite.wav`
- `assets/audio/storm-feel-manifest.json`
- `assets/audio/LICENSE.md`

Current packaged contract:
- 44 clips
- 15 pinned recorded sources
- 3 music clips
- fully offline runtime playback

### Android packaging

Technology:
- Capacitor Android wrapper

Important files:
- `capacitor.config.json`
- `android/app/build.gradle`
- `.github/workflows/android-debug.yml`

Current problem:
- Debug builds do not reliably update in place because QA signing is not yet persistent.

### Browser QA

Branch:
- `qa`

Workflow:
- `.github/workflows/deploy-qa-pages.yml`

URL:
- `https://lybyerc-lab.github.io/Severe-Warning/`

Build identity:
- `scripts/stamp-qa-pages.mjs`
- visible QA run number and short commit SHA

Purpose:
- Fast phone testing without APK installation.

### Pull requests and branches

- `main`: accepted production history
- `agent/v450-storm-feel-overhaul`: active gameplay milestone
- PR `#10`: draft v4.5.0 integration
- `qa`: browser QA delivery branch
- `agent/v500-heartland-campaign`: active V5 integration branch based on tested QA gameplay plus current main infrastructure
- `agent/project-memory-foundation`: repository-memory documentation

### V5 campaign layer

Primary patch:
- `scripts/apply-v500-campaign-patch.mjs`
- `scripts/apply-v500-realtime-clock-fix.mjs`

Verification:
- `scripts/verify-v500-campaign.mjs`

Responsibilities:
- Heartland stop definitions
- weather-map selection and locked-state presentation
- persistent unlock, star, best-score, and run-count state
- per-stop broadcast identity, district identity, spawn, palette, score target, and score modifier
- next-stop results flow
- monotonic real-time warning countdown independent of capped simulation delta

## Verification ladder

1. Source committed
2. Syntax and deterministic patch checks pass
3. Browser package verifies
4. GitHub Pages deploys
5. Browser QA passes
6. Android APK builds and checksum verifies
7. Galaxy S26 Ultra physical test passes
8. Acceptance evidence recorded
9. PR merged

## Near-term architecture work

- Add Audio Lab and event logging.
- Add stable anchors to high-risk subsystems.
- Replace exact large-block matching with anchor-bounded replacement where possible.
- Add persistent QA signing and automatic version codes.
- Split full-audio generation from fast gameplay builds.
- Gradually extract large subsystems from the monolithic HTML after behavior is protected by QA checks.
