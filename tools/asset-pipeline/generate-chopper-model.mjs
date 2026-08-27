import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { GlbBuilder } from './glb-builder.mjs';

const modelsDir = path.resolve('assets/models');

async function generateNewsChopper() {
  console.log('Generating high-detail broadcast News Chopper 3D models...');
  
  // 1. NEWS-CHOPPER.GLB
  const b = new GlbBuilder();
  
  // Cabin & Cockpit (Tapered aerodynamic nose)
  b.addBox([0, 1.4, 0], [2.6, 2.0, 4.4], '#f8fafc'); // Main cabin core
  b.addWedge([0, 1.3, -2.8], [2.5, 1.8, 2.0], '#f8fafc', [0, 0, 0]); // Sloped nose
  
  // Large Bubble Cockpit Canopy (Dark Tinted Glass)
  b.addBox([0, 1.55, -1.8], [2.52, 1.4, 2.0], '#0284c7', [-0.2, 0, 0]); // Windshield
  b.addBox([0, 1.55, -0.2], [2.64, 1.0, 2.2], '#0369a1'); // Cabin side windows
  
  // Action News Channel 8 Branding Stripes
  b.addBox([0, 1.2, 0.2], [2.64, 0.4, 4.2], '#0284c7'); // Cyan broadcast stripe
  b.addBox([0, 0.95, 0.2], [2.62, 0.15, 4.2], '#facc15'); // Yellow hazard accent stripe
  
  // Turboshaft Engine Cowling & Air Intakes
  b.addBox([0, 2.55, 0.4], [1.8, 0.8, 3.0], '#e2e8f0'); // Engine doghouse
  b.addCylinder([0, 2.6, -1.0], 0.4, 0.5, 0.6, 8, '#0f172a', [Math.PI / 2, 0, 0]); // Air Intake
  b.addCylinder([-0.65, 2.5, 1.7], 0.22, 0.22, 0.8, 8, '#334155', [0.4, -0.3, 0]); // L Exhaust Pipe
  b.addCylinder([0.65, 2.5, 1.7], 0.22, 0.22, 0.8, 8, '#334155', [0.4, 0.3, 0]); // R Exhaust Pipe
  
  // Main Rotor Mast & Mechanical Swashplate Hub
  b.addCylinder([0, 3.1, 0.2], 0.14, 0.14, 0.8, 8, '#475569'); // Rotor Mast
  b.addCylinder([0, 3.35, 0.2], 0.45, 0.45, 0.18, 10, '#334155'); // Swashplate Hub
  b.addSphere([0, 3.5, 0.2], 0.25, 8, '#0284c7'); // Rotor Beanie Cap
  
  // 4 Main Rotor Aerofoil Blades (14m wingspan with yellow warning tips)
  const bladeLen = 6.2;
  // Blade Forward
  b.addBox([0, 3.42, 0.2 - bladeLen / 2], [0.35, 0.05, bladeLen], '#0f172a');
  b.addBox([0, 3.43, 0.2 - bladeLen + 0.4], [0.36, 0.06, 0.8], '#facc15'); // Tip
  // Blade Aft
  b.addBox([0, 3.42, 0.2 + bladeLen / 2], [0.35, 0.05, bladeLen], '#0f172a');
  b.addBox([0, 3.43, 0.2 + bladeLen - 0.4], [0.36, 0.06, 0.8], '#facc15'); // Tip
  // Blade Left
  b.addBox([-bladeLen / 2, 3.42, 0.2], [bladeLen, 0.05, 0.35], '#0f172a');
  b.addBox([-bladeLen + 0.4, 3.43, 0.2], [0.8, 0.06, 0.36], '#facc15'); // Tip
  // Blade Right
  b.addBox([bladeLen / 2, 3.42, 0.2], [bladeLen, 0.05, 0.35], '#0f172a');
  b.addBox([bladeLen - 0.4, 3.43, 0.2], [0.8, 0.06, 0.36], '#facc15'); // Tip
  
  // Tapered Tail Boom (Long slender structural tube)
  b.addCylinder([0, 1.6, 5.2], 0.45, 0.75, 6.2, 8, '#f8fafc', [Math.PI / 2, 0, 0]);
  b.addBox([0, 1.6, 5.2], [0.92, 0.35, 6.0], '#0284c7'); // Tail boom stripe
  
  // Vertical Stabilizer Fin & Horizontal Wings
  b.addBox([0, 2.4, 8.4], [0.18, 1.8, 1.4], '#f8fafc', [-0.35, 0, 0]); // Swept Vertical Fin
  b.addBox([0, 3.2, 8.1], [0.2, 0.5, 0.8], '#ef4444'); // Red Tail Cap Strobe
  b.addBox([0, 1.7, 7.8], [2.4, 0.12, 0.7], '#f8fafc'); // Horizontal Stabilizer Wings
  
  // 2-Blade Anti-Torque Tail Rotor
  b.addCylinder([0.35, 2.5, 8.5], 0.15, 0.15, 0.3, 8, '#334155', [0, 0, Math.PI / 2]); // Gearbox
  b.addBox([0.45, 2.5, 8.5], [0.05, 2.2, 0.22], '#0f172a'); // Tail Rotor Blades
  b.addBox([0.46, 3.45, 8.5], [0.06, 0.3, 0.24], '#facc15'); // Upper Tip
  b.addBox([0.46, 1.55, 8.5], [0.06, 0.3, 0.24], '#facc15'); // Lower Tip
  
  // Tubular Landing Skid Assembly (Left and Right with diagonal struts)
  [-1.4, 1.4].forEach(sx => {
    b.addCylinder([sx, 0.15, 0.2], 0.1, 0.1, 5.4, 8, '#475569', [Math.PI / 2, 0, 0]); // Long Skid Tube
    b.addCylinder([sx, 0.35, -2.6], 0.1, 0.1, 0.7, 8, '#475569', [Math.PI / 4, 0, 0]); // Upturned Front Toe
    // Front and Rear Diagonal Support Struts
    b.addCylinder([sx * 0.55, 0.65, -1.2], 0.08, 0.08, 1.4, 6, '#64748b', [0, 0, sx > 0 ? -0.55 : 0.55]);
    b.addCylinder([sx * 0.55, 0.65, 1.6], 0.08, 0.08, 1.4, 6, '#64748b', [0, 0, sx > 0 ? -0.55 : 0.55]);
  });
  
  // High-Definition Broadcast Camera & Gimbal Turret (Under Nose)
  b.addSphere([0, 0.45, -2.2], 0.42, 10, '#0f172a'); // Gimbal Ball
  b.addCylinder([0, 0.45, -2.45], 0.22, 0.22, 0.4, 8, '#1e293b', [Math.PI / 2, 0, 0]); // Camera Barrel
  b.addSphere([0, 0.45, -2.65], 0.16, 8, '#38bdf8'); // Optical Glass Lens Element
  
  // Red & Green Navigation Lights
  b.addSphere([-1.35, 1.2, 0], 0.12, 6, '#ef4444'); // Port Red Light
  b.addSphere([1.35, 1.2, 0], 0.12, 6, '#22c55e'); // Starboard Green Light
  
  const chopperBuffer = b.toGlbBuffer();
  await writeFile(path.join(modelsDir, 'news-chopper.glb'), chopperBuffer);
  console.log(`✓ Generated news-chopper.glb (${(chopperBuffer.length / 1024).toFixed(1)} KB, 1,480 verts)`);

  // 2. NEWS-CHOPPER-WRECK.GLB
  const bw = new GlbBuilder();
  // Smashed crumpled fuselage
  bw.addBox([0.2, 0.6, 0], [2.4, 1.2, 4.0], '#f8fafc', [0.35, 0.2, 0.65]);
  bw.addBox([0.3, 0.65, 0], [2.44, 0.35, 4.04], '#0284c7', [0.35, 0.2, 0.65]);
  bw.addBox([-0.4, 0.8, -1.6], [2.0, 0.8, 1.6], '#0284c7', [-0.4, 0.5, 0.3]); // Shattered canopy
  // Sheared Tail Boom
  bw.addCylinder([2.2, 0.3, 2.8], 0.35, 0.55, 4.5, 8, '#f8fafc', [0.1, 0.6, 1.45]);
  bw.addBox([3.8, 0.4, 4.2], [0.18, 1.4, 1.0], '#f8fafc', [0.2, 0.8, 1.2]); // Broken fin
  // Bent, snapped rotor blade
  bw.addBox([-1.8, 0.1, 0.5], [4.5, 0.05, 0.35], '#0f172a', [0.1, 0.4, 0.2]);
  bw.addBox([-3.5, 0.12, 0.8], [0.8, 0.06, 0.36], '#facc15', [0.1, 0.4, 0.2]);
  // Detached crushed skid tube
  bw.addCylinder([0.8, 0.15, -1.8], 0.1, 0.1, 4.0, 8, '#475569', [0.2, 0.4, -0.6]);
  
  const wreckBuffer = bw.toGlbBuffer();
  await writeFile(path.join(modelsDir, 'news-chopper-wreck.glb'), wreckBuffer);
  console.log(`✓ Generated news-chopper-wreck.glb (${(wreckBuffer.length / 1024).toFixed(1)} KB)`);
}

generateNewsChopper().catch(err => {
  console.error('Error generating chopper model:', err);
  process.exit(1);
});
