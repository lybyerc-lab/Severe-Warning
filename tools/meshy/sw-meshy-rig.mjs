#!/usr/bin/env node
// [SW:ART:008:MESHY_RIG_CLI]
// Candidate asset tooling only. Never import from shipped runtime code.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_008_MESHY_RIG_CLI_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/rigging';
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
  if (request.version !== 'SW_MESHY_RIG_LIVE_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Rig output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (request.source?.retextureTaskId !== '01a0073a-779e-768e-9f0f-46f4e27347a5') fail(`Unexpected textured input task: ${request.source?.retextureTaskId}`);
  if (request.source?.triangles !== 199162 || request.source.triangles >= 300000) fail(`Source triangle evidence is not riggable: ${request.source?.triangles}`);
  if (request.meshy?.endpoint !== 'rigging') fail(`Unsupported endpoint: ${request.meshy?.endpoint}`);
  if (request.meshy?.heightMeters !== 1.7) fail(`SW-ART-008 height must be 1.7m: ${request.meshy?.heightMeters}`);
  if (request.meshy?.requireBasicAnimations !== true) fail('SW-ART-008 must require built-in walk/run outputs.');
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (request.costGuard?.authorizedTasks !== 1) fail('Exactly one rigging task is authorized.');
  if (request.costGuard?.maxCredits !== 5) fail(`Rigging credit guard must be exactly 5: ${request.costGuard?.maxCredits}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function buildPayload(request) {
  return {
    input_task_id: request.source.retextureTaskId,
    height_meters: request.meshy.heightMeters,
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
  const payload = buildPayload(request);

  const dryReport = {
    version: 'SW_ART_008_MESHY_RIG_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    request: request.id,
    productionAuthority: request.productionAuthority,
    payload,
    source: request.source,
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
  if (!created.result || typeof created.result !== 'string') fail(`Meshy rigging task id missing: ${JSON.stringify(created)}`);

  const taskId = created.result;
  await writeFile(path.join(outputDir, 'sw-art-008-task-created.json'), `${JSON.stringify({
    version: 'SW_ART_008_TASK_CREATED_V1',
    request: request.id,
    taskId,
    inputTaskId: request.source.retextureTaskId,
    sourceSha: process.env.GITHUB_SHA || null,
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');
  console.log(`Meshy rigging task created: ${taskId}`);

  const started = Date.now();
  const timeoutMs = 25 * 60 * 1000;
  let task = null;
  while (Date.now() - started < timeoutMs) {
    task = await fetchJson(`${API_BASE}/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    console.log(`Meshy rigging task ${taskId}: ${task.status} ${task.progress ?? 0}%`);
    if (TERMINAL.has(task.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  if (!task || !TERMINAL.has(task.status)) fail(`Meshy rigging task timed out after ${timeoutMs} ms: ${taskId}`);

  const selectedTask = {
    version: 'SW_ART_008_TASK_FINAL_V1',
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
  await writeFile(path.join(outputDir, 'sw-art-008-task-final.json'), `${JSON.stringify(selectedTask, null, 2)}\n`, 'utf8');

  if (task.status !== 'SUCCEEDED') fail(`Meshy rigging task ${task.status}: ${selectedTask.taskError || 'unknown error'}`);
  if (!Number.isInteger(task.consumed_credits)) fail('Meshy rigging response did not report consumed_credits.');
  if (task.consumed_credits > request.costGuard.maxCredits) fail(`Meshy consumed ${task.consumed_credits} credits; guard is ${request.costGuard.maxCredits}.`);

  const result = task.result || {};
  const basic = result.basic_animations || {};
  if (!result.rigged_character_glb_url) fail('Rigging succeeded without rigged_character_glb_url.');
  if (request.meshy.requireBasicAnimations && !basic.walking_glb_url) fail('Rigging succeeded without walking_glb_url.');
  if (request.meshy.requireBasicAnimations && !basic.running_glb_url) fail('Rigging succeeded without running_glb_url.');

  const rigged = await downloadBinary(result.rigged_character_glb_url, path.join(outputDir, request.output.riggedGlb));
  const walking = await downloadBinary(basic.walking_glb_url, path.join(outputDir, request.output.walkingGlb));
  const running = await downloadBinary(basic.running_glb_url, path.join(outputDir, request.output.runningGlb));

  const riggedInspection = inspectGlb(rigged);
  const walkingInspection = inspectGlb(walking);
  const runningInspection = inspectGlb(running);

  if (riggedInspection.skins < 1) fail('Rigged character GLB contains no skin.');
  if (riggedInspection.materials < 1 || riggedInspection.textures < 1 || riggedInspection.images < 1) fail('Rigged Cow 17 lost textured material data.');
  if (walkingInspection.skins < 1 || walkingInspection.animations < 1) fail('Walking GLB must contain skin and animation data.');
  if (runningInspection.skins < 1 || runningInspection.animations < 1) fail('Running GLB must contain skin and animation data.');

  const inspection = {
    rigged: riggedInspection,
    walking: walkingInspection,
    running: runningInspection,
  };
  await writeFile(path.join(outputDir, 'sw-art-008-glb-inspection.json'), `${JSON.stringify(inspection, null, 2)}\n`, 'utf8');

  const receipt = {
    version: 'SW_ART_008_MESHY_RIG_RECEIPT_V1',
    marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null,
    request: request.id,
    taskId,
    productionAuthority: request.productionAuthority,
    source: request.source,
    meshy: {
      inputTaskId: request.source.retextureTaskId,
      heightMeters: request.meshy.heightMeters,
      consumedCredits: task.consumed_credits,
    },
    output: {
      riggedGlb: request.output.riggedGlb,
      riggedBytes: rigged.length,
      riggedSha256: sha256(rigged),
      walkingGlb: request.output.walkingGlb,
      walkingBytes: walking.length,
      walkingSha256: sha256(walking),
      runningGlb: request.output.runningGlb,
      runningBytes: running.length,
      runningSha256: sha256(running),
      inspection,
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-008-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-008 Meshy rigging pipeline failed: ${error.message}`);
  process.exit(1);
});
