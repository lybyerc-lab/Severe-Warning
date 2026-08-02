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
  "const AUDIO_BUS_BASE_GAINS = Object.freeze({ ambience: 0.72, effects: 0.92, music: 0.78, news: 0.82 });",
  "const AUDIO_BUS_BASE_GAINS = Object.freeze({ ambience: 0.72, effects: 0.68, music: 1.00, news: 0.82 });",
  'music and effects bus balance'
);

replaceExact(
  "  setAmbientLoopGain('music_drive_low', audible ? 0.14 + intensity * 0.04 : 0, 0.24);\n  setAmbientLoopGain('music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.16 + intensity * 0.028 : 0, 0.20);\n  setMasterAudioEnabled(audible || (!runActive && !isAudioMuted));",
  "  setAmbientLoopGain('music_drive_low', audible ? 0.22 + intensity * 0.06 : 0, 0.24);\n  setAmbientLoopGain('music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.24 + intensity * 0.04 : 0, 0.20);\n  const effectActivity = activeVoiceCount('effects');\n  if (!qaSoloBus && effectsGain) {\n    const effectsTarget = effectActivity >= 5 ? 0.54 : (effectActivity >= 3 ? 0.61 : AUDIO_BUS_BASE_GAINS.effects);\n    effectsGain.gain.setTargetAtTime(effectsTarget, audioCtx.currentTime, 0.08);\n  }\n  setMasterAudioEnabled(audible || (!runActive && !isAudioMuted));",
  'music presence and dense effects control'
);

replaceExact(
  "  if (!stormAudioReady) {\n    loadStormAudioAssets();\n    return;\n  }\n  if (type === 'easAlert') {",
  "  if (!stormAudioReady) {\n    loadStormAudioAssets();\n    return;\n  }\n  if (type === 'moo') {\n    recordAudioEvent({ clip: 'moo_1', trigger: 'legacy:moo', gain: 0, pan: 0, bus: 'effects', status: 'disabled-synthetic-source' });\n    return;\n  }\n  if (type === 'easAlert') {",
  'disable rejected synthetic moo playback'
);

for (const marker of [
  'effects: 0.68, music: 1.00',
  "music_drive_low', audible ? 0.22",
  "music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.24",
  "effectActivity >= 5 ? 0.54",
  'disabled-synthetic-source'
]) {
  if (!html.includes(marker)) throw new Error(`Missing audio follow-up marker: ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied audio mix follow-up patch.');
