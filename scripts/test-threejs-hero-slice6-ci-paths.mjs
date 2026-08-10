import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = await readFile(path.join(projectRoot, '.github', 'workflows', 'threejs-hero-slice6.yml'), 'utf8');
const ignored = ['Docs/', '.github/ISSUE_TEMPLATE/', '.github/PULL_REQUEST_TEMPLATE.md', 'AGENTS.md', 'CURRENT_STATUS.md'];
const isIgnored = file => ignored.some(prefix => prefix.endsWith('/') ? file.startsWith(prefix) : file === prefix);
const shouldRun = files => files.some(file => !isIgnored(file));

assert.match(workflow, /paths-ignore:/);
for (const ignoredPath of ignored) assert.match(workflow, new RegExp(ignoredPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
assert.equal(shouldRun(['Docs/ACTIVE_PRODUCTION_SLATE.md', 'AGENTS.md']), false);
assert.equal(shouldRun(['runtime/threejs-visual-hero-slice6.js']), true);
assert.equal(shouldRun(['scripts/qa-threejs-hero-slice6.mjs']), true);
assert.equal(shouldRun(['assets/production/vfx/kenney/dirt_01.png']), true);
assert.equal(shouldRun(['.github/workflows/threejs-hero-slice6.yml']), true);
assert.match(workflow, /prepare-slice5-reference:/);
assert.match(workflow, /prepare-slice5-reference:[\s\S]*?build-candidate:\s*[\s\S]*?runs-on: ubuntu-24\.04/);
assert.match(workflow, /core-browser-qa:\s*[\s\S]*?needs: build-candidate/);
assert.match(workflow, /presentation-browser-qa:\s*[\s\S]*?needs: build-candidate/);
assert.match(workflow, /same-runner-performance:\s*[\s\S]*?needs: \[prepare-slice5-reference, build-candidate\]/);
assert.match(workflow, /package-evidence:\s*[\s\S]*?needs: \[build-candidate, core-browser-qa, presentation-browser-qa, same-runner-performance\]/);
assert.match(workflow, /qa-candidate-contract\.mjs validate/);
assert.match(workflow, /package_android/);
console.log('Hero Slice 6 CI path filter tests: PASS');
