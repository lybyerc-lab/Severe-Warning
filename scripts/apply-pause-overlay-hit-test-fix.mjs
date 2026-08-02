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
  `  #pauseOverlay { position: absolute; inset: 0; z-index: 95000 !important; background: rgba(3,7,18,0.88); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
  #pauseOverlay.active { opacity: 1; pointer-events: auto !important; }
  .pause-card { width: min(420px, 90vw); background: rgba(15,23,42,0.96); border: 2px solid var(--cyan); border-radius: 18px; padding: 20px; text-align: center; box-shadow: 0 0 40px rgba(56,189,248,0.3); pointer-events: auto !important; touch-action: manipulation; }`,
  `  /* PAUSE_OVERLAY_HIT_TEST_V1: hidden pause controls cannot intercept gameplay or QA taps. */
  #pauseOverlay { position: absolute; inset: 0; z-index: 95000 !important; background: rgba(3,7,18,0.88); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; pointer-events: none !important; transition: opacity 0.2s ease, visibility 0s linear 0.2s; }
  #pauseOverlay.active { opacity: 1; visibility: visible; pointer-events: auto !important; transition: opacity 0.2s ease; }
  #pauseOverlay:not(.active) .pause-card,
  #pauseOverlay:not(.active) .pause-btn { pointer-events: none !important; }
  #pauseOverlay.active .pause-card,
  #pauseOverlay.active .pause-btn { pointer-events: auto !important; }
  .pause-card { width: min(420px, 90vw); background: rgba(15,23,42,0.96); border: 2px solid var(--cyan); border-radius: 18px; padding: 20px; text-align: center; box-shadow: 0 0 40px rgba(56,189,248,0.3); touch-action: manipulation; }`,
  'inactive pause overlay hit testing'
);

replaceExact(
  `  .pause-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; pointer-events: auto !important; touch-action: manipulation; }`,
  `  .pause-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; touch-action: manipulation; }`,
  'pause button pointer-event ownership'
);

replaceExact(
  '<div id="pauseOverlay">',
  '<div id="pauseOverlay" inert aria-hidden="true">',
  'inactive pause overlay markup'
);

replaceExact(
  `function togglePauseMenu() {`,
  `function setPauseOverlayActive(active) {
  const overlay = getCachedEl('pauseOverlay');
  if (!overlay) return;
  const enabled = Boolean(active);
  overlay.classList.toggle('active', enabled);
  overlay.inert = !enabled;
  overlay.setAttribute('aria-hidden', enabled ? 'false' : 'true');
}

function togglePauseMenu() {`,
  'central pause overlay state helper'
);

replaceExact(
  `    if (isPaused) {
      overlay.classList.add('active');`,
  `    if (isPaused) {
      setPauseOverlayActive(true);`,
  'pause overlay activation'
);

replaceExact(
  `    } else {
      overlay.classList.remove('active');
    }
  }
}`,
  `    } else {
      setPauseOverlayActive(false);
    }
  }
}`,
  'pause overlay deactivation'
);

replaceExact(
  `  gameStarted = true;
  isPaused = false;
  resetStormAudioState();
  resetWarningRun();`,
  `  gameStarted = true;
  isPaused = false;
  setPauseOverlayActive(false);
  resetStormAudioState();
  resetWarningRun();`,
  'run start pause reset after audio reset patch'
);

replaceExact(
  `  const pauseOverlay = getCachedEl('pauseOverlay');
  const menu = getCachedEl('mainMenu');
  if (pauseOverlay) pauseOverlay.classList.remove('active');`,
  `  const pauseOverlay = getCachedEl('pauseOverlay');
  const menu = getCachedEl('mainMenu');
  if (pauseOverlay) setPauseOverlayActive(false);`,
  'main menu pause reset'
);

replaceExact(
  `  getCachedEl('pauseOverlay')?.classList.remove('active');
  getCachedEl('resultsOverlay')?.classList.remove('active');`,
  `  setPauseOverlayActive(false);
  getCachedEl('resultsOverlay')?.classList.remove('active');`,
  'QA4 preparation pause reset'
);

replaceExact(
  `  getCachedEl('pauseOverlay')?.classList.remove('active');
  qa4Record('run-state', reason + ' isPaused=' + isPaused + ' runActive=' + runActive);`,
  `  setPauseOverlayActive(false);
  qa4Record('run-state', reason + ' isPaused=' + isPaused + ' runActive=' + runActive);`,
  'QA4 active-state pause reset'
);

replaceExact(
  `      overlay?.classList.remove('active');
      getCachedEl('qa4ForensicTrace').hidden = true;`,
  `      setPauseOverlayActive(false);
      getCachedEl('qa4ForensicTrace').hidden = true;`,
  'forensic continue pause reset'
);

for (const marker of [
  'PAUSE_OVERLAY_HIT_TEST_V1',
  '#pauseOverlay:not(.active) .pause-btn',
  '<div id="pauseOverlay" inert aria-hidden="true">',
  'function setPauseOverlayActive(active)',
  'overlay.inert = !enabled',
  'setPauseOverlayActive(false);\n  resetStormAudioState();'
]) {
  if (!html.includes(marker)) throw new Error(`Pause overlay fix verification failed: missing ${marker}`);
}

if (html.includes('.pause-btn { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 10px 20px; border-radius: 10px; font-weight: 800; font-size: 13px; cursor: pointer; pointer-events: auto !important;')) {
  throw new Error('Pause overlay fix verification failed: unconditional pause button hit testing remains');
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied pause overlay hit-test fix to ${sourcePath}`);
