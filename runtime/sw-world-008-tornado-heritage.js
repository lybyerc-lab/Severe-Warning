// ============================================================================
// [SW:WORLD:008_TORNADO_HERITAGE]
// Recover the strongest July Tornado motion while replacing the faceted outer
// presentation with a bounded soft-atmosphere layer inspired by the approved
// tornado visual-development target. Presentation only. No gameplay/camera/
// ability authority.
// ============================================================================
const SW_WORLD_008_TORNADO_HERITAGE_MARKER = 'SW_WORLD_008_TORNADO_HERITAGE_V1';
const SW_WORLD_008_VISUAL_TARGET = 'tornado-visual-dev-reference-v1';

const swWorld008TornadoHeritageState = {
  marker: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  visualTarget: SW_WORLD_008_VISUAL_TARGET,
  frames: 0,
  tornadoFrames: 0,
  secondaryFrames: 0,
  restoredCoreFrames: 0,
  restoredDebrisFrames: 0,
  atmosphereFrames: 0,
  radialBreakupFrames: 0,
  ribbonFramesDemoted: 0,
  lastActiveStorm: null,
  lastError: null,
};

let swWorld008AtmosphereRoot = null;
let swWorld008MistFine = null;
let swWorld008MistBroad = null;
let swWorld008CanopyMist = null;
let swWorld008GroundDust = null;
let swWorld008StormMistTexture = null;
let swWorld008DustMistTexture = null;
const swWorld008PointSeeds = new Map();

function swWorld008ActiveStorm() {
  if (typeof currentStorm !== 'undefined' && currentStorm) return String(currentStorm);
  if (typeof globalThis.getSwWorld007State === 'function') return String(globalThis.getSwWorld007State()?.activeStorm || '');
  return '';
}

function swWorld008SetMaterialOpacity(material, opacity) {
  if (!material) return;
  material.transparent = true;
  material.opacity = opacity;
  material.depthWrite = false;
  material.needsUpdate = true;
}

function swWorld008Clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function swWorld008Hash(index, salt = 0) {
  const value = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function swWorld008CreateMistTexture(kind = 'storm') {
  if (typeof document === 'undefined' || typeof THREE === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, 64, 64);

  const lobes = kind === 'dust'
    ? [[32, 35, 25, 0.78], [22, 34, 17, 0.52], [44, 37, 16, 0.44], [35, 27, 13, 0.30]]
    : [[31, 32, 25, 0.72], [21, 31, 17, 0.46], [43, 29, 18, 0.42], [36, 42, 15, 0.34], [29, 21, 13, 0.28]];

  for (const [x, y, radius, alpha] of lobes) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
    gradient.addColorStop(0.42, `rgba(255,255,255,${alpha * 0.62})`);
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function swWorld008CreatePointField(name, count, size, opacity, color, texture, seedSalt) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  const material = new THREE.PointsMaterial({
    color,
    size,
    map: texture,
    transparent: true,
    opacity,
    alphaTest: 0.015,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  points.name = name;
  points.frustumCulled = false;
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    seeds.push({
      a: swWorld008Hash(i, seedSalt + 1),
      b: swWorld008Hash(i, seedSalt + 2),
      c: swWorld008Hash(i, seedSalt + 3),
      d: swWorld008Hash(i, seedSalt + 4),
    });
  }
  swWorld008PointSeeds.set(points, seeds);
  return points;
}

function swWorld008EnsureAtmosphere() {
  if (swWorld008AtmosphereRoot || typeof THREE === 'undefined' || typeof tornadoGroup === 'undefined' || !tornadoGroup) return;
  swWorld008StormMistTexture = swWorld008CreateMistTexture('storm');
  swWorld008DustMistTexture = swWorld008CreateMistTexture('dust');

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  swWorld008AtmosphereRoot = new THREE.Group();
  swWorld008AtmosphereRoot.name = 'SWWorld008AtmosphereRoot';

  swWorld008MistFine = swWorld008CreatePointField(
    'SWWorld008MistFine', mobile ? 120 : 170, mobile ? 5.0 : 6.2, 0.20, '#8b9da3', swWorld008StormMistTexture, 11,
  );
  swWorld008MistBroad = swWorld008CreatePointField(
    'SWWorld008MistBroad', mobile ? 70 : 100, mobile ? 8.5 : 10.0, 0.10, '#a6b2b5', swWorld008StormMistTexture, 23,
  );
  swWorld008CanopyMist = swWorld008CreatePointField(
    'SWWorld008CanopyMist', mobile ? 85 : 125, mobile ? 10.5 : 12.0, 0.12, '#53636a', swWorld008StormMistTexture, 37,
  );
  swWorld008GroundDust = swWorld008CreatePointField(
    'SWWorld008GroundDust', mobile ? 65 : 95, mobile ? 7.0 : 8.4, 0.24, '#8a6f50', swWorld008DustMistTexture, 51,
  );

  swWorld008AtmosphereRoot.add(swWorld008MistFine, swWorld008MistBroad, swWorld008CanopyMist, swWorld008GroundDust);
  tornadoGroup.add(swWorld008AtmosphereRoot);
}

function swWorld008Centerline(y, now) {
  const factor = swWorld008Clamp(y / 34, 0, 1);
  const t = now * 0.001;
  const middleWeight = 0.35 + Math.sin(factor * Math.PI) * 0.65;
  return {
    x: Math.sin(t * 1.45 + y * 0.165) * factor * 3.2
      + Math.sin(t * 0.73 - y * 0.082) * middleWeight * 1.8,
    z: Math.cos(t * 1.17 + y * 0.142) * factor * 2.8
      + Math.sin(t * 0.61 + y * 0.095) * middleWeight * 1.6,
  };
}

function swWorld008BreakUpCore(now) {
  if (typeof funnelMesh === 'undefined' || !funnelMesh || typeof baseFunnelPos === 'undefined') return;
  const positions = funnelMesh.geometry?.attributes?.position;
  if (!positions) return;
  const t = now * 0.001;
  for (let i = 0; i < positions.count; i += 1) {
    const bx = baseFunnelPos[i * 3];
    const y = baseFunnelPos[i * 3 + 1];
    const bz = baseFunnelPos[i * 3 + 2];
    const angle = Math.atan2(bz, bx);
    const baseRadius = Math.max(0.001, Math.hypot(bx, bz));
    const factor = swWorld008Clamp(y / 34, 0, 1);
    const center = swWorld008Centerline(y, now);
    const verticalPulse = Math.sin(y * 0.53 - t * 1.35) * 0.10
      + Math.sin(y * 0.91 + t * 0.82) * 0.055;
    const angularBreakup = Math.sin(angle * 3 + y * 0.24 + t * 1.10) * 0.09
      + Math.sin(angle * 5 - y * 0.17 - t * 0.72) * 0.045;
    const taperBias = 0.93 + factor * 0.03;
    const radius = baseRadius * swWorld008Clamp(taperBias + verticalPulse + angularBreakup, 0.72, 1.18);
    positions.setX(i, Math.cos(angle) * radius + center.x);
    positions.setZ(i, Math.sin(angle) * radius + center.z);
  }
  positions.needsUpdate = true;
  if (funnelMesh.geometry?.computeVertexNormals) funnelMesh.geometry.computeVertexNormals();
  swWorld008TornadoHeritageState.radialBreakupFrames += 1;
}

function swWorld008UpdateFunnelMist(points, now, broad = false) {
  if (!points) return;
  const positions = points.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(points) || [];
  if (!positions) return;
  const t = now * 0.001;
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const y = 2.0 + seed.a * 32.0;
    const factor = y / 34.0;
    const center = swWorld008Centerline(y, now);
    const coreRadius = 1.5 + factor * 13.2;
    const radialJitter = (seed.b - 0.5) * (broad ? 7.2 : 4.0);
    const radius = Math.max(1.4, coreRadius + radialJitter + Math.sin(t * (0.7 + seed.c) + seed.d * 8) * 1.2);
    const angle = seed.b * Math.PI * 2 + t * (0.20 + seed.c * 0.32) + y * (broad ? 0.105 : 0.145);
    const verticalJitter = (seed.d - 0.5) * (broad ? 2.8 : 1.6);
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius,
      y + verticalJitter,
      center.z + Math.sin(angle) * radius,
    );
  }
  positions.needsUpdate = true;
}

function swWorld008UpdateCanopy(now) {
  if (!swWorld008CanopyMist) return;
  const positions = swWorld008CanopyMist.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(swWorld008CanopyMist) || [];
  if (!positions) return;
  const t = now * 0.001;
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const radius = 7 + seed.a * 18;
    const angle = seed.b * Math.PI * 2 + t * (0.07 + seed.c * 0.08);
    const y = 31.2 + (seed.d - 0.5) * 8.5 - (radius / 25) * 1.8;
    const center = swWorld008Centerline(33, now);
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius * (1.08 + seed.c * 0.38),
      y,
      center.z + Math.sin(angle) * radius * (0.72 + seed.a * 0.28),
    );
  }
  positions.needsUpdate = true;
}

function swWorld008UpdateGroundDust(now) {
  if (!swWorld008GroundDust) return;
  const positions = swWorld008GroundDust.geometry?.attributes?.position;
  const seeds = swWorld008PointSeeds.get(swWorld008GroundDust) || [];
  if (!positions) return;
  const t = now * 0.001;
  const center = swWorld008Centerline(1.5, now);
  for (let i = 0; i < positions.count; i += 1) {
    const seed = seeds[i];
    const radius = 2.4 + seed.a * 8.8 + Math.sin(t * 0.75 + seed.c * 9) * 0.8;
    const angle = seed.b * Math.PI * 2 + t * (0.32 + seed.c * 0.36);
    positions.setXYZ(
      i,
      center.x + Math.cos(angle) * radius,
      0.55 + seed.d * 2.8 + Math.sin(t * 1.2 + seed.a * 8) * 0.35,
      center.z + Math.sin(angle) * radius,
    );
  }
  positions.needsUpdate = true;
}

function swWorld008UpdateAtmosphere(now) {
  swWorld008EnsureAtmosphere();
  if (!swWorld008AtmosphereRoot) return;
  swWorld008AtmosphereRoot.visible = true;
  const neon = typeof neonFunnelUnlocked !== 'undefined' && Boolean(neonFunnelUnlocked);
  if (swWorld008MistFine?.material) swWorld008MistFine.material.color.set(neon ? '#69dbea' : '#87999f');
  if (swWorld008MistBroad?.material) swWorld008MistBroad.material.color.set(neon ? '#9cebf2' : '#a9b4b7');
  swWorld008UpdateFunnelMist(swWorld008MistFine, now, false);
  swWorld008UpdateFunnelMist(swWorld008MistBroad, now, true);
  swWorld008UpdateCanopy(now);
  swWorld008UpdateGroundDust(now);
  swWorld008TornadoHeritageState.atmosphereFrames += 1;
}

function swWorld008StyleLegacyTornado() {
  if (typeof funnelMesh !== 'undefined' && funnelMesh) {
    funnelMesh.visible = true;
    funnelMesh.scale.set(0.70, 1.0, 0.70);
    if (typeof funnelMat !== 'undefined' && funnelMat) {
      funnelMat.color?.set?.('#18252c');
      funnelMat.roughness = 0.86;
      funnelMat.metalness = 0.0;
      funnelMat.emissive?.set?.('#000000');
      if ('emissiveIntensity' in funnelMat) funnelMat.emissiveIntensity = 0.0;
      swWorld008SetMaterialOpacity(funnelMat, 0.72);
      funnelMat.depthWrite = true;
      if (typeof THREE !== 'undefined') funnelMat.side = THREE.FrontSide;
      funnelMat.needsUpdate = true;
    }
    swWorld008TornadoHeritageState.restoredCoreFrames += 1;
  }

  // The visible outer cylinder is the main source of the planar triangular
  // sheath seen in owner review. Keep the inherited object alive for legacy
  // state/cosmetic compatibility, but remove it from the player-facing image.
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) outerFunnelMesh.visible = false;

  // Likewise, the legacy cylinder-lobe canopy and dodecahedral dust anchors are
  // replaced visually by bounded soft point fields below. Their simulations may
  // continue underneath, but the faceted surfaces are not rendered.
  if (typeof mesoCloudGroup !== 'undefined' && mesoCloudGroup) mesoCloudGroup.visible = false;
  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) dustBowlGroup.visible = false;

  // Keep the historical 1,000-point debris helix. It is already simulated by
  // the accepted executor, so restoring it adds no second debris solver.
  if (typeof particleSystem !== 'undefined' && particleSystem) {
    particleSystem.visible = true;
    particleSystem.scale.set(0.70, 1.0, 0.70);
    if (typeof particleMat !== 'undefined' && particleMat) {
      particleMat.vertexColors = true;
      particleMat.size = (typeof isMobileDevice !== 'undefined' && isMobileDevice) ? 0.78 : 1.0;
      swWorld008SetMaterialOpacity(particleMat, 0.68);
    }
    swWorld008TornadoHeritageState.restoredDebrisFrames += 1;
  }
}

function swWorld008DemoteRibbonReplacement() {
  if (typeof swVisualHeroSlice6StormRoot === 'undefined' || !swVisualHeroSlice6StormRoot) return;
  swVisualHeroSlice6StormRoot.visible = true;
  let demoted = false;
  swVisualHeroSlice6StormRoot.children.forEach((object) => {
    if (!object?.material) return;
    if (object.name?.startsWith('SWVisualSlice6StormShell')) {
      object.visible = false;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
      object.visible = false;
      swWorld008SetMaterialOpacity(object.material, 0.02);
      demoted = true;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
      object.visible = false;
      demoted = true;
      return;
    }
    if (object.name?.startsWith('SWVisualSlice6GroundPull')) {
      object.visible = false;
      demoted = true;
    }
  });
  if (demoted) swWorld008TornadoHeritageState.ribbonFramesDemoted += 1;
}

function swWorld008SuppressForSecondary() {
  if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = false;
  if (typeof funnelMesh !== 'undefined' && funnelMesh) funnelMesh.visible = false;
  if (typeof outerFunnelMesh !== 'undefined' && outerFunnelMesh) outerFunnelMesh.visible = false;
  if (typeof particleSystem !== 'undefined' && particleSystem) particleSystem.visible = false;
  if (typeof dustBowlGroup !== 'undefined' && dustBowlGroup) dustBowlGroup.visible = false;
  if (swWorld008AtmosphereRoot) swWorld008AtmosphereRoot.visible = false;
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) swVisualHeroSlice6StormRoot.visible = false;
}

function swWorld008SyncTornadoHeritage(now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
  try {
    const activeStorm = swWorld008ActiveStorm();
    swWorld008TornadoHeritageState.frames += 1;
    swWorld008TornadoHeritageState.lastActiveStorm = activeStorm;
    const tornadoActive = activeStorm === 'tornado' || activeStorm === '';
    if (!tornadoActive) {
      swWorld008TornadoHeritageState.secondaryFrames += 1;
      swWorld008SuppressForSecondary();
      return true;
    }

    swWorld008TornadoHeritageState.tornadoFrames += 1;
    if (typeof tornadoGroup !== 'undefined' && tornadoGroup) tornadoGroup.visible = true;
    swWorld008StyleLegacyTornado();
    swWorld008BreakUpCore(now);
    swWorld008UpdateAtmosphere(now);
    swWorld008DemoteRibbonReplacement();
    return true;
  } catch (error) {
    swWorld008TornadoHeritageState.lastError = String(error?.message || error);
    return false;
  }
}

// The foundation frame hook reads this bridge every frame. WORLD-008 wraps the
// accepted update and then applies its presentation correction last, after the
// accepted executor has advanced gameplay and the historical particle motion.
const swWorld008VisualBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
const swWorld008VisualUpdateBase = swWorld008VisualBridgeBase?.update;
const swWorld008PrepareQaBase = swWorld008VisualBridgeBase?.prepareQaView;

function swWorld008VisualUpdate(dt, now) {
  const result = typeof swWorld008VisualUpdateBase === 'function'
    ? swWorld008VisualUpdateBase(dt, now)
    : true;
  swWorld008SyncTornadoHeritage(now);
  return result;
}

function swWorld008PrepareQaView(mode) {
  const result = typeof swWorld008PrepareQaBase === 'function'
    ? swWorld008PrepareQaBase(mode)
    : false;
  swWorld008SyncTornadoHeritage();
  if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') renderer.render(scene, camera);
  return result;
}

if (swWorld008VisualBridgeBase) {
  globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
    ...swWorld008VisualBridgeBase,
    update: swWorld008VisualUpdate,
    prepareQaView: swWorld008PrepareQaView,
    tornadoHeritageVersion: SW_WORLD_008_TORNADO_HERITAGE_MARKER,
  });
}

globalThis.getSwWorld008TornadoHeritageState = function getSwWorld008TornadoHeritageState() {
  const ribbon = { streaks: 0, visibleStreaks: 0, wisps: 0, visibleWisps: 0, groundPulls: 0, visibleGroundPulls: 0 };
  if (typeof swVisualHeroSlice6StormRoot !== 'undefined' && swVisualHeroSlice6StormRoot) {
    swVisualHeroSlice6StormRoot.children.forEach((object) => {
      if (object.name?.startsWith('SWVisualSlice6CondensationStreak')) {
        ribbon.streaks += 1;
        if (object.visible) ribbon.visibleStreaks += 1;
      }
      if (object.name?.startsWith('SWVisualSlice6EdgeWisp')) {
        ribbon.wisps += 1;
        if (object.visible) ribbon.visibleWisps += 1;
      }
      if (object.name?.startsWith('SWVisualSlice6GroundPull')) {
        ribbon.groundPulls += 1;
        if (object.visible) ribbon.visibleGroundPulls += 1;
      }
    });
  }
  return Object.freeze({
    ...swWorld008TornadoHeritageState,
    legacy: Object.freeze({
      tornadoGroupVisible: typeof tornadoGroup !== 'undefined' && Boolean(tornadoGroup?.visible),
      funnelVisible: typeof funnelMesh !== 'undefined' && Boolean(funnelMesh?.visible),
      funnelOpacity: typeof funnelMat !== 'undefined' ? Number(funnelMat?.opacity || 0) : null,
      funnelDepthWrite: typeof funnelMat !== 'undefined' ? Boolean(funnelMat?.depthWrite) : null,
      outerVisible: typeof outerFunnelMesh !== 'undefined' && Boolean(outerFunnelMesh?.visible),
      debrisVisible: typeof particleSystem !== 'undefined' && Boolean(particleSystem?.visible),
      debrisOpacity: typeof particleMat !== 'undefined' ? Number(particleMat?.opacity || 0) : null,
      dustVisible: typeof dustBowlGroup !== 'undefined' && Boolean(dustBowlGroup?.visible),
      canopyVisible: typeof mesoCloudGroup !== 'undefined' && Boolean(mesoCloudGroup?.visible),
    }),
    atmosphere: Object.freeze({
      rootVisible: Boolean(swWorld008AtmosphereRoot?.visible),
      finePoints: Number(swWorld008MistFine?.geometry?.attributes?.position?.count || 0),
      broadPoints: Number(swWorld008MistBroad?.geometry?.attributes?.position?.count || 0),
      canopyPoints: Number(swWorld008CanopyMist?.geometry?.attributes?.position?.count || 0),
      dustPoints: Number(swWorld008GroundDust?.geometry?.attributes?.position?.count || 0),
      drawFields: [swWorld008MistFine, swWorld008MistBroad, swWorld008CanopyMist, swWorld008GroundDust].filter(Boolean).length,
    }),
    ribbon: Object.freeze(ribbon),
    presentationOnly: true,
  });
};

swWorld008SyncTornadoHeritage();
// [SW:WORLD:008_TORNADO_HERITAGE:END]
