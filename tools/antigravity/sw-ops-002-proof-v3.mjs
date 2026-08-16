#!/usr/bin/env node

// [SW:OPS:002:PROOF_V3]
// Stage-gated Antigravity proof. The host pre-mounts every permitted script once,
// then later interactions reuse the same environment ID without source updates.

import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta';
const INTERACTIONS_URL = `${API_ROOT}/interactions`;
const ENVIRONMENTS_URL = `${API_ROOT}/environments`;
const FILES_URL = `${API_ROOT}/files`;
const AGENT = 'antigravity-preview-05-2026';
const REPOSITORY_URL = 'https://github.com/lybyerc-lab/Severe-Warning';
const REPO_TARGET = '/workspace/repo';
const EXACT_BASE_REF = 'agent/sw-ops-001-antigravity-bridge';
const EXACT_BASE_SHA = '10ccd2723b8fa6b925f47629491a9e51e6388500';
const FIXTURE = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const STAGE_PATH = '/.agents/sw-ops-002-stage';
const INITIAL_TEXT = 'SW-OPS-002 sandbox worker reached\nGitHub writes remain Director-controlled\n';
const CORRECTED_TEXT = 'SW-OPS-002 sandbox worker reached\nDirector controls every GitHub write\n';
const POLL_MS = 3000;
const POLL_CEILING_MS = 5 * 60 * 1000;
const SNAPSHOT_RETRIES = 6;
const SNAPSHOT_RETRY_MS = 3000;
const MAX_PATCH_BYTES = 10000;

function usage() {
  console.log('Usage: node tools/antigravity/sw-ops-002-proof-v3.mjs [--dry-run] --output-dir <dir>');
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--dry-run') { options.dryRun = true; continue; }
    if (token === '--help') { options.help = true; continue; }
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`);
    const value = argv[++i];
    if (!value || value.startsWith('--')) throw new Error(`${token} requires a value`);
    options[token.slice(2)] = value;
  }
  return options;
}

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be a non-empty string`);
  return value.trim();
}

function hash(text) {
  return createHash('sha256').update(text).digest('hex');
}

function apiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  return key;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = String(result.stderr || result.stdout || '').trim().slice(0, 800);
    throw new Error(`${command} ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`);
  }
  return String(result.stdout || '');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function apiJson(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey(),
      'Api-Revision': '2026-05-20',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : {}; }
  catch { throw new Error(`Gemini API returned non-JSON HTTP ${response.status}`); }
  if (!response.ok) throw new Error(`Gemini API HTTP ${response.status}: ${payload?.error?.message || 'request failed'}`);
  return payload;
}

async function runInteraction(body, label) {
  let interaction = await apiJson('POST', INTERACTIONS_URL, body);
  const id = required(interaction.id, `${label}.interaction.id`);
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error(`${label} interaction exceeded poll ceiling`);
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${INTERACTIONS_URL}/${encodeURIComponent(id)}`);
  }
  if (!['completed', 'incomplete'].includes(interaction.status)) {
    throw new Error(`${label} interaction ended in unusable status ${interaction.status || '(missing)'}`);
  }
  required(interaction.environment_id, `${label}.interaction.environment_id`);
  return interaction;
}

function normalizerScript() {
  return `#!/usr/bin/env python3
import json
import subprocess
import sys

REPO = ${JSON.stringify(REPO_TARGET)}
EXPECTED_REPO = ${JSON.stringify(REPOSITORY_URL)}
EXPECTED_REF = ${JSON.stringify(EXACT_BASE_REF)}
EXPECTED_SHA = ${JSON.stringify(EXACT_BASE_SHA)}

def respond(decision, reason=None):
    payload = {"decision": decision}
    if reason:
        payload["reason"] = reason
    print(json.dumps(payload))
    sys.exit(0)

def git(*args):
    p = subprocess.run(["git", "-C", REPO, *args], text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=20)
    if p.returncode != 0:
        raise RuntimeError("git command failed")
    return p.stdout.strip()

try:
    json.load(sys.stdin)
    remote = git("remote", "get-url", "origin")
    if remote.endswith(".git"):
        remote = remote[:-4]
    if remote != EXPECTED_REPO:
        respond("deny", "Unexpected repository origin.")
    head = git("rev-parse", "HEAD")
    if head != EXPECTED_SHA:
        if git("status", "--porcelain"):
            respond("deny", "Repository was dirty before exact-base normalization.")
        git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)
        if git("rev-parse", "FETCH_HEAD") != EXPECTED_SHA:
            respond("deny", "Frozen base ref no longer resolves to the expected SHA.")
        git("checkout", "--detach", EXPECTED_SHA)
        head = git("rev-parse", "HEAD")
    if head != EXPECTED_SHA:
        respond("deny", "Could not establish frozen base SHA.")
    respond("allow")
except Exception:
    respond("deny", "Exact-base normalizer failed closed.")
`;
}

function stageGateScript() {
  return `#!/usr/bin/env python3
import json
import os
import sys

STAGE_PATH = ${JSON.stringify(STAGE_PATH)}
COMMANDS = {
    "bootstrap": "bash /.agents/bootstrap-command.sh",
    "initial-ready": "bash /.agents/initial-command.sh",
    "correction-ready": "bash /.agents/correction-command.sh",
}

def respond(decision, reason=None):
    payload = {"decision": decision}
    if reason:
        payload["reason"] = reason
    print(json.dumps(payload))
    sys.exit(0)

def normalize(code):
    return "\\n".join(line.strip() for line in str(code).splitlines() if line.strip())

def stage():
    if not os.path.exists(STAGE_PATH):
        return "bootstrap"
    with open(STAGE_PATH, "r", encoding="utf-8") as f:
        value = f.read().strip()
    return value or "bootstrap"

try:
    data = json.load(sys.stdin)
    call = data.get("tool_call", {})
    if call.get("name") != "code_execution":
        respond("deny", "SW-OPS-002 permits code_execution only.")
    current = stage()
    expected = COMMANDS.get(current)
    if not expected:
        respond("deny", "SW-OPS-002 stage is complete; no further tool call is authorized.")
    code = normalize(call.get("args", {}).get("code", ""))
    allowed = {
        expected,
        "set -e\\n" + expected,
        "set -eu\\n" + expected,
        "set -euo pipefail\\n" + expected,
    }
    if code in allowed:
        respond("allow")
    respond("deny", "Run exactly the command named for the current SW-OPS-002 stage. Repository exploration is not authorized.")
except Exception:
    respond("deny", "SW-OPS-002 stage gate failed closed.")
`;
}

function bootstrapCommand() {
  return [
    '#!/usr/bin/env bash',
    'set -eu',
    `cd ${REPO_TARGET}`,
    `test "$(git rev-parse HEAD)" = "${EXACT_BASE_SHA}"`,
    'test -z "$(git status --short)"',
    `printf '%s\\n' 'initial-ready' > '${STAGE_PATH}'`,
    '',
  ].join('\n');
}

function initialCommand() {
  return [
    '#!/usr/bin/env bash',
    'set -eu',
    `cd ${REPO_TARGET}`,
    `test "$(cat '${STAGE_PATH}')" = 'initial-ready'`,
    `test "$(git rev-parse HEAD)" = "${EXACT_BASE_SHA}"`,
    `test ! -e '${FIXTURE}'`,
    `mkdir -p '${path.posix.dirname(FIXTURE)}'`,
    `printf '%s\\n' 'SW-OPS-002 sandbox worker reached' 'GitHub writes remain Director-controlled' > '${FIXTURE}'`,
    'git status --short',
    'git diff --check',
    `printf '%s\\n' 'correction-ready' > '${STAGE_PATH}'`,
    '',
  ].join('\n');
}

function correctionCommand() {
  return [
    '#!/usr/bin/env bash',
    'set -eu',
    `cd ${REPO_TARGET}`,
    `test "$(cat '${STAGE_PATH}')" = 'correction-ready'`,
    `test "$(git rev-parse HEAD)" = "${EXACT_BASE_SHA}"`,
    `test "$(sed -n '1p' '${FIXTURE}')" = 'SW-OPS-002 sandbox worker reached'`,
    `test "$(sed -n '2p' '${FIXTURE}')" = 'GitHub writes remain Director-controlled'`,
    `test "$(wc -l < '${FIXTURE}' | tr -d ' ')" = '2'`,
    `printf '%s\\n' 'SW-OPS-002 sandbox worker reached' 'Director controls every GitHub write' > '${FIXTURE}'`,
    'git status --short',
    'git diff --check',
    `printf '%s\\n' 'done' > '${STAGE_PATH}'`,
    '',
  ].join('\n');
}

function hookConfig() {
  return {
    'sw-ops-002-exact-base': {
      enabled: true,
      pre_tool_execution: [
        {
          matcher: '.*',
          hooks: [
            { type: 'command', command: 'python3 /.agents/hooks-scripts/exact_base_normalize.py', timeout: 25 },
            { type: 'command', command: 'python3 /.agents/hooks-scripts/stage_gate.py', timeout: 10 },
          ],
        },
      ],
    },
  };
}

function initialEnvironment() {
  return {
    type: 'remote',
    sources: [
      { type: 'repository', source: REPOSITORY_URL, target: REPO_TARGET },
      { type: 'inline', target: '.agents/hooks.json', content: JSON.stringify(hookConfig(), null, 2) },
      { type: 'inline', target: '.agents/hooks-scripts/exact_base_normalize.py', content: normalizerScript() },
      { type: 'inline', target: '.agents/hooks-scripts/stage_gate.py', content: stageGateScript() },
      { type: 'inline', target: '.agents/bootstrap-command.sh', content: bootstrapCommand() },
      { type: 'inline', target: '.agents/initial-command.sh', content: initialCommand() },
      { type: 'inline', target: '.agents/correction-command.sh', content: correctionCommand() },
      {
        type: 'inline',
        target: '.agents/AGENTS.md',
        content: '# SW-OPS-002 stage-gated sandbox\nUse exactly one code_execution call per interaction, with the command explicitly named in the Director prompt. Do not inspect or explore the repository. Never commit, push, merge, publish, release, deploy, or request GitHub credentials.\n',
      },
    ],
    network: { allowlist: [{ domain: 'github.com' }] },
  };
}

function bootstrapRequest() {
  return {
    agent: AGENT,
    input: 'Make exactly one code_execution call containing: bash /.agents/bootstrap-command.sh. After that call, stop.',
    environment: initialEnvironment(),
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: { type: 'antigravity', max_total_tokens: 4000 },
  };
}

function reuseRequest(environmentId, command, label) {
  return {
    agent: AGENT,
    input: `Make exactly one code_execution call containing: ${command}. After that call, stop. This is the ${label} stage.`,
    environment: environmentId,
    store: true,
    tools: [{ type: 'code_execution' }],
    agent_config: { type: 'antigravity', max_total_tokens: 6000 },
  };
}

async function verifyEnvironment(environmentId) {
  const env = await apiJson('GET', `${ENVIRONMENTS_URL}/${encodeURIComponent(environmentId)}`);
  const returned = env.environment_id || env.id || '';
  if (returned && !String(returned).includes(environmentId)) throw new Error('environment metadata mismatch');
  return env;
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
    const text = await response.text().catch(() => '');
    lastError = new Error(`environment snapshot HTTP ${response.status}: ${text.slice(0, 200)}`);
    if (![404, 409, 429, 500, 502, 503, 504].includes(response.status) || attempt === SNAPSHOT_RETRIES) break;
    await sleep(SNAPSHOT_RETRY_MS);
  }
  throw lastError || new Error('environment snapshot download failed');
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
        out.append({'name': name, 'kind': kind})
print(json.dumps(out, separators=(',', ':')))
`;

const MATERIALIZE_REPO_SCRIPT = String.raw`
import json, os, shutil, sys, tarfile
archive, prefix, dest = sys.argv[1:4]
if not prefix.endswith('/'):
    prefix += '/'
skipped = []

def norm(name):
    while name.startswith('./'):
        name = name[2:]
    return name

def safe_rel(name):
    rel = name[len(prefix):].lstrip('/')
    parts = [p for p in rel.split('/') if p not in ('', '.')]
    if '..' in parts:
        raise RuntimeError('archive traversal member')
    return '/'.join(parts)

with tarfile.open(archive, 'r:*') as tf:
    for m in tf.getmembers():
        name = norm(m.name)
        if name == prefix.rstrip('/') or not name.startswith(prefix):
            continue
        rel = safe_rel(name)
        if not rel:
            continue
        inside_git = rel == '.git' or rel.startswith('.git/')
        if m.issym() or m.islnk() or m.isdev():
            if inside_git:
                skipped.append(rel)
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
print(json.dumps({'skippedGitEntryCount': len(skipped)}, separators=(',', ':')))
`;

const READ_STAGE_SCRIPT = String.raw`
import sys, tarfile

def norm(name):
    while name.startswith('./'):
        name = name[2:]
    return name

matches = []
with tarfile.open(sys.argv[1], 'r:*') as tf:
    for m in tf.getmembers():
        name = norm(m.name)
        if name == '.agents/sw-ops-002-stage' or name.endswith('/.agents/sw-ops-002-stage'):
            matches.append(m)
    if len(matches) != 1:
        raise RuntimeError('expected one stage file, found %d' % len(matches))
    m = matches[0]
    if not m.isreg():
        raise RuntimeError('stage file was not regular')
    f = tf.extractfile(m)
    if f is None:
        raise RuntimeError('stage file payload missing')
    print(f.read().decode('utf-8').strip())
`;

function tarManifest(tarPath) {
  return JSON.parse(run('python3', ['-c', TAR_MANIFEST_SCRIPT, tarPath]));
}

function findRepoPrefix(manifest) {
  const candidates = new Set();
  for (const member of manifest) {
    const name = String(member.name || '');
    if (!name || name.startsWith('/') || name.split('/').includes('..')) throw new Error(`unsafe snapshot member: ${name.slice(0, 180)}`);
    const marker = 'workspace/repo/';
    const index = name.indexOf(marker);
    if (index >= 0) candidates.add(name.slice(0, index) + marker);
    if (name === 'workspace/repo') candidates.add('workspace/repo/');
  }
  if (candidates.size !== 1) throw new Error(`expected one workspace/repo prefix; found ${candidates.size}`);
  return [...candidates][0];
}

async function snapshotRepo(environmentId, label) {
  await verifyEnvironment(environmentId);
  const scratch = await mkdtemp(path.join(os.tmpdir(), `sw-ops-002-v3-${label}-`));
  const tarPath = path.join(scratch, 'environment.tar');
  const repoPath = path.join(scratch, 'repo');
  const attempts = await downloadSnapshot(environmentId, tarPath);
  const manifest = tarManifest(tarPath);
  const prefix = findRepoPrefix(manifest);
  const stage = run('python3', ['-c', READ_STAGE_SCRIPT, tarPath]).trim();
  await mkdir(repoPath, { recursive: true });
  const materialized = JSON.parse(run('python3', ['-c', MATERIALIZE_REPO_SCRIPT, tarPath, prefix, repoPath]) || '{}');
  const head = run('git', ['-C', repoPath, 'rev-parse', 'HEAD']).trim();
  return { scratch, repoPath, attempts, head, stage, materialized };
}

function patchPaths(patch) {
  const result = [];
  for (const line of patch.split(/\r?\n/)) {
    const match = /^diff --git a\/(.+) b\/(.+)$/.exec(line);
    if (!match) continue;
    if (match[1] !== match[2]) throw new Error(`renames are forbidden: ${match[1]} -> ${match[2]}`);
    if (!result.includes(match[2])) result.push(match[2]);
  }
  return result;
}

function addIntentToAdd(worktree) {
  const raw = run('git', ['-C', worktree, 'ls-files', '--others', '--exclude-standard', '-z']);
  const files = raw.split('\0').filter(Boolean);
  if (files.length) run('git', ['-C', worktree, 'add', '-N', '--', ...files]);
  return files;
}

async function derivePatch(snapshot, label, outputDir) {
  if (snapshot.head !== EXACT_BASE_SHA) throw new Error(`${label} snapshot base mismatch: ${snapshot.head}`);
  const worktree = path.join(snapshot.scratch, 'derive-base');
  run('git', ['worktree', 'add', '--detach', worktree, EXACT_BASE_SHA]);
  try {
    run('rsync', ['-a', '--delete', '--exclude=.git', '--exclude=.git/', '--', `${snapshot.repoPath}/`, `${worktree}/`]);
    const untracked = addIntentToAdd(worktree);
    run('git', ['-C', worktree, 'diff', '--check']);
    const patch = run('git', ['-C', worktree, 'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD']);
    const bytes = Buffer.byteLength(patch, 'utf8');
    const paths = patchPaths(patch);
    if (!patch || bytes <= 0) throw new Error(`${label} produced no patch`);
    if (bytes > MAX_PATCH_BYTES) throw new Error(`${label} patch exceeds ${MAX_PATCH_BYTES} bytes`);
    if (JSON.stringify(paths) !== JSON.stringify([FIXTURE])) throw new Error(`${label} patch escaped scope: ${JSON.stringify(paths)}`);
    const patchFile = path.join(outputDir, `${label}.patch`);
    await writeFile(patchFile, patch, 'utf8');
    return { patchFile, bytes, paths, untracked };
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: process.cwd(), encoding: 'utf8' });
  }
}

async function provePatch(patchFile, expectedText, label) {
  const scratch = await mkdtemp(path.join(os.tmpdir(), `sw-ops-002-v3-proof-${label}-`));
  const worktree = path.join(scratch, 'base');
  run('git', ['worktree', 'add', '--detach', worktree, EXACT_BASE_SHA]);
  try {
    run('git', ['-C', worktree, 'apply', '--check', patchFile]);
    run('git', ['-C', worktree, 'apply', patchFile]);
    run('git', ['-C', worktree, 'diff', '--check']);
    const status = run('git', ['-C', worktree, 'status', '--short']).trim();
    if (status !== `?? ${FIXTURE}`) throw new Error(`${label} replay status mismatch: ${status}`);
    const actual = await readFile(path.join(worktree, FIXTURE), 'utf8');
    if (actual !== expectedText) throw new Error(`${label} replay content mismatch`);
    return { status, contentSha256: hash(actual) };
  } finally {
    spawnSync('git', ['worktree', 'remove', '--force', worktree], { cwd: process.cwd(), encoding: 'utf8' });
    await rm(scratch, { recursive: true, force: true });
  }
}

async function dryRun(outputDir) {
  await mkdir(outputDir, { recursive: true });
  const summary = {
    version: 'SW_OPS_002_PROOF_V3_DRY_RUN',
    exactBaseRef: EXACT_BASE_REF,
    exactBaseSha: EXACT_BASE_SHA,
    repositoryUrl: REPOSITORY_URL,
    repositoryTarget: REPO_TARGET,
    allowedPatchPaths: [FIXTURE],
    maxPatchBytes: MAX_PATCH_BYTES,
    bootstrapTokenBudget: 4000,
    laterTokenBudget: 6000,
    reuseMode: 'environment-id-string-only',
    sourceUpdateAfterCreation: false,
    gateHasSubprocess: false,
    stageSequence: ['bootstrap', 'initial-ready', 'correction-ready', 'done'],
    approvedCommands: [
      'bash /.agents/bootstrap-command.sh',
      'bash /.agents/initial-command.sh',
      'bash /.agents/correction-command.sh',
    ],
    bootstrapCommandSha256: hash(bootstrapCommand()),
    initialCommandSha256: hash(initialCommand()),
    correctionCommandSha256: hash(correctionCommand()),
    githubWriteAuthority: false,
  };
  await writeFile(path.join(outputDir, 'request.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`SW-OPS-002 V3 dry-run PASS -> ${path.join(outputDir, 'request.json')}`);
}

async function live(outputDir) {
  await mkdir(outputDir, { recursive: true });

  const bootstrap = await runInteraction(bootstrapRequest(), 'bootstrap');
  const environmentId = required(bootstrap.environment_id, 'bootstrap.environment_id');
  const bootSnap = await snapshotRepo(environmentId, 'bootstrap');
  try {
    if (bootSnap.head !== EXACT_BASE_SHA) throw new Error(`bootstrap base mismatch: ${bootSnap.head}`);
    if (bootSnap.stage !== 'initial-ready') throw new Error(`bootstrap stage mismatch: ${bootSnap.stage}`);
    const status = run('git', ['-C', bootSnap.repoPath, 'status', '--short']).trim();
    if (status) throw new Error(`bootstrap repository is dirty: ${status.slice(0, 300)}`);
    await writeFile(path.join(outputDir, 'bootstrap.json'), `${JSON.stringify({
      interactionId: bootstrap.id,
      environmentId,
      interactionStatus: bootstrap.status,
      snapshotHead: bootSnap.head,
      snapshotStage: bootSnap.stage,
      snapshotAttempts: bootSnap.attempts,
      clean: true,
    }, null, 2)}\n`, 'utf8');
  } finally {
    await rm(bootSnap.scratch, { recursive: true, force: true });
  }

  const initial = await runInteraction(reuseRequest(environmentId, 'bash /.agents/initial-command.sh', 'initial edit'), 'initial');
  if (initial.environment_id !== environmentId) throw new Error('initial interaction changed environment ID');
  const initialSnap = await snapshotRepo(environmentId, 'initial');
  let initialDerived;
  try {
    if (initialSnap.stage !== 'correction-ready') throw new Error(`initial stage mismatch: ${initialSnap.stage}`);
    initialDerived = await derivePatch(initialSnap, 'initial', outputDir);
  } finally {
    await rm(initialSnap.scratch, { recursive: true, force: true });
  }
  const initialReplay = await provePatch(initialDerived.patchFile, INITIAL_TEXT, 'initial');
  await writeFile(path.join(outputDir, 'initial.json'), `${JSON.stringify({
    interactionId: initial.id,
    environmentId,
    interactionStatus: initial.status,
    snapshotStage: 'correction-ready',
    patchBytes: initialDerived.bytes,
    patchPaths: initialDerived.paths,
    untrackedFiles: initialDerived.untracked,
    replay: initialReplay,
  }, null, 2)}\n`, 'utf8');

  const correction = await runInteraction(reuseRequest(environmentId, 'bash /.agents/correction-command.sh', 'Director correction'), 'correction');
  if (correction.environment_id !== environmentId) throw new Error('correction interaction changed environment ID');
  const correctedSnap = await snapshotRepo(environmentId, 'corrected');
  let correctedDerived;
  try {
    if (correctedSnap.stage !== 'done') throw new Error(`correction stage mismatch: ${correctedSnap.stage}`);
    correctedDerived = await derivePatch(correctedSnap, 'corrected', outputDir);
  } finally {
    await rm(correctedSnap.scratch, { recursive: true, force: true });
  }
  const correctedReplay = await provePatch(correctedDerived.patchFile, CORRECTED_TEXT, 'corrected');
  await writeFile(path.join(outputDir, 'corrected.json'), `${JSON.stringify({
    interactionId: correction.id,
    environmentId,
    interactionStatus: correction.status,
    snapshotStage: 'done',
    patchBytes: correctedDerived.bytes,
    patchPaths: correctedDerived.paths,
    untrackedFiles: correctedDerived.untracked,
    replay: correctedReplay,
  }, null, 2)}\n`, 'utf8');

  const proof = {
    version: 'SW_OPS_002_PROOF_V3',
    status: 'PASS',
    exactBaseRef: EXACT_BASE_REF,
    exactBaseSha: EXACT_BASE_SHA,
    environmentId,
    bootstrapInteractionId: bootstrap.id,
    initialInteractionId: initial.id,
    correctionInteractionId: correction.id,
    sameEnvironmentForAllStages: true,
    sourceUpdateAfterCreation: false,
    finalStage: 'done',
    initialPatchPaths: initialDerived.paths,
    correctedPatchPaths: correctedDerived.paths,
    initialReplayContentSha256: initialReplay.contentSha256,
    correctedReplayContentSha256: correctedReplay.contentSha256,
    initialExpectedContentSha256: hash(INITIAL_TEXT),
    correctedExpectedContentSha256: hash(CORRECTED_TEXT),
    githubWriteAuthority: false,
    patchApplicationAuthority: 'host validation only; no repository write performed',
  };
  await writeFile(path.join(outputDir, 'proof.json'), `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
  console.log(`SW-OPS-002 V3 PASS: same sandbox ${environmentId}; both patches replayed on ${EXACT_BASE_SHA}`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return usage();
  const outputDir = path.resolve(process.cwd(), required(options['output-dir'], '--output-dir'));
  if (options.dryRun) return dryRun(outputDir);
  return live(outputDir);
}

main().catch((error) => {
  console.error(`[SW-OPS-002 V3] ${error.message}`);
  process.exitCode = 1;
});
