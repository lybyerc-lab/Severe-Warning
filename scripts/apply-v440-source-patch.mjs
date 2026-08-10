import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gridZapTopologyRuntime } from './grid-zap-topology.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  '<title>Severe Weather 3D Lab v4.3.1 - Mobile Comfort</title>',
  '<title>Severe Weather 3D Lab v4.4.0 - Illustrated Storm Feedback</title>',
  'document title'
);
replaceExact(
  '3D LAB v4.3.1 MOBILE COMFORT',
  '3D LAB v4.4.0 ILLUSTRATED STORM',
  'NOAA build badge'
);
replaceExact(
  'ARCADE DISASTER SIMULATOR v4.3.1 MOBILE COMFORT',
  'ARCADE DISASTER SIMULATOR v4.4.0 ILLUSTRATED STORM',
  'main menu build label'
);
replaceExact(
  "const powerPoles = [];\nconst eastWestLaneDashes = [];",
  `const powerPoles = [];
const activeGridZapEffects = [];
const eastWestLaneDashes = [];

// [SW:GAME:UTILITY_NETWORK_V1] The pole objects below are the single source of
// truth for the rendered mesh, navigation collision read, and Grid Zap topology.
const UTILITY_ROAD_CENTERS = [-320, -240, -160, -80, 0, 80, 160, 240, 320];
const UTILITY_PROTECTED_HALF_WIDTH = 8.5;
const UTILITY_ROUTE_OFFSET = 13.5;
const UTILITY_POLE_XS = [-340, -265, -190, -115, -40, 35, 110, 185, 260, 335];
const GRID_ZAP_ACQUISITION_RADIUS_MULTIPLIER = 5.25;
const GRID_ZAP_MAX_CONNECTED_NODES = 8;
const GRID_ZAP_MAX_CONNECTED_HOP_DISTANCE = 82;
const GRID_ZAP_TARGET_DAMAGE = 135;
const GRID_ZAP_TARGET_RANGE = 16;`,
  'Grid Zap effect registry'
);
replaceExact(
  '  for (let px = -300; px <= 300; px += 50) {',
  `  const utilityRoute = 'east-west-' + r;
  UTILITY_POLE_XS.forEach((px, networkIndex) => {`,
  'road-safe utility network producer'
);
replaceExact(
  `    poleGroup.position.set(px, terrainHeightAt(px, r + 13.5), r + 13.5);
    scene.add(poleGroup);
    powerPoles.push({ group: poleGroup, x: px, z: r + 13.5, sparked: false });
  }
}`,
  `    const pz = r + UTILITY_ROUTE_OFFSET;
    poleGroup.position.set(px, terrainHeightAt(px, pz), pz);
    scene.add(poleGroup);
    powerPoles.push({
      group: poleGroup,
      x: px,
      z: pz,
      networkGroup: utilityRoute,
      networkIndex,
      sparked: false
    });
  });
}`,
  'road-safe utility network coordinates'
);
replaceExact(
  `  });
}

function addInstancedRoadMarks`,
  `  });
}

// Each rendered wire follows the same ordered records consumed by Grid Zap.
// Crossing a road happens overhead between road-safe poles; no invisible topology
// shortcut can make a disconnected route look electrically connected.
const utilityLineMat = new THREE.LineBasicMaterial({ color: '#1e293b', transparent: true, opacity: 0.78 });
const utilityRoutes = new Map();
powerPoles.forEach(pole => {
  if (!utilityRoutes.has(pole.networkGroup)) utilityRoutes.set(pole.networkGroup, []);
  utilityRoutes.get(pole.networkGroup).push(pole);
});
const utilityWirePositions = [];
utilityRoutes.forEach(route => {
  route.sort((a, b) => a.networkIndex - b.networkIndex);
  for (let index = 1; index < route.length; index++) {
    const previous = route[index - 1];
    const next = route[index];
    utilityWirePositions.push(
      previous.x, terrainHeightAt(previous.x, previous.z) + 10.35, previous.z,
      next.x, terrainHeightAt(next.x, next.z) + 10.35, next.z
    );
  }
});
const utilityWireGeometry = new THREE.BufferGeometry();
utilityWireGeometry.setAttribute('position', new THREE.Float32BufferAttribute(utilityWirePositions, 3));
scene.add(new THREE.LineSegments(utilityWireGeometry, utilityLineMat));

function addInstancedRoadMarks`,
  'rendered utility network continuity'
);
replaceExact(
  "const poleMat = new THREE.MeshStandardMaterial({ color: '#542605', roughness: 0.7 });",
  "const poleMat = new THREE.MeshToonMaterial({ color: '#6b3514' });",
  'utility pole toon material'
);
replaceExact(
  "const crossMat = new THREE.MeshStandardMaterial({ color: '#311202' });",
  "const crossMat = new THREE.MeshToonMaterial({ color: '#2f1608' });",
  'utility crossarm toon material'
);
replaceExact(
  "  playSound('zap');\n  addCameraShake(1.0);\n}\n\n// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK",
  `  playSound('zap');
  addCameraShake(1.0);
}

function clearGridZapEffects() {
  while (activeGridZapEffects.length) {
    const effect = activeGridZapEffects.pop();
    scene.remove(effect);
    if (effect.geometry) effect.geometry.dispose();
    if (effect.material) effect.material.dispose();
  }
}

function utilityTopPoint(pole) {
  return new THREE.Vector3(pole.x, terrainHeightAt(pole.x, pole.z) + 10.35, pole.z);
}

function createUtilityArc(start, end, delayMs, hopIndex) {
  setTimeout(() => {
    if (!runActive) return;
    const points = [start.clone()];
    const segments = 5;
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const point = start.clone().lerp(end, t);
      point.x += (Math.random() - 0.5) * 2.2;
      point.y += (Math.random() - 0.5) * 1.4 + Math.sin(t * Math.PI) * 0.8;
      point.z += (Math.random() - 0.5) * 2.2;
      points.push(point);
    }
    points.push(end.clone());

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const glowMaterial = new THREE.LineBasicMaterial({
      color: '#38bdf8', transparent: true, opacity: 0.34,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const coreMaterial = new THREE.LineBasicMaterial({
      color: hopIndex === 0 ? '#ffffff' : '#bae6fd',
      transparent: true, opacity: 0.98,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const glow = new THREE.Line(geometry.clone(), glowMaterial);
    const core = new THREE.Line(geometry, coreMaterial);
    scene.add(glow, core);
    activeGridZapEffects.push(glow, core);

    const pulse = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 8, 8),
      new THREE.MeshBasicMaterial({ color: '#ffffff', blending: THREE.AdditiveBlending, transparent: true })
    );
    pulse.position.copy(start);
    scene.add(pulse);
    activeGridZapEffects.push(pulse);

    const pulseStart = performance.now();
    const pulseDuration = 230;
    function animatePulse(now) {
      if (!pulse.parent) return;
      const t = Math.min(1, (now - pulseStart) / pulseDuration);
      pulse.position.lerpVectors(start, end, t);
      pulse.scale.setScalar(1 + Math.sin(t * Math.PI) * 0.8);
      if (t < 1) requestAnimationFrame(animatePulse);
    }
    requestAnimationFrame(animatePulse);

    setTimeout(() => {
      [glow, core, pulse].forEach(effect => {
        const index = activeGridZapEffects.indexOf(effect);
        if (index >= 0) activeGridZapEffects.splice(index, 1);
        scene.remove(effect);
        if (effect.geometry) effect.geometry.dispose();
        if (effect.material) effect.material.dispose();
      });
    }, 420);
  }, delayMs);
}

${gridZapTopologyRuntime}

function triggerGridZapCascade() {
  clearGridZapEffects();
  const selected = selectGridZapTopology(powerPoles, {
    stormX: storm.pos.x,
    stormZ: storm.pos.z,
    acquisitionRadius: storm.radius * GRID_ZAP_ACQUISITION_RADIUS_MULTIPLIER,
    maxHopDistance: GRID_ZAP_MAX_CONNECTED_HOP_DISTANCE,
    maxNodes: GRID_ZAP_MAX_CONNECTED_NODES
  });

  if (!selected.length) {
    triggerLightningStrike(storm.pos.x + 8, storm.pos.z + 8);
    return;
  }

  const stormStart = new THREE.Vector3(storm.pos.x, 36, storm.pos.z);
  let previousPoint = stormStart;
  const hitTargets = new Set();
  selected.forEach((pole, index) => {
    const polePoint = utilityTopPoint(pole);
    createUtilityArc(previousPoint, polePoint, index * 105, index);
    previousPoint = polePoint;
    setTimeout(() => {
      if (!pole.sparked) {
        pole.sparked = true;
        addScore(index === 0 ? 110 : 75);
      }
      targets.forEach(target => {
        if (hitTargets.has(target) || target.destroyed) return;
        const targetDistance = Math.hypot(target.x - pole.x, target.z - pole.z);
        if (targetDistance <= GRID_ZAP_TARGET_RANGE) {
          hitTargets.add(target);
          damageTarget(target, GRID_ZAP_TARGET_DAMAGE, 'grid-zap');
        }
      });
      pole.group.scale.set(1.08, 1.08, 1.08);
      setTimeout(() => pole.group.scale.set(1, 1, 1), 120);
      playSound('zap');
      addCameraShake(index === 0 ? 1.0 : 0.35);
    }, index * 105 + 180);
  });

  triggerPowerFlash();
}

// LANDMARK DAMAGE WITH STAGE 2 UNLOCK LOCK`,
  'Grid Zap cascade helpers'
);
replaceExact(
  `    } else if (slot === 'tertiary') { // ZAP
      playSound('zap');
      triggerPowerFlash();
      powerPoles.forEach(p => {
        const dist = Math.hypot(p.x - storm.pos.x, p.z - storm.pos.z);
        if (dist < storm.radius * 2.2 && !p.sparked) {
          p.sparked = true;
          addScore(75);
        }
      });
    }`,
  `    } else if (slot === 'tertiary') { // GRID ZAP CASCADE
      triggerGridZapCascade();
    }`,
  'Tornado Grid Zap ability'
);
replaceExact(
  "  powerPoles.forEach(pole => { pole.sparked = false; });",
  "  clearGridZapEffects();\n  powerPoles.forEach(pole => { pole.sparked = false; pole.group.scale.set(1, 1, 1); });",
  'Grid Zap replay cleanup'
);

if (!html.includes('triggerGridZapCascade') || !html.includes('MeshToonMaterial')) {
  throw new Error('v4.4.0 illustrated Grid Zap implementation is incomplete.');
}
if (!html.includes('v4.4.0') || html.includes('v4.3.1')) {
  throw new Error('Version identity did not fully advance to v4.4.0.');
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.4.0 Illustrated Storm Feedback source patch.');
