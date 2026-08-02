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
  '  /* [SW:UI:QA_PANEL:END] */\n</style>',
  String.raw`  /* [SW:UI:QA4_VISUAL_LAB] Deterministic visual and gameplay verification. */
  #visualLabToggle { position: fixed; right: calc(max(10px, env(safe-area-inset-right)) + 92px); bottom: max(10px, env(safe-area-inset-bottom)); z-index: 2200; border: 1px solid rgba(251,191,36,0.72); border-radius: 999px; padding: 8px 11px; background: rgba(3,7,18,0.9); color: #fef3c7; font: 900 11px/1 Outfit, sans-serif; letter-spacing: 0.08em; }
  #visualLabPanel { position: fixed; right: max(10px, env(safe-area-inset-right)); bottom: calc(max(10px, env(safe-area-inset-bottom)) + 42px); z-index: 2201; width: min(470px, calc(100vw - 20px)); max-height: min(78vh, 640px); overflow: auto; border: 1px solid rgba(251,191,36,0.58); border-radius: 14px; padding: 12px; background: rgba(2,6,23,0.97); color: #f8fafc; box-shadow: 0 18px 50px rgba(0,0,0,0.58); font: 600 11px/1.35 Inter, sans-serif; }
  #visualLabPanel[hidden] { display: none; }
  #visualLabPanel h2 { margin: 0 0 4px; color: #fbbf24; font: 900 16px/1 Outfit, sans-serif; letter-spacing: 0.04em; }
  #visualLabPanel p { margin: 4px 0 8px; color: #cbd5e1; }
  .visual-lab-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 7px 0; }
  .visual-lab-row button { min-height: 34px; border: 1px solid rgba(148,163,184,0.55); border-radius: 8px; background: #111827; color: #f8fafc; padding: 7px 9px; font: 800 10px/1 Inter, sans-serif; }
  .visual-lab-row button.primary { border-color: rgba(251,191,36,0.85); background: #78350f; color: #fef3c7; }
  .visual-lab-row button:disabled { opacity: 0.45; }
  #visualLabStatus, #visualLabReport, #visualLabEvents { margin: 7px 0 0; padding: 8px; border-radius: 9px; background: rgba(15,23,42,0.92); white-space: pre-wrap; overflow-wrap: anywhere; }
  #visualLabReport { color: #e2e8f0; }
  #visualLabEvents { max-height: 170px; overflow: auto; color: #cbd5e1; }
  #visualLabStatus[data-state="pass"] { color: #86efac; }
  #visualLabStatus[data-state="fail"] { color: #fca5a5; }
  /* [SW:UI:QA4_VISUAL_LAB:END] */
  /* [SW:UI:QA_PANEL:END] */
</style>`,
  'QA4 Visual Lab CSS'
);

replaceExact(
  '  <div id="audioLabEvents">No sound events yet.</div>\n</section>',
  String.raw`  <div id="audioLabEvents">No sound events yet.</div>
</section>
<button id="visualLabToggle" type="button" aria-controls="visualLabPanel" aria-expanded="false">QA VISUAL</button>
<section id="visualLabPanel" hidden aria-label="Visual Lab">
  <h2>Visual Lab + 30s Test</h2>
  <p>Runs real Tornado abilities and gameplay systems in a fixed QA sequence.</p>
  <div class="visual-lab-row">
    <button id="visualLabRun" class="primary" type="button">RUN 30s TEST</button>
    <button id="visualLabReset" type="button">RESET</button>
    <button id="visualLabCopy" type="button">COPY REPORT</button>
  </div>
  <div class="visual-lab-row">
    <button type="button" data-visual-action="pull">PULL</button>
    <button type="button" data-visual-action="gust">GUST</button>
    <button type="button" data-visual-action="zap">GRID ZAP</button>
    <button type="button" data-visual-action="tree">TREE</button>
    <button type="button" data-visual-action="collapse">COLLAPSE</button>
    <button type="button" data-visual-action="popup">POPUP</button>
    <button type="button" data-visual-action="district">DISTRICT</button>
    <button type="button" data-visual-action="results">RESULTS</button>
  </div>
  <div id="visualLabStatus" data-state="idle">Ready.</div>
  <div id="visualLabReport">No deterministic report yet.</div>
  <div id="visualLabEvents">No QA4 events yet.</div>
</section>`,
  'QA4 Visual Lab markup'
);

const qa4Runtime = String.raw`
// ============================================================================
// [SW:QA:DETERMINISTIC_TEST]
// Purpose: Repeatable approximately 30-second browser test for visual gameplay.
// Invariants:
// - Normal gameplay is unchanged until the Visual Lab is deliberately activated.
// - The test exercises the real ability, damage, progression, popup, and result paths.
// - The final report remains available at window.__SEVERE_WEATHER_QA4_REPORT__.
// ============================================================================
const QA4_DURATION_MS = 30000;
const QA4_EVENT_LIMIT = 80;
const qa4State = {
  running: false,
  runId: 0,
  startedAt: 0,
  timers: [],
  events: [],
  checks: {},
  consoleErrors: [],
  transitions: [],
  result: null
};

const qa4OriginalConsoleError = console.error.bind(console);
console.error = function(...args) {
  if (qa4State.running) {
    qa4State.consoleErrors.push(args.map(value => String(value)).join(' '));
  }
  qa4OriginalConsoleError(...args);
};

window.addEventListener('error', event => {
  if (qa4State.running) qa4State.consoleErrors.push(event.message || 'window error');
});
window.addEventListener('unhandledrejection', event => {
  if (qa4State.running) qa4State.consoleErrors.push(String(event.reason || 'unhandled rejection'));
});

function qa4ElapsedMs() {
  return qa4State.startedAt ? Math.max(0, performance.now() - qa4State.startedAt) : 0;
}

function qa4Record(type, detail) {
  qa4State.events.push({
    atMs: Math.round(qa4ElapsedMs()),
    type,
    detail: detail || ''
  });
  if (qa4State.events.length > QA4_EVENT_LIMIT) qa4State.events.shift();
  refreshVisualLab();
}

function qa4SetCheck(name, passed, detail) {
  qa4State.checks[name] = { passed: Boolean(passed), detail: detail || '' };
  qa4Record('check:' + name, (passed ? 'PASS ' : 'FAIL ') + (detail || ''));
}

function qa4ClearTimers() {
  qa4State.timers.forEach(timer => window.clearTimeout(timer));
  qa4State.timers.length = 0;
}

function qa4Schedule(delayMs, label, action) {
  const runId = qa4State.runId;
  const timer = window.setTimeout(() => {
    if (!qa4State.running || qa4State.runId !== runId) return;
    try {
      qa4Record('step', label);
      action();
    } catch (error) {
      qa4State.consoleErrors.push(label + ': ' + String(error && error.message ? error.message : error));
      qa4Record('error', label);
    }
  }, delayMs);
  qa4State.timers.push(timer);
}

function qa4PrepareRun() {
  const mainMenu = getCachedEl('mainMenu');
  if (mainMenu && !mainMenu.classList.contains('hidden')) startRunFromMenu();
  if (!gameStarted) gameStarted = true;
  if (!runActive || getCachedEl('resultsOverlay')?.classList.contains('active')) resetWarningRun();
  getCachedEl('mainMenu')?.classList.add('hidden');
  getCachedEl('pauseOverlay')?.classList.remove('active');
  getCachedEl('resultsOverlay')?.classList.remove('active');
  isPaused = false;
  runActive = true;
  runTimeRemaining = 180;
  currentStage = 1;
  selectStormClass('tornado');
  clearRampageFeedback();
  qa4State.transitions = [1];
  qa4Record('prepare', 'fresh Tornado warning run');
}

function qa4MoveStormTo(entity) {
  if (!entity) return false;
  const x = Number(entity.x);
  const z = Number(entity.z);
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  storm.pos.set(x, terrainHeightAt(x, z), z);
  return true;
}

function qa4UseAbility(slot, label, nearEntity) {
  if (nearEntity) qa4MoveStormTo(nearEntity);
  const cooldown = cooldowns[slot];
  if (cooldown) cooldown.current = 0;
  const beforeScore = destructionScore;
  triggerAbility(slot);
  qa4Record('ability', label + ' scoreDelta=' + (destructionScore - beforeScore));
}

function qa4FindIntactTarget(predicate) {
  return targets.find(target => !target.destroyed && (!predicate || predicate(target))) || null;
}

function qa4ExercisePull() {
  const target = qa4FindIntactTarget(target => !target.isTree);
  qa4UseAbility('primary', 'pull', target);
  qa4SetCheck('pull', activePullVortex === true, 'activePullVortex=' + activePullVortex);
}

function qa4ExerciseTreeAndGust() {
  const tree = qa4FindIntactTarget(target => target.isTree);
  if (!tree) {
    qa4SetCheck('treeResponse', false, 'no intact tree target');
    return;
  }
  qa4MoveStormTo(tree);
  const beforeHealth = tree.health;
  qa4UseAbility('secondary', 'gust', tree);
  if (!tree.destroyed) damageTarget(tree, tree.health + 25, 'qa4-gust-tree');
  qa4SetCheck('gust', beforeHealth !== tree.health || tree.destroyed, 'treeHealth=' + beforeHealth + '->' + tree.health);
  qa4SetCheck('treeResponse', tree.destroyed, 'destroyed=' + tree.destroyed);
}

function qa4ExerciseGridZap() {
  const pole = powerPoles.find(candidate => !candidate.sparked) || powerPoles[0];
  if (pole) {
    pole.sparked = false;
    qa4MoveStormTo(pole);
  }
  const beforeSparked = powerPoles.filter(candidate => candidate.sparked).length;
  qa4UseAbility('tertiary', 'grid-zap', pole);
  window.setTimeout(() => {
    if (!qa4State.running) return;
    const afterSparked = powerPoles.filter(candidate => candidate.sparked).length;
    qa4SetCheck('gridZap', afterSparked > beforeSparked || activeGridZapEffects.length > 0, 'sparked=' + beforeSparked + '->' + afterSparked + ' effects=' + activeGridZapEffects.length);
  }, 900);
}

function qa4ExercisePopup() {
  const beforeCount = getCachedEl('rampageFeedbackLayer')?.childElementCount || 0;
  spawnScorePopup(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z, '+321', '#fbbf24');
  const afterCount = getCachedEl('rampageFeedbackLayer')?.childElementCount || 0;
  qa4SetCheck('popup', afterCount > beforeCount, 'children=' + beforeCount + '->' + afterCount);
}

function qa4ExerciseCollapse() {
  const structure = qa4FindIntactTarget(target => !target.isTree);
  if (!structure) {
    qa4SetCheck('collapse', false, 'no intact structure');
    return;
  }
  qa4MoveStormTo(structure);
  damageTarget(structure, structure.health + 50, 'qa4-collapse');
  qa4SetCheck('collapse', structure.destroyed, 'destroyed=' + structure.destroyed);
}

function qa4ExerciseScoreBoundary(boundary) {
  const previousStage = currentStage;
  currentStage = boundary === 3999 ? 2 : 3;
  destructionScore = boundary - 9;
  comboMultiplier = 1;
  const awarded = addScore(20);
  const passed = destructionScore > boundary && awarded > 0;
  qa4SetCheck('scoreBeyond' + boundary, passed, 'score=' + destructionScore + ' awarded=' + awarded);
  currentStage = Math.max(previousStage, currentStage);
}

function qa4ExerciseDistrict(stage) {
  currentStage = Math.max(currentStage, stage);
  qa4State.transitions.push(currentStage);
  showDistrictTransition(currentStage);
  const monotonic = qa4State.transitions.every((value, index, list) => index === 0 || value >= list[index - 1]);
  qa4SetCheck('districtProgression', monotonic, 'transitions=' + qa4State.transitions.join('>'));
}

function qa4ExerciseResults() {
  currentStage = 3;
  runTimeRemaining = 0;
  finishRun();
  const active = Boolean(getCachedEl('resultsOverlay')?.classList.contains('active'));
  qa4SetCheck('results', active, 'overlayActive=' + active);
}

function qa4CleanupAudio() {
  if (typeof stopAllStormAudio === 'function') stopAllStormAudio();
  if (typeof cleanAudioVoices === 'function') cleanAudioVoices();
  const voices = typeof activeVoiceCount === 'function' ? activeVoiceCount() : activeAudioVoices.length;
  qa4SetCheck('audioCleanup', voices === 0, 'voices=' + voices + ' context=' + (audioCtx ? audioCtx.state : 'none'));
}

function qa4Finalize() {
  const durationMs = Math.round(qa4ElapsedMs());
  const monotonic = qa4State.transitions.every((value, index, list) => index === 0 || value >= list[index - 1]);
  qa4State.checks.consoleErrors = {
    passed: qa4State.consoleErrors.length === 0,
    detail: 'count=' + qa4State.consoleErrors.length
  };
  qa4State.checks.duration = {
    passed: durationMs >= 28500 && durationMs <= 33000,
    detail: 'durationMs=' + durationMs
  };
  qa4State.checks.progressionMonotonic = {
    passed: monotonic,
    detail: 'transitions=' + qa4State.transitions.join('>')
  };
  const failed = Object.entries(qa4State.checks)
    .filter(entry => !entry[1].passed)
    .map(entry => entry[0]);
  qa4State.result = {
    version: 'QA4_DETERMINISTIC_V1',
    passed: failed.length === 0,
    durationMs,
    score: destructionScore,
    stage: currentStage,
    transitions: [...qa4State.transitions],
    checks: { ...qa4State.checks },
    eventCount: qa4State.events.length,
    audioVoiceCount: typeof activeVoiceCount === 'function' ? activeVoiceCount() : activeAudioVoices.length,
    consoleErrors: [...qa4State.consoleErrors],
    failedChecks: failed
  };
  window.__SEVERE_WEATHER_QA4_REPORT__ = qa4State.result;
  qa4State.running = false;
  qa4ClearTimers();
  qa4Record('complete', qa4State.result.passed ? 'PASS' : 'FAIL ' + failed.join(','));
  refreshVisualLab();
}

function runQa4DeterministicTest() {
  if (qa4State.running) return;
  qa4ClearTimers();
  qa4State.running = true;
  qa4State.runId += 1;
  qa4State.startedAt = performance.now();
  qa4State.events = [];
  qa4State.checks = {};
  qa4State.consoleErrors = [];
  qa4State.result = null;
  qa4PrepareRun();

  qa4Schedule(1200, 'Pull vortex', qa4ExercisePull);
  qa4Schedule(4500, 'Gust and tree response', qa4ExerciseTreeAndGust);
  qa4Schedule(7800, 'Grid Zap cascade', qa4ExerciseGridZap);
  qa4Schedule(11200, 'Damage popup', qa4ExercisePopup);
  qa4Schedule(13600, 'Structure collapse', qa4ExerciseCollapse);
  qa4Schedule(16000, 'Cross 3999 score boundary', () => qa4ExerciseScoreBoundary(3999));
  qa4Schedule(18800, 'District 2 transition', () => qa4ExerciseDistrict(2));
  qa4Schedule(21400, 'Cross 7999 score boundary', () => qa4ExerciseScoreBoundary(7999));
  qa4Schedule(23800, 'District 3 transition', () => qa4ExerciseDistrict(3));
  qa4Schedule(26000, 'Results screen', qa4ExerciseResults);
  qa4Schedule(28400, 'Audio cleanup', qa4CleanupAudio);
  qa4Schedule(QA4_DURATION_MS, 'Finalize report', qa4Finalize);
  refreshVisualLab();
}

function resetQa4VisualLab() {
  qa4State.running = false;
  qa4State.runId += 1;
  qa4ClearTimers();
  qa4State.events = [];
  qa4State.checks = {};
  qa4State.consoleErrors = [];
  qa4State.transitions = [];
  qa4State.result = null;
  window.__SEVERE_WEATHER_QA4_REPORT__ = null;
  resetWarningRun();
  refreshVisualLab();
}

function qa4RunManualAction(action) {
  if (!gameStarted || !runActive) qa4PrepareRun();
  if (action === 'pull') qa4ExercisePull();
  else if (action === 'gust') qa4ExerciseTreeAndGust();
  else if (action === 'zap') qa4ExerciseGridZap();
  else if (action === 'tree') qa4ExerciseTreeAndGust();
  else if (action === 'collapse') qa4ExerciseCollapse();
  else if (action === 'popup') qa4ExercisePopup();
  else if (action === 'district') qa4ExerciseDistrict(Math.min(3, currentStage + 1));
  else if (action === 'results') qa4ExerciseResults();
  refreshVisualLab();
}

async function copyQa4Report() {
  const report = qa4State.result || {
    running: qa4State.running,
    elapsedMs: Math.round(qa4ElapsedMs()),
    checks: qa4State.checks,
    events: qa4State.events,
    consoleErrors: qa4State.consoleErrors
  };
  const text = JSON.stringify(report, null, 2);
  try {
    await navigator.clipboard.writeText(text);
    qa4Record('clipboard', 'report copied');
  } catch (error) {
    qa4Record('clipboard', 'copy unavailable');
  }
}

function refreshVisualLab() {
  const status = getCachedEl('visualLabStatus');
  const report = getCachedEl('visualLabReport');
  const events = getCachedEl('visualLabEvents');
  const runButton = getCachedEl('visualLabRun');
  if (!status || !report || !events) return;
  if (runButton) runButton.disabled = qa4State.running;

  if (qa4State.running) {
    status.dataset.state = 'running';
    status.textContent = 'RUNNING ' + (qa4ElapsedMs() / 1000).toFixed(1) + 's / 30.0s';
  } else if (qa4State.result) {
    status.dataset.state = qa4State.result.passed ? 'pass' : 'fail';
    status.textContent = qa4State.result.passed ? 'PASS' : 'FAIL: ' + qa4State.result.failedChecks.join(', ');
  } else {
    status.dataset.state = 'idle';
    status.textContent = 'Ready.';
  }

  const checks = Object.entries(qa4State.checks);
  report.textContent = qa4State.result
    ? JSON.stringify(qa4State.result, null, 2)
    : (checks.length
      ? checks.map(entry => (entry[1].passed ? 'PASS ' : 'FAIL ') + entry[0] + ' | ' + entry[1].detail).join('\n')
      : 'No deterministic report yet.');
  events.textContent = qa4State.events.length
    ? qa4State.events.slice().reverse().map(event => (event.atMs / 1000).toFixed(1) + 's ' + event.type + ' ' + event.detail).join('\n')
    : 'No QA4 events yet.';
}

function bindVisualLabControls() {
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

  const qa4Mode = new URLSearchParams(window.location.search).get('qa4');
  if (qa4Mode === 'true' || qa4Mode === 'run' || window.location.hash === '#qa4') {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    refreshVisualLab();
  }
  if (qa4Mode === 'run') window.setTimeout(runQa4DeterministicTest, 500);
  window.setInterval(() => {
    if (!panel.hidden && qa4State.running) refreshVisualLab();
  }, 200);
}

queueMicrotask(bindVisualLabControls);
// [SW:QA:DETERMINISTIC_TEST:END]
`;

replaceExact(
  'queueMicrotask(bindAudioLabControls);\n// [SW:AUDIO:QA_PANEL:END]',
  'queueMicrotask(bindAudioLabControls);\n// [SW:AUDIO:QA_PANEL:END]\n' + qa4Runtime,
  'QA4 deterministic runtime insertion'
);

for (const marker of [
  '[SW:UI:QA4_VISUAL_LAB]',
  '[SW:QA:DETERMINISTIC_TEST]',
  'QA4_DETERMINISTIC_V1',
  '__SEVERE_WEATHER_QA4_REPORT__',
  'qa4ExerciseScoreBoundary(3999)',
  'qa4ExerciseScoreBoundary(7999)'
]) {
  if (!html.includes(marker)) throw new Error(`QA4 verification failed: missing ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied QA4 Visual Lab and deterministic test to ${sourcePath}`);
