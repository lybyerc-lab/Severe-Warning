import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const audioDir = path.join(projectRoot, 'assets', 'audio');
const spritePath = path.join(audioDir, 'storm-feel-sprite.wav');
const manifestPath = path.join(audioDir, 'storm-feel-manifest.json');
const licensePath = path.join(audioDir, 'LICENSE.md');
const sampleRate = 16000;
const silenceSamples = Math.round(sampleRate * 0.085);
const sourceCommit = 'cc899ce7e9eeb2e127d677b24f0bc2420452142c';
const sourceRoot = `https://raw.githubusercontent.com/fighter-435/Break-the-Battle-Formation/${sourceCommit}/sci-fi-fps/assets/audios/sfx_breaking_and_falling`;
const electricityCommit = '078f6d70c6d89ee989e1afca9192e133f436362b';
const electricityUrl = `https://raw.githubusercontent.com/SteveSmith16384/AlienRemake/${electricityCommit}/src/Assets/sfx/continuousspark.wav`;

const recordedSources = {
  electricity_arc: {
    url: electricityUrl,
    canonical: 'https://opengameart.org/content/electricity-sound-effects-0',
    author: 'BMacZero / Brian MacIntosh',
    license: 'CC0 1.0'
  },
  wood_break_1: { file: 'bfh1_wood_breaking_01.ogg' },
  wood_break_2: { file: 'bfh1_wood_breaking_02.ogg' },
  wood_break_4: { file: 'bfh1_wood_breaking_04.ogg' },
  wood_fall_2: { file: 'bfh1_wood_falling_02.ogg' },
  metal_hit_1: { file: 'bfh1_metal_hit_01.ogg' },
  metal_hit_4: { file: 'bfh1_metal_hit_04.ogg' },
  metal_hit_6: { file: 'bfh1_metal_hit_06.ogg' },
  metal_fall_2: { file: 'bfh1_metal_falling_02.ogg' },
  glass_break_2: { file: 'bfh1_glass_breaking_02.ogg' },
  glass_fall_1: { file: 'bfh1_glass_falling_01.ogg' },
  glass_fall_4: { file: 'bfh1_glass_falling_04.ogg' },
  rock_break_3: { file: 'bfh1_rock_breaking_03.ogg' },
  rock_fall_4: { file: 'bfh1_rock_falling_04.ogg' },
  rock_fall_8: { file: 'bfh1_rock_falling_08.ogg' }
};

for (const source of Object.values(recordedSources)) {
  if (!source.url) source.url = `${sourceRoot}/${source.file}`;
  if (!source.canonical) source.canonical = 'https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx';
  if (!source.author) source.author = 'rubberduck';
  if (!source.license) source.license = 'CC0 1.0';
}

const replacedClips = new Set([
  'grid_snap_1', 'grid_snap_2', 'grid_crackle_1', 'grid_crackle_2', 'thunder_tail_1',
  'gust_surge_1', 'gust_surge_2', 'pull_rise_1', 'pull_rise_2',
  'material_wood_1', 'material_wood_2', 'material_metal_1', 'material_metal_2',
  'material_glass_1', 'material_glass_2', 'material_masonry_1', 'material_masonry_2',
  'material_concrete_1', 'material_concrete_2', 'material_utility_1', 'material_utility_2',
  'material_vehicle_1', 'material_vehicle_2', 'material_carnival_1', 'material_carnival_2',
  'material_tree_1', 'material_tree_2', 'material_roof_1', 'material_roof_2'
]);

function assertTool(name) {
  const result = spawnSync(name, ['-version'], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${name} is required to prepare recorded storm effects.`);
}

function parsePcm16Wav(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error('Expected a RIFF/WAVE sprite.');
  }
  let cursor = 12;
  let format = null;
  let dataStart = -1;
  let dataLength = 0;
  while (cursor + 8 <= buffer.length) {
    const id = buffer.toString('ascii', cursor, cursor + 4);
    const length = buffer.readUInt32LE(cursor + 4);
    const payload = cursor + 8;
    if (id === 'fmt ') {
      format = {
        audioFormat: buffer.readUInt16LE(payload),
        channels: buffer.readUInt16LE(payload + 2),
        rate: buffer.readUInt32LE(payload + 4),
        bits: buffer.readUInt16LE(payload + 14)
      };
    } else if (id === 'data') {
      dataStart = payload;
      dataLength = length;
      break;
    }
    cursor = payload + length + (length % 2);
  }
  if (!format || dataStart < 0 || format.audioFormat !== 1 || format.channels !== 1 || format.bits !== 16 || format.rate !== sampleRate) {
    throw new Error(`Unsupported sprite WAV format: ${JSON.stringify(format)}`);
  }
  const sampleCount = Math.floor(dataLength / 2);
  const output = new Float64Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) output[i] = buffer.readInt16LE(dataStart + i * 2) / 32768;
  return output;
}

function encodePcm16Wav(signal) {
  const output = Buffer.alloc(44 + signal.length * 2);
  output.write('RIFF', 0, 'ascii');
  output.writeUInt32LE(36 + signal.length * 2, 4);
  output.write('WAVE', 8, 'ascii');
  output.write('fmt ', 12, 'ascii');
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(sampleRate, 24);
  output.writeUInt32LE(sampleRate * 2, 28);
  output.writeUInt16LE(2, 32);
  output.writeUInt16LE(16, 34);
  output.write('data', 36, 'ascii');
  output.writeUInt32LE(signal.length * 2, 40);
  for (let i = 0; i < signal.length; i++) {
    const sample = Math.max(-1, Math.min(1, signal[i]));
    output.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  return output;
}

function trimSilence(input, threshold = 0.006, paddingSeconds = 0.018) {
  let start = 0;
  let end = input.length;
  while (start < end && Math.abs(input[start]) < threshold) start++;
  while (end > start && Math.abs(input[end - 1]) < threshold) end--;
  const padding = Math.round(sampleRate * paddingSeconds);
  start = Math.max(0, start - padding);
  end = Math.min(input.length, end + padding);
  return input.slice(start, end);
}

function normalize(input, peak = 0.90) {
  let maximum = 0;
  for (const value of input) maximum = Math.max(maximum, Math.abs(value));
  if (maximum < 1e-8) return Float64Array.from(input);
  const scale = peak / maximum;
  const output = new Float64Array(input.length);
  for (let i = 0; i < input.length; i++) output[i] = input[i] * scale;
  return output;
}

function lowpass(input, cutoff) {
  const output = new Float64Array(input.length);
  const alpha = 1 - Math.exp(-2 * Math.PI * cutoff / sampleRate);
  let value = 0;
  for (let i = 0; i < input.length; i++) {
    value += alpha * (input[i] - value);
    output[i] = value;
  }
  return output;
}

function highpass(input, cutoff) {
  const low = lowpass(input, cutoff);
  const output = new Float64Array(input.length);
  for (let i = 0; i < input.length; i++) output[i] = input[i] - low[i];
  return output;
}

function fade(input, attackSeconds = 0.004, releaseSeconds = 0.12) {
  const output = Float64Array.from(input);
  const attack = Math.min(output.length, Math.max(1, Math.round(sampleRate * attackSeconds)));
  const release = Math.min(output.length, Math.max(1, Math.round(sampleRate * releaseSeconds)));
  for (let i = 0; i < attack; i++) output[i] *= i / attack;
  for (let i = 0; i < release; i++) output[output.length - 1 - i] *= i / release;
  return output;
}

function limitDuration(input, seconds) {
  return input.length <= sampleRate * seconds ? input : input.slice(0, Math.round(sampleRate * seconds));
}

function playbackRate(input, rate) {
  const outputLength = Math.max(1, Math.floor(input.length / rate));
  const output = new Float64Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const position = i * rate;
    const index = Math.floor(position);
    const fraction = position - index;
    const a = input[Math.min(index, input.length - 1)];
    const b = input[Math.min(index + 1, input.length - 1)];
    output[i] = a + (b - a) * fraction;
  }
  return output;
}

function mix(parts, durationSeconds = null) {
  let length = durationSeconds == null ? 0 : Math.round(sampleRate * durationSeconds);
  for (const part of parts) length = Math.max(length, (part.offset ?? 0) + part.signal.length);
  const output = new Float64Array(length);
  for (const part of parts) {
    const offset = part.offset ?? 0;
    const amount = part.gain ?? 1;
    for (let i = 0; i < part.signal.length && offset + i < output.length; i++) output[offset + i] += part.signal[i] * amount;
  }
  return output;
}

function sliceClip(sprite, definition) {
  const start = Math.max(0, Math.round(definition.offset * sampleRate));
  const length = Math.max(1, Math.round(definition.duration * sampleRate));
  return sprite.slice(start, start + length);
}

function makeWindBurst(wind, rumble, variant = 0) {
  const start = variant === 0 ? Math.round(sampleRate * 0.42) : Math.round(sampleRate * 1.48);
  const length = Math.round(sampleRate * (variant === 0 ? 1.04 : 1.16));
  const windSlice = wind.slice(start, Math.min(wind.length, start + length));
  const rumbleSlice = rumble.slice(0, Math.min(rumble.length, length));
  const shapedWind = fade(highpass(windSlice, 130), 0.025, 0.48);
  const pressure = fade(lowpass(rumbleSlice, 155), 0.008, 0.66);
  return normalize(mix([
    { signal: shapedWind, gain: 0.88 },
    { signal: pressure, gain: variant === 0 ? 0.46 : 0.54 }
  ]), 0.86);
}

function makePullRise(suction, wind, variant = 0) {
  const length = Math.round(sampleRate * (variant === 0 ? 1.35 : 1.52));
  const suctionSlice = suction.slice(0, Math.min(suction.length, length));
  const windStart = variant === 0 ? Math.round(sampleRate * 0.8) : Math.round(sampleRate * 1.6);
  const windSlice = wind.slice(windStart, Math.min(wind.length, windStart + length));
  const output = new Float64Array(Math.max(suctionSlice.length, windSlice.length));
  for (let i = 0; i < output.length; i++) {
    const t = i / Math.max(1, output.length - 1);
    const rise = t * t;
    const suctionValue = i < suctionSlice.length ? suctionSlice[i] : 0;
    const windValue = i < windSlice.length ? windSlice[i] : 0;
    output[i] = suctionValue * (0.34 + rise * 0.78) + windValue * (0.16 + rise * 0.40);
  }
  return normalize(fade(highpass(output, 75), 0.055, 0.30), 0.86);
}

function impact(primary, secondary = null, options = {}) {
  const body = playbackRate(primary, options.rate ?? 1);
  const layers = [{ signal: body, gain: options.primaryGain ?? 1 }];
  if (secondary) layers.push({ signal: playbackRate(secondary, options.secondaryRate ?? 1), gain: options.secondaryGain ?? 0.42, offset: options.secondaryOffset ?? 0 });
  let output = mix(layers);
  if (options.lowpass) output = lowpass(output, options.lowpass);
  if (options.highpass) output = highpass(output, options.highpass);
  output = fade(limitDuration(output, options.maxSeconds ?? 1.45), 0.002, options.release ?? 0.20);
  return normalize(output, options.peak ?? 0.90);
}

async function downloadTo(url, outputPath) {
  const response = await fetch(url, { headers: { 'user-agent': 'Severe-Weather-build/4.5.0' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`Unable to download ${url}: HTTP ${response.status}`);
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length < 64) throw new Error(`Downloaded audio is unexpectedly small: ${url}`);
  await writeFile(outputPath, body);
  return createHash('sha256').update(body).digest('hex');
}

function decodeWithFfmpeg(inputPath, outputPath) {
  const result = spawnSync('ffmpeg', [
    '-v', 'error', '-y', '-i', inputPath,
    '-ar', String(sampleRate), '-ac', '1', '-f', 's16le', outputPath
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`ffmpeg failed for ${inputPath}: ${result.stderr || result.stdout}`);
}

function readRawPcm16(buffer) {
  const output = new Float64Array(Math.floor(buffer.length / 2));
  for (let i = 0; i < output.length; i++) output[i] = buffer.readInt16LE(i * 2) / 32768;
  return output;
}

assertTool('ffmpeg');
const temporaryDir = await mkdtemp(path.join(os.tmpdir(), 'severe-weather-recorded-audio-'));

try {
  const originalManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const originalSprite = parsePcm16Wav(await readFile(spritePath));
  const sourceAudio = {};
  const sourceMetadata = [];

  for (const [name, source] of Object.entries(recordedSources)) {
    const extension = path.extname(new URL(source.url).pathname) || '.audio';
    const downloadedPath = path.join(temporaryDir, `${name}${extension}`);
    const pcmPath = path.join(temporaryDir, `${name}.pcm`);
    const sha256 = await downloadTo(source.url, downloadedPath);
    decodeWithFfmpeg(downloadedPath, pcmPath);
    sourceAudio[name] = normalize(trimSilence(readRawPcm16(await readFile(pcmPath))), 0.88);
    sourceMetadata.push({ name, url: source.url, canonical: source.canonical, author: source.author, license: source.license, sha256 });
  }

  const windClose = sliceClip(originalSprite, originalManifest.clips.loop_wind_close);
  const rumble = sliceClip(originalSprite, originalManifest.clips.loop_rumble);
  const suction = sliceClip(originalSprite, originalManifest.clips.loop_pull_suction);
  const electricity = sourceAudio.electricity_arc;

  const replacements = new Map();
  replacements.set('grid_snap_1', impact(electricity, sourceAudio.metal_hit_1, { rate: 1.08, secondaryGain: 0.30, maxSeconds: 0.44, highpass: 180, release: 0.16 }));
  replacements.set('grid_snap_2', impact(playbackRate(electricity, 0.88), sourceAudio.metal_hit_4, { secondaryGain: 0.26, secondaryOffset: Math.round(sampleRate * 0.035), maxSeconds: 0.52, highpass: 140, release: 0.20 }));
  replacements.set('grid_crackle_1', normalize(fade(limitDuration(electricity, 0.78), 0.002, 0.20), 0.84));
  replacements.set('grid_crackle_2', normalize(fade(limitDuration(playbackRate(electricity, 0.92), 0.90), 0.002, 0.24), 0.84));
  replacements.set('thunder_tail_1', impact(sourceAudio.rock_fall_8, rumble, { rate: 0.78, secondaryRate: 0.82, secondaryGain: 0.48, lowpass: 720, maxSeconds: 1.75, release: 0.72, peak: 0.84 }));
  replacements.set('gust_surge_1', makeWindBurst(windClose, rumble, 0));
  replacements.set('gust_surge_2', makeWindBurst(windClose, rumble, 1));
  replacements.set('pull_rise_1', makePullRise(suction, windClose, 0));
  replacements.set('pull_rise_2', makePullRise(suction, windClose, 1));

  replacements.set('material_wood_1', impact(sourceAudio.wood_break_1, sourceAudio.wood_fall_2, { secondaryGain: 0.34, secondaryOffset: Math.round(sampleRate * 0.045), maxSeconds: 1.18 }));
  replacements.set('material_wood_2', impact(sourceAudio.wood_break_2, sourceAudio.wood_break_4, { rate: 0.96, secondaryRate: 1.08, secondaryGain: 0.28, secondaryOffset: Math.round(sampleRate * 0.07), maxSeconds: 1.24 }));
  replacements.set('material_metal_1', impact(sourceAudio.metal_hit_4, sourceAudio.metal_fall_2, { secondaryGain: 0.40, secondaryOffset: Math.round(sampleRate * 0.055), maxSeconds: 1.25, highpass: 70 }));
  replacements.set('material_metal_2', impact(sourceAudio.metal_hit_6, sourceAudio.metal_hit_1, { rate: 0.94, secondaryRate: 1.06, secondaryGain: 0.34, secondaryOffset: Math.round(sampleRate * 0.035), maxSeconds: 1.18, highpass: 80 }));
  replacements.set('material_glass_1', impact(sourceAudio.glass_break_2, sourceAudio.glass_fall_1, { secondaryGain: 0.48, secondaryOffset: Math.round(sampleRate * 0.04), maxSeconds: 1.20, highpass: 230 }));
  replacements.set('material_glass_2', impact(sourceAudio.glass_fall_4, sourceAudio.glass_break_2, { rate: 1.04, secondaryRate: 0.94, secondaryGain: 0.34, secondaryOffset: Math.round(sampleRate * 0.025), maxSeconds: 1.16, highpass: 260 }));
  replacements.set('material_masonry_1', impact(sourceAudio.rock_break_3, sourceAudio.rock_fall_4, { secondaryGain: 0.46, secondaryOffset: Math.round(sampleRate * 0.06), maxSeconds: 1.42, lowpass: 3200 }));
  replacements.set('material_masonry_2', impact(sourceAudio.rock_fall_4, sourceAudio.rock_break_3, { rate: 0.92, secondaryRate: 1.04, secondaryGain: 0.36, secondaryOffset: Math.round(sampleRate * 0.04), maxSeconds: 1.42, lowpass: 2800 }));
  replacements.set('material_concrete_1', impact(sourceAudio.rock_fall_8, sourceAudio.rock_break_3, { rate: 0.82, secondaryRate: 0.90, secondaryGain: 0.42, secondaryOffset: Math.round(sampleRate * 0.055), maxSeconds: 1.65, lowpass: 2100, release: 0.44 }));
  replacements.set('material_concrete_2', impact(sourceAudio.rock_break_3, sourceAudio.rock_fall_8, { rate: 0.78, secondaryRate: 0.86, secondaryGain: 0.52, secondaryOffset: Math.round(sampleRate * 0.08), maxSeconds: 1.72, lowpass: 1900, release: 0.48 }));
  replacements.set('material_utility_1', impact(sourceAudio.metal_hit_1, electricity, { secondaryGain: 0.52, secondaryOffset: Math.round(sampleRate * 0.035), maxSeconds: 1.10, highpass: 120 }));
  replacements.set('material_utility_2', impact(sourceAudio.metal_hit_4, playbackRate(electricity, 0.90), { rate: 0.94, secondaryGain: 0.56, secondaryOffset: Math.round(sampleRate * 0.06), maxSeconds: 1.18, highpass: 110 }));
  replacements.set('material_vehicle_1', impact(sourceAudio.metal_fall_2, sourceAudio.rock_fall_4, { rate: 0.88, secondaryGain: 0.32, secondaryOffset: Math.round(sampleRate * 0.045), maxSeconds: 1.48, lowpass: 4200 }));
  replacements.set('material_vehicle_2', impact(sourceAudio.metal_hit_6, sourceAudio.metal_fall_2, { rate: 0.86, secondaryRate: 0.94, secondaryGain: 0.50, secondaryOffset: Math.round(sampleRate * 0.06), maxSeconds: 1.48, lowpass: 3900 }));
  replacements.set('material_carnival_1', impact(sourceAudio.metal_hit_4, sourceAudio.wood_fall_2, { rate: 1.04, secondaryGain: 0.31, secondaryOffset: Math.round(sampleRate * 0.07), maxSeconds: 1.28 }));
  replacements.set('material_carnival_2', impact(sourceAudio.metal_fall_2, sourceAudio.wood_break_1, { rate: 1.08, secondaryRate: 1.02, secondaryGain: 0.34, secondaryOffset: Math.round(sampleRate * 0.05), maxSeconds: 1.26 }));
  replacements.set('material_tree_1', impact(sourceAudio.wood_break_4, sourceAudio.wood_fall_2, { rate: 0.90, secondaryGain: 0.44, secondaryOffset: Math.round(sampleRate * 0.085), maxSeconds: 1.48, lowpass: 4300 }));
  replacements.set('material_tree_2', impact(sourceAudio.wood_break_2, sourceAudio.wood_break_1, { rate: 0.86, secondaryRate: 0.98, secondaryGain: 0.38, secondaryOffset: Math.round(sampleRate * 0.065), maxSeconds: 1.42, lowpass: 4100 }));
  replacements.set('material_roof_1', impact(sourceAudio.metal_fall_2, sourceAudio.wood_break_1, { rate: 1.02, secondaryGain: 0.30, secondaryOffset: Math.round(sampleRate * 0.035), maxSeconds: 1.34, highpass: 65 }));
  replacements.set('material_roof_2', impact(sourceAudio.metal_hit_6, sourceAudio.metal_fall_2, { rate: 0.96, secondaryRate: 1.08, secondaryGain: 0.44, secondaryOffset: Math.round(sampleRate * 0.055), maxSeconds: 1.38, highpass: 70 }));

  for (const name of replacedClips) {
    if (!replacements.has(name)) throw new Error(`Missing recorded replacement for ${name}.`);
  }

  const clips = new Map();
  for (const [name, definition] of Object.entries(originalManifest.clips)) {
    clips.set(name, replacements.get(name) ?? sliceClip(originalSprite, definition));
  }
  if (clips.size !== 41) throw new Error(`Expected 41 final clips, found ${clips.size}.`);

  let totalSamples = 0;
  for (const signal of clips.values()) totalSamples += signal.length + silenceSamples;
  const finalSprite = new Float64Array(totalSamples);
  const finalManifest = {
    sampleRate,
    generatedBy: 'scripts/generate-storm-audio.mjs + scripts/apply-recorded-storm-effects.mjs',
    recordedEffectRevision: 2,
    recordedSources: sourceMetadata,
    clips: {}
  };
  let cursor = 0;
  for (const [name, signal] of clips.entries()) {
    finalManifest.clips[name] = { offset: cursor / sampleRate, duration: signal.length / sampleRate };
    finalSprite.set(signal, cursor);
    cursor += signal.length + silenceSamples;
  }

  const wav = encodePcm16Wav(finalSprite);
  await writeFile(spritePath, wav);
  await writeFile(manifestPath, `${JSON.stringify(finalManifest, null, 2)}\n`, 'utf8');
  await writeFile(licensePath, `# Severe Weather v4.5.0 Audio Assets\n\n## Procedural ambience\n\nThe five continuous storm ambience layers, UI click, hail, splash, siren, and Moo Brew cue are generated deterministically by \`scripts/generate-storm-audio.mjs\`.\n\n## Recorded transient effects\n\nAbility and destruction transients are assembled by \`scripts/apply-recorded-storm-effects.mjs\` from the following CC0 recordings:\n\n- **75 CC0 breaking / falling / hit SFX**, author: rubberduck, canonical source: https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx, license: CC0 1.0. The build uses selected wood, metal, glass, and rock recordings retrieved from an immutable GitHub mirror commit.\n- **Electricity Sound Effects**, author: BMacZero / Brian MacIntosh, canonical source: https://opengameart.org/content/electricity-sound-effects-0, license: CC0 1.0. The build uses \`continuousspark.wav\`, retrieved from an immutable GitHub mirror commit.\n\nThe exact retrieval URLs and SHA-256 hashes are embedded in \`storm-feel-manifest.json\` during each build. Recorded clips are trimmed, converted to 16 kHz mono PCM, layered, filtered, and normalized for mobile playback.\n`, 'utf8');

  console.log(`Replaced ${replacements.size} synthetic ability/material clips with recorded and broadband physical effects.`);
  console.log(`Final sprite: ${(wav.length / 1024 / 1024).toFixed(2)} MiB, ${clips.size} clips, ${sourceMetadata.length} pinned sources.`);
} finally {
  await rm(temporaryDir, { recursive: true, force: true });
}
