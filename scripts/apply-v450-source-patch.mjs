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
  '<title>Severe Weather 3D Lab v4.4.2 - Pull Feedback</title>',
  '<title>Severe Weather 3D Lab v4.5.0 - Storm Feel Overhaul</title>',
  'document title'
);
replaceExact(
  '3D LAB v4.4.2 PULL FEEDBACK',
  '3D LAB v4.5.0 STORM FEEL',
  'NOAA build badge'
);
replaceExact(
  'ARCADE DISASTER SIMULATOR v4.4.2 PULL FEEDBACK',
  'ARCADE DISASTER SIMULATOR v4.5.0 STORM FEEL',
  'main menu build label'
);

const oldAudioBlockStart = '// --- WEB AUDIO API SYNTHESIZER ---';
const oldAudioBlockEnd = '// --- MAIN MENU & PAUSE CONTROLS ---';
const audioStart = html.indexOf(oldAudioBlockStart);
const audioEnd = html.indexOf(oldAudioBlockEnd);
if (audioStart < 0 || audioEnd < 0 || audioEnd <= audioStart) {
  throw new Error('Unable to locate legacy audio system block.');
}

const newAudioBlock = `// --- v4.5.0 STORM FEEL AUDIO ENGINE ---
let audioCtx = null;
let isAudioMuted = false;
let stormAudioReady = false;
let stormAudioLoadPromise = null;
let stormAudioBuffer = null;
let stormAudioManifest = null;
let masterGain = null;
let ambienceGain = null;
let effectsGain = null;
let newsDuckingGain = null;
let activeAudioVoices = [];
let ambientAudioLoops = new Map();
let ambientTargetState = { moving: false, efMultiplier: 1, pullActive: false };
let headlineDuckTimer = 0;
const MAX_AUDIO_VOICES = 18;
const AUDIO_VARIANTS = {
  click: ['click_1'],
  glass: ['material_glass_1', 'material_glass_2'],
  shatter: ['material_wood_1', 'material_masonry_1', 'material_glass_1'],
  explode: ['material_masonry_1', 'material_concrete_1', 'material_metal_1'],
  zap: ['grid_snap_1', 'grid_snap_2'],
  gust: ['gust_surge_1', 'gust_surge_2'],
  pull: ['pull_rise_1', 'pull_rise_2'],
  hail: ['hail_1', 'hail_2'],
  splash: ['splash_1', 'splash_2'],
  siren: ['siren_1'],
  moo: ['moo_1']
};
const MATERIAL_AUDIO_FAMILIES = new Set(['wood', 'metal', 'glass', 'masonry', 'concrete', 'utility', 'vehicle', 'carnival', 'tree', 'roof']);

function initAudioGraph() {
  if (!audioCtx || masterGain) return;
  masterGain = audioCtx.createGain();
  ambienceGain = audioCtx.createGain();
  effectsGain = audioCtx.createGain();
  newsDuckingGain = audioCtx.createGain();
  masterGain.gain.value = isAudioMuted ? 0 : 0.92;
  ambienceGain.gain.value = 0.72;
  effectsGain.gain.value = 0.92;
  newsDuckingGain.gain.value = 1;
  ambienceGain.connect(newsDuckingGain);
  effectsGain.connect(newsDuckingGain);
  newsDuckingGain.connect(masterGain);
  masterGain.connect(audioCtx.destination);
}

async function loadStormAudioAssets() {
  if (!audioCtx || stormAudioReady) return stormAudioReady;
  if (stormAudioLoadPromise) return stormAudioLoadPromise;
  stormAudioLoadPromise = (async () => {
    const [manifestResponse, spriteResponse] = await Promise.all([
      fetch('audio/storm-feel-manifest.json'),
      fetch('audio/storm-feel-sprite.wav')
    ]);
    if (!manifestResponse.ok || !spriteResponse.ok) throw new Error('Storm audio assets unavailable.');
    stormAudioManifest = await manifestResponse.json();
    stormAudioBuffer = await audioCtx.decodeAudioData(await spriteResponse.arrayBuffer());
    stormAudioReady = true;
    ensureAmbientLoops();
    return true;
  })().catch(error => {
    console.warn('Storm audio could not be loaded:', error);
    stormAudioReady = false;
    return false;
  });
  return stormAudioLoadPromise;
}

function initAudio() {
  if (!audioCtx && !isBotMode) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    initAudioGraph();
    loadStormAudioAssets();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function setMasterAudioEnabled(enabled) {
  if (!audioCtx || !masterGain) return;
  const now = audioCtx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setTargetAtTime(enabled ? 0.92 : 0, now, 0.035);
}

function toggleAudioMute() {
  isAudioMuted = !isAudioMuted;
  const menuBtn = getCachedEl('btnToggleAudioMenu');
  const pauseBtn = getCachedEl('btnPauseAudio');
  const label = isAudioMuted ? 'AUDIO: OFF 🔇' : 'AUDIO: ON 🔊';
  if (menuBtn) menuBtn.innerText = label;
  if (pauseBtn) pauseBtn.innerText = label;
  setMasterAudioEnabled(!isAudioMuted);
}

function cleanAudioVoices() {
  const now = audioCtx ? audioCtx.currentTime : 0;
  activeAudioVoices = activeAudioVoices.filter(voice => voice.endTime > now && !voice.ended);
}

function stopAudioVoice(voice, fadeSeconds = 0.025) {
  if (!voice || voice.ended) return;
  voice.ended = true;
  if (audioCtx && voice.gainNode) {
    const now = audioCtx.currentTime;
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setTargetAtTime(0.0001, now, Math.max(0.005, fadeSeconds));
  }
  try { voice.source.stop((audioCtx ? audioCtx.currentTime : 0) + fadeSeconds * 4); } catch (error) {}
}

function enforceAudioVoiceLimit(priority = 1) {
  cleanAudioVoices();
  if (activeAudioVoices.length < MAX_AUDIO_VOICES) return true;
  const disposable = activeAudioVoices
    .filter(voice => !voice.loop && voice.priority <= priority)
    .sort((a, b) => a.priority - b.priority || a.startedAt - b.startedAt)[0];
  if (!disposable) return false;
  stopAudioVoice(disposable);
  cleanAudioVoices();
  return true;
}

function getClipDefinition(name) {
  return stormAudioManifest && stormAudioManifest.clips ? stormAudioManifest.clips[name] : null;
}

function chooseAudioVariant(names) {
  if (!names || names.length === 0) return null;
  return names[Math.floor(Math.random() * names.length)];
}

function playStormClip(name, options = {}) {
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || isAudioMuted || isBotMode) return null;
  const clip = getClipDefinition(name);
  if (!clip) return null;
  const priority = options.priority ?? 1;
  if (!enforceAudioVoiceLimit(priority)) return null;

  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  const panNode = typeof audioCtx.createStereoPanner === 'function' ? audioCtx.createStereoPanner() : null;
  source.buffer = stormAudioBuffer;
  source.playbackRate.value = options.playbackRate ?? (0.94 + Math.random() * 0.12);
  gainNode.gain.value = Math.max(0.0001, options.gain ?? 0.65);
  if (panNode) panNode.pan.value = THREE.MathUtils.clamp(options.pan ?? 0, -0.85, 0.85);
  source.connect(gainNode);
  if (panNode) {
    gainNode.connect(panNode);
    panNode.connect(options.bus === 'ambience' ? ambienceGain : effectsGain);
  } else {
    gainNode.connect(options.bus === 'ambience' ? ambienceGain : effectsGain);
  }
  const voice = {
    source, gainNode, panNode, priority,
    startedAt: now,
    endTime: now + clip.duration / Math.max(0.01, source.playbackRate.value),
    loop: Boolean(options.loop),
    ended: false
  };
  source.onended = () => { voice.ended = true; };
  activeAudioVoices.push(voice);
  source.start(now, clip.offset, clip.duration);
  return voice;
}

function playStormLoop(name, initialGain = 0) {
  if (!audioCtx || !stormAudioReady || !stormAudioBuffer || ambientAudioLoops.has(name)) return ambientAudioLoops.get(name) || null;
  const clip = getClipDefinition(name);
  if (!clip) return null;
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();
  source.buffer = stormAudioBuffer;
  source.loop = true;
  source.loopStart = clip.offset;
  source.loopEnd = clip.offset + clip.duration;
  gainNode.gain.value = initialGain;
  source.connect(gainNode);
  gainNode.connect(ambienceGain);
  source.start(audioCtx.currentTime, clip.offset);
  const voice = { source, gainNode, priority: 9, startedAt: audioCtx.currentTime, endTime: Infinity, loop: true, ended: false };
  ambientAudioLoops.set(name, voice);
  activeAudioVoices.push(voice);
  return voice;
}

function ensureAmbientLoops() {
  if (!stormAudioReady || !audioCtx) return;
  ['loop_wind_low', 'loop_wind_close', 'loop_rumble', 'loop_grit', 'loop_pull_suction'].forEach(name => playStormLoop(name, 0));
}

function setAmbientLoopGain(name, value, timeConstant = 0.12) {
  const voice = ambientAudioLoops.get(name);
  if (!voice || !audioCtx) return;
  const now = audioCtx.currentTime;
  voice.gainNode.gain.cancelScheduledValues(now);
  voice.gainNode.gain.setTargetAtTime(Math.max(0.0001, value), now, timeConstant);
}

function updateStormSoundscape(speed, efMultiplier) {
  if (!audioCtx || isBotMode) return;
  ensureAmbientLoops();
  const audible = runActive && !isPaused && !document.hidden && !isAudioMuted;
  const moving = audible && speed > 1;
  const intensity = audible ? THREE.MathUtils.clamp((efMultiplier - 0.75) / 1.35, 0, 1) : 0;
  const speedFactor = moving ? THREE.MathUtils.clamp(speed / 54, 0, 1) : 0;
  const pullActive = audible && currentStorm === 'tornado' && activePullVortex;
  ambientTargetState = { moving, efMultiplier, pullActive };

  setAmbientLoopGain('loop_wind_low', audible ? 0.16 + intensity * 0.11 : 0);
  setAmbientLoopGain('loop_wind_close', moving ? 0.08 + speedFactor * 0.15 + intensity * 0.05 : 0.02 * intensity);
  setAmbientLoopGain('loop_rumble', audible ? 0.08 + intensity * 0.16 : 0);
  setAmbientLoopGain('loop_grit', moving ? 0.025 + speedFactor * 0.075 : 0);
  setAmbientLoopGain('loop_pull_suction', pullActive ? 0.19 + intensity * 0.08 : 0);
  setMasterAudioEnabled(audible || (!runActive && !isAudioMuted));

  if (headlineDuckTimer > 0) headlineDuckTimer = Math.max(0, headlineDuckTimer - 1 / 60);
  const duckTarget = headlineDuckTimer > 0 ? 0.46 : 1;
  const now = audioCtx.currentTime;
  newsDuckingGain.gain.setTargetAtTime(duckTarget, now, headlineDuckTimer > 0 ? 0.045 : 0.18);
}

function panFromWorldX(x) {
  if (!Number.isFinite(x) || !storm || !storm.pos) return 0;
  return THREE.MathUtils.clamp((x - storm.pos.x) / 85, -0.8, 0.8);
}

function distanceGainFromWorld(x, z, maxDistance = 130) {
  if (!Number.isFinite(x) || !Number.isFinite(z) || !storm || !storm.pos) return 1;
  const distance = Math.hypot(x - storm.pos.x, z - storm.pos.z);
  const normalized = 1 - Math.min(1, distance / maxDistance);
  return 0.22 + normalized * normalized * 0.78;
}

function playMaterialSound(family, x = storm.pos.x, z = storm.pos.z, intensity = 1, options = {}) {
  if (!MATERIAL_AUDIO_FAMILIES.has(family)) family = 'masonry';
  const variant = Math.random() < 0.5 ? 1 : 2;
  const distanceGain = distanceGainFromWorld(x, z, options.maxDistance ?? 145);
  return playStormClip('material_' + family + '_' + variant, {
    gain: (options.gain ?? 0.70) * THREE.MathUtils.clamp(intensity, 0.35, 1.4) * distanceGain,
    pan: panFromWorldX(x),
    priority: options.priority ?? 2,
    playbackRate: 0.93 + Math.random() * 0.14
  });
}

function playAbilitySound(type) {
  if (type === 'zap') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.zap), { gain: 0.82, priority: 6 });
    setTimeout(() => playStormClip(chooseAudioVariant(['grid_crackle_1', 'grid_crackle_2']), { gain: 0.66, priority: 5 }), 70);
    setTimeout(() => playStormClip('thunder_tail_1', { gain: 0.56, priority: 5, playbackRate: 0.92 + Math.random() * 0.08 }), 230);
  } else if (type === 'gust') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.gust), { gain: 0.86, priority: 6, playbackRate: 0.97 + Math.random() * 0.07 });
    setTimeout(() => playMaterialSound('tree', storm.pos.x + 8, storm.pos.z, 0.55, { gain: 0.40, priority: 3 }), 150);
    setTimeout(() => playMaterialSound('metal', storm.pos.x - 10, storm.pos.z, 0.48, { gain: 0.34, priority: 3 }), 250);
  } else if (type === 'pull') {
    playStormClip(chooseAudioVariant(AUDIO_VARIANTS.pull), { gain: 0.88, priority: 6, playbackRate: 0.96 + Math.random() * 0.06 });
    setTimeout(() => playMaterialSound('roof', storm.pos.x + 6, storm.pos.z, 0.45, { gain: 0.35, priority: 3 }), 260);
  }
}

function playSound(type) {
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
      osc.connect(gain); gain.connect(effectsGain);
      osc.start(now); osc.stop(now + 0.5);
    });
    return;
  }
  if (type === 'zap' || type === 'gust' || type === 'pull') {
    playAbilitySound(type);
    return;
  }
  const variants = AUDIO_VARIANTS[type] || AUDIO_VARIANTS.explode;
  playStormClip(chooseAudioVariant(variants), {
    gain: type === 'click' ? 0.42 : (type === 'siren' ? 0.48 : 0.68),
    priority: type === 'click' ? 4 : 2
  });
}

function stopAllStormAudio() {
  for (const voice of activeAudioVoices) stopAudioVoice(voice, 0.04);
  activeAudioVoices = [];
  ambientAudioLoops.clear();
}

function resetStormAudioState() {
  headlineDuckTimer = 0;
  if (!audioCtx) return;
  cleanAudioVoices();
  const now = audioCtx.currentTime;
  if (newsDuckingGain) newsDuckingGain.gain.setTargetAtTime(1, now, 0.04);
  ensureAmbientLoops();
}

document.addEventListener('visibilitychange', () => {
  if (!audioCtx) return;
  if (document.hidden) setMasterAudioEnabled(false);
  else if (!isAudioMuted) {
    audioCtx.resume();
    setMasterAudioEnabled(true);
  }
});

// --- MAIN MENU & PAUSE CONTROLS ---`;

html = html.slice(0, audioStart) + newAudioBlock + html.slice(audioEnd + oldAudioBlockEnd.length);

replaceExact(
  '  mediaHeadlineText = text;\n  mediaHeadlineTimer = duration;\n  setUI(\'easTicker\', `LIVE CAMERA: ${text}`);',
  '  mediaHeadlineText = text;\n  mediaHeadlineTimer = duration;\n  headlineDuckTimer = Math.max(headlineDuckTimer, duration);\n  setUI(\'easTicker\', `LIVE CAMERA: ${text}`);',
  'news ducking hook'
);

replaceExact(
  '  // DYNAMIC AUDIO RUMBLE SOUNDSCAPE MODULATION\n  updateWindRumble(isMoving ? storm.speed : 0, efMultiplier);',
  '  // v4.5.0 LAYERED STORM SOUNDSCAPE MODULATION\n  updateStormSoundscape(isMoving ? storm.speed : 0, efMultiplier);',
  'storm ambience update hook'
);

replaceExact(
  `    if (slot === 'primary') { // PULL VORTEX
      activePullVortex = true;
      pullVortexTimer = 2.5;
      playSound('gust');`,
  `    if (slot === 'primary') { // PULL VORTEX
      activePullVortex = true;
      pullVortexTimer = 2.5;
      playSound('pull');`,
  'Pull ability sound identity'
);

replaceExact(
  `function destroyTarget(target, source = 'storm') {
  if (!target || target.destroyed) return;`,
  `function targetMaterialFamily(target) {
  if (!target) return 'masonry';
  if (target.isTree) return 'tree';
  if (target.isCommercial) return 'glass';
  const color = String(target.color || target.meshData?.color || '').toLowerCase();
  if (color.includes('78350f') || color.includes('92400e') || color.includes('d97706')) return 'wood';
  if (color.includes('94a3b8') || color.includes('64748b') || color.includes('0f172a')) return 'metal';
  if (color.includes('f8fafc') || color.includes('cbd5e1') || color.includes('e2e8f0')) return 'concrete';
  return target.isCommercial ? 'glass' : 'masonry';
}

function destroyTarget(target, source = 'storm') {
  if (!target || target.destroyed) return;`,
  'target material classifier'
);

replaceExact(
  `  const awarded = addScore(pts);
  if (awarded > 0) spawnScorePopup(target.x, terrainHeightAt(target.x, target.z) + 6, target.z, \`+\${awarded}\`, target.isTree ? '#22c55e' : '#fbbf24');
  explodeStructure(target.x, target.z, target.color, false, false, target.meshData.footprint || 5);`,
  `  const awarded = addScore(pts);
  if (awarded > 0) spawnScorePopup(target.x, terrainHeightAt(target.x, target.z) + 6, target.z, \`+\${awarded}\`, target.isTree ? '#22c55e' : '#fbbf24');
  playMaterialSound(targetMaterialFamily(target), target.x, target.z, target.isCommercial ? 1.05 : 0.82, { priority: target.isCommercial ? 4 : 3 });
  explodeStructure(target.x, target.z, target.color, false, false, target.meshData.footprint || 5);`,
  'target destruction material audio'
);

replaceExact(
  `  if (nextStage === 1) {
    // STAGE 1: Roof flies off, building leans, darkens`,
  `  if (nextStage === 1) {
    playMaterialSound(target.isTree ? 'tree' : 'roof', target.x, target.z, 0.52, { gain: 0.46, priority: 2 });
    // STAGE 1: Roof flies off, building leans, darkens`,
  'stage one material audio'
);

replaceExact(
  `  } else if (nextStage === 2) {
    // STAGE 2: Upper walls crumble away, heavy lean, near-collapse`,
  `  } else if (nextStage === 2) {
    playMaterialSound(targetMaterialFamily(target), target.x, target.z, 0.72, { gain: 0.55, priority: 3 });
    // STAGE 2: Upper walls crumble away, heavy lean, near-collapse`,
  'stage two material audio'
);

replaceExact(
  `function explodeStructure(x, z, color, isWaterTower = false, isGrainSilo = false, footprint = 5) {
  if (isWaterTower) playSound('splash');
  else playSound('explode');`,
  `function explodeStructure(x, z, color, isWaterTower = false, isGrainSilo = false, footprint = 5) {
  if (isWaterTower) playSound('splash');
  else if (isGrainSilo) playMaterialSound('metal', x, z, 1.15, { gain: 0.76, priority: 5 });
  else playMaterialSound(footprint >= 8 ? 'concrete' : 'masonry', x, z, footprint >= 8 ? 1.2 : 0.92, { gain: footprint >= 8 ? 0.82 : 0.66, priority: footprint >= 8 ? 5 : 3 });`,
  'structure destruction material audio'
);

replaceExact(
  `  playSound(prop.kind === 'foodcart' ? 'splash' : 'explode');`,
  `  if (prop.kind === 'foodcart') playSound('splash');
  else playMaterialSound(['ferris', 'carousel', 'carts', 'corndog'].includes(prop.kind) ? 'carnival' : 'metal', prop.x, prop.z, prop.stage === 3 ? 1.05 : 0.75, { priority: 4 });`,
  'comedy prop material audio'
);

replaceExact(
  `  gameStarted = true;
  isPaused = false;
  resetWarningRun();`,
  `  gameStarted = true;
  isPaused = false;
  resetStormAudioState();
  resetWarningRun();`,
  'start run audio reset'
);

replaceExact(
  `function resetWarningRun() {
  runTimeRemaining = 180;`,
  `function resetWarningRun() {
  resetStormAudioState();
  runTimeRemaining = 180;`,
  'retry audio reset'
);

if (!html.includes('v4.5.0') || html.includes('v4.4.2') || html.includes('v4.4.1')) {
  throw new Error('Version identity did not fully advance to v4.5.0.');
}
for (const marker of ['updateStormSoundscape', 'playMaterialSound', 'MAX_AUDIO_VOICES', 'storm-feel-sprite.wav', 'headlineDuckTimer', 'targetMaterialFamily']) {
  if (!html.includes(marker)) throw new Error(`Missing v4.5.0 audio marker: ${marker}`);
}

await writeFile(sourcePath, html, 'utf8');
console.log('Applied v4.5.0 Storm Feel Overhaul source patch.');
