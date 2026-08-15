#!/usr/bin/env node
// [SW:ART:007:MESHY_RETEXTURE_CLI]
// Candidate asset tooling only. Never import from shipped runtime code.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_007_MESHY_RETEXTURE_CLI_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/retexture';
const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'CANCELED']);

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
  for (const required of ['request', 'style-image', 'output-dir']) {
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
  if (request.version !== 'SW_MESHY_RETEXTURE_LIVE_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Retextured output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (!safeRelative(request.styleSource?.path, 'art-source/generated/google-ai/')) fail(`Unsafe style source path: ${request.styleSource?.path}`);
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (!/^[a-f0-9]{64}$/.test(request.styleSource?.expectedSha256 || '')) fail('Missing exact style-image SHA-256.');
  if (!/^[0-9a-f-]{36}$/.test(request.geometrySource?.meshyTaskId || '')) fail('Missing Meshy source task id.');
  if (!Number.isInteger(request.geometrySource?.expectedVertices) || request.geometrySource.expectedVertices <= 0) fail('Missing expected vertex count.');
  if (!Number.isInteger(request.geometrySource?.expectedTriangles) || request.geometrySource.expectedTriangles <= 0) fail('Missing expected triangle count.');
  if (request.meshy?.endpoint !== 'retexture') fail(`Unsupported endpoint: ${request.meshy?.endpoint}`);
  if (request.meshy?.aiModel !== 'meshy-6') fail(`SW-ART-007 requires meshy-6: ${request.meshy?.aiModel}`);
  if (request.meshy?.enableOriginalUv !== true) fail('Accepted Meshy UV layout must be preserved.');
  if (request.meshy?.enablePbr !== true) fail('SW-ART-007 requires PBR maps.');
  if (request.meshy?.textureResolution !== '2k') fail('SW-ART-007 texture resolution must be 2k.');
  if (request.meshy?.removeLighting !== true) fail('SW-ART-007 base color must remove baked lighting.');
  if (JSON.stringify(request.meshy?.targetFormats) !== JSON.stringify(['glb'])) fail('SW-ART-007 must request GLB only.');
  if (request.costGuard?.authorizedTasks !== 1) fail('Exactly one Retexture task is authorized.');
  if (request.costGuard?.maxCredits !== 10) fail(`Credit guard must be exactly 10: ${request.costGuard?.maxCredits}`);
}

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  fail(`Unsupported style image extension: ${ext}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function buildPayload(request, imageDataUri) {
  return {
    input_task_id: request.geometrySource.meshyTaskId,
    image_style_url: imageDataUri,
    ai_model: request.meshy.aiModel,
    enable_original_uv: request.meshy.enableOriginalUv,
    enable_pbr: request.meshy.enablePbr,
    texture_resolution: request.meshy.textureResolution,
    remove_lighting: request.meshy.removeLighting,
    target_formats: request.meshy.targetFormats,
  };
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
      if (Number.isInteger(primitive.indices)) {
        const count = json.accessors?.[primitive.indices]?.count || 0;
        const mode = primitive.mode ?? 4;
        if (mode === 4) triangles += Math.floor(count / 3);
      } else if ((primitive.mode ?? 4) === 4 && Number.isInteger(positionAccessor)) {
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

  const styleImage = await readFile(args['style-image']);
  const styleSha = sha256(styleImage);
  if (styleSha !== request.styleSource.expectedSha256) fail(`Style-image SHA mismatch: ${styleSha}`);
  const imageDataUri = `data:${mimeFor(args['style-image'])};base64,${styleImage.toString('base64')}`;
  const payload = buildPayload(request, imageDataUri);

  const dryReport = {
    version: 'SW_ART_007_MESHY_RETEXTURE_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    request: request.id,
    productionAuthority: request.productionAuthority,
    geometrySource: request.geometrySource,
    styleImage: {
      path: args['style-image'],
      bytes: styleImage.length,
      sha256: styleSha,
      transport: 'base64-data-uri',
    },
    payload: { ...payload, image_style_url: `<data-uri ${styleImage.length} bytes>` },
    costGuard: request.costGuard,
  };
  if (args.dryRun) {
    console.log(JSON.stringify(dryReport, null, 2));
    return;
  }

  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) fail('MESHY_API_KEY is missing or empty.');

  const outputDir = path.resolve(args['output-dir']);
  await mkdir(outputDir, { recursive: true });

  const created = await fetchJson(API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!created.result || typeof created.result !== 'string') fail(`Meshy Retexture task id missing: ${JSON.stringify(created)}`);

  const taskId = created.result;
  await writeFile(path.join(outputDir, 'sw-art-007-task-created.json'), `${JSON.stringify({
    version: 'SW_ART_007_TASK_CREATED_V1',
    request: request.id,
    taskId,
    sourceSha: process.env.GITHUB_SHA || null,
    inputTaskId: request.geometrySource.meshyTaskId,
    styleSha256: styleSha,
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');
  console.log(`Meshy Retexture task created: ${taskId}`);

  const started = Date.now();
  const timeoutMs = 25 * 60 * 1000;
  let task = null;
  while (Date.now() - started < timeoutMs) {
    task = await fetchJson(`${API_BASE}/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    console.log(`Meshy Retexture task ${taskId}: ${task.status} ${task.progress ?? 0}%`);
    if (TERMINAL.has(task.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  if (!task || !TERMINAL.has(task.status)) fail(`Meshy Retexture task timed out after ${timeoutMs} ms: ${taskId}`);

  const selectedTask = {
    version: 'SW_ART_007_TASK_FINAL_V1',
    request: request.id,
    taskId,
    status: task.status,
    progress: task.progress ?? null,
    consumedCredits: task.consumed_credits ?? null,
    createdAt: task.created_at ?? null,
    startedAt: task.started_at ?? null,
    finishedAt: task.finished_at ?? null,
    taskError: task.task_error?.message || '',
    productionAuthority: request.productionAuthority,
  };
  await writeFile(path.join(outputDir, 'sw-art-007-task-final.json'), `${JSON.stringify(selectedTask, null, 2)}\n`, 'utf8');

  if (task.status !== 'SUCCEEDED') fail(`Meshy Retexture task ${task.status}: ${selectedTask.taskError || 'unknown error'}`);
  if (!Number.isInteger(task.consumed_credits)) fail('Meshy Retexture response did not report consumed_credits.');
  if (task.consumed_credits > request.costGuard.maxCredits) fail(`Meshy consumed ${task.consumed_credits} credits; guard is ${request.costGuard.maxCredits}.`);
  if (!task.model_urls?.glb) fail('Meshy Retexture succeeded without a GLB URL.');
  if (!task.thumbnail_url) fail('Meshy Retexture succeeded without a preview thumbnail URL.');
  const textureSet = Array.isArray(task.texture_urls) ? task.texture_urls[0] : null;
  if (!textureSet?.base_color) fail('Meshy Retexture succeeded without a base-color texture URL.');
  if (request.meshy.enablePbr && (!textureSet.metallic || !textureSet.roughness || !textureSet.normal)) {
    fail('Meshy Retexture PBR task did not return metallic, roughness, and normal maps.');
  }

  const glbPath = path.join(outputDir, request.output.glb);
  const previewPath = path.join(outputDir, request.output.preview);
  const glb = await downloadBinary(task.model_urls.glb, glbPath);
  const preview = await downloadBinary(task.thumbnail_url, previewPath);
  const inspection = inspectGlb(glb);

  if (inspection.vertices !== request.geometrySource.expectedVertices) {
    fail(`Retexture changed vertex count: expected ${request.geometrySource.expectedVertices}, got ${inspection.vertices}`);
  }
  if (inspection.triangles !== request.geometrySource.expectedTriangles) {
    fail(`Retexture changed triangle count: expected ${request.geometrySource.expectedTriangles}, got ${inspection.triangles}`);
  }
  if (inspection.materials < 1 || inspection.textures < 1 || inspection.images < 1) fail('Textured GLB is missing material/texture/image data.');
  if (inspection.skins !== 0 || inspection.animations !== 0) fail('SW-ART-007 must not add rig or animation data.');

  const textureFiles = {};
  for (const [key, suffix] of [['base_color', 'base-color'], ['metallic', 'metallic'], ['roughness', 'roughness'], ['normal', 'normal'], ['emission', 'emission']]) {
    if (!textureSet?.[key]) continue;
    const filename = `${request.output.texturePrefix}-${suffix}.png`;
    const bytes = await downloadBinary(textureSet[key], path.join(outputDir, filename));
    textureFiles[key] = { filename, bytes: bytes.length, sha256: sha256(bytes) };
  }

  await writeFile(path.join(outputDir, 'sw-art-007-glb-inspection.json'), `${JSON.stringify(inspection, null, 2)}\n`, 'utf8');

  const receipt = {
    version: 'SW_ART_007_MESHY_RETEXTURE_RECEIPT_V1',
    marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null,
    request: request.id,
    taskId,
    productionAuthority: request.productionAuthority,
    geometrySource: request.geometrySource,
    styleSource: {
      runId: request.styleSource.runId,
      artifactId: request.styleSource.artifactId,
      artifactName: request.styleSource.artifactName,
      path: request.styleSource.path,
      sha256: styleSha,
    },
    meshy: {
      aiModel: request.meshy.aiModel,
      enableOriginalUv: request.meshy.enableOriginalUv,
      enablePbr: request.meshy.enablePbr,
      textureResolution: request.meshy.textureResolution,
      removeLighting: request.meshy.removeLighting,
      targetFormats: request.meshy.targetFormats,
      consumedCredits: task.consumed_credits,
    },
    output: {
      glb: request.output.glb,
      glbBytes: glb.length,
      glbSha256: sha256(glb),
      preview: request.output.preview,
      previewBytes: preview.length,
      previewSha256: sha256(preview),
      inspection,
      textures: textureFiles,
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-007-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-007 Meshy Retexture pipeline failed: ${error.message}`);
  process.exit(1);
});
