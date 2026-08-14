// ============================================================================
// [SW:VISUAL:HERO_SLICE6:TOWN_POLISH]
// THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1
// THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1
//
// Presentation-only correction after owner QA on the exact green Run #25.
// Road-first parcel law remains the spatial authority. This pass makes Main
// Street read as an authored place at gameplay distance and retapers the
// default storm presentation so it reads as a turbulent vertical storm body,
// not a stack of broad saucers. It does not move target coordinates or write
// health, damage, collision, scoring, storm, ability, campaign, animal, or
// Neon-selection authority.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION = 'THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_V1';
const THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_VERSION = 'THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_V1';

const swVisualHeroSlice6TownPolishState = {
  waterTowerStyled: false,
  waterTowerBaseColor: null,
  mainStreetRooflineCount: 0,
  compressedTallBuildingCount: 0,
  falseFrontCount: 0,
  awningCount: 0,
  roadFacingFacadeCount: 0,
  footprintVarietyCount: 0,
  detailedStorefrontCount: 0,
  storefrontArchetypeCount: 0,
  parapetCount: 0,
  signageCount: 0,
  streetPropCount: 0,
  stormRetaperedShellCount: 0,
  stormRetaperedWispCount: 0,
  stormDebrisClusterCount: 0,
  profile: 'small-town-massing-v3-break-blocktown',
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

function swVisualHeroSlice6TownPolishSignMaterial(label, background, ink) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#e7d6ae';
  context.lineWidth = 8;
  context.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
  context.fillStyle = ink;
  context.font = '700 38px Arial, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, canvas.width * 0.5, canvas.height * 0.53);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.82, metalness: 0.02 });
}

function swVisualHeroSlice6TownPolishFrontage(target, width, depth) {
  const x = Number(target?.x);
  const z = Number(target?.z);
  const gridStep = 80;
  const xRoad = Math.round(x / gridStep) * gridStep;
  const zRoad = Math.round(z / gridStep) * gridStep;
  const dx = Math.abs(x - xRoad);
  const dz = Math.abs(z - zRoad);

  if (dx <= dz) {
    const direction = xRoad < x ? -1 : 1;
    return {
      rotationY: direction < 0 ? Math.PI * 0.5 : -Math.PI * 0.5,
      x: direction * Math.max(0.2, width * 0.5 - 0.09),
      z: 0,
      frontageWidth: depth,
    };
  }

  const direction = zRoad < z ? -1 : 1;
  return {
    rotationY: direction < 0 ? 0 : Math.PI,
    x: 0,
    z: direction * Math.max(0.2, depth * 0.5 - 0.09),
    frontageWidth: width,
  };
}

function swVisualHeroSlice6TownPolishEnsureFacadeRig(group, frontage, height, ordinal, shellColor, roofColor) {
  let rig = group.getObjectByName?.('TownPolishFacadeRig') || null;
  if (!rig) {
    rig = new THREE.Group();
    rig.name = 'TownPolishFacadeRig';
    rig.userData.swPresentationOnly = true;
    group.add(rig);
  }
  rig.position.set(frontage.x, 0, frontage.z);
  rig.rotation.y = frontage.rotationY;

  const faceWidth = Math.max(4.2, Math.min(frontage.frontageWidth * 0.86, 11.5));
  const archetype = ordinal % 5;
  const signPalette = ['#c69a55', '#9d5f48', '#57777a', '#b4a16d', '#765f72'];
  const signNames = ['MOO BREW', 'HARDWARE', 'MERCANTILE', 'COUNTY BANK', 'STORM CELLAR'];

  let falseFront = rig.getObjectByName?.('SWVisualSlice6MainStreetFalseFront') || null;
  if (!falseFront) {
    falseFront = new THREE.Mesh(
      swVisualHeroSlice6TownPolishGableGeometry(faceWidth * (archetype === 0 ? 0.92 : 0.62), 0.18, Math.max(1.25, height * 0.085)),
      new THREE.MeshStandardMaterial({ color: shellColor, roughness: 0.90, metalness: 0.01 }),
    );
    falseFront.name = 'SWVisualSlice6MainStreetFalseFront';
    falseFront.castShadow = true;
    falseFront.receiveShadow = true;
    falseFront.userData.swPresentationOnly = true;
    falseFront.userData.swTownPolish = true;
    rig.add(falseFront);
  }
  falseFront.position.set(0, height + 0.08, -0.08);
  falseFront.visible = archetype !== 2;

  let awning = rig.getObjectByName?.('SWVisualSlice6MainStreetAwning') || null;
  if (!awning) {
    awning = new THREE.Mesh(
      new THREE.BoxGeometry(faceWidth * (archetype === 3 ? 0.84 : 0.64), 0.18, archetype === 3 ? 1.45 : 1.08),
      new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.82, metalness: 0.04 }),
    );
    awning.name = 'SWVisualSlice6MainStreetAwning';
    awning.castShadow = false;
    awning.receiveShadow = true;
    awning.userData.swPresentationOnly = true;
    awning.userData.swTownPolish = true;
    rig.add(awning);
  }
  awning.position.set(archetype === 4 ? -faceWidth * 0.12 : 0, Math.min(height * 0.23, 3.6), -0.56);
  awning.rotation.x = -0.08;

  let parapet = rig.getObjectByName?.('TownPolishParapet') || null;
  if (!parapet) {
    parapet = new THREE.Mesh(
      new THREE.BoxGeometry(faceWidth * (archetype === 2 ? 0.96 : 0.72), archetype === 1 ? 1.18 : 0.64, 0.34),
      new THREE.MeshStandardMaterial({ color: archetype === 1 ? '#6e5a48' : shellColor, roughness: 0.88, metalness: 0.02 }),
    );
    parapet.name = 'TownPolishParapet';
    parapet.castShadow = true;
    parapet.receiveShadow = true;
    parapet.userData.swPresentationOnly = true;
    parapet.userData.swTownPolish = true;
    rig.add(parapet);
  }
  parapet.position.set(archetype === 4 ? faceWidth * 0.16 : 0, height + (archetype === 1 ? 0.48 : 0.20), -0.11);
  parapet.visible = archetype === 1 || archetype === 2 || archetype === 4;

  if (ordinal < 8) {
    let signboard = rig.getObjectByName?.('TownPolishSignboard') || null;
    if (!signboard) {
      signboard = new THREE.Mesh(
        new THREE.BoxGeometry(faceWidth * (archetype === 0 ? 0.44 : 0.34), archetype === 1 ? 0.92 : 0.68, 0.18),
        swVisualHeroSlice6TownPolishSignMaterial(signNames[ordinal % signNames.length], signPalette[archetype], '#f2e4ba'),
      );
      signboard.name = 'TownPolishSignboard';
      signboard.castShadow = false;
      signboard.receiveShadow = true;
        signboard.userData.swPresentationOnly = true;
        signboard.userData.swTownPolish = true;
      rig.add(signboard);
    }
    signboard.position.set((ordinal % 2 ? -1 : 1) * faceWidth * 0.16, Math.min(height * 0.31, 4.7), -0.24);

    let windowBand = rig.getObjectByName?.('TownPolishWindowBand') || null;
    if (!windowBand) {
      windowBand = new THREE.Mesh(
        new THREE.BoxGeometry(faceWidth * 0.72, archetype === 2 ? 1.55 : 1.22, 0.12),
        new THREE.MeshStandardMaterial({
          color: '#263f47', roughness: 0.28, metalness: 0.08,
          emissive: '#0c181d', emissiveIntensity: 0.045,
          transparent: true, opacity: 0.88,
        }),
      );
      windowBand.name = 'TownPolishWindowBand';
      windowBand.castShadow = false;
      windowBand.receiveShadow = true;
      windowBand.userData.swPresentationOnly = true;
      windowBand.userData.swTownPolish = true;
      rig.add(windowBand);
    }
    windowBand.position.set(0, Math.min(height * 0.12, 2.15), -0.20);

    let door = rig.getObjectByName?.('TownPolishDoor') || null;
    if (!door) {
      door = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 1.85, 0.13),
        new THREE.MeshStandardMaterial({ color: '#443f38', roughness: 0.86, metalness: 0.01 }),
      );
      door.name = 'TownPolishDoor';
      door.castShadow = false;
      door.receiveShadow = true;
      door.userData.swPresentationOnly = true;
      door.userData.swTownPolish = true;
      rig.add(door);
    }
    door.position.set((ordinal % 2 ? 1 : -1) * faceWidth * 0.30, 0.95, -0.22);

    let planter = rig.getObjectByName?.('TownPolishPlanter') || null;
    if (!planter) {
      planter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.38, 0.52, 8),
        new THREE.MeshStandardMaterial({ color: '#7b6651', roughness: 0.92, metalness: 0.01 }),
      );
      planter.name = 'TownPolishPlanter';
      planter.castShadow = true;
      planter.receiveShadow = true;
      planter.userData.swPresentationOnly = true;
      planter.userData.swTownPolish = true;
      rig.add(planter);
    }
    planter.position.set((ordinal % 2 ? -1 : 1) * faceWidth * 0.43, 0.28, -0.56);
  }

  return rig;
}

function swVisualHeroSlice6TownPolishStyleMainStreet(storefront) {
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
  if (!storefront || !targetList.length) return 0;
  const centerX = Number(storefront.x);
  const centerZ = Number(storefront.z);
  const shellPalette = ['#9a765f', '#80908b', '#a8896f', '#7d8d95', '#a69a79'];
  const roofPalette = ['#404947', '#514741', '#3e4d55', '#5b4b40', '#464b50'];
  const footprintProfiles = [
    { x: 0.78, z: 0.92, y: 0.90 },
    { x: 0.92, z: 0.74, y: 1.00 },
    { x: 0.84, z: 0.84, y: 0.94 },
    { x: 0.72, z: 0.94, y: 0.82 },
    { x: 0.88, z: 0.78, y: 1.04 },
  ];
  let rooflines = 0;
  let compressed = 0;
  let roadFacing = 0;
  let varied = 0;
  let detailed = 0;

  targetList
    .map((target) => ({ target, distance: Math.hypot(Number(target?.x) - centerX, Number(target?.z) - centerZ) }))
    .filter((entry) => {
      const kind = String(entry.target?.kind || '');
      const x = Math.abs(Number(entry.target?.x));
      const z = Math.abs(Number(entry.target?.z));
      return entry.distance <= 288
        && x <= 152
        && z <= 82
        && ['shop', 'office', 'civic', 'apartment'].includes(kind);
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 12)
    .forEach((entry, ordinal) => {
      const target = entry.target;
      const group = target?.meshData?.group;
      const base = target?.meshData?.base;
      if (!group || !base || Boolean(target.destroyed) || Boolean(target.isTree)) return;
      const groupName = String(group.name || '');
      if (groupName === 'HartFarmSignatureBarn') return;
      const parameters = base.geometry?.parameters || {};
      const width = Number(parameters.width || 0);
      const height = Number(parameters.height || 0);
      const depth = Number(parameters.depth || 0);
      if (!base.geometry?.type?.includes('Box') || width < 7 || depth < 7 || height < 5) return;

      if (!group.userData.swSlice6TownPolishBaseScaleX) group.userData.swSlice6TownPolishBaseScaleX = Number(group.scale.x) || 1;
      if (!group.userData.swSlice6TownPolishBaseScaleY) group.userData.swSlice6TownPolishBaseScaleY = Number(group.scale.y) || 1;
      if (!group.userData.swSlice6TownPolishBaseScaleZ) group.userData.swSlice6TownPolishBaseScaleZ = Number(group.scale.z) || 1;

      const profile = footprintProfiles[ordinal % footprintProfiles.length];
      const heightScaleBase = height >= 24 ? 0.50 : (height >= 18 ? 0.60 : 0.82);
      const heightScale = THREE.MathUtils.clamp(heightScaleBase * profile.y, 0.42, 0.88);
      group.scale.x = group.userData.swSlice6TownPolishBaseScaleX * profile.x;
      group.scale.y = group.userData.swSlice6TownPolishBaseScaleY * heightScale;
      group.scale.z = group.userData.swSlice6TownPolishBaseScaleZ * profile.z;
      group.userData.swSlice6TownHeightScale = heightScale;
      group.userData.swSlice6TownFootprintScale = Object.freeze({ x: profile.x, z: profile.z });
      group.userData.swSlice6TownPolished = true;
      group.userData.swSlice6BlocktownBreak = true;
      compressed += 1;
      varied += 1;

      const facadeTexture = typeof swVisualHeroSlice3Texture === 'function'
        ? swVisualHeroSlice3Texture(ordinal % 3 === 1 ? 'wood' : 'brick')
        : null;
      swVisualHeroSlice6TownPolishSetMaterial(base.material, {
        map: facadeTexture,
        color: shellPalette[ordinal % shellPalette.length],
        emissive: '#000000', emissiveIntensity: 0, roughness: 0.90, metalness: 0.02,
      });

      const frontage = swVisualHeroSlice6TownPolishFrontage(target, width, depth);
      const desiredWorldRoofHeight = height >= 22 ? 3.7 : 3.1;
      const localRoofHeight = desiredWorldRoofHeight / Math.max(0.45, heightScale);
      let roof = group.getObjectByName?.('SWVisualSlice6MainStreetGable') || null;
      if (!roof) {
        const geometry = swVisualHeroSlice6TownPolishGableGeometry(width * 0.90, depth * 0.90, localRoofHeight);
        const material = new THREE.MeshStandardMaterial({ color: roofPalette[ordinal % roofPalette.length], roughness: 0.88, metalness: 0.04 });
        roof = new THREE.Mesh(geometry, material);
        roof.name = 'SWVisualSlice6MainStreetGable';
        roof.position.y = height + 0.18;
        roof.castShadow = true;
        roof.receiveShadow = true;
        roof.userData.swPresentationOnly = true;
        group.add(roof);
      }
      roof.rotation.y = ordinal % 3 === 1 ? frontage.rotationY + Math.PI * 0.5 : frontage.rotationY;

      swVisualHeroSlice6TownPolishEnsureFacadeRig(
        group, frontage, height, ordinal,
        shellPalette[(ordinal + 2) % shellPalette.length],
        roofPalette[(ordinal + 1) % roofPalette.length],
      );

      roadFacing += 1;
      if (ordinal < 8) detailed += 1;
      rooflines += 1;
      group.updateMatrixWorld?.(true);
    });

  swVisualHeroSlice6TownPolishState.mainStreetRooflineCount = rooflines;
  swVisualHeroSlice6TownPolishState.compressedTallBuildingCount = compressed;
  swVisualHeroSlice6TownPolishState.falseFrontCount = rooflines;
  swVisualHeroSlice6TownPolishState.awningCount = rooflines;
  swVisualHeroSlice6TownPolishState.roadFacingFacadeCount = roadFacing;
  swVisualHeroSlice6TownPolishState.footprintVarietyCount = varied;
  swVisualHeroSlice6TownPolishState.detailedStorefrontCount = detailed;
  swVisualHeroSlice6TownPolishState.storefrontArchetypeCount = rooflines;
  swVisualHeroSlice6TownPolishState.parapetCount = rooflines;
  swVisualHeroSlice6TownPolishState.signageCount = detailed;
  swVisualHeroSlice6TownPolishState.streetPropCount = detailed;
  return rooflines;
}

function swVisualHeroSlice6TownPolishStyleWaterTower() {
  const landmarkList = typeof landmarks !== 'undefined' && Array.isArray(landmarks) ? landmarks : [];
  const waterTower = landmarkList.find((landmark) => landmark?.icon === '\u{1F4A7}' || String(landmark?.name || '') === 'WATER TOWER') || null;
  const group = waterTower?.meshData?.group;
  const base = waterTower?.meshData?.base;
  if (!group || !base || Boolean(waterTower?.destroyed)) {
    swVisualHeroSlice6TownPolishState.waterTowerStyled = false;
    swVisualHeroSlice6TownPolishState.waterTowerBaseColor = null;
    return false;
  }

  const metalMap = typeof swVisualHeroSlice3Texture === 'function' ? swVisualHeroSlice3Texture('metal') : null;
  swVisualHeroSlice6TownPolishSetMaterial(base.material, {
    map: metalMap, color: '#949b92', emissive: '#000000', emissiveIntensity: 0, roughness: 0.78, metalness: 0.22,
  });

  let dressing = group.getObjectByName?.('SWVisualSlice6WaterTowerStandpipe') || null;
  if (!dressing) {
    dressing = new THREE.Group();
    dressing.name = 'SWVisualSlice6WaterTowerStandpipe';
    dressing.userData.swPresentationOnly = true;
    const steelMaterial = new THREE.MeshStandardMaterial({ color: '#9aa19a', roughness: 0.74, metalness: 0.25, map: metalMap });
    const darkSteelMaterial = new THREE.MeshStandardMaterial({ color: '#59615f', roughness: 0.76, metalness: 0.24 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.18, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5), steelMaterial);
    dome.position.y = 17.0;
    dome.castShadow = true;
    dome.receiveShadow = true;
    dressing.add(dome);
    [4.4, 8.7, 13.0, 16.6].forEach((y) => {
      const band = new THREE.Mesh(new THREE.TorusGeometry(4.23, 0.09, 6, 24), darkSteelMaterial);
      band.rotation.x = Math.PI * 0.5;
      band.position.y = y;
      dressing.add(band);
    });
    const ladderMaterial = new THREE.MeshStandardMaterial({ color: '#434b49', roughness: 0.82, metalness: 0.22 });
    [-0.27, 0.27].forEach((z) => {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 12.5, 6), ladderMaterial);
      rail.position.set(4.29, 8.1, z);
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

function swVisualHeroSlice6TownPolishRetaperStorm() {
  if (!swVisualHeroSlice6StormRoot?.children) return false;
  let shellCount = 0;
  let wispCount = 0;

  swVisualHeroSlice6StormRoot.children.forEach((object, objectIndex) => {
    if (object.name?.startsWith('SWVisualSlice6StormShell')) {
      const geometry = object.geometry;
      const position = geometry?.getAttribute?.('position');
      if (!position?.count) return;
      if (geometry.userData.swSlice6BlocktownRetapered !== true) {
        let minY = Infinity;
        let maxY = -Infinity;
        for (let index = 0; index < position.count; index += 1) {
          minY = Math.min(minY, position.getY(index));
          maxY = Math.max(maxY, position.getY(index));
        }
        const span = Math.max(0.001, maxY - minY);
        for (let index = 0; index < position.count; index += 1) {
          const x = position.getX(index);
          const y = position.getY(index);
          const z = position.getZ(index);
          const mix = THREE.MathUtils.clamp((y - minY) / span, 0, 1);
          const angle = Math.atan2(z, x);
           const upperTaper = 0.90 - mix * (0.38 + objectIndex * 0.045);
           const irregular = 1 + Math.sin(angle * 2.4 + mix * 5.2 + objectIndex) * 0.105;
           const shearX = Math.sin(mix * 3.7 + objectIndex * 1.4) * mix * 2.2;
           const shearZ = Math.cos(mix * 4.1 + objectIndex * 0.8) * mix * 1.75;
          position.setXYZ(index, x * upperTaper * irregular + shearX, y, z * upperTaper * (2 - irregular) + shearZ);
        }
        position.needsUpdate = true;
        geometry.computeVertexNormals();
        geometry.userData.swSlice6BlocktownRetapered = true;
      }
      object.userData.baseOpacity = Math.min(Number(object.userData.baseOpacity || 0.14), 0.128 - objectIndex * 0.014);
      if (object.material) {
        object.material.opacity = object.userData.baseOpacity;
        object.material.color?.set?.(objectIndex === 0 ? '#172a31' : (objectIndex === 1 ? '#294047' : '#4a5b5e'));
        object.material.needsUpdate = true;
      }
      shellCount += 1;
      return;
    }

    if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
      if (object.userData.swSlice6BlocktownRetapered !== true) {
        object.userData.radius = Number(object.userData.radius || 8) * 0.72;
        object.scale.x *= 0.84;
        object.scale.y *= 1.22;
        object.userData.swSlice6BlocktownRetapered = true;
      }
       if (object.material) object.material.opacity = Math.min(0.20, Number(object.material.opacity || 0.12) * 1.16);
       wispCount += 1;
    }
  });

  swVisualHeroSlice6TownPolishState.stormRetaperedShellCount = shellCount;
  swVisualHeroSlice6TownPolishState.stormRetaperedWispCount = wispCount;
  // The default storm now owns its lower circulation with stretched, directional
  // ground-pull sprites.  Do not reintroduce town-polish bubble fragments here:
  // that makes the shared storm read as a stack of separate attack effects.
  swVisualHeroSlice6TownPolishState.stormDebrisClusterCount = 0;
  return shellCount > 0;
}

function swVisualHeroSlice6TownPolishApply() {
  try {
    const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
    const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
    swVisualHeroSlice6TownPolishStyleMainStreet(storefront);
    swVisualHeroSlice6TownPolishStyleWaterTower();
    swVisualHeroSlice6TownPolishRetaperStorm();
    swVisualHeroSlice6TownPolishState.lastError = null;
    return true;
  } catch (error) {
    swVisualHeroSlice6TownPolishState.lastError = String(error?.message || error);
    return false;
  }
}

const swVisualHeroSlice6TownPolishStormBuildBase = swVisualHeroSlice6BuildStormSilhouette;
swVisualHeroSlice6BuildStormSilhouette = function swVisualHeroSlice6BuildStormSilhouetteBreakBlocktown(...args) {
  const result = swVisualHeroSlice6TownPolishStormBuildBase.apply(this, args);
  if (result) swVisualHeroSlice6TownPolishRetaperStorm();
  return result;
};

const swVisualHeroSlice6TownPolishStormTuneBase = swVisualHeroSlice6TuneInheritedStorm;
swVisualHeroSlice6TuneInheritedStorm = function swVisualHeroSlice6TuneInheritedStormBreakBlocktown(seconds) {
  swVisualHeroSlice6TownPolishStormTuneBase(seconds);
  const neonSelected = typeof swVisualHeroSlice5IsNeonSelected === 'function'
    ? swVisualHeroSlice5IsNeonSelected()
    : (typeof neonFunnelUnlocked !== 'undefined' && neonFunnelUnlocked === true);
  if (neonSelected) return;

  if (swVisualHeroSlice4StormRoot?.children) {
    swVisualHeroSlice4StormRoot.children.forEach((object) => {
      if (!object.name?.startsWith('SWVisualSlice4VolumeShell') || !object.material) return;
      const base = Number(object.userData.baseOpacity || 0.14);
      object.material.opacity = Math.min(Number(object.material.opacity || base), base * 0.27);
      object.material.needsUpdate = true;
    });
  }
  if (typeof funnelMat !== 'undefined' && funnelMat) {
    funnelMat.opacity = Math.min(Number(funnelMat.opacity || 0.12), 0.105);
    funnelMat.needsUpdate = true;
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
    outerFunnelMat.opacity = Math.min(Number(outerFunnelMat.opacity || 0.05), 0.045);
    outerFunnelMat.needsUpdate = true;
  }
  const middleVortex = scene?.getObjectByName?.('ProductionMiddleVortex');
  if (middleVortex?.material) {
    middleVortex.material.opacity = 0.035;
    middleVortex.material.needsUpdate = true;
  }
  const darkCore = scene?.getObjectByName?.('ProductionDarkCore');
  if (darkCore?.material) {
    darkCore.material.opacity = 0.15;
    darkCore.material.color?.set?.('#1c2b31');
    darkCore.material.needsUpdate = true;
  }
};

const swVisualHeroSlice6TownPolishRefreshBase = swVisualHeroSlice6RefreshWorld;
swVisualHeroSlice6RefreshWorld = function swVisualHeroSlice6RefreshWorldWithTownPolish(...args) {
  const result = swVisualHeroSlice6TownPolishRefreshBase.apply(this, args);
  swVisualHeroSlice6TownPolishApply();
  return result;
};

const swVisualHeroSlice6TownPolishPrepareQaBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView;
function swVisualHeroSlice6TownPolishPrepareQaView(mode = 'storefront') {
  if (mode !== 'slice6-street' && mode !== 'slice6-corner') {
    return swVisualHeroSlice6TownPolishPrepareQaBase?.(mode) ?? false;
  }
  const prepared = swVisualHeroSlice6TownPolishPrepareQaBase?.('slice6-street') ?? false;
  if (!prepared) return false;
  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  if (!storefront || !camera) return false;
  const x = Number(storefront.x);
  const z = Number(storefront.z);
  const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
  if (mode === 'slice6-corner') {
    camera.position.set(x + 50, y + 14, z - 35);
    camera.lookAt(x + 13, y + 5.5, z + 13);
  } else {
    camera.position.set(x + 36, y + 12, z - 24);
    camera.lookAt(x + 8, y + 5.0, z + 5);
  }
  swVisualUpdate(0, 1000);
  renderer.render(scene, camera);
  return true;
}

const swVisualHeroSlice6TownPolishSnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithSlice6TownPolish() {
  const base = swVisualHeroSlice6TownPolishSnapshotBase();
  return Object.freeze({
    ...base,
    worldIdentity: Object.freeze({
      ...(base.worldIdentity || {}),
      townPolish: Object.freeze({
        version: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
        breakBlocktownVersion: THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_VERSION,
        profile: swVisualHeroSlice6TownPolishState.profile,
        waterTowerStyled: swVisualHeroSlice6TownPolishState.waterTowerStyled,
        waterTowerBaseColor: swVisualHeroSlice6TownPolishState.waterTowerBaseColor,
        mainStreetRooflineCount: swVisualHeroSlice6TownPolishState.mainStreetRooflineCount,
        compressedTallBuildingCount: swVisualHeroSlice6TownPolishState.compressedTallBuildingCount,
        falseFrontCount: swVisualHeroSlice6TownPolishState.falseFrontCount,
        awningCount: swVisualHeroSlice6TownPolishState.awningCount,
        roadFacingFacadeCount: swVisualHeroSlice6TownPolishState.roadFacingFacadeCount,
        footprintVarietyCount: swVisualHeroSlice6TownPolishState.footprintVarietyCount,
        detailedStorefrontCount: swVisualHeroSlice6TownPolishState.detailedStorefrontCount,
        storefrontArchetypeCount: swVisualHeroSlice6TownPolishState.storefrontArchetypeCount,
        parapetCount: swVisualHeroSlice6TownPolishState.parapetCount,
        signageCount: swVisualHeroSlice6TownPolishState.signageCount,
        streetPropCount: swVisualHeroSlice6TownPolishState.streetPropCount,
        stormRetaperedShellCount: swVisualHeroSlice6TownPolishState.stormRetaperedShellCount,
        stormRetaperedWispCount: swVisualHeroSlice6TownPolishState.stormRetaperedWispCount,
        stormDebrisClusterCount: swVisualHeroSlice6TownPolishState.stormDebrisClusterCount,
        presentationOnly: true,
      }),
    }),
    heroSlice6TownPolishVersion: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
    heroSlice6BlocktownBreakVersion: THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_VERSION,
    heroSlice6TownPolishLastError: swVisualHeroSlice6TownPolishState.lastError,
  });
};

const swVisualHeroSlice6TownPolishBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice6TownPolishBridgeBase,
  getSnapshot: swVisualSnapshot,
  prepareQaView: swVisualHeroSlice6TownPolishPrepareQaView,
  refreshHeroSlice6: swVisualHeroSlice6RefreshWorld,
  heroSlice6TownPolishVersion: THREEJS_VISUAL_HERO_SLICE6_TOWN_POLISH_VERSION,
  heroSlice6BlocktownBreakVersion: THREEJS_VISUAL_HERO_SLICE6_BLOCKTOWN_BREAK_VERSION,
});

Promise.resolve().then(() => swVisualHeroSlice6TownPolishApply());
// [SW:VISUAL:HERO_SLICE6:TOWN_POLISH:END]
