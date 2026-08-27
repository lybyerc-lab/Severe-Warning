import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GlbBuilder } from './glb-builder.mjs';

const modelsDir = path.resolve('assets/models');

async function saveGlb(filename, builder) {
  const buffer = builder.toGlbBuffer();
  const target = path.join(modelsDir, filename);
  await writeFile(target, buffer);
  console.log(`✓ Generated ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// 1. CRAFTSMAN-HOUSE & CRAFTSMAN-HOUSE-WRECK
export async function generateCraftsmanHouse() {
  const b = new GlbBuilder();
  // Foundation (Stone Plinth)
  b.addBox([0, 0.4, 0], [9.4, 0.8, 8.4], '#64748b');
  
  // Main Ground Floor (Sage Green Siding)
  b.addBox([0, 2.2, 0], [9.0, 2.8, 8.0], '#4d7c0f');
  
  // Front Porch Structure
  b.addBox([0, 0.5, 4.8], [7.0, 0.4, 1.8], '#78716c'); // Porch deck
  b.addBox([0, 0.25, 5.8], [3.0, 0.3, 0.6], '#a8a29e'); // Front steps
  
  // Tapered Porch Columns with stone piers
  [-3.0, -1.0, 1.0, 3.0].forEach(px => {
    b.addBox([px, 1.0, 5.4], [0.8, 1.0, 0.8], '#64748b'); // Stone pier
    b.addBox([px, 2.3, 5.4], [0.5, 1.6, 0.5], '#f8fafc'); // White wood column
  });
  
  // Porch Roof Gable
  b.addWedge([0, 3.7, 5.2], [7.6, 1.4, 2.2], '#7f1d1d');
  b.addBox([0, 3.1, 5.2], [7.4, 0.2, 2.0], '#f8fafc'); // Porch soffit trim
  
  // Front Door (Warm Oak) with decorative transom
  b.addBox([0, 1.8, 4.05], [1.4, 2.2, 0.1], '#78350f');
  b.addBox([0, 2.7, 4.06], [1.2, 0.4, 0.08], '#38bdf8'); // Transom window
  b.addCylinder([0.45, 1.7, 4.12], 0.06, 0.06, 0.1, 8, '#f59e0b', [Math.PI/2, 0, 0]); // Brass handle
  
  // Multi-pane Windows with White Trim and Sills
  const windows = [
    [-2.6, 2.2, 4.05, [1.6, 1.6, 0.1]],
    [2.6, 2.2, 4.05, [1.6, 1.6, 0.1]],
    [-4.55, 2.2, 1.2, [0.1, 1.6, 1.6]],
    [-4.55, 2.2, -1.8, [0.1, 1.6, 1.6]],
    [4.55, 2.2, 1.2, [0.1, 1.6, 1.6]],
    [4.55, 2.2, -1.8, [0.1, 1.6, 1.6]],
    [0, 2.2, -4.05, [2.0, 1.4, 0.1]]
  ];
  windows.forEach(([wx, wy, wz, sz]) => {
    b.addBox([wx, wy, wz], sz, '#38bdf8'); // Glass
    b.addBox([wx, wy, wz], [sz[0] > 0.5 ? sz[0] + 0.3 : sz[0] + 0.08, sz[1] + 0.3, sz[2] > 0.5 ? sz[2] + 0.3 : sz[2] + 0.08], '#f8fafc'); // White frame
    b.addBox([wx, wy - sz[1]/2 - 0.08, wz], [sz[0] > 0.5 ? sz[0] + 0.4 : sz[0] + 0.12, 0.12, sz[2] > 0.5 ? sz[2] + 0.4 : sz[2] + 0.12], '#e2e8f0'); // Sill
  });
  
  // Upper Craftsman Roof (Deep Terracotta Brown Gable)
  b.addWedge([0, 5.0, 0], [10.2, 2.8, 8.8], '#7f1d1d');
  b.addBox([0, 3.6, 0], [10.0, 0.2, 8.6], '#f8fafc'); // Eaves Fascia trim
  
  // Gabled Dormer Window
  b.addWedge([0, 5.4, 1.8], [3.2, 1.6, 2.4], '#7f1d1d');
  b.addBox([0, 4.8, 2.8], [2.2, 1.2, 0.1], '#38bdf8');
  b.addBox([0, 4.8, 2.8], [2.4, 1.4, 0.08], '#f8fafc');
  
  // Red Brick Chimney with Flue Pot
  b.addBox([3.2, 5.2, -1.5], [1.2, 4.2, 1.2], '#991b1b');
  b.addBox([3.2, 7.3, -1.5], [1.4, 0.2, 1.4], '#cbd5e1'); // Concrete cap
  b.addCylinder([3.2, 7.6, -1.5], 0.3, 0.35, 0.5, 8, '#78350f'); // Clay flue pot
  
  await saveGlb('craftsman-house.glb', b);

  // Wreck: Collapsed roof, shattered porch columns, debris field
  const bw = new GlbBuilder();
  bw.addBox([0, 0.4, 0], [9.6, 0.8, 8.6], '#64748b'); // Foundation
  bw.addBox([-2, 1.2, -1], [5.0, 1.8, 6.0], '#4d7c0f', [0.1, 0.05, -0.2]); // Shattered wall
  bw.addWedge([2, 1.5, 0], [9.0, 2.0, 8.0], '#7f1d1d', [-0.3, 0.15, 0.4]); // Collapsed roof
  bw.addBox([3, 0.6, 3], [1.2, 3.0, 1.2], '#991b1b', [0.8, 0.3, -0.6]); // Toppled chimney
  bw.addBox([-1, 0.3, 4], [0.8, 0.8, 2.4], '#f8fafc', [0.4, 0.8, 0.2]); // Splintered column
  await saveGlb('craftsman-house-wreck.glb', bw);
}

// 2. CRAFTSMAN-HOUSE-GARAGE & WRECK
export async function generateCraftsmanGarage() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [6.4, 0.6, 6.4], '#64748b');
  b.addBox([0, 1.8, 0], [6.0, 2.4, 6.0], '#4d7c0f');
  
  // Carriage-style Overhead Garage Door with Windows
  b.addBox([0, 1.6, 3.05], [4.6, 2.0, 0.1], '#f8fafc');
  b.addBox([0, 2.2, 3.08], [4.2, 0.5, 0.08], '#38bdf8'); // Window row
  b.addBox([-1.1, 1.3, 3.08], [1.8, 1.0, 0.05], '#cbd5e1'); // Left panel
  b.addBox([1.1, 1.3, 3.08], [1.8, 1.0, 0.05], '#cbd5e1'); // Right panel
  b.addCylinder([0, 1.0, 3.12], 0.06, 0.06, 0.15, 8, '#0f172a'); // Handle
  
  // Garage Roof
  b.addWedge([0, 3.7, 0], [6.8, 1.8, 6.6], '#7f1d1d');
  b.addBox([0, 2.8, 0], [6.6, 0.15, 6.4], '#f8fafc');
  
  // Exterior Lantern Light
  b.addBox([-2.6, 2.2, 3.1], [0.2, 0.4, 0.2], '#f59e0b');
  b.addBox([2.6, 2.2, 3.1], [0.2, 0.4, 0.2], '#f59e0b');
  
  await saveGlb('craftsman-house-garage.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [6.4, 0.6, 6.4], '#64748b');
  bw.addBox([1, 1.0, 0], [4.5, 1.5, 5.0], '#4d7c0f', [-0.2, 0.1, 0.35]);
  bw.addBox([-1.5, 0.5, 2], [4.0, 0.2, 2.0], '#f8fafc', [0.4, 0.2, -0.6]); // Crushed door
  await saveGlb('craftsman-house-garage-wreck.glb', bw);
}

// 3. RANCH-HOUSE & RANCH-HOUSE-WRECK
export async function generateRanchHouse() {
  const b = new GlbBuilder();
  // Low-slung foundation
  b.addBox([0, 0.3, 0], [13.2, 0.6, 7.6], '#64748b');
  
  // Red/Brown Brick Facade with Cream Siding Accent
  b.addBox([0, 1.8, 0], [12.8, 2.4, 7.2], '#b45309'); // Brick main body
  b.addBox([3.5, 2.0, 0], [5.5, 2.0, 7.25], '#fef3c7'); // Siding wing
  
  // Picture Window with Sills
  b.addBox([-3.2, 1.8, 3.65], [3.2, 1.6, 0.1], '#38bdf8');
  b.addBox([-3.2, 1.8, 3.63], [3.5, 1.8, 0.08], '#ffffff');
  b.addBox([-3.2, 0.9, 3.7], [3.6, 0.12, 0.2], '#e2e8f0');
  
  // Front Door & Stoop
  b.addBox([0.5, 1.7, 3.65], [1.2, 2.1, 0.1], '#0369a1'); // Cobalt blue front door
  b.addBox([0.5, 0.25, 4.2], [2.2, 0.3, 1.0], '#94a3b8'); // Stoop
  b.addBox([0.5, 2.8, 4.0], [2.6, 0.15, 1.2], '#f8fafc'); // Overhang canopy
  
  // Additional Bedroom Windows
  const sideWindows = [
    [4.2, 1.8, 3.65, [1.8, 1.4, 0.1]],
    [-6.45, 1.8, 0, [0.1, 1.4, 2.2]],
    [6.45, 1.8, 0, [0.1, 1.4, 2.2]],
    [-3.0, 1.8, -3.65, [2.2, 1.4, 0.1]],
    [3.0, 1.8, -3.65, [2.2, 1.4, 0.1]]
  ];
  sideWindows.forEach(([wx, wy, wz, sz]) => {
    b.addBox([wx, wy, wz], sz, '#38bdf8');
    b.addBox([wx, wy, wz], [sz[0] > 0.5 ? sz[0] + 0.25 : sz[0] + 0.08, sz[1] + 0.25, sz[2] > 0.5 ? sz[2] + 0.25 : sz[2] + 0.08], '#ffffff');
  });
  
  // Low-pitch Hip Roof (Charcoal Shingles)
  b.addWedge([0, 3.8, 0], [13.8, 1.8, 8.0], '#334155');
  b.addBox([0, 2.9, 0], [13.6, 0.15, 7.8], '#f8fafc'); // Fascia trim
  
  // Broad Brick Chimney
  b.addBox([-4.5, 4.0, -1.0], [1.6, 3.2, 1.2], '#9a3412');
  b.addBox([-4.5, 5.6, -1.0], [1.8, 0.2, 1.4], '#cbd5e1');
  
  await saveGlb('ranch-house.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [13.2, 0.6, 7.6], '#64748b');
  bw.addBox([-3, 1.0, 0], [6.5, 1.4, 6.0], '#b45309', [0.1, -0.15, 0.2]);
  bw.addWedge([2, 1.2, 0], [8.0, 1.4, 7.0], '#334155', [-0.25, 0.2, -0.4]);
  bw.addBox([-4.5, 0.5, 2], [1.6, 1.2, 2.5], '#9a3412', [0.6, 0.3, 0.2]); // Shattered chimney
  await saveGlb('ranch-house-wreck.glb', bw);
}

// 4. RANCH-HOUSE-GARAGE & WRECK
export async function generateRanchGarage() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [7.2, 0.6, 6.8], '#64748b');
  b.addBox([0, 1.7, 0], [6.8, 2.2, 6.4], '#b45309');
  
  // Double Garage Door
  b.addBox([0, 1.5, 3.25], [5.4, 1.8, 0.1], '#f8fafc');
  b.addBox([-1.4, 1.5, 3.28], [2.4, 1.4, 0.05], '#e2e8f0');
  b.addBox([1.4, 1.5, 3.28], [2.4, 1.4, 0.05], '#e2e8f0');
  
  // Roof
  b.addWedge([0, 3.4, 0], [7.6, 1.4, 7.0], '#334155');
  b.addBox([0, 2.7, 0], [7.4, 0.15, 6.8], '#f8fafc');
  
  await saveGlb('ranch-house-garage.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [7.2, 0.6, 6.8], '#64748b');
  bw.addBox([0, 0.8, 0], [6.0, 1.2, 5.5], '#b45309', [0.15, 0.05, -0.3]);
  await saveGlb('ranch-house-garage-wreck.glb', bw);
}

// 5. SPLIT-LEVEL-HOUSE & WRECK
export async function generateSplitLevelHouse() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [11.4, 0.6, 7.8], '#64748b');
  
  // Left 2-Story Wing (Blue Slate Siding)
  b.addBox([-3.0, 2.6, 0], [5.0, 4.6, 7.4], '#0369a1');
  
  // Right 1-Story Wing (Cream Brick)
  b.addBox([3.0, 1.8, 0], [5.0, 3.0, 7.4], '#fed7aa');
  
  // Integrated Lower Garage on Left Wing
  b.addBox([-3.0, 1.2, 3.75], [3.6, 1.8, 0.1], '#ffffff');
  b.addBox([-3.0, 1.8, 3.78], [3.2, 0.4, 0.05], '#38bdf8');
  
  // Upper Windows on Left Wing
  b.addBox([-3.0, 3.8, 3.75], [3.2, 1.2, 0.1], '#38bdf8');
  b.addBox([-3.0, 3.8, 3.73], [3.4, 1.4, 0.08], '#ffffff');
  
  // Right Wing Front Door & Picture Window
  b.addBox([1.2, 1.7, 3.75], [1.2, 2.0, 0.1], '#b91c1c'); // Crimson door
  b.addBox([3.8, 1.8, 3.75], [2.2, 1.4, 0.1], '#38bdf8'); // Picture window
  b.addBox([3.8, 1.8, 3.73], [2.4, 1.6, 0.08], '#ffffff');
  
  // Split Rooflines
  b.addWedge([-3.0, 5.5, 0], [5.6, 1.6, 8.0], '#1e293b'); // High roof
  b.addWedge([3.0, 3.9, 0], [5.6, 1.4, 8.0], '#1e293b'); // Lower roof
  
  await saveGlb('split-level-house.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [11.4, 0.6, 7.8], '#64748b');
  bw.addBox([-2, 1.5, 0], [4.5, 2.5, 6.0], '#0369a1', [0.2, 0.1, -0.35]);
  bw.addBox([3, 0.8, 0], [4.8, 1.2, 6.0], '#fed7aa', [-0.1, 0.2, 0.2]);
  await saveGlb('split-level-house-wreck.glb', bw);
}

// 6. HART-FARMHOUSE
export async function generateHartFarmhouse() {
  const b = new GlbBuilder();
  // Stone Foundation
  b.addBox([0, 0.4, 0], [11.4, 0.8, 9.4], '#475569');
  
  // 2-Story Farmhouse Body (Classic White Clapboard)
  b.addBox([0, 3.2, 0], [10.8, 4.8, 8.8], '#f8fafc');
  
  // Wrap-around Covered Porch (Front and Right Side)
  b.addBox([0, 0.5, 5.2], [11.6, 0.3, 2.0], '#78716c'); // Front deck
  b.addBox([5.8, 0.5, 0], [1.8, 0.3, 10.4], '#78716c'); // Side deck
  b.addBox([0, 0.25, 6.4], [3.2, 0.3, 0.6], '#a8a29e'); // Steps
  
  // Turned White Porch Railings and Posts
  [-5.0, -2.5, 0, 2.5, 5.0].forEach(px => {
    b.addBox([px, 1.8, 5.8], [0.25, 2.4, 0.25], '#ffffff');
  });
  b.addBox([0, 1.0, 5.8], [10.4, 0.1, 0.1], '#ffffff'); // Handrail
  b.addBox([0, 3.1, 5.2], [12.0, 0.2, 2.2], '#334155'); // Porch roof
  
  // Red Front Door with Transom
  b.addBox([0, 1.9, 4.45], [1.4, 2.4, 0.1], '#b91c1c');
  b.addBox([0, 2.9, 4.46], [1.2, 0.4, 0.08], '#38bdf8');
  
  // 12-Pane Farmhouse Windows across 2 Floors
  const winPositions = [
    [-3.2, 1.9, 4.45], [3.2, 1.9, 4.45],
    [-3.2, 4.2, 4.45], [0, 4.2, 4.45], [3.2, 4.2, 4.45],
    [-5.45, 1.9, -1.5], [-5.45, 4.2, -1.5],
    [0, 1.9, -4.45], [0, 4.2, -4.45]
  ];
  winPositions.forEach(([wx, wy, wz]) => {
    const isSide = Math.abs(wx) > 5;
    b.addBox([wx, wy, wz], isSide ? [0.1, 1.5, 1.3] : [1.3, 1.5, 0.1], '#38bdf8');
    b.addBox([wx, wy, wz], isSide ? [0.08, 1.7, 1.5] : [1.5, 1.7, 0.08], '#0284c7'); // Dark green shutters
    b.addBox([wx, wy, wz], isSide ? [0.09, 1.6, 1.4] : [1.4, 1.6, 0.09], '#ffffff'); // White sash
  });
  
  // Steep Cross-Gabled Metal Farmhouse Roof (Forest Green)
  b.addWedge([0, 6.8, 0], [11.8, 3.2, 9.8], '#15803d');
  b.addWedge([0, 6.8, 2.0], [4.8, 3.0, 6.0], '#15803d', [0, Math.PI/2, 0]); // Cross-gable
  
  // Dual Red Brick Chimneys with Decorative Corbeling
  [-3.8, 3.8].forEach(cx => {
    b.addBox([cx, 6.8, -1.0], [1.1, 3.6, 1.1], '#991b1b');
    b.addBox([cx, 8.6, -1.0], [1.3, 0.2, 1.3], '#cbd5e1');
  });
  
  await saveGlb('hart-farmhouse.glb', b);
}

export async function run() {
  await generateCraftsmanHouse();
  await generateCraftsmanGarage();
  await generateRanchHouse();
  await generateRanchGarage();
  await generateSplitLevelHouse();
  await generateHartFarmhouse();
}

if (process.argv[1]?.endsWith('generate-residential-models.mjs')) {
  run().catch(console.error);
}
