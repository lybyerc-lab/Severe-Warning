#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_SANDBOX_WORKER_V5]
// SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V5
// Tooling only. Never import from browser, Android, gameplay, or production runtime source.

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const INTERACTIONS_URL = `${API_ROOT}/interactions`;
const ENVIRONMENTS_URL = `${API_ROOT}/environments`;
const FILES_URL = `${API_ROOT}/files`;
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const REPO_TARGET = '/workspace/repo';
const POLL_MS = 5000;
const POLL_CEILING_MS = 12 * 60 * 1000;
const RECOVERY_TOKEN_BUDGET = 8000;
const SNAPSHOT_RETRIES = 6;
const SNAPSHOT_RETRY_MS = 5000;

class MissingWorkerPatchError extends Error {}

function usage() {
  console.log(`Severe Weather Warning Antigravity sandbox worker\n\nUsage:\n  node tools/antigravity/sw-antigravity-sandbox-worker.mjs execute --task <task.json> --output-dir <dir> [--dry-run]\n  node tools/antigravity/sw-antigravity-sandbox-worker.mjs continue --task <task.json> --interaction <audit-id> --environment <id> --input <text> --output-dir <dir> [--dry-run]\n\nEnvironment:\n  GEMINI_API_KEY  Required for live calls only. Never commit or print it.\n`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--dry-run') {
      options.dryRun = true;
      continue;
    }
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = rest[++i];
    if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
    options[token.slice(2)] = value;
  }
  return { command, options };
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function stringList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} must be an array of non-empty strings`);
  }
  return value.map((item) => item.trim());
}

function safeRepoPath(value, label) {
  const normalized = requiredString(value, label).replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalized.startsWith('/') || normalized === '..' || normalized.includes('../') || normalized.startsWith('.git/')) {
    throw new Error(`${label} must be a safe repository-relative path or prefix`);
  }
  return normalized;
}

async function loadTask(inputPath) {
  const absolute = path.resolve(process.cwd(), requiredString(inputPath, '--task'));
  const raw = JSON.parse(await readFile(absolute, 'utf8'));
  const tokenBudget = Number(raw.tokenBudget ?? 8000);
  const maxPatchBytes = Number(raw.maxPatchBytes ?? 100000);
  if (!Number.isInteger(tokenBudget) || tokenBudget < 4000 || tokenBudget > 50000) {
    throw new Error('tokenBudget must be an integer between 4000 and 50000');
  }
  if (!Number.isInteger(maxPatchBytes) || maxPatchBytes < 1 || maxPatchBytes > 1000000) {
    throw new Error('maxPatchBytes must be an integer between 1 and 1000000');
  }
  const task = {
    version: requiredString(raw.version, 'version'),
    taskId: requiredString(raw.taskId, 'taskId'),
    repository: requiredString(raw.repository, 'repository'),
    repositoryUrl: requiredString(raw.repositoryUrl, 'repositoryUrl'),
    exactBaseSha: requiredString(raw.exactBaseSha, 'exactBaseSha'),
    goal: requiredString(raw.goal, 'goal'),
    nonGoals: stringList(raw.nonGoals, 'nonGoals'),
    allowedPaths: stringList(raw.allowedPaths, 'allowedPaths').map((item, index) => safeRepoPath(item, `allowedPaths[${index}]`)),
    protectedPaths: stringList(raw.protectedPaths, 'protectedPaths').map((item, index) => safeRepoPath(item, `protectedPaths[${index}]`)),
    proofPlan: stringList(raw.proofPlan, 'proofPlan'),
    requestedTests: stringList(raw.requestedTests, 'requestedTests'),
    tokenBudget,
    maxPatchBytes,
    requirePatch: raw.requirePatch !== false,
    agent: raw.agent ? requiredString(raw.agent, 'agent') : DEFAULT_AGENT,
  };
  if (!/^[0-9a-f]{40}$/i.test(task.exactBaseSha)) throw new Error('exactBaseSha must be a full 40-character Git SHA');
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(task.repositoryUrl)) {
    throw new Error('repositoryUrl must be a public https://github.com/owner/repo URL');
  }
  return { task, absolute };
}

function agentsMd(task) {
  return [
    '# Severe Weather Warning bounded Antigravity worker',
    '',
    'GitHub and production authority remain outside this disposable sandbox.',
    `Task ID: ${task.taskId}`,
    `Required exact base SHA: ${task.exactBaseSha}`,
    '',
    'This exact tooling task contract is sufficient authority for this bounded smoke. Do not spend tokens reading unrelated product/game documents.',
    '',
    'Mandatory checkout law:',
    `1. cd ${REPO_TARGET}`,
    `2. Ensure ${task.exactBaseSha} exists locally. If needed, fetch only from the public origin.`,
    `3. git checkout --detach ${task.exactBaseSha}`,
    `4. Verify git rev-parse HEAD is exactly ${task.exactBaseSha}.`,
    '5. Perform only the task contract below.',
    '',
    'Hard boundaries:',
    '- Never request or use GitHub credentials.',
    '- Never push, commit, open a PR, merge, release, publish, deploy, or claim acceptance.',
    '- Edit only task-allowed repository paths.',
    '- Do not alter .git configuration, hooks, remotes, credentials, or history.',
    '- Local working-tree edits are the only deliverable. The host derives and validates the patch from the sandbox filesystem snapshot.',
    '',
    'After the requested edit and lightweight checks, stop. Do not spend tokens composing a patch, manifest, report, or polished final response.',
  ].join('\n');
}

function taskPrompt(task) {
  return [
    'Execute this bounded Severe Weather Warning worker task in the mounted sandbox.',
    `Task ID: ${task.taskId}`,
    `Exact base SHA: ${task.exactBaseSha}`,
    '',
    'Goal:', task.goal,
    '',
    'Allowed repository paths:', ...task.allowedPaths.map((item) => `- ${item}`),
    '',
    'Protected repository paths:', ...task.protectedPaths.map((item) => `- ${item}`),
    '',
    'Non-goals:', ...task.nonGoals.map((item) => `- ${item}`),
    '',
    'Proof plan:', ...task.proofPlan.map((item) => `- ${item}`),
    '',
    'Requested tests:', ...task.requestedTests.map((item) => `- ${item}`),
    '',
    'The host will derive the patch from your sandbox filesystem. Do not create handoff files. After the bounded edit and requested checks, stop.',
  ].join('\n');
}

function correctionPrompt(task, input, auditInteractionId) {
  return [
    'This is a fresh agent turn reusing the same Severe Weather Warning sandbox filesystem.',
    `Prior audited interaction ID: ${auditInteractionId}. Inspect the current filesystem directly instead of reconstructing prior reasoning.`,
    `Task ID remains ${task.taskId}. Exact base remains ${task.exactBaseSha}.`,
    'Do not widen scope or authority.',
    '',
    'Director correction:', requiredString(input, '--input'),
    '',
    'Apply only that correction, rerun the already-requested lightweight checks, then stop. The host derives the revised patch from the sandbox filesystem.',
  ].join('\n');
}

function recoveryPrompt(task, auditInteractionId) {
  return [
    'Finish the bounded filesystem edit only. Reuse the existing sandbox with a fresh conversation.',
    `Prior audited interaction ID: ${auditInteractionId}.`,
    `Task ID: ${task.taskId}. Exact base: ${task.exactBaseSha}.`,
    'The previous turn produced no host-visible patch. Do not broaden scope or add unrelated changes.',
    `Inspect the current working tree against ${task.exactBaseSha}. Complete only the already-requested allowed-path edit if it is missing, run the lightweight checks, then stop.`,
    'Do not create reports or handoff files. The host derives the patch from the filesystem.',
  ].join('\n');
}

function environmentConfig(task) {
  return {
    type: 'remote',
    sources: [
      { type: 'repository', source: task.repositoryUrl, target: REPO_TARGET },
      { type: 'inline', target: '.agents/AGENTS.md', content: agentsMd(task) },
      { type: 'inline', target: '/workspace/sw-antigravity-task.json', content: `${JSON.stringify(task, null, 2)}\n` },
    ],
    network: { allowlist: [{ domain: 'github.com' }] },
  };
}

function agentConfig(task, budget = task.tokenBudget) {
  return { type: 'antigravity', max_total_tokens: budget };
}

function initialBody(task) {
  return {
    agent: task.agent,
    input: taskPrompt(task),
    environment: environmentConfig(task),
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task),
  };
}

function continuationBody(task, options) {
  const auditInteractionId = requiredString(options.interaction, '--interaction');
  return {
    agent: task.agent,
    input: correctionPrompt(task, options.input, auditInteractionId),
    environment: requiredString(options.environment, '--environment'),
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task),
    auditInteractionId,
  };
}

function recoveryBody(task, interaction) {
  const auditInteractionId = requiredString(interaction.id, 'interaction.id');
  return {
    agent: task.agent,
    input: recoveryPrompt(task, auditInteractionId),
    environment: requiredString(interaction.environment_id, 'interaction.environment_id'),
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task, Math.min(task.tokenBudget, RECOVERY_TOKEN_BUDGET)),
    auditInteractionId,
  };
}

function drySummary(task, taskFile, mode, extras = {}) {
  return {
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_REQUEST_V5',
    dryRun: true,
    mode,
    executionMode: 'custom-environment-host-derived-snapshot-diff',
    continuationStateMode: 'same-environment-fresh-conversation',
    taskFile,
    taskId: task.taskId,
    exactBaseSha: task.exactBaseSha,
    repositoryUrl: task.repositoryUrl,
    repositoryTarget: REPO_TARGET,
    networkAllowlist: ['github.com (no injected credentials)'],
    tools: ['code_execution', 'filesystem via environment'],
    tokenBudget: task.tokenBudget,
    recoveryTokenBudget: Math.min(task.tokenBudget, RECOVERY_TOKEN_BUDGET),
    maxPatchBytes: task.maxPatchBytes,
    allowedPaths: task.allowedPaths,
    protectedPaths: task.protectedPaths,
    returnChannel: 'host-derived-snapshot-diff',
    snapshotRetries: SNAPSHOT_RETRIES,
    snapshotRetryMs: SNAPSHOT_RETRY_MS,
    workerHandoffFilesRequired: false,
    ...extras,
  };
}

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return key;
}

async function apiJson(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey(),
      'Api-Revision': '2026-05-20',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`Gemini API returned non-JSON HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}: ${payload?.error?.message || text.slice(0, 300)}`);
  return payload;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runInteraction(body) {
  const request = { ...body };
  delete request.auditInteractionId;
  let interaction = await apiJson('POST', INTERACTIONS_URL, request);
  const id = requiredString(interaction.id, 'interaction.id');
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error(`Antigravity interaction ${id} exceeded local poll ceiling`);
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${INTERACTIONS_URL}/${encodeURIComponent(id)}`);
  }
  if (!['completed', 'incomplete'].includes(interaction.status)) {
    throw new Error(`Antigravity interaction ended in unusable status ${interaction.status || '(missing)'}`);
  }
  requiredString(interaction.environment_id, 'interaction.environment_id');
  return interaction;
}

async function verifyEnvironment(environmentId) {
  const environment = await apiJson('GET', `${ENVIRONMENTS_URL}/${encodeURIComponent(environmentId)}`);
  const returnedId = environment.environment_id || environment.id || null;
  if (returnedId && !String(returnedId).includes(environmentId)) {
    throw new Error(`Environment metadata mismatch for ${environmentId}`);
  }
  return environment;
}

async function downloadSnapshot(environmentId, tarPath) {
  const url = `${FILES_URL}/environment-${encodeURIComponent(environmentId)}:download?alt=media`;
  let lastError = null;
  for (let attempt = 1; attempt <= SNAPSHOT_RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: { 'x-goog-api-key': apiKey() },
      redirect: 'follow',
    });
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('Environment snapshot was empty');
      await writeFile(tarPath, bytes);
      return attempt;
    }
    const text = await response.text().catch(() => '');
    lastError = new Error(`Environment snapshot HTTP ${response.status}: ${text.slice(0, 200) || response.statusText}`);
    if (![404, 409, 429, 500, 502, 503, 504].includes(response.status) || attempt === SNAPSHOT_RETRIES) break;
    await sleep(SNAPSHOT_RETRY_MS);
  }
  throw lastError || new Error('Environment snapshot download failed');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed: ${String(result.stderr || result.stdout || '').trim()}`);
  }
  return String(result.stdout || '');
}

function tarEntries(tarPath) {
  return run('tar', ['-tf', tarPath]).split(/\r?\n/).filter(Boolean);
}

function normalizeTarEntry(entry) {
  return entry.replace(/^\.\//, '');
}

function validateTar(entries, tarPath) {
  for (const raw of entries) {
    const entry = normalizeTarEntry(raw);
    const parts = entry.split('/');
    if (raw.startsWith('/') || parts.includes('..')) throw new Error(`Unsafe environment snapshot entry: ${raw}`);
  }
  const verbose = run('tar', ['-tvf', tarPath]);
  for (const line of verbose.split(/\r?\n/)) {
    if (!line) continue;
    if ('lhcbp'.includes(line[0])) throw new Error(`Environment snapshot contains unsupported link/device entry: ${line.slice(0, 160)}`);
  }
}

function findRepoPrefix(entries) {
  const candidates = new Set();
  for (const raw of entries) {
    const entry = normalizeTarEntry(raw);
    const marker = 'workspace/repo/';
    const index = entry.indexOf(marker);
    if (index >= 0) candidates.add(entry.slice(0, index) + marker);
    if (entry === 'workspace/repo') candidates.add('workspace/repo/');
  }
  if (candidates.size !== 1) throw new Error(`Expected exactly one workspace/repo prefix in snapshot; found ${candidates.size}`);
  return [...candidates][0];
}

function patchPaths(patch) {
  const paths = [];
  for (const line of patch.split(/\r?\n/)) {
    const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
    if (!match) continue;
    if (match[1] !== match[2]) throw new Error(`Renames are not accepted: ${match[1]} -> ${match[2]}`);
    const candidate = safeRepoPath(match[2], 'patch path');
    if (!paths.includes(candidate)) paths.push(candidate);
  }
  return paths;
}

function matchesPath(candidate, rule) {
  return rule.endsWith('/') ? candidate.startsWith(rule) : candidate === rule || candidate.startsWith(`${rule}/`);
}

function validatePatch(task, patch) {
  const bytes = Buffer.byteLength(patch, 'utf8');
  if (bytes > task.maxPatchBytes) throw new Error(`Patch exceeds ${task.maxPatchBytes} byte limit`);
  const paths = patchPaths(patch);
  if (task.requirePatch && !paths.length) throw new MissingWorkerPatchError('Sandbox snapshot produced no repository patch');
  for (const candidate of paths) {
    if (!task.allowedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path outside allowed territory: ${candidate}`);
    if (task.protectedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path enters protected territory: ${candidate}`);
  }
  return { bytes, paths };
}

function addIntentToAdd(worktreeDir) {
  const output = run('git', ['-C', worktreeDir, 'ls-files', '--others', '--exclude-standard', '-z']);
  const files = output.split('\0').filter(Boolean);
  for (let index = 0; index < files.length; index += 100) {
    run('git', ['-C', worktreeDir, 'add', '-N', '--', ...files.slice(index, index + 100)]);
  }
  return files;
}

async function deriveSnapshotPatch(task, interaction, outputDir) {
  const environmentId = requiredString(interaction.environment_id, 'interaction.environment_id');
  await verifyEnvironment(environmentId);
  const dir = path.resolve(process.cwd(), requiredString(outputDir, '--output-dir'));
  await mkdir(dir, { recursive: true });
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'sw-ops-002-'));
  const tarPath = path.join(scratch, 'environment.tar');
  const snapshotRoot = path.join(scratch, 'snapshot');
  const baseWorktree = path.join(scratch, 'base');
  let worktreeAdded = false;
  try {
    const attempts = await downloadSnapshot(environmentId, tarPath);
    const entries = tarEntries(tarPath);
    validateTar(entries, tarPath);
    const repoPrefix = findRepoPrefix(entries);
    await mkdir(snapshotRoot, { recursive: true });
    run('tar', ['--no-same-owner', '--no-same-permissions', '-xf', tarPath, '-C', snapshotRoot]);
    const snapshotRepo = path.join(snapshotRoot, repoPrefix.replace(/\/$/, ''));
    const snapshotHead = run('git', ['-C', snapshotRepo, 'rev-parse', 'HEAD']).trim();
    if (snapshotHead !== task.exactBaseSha) {
      throw new Error(`Sandbox checkout mismatch: expected ${task.exactBaseSha}, got ${snapshotHead}`);
    }

    run('git', ['worktree', 'add', '--detach', baseWorktree, task.exactBaseSha]);
    worktreeAdded = true;
    run('rsync', ['-a', '--delete', '--exclude=.git', '--exclude=.git/', '--', `${snapshotRepo}/`, `${baseWorktree}/`]);
    const untracked = addIntentToAdd(baseWorktree);
    run('git', ['-C', baseWorktree, 'diff', '--check']);
    const patch = run('git', ['-C', baseWorktree, 'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD']);
    const checked = validatePatch(task, patch);
    const status = run('git', ['-C', baseWorktree, 'status', '--short']);

    const result = {
      version: 'SW_ANTIGRAVITY_SANDBOX_RESULT_V1',
      status: 'quarantined-patch-ready',
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      verifiedBaseSha: snapshotHead,
      interactionStatus: interaction.status,
      changedFiles: checked.paths,
      untrackedFiles: untracked,
      hostChecks: ['snapshot environment verified', 'sandbox HEAD verified', 'git diff --check PASS', 'path allowlist PASS'],
      sandboxStatus: status.trim().split(/\r?\n/).filter(Boolean),
      risks: interaction.status === 'incomplete'
        ? ['Antigravity interaction ended incomplete; candidate patch was derived from filesystem state and still requires independent apply/content proof.']
        : [],
      nextAction: 'Independent CI must git apply --check the quarantined patch on the exact frozen base before any repository write is considered.',
    };

    await writeFile(path.join(dir, 'worker.patch'), patch, 'utf8');
    await writeFile(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    await writeFile(path.join(dir, 'envelope.json'), `${JSON.stringify({
      version: 'SW_OPS_002_ANTIGRAVITY_WORKER_ENVELOPE_V5',
      capturedAt: new Date().toISOString(),
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      interactionId: interaction.id,
      environmentId,
      apiStatus: interaction.status,
      usage: interaction.usage || null,
      snapshotAttempts: attempts,
      snapshotHead,
      patchBytes: checked.bytes,
      patchPaths: checked.paths,
      returnChannel: 'host-derived-snapshot-diff',
      quarantineStatus: 'patch-ready-not-applied',
    }, null, 2)}\n`, 'utf8');
    console.log(`Antigravity API status: ${interaction.status}`);
    console.log(`Sandbox HEAD: ${snapshotHead}`);
    console.log(`Derived ${checked.paths.length} patch path(s) from environment ${environmentId}`);
    return { result, environmentId };
  } finally {
    if (worktreeAdded) {
      spawnSync('git', ['worktree', 'remove', '--force', baseWorktree], { cwd: process.cwd(), encoding: 'utf8' });
    }
    await rm(scratch, { recursive: true, force: true });
  }
}

async function deriveWithOneRecovery(task, interaction, outputDir) {
  try {
    return await deriveSnapshotPatch(task, interaction, outputDir);
  } catch (error) {
    if (!(error instanceof MissingWorkerPatchError)) throw error;
    console.log(`[SW-OPS-002] No repository patch after ${interaction.status}; one same-environment recovery turn is allowed.`);
    const recovered = await runInteraction(recoveryBody(task, interaction));
    return deriveSnapshotPatch(task, recovered, outputDir);
  }
}

async function writeDry(summary, outputDir) {
  if (!outputDir) return console.log(JSON.stringify(summary, null, 2));
  const dir = path.resolve(process.cwd(), outputDir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'request.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${path.join(dir, 'request.json')}`);
}

async function execute(options) {
  const { task, absolute } = await loadTask(options.task);
  if (options.dryRun) {
    return writeDry(drySummary(task, path.relative(process.cwd(), absolute), 'execute'), options['output-dir']);
  }
  const interaction = await runInteraction(initialBody(task));
  await deriveWithOneRecovery(task, interaction, options['output-dir']);
}

async function continueTask(options) {
  const { task, absolute } = await loadTask(options.task);
  const body = continuationBody(task, options);
  if (options.dryRun) {
    return writeDry(drySummary(task, path.relative(process.cwd(), absolute), 'continue', {
      auditPreviousInteractionId: body.auditInteractionId,
      environmentId: body.environment,
      directorFeedback: body.input,
    }), options['output-dir']);
  }
  const interaction = await runInteraction(body);
  await deriveWithOneRecovery(task, interaction, options['output-dir']);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help') return usage();
  if (command === 'execute') return execute(options);
  if (command === 'continue') return continueTask(options);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[SW-OPS-002] ${error.message}`);
  process.exitCode = 1;
});
