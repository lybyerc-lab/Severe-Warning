import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');

let html = await readFile(sourcePath, 'utf8');

function replaceExact(before, after, label) {
  const count = html.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`${label}: expected exactly one source match, found ${count}`);
  }
  html = html.replace(before, after);
}

replaceExact(
  `function togglePauseMenu() {
  // QA4_INPUT_ISOLATION_V1: ignore a short-lived mobile ghost click armed by QA controls.
  if ((window.__SW_QA_INPUT_SHIELD_UNTIL__ || 0) > performance.now()) return;`,
  `function togglePauseMenu() {
  // QA4_RUN_LOCK_V1: the deterministic run owns pause state for its full duration.
  if (window.__SW_QA_TEST_LOCK__ === true) {
    window.__SW_QA_BLOCKED_PAUSE_COUNT__ = (window.__SW_QA_BLOCKED_PAUSE_COUNT__ || 0) + 1;
    return;
  }
  // QA4_INPUT_ISOLATION_V1: ignore a short-lived mobile ghost click armed by QA controls.
  if ((window.__SW_QA_INPUT_SHIELD_UNTIL__ || 0) > performance.now()) return;`,
  'QA4 full-run pause guard'
);

replaceExact(
  `function runQa4DeterministicTest() {
  qa4ArmInputShield(1200);
  if (qa4State.running) return;`,
  `function runQa4DeterministicTest() {
  if (qa4State.running) return;
  qa4ArmInputShield(1800);
  window.__SW_QA_TEST_LOCK__ = true;
  window.__SW_QA_BLOCKED_PAUSE_COUNT__ = 0;`,
  'QA4 run lock activation'
);

replaceExact(
  `  qa4State.result = {
    version: 'QA4_DETERMINISTIC_V1',`,
  `  const blockedPauseAttempts = window.__SW_QA_BLOCKED_PAUSE_COUNT__ || 0;
  qa4State.result = {
    version: 'QA4_DETERMINISTIC_V1',`,
  'QA4 blocked-pause report capture'
);

replaceExact(
  `    audioVoiceCount: typeof activeVoiceCount === 'function' ? activeVoiceCount() : activeAudioVoices.length,
    consoleErrors: [...qa4State.consoleErrors],`,
  `    audioVoiceCount: typeof activeVoiceCount === 'function' ? activeVoiceCount() : activeAudioVoices.length,
    blockedPauseAttempts,
    consoleErrors: [...qa4State.consoleErrors],`,
  'QA4 blocked-pause report field'
);

replaceExact(
  `  window.__SEVERE_WEATHER_QA4_REPORT__ = qa4State.result;
  qa4State.running = false;`,
  `  window.__SEVERE_WEATHER_QA4_REPORT__ = qa4State.result;
  qa4State.running = false;
  window.__SW_QA_TEST_LOCK__ = false;`,
  'QA4 run lock release on finalize'
);

replaceExact(
  `function resetQa4VisualLab() {
  qa4State.running = false;`,
  `function resetQa4VisualLab() {
  window.__SW_QA_TEST_LOCK__ = false;
  qa4State.running = false;`,
  'QA4 run lock release on reset'
);

replaceExact(
  `  window.__SEVERE_WEATHER_QA4_REPORT__ = null;
  resetWarningRun();`,
  `  window.__SEVERE_WEATHER_QA4_REPORT__ = null;
  window.__SW_QA_BLOCKED_PAUSE_COUNT__ = 0;
  resetWarningRun();`,
  'QA4 pause counter reset'
);

replaceExact(
  `  window.setTimeout(() => {
    if (!qa4State.running) return;
    const pauseOverlayActive = Boolean(getCachedEl('pauseOverlay')?.classList.contains('active'));
    const leakedPause = isPaused || pauseOverlayActive;
    qa4ForceActiveState('post-tap-check');
    qa4SetCheck('inputIsolation', !leakedPause, 'isPaused=' + isPaused + ' overlayActive=' + pauseOverlayActive);
  }, 350);`,
  `  window.setTimeout(() => {
    if (!qa4State.running) return;
    const pauseOverlayActive = Boolean(getCachedEl('pauseOverlay')?.classList.contains('active'));
    const leakedPause = isPaused || pauseOverlayActive;
    const blockedPauseAttempts = window.__SW_QA_BLOCKED_PAUSE_COUNT__ || 0;
    qa4ForceActiveState('post-tap-check');
    qa4SetCheck('inputIsolation', !leakedPause, 'isPaused=' + isPaused + ' overlayActive=' + pauseOverlayActive + ' blockedPauseAttempts=' + blockedPauseAttempts);
  }, 350);`,
  'QA4 input isolation diagnostics'
);

for (const marker of [
  'QA4_RUN_LOCK_V1',
  'window.__SW_QA_TEST_LOCK__ = true',
  'window.__SW_QA_TEST_LOCK__ = false',
  'blockedPauseAttempts',
  'window.__SW_QA_BLOCKED_PAUSE_COUNT__'
]) {
  if (!html.includes(marker)) throw new Error(`QA4 run lock verification failed: missing ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 full-run pause lock to ${sourcePath}`);
