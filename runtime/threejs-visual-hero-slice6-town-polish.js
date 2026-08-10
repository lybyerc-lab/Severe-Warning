// ============================================================================
// [SW:VISUAL:HERO_SLICE6:TOWN_POLISH]
// THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1
//
// Presentation-only correction after Slice 6 Run #9 visual review.
// The road-first parcel law is already authoritative for presentation placement.
// This pass removes the bright prototype water-tower read and breaks tall Main
// Street box silhouettes with lower massing and pitched rooflines. It does not
// move target coordinates or write health, damage, collision, scoring, storm,
// ability, campaign, animal, or Neon-selection authority.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION = 'THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1';

const swVisualHeroSlice6TownPolishState = {
  waterTowerStyled: false,
  waterTowerBaseColor: null,
  mainStreetRooflineCount: 0,
  compressedTallBuildingCount: 0,
  falseFrontCount: 0,
  awningCount: 0,
  profile: 'small-town-massing-v2',
  lastError: null,
};

function swVisualHeroSlice6TownPolishMaterials(material) {
  if (!material) return [];
  return Array.isArray(material) ? material : [material];
}

function swVisualHeroSlice6TownPolishSetMaterial(material, options = {}) {
  swVisualHeroSlice6TownPolishMaterials(material).forEach((entry) => {
    if (!entry) return;
    if (options.map !== undefined) entry.map = options.map;
    if (options.color && entry.color?.set) entry.color.set(options.color);
    if (options.emissive && entry.emissive?.set) entry.emissive.set(options.emissive);
    if (Number.isFinite(options.emissiveIntensity)) entry.emissiveIntensity = options.emissiveIntensity;
    if (Number.isFinite(options.roughness)) entry.roughness = options.roughness;
    if (Number.isFinite(options.metalness)) entry.metalness = options.metalness;
    entry.needsUpdate = true;
  });
}

function swVisualHeroSlice6TownPolishGableGeometry(width, depth, height) {
  const halfWidth = width * 0.5;
  const halfDepth = depth * 0.5;
  const positions = new Float32Array([
    -halfWidth, 0, -halfDepth,
     halfWidth, 0, -halfDepth,
     0, height, -halfDepth,
    -halfWidth, 0,  halfDepth,
     halfWidth, 0,  halfDepth,
     0, height,  halfDepth,
  ]);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setIndex([
    0, 1, 2,
    5, 4, 3,
    0, 2, 5, 0, 5, 3,
    2, 1, 4, 2, 4, 5,
  ]);
  geometry.computeVertexNormals();
  geometry.userData.swSlice6TownPolishGable = true;
  return geometry;
}

function swVisualHeroSlice6TownPolishStyleMainStreet(storefront) {
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
  if (!storefront || !targetList.length) return 0;
  const centerX = Number(storefront.x);
  const centerZ = Number(storefront.z);
  const shellPalette = ['#a49b89', '#9ca58f', '#aa9079', '#8d9997', '#b0a58f'];
  const roofPalette = ['#484c4b', '#524841', '#465158', '#5a5047'];
  let rooflines = 0;
  let compressed = 0;

  targetList
    .map((target) => ({
      target,
      distance: Math.hypot(Number(target?.x) - centerX, Number(target?.z) - centerZ),
    }))
    .filter((entry) => entry.distance <= 156)
    .sort((a, b) => a.distance - b.distance)
    .forEach((entry, ordinal) => {
      const target = entry.target;
      const group = target?.meshData?.group;
      const base = target?.meshData?.base;
      if (!group || !base || Boolean(target.destroyed) || Boolean(target.isTree)) return;
      const groupName = String(group.name || '');
      if (groupName === 'structure.storefront.v1' || groupName === 'HartFarmSignatureBarn') return;
      const parameters = base.geometry?.parameters || {};
      const width = Number(parameters.width || 0);
      const height = Number(parameters.height || 0);
      const depth = Number(parameters.depth || 0);
      if (!base.geometry?.type?.includes('Box') || width < 7 || depth < 7 || height < 13) return;

      if (!group.userData.swSlice6TownPolishBaseScaleY) {
        group.userData.swSlice6TownPolishBaseScaleY = Number(group.scale.y) || 1;
      }
      const heightScale = height >= 24 ? 0.52 : (height >= 18 ? 0.64 : 0.76);
      group.scale.y = group.userData.swSlice6TownPolishBaseScaleY * heightScale;
      group.userData.swSlice6TownHeightScale = heightScale;
      group.userData.swSlice6TownPolished = true;
      compressed += 1;

      const facadeTexture = typeof swVisualHeroSlice3Texture === 'function'
        ? swVisualHeroSlice3Texture(ordinal % 2 === 0 ? 'brick' : 'wood')
        : null;
      swVisualHeroSlice6TownPolishSetMaterial(base.material, {
        map: facadeTexture,
        color: shellPalette[ordinal % shellPalette.length],
        emissive: '#000000',
        emissiveIntensity: 0,
        roughness: 0.90,
        metalness: 0.02,
      });

      const desiredWorldRoofHeight = height >= 22 ? 3.7 : 3.1;
      const localRoofHeight = desiredWorldRoofHeight / Math.max(0.45, heightScale);
      let roof = group.getObjectByName?.('SWVisualSlice6MainStreetGable') || null;
      if (!roof) {
        const geometry = swVisualHeroSlice6TownPolishGableGeometry(width * 0.90, depth * 0.90, localRoofHeight);
        const material = new THREE.MeshStandardMaterial({
          color: roofPalette[ordinal % roofPalette.length],
          roughness: 0.88,
          metalness: 0.04,
        });
        roof = new THREE.Mesh(geometry, material);
        roof.name = 'SWVisualSlice6MainStreetGable';
        roof.position.y = height + 0.18;
        roof.rotation.y = ordinal % 3 === 1 ? Math.PI * 0.5 : 0;
        roof.castShadow = true;
        roof.receiveShadow = true;
        roof.userData.swPresentationOnly = true;
        group.add(roof);
      }
      let falseFront = group.getObjectByName?.('SWVisualSlice6MainStreetFalseFront') || null;
      if (!falseFront) {
        falseFront = new THREE.Mesh(
          swVisualHeroSlice6TownPolishGableGeometry(width * 0.54, 0.18, localRoofHeight * 1.12),
          new THREE.MeshStandardMaterial({ color: shellPalette[(ordinal + 2) % shellPalette.length], roughness: 0.90, metalness: 0.01 }),
        );
        falseFront.name = 'SWVisualSlice6MainStreetFalseFront';
        falseFront.position.set(0, height + 0.1, -(depth * 0.5 - 0.11));
        falseFront.castShadow = true;
        falseFront.receiveShadow = true;
        falseFront.userData.swPresentationOnly = true;
        group.add(falseFront);
      }
      let awning = group.getObjectByName?.('SWVisualSlice6MainStreetAwning') || null;
      if (!awning) {
        awning = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.min(width * 0.62, 5.4), Math.max(1.1, height * 0.075)),
          new THREE.MeshStandardMaterial({ color: roofPalette[(ordinal + 1) % roofPalette.length], roughness: 0.82, metalness: 0.05, side: THREE.DoubleSide }),
        );
        awning.name = 'SWVisualSlice6MainStreetAwning';
        awning.position.set(0, Math.min(height * 0.24, 3.4), -(depth * 0.5 - 0.09));
        awning.rotation.x = -0.18;
        awning.castShadow = false;
        awning.receiveShadow = true;
        awning.userData.swPresentationOnly = true;
        group.add(awning);
      }
      rooflines += 1;
      group.updateMatrixWorld?.(true);
    });

  swVisualHeroSlice6TownPolishState.mainStreetRooflineCount = rooflines;
  swVisualHeroSlice6TownPolishState.compressedTallBuildingCount = compressed;
  swVisualHeroSlice6TownPolishState.falseFrontCount = rooflines;
  swVisualHeroSlice6TownPolishState.awningCount = rooflines;
  return rooflines;
}

function swVisualHeroSlice6TownPolishStyleWaterTower() {
  const landmarkList = typeof landmarks !== 'undefined' && Array.isArray(landmarks) ? landmarks : [];
  const waterTower = landmarkList.find((landmark) => landmark?.icon === '💧' || String(landmark?.name || '') === 'WATER TOWER') || null;
  const group = waterTower?.meshData?.group;
  const base = waterTower?.meshData?.base;
  if (!group || !base || Boolean(waterTower?.destroyed)) {
    swVisualHeroSlice6TownPolishState.waterTowerStyled = false;
    swVisualHeroSlice6TownPolishState.waterTowerBaseColor = null;
    return false;
  }

  const metalMap = typeof swVisualHeroSlice3Texture === 'function' ? swVisualHeroSlice3Texture('metal') : null;
  swVisualHeroSlice6TownPolishSetMaterial(base.material, {
    map: metalMap,
    color: '#949b92',
    emissive: '#000000',
    emissiveIntensity: 0,
    roughness: 0.78,
    metalness: 0.22,
  });

  let dressing = group.getObjectByName?.('SWVisualSlice6WaterTowerStandpipe') || null;
  if (!dressing) {
    dressing = new THREE.Group();
    dressing.name = 'SWVisualSlice6WaterTowerStandpipe';
    dressing.userData.swPresentationOnly = true;

    const steelMaterial = new THREE.MeshStandardMaterial({ color: '#9aa19a', roughness: 0.74, metalness: 0.25, map: metalMap });
    const darkSteelMaterial = new THREE.MeshStandardMaterial({ color: '#59615f', roughness: 0.76, metalness: 0.24 });

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.18, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5),
      steelMaterial,
    );
    dome.position.y = 17.0;
    dome.castShadow = true;
    dome.receiveShadow = true;
    dressing.add(dome);

    [4.4, 8.7, 13.0, 16.6].forEach((y) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(4.23, 0.09, 6, 24), darkSteelMaterial);
      band.rotation.x = Math.PI * 0.5;
      band.position.y = y;
      band.castShadow = false;
      dressing.add(band);
    });

    const ladderMaterial = new THREE.MeshStandardMaterial({ color: '#434b49', roughness: 0.82, metalness: 0.22 });
    [-0.27, 0.27].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 12.5, 6), ladderMaterial);
      rail.position.set(4.29, 8.1, z);
      rail.castShadow = false;
      dressing.add(rail);
    });
    const rungCount = 8;
    const rungs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.06, 0.06, 0.62), ladderMaterial, rungCount);
    rungs.name = 'SWVisualSlice6WaterTowerLadderRungs';
    const matrix = new THREE.Matrix4();
    for (let index = 0; index < rungCount; index += 1) {
      matrix.makeTranslation(4.31, 3.0 + index * 1.55, 0);
      rungs.setMatrixAt(index, matrix);
    }
    rungs.instanceMatrix.needsUpdate = true;
    dressing.add(rungs);
    group.add(dressing);
  }

  if (waterTower.meshData?.beacon) {
    waterTower.meshData.beacon.scale.setScalar(0.68);
    waterTower.meshData.beacon.material?.color?.set?.('#c69b54');
  }

  if (waterTower.meshData) waterTower.meshData.color = '#949b92';
  swVisualHeroSlice6TownPolishState.waterTowerStyled = true;
  swVisualHeroSlice6TownPolishState.waterTowerBaseColor = base.material?.color?.getHexString ? `#${base.material.color.getHexString()}` : null;
  return true;
}

function swVisualHeroSlice6TownPolishApply() {
  try {
    const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
    const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
    swVisualHeroSlice6TownPolishStyleMainStreet(storefront);
    swVisualHeroSlice6TownPolishStyleWaterTower();
    swVisualHeroSlice6TownPolishState.lastError = null;
    return true;
  } catch (error) {
    swVisualHeroSlice6TownPolishState.lastError = String(error?.message || error);
    return false;
  }
}

const swVisualHeroSlice6TownPolishRefreshBase = swVisualHeroSlice6RefreshWorld;
swVisualHeroSlice6RefreshWorld = function swVisualHeroSlice6RefreshWorldWithTownPolish(...args) {
  const result = swVisualHeroSlice6TownPolishRefreshBase.apply(this, args);
  swVisualHeroSlice6TownPolishApply();
  return result;
};

const swVisualHeroSlice6TownPolishSnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithSlice6TownPolish() {
  const base = swVisualHeroSlice6TownPolishSnapshotBase();
  return Object.freeze({
    ...base,
    worldIdentity: Object.freeze({
      ...(base.worldIdentity || {}),
      townPolish: Object.freeze({
        version: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
        profile: swVisualHeroSlice6TownPolishState.profile,
        waterTowerStyled: swVisualHeroSlice6TownPolishState.waterTowerStyled,
        waterTowerBaseColor: swVisualHeroSlice6TownPolishState.waterTowerBaseColor,
        mainStreetRooflineCount: swVisualHeroSlice6TownPolishState.mainStreetRooflineCount,
        compressedTallBuildingCount: swVisualHeroSlice6TownPolishState.compressedTallBuildingCount,
        falseFrontCount: swVisualHeroSlice6TownPolishState.falseFrontCount,
        awningCount: swVisualHeroSlice6TownPolishState.awningCount,
        presentationOnly: true,
      }),
    }),
    heroSlice6TownPolishVersion: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
    heroSlice6TownPolishLastError: swVisualHeroSlice6TownPolishState.lastError,
  });
};

const swVisualHeroSlice6TownPolishBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice6TownPolishBridgeBase,
  getSnapshot: swVisualSnapshot,
  refreshHeroSlice6: swVisualHeroSlice6RefreshWorld,
  heroSlice6TownPolishVersion: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
});

Promise.resolve().then(() => swVisualHeroSlice6TownPolishApply());
// [SW:VISUAL:HERO_SLICE6:TOWN_POLISH:END]
