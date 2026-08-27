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

// 1. COW-17-WRECK (Tossed & upside-down bipedal cow wreck)
async function generateCow17Wreck() {
  const b = new GlbBuilder();
  // Scattered torso tilted
  b.addCylinder([0, 0.6, 0], 0.85, 0.75, 1.4, 10, '#f8fafc', [0.4, 0.3, 1.2]);
  // Head detached nearby
  b.addBox([1.5, 0.4, 0.6], [0.95, 0.9, 0.95], '#f8fafc', [0.8, -0.5, 0.4]);
  b.addBox([1.8, 0.3, 0.8], [0.8, 0.45, 0.6], '#fda4af', [0.8, -0.5, 0.4]);
  // Broken horn
  b.addCylinder([1.3, 0.8, 0.5], 0.05, 0.12, 0.5, 6, '#e2e8f0', [0.2, 0.6, 0.5]);
  // Discarded Moo Brew Cup lying on ground
  b.addCylinder([-1.4, 0.15, 0.8], 0.22, 0.18, 0.52, 10, '#b45309', [Math.PI / 2, 0.3, 0.5]);
  // Splayed legs
  b.addCylinder([-0.8, 0.3, -0.7], 0.22, 0.2, 1.1, 8, '#f8fafc', [-0.6, 0.4, -0.8]);
  b.addCylinder([0.9, 0.4, -0.6], 0.22, 0.2, 1.1, 8, '#f8fafc', [0.7, -0.3, 1.1]);
  await saveGlb('cow-17-wreck.glb', b);
}

// 2. SHRIMP-BOAT (Coastal Trawler with cabin, outriggers & hull)
async function generateShrimpBoat() {
  const b = new GlbBuilder();
  // Lower Hull (Deep Blue)
  b.addBox([0, 0.7, 0], [3.6, 1.2, 9.2], '#1e3a8a');
  // Bow Wedge / Front
  b.addBox([0, 0.85, 4.2], [3.2, 1.4, 2.2], '#1e3a8a', [-0.2, 0, 0]);
  // Upper Deck (White)
  b.addBox([0, 1.5, -0.4], [3.4, 0.4, 8.2], '#f8fafc');
  // Wheelhouse Cabin
  b.addBox([0, 2.5, -1.2], [2.6, 1.8, 2.8], '#f8fafc');
  b.addBox([0, 3.45, -1.2], [2.8, 0.2, 3.0], '#0284c7'); // Cabin Roof
  // Windows
  b.addBox([0, 2.6, 0.25], [2.2, 0.8, 0.15], '#0284c7');
  // Trawler Outrigger Mast & Boom Arms
  b.addCylinder([0, 4.2, 1.2], 0.12, 0.16, 4.2, 8, '#e2e8f0');
  b.addBox([-2.2, 3.8, 1.2], [4.2, 0.14, 0.14], '#e2e8f0', [0, 0, 0.4]); // Left Boom
  b.addBox([2.2, 3.8, 1.2], [4.2, 0.14, 0.14], '#e2e8f0', [0, 0, -0.4]); // Right Boom
  // Cargo Crates & Ice Chests
  b.addBox([0.7, 1.9, 2.4], [1.1, 0.8, 1.1], '#f59e0b');
  b.addBox([-0.7, 1.9, 2.2], [1.0, 0.7, 1.2], '#f59e0b');
  await saveGlb('shrimp-boat.glb', b);

  // SHRIMP-BOAT-WRECK (Cap-sized, split hull, snapped outriggers)
  const bw = new GlbBuilder();
  bw.addBox([0.4, 0.5, -0.8], [3.6, 1.2, 4.8], '#1e3a8a', [0.35, 0.1, 0.75]);
  bw.addBox([-0.6, 0.4, 3.2], [3.2, 1.1, 3.8], '#1e3a8a', [-0.4, 0.2, -0.65]);
  bw.addBox([1.2, 1.1, -1.4], [2.4, 1.6, 2.6], '#f8fafc', [0.4, 0.2, 0.85]);
  bw.addCylinder([-1.8, 0.3, 1.6], 0.12, 0.16, 4.0, 6, '#e2e8f0', [0.8, 0.4, -1.2]);
  bw.addBox([2.2, 0.3, 1.8], [1.0, 0.7, 1.0], '#f59e0b', [0.2, 0.5, 0.2]);
  await saveGlb('shrimp-boat-wreck.glb', bw);
}

// 3. REFINERY-TANK (Large industrial oil/fuel storage tank with access catwalk)
async function generateRefineryTank() {
  const b = new GlbBuilder();
  // Concrete Foundation
  b.addCylinder([0, 0.3, 0], 5.8, 5.8, 0.6, 16, '#94a3b8');
  // Main Cylindrical Tank
  b.addCylinder([0, 4.2, 0], 5.4, 5.4, 7.2, 16, '#e2e8f0');
  // Dome Roof
  b.addCylinder([0, 8.2, 0], 4.2, 5.4, 0.8, 16, '#cbd5e1');
  // Logo Stripe
  b.addCylinder([0, 5.6, 0], 5.46, 5.46, 1.4, 16, '#ef4444');
  // Top Catwalk & Railing
  b.addCylinder([0, 8.7, 0], 2.2, 2.2, 0.2, 12, '#475569');
  b.addBox([2.8, 4.2, 4.6], [0.4, 8.0, 0.4], '#475569', [0.35, 0, 0]); // Spiral Stairs
  await saveGlb('refinery-tank.glb', b);

  // REFINERY-TANK-WRECK (Ruptured, dented, burning sheet metal)
  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.25, 0], 5.8, 5.8, 0.5, 12, '#64748b');
  bw.addCylinder([-0.4, 2.6, 0], 5.2, 5.4, 4.2, 12, '#475569', [0.15, 0, 0.25]); // Crushed base
  bw.addCylinder([2.8, 1.8, 1.2], 4.0, 5.0, 0.8, 12, '#334155', [0.7, 0.3, -0.4]); // Torn dome
  bw.addBox([-2.8, 1.2, -1.8], [3.2, 1.4, 0.2], '#b91c1c', [0.4, 0.6, -0.5]); // Ripped panel
  await saveGlb('refinery-tank-wreck.glb', bw);
}

// 4. FLARE-STACK (Industrial petrochemical gas flare tower)
async function generateFlareStack() {
  const b = new GlbBuilder();
  // Concrete Pad
  b.addBox([0, 0.25, 0], [3.2, 0.5, 3.2], '#64748b');
  // Lattice Mast Legs
  b.addCylinder([-0.9, 7.5, -0.9], 0.08, 0.14, 14.5, 6, '#e2e8f0', [0.06, 0, -0.06]);
  b.addCylinder([0.9, 7.5, -0.9], 0.08, 0.14, 14.5, 6, '#e2e8f0', [0.06, 0, 0.06]);
  b.addCylinder([-0.9, 7.5, 0.9], 0.08, 0.14, 14.5, 6, '#e2e8f0', [-0.06, 0, -0.06]);
  b.addCylinder([0.9, 7.5, 0.9], 0.08, 0.14, 14.5, 6, '#e2e8f0', [-0.06, 0, 0.06]);
  // Central Gas Pipe
  b.addCylinder([0, 8.0, 0], 0.35, 0.35, 15.5, 8, '#475569');
  // Horizontal Cross Braces
  [3.5, 7.0, 10.5, 14.0].forEach(y => {
    b.addBox([0, y, 0], [1.8, 0.12, 1.8], '#94a3b8');
  });
  // Flare Tip Burner
  b.addCylinder([0, 16.0, 0], 0.55, 0.38, 1.2, 8, '#f59e0b');
  await saveGlb('flare-stack.glb', b);

  // FLARE-STACK-WRECK (Toppled lattice truss and bent stack)
  const bw = new GlbBuilder();
  bw.addBox([0, 0.25, 0], [3.2, 0.5, 3.2], '#475569');
  bw.addCylinder([4.2, 1.6, 0.8], 0.32, 0.35, 9.5, 8, '#334155', [0.2, 0.4, 1.45]); // Toppled pipe
  bw.addBox([3.5, 1.1, 0.5], [2.4, 0.8, 2.4], '#64748b', [0.4, 0.2, 1.3]);
  await saveGlb('flare-stack-wreck.glb', bw);
}

// 5. PALM-TREE (Tropical coastal palm)
async function generatePalmTree() {
  const b = new GlbBuilder();
  // Curved Segmented Trunk
  b.addCylinder([0, 1.5, 0], 0.32, 0.38, 3.0, 8, '#78350f', [0.08, 0, 0.05]);
  b.addCylinder([0.3, 4.2, 0.2], 0.26, 0.32, 2.8, 8, '#78350f', [0.15, 0, 0.12]);
  b.addCylinder([0.8, 6.8, 0.5], 0.22, 0.26, 2.6, 8, '#78350f', [0.22, 0, 0.18]);
  // Palm Fronds Canopy
  const frondCount = 7;
  for (let i = 0; i < frondCount; i++) {
    const angle = (i / frondCount) * Math.PI * 2;
    const fx = 0.8 + Math.cos(angle) * 1.8;
    const fz = 0.5 + Math.sin(angle) * 1.8;
    b.addBox([fx, 7.8 - Math.abs(Math.sin(angle)) * 0.4, fz], [2.2, 0.12, 0.85], '#15803d', [0.35, angle, 0.3]);
  }
  // Coconuts
  b.addCylinder([0.9, 7.4, 0.6], 0.18, 0.18, 0.35, 6, '#451a03');
  await saveGlb('palm-tree.glb', b);

  // PALM-TREE-WRECK (Uprooted, snapped trunk, stripped fronds)
  const bw = new GlbBuilder();
  bw.addCylinder([0.2, 0.4, 0], 0.35, 0.4, 0.8, 8, '#78350f', [0, 0, 0.1]); // Snapped stump
  bw.addCylinder([2.8, 0.5, 0.6], 0.25, 0.32, 5.2, 8, '#78350f', [0.2, 0.5, 1.48]); // Fallen trunk
  bw.addBox([5.2, 0.3, 1.2], [1.8, 0.1, 0.7], '#15803d', [0.1, 0.8, 0.2]); // Scattered frond
  await saveGlb('palm-tree-wreck.glb', bw);
}

// 6. CHANNEL-BUOY (Coastal navigational buoy with beacon cage)
async function generateChannelBuoy() {
  const b = new GlbBuilder();
  // Float Hull (Red)
  b.addCylinder([0, 0.8, 0], 1.2, 0.9, 1.6, 12, '#dc2626');
  // Waterline Collar
  b.addCylinder([0, 0.9, 0], 1.35, 1.35, 0.25, 12, '#0f172a');
  // Tower Superstructure
  b.addCylinder([0, 2.2, 0], 0.55, 0.9, 1.6, 8, '#dc2626');
  // Light Beacon & Solar Top
  b.addCylinder([0, 3.2, 0], 0.35, 0.35, 0.6, 8, '#fef08a');
  b.addBox([0, 3.65, 0], [0.9, 0.12, 0.9], '#0f172a'); // Solar Panel Cap
  await saveGlb('channel-buoy.glb', b);

  // CHANNEL-BUOY-WRECK (Torn off mooring, capsized)
  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.5, 0], 1.2, 0.9, 1.6, 10, '#991b1b', [0.8, 0.3, 1.2]);
  bw.addCylinder([0.8, 0.7, 0.6], 0.45, 0.7, 1.4, 8, '#7f1d1d', [0.9, 0.2, 1.3]);
  await saveGlb('channel-buoy-wreck.glb', bw);
}

async function run() {
  console.log('Generating procedural models...');
  await generateCow17Wreck();
  await generateShrimpBoat();
  await generateRefineryTank();
  await generateFlareStack();
  await generatePalmTree();
  await generateChannelBuoy();
  console.log('All coastal & wreck models generated successfully!\n');
}

run().catch(err => {
  console.error('Error generating models:', err);
  process.exit(1);
});
