// ============================================================================
// [SW:ART:009:COW17_RUNTIME]
// Cow 17 authored visual adapter. Presentation only: bovine gameplay authority,
// safety, physics, scoring, coordinates, and flight telemetry remain untouched.
// The GLB itself is loaded by the official Three.js r128 GLTFLoader.
// ============================================================================
const SW_COW17_RUNTIME_ASSET_VERSION = 'SW_COW17_RUNTIME_ASSET_V2';
const SW_COW17_RUNTIME_LOADER = 'THREE.GLTFLoader r128';
const SW_COW17_RUNTIME_ASSET = Object.freeze({
  id: 'character.cow17.walking.v1',
  url: './assets/production/characters/cow17-walking-v1.glb',
  sha256: 'd5bb4e47a12fde652808a53fdcb3dfddf71b944f2efb6641bf18ce8ac5c82a93',
  expectedBytes: 14412828,
  expectedTriangles: 198050,
  expectedJoints: 24,
  expectedAnimation: 'Armature|walking_man|baselayer',
  targetHeight: 3.0,
});

const swCow17RuntimeState = {
  generation: 0,
  registrations: 0,
  loadAttempts: 0,
  loadSuccesses: 0,
  loadFailures: 0,
  appliedCount: 0,
  cleanupCount: 0,
  animationTicks: 0,
  animationSeconds: 0,
  activeCowId: null,
  activeAnimation: null,
  activeJointCount: 0,
  activeTriangleCount: 0,
  activeTexturedMaterialCount: 0,
  activeSkinnedMeshCount: 0,
  activeHeight: 0,
  lastError: null,
  cow: null,
  fallbackChildren: null,
  fallbackRootMaterial: null,
  hiddenRootMaterial: null,
};

let swCow17AssetPromise = null;
let swCow17CachedAsset = null;

function swCow17Fail(message) {
  throw new Error(`Cow 17 runtime asset: ${message}`);
}

function swCow17InspectGltf(gltf) {
  if (!gltf?.scene) swCow17Fail('GLTFLoader returned no scene');
  const clip = gltf.animations?.[0];
  if (!clip) swCow17Fail('GLTFLoader returned no animation');
  if (clip.name !== SW_COW17_RUNTIME_ASSET.expectedAnimation) {
    swCow17Fail(`unexpected animation ${clip.name}`);
  }

  let jointCount = 0;
  let triangleCount = 0;
  let texturedMaterialCount = 0;
  let skinnedMeshCount = 0;
  const seenMaterials = new Set();

  gltf.scene.traverse((object) => {
    if (object?.isSkinnedMesh) {
      skinnedMeshCount += 1;
      jointCount = Math.max(jointCount, object.skeleton?.bones?.length || 0);
    }
    if (!object?.isMesh) return;

    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = true;

    const geometry = object.geometry;
    if (geometry?.index) triangleCount += Math.floor(geometry.index.count / 3);
    else triangleCount += Math.floor((geometry?.attributes?.position?.count || 0) / 3);

    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material || seenMaterials.has(material)) continue;
      seenMaterials.add(material);
      if (material.map?.isTexture) texturedMaterialCount += 1;
    }
  });

  if (skinnedMeshCount < 1) swCow17Fail('expected at least one skinned mesh');
  if (jointCount !== SW_COW17_RUNTIME_ASSET.expectedJoints) swCow17Fail(`joint count mismatch ${jointCount}`);
  if (triangleCount !== SW_COW17_RUNTIME_ASSET.expectedTriangles) swCow17Fail(`triangle count mismatch ${triangleCount}`);
  if (texturedMaterialCount < 1) swCow17Fail('authored base-color texture is missing');

  return { clip, jointCount, triangleCount, texturedMaterialCount, skinnedMeshCount };
}

function swCow17PrepareAsset(gltf) {
  const inspected = swCow17InspectGltf(gltf);
  const visual = new THREE.Group();
  visual.name = 'SW_COW17_AUTHORED_VISUAL';
  visual.add(gltf.scene);
  visual.rotation.y = Math.PI;
  visual.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(visual);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (!Number.isFinite(size.y) || size.y <= 0) swCow17Fail(`invalid authored height ${size.y}`);

  visual.scale.multiplyScalar(SW_COW17_RUNTIME_ASSET.targetHeight / size.y);
  visual.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(visual);
  const center = new THREE.Vector3();
  box.getCenter(center);
  visual.position.x -= center.x;
  visual.position.z -= center.z;
  visual.position.y += -0.8 - box.min.y;
  visual.updateMatrixWorld(true);

  const mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(inspected.clip);
  action.setLoop(THREE.LoopRepeat, Infinity);
  action.enabled = true;

  return Object.freeze({
    visual,
    mixer,
    action,
    clip: inspected.clip,
    joints: inspected.jointCount,
    triangles: inspected.triangleCount,
    texturedMaterialCount: inspected.texturedMaterialCount,
    skinnedMeshCount: inspected.skinnedMeshCount,
  });
}

function swCow17LoadAssetOnce() {
  if (swCow17CachedAsset) return Promise.resolve(swCow17CachedAsset);
  if (!swCow17AssetPromise) {
    if (typeof THREE?.GLTFLoader !== 'function') swCow17Fail('official Three.js r128 GLTFLoader is missing');
    swCow17RuntimeState.loadAttempts += 1;
    swCow17AssetPromise = new Promise((resolve, reject) => {
      new THREE.GLTFLoader().load(
        SW_COW17_RUNTIME_ASSET.url,
        (gltf) => {
          try {
            swCow17CachedAsset = swCow17PrepareAsset(gltf);
            swCow17RuntimeState.loadSuccesses += 1;
            swCow17RuntimeState.lastError = null;
            resolve(swCow17CachedAsset);
          } catch (error) {
            reject(error);
          }
        },
        undefined,
        reject,
      );
    }).catch((error) => {
      swCow17AssetPromise = null;
      swCow17RuntimeState.loadFailures += 1;
      swCow17RuntimeState.lastError = String(error?.message || error);
      throw error;
    });
  }
  return swCow17AssetPromise;
}

function swCow17RestoreFallback() {
  const cow = swCow17RuntimeState.cow;
  if (cow?.mesh && swCow17RuntimeState.hiddenRootMaterial && swCow17RuntimeState.fallbackRootMaterial) {
    cow.mesh.material = swCow17RuntimeState.fallbackRootMaterial;
    swCow17RuntimeState.hiddenRootMaterial.dispose?.();
  }
  for (const child of swCow17RuntimeState.fallbackChildren || []) child.visible = true;
  swCow17RuntimeState.hiddenRootMaterial = null;
  swCow17RuntimeState.fallbackRootMaterial = null;
  swCow17RuntimeState.fallbackChildren = null;
}

function swCow17HideFallback(cow) {
  swCow17RuntimeState.fallbackChildren = [...cow.mesh.children];
  swCow17RuntimeState.fallbackRootMaterial = cow.mesh.material;
  const hiddenMaterial = cow.mesh.material?.clone?.();
  if (hiddenMaterial) {
    hiddenMaterial.visible = false;
    cow.mesh.material = hiddenMaterial;
    swCow17RuntimeState.hiddenRootMaterial = hiddenMaterial;
  }
  for (const child of swCow17RuntimeState.fallbackChildren) child.visible = false;
}

function swCow17ClearActiveState() {
  swCow17RuntimeState.activeCowId = null;
  swCow17RuntimeState.activeAnimation = null;
  swCow17RuntimeState.activeJointCount = 0;
  swCow17RuntimeState.activeTriangleCount = 0;
  swCow17RuntimeState.activeTexturedMaterialCount = 0;
  swCow17RuntimeState.activeSkinnedMeshCount = 0;
  swCow17RuntimeState.activeHeight = 0;
}

function swCow17Cleanup() {
  const asset = swCow17CachedAsset;
  asset?.mixer?.stopAllAction?.();
  if (swCow17RuntimeState.cow?.mesh?.userData) delete swCow17RuntimeState.cow.mesh.userData.swCow17AuthoredAssetId;
  if (asset?.visual?.parent) asset.visual.parent.remove(asset.visual);
  swCow17RestoreFallback();
  if (swCow17RuntimeState.cow || asset?.visual?.parent) swCow17RuntimeState.cleanupCount += 1;
  swCow17RuntimeState.cow = null;
  swCow17ClearActiveState();
}

function swCow17Attach(cow, asset) {
  if (asset.visual.parent) asset.visual.parent.remove(asset.visual);
  swCow17HideFallback(cow);
  cow.mesh.add(asset.visual);
  asset.action.reset();
  asset.action.enabled = true;
  asset.action.play();

  swCow17RuntimeState.appliedCount += 1;
  swCow17RuntimeState.activeCowId = cow.id;
  swCow17RuntimeState.activeAnimation = asset.clip.name;
  swCow17RuntimeState.activeJointCount = asset.joints;
  swCow17RuntimeState.activeTriangleCount = asset.triangles;
  swCow17RuntimeState.activeTexturedMaterialCount = asset.texturedMaterialCount;
  swCow17RuntimeState.activeSkinnedMeshCount = asset.skinnedMeshCount;
  swCow17RuntimeState.activeHeight = SW_COW17_RUNTIME_ASSET.targetHeight;
  swCow17RuntimeState.lastError = null;
  cow.mesh.userData.swCow17AuthoredAssetId = SW_COW17_RUNTIME_ASSET.id;
}

async function swCow17LoadForCow(cow, generation) {
  try {
    const asset = await swCow17LoadAssetOnce();
    if (generation !== swCow17RuntimeState.generation || swCow17RuntimeState.cow !== cow) return false;
    swCow17Attach(cow, asset);
    return true;
  } catch (error) {
    swCow17RuntimeState.lastError = String(error?.message || error);
    console.warn('[Severe Weather Warning] Cow 17 authored visual fallback retained.', error);
    return false;
  }
}

function swCow17Register(cow) {
  if (!cow || cow.id !== 17 || !cow.mesh) return;
  swCow17RuntimeState.registrations += 1;
  swCow17RuntimeState.cow = cow;
  const generation = swCow17RuntimeState.generation;
  Promise.resolve().then(() => swCow17LoadForCow(cow, generation));
}

function swCow17Advance(dt) {
  const asset = swCow17CachedAsset;
  const cow = swCow17RuntimeState.cow;
  if (!asset?.mixer || !swCow17RuntimeState.activeCowId || !cow || !Number.isFinite(dt) || dt <= 0) return;
  const motionScale = cow.airborne ? 0.18 : 1;
  asset.mixer.update(dt * motionScale);
  swCow17RuntimeState.animationTicks += 1;
  swCow17RuntimeState.animationSeconds += dt * motionScale;
}

function swCow17Snapshot() {
  return Object.freeze({
    version: SW_COW17_RUNTIME_ASSET_VERSION,
    loader: SW_COW17_RUNTIME_LOADER,
    assetId: SW_COW17_RUNTIME_ASSET.id,
    assetUrl: SW_COW17_RUNTIME_ASSET.url,
    expectedSha256: SW_COW17_RUNTIME_ASSET.sha256,
    expectedBytes: SW_COW17_RUNTIME_ASSET.expectedBytes,
    generation: swCow17RuntimeState.generation,
    registrations: swCow17RuntimeState.registrations,
    loadAttempts: swCow17RuntimeState.loadAttempts,
    loadSuccesses: swCow17RuntimeState.loadSuccesses,
    loadFailures: swCow17RuntimeState.loadFailures,
    appliedCount: swCow17RuntimeState.appliedCount,
    cleanupCount: swCow17RuntimeState.cleanupCount,
    animationTicks: swCow17RuntimeState.animationTicks,
    animationSeconds: Number(swCow17RuntimeState.animationSeconds.toFixed(3)),
    activeCowId: swCow17RuntimeState.activeCowId,
    activeAnimation: swCow17RuntimeState.activeAnimation,
    activeJointCount: swCow17RuntimeState.activeJointCount,
    activeTriangleCount: swCow17RuntimeState.activeTriangleCount,
    activeTexturedMaterialCount: swCow17RuntimeState.activeTexturedMaterialCount,
    activeSkinnedMeshCount: swCow17RuntimeState.activeSkinnedMeshCount,
    activeHeight: swCow17RuntimeState.activeHeight,
    fallbackVisible: swCow17RuntimeState.activeCowId === null,
    lastError: swCow17RuntimeState.lastError,
  });
}

if (typeof configureBovineAnimal !== 'function' || typeof updateBovineSignature !== 'function' || typeof resetBovineSignature !== 'function') {
  swCow17Fail('accepted bovine runtime seam is missing');
}

const swCow17OriginalConfigureBovineAnimal = configureBovineAnimal;
configureBovineAnimal = function configureBovineAnimalWithAuthoredCow17(...args) {
  const cow = swCow17OriginalConfigureBovineAnimal.apply(this, args);
  if (cow?.id === 17) swCow17Register(cow);
  return cow;
};

const swCow17OriginalUpdateBovineSignature = updateBovineSignature;
updateBovineSignature = function updateBovineSignatureWithAuthoredCow17(dt) {
  const result = swCow17OriginalUpdateBovineSignature.apply(this, arguments);
  swCow17Advance(dt);
  return result;
};

const swCow17OriginalResetBovineSignature = resetBovineSignature;
resetBovineSignature = function resetBovineSignatureWithAuthoredCow17(...args) {
  swCow17RuntimeState.generation += 1;
  swCow17Cleanup();
  return swCow17OriginalResetBovineSignature.apply(this, args);
};

globalThis.__SW_COW17_RUNTIME_ASSET__ = Object.freeze({
  version: SW_COW17_RUNTIME_ASSET_VERSION,
  loader: SW_COW17_RUNTIME_LOADER,
  asset: SW_COW17_RUNTIME_ASSET,
  getSnapshot: swCow17Snapshot,
});
// [SW:ART:009:COW17_RUNTIME:END]
