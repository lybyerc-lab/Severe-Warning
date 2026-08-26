# Phase 8: Full Physics & Engine Modularization — Source Map

This document outlines the architecture, source files, and contracts for Modernization Phase 8: Full Physics & Engine Subsystems.

---

## 1. Directory Structure

```
src/
├── gameplay/
│   ├── physics/
│   │   ├── tornado-physics-contracts.ts
│   │   ├── tornado-physics-system.ts
│   │   ├── collision-detection-system.ts
│   │   └── tornado-physics-system.test.ts
│   └── loop/
│       ├── game-loop-contracts.ts
│       └── game-loop-controller.ts
└── presentation/
    └── vfx/
        ├── particle-system-contracts.ts
        └── particle-system.ts
```

---

## 2. Core Subsystems

### `TornadoPhysicsSystem` (`src/gameplay/physics/tornado-physics-system.ts`)
* Implements the **Rankine Vortex** profile:
  * Solid-body rotation inside core radius ($v \propto r$).
  * Irrotational decay outside core radius ($v \propto 1/r$).
* Calculates radial inward suction force vectors and vertical updrafts.
* Manages debris particle generation, cyclonic acceleration, and ground bounce physics.

### `CollisionDetectionSystem` (`src/gameplay/physics/collision-detection-system.ts`)
* Implements the **`damageTarget` chokepoint** for all environmental destruction.
* Strictly enforces the **First Law Invariant: Nothing that moves is ever harmed.**
* Handles multi-stage degradation for complex setpieces (Hart Farm barn & Silo).

### `ParticleSystem` (`src/presentation/vfx/particle-system.ts`)
* Manages high-performance transient particle lifecycles for electrical sparks and ground dust clouds.

### `GameLoopController` (`src/gameplay/loop/game-loop-controller.ts`)
* Orchestrates frame tick execution, FPS sampling, and game lifecycle state (`idle`, `running`, `paused`, `results`).

---

## 3. Bridge Contract (`__SW_PHASE8_ENGINE_BRIDGE__`)

* **Marker:** `MODERNIZATION_PHASE8_ENGINE_V1`
* **Inlined Region:** `[SW:ARCH:PHASE8_ENGINE_BRIDGE]` in `MechanicsLab/SevereWeather_3D_Lab.html`.
* **Adapter Integration:** Attached via `LegacyRuntimeAdapter.attachEngine(physics, vfx, loop)`.
