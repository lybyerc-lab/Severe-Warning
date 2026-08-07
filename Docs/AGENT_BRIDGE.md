# Severe Weather Warning Cross-Agent Project Bridge

**Last updated:** 2026-08-07T11:46:00-05:00  
**Purpose:** Live coordination bridge between Antigravity and ChatGPT for Severe Weather Warning.

---

## 1. Grounding and repository state

- **Product:** Severe Weather Warning
- **Repository:** `lybyerc-lab/Severe-Warning`
- **Current coordination branch:** `agent/playcanvas-prairie-expansion-handoff`
- **Exact sealed technical parent:** `540087c3ea08c56b3b47dffb0b448608a934c350`
- **Required Antigravity work branch:** `agent/playcanvas-prairie-expansion-antigravity`
- **AG PR target:** `agent/playcanvas-prairie-expansion-handoff`
- **Detailed assignment:** `Docs/ANTIGRAVITY_PLAYCANVAS_MAP_EXPANSION_HANDOFF.md`
- **Live PlayCanvas QA path:** `https://lybyerc-lab.github.io/Severe-Warning/playcanvas/`
- **Current stage:** Browser-playable PlayCanvas slice exists; larger Prairie Junction test-world expansion is next. Android/physical acceptance has not begun.

---

## 2. Sealed PlayCanvas checkpoint

Current owner-tested browser candidate:

- source SHA: `540087c3ea08c56b3b47dffb0b448608a934c350`
- implementation PR: #32, draft/unmerged
- PlayCanvas CI: Run 34 / `31173231741`
- artifact: `severe-weather-playcanvas-slice-34`
- artifact digest: `sha256:f7f90a48b6bd4a4b67b2523d90ec914ad291ad969c93d47d3a70dea7168c458d`
- static verification: 50/50
- browser QA: 44/44
- QA deployment: Run 69 / `31173467773`

Owner hands-on verdict:

- graphics are a major improvement
- corrected upright tornado is accepted as direction
- first camera-follow approach felt wrong because steering/camera rotation were too tightly coupled
- current one-stick third-person chase camera feels better and pretty good in the small test arena
- camera should be polished later against a larger world rather than continually tuned in the current arena

The current camera values are therefore a testing-arena baseline, not the final county-scale tune.

---

## 3. Current Antigravity mission

Expand the PlayCanvas Prairie Junction testing world while preserving the current camera baseline and gameplay authority.

The expanded test world must provide:

- materially larger terrain footprint
- connected road network with multiple junctions
- several visually distinct areas/landmarks
- enough straight travel and sweeping-turn room to expose camera behavior at scale
- retained Moo-Brew proxy, Cow 17, vehicle, electrical target, abilities, score/combo, timer, and reset
- road/terrain/tornado clearance proof away from the original intersection
- mobile-minded entity/light/material discipline

Do not port the whole county.
Do not rebuild storm physics in this assignment.
Do not create a second gameplay authority.
Do not promote the AG branch to the QA site before artifact review.

---

## 4. Camera protection

Keep the sealed source camera values unless a blocking measured defect requires an isolated fix:

- horizontal offset X 30
- horizontal offset Z 36
- height 28
- look target Y 3.6
- turn rate 1.05 rad/s
- heading dead zone 10 degrees
- movement threshold 0.28
- intent threshold 0.12
- max camera time step 0.12 s

Map expansion must not make the visible storm materially faster simply by stretching the presentation transform. Compare deterministic displacement against Run 34 and stay within the detailed handoff tolerance.

---

## 5. Gameplay authority protection

The legacy accepted runtime still owns:

- storm movement
- Pull
- Gust
- Zap
- score/combo
- warning clock
- destruction state
- Cow 17 safety
- reset/cleanup

PlayCanvas owns visible presentation only during this migration slice.

The frozen physical behavior reference remains PR #26 Run 6 / source `1f4292c05b3ff5c407d77d1f3eaa6493e43b9d3f`.

---

## 6. Evidence contract

Antigravity must return an exact-head draft PR plus:

- starting/final SHA
- changed-file list
- workflow run ID/number
- PlayCanvas version/revision proof
- artifact name/ID/digest
- static and browser pass counts
- Run 34 vs candidate deterministic visible-displacement comparison
- map/terrain extents
- road-junction count
- entity count
- spawn, long-travel, sweeping-turn, and separated road/terrain screenshots
- manual screenshot verdict
- explicit Android status: not built, not physically accepted

A green marker without executor evidence or visual evidence is insufficient.

---

## 7. Coordination law

- one writer per branch
- AG writes only `agent/playcanvas-prairie-expansion-antigravity`
- ChatGPT owns the handoff/inspection lane and later guarded QA promotion
- do not merge PR #32 or the older #24/#25/#26 stack as part of this assignment
- do not weaken tests to obtain green
- repository evidence outranks chat summaries