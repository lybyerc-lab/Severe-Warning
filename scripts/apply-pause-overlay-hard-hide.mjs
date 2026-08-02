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
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

replaceExact(
  '  /* [SW:UI:QA4_PAUSE_FORENSICS_V1] */',
  `  /* PAUSE_OVERLAY_HARD_HIDE_V2: inactive pause UI is removed from layout and hit testing. */\n  #pauseOverlay[hidden],\n  #pauseOverlay:not(.active) { display: none !important; visibility: hidden !important; pointer-events: none !important; }\n  #pauseOverlay.active { display: flex !important; visibility: visible !important; pointer-events: auto !important; }\n  /* PAUSE_OVERLAY_HARD_HIDE_V2:END */\n  /* [SW:UI:QA4_PAUSE_FORENSICS_V1] */`,
  'pause overlay hard-hide CSS'
);

replaceExact(
  '<div id="pauseOverlay" inert aria-hidden="true">',
  '<div id="pauseOverlay" hidden inert aria-hidden="true">',
  'pause overlay hidden markup'
);

replaceExact(
  `  overlay.classList.toggle('active', enabled);\n  overlay.inert = !enabled;\n  overlay.setAttribute('aria-hidden', enabled ? 'false' : 'true');`,
  `  overlay.classList.toggle('active', enabled);\n  overlay.hidden = !enabled;\n  overlay.inert = !enabled;\n  overlay.style.display = enabled ? 'flex' : 'none';\n  overlay.style.pointerEvents = enabled ? 'auto' : 'none';\n  overlay.setAttribute('aria-hidden', enabled ? 'false' : 'true');`,
  'pause overlay state helper hard hide'
);

replaceExact(
  `      version: 'QA4_PAUSE_FORENSICS_V1',\n      reason,`,
  `      version: 'QA4_PAUSE_FORENSICS_V1',\n      buildIdentity: (document.body?.innerText?.match(/QA Stage 4\\s*[·|]\\s*QA #\\d+\\s*[·|]\\s*[0-9a-f]{7}/i) || ['not-found'])[0],\n      reason,`,
  'forensic build identity'
);

for (const marker of [
  'PAUSE_OVERLAY_HARD_HIDE_V2',
  '#pauseOverlay[hidden]',
  '<div id="pauseOverlay" hidden inert aria-hidden="true">',
  'overlay.hidden = !enabled',
  "overlay.style.display = enabled ? 'flex' : 'none'",
  'buildIdentity:'
]) {
  if (!html.includes(marker)) throw new Error(`Pause overlay hard-hide verification failed: missing ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied pause overlay hard-hide fix to ${sourcePath}`);
