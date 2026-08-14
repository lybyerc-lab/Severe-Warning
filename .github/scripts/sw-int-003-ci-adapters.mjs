import { cp, readFile, rm, writeFile } from 'node:fs/promises';

function replaceExact(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one timing anchor, found ${count}`);
  return source.replace(before, after);
}

// Raw browser fixtures serve from repository root, while production packaging
// maps generated assets/audio to /audio. Mirror that exact build-web contract
// here so transport assertions measure product/runtime behavior, not fixture layout.
await rm('audio', { recursive: true, force: true });
await cp('assets/audio', 'audio', { recursive: true });

let game = await readFile('scripts/qa-sw-game-002.mjs', 'utf8');
game = replaceExact(
  game,
  "await page.waitForTimeout(500);\nconst started = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "await page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });\nconst started = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'GAME started activation'
);
game = replaceExact(
  game,
  "await page.waitForTimeout(500);\nconst failedEncounter = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "await page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.state === 'failed', null, { timeout: 15000 });\nconst failedEncounter = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'GAME failure state'
);
game = replaceExact(
  game,
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\nawait page.waitForTimeout(500);\nawait page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());",
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\nawait page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });\nawait page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());",
  'GAME second activation'
);
game = replaceExact(
  game,
  "await page.waitForTimeout(3000);\nconst unlocked = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "await page.waitForFunction(() => { const state = globalThis.getMooLevelQaState?.(); return state?.progress?.mooLevelUnlocked === true && state?.encounter?.state === 'complete'; }, null, { timeout: 30000 });\nconst unlocked = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'GAME unlock completion'
);
game = replaceExact(
  game,
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\nawait page.waitForTimeout(750);\nconst mooStarted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\nawait page.waitForFunction(() => globalThis.getMooLevelQaState?.().mode === 'moo', null, { timeout: 15000 });\nconst mooStarted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'GAME Moo mode start'
);
game = replaceExact(
  game,
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());\nawait page.waitForTimeout(1800);\nconst mooCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());\nawait page.waitForFunction(() => { const run = globalThis.getMooLevelQaState?.().mooRun; return run?.relocated >= 20 && run?.props >= 10 && run?.airtime > 0; }, null, { timeout: 20000 });\nconst mooCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'GAME Moo objectives'
);
await writeFile('scripts/.ci-qa-sw-game-002-state-driven.mjs', game, 'utf8');

let score = await readFile('scripts/qa-sw-score-001-persistent-scorekeeper.mjs', 'utf8');
score = replaceExact(
  score,
  "  const page = await context.newPage();\n  page.on('pageerror', error => report.pageErrors.push(error.message));",
  "  const page = await context.newPage();\n  const ciHttpErrors = [];\n  const ciFailedRequests = [];\n  page.on('response', response => { if (response.status() >= 400) ciHttpErrors.push({ status: response.status(), url: response.url() }); });\n  page.on('requestfailed', request => ciFailedRequests.push({ url: request.url(), errorText: request.failure()?.errorText || 'unknown' }));\n  page.on('pageerror', error => report.pageErrors.push(error.message));",
  'SCORE HTTP diagnostics'
);
score = replaceExact(
  score,
  "  await page.waitForTimeout(500);\n  const mooRegressionStarted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "  await page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });\n  const mooRegressionStarted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'SCORE started activation'
);
score = replaceExact(
  score,
  "  await page.waitForTimeout(500);\n  const mooRegressionFailed = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "  await page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.state === 'failed', null, { timeout: 15000 });\n  const mooRegressionFailed = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'SCORE failure state'
);
score = replaceExact(
  score,
  "  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\n  await page.waitForTimeout(500);\n  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());",
  "  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\n  await page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });\n  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeEncounterSuccess());",
  'SCORE second activation'
);
score = replaceExact(
  score,
  "  await page.waitForTimeout(3000);\n  const mooRegressionUnlocked = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "  await page.waitForFunction(() => { const state = globalThis.getMooLevelQaState?.(); return state?.progress?.mooLevelUnlocked === true && state?.encounter?.state === 'complete'; }, null, { timeout: 30000 });\n  const mooRegressionUnlocked = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'SCORE unlock completion'
);
score = replaceExact(
  score,
  "  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\n  await page.waitForTimeout(650);\n  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());",
  "  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\n  await page.waitForFunction(() => globalThis.getMooLevelQaState?.().mode === 'moo', null, { timeout: 15000 });\n  await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.primeMooObjectives());",
  'SCORE Moo mode start'
);
score = replaceExact(
  score,
  "  await page.waitForTimeout(1800);\n  const mooRegressionCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  "  await page.waitForFunction(() => { const state = globalThis.getMooLevelQaState?.(); const run = state?.mooRun; return run?.relocated >= 20 && run?.props >= 10 && run?.airtime > 0 && state?.allMooCowsSafe === true; }, null, { timeout: 20000 });\n  const mooRegressionCompleted = await page.evaluate(() => globalThis.getMooLevelQaState());",
  'SCORE Moo objectives'
);
score = replaceExact(
  score,
  "  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message));\n  report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message));",
  "  report.assetTransportErrors = consoleErrors.filter(message => /ERR_FILE_NOT_FOUND|Failed to load resource/.test(message));\n  report.runtimeConsoleErrors = consoleErrors.filter(message => !report.assetTransportErrors.includes(message));\n  report.ciHttpErrors = ciHttpErrors;\n  report.ciFailedRequests = ciFailedRequests;\n  console.log('CI_HTTP_ERRORS ' + JSON.stringify(ciHttpErrors));\n  console.log('CI_FAILED_REQUESTS ' + JSON.stringify(ciFailedRequests));",
  'SCORE HTTP diagnostic report'
);
await writeFile('scripts/.ci-qa-sw-score-001-state-driven.mjs', score, 'utf8');

console.log('Built state-driven CI adapters and mirrored the production audio path for raw-browser fixture parity. Assertions are unchanged; fixed wall-clock waits become observable-state waits.');
