import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
const bridgePath = path.join(projectRoot, 'runtime', 'modernization-phase2-clocks.js');

let html = await readFile(sourcePath, 'utf8');
const bridgeSource = (await readFile(bridgePath, 'utf8')).trim();
const marker = 'MODERNIZATION_PHASE2_CLOCKS_V1';

if (html.includes(marker)) {
  console.log(`Phase 2 clock bridge already present in ${sourcePath}`);
  process.exit(0);
}

for (const prerequisite of [
  'V500_REALTIME_RUN_CLOCK_V1',
  'V510_THREEJS_PRODUCTION_SLICE_V1',
  'runTimeRemaining - runClockDelta',
  '[SW:VISUAL:PRODUCTION_SLICE_BUNDLE]'
]) {
  if (!html.includes(prerequisite)) {
    throw new Error(`Phase 2 clocks require the accepted V5.1 runtime: missing ${prerequisite}`);
  }
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  `  runTimeRemaining = getActiveCampaignLevel().durationSeconds;\n  runClockLastTimestamp = performance.now();`,
  `  runTimeRemaining = getActiveCampaignLevel().durationSeconds;\n  runClockLastTimestamp = performance.now();\n  globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.reset(runTimeRemaining, runClockLastTimestamp);`,
  'warning-run reset clock bridge'
);

replaceExact(
  `    lastFrameTime = performance.now();\n    runClockLastTimestamp = lastFrameTime;\n    if (runSuspendedByVisibility) {`,
  `    lastFrameTime = performance.now();\n    runClockLastTimestamp = lastFrameTime;\n    globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.resume(lastFrameTime);\n    if (runSuspendedByVisibility) {`,
  'visibility-resume clock bridge'
);

replaceExact(
  `  const realDelta = Math.min(0.1, (now - lastFrameTime) / 1000);\n  const rawRunClockDelta = Math.max(0, (now - runClockLastTimestamp) / 1000);\n  // A delay over one second indicates a suspended/backgrounded renderer. The\n  // visibility handler also resets this clock, but this guard covers OS stalls.\n  const runClockDelta = rawRunClockDelta <= 1 ? rawRunClockDelta : 0;\n  lastFrameTime = now;\n  runClockLastTimestamp = now;\n\n  const dt = realDelta;`,
  `  const realDelta = Math.min(0.1, (now - lastFrameTime) / 1000);\n  const modernClockSample = globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.sample({\n    nowMs: now,\n    renderDeltaMs: realDelta * 1000,\n    simulationDeltaMs: realDelta * 1000,\n    runActive: Boolean(runActive),\n    paused: Boolean(isPaused),\n    remainingSeconds: Number(runTimeRemaining)\n  });\n  // Compatibility mirrors remain until the legacy loop is fully retired.\n  const runClockDelta = modernClockSample\n    ? modernClockSample.runDeltaMs / 1000\n    : Math.max(0, Math.min(1, (now - runClockLastTimestamp) / 1000));\n  lastFrameTime = now;\n  runClockLastTimestamp = now;\n\n  const dt = realDelta;`,
  'authoritative Phase 2 clock sample'
);

const mainScriptCloseIndex = html.lastIndexOf('</script>');
const bodyCloseIndex = html.lastIndexOf('</body>');
if (mainScriptCloseIndex < 0 || bodyCloseIndex < 0 || mainScriptCloseIndex > bodyCloseIndex) {
  throw new Error('Phase 2 clock bundle could not locate the final game script boundary.');
}
if (bridgeSource.includes('</script>')) {
  throw new Error('Phase 2 clock bridge contains a closing script tag.');
}

const bundledBridge = `\n\n// [SW:SOURCE:modernization-phase2-clocks.js]\n${bridgeSource}\n`;
html = html.slice(0, mainScriptCloseIndex) + bundledBridge + html.slice(mainScriptCloseIndex);

for (const required of [
  marker,
  '[SW:ARCH:PHASE2_CLOCK_BRIDGE]',
  '__SW_PHASE2_CLOCK_BRIDGE__',
  'modernClockSample.runDeltaMs / 1000',
  'globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.reset',
  'globalThis.__SW_PHASE2_CLOCK_BRIDGE__?.resume'
]) {
  if (!html.includes(required)) throw new Error(`Phase 2 clock verification failed: missing ${required}`);
}
if (html.includes('const rawRunClockDelta')) {
  throw new Error('Legacy raw run-clock authority remains after Phase 2 bridge insertion.');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied Phase 2 clock authority bridge to ${sourcePath}`);
