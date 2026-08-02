import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const sourcePath = process.env.SEVERE_WEATHER_SOURCE_PATH
  ? path.resolve(process.env.SEVERE_WEATHER_SOURCE_PATH)
  : path.join(projectRoot, 'MechanicsLab', 'SevereWeather_3D_Lab.html');
let html = await readFile(sourcePath, 'utf8');

function countMatches(needle) {
  return html.split(needle).length - 1;
}

function replaceUnique(before, after, label) {
  const count = countMatches(before);
  if (count !== 1) throw new Error(`${label}: expected exactly one source match, found ${count}`);
  html = html.replace(before, after);
}

function replaceAllRequired(before, after, label) {
  const count = countMatches(before);
  if (count < 1) throw new Error(`${label}: expected at least one source match, found ${count}`);
  html = html.split(before).join(after);
}

function replaceBetween(startMarker, endMarker, replacement, label) {
  const startCount = countMatches(startMarker);
  const endCount = countMatches(endMarker);
  if (startCount !== 1 || endCount !== 1) {
    throw new Error(`${label}: expected one start and one end marker, found ${startCount}/${endCount}`);
  }
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (end <= start) throw new Error(`${label}: end marker did not follow start marker`);
  html = html.slice(0, start) + replacement + html.slice(end + endMarker.length);
}

replaceUnique(
  '</style>',
  String.raw`  /* [SW:UI:QA_PANEL] QA-only audio diagnostics. */
  #audioLabToggle { position: fixed; right: max(10px, env(safe-area-inset-right)); bottom: max(10px, env(safe-area-inset-bottom)); z-index: 2200; border: 1px solid rgba(125,211,252,0.72); border-radius: 999px; padding: 8px 11px; background: rgba(3,7,18,0.9); color: #e0f2fe; font: 900 11px/1 Outfit, sans-serif; letter-spacing: 0.08em; }
  #audioLabPanel { position: fixed; right: max(10px, env(safe-area-inset-right)); bottom: calc(max(10px, env(safe-area-inset-bottom)) + 42px); z-index: 2199; width: min(430px, calc(100vw - 20px)); max-height: min(74vh, 560px); overflow: auto; border: 1px solid rgba(125,211,252,0.55); border-radius: 14px; padding: 12px; background: rgba(2,6,23,0.96); color: #e5f4ff; box-shadow: 0 18px 50px rgba(0,0,0,0.55); font: 600 11px/1.35 Inter, sans-serif; }
  #audioLabPanel[hidden] { display: none; }
  #audioLabPanel h2 { margin: 0 0 9px; color: #7dd3fc; font: 900 16px/1 Outfit, sans-serif; letter-spacing: 0.04em; }
  .audio-lab-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 7px 0; }
  .audio-lab-row button, #audioLabClipSelect { min-height: 34px; border: 1px solid rgba(148,163,184,0.55); border-radius: 8px; background: #111827; color: #f8fafc; padding: 7px 9px; font: 800 11px/1 Inter, sans-serif; }
  .audio-lab-row button.active { border-color: #38bdf8; background: #0c4a6e; color: #e0f2fe; }
  #audioLabClipSelect { flex: 1 1 230px; min-width: 0; }
  #audioLabStatus, #audioLabEvents { margin: 7px 0 0; padding: 8px; border-radius: 9px; background: rgba(15,23,42,0.9); white-space: pre-wrap; overflow-wrap: anywhere; }
  #audioLabEvents { max-height: 190px; overflow: auto; color: #cbd5e1; }
  /* [SW:UI:QA_PANEL:END] */
</style>`,
  'Audio Lab CSS'
);

replaceUnique(
  '<div id="rampageFeedbackLayer" aria-hidden="true"></div>',
  String.raw`<div id="rampageFeedbackLayer" aria-hidden="true"></div>
<button id="audioLabToggle" type="button" aria-controls="audioLabPanel" aria-expanded="false">QA AUDIO</button>
<section id="audioLabPanel" hidden aria-label="Audio Lab">
  <h2>Audio Lab</h2>
  <div class="audio-lab-row">
    <select id="audioLabClipSelect" aria-label="Audio clip"></select>
    <button id="audioLabPlayBtn" type="button">PLAY CLIP</button>
  </div>
  <div class="audio-lab-row" id="audioLabBusButtons">
    <button type="button" data-audio-bus="music">SOLO MUSIC</button>
    <button type="button" data-audio-bus="ambience">SOLO AMBIENCE</button>
    <button type="button" data-audio-bus="effects">SOLO EFFECTS</button>
    <button type="button" data-audio-bus="news">SOLO NEWS</button>
    <button id="audioLabAllBuses" type="button">ALL BUSES</button>
  </div>
  <div id="audioLabStatus">Audio engine not initialized.</div>
  <div id="audioLabEvents">No sound events yet.</div>
</section>`,
  'Audio Lab markup'
);

replaceUnique(
  'let musicGain = null;\nlet newsDuckingGain = null;',
  'let musicGain = null;\nlet newsGain = null;\nlet newsDuckingGain = null;',
  'news bus declaration'
);

replaceUnique(
  'let headlineDuckTimer = 0;\nconst MAX_AUDIO_VOICES = 18;',
  String.raw`let headlineDuckTimer = 0;
const MAX_AUDIO_VOICES = 18;
const AUDIO_EVENT_LIMIT = 30;
const AUDIO_BUS_BASE_GAINS = Object.freeze({ ambience: 0.72, effects: 0.92, music: 0.78, news: 0.82 });
const recentAudioEvents = [];
let qaSoloBus = null;
let audioLabRefreshTimer = 0;
let lastGlassAudioAt = -Infinity;
const GLASS_COOLDOWN_SECONDS = 0.32;
const MAX_GLASS_VOICES = 1;`,
  'audio diagnostics state'
);

replaceUnique(
  String.raw`  musicGain = audioCtx.createGain();
  newsDuckingGain = audioCtx.createGain();
  masterGain.gain.value = isAudioMuted ? 0 : 0.92;
  ambienceGain.gain.value = 0.72;
  effectsGain.gain.value = 0.92;
  musicGain.gain.value = 0.56;
  newsDuckingGain.gain.value = 1;
  ambienceGain.connect(newsDuckingGain);
  effectsGain.connect(newsDuckingGain);
  musicGain.connect(newsDuckingGain);`,
  String.raw`  musicGain = audioCtx.createGain();
  newsGain = audioCtx.createGain();
  newsDuckingGain = audioCtx.createGain();
  masterGain.gain.value = isAudioMuted ? 0 : 0.92;
  ambienceGain.gain.value = AUDIO_BUS_BASE_GAINS.ambience;
  effectsGain.gain.value = AUDIO_BUS_BASE_GAINS.effects;
  musicGain.gain.value = AUDIO_BUS_BASE_GAINS.music;
  newsGain.gain.value = AUDIO_BUS_BASE_GAINS.news;
  newsDuckingGain.gain.value = 1;
  ambienceGain.connect(newsDuckingGain);
  effectsGain.connect(newsDuckingGain);
  musicGain.connect(newsDuckingGain);
  newsGain.connect(masterGain);`,
  'music and news bus graph'
);

replaceUnique(
  '    ensureAmbientLoops();\n    return true;',
  '    ensureAmbientLoops();\n    populateAudioLabClips();\n    refreshAudioLab();\n    return true;',
  'Audio Lab manifest hook'
);

const audioDiagnosticsBlock = String.raw`// ============================================================================
// [SW:AUDIO:EVENT_LOG]
// Purpose: Trace every requested clip with trigger, bus, gain, pan, and status.
// Invariants:
// - Logging must not change gameplay timing.
// - The log is bounded for mobile memory safety.
// ============================================================================
function recordAudioEvent(details) {
  recentAudioEvents.unshift({
    at: performance.now(),
    clip: details.clip || 'unknown',
    trigger: details.trigger || 'unspecified',
    gain: Number.isFinite(details.gain) ? details.gain : 0,
    pan: Number.isFinite(details.pan) ? details.pan : 0,
    bus: details.bus || 'effects',
    status: details.status || 'played'
  });
  if (recentAudioEvents.length > AUDIO_EVENT_LIMIT) recentAudioEvents.length = AUDIO_EVENT_LIMIT;
  refreshAudioLabSoon();
}

function resolveAudioOutputBus(bus) {
  if (bus === 'ambience') return ambienceGain;
  if (bus === 'music') return musicGain;
  if (bus === 'news') return newsGain;
  return effectsGain;
}

function activeVoiceCount(bus = null) {
  cleanAudioVoices();
  return activeAudioVoices.filter(voice => !bus || voice.bus === bus).length;
}

function activeClipCount(prefix) {
  cleanAudioVoices();
  return activeAudioVoices.filter(voice => !voice.ended && String(voice.name || '').startsWith(prefix)).length;
}

function decodedClipEnergy(name) {
  const clip = getClipDefinition(name);
  if (!clip || !stormAudioBuffer) return 0;
  const data = stormAudioBuffer.getChannelData(0);
  const start = Math.max(0, Math.floor(clip.offset * stormAudioBuffer.sampleRate));
  const end = Math.min(data.length, start + Math.floor(clip.duration * stormAudioBuffer.sampleRate));
  if (end <= start) return 0;
  const step = Math.max(1, Math.floor((end - start) / 12000));
  let sum = 0;
  let count = 0;
  for (let index = start; index < end; index += step) {
    sum += data[index] * data[index];
    count += 1;
  }
  return count > 0 ? Math.sqrt(sum / count) : 0;
}
// [SW:AUDIO:EVENT_LOG:END]

// ============================================================================
// [SW:AUDIO:QA_PANEL]
// Purpose: Expose clip audition, bus soloing, energy, voices, and event history.
// ============================================================================
function inferQaClipBus(name) {
  if (String(name).startsWith('music_')) return 'music';
  if (String(name).startsWith('loop_')) return 'ambience';
  if (String(name).startsWith('siren') || String(name).startsWith('eas')) return 'news';
  return 'effects';
}

function populateAudioLabClips() {
  const select = getCachedEl('audioLabClipSelect');
  if (!select || !stormAudioManifest || !stormAudioManifest.clips) return;
  const selected = select.value;
  const names = Object.keys(stormAudioManifest.clips).sort();
  select.replaceChildren(...names.map(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    return option;
  }));
  if (selected && names.includes(selected)) select.value = selected;
}

function setQaSoloBus(bus) {
  qaSoloBus = bus || null;
  if (!audioCtx) initAudio();
  const now = audioCtx ? audioCtx.currentTime : 0;
  for (const [name, node] of Object.entries({ ambience: ambienceGain, effects: effectsGain, music: musicGain, news: newsGain })) {
    if (!node || !audioCtx) continue;
    const target = !qaSoloBus || qaSoloBus === name ? AUDIO_BUS_BASE_GAINS[name] : 0;
    node.gain.cancelScheduledValues(now);
    node.gain.setTargetAtTime(Math.max(0.0001, target), now, 0.025);
  }
  document.querySelectorAll('[data-audio-bus]').forEach(button => button.classList.toggle('active', button.dataset.audioBus === qaSoloBus));
  refreshAudioLab();
}

async function playSelectedQaClip() {
  initAudio();
  await loadStormAudioAssets();
  const select = getCachedEl('audioLabClipSelect');
  const name = select ? select.value : '';
  if (!name) return;
  playStormClip(name, { gain: 0.68, priority: 10, playbackRate: 1, bus: inferQaClipBus(name), trigger: 'qa-audio-lab' });
}

function refreshAudioLabSoon() {
  if (audioLabRefreshTimer) return;
  audioLabRefreshTimer = window.setTimeout(() => {
    audioLabRefreshTimer = 0;
    refreshAudioLab();
  }, 50);
}

function refreshAudioLab() {
  const status = getCachedEl('audioLabStatus');
  const events = getCachedEl('audioLabEvents');
  const select = getCachedEl('audioLabClipSelect');
  if (!status || !events) return;
  const selected = select ? select.value : '';
  const gains = {
    master: masterGain ? masterGain.gain.value : 0,
    music: musicGain ? musicGain.gain.value : 0,
    ambience: ambienceGain ? ambienceGain.gain.value : 0,
    effects: effectsGain ? effectsGain.gain.value : 0,
    news: newsGain ? newsGain.gain.value : 0
  };
  status.textContent = [
    'ready=' + stormAudioReady + ' context=' + (audioCtx ? audioCtx.state : 'none') + ' muted=' + isAudioMuted,
    'solo=' + (qaSoloBus || 'all') + ' voices=' + activeVoiceCount() + ' musicVoices=' + activeVoiceCount('music'),
    'gain master=' + gains.master.toFixed(3) + ' music=' + gains.music.toFixed(3) + ' ambience=' + gains.ambience.toFixed(3) + ' effects=' + gains.effects.toFixed(3) + ' news=' + gains.news.toFixed(3),
    selected ? 'selected=' + selected + ' energy=' + decodedClipEnergy(selected).toFixed(5) : 'selected=none'
  ].join('\n');
  events.textContent = recentAudioEvents.length
    ? recentAudioEvents.map(event => (((performance.now() - event.at) / 1000).toFixed(1) + 's ' + event.status + ' ' + event.clip + ' trigger=' + event.trigger + ' bus=' + event.bus + ' gain=' + event.gain.toFixed(3) + ' pan=' + event.pan.toFixed(2))).join('\n')
    : 'No sound events yet.';
}

function bindAudioLabControls() {
  const toggle = getCachedEl('audioLabToggle');
  const panel = getCachedEl('audioLabPanel');
  if (!toggle || !panel || toggle.dataset.bound === 'true') return;
  toggle.dataset.bound = 'true';
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) {
      initAudio();
      populateAudioLabClips();
      refreshAudioLab();
    }
  });
  getCachedEl('audioLabPlayBtn')?.addEventListener('click', playSelectedQaClip);
  getCachedEl('audioLabAllBuses')?.addEventListener('click', () => setQaSoloBus(null));
  document.querySelectorAll('[data-audio-bus]').forEach(button => button.addEventListener('click', () => setQaSoloBus(button.dataset.audioBus)));
  getCachedEl('audioLabClipSelect')?.addEventListener('change', refreshAudioLab);
  window.setInterval(() => {
    if (!panel.hidden) refreshAudioLab();
  }, 300);
}

queueMicrotask(bindAudioLabControls);
// [SW:AUDIO:QA_PANEL:END]

`;

replaceUnique(
  'function playStormClip(name, options = {}) {',
  audioDiagnosticsBlock + 'function playStormClip(name, options = {}) {',
  'audio diagnostics insertion'
);

replaceBetween(
  'function playStormClip(name, options = {}) {',
  'function playStormLoop(name, initialGain = 0, bus = \'ambience\') {',
  String.raw`function playStormClip(name, options = {}) {
  const bus = options.bus || 'effects';
  const trigger = options.trigger || 'direct';
  const requestedGain = Math.max(0.0001, options.gain ?? 0.65);
  const requestedPan = THREE.MathUtils.clamp(options.pan ?? 0, -0.85, 0.85);
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || isAudioMuted || isBotMode) {
    recordAudioEvent({ clip: name, trigger, gain: requestedGain, pan: requestedPan, bus, status: 'blocked' });
    return null;
  }
  const clip = getClipDefinition(name);
  if (!clip) {
    recordAudioEvent({ clip: name, trigger, gain: requestedGain, pan: requestedPan, bus, status: 'missing' });
    return null;
  }
  const priority = options.priority ?? 1;
  if (!enforceAudioVoiceLimit(priority)) {
    recordAudioEvent({ clip: name, trigger, gain: requestedGain, pan: requestedPan, bus, status: 'voice-limit' });
    return null;
  }

  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  const panNode = typeof audioCtx.createStereoPanner === 'function' ? audioCtx.createStereoPanner() : null;
  source.buffer = stormAudioBuffer;
  source.playbackRate.value = options.playbackRate ?? (0.94 + Math.random() * 0.12);
  gainNode.gain.value = requestedGain;
  if (panNode) panNode.pan.value = requestedPan;
  source.connect(gainNode);
  const outputBus = resolveAudioOutputBus(bus);
  if (panNode) {
    gainNode.connect(panNode);
    panNode.connect(outputBus);
  } else {
    gainNode.connect(outputBus);
  }
  const voice = {
    name, bus, trigger, source, gainNode, panNode, priority,
    gain: requestedGain,
    pan: requestedPan,
    startedAt: now,
    endTime: now + clip.duration / Math.max(0.01, source.playbackRate.value),
    loop: Boolean(options.loop),
    ended: false
  };
  source.onended = () => { voice.ended = true; refreshAudioLabSoon(); };
  activeAudioVoices.push(voice);
  source.start(now, clip.offset, clip.duration);
  recordAudioEvent({ clip: name, trigger, gain: requestedGain, pan: requestedPan, bus, status: 'played' });
  return voice;
}

function playStormLoop(name, initialGain = 0, bus = 'ambience') {`,
  'instrumented one-shot playback'
);

replaceBetween(
  'function playStormLoop(name, initialGain = 0, bus = \'ambience\') {',
  'function ensureAmbientLoops() {',
  String.raw`function playStormLoop(name, initialGain = 0, bus = 'ambience') {
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || ambientAudioLoops.has(name)) return ambientAudioLoops.get(name) || null;
  const clip = getClipDefinition(name);
  if (!clip) {
    recordAudioEvent({ clip: name, trigger: 'loop-start', gain: initialGain, pan: 0, bus, status: 'missing' });
    return null;
  }
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  source.buffer = stormAudioBuffer;
  source.loop = true;
  source.loopStart = clip.offset;
  source.loopEnd = clip.offset + clip.duration;
  gainNode.gain.value = initialGain;
  source.connect(gainNode);
  gainNode.connect(resolveAudioOutputBus(bus));
  source.start(audioCtx.currentTime, clip.offset);
  const voice = { name, bus, trigger: 'loop-start', source, gainNode, priority: 9, gain: initialGain, pan: 0, targetGain: initialGain, startedAt: audioCtx.currentTime, endTime: Infinity, loop: true, ended: false };
  ambientAudioLoops.set(name, voice);
  activeAudioVoices.push(voice);
  recordAudioEvent({ clip: name, trigger: 'loop-start', gain: initialGain, pan: 0, bus, status: 'played' });
  return voice;
}

function ensureAmbientLoops() {`,
  'instrumented loop playback'
);

replaceBetween(
  'function setAmbientLoopGain(name, value, timeConstant = 0.12) {',
  'function updateStormSoundscape(speed, efMultiplier) {',
  String.raw`function setAmbientLoopGain(name, value, timeConstant = 0.12) {
  const voice = ambientAudioLoops.get(name);
  if (!voice || !audioCtx) return;
  const target = Math.max(0.0001, value);
  const previousTarget = voice.targetGain ?? 0;
  voice.targetGain = target;
  voice.gain = target;
  if ((previousTarget <= 0.001 && target > 0.001) || Math.abs(previousTarget - target) >= 0.08) {
    recordAudioEvent({ clip: name, trigger: 'loop-gain', gain: target, pan: 0, bus: voice.bus || 'ambience', status: 'gain-change' });
  }
  const now = audioCtx.currentTime;
  voice.gainNode.gain.cancelScheduledValues(now);
  voice.gainNode.gain.setTargetAtTime(target, now, timeConstant);
}

function updateStormSoundscape(speed, efMultiplier) {`,
  'loop gain diagnostics'
);

replaceUnique(
  "  setAmbientLoopGain('music_drive_low', audible ? 0.075 + intensity * 0.025 : 0, 0.24);\n  setAmbientLoopGain('music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.115 + intensity * 0.018 : 0, 0.20);",
  "  setAmbientLoopGain('music_drive_low', audible ? 0.14 + intensity * 0.04 : 0, 0.24);\n  setAmbientLoopGain('music_drive_high', audible ? Math.max(0, comboHeat - 0.18) * 0.16 + intensity * 0.028 : 0, 0.20);",
  'audible music mix'
);

replaceBetween(
  'function playMaterialSound(family, x = storm.pos.x, z = storm.pos.z, intensity = 1, options = {}) {',
  'function playAbilitySound(type) {',
  String.raw`function playMaterialSound(family, x = storm.pos.x, z = storm.pos.z, intensity = 1, options = {}) {
  if (!MATERIAL_AUDIO_FAMILIES.has(family)) family = 'masonry';
  const now = audioCtx ? audioCtx.currentTime : 0;
  if (family === 'glass') {
    if (now - lastGlassAudioAt < GLASS_COOLDOWN_SECONDS || activeClipCount('material_glass_') >= MAX_GLASS_VOICES) {
      recordAudioEvent({ clip: 'material_glass_*', trigger: options.trigger || 'material:glass', gain: options.gain ?? 0.70, pan: panFromWorldX(x), bus: 'effects', status: 'glass-throttled' });
      return null;
    }
    lastGlassAudioAt = now;
  }
  const variant = Math.random() < 0.5 ? 1 : 2;
  const distanceGain = distanceGainFromWorld(x, z, options.maxDistance ?? 145);
  return playStormClip('material_' + family + '_' + variant, {
    gain: (options.gain ?? 0.70) * THREE.MathUtils.clamp(intensity, 0.35, 1.4) * distanceGain,
    pan: panFromWorldX(x),
    priority: options.priority ?? 2,
    playbackRate: 0.93 + Math.random() * 0.14,
    bus: 'effects',
    trigger: options.trigger || ('material:' + family)
  });
}

function playAbilitySound(type) {`,
  'glass concurrency and material tracing'
);

replaceBetween(
  'function playAbilitySound(type) {',
  'function playSound(type) {',
  String.raw`function playAbilitySound(type) {
  if (type === 'zap') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.zap), { gain: 0.82, priority: 6, trigger: 'ability:grid-zap' });
    setTimeout(() => playStormClip(chooseAudioVariant(['grid_crackle_1', 'grid_crackle_2']), { gain: 0.66, priority: 5, trigger: 'ability:grid-zap-tail' }), 70);
    setTimeout(() => playStormClip('thunder_tail_1', { gain: 0.56, priority: 5, playbackRate: 0.92 + Math.random() * 0.08, trigger: 'ability:grid-zap-thunder' }), 230);
  } else if (type === 'gust') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.gust), { gain: 0.86, priority: 6, playbackRate: 0.97 + Math.random() * 0.07, trigger: 'ability:gust' });
    setTimeout(() => playMaterialSound('tree', storm.pos.x + 8, storm.pos.z, 0.55, { gain: 0.40, priority: 3, trigger: 'ability:gust-tree' }), 150);
    setTimeout(() => playMaterialSound('metal', storm.pos.x - 10, storm.pos.z, 0.48, { gain: 0.34, priority: 3, trigger: 'ability:gust-metal' }), 250);
  } else if (type === 'pull') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.pull), { gain: 0.88, priority: 6, playbackRate: 0.96 + Math.random() * 0.06, trigger: 'ability:pull' });
    setTimeout(() => playMaterialSound('roof', storm.pos.x + 6, storm.pos.z, 0.45, { gain: 0.35, priority: 3, trigger: 'ability:pull-roof' }), 260);
  }
}

function playSound(type) {`,
  'ability trigger tracing'
);

replaceBetween(
  'function playSound(type) {',
  'function stopAllStormAudio() {',
  String.raw`function playSound(type) {
  if (!audioCtx || isBotMode || isAudioMuted) return;
  if (!stormAudioReady) {
    loadStormAudioAssets();
    return;
  }
  if (type === 'easAlert') {
    headlineDuckTimer = Math.max(headlineDuckTimer, 0.9);
    const now = audioCtx.currentTime;
    [853, 960].forEach(freq => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain); gain.connect(newsGain);
      osc.start(now); osc.stop(now + 0.5);
    });
    recordAudioEvent({ clip: 'eas_dual_tone', trigger: 'news:eas-alert', gain: 0.10, pan: 0, bus: 'news', status: 'played' });
    return;
  }
  if (type === 'zap' || type === 'gust' || type === 'pull') {
    playAbilitySound(type);
    return;
  }
  const variants = AUDIO_VARIANTS[type] || AUDIO_VARIANTS.explode;
  playStormClip(chooseAudioVariant(variants), {
    gain: type === 'click' ? 0.42 : (type === 'siren' ? 0.48 : 0.68),
    priority: type === 'click' ? 4 : 2,
    bus: type === 'siren' ? 'news' : 'effects',
    trigger: 'legacy:' + type
  });
}

function stopAllStormAudio() {`,
  'news bus and legacy trigger tracing'
);

replaceBetween(
  'function targetMaterialFamily(target) {',
  'function destroyTarget(target, source = \'storm\') {',
  String.raw`// ============================================================================
// [SW:AUDIO:MATERIAL_ROUTING]
// Purpose: Route destruction only to materials supported by target evidence.
// Invariants:
// - Commercial does not automatically mean glass.
// - Glass requires an explicit window or glass-bearing target marker.
// ============================================================================
function targetMaterialFamily(target) {
  if (!target) return 'masonry';
  if (target.isTree) return 'tree';
  const explicit = String(target.audioMaterial || target.materialFamily || target.kind || target.type || '').toLowerCase();
  if (target.hasGlass === true || target.isGlass === true || explicit.includes('glass') || explicit.includes('window')) return 'glass';
  if (explicit.includes('wood') || explicit.includes('barn')) return 'wood';
  if (explicit.includes('roof')) return 'roof';
  if (explicit.includes('metal') || explicit.includes('silo') || explicit.includes('utility')) return explicit.includes('utility') ? 'utility' : 'metal';
  if (explicit.includes('vehicle') || explicit.includes('car') || explicit.includes('truck')) return 'vehicle';
  if (explicit.includes('carnival') || explicit.includes('ferris') || explicit.includes('carousel')) return 'carnival';
  if (explicit.includes('concrete')) return 'concrete';
  const color = String(target.color || target.meshData?.color || '').toLowerCase();
  if (color.includes('78350f') || color.includes('92400e') || color.includes('d97706')) return 'wood';
  if (color.includes('94a3b8') || color.includes('64748b') || color.includes('0f172a')) return 'metal';
  if (color.includes('f8fafc') || color.includes('cbd5e1') || color.includes('e2e8f0')) return 'concrete';
  return 'masonry';
}
// [SW:AUDIO:MATERIAL_ROUTING:END]

function destroyTarget(target, source = 'storm') {`,
  'strict material classifier'
);

replaceUnique(
  "  playSound('click');\n  playSound('glass');",
  "  playSound('click');",
  'pickup glass removal'
);

replaceBetween(
  'function rampageTierFromCombo() {',
  'function projectRampagePoint(x, y, z) {',
  String.raw`function rampageTierFromCombo() {
  if (comboMultiplier >= 3.5) return 3;
  if (comboMultiplier >= 2.8) return 2;
  if (comboMultiplier >= 2.2) return 1;
  return 0;
}

function projectRampagePoint(x, y, z) {`,
  'QA rampage thresholds'
);

replaceBetween(
  'function projectRampagePoint(x, y, z) {',
  'function rampageLabelForScore(text, color) {',
  String.raw`function projectRampagePoint(x, y, z) {
  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const point = new THREE.Vector3(x, y, z).project(camera);
  const onCamera = Number.isFinite(point.x) && Number.isFinite(point.y) && point.z >= -1 && point.z <= 1;
  let rawX = onCamera ? (point.x * 0.5 + 0.5) * width : width * 0.5;
  let rawY = onCamera ? (-point.y * 0.5 + 0.5) * height : height * 0.46;
  if (storm && storm.pos) {
    const stormPoint = new THREE.Vector3(storm.pos.x, terrainHeightAt(storm.pos.x, storm.pos.z) + 8, storm.pos.z).project(camera);
    const stormX = (stormPoint.x * 0.5 + 0.5) * width;
    const stormY = (-stormPoint.y * 0.5 + 0.5) * height;
    if (Math.hypot(rawX - stormX, rawY - stormY) < 105) rawY -= 92;
  }
  const marginX = Math.max(104, width * 0.19);
  const topMargin = Math.max(92, height * 0.21);
  const bottomMargin = Math.max(108, height * 0.25);
  rawX = THREE.MathUtils.clamp(rawX, marginX, width - marginX);
  rawY = THREE.MathUtils.clamp(rawY, topMargin, height - bottomMargin);
  return { x: rawX, y: rawY };
}

function rampageLabelForScore(text, color) {`,
  'popup safe-area projection'
);

replaceBetween(
  'function spawnRampageHudPopup(x, y, z, text, color) {',
  'function spawnScorePopup(x, y, z, text, color = \'#fbbf24\') {',
  String.raw`// ============================================================================
// [SW:UI:RAMPAGE_FEEDBACK]
// Purpose: Aggregate simultaneous damage and cap local callouts for readability.
// Invariants:
// - One major banner at a time.
// - No more than three local callouts.
// ============================================================================
let pendingRampageHits = [];
let rampagePopupFlushTimer = 0;

function renderRampageHudPopup(x, y, z, message, color) {
  const layer = getCachedEl('rampageFeedbackLayer');
  if (!layer) return;
  const existing = layer.querySelectorAll('.rampage-popup');
  if (existing.length >= 3) existing[0].remove();
  const position = projectRampagePoint(x, y, z);
  const popup = document.createElement('div');
  popup.className = 'rampage-popup';
  popup.style.left = position.x + 'px';
  popup.style.top = position.y + 'px';
  popup.style.setProperty('--rampage-color', color);

  const word = document.createElement('span');
  word.className = 'rampage-word';
  word.textContent = message.label;
  popup.appendChild(word);

  if (message.score) {
    const score = document.createElement('span');
    score.className = 'rampage-score';
    score.textContent = message.score;
    popup.appendChild(score);
  }
  if (comboMultiplier > 1.05) {
    const combo = document.createElement('span');
    combo.className = 'rampage-combo';
    combo.textContent = comboMultiplier.toFixed(1) + 'x';
    popup.appendChild(combo);
  }

  layer.appendChild(popup);
  setTimeout(() => popup.remove(), 1020);
}

function flushRampageHudPopups() {
  rampagePopupFlushTimer = 0;
  const hits = pendingRampageHits.splice(0);
  if (hits.length === 0) return;
  const primary = hits.reduce((best, hit) => hit.amount > best.amount ? hit : best, hits[0]);
  if (hits.length === 1) {
    renderRampageHudPopup(primary.x, primary.y, primary.z, rampageLabelForScore(primary.text, primary.color), primary.color);
    return;
  }
  const total = hits.reduce((sum, hit) => sum + hit.amount, 0);
  const average = hits.reduce((point, hit) => ({ x: point.x + hit.x, y: point.y + hit.y, z: point.z + hit.z }), { x: 0, y: 0, z: 0 });
  renderRampageHudPopup(
    average.x / hits.length,
    average.y / hits.length,
    average.z / hits.length,
    { label: 'CHAIN REACTION x' + hits.length, score: total > 0 ? '+' + total : '' },
    primary.color
  );
}

function spawnRampageHudPopup(x, y, z, text, color) {
  const match = /^\+(\d+)/.exec(String(text));
  pendingRampageHits.push({ x, y, z, text, color, amount: match ? Number(match[1]) : 0 });
  if (!rampagePopupFlushTimer) rampagePopupFlushTimer = window.setTimeout(flushRampageHudPopups, 90);
}

function spawnScorePopup(x, y, z, text, color = '#fbbf24') {`,
  'popup aggregation and cap'
);

replaceUnique(
  String.raw`function clearRampageFeedback() {
  const layer = getCachedEl('rampageFeedbackLayer');
  if (layer) layer.replaceChildren();
  rampageFeedbackTier = 0;
}`,
  String.raw`function clearRampageFeedback() {
  const layer = getCachedEl('rampageFeedbackLayer');
  if (layer) layer.replaceChildren();
  if (rampagePopupFlushTimer) window.clearTimeout(rampagePopupFlushTimer);
  rampagePopupFlushTimer = 0;
  pendingRampageHits = [];
  rampageFeedbackTier = 0;
}
// [SW:UI:RAMPAGE_FEEDBACK:END]`,
  'popup cleanup'
);

replaceUnique(
  String.raw`let runTimeRemaining = 180;
let runActive = true;
let runSuspendedByVisibility = false;`,
  String.raw`let runTimeRemaining = 180;
let runActive = true;
let runSuspendedByVisibility = false;
let maxStage3Elapsed = 0;

function stage3ElapsedSeconds() {
  if (currentStage === 3) maxStage3Elapsed = Math.max(maxStage3Elapsed, Math.max(0, 60 - runTimeRemaining));
  return maxStage3Elapsed;
}`,
  'monotonic stage three clock'
);

replaceUnique(
  String.raw`function resetWarningRun() {
  resetStormAudioState();
  runTimeRemaining = 180;`,
  String.raw`function resetWarningRun() {
  resetStormAudioState();
  runTimeRemaining = 180;
  maxStage3Elapsed = 0;`,
  'stage three clock reset'
);

replaceAllRequired(
  'const stage3Elapsed = Math.max(0, 60 - runTimeRemaining);',
  'const stage3Elapsed = stage3ElapsedSeconds();',
  'stage three monotonic elapsed usage'
);

replaceUnique(
  String.raw`  // Run Timer & Stage Transitions
  if (runActive) {`,
  String.raw`  // ============================================================================
  // [SW:GAMEPLAY:DISTRICT_PROGRESSION]
  // [SW:LAW:DISTRICTS-FORWARD-ONLY]
  // Time pickups may increase the timer, but completed districts never replay.
  // ============================================================================
  // Run Timer & Stage Transitions
  if (runActive) {`,
  'district progression anchor'
);

replaceUnique(
  String.raw`    if (runTimeRemaining > 120) {
      if (currentStage !== 1) {`,
  String.raw`    const timeStage = runTimeRemaining > 120 ? 1 : (runTimeRemaining > 60 ? 2 : 3);
    const nextStage = Math.max(currentStage, timeStage);
    if (nextStage === 1) {
      if (currentStage !== 1) {`,
  'forward-only district target'
);

replaceUnique(
  '} else if (runTimeRemaining > 60) {',
  '} else if (nextStage === 2) {',
  'stage two monotonic branch'
);

replaceUnique(
  String.raw`  if (mediaHeadlineTimer > 0) {`,
  String.raw`  // [SW:GAMEPLAY:DISTRICT_PROGRESSION:END]

  if (mediaHeadlineTimer > 0) {`,
  'district progression end anchor'
);

const requiredMarkers = [
  '[SW:AUDIO:EVENT_LOG]',
  '[SW:AUDIO:QA_PANEL]',
  'decodedClipEnergy',
  'glass-throttled',
  'AUDIO_BUS_BASE_GAINS',
  'CHAIN REACTION x',
  'comboMultiplier >= 3.5',
  '[SW:LAW:DISTRICTS-FORWARD-ONLY]',
  'const nextStage = Math.max(currentStage, timeStage)',
  'stage3ElapsedSeconds'
];
for (const marker of requiredMarkers) {
  if (!html.includes(marker)) throw new Error(`Missing QA correction marker: ${marker}`);
}
if (html.includes("playSound('click');\n  playSound('glass');")) throw new Error('Pickup glass routing still present.');

await writeFile(sourcePath, html, 'utf8');
console.log('Applied Audio Lab and QA corrections patch.');
