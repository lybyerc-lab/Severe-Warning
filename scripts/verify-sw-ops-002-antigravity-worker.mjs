#!/usr/bin/env node

// SW_OPS_002_ANTIGRAVITY_WORKER_VERIFIER_V2

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-sandbox-worker.mjs');
const taskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-smoke.json');
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
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const worker = await readFile(workerPath, 'utf8');
const taskText = await readFile(taskPath, 'utf8');
const task = JSON.parse(taskText);

if (task.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('smoke task version mismatch');
if (task.taskId !== 'SW-OPS-002-SMOKE') errors.push('smoke task ID mismatch');
if (task.exactBaseSha !== expectedBase) errors.push('smoke exact base SHA mismatch');
if (task.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') errors.push('smoke repository URL mismatch');
if (JSON.stringify(task.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('smoke allowed path is not exactly the disposable fixture');
if (task.tokenBudget > 8000) errors.push('smoke token budget widened above 8000');
if (task.maxPatchBytes > 10000) errors.push('smoke patch limit widened above 10000 bytes');
if (task.requirePatch !== true) errors.push('smoke must require a patch');

requireText(worker, 'SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V2', 'worker');
requireText(worker, "target: REPO_TARGET", 'worker');
requireText(worker, "target: '.agents/AGENTS.md'", 'worker');
requireText(worker, "target: '/workspace/sw-antigravity-task.json'", 'worker');
requireText(worker, "{ domain: 'github.com' }", 'worker');
requireText(worker, "tools: [{ type: 'code_execution' }]", 'worker');
requireText(worker, "executionMode: 'custom-environment-unary-with-adaptive-poll'", 'worker');
requireText(worker, "while (interaction.status === 'in_progress')", 'worker');
requireText(worker, "worker.patch", 'worker');
requireText(worker, "result.json", 'worker');
requireText(worker, "Patch path outside allowed territory", 'worker');
requireText(worker, "worker did not prove the exact base SHA", 'worker');
requireText(worker, "Renames are not accepted", 'worker');
requireText(worker, 'GEMINI_API_KEY', 'worker');
rejectText(worker, 'background: true', 'worker');
rejectText(worker, 'environment-snapshot', 'worker');

for (const forbidden of ['ghp_', 'github_pat_', 'x-oauth-basic:', 'Authorization: Bearer', 'Authorization: Basic']) {
  rejectText(worker, forbidden, 'worker');
  rejectText(taskText, forbidden, 'smoke task');
}

const runtimeRoots = ['runtime', 'modern', 'MechanicsLab', 'android'];
for (const relativeRoot of runtimeRoots) {
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
console.log('- execution: custom environment, unary create, adaptive poll only if in_progress');
console.log('- network: github.com only, no injected GitHub credentials');
console.log('- runtime imports: none detected');
