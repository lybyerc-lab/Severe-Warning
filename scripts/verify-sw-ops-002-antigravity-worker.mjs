#!/usr/bin/env node

// SW_OPS_002_ANTIGRAVITY_WORKER_VERIFIER_V5

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const workerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-sandbox-worker.mjs');
const bootstrapHelperPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-exact-base-bootstrap.mjs');
const legacyWorkerPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-worker.mjs');
const taskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-smoke.json');
const bootstrapPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-002-bootstrap.json');
const expectedBaseRef = 'agent/sw-ops-001-antigravity-bridge';
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
const bootstrapHelper = await readFile(bootstrapHelperPath, 'utf8');
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
if (bootstrap.exactBaseRef !== expectedBaseRef) errors.push('bootstrap exact base ref mismatch');
if (bootstrap.exactBaseSha !== expectedBase) errors.push('bootstrap exact base SHA mismatch');
if (bootstrap.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') errors.push('bootstrap repository URL mismatch');
if (JSON.stringify(bootstrap.allowedPaths) !== JSON.stringify([expectedFixture])) errors.push('bootstrap allowed path widened');
if (bootstrap.tokenBudget > 4000) errors.push('bootstrap token budget widened above 4000');
if (bootstrap.maxPatchBytes > 10000) errors.push('bootstrap patch limit widened above 10000 bytes');
if (bootstrap.requirePatch !== false) errors.push('bootstrap must not require a patch');
requireText(bootstrap.goal, 'Bootstrap only. Do not edit any repository file.', 'bootstrap goal');
requireText(bootstrap.goal, expectedBaseRef, 'bootstrap goal');
requireText(bootstrap.goal, expectedBase, 'bootstrap goal');
requireText(bootstrap.goal, 'infrastructure hook', 'bootstrap goal');

requireText(bootstrapHelper, 'SW:OPS:ANTIGRAVITY_EXACT_BASE_BOOTSTRAP_V1', 'bootstrap helper');
requireText(bootstrapHelper, 'pre_tool_execution', 'bootstrap helper');
requireText(bootstrapHelper, "matcher: '.*'", 'bootstrap helper');
requireText(bootstrapHelper, "command: 'python3 /.agents/hooks-scripts/exact_base_normalize.py'", 'bootstrap helper');
requireText(bootstrapHelper, "command: 'python3 /.agents/hooks-scripts/command_gate.py'", 'bootstrap helper');
requireText(bootstrapHelper, "target: '.agents/hooks-scripts/exact_base_normalize.py'", 'bootstrap helper');
requireText(bootstrapHelper, "target: '.agents/hooks-scripts/command_gate.py'", 'bootstrap helper');
requireText(bootstrapHelper, 'function normalizerScript(task)', 'bootstrap helper');
requireText(bootstrapHelper, 'function commandGateScript(task)', 'bootstrap helper');
requireText(bootstrapHelper, 'git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)', 'bootstrap helper normalizer');
requireText(bootstrapHelper, 'git("checkout", "--detach", EXPECTED_SHA)', 'bootstrap helper normalizer');
requireText(bootstrapHelper, 'respond("allow")', 'bootstrap helper normalizer');
requireText(bootstrapHelper, 'Exact-base normalizer failed closed before tool execution.', 'bootstrap helper normalizer');
requireText(bootstrapHelper, 'if tool_call.get("name") != "code_execution"', 'bootstrap helper command gate');
requireText(bootstrapHelper, 'respond("deny", "SW-OPS-002 permits code_execution only.")', 'bootstrap helper command gate');
requireText(bootstrapHelper, 'SW-OPS-002 command gate failed closed before tool execution.', 'bootstrap helper command gate');
requireText(bootstrapHelper, "tools: [{ type: 'code_execution' }]", 'bootstrap helper');
requireText(bootstrapHelper, "network: { allowlist: [{ domain: 'github.com' }] }", 'bootstrap helper');
requireText(bootstrapHelper, 'INITIAL_SCRIPT =', 'bootstrap helper');
requireText(bootstrapHelper, 'CORRECTION_SCRIPT =', 'bootstrap helper');
requireText(bootstrapHelper, 'READ_ONLY_LINES =', 'bootstrap helper');
requireText(bootstrapHelper, 'normalized == normalize(INITIAL_SCRIPT)', 'bootstrap helper');
requireText(bootstrapHelper, 'normalized == normalize(CORRECTION_SCRIPT)', 'bootstrap helper');
requireText(bootstrapHelper, 'command gate blocked exploration or an unapproved command', 'bootstrap helper');
requireText(bootstrapHelper, expectedFixture, 'bootstrap helper');
requireText(bootstrapHelper, 'Director controls every GitHub write', 'bootstrap helper');
requireText(bootstrapHelper, 'import json, os, shutil, sys, tarfile', 'bootstrap helper');
requireText(bootstrapHelper, 'non-regular repository member outside .git', 'bootstrap helper');
requireText(bootstrapHelper, 'skippedGitLinkCount', 'bootstrap helper');
requireText(bootstrapHelper, 'patchBytes: 0', 'bootstrap helper');
requireText(bootstrapHelper, 'patchPaths: []', 'bootstrap helper');
requireText(bootstrapHelper, "returnChannel: 'host-verified-hooked-snapshot'", 'bootstrap helper');
requireText(bootstrapHelper, "quarantineStatus: 'exact-base-ready-no-patch'", 'bootstrap helper');
rejectText(bootstrapHelper, 'exact_base_gate.py', 'bootstrap helper');
rejectText(bootstrapHelper, "run('tar', ['--no-same-owner'", 'bootstrap helper');
rejectText(bootstrapHelper, 'Authorization:', 'bootstrap helper');
rejectText(bootstrapHelper, 'github_pat_', 'bootstrap helper');
rejectText(bootstrapHelper, 'ghp_', 'bootstrap helper');

const gateStart = bootstrapHelper.indexOf('function commandGateScript(task)');
const gateEnd = bootstrapHelper.indexOf('\nfunction apiKey()', gateStart);
if (gateStart < 0 || gateEnd < 0) {
  errors.push('could not isolate commandGateScript for mutation audit');
} else {
  const gate = bootstrapHelper.slice(gateStart, gateEnd);
  rejectText(gate, 'subprocess', 'command gate');
  rejectText(gate, 'git("', 'command gate');
  rejectText(gate, 'EXPECTED_REF', 'command gate');
  rejectText(gate, 'EXPECTED_SHA', 'command gate');
}

requireText(worker, 'SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V5', 'worker');
requireText(worker, 'target: REPO_TARGET', 'worker');
requireText(worker, "target: '.agents/AGENTS.md'", 'worker');
requireText(worker, "target: '/workspace/sw-antigravity-task.json'", 'worker');
requireText(worker, "{ domain: 'github.com' }", 'worker');
requireText(worker, "tools: [{ type: 'code_execution' }]", 'worker');
requireText(worker, "executionMode: 'custom-environment-host-derived-snapshot-diff'", 'worker');
requireText(worker, "returnChannel: 'host-derived-snapshot-diff'", 'worker');
requireText(worker, 'workerHandoffFilesRequired: false', 'worker');
requireText(worker, 'const SNAPSHOT_RETRIES = 6', 'worker');
requireText(worker, 'const ENVIRONMENTS_URL = `${API_ROOT}/environments`', 'worker');
requireText(worker, 'const FILES_URL = `${API_ROOT}/files`', 'worker');
requireText(worker, 'environment-${encodeURIComponent(environmentId)}:download?alt=media', 'worker');
requireText(worker, 'import json, os, shutil, sys, tarfile', 'worker');
requireText(worker, 'non-regular repository member outside .git', 'worker');
requireText(worker, 'skippedGitLinkCount', 'worker');
requireText(worker, "run('rsync', ['-a', '--delete'", 'worker');
requireText(worker, "ls-files', '--others', '--exclude-standard', '-z'", 'worker');
requireText(worker, "'diff', '--check'", 'worker');
requireText(worker, "'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD'", 'worker');
requireText(worker, 'Patch path outside allowed territory', 'worker');
requireText(worker, 'Sandbox checkout mismatch', 'worker');
requireText(worker, 'Renames are not accepted', 'worker');
requireText(worker, 'GEMINI_API_KEY', 'worker');
requireText(worker, 'MissingWorkerPatchError', 'worker');
rejectText(worker, "run('tar', ['--no-same-owner'", 'worker');
rejectText(worker, 'Environment snapshot contains unsupported link/device entry', 'worker');
rejectText(worker, 'submit_worker_bundle', 'worker');
rejectText(worker, 'background: true', 'worker');
rejectText(worker, 'response_format', 'worker');
rejectText(worker, 'worker.patch and result.json', 'worker');

for (const forbidden of ['ghp_', 'github_pat_', 'x-oauth-basic:', 'Authorization: Bearer', 'Authorization: Basic']) {
  rejectText(worker, forbidden, 'worker');
  rejectText(bootstrapHelper, forbidden, 'bootstrap helper');
  rejectText(taskText, forbidden, 'smoke task');
  rejectText(bootstrapText, forbidden, 'bootstrap task');
}

for (const relativeRoot of ['runtime', 'modern', 'MechanicsLab', 'android']) {
  for (const file of await walk(path.join(root, relativeRoot))) {
    if (!/\.(?:js|mjs|cjs|ts|tsx|html|json|java|kt|gradle)$/i.test(file)) continue;
    const text = await readFile(file, 'utf8').catch(() => '');
    if (text.includes('sw-antigravity-sandbox-worker') || text.includes('SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER') || text.includes('sw-antigravity-exact-base-bootstrap')) {
      errors.push(`runtime imports/references Antigravity tooling: ${path.relative(root, file)}`);
    }
  }
}

if (errors.length) {
  console.error('SW-OPS-002 verifier FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SW-OPS-002 verifier PASS');
console.log(`- exact base ref: ${expectedBaseRef}`);
console.log(`- exact base SHA: ${expectedBase}`);
console.log(`- allowed smoke path: ${expectedFixture}`);
console.log('- bootstrap: exact-base normalizer and command gate are separate ordered pre-tool hooks');
console.log('- normalizer owns checkout mutation and returns allow after exact-base verification');
console.log('- command gate has no git/subprocess mutation authority and only approves pinned code_execution commands');
console.log('- hook errors are converted to deny decisions instead of crashing open');
console.log('- snapshots: Python tarfile parser, regular files only, archive links never followed');
console.log('- .git lock/device artifacts may be skipped; non-regular project entries are rejected');
console.log('- return: host derives patch from complete sandbox filesystem snapshot');
console.log('- snapshot repo HEAD must equal exact task base');
console.log('- untracked files are included by host intent-to-add before diff');
console.log('- patch paths are allowlisted before independent apply proof');
console.log('- network: github.com only, no injected GitHub credentials');
console.log('- runtime imports: none detected');
