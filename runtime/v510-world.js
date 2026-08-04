function createProductionDressing() {
  const config = productionQualityConfig();
  const campaignIndex = Math.max(0, Math.min(3, Number(selectedCampaignIndex) || 0));
  const palette = [
    { crop: '#71833c', tree: '#335b3c', bark: '#51341f', fence: '#b6a27e', awning: '#cc5d38' },
    { crop: '#b5a54a', tree: '#4f6b35', bark: '#5e4025', fence: '#c7ae79', awning: '#d39b32' },
    { crop: '#a85c2a', tree: '#596032', bark: '#53351f', fence: '#8f704e', awning: '#b5482f' },
    { crop: '#8b4b83', tree: '#3d5542', bark: '#4b3024', fence: '#b28b69', awning: '#d04c8b' }
  ][campaignIndex];

  const cropTransforms = [];
  for (let i = 0; i < config.cropRows; i++) {
    const x = -345 + (i % 6) * 11.5;
    const z = -205 + Math.floor(i / 6) * 28;
    cropTransforms.push({ x, y: terrainHeightAt(x, z) + 0.42, z, sx: 1, sy: 1, sz: 1 });
  }
  const crops = makeProductionInstancedMesh(
    new THREE.BoxGeometry(1.8, 0.75, 24),
    productionMaterial(palette.crop, { roughness: 0.98 }),
    cropTransforms
  );
  productionSliceRoot.add(crops);
  productionDressingStats.cropRows = cropTransforms.length;

  const fencePostTransforms = [];
  const fenceRailTransforms = [];
  const fenceLines = [
    { x1: -360, z1: -230, x2: -250, z2: -230 },
    { x1: -250, z1: -230, x2: -250, z2: -95 },
    { x1: 245, z1: -230, x2: 355, z2: -230 },
    { x1: 245, z1: 215, x2: 355, z2: 215 }
  ];
  fenceLines.forEach(line => {
    const dx = line.x2 - line.x1;
    const dz = line.z2 - line.z1;
    const length = Math.hypot(dx, dz);
    const segments = Math.max(1, Math.round(length / 11));
    const yaw = Math.atan2(dx, dz);
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = THREE.MathUtils.lerp(line.x1, line.x2, t);
      const z = THREE.MathUtils.lerp(line.z1, line.z2, t);
      fencePostTransforms.push({ x, y: terrainHeightAt(x, z) + 1.45, z });
      if (i < segments) {
        const nextT = (i + 1) / segments;
        const nx = THREE.MathUtils.lerp(line.x1, line.x2, nextT);
        const nz = THREE.MathUtils.lerp(line.z1, line.z2, nextT);
        const mx = (x + nx) / 2;
        const mz = (z + nz) / 2;
        const railLength = Math.hypot(nx - x, nz - z);
        [0.9, 1.75].forEach(height => fenceRailTransforms.push({
          x: mx,
          y: terrainHeightAt(mx, mz) + height,
          z: mz,
          ry: yaw,
          sz: railLength / 10
        }));
      }
    }
  });
  productionSliceRoot.add(makeProductionInstancedMesh(
    new THREE.CylinderGeometry(0.16, 0.2, 2.9, 6),
    productionMaterial(palette.fence, { roughness: 0.95 }),
    fencePostTransforms
  ));
  productionSliceRoot.add(makeProductionInstancedMesh(
    new THREE.BoxGeometry(0.18, 0.18, 10),
    productionMaterial(palette.fence, { roughness: 0.95 }),
    fenceRailTransforms
  ));
  productionDressingStats.fences = fencePostTransforms.length;

  const trunkTransforms = [];
  const crownTransforms = [];
  for (let i = 0; i < config.trees; i++) {
    const band = i % 3;
    const x = band === 0 ? 285 + (i % 7) * 11 : (band === 1 ? -225 + (i % 9) * 24 : 205 + (i % 8) * 19);
    const z = band === 0 ? -320 + Math.floor(i / 7) * 24 : (band === 1 ? 270 + Math.floor(i / 9) * 13 : -315 + Math.floor(i / 8) * 18);
    const height = 5.8 + (i % 5) * 0.65;
    trunkTransforms.push({ x, y: terrainHeightAt(x, z) + height * 0.5, z, sy: height / 6 });
    crownTransforms.push({ x, y: terrainHeightAt(x, z) + height + 2.4, z, sx: 1.0 + (i % 3) * 0.12, sy: 1.1 + (i % 4) * 0.08, sz: 1.0 + ((i + 1) % 3) * 0.12, ry: i * 0.77 });
  }
  productionSliceRoot.add(makeProductionInstancedMesh(
    new THREE.CylinderGeometry(0.38, 0.52, 6, 7),
    productionMaterial(palette.bark, { roughness: 0.97 }),
    trunkTransforms
  ));
  productionSliceRoot.add(makeProductionInstancedMesh(
    new THREE.DodecahedronGeometry(3.4, 1),
    productionMaterial(palette.tree, { roughness: 0.96, flatShading: true }),
    crownTransforms
  ));
  productionDressingStats.trees = trunkTransforms.length;

  const parkingTransforms = [];
  for (let i = 0; i < 24; i++) {
    const x = -145 + (i % 8) * 9.2;
    const z = -205 + Math.floor(i / 8) * 17;
    parkingTransforms.push({ x, y: terrainHeightAt(x, z) + 0.56, z, ry: 0 });
  }
  const parkingLines = makeProductionInstancedMesh(
    new THREE.BoxGeometry(0.22, 0.08, 7.2),
    new THREE.MeshBasicMaterial({ color: '#d8dee8' }),
    parkingTransforms
  );
  productionSliceRoot.add(parkingLines);

  const mailboxTransforms = [];
  for (let i = 0; i < 14; i++) {
    const x = 18 + (i % 7) * 22;
    const z = -226 + Math.floor(i / 7) * 150;
    mailboxTransforms.push({ x, y: terrainHeightAt(x, z) + 1.3, z, ry: Math.PI / 2 });
  }
  productionSliceRoot.add(makeProductionInstancedMesh(
    new THREE.BoxGeometry(0.85, 1.9, 0.72),
    productionMaterial('#7b8795', { roughness: 0.78, metalness: 0.16 }),
    mailboxTransforms
  ));

  for (let i = 0; i < 8; i++) {
    const x = -150 + i * 19;
    const z = -239;
    const y = terrainHeightAt(x, z);
    const awning = addProductionPart(
      productionSliceRoot,
      new THREE.BoxGeometry(13, 0.45, 3.2),
      i % 2 ? palette.awning : '#2d6f8c',
      x,
      y + 5.4,
      z,
      { rotation: { x: -0.18 }, roughness: 0.7 }
    );
    awning.name = 'ProductionCommercialAwning';
  }
  productionDressingStats.streetProps = parkingTransforms.length + mailboxTransforms.length + 8;
}

// ============================================================================
// [SW:WORLD:SIGNATURE_BARN]
// Authored five-state destruction: intact, damaged, exposed, partial collapse,
// and readable wreckage. It is an additive setpiece and does not gate progress.
// ============================================================================
function createProductionBarn() {
  const campaignIndex = Math.max(0, Math.min(3, Number(selectedCampaignIndex) || 0));
  const positions = [
    { x: -280, z: 120, rotation: 0.04 },
    { x: -280, z: -120, rotation: -0.08 },
    { x: -280, z: 40, rotation: 0.03 },
    { x: -200, z: 200, rotation: -0.12 }
  ];
  const placement = positions[campaignIndex];
  const group = new THREE.Group();
  group.name = 'HartFarmSignatureBarn';
  group.position.set(placement.x, terrainHeightAt(placement.x, placement.z), placement.z);
  group.rotation.y = placement.rotation;
  productionSliceRoot.add(group);

  const foundation = addProductionPart(group, new THREE.BoxGeometry(24, 0.7, 18), '#7a746c', 0, 0.35, 0, { roughness: 0.95 });
  const bodyMaterial = productionMaterial(campaignIndex === 3 ? '#7a2f56' : '#a43d32', { roughness: 0.82 });
  const frontWall = addProductionPart(group, new THREE.BoxGeometry(22, 10, 0.75), '#a43d32', 0, 5.3, -8.55, { material: bodyMaterial });
  const backWall = addProductionPart(group, new THREE.BoxGeometry(22, 10, 0.75), '#8c342d', 0, 5.3, 8.55, { roughness: 0.84 });
  const leftWall = addProductionPart(group, new THREE.BoxGeometry(0.75, 10, 16.5), '#97372f', -10.65, 5.3, 0, { roughness: 0.84 });
  const rightWall = addProductionPart(group, new THREE.BoxGeometry(0.75, 10, 16.5), '#97372f', 10.65, 5.3, 0, { roughness: 0.84 });

  const roofMaterial = productionMaterial('#27313d', { roughness: 0.68, metalness: 0.08 });
  const roofLeft = addProductionPart(group, new THREE.BoxGeometry(13.3, 0.62, 19), '#27313d', -5.1, 13.2, 0, { material: roofMaterial, rotation: { z: 0.55 } });
  const roofRight = addProductionPart(group, new THREE.BoxGeometry(13.3, 0.62, 19), '#27313d', 5.1, 13.2, 0, { material: roofMaterial.clone(), rotation: { z: -0.55 } });
  const ridge = addProductionPart(group, new THREE.BoxGeometry(0.75, 0.8, 19.4), '#18202b', 0, 16.55, 0, { roughness: 0.7 });

  const bigDoorLeft = addProductionPart(group, new THREE.BoxGeometry(6.8, 7.2, 0.45), '#f2e7d5', -3.6, 3.9, -9.02, { roughness: 0.8 });
  const bigDoorRight = addProductionPart(group, new THREE.BoxGeometry(6.8, 7.2, 0.45), '#f2e7d5', 3.6, 3.9, -9.02, { roughness: 0.8 });
  const loftDoor = addProductionPart(group, new THREE.BoxGeometry(4.6, 3.5, 0.42), '#f2e7d5', 0, 10.35, -9.0, { roughness: 0.8 });
  const sign = addProductionPart(
    group,
    new THREE.BoxGeometry(8.5, 1.9, 0.35),
    '#f6c453',
    0,
    14.1,
    -9.15,
    { material: createSignMaterial('HART FARM|SINCE 1947', '#7c2d12', '#fff7ed') }
  );

  const trimMaterial = productionMaterial('#f3eee3', { roughness: 0.74 });
  [-10.2, 0, 10.2].forEach(x => addProductionPart(group, new THREE.BoxGeometry(0.36, 10.6, 0.32), '#f3eee3', x, 5.45, -9.0, { material: trimMaterial }));
  addProductionPart(group, new THREE.BoxGeometry(21.1, 0.36, 0.32), '#f3eee3', 0, 9.9, -9.0, { material: trimMaterial.clone() });

  const beacon = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.16, 6, 40),
    new THREE.MeshBasicMaterial({ color: '#f6c453', transparent: true, opacity: 0.62, depthWrite: false })
  );
  beacon.rotation.x = Math.PI / 2;
  beacon.position.y = 19.2;
  group.add(beacon);

  productionBarn = {
    group,
    x: placement.x,
    z: placement.z,
    health: 760,
    maxHealth: 760,
    stage: 0,
    destroyed: false,
    foundation,
    frontWall,
    backWall,
    leftWall,
    rightWall,
    roofLeft,
    roofRight,
    ridge,
    bigDoorLeft,
    bigDoorRight,
    loftDoor,
    sign,
    beacon,
    awardedStages: new Set()
  };
}

function spawnProductionDustBurst(x, y, z, color = '#b99a72', count = 7) {
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 + (i % 3) * 0.22, 0),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.48, depthWrite: false })
    );
    mesh.position.set(x, y, z);
    scene.add(mesh);
    productionPulseEffects.push({
      mesh,
      vx: (Math.random() - 0.5) * 8,
      vy: 2.5 + Math.random() * 5,
      vz: (Math.random() - 0.5) * 8,
      life: 0.65 + Math.random() * 0.45,
      maxLife: 1.1,
      ring: false
    });
  }
}

function detachProductionBarnPart(mesh, force = 1) {
  if (!mesh || !mesh.parent) return;
  mesh.updateMatrixWorld(true);
  const worldPosition = new THREE.Vector3();
  const worldQuaternion = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  mesh.matrixWorld.decompose(worldPosition, worldQuaternion, worldScale);
  mesh.parent.remove(mesh);
  scene.add(mesh);
  mesh.position.copy(worldPosition);
  mesh.quaternion.copy(worldQuaternion);
  mesh.scale.copy(worldScale);
  productionFragments.push({
    mesh,
    vx: (Math.random() - 0.5) * 8 * force,
    vy: (7 + Math.random() * 6) * force,
    vz: (Math.random() - 0.5) * 8 * force,
    rotX: (Math.random() - 0.5) * 4,
    rotY: (Math.random() - 0.5) * 4,
    rotZ: (Math.random() - 0.5) * 4,
    life: 5.8,
    bounced: false
  });
}

function awardProductionBarnStage(stage, points, label) {
  if (!productionBarn || productionBarn.awardedStages.has(stage)) return;
  productionBarn.awardedStages.add(stage);
  const awarded = addScore(points);
  if (awarded > 0) spawnScorePopup(productionBarn.x, terrainHeightAt(productionBarn.x, productionBarn.z) + 17, productionBarn.z, '+' + awarded + ' ' + label, '#f6c453');
}

function setProductionBarnStage(stage) {
  if (!productionBarn || stage <= productionBarn.stage) return;
  productionBarn.stage = stage;
  const groundY = terrainHeightAt(productionBarn.x, productionBarn.z);
  if (stage === 1) {
    productionBarn.sign.rotation.z = -0.16;
    productionBarn.frontWall.material.color.offsetHSL(0, -0.04, -0.11);
    productionBarn.bigDoorLeft.rotation.y = -0.16;
    productionBarn.bigDoorRight.rotation.y = 0.12;
    spawnProductionDustBurst(productionBarn.x, groundY + 9, productionBarn.z - 8, '#c5a27a', 8);
    awardProductionBarnStage(1, 140, 'DAMAGED');
    showGagToast('HART FARM HAS ENTERED THE CLAIMS PROCESS.');
  } else if (stage === 2) {
    detachProductionBarnPart(productionBarn.roofLeft, 1.05);
    productionBarn.leftWall.rotation.z = -0.08;
    productionBarn.loftDoor.rotation.x = 0.38;
    spawnProductionDustBurst(productionBarn.x - 5, groundY + 13, productionBarn.z, '#a88562', 12);
    awardProductionBarnStage(2, 210, 'ROOF PEEL');
    showGagToast('HART FARM ROOF FILES A FLIGHT PLAN.');
    publishMediaHeadline('LIVE FARM CAM: ROOF DEPARTURE CONFIRMED. NO BOARDING PASS FOUND.', 3.8);
  } else if (stage === 3) {
    detachProductionBarnPart(productionBarn.loftDoor, 0.8);
    productionBarn.frontWall.rotation.z = 0.14;
    productionBarn.rightWall.rotation.z = 0.1;
    productionBarn.ridge.rotation.x = 0.2;
    spawnProductionDustBurst(productionBarn.x, groundY + 7, productionBarn.z - 8, '#8b6d4f', 14);
    awardProductionBarnStage(3, 280, 'EXPOSED');
  } else if (stage === 4) {
    productionBarn.destroyed = true;
    productionBarn.beacon.visible = false;
    detachProductionBarnPart(productionBarn.roofRight, 1.18);
    detachProductionBarnPart(productionBarn.frontWall, 0.72);
    detachProductionBarnPart(productionBarn.rightWall, 0.65);
    productionBarn.backWall.rotation.x = 1.24;
    productionBarn.leftWall.rotation.z = -1.18;
    productionBarn.bigDoorLeft.rotation.x = 1.1;
    productionBarn.bigDoorRight.rotation.x = 1.34;
    spawnProductionDustBurst(productionBarn.x, groundY + 5, productionBarn.z, '#806044', 20);
    awardProductionBarnStage(4, 720, 'BARN DOWN');
    addCameraShake(1.7);
    playSound('collapse');
    publishMediaHeadline('HART FARM IS NOW AN OPEN-CONCEPT PROPERTY.', 4.2);
    showGagToast('AUTHORED DESTRUCTION: BARN DOWN!');
  }
}

function damageProductionBarn(amount, source = 'contact') {
  if (!productionBarn || productionBarn.destroyed || !runActive) return false;
  productionBarn.health = Math.max(0, productionBarn.health - Math.max(0, amount));
  const ratio = productionBarn.health / productionBarn.maxHealth;
  if (ratio <= 0) setProductionBarnStage(4);
  else if (ratio <= 0.25) setProductionBarnStage(3);
  else if (ratio <= 0.52) setProductionBarnStage(2);
  else if (ratio <= 0.78) setProductionBarnStage(1);
  if (source === 'gust') productionBarn.group.rotation.z = Math.sin(performance.now() * 0.02) * 0.025;
  return true;
}

function spawnProductionGustRing() {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(4, 5.4, 48),
    new THREE.MeshBasicMaterial({ color: '#dbeafe', transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 0.85, storm.pos.z);
  scene.add(ring);
  productionPulseEffects.push({ mesh: ring, life: 0.58, maxLife: 0.58, ring: true });
}

function decorateProductionCow17() {
  const cow = animals.find(animal => animal.id === 17);
  if (!cow || !cow.mesh || cow.mesh.userData.v510Decorated) return;
  cow.mesh.userData.v510Decorated = true;
  cow.mesh.scale.setScalar(1.32);

  const white = productionMaterial('#f8fafc', { roughness: 0.78 });
  const dark = productionMaterial('#171717', { roughness: 0.82 });
  const horn = productionMaterial('#e7d8b5', { roughness: 0.68 });
  const pink = productionMaterial('#efa7b6', { roughness: 0.72 });

  [-0.58, 0.58].forEach((x, index) => {
    const ear = addProductionPart(cow.mesh, new THREE.BoxGeometry(0.58, 0.18, 0.42), '#171717', x, 0.55, 1.3, { material: dark, rotation: { z: index === 0 ? -0.28 : 0.28 } });
    ear.name = 'Cow17Ear';
    const hornMesh = addProductionPart(cow.mesh, new THREE.ConeGeometry(0.16, 0.72, 8), '#e7d8b5', x * 0.72, 0.78, 1.22, { material: horn, rotation: { x: Math.PI / 2, z: index === 0 ? -0.18 : 0.18 } });
    hornMesh.name = 'Cow17Horn';
  });
  [-0.25, 0.25].forEach(x => addProductionPart(cow.mesh, new THREE.SphereGeometry(0.08, 8, 8), '#171717', x, 0.43, 1.72, { material: dark, castShadow: false }));
  addProductionPart(cow.mesh, new THREE.BoxGeometry(0.62, 0.32, 0.22), '#efa7b6', 0, 0.04, 1.82, { material: pink });
  [[-0.5, 0.24, 0.22], [0.42, -0.08, -0.12], [0.18, 0.38, -0.5]].forEach(position => {
    addProductionPart(cow.mesh, new THREE.BoxGeometry(0.48, 0.08, 0.58), '#171717', position[0], position[1], position[2], { material: dark, castShadow: false });
  });
}

function rebuildProductionSlice() {
  clearProductionSlice();
  productionSliceRoot = new THREE.Group();
  productionSliceRoot.name = 'V510ProductionWorldDressing';
  scene.add(productionSliceRoot);
  createProductionDressing();
  createProductionBarn();
  createProductionTornadoLayers();
  decorateProductionCow17();
  productionCurrentCampaignId = typeof getActiveCampaignLevel === 'function' ? getActiveCampaignLevel().id : 'lincoln-county';
  camera.fov = 42;
  camera.updateProjectionMatrix();
  if (typeof THREE.sRGBEncoding !== 'undefined') renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 0.94;
  updateProductionQualityUi();
  globalThis.__SW_PRODUCTION_SLICE_READY__ = true;
}
