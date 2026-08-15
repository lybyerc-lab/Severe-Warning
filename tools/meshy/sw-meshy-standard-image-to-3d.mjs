#!/usr/bin/env node
// [SW:ART:006:MESHY_STANDARD_IMAGE_CLI]
// Candidate asset tooling only. Never import from shipped runtime code.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_006_MESHY_STANDARD_IMAGE_CLI_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/image-to-3d';
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
  for (const required of ['request', 'image', 'output-dir']) {
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
  if (request.version !== 'SW_MESHY_REFINED_LIVE_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Meshy output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (!safeRelative(request.source?.path, 'art-source/generated/google-ai/')) fail(`Unsafe source path: ${request.source?.path}`);
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (!/^[a-f0-9]{64}$/.test(request.source?.expectedSourceSha256 || '')) fail('Missing exact refined-source SHA-256.');
  if (request.meshy?.endpoint !== 'image-to-3d') fail(`Unsupported endpoint: ${request.meshy?.endpoint}`);
  if (request.meshy?.modelType !== 'standard') fail(`Refined-face proof requires standard model type: ${request.meshy?.modelType}`);
  if (request.meshy?.aiModel !== 'meshy-6') fail(`Refined-face proof requires meshy-6: ${request.meshy?.aiModel}`);
  if (request.meshy?.shouldTexture !== false) fail('Refined-face proof must be geometry only.');
  if (request.meshy?.shouldRemesh !== false) fail('Refined-face proof keeps highest-precision raw geometry.');
  if (request.meshy?.imageEnhancement !== false) fail('Image enhancement must remain off so Gemini facial forms are not reinterpreted.');
  if (request.meshy?.poseMode !== '') fail('Refined-face proof preserves source pose; poseMode must be empty.');
  if (JSON.stringify(request.meshy?.targetFormats) !== JSON.stringify(['glb'])) fail('Refined-face proof must request GLB only.');
  if (request.costGuard?.authorizedTasks !== 1) fail('Exactly one Meshy task is authorized.');
  if (!Number.isInteger(request.costGuard?.maxCredits) || request.costGuard.maxCredits > 20) {
    fail(`Credit guard exceeds 20: ${request.costGuard?.maxCredits}`);
  }
}

function mimeFor(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  fail(`Unsupported source image extension: ${ext}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function buildPayload(request, dataUri) {
  return {
    image_url: dataUri,
    model_type: request.meshy.modelType,
    ai_model: request.meshy.aiModel,
    should_texture: request.meshy.shouldTexture,
    should_remesh: request.meshy.shouldRemesh,
    image_enhancement: request.meshy.imageEnhancement,
    pose_mode: request.meshy.poseMode,
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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = JSON.parse(await readFile(args.request, 'utf8'));
  validateRequest(request);

  const image = await readFile(args.image);
  const imageHash = sha256(image);
  if (imageHash !== request.source.expectedSourceSha256) {
    fail(`Refined source SHA mismatch: ${imageHash}`);
  }
  const dataUri = `data:${mimeFor(args.image)};base64,${image.toString('base64')}`;
  const payload = buildPayload(request, dataUri);

  const dryReport = {
    version: 'SW_ART_006_MESHY_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    request: request.id,
    productionAuthority: request.productionAuthority,
    image: {
      path: args.image,
      bytes: image.length,
      sha256: imageHash,
      transport: 'base64-data-uri',
    },
    payload: { ...payload, image_url: `<data-uri ${image.length} bytes>` },
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
  if (!created.result || typeof created.result !== 'string') fail(`Meshy task id missing: ${JSON.stringify(created)}`);

  const taskId = created.result;
  await writeFile(path.join(outputDir, 'sw-art-006-task-created.json'), `${JSON.stringify({
    version: 'SW_ART_006_TASK_CREATED_V1',
    request: request.id,
    taskId,
    sourceSha: process.env.GITHUB_SHA || null,
    imageSha256: imageHash,
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');
  console.log(`Meshy task created: ${taskId}`);

  const started = Date.now();
  const timeoutMs = 25 * 60 * 1000;
  let task = null;
  while (Date.now() - started < timeoutMs) {
    task = await fetchJson(`${API_BASE}/${encodeURIComponent(taskId)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    console.log(`Meshy task ${taskId}: ${task.status} ${task.progress ?? 0}%`);
    if (TERMINAL.has(task.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  if (!task || !TERMINAL.has(task.status)) fail(`Meshy task timed out after ${timeoutMs} ms: ${taskId}`);

  const selectedTask = {
    version: 'SW_ART_006_TASK_FINAL_V1',
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
  await writeFile(path.join(outputDir, 'sw-art-006-task-final.json'), `${JSON.stringify(selectedTask, null, 2)}\n`, 'utf8');

  if (task.status !== 'SUCCEEDED') fail(`Meshy task ${task.status}: ${selectedTask.taskError || 'unknown error'}`);
  if (!Number.isInteger(task.consumed_credits)) fail('Meshy response did not report consumed_credits.');
  if (task.consumed_credits > request.costGuard.maxCredits) {
    fail(`Meshy consumed ${task.consumed_credits} credits; guard is ${request.costGuard.maxCredits}.`);
  }
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
    version: 'SW_ART_006_MESHY_RECEIPT_V1',
    marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null,
    request: request.id,
    taskId,
    productionAuthority: request.productionAuthority,
    source: {
      runId: request.source.runId,
      artifactId: request.source.artifactId,
      artifactName: request.source.artifactName,
      path: request.source.path,
      imageSha256: imageHash,
    },
    meshy: {
      modelType: request.meshy.modelType,
      aiModel: request.meshy.aiModel,
      shouldTexture: request.meshy.shouldTexture,
      shouldRemesh: request.meshy.shouldRemesh,
      imageEnhancement: request.meshy.imageEnhancement,
      targetFormats: request.meshy.targetFormats,
      consumedCredits: task.consumed_credits,
    },
    output: {
      glb: request.output.glb,
      glbBytes: glb.length,
      glbSha256: sha256(glb),
      glbVersion,
      preview: request.output.preview,
      previewBytes: preview.length,
      previewSha256: sha256(preview),
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-006-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-006 Meshy pipeline failed: ${error.message}`);
  process.exit(1);
});
