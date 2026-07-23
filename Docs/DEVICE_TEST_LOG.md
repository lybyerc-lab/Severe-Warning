# Physical Device Test Log

This file is append-only. Record the tested build, commit, device-visible behavior, failures, and the next approved response. Do not replace physical evidence with assumptions from a successful cloud build.

## 2026-07-23 - Android Build #1

### Source

- Initial production starter commit: `5188c78ba99bf8ff7935f583cad926a4107d0da5`
- Unity: `6000.3.0f1`
- Target: Android APK through Unity Build Automation

### Result

- Cloud build succeeded.
- APK installed and launched.
- Device displayed a black screen.

### Engineering response

The startup path was made observable and resilient:

- camera creation moved ahead of region generation
- camera received a guaranteed solid-color clear surface
- startup exceptions gained an on-screen diagnostic panel
- a guaranteed-included runtime shader was added
- runtime material lookup gained explicit fallbacks and a clear failure

Hotfix commit: `23e638f5dbfb0522f512209fa636a17147c6c7d1`

## 2026-07-23 - Android Build #2

### Result

- Cloud build succeeded.
- APK installed as an update.
- Generated graybox region rendered successfully.
- Tornado spawned.
- HUD rendered.
- Storm switching between Tornado and Supercell worked.

### Physical findings

- Storm movement was not clear or reliably controllable.
- The camera-follow behavior made world-axis steering difficult to interpret.
- Visible ability buttons did not share the same rectangles as touch detection.
- The right side was interpreted as horizontal touch bands, so visible labels and actual actions could disagree.
- No joystick, dead-zone display, input vector, or position telemetry existed.

### Approved response

Build #3 is a focused mobile-control alignment pass. It must fix the complete input path without mixing in art, audio, loading, or new gameplay work.

## Build #3 test record

Status: pending physical Android test.

Record after installation:

- Cloud build result:
- APK update or clean install:
- Tornado movement:
- Supercell movement:
- Primary ability:
- Secondary ability:
- Tertiary ability:
- Storm switching:
- Safe-area fit:
- Frame pacing:
- Heat:
- New defects:
- Decision:
