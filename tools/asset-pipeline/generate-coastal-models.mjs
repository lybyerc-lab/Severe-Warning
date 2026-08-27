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

// 1. COW-17-WRECK
async function generateCow17Wreck() {
  const b = new GlbBuilder();
  // Scattered torso tilted
  b.addCylinder([0, 0.65, 0], 0.88, 0.78, 1.45, 10, '#f8fafc', [0.4, 0.3, 1.2]);
  // Head detached nearby
  b.addBox([1.5, 0.45, 0.6], [0.98, 0.92, 0.98], '#f8fafc', [0.8, -0.5, 0.4]);
  b.addBox([1.8, 0.35, 0.8], [0.82, 0.48, 0.62], '#fda4af', [0.8, -0.5, 0.4]);
  // Broken horns
  b.addCylinder([1.3, 0.85, 0.5], 0.05, 0.12, 0.55, 6, '#e2e8f0', [0.2, 0.6, 0.5]);
  // Discarded Moo Brew Cup lying on ground
  b.addCylinder([-1.4, 0.18, 0.8], 0.24, 0.19, 0.55, 10, '#b45309', [Math.PI / 2, 0.3, 0.5]);
  // Splayed legs
  b.addCylinder([-0.8, 0.35, -0.7], 0.22, 0.2, 1.15, 8, '#f8fafc', [-0.6, 0.4, -0.8]);
  b.addCylinder([0.9, 0.45, -0.6], 0.22, 0.2, 1.15, 8, '#f8fafc', [0.7, -0.3, 1.1]);
  await saveGlb('cow-17-wreck.glb', b);
}

// 2. SHRIMP-BOAT & SHRIMP-BOAT-WRECK
async function generateShrimpBoat() {
  const b = new GlbBuilder();
  // Lower Hull (Deep Navy Blue)
  b.addBox([0, 0.75, 0], [3.6, 1.3, 9.4], '#1e3a8a');
  b.addBox([0, 0.9, 4.4], [3.3, 1.5, 2.4], '#1e3a8a', [-0.22, 0, 0]); // Bow rake
  
  // Upper Deck & Gunwale Railings (White)
  b.addBox([0, 1.55, -0.4], [3.5, 0.4, 8.4], '#f8fafc');
  [-1.75, 1.75].forEach(gx => {
    b.addBox([gx, 1.9, -0.4], [0.1, 0.4, 8.4], '#ffffff');
  });
  
  // Wheelhouse Cabin & Navigation Electronics
  b.addBox([0, 2.6, -1.3], [2.7, 1.9, 2.9], '#f8fafc');
  b.addBox([0, 3.6, -1.3], [2.9, 0.22, 3.1], '#0284c7'); // Cabin Roof
  b.addBox([0, 2.7, 0.2], [2.3, 0.85, 0.15], '#38bdf8'); // Front window
  b.addBox([0, 3.9, -1.3], [0.4, 0.3, 0.4], '#0f172a'); // Marine radar pedestal
  b.addCylinder([0, 4.15, -1.3], 0.6, 0.6, 0.18, 10, '#ffffff'); // Radar scanner
  
  // Trawler Outrigger Mast, Rigging Stays & Boom Arms
  b.addCylinder([0, 4.4, 1.3], 0.14, 0.18, 4.5, 8, '#e2e8f0');
  b.addBox([-2.4, 4.0, 1.3], [4.4, 0.15, 0.15], '#e2e8f0', [0, 0, 0.42]); // Port Boom
  b.addBox([2.4, 4.0, 1.3], [4.4, 0.15, 0.15], '#e2e8f0', [0, 0, -0.42]); // Starboard Boom
  
  // Deck Winch Drum & Fish Cargo Crates
  b.addCylinder([0, 1.95, -3.2], 0.4, 0.4, 1.2, 10, '#475569', [0, 0, Math.PI/2]);
  b.addBox([0.75, 1.95, 2.5], [1.2, 0.85, 1.2], '#f59e0b');
  b.addBox([-0.75, 1.95, 2.3], [1.1, 0.75, 1.3], '#f59e0b');
  
  await saveGlb('shrimp-boat.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0.4, 0.5, -0.8], [3.6, 1.3, 4.8], '#1e3a8a', [0.35, 0.1, 0.75]);
  bw.addBox([-0.6, 0.4, 3.2], [3.3, 1.2, 3.8], '#1e3a8a', [-0.4, 0.2, -0.65]);
  bw.addBox([1.2, 1.1, -1.4], [2.5, 1.7, 2.7], '#f8fafc', [0.4, 0.2, 0.85]);
  bw.addCylinder([-1.8, 0.3, 1.6], 0.14, 0.18, 4.2, 6, '#e2e8f0', [0.8, 0.4, -1.2]);
  await saveGlb('shrimp-boat-wreck.glb', bw);
}

// 3. REFINERY-TANK & REFINERY-TANK-WRECK
async function generateRefineryTank() {
  const b = new GlbBuilder();
  // Concrete Foundation
  b.addCylinder([0, 0.35, 0], 5.9, 5.9, 0.7, 16, '#94a3b8');
  
  // Main Cylindrical Tank
  b.addCylinder([0, 4.3, 0], 5.5, 5.5, 7.4, 16, '#e2e8f0');
  
  // Hazard Warning Red Stripe & Pressure Relief Dome
  b.addCylinder([0, 5.8, 0], 5.56, 5.56, 1.5, 16, '#ef4444');
  b.addCylinder([0, 8.4, 0], 4.4, 5.5, 0.9, 16, '#cbd5e1');
  
  // Top Catwalk & Safety Railing
  b.addCylinder([0, 8.95, 0], 2.4, 2.4, 0.22, 12, '#475569');
  b.addCylinder([0, 9.3, 0], 2.4, 2.4, 0.45, 12, '#94a3b8');
  
  // Spiral Access Stairs
  b.addBox([2.9, 4.3, 4.7], [0.45, 8.2, 0.45], '#475569', [0.35, 0, 0]);
  
  await saveGlb('refinery-tank.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.25, 0], 5.9, 5.9, 0.5, 12, '#64748b');
  bw.addCylinder([-0.4, 2.6, 0], 5.3, 5.5, 4.2, 12, '#475569', [0.15, 0, 0.25]);
  bw.addCylinder([2.8, 1.8, 1.2], 4.2, 5.2, 0.8, 12, '#334155', [0.7, 0.3, -0.4]);
  bw.addBox([-2.8, 1.2, -1.8], [3.2, 1.4, 0.2], '#b91c1c', [0.4, 0.6, -0.5]);
  await saveGlb('refinery-tank-wreck.glb', bw);
}

// 4. FLARE-STACK & FLARE-STACK-WRECK
async function generateFlareStack() {
  const b = new GlbBuilder();
  // Concrete Pad
  b.addBox([0, 0.25, 0], [3.4, 0.5, 3.4], '#64748b');
  
  // 4 Lattice Mast Legs
  b.addCylinder([-0.95, 7.5, -0.95], 0.08, 0.15, 14.8, 6, '#e2e8f0', [0.06, 0, -0.06]);
  b.addCylinder([0.95, 7.5, -0.95], 0.08, 0.15, 14.8, 6, '#e2e8f0', [0.06, 0, 0.06]);
  b.addCylinder([-0.95, 7.5, 0.95], 0.08, 0.15, 14.8, 6, '#e2e8f0', [-0.06, 0, -0.06]);
  b.addCylinder([0.95, 7.5, 0.95], 0.08, 0.15, 14.8, 6, '#e2e8f0', [-0.06, 0, 0.06]);
  
  // Central Heavy Gas Line
  b.addCylinder([0, 7.5, 0], 0.38, 0.42, 15.0, 8, '#475569');
  
  // Tip Ignition Pilot & Flare Flame
  b.addCylinder([0, 15.4, 0], 0.55, 0.38, 0.8, 8, '#334155');
  b.addSphere([0, 16.5, 0], 0.95, 8, '#f97316'); // Glowing orange fire
  b.addSphere([0, 17.2, 0], 0.6, 8, '#fde047'); // Yellow core
  
  await saveGlb('flare-stack.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.25, 0], [3.4, 0.5, 3.4], '#64748b');
  bw.addCylinder([1.5, 2.5, 0], 0.38, 0.42, 14.0, 6, '#475569', [0.4, 0.2, 1.4]);
  await saveGlb('flare-stack-wreck.glb', bw);
}

// 5. PALM-TREE & PALM-TREE-WRECK
async function generatePalmTree() {
  const b = new GlbBuilder();
  // Segmented Curved Trunk
  b.addCylinder([0, 3.5, 0], 0.35, 0.55, 7.0, 8, '#78350f', [0.1, 0, 0.15]);
  
  // 7 Realistic Arched Palm Fronds & Coconuts
  b.addSphere([0.6, 7.1, 0.4], 0.45, 8, '#451a03'); // Coconuts cluster
  for (let f = 0; f < 7; f++) {
    const angle = (f * Math.PI * 2) / 7;
    const fx = Math.cos(angle) * 1.8;
    const fz = Math.sin(angle) * 1.8;
    b.addBox([0.6 + fx, 7.2, 0.4 + fz], [2.2, 0.12, 0.75], '#15803d', [Math.sin(angle) * 0.45, angle, Math.cos(angle) * -0.45]);
  }
  
  await saveGlb('palm-tree.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 1.0, 0], 0.48, 0.55, 2.0, 6, '#78350f'); // Snapped stump
  bw.addCylinder([2.5, 0.3, 1], 0.35, 0.45, 5.0, 6, '#78350f', [0.1, 0.4, 1.4]); // Fallen trunk
  await saveGlb('palm-tree-wreck.glb', bw);
}

// 6. CHANNEL-BUOY & CHANNEL-BUOY-WRECK
async function generateChannelBuoy() {
  const b = new GlbBuilder();
  // Red Cylindrical Float Hull
  b.addCylinder([0, 0.8, 0], 1.4, 1.6, 1.6, 12, '#dc2626');
  
  // Daymark Tower Cage & Radar Reflector
  b.addCylinder([0, 2.2, 0], 0.65, 1.2, 1.4, 6, '#dc2626');
  b.addBox([0, 2.6, 0], [0.75, 0.75, 0.75], '#cbd5e1', [Math.PI/4, Math.PI/4, 0]); // Radar reflector
  
  // Flashing Navigation Lantern Lens
  b.addCylinder([0, 3.3, 0], 0.3, 0.3, 0.45, 8, '#22c55e'); // Green nav light
  b.addSphere([0, 3.6, 0], 0.18, 6, '#86efac');
  
  await saveGlb('channel-buoy.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.4, 0], 1.4, 1.6, 1.0, 8, '#dc2626', [0.4, 0.2, 0.8]);
  bw.addCylinder([0.8, 0.2, 0.8], 0.65, 1.2, 1.0, 6, '#dc2626', [-0.5, 0.4, 1.2]);
  await saveGlb('channel-buoy-wreck.glb', bw);
}

export async function run() {
  console.log('Generating procedural coastal & wreck models...');
  await generateCow17Wreck();
  await generateShrimpBoat();
  await generateRefineryTank();
  await generateFlareStack();
  await generatePalmTree();
  await generateChannelBuoy();
  console.log('All coastal & wreck models generated successfully!\n');
}

if (process.argv[1]?.endsWith('generate-coastal-models.mjs')) {
  run().catch(console.error);
}
