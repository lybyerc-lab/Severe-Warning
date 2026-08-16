#!/usr/bin/env node

// [SW:OPS:ANTIGRAVITY_VERIFY]
// SW_OPS_001_ANTIGRAVITY_VERIFY_V1

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const dispatcherPath = path.join(root, 'tools', 'antigravity', 'sw-antigravity-dispatch.mjs');
const smokeTaskPath = path.join(root, 'tools', 'antigravity', 'tasks', 'sw-ops-001-smoke.json');

function fail(message) {
  console.error(`[SW-OPS-001 VERIFY] ${message}`);
  process.exitCode = 1;
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const dispatcher = await readFile(dispatcherPath, 'utf8');
const smokeTask = JSON.parse(await readFile(smokeTaskPath, 'utf8'));

for (const marker of [
  'SW_OPS_001_ANTIGRAVITY_DISPATCH_V1',
  'antigravity-preview-05-2026',
  'GEMINI_API_KEY',
  'max_total_tokens',
  'previous_interaction_id',
  'environment_id',
]) {
  if (!dispatcher.includes(marker)) fail(`dispatcher missing required marker: ${marker}`);
}

if (!/^[0-9a-f]{40}$/i.test(smokeTask.exactBaseSha || '')) fail('smoke task exactBaseSha is not a full Git SHA');
if (smokeTask.network !== 'disabled') fail('smoke task must disable network');
if (!Number.isInteger(smokeTask.tokenBudget) || smokeTask.tokenBudget > 6000) fail('smoke task token budget must be <= 6000');

const secretLikePatterns = [
  /AIza[0-9A-Za-z_-]{20,}/g,
  /GEMINI_API_KEY\s*=\s*["'][^"']+["']/g,
  /x-goog-api-key\s*[:=]\s*["'][^"'$]+["']/gi,
];
for (const pattern of secretLikePatterns) {
  if (pattern.test(dispatcher)) fail(`dispatcher contains secret-like literal matching ${pattern}`);
}

const runtimeRoots = ['runtime', 'modern', 'MechanicsLab', 'android'];
for (const runtimeRoot of runtimeRoots) {
  for (const file of await walk(path.join(root, runtimeRoot))) {
    if (!/\.(?:js|mjs|cjs|ts|tsx|jsx|java|kt|json|html)$/i.test(file)) continue;
    const text = await readFile(file, 'utf8').catch(() => '');
    if (text.includes('sw-antigravity-dispatch') || text.includes('tools/antigravity')) {
      fail(`runtime territory references Antigravity tooling: ${path.relative(root, file)}`);
    }
  }
}

if (!process.exitCode) {
  console.log('SW-OPS-001 verifier PASS');
  console.log(`Smoke task: ${smokeTask.taskId}`);
  console.log(`Exact base: ${smokeTask.exactBaseSha}`);
  console.log(`Token budget: ${smokeTask.tokenBudget}`);
}
