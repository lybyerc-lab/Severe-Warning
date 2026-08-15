#!/usr/bin/env node
// [SW:ART:004:MESHY_MULTI_IMAGE_CLI]
// Candidate asset tooling only. Never import from shipped runtime code.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_004_MESHY_MULTI_IMAGE_CLI_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/multi-image-to-3d';
const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'CANCELED']);

function fail(message) { throw new Error(message); }

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--dry-run') { args.dryRun = true; continue; }
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`);
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${token}`);
    args[token.slice(2)] = value;
    index += 1;
  }
  for (const required of ['request', 'input-dir', 'output-dir']) {
    if (!args[required]) fail(`Missing --${required}`);
  }
  return args;
}

function safeRelative(value, prefix) {
  return typeof value === 'string' && value.startsWith(prefix) && !value.includes('..') && !path.isAbsolute(value);
}

function validateRequest(request) {
  if (request.version !== 'SW_MESHY_MULTI_LIVE_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Meshy output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (!safeRelative(request.source?.path, 'art-source/generated/google-ai/')) fail(`Unsafe source path: ${request.source?.path}`);
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (request.meshy?.endpoint !== 'multi-image-to-3d') fail(`Unsupported endpoint: ${request.meshy?.endpoint}`);
  if (request.meshy?.aiModel !== 'meshy-6') fail(`SW-ART-004 requires meshy-6: ${request.meshy?.aiModel}`);
  if (request.meshy?.shouldTexture !== false) fail('SW-ART-004 is geometry-only; shouldTexture must be false.');
  if (request.meshy?.imageEnhancement !== false) fail('SW-ART-004 preserves exact reference appearance; imageEnhancement must be false.');
  if (request.meshy?.poseMode !== '') fail('SW-ART-004 preserves source pose; poseMode must be empty.');
  if (request.meshy?.symmetryMode !== 'auto') fail('SW-ART-004 requires symmetryMode auto.');
  if (JSON.stringify(request.meshy?.targetFormats) !== JSON.stringify(['glb'])) fail('SW-ART-004 must request GLB only.');
  if (JSON.stringify(request.source?.viewOrder) !== JSON.stringify(['three-quarter', 'front', 'side', 'back'])) fail('SW-ART-004 requires exact four-view order.');
  if (request.costGuard?.authorizedTasks !== 1) fail('Exactly one Meshy task is authorized.');
  if (!Number.isInteger(request.costGuard?.maxCredits) || request.costGuard.maxCredits > 20) fail(`Credit guard exceeds 20: ${request.costGuard?.maxCredits}`);
}

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  fail(`Unsupported source image extension: ${ext}`);
}

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; }
  catch { data = { raw: text.slice(0, 1000) }; }
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = JSON.parse(await readFile(args.request, 'utf8'));
  validateRequest(request);

  const inputDir = path.resolve(args['input-dir']);
  const imageRecords = [];
  const dataUris = [];
  for (const view of request.source.viewOrder) {
    const spec = request.source.views?.[view];
    if (!spec?.filename) fail(`Missing filename for view: ${view}`);
    const imagePath = path.join(inputDir, spec.filename);
    const image = await readFile(imagePath);
    imageRecords.push({ view, filename: spec.filename, bytes: image.length, sha256: sha256(image) });
    dataUris.push(`data:${mimeFor(imagePath)};base64,${image.toString('base64')}`);
  }
  if (dataUris.length !== 4) fail(`Expected 4 input images, got ${dataUris.length}`);

  const payload = {
    image_urls: dataUris,
    ai_model: request.meshy.aiModel,
    should_texture: request.meshy.shouldTexture,
    image_enhancement: request.meshy.imageEnhancement,
    pose_mode: request.meshy.poseMode,
    symmetry_mode: request.meshy.symmetryMode,
    target_formats: request.meshy.targetFormats,
  };

  const dryReport = {
    version: 'SW_ART_004_MESHY_MULTI_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    request: request.id,
    productionAuthority: request.productionAuthority,
    images: imageRecords,
    payload: { ...payload, image_urls: imageRecords.map((entry) => `<data-uri ${entry.view} ${entry.bytes} bytes>`) },
    costGuard: request.costGuard,
  };
  if (args.dryRun) { console.log(JSON.stringify(dryReport, null, 2)); return; }

  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) fail('MESHY_API_KEY is missing or empty.');
  const outputDir = path.resolve(args['output-dir']);
  await mkdir(outputDir, { recursive: true });

  const created = await fetchJson(API_BASE, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!created.result || typeof created.result !== 'string') fail(`Meshy task id missing: ${JSON.stringify(created)}`);
  const taskId = created.result;
  await writeFile(path.join(outputDir, 'sw-art-004-task-created.json'), `${JSON.stringify({
    version: 'SW_ART_004_TASK_CREATED_V1', request: request.id, taskId,
    sourceSha: process.env.GITHUB_SHA || null, images: imageRecords,
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');
  console.log(`Meshy multi-image task created: ${taskId}`);

  const started = Date.now();
  const timeoutMs = 25 * 60 * 1000;
  let task = null;
  while (Date.now() - started < timeoutMs) {
    task = await fetchJson(`${API_BASE}/${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    console.log(`Meshy task ${taskId}: ${task.status} ${task.progress ?? 0}%`);
    if (TERMINAL.has(task.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  if (!task || !TERMINAL.has(task.status)) fail(`Meshy task timed out after ${timeoutMs} ms: ${taskId}`);

  const selectedTask = {
    version: 'SW_ART_004_TASK_FINAL_V1', request: request.id, taskId,
    status: task.status, progress: task.progress ?? null,
    consumedCredits: task.consumed_credits ?? null,
    createdAt: task.created_at ?? null, startedAt: task.started_at ?? null, finishedAt: task.finished_at ?? null,
    taskError: task.task_error?.message || '', productionAuthority: request.productionAuthority,
  };
  await writeFile(path.join(outputDir, 'sw-art-004-task-final.json'), `${JSON.stringify(selectedTask, null, 2)}\n`, 'utf8');
  if (task.status !== 'SUCCEEDED') fail(`Meshy task ${task.status}: ${selectedTask.taskError || 'unknown error'}`);
  if (!Number.isInteger(task.consumed_credits)) fail('Meshy response did not report consumed_credits.');
  if (task.consumed_credits > request.costGuard.maxCredits) fail(`Meshy consumed ${task.consumed_credits} credits; guard is ${request.costGuard.maxCredits}.`);
  if (!task.model_urls?.glb) fail('Meshy succeeded without a GLB URL.');
  if (!task.thumbnail_url) fail('Meshy succeeded without a preview thumbnail URL.');

  const glbPath = path.join(outputDir, request.output.glb);
  const previewPath = path.join(outputDir, request.output.preview);
  const glb = await downloadBinary(task.model_urls.glb, glbPath);
  const preview = await downloadBinary(task.thumbnail_url, previewPath);
  if (glb.subarray(0, 4).toString('ascii') !== 'glTF') fail('Downloaded GLB does not have a glTF magic header.');
  const glbVersion = glb.readUInt32LE(4);
  if (glbVersion !== 2) fail(`Unexpected GLB version: ${glbVersion}`);

  const receipt = {
    version: 'SW_ART_004_MESHY_MULTI_RECEIPT_V1', marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null, request: request.id, taskId,
    productionAuthority: request.productionAuthority,
    source: {
      runId: request.source.runId, artifactId: request.source.artifactId,
      artifactName: request.source.artifactName, path: request.source.path,
      images: imageRecords,
    },
    meshy: {
      endpoint: request.meshy.endpoint, aiModel: request.meshy.aiModel,
      shouldTexture: request.meshy.shouldTexture, imageEnhancement: request.meshy.imageEnhancement,
      poseMode: request.meshy.poseMode, symmetryMode: request.meshy.symmetryMode,
      targetFormats: request.meshy.targetFormats, consumedCredits: task.consumed_credits,
    },
    output: {
      glb: request.output.glb, glbBytes: glb.length, glbSha256: sha256(glb), glbVersion,
      preview: request.output.preview, previewBytes: preview.length, previewSha256: sha256(preview),
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-004-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-004 Meshy multi-image pipeline failed: ${error.message}`);
  process.exit(1);
});
