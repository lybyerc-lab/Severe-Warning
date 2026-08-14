// ============================================================================
// [SW:WORLD:007_SECONDARY_STORM_FORMS]
// Presentation-only secondary storm visual elevation for Supercell & Derecho.
//
// This module provides stylized, connected, atmospheric Three.js production
// visual hierarchies for Supercell and Derecho storm forms without altering
// any gameplay authority, movement speed, abilities, damage, scoring, or
// site systems. Tornado presentation remains completely untouched.
// ============================================================================
const SW_WORLD_007_MARKER = 'SW_WORLD_007_SECONDARY_STORM_FORMS_V1';

const swWorld007State = {
  supercellBuilds: 0,
  supercellFrames: 0,
  derechoBuilds: 0,
  derechoFrames: 0,
  activeStorm: 'tornado',
  supercellMeshesCount: 0,
  derechoMeshesCount: 0,
};

let swWorld007SupercellVisualRoot = null;
let swWorld007DerechoVisualRoot = null;
let swWorld007SmokeTexture = null;

function swWorld007Clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function swWorld007Lerp(a, b, t) {
  return a + (b - a) * t;
}

function swWorld007GetSmokeTexture() {
  if (swWorld007SmokeTexture) return swWorld007SmokeTexture;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  grad.addColorStop(0, 'rgba(255,255,255,0.98)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.65, 'rgba(255,255,255,0.3)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  texture.userData = texture.userData || {};
  texture.userData.swWorld007Owned = true;
  swWorld007SmokeTexture = texture;
  return texture;
}

function swWorld007DisposeOwned(group) {
  if (!group) return;
  const geometries = new Set();
  const materials = new Set();
  const textures = new Set();

  group.traverse((node) => {
    if (node.geometry?.userData?.swWorld007Owned) geometries.add(node.geometry);
    const mats = node.material ? (Array.isArray(node.material) ? node.material : [node.material]) : [];
    mats.filter(Boolean).forEach((m) => {
      if (m.userData?.swWorld007Owned) {
        materials.add(m);
        if (m.map?.userData?.swWorld007Owned) textures.add(m.map);
      }
    });
  });

  geometries.forEach((g) => g.dispose?.());
  materials.forEach((m) => m.dispose?.());
  textures.forEach((t) => t.dispose?.());
  if (group.parent) group.parent.remove(group);
}

// ----------------------------------------------------------------------------
// SUPERCELL VISUAL HIERARCHY
// ----------------------------------------------------------------------------
function swWorld007BuildSupercellVisuals(parent) {
  swWorld007DisposeOwned(swWorld007SupercellVisualRoot);

  const root = new THREE.Group();
  root.name = 'SWWorld007SupercellPresentationRoot';
  root.userData.swWorld007Owned = true;
  parent.add(root);
  swWorld007SupercellVisualRoot = root;

  const texture = swWorld007GetSmokeTexture();
  const isMobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;

  // 1. Anvil Cloud Deck (Upper Stratosphere Sprawl)
  const anvilGroup = new THREE.Group();
  anvilGroup.name = 'SWWorld007SupercellAnvilGroup';
  root.add(anvilGroup);

  const anvilMat1 = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.35,
    metalness: 0.05,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  });
  anvilMat1.userData.swWorld007Owned = true;

  // Upper Overhang Disc
  const upperDiscGeo = new THREE.CylinderGeometry(58, 44, 8, 32);
  upperDiscGeo.userData.swWorld007Owned = true;
  const upperDisc = new THREE.Mesh(upperDiscGeo, anvilMat1);
  upperDisc.position.y = 38;
  anvilGroup.add(upperDisc);

  // Secondary Upper Shelf Ring
  const shelfRingGeo = new THREE.TorusGeometry(48, 7, 12, 32);
  shelfRingGeo.userData.swWorld007Owned = true;
  const shelfRing = new THREE.Mesh(shelfRingGeo, anvilMat1);
  shelfRing.rotation.x = Math.PI / 2;
  shelfRing.position.y = 36;
  anvilGroup.add(shelfRing);

  // Mammatus Underbelly Puffs under the Anvil
  const mammatusGroup = new THREE.Group();
  mammatusGroup.name = 'SWWorld007SupercellMammatus';
  anvilGroup.add(mammatusGroup);

  const mamPuffCount = isMobile ? 12 : 20;
  const mamGeo = new THREE.SphereGeometry(3.6, 10, 8);
  mamGeo.userData.swWorld007Owned = true;
  const mamMat = new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.45,
    transparent: true,
    opacity: 0.88,
  });
  mamMat.userData.swWorld007Owned = true;

  for (let i = 0; i < mamPuffCount; i++) {
    const angle = (i / mamPuffCount) * Math.PI * 2 + (i % 3) * 0.2;
    const rad = 28 + (i % 4) * 5.2;
    const puff = new THREE.Mesh(mamGeo, mamMat);
    puff.name = `SWWorld007MammatusPuff_${i}`;
    puff.position.set(
      Math.cos(angle) * rad,
      32.5 - (i % 3) * 1.4,
      Math.sin(angle) * rad
    );
    puff.scale.set(1.2 + (i % 3) * 0.3, 0.75 + (i % 2) * 0.2, 1.2 + (i % 3) * 0.3);
    puff.userData.baseY = puff.position.y;
    puff.userData.phase = i * 0.8;
    mammatusGroup.add(puff);
  }

  // 2. Mesocyclone Updraft Core (Striated Rotating Barrels)
  const mesoCoreGroup = new THREE.Group();
  mesoCoreGroup.name = 'SWWorld007SupercellMesoCore';
  root.add(mesoCoreGroup);

  const coreTiers = [
    { topR: 38, botR: 26, h: 8, y: 30, color: '#1e293b', op: 0.88 },
    { topR: 28, botR: 19, h: 8, y: 23, color: '#0369a1', op: 0.82 },
    { topR: 20, botR: 12, h: 9, y: 15, color: '#0284c7', op: 0.78 },
  ];

  coreTiers.forEach((tier, idx) => {
    const geo = new THREE.CylinderGeometry(tier.topR, tier.botR, tier.h, 28);
    geo.userData.swWorld007Owned = true;
    const mat = new THREE.MeshStandardMaterial({
      color: tier.color,
      roughness: 0.28,
      transparent: true,
      opacity: tier.op,
      side: THREE.DoubleSide,
    });
    mat.userData.swWorld007Owned = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `SWWorld007MesoTier_${idx + 1}`;
    mesh.position.y = tier.y;
    mesoCoreGroup.add(mesh);
  });

  // 3. Wall Cloud (Mid-Layer Rotating Convective Collar)
  const wallCloudGroup = new THREE.Group();
  wallCloudGroup.name = 'SWWorld007SupercellWallCloud';
  root.add(wallCloudGroup);

  const wallTorusGeo = new THREE.TorusGeometry(18, 4.2, 10, 28);
  wallTorusGeo.userData.swWorld007Owned = true;
  const wallMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    roughness: 0.38,
    transparent: true,
    opacity: 0.9,
  });
  wallMat.userData.swWorld007Owned = true;
  const wallRing = new THREE.Mesh(wallTorusGeo, wallMat);
  wallRing.rotation.x = Math.PI / 2;
  wallRing.position.y = 10.5;
  wallCloudGroup.add(wallRing);

  // 4. Low-Altitude Ground Inflow Cloud Collar
  const inflowGroup = new THREE.Group();
  inflowGroup.name = 'SWWorld007SupercellInflowCollar';
  root.add(inflowGroup);

  const inflowGeo = new THREE.RingGeometry(8, 24, 28);
  inflowGeo.userData.swWorld007Owned = true;
  const inflowMat = new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  inflowMat.userData.swWorld007Owned = true;
  const inflowRing = new THREE.Mesh(inflowGeo, inflowMat);
  inflowRing.rotation.x = -Math.PI / 2;
  inflowRing.position.y = 0.35;
  inflowGroup.add(inflowRing);

  // 5. Volumetric Cloud Sprite Orbits
  const puffOrbitGroup = new THREE.Group();
  puffOrbitGroup.name = 'SWWorld007SupercellPuffOrbits';
  root.add(puffOrbitGroup);

  const puffCount = isMobile ? 14 : 22;
  const colors = ['#0f172a', '#1e293b', '#0369a1', '#334155', '#0f766e'];
  for (let i = 0; i < puffCount; i++) {
    const fraction = i / Math.max(1, puffCount - 1);
    const height = 2.0 + fraction * 34.0;
    const radius = swWorld007Lerp(10.0, 36.0, Math.pow(fraction, 0.7));
    const pivot = new THREE.Group();
    pivot.name = `SWWorld007SupercellOrbit_${i + 1}`;
    pivot.userData.phase = i * 1.256;
    pivot.userData.radius = radius;
    pivot.userData.height = height;
    pivot.userData.speed = 0.4 + (i % 4) * 0.08;

    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: colors[i % colors.length],
      transparent: true,
      opacity: 0.46 + (i % 3) * 0.08,
      depthWrite: false,
      fog: true,
    });
    spriteMat.userData.swWorld007Owned = true;
    const sprite = new THREE.Sprite(spriteMat);
    sprite.name = `SWWorld007SupercellPuff_${i + 1}`;
    const sz = swWorld007Lerp(7.0, 16.0, fraction);
    sprite.scale.set(sz, sz * 0.85, 1);
    sprite.position.set(radius, 0, 0);

    pivot.position.y = height;
    pivot.add(sprite);
    puffOrbitGroup.add(pivot);
  }

  // 6. Hail Shimmer Column (Vertical Precipitation Core)
  const hailShaftGeo = new THREE.CylinderGeometry(10, 16, 28, 16, 1, true);
  hailShaftGeo.userData.swWorld007Owned = true;
  const hailShaftMat = new THREE.MeshBasicMaterial({
    color: '#e0f2fe',
    transparent: true,
    opacity: 0.24,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  hailShaftMat.userData.swWorld007Owned = true;
  const hailShaft = new THREE.Mesh(hailShaftGeo, hailShaftMat);
  hailShaft.name = 'SWWorld007SupercellHailShaft';
  hailShaft.position.y = 14;
  root.add(hailShaft);

  swWorld007State.supercellBuilds += 1;
  swWorld007State.supercellMeshesCount = root.children.length;
  return root;
}

// ----------------------------------------------------------------------------
// DERECHO VISUAL HIERARCHY
// ----------------------------------------------------------------------------
function swWorld007BuildDerechoVisuals(parent) {
  swWorld007DisposeOwned(swWorld007DerechoVisualRoot);

  const root = new THREE.Group();
  root.name = 'SWWorld007DerechoPresentationRoot';
  root.userData.swWorld007Owned = true;
  parent.add(root);
  swWorld007DerechoVisualRoot = root;

  const texture = swWorld007GetSmokeTexture();
  const isMobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;

  // 1. Bow Echo Shelf Cloud Arc (Forward-Sweeping Crescent Overhang)
  const shelfGroup = new THREE.Group();
  shelfGroup.name = 'SWWorld007DerechoShelfArcGroup';
  root.add(shelfGroup);

  // Multi-tiered curved bow shelf segments
  const shelfTiers = [
    { topR: 68, botR: 52, h: 14, y: 22, arc: Math.PI * 0.85, color: '#111827', op: 0.94 },
    { topR: 54, botR: 40, h: 12, y: 15, arc: Math.PI * 0.88, color: '#0f766e', op: 0.86 },
    { topR: 42, botR: 30, h: 10, y: 9, arc: Math.PI * 0.92, color: '#1e293b', op: 0.88 },
  ];

  shelfTiers.forEach((tier, idx) => {
    const geo = new THREE.CylinderGeometry(
      tier.topR,
      tier.botR,
      tier.h,
      32,
      1,
      true,
      -tier.arc / 2,
      tier.arc
    );
    geo.userData.swWorld007Owned = true;
    const mat = new THREE.MeshStandardMaterial({
      color: tier.color,
      roughness: 0.32,
      metalness: 0.08,
      transparent: true,
      opacity: tier.op,
      side: THREE.DoubleSide,
    });
    mat.userData.swWorld007Owned = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = `SWWorld007DerechoShelfTier_${idx + 1}`;
    mesh.position.y = tier.y;
    shelfGroup.add(mesh);
  });

  // 2. Underside "Whale's Mouth" Roll Clouds (Turbulent Torus/Roll Arcs)
  const rollGroup = new THREE.Group();
  rollGroup.name = 'SWWorld007DerechoRollClouds';
  root.add(rollGroup);

  const rollCount = isMobile ? 8 : 14;
  const rollGeo = new THREE.CylinderGeometry(3.5, 3.5, 18, 12);
  rollGeo.userData.swWorld007Owned = true;
  const rollMat = new THREE.MeshStandardMaterial({
    color: '#134e4a', // Severe green/teal storm hue
    roughness: 0.42,
    transparent: true,
    opacity: 0.85,
  });
  rollMat.userData.swWorld007Owned = true;

  for (let i = 0; i < rollCount; i++) {
    const fraction = (i / (rollCount - 1)) - 0.5; // -0.5 to +0.5 across arc
    const angle = fraction * Math.PI * 0.78;
    const rad = 46.0 - Math.abs(fraction) * 8.0;
    const roll = new THREE.Mesh(rollGeo, rollMat);
    roll.name = `SWWorld007DerechoRoll_${i + 1}`;
    roll.position.set(Math.sin(angle) * rad, 11.5 + (i % 3) * 1.2, Math.cos(angle) * rad);
    roll.rotation.z = Math.PI / 2;
    roll.rotation.y = angle;
    roll.scale.set(1.0, 0.8 + (i % 2) * 0.3, 1.2);
    rollGroup.add(roll);
  }

  // 3. Forward Microburst Gale Streaks (Surging Ahead of the Arc)
  const streakGroup = new THREE.Group();
  streakGroup.name = 'SWWorld007DerechoMicroburstStreaks';
  root.add(streakGroup);

  const streakCount = isMobile ? 18 : 32;
  const streakColors = ['#a7f3d0', '#6ee7b7', '#94a3b8', '#cbd5e1'];
  for (let i = 0; i < streakCount; i++) {
    const spanFraction = (i / (streakCount - 1)) - 0.5;
    const xOffset = spanFraction * 68;
    const yPos = 1.2 + (i % 5) * 2.8;
    const zPos = 14 + (i % 4) * 8.5;

    const streakGeo = new THREE.BoxGeometry(0.35, 0.35, 14 + (i % 3) * 6);
    streakGeo.userData.swWorld007Owned = true;
    const streakMat = new THREE.MeshBasicMaterial({
      color: streakColors[i % streakColors.length],
      transparent: true,
      opacity: 0.55 + (i % 3) * 0.12,
      depthWrite: false,
    });
    streakMat.userData.swWorld007Owned = true;
    const streak = new THREE.Mesh(streakGeo, streakMat);
    streak.name = `SWWorld007MicroburstStreak_${i + 1}`;
    streak.position.set(xOffset, yPos, zPos);
    streak.userData.baseZ = zPos;
    streak.userData.speed = 42 + (i % 4) * 18;
    streakGroup.add(streak);
  }

  // 4. Leading Ground Outflow Dust Wall (Turbulent Dust Surging at Ground)
  const dustWallGroup = new THREE.Group();
  dustWallGroup.name = 'SWWorld007DerechoOutflowDust';
  root.add(dustWallGroup);

  const dustPuffCount = isMobile ? 12 : 20;
  for (let i = 0; i < dustPuffCount; i++) {
    const fraction = (i / (dustPuffCount - 1)) - 0.5;
    const xPos = fraction * 74;
    const zPos = 24 + Math.sin(fraction * Math.PI) * 10;
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      color: (i % 2 === 0) ? '#3f3f46' : '#71717a',
      transparent: true,
      opacity: 0.42 + (i % 3) * 0.08,
      depthWrite: false,
      fog: true,
    });
    spriteMat.userData.swWorld007Owned = true;
    const sprite = new THREE.Sprite(spriteMat);
    sprite.name = `SWWorld007OutflowDust_${i + 1}`;
    const sz = 9.0 + (i % 3) * 3.5;
    sprite.scale.set(sz * 1.4, sz, 1);
    sprite.position.set(xPos, 1.8 + (i % 3) * 0.8, zPos);
    sprite.userData.baseX = xPos;
    sprite.userData.baseZ = zPos;
    sprite.userData.phase = i * 0.9;
    dustWallGroup.add(sprite);
  }

  swWorld007State.derechoBuilds += 1;
  swWorld007State.derechoMeshesCount = root.children.length;
  return root;
}

// ----------------------------------------------------------------------------
// ANIMATION & REAL RENDER FRAME UPDATE LOOP
// ----------------------------------------------------------------------------
function swWorld007UpdateSecondaryStormVisuals(timeNow) {
  const tSec = (timeNow || performance.now()) * 0.001;
  const current = typeof currentStorm !== 'undefined' ? currentStorm : 'tornado';
  swWorld007State.activeStorm = current;

  // Ensure parent groups exist
  if (typeof supercellGroup !== 'undefined' && supercellGroup) {
    if (!swWorld007SupercellVisualRoot || swWorld007SupercellVisualRoot.parent !== supercellGroup) {
      swWorld007BuildSupercellVisuals(supercellGroup);
    }
  }
  if (typeof derechoGroup !== 'undefined' && derechoGroup) {
    if (!swWorld007DerechoVisualRoot || swWorld007DerechoVisualRoot.parent !== derechoGroup) {
      swWorld007BuildDerechoVisuals(derechoGroup);
    }
  }

  // 1. Supercell Active Animation
  if (current === 'supercell' && swWorld007SupercellVisualRoot && swWorld007SupercellVisualRoot.visible !== false) {
    swWorld007State.supercellFrames += 1;
    const sRoot = swWorld007SupercellVisualRoot;

    // Anvil slow strategic rotation
    const anvil = sRoot.getObjectByName('SWWorld007SupercellAnvilGroup');
    if (anvil) anvil.rotation.y = tSec * 0.045;

    // Mammatus breathing pulsation
    const mamGroup = sRoot.getObjectByName('SWWorld007SupercellMammatus');
    if (mamGroup) {
      mamGroup.children.forEach((puff) => {
        const p = Number(puff.userData?.phase || 0);
        puff.position.y = (puff.userData?.baseY || 32) + Math.sin(tSec * 1.8 + p) * 0.75;
      });
    }

    // Mesocyclone Updraft Core counter-rotation
    const mesoCore = sRoot.getObjectByName('SWWorld007SupercellMesoCore');
    if (mesoCore) {
      mesoCore.children.forEach((tier, idx) => {
        const dir = (idx % 2 === 0) ? -1 : 1;
        tier.rotation.y = tSec * (0.12 + idx * 0.04) * dir;
      });
    }

    // Wall Cloud rapid rotation
    const wallCloud = sRoot.getObjectByName('SWWorld007SupercellWallCloud');
    if (wallCloud) wallCloud.rotation.y = tSec * 0.22;

    // Ground Inflow Collar sweep
    const inflow = sRoot.getObjectByName('SWWorld007SupercellInflowCollar');
    if (inflow) inflow.rotation.z = -tSec * 0.18;

    // Volumetric cloud orbits
    const puffGroup = sRoot.getObjectByName('SWWorld007SupercellPuffOrbits');
    if (puffGroup) {
      puffGroup.children.forEach((pivot) => {
        const spd = Number(pivot.userData?.speed || 0.5);
        pivot.rotation.y = tSec * spd + Number(pivot.userData?.phase || 0);
      });
    }

    // Hail shaft rotation
    const hailShaft = sRoot.getObjectByName('SWWorld007SupercellHailShaft');
    if (hailShaft) hailShaft.rotation.y = tSec * 0.35;
  }

  // 2. Derecho Active Animation
  if (current === 'derecho' && swWorld007DerechoVisualRoot && swWorld007DerechoVisualRoot.visible !== false) {
    swWorld007State.derechoFrames += 1;
    const dRoot = swWorld007DerechoVisualRoot;

    // Orient shelf arc toward storm velocity / heading if available
    const mx = typeof moveX !== 'undefined' ? moveX : 0;
    const mz = typeof moveZ !== 'undefined' ? moveZ : 1;
    const targetAngle = Math.atan2(mx, mz || 0.001);
    dRoot.rotation.y = THREE.MathUtils.lerp(dRoot.rotation.y, targetAngle, 0.08);

    // Roll clouds convective turbulence
    const rollGroup = dRoot.getObjectByName('SWWorld007DerechoRollClouds');
    if (rollGroup) {
      rollGroup.children.forEach((roll, idx) => {
        roll.rotation.x = tSec * (0.8 + (idx % 3) * 0.2);
      });
    }

    // Forward Microburst Streaks cycling forward
    const streakGroup = dRoot.getObjectByName('SWWorld007DerechoMicroburstStreaks');
    if (streakGroup) {
      streakGroup.children.forEach((streak) => {
        const spd = Number(streak.userData?.speed || 50);
        let z = streak.position.z + spd * 0.016;
        if (z > 48) z = Number(streak.userData?.baseZ || 14);
        streak.position.z = z;
      });
    }

    // Ground Outflow Dust Wall tumbling
    const dustGroup = dRoot.getObjectByName('SWWorld007DerechoOutflowDust');
    if (dustGroup) {
      dustGroup.children.forEach((sprite) => {
        const ph = Number(sprite.userData?.phase || 0);
        const surge = Math.sin(tSec * 2.4 + ph) * 2.8;
        sprite.position.z = Number(sprite.userData?.baseZ || 24) + surge;
        sprite.rotation.z = Math.sin(tSec * 1.5 + ph) * 0.15;
      });
    }
  }
}

// Hook into renderer loop
if (typeof renderer !== 'undefined' && renderer?.render) {
  const swWorld007PrevRender = renderer.render.bind(renderer);
  renderer.render = function swWorld007Render(sceneArg, cameraArg) {
    swWorld007UpdateSecondaryStormVisuals(performance.now());
    return swWorld007PrevRender(sceneArg, cameraArg);
  };
}

globalThis.getSwWorld007State = function getSwWorld007State() {
  const supercellMeshFound = Boolean(scene?.getObjectByName?.('SWWorld007SupercellPresentationRoot'));
  const derechoMeshFound = Boolean(scene?.getObjectByName?.('SWWorld007DerechoPresentationRoot'));
  return Object.freeze({
    marker: SW_WORLD_007_MARKER,
    supercellBuilds: swWorld007State.supercellBuilds,
    supercellFrames: swWorld007State.supercellFrames,
    derechoBuilds: swWorld007State.derechoBuilds,
    derechoFrames: swWorld007State.derechoFrames,
    activeStorm: swWorld007State.activeStorm,
    supercellMeshFound,
    derechoMeshFound,
    supercellDetails: {
      hasAnvil: Boolean(scene?.getObjectByName?.('SWWorld007SupercellAnvilGroup')),
      hasMammatus: Boolean(scene?.getObjectByName?.('SWWorld007SupercellMammatus')),
      hasMesoCore: Boolean(scene?.getObjectByName?.('SWWorld007SupercellMesoCore')),
      hasWallCloud: Boolean(scene?.getObjectByName?.('SWWorld007SupercellWallCloud')),
      hasInflowCollar: Boolean(scene?.getObjectByName?.('SWWorld007SupercellInflowCollar')),
      hasPuffOrbits: Boolean(scene?.getObjectByName?.('SWWorld007SupercellPuffOrbits')),
      hasHailShaft: Boolean(scene?.getObjectByName?.('SWWorld007SupercellHailShaft')),
    },
    derechoDetails: {
      hasShelfArc: Boolean(scene?.getObjectByName?.('SWWorld007DerechoShelfArcGroup')),
      hasRollClouds: Boolean(scene?.getObjectByName?.('SWWorld007DerechoRollClouds')),
      hasMicroburstStreaks: Boolean(scene?.getObjectByName?.('SWWorld007DerechoMicroburstStreaks')),
      hasOutflowDust: Boolean(scene?.getObjectByName?.('SWWorld007DerechoOutflowDust')),
    },
  });
};

globalThis.__SW_WORLD_007_QA__ = {
  selectStorm(type) {
    if (typeof selectStormClass === 'function') {
      selectStormClass(type);
    }
  },
  triggerUpdate(timeMs) {
    swWorld007UpdateSecondaryStormVisuals(timeMs);
  },
};
// [SW:WORLD:007_SECONDARY_STORM_FORMS:END]
