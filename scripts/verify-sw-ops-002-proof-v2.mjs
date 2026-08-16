#!/usr/bin/env node

// [SW:OPS:002:PROOF_V2_VERIFIER]

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const proofPath = path.join(root, 'tools', 'antigravity', 'sw-ops-002-proof-v2.mjs');
const workflowPath = path.join(root, '.github', 'workflows', 'sw-ops-002-antigravity-proof-v2.yml');
const proof = await readFile(proofPath, 'utf8');
const workflow = await readFile(workflowPath, 'utf8');
const errors = [];

const exactBase = '10ccd2723b8fa6b925f47629491a9e51e6388500';
const exactRef = 'agent/sw-ops-001-antigravity-bridge';
const fixture = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const liveLabel = 'antigravity-sandbox-smoke-v2';

function requireText(text, needle, label) {
  if (!text.includes(needle)) errors.push(`${label} missing required marker: ${needle}`);
}
function rejectText(text, needle, label) {
  if (text.includes(needle)) errors.push(`${label} contains forbidden marker: ${needle}`);
}

requireText(proof, 'SW:OPS:002:PROOF_V2', 'proof runner');
requireText(proof, exactBase, 'proof runner');
requireText(proof, exactRef, 'proof runner');
requireText(proof, fixture, 'proof runner');
requireText(proof, "matcher: '.*'", 'proof runner');
requireText(proof, "command: 'python3 /.agents/hooks-scripts/exact_base_normalize.py'", 'proof runner');
requireText(proof, 'git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)', 'proof runner');
requireText(proof, 'git("checkout", "--detach", EXPECTED_SHA)', 'proof runner');
requireText(proof, 'respond("allow")', 'proof runner normalizer');
requireText(proof, 'environment_id: environmentId', 'proof runner environment update');
requireText(proof, "target: '.agents/hooks.json'", 'proof runner environment update');
requireText(proof, "target: '.agents/hooks-scripts/command_gate.py'", 'proof runner environment update');
requireText(proof, "target: '.agents/approved-command.sh'", 'proof runner environment update');
requireText(proof, 'bash /.agents/approved-command.sh', 'proof runner command gate');
requireText(proof, 'Only code_execution is permitted in the SW-OPS-002 edit lane.', 'proof runner command gate');
requireText(proof, "network: { allowlist: [{ domain: 'github.com' }] }", 'proof runner');
requireText(proof, 'import json, os, shutil, sys, tarfile', 'proof runner snapshot materializer');
requireText(proof, 'non-regular repository member outside .git', 'proof runner snapshot materializer');
requireText(proof, "run('rsync', ['-a', '--delete'", 'proof runner patch derivation');
requireText(proof, "'diff', '--check'", 'proof runner patch derivation');
requireText(proof, "'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD'", 'proof runner patch derivation');
requireText(proof, "run('git', ['-C', worktree, 'apply', '--check', patchFile])", 'proof runner replay');
requireText(proof, "if (JSON.stringify(paths) !== JSON.stringify([FIXTURE]))", 'proof runner scope check');
requireText(proof, "if (status !== `?? ${FIXTURE}`)", 'proof runner replay status check');
requireText(proof, "sameEnvironmentForAllStages: true", 'proof runner evidence');
requireText(proof, "githubWriteAuthority: false", 'proof runner evidence');
requireText(proof, "patchApplicationAuthority: 'host validation only; no repository write performed'", 'proof runner evidence');

const gateStart = proof.indexOf('function commandGateScript()');
const gateEnd = proof.indexOf('\nfunction bootstrapEnvironment()', gateStart);
if (gateStart < 0 || gateEnd < 0) {
  errors.push('could not isolate commandGateScript');
} else {
  const gate = proof.slice(gateStart, gateEnd);
  rejectText(gate, 'subprocess', 'command gate');
  rejectText(gate, 'git ', 'command gate');
  rejectText(gate, 'EXPECTED_SHA', 'command gate');
  rejectText(gate, 'EXPECTED_REF', 'command gate');
}

for (const forbidden of [
  'ghp_',
  'github_pat_',
  'x-oauth-basic:',
  'Authorization: Bearer',
  'Authorization: Basic',
  'git push',
  'gh pr create',
  'gh pr merge',
  'git merge',
]) {
  rejectText(proof, forbidden, 'proof runner');
}

requireText(workflow, 'SW-OPS-002 Antigravity Proof V2', 'workflow');
requireText(workflow, liveLabel, 'workflow');
requireText(workflow, 'contents: read', 'workflow permissions');
requireText(workflow, 'persist-credentials: false', 'workflow checkout');
requireText(workflow, 'node --check tools/antigravity/sw-ops-002-proof-v2.mjs', 'workflow static lane');
requireText(workflow, 'node scripts/verify-sw-ops-002-proof-v2.mjs', 'workflow static lane');
requireText(workflow, '--dry-run', 'workflow static lane');
requireText(workflow, 'GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}', 'workflow live lane');
requireText(workflow, 'evidence/sw-ops-002-v2-live/proof.json', 'workflow live evidence');
rejectText(workflow, 'secrets.GITHUB_TOKEN', 'workflow');
rejectText(workflow, 'permissions: write', 'workflow');

if (errors.length) {
  console.error('SW-OPS-002 V2 verifier FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SW-OPS-002 V2 verifier PASS');
console.log(`- frozen base: ${exactBase}`);
console.log(`- allowed path: ${fixture}`);
console.log('- bootstrap uses only the live-proven exact-base normalizer');
console.log('- edit/correction update the same environment with host-mounted gate + approved command');
console.log('- command gate has no subprocess/Git mutation authority');
console.log('- host derives both patches and independently replays them on the frozen base');
console.log('- GitHub checkout credentials are not persisted and no GitHub write token is sent to the sandbox');
