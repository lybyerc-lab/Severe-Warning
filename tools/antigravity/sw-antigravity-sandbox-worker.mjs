#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_SANDBOX_WORKER_V2]
// SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V2
// Tooling only. Never import from browser, Android, gameplay, or production runtime source.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const REPO_TARGET = '/workspace/repo';
const OUTPUT_ROOT = '/workspace/antigravity-output';
const POLL_MS = 5000;
const POLL_CEILING_MS = 12 * 60 * 1000;
const FINISH_RETURN_TOKEN_BUDGET = 8000;

function usage() {
  console.log(`Severe Weather Warning Antigravity sandbox worker\n\nUsage:\n  node tools/antigravity/sw-antigravity-sandbox-worker.mjs execute --task <task.json> --output-dir <dir> [--dry-run]\n  node tools/antigravity/sw-antigravity-sandbox-worker.mjs continue --task <task.json> --interaction <id> --environment <id> --input <text> --output-dir <dir> [--dry-run]\n\nEnvironment:\n  GEMINI_API_KEY  Required for live calls only. Never commit or print it.\n`);
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
    'Mandatory checkout law:',
    `1. cd ${REPO_TARGET}`,
    `2. Ensure ${task.exactBaseSha} exists locally. If needed, fetch only from the public origin.`,
    `3. git checkout --detach ${task.exactBaseSha}`,
    `4. Verify git rev-parse HEAD is exactly ${task.exactBaseSha}.`,
    '5. Only then read task/repository instructions and edit.',
    '',
    'Hard boundaries:',
    '- Never request or use GitHub credentials.',
    '- Never push, commit, open a PR, merge, release, publish, deploy, or claim acceptance.',
    '- Edit only task-allowed repository paths.',
    '- Do not alter .git configuration, hooks, remotes, credentials, or history.',
    '- Use git add -N only when needed to make a brand-new file visible to git diff. Do not stage contents.',
    '',
    `Write the complete patch to ${OUTPUT_ROOT}/worker.patch.`,
    `Write the structured result to ${OUTPUT_ROOT}/result.json.`,
    'Your final response must also contain the same complete patch in the patch field of the requested JSON object.',
  ].join('\n');
}

function resultContract() {
  return '{"version":"SW_ANTIGRAVITY_WORKER_RESULT_V1","status":"completed|blocked|incomplete","taskId":"...","exactBaseSha":"...","verifiedBaseSha":"...","summary":"...","changedFiles":["..."],"tests":["..."],"evidence":["..."],"risks":["..."],"nextAction":"...","patch":"complete unified git patch string"}';
}

function firstPrompt(task) {
  return [
    'Execute this bounded Severe Weather Warning worker task.',
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
    `Before finishing, write ${OUTPUT_ROOT}/worker.patch and ${OUTPUT_ROOT}/result.json.`,
    'Return ONLY valid JSON matching this exact top-level shape:', resultContract(),
    'The patch field must exactly equal worker.patch. Do not wrap the JSON in markdown.',
  ].join('\n');
}

function correctionPrompt(task, input) {
  return [
    'Continue the same bounded Severe Weather Warning task in the same sandbox.',
    `Task ID remains ${task.taskId}. Exact base remains ${task.exactBaseSha}.`,
    'Do not widen allowed paths, network access, or authority.',
    '',
    'Director correction:', requiredString(input, '--input'),
    '',
    `Regenerate ${OUTPUT_ROOT}/worker.patch from the same exact base and refresh ${OUTPUT_ROOT}/result.json.`,
    'Return ONLY valid JSON matching this exact top-level shape:', resultContract(),
    'The patch field must exactly equal worker.patch. Do not wrap the JSON in markdown.',
  ].join('\n');
}

function finishReturnPrompt(task) {
  return [
    'Finish return contract only. The previous interaction hit its token ceiling.',
    `Task ID remains ${task.taskId}. Exact base remains ${task.exactBaseSha}.`,
    'Do not broaden scope. Do not create new repository changes unless strictly required to correct the already-requested allowed-path edit.',
    `Inspect the current sandbox diff against ${task.exactBaseSha}.`,
    'Verify the exact base, run the already-requested lightweight checks, and finish the return payload.',
    `Regenerate ${OUTPUT_ROOT}/worker.patch from the exact base and refresh ${OUTPUT_ROOT}/result.json.`,
    'Return ONLY valid JSON matching this exact top-level shape:', resultContract(),
    'The patch field must exactly equal worker.patch. Do not wrap the JSON in markdown or add progress prose.',
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
    input: firstPrompt(task),
    environment: environmentConfig(task),
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task),
  };
}

function continuationBody(task, options) {
  return {
    agent: task.agent,
    input: correctionPrompt(task, options.input),
    previous_interaction_id: requiredString(options.interaction, '--interaction'),
    environment: requiredString(options.environment, '--environment'),
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task),
  };
}

function finishReturnBody(task, interaction) {
  return {
    agent: task.agent,
    input: finishReturnPrompt(task),
    previous_interaction_id: requiredString(interaction.id, 'interaction.id'),
    environment: requiredString(interaction.environment_id, 'interaction.environment_id'),
    tools: [{ type: 'code_execution' }],
    agent_config: agentConfig(task, Math.min(task.tokenBudget, FINISH_RETURN_TOKEN_BUDGET)),
  };
}

function drySummary(task, taskFile, mode, extras = {}) {
  return {
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_REQUEST_V2',
    dryRun: true,
    mode,
    executionMode: 'custom-environment-unary-with-adaptive-poll',
    taskFile,
    taskId: task.taskId,
    exactBaseSha: task.exactBaseSha,
    repositoryUrl: task.repositoryUrl,
    repositoryTarget: REPO_TARGET,
    networkAllowlist: ['github.com (no injected credentials)'],
    tools: ['code_execution', 'filesystem via environment'],
    tokenBudget: task.tokenBudget,
    finishReturnTokenBudget: Math.min(task.tokenBudget, FINISH_RETURN_TOKEN_BUDGET),
    maxPatchBytes: task.maxPatchBytes,
    allowedPaths: task.allowedPaths,
    protectedPaths: task.protectedPaths,
    returnChannel: 'validated inline JSON patch',
    incompleteRecovery: 'one same-environment finish-return continuation only',
    ...extras,
  };
}

async function apiJson(method, url, body) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set');
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
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

function diagnostics(interaction) {
  return {
    id: interaction?.id || null,
    status: interaction?.status || null,
    environmentId: interaction?.environment_id || null,
    stepTypes: Array.isArray(interaction?.steps) ? interaction.steps.map((step) => step?.type || 'unknown') : [],
  };
}

async function completeInteraction(body) {
  let interaction = await apiJson('POST', API_ROOT, body);
  const id = requiredString(interaction.id, 'interaction.id');
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error(`Antigravity interaction ${id} exceeded local poll ceiling`);
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${API_ROOT}/${encodeURIComponent(id)}`);
  }
  if (!['completed', 'incomplete'].includes(interaction.status)) {
    throw new Error(`Antigravity interaction ended in unusable state: ${JSON.stringify(diagnostics(interaction))}`);
  }
  return interaction;
}

function collectTextNodes(value, out = []) {
  if (!value || typeof value !== 'object') return out;
  if (value.type === 'text' && typeof value.text === 'string' && value.text.trim()) out.push(value.text.trim());
  if (Array.isArray(value)) {
    for (const child of value) collectTextNodes(child, out);
  } else {
    for (const child of Object.values(value)) collectTextNodes(child, out);
  }
  return out;
}

function outputText(interaction) {
  if (typeof interaction?.output_text === 'string' && interaction.output_text.trim()) return interaction.output_text.trim();
  const steps = Array.isArray(interaction?.steps) ? interaction.steps : [];
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    if (steps[i]?.type !== 'model_output') continue;
    const texts = collectTextNodes(steps[i]);
    if (texts.length) return texts.join('\n');
  }
  const fallback = collectTextNodes(interaction);
  return fallback.length ? fallback[fallback.length - 1] : '';
}

function parseWorkerReturn(interaction) {
  const text = outputText(interaction);
  if (!text) throw new Error(`Terminal Antigravity response has no text output: ${JSON.stringify(diagnostics(interaction))}`);
  const stripped = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    const start = stripped.indexOf('{');
    const end = stripped.lastIndexOf('}');
    if (start < 0 || end <= start) throw new Error(`Antigravity output is not JSON: ${text.slice(0, 300)}`);
    try {
      parsed = JSON.parse(stripped.slice(start, end + 1));
    } catch {
      throw new Error(`Antigravity output is not parseable JSON: ${text.slice(0, 300)}`);
    }
  }
  const patch = typeof parsed.patch === 'string' ? parsed.patch : '';
  const result = { ...parsed };
  delete result.patch;
  return { result, patch };
}

function hasCompletedReturn(interaction) {
  try {
    const parsed = parseWorkerReturn(interaction);
    return parsed.result?.status === 'completed';
  } catch {
    return false;
  }
}

async function finishIncompleteReturn(task, interaction) {
  if (interaction.status !== 'incomplete' || hasCompletedReturn(interaction)) return interaction;
  console.log(`[SW-OPS-002] Antigravity API status incomplete; reusing environment ${interaction.environment_id} for one finish-return pass.`);
  return completeInteraction(finishReturnBody(task, interaction));
}

function matchesPath(candidate, rule) {
  return rule.endsWith('/') ? candidate.startsWith(rule) : candidate === rule || candidate.startsWith(`${rule}/`);
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

function sameSet(left, right) {
  const a = [...left].sort();
  const b = [...right].sort();
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

function validate(task, result, patch) {
  if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error('worker result must be an object');
  if (result.version !== 'SW_ANTIGRAVITY_WORKER_RESULT_V1') throw new Error('worker result version mismatch');
  if (result.taskId !== task.taskId) throw new Error('worker result taskId mismatch');
  if (result.exactBaseSha !== task.exactBaseSha || result.verifiedBaseSha !== task.exactBaseSha) {
    throw new Error('worker did not prove the exact base SHA');
  }
  if (!['completed', 'blocked', 'incomplete'].includes(result.status)) throw new Error('worker result status is invalid');
  requiredString(result.summary, 'result.summary');
  requiredString(result.nextAction, 'result.nextAction');
  const changedFiles = stringList(result.changedFiles, 'result.changedFiles').map((item, index) => safeRepoPath(item, `result.changedFiles[${index}]`));
  stringList(result.tests, 'result.tests');
  stringList(result.evidence, 'result.evidence');
  stringList(result.risks, 'result.risks');

  const bytes = Buffer.byteLength(patch, 'utf8');
  if (bytes > task.maxPatchBytes) throw new Error(`Patch exceeds ${task.maxPatchBytes} byte limit`);
  const paths = patchPaths(patch);
  if (task.requirePatch && result.status === 'completed' && !paths.length) throw new Error('completed task returned no patch');
  if (!sameSet(paths, changedFiles)) throw new Error('result.changedFiles does not match patch paths');
  for (const candidate of paths) {
    if (!task.allowedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path outside allowed territory: ${candidate}`);
    if (task.protectedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path enters protected territory: ${candidate}`);
  }
  return { bytes, paths };
}

async function saveBundle(task, interaction, outputDir) {
  const { result, patch } = parseWorkerReturn(interaction);
  const checked = validate(task, result, patch);
  const dir = path.resolve(process.cwd(), requiredString(outputDir, '--output-dir'));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'worker.patch'), patch, 'utf8');
  await writeFile(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await writeFile(path.join(dir, 'envelope.json'), `${JSON.stringify({
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_ENVELOPE_V2',
    capturedAt: new Date().toISOString(),
    taskId: task.taskId,
    exactBaseSha: task.exactBaseSha,
    interactionId: interaction.id,
    environmentId: interaction.environment_id,
    apiStatus: interaction.status,
    usage: interaction.usage || null,
    patchBytes: checked.bytes,
    patchPaths: checked.paths,
    workerStatus: result.status,
    workerSummary: result.summary,
    returnChannel: 'model-output',
  }, null, 2)}\n`, 'utf8');
  console.log(`Antigravity API status: ${interaction.status}`);
  console.log(`Antigravity worker ${task.taskId}: ${result.status}`);
  console.log(`Interaction: ${interaction.id}`);
  console.log(`Environment: ${interaction.environment_id}`);
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
  let interaction = await completeInteraction(initialBody(task));
  interaction = await finishIncompleteReturn(task, interaction);
  await saveBundle(task, interaction, options['output-dir']);
}

async function continueTask(options) {
  const { task, absolute } = await loadTask(options.task);
  const body = continuationBody(task, options);
  if (options.dryRun) {
    return writeDry(drySummary(task, path.relative(process.cwd(), absolute), 'continue', {
      previousInteractionId: body.previous_interaction_id,
      environmentId: body.environment,
      directorFeedback: body.input,
    }), options['output-dir']);
  }
  let interaction = await completeInteraction(body);
  interaction = await finishIncompleteReturn(task, interaction);
  await saveBundle(task, interaction, options['output-dir']);
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
