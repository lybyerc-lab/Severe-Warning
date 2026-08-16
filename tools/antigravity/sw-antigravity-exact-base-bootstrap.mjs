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
const SMOKE_FIXTURE = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const INITIAL_LINE_1 = 'SW-OPS-002 sandbox worker reached';
const INITIAL_LINE_2 = 'GitHub writes remain Director-controlled';
const CORRECTED_LINE_2 = 'Director controls every GitHub write';

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
              command: 'python3 /.agents/hooks-scripts/exact_base_normalize.py',
              timeout: 25,
            },
            {
              type: 'command',
              command: 'python3 /.agents/hooks-scripts/command_gate.py',
              timeout: 10,
            },
          ],
        },
      ],
    },
  };
}

function initialEditScript(task) {
  return [
    'set -eu',
    `cd ${REPO_TARGET}`,
    `test "$(git rev-parse HEAD)" = "${task.exactBaseSha}"`,
    `test ! -e '${SMOKE_FIXTURE}'`,
    `mkdir -p '${path.posix.dirname(SMOKE_FIXTURE)}'`,
    `printf '%s\\n' '${INITIAL_LINE_1}' '${INITIAL_LINE_2}' > '${SMOKE_FIXTURE}'`,
    'git status --short',
    'git diff --check',
  ].join('\n');
}

function correctionEditScript(task) {
  return [
    'set -eu',
    `cd ${REPO_TARGET}`,
    `test "$(git rev-parse HEAD)" = "${task.exactBaseSha}"`,
    `test "$(sed -n '1p' '${SMOKE_FIXTURE}')" = '${INITIAL_LINE_1}'`,
    `printf '%s\\n' '${INITIAL_LINE_1}' '${CORRECTED_LINE_2}' > '${SMOKE_FIXTURE}'`,
    'git status --short',
    'git diff --check',
  ].join('\n');
}

function normalizerScript(task) {
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
        respond("deny", "Exact-base normalizer rejected unexpected repository origin.")

    head = git("rev-parse", "HEAD")
    if head != EXPECTED_SHA:
        if git("status", "--porcelain"):
            respond("deny", "Exact-base normalizer found a dirty repository before normalization.")
        git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)
        fetched = git("rev-parse", "FETCH_HEAD")
        if fetched != EXPECTED_SHA:
            respond("deny", "Exact-base ref no longer resolves to the frozen SHA.")
        git("checkout", "--detach", EXPECTED_SHA)
        head = git("rev-parse", "HEAD")

    if head != EXPECTED_SHA:
        respond("deny", "Exact-base normalizer could not establish the frozen SHA.")
    respond("allow")
except Exception:
    respond("deny", "Exact-base normalizer failed closed before tool execution.")
`;
}

function commandGateScript(task) {
  const initialScript = JSON.stringify(initialEditScript(task));
  const correctionScript = JSON.stringify(correctionEditScript(task));
  return `#!/usr/bin/env python3
import json
import sys

INITIAL_SCRIPT = ${initialScript}
CORRECTION_SCRIPT = ${correctionScript}
READ_ONLY_LINES = {
    "set -e",
    "set -eu",
    "set -euo pipefail",
    "cd /workspace/repo",
    "git rev-parse HEAD",
    "git status --short",
    "git diff --check",
    "git -C /workspace/repo rev-parse HEAD",
    "git -C /workspace/repo status --short",
    "git -C /workspace/repo diff --check",
}

def respond(decision, reason=None):
    payload = {"decision": decision}
    if reason:
        payload["reason"] = reason
    print(json.dumps(payload))
    sys.exit(0)

def normalize(code):
    return "\\n".join(line.strip() for line in str(code).splitlines() if line.strip())

def is_read_only(code):
    lines = [line.strip() for line in str(code).splitlines() if line.strip()]
    return bool(lines) and all(line in READ_ONLY_LINES for line in lines)

try:
    data = json.load(sys.stdin)
    tool_call = data.get("tool_call", {})
    if tool_call.get("name") != "code_execution":
        respond("deny", "SW-OPS-002 permits code_execution only.")
    code = str(tool_call.get("args", {}).get("code", ""))
    normalized = normalize(code)
    if is_read_only(code) or normalized == normalize(INITIAL_SCRIPT) or normalized == normalize(CORRECTION_SCRIPT):
        respond("allow")
    respond("deny", "SW-OPS-002 command gate blocked exploration or an unapproved command. Run exactly the Director-authorized bash script from the current prompt, or one of the tiny read-only Git checks.")
except Exception:
    respond("deny", "SW-OPS-002 command gate failed closed before tool execution.")
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

function interactionStepTypes(interaction) {
  return Array.isArray(interaction.steps)
    ? interaction.steps.map((step) => {
        if (typeof step?.type === 'string') return step.type;
        const key = Object.keys(step || {}).find((candidate) => candidate !== 'id' && candidate !== 'signature');
        return key || 'unknown';
      })
    : [];
}

async function runInteraction(task) {
  const body = {
    agent: task.agent,
    input: `Bootstrap only. Run exactly these read-only checks using code_execution, then stop:\ngit -C ${REPO_TARGET} rev-parse HEAD\ngit -C ${REPO_TARGET} status --short\nDo not edit repository files during this bootstrap turn.`,
    environment: {
      type: 'remote',
      sources: [
        { type: 'repository', source: task.repositoryUrl, target: REPO_TARGET },
        { type: 'inline', target: '.agents/hooks.json', content: JSON.stringify(hookConfig(), null, 2) },
        { type: 'inline', target: '.agents/hooks-scripts/exact_base_normalize.py', content: normalizerScript(task) },
        { type: 'inline', target: '.agents/hooks-scripts/command_gate.py', content: commandGateScript(task) },
        {
          type: 'inline',
          target: '.agents/AGENTS.md',
          content: `# SW-OPS-002 sandbox policy\nBootstrap turn: perform only the requested read-only Git checks and do not edit repository files.\nLater Director-authorized turns: the command gate permits only one exact initial smoke edit script, one exact correction script, or tiny read-only Git checks.\nOnly ${SMOKE_FIXTURE} may ever be edited by those scripts. Never edit any other repository path.\nNever alter .git configuration/history. Never commit, push, open a PR, merge, publish, release, deploy, or request/use GitHub credentials.\nThe host independently derives and validates every patch before any GitHub write is considered.\n`,
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
  console.log(`[SW-OPS-002 bootstrap] interaction status=${interaction.status}; stepTypes=${JSON.stringify(interactionStepTypes(interaction))}`);
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
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || '').trim().slice(0, 500);
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return String(result.stdout || '');
}

const TAR_MANIFEST_SCRIPT = String.raw`
import json, sys, tarfile

def norm(name):
    while name.startswith('./'):
        name = name[2:]
    return name

out = []
with tarfile.open(sys.argv[1], 'r:*') as tf:
    for m in tf.getmembers():
        name = norm(m.name)
        if m.isreg(): kind = 'file'
        elif m.isdir(): kind = 'dir'
        elif m.issym(): kind = 'symlink'
        elif m.islnk(): kind = 'hardlink'
        else: kind = 'other'
        out.append({'name': name, 'kind': kind, 'linkname': m.linkname if kind in ('symlink','hardlink') else ''})
print(json.dumps(out, separators=(',', ':')))
`;

function tarManifest(tarPath) {
  return JSON.parse(run('python3', ['-c', TAR_MANIFEST_SCRIPT, tarPath]));
}

function validateMemberName(name) {
  if (!name || name.startsWith('/') || name.split('/').includes('..')) {
    throw new Error(`unsafe environment snapshot entry: ${String(name).slice(0, 180)}`);
  }
}

function findRepoPrefix(manifest) {
  const candidates = new Set();
  for (const member of manifest) {
    validateMemberName(member.name);
    const marker = 'workspace/repo/';
    const index = member.name.indexOf(marker);
    if (index >= 0) candidates.add(member.name.slice(0, index) + marker);
    if (member.name === 'workspace/repo') candidates.add('workspace/repo/');
  }
  if (candidates.size !== 1) throw new Error(`expected exactly one workspace/repo prefix; found ${candidates.size}`);
  return [...candidates][0];
}

const MATERIALIZE_REPO_SCRIPT = String.raw`
import json, os, shutil, sys, tarfile

archive, prefix, dest = sys.argv[1:4]
if not prefix.endswith('/'):
    prefix += '/'

skipped_git_links = []

def norm(name):
    while name.startswith('./'):
        name = name[2:]
    return name

def safe_rel(name):
    if name.startswith('/'):
        raise RuntimeError('absolute archive member')
    rel = name[len(prefix):] if name.startswith(prefix) else ''
    rel = rel.lstrip('/')
    parts = [p for p in rel.split('/') if p not in ('', '.')]
    if '..' in parts:
        raise RuntimeError('archive traversal member')
    return '/'.join(parts)

with tarfile.open(archive, 'r:*') as tf:
    for m in tf.getmembers():
        name = norm(m.name)
        if name == prefix.rstrip('/'):
            continue
        if not name.startswith(prefix):
            continue
        rel = safe_rel(name)
        if not rel:
            continue
        inside_git = rel == '.git' or rel.startswith('.git/')
        if m.issym() or m.islnk() or m.isdev():
            if inside_git:
                skipped_git_links.append(rel)
                continue
            raise RuntimeError('non-regular repository member outside .git: ' + rel[:180])
        target = os.path.abspath(os.path.join(dest, *rel.split('/')))
        root = os.path.abspath(dest) + os.sep
        if not (target + os.sep).startswith(root):
            raise RuntimeError('repository extraction escaped destination')
        if m.isdir():
            os.makedirs(target, exist_ok=True)
            continue
        if not m.isreg():
            if inside_git:
                continue
            raise RuntimeError('unsupported repository member outside .git: ' + rel[:180])
        os.makedirs(os.path.dirname(target), exist_ok=True)
        src = tf.extractfile(m)
        if src is None:
            raise RuntimeError('regular archive member had no payload')
        with src, open(target, 'wb') as out:
            shutil.copyfileobj(src, out)
        os.chmod(target, m.mode & 0o777)

print(json.dumps({'skippedGitLinkCount': len(skipped_git_links), 'skippedGitLinks': skipped_git_links[:12]}, separators=(',', ':')))
`;

function materializeRepo(tarPath, repoPrefix, snapshotRepo) {
  const raw = run('python3', ['-c', MATERIALIZE_REPO_SCRIPT, tarPath, repoPrefix, snapshotRepo]);
  return JSON.parse(raw || '{}');
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
    const snapshotRepo = path.join(scratch, 'snapshot-repo');
    const attempts = await downloadSnapshot(environmentId, tarPath);
    const manifest = tarManifest(tarPath);
    const repoPrefix = findRepoPrefix(manifest);
    await mkdir(snapshotRepo, { recursive: true });
    const materialized = materializeRepo(tarPath, repoPrefix, snapshotRepo);
    console.log(`[SW-OPS-002 bootstrap] materialized regular repo entries; skippedGitLinkCount=${materialized.skippedGitLinkCount || 0}`);
    if (Array.isArray(materialized.skippedGitLinks) && materialized.skippedGitLinks.length) {
      console.log(`[SW-OPS-002 bootstrap] skipped .git link paths=${JSON.stringify(materialized.skippedGitLinks)}`);
    }

    const snapshotHead = run('git', ['-C', snapshotRepo, 'rev-parse', 'HEAD']).trim();
    const status = run('git', ['-C', snapshotRepo, 'status', '--short']);
    if (snapshotHead !== task.exactBaseSha) throw new Error(`bootstrap airlock mismatch: expected ${task.exactBaseSha}, got ${snapshotHead}`);
    if (status.trim()) throw new Error(`bootstrap airlock produced a dirty repository: ${status.trim().slice(0, 300)}`);

    await writeFile(path.join(outputDir, 'worker.patch'), '', 'utf8');
    await writeFile(path.join(outputDir, 'result.json'), `${JSON.stringify({
      version: 'SW_ANTIGRAVITY_BOOTSTRAP_RESULT_V1',
      status: 'exact-base-sandbox-ready',
      taskId: task.taskId,
      exactBaseSha: task.exactBaseSha,
      exactBaseRef: task.exactBaseRef,
      verifiedBaseSha: snapshotHead,
      interactionStatus: interaction.status,
      interactionStepTypes: interactionStepTypes(interaction),
      changedFiles: [],
      untrackedFiles: [],
      sandboxStatus: [],
      skippedGitLinkCount: materialized.skippedGitLinkCount || 0,
      hostChecks: ['environment verified', 'exact-base normalizer mounted', 'separate command gate mounted', 'archive links not followed', 'sandbox HEAD verified', 'clean working tree verified'],
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
