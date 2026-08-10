# SW-GAME-001 Utility, Grid Zap, and Cow-Cam Tuning

Task: `SW-GAME-001`
Base: `d0ebca88328fd1af590ce2d3916368426df07938`

## Shared utility-network authority

The generated gameplay source remains authoritative for the rendered pole group, the 81 rendered overhead wire segments, `powerPoles` coordinates, and Grid Zap topology. The route now has nine deterministic east-west groups, each with ten poles. All 90 poles use the same `x`, `z`, `networkGroup`, and `networkIndex` record; no presentation-only offset exists. The wires are built from those ordered records, so a visible connection and a Grid Zap connection cannot diverge.

Road centers are the existing 80-unit grid at `-320` through `320`. The road/shoulder protected half-width is 8.5 units. Every pole is placed 13.5 units from its parallel road center and at least 13.5 units from any road centerline, leaving a minimum 5.0-unit clearance beyond the protected corridor. Baseline producer count was 117 poles; the aligned network has 90.

## Grid Zap

| Value | Baseline | SW-GAME-001 |
| --- | ---: | ---: |
| Initial acquisition | `storm.radius * 4.2` | `storm.radius * 5.25` |
| Connected-node cap | 6 | 8 |
| Per-hop maximum | 78 | 82 |
| Direct connected-pole target damage | none | 135 within 16 units |
| Cooldown / charge | unchanged | unchanged |
| Duplicate target hit rule | pole spark guard only | per-activation target `Set` |

The cascade begins at the nearest acquired pole, then travels only to an adjacent `networkIndex` in the same `networkGroup`; geographic proximity alone cannot cross to a disconnected route. The eight-node cap bounds the visual work and damage. Existing pole score values remain `110` for the first pole and `75` for later poles. Generic tertiary prop damage, Pull, Gust, steering, contact destruction, scoring authority, and cooldowns were not changed.

## Cow-Cam

The player-visible Cow 17 beat is `activateCowCam` in `scripts/apply-v500-cow-signature-patch.mjs`, not the deterministic `triggerCowCamQa` helper. Its timer changed from 1.85 seconds to 3.1 seconds: a 1.25-second linger. The existing active-camera blend, no-input-lock behavior, timer progression, reset cleanup, and normal camera fallback remain intact.
