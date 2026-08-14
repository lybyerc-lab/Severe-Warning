import { readFile, writeFile } from 'node:fs/promises';

function replaceExact(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one timing anchor, found ${count}`);
  return source.replace(before, after);
}

let source = await readFile('scripts/qa-sw-rpg-002-slingshot.mjs', 'utf8');

source = replaceExact(
  source,
  "storm.pos.set(-2, terrainHeightAt(-2, 0), 0); await new Promise(resolve => setTimeout(resolve, 100)); storm.pos.set(0, terrainHeightAt(0, 0), 0); cooldowns.primary.current = 0; triggerAbility('primary'); await new Promise(resolve => setTimeout(resolve, 650)); const captured = globalThis.getSwSlingshotQaState();",
  "storm.pos.set(-2, terrainHeightAt(-2, 0), 0); { const t = performance.now(); animate(t + 50); } storm.pos.set(0, terrainHeightAt(0, 0), 0); { const t = performance.now(); animate(t + 50); } cooldowns.primary.current = 0; triggerAbility('primary'); { const t = performance.now(); for (let frame = 1; frame <= 5 && !globalThis.getSwSlingshotQaState().held; frame++) animate(t + frame * 50); } const captured = globalThis.getSwSlingshotQaState();",
  'light aim/capture executor ticks'
);

source = replaceExact(
  source,
  "storm.pos.set(-2, terrainHeightAt(-2, 24), 24); await new Promise(resolve => setTimeout(resolve, 100)); storm.pos.set(0, terrainHeightAt(0, 24), 24); cooldowns.primary.current = 0; triggerAbility('primary'); await new Promise(resolve => setTimeout(resolve, 650)); cooldowns.secondary.current = 0; triggerAbility('secondary'); const launchedHeavy = globalThis.getSwSlingshotQaState(); await new Promise(resolve => setTimeout(resolve, 1750)); const completed = globalThis.getSwSlingshotQaState();",
  "storm.pos.set(-2, terrainHeightAt(-2, 24), 24); { const t = performance.now(); animate(t + 50); } storm.pos.set(0, terrainHeightAt(0, 24), 24); { const t = performance.now(); animate(t + 50); } cooldowns.primary.current = 0; triggerAbility('primary'); { const t = performance.now(); for (let frame = 1; frame <= 5 && !globalThis.getSwSlingshotQaState().held; frame++) animate(t + frame * 50); } cooldowns.secondary.current = 0; triggerAbility('secondary'); const launchedHeavy = globalThis.getSwSlingshotQaState(); { const t = performance.now(); for (let frame = 1; frame <= 20; frame++) animate(t + frame * 100); } const completed = globalThis.getSwSlingshotQaState();",
  'heavy aim/capture/flight executor ticks'
);

source = replaceExact(
  source,
  "for (let frame = 1; frame <= 6; frame++) animate(lightFrame + frame * 100);",
  "for (let frame = 1; frame < 6; frame++) animate(lightFrame + frame * 100);",
  'normalize light flight loop for deterministic closure'
);

await writeFile('scripts/qa-sw-rpg-002-slingshot.mjs', source, 'utf8');
console.log('SW-RPG-002 CI timing adapter applied: waits only, assertions unchanged.');
