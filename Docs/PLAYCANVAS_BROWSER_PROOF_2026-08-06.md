# PlayCanvas Browser Proof — 2026-08-06

Status: sealed browser-only renderer proof

## Verified source

- repository: `lybyerc-lab/Severe-Warning`
- implementation PR: #31 `Harden loaded PlayCanvas engine identity proof`
- verified source SHA: `0bfa39ed2a6245c2a2c7b33d31f6d0de0f2935d2`
- merged into `agent/playcanvas-production-slice-handoff` as merge commit `68badfed6de882377ec8822188dd873c2b030aec`

## Authoritative workflow evidence

- workflow: `PlayCanvas Production Slice Bootstrap`
- run ID: `31134481954`
- run number: `9`
- conclusion: success
- artifact: `severe-weather-playcanvas-slice-9`
- artifact ID: `8977373728`
- artifact size: `723177` bytes
- artifact digest: `sha256:7e9a1c29e60f5be15ba7cbe2231a2e8553c943b02c713937afef2093fe3f13a1`
- downloaded artifact ZIP SHA-256: `7e9a1c29e60f5be15ba7cbe2231a2e8553c943b02c713937afef2093fe3f13a1`

The downloaded ZIP digest exactly matched the GitHub artifact digest.

## Engine evidence

- PlayCanvas version: `2.21.3`
- PlayCanvas exported revision: `b1767d5`
- engine file: `playcanvas-2.21.3.min.mjs`
- engine bytes: `2370651`
- engine SHA-256: `d77c4337e8a2fd1dbc38f19b55af8d087a47ca378366558b55aeef4de6a8adb4`
- configured expected SHA-256: identical
- `checksumPinned`: `true`

The browser proof reads version and revision directly from the loaded PlayCanvas module rather than trusting the local configured version string.

## Green gate

Passed:

- exact PR-head checkout
- exact source identity assertion
- locked dependency installation
- pinned PlayCanvas engine download
- strict TypeScript
- static verifier: `26/26`
- Vite production build
- Chromium installation
- preview server startup
- browser QA: `19/19`
- evidence contract validation
- artifact packaging and upload

Browser QA failed checks: `[]`

Console errors: `[]`

Page errors: `[]`

## Browser telemetry

- renderer: `PlayCanvas`
- engine version: `2.21.3`
- engine revision: `b1767d5`
- road clearance: `0.10 m`
- tornado-to-road clearance: `0.18 m`
- entity count: `63`
- QA mode: active

Disposal correctly removed:

- canvas
- global slice handle
- readiness telemetry
- engine version telemetry
- engine revision telemetry

## Manual screenshot review

Evidence screenshot: `playcanvas-slice-evidence/playcanvas-slice.png`

Verdict: accepted for the bounded renderer proof.

The `1365 x 630` frame is populated and readable. The Prairie Junction intersection is visible, the road plane is visibly above the terrain, the tornado base is visibly above the road plane, and the frame is not blank, black, clipped, or nonsensical.

This is not final art acceptance. It proves the isolated PlayCanvas renderer, geometry-height contracts, engine identity, browser lifecycle, and evidence pipeline are real and working.

## Android status

No Android APK was built by this gate.

No physical-device acceptance is claimed by this gate.

## Next migration gate

Proceed from this sealed browser proof into the bounded Moo-Brew production slice defined by `Docs/PLAYCANVAS_MIGRATION_BUILD_TRAIN.md`.

Do not widen into full multi-county migration before the production slice passes browser, Android packaging, and physical-device acceptance.