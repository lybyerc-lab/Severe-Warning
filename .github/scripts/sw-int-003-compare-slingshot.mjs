import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const load = async (path) => JSON.parse(await readFile(path, 'utf8'));
const aMeta = await load('comparison/a/source-meta.json');
const bMeta = await load('comparison/b/source-meta.json');
assert.equal(aMeta.sha, '00e57966ba70f69dcf6d65de7ef9c40d1e67bbf3');
assert.equal(bMeta.sha, 'e0591f68bc90a4be8b39481db9e3c3c8c7378ad0');

function clean(label, report) {
  assert.equal(report.passed, true, `${label} must pass`);
  assert.deepEqual(report.pageErrors ?? [], [], `${label} page errors`);
  assert.deepEqual(report.runtimeConsoleErrors ?? [], [], `${label} runtime errors`);
  assert.deepEqual(report.assetTransportErrors ?? [], [], `${label} asset errors`);
}

const aGame = await load('comparison/a/sw-game-002/report.json');
const bGame = await load('comparison/b/sw-game-002/report.json');
clean('A GAME-002', aGame); clean('B GAME-002', bGame);
assert.deepEqual(bGame.checks, aGame.checks, 'GAME-002 matrix drift');

const aScore = await load('comparison/a/sw-score-001/report.json');
const bScore = await load('comparison/b/sw-score-001/report.json');
clean('A Scorekeeper', aScore); clean('B Scorekeeper', bScore);
assert.deepEqual(bScore.checks, aScore.checks, 'Scorekeeper matrix drift');

const aRpg = await load('comparison/a/sw-rpg-001/report.json');
const bRpg = await load('comparison/b/sw-rpg-001/report.json');
clean('A RPG-001', aRpg); clean('B RPG-001', bRpg);
assert.deepEqual(bRpg.checks, aRpg.checks, 'RPG-001 matrix drift');

const aPwa = await load('comparison/a/sw-pwa-001/pwa-browser-qa-report.json');
const bPwa = await load('comparison/b/sw-pwa-001/pwa-browser-qa-report.json');
assert.equal(aPwa.passed, true); assert.equal(bPwa.passed, true);
assert.deepEqual(aPwa.errors, []); assert.deepEqual(bPwa.errors, []);
assert.deepEqual(bPwa.checks, aPwa.checks, 'PWA matrix drift');

const sling = await load('comparison/b/sw-rpg-002/report.json');
clean('B Slingshot', sling);
for (const [name, value] of Object.entries(sling.checks)) assert.equal(value, true, `Slingshot ${name}`);

const summary = {
  verdict: 'PASS',
  sourceA: aMeta.sha,
  sourceB: bMeta.sha,
  game002: bGame.checks,
  scorekeeper: bScore.checks,
  rpg001: bRpg.checks,
  pwa: bPwa.checks,
  slingshot: sling.checks,
  errors: {
    game: { a: { page: aGame.pageErrors, runtime: aGame.runtimeConsoleErrors, assets: aGame.assetTransportErrors }, b: { page: bGame.pageErrors, runtime: bGame.runtimeConsoleErrors, assets: bGame.assetTransportErrors } },
    scorekeeper: { a: { page: aScore.pageErrors, runtime: aScore.runtimeConsoleErrors, assets: aScore.assetTransportErrors }, b: { page: bScore.pageErrors, runtime: bScore.runtimeConsoleErrors, assets: bScore.assetTransportErrors } },
    slingshot: { page: sling.pageErrors, runtime: sling.runtimeConsoleErrors, assets: sling.assetTransportErrors }
  },
  law: 'Accepted Slingshot delta only; inherited matrices must remain identical and every required browser error array must be empty.'
};
await writeFile('sw-int-003-slingshot-closure-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
