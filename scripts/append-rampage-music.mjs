import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const audioDir = process.env.SEVERE_WEATHER_AUDIO_DIR
  ? path.resolve(process.env.SEVERE_WEATHER_AUDIO_DIR)
  : path.join(projectRoot, 'assets', 'audio');
const spritePath = path.join(audioDir, 'storm-feel-sprite.wav');
const manifestPath = path.join(audioDir, 'storm-feel-manifest.json');
const licensePath = path.join(audioDir, 'LICENSE.md');
const sampleRate = 16000;
const gapSamples = Math.round(sampleRate * 0.085);
let seed = 0x450a11ce;

function random() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

function parsePcm16Wav(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Expected RIFF/WAVE audio sprite.');
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
    throw new Error(`Unsupported WAV format: ${JSON.stringify(format)}`);
  }
  const output = new Float64Array(Math.floor(dataLength / 2));
  for (let i = 0; i < output.length; i++) output[i] = buffer.readInt16LE(dataStart + i * 2) / 32768;
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

function normalize(input, peak = 0.88) {
  let maximum = 0;
  for (const value of input) maximum = Math.max(maximum, Math.abs(value));
  if (maximum < 1e-9) return Float64Array.from(input);
  const output = new Float64Array(input.length);
  const scale = peak / maximum;
  for (let i = 0; i < input.length; i++) output[i] = input[i] * scale;
  return output;
}

function loopGuard(input, seconds = 0.008) {
  const output = Float64Array.from(input);
  const fade = Math.max(1, Math.min(Math.floor(output.length / 4), Math.round(seconds * sampleRate)));
  for (let i = 0; i < fade; i++) {
    const weight = i / fade;
    output[i] *= weight;
    output[output.length - 1 - i] *= weight;
  }
  return output;
}

function softClip(input, drive = 1.35) {
  const output = new Float64Array(input.length);
  const divisor = Math.tanh(drive);
  for (let i = 0; i < input.length; i++) output[i] = Math.tanh(input[i] * drive) / divisor;
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

function sliceClip(sprite, definition) {
  const start = Math.max(0, Math.round(definition.offset * sampleRate));
  const length = Math.max(1, Math.round(definition.duration * sampleRate));
  return sprite.slice(start, Math.min(sprite.length, start + length));
}

function addSignal(target, signal, offsetSeconds, gain = 1) {
  const offset = Math.max(0, Math.round(offsetSeconds * sampleRate));
  for (let i = 0; i < signal.length && offset + i < target.length; i++) target[offset + i] += signal[i] * gain;
}

function envelope(signal, attackSeconds, releaseSeconds) {
  const output = Float64Array.from(signal);
  const attack = Math.max(1, Math.min(output.length, Math.round(attackSeconds * sampleRate)));
  const release = Math.max(1, Math.min(output.length, Math.round(releaseSeconds * sampleRate)));
  for (let i = 0; i < attack; i++) output[i] *= i / attack;
  for (let i = 0; i < release; i++) output[output.length - 1 - i] *= i / release;
  return output;
}

function oscillator(duration, frequency, shape = 'sine', endFrequency = frequency) {
  const length = Math.max(1, Math.round(duration * sampleRate));
  const output = new Float64Array(length);
  const slope = (endFrequency - frequency) / Math.max(duration, 0.001);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const phase = 2 * Math.PI * (frequency * t + 0.5 * slope * t * t);
    const cycle = ((phase / (2 * Math.PI)) % 1 + 1) % 1;
    if (shape === 'triangle') output[i] = 2 * Math.abs(2 * cycle - 1) - 1;
    else if (shape === 'saw') output[i] = 2 * cycle - 1;
    else output[i] = Math.sin(phase);
  }
  return output;
}

function noise(duration) {
  const output = new Float64Array(Math.max(1, Math.round(duration * sampleRate)));
  for (let i = 0; i < output.length; i++) output[i] = random() * 2 - 1;
  return output;
}

function kick(gain = 1) {
  const body = oscillator(0.34, 92, 'sine', 43);
  const click = highpass(noise(0.045), 1800);
  const output = new Float64Array(body.length);
  for (let i = 0; i < output.length; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 12.5);
    output[i] = body[i] * decay * 0.92;
    if (i < click.length) output[i] += click[i] * Math.exp(-t * 80) * 0.18;
    output[i] *= gain;
  }
  return output;
}

function snare(gain = 1) {
  const burst = highpass(noise(0.22), 720);
  const body = oscillator(0.22, 178, 'sine', 128);
  const output = new Float64Array(burst.length);
  for (let i = 0; i < output.length; i++) {
    const t = i / sampleRate;
    const decay = Math.exp(-t * 18);
    output[i] = (burst[i] * 0.72 + body[i] * 0.28) * decay * gain;
  }
  return output;
}

function hat(gain = 1, open = false) {
  const duration = open ? 0.18 : 0.07;
  const burst = highpass(noise(duration), 4200);
  const output = new Float64Array(burst.length);
  for (let i = 0; i < output.length; i++) {
    const t = i / sampleRate;
    output[i] = burst[i] * Math.exp(-t * (open ? 22 : 52)) * gain;
  }
  return output;
}

function tom(frequency = 118, gain = 1) {
  const output = oscillator(0.30, frequency, 'sine', frequency * 0.62);
  for (let i = 0; i < output.length; i++) output[i] *= Math.exp(-(i / sampleRate) * 10.5) * gain;
  return output;
}

function bassNote(frequency, duration = 0.40, gain = 1) {
  const fundamental = oscillator(duration, frequency, 'triangle');
  const octave = oscillator(duration, frequency * 2, 'sine');
  const output = new Float64Array(fundamental.length);
  for (let i = 0; i < output.length; i++) output[i] = fundamental[i] * 0.72 + octave[i] * 0.18;
  return envelope(lowpass(output, 520), 0.012, Math.min(0.18, duration * 0.48)).map(value => value * gain);
}

function createLowDriveLoop() {
  const duration = 8;
  const output = new Float64Array(duration * sampleRate);
  const droneA = oscillator(duration, 55, 'sine');
  const droneB = oscillator(duration, 82.5, 'sine');
  for (let i = 0; i < output.length; i++) {
    const breathing = 0.72 + Math.sin(2 * Math.PI * 0.25 * (i / sampleRate)) * 0.12;
    output[i] += (droneA[i] * 0.055 + droneB[i] * 0.018) * breathing;
  }

  for (let beat = 0; beat < 16; beat++) {
    const time = beat * 0.5;
    if (beat % 2 === 0) addSignal(output, kick(beat % 8 === 0 ? 1 : 0.84), time);
    if (beat % 4 === 2) addSignal(output, kick(0.46), time + 0.25);
    if (beat % 4 === 1 || beat % 4 === 3) addSignal(output, snare(0.56), time);
    addSignal(output, hat(beat % 4 === 3 ? 0.23 : 0.16, beat % 4 === 3), time + 0.25);
  }

  const notePattern = [55, 55, 65.406, 55, 49, 49, 55, 65.406, 55, 55, 73.416, 65.406, 49, 55, 65.406, 55];
  notePattern.forEach((frequency, index) => addSignal(output, bassNote(frequency, 0.39, index % 4 === 0 ? 0.34 : 0.27), index * 0.5));
  return normalize(loopGuard(softClip(lowpass(output, 6200), 1.18)), 0.78);
}

function createHighDriveLoop(metalClip) {
  const duration = 8;
  const output = new Float64Array(duration * sampleRate);
  for (let step = 0; step < 32; step++) {
    const time = step * 0.25;
    const open = step % 8 === 7;
    addSignal(output, hat(open ? 0.26 : (step % 2 === 0 ? 0.18 : 0.12), open), time);
  }
  [0.75, 1.75, 2.75, 3.75, 4.75, 5.75, 6.75].forEach((time, index) => {
    addSignal(output, snare(index % 2 === 0 ? 0.32 : 0.25), time);
  });
  [1.50, 1.75, 3.50, 3.75, 5.50, 5.75, 7.25, 7.50].forEach((time, index) => {
    addSignal(output, tom(index % 2 === 0 ? 132 : 104, 0.31), time);
  });
  const metalAccent = envelope(highpass(metalClip.slice(0, Math.min(metalClip.length, Math.round(sampleRate * 0.42))), 520), 0.001, 0.21);
  [1.98, 3.98, 5.98].forEach(time => addSignal(output, metalAccent, time, 0.16));
  const pulse = lowpass(noise(duration), 240);
  for (let i = 0; i < output.length; i++) {
    const gate = Math.pow(Math.max(0, Math.sin(2 * Math.PI * 2 * (i / sampleRate))), 7);
    output[i] += pulse[i] * gate * 0.052;
  }
  return normalize(loopGuard(softClip(highpass(output, 120), 1.12)), 0.72);
}

function createRampageStinger(concreteClip, metalClip, crackleClip) {
  const duration = 1.34;
  const output = new Float64Array(Math.round(duration * sampleRate));
  const boom = oscillator(0.95, 71, 'sine', 36);
  for (let i = 0; i < boom.length; i++) boom[i] *= Math.exp(-(i / sampleRate) * 4.2);
  addSignal(output, boom, 0, 0.62);
  addSignal(output, lowpass(concreteClip, 2600), 0.015, 0.52);
  addSignal(output, highpass(metalClip, 340), 0.075, 0.36);
  addSignal(output, highpass(crackleClip, 1100), 0.20, 0.20);
  addSignal(output, tom(146, 0.34), 0.06);
  addSignal(output, tom(104, 0.30), 0.18);
  return normalize(softClip(envelope(output, 0.002, 0.36), 1.22), 0.88);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const sprite = parsePcm16Wav(await readFile(spritePath));
if (manifest.sampleRate !== sampleRate) throw new Error(`Expected ${sampleRate} Hz sprite, found ${manifest.sampleRate}.`);
for (const name of ['music_drive_low', 'music_drive_high', 'music_rampage_stinger']) {
  if (manifest.clips && manifest.clips[name]) throw new Error(`Music clip already exists: ${name}`);
}

const required = ['material_metal_1', 'material_concrete_2', 'grid_crackle_1'];
for (const name of required) {
  if (!manifest.clips || !manifest.clips[name]) throw new Error(`Required source clip is missing: ${name}`);
}
const metalClip = sliceClip(sprite, manifest.clips.material_metal_1);
const concreteClip = sliceClip(sprite, manifest.clips.material_concrete_2);
const crackleClip = sliceClip(sprite, manifest.clips.grid_crackle_1);
const musicClips = new Map([
  ['music_drive_low', createLowDriveLoop()],
  ['music_drive_high', createHighDriveLoop(metalClip)],
  ['music_rampage_stinger', createRampageStinger(concreteClip, metalClip, crackleClip)]
]);

let appendLength = 0;
for (const signal of musicClips.values()) appendLength += gapSamples + signal.length;
const combined = new Float64Array(sprite.length + appendLength);
combined.set(sprite, 0);
let cursor = sprite.length;
manifest.musicRevision = 1;
manifest.musicDesign = 'Original adaptive industrial storm-chase score generated by scripts/append-rampage-music.mjs';
manifest.generatedBy = `${manifest.generatedBy || 'unknown'} + scripts/append-rampage-music.mjs`;
for (const [name, signal] of musicClips.entries()) {
  cursor += gapSamples;
  manifest.clips[name] = { offset: cursor / sampleRate, duration: signal.length / sampleRate };
  combined.set(signal, cursor);
  cursor += signal.length;
}

const existingLicense = await readFile(licensePath, 'utf8');
const musicLicenseSection = `\n## Original dynamic music\n\nThe clips \`music_drive_low\`, \`music_drive_high\`, and \`music_rampage_stinger\` are original deterministic compositions generated for Severe Weather by \`scripts/append-rampage-music.mjs\`. They contain no sampled melody or third-party musical work. The stinger layers project-generated synthesis with CC0 transient recordings already documented above.\n`;
await writeFile(spritePath, encodePcm16Wav(combined));
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(licensePath, `${existingLicense.trimEnd()}\n${musicLicenseSection}`, 'utf8');

const clipCount = Object.keys(manifest.clips || {}).length;
if (clipCount !== 44) throw new Error(`Expected 44 final clips after music append, found ${clipCount}.`);
console.log(`Appended ${musicClips.size} original dynamic music clips. Final manifest: ${clipCount} clips.`);
