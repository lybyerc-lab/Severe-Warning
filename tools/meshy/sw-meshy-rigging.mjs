#!/usr/bin/env node
// [SW:ART:008:MESHY_RIGGING_CLI]
// Candidate asset tooling only. Never import from shipped runtime code.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MARKER = 'SW_ART_008_MESHY_RIGGING_CLI_V1';
const API_BASE = 'https://api.meshy.ai/openapi/v1/rigging';
const TERMINAL = new Set(['SUCCEEDED', 'FAILED', 'CANCELED']);

function fail(message) { throw new Error(message); }

function parseArgs(argv) {
  const args = { dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') { args.dryRun = true; continue; }
    if (!token.startsWith('--')) fail(`Unexpected argument: ${token}`);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) fail(`Missing value for ${token}`);
    args[token.slice(2)] = value;
    i += 1;
  }
  for (const required of ['request', 'output-dir']) {
    if (!args[required]) fail(`Missing --${required}`);
  }
  return args;
}

function safeRelative(value, prefix) {
  return typeof value === 'string' && value.startsWith(prefix) && !value.includes('..') && !path.isAbsolute(value);
}

function validateRequest(request) {
  if (request.version !== 'SW_MESHY_RIGGING_LIVE_REQUEST_V1') fail(`Unexpected request version: ${request.version}`);
  if (request.productionAuthority !== 'candidate only') fail('Rig output must remain candidate only.');
  if (!/^[a-z0-9][a-z0-9-]*$/.test(request.id || '')) fail(`Unsafe request id: ${request.id}`);
  if (request.meshy?.endpoint !== 'rigging') fail(`Unsupported endpoint: ${request.meshy?.endpoint}`);
  if (request.meshy?.inputTaskId !== '01a0073a-779e-768e-9f0f-46f4e27347a5') fail('Rigging must use exact recovered SW-ART-007 textured task.');
  if (!safeRelative(request.output?.dir, 'art-source/generated/meshy/')) fail(`Unsafe output dir: ${request.output?.dir}`);
  if (request.costGuard?.authorizedTasks !== 1) fail('Exactly one rigging task is authorized.');
  if (!Number.isInteger(request.costGuard?.maxCredits) || request.costGuard.maxCredits > 5) fail(`Credit guard exceeds 5: ${request.costGuard?.maxCredits}`);
}

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text.slice(0, 1000) }; }
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

function validateGlb(buffer, label) {
  if (buffer.subarray(0, 4).toString('ascii') !== 'glTF') fail(`${label} is not a GLB.`);
  const version = buffer.readUInt32LE(4);
  if (version !== 2) fail(`${label} has unexpected GLB version: ${version}`);
  return version;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const request = JSON.parse(await readFile(args.request, 'utf8'));
  validateRequest(request);

  const payload = { input_task_id: request.meshy.inputTaskId };
  const dryReport = {
    version: 'SW_ART_008_MESHY_RIGGING_DRY_RUN_V1',
    marker: MARKER,
    dryRun: true,
    request: request.id,
    productionAuthority: request.productionAuthority,
    payload,
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
  if (!created.result || typeof created.result !== 'string') fail(`Meshy rigging task id missing: ${JSON.stringify(created)}`);

  const taskId = created.result;
  await writeFile(path.join(outputDir, 'sw-art-008-task-created.json'), `${JSON.stringify({
    version: 'SW_ART_008_TASK_CREATED_V1', request: request.id, taskId,
    sourceSha: process.env.GITHUB_SHA || null, inputTaskId: request.meshy.inputTaskId,
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');
  console.log(`Meshy rigging task created: ${taskId}`);

  const started = Date.now();
  const timeoutMs = 25 * 60 * 1000;
  let task = null;
  while (Date.now() - started < timeoutMs) {
    task = await fetchJson(`${API_BASE}/${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
    console.log(`Meshy rigging task ${taskId}: ${task.status} ${task.progress ?? 0}%`);
    if (TERMINAL.has(task.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  if (!task || !TERMINAL.has(task.status)) fail(`Meshy rigging task timed out: ${taskId}`);

  await writeFile(path.join(outputDir, 'sw-art-008-task-final.json'), `${JSON.stringify({
    version: 'SW_ART_008_TASK_FINAL_V1', request: request.id, taskId,
    status: task.status, progress: task.progress ?? null,
    consumedCredits: task.consumed_credits ?? null,
    taskError: task.task_error?.message || '',
    productionAuthority: request.productionAuthority,
  }, null, 2)}\n`, 'utf8');

  if (task.status !== 'SUCCEEDED') fail(`Meshy rigging task ${task.status}: ${task.task_error?.message || 'unknown error'}`);
  if (!Number.isInteger(task.consumed_credits)) fail('Meshy response did not report consumed_credits.');
  if (task.consumed_credits > request.costGuard.maxCredits) fail(`Meshy consumed ${task.consumed_credits}; guard is ${request.costGuard.maxCredits}.`);

  const riggedUrl = task.result?.rigged_character_glb_url;
  const walkingUrl = task.result?.basic_animations?.walking_glb_url;
  const runningUrl = task.result?.basic_animations?.running_glb_url;
  if (!riggedUrl) fail('Rigging succeeded without rigged_character_glb_url.');
  if (!walkingUrl || !runningUrl) fail('Rigging succeeded without both walking and running GLB outputs.');

  const riggedPath = path.join(outputDir, request.output.riggedGlb);
  const walkingPath = path.join(outputDir, request.output.walkingGlb);
  const runningPath = path.join(outputDir, request.output.runningGlb);
  const rigged = await downloadBinary(riggedUrl, riggedPath);
  const walking = await downloadBinary(walkingUrl, walkingPath);
  const running = await downloadBinary(runningUrl, runningPath);
  const riggedVersion = validateGlb(rigged, 'Rigged Cow 17');
  const walkingVersion = validateGlb(walking, 'Walking Cow 17');
  const runningVersion = validateGlb(running, 'Running Cow 17');

  const receipt = {
    version: 'SW_ART_008_MESHY_RIGGING_RECEIPT_V1', marker: MARKER,
    sourceSha: process.env.GITHUB_SHA || null, request: request.id, taskId,
    inputTaskId: request.meshy.inputTaskId, productionAuthority: request.productionAuthority,
    meshy: { consumedCredits: task.consumed_credits },
    output: {
      rigged: { file: request.output.riggedGlb, bytes: rigged.length, sha256: sha256(rigged), glbVersion: riggedVersion },
      walking: { file: request.output.walkingGlb, bytes: walking.length, sha256: sha256(walking), glbVersion: walkingVersion },
      running: { file: request.output.runningGlb, bytes: running.length, sha256: sha256(running), glbVersion: runningVersion },
    },
  };
  await writeFile(path.join(outputDir, 'sw-art-008-receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(receipt, null, 2));
}

main().catch((error) => {
  console.error(`SW-ART-008 Meshy rigging pipeline failed: ${error.message}`);
  process.exit(1);
});
