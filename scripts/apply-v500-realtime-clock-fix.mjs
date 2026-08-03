import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

if (html.includes('V500_REALTIME_RUN_CLOCK_V1')) {
  console.log(`V5 real-time run clock already present in ${sourcePath}`);
  process.exit(0);
}

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  '  runTimeRemaining = getActiveCampaignLevel().durationSeconds;',
  `  runTimeRemaining = getActiveCampaignLevel().durationSeconds;
  runClockLastTimestamp = performance.now();`,
  'reset warning-run clock'
);

replaceExact(
  `let lastFrameTime = performance.now();
let fpsTimer = performance.now();`,
  `let lastFrameTime = performance.now();

// [SW:GAMEPLAY:RUN_CLOCK]
// V500_REALTIME_RUN_CLOCK_V1: the warning clock uses monotonic wall time while
// simulation systems retain their defensive frame-delta cap. This keeps a
// three-minute run three minutes long on a slow renderer without charging time
// while the game is paused, hidden, or recovering from a long suspension.
let runClockLastTimestamp = lastFrameTime;
// [SW:GAMEPLAY:RUN_CLOCK:END]

let fpsTimer = performance.now();`,
  'run clock state and stable anchor'
);

replaceExact(
  `  } else {
    lastFrameTime = performance.now();
    if (runSuspendedByVisibility) {`,
  `  } else {
    lastFrameTime = performance.now();
    runClockLastTimestamp = lastFrameTime;
    if (runSuspendedByVisibility) {`,
  'visibility-resume clock reset'
);

replaceExact(
  `  const realDelta = Math.min(0.1, (now - lastFrameTime) / 1000);
  lastFrameTime = now;

  const dt = realDelta;`,
  `  const realDelta = Math.min(0.1, (now - lastFrameTime) / 1000);
  const rawRunClockDelta = Math.max(0, (now - runClockLastTimestamp) / 1000);
  // A delay over one second indicates a suspended/backgrounded renderer. The
  // visibility handler also resets this clock, but this guard covers OS stalls.
  const runClockDelta = rawRunClockDelta <= 1 ? rawRunClockDelta : 0;
  lastFrameTime = now;
  runClockLastTimestamp = now;

  const dt = realDelta;`,
  'real-time warning clock delta'
);

replaceExact(
  `  // Run Timer & Stage Transitions
  if (runActive) {
    runTimeRemaining = Math.max(0, runTimeRemaining - dt);`,
  `  // Run Timer & Stage Transitions
  if (runActive && !isPaused) {
    runTimeRemaining = Math.max(0, runTimeRemaining - runClockDelta);`,
  'real-time warning clock consumption'
);

for (const marker of [
  'V500_REALTIME_RUN_CLOCK_V1',
  '[SW:GAMEPLAY:RUN_CLOCK]',
  '[SW:GAMEPLAY:RUN_CLOCK:END]',
  'runClockLastTimestamp = performance.now();',
  'runTimeRemaining - runClockDelta',
  'if (runActive && !isPaused)'
]) {
  if (!html.includes(marker)) {
    throw new Error(`V5 real-time run-clock verification failed: missing ${marker}`);
  }
}

if (html.includes('runTimeRemaining - dt')) {
  throw new Error('V5 real-time run-clock verification failed: capped simulation delta still drives the run timer');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied V5 real-time run-clock fix to ${sourcePath}`);
