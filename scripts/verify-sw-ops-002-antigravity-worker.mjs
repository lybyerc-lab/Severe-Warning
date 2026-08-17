#!/usr/bin/env node

// [SW:OPS:002:SIMPLE_WORKER_VERIFIER]

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-sandbox-worker.mjs');
const smokeTaskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-smoke.json');
const slotTaskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'task-slot.json');
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
function safeRepoPath(value) {
  return typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('../') && !value.startsWith('.git/') && !value.endsWith('/');
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
const smokeText = await readFile(smokeTaskPath, 'utf8');
const slotText = await readFile(slotTaskPath, 'utf8');
const workflow = await readFile(workflowPath, 'utf8');
const smoke = JSON.parse(smokeText);
const slot = JSON.parse(slotText);

if (smoke.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('smoke task version mismatch');
if (smoke.taskId !== 'SW-OPS-002-SMOKE') errors.push('smoke task ID mismatch');
if (smoke.exactBaseSha !== expectedBase) errors.push('smoke frozen patch base changed');
if (JSON.stringify(smoke.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('smoke allowlist widened');
if (smoke.tokenBudget > 8000) errors.push('smoke token budget widened above 8000');
if (smoke.maxPatchBytes > 10000) errors.push('smoke patch size widened above 10000');
if (smoke.requirePatch !== true) errors.push('smoke must require a patch');
requireText(smoke.goal, 'Use code_execution immediately.', 'smoke task');
requireText(smoke.goal, 'Do not change branches or Git history.', 'smoke task');

if (slot.version !== 'SW_ANTIGRAVITY_WORKER_TASK_V1') errors.push('task slot version mismatch');
if (slot.repository !== 'lybyerc-lab/Severe-Warning') errors.push('task slot repository changed');
if (slot.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') errors.push('task slot repository URL changed');
if (!/^[0-9a-f]{40}$/i.test(slot.exactBaseSha || '')) errors.push('task slot exactBaseSha must be a full Git SHA');
if (!Array.isArray(slot.allowedPaths) || !slot.allowedPaths.length || slot.allowedPaths.some((item) => !safeRepoPath(item))) errors.push('task slot allowedPaths must contain safe exact file paths');
const slotSourceMode = slot.sourceMode ?? 'repository';
if (!['repository', 'focused-inline'].includes(slotSourceMode)) errors.push('task slot sourceMode invalid');
if (!Array.isArray(slot.contextPaths ?? []) || (slot.contextPaths ?? []).some((item) => !safeRepoPath(item))) errors.push('task slot contextPaths must contain safe exact file paths');
if ((slot.contextPaths ?? []).some((item) => slot.allowedPaths?.includes(item))) errors.push('task slot contextPaths overlap allowedPaths');
if (!Number.isInteger(slot.tokenBudget) || slot.tokenBudget < 2000 || slot.tokenBudget > 50000) errors.push('task slot token budget outside worker limits');
if (!Number.isInteger(slot.maxPatchBytes) || slot.maxPatchBytes < 1 || slot.maxPatchBytes > 100000) errors.push('task slot patch size outside worker limits');
if (slot.requirePatch !== true) errors.push('task slot must require a patch');
requireText(slot.goal, 'Use code_execution immediately.', 'task slot');
requireText(slot.goal, 'Do not change branches or Git history.', 'task slot');

requireText(worker, 'SW:OPS:ANTIGRAVITY_SIMPLE_WORKER_V1', 'worker');
requireText(worker, 'One task in, one untrusted patch out.', 'worker');
requireText(worker, "sandboxTrust: 'untrusted'", 'worker');
requireText(worker, "returnChannel: 'allowlisted-files-to-host-derived-patch'", 'worker');
requireText(worker, 'const EXTRACT_ALLOWED_SCRIPT', 'worker');
requireText(worker, "marker = 'workspace/repo/'", 'worker');
requireText(worker, 'if rel not in allowed:', 'worker');
requireText(worker, 'allowlisted snapshot path is not a regular file', 'worker');
requireText(worker, "interaction.status !== 'completed'", 'worker');
requireText(worker, 'interaction?.usage?.total_tokens', 'worker');
requireText(worker, "const sourceMode = raw.sourceMode ? requiredString(raw.sourceMode, 'sourceMode') : 'repository'", 'worker');
requireText(worker, "['repository', 'focused-inline']", 'worker');
requireText(worker, 'Focused inline sources exceed 2 MB total', 'worker');
requireText(worker, "network: 'disabled'", 'worker');
requireText(worker, "run('git', ['show', `${task.exactBaseSha}:${relative}`])", 'worker');
requireText(worker, 'Antigravity snapshot missing allowlisted file(s)', 'worker');
requireText(worker, 'File deletions are not accepted by SW-OPS-002', 'worker');
requireText(worker, "run('git', ['worktree', 'add', '--detach', baseWorktree, task.exactBaseSha])", 'worker');
requireText(worker, "'HEAD', '--', ...task.allowedPaths", 'worker');
requireText(worker, 'Patch path outside allowlist', 'worker');
requireText(worker, "githubWriteAuthority: false", 'worker');
requireText(worker, "tools: [{ type: 'code_execution' }]", 'worker');
requireText(worker, 'GEMINI_API_KEY', 'worker');
rejectText(worker, "['completed', 'incomplete']", 'worker');
rejectText(worker, 'await rm(target, { force: true })', 'worker');
rejectText(worker, "command === 'continue'", 'worker');
rejectText(worker, 'continuationBody', 'worker');
rejectText(worker, 'previous_interaction_id', 'worker');
rejectText(worker, 'Sandbox checkout mismatch', 'worker');
rejectText(worker, 'exact-base airlock', 'worker');
rejectText(worker, 'pre_tool_execution', 'worker');
rejectText(worker, 'submit_worker_bundle', 'worker');
rejectText(worker, "run('git', ['checkout'", 'worker');

requireText(workflow, 'SW-OPS-002 Antigravity Simple Worker', 'workflow');
requireText(workflow, 'workflow_dispatch:', 'workflow');
requireText(workflow, 'persist-credentials: false', 'workflow');
requireText(workflow, 'antigravity-sandbox-smoke', 'workflow');
requireText(workflow, 'live-task-slot:', 'workflow');
requireText(workflow, 'tools/antigravity/tasks/task-slot.json', 'workflow');
requireText(workflow, 'Ask Antigravity to run current task slot', 'workflow');
requireText(workflow, 'sw-antigravity-task-slot-evidence', 'workflow');
requireText(workflow, 'task.allowedPaths.includes', 'workflow');
requireText(workflow, 'task.exactBaseSha', 'workflow');
requireText(workflow, "result.interactionStatus !== 'completed'", 'workflow');
requireText(workflow, "result.sourceMode !== (task.sourceMode ?? 'repository')", 'workflow');
requireText(workflow, 'deleted file mode', 'workflow');
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
  rejectText(smokeText, forbidden, 'smoke task');
  rejectText(slotText, forbidden, 'task slot');
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
console.log(`- fixed smoke base: ${expectedBase}`);
console.log('- generic task slot: tools/antigravity/tasks/task-slot.json');
console.log('- contract: one task in, one untrusted patch out');
console.log('- task slot can be armed by PR label or Run workflow');
console.log('- incomplete interactions fail closed before patch derivation');
console.log('- missing allowlisted snapshot files fail closed; deletion patches are rejected');
console.log('- sandbox Git state is not authoritative');
console.log('- host builds the patch on the task base and GitHub credentials stay outside Antigravity');
console.log('- no continuation, bootstrap, hook, V2, or V3 machinery');
