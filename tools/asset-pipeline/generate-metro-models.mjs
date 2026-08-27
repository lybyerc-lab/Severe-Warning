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
  // Ground Level Entrance Lobby with Portico Canopy
  b.addBox([0, 1.8, 0], [10.4, 3.6, 10.4], '#0f172a');
  b.addBox([0, 1.8, 5.25], [6.0, 2.4, 0.1], '#38bdf8'); // Glass lobby wall
  b.addBox([0, 3.2, 5.8], [7.0, 0.3, 1.6], '#cbd5e1'); // Entrance canopy
  
  // Main Tower Body (3-tier architectural setback)
  b.addBox([0, 14, 0], [10.0, 24, 10.0], '#1e293b'); // Tier 1
  b.addBox([0, 29, 0], [8.2, 8, 8.2], '#0f172a'); // Tier 2 Setback
  b.addBox([0, 35, 0], [5.8, 4, 5.8], '#1e293b'); // Tier 3 Crown
  
  // Glass Vision Panels & Vertical Curtain-Wall Aluminum Mullions
  for (let f = 4; f < 25; f += 2.6) {
    b.addBox([0, f, 5.06], [9.4, 1.5, 0.1], '#38bdf8');
    b.addBox([0, f, -5.06], [9.4, 1.5, 0.1], '#38bdf8');
    b.addBox([5.06, f, 0], [0.1, 1.5, 9.4], '#38bdf8');
    b.addBox([-5.06, f, 0], [0.1, 1.5, 9.4], '#38bdf8');
    // Vertical mullion bars
    [-3.0, 0, 3.0].forEach(mx => {
      b.addBox([mx, f, 5.12], [0.12, 1.5, 0.08], '#cbd5e1');
      b.addBox([mx, f, -5.12], [0.12, 1.5, 0.08], '#cbd5e1');
    });
  }
  
  // Rooftop Helipad, Maintenance Rig & Aviation Antenna Mast
  b.addCylinder([0, 37.1, 0], 2.4, 2.4, 0.22, 16, '#f59e0b');
  b.addBox([0, 37.22, 0], [1.4, 0.05, 1.4], '#ffffff'); // 'H' pad marking
  b.addCylinder([0, 41.5, 0], 0.12, 0.28, 8.5, 8, '#e2e8f0');
  b.addSphere([0, 45.8, 0], 0.3, 8, '#ef4444'); // Strobe beacon
  
  await saveGlb('skyscraper.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 5, 0], [10.5, 10, 10.5], '#1e293b', [0.08, 0, 0.05]);
  bw.addBox([4, 12, 0], [8.2, 12, 8.2], '#0f172a', [0.35, 0.1, -0.45]);
  bw.addCylinder([8, 1.5, 3], 0.12, 0.28, 8.5, 8, '#e2e8f0', [0.8, 0.3, 1.2]);
  await saveGlb('skyscraper-wreck.glb', bw);
}

// 2. CONSTRUCTION-CRANE & CONSTRUCTION-CRANE-WRECK
async function generateConstructionCrane() {
  const b = new GlbBuilder();
  // Base Concrete Ballast Pad
  b.addBox([0, 0.4, 0], [4.0, 0.8, 4.0], '#475569');
  
  // Yellow Lattice Mast
  b.addCylinder([0, 10, 0], 0.85, 0.85, 20, 6, '#facc15');
  
  // Slewing Ring & Operator Cab
  b.addCylinder([0, 20.2, 0], 1.2, 1.2, 0.5, 12, '#334155');
  b.addBox([0.7, 21.0, 0.7], [1.9, 1.9, 1.9], '#1e293b');
  b.addBox([1.35, 21.3, 0.7], [0.85, 1.1, 1.5], '#38bdf8'); // Cab panoramic window
  
  // Horizontal Tower Crane Jib & Counter-Jib
  b.addBox([6.5, 22.4, 0], [19.0, 0.85, 0.85], '#facc15');
  b.addBox([-3.8, 22.4, 0], [6.5, 0.85, 0.85], '#facc15');
  
  // Counterweight Blocks (Striped Concrete)
  b.addBox([-5.8, 21.8, 0], [2.5, 1.8, 1.8], '#475569');
  b.addBox([-5.8, 21.8, 0.95], [2.3, 1.6, 0.05], '#eab308');
  
  // Apex Tower Peak & Stay Cables
  b.addCylinder([0, 24.5, 0], 0.08, 0.4, 4.2, 6, '#facc15');
  b.addCylinder([4.5, 23.5, 0], 0.04, 0.04, 9.5, 4, '#94a3b8', [0, 0, -0.45]); // Pendant cable
  
  // Hoist Trolley, Cable & Suspended Red Steel I-Beam
  b.addBox([10.5, 21.8, 0], [1.0, 0.4, 1.0], '#0f172a'); // Trolley
  b.addCylinder([10.5, 14, 0], 0.03, 0.03, 15, 4, '#94a3b8'); // Hoist cable
  b.addBox([10.5, 6.5, 0], [4.8, 0.45, 0.45], '#dc2626'); // Red steel I-beam
  
  await saveGlb('construction-crane.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 2.5, 0], 0.85, 0.85, 5, 6, '#facc15');
  bw.addCylinder([7, 3, 0], 0.85, 0.85, 16, 6, '#facc15', [0.2, 0.4, 1.45]);
  bw.addBox([12, 1, 3], [14, 0.85, 0.85], '#facc15', [0.5, 0.8, 0.2]);
  await saveGlb('construction-crane-wreck.glb', bw);
}

// 3. RADIO-TOWER & RADIO-TOWER-WRECK
async function generateRadioTower() {
  const b = new GlbBuilder();
  // Concrete Footing
  b.addBox([0, 0.3, 0], [3.2, 0.6, 3.2], '#475569');
  
  // Red & White Alternating Lattice Mast
  for (let s = 0; s < 6; s++) {
    const col = s % 2 === 0 ? '#ef4444' : '#f8fafc';
    const rTop = 0.85 * (1 - s * 0.12);
    const rBot = 0.85 * (1 - (s - 1) * 0.12);
    b.addCylinder([0, 3.2 + s * 5.2, 0], rTop, rBot, 5.2, 6, col);
  }
  
  // Directional Drum Microwave Dishes & Feedhorns
  [-1.1, 1.1].forEach((dx, idx) => {
    b.addCylinder([dx, 18.5, 0], 0.75, 0.25, 0.35, 12, '#cbd5e1', [0, 0, (idx === 0 ? -1 : 1) * 0.3]);
    b.addCylinder([dx * 1.25, 18.5, 0], 0.08, 0.08, 0.3, 6, '#0f172a');
  });
  
  // Top Lightning Rod & Strobe Beacon
  b.addCylinder([0, 32.5, 0], 0.08, 0.16, 2.5, 6, '#f8fafc');
  b.addSphere([0, 33.8, 0], 0.32, 8, '#ef4444');
  
  await saveGlb('radio-tower.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 3, 0], 0.8, 0.85, 6.0, 6, '#ef4444');
  bw.addCylinder([6, 2, 2], 0.45, 0.7, 22.0, 6, '#ef4444', [0.3, 0.5, 1.42]);
  bw.addCylinder([12, 0.5, -2], 0.75, 0.25, 0.35, 8, '#cbd5e1', [0.8, 0.2, 0.4]);
  await saveGlb('radio-tower-wreck.glb', bw);
}

// 4. COMMUTER-BUS & COMMUTER-BUS-WRECK
async function generateCommuterBus() {
  const b = new GlbBuilder();
  // Transit Bus Body (Action Transit Cyan/White)
  b.addBox([0, 1.55, 0], [2.65, 2.25, 8.8], '#0284c7');
  b.addBox([0, 2.45, 0], [2.68, 0.75, 8.82], '#f8fafc'); // White roof
  
  // Rooftop AC Pods
  b.addBox([0, 2.9, 1.2], [1.8, 0.35, 2.4], '#cbd5e1');
  b.addBox([0, 2.9, -2.2], [1.8, 0.35, 2.4], '#cbd5e1');
  
  // Yellow LED Destination Sign
  b.addBox([0, 2.35, 4.42], [2.2, 0.38, 0.05], '#facc15');
  
  // Panoramic Windshield & Side Windows
  b.addBox([0, 1.75, 4.38], [2.5, 1.1, 0.1], '#38bdf8'); // Windshield
  b.addBox([0, 1.75, -4.38], [2.5, 1.1, 0.1], '#38bdf8'); // Rear glass
  b.addBox([0, 1.8, 0], [2.72, 0.95, 8.2], '#38bdf8'); // Side windows
  
  // Passenger Bi-Fold Doors
  b.addBox([1.35, 1.25, 2.4], [0.08, 1.8, 1.4], '#0f172a');
  b.addBox([1.35, 1.25, -1.8], [0.08, 1.8, 1.4], '#0f172a');
  
  // Headlights & Impact Bumpers
  b.addBox([0, 0.5, 4.45], [2.7, 0.3, 0.15], '#0f172a'); // Front bumper
  b.addBox([0, 0.5, -4.45], [2.7, 0.3, 0.15], '#0f172a'); // Rear bumper
  [-0.95, 0.95].forEach(hx => {
    b.addBox([hx, 0.75, 4.43], [0.45, 0.22, 0.06], '#fef08a');
    b.addBox([hx, 0.75, -4.43], [0.45, 0.22, 0.06], '#dc2626');
  });
  
  // 6 Heavy-Duty Wheels (Dual Rear Axle)
  const busWheels = [
    [-1.35, 0.45, 2.6], [1.35, 0.45, 2.6],
    [-1.35, 0.45, -2.0], [1.35, 0.45, -2.0],
    [-1.35, 0.45, -3.2], [1.35, 0.45, -3.2]
  ];
  busWheels.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.45, 0.45, 0.35, 16, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.04 : -0.04), wy, wz], 0.25, 0.25, 0.36, 10, '#cbd5e1', [0, 0, Math.PI / 2]);
  });
  
  await saveGlb('commuter-bus.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.8, 0], [2.65, 1.2, 8.5], '#0284c7', [0.15, 0.05, 0.45]); // Rolled over bus
  bw.addBox([0.5, 0.4, 2], [2.4, 0.3, 3.0], '#f8fafc', [-0.3, 0.5, 0.2]); // Detached roof section
  await saveGlb('commuter-bus-wreck.glb', bw);
}

export async function run() {
  console.log('Generating Region 3 (Metro Row) 3D Models & Wreck Pairs...\n');
  await generateSkyscraper();
  await generateConstructionCrane();
  await generateRadioTower();
  await generateCommuterBus();
  console.log('\nAll Metro Row models successfully generated!\n');
}

if (process.argv[1]?.endsWith('generate-metro-models.mjs')) {
  run().catch(console.error);
}
