import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const load = async (path) => JSON.parse(await readFile(path, 'utf8'));
const aMeta = await load('comparison/a/source-meta.json');
const bMeta = await load('comparison/b/source-meta.json');
assert.equal(aMeta.sha, 'ce1e47c858cdbca5039fb7ad7ad2545f4537c238');
assert.equal(bMeta.sha, '00e57966ba70f69dcf6d65de7ef9c40d1e67bbf3');
assert.equal(aMeta.adapterLaw, 'same assertions, state-driven waits only');
assert.equal(bMeta.adapterLaw, 'same assertions, state-driven waits only');

function assertCleanReport(label, report, { assetErrors = true } = {}) {
  assert.equal(report.passed, true, `${label} must pass every repository check`);
  assert.deepEqual(report.pageErrors ?? [], [], `${label} page errors`);
  assert.deepEqual(report.runtimeConsoleErrors ?? [], [], `${label} runtime console errors`);
  if (assetErrors) assert.deepEqual(report.assetTransportErrors ?? [], [], `${label} asset transport errors`);
}

const aGame = await load('comparison/a/sw-game-002/report.json');
const bGame = await load('comparison/b/sw-game-002/report.json');
assertCleanReport('Source A GAME-002', aGame);
assertCleanReport('Source B GAME-002', bGame);
assert.deepEqual(bGame.checks, aGame.checks, 'GAME-002 check matrix must match A/B');

const aScore = await load('comparison/a/sw-score-001/report.json');
const bScore = await load('comparison/b/sw-score-001/report.json');
assertCleanReport('Source A Scorekeeper', aScore);
assertCleanReport('Source B Scorekeeper', bScore);
assert.deepEqual(bScore.checks, aScore.checks, 'Scorekeeper check matrix must match A/B');

const aRpg = await load('comparison/a/sw-rpg-001/report.json');
const bRpg = await load('comparison/b/sw-rpg-001/report.json');
assertCleanReport('Source A RPG-001', aRpg);
assertCleanReport('Source B RPG-001', bRpg);
assert.deepEqual(bRpg.checks, aRpg.checks, 'RPG-001 check matrix must match A/B');

const pwa = await load('comparison/b/sw-pwa-001/pwa-browser-qa-report.json');
assert.equal(pwa.passed, true, 'Source B PWA browser');
assert.deepEqual(pwa.errors, [], 'Source B PWA errors');
assert.equal(pwa.checks.productionStyleLoadsBuildInfoWithoutQaProbe, true);
assert.equal(pwa.checks.noQaBuildProbingHttp404, true);
assert.equal(pwa.checks.noPageErrors, true);

const summary = {
  verdict: 'PASS',
  sourceA: aMeta.sha,
  sourceB: bMeta.sha,
  game002: bGame.checks,
  scorekeeper: bScore.checks,
  rpg001: bRpg.checks,
  pwa: pwa.checks,
  pageErrors: { a: aGame.pageErrors, b: bGame.pageErrors },
  runtimeConsoleErrors: { a: aGame.runtimeConsoleErrors, b: bGame.runtimeConsoleErrors },
  assetTransportErrors: { a: aGame.assetTransportErrors, b: bGame.assetTransportErrors },
  harnessLaw: 'No required acceptance command is masked. CI adapters replace waits only; repository assertions remain unchanged.',
};
await writeFile('sw-int-003-closure-summary.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
