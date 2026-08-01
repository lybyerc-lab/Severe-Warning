import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const outputDir = path.join(projectRoot, 'assets', 'audio');
const sampleRate = 16000;
let seed = 0x450c0de;

function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296);
}

function lengthFor(duration) {
  return Math.max(1, Math.round(sampleRate * duration));
}

function createSignal(duration) {
  return new Float64Array(lengthFor(duration));
}

function noise(duration) {
  const output = createSignal(duration);
  for (let i = 0; i < output.length; i++) output[i] = random() * 2 - 1;
  return output;
}

function cloneSignal(input) {
  return Float64Array.from(input);
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

function bandpass(input, lowCut, highCut) {
  return highpass(lowpass(input, highCut), lowCut);
}

function tone(duration, startFrequency, endFrequency = startFrequency, shape = 'sine') {
  const output = createSignal(duration);
  const actualDuration = output.length / sampleRate;
  const slope = (endFrequency - startFrequency) / Math.max(actualDuration, 0.001);
  for (let i = 0; i < output.length; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * (startFrequency * t + 0.5 * slope * t * t);
    const cycle = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
    if (shape === 'square') output[i] = Math.sin(phase) >= 0 ? 1 : -1;
    else if (shape === 'saw') output[i] = 2 * cycle - 1;
    else if (shape === 'triangle') output[i] = 2 * Math.abs(2 * cycle - 1) - 1;
    else output[i] = Math.sin(phase);
  }
  return output;
}

function envelope(input, attackSeconds = 0.01, releaseSeconds = 0.2) {
  const output = cloneSignal(input);
  const attack = Math.min(output.length, Math.max(1, lengthFor(attackSeconds)));
  const release = Math.min(output.length, Math.max(1, lengthFor(releaseSeconds)));
  for (let i = 0; i < attack; i++) output[i] *= i / attack;
  for (let i = 0; i < release; i++) output[output.length - 1 - i] *= i / release;
  return output;
}

function mix(...parts) {
  const length = Math.max(...parts.map(part => part.signal.length));
  const output = new Float64Array(length);
  for (const part of parts) {
    const gain = part.gain ?? 1;
    for (let i = 0; i < part.signal.length; i++) output[i] += part.signal[i] * gain;
  }
  return output;
}

function normalize(input, peak = 0.92) {
  let maximum = 0;
  for (const value of input) maximum = Math.max(maximum, Math.abs(value));
  if (maximum < 1e-9) return input;
  const scale = peak / maximum;
  const output = new Float64Array(input.length);
  for (let i = 0; i < input.length; i++) output[i] = input[i] * scale;
  return output;
}

function clicks(duration, count, bodyFrequency = 160, brightness = 0.6) {
  const output = createSignal(duration);
  const safeEnd = Math.max(1, output.length - lengthFor(0.08));
  for (let clickIndex = 0; clickIndex < count; clickIndex++) {
    const start = Math.floor(random() * safeEnd);
    const clickDuration = 0.025 + random() * 0.06;
    const length = Math.min(lengthFor(clickDuration), output.length - start);
    const burstNoise = bandpass(noise(length / sampleRate), 350, 3200);
    const burstTone = tone(length / sampleRate, bodyFrequency * (0.82 + random() * 0.42), bodyFrequency * 0.55);
    const burst = envelope(mix(
      { signal: burstNoise, gain: 0.65 },
      { signal: burstTone, gain: 0.50 }
    ), 0.001, Math.max(0.01, clickDuration * 0.7));
    const clickGain = brightness * (0.45 + random() * 0.55);
    for (let i = 0; i < length; i++) output[start + i] += burst[i] * clickGain;
  }
  return output;
}

function seamless(input, fadeSeconds = 0.28) {
  const output = cloneSignal(input);
  const fade = Math.min(lengthFor(fadeSeconds), Math.floor(output.length / 4));
  const start = output.slice(0, fade);
  const end = output.slice(output.length - fade);
  for (let i = 0; i < fade; i++) {
    const weight = i / Math.max(1, fade - 1);
    output[i] = start[i] * weight + end[i] * (1 - weight);
    output[output.length - fade + i] = end[i] * (1 - weight) + start[i] * weight;
  }
  return output;
}

function modulate(input, frequency, depth, center = 1) {
  const output = new Float64Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const t = i / sampleRate;
    output[i] = input[i] * (center + Math.sin(2 * Math.PI * frequency * t) * depth);
  }
  return output;
}

const clips = new Map();
function addClip(name, signal, peak = 0.88) {
  clips.set(name, normalize(signal, peak));
}

addClip('loop_wind_low', seamless(mix(
  { signal: lowpass(noise(4.6), 520), gain: 0.62 },
  { signal: tone(4.6, 62), gain: 0.18 },
  { signal: tone(4.6, 91), gain: 0.10 }
)), 0.74);
addClip('loop_wind_close', seamless(modulate(bandpass(noise(3.8), 650, 5200), 0.7, 0.22, 0.55)), 0.76);
addClip('loop_rumble', seamless(mix(
  { signal: lowpass(noise(4.2), 170), gain: 0.48 },
  { signal: tone(4.2, 34), gain: 0.28 },
  { signal: tone(4.2, 49), gain: 0.18 }
)), 0.74);
addClip('loop_grit', seamless(mix(
  { signal: bandpass(noise(3.2), 900, 6400), gain: 0.25 },
  { signal: clicks(3.2, 34, 180, 0.28), gain: 1 }
)), 0.72);
addClip('loop_pull_suction', seamless(mix(
  { signal: bandpass(noise(3.0), 180, 2400), gain: 0.38 },
  { signal: tone(3.0, 185, 245), gain: 0.22 },
  { signal: tone(3.0, 310, 225), gain: 0.14 }
)), 0.76);

addClip('grid_snap_1', envelope(mix(
  { signal: highpass(noise(0.34), 1800), gain: 0.55 },
  { signal: tone(0.34, 1500, 120, 'saw'), gain: 0.45 }
), 0.001, 0.28));
addClip('grid_snap_2', envelope(mix(
  { signal: highpass(noise(0.40), 1800), gain: 0.45 },
  { signal: tone(0.40, 1100, 85, 'square'), gain: 0.55 }
), 0.001, 0.34));
addClip('grid_crackle_1', mix({ signal: clicks(0.72, 26, 520, 0.85) }, { signal: highpass(noise(0.72), 1800), gain: 0.18 }));
addClip('grid_crackle_2', mix({ signal: clicks(0.82, 34, 440, 0.80) }, { signal: highpass(noise(0.82), 1800), gain: 0.16 }));
addClip('thunder_tail_1', envelope(mix(
  { signal: lowpass(noise(1.8), 280), gain: 0.72 },
  { signal: tone(1.8, 58, 31), gain: 0.25 }
), 0.01, 1.55), 0.84);
addClip('gust_surge_1', envelope(mix(
  { signal: bandpass(noise(1.05), 180, 4200), gain: 0.72 },
  { signal: tone(1.05, 72, 165, 'triangle'), gain: 0.28 }
), 0.025, 0.55));
addClip('gust_surge_2', envelope(mix(
  { signal: bandpass(noise(1.18), 230, 5200), gain: 0.68 },
  { signal: tone(1.18, 58, 190, 'triangle'), gain: 0.32 }
), 0.02, 0.62));
addClip('pull_rise_1', envelope(mix(
  { signal: bandpass(noise(1.35), 150, 3100), gain: 0.45 },
  { signal: tone(1.35, 120, 360), gain: 0.38 },
  { signal: tone(1.35, 58, 41), gain: 0.18 }
), 0.06, 0.55));
addClip('pull_rise_2', envelope(mix(
  { signal: bandpass(noise(1.48), 130, 2800), gain: 0.48 },
  { signal: tone(1.48, 170, 410), gain: 0.34 },
  { signal: tone(1.48, 52, 36), gain: 0.22 }
), 0.08, 0.62));
addClip('hail_1', clicks(0.72, 18, 620, 0.8));
addClip('hail_2', clicks(0.82, 24, 740, 0.7));
addClip('splash_1', envelope(mix({ signal: lowpass(noise(0.85), 900), gain: 0.65 }, { signal: tone(0.85, 110, 55), gain: 0.25 }), 0.002, 0.72));
addClip('splash_2', envelope(mix({ signal: lowpass(noise(0.95), 1200), gain: 0.58 }, { signal: tone(0.95, 145, 62), gain: 0.32 }), 0.002, 0.78));
addClip('siren_1', envelope(mix({ signal: tone(1.2, 420, 760, 'saw'), gain: 0.55 }, { signal: tone(1.2, 760, 420, 'saw'), gain: 0.45 }), 0.02, 0.28), 0.62);
addClip('moo_1', envelope(mix({ signal: tone(0.72, 205, 135, 'saw'), gain: 0.55 }, { signal: tone(0.72, 102, 74), gain: 0.30 }), 0.03, 0.28), 0.62);
addClip('click_1', envelope(tone(0.065, 680, 430), 0.001, 0.05), 0.48);

function materialWood(duration, variant) {
  return mix(
    { signal: clicks(duration, 5 + variant * 2, 125 + variant * 20, 0.95), gain: 1 },
    { signal: envelope(lowpass(noise(duration), 900), 0.002, duration * 0.78), gain: 0.28 }
  );
}
function materialMetal(duration, variant) {
  return envelope(mix(
    { signal: bandpass(noise(duration), 500, 6500), gain: 0.50 },
    { signal: tone(duration, 510 + variant * 120, 170 + variant * 30, 'saw'), gain: 0.55 }
  ), 0.001, duration * 0.86);
}
function materialGlass(duration, variant) {
  return envelope(mix(
    { signal: clicks(duration, 16 + variant * 5, 1800 + variant * 350, 0.9) },
    { signal: highpass(noise(duration), 2200), gain: 0.32 }
  ), 0.001, duration * 0.82);
}
function materialMasonry(duration, variant) {
  return envelope(mix(
    { signal: lowpass(noise(duration), 700), gain: 0.75 },
    { signal: tone(duration, 95 + variant * 14, 46), gain: 0.30 }
  ), 0.002, duration * 0.88);
}
function materialConcrete(duration, variant) {
  return envelope(mix(
    { signal: lowpass(noise(duration), 460), gain: 0.82 },
    { signal: tone(duration, 72 + variant * 9, 38), gain: 0.34 }
  ), 0.003, duration * 0.90);
}
function materialUtility(duration, variant) {
  return mix(
    { signal: materialMetal(duration, variant), gain: 0.62 },
    { signal: clicks(duration, 14 + variant * 3, 880, 0.65) },
    { signal: tone(duration, 180, 55, 'square'), gain: 0.22 }
  );
}
function materialVehicle(duration, variant) {
  return envelope(mix(
    { signal: materialMetal(duration, variant), gain: 0.48 },
    { signal: tone(duration, 130 + variant * 18, 58, 'saw'), gain: 0.35 },
    { signal: clicks(duration, 5, 240, 0.55) }
  ), 0.002, duration * 0.82);
}
function materialCarnival(duration, variant) {
  return envelope(mix(
    { signal: materialMetal(duration, variant), gain: 0.40 },
    { signal: clicks(duration, 10 + variant * 4, 640, 0.72) },
    { signal: tone(duration, 330 + variant * 50, 140, 'triangle'), gain: 0.25 }
  ), 0.002, duration * 0.84);
}
function materialTree(duration, variant) {
  return envelope(mix(
    { signal: materialWood(duration, variant), gain: 0.72 },
    { signal: lowpass(noise(duration), 420), gain: 0.28 }
  ), 0.002, duration * 0.88);
}
function materialRoof(duration, variant) {
  return envelope(mix(
    { signal: materialMetal(duration, variant), gain: 0.68 },
    { signal: bandpass(noise(duration), 900, 5500), gain: 0.34 }
  ), 0.002, duration * 0.86);
}

const materialGenerators = {
  wood: materialWood,
  metal: materialMetal,
  glass: materialGlass,
  masonry: materialMasonry,
  concrete: materialConcrete,
  utility: materialUtility,
  vehicle: materialVehicle,
  carnival: materialCarnival,
  tree: materialTree,
  roof: materialRoof
};

for (const [family, generator] of Object.entries(materialGenerators)) {
  for (const variant of [1, 2]) {
    const duration = 0.56 + 0.08 * variant + (['masonry', 'concrete', 'vehicle', 'carnival'].includes(family) ? 0.16 : 0);
    addClip(`material_${family}_${variant}`, generator(duration, variant));
  }
}

const silenceSamples = lengthFor(0.10);
const manifest = { sampleRate, generatedBy: 'scripts/generate-storm-audio.mjs', clips: {} };
let totalSamples = 0;
for (const signal of clips.values()) totalSamples += signal.length + silenceSamples;
const sprite = new Float64Array(totalSamples);
let cursor = 0;
for (const [name, signal] of clips.entries()) {
  manifest.clips[name] = { offset: cursor / sampleRate, duration: signal.length / sampleRate };
  sprite.set(signal, cursor);
  cursor += signal.length + silenceSamples;
}

const wav = Buffer.alloc(44 + sprite.length * 2);
wav.write('RIFF', 0, 'ascii');
wav.writeUInt32LE(36 + sprite.length * 2, 4);
wav.write('WAVE', 8, 'ascii');
wav.write('fmt ', 12, 'ascii');
wav.writeUInt32LE(16, 16);
wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34);
wav.write('data', 36, 'ascii');
wav.writeUInt32LE(sprite.length * 2, 40);
for (let i = 0; i < sprite.length; i++) {
  const sample = Math.max(-1, Math.min(1, sprite[i]));
  wav.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
}

await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'storm-feel-sprite.wav'), wav);
await writeFile(path.join(outputDir, 'storm-feel-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(path.join(outputDir, 'LICENSE.md'), `# Severe Weather v4.5.0 Audio Asset License\n\nAll audio in \`storm-feel-sprite.wav\` is generated deterministically for the Severe Weather project by \`scripts/generate-storm-audio.mjs\`. No third-party recordings, samples, melodies, or copyrighted source audio are used.\n\nCopyright (c) 2026 lybyerc-lab. All rights reserved for use within the Severe Weather project and its distributed builds.\n\nThe sprite contains continuous storm ambience, ability cues, UI cues, and ten material-specific destruction families. The accompanying JSON manifest records clip offsets and durations.\n`, 'utf8');

console.log(`Generated ${clips.size} local storm audio clips (${(wav.length / 1024 / 1024).toFixed(2)} MiB WAV sprite).`);
