// ============================================================================
// [SW:PRESENTATION:MOO_BREW_IDENTITY]
// Presentation-only identity layer for the accepted city-fabric build.
// It fixes results containment, installs the canonical opening vignette,
// strengthens cow readability, and adds non-gameplay Moo Brew world dressing.
// ============================================================================
const PRESENTATION_IDENTITY_MOO_BREW_VERSION = 'PRESENTATION_IDENTITY_MOO_BREW_V1';
const PRESENTATION_IDENTITY_INTRO_PHASES = Object.freeze([
  'newspaper',
  'farm-reveal',
  'moo-brew-sip',
  'weather-warning',
  'cow-double-take',
  'chicken-scatter',
  'tornado-touchdown',
  'tactical-handoff',
]);

const identityState = {
  introActive: false,
  introPhase: 'idle',
  introStartAfter: false,
  introTimers: [],
  startBypass: false,
  startInterceptInstalled: false,
  resultsConfigured: false,
  resultPreviewActive: false,
  mooBrewWorldBuilds: 0,
  cowDecorations: 0,
  enhancedCowIds: new Set(),
};

const identityCowMaterialCache = new Map();
const identityCowGeometry = Object.freeze({
  box: new THREE.BoxGeometry(1, 1, 1),
  sphere: new THREE.SphereGeometry(0.5, 12, 8),
  cylinder: new THREE.CylinderGeometry(0.5, 0.5, 1, 10),
  cone: new THREE.ConeGeometry(0.5, 1, 10),
  plane: new THREE.PlaneGeometry(1, 1),
});
const identityWorldProps = [];

function identityMaterial(color, roughness = 0.72, metalness = 0.02) {
  const key = `${color}:${roughness}:${metalness}`;
  if (!identityCowMaterialCache.has(key)) {
    identityCowMaterialCache.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
    }));
  }
  return identityCowMaterialCache.get(key);
}

function identityTextMaterial(title, subtitle, background = '#0f172a', foreground = '#fef3c7') {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 384;
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#fbbf24';
  context.fillRect(0, 0, canvas.width, 42);
  context.fillStyle = foreground;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '900 82px Outfit, Arial, sans-serif';
  context.fillText(title, canvas.width / 2, 168);
  context.fillStyle = '#fdba74';
  context.font = '800 30px Inter, Arial, sans-serif';
  context.fillText(subtitle, canvas.width / 2, 258);
  context.fillStyle = 'rgba(255,255,255,0.72)';
  context.font = '700 21px Inter, Arial, sans-serif';
  context.fillText('MOO BREW WEATHER PARTNER', canvas.width / 2, 316);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return new THREE.MeshBasicMaterial({ map: texture, transparent: false, side: THREE.DoubleSide });
}

function identityAddPart(parent, geometry, material, position, scale, rotation = null, name = '') {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  if (rotation) mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function identityHideLegacyCowArt(cowMesh) {
  const legacyChildren = [...cowMesh.children];
  legacyChildren.forEach((child) => { child.visible = false; });
  if (cowMesh.material) {
    const materials = Array.isArray(cowMesh.material) ? cowMesh.material : [cowMesh.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0;
      material.depthWrite = false;
    });
    cowMesh.castShadow = false;
  }
}

function identityCreateCowRig(cowMesh, id) {
  if (cowMesh.userData.mooBrewCowRig) return cowMesh.userData.mooBrewCowRig;
  identityHideLegacyCowArt(cowMesh);

  const root = new THREE.Group();
  root.name = `MooBrewCow-${id}`;
  root.userData.mooBrewCowGraphic = true;
  cowMesh.add(root);

  const white = identityMaterial('#f8fafc', 0.82);
  const cream = identityMaterial('#ede9d5', 0.84);
  const black = identityMaterial('#171717', 0.78);
  const pink = identityMaterial('#f6a9b8', 0.8);
  const horn = identityMaterial('#f5deb3', 0.86);
  const hoof = identityMaterial('#292524', 0.88);
  const yellow = identityMaterial('#facc15', 0.7);

  const body = identityAddPart(root, identityCowGeometry.box, white, [0, 0, 0], [2.35, 1.28, 3.45], null, 'cow-body');
  identityAddPart(root, identityCowGeometry.box, cream, [0, 0.1, 1.3], [2.0, 1.36, 1.2], null, 'cow-shoulders');
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.35, 2.38);
  root.add(headPivot);
  const head = identityAddPart(headPivot, identityCowGeometry.box, white, [0, 0, 0], [1.28, 1.12, 1.32], null, 'cow-head');
  identityAddPart(headPivot, identityCowGeometry.box, pink, [0, -0.18, 0.96], [0.98, 0.52, 0.62], null, 'cow-muzzle');
  identityAddPart(headPivot, identityCowGeometry.sphere, black, [-0.34, 0.18, 0.72], [0.12, 0.12, 0.08], null, 'cow-eye-left');
  identityAddPart(headPivot, identityCowGeometry.sphere, black, [0.34, 0.18, 0.72], [0.12, 0.12, 0.08], null, 'cow-eye-right');
  identityAddPart(headPivot, identityCowGeometry.sphere, black, [-0.24, -0.2, 1.28], [0.08, 0.06, 0.05], null, 'cow-nostril-left');
  identityAddPart(headPivot, identityCowGeometry.sphere, black, [0.24, -0.2, 1.28], [0.08, 0.06, 0.05], null, 'cow-nostril-right');

  const leftEar = identityAddPart(headPivot, identityCowGeometry.box, black, [-0.76, 0.34, 0.08], [0.56, 0.16, 0.36], [0, 0, -0.24], 'cow-ear-left');
  const rightEar = identityAddPart(headPivot, identityCowGeometry.box, black, [0.76, 0.34, 0.08], [0.56, 0.16, 0.36], [0, 0, 0.24], 'cow-ear-right');
  identityAddPart(headPivot, identityCowGeometry.cone, horn, [-0.42, 0.8, 0.02], [0.16, 0.46, 0.16], [0, 0, -0.18], 'cow-horn-left');
  identityAddPart(headPivot, identityCowGeometry.cone, horn, [0.42, 0.8, 0.02], [0.16, 0.46, 0.16], [0, 0, 0.18], 'cow-horn-right');

  const legs = [];
  [[-0.82, -1.18], [0.82, -1.18], [-0.82, 1.12], [0.82, 1.12]].forEach(([x, z], index) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(x, -0.65, z);
    root.add(legPivot);
    identityAddPart(legPivot, identityCowGeometry.box, cream, [0, -0.75, 0], [0.38, 1.5, 0.38], null, `cow-leg-${index}`);
    identityAddPart(legPivot, identityCowGeometry.box, hoof, [0, -1.55, 0.08], [0.48, 0.3, 0.62], null, `cow-hoof-${index}`);
    legs.push(legPivot);
  });

  identityAddPart(root, identityCowGeometry.sphere, pink, [0, -0.92, 0.2], [0.72, 0.42, 0.58], null, 'cow-udder');
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.25, -1.78);
  root.add(tailPivot);
  identityAddPart(tailPivot, identityCowGeometry.cylinder, cream, [0, -0.58, -0.16], [0.12, 1.18, 0.12], [0.34, 0, 0], 'cow-tail');
  identityAddPart(tailPivot, identityCowGeometry.sphere, black, [0, -1.2, -0.36], [0.28, 0.35, 0.28], null, 'cow-tail-tuft');

  const spots = [
    [-1.19, 0.18, -0.76, 0.13, 0.72, 0.78],
    [1.19, -0.14, 0.52, 0.13, 0.56, 0.96],
    [-0.7, 0.66, 0.15, 0.82, 0.12, 0.58],
    [0.58, 0.66, -0.98, 0.62, 0.12, 0.72],
  ];
  spots.forEach(([x, y, z, sx, sy, sz], index) => {
    identityAddPart(root, identityCowGeometry.box, black, [x, y, z], [sx, sy, sz], null, `cow-spot-${index}`);
  });

  let tag = null;
  if (id === 17) {
    const tagMaterial = identityTextMaterial('17', 'OFFICIAL AIRSPACE COW', '#ca8a04', '#111827');
    tag = identityAddPart(root, identityCowGeometry.plane, tagMaterial, [1.22, 0.32, 1.18], [0.62, 0.42, 1], [0, Math.PI / 2, 0], 'cow-17-tag');
    identityAddPart(root, identityCowGeometry.box, yellow, [0, 0.83, -0.85], [0.48, 0.16, 0.82], null, 'cow-17-warning-patch');
    cowMesh.userData.cow17 = true;
  }

  const rig = { root, body, headPivot, head, leftEar, rightEar, legs, tailPivot, tag, id };
  cowMesh.userData.mooBrewCowRig = rig;
  cowMesh.userData.mooBrewEnhanced = true;
  identityState.cowDecorations += 1;
  identityState.enhancedCowIds.add(id);
  return rig;
}

const identityOriginalDecorateBovineMesh = decorateBovineMesh;
decorateBovineMesh = function presentationIdentityDecorateBovineMesh(cowMesh, id) {
  identityOriginalDecorateBovineMesh(cowMesh, id);
  return identityCreateCowRig(cowMesh, id);
};

function identityAnimateCowRigs(dt) {
  const time = performance.now() * 0.001;
  animals.forEach((cow, index) => {
    const rig = cow?.mesh?.userData?.mooBrewCowRig;
    if (!rig) return;
    const phase = time * 2.2 + index * 0.73;
    const airborne = Boolean(cow.airborne);
    rig.headPivot.position.y = 0.35 + Math.sin(phase) * (airborne ? 0.11 : 0.045);
    rig.headPivot.rotation.x = airborne ? -0.28 + Math.sin(phase * 1.4) * 0.16 : Math.sin(phase * 0.5) * 0.035;
    rig.leftEar.rotation.z = -0.24 + Math.sin(phase * 1.7) * 0.16;
    rig.rightEar.rotation.z = 0.24 - Math.sin(phase * 1.7) * 0.16;
    rig.tailPivot.rotation.z = Math.sin(phase * 1.9) * (airborne ? 0.82 : 0.28);
    rig.legs.forEach((leg, legIndex) => {
      leg.rotation.x = airborne
        ? Math.sin(phase * 2.3 + legIndex * 1.4) * 0.7
        : Math.sin(phase + legIndex * Math.PI) * 0.035;
      leg.rotation.z = airborne ? Math.cos(phase * 1.8 + legIndex) * 0.24 : 0;
    });
    if (rig.tag) rig.tag.rotation.z = Math.sin(phase * 1.2) * 0.06;
  });
}

const identityOriginalUpdateBovineSignature = updateBovineSignature;
updateBovineSignature = function presentationIdentityUpdateBovineSignature(dt) {
  const result = identityOriginalUpdateBovineSignature(dt);
  identityAnimateCowRigs(dt);
  return result;
};

function identityDisposeWorldProp(root) {
  if (!root) return;
  root.traverse((child) => {
    if (child.geometry && child.userData.identityOwnGeometry) child.geometry.dispose();
    if (child.material && child.userData.identityOwnMaterial) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    }
  });
  if (root.parent) root.parent.remove(root);
}

function identityClearWorldProps() {
  while (identityWorldProps.length) identityDisposeWorldProp(identityWorldProps.pop());
}

function identityTerrainY(x, z) {
  return typeof getTerrainY === 'function' ? Number(getTerrainY(x, z)) || 0 : 0;
}

function identityCreateBillboard(x, z, rotationY, title, subtitle) {
  const group = new THREE.Group();
  group.position.set(x, identityTerrainY(x, z), z);
  group.rotation.y = rotationY;
  const postMaterial = identityMaterial('#5b4636', 0.92);
  const frameMaterial = identityMaterial('#f59e0b', 0.72);
  [-2.6, 2.6].forEach((postX) => {
    identityAddPart(group, identityCowGeometry.box, postMaterial, [postX, 3.25, 0], [0.32, 6.5, 0.32], null, 'moo-brew-billboard-post');
  });
  identityAddPart(group, identityCowGeometry.box, frameMaterial, [0, 6.1, -0.16], [7.8, 4.1, 0.34], null, 'moo-brew-billboard-frame');
  const faceMaterial = identityTextMaterial(title, subtitle, '#431407', '#fff7ed');
  const face = identityAddPart(group, identityCowGeometry.plane, faceMaterial, [0, 6.12, 0.04], [7.4, 3.7, 1], null, 'moo-brew-billboard-face');
  face.userData.identityOwnMaterial = true;
  group.userData.mooBrewDecor = true;
  scene.add(group);
  identityWorldProps.push(group);
  return group;
}

function identityCreateDeliveryTruck(x, z, rotationY, slogan) {
  const group = new THREE.Group();
  group.position.set(x, identityTerrainY(x, z) + 0.8, z);
  group.rotation.y = rotationY;
  const orange = identityMaterial('#f59e0b', 0.7);
  const cream = identityMaterial('#fff7ed', 0.8);
  const dark = identityMaterial('#1f2937', 0.76);
  identityAddPart(group, identityCowGeometry.box, cream, [0, 1.25, -0.25], [5.4, 2.5, 2.7], null, 'moo-brew-truck-box');
  identityAddPart(group, identityCowGeometry.box, orange, [0, 1.1, 2.0], [3.6, 2.2, 1.7], null, 'moo-brew-truck-cab');
  identityAddPart(group, identityCowGeometry.box, dark, [0, 1.55, 2.88], [2.8, 0.82, 0.08], null, 'moo-brew-truck-windshield');
  [[-2.15, -0.72], [2.15, -0.72], [-2.15, 1.75], [2.15, 1.75]].forEach(([wheelX, wheelZ]) => {
    identityAddPart(group, identityCowGeometry.cylinder, dark, [wheelX, -0.08, wheelZ], [0.65, 0.4, 0.65], [0, 0, Math.PI / 2], 'moo-brew-truck-wheel');
  });
  const panelMaterial = identityTextMaterial('MOO BREW', slogan, '#7c2d12', '#fff7ed');
  const panel = identityAddPart(group, identityCowGeometry.plane, panelMaterial, [2.72, 1.25, -0.28], [4.2, 2.0, 1], [0, Math.PI / 2, 0], 'moo-brew-truck-panel');
  panel.userData.identityOwnMaterial = true;
  group.userData.mooBrewDecor = true;
  scene.add(group);
  identityWorldProps.push(group);
  return group;
}

function identityAddMooBrewWorldDressing() {
  const profiles = [
    {
      billboard: [-86, -118, 0.18, 'MOO BREW', 'FARM FRESH. STORM TESTED.'],
      truck: [72, -74, -0.42, 'DELIVERY WINDOW MAY VARY'],
    },
    {
      billboard: [88, -102, -0.22, 'MOO BREW', 'CROSSWIND COLD SINCE 1987'],
      truck: [-76, 68, 0.62, 'PRAIRIE ROUTE: MOSTLY SECURE'],
    },
    {
      billboard: [-96, 82, 0.34, 'MOO BREW', 'FORTIFIED WITH QUESTIONABLE COURAGE'],
      truck: [84, 74, -0.78, 'INDUSTRIAL STRENGTH REFRESHMENT'],
    },
    {
      billboard: [92, 102, -0.28, 'MOO BREW', 'OFFICIAL DRINK OF THE COW-CAM'],
      truck: [-84, -86, 0.54, 'FAIRGROUNDS SERVICE: NO REFUNDS'],
    },
  ];
  const profile = profiles[Math.max(0, Math.min(profiles.length - 1, Number(selectedCampaignIndex) || 0))];
  identityCreateBillboard(...profile.billboard);
  identityCreateDeliveryTruck(...profile.truck);
  identityState.mooBrewWorldBuilds += 1;
}

const identityOriginalBuildLivingCounty = buildLivingCounty;
buildLivingCounty = function presentationIdentityBuildLivingCounty() {
  identityClearWorldProps();
  const result = identityOriginalBuildLivingCounty();
  identityAddMooBrewWorldDressing();
  return result;
};
