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

### Run #1 visual rejection

Run #1 passed automation but failed visual review. The town still lacked a convincing spatial law: road edges were weak, a Hart Farm fence crossed an active road, some generated building presentation encroached on road space, and the new Slice 6 building kits added more square-on-square massing instead of fixing the underlying parcel logic.

That version is superseded by the road-first correction below.

### Road-first parcel law

`THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1` makes the existing 80-unit road grid the first presentation constraint.

- roads and shoulders own a protected corridor before any decorative placement is allowed;
- each town block receives continuous curb, sidewalk, and verge boundaries derived from the actual road grid;
- the old 60x60 city-fabric parcel pads, one-sided sidewalks, and rectangular alley overlays are hidden instead of stacking another square surface on top of them;
- inherited Slice 4 storefront/farm transition rectangles are suppressed where they fight the new street boundary language;
- non-tree target presentation is horizontally fitted inside its parcel setback without changing `target.x`, `target.z`, health, collision truth, damage state, points, or gameplay authority;
- Slice 6 no longer adds its extra box/parapet building-identity kits. `buildingIdentityCount` must remain zero in the corrected world pass;
- browser QA independently measures visible target bounds against the protected road corridor and fails on any building-road intrusion.

The world presentation profile marker becomes `road-first-parcels-v2`.

### Main Street

Main Street now gets identity from the street itself rather than from more stacked building boxes:

- curb continuity;
- sidewalks on all four sides of every active block;
- restrained verge bands between sidewalk and parcel interior;
- a small instanced vegetation pocket that is allowed only inside the parcel setback;
- existing authored storefront and generated target presentation remain tied to the same gameplay target coordinates.

### Hart Farm edge

The farm edge follows the same road law.

- fence posts and rails are generated as road-aware segments rather than one uninterrupted 60-unit line;
- every road crossing creates a real fence gap;
- ditch and shoulder treatments are also segmented and stop before the road corridor;
- QA independently inspects fence instances and fails if a post or rail enters the protected road;
- the barn, cow Easter egg, terrain authority, and gameplay animals remain unchanged.

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

Browser QA must prove:

- the new storm shells are actually warped and the centerline is measurably non-straight;
- Neon remains OFF by default;
- the road-law version is active;
- curb/sidewalk/verge boundaries exist across the town grid;
- legacy square parcel overlays are no longer visible;
- no active Slice 6 stacked building kits remain;
- independent target bounding-box checks find zero building intrusions into protected road/shoulder space;
- the farm fence contains at least one road crossing gap and independent instance checks find zero fence-road intrusions;
- farm ditch/shoulder segments stop before the road;
- the Slice 6 presentation remains inside its reduced object budget.

## Acceptance status

**NOT ACCEPTED.**

Green CI is necessary but not sufficient. The exact artifact still requires assistant screenshot review and owner visual review before any QA Pages promotion. The acceptance question for this slice is whether ordinary non-Neon gameplay finally reads as a cohesive severe-weather game instead of a polished prototype.

No physical Galaxy S26 Ultra acceptance is claimed by this work.
