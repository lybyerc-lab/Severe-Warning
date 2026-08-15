# Severe Weather Warning Current Status

**Last updated:** 2026-08-14  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** mobile landscape / browser-first QA  
**Production renderer:** Three.js r128  
**Active phase:** Stage 2B — Make It Feel Like a Game  
**Director authority branch:** `agent/director-stage2b-game-direction`

> This is a concise snapshot. `Docs/ACTIVE_HANDOFF.md` plus exact issue/branch/commit/CI/deployment evidence are the recovery authority.

## Current canonical

Canonical branch:
`agent/sw-int-003-stage2b-accepted-stack`

Exact Director-accepted head:
`de2e62835e79567b4bbfc079a372ce2af4ee0879`

Previous canonical:
`706408e4e367782fed0ffc6e40d0cdd27a7e71bd`

SW-INT-005 combined acceptance run:
`31856905543` — **SUCCESS**

## What is now accepted product

The current canonical includes:
- QUALITY-001/002 owner-playtest rescue;
- authored pause/results identity;
- gameplay product identity with prototype/lab chrome removed;
- readable desktop field controls with mobile restoration;
- accepted Supercell/Derecho atmospheric identity with Tornado exclusivity;
- first-slice physical structural destruction consequence;
- preserved Storm Sites, score/results/campaign continuity, protected abilities, and Cow safety.

Key accepted inputs:
- #81 WORLD-007: `1ccae11a381b61f0e15138888dbccf9f97fb48ef`
- #82 FEEL-001: `a1d98d2150683f4151bdd0fec08b7ff3c5ff9033`
- #90 UI-005: `c6007883bbdecd65a22186510f13dd4b40778198`

Issues #81, #82, #90, and #91 are closed completed.

## QA Pages is deployed for owner playtest

Issue #84 is closed completed.
PR #85 merged to `main` at:
`f0e80daaca03f702cc71440c7b00c315337e443b`

No-deploy publisher validation:
`31857344504` — **SUCCESS**

Live QA Pages deployment:
`31857742807` — **SUCCESS**

Public QA URL:
`https://lybyerc-lab.github.io/Severe-Warning/`

Pages artifact:
- ID `9239659287`
- digest `sha256:f13439efca9816151180c4a57c4b5eb87c1667787d238fb1145cbfb18cbc40c3`

The deployed `playtest-info.json` stamp was created from exact canonical:
`de2e62835e79567b4bbfc079a372ce2af4ee0879`

The deployed build is QA-only. Deployment does not imply owner physical acceptance or Android acceptance.

## Current product gate

**Owner playtest is now the highest-value next evidence.**

Recommended lightweight pass:
- one normal Heartland run;
- County Fair or Gullwind Boardwalk if convenient;
- Supercell/Derecho if convenient;
- notice storm readability, destruction payoff, controls, pause/results, and anything that feels cheap, confusing, frustrating, or especially fun.

Feedback should become bounded product hypotheses/tasks, not automatic code mutation.

## Likely next quality work after owner feedback

Current candidates:
- tactile MOO-LAH + Storm Triangle reward/purchase presentation;
- Secret Moo Level legendary-stage identity;
- broader world density/material repetition;
- bounded Tornado material-richness and small results-typography polish where the playtest supports it.

Large new systems remain held.

## Product direction

**Severe Weather Warning** is a mobile arcade destruction game with light action RPG progression.

Player fantasy: **YOU ARE THE STORM**.

Art thesis: **storm-charged stylized Americana**.

Current priority is reducing prototype tells and increasing commercial coherence, not widening systems.

## Protection law

Unless an exact task reopens it, protect steering/input/camera, storm movement, Pull/Gust/Grid Zap, scoring/campaign truth, target health/damage/collision/coordinates, Cow safety, pause/reset lifecycle, and local-first progression.

Presentation may amplify gameplay truth. It may not become gameplay authority.

## Physical acceptance

Browser/CI acceptance is not Android physical acceptance. Owner playtest/physical acceptance remains the next separate gate.
