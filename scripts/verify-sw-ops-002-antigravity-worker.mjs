#!/usr/bin/env node

// SW_OPS_002_ANTIGRAVITY_WORKER_VERIFIER_V5

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-sandbox-worker.mjs');
const legacyWorkerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-worker.mjs');
const taskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-smoke.json');
const bootstrapPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-bootstrap.json');
const expectedBase = '10ccd2723b8fa6b925f47629491a9e51e6388500';
const expectedFixture = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const errors = [];

function requireText(text, needle, label) {
  if (!text.includes(needle)) errors.push(`${label} is missing required marker: ${needle}`);
}
function rejectText(text, needle, label) {
  if (text.includes(needle)) errors.push(`${label} contains forbidden marker: ${needle}`);
}
async function walk(dir) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const worker = await readFile(workerPath, 'utf8');
const legacyWorker = await readFile(legacyWorkerPath, 'utf8').catch(() => null);
const taskText = await readFile(taskPath, 'utf8');
const bootstrapText = await readFile(bootstrapPath, 'utf8');
const task = JSON.parse(taskText);
const bootstrap = JSON.parse(bootstrapText);

if (legacyWorker !== null) errors.push('superseded tools/antigravity/sw-antigravity-worker.mjs must remain absent');
if (task.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('smoke task version mismatch');
if (task.taskId !== 'SW-OPS-002-SMOKE') errors.push('smoke task ID mismatch');
if (task.exactBaseSha !== expectedBase) errors.push('smoke exact base SHA mismatch');
if (task.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') errors.push('smoke repository URL mismatch');
if (JSON.stringify(task.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('smoke allowed path is not exactly the disposable fixture');
if (task.tokenBudget > 16000) errors.push('smoke token budget widened above 16000');
if (task.maxPatchBytes > 10000) errors.push('smoke patch limit widened above 10000 bytes');
if (task.requirePatch !== true) errors.push('smoke must require a patch');
requireText(task.goal, 'the host derives all evidence from the sandbox filesystem', 'smoke goal');
rejectText(taskText, 'Then produce the required patch and structured result files', 'smoke task');
rejectText(taskText, 'Create worker.patch', 'smoke task');
rejectText(taskText, 'Create result.json', 'smoke task');

if (bootstrap.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('bootstrap task version mismatch');
if (bootstrap.taskId !== 'SW-OPS-002-SMOKE') errors.push('bootstrap task ID mismatch');
if (bootstrap.exactBaseSha !== expectedBase) errors.push('bootstrap exact base SHA mismatch');
if (bootstrap.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') errors.push('bootstrap repository URL mismatch');
if (JSON.stringify(bootstrap.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('bootstrap allowed path widened');
if (bootstrap.tokenBudget > 4000) errors.push('bootstrap token budget widened above 4000');
if (bootstrap.maxPatchBytes > 10000) errors.push('bootstrap patch limit widened above 10000 bytes');
if (bootstrap.requirePatch !== false) errors.push('bootstrap must not require a patch');
requireText(bootstrap.goal, 'Bootstrap only. Do not edit any repository file.', 'bootstrap goal');
requireText(bootstrap.goal, expectedBase, 'bootstrap goal');
requireText(bootstrap.goal, 'git status --short is empty', 'bootstrap goal');

requireText(worker, 'SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V5', 'worker');
requireText(worker, "target: REPO_TARGET", 'worker');
requireText(worker, "target: '.agents/AGENTS.md'", 'worker');
requireText(worker, "target: '/workspace/sw-antigravity-task.json'", 'worker');
requireText(worker, "{ domain: 'github.com' }", 'worker');
requireText(worker, "tools: [{ type: 'code_execution' }]", 'worker');
requireText(worker, "executionMode: 'custom-environment-host-derived-snapshot-diff'", 'worker');
requireText(worker, "returnChannel: 'host-derived-snapshot-diff'", 'worker');
requireText(worker, 'workerHandoffFilesRequired: false', 'worker');
requireText(worker, "const SNAPSHOT_RETRIES = 6", 'worker');
requireText(worker, "const ENVIRONMENTS_URL = `${API_ROOT}/environments`", 'worker');
requireText(worker, "const FILES_URL = `${API_ROOT}/files`", 'worker');
requireText(worker, "environment-${encodeURIComponent(environmentId)}:download?alt=media", 'worker');
requireText(worker, "run('rsync', ['-a', '--delete'", 'worker');
requireText(worker, "ls-files', '--others', '--exclude-standard', '-z'", 'worker');
requireText(worker, "'diff', '--check'", 'worker');
requireText(worker, "'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD'", 'worker');
requireText(worker, 'Patch path outside allowed territory', 'worker');
requireText(worker, 'Sandbox checkout mismatch', 'worker');
requireText(worker, 'Renames are not accepted', 'worker');
requireText(worker, 'GEMINI_API_KEY', 'worker');
requireText(worker, 'MissingWorkerPatchError', 'worker');
rejectText(worker, 'submit_worker_bundle', 'worker');
rejectText(worker, 'background: true', 'worker');
rejectText(worker, 'response_format', 'worker');
rejectText(worker, 'worker.patch and result.json', 'worker');

for (const forbidden of ['ghp_', 'github_pat_', 'x-oauth-basic:', 'Authorization: Bearer', 'Authorization: Basic']) {
  rejectText(worker, forbidden, 'worker');
  rejectText(taskText, forbidden, 'smoke task');
  rejectText(bootstrapText, forbidden, 'bootstrap task');
}

for (const relativeRoot of ['runtime', 'modern', 'MechanicsLab', 'android']) {
  for (const file of await walk(path.join(root, relativeRoot))) {
    if (!/\.(?:js|mjs|cjs|ts|tsx|html|json|java|kt|gradle)$/i.test(file)) continue;
    const text = await readFile(file, 'utf8').catch(() => '');
    if (text.includes('sw-antigravity-sandbox-worker') || text.includes('SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER')) {
      errors.push(`runtime imports/references Antigravity worker: ${path.relative(root, file)}`);
    }
  }
}

if (errors.length) {
  console.error('SW-OPS-002 verifier FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SW-OPS-002 verifier PASS');
console.log(`- exact base: ${expectedBase}`);
console.log(`- allowed smoke path: ${expectedFixture}`);
console.log('- bootstrap: checkout-only, 4000 tokens max, clean-tree proof required before edit turn');
console.log('- return: host derives patch from complete sandbox filesystem snapshot');
console.log('- snapshot repo HEAD must equal exact task base');
console.log('- untracked files are included by host intent-to-add before diff');
console.log('- patch paths are allowlisted before independent apply proof');
console.log('- network: github.com only, no injected GitHub credentials');
console.log('- runtime imports: none detected');
