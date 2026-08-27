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

// 1. DISTRICT-BARN
export async function generateDistrictBarn() {
  const b = new GlbBuilder();
  // Fieldstone Foundation
  b.addBox([0, 0.4, 0], [13.4, 0.8, 16.4], '#64748b');
  
  // Traditional Red Timber Barn Body
  b.addBox([0, 3.4, 0], [12.8, 5.2, 15.8], '#b91c1c');
  
  // Classic Gambrel Roof (Charcoal Shingles with White Trim)
  b.addWedge([0, 7.8, 0], [13.4, 3.8, 16.2], '#334155');
  b.addBox([0, 6.0, 0], [13.2, 0.2, 16.0], '#ffffff'); // Eaves trim
  
  // Double White X-Braced Sliding Barn Doors (Front and Back)
  [7.95, -7.95].forEach(dz => {
    b.addBox([0, 2.4, dz], [4.8, 4.0, 0.15], '#ffffff');
    b.addBox([0, 2.4, dz + (dz > 0 ? 0.1 : -0.1)], [4.4, 3.6, 0.1], '#991b1b');
    // White Cross Bracing
    b.addBox([0, 2.4, dz + (dz > 0 ? 0.12 : -0.12)], [4.2, 0.4, 0.08], '#ffffff', [0, 0, Math.PI/4]);
    b.addBox([0, 2.4, dz + (dz > 0 ? 0.12 : -0.12)], [4.2, 0.4, 0.08], '#ffffff', [0, 0, -Math.PI/4]);
  });
  
  // Upper Hayloft Door & Pulley Hoist Beam
  b.addBox([0, 6.4, 8.12], [2.2, 2.2, 0.1], '#ffffff');
  b.addBox([0, 7.8, 8.4], [0.3, 0.3, 1.2], '#78350f'); // Hoist beam
  
  // Rooftop Aerator Cupola & Rooster Weather Vane
  b.addBox([0, 10.0, 0], [2.2, 1.2, 2.2], '#ffffff');
  b.addWedge([0, 11.0, 0], [2.6, 0.8, 2.6], '#334155');
  b.addCylinder([0, 11.8, 0], 0.05, 0.05, 1.0, 6, '#f59e0b'); // Weather vane mast
  b.addBox([0, 12.2, 0], [0.8, 0.5, 0.05], '#f59e0b'); // Rooster silhouette
  
  await saveGlb('district-barn.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.4, 0], [13.4, 0.8, 16.4], '#64748b');
  bw.addBox([-2, 1.8, 0], [7.0, 2.8, 14.0], '#b91c1c', [0.1, -0.08, 0.35]);
  bw.addWedge([3, 1.4, 0], [9.0, 2.2, 13.0], '#334155', [-0.3, 0.15, -0.4]);
  bw.addBox([0, 0.6, 6], [4.0, 0.2, 3.0], '#ffffff', [0.4, 0.5, 0.1]); // Smashed barn doors
  await saveGlb('district-barn-wreck.glb', bw);
}

// 2. HART-BARN
export async function generateHartBarn() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [11.4, 0.6, 13.4], '#475569');
  
  // Weathered Brown Cedar Timber Barn Body
  b.addBox([0, 3.0, 0], [10.8, 4.8, 12.8], '#78350f');
  
  // Attached Lean-To Equipment Shed on East Wall
  b.addBox([6.4, 1.8, 0], [2.4, 3.0, 10.0], '#92400e');
  b.addWedge([6.4, 3.6, 0], [2.6, 0.8, 10.4], '#451a03'); // Shed roof
  
  // Main Gable Roof (Rusted Tin Metal Corrugated)
  b.addWedge([0, 6.6, 0], [11.4, 2.8, 13.2], '#b45309');
  
  // White Trimmed Sliding Doors
  b.addBox([0, 2.0, 6.45], [4.0, 3.4, 0.15], '#ffffff');
  b.addBox([0, 2.0, 6.55], [3.6, 3.0, 0.1], '#78350f');
  
  await saveGlb('hart-barn.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [11.4, 0.6, 13.4], '#475569');
  bw.addWedge([0, 1.4, 0], [10.0, 1.8, 11.0], '#b45309', [0.25, 0.1, -0.3]);
  bw.addBox([2, 1.0, 0], [5.0, 1.5, 8.0], '#78350f', [-0.2, 0.3, 0.1]);
  await saveGlb('hart-barn-wreck.glb', bw);
}

// 3. GRAIN-BIN
export async function generateGrainBin() {
  const b = new GlbBuilder();
  // Concrete Pad
  b.addCylinder([0, 0.25, 0], 3.8, 3.8, 0.5, 16, '#64748b');
  
  // Galvanized Corrugated Steel Cylinder
  b.addCylinder([0, 3.2, 0], 3.5, 3.5, 5.4, 16, '#cbd5e1');
  
  // Corrugated Ring Bands
  [1.2, 2.4, 3.6, 4.8].forEach(ry => {
    b.addCylinder([0, ry, 0], 3.55, 3.55, 0.15, 16, '#94a3b8');
  });
  
  // Conical Ribbed Roof with Cap Vent
  b.addCylinder([0, 7.0, 0], 0.4, 3.6, 2.2, 16, '#94a3b8');
  b.addCylinder([0, 8.3, 0], 0.5, 0.5, 0.4, 12, '#64748b'); // Cap vent
  
  // Vertical Safety Ladder with Ring Guard
  b.addCylinder([3.6, 4.0, 0], 0.04, 0.04, 7.0, 6, '#f8fafc');
  b.addCylinder([3.6, 4.0, 0.4], 0.04, 0.04, 7.0, 6, '#f8fafc');
  for (let ly = 1.0; ly < 7.5; ly += 0.8) {
    b.addBox([3.6, ly, 0.2], [0.1, 0.04, 0.45], '#f8fafc');
  }
  
  // Diagonal Infeed Grain Auger Pipe
  b.addCylinder([2.5, 4.5, 3.0], 0.2, 0.2, 7.0, 8, '#dc2626', [0.7, 0.4, 0]);
  
  await saveGlb('grain-bin.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.25, 0], 3.8, 3.8, 0.5, 16, '#64748b');
  bw.addCylinder([1.5, 1.8, 0], 3.5, 3.5, 4.0, 16, '#cbd5e1', [0.4, 0.2, 1.2]); // Crushed silo drum
  bw.addCylinder([3.5, 0.8, 2], 0.4, 3.6, 2.0, 16, '#94a3b8', [-0.6, 0.3, 0.8]); // Dented cone roof
  await saveGlb('grain-bin-wreck.glb', bw);
}

// 4. FARM-WINDMILL
export async function generateFarmWindmill() {
  const b = new GlbBuilder();
  // 4 Concrete Pier Footings
  const footings = [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]];
  footings.forEach(([fx, fz]) => {
    b.addBox([fx, 0.3, fz], [0.6, 0.6, 0.6], '#64748b');
  });
  
  // 4-Leg Steel Lattice Tower Tapering Upwards
  for (let s = 0; s < 5; s++) {
    const y = 1.5 + s * 2.8;
    const rBot = 1.2 * (1 - s * 0.16);
    const rTop = 1.2 * (1 - (s + 1) * 0.16);
    b.addCylinder([0, y, 0], rTop, rBot, 2.8, 4, '#cbd5e1');
    // Horizontal cross ties
    b.addBox([0, y + 1.4, 0], [rTop * 2, 0.08, rTop * 2], '#94a3b8');
  }
  
  // Top Gearbox Platform
  b.addBox([0, 15.5, 0], [0.9, 0.3, 0.9], '#475569');
  b.addCylinder([0, 15.8, 0], 0.25, 0.3, 0.6, 8, '#0f172a'); // Gearbox
  
  // Multi-Blade Galvanized Turbine Rotor Hub
  b.addCylinder([0, 15.8, 0.5], 0.3, 0.3, 0.2, 12, '#e2e8f0', [Math.PI/2, 0, 0]);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rx = Math.cos(angle) * 1.5;
    const ry = Math.sin(angle) * 1.5;
    b.addBox([rx, 15.8 + ry, 0.5], [0.35, 1.4, 0.04], '#e2e8f0', [0, 0, angle]);
  }
  b.addTorus([0, 15.8, 0.5], 1.6, 0.04, 6, 16, '#94a3b8', [0, 0, 0]); // Outer blade ring
  
  // Weather Vane Directional Tail (AERMOTOR Style Galvanized Tail)
  b.addCylinder([0, 15.8, -1.0], 0.05, 0.05, 1.8, 6, '#64748b', [Math.PI/2, 0, 0]);
  b.addBox([0, 16.0, -1.8], [0.05, 0.9, 1.4], '#dc2626'); // Red tail vane
  
  await saveGlb('farm-windmill.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 2.0, 0], 1.0, 1.2, 4.0, 4, '#cbd5e1'); // Base stump
  bw.addCylinder([4, 1.5, 2], 0.4, 0.8, 12.0, 4, '#cbd5e1', [0.4, 0.6, 1.4]); // Buckled lattice mast
  bw.addCylinder([9, 0.5, 4], 0.3, 0.3, 0.2, 10, '#e2e8f0', [1.2, 0.4, 0.2]); // Shattered rotor
  await saveGlb('farm-windmill-wreck.glb', bw);
}

export async function run() {
  await generateDistrictBarn();
  await generateHartBarn();
  await generateGrainBin();
  await generateFarmWindmill();
}

if (process.argv[1]?.endsWith('generate-agricultural-models.mjs')) {
  run().catch(console.error);
}
