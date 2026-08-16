#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_EXACT_BASE_BOOTSTRAP_V1]
// Infrastructure-only airlock. It never edits GitHub and never accepts a repository patch.

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const INTERACTIONS_URL = `${API_ROOT}/interactions`;
const ENVIRONMENTS_URL = `${API_ROOT}/environments`;
const FILES_URL = `${API_ROOT}/files`;
const REPO_TARGET = '/workspace/repo';
const POLL_MS = 3000;
const POLL_CEILING_MS = 4 * 60 * 1000;
const SNAPSHOT_RETRIES = 6;
const SNAPSHOT_RETRY_MS = 3000;

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
    options[token.slice(2)] = value;
  }
  return options;
}

async function loadTask(inputPath) {
  const absolute = path.resolve(process.cwd(), requiredString(inputPath, '--task'));
  const raw = JSON.parse(await readFile(absolute, 'utf8'));
  const task = {
    taskId: requiredString(raw.taskId, 'taskId'),
    repositoryUrl: requiredString(raw.repositoryUrl, 'repositoryUrl'),
    exactBaseRef: requiredString(raw.exactBaseRef, 'exactBaseRef'),
    exactBaseSha: requiredString(raw.exactBaseSha, 'exactBaseSha'),
    tokenBudget: Number(raw.tokenBudget),
    agent: requiredString(raw.agent, 'agent'),
  };
  if (!/^[0-9a-f]{40}$/i.test(task.exactBaseSha)) throw new Error('exactBaseSha must be a full Git SHA');
  if (!/^agent\/[A-Za-z0-9._/-]+$/.test(task.exactBaseRef)) throw new Error('exactBaseRef must be an agent/* branch');
  if (!Number.isInteger(task.tokenBudget) || task.tokenBudget < 1 || task.tokenBudget > 4000) {
    throw new Error('bootstrap tokenBudget must be an integer no greater than 4000');
  }
  if (task.repositoryUrl !== 'https://github.com/lybyerc-lab/Severe-Warning') throw new Error('bootstrap repository URL changed');
  return task;
}

function hookConfig() {
  return {
    'exact-base-airlock': {
      enabled: true,
      pre_tool_execution: [
        {
          matcher: '.*',
          hooks: [
            {
              type: 'command',
              command: 'python3 /.agents/hooks-scripts/exact_base_gate.py',
              timeout: 25,
            },
          ],
        },
      ],
    },
  };
}

function hookScript(task) {
  const repositoryUrl = JSON.stringify(task.repositoryUrl);
  const exactBaseRef = JSON.stringify(task.exactBaseRef);
  const exactBaseSha = JSON.stringify(task.exactBaseSha);
  return `#!/usr/bin/env python3
import json
import subprocess
import sys

REPO = ${JSON.stringify(REPO_TARGET)}
EXPECTED_REPO = ${repositoryUrl}
EXPECTED_REF = ${exactBaseRef}
EXPECTED_SHA = ${exactBaseSha}

def respond(decision, reason=None):
    payload = {"decision": decision}
    if reason:
        payload["reason"] = reason
    print(json.dumps(payload))
    sys.exit(0)

def git(*args):
    p = subprocess.run(
        ["git", "-C", REPO, *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=20,
    )
    if p.returncode != 0:
        raise RuntimeError("git command failed")
    return p.stdout.strip()

try:
    json.load(sys.stdin)
    remote = git("remote", "get-url", "origin")
    if remote.endswith(".git"):
        remote = remote[:-4]
    if remote != EXPECTED_REPO:
        respond("deny", "Exact-base airlock rejected unexpected repository origin.")

    head = git("rev-parse", "HEAD")
    if head != EXPECTED_SHA:
        if git("status", "--porcelain"):
            respond("deny", "Exact-base airlock found a dirty repository before normalization.")
        git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)
        fetched = git("rev-parse", "FETCH_HEAD")
        if fetched != EXPECTED_SHA:
            respond("deny", "Exact-base ref no longer resolves to the frozen SHA.")
        git("checkout", "--detach", EXPECTED_SHA)
        head = git("rev-parse", "HEAD")

    if head != EXPECTED_SHA:
        respond("deny", "Exact-base airlock could not establish the frozen SHA.")
    respond("allow")
except Exception:
    respond("deny", "Exact-base airlock failed closed before tool execution.")
`;
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

async function runInteraction(task) {
  const body = {
    agent: task.agent,
    input: `Bootstrap only. Run exactly these read-only checks, then stop:\ngit -C ${REPO_TARGET} rev-parse HEAD\ngit -C ${REPO_TARGET} status --short\nDo not edit repository files.`,
    environment: {
      type: 'remote',
      sources: [
        { type: 'repository', source: task.repositoryUrl, target: REPO_TARGET },
        { type: 'inline', target: '.agents/hooks.json', content: JSON.stringify(hookConfig(), null, 2) },
        { type: 'inline', target: '.agents/hooks-scripts/exact_base_gate.py', content: hookScript(task) },
        {
          type: 'inline',
          target: '.agents/AGENTS.md',
          content: `# SW-OPS-002 bootstrap\nRun only the requested read-only Git checks. The pre-tool airlock owns exact-base normalization. Never edit, commit, push, publish, or deploy.\n`,
        },
      ],
      network: { allowlist: [{ domain: 'github.com' }] },
    },
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: { type: 'antigravity', max_total_tokens: task.tokenBudget },
  };

  let interaction = await apiJson('POST', INTERACTIONS_URL, body);
  const id = requiredString(interaction.id, 'interaction.id');
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error('bootstrap interaction exceeded poll ceiling');
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${INTERACTIONS_URL}/${encodeURIComponent(id)}`);
  }
  if (!['completed', 'incomplete'].includes(interaction.status)) {
    throw new Error(`bootstrap interaction ended in unusable status ${interaction.status || '(missing)'}`);
  }
  requiredString(interaction.environment_id, 'interaction.environment_id');
  return interaction;
}

async function verifyEnvironment(environmentId) {
  const environment = await apiJson('GET', `${ENVIRONMENTS_URL}/${encodeURIComponent(environmentId)}`);
  const returnedId = environment.environment_id || environment.id || null;
  if (returnedId && !String(returnedId).includes(environmentId)) throw new Error('environment metadata mismatch');
}

async function downloadSnapshot(environmentId, tarPath) {
  const url = `${FILES_URL}/environment-${encodeURIComponent(environmentId)}:download?alt=media`;
  let lastError;
  for (let attempt = 1; attempt <= SNAPSHOT_RETRIES; attempt += 1) {
    const response = await fetch(url, { headers: { 'x-goog-api-key': apiKey() }, redirect: 'follow' });
    if (response.ok) {
      const bytes = Buffer.from(await response.arrayBuffer());
      if (!bytes.length) throw new Error('environment snapshot was empty');
      await writeFile(tarPath, bytes);
      return attempt;
    }
    lastError = new Error(`environment snapshot HTTP ${response.status}`);
    if (![404, 409, 429, 500, 502, 503, 504].includes(response.status) || attempt === SNAPSHOT_RETRIES) break;
    await sleep(SNAPSHOT_RETRY_MS);
  }
  throw lastError || new Error('environment snapshot download failed');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
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
    if (raw.startsWith('/') || entry.split('/').includes('..')) throw new Error(`unsafe environment snapshot entry: ${raw}`);
  }
  const verbose = run('tar', ['-tvf', tarPath]);
  for (const line of verbose.split(/\r?\n/)) {
    if (line && 'lhcbp'.includes(line[0])) throw new Error('environment snapshot contains unsupported link/device entry');
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
  if (candidates.size !== 1) throw new Error(`expected exactly one workspace/repo prefix; found ${candidates.size}`);
  return [...candidates][0];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const task = await loadTask(options.task);
  const outputDir = path.resolve(process.cwd(), requiredString(options['output-dir'], '--output-dir'));
  await mkdir(outputDir, { recursive: true });

  const interaction = await runInteraction(task);
  const environmentId = requiredString(interaction.environment_id, 'interaction.environment_id');
  await verifyEnvironment(environmentId);

  const scratch = await mkdtemp(path.join(os.tmpdir(), 'sw-ops-002-bootstrap-'));
  try {
    const tarPath = path.join(scratch, 'environment.tar');
    const snapshotRoot = path.join(scratch, 'snapshot');
    const attempts = await downloadSnapshot(environmentId, tarPath);
    const entries = tarEntries(tarPath);
    validateTar(entries, tarPath);
    const repoPrefix = findRepoPrefix(entries);
    await mkdir(snapshotRoot, { recursive: true });
    run('tar', ['--no-same-owner', '--no-same-permissions', '-xf', tarPath, '-C', snapshotRoot]);
    const snapshotRepo = path.join(snapshotRoot, repoPrefix.replace(/\/$/, ''));
    const snapshotHead = run('git', ['-C', snapshotRepo, 'rev-parse', 'HEAD']).trim();
    const status = run('git', ['-C', snapshotRepo, 'status', '--short']);
    if (snapshotHead !== task.exactBaseSha) throw new Error(`bootstrap airlock mismatch: expected ${task.exactBaseSha}, got ${snapshotHead}`);
    if (status.trim()) throw new Error('bootstrap airlock produced a dirty repository');

    await writeFile(path.join(outputDir, 'worker.patch'), '', 'utf8');
    await writeFile(path.join(outputDir, 'result.json'), `${JSON.stringify({
      version: 'SW_ANTIGRAVITY_BOOTSTRAP_RESULT_V1',
      status: 'exact-base-sandbox-ready',
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      exactBaseRef: task.exactBaseRef,
      verifiedBaseSha: snapshotHead,
      interactionStatus: interaction.status,
      changedFiles: [],
      untrackedFiles: [],
      sandboxStatus: [],
      hostChecks: ['environment verified', 'exact-base hook mounted', 'sandbox HEAD verified', 'clean working tree verified'],
      nextAction: 'Reuse this environment for the bounded edit turn; no GitHub write is authorized.',
    }, null, 2)}\n`, 'utf8');
    await writeFile(path.join(outputDir, 'envelope.json'), `${JSON.stringify({
      version: 'SW_OPS_002_ANTIGRAVITY_BOOTSTRAP_ENVELOPE_V1',
      capturedAt: new Date().toISOString(),
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      exactBaseRef: task.exactBaseRef,
      interactionId: interaction.id,
      environmentId,
      apiStatus: interaction.status,
      snapshotAttempts: attempts,
      snapshotHead,
      patchBytes: 0,
      patchPaths: [],
      returnChannel: 'host-verified-hooked-snapshot',
      quarantineStatus: 'exact-base-ready-no-patch',
    }, null, 2)}\n`, 'utf8');
    console.log(`SW-OPS-002 exact-base airlock PASS at ${snapshotHead}`);
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`[SW-OPS-002 bootstrap] ${error.message}`);
  process.exitCode = 1;
});
