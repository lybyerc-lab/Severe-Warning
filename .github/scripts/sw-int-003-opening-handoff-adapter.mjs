import { readFile, writeFile } from 'node:fs/promises';

const path = 'scripts/.ci-qa-sw-game-002-state-driven.mjs';
let source = await readFile(path, 'utf8');

function replaceExact(before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  source = source.replace(before, after);
}

const settleOpening = `await page.waitForFunction(() => {
  const state = globalThis.getMooLevelQaState?.();
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.();
  return state?.encounter?.activated === true || opening?.active === true;
}, null, { timeout: 15000 });
await page.evaluate(() => {
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
  const snapshot = opening?.getSnapshot?.();
  if (!snapshot?.active) return;
  opening.debugSeek(Math.max(0, opening.duration - 0.05));
  opening.frame(performance.now(), 0.1);
});`;

replaceExact(
  "await page.waitForFunction(() => { const state = globalThis.getMooLevelQaState?.(); return state?.executorTicks > 0 && state?.encounter?.activated === true; }, null, { timeout: 60000 });",
  `${settleOpening}\nawait page.waitForFunction(() => { const state = globalThis.getMooLevelQaState?.(); return state?.executorTicks > 0 && state?.encounter?.activated === true; }, null, { timeout: 15000 });`,
  'initial accepted opening handoff'
);

replaceExact(
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\nawait page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });",
  `await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginEncounter());\n${settleOpening}\nawait page.waitForFunction(() => globalThis.getMooLevelQaState?.().encounter?.activated === true, null, { timeout: 15000 });`,
  'second accepted opening handoff'
);

replaceExact(
  "await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\nawait page.waitForFunction(() => globalThis.getMooLevelQaState?.().mode === 'moo', null, { timeout: 15000 });",
  `await page.evaluate(() => globalThis.__SW_MOO_LEVEL_QA__.beginMooLevel());\nawait page.waitForFunction(() => {
  const state = globalThis.getMooLevelQaState?.();
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__?.getSnapshot?.();
  return state?.mode === 'moo' || opening?.active === true;
}, null, { timeout: 15000 });
await page.evaluate(() => {
  const opening = globalThis.__SW_OPENING_CINEMATIC_PLAYABLE__;
  const snapshot = opening?.getSnapshot?.();
  if (!snapshot?.active) return;
  opening.debugSeek(Math.max(0, opening.duration - 0.05));
  opening.frame(performance.now(), 0.1);
});
await page.waitForFunction(() => globalThis.getMooLevelQaState?.().mode === 'moo', null, { timeout: 15000 });`,
  'Moo Level accepted opening handoff'
);

await writeFile(path, source, 'utf8');
console.log('Applied deterministic accepted-opening handoff adapter. The cinematic still begins normally and finishes through its own natural frame/finish path; GAME assertions are unchanged.');
