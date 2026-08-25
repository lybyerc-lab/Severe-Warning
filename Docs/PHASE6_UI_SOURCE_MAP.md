# Phase 6: HUD & UI TypeScript Modularization — Source Map

This document outlines the architecture, source files, and contracts for Modernization Phase 6: HUD & UI.

---

## 1. Directory Structure

```
src/ui/
├── hud/
│   ├── hud-contracts.ts
│   └── hud-system.ts
├── feedback/
│   ├── rampage-feedback-contracts.ts
│   └── rampage-feedback-system.ts
├── transitions/
│   ├── district-transition-contracts.ts
│   └── district-transition-system.ts
├── results/
│   ├── results-contracts.ts
│   └── results-system.ts
├── ui-contracts.ts
└── ui-system.ts
```

---

## 2. Core Subsystems

### `HudSystem` (`src/ui/hud/hud-system.ts`)
* Manages game timers (`remainingSeconds`, formatted `MM:SS` string, warning state).
* Tracks live score, combo multiplier, decay progress, and EF-scale level indicators (`EF-0` through `EF-5`).
* Tracks ability button cooldowns (`Pull`, `Gust`, `Zap`) and active objective checklists.

### `RampageFeedbackSystem` (`src/ui/feedback/rampage-feedback-system.ts`)
* Manages floating 3D score popups spawned at damage locations.
* Tracks combo milestone tiers (0 to 5) and associated banner alerts.

### `DistrictTransitionSystem` (`src/ui/transitions/district-transition-system.ts`)
* Manages district arrival banners, EAS headlines, and stage alerts.

### `ResultsSystem` (`src/ui/results/results-system.ts`)
* Manages post-run situation reports, star ratings, and grade evaluations.

---

## 3. Bridge Contract (`__SW_PHASE6_UI_BRIDGE__`)

* **Marker:** `MODERNIZATION_PHASE6_UI_V1`
* **Inlined Region:** `[SW:ARCH:PHASE6_UI_BRIDGE]` in `MechanicsLab/SevereWeather_3D_Lab.html`.
* **Adapter Integration:** Attached via `LegacyRuntimeAdapter.attachUi(ui)`.
