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
  `const QA4_FORENSIC_STORAGE_KEY = 'severe_weather_qa4_pause_trace_v1';
const qa4Forensics = {`,
  `const QA4_FORENSIC_STORAGE_KEY = 'severe_weather_qa4_pause_trace_v1';
const PHASE2_PLAYER_FORENSICS_GUARD = 'PHASE2_PLAYER_FORENSICS_GUARD_V1';
function qa4ForensicUiEnabled() {
  return new URLSearchParams(window.location.search).get('qa4') === 'forensic';
}
const qa4Forensics = {`,
  'forensic mode guard declaration'
);

replaceExact(
  `    this.render(snapshot);
    return snapshot;`,
  `    if (qa4ForensicUiEnabled()) {
      this.render(snapshot);
    } else {
      const trace = getCachedEl('qa4ForensicTrace');
      if (trace) trace.hidden = true;
    }
    return snapshot;`,
  'silent player trace capture'
);

replaceExact(
  `  render(snapshot) {
    const trace = getCachedEl('qa4ForensicTrace');
    const text = getCachedEl('qa4ForensicText');
    if (!trace || !text || !snapshot) return;`,
  `  render(snapshot) {
    const trace = getCachedEl('qa4ForensicTrace');
    const text = getCachedEl('qa4ForensicText');
    if (!trace || !text || !snapshot) return;
    if (!qa4ForensicUiEnabled()) {
      trace.hidden = true;
      return;
    }`,
  'defensive forensic render guard'
);

replaceExact(
  `  install() {
    if (this.observer) return;`,
  `  install() {
    if (this.observer) return;
    document.documentElement.dataset.swQaForensics = qa4ForensicUiEnabled() ? 'visible' : 'silent';`,
  'forensic mode evidence marker'
);

for (const marker of [
  'PHASE2_PLAYER_FORENSICS_GUARD_V1',
  'function qa4ForensicUiEnabled()',
  "dataset.swQaForensics = qa4ForensicUiEnabled() ? 'visible' : 'silent'",
  'if (qa4ForensicUiEnabled())',
  'if (!qa4ForensicUiEnabled())'
]) {
  if (!html.includes(marker)) {
    throw new Error(`Phase 2 player forensics guard verification failed: missing ${marker}`);
  }
}

await writeFile(sourcePath, html, 'utf8');
console.log(`Applied Phase 2 player forensics guard to ${sourcePath}`);
