// ============================================================================
// [SW:VISUAL:THREEJS_FOUNDATION]
// THREEJS_VISUAL_FOUNDATION_V1
//
// Presentation-only hero-slice layer around the accepted Three.js game.
// It may grade renderer/light/fog presentation and add decorative scene objects.
// It may not mutate storm authority, target gameplay truth, score, timer, campaign,
// abilities, animal safety, or accepted movement/camera behavior outside QA views.
// ============================================================================
const THREEJS_VISUAL_FOUNDATION_VERSION = 'THREEJS_VISUAL_FOUNDATION_V1';

const swVisualFoundationState = {
  installed: false,
  updateCount: 0,
  worldGeneration: 0,
  heroRefreshes: 0,
  heroCampaignId: '',
  qaMode: null,
  lastError: null,
};

let swVisualRoot = null;
let swVisualHeroRoot = null;
let swVisualSkyDome = null;
let swVisualRimLight = null;
let swVisualCloudTexture = null;
let swVisualDustTexture = null;
let swVisualCloudCards = [];
let swVisualDustCards = [];
let swVisualHeroLights = [];
let swVisualLastHeroKey = '';

function swVisualSafeColor(value, fallback) {
  try { return new THREE.Color(value); } catch (_) { return new THREE.Color(fallback); }
}

function swVisualMakeSoftTexture(kind = 'cloud') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (kind === 'dust') {
    const blobs = [
      [0.36, 0.52, 0.29, 0.58],
      [0.58, 0.46, 0.34, 0.54],
      [0.52, 0.62, 0.27, 0.48],
      [0.42, 0.36, 0.22, 0.34],
    ];
    blobs.forEach(([x, y, radius, alpha], index) => {
      const gradient = context.createRadialGradient(
        x * 256, y * 256, 0,
        x * 256, y * 256, radius * 256,
      );
      gradient.addColorStop(0, `rgba(255,245,224,${alpha})`);
      gradient.addColorStop(0.42, `rgba(228,205,171,${alpha * 0.72})`);
      gradient.addColorStop(1, 'rgba(189,158,116,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
      if (index % 2 === 0) context.rotate(0.015);
    });
  } else {
    const blobs = [
      [0.29, 0.55, 0.31, 0.62],
      [0.47, 0.43, 0.36, 0.78],
      [0.66, 0.54, 0.30, 0.66],
      [0.51, 0.67, 0.32, 0.46],
    ];
    blobs.forEach(([x, y, radius, alpha]) => {
      const gradient = context.createRadialGradient(
        x * 256, y * 256, 0,
        x * 256, y * 256, radius * 256,
      );
      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(0.48, `rgba(226,235,244,${alpha * 0.72})`);
      gradient.addColorStop(1, 'rgba(180,196,210,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 256);
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.name = kind === 'dust' ? 'SWVisualDustCardTexture' : 'SWVisualCloudCardTexture';
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function swVisualDisposeObject(root) {
  if (!root) return;
  root.traverse((object) => {
    if (object.geometry?.dispose) object.geometry.dispose();
    const materials = object.material
      ? (Array.isArray(object.material) ? object.material : [object.material])
      : [];
    materials.forEach((material) => material?.dispose?.());
  });
  if (root.parent) root.parent.remove(root);
}

function swVisualCreateSkyDome() {
  const uniforms = {
    topColor: { value: swVisualSafeColor('#16314a', '#16314a') },
    horizonColor: { value: swVisualSafeColor('#6d8794', '#6d8794') },
    lowColor: { value: swVisualSafeColor('#293c3e', '#293c3e') },
    stormWeight: { value: 0.12 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec3 vWorldDirection;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldDirection = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 lowColor;
      uniform float stormWeight;
      varying vec3 vWorldDirection;
      void main() {
        float y = clamp(vWorldDirection.y, -1.0, 1.0);
        float upper = smoothstep(-0.05, 0.72, y);
        float lower = 1.0 - smoothstep(-0.42, 0.10, y);
        vec3 color = mix(horizonColor, topColor, upper);
        color = mix(color, lowColor, lower * 0.78);
        float horizonBand = exp(-abs(y) * 7.5);
        color += horizonBand * vec3(0.055, 0.045, 0.025) * (1.0 - stormWeight * 0.5);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(720, 28, 16), material);
  dome.name = 'SWVisualSkyDome';
  dome.frustumCulled = false;
  dome.renderOrder = -1000;
  return dome;
}

function swVisualCreateCloudCards() {
  if (!swVisualCloudTexture) swVisualCloudTexture = swVisualMakeSoftTexture('cloud');
  const cards = [];
  const cardCount = isMobileDevice ? 5 : 7;
  for (let index = 0; index < cardCount; index += 1) {
    const material = new THREE.SpriteMaterial({
      map: swVisualCloudTexture,
      color: index % 2 ? '#8193a3' : '#9aa7b1',
      transparent: true,
      opacity: 0.14 + (index % 3) * 0.035,
      depthWrite: false,
      fog: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.name = `SWVisualCloudCard${index + 1}`;
    const width = 112 + (index % 3) * 34;
    sprite.scale.set(width, width * (0.32 + (index % 2) * 0.05), 1);
    sprite.userData.angle = index / cardCount * Math.PI * 2 + 0.28;
    sprite.userData.radius = 230 + (index % 3) * 38;
    sprite.userData.height = 82 + (index % 4) * 16;
    swVisualRoot.add(sprite);
    cards.push(sprite);
  }
  return cards;
}

function swVisualCreateDustCards() {
  if (!swVisualDustTexture) swVisualDustTexture = swVisualMakeSoftTexture('dust');
  const cards = [];
  const cardCount = isMobileDevice ? 9 : 13;
  for (let index = 0; index < cardCount; index += 1) {
    const material = new THREE.SpriteMaterial({
      map: swVisualDustTexture,
      color: index % 3 === 0 ? '#a98d6c' : '#c0a680',
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      fog: true,
    });
    const sprite = new THREE.Sprite(material);
    sprite.name = `SWVisualStormDust${index + 1}`;
    sprite.userData.angle = index / cardCount * Math.PI * 2;
    sprite.userData.radius = 8.5 + (index % 5) * 2.7;
    sprite.userData.speed = 0.34 + (index % 4) * 0.09;
    sprite.userData.phase = index * 0.73;
    const width = 8 + (index % 4) * 2.4;
    sprite.scale.set(width, width * 0.58, 1);
    swVisualRoot.add(sprite);
    cards.push(sprite);
  }
  return cards;
}

function swVisualEnsureRoot() {
  if (swVisualRoot?.parent === scene) return true;
  if (!scene || !renderer || !camera) return false;

  swVisualRoot = new THREE.Group();
  swVisualRoot.name = 'SWThreeJsVisualFoundation';
  scene.add(swVisualRoot);

  swVisualSkyDome = swVisualCreateSkyDome();
  swVisualRoot.add(swVisualSkyDome);
  swVisualCloudCards = swVisualCreateCloudCards();
  swVisualDustCards = swVisualCreateDustCards();

  swVisualRimLight = new THREE.DirectionalLight('#a6c5dc', 0.28);
  swVisualRimLight.name = 'SWVisualStormRimLight';
  swVisualRimLight.position.set(-80, 120, -55);
  swVisualRimLight.castShadow = false;
  swVisualRoot.add(swVisualRimLight);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  swVisualFoundationState.installed = true;
  return true;
}

function swVisualConformedPlane(width, depth, x, z, offset, color, roughness = 0.94, opacity = 1) {
  const raw = new THREE.PlaneGeometry(width, depth, 5, 5);
  const geometry = typeof conformPlaneToTerrain === 'function'
    ? conformPlaneToTerrain(raw, x, z, offset)
    : raw;
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.01,
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity >= 0.98,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.set(x, 0, z);
  plane.receiveShadow = true;
  plane.castShadow = false;
  return plane;
}

function swVisualAddLamp(root, x, z, yaw = 0) {
  const y = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : 0;
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = yaw;

  const poleMaterial = new THREE.MeshStandardMaterial({ color: '#29313a', roughness: 0.62, metalness: 0.42 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.4, 7), poleMaterial);
  pole.position.y = 3.2;
  pole.castShadow = productionQualityConfig().shadows;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 0.15), poleMaterial.clone());
  arm.position.set(0.92, 6.2, 0);
  group.add(arm);

  const head = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.22, 0.5),
    new THREE.MeshStandardMaterial({
      color: '#f2d89d',
      emissive: '#ffbf69',
      emissiveIntensity: 0.62,
      roughness: 0.48,
    }),
  );
  head.position.set(1.82, 6.05, 0);
  group.add(head);

  const light = new THREE.PointLight('#ffbf69', 0.34, 22, 2);
  light.position.set(1.82, 5.85, 0);
  light.castShadow = false;
  group.add(light);
  swVisualHeroLights.push(light);

  root.add(group);
}

function swVisualGetHartFarmPresentationAnchor() {
  const node = scene?.getObjectByName?.('HartFarmSignatureBarn') || null;
  if (!node) return null;
  const position = new THREE.Vector3();
  node.getWorldPosition(position);
  return Object.freeze({
    node,
    x: Number(position.x),
    z: Number(position.z),
  });
}

function swVisualRefreshHeroSlice() {
  if (!swVisualEnsureRoot()) return false;

  const campaignId = typeof getActiveCampaignLevel === 'function'
    ? String(getActiveCampaignLevel()?.id || '')
    : '';
  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1') || null;
  const hartFarm = swVisualGetHartFarmPresentationAnchor();
  const barnKey = hartFarm ? `${Math.round(hartFarm.x)}:${Math.round(hartFarm.z)}` : 'none';
  const shopKey = storefront ? `${Math.round(storefront.x)}:${Math.round(storefront.z)}` : 'none';
  const heroKey = `${campaignId}|${barnKey}|${shopKey}`;
  if (swVisualHeroRoot && swVisualLastHeroKey === heroKey) return true;

  swVisualDisposeObject(swVisualHeroRoot);
  swVisualHeroLights = [];
  swVisualHeroRoot = new THREE.Group();
  swVisualHeroRoot.name = 'SWVisualHeroSliceDressing';
  swVisualRoot.add(swVisualHeroRoot);
  swVisualLastHeroKey = heroKey;

  if (hartFarm) {
    const barnX = hartFarm.x;
    const barnZ = hartFarm.z;
    const apron = swVisualConformedPlane(44, 34, barnX, barnZ, 0.09, '#715941', 0.98, 0.92);
    apron.name = 'SWVisualHartFarmDirtApron';
    swVisualHeroRoot.add(apron);

    const track = swVisualConformedPlane(6.4, 74, barnX + 17, barnZ + 39, 0.10, '#75634f', 0.99, 0.9);
    track.name = 'SWVisualHartFarmTrack';
    swVisualHeroRoot.add(track);
  }

  if (storefront) {
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    const asphalt = swVisualConformedPlane(52, 38, x, z, 0.10, '#2a3035', 0.96, 0.96);
    asphalt.name = 'SWVisualStorefrontAsphalt';
    swVisualHeroRoot.add(asphalt);

    const sidewalk = swVisualConformedPlane(46, 4.4, x, z - 17.1, 0.17, '#a89f91', 0.91, 1);
    sidewalk.name = 'SWVisualStorefrontSidewalk';
    swVisualHeroRoot.add(sidewalk);

    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(46, 0.34, 0.65),
      new THREE.MeshStandardMaterial({ color: '#c6bfb2', roughness: 0.92 }),
    );
    curb.position.set(x, terrainHeightAt(x, z - 18.9) + 0.28, z - 18.9);
    curb.receiveShadow = true;
    curb.castShadow = productionQualityConfig().shadows;
    curb.name = 'SWVisualStorefrontCurb';
    swVisualHeroRoot.add(curb);

    [-18, 18].forEach((offset, index) => swVisualAddLamp(swVisualHeroRoot, x + offset, z - 14.8, index ? Math.PI : 0));

    for (let index = 0; index < 5; index += 1) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.05, 7.4),
        new THREE.MeshBasicMaterial({ color: '#d9d5c8' }),
      );
      const lx = x - 15 + index * 7.5;
      const lz = z + 7.8;
      line.position.set(lx, terrainHeightAt(lx, lz) + 0.17, lz);
      line.name = 'SWVisualParkingStripe';
      swVisualHeroRoot.add(line);
    }
  }

  swVisualFoundationState.heroRefreshes += 1;
  swVisualFoundationState.heroCampaignId = campaignId;
  return true;
}

function swVisualUpdatePalette(dt) {
  const stage = Number(currentStage || 1);
  const t = THREE.MathUtils.clamp((stage - 1) / 2, 0, 1);
  const blend = Math.min(1, Math.max(0, dt) * 0.42);

  const palette = stage === 1
    ? { top: '#173b57', horizon: '#7b8c91', low: '#33433f', fog: '#50626c', dir: '#f2d6a2', rim: '#9bc5df', ambient: '#9eb6c8' }
    : (stage === 2
      ? { top: '#112d43', horizon: '#60747d', low: '#263536', fog: '#394d59', dir: '#e0d2b6', rim: '#91b9d1', ambient: '#8da6ba' }
      : { top: '#0a1c2d', horizon: '#425863', low: '#182729', fog: '#263b48', dir: '#c8d5e4', rim: '#8fb9d8', ambient: '#7f9aae' });

  if (swVisualSkyDome?.material?.uniforms) {
    swVisualSkyDome.material.uniforms.topColor.value.lerp(swVisualSafeColor(palette.top, '#173b57'), blend);
    swVisualSkyDome.material.uniforms.horizonColor.value.lerp(swVisualSafeColor(palette.horizon, '#7b8c91'), blend);
    swVisualSkyDome.material.uniforms.lowColor.value.lerp(swVisualSafeColor(palette.low, '#33433f'), blend);
    swVisualSkyDome.material.uniforms.stormWeight.value = THREE.MathUtils.lerp(
      Number(swVisualSkyDome.material.uniforms.stormWeight.value || 0),
      0.18 + t * 0.58,
      blend,
    );
  }

  if (scene.fog?.color) scene.fog.color.lerp(swVisualSafeColor(palette.fog, '#50626c'), blend * 0.44);
  if (scene.background?.isColor) scene.background.lerp(swVisualSafeColor(palette.fog, '#50626c'), blend * 0.28);
  if (ambientLight?.color) ambientLight.color.lerp(swVisualSafeColor(palette.ambient, '#9eb6c8'), blend * 0.32);
  if (dirLight?.color) dirLight.color.lerp(swVisualSafeColor(palette.dir, '#f2d6a2'), blend * 0.42);
  if (swVisualRimLight?.color) swVisualRimLight.color.lerp(swVisualSafeColor(palette.rim, '#9bc5df'), blend * 0.45);

  if (swVisualRimLight) swVisualRimLight.intensity = THREE.MathUtils.lerp(swVisualRimLight.intensity, 0.24 + t * 0.24, blend);
  const targetExposure = stage === 1 ? 0.98 : (stage === 2 ? 0.86 : 0.76);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(renderer.toneMappingExposure, targetExposure, blend * 0.52);
}

function swVisualUpdateCards(dt, now) {
  const seconds = Number(now || 0) * 0.001;
  if (swVisualSkyDome) {
    swVisualSkyDome.position.set(camera.position.x, camera.position.y * 0.18, camera.position.z);
  }

  swVisualCloudCards.forEach((sprite, index) => {
    const angle = Number(sprite.userData.angle || 0) + Math.sin(seconds * 0.018 + index) * 0.018;
    const radius = Number(sprite.userData.radius || 240);
    sprite.position.set(
      camera.position.x + Math.cos(angle) * radius,
      Number(sprite.userData.height || 90),
      camera.position.z + Math.sin(angle) * radius,
    );
    const stageOpacity = currentStage === 1 ? 0.13 : (currentStage === 2 ? 0.19 : 0.24);
    sprite.material.opacity = stageOpacity + (index % 3) * 0.025;
    sprite.material.rotation = Math.sin(seconds * 0.025 + index * 0.8) * 0.06;
  });

  if (!storm?.pos) return;
  swVisualDustCards.forEach((sprite, index) => {
    sprite.userData.angle += Math.max(0, dt) * Number(sprite.userData.speed || 0.4) * (0.92 + Number(efMultiplier || 1) * 0.12);
    const angle = Number(sprite.userData.angle || 0);
    const radius = Number(sprite.userData.radius || 10);
    const phase = Number(sprite.userData.phase || 0);
    const x = storm.pos.x + Math.cos(angle) * radius;
    const z = storm.pos.z + Math.sin(angle) * radius;
    const baseY = typeof terrainHeightAt === 'function' ? terrainHeightAt(x, z) : storm.pos.y;
    sprite.position.set(x, baseY + 1.4 + Math.sin(seconds * 2.2 + phase) * 0.7, z);
    const pulse = 0.9 + Math.sin(seconds * 2.8 + phase) * 0.12;
    const baseScale = 8 + (index % 4) * 2.4;
    sprite.scale.set(baseScale * pulse, baseScale * 0.58 * pulse, 1);
    sprite.material.opacity = 0.11 + Math.min(0.12, Number(efMultiplier || 1) * 0.035) + (index % 3) * 0.014;
  });
}

function swVisualUpdateHeroLighting() {
  const stageFactor = THREE.MathUtils.clamp((Number(currentStage || 1) - 1) / 2, 0, 1);
  swVisualHeroLights.forEach((light, index) => {
    light.intensity = 0.26 + stageFactor * 0.32 + (index % 2) * 0.04;
  });
}

function swVisualUpdate(dt, now) {
  try {
    if (!swVisualEnsureRoot()) return false;
    const effectiveDt = swVisualFoundationState.qaMode ? 0 : Number(dt || 0);
    const effectiveNow = swVisualFoundationState.qaMode ? 1000 : Number(now || 0);
    swVisualUpdatePalette(effectiveDt || 1 / 60);
    swVisualUpdateCards(effectiveDt, effectiveNow);
    swVisualUpdateHeroLighting();

    const campaignId = typeof getActiveCampaignLevel === 'function' ? String(getActiveCampaignLevel()?.id || '') : '';
    const appliedCount = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getSnapshot?.().appliedCount || 0;
    const hartFarmPresent = Boolean(scene?.getObjectByName?.('HartFarmSignatureBarn'));
    const currentHeroKey = `${campaignId}|${hartFarmPresent ? 'barn' : 'none'}|${appliedCount}`;
    if (!swVisualHeroRoot || !swVisualLastHeroKey.startsWith(`${campaignId}|`) || !swVisualLastHeroKey.endsWith(appliedCount ? swVisualLastHeroKey.split('|').at(-1) : 'none')) {
      Promise.resolve().then(() => swVisualRefreshHeroSlice());
    } else if (currentHeroKey && swVisualHeroRoot.parent !== swVisualRoot) {
      Promise.resolve().then(() => swVisualRefreshHeroSlice());
    }

    swVisualFoundationState.updateCount += 1;
    return true;
  } catch (error) {
    swVisualFoundationState.lastError = String(error?.message || error);
    return false;
  }
}

function swVisualPrepareQaView(mode = 'storefront') {
  if (!swVisualEnsureRoot()) return false;
  swVisualFoundationState.qaMode = mode;
  if (typeof globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.pause === 'function') globalThis.__SW_PHASE2_CLOCK_BRIDGE__.pause();
  globalThis.productionQaPrepared = true;
  document.getElementById('mainMenu')?.classList.add('hidden');

  swVisualRefreshHeroSlice();
  const hartFarm = swVisualGetHartFarmPresentationAnchor();
  if (mode === 'farm' && hartFarm) {
    const x = hartFarm.x;
    const z = hartFarm.z;
    camera.position.set(x + 50, terrainHeightAt(x, z) + 31, z + 48);
    camera.lookAt(x, terrainHeightAt(x, z) + 7.8, z);
  } else if (mode === 'storm' && storm?.pos) {
    camera.position.set(storm.pos.x + 48, storm.pos.y + 30, storm.pos.z + 54);
    camera.lookAt(storm.pos.x, storm.pos.y + 7, storm.pos.z);
  } else {
    const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
    const storefront = applied.find((entry) => entry.assetId === 'structure.storefront.v1');
    if (!storefront) return false;
    const x = Number(storefront.x);
    const z = Number(storefront.z);
    camera.position.set(x + 38, terrainHeightAt(x, z) + 24, z + 42);
    camera.lookAt(x, terrainHeightAt(x, z) + 6.8, z);
  }

  swVisualUpdate(0, 1000);
  renderer.render(scene, camera);
  return true;
}

function swVisualClearQaView() {
  swVisualFoundationState.qaMode = null;
  globalThis.productionQaPrepared = false;
  return true;
}

function swVisualSnapshot() {
  const applied = globalThis.__SW_THREEJS_ASSET_PIPELINE__?.getAppliedTargets?.() || [];
  return Object.freeze({
    version: THREEJS_VISUAL_FOUNDATION_VERSION,
    installed: swVisualFoundationState.installed,
    updateCount: swVisualFoundationState.updateCount,
    worldGeneration: swVisualFoundationState.worldGeneration,
    heroRefreshes: swVisualFoundationState.heroRefreshes,
    heroCampaignId: swVisualFoundationState.heroCampaignId,
    qaMode: swVisualFoundationState.qaMode,
    lastError: swVisualFoundationState.lastError,
    renderer: Object.freeze({
      threeRevision: String(THREE.REVISION || ''),
      toneMapping: renderer.toneMapping === THREE.ACESFilmicToneMapping ? 'ACESFilmicToneMapping' : String(renderer.toneMapping),
      outputEncoding: renderer.outputEncoding === THREE.sRGBEncoding ? 'sRGBEncoding' : String(renderer.outputEncoding),
      exposure: Number(renderer.toneMappingExposure),
    }),
    atmosphere: Object.freeze({
      skyDomePresent: Boolean(swVisualSkyDome?.parent),
      cloudCardCount: swVisualCloudCards.length,
      dustCardCount: swVisualDustCards.length,
      rimLightPresent: Boolean(swVisualRimLight?.parent),
      fogColor: scene.fog?.color?.getHexString ? `#${scene.fog.color.getHexString()}` : null,
    }),
    hero: Object.freeze({
      rootPresent: Boolean(swVisualHeroRoot?.parent),
      childCount: swVisualHeroRoot?.children?.length || 0,
      hartFarmApronPresent: Boolean(swVisualHeroRoot?.getObjectByName('SWVisualHartFarmDirtApron')),
      storefrontAsphaltPresent: Boolean(swVisualHeroRoot?.getObjectByName('SWVisualStorefrontAsphalt')),
      storefrontSidewalkPresent: Boolean(swVisualHeroRoot?.getObjectByName('SWVisualStorefrontSidewalk')),
      heroLightCount: swVisualHeroLights.length,
      authoredStorefrontCount: applied.filter((entry) => entry.assetId === 'structure.storefront.v1').length,
    }),
  });
}

const swVisualOriginalBuildLivingCounty = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithVisualProductionFoundation(...args) {
  swVisualFoundationState.worldGeneration += 1;
  swVisualLastHeroKey = '';
  const result = swVisualOriginalBuildLivingCounty.apply(this, args);
  Promise.resolve().then(() => Promise.resolve()).then(() => swVisualRefreshHeroSlice());
  return result;
};

globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  version: THREEJS_VISUAL_FOUNDATION_VERSION,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  prepareQaView: swVisualPrepareQaView,
  clearQaView: swVisualClearQaView,
  getSnapshot: swVisualSnapshot,
});

Promise.resolve().then(() => swVisualEnsureRoot()).then(() => swVisualRefreshHeroSlice());
// [SW:VISUAL:THREEJS_FOUNDATION:END]
