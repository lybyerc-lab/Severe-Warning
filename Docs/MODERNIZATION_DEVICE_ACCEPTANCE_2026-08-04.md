# Modernization Physical Device Acceptance Ledger

**Recorded:** 2026-08-04 Central Time  
**Primary reported device:** Galaxy S26 Ultra  
**Purpose:** Preserve owner-observed browser and installed-APK behavior for modernization Phases 1 through 3.

Automated verification is necessary but does not replace this record.

## Phase 1: modern shell

### Sealed automated evidence

- Branch: `agent/modernization-phase-1-shell`
- Commit: `710ee8537e3d4ca6424b8bf32b282abae0dbfc28`
- Workflow run: `30870506335`
- Artifact ID: `8877735187`
- Artifact digest: `sha256:12274df6fed420048575ca8aeb380c7cdd0a8f67e6d04d03500108234273aa20`

### Owner evidence

The packaged browser build was played on an Android device and reached a complete Tornado Warning results screen.

Observed result included:

- rank `S+`
- final score `101693`
- objectives `3/3`
- landmarks `2/2`
- bonus challenges `3/3`
- Prairie Junction unlocked
- no visible results-screen collapse or missing action buttons

Owner verdict:

> Good build

### Accepted meaning

- the modern Vite/TypeScript shell coexisted with the accepted legacy gameplay runtime
- score, results, campaign unlock, and player-facing browser presentation remained functional
- this did not independently prove installed-APK lifecycle behavior

## Phase 2: clocks and run state

### Sealed automated evidence

- Branch: `agent/modernization-phase-2-clocks`
- Final corrected commit: `381014d3d7f4a128e5c6e285200fdb2790af94b5`
- Workflow run: `30884351261`
- Artifact ID: `8882537816`
- Artifact digest: `sha256:b35dcac9b266c21a9affc8aabcee0c999ce30904e02d43aba05179d38b28c9a6`

### Owner timing evidence

During an installed Android run:

- manual pause held the warning clock
- backgrounding the application held the warning clock
- returning to the game did not jump the countdown forward
- the run remained active and resumed correctly

The captured forensic trace showed:

- `qaRunning=false`
- `runEntries=0`
- `testLock=false`
- `isPaused=true`
- `runActive=true`
- `overlayActive=true`
- reason `pause-overlay-became-active`

### Defect discovered and corrected

A normal player pause exposed the full `QA4 PAUSE FORENSICS` panel.

Root behavior:

- diagnostic capture was useful
- player-visible rendering was not properly gated

Correction:

- player mode now captures silently
- the panel displays only through explicit `?qa4=forensic` mode
- desktop and mobile-landscape regression tests prove both sides of the gate

The corrected guard was inherited by the physically accepted Phase 3 build.

### Responsive observation

One Phase 2 results screenshot showed the warning-run heading crowded or clipped at the top in a wide landscape geometry. The lower results content and controls remained usable. A later Phase 3 screenshot fit correctly.

Treat this as a responsive regression case to preserve in tests, not a universal active defect.

## Phase 3: input and ability authority

### Sealed automated evidence

- Branch: `agent/modernization-phase-3-input-abilities`
- Commit: `b9d55188f91ade720a50837f15591c91209098ad`
- Workflow run: `30910503447`
- Artifact ID: `8892944447`
- Artifact digest: `sha256:039e4e7697e5cee64ce2b7a9f514fa5979a5fd376a117a4a25b4c98740c202fa`
- APK SHA-256: `35be5607e44a0401b1843b3428450390b48b8620292a0b112e4a5a56944c0de5`

### Owner evidence

The installed Android build completed a Derecho Warning run.

Observed result included:

- rank `S+`
- final score `146496`
- objectives `3/3`
- landmarks `2/2`
- substations `3/3`
- bonus challenges `3/3`
- three-star Lincoln County completion
- Prairie Junction unlocked
- complete Bovine Situation Report
- Retry County, Next Stop, and Weather Map actions visible

The owner confirmed:

- joystick response was good
- joystick release was clean
- Pull, Gust, and Grid Zap responded correctly
- no accidental double activation occurred
- cooldown behavior was normal
- pausing did not create stuck movement
- backgrounding and returning did not create control or timing defects

Owner verdict:

> Everything was good!

### Accepted meaning

Phase 3 is physically accepted for the tested high-end Android device.

This acceptance covers the normalized input and ability-command authority as inherited with the accepted Phase 1 and Phase 2 behavior.

## What this ledger does not prove

The following remain incompletely measured:

- lower-end Android performance
- midrange Android performance
- sustained heat over longer sessions
- battery consumption
- repeated multi-stop sessions
- process death and recovery
- close and reopen save behavior on Phase 4 data
- multiple device safe-area geometries
- player release packaging without visible QA identity

## Acceptance law for future phases

Every future phase must record:

- exact branch and commit
- workflow run
- artifact ID and digest
- APK hash where available
- device or viewport
- what was physically exercised
- failures observed
- owner verdict

Do not convert `CI passed` into `device accepted`.
