// ============================================================================
// [SW:WORLD:CITY_FABRIC_PASS]
// Campaign-specific SimCity-style urban fabric. Preserves the accepted road
// grid, gameplay laws, targets API, destruction stages, and campaign timing.
// ============================================================================
const CITY_FABRIC_PASS_VERSION = 'CITY_FABRIC_DESTRUCTION_V1';

const CITY_FABRIC_PROFILES = Object.freeze([
  Object.freeze({
    id: 'lincoln-county',
    label: 'RURAL COUNTY SEAT',
    zoneRows: ['FFSSFF', 'FSSSSF', 'SMCCMS', 'SMCCMS', 'FSSSSF', 'FFSSFF'],
    zones: Object.freeze({
      F: Object.freeze({ name: 'FARM EDGE', pad: '#49623f', lots: 'quad', archetypes: ['cottage', 'cottage', 'tree', 'windbreak'] }),
      S: Object.freeze({ name: 'SUBDIVISION', pad: '#4e7650', lots: 'courtyard', archetypes: ['cottage', 'cottage', 'rowhouse', 'garage', 'tree'] }),
      M: Object.freeze({ name: 'MAIN STREET', pad: '#46566a', lots: 'mainstreet', archetypes: ['shop', 'shop', 'apartment', 'office', 'tree'] }),
      C: Object.freeze({ name: 'CIVIC CORE', pad: '#625746', lots: 'civic', archetypes: ['civic', 'apartment', 'shop', 'tree'] }),
    }),
  }),
  Object.freeze({
    id: 'prairie-junction',
    label: 'RAIL JUNCTION TOWN',
    zoneRows: ['PPJJPP', 'PPJJPP', 'RRJJRR', 'RRJJRR', 'PPJJPP', 'PPJJPP'],
    zones: Object.freeze({
      P: Object.freeze({ name: 'PRAIRIE NEIGHBORHOOD', pad: '#6b7641', lots: 'courtyard', archetypes: ['cottage', 'cottage', 'garage', 'tree', 'windbreak'] }),
      J: Object.freeze({ name: 'JUNCTION CORE', pad: '#4b5563', lots: 'mainstreet', archetypes: ['shop', 'rowhouse', 'apartment', 'office', 'tree'] }),
      R: Object.freeze({ name: 'RAIL CORRIDOR', pad: '#665747', lots: 'industrial', archetypes: ['warehouse', 'warehouse', 'silo', 'service'] }),
    }),
  }),
  Object.freeze({
    id: 'grain-belt',
    label: 'INDUSTRIAL AGRO CITY',
    zoneRows: ['SSIIIS', 'SIIIIS', 'WWIIWW', 'WWIIWW', 'SIIIIS', 'SSIIIS'],
    zones: Object.freeze({
      S: Object.freeze({ name: 'SILO DISTRICT', pad: '#76563b', lots: 'industrial', archetypes: ['silo', 'warehouse', 'silo', 'service'] }),
      I: Object.freeze({ name: 'FOUNDRY GRID', pad: '#5d4b43', lots: 'industrial-dense', archetypes: ['warehouse', 'foundry', 'warehouse', 'office', 'service'] }),
      W: Object.freeze({ name: 'WORKER QUARTERS', pad: '#56644d', lots: 'courtyard', archetypes: ['rowhouse', 'apartment', 'shop', 'cottage', 'tree'] }),
    }),
  }),
  Object.freeze({
    id: 'state-fair-finale',
    label: 'STATE FAIR CITY',
    zoneRows: ['PPXXPP', 'PEMMEP', 'PEMMEP', 'PEMMEP', 'PEMMEP', 'PPSSPP'],
    zones: Object.freeze({
      P: Object.freeze({ name: 'PARKING + SERVICE', pad: '#5d5368', lots: 'service', archetypes: ['service', 'booth', 'booth', 'tree'] }),
      X: Object.freeze({ name: 'GRANDSTAND APPROACH', pad: '#704b67', lots: 'fair-dense', archetypes: ['pavilion', 'booth', 'booth', 'service', 'tree'] }),
      E: Object.freeze({ name: 'EXHIBITION ROW', pad: '#6a5261', lots: 'fair-dense', archetypes: ['pavilion', 'booth', 'booth', 'shop', 'service'] }),
      M: Object.freeze({ name: 'MIDWAY BLOCK', pad: '#7d4e67', lots: 'midway', archetypes: ['booth', 'booth', 'booth', 'pavilion', 'service', 'tree'] }),
      S: Object.freeze({ name: 'SHOW RING SERVICE', pad: '#62566c', lots: 'industrial', archetypes: ['pavilion', 'service', 'warehouse', 'booth'] }),
    }),
  }),
]);

const CITY_FABRIC_LOTS = Object.freeze({
  quad: Object.freeze([[-18, -18], [18, -18], [-18, 18], [18, 18]]),
  courtyard: Object.freeze([[-20, -20], [20, -20], [-20, 20], [20, 20], [0, 0]]),
  mainstreet: Object.freeze([[-21, -20], [0, -20], [21, -20], [-18, 19], [18, 19]]),
  civic: Object.freeze([[0, -13], [-21, 20], [0, 20], [21, 20]]),
  industrial: Object.freeze([[-18, -18], [18, -17], [-18, 19], [18, 20]]),
  'industrial-dense': Object.freeze([[-21, -20], [0, -20], [21, -20], [-18, 20], [18, 20]]),
  service: Object.freeze([[-20, -19], [20, -19], [-20, 19], [20, 19]]),
  'fair-dense': Object.freeze([[-21, -20], [0, -20], [21, -20], [-18, 18], [18, 18]]),
  midway: Object.freeze([[-22, -21], [0, -21], [22, -21], [-22, 15], [0, 15], [22, 15]]),
});

const CITY_FABRIC_STATS = Object.freeze({
  cottage: Object.freeze({ health: 115, points: 75, materialFamily: 'wood', commercial: false }),
  garage: Object.freeze({ health: 130, points: 82, materialFamily: 'wood', commercial: false }),
  rowhouse: Object.freeze({ health: 175, points: 115, materialFamily: 'masonry', commercial: true, hasGlass: true }),
  shop: Object.freeze({ health: 165, points: 110, materialFamily: 'glass', commercial: true, hasGlass: true }),
  apartment: Object.freeze({ health: 220, points: 145, materialFamily: 'masonry', commercial: true, hasGlass: true }),
  office: Object.freeze({ health: 235, points: 155, materialFamily: 'glass', commercial: true, hasGlass: true }),
  civic: Object.freeze({ health: 270, points: 175, materialFamily: 'concrete', commercial: true, hasGlass: true }),
  warehouse: Object.freeze({ health: 190, points: 125, materialFamily: 'metal', commercial: true }),
  silo: Object.freeze({ health: 220, points: 150, materialFamily: 'silo', commercial: true }),
  foundry: Object.freeze({ health: 245, points: 165, materialFamily: 'metal', commercial: true }),
  service: Object.freeze({ health: 145, points: 95, materialFamily: 'metal', commercial: true }),
  booth: Object.freeze({ health: 82, points: 58, materialFamily: 'carnival', commercial: true }),
  pavilion: Object.freeze({ health: 185, points: 125, materialFamily: 'carnival', commercial: true }),
  tree: Object.freeze({ health: 42, points: 30, materialFamily: 'tree', commercial: false, tree: true }),
  windbreak: Object.freeze({ health: 70, points: 42, materialFamily: 'tree', commercial: false, tree: true }),
});

function cityFabricNoise(seed, salt = 0) {
  const value = Math.sin((seed + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function cityFabricAddPart(group, damageParts, geometry, color, x, y, z, options = {}) {
  const part = addPropPart(group, geometry, color, x, y, z, options);
  if (options.damage !== false) damageParts.push(part);
  return part;
}

function cityFabricWindowMaterial(color = '#7dd3fc') {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.28,
    roughness: 0.16,
    metalness: 0.55,
  });
}

function cityFabricCreateTreeMesh(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  const species = variant % 5;
  const heightScale = 0.86 + cityFabricNoise(variant, 2) * 0.42;
  const lean = (cityFabricNoise(variant, 3) - 0.5) * 0.12;
  const trunkColor = ['#6b3f20', '#70452b', '#5a3b25', '#7a4b2c', '#51351f'][species];
  const trunkHeight = [5.6, 5.0, 7.8, 4.2, 6.4][species] * heightScale;
  const trunk = cityFabricAddPart(
    group,
    damageParts,
    new THREE.CylinderGeometry(0.38 + species * 0.035, 0.62 + species * 0.04, trunkHeight, 7),
    trunkColor,
    0,
    trunkHeight * 0.5,
    0,
    { roughness: 0.94 },
  );
  trunk.rotation.z = lean;

  const greens = [
    ['#163f2a', '#1f5a34', '#2c6b3b'],
    ['#365f2c', '#4f7b34', '#6b8d3c'],
    ['#2f5d3d', '#477a4c', '#5b8f58'],
    ['#48672f', '#62833b', '#78964b'],
    ['#284f36', '#3d6d43', '#56804f'],
  ][species];

  if (species === 0) {
    for (let tier = 0; tier < 4; tier += 1) {
      const radius = 3.5 - tier * 0.58;
      cityFabricAddPart(group, damageParts, new THREE.ConeGeometry(radius, 3.2, 7), greens[tier % greens.length], 0, trunkHeight * 0.55 + tier * 1.65, 0, { roughness: 0.84 });
    }
  } else if (species === 1) {
    [[-1.1, 0.0, 0.2], [0.9, 0.4, 0.6], [0.2, 1.1, -0.7], [-0.5, 1.5, 0.8]].forEach((offset, index) => {
      cityFabricAddPart(group, damageParts, new THREE.DodecahedronGeometry(2.2 + (index % 2) * 0.35, 1), greens[index % greens.length], offset[0], trunkHeight + offset[1], offset[2], { roughness: 0.82 });
    });
  } else if (species === 2) {
    [[-0.8, 0.0, 0], [0.7, 0.7, 0.3], [0, 1.8, -0.4]].forEach((offset, index) => {
      cityFabricAddPart(group, damageParts, new THREE.SphereGeometry(2.3 - index * 0.15, 8, 7), greens[index % greens.length], offset[0], trunkHeight + offset[1], offset[2], { scale: { x: 0.82, y: 1.42, z: 0.82 }, roughness: 0.88 });
    });
  } else if (species === 3) {
    [[-0.7, 0, 0], [0.7, 0.2, 0], [0, 0.9, 0.3]].forEach((offset, index) => {
      cityFabricAddPart(group, damageParts, new THREE.IcosahedronGeometry(1.85 + index * 0.12, 1), greens[index % greens.length], offset[0], trunkHeight + offset[1], offset[2], { roughness: 0.78 });
    });
  } else {
    const branchMaterial = new THREE.MeshStandardMaterial({ color: trunkColor, roughness: 0.92 });
    [-1, 1].forEach((direction, index) => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.27, 3.4, 6), branchMaterial);
      branch.position.set(direction * 0.75, trunkHeight * 0.78, 0);
      branch.rotation.z = direction * 0.7;
      group.add(branch);
      damageParts.push(branch);
      cityFabricAddPart(group, damageParts, new THREE.DodecahedronGeometry(2.35, 1), greens[index], direction * 1.7, trunkHeight + 1.0, 0, { roughness: 0.86 });
    });
    cityFabricAddPart(group, damageParts, new THREE.DodecahedronGeometry(2.5, 1), greens[2], 0, trunkHeight + 2.1, 0, { roughness: 0.86 });
  }

  group.rotation.y = cityFabricNoise(variant, 7) * Math.PI * 2;
  group.scale.setScalar(0.9 + cityFabricNoise(variant, 8) * 0.24);
  return { group, base: trunk, color: greens[1], damageParts, footprint: 5.5, label: ['PINE', 'OAK', 'COTTONWOOD', 'ORNAMENTAL TREE', 'ELM'][species], points: 30, species };
}

function cityFabricCreateWindbreak(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  for (let index = 0; index < 3; index += 1) {
    const tree = cityFabricCreateTreeMesh(variant + index * 7);
    tree.group.position.set((index - 1) * 3.4, 0, (index % 2) * 1.6 - 0.8);
    tree.group.scale.multiplyScalar(0.76 + index * 0.06);
    group.add(tree.group);
    damageParts.push(tree.group);
  }
  return { group, base: damageParts[0], color: '#2f6b3c', damageParts, footprint: 9.5, label: 'WINDBREAK', points: 42, species: 'cluster' };
}

function cityFabricCreateCottage(variant = 0, garage = false) {
  const meshData = createHouseMesh(1, variant, variant);
  meshData.group.scale.setScalar(0.88 + cityFabricNoise(variant, 4) * 0.22);
  if (garage && !meshData.damageParts.some((part) => part.geometry?.parameters?.width > 4)) {
    cityFabricAddPart(meshData.group, meshData.damageParts, new THREE.BoxGeometry(4.8, 3.2, 5.6), '#64748b', 5.2, 1.75, 0.6, { roughness: 0.75 });
  }
  meshData.label = garage ? 'RANCH HOME + GARAGE' : 'HOME';
  meshData.points = garage ? 82 : 75;
  return meshData;
}

function cityFabricCreateRowhouse(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  const colors = ['#9f3d35', '#c96b3c', '#3f6f87', '#7b5b8b', '#7c6944'];
  for (let unit = 0; unit < 3; unit += 1) {
    const x = (unit - 1) * 5.2;
    const h = 7.2 + ((variant + unit) % 2) * 1.8;
    const color = colors[(variant + unit) % colors.length];
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(4.9, h, 8.4), color, x, h * 0.5, 0, { roughness: 0.72 });
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(4.5, 0.45, 8.0), '#293241', x, h + 0.22, 0, { roughness: 0.6, metalness: 0.1 });
    const windowMat = cityFabricWindowMaterial(unit % 2 ? '#93c5fd' : '#fde68a');
    for (let floor = 0; floor < 2; floor += 1) {
      cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(1.0, 1.2, 0.2), '#93c5fd', x - 1.15, 2.5 + floor * 2.5, -4.25, { material: windowMat, damage: true });
      cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(1.0, 1.2, 0.2), '#93c5fd', x + 1.15, 2.5 + floor * 2.5, -4.25, { material: windowMat, damage: true });
    }
  }
  group.rotation.y = (variant % 2) * Math.PI / 2;
  return { group, base: damageParts[0], color: colors[variant % colors.length], damageParts, footprint: 16, label: 'ROWHOUSES', points: 115 };
}

function cityFabricCreateShop(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  const palette = ['#b45309', '#0369a1', '#7c3aed', '#0f766e', '#be123c'];
  const color = palette[variant % palette.length];
  const width = 12 + (variant % 3) * 2.5;
  const height = 5.2 + (variant % 2) * 1.5;
  const depth = 10 + ((variant + 1) % 2) * 2;
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width, height, depth), color, 0, height * 0.5, 0, { roughness: 0.72 });
  const glass = cityFabricWindowMaterial('#67e8f9');
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width * 0.72, 2.0, 0.22), '#67e8f9', 0, 2.5, -depth * 0.5 - 0.12, { material: glass });
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width * 0.9, 0.45, 2.5), variant % 2 ? '#f59e0b' : '#22c55e', 0, 4.7, -depth * 0.5 - 1.1, { rotation: { x: -0.16 }, roughness: 0.55 });
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width * 0.6, 1.1, 0.32), '#f8fafc', 0, height + 0.9, -depth * 0.5, { roughness: 0.45 });
  group.rotation.y = (variant % 4) * Math.PI / 2;
  return { group, base: damageParts[0], color, damageParts, footprint: Math.max(width, depth), label: 'STOREFRONT', points: 110 };
}

function cityFabricCreateApartment(variant = 0, civic = false) {
  const group = new THREE.Group();
  const damageParts = [];
  const width = civic ? 18 : 12 + (variant % 3) * 2;
  const depth = civic ? 14 : 10 + ((variant + 1) % 2) * 2;
  const floors = civic ? 3 : 3 + (variant % 3);
  const floorHeight = civic ? 3.5 : 3.2;
  const height = floors * floorHeight;
  const palette = civic ? ['#a16207', '#92400e'] : ['#475569', '#1d4ed8', '#0f766e', '#6d28d9'];
  const color = palette[variant % palette.length];
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width, height, depth), color, 0, height * 0.5, 0, { roughness: civic ? 0.84 : 0.48, metalness: civic ? 0.05 : 0.18 });
  const glass = cityFabricWindowMaterial(civic ? '#fde68a' : '#7dd3fc');
  for (let floor = 0; floor < floors; floor += 1) {
    const y = 2.2 + floor * floorHeight;
    [-0.32, 0, 0.32].forEach(column => {
      cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width * 0.18, 1.35, 0.2), '#7dd3fc', width * column, y, -depth * 0.5 - 0.11, { material: glass });
    });
  }
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(width * 0.94, 0.7, depth * 0.94), civic ? '#334155' : '#1e293b', 0, height + 0.35, 0, { roughness: 0.55, metalness: 0.2 });
  if (civic) {
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(4.8, 7, 4.8), '#f0d9a6', 0, height + 3.5, 0, { roughness: 0.75 });
    cityFabricAddPart(group, damageParts, new THREE.ConeGeometry(4.2, 4.5, 4), '#334155', 0, height + 9.1, 0, { rotation: { y: Math.PI / 4 }, roughness: 0.55 });
  }
  group.rotation.y = (variant % 4) * Math.PI / 2;
  return { group, base: damageParts[0], color, damageParts, footprint: Math.max(width, depth), label: civic ? 'CIVIC BUILDING' : 'APARTMENT BLOCK', points: civic ? 175 : 145 };
}

function cityFabricCreateSilo(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  const metalPalette = ['#a8a29e', '#78716c', '#c0b9ab'];
  const count = 2 + (variant % 2);
  for (let index = 0; index < count; index += 1) {
    const x = (index - (count - 1) / 2) * 6.4;
    const height = 14 + ((variant + index) % 3) * 3.5;
    cityFabricAddPart(group, damageParts, new THREE.CylinderGeometry(3.0, 3.2, height, 12), metalPalette[(variant + index) % metalPalette.length], x, height * 0.5, 0, { roughness: 0.52, metalness: 0.48 });
    cityFabricAddPart(group, damageParts, new THREE.ConeGeometry(3.2, 2.8, 12), '#57534e', x, height + 1.4, 0, { roughness: 0.62, metalness: 0.35 });
  }
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(count * 6.4, 1.2, 1.4), '#92400e', 0, 10 + (variant % 3), -3.6, { rotation: { z: 0.08 }, roughness: 0.58, metalness: 0.4 });
  group.rotation.y = (variant % 4) * Math.PI / 2;
  return { group, base: damageParts[0], color: metalPalette[variant % metalPalette.length], damageParts, footprint: 18, label: 'SILO CLUSTER', points: 150 };
}

function cityFabricCreateFoundry(variant = 0) {
  const meshData = createCommercialMesh(2, variant);
  const damageParts = meshData.damageParts;
  const group = meshData.group;
  [-4.5, 4.5].forEach((x, index) => {
    cityFabricAddPart(group, damageParts, new THREE.CylinderGeometry(1.1, 1.5, 17 + index * 4, 9), '#44403c', x, 12 + index * 2, 2.5, { roughness: 0.62, metalness: 0.45 });
  });
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(18, 1.1, 2.2), '#9a3412', 0, 10.5, -4.5, { rotation: { z: 0.12 }, roughness: 0.62, metalness: 0.36 });
  meshData.label = 'FOUNDRY';
  meshData.points = 165;
  meshData.footprint = Math.max(meshData.footprint || 18, 20);
  return meshData;
}

function cityFabricCreateService(variant = 0) {
  const group = new THREE.Group();
  const damageParts = [];
  const color = ['#0f766e', '#b45309', '#1d4ed8', '#be123c'][variant % 4];
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(9, 4.5, 8), color, -3.8, 2.25, 1.8, { roughness: 0.68 });
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(13, 0.65, 8), '#e2e8f0', 4.5, 5.3, -1.5, { roughness: 0.48, metalness: 0.22 });
  [-0.2, 9.2].forEach((x) => cityFabricAddPart(group, damageParts, new THREE.CylinderGeometry(0.28, 0.38, 5.0, 7), '#64748b', x, 2.5, -1.5, { roughness: 0.55, metalness: 0.45 }));
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(3.0, 2.0, 1.2), '#facc15', 3.2, 1.0, -1.4, { roughness: 0.5, metalness: 0.2 });
  cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(3.0, 2.0, 1.2), '#ef4444', 6.3, 1.0, -1.4, { roughness: 0.5, metalness: 0.2 });
  group.rotation.y = (variant % 4) * Math.PI / 2;
  return { group, base: damageParts[0], color, damageParts, footprint: 15, label: 'SERVICE STATION', points: 95 };
}

function cityFabricCreateBooth(variant = 0, pavilion = false) {
  const group = new THREE.Group();
  const damageParts = [];
  const palette = ['#f472b6', '#38bdf8', '#fbbf24', '#a78bfa', '#34d399', '#fb7185'];
  const color = palette[variant % palette.length];
  if (pavilion) {
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(16, 6.5, 12), '#6b415c', 0, 3.25, 0, { roughness: 0.72 });
    cityFabricAddPart(group, damageParts, new THREE.ConeGeometry(11, 5.5, 4), color, 0, 9.2, 0, { rotation: { y: Math.PI / 4 }, roughness: 0.65, emissive: color, emissiveIntensity: 0.08 });
    const glass = cityFabricWindowMaterial('#fdf4ff');
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(10, 2.0, 0.22), '#fdf4ff', 0, 3.2, -6.1, { material: glass });
  } else {
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(7.2, 3.6, 5.6), color, 0, 1.8, 0, { roughness: 0.72 });
    cityFabricAddPart(group, damageParts, new THREE.ConeGeometry(5.3, 3.2, 4), palette[(variant + 2) % palette.length], 0, 5.1, 0, { rotation: { y: Math.PI / 4 }, roughness: 0.62, emissive: color, emissiveIntensity: 0.12 });
    cityFabricAddPart(group, damageParts, new THREE.BoxGeometry(5.8, 1.3, 0.25), '#fff7ed', 0, 2.4, -2.95, { roughness: 0.5 });
  }
  group.rotation.y = (variant % 4) * Math.PI / 2;
  return { group, base: damageParts[0], roof: damageParts[1], color, damageParts, footprint: pavilion ? 17 : 8, label: pavilion ? 'EXHIBITION PAVILION' : 'MIDWAY BOOTH', points: pavilion ? 125 : 58 };
}

function cityFabricCreateMesh(archetype, variant) {
  if (archetype === 'cottage') return cityFabricCreateCottage(variant, false);
  if (archetype === 'garage') return cityFabricCreateCottage(variant, true);
  if (archetype === 'rowhouse') return cityFabricCreateRowhouse(variant);
  if (archetype === 'shop') return cityFabricCreateShop(variant);
  if (archetype === 'apartment') return cityFabricCreateApartment(variant, false);
  if (archetype === 'office') return createCommercialMesh(0, variant);
  if (archetype === 'civic') return cityFabricCreateApartment(variant, true);
  if (archetype === 'warehouse') return createCommercialMesh(2, variant);
  if (archetype === 'silo') return cityFabricCreateSilo(variant);
  if (archetype === 'foundry') return cityFabricCreateFoundry(variant);
  if (archetype === 'service') return cityFabricCreateService(variant);
  if (archetype === 'booth') return cityFabricCreateBooth(variant, false);
  if (archetype === 'pavilion') return cityFabricCreateBooth(variant, true);
  if (archetype === 'windbreak') return cityFabricCreateWindbreak(variant);
  return cityFabricCreateTreeMesh(variant);
}

function cityFabricAddGroundDetails(centerX, centerZ, zone, row, column) {
  const padGeometry = conformPlaneToTerrain(new THREE.PlaneGeometry(60, 60, 4, 4), centerX, centerZ, 0.17);
  const pad = new THREE.Mesh(padGeometry, new THREE.MeshStandardMaterial({ color: zone.pad, transparent: true, opacity: 0.58, roughness: 0.97, depthWrite: false }));
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(centerX, 0, centerZ);
  pad.receiveShadow = true;
  townDressGroup.add(pad);

  const sidewalkColor = '#a9b0b7';
  const sidewalkMaterial = new THREE.MeshStandardMaterial({ color: sidewalkColor, roughness: 0.92, transparent: true, opacity: 0.62 });
  const north = new THREE.Mesh(conformPlaneToTerrain(new THREE.PlaneGeometry(54, 3.2, 4, 1), centerX, centerZ - 27, 0.28), sidewalkMaterial);
  north.rotation.x = -Math.PI / 2;
  north.position.set(centerX, 0, centerZ - 27);
  townDressGroup.add(north);
  const west = new THREE.Mesh(conformPlaneToTerrain(new THREE.PlaneGeometry(3.2, 54, 1, 4), centerX - 27, centerZ, 0.28), sidewalkMaterial.clone());
  west.rotation.x = -Math.PI / 2;
  west.position.set(centerX - 27, 0, centerZ);
  townDressGroup.add(west);

  if ((row + column) % 3 === 0) {
    const alley = new THREE.Mesh(conformPlaneToTerrain(new THREE.PlaneGeometry(4.2, 48, 1, 4), centerX + 24, centerZ, 0.25), new THREE.MeshStandardMaterial({ color: '#3b4652', roughness: 0.86 }));
    alley.rotation.x = -Math.PI / 2;
    alley.position.set(centerX + 24, 0, centerZ);
    townDressGroup.add(alley);
  }
}

const cityFabricOriginalCreateTreeMesh = createTreeMesh;
const cityFabricOriginalBuildLivingCounty = buildLivingCounty;
createTreeMesh = cityFabricCreateTreeMesh;

buildLivingCounty = function buildCityFabricCounty() {
  townBlocks.length = 0;
  while (townDressGroup.children.length > 0) townDressGroup.remove(townDressGroup.children[0]);

  const centers = [-200, -120, -40, 40, 120, 200];
  const reserved = [
    [-145, -110], [-60, -60], [-110, 100], [120, 120], [155, 135],
    [40, -200], [-40, -200], [-200, 120], [200, 200],
  ];
  const campaignIndex = Math.max(0, Math.min(3, Number(selectedCampaignIndex) || 0));
  const profile = CITY_FABRIC_PROFILES[campaignIndex];
  const archetypeCounts = {};
  const zoneCounts = {};
  const blockTargetCounts = [];
  const treeSpecies = new Set();
  let targetIndex = 0;

  centers.forEach((centerZ, row) => centers.forEach((centerX, column) => {
    const district = blockDistrict(centerX, centerZ);
    const zoneKey = profile.zoneRows[row][column];
    const zone = profile.zones[zoneKey];
    const id = `${campaignIndex}-${zoneKey}-${row}-${column}`;
    const block = { id, x: centerX, z: centerZ, district, name: `${zone.name} ${row + 1}-${column + 1}`, targets: [], cleared: false };
    townBlocks.push(block);
    zoneCounts[zone.name] = (zoneCounts[zone.name] || 0) + 1;
    cityFabricAddGroundDetails(centerX, centerZ, zone, row, column);

    const lots = CITY_FABRIC_LOTS[zone.lots] || CITY_FABRIC_LOTS.quad;
    lots.forEach((offset, slot) => {
      const jitterX = (cityFabricNoise(campaignIndex * 1000 + row * 100 + column * 10 + slot, 11) - 0.5) * 4.2;
      const jitterZ = (cityFabricNoise(campaignIndex * 1000 + row * 100 + column * 10 + slot, 12) - 0.5) * 4.2;
      const x = centerX + offset[0] + jitterX;
      const z = centerZ + offset[1] + jitterZ;
      if (reserved.some((point) => Math.hypot(x - point[0], z - point[1]) < 22)) return;

      const archetype = zone.archetypes[(slot + row * 2 + column + campaignIndex) % zone.archetypes.length];
      const variant = campaignIndex * 1000 + row * 100 + column * 10 + slot;
      const meshData = cityFabricCreateMesh(archetype, variant);
      const baseRotation = ((row + column + slot) % 4) * Math.PI / 2;
      meshData.group.rotation.y += baseRotation;
      meshData.group.position.set(x, terrainHeightAt(x, z), z);
      scene.add(meshData.group);

      const stat = CITY_FABRIC_STATS[archetype] || CITY_FABRIC_STATS.tree;
      const target = {
        x,
        z,
        health: stat.health,
        maxHealth: stat.health,
        stage: 'Intact',
        damageStage: 0,
        destroyed: false,
        meshData,
        isTree: stat.tree === true,
        isCommercial: stat.commercial === true,
        color: meshData.color,
        points: stat.points,
        blockId: id,
        blockName: block.name,
        district,
        kind: archetype,
        materialFamily: stat.materialFamily,
        hasGlass: stat.hasGlass === true,
      };
      targets.push(target);
      block.targets.push(target);
      archetypeCounts[archetype] = (archetypeCounts[archetype] || 0) + 1;
      if (meshData.species !== undefined) treeSpecies.add(String(meshData.species));
      targetIndex += 1;
    });
    blockTargetCounts.push(block.targets.length);
  }));

  const activeBlocks = townBlocks.filter((block) => block.targets.length > 0);
  globalThis.__SW_CITY_FABRIC_STATE__ = Object.freeze({
    version: CITY_FABRIC_PASS_VERSION,
    campaignIndex,
    campaignId: profile.id,
    profile: profile.label,
    targetCount: targets.length,
    blockCount: townBlocks.length,
    activeBlockCount: activeBlocks.length,
    minTargetsPerActiveBlock: Math.min(...activeBlocks.map((block) => block.targets.length)),
    maxTargetsPerActiveBlock: Math.max(...activeBlocks.map((block) => block.targets.length)),
    averageTargetsPerActiveBlock: Number((targets.length / Math.max(1, activeBlocks.length)).toFixed(2)),
    zoneCounts: Object.freeze({ ...zoneCounts }),
    archetypeCounts: Object.freeze({ ...archetypeCounts }),
    treeSpecies: Object.freeze([...treeSpecies]),
    uniqueArchetypes: Object.keys(archetypeCounts).length,
  });
};

globalThis.__SW_CITY_FABRIC_BRIDGE__ = Object.freeze({
  version: CITY_FABRIC_PASS_VERSION,
  getSnapshot() {
    return globalThis.__SW_CITY_FABRIC_STATE__ || null;
  },
  rebuild() {
    init3DWorld();
    applyCampaignPresentation();
    if (globalThis.__SW_V510_REBUILD__) globalThis.__SW_V510_REBUILD__();
    return globalThis.__SW_CITY_FABRIC_STATE__ || null;
  },
  originalBuildLivingCounty: cityFabricOriginalBuildLivingCounty,
  originalCreateTreeMesh: cityFabricOriginalCreateTreeMesh,
});
// [SW:WORLD:CITY_FABRIC_PASS:END]
