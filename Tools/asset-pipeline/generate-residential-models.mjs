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
  // Foundation (Chiseled Fieldstone Plinth)
  b.addBox([0, 0.4, 0], [9.5, 0.8, 8.5], '#475569');
  b.addBox([0, 0.82, 0], [9.6, 0.1, 8.6], '#64748b'); // Water table band
  
  // Main Ground Floor (Sage Green Lap Siding)
  b.addBox([0, 2.3, 0], [9.0, 2.9, 8.0], '#4d7c0f');
  
  // White Corner Trim Boards
  const corners = [[-4.52, -4.02], [4.52, -4.02], [-4.52, 4.02], [4.52, 4.02]];
  corners.forEach(([cx, cz]) => {
    b.addBox([cx, 2.3, cz], [0.35, 2.9, 0.35], '#f8fafc');
  });

  // Front Porch Structure
  b.addBox([0, 0.5, 4.9], [7.2, 0.35, 2.0], '#78716c'); // Porch deck
  b.addBox([0, 0.25, 6.0], [3.2, 0.25, 0.6], '#94a3b8'); // Front steps
  
  // Tapered Craftsman Porch Columns with stone piers & chamfered balustrades
  [-3.0, -1.0, 1.0, 3.0].forEach(px => {
    b.addBox([px, 1.0, 5.5], [0.9, 1.0, 0.9], '#475569'); // Stone pier
    b.addBox([px, 1.55, 5.5], [0.95, 0.1, 0.95], '#cbd5e1'); // Stone cap
    b.addBox([px, 2.4, 5.5], [0.55, 1.6, 0.55], '#f8fafc'); // Tapered wood column
  });
  // Porch Railings between piers
  [[-2.0, 5.5], [2.0, 5.5]].forEach(([rx, rz]) => {
    b.addBox([rx, 1.1, rz], [1.1, 0.08, 0.08], '#f8fafc'); // Top rail
    b.addBox([rx, 0.75, rz], [1.1, 0.06, 0.06], '#f8fafc'); // Bottom rail
    for (let bx = rx - 0.4; bx <= rx + 0.4; bx += 0.22) {
      b.addBox([bx, 0.92, rz], [0.06, 0.3, 0.06], '#f8fafc'); // Balusters
    }
  });
  
  // Porch Roof Gable & Exposed Rafter Tails
  b.addWedge([0, 3.8, 5.3], [7.8, 1.5, 2.4], '#7f1d1d');
  b.addBox([0, 3.15, 5.3], [7.6, 0.18, 2.2], '#f8fafc'); // Porch soffit trim
  
  // Front Door (Warm Oak) with decorative transom & brass hardware
  b.addBox([0, 1.85, 4.05], [1.4, 2.3, 0.1], '#78350f');
  b.addBox([0, 2.75, 4.06], [1.2, 0.45, 0.08], '#38bdf8'); // Transom window
  b.addBox([0, 2.75, 4.08], [0.04, 0.45, 0.09], '#f8fafc'); // Transom divider
  b.addCylinder([0.45, 1.7, 4.14], 0.05, 0.05, 0.12, 8, '#f59e0b', [Math.PI/2, 0, 0]); // Brass latch
  
  // Carriage Lantern Lights on Porch
  [-0.9, 0.9].forEach(lx => {
    b.addBox([lx, 2.2, 4.15], [0.2, 0.35, 0.15], '#0f172a');
    b.addBox([lx, 2.2, 4.22], [0.12, 0.22, 0.05], '#fde047'); // Glowing lantern glass
  });
  
  // Multi-pane Windows with Divided Muntin Grids, White Trim and Sills
  const windows = [
    [-2.6, 2.2, 4.05, [1.6, 1.6, 0.1]],
    [2.6, 2.2, 4.05, [1.6, 1.6, 0.1]],
    [-4.55, 2.2, 1.2, [0.1, 1.6, 1.6]],
    [-4.55, 2.2, -1.8, [0.1, 1.6, 1.6]],
    [4.55, 2.2, 1.2, [0.1, 1.6, 1.6]],
    [4.55, 2.2, -1.8, [0.1, 1.6, 1.6]],
    [0, 2.2, -4.05, [2.2, 1.4, 0.1]]
  ];
  windows.forEach(([wx, wy, wz, sz]) => {
    const isSide = sz[0] < 0.5;
    b.addBox([wx, wy, wz], sz, '#38bdf8'); // Glass
    b.addBox([wx, wy, wz], [isSide ? 0.12 : sz[0] + 0.32, sz[1] + 0.32, isSide ? sz[2] + 0.32 : 0.12], '#f8fafc'); // White frame
    b.addBox([wx, wy - sz[1]/2 - 0.08, wz], [isSide ? 0.16 : sz[0] + 0.44, 0.12, isSide ? sz[2] + 0.44 : 0.16], '#e2e8f0'); // Sill
    // Muntin crossbars (Divided Light Windows)
    b.addBox([wx, wy, wz], [isSide ? 0.13 : sz[0], 0.05, isSide ? sz[2] : 0.13], '#f8fafc'); // Horizontal muntin
    b.addBox([wx, wy, wz], [isSide ? 0.13 : 0.05, sz[1], isSide ? 0.05 : 0.13], '#f8fafc'); // Vertical muntin
  });
  
  // Upper Craftsman Roof (Terracotta Gable with Ridge Cap)
  b.addWedge([0, 5.1, 0], [10.4, 2.9, 9.0], '#7f1d1d');
  b.addBox([0, 3.65, 0], [10.2, 0.2, 8.8], '#f8fafc'); // Fascia trim
  b.addBox([0, 6.55, 0], [0.3, 0.15, 9.1], '#450a0a'); // Ridge cap
  
  // Gutters & Downspouts
  [-5.15, 5.15].forEach(gx => {
    b.addCylinder([gx, 3.65, 0], 0.1, 0.1, 9.0, 6, '#e2e8f0', [Math.PI/2, 0, 0]); // Gutter trough
    b.addCylinder([gx, 1.9, 4.3], 0.06, 0.06, 3.5, 6, '#e2e8f0'); // Vertical downspout
    b.addCylinder([gx, 1.9, -4.3], 0.06, 0.06, 3.5, 6, '#e2e8f0');
  });

  // Gabled Dormer Window
  b.addWedge([0, 5.5, 2.0], [3.4, 1.7, 2.5], '#7f1d1d');
  b.addBox([0, 4.85, 3.0], [2.2, 1.2, 0.1], '#38bdf8');
  b.addBox([0, 4.85, 3.0], [2.4, 1.4, 0.08], '#f8fafc');
  b.addBox([0, 4.85, 3.02], [2.2, 0.04, 0.09], '#f8fafc');
  b.addBox([0, 4.85, 3.02], [0.04, 1.2, 0.09], '#f8fafc');
  
  // Red Brick Chimney with Stepped Shoulder, Concrete Cap & Clay Flue Pot
  b.addBox([3.3, 5.2, -1.5], [1.3, 4.4, 1.3], '#991b1b');
  b.addBox([3.3, 7.45, -1.5], [1.5, 0.2, 1.5], '#cbd5e1'); // Concrete cap
  b.addCylinder([3.3, 7.8, -1.5], 0.32, 0.36, 0.55, 8, '#78350f'); // Clay flue pot
  
  await saveGlb('craftsman-house.glb', b);

  // Wreck: Collapsed roof, shattered porch columns, debris field
  const bw = new GlbBuilder();
  bw.addBox([0, 0.4, 0], [9.6, 0.8, 8.6], '#475569'); // Foundation
  bw.addBox([-2, 1.2, -1], [5.0, 1.8, 6.0], '#4d7c0f', [0.1, 0.05, -0.2]); // Shattered wall
  bw.addWedge([2, 1.5, 0], [9.0, 2.0, 8.0], '#7f1d1d', [-0.3, 0.15, 0.4]); // Collapsed roof
  bw.addBox([3.3, 0.6, 3], [1.3, 3.0, 1.3], '#991b1b', [0.8, 0.3, -0.6]); // Toppled chimney
  bw.addBox([-1, 0.3, 4], [0.8, 0.8, 2.4], '#f8fafc', [0.4, 0.8, 0.2]); // Splintered column
  await saveGlb('craftsman-house-wreck.glb', bw);
}

// 2. CRAFTSMAN-HOUSE-GARAGE & WRECK
export async function generateCraftsmanGarage() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [6.5, 0.6, 6.5], '#475569');
  b.addBox([0, 1.9, 0], [6.0, 2.6, 6.0], '#4d7c0f');
  
  // Carriage-style Overhead Garage Door with Windows & Panel Relief
  b.addBox([0, 1.6, 3.05], [4.8, 2.1, 0.1], '#f8fafc');
  b.addBox([0, 2.3, 3.08], [4.4, 0.45, 0.08], '#38bdf8'); // Window row
  [-1.6, -0.55, 0.55, 1.6].forEach(wx => {
    b.addBox([wx, 2.3, 3.09], [0.04, 0.45, 0.09], '#f8fafc'); // Window divider
  });
  b.addBox([-1.1, 1.3, 3.08], [1.9, 1.1, 0.05], '#e2e8f0'); // Left embossed panel
  b.addBox([1.1, 1.3, 3.08], [1.9, 1.1, 0.05], '#e2e8f0'); // Right embossed panel
  b.addCylinder([0, 1.0, 3.14], 0.05, 0.05, 0.2, 8, '#0f172a'); // Black iron handle
  
  // Garage Roof
  b.addWedge([0, 3.8, 0], [7.0, 1.9, 6.8], '#7f1d1d');
  b.addBox([0, 2.9, 0], [6.8, 0.18, 6.6], '#f8fafc');
  
  // Exterior Lantern Light
  b.addBox([-2.6, 2.3, 3.15], [0.2, 0.35, 0.15], '#0f172a');
  b.addBox([-2.6, 2.3, 3.22], [0.12, 0.22, 0.05], '#fde047');
  b.addBox([2.6, 2.3, 3.15], [0.2, 0.35, 0.15], '#0f172a');
  b.addBox([2.6, 2.3, 3.22], [0.12, 0.22, 0.05], '#fde047');
  
  await saveGlb('craftsman-house-garage.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [6.5, 0.6, 6.5], '#475569');
  bw.addBox([1, 1.0, 0], [4.5, 1.5, 5.0], '#4d7c0f', [-0.2, 0.1, 0.35]);
  bw.addBox([-1.5, 0.5, 2], [4.0, 0.2, 2.0], '#f8fafc', [0.4, 0.2, -0.6]);
  await saveGlb('craftsman-house-garage-wreck.glb', bw);
}

// 3. RANCH-HOUSE & RANCH-HOUSE-WRECK
export async function generateRanchHouse() {
  const b = new GlbBuilder();
  // Foundation
  b.addBox([0, 0.35, 0], [13.4, 0.7, 7.8], '#475569');
  
  // Red/Brown Brick Main Body with Cream Siding Wing
  b.addBox([0, 1.9, 0], [12.8, 2.5, 7.2], '#b45309');
  b.addBox([3.6, 2.0, 0], [5.6, 2.1, 7.28], '#fef3c7'); // Cream siding wing
  
  // Large Multi-Pane Picture Window
  b.addBox([-3.2, 1.85, 3.65], [3.4, 1.7, 0.1], '#38bdf8');
  b.addBox([-3.2, 1.85, 3.63], [3.7, 1.9, 0.08], '#ffffff');
  b.addBox([-3.2, 0.95, 3.72], [3.8, 0.14, 0.22], '#cbd5e1'); // Projecting sill
  [-4.05, -2.35].forEach(mx => {
    b.addBox([mx, 1.85, 3.67], [0.05, 1.7, 0.08], '#ffffff'); // Vertical grid
  });
  
  // Front Door & Stoop Portico
  b.addBox([0.5, 1.75, 3.65], [1.3, 2.2, 0.1], '#0369a1'); // Cobalt blue front door
  b.addCylinder([0.95, 1.6, 3.72], 0.05, 0.05, 0.1, 8, '#f59e0b', [Math.PI/2, 0, 0]); // Brass handle
  b.addBox([0.5, 0.25, 4.3], [2.4, 0.3, 1.2], '#64748b'); // Stoop
  b.addBox([0.5, 2.9, 4.1], [2.8, 0.18, 1.4], '#f8fafc'); // Overhang portico
  
  // Decorative Shutters & Side Windows
  const sideWindows = [
    [4.2, 1.85, 3.65, [1.8, 1.4, 0.1]],
    [-6.45, 1.85, 0, [0.1, 1.4, 2.2]],
    [6.45, 1.85, 0, [0.1, 1.4, 2.2]],
    [-3.0, 1.85, -3.65, [2.2, 1.4, 0.1]],
    [3.0, 1.85, -3.65, [2.2, 1.4, 0.1]]
  ];
  sideWindows.forEach(([wx, wy, wz, sz]) => {
    const isSide = sz[0] < 0.5;
    b.addBox([wx, wy, wz], sz, '#38bdf8');
    b.addBox([wx, wy, wz], [isSide ? 0.12 : sz[0] + 0.26, sz[1] + 0.26, isSide ? sz[2] + 0.26 : 0.12], '#ffffff');
    // Dark Brown Raised Shutters on front window
    if (!isSide && wz > 0) {
      b.addBox([wx - sz[0]/2 - 0.25, wy, wz + 0.04], [0.45, sz[1] + 0.2, 0.06], '#451a03');
      b.addBox([wx + sz[0]/2 + 0.25, wy, wz + 0.04], [0.45, sz[1] + 0.2, 0.06], '#451a03');
    }
  });
  
  // Low-pitch Hip Roof with Shingle Ridge
  b.addWedge([0, 3.9, 0], [14.0, 1.9, 8.2], '#334155');
  b.addBox([0, 2.95, 0], [13.8, 0.18, 8.0], '#f8fafc');
  
  // Broad Masonry Brick Chimney
  b.addBox([-4.5, 4.1, -1.0], [1.7, 3.4, 1.3], '#9a3412');
  b.addBox([-4.5, 5.8, -1.0], [1.9, 0.2, 1.5], '#cbd5e1');
  
  await saveGlb('ranch-house.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.35, 0], [13.4, 0.7, 7.8], '#475569');
  bw.addBox([-3, 1.0, 0], [6.5, 1.4, 6.0], '#b45309', [0.1, -0.15, 0.2]);
  bw.addWedge([2, 1.2, 0], [8.0, 1.4, 7.0], '#334155', [-0.25, 0.2, -0.4]);
  bw.addBox([-4.5, 0.5, 2], [1.7, 1.2, 2.5], '#9a3412', [0.6, 0.3, 0.2]);
  await saveGlb('ranch-house-wreck.glb', bw);
}

// 4. RANCH-HOUSE-GARAGE & WRECK
export async function generateRanchGarage() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [7.4, 0.6, 7.0], '#475569');
  b.addBox([0, 1.8, 0], [6.8, 2.4, 6.4], '#b45309');
  
  // Double Garage Door with Windows
  b.addBox([0, 1.55, 3.25], [5.6, 1.9, 0.1], '#f8fafc');
  b.addBox([0, 2.15, 3.28], [5.2, 0.4, 0.08], '#38bdf8');
  b.addBox([-1.4, 1.4, 3.28], [2.4, 1.0, 0.05], '#e2e8f0');
  b.addBox([1.4, 1.4, 3.28], [2.4, 1.0, 0.05], '#e2e8f0');
  
  // Roof
  b.addWedge([0, 3.5, 0], [7.8, 1.5, 7.2], '#334155');
  b.addBox([0, 2.75, 0], [7.6, 0.18, 7.0], '#f8fafc');
  
  await saveGlb('ranch-house-garage.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [7.4, 0.6, 7.0], '#475569');
  bw.addBox([0, 0.8, 0], [6.0, 1.2, 5.5], '#b45309', [0.15, 0.05, -0.3]);
  await saveGlb('ranch-house-garage-wreck.glb', bw);
}

// 5. SPLIT-LEVEL-HOUSE & WRECK
export async function generateSplitLevelHouse() {
  const b = new GlbBuilder();
  b.addBox([0, 0.35, 0], [11.6, 0.7, 8.0], '#475569');
  
  // Left 2-Story Wing (Blue Slate Siding)
  b.addBox([-3.0, 2.7, 0], [5.2, 4.8, 7.4], '#0369a1');
  
  // Right 1-Story Wing (Cream Brick)
  b.addBox([3.0, 1.9, 0], [5.2, 3.2, 7.4], '#fed7aa');
  
  // Integrated Lower Garage on Left Wing
  b.addBox([-3.0, 1.25, 3.75], [3.8, 1.9, 0.1], '#ffffff');
  b.addBox([-3.0, 1.85, 3.78], [3.4, 0.45, 0.05], '#38bdf8');
  
  // Upper Windows on Left Wing with Divided Lights
  b.addBox([-3.0, 3.9, 3.75], [3.2, 1.3, 0.1], '#38bdf8');
  b.addBox([-3.0, 3.9, 3.73], [3.5, 1.5, 0.08], '#ffffff');
  b.addBox([-3.0, 3.9, 3.77], [3.2, 0.04, 0.08], '#ffffff');
  
  // Right Wing Front Door & Picture Window
  b.addBox([1.2, 1.75, 3.75], [1.3, 2.1, 0.1], '#b91c1c');
  b.addBox([3.8, 1.85, 3.75], [2.4, 1.5, 0.1], '#38bdf8');
  b.addBox([3.8, 1.85, 3.73], [2.6, 1.7, 0.08], '#ffffff');
  
  // Split Rooflines
  b.addWedge([-3.0, 5.7, 0], [5.8, 1.7, 8.2], '#1e293b');
  b.addWedge([3.0, 4.0, 0], [5.8, 1.5, 8.2], '#1e293b');
  
  await saveGlb('split-level-house.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.35, 0], [11.6, 0.7, 8.0], '#475569');
  bw.addBox([-2, 1.5, 0], [4.5, 2.5, 6.0], '#0369a1', [0.2, 0.1, -0.35]);
  bw.addBox([3, 0.8, 0], [4.8, 1.2, 6.0], '#fed7aa', [-0.1, 0.2, 0.2]);
  await saveGlb('split-level-house-wreck.glb', bw);
}

// 6. HART-FARMHOUSE
export async function generateHartFarmhouse() {
  const b = new GlbBuilder();
  // Fieldstone Foundation
  b.addBox([0, 0.45, 0], [11.6, 0.9, 9.6], '#334155');
  
  // 2-Story Farmhouse Body (Classic White Clapboard Siding)
  b.addBox([0, 3.3, 0], [10.8, 5.0, 8.8], '#f8fafc');
  
  // Wrap-around Covered Porch with Turned Railings
  b.addBox([0, 0.55, 5.3], [11.8, 0.35, 2.2], '#78716c'); // Front deck
  b.addBox([5.9, 0.55, 0], [2.0, 0.35, 10.6], '#78716c'); // Side deck
  b.addBox([0, 0.25, 6.6], [3.4, 0.3, 0.7], '#a8a29e'); // Steps
  
  // Turned White Porch Posts & Handrails
  [-5.0, -2.5, 0, 2.5, 5.0].forEach(px => {
    b.addBox([px, 1.9, 5.9], [0.28, 2.5, 0.28], '#ffffff');
  });
  b.addBox([0, 1.1, 5.9], [10.6, 0.12, 0.12], '#ffffff');
  b.addBox([0, 3.2, 5.3], [12.2, 0.22, 2.4], '#15803d'); // Green porch roof
  
  // Red Front Door with Transom
  b.addBox([0, 1.95, 4.45], [1.4, 2.5, 0.1], '#b91c1c');
  b.addBox([0, 3.0, 4.46], [1.2, 0.45, 0.08], '#38bdf8');
  
  // 12-Pane Farmhouse Windows across 2 Floors
  const winPositions = [
    [-3.2, 1.95, 4.45], [3.2, 1.95, 4.45],
    [-3.2, 4.3, 4.45], [0, 4.3, 4.45], [3.2, 4.3, 4.45],
    [-5.45, 1.95, -1.5], [-5.45, 4.3, -1.5],
    [0, 1.95, -4.45], [0, 4.3, -4.45]
  ];
  winPositions.forEach(([wx, wy, wz]) => {
    const isSide = Math.abs(wx) > 5;
    b.addBox([wx, wy, wz], isSide ? [0.1, 1.6, 1.4] : [1.4, 1.6, 0.1], '#38bdf8');
    b.addBox([wx, wy, wz], isSide ? [0.08, 1.8, 1.6] : [1.6, 1.8, 0.08], '#0284c7'); // Dark green shutters
    b.addBox([wx, wy, wz], isSide ? [0.09, 1.7, 1.5] : [1.5, 1.7, 0.09], '#ffffff'); // White sash
    // 12-pane muntin grid
    b.addBox([wx, wy, wz], isSide ? [0.11, 0.04, 1.4] : [1.4, 0.04, 0.11], '#ffffff');
    b.addBox([wx, wy, wz], isSide ? [0.11, 1.6, 0.04] : [0.04, 1.6, 0.11], '#ffffff');
  });
  
  // Steep Cross-Gabled Metal Farmhouse Roof (Forest Green with Ridge Caps)
  b.addWedge([0, 7.0, 0], [12.0, 3.4, 10.0], '#15803d');
  b.addWedge([0, 7.0, 2.0], [5.0, 3.2, 6.4], '#15803d', [0, Math.PI/2, 0]);
  
  // Dual Red Brick Chimneys
  [-3.8, 3.8].forEach(cx => {
    b.addBox([cx, 7.0, -1.0], [1.2, 3.8, 1.2], '#991b1b');
    b.addBox([cx, 8.95, -1.0], [1.4, 0.2, 1.4], '#cbd5e1');
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
