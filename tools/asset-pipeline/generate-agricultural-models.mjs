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
  // Fieldstone Plinth
  b.addBox([0, 0.35, 0], [12.0, 0.7, 14.0], '#475569');
  
  // Traditional Red Board-and-Batten Timber Barn Body
  b.addBox([0, 3.2, 0], [11.0, 5.0, 13.0], '#a43d32');
  
  // Attached Lean-To Shed on East Wall
  b.addBox([6.6, 2.0, 0], [2.6, 3.2, 10.4], '#8c342d');
  b.addWedge([6.6, 3.9, 0], [2.8, 0.9, 10.8], '#1e293b');
  
  // Main Gable Roof (Standing Seam Dark Shingle with Solid Gables)
  b.addWedge([0, 6.8, 0], [11.8, 3.0, 13.6], '#27313d');
  
  // White Trimmed Double Sliding Doors (Front & Back)
  [6.55, -6.55].forEach(dz => {
    const sgn = dz > 0 ? 1 : -1;
    b.addBox([0, 2.1, dz], [4.4, 3.6, 0.15], '#ffffff');
    b.addBox([0, 2.1, dz + sgn * 0.08], [4.0, 3.2, 0.1], '#991b1b');
    b.addBox([0, 2.1, dz + sgn * 0.12], [4.0, 0.35, 0.06], '#ffffff', [0, 0, Math.PI/4]);
    b.addBox([0, 2.1, dz + sgn * 0.12], [4.0, 0.35, 0.06], '#ffffff', [0, 0, -Math.PI/4]);
  });
  
  // Upper Loft Door & Hart Farm Sign Plaque
  b.addBox([0, 5.2, 6.55], [2.2, 1.8, 0.1], '#ffffff');
  b.addBox([0, 5.2, 6.62], [1.8, 1.4, 0.08], '#991b1b');
  b.addBox([0, 6.8, 6.65], [4.2, 1.0, 0.15], '#f6c453'); // HART FARM Sign Plaque
  
  // Rooftop Cupola & Rooster Weathervane
  b.addBox([0, 8.8, 0], [1.8, 1.1, 1.8], '#ffffff');
  b.addWedge([0, 9.7, 0], [2.1, 0.7, 2.1], '#1e293b');
  b.addCylinder([0, 10.4, 0], 0.04, 0.04, 0.9, 6, '#fbbf24');
  b.addBox([0, 10.7, 0], [0.6, 0.45, 0.04], '#fbbf24');

  await saveGlb('hart-barn.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.35, 0], [12.0, 0.7, 14.0], '#475569');
  bw.addWedge([0, 1.4, 0], [10.0, 1.8, 11.0], '#27313d', [0.25, 0.1, -0.3]);
  bw.addBox([2, 1.0, 0], [5.0, 1.5, 8.0], '#a43d32', [-0.2, 0.3, 0.1]);
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
  b.addTorus([0, towerHeight + 0.7, rotorZ], 2.2, 0.04, 6, 16, '#cbd5e1'); // Inner ring hoop
  b.addTorus([0, towerHeight + 0.7, rotorZ], 3.8, 0.04, 6, 24, '#cbd5e1'); // Outer ring hoop
  
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
  bw.addTorus([3, 0.6, 2], 3.8, 0.04, 6, 16, '#cbd5e1', [1.2, 0.4, 0.2]); // Shattered rotor ring
  await saveGlb('farm-windmill-wreck.glb', bw);
}

// 5. COW-17 & COW-17-WRECK (Hero Bipedal Cartoon Mascot)
export async function generateCow17() {
  const b = new GlbBuilder();
  // 1. Lower Body: Bipedal Legs & Cloven Hooves
  [-0.45, 0.45].forEach(lx => {
    b.addCylinder([lx, 0.9, 0], 0.22, 0.18, 0.8, 8, '#ffffff'); // Thigh
    b.addCylinder([lx, 0.35, 0.02], 0.18, 0.15, 0.7, 8, '#ffffff'); // Shin
    b.addBox([lx, 0.1, 0.1], [0.36, 0.2, 0.48], '#0f172a'); // Hoof
  });
  b.addBox([0, 1.25, 0], [1.25, 0.65, 1.0], '#ffffff'); // Hips

  // 2. Upright Plump Pear-Shaped Torso & Belly
  b.addCylinder([0, 1.9, 0], 0.65, 0.8, 1.15, 12, '#ffffff'); // Torso
  b.addSphere([0, 1.8, 0.25], 0.6, 12, '#ffffff'); // Plump belly
  b.addSphere([-0.55, 2.0, 0.15], 0.45, 10, '#18181b'); // Left spot
  b.addSphere([0.5, 1.75, -0.2], 0.5, 10, '#18181b'); // Right back spot
  b.addSphere([0.15, 2.15, 0.4], 0.3, 8, '#18181b'); // Chest spot

  // Cowbell Necklace
  b.addTorus([0, 2.45, 0.1], 0.58, 0.05, 8, 16, '#7c2d12', [Math.PI/2, 0, 0]);
  b.addBox([0, 2.15, 0.62], [0.22, 0.28, 0.18], '#eab308');

  // 3. Left Arm (Leaning Casually Forward)
  b.addCylinder([-0.72, 2.1, 0.25], 0.16, 0.14, 0.6, 8, '#ffffff', [0.65, 0, -0.35]);
  b.addCylinder([-0.65, 1.75, 0.55], 0.15, 0.13, 0.6, 8, '#ffffff', [-0.85, 0, 0.2]);
  b.addBox([-0.65, 1.5, 0.72], [0.28, 0.2, 0.35], '#0f172a'); // Left Hoof resting on rail

  // 4. Right Arm (Holding Moo Brew Coffee Mug in Front of Chest)
  b.addCylinder([0.72, 2.1, 0.2], 0.16, 0.14, 0.6, 8, '#ffffff', [0.45, 0, 0.35]);
  b.addCylinder([0.58, 2.05, 0.52], 0.15, 0.13, 0.55, 8, '#ffffff', [-1.15, 0, -0.35]);
  b.addBox([0.45, 2.15, 0.65], [0.28, 0.2, 0.35], '#0f172a'); // Right Hoof
  
  // Moo Brew Coffee Cup
  b.addCylinder([0.45, 2.35, 0.78], 0.2, 0.16, 0.45, 12, '#9a3412'); // Cup
  b.addCylinder([0.45, 2.35, 0.78], 0.205, 0.185, 0.22, 12, '#ffffff'); // White band
  b.addCylinder([0.45, 2.55, 0.78], 0.18, 0.18, 0.04, 12, '#3e2723'); // Coffee liquid
  b.addTorus([0.65, 2.35, 0.78], 0.12, 0.03, 6, 10, '#9a3412'); // Handle

  // 5. Neck & Cartoon Sculpted Head
  b.addCylinder([0, 2.55, 0.1], 0.42, 0.5, 0.5, 8, '#ffffff');
  b.addSphere([0, 2.95, 0.1], 0.58, 12, '#ffffff'); // Cranium
  b.addBox([0, 2.85, 0.2], [0.78, 0.68, 0.78], '#ffffff');
  
  // Muzzle with Smirk & Nostrils
  b.addBox([0, 2.75, 0.65], [0.75, 0.44, 0.5], '#fda4af');
  b.addSphere([-0.18, 2.82, 0.88], 0.065, 6, '#18181b'); // Nostril L
  b.addSphere([0.18, 2.82, 0.88], 0.065, 6, '#18181b'); // Nostril R
  b.addSphere([0.25, 3.05, 0.45], 0.38, 8, '#18181b'); // Eye patch

  // Expressive Eyes with Highlights
  [-0.28, 0.28].forEach((ex) => {
    b.addSphere([ex, 3.05, 0.48], 0.14, 8, '#ffffff');
    b.addSphere([ex + (ex > 0 ? 0.02 : -0.02), 3.05, 0.58], 0.08, 6, '#09090b');
    b.addSphere([ex + (ex > 0 ? 0.04 : -0.01), 3.09, 0.62], 0.035, 6, '#ffffff'); // Catchlight
  });

  // Curved Ivory Horns with Dark Tips
  [-0.4, 0.4].forEach(hx => {
    b.addCone([hx, 3.42, 0.12], 0.1, 0.55, 8, '#fef3c7', [-0.25, 0, hx > 0 ? 0.5 : -0.5]);
    b.addCone([hx > 0 ? hx + 0.18 : hx - 0.18, 3.65, 0.16], 0.055, 0.22, 8, '#334155', [-0.35, 0, hx > 0 ? 0.7 : -0.7]);
  });

  // Floppy Ears & Golden #17 Ear Tag
  b.addBox([-0.65, 3.15, 0.1], [0.6, 0.2, 0.1], '#ffffff', [0, 0, 0.35]);
  b.addBox([-0.82, 3.0, 0.12], [0.22, 0.34, 0.04], '#facc15'); // #17 Tag
  b.addBox([0.65, 3.15, 0.1], [0.6, 0.2, 0.1], '#18181b', [0, 0, -0.35]);

  // Tail
  b.addCylinder([0, 1.45, -0.5], 0.045, 0.035, 0.85, 6, '#ffffff', [0.35, 0, 0]);
  b.addSphere([0, 1.0, -0.65], 0.16, 8, '#18181b');

  await saveGlb('cow-17.glb', b);

  // Comedic Airborne / Flying Bipedal Cow 17 Model
  const bw = new GlbBuilder();
  bw.addCylinder([0, 1.6, 0], 0.65, 0.8, 1.15, 12, '#ffffff', [0.45, 0.25, -0.35]);
  bw.addSphere([0, 1.5, 0.25], 0.6, 12, '#ffffff');
  bw.addSphere([0, 2.4, 0.4], 0.55, 10, '#ffffff'); // Head tilted back
  bw.addBox([0, 2.2, 0.9], [0.7, 0.4, 0.45], '#fda4af'); // Muzzle
  bw.addCylinder([-0.8, 1.9, 0], 0.16, 0.14, 0.9, 8, '#ffffff', [0.8, 0, -0.8]); // Splayed arms
  bw.addCylinder([0.8, 1.9, 0], 0.16, 0.14, 0.9, 8, '#ffffff', [-0.8, 0, 0.8]);
  bw.addCylinder([0.95, 2.5, 0.2], 0.18, 0.15, 0.4, 10, '#9a3412'); // Flying cup!
  [-0.45, 0.45].forEach(lx => {
    bw.addCylinder([lx, 0.8, -0.3], 0.2, 0.16, 1.1, 8, '#ffffff', [-0.65, 0, lx > 0 ? 0.45 : -0.45]);
  });
  await saveGlb('cow-17-wreck.glb', bw);
}

export async function run() {
  await generateDistrictBarn();
  await generateHartBarn();
  await generateGrainBin();
  await generateFarmWindmill();
  await generateCow17();
}

if (process.argv[1]?.endsWith('generate-agricultural-models.mjs')) {
  run().catch(console.error);
}
