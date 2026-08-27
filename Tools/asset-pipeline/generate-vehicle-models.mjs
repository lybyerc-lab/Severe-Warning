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

// 1. TOWN-CAR (Full-Size Sedan)
export async function generateTownCar() {
  const b = new GlbBuilder();
  // Lower Chassis & Dark Navy Body
  b.addBox([0, 0.65, 0], [2.15, 0.65, 4.8], '#1e3a8a');
  
  // Passenger Greenhouse Cab & Pillars
  b.addBox([0, 1.28, -0.2], [1.92, 0.78, 2.45], '#1e3a8a');
  
  // Sloped Windshield & Rear Window
  b.addBox([0, 1.26, 0.95], [1.88, 0.72, 0.8], '#38bdf8', [-0.36, 0, 0]); // Windshield
  b.addBox([0, 1.26, -1.35], [1.88, 0.72, 0.8], '#38bdf8', [0.36, 0, 0]); // Rear window
  b.addBox([0, 1.32, -0.2], [1.96, 0.58, 1.95], '#38bdf8'); // Side windows
  b.addBox([0, 1.32, -0.2], [1.97, 0.58, 0.12], '#0f172a'); // B-Pillar blackout
  
  // Windshield Wipers
  b.addBox([-0.4, 0.98, 1.15], [0.55, 0.03, 0.05], '#0f172a', [-0.2, 0, 0.3]);
  b.addBox([0.4, 0.98, 1.15], [0.55, 0.03, 0.05], '#0f172a', [-0.2, 0, 0.3]);
  
  // Front Hood & Chrome Horizontal Slat Grill
  b.addBox([0, 0.82, 1.6], [2.08, 0.35, 1.4], '#1e3a8a');
  b.addBox([0, 0.76, 2.43], [1.8, 0.35, 0.08], '#e2e8f0'); // Chrome surround
  for (let gy = 0.65; gy <= 0.88; gy += 0.07) {
    b.addBox([0, gy, 2.46], [1.6, 0.03, 0.04], '#0f172a'); // Slat
  }
  b.addSphere([0, 0.96, 2.38], 0.06, 6, '#facc15'); // Hood hood ornament / emblem
  
  // High-Detail Headlights & Amber Turn Signals
  [-0.75, 0.75].forEach(hx => {
    b.addBox([hx, 0.78, 2.44], [0.38, 0.22, 0.06], '#fef08a'); // Projector
    b.addBox([hx > 0 ? hx + 0.24 : hx - 0.24, 0.78, 2.42], [0.14, 0.2, 0.06], '#f59e0b'); // Amber marker
  });
  
  // Chrome Impact Bumpers with License Plates & Fog Lamps
  b.addBox([0, 0.42, 2.46], [2.18, 0.25, 0.16], '#cbd5e1');
  b.addBox([0, 0.42, 2.55], [0.65, 0.22, 0.02], '#ffffff'); // Front plate
  [-0.75, 0.75].forEach(fx => {
    b.addCylinder([fx, 0.38, 2.5], 0.08, 0.08, 0.06, 8, '#fef08a', [Math.PI/2, 0, 0]); // Fog lamp
  });
  
  b.addBox([0, 0.42, -2.46], [2.18, 0.25, 0.16], '#cbd5e1');
  b.addBox([0, 0.42, -2.55], [0.65, 0.22, 0.02], '#ffffff'); // Rear plate
  
  // Rear LED Taillight Bar with Reversing Lights
  b.addBox([0, 0.8, -2.43], [1.95, 0.22, 0.06], '#dc2626');
  b.addBox([0, 0.8, -2.44], [0.6, 0.12, 0.06], '#ffffff'); // White reverse section
  
  // Dual Chrome Exhaust Tips
  [-0.6, 0.6].forEach(ex => {
    b.addCylinder([ex, 0.28, -2.48], 0.06, 0.06, 0.2, 8, '#cbd5e1', [Math.PI/2, 0, 0]);
  });
  
  // Aerodynamic Side Mirrors with Reflective Mirror Face
  [-1.1, 1.1].forEach(mx => {
    b.addBox([mx, 1.12, 0.7], [0.2, 0.15, 0.24], '#1e3a8a');
    b.addBox([mx > 0 ? mx + 0.1 : mx - 0.1, 1.12, 0.7], [0.02, 0.13, 0.2], '#38bdf8');
  });
  
  // 4 Multi-Spoke Alloy Wheels with Deep Rubber Tires & Brake Calipers
  const wheelPos = [[-1.1, 0.38, 1.4], [1.1, 0.38, 1.4], [-1.1, 0.38, -1.4], [1.1, 0.38, -1.4]];
  wheelPos.forEach(([wx, wy, wz]) => {
    const sgn = wx > 0 ? 1 : -1;
    b.addCylinder([wx, wy, wz], 0.38, 0.38, 0.3, 16, '#0f172a', [0, 0, Math.PI / 2]); // Tire
    b.addCylinder([wx + sgn * 0.04, wy, wz], 0.22, 0.22, 0.31, 10, '#cbd5e1', [0, 0, Math.PI / 2]); // Alloy rim
    b.addCylinder([wx - sgn * 0.04, wy, wz], 0.16, 0.16, 0.12, 8, '#ef4444', [0, 0, Math.PI / 2]); // Red caliper
  });
  
  await saveGlb('town-car.glb', b);
}

// 2. LOT-CAR (Sport Hatchback)
export async function generateLotCar() {
  const b = new GlbBuilder();
  // Vibrant Sunshine Yellow Body with Aero Side Skirts
  b.addBox([0, 0.62, 0], [2.0, 0.58, 4.1], '#eab308');
  b.addBox([0, 1.18, -0.2], [1.82, 0.72, 2.15], '#eab308');
  
  // Raked Windshield & Fastback Hatch
  b.addBox([0, 1.16, 0.75], [1.78, 0.68, 0.72], '#38bdf8', [-0.4, 0, 0]);
  b.addBox([0, 1.12, -1.15], [1.78, 0.68, 0.72], '#38bdf8', [0.45, 0, 0]);
  b.addBox([0, 1.22, -0.2], [1.86, 0.52, 1.65], '#38bdf8');
  
  // Black Roof Aerodynamic Sport Wing Spoiler
  b.addBox([0, 1.6, -1.35], [1.65, 0.08, 0.38], '#0f172a');
  b.addBox([-0.65, 1.48, -1.35], [0.08, 0.22, 0.2], '#0f172a');
  b.addBox([0.65, 1.48, -1.35], [0.08, 0.22, 0.2], '#0f172a');
  
  // Front Mesh Grill & Projector Headlights
  b.addBox([0, 0.68, 2.06], [1.65, 0.32, 0.06], '#0f172a');
  b.addBox([-0.68, 0.74, 2.07], [0.32, 0.18, 0.05], '#fef08a');
  b.addBox([0.68, 0.74, 2.07], [0.32, 0.18, 0.05], '#fef08a');
  
  // 4 Wheels
  const wheelPos = [[-1.04, 0.35, 1.1], [1.04, 0.35, 1.1], [-1.04, 0.35, -1.1], [1.04, 0.35, -1.1]];
  wheelPos.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.35, 0.35, 0.26, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.03 : -0.03), wy, wz], 0.2, 0.2, 0.27, 8, '#0f172a', [0, 0, Math.PI / 2]);
  });
  
  await saveGlb('lot-car.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.5, 0], [2.0, 0.6, 3.8], '#eab308', [0.2, 0.1, 0.35]);
  bw.addBox([0.2, 0.8, -0.2], [1.6, 0.4, 1.8], '#0f172a', [-0.3, 0.4, 0.2]);
  bw.addCylinder([1.2, 0.2, 0.8], 0.35, 0.35, 0.26, 10, '#0f172a', [1.2, 0.2, 0.5]);
  await saveGlb('lot-car-wreck.glb', bw);
}

// 3. PARKED-CAR (Station Wagon / Crossover)
export async function generateParkedCar() {
  const b = new GlbBuilder();
  // Forest Green Body
  b.addBox([0, 0.72, 0], [2.18, 0.72, 4.65], '#15803d');
  
  // Extended Long Wagon Greenhouse
  b.addBox([0, 1.34, -0.3], [1.96, 0.78, 2.85], '#15803d');
  b.addBox([0, 1.32, 1.0], [1.92, 0.72, 0.72], '#38bdf8', [-0.35, 0, 0]); // Windshield
  b.addBox([0, 1.32, -1.6], [1.92, 0.72, 0.72], '#38bdf8', [0.35, 0, 0]); // Tailgate glass
  b.addBox([0, 1.36, -0.3], [1.98, 0.58, 2.4], '#38bdf8'); // Long side windows
  
  // Tubular Roof Rails & Crossbars (Utility Rack)
  [-0.75, 0.75].forEach(rx => {
    b.addCylinder([rx, 1.82, -0.3], 0.04, 0.04, 2.6, 6, '#0f172a', [Math.PI / 2, 0, 0]);
    b.addBox([rx, 1.76, 0.8], [0.08, 0.1, 0.08], '#0f172a');
    b.addBox([rx, 1.76, -1.4], [0.08, 0.1, 0.08], '#0f172a');
  });
  b.addBox([0, 1.84, 0.4], [1.5, 0.04, 0.08], '#0f172a'); // Crossbar 1
  b.addBox([0, 1.84, -0.9], [1.5, 0.04, 0.08], '#0f172a'); // Crossbar 2
  
  // Front Bumper with Fog Lamps & Headlights
  b.addBox([0, 0.45, 2.38], [2.14, 0.26, 0.16], '#334155');
  [-0.75, 0.75].forEach(hx => {
    b.addBox([hx, 0.8, 2.36], [0.35, 0.2, 0.06], '#fef08a');
    b.addCylinder([hx, 0.45, 2.45], 0.07, 0.07, 0.05, 8, '#fef08a', [Math.PI / 2, 0, 0]);
  });
  
  // 4 Multi-Spoke Wheels
  const wheelPos = [[-1.1, 0.38, 1.35], [1.1, 0.38, 1.35], [-1.1, 0.38, -1.35], [1.1, 0.38, -1.35]];
  wheelPos.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.38, 0.38, 0.28, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.04 : -0.04), wy, wz], 0.22, 0.22, 0.29, 8, '#64748b', [0, 0, Math.PI / 2]);
  });
  
  await saveGlb('parked-car.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.6, 0], [2.2, 0.6, 4.4], '#15803d', [-0.25, 0.1, 0.4]);
  bw.addBox([0.5, 0.3, 1.5], [1.5, 0.1, 2.0], '#0f172a', [0.4, -0.3, 0.2]);
  await saveGlb('parked-car-wreck.glb', bw);
}

export async function run() {
  await generateTownCar();
  await generateLotCar();
  await generateParkedCar();
}

if (process.argv[1]?.endsWith('generate-vehicle-models.mjs')) {
  run().catch(console.error);
}
