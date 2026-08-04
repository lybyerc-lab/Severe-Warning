# Phase 5 Visual Baseline & Noise Protocol

**Recorded:** 2026-08-04 Central Time  
**Branch:** `agent/phase5-rendering-world-antigravity`  
**Purpose:** Establish fixed visual comparison criteria, noise measurement methodology, and viewport keyframes.

---

## 1. Required Viewports

1. **Desktop Standard**: `1365x768`
2. **Mobile Landscape Primary**: `915x412`
3. **Wide Landscape Regression**: `1280x540` (Ensures title / HUD safe-area containment)

---

## 2. Keyframe Scenarios

1. **Initial Game Presentation**:
   - Camera in elevated tactical angle.
   - Farmstead intact, lighting warm gold, fog distance $0.0075$.
2. **Deterministic Production Hero Scenario**:
   - Tornado funnel active, 4 volumetric layers rotating, 3 suction rings visible.
   - Debris field orbiting funnel.
3. **Hart Farm Stage 1 (Intact)**:
   - Complete barn structure visible with red timber, white trim, intact metal roof.
4. **Hart Farm Stage 3 (Roof Peel)**:
   - Roof panels detaching into wind stream.
5. **Hart Farm Stage 5 (Wreckage)**:
   - Complete wreckage rubble field.
6. **Cow 17 Reading**:
   - Cow 17 in foreground with visible ear tag #17 and Holstein hide pattern.
7. **Results Screen**:
   - Final score, stars, and situation report displayed within safe-area boundaries.

---

## 3. Noise Measurement & Comparison Methodology

- **Repeat-Run Base Noise**: Capture Phase 4 base twice under identical headless WebGL conditions to establish rendering noise floor ($\approx 0.00\% - 0.05\%$).
- **Head vs Base Threshold**: Phase 5 candidate visual diff must not exceed repeat-run noise + 0.1% margin.
- **Semantic Assertions**: Every visual check is coupled with snapshot probes verifying exact object counts, light intensities, camera FOV, and material counts.
