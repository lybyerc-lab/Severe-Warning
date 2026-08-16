#!/usr/bin/env node

// [SW:OPS:002:SIMPLE_WORKER_VERIFIER]

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-sandbox-worker.mjs');
const taskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-smoke.json');
const workflowPath = path.join(root, '.github', 'workflows', 'sw-ops-002-antigravity-sandbox-worker.yml');
const expectedBase = '10ccd2723b8fa6b925f47629491a9e51e6388500';
const expectedFixture = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const errors = [];

function requireText(text, needle, label) {
  if (!text.includes(needle)) errors.push(`${label} missing required marker: ${needle}`);
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
const taskText = await readFile(taskPath, 'utf8');
const workflow = await readFile(workflowPath, 'utf8');
const task = JSON.parse(taskText);

if (task.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('task version mismatch');
if (task.taskId !== 'SW-OPS-002-SMOKE') errors.push('task ID mismatch');
if (task.exactBaseSha !== expectedBase) errors.push('frozen patch base changed');
if (JSON.stringify(task.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('allowlist widened');
if (task.tokenBudget > 8000) errors.push('token budget widened above 8000');
if (task.maxPatchBytes > 10000) errors.push('patch size widened above 10000');
if (task.requirePatch !== true) errors.push('smoke must require a patch');
requireText(task.goal, 'Use code_execution immediately.', 'task');
requireText(task.goal, 'Do not change branches or Git history.', 'task');

requireText(worker, 'SW:OPS:ANTIGRAVITY_SIMPLE_WORKER_V1', 'worker');
requireText(worker, 'One task in, one untrusted patch out.', 'worker');
requireText(worker, "sandboxTrust: 'untrusted'", 'worker');
requireText(worker, "returnChannel: 'allowlisted-files-to-host-derived-patch'", 'worker');
requireText(worker, 'const EXTRACT_ALLOWED_SCRIPT', 'worker');
requireText(worker, "marker = 'workspace/repo/'", 'worker');
requireText(worker, 'if rel not in allowed:', 'worker');
requireText(worker, 'allowlisted snapshot path is not a regular file', 'worker');
requireText(worker, "run('git', ['worktree', 'add', '--detach', baseWorktree, task.exactBaseSha])", 'worker');
requireText(worker, "'HEAD', '--', ...task.allowedPaths", 'worker');
requireText(worker, 'Patch path outside allowlist', 'worker');
requireText(worker, "githubWriteAuthority: false", 'worker');
requireText(worker, "tools: [{ type: 'code_execution' }]", 'worker');
requireText(worker, 'GEMINI_API_KEY', 'worker');
rejectText(worker, "command === 'continue'", 'worker');
rejectText(worker, 'continuationBody', 'worker');
rejectText(worker, 'previous_interaction_id', 'worker');
rejectText(worker, 'Sandbox checkout mismatch', 'worker');
rejectText(worker, 'exact-base airlock', 'worker');
rejectText(worker, 'pre_tool_execution', 'worker');
rejectText(worker, 'submit_worker_bundle', 'worker');
rejectText(worker, "run('git', ['checkout'", 'worker');

requireText(workflow, 'SW-OPS-002 Antigravity Simple Worker', 'workflow');
requireText(workflow, 'persist-credentials: false', 'workflow');
requireText(workflow, 'antigravity-sandbox-smoke', 'workflow');
requireText(workflow, 'apply --check', 'workflow');
requireText(workflow, expectedFixture, 'workflow');
rejectText(workflow, 'Send one Director correction', 'workflow');
rejectText(workflow, '--environment', 'workflow');
rejectText(workflow, '--interaction', 'workflow');
rejectText(workflow, 'bootstrap', 'workflow');
rejectText(workflow, 'proof-v2', 'workflow');
rejectText(workflow, 'proof-v3', 'workflow');
rejectText(workflow, 'secrets.GITHUB_TOKEN', 'workflow');

for (const obsolete of [
  '.github/workflows/sw-ops-002-antigravity-proof-v2.yml',
  '.github/workflows/sw-ops-002-antigravity-proof-v3.yml',
  'scripts/verify-sw-ops-002-proof-v2.mjs',
  'scripts/verify-sw-ops-002-proof-v3.mjs',
  'tools/antigravity/sw-antigravity-exact-base-bootstrap.mjs',
  'tools/antigravity/sw-ops-002-proof-v2.mjs',
  'tools/antigravity/sw-ops-002-proof-v3.mjs',
  'tools/antigravity/tasks/sw-ops-002-bootstrap.json',
]) {
  const present = await readFile(path.join(root, obsolete), 'utf8').then(() => true).catch(() => false);
  if (present) errors.push(`obsolete complexity must remain deleted: ${obsolete}`);
}

for (const forbidden of ['ghp_', 'github_pat_', 'x-oauth-basic:', 'Authorization: Bearer', 'Authorization: Basic']) {
  rejectText(worker, forbidden, 'worker');
  rejectText(taskText, forbidden, 'task');
  rejectText(workflow, forbidden, 'workflow');
}

for (const relativeRoot of ['runtime', 'modern', 'MechanicsLab', 'android']) {
  for (const file of await walk(path.join(root, relativeRoot))) {
    if (!/\.(?:js|mjs|cjs|ts|tsx|html|json|java|kt|gradle)$/i.test(file)) continue;
    const text = await readFile(file, 'utf8').catch(() => '');
    if (text.includes('sw-antigravity-sandbox-worker') || text.includes('SW:OPS:ANTIGRAVITY_SIMPLE_WORKER')) {
      errors.push(`runtime references Antigravity tooling: ${path.relative(root, file)}`);
    }
  }
}

if (errors.length) {
  console.error('SW-OPS-002 simple verifier FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SW-OPS-002 simple verifier PASS');
console.log(`- frozen patch base: ${expectedBase}`);
console.log(`- only cross-border file: ${expectedFixture}`);
console.log('- contract: one task in, one untrusted patch out');
console.log('- sandbox Git state is not authoritative');
console.log('- host builds the patch on the frozen base and GitHub credentials stay outside Antigravity');
console.log('- no continuation, bootstrap, hook, V2, or V3 machinery');
