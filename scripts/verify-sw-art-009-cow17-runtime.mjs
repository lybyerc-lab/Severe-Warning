#!/usr/bin/env node
// [SW:ART:009:STATIC_VERIFY]
// Small proof: exact asset, exact official loader, narrow runtime seam.

import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const assetPath = path.join(projectRoot, 'assets', 'production', 'characters', 'cow17-walking-v1.glb');
const runtimePath = path.join(projectRoot, 'runtime', 'sw-art-009-cow17-runtime.js');
const loaderPath = path.join(projectRoot, 'runtime', 'vendor', 'GLTFLoader-r128.js');
const licensePath = path.join(projectRoot, 'runtime', 'vendor', 'THREE-LICENSE.txt');
const buildPath = path.join(projectRoot, 'scripts', 'build-web.mjs');
const provenancePath = path.join(projectRoot, 'assets', 'production', 'asset-provenance.json');
const attributesPath = path.join(projectRoot, '.gitattributes');
const expectedSha256 = 'd5bb4e47a12fde652808a53fdcb3dfddf71b944f2efb6641bf18ce8ac5c82a93';
const expectedBytes = 14412828;
const expectedTriangles = 198050;
const expectedJoints = 24;
const expectedAnimation = 'Armature|walking_man|baselayer';
const expectedLoaderBlob = 'cfa518ede1b0893f1da14347d78fcd19355f3686';
const expectedLicenseBlob = '5303437e406ed22d8cb0b4c12398870792a25878';
const failures = [];
const checks = [];

function check(condition, label, detail = '') {
  checks.push({ label, passed: Boolean(condition), detail });
  if (!condition) failures.push(detail ? `${label}: ${detail}` : label);
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function gitBlobSha1(bytes) {
  return createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
}

function readGlbJson(buffer) {
  if (buffer.subarray(0, 4).toString('ascii') !== 'glTF') throw new Error('missing glTF magic');
  if (buffer.readUInt32LE(4) !== 2) throw new Error(`unexpected GLB version ${buffer.readUInt32LE(4)}`);
  if (buffer.readUInt32LE(8) !== buffer.length) throw new Error('declared GLB length mismatch');
  let offset = 12;
  let json = null;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    offset += 8;
    if (offset + length > buffer.length) throw new Error('GLB chunk exceeds file length');
    if (type === 0x4e4f534a) {
      json = JSON.parse(buffer.subarray(offset, offset + length).toString('utf8').replace(/\0+$/g, '').trim());
    }
    offset += length;
  }
  if (!json) throw new Error('missing GLB JSON chunk');
  return json;
}

const asset = await readFile(assetPath);
const assetSha = sha256(asset);
check(assetSha === expectedSha256, 'exact Cow 17 GLB SHA-256', assetSha);
check(asset.length === expectedBytes, 'exact Cow 17 GLB byte count', String(asset.length));
check(asset.length <= 15000000, 'Cow 17 stays inside 15 MB task guard', String(asset.length));

let gltf = null;
try {
  gltf = readGlbJson(asset);
  check(true, 'Cow 17 parses as glTF 2.0');
} catch (error) {
  check(false, 'Cow 17 parses as glTF 2.0', error.message);
}

if (gltf) {
  const primitive = gltf.meshes?.[0]?.primitives?.[0];
  const indexAccessor = gltf.accessors?.[primitive?.indices];
  const triangles = Math.floor(Number(indexAccessor?.count || 0) / 3);
  check((gltf.skins?.[0]?.joints || []).length === expectedJoints, 'Cow 17 has 24-joint skin', String((gltf.skins?.[0]?.joints || []).length));
  check(triangles === expectedTriangles, 'Cow 17 has expected triangle count', String(triangles));
  check(gltf.animations?.[0]?.name === expectedAnimation, 'Cow 17 has expected walk clip', String(gltf.animations?.[0]?.name || 'missing'));
  check(Array.isArray(gltf.images) && gltf.images.length >= 1, 'Cow 17 GLB contains authored image texture', String(gltf.images?.length || 0));
  check(Number.isInteger(primitive?.attributes?.TEXCOORD_0), 'Cow 17 mesh has authored UVs');
  check(Number.isInteger(primitive?.attributes?.JOINTS_0) && Number.isInteger(primitive?.attributes?.WEIGHTS_0), 'Cow 17 mesh has skin attributes');
}

const loaderBytes = await readFile(loaderPath);
const licenseBytes = await readFile(licensePath);
const loader = loaderBytes.toString('utf8');
check(gitBlobSha1(loaderBytes) === expectedLoaderBlob, 'vendored loader is exact official Three.js r128 blob', gitBlobSha1(loaderBytes));
check(gitBlobSha1(licenseBytes) === expectedLicenseBlob, 'vendored Three.js license is exact r128 blob', gitBlobSha1(licenseBytes));
check(loader.includes('THREE.GLTFLoader = GLTFLoader;'), 'official loader registers THREE.GLTFLoader');

const runtime = await readFile(runtimePath, 'utf8');
for (const marker of [
  'SW_COW17_RUNTIME_ASSET_V2',
  "SW_COW17_RUNTIME_LOADER = 'THREE.GLTFLoader r128'",
  'new THREE.GLTFLoader().load(',
  'new THREE.AnimationMixer(gltf.scene)',
  'activeTexturedMaterialCount',
  'configureBovineAnimalWithAuthoredCow17',
  'updateBovineSignatureWithAuthoredCow17',
  'resetBovineSignatureWithAuthoredCow17',
  '__SW_COW17_RUNTIME_ASSET__',
]) {
  check(runtime.includes(marker), `runtime marker ${marker}`);
}
for (const removed of ['swCow17ReadGlb', 'swCow17Accessor', 'swCow17BuildAnimation', 'swCow17BuildScene', 'new THREE.TextureLoader()']) {
  check(!runtime.includes(removed), `custom parser removed: ${removed}`);
}
const protectedAssignmentPatterns = [
  /\b(?:cow|target)\.(?:x|z|groundY|altitude|airborne|health|maxHealth|destroyed|points|damageStage)\s*=/,
  /\bstorm\.(?:pos|radius|speed|velocity)\s*=/,
  /\b(?:score|combo|timer|warningTime|mooLevelUnlocked)\s*=/,
];
for (const pattern of protectedAssignmentPatterns) {
  check(!pattern.test(runtime), 'runtime does not assign protected gameplay truth', pattern.toString());
}
check(!runtime.includes('new THREE.WebGLRenderer'), 'Cow adapter does not create a renderer');
check(!runtime.includes('http://') && !runtime.includes('https://'), 'Cow adapter uses only local asset paths');

const build = await readFile(buildPath, 'utf8');
for (const marker of [
  "const cow17LoaderFile = 'vendor/GLTFLoader-r128.js'",
  expectedLoaderBlob,
  expectedLicenseBlob,
  'gitBlobSha1(cow17LoaderBytes)',
  'cow17LoaderMarker',
  'cow17InjectionMarker',
  'cow17RuntimeBundle',
  expectedSha256,
]) {
  check(build.includes(marker), `build marker ${marker}`);
}
check(build.includes('html.indexOf(cow17LoaderMarker) > html.indexOf(cow17InjectionMarker)'), 'build enforces loader before Cow adapter');
check(build.includes('await cp(sourceProductionAssetsDir, outputProductionAssets, { recursive: true });'), 'build packages Cow locally');

const provenance = JSON.parse(await readFile(provenancePath, 'utf8'));
const entry = (provenance.productionImports || []).find((candidate) => candidate.id === 'character.cow17.walking.v1');
check(Boolean(entry), 'Cow 17 production provenance exists');
if (entry) {
  check(entry.sourceArtifactId === 9253571210 && entry.sourceRunId === 31910662893, 'Cow 17 provenance pins SW-ART-008 evidence');
  check(entry.finalSha256 === expectedSha256, 'Cow 17 provenance pins exact GLB SHA', String(entry.finalSha256));
  check(entry.localDestination === 'assets/production/characters/cow17-walking-v1.glb', 'Cow 17 provenance pins local destination', String(entry.localDestination));
}

const attributes = await readFile(attributesPath, 'utf8');
check(/^\*\.glb binary$/m.test(attributes), '.gitattributes marks GLB as binary');

const report = {
  version: 'SW_ART_009_COW17_STATIC_REPORT_V2',
  generatedAt: new Date().toISOString(),
  passed: failures.length === 0,
  asset: {
    sha256: assetSha,
    bytes: asset.length,
    triangles: gltf ? Math.floor(Number(gltf.accessors?.[gltf.meshes?.[0]?.primitives?.[0]?.indices]?.count || 0) / 3) : null,
    joints: gltf ? (gltf.skins?.[0]?.joints || []).length : null,
    animation: gltf?.animations?.[0]?.name || null,
  },
  loader: {
    upstreamCommit: 'd4aa9e00ea29808534a3e082f602c544e5f2419c',
    gitBlob: gitBlobSha1(loaderBytes),
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
