// ============================================================================
// [SW:VISUAL:PRODUCTION_SLICE]
// V510_THREEJS_PRODUCTION_SLICE_V1
// Purpose: Remove prototype presentation without changing accepted game rules.
// Invariants:
// - Three.js remains the production renderer.
// - District order, scoring, abilities, audio, input, and cleanup remain owned by V5.
// - Visual quality changes density only, never gameplay reach or score.
// - Physical device acceptance remains the final visual and performance gate.
// ============================================================================
const PRODUCTION_QUALITY_LEVELS = ['LOW', 'BALANCED', 'HIGH', 'SHOWCASE'];
const PRODUCTION_QUALITY_CONFIG = {
  LOW: { ribbons: 1, debris: 10, dust: 6, trees: 18, cropRows: 12, shadows: false },
  BALANCED: { ribbons: 2, debris: 18, dust: 9, trees: 28, cropRows: 18, shadows: true },
  HIGH: { ribbons: 3, debris: 26, dust: 12, trees: 38, cropRows: 24, shadows: true },
  SHOWCASE: { ribbons: 4, debris: 34, dust: 15, trees: 46, cropRows: 30, shadows: true }
};
const PRODUCTION_QUALITY_KEY = 'severe_weather_visual_quality_v1';
let productionQuality = loadProductionQuality();
let productionSliceRoot = null;
let productionTornadoRoot = null;
let productionStormLight = null;
let productionSuctionRings = [];
let productionVaporRibbons = [];
let productionDustPuffs = [];
let productionDebrisMesh = null;
let productionDebrisMeta = [];
let productionBarn = null;
let productionFragments = [];
let productionPulseEffects = [];
let productionFrameSamples = [];
let productionFlashTimer = 0;
let productionDressingStats = { cropRows: 0, trees: 0, fences: 0, streetProps: 0 };
let productionCurrentCampaignId = '';
let productionQaPrepared = false;

function loadProductionQuality() {
  try {
    const saved = localStorage.getItem(PRODUCTION_QUALITY_KEY);
    if (PRODUCTION_QUALITY_LEVELS.includes(saved)) return saved;
  } catch (_) {}
  return isMobileDevice ? 'BALANCED' : 'HIGH';
}

function saveProductionQuality() {
  try { localStorage.setItem(PRODUCTION_QUALITY_KEY, productionQuality); } catch (_) {}
}

function productionQualityConfig() {
  return PRODUCTION_QUALITY_CONFIG[productionQuality] || PRODUCTION_QUALITY_CONFIG.BALANCED;
}

function updateProductionQualityUi() {
  const button = getCachedEl('btnProductionQuality');
  if (button) {
    button.textContent = 'VISUALS: ' + productionQuality;
    button.dataset.quality = productionQuality;
  }
  const badge = getCachedEl('productionSliceBadge');
  if (badge) badge.textContent = 'THREE.JS PRODUCTION SLICE · ' + productionQuality;
}

function cycleProductionQuality() {
  const index = PRODUCTION_QUALITY_LEVELS.indexOf(productionQuality);
  productionQuality = PRODUCTION_QUALITY_LEVELS[(index + 1) % PRODUCTION_QUALITY_LEVELS.length];
  saveProductionQuality();
  rebuildProductionSlice();
  showGagToast('VISUAL QUALITY: ' + productionQuality);
}

globalThis.cycleProductionQuality = cycleProductionQuality;

function disposeProductionObject(root) {
  if (!root) return;
  root.traverse(object => {
    if (object.geometry && object.geometry.dispose) object.geometry.dispose();
    if (object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach(material => {
        if (material.map && material.map.dispose) material.map.dispose();
        if (material.dispose) material.dispose();
      });
    }
  });
  if (root.parent) root.parent.remove(root);
}

function clearProductionSlice() {
  disposeProductionObject(productionSliceRoot);
  disposeProductionObject(productionTornadoRoot);
  if (productionStormLight && productionStormLight.parent) productionStormLight.parent.remove(productionStormLight);
  productionSliceRoot = null;
  productionTornadoRoot = null;
  productionStormLight = null;
  productionSuctionRings = [];
  productionVaporRibbons = [];
  productionDustPuffs = [];
  productionDebrisMesh = null;
  productionDebrisMeta = [];
  productionBarn = null;
  productionFragments.forEach(fragment => disposeProductionObject(fragment.mesh));
  productionFragments = [];
  productionPulseEffects.forEach(effect => disposeProductionObject(effect.mesh));
  productionPulseEffects = [];
  productionDressingStats = { cropRows: 0, trees: 0, fences: 0, streetProps: 0 };
}

function productionMaterial(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.74,
    metalness: options.metalness ?? 0.02,
    transparent: options.transparent === true,
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true,
    emissive: options.emissive || '#000000',
    emissiveIntensity: options.emissiveIntensity || 0,
    flatShading: options.flatShading === true
  });
}

function addProductionPart(parent, geometry, color, x, y, z, options = {}) {
  const material = options.material || productionMaterial(color, options);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (options.rotation) mesh.rotation.set(options.rotation.x || 0, options.rotation.y || 0, options.rotation.z || 0);
  if (options.scale) mesh.scale.set(options.scale.x || 1, options.scale.y || 1, options.scale.z || 1);
  mesh.castShadow = options.castShadow !== false && productionQualityConfig().shadows;
  mesh.receiveShadow = options.receiveShadow !== false;
  parent.add(mesh);
  return mesh;
}

function makeProductionInstancedMesh(geometry, material, transforms) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  transforms.forEach((transform, index) => {
    quaternion.setFromEuler(new THREE.Euler(
      transform.rx || 0,
      transform.ry || 0,
      transform.rz || 0
    ));
    matrix.compose(
      new THREE.Vector3(transform.x, transform.y, transform.z),
      quaternion,
      new THREE.Vector3(transform.sx || 1, transform.sy || 1, transform.sz || 1)
    );
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.castShadow = productionQualityConfig().shadows;
  mesh.receiveShadow = true;
  return mesh;
}

// ============================================================================
// [SW:VISUAL:TORNADO_LAYERS]
// The accepted tornado mechanics stay untouched. This layer supplies depth,
// broken silhouettes, readable ground contact, and scale cues.
// ============================================================================
