// ============================================================================
// [SW:FEEL:001_DESTRUCTION_CONSEQUENCE]
// Bounded destruction presentation & consequence layer for Severe Weather Warning.
// Consumes authoritative lethal-destruction events and damage stages without
// altering gameplay truth (no health, damage, collision, scoring, combo,
// targetability, abilities, storm movement, or animal safety are changed).
// ============================================================================
const SW_FEEL_001_MARKER = 'SW_FEEL_001_DESTRUCTION_CONSEQUENCE_V1';

const swFeel001State = {
  version: SW_FEEL_001_MARKER,
  initialized: true,
  totalDestructionsHandled: 0,
  totalDamageStagesHandled: 0,
  activeDebrisCount: 0,
  activeShockwaveCount: 0,
  activeDustPuffCount: 0,
  maxConcurrentDebris: 0,
  materialBreakdown: {
    wood: 0,
    masonry: 0,
    glass: 0,
    metal: 0,
    tree: 0,
    carnival: 0,
    silo: 0,
    concrete: 0,
    other: 0,
  },
  lastEvent: null,
  poolStats: {
    debrisPoolSize: 48,
    shockwavePoolSize: 8,
    dustPoolSize: 24,
    recycledCount: 0,
  },
  resetsCount: 0,
};

// --- PRE-ALLOCATED POOLS & SHARED GEOMETRIES ---
let swFeel001PoolsInitialized = false;
const SW_FEEL_001_MAX_DEBRIS = 48;
const SW_FEEL_001_MAX_SHOCKWAVES = 8;
const SW_FEEL_001_MAX_DUST = 24;

const swFeel001DebrisPool = [];
const swFeel001ShockwavePool = [];
const swFeel001DustPool = [];
let swFeel001EffectsGroup = null;

let swFeel001Geometries = null;
let swFeel001Materials = null;

function swFeel001InitGeometriesAndMaterials() {
  if (swFeel001Geometries) return;
  if (typeof THREE === 'undefined') return;

  swFeel001Geometries = {
    woodPlank: new THREE.BoxGeometry(0.35, 1.85, 0.35),
    woodShingle: new THREE.BoxGeometry(0.75, 0.12, 0.75),
    brick: new THREE.BoxGeometry(0.85, 0.45, 0.65),
    glassShard: new THREE.PlaneGeometry(0.7, 0.7),
    metalPlate: new THREE.BoxGeometry(1.2, 0.1, 0.9),
    foliage: new THREE.DodecahedronGeometry(0.8, 0),
    confetti: new THREE.PlaneGeometry(0.55, 0.35),
    dustPuff: new THREE.DodecahedronGeometry(1.1, 1),
    shockRing: new THREE.RingGeometry(0.5, 2.6, 16),
  };

  swFeel001Materials = {
    wood: new THREE.MeshStandardMaterial({ color: '#854d0e', roughness: 0.85 }),
    shingle: new THREE.MeshStandardMaterial({ color: '#44403c', roughness: 0.9 }),
    masonry: new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 0.82 }),
    mortar: new THREE.MeshStandardMaterial({ color: '#a8a29e', roughness: 0.92 }),
    glass: new THREE.MeshStandardMaterial({
      color: '#e0f2fe',
      emissive: '#38bdf8',
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.65,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    }),
    metal: new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.45, metalness: 0.75 }),
    foliage: new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.88 }),
    carnivalRed: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.6 }),
    carnivalGold: new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.6 }),
    carnivalCyan: new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.6 }),
    dust: new THREE.MeshBasicMaterial({
      color: '#cbd5e1',
      transparent: true,
      opacity: 0.6,
    }),
    shockwave: new THREE.MeshBasicMaterial({
      color: '#f8fafc',
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    }),
  };
}

function swFeel001EnsurePools() {
  if (swFeel001PoolsInitialized || typeof scene === 'undefined' || typeof THREE === 'undefined') return;
  swFeel001InitGeometriesAndMaterials();

  if (!swFeel001EffectsGroup) {
    swFeel001EffectsGroup = new THREE.Group();
    swFeel001EffectsGroup.name = 'SWFeel001EffectsGroup';
    scene.add(swFeel001EffectsGroup);
  }

  // Debris pool
  for (let i = 0; i < SW_FEEL_001_MAX_DEBRIS; i++) {
    const mesh = new THREE.Mesh(swFeel001Geometries.woodPlank, swFeel001Materials.wood);
    mesh.visible = false;
    swFeel001EffectsGroup.add(mesh);
    swFeel001DebrisPool.push({
      mesh,
      active: false,
      vx: 0, vy: 0, vz: 0,
      rotX: 0, rotY: 0, rotZ: 0,
      life: 0,
      maxLife: 1.0,
      bounced: false,
    });
  }

  // Shockwave ring pool
  for (let i = 0; i < SW_FEEL_001_MAX_SHOCKWAVES; i++) {
    const mesh = new THREE.Mesh(swFeel001Geometries.shockRing, swFeel001Materials.shockwave.clone());
    mesh.rotation.x = -Math.PI / 2;
    mesh.visible = false;
    swFeel001EffectsGroup.add(mesh);
    swFeel001ShockwavePool.push({
      mesh,
      active: false,
      scale: 0.2,
      maxScale: 2.2,
      life: 0,
      maxLife: 0.45,
    });
  }

  // Ground dust puff pool
  for (let i = 0; i < SW_FEEL_001_MAX_DUST; i++) {
    const mesh = new THREE.Mesh(swFeel001Geometries.dustPuff, swFeel001Materials.dust.clone());
    mesh.visible = false;
    swFeel001EffectsGroup.add(mesh);
    swFeel001DustPool.push({
      mesh,
      active: false,
      vx: 0, vy: 0, vz: 0,
      life: 0,
      maxLife: 0.8,
      scale: 0.5,
    });
  }

  swFeel001PoolsInitialized = true;
}

function swFeel001GetMaterialFamily(target) {
  if (!target) return 'other';
  if (target.materialFamily) return target.materialFamily;
  const kind = String(target.kind || '').toLowerCase();
  if (target.isTree || kind.includes('tree') || kind.includes('windbreak')) return 'tree';
  if (kind.includes('cottage') || kind.includes('garage') || kind.includes('barn') || kind.includes('farm')) return 'wood';
  if (kind.includes('rowhouse') || kind.includes('apartment') || kind.includes('brick')) return 'masonry';
  if (kind.includes('shop') || kind.includes('office') || target.hasGlass) return 'glass';
  if (kind.includes('warehouse') || kind.includes('foundry') || kind.includes('service')) return 'metal';
  if (kind.includes('booth') || kind.includes('pavilion') || kind.includes('fair') || kind.includes('carnival')) return 'carnival';
  if (kind.includes('silo')) return 'silo';
  if (kind.includes('civic') || kind.includes('substation')) return 'concrete';
  return 'other';
}

function swFeel001SpawnDebrisFragment(x, y, z, vx, vy, vz, geometry, material, life = 1.8) {
  swFeel001EnsurePools();
  const entry = swFeel001DebrisPool.find(item => !item.active);
  if (!entry) return null;

  entry.active = true;
  entry.mesh.geometry = geometry;
  entry.mesh.material = material;
  entry.mesh.position.set(x, y, z);
  entry.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  entry.mesh.visible = true;
  entry.vx = vx;
  entry.vy = vy;
  entry.vz = vz;
  entry.rotX = (Math.random() - 0.5) * 8.0;
  entry.rotY = (Math.random() - 0.5) * 8.0;
  entry.rotZ = (Math.random() - 0.5) * 8.0;
  entry.life = life;
  entry.maxLife = life;
  entry.bounced = false;

  swFeel001State.activeDebrisCount = swFeel001DebrisPool.filter(item => item.active).length;
  swFeel001State.maxConcurrentDebris = Math.max(swFeel001State.maxConcurrentDebris, swFeel001State.activeDebrisCount);
  return entry;
}

function swFeel001SpawnShockwave(x, z, scaleMultiplier = 1.0) {
  swFeel001EnsurePools();
  const entry = swFeel001ShockwavePool.find(item => !item.active);
  if (!entry) return null;

  const groundY = (typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0) + 0.12;
  entry.active = true;
  entry.mesh.position.set(x, groundY, z);
  entry.scale = 0.25;
  entry.maxScale = (2.2 + Math.random() * 0.8) * scaleMultiplier;
  entry.mesh.scale.set(entry.scale, entry.scale, 1);
  entry.mesh.material.opacity = 0.75;
  entry.mesh.visible = true;
  entry.life = 0.42;
  entry.maxLife = 0.42;

  swFeel001State.activeShockwaveCount = swFeel001ShockwavePool.filter(item => item.active).length;
  return entry;
}

function swFeel001SpawnDustPuff(x, y, z, vx, vy, vz, life = 0.8) {
  swFeel001EnsurePools();
  const entry = swFeel001DustPool.find(item => !item.active);
  if (!entry) return null;

  entry.active = true;
  entry.mesh.position.set(x, y, z);
  entry.mesh.visible = true;
  entry.mesh.material.opacity = 0.55;
  entry.vx = vx;
  entry.vy = vy;
  entry.vz = vz;
  entry.scale = 0.5;
  entry.life = life;
  entry.maxLife = life;

  swFeel001State.activeDustPuffCount = swFeel001DustPool.filter(item => item.active).length;
  return entry;
}

// --- CORE FEEL EVENT: CYCLONIC DEBRIS & IMPACT PRESENTATION ---
function swFeel001PresentDestruction(target, source = 'storm') {
  if (!target) return;
  swFeel001EnsurePools();

  const x = target.x;
  const z = target.z;
  const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
  const materialFamily = swFeel001GetMaterialFamily(target);
  const footprint = target.meshData?.footprint || 5;

  swFeel001State.totalDestructionsHandled += 1;
  swFeel001State.materialBreakdown[materialFamily] = (swFeel001State.materialBreakdown[materialFamily] || 0) + 1;
  swFeel001State.lastEvent = {
    x, z,
    kind: target.kind || 'unknown',
    materialFamily,
    footprint,
    time: typeof performance !== 'undefined' ? performance.now() : Date.now(),
  };

  // Cyclonic vortex calculation relative to storm center
  const stormX = (typeof storm !== 'undefined' && storm?.pos) ? storm.pos.x : x;
  const stormZ = (typeof storm !== 'undefined' && storm?.pos) ? storm.pos.z : z;
  const dx = x - stormX;
  const dz = z - stormZ;
  const dist = Math.hypot(dx, dz) || 1;

  // Tangential velocity vector (counterclockwise cyclonic rotation)
  const tanX = -dz / dist;
  const tanZ = dx / dist;
  // Outward radial ejection vector
  const radX = dx / dist;
  const radZ = dz / dist;

  // Spawn ground shockwave
  swFeel001SpawnShockwave(x, z, THREE.MathUtils.clamp(footprint * 0.16, 0.8, 2.4));

  // Determine material-tailored geometries and materials
  let primaryGeo = swFeel001Geometries.woodPlank;
  let primaryMat = swFeel001Materials.wood;
  let secondaryGeo = swFeel001Geometries.woodShingle;
  let secondaryMat = swFeel001Materials.shingle;
  let count = footprint > 10 ? 10 : (footprint > 6 ? 7 : 5);

  if (materialFamily === 'masonry') {
    primaryGeo = swFeel001Geometries.brick;
    primaryMat = swFeel001Materials.masonry;
    secondaryGeo = swFeel001Geometries.brick;
    secondaryMat = swFeel001Materials.mortar;
  } else if (materialFamily === 'glass') {
    primaryGeo = swFeel001Geometries.glassShard;
    primaryMat = swFeel001Materials.glass;
    secondaryGeo = swFeel001Geometries.brick;
    secondaryMat = swFeel001Materials.mortar;
  } else if (materialFamily === 'metal' || materialFamily === 'silo') {
    primaryGeo = swFeel001Geometries.metalPlate;
    primaryMat = swFeel001Materials.metal;
    secondaryGeo = swFeel001Geometries.brick;
    secondaryMat = swFeel001Materials.metal;
  } else if (materialFamily === 'tree') {
    primaryGeo = swFeel001Geometries.foliage;
    primaryMat = swFeel001Materials.foliage;
    secondaryGeo = swFeel001Geometries.woodPlank;
    secondaryMat = swFeel001Materials.wood;
    count = 4;
  } else if (materialFamily === 'carnival') {
    primaryGeo = swFeel001Geometries.confetti;
    primaryMat = (Math.random() < 0.5) ? swFeel001Materials.carnivalRed : swFeel001Materials.carnivalGold;
    secondaryGeo = swFeel001Geometries.woodPlank;
    secondaryMat = swFeel001Materials.carnivalCyan;
  }

  // Spawn cyclonic debris fragments
  for (let i = 0; i < count; i++) {
    const isSecondary = (i % 2 === 1);
    const geo = isSecondary ? secondaryGeo : primaryGeo;
    const mat = isSecondary ? secondaryMat : primaryMat;

    const speed = 12.0 + Math.random() * 14.0;
    const tangentWeight = 0.72 + Math.random() * 0.45;
    const radialWeight = 0.28 + Math.random() * 0.35;

    const vx = (tanX * tangentWeight + radX * radialWeight) * speed + (Math.random() - 0.5) * 4.0;
    const vy = 9.0 + Math.random() * 15.0; // Updraft lift
    const vz = (tanZ * tangentWeight + radZ * radialWeight) * speed + (Math.random() - 0.5) * 4.0;

    const spawnX = x + (Math.random() - 0.5) * (footprint * 0.5);
    const spawnY = groundY + 1.5 + Math.random() * 3.5;
    const spawnZ = z + (Math.random() - 0.5) * (footprint * 0.5);

    swFeel001SpawnDebrisFragment(spawnX, spawnY, spawnZ, vx, vy, vz, geo, mat, 1.4 + Math.random() * 0.8);
  }

  // Ground dust cloud
  for (let d = 0; d < 3; d++) {
    const dustVx = (Math.random() - 0.5) * 6.0 + tanX * 3.0;
    const dustVy = 1.2 + Math.random() * 2.5;
    const dustVz = (Math.random() - 0.5) * 6.0 + tanZ * 3.0;
    swFeel001SpawnDustPuff(
      x + (Math.random() - 0.5) * 3.0,
      groundY + 0.8 + Math.random() * 1.5,
      z + (Math.random() - 0.5) * 3.0,
      dustVx, dustVy, dustVz,
      0.6 + Math.random() * 0.4
    );
  }
}

function swFeel001PresentDamageStage(target) {
  if (!target) return;
  swFeel001EnsurePools();

  swFeel001State.totalDamageStagesHandled += 1;
  const x = target.x;
  const z = target.z;
  const groundY = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;

  // Spawn small puff & splinter burst
  for (let i = 0; i < 2; i++) {
    swFeel001SpawnDustPuff(
      x + (Math.random() - 0.5) * 2.5,
      groundY + 2.5 + Math.random() * 2.0,
      z + (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 4.0,
      2.0 + Math.random() * 3.0,
      (Math.random() - 0.5) * 4.0,
      0.5
    );
  }
}

// --- UPDATE & RENDER HOOK ---
function swFeel001Update(delta = 0.016) {
  if (!swFeel001PoolsInitialized) return;
  const dt = Math.min(0.05, Math.max(0.001, Number(delta) || 0.016));
  const gravity = 26.0;

  // Update debris fragments
  let activeDebris = 0;
  for (let i = 0; i < swFeel001DebrisPool.length; i++) {
    const item = swFeel001DebrisPool[i];
    if (!item.active) continue;

    item.life -= dt;
    if (item.life <= 0) {
      item.active = false;
      item.mesh.visible = false;
      swFeel001State.poolStats.recycledCount += 1;
      continue;
    }

    activeDebris += 1;
    item.vy -= gravity * dt;
    item.vx *= (1.0 - 0.45 * dt);
    item.vz *= (1.0 - 0.45 * dt);

    item.mesh.position.x += item.vx * dt;
    item.mesh.position.y += item.vy * dt;
    item.mesh.position.z += item.vz * dt;

    item.mesh.rotation.x += item.rotX * dt;
    item.mesh.rotation.y += item.rotY * dt;
    item.mesh.rotation.z += item.rotZ * dt;

    // Ground bounce & clamp
    const groundY = typeof terrainHeightAt === 'function'
      ? terrainHeightAt(item.mesh.position.x, item.mesh.position.z)
      : 0;

    if (item.mesh.position.y <= groundY + 0.25) {
      item.mesh.position.y = groundY + 0.25;
      if (!item.bounced && item.vy < -3.0) {
        item.vy = -item.vy * 0.32;
        item.vx *= 0.6;
        item.vz *= 0.6;
        item.bounced = true;
      } else {
        item.vy = 0;
        item.vx *= 0.85;
        item.vz *= 0.85;
      }
    }
  }
  swFeel001State.activeDebrisCount = activeDebris;

  // Update shockwaves
  let activeShockwaves = 0;
  for (let i = 0; i < swFeel001ShockwavePool.length; i++) {
    const item = swFeel001ShockwavePool[i];
    if (!item.active) continue;

    item.life -= dt;
    if (item.life <= 0) {
      item.active = false;
      item.mesh.visible = false;
      continue;
    }

    activeShockwaves += 1;
    const progress = 1.0 - (item.life / item.maxLife);
    item.scale = 0.25 + (item.maxScale - 0.25) * progress;
    item.mesh.scale.set(item.scale, item.scale, 1);
    item.mesh.material.opacity = Math.max(0, 0.75 * (1.0 - progress));
  }
  swFeel001State.activeShockwaveCount = activeShockwaves;

  // Update dust puffs
  let activeDust = 0;
  for (let i = 0; i < swFeel001DustPool.length; i++) {
    const item = swFeel001DustPool[i];
    if (!item.active) continue;

    item.life -= dt;
    if (item.life <= 0) {
      item.active = false;
      item.mesh.visible = false;
      continue;
    }

    activeDust += 1;
    const progress = 1.0 - (item.life / item.maxLife);
    item.mesh.position.x += item.vx * dt;
    item.mesh.position.y += item.vy * dt;
    item.mesh.position.z += item.vz * dt;

    const curScale = 0.5 + 1.2 * progress;
    item.mesh.scale.set(curScale, curScale, curScale);
    item.mesh.material.opacity = Math.max(0, 0.55 * (1.0 - progress));
  }
  swFeel001State.activeDustPuffCount = activeDust;
}

// --- RESET & LIFECYCLE CLEANUP ---
function swFeel001ResetAll() {
  if (!swFeel001PoolsInitialized) return;
  for (let i = 0; i < swFeel001DebrisPool.length; i++) {
    swFeel001DebrisPool[i].active = false;
    swFeel001DebrisPool[i].mesh.visible = false;
  }
  for (let i = 0; i < swFeel001ShockwavePool.length; i++) {
    swFeel001ShockwavePool[i].active = false;
    swFeel001ShockwavePool[i].mesh.visible = false;
  }
  for (let i = 0; i < swFeel001DustPool.length; i++) {
    swFeel001DustPool[i].active = false;
    swFeel001DustPool[i].mesh.visible = false;
  }
  swFeel001State.activeDebrisCount = 0;
  swFeel001State.activeShockwaveCount = 0;
  swFeel001State.activeDustPuffCount = 0;
  swFeel001State.resetsCount += 1;
}

// --- HOOK INTO ACCEPTED RUNTIME SEAMS ---
(() => {
  // Hook into destroyTarget
  if (typeof destroyTarget === 'function') {
    const originalDestroyTarget = destroyTarget;
    destroyTarget = function swFeel001DestroyTargetHook(target, source = 'storm') {
      originalDestroyTarget(target, source);
      try {
        swFeel001PresentDestruction(target, source);
      } catch (err) {
        console.warn('SW-FEEL-001 presentation hook error:', err);
      }
    };
  }

  // Hook into applyTargetDamageStage
  if (typeof applyTargetDamageStage === 'function') {
    const originalApplyDamageStage = applyTargetDamageStage;
    applyTargetDamageStage = function swFeel001ApplyDamageStageHook(target) {
      originalApplyDamageStage(target);
      try {
        swFeel001PresentDamageStage(target);
      } catch (err) {
        console.warn('SW-FEEL-001 damage stage hook error:', err);
      }
    };
  }

  // Hook into renderer.render for per-frame pooled updates
  if (typeof renderer !== 'undefined' && renderer && typeof renderer.render === 'function') {
    const originalRender = renderer.render.bind(renderer);
    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    renderer.render = function swFeel001RenderHook(s, c) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      try {
        swFeel001Update(delta);
      } catch (err) {
        // Safe update
      }
      return originalRender(s, c);
    };
  }

  // Hook into reset/init seams
  if (typeof init3DWorld === 'function') {
    const originalInit3D = init3DWorld;
    init3DWorld = function swFeel001Init3DHook() {
      swFeel001ResetAll();
      return originalInit3D.apply(this, arguments);
    };
  }

  if (typeof quitToMainMenu === 'function') {
    const originalQuit = quitToMainMenu;
    quitToMainMenu = function swFeel001QuitHook() {
      swFeel001ResetAll();
      return originalQuit.apply(this, arguments);
    };
  }
})();

globalThis.getSwFeel001State = function getSwFeel001State() {
  return { ...swFeel001State };
};
globalThis.__SW_FEEL_001_STATE__ = swFeel001State;
globalThis.__SW_FEEL_001_RESET__ = swFeel001ResetAll;
globalThis.__SW_FEEL_001_PRESENT_DESTRUCTION__ = swFeel001PresentDestruction;
// ============================================================================
