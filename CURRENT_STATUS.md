# Severe Weather Warning Current Status

**Last updated:** 2026-08-14  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** mobile landscape / browser-first QA  
**Production renderer:** Three.js r128  
**Active phase:** Stage 2B — Make It Feel Like a Game  
**Director authority branch:** `agent/director-stage2b-game-direction`

> This is a concise snapshot. `Docs/ACTIVE_HANDOFF.md` plus exact issue/branch/commit/CI evidence are the recovery authority.

## Current canonical

Canonical branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted head:
`706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

Previous canonical:
`7d3e7e747b5a55ebaecf8ec313e66f8ac39b10f4`

The new canonical adds the accepted commercial-shell layer without reopening gameplay authority.

## What just became real product

### SW-UI-003 — accepted
Head: `76042f632398d4bef917a08436dc2338034fb3e6`

- authored Severe Weather Warning pause treatment;
- correct Heartland / County Fair / Gullwind / Moo Level identity;
- results with clear score/rank hierarchy, grade stamp, grouped stats, and large actions.

### SW-UI-004 — accepted
Head: `8becea1133864057050d6cd48ad033dc9992c445`

- gameplay now says **Severe Weather Warning**;
- visible `SEVERE WEATHER 3D`, `3D LAB`, and `PRODUCTION SLICE` chrome removed;
- legitimate controls, score, timer, radar, and gameplay truth preserved.

### SW-INT-004 — accepted and promoted to canonical
Head: `706408e4e367782fed0ffc6e40d0cdd27a7e71bd`
Workflow run: `31851282218` — **SUCCESS**

Combined gameplay/pause/results evidence passed Director pixel review and all inherited blocking gates.

## Still active quality debt

### #81 SW-WORLD-007 — secondary storms
Not accepted.
Supercell/Derecho truthful evidence exposed remaining hard geometric/legacy presentation.
A bounded atmospheric-mass + visibility-lock correction is currently under QA.
Latest handoff head: `4caeae17d5c7949f1ef110e9ef9df3d209c375b6`.

### #82 SW-FEEL-001 — destruction consequence
Not accepted.
Engineering event/pooling architecture is safe, but truthful screenshots still showed generic fragment dominance.
Latest correction prioritizes roof/wall/facade anatomy over generic chunks.
Latest handoff head: `d84e5bd66fcb46518324efa8a7c23a1598702658`.

## QA Pages

Issue #84 / draft PR #85 is the publisher correction lane.
It was no-deploy validated against prior canonical `7d3e7e...`, but canonical is now `706408e4...`.

Before publishing:
- refresh the publisher to exact `706408e4...`;
- include accepted UI-003 + UI-004;
- rerun no-deploy validation;
- intentionally merge/deploy only after review.

Do not claim public Pages serves the new canonical yet.

## Product direction

**Severe Weather Warning** is a mobile arcade destruction game with light action RPG progression.

Player fantasy: **YOU ARE THE STORM**.

Art thesis: **storm-charged stylized Americana**.

Current priority is reducing prototype tells and increasing commercial coherence, not widening systems.

Next high-value areas after #81/#82/#84:
- tactile MOO-LAH + Storm Triangle reward/purchase presentation;
- Secret Moo Level legendary-stage identity;
- broader world density/material repetition;
- bounded cleanup of the remaining technical desktop control legend.

## Protection law

Unless an exact task reopens it, protect steering/input/camera, storm movement, Pull/Gust/Grid Zap, scoring/campaign truth, target health/damage/collision/coordinates, Cow safety, pause/reset lifecycle, and local-first progression.

Presentation may amplify gameplay truth. It may not become gameplay authority.

## Physical acceptance

Browser/CI acceptance is not Android physical acceptance. Deployment is also a separate gate.
