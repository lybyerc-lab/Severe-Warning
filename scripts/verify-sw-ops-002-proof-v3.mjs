#!/usr/bin/env node

// [SW:OPS:002:PROOF_V3_VERIFIER]

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const proofPath = path.join(root, 'tools', 'antigravity', 'sw-ops-002-proof-v3.mjs');
const workflowPath = path.join(root, '.github', 'workflows', 'sw-ops-002-antigravity-proof-v3.yml');
const proof = await readFile(proofPath, 'utf8');
const workflow = await readFile(workflowPath, 'utf8');
const errors = [];

const exactBase = '10ccd2723b8fa6b925f47629491a9e51e6388500';
const exactRef = 'agent/sw-ops-001-antigravity-bridge';
const fixture = 'tools/antigravity/fixtures/sw-ops-002-smoke.txt';
const liveLabel = 'antigravity-sandbox-smoke-v3';

function requireText(text, needle, label) {
  if (!text.includes(needle)) errors.push(`${label} missing required marker: ${needle}`);
}
function rejectText(text, needle, label) {
  if (text.includes(needle)) errors.push(`${label} contains forbidden marker: ${needle}`);
}

requireText(proof, 'SW:OPS:002:PROOF_V3', 'proof runner');
requireText(proof, exactBase, 'proof runner');
requireText(proof, exactRef, 'proof runner');
requireText(proof, fixture, 'proof runner');
requireText(proof, "const STAGE_PATH = '/.agents/sw-ops-002-stage'", 'proof runner');
requireText(proof, "command: 'python3 /.agents/hooks-scripts/exact_base_normalize.py'", 'proof runner');
requireText(proof, "command: 'python3 /.agents/hooks-scripts/stage_gate.py'", 'proof runner');
requireText(proof, 'git("fetch", "--no-tags", "--depth=1", "origin", EXPECTED_REF)', 'normalizer');
requireText(proof, 'git("checkout", "--detach", EXPECTED_SHA)', 'normalizer');
requireText(proof, 'COMMANDS = {', 'stage gate');
requireText(proof, '"bootstrap": "bash /.agents/bootstrap-command.sh"', 'stage gate');
requireText(proof, '"initial-ready": "bash /.agents/initial-command.sh"', 'stage gate');
requireText(proof, '"correction-ready": "bash /.agents/correction-command.sh"', 'stage gate');
requireText(proof, 'SW-OPS-002 stage is complete; no further tool call is authorized.', 'stage gate');
requireText(proof, "target: '.agents/bootstrap-command.sh'", 'initial environment');
requireText(proof, "target: '.agents/initial-command.sh'", 'initial environment');
requireText(proof, "target: '.agents/correction-command.sh'", 'initial environment');
requireText(proof, "environment: environmentId", 'reuse request');
requireText(proof, "reuseMode: 'environment-id-string-only'", 'dry run');
requireText(proof, 'sourceUpdateAfterCreation: false', 'dry run');
requireText(proof, "stageSequence: ['bootstrap', 'initial-ready', 'correction-ready', 'done']", 'dry run');
requireText(proof, "if (bootSnap.stage !== 'initial-ready')", 'bootstrap stage proof');
requireText(proof, "if (initialSnap.stage !== 'correction-ready')", 'initial stage proof');
requireText(proof, "if (correctedSnap.stage !== 'done')", 'correction stage proof');
requireText(proof, 'sameEnvironmentForAllStages: true', 'final proof');
requireText(proof, 'sourceUpdateAfterCreation: false', 'final proof');
requireText(proof, "finalStage: 'done'", 'final proof');
requireText(proof, "githubWriteAuthority: false", 'final proof');
requireText(proof, "patchApplicationAuthority: 'host validation only; no repository write performed'", 'final proof');
requireText(proof, 'import json, os, shutil, sys, tarfile', 'snapshot materializer');
requireText(proof, 'non-regular repository member outside .git', 'snapshot materializer');
requireText(proof, "run('rsync', ['-a', '--delete'", 'patch derivation');
requireText(proof, "'diff', '--binary', '--no-ext-diff', '--full-index', 'HEAD'", 'patch derivation');
requireText(proof, "run('git', ['-C', worktree, 'apply', '--check', patchFile])", 'patch replay');
requireText(proof, "if (JSON.stringify(paths) !== JSON.stringify([FIXTURE]))", 'scope check');

const gateStart = proof.indexOf('function stageGateScript()');
const gateEnd = proof.indexOf('\nfunction bootstrapCommand()', gateStart);
if (gateStart < 0 || gateEnd < 0) {
  errors.push('could not isolate stageGateScript');
} else {
  const gate = proof.slice(gateStart, gateEnd);
  rejectText(gate, 'subprocess', 'stage gate');
  rejectText(gate, 'git ', 'stage gate');
  rejectText(gate, 'EXPECTED_SHA', 'stage gate');
  rejectText(gate, 'EXPECTED_REF', 'stage gate');
  rejectText(gate, 'open(STAGE_PATH, "w"', 'stage gate');
}

const reuseStart = proof.indexOf('function reuseRequest(');
const reuseEnd = proof.indexOf('\nasync function verifyEnvironment', reuseStart);
if (reuseStart < 0 || reuseEnd < 0) {
  errors.push('could not isolate reuseRequest');
} else {
  const reuse = proof.slice(reuseStart, reuseEnd);
  requireText(reuse, 'environment: environmentId', 'reuseRequest');
  rejectText(reuse, 'sources:', 'reuseRequest');
  rejectText(reuse, 'environment_id', 'reuseRequest');
  rejectText(reuse, "type: 'remote'", 'reuseRequest');
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
]) rejectText(proof, forbidden, 'proof runner');

requireText(workflow, 'SW-OPS-002 Antigravity Proof V3', 'workflow');
requireText(workflow, liveLabel, 'workflow');
requireText(workflow, 'contents: read', 'workflow');
requireText(workflow, 'persist-credentials: false', 'workflow');
requireText(workflow, 'node --check tools/antigravity/sw-ops-002-proof-v3.mjs', 'workflow static');
requireText(workflow, 'node scripts/verify-sw-ops-002-proof-v3.mjs', 'workflow static');
requireText(workflow, '--dry-run', 'workflow static');
requireText(workflow, 'GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}', 'workflow live');
requireText(workflow, 'evidence/sw-ops-002-v3-live/proof.json', 'workflow proof');
requireText(workflow, 'if: always()', 'workflow failure evidence');
rejectText(workflow, 'secrets.GITHUB_TOKEN', 'workflow');
rejectText(workflow, 'permissions: write', 'workflow');

if (errors.length) {
  console.error('SW-OPS-002 V3 verifier FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SW-OPS-002 V3 verifier PASS');
console.log(`- frozen base: ${exactBase}`);
console.log(`- allowed path: ${fixture}`);
console.log('- normalizer and stage gate are pre-mounted at environment creation');
console.log('- stage gate has no subprocess/Git mutation authority');
console.log('- later interactions reuse the environment ID string only; no source updates');
console.log('- stage sequence is host-verified outside the repository');
console.log('- host derives and independently replays both one-file patches');
console.log('- GitHub credentials are not persisted or sent to the sandbox');
