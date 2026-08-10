import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contractScript = path.join(projectRoot, 'scripts', 'qa-candidate-contract.mjs');
const sourceCommit = '0123456789abcdef0123456789abcdef01234567';
const root = await mkdtemp(path.join(os.tmpdir(), 'severe-weather-qa-contract-'));

function run(args, shouldPass = true) {
  try {
    execFileSync(process.execPath, [contractScript, ...args], { stdio: 'pipe' });
    assert.equal(shouldPass, true, `expected command to fail: ${args.join(' ')}`);
  } catch (error) {
    assert.equal(shouldPass, false, `expected command to pass: ${args.join(' ')}\n${error.stderr?.toString() || error.message}`);
  }
}

try {
  await mkdir(path.join(root, 'web-preview'), { recursive: true });
  await mkdir(path.join(root, 'reports'), { recursive: true });
  await mkdir(path.join(root, 'evidence'), { recursive: true });
  await writeFile(path.join(root, 'web-preview', 'index.html'), '<!-- REQUIRED_BRIDGE -->');
  await writeFile(path.join(root, 'reports', 'core.json'), '{"passed":true}\n');
  await writeFile(path.join(root, 'evidence', 'frame.png'), 'not-a-real-png-but-nonempty');
  const create = ['create', '--root', root, '--manifest', 'package-manifest.json', '--source-commit', sourceCommit, '--source-branch', 'agent/test', '--renderer', 'Three.js r128', '--acceptance', 'browser-candidate', '--web-root', 'web-preview', '--require-marker', 'web-preview/index.html::REQUIRED_BRIDGE', '--require-evidence', 'evidence/frame.png', '--require-report', 'reports/core.json'];
  run(create);
  run(['validate', '--root', root, '--manifest', 'package-manifest.json', '--expected-source', sourceCommit]);
  run(['validate', '--root', root, '--manifest', 'package-manifest.json', '--expected-source', 'fedcba9876543210fedcba9876543210fedcba98'], false);
  await writeFile(path.join(root, 'web-preview', 'index.html'), '<!-- bridge removed -->');
  run(['validate', '--root', root, '--manifest', 'package-manifest.json'], false);
  await writeFile(path.join(root, 'web-preview', 'index.html'), '<!-- REQUIRED_BRIDGE -->');
  run(create);
  await rm(path.join(root, 'evidence', 'frame.png'));
  run(['validate', '--root', root, '--manifest', 'package-manifest.json'], false);
  await writeFile(path.join(root, 'evidence', 'frame.png'), 'restored');
  run(create);
  await writeFile(path.join(root, 'reports', 'core.json'), '{"passed":false}\n');
  run(['validate', '--root', root, '--manifest', 'package-manifest.json'], false);
  console.log('QA candidate contract tests: PASS');
} finally {
  await rm(root, { recursive: true, force: true });
}
