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

// 1. COMMERCIAL-SHOP (Modern Strip Retail)
export async function generateCommercialShop() {
  const b = new GlbBuilder();
  // Concrete Foundation & Sidewalk
  b.addBox([0, 0.25, 0], [10.4, 0.5, 9.4], '#64748b');
  b.addBox([0, 0.25, 5.0], [10.4, 0.3, 1.6], '#94a3b8'); // Front apron
  
  // Stucco & Masonry Storefront
  b.addBox([0, 2.8, 0], [10.0, 4.6, 9.0], '#e2e8f0');
  b.addBox([0, 0.8, 0], [10.1, 1.2, 9.1], '#475569'); // Dark stone wainscot base
  
  // Large Plate-Glass Display Windows with Black Anodized Aluminum Frames
  b.addBox([-2.6, 2.2, 4.55], [3.6, 2.4, 0.1], '#38bdf8');
  b.addBox([2.6, 2.2, 4.55], [3.6, 2.4, 0.1], '#38bdf8');
  b.addBox([-2.6, 2.2, 4.53], [3.8, 2.6, 0.08], '#0f172a');
  b.addBox([2.6, 2.2, 4.53], [3.8, 2.6, 0.08], '#0f172a');
  
  // Commercial Double Glass Entry Doors
  b.addBox([0, 1.8, 4.55], [1.8, 2.4, 0.1], '#38bdf8');
  b.addBox([0, 1.8, 4.53], [2.0, 2.5, 0.08], '#0f172a');
  b.addCylinder([0.15, 1.6, 4.62], 0.04, 0.04, 0.6, 8, '#cbd5e1'); // Vertical bar handle
  b.addCylinder([-0.15, 1.6, 4.62], 0.04, 0.04, 0.6, 8, '#cbd5e1');
  
  // Striped Red/White Fabric Canvas Awning
  b.addWedge([0, 3.7, 5.2], [9.6, 0.9, 1.4], '#dc2626');
  for (let sx = -4.0; sx <= 4.0; sx += 1.6) {
    b.addBox([sx, 3.7, 5.2], [0.8, 0.92, 1.42], '#ffffff');
  }
  
  // Backlit Retail Fascia Signboard (Moo Mart)
  b.addBox([0, 4.5, 4.6], [8.0, 0.9, 0.25], '#0284c7');
  b.addBox([0, 4.5, 4.74], [7.6, 0.6, 0.05], '#facc15'); // Glowing text face
  
  // Rooftop Parapet Cap & Commercial HVAC Compressor
  b.addBox([0, 5.2, 0], [10.2, 0.3, 9.2], '#0f172a'); // Coping cap
  b.addBox([2.2, 5.8, -1.8], [1.8, 1.2, 1.8], '#94a3b8'); // AC unit
  b.addCylinder([2.2, 6.45, -1.8], 0.6, 0.6, 0.15, 12, '#475569'); // Fan grill
  b.addCylinder([-2.8, 5.7, 0], 0.2, 0.25, 1.0, 8, '#64748b'); // Exhaust pipe
  
  await saveGlb('commercial-shop.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.25, 0], [10.4, 0.5, 9.4], '#64748b');
  bw.addBox([-2, 1.2, 0], [5.5, 2.0, 8.0], '#e2e8f0', [0.1, -0.05, 0.25]);
  bw.addBox([2, 1.0, 0], [5.0, 1.6, 7.5], '#475569', [-0.2, 0.15, -0.15]);
  bw.addBox([0, 0.4, 4.5], [6.0, 0.2, 1.8], '#dc2626', [0.3, 0.4, 0.1]); // Smashed awning
  bw.addBox([3, 0.6, 3], [1.8, 1.2, 1.8], '#94a3b8', [0.6, 0.2, -0.5]); // Crushed AC unit
  await saveGlb('commercial-shop-wreck.glb', bw);
}

// 2. COMMERCIAL-SHOP-DECO (Art Deco Style)
export async function generateCommercialShopDeco() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [10.4, 0.6, 9.4], '#334155');
  
  // Limestone & Terrazzo Main Facade (Art Deco Cream / Teal)
  b.addBox([0, 3.2, 0], [10.0, 5.2, 9.0], '#fef3c7');
  b.addBox([0, 1.2, 0], [10.1, 1.8, 9.1], '#0f766e'); // Teal glazed ceramic base
  
  // Tiered Art Deco Stepped Parapet
  b.addBox([0, 6.1, 4.4], [10.2, 0.5, 0.4], '#d97706'); // Gold trim
  b.addBox([0, 6.6, 4.4], [6.0, 0.6, 0.4], '#d97706'); // Step 2
  b.addBox([0, 7.1, 4.4], [2.4, 0.5, 0.4], '#d97706'); // Center tower peak
  b.addSphere([0, 7.5, 4.4], 0.35, 8, '#f59e0b'); // Deco finial
  
  // Fluted Pilasters
  [-4.6, -1.8, 1.8, 4.6].forEach(px => {
    b.addBox([px, 3.5, 4.55], [0.6, 4.8, 0.3], '#047857');
  });
  
  // Brass Curved Display Windows
  b.addBox([-3.2, 2.2, 4.55], [2.0, 2.4, 0.1], '#38bdf8');
  b.addBox([3.2, 2.2, 4.55], [2.0, 2.4, 0.1], '#38bdf8');
  
  // Center Arched Recessed Entry
  b.addBox([0, 1.9, 4.3], [1.8, 2.6, 0.1], '#78350f'); // Wood & brass door
  b.addBox([0, 1.9, 4.32], [1.4, 1.8, 0.08], '#38bdf8');
  
  await saveGlb('commercial-shop-deco.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [10.4, 0.6, 9.4], '#334155');
  bw.addBox([0, 1.4, 0], [9.0, 2.2, 8.0], '#fef3c7', [0.15, 0.1, -0.2]);
  bw.addBox([2, 0.6, 3], [4.0, 0.8, 1.5], '#d97706', [0.4, 0.6, 0.2]); // Shattered deco crest
  await saveGlb('commercial-shop-deco-wreck.glb', bw);
}

// 3. COMMERCIAL-SHOP-MANSARD
export async function generateCommercialShopMansard() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [9.8, 0.6, 8.8], '#475569');
  
  // French Bistro Storefront (Warm Red Brick)
  b.addBox([0, 2.4, 0], [9.4, 3.6, 8.4], '#991b1b');
  
  // Curved Mansard Roof with Aged Copper Green Trim
  b.addWedge([0, 5.0, 0], [9.8, 2.2, 8.8], '#0d9488');
  b.addBox([0, 4.0, 0], [9.8, 0.2, 8.8], '#0f766e');
  
  // Mansard Dormer Windows
  [-2.6, 2.6].forEach(dx => {
    b.addBox([dx, 4.9, 4.3], [1.4, 1.4, 0.8], '#ffffff');
    b.addBox([dx, 4.9, 4.75], [1.0, 1.0, 0.1], '#38bdf8');
    b.addWedge([dx, 5.8, 4.3], [1.6, 0.6, 0.9], '#0d9488');
  });
  
  // Lower Display Windows & Bistro Door
  b.addBox([-2.4, 1.8, 4.25], [2.8, 2.0, 0.1], '#38bdf8');
  b.addBox([2.4, 1.8, 4.25], [2.8, 2.0, 0.1], '#38bdf8');
  b.addBox([0, 1.7, 4.25], [1.4, 2.2, 0.1], '#1e293b');
  
  // Striped Yellow/Black Bistro Awning
  b.addWedge([0, 3.2, 4.8], [9.0, 0.8, 1.2], '#eab308');
  
  await saveGlb('commercial-shop-mansard.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [9.8, 0.6, 8.8], '#475569');
  bw.addBox([-1.5, 1.2, 0], [5.0, 1.8, 7.0], '#991b1b', [0.1, -0.2, 0.25]);
  bw.addWedge([2, 1.0, 0], [7.0, 1.6, 6.5], '#0d9488', [-0.3, 0.2, -0.35]);
  await saveGlb('commercial-shop-mansard-wreck.glb', bw);
}

// 4. COMMERCIAL-SHOP-GABLE
export async function generateCommercialShopGable() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [9.4, 0.6, 8.4], '#64748b');
  b.addBox([0, 2.4, 0], [9.0, 3.6, 8.0], '#d97706'); // Timber siding
  
  // High Gable Roof (Cedar Shakes Brown)
  b.addWedge([0, 5.2, 0], [9.6, 2.6, 8.4], '#78350f');
  b.addBox([0, 4.0, 0], [9.4, 0.2, 8.2], '#ffffff');
  
  // Storefront Windows & Double Doors
  b.addBox([-2.2, 1.8, 4.05], [2.6, 2.0, 0.1], '#38bdf8');
  b.addBox([2.2, 1.8, 4.05], [2.6, 2.0, 0.1], '#38bdf8');
  b.addBox([0, 1.7, 4.05], [1.4, 2.2, 0.1], '#ffffff');
  
  // Wooden Boardwalk Porch
  b.addBox([0, 0.4, 4.9], [9.4, 0.3, 1.6], '#92400e');
  b.addBox([0, 3.2, 4.9], [9.4, 0.15, 1.6], '#78350f');
  [-4.0, -1.5, 1.5, 4.0].forEach(px => {
    b.addBox([px, 1.8, 5.5], [0.2, 2.6, 0.2], '#78350f');
  });
  
  await saveGlb('commercial-shop-gable.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [9.4, 0.6, 8.4], '#64748b');
  bw.addWedge([0, 1.2, 0], [8.0, 1.8, 7.0], '#78350f', [0.2, 0.1, -0.3]);
  await saveGlb('commercial-shop-gable-wreck.glb', bw);
}

// 5. GROCERY-STORE
export async function generateGroceryStore() {
  const b = new GlbBuilder();
  // Foundation
  b.addBox([0, 0.3, 0], [16.4, 0.6, 14.4], '#475569');
  
  // Concrete Main Retail Structure
  b.addBox([0, 3.2, 0], [16.0, 5.2, 14.0], '#f1f5f9');
  b.addBox([0, 1.0, 0], [16.1, 1.4, 14.1], '#0f766e'); // Dark teal accent stripe
  
  // Full-Height Automatic Glass Entry Foyer
  b.addBox([0, 2.4, 7.1], [6.2, 3.6, 0.3], '#0f172a');
  b.addBox([-1.4, 2.2, 7.26], [2.2, 2.8, 0.08], '#38bdf8'); // Sliding glass left
  b.addBox([1.4, 2.2, 7.26], [2.2, 2.8, 0.08], '#38bdf8'); // Sliding glass right
  b.addBox([0, 4.3, 7.3], [5.8, 0.3, 0.8], '#f8fafc'); // Foyer canopy
  
  // Display Window Banks
  b.addBox([-5.5, 2.2, 7.05], [4.4, 2.6, 0.1], '#38bdf8');
  b.addBox([5.5, 2.2, 7.05], [4.4, 2.6, 0.1], '#38bdf8');
  
  // Big Illuminated Supermarket Logo Signboard
  b.addBox([0, 5.0, 7.15], [10.0, 1.4, 0.3], '#047857');
  b.addBox([0, 5.0, 7.32], [9.4, 0.9, 0.05], '#fef08a'); // Glowing logo
  
  // Rooftop HVAC Compressors & Solar Array
  b.addBox([-4.0, 6.2, -2.0], [2.6, 1.4, 2.6], '#94a3b8');
  b.addBox([4.0, 6.2, -2.0], [2.6, 1.4, 2.6], '#94a3b8');
  b.addBox([0, 6.0, 2.0], [8.0, 0.2, 4.0], '#0284c7', [-0.15, 0, 0]); // Solar panels
  
  // Rear Loading Dock & Roll-Up Bay Door
  b.addBox([0, 1.8, -7.05], [4.2, 3.0, 0.1], '#64748b'); // Steel bay door
  b.addBox([0, 0.8, -7.5], [6.0, 1.0, 1.2], '#334155'); // Loading dock ramp
  
  await saveGlb('grocery-store.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 14.4], '#475569');
  bw.addBox([-3, 1.8, 0], [9.0, 2.8, 12.0], '#f1f5f9', [0.1, 0.05, -0.2]);
  bw.addBox([4, 1.4, 0], [8.0, 2.0, 11.0], '#0f766e', [-0.15, 0.1, 0.18]);
  bw.addBox([0, 0.6, 5], [6.0, 0.4, 3.0], '#047857', [0.3, 0.5, 0.1]); // Smashed sign
  await saveGlb('grocery-store-wreck.glb', bw);
}

// 6. CAR-DEALERSHIP
export async function generateCarDealership() {
  const b = new GlbBuilder();
  // Foundation
  b.addBox([0, 0.3, 0], [15.4, 0.6, 12.4], '#334155');
  
  // Polished Showroom Floor (White Porcelain Tile)
  b.addBox([0, 0.65, 2.0], [14.4, 0.1, 7.6], '#ffffff');
  
  // Glass Curtain-Wall Showroom (3 Sides Floor-to-Ceiling Glass)
  b.addBox([0, 2.8, 6.05], [14.6, 4.2, 0.1], '#38bdf8'); // Front glass
  b.addBox([-7.25, 2.8, 2.0], [0.1, 4.2, 8.0], '#38bdf8'); // Left glass
  b.addBox([7.25, 2.8, 2.0], [0.1, 4.2, 8.0], '#38bdf8'); // Right glass
  
  // Polished Chrome Corner Columns & Mullions
  [-7.2, 7.2].forEach(cx => {
    b.addCylinder([cx, 2.8, 6.0], 0.25, 0.25, 4.4, 8, '#e2e8f0');
  });
  [-3.6, 0, 3.6].forEach(mx => {
    b.addBox([mx, 2.8, 6.08], [0.15, 4.2, 0.1], '#0f172a');
  });
  
  // Service Bay & Office Annex (Back Half Solid Construction)
  b.addBox([0, 2.8, -3.2], [14.8, 4.4, 5.6], '#0284c7');
  b.addBox([0, 1.8, -5.95], [4.4, 2.8, 0.1], '#e2e8f0'); // Service bay roll-up door
  
  // Floating Canopy & Bold Dealership Crown Sign
  b.addBox([0, 5.1, 2.0], [15.2, 0.4, 8.8], '#0f172a'); // Black roof slab
  b.addBox([0, 5.7, 6.1], [10.0, 1.0, 0.25], '#ef4444'); // Red logo billboard
  b.addBox([0, 5.7, 6.25], [9.2, 0.6, 0.05], '#ffffff'); // Auto sales text
  
  await saveGlb('car-dealership.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [15.4, 0.6, 12.4], '#334155');
  bw.addBox([0, 1.5, -3], [12.0, 2.4, 5.0], '#0284c7', [0.15, 0.05, -0.2]);
  bw.addBox([0, 0.8, 3], [14.0, 0.4, 7.0], '#0f172a', [-0.25, 0.1, 0.3]); // Collapsed roof
  await saveGlb('car-dealership-wreck.glb', bw);
}

// 7. DISCOUNT-STORE
export async function generateDiscountStore() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#475569');
  
  // Big-Box Retail Building (Yellow & Navy Blue)
  b.addBox([0, 3.2, 0], [16.0, 5.2, 12.0], '#1e3a8a'); // Deep blue body
  b.addBox([0, 5.4, 6.05], [16.1, 1.0, 0.2], '#eab308'); // Bright yellow crown band
  
  // Center Entrance Portal with Yellow Arch
  b.addBox([0, 2.4, 6.1], [5.4, 3.6, 0.4], '#eab308');
  b.addBox([0, 1.8, 6.32], [3.8, 2.4, 0.1], '#38bdf8'); // Double doors
  
  // Large Discount Store Signboard
  b.addBox([0, 4.6, 6.2], [8.0, 1.2, 0.25], '#1e3a8a');
  b.addBox([0, 4.6, 6.35], [7.4, 0.8, 0.05], '#facc15');
  
  // Shopping Cart Return Corral on front sidewalk
  b.addBox([5.5, 0.6, 7.5], [2.2, 0.9, 4.0], '#cbd5e1');
  
  await saveGlb('discount-store.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#475569');
  bw.addBox([0, 1.6, 0], [14.0, 2.6, 10.0], '#1e3a8a', [0.1, -0.15, 0.2]);
  bw.addBox([0, 0.5, 5], [6.0, 0.3, 2.0], '#eab308', [0.3, 0.4, 0.1]);
  await saveGlb('discount-store-wreck.glb', bw);
}

// 8. INDUSTRIAL-WAREHOUSE & INDUSTRIAL-WAREHOUSE-CURVED
export async function generateIndustrialWarehouse() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  
  // Corrugated Steel Warehouse Walls (Industrial Gray)
  b.addBox([0, 3.4, 0], [16.0, 5.6, 12.0], '#64748b');
  
  // Gabled Steel Roof with Skylight Panels
  b.addWedge([0, 6.8, 0], [16.4, 2.2, 12.4], '#475569');
  b.addBox([0, 7.2, 0], [12.0, 0.1, 2.4], '#38bdf8'); // Translucent roof skylight
  
  // 2 Large Overhead Roll-Up Freight Doors
  b.addBox([-4.2, 2.4, 6.05], [4.4, 3.8, 0.1], '#94a3b8');
  b.addBox([4.2, 2.4, 6.05], [4.4, 3.8, 0.1], '#94a3b8');
  
  // Safety Yellow Bollards
  [-6.8, -1.6, 1.6, 6.8].forEach(bx => {
    b.addCylinder([bx, 0.6, 6.6], 0.15, 0.15, 1.0, 8, '#facc15');
  });
  
  await saveGlb('industrial-warehouse.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  bw.addBox([-2, 1.8, 0], [12.0, 2.8, 9.0], '#64748b', [0.15, 0.08, -0.3]);
  bw.addWedge([3, 1.2, 0], [10.0, 1.6, 9.0], '#475569', [-0.3, 0.2, 0.25]);
  await saveGlb('industrial-warehouse-wreck.glb', bw);

  // Curved Quonset Warehouse
  const bc = new GlbBuilder();
  bc.addBox([0, 0.3, 0], [14.4, 0.6, 14.4], '#334155');
  bc.addCylinder([0, 3.5, 0], 5.8, 5.8, 13.8, 16, '#64748b', [Math.PI / 2, 0, 0]);
  bc.addBox([0, 2.4, 6.95], [4.2, 3.6, 0.1], '#94a3b8'); // Endwall door
  await saveGlb('industrial-warehouse-curved.glb', bc);

  const bcw = new GlbBuilder();
  bcw.addBox([0, 0.3, 0], [14.4, 0.6, 14.4], '#334155');
  bcw.addCylinder([1, 1.5, 0], 5.8, 5.8, 12.0, 16, '#64748b', [1.2, 0.4, -0.6]); // Buckled quonset arch
  await saveGlb('industrial-warehouse-curved-wreck.glb', bcw);
}

export async function run() {
  await generateCommercialShop();
  await generateCommercialShopDeco();
  await generateCommercialShopMansard();
  await generateCommercialShopGable();
  await generateGroceryStore();
  await generateCarDealership();
  await generateDiscountStore();
  await generateIndustrialWarehouse();
}

if (process.argv[1]?.endsWith('generate-commercial-models.mjs')) {
  run().catch(console.error);
}
