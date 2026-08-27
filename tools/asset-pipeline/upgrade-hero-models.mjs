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
  // Van Body
  b.addBox([0, 1.2, 0], [2.4, 1.8, 5.2], '#f8fafc');
  // Blue Broadcast Stripe
  b.addBox([0, 1.1, 0], [2.44, 0.4, 5.22], '#0284c7');
  // Red Lower Trim
  b.addBox([0, 0.4, 0], [2.42, 0.2, 5.22], '#ef4444');
  // Windshield & Front Cab
  b.addBox([0, 1.35, 1.9], [2.3, 1.1, 1.2], '#38bdf8', [-0.2, 0, 0]);
  b.addBox([0, 0.75, 2.5], [2.35, 0.8, 0.8], '#f8fafc'); // Front Hood
  b.addBox([0, 0.7, 2.92], [2.1, 0.5, 0.1], '#0f172a'); // Grill
  // Headlights
  b.addBox([-0.85, 0.75, 2.93], [0.35, 0.25, 0.08], '#fef08a');
  b.addBox([0.85, 0.75, 2.93], [0.35, 0.25, 0.08], '#fef08a');
  // Side Windows
  b.addBox([0, 1.5, -0.2], [2.44, 0.6, 2.4], '#0284c7');
  // Roof Satellite Uplink Dish
  b.addCylinder([0, 2.3, -1.2], 0.15, 0.2, 0.5, 8, '#64748b'); // Dish Mount
  b.addCylinder([0, 2.8, -1.2], 0.9, 0.2, 0.25, 12, '#e2e8f0', [0.45, 0, 0]); // Parabolic Dish
  b.addBox([0, 3.1, -1.0], [0.08, 0.08, 0.6], '#f59e0b'); // Feed Horn
  // Amber Warning Light
  b.addCylinder([0, 2.2, 1.2], 0.2, 0.2, 0.25, 8, '#f59e0b');
  // 4 Wheels
  const wheelOffsets = [[-1.25, 0.45, 1.5], [1.25, 0.45, 1.5], [-1.25, 0.45, -1.5], [1.25, 0.45, -1.5]];
  wheelOffsets.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.45, 0.45, 0.35, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), wy, wz], 0.22, 0.22, 0.36, 8, '#cbd5e1', [0, 0, Math.PI / 2]);
  });
  await saveGlb('news-van.glb', b);

  // Wreck: Crushed roof, sheared dish, flat tires
  const bw = new GlbBuilder();
  bw.addBox([0, 0.7, 0], [2.5, 1.0, 5.0], '#f8fafc', [0.1, 0, 0.15]);
  bw.addBox([0.2, 1.1, -0.4], [2.2, 0.6, 3.2], '#0284c7', [-0.2, 0.3, 0.25]); // Crushed cab
  bw.addCylinder([-1.4, 0.25, 1.2], 0.9, 0.2, 0.25, 10, '#cbd5e1', [1.2, 0.4, -0.8]); // Smashed dish
  bw.addBox([1.6, 0.2, -1.0], [1.2, 0.8, 0.1], '#f8fafc', [0.4, 0.8, 0.2]); // Detached door
  await saveGlb('news-van-wreck.glb', bw);
}

// 2. STORM-CHASER-VEHICLE & STORM-CHASER-VEHICLE-WRECK
async function upgradeStormChaser() {
  const b = new GlbBuilder();
  // Armored SUV Chassis (Matte Charcoal)
  b.addBox([0, 1.1, 0], [2.5, 1.4, 5.4], '#1e293b');
  b.addBox([0, 0.7, 2.6], [2.4, 0.7, 0.9], '#0f172a'); // Armored Bumper
  // Yellow Hazard Decals
  b.addBox([0, 1.05, 0], [2.54, 0.25, 5.42], '#fbbf24');
  // Armored Slit Windows
  b.addBox([0, 1.35, 0.6], [2.35, 0.6, 2.8], '#38bdf8');
  // External Tubular Roll Cage
  [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]].forEach(([cx, cz]) => {
    b.addCylinder([cx, 1.4, cz], 0.07, 0.07, 1.8, 6, '#64748b');
  });
  b.addBox([0, 2.0, 0], [2.6, 0.1, 3.6], '#475569'); // Roof Rack
  // Roof-Mounted Doppler Radar Dome
  b.addSphere([0, 2.45, -0.6], 0.55, 10, '#38bdf8');
  b.addCylinder([0, 2.15, -0.6], 0.2, 0.3, 0.35, 8, '#64748b');
  // Anemometer Wind Cups
  b.addCylinder([0.8, 2.5, 0.8], 0.04, 0.04, 0.8, 6, '#e2e8f0');
  b.addSphere([0.8, 2.9, 0.8], 0.14, 6, '#ef4444');
  // Heavy Off-Road Wheels
  const wheels = [[-1.35, 0.55, 1.6], [1.35, 0.55, 1.6], [-1.35, 0.55, -1.6], [1.35, 0.55, -1.6]];
  wheels.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.55, 0.55, 0.45, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.06 : -0.06), wy, wz], 0.28, 0.28, 0.46, 8, '#fbbf24', [0, 0, Math.PI / 2]);
  });
  await saveGlb('storm-chaser-vehicle.glb', b);

  // Wreck: Rolled, shattered cage & dome
  const bw = new GlbBuilder();
  bw.addBox([0, 0.8, 0], [2.6, 1.2, 5.2], '#1e293b', [0.4, 0.2, 1.8]); // Rolled SUV
  bw.addSphere([1.5, 0.3, 0.8], 0.45, 8, '#0284c7'); // Broken dome
  bw.addCylinder([-1.4, 0.3, -1.2], 0.07, 0.07, 1.8, 6, '#64748b', [0.3, 0.6, 0.8]); // Bent cage pipe
  await saveGlb('storm-chaser-vehicle-wreck.glb', bw);
}

// 3. PICKUP-TRUCK & PICKUP-TRUCK-WRECK
async function upgradePickupTruck() {
  const b = new GlbBuilder();
  // Cab (Crimson Red)
  b.addBox([0, 1.3, 0.5], [2.3, 1.4, 2.2], '#b91c1c');
  b.addBox([0, 1.45, 0.6], [2.34, 0.7, 1.8], '#38bdf8', [-0.15, 0, 0]); // Windshield
  // Hood & Front
  b.addBox([0, 0.85, 2.0], [2.25, 0.75, 1.6], '#b91c1c');
  b.addBox([0, 0.8, 2.82], [2.1, 0.5, 0.1], '#e2e8f0'); // Chrome Grill
  b.addBox([0, 0.45, 2.85], [2.35, 0.3, 0.25], '#cbd5e1'); // Front Bumper
  // Open Cargo Bed
  b.addBox([0, 0.8, -1.6], [2.25, 0.7, 2.8], '#991b1b');
  b.addBox([-1.05, 1.2, -1.6], [0.12, 0.45, 2.7], '#78350f'); // Wooden Stake Side L
  b.addBox([1.05, 1.2, -1.6], [0.12, 0.45, 2.7], '#78350f'); // Wooden Stake Side R
  // Tool Box in Bed
  b.addBox([0, 1.0, -0.6], [2.0, 0.6, 0.7], '#94a3b8');
  // 4 Wheels
  const wheels = [[-1.2, 0.45, 1.4], [1.2, 0.45, 1.4], [-1.2, 0.45, -1.8], [1.2, 0.45, -1.8]];
  wheels.forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.45, 0.45, 0.35, 12, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), wy, wz], 0.22, 0.22, 0.36, 8, '#e2e8f0', [0, 0, Math.PI / 2]);
  });
  await saveGlb('pickup-truck.glb', b);

  // Wreck: Smashed bed, crushed cab
  const bw = new GlbBuilder();
  bw.addBox([0.2, 0.7, 0.6], [2.2, 1.0, 2.0], '#b91c1c', [0.2, 0.4, -0.35]);
  bw.addBox([-0.4, 0.5, -1.4], [2.2, 0.6, 2.4], '#991b1b', [-0.3, 0.2, 0.45]);
  bw.addBox([1.4, 0.2, 0.4], [1.8, 0.5, 0.6], '#94a3b8', [0.4, 0.5, 0.1]); // Tossed toolbox
  await saveGlb('pickup-truck-wreck.glb', bw);
}

// 4. TRACTOR & TRACTOR-WRECK
async function upgradeTractor() {
  const b = new GlbBuilder();
  // Engine Block (John Deere Green)
  b.addBox([0, 0.95, 0.6], [1.4, 1.1, 2.2], '#15803d');
  b.addBox([0, 0.95, 1.72], [1.3, 0.8, 0.1], '#facc15'); // Yellow Front Grill
  // Driver Seat Platform & Mudguards
  b.addBox([0, 1.1, -0.8], [1.6, 0.5, 1.4], '#15803d');
  b.addBox([0, 1.55, -1.0], [0.8, 0.5, 0.8], '#0f172a'); // Black Seat
  b.addCylinder([0, 1.6, -0.1], 0.06, 0.06, 0.8, 6, '#0f172a', [0.4, 0, 0]); // Steering Column
  b.addTorus([0, 1.95, -0.25], 0.28, 0.04, 8, 12, '#0f172a', [0.4, 0, 0]); // Steering Wheel
  // Vertical Exhaust Stack
  b.addCylinder([0.45, 2.1, 0.8], 0.06, 0.06, 1.4, 6, '#334155');
  b.addCylinder([0.45, 2.85, 0.8], 0.09, 0.04, 0.2, 6, '#334155'); // Flapper Cap
  // Giant Rear Cleated Wheels (Yellow Hubs)
  [[-1.15, 1.0, -0.9], [1.15, 1.0, -0.9]].forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 1.0, 1.0, 0.55, 14, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.08 : -0.08), wy, wz], 0.55, 0.55, 0.56, 10, '#facc15', [0, 0, Math.PI / 2]);
  });
  // Front Steering Wheels (Smaller)
  [[-0.85, 0.45, 1.5], [0.85, 0.45, 1.5]].forEach(([wx, wy, wz]) => {
    b.addCylinder([wx, wy, wz], 0.45, 0.45, 0.3, 10, '#0f172a', [0, 0, Math.PI / 2]);
    b.addCylinder([wx + (wx > 0 ? 0.05 : -0.05), wy, wz], 0.25, 0.25, 0.32, 8, '#facc15', [0, 0, Math.PI / 2]);
  });
  await saveGlb('tractor.glb', b);

  // Wreck: Overturned, detached wheel
  const bw = new GlbBuilder();
  bw.addBox([0, 0.8, 0.2], [1.5, 1.1, 2.6], '#15803d', [0.4, 0.3, 2.4]); // Overturned body
  bw.addCylinder([1.8, 0.3, -0.8], 1.0, 1.0, 0.5, 12, '#0f172a', [0.2, 0.5, 0.1]); // Detached rear wheel
  bw.addCylinder([-1.4, 0.2, 1.2], 0.06, 0.06, 1.2, 6, '#334155', [0.8, 0.2, 0.9]); // Broken exhaust
  await saveGlb('tractor-wreck.glb', bw);
}

// 5. GAS-STATION & GAS-STATION-WRECK
async function upgradeGasStation() {
  const b = new GlbBuilder();
  // Convenience Store Back Building
  b.addBox([0, 3.2, -6.5], [14.0, 6.0, 7.0], '#f8fafc');
  b.addBox([0, 6.35, -6.5], [14.4, 0.4, 7.4], '#dc2626'); // Red Roof Fascia
  b.addBox([0, 2.5, -2.95], [6.0, 3.2, 0.15], '#38bdf8'); // Glass Entrance Doors
  b.addBox([0, 5.0, -2.95], [8.0, 1.2, 0.15], '#facc15'); // Store Sign
  // Rooftop AC / HVAC Unit
  b.addBox([-3.5, 6.9, -6.5], [2.2, 1.1, 2.2], '#64748b');
  // Canopy Support Columns (Steel)
  [[-5.2, 2.8, 2.0], [5.2, 2.8, 2.0]].forEach(([cx, cy, cz]) => {
    b.addCylinder([cx, cy, cz], 0.35, 0.35, 5.6, 8, '#e2e8f0');
    b.addBox([cx, 0.4, cz], [1.2, 0.8, 1.2], '#dc2626'); // Red Base Bollard
  });
  // Canopy Roof
  b.addBox([0, 5.8, 2.0], [16.0, 1.0, 9.0], '#f8fafc');
  b.addBox([0, 5.8, 2.0], [16.2, 0.5, 9.2], '#dc2626'); // Red Canopy Stripe
  // Fuel Pump Islands
  [[-5.2, 0.9, 2.0], [5.2, 0.9, 2.0]].forEach(([px, py, pz]) => {
    b.addBox([px, 0.15, pz], [1.6, 0.3, 4.2], '#94a3b8'); // Concrete Island
    b.addBox([px, 1.1, pz - 0.9], [0.8, 1.6, 0.8], '#dc2626'); // Pump A
    b.addBox([px, 1.1, pz + 0.9], [0.8, 1.6, 0.8], '#dc2626'); // Pump B
    b.addBox([px, 1.2, pz - 0.9], [0.85, 0.5, 0.4], '#fef08a'); // Digital Screen
    b.addBox([px, 1.2, pz + 0.9], [0.85, 0.5, 0.4], '#fef08a');
  });
  await saveGlb('gas-station.glb', b);

  // Wreck: Collapsed canopy, smashed shop
  const bw = new GlbBuilder();
  bw.addBox([0, 2.2, -6.5], [14.0, 4.0, 7.0], '#f8fafc', [0.08, 0, 0.05]);
  bw.addBox([0.5, 1.8, 1.8], [15.5, 0.8, 8.8], '#dc2626', [0.35, 0.1, -0.42]); // Collapsed canopy
  bw.addBox([-4.5, 0.6, 2.2], [0.8, 1.2, 0.8], '#b91c1c', [0.5, 0.4, 0.8]); // Smashed pump
  await saveGlb('gas-station-wreck.glb', bw);
}

// 6. POWER-POLE & POWER-POLE-WRECK
async function upgradePowerPole() {
  const b = new GlbBuilder();
  // Weathered Wooden Mast
  b.addCylinder([0, 5.5, 0], 0.22, 0.32, 11.0, 8, '#78350f');
  // Horizontal Crossarms
  b.addBox([0, 9.8, 0], [3.2, 0.2, 0.2], '#78350f');
  b.addBox([0, 10.6, 0], [2.4, 0.2, 0.2], '#78350f');
  // Ceramic Insulators
  [-1.4, -0.6, 0.6, 1.4].forEach(ix => {
    b.addCylinder([ix, 10.05, 0], 0.08, 0.08, 0.3, 6, '#38bdf8');
  });
  [-1.0, 1.0].forEach(ix => {
    b.addCylinder([ix, 10.85, 0], 0.08, 0.08, 0.3, 6, '#38bdf8');
  });
  // Cylindrical Transformer Canister
  b.addCylinder([0.35, 8.4, 0], 0.35, 0.35, 1.2, 10, '#64748b');
  b.addCylinder([0.35, 9.05, 0], 0.38, 0.38, 0.1, 10, '#475569'); // Lid
  // Streetlamp Fixture Arm
  b.addBox([-0.9, 7.8, 0], [1.8, 0.08, 0.08], '#475569', [0, 0, -0.2]);
  b.addCylinder([-1.8, 7.5, 0], 0.25, 0.15, 0.3, 8, '#fef08a'); // Lamp Bell
  await saveGlb('power-pole.glb', b);

  // Wreck: Snapped splintered pole, dangling transformer
  const bw = new GlbBuilder();
  bw.addCylinder([0, 1.5, 0], 0.28, 0.32, 3.0, 8, '#78350f'); // Stump
  bw.addCylinder([2.8, 1.2, 0.4], 0.22, 0.26, 7.5, 8, '#78350f', [0.2, 0.4, 1.42]); // Fallen mast
  bw.addCylinder([4.2, 0.35, 0.8], 0.35, 0.35, 1.1, 8, '#475569', [0.8, 0.2, 0.4]); // Tossed transformer
  await saveGlb('power-pole-wreck.glb', bw);
}

async function run() {
  console.log('Upgrading hero models and creating missing wreck pairs...');
  await upgradeNewsVan();
  await upgradeStormChaser();
  await upgradePickupTruck();
  await upgradeTractor();
  await upgradeGasStation();
  await upgradePowerPole();
  console.log('All hero models successfully upgraded!\n');
}

run().catch(err => {
  console.error('Error upgrading hero models:', err);
  process.exit(1);
});
