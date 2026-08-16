#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_SANDBOX_WORKER_V3]
// SW_OPS_002_ANTIGRAVITY_SANDBOX_WORKER_V3
// Tooling only. Never import from browser, Android, gameplay, or production runtime source.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const REPO_TARGET = '/workspace/repo';
const POLL_MS = 5000;
const POLL_CEILING_MS = 12 * 60 * 1000;
const RECOVERY_TOKEN_BUDGET = 8000;
const SUBMIT_TOOL_NAME = 'submit_worker_bundle';

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
    `Terminal handoff law: after the work and requested tests are done, call ${SUBMIT_TOOL_NAME} exactly once.`,
    `Do not use final prose as the handoff. The ${SUBMIT_TOOL_NAME} function arguments are the authoritative return bundle.`,
  ].join('\n');
}

function submitTool() {
  const stringArray = { type: 'array', items: { type: 'string' } };
  return {
    type: 'function',
    name: SUBMIT_TOOL_NAME,
    description: 'Terminal Severe Weather Warning worker handoff. Call exactly once after the bounded sandbox task is complete, blocked, or incomplete. The host validates these arguments and does not execute a GitHub write.',
    parameters: {
      type: 'object',
      properties: {
        version: { type: 'string', enum: ['SW_ANTIGRAVITY_WORKER_RESULT_V1'] },
        status: { type: 'string', enum: ['completed', 'blocked', 'incomplete'] },
        taskId: { type: 'string' },
        exactBaseSha: { type: 'string' },
        verifiedBaseSha: { type: 'string' },
        summary: { type: 'string' },
        changedFiles: stringArray,
        tests: stringArray,
        evidence: stringArray,
        risks: stringArray,
        nextAction: { type: 'string' },
        patch: { type: 'string', description: 'Complete unified git patch from the exact base. Include every task change and no protected or out-of-scope path.' },
      },
      required: [
        'version', 'status', 'taskId', 'exactBaseSha', 'verifiedBaseSha', 'summary',
        'changedFiles', 'tests', 'evidence', 'risks', 'nextAction', 'patch',
      ],
    },
  };
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
    `When finished, do not write a normal final answer. Call ${SUBMIT_TOOL_NAME} exactly once with the complete patch and evidence.`,
    `If you cannot finish safely, call ${SUBMIT_TOOL_NAME} with status blocked or incomplete and explain the blocker in summary and risks.`,
  ].join('\n');
}

function correctionPrompt(task, input, priorInteractionId) {
  return [
    'This is a fresh agent turn reusing the same Severe Weather Warning sandbox filesystem.',
    `Prior audited interaction ID: ${priorInteractionId}. Inspect current filesystem state directly rather than reconstructing its reasoning.`,
    `Task ID remains ${task.taskId}. Exact base remains ${task.exactBaseSha}.`,
    'Do not widen allowed paths, network access, or authority.',
    '',
    'Director correction:', requiredString(input, '--input'),
    '',
    `Inspect the complete current diff against ${task.exactBaseSha}, apply only this correction, rerun the requested lightweight checks, then call ${SUBMIT_TOOL_NAME} exactly once.`,
    'Do not use final prose as the handoff.',
  ].join('\n');
}

function recoveryPrompt(task, priorInteractionId) {
  return [
    'Finish the worker handoff only. Reuse the existing sandbox filesystem with a fresh conversation.',
    `Prior audited interaction ID: ${priorInteractionId}. That turn ended before submitting a bundle.`,
    `Task ID: ${task.taskId}. Exact base: ${task.exactBaseSha}.`,
    'Do not broaden scope and do not invent unrelated changes.',
    `Inspect the current diff against ${task.exactBaseSha}, verify the exact base, run only the already-requested lightweight checks if needed, then call ${SUBMIT_TOOL_NAME} exactly once.`,
    'Do not provide progress prose or a normal final answer. The function call is the only required handoff.',
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

function baseRequest(task, input, environment, budget = task.tokenBudget) {
  return {
    agent: task.agent,
    input,
    environment,
    store: true,
    tools: [{ type: 'code_execution' }, submitTool()],
    agent_config: agentConfig(task, budget),
  };
}

function initialBody(task) {
  return baseRequest(task, taskPrompt(task), environmentConfig(task));
}

function continuationBody(task, options) {
  const auditInteractionId = requiredString(options.interaction, '--interaction');
  return {
    ...baseRequest(
      task,
      correctionPrompt(task, options.input, auditInteractionId),
      requiredString(options.environment, '--environment'),
    ),
    auditInteractionId,
  };
}

function recoveryBody(task, interaction) {
  const auditInteractionId = requiredString(interaction.id, 'interaction.id');
  return {
    ...baseRequest(
      task,
      recoveryPrompt(task, auditInteractionId),
      requiredString(interaction.environment_id, 'interaction.environment_id'),
      Math.min(task.tokenBudget, RECOVERY_TOKEN_BUDGET),
    ),
    auditInteractionId,
  };
}

function drySummary(task, taskFile, mode, extras = {}) {
  return {
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_REQUEST_V3',
    dryRun: true,
    mode,
    executionMode: 'custom-environment-function-handoff',
    continuationStateMode: 'same-environment-fresh-conversation',
    taskFile,
    taskId: task.taskId,
    exactBaseSha: task.exactBaseSha,
    repositoryUrl: task.repositoryUrl,
    repositoryTarget: REPO_TARGET,
    networkAllowlist: ['github.com (no injected credentials)'],
    tools: ['code_execution', SUBMIT_TOOL_NAME, 'filesystem via environment'],
    tokenBudget: task.tokenBudget,
    recoveryTokenBudget: Math.min(task.tokenBudget, RECOVERY_TOKEN_BUDGET),
    maxPatchBytes: task.maxPatchBytes,
    allowedPaths: task.allowedPaths,
    protectedPaths: task.protectedPaths,
    returnChannel: `function_call:${SUBMIT_TOOL_NAME}`,
    incompleteRecovery: 'one fresh-conversation turn in the same environment only',
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

function findSubmission(interaction) {
  const steps = Array.isArray(interaction?.steps) ? interaction.steps : [];
  const calls = steps.filter((step) => step?.type === 'function_call' && step.name === SUBMIT_TOOL_NAME);
  if (!calls.length) return null;
  if (calls.length !== 1) throw new Error(`Expected exactly one ${SUBMIT_TOOL_NAME} call; found ${calls.length}`);
  const args = calls[0].arguments;
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error(`${SUBMIT_TOOL_NAME} arguments are missing or invalid`);
  return { callId: calls[0].id || null, args };
}

async function runInteraction(body) {
  const requestBody = { ...body };
  delete requestBody.auditInteractionId;
  let interaction = await apiJson('POST', API_ROOT, requestBody);
  const id = requiredString(interaction.id, 'interaction.id');
  const started = Date.now();
  while (interaction.status === 'in_progress') {
    if (Date.now() - started > POLL_CEILING_MS) throw new Error(`Antigravity interaction ${id} exceeded local poll ceiling`);
    await sleep(POLL_MS);
    interaction = await apiJson('GET', `${API_ROOT}/${encodeURIComponent(id)}`);
  }
  return interaction;
}

async function interactionWithOneRecovery(task, body) {
  let interaction = await runInteraction(body);
  if (findSubmission(interaction)) return interaction;
  if (!['completed', 'incomplete'].includes(interaction.status)) {
    throw new Error(`Antigravity ended without a submission: ${JSON.stringify(diagnostics(interaction))}`);
  }
  console.log(`[SW-OPS-002] No ${SUBMIT_TOOL_NAME} call in ${interaction.status} interaction; reusing environment ${interaction.environment_id} for one clean recovery turn.`);
  interaction = await runInteraction(recoveryBody(task, interaction));
  if (!findSubmission(interaction)) {
    throw new Error(`Recovery ended without ${SUBMIT_TOOL_NAME}: ${JSON.stringify(diagnostics(interaction))}`);
  }
  return interaction;
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

function validateSubmission(task, args) {
  if (args.version !== 'SW_ANTIGRAVITY_WORKER_RESULT_V1') throw new Error('worker result version mismatch');
  if (args.taskId !== task.taskId) throw new Error('worker result taskId mismatch');
  if (args.exactBaseSha !== task.exactBaseSha || args.verifiedBaseSha !== task.exactBaseSha) {
    throw new Error('worker did not prove the exact base SHA');
  }
  if (!['completed', 'blocked', 'incomplete'].includes(args.status)) throw new Error('worker result status is invalid');
  requiredString(args.summary, 'result.summary');
  requiredString(args.nextAction, 'result.nextAction');
  const changedFiles = stringList(args.changedFiles, 'result.changedFiles').map((item, index) => safeRepoPath(item, `result.changedFiles[${index}]`));
  stringList(args.tests, 'result.tests');
  stringList(args.evidence, 'result.evidence');
  stringList(args.risks, 'result.risks');
  const patch = typeof args.patch === 'string' ? args.patch : '';
  const bytes = Buffer.byteLength(patch, 'utf8');
  if (bytes > task.maxPatchBytes) throw new Error(`Patch exceeds ${task.maxPatchBytes} byte limit`);
  const paths = patchPaths(patch);
  if (task.requirePatch && args.status === 'completed' && !paths.length) throw new Error('completed task returned no patch');
  if (!sameSet(paths, changedFiles)) throw new Error('result.changedFiles does not match patch paths');
  for (const candidate of paths) {
    if (!task.allowedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path outside allowed territory: ${candidate}`);
    if (task.protectedPaths.some((rule) => matchesPath(candidate, rule))) throw new Error(`Patch path enters protected territory: ${candidate}`);
  }
  return { args, patch, bytes, paths };
}

async function saveBundle(task, interaction, outputDir) {
  const submission = findSubmission(interaction);
  if (!submission) throw new Error(`No ${SUBMIT_TOOL_NAME} call found`);
  const checked = validateSubmission(task, submission.args);
  const result = { ...checked.args };
  delete result.patch;
  const dir = path.resolve(process.cwd(), requiredString(outputDir, '--output-dir'));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'worker.patch'), checked.patch, 'utf8');
  await writeFile(path.join(dir, 'result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await writeFile(path.join(dir, 'envelope.json'), `${JSON.stringify({
    version: 'SW_OPS_002_ANTIGRAVITY_WORKER_ENVELOPE_V3',
    capturedAt: new Date().toISOString(),
    taskId: task.taskId,
    exactBaseSha: task.exactBaseSha,
    interactionId: interaction.id,
    environmentId: interaction.environment_id,
    apiStatus: interaction.status,
    usage: interaction.usage || null,
    functionCallId: submission.callId,
    patchBytes: checked.bytes,
    patchPaths: checked.paths,
    workerStatus: result.status,
    workerSummary: result.summary,
    returnChannel: `function_call:${SUBMIT_TOOL_NAME}`,
  }, null, 2)}\n`, 'utf8');
  console.log(`Antigravity API status: ${interaction.status}`);
  console.log(`Antigravity worker ${task.taskId}: ${result.status}`);
  console.log(`Interaction: ${interaction.id}`);
  console.log(`Environment: ${interaction.environment_id}`);
  console.log(`Return: ${SUBMIT_TOOL_NAME}(${submission.callId || 'no-call-id'})`);
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
  const interaction = await interactionWithOneRecovery(task, initialBody(task));
  await saveBundle(task, interaction, options['output-dir']);
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
  const interaction = await interactionWithOneRecovery(task, body);
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
