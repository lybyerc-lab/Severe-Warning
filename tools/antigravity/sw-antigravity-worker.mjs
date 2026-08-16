#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_SANDBOX_WORKER]
// SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V1
// Tooling only. Never import this file from browser, Android, gameplay, or production runtime source.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const FILES_ROOT = 'https://generativelanguage.googleapis.com/v1beta/files';
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const DEFAULT_BUDGET = 8000;
const MIN_BUDGET = 4000;
const MAX_BUDGET = 50000;
const DEFAULT_MAX_PATCH_BYTES = 100000;
const REPO_TARGET = '/workspace/repo';
const OUTPUT_ROOT = '/workspace/antigravity-output';
const PATCH_NAME = 'worker.patch';
const RESULT_NAME = 'result.json';

function usage() {
  console.log(`Severe Weather Warning sandboxed Antigravity worker\n\nUsage:\n  node tools/antigravity/sw-antigravity-worker.mjs execute --task <task.json> --output-dir <dir> [--dry-run]\n  node tools/antigravity/sw-antigravity-worker.mjs collect --task <task.json> --environment <id> --output-dir <dir>\n\nEnvironment:\n  GEMINI_API_KEY  Required only for live API/download calls. Never commit or print it.\n`);
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

function assertString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function normalizeList(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} must be an array of non-empty strings`);
  }
  return value.map((item) => item.trim());
}

function normalizeBudget(value) {
  const budget = Number(value ?? DEFAULT_BUDGET);
  if (!Number.isInteger(budget) || budget < MIN_BUDGET || budget > MAX_BUDGET) {
    throw new Error(`tokenBudget must be an integer between ${MIN_BUDGET} and ${MAX_BUDGET}`);
  }
  return budget;
}

function normalizeMaxPatchBytes(value) {
  const maxPatchBytes = Number(value ?? DEFAULT_MAX_PATCH_BYTES);
  if (!Number.isInteger(maxPatchBytes) || maxPatchBytes < 1 || maxPatchBytes > 1000000) {
    throw new Error('maxPatchBytes must be an integer between 1 and 1000000');
  }
  return maxPatchBytes;
}

function normalizeRepoPath(value, label) {
  const normalized = assertString(value, label).replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalized.startsWith('/') || normalized.includes('../') || normalized === '..' || normalized.startsWith('.git/')) {
    throw new Error(`${label} must be a safe repository-relative path or prefix`);
  }
  return normalized;
}

async function loadTask(taskPath) {
  if (!taskPath) throw new Error('--task is required');
  const absolute = path.resolve(process.cwd(), taskPath);
  const raw = JSON.parse(await readFile(absolute, 'utf8'));
  const task = {
    version: assertString(raw.version, 'version'),
    taskId: assertString(raw.taskId, 'taskId'),
    repository: assertString(raw.repository, 'repository'),
    repositoryUrl: assertString(raw.repositoryUrl, 'repositoryUrl'),
    exactBaseSha: assertString(raw.exactBaseSha, 'exactBaseSha'),
    goal: assertString(raw.goal, 'goal'),
    nonGoals: normalizeList(raw.nonGoals, 'nonGoals'),
    allowedPaths: normalizeList(raw.allowedPaths, 'allowedPaths').map((item, index) => normalizeRepoPath(item, `allowedPaths[${index}]`)),
    protectedPaths: normalizeList(raw.protectedPaths, 'protectedPaths').map((item, index) => normalizeRepoPath(item, `protectedPaths[${index}]`)),
    proofPlan: normalizeList(raw.proofPlan, 'proofPlan'),
    requestedTests: normalizeList(raw.requestedTests, 'requestedTests'),
    tokenBudget: normalizeBudget(raw.tokenBudget),
    maxPatchBytes: normalizeMaxPatchBytes(raw.maxPatchBytes),
    requirePatch: raw.requirePatch !== false,
    agent: raw.agent ? assertString(raw.agent, 'agent') : DEFAULT_AGENT,
  };
  if (!/^[0-9a-f]{40}$/i.test(task.exactBaseSha)) throw new Error('exactBaseSha must be a full 40-character Git SHA');
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(task.repositoryUrl)) {
    throw new Error('repositoryUrl must be a public https://github.com/owner/repo URL');
  }
  return { task, absolute };
}

function workerAgentsMd(task) {
  return [
    '# Severe Weather Warning bounded Antigravity worker',
    '',
    'This sandbox is disposable. GitHub and production authority remain outside this environment.',
    `Task: ${task.taskId}`,
    `Repository: ${task.repository}`,
    `Required exact base SHA: ${task.exactBaseSha}`,
    '',
    'Mandatory startup order:',
    `1. cd ${REPO_TARGET}`,
    `2. Ensure commit ${task.exactBaseSha} exists locally. If needed, fetch that exact SHA from origin using unauthenticated read-only GitHub access.`,
    `3. git checkout --detach ${task.exactBaseSha}`,
    `4. Verify git rev-parse HEAD equals ${task.exactBaseSha}.`,
    '5. Only after that verification, read repository/task guidance and edit.',
    '',
    'Hard boundaries:',
    '- Never push, publish, deploy, open a PR, merge, release, or claim acceptance.',
    '- Never request, discover, store, or use GitHub credentials.',
    '- Do not broaden scope outside the task allowed paths.',
    '- Do not modify .git configuration, hooks, remotes, credentials, or repository history.',
    '- Local working-tree edits are allowed only to produce the requested patch.',
    '',
    `Before finishing, create ${OUTPUT_ROOT}/${PATCH_NAME} using git diff --binary --no-ext-diff against the exact base.`,
    `Also create ${OUTPUT_ROOT}/${RESULT_NAME} as valid JSON matching the task result contract.`,
    'Do not omit out-of-scope changes from the patch to hide them. If scope cannot be respected, return blocked instead.',
  ].join('\n');
}

function taskPrompt(task) {
  return [
    'Execute this bounded Severe Weather Warning sandbox task.',
    '',
    `Task ID: ${task.taskId}`,
    `Exact base SHA: ${task.exactBaseSha}`,
    '',
    'Goal:',
    task.goal,
    '',
    'Allowed repository paths/prefixes:',
    ...task.allowedPaths.map((item) => `- ${item}`),
    '',
    'Protected repository paths/prefixes:',
    ...task.protectedPaths.map((item) => `- ${item}`),
    '',
    'Non-goals:',
    ...task.nonGoals.map((item) => `- ${item}`),
    '',
    'Requested proof:',
    ...task.proofPlan.map((item) => `- ${item}`),
    '',
    'Requested tests:',
    ...task.requestedTests.map((item) => `- ${item}`),
    '',
    `Write the final patch to ${OUTPUT_ROOT}/${PATCH_NAME}.`,
    `Write structured evidence to ${OUTPUT_ROOT}/${RESULT_NAME}.`,
    'The result JSON must have this exact top-level shape:',
    '{"version":"SW_ANTIGRAVITY_WORKER_RESULT_V1","status":"completed|blocked|incomplete","taskId":"...","exactBaseSha":"...","verifiedBaseSha":"...","summary":"...","changedFiles":["..."],"tests":["..."],"evidence":["..."],"risks":["..."],"nextAction":"..."}',
    '',
    'Your final conversational response must be a terse JSON summary only. The files above are the authoritative return payload.',
  ].join('\n');
}

function buildEnvironment(task) {
  return {
    type: 'remote',
    sources: [
      {
        type: 'repository',
        source: task.repositoryUrl,
        target: REPO_TARGET,
      },
      {
        type: 'inline',
        target: '.agents/AGENTS.md',
        content: workerAgentsMd(task),
      },
      {
        type: 'inline',
        target: '/workspace/sw-antigravity-task.json',
        content: `${JSON.stringify(task, null, 2)}\n`,
      },
    ],
    network: {
      allowlist: [
        { domain: 'github.com' },
      ],
    },
  };
}

function buildInteraction(task) {
  return {
    agent: task.agent,
    input: taskPrompt(task),
    environment: buildEnvironment(task),
    tools: [
      { type: 'code_execution' },
    ],
    agent_config: {
      type: 'antigravity',
      max_total_tokens: task.tokenBudget,
    },
  };
}

function safeRequestSummary(task, taskFile) {
  return {
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_REQUEST_V1',
    dryRun: true,
    taskFile,
    taskId: task.taskId,
    repository: task.repository,
    repositoryUrl: task.repositoryUrl,
    exactBaseSha: task.exactBaseSha,
    agent: task.agent,
    tokenBudget: task.tokenBudget,
    maxPatchBytes: task.maxPatchBytes,
    requirePatch: task.requirePatch,
    allowedPaths: task.allowedPaths,
    protectedPaths: task.protectedPaths,
    tools: ['code_execution', 'filesystem (environment-provided)'],
    networkAllowlist: ['github.com (no injected credentials)'],
    repositoryTarget: REPO_TARGET,
    outputFiles: [`${OUTPUT_ROOT}/${PATCH_NAME}`, `${OUTPUT_ROOT}/${RESULT_NAME}`],
  };
}

async function apiJson(method, url, body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
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

async function downloadEnvironment(environmentId, tarPath) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
  const url = `${FILES_ROOT}/environment-${encodeURIComponent(environmentId)}:download?alt=media`;
  const response = await fetch(url, {
    headers: { 'x-goog-api-key': apiKey },
    redirect: 'follow',
  });
  if (!response.ok) throw new Error(`Environment snapshot download failed HTTP ${response.status}: ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error('Environment snapshot was empty');
  await writeFile(tarPath, bytes);
}

function runTar(args, options = {}) {
  const result = spawnSync('tar', args, {
    encoding: options.binary ? null : 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const stderr = Buffer.isBuffer(result.stderr) ? result.stderr.toString('utf8') : String(result.stderr || '');
    throw new Error(`tar ${args[0]} failed: ${stderr.trim()}`);
  }
  return result.stdout;
}

function findSnapshotEntry(entries, filename) {
  const suffix = `antigravity-output/${filename}`;
  const matches = entries.filter((entry) => entry === suffix || entry.endsWith(`/${suffix}`));
  if (matches.length !== 1) throw new Error(`Expected exactly one ${suffix} in environment snapshot; found ${matches.length}`);
  const entry = matches[0];
  if (entry.startsWith('/') || entry.includes('../')) throw new Error(`Unsafe tar entry: ${entry}`);
  return entry;
}

function pathMatches(candidate, rule) {
  return rule.endsWith('/') ? candidate.startsWith(rule) : candidate === rule || candidate.startsWith(`${rule}/`);
}

function parsePatchPaths(patchText) {
  const paths = [];
  for (const line of patchText.split(/\r?\n/)) {
    const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
    if (!match) continue;
    if (match[1] !== match[2]) throw new Error(`Renames are not accepted by SW-OPS-002 patch validator: ${match[1]} -> ${match[2]}`);
    const candidate = normalizeRepoPath(match[2], 'patch path');
    if (!paths.includes(candidate)) paths.push(candidate);
  }
  return paths;
}

function sameStringSet(a, b) {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function validateResult(task, result, patchText) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('result.json must contain an object');
  if (result.version !== 'SW_ANTIGRAVITY_WORKER_RESULT_V1') throw new Error('result.json has wrong version');
  if (result.taskId !== task.taskId) throw new Error('result.json taskId mismatch');
  if (result.exactBaseSha !== task.exactBaseSha) throw new Error('result.json exactBaseSha mismatch');
  if (result.verifiedBaseSha !== task.exactBaseSha) throw new Error('worker did not prove the exact base SHA');
  if (!['completed', 'blocked', 'incomplete'].includes(result.status)) throw new Error('result.json has invalid status');
  for (const field of ['summary', 'nextAction']) assertString(result[field], `result.${field}`);
  for (const field of ['changedFiles', 'tests', 'evidence', 'risks']) normalizeList(result[field], `result.${field}`);

  const patchBytes = Buffer.byteLength(patchText, 'utf8');
  if (patchBytes > task.maxPatchBytes) throw new Error(`Patch is ${patchBytes} bytes; task limit is ${task.maxPatchBytes}`);
  const patchPaths = parsePatchPaths(patchText);
  if (task.requirePatch && result.status === 'completed' && patchPaths.length === 0) throw new Error('Completed task required a non-empty patch');
  if (!sameStringSet(patchPaths, result.changedFiles.map((item, index) => normalizeRepoPath(item, `result.changedFiles[${index}]`)))) {
    throw new Error('result.changedFiles does not match worker.patch paths');
  }
  for (const candidate of patchPaths) {
    if (!task.allowedPaths.some((rule) => pathMatches(candidate, rule))) throw new Error(`Patch path is outside allowed territory: ${candidate}`);
    if (task.protectedPaths.some((rule) => pathMatches(candidate, rule))) throw new Error(`Patch path enters protected territory: ${candidate}`);
  }
  return { patchBytes, patchPaths };
}

async function collectSnapshot(task, environmentId, outputDir, interactionId = null, usage = null) {
  const absoluteOutputDir = path.resolve(process.cwd(), assertString(outputDir, '--output-dir'));
  await mkdir(absoluteOutputDir, { recursive: true });
  const tarPath = path.join(absoluteOutputDir, 'environment-snapshot.tar');
  await downloadEnvironment(environmentId, tarPath);
  try {
    const listing = runTar(['-tf', tarPath]);
    const entries = String(listing).split(/\r?\n/).filter(Boolean);
    const patchEntry = findSnapshotEntry(entries, PATCH_NAME);
    const resultEntry = findSnapshotEntry(entries, RESULT_NAME);
    const patchText = String(runTar(['-xOf', tarPath, patchEntry]));
    const resultText = String(runTar(['-xOf', tarPath, resultEntry]));
    let workerResult;
    try {
      workerResult = JSON.parse(resultText);
    } catch {
      throw new Error('Antigravity result.json is not valid JSON');
    }
    const validation = validateResult(task, workerResult, patchText);
    const patchPath = path.join(absoluteOutputDir, PATCH_NAME);
    const resultPath = path.join(absoluteOutputDir, RESULT_NAME);
    const envelopePath = path.join(absoluteOutputDir, 'envelope.json');
    await writeFile(patchPath, patchText, 'utf8');
    await writeFile(resultPath, `${JSON.stringify(workerResult, null, 2)}\n`, 'utf8');
    await writeFile(envelopePath, `${JSON.stringify({
      version: 'SW_OPS_002_ANTIGRAVITY_WORKER_ENVELOPE_V1',
      capturedAt: new Date().toISOString(),
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      interactionId,
      environmentId,
      usage,
      patchBytes: validation.patchBytes,
      patchPaths: validation.patchPaths,
      workerStatus: workerResult.status,
      workerSummary: workerResult.summary,
    }, null, 2)}\n`, 'utf8');
    return { patchPath, resultPath, envelopePath, ...validation, workerResult };
  } finally {
    await rm(tarPath, { force: true });
  }
}

async function runExecute(options) {
  const { task, absolute } = await loadTask(options.task);
  if (options.dryRun) {
    const summary = safeRequestSummary(task, path.relative(process.cwd(), absolute));
    if (options['output-dir']) {
      const dir = path.resolve(process.cwd(), options['output-dir']);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, 'request.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
      console.log(`Wrote ${path.join(dir, 'request.json')}`);
    } else {
      console.log(JSON.stringify(summary, null, 2));
    }
    return;
  }
  const interaction = await apiJson('POST', INTERACTIONS_URL, buildInteraction(task));
  const interactionId = assertString(interaction.id, 'interaction.id');
  const environmentId = assertString(interaction.environment_id, 'interaction.environment_id');
  const collected = await collectSnapshot(task, environmentId, options['output-dir'], interactionId, interaction.usage || null);
  console.log(`Antigravity worker ${task.taskId}: ${collected.workerResult.status}`);
  console.log(`Interaction: ${interactionId}`);
  console.log(`Environment: ${environmentId}`);
  console.log(`Patch: ${collected.patchPath}`);
}

async function runCollect(options) {
  const { task } = await loadTask(options.task);
  const environmentId = assertString(options.environment, '--environment');
  const collected = await collectSnapshot(task, environmentId, options['output-dir']);
  console.log(`Collected ${collected.patchPaths.length} changed path(s) from ${environmentId}`);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help') return usage();
  if (command === 'execute') return runExecute(options);
  if (command === 'collect') return runCollect(options);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[SW-OPS-002] ${error.message}`);
  process.exitCode = 1;
});
