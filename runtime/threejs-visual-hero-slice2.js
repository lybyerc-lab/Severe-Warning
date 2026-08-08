// ============================================================================
// [SW:VISUAL:HERO_SLICE2]
// THREEJS_VISUAL_HERO_SLICE2_V1
//
// Layered visual polish on top of the green Three.js visual foundation.
// This file may restyle existing presentation meshes, tune existing lights,
// and provide deterministic visual-QA camera framing. Gameplay truth stays frozen.
// ============================================================================
const THREEJS_VISUAL_HERO_SLICE2_VERSION = 'THREEJS_VISUAL_HERO_SLICE2_V1';
const swVisualHeroSlice2SurfaceTextures = new Map();
const swVisualHeroSlice2Styled = { storefront: false, hartFarm: false };

function swVisualHeroSlice2CanvasTexture(key, width, height, painter, repeatX = 1, repeatY = 1) {
  if (swVisualHeroSlice2SurfaceTextures.has(key)) return swVisualHeroSlice2SurfaceTextures.get(key);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  painter(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.name = `SWVisualHeroSlice2_${key}`;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  if (typeof THREE.sRGBEncoding !== 'undefined') texture.encoding = THREE.sRGBEncoding;
  texture.needsUpdate = true;
  swVisualHeroSlice2SurfaceTextures.set(key, texture);
  return texture;
}

function swVisualHeroSlice2SurfaceTexture(kind) {
  if (kind === 'brick') {
    return swVisualHeroSlice2CanvasTexture('brick', 256, 256, (context, width, height) => {
      context.fillStyle = '#743d34';
      context.fillRect(0, 0, width, height);
      const rowHeight = 32;
      const brickWidth = 64;
      for (let row = 0; row < height / rowHeight; row += 1) {
        const y = row * rowHeight;
        context.fillStyle = row % 3 === 0 ? '#81473b' : (row % 3 === 1 ? '#6f382f' : '#7a4137');
        context.fillRect(0, y + 2, width, rowHeight - 4);
        context.strokeStyle = 'rgba(235,219,190,0.28)';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
        const offset = row % 2 ? brickWidth * 0.5 : 0;
        for (let x = -offset; x < width; x += brickWidth) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x, y + rowHeight);
          context.stroke();
        }
      }
      context.fillStyle = 'rgba(25,14,12,0.10)';
      for (let y = 18; y < height; y += 53) context.fillRect(0, y, width, 2);
    }, 2.8, 1.8);
  }
  if (kind === 'barn-red') {
    return swVisualHeroSlice2CanvasTexture('barn-red', 256, 256, (context, width, height) => {
      context.fillStyle = '#8b332c';
      context.fillRect(0, 0, width, height);
      for (let x = 0; x < width; x += 24) {
        context.fillStyle = x % 48 === 0 ? '#963b33' : '#813029';
        context.fillRect(x + 2, 0, 20, height);
        context.fillStyle = 'rgba(30,16,13,0.28)';
        context.fillRect(x, 0, 2, height);
        context.fillStyle = 'rgba(255,220,195,0.08)';
        context.fillRect(x + 4, 0, 2, height);
      }
      context.fillStyle = 'rgba(32,18,15,0.11)';
      context.fillRect(0, height - 34, width, 34);
    }, 1.7, 1.25);
  }
  if (kind === 'painted-cream') {
    return swVisualHeroSlice2CanvasTexture('painted-cream', 256, 256, (context, width, height) => {
      context.fillStyle = '#e8dfcf';
      context.fillRect(0, 0, width, height);
      for (let x = 0; x < width; x += 28) {
        context.fillStyle = 'rgba(77,62,49,0.13)';
        context.fillRect(x, 0, 2, height);
        context.fillStyle = 'rgba(255,255,255,0.16)';
        context.fillRect(x + 4, 0, 2, height);
      }
    }, 1.2, 1.2);
  }
  if (kind === 'galvanized') {
    return swVisualHeroSlice2CanvasTexture('galvanized', 256, 128, (context, width, height) => {
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#4d5964');
      gradient.addColorStop(0.5, '#85909a');
      gradient.addColorStop(1, '#52606a');
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
      for (let x = 0; x < width; x += 22) {
        context.fillStyle = 'rgba(230,240,245,0.22)';
        context.fillRect(x + 2, 0, 2, height);
        context.fillStyle = 'rgba(20,30,36,0.30)';
        context.fillRect(x + 6, 0, 2, height);
      }
      context.fillStyle = 'rgba(255,255,255,0.08)';
      context.fillRect(0, 18, width, 2);
      context.fillRect(0, 76, width, 2);
    }, 2.3, 1.0);
  }
  if (kind === 'awning') {
    return swVisualHeroSlice2CanvasTexture('awning', 256, 128, (context, width, height) => {
      const stripe = width / 8;
      for (let index = 0; index < 8; index += 1) {
        context.fillStyle = index % 2 ? '#efe1c4' : '#9f332e';
        context.fillRect(index * stripe, 0, stripe, height);
      }
      context.fillStyle = 'rgba(255,255,255,0.16)';
      context.fillRect(0, 0, width, 7);
      context.fillStyle = 'rgba(38,19,16,0.18)';
      context.fillRect(0, height - 8, width, 8);
    });
  }
  if (kind === 'store-sign') {
    return swVisualHeroSlice2CanvasTexture('store-sign', 512, 160, (context, width, height) => {
      context.fillStyle = '#263d35';
      context.fillRect(0, 0, width, height);
      context.strokeStyle = '#e9c873';
      context.lineWidth = 9;
      context.strokeRect(8, 8, width - 16, height - 16);
      context.fillStyle = '#f5ead0';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.font = '900 52px sans-serif';
      context.fillText('PRAIRIE SUPPLY', width / 2, 62, width - 38);
      context.fillStyle = '#e9c873';
      context.font = '800 22px sans-serif';
      context.fillText('HARDWARE - FEED - WEATHER RADIOS', width / 2, 116, width - 34);
    });
  }
  return null;
}

function swVisualHeroSlice2ApplySurface(mesh, texture, options = {}) {
  if (!mesh?.material || !texture) return false;
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  materials.forEach((material) => {
    if (!material) return;
    material.map = texture;
    material.color?.set(options.color || '#ffffff');
    if (Number.isFinite(options.roughness)) material.roughness = options.roughness;
    if (Number.isFinite(options.metalness)) material.metalness = options.metalness;
    if (options.emissive && material.emissive?.set) material.emissive.set(options.emissive);
    if (Number.isFinite(options.emissiveIntensity)) material.emissiveIntensity = options.emissiveIntensity;
    if (Number.isFinite(options.opacity)) {
      material.opacity = options.opacity;
      material.transparent = options.opacity < 1;
    }
    material.needsUpdate = true;
  });
  mesh.userData.swVisualHeroSlice2SurfaceStyled = true;
  return true;
}

function swVisualHeroSlice2StyleStorefront() {
  const group = scene?.getObjectByName?.('structure.storefront.v1') || null;
  if (!group) {
    swVisualHeroSlice2Styled.storefront = false;
    return false;
  }
  const brick = swVisualHeroSlice2SurfaceTexture('brick');
  const metal = swVisualHeroSlice2SurfaceTexture('galvanized');
  const awning = swVisualHeroSlice2SurfaceTexture('awning');
  const sign = swVisualHeroSlice2SurfaceTexture('store-sign');
  const cream = swVisualHeroSlice2SurfaceTexture('painted-cream');

  swVisualHeroSlice2ApplySurface(group.getObjectByName('main-shell'), brick, { roughness: 0.84, metalness: 0.02 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('parapet'), metal, { roughness: 0.60, metalness: 0.30 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('roof-unit'), metal, { roughness: 0.56, metalness: 0.34 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('left-pilaster'), cream, { roughness: 0.72, metalness: 0.02 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('right-pilaster'), cream, { roughness: 0.72, metalness: 0.02 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('awning'), awning, { roughness: 0.64, metalness: 0.02 });
  swVisualHeroSlice2ApplySurface(group.getObjectByName('store-sign'), sign, { roughness: 0.48, metalness: 0.04, emissive: '#4b3214', emissiveIntensity: 0.12 });

  ['left-window', 'right-window'].forEach((name) => {
    const windowMesh = group.getObjectByName(name);
    if (!windowMesh?.material) return;
    const materials = Array.isArray(windowMesh.material) ? windowMesh.material : [windowMesh.material];
    materials.forEach((material) => {
      material.map = null;
      material.color?.set('#315d68');
      material.emissive?.set?.('#102c34');
      material.emissiveIntensity = 0.11;
      material.roughness = 0.16;
      material.metalness = 0.25;
      material.opacity = 0.86;
      material.transparent = true;
      material.needsUpdate = true;
    });
    windowMesh.userData.swVisualHeroSlice2SurfaceStyled = true;
  });

  const door = group.getObjectByName('entry-door');
  if (door?.material) {
    door.material.color?.set('#1f2c30');
    door.material.roughness = 0.48;
    door.material.metalness = 0.18;
    door.material.needsUpdate = true;
    door.userData.swVisualHeroSlice2SurfaceStyled = true;
  }

  group.userData.swVisualHeroSlice2Styled = true;
  swVisualHeroSlice2Styled.storefront = true;
  return true;
}

function swVisualHeroSlice2StyleHartFarm() {
  const hartFarm = swVisualGetHartFarmPresentationAnchor();
  const group = hartFarm?.node || null;
  if (!group) {
    swVisualHeroSlice2Styled.hartFarm = false;
    return false;
  }
  const barnRed = swVisualHeroSlice2SurfaceTexture('barn-red');
  const metal = swVisualHeroSlice2SurfaceTexture('galvanized');
  const cream = swVisualHeroSlice2SurfaceTexture('painted-cream');
  let styledCount = 0;

  group.children.forEach((child) => {
    const parameters = child?.geometry?.parameters;
    if (!parameters || child.type !== 'Mesh') return;
    const width = Number(parameters.width || 0);
    const height = Number(parameters.height || 0);
    const depth = Number(parameters.depth || 0);
    const localY = Number(child.position?.y || 0);
    if (height >= 9.5 && (width >= 20 || depth >= 16)) {
      styledCount += Number(swVisualHeroSlice2ApplySurface(child, barnRed, { roughness: 0.82, metalness: 0.01 }));
      return;
    }
    if (localY >= 12 && height <= 1.0 && depth >= 18) {
      styledCount += Number(swVisualHeroSlice2ApplySurface(child, metal, { roughness: 0.58, metalness: 0.34 }));
      return;
    }
    const isDoorOrLoft = width >= 4.4 && width <= 7.2 && height >= 3.3 && height <= 7.5 && depth < 0.7;
    const isVerticalTrim = width < 0.6 && height >= 9.5 && depth < 0.7;
    const isHorizontalTrim = width >= 20 && height < 0.6 && depth < 0.7 && localY >= 9;
    if (isDoorOrLoft || isVerticalTrim || isHorizontalTrim) {
      styledCount += Number(swVisualHeroSlice2ApplySurface(child, cream, { roughness: 0.76, metalness: 0.01 }));
    }
  });

  group.userData.swVisualHeroSlice2Styled = styledCount >= 5;
  swVisualHeroSlice2Styled.hartFarm = styledCount >= 5;
  return swVisualHeroSlice2Styled.hartFarm;
}

function swVisualHeroSlice2PlaceFacadeCamera(node, distance, lateral, height, lookHeight) {
  if (!node || !camera) return false;
  const origin = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  node.getWorldPosition(origin);
  node.getWorldQuaternion(quaternion);
  const front = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion).normalize();
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion).normalize();
  camera.position.copy(origin);
  camera.position.addScaledVector(front, distance);
  camera.position.addScaledVector(right, lateral);
  camera.position.y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(origin.x, origin.z) : origin.y) + height;
  const lookAt = origin.clone();
  lookAt.y = (typeof terrainHeightAt === 'function' ? terrainHeightAt(origin.x, origin.z) : origin.y) + lookHeight;
  camera.lookAt(lookAt);
  return true;
}

const swVisualHeroSlice2RefreshBase = swVisualRefreshHeroSlice;
swVisualRefreshHeroSlice = function swVisualRefreshHeroSliceWithAuthoredMaterials(...args) {
  const result = swVisualHeroSlice2RefreshBase.apply(this, args);
  swVisualHeroSlice2StyleStorefront();
  swVisualHeroSlice2StyleHartFarm();
  return result;
};

const swVisualHeroSlice2PaletteBase = swVisualUpdatePalette;
swVisualUpdatePalette = function swVisualUpdatePaletteWithContrast(dt) {
  swVisualHeroSlice2PaletteBase(dt);
  const stage = Number(currentStage || 1);
  const blend = Math.min(1, Math.max(0, Number(dt || 0)) * 0.42);
  const ambientTarget = stage === 1 ? 0.72 : (stage === 2 ? 0.56 : 0.42);
  const skyTarget = stage === 1 ? 0.32 : (stage === 2 ? 0.27 : 0.22);
  const directionalTarget = stage === 1 ? 1.55 : (stage === 2 ? 1.48 : 1.62);
  if (ambientLight) ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, ambientTarget, blend * 0.72);
  if (skyLight) skyLight.intensity = THREE.MathUtils.lerp(skyLight.intensity, skyTarget, blend * 0.72);
  if (dirLight) dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, directionalTarget, blend * 0.72);
  if (swVisualRimLight) {
    const rimTarget = stage === 1 ? 0.30 : (stage === 2 ? 0.45 : 0.60);
    swVisualRimLight.intensity = THREE.MathUtils.lerp(swVisualRimLight.intensity, rimTarget, blend * 0.72);
  }
  const targetExposure = stage === 1 ? 0.90 : (stage === 2 ? 0.82 : 0.74);
  renderer.toneMappingExposure = THREE.MathUtils.lerp(renderer.toneMappingExposure, targetExposure, blend * 0.62);
};

const swVisualHeroSlice2PrepareQaBase = swVisualPrepareQaView;
swVisualPrepareQaView = function swVisualPrepareQaViewWithFacadeFraming(mode = 'storefront') {
  const prepared = swVisualHeroSlice2PrepareQaBase(mode);
  if (!prepared) return false;
  if (mode === 'farm') {
    const hartFarm = swVisualGetHartFarmPresentationAnchor();
    if (!hartFarm || !swVisualHeroSlice2PlaceFacadeCamera(hartFarm.node, 45, 34, 22, 7.2)) return false;
  } else if (mode === 'storefront') {
    const storefrontNode = scene?.getObjectByName?.('structure.storefront.v1') || null;
    if (!storefrontNode || !swVisualHeroSlice2PlaceFacadeCamera(storefrontNode, 38, 29, 17, 4.9)) return false;
  }
  swVisualUpdate(0, 1000);
  renderer.render(scene, camera);
  return true;
};

const swVisualHeroSlice2SnapshotBase = swVisualSnapshot;
swVisualSnapshot = function swVisualSnapshotWithHeroSlice2() {
  const base = swVisualHeroSlice2SnapshotBase();
  return Object.freeze({
    ...base,
    heroSlice2Version: THREEJS_VISUAL_HERO_SLICE2_VERSION,
    hero: Object.freeze({
      ...(base.hero || {}),
      storefrontSurfaceStyled: swVisualHeroSlice2Styled.storefront,
      hartFarmSurfaceStyled: swVisualHeroSlice2Styled.hartFarm,
      curatedMaterialTextureCount: swVisualHeroSlice2SurfaceTextures.size,
    }),
  });
};

const swVisualHeroSlice2BuildLivingCountyBase = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithHeroSlice2SurfaceReset(...args) {
  swVisualHeroSlice2Styled.storefront = false;
  swVisualHeroSlice2Styled.hartFarm = false;
  swVisualHeroSlice2SurfaceTextures.clear();
  return swVisualHeroSlice2BuildLivingCountyBase.apply(this, args);
};

const swVisualHeroSlice2BridgeBase = globalThis.__SW_THREEJS_VISUAL_FOUNDATION__;
globalThis.__SW_THREEJS_VISUAL_FOUNDATION__ = Object.freeze({
  ...swVisualHeroSlice2BridgeBase,
  update: swVisualUpdate,
  refreshHeroSlice: swVisualRefreshHeroSlice,
  prepareQaView: swVisualPrepareQaView,
  clearQaView: swVisualClearQaView,
  getSnapshot: swVisualSnapshot,
  heroSlice2Version: THREEJS_VISUAL_HERO_SLICE2_VERSION,
});

Promise.resolve().then(() => swVisualRefreshHeroSlice());
// [SW:VISUAL:HERO_SLICE2:END]
