// ============================================================================
// [SW:VISUAL:HERO_SLICE5:POLISH]
// THREEJS_VISUAL_HERO_SLICE5_POLISH_V1
//
// Presentation-only correction after Hero Slice 5 Run #3 visual review:
// - keep Neon rainbow color readable instead of additive whiteout;
// - reduce Hart Farm cow-secret mesh/draw pressure with instanced detail parts;
// - provide a deterministic QA camera that actually frames the cow secret.
// Gameplay authority and the existing Neon selection remain untouched.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE5_POLISH_VERSION = 'THREEJS_VISUAL_HERO_SLICE5_POLISH_V1';

const swVisualHeroSlice5PolishState = {
  cowMeshBudget: 55,
  cowVisibilityDistance: 165,
  rainbowProfile: 'balanced-neon-v1',
};

function swVisualHeroSlice5SetInstanceTransform(mesh, index, x, y, z, rx = 0, ry = 0, rz = 0) {
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3(x, y, z);
  const quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz));
  matrix.compose(position, quaternion, new THREE.Vector3(1, 1, 1));
  mesh.setMatrixAt(index, matrix);
}

swVisualHeroSlice5MakeCow = function swVisualHeroSlice5MakeCompactCow(materials, index, champion = false) {
  const cow = new THREE.Group();
  cow.name = champion ? 'SWVisualSlice5CowChampion' : `SWVisualSlice5Cow${index + 1}`;
  cow.userData.swPresentationOnly = true;
  cow.userData.isChampion = champion;

  const bodyMaterial = champion ? materials.gold : materials.white;
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.55, 1.45), bodyMaterial);
  body.position.y = 1.55;
  cow.add(body);

  const head = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.18, 1.18), bodyMaterial);
  head.position.set(0, 1.78, -1.58);
  cow.add(head);

  const legs = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.30, 1.35, 0.32),
    champion ? materials.gold : materials.hoof,
    4,
  );
  legs.name = `${cow.name}Legs`;
  [
    [-0.92, 0.68, -0.45],
    [0.92, 0.68, -0.45],
    [-0.92, 0.68, 0.45],
    [0.92, 0.68, 0.45],
  ].forEach(([x, y, z], instanceIndex) => swVisualHeroSlice5SetInstanceTransform(legs, instanceIndex, x, y, z));
  legs.instanceMatrix.needsUpdate = true;
  cow.add(legs);

  if (!champion) {
    const spots = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.72, 0.76, 0.055),
      materials.dark,
      2,
    );
    spots.name = `${cow.name}Spots`;
    swVisualHeroSlice5SetInstanceTransform(spots, 0, 0.65, 1.72, 0.735);
    swVisualHeroSlice5SetInstanceTransform(spots, 1, -0.55, 1.28, -0.735);
    spots.instanceMatrix.needsUpdate = true;
    cow.add(spots);
  }

  const horns = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.13, 0.62, 7),
    champion ? materials.gold : materials.horn,
    2,
  );
  horns.name = `${cow.name}Horns`;
  swVisualHeroSlice5SetInstanceTransform(horns, 0, -0.42, 2.48, -1.60, 0, 0, 0.32);
  swVisualHeroSlice5SetInstanceTransform(horns, 1, 0.42, 2.48, -1.60, 0, 0, -0.32);
  horns.instanceMatrix.needsUpdate = true;
  cow.add(horns);

  cow.traverse((object) => {
    if (!object?.isMesh) return;
    object.castShadow = Boolean(productionQualityConfig?.().shadows);
    object.receiveShadow = true;
  });
  return cow;
};

function swVisualHeroSlice5ApplyBalancedNeon() {
  if (!swVisualHeroSlice5RainbowRoot) return false;
  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  swVisualHeroSlice5RainbowRoot.children.forEach((object, index) => {
    if (object.name.startsWith('SWVisualSlice5RainbowShell')) {
      const baseOpacity = index === 0 ? 0.13 : 0.07;
      object.userData.baseOpacity = baseOpacity;
      object.material.blending = THREE.NormalBlending;
      object.material.opacity = baseOpacity;
      object.material.needsUpdate = true;
      return;
    }
    if (object.name.startsWith('SWVisualSlice5RainbowRibbon')) {
      object.userData.polishBaseOpacity = 0.24;
      object.material.opacity = 0.24;
      object.material.needsUpdate = true;
      return;
    }
    if (object.name === 'SWVisualSlice5RainbowGlow') {
      object.intensity = mobile ? 0.08 : 0.12;
      object.distance = 56;
    }
  });

  if (typeof funnelMat !== 'undefined' && funnelMat) {
    funnelMat.opacity = 0.12;
    funnelMat.needsUpdate = true;
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat) {
    outerFunnelMat.opacity = 0.07;
    outerFunnelMat.needsUpdate = true;
  }
  return true;
}

const swVisualHeroSlice5BuildRainbowFunnelPolishBase = swVisualHeroSlice5BuildRainbowFunnel;
swVisualHeroSlice5BuildRainbowFunnel = function swVisualHeroSlice5BuildBalancedRainbowFunnel(...args) {
  const result = swVisualHeroSlice5BuildRainbowFunnelPolishBase.apply(this, args);
  if (result !== false) swVisualHeroSlice5ApplyBalancedNeon();
  return result;
};

const swVisualHeroSlice5UpdateRainbowPolishBase = swVisualHeroSlice5UpdateRainbow;
swVisualHeroSlice5UpdateRainbow = function swVisualHeroSlice5UpdateBalancedRainbow(dt, now) {
  const result = swVisualHeroSlice5UpdateRainbowPolishBase.call(this, dt, now);
  if (!result || !swVisualHeroSlice5RainbowRoot) return result;

  const seconds = Number(now || 0) * 0.001;
  const mobile = typeof isMobileDevice !== 'undefined' && isMobileDevice;
  swVisualHeroSlice5RainbowRoot.children.forEach((object, index) => {
    if (object.name.startsWith('SWVisualSlice5RainbowShell')) {
      const baseOpacity = Number(object.userData.baseOpacity || (index === 0 ? 0.13 : 0.07));
      object.material.opacity = baseOpacity * (0.94 + Math.sin(seconds * 2.1 + index) * 0.06);
      return;
    }
    if (object.name.startsWith('SWVisualSlice5RainbowRibbon')) {
      const hue = (Number(object.userData.hue || 0) + seconds * 0.11 + index * 0.018) % 1;
      object.material.color.setHSL(hue, 1, 0.50);
      object.material.opacity = 0.24 + Math.sin(seconds * 3 + index) * 0.035;
      return;
    }
    if (object.name === 'SWVisualSlice5RainbowGlow') {
      const hue = (Number(object.userData.hue || 0) + seconds * 0.14) % 1;
      object.color.setHSL(hue, 1, 0.48);
      object.intensity = (mobile ? 0.08 : 0.12) + Math.sin(seconds * 2.4) * 0.015;
    }
  });

  if (typeof funnelMat !== 'undefined' && funnelMat?.color) {
    funnelMat.opacity = 0.12;
    funnelMat.color.setHSL((seconds * 0.08) % 1, 0.56, 0.34);
    funnelMat.emissive?.setHSL?.((seconds * 0.08 + 0.08) % 1, 0.44, 0.07);
  }
  if (typeof outerFunnelMat !== 'undefined' && outerFunnelMat?.color) {
    outerFunnelMat.opacity = 0.07;
    outerFunnelMat.color.setHSL((seconds * 0.08 + 0.45) % 1, 0.50, 0.38);
  }
  return result;
};

const swVisualHeroSlice5UpdateCowLevelPolishBase = swVisualHeroSlice5UpdateCowLevel;
swVisualHeroSlice5UpdateCowLevel = function swVisualHeroSlice5UpdateCowLevelWithDistanceBudget(now) {
  const result = swVisualHeroSlice5UpdateCowLevelPolishBase.call(this, now);
  if (!swVisualHeroSlice5CowLevelRoot) return result;
  const centerX = Number(swVisualHeroSlice5CowLevelRoot.userData.centerX || 0);
  const centerZ = Number(swVisualHeroSlice5CowLevelRoot.userData.centerZ || 0);
  const stormDistance = storm?.pos
    ? Math.hypot(Number(storm.pos.x) - centerX, Number(storm.pos.z) - centerZ)
    : Infinity;
  const qaFocused = typeof swVisualFoundationState !== 'undefined' && swVisualFoundationState.qaMode === 'cow-level';
  swVisualHeroSlice5CowLevelRoot.visible = qaFocused || stormDistance <= swVisualHeroSlice5PolishState.cowVisibilityDistance;
  return result;
};

const swVisualHeroSlice5PrepareQaViewPolishBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__?.prepareQaView;
function swVisualHeroSlice5PrepareQaViewPolished(mode = 'storefront') {
  if (mode !== 'cow-level') return swVisualHeroSlice5PrepareQaViewPolishBase?.(mode) ?? false;
  if (!swVisualHeroSlice5CowLevelRoot?.parent) swVisualHeroSlice5RefreshWorld();
  if (!swVisualHeroSlice5CowLevelRoot?.parent) return false;

  swVisualFoundationState.qaMode = mode;
  if (typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause === 'function') globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
  globalThis.productionQaPrepared = true;
  document.getElementById('mainMenu')?.classList.add('hidden');

  const center = new THREE.Vector3();
  swVisualHeroSlice5CowLevelRoot.getWorldPosition(center);
  swVisualHeroSlice5CowLevelRoot.visible = true;
  camera.position.set(center.x + 28, center.y + 16, center.z + 30);
  camera.lookAt(center.x, center.y + 2.35, center.z);
  swVisualUpdate(0, 1000);
  renderer.render(scene, camera);
  return true;
}

const swVisualHeroSlice5SnapshotPolishBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice5Polish() {
  const base = swVisualHeroSlice5SnapshotPolishBase();
  return Object.freeze({
    ...base,
    rainbowFunnel: Object.freeze({
      ...(base.rainbowFunnel || {}),
      polishProfile: swVisualHeroSlice5PolishState.rainbowProfile,
    }),
    cowLevel: Object.freeze({
      ...(base.cowLevel || {}),
      visible: Boolean(swVisualHeroSlice5CowLevelRoot?.visible),
      meshBudget: swVisualHeroSlice5PolishState.cowMeshBudget,
      visibilityDistance: swVisualHeroSlice5PolishState.cowVisibilityDistance,
    }),
    heroSlice5PolishVersion: THREEJS_VISUAL_HERO_SLICE5_POLISH_VERSION,
  });
};

const swVisualHeroSlice5PolishBridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice5PolishBridgeBase,
  getSnapshot: swVisualSnapshot,
  prepareQaView: swVisualHeroSlice5PrepareQaViewPolished,
  refreshHeroSlice5: swVisualHeroSlice5RefreshWorld,
  heroSlice5PolishVersion: THREEJS_VISUAL_HERO_SLICE5_POLISH_VERSION,
});
// [SW:VISUAL:HERO_SLICE5:POLISH:END]
