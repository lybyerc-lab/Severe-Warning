// ============================================================================
// [SW:VISUAL:HERO_SLICE5]
// THREEJS_VISUAL_HERO_SLICE5_V1
//
// Bounded presentation-only fun pass: neon rainbow tornado + Hart Farm cow-level
// Easter egg. Gameplay authority, animal truth, score, timing, campaign, and
// abilities remain frozen.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE5_VERSION = 'THREEJS_VISUAL_HERO_SLICE5_V1';

const swVisualHeroSlice5State = {
  installed: false,
  worldGeneration: 0,
  rainbowShellCount: 0,
  rainbowRibbonCount: 0,
  rainbowLightCount: 0,
  legacyFunnelDimmed: false,
  cowCount: 0,
  cowLevelActive: false,
  cowLevelSignPresent: false,
  cowLevelRingPresent: false,
  lastError: null,
};

let swVisualHeroSlice5RainbowRoot = null;
let swVisualHeroSlice5CowLevelRoot = null;
let swVisualHeroSlice5CowLevelRing = null;
let swVisualHeroSlice5CowLevelSign = null;

function swVisualHeroSlice5DisposeRainbow() {
  if (swVisualHeroSlice5RainbowRoot) swVisualDisposeObject(swVisualHeroSlice5RainbowRoot);
  swVisualHeroSlice5RainbowRoot = null;
  swVisualHeroSlice5State.rainbowShellCount = 0;
  swVisualHeroSlice5State.rainbowRibbonCount = 0;
  swVisualHeroSlice5State.rainbowLightCount = 0;
}

function swVisualHeroSlice5DisposeCowLevel() {
  if (swVisualHeroSlice5CowLevelRoot) swVisualDisposeObject(swVisualHeroSlice5CowLevelRoot);
  swVisualHeroSlice5CowLevelRoot = null;
  swVisualHeroSlice5CowLevelRing = null;
  swVisualHeroSlice5CowLevelSign = null;
  swVisualHeroSlice5State.cowCount = 0;
  swVisualHeroSlice5State.cowLevelActive = false;
  swVisualHeroSlice5State.cowLevelSignPresent = false;
  swVisualHeroSlice5State.cowLevelRingPresent = false;
}

function swVisualHeroSlice5RainbowGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, phase) {
  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true);
  const position = geometry.getAttribute('position');
  const colors = new Float32Array(position.count * 3);
  const color = new THREE.Color();
  const tau = Math.PI * 2;
  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const angle = Math.atan2(z, x);
    const heightMix = THREE.MathUtils.clamp((y + height * 0.5) / Math.max(0.001, height), 0, 1);
    const hue = ((angle / tau) + heightMix * 0.36 + phase + 2) % 1;
    color.setHSL(hue, 0.98, 0.58);
    colors[index * 3] = color.r;
    colors[index * 3 + 1] = color.g;
    colors[index * 3 + 2] = color.b;
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

function swVisualHeroSlice5DimLegacyFunnel() {
  let dimmed = false;
  if (typeof funnelMat !== 'undefined' && funnelMat) {
    funnelMat.opacity = 0.18;
    funnelMat.transparent = true;
    funnelMat.depthWrite = false;
    funnelMat.color?.set?.('#b7d7ff');
    funnelMat.emissive?.set?.('#19263b');
    if ('emissiveIntensity' in funnelMat) funnelMat.emissiveIntensity = 0.22;
    funnelMat.needsUpdate = true;
    dimmed = true;
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
    outerFunnelMat.opacity = 0.10;
    outerFunnelMat.transparent = true;
    outerFunnelMat.depthWrite = false;
    outerFunnelMat.color?.set?.('#d5e5ff');
    outerFunnelMat.emissive?.set?.('#1a2440');
    if ('emissiveIntensity' in outerFunnelMat) outerFunnelMat.emissiveIntensity = 0.16;
    outerFunnelMat.needsUpdate = true;
    dimmed = true;
  }
  swVisualHeroSlice5State.legacyFunnelDimmed = dimmed;
  return dimmed;
}

function swVisualHeroSlice5BuildRainbowFunnel() {
  swVisualHeroSlice5DisposeRainbow();
  if (!swVisualRoot) return false;

  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  const radialSegments = mobile ? 20 : 30;
  const ribbonSegments = mobile ? 28 : 42;
  swVisualHeroSlice5RainbowRoot = new THREE.Group();
  swVisualHeroSlice5RainbowRoot.name = 'SWVisualHeroSlice5RainbowFunnel';
  swVisualHeroSlice5RainbowRoot.userData.swPresentationOnly = true;
  swVisualRoot.add(swVisualHeroSlice5RainbowRoot);

  const shellSpecs = [
    { top: 27.5, bottom: 4.8, height: 34, y: 17.0, phase: 0.00, opacity: 0.35, spin: 0.62 },
    { top: 31.0, bottom: 8.2, height: 35, y: 17.6, phase: 0.43, opacity: 0.22, spin: -0.41 },
  ];
  shellSpecs.forEach((spec, index) => {
    const geometry = swVisualHeroSlice5RainbowGeometry(spec.top, spec.bottom, spec.height, radialSegments, 8, spec.phase);
    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: spec.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    const shell = new THREE.Mesh(geometry, material);
    shell.name = `SWVisualSlice5RainbowShell${index + 1}`;
    shell.position.y = spec.y;
    shell.userData.phase = spec.phase;
    shell.userData.spin = spec.spin;
    shell.userData.baseOpacity = spec.opacity;
    shell.renderOrder = 12 + index;
    swVisualHeroSlice5RainbowRoot.add(shell);
  });
  swVisualHeroSlice5State.rainbowShellCount = shellSpecs.length;

  const ribbonCount = mobile ? 7 : 9;
  for (let index = 0; index < ribbonCount; index += 1) {
    const height = 4.0 + index * (29 / Math.max(1, ribbonCount - 1));
    const radius = 4.0 + height * 0.67;
    const hue = index / ribbonCount;
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 1, 0.62),
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });
    const geometry = new THREE.TorusGeometry(radius, mobile ? 0.20 : 0.24, 6, ribbonSegments, Math.PI * 1.58);
    const ribbon = new THREE.Mesh(geometry, material);
    ribbon.name = `SWVisualSlice5RainbowRibbon${index + 1}`;
    ribbon.position.y = height;
    ribbon.rotation.x = Math.PI / 2 + Math.sin(index * 1.4) * 0.08;
    ribbon.rotation.z = Math.cos(index * 0.9) * 0.09;
    ribbon.userData.hue = hue;
    ribbon.userData.phase = index * 0.71;
    ribbon.userData.spin = (index % 2 === 0 ? 1 : -1) * (0.48 + index * 0.045);
    ribbon.renderOrder = 16 + index;
    swVisualHeroSlice5RainbowRoot.add(ribbon);
  }
  swVisualHeroSlice5State.rainbowRibbonCount = ribbonCount;

  const glow = new THREE.PointLight('#ff4bd8', mobile ? 0.48 : 0.68, 76, 2);
  glow.name = 'SWVisualSlice5RainbowGlow';
  glow.position.set(0, 15, 0);
  glow.castShadow = false;
  glow.userData.hue = 0.92;
  swVisualHeroSlice5RainbowRoot.add(glow);
  swVisualHeroSlice5State.rainbowLightCount = 1;

  swVisualHeroSlice5DimLegacyFunnel();
  return true;
}

function swVisualHeroSlice5CowMaterials() {
  return {
    white: new THREE.MeshStandardMaterial({ color: '#f5f0e5', roughness: 0.76, metalness: 0.01 }),
    dark: new THREE.MeshStandardMaterial({ color: '#202128', roughness: 0.72, metalness: 0.02 }),
    hoof: new THREE.MeshStandardMaterial({ color: '#37302d', roughness: 0.86 }),
    horn: new THREE.MeshStandardMaterial({ color: '#d9cda9', roughness: 0.72 }),
    gold: new THREE.MeshStandardMaterial({ color: '#f8c84a', emissive: '#6b3500', emissiveIntensity: 0.36, roughness: 0.42, metalness: 0.18 }),
  };
}

function swVisualHeroSlice5MakeCow(materials, index, champion = false) {
  const cow = new THREE.Group();
  cow.name = champion ? 'SWVisualSlice5CowChampion' : `SWVisualSlice5Cow${index + 1}`;
  cow.userData.swPresentationOnly = true;
  cow.userData.isChampion = champion;

  const bodyMaterial = champion ? materials.gold : materials.white;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.55, 1.45), bodyMaterial);
  body.position.y = 1.55;
  cow.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.15, 1.15), bodyMaterial);
  head.position.set(0, 1.78, -1.52);
  cow.add(head);

  const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.44, 0.54), champion ? materials.gold : materials.white);
  muzzle.position.set(0, 1.55, -2.02);
  cow.add(muzzle);

  for (const x of [-0.92, 0.92]) {
    for (const z of [-0.45, 0.45]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.30, 1.35, 0.32), materials.hoof);
      leg.position.set(x, 0.68, z);
      cow.add(leg);
    }
  }

  if (!champion) {
    const spotA = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.05), materials.dark);
    spotA.position.set(0.65, 1.72, 0.735);
    cow.add(spotA);
    const spotB = spotA.clone();
    spotB.position.set(-0.55, 1.28, -0.735);
    cow.add(spotB);
  }

  for (const x of [-0.42, 0.42]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.62, 7), champion ? materials.gold : materials.horn);
    horn.position.set(x, 2.48, -1.55);
    horn.rotation.z = x < 0 ? 0.32 : -0.32;
    cow.add(horn);
  }

  cow.traverse((object) => {
    if (!object?.isMesh) return;
    object.castShadow = Boolean(productionQualityConfig?.().shadows);
    object.receiveShadow = true;
  });
  return cow;
}

function swVisualHeroSlice5MakeCowLevelSign() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 192;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = 'rgba(11,16,18,0.90)';
  context.fillRect(12, 18, 488, 156);
  context.strokeStyle = '#b8ff5b';
  context.lineWidth = 8;
  context.strokeRect(18, 24, 476, 144);
  context.font = '900 58px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#f7ffd6';
  context.fillText('MOO LEVEL', 256, 83);
  context.font = '700 26px system-ui, sans-serif';
  context.fillStyle = '#ff7be8';
  context.fillText('AUTHORIZED BOVINES ONLY', 256, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, fog: true }));
  sprite.name = 'SWVisualSlice5CowLevelSign';
  sprite.scale.set(10.5, 3.95, 1);
  sprite.userData.swPresentationOnly = true;
  return sprite;
}

function swVisualHeroSlice5BuildCowLevel() {
  swVisualHeroSlice5DisposeCowLevel();
  if (!swVisualRoot) return false;
  const farm = swVisualGetHartFarmPresentationAnchor?.() || null;
  if (!farm) return false;

  const centerX = Number(farm.x) - 22;
  const centerZ = Number(farm.z) + 12;
  const centerY = typeof terrainHeightAt === 'function' ? terrainHeightAt(centerX, centerZ) : 0;
  const root = new THREE.Group();
  root.name = 'SWVisualHeroSlice5CowLevel';
  root.position.set(centerX, centerY, centerZ);
  root.userData.swPresentationOnly = true;
  root.userData.centerX = centerX;
  root.userData.centerZ = centerZ;
  swVisualRoot.add(root);
  swVisualHeroSlice5CowLevelRoot = root;

  const field = new THREE.Mesh(
    new THREE.CircleGeometry(15.8, 48),
    new THREE.MeshStandardMaterial({ color: '#3d4728', roughness: 0.98, metalness: 0, transparent: true, opacity: 0.82 }),
  );
  field.name = 'SWVisualSlice5CowLevelField';
  field.rotation.x = -Math.PI / 2;
  field.position.y = 0.18;
  field.receiveShadow = true;
  root.add(field);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(11.7, 12.5, 56),
    new THREE.MeshBasicMaterial({ color: '#b8ff5b', transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
  );
  ring.name = 'SWVisualSlice5CowLevelRing';
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.29;
  ring.userData.baseHue = 0.24;
  root.add(ring);
  swVisualHeroSlice5CowLevelRing = ring;
  swVisualHeroSlice5State.cowLevelRingPresent = true;

  const materials = swVisualHeroSlice5CowMaterials();
  const cowCount = 8;
  for (let index = 0; index < cowCount; index += 1) {
    const angle = (index / cowCount) * Math.PI * 2;
    const radius = 9.0 + (index % 2) * 1.1;
    const localX = Math.cos(angle) * radius;
    const localZ = Math.sin(angle) * radius;
    const worldX = centerX + localX;
    const worldZ = centerZ + localZ;
    const localY = (typeof terrainHeightAt === 'function' ? terrainHeightAt(worldX, worldZ) : centerY) - centerY;
    const cow = swVisualHeroSlice5MakeCow(materials, index, false);
    cow.position.set(localX, localY, localZ);
    cow.rotation.y = Math.PI / 2 - angle;
    cow.userData.baseY = localY;
    cow.userData.baseRotation = cow.rotation.y;
    cow.userData.phase = index * 0.77;
    root.add(cow);
  }

  const champion = swVisualHeroSlice5MakeCow(materials, cowCount, true);
  champion.position.set(0, 0.28, 0);
  champion.scale.setScalar(1.13);
  champion.userData.baseY = 0.28;
  champion.userData.baseRotation = 0;
  champion.userData.phase = 2.4;
  root.add(champion);
  swVisualHeroSlice5State.cowCount = cowCount + 1;

  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.9, 0.55, 18),
    new THREE.MeshStandardMaterial({ color: '#766146', roughness: 0.9, metalness: 0.01 }),
  );
  pedestal.name = 'SWVisualSlice5CowChampionPedestal';
  pedestal.position.y = 0.22;
  root.add(pedestal);

  const sign = swVisualHeroSlice5MakeCowLevelSign();
  sign.position.set(0, 5.1, 14.2);
  root.add(sign);
  swVisualHeroSlice5CowLevelSign = sign;
  swVisualHeroSlice5State.cowLevelSignPresent = true;
  return true;
}

function swVisualHeroSlice5UpdateRainbow(dt, now) {
  if (!swVisualHeroSlice5RainbowRoot || !storm?.pos) return false;
  const seconds = Number(now || 0) * 0.001;
  const scale = Math.max(0.92, Number(typeof funnelScale !== 'undefined' ? funnelScale : 1) || 1);
  swVisualHeroSlice5RainbowRoot.position.copy(storm.pos);
  swVisualHeroSlice5RainbowRoot.scale.setScalar(scale);

  swVisualHeroSlice5RainbowRoot.children.forEach((object, index) => {
    if (object.name.startsWith('SWVisualSlice5RainbowShell')) {
      object.rotation.y = seconds * Number(object.userData.spin || 0.5) + Number(object.userData.phase || 0);
      object.material.opacity = Number(object.userData.baseOpacity || 0.3) * (0.88 + Math.sin(seconds * 2.1 + index) * 0.12);
      return;
    }
    if (object.name.startsWith('SWVisualSlice5RainbowRibbon')) {
      const hue = (Number(object.userData.hue || 0) + seconds * 0.11 + index * 0.018) % 1;
      object.rotation.y = seconds * Number(object.userData.spin || 0.5) + Number(object.userData.phase || 0);
      object.material.color.setHSL(hue, 1, 0.62);
      object.material.opacity = 0.62 + Math.sin(seconds * 3 + index) * 0.10;
      return;
    }
    if (object.name === 'SWVisualSlice5RainbowGlow') {
      const hue = (Number(object.userData.hue || 0) + seconds * 0.14) % 1;
      object.color.setHSL(hue, 1, 0.58);
      object.intensity = (typeof isMobileDevice !== 'undefined' && isMobileDevice ? 0.46 : 0.64) + Math.sin(seconds * 2.4) * 0.08;
    }
  });

  if (typeof funnelMat !== 'undefined' && funnelMat?.color) {
    funnelMat.color.setHSL((seconds * 0.08) % 1, 0.72, 0.58);
    funnelMat.emissive?.setHSL?.((seconds * 0.08 + 0.08) % 1, 0.55, 0.16);
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat?.color) {
    outerFunnelMat.color.setHSL((seconds * 0.08 + 0.45) % 1, 0.60, 0.64);
  }
  return true;
}

function swVisualHeroSlice5UpdateCowLevel(now) {
  if (!swVisualHeroSlice5CowLevelRoot) return false;
  const seconds = Number(now || 0) * 0.001;
  const centerX = Number(swVisualHeroSlice5CowLevelRoot.userData.centerX || 0);
  const centerZ = Number(swVisualHeroSlice5CowLevelRoot.userData.centerZ || 0);
  const stormDistance = storm?.pos ? Math.hypot(Number(storm.pos.x) - centerX, Number(storm.pos.z) - centerZ) : Infinity;
  const active = stormDistance <= 78;
  swVisualHeroSlice5State.cowLevelActive = active;

  swVisualHeroSlice5CowLevelRoot.children.forEach((object, index) => {
    if (!object.name.startsWith('SWVisualSlice5Cow')) return;
    const phase = Number(object.userData.phase || index * 0.5);
    const baseY = Number(object.userData.baseY || 0);
    const baseRotation = Number(object.userData.baseRotation || 0);
    object.position.y = baseY + Math.sin(seconds * (active ? 3.2 : 1.6) + phase) * (active ? 0.18 : 0.06);
    if (object.userData.isChampion) {
      object.rotation.y = baseRotation + seconds * (active ? 1.05 : 0.28);
    } else {
      object.rotation.y = baseRotation + Math.sin(seconds * 1.4 + phase) * (active ? 0.16 : 0.045);
    }
  });

  if (swVisualHeroSlice5CowLevelRing?.material?.color) {
    const hue = (0.24 + seconds * (active ? 0.18 : 0.035)) % 1;
    swVisualHeroSlice5CowLevelRing.material.color.setHSL(hue, 0.95, 0.58);
    swVisualHeroSlice5CowLevelRing.material.opacity = active ? 0.62 : 0.28;
  }
  if (swVisualHeroSlice5CowLevelSign?.material) {
    swVisualHeroSlice5CowLevelSign.material.opacity = active ? 1 : 0.88;
  }
  return true;
}

function swVisualHeroSlice5RefreshWorld() {
  try {
    swVisualHeroSlice5BuildRainbowFunnel();
    swVisualHeroSlice5BuildCowLevel();
    swVisualHeroSlice5State.installed = true;
    return true;
  } catch (error) {
    swVisualHeroSlice5State.lastError = String(error?.message || error);
    return false;
  }
}

const swVisualHeroSlice5RefreshBase = swVisualRefreshHeroSlice;
swVisualRefreshHeroSlice = function swVisualRefreshHeroSliceWithRainbowCowLevel(...args) {
  const result = swVisualHeroSlice5RefreshBase.apply(this, args);
  swVisualHeroSlice5RefreshWorld();
  return result;
};

const swVisualHeroSlice5UpdateBase = swVisualUpdate;
swVisualUpdate = function swVisualUpdateWithHeroSlice5ArcadeWeather(dt, now) {
  const result = swVisualHeroSlice5UpdateBase(dt, now);
  swVisualHeroSlice5UpdateRainbow(dt, now);
  swVisualHeroSlice5UpdateCowLevel(now);
  return result;
};

const swVisualHeroSlice5SnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice5() {
  const base = swVisualHeroSlice5SnapshotBase();
  return Object.freeze({
    ...base,
    heroSlice5Version: THREEJS_VISUAL_HERO_SLICE5_VERSION,
    rainbowFunnel: Object.freeze({
      rootPresent: Boolean(swVisualHeroSlice5RainbowRoot?.parent),
      shellCount: swVisualHeroSlice5State.rainbowShellCount,
      ribbonCount: swVisualHeroSlice5State.rainbowRibbonCount,
      lightCount: swVisualHeroSlice5State.rainbowLightCount,
      legacyFunnelDimmed: swVisualHeroSlice5State.legacyFunnelDimmed,
      presentationOnly: true,
    }),
    cowLevel: Object.freeze({
      rootPresent: Boolean(swVisualHeroSlice5CowLevelRoot?.parent),
      cowCount: swVisualHeroSlice5State.cowCount,
      signPresent: swVisualHeroSlice5State.cowLevelSignPresent,
      ringPresent: swVisualHeroSlice5State.cowLevelRingPresent,
      active: swVisualHeroSlice5State.cowLevelActive,
      presentationOnly: true,
    }),
    heroSlice5LastError: swVisualHeroSlice5State.lastError,
  });
};

const swVisualHeroSlice5BuildLivingCountyBase = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithHeroSlice5FunReset(...args) {
  swVisualHeroSlice5State.worldGeneration += 1;
  swVisualHeroSlice5DisposeRainbow();
  swVisualHeroSlice5DisposeCowLevel();
  const result = swVisualHeroSlice5BuildLivingCountyBase.apply(this, args);
  Promise.resolve().then(() => Promise.resolve()).then(() => swVisualHeroSlice5RefreshWorld());
  return result;
};

const swVisualHeroSlice5BridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice5BridgeBase,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  getSnapshot: swVisualSnapshot,
  heroSlice5Version: THREEJS_VISUAL_HERO_SLICE5_VERSION,
  refreshHeroSlice5: swVisualHeroSlice5RefreshWorld,
});

Promise.resolve().then(() => swVisualHeroSlice5RefreshWorld());
// [SW:VISUAL:HERO_SLICE5:END]
