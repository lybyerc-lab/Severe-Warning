// ============================================================================
// [SW:VISUAL:HERO_SLICE6:ROAD_LAW]
// THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1
//
// Visual correction after Slice 6 Run #1 owner review. Roads own protected
// corridors first. Parcel edges, fences, vegetation, and generated building
// presentation must respect that corridor before any decorative dressing runs.
// No target positions, collision truth, damage authority, or gameplay state are
// changed here.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_VERSION = 'THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_V1';

const SW_VISUAL_HERO_SLICE6_ROAD_LAW = Object.freeze({
  gridStep: 80,
  blockHalf: 40,
  asphaltHalf: 6,
  shoulderHalf: 8.5,
  curbCenterFromRoad: 8.82,
  sidewalkCenterFromRoad: 10.55,
  sidewalkWidth: 3.0,
  vergeCenterFromRoad: 13.05,
  vergeWidth: 1.75,
  lotSetbackFromRoad: 12.35,
  fenceGapHalf: 12.6,
  buildingMargin: 0.4,
});

const swVisualHeroSlice6RoadLawState = {
  hiddenLegacyParcelMeshes: 0,
  hiddenInheritedTransitionMeshes: 0,
  sidewalkSegmentCount: 0,
  curbSegmentCount: 0,
  vergeSegmentCount: 0,
  parcelAdjustedTargetCount: 0,
  parcelMinimumScale: 1,
  targetRoadIntrusionCount: 0,
  targetRoadIntrusions: [],
  farmFencePostCount: 0,
  farmFenceRailCount: 0,
  farmFenceGapCount: 0,
  farmFenceRoadIntrusionCount: 0,
  farmDitchSegmentCount: 0,
  farmShoulderSegmentCount: 0,
  profile: 'road-first-parcels-v2',
};

function swVisualHeroSlice6RoadLawNearestLine(value) {
  return Math.round(Number(value || 0) / SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep)
    * SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep;
}

function swVisualHeroSlice6RoadLawDistance(value) {
  return Math.abs(Number(value || 0) - swVisualHeroSlice6RoadLawNearestLine(value));
}

function swVisualHeroSlice6RoadLawPointOutsideRoad(x, z, halfWidth = SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf) {
  return swVisualHeroSlice6RoadLawDistance(x) > halfWidth
    && swVisualHeroSlice6RoadLawDistance(z) > halfWidth;
}

function swVisualHeroSlice6RoadLawBoxCrossesGrid(box, halfWidth) {
  if (!box || box.isEmpty?.()) return false;
  const step = SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep;
  const minXLine = Math.floor((box.min.x - halfWidth) / step) * step;
  const maxXLine = Math.ceil((box.max.x + halfWidth) / step) * step;
  for (let line = minXLine; line <= maxXLine; line += step) {
    if (box.max.x >= line - halfWidth && box.min.x <= line + halfWidth) return true;
  }
  const minZLine = Math.floor((box.min.z - halfWidth) / step) * step;
  const maxZLine = Math.ceil((box.max.z + halfWidth) / step) * step;
  for (let line = minZLine; line <= maxZLine; line += step) {
    if (box.max.z >= line - halfWidth && box.min.z <= line + halfWidth) return true;
  }
  return false;
}

function swVisualHeroSlice6RoadLawApprox(value, expected, tolerance = 0.08) {
  return Number.isFinite(value) && Math.abs(value - expected) <= tolerance;
}

function swVisualHeroSlice6RoadLawHideLegacyOverlays() {
  let hiddenLegacy = 0;
  if (typeof townDressGroup !== 'undefined' && townDressGroup?.children) {
    townDressGroup.children.forEach((object) => {
      if (!object?.isMesh || object.visible === false) return;
      const parameters = object.geometry?.parameters || {};
      const width = Number(parameters.width);
      const height = Number(parameters.height);
      const isLegacyParcelPad = swVisualHeroSlice6RoadLawApprox(width, 60) && swVisualHeroSlice6RoadLawApprox(height, 60);
      const isLegacyNorthWalk = swVisualHeroSlice6RoadLawApprox(width, 54) && swVisualHeroSlice6RoadLawApprox(height, 3.2);
      const isLegacyWestWalk = swVisualHeroSlice6RoadLawApprox(width, 3.2) && swVisualHeroSlice6RoadLawApprox(height, 54);
      const isLegacyAlley = swVisualHeroSlice6RoadLawApprox(width, 4.2) && swVisualHeroSlice6RoadLawApprox(height, 48);
      if (!isLegacyParcelPad && !isLegacyNorthWalk && !isLegacyWestWalk && !isLegacyAlley) return;
      object.visible = false;
      object.userData.swHiddenBySlice6RoadLaw = true;
      hiddenLegacy += 1;
    });
  }
  swVisualHeroSlice6RoadLawState.hiddenLegacyParcelMeshes = hiddenLegacy;

  let hiddenInherited = 0;
  if (swVisualHeroSlice4WorldRoot?.children) {
    swVisualHeroSlice4WorldRoot.children.forEach((object) => {
      const name = String(object?.name || '');
      if (!name.startsWith('SWVisualSlice4Storefront') && !name.startsWith('SWVisualSlice4Farm')) return;
      object.visible = false;
      object.userData.swHiddenBySlice6RoadLaw = true;
      hiddenInherited += 1;
    });
  }
  swVisualHeroSlice6RoadLawState.hiddenInheritedTransitionMeshes = hiddenInherited;
  return hiddenLegacy + hiddenInherited;
}

function swVisualHeroSlice6RoadLawCreateConformedRectBatch(rects, color, roughness, lift, name) {
  if (!swVisualHeroSlice6WorldRoot || !Array.isArray(rects) || rects.length === 0) return null;
  const positions = [];
  const indices = [];
  const corners = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ];
  rects.forEach((rect, rectIndex) => {
    const baseIndex = rectIndex * 4;
    corners.forEach(([cx, cz]) => {
      const x = Number(rect.x) + cx * Number(rect.width);
      const z = Number(rect.z) + cz * Number(rect.depth);
      const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0) + lift;
      positions.push(x, y, z);
    });
    indices.push(baseIndex, baseIndex + 1, baseIndex + 2, baseIndex, baseIndex + 2, baseIndex + 3);
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.userData.swSlice6RoadLawRectCount = rects.length;
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  );
  mesh.name = name;
  mesh.userData.swPresentationOnly = true;
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  swVisualHeroSlice6WorldRoot.add(mesh);
  return mesh;
}

function swVisualHeroSlice6RoadLawBuildStreetBoundaries() {
  const blocks = typeof townBlocks !== 'undefined' && Array.isArray(townBlocks) ? townBlocks : [];
  const sidewalks = [];
  const curbs = [];
  const verges = [];
  const localSidewalk = SW_VISUAL_HERO_SLICE6_ROAD_LAW.blockHalf - SW_VISUAL_HERO_SLICE6_ROAD_LAW.sidewalkCenterFromRoad;
  const localCurb = SW_VISUAL_HERO_SLICE6_ROAD_LAW.blockHalf - SW_VISUAL_HERO_SLICE6_ROAD_LAW.curbCenterFromRoad;
  const localVerge = SW_VISUAL_HERO_SLICE6_ROAD_LAW.blockHalf - SW_VISUAL_HERO_SLICE6_ROAD_LAW.vergeCenterFromRoad;

  blocks.forEach((block) => {
    const x = Number(block.x);
    const z = Number(block.z);
    if (!Number.isFinite(x) || !Number.isFinite(z)) return;
    [-1, 1].forEach((side) => {
      sidewalks.push({ x, z: z + side * localSidewalk, width: 56.0, depth: SW_VISUAL_HERO_SLICE6_ROAD_LAW.sidewalkWidth });
      sidewalks.push({ x: x + side * localSidewalk, z, width: SW_VISUAL_HERO_SLICE6_ROAD_LAW.sidewalkWidth, depth: 50.0 });
      curbs.push({ x, z: z + side * localCurb, width: 59.4, depth: 0.38 });
      curbs.push({ x: x + side * localCurb, z, width: 0.38, depth: 58.6 });
      verges.push({ x, z: z + side * localVerge, width: 54.5, depth: SW_VISUAL_HERO_SLICE6_ROAD_LAW.vergeWidth });
      verges.push({ x: x + side * localVerge, z, width: SW_VISUAL_HERO_SLICE6_ROAD_LAW.vergeWidth, depth: 48.5 });
    });
  });

  swVisualHeroSlice6RoadLawCreateConformedRectBatch(sidewalks, '#8a8982', 0.94, 0.32, 'SWVisualSlice6RoadLawSidewalkBatch');
  swVisualHeroSlice6RoadLawCreateConformedRectBatch(curbs, '#c0bbb0', 0.90, 0.36, 'SWVisualSlice6RoadLawCurbBatch');
  swVisualHeroSlice6RoadLawCreateConformedRectBatch(verges, '#58624f', 0.98, 0.20, 'SWVisualSlice6RoadLawVergeBatch');
  swVisualHeroSlice6RoadLawState.sidewalkSegmentCount = sidewalks.length;
  swVisualHeroSlice6RoadLawState.curbSegmentCount = curbs.length;
  swVisualHeroSlice6RoadLawState.vergeSegmentCount = verges.length;
}

function swVisualHeroSlice6RoadLawApplyParcelCompliance() {
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
  let adjusted = 0;
  let minimumScale = 1;

  targetList.forEach((target) => {
    const group = target?.meshData?.group;
    if (!group || Boolean(target.destroyed) || Boolean(target.isTree)) return;
    const groupName = String(group.name || '');
    if (groupName === 'HartFarmSignatureBarn') return;

    if (!group.userData.swSlice6RoadLawBaseScale) {
      group.userData.swSlice6RoadLawBaseScale = { x: Number(group.scale.x), y: Number(group.scale.y), z: Number(group.scale.z) };
    }
    const baseScale = group.userData.swSlice6RoadLawBaseScale;
    group.scale.set(baseScale.x, baseScale.y, baseScale.z);
    group.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return;
    const originX = Number(target.x);
    const originZ = Number(target.z);
    const extentX = Math.max(Math.abs(box.min.x - originX), Math.abs(box.max.x - originX));
    const extentZ = Math.max(Math.abs(box.min.z - originZ), Math.abs(box.max.z - originZ));
    const safeX = swVisualHeroSlice6RoadLawDistance(originX) - SW_VISUAL_HERO_SLICE6_ROAD_LAW.lotSetbackFromRoad - SW_VISUAL_HERO_SLICE6_ROAD_LAW.buildingMargin;
    const safeZ = swVisualHeroSlice6RoadLawDistance(originZ) - SW_VISUAL_HERO_SLICE6_ROAD_LAW.lotSetbackFromRoad - SW_VISUAL_HERO_SLICE6_ROAD_LAW.buildingMargin;
    if (safeX <= 0 || safeZ <= 0 || extentX <= 0 || extentZ <= 0) return;

    const fitScale = THREE.MathUtils.clamp(Math.min(1, safeX / extentX, safeZ / extentZ), 0.42, 1);
    group.scale.set(baseScale.x * fitScale, baseScale.y, baseScale.z * fitScale);
    group.userData.swSlice6ParcelScale = fitScale;
    group.userData.swSlice6ParcelCompliant = true;
    group.updateMatrixWorld(true);
    if (fitScale < 0.999) adjusted += 1;
    minimumScale = Math.min(minimumScale, fitScale);
  });

  const intrusions = [];
  targetList.forEach((target) => {
    const group = target?.meshData?.group;
    if (!group || Boolean(target.destroyed) || Boolean(target.isTree)) return;
    const box = new THREE.Box3().setFromObject(group);
    if (!swVisualHeroSlice6RoadLawBoxCrossesGrid(box, SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf + 0.25)) return;
    intrusions.push({
      kind: String(target.kind || target.meshData?.label || 'unknown'),
      x: Number(target.x),
      z: Number(target.z),
      group: String(group.name || ''),
    });
  });

  swVisualHeroSlice6RoadLawState.parcelAdjustedTargetCount = adjusted;
  swVisualHeroSlice6RoadLawState.parcelMinimumScale = Number(minimumScale.toFixed(4));
  swVisualHeroSlice6RoadLawState.targetRoadIntrusions = intrusions.slice(0, 20);
  swVisualHeroSlice6RoadLawState.targetRoadIntrusionCount = intrusions.length;
  return intrusions.length === 0;
}

function swVisualHeroSlice6RoadLawFenceCrossings(startZ, endZ) {
  const crossings = [];
  const step = SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep;
  let line = Math.ceil(Math.min(startZ, endZ) / step) * step;
  const max = Math.max(startZ, endZ);
  while (line <= max) {
    crossings.push(line);
    line += step;
  }
  return crossings;
}

swVisualHeroSlice6BuildFarmEdge = function swVisualHeroSlice6BuildRoadSafeFarmEdge(hartFarm) {
  if (!hartFarm || !swVisualHeroSlice6WorldRoot) return false;
  const baseX = Number(hartFarm.x) + 8.5;
  const baseZ = Number(hartFarm.z) + 37;
  const startZ = baseZ - 30;
  const endZ = baseZ + 30;
  const postSpacing = 5;
  const postTransforms = [];
  const railTransforms = [];
  const sampleZ = [];
  for (let z = startZ; z <= endZ + 0.01; z += postSpacing) sampleZ.push(Number(z.toFixed(4)));

  sampleZ.forEach((z) => {
    if (!swVisualHeroSlice6RoadLawPointOutsideRoad(baseX, z, SW_VISUAL_HERO_SLICE6_ROAD_LAW.fenceGapHalf)) return;
    postTransforms.push({ x: baseX, z });
  });
  for (let index = 0; index < sampleZ.length - 1; index += 1) {
    const z1 = sampleZ[index];
    const z2 = sampleZ[index + 1];
    const midZ = (z1 + z2) * 0.5;
    if (!swVisualHeroSlice6RoadLawPointOutsideRoad(baseX, z1, SW_VISUAL_HERO_SLICE6_ROAD_LAW.fenceGapHalf)) continue;
    if (!swVisualHeroSlice6RoadLawPointOutsideRoad(baseX, z2, SW_VISUAL_HERO_SLICE6_ROAD_LAW.fenceGapHalf)) continue;
    if (!swVisualHeroSlice6RoadLawPointOutsideRoad(baseX, midZ, SW_VISUAL_HERO_SLICE6_ROAD_LAW.fenceGapHalf)) continue;
    railTransforms.push({ x: baseX, z: midZ, length: Math.abs(z2 - z1) });
  }

  const postMaterial = swVisualHeroSlice6Material('#5f503d', { roughness: 0.94 });
  if (postTransforms.length) {
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.22, 1.8, 0.22), postMaterial, postTransforms.length);
    posts.name = 'SWVisualSlice6FarmFencePosts';
    postTransforms.forEach((entry, index) => {
      const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(entry.x, entry.z) : 0) + 0.9;
      swVisualHeroSlice6SetInstance(posts, index, entry.x, y, entry.z);
    });
    posts.instanceMatrix.needsUpdate = true;
    posts.castShadow = false;
    posts.receiveShadow = true;
    swVisualHeroSlice6WorldRoot.add(posts);
  }

  [0.72, 1.28].forEach((railY, railIndex) => {
    if (!railTransforms.length) return;
    const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.12, postSpacing), postMaterial.clone(), railTransforms.length);
    rails.name = `SWVisualSlice6FarmFenceRails${railIndex + 1}`;
    railTransforms.forEach((entry, index) => {
      const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(entry.x, entry.z) : 0) + railY;
      swVisualHeroSlice6SetInstance(rails, index, entry.x, y, entry.z, 1, 1, entry.length / postSpacing);
    });
    rails.instanceMatrix.needsUpdate = true;
    rails.castShadow = false;
    rails.receiveShadow = true;
    swVisualHeroSlice6WorldRoot.add(rails);
  });

  const ditchRects = [];
  const shoulderRects = [];
  const segmentLength = 4.6;
  for (let z = startZ + segmentLength * 0.5; z <= endZ - segmentLength * 0.5 + 0.01; z += segmentLength) {
    const z1 = z - segmentLength * 0.5;
    const z2 = z + segmentLength * 0.5;
    const ditchX = baseX + 3.1;
    const shoulderX = baseX - 3.3;
    const safeZ = swVisualHeroSlice6RoadLawDistance(z) > SW_VISUAL_HERO_SLICE6_ROAD_LAW.fenceGapHalf + segmentLength * 0.5;
    if (safeZ && swVisualHeroSlice6RoadLawPointOutsideRoad(ditchX, z, SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf)) {
      ditchRects.push({ x: ditchX, z, width: 4.2, depth: Math.max(0.1, z2 - z1) });
    }
    if (safeZ && swVisualHeroSlice6RoadLawPointOutsideRoad(shoulderX, z, SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf)) {
      shoulderRects.push({ x: shoulderX, z, width: 3.0, depth: Math.max(0.1, z2 - z1) });
    }
  }
  swVisualHeroSlice6RoadLawCreateConformedRectBatch(ditchRects, '#3f5142', 0.98, 0.19, 'SWVisualSlice6FarmDitchSegments');
  swVisualHeroSlice6RoadLawCreateConformedRectBatch(shoulderRects, '#70634c', 0.97, 0.20, 'SWVisualSlice6FarmShoulderSegments');

  const fenceIntrusions = postTransforms.filter((entry) => !swVisualHeroSlice6RoadLawPointOutsideRoad(entry.x, entry.z, SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf)).length
    + railTransforms.filter((entry) => swVisualHeroSlice6RoadLawDistance(entry.z) <= SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf + entry.length * 0.5).length;
  swVisualHeroSlice6RoadLawState.farmFencePostCount = postTransforms.length;
  swVisualHeroSlice6RoadLawState.farmFenceRailCount = railTransforms.length * 2;
  swVisualHeroSlice6RoadLawState.farmFenceGapCount = swVisualHeroSlice6RoadLawFenceCrossings(startZ, endZ).length;
  swVisualHeroSlice6RoadLawState.farmFenceRoadIntrusionCount = fenceIntrusions;
  swVisualHeroSlice6RoadLawState.farmDitchSegmentCount = ditchRects.length;
  swVisualHeroSlice6RoadLawState.farmShoulderSegmentCount = shoulderRects.length;
  swVisualHeroSlice6State.fenceInstanceCount = postTransforms.length;
  swVisualHeroSlice6State.transitionCount = ditchRects.length + shoulderRects.length;
  return true;
};

function swVisualHeroSlice6RoadLawBuildParcelClumps(storefront) {
  if (!storefront || !swVisualHeroSlice6WorldRoot) return false;
  const x = Number(storefront.x);
  const z = Number(storefront.z);
  const parcelCenterX = Math.floor(x / SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep) * SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep + SW_VISUAL_HERO_SLICE6_ROAD_LAW.blockHalf;
  const parcelCenterZ = Math.floor(z / SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep) * SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep + SW_VISUAL_HERO_SLICE6_ROAD_LAW.blockHalf;
  const candidates = [
    [-23, -22], [-16, -24], [17, -23], [23, -17],
    [-24, 16], [-18, 23], [18, 22], [24, 15],
  ];
  const transforms = candidates
    .map(([dx, dz], index) => ({ x: parcelCenterX + dx, z: parcelCenterZ + dz, index }))
    .filter((entry) => swVisualHeroSlice6RoadLawPointOutsideRoad(entry.x, entry.z, SW_VISUAL_HERO_SLICE6_ROAD_LAW.lotSetbackFromRoad + 0.5));
  if (!transforms.length) return false;
  const clumps = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.48, 1.25, 5),
    swVisualHeroSlice6Material('#415846', { roughness: 0.98 }),
    transforms.length,
  );
  clumps.name = 'SWVisualSlice6ParcelClumps';
  transforms.forEach((entry, index) => {
    const y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(entry.x, entry.z) : 0) + 0.55;
    const scale = 0.72 + (entry.index % 3) * 0.14;
    swVisualHeroSlice6SetInstance(clumps, index, entry.x, y, entry.z, scale, scale, scale, entry.index * 0.61);
  });
  clumps.instanceMatrix.needsUpdate = true;
  clumps.castShadow = false;
  clumps.receiveShadow = true;
  swVisualHeroSlice6WorldRoot.add(clumps);
  swVisualHeroSlice6State.vegetationInstanceCount = transforms.length;
  return true;
}

swVisualHeroSlice6BuildWorldIdentity = function swVisualHeroSlice6BuildRoadFirstWorldIdentity() {
  swVisualHeroSlice6DisposeWorld();
  if (!swVisualRoot) return false;
  swVisualHeroSlice6WorldRoot = new THREE.Group();
  swVisualHeroSlice6WorldRoot.name = 'SWVisualHeroSlice6WorldIdentity';
  swVisualHeroSlice6WorldRoot.userData.swPresentationOnly = true;
  swVisualHeroSlice6WorldRoot.userData.swRoadLaw = THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_VERSION;
  swVisualRoot.add(swVisualHeroSlice6WorldRoot);

  swVisualHeroSlice6State.worldProfile = swVisualHeroSlice6RoadLawState.profile;
  swVisualHeroSlice6State.buildingIdentityCount = 0;
  swVisualHeroSlice6State.transitionCount = 0;
  swVisualHeroSlice6State.vegetationInstanceCount = 0;
  swVisualHeroSlice6RoadLawState.parcelMinimumScale = 1;
  swVisualHeroSlice6RoadLawState.targetRoadIntrusions = [];
  swVisualHeroSlice6RoadLawState.targetRoadIntrusionCount = 0;

  swVisualHeroSlice6RoadLawHideLegacyOverlays();
  swVisualHeroSlice6RoadLawBuildStreetBoundaries();
  swVisualHeroSlice6RoadLawApplyParcelCompliance();

  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  const hartFarm = swVisualGetHartFarmPresentationAnchor?.() || null;
  if (storefront) swVisualHeroSlice6RoadLawBuildParcelClumps(storefront);
  if (hartFarm) swVisualHeroSlice6BuildFarmEdge(hartFarm);
  return true;
};

const swVisualHeroSlice6RoadLawPrepareQaBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView;
function swVisualHeroSlice6PrepareQaViewRoadLaw(mode = 'storefront') {
  if (mode === 'slice6-street') {
    swVisualHeroSlice6RefreshWorld();
    swVisualFoundationState.qaMode = mode;
    if (typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause === 'function') globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
    globalThis.productionQaPrepared = true;
    document.getElementById('mainMenu')?.classList.add('hidden');
    const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
    const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
    if (!storefront) return false;
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    camera.position.set(x + 61, y + 30, z + 55);
    camera.lookAt(x - 2, y + 2.8, z - 1);
    swVisualUpdate(0, 1000);
    renderer.render(scene, camera);
    return true;
  }
  if (mode === 'slice6-farm-edge') {
    swVisualHeroSlice6RefreshWorld();
    swVisualFoundationState.qaMode = mode;
    if (typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause === 'function') globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
    globalThis.productionQaPrepared = true;
    document.getElementById('mainMenu')?.classList.add('hidden');
    const hartFarm = swVisualGetHartFarmPresentationAnchor?.() || null;
    if (!hartFarm) return false;
    const x = Number(hartFarm.x);
    const z = Number(hartFarm.z);
    const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
    camera.position.set(x + 48, y + 22, z + 66);
    camera.lookAt(x + 8.5, y + 1.8, z + 38);
    swVisualUpdate(0, 1000);
    renderer.render(scene, camera);
    return true;
  }
  return swVisualHeroSlice6RoadLawPrepareQaBase?.(mode) ?? false;
}

const swVisualHeroSlice6RoadLawSnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithSlice6RoadLaw() {
  const base = swVisualHeroSlice6RoadLawSnapshotBase();
  return Object.freeze({
    ...base,
    worldIdentity: Object.freeze({
      ...(base.worldIdentity || {}),
      profile: swVisualHeroSlice6RoadLawState.profile,
      roadLaw: Object.freeze({
        version: THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_VERSION,
        gridStep: SW_VISUAL_HERO_SLICE6_ROAD_LAW.gridStep,
        shoulderHalf: SW_VISUAL_HERO_SLICE6_ROAD_LAW.shoulderHalf,
        lotSetbackFromRoad: SW_VISUAL_HERO_SLICE6_ROAD_LAW.lotSetbackFromRoad,
        hiddenLegacyParcelMeshes: swVisualHeroSlice6RoadLawState.hiddenLegacyParcelMeshes,
        hiddenInheritedTransitionMeshes: swVisualHeroSlice6RoadLawState.hiddenInheritedTransitionMeshes,
        sidewalkSegmentCount: swVisualHeroSlice6RoadLawState.sidewalkSegmentCount,
        curbSegmentCount: swVisualHeroSlice6RoadLawState.curbSegmentCount,
        vergeSegmentCount: swVisualHeroSlice6RoadLawState.vergeSegmentCount,
        parcelAdjustedTargetCount: swVisualHeroSlice6RoadLawState.parcelAdjustedTargetCount,
        parcelMinimumScale: swVisualHeroSlice6RoadLawState.parcelMinimumScale,
        targetRoadIntrusionCount: swVisualHeroSlice6RoadLawState.targetRoadIntrusionCount,
        targetRoadIntrusions: Object.freeze(swVisualHeroSlice6RoadLawState.targetRoadIntrusions.map((entry) => Object.freeze({ ...entry }))),
        farmFencePostCount: swVisualHeroSlice6RoadLawState.farmFencePostCount,
        farmFenceRailCount: swVisualHeroSlice6RoadLawState.farmFenceRailCount,
        farmFenceGapCount: swVisualHeroSlice6RoadLawState.farmFenceGapCount,
        farmFenceRoadIntrusionCount: swVisualHeroSlice6RoadLawState.farmFenceRoadIntrusionCount,
        farmDitchSegmentCount: swVisualHeroSlice6RoadLawState.farmDitchSegmentCount,
        farmShoulderSegmentCount: swVisualHeroSlice6RoadLawState.farmShoulderSegmentCount,
        stackedSlice6BuildingKits: swVisualHeroSlice6State.buildingIdentityCount,
      }),
    }),
    heroSlice6RoadLawVersion: THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_VERSION,
  });
};

const swVisualHeroSlice6RoadLawBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice6RoadLawBridgeBase,
  getSnapshot: swVisualSnapshot,
  prepareQaView: swVisualHeroSlice6PrepareQaViewRoadLaw,
  refreshHeroSlice6: swVisualHeroSlice6RefreshWorld,
  heroSlice6RoadLawVersion: THREEJS_VISUAL_HERO_SLICE6_ROAD_LAW_VERSION,
});

Promise.resolve().then(() => swVisualHeroSlice6RefreshWorld());
// [SW:VISUAL:HERO_SLICE6:ROAD_LAW:END]
