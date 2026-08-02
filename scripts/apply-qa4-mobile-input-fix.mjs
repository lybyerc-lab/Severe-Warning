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
  '  /* [SW:UI:QA4_VISUAL_LAB:END] */',
  String.raw`  /* [SW:UI:QA4_INPUT_ISOLATION_V1] */
  #visualLabToggle, #visualLabPanel, #visualLabPanel button {
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  #visualLabPanel { overscroll-behavior: contain; }
  /* [SW:UI:QA4_INPUT_ISOLATION_V1:END] */
  /* [SW:UI:QA4_VISUAL_LAB:END] */`,
  'QA4 mobile input CSS'
);

replaceExact(
  `function togglePauseMenu() {
  if (!gameStarted) return;`,
  `function togglePauseMenu() {
  // QA4_INPUT_ISOLATION_V1: ignore a short-lived mobile ghost click armed by QA controls.
  if ((window.__SW_QA_INPUT_SHIELD_UNTIL__ || 0) > performance.now()) return;
  if (!gameStarted) return;`,
  'pause ghost-click guard'
);

replaceExact(
  `function runQa4DeterministicTest() {
  if (qa4State.running) return;`,
  `function runQa4DeterministicTest() {
  qa4ArmInputShield(1200);
  if (qa4State.running) return;`,
  'QA4 run input shield'
);

replaceExact(
  `  qa4PrepareRun();

  qa4Schedule(1200, 'Pull vortex', qa4ExercisePull);`,
  `  qa4PrepareRun();
  qa4ForceActiveState('test-start');
  window.setTimeout(() => {
    if (!qa4State.running) return;
    const pauseOverlayActive = Boolean(getCachedEl('pauseOverlay')?.classList.contains('active'));
    const leakedPause = isPaused || pauseOverlayActive;
    qa4ForceActiveState('post-tap-check');
    qa4SetCheck('inputIsolation', !leakedPause, 'isPaused=' + isPaused + ' overlayActive=' + pauseOverlayActive);
  }, 350);

  qa4Schedule(1200, 'Pull vortex', qa4ExercisePull);`,
  'QA4 post-tap pause assertion'
);

const legacyBinding = `function bindVisualLabControls() {
  const toggle = getCachedEl('visualLabToggle');
  const panel = getCachedEl('visualLabPanel');
  if (!toggle || !panel || toggle.dataset.bound === 'true') return;
  toggle.dataset.bound = 'true';
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    const audioPanel = getCachedEl('audioLabPanel');
    if (!panel.hidden && audioPanel) {
      audioPanel.hidden = true;
      getCachedEl('audioLabToggle')?.setAttribute('aria-expanded', 'false');
    }
    refreshVisualLab();
  });
  getCachedEl('visualLabRun')?.addEventListener('click', runQa4DeterministicTest);
  getCachedEl('visualLabReset')?.addEventListener('click', resetQa4VisualLab);
  getCachedEl('visualLabCopy')?.addEventListener('click', copyQa4Report);
  document.querySelectorAll('[data-visual-action]').forEach(button => {
    button.addEventListener('click', () => qa4RunManualAction(button.dataset.visualAction));
  });

  const qa4Mode = new URLSearchParams(window.location.search).get('qa4');`;

const isolatedBinding = `// ============================================================================
// [SW:QA:INPUT_ISOLATION]
// Purpose: Keep mobile QA taps from becoming gameplay or pause inputs.
// ============================================================================
function qa4ArmInputShield(durationMs = 900) {
  const until = performance.now() + durationMs;
  window.__SW_QA_INPUT_SHIELD_UNTIL__ = Math.max(window.__SW_QA_INPUT_SHIELD_UNTIL__ || 0, until);
}

function qa4StopControlEvent(event, preventDefault = false) {
  qa4ArmInputShield();
  if (preventDefault && event.cancelable) event.preventDefault();
  event.stopPropagation();
}

function qa4BindIsolatedControl(element, handler) {
  if (!element) return;
  for (const type of ['pointerdown', 'touchstart', 'touchend']) {
    element.addEventListener(type, event => qa4StopControlEvent(event, false));
  }
  element.addEventListener('click', event => {
    qa4StopControlEvent(event, true);
    handler(event);
  });
}

function qa4ForceActiveState(reason) {
  isPaused = false;
  runActive = true;
  getCachedEl('pauseOverlay')?.classList.remove('active');
  qa4Record('run-state', reason + ' isPaused=' + isPaused + ' runActive=' + runActive);
}
// [SW:QA:INPUT_ISOLATION:END]

function bindVisualLabControls() {
  const toggle = getCachedEl('visualLabToggle');
  const panel = getCachedEl('visualLabPanel');
  if (!toggle || !panel || toggle.dataset.bound === 'true') return;
  toggle.dataset.bound = 'true';

  for (const type of ['pointerdown', 'touchstart', 'touchend', 'click']) {
    panel.addEventListener(type, event => {
      qa4ArmInputShield();
      event.stopPropagation();
    });
  }

  qa4BindIsolatedControl(toggle, () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    const audioPanel = getCachedEl('audioLabPanel');
    if (!panel.hidden && audioPanel) {
      audioPanel.hidden = true;
      getCachedEl('audioLabToggle')?.setAttribute('aria-expanded', 'false');
    }
    refreshVisualLab();
  });
  qa4BindIsolatedControl(getCachedEl('visualLabRun'), runQa4DeterministicTest);
  qa4BindIsolatedControl(getCachedEl('visualLabReset'), resetQa4VisualLab);
  qa4BindIsolatedControl(getCachedEl('visualLabCopy'), copyQa4Report);
  document.querySelectorAll('[data-visual-action]').forEach(button => {
    qa4BindIsolatedControl(button, () => qa4RunManualAction(button.dataset.visualAction));
  });

  const qa4Mode = new URLSearchParams(window.location.search).get('qa4');`;

replaceExact(legacyBinding, isolatedBinding, 'isolated Visual Lab control binding');

for (const marker of [
  '[SW:UI:QA4_INPUT_ISOLATION_V1]',
  '[SW:QA:INPUT_ISOLATION]',
  'window.__SW_QA_INPUT_SHIELD_UNTIL__',
  "qa4SetCheck('inputIsolation'",
  "qa4BindIsolatedControl(getCachedEl('visualLabRun')"
]) {
  if (!html.includes(marker)) throw new Error(`QA4 input fix verification failed: missing ${marker}`);
}

if (html.includes("getCachedEl('visualLabRun')?.addEventListener('click', runQa4DeterministicTest)")) {
  throw new Error('QA4 input fix verification failed: legacy unisolated run binding remains');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 mobile input isolation fix to ${sourcePath}`);
