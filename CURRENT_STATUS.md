# Severe Weather Warning Current Status

**Last updated:** 2026-08-08 10:23 America/Chicago  
**Repository:** `lybyerc-lab/Severe-Warning`  
**Primary target:** Android landscape  
**Current production direction:** guarded PlayCanvas presentation migration  
**Gameplay authority during migration:** accepted legacy Severe Weather runtime  
**Fast QA lane:** GitHub Pages `/Severe-Warning/playcanvas/`

## Canonical identity

The full product name is **Severe Weather Warning**.

- The player directly controls the storm.
- `Heartland` is campaign terminology, not the product title.
- The response is a media circus, not combat.
- People remain protected and are never targets.
- Animals and media crews remain invincible/non-targetable.
- Android landscape remains the primary design target.

## Current architecture truth

PlayCanvas is the selected production-renderer direction, but the migration is intentionally hybrid.

The accepted legacy runtime still owns:

- storm movement
- Pull, Gust, and Grid Zap execution
- health and authoritative destruction stages
- score and combo
- the three-minute warning clock
- campaign/progression state
- Cow 17 safety and accepted animal behavior
- reset/cleanup authority

The PlayCanvas slice currently owns visible presentation through an explicit same-origin authority bridge. It must not become a second gameplay authority by accident.

## Frozen behavior references

### Gameplay/presentation reference

- Draft PR #26
- Exact reference head: `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`
- Workflow: `31094966986` / Run 6
- Artifact: `severe-weather-presentation-identity-6`
- Debug APK SHA-256: `2b2afa4012601b0bfc763d02a61cdf6a0b3e0ae7d0dd51df5871df8428ae6999`

### Accepted storm-response oracle

- Run 53 source: `8d070e21cfe7720353ec842a02f1179bc33e9181`
- Pull peak tree tilt: `0.4218329627222749 rad`
- Gust peak tree tilt: `0.3673336055836977 rad`
- Pull max inward light-prop displacement: `5.374028004530404`
- Pull max tangential/orbit displacement: `1.340381940964075`
- Gust max outward light-prop displacement: `5.042881747270892`

Do not retune those values during unrelated PlayCanvas presentation work.

### Rotation-stability oracle

- Exact corrected source: `f5f01678595bf857840759604f362c93f62598e8`
- PlayCanvas Run 62 / `31222412094`
- Camera release drift: `0`
- Cow 17 landed in about `3050 ms`
- Cow 17 remained safe and grounded while the storm stayed nearby

## Latest sealed PlayCanvas destruction candidate

Draft PR #37: **Add staged structure breakup and debris mass hierarchy**

- Exact tested/promoted source: `8d390f04223faaa268040afbeaa9eff885a81786`
- PlayCanvas Run 76 / `31259029449`: PASS
- Artifact: `severe-weather-playcanvas-slice-76`
- Artifact ID: `9022302146`
- Artifact digest: `sha256:a93cbd962eacb59db434a774184bdd3b7a15dbc6b4cb6fe2230d10823f864289`
- Main static: `79/79`
- Multi-structure static: `19/19`
- Inherited storm browser QA: `61/61`
- Camera/Cow rotation QA: `11/11`
- Multi-structure V2 browser QA: `22/22`
- Console/page errors: none
- Dedicated destruction sequence score: `0 -> 3784`
- Two authoritative structures damaged; storefront destroyed
- Reset clean; Cow 17 safe

Observed Run 76 structure hierarchy:

| Class | Mass | Max horizontal | Max rise |
|---|---:|---:|---:|
| trim | 1.1-1.5 | 28.87 | 19.06 |
| roof | 4.8 | 1.95 | 7.98 |
| wall | 7.3 | 1.28 | 0.20 |
| frame | 11.5 | 0.43 | 0.12 |

Assistant review found the staged anatomy and mass hierarchy materially improved over the earlier box-like candidate. Run 75 was intentionally rejected despite automated green because trim rose roughly 120 units and roofs barely lifted; Run 76 corrected that defect before promotion.

## Current public QA deployment

- QA commit: `4822336f207239ae1444de57e85c6b0be8867bea`
- Deploy QA Pages Run 75 / `31259512722`: PASS
- Exact Run 76 artifact re-verification: PASS
- Public root and PlayCanvas metadata verification: PASS

Current acceptance language for PR #37:

- implementation committed: yes
- exact browser QA: passed
- assistant visual/physics review: passed
- public QA deployment: passed
- owner Galaxy browser verdict on this destruction-polish candidate: pending
- PlayCanvas Android APK for this candidate: not built
- physical Android acceptance: no
- merged: no

The owner instruction on 2026-08-08 to proceed with the next step authorizes forward engineering and repository cleanup. It does **not** retroactively convert the pending PR #37 browser verdict into acceptance.

## Next bounded milestone

**PlayCanvas Moo Brew opening / tactical handoff.**

The next implementation should close a remaining Stage 1 production-slice gap without changing gameplay authority:

- preserve the canonical eight-phase Moo Brew opening beats
- run the opening before the accepted authority starts the warning run so cinematic time cannot consume the three-minute gameplay clock
- keep normal QA/bot runs fast by skipping the intro unless explicitly requested
- provide deterministic phase control and evidence for browser QA
- hand off cleanly into the existing PlayCanvas gameplay slice without changing storm position, controls, camera tuning, score, combo, destruction, or Cow 17 safety

Handoff branch: `agent/playcanvas-moo-brew-intro-handoff`.

## Protected open PR chain

The current PlayCanvas lineage is intentionally stacked and unmerged. Do not casually merge, retarget, squash, or rewrite it.

Key current browser-stage references:

- PR #35: rotation-stable storm physics
- PR #36: owner-approved browser-stage multi-structure destruction proof
- PR #37: browser-green staged destruction/mass hierarchy; owner browser verdict pending

Historical Three.js/modernization PRs remain behavior evidence until the PlayCanvas migration is physically accepted.

## Process laws

- repository truth outranks chat memory
- exact source/evidence outranks stale status prose
- one writer per branch
- assistant browser playtests are diagnostic, not physical acceptance
- owner Galaxy testing remains final authority
- no whole-county migration before the bounded production slice earns physical acceptance
