# Phase 6 Performance Source Map

## Accepted executor integrations

The accepted V5.1 runtime modules remain byte-for-byte bundled. Phase 6 appends one bridge at the end of the accepted game script and installs named wrappers around the live functions below.

| Runtime path | Phase 6 integration | Proof |
|---|---|---|
| `spawnProductionDustBurst` in the accepted Hart Farm destruction path | wrapped by `phase6PooledProductionDustBurst`, which delegates to the bounded dust pool | QA triggers `triggerProductionSliceQa('hero')` and requires the production dust-call counter and pool high-water mark to increase |
| `disposeProductionObject` | wrapped by `phase6AwareDisposeProductionObject`, which releases pooled meshes without disposing shared geometry | package verification requires all accepted runtime modules to remain byte-for-byte bundled and the wrapper to be present |
| `clearProductionSlice` | wrapped by `phase6BoundedProductionClear`, which releases pooled transients before accepted cleanup continues | QA invokes `__SW_V510_REBUILD__()` and requires active pooled items to return to zero |
| `updateProductionSlice` | wrapped by `phase6MeasuredProductionUpdate`, which submits real frame deltas before the accepted update continues | QA requires production-update samples before any deterministic quality probe |
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
- The final package must still pass the existing V5.1 byte-for-byte runtime-bundle verification.
