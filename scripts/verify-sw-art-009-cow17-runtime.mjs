#!/usr/bin/env node
// [SW:ART:009:STATIC_VERIFY]
// Verifies Cow 17 authored runtime integration without executing gameplay.

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const assetPath = path.join(projectRoot, 'assets', 'production', 'characters', 'cow17-walking-v1.glb');
const runtimePath = path.join(projectRoot, 'runtime', 'sw-art-009-cow17-runtime.js');
const buildPath = path.join(projectRoot, 'scripts', 'build-web.mjs');
const provenancePath = path.join(projectRoot, 'assets', 'production', 'asset-provenance.json');
const attributesPath = path.join(projectRoot, '.gitattributes');
const expectedSha256 = 'd5bb4e47a12fde652808a53fdcb3dfddf71b944f2efb6641bf18ce8ac5c82a93';
const expectedBytes = 14412828;
const expectedTriangles = 198050;
const expectedJoints = 24;
const expectedAnimation = 'Armature|walking_man|baselayer';
const failures = [];
const checks = [];

function check(condition, label, detail = '') {
  checks.push({ label, passed: Boolean(condition), detail });
  if (!condition) failures.push(detail ? `${label}: ${detail}` : label);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function readGlbJson(buffer) {
  if (buffer.subarray(0, 4).toString('ascii') !== 'glTF') throw new Error('missing glTF magic');
  const version = buffer.readUInt32LE(4);
  if (version !== 2) throw new Error(`unexpected GLB version ${version}`);
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error('declared GLB length mismatch');
  let offset = 12;
  let json = null;
  let binBytes = 0;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (offset + length > buffer.length) throw new Error('GLB chunk exceeds file length');
    if (type === 0x4e4f534a) {
      json = JSON.parse(buffer.subarray(offset, offset + length).toString('utf8').replace(/\0+$/g, '').trim());
    } else if (type === 0x004e4942) {
      binBytes += length;
    }
    offset += length;
  }
  if (!json || binBytes < 1) throw new Error('GLB requires JSON and BIN chunks');
  return { json, binBytes };
}

const asset = await readFile(assetPath);
const assetSha = sha256(asset);
check(assetSha === expectedSha256, 'exact Cow 17 GLB SHA-256', assetSha);
check(asset.length === expectedBytes, 'exact Cow 17 GLB byte count', String(asset.length));
check(asset.length <= 15000000, 'Cow 17 GLB mobile byte guard', `${asset.length} <= 15000000`);

let gltf = null;
try {
  gltf = readGlbJson(asset).json;
  check(true, 'Cow 17 GLB parses as glTF 2.0');
} catch (error) {
  check(false, 'Cow 17 GLB parses as glTF 2.0', error.message);
}

if (gltf) {
  check(String(gltf.asset?.version || '') === '2.0', 'glTF asset version is 2.0', String(gltf.asset?.version || 'missing'));
  check(Array.isArray(gltf.buffers) && gltf.buffers.length === 1 && !gltf.buffers[0]?.uri, 'GLB uses one embedded buffer');
  check(Array.isArray(gltf.meshes) && gltf.meshes.length === 1, 'Cow 17 contains one mesh', String(gltf.meshes?.length ?? 0));
  check(Array.isArray(gltf.skins) && gltf.skins.length === 1, 'Cow 17 contains one skin', String(gltf.skins?.length ?? 0));
  check((gltf.skins?.[0]?.joints || []).length === expectedJoints, 'Cow 17 skin has 24 joints', String((gltf.skins?.[0]?.joints || []).length));
  check(Array.isArray(gltf.animations) && gltf.animations.length === 1, 'Cow 17 contains one animation', String(gltf.animations?.length ?? 0));
  check(gltf.animations?.[0]?.name === expectedAnimation, 'Cow 17 animation identity', String(gltf.animations?.[0]?.name || 'missing'));
  const primitives = gltf.meshes?.[0]?.primitives || [];
  check(primitives.length === 1, 'Cow 17 contains one mesh primitive', String(primitives.length));
  const primitive = primitives[0] || {};
  for (const attribute of ['POSITION', 'NORMAL', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']) {
    check(Number.isInteger(primitive.attributes?.[attribute]), `Cow 17 includes ${attribute}`);
  }
  const indexAccessor = gltf.accessors?.[primitive.indices];
  const triangles = Math.floor(Number(indexAccessor?.count || 0) / 3);
  check(triangles === expectedTriangles, 'Cow 17 triangle count', String(triangles));
  check(indexAccessor?.componentType === 5125, 'Cow 17 indices use Uint32', String(indexAccessor?.componentType || 'missing'));
  check(Array.isArray(gltf.images) && gltf.images.length === 1 && !gltf.images[0]?.uri && gltf.images[0]?.mimeType === 'image/png', 'Cow 17 uses one embedded PNG texture');
  check((gltf.extensionsRequired || []).length === 0, 'Cow 17 requires no glTF extension', JSON.stringify(gltf.extensionsRequired || []));
}

const runtime = await readFile(runtimePath, 'utf8');
for (const marker of [
  'SW_COW17_RUNTIME_ASSET_V1',
  '[SW:ART:009:COW17_RUNTIME]',
  'character.cow17.walking.v1',
  './assets/production/characters/cow17-walking-v1.glb',
  expectedSha256,
  'configureBovineAnimalWithAuthoredCow17',
  'updateBovineSignatureWithAuthoredCow17',
  'resetBovineSignatureWithAuthoredCow17',
  'new THREE.AnimationMixer',
  '__SW_COW17_RUNTIME_ASSET__',
  'fallbackVisible',
]) {
  check(runtime.includes(marker), `runtime marker ${marker}`);
}

const protectedAssignmentPatterns = [
  /\b(?:cow|target)\.(?:x|z|groundY|altitude|airborne|health|maxHealth|destroyed|points|damageStage)\s*=/,
  /\bstorm\.(?:pos|radius|speed|velocity)\s*=/,
  /\b(?:score|combo|timer|warningTime|mooLevelUnlocked)\s*=/,
];
for (const pattern of protectedAssignmentPatterns) {
  check(!pattern.test(runtime), 'runtime does not assign protected gameplay truth', pattern.toString());
}
check(!runtime.includes('new THREE.WebGLRenderer'), 'runtime does not create a second renderer');
check(!runtime.includes('http://') && !runtime.includes('https://'), 'runtime has no network asset URL');

const build = await readFile(buildPath, 'utf8');
for (const marker of [
  "const cow17RuntimeFile = 'sw-art-009-cow17-runtime.js'",
  "const cow17AssetRelativePath = path.join('characters', 'cow17-walking-v1.glb')",
  expectedSha256,
  'cow17InjectionMarker',
  'cow17RuntimeBundle',
  'cow17Sha256',
  'cow17Bytes',
]) {
  check(build.includes(marker), `build marker ${marker}`);
}
check(build.includes("html = html.replace(gameplayLoopMarker, `${cow17RuntimeBundle}${gameplayLoopMarker}`);"), 'build injects Cow 17 runtime before gameplay loop');
check(build.includes('await cp(sourceProductionAssetsDir, outputProductionAssets, { recursive: true });'), 'build packages production assets locally');

const provenance = JSON.parse(await readFile(provenancePath, 'utf8'));
const entry = (provenance.productionImports || []).find((candidate) => candidate.id === 'character.cow17.walking.v1');
check(Boolean(entry), 'Cow 17 production provenance entry exists');
if (entry) {
  check(entry.reviewStatus === 'candidate', 'Cow 17 provenance remains candidate pending runtime review', String(entry.reviewStatus));
  check(entry.sourceArtifactId === 9253571210 && entry.sourceRunId === 31910662893, 'Cow 17 provenance pins SW-ART-008 evidence');
  check(entry.finalSha256 === expectedSha256, 'Cow 17 provenance pins exact GLB SHA', String(entry.finalSha256));
  check(entry.localDestination === 'assets/production/characters/cow17-walking-v1.glb', 'Cow 17 provenance pins local offline destination', String(entry.localDestination));
  check(entry.bytes === expectedBytes, 'Cow 17 provenance records exact byte count', String(entry.bytes));
}

const attributes = await readFile(attributesPath, 'utf8');
check(/^\*\.glb binary$/m.test(attributes), '.gitattributes marks GLB as binary');

const report = {
  version: 'SW_ART_009_COW17_STATIC_REPORT_V1',
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0,
  asset: {
    path: path.relative(projectRoot, assetPath).replaceAll('\\', '/'),
    sha256: assetSha,
    bytes: asset.length,
    triangles: gltf ? Math.floor(Number(gltf.accessors?.[gltf.meshes?.[0]?.primitives?.[0]?.indices]?.count || 0) / 3) : null,
    joints: gltf ? (gltf.skins?.[0]?.joints || []).length : null,
    animation: gltf?.animations?.[0]?.name || null,
  },
  checks,
  failures,
};

await writeFile(path.join(projectRoot, 'sw-art-009-static-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`SW-ART-009 static verifier ${report.passed ? 'PASS' : 'FAIL'}: ${checks.filter((item) => item.passed).length}/${checks.length}`);
if (!report.passed) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
