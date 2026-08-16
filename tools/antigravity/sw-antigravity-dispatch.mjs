#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_DISPATCH]
// SW_OPS_001_ANTIGRAVITY_DISPATCH_V1
// Tooling only. Never import this file from browser, Android, gameplay, or production runtime source.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const DEFAULT_AGENT = 'antigravity-preview-05-2026';
const DEFAULT_BUDGET = 12000;
const MIN_BUDGET = 2000;
const MAX_BUDGET = 50000;

function usage() {
  console.log(`Severe Weather Warning Antigravity dispatcher\n\nUsage:\n  node tools/antigravity/sw-antigravity-dispatch.mjs send --task <task.json> [--output result.json] [--dry-run]\n  node tools/antigravity/sw-antigravity-dispatch.mjs status --interaction <id> [--output result.json]\n  node tools/antigravity/sw-antigravity-dispatch.mjs continue --interaction <id> --environment <id> --input <text> [--budget 12000] [--output result.json] [--dry-run]\n\nEnvironment:\n  GEMINI_API_KEY  Required only for live API calls. Never commit or print it.\n`);
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
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${label} must be a non-empty string`);
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

async function loadTask(taskPath) {
  if (!taskPath) throw new Error('--task is required');
  const absolute = path.resolve(process.cwd(), taskPath);
  const task = JSON.parse(await readFile(absolute, 'utf8'));
  const normalized = {
    version: assertString(task.version, 'version'),
    taskId: assertString(task.taskId, 'taskId'),
    repository: assertString(task.repository, 'repository'),
    exactBaseSha: assertString(task.exactBaseSha, 'exactBaseSha'),
    goal: assertString(task.goal, 'goal'),
    nonGoals: normalizeList(task.nonGoals, 'nonGoals'),
    allowedTerritory: normalizeList(task.allowedTerritory, 'allowedTerritory'),
    protectedTerritory: normalizeList(task.protectedTerritory, 'protectedTerritory'),
    proofPlan: normalizeList(task.proofPlan, 'proofPlan'),
    tokenBudget: normalizeBudget(task.tokenBudget),
    agent: task.agent ? assertString(task.agent, 'agent') : DEFAULT_AGENT,
    network: task.network === 'disabled' ? 'disabled' : 'enabled',
  };
  if (!/^[0-9a-f]{40}$/i.test(normalized.exactBaseSha)) throw new Error('exactBaseSha must be a full 40-character Git SHA');
  return { task: normalized, absolute };
}

function taskPrompt(task) {
  return [
    'You are a bounded Severe Weather Warning worker. Follow this task contract exactly.',
    '',
    `Task ID: ${task.taskId}`,
    `Repository: ${task.repository}`,
    `Exact base SHA: ${task.exactBaseSha}`,
    '',
    'Goal:',
    task.goal,
    '',
    'Allowed territory:',
    ...task.allowedTerritory.map((item) => `- ${item}`),
    '',
    'Protected territory:',
    ...task.protectedTerritory.map((item) => `- ${item}`),
    '',
    'Non-goals:',
    ...task.nonGoals.map((item) => `- ${item}`),
    '',
    'Proof plan:',
    ...task.proofPlan.map((item) => `- ${item}`),
    '',
    'Do not broaden scope, merge, deploy, publish, or claim owner acceptance.',
    'Return ONLY valid JSON with this exact top-level shape:',
    '{"status":"completed|blocked|incomplete","taskId":"...","summary":"...","evidence":["..."],"changedFileProposal":["..."],"tests":["..."],"risks":["..."],"nextAction":"..."}',
  ].join('\n');
}

function sendBody(task) {
  const environment = task.network === 'disabled'
    ? { type: 'remote', network: 'disabled' }
    : 'remote';
  return {
    agent: task.agent,
    input: taskPrompt(task),
    environment,
    agent_config: {
      type: 'antigravity',
      max_total_tokens: task.tokenBudget,
    },
  };
}

function continueBody(options) {
  const budget = normalizeBudget(options.budget);
  return {
    agent: options.agent || DEFAULT_AGENT,
    input: assertString(options.input, '--input'),
    previous_interaction_id: assertString(options.interaction, '--interaction'),
    environment: assertString(options.environment, '--environment'),
    agent_config: {
      type: 'antigravity',
      max_total_tokens: budget,
    },
  };
}

function safeRequestSummary(command, body, extras = {}) {
  return {
    version: 'SW_OPS_001_ANTIGRAVITY_REQUEST_V1',
    command,
    agent: body.agent || null,
    environment: body.environment || null,
    previousInteractionId: body.previous_interaction_id || null,
    tokenBudget: body.agent_config?.max_total_tokens || null,
    input: body.input || null,
    ...extras,
  };
}

async function apiRequest(method, url, body) {
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

function extractOutputText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) return payload.output_text.trim();
  const steps = Array.isArray(payload?.steps) ? payload.steps : [];
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i];
    if (step?.type !== 'model_output' || !Array.isArray(step.content)) continue;
    const text = step.content
      .filter((item) => item?.type === 'text' && typeof item.text === 'string')
      .map((item) => item.text)
      .join('\n')
      .trim();
    if (text) return text;
  }
  return '';
}

function parseWorkerOutput(payload) {
  const outputText = extractOutputText(payload);
  if (!outputText) return null;
  const stripped = outputText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(stripped);
  } catch {
    return { status: 'incomplete', summary: outputText, parseWarning: 'Antigravity output was not valid JSON' };
  }
}

function resultEnvelope(payload, metadata = {}) {
  return {
    version: 'SW_OPS_001_ANTIGRAVITY_RESULT_V1',
    capturedAt: new Date().toISOString(),
    interactionId: payload?.id || null,
    environmentId: payload?.environment_id || null,
    apiStatus: payload?.status || null,
    usage: payload?.usage || null,
    workerResult: parseWorkerOutput(payload),
    ...metadata,
  };
}

async function writeJson(outputPath, value) {
  if (!outputPath) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }
  const absolute = path.resolve(process.cwd(), outputPath);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${absolute}`);
}

async function runSend(options) {
  const { task, absolute } = await loadTask(options.task);
  const body = sendBody(task);
  if (options.dryRun) {
    await writeJson(options.output, {
      dryRun: true,
      taskFile: path.relative(process.cwd(), absolute),
      ...safeRequestSummary('send', body, { taskId: task.taskId, exactBaseSha: task.exactBaseSha }),
    });
    return;
  }
  const payload = await apiRequest('POST', API_ROOT, body);
  await writeJson(options.output, resultEnvelope(payload, { taskId: task.taskId, exactBaseSha: task.exactBaseSha }));
}

async function runStatus(options) {
  const interaction = assertString(options.interaction, '--interaction');
  const payload = await apiRequest('GET', `${API_ROOT}/${encodeURIComponent(interaction)}`);
  await writeJson(options.output, resultEnvelope(payload));
}

async function runContinue(options) {
  const body = continueBody(options);
  if (options.dryRun) {
    await writeJson(options.output, { dryRun: true, ...safeRequestSummary('continue', body) });
    return;
  }
  const payload = await apiRequest('POST', API_ROOT, body);
  await writeJson(options.output, resultEnvelope(payload));
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help') {
    usage();
    return;
  }
  if (command === 'send') return runSend(options);
  if (command === 'status') return runStatus(options);
  if (command === 'continue') return runContinue(options);
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(`[SW-OPS-001] ${error.message}`);
  process.exitCode = 1;
});
