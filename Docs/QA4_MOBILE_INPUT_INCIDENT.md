# QA4 Mobile Input Incident

Date: 2026-08-02
Status: correction committed; Pages deployment and browser verification pending
Observed device: Galaxy S26 Ultra using the GitHub Pages QA build

## User finding

Tapping `RUN 30s TEST` in the Visual Lab paused the game instead of beginning the deterministic sequence.

## Failure classification

The Stage 4 deterministic test is not accepted. The Visual Lab rendered, but its mobile control path was not isolated from gameplay and pause input.

## Root cause direction

The Visual Lab used ordinary click listeners while the game also maintained mobile touch input and an inline pause control. A QA-panel tap could leak or produce a mobile ghost click that reached the pause path.

## Correction

Commits:

- Input-isolation patch: `db7e3959015032887e2f0bec493540fd0c544f8e`
- Patch-chain wiring: `e50ba35ce2869ddd4956e18a57d4a6e47e96a34c`
- Pages verification gate: `1940b97d02e644282267217ac8a4d79102a01d96`

Implemented safeguards:

- Stop propagation for pointer, touch, and click events within Visual Lab controls.
- Use `touch-action: manipulation` and contain panel overscroll.
- Arm a short-lived QA input shield around Visual Lab taps.
- Ignore pause toggles that occur during the shield window.
- Force an active, unpaused test state at startup.
- Add an `inputIsolation` check to the deterministic report 350 milliseconds after launch.
- Reject the legacy unisolated `RUN 30s TEST` listener in the Pages build gate.

## Acceptance criteria

- Tapping `RUN 30s TEST` does not open the pause overlay.
- The status changes from `Ready` to `RUNNING`.
- The first Pull step occurs after approximately 1.2 seconds.
- The final report contains `inputIsolation: PASS`.
- The normal pause button still works when the QA shield is not active.
- The full deterministic sequence reaches its final report.

## Status boundary

The correction is committed. It is not yet proven built, browser-QA passed, or physically accepted.
