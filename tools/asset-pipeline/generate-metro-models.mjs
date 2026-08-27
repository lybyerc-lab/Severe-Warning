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

// 1. SKYSCRAPER & SKYSCRAPER-WRECK
async function generateSkyscraper() {
  const b = new GlbBuilder();
  // Main Tower Body (3-tier setback)
  b.addBox([0, 12, 0], [10, 24, 10], '#1e293b');
  b.addBox([0, 28, 0], [8, 8, 8], '#0f172a');
  b.addBox([0, 34, 0], [5.5, 4, 5.5], '#1e293b');
  // Cyan Glass Windows Panels
  for (let f = 2; f < 22; f += 2.5) {
    b.addBox([0, f, 5.05], [9.2, 1.4, 0.1], '#38bdf8');
    b.addBox([0, f, -5.05], [9.2, 1.4, 0.1], '#38bdf8');
    b.addBox([5.05, f, 0], [0.1, 1.4, 9.2], '#38bdf8');
    b.addBox([-5.05, f, 0], [0.1, 1.4, 9.2], '#38bdf8');
  }
  // Rooftop Helipad & Antenna
  b.addCylinder([0, 36.1, 0], 2.2, 2.2, 0.2, 12, '#f59e0b');
  b.addCylinder([0, 40, 0], 0.12, 0.25, 8.0, 8, '#e2e8f0');
  b.addSphere([0, 44.2, 0], 0.25, 6, '#ef4444'); // Red Aviation Beacon
  await saveGlb('skyscraper.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 5, 0], [10.5, 10, 10.5], '#1e293b', [0.08, 0, 0.05]);
  bw.addBox([4, 12, 0], [8, 12, 8], '#0f172a', [0.35, 0.1, -0.45]); // Toppled upper tiers
  bw.addCylinder([8, 1.5, 3], 0.12, 0.25, 8.0, 8, '#e2e8f0', [0.8, 0.3, 1.2]); // Fallen antenna
  await saveGlb('skyscraper-wreck.glb', bw);
}

// 2. CONSTRUCTION-CRANE & CONSTRUCTION-CRANE-WRECK
async function generateConstructionCrane() {
  const b = new GlbBuilder();
  // Yellow Lattice Mast
  b.addCylinder([0, 10, 0], 0.8, 0.8, 20, 6, '#facc15');
  // Operator Cab
  b.addBox([0.6, 20.5, 0.6], [1.8, 1.8, 1.8], '#1e293b');
  b.addBox([1.2, 20.8, 0.6], [0.8, 1.0, 1.4], '#38bdf8'); // Cab window
  // Horizontal Jib & Counter-Jib
  b.addBox([6, 21.8, 0], [18, 0.8, 0.8], '#facc15');
  b.addBox([-3.5, 21.8, 0], [6, 0.8, 0.8], '#facc15');
  // Counterweight Blocks
  b.addBox([-5.5, 21.4, 0], [2.2, 1.6, 1.6], '#475569');
  // Hoist Cable & Suspended Steel I-Beam
  b.addCylinder([10, 14, 0], 0.03, 0.03, 15, 4, '#94a3b8');
  b.addBox([10, 6.5, 0], [4.5, 0.4, 0.4], '#dc2626'); // Red steel beam
  await saveGlb('construction-crane.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 2.5, 0], 0.8, 0.8, 5, 6, '#facc15'); // Base stump
  bw.addCylinder([7, 3, 0], 0.8, 0.8, 16, 6, '#facc15', [0.2, 0.4, 1.45]); // Buckled mast
  bw.addBox([12, 1, 3], [14, 0.8, 0.8], '#facc15', [0.5, 0.8, 0.2]); // Smashed jib
  await saveGlb('construction-crane-wreck.glb', bw);
}

// 3. RADIO-TOWER & RADIO-TOWER-WRECK
async function generateRadioTower() {
  const b = new GlbBuilder();
  // Red & White Alternating Lattice Mast
  for (let s = 0; s < 6; s++) {
    const col = s % 2 === 0 ? '#ef4444' : '#f8fafc';
    const rTop = 0.8 * (1 - s * 0.12);
    const rBot = 0.8 * (1 - (s - 1) * 0.12);
    b.addCylinder([0, 3 + s * 5, 0], rTop, rBot, 5.0, 6, col);
  }
  // Microwave Dishes
  [-1.0, 1.0].forEach((dx, idx) => {
    b.addCylinder([dx, 18, 0], 0.7, 0.2, 0.3, 10, '#cbd5e1', [0, 0, (idx === 0 ? -1 : 1) * 0.3]);
  });
  // Top Beacon
  b.addCylinder([0, 31, 0], 0.08, 0.15, 2.0, 6, '#f8fafc');
  b.addSphere([0, 32.2, 0], 0.3, 6, '#ef4444');
  await saveGlb('radio-tower.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 3, 0], 0.75, 0.8, 6.0, 6, '#ef4444'); // Stump
  bw.addCylinder([6, 2, 2], 0.4, 0.65, 22.0, 6, '#ef4444', [0.3, 0.5, 1.42]); // Fallen tower
  bw.addCylinder([12, 0.5, -2], 0.7, 0.2, 0.3, 8, '#cbd5e1', [0.8, 0.2, 0.4]); // Broken dish
  await saveGlb('radio-tower-wreck.glb', bw);
}

// 4. COMMUTER-BUS & COMMUTER-BUS-WRECK
async function generateCommuterBus() {
  const b = new GlbBuilder();
  // Transit Bus Body (Action Transit Blue/White)
  b.addBox([0, 1.5, 0], [2.6, 2.2, 8.5], '#0284c7');
  b.addBox([0, 2.4, 0], [2.62, 0.7, 8.52], '#f8fafc'); // White roof
  // Yellow Destination Sign
  b.addBox([0, 2.3, 4.28], [2.2, 0.35, 0.05], '#facc15');
  // Windshield & Passenger Windows
  b.addBox([0, 1.7, 4.28], [2.4, 0.9, 0.05], '#38bdf8');
  b.addBox([0, 1.7, 0], [2.66, 0.7, 7.2], '#38bdf8');
  // Bumper & Headlights
  b.addBox([0, 0.5, 4.3], [2.5, 0.4, 0.2], '#0f172a');
  b.addBox([-0.95, 0.65, 4.35], [0.35, 0.25, 0.05], '#fef08a');
  b.addBox([0.95, 0.65, 4.35], [0.35, 0.25, 0.05], '#fef08a');
  // 6 Wheels
  const wheelZ = [2.6, -1.8, -3.2];
  wheelZ.forEach(wz => {
    b.addCylinder([-1.35, 0.5, wz], 0.5, 0.5, 0.35, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([1.35, 0.5, wz], 0.5, 0.5, 0.35, 12, '#0f172a', [0, 0, Math.PI / 2]);
  });
  await saveGlb('commuter-bus.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.9, 0], [2.6, 1.4, 8.2], '#0284c7', [0.35, 0.2, 1.85]); // Rolled bus
  bw.addBox([1.6, 0.3, 1.5], [1.8, 0.8, 0.1], '#f8fafc', [0.5, 0.4, 0.2]); // Detached panel
  await saveGlb('commuter-bus-wreck.glb', bw);
}

async function run() {
  console.log('Generating Region 3 (Metro Row) 3D Models & Wreck Pairs...\n');
  await generateSkyscraper();
  await generateConstructionCrane();
  await generateRadioTower();
  await generateCommuterBus();
  console.log('\nAll Metro Row models successfully generated!');
}

run().catch(err => {
  console.error('Error generating Metro Row models:', err);
  process.exit(1);
});
