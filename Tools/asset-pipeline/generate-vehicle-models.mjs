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
  b.addBox([0, 0.65, 0], [2.1, 0.65, 4.8], '#1e3a8a');
  
  // Passenger Greenhouse Cab
  b.addBox([0, 1.25, -0.2], [1.9, 0.75, 2.4], '#1e3a8a');
  
  // Sloped Windshield & Rear Window
  b.addBox([0, 1.25, 0.95], [1.86, 0.7, 0.8], '#38bdf8', [-0.35, 0, 0]); // Windshield
  b.addBox([0, 1.25, -1.35], [1.86, 0.7, 0.8], '#38bdf8', [0.35, 0, 0]); // Rear window
  b.addBox([0, 1.3, -0.2], [1.94, 0.55, 1.9], '#38bdf8'); // Side windows
  
  // Front Hood & Chrome Grill
  b.addBox([0, 0.8, 1.6], [2.05, 0.35, 1.4], '#1e3a8a');
  b.addBox([0, 0.75, 2.42], [1.8, 0.35, 0.08], '#e2e8f0'); // Chrome grill
  
  // High-Detail Headlights & Amber Turn Signals
  [-0.75, 0.75].forEach(hx => {
    b.addBox([hx, 0.78, 2.43], [0.35, 0.2, 0.06], '#fef08a'); // Headlight
    b.addBox([hx > 0 ? hx + 0.22 : hx - 0.22, 0.78, 2.41], [0.12, 0.18, 0.06], '#f59e0b'); // Amber signal
  });
  
  // Chrome Front and Rear Bumpers with License Plates
  b.addBox([0, 0.4, 2.45], [2.14, 0.25, 0.15], '#e2e8f0');
  b.addBox([0, 0.4, 2.53], [0.6, 0.2, 0.02], '#ffffff'); // Front plate
  
  b.addBox([0, 0.4, -2.45], [2.14, 0.25, 0.15], '#e2e8f0');
  b.addBox([0, 0.4, -2.53], [0.6, 0.2, 0.02], '#ffffff'); // Rear plate
  
  // Rear Taillight Bar
  b.addBox([0, 0.78, -2.42], [1.9, 0.2, 0.06], '#dc2626');
  
  // Side Mirrors
  [-1.08, 1.08].forEach(mx => {
    b.addBox([mx, 1.1, 0.7], [0.18, 0.14, 0.22], '#1e3a8a');
    b.addBox([mx > 0 ? mx + 0.09 : mx - 0.09, 1.1, 0.7], [0.02, 0.12, 0.18], '#38bdf8'); // Mirror glass
  });
  
  // 4 Alloy Wheels with Rubber Tires & Hubcaps
  const wheelPos = [[-1.08, 0.38, 1.4], [1.08, 0.38, 1.4], [-1.08, 0.38, -1.4], [1.08, 0.38, -1.4]];
  wheelPos.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.38, 0.38, 0.28, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.04 : -0.04), wy, wz], 0.2, 0.2, 0.29, 8, '#e2e8f0', [0, 0, Math.PI / 2]); // Chrome rim
  });
  
  await saveGlb('town-car.glb', b);
}

// 2. LOT-CAR (Sport Hatchback)
export async function generateLotCar() {
  const b = new GlbBuilder();
  // Vibrant Sunshine Yellow Body
  b.addBox([0, 0.6, 0], [1.95, 0.55, 4.0], '#eab308');
  b.addBox([0, 1.15, -0.2], [1.8, 0.7, 2.1], '#eab308');
  
  // Raked Windshield & Fastback Hatch
  b.addBox([0, 1.15, 0.75], [1.76, 0.65, 0.7], '#38bdf8', [-0.4, 0, 0]);
  b.addBox([0, 1.1, -1.15], [1.76, 0.65, 0.7], '#38bdf8', [0.45, 0, 0]);
  b.addBox([0, 1.2, -0.2], [1.84, 0.5, 1.6], '#38bdf8');
  
  // Rear Roof Sport Spoiler
  b.addBox([0, 1.55, -1.3], [1.6, 0.08, 0.35], '#0f172a');
  b.addBox([-0.6, 1.45, -1.3], [0.08, 0.2, 0.2], '#0f172a');
  b.addBox([0.6, 1.45, -1.3], [0.08, 0.2, 0.2], '#0f172a');
  
  // Front Mesh Grill & Headlights
  b.addBox([0, 0.65, 2.02], [1.6, 0.3, 0.06], '#0f172a');
  b.addBox([-0.65, 0.72, 2.03], [0.3, 0.18, 0.05], '#fef08a');
  b.addBox([0.65, 0.72, 2.03], [0.3, 0.18, 0.05], '#fef08a');
  
  // 4 Wheels
  const wheelPos = [[-1.02, 0.34, 1.1], [1.02, 0.34, 1.1], [-1.02, 0.34, -1.1], [1.02, 0.34, -1.1]];
  wheelPos.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.34, 0.34, 0.25, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.03 : -0.03), wy, wz], 0.18, 0.18, 0.26, 8, '#0f172a', [0, 0, Math.PI / 2]);
  });
  
  await saveGlb('lot-car.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.5, 0], [2.0, 0.6, 3.8], '#eab308', [0.2, 0.1, 0.35]);
  bw.addBox([0.2, 0.8, -0.2], [1.6, 0.4, 1.8], '#0f172a', [-0.3, 0.4, 0.2]); // Crushed roof
  bw.addCylinder([1.2, 0.2, 0.8], 0.34, 0.34, 0.25, 10, '#0f172a', [1.2, 0.2, 0.5]); // Detached wheel
  await saveGlb('lot-car-wreck.glb', bw);
}

// 3. PARKED-CAR (Station Wagon / Crossover)
export async function generateParkedCar() {
  const b = new GlbBuilder();
  // Forest Green Body
  b.addBox([0, 0.7, 0], [2.15, 0.7, 4.6], '#15803d');
  
  // Extended Long Wagon Greenhouse
  b.addBox([0, 1.3, -0.3], [1.95, 0.75, 2.8], '#15803d');
  b.addBox([0, 1.3, 1.0], [1.9, 0.7, 0.7], '#38bdf8', [-0.35, 0, 0]); // Windshield
  b.addBox([0, 1.3, -1.65], [1.9, 0.7, 0.2], '#38bdf8'); // Vertical tailgate window
  b.addBox([0, 1.32, -0.3], [1.98, 0.55, 2.4], '#38bdf8'); // Side glass
  
  // Black Tubular Roof Rails
  [-0.8, 0.8].forEach(rx => {
    b.addCylinder([rx, 1.75, -0.3], 0.04, 0.04, 2.6, 6, '#0f172a', [Math.PI/2, 0, 0]);
  });
  
  // Front Bumper with Fog Lights & Headlights
  b.addBox([0, 0.42, 2.33], [2.18, 0.28, 0.15], '#334155');
  [-0.75, 0.75].forEach(hx => {
    b.addBox([hx, 0.82, 2.33], [0.35, 0.22, 0.06], '#fef08a');
    b.addBox([hx, 0.42, 2.42], [0.15, 0.15, 0.04], '#fef08a'); // Fog lamp
  });
  
  // 4 Wheels
  const wheelPos = [[-1.1, 0.4, 1.3], [1.1, 0.4, 1.3], [-1.1, 0.4, -1.3], [1.1, 0.4, -1.3]];
  wheelPos.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.4, 0.4, 0.3, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.04 : -0.04), wy, wz], 0.22, 0.22, 0.31, 8, '#cbd5e1', [0, 0, Math.PI / 2]);
  });
  
  await saveGlb('parked-car.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.6, 0], [2.2, 0.7, 4.4], '#15803d', [0.15, -0.2, 0.4]);
  bw.addBox([-0.2, 0.9, -0.5], [1.7, 0.5, 2.4], '#334155', [0.3, 0.2, -0.2]);
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
