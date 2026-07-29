# HTML 2.5 to Unity Parity Matrix

Status: ACTIVE PRODUCTION GATE
Reference: HTML Lab v2.5.0 at commit `9b856fd2586bc0c70e3ee95da02fe1dfe0162f74`
Production target: Android Unity build
Primary storm: Tornado

## Purpose

This matrix prevents the Unity production game from drifting away from the most enjoyable current build. HTML 2.5 defines the target gameplay experience. Unity must first match it, then exceed it through graphics, physics, destruction, audio, and atmosphere.

## Gate definitions

- `REFERENCE`: proven in HTML 2.5 and must be translated.
- `FOUNDATION`: already exists in Unity but may require retuning.
- `MISSING`: not yet present in Unity production gameplay.
- `PASS`: confirmed on a physical Android device.

No item becomes `PASS` from source inspection or cloud-build success alone.

## Parity table

| System | HTML 2.5 target | Current Unity state | Production action | Gate |
|---|---|---|---|---|
| Tactical camera | Pulled back, wide, readable, mobile-aware, movement look-ahead | Hybrid camera built for earlier debug slice | Rebuild framing and follow behavior around HTML comfort | MISSING |
| Tornado movement | Fast, responsive, easy to steer | Functional but tuned separately | Match perceived speed, acceleration, dead zone, and turning | FOUNDATION |
| Pull | Strong inward orbit and visible capture | Suction exists | Increase readability, capture rhythm, debris orbit, and animal lift | FOUNDATION |
| Gust | Satisfying outward shockwave and object launch | Gust exists | Match destructive generosity and add controlled animal fling | FOUNDATION |
| Grid Zap | Readable electrical chain reaction | Conductive chaining exists | Improve targeting, power flashes, cascade presentation, and score feedback | FOUNDATION |
| Tornado silhouette | Large readable funnel from tactical distance | Layered primitives; new mesh component not integrated | Build layered production funnel with growth states | FOUNDATION |
| Three-minute run | Fixed arcade session | Not in production slice | Add `TornadoRunController` | MISSING |
| Score | Constant destruction reward | Experimental progression code only | Add authoritative scoring from storm events | MISSING |
| Combo | Escalating reward for chained destruction | Absent | Add growth, hold, decay, and HUD feedback | MISSING |
| EF growth | Score-linked tornado growth and stronger abilities | Experimental manager exists but is not integrated intentionally | Rebuild as Tornado-specific progression with visuals and tuning | MISSING |
| Objectives | Three clear run goals | Absent | Add objective tracker and landmark conditions | MISSING |
| Results screen | Score, grade, objectives, landmarks, replay | Absent | Add end-of-run news recap and restart flow | MISSING |
| Warning ticker | Persistent event-aware warning banner | Prototype banner source exists but is not integrated into current bootstrap | Build event-driven production ticker | MISSING |
| Breaking news | Major event callouts | Absent | Trigger from shared storm event bus | MISSING |
| Storm chasers | Safe moving witnesses, camera zones, reactions | Absent | Add road AI, safe retreat, footage cone, radio, and camera bonus | MISSING |
| Animals | Invincible, airborne, funny, flingable | Basic invincible animal source exists but is not spawned or connected | Build capture, orbit, launch, landing, audio, and reset states | MISSING |
| Four districts | Downtown, Suburbs, Industrial, Farmland | Unity has six graybox districts with different layout | Re-author map around readable four-district gameplay routes | MISSING |
| Landmark readability | Water tower, silo, utility and district landmarks visible from afar | Some landmarks exist procedurally | Rebuild silhouettes, navigation cues, and staged destruction | FOUNDATION |
| Radar / wayfinding | District and target awareness | Absent in player HUD | Add radar or directional landmark indicators | MISSING |
| Destruction generosity | Frequent, obvious, fun destruction | Damage works but readability and object response are uneven | Retune durability, impulses, fragments, stages, and target density | FOUNDATION |
| Persistent aftermath | Visible damage path and wreckage | Crop cleanup patch exists | Expand to terrain scars, flattened crops, debris, and district aftermath | FOUNDATION |
| Player HUD | Compact game information and readable buttons | Debug telemetry dominates | Move telemetry behind developer toggle and build player HUD | MISSING |
| Intro broadcast | Brief warning and touchdown setup | Absent | Add skippable opening sequence | MISSING |
| Ending broadcast | Local-news-style recap based on actual events | Absent | Drive from run event recorder | MISSING |
| Audio | Immediate storm, destruction, warning, and chaser feedback | Final audio absent | Build layered storm and material audio system | MISSING |
| Performance | Comfortable mobile play | Build 5.2 stability not yet physically proven | Target 60 FPS, minimum 45 FPS ordinary play, bounded spikes | OPEN |

## First implementation milestone

The first post-baseline Unity milestone is not the entire feature list. It is:

1. Tornado-only production run.
2. HTML-style tactical camera.
3. HTML-style movement comfort.
4. Pull, Gust, and Grid Zap retained and retuned.
5. A small dense test district with obvious targets.
6. Flingable cow prototype with safe landing.
7. Persistent warning ticker stub driven by real events.
8. One safe storm chaser vehicle and captured-on-camera zone.

This milestone exists to prove the new trajectory on the physical device before expanding the county.

## Physical comparison scorecard

Test HTML 2.5 and Unity on the same Android device. Score each from 1 to 5:

- camera comfort
- movement comfort
- tornado visibility
- Pull satisfaction
- Gust satisfaction
- Grid Zap clarity
- destruction frequency
- destruction readability
- target navigation
- animal interaction
- news feedback
- storm chaser contribution
- replay desire
- heat and performance

Unity does not advance to broad visual production until it meets or exceeds HTML 2.5 in camera comfort, movement comfort, tornado satisfaction, destruction, and replay desire.

## Performance guardrails

- Target: 60 FPS.
- Ordinary gameplay floor: 45 FPS.
- Destruction spikes must be brief and measurable.
- Debris, fragments, effects, animals, and chaser systems require explicit budgets.
- Five-minute stress test must show no runaway object growth, memory growth, or accumulating clutter.

## Scope guardrail

Supercell and Derecho remain preserved but are not first-slice priorities. No additional storm work may displace Tornado parity tasks until this matrix records physical-device passes for the core Tornado run.
