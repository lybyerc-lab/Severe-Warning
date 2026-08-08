// ============================================================================
// [SW:RENDER:THREEJS_ASSET_PIPELINE]
// Optional authored-presentation seam around the accepted Three.js gameplay.
// Gameplay target truth remains authoritative; failed/late assets keep fallback.
// ============================================================================
const THREEJS_ASSET_PIPELINE_VERSION = 'THREEJS_ASSET_PIPELINE_V1';
const SW_STRUCTURE_ASSET_VERSION = 'SW_STRUCTURE_ASSET_V1';

const THREEJS_PRODUCTION_ASSETS = Object.freeze([
  Object.freeze({
    id: 'structure.storefront.v1',
    archetype: 'shop',
    format: 'sw-structure-json-v1',
    url: './assets/production/structures/storefront-v1.json',
    maxInstances: 1,
  }),
]);

const swAssetCache = new Map();
const swAssetState = {
  generation: 0,
  loadAttempts: 0,
  loadSuccesses: 0,
  loadFailures: 0,
  appliedCount: 0,
  skippedCount: 0,
  lastError: null,
  applications: [],
};

function swAssetCloneState() {
  return Object.freeze({
    version: THREEJS_ASSET_PIPELINE_VERSION,
    generation: swAssetState.generation,
    registryCount: THREEJS_PRODUCTION_ASSETS.length,
    loadAttempts: swAssetState.loadAttempts,
    loadSuccesses: swAssetState.loadSuccesses,
    loadFailures: swAssetState.loadFailures,
    appliedCount: swAssetState.appliedCount,
    skippedCount: swAssetState.skippedCount,
    lastError: swAssetState.lastError,
    applications: Object.freeze(swAssetState.applications.map((entry) => Object.freeze({ ...entry }))),
  });
}

function swAssetValidateStructureSpec(spec, entry) {
  if (!spec || spec.version !== SW_STRUCTURE_ASSET_VERSION) {
    throw new Error(`Unexpected asset version for ${entry.id}: ${spec?.version || 'missing'}`);
  }
  if (spec.id !== entry.id) throw new Error(`Asset id mismatch for ${entry.id}: ${spec.id}`);
  if (spec.archetype !== entry.archetype) throw new Error(`Asset archetype mismatch for ${entry.id}: ${spec.archetype}`);
  if (!spec.materials || typeof spec.materials !== 'object') throw new Error(`Asset ${entry.id} is missing materials.`);
  if (!Array.isArray(spec.parts) || spec.parts.length < 4) throw new Error(`Asset ${entry.id} must define at least four parts.`);
  const ids = new Set();
  for (const part of spec.parts) {
    if (!part || typeof part.id !== 'string' || !part.id) throw new Error(`Asset ${entry.id} has a part without an id.`);
    if (ids.has(part.id)) throw new Error(`Asset ${entry.id} duplicates part id ${part.id}.`);
    ids.add(part.id);
    if (part.primitive !== 'box') throw new Error(`Asset ${entry.id} uses unsupported primitive ${part.primitive}.`);
    if (!Array.isArray(part.size) || part.size.length !== 3 || part.size.some((value) => !Number.isFinite(Number(value)) || Number(value) <= 0)) {
      throw new Error(`Asset ${entry.id} part ${part.id} has invalid size.`);
    }
    if (!Array.isArray(part.position) || part.position.length !== 3 || part.position.some((value) => !Number.isFinite(Number(value)))) {
      throw new Error(`Asset ${entry.id} part ${part.id} has invalid position.`);
    }
    if (!spec.materials[part.material]) throw new Error(`Asset ${entry.id} part ${part.id} references missing material ${part.material}.`);
  }
  return spec;
}

async function swAssetLoad(entry) {
  if (swAssetCache.has(entry.id)) return swAssetCache.get(entry.id);
  swAssetState.loadAttempts += 1;
  const promise = fetch(entry.url, { cache: 'no-store' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status} for ${entry.url}`);
      return response.json();
    })
    .then((spec) => {
      swAssetValidateStructureSpec(spec, entry);
      swAssetState.loadSuccesses += 1;
      return spec;
    })
    .catch((error) => {
      swAssetState.loadFailures += 1;
      swAssetState.lastError = String(error?.message || error);
      swAssetCache.delete(entry.id);
      throw error;
    });
  swAssetCache.set(entry.id, promise);
  return promise;
}

function swAssetMaterial(materialSpec) {
  const options = {
    color: materialSpec.color || '#ffffff',
    roughness: Number.isFinite(Number(materialSpec.roughness)) ? Number(materialSpec.roughness) : 0.72,
    metalness: Number.isFinite(Number(materialSpec.metalness)) ? Number(materialSpec.metalness) : 0.05,
  };
  if (materialSpec.emissive) options.emissive = materialSpec.emissive;
  if (Number.isFinite(Number(materialSpec.emissiveIntensity))) options.emissiveIntensity = Number(materialSpec.emissiveIntensity);
  if (materialSpec.transparent === true) options.transparent = true;
  if (Number.isFinite(Number(materialSpec.opacity))) options.opacity = Number(materialSpec.opacity);
  return new THREE.MeshStandardMaterial(options);
}

function swAssetBuildStructureMeshData(spec, fallbackMeshData) {
  const group = new THREE.Group();
  group.name = spec.id;
  group.userData.swAuthoredAssetId = spec.id;
  group.userData.swAuthoredAssetVersion = spec.version;
  const materialTemplates = new Map();
  const damageParts = [];
  let base = null;
  let roof = null;

  for (const [name, materialSpec] of Object.entries(spec.materials)) {
    materialTemplates.set(name, swAssetMaterial(materialSpec));
  }

  for (const partSpec of spec.parts) {
    const geometry = new THREE.BoxGeometry(Number(partSpec.size[0]), Number(partSpec.size[1]), Number(partSpec.size[2]));
    const materialTemplate = materialTemplates.get(partSpec.material);
    const part = new THREE.Mesh(geometry, materialTemplate.clone());
    part.name = partSpec.id;
    part.position.set(Number(partSpec.position[0]), Number(partSpec.position[1]), Number(partSpec.position[2]));
    if (Array.isArray(partSpec.rotation) && partSpec.rotation.length === 3) {
      part.rotation.set(Number(partSpec.rotation[0]) || 0, Number(partSpec.rotation[1]) || 0, Number(partSpec.rotation[2]) || 0);
    }
    part.castShadow = true;
    part.receiveShadow = true;
    part.userData.swAssetPartId = partSpec.id;
    part.userData.swAssetTags = Array.isArray(partSpec.tags) ? [...partSpec.tags] : [];
    group.add(part);

    if (part.userData.swAssetTags.includes('damage')) damageParts.push(part);
    if (!base && part.userData.swAssetTags.includes('base')) base = part;
    if (!roof && part.userData.swAssetTags.includes('roof')) roof = part;
  }

  for (const material of materialTemplates.values()) material.dispose();
  if (!base) base = damageParts[0] || group.children[0] || null;
  return {
    group,
    base,
    roof,
    color: fallbackMeshData.color,
    damageParts,
    footprint: Number(spec.footprint) || fallbackMeshData.footprint,
    label: spec.label || fallbackMeshData.label,
    points: fallbackMeshData.points,
    authoredAssetId: spec.id,
  };
}

function swAssetRecord(application) {
  swAssetState.applications.push({ at: performance.now(), ...application });
  if (swAssetState.applications.length > 12) swAssetState.applications.shift();
}

async function swAssetUpgradeTarget(target, entry, generation) {
  const fallbackMeshData = target?.meshData;
  const fallbackGroup = fallbackMeshData?.group;
  if (!fallbackGroup || !scene) {
    swAssetState.skippedCount += 1;
    swAssetRecord({ assetId: entry.id, targetKind: target?.kind || null, status: 'skipped-missing-fallback' });
    return false;
  }

  try {
    const spec = await swAssetLoad(entry);
    if (generation !== swAssetState.generation || !targets.includes(target)) {
      swAssetState.skippedCount += 1;
      swAssetRecord({ assetId: entry.id, targetKind: target.kind, status: 'skipped-stale-generation' });
      return false;
    }
    if (target.destroyed || Number(target.damageStage) !== 0 || Number(target.health) !== Number(target.maxHealth)) {
      swAssetState.skippedCount += 1;
      swAssetRecord({ assetId: entry.id, targetKind: target.kind, status: 'skipped-target-not-intact' });
      return false;
    }

    const authored = swAssetBuildStructureMeshData(spec, fallbackMeshData);
    authored.group.position.copy(fallbackGroup.position);
    authored.group.quaternion.copy(fallbackGroup.quaternion);
    authored.group.scale.copy(fallbackGroup.scale);
    authored.group.updateMatrixWorld(true);

    scene.add(authored.group);
    scene.remove(fallbackGroup);
    target.meshData = authored;
    target.__swPresentationFallback = fallbackMeshData;
    target.__swAuthoredAssetId = entry.id;

    swAssetState.appliedCount += 1;
    swAssetRecord({
      assetId: entry.id,
      targetKind: target.kind,
      status: 'applied',
      damagePartCount: authored.damageParts.length,
      health: target.health,
      maxHealth: target.maxHealth,
      points: target.points,
      x: target.x,
      z: target.z,
    });
    return true;
  } catch (error) {
    swAssetRecord({ assetId: entry.id, targetKind: target?.kind || null, status: 'fallback', error: String(error?.message || error) });
    return false;
  }
}

function swAssetApplyToCurrentCounty(generation) {
  if (!Array.isArray(targets) || targets.length === 0) return;
  for (const entry of THREEJS_PRODUCTION_ASSETS) {
    const candidates = targets.filter((target) => target.kind === entry.archetype && !target.destroyed);
    const limit = Math.max(0, Number(entry.maxInstances) || 0);
    candidates.slice(0, limit).forEach((target) => {
      swAssetUpgradeTarget(target, entry, generation);
    });
  }
}

const swAssetOriginalBuildLivingCounty = buildLivingCounty;
buildLivingCounty = function buildLivingCountyWithAuthoredPresentation(...args) {
  swAssetState.generation += 1;
  swAssetState.appliedCount = 0;
  swAssetState.skippedCount = 0;
  swAssetState.applications = [];
  const generation = swAssetState.generation;
  const result = swAssetOriginalBuildLivingCounty.apply(this, args);
  Promise.resolve().then(() => swAssetApplyToCurrentCounty(generation));
  return result;
};

globalThis.__SW_THREEJS_ASSET_PIPELINE__ = Object.freeze({
  version: THREEJS_ASSET_PIPELINE_VERSION,
  registry: THREEJS_PRODUCTION_ASSETS,
  getSnapshot: swAssetCloneState,
  getAppliedTargets() {
    return targets
      .filter((target) => Boolean(target.__swAuthoredAssetId))
      .map((target) => Object.freeze({
        assetId: target.__swAuthoredAssetId,
        kind: target.kind,
        health: target.health,
        maxHealth: target.maxHealth,
        damageStage: target.damageStage,
        destroyed: target.destroyed,
        points: target.points,
        x: target.x,
        z: target.z,
        damagePartCount: target.meshData?.damageParts?.length || 0,
      }));
  },
});
// [SW:RENDER:THREEJS_ASSET_PIPELINE:END]
