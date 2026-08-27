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
  // Concrete Foundation & Front Sidewalk Apron
  b.addBox([0, 0.25, 0], [10.6, 0.5, 9.6], '#475569');
  b.addBox([0, 0.25, 5.2], [10.6, 0.28, 1.8], '#94a3b8');
  
  // Stucco & Masonry Storefront
  b.addBox([0, 2.9, 0], [10.0, 4.8, 9.0], '#e2e8f0');
  b.addBox([0, 0.85, 0], [10.15, 1.2, 9.15], '#334155'); // Dark basalt wainscot base
  
  // Large Plate-Glass Display Windows with Black Aluminum Framing & Kickplates
  [-2.7, 2.7].forEach(wx => {
    b.addBox([wx, 2.3, 4.55], [3.6, 2.5, 0.1], '#38bdf8'); // Glass
    b.addBox([wx, 2.3, 4.53], [3.8, 2.7, 0.08], '#0f172a'); // Outer frame
    b.addBox([wx, 1.15, 4.57], [3.6, 0.3, 0.06], '#334155'); // Kickplate
    b.addBox([wx, 2.3, 4.57], [0.06, 2.5, 0.06], '#0f172a'); // Center mullion
  });
  
  // Commercial Double Glass Entry Doors with Aluminum Pull Handles
  b.addBox([0, 1.9, 4.55], [1.8, 2.5, 0.1], '#38bdf8');
  b.addBox([0, 1.9, 4.53], [2.0, 2.7, 0.08], '#0f172a');
  b.addBox([0, 1.9, 4.56], [0.06, 2.5, 0.06], '#0f172a'); // Door split
  b.addCylinder([0.16, 1.7, 4.64], 0.04, 0.04, 0.7, 8, '#cbd5e1'); // Vertical bar handles
  b.addCylinder([-0.16, 1.7, 4.64], 0.04, 0.04, 0.7, 8, '#cbd5e1');
  
  // Striped Red/White Fabric Canvas Awning with Valance
  b.addWedge([0, 3.8, 5.3], [9.8, 0.95, 1.5], '#dc2626');
  for (let sx = -4.2; sx <= 4.2; sx += 1.4) {
    b.addBox([sx, 3.8, 5.3], [0.7, 0.97, 1.52], '#ffffff');
  }
  b.addBox([0, 3.35, 6.05], [9.8, 0.2, 0.05], '#dc2626'); // Scalloped valance
  
  // Backlit Retail Fascia Signboard (Moo Mart)
  b.addBox([0, 4.6, 4.62], [8.2, 0.95, 0.28], '#0284c7');
  b.addBox([0, 4.6, 4.77], [7.8, 0.65, 0.05], '#facc15');
  
  // Rooftop Parapet Cap & Commercial HVAC Compressor with Fan Guard
  b.addBox([0, 5.35, 0], [10.3, 0.3, 9.3], '#0f172a');
  b.addBox([2.3, 6.0, -1.8], [2.0, 1.3, 2.0], '#94a3b8'); // AC cabinet
  b.addCylinder([2.3, 6.7, -1.8], 0.7, 0.7, 0.16, 12, '#334155'); // Fan grill
  b.addBox([2.3, 6.78, -1.8], [1.2, 0.04, 0.15], '#0f172a'); // Fan blade
  b.addBox([2.3, 6.78, -1.8], [0.15, 0.04, 1.2], '#0f172a');
  b.addCylinder([-2.8, 5.9, 0], 0.22, 0.28, 1.2, 8, '#64748b'); // Exhaust pipe
  
  await saveGlb('commercial-shop.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.25, 0], [10.6, 0.5, 9.6], '#475569');
  bw.addBox([-2, 1.2, 0], [5.5, 2.0, 8.0], '#e2e8f0', [0.1, -0.05, 0.25]);
  bw.addBox([2, 1.0, 0], [5.0, 1.6, 7.5], '#334155', [-0.2, 0.15, -0.15]);
  bw.addBox([0, 0.4, 4.5], [6.0, 0.2, 1.8], '#dc2626', [0.3, 0.4, 0.1]);
  bw.addBox([3, 0.6, 3], [2.0, 1.3, 2.0], '#94a3b8', [0.6, 0.2, -0.5]);
  await saveGlb('commercial-shop-wreck.glb', bw);
}

// 2. COMMERCIAL-SHOP-DECO (Art Deco Style)
export async function generateCommercialShopDeco() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [10.6, 0.6, 9.6], '#334155');
  
  // Limestone & Terrazzo Main Facade (Art Deco Cream / Teal)
  b.addBox([0, 3.3, 0], [10.0, 5.4, 9.0], '#fef3c7');
  b.addBox([0, 1.25, 0], [10.15, 1.9, 9.15], '#0f766e'); // Teal glazed ceramic base
  
  // Tiered Art Deco Stepped Parapet with Gold Accents
  b.addBox([0, 6.2, 4.4], [10.3, 0.5, 0.45], '#d97706'); // Step 1
  b.addBox([0, 6.8, 4.4], [6.2, 0.7, 0.45], '#d97706'); // Step 2
  b.addBox([0, 7.4, 4.4], [2.6, 0.6, 0.45], '#d97706'); // Center tower peak
  b.addSphere([0, 7.85, 4.4], 0.38, 8, '#f59e0b'); // Deco finial
  
  // Fluted Pilasters
  [-4.6, -1.8, 1.8, 4.6].forEach(px => {
    b.addBox([px, 3.6, 4.55], [0.65, 5.0, 0.35], '#047857');
    b.addBox([px, 6.1, 4.6], [0.75, 0.25, 0.4], '#f59e0b'); // Gold capital
  });
  
  // Brass Curved Display Windows
  [-3.2, 3.2].forEach(wx => {
    b.addBox([wx, 2.3, 4.55], [2.1, 2.5, 0.1], '#38bdf8');
    b.addBox([wx, 2.3, 4.53], [2.3, 2.7, 0.08], '#d97706'); // Brass frame
  });
  
  // Center Arched Recessed Entry
  b.addBox([0, 1.95, 4.3], [1.9, 2.7, 0.1], '#78350f');
  b.addBox([0, 1.95, 4.32], [1.5, 1.9, 0.08], '#38bdf8');
  
  await saveGlb('commercial-shop-deco.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [10.6, 0.6, 9.6], '#334155');
  bw.addBox([0, 1.4, 0], [9.0, 2.2, 8.0], '#fef3c7', [0.15, 0.1, -0.2]);
  bw.addBox([2, 0.6, 3], [4.0, 0.8, 1.5], '#d97706', [0.4, 0.6, 0.2]);
  await saveGlb('commercial-shop-deco-wreck.glb', bw);
}

// 3. COMMERCIAL-SHOP-MANSARD
export async function generateCommercialShopMansard() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [10.0, 0.6, 9.0], '#475569');
  
  // French Bistro Storefront (Warm Red Brick)
  b.addBox([0, 2.5, 0], [9.4, 3.8, 8.4], '#991b1b');
  
  // Curved Mansard Roof with Aged Copper Green Trim & Ridge
  b.addWedge([0, 5.2, 0], [10.0, 2.4, 9.0], '#0d9488');
  b.addBox([0, 4.1, 0], [10.0, 0.22, 9.0], '#0f766e');
  b.addBox([0, 6.45, 0], [0.3, 0.15, 9.1], '#115e59'); // Copper cresting ridge
  
  // Mansard Dormer Windows
  [-2.6, 2.6].forEach(dx => {
    b.addBox([dx, 5.0, 4.35], [1.5, 1.5, 0.8], '#ffffff');
    b.addBox([dx, 5.0, 4.78], [1.1, 1.1, 0.1], '#38bdf8');
    b.addWedge([dx, 5.95, 4.35], [1.7, 0.65, 0.9], '#0d9488');
  });
  
  // Lower Display Windows & Bistro Door
  b.addBox([-2.4, 2.0, 4.25], [3.2, 2.2, 0.1], '#38bdf8');
  b.addBox([2.4, 2.0, 4.25], [3.2, 2.2, 0.1], '#38bdf8');
  b.addBox([0, 1.8, 4.25], [1.4, 2.4, 0.1], '#166534'); // Dark green door
  
  await saveGlb('commercial-shop-mansard.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [10.0, 0.6, 9.0], '#475569');
  bw.addBox([0, 1.2, 0], [8.0, 1.8, 7.5], '#991b1b', [-0.2, 0.15, 0.2]);
  bw.addBox([1, 0.6, 2], [3.0, 1.0, 3.0], '#0d9488', [0.5, 0.2, -0.4]);
  await saveGlb('commercial-shop-mansard-wreck.glb', bw);
}

// 4. COMMERCIAL-SHOP-GABLE
export async function generateCommercialShopGable() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [9.8, 0.6, 8.8], '#475569');
  
  // Western Frontier / Heartland General Store (Rough-hewn timber)
  b.addBox([0, 2.4, 0], [9.2, 3.6, 8.2], '#78350f');
  
  // Wooden Boardwalk Porch & Roof
  b.addBox([0, 0.35, 4.9], [9.6, 0.3, 1.8], '#92400e');
  [-4.0, -1.4, 1.4, 4.0].forEach(px => {
    b.addBox([px, 1.8, 5.6], [0.22, 2.6, 0.22], '#78350f');
  });
  b.addBox([0, 3.1, 4.9], [9.8, 0.2, 2.0], '#b45309');
  
  // General Store Boomtown False Front Gable
  b.addBox([0, 4.8, 4.15], [9.4, 1.4, 0.2], '#78350f');
  b.addBox([0, 5.6, 4.15], [4.6, 0.5, 0.2], '#78350f'); // Stepped pediment
  
  // Main Gabled Roof Behind False Front
  b.addWedge([0, 4.6, -0.5], [9.6, 2.4, 8.0], '#451a03');
  
  // Storefront Windows & Double Swinging Doors
  b.addBox([-2.2, 1.9, 4.15], [2.2, 1.8, 0.1], '#38bdf8');
  b.addBox([2.2, 1.9, 4.15], [2.2, 1.8, 0.1], '#38bdf8');
  b.addBox([0, 1.7, 4.15], [1.6, 2.2, 0.1], '#92400e');
  
  await saveGlb('commercial-shop-gable.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [9.8, 0.6, 8.8], '#475569');
  bw.addBox([0, 1.0, 0], [7.5, 1.6, 7.0], '#78350f', [0.25, 0.1, -0.15]);
  await saveGlb('commercial-shop-gable-wreck.glb', bw);
}

// 5. GROCERY-STORE & WRECK
export async function generateGroceryStore() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#475569');
  
  // Modern Supermarket Superstructure (Sandstone & Green Trim)
  b.addBox([0, 2.8, 0], [15.8, 4.6, 11.8], '#f1f5f9');
  b.addBox([0, 4.9, 0], [16.0, 0.6, 12.0], '#15803d'); // Green brand fascia
  
  // Automated Sliding Glass Entrance Foyer
  b.addBox([-3.5, 1.8, 5.95], [4.6, 2.6, 0.4], '#0f172a'); // Foyer frame
  b.addBox([-3.5, 1.8, 6.16], [4.2, 2.4, 0.08], '#38bdf8'); // Glass sliding doors
  b.addBox([-3.5, 3.2, 6.2], [5.0, 0.25, 1.2], '#15803d'); // Entrance canopy
  
  // Supermarket Glowing Brand Signboard (FRESH FOODS)
  b.addBox([2.5, 4.9, 6.05], [7.0, 0.9, 0.15], '#ffffff');
  b.addBox([2.5, 4.9, 6.14], [6.6, 0.6, 0.05], '#16a34a'); // Green logo
  
  // Display Window Curtain Wall
  b.addBox([3.5, 2.0, 5.95], [6.5, 2.2, 0.1], '#38bdf8');
  
  // Rooftop Solar Panel Array & HVAC Units
  [-4.0, 0, 4.0].forEach(sx => {
    b.addBox([sx, 5.35, -2.0], [3.2, 0.12, 4.0], '#1e3a8a'); // Blue solar panels
  });
  b.addBox([5.0, 5.8, 2.5], [2.2, 1.4, 2.2], '#94a3b8'); // HVAC
  
  // Rear Loading Dock Bay
  b.addBox([0, 1.8, -5.95], [3.8, 2.6, 0.1], '#64748b'); // Overhead roll-up door
  b.addBox([0, 0.4, -6.6], [4.8, 0.8, 1.4], '#334155'); // Concrete dock ramp
  
  await saveGlb('grocery-store.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#475569');
  bw.addBox([-4, 1.5, 0], [8.0, 2.4, 10.0], '#f1f5f9', [0.15, -0.1, 0.3]);
  bw.addBox([4, 1.0, 0], [8.0, 1.8, 10.0], '#15803d', [-0.2, 0.15, -0.25]);
  await saveGlb('grocery-store-wreck.glb', bw);
}

// 6. CAR-DEALERSHIP & WRECK
export async function generateCarDealership() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [15.4, 0.6, 11.4], '#334155');
  
  // Showroom 3-Sided Glass Curtain Wall
  b.addBox([0, 2.6, 2.5], [14.6, 4.2, 6.0], '#38bdf8'); // Clear glass volume
  b.addBox([0, 0.32, 2.5], [14.4, 0.05, 5.8], '#f8fafc'); // White polished tile floor
  
  // Polished Aluminum Structural Frame & Corner Columns
  [-7.3, 0, 7.3].forEach(cx => {
    b.addBox([cx, 2.6, 5.5], [0.45, 4.2, 0.45], '#e2e8f0');
    b.addBox([cx, 2.6, -0.5], [0.45, 4.2, 0.45], '#e2e8f0');
  });
  b.addBox([0, 4.8, 2.5], [15.2, 0.6, 6.6], '#0284c7'); // Blue fascia overhang
  b.addBox([0, 4.8, 5.85], [8.0, 0.7, 0.1], '#facc15'); // Dealership brand sign
  
  // Rear Service Department & Garage Bays
  b.addBox([0, 2.6, -3.2], [14.6, 4.2, 5.2], '#64748b'); // Solid masonry service bay
  [-3.8, 3.8].forEach(bx => {
    b.addBox([bx, 2.0, -5.85], [3.4, 2.8, 0.1], '#e2e8f0'); // Roll-up service bay doors
  });
  
  await saveGlb('car-dealership.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [15.4, 0.6, 11.4], '#334155');
  bw.addBox([0, 1.2, -2], [14.0, 1.8, 6.0], '#64748b', [0.1, 0.05, -0.2]);
  bw.addBox([0, 0.5, 3], [12.0, 0.4, 5.0], '#0284c7', [-0.3, 0.2, 0.1]); // Smashed showroom canopy
  await saveGlb('car-dealership-wreck.glb', bw);
}

// 7. DISCOUNT-STORE & WRECK
export async function generateDiscountStore() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [14.4, 0.6, 10.4], '#475569');
  
  // Concrete Block Big Box Architecture (Safety Yellow & Blue)
  b.addBox([0, 2.8, 0], [13.8, 4.6, 9.8], '#3b82f6'); // Blue main body
  b.addBox([0, 4.8, 0], [14.0, 0.8, 10.0], '#eab308'); // Yellow fascia banner
  
  // Entrance & Automatic Doors
  b.addBox([0, 1.8, 4.95], [3.6, 2.4, 0.1], '#38bdf8');
  b.addBox([0, 1.8, 4.93], [3.8, 2.6, 0.08], '#0f172a');
  b.addBox([0, 3.2, 5.2], [5.0, 0.3, 1.2], '#eab308'); // Yellow entry portal
  
  // Big Bold Signboard
  b.addBox([0, 4.8, 5.05], [8.4, 0.7, 0.15], '#eab308');
  b.addBox([0, 4.8, 5.14], [8.0, 0.5, 0.05], '#1e3a8a');
  
  await saveGlb('discount-store.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [14.4, 0.6, 10.4], '#475569');
  bw.addBox([0, 1.4, 0], [12.0, 2.0, 8.5], '#3b82f6', [0.15, -0.1, 0.2]);
  await saveGlb('discount-store-wreck.glb', bw);
}

// 8. INDUSTRIAL-WAREHOUSE & WRECK
export async function generateIndustrialWarehouse() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  
  // Corrugated Metal Warehouse Walls (Galvanized Gray)
  b.addBox([0, 3.2, 0], [15.8, 5.4, 11.8], '#94a3b8');
  
  // Pitched Gabled Steel Roof with Skylight Panels
  b.addWedge([0, 6.8, 0], [16.2, 2.0, 12.2], '#475569');
  b.addBox([0, 7.3, 0], [12.0, 0.1, 4.0], '#38bdf8'); // Translucent roof skylights
  
  // Large Double Freight Bay Doors (Safety Yellow Chevron Trim)
  [-3.8, 3.8].forEach(dx => {
    b.addBox([dx, 2.2, 5.95], [4.2, 3.4, 0.1], '#475569'); // Steel freight door
    b.addBox([dx, 4.0, 5.98], [4.4, 0.4, 0.05], '#eab308'); // Top warning stripe
  });
  
  // Safety Yellow Bollards
  [-6.2, -1.4, 1.4, 6.2].forEach(bx => {
    b.addCylinder([bx, 0.5, 6.3], 0.12, 0.12, 1.0, 8, '#eab308');
  });
  
  await saveGlb('industrial-warehouse.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  bw.addBox([-3, 1.5, 0], [8.0, 2.5, 10.0], '#94a3b8', [0.2, 0.1, -0.3]);
  bw.addWedge([3, 1.2, 0], [8.0, 1.8, 10.0], '#475569', [-0.3, 0.2, 0.2]);
  await saveGlb('industrial-warehouse-wreck.glb', bw);
}

// 9. INDUSTRIAL-WAREHOUSE-CURVED & WRECK
export async function generateIndustrialWarehouseCurved() {
  const b = new GlbBuilder();
  b.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  
  // Quonset Hut Curved Barrel Vaulted Metal Body
  b.addCylinder([0, 1.5, 0], 6.0, 6.0, 12.0, 16, '#94a3b8', [Math.PI/2, 0, 0]);
  b.addBox([0, 0.8, 0], [12.0, 1.2, 12.0], '#94a3b8');
  
  // Endwall & Heavy Steel Roll-up Door
  b.addBox([0, 2.0, 6.02], [4.0, 3.0, 0.1], '#475569');
  
  await saveGlb('industrial-warehouse-curved.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.3, 0], [16.4, 0.6, 12.4], '#334155');
  bw.addCylinder([0, 0.8, 0], 5.5, 5.5, 10.0, 12, '#94a3b8', [1.2, 0.4, -0.5]);
  await saveGlb('industrial-warehouse-curved-wreck.glb', bw);
}

// 10. FERRIS-WHEEL & WRECK
export async function generateFerrisWheel() {
  const b = new GlbBuilder();
  // Concrete Base Pad
  b.addBox([0, 0.22, 0], [10.0, 0.45, 6.5], '#475569');
  
  // A-Frame Support Legs
  [-3.8, 3.8].forEach(x => {
    [-1.8, 1.8].forEach(z => {
      b.addBox([x * 0.5, 4.6, z], [0.45, 9.5, 0.45], '#fbbf24', [z < 0 ? -0.15 : 0.15, 0, x < 0 ? -0.42 : 0.42]);
    });
  });
  
  // Center Axle Hub
  b.addCylinder([0, 8.0, 0], 0.35, 0.35, 4.2, 8, '#334155', [Math.PI/2, 0, 0]);
  [-1.25, 1.25].forEach(hz => {
    b.addCylinder([0, 8.0, hz], 1.1, 1.1, 0.2, 12, '#f59e0b', [Math.PI/2, 0, 0]);
  });
  
  // Dual Outer Rings (Magenta)
  [-1.2, 1.2].forEach(rz => {
    b.addTorus([0, 8.0, rz], 6.5, 0.25, 8, 32, '#f472b6');
  });
  
  // 8 Radiating Structural Spokes
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    b.addBox([0, 8.0, 0], [13.0, 0.18, 2.4], '#fde68a', [0, 0, angle]);
  }
  
  // 8 Passenger Gondolas with Canopies
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const gx = Math.cos(angle) * 6.5;
    const gy = 8.0 + Math.sin(angle) * 6.5;
    const gColor = ['#ef4444', '#38bdf8', '#4ade80', '#fbbf24', '#a855f7', '#f97316', '#ec4899', '#06b6d4'][i % 8];
    b.addBox([gx, gy - 0.6, 0], [1.6, 1.0, 1.8], gColor);
    b.addCone([gx, gy + 0.4, 0], 1.3, 0.6, 4, '#ffffff', [0, Math.PI/4, 0]);
    [-0.8, 0.8].forEach(hx => {
      b.addCylinder([gx + hx, gy, 0], 0.04, 0.04, 1.2, 6, '#64748b');
    });
  }
  
  await saveGlb('ferris-wheel.glb', b);

  const bw = new GlbBuilder();
  bw.addBox([0, 0.22, 0], [10.0, 0.45, 6.5], '#475569');
  bw.addBox([0, 3.5, 0], [9.0, 6.5, 5.0], '#fbbf24', [0.35, 0.15, -0.65]);
  bw.addTorus([2.5, 2.0, 1.0], 5.5, 0.25, 8, 24, '#f472b6', [1.2, 0.3, 0.4]);
  await saveGlb('ferris-wheel-wreck.glb', bw);
}

// 11. CAROUSEL & WRECK
export async function generateCarousel() {
  const b = new GlbBuilder();
  // Stationary Round Pedestal Base
  b.addCylinder([0, 0.22, 0], 6.2, 6.4, 0.45, 24, '#475569');
  b.addCylinder([0, 0.55, 0], 5.8, 5.8, 0.55, 24, '#fbbf24');
  b.addCylinder([0, 3.6, 0], 0.45, 0.45, 7.2, 12, '#f59e0b');
  
  // Conical Purple Canopy & Golden Finial
  b.addCone([0, 5.8, 0], 6.6, 2.6, 24, '#c084fc');
  b.addCylinder([0, 4.4, 0], 6.7, 6.7, 0.45, 24, '#ffffff');
  b.addSphere([0, 7.3, 0], 0.45, 8, 8, '#fbbf24');
  
  // 8 Brass Spiral Poles & Horses
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const hx = Math.cos(angle) * 4.2;
    const hz = Math.sin(angle) * 4.2;
    b.addCylinder([hx, 2.6, hz], 0.06, 0.06, 4.0, 8, '#facc15');
    const horseColor = ['#ffffff', '#78350f', '#0f172a', '#ea580c', '#ffffff', '#92400e', '#38bdf8', '#f472b6'][i % 8];
    const horseElevation = 2.0 + (i % 2 === 0 ? 0.35 : -0.35);
    b.addBox([hx, horseElevation, hz], [0.7, 0.8, 1.8], horseColor, [0, angle + Math.PI/2, 0]);
  }
  
  await saveGlb('carousel.glb', b);

  const bw = new GlbBuilder();
  bw.addCylinder([0, 0.22, 0], 6.2, 6.4, 0.45, 24, '#475569');
  bw.addCone([1.5, 1.8, 0.5], 5.8, 2.2, 16, '#c084fc', [0.45, 0.2, -0.6]);
  bw.addBox([-2.0, 0.8, 1.0], [2.5, 1.2, 3.5], '#fbbf24', [-0.3, 0.4, 0.2]);
  await saveGlb('carousel-wreck.glb', bw);
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
  await generateIndustrialWarehouseCurved();
  await generateFerrisWheel();
  await generateCarousel();
}

if (process.argv[1]?.endsWith('generate-commercial-models.mjs')) {
  run().catch(console.error);
}
