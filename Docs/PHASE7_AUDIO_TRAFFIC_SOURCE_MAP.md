# Phase 7: Audio & Traffic Subsystems Modularization — Source Map

This document outlines the architecture, source files, and contracts for Modernization Phase 7: Audio & Ambient Traffic.

---

## 1. Directory Structure

```
src/
├── audio/
│   ├── audio-contracts.ts
│   └── audio-system.ts
└── gameplay/
    └── traffic/
        ├── traffic-contracts.ts
        ├── traffic-system.ts
        └── traffic-system.test.ts
```

---

## 2. Core Subsystems

### `AudioSystem` (`src/audio/audio-system.ts`)
* Manages Web Audio context, master/sfx/ambient/ui gain stages, sprite cues, and volume states.
* Registers sound cue definitions (`wind_roar`, `thunder_clap`, `transformer_blowout`, `building_collapse`, `bovine_signature`, `zap_arc`, `gust_shockwave`, `vortex_pull`, `combo_milestone`).
* Provides synthesizer fallback capability when offline.

### `TrafficSystem` (`src/gameplay/traffic/traffic-system.ts`)
* Manages ambient vehicle fleet across county road network waypoints.
* Supports all four authored models: `town-car`, `pickup-truck`, `news-van`, `storm-chaser-vehicle`.
* Enforces the **First Law: Nothing that moves is ever harmed.**
* Implements dynamic panic flee reactions: vehicles detect approaching vortex funnels within 60m and accelerate away along road lanes.

---

## 3. Bridge Contract (`__SW_PHASE7_AUDIO_TRAFFIC_BRIDGE__`)

* **Marker:** `MODERNIZATION_PHASE7_AUDIO_TRAFFIC_V1`
* **Inlined Region:** `[SW:ARCH:PHASE7_AUDIO_TRAFFIC_BRIDGE]` in `MechanicsLab/SevereWeather_Warning.html`.
* **Adapter Integration:** Attached via `LegacyRuntimeAdapter.attachAudioTraffic(audio, traffic)`.
