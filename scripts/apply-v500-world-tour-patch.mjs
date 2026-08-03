import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

const requiredMarkers = [
  'V500_WORLD_TOUR_V1',
  '[SW:WORLD:CAMPAIGN_IDENTITY]',
  'HEARTLAND_WORLD_BLUEPRINTS',
  'function prepareCampaignWorld',
  'function applyCampaignWorldIdentity',
  'function createCampaignLandmarkMesh',
  'function updateCampaignScenery',
  'getCampaignWorldQaState',
  'rel="icon" href="data:,"'
];

if (html.includes('V500_WORLD_TOUR_V1')) {
  requiredMarkers.forEach(marker => {
    if (!html.includes(marker)) throw new Error(`V5 world-tour patch is incomplete: missing ${marker}`);
  });
  console.log(`V5 Heartland world tour already present in ${sourcePath}`);
  process.exit(0);
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  `<title>Severe Weather 3D Lab v5.0.0 - Heartland Campaign Foundation</title>`,
  `<title>Severe Weather 3D Lab v5.0.0 - Heartland Campaign Foundation</title>\n<link rel="icon" href="data:,">`,
  'inline empty favicon for offline QA'
);

replaceExact(
  `// The world surface changes elevation, while X/Z collision stays arcade-predictable.
function terrainHeightAt(x, z) {`,
  `// The world surface changes elevation, while X/Z collision stays arcade-predictable.
// V500_WORLD_TOUR_V1: campaign terrain changes are masked near the 80-unit road grid.
function campaignTerrainProfile(x, z, baseHeight) {
  const profile = Number.isInteger(globalThis.__SW_ACTIVE_CAMPAIGN_WORLD__)
    ? globalThis.__SW_ACTIVE_CAMPAIGN_WORLD__
    : 0;
  const roadDistance = Math.min(
    Math.abs(x - Math.round(x / 80) * 80),
    Math.abs(z - Math.round(z / 80) * 80)
  );
  const maskT = THREE.MathUtils.clamp((roadDistance - 15) / 20, 0, 1);
  const parcelMask = maskT * maskT * (3 - 2 * maskT);

  if (profile === 1) {
    const prairieRoll = 0.9 * Math.sin(x * 0.012) + 0.55 * Math.cos(z * 0.016);
    return baseHeight * 0.22 + prairieRoll * parcelMask;
  }
  if (profile === 2) {
    const westernShelf = 7.5 * Math.exp(-(((x + 255) ** 2) / 8500 + ((z - 20) ** 2) / 62000));
    const harvestRoll = 2.2 * Math.sin((x + z) * 0.016) * Math.cos(z * 0.009);
    return baseHeight * 0.48 + (westernShelf + harvestRoll) * parcelMask;
  }
  if (profile === 3) {
    const radius = Math.hypot(x, z);
    const fairBowl = -1.8 * Math.exp(-(radius ** 2) / 48000);
    const grandstandRim = 7.0 * Math.exp(-((radius - 245) ** 2) / 1800);
    return baseHeight * 0.32 + (fairBowl + grandstandRim) * parcelMask;
  }
  const woodedRidge = 2.4 * Math.exp(-(((x - 220) ** 2) / 18000 + ((z + 225) ** 2) / 24000));
  return baseHeight + woodedRidge * parcelMask;
}

function campaignGroundPalette(color, x, z, height) {
  const profile = Number.isInteger(globalThis.__SW_ACTIVE_CAMPAIGN_WORLD__)
    ? globalThis.__SW_ACTIVE_CAMPAIGN_WORLD__
    : 0;
  const palette = [
    ['#24452d', '#596f3b'],
    ['#709451', '#b8a957'],
    ['#7b552e', '#c08a3e'],
    ['#5c365f', '#d78345']
  ][profile];
  const tint = new THREE.Color(((Math.floor((x + 400) / 80) + Math.floor((z + 400) / 80)) & 1) ? palette[0] : palette[1]);
  const amount = profile === 0 ? 0.28 : 0.48;
  return color.lerp(tint, amount).lerp(new THREE.Color('#cbd5a1'), THREE.MathUtils.clamp(height / 35, 0, 0.12));
}

function terrainHeightAt(x, z) {`,
  'campaign terrain helpers'
);

replaceExact(
  `  const countyRoll = 1.4 * Math.sin(x * 0.018) * Math.cos(z * 0.015);
  return pineRidge + mainStreetRise + fairKnolls + drainage + countyRoll;`,
  `  const countyRoll = 1.4 * Math.sin(x * 0.018) * Math.cos(z * 0.015);
  const baseHeight = pineRidge + mainStreetRise + fairKnolls + drainage + countyRoll;
  return campaignTerrainProfile(x, z, baseHeight);`,
  'campaign terrain profile consumption'
);

replaceExact(
  `  color.lerp(new THREE.Color('#315f4a'), drainageMix);
  return color;`,
  `  color.lerp(new THREE.Color('#315f4a'), drainageMix);
  return campaignGroundPalette(color, x, z, height);`,
  'campaign ground palette consumption'
);

const worldRuntime = String.raw`// ============================================================================
// [SW:WORLD:CAMPAIGN_IDENTITY]
// V500_WORLD_TOUR_V1
// Purpose: Make every Heartland stop visually and mechanically recognizable.
// Invariants:
// - Signature scenery remains outside the core collision contract.
// - Exactly two destructible landmarks are present in every stop.
// - Terrain variation is rebuilt before town targets spawn.
// - Mesh count stays intentionally modest for mobile thermals.
// ============================================================================
const HEARTLAND_WORLD_BLUEPRINTS = {
  'lincoln-county': {
    profile: 0, biome: 'WOODED RIDGES + CREEK COUNTRY', broadcast: 'RIDGE COUNTY LOCAL',
    fogDensity: 0.0022, accent: '#60a5fa', targetTint: '#3f7a51', animalLimit: 38,
    media: ['LIVE 8', 'TEAM MESO', 'VORTEX VAN', 'COUNTY 5', 'HOOK ECHO', 'ACTION 12', 'DEBRIS DESK', 'SKY 4', 'CORE PUNCH'],
    challenges: [
      { id: 'mailbox-mixer', text: 'MAILBOX MIXER: Launch 3 yard decorations', tags: ['yard'], target: 3 },
      { id: 'county-business', text: 'COUNTY BUSINESS: Flatten 2 Main Street signs', tags: ['sign'], target: 2 },
      { id: 'midway-makeover', text: 'MIDWAY MAKEOVER: Launch 4 fairground props', tags: ['fair'], target: 4 }
    ],
    landmarks: [
      { kind: 'water-tower', name: 'LINCOLN WATER TOWER', icon: 'WATER', x: -145, z: -110, health: 280 },
      { kind: 'courthouse', name: 'COUNTY COURTHOUSE', icon: 'CLOCK', x: 155, z: 135, health: 330 }
    ]
  },
  'prairie-junction': {
    profile: 1, biome: 'OPEN PRAIRIE + RAIL CORRIDOR', broadcast: 'CROSSWIND COUNTRY',
    fogDensity: 0.00165, accent: '#facc15', targetTint: '#c5a84a', animalLimit: 24,
    media: ['PRAIRIE 4', 'CROSSWIND', 'DRYLINE ONE', 'RAIL CAM', 'TEAM CAPROCK', 'LIVE RANGE', 'MESO MOBILE', 'RODEO CAM', 'GUST BUS'],
    challenges: [
      { id: 'prairie-cleanup', text: 'PRAIRIE CLEANUP: Launch 3 yard props', tags: ['yard'], target: 3 },
      { id: 'whistle-stop', text: 'WHISTLE STOP: Remove 3 town signs', tags: ['sign'], target: 3 },
      { id: 'rodeo-redecorating', text: 'RODEO REDECORATING: Launch 4 fair props', tags: ['fair'], target: 4 }
    ],
    landmarks: [
      { kind: 'grain-elevator', name: 'PRAIRIE GRAIN ELEVATOR', icon: 'GRAIN', x: -145, z: -110, health: 340 },
      { kind: 'windmill', name: 'JUNCTION WINDMILL', icon: 'WIND', x: 155, z: 135, health: 290 }
    ]
  },
  'grain-belt': {
    profile: 2, biome: 'HARVEST SHELVES + INDUSTRIAL SKYLINE', broadcast: 'THE HARVEST CHANNEL',
    fogDensity: 0.00245, accent: '#fb923c', targetTint: '#a9502b', animalLimit: 18,
    media: ['GRAIN 11', 'BIN CAM', 'HARVEST LIVE', 'DUST DESK', 'BELT WEATHER', 'SHIFT CAM', 'RUST VAN', 'ELEVATOR EYE', 'COMBINE CAM'],
    challenges: [
      { id: 'crop-circle', text: 'CROP CIRCLE: Remove 3 roadside props', tags: ['yard'], target: 3 },
      { id: 'shift-change', text: 'SHIFT CHANGE: Launch 3 Main Street props', tags: ['main'], target: 3 },
      { id: 'harvest-havoc', text: 'HARVEST HAVOC: Wreck 2 carnival rides', tags: ['ride'], target: 2 }
    ],
    landmarks: [
      { kind: 'silo-bank', name: 'NORTH SILO BANK', icon: 'GRAIN', x: -145, z: -110, health: 390 },
      { kind: 'foundry', name: 'HEARTLAND FOUNDRY', icon: 'FOUNDRY', x: 155, z: 135, health: 420 }
    ]
  },
  'state-fair-finale': {
    profile: 3, biome: 'FAIRGROUND BOWL + NEON MIDWAY', broadcast: 'NATIONAL DISASTER DESK',
    fogDensity: 0.0019, accent: '#f472b6', targetTint: '#b6408a', animalLimit: 8,
    media: ['NETWORK LIVE', 'MIDWAY CAM', 'PRIME STORM', 'SKY TRUCK', 'FERRIS FEED', 'GRANDSTAND', 'NATIONAL 1', 'CHAMP CAM', 'LAST RIDE'],
    challenges: [
      { id: 'parking-lot-panic', text: 'PARKING LOT PANIC: Launch 3 lawn props', tags: ['lawn'], target: 3 },
      { id: 'broadcast-interruption', text: 'BROADCAST INTERRUPTION: Flatten 2 signs', tags: ['sign'], target: 2 },
      { id: 'grand-finale', text: 'GRAND FINALE: Launch 4 fairground props', tags: ['fair'], target: 4 }
    ],
    landmarks: [
      { kind: 'ferris-wheel', name: 'CHAMPIONSHIP FERRIS WHEEL', icon: 'WHEEL', x: -145, z: -110, health: 440 },
      { kind: 'grandstand', name: 'HEARTLAND GRANDSTAND', icon: 'STADIUM', x: 155, z: 135, health: 480 }
    ]
  }
};

let campaignSceneryGroup = null;
let campaignAnimatedMeshes = [];

function ensureCampaignSceneryGroup() {
  if (campaignSceneryGroup) return campaignSceneryGroup;
  campaignSceneryGroup = new THREE.Group();
  campaignSceneryGroup.name = 'HeartlandCampaignScenery';
  scene.add(campaignSceneryGroup);
  return campaignSceneryGroup;
}

function getCampaignWorldBlueprint(level = getActiveCampaignLevel()) {
  return HEARTLAND_WORLD_BLUEPRINTS[level.id] || HEARTLAND_WORLD_BLUEPRINTS['lincoln-county'];
}

function campaignChallengeFor(stage, fallback) {
  return getCampaignWorldBlueprint().challenges[stage - 1] || fallback;
}

function clearCampaignScenery() {
  ensureCampaignSceneryGroup();
  campaignAnimatedMeshes = [];
  while (campaignSceneryGroup.children.length) {
    const child = campaignSceneryGroup.children[campaignSceneryGroup.children.length - 1];
    campaignSceneryGroup.remove(child);
    child.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material.dispose());
      }
    });
  }
}

function campaignPart(group, geometry, color, x, y, z, options = {}) {
  const material = options.material || new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.7,
    metalness: options.metalness ?? 0.05,
    emissive: options.emissive || '#000000',
    emissiveIntensity: options.emissiveIntensity || 0
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (options.rotation) mesh.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
  if (options.scale) mesh.scale.set(options.scale.x || 1, options.scale.y || 1, options.scale.z || 1);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  group.add(mesh);
  return mesh;
}

function campaignGroundPart(geometry, color, x, z, yOffset = 0, options = {}) {
  ensureCampaignSceneryGroup();
  const mesh = campaignPart(campaignSceneryGroup, geometry, color, x, terrainHeightAt(x, z) + yOffset, z, options);
  return mesh;
}

function addCampaignWindmill(x, z, scale = 1, color = '#e2e8f0') {
  const group = new THREE.Group();
  group.position.set(x, terrainHeightAt(x, z), z);
  campaignPart(group, new THREE.CylinderGeometry(0.45, 1.5, 16 * scale, 6), '#64748b', 0, 8 * scale, 0, { metalness: 0.55 });
  const hub = campaignPart(group, new THREE.SphereGeometry(1.0 * scale, 8, 8), color, 0, 15 * scale, 0);
  const blades = new THREE.Group();
  blades.position.copy(hub.position);
  campaignPart(blades, new THREE.BoxGeometry(1.0 * scale, 13 * scale, 0.45), color, 0, 0, 0, { metalness: 0.35 });
  campaignPart(blades, new THREE.BoxGeometry(13 * scale, 1.0 * scale, 0.45), color, 0, 0, 0, { metalness: 0.35 });
  group.add(blades);
  campaignAnimatedMeshes.push({ mesh: blades, axis: 'z', speed: 0.55 + scale * 0.1 });
  campaignSceneryGroup.add(group);
}

function addCampaignFloodlight(x, z, color) {
  const group = new THREE.Group();
  group.position.set(x, terrainHeightAt(x, z), z);
  campaignPart(group, new THREE.CylinderGeometry(0.25, 0.55, 16, 6), '#334155', 0, 8, 0, { metalness: 0.65 });
  for (let i = -1; i <= 1; i++) {
    campaignPart(group, new THREE.BoxGeometry(2.0, 1.1, 0.8), color, i * 2.2, 16, 0, { emissive: color, emissiveIntensity: 0.7 });
  }
  campaignSceneryGroup.add(group);
}

function spawnCampaignScenery(level) {
  ensureCampaignSceneryGroup();
  clearCampaignScenery();
  const world = getCampaignWorldBlueprint(level);

  if (world.profile === 0) {
    [[-300,-250,34,13],[-245,275,42,15],[290,235,38,12],[260,-285,46,16]].forEach(([x,z,s,h]) => {
      campaignGroundPart(new THREE.DodecahedronGeometry(s, 1), '#294936', x, z, h * 0.15, { scale: { x: 1.6, y: h / s, z: 1.0 }, roughness: 0.96 });
    });
    for (let i = 0; i < 10; i++) {
      const x = -350 + i * 72;
      campaignGroundPart(new THREE.ConeGeometry(4.5, 11, 7), i % 2 ? '#14532d' : '#166534', x, 345 - (i % 3) * 12, 5.5);
    }
  } else if (world.profile === 1) {
    const fieldColors = ['#8aa34c', '#c0a64a', '#6f8f3c', '#d2b65c'];
    for (let i = 0; i < 16; i++) {
      const x = -330 + (i % 8) * 92;
      const z = i < 8 ? -280 : 280;
      campaignGroundPart(new THREE.BoxGeometry(62, 0.18, 26), fieldColors[i % fieldColors.length], x, z, 0.16, { castShadow: false });
    }
    addCampaignWindmill(-285, -205, 0.85);
    addCampaignWindmill(275, -205, 1.05);
    addCampaignWindmill(275, 205, 0.92);
    [-4, 4].forEach(offset => campaignGroundPart(new THREE.BoxGeometry(720, 0.22, 0.35), '#7c6044', 0, -205 + offset, 0.38, { metalness: 0.6 }));
  } else if (world.profile === 2) {
    [[-335,-245,70,14],[-310,245,82,17],[-255,320,58,12]].forEach(([x,z,s,h]) => {
      campaignGroundPart(new THREE.DodecahedronGeometry(s, 1), '#6b4a2e', x, z, h * 0.12, { scale: { x: 1.5, y: h / s, z: 0.9 }, roughness: 0.98 });
    });
    for (let i = 0; i < 6; i++) {
      const x = -310 + i * 48;
      const z = 305;
      campaignGroundPart(new THREE.CylinderGeometry(8, 8.5, 22 + (i % 3) * 5, 12), i % 2 ? '#a16207' : '#78716c', x, z, 11 + (i % 3) * 2.5, { metalness: 0.35 });
    }
    campaignGroundPart(new THREE.BoxGeometry(170, 3, 5), '#92400e', -190, 300, 28, { rotation: { z: -0.12 }, metalness: 0.45 });
    const roofTurbine = campaignGroundPart(new THREE.TorusGeometry(6, 1.1, 7, 18), '#f59e0b', 235, 300, 24, { rotation: { x: Math.PI / 2 }, metalness: 0.68 });
    campaignAnimatedMeshes.push({ mesh: roofTurbine, axis: 'y', speed: 0.48 });
  } else {
    const neon = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 295;
      const z = Math.sin(angle) * 295;
      campaignGroundPart(new THREE.ConeGeometry(9, 13, 4), neon[i % neon.length], x, z, 6.5, { emissive: neon[i % neon.length], emissiveIntensity: 0.18, rotation: { y: Math.PI / 4 } });
    }
    [[-270,-210],[270,-210],[-270,210],[270,210]].forEach(([x,z], index) => addCampaignFloodlight(x, z, neon[index]));
    for (let i = -3; i <= 3; i++) {
      campaignGroundPart(new THREE.BoxGeometry(42, 0.22, 8), neon[(i + 4) % neon.length], i * 52, 285, 0.25, { emissive: neon[(i + 4) % neon.length], emissiveIntensity: 0.2, castShadow: false });
    }
  }
}

function createCampaignLandmarkMesh(kind, accent) {
  const group = new THREE.Group();
  const metal = '#64748b';
  let base;

  if (kind === 'water-tower') {
    for (const [x,z] of [[-3,-3],[3,-3],[-3,3],[3,3]]) campaignPart(group, new THREE.CylinderGeometry(0.35, 0.55, 15, 6), metal, x, 7.5, z, { metalness: 0.55 });
    base = campaignPart(group, new THREE.SphereGeometry(5.2, 14, 10), '#38bdf8', 0, 17, 0, { metalness: 0.38 });
  } else if (kind === 'courthouse') {
    base = campaignPart(group, new THREE.BoxGeometry(15, 10, 13), '#b45309', 0, 5, 0, { roughness: 0.82 });
    campaignPart(group, new THREE.ConeGeometry(10.5, 6, 4), '#334155', 0, 13, 0, { rotation: { y: Math.PI / 4 } });
    campaignPart(group, new THREE.BoxGeometry(4, 7, 4), '#f5deb3', 0, 16.5, 0);
  } else if (kind === 'grain-elevator') {
    base = campaignPart(group, new THREE.BoxGeometry(10, 27, 12), '#d6d3d1', 0, 13.5, 0, { metalness: 0.18 });
    [-7,7].forEach(x => campaignPart(group, new THREE.CylinderGeometry(4.5, 4.8, 20, 12), '#a8a29e', x, 10, 0, { metalness: 0.35 }));
  } else if (kind === 'windmill') {
    base = campaignPart(group, new THREE.CylinderGeometry(0.65, 2.3, 23, 6), metal, 0, 11.5, 0, { metalness: 0.55 });
    const blades = new THREE.Group();
    blades.position.set(0, 22, 0);
    campaignPart(blades, new THREE.BoxGeometry(1.2, 19, 0.7), accent, 0, 0, 0, { metalness: 0.4 });
    campaignPart(blades, new THREE.BoxGeometry(19, 1.2, 0.7), accent, 0, 0, 0, { metalness: 0.4 });
    group.add(blades);
    campaignAnimatedMeshes.push({ mesh: blades, axis: 'z', speed: 0.85 });
  } else if (kind === 'silo-bank') {
    base = campaignPart(group, new THREE.CylinderGeometry(5.2, 5.5, 25, 14), '#a8a29e', 0, 12.5, 0, { metalness: 0.45 });
    [-11,11].forEach(x => campaignPart(group, new THREE.CylinderGeometry(4.5, 4.8, 20, 12), '#78716c', x, 10, 0, { metalness: 0.45 }));
    [-11,0,11].forEach(x => campaignPart(group, new THREE.ConeGeometry(5.2, 4, 12), '#57534e', x, x === 0 ? 27 : 22, 0));
  } else if (kind === 'foundry') {
    base = campaignPart(group, new THREE.BoxGeometry(21, 11, 16), '#9a3412', 0, 5.5, 0, { metalness: 0.26 });
    [-6,6].forEach(x => campaignPart(group, new THREE.CylinderGeometry(2.0, 2.7, 28, 10), '#44403c', x, 18, 2, { metalness: 0.38 }));
    campaignPart(group, new THREE.BoxGeometry(25, 2, 4), '#78716c', 0, 15, -4, { rotation: { z: 0.14 }, metalness: 0.55 });
  } else if (kind === 'ferris-wheel') {
    base = campaignPart(group, new THREE.BoxGeometry(15, 2.2, 12), '#7c3aed', 0, 1.1, 0, { metalness: 0.3 });
    const wheel = new THREE.Group();
    wheel.position.set(0, 18, 0);
    campaignPart(wheel, new THREE.TorusGeometry(13, 0.8, 8, 28), accent, 0, 0, 0, { emissive: accent, emissiveIntensity: 0.45, metalness: 0.4 });
    for (let i = 0; i < 8; i++) campaignPart(wheel, new THREE.BoxGeometry(25, 0.45, 0.45), '#fde68a', 0, 0, 0, { rotation: { z: i * Math.PI / 8 }, emissive: '#fbbf24', emissiveIntensity: 0.25 });
    group.add(wheel);
    campaignAnimatedMeshes.push({ mesh: wheel, axis: 'z', speed: 0.22 });
  } else {
    base = campaignPart(group, new THREE.BoxGeometry(28, 5, 14), '#1d4ed8', 0, 2.5, 0, { metalness: 0.18 });
    for (let row = 0; row < 4; row++) campaignPart(group, new THREE.BoxGeometry(28 - row * 3, 1.8, 4), row % 2 ? '#f8fafc' : '#ef4444', 0, 5 + row * 1.7, 2 + row * 2.0);
    campaignPart(group, new THREE.BoxGeometry(18, 8, 1.5), '#0f172a', 0, 15, -5, { emissive: accent, emissiveIntensity: 0.22 });
  }

  const beacon = campaignPart(group, new THREE.OctahedronGeometry(2.2), accent, 0, 31, 0, { material: new THREE.MeshBasicMaterial({ color: accent, wireframe: true }) });
  return { group, base, beacon, color: accent };
}

function replaceCampaignLandmarks(level) {
  landmarks.forEach(landmark => scene.remove(landmark.meshData.group));
  landmarks.length = 0;
  const world = getCampaignWorldBlueprint(level);
  world.landmarks.forEach(contract => {
    const meshData = createCampaignLandmarkMesh(contract.kind, world.accent);
    meshData.group.position.set(contract.x, terrainHeightAt(contract.x, contract.z), contract.z);
    scene.add(meshData.group);
    landmarks.push({
      x: contract.x, z: contract.z, name: contract.name, icon: contract.icon,
      health: contract.health, maxHealth: contract.health, destroyed: false, meshData
    });
  });
}

function rebuildCampaignTerrainSurface() {
  const update = (mesh, lift, apron) => {
    if (!mesh || !mesh.geometry) return;
    const positions = mesh.geometry.attributes.position;
    const colors = mesh.geometry.attributes.color;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = -positions.getY(i);
      const height = terrainHeightAt(x, z);
      positions.setZ(i, height + lift);
      const edgeFade = apron ? THREE.MathUtils.clamp((Math.max(Math.abs(x), Math.abs(z)) - 360) / 520, 0, 1) : 0;
      const color = districtGroundColor(x, z, height).multiplyScalar(1 - edgeFade * 0.42);
      if (colors) colors.setXYZ(i, color.r, color.g, color.b);
    }
    positions.needsUpdate = true;
    if (colors) colors.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
  };
  update(terrainMesh, -0.08, false);
  update(countyApron, -0.65, true);
}

function prepareCampaignWorld() {
  globalThis.__SW_ACTIVE_CAMPAIGN_WORLD__ = selectedCampaignIndex;
  rebuildCampaignTerrainSurface();
  if (typeof ridgeRocks !== 'undefined') ridgeRocks.visible = selectedCampaignIndex === 0;
}

function applyCampaignWorldIdentity(level) {
  const world = getCampaignWorldBlueprint(level);
  spawnCampaignScenery(level);
  replaceCampaignLandmarks(level);
  scene.fog.density = world.fogDensity;

  targets.forEach(target => {
    target.meshData.group.traverse(object => {
      if (!object.material || !object.material.color || (object.material.emissiveIntensity || 0) > 0.3) return;
      object.material.color.lerp(new THREE.Color(world.targetTint), 0.18);
    });
  });

  chaserVans.forEach((van, index) => { van.callSign = world.media[index % world.media.length]; });
  while (animals.length > world.animalLimit) {
    const animal = animals.pop();
    scene.remove(animal.mesh);
  }

  setUI('campaignHud', 'HEARTLAND TOUR | ' + level.name + ' | ' + world.broadcast + ' | SCORE x' + level.scoreMultiplier.toFixed(2));
}

function updateCampaignScenery(dt) {
  campaignAnimatedMeshes.forEach(item => {
    item.mesh.rotation[item.axis] += item.speed * dt;
  });
}

window.getCampaignWorldQaState = function getCampaignWorldQaState() {
  const level = getActiveCampaignLevel();
  const world = getCampaignWorldBlueprint(level);
  return {
    levelId: level.id,
    profile: world.profile,
    biome: world.biome,
    broadcast: world.broadcast,
    sceneryCount: campaignSceneryGroup.children.length,
    animatedCount: campaignAnimatedMeshes.length,
    landmarks: landmarks.map(landmark => landmark.name),
    challenge: getDistrictChallenge(1)?.text || '',
    media: chaserVans.map(van => van.callSign),
    animals: animals.length,
    terrainSamples: [[-235,-235],[35,35],[235,235]].map(([x,z]) => Number(terrainHeightAt(x,z).toFixed(2)))
  };
};
// [SW:WORLD:CAMPAIGN_IDENTITY:END]`;

replaceExact(
  'function applyCampaignPresentation() {',
  `${worldRuntime}

function applyCampaignPresentation() {`,
  'campaign world runtime'
);

replaceExact(
  `  setUI('districtTitle', level.districts[0][0]);`,
  `  applyCampaignWorldIdentity(level);
  setUI('districtTitle', level.districts[0][0]);`,
  'campaign world presentation hook'
);

replaceExact(
  `    const selected = pool[index];
    return { ...selected, stage, progress: 0, done: false, reward: 450 };`,
  `    const selected = campaignChallengeFor(stage, pool[index]);
    return { ...selected, stage, progress: 0, done: false, reward: 450 };`,
  'campaign challenge identity'
);

replaceExact(
  `  getCachedEl('resultsOverlay').classList.remove('active');
  init3DWorld();
  applyCampaignPresentation();`,
  `  getCachedEl('resultsOverlay').classList.remove('active');
  prepareCampaignWorld();
  init3DWorld();
  applyCampaignPresentation();`,
  'prepare campaign terrain before world spawn'
);

replaceExact(
  `  // Rotate Landmark & Substation 3D Wayfinding Beacons
  landmarks.forEach(lm => {`,
  `  updateCampaignScenery(dt);

  // Rotate Landmark & Substation 3D Wayfinding Beacons
  landmarks.forEach(lm => {`,
  'campaign scenery animation hook'
);

requiredMarkers.forEach(marker => {
  if (!html.includes(marker)) throw new Error(`V5 world-tour verification failed: missing ${marker}`);
});

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied V5 Heartland authored world tour to ${sourcePath}`);
