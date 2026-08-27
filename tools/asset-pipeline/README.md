# Severe Weather Warning — 3D Asset Creation & Pipeline Guide

Welcome to the 3D asset pipeline for **Severe Weather Warning**. This guide covers recommended open-source model builders, styling conventions, destruction pairs, and automated tools.

---

## 1. Recommended Open Source Tools

### 🌟 Blockbench (Recommended for Low-Poly Props & Actors)
- **Download**: [blockbench.net](https://www.blockbench.net/) (Windows / macOS / Linux / Web)
- **Best For**: Vehicles, farm props, street furniture, animals, weather sirens, and coastal boats.
- **Workflow**:
  1. Create a new **Generic Model**.
  2. Build your geometry using low-poly cuboids and cylinders.
  3. Keep the origin `(0, 0, 0)` at the bottom-center of the actor's footprint (ground level).
  4. Export directly via **File → Export → Export glTF Model (.glb)** into `assets/models/`.

### 🌟 Blender (Recommended for Complex Landmarks & Architecture)
- **Download**: [blender.org](https://www.blender.org/)
- **Best For**: Multi-tier buildings (courthouses, industrial refineries, water towers, bridges).
- **Export Settings**:
  - Format: **glTF Binary (.glb)**
  - Transform: **+Y Up**
  - Geometry: **Apply Modifiers**, **Include Normals**
  - Materials: **Export PBR Materials**

---

## 2. Model Conventions & Destruction Pairs

Every destructible prop in the game follows a **2-file convention**:
1. `[actor-name].glb`: The pristine, standing actor.
2. `[actor-name]-wreck.glb`: The shattered, tilted, or blown-open wreckage model displayed after tornado impact.

### Target Budgets for Mobile WebGL (Samsung Galaxy & Android WebView)
- **Vertex Budget**: 150 – 2,500 vertices per model.
- **File Size**: Under 25 KB per prop / Under 65 KB for major landmarks.
- **PBR Roughness**: `0.5 – 0.8` for wood/concrete, `0.2 – 0.4` for metal/vehicles.

---

## 3. Automated CLI Tools

Run these npm scripts anytime from the project root:

```bash
# Validate all glTF models, check binary headers, vertex counts, and wreck pairs
pnpm run models:validate

# Build & bundle all models into the web distribution
pnpm run build
```

---

## 4. Curated Open Source Asset Packs (CC0)
- **[Kenney Game Assets](https://kenney.nl/assets)**: Low-poly cars, farm kits, urban kits, watercraft (CC0 Public Domain).
- **[Poly Pizza](https://poly.pizza/)**: Low-poly CC0 3D models searchable by tag.
