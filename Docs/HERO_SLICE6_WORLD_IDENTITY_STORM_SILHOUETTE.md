# Hero Slice 6: World Identity + Storm Silhouette

## Source identity

- Parent candidate: Hero Slice 5
- Exact parent commit: `f42f12b3e4e6b38d49f6bcc0b129b4e335f13ecf`
- Working branch: `agent/threejs-hero-slice6-world-identity-storm-silhouette`
- Renderer: Three.js r128
- Scope: bounded Stage 2A presentation-only pass.

## Goal

Hero Slice 6 attacks the two remaining visual blockers that still dominate ordinary gameplay screenshots with Neon disabled:

1. the default tornado silhouette still reads too much like layered geometric cones;
2. the hero neighborhood still reads too much like repeated procedural boxes separated by pale, unfinished ground.

This pass does not open Stage 2B. It does not add cinematics, campaign scope, abilities, scoring systems, or new gameplay rules.

## Storm silhouette

The default storm keeps all authoritative movement, EF scaling, collision, damage, and ability behavior untouched. Slice 6 only changes presentation around that truth.

- add three low-opacity warped condensation shells with an authored bent centerline;
- add irregular edge wisps that break the clean cone boundary;
- add non-uniform ground bursts instead of another clean circular skirt;
- reduce inherited Slice 4 shell dominance so the volume reads as layered weather rather than stacked geometry;
- darken the legacy funnel only in the normal non-Neon presentation;
- keep the Slice 5 Neon selection independent. Slice 6 may read that selection but never writes, unlocks, persists, or forces it.

The storm presentation root is `SWVisualHeroSlice6StormSilhouette` and the profile marker is `asymmetric-storm-v1`.

## World identity

The world pass is concentrated around the existing authored hero locations rather than spread thinly across the whole county.

### Main Street

- give a bounded set of nearby intact structures varied rooflines, false fronts, parapets, signs, awnings, and service-window details;
- add darker service-alley and parking-pocket ground treatment;
- add a restrained roadside vegetation pocket;
- keep the authored storefront itself and all target gameplay truth unchanged.

### Hart Farm edge

- add an instanced fence line along the existing farm approach;
- add darker ditch and shoulder transitions;
- keep the existing barn, cow Easter egg, terrain authority, and gameplay animals unchanged.

The world presentation root is `SWVisualHeroSlice6WorldIdentity` and the profile marker is `authored-main-street-v1`.

## Unified grade

Slice 6 slightly restrains tone-mapping exposure and deepens fog/sky values by warning stage so buildings, terrain, and storm occupy the same weather system. This is presentation-only and does not change visibility rules, hazard range, collision, or camera behavior.

## Protected gameplay law

Hero Slice 6 must not change:

- steering, input, camera feel, or storm speed;
- Pull, Gust, or Grid Zap behavior;
- score, combo, timer, rank, objectives, campaign progression, or warning-stage authority;
- target health, damage stage, points, destruction, coordinates, collision, or material-family truth;
- storm position, EF authority, hazard logic, or collision truth;
- gameplay animal membership, airborne state, safety rules, or Cow17 behavior;
- the existing Neon selection/unlock/persistence authority;
- lifecycle behavior or Android controls.

No runtime network assets are introduced.

## Evidence required

The exact-source workflow must retain inherited gameplay and Hero Slice 5 gates and produce:

- `threejs-hero-slice6-default-storm.png` with Neon OFF;
- `threejs-hero-slice6-main-street.png`;
- `threejs-hero-slice6-farm-edge.png`;
- `threejs-hero-slice6-report.json`;
- `threejs-hero-slice6-static-report.json`;
- inherited Hero Slice 5 browser evidence;
- same-runner Hero Slice 5 versus Hero Slice 6 performance evidence;
- a Pages-ready `web-preview`;
- Android debug packaging evidence.

Browser QA must prove that the new storm shells are actually warped, the centerline is measurably non-straight, Neon remains OFF by default, the authored streetscape pieces exist, farm-edge transitions exist, and the Slice 6 presentation remains inside its bounded object budget.

## Acceptance status

**NOT ACCEPTED.**

Green CI is necessary but not sufficient. The exact artifact still requires assistant screenshot review and owner visual review before any QA Pages promotion. The acceptance question for this slice is whether ordinary non-Neon gameplay finally reads as a cohesive severe-weather game instead of a polished prototype.

No physical Galaxy S26 Ultra acceptance is claimed by this work.
