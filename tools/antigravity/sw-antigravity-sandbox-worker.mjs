#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_SIMPLE_WORKER_V1]
// Tooling only. One task in, one untrusted patch out. GitHub remains Director-controlled.

import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const INTERACTIONS_URL = `${API_ROOT}/interactions`;
const FILES_URL = `${API_ROOT}/files`;
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const REPO_TARGET = '/workspace/repo';
const POLL_MS = 4000;
const POLL_CEILING_MS = 8 * 60 * 1000;
const SNAPSHOT_RETRIES = 4;
const SNAPSHOT_RETRY_MS = 4000;
const INLINE_FILE_MAX_BYTES = 1024 * 1024;
const INLINE_TOTAL_MAX_BYTES = 2 * 1024 * 1024;

function usage() {
  console.log(`Severe Weather Warning Antigravity worker\n\nUsage:\n  node tools/antigravity/sw-antigravity-sandbox-worker.mjs execute --task <task.json> --output-dir <dir> [--dry-run]\n\nEnvironment:\n  GEMINI_API_KEY  Required for live calls only. Never commit or print it.\n`);
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

function safeExactFile(value, label) {
  const normalized = requiredString(value, label).replaceAll('\\', '/').replace(/^\.\//, '');
  if (normalized.startsWith('/') || normalized === '..' || normalized.includes('../') || normalized.startsWith('.git/') || normalized.endsWith('/')) {
    throw new Error(`${label} must be a safe exact repository file path`);
  }
  return normalized;
}

async function loadTask(inputPath) {
  const absolute = path.resolve(process.cwd(), requiredString(inputPath, '--task'));
  const raw = JSON.parse(await readFile(absolute, 'utf8'));
  const tokenBudget = Number(raw.tokenBudget ?? 8000);
  const continuationTokenBudget = Number(raw.continuationTokenBudget ?? tokenBudget);
  const maxContinuationAttempts = Number(raw.maxContinuationAttempts ?? 0);
  const maxPatchBytes = Number(raw.maxPatchBytes ?? 100000);
  if (!Number.isInteger(tokenBudget) || tokenBudget < 2000 || tokenBudget > 50000) throw new Error('tokenBudget must be an integer between 2000 and 50000');
  if (!Number.isInteger(continuationTokenBudget) || continuationTokenBudget < 2000 || continuationTokenBudget > 50000) throw new Error('continuationTokenBudget must be an integer between 2000 and 50000');
  if (!Number.isInteger(maxContinuationAttempts) || maxContinuationAttempts < 0 || maxContinuationAttempts > 1) throw new Error('maxContinuationAttempts must be 0 or 1');
  if (!Number.isInteger(maxPatchBytes) || maxPatchBytes < 1 || maxPatchBytes > 100000) throw new Error('maxPatchBytes must be an integer between 1 and 100000');

  const sourceMode = raw.sourceMode ? requiredString(raw.sourceMode, 'sourceMode') : 'repository';
  if (!['repository', 'focused-inline'].includes(sourceMode)) throw new Error('sourceMode must be repository or focused-inline');

  const task = {
    version: requiredString(raw.version, 'version'),
    taskId: requiredString(raw.taskId, 'taskId'),
    repository: requiredString(raw.repository, 'repository'),
    repositoryUrl: requiredString(raw.repositoryUrl, 'repositoryUrl'),
    exactBaseSha: requiredString(raw.exactBaseSha, 'exactBaseSha'),
    goal: requiredString(raw.goal, 'goal'),
    nonGoals: stringList(raw.nonGoals, 'nonGoals'),
    allowedPaths: stringList(raw.allowedPaths, 'allowedPaths').map((item, index) => safeExactFile(item, `allowedPaths[${index}]`)),
    contextPaths: stringList(raw.contextPaths ?? [], 'contextPaths').map((item, index) => safeExactFile(item, `contextPaths[${index}]`)),
    sourceMode,
    requestedTests: stringList(raw.requestedTests, 'requestedTests'),
    tokenBudget,
    continuationTokenBudget,
    maxContinuationAttempts,
    maxPatchBytes,
    requirePatch: raw.requirePatch !== false,
    agent: raw.agent ? requiredString(raw.agent, 'agent') : DEFAULT_AGENT,
  };

  if (!task.allowedPaths.length) throw new Error('allowedPaths must contain at least one exact file path');
  const overlap = task.contextPaths.filter((item) => task.allowedPaths.includes(item));
  if (overlap.length) throw new Error(`contextPaths must not overlap allowedPaths: ${overlap.join(', ')}`);
  if (!/^[0-9a-f]{40}$/i.test(task.exactBaseSha)) throw new Error('exactBaseSha must be a full 40-character Git SHA');
  if (!/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:\.git)?$/.test(task.repositoryUrl)) {
    throw new Error('repositoryUrl must be a public https://github.com/owner/repo URL');
  }
  return { task, absolute };
}

function policyText(task) {
  return [
    '# Severe Weather Warning bounded Antigravity worker',
    '',
    'This sandbox is disposable and is NOT repository authority.',
    'Do not change branches or Git history. Do not commit, push, merge, publish, release, deploy, or request credentials.',
    'Edit only the exact file paths listed below. Do not create handoff files.',
    ...task.allowedPaths.map((item) => `- ${item}`),
    '',
    'The host extracts only those allowlisted files and builds a candidate patch against the frozen base SHA.',
    'Anything else in the sandbox is ignored and cannot cross into GitHub.',
  ].join('\n');
}

function taskPrompt(task) {
  const focusedContext = task.sourceMode === 'focused-inline'
    ? [
        '',
        'This is a focused workspace, not a full repository clone.',
        `Editable files live under ${REPO_TARGET}.`,
        'Read-only host context is mounted under /workspace/context:',
        ...task.contextPaths.map((item) => `- /workspace/context/${item}`),
        'Do not clone, fetch, or search for another repository copy. Do not modify /workspace/context.',
      ]
    : [];
  return [
    'Execute this bounded Severe Weather Warning task now.',
    `Task ID: ${task.taskId}`,
    '',
    'Goal:', task.goal,
    '',
    'Exact files you may edit:', ...task.allowedPaths.map((item) => `- ${item}`),
    ...focusedContext,
    '',
    'Non-goals:', ...task.nonGoals.map((item) => `- ${item}`),
    '',
    'Requested checks:', ...task.requestedTests.map((item) => `- ${item}`),
    '',
    'Do not spend time changing Git branches or matching the host base SHA. The sandbox workspace is untrusted by design.',
    'Make the bounded file edit, run the lightweight checks, and stop. The host derives and validates the patch against the frozen base.',
  ].join('\n');
}

function baseFileText(task, relative) {
  const text = run('git', ['show', `${task.exactBaseSha}:${relative}`]);
  const bytes = Buffer.byteLength(text, 'utf8');
  if (bytes > INLINE_FILE_MAX_BYTES) throw new Error(`Focused inline source exceeds 1 MB: ${relative}`);
  return { text, bytes };
}

function buildEnvironment(task) {
  if (task.sourceMode === 'repository') {
    return {
      environment: {
        type: 'remote',
        sources: [
          { type: 'repository', source: task.repositoryUrl, target: REPO_TARGET },
          { type: 'inline', target: `${REPO_TARGET}/.agents/AGENTS.md`, content: policyText(task) },
        ],
        network: { allowlist: [{ domain: 'github.com' }] },
      },
      manifest: { sourceMode: 'repository', mountedBaseFiles: [], inlineBytes: Buffer.byteLength(policyText(task), 'utf8'), networkMode: 'github-only' },
    };
  }

  const sources = [];
  const mountedBaseFiles = [];
  let inlineBytes = 0;
  const addInline = (target, content, label) => {
    const bytes = Buffer.byteLength(content, 'utf8');
    if (bytes > INLINE_FILE_MAX_BYTES) throw new Error(`Focused inline source exceeds 1 MB: ${label}`);
    inlineBytes += bytes;
    if (inlineBytes > INLINE_TOTAL_MAX_BYTES) throw new Error('Focused inline sources exceed 2 MB total');
    sources.push({ type: 'inline', target, content });
  };

  for (const relative of task.allowedPaths) {
    const source = baseFileText(task, relative);
    addInline(`${REPO_TARGET}/${relative}`, source.text, relative);
    mountedBaseFiles.push(relative);
  }
  for (const relative of task.contextPaths) {
    const source = baseFileText(task, relative);
    addInline(`/workspace/context/${relative}`, source.text, relative);
    mountedBaseFiles.push(relative);
  }
  addInline(`${REPO_TARGET}/.agents/AGENTS.md`, policyText(task), '.agents/AGENTS.md');

  return {
    environment: { type: 'remote', sources, network: 'disabled' },
    manifest: { sourceMode: 'focused-inline', mountedBaseFiles, inlineBytes, networkMode: 'disabled' },
  };
}

function requestBody(task) {
  const { environment } = buildEnvironment(task);
  return {
    agent: task.agent,
    input: taskPrompt(task),
    environment,
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: { type: 'antigravity', max_total_tokens: task.tokenBudget },
  };
}

function drySummary(task, taskFile) {
  const sourceManifest = buildEnvironment(task).manifest;
  return {
    version: 'SW_OPS_002_SIMPLE_WORKER_REQUEST_V1',
    dryRun: true,
    taskFile,
    taskId: task.taskId,
    patchBaseSha: task.exactBaseSha,
    repositoryUrl: task.repositoryUrl,
    repositoryTarget: REPO_TARGET,
    allowedPaths: task.allowedPaths,
    contextPaths: task.contextPaths,
    sourceMode: task.sourceMode,
    sourceManifest,
    tokenBudget: task.tokenBudget,
    continuationTokenBudget: task.continuationTokenBudget,
    maxContinuationAttempts: task.maxContinuationAttempts,
    maxPatchBytes: task.maxPatchBytes,
    sandboxTrust: 'untrusted',
    returnChannel: 'allowlisted-files-to-host-derived-patch',
    githubWriteAuthority: false,
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
  try { payload = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Gemini API returned non-JSON HTTP ${response.status}`); }
  if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}: ${payload?.error?.message || 'request failed'}`);
  return payload;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pollInteraction(interaction) {
  const id = requiredString(interaction.id, 'interaction.id');
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error(`Antigravity interaction ${id} exceeded local poll ceiling`);
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${INTERACTIONS_URL}/${encodeURIComponent(id)}`);
  }
  requiredString(interaction.environment_id, 'interaction.environment_id');
  return interaction;
}

function interactionEvidence(interaction) {
  const used = Number(interaction?.usage?.total_tokens);
  return {
    id: requiredString(interaction.id, 'interaction.id'),
    status: requiredString(interaction.status, 'interaction.status'),
    totalTokens: Number.isFinite(used) ? used : null,
  };
}

async function runInteraction(task, body) {
  let interaction = await pollInteraction(await apiJson('POST', INTERACTIONS_URL, body));
  const rootEnvironmentId = requiredString(interaction.environment_id, 'interaction.environment_id');
  const interactionChain = [interactionEvidence(interaction)];
  let continuationCount = 0;

  while (interaction.status === 'incomplete' && continuationCount < task.maxContinuationAttempts) {
    const previousInteractionId = requiredString(interaction.id, 'interaction.id');
    const environmentId = requiredString(interaction.environment_id, 'interaction.environment_id');
    if (environmentId !== rootEnvironmentId) throw new Error('Antigravity environment changed before continuation');
    const continuationBody = {
      agent: task.agent,
      input: 'continue',
      previous_interaction_id: previousInteractionId,
      environment: environmentId,
      store: true,
      agent_config: { type: 'antigravity', max_total_tokens: task.continuationTokenBudget },
    };
    interaction = await pollInteraction(await apiJson('POST', INTERACTIONS_URL, continuationBody));
    continuationCount += 1;
    if (interaction.environment_id !== rootEnvironmentId) throw new Error('Antigravity environment changed across continuation');
    interactionChain.push(interactionEvidence(interaction));
  }

  if (interaction.status !== 'completed') {
    const detail = interactionChain.map((item) => `${item.status}${item.totalTokens === null ? '' : `:${item.totalTokens}`}`).join(' -> ');
    throw new Error(`Antigravity task did not complete after ${continuationCount} continuation(s): ${detail}`);
  }

  return {
    interaction,
    rootInteractionId: interactionChain[0].id,
    interactionChain,
    continuationCount,
  };
}

async function downloadSnapshot(environmentId, tarPath) {
  const url = `${FILES_URL}/environment-${encodeURIComponent(environmentId)}:download?alt=media`;
  let lastError;
  for (let attempt = 1; attempt <= SNAPSHOT_RETRIES; attempt += 1) {
    const response = await fetch(url, { headers: { 'x-goog-api-key': apiKey() }, redirect: 'follow' });
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('Environment snapshot was empty');
      await writeFile(tarPath, bytes);
      return attempt;
    }
    const text = await response.text().catch(() => '');
    lastError = new Error(`Environment snapshot HTTP ${response.status}: ${text.slice(0, 160)}`);
    if (![404, 409, 429, 500, 502, 503, 504].includes(response.status) || attempt === SNAPSHOT_RETRIES) break;
    await sleep(SNAPSHOT_RETRY_MS);
  }
  throw lastError || new Error('Environment snapshot download failed');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || '').trim().slice(0, 500);
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return String(result.stdout || '');
}

const EXTRACT_ALLOWED_SCRIPT = String.raw`
import json, os, shutil, sys, tarfile

archive, output_dir, allowed_json = sys.argv[1:4]
allowed = set(json.loads(allowed_json))
found = {}
os.makedirs(output_dir, exist_ok=True)

def norm(name):
    while name.startswith('./'):
        name = name[2:]
    return name

with tarfile.open(archive, 'r:*') as tf:
    for member in tf.getmembers():
        name = norm(member.name)
        marker = 'workspace/repo/'
        index = name.find(marker)
        if index < 0:
            continue
        rel = name[index + len(marker):]
        if rel not in allowed:
            continue
        if rel in found:
            raise RuntimeError('duplicate allowlisted path in snapshot: ' + rel)
        if not member.isreg():
            raise RuntimeError('allowlisted snapshot path is not a regular file: ' + rel)
        src = tf.extractfile(member)
        if src is None:
            raise RuntimeError('allowlisted snapshot file has no payload: ' + rel)
        target = os.path.join(output_dir, *rel.split('/'))
        os.makedirs(os.path.dirname(target), exist_ok=True)
        with src, open(target, 'wb') as out:
            shutil.copyfileobj(src, out)
        found[rel] = True

print(json.dumps({'present': sorted(found.keys()), 'absent': sorted(allowed - set(found.keys()))}, separators=(',', ':')))
`;

function patchPaths(patch) {
  const paths = [];
  for (const line of patch.split(/\r?\n/)) {
    const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
    if (!match) continue;
    if (match[1] !== match[2]) throw new Error(`Renames are not accepted: ${match[1]} -> ${match[2]}`);
    const candidate = safeExactFile(match[2], 'patch path');
    if (!paths.includes(candidate)) paths.push(candidate);
  }
  return paths;
}

function validatePatch(task, patch) {
  const bytes = Buffer.byteLength(patch, 'utf8');
  if (bytes > task.maxPatchBytes) throw new Error(`Patch exceeds ${task.maxPatchBytes} byte limit`);
  if (/^deleted file mode /m.test(patch) || /^\+\+\+ \/dev\/null$/m.test(patch)) {
    throw new Error('File deletions are not accepted by SW-OPS-002');
  }
  const paths = patchPaths(patch);
  if (task.requirePatch && !paths.length) throw new Error('Sandbox produced no allowlisted patch');
  for (const candidate of paths) {
    if (!task.allowedPaths.includes(candidate)) throw new Error(`Patch path outside allowlist: ${candidate}`);
  }
  return { bytes, paths };
}

async function derivePatch(task, interactionRun, outputDir) {
  const { interaction, rootInteractionId, interactionChain, continuationCount } = interactionRun;
  const environmentId = requiredString(interaction.environment_id, 'interaction.environment_id');
  const dir = path.resolve(process.cwd(), requiredString(outputDir, '--output-dir'));
  await mkdir(dir, { recursive: true });
  const scratch = await mkdtemp(path.join(os.tmpdir(), 'sw-ops-002-simple-'));
  const tarPath = path.join(scratch, 'environment.tar');
  const candidateDir = path.join(scratch, 'candidate');
  const baseWorktree = path.join(scratch, 'base');
  let worktreeAdded = false;

  try {
    const snapshotAttempts = await downloadSnapshot(environmentId, tarPath);
    await mkdir(candidateDir, { recursive: true });
    const extraction = JSON.parse(run('python3', ['-c', EXTRACT_ALLOWED_SCRIPT, tarPath, candidateDir, JSON.stringify(task.allowedPaths)]) || '{}');
    if (!Array.isArray(extraction.absent)) throw new Error('Antigravity snapshot extraction did not report absent allowlisted files');
    if (extraction.absent.length) {
      throw new Error(`Antigravity snapshot missing allowlisted file(s): ${extraction.absent.join(', ')}. File deletions are not supported by SW-OPS-002.`);
    }

    run('git', ['worktree', 'add', '--detach', baseWorktree, task.exactBaseSha]);
    worktreeAdded = true;

    for (const relative of task.allowedPaths) {
      const source = path.join(candidateDir, ...relative.split('/'));
      const target = path.join(baseWorktree, ...relative.split('/'));
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }

    for (const relative of task.allowedPaths) {
      const tracked = spawnSync('git', ['-C', baseWorktree, 'ls-files', '--error-unmatch', '--', relative], { encoding: 'utf8' });
      if (tracked.status !== 0) run('git', ['-C', baseWorktree, 'add', '-N', '--', relative]);
    }

    run('git', ['-C', baseWorktree, 'diff', '--check']);
    const patch = run('git', ['-C', baseWorktree, 'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD', '--', ...task.allowedPaths]);
    const checked = validatePatch(task, patch);

    const result = {
      version: 'SW_ANTIGRAVITY_SIMPLE_RESULT_V1',
      status: 'quarantined-patch-ready',
      taskId: task.taskId,
      patchBaseSha: task.exactBaseSha,
      rootInteractionId,
      interactionId: interaction.id,
      interactionIds: interactionChain.map((item) => item.id),
      interactionChain,
      continuationCount,
      continuationLimit: task.maxContinuationAttempts,
      continuationTokenBudget: task.continuationTokenBudget,
      environmentId,
      interactionStatus: interaction.status,
      sourceMode: task.sourceMode,
      changedFiles: checked.paths,
      patchBytes: checked.bytes,
      snapshotAttempts,
      sandboxTrust: 'untrusted',
      githubWriteAuthority: false,
      nextAction: 'Host must independently apply-check this patch against patchBaseSha before any GitHub write.',
    };

    await writeFile(path.join(dir, 'worker.patch'), patch, 'utf8');
    await writeFile(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    console.log(`SW-OPS-002 candidate patch: ${checked.paths.length} path(s), ${checked.bytes} bytes, ${continuationCount} continuation(s)`);
  } finally {
    if (worktreeAdded) spawnSync('git', ['worktree', 'remove', '--force', baseWorktree], { cwd: process.cwd(), encoding: 'utf8' });
    await rm(scratch, { recursive: true, force: true });
  }
}

async function execute(options) {
  const { task, absolute } = await loadTask(options.task);
  if (options.dryRun) {
    const dir = options['output-dir'];
    const summary = drySummary(task, path.relative(process.cwd(), absolute));
    if (!dir) return console.log(JSON.stringify(summary, null, 2));
    await mkdir(path.resolve(process.cwd(), dir), { recursive: true });
    await writeFile(path.join(path.resolve(process.cwd(), dir), 'request.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    return;
  }
  const interactionRun = await runInteraction(task, requestBody(task));
  await derivePatch(task, interactionRun, options['output-dir']);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help') return usage();
  if (command === 'execute') return execute(options);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[SW-OPS-002] ${error.message}`);
  process.exitCode = 1;
});
