// ============================================================================
// [SW:WORLD:007_ATMOSPHERIC_CORRECTION]
// Director correction for rejected secondary-storm presentation.
// Replaces visible saucer / clean-plane storm bodies with bounded overlapping
// atmospheric sprite masses. Presentation only: no gameplay authority writes.
// ============================================================================
const SW_WORLD_007_ATMOSPHERIC_CORRECTION_MARKER = 'SW_WORLD_007_ATMOSPHERIC_CORRECTION_V1';

const swWorld007AtmosphericState = {
  marker: SW_WORLD_007_ATMOSPHERIC_CORRECTION_MARKER,
  supercellBuilds: 0,
  derechoBuilds: 0,
  supercellSprites: 0,
  derechoSprites: 0,
  hiddenSupercellLegacyChildren: 0,
  hiddenDerechoLegacyChildren: 0,
  frames: 0,
};

function swWorld007AtmosNoise(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + (salt + 1) * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function swWorld007AtmosMaterial(color, opacity) {
  const material = new THREE.SpriteMaterial({
    map: swWorld007GetSmokeTexture(),
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: true,
  });
  material.userData.swWorld007Owned = true;
  material.userData.swWorld007AtmosphericCorrection = true;
  return material;
}

function swWorld007AtmosSprite(group, name, material, x, y, z, sx, sy, phase) {
  const sprite = new THREE.Sprite(material);
  sprite.name = name;
  sprite.position.set(x, y, z);
  sprite.scale.set(sx, sy, 1);
  sprite.userData.swWorld007AtmosphericCorrection = true;
  sprite.userData.baseX = x;
  sprite.userData.baseY = y;
  sprite.userData.baseZ = z;
  sprite.userData.phase = phase;
  group.add(sprite);
  return sprite;
}

function swWorld007AtmosHideLegacyParentChildren(parent, keepRoot) {
  if (!parent) return 0;
  let hidden = 0;
  for (const child of parent.children) {
    if (child === keepRoot || child?.userData?.swWorld007AtmosphericCorrection) continue;
    if (child.visible !== false) hidden += 1;
    child.visible = false;
  }
  return hidden;
}

function swWorld007AtmosHideOwnedPrimitiveGroups(root) {
  if (!root) return;
  for (const groupName of [
    'SWWorld007SupercellAnvilGroup',
    'SWWorld007SupercellMesoCore',
    'SWWorld007SupercellWallCloud',
    'SWWorld007SupercellInflowCollar',
    'SWWorld007SupercellPuffOrbits',
    'SWWorld007SupercellHailShaft',
    'SWWorld007DerechoShelfArcGroup',
    'SWWorld007DerechoRollClouds',
    'SWWorld007DerechoMicroburstStreaks',
    'SWWorld007DerechoOutflowDust',
  ]) {
    const node = root.getObjectByName?.(groupName);
    if (node) node.visible = false;
  }
}

function swWorld007BuildSupercellAtmosphericCorrection(root, parent) {
  if (!root || !parent) return null;
  swWorld007AtmosHideOwnedPrimitiveGroups(root);
  swWorld007AtmosphericState.hiddenSupercellLegacyChildren = swWorld007AtmosHideLegacyParentChildren(parent, root);

  const prior = root.getObjectByName?.('SWWorld007SupercellAtmosphericMass');
  if (prior) root.remove(prior);

  const correction = new THREE.Group();
  correction.name = 'SWWorld007SupercellAtmosphericMass';
  correction.userData.swWorld007Owned = true;
  correction.userData.swWorld007AtmosphericCorrection = true;
  root.add(correction);

  const anvil = new THREE.Group();
  anvil.name = 'SWWorld007SupercellAtmosphericAnvil';
  correction.add(anvil);
  const updraft = new THREE.Group();
  updraft.name = 'SWWorld007SupercellAtmosphericUpdraft';
  correction.add(updraft);
  const wall = new THREE.Group();
  wall.name = 'SWWorld007SupercellAtmosphericWallCloud';
  correction.add(wall);
  const precip = new THREE.Group();
  precip.name = 'SWWorld007SupercellAtmosphericPrecip';
  correction.add(precip);
  const ground = new THREE.Group();
  ground.name = 'SWWorld007SupercellAtmosphericGround';
  correction.add(ground);

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const dark = swWorld007AtmosMaterial('#111827', 0.82);
  const slate = swWorld007AtmosMaterial('#273548', 0.76);
  const cool = swWorld007AtmosMaterial('#334155', 0.68);
  const under = swWorld007AtmosMaterial('#1f2937', 0.88);
  const rain = swWorld007AtmosMaterial('#94a3b8', 0.22);
  const dust = swWorld007AtmosMaterial('#4b5563', 0.42);
  const palette = [dark, slate, cool, under];

  const anvilCount = mobile ? 24 : 34;
  for (let i = 0; i < anvilCount; i++) {
    const nx = swWorld007AtmosNoise(i, 1) * 2 - 1;
    const nz = swWorld007AtmosNoise(i, 2) * 2 - 1;
    const x = nx * 51 + Math.sin(i * 1.7) * 5;
    const z = nz * 23 + Math.cos(i * 0.83) * 4;
    const y = 31 + swWorld007AtmosNoise(i, 3) * 11 - Math.abs(nx) * 2.5;
    const sx = 17 + swWorld007AtmosNoise(i, 4) * 18;
    const sy = 8 + swWorld007AtmosNoise(i, 5) * 9;
    swWorld007AtmosSprite(anvil, `SWWorld007AtmosSupercellAnvil_${i + 1}`, palette[i % palette.length], x, y, z, sx, sy, i * 0.61);
  }

  const updraftCount = mobile ? 17 : 24;
  for (let i = 0; i < updraftCount; i++) {
    const f = i / Math.max(1, updraftCount - 1);
    const radius = 5 + (1 - f) * 8 + swWorld007AtmosNoise(i, 6) * 4;
    const angle = i * 2.17 + swWorld007AtmosNoise(i, 7) * 1.2;
    const x = Math.cos(angle) * radius + Math.sin(i * 0.71) * 3;
    const z = Math.sin(angle) * radius * 0.78 + Math.cos(i * 0.53) * 3;
    const y = 8 + f * 27 + swWorld007AtmosNoise(i, 8) * 3;
    const sx = 12 + swWorld007AtmosNoise(i, 9) * 9 + f * 4;
    const sy = 10 + swWorld007AtmosNoise(i, 10) * 8;
    swWorld007AtmosSprite(updraft, `SWWorld007AtmosSupercellUpdraft_${i + 1}`, palette[(i + 1) % palette.length], x, y, z, sx, sy, i * 0.83);
  }

  const wallCount = mobile ? 13 : 19;
  for (let i = 0; i < wallCount; i++) {
    const angle = i * 2.399;
    const radius = 5 + swWorld007AtmosNoise(i, 11) * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius * 0.72;
    const y = 8 + swWorld007AtmosNoise(i, 12) * 7;
    const sx = 10 + swWorld007AtmosNoise(i, 13) * 9;
    const sy = 7 + swWorld007AtmosNoise(i, 14) * 6;
    swWorld007AtmosSprite(wall, `SWWorld007AtmosSupercellWall_${i + 1}`, under, x, y, z, sx, sy, i * 1.13);
  }

  const precipCount = mobile ? 11 : 16;
  for (let i = 0; i < precipCount; i++) {
    const x = 7 + swWorld007AtmosNoise(i, 15) * 28;
    const z = -16 + swWorld007AtmosNoise(i, 16) * 36;
    const y = 12 + swWorld007AtmosNoise(i, 17) * 8;
    const sx = 4 + swWorld007AtmosNoise(i, 18) * 4;
    const sy = 18 + swWorld007AtmosNoise(i, 19) * 13;
    swWorld007AtmosSprite(precip, `SWWorld007AtmosSupercellRain_${i + 1}`, rain, x, y, z, sx, sy, i * 0.97);
  }

  const groundCount = mobile ? 9 : 13;
  for (let i = 0; i < groundCount; i++) {
    const angle = i * 2.27;
    const radius = 8 + swWorld007AtmosNoise(i, 20) * 15;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = 1.6 + swWorld007AtmosNoise(i, 21) * 2.3;
    const sx = 9 + swWorld007AtmosNoise(i, 22) * 8;
    const sy = 5 + swWorld007AtmosNoise(i, 23) * 4;
    swWorld007AtmosSprite(ground, `SWWorld007AtmosSupercellGround_${i + 1}`, dust, x, y, z, sx, sy, i * 1.37);
  }

  swWorld007AtmosphericState.supercellBuilds += 1;
  swWorld007AtmosphericState.supercellSprites = anvilCount + updraftCount + wallCount + precipCount + groundCount;
  return correction;
}

function swWorld007BuildDerechoAtmosphericCorrection(root, parent) {
  if (!root || !parent) return null;
  swWorld007AtmosHideOwnedPrimitiveGroups(root);
  swWorld007AtmosphericState.hiddenDerechoLegacyChildren = swWorld007AtmosHideLegacyParentChildren(parent, root);

  const prior = root.getObjectByName?.('SWWorld007DerechoAtmosphericWall');
  if (prior) root.remove(prior);

  const correction = new THREE.Group();
  correction.name = 'SWWorld007DerechoAtmosphericWall';
  correction.userData.swWorld007Owned = true;
  correction.userData.swWorld007AtmosphericCorrection = true;
  root.add(correction);

  const shelf = new THREE.Group();
  shelf.name = 'SWWorld007DerechoAtmosphericShelf';
  correction.add(shelf);
  const rolls = new THREE.Group();
  rolls.name = 'SWWorld007DerechoAtmosphericRolls';
  correction.add(rolls);
  const rainCurtain = new THREE.Group();
  rainCurtain.name = 'SWWorld007DerechoAtmosphericRain';
  correction.add(rainCurtain);
  const outflow = new THREE.Group();
  outflow.name = 'SWWorld007DerechoAtmosphericOutflow';
  correction.add(outflow);

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const charcoal = swWorld007AtmosMaterial('#171f2b', 0.86);
  const slate = swWorld007AtmosMaterial('#34414d', 0.78);
  const greenGray = swWorld007AtmosMaterial('#344b49', 0.72);
  const underside = swWorld007AtmosMaterial('#202a31', 0.9);
  const rain = swWorld007AtmosMaterial('#94a3b8', 0.22);
  const dust = swWorld007AtmosMaterial('#52525b', 0.42);
  const palette = [charcoal, slate, greenGray, underside];

  const shelfCount = mobile ? 30 : 42;
  for (let i = 0; i < shelfCount; i++) {
    const span = shelfCount === 1 ? 0 : (i / (shelfCount - 1)) * 2 - 1;
    const bow = Math.cos(span * Math.PI * 0.5);
    const x = span * 61 + (swWorld007AtmosNoise(i, 31) - 0.5) * 7;
    const z = 5 + bow * 17 + (swWorld007AtmosNoise(i, 32) - 0.5) * 9;
    const y = 17 + bow * 6 + swWorld007AtmosNoise(i, 33) * 8;
    const sx = 15 + swWorld007AtmosNoise(i, 34) * 11;
    const sy = 9 + swWorld007AtmosNoise(i, 35) * 9;
    swWorld007AtmosSprite(shelf, `SWWorld007AtmosDerechoShelf_${i + 1}`, palette[i % palette.length], x, y, z, sx, sy, i * 0.47);

    if (i % 3 === 0) {
      swWorld007AtmosSprite(
        shelf,
        `SWWorld007AtmosDerechoUpper_${i + 1}`,
        palette[(i + 1) % palette.length],
        x * 0.92,
        y + 8 + swWorld007AtmosNoise(i, 36) * 5,
        z - 6,
        sx * 1.08,
        sy * 0.9,
        i * 0.63
      );
    }
  }

  const rollCount = mobile ? 19 : 27;
  for (let i = 0; i < rollCount; i++) {
    const span = (i / Math.max(1, rollCount - 1)) * 2 - 1;
    const bow = Math.cos(span * Math.PI * 0.5);
    const x = span * 57 + (swWorld007AtmosNoise(i, 37) - 0.5) * 5;
    const z = 18 + bow * 9 + (swWorld007AtmosNoise(i, 38) - 0.5) * 5;
    const y = 8 + swWorld007AtmosNoise(i, 39) * 6;
    const sx = 13 + swWorld007AtmosNoise(i, 40) * 10;
    const sy = 6 + swWorld007AtmosNoise(i, 41) * 5;
    swWorld007AtmosSprite(rolls, `SWWorld007AtmosDerechoRoll_${i + 1}`, underside, x, y, z, sx, sy, i * 0.91);
  }

  const rainCount = mobile ? 17 : 24;
  for (let i = 0; i < rainCount; i++) {
    const span = (i / Math.max(1, rainCount - 1)) * 2 - 1;
    const x = span * 56 + (swWorld007AtmosNoise(i, 42) - 0.5) * 5;
    const z = 4 + swWorld007AtmosNoise(i, 43) * 18;
    const y = 10 + swWorld007AtmosNoise(i, 44) * 7;
    const sx = 4 + swWorld007AtmosNoise(i, 45) * 4;
    const sy = 21 + swWorld007AtmosNoise(i, 46) * 14;
    swWorld007AtmosSprite(rainCurtain, `SWWorld007AtmosDerechoRain_${i + 1}`, rain, x, y, z, sx, sy, i * 0.77);
  }

  const outflowCount = mobile ? 13 : 19;
  for (let i = 0; i < outflowCount; i++) {
    const span = (i / Math.max(1, outflowCount - 1)) * 2 - 1;
    const x = span * 61 + (swWorld007AtmosNoise(i, 47) - 0.5) * 6;
    const z = 24 + swWorld007AtmosNoise(i, 48) * 9;
    const y = 1.8 + swWorld007AtmosNoise(i, 49) * 2.5;
    const sx = 10 + swWorld007AtmosNoise(i, 50) * 9;
    const sy = 5 + swWorld007AtmosNoise(i, 51) * 5;
    swWorld007AtmosSprite(outflow, `SWWorld007AtmosDerechoOutflow_${i + 1}`, dust, x, y, z, sx, sy, i * 1.17);
  }

  swWorld007AtmosphericState.derechoBuilds += 1;
  swWorld007AtmosphericState.derechoSprites = shelf.children.length + rollCount + rainCount + outflowCount;
  return correction;
}

function swWorld007UpdateAtmosphericCorrection(timeNow) {
  const t = (timeNow || performance.now()) * 0.001;
  swWorld007AtmosphericState.frames += 1;

  const supercell = swWorld007SupercellVisualRoot?.getObjectByName?.('SWWorld007SupercellAtmosphericMass');
  if (supercell) {
    const anvil = supercell.getObjectByName('SWWorld007SupercellAtmosphericAnvil');
    const updraft = supercell.getObjectByName('SWWorld007SupercellAtmosphericUpdraft');
    const wall = supercell.getObjectByName('SWWorld007SupercellAtmosphericWallCloud');
    const precip = supercell.getObjectByName('SWWorld007SupercellAtmosphericPrecip');
    const ground = supercell.getObjectByName('SWWorld007SupercellAtmosphericGround');
    if (anvil) anvil.rotation.y = t * 0.025;
    if (updraft) updraft.rotation.y = -t * 0.11;
    if (wall) wall.rotation.y = t * 0.16;
    for (const group of [anvil, updraft, wall, precip, ground]) {
      group?.children?.forEach((sprite) => {
        const phase = Number(sprite.userData?.phase || 0);
        const baseY = Number(sprite.userData?.baseY || sprite.position.y);
        sprite.position.y = baseY + Math.sin(t * 0.9 + phase) * 0.45;
      });
    }
  }

  const derecho = swWorld007DerechoVisualRoot?.getObjectByName?.('SWWorld007DerechoAtmosphericWall');
  if (derecho) {
    const shelf = derecho.getObjectByName('SWWorld007DerechoAtmosphericShelf');
    const rolls = derecho.getObjectByName('SWWorld007DerechoAtmosphericRolls');
    const rainGroup = derecho.getObjectByName('SWWorld007DerechoAtmosphericRain');
    const outflow = derecho.getObjectByName('SWWorld007DerechoAtmosphericOutflow');
    for (const group of [shelf, rolls, rainGroup, outflow]) {
      group?.children?.forEach((sprite) => {
        const phase = Number(sprite.userData?.phase || 0);
        const baseY = Number(sprite.userData?.baseY || sprite.position.y);
        const baseZ = Number(sprite.userData?.baseZ || sprite.position.z);
        sprite.position.y = baseY + Math.sin(t * 0.7 + phase) * 0.35;
        sprite.position.z = baseZ + Math.sin(t * 0.45 + phase) * 0.7;
      });
    }
  }
}

const swWorld007AtmosOriginalBuildSupercell = swWorld007BuildSupercellVisuals;
swWorld007BuildSupercellVisuals = function swWorld007BuildSupercellCorrected(parent) {
  const root = swWorld007AtmosOriginalBuildSupercell(parent);
  swWorld007BuildSupercellAtmosphericCorrection(root, parent);
  return root;
};

const swWorld007AtmosOriginalBuildDerecho = swWorld007BuildDerechoVisuals;
swWorld007BuildDerechoVisuals = function swWorld007BuildDerechoCorrected(parent) {
  const root = swWorld007AtmosOriginalBuildDerecho(parent);
  swWorld007BuildDerechoAtmosphericCorrection(root, parent);
  return root;
};

const swWorld007AtmosOriginalUpdate = swWorld007UpdateSecondaryStormVisuals;
swWorld007UpdateSecondaryStormVisuals = function swWorld007UpdateSecondaryStormVisualsCorrected(timeNow) {
  swWorld007AtmosOriginalUpdate(timeNow);
  swWorld007UpdateAtmosphericCorrection(timeNow);
};

const swWorld007AtmosOriginalState = globalThis.getSwWorld007State;
globalThis.getSwWorld007State = function getSwWorld007StateWithAtmosphericCorrection() {
  const base = swWorld007AtmosOriginalState();
  return Object.freeze({
    ...base,
    atmosphericCorrection: {
      marker: SW_WORLD_007_ATMOSPHERIC_CORRECTION_MARKER,
      supercellSprites: swWorld007AtmosphericState.supercellSprites,
      derechoSprites: swWorld007AtmosphericState.derechoSprites,
      hiddenSupercellLegacyChildren: swWorld007AtmosphericState.hiddenSupercellLegacyChildren,
      hiddenDerechoLegacyChildren: swWorld007AtmosphericState.hiddenDerechoLegacyChildren,
      frames: swWorld007AtmosphericState.frames,
    },
  });
};

globalThis.getSwWorld007AtmosphericCorrectionState = function getSwWorld007AtmosphericCorrectionState() {
  return Object.freeze({ ...swWorld007AtmosphericState });
};
// [SW:WORLD:007_ATMOSPHERIC_CORRECTION:END]
