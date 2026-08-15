#!/usr/bin/env node
// [SW:ART:007:MESHY_RETEXTURE_RECOVERY]
// GET-only recovery for one already-paid Retexture task. No task creation code exists here.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_007_MESHY_RETEXTURE_RECOVERY_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/retexture';

function fail(message) {
  throw new Error(message);
}

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${token}`);
    args[token.slice(2)] = value;
    index += 1;
  }
  for (const required of ['request', 'output-dir']) {
    if (!args[required]) fail(`Missing --${required}`);
  }
  return args;
}

function safeRelative(value, prefix) {
  return typeof value === 'string'
    && value.startsWith(prefix)
    && !value.includes('..')
    && !path.isAbsolute(value);
}

function validateRequest(request) {
  if (request.version !== 'SW_MESHY_RETEXTURE_RECOVERY_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Recovered output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (!/^[0-9a-f-]{36}$/.test(request.retextureTaskId || '')) fail('Missing exact Retexture task id.');
  if (request.retextureTaskId !== '01a0073a-779e-768e-9f0f-46f4e27347a5') fail(`Unexpected Retexture task id: ${request.retextureTaskId}`);
  if (request.expectedConsumedCredits !== 10) fail(`Expected consumed credits must be 10: ${request.expectedConsumedCredits}`);
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (!Number.isInteger(request.riggingGate?.maxTriangles) || request.riggingGate.maxTriangles !== 300000) fail('Rigging triangle gate must be exactly 300000.');
  if (!Number.isInteger(request.baseline?.vertices) || request.baseline.vertices <= 0) fail('Missing baseline vertex count.');
  if (!Number.isInteger(request.baseline?.triangles) || request.baseline.triangles <= 0) fail('Missing baseline triangle count.');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 1000) };
  }
  if (!response.ok) fail(`Meshy HTTP ${response.status}: ${JSON.stringify(data)}`);
  return data;
}

async function downloadBinary(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) fail(`Download failed ${response.status} for ${path.basename(outputPath)}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0) fail(`Downloaded empty file: ${outputPath}`);
  await writeFile(outputPath, buffer);
  return buffer;
}

function inspectGlb(glb) {
  if (glb.length < 20 || glb.subarray(0, 4).toString('ascii') !== 'glTF') fail('Downloaded GLB does not have a glTF magic header.');
  const version = glb.readUInt32LE(4);
  if (version !== 2) fail(`Unexpected GLB version: ${version}`);
  const jsonLength = glb.readUInt32LE(12);
  const jsonType = glb.readUInt32LE(16);
  if (jsonType !== 0x4e4f534a) fail('First GLB chunk is not JSON.');
  const json = JSON.parse(glb.subarray(20, 20 + jsonLength).toString('utf8').replace(/\u0000+$/g, '').trim());

  let vertices = 0;
  let triangles = 0;
  let primitives = 0;
  for (const mesh of json.meshes || []) {
    for (const primitive of mesh.primitives || []) {
      primitives += 1;
      const positionAccessor = primitive.attributes?.POSITION;
      if (Number.isInteger(positionAccessor)) vertices += json.accessors?.[positionAccessor]?.count || 0;
      const mode = primitive.mode ?? 4;
      if (Number.isInteger(primitive.indices)) {
        const count = json.accessors?.[primitive.indices]?.count || 0;
        if (mode === 4) triangles += Math.floor(count / 3);
      } else if (mode === 4 && Number.isInteger(positionAccessor)) {
        triangles += Math.floor((json.accessors?.[positionAccessor]?.count || 0) / 3);
      }
    }
  }

  return {
    glbVersion: version,
    scenes: json.scenes?.length || 0,
    nodes: json.nodes?.length || 0,
    meshes: json.meshes?.length || 0,
    primitives,
    vertices,
    triangles,
    materials: json.materials?.length || 0,
    textures: json.textures?.length || 0,
    images: json.images?.length || 0,
    skins: json.skins?.length || 0,
    animations: json.animations?.length || 0,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = JSON.parse(await readFile(args.request, 'utf8'));
  validateRequest(request);

  const plan = {
    version: 'SW_ART_007_RECOVERY_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    method: 'GET-only',
    endpoint: `${API_BASE}/${request.retextureTaskId}`,
    retextureTaskId: request.retextureTaskId,
    expectedConsumedCredits: request.expectedConsumedCredits,
    productionAuthority: request.productionAuthority,
    createsMeshyTask: false,
  };
  if (args.dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) fail('MESHY_API_KEY is missing or empty.');

  const outputDir = path.resolve(args['output-dir']);
  await mkdir(outputDir, { recursive: true });

  const task = await fetchJson(`${API_BASE}/${encodeURIComponent(request.retextureTaskId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  await writeFile(path.join(outputDir, 'sw-art-007-recovered-task.json'), `${JSON.stringify(task, null, 2)}\n`, 'utf8');

  if (task.id && task.id !== request.retextureTaskId) fail(`Recovered task id mismatch: ${task.id}`);
  if (task.status !== 'SUCCEEDED') fail(`Retexture task is not SUCCEEDED: ${task.status}`);
  if (task.consumed_credits !== request.expectedConsumedCredits) {
    fail(`Retexture consumed credits mismatch: expected ${request.expectedConsumedCredits}, got ${task.consumed_credits}`);
  }
  if (!task.model_urls?.glb) fail('Recovered Retexture task has no GLB URL.');
  if (!task.thumbnail_url) fail('Recovered Retexture task has no thumbnail URL.');

  const textureSet = Array.isArray(task.texture_urls) ? task.texture_urls[0] : task.texture_urls;
  if (!textureSet?.base_color) fail('Recovered Retexture task has no base-color texture URL.');
  if (!textureSet?.metallic || !textureSet?.roughness || !textureSet?.normal) {
    fail('Recovered PBR Retexture task is missing metallic, roughness, or normal map URL.');
  }

  const glb = await downloadBinary(task.model_urls.glb, path.join(outputDir, request.output.glb));
  const preview = await downloadBinary(task.thumbnail_url, path.join(outputDir, request.output.preview));
  const inspection = inspectGlb(glb);

  if (inspection.materials < 1 || inspection.textures < 1 || inspection.images < 1) fail('Recovered textured GLB is missing material/texture/image data.');
  if (inspection.skins !== 0 || inspection.animations !== 0) fail('Texture recovery must not contain rig or animation data yet.');
  if (inspection.triangles <= 0 || inspection.triangles > request.riggingGate.maxTriangles) {
    fail(`Recovered GLB triangle count is outside rigging gate: ${inspection.triangles}`);
  }

  const textureFiles = {};
  for (const [key, suffix] of [['base_color', 'base-color'], ['metallic', 'metallic'], ['roughness', 'roughness'], ['normal', 'normal'], ['emission', 'emission']]) {
    if (!textureSet?.[key]) continue;
    const filename = `${request.output.texturePrefix}-${suffix}.png`;
    const bytes = await downloadBinary(textureSet[key], path.join(outputDir, filename));
    textureFiles[key] = { filename, bytes: bytes.length, sha256: sha256(bytes) };
  }

  const topologyDelta = {
    baselineVertices: request.baseline.vertices,
    recoveredVertices: inspection.vertices,
    vertexDelta: inspection.vertices - request.baseline.vertices,
    baselineTriangles: request.baseline.triangles,
    recoveredTriangles: inspection.triangles,
    triangleDelta: inspection.triangles - request.baseline.triangles,
  };

  await writeFile(path.join(outputDir, 'sw-art-007-recovered-glb-inspection.json'), `${JSON.stringify({ inspection, topologyDelta }, null, 2)}\n`, 'utf8');

  const receipt = {
    version: 'SW_ART_007_MESHY_RETEXTURE_RECOVERY_RECEIPT_V1',
    marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null,
    request: request.id,
    retextureTaskId: request.retextureTaskId,
    status: task.status,
    consumedCredits: task.consumed_credits,
    recoveryMethod: 'GET-only',
    createsMeshyTask: false,
    productionAuthority: request.productionAuthority,
    output: {
      glb: request.output.glb,
      glbBytes: glb.length,
      glbSha256: sha256(glb),
      preview: request.output.preview,
      previewBytes: preview.length,
      previewSha256: sha256(preview),
      inspection,
      topologyDelta,
      textures: textureFiles,
    },
    riggingGate: {
      maxTriangles: request.riggingGate.maxTriangles,
      eligibleByTriangleCount: inspection.triangles <= request.riggingGate.maxTriangles,
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-007-recovery-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-007 Retexture recovery failed: ${error.message}`);
  process.exit(1);
});
