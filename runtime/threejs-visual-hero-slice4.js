// ============================================================================
// [SW:VISUAL:HERO_SLICE4]
// THREEJS_VISUAL_HERO_SLICE4_V1
//
// Bounded Stage 2A pass: world cohesion + storm volume. This layer may add
// presentation-only facade depth, ground transitions, local packaged VFX cards,
// and tornado material/volume treatment. Gameplay authority remains frozen.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE4_VERSION = 'THREEJS_VISUAL_HERO_SLICE4_V1';

const SW_VISUAL_HERO_SLICE4_VFX = Object.freeze({
  dirt: './assets/production/vfx/kenney/dirt_01.png',
  smoke: './assets/production/vfx/kenney/smoke_03.png',
  trace: './assets/production/vfx/kenney/trace_03.png',
});

const swVisualHeroSlice4State = {
  installed: false,
  worldGeneration: 0,
  facadeKitCount: 0,
  transitionStripCount: 0,
  volumeShellCount: 0,
  volumeWispCount: 0,
  groundSkirtCount: 0,
  rainCardCount: 0,
  legacyFunnelTuned: false,
  textureStatus: { dirt: 'pending', smoke: 'pending', trace: 'pending' },
  lastError: null,
};

let swVisualHeroSlice4WorldRoot = null;
let swVisualHeroSlice4StormRoot = null;
let swVisualHeroSlice4FacadeGroups = [];
let swVisualHeroSlice4TexturePromise = null;
const swVisualHeroSlice4Textures = { dirt: null, smoke: null, trace: null };

function swVisualHeroSlice4Hash(value) {
  if (typeof swVisualHeroSlice3Hash === 'function') return swVisualHeroSlice3Hash(value);
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function swVisualHeroSlice4TraceFallback() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(32, 0, 32, 256);
  gradient.addColorStop(0, 'rgba(218,235,244,0)');
  gradient.addColorStop(0.2, 'rgba(218,235,244,0.42)');
  gradient.addColorStop(0.82, 'rgba(190,220,232,0.22)');
  gradient.addColorStop(1, 'rgba(190,220,232,0)');
  context.fillStyle = gradient;
  context.fillRect(26, 0, 12, 256);
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = 'SWVisualHeroSlice4TraceFallback';
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function swVisualHeroSlice4FallbackTexture(key) {
  if (key === 'dirt' && typeof swVisualMakeSoftTexture === 'function') return swVisualMakeSoftTexture('dust');
  if (key === 'smoke' && typeof swVisualMakeSoftTexture === 'function') return swVisualMakeSoftTexture('cloud');
  return swVisualHeroSlice4TraceFallback();
}

function swVisualHeroSlice4LoadLocalTexture(key, pathName) {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      pathName,
      (texture) => {
        texture.name = `SWVisualHeroSlice4_${key}`;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        if (typeof THREE.sRGBEncoding !== 'undefined') texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        swVisualHeroSlice4Textures[key] = texture;
        swVisualHeroSlice4State.textureStatus[key] = 'local';
        resolve(texture);
      },
      undefined,
      () => {
        const fallback = swVisualHeroSlice4FallbackTexture(key);
        swVisualHeroSlice4Textures[key] = fallback;
        swVisualHeroSlice4State.textureStatus[key] = 'fallback';
        resolve(fallback);
      },
    );
  });
}

function swVisualHeroSlice4EnsureTextures() {
  if (swVisualHeroSlice4Textures.dirt && swVisualHeroSlice4Textures.smoke && swVisualHeroSlice4Textures.trace) {
    return Promise.resolve(swVisualHeroSlice4Textures);
  }
  if (swVisualHeroSlice4TexturePromise) return swVisualHeroSlice4TexturePromise;
  swVisualHeroSlice4TexturePromise = Promise.all([
    swVisualHeroSlice4LoadLocalTexture('dirt', SW_VISUAL_HERO_SLICE4_VFX.dirt),
    swVisualHeroSlice4LoadLocalTexture('smoke', SW_VISUAL_HERO_SLICE4_VFX.smoke),
    swVisualHeroSlice4LoadLocalTexture('trace', SW_VISUAL_HERO_SLICE4_VFX.trace),
  ]).then(() => swVisualHeroSlice4Textures);
  return swVisualHeroSlice4TexturePromise;
}

function swVisualHeroSlice4DisposeFacades() {
  swVisualHeroSlice4FacadeGroups.forEach((group) => swVisualDisposeObject(group));
  swVisualHeroSlice4FacadeGroups = [];
  swVisualHeroSlice4State.facadeKitCount = 0;
}

function swVisualHeroSlice4DisposeWorldRoot() {
  if (swVisualHeroSlice4WorldRoot) swVisualDisposeObject(swVisualHeroSlice4WorldRoot);
  swVisualHeroSlice4WorldRoot = null;
  swVisualHeroSlice4State.transitionStripCount = 0;
}

function swVisualHeroSlice4DisposeStormRoot() {
  if (swVisualHeroSlice4StormRoot) swVisualDisposeObject(swVisualHeroSlice4StormRoot);
  swVisualHeroSlice4StormRoot = null;
  swVisualHeroSlice4State.volumeShellCount = 0;
  swVisualHeroSlice4State.volumeWispCount = 0;
  swVisualHeroSlice4State.groundSkirtCount = 0;
  swVisualHeroSlice4State.rainCardCount = 0;
}

function swVisualHeroSlice4Material(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: Number.isFinite(options.roughness) ? options.roughness : 0.84,
    metalness: Number.isFinite(options.metalness) ? options.metalness : 0.02,
    emissive: options.emissive || '#000000',
    emissiveIntensity: Number.isFinite(options.emissiveIntensity) ? options.emissiveIntensity : 0,
    transparent: Boolean(options.transparent),
    opacity: Number.isFinite(options.opacity) ? options.opacity : 1,
    side: options.side || THREE.FrontSide,
  });
}

function swVisualHeroSlice4AddFacadeKit(target, ordinal) {
  const targetGroup = target?.meshData?.group;
  const base = target?.meshData?.base;
  const parameters = base?.geometry?.parameters || null;
  if (!targetGroup || !parameters) return false;

  const width = Number(parameters.width || 0);
  const height = Number(parameters.height || 0);
  const depth = Number(parameters.depth || 0);
  if (width < 4 || height < 2.5 || depth < 2) return false;

  const family = String(target.materialFamily || 'concrete');
  const seed = swVisualHeroSlice4Hash(`${target.blockId || ''}|${target.kind || ''}|${ordinal}`);
  const palette = typeof swVisualHeroSlice3Palette === 'function'
    ? swVisualHeroSlice3Palette().palette
    : { trim: '#d4c7ae', glass: '#35555f', roof: '#40474b', wood: ['#8a775f'], masonry: ['#795247'], metal: ['#69747a'] };
  const shellPalette = family === 'wood'
    ? palette.wood
    : ((family === 'masonry' || family === 'glass') ? palette.masonry : palette.metal);
  const accentColor = shellPalette[seed % shellPalette.length] || '#786b60';
  const frontZ = -(depth * 0.5 + 0.14);

  const kit = new THREE.Group();
  kit.name = 'SWVisualSlice4FacadeKit';
  kit.userData.swPresentationOnly = true;

  const trimMaterial = swVisualHeroSlice4Material(palette.trim || '#d4c7ae', { roughness: 0.74 });
  const darkMaterial = swVisualHeroSlice4Material(palette.roof || '#40474b', { roughness: 0.72, metalness: family === 'metal' ? 0.18 : 0.04 });
  const accentMaterial = swVisualHeroSlice4Material(accentColor, { roughness: 0.82, metalness: family === 'metal' ? 0.16 : 0.02 });
  const glassMaterial = swVisualHeroSlice4Material(palette.glass || '#35555f', {
    roughness: 0.26,
    metalness: 0.12,
    emissive: '#14292f',
    emissiveIntensity: 0.06,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide,
  });

  const cornice = new THREE.Mesh(new THREE.BoxGeometry(width * 0.88, 0.28, 0.34), family === 'metal' ? darkMaterial : trimMaterial);
  cornice.position.set(0, height * 0.46, frontZ - 0.04);
  kit.add(cornice);

  const windowCount = width >= 9 ? 3 : 2;
  const span = Math.min(width * 0.64, 8.4);
  for (let index = 0; index < windowCount; index += 1) {
    const x = windowCount === 1 ? 0 : -span * 0.5 + (span / (windowCount - 1)) * index;
    const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(1.7, width * 0.18), Math.min(2.2, height * 0.32)), glassMaterial);
    windowMesh.position.set(x, Math.min(height * 0.15, height * 0.5 - 1.2), frontZ - 0.19);
    kit.add(windowMesh);
  }

  if (family === 'wood' || seed % 3 === 0) {
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(width * 0.58, 0.2, 1.25), accentMaterial);
    canopy.position.set(0, Math.min(height * 0.18, 2.8), frontZ - 0.72);
    canopy.rotation.x = -0.07;
    kit.add(canopy);
    [-1, 1].forEach((direction) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, Math.min(2.5, height * 0.4), 0.16), trimMaterial);
      post.position.set(direction * width * 0.24, Math.min(1.25, height * 0.2), frontZ - 1.18);
      kit.add(post);
    });
  } else {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(Math.min(width * 0.46, 5.2), 0.64, 0.18), accentMaterial);
    sign.position.set(0, Math.min(height * 0.28, height * 0.5 - 0.8), frontZ - 0.28);
    kit.add(sign);
  }

  if (family === 'metal') {
    for (let index = -2; index <= 2; index += 1) {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, Math.max(1.6, height * 0.74), 0.1), darkMaterial);
      rib.position.set(index * width * 0.16, 0, frontZ - 0.12);
      kit.add(rib);
    }
  }

  kit.traverse((object) => {
    if (!object?.isMesh) return;
    object.castShadow = Boolean(productionQualityConfig?.().shadows);
    object.receiveShadow = true;
  });
  targetGroup.add(kit);
  swVisualHeroSlice4FacadeGroups.push(kit);
  return true;
}

function swVisualHeroSlice4BuildFacadeKits() {
  swVisualHeroSlice4DisposeFacades();
  const targetList = typeof targets !== 'undefined' && Array.isArray(targets) ? targets : [];
  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  if (!storefront) return 0;

  const candidates = targetList
    .filter((target) => target?.meshData?.group && !Boolean(target.destroyed) && !Boolean(target.isTree))
    .filter((target) => target.meshData.group.name !== 'structure.storefront.v1' && target.meshData.group.name !== 'HartFarmSignatureBarn')
    .map((target) => ({ target, distance: Math.hypot(Number(target.x) - Number(storefront.x), Number(target.z) - Number(storefront.z)) }))
    .filter((entry) => entry.distance <= 118)
    .sort((a, b) => a.distance - b.distance);

  const limit = typeof isMobileDevice !== 'undefined' && isMobileDevice ? 8 : 12;
  let count = 0;
  candidates.slice(0, limit).forEach((entry, index) => {
    if (swVisualHeroSlice4AddFacadeKit(entry.target, index)) count += 1;
  });
  swVisualHeroSlice4State.facadeKitCount = count;
  return count;
}

function swVisualHeroSlice4AddTransitionPlane(width, depth, x, z, color, opacity, name) {
  const plane = swVisualConformedPlane(width, depth, x, z, 0.12, color, 0.98, opacity);
  plane.name = name;
  plane.userData.swPresentationOnly = true;
  swVisualHeroSlice4WorldRoot.add(plane);
  swVisualHeroSlice4State.transitionStripCount += 1;
  return plane;
}

function swVisualHeroSlice4BuildGroundTransitions() {
  swVisualHeroSlice4DisposeWorldRoot();
  if (!swVisualRoot) return false;
  swVisualHeroSlice4WorldRoot = new THREE.Group();
  swVisualHeroSlice4WorldRoot.name = 'SWVisualHeroSlice4WorldCohesion';
  swVisualRoot.add(swVisualHeroSlice4WorldRoot);

  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  const hartFarm = swVisualGetHartFarmPresentationAnchor?.() || null;

  if (storefront) {
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    swVisualHeroSlice4AddTransitionPlane(58, 5.2, x, z + 20.5, '#65705e', 0.82, 'SWVisualSlice4StorefrontRearVerge');
    swVisualHeroSlice4AddTransitionPlane(5.2, 42, x - 28.3, z, '#69705e', 0.8, 'SWVisualSlice4StorefrontLeftVerge');
    swVisualHeroSlice4AddTransitionPlane(5.2, 42, x + 28.3, z, '#69705e', 0.8, 'SWVisualSlice4StorefrontRightVerge');
    swVisualHeroSlice4AddTransitionPlane(54, 2.8, x, z - 20.3, '#756d60', 0.76, 'SWVisualSlice4StorefrontRoadShoulderBlend');
  }

  if (hartFarm) {
    const x = Number(hartFarm.x);
    const z = Number(hartFarm.z);
    swVisualHeroSlice4AddTransitionPlane(3.4, 76, x + 12.2, z + 39, '#6a7255', 0.78, 'SWVisualSlice4FarmTrackWestEdge');
    swVisualHeroSlice4AddTransitionPlane(3.4, 76, x + 21.8, z + 39, '#6a7255', 0.78, 'SWVisualSlice4FarmTrackEastEdge');
    swVisualHeroSlice4AddTransitionPlane(48, 3.2, x, z + 18.5, '#6d684f', 0.8, 'SWVisualSlice4FarmApronEdge');
  }
  return true;
}

function swVisualHeroSlice4TuneLegacyFunnel() {
  let tuned = false;
  if (typeof funnelMat !== 'undefined' && funnelMat) {
    funnelMat.color?.set?.('#34434d');
    funnelMat.opacity = 0.46;
    funnelMat.roughness = 0.68;
    funnelMat.metalness = 0;
    funnelMat.transparent = true;
    funnelMat.depthWrite = false;
    funnelMat.needsUpdate = true;
    tuned = true;
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
    outerFunnelMat.color?.set?.('#6d7b80');
    outerFunnelMat.opacity = 0.24;
    outerFunnelMat.transparent = true;
    outerFunnelMat.depthWrite = false;
    outerFunnelMat.needsUpdate = true;
    tuned = true;
  }
  swVisualHeroSlice4State.legacyFunnelTuned = tuned;
  return tuned;
}

function swVisualHeroSlice4Sprite(texture, color, opacity, name) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    fog: true,
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = name;
  sprite.userData.swPresentationOnly = true;
  return sprite;
}

function swVisualHeroSlice4BuildStormVolume() {
  swVisualHeroSlice4DisposeStormRoot();
  if (!swVisualRoot || !swVisualHeroSlice4Textures.smoke || !swVisualHeroSlice4Textures.dirt || !swVisualHeroSlice4Textures.trace) return false;

  swVisualHeroSlice4StormRoot = new THREE.Group();
  swVisualHeroSlice4StormRoot.name = 'SWVisualHeroSlice4StormVolume';
  swVisualHeroSlice4StormRoot.userData.swPresentationOnly = true;
  swVisualRoot.add(swVisualHeroSlice4StormRoot);

  const smoke = swVisualHeroSlice4Textures.smoke;
  const dirt = swVisualHeroSlice4Textures.dirt;
  const trace = swVisualHeroSlice4Textures.trace;
  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const shellSegments = mobile ? 20 : 28;
  const shellSpecs = [
    { top: 29, bottom: 6.4, height: 34, y: 17.2, opacity: 0.13, color: '#76848b', spin: 0.12, phase: 0.1 },
    { top: 24, bottom: 4.6, height: 33, y: 16.8, opacity: 0.16, color: '#5f6d74', spin: -0.16, phase: 1.3 },
    { top: 19, bottom: 2.8, height: 31, y: 15.8, opacity: 0.19, color: '#46565f', spin: 0.21, phase: 2.4 },
    { top: 34, bottom: 16, height: 13, y: 31.5, opacity: 0.12, color: '#6c7b83', spin: -0.09, phase: 3.2 },
  ];

  shellSpecs.forEach((spec, index) => {
    const geometry = new THREE.CylinderGeometry(spec.top, spec.bottom, spec.height, shellSegments, 7, true);
    const material = new THREE.MeshBasicMaterial({
      map: smoke,
      color: spec.color,
      transparent: true,
      opacity: spec.opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const shell = new THREE.Mesh(geometry, material);
    shell.name = `SWVisualSlice4VolumeShell${index + 1}`;
    shell.position.y = spec.y;
    shell.userData.spin = spec.spin;
    shell.userData.phase = spec.phase;
    shell.userData.baseOpacity = spec.opacity;
    shell.renderOrder = 2 + index;
    swVisualHeroSlice4StormRoot.add(shell);
  });
  swVisualHeroSlice4State.volumeShellCount = shellSpecs.length;

  const wispCount = mobile ? 12 : 18;
  for (let index = 0; index < wispCount; index += 1) {
    const sprite = swVisualHeroSlice4Sprite(smoke, index % 3 === 0 ? '#8a9290' : '#66757b', 0.16, `SWVisualSlice4VolumeWisp${index + 1}`);
    const height = 4 + (index / Math.max(1, wispCount - 1)) * 33;
    sprite.userData.height = height;
    sprite.userData.angle = (index / wispCount) * Math.PI * 2 + (index % 4) * 0.17;
    sprite.userData.radius = 3.8 + height * 0.46 + (index % 3) * 1.4;
    sprite.userData.spin = 0.44 + (index % 5) * 0.06;
    sprite.userData.phase = index * 0.61;
    const scale = 8 + height * 0.24 + (index % 4) * 1.5;
    sprite.scale.set(scale, scale * 0.72, 1);
    swVisualHeroSlice4StormRoot.add(sprite);
  }
  swVisualHeroSlice4State.volumeWispCount = wispCount;

  const skirtCount = mobile ? 12 : 18;
  for (let index = 0; index < skirtCount; index += 1) {
    const texture = index % 4 === 0 ? smoke : dirt;
    const sprite = swVisualHeroSlice4Sprite(texture, index % 3 === 0 ? '#8f816d' : '#a19176', 0.22, `SWVisualSlice4GroundSkirt${index + 1}`);
    sprite.userData.angle = (index / skirtCount) * Math.PI * 2;
    sprite.userData.radius = 7.5 + (index % 5) * 2.6;
    sprite.userData.spin = 0.5 + (index % 4) * 0.08;
    sprite.userData.phase = index * 0.47;
    const scale = 9 + (index % 4) * 2.8;
    sprite.scale.set(scale, scale * 0.58, 1);
    swVisualHeroSlice4StormRoot.add(sprite);
  }
  swVisualHeroSlice4State.groundSkirtCount = skirtCount;

  const rainCount = mobile ? 8 : 12;
  for (let index = 0; index < rainCount; index += 1) {
    const sprite = swVisualHeroSlice4Sprite(trace, '#a9c8d4', 0.09, `SWVisualSlice4RainTrace${index + 1}`);
    sprite.userData.angle = (index / rainCount) * Math.PI * 2 + 0.33;
    sprite.userData.radius = 24 + (index % 4) * 8;
    sprite.userData.phase = index * 0.73;
    sprite.scale.set(2.2 + (index % 3) * 0.5, 10 + (index % 4) * 2.4, 1);
    swVisualHeroSlice4StormRoot.add(sprite);
  }
  swVisualHeroSlice4State.rainCardCount = rainCount;
  return true;
}

function swVisualHeroSlice4UpdateStormVolume(dt, now) {
  if (!swVisualHeroSlice4StormRoot || !storm?.pos) return false;
  const seconds = Number(now || 0) * 0.001;
  const scale = Math.max(0.92, Number(typeof funnelScale !== 'undefined' ? funnelScale : 1) || 1);
  swVisualHeroSlice4StormRoot.position.copy(storm.pos);
  swVisualHeroSlice4StormRoot.scale.setScalar(scale);

  swVisualHeroSlice4StormRoot.children.forEach((object, index) => {
    if (object.name.startsWith('SWVisualSlice4VolumeShell')) {
      object.rotation.y += Math.max(0, Number(dt || 0)) * Number(object.userData.spin || 0.12);
      const wobble = Math.sin(seconds * 1.7 + Number(object.userData.phase || 0)) * 0.055;
      object.scale.set(1 + wobble, 1, 1 - wobble * 0.72);
      object.material.opacity = Number(object.userData.baseOpacity || 0.14) * (0.92 + Math.sin(seconds * 1.2 + index) * 0.08);
      return;
    }
    if (object.name.startsWith('SWVisualSlice4VolumeWisp')) {
      const angle = Number(object.userData.angle || 0) + seconds * Number(object.userData.spin || 0.48);
      const radius = Number(object.userData.radius || 10) * (0.94 + Math.sin(seconds * 1.3 + Number(object.userData.phase || 0)) * 0.08);
      const height = Number(object.userData.height || 14);
      object.position.set(Math.cos(angle) * radius, height + Math.sin(seconds * 2.1 + index) * 0.7, Math.sin(angle) * radius);
      object.material.opacity = 0.12 + (index % 4) * 0.018 + Math.min(0.06, scale * 0.018);
      return;
    }
    if (object.name.startsWith('SWVisualSlice4GroundSkirt')) {
      const angle = Number(object.userData.angle || 0) + seconds * Number(object.userData.spin || 0.56);
      const radius = Number(object.userData.radius || 10);
      object.position.set(Math.cos(angle) * radius, 1.1 + Math.sin(seconds * 2.6 + Number(object.userData.phase || 0)) * 0.58, Math.sin(angle) * radius);
      object.material.opacity = 0.16 + (index % 3) * 0.025 + Math.min(0.08, scale * 0.022);
      return;
    }
    if (object.name.startsWith('SWVisualSlice4RainTrace')) {
      const angle = Number(object.userData.angle || 0);
      const radius = Number(object.userData.radius || 28);
      const phase = Number(object.userData.phase || 0);
      const fall = 8 + ((seconds * 12 + phase * 9) % 28);
      object.position.set(Math.cos(angle) * radius, fall, Math.sin(angle) * radius);
      object.material.opacity = Number(currentStage || 1) >= 2 ? 0.12 : 0.075;
    }
  });
  return true;
}

function swVisualHeroSlice4RefreshWorld() {
  try {
    swVisualHeroSlice4BuildGroundTransitions();
    swVisualHeroSlice4BuildFacadeKits();
    swVisualHeroSlice4TuneLegacyFunnel();
    swVisualHeroSlice4EnsureTextures().then(() => swVisualHeroSlice4BuildStormVolume());
    swVisualHeroSlice4State.installed = true;
    return true;
  } catch (error) {
    swVisualHeroSlice4State.lastError = String(error?.message || error);
    return false;
  }
}

const swVisualHeroSlice4RefreshBase = swVisualRefreshHeroSlice;
swVisualRefreshHeroSlice = function swVisualRefreshHeroSliceWithWorldCohesion(...args) {
  const result = swVisualHeroSlice4RefreshBase.apply(this, args);
  swVisualHeroSlice4RefreshWorld();
  return result;
};

const swVisualHeroSlice4UpdateBase = swVisualUpdate;
swVisualUpdate = function swVisualUpdateWithHeroSlice4Volume(dt, now) {
  const result = swVisualHeroSlice4UpdateBase(dt, now);
  swVisualHeroSlice4UpdateStormVolume(dt, now);
  return result;
};

const swVisualHeroSlice4SnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice4() {
  const base = swVisualHeroSlice4SnapshotBase();
  return Object.freeze({
    ...base,
    heroSlice4Version: THREEJS_VISUAL_HERO_SLICE4_VERSION,
    cohesion: Object.freeze({
      worldRootPresent: Boolean(swVisualHeroSlice4WorldRoot?.parent),
      facadeKitCount: swVisualHeroSlice4State.facadeKitCount,
      transitionStripCount: swVisualHeroSlice4State.transitionStripCount,
    }),
    stormVolume: Object.freeze({
      rootPresent: Boolean(swVisualHeroSlice4StormRoot?.parent),
      shellCount: swVisualHeroSlice4State.volumeShellCount,
      wispCount: swVisualHeroSlice4State.volumeWispCount,
      groundSkirtCount: swVisualHeroSlice4State.groundSkirtCount,
      rainCardCount: swVisualHeroSlice4State.rainCardCount,
      legacyFunnelTuned: swVisualHeroSlice4State.legacyFunnelTuned,
      textureStatus: Object.freeze({ ...swVisualHeroSlice4State.textureStatus }),
    }),
    heroSlice4LastError: swVisualHeroSlice4State.lastError,
  });
};

const swVisualHeroSlice4BuildLivingCountyBase = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithHeroSlice4CohesionReset(...args) {
  swVisualHeroSlice4State.worldGeneration += 1;
  swVisualHeroSlice4DisposeFacades();
  swVisualHeroSlice4DisposeWorldRoot();
  const result = swVisualHeroSlice4BuildLivingCountyBase.apply(this, args);
  Promise.resolve().then(() => Promise.resolve()).then(() => swVisualHeroSlice4RefreshWorld());
  return result;
};

const swVisualHeroSlice4BridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice4BridgeBase,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  getSnapshot: swVisualSnapshot,
  heroSlice4Version: THREEJS_VISUAL_HERO_SLICE4_VERSION,
  refreshHeroSlice4: swVisualHeroSlice4RefreshWorld,
});

Promise.resolve().then(() => swVisualHeroSlice4RefreshWorld());
// [SW:VISUAL:HERO_SLICE4:END]
