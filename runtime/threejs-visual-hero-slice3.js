// ============================================================================
// [SW:VISUAL:HERO_SLICE3]
// THREEJS_VISUAL_HERO_SLICE3_V1
//
// Whole-scene visual unification on top of the green Hero Slice 2 checkpoint.
// It may restyle existing presentation materials and world-surface materials.
// It may read target presentation references but must never mutate gameplay truth.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE3_VERSION = 'THREEJS_VISUAL_HERO_SLICE3_V1';
const swVisualHeroSlice3State = {
  worldSurfaceStyled: false,
  secondaryTargetsStyled: 0,
  secondaryMaterialsStyled: 0,
  treeMaterialsStyled: 0,
  townGroundMeshesStyled: 0,
  lastCampaignIndex: -1,
};

const SW_VISUAL_HERO_SLICE3_PALETTES = Object.freeze([
  Object.freeze({
    terrain: '#929172', apron: '#6e765f', road: '#343a3f', shoulder: '#77756f', lane: '#d3bd78', creek: '#355c63',
    pad: '#737563', sidewalk: '#9c978c', alley: '#484d50',
    wood: ['#9a9276', '#7d8c78', '#8e7967', '#87959a'],
    masonry: ['#7f5046', '#8a6553', '#71645b', '#85604f'],
    metal: ['#70787b', '#81756b', '#626d72'],
    concrete: ['#918b7f', '#857e74', '#9b927f'],
    foliage: ['#405c3f', '#51684a', '#65764f'], trunk: '#654a35', glass: '#35565f', trim: '#d5c8ac', roof: '#3f474c',
  }),
  Object.freeze({
    terrain: '#8d8a62', apron: '#686d51', road: '#34393d', shoulder: '#79766d', lane: '#d7bf72', creek: '#3d6266',
    pad: '#6f735f', sidewalk: '#9b9587', alley: '#4b4e4f',
    wood: ['#9c8f70', '#788877', '#8d755e', '#85949a'],
    masonry: ['#805044', '#8d6a50', '#6f6257', '#8b614f'],
    metal: ['#747b79', '#81756a', '#626d72'],
    concrete: ['#918a7d', '#837d73', '#9b927f'],
    foliage: ['#465d3e', '#586b47', '#6d794d'], trunk: '#684b32', glass: '#395962', trim: '#d6c7a8', roof: '#41474a',
  }),
  Object.freeze({
    terrain: '#8c7557', apron: '#685d4c', road: '#34383b', shoulder: '#766f66', lane: '#d4b76c', creek: '#395c62',
    pad: '#75695a', sidewalk: '#9a9284', alley: '#4a4b4b',
    wood: ['#9a835f', '#81745e', '#8f6f58', '#7e8987'],
    masonry: ['#7b4a3b', '#8c5f43', '#6e5a50', '#85503d'],
    metal: ['#727574', '#806f62', '#60696d'],
    concrete: ['#8d8375', '#81786f', '#968a77'],
    foliage: ['#4a5737', '#5c6840', '#747b49'], trunk: '#62452f', glass: '#38535b', trim: '#d2bfa0', roof: '#3c4346',
  }),
  Object.freeze({
    terrain: '#88745f', apron: '#66584e', road: '#31363b', shoulder: '#746d68', lane: '#d8b56f', creek: '#3c5d66',
    pad: '#6e615d', sidewalk: '#968e87', alley: '#49484b',
    wood: ['#987960', '#7b8374', '#8a6b63', '#827c8c'],
    masonry: ['#794342', '#86584e', '#6b5b5d', '#7f4e4d'],
    metal: ['#6e7378', '#7e6d68', '#5f686e'],
    concrete: ['#89817c', '#7e7573', '#91847e'],
    foliage: ['#405744', '#50654c', '#647252'], trunk: '#5d4435', glass: '#3c5362', trim: '#d2bea8', roof: '#3c4249',
  }),
]);

function swVisualHeroSlice3Palette() {
  const campaignIndex = Math.max(0, Math.min(3, Number(selectedCampaignIndex) || 0));
  return { campaignIndex, palette: SW_VISUAL_HERO_SLICE3_PALETTES[campaignIndex] };
}

function swVisualHeroSlice3Hash(value) {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function swVisualHeroSlice3Texture(kind) {
  if (kind === 'brick') return swVisualHeroSlice2SurfaceTexture('brick');
  if (kind === 'metal') return swVisualHeroSlice2SurfaceTexture('galvanized');
  if (kind === 'siding') {
    return swVisualHeroSlice2CanvasTexture('secondary-siding', 256, 256, (context, width, height) => {
      context.fillStyle = '#f0eadc';
      context.fillRect(0, 0, width, height);
      for (let y = 0; y < height; y += 24) {
        context.fillStyle = y % 48 === 0 ? '#eee5d3' : '#e5dccb';
        context.fillRect(0, y + 2, width, 20);
        context.fillStyle = 'rgba(67,56,45,0.22)';
        context.fillRect(0, y, width, 2);
        context.fillStyle = 'rgba(255,255,255,0.20)';
        context.fillRect(0, y + 3, width, 1);
      }
    }, 1.4, 1.7);
  }
  if (kind === 'stucco') {
    return swVisualHeroSlice2CanvasTexture('secondary-stucco', 256, 256, (context, width, height) => {
      context.fillStyle = '#ddd4c4';
      context.fillRect(0, 0, width, height);
      for (let index = 0; index < 620; index += 1) {
        const x = (index * 73) % width;
        const y = (index * 151) % height;
        const alpha = 0.035 + (index % 5) * 0.012;
        context.fillStyle = `rgba(62,52,43,${alpha})`;
        context.fillRect(x, y, 1 + (index % 2), 1 + ((index + 1) % 2));
      }
    }, 1.4, 1.4);
  }
  return null;
}

function swVisualHeroSlice3SetMaterial(material, options = {}) {
  if (!material) return false;
  if (options.map !== undefined) material.map = options.map;
  if (options.color && material.color?.set) material.color.set(options.color);
  if (options.emissive && material.emissive?.set) material.emissive.set(options.emissive);
  if (Number.isFinite(options.emissiveIntensity)) material.emissiveIntensity = options.emissiveIntensity;
  if (Number.isFinite(options.roughness)) material.roughness = options.roughness;
  if (Number.isFinite(options.metalness)) material.metalness = options.metalness;
  if (Number.isFinite(options.opacity)) {
    material.opacity = options.opacity;
    material.transparent = options.opacity < 1;
  }
  material.needsUpdate = true;
  return true;
}

function swVisualHeroSlice3DesaturateMaterial(material, saturationScale = 0.46, lightnessBias = 0.02) {
  if (!material?.color?.getHSL) return false;
  const hsl = { h: 0, s: 0, l: 0 };
  material.color.getHSL(hsl);
  material.color.setHSL(
    hsl.h,
    THREE.MathUtils.clamp(hsl.s * saturationScale, 0, 0.58),
    THREE.MathUtils.clamp(hsl.l * 0.88 + lightnessBias, 0.18, 0.72),
  );
  if (Number.isFinite(material.roughness)) material.roughness = Math.max(material.roughness, 0.62);
  if (Number.isFinite(material.metalness)) material.metalness = Math.min(material.metalness, 0.22);
  material.needsUpdate = true;
  return true;
}

function swVisualHeroSlice3StyleTreeTarget(target, palette, seed) {
  const group = target?.meshData?.group;
  if (!group?.traverse) return 0;
  let styled = 0;
  group.traverse((object) => {
    if (!object?.isMesh || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const type = String(object.geometry?.type || '');
    const trunkLike = type.includes('Cylinder');
    materials.forEach((material, materialIndex) => {
      const color = trunkLike
        ? palette.trunk
        : palette.foliage[(seed + styled + materialIndex) % palette.foliage.length];
      if (swVisualHeroSlice3SetMaterial(material, {
        map: null,
        color,
        emissive: '#000000',
        emissiveIntensity: 0,
        roughness: trunkLike ? 0.96 : 0.88,
        metalness: 0,
      })) styled += 1;
    });
  });
  return styled;
}

function swVisualHeroSlice3StyleBuildingTarget(target, palette, seed) {
  const meshData = target?.meshData;
  const group = meshData?.group;
  if (!group?.traverse || group.name === 'structure.storefront.v1' || group.name === 'HartFarmSignatureBarn') return 0;
  const materialsSeen = new Set();
  let styled = 0;

  group.traverse((object) => {
    if (!object?.isMesh || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      if (!material || materialsSeen.has(material)) return;
      materialsSeen.add(material);
      const looksLikeGlass = Number(material.emissiveIntensity || 0) >= 0.16 && (Number(material.metalness || 0) >= 0.28 || target.hasGlass === true);
      if (looksLikeGlass) {
        if (swVisualHeroSlice3SetMaterial(material, {
          map: null,
          color: palette.glass,
          emissive: '#162d33',
          emissiveIntensity: 0.08,
          roughness: 0.28,
          metalness: 0.16,
        })) styled += 1;
      } else if (swVisualHeroSlice3DesaturateMaterial(material, target.materialFamily === 'carnival' ? 0.66 : 0.42, 0.01)) {
        styled += 1;
      }
    });
  });

  const family = String(target.materialFamily || '');
  const base = meshData.base;
  if (base?.material) {
    const baseMaterials = Array.isArray(base.material) ? base.material : [base.material];
    const colorSet = family === 'wood'
      ? palette.wood
      : (family === 'masonry' || family === 'glass'
        ? palette.masonry
        : (family === 'metal' || family === 'silo'
          ? palette.metal
          : palette.concrete));
    const baseColor = colorSet[seed % colorSet.length];
    const textureKind = family === 'wood'
      ? 'siding'
      : (family === 'masonry' || family === 'glass'
        ? 'brick'
        : (family === 'metal' || family === 'silo' ? 'metal' : 'stucco'));
    const baseMap = swVisualHeroSlice3Texture(textureKind);
    baseMaterials.forEach((material) => {
      if (swVisualHeroSlice3SetMaterial(material, {
        map: baseMap,
        color: baseColor,
        roughness: family === 'metal' || family === 'silo' ? 0.62 : 0.84,
        metalness: family === 'metal' || family === 'silo' ? 0.26 : 0.02,
      })) styled += 1;
    });
  }

  const roof = meshData.roof;
  if (roof?.material) {
    const roofMaterials = Array.isArray(roof.material) ? roof.material : [roof.material];
    roofMaterials.forEach((material) => {
      if (swVisualHeroSlice3SetMaterial(material, {
        map: family === 'metal' || family === 'silo' ? swVisualHeroSlice3Texture('metal') : null,
        color: palette.roof,
        roughness: 0.72,
        metalness: family === 'metal' || family === 'silo' ? 0.24 : 0.05,
      })) styled += 1;
    });
  }

  group.userData.swVisualHeroSlice3Styled = true;
  return styled;
}

function swVisualHeroSlice3StyleSecondaryTargets() {
  const { palette } = swVisualHeroSlice3Palette();
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
  let targetCount = 0;
  let materialCount = 0;
  let treeMaterialCount = 0;

  targetList.forEach((target, index) => {
    if (!target?.meshData?.group || Boolean(target.destroyed)) return;
    if (target.meshData.group.name === 'structure.storefront.v1' || target.meshData.group.name === 'HartFarmSignatureBarn') return;
    const seed = swVisualHeroSlice3Hash(`${target.blockId || ''}|${target.kind || ''}|${index}`);
    if (target.isTree === true || target.kind === 'tree' || target.kind === 'windbreak') {
      const count = swVisualHeroSlice3StyleTreeTarget(target, palette, seed);
      if (count > 0) {
        targetCount += 1;
        treeMaterialCount += count;
        materialCount += count;
      }
      return;
    }
    const count = swVisualHeroSlice3StyleBuildingTarget(target, palette, seed);
    if (count > 0) {
      targetCount += 1;
      materialCount += count;
    }
  });

  swVisualHeroSlice3State.secondaryTargetsStyled = targetCount;
  swVisualHeroSlice3State.secondaryMaterialsStyled = materialCount;
  swVisualHeroSlice3State.treeMaterialsStyled = treeMaterialCount;
  return targetCount;
}

function swVisualHeroSlice3StyleTownGround(palette) {
  if (typeof townDressGroup === 'undefined' || !townDressGroup?.traverse) return 0;
  const padColors = new Set([
    '49623f', '4e7650', '46566a', '625746', '6b7641', '4b5563', '665747',
    '76563b', '5d4b43', '56644d', '5d5368', '704b67', '6a5261', '7d4e67', '62566c',
  ]);
  let count = 0;
  townDressGroup.traverse((object) => {
    if (!object?.isMesh || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => {
      const hex = material.color?.getHexString?.() || '';
      if (padColors.has(hex)) {
        swVisualHeroSlice3SetMaterial(material, { color: palette.pad, roughness: 0.98, metalness: 0, opacity: 0.46 });
        count += 1;
      } else if (hex === 'a9b0b7') {
        swVisualHeroSlice3SetMaterial(material, { color: palette.sidewalk, roughness: 0.94, metalness: 0, opacity: 0.72 });
        count += 1;
      } else if (hex === '3b4652') {
        swVisualHeroSlice3SetMaterial(material, { color: palette.alley, roughness: 0.92, metalness: 0.01, opacity: 1 });
        count += 1;
      }
    });
  });
  swVisualHeroSlice3State.townGroundMeshesStyled = count;
  return count;
}

function swVisualHeroSlice3StyleWorldSurface() {
  const { campaignIndex, palette } = swVisualHeroSlice3Palette();
  if (typeof terrainMat !== 'undefined' && terrainMat) {
    swVisualHeroSlice3SetMaterial(terrainMat, { color: palette.terrain, roughness: 0.96, metalness: 0 });
  }
  if (typeof countyApron !== 'undefined' && countyApron?.material) {
    swVisualHeroSlice3SetMaterial(countyApron.material, { color: palette.apron, roughness: 0.99, metalness: 0 });
  }
  if (typeof roadMat !== 'undefined' && roadMat) swVisualHeroSlice3SetMaterial(roadMat, { color: palette.road, roughness: 0.90, metalness: 0.02 });
  if (typeof shoulderMat !== 'undefined' && shoulderMat) swVisualHeroSlice3SetMaterial(shoulderMat, { color: palette.shoulder, roughness: 0.96, metalness: 0 });
  if (typeof laneMat !== 'undefined' && laneMat) swVisualHeroSlice3SetMaterial(laneMat, { color: palette.lane });
  if (typeof creekMat !== 'undefined' && creekMat) swVisualHeroSlice3SetMaterial(creekMat, { color: palette.creek, roughness: 0.38, metalness: 0.04, opacity: 0.84 });
  swVisualHeroSlice3StyleTownGround(palette);
  swVisualHeroSlice3State.worldSurfaceStyled = true;
  swVisualHeroSlice3State.lastCampaignIndex = campaignIndex;
  return true;
}

function swVisualHeroSlice3RefreshWorld() {
  swVisualHeroSlice3StyleWorldSurface();
  swVisualHeroSlice3StyleSecondaryTargets();
  return true;
}

const swVisualHeroSlice3RefreshBase = swVisualRefreshHeroSlice;
swVisualRefreshHeroSlice = function swVisualRefreshHeroSliceWithSceneUnification(...args) {
  const result = swVisualHeroSlice3RefreshBase.apply(this, args);
  swVisualHeroSlice3RefreshWorld();
  return result;
};

const swVisualHeroSlice3SnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice3() {
  const base = swVisualHeroSlice3SnapshotBase();
  return Object.freeze({
    ...base,
    heroSlice3Version: THREEJS_VISUAL_HERO_SLICE3_VERSION,
    worldStyle: Object.freeze({
      worldSurfaceStyled: swVisualHeroSlice3State.worldSurfaceStyled,
      secondaryTargetsStyled: swVisualHeroSlice3State.secondaryTargetsStyled,
      secondaryMaterialsStyled: swVisualHeroSlice3State.secondaryMaterialsStyled,
      treeMaterialsStyled: swVisualHeroSlice3State.treeMaterialsStyled,
      townGroundMeshesStyled: swVisualHeroSlice3State.townGroundMeshesStyled,
      campaignIndex: swVisualHeroSlice3State.lastCampaignIndex,
      terrainColor: typeof terrainMat !== 'undefined' && terrainMat?.color?.getHexString ? `#${terrainMat.color.getHexString()}` : null,
      roadColor: typeof roadMat !== 'undefined' && roadMat?.color?.getHexString ? `#${roadMat.color.getHexString()}` : null,
      shoulderColor: typeof shoulderMat !== 'undefined' && shoulderMat?.color?.getHexString ? `#${shoulderMat.color.getHexString()}` : null,
      laneColor: typeof laneMat !== 'undefined' && laneMat?.color?.getHexString ? `#${laneMat.color.getHexString()}` : null,
    }),
  });
};

const swVisualHeroSlice3BuildLivingCountyBase = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithHeroSlice3StyleReset(...args) {
  swVisualHeroSlice3State.worldSurfaceStyled = false;
  swVisualHeroSlice3State.secondaryTargetsStyled = 0;
  swVisualHeroSlice3State.secondaryMaterialsStyled = 0;
  swVisualHeroSlice3State.treeMaterialsStyled = 0;
  swVisualHeroSlice3State.townGroundMeshesStyled = 0;
  const result = swVisualHeroSlice3BuildLivingCountyBase.apply(this, args);
  Promise.resolve().then(() => Promise.resolve()).then(() => swVisualHeroSlice3RefreshWorld());
  return result;
};

const swVisualHeroSlice3BridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice3BridgeBase,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  prepareQaView: swVisualPrepareQaView,
  clearQaView: swVisualClearQaView,
  getSnapshot: swVisualSnapshot,
  heroSlice3Version: THREEJS_VISUAL_HERO_SLICE3_VERSION,
  refreshWorldStyle: swVisualHeroSlice3RefreshWorld,
});

Promise.resolve().then(() => swVisualHeroSlice3RefreshWorld());
// [SW:VISUAL:HERO_SLICE3:END]
