import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GlbBuilder } from './glb-builder.mjs';

const modelsDir = path.resolve('assets/models');

async function saveGlb(filename, builder) {
  const buffer = builder.toGlbBuffer();
  const target = path.join(modelsDir, filename);
  await writeFile(target, buffer);
  console.log(`✓ Enhanced ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

// 1. NEWS-VAN & NEWS-VAN-WRECK
async function upgradeNewsVan() {
  const b = new GlbBuilder();
  // Van Body (White Broadcast Vehicle)
  b.addBox([0, 1.25, 0], [2.45, 1.85, 5.3], '#f8fafc');
  // Cyan Broadcast Stripe & Red Lower Trim
  b.addBox([0, 1.15, 0], [2.48, 0.45, 5.32], '#0284c7');
  b.addBox([0, 0.42, 0], [2.46, 0.22, 5.32], '#ef4444');
  
  // Windshield & Front Cab
  b.addBox([0, 1.4, 1.95], [2.35, 1.15, 1.25], '#38bdf8', [-0.2, 0, 0]);
  b.addBox([0, 0.78, 2.55], [2.4, 0.82, 0.85], '#f8fafc');
  b.addBox([0, 0.72, 2.98], [2.15, 0.52, 0.1], '#0f172a');
  
  // Headlights & Chrome Bumper
  [-0.88, 0.88].forEach(hx => {
    b.addBox([hx, 0.78, 2.99], [0.36, 0.26, 0.08], '#fef08a');
    b.addBox([hx > 0 ? hx + 0.22 : hx - 0.22, 0.78, 2.97], [0.12, 0.24, 0.06], '#f59e0b');
  });
  b.addBox([0, 0.45, 3.0], [2.5, 0.25, 0.15], '#cbd5e1'); // Front bumper
  
  // Side Windows & Side Mirrors
  b.addBox([0, 1.55, -0.2], [2.48, 0.65, 2.5], '#0284c7');
  [-1.28, 1.28].forEach(mx => {
    b.addBox([mx, 1.25, 1.8], [0.18, 0.22, 0.14], '#0f172a');
    b.addBox([mx > 0 ? mx + 0.08 : mx - 0.08, 1.25, 1.8], [0.02, 0.18, 0.1], '#38bdf8');
  });
  
  // Roof Satellite Uplink Mast & Parabolic Dish
  b.addCylinder([0, 2.35, -1.2], 0.16, 0.22, 0.55, 8, '#64748b');
  b.addCylinder([0, 2.9, -1.2], 0.95, 0.25, 0.28, 16, '#e2e8f0', [0.45, 0, 0]); // Parabolic dish
  b.addBox([0, 3.25, -1.0], [0.08, 0.08, 0.65], '#f59e0b'); // Feed horn
  b.addCylinder([0, 2.28, 1.2], 0.22, 0.22, 0.26, 8, '#f59e0b'); // Amber strobe beacon
  
  // 4 Wheels
  const wheelOffsets = [[-1.28, 0.46, 1.55], [1.28, 0.46, 1.55], [-1.28, 0.46, -1.55], [1.28, 0.46, -1.55]];
  wheelOffsets.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.46, 0.46, 0.36, 14, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), wy, wz], 0.24, 0.24, 0.37, 8, '#cbd5e1', [0, 0, Math.PI / 2]);
  });
  await saveGlb('news-van.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.7, 0], [2.5, 1.0, 5.0], '#f8fafc', [0.1, 0, 0.15]);
  bw.addBox([0.2, 1.1, -0.4], [2.2, 0.6, 3.2], '#0284c7', [-0.2, 0.3, 0.25]);
  bw.addCylinder([-1.4, 0.25, 1.2], 0.95, 0.25, 0.28, 10, '#cbd5e1', [1.2, 0.4, -0.8]);
  bw.addBox([1.6, 0.2, -1.0], [1.2, 0.8, 0.1], '#f8fafc', [0.4, 0.8, 0.2]);
  await saveGlb('news-van-wreck.glb', bw);
}

// 2. STORM-CHASER-VEHICLE & STORM-CHASER-VEHICLE-WRECK
async function upgradeStormChaser() {
  const b = new GlbBuilder();
  // Armored SUV Chassis (Matte Charcoal)
  b.addBox([0, 1.15, 0], [2.55, 1.45, 5.5], '#1e293b');
  b.addBox([0, 0.75, 2.7], [2.45, 0.75, 0.95], '#0f172a'); // Steel Bullbar Bumper
  
  // Yellow Hazard Decals
  b.addBox([0, 1.1, 0], [2.58, 0.28, 5.52], '#fbbf24');
  
  // Armored Slit Windows
  b.addBox([0, 1.4, 0.6], [2.4, 0.65, 2.9], '#38bdf8');
  
  // External Tubular Roll Cage Exo-Skeleton
  [[-1.34, -1.35], [1.34, -1.35], [-1.34, 1.35], [1.34, 1.35]].forEach(([cx, cz]) => {
    b.addCylinder([cx, 1.45, cz], 0.08, 0.08, 1.9, 6, '#64748b');
  });
  b.addBox([0, 2.05, 0], [2.65, 0.12, 3.7], '#475569'); // Roof Rack
  
  // Roof-Mounted Doppler Radar Dome & Anemometer
  b.addSphere([0, 2.55, -0.6], 0.58, 12, '#38bdf8');
  b.addCylinder([0, 2.22, -0.6], 0.22, 0.32, 0.38, 8, '#64748b');
  b.addCylinder([0.85, 2.6, 0.85], 0.04, 0.04, 0.85, 6, '#e2e8f0');
  b.addSphere([0.85, 3.05, 0.85], 0.15, 6, '#ef4444');
  
  // Heavy Off-Road Wheels with Beadlock Rims
  const wheels = [[-1.38, 0.58, 1.65], [1.38, 0.58, 1.65], [-1.38, 0.58, -1.65], [1.38, 0.58, -1.65]];
  wheels.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.58, 0.58, 0.48, 16, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.06 : -0.06), wy, wz], 0.3, 0.3, 0.49, 8, '#fbbf24', [0, 0, Math.PI / 2]);
  });
  await saveGlb('storm-chaser-vehicle.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.8, 0], [2.6, 1.2, 5.2], '#1e293b', [0.4, 0.2, 1.8]);
  bw.addSphere([1.5, 0.3, 0.8], 0.45, 8, '#0284c7');
  bw.addCylinder([-1.4, 0.3, -1.2], 0.07, 0.07, 1.8, 6, '#64748b', [0.3, 0.6, 0.8]);
  await saveGlb('storm-chaser-vehicle-wreck.glb', bw);
}

// 3. PICKUP-TRUCK & PICKUP-TRUCK-WRECK
async function upgradePickupTruck() {
  const b = new GlbBuilder();
  // Cab (Crimson Red)
  b.addBox([0, 1.35, 0.5], [2.35, 1.45, 2.25], '#b91c1c');
  b.addBox([0, 1.5, 0.6], [2.38, 0.75, 1.85], '#38bdf8', [-0.15, 0, 0]);
  
  // Hood, Chrome Grill & Bullbar
  b.addBox([0, 0.88, 2.05], [2.3, 0.78, 1.65], '#b91c1c');
  b.addBox([0, 0.84, 2.88], [2.15, 0.52, 0.1], '#e2e8f0');
  b.addBox([0, 0.5, 2.95], [2.4, 0.3, 0.15], '#cbd5e1'); // Bumper
  
  // Open Cargo Bed with Black Ribbed Liner
  b.addBox([0, 0.9, -1.4], [2.3, 0.8, 2.6], '#b91c1c');
  b.addBox([0, 0.92, -1.4], [2.0, 0.75, 2.4], '#1e293b'); // Bed liner
  
  // 4 Wheels
  const pWheels = [[-1.22, 0.48, 1.4], [1.22, 0.48, 1.4], [-1.22, 0.48, -1.4], [1.22, 0.48, -1.4]];
  pWheels.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.48, 0.48, 0.35, 14, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), wy, wz], 0.25, 0.25, 0.36, 8, '#cbd5e1', [0, 0, Math.PI / 2]);
  });
  await saveGlb('pickup-truck.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.7, 0], [2.4, 1.0, 4.8], '#b91c1c', [-0.3, 0.15, 0.45]);
  bw.addBox([0.5, 0.3, 1.2], [1.8, 0.2, 1.5], '#1e293b', [0.4, 0.6, -0.2]);
  await saveGlb('pickup-truck-wreck.glb', bw);
}

// 4. TRACTOR & TRACTOR-WRECK
async function upgradeTractor() {
  const b = new GlbBuilder();
  // Engine Block (Classic Farmall Red)
  b.addBox([0, 1.15, 0.8], [1.6, 1.2, 2.6], '#dc2626');
  
  // Front Radiator Grill & Louvers
  b.addBox([0, 1.15, 2.12], [1.45, 1.1, 0.1], '#1e293b');
  
  // Vertical Exhaust Stack with Rain Cap
  b.addCylinder([0.45, 2.2, 1.2], 0.08, 0.08, 1.4, 8, '#1e293b');
  b.addBox([0.45, 2.92, 1.2], [0.18, 0.04, 0.18], '#1e293b', [0.35, 0, 0]); // Rain flapper cap
  
  // Operator Station, Seat & Steering Wheel
  b.addBox([0, 1.5, -0.6], [1.2, 0.8, 1.2], '#dc2626');
  b.addBox([0, 1.85, -0.8], [0.8, 0.6, 0.6], '#0f172a'); // Suspension seat
  b.addCylinder([0, 1.95, -0.2], 0.04, 0.04, 0.6, 6, '#0f172a', [-0.4, 0, 0]);
  b.addCylinder([0, 2.2, -0.3], 0.3, 0.3, 0.04, 12, '#0f172a', [-0.4, 0, 0]); // Steering wheel
  
  // Curved Rear Wheel Mudguard Fenders
  [-1.15, 1.15].forEach(fx => {
    b.addBox([fx, 1.6, -0.8], [0.4, 0.8, 1.8], '#dc2626');
  });
  
  // Large Deep-Tread Rear Ag Wheels & Smaller Front Wheels
  [-1.25, 1.25].forEach(wx => {
    b.addCylinder([wx, 0.95, -0.8], 0.95, 0.95, 0.45, 16, '#0f172a', [0, 0, Math.PI / 2]); // Giant rear tire
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), 0.95, -0.8], 0.45, 0.45, 0.46, 8, '#facc15', [0, 0, Math.PI / 2]); // Yellow hub
  });
  [-0.95, 0.95].forEach(wx => {
    b.addCylinder([wx, 0.45, 1.6], 0.45, 0.45, 0.3, 12, '#0f172a', [0, 0, Math.PI / 2]); // Front tire
    b.addCylinder([wx + (wx > 0 ? 0.04 : -0.04), 0.45, 1.6], 0.22, 0.22, 0.31, 8, '#facc15', [0, 0, Math.PI / 2]);
  });
  await saveGlb('tractor.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.8, 0], [1.6, 1.0, 3.2], '#dc2626', [0.4, 0.15, 0.75]);
  bw.addCylinder([1.5, 0.3, 1.2], 0.95, 0.95, 0.45, 14, '#0f172a', [1.2, 0.4, 0.3]);
  await saveGlb('tractor-wreck.glb', bw);
}

// 5. GAS-STATION & GAS-STATION-WRECK
async function upgradeGasStation() {
  const b = new GlbBuilder();
  // Concrete Pad
  b.addBox([0, 0.25, 0], [13.4, 0.5, 9.4], '#64748b');
  
  // Overhead Canopy (Brand Cyan & Red)
  b.addBox([0, 5.4, 0], [12.8, 0.9, 8.8], '#0284c7');
  b.addBox([0, 5.4, 0], [12.9, 0.3, 8.9], '#ef4444'); // Red fascia stripe
  
  // 4 Steel Canopy Support Columns
  const cols = [[-4.5, -2.5], [4.5, -2.5], [-4.5, 2.5], [4.5, 2.5]];
  cols.forEach(([cx, cz]) => {
    b.addCylinder([cx, 2.7, cz], 0.25, 0.25, 5.0, 8, '#cbd5e1');
  });
  
  // 2 Dual Electronic Fuel Dispensers with Hose Nozzles
  [-2.2, 2.2].forEach(px => {
    b.addBox([px, 0.4, 0], [1.4, 0.3, 4.2], '#94a3b8'); // Raised pump island
    b.addBox([px, 1.6, 0], [0.8, 2.2, 1.6], '#ffffff'); // Pump body
    b.addBox([px, 2.0, 0], [0.84, 0.6, 1.2], '#0f172a'); // Digital screen
    b.addBox([px, 2.0, 0], [0.86, 0.4, 0.8], '#38bdf8'); // Lit LCD display
    // Flexible Hoses & Nozzles
    b.addCylinder([px, 1.2, 0.9], 0.04, 0.04, 1.4, 6, '#0f172a');
    b.addCylinder([px, 1.2, -0.9], 0.04, 0.04, 1.4, 6, '#0f172a');
  });
  
  // Safety Bollards
  [[-5.2, -3.2], [5.2, -3.2], [-5.2, 3.2], [5.2, 3.2]].forEach(([bx, bz]) => {
    b.addCylinder([bx, 0.5, bz], 0.14, 0.14, 1.0, 8, '#facc15');
  });
  
  await saveGlb('gas-station.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.25, 0], [13.4, 0.5, 9.4], '#64748b');
  bw.addBox([1, 1.2, 0], [12.0, 0.8, 8.0], '#0284c7', [0.25, 0.1, -0.45]); // Collapsed canopy
  bw.addBox([-2, 0.6, 1], [0.8, 1.2, 1.6], '#ffffff', [0.6, 0.3, 0.2]); // Toppled pump
  await saveGlb('gas-station-wreck.glb', bw);
}

// 6. POWER-POLE & POWER-POLE-WRECK
async function upgradePowerPole() {
  const b = new GlbBuilder();
  // Weathered Creosote Timber Mast
  b.addCylinder([0, 6.2, 0], 0.18, 0.25, 12.4, 8, '#78350f');
  
  // Upper Crossarm Timber & Steel Braces
  b.addBox([0, 11.2, 0], [3.2, 0.18, 0.18], '#78350f');
  b.addBox([0, 10.7, 0], [1.6, 0.06, 0.06], '#94a3b8', [0, 0, Math.PI/4]);
  b.addBox([0, 10.7, 0], [1.6, 0.06, 0.06], '#94a3b8', [0, 0, -Math.PI/4]);
  
  // 3 Glazed Ceramic Bell Insulators
  [-1.3, 0, 1.3].forEach(ix => {
    b.addCylinder([ix, 11.45, 0], 0.08, 0.12, 0.3, 8, '#0284c7');
    b.addSphere([ix, 11.62, 0], 0.06, 6, '#cbd5e1'); // Top pin
  });
  
  // Cylindrical Step-Down Distribution Transformer with Cooling Fins
  b.addCylinder([0.35, 9.4, 0], 0.35, 0.35, 0.9, 10, '#64748b');
  b.addCylinder([0.35, 9.9, 0], 0.38, 0.38, 0.1, 10, '#475569');
  
  await saveGlb('power-pole.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 1.2, 0], 0.22, 0.25, 2.4, 6, '#78350f'); // Splintered stump
  bw.addCylinder([2.2, 0.4, 1.0], 0.18, 0.22, 9.5, 6, '#78350f', [0.2, 0.4, 1.35]); // Snapped pole
  bw.addCylinder([4.0, 0.3, 0], 0.35, 0.35, 0.9, 8, '#64748b', [0.8, 0.3, 0.2]); // Dented transformer
  await saveGlb('power-pole-wreck.glb', bw);
}

export async function run() {
  console.log('Upgrading hero models and creating missing wreck pairs...');
  await upgradeNewsVan();
  await upgradeStormChaser();
  await upgradePickupTruck();
  await upgradeTractor();
  await upgradeGasStation();
  await upgradePowerPole();
  console.log('All hero models successfully upgraded!\n');
}

if (process.argv[1]?.endsWith('upgrade-hero-models.mjs')) {
  run().catch(console.error);
}
