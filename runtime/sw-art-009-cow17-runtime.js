// ============================================================================
// [SW:ART:009:COW17_RUNTIME]
// Cow 17 authored visual adapter. Presentation only: bovine gameplay authority,
// safety, physics, scoring, coordinates, and flight telemetry remain untouched.
// ============================================================================
const SW_COW17_RUNTIME_ASSET_VERSION = 'SW_COW17_RUNTIME_ASSET_V1';
const SW_COW17_RUNTIME_ASSET = Object.freeze({
  id: 'character.cow17.walking.v1',
  url: './assets/production/characters/cow17-walking-v1.glb',
  sha256: 'd5bb4e47a12fde652808a53fdcb3dfddf71b944f2efb6641bf18ce8ac5c82a93',
  expectedBytes: 14412828,
  maxBytes: 15000000,
  expectedTriangles: 198050,
  expectedJoints: 24,
  expectedAnimation: 'Armature|walking_man|baselayer',
  targetHeight: 3.6,
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
  activeHeight: 0,
  lastError: null,
  cow: null,
  visual: null,
  mixer: null,
  fallbackChildren: null,
  fallbackRootMaterial: null,
  hiddenRootMaterial: null,
};

function swCow17Fail(message) {
  throw new Error(`Cow 17 runtime asset: ${message}`);
}

function swCow17ReadGlb(buffer) {
  if (!(buffer instanceof ArrayBuffer)) swCow17Fail('expected ArrayBuffer payload');
  if (buffer.byteLength !== SW_COW17_RUNTIME_ASSET.expectedBytes) {
    swCow17Fail(`byte length mismatch ${buffer.byteLength}`);
  }
  if (buffer.byteLength > SW_COW17_RUNTIME_ASSET.maxBytes) swCow17Fail('asset exceeds mobile byte guard');
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546c67) swCow17Fail('missing glTF magic');
  if (view.getUint32(4, true) !== 2) swCow17Fail(`unsupported GLB version ${view.getUint32(4, true)}`);
  if (view.getUint32(8, true) !== buffer.byteLength) swCow17Fail('GLB declared length mismatch');

  let offset = 12;
  let json = null;
  let bin = null;
  while (offset + 8 <= buffer.byteLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    offset += 8;
    if (offset + chunkLength > buffer.byteLength) swCow17Fail('chunk exceeds GLB length');
    if (chunkType === 0x4e4f534a) {
      const text = new TextDecoder().decode(new Uint8Array(buffer, offset, chunkLength)).replace(/\u0000+$/g, '').trim();
      json = JSON.parse(text);
    } else if (chunkType === 0x004e4942) {
      bin = new Uint8Array(buffer, offset, chunkLength);
    }
    offset += chunkLength;
  }
  if (!json || !bin) swCow17Fail('GLB requires JSON and BIN chunks');
  if (String(json.asset?.version || '') !== '2.0') swCow17Fail(`unexpected glTF asset version ${json.asset?.version}`);
  if (!Array.isArray(json.buffers) || json.buffers.length !== 1 || json.buffers[0]?.uri) swCow17Fail('asset must use one embedded buffer');
  if (!Array.isArray(json.meshes) || json.meshes.length !== 1) swCow17Fail('asset must contain exactly one mesh');
  if (!Array.isArray(json.skins) || json.skins.length !== 1) swCow17Fail('asset must contain exactly one skin');
  if (!Array.isArray(json.animations) || json.animations.length !== 1) swCow17Fail('asset must contain exactly one animation');
  if ((json.skins[0]?.joints || []).length !== SW_COW17_RUNTIME_ASSET.expectedJoints) swCow17Fail('unexpected joint count');
  if (json.animations[0]?.name !== SW_COW17_RUNTIME_ASSET.expectedAnimation) swCow17Fail(`unexpected animation ${json.animations[0]?.name}`);
  const primitive = json.meshes[0]?.primitives?.[0];
  if (!primitive || json.meshes[0].primitives.length !== 1) swCow17Fail('asset must contain one mesh primitive');
  const indexAccessor = json.accessors?.[primitive.indices];
  const triangles = Math.floor(Number(indexAccessor?.count || 0) / 3);
  if (triangles !== SW_COW17_RUNTIME_ASSET.expectedTriangles) swCow17Fail(`triangle count mismatch ${triangles}`);
  return { json, bin, triangles };
}

const SW_COW17_COMPONENTS = Object.freeze({
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array,
});
const SW_COW17_COMPONENT_COUNTS = Object.freeze({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 });

function swCow17Accessor(parsed, accessorIndex) {
  const accessor = parsed.json.accessors?.[accessorIndex];
  if (!accessor) swCow17Fail(`missing accessor ${accessorIndex}`);
  if (accessor.sparse) swCow17Fail('sparse accessors are unsupported for the bounded Cow 17 asset');
  const bufferView = parsed.json.bufferViews?.[accessor.bufferView];
  if (!bufferView) swCow17Fail(`missing bufferView for accessor ${accessorIndex}`);
  if (bufferView.byteStride) swCow17Fail('interleaved bufferViews are unsupported for the bounded Cow 17 asset');
  const ArrayType = SW_COW17_COMPONENTS[accessor.componentType];
  const itemSize = SW_COW17_COMPONENT_COUNTS[accessor.type];
  if (!ArrayType || !itemSize) swCow17Fail(`unsupported accessor format ${accessor.componentType}/${accessor.type}`);
  const elementCount = Number(accessor.count) * itemSize;
  const byteOffset = parsed.bin.byteOffset + Number(bufferView.byteOffset || 0) + Number(accessor.byteOffset || 0);
  const source = new ArrayType(parsed.bin.buffer, byteOffset, elementCount);
  return {
    array: source.slice(),
    itemSize,
    normalized: accessor.normalized === true,
    count: Number(accessor.count),
    min: accessor.min || null,
    max: accessor.max || null,
  };
}

async function swCow17Texture(parsed) {
  const image = parsed.json.images?.[0];
  if (!image || image.uri || image.mimeType !== 'image/png') swCow17Fail('expected one embedded PNG texture');
  const bufferView = parsed.json.bufferViews?.[image.bufferView];
  if (!bufferView) swCow17Fail('embedded texture bufferView missing');
  const start = Number(bufferView.byteOffset || 0);
  const end = start + Number(bufferView.byteLength || 0);
  const bytes = parsed.bin.slice(start, end);
  const objectUrl = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  try {
    const texture = await new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(objectUrl, resolve, undefined, reject);
    });
    texture.flipY = false;
    if (THREE.sRGBEncoding !== undefined) texture.encoding = THREE.sRGBEncoding;
    texture.needsUpdate = true;
    return texture;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function swCow17ApplyNodeTransform(object, definition) {
  if (Array.isArray(definition.matrix) && definition.matrix.length === 16) {
    const matrix = new THREE.Matrix4().fromArray(definition.matrix);
    matrix.decompose(object.position, object.quaternion, object.scale);
    return;
  }
  if (Array.isArray(definition.translation)) object.position.fromArray(definition.translation);
  if (Array.isArray(definition.rotation)) object.quaternion.fromArray(definition.rotation);
  if (Array.isArray(definition.scale)) object.scale.fromArray(definition.scale);
}

function swCow17BuildAnimation(parsed, objects) {
  const animation = parsed.json.animations[0];
  const tracks = [];
  for (const channel of animation.channels || []) {
    const sampler = animation.samplers?.[channel.sampler];
    const target = objects[channel.target?.node];
    if (!sampler || !target) swCow17Fail('animation channel references missing sampler/node');
    if (!['LINEAR', 'STEP'].includes(sampler.interpolation || 'LINEAR')) swCow17Fail(`unsupported interpolation ${sampler.interpolation}`);
    const input = swCow17Accessor(parsed, sampler.input);
    const output = swCow17Accessor(parsed, sampler.output);
    const path = channel.target.path;
    let track;
    if (path === 'rotation') {
      track = new THREE.QuaternionKeyframeTrack(`${target.name}.quaternion`, input.array, output.array);
    } else if (path === 'translation') {
      track = new THREE.VectorKeyframeTrack(`${target.name}.position`, input.array, output.array);
    } else if (path === 'scale') {
      track = new THREE.VectorKeyframeTrack(`${target.name}.scale`, input.array, output.array);
    } else {
      swCow17Fail(`unsupported animation path ${path}`);
    }
    track.setInterpolation((sampler.interpolation || 'LINEAR') === 'STEP' ? THREE.InterpolateDiscrete : THREE.InterpolateLinear);
    tracks.push(track);
  }
  if (tracks.length < 1) swCow17Fail('animation contains no usable tracks');
  return new THREE.AnimationClip(animation.name, -1, tracks);
}

async function swCow17BuildScene(buffer) {
  const parsed = swCow17ReadGlb(buffer);
  const texture = await swCow17Texture(parsed);
  const primitive = parsed.json.meshes[0].primitives[0];
  const geometry = new THREE.BufferGeometry();
  const attributeMap = [
    ['POSITION', 'position'],
    ['NORMAL', 'normal'],
    ['TEXCOORD_0', 'uv'],
    ['JOINTS_0', 'skinIndex'],
    ['WEIGHTS_0', 'skinWeight'],
  ];
  for (const [gltfName, threeName] of attributeMap) {
    const accessorIndex = primitive.attributes?.[gltfName];
    if (accessorIndex === undefined) swCow17Fail(`missing ${gltfName} attribute`);
    const accessor = swCow17Accessor(parsed, accessorIndex);
    geometry.setAttribute(threeName, new THREE.BufferAttribute(accessor.array, accessor.itemSize, accessor.normalized));
  }
  const indices = swCow17Accessor(parsed, primitive.indices);
  geometry.setIndex(new THREE.BufferAttribute(indices.array, 1));
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: texture,
    roughness: 0.68,
    metalness: 0.02,
    side: THREE.DoubleSide,
    skinning: true,
  });

  const skinDefinition = parsed.json.skins[0];
  const jointSet = new Set(skinDefinition.joints || []);
  const objects = (parsed.json.nodes || []).map((definition, index) => {
    let object;
    if (definition.mesh !== undefined) {
      object = new THREE.SkinnedMesh(geometry, material);
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = false;
    } else if (jointSet.has(index)) {
      object = new THREE.Bone();
    } else {
      object = new THREE.Object3D();
    }
    object.name = definition.name || `cow17_node_${index}`;
    swCow17ApplyNodeTransform(object, definition);
    return object;
  });

  (parsed.json.nodes || []).forEach((definition, index) => {
    for (const childIndex of definition.children || []) {
      if (!objects[childIndex]) swCow17Fail(`missing child node ${childIndex}`);
      objects[index].add(objects[childIndex]);
    }
  });

  const sceneRoot = new THREE.Group();
  sceneRoot.name = 'SW_COW17_AUTHORED_VISUAL';
  for (const rootIndex of parsed.json.scenes?.[parsed.json.scene || 0]?.nodes || []) sceneRoot.add(objects[rootIndex]);
  if (sceneRoot.children.length < 1) swCow17Fail('scene contains no root node');
  sceneRoot.updateMatrixWorld(true);

  const inverseBind = swCow17Accessor(parsed, skinDefinition.inverseBindMatrices);
  if (inverseBind.count !== SW_COW17_RUNTIME_ASSET.expectedJoints || inverseBind.itemSize !== 16) swCow17Fail('invalid inverse bind matrix accessor');
  const bones = skinDefinition.joints.map((index) => objects[index]);
  if (bones.some((bone) => !bone?.isBone)) swCow17Fail('skin contains non-bone joints');
  const boneInverses = bones.map((_, index) => new THREE.Matrix4().fromArray(inverseBind.array, index * 16));
  const skeleton = new THREE.Skeleton(bones, boneInverses);
  const skinnedMeshes = objects.filter((object) => object?.isSkinnedMesh);
  if (skinnedMeshes.length !== 1) swCow17Fail(`expected one skinned mesh, found ${skinnedMeshes.length}`);
  skinnedMeshes[0].bind(skeleton, skinnedMeshes[0].matrixWorld);

  const clip = swCow17BuildAnimation(parsed, objects);
  return { scene: sceneRoot, clip, triangles: parsed.triangles, joints: bones.length };
}

function swCow17DisposeVisual(visual) {
  if (!visual) return;
  const textures = new Set();
  const materials = new Set();
  visual.traverse((object) => {
    if (!object?.isMesh) return;
    object.geometry?.dispose?.();
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list) {
      if (!material || materials.has(material)) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      material.dispose?.();
    }
  });
  textures.forEach((texture) => texture.dispose?.());
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

function swCow17Cleanup() {
  swCow17RuntimeState.mixer?.stopAllAction?.();
  if (swCow17RuntimeState.visual?.parent) swCow17RuntimeState.visual.parent.remove(swCow17RuntimeState.visual);
  swCow17DisposeVisual(swCow17RuntimeState.visual);
  swCow17RestoreFallback();
  if (swCow17RuntimeState.cow || swCow17RuntimeState.visual || swCow17RuntimeState.mixer) swCow17RuntimeState.cleanupCount += 1;
  swCow17RuntimeState.cow = null;
  swCow17RuntimeState.visual = null;
  swCow17RuntimeState.mixer = null;
  swCow17RuntimeState.activeCowId = null;
  swCow17RuntimeState.activeAnimation = null;
  swCow17RuntimeState.activeJointCount = 0;
  swCow17RuntimeState.activeTriangleCount = 0;
  swCow17RuntimeState.activeHeight = 0;
}

function swCow17PrepareVisual(cow, parsed) {
  const visual = parsed.scene;
  visual.rotation.y = Math.PI;
  visual.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(visual);
  const size = new THREE.Vector3();
  box.getSize(size);
  if (!Number.isFinite(size.y) || size.y <= 0) swCow17Fail(`invalid authored height ${size.y}`);
  const scale = SW_COW17_RUNTIME_ASSET.targetHeight / size.y;
  visual.scale.multiplyScalar(scale);
  visual.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(visual);
  const center = new THREE.Vector3();
  box.getCenter(center);
  visual.position.x -= center.x;
  visual.position.z -= center.z;
  visual.position.y += -0.8 - box.min.y;
  visual.updateMatrixWorld(true);

  swCow17RuntimeState.fallbackChildren = [...cow.mesh.children];
  swCow17RuntimeState.fallbackRootMaterial = cow.mesh.material;
  const hiddenMaterial = cow.mesh.material?.clone?.();
  if (hiddenMaterial) {
    hiddenMaterial.visible = false;
    cow.mesh.material = hiddenMaterial;
    swCow17RuntimeState.hiddenRootMaterial = hiddenMaterial;
  }
  for (const child of swCow17RuntimeState.fallbackChildren) child.visible = false;
  cow.mesh.add(visual);

  const mixer = new THREE.AnimationMixer(visual);
  const action = mixer.clipAction(parsed.clip);
  action.setLoop(THREE.LoopRepeat, Infinity);
  action.enabled = true;
  action.play();
  return { visual, mixer, height: SW_COW17_RUNTIME_ASSET.targetHeight };
}

async function swCow17LoadForCow(cow, generation) {
  swCow17RuntimeState.loadAttempts += 1;
  try {
    const response = await fetch(SW_COW17_RUNTIME_ASSET.url, { cache: 'force-cache' });
    if (!response.ok) swCow17Fail(`HTTP ${response.status} for ${SW_COW17_RUNTIME_ASSET.url}`);
    const bytes = await response.arrayBuffer();
    const parsed = await swCow17BuildScene(bytes);
    if (generation !== swCow17RuntimeState.generation || swCow17RuntimeState.cow !== cow) {
      swCow17DisposeVisual(parsed.scene);
      return false;
    }
    const prepared = swCow17PrepareVisual(cow, parsed);
    swCow17RuntimeState.visual = prepared.visual;
    swCow17RuntimeState.mixer = prepared.mixer;
    swCow17RuntimeState.loadSuccesses += 1;
    swCow17RuntimeState.appliedCount += 1;
    swCow17RuntimeState.activeCowId = cow.id;
    swCow17RuntimeState.activeAnimation = parsed.clip.name;
    swCow17RuntimeState.activeJointCount = parsed.joints;
    swCow17RuntimeState.activeTriangleCount = parsed.triangles;
    swCow17RuntimeState.activeHeight = prepared.height;
    swCow17RuntimeState.lastError = null;
    cow.mesh.userData.swCow17AuthoredAssetId = SW_COW17_RUNTIME_ASSET.id;
    return true;
  } catch (error) {
    swCow17RuntimeState.loadFailures += 1;
    swCow17RuntimeState.lastError = String(error?.message || error);
    console.warn('[Severe Weather Warning] Cow 17 authored visual fallback retained.', error);
    return false;
  }
}

function swCow17Register(cow) {
  if (!cow || cow.id !== 17 || !cow.mesh) return;
  swCow17RuntimeState.registrations += 1;
  swCow17RuntimeState.cow = cow;
  swCow17RuntimeState.activeCowId = cow.id;
  const generation = swCow17RuntimeState.generation;
  Promise.resolve().then(() => swCow17LoadForCow(cow, generation));
}

function swCow17Advance(dt) {
  const mixer = swCow17RuntimeState.mixer;
  const cow = swCow17RuntimeState.cow;
  if (!mixer || !cow || !Number.isFinite(dt) || dt <= 0) return;
  const motionScale = cow.airborne ? 0.18 : 1;
  mixer.update(dt * motionScale);
  swCow17RuntimeState.animationTicks += 1;
  swCow17RuntimeState.animationSeconds += dt * motionScale;
}

function swCow17Snapshot() {
  return Object.freeze({
    version: SW_COW17_RUNTIME_ASSET_VERSION,
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
    activeHeight: swCow17RuntimeState.activeHeight,
    fallbackVisible: swCow17RuntimeState.visual === null,
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
  asset: SW_COW17_RUNTIME_ASSET,
  getSnapshot: swCow17Snapshot,
});
// [SW:ART:009:COW17_RUNTIME:END]
