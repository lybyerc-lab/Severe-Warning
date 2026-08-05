# Phase 6 Performance Source Map

## Accepted executor integrations

| Runtime path | Phase 6 integration | Proof |
|---|---|---|
| `spawnProductionDustBurst` in the accepted Hart Farm destruction path | delegates to `__SW_PHASE6_PERFORMANCE_BRIDGE__.spawnDustBurst` | QA triggers `triggerProductionSliceQa('hero')` and requires the production dust-call counter and pool high-water mark to increase |
| `updateProductionPulseEffects` | releases pooled dust without disposing shared geometry | QA waits for live pooled effects and verifies bounded counts |
| `clearProductionSlice` | releases pooled transients and resets Phase 6 state | QA invokes `__SW_V510_REBUILD__()` and requires active pooled items to return to zero |
| `updateProductionSlice` | submits real frame deltas to adaptive quality | QA requires production-update samples before any direct Phase 6 probe |
| window blur and document visibility interruption | resets the Phase 3 input authority plus legacy joystick and key state | QA activates Phase 3 movement, dispatches blur, and requires movement to become inactive |

## Bounded runtime ownership

- One dust-pool geometry is reused.
- The pool contains 48 preallocated mesh/material records.
- Active cosmetic dust is capped by the current quality tier.
- Quality tiers affect renderer pixel ratio, shadows, and cosmetic dust only.
- Damage, score, Power, Stability, campaign progression, collision truth, objective timing, and Cow 17 behavior remain unchanged.

## Evidence model

- Phase 5 and Phase 6 are built in one workflow.
- Both builds are served simultaneously on the same runner.
- Initial, movement, heavy-destruction, and after-reset scenarios are captured for each build.
- Median and p95 frame time, long-frame counts, renderer calls, triangles, scene resource counts, heap proxy data, screenshots, and browser logs are retained.
- Timing comparisons are advisory. Integration and resource-bound assertions are blocking.
