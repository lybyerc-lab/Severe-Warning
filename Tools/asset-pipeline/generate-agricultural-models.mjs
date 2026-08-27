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
  // Fieldstone Foundation Plinth
  b.addBox([0, 0.45, 0], [13.6, 0.9, 16.6], '#475569');
  
  // Traditional Red Board-and-Batten Timber Barn Body
  b.addBox([0, 3.5, 0], [12.8, 5.4, 15.8], '#b91c1c');
  // Vertical batten relief stripes
  for (let bz = -7.5; bz <= 7.5; bz += 1.5) {
    b.addBox([-6.45, 3.5, bz], [0.08, 5.4, 0.12], '#991b1b');
    b.addBox([6.45, 3.5, bz], [0.08, 5.4, 0.12], '#991b1b');
  }
  
  // Classic Gambrel Roof (Charcoal Metal Standing Seam with White Eaves Trim)
  b.addWedge([0, 8.0, 0], [13.6, 4.0, 16.4], '#334155');
  b.addBox([0, 6.2, 0], [13.4, 0.22, 16.2], '#ffffff'); // Eaves trim
  b.addBox([0, 10.05, 0], [0.35, 0.18, 16.5], '#1e293b'); // Ridge cap
  
  // Double White X-Braced Sliding Barn Doors (Front and Back) on Overhead Tracks
  [7.96, -7.96].forEach(dz => {
    const sgn = dz > 0 ? 1 : -1;
    b.addBox([0, 4.6, dz + sgn * 0.08], [5.4, 0.2, 0.15], '#0f172a'); // Track bar
    b.addBox([0, 2.4, dz], [4.8, 4.2, 0.15], '#ffffff'); // Door frame
    b.addBox([0, 2.4, dz + sgn * 0.1], [4.4, 3.8, 0.1], '#991b1b');
    // White Cross Bracing
    b.addBox([0, 2.4, dz + sgn * 0.12], [4.4, 0.4, 0.08], '#ffffff', [0, 0, Math.PI/4]);
    b.addBox([0, 2.4, dz + sgn * 0.12], [4.4, 0.4, 0.08], '#ffffff', [0, 0, -Math.PI/4]);
    b.addCylinder([0.15, 2.2, dz + sgn * 0.18], 0.05, 0.05, 0.4, 8, '#0f172a'); // Iron handles
    b.addCylinder([-0.15, 2.2, dz + sgn * 0.18], 0.05, 0.05, 0.4, 8, '#0f172a');
  });
  
  // Upper Hayloft Door & Forged Pulley Hoist Beam
  b.addBox([0, 6.6, 8.15], [2.4, 2.4, 0.1], '#ffffff');
  b.addBox([0, 6.6, 8.22], [2.0, 2.0, 0.08], '#991b1b');
  b.addBox([0, 8.0, 8.5], [0.35, 0.35, 1.4], '#78350f'); // Heavy timber hoist beam
  b.addCylinder([0, 7.6, 9.1], 0.06, 0.06, 0.4, 8, '#0f172a'); // Pulley hook
  
  // Rooftop Louvered Cupola & Golden Rooster Weather Vane
  b.addBox([0, 10.3, 0], [2.4, 1.4, 2.4], '#ffffff');
  b.addBox([0, 10.3, 1.22], [1.8, 0.8, 0.05], '#0f172a'); // Louver vent
  b.addBox([0, 10.3, -1.22], [1.8, 0.8, 0.05], '#0f172a');
  b.addWedge([0, 11.4, 0], [2.8, 0.9, 2.8], '#334155');
  b.addCylinder([0, 12.3, 0], 0.05, 0.05, 1.2, 6, '#f59e0b');
  b.addBox([0, 12.8, 0], [0.9, 0.6, 0.05], '#f59e0b'); // Rooster silhouette
  
  await saveGlb('district-barn.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.45, 0], [13.6, 0.9, 16.6], '#475569');
  bw.addBox([-2, 1.8, 0], [7.0, 2.8, 14.0], '#b91c1c', [0.1, -0.08, 0.35]);
  bw.addWedge([3, 1.4, 0], [9.0, 2.2, 13.0], '#334155', [-0.3, 0.15, -0.4]);
  bw.addBox([0, 0.6, 6], [4.0, 0.2, 3.0], '#ffffff', [0.4, 0.5, 0.1]);
  await saveGlb('district-barn-wreck.glb', bw);
}

// 2. HART-BARN
export async function generateHartBarn() {
  const b = new GlbBuilder();
  b.addBox([0, 0.35, 0], [11.6, 0.7, 13.6], '#475569');
  
  // Weathered Cedar Timber Barn Body
  b.addBox([0, 3.2, 0], [10.8, 5.0, 12.8], '#78350f');
  
  // Attached Lean-To Shed on East Wall
  b.addBox([6.6, 2.0, 0], [2.6, 3.2, 10.4], '#92400e');
  b.addWedge([6.6, 3.9, 0], [2.8, 0.9, 10.8], '#451a03');
  
  // Main Gable Roof (Rusted Corrugated Metal)
  b.addWedge([0, 6.8, 0], [11.6, 3.0, 13.4], '#b45309');
  
  // White Trimmed Sliding Doors
  b.addBox([0, 2.1, 6.45], [4.2, 3.6, 0.15], '#ffffff');
  b.addBox([0, 2.1, 6.55], [3.8, 3.2, 0.1], '#78350f');
  
  await saveGlb('hart-barn.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.35, 0], [11.6, 0.7, 13.6], '#475569');
  bw.addWedge([0, 1.4, 0], [10.0, 1.8, 11.0], '#b45309', [0.25, 0.1, -0.3]);
  bw.addBox([2, 1.0, 0], [5.0, 1.5, 8.0], '#78350f', [-0.2, 0.3, 0.1]);
  await saveGlb('hart-barn-wreck.glb', bw);
}

// 3. GRAIN-BIN
export async function generateGrainBin() {
  const b = new GlbBuilder();
  // Concrete Base Pad
  b.addCylinder([0, 0.3, 0], 4.0, 4.0, 0.6, 16, '#64748b');
  
  // Galvanized Corrugated Steel Cylinder
  b.addCylinder([0, 3.4, 0], 3.6, 3.6, 5.6, 16, '#cbd5e1');
  
  // Horizontal Corrugated Seam Flange Rings
  [1.2, 2.3, 3.4, 4.5, 5.6].forEach(ry => {
    b.addCylinder([0, ry, 0], 3.68, 3.68, 0.16, 16, '#94a3b8');
  });
  
  // Conical Ribbed Roof with Cap Vent
  b.addCylinder([0, 7.3, 0], 0.45, 3.75, 2.4, 16, '#94a3b8');
  b.addCylinder([0, 8.7, 0], 0.55, 0.55, 0.45, 12, '#64748b');
  
  // Caged Safety Access Ladder
  b.addCylinder([3.75, 4.2, 0], 0.04, 0.04, 7.4, 6, '#f8fafc');
  b.addCylinder([3.75, 4.2, 0.45], 0.04, 0.04, 7.4, 6, '#f8fafc');
  for (let ly = 1.0; ly < 7.8; ly += 0.75) {
    b.addBox([3.75, ly, 0.22], [0.1, 0.04, 0.48], '#f8fafc');
    // Safety Hoop Cage
    if (ly > 2.5) {
      b.addCylinder([3.95, ly, 0.22], 0.35, 0.35, 0.04, 8, '#f8fafc');
    }
  }
  
  // Diagonal Infeed Grain Auger Pipe & Motor Hopper
  b.addCylinder([2.8, 4.8, 3.2], 0.22, 0.22, 7.4, 8, '#dc2626', [0.7, 0.4, 0]);
  b.addBox([0.2, 0.6, 5.6], [1.2, 0.8, 1.2], '#dc2626'); // Auger intake hopper
  
  await saveGlb('grain-bin.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.3, 0], 4.0, 4.0, 0.6, 16, '#64748b');
  bw.addCylinder([1.5, 1.8, 0], 3.6, 3.6, 4.0, 16, '#cbd5e1', [0.4, 0.2, 1.2]);
  bw.addCylinder([3.5, 0.8, 2], 0.45, 3.75, 2.0, 16, '#94a3b8', [-0.6, 0.3, 0.8]);
  await saveGlb('grain-bin-wreck.glb', bw);
}

// 4. FARM-WINDMILL
export async function generateFarmWindmill() {
  const b = new GlbBuilder();
  // Concrete Corner Footings
  const footings = [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]];
  footings.forEach(([fx, fz]) => {
    b.addBox([fx, 0.3, fz], [0.6, 0.6, 0.6], '#64748b');
  });
  
  // 4-Leg Galvanized Steel Angle-Iron Lattice Tower
  const towerHeight = 13.0;
  footings.forEach(([fx, fz]) => {
    b.addCylinder([fx * 0.5, towerHeight / 2, fz * 0.5], 0.08, 0.08, towerHeight, 6, '#cbd5e1', [fz * -0.06, 0, fx * 0.06]);
  });
  
  // Horizontal Girth Struts & Diagonal X-Brace Rods
  [3.0, 6.0, 9.0, 12.0].forEach(hy => {
    const scale = 1.0 - (hy / towerHeight) * 0.55;
    b.addBox([0, hy, 1.6 * scale], [3.2 * scale, 0.08, 0.08], '#94a3b8');
    b.addBox([0, hy, -1.6 * scale], [3.2 * scale, 0.08, 0.08], '#94a3b8');
    b.addBox([1.6 * scale, hy, 0], [0.08, 0.08, 3.2 * scale], '#94a3b8');
    b.addBox([-1.6 * scale, hy, 0], [0.08, 0.08, 3.2 * scale], '#94a3b8');
  });
  
  // Top Platform & Cast-Iron Gearbox Head
  b.addBox([0, towerHeight, 0], [1.8, 0.2, 1.8], '#475569');
  b.addBox([0, towerHeight + 0.7, 0], [0.9, 0.9, 1.4], '#334155');
  
  // 18-Blade Curved Galvanized Steel Rotor Wheel with Outer Concentric Rings
  const rotorZ = 0.85;
  b.addCylinder([0, towerHeight + 0.7, rotorZ], 0.35, 0.35, 0.3, 12, '#475569', [Math.PI/2, 0, 0]); // Hub
  b.addCylinder([0, towerHeight + 0.7, rotorZ], 2.2, 2.2, 0.04, 16, '#cbd5e1', [Math.PI/2, 0, 0]); // Inner ring
  b.addCylinder([0, towerHeight + 0.7, rotorZ], 3.8, 3.8, 0.04, 24, '#cbd5e1', [Math.PI/2, 0, 0]); // Outer ring
  
  // 18 Aerodynamic Curved Vane Blades
  for (let i = 0; i < 18; i++) {
    const angle = (i * Math.PI * 2) / 18;
    const rx = Math.cos(angle) * 2.0;
    const ry = Math.sin(angle) * 2.0;
    b.addBox([rx, towerHeight + 0.7 + ry, rotorZ], [0.35, 1.8, 0.04], '#cbd5e1', [0, 0, angle + 0.25]);
  }
  
  // Red Directional Tail Vane (AERMOTOR Style)
  b.addCylinder([0, towerHeight + 0.7, -1.8], 0.06, 0.06, 2.6, 6, '#475569', [Math.PI/2, 0, 0]);
  b.addBox([0, towerHeight + 0.7, -3.2], [0.06, 1.6, 2.2], '#dc2626');
  
  await saveGlb('farm-windmill.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [4.0, 0.6, 4.0], '#64748b');
  bw.addCylinder([1, 1.5, 0], 0.08, 0.08, 12.0, 6, '#cbd5e1', [0.4, 0.2, 1.4]); // Buckled tower legs
  bw.addCylinder([3, 0.6, 2], 3.8, 3.8, 0.04, 16, '#cbd5e1', [1.2, 0.4, 0.2]); // Shattered rotor wheel
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
